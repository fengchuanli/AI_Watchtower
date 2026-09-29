import argparse
import re
from typing import Dict, List

from build_context import (
    DEFAULT_MAX_CHARS_PER_CHUNK,
    DEFAULT_TOP_K,
    build_citations,
    get_results,
)

DEFAULT_MIN_SCORE = 0.08


def compact_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[。！？!?])\s*", compact_text(text))
    return [part.strip() for part in parts if part.strip()]


def pick_evidence_sentence(citation: Dict) -> str:
    text = citation.get("text", "")
    sentences = split_sentences(text)

    evidence_labels = [
        "为什么重要:",
        "事实说明:",
        "趋势判断:",
        "详细趋势:",
        "读者用途:",
        "下一步核对:",
        "证据边界:",
        "摘要:",
    ]

    for label in evidence_labels:
        for sentence in sentences:
            if label in sentence:
                return sentence

    if sentences:
        return sentences[0]

    return compact_text(text)


def citation_marker(citation: Dict) -> str:
    return f"[{citation['citation_id']}]"


def has_sufficient_evidence(citations: List[Dict], min_score: float) -> bool:
    if not citations:
        return False

    return any(float(citation.get("score", 0.0)) >= min_score for citation in citations)


def build_answer(question: str, citations: List[Dict], min_score: float) -> str:
    if not has_sufficient_evidence(citations, min_score):
        return (
            "根据当前检索到的资料，无法给出可靠回答。"
            "可用资料不足，或者检索结果相关性过低；需要补充更直接的来源后再判断。"
        )

    answer_lines = [
        "根据检索到的资料，可以先做一个保守回答：",
        "",
    ]

    used_citations = []
    for citation in citations:
        if float(citation.get("score", 0.0)) < min_score:
            continue

        evidence = pick_evidence_sentence(citation)
        if not evidence:
            continue

        used_citations.append(citation)
        answer_lines.append(f"- {evidence} {citation_marker(citation)}")

    if not used_citations:
        return (
            "根据当前检索到的资料，无法给出可靠回答。"
            "虽然找到了一些候选片段，但没有足够明确的内容可以作为回答依据。"
        )

    answer_lines.extend(
        [
            "",
            "注意：以上回答只基于当前检索到的上下文，不代表完整事实结论。"
            "如果需要用于业务判断，应继续核对原始来源、官方说明或第三方验证材料。",
        ]
    )

    return "\n".join(answer_lines)


def format_sources(citations: List[Dict]) -> str:
    if not citations:
        return "Sources: none"

    lines = ["Sources:"]
    for citation in citations:
        lines.extend(
            [
                f"{citation_marker(citation)} {citation.get('title', '')}",
                f"    source: {citation.get('source', '')}",
                f"    document_id: {citation.get('document_id', '')}",
                f"    chunk_index: {citation.get('chunk_index', '')}",
                f"    score: {float(citation.get('score', 0.0)):.4f}",
            ]
        )

    return "\n".join(lines)


def print_answer(question: str, top_k: int, mode: str, max_chars_per_chunk: int, min_score: float) -> None:
    results = get_results(question, top_k, mode)
    citations = build_citations(results, max_chars_per_chunk)
    answer = build_answer(question, citations, min_score)

    print("Question:")
    print(question)
    print()
    print("Answer:")
    print(answer)
    print()
    print(format_sources(citations))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a conservative citation-aware answer draft from local RAG context."
    )
    parser.add_argument("question", help="User question")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K, help="Number of chunks to retrieve")
    parser.add_argument(
        "--mode",
        choices=["vector", "keyword"],
        default="vector",
        help="Retrieval mode used before answer drafting",
    )
    parser.add_argument(
        "--max-chars-per-chunk",
        type=int,
        default=DEFAULT_MAX_CHARS_PER_CHUNK,
        help="Maximum text length used from each cited chunk",
    )
    parser.add_argument(
        "--min-score",
        type=float,
        default=DEFAULT_MIN_SCORE,
        help="Minimum retrieval score required for a chunk to be used in the answer",
    )
    args = parser.parse_args()

    print_answer(args.question, args.top_k, args.mode, args.max_chars_per_chunk, args.min_score)


if __name__ == "__main__":
    main()
