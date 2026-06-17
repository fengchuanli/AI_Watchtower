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

function getIncidentTimeline(item, data) {
  return [
    {
      label: item.time,
      title: "原始信号出现",
      body: item.body,
    },
    {
      label: data.edition.archiveLabel,
      title: "进入 Watchtower 研判",
      body: item.detailWhyRanked,
    },
    {
      label: "Next",
      title: "下一步核对",
      body: item.nextCheck,
    },
  ];
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

function renderIncidentTimeline(timeline) {
  return timeline
    .map(
      (event) => `
        <article>
          <span>${escapeHtml(event.label)}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.body)}</p>
        </article>
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
  const timeline = getIncidentTimeline(item, data);

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
      <a href="#incident-overview">事件全貌</a>
      <a href="#incident-stakes">为什么重要</a>
      <a href="#incident-timeline">时间线</a>
      <a href="#incident-verification">事实边界</a>
      <a href="#incident-source">来源</a>
    </nav>

    <section class="detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        <section class="detail-block incident-block" id="incident-overview">
          <span>01 · What Happened</span>
          <h2>发生了什么</h2>
          <p>${escapeHtml(item.detailBody)}</p>
        </section>
        <section class="detail-block incident-block" id="incident-stakes">
          <span>02 · Trend</span>
          <h2>趋势判断</h2>
          <p>${escapeHtml(item.detailTrend)}</p>
        </section>
        <section class="detail-block incident-block">
          <span>03 · Why It Matters</span>
          <h2>为什么值得看</h2>
          <p>${escapeHtml(item.detailWhyRanked)}</p>
          <p class="detail-so-what"><strong>影响</strong>${escapeHtml(item.impact)}</p>
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>
        <section class="incident-timeline" id="incident-timeline" aria-label="事件时间线">
          ${renderIncidentTimeline(timeline)}
        </section>
        <section class="detail-block incident-block" id="incident-verification">
          <span>04 · Verification</span>
          <h2>还需要核对什么</h2>
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
          <h2>怎么理解这个来源</h2>
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
