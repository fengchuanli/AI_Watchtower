"""Generate Azure OpenAI embeddings for chunks and store them in the embedding cache.

- Only cache misses (new or changed chunks) are sent to Azure.
- The cache file is saved after every batch, so a failure keeps finished work.
- The API key is never printed.

Examples:
  python3 rag/scripts/build_embedding_cache.py --limit 20 --dry-run
  python3 rag/scripts/build_embedding_cache.py --limit 20
  python3 rag/scripts/build_embedding_cache.py            # all remaining chunks
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, List

from embedding_cache import EmbeddingCache, classify_chunk
from embedding_providers import (
    AzureOpenAIEmbeddingConfig,
    AzureOpenAIEmbeddingProvider,
    EmbeddingProviderError,
)


ROOT = Path(__file__).resolve().parents[2]
CHUNKS_FILE = ROOT / "rag" / "data" / "chunks.jsonl"
CACHE_FILE = ROOT / "rag" / "data" / "embedding_cache.jsonl"


def load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def batched(items: List[Dict], size: int) -> Iterable[List[Dict]]:
    for start in range(0, len(items), size):
        yield items[start : start + size]


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the embedding cache with Azure OpenAI (cache misses only).")
    parser.add_argument("--chunks-file", type=Path, default=CHUNKS_FILE)
    parser.add_argument("--cache-file", type=Path, default=CACHE_FILE)
    parser.add_argument("--limit", type=int, default=None, help="Max number of chunks to embed in this run.")
    parser.add_argument("--batch-size", type=int, default=16, help="Chunks per Azure request.")
    parser.add_argument("--expected-dimension", type=int, default=1536)
    parser.add_argument("--timeout", type=float, default=60.0)
    parser.add_argument("--sleep", type=float, default=0.5, help="Seconds to wait between batches.")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be embedded without calling Azure.")
    args = parser.parse_args()

    deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "").strip()
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "").strip()
    if not deployment or not api_version:
        print("Missing AZURE_OPENAI_EMBEDDING_DEPLOYMENT / AZURE_OPENAI_API_VERSION.")
        print("Run first: set -a; source .env; set +a")
        return 1

    chunks = list(load_jsonl(args.chunks_file))
    cache = EmbeddingCache.read(args.cache_file)

    counts = {"hit": 0, "miss": 0, "changed": 0, "empty": 0}
    targets: List[Dict] = []
    for chunk in chunks:
        if not str(chunk.get("text", "")).strip():
            counts["empty"] += 1
            continue
        status = classify_chunk(cache, chunk, deployment, api_version)
        counts[status] += 1
        if status != "hit":
            targets.append(chunk)

    if args.limit is not None:
        targets = targets[: args.limit]

    total_chars = sum(len(c["text"]) for c in targets)
    print("Embedding cache build")
    print(f"- deployment: {deployment} / api-version: {api_version}")
    print(f"- total chunks: {len(chunks)}")
    print(f"- cache hits (reused, no API call): {counts['hit']}")
    print(f"- new chunks: {counts['miss']}")
    print(f"- changed chunks: {counts['changed']}")
    print(f"- empty chunks skipped: {counts['empty']}")
    print(f"- to embed in this run: {len(targets)} chunks, {total_chars} characters")

    if not targets:
        print("\nNothing to do. All chunks are cached.")
        return 0

    if args.dry_run:
        print("\nDry run: no Azure request was sent.")
        for chunk in targets[:5]:
            print(f"  - {chunk['id']} ({len(chunk['text'])} chars)")
        return 0

    try:
        config = AzureOpenAIEmbeddingConfig.from_env(
            dict(os.environ), timeout=args.timeout, expected_dimension=args.expected_dimension
        )
    except EmbeddingProviderError as error:
        print(f"Configuration error: {error}")
        return 1
    provider = AzureOpenAIEmbeddingProvider(config)

    done = 0
    started = time.time()
    for batch in batched(targets, args.batch_size):
        try:
            vectors = provider.embed_batch([c["text"] for c in batch])
        except EmbeddingProviderError as error:
            cache.write(args.cache_file)
            print(f"\nStopped: {error}")
            print(f"- embedded before stop: {done}")
            print(f"- first failed chunk: {batch[0]['id']}")
            print("Finished batches are saved. Re-run the same command to continue.")
            return 1

        for chunk, vector in zip(batch, vectors):
            cache.upsert(chunk["id"], chunk["text"], deployment, api_version, vector)
        done += len(batch)
        cache.write(args.cache_file)
        print(f"  saved {done}/{len(targets)}")
        if done < len(targets):
            time.sleep(args.sleep)

    elapsed = time.time() - started
    print("\nDone")
    print(f"- embedded and cached: {done}")
    print(f"- cache records now: {len(cache.records)}")
    print(f"- cache file: {args.cache_file}")
    print(f"- elapsed: {elapsed:.1f}s")
    print("- API key printed: no")
    return 0


if __name__ == "__main__":
    sys.exit(main())
