import unittest

from azure_search_retriever import RetrievedChunk
from ask_pipeline import run_ask_pipeline


class FakeRetriever:
    name = "fake"

    def retrieve(self, question, top_k, source_types=None):
        self.question = question
        self.top_k = top_k
        self.source_types = source_types
        return [
            RetrievedChunk(
                score=0.9,
                id="chunk-1",
                document_id="doc-1",
                source="docs/example.md",
                title="Example",
                chunk_index=0,
                text="摘要: AI Watchtower uses cited context.",
            )
        ]


class AskPipelineTest(unittest.TestCase):
    def test_pipeline_uses_retriever_output_for_context_answer_and_sources(self):
        retriever = FakeRetriever()

        result = run_ask_pipeline("What is this?", retriever, top_k=1, min_score=0.1)

        self.assertEqual(retriever.question, "What is this?")
        self.assertEqual(retriever.top_k, 1)
        self.assertIsNone(retriever.source_types)
        self.assertEqual(result.retriever_name, "fake")
        self.assertIn("[1]", result.answer)
        self.assertIn("docs/example.md", result.sources)
        self.assertIn("Retrieval mode: fake", result.context)


if __name__ == "__main__":
    unittest.main()
