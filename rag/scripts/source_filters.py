from typing import Iterable, Optional, Tuple


VALID_SOURCE_TYPES = ("docs", "current_news", "history_news")

DOC_QUERY_EXPANSIONS = (
    ("来源可信度", "source policy credibility evidence quality priority"),
    ("来源", "source"),
    ("可信度", "credibility evidence quality"),
    ("新闻数据", "news data format"),
    ("必须字段", "required fields"),
    ("字段", "fields"),
)


def infer_source_type(source: str) -> str:
    if source.startswith("docs/"):
        return "docs"
    if source.startswith("data/news.json#"):
        return "current_news"
    if source.startswith("data/news-history.json#"):
        return "history_news"
    return "unknown"


def normalize_source_types(source_types: Optional[Iterable[str]]) -> Optional[Tuple[str, ...]]:
    if source_types is None:
        return None

    normalized = tuple(dict.fromkeys(str(value).strip() for value in source_types if str(value).strip()))
    if not normalized:
        raise ValueError("source_types must contain at least one value")

    unknown = [value for value in normalized if value not in VALID_SOURCE_TYPES]
    if unknown:
        raise ValueError(f"unknown source type: {unknown[0]}")
    return normalized


def source_matches_types(source: str, source_types: Optional[Iterable[str]]) -> bool:
    normalized = normalize_source_types(source_types)
    return normalized is None or infer_source_type(source) in normalized


def expand_query_for_source_types(query: str, source_types: Optional[Iterable[str]]) -> str:
    normalized = normalize_source_types(source_types)
    if normalized != ("docs",):
        return query

    expansions = [expansion for phrase, expansion in DOC_QUERY_EXPANSIONS if phrase in query]
    return " ".join([query] + expansions)


def build_source_type_filter(source_types: Optional[Iterable[str]]) -> Optional[str]:
    normalized = normalize_source_types(source_types)
    if normalized is None:
        return None

    expressions = [f"source_type eq '{source_type}'" for source_type in normalized]
    if len(expressions) == 1:
        return expressions[0]
    return f"({' or '.join(expressions)})"


def combine_filter_expressions(*expressions: Optional[str]) -> Optional[str]:
    active = [expression.strip() for expression in expressions if expression and expression.strip()]
    if not active:
        return None
    if len(active) == 1:
        return active[0]
    return " and ".join(f"({expression})" for expression in active)


# ---------------------------------------------------------------------------
# Question routing: guess which source types a question should search.
# Rule-based on purpose (explainable, no API cost). Returns None when unsure,
# which means "search everything".
# ---------------------------------------------------------------------------

DOC_ROUTE_KEYWORDS = (
    "AI Watchtower", "规则", "规范", "政策", "流程", "字段", "格式", "清单",
    "核对", "核验", "编辑", "可信度", "来源可信", "怎么判断", "如何判断",
    "policy", "format", "checklist", "rule",
)
NEWS_ROUTE_KEYWORDS = (
    "最新", "最近", "今天", "本周", "新闻", "发布", "宣布", "推出", "上线",
    "权重", "融资", "收购", "模型", "报道",
)
CURRENT_NEWS_KEYWORDS = ("最新", "最近", "今天", "本周")
# Questions about how the site's data or rules work are docs questions,
# even when they mention "新闻" (e.g. "新闻数据有哪些必须字段").
DOC_PRIORITY_KEYWORDS = ("字段", "格式", "规则", "规范", "流程", "清单", "policy", "format", "checklist", "schema")


def route_source_types(question: str) -> Optional[Tuple[str, ...]]:
    """Guess source types from the question text.

    - rules / policy / data-format questions -> docs
    - news-like questions -> current + history news (current only for "最新/最近/今天")
    - both or neither -> None (search all sources)
    """
    text = question.lower()
    if any(keyword.lower() in text for keyword in DOC_PRIORITY_KEYWORDS):
        return ("docs",)
    wants_docs = any(keyword.lower() in text for keyword in DOC_ROUTE_KEYWORDS)
    wants_news = any(keyword.lower() in text for keyword in NEWS_ROUTE_KEYWORDS)

    if wants_docs and not wants_news:
        return ("docs",)
    if wants_news and not wants_docs:
        if any(keyword in question for keyword in CURRENT_NEWS_KEYWORDS):
            return ("current_news",)
        return ("current_news", "history_news")
    return None
