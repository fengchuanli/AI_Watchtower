import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS_FILE = ROOT / "rag" / "corpus.jsonl"
OUTPUT_FILE = ROOT / "rag" / "chunks.jsonl"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def load_jsonl(path: Path):
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                yield json.loads(line)


def split_text(text: str):
    chunks = []
    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - CHUNK_OVERLAP

        if start < 0:
            start = 0

    return chunks


def main():
    documents = list(load_jsonl(CORPUS_FILE))
    chunk_count = 0

    OUTPUT_FILE.parent.mkdir(exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        for document in documents:
            chunks = split_text(document["text"])

            for index, chunk_text in enumerate(chunks):
                chunk = {
                    "id": f"{document['id']}-{index:04d}",
                    "document_id": document["id"],
                    "source": document["source"],
                    "title": document["title"],
                    "chunk_index": index,
                    "text": chunk_text,
                }

                file.write(json.dumps(chunk, ensure_ascii=False) + "\n")
                chunk_count += 1

    print(f"Loaded {len(documents)} documents")
    print(f"Created {chunk_count} chunks")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()