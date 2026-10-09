const detailShell = document.querySelector("#detailShell");
let detailTrends = null;
const requiredDetailFields = [
  "label",
  "title",
  "body",
  "detailBody",
  "trend",
  "detailTrend",
  "whyRanked",
  "detailWhyRanked",
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
const incidentBriefingSections = [
  ["detailBody", 40],
  ["detailTrend", 40],
  ["detailWhyRanked", 40],
  ["impact", 12],
  ["readerUse", 12],
  ["nextCheck", 12],
  ["evidenceThreshold", 12],
  ["claimBoundary", 12],
  ["counterEvidence", 12],
  ["sourceRole", 2],
  ["provenance", 20],
  ["verificationStatus", 2],
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getNewsId() {
  return new URLSearchParams(window.location.search).get("id");
}

function getEditionId() {
  return new URLSearchParams(window.location.search).get("edition");
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${path} request failed with ${response.status}`);
  }

  return response.json();
}

function toDetailContext(feed) {
  return {
    edition: feed.edition,
    items: feed.items,
  };
}

async function loadDetail() {
  const newsId = getNewsId();
  const editionId = getEditionId();

  if (!newsId) {
    renderError("没有指定新闻条目。", "请从首页新闻流点击进入站内解读。");
    return;
  }

  try {
    const [currentFeed] = await Promise.all([
      fetchJson("./data/news.json"),
      fetchJson("./data/trends.json")
        .then((trends) => {
          detailTrends = trends;
        })
        .catch(() => {
          detailTrends = null;
        }),
    ]);
    validateDetailFeed(currentFeed);
    const currentContext = toDetailContext(currentFeed);
    const currentItem = (!editionId || editionId === currentFeed.edition.id)
      ? currentFeed.items.find((entry) => entry.id === newsId)
      : null;

    if (currentItem) {
      renderDetail(currentItem, currentContext);
      return;
    }

    const history = await fetchJson("./data/news-history.json");
    const historyContext = findHistoryContext(history, newsId, editionId);

    if (!historyContext) {
      renderError("没有找到这条新闻解读。", "它可能已被归档、改名或从当前期次中移除。");
      return;
    }

    renderDetail(historyContext.item, historyContext);
  } catch (error) {
    console.warn(error);
    renderError("新闻解读暂时无法读取。", "请稍后刷新，或返回首页查看新闻流。", true);
  }
}

function findHistoryContext(history, newsId, editionId) {
  if (!Array.isArray(history.editions)) {
    throw new Error("News history must include editions.");
  }

  for (const edition of history.editions) {
    if (editionId && edition.id !== editionId) {
      continue;
    }

    const item = edition.items?.find((entry) => entry.id === newsId);

    if (item) {
      return {
        edition,
        item,
      };
    }
  }

  return null;
}

function validateDetailFeed(data) {
  if (!data.edition?.date || !data.edition?.archiveLabel) {
    throw new Error("News detail data must include edition date and archive label.");
  }

  if (!Array.isArray(data.items)) {
    throw new Error("News detail data must include an items array.");
  }
}

function validateDetailItem(item) {
  const missingField = requiredDetailFields.find((field) => !item[field]);

  if (missingField) {
    throw new Error(`News detail item ${item.id || "without id"} is missing ${missingField}.`);
  }

  const missingBriefingSection = incidentBriefingSections.find(([field, minLength]) => {
    return typeof item[field] !== "string" || item[field].trim().length < minLength;
  });

  if (missingBriefingSection) {
    throw new Error(`News detail item ${item.id || "without id"} cannot support incident briefing section ${missingBriefingSection[0]}.`);
  }

  if (!Array.isArray(item.followUpQuestions) || item.followUpQuestions.length < 2) {
    throw new Error(`News detail item ${item.id || "without id"} must include follow-up questions.`);
  }
}

function getImpactMetrics(item) {
  return [
    {
      label: "事件日期",
      value: item.time,
    },
    {
      label: "情报类型",
      value: item.label,
    },
    {
      label: "来源角色",
      value: item.sourceRole,
    },
    {
      label: "核验状态",
      value: item.verificationStatus,
    },
  ];
}

function getOverviewCards(item) {
  return [
    {
      value: item.time,
      label: "事件时间",
      tone: "amber",
    },
    {
      value: item.label,
      label: "情报类别",
      tone: "ink",
    },
    {
      value: item.sourceRole,
      label: "可核对来源",
      tone: "coral",
    },
    {
      value: item.verificationStatus,
      label: "当前状态",
      tone: "blue",
    },
  ];
}

function getDiagramNodes(item) {
  return [
    {
      label: "事件简述",
      title: "事件简述",
      body: item.body,
      icon: "1",
    },
    {
      label: "为什么值得看",
      title: "为什么值得看",
      body: item.impact,
      icon: "2",
    },
    {
      label: "这意味着",
      title: "这意味着",
      body: stripDetailBoilerplate(item.detailTrend),
      icon: "3",
    },
    {
      label: "核对边界",
      title: "核对边界",
      body: item.claimBoundary,
      icon: "4",
    },
  ];
}

function getRiskCards(item) {
  return [
    {
      title: "核对边界",
      body: item.claimBoundary,
    },
    {
      title: "降级信号",
      body: item.counterEvidence,
    },
    {
      title: "继续观察",
      body: item.nextCheck,
    },
  ];
}

function getCanonicalBriefingBlocks(item) {
  return [
    {
      label: "01",
      title: "最小事实",
      body: stripDetailBoilerplate(item.detailBody),
    },
    {
      label: "02",
      title: "影响判断",
      body: item.impact,
    },
    {
      label: "03",
      title: "核验边界",
      body: item.claimBoundary,
    },
    {
      label: "04",
      title: "下一步核对",
      body: item.nextCheck,
    },
  ];
}

function getSourceBoundaryCards(item) {
  return [
    {
      title: "来源已支持",
      label: item.sourceRole,
      body: item.provenance,
    },
    {
      title: "本站解读",
      label: item.verificationStatus,
      body: stripDetailBoilerplate(item.detailTrend),
    },
    {
      title: "仍不能推出",
      label: "边界",
      body: item.claimBoundary,
    },
  ];
}

function renderCanonicalBriefingBlocks(blocks) {
  return blocks
    .map(
      (block) => `
        <article>
          <span>${escapeHtml(block.label)}</span>
          <h3>${escapeHtml(block.title)}</h3>
          <p>${escapeHtml(block.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderSourceBoundaryCards(cards) {
  return cards
    .map(
      (card) => `
        <article>
          <span>${escapeHtml(card.label)}</span>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderOverviewCards(cards) {
  return cards
    .map(
      (card) => `
        <article class="overview-card ${escapeHtml(card.tone)}">
          <strong>${escapeHtml(card.value)}</strong>
          <span>${escapeHtml(card.label)}</span>
        </article>
      `,
    )
    .join("");
}

function renderDiagramNodes(nodes) {
  return nodes
    .map(
      (node) => `
        <article class="diagram-node">
          <div class="diagram-node-body">
            <b aria-hidden="true">${escapeHtml(node.icon)}</b>
            <div>
              <h3>${escapeHtml(node.title)}</h3>
              <p>${escapeHtml(node.body)}</p>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderRiskCards(cards) {
  return cards
    .map(
      (card) => `
        <article>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `,
    )
    .join("");
}

function splitDetailProse(value) {
  const sourceParagraphs = String(value)
    .trim()
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const paragraphs = [];

  for (const sourceParagraph of sourceParagraphs) {
    const sentences = sourceParagraph.match(/[^。！？.!?]+[。！？.!?]?/g);

    if (!sentences || sourceParagraph.length <= 140) {
      paragraphs.push(sourceParagraph);
      continue;
    }

    let currentParagraph = "";

    for (const sentence of sentences) {
      const normalizedSentence = sentence.trim();

      if (!normalizedSentence) {
        continue;
      }

      const nextParagraph = currentParagraph
        ? `${currentParagraph}${normalizedSentence}`
        : normalizedSentence;

      if (currentParagraph && nextParagraph.length > 140) {
        paragraphs.push(currentParagraph);
        currentParagraph = normalizedSentence;
      } else {
        currentParagraph = nextParagraph;
      }
    }

    if (currentParagraph) {
      paragraphs.push(currentParagraph);
    }
  }

  return paragraphs.length ? paragraphs : [String(value).trim()];
}

// detailBody / detailTrend / detailWhyRanked 由流水线在原字段后追加同一段通用说明，
// 每条新闻都一样，对读者是纯噪声。渲染时去掉，只留这条新闻自己的内容。
const DETAIL_BOILERPLATE = [
  /\s*详情页补充：[^。]*。/g,
  /\s*来源边界是本期排序核心：[^。]*。/g,
];

function stripDetailBoilerplate(value) {
  return DETAIL_BOILERPLATE.reduce((text, pattern) => text.replace(pattern, ""), String(value || "")).trim();
}

function renderDetailProse(value) {
  const cleaned = stripDetailBoilerplate(value);

  if (!cleaned) {
    return "";
  }

  return splitDetailProse(cleaned)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

// 每一段都标明这段话是谁说的：来源原话、本站判断，还是尚未锁定的推断。
function renderSourceStatus(label, note) {
  return `<p class="detail-source-status"><b>${escapeHtml(label)}</b><span>${escapeHtml(note)}</span></p>`;
}

function renderReadingNote(label, body) {
  if (!body) {
    return "";
  }

  return `
    <aside class="detail-reading-note">
      <strong>${escapeHtml(label)}</strong>
      <p>${escapeHtml(body)}</p>
    </aside>
  `;
}

function getVerifySteps(item) {
  const questions = Array.isArray(item.followUpQuestions) ? item.followUpQuestions : [];
  return [item.nextCheck, ...questions].filter(Boolean);
}

function getTakeaway(item) {
  return {
    headline: getDetailWhyItMatters(item),
    boundary: item.claimBoundary,
    firstStep: item.nextCheck,
  };
}

function getSourceEntries(item, data) {
  const entries = [
    {
      name: getDetailSourceName(item),
      title: item.title,
      date: String(item.publishedAt || "").slice(0, 10) || item.time,
      role: isMediaSourcedItem(item) ? "二手 · 媒体报道" : "一手 · 来源原文",
      url: getDetailOriginalUrl(item),
    },
  ];

  if (item.originalUrl && item.sourceUrl && item.originalUrl !== item.sourceUrl) {
    entries.push({
      name: `${getDetailSourceName(item)}（引用入口）`,
      title: "本站抓取时使用的链接",
      date: String(item.publishedAt || "").slice(0, 10),
      role: "抓取入口",
      url: item.sourceUrl,
    });
  }

  entries.push({
    name: "AI Watchtower",
    title: `${data.edition.date} ${data.edition.archiveLabel} 期次整理`,
    date: data.edition.date,
    role: "站内整理 · 非独立测量",
    url: "./archive.html",
  });

  return entries;
}

function renderSourceEntries(entries) {
  return entries
    .map(
      (entry, index) => `
        <li>
          <span class="source-entry-index">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <a href="${escapeHtml(entry.url)}"${entry.url.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(entry.name)}</a>
            <p>${escapeHtml(entry.title)}</p>
            <small>${escapeHtml(entry.date)} · ${escapeHtml(entry.role)}</small>
          </div>
        </li>
      `,
    )
    .join("");
}

function getDetailSummary(item) {
  return item.summary || item.body;
}

function getDetailWhyItMatters(item) {
  return item.whyItMatters || item.impact || item.trend || item.whyRanked;
}

function getDetailTopReason(item) {
  return item.topReason || item.whyRanked;
}

function getDetailEditorScore(item) {
  return item.editorScore || item.selectionScore;
}

function getDetailSourceName(item) {
  return item.sourceName || item.source;
}

const detailSourceTypeLabels = {
  official: "官方",
  research: "研究",
  regulator: "机构",
  reliable_media: "媒体背景",
  media_report: "媒体背景",
  media: "媒体背景",
  community: "社区信号",
  vendor: "厂商叙事",
};

const detailClaimStatusLabels = {
  confirmed: "已确认",
  reported: "媒体报道",
  announced: "已公告",
  preprint: "预印本",
  rumored: "未证实",
};

const detailDependencyLabels = {
  "must-read": "必须读原文",
  recommended: "建议读原文",
  optional: "可选读原文",
};

function getDetailSourceType(item) {
  return item.sourceType || item.sourceRole || item.trustLevel;
}

function getDetailSourceTypeLabel(item) {
  const raw = item.sourceType || item.trustLevel;
  return detailSourceTypeLabels[String(raw)] || item.sourceRole || raw || "未标注";
}

function getDetailClaimStatusLabel(item) {
  const raw = getDetailClaimStatus(item);
  return detailClaimStatusLabels[String(raw)] || raw || "未标注";
}

function getDetailOriginalDependencyLabel(item) {
  const raw = getDetailOriginalDependency(item);
  return detailDependencyLabels[String(raw)] || raw;
}

function getDetailClaimStatus(item) {
  return item.claimStatus || item.verificationStatus;
}

function getDetailOriginalUrl(item) {
  return item.originalUrl || item.sourceUrl;
}

function getDetailOriginalDependency(item) {
  if (item.originalDependency) {
    return item.originalDependency;
  }

  const sourceType = String(getDetailSourceType(item) || "").toLowerCase();
  return /media|媒体/.test(sourceType) ? "must-read" : "recommended";
}

function isMediaSourcedItem(item) {
  const sourceType = String(item.sourceType || "").toLowerCase();
  const sourceRole = String(item.sourceRole || "");
  const originalDependency = getDetailOriginalDependency(item);

  return (
    ["reliable_media", "media_report"].includes(sourceType) ||
    /媒体/.test(sourceRole) ||
    originalDependency === "must-read"
  );
}

function getDetailSourceReminder(item) {
  const sourceName = getDetailSourceName(item);

  if (isMediaSourcedItem(item)) {
    return `这条是媒体背景：AI Watchtower 只保留最小事实并提供中文解读，完整事实、引述、采访、图表、数据与上下文仍归 ${sourceName} 原文。`;
  }

  return "本站只做中文解读，完整事实、方法、数据和上下文请查看原文。";
}

function getMediaOriginalCallout(item) {
  if (!isMediaSourcedItem(item)) {
    return "";
  }

  const sourceName = getDetailSourceName(item);

  return `媒体原文必读：本站先帮你判断意义和核验边界；金额、采访、图表、文件细节和上下文仍请回到 ${sourceName} 核对。`;
}

function renderMediaOriginalCallout(callout) {
  if (!callout) {
    return "";
  }

  return `
    <aside class="media-original-callout" aria-label="媒体原文阅读提醒">
      <strong>完整事实入口</strong>
      <p>${escapeHtml(callout)}</p>
    </aside>
  `;
}

function getDetailFactArticle(item) {
  return stripDetailBoilerplate(item.detailBody) || item.body;
}

function getQuickSummary(item) {
  return [
    {
      label: "这件事是什么",
      body: getDetailSummary(item),
    },
    {
      label: "为什么和你有关",
      body: getDetailWhyItMatters(item),
    },
    {
      label: "继续看哪里",
      body: item.nextCheck,
    },
  ];
}

function renderDetailSelectionScore(score) {
  if (!score || typeof score !== "object" || !Number.isInteger(score.total)) {
    return "";
  }

  return `
    <p class="selection-score">
      <strong>编辑评分 ${score.total}/25</strong>
      ${escapeHtml(score.note || "")}
    </p>
  `;
}

function renderQuickSummary(summaryItems) {
  return summaryItems
    .map(
      (summaryItem, index) => `
        <li>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(summaryItem.label)}</strong>
          <p>${escapeHtml(summaryItem.body)}</p>
        </li>
      `,
    )
    .join("");
}

function renderMetricList(metrics) {
  return metrics
    .map(
      (metric) => `
        <div>
          <dt>${escapeHtml(metric.value)}</dt>
          <dd>${escapeHtml(metric.label)}</dd>
        </div>
      `,
    )
    .join("");
}


/* ============================================================
   结构化可视区块：有数据才渲染，没有就整块不出现
   keyFacts / timeline / comparison / beforeAfter / relationGraph
   趋势图不手写，由 data/trends.json 的归档统计生成
   ============================================================ */

const RELATION_KIND_COLORS = {
  claim: "#c08a15",
  dispute: "#4f8ed9",
  evidence: "#49a86b",
};

const RELATION_KIND_LABELS = {
  claim: "主张方",
  dispute: "质疑方",
  evidence: "证据要求",
  subject: "争议对象",
};

function renderVisualSection(id, eyebrow, heading, note, body) {
  if (!body) {
    return "";
  }

  return `
    <section class="detail-visual" id="${id}">
      <div class="detail-visual-head">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(heading)}</h2>
        ${note ? `<p class="detail-board-note">${escapeHtml(note)}</p>` : ""}
      </div>
      ${body}
    </section>
  `;
}

/* 逐节拆解：参照 visionhub 日次幻灯页的分节结构。
   每节自带「这段是谁说的」标签和出处行，可带表格、清单和读法提示。
   字段缺失时整块不渲染。 */
function renderDeepSectionBlock(section, index) {
  const number = String(index + 1).padStart(2, "0");
  const bodyParagraphs = (Array.isArray(section.body) ? section.body : [section.body])
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  const list = section.list?.items?.length
    ? `
      <div class="deep-list">
        ${section.list.title ? `<strong>${escapeHtml(section.list.title)}</strong>` : ""}
        <ul>${section.list.items.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
      </div>
    `
    : "";

  const table = section.table?.rows?.length
    ? `
      <div class="detail-table-scroll">
        <table class="detail-compare-table">
          ${section.table.caption ? `<caption>${escapeHtml(section.table.caption)}</caption>` : ""}
          <thead>
            <tr>${section.table.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${section.table.rows
              .map(
                (row) =>
                  `<tr>${row
                    .map((cell, cellIndex) =>
                      cellIndex === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`,
                    )
                    .join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
    : "";

  return `
    <section class="deep-section" id="deep-${number}">
      <p class="deep-section-index">${number} · ${escapeHtml(section.label || "")}</p>
      <h3>${escapeHtml(section.heading)}</h3>
      ${
        section.sourceStatus
          ? renderSourceStatus(section.sourceStatus.tag, section.sourceStatus.note || "")
          : ""
      }
      <div class="detail-prose">${bodyParagraphs}</div>
      ${list}
      ${table}
      ${section.note ? renderReadingNote(section.note.label, section.note.body) : ""}
      ${section.sourceLine ? `<p class="deep-section-source">${escapeHtml(section.sourceLine)}</p>` : ""}
    </section>
  `;
}

function renderDeepSections(item) {
  const sections = Array.isArray(item.deepSections) ? item.deepSections.filter((entry) => entry?.heading) : [];

  if (!sections.length) {
    return "";
  }

  return `
    <section class="detail-deep" id="detail-deep" aria-label="逐节拆解">
      <div class="detail-visual-head">
        <p class="eyebrow">Breakdown</p>
        <h2>逐节拆解</h2>
        <p class="detail-board-note">按原始来源的结构逐节展开。每一节都标出这段话来自哪里，以及来源在这一节里没有说什么。</p>
      </div>
      <nav class="deep-section-nav" aria-label="逐节拆解目录">
        ${sections
          .map(
            (section, index) =>
              `<a href="#deep-${String(index + 1).padStart(2, "0")}"><i>${String(index + 1).padStart(2, "0")}</i>${escapeHtml(section.navLabel || section.label || "")}</a>`,
          )
          .join("")}
      </nav>
      ${sections.map(renderDeepSectionBlock).join("")}
    </section>
  `;
}

function renderKeyFacts(item) {
  const facts = Array.isArray(item.keyFacts) ? item.keyFacts.filter((fact) => fact?.value) : [];

  if (!facts.length) {
    return "";
  }

  return `
    <dl class="key-facts" aria-label="这条信号的关键事实">
      ${facts
        .map(
          (fact) => `
            <div>
              <dt>${escapeHtml(fact.value)}</dt>
              <dd>${escapeHtml(fact.label)}</dd>
              ${fact.note ? `<small>${escapeHtml(fact.note)}</small>` : ""}
            </div>
          `,
        )
        .join("")}
    </dl>
  `;
}

function renderTimeline(item) {
  const steps = Array.isArray(item.timeline) ? item.timeline.filter((step) => step?.title) : [];

  if (steps.length < 2) {
    return "";
  }

  const body = `
    <ol class="detail-timeline-rail">
      ${steps
        .map(
          (step) => `
            <li class="tone-${escapeHtml(step.tone || "neutral")}">
              <time>${escapeHtml(step.date || "")}</time>
              <strong>${escapeHtml(step.title)}</strong>
              ${step.body ? `<p>${escapeHtml(step.body)}</p>` : ""}
            </li>
          `,
        )
        .join("")}
    </ol>
  `;

  return renderVisualSection("detail-timeline", "Timeline", "事情是怎么走到今天的", item.timelineNote, body);
}

function renderComparison(item) {
  const table = item.comparison;

  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows) || !table.rows.length) {
    return "";
  }

  const body = `
    <div class="detail-table-scroll">
      <table class="detail-compare-table">
        ${table.caption ? `<caption>${escapeHtml(table.caption)}</caption>` : ""}
        <thead>
          <tr>${table.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${table.rows
            .map(
              (row) =>
                `<tr>${row
                  .map((cell, index) =>
                    index === 0
                      ? `<th scope="row">${escapeHtml(cell)}</th>`
                      : `<td>${escapeHtml(cell)}</td>`,
                  )
                  .join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  return renderVisualSection("detail-comparison", "Comparison", "同一件事，不同说法摆在一起", item.comparisonNote, body);
}

function renderBeforeAfter(item) {
  const pair = item.beforeAfter;

  if (!pair?.before?.points?.length || !pair?.after?.points?.length) {
    return "";
  }

  const column = (side, tone) => `
    <article class="before-after-col tone-${tone}">
      <span>${escapeHtml(side.label)}</span>
      <ul>${side.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </article>
  `;

  const body = `
    <div class="before-after">
      ${column(pair.before, "before")}
      <div class="before-after-arrow" aria-hidden="true">→</div>
      ${column(pair.after, "after")}
    </div>
  `;

  return renderVisualSection("detail-before-after", "Before / After", "这条消息改变了什么判断", pair.caption, body);
}

function wrapGraphLabel(label, perLine = 9) {
  const text = String(label);
  const lines = [];

  for (let index = 0; index < text.length; index += perLine) {
    lines.push(text.slice(index, index + perLine));

    if (lines.length === 3) {
      break;
    }
  }

  if (text.length > perLine * 3) {
    lines[2] = `${lines[2].slice(0, perLine - 1)}…`;
  }

  return lines;
}

function renderRelationGraph(item) {
  const graph = item.relationGraph;
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];

  if (nodes.length < 2) {
    return "";
  }

  const BOX_W = 172;
  const BOX_H = 74;
  const COL_GAP = 78;
  const ROW_GAP = 26;
  const PAD = 12;

  const layers = [...new Set(nodes.map((node) => Number(node.layer) || 0))].sort((a, b) => a - b);
  const byLayer = layers.map((layer) => nodes.filter((node) => (Number(node.layer) || 0) === layer));
  const maxRows = Math.max(...byLayer.map((column) => column.length));

  const width = layers.length * BOX_W + (layers.length - 1) * COL_GAP + PAD * 2;
  const height = maxRows * BOX_H + (maxRows - 1) * ROW_GAP + PAD * 2;

  const position = new Map();

  byLayer.forEach((column, columnIndex) => {
    const columnHeight = column.length * BOX_H + (column.length - 1) * ROW_GAP;
    const offsetY = PAD + (height - PAD * 2 - columnHeight) / 2;

    column.forEach((node, rowIndex) => {
      position.set(node.id, {
        x: PAD + columnIndex * (BOX_W + COL_GAP),
        y: offsetY + rowIndex * (BOX_H + ROW_GAP),
        node,
      });
    });
  });

  const edgePaths = edges
    .map((edge) => {
      const from = position.get(edge.from);
      const to = position.get(edge.to);

      if (!from || !to) {
        return "";
      }

      const x1 = from.x + BOX_W;
      const y1 = from.y + BOX_H / 2;
      const x2 = to.x;
      const y2 = to.y + BOX_H / 2;
      const midX = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 7} ${y2}`;
      const labelWidth = String(edge.label || "").length * 11 + 10;

      return `
        <path d="${path}" class="graph-edge" marker-end="url(#graphArrow)" />
        ${
          edge.label
            ? `<rect x="${midX - labelWidth / 2}" y="${(y1 + y2) / 2 - 10}" width="${labelWidth}" height="20" rx="10" class="graph-edge-label-bg" />
               <text x="${midX}" y="${(y1 + y2) / 2 + 4}" class="graph-edge-label">${escapeHtml(edge.label)}</text>`
            : ""
        }
      `;
    })
    .join("");

  const nodeBoxes = [...position.values()]
    .map(({ x, y, node }) => {
      const color = RELATION_KIND_COLORS[node.kind] || "#6b7a94";
      const kindLabel = RELATION_KIND_LABELS[node.kind] || "";
      const lines = wrapGraphLabel(node.label);
      const startY = y + BOX_H / 2 - (lines.length - 1) * 9 + (kindLabel ? 4 : 0);

      return `
        <g class="graph-node">
          <rect x="${x}" y="${y}" width="${BOX_W}" height="${BOX_H}" rx="10" class="graph-node-box" />
          <rect x="${x}" y="${y}" width="4" height="${BOX_H}" rx="2" fill="${color}" />
          ${kindLabel ? `<text x="${x + 16}" y="${y + 18}" class="graph-node-kind">${escapeHtml(kindLabel)}</text>` : ""}
          ${lines
            .map(
              (line, index) =>
                `<text x="${x + 16}" y="${startY + index * 18}" class="graph-node-label">${escapeHtml(line)}</text>`,
            )
            .join("")}
        </g>
      `;
    })
    .join("");

  const body = `
    <div class="detail-graph-scroll">
      <svg
        class="relation-graph"
        viewBox="0 0 ${width} ${height}"
        width="${width}"
        height="${height}"
        role="img"
        aria-label="${escapeHtml(graph.caption || "关系图")}"
      >
        <defs>
          <marker id="graphArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="graph-arrow" />
          </marker>
        </defs>
        ${edgePaths}
        ${nodeBoxes}
      </svg>
    </div>
    <ul class="graph-legend" aria-hidden="true">
      ${[...new Set(nodes.map((node) => node.kind).filter((kind) => RELATION_KIND_LABELS[kind]))]
        .map(
          (kind) =>
            `<li><i style="background:${RELATION_KIND_COLORS[kind] || "#6b7a94"}"></i>${escapeHtml(RELATION_KIND_LABELS[kind])}</li>`,
        )
        .join("")}
    </ul>
  `;

  return renderVisualSection("detail-relation", "Who claims what", "谁在主张、谁在质疑、还缺什么证据", graph.caption, body);
}

/* 架构对比图：把「原来怎么做」和「新做法怎么做」画成两条流程并排，
   每一步标出它是模型、数据、监控还是动作，箭头上写清楚发生了什么。
   差异数字单独列表，不塞进图里。 */
const TECH_STEP_KINDS = {
  model: "模型",
  data: "数据",
  monitor: "监控",
  action: "动作",
  service: "服务",
  cost: "成本",
};

function renderTechFlow(side, variant) {
  const steps = Array.isArray(side?.steps) ? side.steps : [];

  if (!steps.length) {
    return "";
  }

  const BOX_W = 250;
  const BOX_H = 62;
  const GAP = 52;
  const PAD = 10;
  const width = BOX_W + PAD * 2;
  const height = steps.length * BOX_H + (steps.length - 1) * GAP + PAD * 2;
  const arrows = Array.isArray(side.arrows) ? side.arrows : [];

  const parts = steps
    .map((step, index) => {
      const y = PAD + index * (BOX_H + GAP);
      const lines = wrapGraphLabel(step.label, 13);
      const startY = y + BOX_H / 2 - (lines.length - 1) * 9 + 4;
      const kind = TECH_STEP_KINDS[step.kind] ? escapeHtml(TECH_STEP_KINDS[step.kind]) : "";
      const boxClass = step.highlight ? "tech-box is-key" : "tech-box";

      const arrow =
        index < steps.length - 1
          ? `
            <line x1="${PAD + BOX_W / 2}" y1="${y + BOX_H}" x2="${PAD + BOX_W / 2}" y2="${y + BOX_H + GAP - 9}"
              class="tech-arrow" marker-end="url(#techArrow)" />
            ${
              arrows[index]
                ? `<text x="${PAD + BOX_W / 2 + 10}" y="${y + BOX_H + GAP / 2 + 4}" class="tech-arrow-label">${escapeHtml(arrows[index])}</text>`
                : ""
            }
          `
          : "";

      return `
        <g>
          <rect x="${PAD}" y="${y}" width="${BOX_W}" height="${BOX_H}" rx="10" class="${boxClass}" />
          ${kind ? `<text x="${PAD + 14}" y="${y + 17}" class="tech-box-kind">${kind}</text>` : ""}
          ${lines
            .map(
              (line, lineIndex) =>
                `<text x="${PAD + 14}" y="${startY + lineIndex * 17}" class="tech-box-label">${escapeHtml(line)}</text>`,
            )
            .join("")}
        </g>
        ${arrow}
      `;
    })
    .join("");

  return `
    <figure class="tech-flow tech-flow-${variant}">
      <figcaption>
        <span>${escapeHtml(side.label)}</span>
        ${side.note ? `<small>${escapeHtml(side.note)}</small>` : ""}
      </figcaption>
      <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img"
        aria-label="${escapeHtml(`${side.label}：${steps.map((step) => step.label).join(" → ")}`)}">
        <defs>
          <marker id="techArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="tech-arrow-head" />
          </marker>
        </defs>
        ${parts}
      </svg>
    </figure>
  `;
}

function renderTechDiagram(item) {
  const diagram = item.techDiagram;

  if (!diagram?.before?.steps?.length || !diagram?.after?.steps?.length) {
    return "";
  }

  const deltas = Array.isArray(diagram.deltas) ? diagram.deltas : [];

  const deltaTable = deltas.length
    ? `
      <div class="detail-table-scroll">
        <table class="detail-compare-table tech-delta-table">
          <caption>${escapeHtml(diagram.deltaCaption || "两种做法的可比数字")}</caption>
          <thead>
            <tr>
              <th scope="col">指标</th>
              <th scope="col">${escapeHtml(diagram.before.label)}</th>
              <th scope="col">${escapeHtml(diagram.after.label)}</th>
            </tr>
          </thead>
          <tbody>
            ${deltas
              .map(
                (delta) =>
                  `<tr><th scope="row">${escapeHtml(delta.label)}</th><td>${escapeHtml(delta.before)}</td><td class="is-after">${escapeHtml(delta.after)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
    : "";

  const body = `
    <div class="tech-diagram">
      ${renderTechFlow(diagram.before, "before")}
      <div class="tech-diagram-divider" aria-hidden="true"><span>改成</span></div>
      ${renderTechFlow(diagram.after, "after")}
    </div>
    ${deltaTable}
    ${diagram.note ? renderReadingNote(diagram.note.label || "读图", diagram.note.body) : ""}
  `;

  return renderVisualSection(
    "detail-tech",
    "How it works",
    diagram.heading || "原来怎么做，新做法改了哪一步",
    diagram.caption,
    body,
  );
}

function renderTrendChart(item, trends) {
  if (!trends?.weeks?.length) {
    return "";
  }

  const company = (item.companies || []).find((name) => trends.companies?.[name]);
  const tag = (item.tags || []).find((name) => trends.tags?.[name]);
  const subject = company || tag;
  const series = company ? trends.companies[company] : tag ? trends.tags[tag] : null;

  if (!series) {
    return "";
  }

  let lastFilled = series.length - 1;

  while (lastFilled >= 0 && series[lastFilled] === 0) {
    lastFilled -= 1;
  }

  if (lastFilled < 0) {
    return "";
  }

  const visible = series.slice(Math.max(0, lastFilled - 11), lastFilled + 1);
  const weeks = trends.weeks.slice(Math.max(0, lastFilled - 11), lastFilled + 1);
  const peak = Math.max(...visible);

  if (!peak) {
    return "";
  }

  const W = 640;
  const H = 180;
  const PAD_L = 34;
  const PAD_B = 28;
  const PAD_T = 16;
  const plotW = W - PAD_L - 12;
  const plotH = H - PAD_B - PAD_T;
  const slot = plotW / visible.length;
  const barW = Math.min(30, slot - 6);
  const lastIndex = visible.length - 1;
  const peakIndex = visible.indexOf(peak);

  const gridValues = [0, Math.round(peak / 2), peak].filter((value, index, list) => list.indexOf(value) === index);

  const bars = visible
    .map((value, index) => {
      const barH = Math.max(value > 0 ? 3 : 0, (value / peak) * plotH);
      const x = PAD_L + index * slot + (slot - barW) / 2;
      const y = PAD_T + plotH - barH;
      const showLabel = index === peakIndex || index === lastIndex;

      return `
        <g class="trend-bar">
          <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" />
          ${showLabel && value > 0 ? `<text x="${x + barW / 2}" y="${y - 6}" class="trend-value">${value}</text>` : ""}
          <title>${escapeHtml(weeks[index])} 当周 · ${value} 条</title>
          <rect x="${PAD_L + index * slot}" y="${PAD_T}" width="${slot}" height="${plotH}" class="trend-hit" />
        </g>
      `;
    })
    .join("");

  const axis = gridValues
    .map((value) => {
      const y = PAD_T + plotH - (value / peak) * plotH;
      return `
        <line x1="${PAD_L}" y1="${y}" x2="${W - 12}" y2="${y}" class="trend-grid" />
        <text x="${PAD_L - 8}" y="${y + 4}" class="trend-axis" text-anchor="end">${value}</text>
      `;
    })
    .join("");

  const ticks = weeks
    .map((week, index) =>
      index % 3 === 0 || index === lastIndex
        ? `<text x="${PAD_L + index * slot + slot / 2}" y="${H - 8}" class="trend-axis" text-anchor="middle">${week.slice(5)}</text>`
        : "",
    )
    .join("");

  const total = visible.reduce((sum, value) => sum + value, 0);
  const body = `
    <div class="detail-chart-scroll">
      <svg class="trend-chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"
        aria-label="${escapeHtml(`${subject} 近 12 周在站内归档中的信号数，合计 ${total} 条`)}">
        ${axis}
        ${bars}
        ${ticks}
      </svg>
    </div>
    <p class="detail-chart-note">近 12 周合计 ${total} 条；数据来自站内归档 <code>data/trends.json</code>，按发布周统计，不是外部热度指标。</p>
  `;

  return renderVisualSection(
    "detail-trend",
    "Trend",
    `${subject}：最近 12 周站内信号数`,
    "每一根柱子是那一周被 AI Watchtower 收录的相关条目数量，用来看这家公司/这个主题是不是在持续出现。",
    body,
  );
}

function renderError(title, message, canRetry = false) {
  detailShell.innerHTML = `
    <p class="eyebrow">News Explainer</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="detail-lede">${escapeHtml(message)}</p>
    <div class="detail-actions">
      <a class="button primary" href="./#feed">返回新闻流</a>
      ${canRetry ? '<button class="feed-retry" type="button">重新加载</button>' : ""}
    </div>
  `;

  detailShell.querySelector(".feed-retry")?.addEventListener("click", loadDetail);
}

function renderDetail(item, data) {
  validateDetailItem(item);
  document.title = `${item.title} | AI Watchtower`;
  const followUpQuestions = Array.isArray(item.followUpQuestions) ? item.followUpQuestions : [];
  const quickSummary = getQuickSummary(item);
  const originalUrl = getDetailOriginalUrl(item);
  const sourceName = getDetailSourceName(item);
  const sourceType = getDetailSourceType(item);
  const claimStatus = getDetailClaimStatus(item);
  const originalDependency = getDetailOriginalDependency(item);
  const sourceReminder = getDetailSourceReminder(item);
  const mediaOriginalCallout = getMediaOriginalCallout(item);

  const takeaway = getTakeaway(item);
  const verifySteps = getVerifySteps(item);
  const sourceEntries = getSourceEntries(item, data);
  const isMedia = isMediaSourcedItem(item);

  // 有真正的逐节拆解时走精简结构：概览只出现一次，边界只出现一次，不再三处重复。
  // 没有时回退到通用结构，保证旧条目照常渲染。
  const deepSectionCount = Array.isArray(item.deepSections)
    ? item.deepSections.filter((section) => section?.heading).length
    : 0;
  const hasDepth = deepSectionCount >= 3;

  const classicOverview = `
        <section class="detail-block incident-block detail-primary-section" id="incident-overview">
          <span>01 · 事件简述</span>
          <h2>${escapeHtml(sourceName)}具体说了什么</h2>
          ${renderSourceStatus(isMedia ? "二手｜媒体报道" : "一手｜来源原文", `${sourceName} · ${String(item.publishedAt || "").slice(0, 10) || item.time}`)}
          <div class="detail-prose article-prose">
            ${renderDetailProse(getDetailFactArticle(item))}
          </div>
          ${renderReadingNote("这一段的边界", item.provenance)}
        </section>`;

  const classicAnalysis = `
        <section class="detail-block incident-block detail-primary-section" id="incident-analysis">
          <span>02 · 这件事怎么理解</span>
          <h2>为什么这条值得占用你的时间</h2>
          ${renderSourceStatus("本站判断｜不是来源原话", "以下是 AI Watchtower 的编辑解读，来源没有这样表述。")}
          <div class="detail-prose">
            ${renderDetailProse(item.detailWhyRanked)}
          </div>
          ${item.whoShouldCare ? `<p class="detail-so-what"><strong>谁该关心</strong>${escapeHtml(item.whoShouldCare)}</p>` : ""}
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>`;

  const classicTrendSection = `
        <section class="detail-block incident-block detail-primary-section" id="incident-trend">
          <span>03 · 可能带来的变化</span>
          <h2>如果后续被证实，会改变什么</h2>
          ${renderSourceStatus("趋势推断｜尚未被证据锁定", "这是对走向的推断，不是已经发生的事实。")}
          <div class="detail-prose">
            ${renderDetailProse(item.detailTrend)}
          </div>
          <p class="detail-so-what"><strong>对普通读者</strong>${escapeHtml(item.impact)}</p>
        </section>`;

  const takeawayBlock = `
    <section class="detail-takeaway" aria-label="一句话结论">
      <p class="eyebrow">Takeaway</p>
      <p class="takeaway-headline">${escapeHtml(takeaway.headline)}</p>
      <p class="takeaway-boundary">但目前还证明不了：${escapeHtml(takeaway.boundary)}</p>
      <p class="takeaway-step"><b>先做这一件</b>${escapeHtml(takeaway.firstStep)}</p>
    </section>`;

  // 主图：技术类条目优先画架构对比，其次是关系图。两者都没有就不出现。
  const leadFigure = renderTechDiagram(item) || renderRelationGraph(item);

  const navItems = [
    ["#quick-summary", "01", "速览"],
    hasDepth ? ["#detail-deep", "02", "逐节拆解"] : ["#incident-overview", "02", "来源说了什么"],
    leadFigure ? ["#detail-tech", "03", "结构怎么变"] : null,
    ["#incident-source", "04", "证明到哪一步"],
    ["#incident-next", "05", "自己怎么核对"],
    ["#detail-sources", "06", "来源与日期"],
  ].filter(Boolean);

  detailShell.innerHTML = `
    <div class="incident-hero simplified-detail-hero">
      <p class="eyebrow">Incident Briefing · ${escapeHtml(item.label)}</p>
      <p class="detail-date">${escapeHtml(data.edition.date)} · ${escapeHtml(data.edition.archiveLabel)} · ${escapeHtml(getDetailClaimStatusLabel(item))}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="detail-lede">${escapeHtml(getDetailSummary(item))}</p>
      <ul class="detail-hero-chips" aria-label="这条信号的基本属性">
        <li><b>${escapeHtml(sourceName)}</b><span>来源</span></li>
        <li><b>${escapeHtml(getDetailSourceTypeLabel(item))}</b><span>来源类型</span></li>
        <li><b>${escapeHtml(getDetailClaimStatusLabel(item))}</b><span>核验状态</span></li>
        <li><b>${escapeHtml(getDetailOriginalDependencyLabel(item))}</b><span>原文依赖</span></li>
      </ul>
      <p class="detail-source-reminder">${escapeHtml(sourceReminder)}</p>
    </div>

    ${renderKeyFacts(item)}

    <section class="quick-summary" id="quick-summary" aria-label="速览">
      <div>
        <p class="eyebrow">30 秒速览</p>
        <h2>不看全文也能带走的三句话</h2>
      </div>
      <ol>
        ${renderQuickSummary(quickSummary)}
      </ol>
    </section>

    ${renderMediaOriginalCallout(mediaOriginalCallout)}

    ${hasDepth
      ? ""
      : `
    <section class="canonical-briefing detail-scan-briefing" aria-label="事实、影响、边界和下一步核对速览">
      <div>
        <p class="eyebrow">Proof Path</p>
        <h2>先看这四点</h2>
        <p class="detail-board-note">左起：来源给了什么事实、可能影响谁、还证明不了什么、下一步查什么。</p>
      </div>
      <div class="canonical-briefing-grid">
        ${renderCanonicalBriefingBlocks(getCanonicalBriefingBlocks(item))}
      </div>
    </section>`}

    <nav class="incident-jump-nav" aria-label="本页目录">
      ${navItems.map(([href, index, label]) => `<a href="${href}"><i>${index}</i>${escapeHtml(label)}</a>`).join("")}
    </nav>

    <section class="detail-grid simplified-detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        ${hasDepth ? "" : classicOverview}
        ${renderDeepSections(item)}
        ${leadFigure}
        ${renderBeforeAfter(item)}
        ${renderTimeline(item)}
        ${hasDepth ? "" : classicAnalysis}
        ${hasDepth ? "" : renderComparison(item)}
        ${hasDepth ? "" : classicTrendSection}

        <section class="detail-block incident-block source-verification-block detail-secondary-context" id="incident-source">
          <span>04 · 来源与核验边界</span>
          <h2>这条来源能证明到哪一步</h2>
          ${renderSourceStatus("核验边界｜本页最关键的一节", "先确认哪些还只是「报道了」，不是「证实了」。")}
          <div class="detail-boundary-grid">
            <article class="boundary-can">
              <span>来源能支持</span>
              <p>${escapeHtml(item.provenance)}</p>
            </article>
            <article class="boundary-cannot">
              <span>尚不能证明</span>
              <p>${escapeHtml(item.claimBoundary)}</p>
            </article>
            <article>
              <span>确认门槛</span>
              <p>${escapeHtml(item.evidenceThreshold)}</p>
            </article>
            <article>
              <span>降级信号</span>
              <p>${escapeHtml(item.counterEvidence)}</p>
            </article>
          </div>
          <dl class="source-verification-list">
            <div><dt>来源</dt><dd>${escapeHtml(sourceName)}</dd></div>
            <div><dt>来源类型</dt><dd>${escapeHtml(getDetailSourceTypeLabel(item))}</dd></div>
            <div><dt>发布时间</dt><dd><time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time></dd></div>
            <div><dt>核验状态</dt><dd>${escapeHtml(getDetailClaimStatusLabel(item))}</dd></div>
            <div><dt>原文依赖</dt><dd>${escapeHtml(getDetailOriginalDependencyLabel(item))}</dd></div>
          </dl>
          <a class="button secondary source-button" href="${escapeHtml(originalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${sourceName}（在新窗口打开）`)}">查看原文</a>
        </section>

        <section class="detail-block incident-block detail-primary-section" id="incident-next">
          <span>05 · 接下来要看哪里</span>
          <h2>你可以自己核对的几件事</h2>
          ${renderSourceStatus("行动清单｜按顺序做", "不需要全部做完；第一条通常就能判断这条要不要继续跟。")}
          <ol class="detail-verify-steps">
            ${verifySteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </section>

        ${renderTrendChart(item, detailTrends)}

        <section class="detail-block incident-block detail-editorial-section" id="incident-editorial">
          <span>06 · 编辑判断</span>
          <h2>本站为什么把它排进这一期</h2>
          <details class="detail-editor-details">
            <summary>编辑评分与入选理由</summary>
            <p><strong>为什么入选</strong>${escapeHtml(getDetailTopReason(item))}</p>
            ${renderDetailSelectionScore(getDetailEditorScore(item))}
          </details>
          <p class="detail-source-reminder">${escapeHtml(sourceReminder)}</p>
        </section>
      </div>
    </section>

    ${hasDepth ? "" : takeawayBlock}

    <section class="detail-sources" id="detail-sources" aria-label="情报来源与日期">
      <div>
        <p class="eyebrow">Sources</p>
        <h2>情报来源与日期</h2>
        <p class="detail-board-note">本页是公开资料的中文整理，不是独立测量或复现。一手来源与二手报道分开标注。</p>
      </div>
      <ol class="source-entry-list">
        ${renderSourceEntries(sourceEntries)}
      </ol>
    </section>

    <div class="detail-actions">
      <a class="button primary" href="./#feed">返回新闻流</a>
      <a class="button secondary" href="./all-news.html">查看全部 AI 新闻</a>
      <a class="button secondary" href="./#deep-briefing">查看本期深度简报</a>
    </div>
  `;
}

loadDetail();
