from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
DATA_DIR = ROOT / "data"
OUTPUT_FILE = ROOT / "rag" / "corpus.jsonl"


def clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line.replace("# ", "").strip()
    return fallback


def load_markdown_documents():
    documents = []

    for path in sorted(DOCS_DIR.glob("*.md")):
        raw_text = path.read_text(encoding="utf-8")
        text = clean_text(raw_text)

        documents.append({
            "id": path.stem,
            "source": str(path.relative_to(ROOT)),
            "title": extract_title(text, path.stem),
            "text": text,
        })

    return documents


def append_field(lines, label, value):
    if value is None:
        return

    if isinstance(value, list):
        if not value:
            return
        lines.append(f"{label}:")
        for item in value:
            lines.append(f"- {item}")
        return

    if isinstance(value, dict):
        if not value:
            return
        lines.append(f"{label}: {json.dumps(value, ensure_ascii=False)}")
        return

    value = str(value).strip()
    if value:
        lines.append(f"{label}: {value}")


def format_news_item(item, edition=None):
    lines = []
    append_field(lines, "标题", item.get("title"))
    append_field(lines, "分类", item.get("label") or item.get("category"))
    append_field(lines, "发布时间", item.get("publishedAt") or item.get("time"))

    if edition:
        append_field(lines, "新闻批次", edition.get("archiveLabel") or edition.get("id"))
        append_field(lines, "批次日期", edition.get("date"))

    append_field(lines, "摘要", item.get("summary") or item.get("body"))
    append_field(lines, "为什么重要", item.get("whyItMatters") or item.get("impact"))
    append_field(lines, "事实说明", item.get("detailBody"))
    append_field(lines, "趋势判断", item.get("trend"))
    append_field(lines, "详细趋势", item.get("detailTrend"))
    append_field(lines, "入选原因", item.get("whyRanked") or item.get("topReason"))
    append_field(lines, "读者用途", item.get("readerUse"))
    append_field(lines, "下一步核对", item.get("nextCheck"))
    append_field(lines, "证据边界", item.get("claimBoundary"))
    append_field(lines, "反向证据", item.get("counterEvidence"))
    append_field(lines, "来源", item.get("sourceName") or item.get("source"))
    append_field(lines, "来源角色", item.get("sourceRole"))
    append_field(lines, "来源解释", item.get("provenance"))
    append_field(lines, "可信层级", item.get("trustLevel"))
    append_field(lines, "核验状态", item.get("verificationStatus"))
    append_field(lines, "原始链接", item.get("originalUrl") or item.get("sourceUrl"))
    append_field(lines, "追问问题", item.get("followUpQuestions"))

    return clean_text("\n".join(lines))


def normalize_news_key(item):
    key = item.get("originalUrl") or item.get("sourceUrl") or item.get("id") or item.get("title") or ""
    return str(key).strip().lower().split("#", 1)[0].split("?", 1)[0].rstrip("/")


def load_current_news_documents():
    path = DATA_DIR / "news.json"
    if not path.exists():
        return []

    news_data = json.loads(path.read_text(encoding="utf-8"))
    edition = news_data.get("edition", {})
    documents = []

    for index, item in enumerate(news_data.get("items", [])):
        item_id = item.get("id") or f"item-{index:04d}"
        title = item.get("title") or item_id
        documents.append({
            "id": f"news-current-{item_id}",
            "source": f"data/news.json#{item_id}",
            "title": f"最新新闻: {title}",
            "text": format_news_item(item, edition),
        })

    return documents


def load_history_news_documents():
    path = DATA_DIR / "news-history.json"
    if not path.exists():
        return []

    current_news_path = DATA_DIR / "news.json"
    current_keys = set()
    if current_news_path.exists():
        current_news = json.loads(current_news_path.read_text(encoding="utf-8"))
        current_keys = {normalize_news_key(item) for item in current_news.get("items", [])}

    history_data = json.loads(path.read_text(encoding="utf-8"))
    documents = []

    for edition in history_data.get("editions", []):
        edition_id = edition.get("id") or edition.get("date") or "unknown-edition"

        for index, item in enumerate(edition.get("items", [])):
            if normalize_news_key(item) in current_keys:
                continue

            item_id = item.get("id") or f"item-{index:04d}"
            title = item.get("title") or item_id
            documents.append({
                "id": f"news-history-{edition_id}-{item_id}",
                "source": f"data/news-history.json#{edition_id}/{item_id}",
                "title": f"历史新闻: {title}",
                "text": format_news_item(item, edition),
            })

    return documents


def main():
    documents = []
    markdown_documents = load_markdown_documents()
    current_news_documents = load_current_news_documents()
    history_news_documents = load_history_news_documents()
    documents.extend(markdown_documents)
    documents.extend(current_news_documents)
    documents.extend(history_news_documents)

    OUTPUT_FILE.parent.mkdir(exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        for document in documents:
            file.write(json.dumps(document, ensure_ascii=False) + "\n")

    print(f"Loaded {len(documents)} documents")
    print(f"- Markdown docs: {len(markdown_documents)}")
    print(f"- Current news items: {len(current_news_documents)}")
    print(f"- Historical news items: {len(history_news_documents)}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
