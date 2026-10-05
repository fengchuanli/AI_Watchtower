# AI Watchtower RAG Assistant

AI Watchtower の記事（`docs/*.md`）と最新・過去ニュース（`data/news.json`, `data/news-history.json`）を知識ベースにした RAG プロトタイプです。
全体の設計は [`docs/architecture.md`](docs/architecture.md)、学習記録は [`docs/learning-notes.md`](docs/learning-notes.md) を見てください。

## ディレクトリ構成

```text
rag/
├── README.md        ← このファイル（入口）
├── scripts/         Python の処理スクリプト
├── tests/           unittest
├── data/            生成データ
└── docs/
    ├── architecture.md    全体構成
    ├── learning-notes.md  学習ノート
    ├── design/            設計ドキュメント
    ├── azure/             Azure 連携ドキュメント
    └── evaluation/        評価レポート・評価設計
```

## よく使うコマンド

すべてリポジトリのルート（`ai-watchtower/`）で実行します。

```bash
# 1. 知識ベースを作り直す（ニュース更新後など）
python3 rag/scripts/ingest_docs.py          # docs + news → data/corpus.jsonl
python3 rag/scripts/chunk_docs.py           # corpus → data/chunks.jsonl
python3 rag/scripts/prepare_azure_search_docs.py

# 2. ローカルで検索・回答・評価
python3 rag/scripts/answer_demo.py "Kimi K3 权重发布有什么风险" --top-k 3 --mode vector
python3 rag/scripts/evaluate_demo.py --mode vector --top-k 5

# 3. Azure OpenAI embedding（.env を先に読み込む）
set -a; source .env; set +a
python3 rag/scripts/check_azure_openai_embedding_readiness.py
python3 rag/scripts/azure_openai_embedding_smoke_test.py --expected-dimension 1536
python3 rag/scripts/build_embedding_cache.py            # 新規・変更 chunk だけ embedding
python3 rag/scripts/inspect_embedding_cache.py          # hit / miss を確認

# 4. Azure AI Search（vector 入り payload を作ってから）
python3 rag/scripts/prepare_vectorized_azure_search_docs.py --expected-dimension 1536
python3 rag/scripts/prepare_azure_search_upload_actions.py --action mergeOrUpload --expected-dimension 1536
python3 rag/scripts/azure_search_index.py create-index   # index 作成（schema は docs/azure/azure-search-schema.md）
python3 rag/scripts/azure_search_index.py upload         # 1273 件を upload
python3 rag/scripts/azure_search_index.py status         # 件数・容量を確認
python3 rag/scripts/azure_search_index.py query "来源可信度怎么判断" --hybrid --auto-route

# 5. 質問 → 根拠付き回答（Azure AI Search + gpt-5.4-mini）
python3 rag/scripts/ask_pipeline.py "怎么判断一条消息的出处靠不靠谱？" --retriever azure-vector --generator azure

# 6. 評価（ローカル vs Azure、source 種別の指定方法ごと）
python3 rag/scripts/evaluate_demo.py --retriever compare --routing auto   # 4 backend を比較
python3 rag/scripts/evaluate_demo.py --retriever all --routing none      # ローカルのみ（Azure 不要）

# 7. テスト
python3 -m unittest discover -s rag/tests
```

## scripts/（処理の流れ順）

| ステップ | スクリプト | 役割 |
|---|---|---|
| 読み込み | `ingest_docs.py` | Markdown とニュース JSON を `data/corpus.jsonl` に変換 |
| 分割 | `chunk_docs.py` | 文書を chunk に分割して `data/chunks.jsonl` に保存 |
| 検索 | `search_chunks.py` | キーワード検索 |
| 検索 | `vector_search_demo.py` | ローカル向量（単語頻度）による vector search demo |
| 検索 | `source_filters.py` | docs / 最新ニュース / 過去ニュースの絞り込み、質問から source 種別を推定（`route_source_types`） |
| 検索 | `retrievers.py` | ローカル・Azure の retriever を同じ interface に揃える |
| 検索 | `azure_search_retriever.py` | Azure AI Search の request / response 変換 |
| 回答 | `build_context.py` | 検索結果に citation 番号を付けて context を作る |
| 回答 | `answer_demo.py` | context の範囲だけで保守的な回答草稿を作る |
| 回答 | `ask_pipeline.py` | 質問 → 検索 → context → 回答 を 1 本にまとめる |
| 回答 | `llm_answer.py` | Azure OpenAI（gpt-5.4-mini）で context だけを根拠に回答。引用番号を検証し、根拠がなければ「資料不足」と返す |
| 評価 | `evaluate_demo.py` | `data/eval_questions.json` で評価。`--retriever` でローカル / Azure、`--routing hint/auto/none` で source 種別の決め方を切り替え |
| Embedding | `embedding_providers.py` | Azure OpenAI embedding の呼び出し（key は表示しない） |
| Embedding | `check_azure_openai_embedding_readiness.py` | 環境変数と payload の事前チェック（API は呼ばない） |
| Embedding | `azure_openai_embedding_smoke_test.py` | 1 件だけ実 API に送って疎通確認 |
| Embedding | `embedding_cache.py` | embedding cache の読み書き（chunk ID + text hash + deployment + API version） |
| Embedding | `build_embedding_cache.py` | 未 cache の chunk を 16 件ずつ embedding して保存 |
| Embedding | `inspect_embedding_cache.py` | cache の hit / miss を確認（API は呼ばない） |
| Azure Search | `prepare_azure_search_docs.py` | chunks → `data/azure_search_docs.jsonl`（vector は空） |
| Azure Search | `prepare_vectorized_azure_search_docs.py` | cache の vector を `content_vector` に反映 |
| Azure Search | `prepare_azure_search_upload_actions.py` | upload 用 `@search.action` を付けて検証 |
| Azure Search | `azure_search_index.py` | index 作成・upload・件数確認・vector / hybrid 検索のテスト |

## data/

| ファイル | 内容 | Git |
|---|---|---|
| `corpus.jsonl` | 読み込んだ文書（265 件） | 管理する |
| `chunks.jsonl` | chunk（1273 件） | 管理する |
| `azure_search_docs.jsonl` | Azure AI Search 用 payload（vector 空） | 管理する |
| `eval_questions.json` | 評価用の質問と期待 source | 管理する |
| `embedding_cache.jsonl` | 実 embedding（1273 件 × 1536 次元、約 40MB） | **管理しない**（`build_embedding_cache.py` で再生成） |
| `vectorized_azure_search_docs.jsonl` / `azure_search_upload_actions.jsonl` | vector 入り payload | **管理しない**（再生成可能） |

## docs/

| フォルダ | ファイル | 内容 |
|---|---|---|
| `docs/` | `architecture.md` | 全体構成・コンポーネントの責務・Azure roadmap |
| `docs/` | `learning-notes.md` | Day ごとの学習ノート |
| `design/` | `embedding-provider-design.md` | embedding provider の境界設計 |
| `design/` | `embedding-cache-design.md` | cache と batch indexing の設計 |
| `design/` | `embedding-cache-file.md` | cache ファイルの実装 |
| `design/` | `retriever-abstraction-ask-pipeline.md` | retriever の抽象化と ask pipeline |
| `design/` | `source-aware-retrieval.md` | source 種別による絞り込み |
| `design/` | `question-routing.md` | 質問から検索対象の種別を推定するルールと評価モード |
| `azure/` | `azure-openai-embedding-provider.md` | Azure OpenAI embedding provider |
| `azure/` | `azure-openai-embedding-readiness.md` | 実 API 前の準備チェック |
| `azure/` | `azure-openai-embedding-smoke-test.md` | 1 件疎通テスト |
| `azure/` | `azure-search-schema.md` | Azure AI Search index schema |
| `azure/` | `vectorized-azure-search-docs.md` | cache から vector 入り payload を作る |
| `azure/` | `azure-search-upload-actions.md` | upload action の準備 |
| `azure/` | `azure-search-retriever-contract.md` | Azure Search retriever の contract |
| `evaluation/` | `eval_report.md` | 評価レポート |
| `evaluation/` | `backend-agnostic-rag-evaluation.md` | backend に依存しない評価設計 |

## 注意

- `.env`（Azure の endpoint / key）は Git 管理外です。key を表示・commit しないでください。
- Azure OpenAI のネットワークは自宅の IP のみ許可しています。別のネットワークからは 403 になります。
- Azure AI Search は Free 層（`srch-ai-watchtower-20260929`、50MB、index 3 個まで）。書き込みには管理者キーが必要です。
  vector は int8 圧縮・`stored=false` で容量を節約しています（`docs/azure/azure-search-schema.md` 参照）。index の作り直しは `delete-index --yes <index名>` → `create-index` → `upload`。
