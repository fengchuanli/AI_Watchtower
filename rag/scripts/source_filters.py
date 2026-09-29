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
