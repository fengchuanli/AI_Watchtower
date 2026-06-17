import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const html = readFileSync("index.html", "utf8");
const detailHtml = readFileSync("news-detail.html", "utf8");
const allNewsHtml = readFileSync("all-news.html", "utf8");
const archiveHtml = readFileSync("archive.html", "utf8");
const notFoundHtml = readFileSync("404.html", "utf8");
const appJs = readFileSync("app.js", "utf8");
const detailJs = readFileSync("news-detail.js", "utf8");
const allNewsJs = readFileSync("all-news.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
const errors = [];
const repositoryRoot = process.cwd();
const htmlPages = new Map([
  ["index.html", html],
  ["news-detail.html", detailHtml],
  ["all-news.html", allNewsHtml],
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

const skipLinkMatch = html.match(/<a\b(?=[^>]*\bclass="skip-link")(?=[^>]*\bhref="#([^"]+)")[^>]*>/);

if (!skipLinkMatch) {
  errors.push("index.html is missing a skip link to the main content.");
} else {
  const targetId = skipLinkMatch[1];
  const targetPattern = new RegExp(`<main\\b(?=[^>]*\\bid="${targetId}")[^>]*>`, "s");

  if (!targetPattern.test(html)) {
    errors.push(`Skip link target #${targetId} does not match the main element.`);
  }
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

  if (
    !/<a\b(?=[^>]*\bhref="https:\/\/github\.com\/fengchuanli\/AI_Watchtower\/commits\/main\/")(?=[^>]*\btarget="_blank")(?=[^>]*\brel="noopener noreferrer")[^>]*>/s.test(
      updatesSection,
    )
  ) {
    errors.push("Update access section must link safely to the public main branch history.");
  }
}

if (!/const detailUrl = `\.\/news-detail\.html\?id=\$\{encodeURIComponent\(item\.id\)\}`;/.test(appJs)) {
  errors.push("Homepage news cards must link to the in-site news detail page.");
}

if (!/latestCapture\.textContent = `最新抓取：/.test(appJs)) {
  errors.push("Homepage must clearly label the latest captured news batch.");
}

if (!/<script src="\.\/all-news\.js"><\/script>/.test(allNewsHtml)) {
  errors.push("all-news.html must load the history renderer.");
}

if (
  !/fetch\("\.\/data\/news-history\.json"/.test(allNewsJs) ||
  !/const detailUrl = `\.\/news-detail\.html\?id=\$\{encodeURIComponent\(item\.id\)\}&edition=\$\{encodeURIComponent\(edition\.id\)\}`;/.test(
    allNewsJs,
  )
) {
  errors.push("All-news page must read news-history.json and link entries to in-site detail pages with edition IDs.");
}

if (
  !/const detailLabel = escapeHtml\(`查看站内解读：\$\{item\.title\}`\);/.test(appJs) ||
  !/<a class="card-detail-link" href="\$\{detailUrl\}" aria-label="\$\{detailLabel\}">/.test(appJs) ||
  !/<a class="reference-link" href="\$\{detailUrl\}" aria-label="\$\{detailLabel\}">查看站内解读<\/a>/.test(appJs)
) {
  errors.push("Homepage detail links must expose item-specific accessible labels.");
}

if (/class="reference-link" href="\$\{escapeHtml\(item\.sourceUrl\)\}"/.test(appJs)) {
  errors.push("Homepage news cards must not link directly to original sources.");
}

if (!/<script src="\.\/news-detail\.js"><\/script>/.test(detailHtml)) {
  errors.push("news-detail.html must load the detail renderer.");
}

if (!/href="\$\{escapeHtml\(item\.sourceUrl\)\}" target="_blank" rel="noopener noreferrer"/.test(detailJs)) {
  errors.push("News detail page must keep original source links safe and secondary.");
}

if (
  !/const requiredDetailFields = \[[\s\S]*"counterEvidence"[\s\S]*"time"[\s\S]*\];/.test(detailJs) ||
  !/"detailWhyRanked"/.test(detailJs) ||
  !/validateDetailFeed\(currentFeed\);/.test(detailJs) ||
  !/function validateDetailItem\(item\) \{[\s\S]*requiredDetailFields\.find/.test(detailJs) ||
  !/validateDetailItem\(item\);\s*document\.title/.test(detailJs)
) {
  errors.push("News detail page must validate required display fields before rendering.");
}

if (!/fetchJson\("\.\/data\/news-history\.json"\)/.test(detailJs) || !/function findHistoryContext/.test(detailJs)) {
  errors.push("News detail page must fall back to the historical intelligence file for archived items.");
}

if (!/function sortNewsItems/.test(appJs) || !/news = sortNewsItems\(data\.items\)/.test(appJs)) {
  errors.push("Homepage news items must be sorted newest first before rendering.");
}

if (!/function sortHistoryEditions/.test(allNewsJs) || !/function sortHistoryItems/.test(allNewsJs)) {
  errors.push("All-news page must sort editions and items newest first before rendering.");
}

if (!/aria-label="\$\{escapeHtml\(`\$\{item\.source\}（在新窗口打开）`\)\}"/.test(detailJs)) {
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
  !/querySelector\("\.feed-retry"\)\?\.addEventListener\("click", loadNews\)/.test(appJs)
) {
  errors.push("News loading errors must provide a working retry button.");
}

if (!/main section\[id\]\s*\{[^}]*scroll-margin-top:/s.test(styles)) {
  errors.push("Anchored homepage sections must clear the sticky header.");
}

if (!/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?scroll-behavior:\s*auto;/s.test(styles)) {
  errors.push("Site styles must disable smooth scrolling when reduced motion is preferred.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Validated site metadata, ${localReferenceCount} local references, and static page link targets.`,
);
