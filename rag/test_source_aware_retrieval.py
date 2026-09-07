import unittest

from retrievers import AzureSearchRetrieverContract, LocalKeywordRetriever, LocalVectorRetriever
from source_filters import (
    build_source_type_filter,
    combine_filter_expressions,
    expand_query_for_source_types,
    infer_source_type,
    normalize_source_types,
)


class SourceFilterTest(unittest.TestCase):
    def test_infers_supported_source_types(self):
        self.assertEqual(infer_source_type("docs/source-policy.md"), "docs")
        self.assertEqual(infer_source_type("data/news.json#item"), "current_news")
        self.assertEqual(infer_source_type("data/news-history.json#item"), "history_news")
        self.assertEqual(infer_source_type("other/file.txt"), "unknown")

    def test_normalizes_and_validates_source_types(self):
        self.assertEqual(normalize_source_types(["docs", "docs", "current_news"]), ("docs", "current_news"))
        with self.assertRaises(ValueError):
            normalize_source_types([])
        with self.assertRaises(ValueError):
            normalize_source_types(["unknown"])

    def test_builds_and_combines_azure_filter_expressions(self):
        source_filter = build_source_type_filter(["docs", "current_news"])
        self.assertEqual(
            source_filter,
            "(source_type eq 'docs' or source_type eq 'current_news')",
        )
        self.assertEqual(
            combine_filter_expressions("document_type eq 'markdown'", source_filter),
            "(document_type eq 'markdown') and ((source_type eq 'docs' or source_type eq 'current_news'))",
        )

    def test_docs_query_expansion_is_source_aware(self):
        expanded = expand_query_for_source_types("新闻数据有哪些必须字段？", ["docs"])
        self.assertIn("news data format", expanded)
        self.assertIn("required fields", expanded)
        self.assertEqual(
            expand_query_for_source_types("新闻数据有哪些必须字段？", ["current_news"]),
            "新闻数据有哪些必须字段？",
        )


class LocalSourceAwareRetrievalTest(unittest.TestCase):
    def test_vector_docs_filter_reaches_both_expected_documents(self):
        retriever = LocalVectorRetriever()

        source_policy = retriever.retrieve("AI Watchtower 如何判断来源可信度？", 5, ["docs"])
        news_format = retriever.retrieve("新闻数据有哪些必须字段？", 5, ["docs"])

        self.assertIn("docs/source-policy.md", [item.source for item in source_policy])
        self.assertIn("docs/news-data-format.md", [item.source for item in news_format])
        self.assertTrue(all(item.source_type == "docs" for item in source_policy + news_format))

    def test_keyword_filter_excludes_other_source_types(self):
        results = LocalKeywordRetriever().retrieve("新闻数据有哪些必须字段？", 5, ["docs"])

        self.assertTrue(results)
        self.assertTrue(all(item.source_type == "docs" for item in results))

    def test_current_news_filter_keeps_current_news_only(self):
        results = LocalVectorRetriever().retrieve("Agent 安全风险包括什么？", 5, ["current_news"])

        self.assertTrue(results)
        self.assertTrue(all(item.source_type == "current_news" for item in results))

    def test_azure_contract_translates_source_types_to_odata_filter(self):
        payloads = []
        retriever = AzureSearchRetrieverContract(
            query_vector_provider=lambda question: [0.1, 0.2],
            search_client=lambda payload: payloads.append(payload) or {"value": []},
            filter_expression="document_type eq 'markdown'",
        )

        retriever.retrieve("question", 3, ["docs"])

        self.assertEqual(
            payloads[0]["filter"],
            "(document_type eq 'markdown') and (source_type eq 'docs')",
        )


if __name__ == "__main__":
    unittest.main()
