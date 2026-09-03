import argparse
import json
import os
from pathlib import Path

from embedding_cache import EmbeddingCache, inspect_chunks


ROOT = Path(__file__).resolve().parents[1]
CHUNKS_FILE = ROOT / "rag" / "chunks.jsonl"
CACHE_FILE = ROOT / "rag" / "embedding_cache.jsonl"


def load_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def resolve_arg_or_env(value: str, env_key: str, placeholder: str) -> str:
    if value:
        return value
    return os.getenv(env_key, "").strip() or placeholder


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Inspect embedding cache hit/miss status without calling Azure OpenAI."
    )
    parser.add_argument("--chunks-file", type=Path, default=CHUNKS_FILE)
    parser.add_argument("--cache-file", type=Path, default=CACHE_FILE)
    parser.add_argument("--embedding-deployment", default="")
    parser.add_argument("--api-version", default="")
    args = parser.parse_args()

    embedding_deployment = resolve_arg_or_env(
        args.embedding_deployment,
        "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
        "<embedding-deployment>",
    )
    api_version = resolve_arg_or_env(args.api_version, "AZURE_OPENAI_API_VERSION", "<api-version>")

    cache = EmbeddingCache.read(args.cache_file)
    report = inspect_chunks(
        load_jsonl(args.chunks_file),
        cache,
        embedding_deployment=embedding_deployment,
        api_version=api_version,
    )

    print("Embedding cache inspection")
    print(f"- chunks file: {args.chunks_file}")
    print(f"- cache file: {args.cache_file}")
    print(f"- cache file exists: {'yes' if args.cache_file.exists() else 'no'}")
    print(f"- embedding deployment: {embedding_deployment}")
    print(f"- api version: {api_version}")
    print(f"- total chunks: {report['total_chunks']}")
    print(f"- cache hits: {report['cache_hits']}")
    print(f"- cache misses: {report['cache_misses']}")
    print(f"- changed chunks: {report['changed_chunks']}")
    print()
    print("No Azure request was sent.")
    print("No content_vector was updated.")


if __name__ == "__main__":
    main()
