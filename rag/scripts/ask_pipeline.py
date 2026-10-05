import argparse
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional

from answer_demo import DEFAULT_MIN_SCORE, build_answer, format_sources
from build_context import DEFAULT_MAX_CHARS_PER_CHUNK, DEFAULT_TOP_K, build_citations, build_context_text
from retrievers import Retriever, create_local_retriever, create_retriever, to_scored_context_items


@dataclass
class AskPipelineResult:
    question: str
    retriever_name: str
    citations: List[Dict]
    context: str
    answer: str
    sources: str


def run_ask_pipeline(
    question: str,
    retriever: Retriever,
    top_k: int = DEFAULT_TOP_K,
    max_chars_per_chunk: int = DEFAULT_MAX_CHARS_PER_CHUNK,
    min_score: float = DEFAULT_MIN_SCORE,
    source_types: Optional[Iterable[str]] = None,
    generator=None,
) -> AskPipelineResult:
    retrieved_chunks = retriever.retrieve(question, top_k, source_types)
    citations = build_citations(to_scored_context_items(retrieved_chunks), max_chars_per_chunk)
    context = build_context_text(question, citations, retriever.name)
    if generator is None:
        answer = build_answer(question, citations, min_score)
        sources = format_sources(citations)
    else:
        from llm_answer import format_grounded_answer

        grounded = generator.generate(question, citations)
        answer = format_grounded_answer(grounded, citations)
        sources = f"(retrieved {len(citations)} chunks; tokens in/out: {grounded.prompt_tokens}/{grounded.completion_tokens})"
    return AskPipelineResult(
        question=question,
        retriever_name=retriever.name,
        citations=citations,
        context=context,
        answer=answer,
        sources=sources,
    )


def print_pipeline_result(result: AskPipelineResult, include_context: bool) -> None:
    print("Question:")
    print(result.question)
    print()
    print("Retriever:")
    print(result.retriever_name)
    print()
    print("Answer:")
    print(result.answer)
    print()
    print(result.sources)

    if include_context:
        print()
        print(result.context)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the backend-agnostic RAG ask pipeline with a local retriever."
    )
    parser.add_argument("question", help="User question")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--max-chars-per-chunk", type=int, default=DEFAULT_MAX_CHARS_PER_CHUNK)
    parser.add_argument("--min-score", type=float, default=DEFAULT_MIN_SCORE)
    parser.add_argument(
        "--retriever",
        choices=["vector", "keyword", "azure-vector", "azure-hybrid"],
        default="vector",
        help="Retrieval backend (azure-* need .env loaded).",
    )
    parser.add_argument(
        "--generator",
        choices=["template", "azure"],
        default="template",
        help="template = local rule-based draft, azure = Azure OpenAI chat model (grounded, with citations).",
    )
    parser.add_argument("--include-context", action="store_true")
    parser.add_argument(
        "--source-type",
        action="append",
        choices=["docs", "current_news", "history_news"],
        dest="source_types",
        help="Limit retrieval to one or more source types. Repeat the option to include multiple types.",
    )
    args = parser.parse_args()

    result = run_ask_pipeline(
        question=args.question,
        retriever=create_retriever(args.retriever),
        top_k=args.top_k,
        max_chars_per_chunk=args.max_chars_per_chunk,
        min_score=args.min_score,
        source_types=args.source_types,
        generator=None if args.generator == "template" else __import__("llm_answer").create_answer_generator(),
    )
    print_pipeline_result(result, include_context=args.include_context)


if __name__ == "__main__":
    main()
