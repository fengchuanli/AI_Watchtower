import argparse
import json
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List


DEFAULT_TEXT = "AI Watchtower helps Chinese readers understand AI news with source citations."

REQUIRED_ENV_KEYS = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    "AZURE_OPENAI_API_VERSION",
]


def read_environment() -> Dict[str, str]:
    return {key: os.getenv(key, "").strip() for key in REQUIRED_ENV_KEYS}


def missing_environment(env: Dict[str, str]) -> List[str]:
    missing = [key for key in REQUIRED_ENV_KEYS if not env.get(key)]
    endpoint = env.get("AZURE_OPENAI_ENDPOINT", "")
    if endpoint and not endpoint.startswith("https://"):
        missing.append("AZURE_OPENAI_ENDPOINT must start with https://")
    return missing


def build_embeddings_url(env: Dict[str, str]) -> str:
    endpoint = env.get("AZURE_OPENAI_ENDPOINT", "").rstrip("/") or "<endpoint>"
    deployment_value = env.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "")
    deployment = urllib.parse.quote(deployment_value, safe="") if deployment_value else "<deployment>"
    api_version = env.get("AZURE_OPENAI_API_VERSION", "") or "<api-version>"
    query = urllib.parse.urlencode({"api-version": api_version})
    return f"{endpoint}/openai/deployments/{deployment}/embeddings?{query}"


def redact_secret(text: str, env: Dict[str, str]) -> str:
    api_key = env.get("AZURE_OPENAI_API_KEY", "")
    if api_key:
        text = text.replace(api_key, "[REDACTED_API_KEY]")
    return text


def print_environment_summary(env: Dict[str, str]) -> None:
    print("Azure OpenAI Embedding smoke test")
    for key in REQUIRED_ENV_KEYS:
        if key == "AZURE_OPENAI_API_KEY":
            print(f"- {key}: {'set' if env.get(key) else 'missing'}")
        else:
            print(f"- {key}: {env.get(key) or 'missing'}")


def print_request_shape(url: str, text: str) -> None:
    parsed = urllib.parse.urlparse(url)
    safe_url = urllib.parse.urlunparse(("", "", parsed.path, "", parsed.query, ""))
    safe_url = safe_url.replace("%3Capi-version%3E", "<api-version>")
    print()
    print("Request shape")
    print(f"- method: POST")
    print(f"- path: {safe_url}")
    print("- headers: Content-Type + api-key (not printed)")
    print(f"- input text length: {len(text)} characters")


def validate_text(text: str) -> None:
    if not text.strip():
        raise ValueError("input text is empty")


def call_embedding_api(env: Dict[str, str], text: str, timeout: float) -> Dict[str, Any]:
    payload = json.dumps({"input": text}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        build_embeddings_url(env),
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "api-key": env["AZURE_OPENAI_API_KEY"],
        },
    )

    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw_body = response.read().decode("utf-8")
    return json.loads(raw_body)


def extract_embedding(response: Dict[str, Any]) -> List[float]:
    data = response.get("data")
    if not isinstance(data, list) or not data:
        raise ValueError("response.data is missing or empty")

    first_item = data[0]
    if not isinstance(first_item, dict):
        raise ValueError("response.data[0] is not an object")

    embedding = first_item.get("embedding")
    if not isinstance(embedding, list) or not embedding:
        raise ValueError("response.data[0].embedding is missing or empty")

    invalid_values = [
        index for index, value in enumerate(embedding) if isinstance(value, bool) or not isinstance(value, (int, float))
    ]
    if invalid_values:
        first_bad_index = invalid_values[0]
        raise ValueError(f"embedding contains a non-number at index {first_bad_index}")

    return [float(value) for value in embedding]


def explain_http_error(error: urllib.error.HTTPError, env: Dict[str, str]) -> str:
    raw_body = error.read().decode("utf-8", errors="replace")
    body = redact_secret(raw_body, env)[:700]
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


def run(args: argparse.Namespace) -> int:
    env = read_environment()
    text = args.text.strip()
    validate_text(text)

    print_environment_summary(env)
    url = build_embeddings_url(env)
    print_request_shape(url, text)

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
        print("Dry run complete: configuration is present, but no Azure request was sent.")
        return 0

    try:
        response = call_embedding_api(env, text, args.timeout)
        embedding = extract_embedding(response)
    except urllib.error.HTTPError as error:
        print()
        print("Smoke test failed")
        print(explain_http_error(error, env))
        return 1
    except (urllib.error.URLError, TimeoutError, socket.timeout) as error:
        print()
        print("Smoke test failed")
        print(f"Network or timeout error: {redact_secret(str(error), env)}")
        return 1
    except json.JSONDecodeError as error:
        print()
        print("Smoke test failed")
        print(f"Response was not valid JSON: {error}")
        return 1
    except ValueError as error:
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
