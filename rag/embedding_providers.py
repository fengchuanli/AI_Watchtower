import json
import socket
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional, Sequence, Union


REQUIRED_ENV_KEYS = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    "AZURE_OPENAI_API_VERSION",
]

EmbeddingTransport = Callable[[str, Dict[str, Any], Dict[str, str], float], Dict[str, Any]]


class EmbeddingProviderError(Exception):
    """Base error for embedding provider failures."""


class EmbeddingConfigurationError(EmbeddingProviderError):
    """Raised when provider configuration is missing or invalid."""


class EmbeddingRequestError(EmbeddingProviderError):
    """Raised when the provider request fails."""


class EmbeddingResponseError(EmbeddingProviderError):
    """Raised when the provider response cannot be used as an embedding."""


class EmbeddingDimensionError(EmbeddingResponseError):
    """Raised when the embedding dimension does not match the expected schema."""


class EmbeddingProvider:
    def embed_text(self, text: str) -> List[float]:
        raise NotImplementedError

    def embed_batch(self, texts: Sequence[str]) -> List[List[float]]:
        return [self.embed_text(text) for text in texts]


@dataclass(frozen=True)
class AzureOpenAIEmbeddingConfig:
    endpoint: str
    api_key: str
    deployment: str
    api_version: str
    timeout: float = 20.0
    expected_dimension: Optional[int] = None

    @classmethod
    def from_env(
        cls,
        env: Dict[str, str],
        timeout: float = 20.0,
        expected_dimension: Optional[int] = None,
    ) -> "AzureOpenAIEmbeddingConfig":
        missing = [key for key in REQUIRED_ENV_KEYS if not env.get(key, "").strip()]
        if missing:
            raise EmbeddingConfigurationError("Missing Azure OpenAI environment variables: " + ", ".join(missing))

        endpoint = env["AZURE_OPENAI_ENDPOINT"].strip().rstrip("/")
        if not endpoint.startswith("https://"):
            raise EmbeddingConfigurationError("AZURE_OPENAI_ENDPOINT must start with https://")

        return cls(
            endpoint=endpoint,
            api_key=env["AZURE_OPENAI_API_KEY"].strip(),
            deployment=env["AZURE_OPENAI_EMBEDDING_DEPLOYMENT"].strip(),
            api_version=env["AZURE_OPENAI_API_VERSION"].strip(),
            timeout=timeout,
            expected_dimension=expected_dimension,
        )

    def embeddings_url(self) -> str:
        deployment = urllib.parse.quote(self.deployment, safe="")
        query = urllib.parse.urlencode({"api-version": self.api_version})
        return f"{self.endpoint}/openai/deployments/{deployment}/embeddings?{query}"

    def safe_request_path(self) -> str:
        parsed = urllib.parse.urlparse(self.embeddings_url())
        return urllib.parse.urlunparse(("", "", parsed.path, "", parsed.query, ""))


def default_embedding_transport(
    url: str,
    payload: Dict[str, Any],
    headers: Dict[str, str],
    timeout: float,
) -> Dict[str, Any]:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(url, data=body, method="POST", headers=headers)

    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw_body = response.read().decode("utf-8")
    return json.loads(raw_body)


def redact_secret(text: str, secret: str) -> str:
    if secret:
        return text.replace(secret, "[REDACTED_API_KEY]")
    return text


def _validate_text(text: str) -> str:
    stripped = text.strip()
    if not stripped:
        raise EmbeddingResponseError("input text is empty")
    return stripped


def _validate_embedding_values(embedding: Any, index_label: Union[int, str]) -> List[float]:
    if not isinstance(embedding, list) or not embedding:
        raise EmbeddingResponseError(f"embedding at {index_label} is missing or empty")

    invalid_values = [
        index for index, value in enumerate(embedding) if isinstance(value, bool) or not isinstance(value, (int, float))
    ]
    if invalid_values:
        raise EmbeddingResponseError(f"embedding at {index_label} contains a non-number at index {invalid_values[0]}")

    return [float(value) for value in embedding]


def extract_embeddings(response: Dict[str, Any], expected_count: int) -> List[List[float]]:
    data = response.get("data")
    if not isinstance(data, list) or len(data) != expected_count:
        raise EmbeddingResponseError(
            f"response.data count mismatch: expected {expected_count}, got {len(data) if isinstance(data, list) else 'missing'}"
        )

    if all(isinstance(item, dict) and isinstance(item.get("index"), int) for item in data):
        ordered_items = sorted(data, key=lambda item: item["index"])
    else:
        ordered_items = data

    embeddings = []
    for position, item in enumerate(ordered_items):
        if not isinstance(item, dict):
            raise EmbeddingResponseError(f"response.data[{position}] is not an object")
        embeddings.append(_validate_embedding_values(item.get("embedding"), position))
    return embeddings


def _check_expected_dimension(embedding: List[float], expected_dimension: Optional[int]) -> None:
    if expected_dimension is None:
        return

    actual_dimension = len(embedding)
    if actual_dimension != expected_dimension:
        raise EmbeddingDimensionError(
            f"embedding dimension mismatch: expected {expected_dimension}, got {actual_dimension}"
        )


def _explain_http_error(error: urllib.error.HTTPError, api_key: str) -> str:
    raw_body = error.read().decode("utf-8", errors="replace")
    body = redact_secret(raw_body, api_key)[:700]
    hints = {
        400: "Check the API version, deployment type, and request body.",
        401: "Check the API key. Do not print it while debugging.",
        403: "Check resource permissions and network access policy.",
        404: "Check the endpoint URL and Azure deployment name.",
        408: "Retry later with a short retry limit.",
        429: "Rate limited. Reduce concurrency or wait before retrying.",
    }
    hint = hints.get(error.code, "Check Azure OpenAI service status and request configuration.")
    return f"HTTP {error.code}: {hint}\nResponse body: {body}"


class AzureOpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(
        self,
        config: AzureOpenAIEmbeddingConfig,
        transport: EmbeddingTransport = default_embedding_transport,
    ) -> None:
        self.config = config
        self.transport = transport

    def embed_text(self, text: str) -> List[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: Sequence[str]) -> List[List[float]]:
        clean_texts = [_validate_text(text) for text in texts]
        if not clean_texts:
            raise EmbeddingResponseError("input texts are empty")

        response = self._request_embeddings(clean_texts[0] if len(clean_texts) == 1 else clean_texts)
        embeddings = extract_embeddings(response, expected_count=len(clean_texts))

        for embedding in embeddings:
            _check_expected_dimension(embedding, self.config.expected_dimension)
        return embeddings

    def _request_embeddings(self, input_value: Union[str, List[str]]) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "api-key": self.config.api_key,
        }
        try:
            return self.transport(
                self.config.embeddings_url(),
                {"input": input_value},
                headers,
                self.config.timeout,
            )
        except urllib.error.HTTPError as error:
            raise EmbeddingRequestError(_explain_http_error(error, self.config.api_key)) from error
        except (urllib.error.URLError, TimeoutError, socket.timeout) as error:
            message = redact_secret(str(error), self.config.api_key)
            raise EmbeddingRequestError(f"Network or timeout error: {message}") from error
        except json.JSONDecodeError as error:
            raise EmbeddingResponseError(f"Response was not valid JSON: {error}") from error


def provider_summary(provider: AzureOpenAIEmbeddingProvider) -> Dict[str, Any]:
    return {
        "provider": "AzureOpenAIEmbeddingProvider",
        "request_path": provider.config.safe_request_path(),
        "timeout": provider.config.timeout,
        "expected_dimension": provider.config.expected_dimension,
        "api_key_printed": False,
    }
