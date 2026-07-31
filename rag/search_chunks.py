import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[1]
CHUNKS_FILE = ROOT / "rag" / "chunks.jsonl"

DEFAULT_TOP_K = 5


def load_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def tokenize(text: str) -> List[str]:
    normalized = text.lower()
    latin_tokens = re.findall(r"[a-z0-9][a-z0-9_-]+", normalized)
    cjk_tokens = re.findall(r"[\u4e00-\u9fff]", normalized)
    return latin_tokens + cjk_tokens


def score_chunk(query_terms: Counter, chunk: dict) -> int:
    searchable_text = " ".join(
        [
            str(chunk.get("title", "")),
            str(chunk.get("source", "")),
            str(chunk.get("text", "")),
        ]
    )
    chunk_terms = Counter(tokenize(searchable_text))

    score = 0
    for term, query_count in query_terms.items():
        score += min(query_count, chunk_terms.get(term, 0))

    return score


def search_chunks(query: str, top_k: int) -> List[Tuple[int, dict]]:
    query_terms = Counter(tokenize(query))

    if not query_terms:
        return []

    scored_chunks = []
    for chunk in load_jsonl(CHUNKS_FILE):
        score = score_chunk(query_terms, chunk)
        if score > 0:
            scored_chunks.append((score, chunk))

    scored_chunks.sort(
        key=lambda item: (
            item[0],
            -int(item[1].get("chunk_index", 0)),
            item[1].get("source", ""),
        ),
        reverse=True,
    )

    return scored_chunks[:top_k]


def preview_text(text: str, length: int = 240) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if len(compact) <= length:
        return compact
    return f"{compact[:length]}..."


def print_results(query: str, results: List[Tuple[int, dict]]) -> None:
    print(f"Query: {query}")
    print(f"Results: {len(results)}")

    if not results:
        print("No matching chunks found.")
        return

    for rank, (score, chunk) in enumerate(results, start=1):
        print()
        print(f"#{rank} score={score}")
        print(f"title: {chunk.get('title', '')}")
        print(f"source: {chunk.get('source', '')}")
        print(f"chunk_index: {chunk.get('chunk_index', '')}")
        print(f"text: {preview_text(chunk.get('text', ''))}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Search local RAG chunks with a simple keyword-based retriever."
    )
    parser.add_argument("query", help="Question or search query")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K, help="Number of chunks to return")
    args = parser.parse_args()

    results = search_chunks(args.query, args.top_k)
    print_results(args.query, results)


if __name__ == "__main__":
    main()
