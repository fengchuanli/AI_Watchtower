import argparse
import os
import sys
from typing import Dict, List

from embedding_providers import (
    AzureOpenAIEmbeddingConfig,
    AzureOpenAIEmbeddingProvider,
    EmbeddingConfigurationError,
    EmbeddingProviderError,
    REQUIRED_ENV_KEYS,
    provider_summary,
)


DEFAULT_TEXT = "AI Watchtower helps Chinese readers understand AI news with source citations."

def read_environment() -> Dict[str, str]:
    return {key: os.getenv(key, "").strip() for key in REQUIRED_ENV_KEYS}


def missing_environment(env: Dict[str, str]) -> List[str]:
    missing = [key for key in REQUIRED_ENV_KEYS if not env.get(key)]
    endpoint = env.get("AZURE_OPENAI_ENDPOINT", "")
    if endpoint and not endpoint.startswith("https://"):
        missing.append("AZURE_OPENAI_ENDPOINT must start with https://")
    return missing


def build_placeholder_path(env: Dict[str, str]) -> str:
    deployment_value = env.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "")
    deployment = deployment_value if deployment_value else "<deployment>"
    api_version = env.get("AZURE_OPENAI_API_VERSION", "") or "<api-version>"
    return f"<endpoint>/openai/deployments/{deployment}/embeddings?api-version={api_version}"


def print_environment_summary(env: Dict[str, str]) -> None:
    print("Azure OpenAI Embedding smoke test")
    for key in REQUIRED_ENV_KEYS:
        if key == "AZURE_OPENAI_API_KEY":
            print(f"- {key}: {'set' if env.get(key) else 'missing'}")
        else:
            print(f"- {key}: {env.get(key) or 'missing'}")


def print_request_shape(path: str, text: str) -> None:
    print()
    print("Request shape")
    print(f"- method: POST")
    print(f"- path: {path}")
    print("- headers: Content-Type + api-key (not printed)")
    print(f"- input text length: {len(text)} characters")


def validate_text(text: str) -> None:
    if not text.strip():
        raise ValueError("input text is empty")


def run(args: argparse.Namespace) -> int:
    env = read_environment()
    text = args.text.strip()
    validate_text(text)

    print_environment_summary(env)
    print_request_shape(build_placeholder_path(env), text)

    issues = missing_environment(env)
    if issues:
        print()
        print("Configuration: not ready")
        for issue in issues:
            print(f"- {issue}")
        if args.dry_run:
            print()
            print("Dry run complete: no Azure request was sent.")
            return 0
        return 1

    if args.dry_run:
        print()
        config = AzureOpenAIEmbeddingConfig.from_env(
            env,
            timeout=args.timeout,
            expected_dimension=args.expected_dimension,
        )
        provider = AzureOpenAIEmbeddingProvider(config)
        summary = provider_summary(provider)
        print("Provider")
        print(f"- name: {summary['provider']}")
        print(f"- request path: {summary['request_path']}")
        print(f"- timeout: {summary['timeout']}")
        print(f"- expected dimension: {summary['expected_dimension']}")
        print(f"- API key printed: {'yes' if summary['api_key_printed'] else 'no'}")
        print()
        print("Dry run complete: provider configuration is present, but no Azure request was sent.")
        return 0

    try:
        config = AzureOpenAIEmbeddingConfig.from_env(
            env,
            timeout=args.timeout,
            expected_dimension=args.expected_dimension,
        )
        provider = AzureOpenAIEmbeddingProvider(config)
        embedding = provider.embed_text(text)
    except (EmbeddingConfigurationError, EmbeddingProviderError) as error:
        print()
        print("Smoke test failed")
        print(str(error))
        return 1

    dimension = len(embedding)
    print()
    print("Smoke test passed")
    print("- embedding type: list[float]")
    print(f"- vector dimension: {dimension}")
    print(f"- preview values: {[round(value, 6) for value in embedding[:3]]}")
    print("- API key printed: no")

    if args.expected_dimension is not None and dimension != args.expected_dimension:
        print()
        print("Dimension check failed")
        print(f"- expected: {args.expected_dimension}")
        print(f"- actual: {dimension}")
        return 1

    if args.expected_dimension is not None:
        print(f"- expected dimension check: passed ({args.expected_dimension})")

    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Send one text to Azure OpenAI Embedding and verify that the response is a vector."
    )
    parser.add_argument(
        "--text",
        default=DEFAULT_TEXT,
        help="Short text used for the one-text embedding smoke test.",
    )
    parser.add_argument(
        "--expected-dimension",
        type=int,
        default=None,
        help="Optional vector dimension check after the API returns an embedding.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=20.0,
        help="HTTP timeout in seconds.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print configuration and request shape without sending an Azure request.",
    )
    args = parser.parse_args()

    try:
        exit_code = run(args)
    except ValueError as error:
        print(f"Input error: {error}", file=sys.stderr)
        exit_code = 1
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
