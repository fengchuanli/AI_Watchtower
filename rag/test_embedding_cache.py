import json
import tempfile
import unittest
from pathlib import Path

from embedding_cache import (
    EmbeddingCache,
    EmbeddingCacheRecordError,
    hash_text,
    inspect_chunks,
)


class EmbeddingCacheTest(unittest.TestCase):
    def test_hash_text_is_stable_and_prefixed(self):
        self.assertEqual(hash_text("hello"), hash_text("hello"))
        self.assertTrue(hash_text("hello").startswith("sha256:"))
        self.assertNotEqual(hash_text("hello"), hash_text("hello "))

    def test_cache_hit_miss_and_changed_classification(self):
        cache = EmbeddingCache()
        cache.upsert(
            chunk_id="chunk-1",
            text="original text",
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
            vector=[0.1, 0.2],
            now="2026-09-03T00:00:00Z",
        )

        report = inspect_chunks(
            [
                {"id": "chunk-1", "text": "original text"},
                {"id": "chunk-1", "text": "changed text"},
                {"id": "chunk-2", "text": "new text"},
            ],
            cache,
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
        )

        self.assertEqual(report["total_chunks"], 3)
        self.assertEqual(report["cache_hits"], 1)
        self.assertEqual(report["cache_misses"], 2)
        self.assertEqual(report["changed_chunks"], 1)

    def test_deployment_change_invalidates_cache(self):
        cache = EmbeddingCache()
        cache.upsert(
            chunk_id="chunk-1",
            text="same text",
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
            vector=[0.1],
            now="2026-09-03T00:00:00Z",
        )

        report = inspect_chunks(
            [{"id": "chunk-1", "text": "same text"}],
            cache,
            embedding_deployment="embedding-v2",
            api_version="2024-02-01",
        )

        self.assertEqual(report["cache_hits"], 0)
        self.assertEqual(report["cache_misses"], 1)
        self.assertEqual(report["changed_chunks"], 0)

    def test_write_and_read_round_trip(self):
        cache = EmbeddingCache()
        cache.upsert(
            chunk_id="chunk-1",
            text="cached text",
            embedding_deployment="embedding-v1",
            api_version="2024-02-01",
            vector=[1, 2.5, -0.25],
            now="2026-09-03T00:00:00Z",
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "embedding_cache.jsonl"
            self.assertEqual(cache.write(path), 1)

            loaded = EmbeddingCache.read(path)
            record = loaded.get("chunk-1", "cached text", "embedding-v1", "2024-02-01")

        self.assertIsNotNone(record)
        self.assertEqual(record.vector, [1.0, 2.5, -0.25])

    def test_invalid_record_vector_fails(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "embedding_cache.jsonl"
            path.write_text(
                json.dumps(
                    {
                        "chunk_id": "chunk-1",
                        "text_hash": hash_text("bad"),
                        "embedding_deployment": "embedding-v1",
                        "api_version": "2024-02-01",
                        "vector": [],
                        "created_at": "2026-09-03T00:00:00Z",
                        "updated_at": "2026-09-03T00:00:00Z",
                    }
                )
                + "\n",
                encoding="utf-8",
            )

            with self.assertRaises(EmbeddingCacheRecordError):
                EmbeddingCache.read(path)


if __name__ == "__main__":
    unittest.main()
