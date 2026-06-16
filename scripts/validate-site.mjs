import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

const html = readFileSync("index.html", "utf8");
const detailHtml = readFileSync("news-detail.html", "utf8");
const appJs = readFileSync("app.js", "utf8");
const detailJs = readFileSync("news-detail.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
const errors = [];
const repositoryRoot = process.cwd();

const requiredMetaTags = [
  ["name", "description"],
  ["name", "application-name"],
  ["name", "theme-color"],
  ["property", "og:type"],
  ["property", "og:locale"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:image"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
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

const pageRefs = Array.from(html.matchAll(/\b(?:href|src)="([^"]+)"/g), (match) => match[1]);
const localFileRefs = new Set();
const pageIds = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));

for (const pageRef of pageRefs) {
  if (pageRef.startsWith("#")) {
    const targetId = pageRef.slice(1);

    if (targetId && !pageIds.has(targetId)) {
      errors.push(`Same-page link target does not exist: ${pageRef}`);
    }

    continue;
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(pageRef)) {
    continue;
  }

  if (pageRef.startsWith("/")) {
    errors.push(`Root-absolute reference breaks GitHub project sites: ${pageRef}`);
    continue;
  }

  const localRef = pageRef.split(/[?#]/, 1)[0];

  if (!localRef) {
    continue;
  }

  localFileRefs.add(localRef);
  const resolvedRef = resolve(repositoryRoot, localRef);
  const relativeRef = relative(repositoryRoot, resolvedRef);

  if (relativeRef === ".." || relativeRef.startsWith(`..${sep}`) || isAbsolute(relativeRef)) {
    errors.push(`Local reference escapes the repository root: ${pageRef}`);
  } else if (!existsSync(resolvedRef)) {
    errors.push(`Referenced local path does not exist: ${pageRef}`);
  }
}

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
  !/<noscript>[\s\S]*?<a\b(?=[^>]*\bhref="\.\/data\/news\.json")[^>]*>[\s\S]*?<\/noscript>/.test(
    newsGridMatch[0],
  )
) {
  errors.push("News feed must include a no-JavaScript fallback linking to data/news.json.");
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

  if (
    !/<a\b(?=[^>]*\bhref="https:\/\/github\.com\/fengchuanli\/AI_Watchtower\/commits\/main\/")(?=[^>]*\btarget="_blank")(?=[^>]*\brel="noopener noreferrer")[^>]*>/s.test(
      updatesSection,
    )
  ) {
    errors.push("Update access section must link safely to the public main branch history.");
  }
}

if (!/href="\.\/news-detail\.html\?id=\$\{encodeURIComponent\(item\.id\)\}"/.test(appJs)) {
  errors.push("Homepage news cards must link to the in-site news detail page.");
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

if (!/aria-label="\$\{escapeHtml\(`\$\{item\.source\}（在新窗口打开）`\)\}"/.test(detailJs)) {
  errors.push("News detail source links must announce that they open in a new window.");
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
  `Validated site metadata, ${localFileRefs.size} local references, and same-page link targets.`,
);
