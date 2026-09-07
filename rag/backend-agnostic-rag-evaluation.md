# Backend-agnostic RAG Evaluation

## Goal

Day25 makes retrieval evaluation independent from one concrete search implementation.
The same questions now measure local vector, local keyword, and a future Azure AI Search
retriever through the shared `Retriever` contract.

## Evaluation Contract

Every backend must return citation-ready `RetrievedChunk` objects. The evaluator checks:

- expected source hit
- citation marker presence for grounded answers
- conservative refusal when evidence is expected to be insufficient
- total pass rate and source hit rate

The question set remains in `rag/eval_questions.json`. Replacing the retrieval backend does
not require duplicating the questions or answer checks.

## Score Calibration

Retrieval scores are not directly comparable across implementations. The local vector demo
returns normalized similarity scores, while keyword retrieval returns integer-like term
scores. Day25 therefore records a backend-specific insufficient-evidence threshold:

| Backend | Default threshold |
|---|---:|
| `local-vector` | `0.2` |
| `local-keyword` | `9.0` |

The threshold can be overridden with `--insufficient-max-score`. Source hit rate remains the
more portable cross-backend retrieval metric.

## Commands

Evaluate the current vector baseline:

```bash
python3 -B rag/evaluate_demo.py --retriever vector
```

Compare both local backends with the same cases:

```bash
python3 -B rag/evaluate_demo.py --retriever all
```

The older `--mode vector|keyword` option remains available as a compatibility alias.

## Day25 Baseline

| Backend | Passed | Pass rate | Source hit rate | Insufficient evidence |
|---|---:|---:|---:|---:|
| `local-vector` | 3/5 | 60.0% | 50.0% | 1/1 |
| `local-keyword` | 2/5 | 40.0% | 25.0% | 1/1 |

The comparison exposes retrieval quality; Day25 does not tune ranking. The existing vector
baseline remains 3/5, and the two documentation questions still show why source-aware
filtering and semantic retrieval are needed.

## Day26 Update

After applying explicit source-type filters and local docs query expansion, the same cases
produce:

| Backend | Passed | Pass rate | Source hit rate | Insufficient evidence |
|---|---:|---:|---:|---:|
| `local-vector` | 5/5 | 100.0% | 100.0% | 1/1 |
| `local-keyword` | 3/5 | 60.0% | 50.0% | 1/1 |

The question set now declares only the allowed source category, not the exact answer source.
The expected source remains an independent assertion used after retrieval.

## Azure Migration Point

The evaluator is ready for Azure Search because it depends only on `Retriever`. A real Azure
retriever can be injected into `run_evaluation()` and measured with the unchanged question
set. Day26 remains local quality work. Day27 starts the real Azure migration with Azure
OpenAI embedding smoke validation, batch embedding/cache population, index creation/upload,
and Azure Search retrieval evaluation.

Azure credentials and deployed resources are required starting on Day27, not Day25.

## Portfolio Summary

```text
Refactored RAG evaluation around a backend-agnostic Retriever contract and added comparable
source-hit, citation, and insufficient-evidence metrics for local vector, local keyword, and
future Azure AI Search backends.
```
