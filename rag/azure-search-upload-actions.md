# Azure Search Upload Actions

## Purpose

Day 22 prepares Azure AI Search upload action records from vectorized docs, without calling Azure.

Flow:

```text
rag/vectorized_azure_search_docs.jsonl
→ validate content_vector
→ add @search.action
→ rag/azure_search_upload_actions.jsonl
```

## Boundary

Day22 does:

- Validate required Azure Search fields.
- Reject empty or invalid `content_vector`.
- Optionally validate vector dimension.
- Add `@search.action` as `upload` or `mergeOrUpload`.
- Prepare local JSONL action records.

Day22 does not:

- Call Azure AI Search.
- Create or modify the search index.
- Upload production data.
- Fill missing vectors.

## Script

```bash
python3 -B rag/prepare_azure_search_upload_actions.py
```

The script requires `rag/vectorized_azure_search_docs.jsonl`.
If vectorized docs are missing, it stops before writing upload actions.

## Portfolio Summary

```text
Prepared Azure AI Search upload action records from vectorized documents with validation for required fields, non-empty vectors, and vector dimensions before any production upsert.
```

## 面接用説明

```text
Azure AI Search に送る前に、content_vector が空ではないことと必要 field が揃っていることを検証し、upload action を local payload として準備する段階を分けました。
```
