import { readFileSync } from "node:fs";

const historyPath = "data/news-history.json";
const currentPath = "data/news.json";
const similarityThreshold = 0.86;
const minComparableTitleLength = 14;

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON from ${path}: ${error.message}`);
  }
}

function normalizeSourceKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

function normalizeTitleKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[“”"‘’'《》<>()[\]（）【】{}]/g, "")
    .replace(/[，。！？、：；,.!?:;\s-]+/g, "");
}

function getTitleTokens(titleKey) {
  const cjkChars = [...titleKey].filter((char) => /\p{Script=Han}/u.test(char));
  const latinWords = titleKey.match(/[a-z0-9]{2,}/g) || [];
  const cjkBigrams = [];

  for (let index = 0; index < cjkChars.length - 1; index += 1) {
    cjkBigrams.push(`${cjkChars[index]}${cjkChars[index + 1]}`);
  }

  return new Set([...cjkBigrams, ...latinWords]);
}

function getTitleSimilarity(firstTitleKey, secondTitleKey) {
  if (!firstTitleKey || !secondTitleKey) {
    return 0;
  }

  if (firstTitleKey === secondTitleKey) {
    return 1;
  }

  const firstTokens = getTitleTokens(firstTitleKey);
  const secondTokens = getTitleTokens(secondTitleKey);

  if (!firstTokens.size || !secondTokens.size) {
    return 0;
  }

  const sharedTokenCount = [...firstTokens].filter((token) => secondTokens.has(token)).length;
  const unionTokenCount = new Set([...firstTokens, ...secondTokens]).size;

  return sharedTokenCount / unionTokenCount;
}

function getCandidateItems(candidatePayload) {
  const candidates = Array.isArray(candidatePayload) ? candidatePayload : candidatePayload.candidates;

  if (!Array.isArray(candidates)) {
    throw new Error("Candidate file must be a JSON array or an object with a candidates array.");
  }

  return candidates.map((candidate, index) => {
    const sourceUrl = candidate.sourceUrl || candidate.originalUrl || candidate.url || "";
    const title = candidate.title || candidate.headline || "";

    return {
      id: candidate.id || `candidate-${index + 1}`,
      title,
      sourceUrl,
      source: candidate.source || candidate.sourceName || "",
      publishedAt: candidate.publishedAt || candidate.date || "",
    };
  });
}

function getPublishedItems(currentNews, history) {
  const currentItems = Array.isArray(currentNews.items)
    ? currentNews.items.map((item) => ({ ...item, editionId: currentNews.edition?.id || "current" }))
    : [];
  const historyItems = Array.isArray(history.editions)
    ? history.editions.flatMap((edition) =>
        Array.isArray(edition.items)
          ? edition.items.map((item) => ({ ...item, editionId: edition.id || "history" }))
          : [],
      )
    : [];

  const uniqueItems = new Map();

  for (const item of [...currentItems, ...historyItems]) {
    const uniqueKey = [
      item.id || "unknown",
      normalizeSourceKey(item.sourceUrl || item.originalUrl),
      normalizeTitleKey(item.title),
    ].join("|");

    if (!uniqueItems.has(uniqueKey)) {
      uniqueItems.set(uniqueKey, item);
    }
  }

  return [...uniqueItems.values()];
}

function makeRecord(item, kind) {
  return {
    kind,
    id: item.id || "unknown",
    title: item.title || "",
    titleKey: normalizeTitleKey(item.title),
    sourceUrl: item.sourceUrl || item.originalUrl || "",
    sourceKey: normalizeSourceKey(item.sourceUrl || item.originalUrl),
    source: item.source || "",
    publishedAt: item.publishedAt || "",
    editionId: item.editionId || "",
  };
}

function describeRecord(record) {
  const parts = [`${record.kind}:${record.id}`];

  if (record.editionId) {
    parts.push(`edition=${record.editionId}`);
  }

  if (record.publishedAt) {
    parts.push(`publishedAt=${record.publishedAt}`);
  }

  return parts.join(" ");
}

function buildReport(candidates, publishedItems) {
  const candidateRecords = candidates.map((item) => makeRecord(item, "candidate"));
  const publishedRecords = publishedItems.map((item) => makeRecord(item, "published"));
  const sourceMatches = [];
  const titleMatches = [];

  for (let leftIndex = 0; leftIndex < candidateRecords.length; leftIndex += 1) {
    const candidate = candidateRecords[leftIndex];
    const comparisonRecords = [
      ...candidateRecords.slice(leftIndex + 1),
      ...publishedRecords,
    ];

    if (candidate.sourceKey) {
      for (const record of comparisonRecords) {
        if (record.sourceKey && candidate.sourceKey === record.sourceKey) {
          sourceMatches.push({ candidate, record });
        }
      }
    }

    if (candidate.titleKey) {
      for (const record of comparisonRecords) {
        const similarity = getTitleSimilarity(candidate.titleKey, record.titleKey);

        if (
          similarity >= similarityThreshold &&
          Math.min(candidate.titleKey.length, record.titleKey.length) >= minComparableTitleLength
        ) {
          titleMatches.push({ candidate, record, similarity });
        }
      }
    }
  }

  return { sourceMatches, titleMatches };
}

function printUsage() {
  console.log(`Usage: node scripts/report-duplicate-candidates.mjs <candidate-file.json>

Candidate file format:
[
  {
    "id": "optional-id",
    "title": "Candidate title",
    "sourceUrl": "https://example.com/source",
    "publishedAt": "2026-06-24"
  }
]

The report compares candidate source URLs and near-matching titles against the candidate batch,
data/news.json, and data/news-history.json before drafting.`);
}

function printReport(report) {
  const duplicateCount = report.sourceMatches.length + report.titleMatches.length;

  console.log("# Duplicate Candidate Report");
  console.log("");

  if (!duplicateCount) {
    console.log("No repeated source URLs or near-matching titles found.");
    return;
  }

  if (report.sourceMatches.length) {
    console.log("## Repeated Source URLs");
    for (const match of report.sourceMatches) {
      console.log(`- ${describeRecord(match.candidate)} matches ${describeRecord(match.record)}`);
      console.log(`  URL: ${match.candidate.sourceUrl}`);
    }
    console.log("");
  }

  if (report.titleMatches.length) {
    console.log("## Near-Matching Titles");
    for (const match of report.titleMatches) {
      console.log(
        `- ${describeRecord(match.candidate)} resembles ${describeRecord(match.record)} (${Math.round(
          match.similarity * 100,
        )}% title overlap)`,
      );
      console.log(`  Candidate: ${match.candidate.title}`);
      console.log(`  Existing: ${match.record.title}`);
    }
  }
}

const candidatePath = process.argv[2];

if (!candidatePath || candidatePath === "--help" || candidatePath === "-h") {
  printUsage();
  process.exit(candidatePath ? 0 : 1);
}

try {
  const candidates = getCandidateItems(readJson(candidatePath));
  const publishedItems = getPublishedItems(readJson(currentPath), readJson(historyPath));
  const report = buildReport(candidates, publishedItems);

  printReport(report);
  process.exit(report.sourceMatches.length || report.titleMatches.length ? 1 : 0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
