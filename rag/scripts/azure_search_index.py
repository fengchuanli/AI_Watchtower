"""Create the Azure AI Search index, upload vectorized chunks, and run test queries.

Subcommands (run from the repository root after `set -a; source .env; set +a`):
  python3 rag/scripts/azure_search_index.py create-index [--dry-run]
  python3 rag/scripts/azure_search_index.py upload [--limit N] [--batch-size 100]
  python3 rag/scripts/azure_search_index.py status
  python3 rag/scripts/azure_search_index.py query "来源可信度怎么判断" [--top-k 5] [--hybrid]

Required env vars:
  AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_API_KEY, AZURE_SEARCH_INDEX_NAME
  (query also needs the AZURE_OPENAI_* vars to embed the question)

The API key is never printed.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[2]
UPLOAD_ACTIONS_FILE = ROOT / "rag" / "data" / "azure_search_upload_actions.jsonl"

SEARCH_API_VERSION = "2024-07-01"
VECTOR_DIMENSIONS = 1536
VECTOR_PROFILE = "chunk-vector-profile"
VECTOR_ALGORITHM = "chunk-hnsw"


def build_index_definition(index_name: str, dimensions: int = VECTOR_DIMENSIONS) -> Dict:
    """Index schema from rag/docs/azure/azure-search-schema.md."""

    def field(name, type_, **flags):
        base = {
            "name": name,
            "type": type_,
            "searchable": False,
            "filterable": False,
            "sortable": False,
            "facetable": False,
            "retrievable": True,
        }
        base.update(flags)
        return base

    return {
        "name": index_name,
        "fields": [
            field("id", "Edm.String", key=True, filterable=True),
            field("document_id", "Edm.String", filterable=True),
            field("source", "Edm.String", filterable=True),
            field("title", "Edm.String", searchable=True),
            field("chunk_index", "Edm.Int32", filterable=True, sortable=True),
            field("text", "Edm.String", searchable=True),
            {
                "name": "content_vector",
                "type": "Collection(Edm.Single)",
                "searchable": True,
                "retrievable": False,
                "dimensions": dimensions,
                "vectorSearchProfile": VECTOR_PROFILE,
            },
            field("source_type", "Edm.String", filterable=True, facetable=True),
            field("heading", "Edm.String", searchable=True),
            field("published_at", "Edm.DateTimeOffset", filterable=True, sortable=True),
            field("document_type", "Edm.String", filterable=True, facetable=True),
        ],
        "vectorSearch": {
            "algorithms": [
                {"name": VECTOR_ALGORITHM, "kind": "hnsw", "hnswParameters": {"metric": "cosine"}}
            ],
            "profiles": [{"name": VECTOR_PROFILE, "algorithm": VECTOR_ALGORITHM}],
        },
    }


class SearchConfig:
    def __init__(self, env: Dict[str, str]) -> None:
        missing = [k for k in ("AZURE_SEARCH_ENDPOINT", "AZURE_SEARCH_API_KEY", "AZURE_SEARCH_INDEX_NAME") if not env.get(k, "").strip()]
        if missing:
            raise SystemExit("Missing env vars: " + ", ".join(missing) + "\nRun first: set -a; source .env; set +a")
        self.endpoint = env["AZURE_SEARCH_ENDPOINT"].strip().rstrip("/")
        self.api_key = env["AZURE_SEARCH_API_KEY"].strip()
        self.index_name = env["AZURE_SEARCH_INDEX_NAME"].strip()

    def url(self, path: str) -> str:
        return f"{self.endpoint}{path}?api-version={SEARCH_API_VERSION}"


def request(config: SearchConfig, method: str, path: str, body: Optional[Dict] = None, timeout: float = 60.0) -> Dict:
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        config.url(path),
        data=data,
        method=method,
        headers={"Content-Type": "application/json", "api-key": config.api_key},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace").replace(config.api_key, "<redacted>")
        hint = {
            401: "API key is wrong or missing.",
            403: "Access denied. Check the key type (admin key needed for writes) and network rules.",
            404: "Not found. Check AZURE_SEARCH_ENDPOINT / AZURE_SEARCH_INDEX_NAME, or create the index first.",
        }.get(error.code, "")
        raise SystemExit(f"HTTP {error.code}: {hint}\n{detail[:800]}")
    except urllib.error.URLError as error:
        raise SystemExit(f"Network error: {error.reason}")


def load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def cmd_create_index(args) -> None:
    index_name = os.getenv("AZURE_SEARCH_INDEX_NAME", "ai-watchtower-chunks").strip() or "ai-watchtower-chunks"
    definition = build_index_definition(index_name)
    if args.dry_run:
        print(json.dumps(definition, ensure_ascii=False, indent=2))
        print("\nDry run: no Azure request was sent.")
        return
    config = SearchConfig(dict(os.environ))
    request(config, "PUT", f"/indexes('{config.index_name}')", definition)
    print(f"Index ready: {config.index_name}")
    print(f"- fields: {len(definition['fields'])}")
    print(f"- vector field: content_vector ({VECTOR_DIMENSIONS} dim, cosine, HNSW)")


def cmd_upload(args) -> None:
    config = SearchConfig(dict(os.environ))
    if not args.input_file.exists():
        raise SystemExit(f"{args.input_file} not found. Run prepare_vectorized_azure_search_docs.py and prepare_azure_search_upload_actions.py first.")
    docs = list(load_jsonl(args.input_file))
    if args.limit is not None:
        docs = docs[: args.limit]
    bad = [d.get("id") for d in docs if len(d.get("content_vector") or []) != VECTOR_DIMENSIONS]
    if bad:
        raise SystemExit(f"{len(bad)} docs do not have a {VECTOR_DIMENSIONS}-dim vector, e.g. {bad[:3]}")

    print(f"Uploading {len(docs)} docs to index '{config.index_name}' in batches of {args.batch_size}")
    succeeded, failed = 0, []
    for start in range(0, len(docs), args.batch_size):
        batch = docs[start : start + args.batch_size]
        result = request(config, "POST", f"/indexes('{config.index_name}')/docs/index", {"value": batch})
        for item in result.get("value", []):
            if item.get("status"):
                succeeded += 1
            else:
                failed.append((item.get("key"), item.get("errorMessage")))
        print(f"  {min(start + args.batch_size, len(docs))}/{len(docs)}")

    print("\nUpload finished")
    print(f"- succeeded: {succeeded}")
    print(f"- failed: {len(failed)}")
    for key, message in failed[:5]:
        print(f"  - {key}: {message}")
    print("Index counts can take a few seconds to update. Check with: status")
    if failed:
        raise SystemExit(1)


def cmd_status(args) -> None:
    config = SearchConfig(dict(os.environ))
    stats = request(config, "GET", f"/indexes('{config.index_name}')/search.stats")
    service = request(config, "GET", "/servicestats")
    usage = service.get("counters", {})
    print(f"Index: {config.index_name}")
    print(f"- document count: {stats.get('documentCount')}")
    print(f"- storage size: {stats.get('storageSize', 0) / 1024 / 1024:.1f} MB")
    print(f"- vector index size: {stats.get('vectorIndexSize', 0) / 1024 / 1024:.1f} MB")
    storage = usage.get("storageSize", {})
    if storage.get("quota"):
        print(f"Service storage: {storage.get('usage', 0) / 1024 / 1024:.1f} / {storage['quota'] / 1024 / 1024:.0f} MB")


def cmd_query(args) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from azure_search_retriever import build_vector_search_payload, normalize_azure_search_results
    from embedding_providers import AzureOpenAIEmbeddingConfig, AzureOpenAIEmbeddingProvider

    config = SearchConfig(dict(os.environ))
    provider = AzureOpenAIEmbeddingProvider(
        AzureOpenAIEmbeddingConfig.from_env(dict(os.environ), expected_dimension=VECTOR_DIMENSIONS)
    )
    query_vector = provider.embed_text(args.question)
    payload = build_vector_search_payload(
        query_vector,
        top_k=args.top_k,
        search_text=args.question if args.hybrid else "",
        filter_expression=f"source_type eq '{args.source_type}'" if args.source_type else None,
    )
    result = request(config, "POST", f"/indexes('{config.index_name}')/docs/search", payload)
    chunks = normalize_azure_search_results(result)

    print(f"Query: {args.question}")
    print(f"Mode: {'hybrid (keyword + vector)' if args.hybrid else 'vector'}")
    for rank, chunk in enumerate(chunks, start=1):
        preview = " ".join(chunk.text.split())[:120]
        print(f"\n#{rank} score={chunk.score:.4f} [{chunk.source_type}]")
        print(f"   title : {chunk.title}")
        print(f"   source: {chunk.source} (chunk {chunk.chunk_index})")
        print(f"   text  : {preview}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Azure AI Search index tools for AI Watchtower RAG.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("create-index", help="Create or update the index schema.")
    p.add_argument("--dry-run", action="store_true", help="Print the index definition only.")
    p.set_defaults(func=cmd_create_index)

    p = sub.add_parser("upload", help="Upload vectorized chunks.")
    p.add_argument("--input-file", type=Path, default=UPLOAD_ACTIONS_FILE)
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--batch-size", type=int, default=100)
    p.set_defaults(func=cmd_upload)

    p = sub.add_parser("status", help="Show document count and storage usage.")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("query", help="Embed a question and run a vector (or hybrid) search.")
    p.add_argument("question")
    p.add_argument("--top-k", type=int, default=5)
    p.add_argument("--hybrid", action="store_true", help="Combine keyword search with vector search.")
    p.add_argument("--source-type", choices=["docs", "current_news", "history_news"], default=None)
    p.set_defaults(func=cmd_query)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
