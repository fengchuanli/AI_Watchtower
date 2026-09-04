import unittest

from prepare_azure_search_upload_actions import prepare_upload_actions, validate_vectorized_doc


def sample_doc(vector):
    return {
        "id": "chunk-1",
        "document_id": "doc-1",
        "source": "docs/example.md",
        "title": "Example",
        "chunk_index": 0,
        "text": "cached text",
        "content_vector": vector,
        "source_type": "docs",
        "heading": "Example",
        "document_type": "markdown",
    }


class PrepareAzureSearchUploadActionsTest(unittest.TestCase):
    def test_adds_search_action_after_vector_validation(self):
        actions, report = prepare_upload_actions([sample_doc([0.1, 0.2])], expected_dimension=2)

        self.assertEqual(actions[0]["@search.action"], "upload")
        self.assertEqual(report["total_docs"], 1)
        self.assertEqual(report["vector_dimensions"], [2])

    def test_empty_vector_is_rejected(self):
        with self.assertRaises(Exception):
            validate_vectorized_doc(sample_doc([]))

    def test_dimension_mismatch_is_rejected(self):
        with self.assertRaises(ValueError):
            validate_vectorized_doc(sample_doc([0.1, 0.2]), expected_dimension=3)


if __name__ == "__main__":
    unittest.main()
