import unittest

from azure_search_retriever import RetrievedChunk
from retrievers import (
    AzureSearchRetrieverContract,
    LocalKeywordRetriever,
    LocalVectorRetriever,
    RetrieverUnavailableError,
    create_local_retriever,
    to_scored_context_items,
)


class RetrieverAbstractionTest(unittest.TestCase):
    def test_local_keyword_retriever_returns_citation_ready_chunks(self):
        results = LocalKeywordRetriever().retrieve("Kimi K3 权重发布有什么风险？", top_k=2)

        self.assertGreaterEqual(len(results), 1)
        self.assertTrue(results[0].source)
        self.assertTrue(results[0].title)
        self.assertTrue(results[0].text)

    def test_local_vector_retriever_returns_citation_ready_chunks(self):
        results = LocalVectorRetriever().retrieve("Agent 安全风险包括什么？", top_k=2)

        self.assertGreaterEqual(len(results), 1)
        self.assertTrue(results[0].source)
        self.assertTrue(results[0].title)
        self.assertTrue(results[0].text)

    def test_to_scored_context_items_preserves_score_and_metadata(self):
        chunk = RetrievedChunk(
            score=0.9,
            id="chunk-1",
            document_id="doc-1",
            source="docs/example.md",
            title="Example",
            chunk_index=0,
            text="Example text",
        )

        items = to_scored_context_items([chunk])

        self.assertEqual(items[0][0], 0.9)
        self.assertEqual(items[0][1]["source"], "docs/example.md")

    def test_azure_contract_uses_fake_query_vector_and_search_client(self):
        captured_payloads = []

        def fake_query_vector_provider(question):
            self.assertEqual(question, "question")
            return [0.1, 0.2]

        def fake_search_client(payload):
            captured_payloads.append(payload)
            return {
                "value": [
                    {
                        "@search.score": 0.88,
                        "id": "chunk-1",
                        "document_id": "doc-1",
                        "source": "docs/example.md",
                        "title": "Example",
                        "chunk_index": 0,
                        "text": "retrieved text",
                    }
                ]
            }

        retriever = AzureSearchRetrieverContract(fake_query_vector_provider, fake_search_client)
        results = retriever.retrieve("question", top_k=3)

        self.assertEqual(captured_payloads[0]["vectorQueries"][0]["k"], 3)
        self.assertEqual(results[0].source, "docs/example.md")

    def test_azure_contract_without_client_does_not_call_azure(self):
        retriever = AzureSearchRetrieverContract(lambda question: [0.1, 0.2])

        with self.assertRaises(RetrieverUnavailableError):
            retriever.retrieve("question", top_k=3)

    def test_unknown_local_retriever_mode_fails(self):
        with self.assertRaises(ValueError):
            create_local_retriever("unknown")


if __name__ == "__main__":
    unittest.main()
