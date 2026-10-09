import { readFileSync } from "node:fs";

const errors = [];

const pageChecks = [
  {
    file: "index.html",
    label: "homepage",
    required: [
      [/<a class="skip-link" href="#main-content">跳到主要内容<\/a>/, "must keep the skip link."],
      [/<main\b(?=[^>]*\bid="main-content")[^>]*>/s, "must include the main landmark."],
      [/<a href="#today">今日重点<\/a>/, "must link to the current daily briefing."],
      [/<a href="#deep-briefing">深度简报<\/a>/, "must link to the deep briefing."],
      [/<a href="#feed">最新新闻流<\/a>/, "must link to the compact feed."],
      [/<a href="#explore">按目的阅读<\/a>/, "must link to purpose navigation."],
      [/<script src="\.\/app\.js"><\/script>/, "must load the homepage renderer."],
    ],
  },
  {
    file: "news-detail.html",
    label: "detail page",
    required: [
      [/<a class="skip-link" href="#main-content">跳到主要内容<\/a>/, "must keep the skip link."],
      [/<main\b(?=[^>]*\bid="main-content")(?=[^>]*\bclass="detail-page")[^>]*>/s, "must include the detail main landmark."],
      [/<article\b(?=[^>]*\bid="detailShell")(?=[^>]*\baria-live="polite")[^>]*>/s, "must expose the dynamic detail shell."],
      [/<a href="\.\/#feed">返回最新新闻流<\/a>/, "must return readers to the latest feed."],
      [/<script src="\.\/news-detail\.js"><\/script>/, "must load the detail renderer."],
    ],
  },
  {
    file: "all-news.html",
    label: "all-news page",
    required: [
      [/<main\b(?=[^>]*\bid="main-content")(?=[^>]*\bclass="all-news-page")[^>]*>/s, "must include the all-news main landmark."],
      [/<div\b(?=[^>]*\bid="historyCategoryFilters")(?=[^>]*\baria-label="按分类筛选历史 AI 新闻")[^>]*>/s, "must expose category filters."],
      [/<select id="historySort" aria-label="按新闻发布时间排序历史 AI 新闻">/, "must expose the history sort control."],
      [/<div\b(?=[^>]*\bid="historyList")(?=[^>]*\baria-label="历史 AI 新闻题目列表")[^>]*>/s, "must expose the history list."],
      [/<script src="\.\/all-news\.js"><\/script>/, "must load the all-news renderer."],
    ],
  },
  {
    file: "tags.html",
    label: "tag page",
    required: [
      [/<main\b(?=[^>]*\bid="main-content")(?=[^>]*\bclass="tag-page")[^>]*>/s, "must include the tag main landmark."],
      [/<div class="tag-tabs" id="tagTabs" aria-label="公司标签"><\/div>/, "must expose company tag tabs."],
      [/<div class="tag-results" id="tagResults" aria-live="polite">/, "must expose live tag results."],
      [/<script src="\.\/tags\.js"><\/script>/, "must load the tag renderer."],
    ],
  },
  {
    file: "archive.html",
    label: "archive page",
    required: [
      [/<main\b(?=[^>]*\bid="main-content")[^>]*>/s, "must include the main landmark."],
      [/<div class="library-grid archive-edition-grid" id="currentEditionGrid">/, "must expose the current edition grid."],
      [/<div class="library-grid archive-edition-grid" id="archiveEditionGrid">/, "must expose the published archive grid."],
      [/<script src="\.\/archive\.js"><\/script>/, "must load the archive renderer."],
    ],
  },
  {
    file: "404.html",
    label: "404 page",
    required: [
      [/<meta\b(?=[^>]*\bname="robots")(?=[^>]*\bcontent="noindex")[^>]*>/s, "must prevent error pages from being indexed."],
      [/GitHub Pages 项目路径/, "must explain project-site path recovery in Chinese."],
      [/<div\b(?=[^>]*\bclass="feed-state-actions")(?=[^>]*\baria-label="页面未找到后的站内恢复入口")[^>]*>/s, "must group recovery links with a clear accessible label."],
      [/<a\b(?=[^>]*\bhref="\.\/all-news\.html")[^>]*>查看全部 AI 新闻<\/a>/s, "must link to all-news for recovery."],
      [/<a\b(?=[^>]*\bhref="\.\/archive\.html")[^>]*>查看期次归档<\/a>/s, "must link to the edition archive."],
      [/<a\b(?=[^>]*\bhref="\.\/data\/news\.json")[^>]*>打开最新数据<\/a>/s, "must link to the public current data file."],
    ],
  },
];

const commonRequirements = [
  [/<html\b[^>]*\blang="zh-CN"/, "must declare zh-CN language."],
  [/<meta\b(?=[^>]*\bcharset="utf-8")[^>]*>/s, "must declare UTF-8."],
  [/<meta\b(?=[^>]*\bname="viewport")(?=[^>]*\bcontent="width=device-width, initial-scale=1")[^>]*>/s, "must include responsive viewport metadata."],
  [/<meta\b(?=[^>]*\bname="color-scheme")(?=[^>]*\bcontent="dark")[^>]*>/s, "must declare dark color scheme."],
  [/<title>[^<]*AI Watchtower[^<]*<\/title>/, "must keep an AI Watchtower title."],
  [/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/styles\.css")[^>]*>/s, "must reuse the root site stylesheet."],
  [/<header class="site-header">/, "must include the site header."],
  [/<a class="brand" href="\.\/"/, "must use a project-site-safe brand link."],
];

function checkBalancedTags(html, file) {
  const stack = [];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
  const tagPattern = /<\/?([a-z][a-z0-9-]*)(?:\s[^>]*)?>/gi;
  let match;

  while ((match = tagPattern.exec(html))) {
    const raw = match[0];
    const name = match[1].toLowerCase();
    if (raw.startsWith("<!")) {
      continue;
    }
    if (voidTags.has(name) || raw.endsWith("/>")) {
      continue;
    }
    if (!raw.startsWith("</")) {
      stack.push({ name, raw });
      continue;
    }
    const open = stack.pop();
    if (!open || open.name !== name) {
      errors.push(`${file}: has an unbalanced </${name}> tag.`);
      return;
    }
  }

  if (stack.length) {
    const open = stack.at(-1);
    errors.push(`${file}: has an unclosed <${open.name}> tag.`);
  }
}

for (const page of pageChecks) {
  const html = readFileSync(page.file, "utf8");

  if (!html.startsWith("<!doctype html>")) {
    errors.push(`${page.file}: must start with <!doctype html>.`);
  }
  if (/(?:href|src)="\/(?!\/)/.test(html)) {
    errors.push(`${page.file}: must not use root-absolute asset links that break project-site paths.`);
  }

  checkBalancedTags(html, page.file);

  for (const [pattern, message] of commonRequirements) {
    if (!pattern.test(html)) {
      errors.push(`${page.file}: ${message}`);
    }
  }
  for (const [pattern, message] of page.required) {
    if (!pattern.test(html)) {
      errors.push(`${page.file}: ${page.label} ${message}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${pageChecks.length} static page shells and GitHub Pages recovery links.`);
