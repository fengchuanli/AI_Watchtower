const currentArchiveMeta = document.querySelector("#currentArchiveMeta");
const currentEditionGrid = document.querySelector("#currentEditionGrid");
const archiveEditionGrid = document.querySelector("#archiveEditionGrid");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${path} request failed with ${response.status}`);
  }

  return response.json();
}

function validateCurrentFeed(feed) {
  if (!feed?.edition?.id || !feed.edition.date || !feed.edition.archiveLabel) {
    throw new Error("Current feed must include edition id, date, and archive label.");
  }

  if (!Array.isArray(feed.items)) {
    throw new Error("Current feed must include an items array.");
  }
}

function validateHistory(history) {
  if (!Array.isArray(history?.editions) || !history.editions.length) {
    throw new Error("News history must include editions.");
  }

  for (const edition of history.editions) {
    const missingField = ["id", "date", "timezone", "archiveLabel", "archiveStatus", "itemCount"].find(
      (field) => !edition[field] && edition[field] !== 0,
    );

    if (missingField) {
      throw new Error(`History edition ${edition.id || "without id"} is missing ${missingField}.`);
    }
  }
}

function getEditionKey(edition) {
  return `${edition.id}::${edition.archiveLabel}`;
}

function getEditionTimeLabel(archiveLabel = "") {
  const label = String(archiveLabel);

  if (label.includes("08:00")) {
    return "早间版";
  }

  if (label.includes("17:00")) {
    return "晚间版";
  }

  return "临时版";
}

function sortEditions(editions) {
  return [...editions].sort((a, b) => {
    const dateDiff = Date.parse(b.date) - Date.parse(a.date);

    if (dateDiff) {
      return dateDiff;
    }

    return String(b.archiveLabel).localeCompare(String(a.archiveLabel), "zh-CN");
  });
}

function getStatusLabel(edition, currentEdition) {
  const isCurrent = getEditionKey(edition) === getEditionKey(currentEdition);

  return {
    label: isCurrent ? "当前首页批次" : "已归档批次",
    tone: isCurrent ? "current" : "archived",
    note: isCurrent
      ? "本批次对应当前首页新闻流，适合先读。"
      : "本批次已进入历史记录，用来回看背景，不作为今日新消息重复发布。",
  };
}

function renderEditionCard(edition, currentEdition) {
  const timeLabel = getEditionTimeLabel(edition.archiveLabel);
  const status = getStatusLabel(edition, currentEdition);
  const itemCount = Number.isInteger(edition.itemCount) ? edition.itemCount : edition.items?.length || 0;
  const detailUrl = `./all-news.html`;

  return `
    <article class="archive-edition-card">
      <span>${escapeHtml(edition.date)} · ${escapeHtml(edition.archiveLabel)}</span>
      <strong>${escapeHtml(timeLabel)} · ${escapeHtml(edition.id)}</strong>
      <small>${escapeHtml(status.note)}</small>
      <div class="archive-label-row" aria-label="期次状态">
        <em class="archive-status ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</em>
        <em>${escapeHtml(edition.archiveStatus || "published")} · ${escapeHtml(itemCount)} 条</em>
      </div>
      <a class="text-link" href="${detailUrl}" aria-label="${escapeHtml(`查看 ${edition.archiveLabel} 的全部 AI 新闻题目`)}">查看题目列表</a>
    </article>
  `;
}

function renderLoadError() {
  currentArchiveMeta.textContent = "期次数据暂时无法读取。";
  const fallback = `
    <div class="feed-state error" role="status">
      <p>期次归档暂时无法生成动态标签。</p>
      <p>可以先打开结构化数据，或进入全部 AI 新闻查看已发布题目。</p>
      <div class="feed-state-actions" aria-label="期次归档加载失败后的备用入口">
        <a href="./data/news.json">打开当前数据</a>
        <a href="./data/news-history.json">打开历史数据</a>
        <a href="./all-news.html">查看全部 AI 新闻</a>
      </div>
      <button class="feed-retry" type="button">重新加载</button>
    </div>
  `;

  currentEditionGrid.innerHTML = fallback;
  archiveEditionGrid.innerHTML = fallback;
  document.querySelectorAll(".feed-retry").forEach((button) => button.addEventListener("click", loadArchive));
}

async function loadArchive() {
  currentArchiveMeta.textContent = "正在读取当前发布批次...";
  currentEditionGrid.innerHTML = `
    <div class="feed-state loading" role="status">
      <p>正在读取当前批次标签...</p>
    </div>
  `;
  archiveEditionGrid.innerHTML = `
    <div class="feed-state loading" role="status">
      <p>正在读取已发布归档...</p>
    </div>
  `;

  try {
    const [currentFeed, history] = await Promise.all([
      fetchJson("./data/news.json"),
      fetchJson("./data/news-history.json"),
    ]);

    validateCurrentFeed(currentFeed);
    validateHistory(history);

    const currentEdition = {
      ...currentFeed.edition,
      itemCount: currentFeed.items.length,
    };
    const sortedEditions = sortEditions(history.editions);
    const archivedCount = sortedEditions.filter(
      (edition) => getEditionKey(edition) !== getEditionKey(currentEdition),
    ).length;

    currentArchiveMeta.textContent = `当前首页批次：${currentEdition.date} · ${currentEdition.archiveLabel} · ${getEditionTimeLabel(currentEdition.archiveLabel)} · ${currentFeed.items.length} 条。`;
    currentEditionGrid.innerHTML = renderEditionCard(currentEdition, currentEdition);
    archiveEditionGrid.innerHTML = sortedEditions.map((edition) => renderEditionCard(edition, currentEdition)).join("");

    if (!sortedEditions.length) {
      archiveEditionGrid.innerHTML = `
        <div class="feed-state" role="status">
          <p>暂时没有已发布归档。</p>
        </div>
      `;
    }

    if (archivedCount > 0) {
      currentArchiveMeta.textContent += ` 另有 ${archivedCount} 个历史批次用于回看背景。`;
    }
  } catch (error) {
    console.warn(error);
    renderLoadError();
  }
}

loadArchive();
