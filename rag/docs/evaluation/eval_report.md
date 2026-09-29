# RAG 評価レポート

## Summary

- 評価対象の質問数: 5
- PASS: 3
- FAIL: 2
- Evaluation pass rate: 60.0%
- Source hit rate: 50.0%
- 根拠不足ケースの成功数: 1/1

## Test Setup

- 対象プロジェクト: AI Watchtower RAG Assistant
- Knowledge base:
  - `docs/*.md`
  - `data/news.json`
  - `data/news-history.json`
- Retrieval mode: local vector demo
- Top K: 5
- 評価対象:
  - 期待した source が検索結果に含まれているか
  - 回答に citation が含まれているか
  - 根拠不足の質問に対して推測で回答していないか

## 評価方針

この評価の目的は、RAG が「それらしく回答できるか」ではなく、検索結果が期待した参照元に到達できているかを確認することです。

特に企業向け RAG では、回答の自然さだけでは不十分です。回答の根拠となる source、title、chunk_index を追跡できる必要があります。

## Passed Cases

### kimi-risk

質問:

```text
Kimi K3 权重发布有什么风险？
```

期待した source:

```text
data/news.json#venturebeat-kimi-k3-full-weights-2026-07-28
```

結果:

```text
PASS
```

理由:

期待した最新ニュース source が top 5 の検索結果に含まれていました。回答にも citation が含まれていました。

### agent-security

質問:

```text
Agent 安全风险包括什么？
```

期待した source:

```text
data/news.json#venturebeat-agent-security-gap-2026-07-25
```

結果:

```text
PASS
```

理由:

期待した Agent security 関連の最新ニュース source が検索結果に含まれていました。回答にも citation が含まれていました。

### insufficient-evidence

質問:

```text
AI Watchtower 预测 2030 年哪家公司会赢？
```

期待した source:

```text
なし
```

結果:

```text
PASS
```

理由:

この質問は、現在の knowledge base だけでは根拠のある回答ができない質問です。システムは推測で会社名を回答せず、根拠不足として扱いました。

## Failed Cases

### source-policy

質問:

```text
AI Watchtower 如何判断来源可信度？
```

期待した source:

```text
docs/source-policy.md
```

実際の結果:

```text
FAIL
```

実際には、`docs/source-policy.md` が top 5 に入りませんでした。

考えられる原因:

- 現在の local vector demo は、本物の embedding ではなく、term-frequency vector に近い簡易実装です。
- `data/news-history.json` には source、verification、credibility などの関連語を含むニュース chunk が多く、docs のルール文書より上位に出やすくなっています。
- 「来源可信度」という質問は概念的で、現在のローカル検索では `source-policy.md` の意図を十分に拾えていません。

改善方針:

- Azure OpenAI Embedding など、本物の semantic embedding を導入する。
- `docs/` と `data/` を source type として分け、必要に応じて docs を優先する filter または boost を入れる。
- source policy の見出しや metadata を強化する。
- 評価質問を増やし、source policy に関する失敗パターンを継続的に確認する。

### news-format

質問:

```text
新闻数据有哪些必须字段？
```

期待した source:

```text
docs/news-data-format.md
```

実際の結果:

```text
FAIL
```

実際には、`docs/news-data-format.md` が top 5 に入りませんでした。

考えられる原因:

- `docs/news-data-format.md` は長い schema 説明文書であり、chunk が多く分割されています。
- 「必须字段」という質問は一般的な表現で、現在の local vector demo では schema や required fields の意味を十分に扱えていません。
- ニュース履歴にも「数据」「字段」「来源」などの関連語が多く含まれており、検索結果が分散しています。

改善方針:

- heading-aware chunking を導入し、`Required Fields` などの見出し単位で chunk を作る。
- metadata に document type や heading を追加する。
- docs 系の質問では `docs/*.md` を優先する retrieval option を追加する。
- embedding-based retrieval と reranking を導入する。

## 全体分析

今回の評価では、ニュース関連の質問は比較的うまく検索できました。一方で、docs にあるルール文書や schema 文書に関する質問は失敗しました。

これは現在の実装が本物の semantic embedding ではなく、ローカルの簡易 vector search であるためです。Day 9 の目的は高いスコアを出すことではなく、どの質問で失敗するかを可視化することです。

## Next Improvements

次の改善候補:

- Azure OpenAI Embedding を使った semantic search
- Azure AI Search の vector index
- heading-aware chunking
- `source_type` metadata の追加
- docs と news の retrieval filter
- reranking
- evaluation question set の拡張

## Portfolio Summary

```text
RAG の評価用にテスト質問と期待 source を定義し、検索結果が正しい source に到達できるか、回答に citation が含まれるか、根拠不足の質問で推測回答を避けられるかを確認しました。
```

## 面接用説明

```text
評価結果は単なるスコアだけでなく、失敗した質問の原因分析と改善方針までドキュメント化しました。
```

```text
今回の評価では、ニュース系の質問は期待 source に到達できましたが、docs 系の概念質問では失敗しました。そのため、次の改善として semantic embedding、heading-aware chunking、source type filtering を検討しています。
```
