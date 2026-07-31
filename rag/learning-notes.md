# AI Watchtower RAG Assistant 学习笔记

## 项目定位

AI Watchtower RAG Assistant 是一个面向 AI 情报、公开资料和结构化新闻数据的 RAG 知识库助手。

系统目标是读取 AI Watchtower 项目中的文档和新闻数据，根据用户问题检索相关资料，并生成带出处、可信度说明和核验边界的回答。

本项目不是普通聊天机器人。重点是企业 RAG 常见要求：

- 回答必须有依据
- 能显示信息来源
- 资料不足时不随意编造
- 能保留来源、标题、chunk 编号等 citation metadata
- 后续可以接入 Azure OpenAI 和 Azure AI Search

当前知识库范围：

- `docs/*.md`
- `data/news.json`：当前最新新闻
- `data/news-history.json`：历史新闻归档

当前 RAG pipeline：

```text
docs/*.md / data/*.json
→ Document Loading
→ corpus.jsonl
→ Chunking
→ chunks.jsonl
→ Keyword Retrieval
→ Top K Chunks
→ 后续：Embedding / Vector Search / Citation Answer
```

## Day 1: 项目方向和 RAG 整体理解

### 今天学什么

理解 RAG 的整体流程，并确定用现有 `ai-watchtower` 项目改造成 RAG 作品集。

### 为什么学

RAG 的价值不是让 AI 靠记忆回答，而是让系统先从可信资料中检索依据，再基于这些依据回答问题。

对 AI Watchtower 来说，已有的文档、来源规则、新闻数据和历史归档都可以成为知识库材料。

### 关键理解

RAG 的基本流程：

```text
资料读取 → Chunking → Embedding → Vector Search → 带出处回答
```

对应到本项目：

```text
ai-watchtower 的 docs/data
→ 切成小段
→ 转成向量
→ 根据问题找相关内容
→ 生成回答并显示来源
```

### 当前项目定位

```text
AI Watchtower RAG Assistant 是一个面向 AI 情报和公开资料的 RAG 知识库助手。
它可以读取 AI Watchtower 项目中的文档和新闻数据，根据用户问题检索相关资料，
并生成带出处、可信度说明和核验边界的回答。
```

### 完成标准

- 确认不重新做医疗主题项目，使用 `ai-watchtower` 改造
- 理解 `docs/` 和 `data/` 可以作为知识库来源
- 理解 RAG 是“先找资料，再回答”
- 理解第一版可以先本地跑通，不需要一开始接 Azure

### 作品集写法

```text
Defined AI Watchtower RAG Assistant as a citation-aware RAG prototype for AI intelligence documents and structured news data.
```

### 日文面试表达

```text
このプロジェクトでは、AI ニュースや公開ドキュメントを知識ベースとして扱い、検索結果に基づいて根拠付きで回答する RAG アシスタントを作成しています。
```

## Day 2: Document Loading

### 今天学什么

读取 Markdown 文档，并把原始资料转换成 RAG 可以继续处理的结构化文本。

### 为什么学

RAG 的第一步不是调用模型，而是把资料整理成机器可以处理的格式。

如果文档读取阶段没有保留 `source` 和 `title`，后续就很难做 citation 和审计。

### 已实现内容

新增脚本：

```text
rag/ingest_docs.py
```

最初版本读取：

```text
docs/*.md
```

后续已扩展为读取：

```text
docs/*.md
data/news.json
data/news-history.json
```

输出文件：

```text
rag/corpus.jsonl
```

每条 document 的结构：

```json
{
  "id": "source-policy",
  "source": "docs/source-policy.md",
  "title": "来源使用规则",
  "text": "..."
}
```

新闻数据会被转换成类似结构：

```json
{
  "id": "news-current-venturebeat-kimi-k3-full-weights-2026-07-28",
  "source": "data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28",
  "title": "最新新闻: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查",
  "text": "标题、摘要、为什么重要、事实说明、趋势判断、来源、核验状态等字段..."
}
```

### 当前运行结果

当前 ingestion 后的文档数量：

```text
Loaded 265 documents
- Markdown docs: 29
- Current news items: 11
- Historical news items: 225
```

### 关键理解

Document Loading 的作用：

```text
把原始资料转换成统一格式，让后续 chunking、retrieval、citation 都能使用。
```

### 完成标准

- 能生成 `rag/corpus.jsonl`
- 每个 document 有 `id / source / title / text`
- 当前最新新闻和历史新闻也进入 corpus
- 能说明 source metadata 为什么必须保留

### 作品集写法

```text
Implemented document ingestion for Markdown documents, current news data, and historical news archives, normalizing them into a unified JSONL corpus with source metadata.
```

### 日文面试表达

```text
RAG の最初のステップとして、Markdown や JSON のデータを読み込み、source や title を保持した検索可能な corpus に変換しました。
```

## Day 3: Chunking

### 今天学什么

把长文档切成适合检索的小段，并为每个 chunk 保留来源信息。

### 为什么学

RAG 通常不会直接检索整篇长文档，而是检索 chunk。

原因：

- 长文档太大，不适合直接放进模型上下文
- 检索整篇文档会降低相关性
- chunk 可以更精确地定位引用来源
- overlap 可以避免切分时丢失上下文

### 已实现内容

新增脚本：

```text
rag/chunk_docs.py
```

输入：

```text
rag/corpus.jsonl
```

输出：

```text
rag/chunks.jsonl
```

每个 chunk 的结构：

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

当前参数：

```text
CHUNK_SIZE = 800
CHUNK_OVERLAP = 120
```

### 当前运行结果

```text
Loaded 265 documents
Created 1273 chunks
```

### 关键理解

`CHUNK_OVERLAP` 的作用：

```text
相邻 chunk 之间保留一部分重复内容，避免重要上下文刚好被切断。
```

chunk 不能只保存正文，必须保存：

```text
source / title / chunk_index
```

否则后续无法显示引用来源，也无法审计回答依据。

### 完成标准

- 能生成 `rag/chunks.jsonl`
- 每个 chunk 保留 `id / document_id / source / title / chunk_index / text`
- 能解释 overlap 的作用
- 能解释 chunk metadata 和 citation 的关系

### 作品集写法

```text
Implemented document chunking with overlap and source metadata to preserve context for citation-aware retrieval.
```

### 日文面试表达

```text
長いドキュメントを検索しやすい単位に分割し、各 chunk に source、title、chunk_index を保持することで、後続の citation に対応できるようにしました。
```

## Day 4: Keyword Retrieval

### 今天学什么

用本地关键词检索，从 `rag/chunks.jsonl` 中找出和用户问题最相关的 top chunks。

### 为什么学

Retrieval 是 RAG 的核心步骤之一。它负责找资料，不负责生成回答。

先做关键词检索的原因：

- 实现简单
- 不依赖 API
- 不产生费用
- 能先理解 retrieval 的输入和输出
- 后续可以替换成 embedding-based semantic search

### 已实现内容

新增脚本：

```text
rag/search_chunks.py
```

功能：

- 读取 `rag/chunks.jsonl`
- 接收用户问题
- 对每个 chunk 计算关键词匹配分数
- 按分数排序
- 输出 top k chunks
- 显示 `score / title / source / chunk_index / text preview`

运行示例：

```bash
python3 rag/search_chunks.py "Kimi K3 权重发布有什么风险" --top-k 5
```

示例结果中可以检索到当前最新新闻：

```text
title: 最新新闻: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查
source: data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28
```

### 当前搜索范围

当前搜索范围已经包含：

```text
docs/*.md
data/news.json
data/news-history.json
```

如果每天更新了 `data/news.json`，需要重新运行：

```bash
python3 rag/ingest_docs.py
python3 rag/chunk_docs.py
```

之后 `search_chunks.py` 就会检索到最新新闻。

### 关键理解

Retrieval 和 Answer Generation 的区别：

```text
Retriever 负责找资料。
AnswerGenerator 负责基于资料生成回答。
```

关键词检索的局限：

```text
如果用户问题和文档用词不同，即使语义相关，关键词检索也可能找不到最佳结果。
```

例子：

```text
问题：Agent 安全风险是什么？
文档：共享凭证、身份隔离、权限控制
```

这两个表达语义相关，但字面词不完全一致。后续需要 embedding 来改善。

### 完成标准

- 能运行 `rag/search_chunks.py`
- 能返回 top 5 chunks
- 搜索结果保留 `source / title / chunk_index`
- 能说明 Retrieval 只负责找资料，不负责生成回答
- 能说明关键词检索的局限

### 作品集写法

```text
Implemented and tested a keyword-based retriever over chunked documents, current news, and historical archives to validate the RAG retrieval flow before introducing embeddings.
```

### 日文面试表达

```text
Embedding を導入する前に、まずキーワードベースの検索を実装し、RAG における retrieval の流れを確認しました。
```

## Day 5: Embedding 概念和数据结构设计

### 今天学什么

理解 embedding 的作用，并设计后续用于语义检索的数据结构。

### 为什么学

关键词检索看的是字面匹配。Embedding 检索看的是语义相似度。

当用户问题和文档内容用词不一样，但意思接近时，embedding 更适合做检索。

### 关键理解

Embedding 是文本的数字表示。

RAG 中通常会把：

```text
chunk text → embedding vector
user question → embedding vector
```

然后比较两者的相似度，找出最相关的 chunks。

基本流程：

```text
chunk text
→ embedding
→ vector index
→ query embedding
→ similarity search
→ top k chunks
```

关键词检索和 embedding 检索的区别：

```text
关键词检索：看字面是否匹配
Embedding 检索：看语义是否接近
```

### 设计的数据结构

后续每个 chunk 可以扩展为：

```json
{
  "id": "news-current-venturebeat-agent-security-gap-2026-07-25-0000",
  "document_id": "news-current-venturebeat-agent-security-gap-2026-07-25",
  "source": "data/news.json#venturebeat-agent-security-gap-2026-07-25",
  "title": "最新新闻: VentureBeat：Agent 事故与共享凭证成为企业安全缺口",
  "chunk_index": 0,
  "text": "...",
  "embedding": [0.012, -0.034, 0.088]
}
```

必须保留 metadata：

```text
source / title / chunk_index
```

原因：

```text
embedding 只能帮助检索相似内容，不能替代 citation。
如果只保存 text 和 embedding，检索结果无法清楚说明来源，也不利于审计。
```

### 当前阶段不做什么

Day 5 只做概念和结构设计，不做以下内容：

- 不接 Azure OpenAI
- 不调用 OpenAI API
- 不创建 Azure AI Search index
- 不做 Agent

这些会放到后续阶段。

### 完成标准

- 能说明 embedding 是文本的数字表示
- 能说明 embedding 用来做语义相似度搜索
- 能说明 chunk 的 embedding 必须和 `source / title / chunk_index` 放在一起
- 能说明 embedding 是为了解决关键词检索对表达差异敏感的问题

### 作品集写法

```text
Designed the chunk-level embedding data structure for semantic retrieval while preserving source metadata for citation and auditability.
```

### 日文面试表达

```text
キーワード検索だけでは表現ゆれに弱いため、各 chunk を embedding に変換し、意味的な類似度で検索できる構造を設計しました。
```

## Day 6: 本地模拟 Vector Search

### 今天学什么

用本地词频向量模拟 embedding，跑通 vector search 的基本流程。

### 为什么学

在接入 Azure OpenAI Embedding 之前，需要先理解向量检索的核心形状：

```text
query text → query vector
chunk text → chunk vector
cosine similarity
→ top k chunks
```

这一步不追求真实语义效果，重点是理解 similarity search 的流程。

### 已实现内容

新增脚本：

```text
rag/vector_search_demo.py
```

功能：

- 读取 `rag/chunks.jsonl`
- 把 query 转成本地词频向量
- 把 chunk text 转成本地词频向量
- 计算 cosine similarity
- 输出 top k chunks
- 保留 `title / source / document_id / chunk_index`

运行示例：

```bash
python3 rag/vector_search_demo.py "Agent 安全风险是什么" --top-k 5
python3 rag/vector_search_demo.py "Kimi K3 权重发布有什么风险" --top-k 5
```

### 关键理解

cosine similarity 用来比较两个向量方向是否接近：

```text
similarity = dot(query_vector, chunk_vector) / (|query_vector| * |chunk_vector|)
```

本地词频向量只是模拟 embedding，不是真正的语义 embedding。

局限：

```text
它仍然依赖词频和短语重合，不能真正理解深层语义。
```

这也是后续接入 Azure OpenAI Embedding 的理由。

### 完成标准

- 能运行 `rag/vector_search_demo.py`
- 能输出 similarity score
- 能返回 top k chunks
- 每条结果保留 citation metadata
- 能说明本地词频向量和真实 embedding 的区别

### 作品集写法

```text
Built a local vector search prototype to compare query and chunk representations with cosine similarity before integrating production embedding services.
```

### 日文面试表达

```text
本番の embedding サービスを使う前に、ローカルでベクトル検索の流れを実装し、query と chunk の類似度を cosine similarity で比較する仕組みを確認しました。
```

## Day 7: Context Building + Citation

### 今天学什么

把检索出来的 top chunks 整理成带 citation 编号的上下文，供后续 Answer Generator 使用。

### 为什么学

RAG 不是把检索结果直接丢给模型。需要先把每个 chunk 格式化，并保留来源信息。

这样模型回答时可以引用：

```text
[1] [2] [3]
```

并且用户可以追踪每个回答依据来自哪个 source、title 和 chunk。

### 已实现内容

新增脚本：

```text
rag/build_context.py
```

功能：

- 接收用户问题
- 支持 `vector` 和 `keyword` 两种检索模式
- 获取 top k chunks
- 给每个 chunk 分配 citation 编号
- 输出 LLM 可用的 context text
- 输出 citation list

运行示例：

```bash
python3 rag/build_context.py "Kimi K3 权重发布有什么风险" --top-k 3 --mode vector
python3 rag/build_context.py "AI Watchtower 如何判断来源可信度" --top-k 3 --mode keyword
```

输出结构：

```text
[1]
score: 0.2441
title: 最新新闻: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查
source: data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28
document_id: news-current-venturebeat-kimi-k3-full-weights-2026-07-28
chunk_index: 0
text:
...

Citation list:
[1] 最新新闻: ... (data/news.json#...#chunk-0)
```

### 关键理解

Context Builder 的职责：

```text
把 retrieval results 整理成可被 LLM 使用、可追踪出处的上下文。
```

它不负责：

- 读取原始文档
- 切分文档
- 生成最终回答
- 判断答案是否正确

它负责：

- 保留 citation 编号
- 保留 source/title/chunk_index
- 控制每个 chunk 进入上下文的长度
- 在没有检索结果时输出资料不足状态

### 完成标准

- 能运行 `rag/build_context.py`
- 能输出 `[1] [2] [3]` citation 编号
- 每个 citation 有 `source / title / document_id / chunk_index`
- 能说明 Context Builder 和 Answer Generator 的区别

### 作品集写法

```text
Built a citation-aware context builder that formats retrieved chunks with source metadata for grounded answer generation and auditability.
```

### 日文面试表达

```text
検索結果をそのまま LLM に渡すのではなく、各 chunk に citation 番号、source、title、chunk_index を付与し、回答の根拠を追跡できる形に整形しました。
```

## 当前进度总结

### 已完成

- Day 1: 明确项目定位
- Day 2: Document Loading
- Day 3: Chunking
- Day 4: Keyword Retrieval
- Day 5: Embedding 概念和数据结构设计
- Day 6: 本地模拟 Vector Search
- Day 7: Context Building + Citation

### 当前已生成或新增的文件

```text
rag/ingest_docs.py
rag/corpus.jsonl
rag/chunk_docs.py
rag/chunks.jsonl
rag/search_chunks.py
rag/vector_search_demo.py
rag/build_context.py
rag/learning-notes.md
```

### 当前能力

```text
AI Watchtower RAG Assistant 目前可以读取 docs 和 data 中的知识库内容，
把长文档切成 chunks，并通过本地关键词检索或本地模拟向量检索返回相关资料。
检索结果可以被整理成带 citation 编号、source、title 和 chunk_index 的上下文。
```

### 下一步

Day 8 建议进入：

```text
生成带引用的回答草稿。
```

目标是理解：

```text
回答生成必须基于检索到的 context；资料不足时不能编造。
```
