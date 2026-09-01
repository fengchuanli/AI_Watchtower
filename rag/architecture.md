# AI Watchtower RAG Assistant Architecture

## 目的

このドキュメントは、AI Watchtower RAG Assistant の現在の RAG pipeline を整理するためのものです。

現在の目的は、本番レベルの Azure RAG を完成させることではなく、ローカル prototype として以下の流れを理解し、説明できる状態にすることです。

```text
資料を読む
→ 検索しやすい単位に分ける
→ 関連する chunk を検索する
→ citation 付き context を作る
→ 根拠付き回答草稿を生成する
→ 評価する
```

## Current Pipeline

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
        ↓
rag/prepare_azure_search_docs.py
        ↓
rag/azure_search_docs.jsonl
        ↓
rag/embedding-provider-design.md
        ↓
Future: Azure OpenAI Embedding fills content_vector
        ↓
rag/embedding-cache-design.md
        ↓
Future: incremental embedding and batch indexing
```

## Pipeline Steps

| Step | Script / File | Input | Output | 役割 |
|---|---|---|---|---|
| Document Loading | `rag/ingest_docs.py` | `docs/*.md`, `data/news.json`, `data/news-history.json` | `rag/corpus.jsonl` | Markdown と JSON ニュースを統一された document 形式に変換する |
| Chunking | `rag/chunk_docs.py` | `rag/corpus.jsonl` | `rag/chunks.jsonl` | 長い document を検索しやすい chunk に分割する |
| Keyword Retrieval | `rag/search_chunks.py` | User query, `rag/chunks.jsonl` | Top K chunks | キーワード一致で関連 chunk を検索する |
| Local Vector Search | `rag/vector_search_demo.py` | User query, `rag/chunks.jsonl` | Top K chunks with similarity | 本物の embedding の前に、ローカル向量で vector search の流れを確認する |
| Context Building | `rag/build_context.py` | User question, Top K chunks | Citation-aware context | 検索結果に `[1] [2]` 形式の citation metadata を付ける |
| Answer Drafting | `rag/answer_demo.py` | Question, citation-aware context | Grounded answer draft | 検索された context の範囲だけで保守的な回答草稿を作る |
| Evaluation | `rag/evaluate_demo.py` | `rag/eval_questions.json`, retriever output | PASS / FAIL, source hit rate | expected source に到達できたか、citation があるかを評価する |
| Evaluation Report | `rag/eval_report.md` | Evaluation results | Human-readable report | 評価結果、失敗原因、改善方針を日語で整理する |
| Azure Search Payload | `rag/prepare_azure_search_docs.py` | `rag/chunks.jsonl` | `rag/azure_search_docs.jsonl` | Azure AI Search に登録しやすい document payload に変換し、`content_vector` を予約する |
| Embedding Provider Design | `rag/embedding-provider-design.md` | text | vector | local mock と Azure OpenAI embedding の差し替え境界を定義する |
| Embedding Cache Design | `rag/embedding-cache-design.md` | chunks, text hash, embedding cache | changed chunks only | 変更された chunk だけ embedding し、未変更 chunk の vector を再利用する設計を定義する |

## Data Sources

現在の knowledge base は以下を対象にしています。

```text
docs/*.md
data/news.json
data/news-history.json
```

### docs/*.md

AI Watchtower の運用ルール、編集方針、source policy、データ形式などの文書です。

主な用途:

- ルールや方針に関する質問
- source reliability に関する質問
- news data schema に関する質問

### data/news.json

現在の最新ニュースです。

主な用途:

- 最新ニュースに関する質問
- 現在の AI トレンド確認
- daily update の検索対象

### data/news-history.json

過去ニュースの履歴です。

主な用途:

- 過去の AI ニュース検索
- topic の継続観察
- current news と historical context の比較

## Core Data Formats

### corpus.jsonl

Document Loading 後の統一 document 形式です。

```json
{
  "id": "source-policy",
  "source": "docs/source-policy.md",
  "title": "来源使用规则",
  "text": "..."
}
```

ニュースの場合:

```json
{
  "id": "news-current-venturebeat-kimi-k3-full-weights-2026-07-28",
  "source": "data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28",
  "title": "最新新闻: VentureBeat：Kimi K3 完整权重发布但许可仍需企业审查",
  "text": "..."
}
```

### chunks.jsonl

Chunking 後の検索対象データです。

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

重要点:

```text
source / title / chunk_index は citation のために必須。
```

### Citation-aware Context

`build_context.py` が生成する LLM 用 context です。

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

## Component Responsibilities

### DocumentLoader

対応ファイル:

```text
rag/ingest_docs.py
```

責務:

- Markdown と JSON を読み込む
- docs と news を統一 document 形式に変換する
- `source` と `title` を保持する

現在の実装:

- ローカル filesystem
- Markdown
- JSON news data

将来の Azure 化:

- Blob Storage
- scheduled ingestion pipeline
- Azure Functions scheduled trigger

### Chunker

対応ファイル:

```text
rag/chunk_docs.py
```

責務:

- 長い document を chunk に分割する
- overlap で文脈切断を軽減する
- citation 用 metadata を保持する

現在の実装:

```text
CHUNK_SIZE = 800
CHUNK_OVERLAP = 120
```

今後の改善:

- heading-aware chunking
- token-based chunking
- document type 別 chunking

### EmbeddingProvider

対応ファイル:

```text
rag/embedding-provider-design.md
rag/vector_search_demo.py
```

責務:

- text を embedding vector に変換する
- local mock と Azure OpenAI embedding の差し替え境界を定義する
- retry、rate limit、timeout、cost control、secret management を考慮する

現在の実装:

```text
rag/vector_search_demo.py
```

現在は本物の embedding ではなく、local term-frequency vector で vector search の流れを確認しています。

将来の Azure 化:

```text
AzureOpenAIEmbeddingProvider
```

重要点:

```text
EmbeddingProvider は検索しない。
EmbeddingProvider は回答を生成しない。
EmbeddingProvider は text を vector に変換するだけ。
```

### EmbeddingCache

対応ファイル:

```text
rag/embedding-cache-design.md
```

責務:

- chunk_id と text_hash で既存 vector を再利用できるか判定する
- 新規または変更された chunk だけ embedding 対象にする
- embedding deployment / api_version が変わった場合に cache を無効化する
- batch embedding の対象 chunk を整理する
- cache hit / miss / failed chunks を記録する

基本判断:

```text
chunk_id がない → new chunk
chunk_id がある + text_hash が変わった → changed chunk
chunk_id がある + text_hash が同じ → cache hit
deployment / api_version が変わった → cache invalidation
```

将来の Azure 化:

```text
embedding cache
batch indexing job
Azure AI Search upsert
Application Insights metrics
```

重要点:

```text
ニュースは毎日更新されるため、全 chunk を毎回 embedding し直さない。
変更された chunk だけ処理し、変更されていない chunk は cache から vector を再利用する。
```

### Retriever

対応ファイル:

```text
rag/search_chunks.py
rag/vector_search_demo.py
```

責務:

- user query に関連する chunk を検索する
- top k chunks を返す
- score または similarity を返す

現在の実装:

- keyword retrieval
- local term-frequency vector search

現在の制限:

- 本物の semantic embedding ではない
- docs 系質問では news-history に干渉されやすい
- query の表現ゆれに弱い

将来の Azure 化:

- Azure OpenAI Embedding
- Azure AI Search vector index
- hybrid search
- reranking

### ContextBuilder

対応ファイル:

```text
rag/build_context.py
```

責務:

- retrieved chunks を LLM に渡しやすい context に整形する
- citation number を付与する
- `source / title / document_id / chunk_index` を保持する
- context に入れる text の長さを制御する

重要点:

```text
ContextBuilder は回答を生成しない。
回答の根拠として使える context を作るだけ。
```

### AnswerGenerator

対応ファイル:

```text
rag/answer_demo.py
```

責務:

- citation-aware context に基づいて保守的な回答草稿を作る
- citation marker を回答に含める
- 根拠不足の場合は推測で回答しない

現在の実装:

- template-based local prototype
- LLM API は未使用

将来の Azure 化:

- Azure OpenAI Chat Completion
- grounded prompt
- insufficient evidence handling
- citation validation

### Evaluator

対応ファイル:

```text
rag/evaluate_demo.py
rag/eval_questions.json
rag/eval_report.md
```

責務:

- expected source に到達できたか確認する
- citation が回答に含まれるか確認する
- 根拠不足質問で推測回答を避けられるか確認する
- 失敗 case を記録し、改善方針を明確にする

現在の結果:

```text
Total: 5
Passed: 3
Failed: 2
Evaluation pass rate: 60.0%
Source hit rate: 50.0%
Insufficient-evidence cases passed: 1/1
```

## Azure-ready Component Boundaries

Azure 化する前に、各処理を component として分けておく理由は、ローカル prototype をそのままクラウドに貼り替えるのではなく、責務ごとに安全に差し替えられるようにするためです。

特に Azure API は認証、コスト、timeout、retry、rate limit、secret management、環境差異を伴います。そのため、検索処理や回答生成処理の中に API 呼び出しを直接書き込むのではなく、component boundary を明確にしておきます。

### Boundary Summary

| Component | Current local implementation | Future Azure replacement | Boundary |
|---|---|---|---|
| DocumentLoader | `rag/ingest_docs.py` | Blob Storage, scheduled ingestion, Azure Functions trigger | source documents を読み込み、統一 document に変換する |
| Chunker | `rag/chunk_docs.py` | Azure-hosted ingestion job or Functions batch process | document を metadata 付き chunks に変換する |
| EmbeddingProvider | `rag/vector_search_demo.py` concept, `rag/embedding-provider-design.md` | Azure OpenAI Embedding | text を embedding vector に変換する |
| EmbeddingCache | `rag/embedding-cache-design.md` | Cache storage, batch indexing job | chunk_id と text_hash で再 embedding が必要な chunk を判定する |
| Retriever | `rag/search_chunks.py`, `rag/vector_search_demo.py` | Azure OpenAI Embedding + Azure AI Search | query に関連する chunks を返す |
| ContextBuilder | `rag/build_context.py` | Mostly reusable application logic | retrieved chunks を citation-aware context に整形する |
| AnswerGenerator | `rag/answer_demo.py` | Azure OpenAI Chat Completion | context に基づいて grounded answer を生成する |
| Evaluator | `rag/evaluate_demo.py`, `rag/eval_questions.json` | CI/regression evaluation, Application Insights metrics | retrieval / citation / insufficient evidence を評価する |

### DocumentLoader Boundary

責務:

```text
source documents を読み込み、RAG が扱いやすい document 形式に変換する。
```

現在:

```text
docs/*.md
data/news.json
data/news-history.json
→ rag/corpus.jsonl
```

Azure 化後:

```text
Blob Storage
scheduled ingestion
Azure Functions timer trigger
→ normalized documents
```

置き換え境界:

```text
DocumentLoader の output は id/source/title/text を持つ document list に固定する。
読み込み元が local file でも Blob Storage でも、後続の Chunker は同じ形で受け取れるようにする。
```

### Chunker Boundary

責務:

```text
document text を検索しやすい chunk に分割し、citation に必要な metadata を保持する。
```

現在:

```text
rag/corpus.jsonl
→ fixed-size chunking
→ rag/chunks.jsonl
```

Azure 化後:

```text
Azure-hosted ingestion process
→ heading-aware / token-based chunks
→ Azure AI Search indexing payload
```

置き換え境界:

```text
Chunker の output は id/document_id/source/title/chunk_index/text を持つ chunk list に固定する。
```

今後追加したい metadata:

```text
source_type
heading
published_at
document_type
```

### EmbeddingProvider Boundary

責務:

```text
text を embedding vector に変換する。
```

現在:

```text
rag/vector_search_demo.py
→ local term-frequency vector
→ cosine similarity の理解用 prototype
```

将来:

```text
AzureOpenAIEmbeddingProvider
→ Azure OpenAI Embedding
→ content_vector
```

置き換え境界:

```text
EmbeddingProvider の input は text、output は list[float] に固定する。
provider の中身が local mock でも Azure OpenAI でも、Retriever や indexing job は同じ interface で扱う。
```

必要な環境変数:

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

設計で考慮する点:

```text
retry
timeout
rate limit handling
batch embedding
cache by chunk_id + text_hash + deployment
secret management
```

重要:

```text
EmbeddingProvider は検索しない。
EmbeddingProvider は回答も生成しない。
EmbeddingProvider は text を vector に変換するだけ。
```

詳細:

```text
rag/embedding-provider-design.md
```

### EmbeddingCache Boundary

責務:

```text
chunk_id、text_hash、embedding deployment、api_version を使って、embedding を再利用できるか判定する。
```

現在:

```text
rag/embedding-cache-design.md
→ cache / batch indexing の設計
```

将来:

```text
rag/embedding_cache.jsonl
rag/build_embedding_cache.py
rag/prepare_vectorized_azure_search_docs.py
```

置き換え境界:

```text
EmbeddingCache は chunk text と既存 cache を比較し、embedding が必要な chunks だけを EmbeddingProvider に渡す。
```

cache key:

```text
chunk_id + text_hash + embedding_deployment + api_version
```

重要:

```text
embedding に失敗した chunk を空 vector のまま Azure AI Search に入れない。
```

詳細:

```text
rag/embedding-cache-design.md
```

### Retriever Boundary

責務:

```text
user query に関連する top k chunks を返す。
```

現在:

```text
keyword retrieval
local term-frequency vector search
```

Azure 化後:

```text
Azure OpenAI Embedding
Azure AI Search vector search
hybrid search
reranking
```

置き換え境界:

Retriever の入力:

```text
question
top_k
optional filters
```

Retriever の出力:

```text
score
id
document_id
source
title
chunk_index
text
```

重要:

```text
Retriever は回答を生成しない。
Retriever は「資料を探す」component であり、LLM による文章生成は AnswerGenerator の責務。
```

Azure API を Retriever に直接書き込まない理由:

```text
Azure API は認証、コスト、timeout、retry、rate limit、環境差異を伴う。
Retriever boundary を保つことで、local retriever、Azure AI Search retriever、test retriever を差し替えやすくなる。
```

### ContextBuilder Boundary

責務:

```text
retrieved chunks を LLM に渡せる citation-aware context に整形する。
```

現在:

```text
Top K chunks
→ [1] [2] citation context
```

Azure 化後:

この component は基本的に application logic として再利用できます。

置き換え境界:

```text
Retriever が local 実装でも Azure AI Search でも、同じ chunk result 形式を返せば ContextBuilder はそのまま使える。
```

重要:

```text
ContextBuilder は検索もしない。
ContextBuilder は回答も生成しない。
ContextBuilder は retrieved chunks を根拠として使いやすい形に整えるだけ。
```

### AnswerGenerator Boundary

責務:

```text
citation-aware context の範囲だけを使って grounded answer を生成する。
```

現在:

```text
rag/answer_demo.py
template-based conservative answer
```

Azure 化後:

```text
Azure OpenAI Chat Completion
grounded prompt
insufficient evidence handling
citation validation
```

置き換え境界:

AnswerGenerator の入力:

```text
question
citation-aware context
citations
```

AnswerGenerator の出力:

```text
answer
used_citations
insufficient_evidence flag
```

重要:

```text
AnswerGenerator は資料を探さない。
AnswerGenerator は Retriever が返した context の範囲だけで回答する。
```

Azure API を AnswerGenerator に閉じ込める理由:

```text
LLM API は token cost、timeout、safety behavior、model version、prompt 変更の影響を受ける。
AnswerGenerator boundary を作ることで、template prototype と Azure OpenAI 実装を安全に差し替えられる。
```

### Evaluator Boundary

責務:

```text
retrieval と answer の品質を継続的に確認する。
```

現在:

```text
rag/eval_questions.json
rag/evaluate_demo.py
rag/eval_report.md
```

評価対象:

```text
source hit rate
citation coverage
insufficient evidence handling
```

Azure 化後:

```text
regression test
citation accuracy
hallucination check
retrieval score monitoring
Application Insights metrics
```

置き換え境界:

```text
Evaluator は retriever や answer generator の実装詳細に依存しすぎない。
local implementation でも Azure implementation でも同じ eval questions で比較できるようにする。
```

### Retriever と AnswerGenerator の違い

最重要の区別:

```text
Retriever は資料を探す。
AnswerGenerator は資料に基づいて回答を書く。
```

例:

```text
質問: Kimi K3 权重发布有什么风险？
```

Retriever の仕事:

```text
Kimi K3 に関連する chunk を data/news.json や news-history から探す。
```

AnswerGenerator の仕事:

```text
Retriever が返した chunk の範囲だけを使って、许可、部署约束、运行成本、数据合规などのリスクを citation 付きで説明する。
```

この区別を守る理由:

```text
検索と回答生成を混ぜると、テスト、差し替え、失敗分析が難しくなる。
検索が悪いのか、context が悪いのか、LLM 回答が悪いのかを切り分けられなくなる。
```

### なぜ Azure API 呼び出しを検索スクリプトに直接書かないか

理由:

- Azure API key や endpoint を安全に管理する必要がある
- timeout や rate limit に対応する必要がある
- retry policy が必要になる
- embedding や chat completion にはコストがかかる
- local development と production で実行環境が違う
- テスト時に毎回 Azure API を呼ぶと遅く、費用もかかる
- model version や deployment name を変更しやすくする必要がある

結論:

```text
Azure API は component の内部実装として閉じ込める。
外側の pipeline は input/output contract にだけ依存する。
```

## Current Limitations

### 1. 本物の embedding ではない

`vector_search_demo.py` は local term-frequency vector を使っています。これは vector search の流れを理解するための demo であり、本物の semantic embedding ではありません。

影響:

- 表現ゆれに弱い
- 意味的に近いが字面が違う質問に弱い
- docs 系質問で失敗しやすい

### 2. docs と news の検索範囲が混ざっている

現在は `docs/*.md`、`data/news.json`、`data/news-history.json` を同じ chunks として検索しています。

影響:

- source policy や data schema の質問でも、news-history の chunk が上位に出ることがある

改善案:

- `source_type` metadata を追加する
- docs only / news only filter を追加する
- docs を boost する retrieval option を追加する

### 3. chunking が heading-aware ではない

現在は固定長 chunking です。

影響:

- `docs/news-data-format.md` のような長い schema 文書では、必要な見出しと説明が分断されやすい

改善案:

- Markdown heading 単位で chunking する
- heading を metadata として保存する
- required fields など重要 section を優先検索できるようにする

### 4. answer generation は template prototype

`answer_demo.py` は LLM を使わない保守的な回答草稿です。

影響:

- 自然な要約や複数 source の統合は弱い

改善案:

- Azure OpenAI Chat Completion を使う
- grounded prompt を設計する
- citation validation を追加する

## Azure Roadmap

### Phase 1: Azure OpenAI Embedding

目的:

```text
local vector demo を本物の semantic embedding に置き換える。
```

想定:

- Azure OpenAI embedding deployment
- chunk text を embedding に変換
- query も embedding に変換
- cosine similarity または Azure AI Search vector search

### Phase 2: Azure AI Search

目的:

```text
chunks と vectors を検索 index として管理する。
```

想定 index fields:

| Field | Purpose |
|---|---|
| `id` | chunk id |
| `document_id` | 元 document id |
| `source` | citation source |
| `title` | 表示用タイトル |
| `chunk_index` | document 内の chunk 番号 |
| `text` | 回答根拠 |
| `content_vector` | embedding vector |
| `source_type` | docs / current_news / history_news |
| `heading` | Markdown heading |

### Phase 3: Azure Functions API

目的:

```text
RAG pipeline を API として呼び出せるようにする。
```

想定 endpoints:

```text
POST /ask
POST /ingest
GET /health
```

### Phase 4: Observability

目的:

```text
検索品質、回答品質、コスト、失敗を監視する。
```

想定:

- Application Insights
- query log
- retrieval score log
- citation missing rate
- insufficient evidence rate
- latency
- token cost

### Phase 5: Security

目的:

```text
企業 RAG として最低限必要な安全設計を入れる。
```

想定:

- Key Vault
- Managed Identity
- secret をコードに置かない
- PII を raw log に保存しない
- prompt injection 対策
- citation validation

## Current Project Status

### 実装済み

- Document Loading
- Chunking
- Keyword Retrieval
- Local Vector Search Demo
- Citation-aware Context Builder
- Grounded Answer Demo
- Evaluation Dataset
- Evaluation Script
- Evaluation Report

### 設計・改善予定

- Azure OpenAI Embedding
- Azure AI Search
- heading-aware chunking
- docs/news retrieval filter
- reranking
- Azure Functions API
- Application Insights
- Key Vault / Managed Identity

## 面接用説明

```text
RAG の処理全体を、ドキュメント読み込み、chunking、検索、citation 付き context 作成、回答生成、評価という pipeline として整理しました。
```

```text
現在はローカル prototype として実装し、retriever の失敗も evaluation report に記録しています。次の段階では Azure OpenAI Embedding と Azure AI Search に置き換え、semantic search と source metadata による citation を強化する予定です。
```

## Portfolio Summary

```text
Documented the end-to-end RAG pipeline architecture, including document ingestion, chunking, retrieval, citation-aware context building, grounded answering, and evaluation.
```
