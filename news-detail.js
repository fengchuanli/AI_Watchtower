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
      body: item.detailTrend,
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
      body: item.detailBody,
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
      body: item.detailTrend,
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

function renderDetailProse(value) {
  return splitDetailProse(value)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
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

function getDetailSourceType(item) {
  return item.sourceType || item.sourceRole || item.trustLevel;
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

function getDetailFactArticle(item) {
  return item.detailBody || item.body;
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

  detailShell.innerHTML = `
    <div class="incident-hero simplified-detail-hero">
      <p class="eyebrow">Incident Briefing · ${escapeHtml(item.label)}</p>
      <p class="detail-date">${escapeHtml(data.edition.date)} · ${escapeHtml(data.edition.archiveLabel)} · ${escapeHtml(claimStatus)}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="detail-lede">${escapeHtml(getDetailSummary(item))}</p>
      <p class="detail-source-reminder">${escapeHtml(sourceReminder)}</p>
    </div>

    <nav class="incident-jump-nav" aria-label="事件简报导航">
      <a href="#quick-summary">速览</a>
      <a href="#incident-overview">事件简述</a>
      <a href="#incident-analysis">怎么理解</a>
      <a href="#incident-trend">可能变化</a>
      <a href="#incident-next">继续看哪里</a>
      <a href="#incident-source">来源与核验</a>
    </nav>

    <section class="quick-summary" id="quick-summary" aria-label="速览">
      <div>
        <p class="eyebrow">30 秒速览</p>
        <h2>速览</h2>
      </div>
      <ol>
        ${renderQuickSummary(quickSummary)}
      </ol>
    </section>

    <section class="detail-grid simplified-detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        <section class="detail-block incident-block detail-primary-section" id="incident-overview">
          <span>01 · 事件简述</span>
          <h2>事件简述</h2>
          <div class="detail-prose article-prose">
            ${renderDetailProse(getDetailFactArticle(item))}
          </div>
        </section>
        <section class="detail-block incident-block detail-primary-section" id="incident-analysis">
          <span>02 · 怎么理解</span>
          <h2>这件事怎么理解</h2>
          <div class="detail-prose">
            ${renderDetailProse(item.detailWhyRanked)}
          </div>
          ${item.whoShouldCare ? `<p class="detail-so-what"><strong>谁该关心</strong>${escapeHtml(item.whoShouldCare)}</p>` : ""}
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>
        <section class="detail-block incident-block detail-primary-section" id="incident-trend">
          <span>03 · 可能变化</span>
          <h2>可能带来的变化</h2>
          <div class="detail-prose">
            ${renderDetailProse(item.detailTrend)}
          </div>
          <p class="detail-so-what"><strong>对普通读者</strong>${escapeHtml(item.impact)}</p>
        </section>
        <section class="detail-block incident-block detail-primary-section" id="incident-next">
          <span>04 · 继续看哪里</span>
          <h2>接下来要看哪里</h2>
          <p>${escapeHtml(item.nextCheck)}</p>
          <div class="detail-question-list">
            <strong>后续观察点</strong>
            <ul>
              ${followUpQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
            </ul>
          </div>
        </section>
        <section class="detail-block incident-block source-verification-block detail-secondary-context" id="incident-source">
          <span>05 · 来源边界</span>
          <h2>来源与核验边界</h2>
          <dl class="source-verification-list">
            <div>
              <dt>来源</dt>
              <dd>${escapeHtml(sourceName)}</dd>
            </div>
            <div>
              <dt>来源类型</dt>
              <dd>${escapeHtml(sourceType)}</dd>
            </div>
            <div>
              <dt>发布时间</dt>
              <dd><time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time></dd>
            </div>
            <div>
              <dt>核验状态</dt>
              <dd>${escapeHtml(claimStatus)}</dd>
            </div>
            <div>
              <dt>原文依赖</dt>
              <dd>${escapeHtml(originalDependency)}</dd>
            </div>
          </dl>
          <p class="detail-so-what"><strong>来源能支持</strong>${escapeHtml(item.provenance)}</p>
          <p class="detail-so-what"><strong>尚不能证明</strong>${escapeHtml(item.claimBoundary)}</p>
          <p class="detail-so-what"><strong>确认门槛</strong>${escapeHtml(item.evidenceThreshold)}</p>
          <p class="detail-so-what"><strong>降级信号</strong>${escapeHtml(item.counterEvidence)}</p>
          <details class="detail-editor-details">
            <summary>编辑评分与入选理由</summary>
            <p><strong>为什么入选</strong>${escapeHtml(getDetailTopReason(item))}</p>
            ${renderDetailSelectionScore(getDetailEditorScore(item))}
          </details>
          <p class="detail-source-reminder">${escapeHtml(sourceReminder)}</p>
          <a class="button secondary source-button" href="${escapeHtml(originalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${sourceName}（在新窗口打开）`)}">查看原文</a>
        </section>
      </div>
    </section>

    <div class="detail-actions">
      <a class="button primary" href="./#feed">返回新闻流</a>
      <a class="button secondary" href="./all-news.html">查看全部 AI 新闻</a>
      <a class="button secondary" href="./#deep-briefing">查看本期深度简报</a>
    </div>
  `;
}

loadDetail();
