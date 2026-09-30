import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import unittest

from evaluate_demo import resolve_case_source_types, resolve_retriever_names
from retrievers import AzureSearchRetrieverContract
from source_filters import route_source_types


class RouteSourceTypesTest(unittest.TestCase):
    def test_rule_questions_go_to_docs(self):
        self.assertEqual(route_source_types("AI Watchtower 如何判断来源可信度？"), ("docs",))
        self.assertEqual(route_source_types("新闻数据有哪些必须字段"), ("docs",))

    def test_news_questions_go_to_news(self):
        self.assertEqual(route_source_types("Kimi K3 权重发布有什么风险？"), ("current_news", "history_news"))

    def test_latest_goes_to_current_news_only(self):
        self.assertEqual(route_source_types("最近有哪些 Agent 安全事件"), ("current_news",))

    def test_unclear_question_searches_everything(self):
        self.assertIsNone(route_source_types("Agent 安全风险包括什么？"))


class ResolveCaseSourceTypesTest(unittest.TestCase):
    case = {"question": "Kimi K3 权重发布有什么风险？", "source_types": ["current_news"]}

    def test_hint_uses_eval_file(self):
        self.assertEqual(resolve_case_source_types(self.case, "hint"), ["current_news"])

    def test_auto_uses_router(self):
        self.assertEqual(resolve_case_source_types(self.case, "auto"), ["current_news", "history_news"])

    def test_none_searches_everything(self):
        self.assertIsNone(resolve_case_source_types(self.case, "none"))

    def test_retriever_groups(self):
        self.assertEqual(resolve_retriever_names("azure", None), ["azure-vector", "azure-hybrid"])
        self.assertEqual(len(resolve_retriever_names("compare", None)), 4)


class AzureHybridPayloadTest(unittest.TestCase):
    def run_contract(self, hybrid):
        captured = {}

        def fake_client(payload):
            captured.update(payload)
            return {"value": []}

        retriever = AzureSearchRetrieverContract(
            query_vector_provider=lambda question: [0.1, 0.2],
            search_client=fake_client,
            hybrid=hybrid,
        )
        retriever.retrieve("来源可信度怎么判断", 3, ["docs"])
        return captured

    def test_vector_only_has_empty_search_text(self):
        self.assertEqual(self.run_contract(False)["search"], "")

    def test_hybrid_uses_question_with_doc_expansion(self):
        payload = self.run_contract(True)
        self.assertIn("来源可信度怎么判断", payload["search"])
        self.assertIn("source policy", payload["search"])
        self.assertEqual(payload["filter"], "source_type eq 'docs'")


if __name__ == "__main__":
    unittest.main()
