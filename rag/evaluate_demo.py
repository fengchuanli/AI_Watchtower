import argparse
import json
import re
from pathlib import Path
from typing import Dict, List

from answer_demo import build_answer
from build_context import DEFAULT_MAX_CHARS_PER_CHUNK, build_citations, get_results

ROOT = Path(__file__).resolve().parents[1]
EVAL_QUESTIONS_FILE = ROOT / "rag" / "eval_questions.json"

DEFAULT_TOP_K = 5
DEFAULT_MODE = "vector"
DEFAULT_MIN_SCORE = 0.08
DEFAULT_INSUFFICIENT_MAX_SCORE = 0.2


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


def evaluate_case(case: Dict, mode: str, top_k: int, min_score: float, insufficient_max_score: float) -> Dict:
    question = case["question"]
    expected_sources = case.get("expected_sources", [])
    results = get_results(question, top_k, mode)
    citations = build_citations(results, DEFAULT_MAX_CHARS_PER_CHUNK)
    retrieved_sources = get_retrieved_sources(citations)
    top_score = float(citations[0]["score"]) if citations else 0.0
    answer_min_score = insufficient_max_score if not expected_sources else min_score
    answer = build_answer(question, citations, answer_min_score)

    if expected_sources:
        source_hit = has_expected_source(retrieved_sources, expected_sources)
        citation_ok = has_citation_marker(answer)
        passed = source_hit and citation_ok
        reason = "expected source found and answer contains citation" if passed else "missing expected source or citation"
    else:
        source_hit = None
        insufficient_ok = top_score < insufficient_max_score
        citation_ok = not has_citation_marker(answer)
        passed = insufficient_ok and citation_ok
        reason = "insufficient evidence handled conservatively" if passed else "retrieval score too high or answer cited weak evidence"

    return {
        "id": case["id"],
        "question": question,
        "expected_sources": expected_sources,
        "retrieved_sources": retrieved_sources,
        "top_score": top_score,
        "answer": answer,
        "source_hit": source_hit,
        "citation_ok": citation_ok,
        "passed": passed,
        "reason": reason,
    }


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
    print(f"reason: {result['reason']}")
    print()


def print_summary(results: List[Dict]) -> None:
    total = len(results)
    passed = sum(1 for result in results if result["passed"])
    failed = total - passed
    pass_rate = (passed / total * 100) if total else 0.0
    source_cases = [result for result in results if result["expected_sources"]]
    source_hits = sum(1 for result in source_cases if result["source_hit"])
    source_hit_rate = (source_hits / len(source_cases) * 100) if source_cases else 0.0
    insufficient_cases = [result for result in results if not result["expected_sources"]]
    insufficient_passed = sum(1 for result in insufficient_cases if result["passed"])

    print("Summary:")
    print(f"Total: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Evaluation pass rate: {pass_rate:.1f}%")
    print(f"Source hit rate: {source_hit_rate:.1f}%")
    print(f"Insufficient-evidence cases passed: {insufficient_passed}/{len(insufficient_cases)}")

    failed_cases = [result for result in results if not result["passed"]]
    if failed_cases:
        print()
        print("Failed cases:")
        for result in failed_cases:
            print(f"- {result['id']}: {result['reason']}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate local RAG retrieval with expected source hit checks."
    )
    parser.add_argument("--mode", choices=["vector", "keyword"], default=DEFAULT_MODE)
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--min-score", type=float, default=DEFAULT_MIN_SCORE)
    parser.add_argument(
        "--insufficient-max-score",
        type=float,
        default=DEFAULT_INSUFFICIENT_MAX_SCORE,
        help="Expected-empty cases pass when the top score is below this threshold.",
    )
    args = parser.parse_args()

    eval_questions = load_eval_questions(EVAL_QUESTIONS_FILE)
    results = [
        evaluate_case(
            case,
            mode=args.mode,
            top_k=args.top_k,
            min_score=args.min_score,
            insufficient_max_score=args.insufficient_max_score,
        )
        for case in eval_questions
    ]

    for result in results:
        print_case_result(result)

    print_summary(results)


if __name__ == "__main__":
    main()
