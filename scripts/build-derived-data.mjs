// 由 data/news-history.json 生成列表页专用的精简索引。
// 归档全文 4.5MB，但 all-news / tags / archive 三个页面只需要题目层字段。
// 用法：node scripts/build-derived-data.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SOURCE = "data/news-history.json";
const TARGET = "data/news-index.json";
const TODAY_TARGET = "data/news-today.json";
const FEED = "data/news.json";

// 列表页真正读到的字段（all-news.js / tags.js 的并集）
const ITEM_FIELDS = [
  "id",
  "title",
  "category",
  "label",
  "time",
  "publishedAt",
  "body",
  "impact",
  "source",
  "sourceId",
  "sourceUrl",
  "sourceRole",
  "trustLevel",
];

const EDITION_FIELDS = ["id", "date", "timezone", "archiveLabel", "archiveStatus", "itemCount", "statusLabel"];

function buildIndex(history) {
  const editions = history.editions.map((edition) => {
    const meta = {};

    for (const field of EDITION_FIELDS) {
      if (edition[field] !== undefined) {
        meta[field] = edition[field];
      }
    }

    meta.items = (edition.items || []).map((item) => {
      const slim = {};

      for (const field of ITEM_FIELDS) {
        if (item[field] !== undefined) {
          slim[field] = item[field];
        }
      }

      // tags.js 只用来源边界的第一个可用值，构建期先算好，省掉三个长字段
      const caveat = item.claimBoundary || item.provenance || item.nextCheck;

      if (caveat) {
        slim.sourceCaveat = caveat;
      }

      return slim;
    });

    if (meta.itemCount === undefined) {
      meta.itemCount = meta.items.length;
    }

    return meta;
  });

  return {
    version: 1,
    generatedFrom: SOURCE,
    updatedAt: history.updatedAt,
    totalItems: history.totalItems,
    editions,
  };
}

// 首页的 TOP3 只需要"同一天"的完整条目，没必要为此下载 4.5MB 全量归档。
function buildToday(history, feed) {
  const targetDate = feed.edition?.date || history.updatedAt;

  return {
    version: 1,
    generatedFrom: SOURCE,
    updatedAt: history.updatedAt,
    date: targetDate,
    editionCount: (history.editions || []).length,
    totalItems: history.totalItems,
    editions: (history.editions || []).filter((edition) => edition.date === targetDate),
  };
}

const history = JSON.parse(readFileSync(SOURCE, "utf8"));
const feed = JSON.parse(readFileSync(FEED, "utf8"));
const index = buildIndex(history);
const today = buildToday(history, feed);
const serialized = `${JSON.stringify(index, null, 2)}\n`;
const todaySerialized = `${JSON.stringify(today, null, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!existsSync(TARGET)) {
    console.error(`${TARGET} 缺失，请运行 node scripts/build-derived-data.mjs`);
    process.exit(1);
  }

  if (readFileSync(TARGET, "utf8") !== serialized) {
    console.error(`${TARGET} 与 ${SOURCE} 不同步，请运行 node scripts/build-derived-data.mjs`);
    process.exit(1);
  }

  if (!existsSync(TODAY_TARGET) || readFileSync(TODAY_TARGET, "utf8") !== todaySerialized) {
    console.error(`${TODAY_TARGET} 与 ${SOURCE} 不同步，请运行 node scripts/build-derived-data.mjs`);
    process.exit(1);
  }

  console.log(`${TARGET}、${TODAY_TARGET} 与 ${SOURCE} 同步。`);
  process.exit(0);
}

writeFileSync(TARGET, serialized, "utf8");
writeFileSync(TODAY_TARGET, todaySerialized, "utf8");

const before = readFileSync(SOURCE).length;
const after = Buffer.byteLength(serialized);
const todayAfter = Buffer.byteLength(todaySerialized);
console.log(
  `${TARGET}: ${index.editions.length} 期 / ${index.totalItems} 条，` +
    `${Math.round(after / 1024)} KB（源文件 ${Math.round(before / 1024)} KB，减少 ${Math.round((1 - after / before) * 100)}%）`,
);
console.log(
  `${TODAY_TARGET}: ${today.editions.length} 期（${today.date}），${Math.round(todayAfter / 1024)} KB`,
);
