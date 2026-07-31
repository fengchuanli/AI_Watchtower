import argparse
import json
import math
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
    cjk_tokens = []
    for sequence in re.findall(r"[\u4e00-\u9fff]+", normalized):
        if len(sequence) == 1:
            cjk_tokens.append(sequence)
            continue

        for index in range(len(sequence) - 1):
            cjk_tokens.append(sequence[index : index + 2])

        for index in range(len(sequence) - 2):
            cjk_tokens.append(sequence[index : index + 3])

    return latin_tokens + cjk_tokens


def text_to_vector(text: str) -> Counter:
    return Counter(tokenize(text))


def cosine_similarity(first_vector: Counter, second_vector: Counter) -> float:
    if not first_vector or not second_vector:
        return 0.0

    shared_terms = set(first_vector) & set(second_vector)
    dot_product = sum(first_vector[term] * second_vector[term] for term in shared_terms)

    first_norm = math.sqrt(sum(value * value for value in first_vector.values()))
    second_norm = math.sqrt(sum(value * value for value in second_vector.values()))

    if first_norm == 0 or second_norm == 0:
        return 0.0

    return dot_product / (first_norm * second_norm)


def chunk_search_text(chunk: dict) -> str:
    return " ".join(
        [
            str(chunk.get("title", "")),
            str(chunk.get("source", "")),
            str(chunk.get("text", "")),
        ]
    )


def vector_search(query: str, top_k: int) -> List[Tuple[float, dict]]:
    query_vector = text_to_vector(query)
    if not query_vector:
        return []

    scored_chunks = []
    for chunk in load_jsonl(CHUNKS_FILE):
        chunk_vector = text_to_vector(chunk_search_text(chunk))
        similarity = cosine_similarity(query_vector, chunk_vector)
        if similarity > 0:
            scored_chunks.append((similarity, chunk))

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


def print_results(query: str, results: List[Tuple[float, dict]]) -> None:
    print(f"Query: {query}")
    print(f"Results: {len(results)}")
    print("Mode: local term-frequency vector demo")

    if not results:
        print("No similar chunks found.")
        return

    for rank, (similarity, chunk) in enumerate(results, start=1):
        print()
        print(f"#{rank} similarity={similarity:.4f}")
        print(f"title: {chunk.get('title', '')}")
        print(f"source: {chunk.get('source', '')}")
        print(f"chunk_index: {chunk.get('chunk_index', '')}")
        print(f"text: {preview_text(chunk.get('text', ''))}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run a local vector-search demo over RAG chunks using term-frequency vectors."
    )
    parser.add_argument("query", help="Question or search query")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K, help="Number of chunks to return")
    args = parser.parse_args()

    results = vector_search(args.query, args.top_k)
    print_results(args.query, results)


if __name__ == "__main__":
    main()
