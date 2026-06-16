const detailShell = document.querySelector("#detailShell");

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

async function loadDetail() {
  const newsId = getNewsId();

  if (!newsId) {
    renderError("没有指定新闻条目。", "请从首页新闻流点击进入站内解读。");
    return;
  }

  try {
    const response = await fetch("./data/news.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`News request failed with ${response.status}`);
    }

    const data = await response.json();
    const item = data.items.find((entry) => entry.id === newsId);

    if (!item) {
      renderError("没有找到这条新闻解读。", "它可能已被归档、改名或从当前期次中移除。");
      return;
    }

    renderDetail(item, data);
  } catch (error) {
    console.warn(error);
    renderError("新闻解读暂时无法读取。", "请稍后刷新，或返回首页查看新闻流。", true);
  }
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
  document.title = `${item.title} | AI Watchtower`;
  const followUpQuestions = Array.isArray(item.followUpQuestions) ? item.followUpQuestions : [];

  detailShell.innerHTML = `
    <div class="detail-header">
      <p class="eyebrow">${escapeHtml(item.label)} Explainer</p>
      <p class="detail-date">${escapeHtml(data.edition.date)} · ${escapeHtml(data.edition.archiveLabel)} · ${escapeHtml(item.verificationStatus)}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="detail-lede">${escapeHtml(item.body)}</p>
    </div>

    <section class="detail-grid" aria-label="新闻解读主体">
      <div class="detail-main">
        <section class="detail-block">
          <span>01 · What Happened</span>
          <h2>发生了什么</h2>
          <p>${escapeHtml(item.body)}</p>
        </section>
        <section class="detail-block">
          <span>02 · Trend</span>
          <h2>趋势判断</h2>
          <p>${escapeHtml(item.trend)}</p>
        </section>
        <section class="detail-block">
          <span>03 · Why It Matters</span>
          <h2>为什么值得看</h2>
          <p>${escapeHtml(item.whyRanked)}</p>
          <p class="detail-so-what"><strong>影响</strong>${escapeHtml(item.impact)}</p>
          <p class="detail-so-what"><strong>读者用法</strong>${escapeHtml(item.readerUse)}</p>
        </section>
        <section class="detail-block">
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
        </section>
      </div>

      <aside class="detail-side" aria-label="来源与状态">
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
      <a class="button secondary" href="./#deep-briefing">查看本期深度简报</a>
    </div>
  `;
}

loadDetail();
