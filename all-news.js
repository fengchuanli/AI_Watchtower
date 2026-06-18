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
    historyMeta.textContent = "历史情报暂时无法读取。";
    historyList.innerHTML = `
      <div class="feed-state error" role="status">
        <p>历史情报暂时无法读取，请稍后刷新。</p>
      </div>
    `;
  }
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
  const filteredEditions = getFilteredEditions(history);
  const sortedEditions = sortHistoryEditions(filteredEditions, selectedSort);
  const totalItems = sortedEditions.reduce((count, edition) => count + edition.items.length, 0);
  const latestEdition = sortHistoryEditions(history.editions)[0];
  const categoryLabel =
    getHistoryCategories(history).find((category) => category.id === selectedCategory)?.label || "全部";
  const sortLabel = selectedSort === "oldest" ? "最早批次优先" : "最新批次优先";

  historyMeta.textContent = `目前共 ${history.editions.length} 个抓取批次 · ${history.totalItems || totalItems} 条情报 · 最新抓取：${latestEdition.date} · ${latestEdition.archiveLabel}`;
  historyResultNote.textContent = `当前显示：${categoryLabel} · ${sortedEditions.length} 个批次 · ${totalItems} 条情报 · ${sortLabel}。原始来源仍只作为核对线索，优先阅读站内解读。`;
  renderHistoryControls(history);

  if (!sortedEditions.length) {
    historyList.innerHTML = `
      <div class="feed-state" role="status">
        <p>这个分类暂时没有历史情报。</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = sortedEditions
    .map(
      (edition, editionIndex) => `
        <section class="history-edition" aria-label="${escapeHtml(`${edition.date} ${edition.archiveLabel}`)}">
          <div class="history-edition-header">
            <div>
              <p class="eyebrow">${editionIndex === 0 ? "Latest Capture" : "Past Capture"}</p>
              <h3>${escapeHtml(edition.date)} · ${escapeHtml(edition.archiveLabel)}</h3>
              <p>${escapeHtml(edition.note || edition.editorNote || "本批次暂无补充说明。")}</p>
            </div>
            <span>${edition.items.length} 条</span>
          </div>
          <div class="history-card-grid">
            ${sortHistoryItems(edition.items, selectedSort)
              .map((item) => {
                const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}&edition=${encodeURIComponent(edition.id)}`;

                return `
                  <article class="history-card">
                    <div>
                      <span class="category">${escapeHtml(item.label)}</span>
                      <h4><a href="${detailUrl}">${escapeHtml(item.title)}</a></h4>
                      <p><strong>发生了什么</strong>${escapeHtml(item.body)}</p>
                      <p><strong>趋势判断</strong>${escapeHtml(item.trend)}</p>
                      <p><strong>入选理由</strong>${escapeHtml(item.whyRanked)}</p>
                    </div>
                    <footer>
                      <span>${escapeHtml(item.trustLevel)}</span>
                      <a class="reference-link" href="${detailUrl}">查看站内解读</a>
                      <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time>
                    </footer>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

attachHistoryControlEvents();
loadHistory();
