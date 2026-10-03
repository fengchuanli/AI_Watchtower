import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from answer_demo import build_answer
from build_context import DEFAULT_MAX_CHARS_PER_CHUNK, build_citations
from retrievers import Retriever, create_retriever, to_scored_context_items
from source_filters import route_source_types

ROOT = Path(__file__).resolve().parents[2]
EVAL_QUESTIONS_FILE = ROOT / "rag" / "data" / "eval_questions.json"

DEFAULT_TOP_K = 5
DEFAULT_RETRIEVER = "vector"
DEFAULT_MIN_SCORE = 0.08
DEFAULT_INSUFFICIENT_MAX_SCORES = {
    "local-vector": 0.2,
    "local-keyword": 9.0,
    # Azure thresholds are provisional; calibrate them from the printed top_score values.
    # azure-vector: cosine-based @search.score (higher = closer).
    "azure-vector": 0.70,
    # azure-hybrid: RRF fusion score (about 0.01-0.033); not a relevance measure by itself.
    "azure-hybrid": 0.03,
}
# Minimum score for a chunk to be cited in the answer draft, per backend.
DEFAULT_MIN_SCORES = {
    "azure-vector": 0.50,
    "azure-hybrid": 0.01,
}
ROUTING_CHOICES = ("hint", "auto", "none")


@dataclass(frozen=True)
class EvaluationConfig:
    top_k: int = DEFAULT_TOP_K
    min_score: float = DEFAULT_MIN_SCORE
    insufficient_max_score: float = 0.2
    max_chars_per_chunk: int = DEFAULT_MAX_CHARS_PER_CHUNK


@dataclass(frozen=True)
class EvaluationSummary:
    backend: str
    total: int
    passed: int
    failed: int
    pass_rate: float
    source_cases: int
    source_hits: int
    source_hit_rate: float
    insufficient_cases: int
    insufficient_passed: int


def load_eval_questions(path: Path) -> List[Dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_source(source: str) -> str:
    return str(source).strip()


def source_matches(retrieved_source: str, expected_source: str) -> bool:
    retrieved = normalize_source(retrieved_source)
    expected = normalize_source(expected_source)

    return retrieved == expected or retrieved.startswith(f"{expected}#")


def get_retrieved_sources(citations: List[Dict]) -> List[str]:
    sources = []
    for citation in citations:
        source = citation.get("source", "")
        if source and source not in sources:
            sources.append(source)
    return sources


def has_expected_source(retrieved_sources: List[str], expected_sources: List[str]) -> bool:
    for expected_source in expected_sources:
        for retrieved_source in retrieved_sources:
            if source_matches(retrieved_source, expected_source):
                return True
    return False


def first_hit_rank(retrieved_sources: List[str], expected_sources: List[str]) -> Optional[int]:
    """1-based rank of the first retrieved source that matches an expected source."""
    for rank, retrieved_source in enumerate(retrieved_sources, start=1):
        if any(source_matches(retrieved_source, expected) for expected in expected_sources):
            return rank
    return None


def mean_reciprocal_rank(results: List[Dict]) -> float:
    """MRR over answerable cases: rank 1 -> 1.0, rank 2 -> 0.5, rank 3 -> 0.33, not found -> 0."""
    answerable = [r for r in results if r["expected_sources"]]
    if not answerable:
        return 0.0
    return sum(1.0 / r["hit_rank"] if r.get("hit_rank") else 0.0 for r in answerable) / len(answerable)


def has_citation_marker(answer: str) -> bool:
    return bool(re.search(r"\[\d+\]", answer))


def default_insufficient_max_score(retriever: Retriever) -> float:
    return DEFAULT_INSUFFICIENT_MAX_SCORES.get(retriever.name, 0.2)


def resolve_case_source_types(case: Dict, routing: str):
    """hint: use source_types written in eval_questions.json (upper bound).
    auto: guess from the question with route_source_types (realistic).
    none: search every source."""
    if routing == "hint":
        return case.get("source_types")
    if routing == "auto":
        routed = route_source_types(case["question"])
        return list(routed) if routed else None
    if routing == "none":
        return None
    raise ValueError(f"unknown routing: {routing}")


def evaluate_case(case: Dict, retriever: Retriever, config: EvaluationConfig, routing: str = "hint") -> Dict:
    question = case["question"]
    expected_sources = case.get("expected_sources", [])
    source_types = resolve_case_source_types(case, routing)
    retrieved_chunks = retriever.retrieve(question, config.top_k, source_types)
    citations = build_citations(
        to_scored_context_items(retrieved_chunks),
        config.max_chars_per_chunk,
    )
    retrieved_sources = get_retrieved_sources(citations)
    top_score = float(citations[0]["score"]) if citations else 0.0
    answer_min_score = config.insufficient_max_score if not expected_sources else config.min_score
    answer = build_answer(question, citations, answer_min_score)

    if expected_sources:
        source_hit = has_expected_source(retrieved_sources, expected_sources)
        citation_ok = has_citation_marker(answer)
        insufficient_ok = None
        passed = source_hit and citation_ok
        reason = "expected source found and answer contains citation" if passed else "missing expected source or citation"
    else:
        source_hit = None
        insufficient_ok = top_score < config.insufficient_max_score
        citation_ok = not has_citation_marker(answer)
        passed = insufficient_ok and citation_ok
        reason = "insufficient evidence handled conservatively" if passed else "retrieval score too high or answer cited weak evidence"

    return {
        "id": case["id"],
        "category": case.get("category", ""),
        "hit_rank": first_hit_rank(retrieved_sources, expected_sources) if expected_sources else None,
        "backend": retriever.name,
        "question": question,
        "expected_sources": expected_sources,
        "source_types": source_types,
        "retrieved_sources": retrieved_sources,
        "top_score": top_score,
        "answer": answer,
        "source_hit": source_hit,
        "citation_ok": citation_ok,
        "insufficient_ok": insufficient_ok,
        "passed": passed,
        "reason": reason,
    }


def summarize_results(backend: str, results: List[Dict]) -> EvaluationSummary:
    total = len(results)
    passed = sum(1 for result in results if result["passed"])
    source_cases = [result for result in results if result["expected_sources"]]
    source_hits = sum(1 for result in source_cases if result["source_hit"])
    insufficient_cases = [result for result in results if not result["expected_sources"]]
    insufficient_passed = sum(1 for result in insufficient_cases if result["passed"])

    return EvaluationSummary(
        backend=backend,
        total=total,
        passed=passed,
        failed=total - passed,
        pass_rate=(passed / total * 100) if total else 0.0,
        source_cases=len(source_cases),
        source_hits=source_hits,
        source_hit_rate=(source_hits / len(source_cases) * 100) if source_cases else 0.0,
        insufficient_cases=len(insufficient_cases),
        insufficient_passed=insufficient_passed,
    )


def run_evaluation(
    eval_questions: List[Dict],
    retriever: Retriever,
    config: EvaluationConfig,
    routing: str = "hint",
) -> Tuple[List[Dict], EvaluationSummary]:
    results = [evaluate_case(case, retriever, config, routing) for case in eval_questions]
    return results, summarize_results(retriever.name, results)


def print_case_result(result: Dict) -> None:
    status = "PASS" if result["passed"] else "FAIL"
    print(f"{result['id']}: {status}")
    print(f"question: {result['question']}")
    print(f"expected_sources: {result['expected_sources']}")
    print(f"source_types: {result['source_types']}")
    print("retrieved_sources:")
    for source in result["retrieved_sources"]:
        print(f"- {source}")
    print(f"top_score: {result['top_score']:.4f}")
    print(f"source_hit: {result['source_hit']}")
    print(f"citation_ok: {result['citation_ok']}")
    print(f"insufficient_ok: {result['insufficient_ok']}")
    print(f"reason: {result['reason']}")
    print()


def print_summary(summary: EvaluationSummary, insufficient_max_score: float) -> None:
    print("Summary:")
    print(f"Backend: {summary.backend}")
    print(f"Insufficient-evidence threshold: {insufficient_max_score:.4f}")
    print(f"Total: {summary.total}")
    print(f"Passed: {summary.passed}")
    print(f"Failed: {summary.failed}")
    print(f"Evaluation pass rate: {summary.pass_rate:.1f}%")
    print(f"Source hit rate: {summary.source_hit_rate:.1f}%")
    print(f"Insufficient-evidence cases passed: {summary.insufficient_passed}/{summary.insufficient_cases}")


def print_failed_cases(results: List[Dict]) -> None:
    failed_cases = [result for result in results if not result["passed"]]
    if failed_cases:
        print()
        print("Failed cases:")
        for result in failed_cases:
            print(f"- {result['id']}: {result['reason']}")


def print_comparison(summaries: List[EvaluationSummary], mrrs: Optional[List[float]] = None) -> None:
    print("Backend comparison:")
    print("backend | passed | pass_rate | source_hit_rate | MRR | insufficient_evidence")
    print("--- | --- | --- | --- | --- | ---")
    for index, summary in enumerate(summaries):
        mrr = f"{mrrs[index]:.2f}" if mrrs else "-"
        print(
            f"{summary.backend} | {summary.passed}/{summary.total} | "
            f"{summary.pass_rate:.1f}% | {summary.source_hit_rate:.1f}% | {mrr} | "
            f"{summary.insufficient_passed}/{summary.insufficient_cases}"
        )


def print_category_breakdown(results: List[Dict]) -> None:
    categories: Dict[str, List[Dict]] = {}
    for result in results:
        categories.setdefault(result.get("category") or "-", []).append(result)
    print("By category: " + ", ".join(
        f"{name} {sum(r['passed'] for r in items)}/{len(items)}" for name, items in categories.items()
    ))


def print_score_ranges(results: List[Dict]) -> None:
    """Top scores of answerable vs no-answer questions, for calibrating the insufficient-evidence threshold."""
    answerable = [r["top_score"] for r in results if r["expected_sources"]]
    no_answer = [r["top_score"] for r in results if not r["expected_sources"]]
    if answerable and no_answer:
        print(
            f"Top score ranges: answerable {min(answerable):.4f}-{max(answerable):.4f}, "
            f"no-answer {min(no_answer):.4f}-{max(no_answer):.4f}"
        )


def resolve_retriever_names(retriever: str, legacy_mode: Optional[str]) -> List[str]:
    selected = legacy_mode or retriever
    groups = {
        "all": ["vector", "keyword"],
        "azure": ["azure-vector", "azure-hybrid"],
        "compare": ["vector", "keyword", "azure-vector", "azure-hybrid"],
    }
    return groups.get(selected, [selected])


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate one or more retrieval backends with the same RAG cases."
    )
    parser.add_argument(
        "--retriever",
        choices=["vector", "keyword", "azure-vector", "azure-hybrid", "all", "azure", "compare"],
        default=DEFAULT_RETRIEVER,
        help="Backend to evaluate. all = local vector+keyword, azure = azure-vector+azure-hybrid, "
        "compare = all four (azure needs .env loaded).",
    )
    parser.add_argument(
        "--mode",
        choices=["vector", "keyword"],
        default=None,
        help="Backward-compatible alias for --retriever.",
    )
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--min-score", type=float, default=None, help="Override the per-backend citation threshold.")
    parser.add_argument(
        "--routing",
        choices=ROUTING_CHOICES,
        default="hint",
        help="hint = source_types from eval file, auto = guess from question, none = search everything.",
    )
    parser.add_argument("--quiet", action="store_true", help="Print summaries only (no per-question details).")
    parser.add_argument(
        "--insufficient-max-score",
        type=float,
        default=None,
        help="Override the backend-specific threshold for expected-empty cases.",
    )
    args = parser.parse_args()

    eval_questions = load_eval_questions(EVAL_QUESTIONS_FILE)
    retriever_names = resolve_retriever_names(args.retriever, args.mode)
    summaries = []
    mrrs = []

    for index, retriever_name in enumerate(retriever_names):
        retriever = create_retriever(retriever_name)
        insufficient_max_score = (
            args.insufficient_max_score
            if args.insufficient_max_score is not None
            else default_insufficient_max_score(retriever)
        )
        config = EvaluationConfig(
            top_k=args.top_k,
            min_score=args.min_score if args.min_score is not None else DEFAULT_MIN_SCORES.get(retriever.name, DEFAULT_MIN_SCORE),
            insufficient_max_score=insufficient_max_score,
        )
        results, summary = run_evaluation(eval_questions, retriever, config, args.routing)
        summaries.append(summary)
        mrrs.append(mean_reciprocal_rank(results))

        if len(retriever_names) > 1:
            print(f"=== {retriever.name} (routing: {args.routing}) ===")
        if not args.quiet:
            for result in results:
                print_case_result(result)
            print_summary(summary, insufficient_max_score)
        print_category_breakdown(results)
        print_score_ranges(results)
        print(f"MRR: {mrrs[-1]:.2f}")
        print_failed_cases(results)

        if index < len(retriever_names) - 1:
            print()

    if len(summaries) > 1:
        print()
        print_comparison(summaries, mrrs)


if __name__ == "__main__":
    main()
