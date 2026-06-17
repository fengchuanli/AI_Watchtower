const tagTabs = document.querySelector("#tagTabs");
const tagEyebrow = document.querySelector("#tagEyebrow");
const tagTitle = document.querySelector("#tag-title");
const tagMeta = document.querySelector("#tagMeta");
const tagResults = document.querySelector("#tagResults");

const tagDefinitions = [
  { id: "openai", label: "OpenAI", match: /openai/i },
  { id: "anthropic", label: "Anthropic", match: /anthropic/i },
  { id: "google", label: "Google", match: /google|deepmind/i },
  { id: "meta", label: "Meta", match: /meta/i },
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
  tagTitle.textContent = `${tag.label} 情报`;
  tagMeta.textContent = `${items.length} 条 · 来自全部历史抓取批次`;

  if (!items.length) {
    tagResults.innerHTML = `<p class="feed-state">暂无 ${escapeHtml(tag.label)} 情报，后续抓取到相关来源后会自动出现在这里。</p>`;
    return;
  }

  tagResults.innerHTML = items
    .map((item) => {
      const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}&edition=${encodeURIComponent(item.editionId)}`;

      return `
        <article class="tag-result-card">
          <span>${escapeHtml(item.editionDate)} · ${escapeHtml(item.editionLabel)}</span>
          <h3><a href="${detailUrl}">${escapeHtml(item.title)}</a></h3>
          <p><strong>3行总结</strong>${escapeHtml(item.body)}</p>
          <p>${escapeHtml(item.impact)}</p>
          <a class="reference-link" href="${detailUrl}">查看事件简报</a>
        </article>
      `;
    })
    .join("");
}

loadTags();
