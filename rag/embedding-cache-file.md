# Embedding Cache File Implementation

## 目的

Day 20 は、AzureOpenAIEmbeddingProvider が返す vector を、どの chunk / text / deployment / api_version で生成したものか追跡できる local cache file として扱う日です。

目的:

```text
chunk text
→ text_hash
→ EmbeddingProvider
→ vector
→ embedding cache record
```

## Day 20 Boundary

本日やること:

- `chunk_id + text_hash + embedding_deployment + api_version` を cache key として実装する
- cache record の JSONL 形式を実装する
- cache hit / miss / changed chunk を判定する
- deployment / api_version が変わった場合は cache miss にする
- vector が空または数値以外なら cache record を拒否する
- 現在の `rag/chunks.jsonl` を scan して hit/miss report を出す

本日やらないこと:

- Azure OpenAI に実 request を送らない
- 1273 chunks を embedding しない
- `rag/azure_search_docs.jsonl` の `content_vector` を更新しない
- Azure AI Search に upsert しない
- fake vector を本番 cache として保存しない

## Added Files

```text
rag/embedding_cache.py
rag/inspect_embedding_cache.py
rag/test_embedding_cache.py
```

将来の cache file:

```text
rag/embedding_cache.jsonl
```

Day20 では、本物の Azure vector がないため、この cache file はまだ作成しません。

## Cache Record

```json
{
  "chunk_id": "source-policy-0000",
  "text_hash": "sha256:...",
  "embedding_deployment": "text-embedding-3-large",
  "api_version": "2024-02-01",
  "vector": [0.012, -0.034, 0.088],
  "created_at": "2026-09-03T00:00:00Z",
  "updated_at": "2026-09-03T00:00:00Z"
}
```

## Cache Rules

cache hit:

```text
chunk_id が同じ
text_hash が同じ
embedding_deployment が同じ
api_version が同じ
```

changed chunk:

```text
chunk_id + deployment + api_version は cache にあるが、text_hash が違う。
```

cache miss:

```text
chunk_id が cache にない。
または embedding_deployment / api_version が違う。
```

重要:

```text
vector が空なら cache record として保存しない。
cache は成功した embedding だけを保存する。
```

## Local Inspection

現在の chunks と cache の状態を確認する command:

```bash
python3 -B rag/inspect_embedding_cache.py
```

Azure env がない場合でも実行できます。

期待される現在の結果:

```text
total chunks: 1273
cache hits: 0
cache misses: 1273
changed chunks: 0
No Azure request was sent.
No content_vector was updated.
```

これは失敗ではありません。まだ本物の embedding cache を作っていないため、全 chunk が miss になるのが正しい状態です。

## Local Contract Test

```bash
python3 -B rag/test_embedding_cache.py
```

確認すること:

- text hash が安定している
- unchanged chunk は cache hit になる
- 同じ chunk_id で text が変わると changed chunk になる
- deployment が変わると cache miss になる
- cache file の read/write round trip ができる
- 空 vector は cache record として拒否される

## Portfolio Summary

```text
Implemented a local embedding cache file layer that keys vectors by chunk ID, text hash, embedding deployment, and API version, with hit/miss/change inspection and validation that prevents empty or invalid vectors from being cached.
```

## 面接用説明

```text
Embedding の再計算を避けるために、chunk_id、text_hash、deployment、api_version を key にした local cache layer を実装しました。
```

```text
本文が変わっていない chunk は cache hit として再利用し、本文や embedding 設定が変わった場合は cache miss として再 embedding する設計にしています。
```
