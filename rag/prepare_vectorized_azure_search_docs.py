import argparse
import json
import os
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from embedding_cache import EmbeddingCache, validate_vector


ROOT = Path(__file__).resolve().parents[1]
AZURE_SEARCH_DOCS_FILE = ROOT / "rag" / "azure_search_docs.jsonl"
CACHE_FILE = ROOT / "rag" / "embedding_cache.jsonl"
OUTPUT_FILE = ROOT / "rag" / "vectorized_azure_search_docs.jsonl"


def load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def write_jsonl(path: Path, records: Iterable[Dict]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as file:
        for record in records:
            file.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
    return count


def resolve_arg_or_env(value: str, env_key: str, placeholder: str) -> str:
    if value:
        return value
    return os.getenv(env_key, "").strip() or placeholder


def vectorize_doc(
    doc: Dict,
    cache: EmbeddingCache,
    embedding_deployment: str,
    api_version: str,
    expected_dimension: Optional[int] = None,
) -> Tuple[Dict, bool]:
    doc_id = str(doc.get("id", ""))
    text = str(doc.get("text", ""))
    record = cache.get(doc_id, text, embedding_deployment, api_version)
    if not record:
        copied = dict(doc)
        copied["content_vector"] = []
        return copied, False

    vector = validate_vector(record.vector, doc_id)
    if expected_dimension is not None and len(vector) != expected_dimension:
        raise ValueError(f"{doc_id} vector dimension mismatch: expected {expected_dimension}, got {len(vector)}")

    copied = dict(doc)
    copied["content_vector"] = vector
    return copied, True


def prepare_vectorized_docs(
    docs: Iterable[Dict],
    cache: EmbeddingCache,
    embedding_deployment: str,
    api_version: str,
    expected_dimension: Optional[int] = None,
) -> Tuple[List[Dict], Dict[str, int]]:
    vectorized_docs = []
    report = {
        "total_docs": 0,
        "vectorized_docs": 0,
        "missing_vectors": 0,
    }

    for doc in docs:
        report["total_docs"] += 1
        vectorized_doc, has_vector = vectorize_doc(
            doc,
            cache,
            embedding_deployment=embedding_deployment,
            api_version=api_version,
            expected_dimension=expected_dimension,
        )
        vectorized_docs.append(vectorized_doc)
        if has_vector:
            report["vectorized_docs"] += 1
        else:
            report["missing_vectors"] += 1

    return vectorized_docs, report


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare Azure Search docs with content_vector filled from the local embedding cache."
    )
    parser.add_argument("--azure-search-docs-file", type=Path, default=AZURE_SEARCH_DOCS_FILE)
    parser.add_argument("--cache-file", type=Path, default=CACHE_FILE)
    parser.add_argument("--output-file", type=Path, default=OUTPUT_FILE)
    parser.add_argument("--embedding-deployment", default="")
    parser.add_argument("--api-version", default="")
    parser.add_argument("--expected-dimension", type=int, default=None)
    parser.add_argument(
        "--allow-partial",
        action="store_true",
        help="Write output even when some docs are missing vectors. Use only for local debugging.",
    )
    parser.add_argument(
        "--report-only",
        action="store_true",
        help="Print hit/miss counts without writing an output file.",
    )
    args = parser.parse_args()

    embedding_deployment = resolve_arg_or_env(
        args.embedding_deployment,
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
        "<embedding-deployment>",
    )
    api_version = resolve_arg_or_env(args.api_version, "AZURE_OPENAI_API_VERSION", "<api-version>")

    cache = EmbeddingCache.read(args.cache_file)
    docs, report = prepare_vectorized_docs(
        load_jsonl(args.azure_search_docs_file),
        cache,
        embedding_deployment=embedding_deployment,
        api_version=api_version,
        expected_dimension=args.expected_dimension,
    )

    should_write = not args.report_only and (args.allow_partial or report["missing_vectors"] == 0)
    written_count = write_jsonl(args.output_file, docs) if should_write else 0

    print("Vectorized Azure Search docs")
    print(f"- azure search docs file: {args.azure_search_docs_file}")
    print(f"- cache file: {args.cache_file}")
    print(f"- cache file exists: {'yes' if args.cache_file.exists() else 'no'}")
    print(f"- output file: {args.output_file}")
    print(f"- embedding deployment: {embedding_deployment}")
    print(f"- api version: {api_version}")
    print(f"- total docs: {report['total_docs']}")
    print(f"- vectorized docs: {report['vectorized_docs']}")
    print(f"- missing vectors: {report['missing_vectors']}")
    print(f"- output written: {'yes' if should_write else 'no'}")
    print(f"- records written: {written_count}")
    print()
    print("No Azure request was sent.")
    print("No Azure AI Search upsert was sent.")

    if report["missing_vectors"] and not args.report_only and not args.allow_partial:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
