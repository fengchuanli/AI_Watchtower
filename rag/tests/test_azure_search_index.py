import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import unittest

from azure_search_index import VECTOR_DIMENSIONS, build_index_definition


class AzureSearchIndexDefinitionTest(unittest.TestCase):
    def setUp(self):
        self.definition = build_index_definition("test-index")
        self.fields = {f["name"]: f for f in self.definition["fields"]}

    def test_schema_matches_upload_payload_fields(self):
        expected = {
            "id", "document_id", "source", "title", "chunk_index", "text",
            "content_vector", "source_type", "heading", "published_at", "document_type",
        }
        self.assertEqual(set(self.fields), expected)

    def test_id_is_the_only_key(self):
        keys = [name for name, f in self.fields.items() if f.get("key")]
        self.assertEqual(keys, ["id"])

    def test_vector_field_uses_embedding_dimensions_and_profile(self):
        vector = self.fields["content_vector"]
        self.assertEqual(vector["dimensions"], VECTOR_DIMENSIONS)
        profiles = {p["name"] for p in self.definition["vectorSearch"]["profiles"]}
        self.assertIn(vector["vectorSearchProfile"], profiles)

    def test_citation_fields_are_retrievable(self):
        for name in ["source", "title", "document_id", "chunk_index", "text"]:
            self.assertTrue(self.fields[name]["retrievable"], name)

    def test_filter_fields(self):
        for name in ["source_type", "published_at", "document_type"]:
            self.assertTrue(self.fields[name]["filterable"], name)


if __name__ == "__main__":
    unittest.main()
