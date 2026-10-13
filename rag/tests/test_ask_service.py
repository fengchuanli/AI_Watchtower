import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import json
import unittest

from ask_service import MAX_QUESTION_CHARS, handle_ask, parse_question
from azure_search_retriever import RetrievedChunk
from llm_answer import ChatRequestError, GroundedAnswer


def chunk(n, source, text="Prefer official sources over rumors."):
    return RetrievedChunk(score=0.7, id=f"c{n}", document_id=source, source=source, title=f"T{n}",
                          chunk_index=n, text=text, source_type="docs", heading="Priority")


class FakeRetriever:
    name = "fake"

    def __init__(self, chunks):
        self.chunks = chunks

    def retrieve(self, question, top_k, source_types=None):
        return self.chunks[:top_k]


class FakeGenerator:
    def __init__(self, result=None, error=None):
        self.result, self.error = result, error

    def generate(self, question, citations):
        if self.error:
            raise self.error
        return self.result


def call(body, retriever=None, generator=None):
    return handle_ask(
        body if isinstance(body, bytes) else json.dumps(body).encode("utf-8"),
        retriever_factory=lambda: retriever or FakeRetriever([chunk(1, "docs/a.md"), chunk(2, "docs/b.md")]),
        generator_factory=lambda: generator,
    )


class ParseQuestionTest(unittest.TestCase):
    def test_rejects_bad_input(self):
        for body in (b"", b"not json", b"[1]", b'{"q": "x"}', b'{"question": 3}', b'{"question": "   "}'):
            question, error = parse_question(body)
            self.assertIsNone(question)
            self.assertTrue(error)

    def test_rejects_too_long(self):
        _, error = parse_question(json.dumps({"question": "a" * (MAX_QUESTION_CHARS + 1)}).encode())
        self.assertIn("too long", error)

    def test_normalizes_whitespace(self):
        question, error = parse_question('{"question": "  Kimi  K3\\n风险？ "}'.encode())
        self.assertIsNone(error)
        self.assertEqual(question, "Kimi K3 风险？")


class PublicCitationTest(unittest.TestCase):
    def test_news_snippet_uses_summary_and_drops_duplicate_heading(self):
        from ask_service import public_citation

        c = public_citation({"citation_id": 3, "title": "最新新闻: X 发布", "heading": "最新新闻: X 发布",
                             "text": "标题: X 发布 分类: 研究 发布时间: 2026 摘要: 这是摘要。"})
        self.assertEqual(c["heading"], "")
        self.assertEqual(c["snippet"], "这是摘要。")

    def test_doc_heading_kept(self):
        from ask_service import public_citation

        c = public_citation({"citation_id": 1, "title": "Source Policy", "heading": "Priority", "text": "Official first."})
        self.assertEqual(c["heading"], "Priority")


class HandleAskTest(unittest.TestCase):
    def test_bad_request_does_not_call_backends(self):
        def boom():
            raise AssertionError("should not be called")

        status, body = handle_ask(b"{}", retriever_factory=boom, generator_factory=boom)
        self.assertEqual(status, 400)

    def test_returns_only_cited_sources_with_original_numbers(self):
        grounded = GroundedAnswer(True, "Use official sources.[2]", [2], ["docs/b.md"], prompt_tokens=100, completion_tokens=20)
        status, body = call({"question": "How to judge sources?"}, generator=FakeGenerator(grounded))
        self.assertEqual(status, 200)
        self.assertTrue(body["answerable"])
        self.assertEqual([c["id"] for c in body["citations"]], [2])
        self.assertEqual(body["citations"][0]["source"], "docs/b.md")
        self.assertEqual(body["citations"][0]["heading"], "Priority")
        self.assertNotIn("text", body["citations"][0])
        self.assertEqual(body["usage"], {"prompt_tokens": 100, "completion_tokens": 20})
        self.assertEqual(body["retrieved"], 2)
        self.assertIn("latency_ms", body)

    def test_snippet_is_short(self):
        long_chunk = chunk(1, "docs/a.md", text="x" * 1000)
        grounded = GroundedAnswer(True, "ok [1]", [1], ["docs/a.md"])
        _, body = call({"question": "q"}, retriever=FakeRetriever([long_chunk]), generator=FakeGenerator(grounded))
        self.assertLessEqual(len(body["citations"][0]["snippet"]), 161)

    def test_refusal_has_no_citations(self):
        grounded = GroundedAnswer(False, "资料里没有。", [], [])
        status, body = call({"question": "明天天气？"}, generator=FakeGenerator(grounded))
        self.assertEqual(status, 200)
        self.assertFalse(body["answerable"])
        self.assertEqual(body["citations"], [])

    def test_model_error_returns_502_without_details(self):
        status, body = call({"question": "q"}, generator=FakeGenerator(error=ChatRequestError("HTTP 401: key=secret")))
        self.assertEqual(status, 502)
        self.assertNotIn("secret", json.dumps(body))

    def test_retrieval_error_returns_502(self):
        class Broken:
            def retrieve(self, *args):
                raise OSError("network down")

        status, body = call({"question": "q"}, retriever=Broken(), generator=FakeGenerator())
        self.assertEqual(status, 502)
        self.assertNotIn("network", json.dumps(body))


if __name__ == "__main__":
    unittest.main()
