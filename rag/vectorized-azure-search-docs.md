# Vectorized Azure Search Docs From Cache

## Purpose

Day 21 prepares Azure Search documents whose `content_vector` values are filled from validated local embedding cache records.

Flow:

```text
rag/azure_search_docs.jsonl
+ rag/embedding_cache.jsonl
→ rag/vectorized_azure_search_docs.jsonl
```

## Boundary

Day21 does:

- Read Azure Search payload records.
- Read embedding cache records.
- Match vectors by `chunk_id + text_hash + embedding_deployment + api_version`.
- Fill `content_vector` only when cache has a valid vector.
- Report missing vectors.
- Optionally validate vector dimension.

Day21 does not:

- Call Azure OpenAI.
- Create fake vectors.
- Upload to Azure AI Search.
- Treat missing cache records as success.

## Script

```bash
python3 -B rag/prepare_vectorized_azure_search_docs.py --report-only
```

Current local result:

```text
total docs: 1273
vectorized docs: 0
missing vectors: 1273
output written: no
```

This is correct because no real `rag/embedding_cache.jsonl` exists yet.

## Portfolio Summary

```text
Prepared vectorized Azure Search documents from validated embedding cache records, preventing missing vectors or dimension mismatches from being treated as upload-ready data.
```

## 面接用説明

```text
embedding cache にある検証済み vector だけを Azure Search payload の content_vector に反映し、欠損や dimension mismatch がある場合は upload-ready として扱わないようにしました。
```
