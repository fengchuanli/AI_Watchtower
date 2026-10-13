"""Azure Functions (Python v2 model) entry point for the AI Watchtower Ask API.

Routes:
  POST /api/ask      {"question": "..."}  -> grounded answer with citations
  GET  /api/health                         -> {"status": "ok"}

All logic lives in rag/scripts/ask_service.py. At deploy time the scripts are
copied next to this file (./scripts); during local development ../scripts is used.
"""

import json
import sys
from pathlib import Path

import azure.functions as func

HERE = Path(__file__).resolve().parent
for candidate in (HERE / "scripts", HERE.parent / "scripts"):
    if candidate.is_dir():
        sys.path.insert(0, str(candidate))
        break

from ask_service import handle_ask  # noqa: E402

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


def _json(status: int, body: dict) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(body, ensure_ascii=False),
        status_code=status,
        mimetype="application/json",
        charset="utf-8",
    )


@app.route(route="ask", methods=["POST"])
def ask(req: func.HttpRequest) -> func.HttpResponse:
    status, body = handle_ask(req.get_body())
    return _json(status, body)


@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    return _json(200, {"status": "ok"})
