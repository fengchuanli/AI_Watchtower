import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const html = readFileSync("index.html", "utf8");
const detailHtml = readFileSync("news-detail.html", "utf8");
const allNewsHtml = readFileSync("all-news.html", "utf8");
const tagsHtml = readFileSync("tags.html", "utf8");
const archiveHtml = readFileSync("archive.html", "utf8");
const notFoundHtml = readFileSync("404.html", "utf8");
const appJs = readFileSync("app.js", "utf8");
const newsJson = readFileSync("data/news.json", "utf8");
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
const candidateWorkflowPlainLanguageGuide = readFileSync(
  "docs/candidate-workflow-plain-language-guide.md",
  "utf8",
);
const candidateSourceChecklist = readFileSync("docs/candidate-source-checklist.md", "utf8");
const candidateIntakeFormat = readFileSync("docs/candidate-intake-format.md", "utf8");
const candidateHoldRejectReasons = readFileSync("docs/candidate-hold-reject-reasons.md", "utf8");
const candidatePriorityRubric = readFileSync("docs/candidate-priority-rubric.md", "utf8");
const sourceDiversityTriageNote = readFileSync("docs/source-diversity-triage-note.md", "utf8");
const originalSourceReplacementGuide = readFileSync("docs/original-source-replacement-guide.md", "utf8");
const candidateToNewsHandoff = readFileSync("docs/candidate-to-news-handoff.md", "utf8");
const counterEvidenceObservableGuide = readFileSync("docs/counter-evidence-observable-guide.md", "utf8");
const detailPageReviewGuide = readFileSync("docs/detail-page-review-guide.md", "utf8");
const homepageEditionPreflight = readFileSync("docs/homepage-edition-preflight.md", "utf8");
const vendorNarrativePromotionRule = readFileSync("docs/vendor-narrative-promotion-rule.md", "utf8");
const updateRunChecklist = readFileSync("docs/update-run-checklist.md", "utf8");
const currentToHistoryPublicationChecklist = readFileSync(
  "docs/current-to-history-publication-checklist.md",
  "utf8",
);
const archiveDiffSummaryFormat = readFileSync("docs/archive-diff-summary-format.md", "utf8");
const badDataRollbackNote = readFileSync("docs/bad-data-rollback-note.md", "utf8");
const partialBatchPublicationGuide = readFileSync("docs/partial-batch-publication-guide.md", "utf8");
const remoteSyncLogConvention = readFileSync("docs/remote-sync-log-convention.md", "utf8");
const editorialChecklist = readFileSync("docs/editorial-checklist.md", "utf8");
const editorialValidatorLimits = readFileSync("docs/editorial-validator-limits.md", "utf8");
const optimizationPlan = readFileSync("docs/optimization-plan.md", "utf8");
const productPrinciples = readFileSync("docs/product-principles.md", "utf8");
const localPreviewQa = readFileSync("docs/local-preview-qa.md", "utf8");
const githubPagesReadiness = readFileSync("docs/github-pages-readiness.md", "utf8");
const monthlyOptimizationSummary = readFileSync("docs/monthly-optimization-summary.md", "utf8");
const optimizationDecisionIndex = readFileSync("docs/optimization-decision-index.md", "utf8");
const optimizationLogArchiveGuide = readFileSync("docs/optimization-log-archive-guide.md", "utf8");
const contributing = readFileSync("docs/contributing.md", "utf8");
const readme = readFileSync("README.md", "utf8");
const errors = [];
const currentNewsData = JSON.parse(newsJson);
const repositoryRoot = process.cwd();
const htmlPages = new Map([
  ["index.html", html],
  ["news-detail.html", detailHtml],
  ["all-news.html", allNewsHtml],
  ["tags.html", tagsHtml],
  ["archive.html", archiveHtml],
  ["404.html", notFoundHtml],
]);

const currentDominantSourceFamily = (currentNewsData.edition?.sourceFamilies || []).find((family) => Number.isInteger(family.count) && family.count >= Math.ceil((currentNewsData.items || []).length * 0.67));

if (
  currentDominantSourceFamily &&
  !/用来|适合|先把|应该/.test(currentNewsData.edition?.overreadBoundary?.useInstead || "")
) {
  errors.push("Homepage runtime overread boundary wording must pass app.js validation so feed modules render.");
}
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
  !/function getDetailSourceReminder\(item\)/.test(detailJs) ||
  !/这条是媒体背景/.test(detailJs) ||
  !/完整事实、引述、采访、图表、数据与上下文仍归/.test(detailJs) ||
  !/事件简述/.test(detailJs) ||
  !/这件事怎么理解/.test(detailJs) ||
  !/可能带来的变化/.test(detailJs) ||
  !/接下来要看哪里/.test(detailJs) ||
  !/来源与核验边界/.test(detailJs) ||
  !/查看原文/.test(detailJs) ||
  !/sourceReminder/.test(detailJs)
) {
  errors.push("News detail page must render a simplified reader-first structure with media-specific source reminders and source boundaries at the end.");
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
  !/function validateMediaSourceReminder\(item, context\)/.test(validateDataJs) ||
  !/media provenance must assign complete facts to the original article/.test(validateDataJs) ||
  !/media-sourced detail pages/.test(newsDataFormat) ||
  !/complete facts to the original article/.test(newsDataFormat)
) {
  errors.push("Media-sourced detail pages must keep original-article ownership explicit in data validation and documentation.");
}

if (
  !/Candidate Workflow Plain-Language Guide/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Six Editor Questions/.test(candidateWorkflowPlainLanguageGuide) ||
  !/What exactly happened/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Why should a Chinese AI reader care today/.test(candidateWorkflowPlainLanguageGuide) ||
  !/What does the source prove, and what does it not prove/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Is this the right source to use/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Is it safe and fresh enough for this batch/.test(candidateWorkflowPlainLanguageGuide) ||
  !/What should happen next/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Plain-Language Intake Note/.test(candidateWorkflowPlainLanguageGuide) ||
  !/Stop Before Writing Public Copy/.test(candidateWorkflowPlainLanguageGuide) ||
  !/candidate-workflow-plain-language-guide\.md/.test(candidateSourceChecklist) ||
  !/candidate-workflow-plain-language-guide\.md/.test(candidateIntakeFormat) ||
  !/candidate-workflow-plain-language-guide\.md/.test(readme) ||
  !/Day 6[\s\S]*candidate-workflow-plain-language-guide\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must include a plain-language Chinese workflow path before schema-heavy intake fields.");
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
  !/Intake Scratch Template/.test(candidateIntakeFormat) ||
  !/During 08:00 and 17:00 JST news runs/.test(candidateIntakeFormat) ||
  !/originalSourceSearch: media-started \/ replaced-with-original \/ no-original-found \/ not-needed/.test(
    candidateIntakeFormat,
  ) ||
  !/duplicateStatus: repeated-url \/ near-title-review \/ fresh-source-fact \/ manual-clear/.test(
    candidateIntakeFormat,
  ) ||
  !/priorityScore \/ priorityReason/.test(candidateIntakeFormat) ||
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
  !/Source Diversity Triage Note/.test(sourceDiversityTriageNote) ||
  !/When To Trigger The Note/.test(sourceDiversityTriageNote) ||
  !/Triage Decision/.test(sourceDiversityTriageNote) ||
  !/balance-draft/.test(sourceDiversityTriageNote) ||
  !/draft-with-caveat/.test(sourceDiversityTriageNote) ||
  !/hold-for-balance/.test(sourceDiversityTriageNote) ||
  !/publish-short-batch/.test(sourceDiversityTriageNote) ||
  !/hold-batch-balance/.test(sourceDiversityTriageNote) ||
  !/batchDiversityNote/.test(sourceDiversityTriageNote) ||
  !/source owner/.test(sourceDiversityTriageNote) ||
  !/source family/.test(sourceDiversityTriageNote) ||
  !/narrative angle/.test(sourceDiversityTriageNote) ||
  !/source-diversity-triage-note\.md/.test(candidateSourceChecklist) ||
  !/source-diversity-triage-note\.md/.test(candidateIntakeFormat) ||
  !/source-diversity-triage-note\.md/.test(candidatePriorityRubric) ||
  !/source-diversity-triage-note\.md/.test(candidateToNewsHandoff) ||
  !/source-diversity-triage-note\.md/.test(readme) ||
  !/Day 5[\s\S]*source-diversity-triage-note\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Candidate gathering must include batch-level source-diversity triage for over-concentrated owner, source-family, and narrative-angle candidate sets.");
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
  !/Counter-Evidence Observable Outcome Guide/.test(counterEvidenceObservableGuide) ||
  !/When To Name An Observable Outcome/.test(counterEvidenceObservableGuide) ||
  !/When A Document Is Enough/.test(counterEvidenceObservableGuide) ||
  !/Mixed Claims/.test(counterEvidenceObservableGuide) ||
  !/Bad Shapes/.test(counterEvidenceObservableGuide) ||
  !/Stop Conditions/.test(counterEvidenceObservableGuide) ||
  !/adoption, deployment, safety, performance, cost, or policy implementation/.test(counterEvidenceObservableGuide) ||
  !/访问日志/.test(counterEvidenceObservableGuide) ||
  !/审批/.test(counterEvidenceObservableGuide) ||
  !/采用指标/.test(counterEvidenceObservableGuide) ||
  !/第三方复测/.test(counterEvidenceObservableGuide) ||
  !/交付/.test(counterEvidenceObservableGuide) ||
  !/政策文本/.test(counterEvidenceObservableGuide) ||
  !/filing/.test(counterEvidenceObservableGuide) ||
  !/docs\/counter-evidence-observable-guide\.md/.test(readme) ||
  !/docs\/counter-evidence-observable-guide\.md/.test(newsDataFormat) ||
  !/docs\/counter-evidence-observable-guide\.md/.test(editorialChecklist) ||
  !/docs\/counter-evidence-observable-guide\.md/.test(detailPageReviewGuide) ||
  !/docs\/counter-evidence-observable-guide\.md/.test(candidateToNewsHandoff) ||
  !/Day 25[\s\S]*counterEvidence[\s\S]*observable outcome/.test(optimizationDecisionIndex)
) {
  errors.push("Counter-evidence guidance must tell editors when downgrade signals need observable outcomes instead of another document.");
}

if (
  !/Vendor Narrative Promotion Rule/.test(vendorNarrativePromotionRule) ||
  !/Promotion Gate/.test(vendorNarrativePromotionRule) ||
  !/Required First-Screen Shape/.test(vendorNarrativePromotionRule) ||
  !/first-screen card copy/.test(vendorNarrativePromotionRule) ||
  !/summary/.test(vendorNarrativePromotionRule) ||
  !/whyItMatters/.test(vendorNarrativePromotionRule) ||
  !/whyRanked/.test(vendorNarrativePromotionRule) ||
  !/topReason/.test(vendorNarrativePromotionRule) ||
  !/readerUse/.test(vendorNarrativePromotionRule) ||
  !/nextCheck/.test(vendorNarrativePromotionRule) ||
  !/sourceRole` is `厂商主张`/.test(vendorNarrativePromotionRule) ||
  !/evidenceQuality` is lower than 3/.test(vendorNarrativePromotionRule) ||
  !/nextCheck`, `evidenceThreshold`, `claimBoundary`, and `counterEvidence`/.test(vendorNarrativePromotionRule) ||
  !/Stop Conditions/.test(vendorNarrativePromotionRule) ||
  !/customer-side metric/.test(vendorNarrativePromotionRule) ||
  !/third-party benchmark/.test(vendorNarrativePromotionRule) ||
  !/customer-side deployment metrics|客户侧部署指标/.test(vendorNarrativePromotionRule) ||
  !/filing/.test(vendorNarrativePromotionRule) ||
  !/audit|审计/.test(vendorNarrativePromotionRule) ||
  !/vendor-narrative-promotion-rule\.md/.test(readme) ||
  !/vendor-narrative-promotion-rule\.md/.test(newsDataFormat) ||
  !/vendor-narrative-promotion-rule\.md/.test(editorialChecklist) ||
  !/vendor-narrative-promotion-rule\.md/.test(sourcePolicy) ||
  !/validatePromotedVendorNarrativeCard/.test(validateDataJs) ||
  !/promoted vendor narrative/.test(validateDataJs) ||
  !/first-screen card copy/.test(validateDataJs) ||
  !/Day 27[\s\S]*vendor-narrative-promotion-rule\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Promoted vendor narratives must name independent proof in first-screen card copy and keep the rule linked from editorial docs.");
}

if (
  !/Detail Page Review Guide/.test(detailPageReviewGuide) ||
  !/When To Use It/.test(detailPageReviewGuide) ||
  !/Four-Block Review/.test(detailPageReviewGuide) ||
  !/Technical Claim Conversion/.test(detailPageReviewGuide) ||
  !/Source-Type Adjustments/.test(detailPageReviewGuide) ||
  !/Mobile Readability Pass/.test(detailPageReviewGuide) ||
  !/Stop Conditions/.test(detailPageReviewGuide) ||
  !/fact, impact, boundary, and next check/.test(detailPageReviewGuide) ||
  !/`detailBody`/.test(detailPageReviewGuide) ||
  !/`detailTrend`/.test(detailPageReviewGuide) ||
  !/`sourceFacts`/.test(detailPageReviewGuide) ||
  !/`claimBoundary`/.test(detailPageReviewGuide) ||
  !/`nextCheck`/.test(detailPageReviewGuide) ||
  !/`evidenceThreshold`/.test(detailPageReviewGuide) ||
  !/`counterEvidence`/.test(detailPageReviewGuide) ||
  !/`followUpQuestions`/.test(detailPageReviewGuide) ||
  !/`sourceReferences`/.test(detailPageReviewGuide) ||
  !/official file, customer metric, audit, benchmark, dataset, replication, contract, filing, regulator text, logs, deployment status, or third-party test/.test(
    detailPageReviewGuide,
  ) ||
  !/detail-page-review-guide\.md/.test(candidateToNewsHandoff) ||
  !/detail-page-review-guide\.md/.test(editorialChecklist) ||
  !/detail-page-review-guide\.md/.test(readme) ||
  !/Day 21[\s\S]*detail-page-review-guide\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Detail-page review must convert technical claims into fact, impact, boundary, and next-check blocks before publication.");
}

if (
  !/Update Run Checklist/.test(updateRunChecklist) ||
  !/Run Header/.test(updateRunChecklist) ||
  !/Status Checklist/.test(updateRunChecklist) ||
  !/Source discovery/.test(updateRunChecklist) ||
  !/Candidate intake/.test(updateRunChecklist) ||
  !/Original-source search/.test(updateRunChecklist) ||
  !/Duplicate reporting/.test(updateRunChecklist) ||
  !/Priority and mix/.test(updateRunChecklist) ||
  !/Drafting/.test(updateRunChecklist) ||
  !/Data validation/.test(updateRunChecklist) ||
  !/Site validation/.test(updateRunChecklist) ||
  !/Commit/.test(updateRunChecklist) ||
  !/Push/.test(updateRunChecklist) ||
  !/shortBatchReason/.test(updateRunChecklist) ||
  !/scratch template/.test(updateRunChecklist) ||
  !/originalSourceSearch/.test(updateRunChecklist) ||
  !/priorityReason/.test(updateRunChecklist) ||
  !/report-duplicate-candidates\.mjs/.test(updateRunChecklist) ||
  !/validate-data\.mjs/.test(updateRunChecklist) ||
  !/validate-site\.mjs/.test(updateRunChecklist) ||
  !/validate-pages\.mjs/.test(updateRunChecklist) ||
  !/blocked-dns/.test(updateRunChecklist) ||
  !/update-run-checklist\.md/.test(candidateIntakeFormat) ||
  !/update-run-checklist\.md/.test(candidateToNewsHandoff) ||
  !/update-run-checklist\.md/.test(readme) ||
  !/Day 7[\s\S]*Intake Scratch Template/.test(optimizationDecisionIndex)
) {
  errors.push("News update workflow must include an intake scratch template plus an update-run checklist for discovery, intake, duplicate reporting, drafting, validation, commit, and push status.");
}

if (
  !/Partial Batch Publication Guide/.test(partialBatchPublicationGuide) ||
  !/When To Use It/.test(partialBatchPublicationGuide) ||
  !/Publish, Hold, Or Continue Searching/.test(partialBatchPublicationGuide) ||
  !/Minimum Publication Bar/.test(partialBatchPublicationGuide) ||
  !/Short Batch Reason/.test(partialBatchPublicationGuide) ||
  !/Compact Log Note/.test(partialBatchPublicationGuide) ||
  !/Stop Conditions/.test(partialBatchPublicationGuide) ||
  !/publish-partial-batch/.test(partialBatchPublicationGuide) ||
  !/continue-searching/.test(partialBatchPublicationGuide) ||
  !/hold-no-safe-batch/.test(partialBatchPublicationGuide) ||
  !/source, duplicate, proof-boundary, and copyright gates/i.test(partialBatchPublicationGuide) ||
  !/one or two reliable, non-duplicate, copyright-safe candidates/.test(partialBatchPublicationGuide) ||
  !/partial-batch-publication-guide\.md/.test(updateRunChecklist) ||
  !/partial-batch-publication-guide\.md/.test(candidateToNewsHandoff) ||
  !/partial-batch-publication-guide\.md/.test(newsDataFormat) ||
  !/partial-batch-publication-guide\.md/.test(readme) ||
  !/Day 12[\s\S]*partial-batch-publication-guide\.md/.test(optimizationDecisionIndex)
) {
  errors.push("News update workflow must include partial-batch guidance for publishing or holding one- or two-item safe batches without padding.");
}

if (
  !/Current To History Publication Checklist/.test(currentToHistoryPublicationChecklist) ||
  !/Mirror Fields/.test(currentToHistoryPublicationChecklist) ||
  !/Publication Steps/.test(currentToHistoryPublicationChecklist) ||
  !/Stop Conditions/.test(currentToHistoryPublicationChecklist) ||
  !/Compact Log Note/.test(currentToHistoryPublicationChecklist) ||
  !/data\/news\.json/.test(currentToHistoryPublicationChecklist) ||
  !/data\/news-history\.json/.test(currentToHistoryPublicationChecklist) ||
  !/edition\.id/.test(currentToHistoryPublicationChecklist) ||
  !/readerFrame/.test(currentToHistoryPublicationChecklist) ||
  !/changeSummary/.test(currentToHistoryPublicationChecklist) ||
  !/sourceConcentration/.test(currentToHistoryPublicationChecklist) ||
  !/trendNotes/.test(currentToHistoryPublicationChecklist) ||
  !/topicContinuity/.test(currentToHistoryPublicationChecklist) ||
  !/topicGroups/.test(currentToHistoryPublicationChecklist) ||
  !/item count/.test(currentToHistoryPublicationChecklist) ||
  !/item order/.test(currentToHistoryPublicationChecklist) ||
  !/validate-data\.mjs/.test(currentToHistoryPublicationChecklist) ||
  !/current-to-history-publication-checklist\.md/.test(updateRunChecklist) ||
  !/current-to-history-publication-checklist\.md/.test(candidateToNewsHandoff) ||
  !/current-to-history-publication-checklist\.md/.test(newsDataFormat) ||
  !/current-to-history-publication-checklist\.md/.test(readme) ||
  !/Day 8[\s\S]*current-to-history-publication-checklist\.md/.test(optimizationDecisionIndex)
) {
  errors.push("News publication workflow must include a current-to-history checklist so the newest archive edition cannot drift from the homepage edition.");
}

if (
  !/Archive Diff Summary Format/.test(archiveDiffSummaryFormat) ||
  !/When To Write It/.test(archiveDiffSummaryFormat) ||
  !/Comparison Scope/.test(archiveDiffSummaryFormat) ||
  !/Compact Shape/.test(archiveDiffSummaryFormat) ||
  !/Publication Steps/.test(archiveDiffSummaryFormat) ||
  !/Stop Conditions/.test(archiveDiffSummaryFormat) ||
  !/Compact Log Note/.test(archiveDiffSummaryFormat) ||
  !/08:00 -> 17:00 JST/.test(archiveDiffSummaryFormat) ||
  !/New signals/.test(archiveDiffSummaryFormat) ||
  !/Source posture/.test(archiveDiffSummaryFormat) ||
  !/Reader takeaway/.test(archiveDiffSummaryFormat) ||
  !/archive-diff: done/.test(archiveDiffSummaryFormat) ||
  !/data\/news-history\.json/.test(archiveDiffSummaryFormat) ||
  !/archive-diff-summary-format\.md/.test(updateRunChecklist) ||
  !/archive-diff-summary-format\.md/.test(currentToHistoryPublicationChecklist) ||
  !/archive-diff-summary-format\.md/.test(newsDataFormat) ||
  !/archive-diff-summary-format\.md/.test(readme)
) {
  errors.push("Archive workflow must include a compact same-day morning/evening diff format linked from publication, update, data, and README docs.");
}

if (
  !/Bad Data Rollback Note/.test(badDataRollbackNote) ||
  !/When To Roll Back/.test(badDataRollbackNote) ||
  !/Files To Inspect/.test(badDataRollbackNote) ||
  !/Rollback Shapes/.test(badDataRollbackNote) ||
  !/Restore Steps/.test(badDataRollbackNote) ||
  !/Validators To Rerun/.test(badDataRollbackNote) ||
  !/Compact Log Note/.test(badDataRollbackNote) ||
  !/Stop Conditions/.test(badDataRollbackNote) ||
  !/data\/news\.json/.test(badDataRollbackNote) ||
  !/data\/news-history\.json/.test(badDataRollbackNote) ||
  !/data\/sources\.json/.test(badDataRollbackNote) ||
  !/validate-data\.mjs/.test(badDataRollbackNote) ||
  !/validate-site\.mjs/.test(badDataRollbackNote) ||
  !/validate-pages\.mjs/.test(badDataRollbackNote) ||
  !/git diff --check/.test(badDataRollbackNote) ||
  !/bad-data-rollback-note\.md/.test(updateRunChecklist) ||
  !/bad-data-rollback-note\.md/.test(currentToHistoryPublicationChecklist) ||
  !/bad-data-rollback-note\.md/.test(newsDataFormat) ||
  !/bad-data-rollback-note\.md/.test(readme) ||
  !/Day 9[\s\S]*bad-data-rollback-note\.md/.test(optimizationDecisionIndex)
) {
  errors.push("News update workflow must include a bad-data rollback note naming files to inspect and validators to rerun before republishing.");
}

if (
  !/Remote Sync Log Convention/.test(remoteSyncLogConvention) ||
  !/Status Values/.test(remoteSyncLogConvention) ||
  !/Log Placement/.test(remoteSyncLogConvention) ||
  !/Pull Notes/.test(remoteSyncLogConvention) ||
  !/Push Notes/.test(remoteSyncLogConvention) ||
  !/Stop Conditions/.test(remoteSyncLogConvention) ||
  !/Minimum Log Wording/.test(remoteSyncLogConvention) ||
  !/blocked-dns/.test(remoteSyncLogConvention) ||
  !/blocked-auth/.test(remoteSyncLogConvention) ||
  !/blocked-conflict/.test(remoteSyncLogConvention) ||
  !/blocked-non-fast-forward/.test(remoteSyncLogConvention) ||
  !/not-attempted-with-reason/.test(remoteSyncLogConvention) ||
  !/git pull --ff-only origin main/.test(remoteSyncLogConvention) ||
  !/git push origin main/.test(remoteSyncLogConvention) ||
  !/remote-sync-log-convention\.md/.test(updateRunChecklist) ||
  !/remote-sync-log-convention\.md/.test(badDataRollbackNote) ||
  !/remote-sync-log-convention\.md/.test(readme) ||
  !/Day 10[\s\S]*remote-sync-log-convention\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Remote sync failures must use a shared optimization-log convention for pull and push status.");
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
  !/2026-08-10 through 2026-09-08/.test(optimizationPlan) ||
  !/Homepage Edition Quality/.test(optimizationPlan) ||
  !/Source And Candidate Workflow Friction/.test(optimizationPlan) ||
  !/Detail Pages And Proof Boundaries/.test(optimizationPlan) ||
  !/Continuity And Archive Usefulness/.test(optimizationPlan) ||
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
  !/docs\/homepage-edition-preflight\.md/.test(readme) ||
  !/Homepage Edition Preflight/.test(homepageEditionPreflight) ||
  !/targetReaderQuestion/.test(homepageEditionPreflight) ||
  !/top3ReaderUse/.test(homepageEditionPreflight) ||
  !/sourceMixBoundary/.test(homepageEditionPreflight) ||
  !/mobileScanPath/.test(homepageEditionPreflight) ||
  !/proofBoundary/.test(homepageEditionPreflight) ||
  !/archiveMirror/.test(homepageEditionPreflight) ||
  !/1 to 3 minutes/.test(homepageEditionPreflight) ||
  !/sourceRisk/.test(homepageEditionPreflight) ||
  !/overreadBoundary/.test(homepageEditionPreflight) ||
  !/sourceConcentration/.test(homepageEditionPreflight) ||
  !/docs\/homepage-edition-preflight\.md/.test(editorialChecklist) ||
  !/docs\/homepage-edition-preflight\.md/.test(updateRunChecklist) ||
  !/docs\/homepage-edition-preflight\.md/.test(candidateToNewsHandoff) ||
  !/Day 0[\s\S]*homepage-edition-preflight\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Homepage edition preflight must stay linked and preserve reader question, TOP3 use, source-boundary, mobile scan, proof-boundary, and archive-mirror checks.");
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
  !/2026-06-24 至 2026-07-23/.test(monthlyOptimizationSummary) ||
  !/已改善的方向/.test(monthlyOptimizationSummary) ||
  !/仍然薄弱的地方/.test(monthlyOptimizationSummary) ||
  !/下一步优先级/.test(monthlyOptimizationSummary) ||
  !/今日 TOP3/.test(monthlyOptimizationSummary) ||
  !/blocked-dns/.test(monthlyOptimizationSummary) ||
  !/人工事实判断/.test(monthlyOptimizationSummary) ||
  !/避免重复劳动/.test(monthlyOptimizationSummary) ||
  !/Day 0 至 Day 29/.test(monthlyOptimizationSummary) ||
  !/下一次有用任务是 Day 30/.test(monthlyOptimizationSummary) ||
  !/中文读者理解成本/.test(monthlyOptimizationSummary) ||
  !/vendor-narrative-promotion-rule\.md/.test(monthlyOptimizationSummary) ||
  !/stronger、weaker 还是 repeated/.test(monthlyOptimizationSummary) ||
  !/媒体 must-read/.test(monthlyOptimizationSummary)
) {
  errors.push("Monthly optimization summary must stay discoverable and cover improvements, weaknesses, and next priorities.");
}

if (
  !/docs\/optimization-log-archive-guide\.md/.test(readme) ||
  !/Optimization Log Archive Guide/.test(optimizationLogArchiveGuide) ||
  !/Archive Decision/.test(optimizationLogArchiveGuide) ||
  !/Archive File Shape/.test(optimizationLogArchiveGuide) ||
  !/Live Log After Archiving/.test(optimizationLogArchiveGuide) ||
  !/Archive Steps/.test(optimizationLogArchiveGuide) ||
  !/Stop Conditions/.test(optimizationLogArchiveGuide) ||
  !/Compact Log Note/.test(optimizationLogArchiveGuide) ||
  !/calendar quarter/.test(optimizationLogArchiveGuide) ||
  !/120 recent run entries/.test(optimizationLogArchiveGuide) ||
  !/docs\/optimization-decision-index\.md/.test(optimizationLogArchiveGuide) ||
  !/Optimization-log archive: rule-added/.test(optimizationLogArchiveGuide) ||
  !/Day 13[\s\S]*optimization-log-archive-guide\.md/.test(optimizationDecisionIndex)
) {
  errors.push("Optimization log growth must have a quarterly archive decision guide linked from README and the decision index.");
}

if (
  !/docs\/optimization-decision-index\.md/.test(readme) ||
  !/Recent Decision Index/.test(optimizationDecisionIndex) ||
  !/2026-08-10 through 2026-09-08/.test(optimizationDecisionIndex) ||
  !/Phase 1, Homepage Edition Quality/.test(optimizationDecisionIndex) ||
  !/Previous Day 27[\s\S]*vendor-narrative-promotion-rule\.md/.test(optimizationDecisionIndex) ||
  !/Previous Day 28[\s\S]*vendor-narrative-promotion-rule\.md[\s\S]*guard/.test(optimizationDecisionIndex) ||
  !/Previous Day 29[\s\S]*monthly-optimization-summary\.md/.test(optimizationDecisionIndex) ||
  !/Previous Day 30[\s\S]*optimization-plan\.md/.test(optimizationDecisionIndex) ||
  !/Day 0[\s\S]*homepage-edition-preflight\.md/.test(optimizationDecisionIndex) ||
  !/Day 1[\s\S]*readerFrame\.mobile/.test(optimizationDecisionIndex) ||
  !/Day 2[\s\S]*briefing\.summary[\s\S]*deepBriefing\.overview/.test(optimizationDecisionIndex) ||
  !/Day 3[\s\S]*coverageMix/.test(optimizationDecisionIndex) ||
  !/Day 4[\s\S]*categories\[\]\.description/.test(optimizationDecisionIndex) ||
  !/Day 5[\s\S]*editorialInterpretation/.test(optimizationDecisionIndex) ||
  !/Day 6[\s\S]*Omitted planned topics/.test(optimizationDecisionIndex) ||
  !/Continue with Day 7/.test(optimizationDecisionIndex) ||
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
  !/mobile-reader-frame/.test(appJs) ||
  !/\.reader-frame/.test(styles) ||
  !/readerFrame\.mobile/.test(validateDataJs) ||
  !/readerFrame.*mobile/.test(newsDataFormat) ||
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
  !/id="overreadBoundary"/.test(html) ||
  !/const overreadBoundary = document\.querySelector\("#overreadBoundary"\);/.test(appJs) ||
  !/function renderOverreadBoundary/.test(appJs) ||
  !/function validateOverreadBoundary/.test(appJs) ||
  !/edition\.overreadBoundary/.test(appJs) ||
  !/overreadBoundary/.test(validateDataJs) ||
  !/overread boundary/.test(newsDataFormat) ||
  !/不要把本期读成全市场结论/.test(newsJson) ||
  !/\.overread-boundary/.test(styles)
) {
  errors.push("Homepage feed metadata must render and validate an edition-level do-not-overread note when one evidence mode dominates.");
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
  !/validateHomepageCaveatCopyAudit/.test(validateDataJs) ||
  !/validateShortBatchEditorialNote/.test(validateDataJs) ||
  !/readerFrame[\s\S]*sourceRisk[\s\S]*trendNotes/.test(validateDataJs) ||
  !/homepage caveat-copy duplication/.test(newsDataFormat) ||
  !/short-batch note/.test(newsDataFormat) ||
  !/少于 10 条是质量门槛结果/.test(newsDataFormat) ||
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
  !/id="companyContinuity"/.test(html) ||
  !/const companyContinuity = document\.querySelector\("#companyContinuity"\);/.test(appJs) ||
  !/function renderCompanyContinuity/.test(appJs) ||
  !/edition\.companyContinuity/.test(appJs) ||
  !/function validateCompanyContinuity/.test(validateDataJs) ||
  !/\.company-continuity/.test(styles) ||
  !/companyContinuity/.test(newsDataFormat) ||
  !/公司连续观察/.test(html) ||
  !/companyContinuity/.test(newsJson)
) {
  errors.push("Homepage feed metadata must render and validate recurring company continuity notes.");
}

if (
  !/id="topicContinuity"/.test(html) ||
  !/const topicContinuity = document\.querySelector\("#topicContinuity"\);/.test(appJs) ||
  !/function renderTopicContinuity/.test(appJs) ||
  !/edition\.topicContinuity/.test(appJs) ||
  !/function validateTopicContinuity/.test(validateDataJs) ||
  !/\.topic-continuity/.test(styles) ||
  !/topicContinuity/.test(newsDataFormat) ||
  !/主题连续观察/.test(html) ||
  !/topicContinuity/.test(newsJson)
) {
  errors.push("Homepage feed metadata must render and validate recurring topic continuity notes.");
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
  !/omissionType/.test(appJs) ||
  !/emptyReason/.test(appJs) ||
  !/omissionBoundary/.test(appJs) ||
  !/promotionThreshold/.test(appJs) ||
  !/fallback/.test(appJs) ||
  !/function isUsefulOmittedTopicFallback/.test(appJs) ||
  !/where to read next without adding unsupported fresh facts/.test(appJs) ||
  !/归档或标签页/.test(appJs) ||
  !/为什么现在看/.test(appJs) ||
  !/无新来源事实/.test(appJs) ||
  !/未入选原因/.test(appJs) ||
  !/不要误读为/.test(appJs) ||
  !/入选门槛/.test(appJs) ||
  !/替代阅读/.test(appJs) ||
  !/class="empty-topic"/.test(appJs) ||
  !/\.topic-groups/.test(styles) ||
  !/\.topic-groups span b/.test(styles) ||
  !/\.topic-groups span\.empty-topic/.test(styles) ||
  !/\.topic-groups span em/.test(styles) ||
  !/explicit omission status/.test(newsDataFormat) ||
  !/Omitted-topic `fallback` copy should point readers to the archive, tag page, historical context, or current already-selected related topics as background only/.test(newsDataFormat) ||
  !/omittedTopicFallback/.test(homepageEditionPreflight) ||
  !/action-oriented coverage labels and topic meanings/.test(newsDataFormat) ||
  !/coverageMix tiny-bucket merging/.test(newsDataFormat) ||
  !/coverageMixShape/.test(homepageEditionPreflight) ||
  !/category's visible items/.test(newsDataFormat) ||
  !/stale anchors from another category/.test(newsDataFormat) ||
  !/function isActionOrientedCoverageLabel/.test(appJs) ||
  !/function isActionOrientedCoverageLabel/.test(validateDataJs) ||
  !/function validateCoverageMixShape/.test(validateDataJs)
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
