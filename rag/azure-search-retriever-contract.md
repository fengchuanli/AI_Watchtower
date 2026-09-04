# Azure Search Retriever Contract

## Purpose

Day 23 defines the Azure AI Search vector retriever request and response boundary.

The current Azure AI Search REST vector query shape uses `vectorQueries` with:

```text
kind: vector
vector: [...]
fields: content_vector
k: top_k
```

Reference: https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-query

## Boundary

Day23 does:

- Build a vector search request payload.
- Validate query vector shape.
- Support optional filter expression.
- Normalize Azure Search response records into the same context-ready chunk contract used by the local RAG pipeline.

Day23 does not:

- Call Azure AI Search.
- Generate query embeddings.
- Replace the current local retriever.
- Change answer generation.

## Contract

Input:

```text
query_vector: list[float]
top_k: int
optional filter
```

Output:

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

## Portfolio Summary

```text
Defined an Azure AI Search retriever contract that builds vector query payloads and normalizes search results into citation-ready RAG chunks without coupling the answer pipeline to Azure response details.
```

## 面接用説明

```text
Azure AI Search の vector query payload と response normalization を retriever boundary として定義し、回答生成側は Azure の response 形式ではなく、既存の citation-ready chunk 形式だけを扱うようにしました。
```
