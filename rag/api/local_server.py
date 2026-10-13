"""Local dev server for the Ask API — no Azure Functions tools needed.

    python3 rag/api/local_server.py            # http://localhost:7071
    curl -s localhost:7071/api/ask -H 'Content-Type: application/json' \
         -d '{"question":"Kimi K3 权重发布有什么风险？"}'

Reads ../../.env itself. Uses the same handle_ask() as the Azure Function,
so what works here works after deployment. Open http://localhost:7071/ for a tiny test page.
"""

import argparse
import json
import logging
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / "scripts"))


def load_dotenv(path: Path) -> int:
    """Minimal .env loader: KEY=VALUE lines, existing env vars win."""
    if not path.exists():
        return 0
    count = 0
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.replace("export ", "").strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
            count += 1
    return count


TEST_PAGE = """<!doctype html><meta charset="utf-8"><title>Ask Watchtower (local)</title>
<style>body{font:15px/1.6 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px}
input{width:75%;padding:8px}button{padding:8px 14px}pre{white-space:pre-wrap;background:#f4f4f4;padding:12px}
li{margin:6px 0}small{color:#666}</style>
<h2>Ask Watchtower <small>(local test)</small></h2>
<form id=f><input id=q placeholder="例：Kimi K3 权重发布有什么风险？" autofocus><button>Ask</button></form>
<p id=s></p><pre id=a hidden></pre><ol id=c></ol>
<script>
f.onsubmit=async e=>{e.preventDefault();s.textContent='检索中…';a.hidden=true;c.innerHTML='';
 const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q.value})});
 const d=await r.json(); if(!r.ok){s.textContent='错误 '+r.status+': '+d.error;return}
 s.textContent=(d.answerable?'':'【资料不足】 ')+d.latency_ms+' ms · tokens '+d.usage.prompt_tokens+'/'+d.usage.completion_tokens;
 a.textContent=d.answer;a.hidden=false;
 for(const x of d.citations){const li=document.createElement('li');li.value=x.id;
  li.innerHTML='<b></b><br><small></small>';li.querySelector('b').textContent=x.title+(x.heading?' › '+x.heading:'');
  li.querySelector('small').textContent=x.source+' — '+x.snippet;c.appendChild(li)}}
</script>"""


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        # Local dev only: let a page served from another localhost port call this API.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, data: dict) -> None:
        self._send(status, json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_OPTIONS(self) -> None:  # CORS preflight
        self._send(204, b"", "text/plain")

    def do_GET(self) -> None:
        if self.path in ("/", "/index.html"):
            self._send(200, TEST_PAGE.encode("utf-8"), "text/html; charset=utf-8")
        elif self.path == "/api/health":
            self._json(200, {"status": "ok"})
        else:
            self._json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        if self.path != "/api/ask":
            self._json(404, {"error": "Not found"})
            return
        from ask_service import MAX_BODY_BYTES, handle_ask

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(min(length, MAX_BODY_BYTES + 1))
        status, data = handle_ask(body)
        self._json(status, data)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=7071)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    loaded = load_dotenv(REPO / ".env")
    print(f"Loaded {loaded} variables from .env (values not printed)")
    print(f"Ask API: http://localhost:{args.port}/api/ask   Test page: http://localhost:{args.port}/")
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
