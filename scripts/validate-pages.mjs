import { readFileSync } from "node:fs";

const notFoundHtml = readFileSync("404.html", "utf8");
const errors = [];

const requirements = [
  [/<html\b[^>]*\blang="zh-CN"/, "404.html must declare the page language."],
  [/<meta\b(?=[^>]*\bname="viewport")(?=[^>]*\bcontent="width=device-width, initial-scale=1")[^>]*>/s, "404.html must include responsive viewport metadata."],
  [/<meta\b(?=[^>]*\bname="robots")(?=[^>]*\bcontent="noindex")[^>]*>/s, "404.html must prevent error pages from being indexed."],
  [/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/styles\.css")[^>]*>/s, "404.html must reuse the root site stylesheet."],
  [/<main\b(?=[^>]*\bid="main-content")[^>]*>/s, "404.html must include a main landmark."],
  [/<a\b(?=[^>]*\bhref="\.\/")[^>]*>/s, "404.html must provide a relative link back to the site root."],
  [/GitHub Pages 项目路径/, "404.html must explain project-site path recovery in Chinese."],
  [/<div\b(?=[^>]*\bclass="feed-state-actions")(?=[^>]*\baria-label="页面未找到后的站内恢复入口")[^>]*>/s, "404.html must group recovery links with a clear accessible label."],
  [/<a\b(?=[^>]*\bhref="\.\/all-news\.html")[^>]*>查看全部 AI 新闻<\/a>/s, "404.html must link to all-news for AI news recovery."],
  [/<a\b(?=[^>]*\bhref="\.\/archive\.html")[^>]*>查看期次归档<\/a>/s, "404.html must link to the edition archive."],
  [/<a\b(?=[^>]*\bhref="\.\/data\/news\.json")[^>]*>打开最新数据<\/a>/s, "404.html must link to the public current data file."],
];

for (const [pattern, message] of requirements) {
  if (!pattern.test(notFoundHtml)) {
    errors.push(message);
  }
}

if (/(?:href|src)="\/(?!\/)/.test(notFoundHtml)) {
  errors.push("404.html must not use root-absolute asset links that break project-site paths.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Validated GitHub Pages 404 fallback.");
