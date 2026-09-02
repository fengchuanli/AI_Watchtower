import argparse
import json
import os
from pathlib import Path
from typing import Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
AZURE_SEARCH_DOCS_FILE = ROOT / "rag" / "azure_search_docs.jsonl"

REQUIRED_ENV_KEYS = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    "AZURE_OPENAI_API_VERSION",
]

REQUIRED_DOC_FIELDS = [
    "id",
    "document_id",
    "source",
    "title",
    "chunk_index",
    "text",
    "content_vector",
    "source_type",
    "heading",
    "document_type",
]


def load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                yield json.loads(stripped)
            except json.JSONDecodeError as error:
                raise ValueError(f"{path} line {line_number} is not valid JSON") from error


def mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def check_environment() -> List[str]:
    issues = []
    print("Azure OpenAI environment")
    for key in REQUIRED_ENV_KEYS:
        value = os.getenv(key, "").strip()
        if not value:
            print(f"- {key}: missing")
            issues.append(f"{key} is missing")
            continue

        if key == "AZURE_OPENAI_API_KEY":
            print(f"- {key}: set ({mask_secret(value)})")
        else:
            print(f"- {key}: {value}")

    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
    if endpoint and not endpoint.startswith("https://"):
        issues.append("AZURE_OPENAI_ENDPOINT should start with https://")

    return issues


def check_payload(sample_size: int) -> List[str]:
    issues = []
    print()
    print("Azure AI Search payload")

    if not AZURE_SEARCH_DOCS_FILE.exists():
        print(f"- file: missing ({AZURE_SEARCH_DOCS_FILE})")
        return [f"{AZURE_SEARCH_DOCS_FILE} does not exist"]

    total = 0
    empty_vectors = 0
    filled_vectors = 0
    vector_dimensions = set()
    sample_missing_fields = []

    for doc in load_jsonl(AZURE_SEARCH_DOCS_FILE):
        total += 1
        if total <= sample_size:
            missing_fields = [field for field in REQUIRED_DOC_FIELDS if field not in doc]
            if missing_fields:
                sample_missing_fields.append((doc.get("id", f"line-{total}"), missing_fields))

        vector = doc.get("content_vector")
        if vector == []:
            empty_vectors += 1
        elif isinstance(vector, list):
            filled_vectors += 1
            vector_dimensions.add(len(vector))
        else:
            issues.append(f"{doc.get('id', f'line-{total}')} content_vector is not a list")

    print(f"- file: {AZURE_SEARCH_DOCS_FILE}")
    print(f"- documents: {total}")
    print(f"- empty content_vector: {empty_vectors}")
    print(f"- filled content_vector: {filled_vectors}")
    if vector_dimensions:
        print(f"- vector dimensions seen: {sorted(vector_dimensions)}")

    for doc_id, missing_fields in sample_missing_fields:
        issues.append(f"{doc_id} missing fields: {', '.join(missing_fields)}")

    if total == 0:
        issues.append("azure_search_docs.jsonl has no documents")

    return issues


def print_next_request_shape() -> None:
    deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "<deployment>").strip() or "<deployment>"
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "<api-version>").strip() or "<api-version>"

    print()
    print("Next minimal API check")
    print("- Do not print the API key.")
    print("- Send one short text first, not the full chunk set.")
    print("- Expected request path:")
    print(f"  /openai/deployments/{deployment}/embeddings?api-version={api_version}")
    print("- Expected response:")
    print("  data[0].embedding -> list[float]")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Check whether the project is ready for an Azure OpenAI Embedding smoke test."
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with code 1 when Azure environment variables are missing.",
    )
    parser.add_argument(
        "--sample-size",
        type=int,
        default=5,
        help="Number of payload records to inspect for required fields.",
    )
    args = parser.parse_args()

    env_issues = check_environment()
    payload_issues = check_payload(args.sample_size)
    print_next_request_shape()

    issues = env_issues + payload_issues
    print()
    if issues:
        print("Readiness: not ready")
        print("Issues:")
        for issue in issues:
            print(f"- {issue}")
        if args.strict:
            raise SystemExit(1)
        return

    print("Readiness: ready for one-text Azure OpenAI Embedding smoke test")


if __name__ == "__main__":
    main()
