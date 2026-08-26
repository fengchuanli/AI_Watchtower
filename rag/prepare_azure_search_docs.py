import json
import re
from pathlib import Path
from typing import Dict, Optional

ROOT = Path(__file__).resolve().parents[1]
CHUNKS_FILE = ROOT / "rag" / "chunks.jsonl"
OUTPUT_FILE = ROOT / "rag" / "azure_search_docs.jsonl"


def load_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def write_jsonl(path: Path, records) -> int:
    count = 0
    with path.open("w", encoding="utf-8") as file:
        for record in records:
            file.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
    return count


def infer_source_type(source: str) -> str:
    if source.startswith("docs/"):
        return "docs"

    if source.startswith("data/news.json#"):
        return "current_news"

    if source.startswith("data/news-history.json#"):
        return "history_news"

    return "unknown"


def infer_document_type(source_type: str) -> str:
    if source_type == "docs":
        return "markdown"

    if source_type in {"current_news", "history_news"}:
        return "news_item"

    return "unknown"


def infer_heading(chunk: Dict) -> str:
    text = str(chunk.get("text", ""))
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            return stripped.lstrip("#").strip()

    return str(chunk.get("title", "")).strip()


def infer_published_at(chunk: Dict, source_type: str) -> Optional[str]:
    if source_type not in {"current_news", "history_news"}:
        return None

    text = str(chunk.get("text", ""))
    match = re.search(r"发布时间:\s*([^\s]+)", text)
    if match:
        return match.group(1)

    return None


def to_azure_search_doc(chunk: Dict) -> Dict:
    source = str(chunk.get("source", ""))
    source_type = infer_source_type(source)

    return {
        "id": str(chunk.get("id", "")),
        "document_id": str(chunk.get("document_id", "")),
        "source": source,
        "title": str(chunk.get("title", "")),
        "chunk_index": int(chunk.get("chunk_index", 0)),
        "text": str(chunk.get("text", "")),
        "content_vector": [],
        "source_type": source_type,
        "heading": infer_heading(chunk),
        "published_at": infer_published_at(chunk, source_type),
        "document_type": infer_document_type(source_type),
    }


def validate_doc(doc: Dict) -> None:
    required_fields = [
        "id",
        "document_id",
        "source",
        "title",
        "chunk_index",
        "text",
        "content_vector",
        "source_type",
        "heading",
        "published_at",
        "document_type",
    ]

    missing_fields = [field for field in required_fields if field not in doc]
    if missing_fields:
        raise ValueError(f"{doc.get('id', 'unknown')} missing fields: {missing_fields}")

    if not isinstance(doc["content_vector"], list):
        raise TypeError(f"{doc['id']} content_vector must be a list")


def main() -> None:
    docs = []
    source_type_counts = {}

    for chunk in load_jsonl(CHUNKS_FILE):
        doc = to_azure_search_doc(chunk)
        validate_doc(doc)
        docs.append(doc)
        source_type_counts[doc["source_type"]] = source_type_counts.get(doc["source_type"], 0) + 1

    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    written_count = write_jsonl(OUTPUT_FILE, docs)

    print(f"Loaded chunks: {len(docs)}")
    print(f"Created Azure Search docs: {written_count}")
    print(f"Output: {OUTPUT_FILE}")
    print("Source type counts:")
    for source_type, count in sorted(source_type_counts.items()):
        print(f"- {source_type}: {count}")


if __name__ == "__main__":
    main()
