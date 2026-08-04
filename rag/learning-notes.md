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

## Day 8: Grounded Answering

### 今天学什么

基于检索到的 context 生成保守的、带 citation 的回答草稿。

### 为什么学

RAG 的回答生成不是自由聊天。回答必须受到检索结果约束：

```text
只能基于 context 回答。
资料不足时要说明不足。
回答中要带 citation，例如 [1] [2]。
```

企业场景中，回答看起来合理还不够，必须能追踪依据。

### 已实现内容

新增脚本：

```text
rag/answer_demo.py
```

功能：

- 接收用户问题
- 调用 `build_context.py` 的检索/context 逻辑
- 根据 top chunks 生成保守回答草稿
- 在回答中插入 citation 编号
- 输出 Sources 列表
- 当检索结果不足或分数过低时，明确说明无法给出可靠回答

运行示例：

```bash
python3 rag/answer_demo.py "Kimi K3 权重发布有什么风险" --top-k 3 --mode vector
python3 rag/answer_demo.py "AI Watchtower 预测 2030 年哪家公司会赢" --top-k 3 --mode vector --min-score 0.5
```

正常回答示例结构：

```text
Question:
Kimi K3 权重发布有什么风险

Answer:
根据检索到的资料，可以先做一个保守回答：

- 为什么重要: 开放模型不只比能力，也比许可可用性、部署门槛和数据合规。 [1]
- 需原始仓库、许可证和复测。 [2]

Sources:
[1] 最新新闻: ...
    source: data/news.json#...
    document_id: ...
    chunk_index: 0
    score: 0.2441
```

资料不足时的回答策略：

```text
根据当前检索到的资料，无法给出可靠回答。
可用资料不足，或者检索结果相关性过低；需要补充更直接的来源后再判断。
```

### 关键理解

Grounded Answering 的核心：

```text
回答必须被检索到的资料约束。
没有依据时，正确行为是拒绝下结论，而不是编造。
```

`answer_demo.py` 目前不调用真实 LLM。它是 answer generation 的本地 prototype，用来验证输出结构和安全策略。

### 完成标准

- 能运行 `rag/answer_demo.py`
- 能调用检索/context 逻辑
- 能生成带 `[1] [2]` 的回答草稿
- 能输出 Sources
- 资料不足时不编造

### 作品集写法

```text
Implemented a grounded answer prototype that generates citation-aware responses and explicitly handles insufficient evidence instead of fabricating unsupported answers.
```

### 日文面试表达

```text
検索された context の範囲だけを使って回答し、根拠が不足している場合は推測で答えず、不明点として明示する設計にしました。
```

## Day 9: RAG Evaluation 入门

### 今天学什么

用测试问题检查 RAG 检索结果是否命中 expected sources，并检查回答是否包含 citation。

### 为什么学

RAG 不是能回答就结束。需要持续评估：

```text
哪些问题能找到正确来源？
哪些问题失败？
失败是 retrieval 问题、chunking 问题，还是测试问题设计问题？
```

Evaluation 能把 demo 项目提升为更接近企业落地的工程项目。

### 已实现内容

新增测试问题集：

```text
rag/eval_questions.json
```

新增评估脚本：

```text
rag/evaluate_demo.py
```

评估逻辑：

```text
question
→ retriever top k chunks
→ retrieved sources
→ expected_sources 是否命中
→ answer 是否包含 citation
→ PASS / FAIL
```

资料不足问题单独处理：

```text
expected_sources = []
```

这类问题通过条件：

- top score 低于阈值
- 回答不带 citation
- 明确说明资料不足

### 运行命令

```bash
python3 rag/evaluate_demo.py --mode vector --top-k 5
python3 rag/evaluate_demo.py --mode keyword --top-k 5
```

### 当前 vector 模式结果

```text
Total: 5
Passed: 3
Failed: 2
Evaluation pass rate: 60.0%
Source hit rate: 50.0%
Insufficient-evidence cases passed: 1/1
```

失败案例：

```text
source-policy
news-format
```

失败原因：

```text
当前本地模拟向量检索对 docs 类问题表现弱，容易被新闻历史数据中的相似词干扰。
```

这不是坏结果。Day 9 的目标是建立评估机制，不是立刻优化检索。

### 完成标准

- 有 `rag/eval_questions.json`
- 有 `rag/evaluate_demo.py`
- 能输出每个问题的 PASS / FAIL
- 能输出 source hit rate
- 能列出 failed cases
- 能说明 evaluation 是为了发现失败，而不是掩盖失败

### 作品集写法

```text
Created a lightweight RAG evaluation dataset and source-hit evaluation script to measure retrieval quality, citation coverage, and insufficient-evidence handling.
```

### 日文面试表达

```text
RAG の品質を確認するために、テスト質問と期待される参照元を用意し、検索結果が正しい source を含んでいるかを評価しました。
```

## Day 10: Evaluation Report

### 今天学什么

把 RAG Evaluation 的结果整理成可读报告，记录通过率、失败案例、失败原因和下一步改进方向。

### 为什么学

评估脚本只能输出结果。作品集和面试需要你能解释：

```text
当前系统哪里能工作？
哪里失败了？
为什么失败？
下一步怎么改？
```

这比只展示成功 demo 更有工程价值。

### 已实现内容

新增报告：

```text
rag/eval_report.md
```

报告语言：

```text
日语
```

报告包含：

- Summary
- Test Setup
- 評価方針
- Passed Cases
- Failed Cases
- 全体分析
- Next Improvements
- Portfolio Summary
- 面接用説明

### 当前报告结论

```text
ニュース関連の質問は比較的うまく検索できた。
docs にあるルール文書や schema 文書に関する質問は失敗した。
```

主要失败原因：

```text
当前 local vector demo 不是真正的 semantic embedding。
news-history 里有很多相似词，容易干扰 docs 类问题。
docs/news-data-format.md 这种 schema 文档较长，普通 chunking 容易分散上下文。
```

下一步改进方向：

- Azure OpenAI Embedding
- Azure AI Search vector index
- heading-aware chunking
- `source_type` metadata
- docs/news retrieval filter
- reranking
- evaluation question set 扩展

### 完成标准

- 有 `rag/eval_report.md`
- 能理解 Summary
- 能理解 Passed / Failed cases
- 能解释失败原因
- 能说明下一步改进方向

### 作品集写法

```text
Documented RAG evaluation results with source hit rate, failed query analysis, and concrete improvement actions for retrieval quality.
```

### 日文面试表达

```text
評価結果は単なるスコアだけでなく、失敗した質問の原因分析と改善方針までドキュメント化しました。
```

## Day 11: RAG Pipeline 架构整理

### 今天学什么

把当前已完成的 RAG 处理流程整理成完整 pipeline 架构。

### 为什么学

到 Day 10 为止，项目已经有多个脚本和输出文件。如果不整理架构，后续很难说明：

```text
每一步负责什么？
每一步输入输出是什么？
哪些是当前 prototype？
哪些以后会被 Azure 替换？
```

架构文档是作品集和面试中说明项目整体性的关键材料。

### 已实现内容

新增架构文档：

```text
rag/architecture.md
```

文档包含：

- Current Pipeline
- Pipeline Steps
- Data Sources
- Core Data Formats
- Component Responsibilities
- Current Limitations
- Azure Roadmap
- Current Project Status
- 面接用説明
- Portfolio Summary

### 当前 pipeline

```text
docs/*.md
data/news.json
data/news-history.json
        ↓
rag/ingest_docs.py
        ↓
rag/corpus.jsonl
        ↓
rag/chunk_docs.py
        ↓
rag/chunks.jsonl
        ↓
rag/search_chunks.py
rag/vector_search_demo.py
        ↓
Top K Chunks
        ↓
rag/build_context.py
        ↓
Citation-aware Context
        ↓
rag/answer_demo.py
        ↓
Grounded Answer Draft
        ↓
rag/evaluate_demo.py
        ↓
rag/eval_report.md
```

### 关键理解

当前 RAG pipeline 可以分成 6 个核心组件：

```text
DocumentLoader
Chunker
Retriever
ContextBuilder
AnswerGenerator
Evaluator
```

职责区分：

```text
Retriever 负责找资料。
ContextBuilder 负责把资料整理成带 citation 的 context。
AnswerGenerator 负责基于 context 生成保守回答。
Evaluator 负责检查检索和回答是否可靠。
```

### 当前限制

- 还没有真实 semantic embedding
- docs 和 news 现在混在同一个检索范围里
- chunking 还是固定长度，不是 heading-aware
- answer demo 还不是 LLM 回答
- Azure OpenAI / Azure AI Search 还没有接入

### Azure 化方向

- Azure OpenAI Embedding
- Azure AI Search vector index
- Azure Functions API
- Application Insights
- Key Vault / Managed Identity
- citation validation

### 完成标准

- 有 `rag/architecture.md`
- 能说明完整 RAG pipeline
- 能说明每一步输入输出
- 能说明每个组件职责
- 能说明当前限制和 Azure 化方向

### 作品集写法

```text
Documented the end-to-end RAG pipeline architecture, including document ingestion, chunking, retrieval, citation-aware context building, grounded answering, and evaluation.
```

### 日文面试表达

```text
RAG の処理全体を、ドキュメント読み込み、chunking、検索、citation 付き context 作成、回答生成、評価という pipeline として整理しました。
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
- Day 8: Grounded Answering
- Day 9: RAG Evaluation 入门
- Day 10: Evaluation Report
- Day 11: RAG Pipeline 架构整理

### 当前已生成或新增的文件

```text
rag/ingest_docs.py
rag/corpus.jsonl
rag/chunk_docs.py
rag/chunks.jsonl
rag/search_chunks.py
rag/vector_search_demo.py
rag/build_context.py
rag/answer_demo.py
rag/eval_questions.json
rag/evaluate_demo.py
rag/eval_report.md
rag/architecture.md
rag/learning-notes.md
```

### 当前能力

```text
AI Watchtower RAG Assistant 目前可以读取 docs 和 data 中的知识库内容，
把长文档切成 chunks，并通过本地关键词检索或本地模拟向量检索返回相关资料。
检索结果可以被整理成带 citation 编号、source、title 和 chunk_index 的上下文。
系统可以基于这些上下文生成保守的带引用回答草稿，并在资料不足时拒绝下结论。
系统现在可以用测试问题评估 source hit rate、citation 覆盖和资料不足处理。
评估结果已经整理成日语报告，包含失败原因和下一步改进方向。
当前 RAG pipeline 已整理成架构文档，覆盖输入输出、组件职责、限制和 Azure 化路线。
```

### 下一步

Day 12 建议进入：

```text
准备 Azure 化前的接口边界。
```

目标是理解：

```text
先定义组件职责和替换边界，再逐步把本地实现替换为 Azure OpenAI / Azure AI Search。
```
