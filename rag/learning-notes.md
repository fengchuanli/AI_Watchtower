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

## Day 12: Azure 化前の接口边界设计

### 今天学什么

在 Azure 化之前，明确每个 RAG component 的职责和替换边界。

### 为什么学

Azure OpenAI 和 Azure AI Search 不是简单把 API 调用写进现有脚本就结束。

Azure API 会带来：

- 认证
- secret 管理
- 成本
- timeout
- retry
- rate limit
- local / production 环境差异

所以需要先定义 component boundary，让本地 prototype 后续可以安全替换成 Azure 实现。

### 已实现内容

更新文件：

```text
rag/architecture.md
```

新增章节：

```text
Azure-ready Component Boundaries
```

覆盖组件：

```text
DocumentLoader
Chunker
Retriever
ContextBuilder
AnswerGenerator
Evaluator
```

### 关键边界

#### Retriever

当前实现：

```text
rag/search_chunks.py
rag/vector_search_demo.py
```

未来替换：

```text
Azure OpenAI Embedding
Azure AI Search
hybrid search
reranking
```

职责：

```text
Retriever 只负责找资料，返回 top k chunks。
```

#### AnswerGenerator

当前实现：

```text
rag/answer_demo.py
```

未来替换：

```text
Azure OpenAI Chat Completion
```

职责：

```text
AnswerGenerator 只负责基于 context 生成 grounded answer。
```

#### Evaluator

当前实现：

```text
rag/eval_questions.json
rag/evaluate_demo.py
rag/eval_report.md
```

未来扩展：

```text
citation accuracy
hallucination check
regression test
Application Insights metrics
```

职责：

```text
Evaluator 负责验证 retrieval 和 answer 的质量。
```

### Retriever 和 AnswerGenerator 的区别

```text
Retriever 负责找资料。
AnswerGenerator 负责基于资料生成回答。
```

例：

```text
问题：Kimi K3 权重发布有什么风险？
```

Retriever：

```text
从 data/news.json 和 news-history 中找 Kimi K3 相关 chunks。
```

AnswerGenerator：

```text
只基于 Retriever 找到的 chunks，总结许可、部署约束、运行成本、数据合规等风险，并加 citation。
```

### 为什么不要把 Azure API 调用写死在检索脚本里

原因：

- API key 和 endpoint 需要安全管理
- timeout 和 rate limit 需要处理
- retry policy 需要独立设计
- embedding / chat completion 有成本
- local 和 production 环境不同
- 测试时不应该每次都调用 Azure
- deployment name 和 model version 以后可能改变

结论：

```text
Azure API 应该被封装在 component 的内部实现中。
外层 pipeline 只依赖 input/output contract。
```

### 完成标准

- `architecture.md` 里有 `Azure-ready Component Boundaries`
- 能说明 Retriever 和 AnswerGenerator 的区别
- 能说明为什么不要把 Azure API 调用写死在检索脚本里
- 能说明哪些本地组件未来会被 Azure 替换

### 作品集写法

```text
Defined Azure-ready component boundaries for the RAG pipeline, making local prototype components replaceable with Azure OpenAI and Azure AI Search services.
```

### 日文面试表达

```text
Azure API の呼び出しを検索処理に直接書くのではなく、責務ごとに component を分けることで、テスト、差し替え、障害対応をしやすくしました。
```

## Day 13: Azure AI Search Index Schema

### 今天学什么

设计 Azure AI Search 的 index schema，把当前 `chunks.jsonl` 映射成 Azure AI Search 可以保存和检索的 document fields。

### 为什么学

Azure AI Search 是后续 RAG 的检索层。它不只是保存 `content_vector`。

RAG 的回答需要显示出处，所以 index 中必须同时保存：

```text
检索字段
向量字段
过滤字段
citation metadata
```

否则即使检索到了相关 chunk，也无法说明回答依据来自哪里。

### 已实现内容

新增文件：

```text
rag/azure-search-schema.md
```

文档包含：

- Purpose
- Source Data
- Fields
- Field Usage
- Citation Metadata
- Example Index Document
- Mapping from chunks.jsonl
- Future Notes
- Key Understanding
- Portfolio Summary
- 日文面试表达

### 设计字段

```text
id
document_id
source
title
chunk_index
text
content_vector
source_type
heading
published_at
document_type
```

字段用途分类：

```text
Searchable:
text, title, heading

Vector Searchable:
content_vector

Filterable:
source_type, published_at, document_type

Retrievable / Citation:
source, title, document_id, chunk_index, text
```

### 关键理解

```text
content_vector 用来找资料。
citation metadata 用来证明资料来源。
```

Azure AI Search index 同时承担两件事：

```text
1. 找到相关 chunk
2. 保留回答出处
```

如果只保存 `text` 和 `content_vector`，会出现以下问题：

- 回答无法显示出处
- 用户无法判断来源是否可信
- evaluation 无法检查 expected source
- 线上问题无法追踪回答依据
- 企业场景无法审计

### 完成标准

- 有 `rag/azure-search-schema.md`
- 能说明每个字段用途
- 能说明哪些字段用于 text search
- 能说明哪些字段用于 vector search
- 能说明哪些字段用于 filter
- 能说明哪些字段用于 citation
- 能说明为什么不能只保存 text 和 vector

### 作品集写法

```text
Designed an Azure AI Search index schema for chunk-level vector retrieval while preserving citation metadata for source traceability.
```

### 日文面试表达

```text
Azure AI Search の index には、検索用の text と content_vector だけでなく、回答の根拠を追跡するための source、title、document_id、chunk_index も保存する設計にしました。
```

## Day 14: Azure AI Search Indexing Payload

### 今天学什么

把本地 `rag/chunks.jsonl` 转换成未来可以上传到 Azure AI Search 的 document payload。

### 为什么学

`chunks.jsonl` 是本地 RAG prototype 的中间数据。Azure AI Search 需要符合 index schema 的 document。

Day 14 的目标不是连接 Azure，而是先把数据边界准备好：

```text
rag/chunks.jsonl
→ rag/azure_search_docs.jsonl
```

### 已实现内容

新增脚本：

```text
rag/prepare_azure_search_docs.py
```

生成文件：

```text
rag/azure_search_docs.jsonl
```

运行命令：

```bash
python3 rag/prepare_azure_search_docs.py
```

当前运行结果：

```text
Loaded chunks: 1273
Created Azure Search docs: 1273
Source type counts:
- current_news: 22
- docs: 772
- history_news: 479
```

### 输出字段

每条 Azure Search document 包含：

```text
id
document_id
source
title
chunk_index
text
content_vector
source_type
heading
published_at
document_type
```

其中：

```text
content_vector = []
```

暂时留空。后续接 Azure OpenAI Embedding 时再填入真实 vector。

### 字段推导

`source_type` 根据 `source` 推导：

```text
docs/... → docs
data/news.json#... → current_news
data/news-history.json#... → history_news
```

`document_type` 根据 `source_type` 推导：

```text
docs → markdown
current_news / history_news → news_item
```

`heading` 当前从 chunk text 中的 Markdown heading 推导；没有 heading 时使用 title。

`published_at` 当前从 news chunk text 中的 `发布时间:` 提取；docs 为 null。

### 关键理解

Indexing payload 是 Azure AI Search 的输入数据格式。

```text
本地 chunk
→ Azure Search document
→ 后续 upload/indexing
```

Day 14 只准备 payload，不调用 Azure API。

### 完成标准

- 有 `rag/prepare_azure_search_docs.py`
- 有 `rag/azure_search_docs.jsonl`
- 每条数据保留 citation metadata
- 每条数据预留 `content_vector`
- 能说明这是 Azure AI Search indexing payload

### 作品集写法

```text
Prepared Azure AI Search indexing payloads from local RAG chunks, preserving citation metadata and reserving vector fields for embedding-based retrieval.
```

### 日文面试表达

```text
ローカルで作成した chunk データを Azure AI Search に登録しやすい document 形式に変換し、citation 用の metadata と embedding 用の vector field を保持しました。
```

## Day 15: Azure OpenAI Embedding 接入设计

### 今天学什么

设计 `EmbeddingProvider` 边界，明确本地 mock embedding 和未来 Azure OpenAI Embedding 实现的差异。

### 为什么学

Day 14 已经把本地 chunks 转成 Azure AI Search indexing payload，并预留了：

```text
content_vector
```

但 `content_vector` 不能随便填，也不能直接在检索脚本里硬写 Azure API 调用。

原因：

- Azure OpenAI API 需要 API key、endpoint 和 deployment 配置
- API 调用会有 timeout、retry、rate limit 问题
- embedding 会产生费用
- local test 不应该每次都依赖真实 Azure
- 后续 model version 或 deployment name 可能变化

所以需要先设计一个清楚的 provider 边界：

```text
text
→ EmbeddingProvider
→ list[float]
→ content_vector
```

### 已实现内容

新增设计文档：

```text
rag/embedding-provider-design.md
```

更新架构文档：

```text
rag/architecture.md
```

新增的架构组件：

```text
EmbeddingProvider
```

### EmbeddingProvider 的职责

```text
把 text 转成 embedding vector。
```

输入：

```text
text: string
```

输出：

```text
list[float]
```

它不负责：

- 搜索资料
- 构建 context
- 生成回答
- 判断回答是否正确

这些分别属于：

```text
Retriever
ContextBuilder
AnswerGenerator
Evaluator
```

### 本地 mock 和 Azure OpenAI 的区别

当前本地实现：

```text
rag/vector_search_demo.py
```

作用：

```text
用本地词频向量模拟 embedding，帮助理解 vector search 流程。
```

特点：

- 不需要 API key
- 不产生费用
- 适合本地学习和测试
- 不是真正的 semantic embedding

未来 Azure 实现：

```text
AzureOpenAIEmbeddingProvider
```

作用：

```text
调用 Azure OpenAI Embedding，把 chunk text 和 user query 转成真实语义向量。
```

特点：

- 语义检索效果更好
- 需要 Azure OpenAI endpoint / API key / deployment
- 需要处理 timeout / retry / rate limit
- 需要成本控制

### 需要的环境变量

未来接 Azure 时，连接信息不写死在代码里，而是从环境变量读取：

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

重要原则：

```text
API key 不写进代码，不 commit 到 git。
```

### Error Handling 设计

embedding 生成时需要考虑：

```text
empty text
text too long
timeout
rate limit
temporary service error
invalid API key / endpoint
failure rate too high
```

关键原则：

```text
embedding 失败时不能悄悄写入空 vector。
```

否则后续检索质量变差时，很难发现真正原因。

### Cost Control 设计

当前已经有：

```text
1273 chunks
```

新闻每天会更新，所以不能每天对所有 chunks 重新生成 embedding。

成本控制方案：

- 用 `chunk_id + text_hash + deployment + api_version` 做 cache key
- text 没变化的 chunk 不重新 embedding
- 只处理新增或变化的新闻 chunk
- 使用 batch embedding 减少 API 调用次数
- 失败 chunk 进入 retry queue

### 关键理解

Azure OpenAI Embedding 和 Azure AI Search 的区别：

```text
Azure OpenAI Embedding:
把 text 转成 vector。

Azure AI Search:
保存 vector 和 metadata，并根据 query vector 检索 top k chunks。
```

EmbeddingProvider 和 Retriever 的区别：

```text
EmbeddingProvider 负责把 text 变成 vector。
Retriever 负责根据 question 找到相关 chunks。
```

### 为什么不要把 Azure API 调用写死在检索脚本里

原因：

- API key 管理不安全
- local test 会依赖 Azure
- evaluation 每次运行都会产生成本
- retry / rate limit 逻辑会分散在多个脚本里
- 以后更换 model 或 deployment 时改动范围大
- production 出问题时不好排查

正确做法：

```text
检索脚本只依赖 provider interface。
具体使用 local mock 还是 Azure OpenAI，由 provider 实现决定。
```

### 完成标准

- 有 `rag/embedding-provider-design.md`
- `rag/architecture.md` 中补充了 `EmbeddingProvider`
- 能说明 `EmbeddingProvider` 的输入输出
- 能说明 local mock 和 Azure OpenAI embedding 的区别
- 能说明为什么 API key 不能写进代码
- 能说明 retry、rate limit、cache、batch 的必要性
- 能说明 `content_vector` 后续如何生成

### 作品集写法

```text
Designed an embedding provider boundary to separate local prototyping from Azure OpenAI embedding integration, considering retry, rate limit, cost control, and secret management.
```

### 日文面试表达

```text
Embedding の処理を provider として分離し、ローカル検証用の mock 実装と Azure OpenAI 用の実装を差し替えられる設計にしました。
```

## Day 16: Embedding cache / batch indexing 设计

### 今天学什么

设计 embedding cache 和 batch indexing 策略，理解如何只为新增或变化的 chunks 生成 embedding。

### 为什么学

AI Watchtower 的新闻每天都会更新。如果每次都重新 embedding 所有 chunks，会带来实际工程问题：

- API cost 增加
- 执行时间变长
- rate limit 风险增加
- 失败后 retry 范围变大
- 没有变化的 docs 也被重复处理

所以 Day16 的目标是设计增量处理：

```text
只处理新增或变化的 chunk。
没变化的 chunk 直接复用旧 vector。
```

### 已实现内容

新增设计文档：

```text
rag/embedding-cache-design.md
```

更新架构文档：

```text
rag/architecture.md
```

新增的架构组件：

```text
EmbeddingCache
```

### 核心判断规则

```text
chunk_id 不存在
→ 新增 chunk，需要 embedding。

chunk_id 存在 + text_hash 变了
→ 内容变化，需要重新 embedding。

chunk_id 存在 + text_hash 没变
→ 内容没变，复用 cache 里的 vector。

embedding deployment / api_version 变了
→ cache 失效，需要重新 embedding。
```

### cache key 设计

推荐 cache key：

```text
chunk_id + text_hash + embedding_deployment + api_version
```

不能只用 `chunk_id`。

原因：

```text
同一个 chunk_id 的正文可能会变化。
正文变化后，旧 vector 就不能代表新正文。
```

也不能只用 `text_hash`。

原因：

```text
不同 embedding deployment 或 api_version 生成的 vector 可能不兼容。
```

### text_hash 的作用

`text_hash` 用来判断 chunk 正文是否变化。

例：

```text
标题没变，但新闻摘要或分析内容变了
→ text_hash 会变化
→ 需要重新 embedding
```

### batch embedding 的作用

batch embedding 是把多个需要处理的 chunks 合并成一批处理，而不是一个 chunk 调一次 API。

作用：

- 减少 API 调用次数
- 缩短整体运行时间
- 更容易控制 retry
- 更容易处理 rate limit

例：

```text
changed chunks: 37
batch size: 16

batch 1: 16 chunks
batch 2: 16 chunks
batch 3: 5 chunks
```

### 每日新闻更新流程

每天新闻更新后，RAG indexing 的理想流程：

```text
data/news.json 更新
→ ingest_docs.py
→ chunk_docs.py
→ 计算每个 chunk 的 text_hash
→ 检查 embedding cache
→ cache hit: 复用 vector
→ cache miss / changed: 加入 batch
→ EmbeddingProvider.embed_batch()
→ 更新 cache
→ 生成 content_vector 完整的 Azure Search docs
→ Azure AI Search upsert
```

### cache invalidation 条件

以下情况不能复用旧 cache：

```text
text 变了
embedding deployment 变了
api_version 变了
vector dimension 变了
cache record 损坏
embedding provider 设置变化
```

关键原则：

```text
embedding 失败的 chunk 不能用空 vector 假装成功。
```

否则后续检索效果变差时，很难排查原因。

### 需要记录的 metrics

未来 daily indexing job 可以记录：

```text
total_chunks
cache_hits
cache_misses
changed_chunks
new_chunks
deleted_chunks
embedded_chunks
failed_chunks
batch_count
estimated_cost
duration_seconds
```

这些指标后续可以接到 Application Insights。

### 当前阶段不做什么

Day16 只完成设计，不做真实 Azure 调用，也不生成真实 embedding cache。

未来可能新增：

```text
rag/embedding_cache.jsonl
rag/build_embedding_cache.py
rag/prepare_vectorized_azure_search_docs.py
```

### 完成标准

- 有 `rag/embedding-cache-design.md`
- `rag/architecture.md` 中补充了 `EmbeddingCache`
- 能说明为什么 embedding cache 必要
- 能说明 `chunk_id` 和 `text_hash` 的作用
- 能说明 cache key 为什么要包含 deployment / api_version
- 能说明 batch embedding 的目的
- 能说明每日新闻更新时如何只处理变化数据
- 能说明 cache invalidation 条件

### 作品集写法

```text
Designed an incremental embedding cache and batch indexing strategy to avoid recomputing vectors for unchanged chunks during daily news updates.
```

### 日文面试表达

```text
毎日ニュースが更新されるため、全 chunk を再 embedding するのではなく、chunk_id と text hash を使って変更された chunk だけを batch 処理する設計にしました。
```

## Day 17: Azure OpenAI Embedding 实装准备

### 今天完成了什么

Day17 不是直接把所有 chunks 发到 Azure，而是把真实接入前的准备工作做清楚。

新增：

```text
rag/azure-openai-embedding-readiness.md
rag/check_azure_openai_embedding_readiness.py
```

更新：

```text
rag/architecture.md
rag/learning-notes.md
```

### 为什么先做 readiness

Azure OpenAI Embedding 不是单纯写一行 API 调用。

真实接入前必须先确认：

```text
endpoint 是否正确
API key 是否安全管理
embedding deployment name 是否正确
api_version 是否固定
azure_search_docs.jsonl 是否已有可填 content_vector 的 payload
失败时是否会停止，而不是写入空 vector
```

如果这些没有先想清楚，后面容易出现三类问题：

- API key 被写进代码或日志
- vector dimension 和 Azure AI Search schema 不一致
- embedding 失败后仍把空 vector 当成功结果上传

### 需要的环境变量

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

关键理解：

```text
AZURE_OPENAI_EMBEDDING_DEPLOYMENT 是 Azure 里的 deployment name，
不一定等于 model name。
```

### 最小验证脚本

新增脚本：

```bash
python3 rag/check_azure_openai_embedding_readiness.py
```

这个脚本目前不调用 Azure API，也不会产生费用。

它检查：

- 环境变量是否存在
- API key 是否只做 masked display
- `rag/azure_search_docs.jsonl` 是否存在
- payload required fields 是否齐全
- `content_vector` 当前是空 placeholder 还是已有真实 vector
- 下一步 embeddings endpoint path 应该是什么形状

strict mode：

```bash
python3 rag/check_azure_openai_embedding_readiness.py --strict
```

在 strict mode 下，如果环境变量缺失，就用 exit code 1 停止。

### Day17 的边界

今天不做：

```text
不全量 embedding
不上传 Azure AI Search
不把 API key 写进 repository
不把 Azure API 调用写死在 retriever 里
```

今天完成的是：

```text
真实 Azure 接入前的 configuration / payload / failure handling / smoke test 顺序。
```

### 下一步怎么做

Day18 建议进入：

```text
Azure OpenAI Embedding one-text smoke test。
```

顺序：

```text
1. 设置 Azure OpenAI 环境变量
2. 用一句短文本调用 embedding endpoint
3. 确认返回 list[float]
4. 确认 vector dimension
5. 再把它接进 EmbeddingProvider
```

不要一开始就处理 1273 个 chunks。

### 作品集写法

```text
Prepared the Azure OpenAI Embedding implementation path by defining required environment variables, dependency boundaries, a local readiness check, smoke-test order, and failure handling before sending real chunks to Azure.
```

### 日文面试表达

```text
Azure OpenAI Embedding に接続する前に、環境変数、deployment 名、API version、payload 形式、失敗時の停止条件を整理しました。
```

```text
まず全 chunk を送るのではなく、1 文だけで smoke test を行い、vector dimension と secret management を確認してから batch embedding と cache に進む設計にしています。
```

## Day 18: Azure OpenAI Embedding one-text smoke test

### 今天完成了什么

Day18 做的是 Azure OpenAI Embedding 的最小真实调用入口。

新增：

```text
rag/azure-openai-embedding-smoke-test.md
rag/azure_openai_embedding_smoke_test.py
```

更新：

```text
rag/architecture.md
rag/learning-notes.md
```

### 为什么只做 one-text smoke test

Embedding 接入不能一开始就把 1273 个 chunks 全部发出去。

先用一句短文本验证，可以提前确认：

```text
endpoint / deployment / api_version 是否正确
API key 是否没有进入 log
response.data[0].embedding 是否存在
embedding 是否是 list[float]
vector dimension 是否和 Azure AI Search schema 匹配
失败时是否会停止，而不是写入空 vector
```

这样做的价值是把风险控制在最小范围：

- 不产生大量 token / embedding 成本
- 不污染 `content_vector`
- 不把错误 deployment 的 vector 写入 cache
- 不让 Retriever 直接依赖 Azure API 细节

### 新增脚本

执行 dry run：

```bash
python3 rag/azure_openai_embedding_smoke_test.py --dry-run
```

dry run 会显示环境变量状态和 request path shape，但不会真的调用 Azure。

执行真实 smoke test：

```bash
python3 rag/azure_openai_embedding_smoke_test.py \
  --text "AI Watchtower citation test."
```

如果已经知道 deployment 的 vector dimension，可以加检查：

```bash
python3 rag/azure_openai_embedding_smoke_test.py \
  --text "AI Watchtower citation test." \
  --expected-dimension 1536
```

### 成功标准

真实调用成功时，脚本应输出：

```text
Smoke test passed
- embedding type: list[float]
- vector dimension: <number>
- API key printed: no
```

如果 dimension 不符合预期，脚本会失败，不会继续进入 batch embedding。

### 错误处理

脚本会把常见错误分成可读原因：

- missing env
- endpoint 不是 `https://`
- HTTP 400: API version 或 request body 问题
- HTTP 401: API key 问题
- HTTP 403: permission / network policy 问题
- HTTP 404: endpoint 或 deployment name 问题
- HTTP 429: rate limit
- timeout / network error
- response 不是 JSON
- response 里没有合法 embedding
- vector dimension mismatch

关键原则：

```text
失败就是失败，不能把 content_vector: [] 当成 embedding 成功。
```

### Day18 的边界

今天不做：

```text
不 batch embedding
不写 embedding cache
不更新 azure_search_docs.jsonl 的 content_vector
不 upsert Azure AI Search
不把 Azure API call 写进 Retriever
```

今天完成的是：

```text
从 readiness check 进入真实 Azure Embedding 前的最小 smoke test 脚本和操作说明。
```

### 作品集写法

```text
Implemented a one-text Azure OpenAI Embedding smoke test that validates response shape, vector dimension, timeout and HTTP failure handling, and secret-safe logging before attempting batch embedding or Azure AI Search indexing.
```

### 日文面试表达

```text
Azure OpenAI Embedding を全データに適用する前に、まず 1 文だけで smoke test を行い、返ってくる embedding が list[float] であることと vector dimension を確認するようにしました。
```

```text
API key は log に出さず、HTTP error や timeout の場合も空 vector を成功扱いしないようにしています。
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
- Day 12: Azure 化前の接口边界设计
- Day 13: Azure AI Search Index Schema
- Day 14: Azure AI Search Indexing Payload
- Day 15: Azure OpenAI Embedding 接入设计
- Day 16: Embedding cache / batch indexing 设计
- Day 17: Azure OpenAI Embedding 实装准备
- Day 18: Azure OpenAI Embedding one-text smoke test

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
rag/azure-search-schema.md
rag/prepare_azure_search_docs.py
rag/azure_search_docs.jsonl
rag/embedding-provider-design.md
rag/embedding-cache-design.md
rag/azure-openai-embedding-readiness.md
rag/check_azure_openai_embedding_readiness.py
rag/azure-openai-embedding-smoke-test.md
rag/azure_openai_embedding_smoke_test.py
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
架构文档中已经补充 Azure-ready component boundaries，明确本地实现和 Azure 替换点。
Azure AI Search index schema 已完成，明确 text/vector/filter/citation 字段设计。
本地 chunks 已转换成 Azure AI Search indexing payload，并预留 content_vector 字段。
EmbeddingProvider 边界设计已完成，明确 local mock 和 Azure OpenAI Embedding 的替换方式，并考虑 retry、rate limit、cost control 和 secret management。
EmbeddingCache 设计已完成，明确用 chunk_id、text_hash、embedding deployment 和 api_version 判断哪些 chunks 需要重新 embedding，并设计 batch indexing 和 cache invalidation 策略。
Azure OpenAI Embedding 实装准备已完成，明确环境变量、依赖边界、readiness check、one-text smoke test 顺序和失败时停止条件。
Azure OpenAI Embedding one-text smoke test 已完成，能够在真实 batch embedding 前验证 response shape、list[float]、vector dimension、secret-safe logging 和常见 Azure 错误处理。
```

### 下一步

Day 19 建议进入：

```text
AzureOpenAIEmbeddingProvider implementation。
```

目标是理解：

```text
如何把 Day18 的 one-text smoke test 封装成 EmbeddingProvider implementation，让后续 batch embedding 和 Retriever 不直接依赖 Azure API 细节。
```
