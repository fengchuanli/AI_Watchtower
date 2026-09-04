import unittest

from azure_search_retriever import build_vector_search_payload, normalize_azure_search_results


class AzureSearchRetrieverTest(unittest.TestCase):
    def test_builds_current_vector_query_payload_shape(self):
        payload = build_vector_search_payload(
            [0.1, 0.2],
            top_k=3,
            vector_field="content_vector",
            filter_expression="source_type eq 'docs'",
        )

        self.assertEqual(payload["top"], 3)
        self.assertEqual(payload["filter"], "source_type eq 'docs'")
        self.assertEqual(payload["vectorQueries"][0]["kind"], "vector")
        self.assertEqual(payload["vectorQueries"][0]["vector"], [0.1, 0.2])
        self.assertEqual(payload["vectorQueries"][0]["fields"], "content_vector")
        self.assertEqual(payload["vectorQueries"][0]["k"], 3)

    def test_rejects_empty_query_vector(self):
        with self.assertRaises(ValueError):
            build_vector_search_payload([])

    def test_normalizes_azure_search_response_to_context_items(self):
        response = {
            "value": [
                {
                    "@search.score": 0.88,
                    "id": "chunk-1",
                    "document_id": "doc-1",
                    "source": "docs/example.md",
                    "title": "Example",
                    "chunk_index": 0,
                    "text": "retrieved text",
                    "source_type": "docs",
                    "heading": "Example",
                    "published_at": None,
                }
            ]
        }

        results = normalize_azure_search_results(response)

        self.assertEqual(results[0].to_context_item()["score"], 0.88)
        self.assertEqual(results[0].to_context_item()["source"], "docs/example.md")
        self.assertEqual(results[0].to_context_item()["chunk_index"], 0)


if __name__ == "__main__":
    unittest.main()
