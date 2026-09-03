# Embedding Provider Design

## 目的

このドキュメントは、AI Watchtower RAG Assistant に Azure OpenAI Embedding を接続する前に、embedding 処理の責務と差し替え境界を整理するためのものです。

Day 14 では、`rag/chunks.jsonl` を Azure AI Search に登録しやすい形式へ変換し、`content_vector` を空配列として予約しました。

```text
rag/chunks.jsonl
→ rag/prepare_azure_search_docs.py
→ rag/azure_search_docs.jsonl
```

Day 15 の目的は、この `content_vector` に将来どのように embedding を入れるかを設計することです。

本日は実 Azure API を呼びません。まずは以下を明確にします。

```text
text
→ EmbeddingProvider
→ list[float]
→ content_vector
```

## なぜ Provider に分離するか

embedding は RAG pipeline の中で重要ですが、Azure OpenAI API を各 script に直接書き込むべきではありません。

理由:

- API key と endpoint を安全に管理する必要がある
- timeout、retry、rate limit を処理する必要がある
- embedding にはコストが発生する
- local 検証と production 実行で環境が違う
- test 実行のたびに Azure API を呼ぶと遅く、高く、不安定になる
- deployment name や model version が後で変わる可能性がある

そのため、外側の pipeline は `EmbeddingProvider` という抽象的な境界だけを使います。

```text
pipeline は provider に text を渡す。
provider は vector を返す。
provider の中身が local mock でも Azure OpenAI でも、pipeline 側は同じ形で扱う。
```

## Component Boundary

### EmbeddingProvider

責務:

```text
入力 text を embedding vector に変換する。
```

入力:

```text
text: string
```

出力:

```text
list[float]
```

interface image:

```python
class EmbeddingProvider:
    def embed_text(self, text: str) -> list[float]:
        ...

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...
```

重要:

```text
EmbeddingProvider は検索しない。
EmbeddingProvider は回答を生成しない。
EmbeddingProvider は text を vector に変換するだけ。
```

## Current Local Implementation

現在の local prototype では、本物の embedding はまだ使っていません。

対応ファイル:

```text
rag/vector_search_demo.py
```

現在の役割:

- query text を local term-frequency vector に変換する
- chunk text を local term-frequency vector に変換する
- cosine similarity で比較する

これは Azure OpenAI Embedding の代替ではありません。あくまで vector search の流れを理解するための mock 実装です。

```text
LocalMockEmbeddingProvider
→ コストなし
→ API key 不要
→ local で高速に試せる
→ semantic quality は低い
```

## Current Azure Implementation

Day19 で、Azure OpenAI Embedding を呼び出す provider boundary を実装しました。

対応ファイル:

```text
rag/embedding_providers.py
rag/azure-openai-embedding-provider.md
rag/test_embedding_provider_contract.py
```

責務:

- Azure OpenAI embedding deployment に text を送る
- response から vector を取り出す
- timeout / retry / rate limit を処理する
- 失敗時に pipeline が判断できる error を返す
- small batch embedding の境界を提供する
- API key を error message から redact する
- expected dimension mismatch を失敗にする

現在の入力:

```text
chunk text
user query
small text batch
```

現在の出力:

```text
list[float]
list[list[float]]
```

次の段階で、この vector を embedding cache に保存し、`rag/azure_search_docs.jsonl` の `content_vector` に入れて Azure AI Search に upload します。

重要:

```text
Day19 では provider implementation まで。
全 chunk の batch embedding、cache 保存、Azure AI Search upsert はまだ行わない。
```

## Environment Variables

Azure OpenAI の接続情報は code に直接書きません。

必要になる想定環境変数:

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

設計方針:

- API key を git に commit しない
- `.env` は local 開発用に限定する
- production では Key Vault や Managed Identity を検討する
- endpoint / deployment name は環境ごとに切り替えられるようにする

## Error Handling

embedding 生成では、以下の失敗を想定します。

| Case | 方針 |
|---|---|
| empty text | embedding を作らず skip する |
| text too long | chunking を見直す、または token limit に合わせて truncate する |
| timeout | retry する。上限を超えたら失敗として記録する |
| rate limit | exponential backoff で待つ |
| temporary service error | retry する |
| invalid API key / endpoint | 即時停止し、設定エラーとして扱う |
| failure rate too high | indexing job 全体を失敗扱いにする |

重要:

```text
embedding 失敗を黙って空 vector にしない。
```

空 vector のまま index に入れると、検索品質が悪くなっても原因が見えにくくなります。

## Cost Control

embedding は chunk 数に比例してコストが増えます。

現在の chunk 数:

```text
1273 chunks
```

今後ニュースが毎日更新されるため、全件を毎回 embedding し直す設計は避けます。

コスト制御方針:

- `chunk_id` と `text hash` で cache する
- text が変わっていない chunk は embedding を再生成しない
- deployment / model version が変わった場合は cache key を分ける
- API 呼び出しは batch 化する
- daily update では新規または変更された news chunk だけ処理する
- 失敗した chunk は retry queue に入れる

cache key example:

```text
embedding_cache_key =
chunk_id + text_hash + embedding_deployment + api_version
```

## Relation to Azure AI Search

Azure OpenAI Embedding と Azure AI Search の役割は違います。

```text
Azure OpenAI Embedding:
text を vector に変換する

Azure AI Search:
vector と metadata を保存し、query vector に近い chunks を検索する
```

流れ:

```text
chunk text
→ AzureOpenAIEmbeddingProvider
→ content_vector
→ Azure AI Search index
→ query embedding
→ vector search
→ top k chunks
→ ContextBuilder
→ AnswerGenerator
```

## Relation to Retriever

Retriever は user query に関連する chunks を返す component です。

EmbeddingProvider は Retriever の内部または indexing job の中で使われますが、Retriever そのものとは責務が違います。

```text
EmbeddingProvider:
text を vector にする

Retriever:
query に関連する top k chunks を返す
```

Azure 化後の Retriever は、内部で以下を使う可能性があります。

```text
EmbeddingProvider
Azure AI Search
filters
hybrid search
reranking
```

ただし Retriever の出力 contract は変えません。

```text
score
id
document_id
source
title
chunk_index
text
```

## Why Not Hardcode Azure API in Retrieval Script

`search_chunks.py` や `vector_search_demo.py` に Azure OpenAI API 呼び出しを直接書くと、以下の問題が出ます。

- local test が Azure API に依存する
- API key の管理範囲が広がる
- retry / rate limit の処理が script ごとに重複する
- Azure AI Search 以外の retriever を試しにくくなる
- evaluation 実行時に毎回コストが発生する
- production 障害時の切り分けが難しくなる

正しい境界:

```text
search script / retriever
→ EmbeddingProvider interface
→ LocalMockEmbeddingProvider or AzureOpenAIEmbeddingProvider
```

## Day 19 Update

Day19 では、Day18 の one-text smoke test にあった Azure API 呼び出し処理を `rag/embedding_providers.py` に移しました。

これにより、smoke test は provider の利用例になり、将来の batch embedding や Retriever は同じ provider boundary を使えます。

追加した error model:

| Error | 役割 |
|---|---|
| `EmbeddingConfigurationError` | env / endpoint の設定エラー |
| `EmbeddingRequestError` | HTTP error、timeout、network error |
| `EmbeddingResponseError` | response contract mismatch |
| `EmbeddingDimensionError` | Azure AI Search schema と dimension が合わない |

local contract test:

```bash
python3 -B rag/test_embedding_provider_contract.py
```

この test は fake transport を使うため、Azure API key や network がなくても provider の contract を確認できます。

## Day 15 Completion Criteria

Day 15 の完了条件:

- `EmbeddingProvider` の責務を説明できる
- local mock と Azure OpenAI embedding 実装の違いを説明できる
- Azure API key を code に書かない理由を説明できる
- retry / rate limit / timeout の必要性を説明できる
- embedding cost を cache と batch で抑える理由を説明できる
- `content_vector` が Azure AI Search の vector search に使われることを説明できる

## Portfolio Summary

```text
Designed an embedding provider boundary to separate local prototyping from Azure OpenAI embedding integration, considering retry, rate limit, cost control, and secret management.
```

## 面接用説明

```text
Embedding の処理を provider として分離し、ローカル検証用の mock 実装と Azure OpenAI 用の実装を差し替えられる設計にしました。
```

補足:

```text
Azure API を検索 script に直接書かず、provider boundary を用意することで、テスト、コスト管理、障害対応、将来の model 変更に対応しやすくしています。
```
