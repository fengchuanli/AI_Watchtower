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
      sourceBackedFact: candidate.sourceBackedFact || candidate.freshSourceFact || "",
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
    sourceBackedFact: item.sourceBackedFact || item.freshSourceFact || "",
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

function getTriageDecision(candidate, report) {
  const isSameCandidate = (record) =>
    record.id === candidate.id &&
    record.sourceKey === candidate.sourceKey &&
    record.titleKey === candidate.titleKey;
  const sourceMatches = report.sourceMatches.filter((match) => isSameCandidate(match.candidate));
  const titleMatches = report.titleMatches.filter((match) => isSameCandidate(match.candidate));

  if (sourceMatches.length) {
    if (candidate.sourceBackedFact) {
      return {
        duplicateStatus: "repeated-url",
        draftingDecision: "hold",
        decisionReason:
          "hold-duplicate-review: 同一来源 URL 已出现；先核对该页面是否实质更新，并把新的来源事实写清楚。",
        nextAction: "核对页面更新时间与新动作；没有新来源事实则改为 reject-repeated-source-fact。",
      };
    }

    return {
      duplicateStatus: "repeated-url",
      draftingDecision: "reject",
      decisionReason:
        "reject-repeated-source-fact: 同一来源 URL 已在当前、归档或本批候选中出现，且未写明新的来源事实。",
      nextAction: "停止起草；仅当同一页面有可命名的实质更新时，重新以 hold-duplicate-review 进入核对。",
    };
  }

  if (titleMatches.length) {
    return {
      duplicateStatus: "near-title-review",
      draftingDecision: "hold",
      decisionReason:
        "hold-duplicate-review: 标题接近当前、归档或同批条目；先逐项对比来源直接支持的新事实。",
      nextAction: "写明新的官方公告、filing、审计、模型卡、客户指标、监管文本、论文修订或独立评测；否则不进入起草。",
    };
  }

  return {
    duplicateStatus: "manual-clear",
    draftingDecision: "continue-source-gate",
    decisionReason: "重复核查未发现 URL 或近似标题命中；仍需完成来源、证据边界、版权和批次结构检查。",
    nextAction: "继续来源门槛；这不是自动发布许可。",
  };
}

function printTriageQueue(candidates, report) {
  console.log("## Triage Queue");
  console.log("");
  console.log("Copy the matching four lines into the intake scratch record; the recommended decision only resolves duplicate risk, not source, copyright, or batch gates.");
  console.log("");

  for (const candidate of candidates) {
    const record = makeRecord(candidate, "candidate");
    const triage = getTriageDecision(record, report);
    console.log(`- ${describeRecord(record)}${record.title ? `｜${record.title}` : ""}`);
    console.log(`  duplicateStatus: ${triage.duplicateStatus}`);
    console.log(`  draftingDecision: ${triage.draftingDecision}`);
    console.log(`  decisionReason: ${triage.decisionReason}`);
    console.log(`  nextAction: ${triage.nextAction}`);
  }

  console.log("");
}

function printReport(report) {
  const duplicateCount = report.sourceMatches.length + report.titleMatches.length;

  console.log("# Duplicate Candidate Report");
  console.log("");
  console.log(
    "Review actions: repeated-url usually rejects unless the same page has a clearly updated source-backed fact; near-title-review must be held until the editor names the fresh source action; fresh-source-fact can draft only when sourceBackedFact states that new action and proofBoundary keeps the remaining uncertainty visible.",
  );
  console.log("");

  printTriageQueue(report.candidates, report);

  if (!duplicateCount) {
    console.log("No repeated source URLs or near-matching titles found.");
    console.log("Action: mark duplicateStatus as manual-clear if current/history were also checked; continue the remaining source gate before drafting.");
    return;
  }

  if (report.sourceMatches.length) {
    console.log("## Repeated Source URLs");
    for (const match of report.sourceMatches) {
      console.log(`- ${describeRecord(match.candidate)} matches ${describeRecord(match.record)}`);
      console.log(`  URL: ${match.candidate.sourceUrl}`);
      if (match.candidate.sourceBackedFact) {
        console.log(`  Candidate sourceBackedFact: ${match.candidate.sourceBackedFact}`);
      }
      console.log(
        "  Action: set duplicateStatus=repeated-url; reject-repeated-source-fact unless the page itself was materially updated and the new source action can be named.",
      );
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
      if (match.candidate.sourceBackedFact) {
        console.log(`  Candidate sourceBackedFact: ${match.candidate.sourceBackedFact}`);
      }
      console.log(
        "  Action: set duplicateStatus=near-title-review; hold-duplicate-review until the exact source-backed fact is compared. Clear as fresh-source-fact only when the candidate names a new official announcement, filing, audit result, model card, customer metric, regulator text, paper revision, or independent benchmark.",
      );
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

  printReport({ ...report, candidates });
  process.exit(report.sourceMatches.length || report.titleMatches.length ? 1 : 0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
