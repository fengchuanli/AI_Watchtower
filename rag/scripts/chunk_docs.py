import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
CORPUS_FILE = ROOT / "rag" / "data" / "corpus.jsonl"
OUTPUT_FILE = ROOT / "rag" / "data" / "chunks.jsonl"

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


# ---------------------------------------------------------------------------
# Heading-aware chunking for Markdown docs (Day 32)
# A rule list such as "## Required Fields" can be thousands of characters long.
# Fixed-size splitting cut it into pieces that did not say which section they
# belonged to, so questions like "which fields are required?" missed them.
# Docs are now split by headings first; long sections are split by lines, and
# every piece starts with "【title › section】" so it keeps its context.
# News items are short and keep the original fixed-size splitting.
# ---------------------------------------------------------------------------

DOC_MAX_CHARS = 1200
HEADING_PATTERN = re.compile(r"^(#{1,3})\s+(.*\S)\s*$")


def split_markdown_sections(text: str) -> List[Tuple[str, str]]:
    """Return (heading, body) pairs. The text before the first heading uses an empty heading."""
    sections: List[Tuple[str, List[str]]] = [("", [])]
    for line in text.splitlines():
        match = HEADING_PATTERN.match(line)
        if match and len(match.group(1)) >= 2:
            sections.append((match.group(2).strip(), [line]))
        else:
            sections[-1][1].append(line)
    return [(heading, "\n".join(lines).strip()) for heading, lines in sections if "\n".join(lines).strip()]


def pack_lines(body: str, limit: int) -> List[str]:
    """Split a long section on line boundaries so each piece stays under the limit."""
    pieces, current = [], ""
    for line in body.splitlines():
        while len(line) > limit:  # a single very long line
            if current:
                pieces.append(current.strip())
                current = ""
            pieces.append(line[:limit])
            line = line[limit:]
        if current and len(current) + len(line) + 1 > limit:
            pieces.append(current.strip())
            current = ""
        current += line + "\n"
    if current.strip():
        pieces.append(current.strip())
    return pieces


def split_markdown_doc(title: str, text: str, limit: int = DOC_MAX_CHARS) -> List[Tuple[str, str]]:
    """Return (heading, chunk_text) pairs for one Markdown document."""
    chunks = []
    for heading, body in split_markdown_sections(text):
        label = f"【{title} › {heading}】" if heading else f"【{title}】"
        for piece in pack_lines(body, limit - len(label) - 1):
            text_with_label = piece if piece.startswith("# ") and not heading else f"{label}\n{piece}"
            chunks.append((heading or title, text_with_label))
    return chunks


def chunk_document(document: Dict) -> List[Tuple[str, str]]:
    if str(document.get("source", "")).startswith("docs/"):
        return split_markdown_doc(document.get("title", ""), document["text"])
    return [("", piece) for piece in split_text(document["text"])]


def main():
    documents = list(load_jsonl(CORPUS_FILE))
    chunk_count = 0

    OUTPUT_FILE.parent.mkdir(exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        for document in documents:
            chunks = chunk_document(document)

            for index, (heading, chunk_text) in enumerate(chunks):
                chunk = {
                    "id": f"{document['id']}-{index:04d}",
                    "document_id": document["id"],
                    "source": document["source"],
                    "title": document["title"],
                    "chunk_index": index,
                    "text": chunk_text,
                }
                if heading:
                    chunk["heading"] = heading

                file.write(json.dumps(chunk, ensure_ascii=False) + "\n")
                chunk_count += 1

    print(f"Loaded {len(documents)} documents")
    print(f"Created {chunk_count} chunks")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()