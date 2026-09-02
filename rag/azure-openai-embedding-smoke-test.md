# Azure OpenAI Embedding Smoke Test

## 目的

Day 18 は、Azure OpenAI Embedding を全 chunk に適用する前に、短い 1 文だけで実 API の response shape を確認する日です。

ここで確認したいこと:

```text
one short text
→ Azure OpenAI Embedding endpoint
→ data[0].embedding
→ list[float]
→ vector dimension
```

## Day 18 Boundary

本日やること:

- 1 文だけ Azure OpenAI Embedding に送る smoke test script を作る
- response の `data[0].embedding` が `list[float]` か確認する
- vector dimension を表示する
- optional で expected dimension と照合する
- Azure API key を log に出さない
- HTTP error / timeout / invalid response を読みやすく分類する

本日やらないこと:

- 1273 chunks を batch embedding しない
- `rag/azure_search_docs.jsonl` の `content_vector` を埋めない
- Azure AI Search に upload / upsert しない
- API key を repository や log に保存しない
- Retriever に Azure API 呼び出しを直接書き込まない

## Required Environment Variables

```text
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT
AZURE_OPENAI_API_VERSION
```

注意:

```text
AZURE_OPENAI_EMBEDDING_DEPLOYMENT は Azure Portal 上の deployment name。
model name と同じとは限らない。
```

## Script

新增:

```text
rag/azure_openai_embedding_smoke_test.py
```

この script は Python 標準ライブラリだけで動きます。

dry run:

```bash
python3 rag/azure_openai_embedding_smoke_test.py --dry-run
```

real smoke test:

```bash
python3 rag/azure_openai_embedding_smoke_test.py \
  --text "AI Watchtower citation test."
```

dimension check:

```bash
python3 rag/azure_openai_embedding_smoke_test.py \
  --text "AI Watchtower citation test." \
  --expected-dimension 1536
```

`--expected-dimension` は実際に使う Azure embedding deployment の dimension に合わせて指定します。

## Expected Success Output

成功時に確認すること:

```text
Smoke test passed
- embedding type: list[float]
- vector dimension: <number>
- API key printed: no
```

vector の preview は最初の数値だけ表示します。全 vector は log に出しません。

## Failure Handling

| Failure | Meaning | Handling |
|---|---|---|
| missing env | configuration is incomplete | API call 前に止める |
| endpoint not https | endpoint format risk | `https://...` に修正する |
| HTTP 400 | request / api version issue | API version と payload を確認する |
| HTTP 401 | invalid key | key を確認し、log に出していないか見る |
| HTTP 403 | permission / network policy issue | resource permission を確認する |
| HTTP 404 | endpoint or deployment issue | endpoint と deployment name を確認する |
| HTTP 429 | rate limit | batch size と retry cadence を調整する |
| timeout | transient network issue | timeout と retry 上限を設定する |
| invalid JSON | unexpected service response | body を短く確認し、処理を止める |
| missing embedding | response contract mismatch | 空 vector を保存せず失敗にする |
| dimension mismatch | index schema mismatch | Azure AI Search schema を合わせる |

重要:

```text
smoke test が失敗したら content_vector を更新しない。
空 vector は placeholder であって、embedding 成功を意味しない。
```

## Portfolio Summary

```text
Implemented a one-text Azure OpenAI Embedding smoke test that validates response shape, vector dimension, timeout and HTTP failure handling, and secret-safe logging before attempting batch embedding or Azure AI Search indexing.
```

## 面接用説明

```text
Azure OpenAI Embedding を全データに適用する前に、まず 1 文だけで smoke test を行い、返ってくる embedding が list[float] であることと vector dimension を確認するようにしました。
```

```text
API key は log に出さず、HTTP error や timeout の場合も空 vector を成功扱いしないようにしています。
```
