#!/usr/bin/env bash
# Deploy the Ask API (rag/api + rag/scripts) to Azure Functions (Flex Consumption, Python 3.11).
#
#   bash rag/scripts/deploy_ask_api.sh              # first run: create resources + settings + code
#   bash rag/scripts/deploy_ask_api.sh --code-only  # later: upload new code only
#
# Needs: Azure CLI (`brew install azure-cli`) and `az login`. Reads .env; secrets are never printed.
# First run appends AZURE_RESOURCE_GROUP / AZURE_FUNCTION_APP_NAME / AZURE_FUNCTION_STORAGE to .env.
set -euo pipefail

CODE_ONLY=0
[[ "${1:-}" == "--code-only" ]] && CODE_ONLY=1

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
[[ -f .env ]] || { echo "ERROR: .env not found in $ROOT"; exit 1; }
set -a; source .env; set +a

step() { echo; echo "==================== $* ===================="; }
append_env() { [[ -n "$(tail -c1 .env)" ]] && echo >> .env; printf '%s\n' "$@" >> .env; }

step "0/6 checks"
command -v az >/dev/null || { echo "ERROR: Azure CLI not found. Install: brew install azure-cli"; exit 1; }
az account show --query "{subscription:name, user:user.name}" -o tsv || { echo "ERROR: run 'az login' first"; exit 1; }

host_of() { echo "$1" | sed -E 's#https?://([^.]+)\..*#\1#'; }
SEARCH_NAME="$(host_of "$AZURE_SEARCH_ENDPOINT")"
OPENAI_NAME="$(host_of "$AZURE_OPENAI_ENDPOINT")"

if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
  AZURE_RESOURCE_GROUP="$(az resource list --name "$SEARCH_NAME" --resource-type Microsoft.Search/searchServices --query "[0].resourceGroup" -o tsv)"
  [[ -n "$AZURE_RESOURCE_GROUP" ]] || { echo "ERROR: could not find resource group of $SEARCH_NAME"; exit 1; }
  append_env "AZURE_RESOURCE_GROUP=$AZURE_RESOURCE_GROUP"
fi
RG="$AZURE_RESOURCE_GROUP"
LOCATION="${AZURE_FUNCTION_LOCATION:-$(az group show -n "$RG" --query location -o tsv)}"
echo "resource group: $RG / region: $LOCATION / search: $SEARCH_NAME / openai: $OPENAI_NAME"

if [[ -z "${AZURE_FUNCTION_APP_NAME:-}" ]]; then
  SUFFIX="$(python3 -c 'import secrets; print(secrets.token_hex(3))')"
  AZURE_FUNCTION_APP_NAME="func-ai-watchtower-$SUFFIX"
  AZURE_FUNCTION_STORAGE="stawask$SUFFIX"
  append_env "AZURE_FUNCTION_APP_NAME=$AZURE_FUNCTION_APP_NAME" "AZURE_FUNCTION_STORAGE=$AZURE_FUNCTION_STORAGE"
  echo "new app name saved to .env: $AZURE_FUNCTION_APP_NAME"
fi
APP="$AZURE_FUNCTION_APP_NAME"
STORAGE="${AZURE_FUNCTION_STORAGE:?AZURE_FUNCTION_STORAGE missing in .env}"

if [[ $CODE_ONLY -eq 0 ]]; then
  step "1/6 create Function App (Flex Consumption)"
  if az functionapp show -g "$RG" -n "$APP" -o none 2>/dev/null; then
    echo "already exists: $APP"
  else
    if [[ -z "$(az functionapp list-flexconsumption-locations --query "[?name=='$LOCATION'].name" -o tsv)" ]]; then
      echo "ERROR: Flex Consumption is not available in $LOCATION. Add AZURE_FUNCTION_LOCATION=<region> to .env and rerun."
      exit 1
    fi
    az storage account create -g "$RG" -n "$STORAGE" -l "$LOCATION" --sku Standard_LRS --allow-blob-public-access false -o none
    az functionapp create -g "$RG" -n "$APP" --storage-account "$STORAGE" \
      --flexconsumption-location "$LOCATION" --runtime python --runtime-version 3.11 \
      --instance-memory 2048 -o none
    echo "created: $APP"
  fi
  # Cost guard: never scale beyond 2 instances.
  az functionapp scale config set -g "$RG" -n "$APP" --maximum-instance-count 2 -o none
  echo "maximum instance count: 2"

  step "2/6 read-only search key for the API"
  QUERY_KEY="$(az search query-key list -g "$RG" --service-name "$SEARCH_NAME" --query "[?name=='ask-api'].key | [0]" -o tsv)"
  if [[ -z "$QUERY_KEY" ]]; then
    QUERY_KEY="$(az search query-key create -g "$RG" --service-name "$SEARCH_NAME" --name ask-api --query key -o tsv)"
    echo "created query key 'ask-api' (search only, cannot change the index)"
  else
    echo "using existing query key 'ask-api'"
  fi

  step "3/6 app settings (values not printed)"
  az functionapp config appsettings set -g "$RG" -n "$APP" -o none --settings \
    "AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT" \
    "AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY" \
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT=$AZURE_OPENAI_EMBEDDING_DEPLOYMENT" \
    "AZURE_OPENAI_API_VERSION=$AZURE_OPENAI_API_VERSION" \
    "AZURE_OPENAI_CHAT_DEPLOYMENT=$AZURE_OPENAI_CHAT_DEPLOYMENT" \
    "AZURE_OPENAI_CHAT_API_VERSION=${AZURE_OPENAI_CHAT_API_VERSION:-2025-04-01-preview}" \
    "AZURE_SEARCH_ENDPOINT=$AZURE_SEARCH_ENDPOINT" \
    "AZURE_SEARCH_INDEX_NAME=$AZURE_SEARCH_INDEX_NAME" \
    "AZURE_SEARCH_API_KEY=$QUERY_KEY" \
    "ASK_RETRIEVER=azure-vector"
  echo "10 settings saved (search uses the read-only query key, not the admin key)"

  step "4/6 CORS (which web pages may call the API)"
  az functionapp cors add -g "$RG" -n "$APP" -o none \
    --allowed-origins "https://fengchuanli.github.io" "http://localhost:8000" "http://127.0.0.1:8000" || true
  az functionapp cors show -g "$RG" -n "$APP" --query allowedOrigins -o tsv
fi

step "5/6 package and deploy code (remote build)"
BUILD="$(mktemp -d)"
cp rag/api/function_app.py rag/api/host.json rag/api/requirements.txt "$BUILD/"
mkdir "$BUILD/scripts"
cp rag/scripts/*.py "$BUILD/scripts/"
(cd "$BUILD" && zip -qr ../ask-api.zip .)
ZIP="$(dirname "$BUILD")/ask-api.zip"
echo "package: $(ls "$BUILD/scripts" | wc -l | tr -d ' ') python files, $(du -h "$ZIP" | cut -f1)"
az functionapp deployment source config-zip -g "$RG" -n "$APP" --src "$ZIP" --build-remote true -o none
rm -rf "$BUILD" "$ZIP"
echo "deployed"

step "6/6 smoke test"
URL="https://$(az functionapp show -g "$RG" -n "$APP" --query defaultHostName -o tsv)"
echo "API base: $URL"
for i in $(seq 1 12); do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/health" || true)"
  [[ "$CODE" == "200" ]] && break
  echo "  health: $CODE (waiting for startup, $i/12)"; sleep 10
done
echo "health: $CODE"
echo "ask (about 0.4 JPY):"
curl -s -w '\nHTTP %{http_code}\n' "$URL/api/ask" -H 'Content-Type: application/json' \
  -d '{"question":"Kimi K3 权重发布有什么风险？"}' | cut -c1-400

echo
echo "Network settings (if ask returned 502, Azure is blocking the Function):"
echo "  AI Search:"
az search service show -g "$RG" -n "$SEARCH_NAME" --query "{publicNetworkAccess:publicNetworkAccess, ipRules:length(networkRuleSet.ipRules)}" -o json || true
OPENAI_RG="$(az resource list --name "$OPENAI_NAME" --resource-type Microsoft.CognitiveServices/accounts --query "[0].resourceGroup" -o tsv)"
echo "  Azure OpenAI ($OPENAI_NAME):"
az cognitiveservices account show -g "$OPENAI_RG" -n "$OPENAI_NAME" --query "{publicNetworkAccess:properties.publicNetworkAccess, defaultAction:properties.networkAcls.defaultAction, ipRules:length(properties.networkAcls.ipRules)}" -o json || true
echo
echo "Done. API: $URL/api/ask"
