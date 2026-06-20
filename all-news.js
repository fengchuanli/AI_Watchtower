const historyMeta = document.querySelector("#historyMeta");
const historyList = document.querySelector("#historyList");
const historyControls = document.querySelector("#historyControls");
const historyCategoryFilters = document.querySelector("#historyCategoryFilters");
const historySort = document.querySelector("#historySort");
const historyResultNote = document.querySelector("#historyResultNote");
const requiredHistoryItemFields = [
  "id",
  "category",
  "label",
  "title",
  "body",
  "detailBody",
  "trend",
  "detailTrend",
  "whyRanked",
  "source",
  "trustLevel",
  "verificationStatus",
  "publishedAt",
  "time",
];
const allCategoryOption = {
  id: "all",
  label: "全部",
};
let loadedHistory = null;
let selectedCategory = "all";
let selectedSort = "newest";

function sortHistoryEditions(editions, sortOrder = "newest") {
  return [...editions].sort((a, b) => {
    const dateDiff =
      sortOrder === "oldest" ? Date.parse(a.date) - Date.parse(b.date) : Date.parse(b.date) - Date.parse(a.date);

    if (dateDiff) {
      return dateDiff;
    }

    return sortOrder === "oldest"
      ? String(a.archiveLabel).localeCompare(String(b.archiveLabel), "zh-CN")
      : String(b.archiveLabel).localeCompare(String(a.archiveLabel), "zh-CN");
  });
}

function sortHistoryItems(items, sortOrder = "newest") {
  return [...items].sort((a, b) => {
    const dateDiff =
      sortOrder === "oldest"
        ? Date.parse(a.publishedAt) - Date.parse(b.publishedAt)
        : Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

    if (dateDiff) {
      return dateDiff;
    }

    return String(a.title).localeCompare(String(b.title), "zh-CN");
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getHistoryCategories(history) {
  const categoryMap = new Map();

  for (const edition of history.editions) {
    for (const item of edition.items) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, item.label);
      }
    }
  }

  return [
    allCategoryOption,
    ...[...categoryMap.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "zh-CN")),
  ];
}

function getFilteredEditions(history) {
  return history.editions
    .map((edition) => ({
      ...edition,
      items:
        selectedCategory === "all"
          ? edition.items
          : edition.items.filter((item) => item.category === selectedCategory),
    }))
    .filter((edition) => edition.items.length);
}

function getEditionKey(edition) {
  return `${edition.id}::${edition.archiveLabel}`;
}

function getLatestEdition(history) {
  return sortHistoryEditions(history.editions)[0];
}

function getEditionBatchStatus(edition, latestEdition) {
  const isLatest = getEditionKey(edition) === getEditionKey(latestEdition);

  return {
    label: isLatest ? "最新抓取" : "已归档",
    tone: isLatest ? "latest" : "archived",
    note: isLatest
      ? "本批次对应当前首页新闻流，可优先阅读。"
      : "本批次已进入历史记录，用来回看背景，不作为今日新消息重复发布。",
  };
}

function getFilteredHistoryItems(history) {
  const latestEdition = getLatestEdition(history);

  return history.editions.flatMap((edition) => {
    const batchStatus = getEditionBatchStatus(edition, latestEdition);
    const items = selectedCategory === "all"
      ? edition.items
      : edition.items.filter((item) => item.category === selectedCategory);

    return items.map((item) => ({
      ...item,
      editionId: edition.id,
      editionDate: edition.date,
      archiveLabel: edition.archiveLabel,
      batchStatus,
    }));
  });
}

function sortHistoryFlatItems(items, sortOrder = "newest") {
  return [...items].sort((a, b) => {
    const dateDiff = sortOrder === "oldest"
      ? Date.parse(a.publishedAt) - Date.parse(b.publishedAt)
      : Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

    if (dateDiff) {
      return dateDiff;
    }

    const editionDiff = sortOrder === "oldest"
      ? Date.parse(a.editionDate) - Date.parse(b.editionDate)
      : Date.parse(b.editionDate) - Date.parse(a.editionDate);

    if (editionDiff) {
      return editionDiff;
    }

    return String(a.title).localeCompare(String(b.title), "zh-CN");
  });
}

function renderHistoryControls(history) {
  const categories = getHistoryCategories(history);

  historyCategoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button
          type="button"
          class="${category.id === selectedCategory ? "active" : ""}"
          data-category="${escapeHtml(category.id)}"
          aria-pressed="${category.id === selectedCategory ? "true" : "false"}"
        >
          ${escapeHtml(category.label)}
        </button>
      `,
    )
    .join("");

  historyControls.hidden = false;
}

function attachHistoryControlEvents() {
  historyCategoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");

    if (!button || !loadedHistory) {
      return;
    }

    selectedCategory = button.dataset.category;
    renderHistory(loadedHistory);
  });

  historySort.addEventListener("change", () => {
    if (!loadedHistory) {
      return;
    }

    selectedSort = historySort.value === "oldest" ? "oldest" : "newest";
    renderHistory(loadedHistory);
  });
}

async function loadHistory() {
  historyMeta.textContent = "正在读取历史情报...";
  historyResultNote.textContent = "";
  historyList.innerHTML = `
    <div class="feed-state loading" role="status">
      <p>正在读取历史情报题目...</p>
    </div>
  `;

  try {
    const response = await fetch("./data/news-history.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`News history request failed with ${response.status}`);
    }

    const history = await response.json();
    validateHistory(history);
    loadedHistory = history;
    renderHistoryControls(history);
    renderHistory(history);
  } catch (error) {
    console.warn(error);
    renderHistoryLoadError();
  }
}

function renderHistoryLoadError() {
  historyMeta.textContent = "历史情报暂时无法读取。";
  historyControls.hidden = true;
  historyResultNote.textContent = "这通常是结构化归档文件未能下载成功，不代表历史情报为空。";
  historyList.innerHTML = `
    <div class="feed-state error" role="status">
      <p>历史情报暂时无法读取，请稍后刷新。</p>
      <p>可以先打开原始归档数据，或回到首页查看最新批次摘要。</p>
      <div class="feed-state-actions" aria-label="历史情报加载失败后的备用入口">
        <a href="./data/news-history.json">打开历史数据</a>
        <a href="./index.html">返回首页</a>
        <a href="./archive.html">查看期次归档</a>
      </div>
      <button class="feed-retry" type="button">重新加载</button>
    </div>
  `;
  historyList.querySelector(".feed-retry")?.addEventListener("click", loadHistory);
}

function validateHistory(history) {
  if (!Array.isArray(history.editions) || !history.editions.length) {
    throw new Error("News history must include editions.");
  }

  for (const edition of history.editions) {
    const missingEditionField = ["id", "date", "timezone", "archiveLabel", "itemCount"].find(
      (field) => !edition[field] && edition[field] !== 0,
    );

    if (missingEditionField) {
      throw new Error(`History edition is missing ${missingEditionField}.`);
    }

    if (!Array.isArray(edition.items)) {
      throw new Error(`History edition ${edition.id} must include items.`);
    }

    const invalidItem = edition.items.find((item) => requiredHistoryItemFields.some((field) => !item[field]));

    if (invalidItem) {
      throw new Error(`History item ${invalidItem.id || "without id"} is missing required display fields.`);
    }
  }
}

function renderHistory(history) {
  const filteredItems = getFilteredHistoryItems(history);
  const sortedItems = sortHistoryFlatItems(filteredItems, selectedSort);
  const latestEdition = getLatestEdition(history);
  const archivedEditionCount = Math.max(history.editions.length - 1, 0);
  const categoryLabel =
    getHistoryCategories(history).find((category) => category.id === selectedCategory)?.label || "全部";
  const sortLabel = selectedSort === "oldest" ? "最早新闻优先" : "最新新闻优先";

  historyMeta.textContent = `目前共 ${history.editions.length} 个抓取批次 · ${history.totalItems || filteredItems.length} 条情报 · 最新抓取：${latestEdition.date} · ${latestEdition.archiveLabel}`;
  historyResultNote.textContent = `当前显示：${categoryLabel} · ${sortedItems.length} 条情报 · ${sortLabel}。本页只显示题目，点击进入站内解读；最新抓取批次会用小标签标出，${archivedEditionCount} 个已归档批次用于回看背景。`;
  renderHistoryControls(history);

  if (!sortedItems.length) {
    historyList.innerHTML = `
      <div class="feed-state" role="status">
        <p>这个分类暂时没有历史情报。</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = `
    <ol class="history-title-list flat">
      ${sortedItems
        .map((item) => {
          const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}&edition=${encodeURIComponent(item.editionId)}`;

          return `
            <li class="history-title-item">
              <a href="${detailUrl}" aria-label="${escapeHtml(`查看 ${item.archiveLabel} 的站内解读：${item.title}`)}">
                <span class="category">${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.title)}</strong>
              </a>
              <div class="history-title-meta">
                <span class="batch-status ${escapeHtml(item.batchStatus.tone)}">${escapeHtml(item.batchStatus.label)}</span>
                <span>${escapeHtml(item.archiveLabel)}</span>
                <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time>
              </div>
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

attachHistoryControlEvents();
loadHistory();
