import { readFileSync } from "node:fs";

const sourceRegistry = JSON.parse(readFileSync("data/sources.json", "utf8"));
const newsFeed = JSON.parse(readFileSync("data/news.json", "utf8"));
const newsHistory = JSON.parse(readFileSync("data/news-history.json", "utf8"));

const sourceIds = new Set(sourceRegistry.sources.map((source) => source.id));
const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.id, source]));
const allowedCategories = new Set(["all", "model", "product", "research", "tool", "funding", "policy"]);
const allowedSourceFamilies = new Set(["official", "research", "reliable_media", "community_signal"]);
const requiredNewsFields = [
  "id",
  "category",
  "label",
  "title",
  "body",
  "detailBody",
  "trend",
  "detailTrend",
  "whyRanked",
  "detailWhyRanked",
  "impact",
  "readerUse",
  "nextCheck",
  "followUpQuestions",
  "evidenceThreshold",
  "claimBoundary",
  "counterEvidence",
  "source",
  "sourceId",
  "sourceUrl",
  "sourceRole",
  "provenance",
  "trustLevel",
  "verificationStatus",
  "publishedAt",
  "time",
];
const requiredBriefingFields = ["label", "headline", "summary", "cta"];
const requiredDeepBriefingFields = ["kicker", "title", "subtitle", "dateLabel", "status", "overview"];
const requiredEditionFields = ["id", "date", "timezone", "archiveStatus", "archiveLabel", "note"];
const requiredCategoryFields = ["id", "label", "description"];
const allowedArchiveStatuses = new Set(["preview", "published"]);
const allowedVerificationStatuses = new Set(["结构样例，未作事实核验", "已核验"]);
const allowedSourceRoles = new Set(["官方核对", "研究原文", "媒体背景", "社区发现", "厂商主张"]);

const errors = [];

function sortSignature(items) {
  return items
    .map((item) => `${item.publishedAt || ""}|${item.title || ""}`)
    .join("\n");
}

function expectedSortSignature(items) {
  return [...items]
    .sort((a, b) => {
      const dateDiff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

      if (dateDiff) {
        return dateDiff;
      }

      return String(a.title).localeCompare(String(b.title), "zh-CN");
    })
    .map((item) => `${item.publishedAt || ""}|${item.title || ""}`)
    .join("\n");
}

function normalizeSourceKey(item) {
  return String(item.sourceUrl || item.id || "")
    .trim()
    .toLowerCase()
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

if (!Array.isArray(sourceRegistry.sources) || !sourceRegistry.sources.length) {
  errors.push("data/sources.json must include at least one source.");
}

if (!Array.isArray(newsFeed.items)) {
  errors.push("data/news.json must include an items array.");
} else if (sortSignature(newsFeed.items) !== expectedSortSignature(newsFeed.items)) {
  errors.push("data/news.json items must be sorted newest first by publishedAt.");
} else {
  const topRankingReasons = newsFeed.items.slice(0, 3).map((item) => item.whyRanked?.trim()).filter(Boolean);

  if (topRankingReasons.length !== Math.min(newsFeed.items.length, 3)) {
    errors.push("Top news items must include ranking reasons for the homepage TOP3.");
  }

  if (new Set(topRankingReasons).size !== topRankingReasons.length) {
    errors.push("Homepage TOP3 ranking reasons must be distinct.");
  }
}

if (newsFeed.sourceCount !== sourceRegistry.sources.length) {
  errors.push("data/news.json sourceCount must match data/sources.json sources.length.");
}

if (!Array.isArray(newsFeed.categories) || !newsFeed.categories.length) {
  errors.push("data/news.json must include category definitions.");
} else {
  const categoryIds = new Set();

  for (const [index, category] of newsFeed.categories.entries()) {
    for (const field of requiredCategoryFields) {
      if (!category[field]) {
        errors.push(`data/news.json categories[${index}] is missing ${field}.`);
      }
    }

    if (category.id && categoryIds.has(category.id)) {
      errors.push(`data/news.json has duplicate category id ${category.id}.`);
    }

    categoryIds.add(category.id);
  }

  const expectedCategoryIds = new Set([...allowedCategories].filter((category) => category !== "all"));

  for (const categoryId of expectedCategoryIds) {
    if (!categoryIds.has(categoryId)) {
      errors.push(`data/news.json is missing category definition ${categoryId}.`);
    }
  }

  for (const categoryId of categoryIds) {
    if (!expectedCategoryIds.has(categoryId)) {
      errors.push(`data/news.json has unsupported category definition ${categoryId}.`);
    }
  }
}

if (!newsFeed.edition) {
  errors.push("data/news.json must include edition metadata.");
} else {
  for (const field of requiredEditionFields) {
    if (!newsFeed.edition[field]) {
      errors.push(`data/news.json edition is missing ${field}.`);
    }
  }

  if (newsFeed.edition.date !== newsFeed.updatedAt) {
    errors.push("data/news.json edition.date must match updatedAt.");
  }

  if (!allowedArchiveStatuses.has(newsFeed.edition.archiveStatus)) {
    errors.push(`data/news.json edition has unsupported archiveStatus ${newsFeed.edition.archiveStatus}.`);
  }

  if (!Array.isArray(newsFeed.edition.coverageMix) || newsFeed.edition.coverageMix.length < 2) {
    errors.push("data/news.json edition must include at least two coverageMix entries.");
  } else {
    const coverageCount = newsFeed.edition.coverageMix.reduce((count, entry) => {
      return count + (Number.isInteger(entry.count) ? entry.count : 0);
    }, 0);

    if (coverageCount !== newsFeed.items.length) {
      errors.push("data/news.json edition coverageMix counts must match the number of current news items.");
    }

    for (const [index, entry] of newsFeed.edition.coverageMix.entries()) {
      if (!entry.label || !Number.isInteger(entry.count) || entry.count < 1 || !entry.meaning) {
        errors.push(`data/news.json edition coverageMix[${index}] must include label, positive count, and meaning.`);
      }

      if (entry.meaning && !/用于观察|用于判断|用于核对/.test(entry.meaning)) {
        errors.push(`data/news.json edition coverageMix[${index}] must explain how readers should use that signal group.`);
      }
    }
  }

  if (!Array.isArray(newsFeed.edition.sourceFamilies) || !newsFeed.edition.sourceFamilies.length) {
    errors.push("data/news.json edition must include sourceFamilies entries.");
  } else {
    const sourceFamilyCounts = new Map();
    const seenFamilies = new Set();

    for (const item of newsFeed.items || []) {
      const source = sourcesById.get(item.sourceId);
      const family = source?.trustLevel;

      if (family) {
        sourceFamilyCounts.set(family, (sourceFamilyCounts.get(family) || 0) + 1);
      }
    }

    for (const [index, entry] of newsFeed.edition.sourceFamilies.entries()) {
      if (!entry.family || !entry.label || !Number.isInteger(entry.count) || entry.count < 1 || !entry.role) {
        errors.push(`data/news.json edition sourceFamilies[${index}] must include family, label, positive count, and role.`);
      }

      if (entry.family && !allowedSourceFamilies.has(entry.family)) {
        errors.push(`data/news.json edition sourceFamilies[${index}] has unsupported family ${entry.family}.`);
      }

      if (entry.family && seenFamilies.has(entry.family)) {
        errors.push(`data/news.json edition sourceFamilies repeats family ${entry.family}.`);
      }

      if (entry.family && entry.count !== sourceFamilyCounts.get(entry.family)) {
        errors.push(`data/news.json edition sourceFamilies[${index}] count must match current item source tiers.`);
      }

      if (entry.role && !/来源|原文|事实|核对|信号/.test(entry.role)) {
        errors.push(`data/news.json edition sourceFamilies[${index}] must explain how that source family should be used.`);
      }

      seenFamilies.add(entry.family);
    }

    for (const [family, count] of sourceFamilyCounts.entries()) {
      if (count > 0 && !seenFamilies.has(family)) {
        errors.push(`data/news.json edition sourceFamilies is missing current source family ${family}.`);
      }
    }
  }

  if (!/^[a-z0-9-]+-\d{4}-\d{2}-\d{2}$/.test(newsFeed.edition.id || "")) {
    errors.push("data/news.json edition.id must end with an ISO date and use lowercase letters, numbers, or hyphens.");
  }

  try {
    new Intl.DateTimeFormat("zh-CN", { timeZone: newsFeed.edition.timezone }).format();
  } catch {
    errors.push(`data/news.json edition has invalid timezone ${newsFeed.edition.timezone}.`);
  }
}

if (newsFeed.briefing) {
  for (const field of requiredBriefingFields) {
    if (!newsFeed.briefing[field]) {
      errors.push(`data/news.json briefing is missing ${field}.`);
    }
  }

  if (!Array.isArray(newsFeed.briefing.watchPoints) || newsFeed.briefing.watchPoints.length !== 3) {
    errors.push("data/news.json briefing must include exactly three watchPoints.");
  }

  for (const [index, point] of (newsFeed.briefing.watchPoints || []).entries()) {
    if (!point.title || !point.body) {
      errors.push(`data/news.json briefing watchPoints[${index}] must include title and body.`);
    }
  }
}

if (!newsFeed.deepBriefing) {
  errors.push("data/news.json must include deepBriefing.");
} else {
  for (const field of requiredDeepBriefingFields) {
    if (!newsFeed.deepBriefing[field]) {
      errors.push(`data/news.json deepBriefing is missing ${field}.`);
    }
  }

  if (!Array.isArray(newsFeed.deepBriefing.timeline) || newsFeed.deepBriefing.timeline.length < 3) {
    errors.push("data/news.json deepBriefing must include at least three timeline items.");
  }

  if (!Array.isArray(newsFeed.deepBriefing.keyNumbers) || newsFeed.deepBriefing.keyNumbers.length < 3) {
    errors.push("data/news.json deepBriefing must include at least three keyNumbers.");
  }

  if (!Array.isArray(newsFeed.deepBriefing.sections) || newsFeed.deepBriefing.sections.length < 3) {
    errors.push("data/news.json deepBriefing must include at least three sections.");
  }

  if (!Array.isArray(newsFeed.deepBriefing.actions) || newsFeed.deepBriefing.actions.length < 2) {
    errors.push("data/news.json deepBriefing must include reader actions.");
  }

  if (!Array.isArray(newsFeed.deepBriefing.coverageLimits) || newsFeed.deepBriefing.coverageLimits.length < 2) {
    errors.push("data/news.json deepBriefing must include at least two coverageLimits.");
  }

  if (!newsFeed.deepBriefing.sourceFrame) {
    errors.push("data/news.json deepBriefing must include a sourceFrame.");
  } else {
    for (const field of ["sourceFacts", "editorialJudgment", "unknowns"]) {
      if (!Array.isArray(newsFeed.deepBriefing.sourceFrame[field]) || newsFeed.deepBriefing.sourceFrame[field].length < 2) {
        errors.push(`data/news.json deepBriefing sourceFrame.${field} must include at least two entries.`);
      }
    }
  }

  for (const [index, limit] of (newsFeed.deepBriefing.coverageLimits || []).entries()) {
    if (!limit.label || !limit.body) {
      errors.push(`data/news.json deepBriefing coverageLimits[${index}] must include label and body.`);
    }
  }
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

  const categoryDefinition = newsFeed.categories?.find((category) => category.id === item.category);

  if (item.category && !categoryDefinition) {
    errors.push(`${item.id} references undefined category ${item.category}.`);
  } else if (categoryDefinition && item.label !== categoryDefinition.label) {
    errors.push(`${item.id} label must match category label ${categoryDefinition.label}.`);
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

  if (item.publishedAt && Number.isNaN(Date.parse(item.publishedAt))) {
    errors.push(`${item.id} has invalid publishedAt ${item.publishedAt}.`);
  }

  if (item.detailBody && item.body && item.detailBody.length <= item.body.length + 40) {
    errors.push(`${item.id} detailBody must be meaningfully longer than the homepage body.`);
  }

  if (item.detailTrend && item.trend && item.detailTrend.length <= item.trend.length + 40) {
    errors.push(`${item.id} detailTrend must be meaningfully longer than the homepage trend.`);
  }

  if (item.detailWhyRanked && item.whyRanked && item.detailWhyRanked.length <= item.whyRanked.length + 60) {
    errors.push(`${item.id} detailWhyRanked must add source-based context beyond homepage whyRanked.`);
  }

  if (item.verificationStatus && !allowedVerificationStatuses.has(item.verificationStatus)) {
    errors.push(`${item.id} has unsupported verificationStatus ${item.verificationStatus}.`);
  }

  if (item.sourceRole && !allowedSourceRoles.has(item.sourceRole)) {
    errors.push(`${item.id} has unsupported sourceRole ${item.sourceRole}.`);
  }

  if (item.readerUse && !/团队|读者|用户|编辑/.test(item.readerUse)) {
    errors.push(`${item.id} readerUse must name the audience or user group for the signal.`);
  }

  if (!Array.isArray(item.followUpQuestions) || item.followUpQuestions.length < 2) {
    errors.push(`${item.id} must include at least two followUpQuestions.`);
  } else {
    for (const [index, question] of item.followUpQuestions.entries()) {
      if (typeof question !== "string" || !question.trim()) {
        errors.push(`${item.id} followUpQuestions[${index}] must be a non-empty string.`);
      } else if (!question.endsWith("？")) {
        errors.push(`${item.id} followUpQuestions[${index}] must be written as a Chinese question.`);
      } else if (question.length < 18) {
        errors.push(`${item.id} followUpQuestions[${index}] is too vague for editorial follow-up.`);
      }
    }
  }

  if (item.counterEvidence && !/如果|若|缺少|未|不/.test(item.counterEvidence)) {
    errors.push(`${item.id} counterEvidence must name a condition that would weaken the current editorial judgment.`);
  }
}

if (!Array.isArray(newsHistory.editions) || !newsHistory.editions.length) {
  errors.push("data/news-history.json must include at least one edition.");
} else {
  const latestHistoryEdition = newsHistory.editions[0];
  const historyItemTotal = newsHistory.editions.reduce((count, edition) => {
    return count + (Array.isArray(edition.items) ? edition.items.length : 0);
  }, 0);

  if (newsHistory.totalItems !== historyItemTotal) {
    errors.push("data/news-history.json totalItems must match the total number of historical items.");
  }

  if (latestHistoryEdition.id !== newsFeed.edition?.id) {
    errors.push("data/news-history.json latest edition must match data/news.json edition.id.");
  }

  const allHistorySourceKeys = new Set();

  for (const [editionIndex, edition] of newsHistory.editions.entries()) {
    for (const field of ["id", "date", "timezone", "archiveLabel", "itemCount", "items"]) {
      if (!edition[field] && edition[field] !== 0) {
        errors.push(`data/news-history.json editions[${editionIndex}] is missing ${field}.`);
      }
    }

    if (!Array.isArray(edition.items)) {
      continue;
    }

    if (edition.itemCount !== edition.items.length) {
      errors.push(`data/news-history.json edition ${edition.id} itemCount must match items length.`);
    }

    if (sortSignature(edition.items) !== expectedSortSignature(edition.items)) {
      errors.push(`data/news-history.json edition ${edition.id} items must be sorted newest first by publishedAt.`);
    }

    const seenItemIds = new Set();
    const seenSourceKeys = new Set();

    for (const item of edition.items) {
      const sourceKey = normalizeSourceKey(item);

      if (seenItemIds.has(item.id)) {
        errors.push(`data/news-history.json edition ${edition.id} has duplicate item ${item.id}.`);
      }

      seenItemIds.add(item.id);

      if (sourceKey && seenSourceKeys.has(sourceKey)) {
        errors.push(`data/news-history.json edition ${edition.id} repeats source ${item.sourceUrl}.`);
      }

      if (sourceKey && allHistorySourceKeys.has(sourceKey)) {
        errors.push(`data/news-history.json repeats previously captured source ${item.sourceUrl}.`);
      }

      seenSourceKeys.add(sourceKey);
      allHistorySourceKeys.add(sourceKey);

      for (const field of requiredNewsFields) {
        if (!item[field]) {
          errors.push(`data/news-history.json item ${item.id || "unknown item"} is missing ${field}.`);
        }
      }
    }

  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${newsFeed.items.length} news items against ${sourceRegistry.sources.length} sources.`);
