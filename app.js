let news = [];
let newsCategories = [];
let currentFilter = "all";

const newsGrid = document.querySelector("#newsGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const latestCapture = document.querySelector("#latestCapture");
const newsMeta = document.querySelector("#newsMeta");
const readerFrame = document.querySelector("#readerFrame");
const editionChange = document.querySelector("#editionChange");
const coverageMix = document.querySelector("#coverageMix");
const sourceFamilies = document.querySelector("#sourceFamilies");
const topicGroups = document.querySelector("#topicGroups");
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
const plannedTopicGroups = [
  {
    id: "agent",
    label: "Agent",
    emptyReason: "本期未捕捉到足够清楚的 Agent 工作流信号；概念演示不足以单独进入 TOP3。",
    promotionThreshold: "需要可核对的上线、客户使用、安全事件或工程变更，且能说明对读者的实际影响。",
    fallback: "可先查看历史 Agent 与开发者工具条目，作为背景而非本期新事实。",
  },
  {
    id: "model",
    label: "模型路线",
    emptyReason: "本期没有新的模型路线入选；历史模型消息不重复当作今日新增。",
    promotionThreshold: "需要官方发布、研究原文或可复核评测支持新的能力、价格、上下文或部署边界。",
    fallback: "可从归档中回看上一轮模型发布和评测信号，避免把旧背景当作新变化。",
  },
  {
    id: "enterprise",
    label: "企业工作流",
    emptyReason: "本期没有新的企业工作流信号达到站内解读门槛。",
    promotionThreshold: "需要明确客户、工作流、部署范围或治理控制，而不是泛化的厂商案例叙事。",
    fallback: "可结合本期市场份额和开发者入口信号，更新企业采购观察清单。",
  },
  {
    id: "policy",
    label: "政策监管",
    emptyReason: "本期未捕捉到可核对的正式政策变化；媒体场景不等同于新规则落地。",
    promotionThreshold: "需要政府文件、监管公告、正式会议公报或公司官方承诺来支撑政策判断。",
    fallback: "本期可把 G7 媒体信号当作后续核对入口，暂不当作政策更新。",
  },
  {
    id: "infrastructure",
    label: "基础设施",
    emptyReason: "本期没有新的算力、部署或基础设施信号入选。",
    promotionThreshold: "需要芯片、数据中心、电力、云区域或部署能力的可核对变化，而非单纯远期愿景。",
    fallback: "可回看归档中的 AI 工厂、电力并网和欧洲基础设施条目作为背景。",
  },
  {
    id: "developer-tooling",
    label: "开发者工具",
    emptyReason: "本期没有新的可试用工具发布入选；并购报道已作为资本信号处理。",
    promotionThreshold: "需要产品发布、开源仓库、迁移文档、安全公告或开发者可验证的能力变化。",
    fallback: "本期可先阅读 Cursor 交易报道的站内解读，关注开发者入口控制权。",
  },
];
const requiredCardFields = [
  "category",
  "label",
  "title",
  "body",
  "trend",
  "whyRanked",
  "selectionScore",
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

  validateEdition(data.edition, data.updatedAt, data.items);
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

  const itemWithInvalidSelectionScore = data.items.find((item) => !isValidSelectionScore(item.selectionScore));

  if (itemWithInvalidSelectionScore) {
    throw new Error(`News item ${itemWithInvalidSelectionScore.id || "without id"} has an invalid selection score.`);
  }
}

function isValidSelectionScore(score) {
  if (!score || typeof score !== "object") {
    return false;
  }

  const criteria = ["impact", "novelty", "narrativeStrength", "evidenceQuality", "readerUtility"];
  const total = criteria.reduce((sum, key) => sum + score[key], 0);

  return (
    criteria.every((key) => Number.isInteger(score[key]) && score[key] >= 1 && score[key] <= 5) &&
    Number.isInteger(score.total) &&
    score.total === total &&
    typeof score.note === "string" &&
    score.note.trim().length >= 18
  );
}

function isActionOrientedSignalUse(text) {
  return /用来(更新|检查|调整|核对|评估|复查|列出)/.test(String(text || ""));
}

function renderSelectionScore(score) {
  if (!isValidSelectionScore(score)) {
    return "";
  }

  return `
    <p class="selection-score">
      <strong>编辑评分 ${score.total}/25</strong>
      ${escapeHtml(score.note)}
    </p>
  `;
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

function validateEdition(edition, updatedAt, items = []) {
  const requiredFields = [
    "id",
    "date",
    "timezone",
    "archiveStatus",
    "archiveLabel",
    "note",
    "operationalStatus",
    "editorialInterpretation",
  ];

  if (!edition || requiredFields.some((field) => !edition[field])) {
    throw new Error("News data must include complete edition metadata.");
  }

  if (edition.date !== updatedAt) {
    throw new Error("News edition date must match updatedAt.");
  }

  if (edition.note.length > 80) {
    throw new Error("News edition note must stay short and leave status details to dedicated fields.");
  }

  if (!Array.isArray(edition.coverageMix) || edition.coverageMix.length < 2) {
    throw new Error("News edition must include a coverage mix.");
  }

  validateReaderFrame(edition.readerFrame);
  validateEditionChange(edition.changeSummary);

  const invalidCoverage = edition.coverageMix.find(
    (item) =>
      !item.label ||
      !Number.isInteger(item.count) ||
      item.count < 1 ||
      !item.meaning ||
      !isActionOrientedSignalUse(item.meaning),
  );

  if (invalidCoverage) {
    throw new Error("Each edition coverage mix item must include label, count, and an action-oriented meaning.");
  }

  if (!Array.isArray(edition.sourceFamilies) || !edition.sourceFamilies.length) {
    throw new Error("News edition must include source family framing.");
  }

  const invalidSourceFamily = edition.sourceFamilies.find(
    (item) => !item.family || !item.label || !Number.isInteger(item.count) || item.count < 1 || !item.role,
  );

  if (invalidSourceFamily) {
    throw new Error("Each edition source family must include family, label, count, and role.");
  }

  if (!Array.isArray(edition.topicGroups) || !edition.topicGroups.length) {
    throw new Error("News edition must include topic groups.");
  }

  const invalidPlannedTopic = plannedTopicGroups.find(
    (topic) => !topic.emptyReason || !topic.promotionThreshold || !topic.fallback,
  );

  if (invalidPlannedTopic) {
    throw new Error("Each planned topic must explain why it was omitted, what would promote it, and where to read instead.");
  }

  const itemIds = new Set(items.map((item) => item.id));
  const allowedTopics = new Set(plannedTopicGroups.map((topic) => topic.id));
  const invalidTopicGroup = edition.topicGroups.find(
    (topic) =>
      !topic.id ||
      !topic.label ||
      !Number.isInteger(topic.count) ||
      topic.count < 1 ||
      !Array.isArray(topic.itemIds) ||
      topic.itemIds.length !== topic.count ||
      !topic.meaning ||
      !isActionOrientedSignalUse(topic.meaning) ||
      !allowedTopics.has(topic.id) ||
      topic.itemIds.some((id) => !itemIds.has(id)),
  );

  if (invalidTopicGroup) {
    throw new Error("Each edition topic group must use a supported topic, reference current news items, and name the reader action.");
  }
}

function validateReaderFrame(frame) {
  if (!frame || !frame.headline || !frame.whyItMatters) {
    throw new Error("News edition must include a reader frame.");
  }

  if (!Array.isArray(frame.useThisIssueFor) || frame.useThisIssueFor.length < 2) {
    throw new Error("News edition reader frame must include reader uses.");
  }

  if (!Array.isArray(frame.notProvenYet) || frame.notProvenYet.length < 2) {
    throw new Error("News edition reader frame must include unresolved proof boundaries.");
  }
}

function validateEditionChange(changeSummary) {
  if (!changeSummary || !changeSummary.headline) {
    throw new Error("News edition must include a change summary.");
  }

  if (!Array.isArray(changeSummary.freshFacts) || changeSummary.freshFacts.length < 2) {
    throw new Error("News edition change summary must include fresh facts.");
  }

  if (!Array.isArray(changeSummary.repeatedContext) || changeSummary.repeatedContext.length < 2) {
    throw new Error("News edition change summary must separate repeated context.");
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
            ${renderSelectionScore(item.selectionScore)}
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
          <p class="deep-so-what"><strong>为什么重要</strong>${escapeHtml(section.soWhat)}</p>
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
    ? [
        `${data.edition.archiveLabel} ${data.edition.id}`,
        `时区 ${data.edition.timezone}`,
        `范围：${data.edition.note}`,
        `运行：${data.edition.operationalStatus}`,
        `编辑：${data.edition.editorialInterpretation}`,
      ].join(" · ")
    : "尚无期次信息";
  newsMeta.textContent = `${data.statusLabel || "数据状态"} · ${updatedAt} · ${edition} · ${data.editorNote || ""}`;

  if (readerFrame) {
    readerFrame.innerHTML = renderReaderFrame(data.edition?.readerFrame);
  }

  if (editionChange) {
    editionChange.innerHTML = renderEditionChange(data.edition?.changeSummary);
  }

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

  if (sourceFamilies) {
    const families = data.edition?.sourceFamilies || [];
    sourceFamilies.innerHTML = families
      .map(
        (item) => `
          <span>
            <strong>${escapeHtml(item.label)} · ${escapeHtml(item.count)} 条</strong>
            ${escapeHtml(item.role)}
          </span>
        `,
      )
      .join("");
  }

  if (topicGroups) {
    const topics = data.edition?.topicGroups || [];
    const coveredTopicIds = new Set(topics.map((topic) => topic.id));
    const missingTopics = plannedTopicGroups.filter((topic) => !coveredTopicIds.has(topic.id));

    topicGroups.innerHTML = [
      ...topics.map(
        (topic) => `
          <span>
            <strong>${escapeHtml(topic.label)} · ${escapeHtml(topic.count)} 条</strong>
            ${escapeHtml(topic.meaning)}
          </span>
        `,
      ),
      ...missingTopics.map(
        (topic) => `
          <span class="empty-topic">
            <strong>${escapeHtml(topic.label)} · 本期未捕捉</strong>
            <em>未入选原因</em>
            ${escapeHtml(topic.emptyReason)}
            <em>入选门槛</em>
            ${escapeHtml(topic.promotionThreshold)}
            <em>替代阅读</em>
            ${escapeHtml(topic.fallback)}
          </span>
        `,
      ),
    ].join("");
  }
}

function renderEditionChange(changeSummary) {
  if (!changeSummary) {
    return "";
  }

  const freshFacts = changeSummary.freshFacts
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const repeatedContext = changeSummary.repeatedContext
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <article>
      <span>相比上一批次</span>
      <h3>${escapeHtml(changeSummary.headline)}</h3>
      <div>
        <strong>本期新鲜事实</strong>
        <ul>${freshFacts}</ul>
      </div>
      <div>
        <strong>重复背景</strong>
        <ul>${repeatedContext}</ul>
      </div>
    </article>
  `;
}

function renderReaderFrame(frame) {
  if (!frame) {
    return "";
  }

  const readerUses = frame.useThisIssueFor
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const boundaries = frame.notProvenYet
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <article>
      <span>本期读者使用框架</span>
      <h3>${escapeHtml(frame.headline)}</h3>
      <p>${escapeHtml(frame.whyItMatters)}</p>
      <div>
        <strong>可以用来</strong>
        <ul>${readerUses}</ul>
      </div>
      <div>
        <strong>尚未证明</strong>
        <ul>${boundaries}</ul>
      </div>
    </article>
  `;
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
  const recoveryLinks = type === "error"
    ? `
      <div class="feed-state-actions" aria-label="新闻数据加载失败后的备用入口">
        <a href="./all-news.html">查看全部情报</a>
        <a href="./data/news.json">打开本期数据</a>
        <a href="./archive.html">查看期次归档</a>
      </div>
    `
    : "";

  newsGrid.innerHTML = `
    <div class="feed-state ${type}" role="status">
      <p>${escapeHtml(message)}</p>
      ${type === "error" ? "<p>这通常表示结构化数据文件暂时没有下载成功，不代表本期没有情报。可以先查看历史题目、原始数据或期次归档。</p>" : ""}
      ${recoveryLinks}
      ${retryButton}
    </div>
  `;

  newsGrid.querySelector(".feed-retry")?.addEventListener("click", loadNews);
}

function renderNews(filter = "all") {
  const topStoryIds = new Set(news.slice(0, 3).map((item) => item.id));
  const scopedNews = filter === "all" ? news : news.filter((item) => item.category === filter);
  const visibleNews = scopedNews.filter((item) => !topStoryIds.has(item.id));
  updateCategoryMeta(filter);

  if (!scopedNews.length) {
    renderFeedMessage("empty", "暂无匹配内容，后续接入真实来源后会自动补充。");
    return;
  }

  if (!visibleNews.length) {
    const message = filter === "all"
      ? "本批次 TOP3 已覆盖全部新闻流；下一批抓取更多情报后，这里会展示 TOP3 之外的简短条目。"
      : "这个分类目前只有 TOP3 条目；后续抓取更多情报后会在这里单独显示。";
    renderFeedMessage("empty", message);
    return;
  }

  newsGrid.innerHTML = visibleNews
    .map(
      (item) => {
        const detailUrl = `./news-detail.html?id=${encodeURIComponent(item.id)}`;
        const detailLabel = escapeHtml(`查看站内解读：${item.title}`);

        return `
        <article class="news-card compact-feed-card">
          <span class="category">${escapeHtml(item.label)}</span>
          <div class="news-card-body">
            <h3><a class="card-detail-link" href="${detailUrl}" aria-label="${detailLabel}">${escapeHtml(item.title)}</a></h3>
            <p class="card-summary"><strong>事件简述</strong>${escapeHtml(item.body)}</p>
            <p class="trend-note"><strong>这意味着</strong>${escapeHtml(item.trend)}</p>
          </div>
          <footer>
            <span>${escapeHtml(item.trustLevel)}</span>
            <a class="reference-link" href="${detailUrl}" aria-label="${detailLabel}">详情</a>
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
