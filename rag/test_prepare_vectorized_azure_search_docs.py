import tempfile
import unittest
from pathlib import Path

from embedding_cache import EmbeddingCache
from prepare_vectorized_azure_search_docs import prepare_vectorized_docs, write_jsonl, load_jsonl


class PrepareVectorizedAzureSearchDocsTest(unittest.TestCase):
    def test_fills_content_vector_from_cache(self):
        cache = EmbeddingCache()
        cache.upsert(
            chunk_id="chunk-1",
            text="cached text",
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
            vector=[0.1, 0.2, 0.3],
            now="2026-09-04T00:00:00Z",
        )

        docs, report = prepare_vectorized_docs(
            [{"id": "chunk-1", "text": "cached text", "content_vector": []}],
            cache,
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
            expected_dimension=3,
        )

        self.assertEqual(docs[0]["content_vector"], [0.1, 0.2, 0.3])
        self.assertEqual(report["vectorized_docs"], 1)
        self.assertEqual(report["missing_vectors"], 0)

    def test_missing_cache_keeps_empty_vector_and_reports_missing(self):
        docs, report = prepare_vectorized_docs(
            [{"id": "chunk-1", "text": "not cached", "content_vector": []}],
            EmbeddingCache(),
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
        )

        self.assertEqual(docs[0]["content_vector"], [])
        self.assertEqual(report["vectorized_docs"], 0)
        self.assertEqual(report["missing_vectors"], 1)

    def test_dimension_mismatch_fails(self):
        cache = EmbeddingCache()
        cache.upsert("chunk-1", "cached text", "embedding-v1", "2024-02-01", [0.1, 0.2])

        with self.assertRaises(ValueError):
            prepare_vectorized_docs(
                [{"id": "chunk-1", "text": "cached text", "content_vector": []}],
                cache,
                embedding_deployment="embedding-v1",
                api_version="2024-02-01",
                expected_dimension=3,
            )

    def test_write_jsonl_round_trip(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "vectorized.jsonl"
            self.assertEqual(write_jsonl(path, [{"id": "chunk-1", "content_vector": [1.0]}]), 1)
            loaded = list(load_jsonl(path))

        self.assertEqual(loaded, [{"id": "chunk-1", "content_vector": [1.0]}])


if __name__ == "__main__":
    unittest.main()
