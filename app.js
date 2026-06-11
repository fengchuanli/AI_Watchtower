let news = [];
let currentFilter = "all";

const newsGrid = document.querySelector("#newsGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const newsMeta = document.querySelector("#newsMeta");
const briefingLabel = document.querySelector("#briefingLabel");
const briefingHeadline = document.querySelector("#briefingHeadline");
const briefingSummary = document.querySelector("#briefingSummary");
const briefingCta = document.querySelector("#briefingCta");
const briefingWatchPoints = document.querySelector("#briefingWatchPoints");
const subscribeForm = document.querySelector("#subscribeForm");
const subscribeStatus = document.querySelector("#subscribeStatus");
const requiredCardFields = [
  "category",
  "label",
  "title",
  "body",
  "trend",
  "whyRanked",
  "impact",
  "nextCheck",
  "source",
  "sourceUrl",
  "provenance",
  "trustLevel",
  "time",
];

async function loadNews() {
  renderFeedMessage("loading", "正在读取新闻数据...");

  try {
    const response = await fetch("./data/news.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`News request failed with ${response.status}`);
    }

    const data = await response.json();
    validateNewsData(data);
    news = data.items;
    updateTodayBriefing(data.briefing);
    updateNewsMeta(data);
  } catch (error) {
    news = [];
    updateNewsMeta({ statusLabel: "数据未加载", editorNote: "新闻数据暂时无法读取，请稍后刷新。" });
    renderFeedMessage("error", "新闻数据暂时无法读取，请稍后刷新。");
    console.warn(error);
    return;
  }

  renderNews(currentFilter);
}

function validateNewsData(data) {
  if (!Array.isArray(data.items)) {
    throw new Error("News data must include an items array.");
  }

  validateBriefing(data.briefing);

  const invalidItem = data.items.find((item) => requiredCardFields.some((field) => !item[field]));

  if (invalidItem) {
    throw new Error(`News item ${invalidItem.id || "without id"} is missing required display fields.`);
  }

  const itemWithInvalidUrl = data.items.find((item) => !isValidSourceUrl(item.sourceUrl));

  if (itemWithInvalidUrl) {
    throw new Error(`News item ${itemWithInvalidUrl.id || "without id"} has an invalid source URL.`);
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

function updateNewsMeta(data) {
  if (!newsMeta) {
    return;
  }

  const updatedAt = data.updatedAt ? `更新日期 ${data.updatedAt}` : "等待更新";
  newsMeta.textContent = `${data.statusLabel || "数据状态"} · ${updatedAt} · ${data.editorNote || ""}`;
}

function selectFilter(button) {
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

function renderFeedMessage(type, message) {
  newsGrid.innerHTML = `<p class="feed-state ${type}" role="status">${escapeHtml(message)}</p>`;
}

function renderNews(filter = "all") {
  const visibleNews = filter === "all" ? news : news.filter((item) => item.category === filter);

  if (!visibleNews.length) {
    renderFeedMessage("empty", "暂无匹配内容，后续接入真实来源后会自动补充。");
    return;
  }

  newsGrid.innerHTML = visibleNews
    .map(
      (item) => `
        <article class="news-card">
          <span class="category">${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
          <p class="trend-note">${escapeHtml(item.trend)}</p>
          <p class="rank-note"><strong>入选理由</strong>${escapeHtml(item.whyRanked)}</p>
          <p class="impact-note"><strong>影响</strong>${escapeHtml(item.impact)}</p>
          <p class="next-check"><strong>下次核对</strong>${escapeHtml(item.nextCheck)}</p>
          <p class="source-note"><strong>${escapeHtml(item.trustLevel)}</strong>${escapeHtml(item.provenance)}</p>
          <footer>
            <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.source)}</a>
            <time>${escapeHtml(item.time)}</time>
          </footer>
        </article>
      `,
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

if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!subscribeForm.checkValidity()) {
      subscribeForm.reportValidity();
      return;
    }

    const input = subscribeForm.querySelector("input");
    input.value = "";

    if (subscribeStatus) {
      subscribeStatus.textContent = "已收到订阅请求，明天见。";
    }
  });
}

loadNews();
