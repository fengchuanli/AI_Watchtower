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
  const sentences = String(value)
    .trim()
    .match(/[^。！？.!?]+[。！？.!?]?/g);

  if (!sentences || sentences.length <= 1) {
    return [String(value).trim()];
  }

  const paragraphs = [];
  let currentParagraph = "";

  for (const sentence of sentences) {
    const normalizedSentence = sentence.trim();

    if (!normalizedSentence) {
      continue;
    }

    const nextParagraph = currentParagraph
      ? `${currentParagraph}${normalizedSentence}`
      : normalizedSentence;

    if (currentParagraph && nextParagraph.length > 120) {
      paragraphs.push(currentParagraph);
      currentParagraph = normalizedSentence;
    } else {
      currentParagraph = nextParagraph;
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs.length ? paragraphs : [String(value).trim()];
}

function renderDetailProse(value) {
  return splitDetailProse(value)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function getQuickSummary(item) {
  return [
    {
      label: "核心事件",
      body: item.body,
    },
    {
      label: "关键影响",
      body: item.impact,
    },
    {
      label: "继续观察",
      body: item.nextCheck,
    },
  ];
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
  const metrics = getImpactMetrics(item);
  const quickSummary = getQuickSummary(item);
  const overviewCards = getOverviewCards(item);
  const diagramNodes = getDiagramNodes(item);
  const riskCards = getRiskCards(item);

  detailShell.innerHTML = `
    <div class="incident-hero">
      <p class="eyebrow">Incident Briefing · ${escapeHtml(item.label)}</p>
      <p class="detail-date">${escapeHtml(data.edition.date)} · ${escapeHtml(data.edition.archiveLabel)} · ${escapeHtml(item.verificationStatus)}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="detail-lede">${escapeHtml(item.body)}</p>
      <dl class="incident-metrics" aria-label="事件关键指标">
        ${renderMetricList(metrics)}
      </dl>
    </div>

    <nav class="incident-jump-nav" aria-label="事件简报导航">
      <a href="#quick-summary">速览</a>
      <a href="#incident-map">全貌图</a>
      <a href="#incident-overview">事件简述</a>
      <a href="#incident-stakes">这意味着</a>
      <a href="#incident-value">为什么值得看</a>
      <a href="#incident-verification">核对边界</a>
      <a href="#incident-source">来源</a>
    </nav>

    <section class="quick-summary" id="quick-summary" aria-label="速览">
      <div>
        <p class="eyebrow">30-second Summary</p>
        <h2>速览</h2>
      </div>
      <ol>
        ${renderQuickSummary(quickSummary)}
      </ol>
    </section>

    <section class="overview-diagram" id="incident-map" aria-label="新闻全貌图">
      <div class="overview-card-row">
        ${renderOverviewCards(overviewCards)}
      </div>
      <div class="overview-map-shell">
        <div class="overview-map-heading">
          <p class="eyebrow">Auto Overview Diagram</p>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.detailWhyRanked)}</p>
        </div>
        <div class="overview-flow" aria-label="从事件到影响的解读链路">
          ${renderDiagramNodes(diagramNodes)}
        </div>
        <div class="overview-risk-grid" aria-label="风险与核对点">
          ${renderRiskCards(riskCards)}
        </div>
      </div>
    </section>

    <section class="detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        <section class="detail-block incident-block" id="incident-overview">
          <span>01 · What Happened</span>
          <h2>事件简述</h2>
          <div class="detail-prose">
            ${renderDetailProse(item.detailBody)}
          </div>
        </section>
        <section class="detail-block incident-block" id="incident-stakes">
          <span>02 · Trend</span>
          <h2>这意味着</h2>
          <div class="detail-prose">
            ${renderDetailProse(item.detailTrend)}
          </div>
        </section>
        <section class="detail-block incident-block" id="incident-value">
          <span>03 · Why It Matters</span>
          <h2>为什么值得看</h2>
          <div class="detail-prose">
            ${renderDetailProse(item.detailWhyRanked)}
          </div>
          <p class="detail-so-what"><strong>影响</strong>${escapeHtml(item.impact)}</p>
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>
        <section class="detail-block incident-block" id="incident-verification">
          <span>04 · Verification</span>
          <h2>核对边界</h2>
          <p>${escapeHtml(item.nextCheck)}</p>
          <div class="detail-question-list">
            <strong>编辑追问</strong>
            <ul>
              ${followUpQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
            </ul>
          </div>
          <p class="detail-so-what"><strong>确认门槛</strong>${escapeHtml(item.evidenceThreshold)}</p>
          <p class="detail-so-what"><strong>不能证明</strong>${escapeHtml(item.claimBoundary)}</p>
          <p class="detail-so-what"><strong>降级信号</strong>${escapeHtml(item.counterEvidence)}</p>
        </section>
      </div>

      <aside class="detail-side" id="incident-source" aria-label="来源与状态">
        <section>
          <h2>来源可信度</h2>
          <dl>
            <div>
              <dt>来源层级</dt>
              <dd>${escapeHtml(item.trustLevel)}</dd>
            </div>
            <div>
              <dt>来源用途</dt>
              <dd>${escapeHtml(item.sourceRole)}</dd>
            </div>
            <div>
              <dt>核验状态</dt>
              <dd>${escapeHtml(item.verificationStatus)}</dd>
            </div>
            <div>
              <dt>发布时间</dt>
              <dd><time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(item.time)}</time></dd>
            </div>
          </dl>
        </section>
        <section>
          <h2>来源说明</h2>
          <p>${escapeHtml(item.provenance)}</p>
        </section>
        <section>
          <h2>原始来源</h2>
          <p>原始链接仅用于核对，不是本站阅读主入口。</p>
          <a class="text-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${item.source}（在新窗口打开）`)}">${escapeHtml(item.source)}</a>
        </section>
      </aside>
    </section>

    <div class="detail-actions">
      <a class="button primary" href="./#feed">返回新闻流</a>
      <a class="button secondary" href="./all-news.html">查看全部情报</a>
      <a class="button secondary" href="./#deep-briefing">查看本期深度简报</a>
    </div>
  `;
}

loadDetail();
