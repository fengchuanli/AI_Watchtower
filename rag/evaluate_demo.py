import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from answer_demo import build_answer
from build_context import DEFAULT_MAX_CHARS_PER_CHUNK, build_citations
from retrievers import Retriever, create_local_retriever, to_scored_context_items

ROOT = Path(__file__).resolve().parents[1]
EVAL_QUESTIONS_FILE = ROOT / "rag" / "eval_questions.json"

DEFAULT_TOP_K = 5
DEFAULT_RETRIEVER = "vector"
DEFAULT_MIN_SCORE = 0.08
DEFAULT_INSUFFICIENT_MAX_SCORES = {
    "local-vector": 0.2,
    "local-keyword": 9.0,
}


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


def has_citation_marker(answer: str) -> bool:
    return bool(re.search(r"\[\d+\]", answer))


def default_insufficient_max_score(retriever: Retriever) -> float:
    return DEFAULT_INSUFFICIENT_MAX_SCORES.get(retriever.name, 0.2)


def evaluate_case(case: Dict, retriever: Retriever, config: EvaluationConfig) -> Dict:
    question = case["question"]
    expected_sources = case.get("expected_sources", [])
    retrieved_chunks = retriever.retrieve(question, config.top_k)
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
        "backend": retriever.name,
        "question": question,
        "expected_sources": expected_sources,
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
) -> Tuple[List[Dict], EvaluationSummary]:
    results = [evaluate_case(case, retriever, config) for case in eval_questions]
    return results, summarize_results(retriever.name, results)


def print_case_result(result: Dict) -> None:
    status = "PASS" if result["passed"] else "FAIL"
    print(f"{result['id']}: {status}")
    print(f"question: {result['question']}")
    print(f"expected_sources: {result['expected_sources']}")
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


def print_comparison(summaries: List[EvaluationSummary]) -> None:
    print("Backend comparison:")
    print("backend | passed | pass_rate | source_hit_rate | insufficient_evidence")
    print("--- | --- | --- | --- | ---")
    for summary in summaries:
        print(
            f"{summary.backend} | {summary.passed}/{summary.total} | "
            f"{summary.pass_rate:.1f}% | {summary.source_hit_rate:.1f}% | "
            f"{summary.insufficient_passed}/{summary.insufficient_cases}"
        )


def resolve_retriever_names(retriever: str, legacy_mode: Optional[str]) -> List[str]:
    selected = legacy_mode or retriever
    return ["vector", "keyword"] if selected == "all" else [selected]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate one or more retrieval backends with the same RAG cases."
    )
    parser.add_argument(
        "--retriever",
        choices=["vector", "keyword", "all"],
        default=DEFAULT_RETRIEVER,
        help="Retriever backend to evaluate; use all for a comparison.",
    )
    parser.add_argument(
        "--mode",
        choices=["vector", "keyword"],
        default=None,
        help="Backward-compatible alias for --retriever.",
    )
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--min-score", type=float, default=DEFAULT_MIN_SCORE)
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

    for index, retriever_name in enumerate(retriever_names):
        retriever = create_local_retriever(retriever_name)
        insufficient_max_score = (
            args.insufficient_max_score
            if args.insufficient_max_score is not None
            else default_insufficient_max_score(retriever)
        )
        config = EvaluationConfig(
            top_k=args.top_k,
            min_score=args.min_score,
            insufficient_max_score=insufficient_max_score,
        )
        results, summary = run_evaluation(eval_questions, retriever, config)
        summaries.append(summary)

        if len(retriever_names) > 1:
            print(f"=== {retriever.name} ===")
        for result in results:
            print_case_result(result)
        print_summary(summary, insufficient_max_score)
        print_failed_cases(results)

        if index < len(retriever_names) - 1:
            print()

    if len(summaries) > 1:
        print()
        print_comparison(summaries)


if __name__ == "__main__":
    main()
