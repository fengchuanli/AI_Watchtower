import unittest

from azure_search_retriever import RetrievedChunk
from evaluate_demo import (
    EvaluationConfig,
    default_insufficient_max_score,
    resolve_retriever_names,
    run_evaluation,
)
from retrievers import LocalKeywordRetriever, LocalVectorRetriever


class FakeRetriever:
    name = "fake-backend"

    def __init__(self, results_by_question):
        self.results_by_question = results_by_question
        self.calls = []

    def retrieve(self, question, top_k, source_types=None):
        self.calls.append((question, top_k, source_types))
        return self.results_by_question.get(question, [])[:top_k]


def make_chunk(source, score=0.9):
    return RetrievedChunk(
        score=score,
        id=f"chunk-{source}",
        document_id="doc-1",
        source=source,
        title="Example",
        chunk_index=0,
        text="摘要: This is grounded evidence.",
    )


class BackendAgnosticEvaluationTest(unittest.TestCase):
    def setUp(self):
        self.cases = [
            {
                "id": "source-hit",
                "question": "grounded question",
                "expected_sources": ["docs/example.md"],
                "source_types": ["docs"],
            },
            {
                "id": "insufficient",
                "question": "unknown question",
                "expected_sources": [],
            },
        ]

    def test_same_cases_run_through_injected_retriever(self):
        retriever = FakeRetriever(
            {
                "grounded question": [make_chunk("docs/example.md")],
                "unknown question": [make_chunk("docs/weak.md", score=0.1)],
            }
        )

        results, summary = run_evaluation(
            self.cases,
            retriever,
            EvaluationConfig(top_k=3, min_score=0.2, insufficient_max_score=0.2),
        )

        self.assertEqual(
            retriever.calls,
            [("grounded question", 3, ["docs"]), ("unknown question", 3, None)],
        )
        self.assertTrue(results[0]["source_hit"])
        self.assertTrue(results[0]["citation_ok"])
        self.assertTrue(results[1]["insufficient_ok"])
        self.assertTrue(results[1]["citation_ok"])
        self.assertEqual(summary.backend, "fake-backend")
        self.assertEqual(summary.passed, 2)
        self.assertEqual(summary.source_hit_rate, 100.0)
        self.assertEqual(summary.insufficient_passed, 1)

    def test_missing_source_is_reported_independently_of_backend(self):
        retriever = FakeRetriever({"grounded question": [make_chunk("docs/other.md")]})

        results, summary = run_evaluation(
            self.cases[:1],
            retriever,
            EvaluationConfig(),
        )

        self.assertFalse(results[0]["passed"])
        self.assertFalse(results[0]["source_hit"])
        self.assertTrue(results[0]["citation_ok"])
        self.assertEqual(summary.failed, 1)

    def test_local_backends_have_explicit_score_thresholds(self):
        self.assertEqual(default_insufficient_max_score(LocalVectorRetriever()), 0.2)
        self.assertEqual(default_insufficient_max_score(LocalKeywordRetriever()), 9.0)

    def test_all_selects_both_local_backends(self):
        self.assertEqual(resolve_retriever_names("all", None), ["vector", "keyword"])
        self.assertEqual(resolve_retriever_names("vector", "keyword"), ["keyword"])


if __name__ == "__main__":
    unittest.main()
