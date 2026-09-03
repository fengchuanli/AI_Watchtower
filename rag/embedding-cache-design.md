# Embedding Cache and Batch Indexing Design

## 目的

このドキュメントは、AI Watchtower RAG Assistant で Azure OpenAI Embedding を使う前に、embedding cache と batch indexing の設計を整理するためのものです。

AI Watchtower のニュースは毎日更新されます。そのため、毎回すべての chunk を embedding し直す設計は避けます。

目的:

```text
変更された chunk だけ embedding する。
変更されていない chunk は cache から vector を再利用する。
```

## なぜ Cache が必要か

現在の RAG 対象には以下が含まれています。

```text
docs/*.md
data/news.json
data/news-history.json
```

Day 14 時点の chunk 数:

```text
1273 chunks
```

ニュースは毎日更新されるため、何も考えずに毎日 1273 chunks すべてを embedding すると、以下の問題が出ます。

- API cost が増える
- indexing job の実行時間が長くなる
- rate limit に当たりやすくなる
- 一部失敗したときの retry 範囲が大きくなる
- 変更がない docs まで毎回処理してしまう

そのため、embedding cache を使って、前回生成済みの vector を再利用します。

## Core Idea

基本方針:

```text
chunk_id と text_hash を見て、embedding が再利用できるか判断する。
```

判断ルール:

```text
chunk_id が cache に存在しない
→ 新規 chunk。embedding が必要。

chunk_id が cache に存在するが text_hash が変わった
→ 内容変更あり。embedding が必要。

chunk_id が cache に存在し、text_hash も同じ
→ 内容変更なし。cache の vector を再利用。

embedding deployment / api_version が変わった
→ vector の互換性が変わる可能性があるため、cache invalidation。
```

## Cache Key Design

cache key は、単に `chunk_id` だけでは不十分です。

理由:

```text
同じ chunk_id でも、text が変わったら vector も変える必要がある。
同じ text でも、embedding model や deployment が変わったら vector の意味が変わる可能性がある。
```

推奨 cache key:

```text
chunk_id + text_hash + embedding_deployment + api_version
```

例:

```text
news-current-venturebeat-kimi-k3-full-weights-2026-07-28-0000
+ sha256(text)
+ text-embedding-3-large
+ 2024-02-01
```

## Cache Record Format

local prototype では、将来以下のような cache file を持つ想定です。
Day20 で、この cache file を扱う local cache layer を実装しました。

想定ファイル:

```text
rag/embedding_cache.jsonl
```

対応ファイル:

```text
rag/embedding_cache.py
rag/inspect_embedding_cache.py
rag/test_embedding_cache.py
rag/embedding-cache-file.md
```

Day20 時点では、まだ本物の Azure vector がないため `rag/embedding_cache.jsonl` は作成していません。
cache layer は実装済みで、実 vector が取得できた後に successful embedding だけを保存します。

record example:

```json
{
  "chunk_id": "news-current-venturebeat-kimi-k3-full-weights-2026-07-28-0000",
  "text_hash": "sha256:7f8a...",
  "embedding_deployment": "text-embedding-3-large",
  "api_version": "2024-02-01",
  "vector": [0.012, -0.034, 0.088],
  "created_at": "2026-08-31T00:00:00Z",
  "updated_at": "2026-08-31T00:00:00Z"
}
```

重要:

```text
cache は vector だけでなく、どの text / deployment / api_version で作った vector かも保存する。
```

## Incremental Embedding Flow

毎日の更新処理は以下の流れにします。

```text
1. docs/news を読み込む
2. corpus.jsonl を生成する
3. chunks.jsonl を生成する
4. 各 chunk の text_hash を計算する
5. embedding cache を読む
6. cache hit の chunk は vector を再利用する
7. cache miss / changed chunk は batch に入れる
8. EmbeddingProvider.embed_batch() でまとめて embedding する
9. 新しい vector を cache に保存する
10. content_vector 入りの Azure Search docs を生成する
```

図:

```text
rag/chunks.jsonl
        ↓
calculate text_hash
        ↓
check embedding cache
        ↓
cache hit ─────────────→ reuse vector
        ↓
cache miss / changed
        ↓
batch embedding
        ↓
update cache
        ↓
rag/azure_search_docs.jsonl with content_vector
```

## Batch Indexing

batch embedding とは、1 chunk ずつ API を呼ぶのではなく、複数 chunk をまとめて embedding することです。

目的:

- API 呼び出し回数を減らす
- 実行時間を短くする
- retry 管理をしやすくする
- rate limit を制御しやすくする

例:

```text
changed chunks: 37
batch size: 16

batch 1: 16 chunks
batch 2: 16 chunks
batch 3: 5 chunks
```

設計方針:

```text
batch size は固定値にせず、Azure OpenAI の制限、text length、rate limit、実行時間を見て調整できるようにする。
```

## Cache Invalidation

cache を使ってよい条件:

```text
chunk_id が同じ
text_hash が同じ
embedding_deployment が同じ
api_version が同じ
```

cache を使わない条件:

```text
text が変わった
embedding deployment が変わった
api_version が変わった
vector dimension が変わった
cache record が壊れている
embedding provider の設定が変わった
```

特に重要:

```text
text_hash が変わったら、同じ chunk_id でも再 embedding する。
```

## Handling Daily News Updates

毎日更新されるニュースに対しては、以下の処理にします。

```text
data/news.json に新しいニュースが入る
→ ingest_docs.py
→ chunk_docs.py
→ 新しい news chunk ができる
→ cache にない chunk だけ embedding
→ Azure AI Search に upsert
```

history に移動したニュースについては、source が変わる可能性があります。

例:

```text
data/news.json#xxx
data/news-history.json#xxx
```

この場合、`source` は citation metadata として変わります。ただし本文が同じなら、将来は `document_id` や stable news id を使って vector の再利用を検討できます。

初期方針:

```text
source が変わった chunk は安全側に倒して再 indexing する。
本文 text_hash が同じ場合でも、citation metadata 更新のため Azure AI Search document は upsert する。
```

## Upsert Strategy for Azure AI Search

Azure AI Search へは、全件削除して再登録するより、変更分を upsert する設計にします。

処理対象:

```text
new chunks
changed chunks
metadata changed chunks
deleted chunks
```

方針:

- 新規 chunk は upload
- 内容変更 chunk は merge or upload
- metadata 変更 chunk は merge
- 削除された chunk は delete

local prototype の段階では、まず以下を目標にします。

```text
changed / unchanged / deleted の件数を report できるようにする。
```

## Error Handling

batch embedding 中に失敗した場合は、失敗を隠さず記録します。

想定する失敗:

| Case | 方針 |
|---|---|
| one item failed | その chunk を retry queue に入れる |
| batch timeout | batch size を小さくして retry する |
| rate limit | backoff して retry する |
| invalid API key | job を停止する |
| cache read error | cache を使わずに進めるのではなく、原因を確認する |
| vector dimension mismatch | index schema と embedding deployment を確認する |

重要:

```text
embedding に失敗した chunk を空 vector のまま本番 index に入れない。
```

## Metrics to Record

daily indexing job では、以下を記録します。

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

この metrics は、将来 Application Insights に送る候補になります。

## Relation to Existing Files

現在の関連ファイル:

```text
rag/chunks.jsonl
rag/azure_search_docs.jsonl
rag/prepare_azure_search_docs.py
rag/embedding-provider-design.md
rag/embedding_providers.py
rag/embedding_cache.py
rag/inspect_embedding_cache.py
```

現在実装済みまたは将来使うファイル:

```text
rag/embedding_cache.jsonl
rag/test_embedding_cache.py
rag/prepare_vectorized_azure_search_docs.py
```

Day20 では cache record と hit/miss/change 判定まで実装しました。
`rag/embedding_cache.jsonl` と `rag/prepare_vectorized_azure_search_docs.py` は、本物の vector を取得した後に使います。

## Day 16 Completion Criteria

Day 16 の完了条件:

- embedding cache が必要な理由を説明できる
- `chunk_id` と `text_hash` の役割を説明できる
- cache key に deployment / api_version を含める理由を説明できる
- batch embedding の目的を説明できる
- 毎日ニュース更新時に変更分だけ処理する流れを説明できる
- cache invalidation の条件を説明できる
- 失敗した chunk を空 vector でごまかしてはいけない理由を説明できる

## Day 20 Implementation Update

Day20 で local embedding cache file layer を実装しました。

実装内容:

- `chunk_id + text_hash + embedding_deployment + api_version` の cache key
- JSONL cache record の read / write
- cache hit / miss / changed chunk の分類
- deployment / api_version 変更時の cache miss
- 空 vector / 非数値 vector の拒否
- 現在の `rag/chunks.jsonl` に対する cache inspection

実行:

```bash
python3 -B rag/inspect_embedding_cache.py
```

現在の結果:

```text
total chunks: 1273
cache hits: 0
cache misses: 1273
changed chunks: 0
```

これは、本物の Azure embedding cache がまだ存在しないため正しい状態です。

## Portfolio Summary

```text
Designed an incremental embedding cache and batch indexing strategy to avoid recomputing vectors for unchanged chunks during daily news updates.
```

## 面接用説明

```text
毎日ニュースが更新されるため、全 chunk を再 embedding するのではなく、chunk_id と text hash を使って変更された chunk だけを batch 処理する設計にしました。
```

補足:

```text
embedding deployment や api version が変わった場合は、vector の互換性が変わる可能性があるため cache を無効化する設計にしています。
```
