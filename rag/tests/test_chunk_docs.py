import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import unittest

from chunk_docs import chunk_document, split_markdown_doc

DOC = "# News Data Format\n\nIntro line.\n\n## Required Fields\n\n" + "\n".join(f"- `field{i}`: description {i} " + "x" * 60 for i in range(40)) + "\n\n## Validation\n\nRun the validator."


class HeadingAwareChunkingTest(unittest.TestCase):
    def test_every_piece_keeps_its_section_label(self):
        chunks = split_markdown_doc("News Data Format", DOC, limit=600)
        required = [text for heading, text in chunks if heading == "Required Fields"]
        self.assertGreater(len(required), 1)
        for text in required:
            self.assertTrue(text.startswith("【News Data Format › Required Fields】"))

    def test_pieces_stay_under_limit_and_lose_no_lines(self):
        chunks = split_markdown_doc("News Data Format", DOC, limit=600)
        self.assertTrue(all(len(text) <= 600 for _, text in chunks))
        joined = "\n".join(text for _, text in chunks)
        for i in range(40):
            self.assertIn(f"`field{i}`", joined)

    def test_sections_do_not_mix(self):
        chunks = split_markdown_doc("News Data Format", DOC, limit=600)
        validation = [text for heading, text in chunks if heading == "Validation"]
        self.assertEqual(len(validation), 1)
        self.assertNotIn("field", validation[0])

    def test_news_items_keep_fixed_size_splitting(self):
        news = {"source": "data/news.json#x", "title": "t", "text": "a" * 1000}
        self.assertTrue(all(heading == "" for heading, _ in chunk_document(news)))


if __name__ == "__main__":
    unittest.main()
