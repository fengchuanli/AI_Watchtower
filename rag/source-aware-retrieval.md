# Source-aware Retrieval

## Goal

Day26 prevents documentation questions, current-news questions, and historical-news questions
from competing inside one undifferentiated candidate pool.

Supported source types:

| Source type | Source pattern |
|---|---|
| `docs` | `docs/*.md` |
| `current_news` | `data/news.json#...` |
| `history_news` | `data/news-history.json#...` |

## Shared Behavior

`rag/source_filters.py` owns source classification, validation, local docs query expansion,
and Azure OData filter generation. Local keyword search, local vector search, and the Azure
Search contract now use the same source-type vocabulary.

The `Retriever` method remains backward compatible and adds one optional argument:

```text
retrieve(question, top_k, source_types=None)
```

Without `source_types`, retrieval behaves as before. With one or more source types, filtering
happens before local ranking. The Azure contract translates the same values into a filter such
as:

```text
source_type eq 'docs'
```

## Cross-language Docs Queries

Most project documentation is written in English, while evaluation questions are Chinese.
For explicit `docs` retrieval, the local prototype adds a small domain glossary to the query,
for example:

```text
来源可信度 -> source policy credibility evidence quality
新闻数据 / 必须字段 -> news data format / required fields
```

This is a transparent local bridge, not a replacement for semantic embedding. Azure OpenAI
embeddings should handle multilingual meaning more generally from Day27 onward.

## Evaluation Metadata

Each grounded case may declare `source_types` in `rag/eval_questions.json`. This declares the
search scope only. It does not reveal `expected_sources`, which remains a separate post-search
assertion.

Example:

```json
{
  "question": "新闻数据有哪些必须字段？",
  "expected_sources": ["docs/news-data-format.md"],
  "source_types": ["docs"]
}
```

## Commands

Run the filtered evaluation:

```bash
python3 -B rag/evaluate_demo.py --retriever all
```

Run the ask pipeline against docs only:

```bash
python3 -B rag/ask_pipeline.py "新闻数据有哪些必须字段？" --retriever vector --source-type docs
```

Repeat `--source-type` to include multiple categories.

## Result

| Backend | Day25 | Day26 | Source hit change |
|---|---:|---:|---:|
| `local-vector` | 3/5 | 5/5 | 50.0% -> 100.0% |
| `local-keyword` | 2/5 | 3/5 | 25.0% -> 50.0% |

The vector baseline now passes both docs questions, both current-news questions, and the
insufficient-evidence case. Keyword retrieval still misses the two cross-language docs targets;
this remaining gap is useful evidence for semantic retrieval rather than a reason to hide the
weaker backend.

## Portfolio Summary

```text
Added source-aware query routing across local and Azure-ready retrievers, including shared
source classification, pre-ranking filters, multilingual docs query expansion, and measurable
RAG evaluation gains from 60% to 100% on the local vector baseline.
```

## Interview Explanation

```text
検索前に docs、current news、history news の候補を分け、同じ filter metadata を local
retriever と Azure Search の OData filter で再利用できるようにしました。
```
