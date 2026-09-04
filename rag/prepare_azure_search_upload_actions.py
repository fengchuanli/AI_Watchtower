import argparse
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from embedding_cache import validate_vector


ROOT = Path(__file__).resolve().parents[1]
VECTORIZED_DOCS_FILE = ROOT / "rag" / "vectorized_azure_search_docs.jsonl"
OUTPUT_FILE = ROOT / "rag" / "azure_search_upload_actions.jsonl"

REQUIRED_FIELDS = [
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


def validate_vectorized_doc(doc: Dict, expected_dimension: Optional[int] = None) -> int:
    missing_fields = [field for field in REQUIRED_FIELDS if field not in doc]
    doc_id = str(doc.get("id", "unknown"))
    if missing_fields:
        raise ValueError(f"{doc_id} missing fields: {', '.join(missing_fields)}")

    vector = validate_vector(doc["content_vector"], doc_id)
    if expected_dimension is not None and len(vector) != expected_dimension:
        raise ValueError(f"{doc_id} vector dimension mismatch: expected {expected_dimension}, got {len(vector)}")

    return len(vector)


def to_upload_action(doc: Dict, action: str = "upload", expected_dimension: Optional[int] = None) -> Dict:
    validate_vectorized_doc(doc, expected_dimension=expected_dimension)
    prepared = dict(doc)
    prepared["@search.action"] = action
    return prepared


def prepare_upload_actions(
    docs: Iterable[Dict],
    action: str = "upload",
    expected_dimension: Optional[int] = None,
) -> Tuple[List[Dict], Dict[str, object]]:
    actions = []
    dimensions = set()
    for doc in docs:
        dimension = validate_vectorized_doc(doc, expected_dimension=expected_dimension)
        dimensions.add(dimension)
        actions.append(to_upload_action(doc, action=action, expected_dimension=expected_dimension))

    return actions, {
        "total_docs": len(actions),
        "action": action,
        "vector_dimensions": sorted(dimensions),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare Azure AI Search upload action records without calling Azure."
    )
    parser.add_argument("--input-file", type=Path, default=VECTORIZED_DOCS_FILE)
    parser.add_argument("--output-file", type=Path, default=OUTPUT_FILE)
    parser.add_argument("--action", choices=["upload", "mergeOrUpload"], default="upload")
    parser.add_argument("--expected-dimension", type=int, default=None)
    parser.add_argument("--report-only", action="store_true")
    args = parser.parse_args()

    if not args.input_file.exists():
        print("Azure Search upload actions")
        print(f"- input file: missing ({args.input_file})")
        print("- output written: no")
        print()
        print("No Azure AI Search request was sent.")
        raise SystemExit(1)

    actions, report = prepare_upload_actions(
        load_jsonl(args.input_file),
        action=args.action,
        expected_dimension=args.expected_dimension,
    )
    written_count = 0 if args.report_only else write_jsonl(args.output_file, actions)

    print("Azure Search upload actions")
    print(f"- input file: {args.input_file}")
    print(f"- output file: {args.output_file}")
    print(f"- action: {report['action']}")
    print(f"- total docs: {report['total_docs']}")
    print(f"- vector dimensions: {report['vector_dimensions']}")
    print(f"- output written: {'no' if args.report_only else 'yes'}")
    print(f"- records written: {written_count}")
    print()
    print("No Azure AI Search request was sent.")


if __name__ == "__main__":
    main()
