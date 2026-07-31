import argparse
import re
from typing import Dict, List, Tuple

from search_chunks import search_chunks
from vector_search_demo import vector_search

DEFAULT_TOP_K = 5
DEFAULT_MAX_CHARS_PER_CHUNK = 700


def compact_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def trim_text(text: str, max_chars: int) -> str:
    compact = compact_text(text)
    if len(compact) <= max_chars:
        return compact
    return f"{compact[:max_chars].rstrip()}..."


def get_results(query: str, top_k: int, mode: str) -> List[Tuple[float, Dict]]:
    if mode == "keyword":
        return [(float(score), chunk) for score, chunk in search_chunks(query, top_k)]

    return vector_search(query, top_k)


def build_citations(results: List[Tuple[float, Dict]], max_chars_per_chunk: int) -> List[Dict]:
    citations = []

    for index, (score, chunk) in enumerate(results, start=1):
        citations.append(
            {
                "citation_id": index,
                "score": score,
                "document_id": chunk.get("document_id", ""),
                "source": chunk.get("source", ""),
                "title": chunk.get("title", ""),
                "chunk_index": chunk.get("chunk_index", ""),
                "text": trim_text(chunk.get("text", ""), max_chars_per_chunk),
            }
        )

    return citations


def build_context_text(question: str, citations: List[Dict], mode: str) -> str:
    lines = [
        "# RAG Context",
        "",
        f"Question: {question}",
        f"Retrieval mode: {mode}",
        "",
        "Use only the cited context below. If the context is insufficient, say the available sources are insufficient.",
        "",
    ]

    if not citations:
        lines.extend(
            [
                "No relevant context was found.",
                "",
                "Citation list: none",
            ]
        )
        return "\n".join(lines)

    for citation in citations:
        lines.extend(
            [
                f"[{citation['citation_id']}]",
                f"score: {citation['score']:.4f}",
                f"title: {citation['title']}",
                f"source: {citation['source']}",
                f"document_id: {citation['document_id']}",
                f"chunk_index: {citation['chunk_index']}",
                "text:",
                citation["text"],
                "",
            ]
        )

    lines.append("Citation list:")
    for citation in citations:
        lines.append(
            f"[{citation['citation_id']}] {citation['title']} ({citation['source']}#chunk-{citation['chunk_index']})"
        )

    return "\n".join(lines)


def print_context(question: str, top_k: int, mode: str, max_chars_per_chunk: int) -> None:
    results = get_results(question, top_k, mode)
    citations = build_citations(results, max_chars_per_chunk)
    context_text = build_context_text(question, citations, mode)
    print(context_text)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build citation-aware RAG context from retrieved chunks."
    )
    parser.add_argument("question", help="User question")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K, help="Number of chunks to include")
    parser.add_argument(
        "--mode",
        choices=["vector", "keyword"],
        default="vector",
        help="Retrieval mode used before building context",
    )
    parser.add_argument(
        "--max-chars-per-chunk",
        type=int,
        default=DEFAULT_MAX_CHARS_PER_CHUNK,
        help="Maximum text length included for each cited chunk",
    )
    args = parser.parse_args()

    print_context(args.question, args.top_k, args.mode, args.max_chars_per_chunk)


if __name__ == "__main__":
    main()
