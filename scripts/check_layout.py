#!/usr/bin/env python3
"""版面回归基线：渲染每个页面并把可量化指标和基线对比。

用法：
    pip install playwright && playwright install chromium
    python3 scripts/check_layout.py            # 与基线对比
    python3 scripts/check_layout.py --update   # 重新生成基线

检查项（每个页面 × 桌面/移动两种宽度）：
    - 横向溢出像素（必须为 0）
    - 文字对比度低于 3.2:1 的元素数（必须为 0）
    - 页面总高度、关键区块的纵向位置（偏移超过阈值则报告）
    - 页面下载的 data/*.json 体积
"""
import argparse
import http.server
import json
import pathlib
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASELINE = ROOT / "scripts" / "layout-baseline.json"
PORT = 8788

PAGES = [
    ("index.html", ["#top3", "#feed", "#newsGrid"]),
    ("all-news.html", ["#historyList"]),
    ("tags.html", ["#tagResults"]),
    ("archive.html", ["#archiveEditionGrid"]),
    ("news-detail.html?id=anthropic-alignment-cybersecurity-incidents-2026-09-09", []),
    ("404.html", []),
]
VIEWPORTS = [("desktop", 1440, 900), ("mobile", 375, 812)]

# 高度这类指标会随新闻条数自然变化，只在偏离超过阈值时报告
HEIGHT_TOLERANCE = 0.25
PAYLOAD_TOLERANCE = 0.30

CONTRAST_JS = r"""() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lin = (v) => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  const L = (c) => 0.2126*lin(c.r)+0.7152*lin(c.g)+0.0722*lin(c.b);
  const bgOf = (el) => { let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.75) return c; n = n.parentElement; }
    return {r:12,g:19,b:34,a:1}; };
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.childNodes.length) continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (txt.length < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el);
    const l1 = L(fg), l2 = L(bg);
    const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    if (ratio < 3.2) bad.push(el.tagName.toLowerCase() + ' "' + txt.slice(0,24) + '"');
  }
  return [...new Set(bad)];
}"""


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = lambda *a, **kw: _QuietHandler(*a, directory=str(ROOT), **kw)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def measure(page, url, anchors, js_errors, payload):
    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(1800)
    result = {
        "overflow": page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth"),
        "height": page.evaluate("document.body.scrollHeight"),
        "lowContrast": len(page.evaluate(CONTRAST_JS)),
        "errorState": page.evaluate("!!document.querySelector('.feed-state.error')"),
        "jsErrors": len(js_errors),
        "payloadKb": round(sum(payload.values()) / 1024),
        "anchors": {},
    }
    for anchor in anchors:
        box = page.query_selector(anchor)
        result["anchors"][anchor] = round(box.bounding_box()["y"]) if box else None
    return result


def collect():
    from playwright.sync_api import sync_playwright

    report = {}
    httpd = serve()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            for path, anchors in PAGES:
                for name, width, height in VIEWPORTS:
                    page = browser.new_page(viewport={"width": width, "height": height})
                    js_errors, payload = [], {}
                    page.on("pageerror", lambda e: js_errors.append(str(e)))

                    def on_response(response):
                        if "/data/" in response.url:
                            try:
                                payload[response.url.split("/")[-1]] = len(response.body())
                            except Exception:
                                pass

                    page.on("response", on_response)
                    key = f"{path.split('?')[0]}::{name}"
                    report[key] = measure(page, f"http://127.0.0.1:{PORT}/{path}", anchors, js_errors, payload)
                    page.close()
            browser.close()
    finally:
        httpd.shutdown()
    return report


def compare(current, baseline):
    problems = []

    for key, now in current.items():
        was = baseline.get(key)

        if now["overflow"] > 0:
            problems.append(f"{key}: 横向溢出 {now['overflow']}px（必须为 0）")
        if now["lowContrast"] > 0:
            problems.append(f"{key}: {now['lowContrast']} 个元素对比度低于 3.2:1")
        if now["errorState"]:
            problems.append(f"{key}: 页面进入错误态")
        if now["jsErrors"]:
            problems.append(f"{key}: {now['jsErrors']} 个 JS 报错")

        if not was:
            problems.append(f"{key}: 基线缺失，请先跑 --update")
            continue

        if was["height"] and abs(now["height"] - was["height"]) / was["height"] > HEIGHT_TOLERANCE:
            problems.append(f"{key}: 页面高度 {was['height']} -> {now['height']}，超出 {int(HEIGHT_TOLERANCE * 100)}% 容差")

        if was["payloadKb"] and abs(now["payloadKb"] - was["payloadKb"]) / was["payloadKb"] > PAYLOAD_TOLERANCE:
            problems.append(f"{key}: 数据下载 {was['payloadKb']}KB -> {now['payloadKb']}KB，超出 {int(PAYLOAD_TOLERANCE * 100)}% 容差")

        for anchor, y in now["anchors"].items():
            old_y = was["anchors"].get(anchor)
            if old_y and y and abs(y - old_y) > max(200, old_y * HEIGHT_TOLERANCE):
                problems.append(f"{key}: {anchor} 位置 {old_y} -> {y}")

    return problems


def main():
    parser = argparse.ArgumentParser(description="版面回归基线检查")
    parser.add_argument("--update", action="store_true", help="重新生成基线")
    args = parser.parse_args()

    try:
        current = collect()
    except ImportError:
        print("需要 playwright：pip install playwright && playwright install chromium")
        return 2

    if args.update:
        BASELINE.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"基线已更新：{BASELINE.relative_to(ROOT)}（{len(current)} 个页面/视口组合）")
        return 0

    if not BASELINE.exists():
        print(f"基线不存在，请先跑：python3 {pathlib.Path(__file__).relative_to(ROOT)} --update")
        return 2

    problems = compare(current, json.loads(BASELINE.read_text(encoding="utf-8")))

    if problems:
        print("\n".join(problems))
        return 1

    print(f"版面检查通过：{len(current)} 个页面/视口组合，横向溢出 0、低对比 0、无 JS 报错。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
