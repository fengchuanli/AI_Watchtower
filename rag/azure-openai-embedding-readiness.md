# Azure OpenAI Embedding Readiness

## 目的

Day 17 は、Azure OpenAI Embedding をいきなり本番接続する日ではありません。

目的は、AI Watchtower RAG Assistant が次に安全に実 Azure embedding smoke test へ進めるように、必要な環境変数、依存関係、最小検証スクリプト、失敗処理、実行順序を整理することです。

ここでの完成形:

```text
local RAG chunks
→ Azure Search indexing payload
→ readiness check
→ one-text embedding smoke test
→ batch embedding / cache / Azure AI Search upsert
```

## Day 17 Boundary

本日やること:

- Azure OpenAI Embedding 接続に必要な設定を整理する
- API key を code や Git に入れない前提を確認する
- `rag/azure_search_docs.jsonl` の payload が embedding を入れられる形か確認する
- 最小検証スクリプトの責務を決める
- 失敗時に止める条件を決める

本日やらないこと:

- 全 chunk を Azure に送らない
- 本番 index に vector を upload しない
- API key を repository に保存しない
- Azure API 呼び出しを retriever や search script に直書きしない

## Required Environment Variables

ローカル開発では `.env` や shell の環境変数で設定します。repository には値を commit しません。

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

役割:

| Variable | 役割 | 注意 |
|---|---|---|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `https://...` で始まる URL。code に固定しない。 |
| `AZURE_OPENAI_API_KEY` | local smoke test 用 key | 絶対に print / commit しない。将来は Key Vault / Managed Identity を検討する。 |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | embedding model deployment name | model name ではなく Azure 側の deployment name を使う。 |
| `AZURE_OPENAI_API_VERSION` | API version | cache key に含める。version 変更時は vector 互換性を確認する。 |

## Dependency Plan

Day 17 の readiness check は Python 標準ライブラリだけで動きます。

追加した script:

```text
rag/check_azure_openai_embedding_readiness.py
```

この script は Azure API を呼びません。確認するのは以下です。

- 必要な環境変数が存在するか
- API key を mask して表示できるか
- `rag/azure_search_docs.jsonl` が存在するか
- payload の required fields が揃っているか
- `content_vector` が空の状態か、すでに埋まっているか
- 次に呼ぶべき embeddings endpoint の path を説明できるか

実際に Azure OpenAI を呼ぶ Day18 以降では、以下の dependency を使う候補があります。

```text
openai
python-dotenv
```

ただし、面接で説明する時は package 名よりも責務を先に話します。

```text
openai package は Azure OpenAI API client として使う。
python-dotenv は local 開発時だけ .env を読み込むために使う。
production では secret を code や .env に置かず、Key Vault や Managed Identity を使う。
```

## Minimum Readiness Check

実行:

```bash
python3 rag/check_azure_openai_embedding_readiness.py
```

Azure 環境変数が未設定でも、この command は学習用 preflight として結果を表示します。

strict mode:

```bash
python3 rag/check_azure_openai_embedding_readiness.py --strict
```

`--strict` では、環境変数や payload に問題があると exit code 1 で停止します。

期待する見方:

```text
Azure OpenAI environment
- AZURE_OPENAI_ENDPOINT: missing
- AZURE_OPENAI_API_KEY: missing
- AZURE_OPENAI_EMBEDDING_DEPLOYMENT: missing
- AZURE_OPENAI_API_VERSION: missing

Azure AI Search payload
- documents: 1273
- empty content_vector: 1273
- filled content_vector: 0

Readiness: not ready
```

これは失敗ではありません。まだ Azure の秘密情報を入れていないため、次に何を設定すべきか見えている状態です。

## First Real Smoke Test Shape

Azure 接続を始める最初の smoke test では、全 chunk を送らず、短い 1 文だけを embedding します。

入力例:

```text
AI Watchtower helps Chinese readers understand AI news with source citations.
```

期待する response:

```text
data[0].embedding is list[float]
len(embedding) matches the Azure AI Search vector field dimension
```

確認すること:

- response に embedding vector がある
- vector dimension が想定と一致する
- API key が log に出ていない
- timeout / rate limit / invalid key の扱いを確認できる
- 失敗時に空 vector を保存しない

## Failure Handling

Azure OpenAI Embedding の最小接続で想定する失敗と判断です。

| Failure | 判定 | 対応 |
|---|---|---|
| missing env | configuration error | API call 前に止める |
| invalid endpoint | configuration error | endpoint と resource name を確認する |
| invalid API key | secret error | key を再発行し、log に出ていないか確認する |
| deployment not found | deployment error | deployment name と model deployment を確認する |
| API version error | compatibility error | API version と SDK/API path を揃える |
| timeout | transient error | short timeout + retry 上限を設定する |
| rate limit | capacity error | backoff、batch size、daily job cadence を調整する |
| empty text | input error | embedding せず skip する |
| vector dimension mismatch | index schema error | Azure AI Search schema の vector dimension を直す |

重要:

```text
embedding 失敗時に content_vector: [] のまま「成功」として扱わない。
```

empty vector は Day14 payload の placeholder としては正しいですが、本番 indexing 完了状態としては不正です。

## Implementation Order

Day18 以降はこの順番で進めます。

```text
1. readiness check を通す
2. one-text embedding smoke test を作る
3. response vector dimension を確認する
4. EmbeddingProvider interface に Azure implementation を追加する
5. 1 batch だけ chunks を embedding する
6. embedding cache に保存する
7. content_vector 入り azure_search_docs を生成する
8. Azure AI Search upsert は最後に小さく試す
```

この順番にする理由:

- API key / endpoint の設定ミスを早く見つける
- 1 文で成功確認してから chunk batch に進む
- vector dimension を確認してから index schema と合わせる
- cache を入れてから大量 embedding のコストを抑える
- Azure AI Search upsert 前に payload quality を確認する

## Portfolio Summary

```text
Prepared the Azure OpenAI Embedding implementation path by defining required environment variables, dependency boundaries, a local readiness check, smoke-test order, and failure handling before sending real chunks to Azure.
```

## 面接用説明

```text
Azure OpenAI Embedding に接続する前に、環境変数、deployment 名、API version、payload 形式、失敗時の停止条件を整理しました。
```

```text
まず全 chunk を送るのではなく、1 文だけで smoke test を行い、vector dimension と secret management を確認してから batch embedding と cache に進む設計にしています。
```
