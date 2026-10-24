import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

// Exercise the real renderer without network loading or browser startup.
export function checkTop3Cues(appJs) {
  assert.match(appJs, /loadNews\(\);\s*$/);
  const target = { innerHTML: "" };
  const context = {
    document: {
      querySelector: (selector) => selector === "#topStories" ? target : null,
      querySelectorAll: () => [],
    },
    URL, URLSearchParams,
  };
  runInNewContext(appJs.replace(/loadNews\(\);\s*$/, ""), context, { timeout: 1000 });
  const base = {
    id: "cue-fixture", title: "校验用条目", label: "安全", time: "校验时间",
    sourceName: "校验来源", sourceType: "official", sourceRole: "厂商主张",
    claimStatus: "confirmed", originalDependency: "recommended",
    sourceUrl: "https://example.com/source", claimBoundary: "尚无独立效果证据",
    nextCheck: "等待第三方测试报告",
  };
  const render = (item) => {
    context.updateTopStories([item]);
    return target.innerHTML.split('<details class="top-editor-details">')[0];
  };
  const official = render(base);
  assert.match(official, /发布事实已确认 · 效果待核验/, "Vendor outcomes must remain unverified before expansion");
  assert.match(official, /尚无独立效果证据/);
  assert.match(official, /等待第三方测试报告/);
  assert.match(official, /class="top-signal-cue">安全信号<\/span>/);
  for (const claimStatus of ["reported", "disputed", "unclear"]) {
    const output = render({ ...base, claimStatus });
    assert.doesNotMatch(output, /发布事实已确认/);
    assert.ok(output.includes(`class="top-claim-cue">${claimStatus}</span>`));
  }
  const media = render({ ...base, sourceType: "reliable_media", sourceRole: "媒体背景", claimStatus: "reported", originalDependency: "must-read" });
  assert.match(media, /href="https:\/\/example.com\/source"[^>]*>完整事实请读原文/);
  assert.match(media, /完整事实、采访、图表与上下文请以原文为准/);
  const missing = render({ ...base, claimBoundary: "" });
  assert.match(missing, /证据边界未标注，请先核对原文/);
}
