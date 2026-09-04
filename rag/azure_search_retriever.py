from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional


DEFAULT_SELECT_FIELDS = [
    "id",
    "document_id",
    "source",
    "title",
    "chunk_index",
    "text",
    "source_type",
    "heading",
    "published_at",
]


@dataclass(frozen=True)
class RetrievedChunk:
    score: float
    id: str
    document_id: str
    source: str
    title: str
    chunk_index: int
    text: str
    source_type: str = ""
    heading: str = ""
    published_at: Optional[str] = None

    def to_context_item(self) -> Dict:
        return {
            "score": self.score,
            "id": self.id,
            "document_id": self.document_id,
            "source": self.source,
            "title": self.title,
            "chunk_index": self.chunk_index,
            "text": self.text,
            "source_type": self.source_type,
            "heading": self.heading,
            "published_at": self.published_at,
        }


def validate_query_vector(vector: Iterable[float]) -> List[float]:
    values = list(vector)
    if not values:
        raise ValueError("query vector must not be empty")
    invalid_indexes = [
        index for index, value in enumerate(values) if isinstance(value, bool) or not isinstance(value, (int, float))
    ]
    if invalid_indexes:
        raise ValueError(f"query vector contains a non-number at index {invalid_indexes[0]}")
    return [float(value) for value in values]


def build_vector_search_payload(
    query_vector: Iterable[float],
    top_k: int = 5,
    vector_field: str = "content_vector",
    search_text: str = "",
    filter_expression: Optional[str] = None,
    exhaustive: bool = True,
) -> Dict:
    if top_k <= 0:
        raise ValueError("top_k must be greater than 0")

    payload = {
        "count": True,
        "search": search_text,
        "select": ",".join(DEFAULT_SELECT_FIELDS),
        "top": top_k,
        "vectorQueries": [
            {
                "kind": "vector",
                "vector": validate_query_vector(query_vector),
                "fields": vector_field,
                "k": top_k,
                "exhaustive": exhaustive,
            }
        ],
    }
    if filter_expression:
        payload["filter"] = filter_expression
    return payload


def normalize_azure_search_results(response: Dict) -> List[RetrievedChunk]:
    values = response.get("value")
    if not isinstance(values, list):
        raise ValueError("Azure Search response.value must be a list")

    results = []
    for item in values:
        if not isinstance(item, dict):
            raise ValueError("Azure Search result item must be an object")
        results.append(
            RetrievedChunk(
                score=float(item.get("@search.score", 0.0)),
                id=str(item.get("id", "")),
                document_id=str(item.get("document_id", "")),
                source=str(item.get("source", "")),
                title=str(item.get("title", "")),
                chunk_index=int(item.get("chunk_index", 0)),
                text=str(item.get("text", "")),
                source_type=str(item.get("source_type", "")),
                heading=str(item.get("heading", "")),
                published_at=item.get("published_at"),
            )
        )
    return results
