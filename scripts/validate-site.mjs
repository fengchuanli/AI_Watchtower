import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const html = readFileSync("index.html", "utf8");
const detailHtml = readFileSync("news-detail.html", "utf8");
const allNewsHtml = readFileSync("all-news.html", "utf8");
const tagsHtml = readFileSync("tags.html", "utf8");
const archiveHtml = readFileSync("archive.html", "utf8");
const notFoundHtml = readFileSync("404.html", "utf8");
const appJs = readFileSync("app.js", "utf8");
const detailJs = readFileSync("news-detail.js", "utf8");
const allNewsJs = readFileSync("all-news.js", "utf8");
const tagsJs = readFileSync("tags.js", "utf8");
const archiveJs = readFileSync("archive.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
const validateDataJs = readFileSync("scripts/validate-data.mjs", "utf8");
const duplicateCandidateReportJs = readFileSync("scripts/report-duplicate-candidates.mjs", "utf8");
const newsDataFormat = readFileSync("docs/news-data-format.md", "utf8");
const sourcePolicy = readFileSync("docs/source-policy.md", "utf8");
const copyrightSafety = readFileSync("docs/copyright-safety.md", "utf8");
const candidateSourceChecklist = readFileSync("docs/candidate-source-checklist.md", "utf8");
const candidateIntakeFormat = readFileSync("docs/candidate-intake-format.md", "utf8");
const candidateHoldRejectReasons = readFileSync("docs/candidate-hold-reject-reasons.md", "utf8");
const candidatePriorityRubric = readFileSync("docs/candidate-priority-rubric.md", "utf8");
const originalSourceReplacementGuide = readFileSync("docs/original-source-replacement-guide.md", "utf8");
const candidateToNewsHandoff = readFileSync("docs/candidate-to-news-handoff.md", "utf8");
const editorialChecklist = readFileSync("docs/editorial-checklist.md", "utf8");
const editorialValidatorLimits = readFileSync("docs/editorial-validator-limits.md", "utf8");
const optimizationPlan = readFileSync("docs/optimization-plan.md", "utf8");
const productPrinciples = readFileSync("docs/product-principles.md", "utf8");
const localPreviewQa = readFileSync("docs/local-preview-qa.md", "utf8");
const githubPagesReadiness = readFileSync("docs/github-pages-readiness.md", "utf8");
const monthlyOptimizationSummary = readFileSync("docs/monthly-optimization-summary.md", "utf8");
const optimizationDecisionIndex = readFileSync("docs/optimization-decision-index.md", "utf8");
const contributing = readFileSync("docs/contributing.md", "utf8");
const readme = readFileSync("README.md", "utf8");
const errors = [];
const repositoryRoot = process.cwd();
const htmlPages = new Map([
  ["index.html", html],
  ["news-detail.html", detailHtml],
  ["all-news.html", allNewsHtml],
  ["tags.html", tagsHtml],
  ["archive.html", archiveHtml],
  ["404.html", notFoundHtml],
]);

const requiredMetaTags = [
  ["name", "description"],
  ["name", "application-name"],
  ["name", "theme-color"],
  ["property", "og:type"],
  ["property", "og:locale"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:image"],
  ["property", "og:image:alt"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
  ["name", "twitter:image:alt"],
];

function hasMetaTag(attribute, value) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}="${value}")[^>]*>`, "s");
  return pattern.test(html);
}

for (const [attribute, value] of requiredMetaTags) {
  if (!hasMetaTag(attribute, value)) {
    errors.push(`index.html is missing required metadata: ${attribute}="${value}"`);
  }
}

function getMetaContent(attribute, value) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}="${value}")(?=[^>]*\\bcontent="([^"]+)")[^>]*>`,
    "s",
  );
  const match = html.match(pattern);

  return match ? match[1].trim() : "";
}

const socialImage = getMetaContent("property", "og:image");
const twitterImage = getMetaContent("name", "twitter:image");
const socialImageAlt = getMetaContent("property", "og:image:alt");
const twitterImageAlt = getMetaContent("name", "twitter:image:alt");

if (socialImage !== "./assets/ai-intel-hero.jpg" || twitterImage !== socialImage) {
  errors.push("Social preview image metadata must use the optimized hero JPEG consistently.");
}

if (
  !socialImageAlt ||
  socialImageAlt !== twitterImageAlt ||
  !/AI Watchtower/.test(socialImageAlt) ||
  !/预览图/.test(socialImageAlt)
) {
  errors.push("Social preview image metadata must include matching, descriptive alt text.");
}

function validateSkipLink(fileName, pageHtml) {
  const mainMatch = pageHtml.match(/<main\b(?=[^>]*\bid="([^"]+)")[^>]*>/);

  if (!mainMatch) {
    return;
  }

  const mainId = mainMatch[1];
  const skipLinkMatch = pageHtml.match(
    /<a\b(?=[^>]*\bclass="skip-link")(?=[^>]*\bhref="#([^"]+)")[^>]*>/,
  );

  if (!skipLinkMatch) {
    errors.push(`${fileName} is missing a skip link to the main content.`);
    return;
  }

  if (skipLinkMatch[1] !== mainId) {
    errors.push(`${fileName} skip link target #${skipLinkMatch[1]} does not match main #${mainId}.`);
  }
}

for (const [fileName, pageHtml] of htmlPages) {
  validateSkipLink(fileName, pageHtml);
}

const jsonLdMatch = html.match(
  /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
);

if (!jsonLdMatch) {
  errors.push("index.html is missing JSON-LD metadata.");
} else {
  try {
    const jsonLd = JSON.parse(jsonLdMatch[1]);

    if (jsonLd["@type"] !== "WebSite") {
      errors.push("JSON-LD @type must be WebSite.");
    }

    if (jsonLd.name !== "AI Watchtower") {
      errors.push("JSON-LD name must be AI Watchtower.");
    }

    if (jsonLd.inLanguage !== "zh-CN") {
      errors.push("JSON-LD inLanguage must be zh-CN.");
    }
  } catch (error) {
    errors.push(`JSON-LD metadata is not valid JSON: ${error.message}`);
  }
}

function getPageIds(pageHtml) {
  return new Set(Array.from(pageHtml.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
}

function getHtmlTarget(refPath, currentFile) {
  if (!refPath || refPath === ".") {
    return "index.html";
  }

  const normalizedPath = refPath.replace(/^\.\//, "");

  if (normalizedPath.endsWith("/")) {
    return `${normalizedPath}index.html`;
  }

  if (normalizedPath.endsWith(".html")) {
    return normalizedPath;
  }

  if (normalizedPath === currentFile) {
    return currentFile;
  }

  return null;
}

function validateStaticPageReferences(fileName, pageHtml) {
  const pageRefs = Array.from(pageHtml.matchAll(/\b(?:href|src)="([^"]+)"/g), (match) => match[1]);
  const pageIds = getPageIds(pageHtml);
  const localRefs = new Set();

  for (const pageRef of pageRefs) {
    if (pageRef.startsWith("#")) {
      const targetId = pageRef.slice(1);

      if (targetId && !pageIds.has(targetId)) {
        errors.push(`${fileName} links to a missing same-page target: ${pageRef}`);
      }

      continue;
    }

    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(pageRef)) {
      continue;
    }

    if (pageRef.startsWith("/")) {
      errors.push(`${fileName} has a root-absolute reference that breaks GitHub project sites: ${pageRef}`);
      continue;
    }

    const [refWithoutFragment, fragment] = pageRef.split("#", 2);
    const localRef = refWithoutFragment.split("?", 1)[0];

    if (!localRef) {
      continue;
    }

    localRefs.add(pageRef);
    const resolvedRef = resolve(dirname(resolve(repositoryRoot, fileName)), localRef);
    const relativeRef = relative(repositoryRoot, resolvedRef);

    if (relativeRef === ".." || relativeRef.startsWith(`..${sep}`) || isAbsolute(relativeRef)) {
      errors.push(`${fileName} has a local reference that escapes the repository root: ${pageRef}`);
      continue;
    }

    if (!existsSync(resolvedRef)) {
      errors.push(`${fileName} references a local path that does not exist: ${pageRef}`);
      continue;
    }

    const htmlTarget = getHtmlTarget(relativeRef, fileName);

    if (fragment && htmlTarget && htmlPages.has(htmlTarget)) {
      const targetIds = getPageIds(htmlPages.get(htmlTarget));

      if (!targetIds.has(fragment)) {
        errors.push(`${fileName} links to a missing target in ${htmlTarget}: #${fragment}`);
      }
    }
  }

  return localRefs.size;
}

const localReferenceCount = Array.from(htmlPages).reduce(
  (count, [fileName, pageHtml]) => count + validateStaticPageReferences(fileName, pageHtml),
  0,
);

const heroImageMatch = html.match(
  /<img\b(?=[^>]*\bclass="hero-media")(?=[^>]*\bsrc="\.\/assets\/ai-intel-hero\.jpg")(?=[^>]*\bwidth="1672")(?=[^>]*\bheight="941")(?=[^>]*\bdecoding="async")(?=[^>]*\bfetchpriority="high")[^>]*>/s,
);

if (!heroImageMatch) {
  errors.push("Hero image must use the optimized JPEG with intrinsic dimensions and priority hints.");
}

if (/\.\/assets\/ai-intel-hero\.png/.test(html)) {
  errors.push("Homepage must not load the unoptimized PNG hero asset.");
}

if (/fonts\.(?:googleapis|gstatic)\.com/.test(html)) {
  errors.push("Homepage must not depend on third-party Google Fonts requests.");
}

if (/<a\b[^>]*\bhref="#"/s.test(html)) {
  errors.push('index.html must not include placeholder links with href="#".');
}

const newsGridMatch = html.match(
  /<div\b(?=[^>]*\bid="newsGrid")[^>]*>[\s\S]*?<\/div>/,
);

if (!newsGridMatch) {
  errors.push("index.html is missing the news feed container.");
} else if (
  !/<noscript>[\s\S]*?<a\b(?=[^>]*\bhref="\.\/all-news\.html")[^>]*>[\s\S]*?<\/noscript>/.test(
    newsGridMatch[0],
  )
) {
  errors.push("News feed must include a no-JavaScript fallback linking to all-news.html.");
}

if (/<form\b(?=[^>]*\bid="subscribeForm")/s.test(html)) {
  errors.push("Static site must not present a subscription form without a working submission endpoint.");
}

const updatesSectionMatch = html.match(
  /<section\b(?=[^>]*\bclass="subscribe")(?=[^>]*\bid="updates")[^>]*>[\s\S]*?<\/section>/,
);

if (!updatesSectionMatch) {
  errors.push("index.html is missing the public update access section.");
} else {
  const updatesSection = updatesSectionMatch[0];

  if (!/不会收集或保存邮箱/.test(updatesSection)) {
    errors.push("Update access section must disclose that the static site does not collect email addresses.");
  }

  if (!/<a\b(?=[^>]*\bhref="\.\/data\/news\.json")[^>]*>/.test(updatesSection)) {
    errors.push("Update access section must link to the current structured news data.");
  }

  if (!/<a\b(?=[^>]*\bhref="\.\/archive\.html")[^>]*>/.test(updatesSection)) {
    errors.push("Update access section must link to the edition archive.");
  }

  if (!/<a\b(?=[^>]*\bhref="\.\/all-news\.html")[^>]*>/.test(updatesSection)) {
    errors.push("Update access section must link to the all-news intelligence history.");
  }

  if (!/<a\b(?=[^>]*\bhref="\.\/tags\.html")[^>]*>/.test(updatesSection)) {
    errors.push("Update access section must link to the company tag aggregation page.");
  }

  if (
    !/<a\b(?=[^>]*\bhref="https:\/\/github\.com\/fengchuanli\/AI_Watchtower\/commits\/main\/")(?=[^>]*\btarget="_blank")(?=[^>]*\brel="noopener noreferrer")[^>]*>/s.test(
      updatesSection,
    )
  ) {
    errors.push("Update access section must link safely to the public main branch history.");
  }
}

if (!/function getDetailUrl\(item\)/.test(appJs) || !/const detailUrl = getDetailUrl\(item\);/.test(appJs)) {
  errors.push("Homepage news cards must link to the in-site news detail page.");
}

if (!/latestCapture\.textContent = `最新抓取：/.test(appJs)) {
  errors.push("Homepage must clearly label the latest captured news batch.");
}

if (
  !/id="top3"/.test(html) ||
  !/function updateTopStories/.test(appJs) ||
  !/function getItemSummary/.test(appJs) ||
  !/function getWhyItMatters/.test(appJs) ||
  !/class="top-summary"/.test(appJs) ||
  !/class="top-why"/.test(appJs) ||
  !/class="top-editor-details"/.test(appJs) ||
  !/编辑判断/.test(appJs) ||
  !/\.top-editor-details/.test(styles)
) {
  errors.push("Homepage TOP3 must show news content first and move editorial judgment into an expandable area.");
}

if (
  !/class="top3-followup"/.test(html) ||
  !/href="\.\/all-news\.html"[^>]*aria-label="打开全部 AI 新闻题目列表"[^>]*>查看全部 AI 新闻 →<\/a>/.test(html) ||
  !/\.top3-followup/.test(styles)
) {
  errors.push("Homepage must place a prominent all-news entry directly after Today TOP3.");
}

if (
  /So What\?/.test(appJs) ||
  !/为什么重要/.test(appJs) ||
  !/validateChineseEditorialCopy/.test(validateDataJs) ||
  !/Intelligence Briefing/.test(validateDataJs) ||
  !/FinOps/.test(validateDataJs)
) {
  errors.push("Homepage deep briefing must use Chinese-first editorial labels and validate common English drift.");
}

if (
  !/id="heroSignalCount">--<\/dt>/.test(html) ||
  !/id="heroSourceCount">--<\/dt>/.test(html) ||
  !/id="heroChecklistMode">逐条<\/dt>/.test(html) ||
  !/function updateHeroStats\(data = \{\}\)/.test(appJs) ||
  !/heroSignalCount\.textContent = Array\.isArray\(data\.items\) \? String\(data\.items\.length\) : "--";/.test(
    appJs,
  ) ||
  !/Number\.isInteger\(data\.sourceCount\) && data\.sourceCount > 0 \? String\(data\.sourceCount\) : "--";/.test(
    appJs,
  ) ||
  !/updateHeroStats\(data\);/.test(appJs) ||
  !/updateHeroStats\(\);/.test(appJs)
) {
  errors.push("Hero stats must render from validated feed data instead of hard-coded counts.");
}

if (!/<script src="\.\/all-news\.js"><\/script>/.test(allNewsHtml)) {
  errors.push("all-news.html must load the history renderer.");
}

if (!/<script src="\.\/archive\.js"><\/script>/.test(archiveHtml)) {
  errors.push("archive.html must load the edition archive renderer.");
}

if (!/<script src="\.\/tags\.js"><\/script>/.test(tagsHtml)) {
  errors.push("tags.html must load the company tag renderer.");
}

if (!/OpenAI/.test(tagsJs) || !/Anthropic/.test(tagsJs) || !/Google/.test(tagsJs) || !/Meta/.test(tagsJs)) {
  errors.push("Company tag aggregation must include OpenAI, Anthropic, Google, and Meta.");
}

if (
  !/<div class="tag-context" id="tagContext" aria-live="polite"><\/div>/.test(tagsHtml) ||
  !/const tagContext = document\.querySelector\("#tagContext"\);/.test(tagsJs) ||
  !/function summarizeTagItems\(items\) \{/.test(tagsJs) ||
  !/function renderTagContext\(tag, items\) \{/.test(tagsJs) ||
  !/公司观察重点/.test(tagsJs) ||
  !/最新覆盖/.test(tagsJs) ||
  !/最新信号/.test(tagsJs) ||
  !/最后出现/.test(tagsJs) ||
  !/来源边界/.test(tagsJs) ||
  !/sourceCaveat/.test(tagsJs) ||
  !/latestItem\.claimBoundary \|\| latestItem\.provenance \|\| latestItem\.nextCheck/.test(tagsJs) ||
  !/class="tag-signal-list"/.test(tagsJs) ||
  !/class="tag-source-note"/.test(tagsJs) ||
  !/Company tag pages derive OpenAI, Anthropic, Google, and Meta views/.test(newsDataFormat) ||
  !/latest matched signal/.test(newsDataFormat) ||
  !/last-seen edition date/.test(newsDataFormat) ||
  !/source caveat/.test(newsDataFormat) ||
  !/\.tag-context\s*\{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/.test(styles) ||
  !/\.tag-signal-list\s*\{[\s\S]*gap:\s*10px;/.test(styles) ||
  !/\.tag-source-note\s*\{[\s\S]*border-top:\s*1px solid var\(--line\);/.test(styles)
) {
  errors.push("Company tag pages must render focus, latest signal, last-seen date, and source-boundary context.");
}

if (
  !/fetch\("\.\/data\/news-history\.json"/.test(allNewsJs) ||
  !/const detailUrl = `\.\/news-detail\.html\?id=\$\{encodeURIComponent\(item\.id\)\}&edition=\$\{encodeURIComponent\(item\.editionId\)\}`;/.test(
    allNewsJs,
  )
) {
  errors.push("All-news page must read news-history.json and link flat title rows to in-site detail pages with edition IDs.");
}

if (
  !/id="currentArchiveMeta"/.test(archiveHtml) ||
  !/id="currentEditionGrid"/.test(archiveHtml) ||
  !/id="archiveEditionGrid"/.test(archiveHtml) ||
  !/href="\.\/data\/news\.json"[\s\S]*href="\.\/all-news\.html"/.test(archiveHtml) ||
  !/fetchJson\("\.\/data\/news\.json"\)/.test(archiveJs) ||
  !/fetchJson\("\.\/data\/news-history\.json"\)/.test(archiveJs) ||
  !/function getEditionTimeLabel/.test(archiveJs) ||
  !/早间版/.test(archiveJs) ||
  !/晚间版/.test(archiveJs) ||
  !/当前首页批次/.test(archiveJs) ||
  !/已归档批次/.test(archiveJs) ||
  !/function renderEditionCard/.test(archiveJs) ||
  !/class="archive-status \$\{escapeHtml\(status\.tone\)\}"/.test(archiveJs) ||
  !/期次归档暂时无法生成动态标签/.test(archiveJs) ||
  !/\.archive-edition-grid/.test(styles) ||
  !/\.library-grid \.archive-status\.current/.test(styles) ||
  !/\.library-grid \.archive-status\.archived/.test(styles)
) {
  errors.push("Archive page must render data-driven morning/evening edition labels and current-vs-archived status.");
}

if (
  !/aria-label="AI Watchtower 主要栏目"/.test(html) ||
  !/aria-label="本期 AI 情报概况"/.test(html) ||
  !/aria-label="按主题筛选更多新闻流"/.test(html) ||
  !/aria-label="查看今日 TOP3 之外的更多新闻流"/.test(html) ||
  !/aria-label="打开全部 AI 新闻题目列表"/.test(html) ||
  !/aria-label="全部题目列表相关页面"/.test(allNewsHtml) ||
  !/AI Watchtower 全部 AI 新闻列表/.test(allNewsHtml) ||
  !/aria-label="打开原始历史 AI 新闻 JSON 数据"/.test(allNewsHtml) ||
  !/aria-label="按新闻发布时间排序历史 AI 新闻"/.test(allNewsHtml) ||
  !/aria-label="历史 AI 新闻题目列表"/.test(allNewsHtml) ||
  !/查看 \$\{item\.archiveLabel\} 的站内解读/.test(allNewsJs)
) {
  errors.push("Homepage and all-news page must use Chinese, context-rich accessible labels for navigation, filters, and history links.");
}

if (
  !/最新新闻流/.test(html) ||
  !/公司连续观察/.test(html) ||
  !/全部题目列表/.test(html) ||
  !/期次归档状态/.test(html) ||
  !/aria-label="全部题目列表相关页面"/.test(allNewsHtml) ||
  !/本页适合快速扫标题/.test(allNewsHtml) ||
  !/href="\.\/tags\.html"[\s\S]*公司连续观察/.test(allNewsHtml) ||
  !/aria-label="期次归档相关页面"/.test(archiveHtml) ||
  !/href="\.\/all-news\.html"[\s\S]*全部题目列表/.test(archiveHtml) ||
  !/想按题目快速回看/.test(archiveHtml) ||
  !/aria-label="公司连续观察相关页面"/.test(tagsHtml) ||
  !/本页适合看同一公司的连续信号/.test(tagsHtml) ||
  !/aria-label="站内解读相关页面"/.test(detailHtml) ||
  !/返回最新新闻流/.test(detailHtml) ||
  !/href="\.\/tags\.html"[\s\S]*公司连续观察/.test(detailHtml)
) {
  errors.push("Cross-page navigation copy must explain each reader path: latest feed, title list, company continuity, detail briefing, and edition archive.");
}

if (
  !/<meta name="description" content="AI Watchtower 全部 AI 新闻列表，按时间顺序整理进入本站的新闻线索，点击标题查看中文解读与原始来源。"/.test(allNewsHtml) ||
  !/<meta name="application-name" content="AI Watchtower" \/>/.test(allNewsHtml) ||
  !/<meta property="og:title" content="全部 AI 新闻 \| AI Watchtower" \/>/.test(allNewsHtml) ||
  !/<meta\s+property="og:description"\s+content="按时间顺序整理进入 AI Watchtower 的 AI 新闻线索。点击标题查看本站解读与原始来源。"\s+\/>/s.test(
    allNewsHtml,
  ) ||
  !/<meta name="twitter:card" content="summary" \/>/.test(allNewsHtml) ||
  !/<meta name="twitter:title" content="全部 AI 新闻 \| AI Watchtower" \/>/.test(allNewsHtml) ||
  !/<meta\s+name="twitter:description"\s+content="按时间顺序整理进入 AI Watchtower 的 AI 新闻线索。点击标题查看本站解读与原始来源。"\s+\/>/s.test(
    allNewsHtml,
  )
) {
  errors.push("All-news page must provide Chinese sharing metadata that explains the AI news reading path.");
}

if (
  !/const detailLabel = escapeHtml\(`查看站内解读：\$\{item\.title\}`\);/.test(appJs) ||
  !/<a class="card-detail-link" href="\$\{detailUrl\}" aria-label="\$\{detailLabel\}">/.test(appJs) ||
  !/<a class="reference-link" href="\$\{detailUrl\}" aria-label="\$\{detailLabel\}">查看详情 →<\/a>/.test(appJs)
) {
  errors.push("Homepage detail links must expose item-specific accessible labels.");
}

if (/class="reference-link" href="\$\{escapeHtml\(item\.sourceUrl\)\}"/.test(appJs)) {
  errors.push("Homepage news cards must not link directly to original sources.");
}

if (!/<script src="\.\/news-detail\.js"><\/script>/.test(detailHtml)) {
  errors.push("news-detail.html must load the detail renderer.");
}

if (!/href="\$\{escapeHtml\(originalUrl\)\}" target="_blank" rel="noopener noreferrer"/.test(detailJs)) {
  errors.push("News detail page must keep original source links safe and secondary.");
}

if (
  !/const requiredDetailFields = \[[\s\S]*"counterEvidence"[\s\S]*"time"[\s\S]*\];/.test(detailJs) ||
  !/const incidentBriefingSections = \[[\s\S]*"detailBody"[\s\S]*"verificationStatus"[\s\S]*\];/.test(detailJs) ||
  !/"detailWhyRanked"/.test(detailJs) ||
  !/validateDetailFeed\(currentFeed\);/.test(detailJs) ||
  !/function validateDetailItem\(item\) \{[\s\S]*requiredDetailFields\.find/.test(detailJs) ||
  !/missingBriefingSection/.test(detailJs) ||
  !/validateDetailItem\(item\);\s*document\.title/.test(detailJs)
) {
  errors.push("News detail page must validate required display fields and incident-briefing sections before rendering.");
}

if (
  !/Incident Briefing ·/.test(detailJs) ||
  !/incident-jump-nav/.test(detailJs) ||
  !/quick-summary/.test(detailJs) ||
  !/function getQuickSummary/.test(detailJs) ||
  !/事件简述/.test(detailJs) ||
  !/这件事怎么理解/.test(detailJs) ||
  !/可能带来的变化/.test(detailJs) ||
  !/接下来要看哪里/.test(detailJs) ||
  !/来源与核验边界/.test(detailJs) ||
  !/查看原文/.test(detailJs) ||
  !/本站只做中文解读，完整事实/.test(detailJs)
) {
  errors.push("News detail page must render a simplified reader-first structure with source boundaries at the end.");
}
if (/<span>\$\{escapeHtml\(node\.label\)\}<\/span>/.test(detailJs)) {
  errors.push("News detail overview diagram must not render redundant small text labels inside each node.");
}

if (
  !/function splitDetailProse/.test(detailJs) ||
  !/function renderDetailProse/.test(detailJs) ||
  !/function getDetailFactArticle/.test(detailJs) ||
  !/class="detail-prose article-prose"/.test(detailJs) ||
  !/renderDetailProse\(getDetailFactArticle\(item\)\)/.test(detailJs) ||
  !/renderDetailProse\(item\.detailTrend\)/.test(detailJs) ||
  !/renderDetailProse\(item\.detailWhyRanked\)/.test(detailJs) ||
  !/\.detail-prose\s*\{[^}]*display:\s*grid;[^}]*gap:\s*12px;/s.test(styles)
) {
  errors.push("News detail narrative sections must split long prose into readable chunks without truncating the fact article.");
}
if (
  !/class="feed-expand"/.test(appJs) ||
  !/feed-extra/.test(appJs) ||
  !/getItemSummary\(item\)/.test(appJs) ||
  !/查看详情 →/.test(appJs) ||
  !/function renderFeedMetaDetails/.test(appJs) ||
  !/\.feed-meta-details/.test(styles)
) {
  errors.push("Homepage non-TOP3 news cards and metadata must stay compact behind expand/collapse controls.");
}

if (
  !/function validateSourceConcentration\(concentration, items = \[\]\)/.test(appJs) ||
  !/validateSourceConcentration\(edition\.sourceConcentration, items\);/.test(appJs) ||
  !/renderSourceRisk\(data\.edition\?\.sourceRisk, data\.edition\?\.sourceConcentration\)/.test(appJs) ||
  !/function validateSourceConcentration\(concentration, items, context\)/.test(validateDataJs) ||
  !/sourceConcentration\.share must be written as dominant count over current item count/.test(validateDataJs) ||
  !/sourceConcentration/.test(newsDataFormat) ||
  !/same feed or owner/.test(newsDataFormat)
) {
  errors.push("Current editions must validate and render repeated source-owner concentration separately from source-family risk.");
}

if (
  !/Candidate Source Checklist/.test(candidateSourceChecklist) ||
  !/Candidate Identity/.test(candidateSourceChecklist) ||
  !/Source Role/.test(candidateSourceChecklist) ||
  !/Minimum Evidence/.test(candidateSourceChecklist) ||
  !/Copyright And Paywall Safety/.test(candidateSourceChecklist) ||
  !/Duplicate And Concentration Checks/.test(candidateSourceChecklist) ||
  !/Drafting Handoff/.test(candidateSourceChecklist) ||
  !/paywall, login-wall, private channel/.test(candidateSourceChecklist) ||
  !/sourceConcentration/.test(candidateSourceChecklist) ||
  !/docs\/candidate-source-checklist\.md/.test(sourcePolicy) ||
  !/candidate-source-checklist\.md/.test(readme) ||
  !/candidate-source-checklist\.md/.test(contributing) ||
  !/candidate-source-checklist\.md/.test(optimizationDecisionIndex) ||
  !/candidate-source-checklist\.md/.test(newsDataFormat) ||
  !/candidate-source-checklist\.md/.test(copyrightSafety) ||
  !/candidate-hold-reject-reasons\.md/.test(candidateSourceChecklist)
) {
  errors.push("Semi-automated gathering must keep a maintained candidate-source checklist linked from source, contributor, data, copyright, and decision docs.");
}

if (
  !/Candidate Intake Format/.test(candidateIntakeFormat) ||
  !/candidateUrl/.test(candidateIntakeFormat) ||
  !/sourceBackedFact/.test(candidateIntakeFormat) ||
  !/aiRelevance/.test(candidateIntakeFormat) ||
  !/proofBoundary/.test(candidateIntakeFormat) ||
  !/nextIndependentCheck/.test(candidateIntakeFormat) ||
  !/duplicateStatus/.test(candidateIntakeFormat) ||
  !/copyrightPosture/.test(candidateIntakeFormat) ||
  !/draftingDecision/.test(candidateIntakeFormat) ||
  !/`draft`[\s\S]*`hold`[\s\S]*`reject`/.test(candidateIntakeFormat) ||
  !/Do not paste source paragraphs/.test(candidateIntakeFormat) ||
  !/candidate-hold-reject-reasons\.md/.test(candidateIntakeFormat) ||
  !/candidate-intake-format\.md/.test(candidateSourceChecklist) ||
  !/candidate-intake-format\.md/.test(readme) ||
  !/sourceBackedFact/.test(candidateSourceChecklist) ||
  !/nextIndependentCheck/.test(candidateSourceChecklist)
) {
  errors.push("Candidate gathering must define a lightweight intake record before drafting news copy.");
}

if (
  !/Candidate Hold And Reject Reasons/.test(candidateHoldRejectReasons) ||
  !/Hold Reasons/.test(candidateHoldRejectReasons) ||
  !/Reject Reasons/.test(candidateHoldRejectReasons) ||
  !/hold-original-source-needed/.test(candidateHoldRejectReasons) ||
  !/hold-source-role-unclear/.test(candidateHoldRejectReasons) ||
  !/hold-duplicate-review/.test(candidateHoldRejectReasons) ||
  !/hold-date-or-freshness-unclear/.test(candidateHoldRejectReasons) ||
  !/hold-proof-boundary-missing/.test(candidateHoldRejectReasons) ||
  !/hold-ai-relevance-weak/.test(candidateHoldRejectReasons) ||
  !/reject-paywall-body-dependent/.test(candidateHoldRejectReasons) ||
  !/reject-repeated-source-fact/.test(candidateHoldRejectReasons) ||
  !/reject-stale-no-current-hook/.test(candidateHoldRejectReasons) ||
  !/reject-copyright-substitute-risk/.test(candidateHoldRejectReasons) ||
  !/decisionReason/.test(candidateHoldRejectReasons) ||
  !/candidate-hold-reject-reasons\.md/.test(candidateIntakeFormat) ||
  !/candidate-hold-reject-reasons\.md/.test(candidateSourceChecklist) ||
  !/candidate-hold-reject-reasons\.md/.test(readme) ||
  !/Day 2[\s\S]*candidate-hold-reject-reasons\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must use a shared hold/reject reason vocabulary for stale, duplicated, paywalled, unclear-role, weak-relevance, and missing-boundary candidates.");
}

if (
  !/Candidate Priority Rubric/.test(candidatePriorityRubric) ||
  !/Reader utility/.test(candidatePriorityRubric) ||
  !/Evidence strength/.test(candidatePriorityRubric) ||
  !/Novelty/.test(candidatePriorityRubric) ||
  !/Source diversity/.test(candidatePriorityRubric) ||
  !/Copyright safety/.test(candidatePriorityRubric) ||
  !/priorityScore/.test(candidatePriorityRubric) ||
  !/priorityDecision/.test(candidatePriorityRubric) ||
  !/Batch Mix Check/.test(candidatePriorityRubric) ||
  !/candidate-priority-rubric\.md/.test(candidateIntakeFormat) ||
  !/candidate-priority-rubric\.md/.test(candidateSourceChecklist) ||
  !/candidate-priority-rubric\.md/.test(readme) ||
  !/Day 1[\s\S]*candidate-priority-rubric\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must include a priority rubric for reader utility, evidence strength, novelty, source diversity, and copyright safety.");
}

if (
  !/Candidate To News Handoff Checklist/.test(candidateToNewsHandoff) ||
  !/Pre-Draft Gate/.test(candidateToNewsHandoff) ||
  !/Field Mapping/.test(candidateToNewsHandoff) ||
  !/Intake field/.test(candidateToNewsHandoff) ||
  !/`data\/news\.json` field/.test(candidateToNewsHandoff) ||
  !/sourceBackedFact/.test(candidateToNewsHandoff) ||
  !/aiRelevance/.test(candidateToNewsHandoff) ||
  !/proofBoundary/.test(candidateToNewsHandoff) ||
  !/nextIndependentCheck/.test(candidateToNewsHandoff) ||
  !/duplicateStatus/.test(candidateToNewsHandoff) ||
  !/copyrightPosture/.test(candidateToNewsHandoff) ||
  !/originalDependency/.test(candidateToNewsHandoff) ||
  !/source article text/.test(candidateToNewsHandoff) ||
  !/minimum source fact/.test(candidateToNewsHandoff) ||
  !/Copyright Safety Checks/.test(candidateToNewsHandoff) ||
  !/Stop Conditions/.test(candidateToNewsHandoff) ||
  !/candidate-to-news-handoff\.md/.test(candidateIntakeFormat) ||
  !/candidate-to-news-handoff\.md/.test(candidateSourceChecklist) ||
  !/candidate-to-news-handoff\.md/.test(readme)
) {
  errors.push("Candidate gathering must include a candidate-to-news handoff checklist that maps intake fields to data/news.json without duplicating source article text.");
}

if (
  !/Original Source Replacement Guide/.test(originalSourceReplacementGuide) ||
  !/Replacement Rule/.test(originalSourceReplacementGuide) ||
  !/Must Replace Before Drafting/.test(originalSourceReplacementGuide) ||
  !/Media Can Remain Central/.test(originalSourceReplacementGuide) ||
  !/Replacement Search Order/.test(originalSourceReplacementGuide) ||
  !/hold-original-source-needed/.test(originalSourceReplacementGuide) ||
  !/originalDependency: "must-read"/.test(originalSourceReplacementGuide) ||
  !/official announcement, filing, paper, regulator text/.test(originalSourceReplacementGuide) ||
  !/customer-side/.test(originalSourceReplacementGuide) ||
  !/copyrightPosture/.test(originalSourceReplacementGuide) ||
  !/original-source-replacement-guide\.md/.test(candidateSourceChecklist) ||
  !/original-source-replacement-guide\.md/.test(candidateIntakeFormat) ||
  !/original-source-replacement-guide\.md/.test(candidateToNewsHandoff) ||
  !/original-source-replacement-guide\.md/.test(readme) ||
  !/Day 4[\s\S]*original-source-replacement-guide\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must include guidance for replacing media reports with official, filing, paper, regulator, or customer-side originals before drafting.");
}

if (
  !/report-duplicate-candidates\.mjs/.test(candidateSourceChecklist) ||
  !/report-duplicate-candidates\.mjs/.test(editorialChecklist) ||
  !/Duplicate Candidate Report/.test(duplicateCandidateReportJs) ||
  !/getTitleSimilarity/.test(duplicateCandidateReportJs) ||
  !/data\/news-history\.json/.test(duplicateCandidateReportJs) ||
  !/process\.exit\(report\.sourceMatches\.length \|\| report\.titleMatches\.length \? 1 : 0\)/.test(
    duplicateCandidateReportJs,
  ) ||
  !/Day 25[\s\S]*report-duplicate-candidates\.mjs/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must include a duplicate-candidate report for repeated URLs and near-matching titles before drafting.");
}

if (
  !/class="news-card-body"/.test(appJs) ||
  !/\.news-card\s*\{[^}]*display:\s*flex;[^}]*gap:\s*16px;/s.test(styles) ||
  !/\.news-card-body\s*\{[^}]*display:\s*grid;[^}]*gap:\s*12px;/s.test(styles) ||
  !/\.news-card footer\s*\{[^}]*border-top:\s*1px solid var\(--line\);/s.test(styles) ||
  !/@media \(max-width: 620px\)\s*\{[\s\S]*?\.news-card\s*\{[^}]*gap:\s*14px;[^}]*padding:\s*20px;/s.test(styles)
) {
  errors.push("Homepage news cards must keep deliberate desktop and mobile visual rhythm.");
}

if (
  !/\.simplified-detail-grid/.test(styles) ||
  !/\.source-verification-list/.test(styles) ||
  !/\.detail-editor-details/.test(styles) ||
  !/\.detail-source-reminder/.test(styles) ||
  !/\.source-button/.test(styles)
) {
  errors.push("News detail pages must keep a simplified mobile-first hierarchy with source and editor details at the end.");
}

if (
  !/at least 10 qualified current-news items/.test(sourcePolicy) ||
  !/Daily TOP3 is not the first three items of a single capture run/.test(sourcePolicy) ||
  !/at least 10 current-news items/.test(candidatePriorityRubric) ||
  !/Homepage `今日 TOP3` is a daily ranking/.test(newsDataFormat)
) {
  errors.push("News gathering rules must target 10+ qualified items per run and define TOP3 as a same-day ranking, not the latest batch first three items.");
}
if (
  !/2026-06-24 through 2026-07-23/.test(optimizationPlan) ||
  !/Candidate Intake And Editorial Triage/.test(optimizationPlan) ||
  !/create the next 30-day plan/.test(optimizationPlan) ||
  !/Do not stop daily optimization/.test(optimizationPlan)
) {
  errors.push("Optimization plan must cover the next month and continue by creating the following month plan.");
}

if (
  !/中文母语/.test(productPrinciples) ||
  !/手机阅读原则/.test(productPrinciples) ||
  !/轻松/.test(productPrinciples)
) {
  errors.push("Product principles must preserve the Chinese-reader intelligence companion purpose and mobile reading guidance.");
}

if (!/docs\/product-principles\.md/.test(optimizationPlan)) {
  errors.push("Optimization plan must reference the product principles before future planning work.");
}

if (
  !/原文中文版替代品/.test(copyrightSafety) ||
  !/媒体来源/.test(copyrightSafety) ||
  !/最小必要事实/.test(copyrightSafety) ||
  !/仍需要点原始来源/.test(copyrightSafety) ||
  !/禁止抓取付费墙或登录墙标题以外内容/.test(copyrightSafety) ||
  !/不得把媒体全文、大段正文或多个段落直接输入 AI/.test(copyrightSafety) ||
  !/originalDependency/.test(copyrightSafety) ||
  !/must-read/.test(copyrightSafety) ||
  !/原文引用上限/.test(copyrightSafety) ||
  !/图片与图表规则/.test(copyrightSafety) ||
  !/sourceReliability/.test(copyrightSafety) ||
  !/claimStatus/.test(copyrightSafety) ||
  !/删除与更正规则/.test(copyrightSafety) ||
  !/商业化前复查/.test(copyrightSafety)
) {
  errors.push("Copyright safety rules must preserve paywall, AI-rewrite, original-dependency, quotation, image, source-status, takedown, and commercialization boundaries.");
}

if (
  !/docs\/copyright-safety\.md/.test(optimizationPlan) ||
  !/Preserve the balance: make AI news understandable/.test(optimizationPlan) ||
  !/copyright, source, duplicate, or vendor-claim boundaries/.test(optimizationPlan) ||
  !/candidate workflow, or future optimization plans/.test(optimizationPlan)
) {
  errors.push("Optimization plan must prioritize copyright safety before further content expansion.");
}

if (
  !/docs\/local-preview-qa\.md/.test(readme) ||
  !/docs\/github-pages-readiness\.md/.test(readme) ||
  !/390px/.test(localPreviewQa) ||
  !/768px/.test(localPreviewQa) ||
  !/1280px/.test(localPreviewQa) ||
  !/今日 TOP3/.test(localPreviewQa) ||
  !/全部 AI 新闻/.test(localPreviewQa) ||
  !/公司标签/.test(localPreviewQa) ||
  !/data\/news\.json/.test(localPreviewQa) ||
  !/data\/news-history\.json/.test(localPreviewQa) ||
  !/skip link/.test(localPreviewQa) ||
  !/reduced motion/.test(localPreviewQa) ||
  (!/GitHub Pages/.test(localPreviewQa) && !/Publish Readiness/.test(localPreviewQa))
) {
  errors.push("Local preview QA docs must cover core viewports, reader paths, loading failures, accessibility, and publishing readiness.");
}

if (
  !/GitHub Pages 发布兼容清单/.test(githubPagesReadiness) ||
  !/根绝对路径/.test(githubPagesReadiness) ||
  !/\.\/all-news\.html/.test(githubPagesReadiness) ||
  !/\.\/archive\.html/.test(githubPagesReadiness) ||
  !/\.\/data\/news\.json/.test(githubPagesReadiness) ||
  !/404 恢复路径/.test(githubPagesReadiness) ||
  !/scripts\/validate-pages\.mjs/.test(githubPagesReadiness) ||
  !/GitHub Pages 发布兼容：`docs\/github-pages-readiness\.md`/.test(readme) ||
  !/docs\/github-pages-readiness\.md/.test(contributing) ||
  !/页面未找到后的站内恢复入口/.test(notFoundHtml)
) {
  errors.push("GitHub Pages readiness docs and 404 recovery links must stay discoverable and project-site safe.");
}

if (
  !/docs\/monthly-optimization-summary\.md/.test(readme) ||
  !/月度优化总结/.test(monthlyOptimizationSummary) ||
  !/2026-06-20 至 2026-07-19/.test(monthlyOptimizationSummary) ||
  !/已改善的方向/.test(monthlyOptimizationSummary) ||
  !/仍然薄弱的地方/.test(monthlyOptimizationSummary) ||
  !/下一步优先级/.test(monthlyOptimizationSummary) ||
  !/今日 TOP3/.test(monthlyOptimizationSummary) ||
  !/GitHub Pages/.test(monthlyOptimizationSummary) ||
  !/人工事实判断/.test(monthlyOptimizationSummary) ||
  !/避免重复劳动/.test(monthlyOptimizationSummary) ||
  !/Day 0 至 Day 29/.test(monthlyOptimizationSummary) ||
  !/下一次有用任务是 Day 30/.test(monthlyOptimizationSummary) ||
  !/中文读者理解成本/.test(monthlyOptimizationSummary)
) {
  errors.push("Monthly optimization summary must stay discoverable and cover improvements, weaknesses, and next priorities.");
}

if (
  !/docs\/optimization-decision-index\.md/.test(readme) ||
  !/Recent Decision Index/.test(optimizationDecisionIndex) ||
  !/2026-06-24 through 2026-07-23/.test(optimizationDecisionIndex) ||
  !/Phase 1, Candidate Intake And Editorial Triage/.test(optimizationDecisionIndex) ||
  !/Previous Day 24[\s\S]*candidate-source-checklist\.md/.test(optimizationDecisionIndex) ||
  !/Previous Day 25[\s\S]*report-duplicate-candidates\.mjs/.test(optimizationDecisionIndex) ||
  !/Previous Day 26[\s\S]*source-policy\.md[\s\S]*capital, compute, leadership, and infrastructure/.test(
    optimizationDecisionIndex,
  ) ||
  !/Previous Day 27[\s\S]*Vendor-claim next checks/.test(optimizationDecisionIndex) ||
  !/Previous Day 28[\s\S]*Editorial validator limits/.test(optimizationDecisionIndex) ||
  !/Previous Day 29[\s\S]*monthly-optimization-summary\.md/.test(optimizationDecisionIndex) ||
  !/Previous Day 30[\s\S]*optimization-plan\.md/.test(optimizationDecisionIndex) ||
  !/Day 0[\s\S]*candidate-intake-format\.md/.test(optimizationDecisionIndex) ||
  !/Day 1[\s\S]*candidate-priority-rubric\.md/.test(optimizationDecisionIndex) ||
  !/Day 2[\s\S]*candidate-hold-reject-reasons\.md/.test(optimizationDecisionIndex) ||
  !/Day 3[\s\S]*candidate-to-news-handoff\.md/.test(optimizationDecisionIndex) ||
  !/Day 4[\s\S]*original-source-replacement-guide\.md/.test(optimizationDecisionIndex) ||
  !/Continue with Day 5/.test(optimizationDecisionIndex) ||
  !/docs\/optimization-log\.md/.test(optimizationDecisionIndex) ||
  !/avoid duplicate work/.test(optimizationDecisionIndex)
) {
  errors.push("Optimization decision index must stay discoverable and summarize recent completed plan days, commit anchors, and the next useful task.");
}

if (
  !/docs\/editorial-validator-limits\.md/.test(readme) ||
  !/Editorial Validator Limits/.test(editorialValidatorLimits) ||
  !/False-Positive Review Rules/.test(editorialValidatorLimits) ||
  !/Intentional Limits/.test(editorialValidatorLimits) ||
  !/Freshness and duplicate checks/.test(editorialValidatorLimits) ||
  !/Source concentration checks/.test(editorialValidatorLimits) ||
  !/Vendor-claim checks/.test(editorialValidatorLimits) ||
  !/Promoted-item briefing checks/.test(editorialValidatorLimits) ||
  !/Chinese readability and mobile length checks/.test(editorialValidatorLimits) ||
  !/Source-reference labels/.test(editorialValidatorLimits) ||
  !/When To Change A Validator/.test(editorialValidatorLimits) ||
  !/freshSourceFact/.test(editorialValidatorLimits) ||
  !/sourceConcentration/.test(editorialValidatorLimits) ||
  !/厂商主张/.test(editorialValidatorLimits) ||
  !/180 Chinese characters/.test(editorialValidatorLimits) ||
  !/docs\/source-policy\.md/.test(editorialValidatorLimits) ||
  !/docs\/copyright-safety\.md/.test(editorialValidatorLimits)
) {
  errors.push("Editorial validator limits doc must stay discoverable and cover false positives, intentional limits, and when to change validators.");
}

if (
  !/id="deepSourceFrame"/.test(html) ||
  !/function renderSourceFrame/.test(appJs) ||
  !/"sourceFacts", "editorialJudgment", "unknowns"/.test(appJs) ||
  !/\.deep-source-frame/.test(styles)
) {
  errors.push("Homepage deep briefing must render an explicit source frame for facts, judgment, and unknowns.");
}

if (
  !/id="readerFrame"/.test(html) ||
  !/const readerFrame = document\.querySelector\("#readerFrame"\);/.test(appJs) ||
  !/function renderReaderFrame/.test(appJs) ||
  !/edition\.readerFrame/.test(appJs) ||
  !/\.reader-frame/.test(styles) ||
  !/readerFrame/.test(validateDataJs) ||
  !/readerFrame/.test(newsDataFormat)
) {
  errors.push("Homepage feed metadata must render and validate the edition reader frame.");
}

if (
  !/id="editionChange"/.test(html) ||
  !/const editionChange = document\.querySelector\("#editionChange"\);/.test(appJs) ||
  !/function renderEditionChange/.test(appJs) ||
  !/edition\.changeSummary/.test(appJs) ||
  !/本期新鲜事实/.test(appJs) ||
  !/重复背景/.test(appJs) ||
  !/\.edition-change/.test(styles) ||
  !/changeSummary/.test(validateDataJs) ||
  !/changeSummary/.test(newsDataFormat)
) {
  errors.push("Homepage feed metadata must render and validate what changed since the last batch.");
}

if (
  !/谁该关心/.test(detailJs) ||
  !/item\.whoShouldCare/.test(detailJs) ||
  !/function validateWhoShouldCare/.test(validateDataJs) ||
  !/whoShouldCare/.test(newsDataFormat)
) {
  errors.push("Promoted news items must name who should care before explaining reader use.");
}

if (
  !/operationalStatus/.test(appJs) ||
  !/editorialInterpretation/.test(appJs) ||
  !/运行：/.test(appJs) ||
  !/编辑：/.test(appJs) ||
  /newsMeta\.textContent = `\$\{data\.statusLabel \|\| "数据状态"\} · \$\{updatedAt\} · \$\{editionParts\.join\(" · "\)\} · \$\{data\.editorNote \|\| ""\}`/.test(
    appJs,
  ) ||
  !/validateEditionMetadataReadability/.test(validateDataJs) ||
  !/keep each metadata field responsible for one job/.test(validateDataJs) ||
  !/operationalStatus/.test(validateDataJs) ||
  !/editorialInterpretation/.test(validateDataJs) ||
  !/operationalStatus/.test(newsDataFormat) ||
  !/editorialInterpretation/.test(newsDataFormat) ||
  !/Metadata readability/.test(newsDataFormat)
) {
  errors.push("Homepage edition metadata must split short scope note, operational status, editorial interpretation, and concise non-repeating copy.");
}

if (
  !/id="sourceRisk"/.test(html) ||
  !/const sourceRisk = document\.querySelector\("#sourceRisk"\);/.test(appJs) ||
  !/function renderSourceRisk/.test(appJs) ||
  !/edition\.sourceRisk/.test(appJs) ||
  !/sourceRisk/.test(validateDataJs) ||
  !/\.source-risk/.test(styles) ||
  !/sourceRisk/.test(newsDataFormat)
) {
  errors.push("Homepage feed metadata must render and validate compact source-concentration risk notes.");
}

if (
  !/id="trendNotes"/.test(html) ||
  !/const trendNotes = document\.querySelector\("#trendNotes"\);/.test(appJs) ||
  !/function renderTrendNotes/.test(appJs) ||
  !/edition\.trendNotes/.test(appJs) ||
  !/function validateTrendNotes/.test(validateDataJs) ||
  !/\.trend-notes/.test(styles) ||
  !/trendNotes/.test(newsDataFormat) ||
  !/跨期趋势提示/.test(html)
) {
  errors.push("Homepage feed metadata must render and validate cross-edition trend notes.");
}

if (
  !/id="sourceFamilies"/.test(html) ||
  !/const sourceFamilies = document\.querySelector\("#sourceFamilies"\);/.test(appJs) ||
  !/edition\.sourceFamilies/.test(appJs) ||
  !/\.source-families/.test(styles)
) {
  errors.push("Homepage feed metadata must render edition source-family framing.");
}

if (
  !/id="topicGroups"/.test(html) ||
  !/const topicGroups = document\.querySelector\("#topicGroups"\);/.test(appJs) ||
  !/const plannedTopicGroups = \[/.test(appJs) ||
  !/edition\.topicGroups/.test(appJs) ||
  !/function isActionOrientedSignalUse/.test(appJs) ||
  !/function isActionOrientedSignalUse/.test(validateDataJs) ||
  !/id: "agent"/.test(appJs) ||
  !/id: "model"/.test(appJs) ||
  !/id: "enterprise"/.test(appJs) ||
  !/id: "policy"/.test(appJs) ||
  !/id: "infrastructure"/.test(appJs) ||
  !/id: "developer-tooling"/.test(appJs) ||
  !/本期未捕捉/.test(appJs) ||
  !/whyNow/.test(appJs) ||
  !/emptyReason/.test(appJs) ||
  !/promotionThreshold/.test(appJs) ||
  !/fallback/.test(appJs) ||
  !/为什么现在看/.test(appJs) ||
  !/未入选原因/.test(appJs) ||
  !/入选门槛/.test(appJs) ||
  !/替代阅读/.test(appJs) ||
  !/class="empty-topic"/.test(appJs) ||
  !/\.topic-groups/.test(styles) ||
  !/\.topic-groups span\.empty-topic/.test(styles) ||
  !/\.topic-groups span em/.test(styles) ||
  !/planned-topic why-now summaries and omission boundaries/.test(newsDataFormat) ||
  !/action-oriented coverage and topic meanings/.test(newsDataFormat)
) {
  errors.push("Homepage feed metadata must render action-oriented edition topic grouping, why-now summaries, and omission boundaries for the planned topic vocabulary.");
}

if (!/AI Watchtower 不追求把所有官方更新铺满首页/.test(html) || !/范式变化/.test(html)) {
  errors.push("Homepage must explain the narrative-first editorial selection logic.");
}

if (
  !/selectionScore/.test(appJs) ||
  !/function renderSelectionScore/.test(appJs) ||
  !/编辑评分 \$\{score\.total\}\/25/.test(appJs) ||
  !/\.selection-score/.test(styles)
) {
  errors.push("Homepage must render editorial selection scores for impact, novelty, narrative strength, evidence quality, and reader utility.");
}

if (
  !/const incidentBriefingSections = \[/.test(validateDataJs) ||
  !/function validateIncidentBriefingReadiness/.test(validateDataJs) ||
  !/data\/news\.json promoted item/.test(validateDataJs) ||
  !/data\/news-history\.json latest promoted item/.test(validateDataJs)
) {
  errors.push("Data validation must confirm every promoted item can support an incident briefing.");
}

if (
  !/function normalizeSourceKey\(item\)/.test(validateDataJs) ||
  !/function normalizeTitleKey\(item\)/.test(validateDataJs) ||
  !/function getTitleSimilarity\(firstTitleKey, secondTitleKey\)/.test(validateDataJs) ||
  !/function validateSimilarTitles\(items, context\)/.test(validateDataJs) ||
  !/similar titles/.test(validateDataJs) ||
  !/validateSimilarTitles\(newsFeed\.items, "data\/news\.json"\)/.test(validateDataJs) ||
  !/validateSimilarTitles\(allHistoryItems, "data\/news-history\.json"\)/.test(validateDataJs)
) {
  errors.push("Data validation must reject repeated source URLs and near-duplicate titles before publishing.");
}

if (
  !/stale current items/.test(newsDataFormat) ||
  !/repeated current-vs-history coverage/.test(newsDataFormat) ||
  !/function validateCurrentItemFreshness\(items, editionDate\)/.test(validateDataJs) ||
  !/function validateCurrentItemsAgainstOlderHistory\(currentItems, historicalEditions\)/.test(validateDataJs) ||
  !/maxCurrentItemAgeDays/.test(validateDataJs)
) {
  errors.push("Data validation must reject stale current items and repeated current-vs-history coverage.");
}

if (!/fetchJson\("\.\/data\/news-history\.json"\)/.test(detailJs) || !/function findHistoryContext/.test(detailJs)) {
  errors.push("News detail page must fall back to the historical intelligence file for archived items.");
}

if (
  !/来源与核验边界/.test(detailJs) ||
  !/来源能支持/.test(detailJs) ||
  !/尚不能证明/.test(detailJs) ||
  !/确认门槛/.test(detailJs) ||
  !/降级信号/.test(detailJs) ||
  !/\.source-verification-list/.test(styles)
) {
  errors.push("News detail pages must separate source-supported facts, editorial interpretation, and unknown boundaries.");
}

if (!/function sortNewsItems/.test(appJs) || !/news = sortNewsItems\(data\.items\)/.test(appJs)) {
  errors.push("Homepage news items must be sorted newest first before rendering.");
}

if (
  !/let dailyTopStoryIds = new Set\(\);/.test(appJs) ||
  !/async function loadNewsHistory/.test(appJs) ||
  !/function getDailyTopStories/.test(appJs) ||
  !/dailyTopStoryIds = new Set\(dailyTopItems\.map/.test(appJs) ||
  !/visibleNews = scopedNews\.filter\(\(item\) => !dailyTopStoryIds\.has\(item\.id\)\)/.test(appJs) ||
  !/compact-feed-card/.test(appJs) ||
  !/当天 TOP3 已覆盖当前新闻流/.test(appJs) ||
  /<p class="rank-note"><strong>为什么值得看<\/strong>/.test(appJs)
) {
  errors.push("Homepage feed must use same-day TOP3 ranking, avoid duplicating daily TOP3, and keep non-TOP3 feed cards concise.");
}
if (!/function sortHistoryEditions/.test(allNewsJs) || !/function sortHistoryItems/.test(allNewsJs)) {
  errors.push("All-news page must sort editions and items newest first before rendering.");
}

if (
  !/id="historyControls"/.test(allNewsHtml) ||
  !/id="historyCategoryFilters"/.test(allNewsHtml) ||
  !/id="historySort"/.test(allNewsHtml) ||
  !/id="historyResultNote"/.test(allNewsHtml) ||
  !/function getHistoryCategories\(history\)/.test(allNewsJs) ||
  !/function getFilteredHistoryItems\(history\)/.test(allNewsJs) ||
  !/function sortHistoryFlatItems\(items, sortOrder = "newest"\)/.test(allNewsJs) ||
  !/selectedSort = historySort\.value === "oldest" \? "oldest" : "newest";/.test(allNewsJs) ||
  !/本页只显示题目，点击进入站内解读/.test(allNewsJs) ||
  !/\.history-controls/.test(styles) ||
  !/\.history-filter-tabs button\.active/.test(styles) ||
  !/class="history-title-list flat"/.test(allNewsJs) ||
  !/class="history-title-item"/.test(allNewsJs) ||
  !/class="history-title-meta"/.test(allNewsJs) ||
  !/\.history-title-list\.flat/.test(styles) ||
  !/\.history-title-item/.test(styles) ||
  /<section class="history-edition"/.test(allNewsJs) ||
  /<p><strong>发生了什么<\/strong>/.test(allNewsJs)
) {
  errors.push("All-news history must support category filtering, sort switching, an editorial result note, and flat compact title-only rows.");
}

if (
  !/function getEditionBatchStatus\(edition, latestEdition\)/.test(allNewsJs) ||
  !/最新抓取/.test(allNewsJs) ||
  !/已归档/.test(allNewsJs) ||
  !/class="batch-status \$\{escapeHtml\(item\.batchStatus\.tone\)\}"/.test(allNewsJs) ||
  !/\.history-title-meta \.batch-status\.archived/.test(styles)
) {
  errors.push("All-news title rows must distinguish the latest capture batch from archived batches without large batch panels.");
}


if (
  !/Leadership and capital shock/.test(sourcePolicy) ||
  !/AI-adjacent business events/.test(sourcePolicy) ||
  !/AI-adjacent Event Examples/.test(sourcePolicy) ||
  !/Capital or financing/.test(sourcePolicy) ||
  !/Compute and data-center buildout/.test(sourcePolicy) ||
  !/Leadership and strategy/.test(sourcePolicy) ||
  !/Infrastructure providers/.test(sourcePolicy) ||
  !/Hold or skip when/.test(sourcePolicy) ||
  !/what AI capability or constraint changed/.test(sourcePolicy) ||
  !/Jensen Huang/.test(sourcePolicy) ||
  !/Elon Musk\/xAI\/SpaceX/.test(sourcePolicy) ||
  !/immediate independent-evidence path/.test(sourcePolicy)
) {
  errors.push("Source policy must include concrete promote/hold examples for AI-adjacent capital, compute, leadership, and infrastructure events.");
}

if (
  !/Chinese replacement for a media article/.test(sourcePolicy) ||
  !/minimum necessary fact/.test(sourcePolicy) ||
  !/docs\/copyright-safety\.md/.test(sourcePolicy)
) {
  errors.push("Source policy must reference copyright safety and require minimum-fact media handling.");
}

if (
  !/docs\/copyright-safety\.md/.test(newsDataFormat) ||
  !/minimum-fact summary/.test(newsDataFormat) ||
  !/not a rewritten version of the source article/.test(newsDataFormat) ||
  !/originalDependency/.test(newsDataFormat) ||
  !/sourceType/.test(newsDataFormat) ||
  !/sourceReliability/.test(newsDataFormat) ||
  !/claimStatus/.test(newsDataFormat) ||
  !/summary/.test(newsDataFormat) ||
  !/whyItMatters/.test(newsDataFormat)
) {
  errors.push("News data format must keep source facts short and reserve detail fields for original interpretation, original dependency, and structured claim status.");
}

if (!/aria-label="\$\{escapeHtml\(`\$\{sourceName\}（在新窗口打开）`\)\}"/.test(detailJs)) {
  errors.push("News detail source links must announce that they open in a new window.");
}

if (
  !/Deep briefing must include source references\./.test(appJs) ||
  !/Each deep briefing reference must include a label and valid source URL\./.test(appJs) ||
  !/<a href="\$\{escapeHtml\(reference\.url\)\}" target="_blank" rel="noopener noreferrer" aria-label="\$\{escapeHtml\(`\$\{reference\.label\}（在新窗口打开）`\)\}">/.test(
    appJs,
  )
) {
  errors.push("Homepage deep briefing references must validate source URLs and announce new-window behavior.");
}

if (
  !/<time datetime="\$\{escapeHtml\(item\.publishedAt\)\}">\$\{escapeHtml\(item\.time\)\}<\/time>/.test(
    appJs,
  )
) {
  errors.push("Rendered news timestamps must expose publishedAt through the time datetime attribute.");
}

if (
  !/setFiltersDisabled\(true\);[\s\S]*renderFeedMessage\("loading"/.test(appJs) ||
  !/setFiltersDisabled\(false\);\s*renderNews\(currentFilter\);/.test(appJs)
) {
  errors.push("News filters must stay disabled until the data has loaded successfully.");
}

if (
  !/renderFeedMessage\("error",\s*"新闻数据暂时无法读取。",\s*true\)/.test(appJs) ||
  !/class="feed-retry"[\s\S]*重新加载/.test(appJs) ||
  !/querySelector\("\.feed-retry"\)\?\.addEventListener\("click", loadNews\)/.test(appJs) ||
  !/结构化数据文件暂时没有下载成功/.test(appJs) ||
  !/href="\.\/all-news\.html"[\s\S]*href="\.\/data\/news\.json"[\s\S]*href="\.\/archive\.html"/.test(appJs) ||
  !/\.feed-state-actions/.test(styles)
) {
  errors.push("News loading errors must provide a working retry button and informative fallback links.");
}

if (
  !/function renderHistoryLoadError\(\)/.test(allNewsJs) ||
  !/结构化归档文件未能下载成功/.test(allNewsJs) ||
  !/href="\.\/data\/news-history\.json"[\s\S]*href="\.\/index\.html"[\s\S]*href="\.\/archive\.html"/.test(allNewsJs) ||
  !/historyList\.querySelector\("\.feed-retry"\)\?\.addEventListener\("click", loadHistory\)/.test(allNewsJs)
) {
  errors.push("All-news loading errors must distinguish data-fetch failure from empty history and offer retry/fallback paths.");
}

if (!/main section\[id\]\s*\{[^}]*scroll-margin-top:/s.test(styles)) {
  errors.push("Anchored homepage sections must clear the sticky header.");
}

if (!/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?scroll-behavior:\s*auto;/s.test(styles)) {
  errors.push("Site styles must disable smooth scrolling when reduced motion is preferred.");
}

const definedCssProperties = new Set(
  Array.from(styles.matchAll(/(--[a-z0-9-]+)\s*:/gi), (match) => match[1]),
);
const referencedCssProperties = new Set(
  Array.from(styles.matchAll(/var\((--[a-z0-9-]+)/gi), (match) => match[1]),
);

for (const property of referencedCssProperties) {
  if (!definedCssProperties.has(property)) {
    errors.push(`styles.css references undefined custom property ${property}.`);
  }
}

const retiredCssSelectors = [
  ".batch-explainer",
  ".history-card",
  ".history-edition",
  ".history-edition-header",
  ".history-edition-badges",
  ".detail-header",
  ".empty-state",
  ".sr-only",
  ".news-card .impact-note",
  ".news-card .rank-note",
  ".news-card .reader-use",
  ".news-card .next-check",
  ".news-card .follow-up-questions",
  ".news-card .evidence-threshold",
  ".news-card .claim-boundary",
  ".news-card .counter-evidence",
  ".news-card .verification-status",
  ".news-card .source-role",
  ".news-card .source-note",
];

for (const selector of retiredCssSelectors) {
  if (styles.includes(selector)) {
    errors.push(`styles.css still contains retired selector ${selector}.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Validated site metadata, ${localReferenceCount} local references, and static page link targets.`,
);
