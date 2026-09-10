const detailShell = document.querySelector("#detailShell");
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
    const currentFeed = await fetchJson("./data/news.json");
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

    <section class="canonical-briefing detail-scan-briefing" aria-label="事实、影响、边界和下一步核对速览">
      <div>
        <p class="eyebrow">Proof Path</p>
        <h2>先看这四点</h2>
        <p class="detail-board-note">左起：来源给了什么事实、可能影响谁、还证明不了什么、下一步查什么。</p>
      </div>
      <div class="canonical-briefing-grid">
        ${renderCanonicalBriefingBlocks(getCanonicalBriefingBlocks(item))}
      </div>
    </section>

    <nav class="incident-jump-nav" aria-label="本页目录">
      <a href="#incident-overview"><i>01</i>来源说了什么</a>
      <a href="#incident-analysis"><i>02</i>为什么值得看</a>
      <a href="#incident-trend"><i>03</i>会改变什么</a>
      <a href="#incident-source"><i>04</i>证明到哪一步</a>
      <a href="#incident-next"><i>05</i>自己怎么核对</a>
      <a href="#incident-editorial"><i>06</i>编辑判断</a>
    </nav>

    <section class="detail-grid simplified-detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        <section class="detail-block incident-block detail-primary-section" id="incident-overview">
          <span>01 · 事件简述</span>
          <h2>${escapeHtml(sourceName)}具体说了什么</h2>
          ${renderSourceStatus(isMedia ? "二手｜媒体报道" : "一手｜来源原文", `${sourceName} · ${String(item.publishedAt || "").slice(0, 10) || item.time}`)}
          <div class="detail-prose article-prose">
            ${renderDetailProse(getDetailFactArticle(item))}
          </div>
          ${renderReadingNote("这一段的边界", item.provenance)}
        </section>

        <section class="detail-block incident-block detail-primary-section" id="incident-analysis">
          <span>02 · 这件事怎么理解</span>
          <h2>为什么这条值得占用你的时间</h2>
          ${renderSourceStatus("本站判断｜不是来源原话", "以下是 AI Watchtower 的编辑解读，来源没有这样表述。")}
          <div class="detail-prose">
            ${renderDetailProse(item.detailWhyRanked)}
          </div>
          ${item.whoShouldCare ? `<p class="detail-so-what"><strong>谁该关心</strong>${escapeHtml(item.whoShouldCare)}</p>` : ""}
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>

        <section class="detail-block incident-block detail-primary-section" id="incident-trend">
          <span>03 · 可能带来的变化</span>
          <h2>如果后续被证实，会改变什么</h2>
          ${renderSourceStatus("趋势推断｜尚未被证据锁定", "这是对走向的推断，不是已经发生的事实。")}
          <div class="detail-prose">
            ${renderDetailProse(item.detailTrend)}
          </div>
          <p class="detail-so-what"><strong>对普通读者</strong>${escapeHtml(item.impact)}</p>
        </section>

        <section class="detail-block incident-block source-verification-block detail-secondary-context" id="incident-source">
          <span>04 · 来源与核验边界</span>
          <h2>这条来源能证明到哪一步</h2>
          ${renderSourceStatus("核验边界｜本页最关键的一节", "看完上面三段，先确认哪些还只是「报道了」，不是「证实了」。")}
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
            <div>
              <dt>来源</dt>
              <dd>${escapeHtml(sourceName)}</dd>
            </div>
            <div>
              <dt>来源类型</dt>
              <dd>${escapeHtml(getDetailSourceTypeLabel(item))}</dd>
            </div>
            <div>
              <dt>发布时间</dt>
              <dd><time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time></dd>
            </div>
            <div>
              <dt>核验状态</dt>
              <dd>${escapeHtml(getDetailClaimStatusLabel(item))}</dd>
            </div>
            <div>
              <dt>原文依赖</dt>
              <dd>${escapeHtml(getDetailOriginalDependencyLabel(item))}</dd>
            </div>
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

        <section class="detail-block incident-block detail-editorial-section" id="incident-editorial">
          <span>06 · 编辑判断</span>
          <h2>本站为什么把它排进这一期</h2>
          <details class="detail-editor-details" open>
            <summary>编辑评分与入选理由</summary>
            <p><strong>为什么入选</strong>${escapeHtml(getDetailTopReason(item))}</p>
            ${renderDetailSelectionScore(getDetailEditorScore(item))}
          </details>
          <p class="detail-source-reminder">${escapeHtml(sourceReminder)}</p>
        </section>
      </div>
    </section>

    <section class="detail-takeaway" aria-label="一句话结论">
      <p class="eyebrow">Takeaway</p>
      <p class="takeaway-headline">${escapeHtml(takeaway.headline)}</p>
      <p class="takeaway-boundary">但目前还证明不了：${escapeHtml(takeaway.boundary)}</p>
      <p class="takeaway-step"><b>先做这一件</b>${escapeHtml(takeaway.firstStep)}</p>
    </section>

    <section class="detail-sources" aria-label="情报来源与日期">
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
