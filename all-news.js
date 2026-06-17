const historyMeta = document.querySelector("#historyMeta");
const historyList = document.querySelector("#historyList");
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

function sortHistoryEditions(editions) {
  return [...editions].sort((a, b) => {
    const dateDiff = Date.parse(b.date) - Date.parse(a.date);

    if (dateDiff) {
      return dateDiff;
    }

    return String(b.archiveLabel).localeCompare(String(a.archiveLabel), "zh-CN");
  });
}

function sortHistoryItems(items) {
  return [...items].sort((a, b) => {
    const dateDiff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

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

async function loadHistory() {
  try {
    const response = await fetch("./data/news-history.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`News history request failed with ${response.status}`);
    }

    const history = await response.json();
    validateHistory(history);
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
  const sortedEditions = sortHistoryEditions(history.editions);
  const totalItems = sortedEditions.reduce((count, edition) => count + edition.items.length, 0);
  const latestEdition = sortedEditions[0];
  historyMeta.textContent = `目前共 ${history.editions.length} 个抓取批次 · ${totalItems} 条情报 · 最新抓取：${latestEdition.date} · ${latestEdition.archiveLabel}`;

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
            ${sortHistoryItems(edition.items)
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

loadHistory();
