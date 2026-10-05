import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import io
import json
import unittest
import urllib.error

from llm_answer import AzureOpenAIAnswerGenerator, ChatConfig, build_user_message, parse_model_output

CITATIONS = [
    {"citation_id": 1, "source": "docs/source-policy.md", "title": "Source Policy", "chunk_index": 0, "text": "Prefer official sources."},
    {"citation_id": 2, "source": "docs/editorial-checklist.md", "title": "Checklist", "chunk_index": 1, "text": "Do not upgrade rumors."},
]
CONFIG = ChatConfig(endpoint="https://x.openai.azure.com", api_key="secret", deployment="gpt-5.4-mini")


def fake_response(payload):
    return {"choices": [{"message": {"content": json.dumps(payload, ensure_ascii=False)}}],
            "usage": {"prompt_tokens": 100, "completion_tokens": 20}}


class ParseOutputTest(unittest.TestCase):
    def test_keeps_valid_citations_and_drops_invented_ones(self):
        result = parse_model_output('{"answerable": true, "answer": "优先官方来源 [1][7]", "citations": [1, 9]}', CITATIONS)
        self.assertEqual(result.cited_ids, [1])
        self.assertEqual(result.cited_sources, ["docs/source-policy.md"])
        self.assertEqual(sorted(result.invalid_citations), [7, 9])
        self.assertTrue(result.grounded)

    def test_answer_without_citation_is_not_grounded(self):
        result = parse_model_output('{"answerable": true, "answer": "我觉得是这样", "citations": []}', CITATIONS)
        self.assertFalse(result.grounded)

    def test_refusal(self):
        result = parse_model_output('{"answerable": false, "answer": "资料中没有比特币价格", "citations": []}', CITATIONS)
        self.assertFalse(result.answerable)


class Day32RulesTest(unittest.TestCase):
    def test_answer_language_follows_question(self):
        from llm_answer import answer_language

        self.assertEqual(answer_language("What fields are required?"), "English")
        self.assertEqual(answer_language("新闻数据有哪些必须字段？"), "Chinese (Simplified)")
        self.assertEqual(answer_language("必須フィールドは何ですか？"), "Japanese")
        self.assertIn("Answer language: English", build_user_message("What?", CITATIONS))

    def test_refusal_drops_citations(self):
        result = parse_model_output('{"answerable": false, "answer": "没有天气信息 [1][2]", "citations": [1, 2]}', CITATIONS)
        self.assertEqual(result.cited_ids, [])
        self.assertNotIn("[1]", result.answer)


class GeneratorTest(unittest.TestCase):
    def test_context_is_numbered_and_marked_as_data(self):
        message = build_user_message("Q", CITATIONS)
        self.assertIn("[1] title: Source Policy", message)
        self.assertIn("docs/editorial-checklist.md", message)

    def test_generate_counts_tokens(self):
        calls = []

        def transport(url, body, headers, timeout):
            calls.append(body)
            return fake_response({"answerable": True, "answer": "优先官方来源 [1]", "citations": [1]})

        generator = AzureOpenAIAnswerGenerator(CONFIG, transport)
        result = generator.generate("怎么判断来源？", CITATIONS)
        self.assertTrue(result.grounded)
        self.assertEqual(generator.total_prompt_tokens, 100)
        self.assertEqual(calls[0]["response_format"], {"type": "json_object"})
        self.assertEqual(calls[0]["reasoning_effort"], "low")

    def test_retries_without_reasoning_effort_when_unsupported(self):
        calls = []

        def transport(url, body, headers, timeout):
            calls.append(body)
            if "reasoning_effort" in body:
                raise urllib.error.HTTPError(url, 400, "bad", {}, io.BytesIO(b'{"error": "reasoning_effort not supported"}'))
            return fake_response({"answerable": False, "answer": "资料不足", "citations": []})

        result = AzureOpenAIAnswerGenerator(CONFIG, transport).generate("Q", CITATIONS)
        self.assertEqual(len(calls), 2)
        self.assertFalse(result.answerable)

    def test_no_context_skips_api_call(self):
        def transport(*args):
            raise AssertionError("should not be called")

        result = AzureOpenAIAnswerGenerator(CONFIG, transport).generate("Q", [])
        self.assertFalse(result.answerable)


class EvaluateWithGeneratorTest(unittest.TestCase):
    def run_case(self, case, model_payload):
        from azure_search_retriever import RetrievedChunk
        from evaluate_demo import EvaluationConfig, evaluate_case

        class FakeRetriever:
            name = "fake"

            def retrieve(self, question, top_k, source_types=None):
                return [RetrievedChunk(0.7, "c1", "d1", "docs/source-policy.md", "Source Policy", 0, "Prefer official sources.")]

        generator = AzureOpenAIAnswerGenerator(CONFIG, lambda *a: fake_response(model_payload))
        return evaluate_case(case, FakeRetriever(), EvaluationConfig(generator=generator), "none")

    def test_answerable_case_passes_with_citation(self):
        result = self.run_case({"id": "a", "question": "Q", "expected_sources": ["docs/source-policy.md"]},
                               {"answerable": True, "answer": "官方优先 [1]", "citations": [1]})
        self.assertTrue(result["passed"])
        self.assertTrue(result["cited_expected"])

    def test_no_answer_case_passes_only_when_model_refuses(self):
        refused = self.run_case({"id": "b", "question": "比特币", "expected_sources": []},
                                {"answerable": False, "answer": "资料不足", "citations": []})
        answered = self.run_case({"id": "b", "question": "比特币", "expected_sources": []},
                                 {"answerable": True, "answer": "会涨 [1]", "citations": [1]})
        self.assertTrue(refused["passed"])
        self.assertFalse(answered["passed"])


if __name__ == "__main__":
    unittest.main()
