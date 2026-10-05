#!/bin/bash
# Rebuild the Azure AI Search index from scratch and re-run the evaluation.
#
# Run on your Mac (Azure only allows your home IP):
#   bash rag/scripts/rebuild_azure_index.sh            # everything, then git push
#   bash rag/scripts/rebuild_azure_index.sh --no-push  # skip git push
#   bash rag/scripts/rebuild_azure_index.sh --no-eval  # skip the evaluation (saves ~10 JPY)
#
# Steps
#   1. embedding for new / changed chunks only (cache reuses the rest)
#   2. build upload data (vectors filled from the cache)
#   3. delete the old index (Azure side only; local files are untouched)
#   4. create the index again (retries while Azure finishes the delete), upload, status
#   5. evaluate 25 questions with Azure vector search + gpt-5.4-mini
#   6. git push
# The whole output is also saved to rag/data/logs/ so you can paste it.

set -euo pipefail

PUSH=1
EVAL=1
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    --no-eval) EVAL=0 ;;
    *) echo "Unknown option: $arg"; exit 2 ;;
  esac
done

cd "$(dirname "$0")/../.."
ROOT="$(pwd)"
if [ ! -f .env ]; then
  echo "No .env found in $ROOT"; exit 1
fi
set -a; . ./.env; set +a
INDEX="${AZURE_SEARCH_INDEX_NAME:-ai-watchtower-chunks}"

mkdir -p rag/data/logs
LOG="rag/data/logs/rebuild-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee "$LOG") 2>&1

step() { echo; echo "==================== $1 ===================="; }
run() { echo "\$ $*"; "$@"; }

step "1/6 embedding (new or changed chunks only)"
run python3 rag/scripts/build_embedding_cache.py

step "2/6 upload data"
run python3 rag/scripts/prepare_vectorized_azure_search_docs.py --expected-dimension 1536
run python3 rag/scripts/prepare_azure_search_upload_actions.py --action upload --expected-dimension 1536

step "3/6 delete old index ($INDEX)"
if ! python3 rag/scripts/azure_search_index.py delete-index --yes "$INDEX"; then
  echo "Delete failed or the index does not exist yet. Continuing."
fi

step "4/6 create index, upload, status"
created=0
for attempt in 1 2 3 4 5 6; do
  if python3 rag/scripts/azure_search_index.py create-index; then
    created=1; break
  fi
  echo "Azure is still removing the old index. Waiting 30 seconds (attempt $attempt/6)..."
  sleep 30
done
if [ "$created" -ne 1 ]; then
  echo "Could not create the index. Wait a few minutes and run this script again."; exit 1
fi
run python3 rag/scripts/azure_search_index.py upload
sleep 5
run python3 rag/scripts/azure_search_index.py status

if [ "$EVAL" -eq 1 ]; then
  step "5/6 evaluation (Azure vector + gpt-5.4-mini)"
  run python3 rag/scripts/evaluate_demo.py --retriever azure-vector --routing none --generator azure --quiet --show-answers
else
  step "5/6 evaluation skipped"
fi

if [ "$PUSH" -eq 1 ]; then
  step "6/6 git push"
  run git push origin main
else
  step "6/6 git push skipped"
fi

echo
echo "Done. Full log: $LOG"
