import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const appJs = readFileSync("app.js", "utf8");
const styles = readFileSync("styles.css", "utf8");
const errors = [];

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

const localAssetRefs = Array.from(
  html.matchAll(/<(?:meta|link)\b[^>]*(?:content|href)="(\.\/assets\/[^"]+)"/g),
  (match) => match[1].replace("./", ""),
);

for (const assetRef of new Set(localAssetRefs)) {
  if (!existsSync(assetRef)) {
    errors.push(`Referenced asset does not exist: ${assetRef}`);
  }
}

if (/<a\b[^>]*\bhref="#"/s.test(html)) {
  errors.push('index.html must not include placeholder links with href="#".');
}

const subscribeFormMatch = html.match(/<form\b(?=[^>]*\bid="subscribeForm")[^>]*>[\s\S]*?<\/form>/);

if (!subscribeFormMatch) {
  errors.push("index.html is missing the newsletter subscription form.");
} else {
  const subscribeForm = subscribeFormMatch[0];

  if (!/<input\b(?=[^>]*\bid="email")(?=[^>]*\btype="email")(?=[^>]*\brequired\b)[^>]*>/s.test(subscribeForm)) {
    errors.push("Newsletter form must include a required email input.");
  }

  if (!/<p\b(?=[^>]*\bid="subscribeStatus")(?=[^>]*\brole="status")(?=[^>]*\baria-live="polite")[^>]*>/s.test(subscribeForm)) {
    errors.push("Newsletter form must include a polite live status message.");
  }
}

if (!/target="_blank"\s+rel="noopener noreferrer"/.test(appJs)) {
  errors.push("Rendered news source links must include rel=\"noopener noreferrer\" for new tabs.");
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

console.log(`Validated site metadata and ${new Set(localAssetRefs).size} local asset reference.`);
