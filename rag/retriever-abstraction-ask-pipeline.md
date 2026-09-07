# Retriever Abstraction and Ask Pipeline

## Purpose

Day24 turns the existing local RAG scripts into a backend-agnostic ask pipeline.

The goal is not to call Azure today. The goal is to make this boundary true:

```text
Retriever backend
→ citation-ready chunks
→ ContextBuilder
→ AnswerGenerator
```

If the backend is local keyword search, local vector search, or future Azure AI Search, the downstream answer logic should receive the same shape.

## Added Files

```text
rag/retrievers.py
rag/ask_pipeline.py
rag/test_retrievers.py
rag/test_ask_pipeline.py
```

## Retriever Contract

```python
class Retriever:
    name: str

    def retrieve(self, question: str, top_k: int) -> list[RetrievedChunk]:
        ...
```

Every retriever returns citation-ready chunks:

```text
score
id
document_id
source
title
chunk_index
text
source_type
heading
published_at
```

## Current Backends

Implemented local backends:

- `LocalKeywordRetriever`
- `LocalVectorRetriever`

Prepared contract backend:

- `AzureSearchRetrieverContract`

`AzureSearchRetrieverContract` does not call Azure by itself. It requires an injected query vector provider and search client. Without a search client, it raises `RetrieverUnavailableError`.

## Ask Pipeline

```text
question
→ Retriever.retrieve()
→ build_citations()
→ build_context_text()
→ build_answer()
→ sources
```

Run local pipeline:

```bash
python3 -B rag/ask_pipeline.py "Kimi K3 权重发布有什么风险？" --retriever vector
```

Switch local backend:

```bash
python3 -B rag/ask_pipeline.py "AI Watchtower 如何判断来源可信度？" --retriever keyword
```

## Boundary

Day24 does:

- Define a shared retriever interface.
- Wrap existing local keyword retrieval.
- Wrap existing local vector retrieval.
- Keep Azure Search as an injected contract, not a live network call.
- Reuse existing context and answer code.

Day24 does not:

- Call Azure OpenAI.
- Call Azure AI Search.
- Replace the local evaluation baseline.
- Add a real query embedding provider.

## Portfolio Summary

```text
Built a backend-agnostic retrieval interface and end-to-end ask pipeline so local keyword, local vector, and future Azure Search retrieval can feed the same citation-aware context and answer generation flow.
```

## 面接用説明

```text
local retrieval と Azure Search retrieval を同じ Retriever interface に揃え、回答生成側は backend に依存しない構成にしました。
```

```text
Retriever は citation-ready chunk を返し、ContextBuilder と AnswerGenerator は backend の違いを意識せずに再利用できるようにしています。
```
