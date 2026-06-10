import { readFileSync } from "node:fs";

const sourceRegistry = JSON.parse(readFileSync("data/sources.json", "utf8"));
const newsFeed = JSON.parse(readFileSync("data/news.json", "utf8"));

const sourceIds = new Set(sourceRegistry.sources.map((source) => source.id));
const allowedCategories = new Set(["all", "model", "product", "research", "policy"]);
const requiredNewsFields = [
  "id",
  "category",
  "label",
  "title",
  "body",
  "impact",
  "source",
  "sourceId",
  "sourceUrl",
  "provenance",
  "trustLevel",
  "publishedAt",
  "time",
];

const errors = [];

if (!Array.isArray(sourceRegistry.sources) || !sourceRegistry.sources.length) {
  errors.push("data/sources.json must include at least one source.");
}

if (!Array.isArray(newsFeed.items)) {
  errors.push("data/news.json must include an items array.");
}

for (const item of newsFeed.items || []) {
  for (const field of requiredNewsFields) {
    if (!item[field]) {
      errors.push(`${item.id || "unknown item"} is missing ${field}.`);
    }
  }

  if (item.category && !allowedCategories.has(item.category)) {
    errors.push(`${item.id} has unsupported category ${item.category}.`);
  }

  if (item.sourceId && !sourceIds.has(item.sourceId)) {
    errors.push(`${item.id} references unknown sourceId ${item.sourceId}.`);
  }

  if (item.sourceUrl) {
    try {
      new URL(item.sourceUrl);
    } catch {
      errors.push(`${item.id} has invalid sourceUrl ${item.sourceUrl}.`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${newsFeed.items.length} news items against ${sourceRegistry.sources.length} sources.`);
