"""Web-facing /api/ask logic, shared by Azure Functions and the local dev server.

Kept free of any web framework so it can be unit-tested with fakes:
    handle_ask(body_bytes) -> (http_status, json_dict)

Request:  POST {"question": "..."}
Response: {"answerable", "answer", "citations": [...], "usage": {...}, "latency_ms"}
Secrets (API keys) never leave this module; errors return short generic messages.
"""

import json
import logging
import os
import time
from typing import Callable, Dict, List, Optional, Tuple

from build_context import DEFAULT_MAX_CHARS_PER_CHUNK, DEFAULT_TOP_K, build_citations
from retrievers import to_scored_context_items

MAX_QUESTION_CHARS = 300
MAX_BODY_BYTES = 4096
SNIPPET_CHARS = 160

logger = logging.getLogger("ask_service")

_cache: Dict[str, object] = {}


def _default_retriever():
    if "retriever" not in _cache:
        from retrievers import create_retriever

        _cache["retriever"] = create_retriever(os.getenv("ASK_RETRIEVER", "azure-vector"))
    return _cache["retriever"]


def _default_generator():
    if "generator" not in _cache:
        from llm_answer import create_answer_generator

        _cache["generator"] = create_answer_generator()
    return _cache["generator"]


def parse_question(body: bytes) -> Tuple[Optional[str], Optional[str]]:
    """Return (question, error_message)."""
    if not body:
        return None, "Request body is empty. Send JSON like {\"question\": \"...\"}."
    if len(body) > MAX_BODY_BYTES:
        return None, "Request body is too large."
    try:
        data = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "Request body must be JSON."
    if not isinstance(data, dict) or not isinstance(data.get("question"), str):
        return None, "Field \"question\" (string) is required."
    question = " ".join(data["question"].split())
    if not question:
        return None, "Question is empty."
    if len(question) > MAX_QUESTION_CHARS:
        return None, f"Question is too long (max {MAX_QUESTION_CHARS} characters)."
    return question, None


def public_citation(citation: Dict) -> Dict:
    """Only the fields the browser needs; full chunk text stays on the server."""
    text = " ".join(str(citation.get("text", "")).split())
    return {
        "id": int(citation["citation_id"]),
        "title": citation.get("title", ""),
        "source": citation.get("source", ""),
        "source_type": citation.get("source_type", ""),
        "heading": citation.get("heading", ""),
        "published_at": citation.get("published_at"),
        "snippet": text[:SNIPPET_CHARS] + ("…" if len(text) > SNIPPET_CHARS else ""),
    }


def answer_question(question: str, retriever, generator, top_k: int = DEFAULT_TOP_K) -> Dict:
    chunks = retriever.retrieve(question, top_k, None)
    citations = build_citations(to_scored_context_items(chunks), DEFAULT_MAX_CHARS_PER_CHUNK)
    grounded = generator.generate(question, citations)
    by_id = {int(c["citation_id"]): c for c in citations}
    return {
        "question": question,
        "answerable": grounded.answerable,
        "answer": grounded.answer,
        # Keep the original numbers so the [n] markers in the answer still match.
        "citations": [public_citation(by_id[n]) for n in grounded.cited_ids],
        "retrieved": len(citations),
        "usage": {"prompt_tokens": grounded.prompt_tokens, "completion_tokens": grounded.completion_tokens},
    }


def handle_ask(
    body: bytes,
    retriever_factory: Callable = _default_retriever,
    generator_factory: Callable = _default_generator,
) -> Tuple[int, Dict]:
    started = time.monotonic()
    question, error = parse_question(body)
    if error:
        return 400, {"error": error}

    from llm_answer import ChatConfigurationError, ChatRequestError

    try:
        result = answer_question(question, retriever_factory(), generator_factory())
    except ChatConfigurationError:
        logger.exception("ask: server configuration error")
        return 500, {"error": "Server is not configured."}
    except ChatRequestError:
        logger.exception("ask: model request failed")
        return 502, {"error": "The AI model is temporarily unavailable. Please try again."}
    except Exception:  # retrieval/network errors etc.; details go to the server log only
        logger.exception("ask: unexpected error")
        return 502, {"error": "Search is temporarily unavailable. Please try again."}

    result["latency_ms"] = int((time.monotonic() - started) * 1000)
    logger.info(
        "ask ok chars=%d answerable=%s cited=%d tokens=%d/%d latency_ms=%d",
        len(question), result["answerable"], len(result["citations"]),
        result["usage"]["prompt_tokens"], result["usage"]["completion_tokens"], result["latency_ms"],
    )
    return 200, result
