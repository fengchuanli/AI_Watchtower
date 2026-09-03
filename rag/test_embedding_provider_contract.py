import io
import unittest
import urllib.error

from embedding_providers import (
    AzureOpenAIEmbeddingConfig,
    AzureOpenAIEmbeddingProvider,
    EmbeddingConfigurationError,
    EmbeddingDimensionError,
    EmbeddingRequestError,
    EmbeddingResponseError,
    extract_embeddings,
)


class AzureOpenAIEmbeddingProviderContractTest(unittest.TestCase):
    def config(self, expected_dimension=None):
        return AzureOpenAIEmbeddingConfig(
            endpoint="https://example.openai.azure.com",
            api_key="secret-api-key",
            deployment="embedding-deployment",
            api_version="2024-02-01",
            timeout=3.0,
            expected_dimension=expected_dimension,
        )

    def test_missing_env_is_configuration_error(self):
        with self.assertRaises(EmbeddingConfigurationError):
            AzureOpenAIEmbeddingConfig.from_env({})

    def test_embed_text_returns_float_vector(self):
        captured_payloads = []

        def fake_transport(url, payload, headers, timeout):
            captured_payloads.append(payload)
            self.assertEqual(headers["api-key"], "secret-api-key")
            return {"data": [{"index": 0, "embedding": [1, 2.5, -0.25]}]}

        provider = AzureOpenAIEmbeddingProvider(self.config(expected_dimension=3), transport=fake_transport)

        self.assertEqual(provider.embed_text("AI Watchtower"), [1.0, 2.5, -0.25])
        self.assertEqual(captured_payloads, [{"input": "AI Watchtower"}])

    def test_embed_batch_preserves_index_order(self):
        def fake_transport(url, payload, headers, timeout):
            self.assertEqual(payload["input"], ["first", "second"])
            return {
                "data": [
                    {"index": 1, "embedding": [0.2, 0.3]},
                    {"index": 0, "embedding": [0.0, 0.1]},
                ]
            }

        provider = AzureOpenAIEmbeddingProvider(self.config(expected_dimension=2), transport=fake_transport)

        self.assertEqual(provider.embed_batch(["first", "second"]), [[0.0, 0.1], [0.2, 0.3]])

    def test_invalid_embedding_value_fails_contract(self):
        with self.assertRaises(EmbeddingResponseError):
            extract_embeddings({"data": [{"embedding": [0.1, "bad"]}]}, expected_count=1)

    def test_dimension_mismatch_fails_contract(self):
        def fake_transport(url, payload, headers, timeout):
            return {"data": [{"index": 0, "embedding": [0.1, 0.2]}]}

        provider = AzureOpenAIEmbeddingProvider(self.config(expected_dimension=3), transport=fake_transport)

        with self.assertRaises(EmbeddingDimensionError):
            provider.embed_text("AI Watchtower")

    def test_http_error_redacts_api_key(self):
        def fake_transport(url, payload, headers, timeout):
            body = io.BytesIO(b'{"error":"secret-api-key is invalid"}')
            raise urllib.error.HTTPError(url, 401, "Unauthorized", {}, body)

        provider = AzureOpenAIEmbeddingProvider(self.config(), transport=fake_transport)

        with self.assertRaises(EmbeddingRequestError) as context:
            provider.embed_text("AI Watchtower")

        message = str(context.exception)
        self.assertIn("[REDACTED_API_KEY]", message)
        self.assertNotIn("secret-api-key", message)


if __name__ == "__main__":
    unittest.main()
