const tagTabs = document.querySelector("#tagTabs");
const tagEyebrow = document.querySelector("#tagEyebrow");
const tagTitle = document.querySelector("#tag-title");
const tagMeta = document.querySelector("#tagMeta");
const tagContext = document.querySelector("#tagContext");
const tagResults = document.querySelector("#tagResults");

const tagDefinitions = [
  {
    id: "openai",
    label: "OpenAI",
    match: /openai/i,
    focus: "重点观察模型能力、科学工作流、企业产品和安全边界。",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    match: /anthropic/i,
    focus: "重点观察 Claude 产品、企业采用、安全治理和区域合作。",
  },
  {
    id: "google",
    label: "Google",
    match: /google|deepmind/i,
    focus: "重点观察 DeepMind 研究、Gemini 产品、云端部署和开发者生态。",
  },
  {
    id: "meta",
    label: "Meta",
    match: /meta/i,
    focus: "重点观察开源模型、消费级 AI、基础设施和平台分发。",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSelectedTagId() {
  const tagId = new URLSearchParams(window.location.search).get("tag");
  return tagDefinitions.some((tag) => tag.id === tagId) ? tagId : tagDefinitions[0].id;
}

async function loadTags() {
  try {
    const response = await fetch("./data/news-history.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Tag history request failed with ${response.status}`);
    }

    const history = await response.json();
    const selectedTagId = getSelectedTagId();
    renderTagTabs(selectedTagId);
    renderTagResults(history, selectedTagId);
  } catch (error) {
    console.warn(error);
    tagMeta.textContent = "标签聚合暂时无法读取。";
    tagResults.innerHTML = '<p class="feed-state error">标签聚合暂时无法读取，请稍后刷新。</p>';
  }
}

function flattenHistory(history) {
  if (!Array.isArray(history.editions)) {
    throw new Error("News history must include editions.");
  }

  return history.editions.flatMap((edition) =>
    (edition.items || []).map((item) => ({
      ...item,
      editionId: edition.id,
      editionLabel: edition.archiveLabel,
      editionDate: edition.date,
    })),
  );
}

function sortItems(items) {
  return [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

function itemMatchesTag(item, tag) {
  return tag.match.test(`${item.sourceId || ""} ${item.source || ""} ${item.sourceUrl || ""}`);
}

function summarizeTagItems(items) {
  const latestItem = items[0];
  const categories = [...new Set(items.map((item) => item.label || item.category).filter(Boolean))];
  const sourceRoles = [...new Set(items.map((item) => item.sourceRole || item.trustLevel).filter(Boolean))];
  const sourceCaveat = latestItem
    ? latestItem.claimBoundary || latestItem.provenance || latestItem.nextCheck || "先读站内事件简报，再用原始来源核对完整事实。"
    : "暂无来源边界；等待后续抓取到相关公司信号。";

  return {
    latestLabel: latestItem ? `${latestItem.editionDate} · ${latestItem.editionLabel}` : "暂无匹配批次",
    latestSignal: latestItem ? latestItem.title : "暂无收录线索",
    lastSeenDate: latestItem ? latestItem.editionDate : "暂无记录",
    categoryLabel: categories.length ? categories.slice(0, 4).join(" / ") : "暂无分类",
    sourceLabel: sourceRoles.length ? sourceRoles.slice(0, 3).join(" / ") : "等待来源",
    sourceCaveat,
  };
}

function renderTagTabs(selectedTagId) {
  tagTabs.innerHTML = tagDefinitions
    .map(
      (tag) => `
        <a class="${tag.id === selectedTagId ? "active" : ""}" href="./tags.html?tag=${encodeURIComponent(tag.id)}">${escapeHtml(tag.label)}</a>
      `,
    )
    .join("");
}

function renderTagResults(history, selectedTagId) {
  const tag = tagDefinitions.find((item) => item.id === selectedTagId) || tagDefinitions[0];
  const items = sortItems(flattenHistory(history).filter((item) => itemMatchesTag(item, tag)));
  tagEyebrow.textContent = `${tag.label} Intelligence`;
  tagTitle.textContent = `${tag.label} 历史背景`;
  tagMeta.textContent = `${items.length} 条 · 来自全部抓取批次，旧条目不代表当前警报`;
  renderTagContext(tag, items);

  if (!items.length) {
    tagResults.innerHTML = `<p class="feed-state">暂无 ${escapeHtml(tag.label)} 历史背景；后续抓取到相关来源后会自动出现在这里。</p>`;
    return;
  }

  tagResults.innerHTML = items
    .map((item) => {
      const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}&edition=${encodeURIComponent(item.editionId)}`;

      return `
        <article class="tag-result-card">
          <span>${escapeHtml(item.editionDate)} · ${escapeHtml(item.editionLabel)}</span>
          <h3><a href="${detailUrl}">${escapeHtml(item.title)}</a></h3>
          <p><strong>当期简述</strong>${escapeHtml(item.body)}</p>
          <p>${escapeHtml(item.impact)}</p>
          <a class="reference-link" href="${detailUrl}">查看事件简报</a>
        </article>
      `;
    })
    .join("");
}

function renderTagContext(tag, items) {
  const summary = summarizeTagItems(items);

  tagContext.innerHTML = `
    <article class="tag-context-card">
      <p class="eyebrow">公司观察重点</p>
      <h3>${escapeHtml(tag.label)} 为什么单独看</h3>
      <p>${escapeHtml(tag.focus)}</p>
    </article>
    <article class="tag-context-card">
      <p class="eyebrow">最近一次收录</p>
      <h3>${escapeHtml(summary.latestLabel)}</h3>
      <dl class="tag-signal-list">
        <div>
          <dt>收录线索</dt>
          <dd>${escapeHtml(summary.latestSignal)}</dd>
        </div>
        <div>
          <dt>最近期次</dt>
          <dd>${escapeHtml(summary.lastSeenDate)}</dd>
        </div>
      </dl>
      <p>当前标签下共 ${items.length} 条历史背景；分类覆盖：${escapeHtml(summary.categoryLabel)}。只有同日当前首页批次才应被当作优先阅读入口。</p>
    </article>
    <article class="tag-context-card">
      <p class="eyebrow">来源边界</p>
      <h3>${escapeHtml(summary.sourceLabel)}</h3>
      <p>${escapeHtml(summary.sourceCaveat)}</p>
      <p class="tag-source-note">先读站内事件简报，再把原始来源作为事实边界和后续追踪依据。</p>
    </article>
  `;
}

loadTags();
