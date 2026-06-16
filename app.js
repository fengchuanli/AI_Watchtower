let news = [];
let newsCategories = [];
let currentFilter = "all";

const newsGrid = document.querySelector("#newsGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const newsMeta = document.querySelector("#newsMeta");
const categoryMeta = document.querySelector("#categoryMeta");
const briefingLabel = document.querySelector("#briefingLabel");
const briefingHeadline = document.querySelector("#briefingHeadline");
const briefingSummary = document.querySelector("#briefingSummary");
const briefingCta = document.querySelector("#briefingCta");
const briefingWatchPoints = document.querySelector("#briefingWatchPoints");
const deepKicker = document.querySelector("#deepKicker");
const deepDate = document.querySelector("#deepDate");
const deepTitle = document.querySelector("#deepTitle");
const deepSubtitle = document.querySelector("#deepSubtitle");
const deepOverview = document.querySelector("#deepOverview");
const deepMetrics = document.querySelector("#deepMetrics");
const deepTimeline = document.querySelector("#deepTimeline");
const deepSections = document.querySelector("#deepSections");
const deepActions = document.querySelector("#deepActions");
const deepReferences = document.querySelector("#deepReferences");
const requiredCardFields = [
  "category",
  "label",
  "title",
  "body",
  "trend",
  "whyRanked",
  "impact",
  "nextCheck",
  "evidenceThreshold",
  "claimBoundary",
  "source",
  "sourceUrl",
  "sourceRole",
  "provenance",
  "trustLevel",
  "verificationStatus",
  "publishedAt",
  "time",
];

async function loadNews() {
  setFiltersDisabled(true);
  renderFeedMessage("loading", "正在读取新闻数据...");

  try {
    const response = await fetch("./data/news.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`News request failed with ${response.status}`);
    }

    const data = await response.json();
    validateNewsData(data);
    news = data.items;
    newsCategories = data.categories;
    updateTodayBriefing(data.briefing);
    updateDeepBriefing(data.deepBriefing);
    updateNewsMeta(data);
  } catch (error) {
    news = [];
    updateNewsMeta({ statusLabel: "数据未加载", editorNote: "新闻数据暂时无法读取，请稍后重试。" });
    updateCategoryMeta();
    renderFeedMessage("error", "新闻数据暂时无法读取。", true);
    console.warn(error);
    return;
  }

  setFiltersDisabled(false);
  renderNews(currentFilter);
}

function validateNewsData(data) {
  if (!Array.isArray(data.items)) {
    throw new Error("News data must include an items array.");
  }

  validateEdition(data.edition, data.updatedAt);
  validateCategories(data.categories, data.items);
  validateBriefing(data.briefing);
  validateDeepBriefing(data.deepBriefing);

  const invalidItem = data.items.find((item) => requiredCardFields.some((field) => !item[field]));

  if (invalidItem) {
    throw new Error(`News item ${invalidItem.id || "without id"} is missing required display fields.`);
  }

  const itemWithInvalidUrl = data.items.find((item) => !isValidSourceUrl(item.sourceUrl));

  if (itemWithInvalidUrl) {
    throw new Error(`News item ${itemWithInvalidUrl.id || "without id"} has an invalid source URL.`);
  }
}

function validateCategories(categories, items) {
  if (!Array.isArray(categories) || !categories.length) {
    throw new Error("News data must include category definitions.");
  }

  const categoryIds = new Set(categories.map((category) => category.id));
  const invalidCategory = categories.find(
    (category) => !category.id || !category.label || !category.description,
  );

  if (invalidCategory) {
    throw new Error("Each news category must include id, label, and description.");
  }

  const itemWithoutCategory = items.find((item) => !categoryIds.has(item.category));

  if (itemWithoutCategory) {
    throw new Error(`News item ${itemWithoutCategory.id || "without id"} has no category definition.`);
  }
}

function validateEdition(edition, updatedAt) {
  const requiredFields = ["id", "date", "timezone", "archiveStatus", "archiveLabel", "note"];

  if (!edition || requiredFields.some((field) => !edition[field])) {
    throw new Error("News data must include complete edition metadata.");
  }

  if (edition.date !== updatedAt) {
    throw new Error("News edition date must match updatedAt.");
  }
}

function validateBriefing(briefing) {
  if (!briefing) {
    return;
  }

  const missingMainField = ["label", "headline", "summary", "cta"].find((field) => !briefing[field]);

  if (missingMainField) {
    throw new Error(`News briefing is missing ${missingMainField}.`);
  }

  if (!Array.isArray(briefing.watchPoints) || briefing.watchPoints.length !== 3) {
    throw new Error("News briefing must include exactly three watch points.");
  }

  const invalidPoint = briefing.watchPoints.find((point) => !point.title || !point.body);

  if (invalidPoint) {
    throw new Error("Each briefing watch point must include title and body.");
  }
}

function validateDeepBriefing(deepBriefing) {
  if (!deepBriefing) {
    throw new Error("News data must include a deepBriefing object.");
  }

  const requiredFields = ["kicker", "title", "subtitle", "dateLabel", "status", "overview"];
  const missingField = requiredFields.find((field) => !deepBriefing[field]);

  if (missingField) {
    throw new Error(`Deep briefing is missing ${missingField}.`);
  }

  if (!Array.isArray(deepBriefing.timeline) || deepBriefing.timeline.length < 3) {
    throw new Error("Deep briefing must include at least three timeline items.");
  }

  if (!Array.isArray(deepBriefing.keyNumbers) || deepBriefing.keyNumbers.length < 3) {
    throw new Error("Deep briefing must include at least three key numbers.");
  }

  if (!Array.isArray(deepBriefing.sections) || deepBriefing.sections.length < 3) {
    throw new Error("Deep briefing must include at least three sections.");
  }

  if (!Array.isArray(deepBriefing.actions) || deepBriefing.actions.length < 2) {
    throw new Error("Deep briefing must include reader actions.");
  }
}

function isValidSourceUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function updateTodayBriefing(briefing) {
  if (!briefing || !briefingWatchPoints) {
    return;
  }

  if (briefingLabel) {
    briefingLabel.textContent = briefing.label;
  }

  if (briefingHeadline) {
    briefingHeadline.textContent = briefing.headline;
  }

  if (briefingSummary) {
    briefingSummary.textContent = briefing.summary;
  }

  if (briefingCta) {
    briefingCta.textContent = briefing.cta;
  }

  briefingWatchPoints.innerHTML = briefing.watchPoints
    .map(
      (point, index) => `
        <article>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${escapeHtml(point.title)}</h3>
            <p>${escapeHtml(point.body)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function updateDeepBriefing(deepBriefing) {
  if (!deepBriefing || !deepSections) {
    return;
  }

  deepKicker.textContent = deepBriefing.kicker;
  deepDate.textContent = `${deepBriefing.dateLabel} · ${deepBriefing.status}`;
  deepTitle.textContent = deepBriefing.title;
  deepSubtitle.textContent = deepBriefing.subtitle;
  deepOverview.textContent = deepBriefing.overview;

  deepMetrics.innerHTML = deepBriefing.keyNumbers
    .map(
      (metric) => `
        <div>
          <dt>${escapeHtml(metric.value)}</dt>
          <dd>${escapeHtml(metric.label)}</dd>
        </div>
      `,
    )
    .join("");

  deepTimeline.innerHTML = deepBriefing.timeline
    .map(
      (item) => `
        <article>
          <span>${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `,
    )
    .join("");

  deepSections.innerHTML = deepBriefing.sections
    .map(
      (section) => `
        <article class="deep-section">
          <span>${escapeHtml(section.number)} · ${escapeHtml(section.label)}</span>
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.body)}</p>
          <p class="deep-so-what"><strong>So What?</strong>${escapeHtml(section.soWhat)}</p>
        </article>
      `,
    )
    .join("");

  deepActions.innerHTML = deepBriefing.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  deepReferences.innerHTML = deepBriefing.references
    .map(
      (reference, index) => `
        <a href="${escapeHtml(reference.url)}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          ${escapeHtml(reference.label)}
        </a>
      `,
    )
    .join("");
}

function updateNewsMeta(data) {
  if (!newsMeta) {
    return;
  }

  const updatedAt = data.updatedAt ? `更新日期 ${data.updatedAt}` : "等待更新";
  const edition = data.edition
    ? `${data.edition.archiveLabel} ${data.edition.id} · 时区 ${data.edition.timezone} · ${data.edition.note}`
    : "尚无期次信息";
  newsMeta.textContent = `${data.statusLabel || "数据状态"} · ${updatedAt} · ${edition} · ${data.editorNote || ""}`;
}

function updateCategoryMeta(filter) {
  if (!categoryMeta) {
    return;
  }

  if (!news.length) {
    categoryMeta.textContent = "分类筛选将在新闻数据加载后启用。";
    return;
  }

  if (filter === "all") {
    categoryMeta.textContent = `全部 · ${news.length} 条 · 按模型、产品、研究、工具、资金与政策六类整理。`;
    return;
  }

  const category = newsCategories.find((item) => item.id === filter);
  const itemCount = news.filter((item) => item.category === filter).length;

  categoryMeta.textContent = category
    ? `${category.label} · ${itemCount} 条 · ${category.description}`
    : "当前分类缺少编辑说明。";
}

function selectFilter(button) {
  if (button.disabled) {
    return;
  }

  filterButtons.forEach((item) => {
    const isSelected = item === button;
    item.classList.toggle("active", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
    item.tabIndex = isSelected ? 0 : -1;
  });

  newsGrid.setAttribute("aria-labelledby", button.id);
  currentFilter = button.dataset.filter;
  renderNews(currentFilter);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setFiltersDisabled(isDisabled) {
  filterButtons.forEach((button) => {
    button.disabled = isDisabled;
  });
}

function renderFeedMessage(type, message, canRetry = false) {
  const retryButton = canRetry
    ? '<button class="feed-retry" type="button">重新加载</button>'
    : "";

  newsGrid.innerHTML = `
    <div class="feed-state ${type}" role="status">
      <p>${escapeHtml(message)}</p>
      ${retryButton}
    </div>
  `;

  newsGrid.querySelector(".feed-retry")?.addEventListener("click", loadNews);
}

function renderNews(filter = "all") {
  const visibleNews = filter === "all" ? news : news.filter((item) => item.category === filter);
  updateCategoryMeta(filter);

  if (!visibleNews.length) {
    renderFeedMessage("empty", "暂无匹配内容，后续接入真实来源后会自动补充。");
    return;
  }

  newsGrid.innerHTML = visibleNews
    .map(
      (item) => {
        const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}`;
        const detailLabel = escapeHtml(`查看站内解读：${item.title}`);

        return `
        <article class="news-card">
          <span class="category">${escapeHtml(item.label)}</span>
          <h3><a class="card-detail-link" href="${detailUrl}" aria-label="${detailLabel}">${escapeHtml(item.title)}</a></h3>
          <p class="card-summary"><strong>发生了什么</strong>${escapeHtml(item.body)}</p>
          <p class="trend-note"><strong>趋势判断</strong>${escapeHtml(item.trend)}</p>
          <p class="rank-note"><strong>入选理由</strong>${escapeHtml(item.whyRanked)}</p>
          <p class="impact-note"><strong>影响</strong>${escapeHtml(item.impact)}</p>
          <p class="next-check"><strong>下次核对</strong>${escapeHtml(item.nextCheck)}</p>
          <p class="evidence-threshold"><strong>确认门槛</strong>${escapeHtml(item.evidenceThreshold)}</p>
          <p class="claim-boundary"><strong>不能证明</strong>${escapeHtml(item.claimBoundary)}</p>
          <p class="verification-status"><strong>核验状态</strong>${escapeHtml(item.verificationStatus)}</p>
          <p class="source-note"><strong>${escapeHtml(item.trustLevel)} · ${escapeHtml(item.sourceRole)}</strong>${escapeHtml(item.provenance)}</p>
          <footer>
            <span>参考来源：${escapeHtml(item.source)}</span>
            <a class="reference-link" href="${detailUrl}" aria-label="${detailLabel}">查看站内解读</a>
            <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time>
          </footer>
        </article>
      `;
      },
    )
    .join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectFilter(button);
  });

  button.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];

    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentIndex = Array.from(filterButtons).indexOf(button);
    let nextIndex = currentIndex;

    if (event.key === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? filterButtons.length - 1 : currentIndex - 1;
    } else if (event.key === "ArrowRight") {
      nextIndex = currentIndex === filterButtons.length - 1 ? 0 : currentIndex + 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = filterButtons.length - 1;
    }

    const nextButton = filterButtons[nextIndex];
    nextButton.focus();
    selectFilter(nextButton);
  });
});

loadNews();
