let news = [];
let newsCategories = [];
let currentFilter = "all";

const newsGrid = document.querySelector("#newsGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const latestCapture = document.querySelector("#latestCapture");
const newsMeta = document.querySelector("#newsMeta");
const coverageMix = document.querySelector("#coverageMix");
const categoryMeta = document.querySelector("#categoryMeta");
const briefingLabel = document.querySelector("#briefingLabel");
const briefingHeadline = document.querySelector("#briefingHeadline");
const briefingSummary = document.querySelector("#briefingSummary");
const briefingCta = document.querySelector("#briefingCta");
const briefingWatchPoints = document.querySelector("#briefingWatchPoints");
const topStories = document.querySelector("#topStories");
const heroSignalCount = document.querySelector("#heroSignalCount");
const heroSourceCount = document.querySelector("#heroSourceCount");
const heroChecklistMode = document.querySelector("#heroChecklistMode");
const deepKicker = document.querySelector("#deepKicker");
const deepDate = document.querySelector("#deepDate");
const deepTitle = document.querySelector("#deepTitle");
const deepSubtitle = document.querySelector("#deepSubtitle");
const deepOverview = document.querySelector("#deepOverview");
const deepMetrics = document.querySelector("#deepMetrics");
const deepSourceFrame = document.querySelector("#deepSourceFrame");
const deepTimeline = document.querySelector("#deepTimeline");
const deepSections = document.querySelector("#deepSections");
const deepActions = document.querySelector("#deepActions");
const deepLimits = document.querySelector("#deepLimits");
const deepReferences = document.querySelector("#deepReferences");
const requiredCardFields = [
  "category",
  "label",
  "title",
  "body",
  "trend",
  "whyRanked",
  "impact",
  "readerUse",
  "nextCheck",
  "followUpQuestions",
  "evidenceThreshold",
  "claimBoundary",
  "counterEvidence",
  "source",
  "sourceUrl",
  "sourceRole",
  "provenance",
  "trustLevel",
  "verificationStatus",
  "publishedAt",
  "time",
];

function sortNewsItems(items) {
  return [...items].sort((a, b) => {
    const dateDiff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

    if (dateDiff) {
      return dateDiff;
    }

    return String(a.title).localeCompare(String(b.title), "zh-CN");
  });
}

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
    news = sortNewsItems(data.items);
    newsCategories = data.categories;
    updateTodayBriefing(data.briefing);
    updateTopStories(news);
    updateDeepBriefing(data.deepBriefing);
    updateHeroStats(data);
    updateNewsMeta(data);
  } catch (error) {
    news = [];
    updateHeroStats();
    updateTopStories([]);
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

  const itemWithInvalidFollowUp = data.items.find(
    (item) =>
      !Array.isArray(item.followUpQuestions) ||
      item.followUpQuestions.length < 2 ||
      item.followUpQuestions.some((question) => !question || !question.endsWith("？")),
  );

  if (itemWithInvalidFollowUp) {
    throw new Error(`News item ${itemWithInvalidFollowUp.id || "without id"} must include follow-up questions.`);
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

  if (!Array.isArray(edition.coverageMix) || edition.coverageMix.length < 2) {
    throw new Error("News edition must include a coverage mix.");
  }

  const invalidCoverage = edition.coverageMix.find(
    (item) => !item.label || !Number.isInteger(item.count) || item.count < 1 || !item.meaning,
  );

  if (invalidCoverage) {
    throw new Error("Each edition coverage mix item must include label, count, and meaning.");
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

  if (!Array.isArray(deepBriefing.coverageLimits) || deepBriefing.coverageLimits.length < 2) {
    throw new Error("Deep briefing must include coverage limits.");
  }

  if (!deepBriefing.sourceFrame) {
    throw new Error("Deep briefing must include a source frame.");
  }

  const sourceFrameFields = ["sourceFacts", "editorialJudgment", "unknowns"];
  const missingSourceFrameField = sourceFrameFields.find((field) => !Array.isArray(deepBriefing.sourceFrame[field]));

  if (missingSourceFrameField) {
    throw new Error(`Deep briefing source frame is missing ${missingSourceFrameField}.`);
  }

  if (!Array.isArray(deepBriefing.references) || !deepBriefing.references.length) {
    throw new Error("Deep briefing must include source references.");
  }

  const invalidCoverageLimit = deepBriefing.coverageLimits.find((limit) => !limit.label || !limit.body);

  if (invalidCoverageLimit) {
    throw new Error("Each deep briefing coverage limit must include label and body.");
  }

  const invalidReference = deepBriefing.references.find(
    (reference) => !reference.label || !isValidSourceUrl(reference.url),
  );

  if (invalidReference) {
    throw new Error("Each deep briefing reference must include a label and valid source URL.");
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

function getThreeLineSummary(item) {
  return [
    { label: "核心事件", body: item.body },
    { label: "关键影响", body: item.impact },
    { label: "接下来要看", body: item.nextCheck },
  ];
}

function updateTopStories(items) {
  if (!topStories) {
    return;
  }

  const topItems = Array.isArray(items) ? items.slice(0, 3) : [];

  if (!topItems.length) {
    topStories.innerHTML = '<p class="feed-state">暂无 TOP3，新闻数据加载后会自动生成。</p>';
    return;
  }

  topStories.innerHTML = topItems
    .map((item, index) => {
      const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}`;
      const summaryLines = getThreeLineSummary(item)
        .map(
          (line) => `
            <li>
              <strong>${escapeHtml(line.label)}</strong>
              <span>${escapeHtml(line.body)}</span>
            </li>
          `,
        )
        .join("");

      return `
        <article class="top-story">
          <span class="top-rank">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <p class="eyebrow">${escapeHtml(item.label)} · ${escapeHtml(item.time)}</p>
            <h3><a href="${detailUrl}">${escapeHtml(item.title)}</a></h3>
            <p class="top-rank-reason"><strong>为什么排进 TOP3</strong>${escapeHtml(item.whyRanked)}</p>
            <ol>${summaryLines}</ol>
            <a class="reference-link" href="${detailUrl}">查看事件简报</a>
          </div>
        </article>
      `;
    })
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

  deepSourceFrame.innerHTML = renderSourceFrame(deepBriefing.sourceFrame);

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
  deepLimits.innerHTML = deepBriefing.coverageLimits
    .map(
      (limit) => `
        <article>
          <span>${escapeHtml(limit.label)}</span>
          <p>${escapeHtml(limit.body)}</p>
        </article>
      `,
    )
    .join("");
  deepReferences.innerHTML = deepBriefing.references
    .map(
      (reference, index) => `
        <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${reference.label}（在新窗口打开）`)}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          ${escapeHtml(reference.label)}
        </a>
      `,
    )
    .join("");
}

function renderSourceFrame(sourceFrame) {
  const groups = [
    {
      label: "来源能直接支持",
      items: sourceFrame.sourceFacts,
    },
    {
      label: "本站编辑判断",
      items: sourceFrame.editorialJudgment,
    },
    {
      label: "仍需等待证据",
      items: sourceFrame.unknowns,
    },
  ];

  return groups
    .map(
      (group) => `
        <article>
          <span>${escapeHtml(group.label)}</span>
          <ul>
            ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function updateNewsMeta(data) {
  if (latestCapture) {
    const captureDate = data.edition?.date || data.updatedAt || "等待更新";
    const captureLabel = data.edition?.archiveLabel || data.statusLabel || "尚无批次标签";
    const itemCount = Array.isArray(data.items) ? data.items.length : 0;
    latestCapture.textContent = `最新抓取：${captureDate} · ${captureLabel} · ${itemCount} 条`;
  }

  if (!newsMeta) {
    return;
  }

  const updatedAt = data.updatedAt ? `更新日期 ${data.updatedAt}` : "等待更新";
  const edition = data.edition
    ? `${data.edition.archiveLabel} ${data.edition.id} · 时区 ${data.edition.timezone} · ${data.edition.note}`
    : "尚无期次信息";
  newsMeta.textContent = `${data.statusLabel || "数据状态"} · ${updatedAt} · ${edition} · ${data.editorNote || ""}`;

  if (coverageMix) {
    const mixItems = data.edition?.coverageMix || [];
    coverageMix.innerHTML = mixItems
      .map(
        (item) => `
          <span>
            <strong>${escapeHtml(item.label)} · ${escapeHtml(item.count)} 条</strong>
            ${escapeHtml(item.meaning)}
          </span>
        `,
      )
      .join("");
  }
}

function updateHeroStats(data = {}) {
  if (heroSignalCount) {
    heroSignalCount.textContent = Array.isArray(data.items) ? String(data.items.length) : "--";
  }

  if (heroSourceCount) {
    heroSourceCount.textContent =
      Number.isInteger(data.sourceCount) && data.sourceCount > 0 ? String(data.sourceCount) : "--";
  }

  if (heroChecklistMode) {
    heroChecklistMode.textContent = Array.isArray(data.items) && data.items.length ? "逐条" : "--";
  }
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
          <p class="card-summary"><strong>事件简述</strong>${escapeHtml(item.body)}</p>
          <p class="trend-note"><strong>趋势研判</strong>${escapeHtml(item.trend)}</p>
          <p class="rank-note"><strong>关注价值</strong>${escapeHtml(item.whyRanked)}</p>
          <footer>
            <span>${escapeHtml(item.trustLevel)}</span>
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
