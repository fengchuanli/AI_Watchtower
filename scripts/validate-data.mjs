import { readFileSync } from "node:fs";

const sourceRegistry = JSON.parse(readFileSync("data/sources.json", "utf8"));
const newsFeed = JSON.parse(readFileSync("data/news.json", "utf8"));
const newsHistory = JSON.parse(readFileSync("data/news-history.json", "utf8"));

const sourceIds = new Set(sourceRegistry.sources.map((source) => source.id));
const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.id, source]));
const allowedCategories = new Set(["all", "model", "product", "research", "tool", "funding", "policy"]);
const allowedSourceFamilies = new Set(["official", "research", "reliable_media", "community_signal"]);
const allowedTopicGroups = new Set(["agent", "model", "enterprise", "policy", "infrastructure", "developer-tooling"]);
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
const requiredEditionFields = [
  "id",
  "date",
  "timezone",
  "archiveStatus",
  "archiveLabel",
  "note",
  "operationalStatus",
  "editorialInterpretation",
  "sourceRisk",
];
const requiredCategoryFields = ["id", "label", "description"];
const allowedArchiveStatuses = new Set(["preview", "published"]);
const allowedVerificationStatuses = new Set(["结构样例，未作事实核验", "已核验"]);
const allowedSourceRoles = new Set(["官方核对", "研究原文", "媒体背景", "社区发现", "厂商主张"]);
const maxCurrentItemAgeDays = 7;
const millisecondsPerDay = 24 * 60 * 60 * 1000;
const incidentBriefingSections = [
  ["detailBody", "what happened", 40],
  ["detailTrend", "trend meaning", 40],
  ["detailWhyRanked", "why it matters", 40],
  ["impact", "reader impact", 12],
  ["readerUse", "reader use", 12],
  ["nextCheck", "next checks", 12],
  ["evidenceThreshold", "evidence threshold", 12],
  ["claimBoundary", "claim boundary", 12],
  ["counterEvidence", "downgrade signal", 12],
  ["sourceRole", "source role", 2],
  ["provenance", "source boundary", 20],
  ["verificationStatus", "verification status", 2],
];

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

function normalizeTitleKey(item) {
  return String(item.title || "")
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

function validateSimilarTitles(items, context) {
  const titleRecords = [];

  for (const item of items) {
    const titleKey = normalizeTitleKey(item);

    if (!titleKey) {
      continue;
    }

    for (const record of titleRecords) {
      const similarity = getTitleSimilarity(titleKey, record.titleKey);

      if (similarity >= 0.86 && Math.min(titleKey.length, record.titleKey.length) >= 14) {
        errors.push(
          `${context} has similar titles: ${record.id} and ${item.id || "unknown item"}. Skip repeated coverage or rewrite only after confirming distinct source facts.`,
        );
      }
    }

    titleRecords.push({ id: item.id || "unknown item", titleKey });
  }
}

function getEditionDateEnd(editionDate) {
  const parsedDate = Date.parse(`${editionDate}T23:59:59+09:00`);

  return Number.isNaN(parsedDate) ? null : parsedDate;
}

function validateCurrentItemFreshness(items, editionDate) {
  const editionDateEnd = getEditionDateEnd(editionDate);

  if (!editionDateEnd) {
    errors.push("data/news.json updatedAt must be a valid ISO date for stale-item checks.");
    return;
  }

  for (const item of items) {
    const publishedAt = Date.parse(item.publishedAt);

    if (Number.isNaN(publishedAt)) {
      continue;
    }

    const ageDays = (editionDateEnd - publishedAt) / millisecondsPerDay;

    if (ageDays > maxCurrentItemAgeDays) {
      errors.push(
        `${item.id || "unknown item"} is too old for the current feed. Move stale background coverage to history unless a new source fact refreshed it within ${maxCurrentItemAgeDays} days.`,
      );
    }

    if (publishedAt > editionDateEnd + millisecondsPerDay) {
      errors.push(`${item.id || "unknown item"} publishedAt is after the current edition date window.`);
    }
  }
}

function validateCurrentItemsAgainstOlderHistory(currentItems, historicalEditions) {
  const olderHistoryItems = historicalEditions
    .slice(1)
    .flatMap((edition) => (Array.isArray(edition.items) ? edition.items : []));
  const olderSourceKeys = new Map();
  const olderTitleRecords = [];

  for (const item of olderHistoryItems) {
    const sourceKey = normalizeSourceKey(item);
    const titleKey = normalizeTitleKey(item);

    if (sourceKey && !olderSourceKeys.has(sourceKey)) {
      olderSourceKeys.set(sourceKey, item.id || "unknown item");
    }

    if (titleKey) {
      olderTitleRecords.push({ id: item.id || "unknown item", titleKey });
    }
  }

  for (const item of currentItems) {
    const sourceKey = normalizeSourceKey(item);
    const titleKey = normalizeTitleKey(item);

    if (sourceKey && olderSourceKeys.has(sourceKey)) {
      errors.push(
        `data/news.json item ${item.id || "unknown item"} repeats source already captured by ${olderSourceKeys.get(sourceKey)}. Use the archive item unless a new source URL supports a fresh development.`,
      );
    }

    for (const record of olderTitleRecords) {
      const similarity = getTitleSimilarity(titleKey, record.titleKey);

      if (similarity >= 0.86 && Math.min(titleKey.length, record.titleKey.length) >= 14) {
        errors.push(
          `data/news.json item ${item.id || "unknown item"} resembles older archive item ${record.id}. Skip repeated historical coverage unless new source facts make it a distinct update.`,
        );
      }
    }
  }
}

function validateSelectionScore(score, itemId, context) {
  const criteria = ["impact", "novelty", "narrativeStrength", "evidenceQuality", "readerUtility"];

  if (!score || typeof score !== "object" || Array.isArray(score)) {
    errors.push(`${context} ${itemId} must include a selectionScore object.`);
    return;
  }

  for (const criterion of criteria) {
    if (!Number.isInteger(score[criterion]) || score[criterion] < 1 || score[criterion] > 5) {
      errors.push(`${context} ${itemId} selectionScore.${criterion} must be an integer from 1 to 5.`);
    }
  }

  const expectedTotal = criteria.reduce((sum, criterion) => sum + (Number.isInteger(score[criterion]) ? score[criterion] : 0), 0);

  if (score.total !== expectedTotal) {
    errors.push(`${context} ${itemId} selectionScore.total must equal the five scoring criteria.`);
  }

  if (typeof score.note !== "string" || score.note.trim().length < 18) {
    errors.push(`${context} ${itemId} selectionScore.note must explain the editorial scoring tradeoff.`);
  }
}

function isActionOrientedSignalUse(value) {
  return /用来(更新|检查|调整|核对|评估|复查|列出)/.test(String(value || ""));
}

function validateIncidentBriefingReadiness(item, context) {
  for (const [field, label, minLength] of incidentBriefingSections) {
    if (typeof item[field] !== "string" || item[field].trim().length < minLength) {
      errors.push(`${context} ${item.id || "unknown item"} must include ${label} for an incident briefing.`);
    }
  }

  if (!Array.isArray(item.followUpQuestions) || item.followUpQuestions.length < 2) {
    errors.push(`${context} ${item.id || "unknown item"} must include follow-up questions for an incident briefing.`);
  }

  if (!item.selectionScore || item.selectionScore.narrativeStrength < 3 || item.selectionScore.evidenceQuality < 3) {
    errors.push(
      `${context} ${item.id || "unknown item"} must have narrativeStrength and evidenceQuality scores of at least 3 before promotion.`,
    );
  }

  const briefingText = [
    item.detailBody,
    item.detailTrend,
    item.detailWhyRanked,
    item.claimBoundary,
    item.nextCheck,
    item.provenance,
  ]
    .filter(Boolean)
    .join("\n");

  if (!/不能|不证明|仍需|边界|待验证|待核对|缺少|如果|若/.test(briefingText)) {
    errors.push(`${context} ${item.id || "unknown item"} must name a verification boundary before promotion.`);
  }

  if (!/因为|所以|意味着|影响|用于|观察|判断|核对/.test(briefingText)) {
    errors.push(`${context} ${item.id || "unknown item"} must explain the reader-facing reason for promotion.`);
  }
}

function validateVendorClaimBoundary(item, context) {
  if (item.sourceRole !== "厂商主张") {
    return;
  }

  const itemLabel = `${context} ${item.id || "unknown item"}`;
  const provenance = String(item.provenance || "");
  const claimBoundary = String(item.claimBoundary || "");
  const nextCheck = String(item.nextCheck || "");
  const evidenceThreshold = String(item.evidenceThreshold || "");
  const counterEvidence = String(item.counterEvidence || "");
  const combinedVerificationText = [claimBoundary, nextCheck, evidenceThreshold, counterEvidence].join("\n");

  if (!/主张|声称|提案|厂商|公司|官方/.test(provenance)) {
    errors.push(`${itemLabel} uses 厂商主张 and must frame provenance as a vendor claim or proposal.`);
  }

  if (!/不等同|不能|不证明|仍需|必须|需要/.test(claimBoundary)) {
    errors.push(`${itemLabel} uses 厂商主张 and must state what the vendor narrative does not prove.`);
  }

  if (!/客户|用户|监管|立法|法律|论文|复现|审计|第三方|独立|基准|合同|文件|数据|原文/.test(combinedVerificationText)) {
    errors.push(`${itemLabel} uses 厂商主张 and must name the external proof needed before upgrading the claim.`);
  }
}

function validateReaderFrame(frame, context) {
  if (!frame || typeof frame !== "object" || Array.isArray(frame)) {
    errors.push(`${context} must include a readerFrame object.`);
    return;
  }

  if (typeof frame.headline !== "string" || frame.headline.trim().length < 18) {
    errors.push(`${context} readerFrame.headline must explain how to read the edition.`);
  }

  if (typeof frame.whyItMatters !== "string" || frame.whyItMatters.trim().length < 40) {
    errors.push(`${context} readerFrame.whyItMatters must explain why this batch matters.`);
  }

  if (!Array.isArray(frame.useThisIssueFor) || frame.useThisIssueFor.length < 2) {
    errors.push(`${context} readerFrame.useThisIssueFor must include at least two reader uses.`);
  }

  for (const [index, item] of (frame.useThisIssueFor || []).entries()) {
    if (typeof item !== "string" || !/团队|读者|用户|编辑/.test(item)) {
      errors.push(`${context} readerFrame.useThisIssueFor[${index}] must name a concrete reader or team.`);
    }
  }

  if (!Array.isArray(frame.notProvenYet) || frame.notProvenYet.length < 2) {
    errors.push(`${context} readerFrame.notProvenYet must include at least two proof boundaries.`);
  }

  for (const [index, item] of (frame.notProvenYet || []).entries()) {
    if (typeof item !== "string" || !/不能|尚未|不证明|仍需|缺少/.test(item)) {
      errors.push(`${context} readerFrame.notProvenYet[${index}] must state an unresolved proof boundary.`);
    }
  }
}

function validateEditionChangeSummary(changeSummary, context) {
  if (!changeSummary || typeof changeSummary !== "object" || Array.isArray(changeSummary)) {
    errors.push(`${context} must include a changeSummary object.`);
    return;
  }

  if (typeof changeSummary.headline !== "string" || changeSummary.headline.trim().length < 18) {
    errors.push(`${context} changeSummary.headline must explain what changed since the last batch.`);
  }

  if (!Array.isArray(changeSummary.freshFacts) || changeSummary.freshFacts.length < 2) {
    errors.push(`${context} changeSummary.freshFacts must include at least two fresh source facts.`);
  }

  if (!Array.isArray(changeSummary.repeatedContext) || changeSummary.repeatedContext.length < 2) {
    errors.push(`${context} changeSummary.repeatedContext must include at least two repeated background notes.`);
  }

  for (const [index, item] of (changeSummary.freshFacts || []).entries()) {
    if (typeof item !== "string" || !/本期新增|新事实|新增/.test(item)) {
      errors.push(`${context} changeSummary.freshFacts[${index}] must be written as a fresh fact from this batch.`);
    }
  }

  for (const [index, item] of (changeSummary.repeatedContext || []).entries()) {
    if (typeof item !== "string" || !/仍是|延续|重复|旧/.test(item)) {
      errors.push(`${context} changeSummary.repeatedContext[${index}] must be written as repeated background, not a fresh fact.`);
    }
  }
}

function hasChineseText(value) {
  return /\p{Script=Han}/u.test(String(value || ""));
}

function validateChineseEditorialCopy(data) {
  const deepBriefing = data.deepBriefing;
  const forbiddenVisiblePhrases = [
    "Intelligence Briefing",
    "Health AI",
    "Medical Research",
    "Enterprise Ops",
    "So What?",
    "checklist",
    "FinOps",
  ];
  const visibleText = [
    data.briefing?.headline,
    data.briefing?.summary,
    ...(data.briefing?.watchPoints || []).flatMap((point) => [point.title, point.body]),
    deepBriefing?.kicker,
    deepBriefing?.title,
    deepBriefing?.subtitle,
    deepBriefing?.overview,
    ...(deepBriefing?.timeline || []).flatMap((item) => [item.title, item.body]),
    ...(deepBriefing?.sections || []).flatMap((section) => [
      section.label,
      section.title,
      section.body,
      section.soWhat,
    ]),
    ...(deepBriefing?.actions || []),
    ...(deepBriefing?.sourceFrame?.editorialJudgment || []),
    ...(data.items || []).flatMap((item) => [
      item.readerUse,
      item.evidenceThreshold,
      item.detailTrend,
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  for (const phrase of forbiddenVisiblePhrases) {
    if (visibleText.includes(phrase)) {
      errors.push(`Visible Chinese editorial copy should avoid unexplained English structural phrase "${phrase}".`);
    }
  }

  if (deepBriefing?.kicker && !hasChineseText(deepBriefing.kicker)) {
    errors.push("data/news.json deepBriefing.kicker must be Chinese-readable.");
  }

  for (const [index, section] of (deepBriefing?.sections || []).entries()) {
    if (section.label && !hasChineseText(section.label)) {
      errors.push(`data/news.json deepBriefing.sections[${index}].label must be Chinese-readable.`);
    }
  }
}

if (!Array.isArray(sourceRegistry.sources) || !sourceRegistry.sources.length) {
  errors.push("data/sources.json must include at least one source.");
}

if (!Array.isArray(newsFeed.items)) {
  errors.push("data/news.json must include an items array.");
} else if (sortSignature(newsFeed.items) !== expectedSortSignature(newsFeed.items)) {
  errors.push("data/news.json items must be sorted newest first by publishedAt.");
} else {
  validateChineseEditorialCopy(newsFeed);
  validateSimilarTitles(newsFeed.items, "data/news.json");
  validateCurrentItemFreshness(newsFeed.items, newsFeed.updatedAt);

  const topRankingReasons = newsFeed.items.slice(0, 3).map((item) => item.whyRanked?.trim()).filter(Boolean);
  const promotedItems = newsFeed.items.slice(0, 3);

  if (topRankingReasons.length !== Math.min(newsFeed.items.length, 3)) {
    errors.push("Top news items must include ranking reasons for the homepage TOP3.");
  }

  if (new Set(topRankingReasons).size !== topRankingReasons.length) {
    errors.push("Homepage TOP3 ranking reasons must be distinct.");
  }

  for (const item of promotedItems) {
    validateIncidentBriefingReadiness(item, "data/news.json promoted item");
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

  if (newsFeed.edition.note && newsFeed.edition.note.length > 80) {
    errors.push("data/news.json edition.note must stay short; use operationalStatus and editorialInterpretation for status details.");
  }

  if (newsFeed.edition.operationalStatus && !/拉取|检查|来源|索引|发布|DNS/.test(newsFeed.edition.operationalStatus)) {
    errors.push("data/news.json edition.operationalStatus must describe retrieval or source-check status.");
  }

  if (
    newsFeed.edition.editorialInterpretation &&
    !/媒体|官方|reported|边界|复核|信号|判断/.test(newsFeed.edition.editorialInterpretation)
  ) {
    errors.push("data/news.json edition.editorialInterpretation must state the editorial reading and evidence boundary.");
  }

  validateReaderFrame(newsFeed.edition.readerFrame, "data/news.json edition");
  validateEditionChangeSummary(newsFeed.edition.changeSummary, "data/news.json edition");

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

      if (entry.meaning && !isActionOrientedSignalUse(entry.meaning)) {
        errors.push(
          `data/news.json edition coverageMix[${index}] must name a concrete reader action, such as updating, checking, adjusting, or verifying a list.`,
        );
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

    if (
      !newsFeed.edition.sourceRisk ||
      !newsFeed.edition.sourceRisk.label ||
      !newsFeed.edition.sourceRisk.note ||
      !newsFeed.edition.sourceRisk.nextCheck
    ) {
      errors.push("data/news.json edition must include sourceRisk label, note, and nextCheck.");
    } else {
      const maxFamilyCount = Math.max(...sourceFamilyCounts.values(), 0);
      const dominantFamily = maxFamilyCount > 0 && maxFamilyCount >= Math.ceil((newsFeed.items || []).length * 0.67);

      if (dominantFamily && !/集中|单一|同一|全部|占比|偏向/.test(newsFeed.edition.sourceRisk.note)) {
        errors.push("data/news.json edition.sourceRisk.note must explain source concentration when one source family dominates.");
      }

      if (!/官方|原文|公告|文件|核对|复核/.test(newsFeed.edition.sourceRisk.nextCheck)) {
        errors.push("data/news.json edition.sourceRisk.nextCheck must name the independent source check needed next.");
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

  if (!Array.isArray(newsFeed.edition.topicGroups) || !newsFeed.edition.topicGroups.length) {
    errors.push("data/news.json edition must include topicGroups entries.");
  } else {
    const currentItemIds = new Set((newsFeed.items || []).map((item) => item.id));
    const seenTopics = new Set();

    for (const [index, entry] of newsFeed.edition.topicGroups.entries()) {
      if (
        !entry.id ||
        !entry.label ||
        !Number.isInteger(entry.count) ||
        entry.count < 1 ||
        !Array.isArray(entry.itemIds) ||
        !entry.meaning
      ) {
        errors.push(`data/news.json edition topicGroups[${index}] must include id, label, positive count, itemIds, and meaning.`);
      }

      if (entry.id && !allowedTopicGroups.has(entry.id)) {
        errors.push(`data/news.json edition topicGroups[${index}] has unsupported topic ${entry.id}.`);
      }

      if (entry.id && seenTopics.has(entry.id)) {
        errors.push(`data/news.json edition topicGroups repeats topic ${entry.id}.`);
      }

      if (entry.itemIds && entry.count !== entry.itemIds.length) {
        errors.push(`data/news.json edition topicGroups[${index}] count must match itemIds.length.`);
      }

      for (const itemId of entry.itemIds || []) {
        if (!currentItemIds.has(itemId)) {
          errors.push(`data/news.json edition topicGroups[${index}] references unknown current item ${itemId}.`);
        }
      }

      if (entry.meaning && !isActionOrientedSignalUse(entry.meaning)) {
        errors.push(
          `data/news.json edition topicGroups[${index}] must name a concrete reader action, such as updating, checking, adjusting, or verifying a list.`,
        );
      }

      seenTopics.add(entry.id);
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

  validateVendorClaimBoundary(item, "data/news.json item");
  validateSelectionScore(item.selectionScore, item.id, "data/news.json item");
}

if (!Array.isArray(newsHistory.editions) || !newsHistory.editions.length) {
  errors.push("data/news-history.json must include at least one edition.");
} else {
  const latestHistoryEdition = newsHistory.editions[0];
  const historyItemTotal = newsHistory.editions.reduce((count, edition) => {
    return count + (Array.isArray(edition.items) ? edition.items.length : 0);
  }, 0);
  const allHistoryItems = newsHistory.editions.flatMap((edition) => (Array.isArray(edition.items) ? edition.items : []));

  validateSimilarTitles(allHistoryItems, "data/news-history.json");
  validateCurrentItemsAgainstOlderHistory(newsFeed.items || [], newsHistory.editions);

  if (newsHistory.totalItems !== historyItemTotal) {
    errors.push("data/news-history.json totalItems must match the total number of historical items.");
  }

  if (latestHistoryEdition.id !== newsFeed.edition?.id) {
    errors.push("data/news-history.json latest edition must match data/news.json edition.id.");
  }

  validateReaderFrame(latestHistoryEdition.readerFrame, "data/news-history.json latest edition");
  validateEditionChangeSummary(latestHistoryEdition.changeSummary, "data/news-history.json latest edition");

  const allHistorySourceKeys = new Set();

  for (const [editionIndex, edition] of newsHistory.editions.entries()) {
    for (const field of ["id", "date", "timezone", "archiveLabel", "itemCount", "items"]) {
      if (!edition[field] && edition[field] !== 0) {
        errors.push(`data/news-history.json editions[${editionIndex}] is missing ${field}.`);
      }
    }

    if (editionIndex === 0) {
      for (const field of ["note", "operationalStatus", "editorialInterpretation"]) {
        if (!edition[field]) {
          errors.push(`data/news-history.json latest edition is missing ${field}.`);
        }
      }

      if (edition.note && edition.note.length > 80) {
        errors.push("data/news-history.json latest edition.note must stay short.");
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

      if (editionIndex === 0 || item.selectionScore) {
        validateSelectionScore(item.selectionScore, item.id, "data/news-history.json item");
      }

      if (editionIndex === 0) {
        validateIncidentBriefingReadiness(item, "data/news-history.json latest promoted item");
      }

      validateVendorClaimBoundary(item, "data/news-history.json item");
    }

  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${newsFeed.items.length} news items against ${sourceRegistry.sources.length} sources.`);
