from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Protocol, Tuple

from azure_search_retriever import (
    RetrievedChunk,
    build_vector_search_payload,
    normalize_azure_search_results,
)
from search_chunks import search_chunks
from vector_search_demo import vector_search


class Retriever(Protocol):
    name: str

    def retrieve(self, question: str, top_k: int) -> List[RetrievedChunk]:
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
        source_type=str(chunk.get("source_type", "")),
        heading=str(chunk.get("heading", "")),
        published_at=chunk.get("published_at"),
    )


def to_scored_context_items(results: List[RetrievedChunk]) -> List[Tuple[float, Dict]]:
    return [(result.score, result.to_context_item()) for result in results]


@dataclass
class LocalKeywordRetriever:
    name: str = "local-keyword"

    def retrieve(self, question: str, top_k: int) -> List[RetrievedChunk]:
        return [result_tuple_to_retrieved_chunk(score, chunk) for score, chunk in search_chunks(question, top_k)]


@dataclass
class LocalVectorRetriever:
    name: str = "local-vector"

    def retrieve(self, question: str, top_k: int) -> List[RetrievedChunk]:
        return [result_tuple_to_retrieved_chunk(score, chunk) for score, chunk in vector_search(question, top_k)]


SearchClient = Callable[[Dict], Dict]
QueryVectorProvider = Callable[[str], List[float]]


@dataclass
class AzureSearchRetrieverContract:
    query_vector_provider: QueryVectorProvider
    search_client: Optional[SearchClient] = None
    vector_field: str = "content_vector"
    filter_expression: Optional[str] = None
    name: str = "azure-search-contract"

    def retrieve(self, question: str, top_k: int) -> List[RetrievedChunk]:
        if self.search_client is None:
            raise RetrieverUnavailableError(
                "AzureSearchRetrieverContract needs a search_client before it can retrieve. "
                "This local Day24 contract does not call Azure."
            )

        query_vector = self.query_vector_provider(question)
        payload = build_vector_search_payload(
            query_vector=query_vector,
            top_k=top_k,
            vector_field=self.vector_field,
            filter_expression=self.filter_expression,
        )
        response = self.search_client(payload)
        return normalize_azure_search_results(response)


def create_local_retriever(mode: str) -> Retriever:
    if mode == "keyword":
        return LocalKeywordRetriever()
    if mode == "vector":
        return LocalVectorRetriever()
    raise ValueError(f"Unknown local retriever mode: {mode}")
