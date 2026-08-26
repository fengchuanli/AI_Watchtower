# Azure AI Search Index Schema

## Purpose

这个 index 用来保存 AI Watchtower RAG Assistant 的 chunk 级数据，支持后续 Azure AI Search 的文本检索、向量检索、过滤和 citation 追踪。

它不是只保存 `content_vector` 的地方。RAG 回答需要显示依据，所以 index 里必须同时保存：

```text
检索字段
向量字段
过滤字段
citation metadata
```

核心目标：

```text
找到相关 chunk
→ 把 chunk 交给 AnswerGenerator
→ 回答中显示 source/title/document_id/chunk_index
→ 后续可以审计回答依据
```

## Source Data

当前本地数据来自：

```text
rag/chunks.jsonl
```

每个 chunk 当前结构：

```json
{
  "id": "source-policy-0000",
  "document_id": "source-policy",
  "source": "docs/source-policy.md",
  "title": "来源使用规则",
  "chunk_index": 0,
  "text": "..."
}
```

未来会映射成 Azure AI Search document：

```json
{
  "id": "source-policy-0000",
  "document_id": "source-policy",
  "source": "docs/source-policy.md",
  "title": "来源使用规则",
  "chunk_index": 0,
  "text": "...",
  "content_vector": [0.012, -0.034, 0.088],
  "source_type": "docs",
  "heading": "来源使用规则",
  "published_at": null,
  "document_type": "markdown"
}
```

## Fields

| Field | Azure Type | Usage |
|---|---|---|
| `id` | `Edm.String` | chunk 唯一 ID。Azure AI Search document key。 |
| `document_id` | `Edm.String` | 原始 document ID，用于追踪 chunk 来自哪个文档或新闻条目。 |
| `source` | `Edm.String` | citation 来源，例如 `docs/source-policy.md` 或 `data/news.json#...`。 |
| `title` | `Edm.String` | 显示用标题，也可参与文本检索。 |
| `chunk_index` | `Edm.Int32` | chunk 在原始 document 中的顺序。用于 citation 和排查问题。 |
| `text` | `Edm.String` | chunk 正文。用于关键词检索、语义回答依据和 citation。 |
| `content_vector` | `Collection(Edm.Single)` | embedding vector。用于 vector search。 |
| `source_type` | `Edm.String` | 来源类型，例如 `docs`、`current_news`、`history_news`。用于过滤和 boost。 |
| `heading` | `Edm.String` | Markdown heading 或新闻 section 标题。后续 heading-aware chunking 使用。 |
| `published_at` | `Edm.DateTimeOffset` | 新闻发布时间。docs 可以为空。用于按时间过滤新闻。 |
| `document_type` | `Edm.String` | 文档类型，例如 `markdown`、`news_item`。用于过滤不同数据来源。 |

## Field Usage

### Searchable

这些字段用于文本检索：

```text
text
title
heading
```

用途：

- 用户问题和 chunk 正文做文本匹配
- 标题和 heading 帮助 docs 类问题命中正确文档
- 支持 hybrid search 中的 keyword 部分

### Vector Searchable

用于向量检索：

```text
content_vector
```

用途：

- 保存 chunk text 的 embedding
- query embedding 和 chunk embedding 做相似度检索
- 解决关键词检索对表达差异敏感的问题

### Filterable

这些字段用于过滤：

```text
source_type
published_at
document_type
```

用途：

- 只搜 docs
- 只搜 current_news
- 只搜 history_news
- 按发布时间过滤新闻
- docs 类问题避免被 news-history 干扰

### Retrievable / Citation

这些字段必须在检索结果中返回：

```text
source
title
document_id
chunk_index
text
```

用途：

- 构建 `[1] [2]` citation
- 回答中显示来源
- 排查回答依据
- 审计模型是否基于正确资料回答

## Citation Metadata

RAG 的关键不是只找到相关 chunk，还要能说明这个 chunk 来自哪里。

如果 index 只保存：

```text
text
content_vector
```

会出现问题：

- 回答无法显示出处
- 用户无法判断信息来源是否可信
- evaluation 无法检查 expected source
- 线上问题无法追踪回答依据
- 企业场景无法审计

因此，每个 vectorized chunk 必须同时保存：

```text
source
title
document_id
chunk_index
text
```

设计原则：

```text
content_vector 用来找资料。
citation metadata 用来证明资料来源。
```

## Example Index Document

```json
{
  "id": "news-current-venturebeat-kimi-k3-full-weights-2026-07-28-0000",
  "document_id": "news-current-venturebeat-kimi-k3-full-weights-2026-07-28",
  "source": "data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28",
  "title": "最新新闻: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查",
  "chunk_index": 0,
  "text": "标题: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查 ...",
  "content_vector": [0.012, -0.034, 0.088],
  "source_type": "current_news",
  "heading": "最新新闻",
  "published_at": "2026-07-28T12:00:00Z",
  "document_type": "news_item"
}
```

## Mapping from chunks.jsonl

| chunks.jsonl | Azure AI Search field | Notes |
|---|---|---|
| `id` | `id` | 保持 chunk 唯一 ID。 |
| `document_id` | `document_id` | 保留原始 document 追踪信息。 |
| `source` | `source` | citation 必须字段。 |
| `title` | `title` | citation 和 searchable 字段。 |
| `chunk_index` | `chunk_index` | citation 和调试字段。 |
| `text` | `text` | 检索和回答依据。 |
| 生成结果 | `content_vector` | 由 Azure OpenAI Embedding 生成。 |
| 推导结果 | `source_type` | 根据 `source` 判断 docs/current_news/history_news。 |
| 后续增强 | `heading` | heading-aware chunking 后补充。 |
| 新闻字段 | `published_at` | 从 news item 提取。docs 可为空。 |
| 推导结果 | `document_type` | markdown / news_item。 |

## Future Notes

后续 Day 14 会把本地 chunks 转换成 Azure AI Search document payload：

```text
rag/chunks.jsonl
→ rag/azure_search_docs.jsonl
```

Day 14 可以先预留空 vector：

```json
"content_vector": []
```

之后接入 Azure OpenAI Embedding 时再填入真实向量。

未来还需要补充：

- `source_type` 推导逻辑
- `heading` 提取逻辑
- `published_at` 提取逻辑
- embedding cache
- Azure AI Search index 创建脚本
- upload/indexing 脚本

## Key Understanding

```text
Azure AI Search index 同时承担两件事：
1. 找到相关 chunk
2. 保留回答出处
```

检索字段解决：

```text
找得到。
```

citation metadata 解决：

```text
说得清依据。
```

## Portfolio Summary

```text
Designed an Azure AI Search index schema for chunk-level vector retrieval while preserving citation metadata for source traceability.
```

## 日文面试表达

```text
Azure AI Search の index には、検索用の text と content_vector だけでなく、回答の根拠を追跡するための source、title、document_id、chunk_index も保存する設計にしました。
```
