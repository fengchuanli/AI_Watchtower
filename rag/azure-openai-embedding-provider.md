# Azure OpenAI Embedding Provider

## 目的

Day 19 は、Day18 の one-text smoke test を `AzureOpenAIEmbeddingProvider` として切り出し、下流の batch embedding、cache、Retriever が Azure API の詳細に直接依存しない形にする日です。

目的の境界:

```text
text
→ EmbeddingProvider
→ list[float]
```

## Day 19 Boundary

本日やること:

- `EmbeddingProvider` base class を用意する
- `AzureOpenAIEmbeddingConfig` で env 由来の設定をまとめる
- `AzureOpenAIEmbeddingProvider.embed_text()` を実装する
- 小さな `embed_batch()` 境界を用意する
- response から `list[float]` を取り出す contract をテストする
- expected dimension mismatch を失敗にする
- HTTP error / timeout / invalid response を provider error に変換する
- API key を error message から redact する

本日やらないこと:

- 全 chunk を embedding しない
- embedding cache を作らない
- `content_vector` を更新しない
- Azure AI Search に upsert しない
- Retriever を Azure に置き換えない

## Added Files

```text
rag/embedding_providers.py
rag/test_embedding_provider_contract.py
```

更新:

```text
rag/azure_openai_embedding_smoke_test.py
```

Day18 の smoke test script は、直接 HTTP 処理を持つのではなく、Day19 の provider を使う形に変えました。

## Provider Contract

```python
class EmbeddingProvider:
    def embed_text(self, text: str) -> list[float]:
        ...

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...
```

責務:

```text
EmbeddingProvider は text を vector に変換するだけ。
検索しない。
回答を生成しない。
Azure AI Search に upload しない。
```

## Azure Config

`AzureOpenAIEmbeddingConfig.from_env()` は以下を読みます。

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

設定エラー:

- missing env は API call 前に失敗
- endpoint が `https://` でなければ失敗
- API key は provider summary や error message に表示しない

## Error Model

| Error | Meaning |
|---|---|
| `EmbeddingConfigurationError` | env / endpoint の設定問題 |
| `EmbeddingRequestError` | HTTP error、timeout、network error |
| `EmbeddingResponseError` | response が embedding contract を満たさない |
| `EmbeddingDimensionError` | vector dimension が schema と合わない |

重要:

```text
provider は失敗を空 vector に変換しない。
下流は error を見て処理を止める。
```

## Local Contract Test

実 Azure 環境がない状態でも、fake transport で provider contract を確認できます。

```bash
python3 -B rag/test_embedding_provider_contract.py
```

確認すること:

- missing env が configuration error になる
- `embed_text()` が `list[float]` を返す
- `embed_batch()` が index order を維持する
- non-number embedding value を拒否する
- dimension mismatch を拒否する
- HTTP error message から API key を redact する

## Portfolio Summary

```text
Implemented an Azure OpenAI Embedding provider boundary with environment-based configuration, single-text and small-batch embedding methods, response contract validation, dimension checks, and secret-safe error handling.
```

## 面接用説明

```text
Azure OpenAI Embedding の API 呼び出しを Provider として切り出し、検索処理や batch indexing が endpoint、API key、retry、response parsing などの詳細に直接依存しない構成にしました。
```

```text
また、response が list[float] であること、dimension が想定と一致すること、失敗時に空 vector を成功扱いしないことを contract test で確認しています。
```
