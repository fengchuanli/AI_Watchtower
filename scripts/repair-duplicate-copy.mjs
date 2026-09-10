// 修复自动化流水线反复给同一字段追加后缀造成的文本重复。
// 用法：node scripts/repair-duplicate-copy.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const SKIP_FIELDS = new Set([
  "id",
  "sourceUrl",
  "originalUrl",
  "publishedAt",
  "sourceId",
  "time",
  "category",
  "label",
]);

export function collapseRepeats(text) {
  let previous = null;
  let current = String(text);

  // 连续重复的多字片段（>=6 字）折叠成一份
  while (previous !== current) {
    previous = current;
    current = current.replace(/(.{6,}?)\1+/gu, "$1");
  }

  // 连续重复 3 次以上的单个汉字折叠成一个
  return current.replace(/([一-鿿])\1{2,}/gu, "$1");
}

// readerUse 的正确形态是「<whoShouldCare>可用该信号：<读者动作>」，
// 出现多个「可用该信号：」说明前缀被重复追加过。
export function rebuildReaderUse(readerUse, whoShouldCare) {
  const marker = "可用该信号：";
  const parts = String(readerUse).split(marker);

  if (parts.length <= 2 || !whoShouldCare) {
    return readerUse;
  }

  const payload = parts[parts.length - 1];
  const audience = String(whoShouldCare).replace(/。$/, "");
  return `${audience}。${marker}${payload}`;
}

export function repairItem(item) {
  const changes = [];

  if (item.readerUse) {
    const rebuilt = rebuildReaderUse(item.readerUse, item.whoShouldCare);
    if (rebuilt !== item.readerUse) {
      changes.push(["readerUse", item.readerUse, rebuilt]);
      item.readerUse = rebuilt;
    }
  }

  for (const [key, value] of Object.entries(item)) {
    if (typeof value !== "string" || SKIP_FIELDS.has(key)) {
      continue;
    }

    const collapsed = collapseRepeats(value);
    if (collapsed !== value) {
      changes.push([key, value, collapsed]);
      item[key] = collapsed;
    }
  }

  return changes;
}

function repairFile(path, dryRun) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  const items = data.items || (data.editions || []).flatMap((edition) => edition.items || []);
  let fixed = 0;

  for (const item of items) {
    fixed += repairItem(item).length;
  }

  if (fixed && !dryRun) {
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  console.log(`${path}: 修复 ${fixed} 个字段${dryRun ? "（dry run，未写入）" : ""}`);
  return fixed;
}

const dryRun = process.argv.includes("--dry");
const total = ["data/news.json", "data/news-history.json"].reduce(
  (sum, path) => sum + repairFile(path, dryRun),
  0,
);
console.log(`合计 ${total} 个字段`);
