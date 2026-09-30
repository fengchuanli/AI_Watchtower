from dataclasses import dataclass
from typing import Callable, Dict, Iterable, List, Optional, Protocol, Tuple

from azure_search_retriever import (
    RetrievedChunk,
    build_vector_search_payload,
    normalize_azure_search_results,
)
from search_chunks import search_chunks
from source_filters import (
    build_source_type_filter,
    combine_filter_expressions,
    expand_query_for_source_types,
    infer_source_type,
)
from vector_search_demo import vector_search


class Retriever(Protocol):
    name: str

    def retrieve(
        self,
        question: str,
        top_k: int,
        source_types: Optional[Iterable[str]] = None,
    ) -> List[RetrievedChunk]:
        ...


class RetrieverUnavailableError(Exception):
    """Raised when a retriever cannot run in the current local environment."""


def result_tuple_to_retrieved_chunk(score: float, chunk: Dict) -> RetrievedChunk:
    return RetrievedChunk(
        score=float(score),
        id=str(chunk.get("id", "")),
        document_id=str(chunk.get("document_id", "")),
        source=str(chunk.get("source", "")),
        title=str(chunk.get("title", "")),
        chunk_index=int(chunk.get("chunk_index", 0)),
        text=str(chunk.get("text", "")),
        source_type=str(chunk.get("source_type") or infer_source_type(str(chunk.get("source", "")))),
        heading=str(chunk.get("heading", "")),
        published_at=chunk.get("published_at"),
    )


def to_scored_context_items(results: List[RetrievedChunk]) -> List[Tuple[float, Dict]]:
    return [(result.score, result.to_context_item()) for result in results]


@dataclass
class LocalKeywordRetriever:
    name: str = "local-keyword"

    def retrieve(
        self,
        question: str,
        top_k: int,
        source_types: Optional[Iterable[str]] = None,
    ) -> List[RetrievedChunk]:
        return [
            result_tuple_to_retrieved_chunk(score, chunk)
            for score, chunk in search_chunks(question, top_k, source_types)
        ]


@dataclass
class LocalVectorRetriever:
    name: str = "local-vector"

    def retrieve(
        self,
        question: str,
        top_k: int,
        source_types: Optional[Iterable[str]] = None,
    ) -> List[RetrievedChunk]:
        return [
            result_tuple_to_retrieved_chunk(score, chunk)
            for score, chunk in vector_search(question, top_k, source_types)
        ]


SearchClient = Callable[[Dict], Dict]
QueryVectorProvider = Callable[[str], List[float]]


@dataclass
class AzureSearchRetrieverContract:
    query_vector_provider: QueryVectorProvider
    search_client: Optional[SearchClient] = None
    vector_field: str = "content_vector"
    filter_expression: Optional[str] = None
    hybrid: bool = False
    name: str = "azure-search-contract"

    def retrieve(
        self,
        question: str,
        top_k: int,
        source_types: Optional[Iterable[str]] = None,
    ) -> List[RetrievedChunk]:
        if self.search_client is None:
            raise RetrieverUnavailableError(
                "AzureSearchRetrieverContract needs a search_client before it can retrieve. "
                "This local Day24 contract does not call Azure."
            )

        query_vector = self.query_vector_provider(question)
        filter_expression = combine_filter_expressions(
            self.filter_expression,
            build_source_type_filter(source_types),
        )
        payload = build_vector_search_payload(
            query_vector=query_vector,
            top_k=top_k,
            vector_field=self.vector_field,
            filter_expression=filter_expression,
            search_text=expand_query_for_source_types(question, source_types) if self.hybrid else "",
        )
        response = self.search_client(payload)
        return normalize_azure_search_results(response)


def create_azure_retriever(hybrid: bool = False) -> Retriever:
    """Live Azure AI Search retriever (needs AZURE_OPENAI_* and AZURE_SEARCH_* env vars)."""
    import os

    from azure_search_index import SearchConfig, VECTOR_DIMENSIONS, request
    from embedding_providers import AzureOpenAIEmbeddingConfig, AzureOpenAIEmbeddingProvider

    env = dict(os.environ)
    search_config = SearchConfig(env)
    provider = AzureOpenAIEmbeddingProvider(
        AzureOpenAIEmbeddingConfig.from_env(env, expected_dimension=VECTOR_DIMENSIONS)
    )

    def search_client(payload: Dict) -> Dict:
        return request(search_config, "POST", f"/indexes('{search_config.index_name}')/docs/search", payload)

    return AzureSearchRetrieverContract(
        query_vector_provider=provider.embed_text,
        search_client=search_client,
        hybrid=hybrid,
        name="azure-hybrid" if hybrid else "azure-vector",
    )


def create_retriever(name: str) -> Retriever:
    if name in ("keyword", "vector"):
        return create_local_retriever(name)
    if name == "azure-vector":
        return create_azure_retriever(hybrid=False)
    if name == "azure-hybrid":
        return create_azure_retriever(hybrid=True)
    raise ValueError(f"Unknown retriever: {name}")


def create_local_retriever(mode: str) -> Retriever:
    if mode == "keyword":
        return LocalKeywordRetriever()
    if mode == "vector":
        return LocalVectorRetriever()
    raise ValueError(f"Unknown local retriever mode: {mode}")
