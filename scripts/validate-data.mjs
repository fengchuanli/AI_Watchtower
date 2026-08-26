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
  "sourceConcentration",
];
const requiredCategoryFields = ["id", "label", "description"];
const allowedArchiveStatuses = new Set(["preview", "published"]);
const allowedVerificationStatuses = new Set(["结构样例，未作事实核验", "已核验"]);
const allowedSourceRoles = new Set(["官方核对", "研究原文", "媒体背景", "社区发现", "厂商主张"]);
const allowedStructuredSourceTypes = new Set([
  "official",
  "research",
  "regulator",
  "reliable_media",
  "media_report",
  "community_signal",
]);
const maxCurrentItemAgeDays = 7;
const maxDetailParagraphLength = 180;
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
const chineseTextPattern = /[\u4e00-\u9fff]/;
const sourceRoleBoundaryPattern = /(官方|媒体|研究|社区|厂商|监管|文件|论文|原文|背景|信号|核对|边界|证据|确认|验证|证明)/;
const englishSourceInstructionPattern = /\b(use for|use only|treat|verify|summaries should|official company|established media|community or trend)\b/i;

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

function extractCategoryAnchorTokens(value) {
  const normalized = String(value || "").normalize("NFKC");
  const latinTokens = normalized.match(/[A-Za-z][A-Za-z0-9.-]{2,}/g) || [];
  return new Set(
    latinTokens
      .map((token) => token.replace(/[.'’]s$/i, "").toLowerCase())
      .filter((token) => !["the", "and", "for", "with", "from", "into", "current"].includes(token)),
  );
}

function validateCategoryDescriptionAnchors(categories, items) {
  const anchorsByCategory = new Map();
  const categoryByAnchor = new Map();

  for (const item of items) {
    if (!item.category) {
      continue;
    }

    if (!anchorsByCategory.has(item.category)) {
      anchorsByCategory.set(item.category, new Set());
    }

    const itemText = [item.title, item.source, item.sourceId].filter(Boolean).join(" ");
    const itemAnchors = extractCategoryAnchorTokens(itemText);

    for (const anchor of itemAnchors) {
      anchorsByCategory.get(item.category).add(anchor);

      if (!categoryByAnchor.has(anchor)) {
        categoryByAnchor.set(anchor, new Set());
      }

      categoryByAnchor.get(anchor).add(item.category);
    }
  }

  for (const [index, category] of categories.entries()) {
    const categoryAnchors = anchorsByCategory.get(category.id) || new Set();

    if (!categoryAnchors.size || !category.description) {
      continue;
    }

    const descriptionAnchors = extractCategoryAnchorTokens(category.description);
    const matchedCurrentAnchors = [...descriptionAnchors].filter((anchor) => categoryAnchors.has(anchor));

    if (!matchedCurrentAnchors.length) {
      errors.push(
        `data/news.json categories[${index}] description must name at least one current visible anchor from its own items.`,
      );
    }

    const staleAnchors = [...descriptionAnchors].filter((anchor) => {
      const anchorCategories = categoryByAnchor.get(anchor);
      return anchorCategories && !anchorCategories.has(category.id);
    });

    if (staleAnchors.length) {
      errors.push(
        `data/news.json categories[${index}] description names anchors outside its current items: ${staleAnchors.join(", ")}.`,
      );
    }
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
      validateFreshSourceFactException(item, editionDateEnd);
    }

    if (publishedAt > editionDateEnd + millisecondsPerDay) {
      errors.push(`${item.id || "unknown item"} publishedAt is after the current edition date window.`);
    }
  }
}

function validateFreshSourceFactException(item, editionDateEnd) {
  const itemLabel = item.id || "unknown item";
  const exception = item.freshSourceFact;

  if (!exception || typeof exception !== "object" || Array.isArray(exception)) {
    errors.push(
      `${itemLabel} is too old for the current feed. Move stale background coverage to history unless freshSourceFact records a source-specific new fact within ${maxCurrentItemAgeDays} days.`,
    );
    return;
  }

  const sourceType = String(item.sourceType || "").trim();
  const exceptionSourceType = String(exception.sourceType || "").trim();
  const exceptionPublishedAt = Date.parse(exception.publishedAt);
  const exceptionFact = String(exception.fact || "").trim();
  const exceptionUrl = String(exception.sourceUrl || "").trim();

  if (!allowedStructuredSourceTypes.has(sourceType)) {
    errors.push(`${itemLabel} needs a supported sourceType before using a freshSourceFact stale-news exception.`);
  }

  if (exceptionSourceType !== sourceType) {
    errors.push(`${itemLabel} freshSourceFact.sourceType must match item.sourceType so stale exceptions stay source-specific.`);
  }

  if (Number.isNaN(exceptionPublishedAt)) {
    errors.push(`${itemLabel} freshSourceFact.publishedAt must be a valid source timestamp.`);
  } else {
    const exceptionAgeDays = (editionDateEnd - exceptionPublishedAt) / millisecondsPerDay;

    if (exceptionAgeDays > maxCurrentItemAgeDays || exceptionPublishedAt > editionDateEnd + millisecondsPerDay) {
      errors.push(`${itemLabel} freshSourceFact.publishedAt must fall within the current ${maxCurrentItemAgeDays}-day freshness window.`);
    }
  }

  if (!exceptionUrl) {
    errors.push(`${itemLabel} freshSourceFact.sourceUrl must point to the source that refreshed the stale item.`);
  } else {
    try {
      const parsedUrl = new URL(exceptionUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.push(`${itemLabel} freshSourceFact.sourceUrl must use http or https.`);
      }
    } catch {
      errors.push(`${itemLabel} freshSourceFact.sourceUrl is invalid.`);
    }
  }

  if (exceptionFact.length < 24 || !/新增|更新|发布|宣布|提交|披露|确认|修订|回应|报告/.test(exceptionFact)) {
    errors.push(`${itemLabel} freshSourceFact.fact must name the concrete new source fact, not repeated background.`);
  }

  if (["reliable_media", "media_report"].includes(sourceType) && item.originalDependency !== "must-read") {
    errors.push(`${itemLabel} media-based stale exceptions must keep originalDependency as must-read.`);
  }

  if (sourceType === "community_signal") {
    const verificationText = [item.claimBoundary, item.nextCheck, item.evidenceThreshold, exceptionFact].join("\n");

    if (!/官方|原文|监管|媒体|第三方|复核|确认/.test(verificationText)) {
      errors.push(`${itemLabel} community-signal stale exceptions must name the non-community source needed for confirmation.`);
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

function isActionOrientedCoverageLabel(value) {
  return /^(查|核对|验证|更新|观察|复查|评估)/.test(String(value || "").trim());
}

function validateCoverageMixShape(coverageMix, context) {
  const singleItemBucketCount = coverageMix.filter((entry) => entry.count === 1).length;

  if (coverageMix.length > 4) {
    errors.push(`${context} coverageMix should merge tiny buckets instead of showing more than four scan cues.`);
  }

  if (singleItemBucketCount > 1) {
    errors.push(`${context} coverageMix should merge tiny buckets; keep at most one single-item bucket.`);
  }
}

function validateShortBatchEditorialNote(edition, items, context) {
  const itemCount = Array.isArray(items) ? items.length : 0;

  if (itemCount >= 10) {
    return;
  }

  const note = String(edition?.editorialInterpretation || "");

  if (!new RegExp(`本期发布\\s*${itemCount}\\s*条安全非重复信号`).test(note)) {
    errors.push(`${context} editorialInterpretation must state 本期发布 ${itemCount} 条安全非重复信号 for short batches.`);
  }

  if (!/少于\s*10\s*条是质量门槛结果/.test(note)) {
    errors.push(`${context} editorialInterpretation must frame fewer than 10 items as a quality-gate result.`);
  }

  if (!/未用|没有用/.test(note) || !/旧稿|播客|付费墙|登录墙|社区讨论|重复|弱证据|营销/.test(note)) {
    errors.push(`${context} editorialInterpretation must name the unsafe padding types that were not used.`);
  }

  if (/只发布|不足|遗憾|来不及|未完成|没凑够|凑不够|抱歉/.test(note)) {
    errors.push(`${context} editorialInterpretation must not make a short safe batch sound incomplete or apologetic.`);
  }
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

function validateDetailParagraphLength(item, context) {
  const detailFields = ["detailBody", "detailTrend", "detailWhyRanked"];

  for (const field of detailFields) {
    const paragraphs = String(item[field] || "")
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    for (const [index, paragraph] of paragraphs.entries()) {
      if (paragraph.length > maxDetailParagraphLength) {
        errors.push(
          `${context} ${item.id || "unknown item"} ${field} paragraph ${index + 1} is ${paragraph.length} characters; keep detail-page paragraphs under ${maxDetailParagraphLength} Chinese characters for mobile reading.`,
        );
      }
    }
  }
}

function validateDetailTrendSplit(item, context) {
  const detailTrend = String(item.detailTrend || "").trim();

  if (!detailTrend) {
    return;
  }

  const clauseCount = detailTrend
    .split(/[。！？；\n]+/)
    .map((clause) => clause.trim())
    .filter(Boolean).length;
  const hasTrendMeaning = /正在|开始|转向|变成|意味着|说明|竞争|趋势|阶段|进入/.test(detailTrend);
  const hasReaderAction = /对读者|读者|团队|采购|产品|工程|安全|法务|审计|可以把|用来|用于/.test(detailTrend);
  const hasProofWork =
    /下一步|后续要看|至少需要|仍需|待验证|待核对|升级|削弱|反证|第三方|独立|审计|监管|合同|指标|日志|复测|文件/.test(
      detailTrend,
    );

  if (clauseCount >= 3 && hasTrendMeaning && hasReaderAction && hasProofWork) {
    errors.push(
      `${context} ${item.id || "unknown item"} detailTrend mixes trend meaning, reader action, and proof work. Split reader action into readerUse/impact and proof work into evidenceThreshold, nextCheck, counterEvidence, or claimBoundary.`,
    );
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
  const independentEvidencePattern =
    /客户|用户|监管|立法|法律|论文|复现|审计|第三方|独立|基准|benchmark|合同|文件|数据|指标|原文|实验室|专家|评测|部署|上线|公告|报告/;

  if (!/主张|声称|提案|厂商|公司|官方/.test(provenance)) {
    errors.push(`${itemLabel} uses 厂商主张 and must frame provenance as a vendor claim or proposal.`);
  }

  if (!/不等同|不能|不证明|仍需|必须|需要/.test(claimBoundary)) {
    errors.push(`${itemLabel} uses 厂商主张 and must state what the vendor narrative does not prove.`);
  }

  if (!independentEvidencePattern.test(nextCheck)) {
    errors.push(`${itemLabel} uses 厂商主张 and nextCheck must name the independent evidence needed next.`);
  }

  if (!independentEvidencePattern.test(combinedVerificationText)) {
    errors.push(`${itemLabel} uses 厂商主张 and must name the external proof needed before upgrading the claim.`);
  }
}

function hasIndependentEvidencePath(value) {
  return /客户|用户|监管|立法|法律|论文|复现|审计|第三方|独立|基准|benchmark|合同|文件|数据|指标|原文|实验室|专家|评测|部署|上线|公告|报告|filing|10-Q|10-K|采购|日志|记录|复核/.test(
    String(value || ""),
  );
}

function validatePromotedVendorNarrativeCard(item, context) {
  if (item.sourceRole !== "厂商主张") {
    return;
  }

  const itemLabel = `${context} ${item.id || "unknown item"}`;
  const firstScreenText = [item.summary, item.whyItMatters, item.whyRanked, item.topReason, item.readerUse, item.nextCheck].join(
    "\n",
  );
  const visibleReasonText = [item.whyItMatters, item.whyRanked, item.topReason, item.readerUse].join("\n");

  if (!hasIndependentEvidencePath(firstScreenText)) {
    errors.push(
      `${itemLabel} is a promoted vendor narrative and must name independent proof in first-screen card copy such as summary, whyItMatters, whyRanked, topReason, readerUse, or nextCheck.`,
    );
  }

  if (!hasIndependentEvidencePath(visibleReasonText)) {
    errors.push(
      `${itemLabel} must put the vendor-claim proof path in at least one visible reason field, not only in hidden verification sections.`,
    );
  }
}

function validateMediaSourceReminder(item, context) {
  const sourceType = String(item.sourceType || "").trim();
  const sourceRole = String(item.sourceRole || "").trim();
  const claimStatus = String(item.claimStatus || "").trim();

  if (!["reliable_media", "media_report"].includes(sourceType) && sourceRole !== "媒体背景") {
    return;
  }

  const itemLabel = `${context} ${item.id || "unknown item"}`;
  const provenance = String(item.provenance || "");
  const detailBoundaryText = [item.provenance, item.claimBoundary, item.nextCheck, item.evidenceThreshold].join("\n");
  const originalArticleFactsPattern = /完整事实|原文|采访|访谈|引述|图表|数据|上下文|案卷|报告|filings|文件/;

  if (item.originalDependency !== "must-read") {
    errors.push(`${itemLabel} media-sourced items must keep originalDependency as must-read.`);
  }

  if (sourceRole !== "媒体背景") {
    errors.push(`${itemLabel} media-sourced items must use sourceRole 媒体背景.`);
  }

  if (claimStatus !== "reported") {
    errors.push(`${itemLabel} media-sourced items must keep claimStatus as reported.`);
  }

  if (!/完整事实/.test(provenance) || !/原文/.test(provenance)) {
    errors.push(`${itemLabel} media provenance must assign complete facts to the original article.`);
  }

  if (!originalArticleFactsPattern.test(detailBoundaryText)) {
    errors.push(`${itemLabel} media detail boundary must name what remains in the original article or original materials.`);
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

  validateMobileReaderFrame(frame.mobile, context);

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

function validateMobileReaderFrame(mobileFrame, context) {
  if (!mobileFrame || typeof mobileFrame !== "object" || Array.isArray(mobileFrame)) {
    errors.push(`${context} readerFrame.mobile must give phone readers a shorter scan path.`);
    return;
  }

  if (typeof mobileFrame.headline !== "string" || mobileFrame.headline.trim().length < 6 || mobileFrame.headline.length > 18) {
    errors.push(`${context} readerFrame.mobile.headline must be a short Chinese mobile headline.`);
  }

  if (typeof mobileFrame.summary !== "string" || mobileFrame.summary.trim().length < 20 || mobileFrame.summary.length > 45) {
    errors.push(`${context} readerFrame.mobile.summary must fit a short phone scan.`);
  }

  if (!Array.isArray(mobileFrame.primaryUses) || mobileFrame.primaryUses.length < 2 || mobileFrame.primaryUses.length > 3) {
    errors.push(`${context} readerFrame.mobile.primaryUses must include two or three compact reader actions.`);
  }

  for (const [index, item] of (mobileFrame.primaryUses || []).entries()) {
    if (typeof item !== "string" || item.length > 24 || !/团队|读者|用户|编辑/.test(item)) {
      errors.push(`${context} readerFrame.mobile.primaryUses[${index}] must name a concrete reader or team in compact Chinese.`);
    }
  }

  if (
    typeof mobileFrame.proofBoundary !== "string" ||
    mobileFrame.proofBoundary.trim().length < 18 ||
    mobileFrame.proofBoundary.length > 42 ||
    !/不能|尚未|不证明|仍需|缺少/.test(mobileFrame.proofBoundary)
  ) {
    errors.push(`${context} readerFrame.mobile.proofBoundary must state one compact unresolved proof boundary.`);
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

function validateOverreadBoundary(boundary, sourceFamilies = [], items = [], context) {
  const dominantFamily = (sourceFamilies || []).find(
    (family) => Number.isInteger(family.count) && family.count >= Math.ceil((items || []).length * 0.67),
  );

  if (!dominantFamily) {
    return;
  }

  if (!boundary || typeof boundary !== "object" || Array.isArray(boundary)) {
    errors.push(`${context} must include overreadBoundary when one evidence mode dominates.`);
    return;
  }

  const requiredFields = ["label", "body", "doNotConclude", "useInstead"];

  for (const field of requiredFields) {
    if (typeof boundary[field] !== "string" || !boundary[field].trim()) {
      errors.push(`${context} overreadBoundary.${field} must be non-empty Chinese copy.`);
    }
  }

  if (!/不要|过度|误读/.test(`${boundary.label || ""}${boundary.body || ""}`)) {
    errors.push(`${context} overreadBoundary must explicitly warn readers not to overread the batch.`);
  }

  if (!/不能|不证明|不代表|尚未/.test(boundary.doNotConclude || "")) {
    errors.push(`${context} overreadBoundary.doNotConclude must state the conclusion readers cannot draw.`);
  }

  if (!/官方|原文|公告|文件|备案|合同|数据|指标|benchmark|第三方|复核/.test(boundary.useInstead || "")) {
    errors.push(`${context} overreadBoundary.useInstead must name the next evidence source or proof type.`);
  }

  if (!/用来|适合|先把|应该/.test(boundary.useInstead || "")) {
    errors.push(`${context} overreadBoundary.useInstead must use homepage-safe action wording such as 用来, 适合, 先把, or 应该.`);
  }
}

function validateTrendNotes(notes, context) {
  if (!Array.isArray(notes) || notes.length < 2) {
    errors.push(`${context} must include at least two cross-edition trend notes.`);
    return;
  }

  const seenTopics = new Set();

  for (const [index, note] of notes.entries()) {
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      errors.push(`${context} trendNotes[${index}] must be an object.`);
      continue;
    }

    if (
      typeof note.topic !== "string" ||
      typeof note.label !== "string" ||
      typeof note.note !== "string" ||
      typeof note.boundary !== "string"
    ) {
      errors.push(`${context} trendNotes[${index}] must include topic, label, note, and boundary.`);
      continue;
    }

    if (seenTopics.has(note.topic)) {
      errors.push(`${context} trendNotes repeats topic ${note.topic}.`);
    }

    if (note.label.trim().length < 4 || note.label.trim().length > 18) {
      errors.push(`${context} trendNotes[${index}].label should be a compact Chinese label.`);
    }

    if (!/跨期|连续|再次|延续|历史|归档/.test(note.note)) {
      errors.push(`${context} trendNotes[${index}].note must frame a recurring cross-edition signal.`);
    }

    if (!/不证明|不能|仍需|尚未/.test(note.boundary)) {
      errors.push(`${context} trendNotes[${index}].boundary must state the evidence boundary.`);
    }

    if (!/官方|原文|公告|文件|复核|复现|第三方|审计|监管|数据|指标/.test(note.boundary)) {
      errors.push(`${context} trendNotes[${index}].boundary must name the next evidence source or proof type.`);
    }

    seenTopics.add(note.topic);
  }
}

function validateCompanyContinuity(notes, currentItems, context) {
  if (!Array.isArray(notes) || notes.length < 2) {
    errors.push(`${context} must include at least two companyContinuity notes for recurring companies.`);
    return;
  }

  const currentCompanies = new Set(
    (currentItems || []).flatMap((item) => (Array.isArray(item.companies) ? item.companies : [])).map(String),
  );
  const seenCompanies = new Set();

  for (const [index, note] of notes.entries()) {
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      errors.push(`${context} companyContinuity[${index}] must be an object.`);
      continue;
    }

    const requiredFields = ["company", "label", "lastMention", "whatChanged", "stillUnproven"];

    for (const field of requiredFields) {
      if (typeof note[field] !== "string" || !note[field].trim()) {
        errors.push(`${context} companyContinuity[${index}].${field} must be non-empty Chinese copy.`);
      }
    }

    if (seenCompanies.has(note.company)) {
      errors.push(`${context} companyContinuity repeats company ${note.company}.`);
    }

    if (note.company && !currentCompanies.has(note.company)) {
      errors.push(`${context} companyContinuity[${index}].company must match a current item companies entry.`);
    }

    if (note.label && (note.label.trim().length < 4 || note.label.trim().length > 18)) {
      errors.push(`${context} companyContinuity[${index}].label should be a compact Chinese label.`);
    }

    if (!/上次|此前|上一|历史|归档|连续/.test(note.lastMention || "")) {
      errors.push(`${context} companyContinuity[${index}].lastMention must name the prior mention or continuity context.`);
    }

    if (!/本期|这次|新增|转向|推进|变成|从/.test(note.whatChanged || "")) {
      errors.push(`${context} companyContinuity[${index}].whatChanged must state what changed in this edition.`);
    }

    if (!/不证明|不能|仍未|尚未|仍需/.test(note.stillUnproven || "")) {
      errors.push(`${context} companyContinuity[${index}].stillUnproven must state what remains unproven.`);
    }

    if (!/官方|原文|公告|文件|财报|案卷|合同|日志|审计|指标|第三方|监管|数据/.test(note.stillUnproven || "")) {
      errors.push(`${context} companyContinuity[${index}].stillUnproven must name the next evidence source or proof type.`);
    }

    seenCompanies.add(note.company);
  }
}

function validateTopicContinuity(notes, topicGroups = [], context) {
  if (!Array.isArray(notes) || notes.length < 2) {
    errors.push(`${context} must include at least two topicContinuity notes for recurring topics.`);
    return;
  }

  const currentTopics = new Set((topicGroups || []).map((topic) => topic.id).map(String));
  const seenTopics = new Set();
  const allowedStatuses = new Set(["stronger", "weaker", "repeated"]);

  for (const [index, note] of notes.entries()) {
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      errors.push(`${context} topicContinuity[${index}] must be an object.`);
      continue;
    }

    const requiredFields = ["topic", "label", "status", "previousPattern", "currentSignal", "signalDirection", "stillUnproven"];

    for (const field of requiredFields) {
      if (typeof note[field] !== "string" || !note[field].trim()) {
        errors.push(`${context} topicContinuity[${index}].${field} must be non-empty copy.`);
      }
    }

    if (seenTopics.has(note.topic)) {
      errors.push(`${context} topicContinuity repeats topic ${note.topic}.`);
    }

    if (note.topic && !currentTopics.has(note.topic)) {
      errors.push(`${context} topicContinuity[${index}].topic must match a current topicGroups id.`);
    }

    if (note.status && !allowedStatuses.has(note.status)) {
      errors.push(`${context} topicContinuity[${index}].status must be stronger, weaker, or repeated.`);
    }

    if (note.label && (note.label.trim().length < 4 || note.label.trim().length > 18)) {
      errors.push(`${context} topicContinuity[${index}].label should be a compact Chinese label.`);
    }

    if (!/上次|此前|上一|历史|归档|连续/.test(note.previousPattern || "")) {
      errors.push(`${context} topicContinuity[${index}].previousPattern must name the prior topic pattern.`);
    }

    if (!/本期|这次|新增|继续|再次|延续/.test(note.currentSignal || "")) {
      errors.push(`${context} topicContinuity[${index}].currentSignal must state what this edition adds or repeats.`);
    }

    if (!/增强|减弱|重复/.test(note.signalDirection || "")) {
      errors.push(`${context} topicContinuity[${index}].signalDirection must say whether the signal is stronger, weaker, or repeated.`);
    }

    if (!/不证明|不能|仍未|尚未|仍需/.test(note.stillUnproven || "")) {
      errors.push(`${context} topicContinuity[${index}].stillUnproven must state what remains unproven.`);
    }

    if (!/官方|原文|公告|文件|财报|合同|日志|审计|指标|第三方|监管|数据|报告/.test(note.stillUnproven || "")) {
      errors.push(`${context} topicContinuity[${index}].stillUnproven must name the next evidence source or proof type.`);
    }

    seenTopics.add(note.topic);
  }
}

function splitCopySentences(value) {
  return String(value || "")
    .split(/[。！？!?；;]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 14);
}

function normalizeAuditSentence(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[，。、：；,.!?:;·"“”‘’（）()《》<>【】[\]]/g, "");
}

function collectHomepageCaveatSentences(edition) {
  const caveatFields = [
    ["readerFrame.whyItMatters", edition?.readerFrame?.whyItMatters],
    ["readerFrame.mobile.proofBoundary", edition?.readerFrame?.mobile?.proofBoundary],
    ...(edition?.readerFrame?.notProvenYet || []).map((value, index) => [
      `readerFrame.notProvenYet[${index}]`,
      value,
    ]),
    ["sourceRisk.note", edition?.sourceRisk?.note],
    ["sourceRisk.nextCheck", edition?.sourceRisk?.nextCheck],
    ...(edition?.trendNotes || []).flatMap((note, index) => [
      [`trendNotes[${index}].note`, note?.note],
      [`trendNotes[${index}].boundary`, note?.boundary],
    ]),
  ];

  return caveatFields.flatMap(([field, value]) => {
    return splitCopySentences(value).map((sentence) => ({
      field,
      sentence,
      normalized: normalizeAuditSentence(sentence),
    }));
  });
}

function validateHomepageCaveatCopyAudit(edition, context) {
  const seenSentences = new Map();

  for (const record of collectHomepageCaveatSentences(edition)) {
    if (record.normalized.length < 12) {
      continue;
    }

    const previous = seenSentences.get(record.normalized);

    if (previous && previous.field !== record.field) {
      errors.push(
        `${context} repeats a caveat sentence across ${previous.field} and ${record.field}: "${record.sentence}". Keep reader frame, source risk, and trend notes distinct.`,
      );
    }

    seenSentences.set(record.normalized, record);
  }
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function assertLatestHistoryMatchesCurrent(currentEdition, latestHistoryEdition, currentItems) {
  if (!currentEdition || !latestHistoryEdition) {
    return;
  }

  const scalarFields = [
    "id",
    "date",
    "timezone",
    "archiveStatus",
    "archiveLabel",
    "note",
    "operationalStatus",
    "editorialInterpretation",
  ];
  const structuredFields = [
    "readerFrame",
    "changeSummary",
    "overreadBoundary",
    "coverageMix",
    "sourceFamilies",
    "sourceRisk",
    "sourceConcentration",
    "trendNotes",
    "topicContinuity",
    "companyContinuity",
    "topicGroups",
  ];

  for (const field of scalarFields) {
    if (latestHistoryEdition[field] !== currentEdition[field]) {
      errors.push(`Archive readiness mismatch: latest history edition ${field} must match data/news.json edition.${field}.`);
    }
  }

  for (const field of structuredFields) {
    if (stableStringify(latestHistoryEdition[field]) !== stableStringify(currentEdition[field])) {
      errors.push(`Archive readiness mismatch: latest history edition ${field} must match data/news.json edition.${field}.`);
    }
  }

  if (latestHistoryEdition.itemCount !== currentItems.length) {
    errors.push("Archive readiness mismatch: latest history edition itemCount must match current items length.");
  }

  const currentItemIds = currentItems.map((item) => item.id);
  const latestItemIds = Array.isArray(latestHistoryEdition.items)
    ? latestHistoryEdition.items.map((item) => item.id)
    : [];

  if (stableStringify(latestItemIds) !== stableStringify(currentItemIds)) {
    errors.push("Archive readiness mismatch: latest history edition item order must match current news item order.");
  }
}

function hasChineseText(value) {
  return /\p{Script=Han}/u.test(String(value || ""));
}

function normalizedCopy(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、：；,.!?:;·]/g, "");
}

function assertReadableMetadataLine(value, limit, message) {
  if (typeof value === "string" && value.length > limit) {
    errors.push(message);
  }
}

function validateEditionMetadataReadability(edition, context, editorNote = "") {
  if (!edition) {
    return;
  }

  assertReadableMetadataLine(
    editorNote,
    120,
    `${context} editorNote should stay concise and avoid repeating dedicated edition metadata.`,
  );
  assertReadableMetadataLine(
    edition.operationalStatus,
    90,
    `${context} operationalStatus should stay concise and only describe retrieval/source checks.`,
  );
  assertReadableMetadataLine(
    edition.editorialInterpretation,
    90,
    `${context} editorialInterpretation should stay concise and avoid repeating operational details.`,
  );
  assertReadableMetadataLine(
    edition.sourceRisk?.note,
    80,
    `${context} sourceRisk.note should be a compact source-concentration warning.`,
  );
  assertReadableMetadataLine(
    edition.sourceRisk?.nextCheck,
    70,
    `${context} sourceRisk.nextCheck should name the next independent check concisely.`,
  );
  assertReadableMetadataLine(
    edition.sourceConcentration?.note,
    90,
    `${context} sourceConcentration.note should be a compact source-owner concentration warning.`,
  );
  assertReadableMetadataLine(
    edition.sourceConcentration?.nextCheck,
    80,
    `${context} sourceConcentration.nextCheck should name the next independent owner or source type concisely.`,
  );

  const editorNoteText = normalizedCopy(editorNote);
  const repeatedFields = [
    ["operationalStatus", edition.operationalStatus],
    ["editorialInterpretation", edition.editorialInterpretation],
    ["sourceRisk.note", edition.sourceRisk?.note],
    ["sourceRisk.nextCheck", edition.sourceRisk?.nextCheck],
    ["sourceConcentration.note", edition.sourceConcentration?.note],
    ["sourceConcentration.nextCheck", edition.sourceConcentration?.nextCheck],
  ];

  for (const [field, value] of repeatedFields) {
    const fieldText = normalizedCopy(value);

    if (editorNoteText && fieldText && (editorNoteText.includes(fieldText) || fieldText.includes(editorNoteText))) {
      errors.push(`${context} editorNote repeats ${field}; keep each metadata field responsible for one job.`);
    }
  }
}

function validateWhoShouldCare(item, context) {
  if (!item.whoShouldCare) {
    errors.push(`${context} ${item.id} must include whoShouldCare for promoted readers.`);
    return;
  }

  const audienceCopy = String(item.whoShouldCare);

  if (
    audienceCopy.length < 32 ||
    !/团队|读者|用户|负责人|投资|采购|法务|合规|政策|业务|工程|产品|审计|安全|研发/.test(audienceCopy)
  ) {
    errors.push(`${context} ${item.id} whoShouldCare must name concrete Chinese reader groups.`);
  }

  if (/industry observers|行业观察者|相关团队|相关从业者|AI 从业者|技术人员|业内人士/i.test(audienceCopy)) {
    errors.push(`${context} ${item.id} whoShouldCare must avoid generic observer or practitioner labels.`);
  }

  if (!/负责|正在|要把|需要|使用|部署|采购|评估|审计|运营|排障|治理|规划|上线|接入|处理/.test(audienceCopy)) {
    errors.push(`${context} ${item.id} whoShouldCare must include the concrete work setting that makes the audience relevant.`);
  }

  if (item.readerUse && normalizedCopy(item.whoShouldCare) === normalizedCopy(item.readerUse)) {
    errors.push(`${context} ${item.id} whoShouldCare must be distinct from readerUse.`);
  }
}

function validateCounterEvidenceSpecificity(item, context) {
  const counterEvidence = String(item.counterEvidence || "");

  if (!counterEvidence) {
    return;
  }

  if (!/如果|若|缺少|未|不/.test(counterEvidence)) {
    errors.push(`${context} ${item.id} counterEvidence must name a condition that would weaken the current editorial judgment.`);
  }

  if (!/文件|公告|说明|声明|日志|记录|指标|数据|审批|采购|政策|角色|职责|发布|复测|确认|否认|通过/.test(counterEvidence)) {
    errors.push(
      `${context} ${item.id} counterEvidence must name a concrete proof type, source artifact, or observable outcome for follow-up.`,
    );
  }

  if (!/下调|收窄|削弱|降低|降级|限定/.test(counterEvidence)) {
    errors.push(`${context} ${item.id} counterEvidence must say how the editorial judgment should be downgraded.`);
  }
}

function validateEvidenceThresholdSpecificity(item, context) {
  const evidenceThreshold = String(item.evidenceThreshold || "");

  if (!evidenceThreshold) {
    return;
  }

  if (!/至少需要|需要|必须|等待/.test(evidenceThreshold)) {
    errors.push(`${context} ${item.id} evidenceThreshold must state that more evidence is required before upgrade.`);
  }

  if (!/文件|文本|公告|说明|声明|资料|日志|记录|指标|数据|审批|采购|政策|规则|角色|职责|发布|复测|报告|确认/.test(evidenceThreshold)) {
    errors.push(
      `${context} ${item.id} evidenceThreshold must name the source artifact, proof type, or observable result needed for upgrade.`,
    );
  }

  if (!/升级为|改判为|确认|已确认|事实结论|落地政策|验证/.test(evidenceThreshold)) {
    errors.push(`${context} ${item.id} evidenceThreshold must say what verified editorial status the item can be upgraded to.`);
  }
}

function validateDeepBriefingReference(reference, index, context) {
  const label = String(reference?.label || "").trim();
  const url = String(reference?.url || "").trim();
  const sourceNamePattern = /(OpenAI|Anthropic|Google|DeepMind|Microsoft|Meta|Mistral|NVIDIA|FT|Financial Times|Guardian|MarketWatch|Reuters|AP|The Verge|TechCrunch|arXiv|论文|官方|博客|公告|研究|媒体|监管)/i;
  const sourceFactPattern = /(发布|宣布|报道|分析|确认|披露|说明|介绍|提出|显示|追踪|讨论|限制|禁令|主权|人才|模型|政策|研究|实验|基准|融资|收购|合作|访问|来源|原文)/;

  if (!label || !url) {
    errors.push(`${context} references[${index}] must include label and url.`);
    return;
  }

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      errors.push(`${context} references[${index}] must use an http or https URL.`);
    }
  } catch {
    errors.push(`${context} references[${index}] has invalid url ${url}.`);
  }

  if (label.length < 12 || label.length > 48) {
    errors.push(`${context} references[${index}] label should be a concise source-fact description.`);
  }

  if (!sourceNamePattern.test(label)) {
    errors.push(`${context} references[${index}] label must name the source or source family.`);
  }

  if (!sourceFactPattern.test(label)) {
    errors.push(`${context} references[${index}] label must describe the source fact, not just the source owner.`);
  }
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
      item.whoShouldCare,
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

function validateSourceConcentration(concentration, items, context) {
  const sourceCounts = new Map();

  for (const item of items || []) {
    const sourceId = String(item.sourceId || "").trim();

    if (sourceId) {
      sourceCounts.set(sourceId, (sourceCounts.get(sourceId) || 0) + 1);
    }
  }

  const dominantEntry = [...sourceCounts.entries()].sort((first, second) => second[1] - first[1])[0];
  const dominantSourceId = dominantEntry?.[0];
  const dominantCount = dominantEntry?.[1] || 0;
  const itemCount = (items || []).length;
  const hasDominantOwner = itemCount > 1 && dominantCount >= Math.ceil(itemCount * 0.67);

  if (!hasDominantOwner) {
    return;
  }

  if (!concentration || typeof concentration !== "object" || Array.isArray(concentration)) {
    errors.push(`${context} must include sourceConcentration when one source owner supplies most current items.`);
    return;
  }

  const source = sourcesById.get(concentration.sourceId);

  if (!source) {
    errors.push(`${context} sourceConcentration.sourceId must match data/sources.json.`);
  }

  if (concentration.sourceId !== dominantSourceId) {
    errors.push(`${context} sourceConcentration.sourceId must name the dominant current source owner.`);
  }

  if (concentration.sourceName !== source?.name) {
    errors.push(`${context} sourceConcentration.sourceName must match the registered source name.`);
  }

  if (concentration.count !== dominantCount) {
    errors.push(`${context} sourceConcentration.count must match current item sourceId concentration.`);
  }

  if (concentration.share !== `${dominantCount}/${itemCount}`) {
    errors.push(`${context} sourceConcentration.share must be written as dominant count over current item count.`);
  }

  if (!/同一|单一|集中|全部|来源/.test(String(concentration.note || ""))) {
    errors.push(`${context} sourceConcentration.note must explicitly warn about one source owner concentration.`);
  }

  if (!/其他|独立|官方|媒体|监管|论文|原文|第三方|复现/.test(String(concentration.nextCheck || ""))) {
    errors.push(`${context} sourceConcentration.nextCheck must name the independent source owner or source type to check next.`);
  }
}

function validateSourceRegistryReadability(registry) {
  const trustLevels = registry.trustLevels || {};
  for (const family of allowedSourceFamilies) {
    const description = String(trustLevels[family] || "");
    if (!chineseTextPattern.test(description) || !sourceRoleBoundaryPattern.test(description)) {
      errors.push(`data/sources.json trustLevels.${family} must be a Chinese source-role description.`);
    }

    if (englishSourceInstructionPattern.test(description)) {
      errors.push(`data/sources.json trustLevels.${family} should not use English source instructions.`);
    }
  }

  const policyText = Object.values(registry.policy || {}).join(" ");
  if (!chineseTextPattern.test(policyText) || !/中文|原始|官方|媒体|社区|事实|核对/.test(policyText)) {
    errors.push("data/sources.json policy must give Chinese source-use guidance.");
  }

  for (const [index, source] of (registry.sources || []).entries()) {
    const notes = String(source.notes || "");
    if (!chineseTextPattern.test(notes) || !sourceRoleBoundaryPattern.test(notes)) {
      errors.push(`data/sources.json sources[${index}] notes must explain the source role in Chinese.`);
    }

    if (englishSourceInstructionPattern.test(notes)) {
      errors.push(`data/sources.json sources[${index}] notes should avoid English source-use instructions.`);
    }
  }
}

if (!Array.isArray(sourceRegistry.sources) || !sourceRegistry.sources.length) {
  errors.push("data/sources.json must include at least one source.");
} else {
  validateSourceRegistryReadability(sourceRegistry);
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
    validateWhoShouldCare(item, "data/news.json promoted item");
    validateIncidentBriefingReadiness(item, "data/news.json promoted item");
    validateEvidenceThresholdSpecificity(item, "data/news.json promoted item");
    validatePromotedVendorNarrativeCard(item, "data/news.json promoted item");
  }
}

if (newsFeed.sourceCount !== sourceRegistry.sources.length) {
  errors.push("data/news.json sourceCount must match data/sources.json sources.length.");
}

if (!Array.isArray(newsFeed.categories) || !newsFeed.categories.length) {
  errors.push("data/news.json must include category definitions.");
} else {
  const categoryIds = new Set();
  validateCategoryDescriptionAnchors(newsFeed.categories, Array.isArray(newsFeed.items) ? newsFeed.items : []);

  for (const [index, category] of newsFeed.categories.entries()) {
    for (const field of requiredCategoryFields) {
      if (!category[field]) {
        errors.push(`data/news.json categories[${index}] is missing ${field}.`);
      }
    }

    if (category.description) {
      if (!/(筛选|用来|用于|核对|检查|更新)/.test(category.description)) {
        errors.push(`data/news.json categories[${index}] description must explain the reader use of this category.`);
      }

      if (!/(本期|当前|这批|今日)/.test(category.description)) {
        errors.push(`data/news.json categories[${index}] description must be reviewed against the current item set.`);
      }

      if (!/(需|仍|边界|不直接|等待|确认|验证|复现)/.test(category.description)) {
        errors.push(`data/news.json categories[${index}] description must include an evidence or proof-boundary caveat.`);
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
  validateOverreadBoundary(
    newsFeed.edition.overreadBoundary,
    newsFeed.edition.sourceFamilies,
    newsFeed.items || [],
    "data/news.json edition",
  );
  validateTrendNotes(newsFeed.edition.trendNotes, "data/news.json edition");
  validateTopicContinuity(newsFeed.edition.topicContinuity, newsFeed.edition.topicGroups, "data/news.json edition");
  validateCompanyContinuity(newsFeed.edition.companyContinuity, newsFeed.items || [], "data/news.json edition");
  validateSourceConcentration(newsFeed.edition.sourceConcentration, newsFeed.items || [], "data/news.json edition");
  validateEditionMetadataReadability(newsFeed.edition, "data/news.json edition", newsFeed.editorNote);
  validateHomepageCaveatCopyAudit(newsFeed.edition, "data/news.json edition");
  validateShortBatchEditorialNote(newsFeed.edition, newsFeed.items || [], "data/news.json edition");

  if (!Array.isArray(newsFeed.edition.coverageMix) || newsFeed.edition.coverageMix.length < 2) {
    errors.push("data/news.json edition must include at least two coverageMix entries.");
  } else {
    validateCoverageMixShape(newsFeed.edition.coverageMix, "data/news.json edition");

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

      if (entry.label && !isActionOrientedCoverageLabel(entry.label)) {
        errors.push(
          `data/news.json edition coverageMix[${index}] label must answer what readers should check now, not only name a topic.`,
        );
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

  if (!Array.isArray(newsFeed.deepBriefing.references) || !newsFeed.deepBriefing.references.length) {
    errors.push("data/news.json deepBriefing must include source references.");
  } else {
    for (const [index, reference] of newsFeed.deepBriefing.references.entries()) {
      validateDeepBriefingReference(reference, index, "data/news.json deepBriefing");
    }
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

  validateCounterEvidenceSpecificity(item, "data/news.json item");
  validateDetailParagraphLength(item, "data/news.json item");
  validateDetailTrendSplit(item, "data/news.json item");

  validateVendorClaimBoundary(item, "data/news.json item");
  validateMediaSourceReminder(item, "data/news.json item");
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

  assertLatestHistoryMatchesCurrent(newsFeed.edition, latestHistoryEdition, newsFeed.items || []);
  validateReaderFrame(latestHistoryEdition.readerFrame, "data/news-history.json latest edition");
  validateEditionChangeSummary(latestHistoryEdition.changeSummary, "data/news-history.json latest edition");
  validateTrendNotes(latestHistoryEdition.trendNotes, "data/news-history.json latest edition");
  validateTopicContinuity(
    latestHistoryEdition.topicContinuity,
    latestHistoryEdition.topicGroups,
    "data/news-history.json latest edition",
  );
  validateCompanyContinuity(
    latestHistoryEdition.companyContinuity,
    latestHistoryEdition.items || [],
    "data/news-history.json latest edition",
  );
  validateHomepageCaveatCopyAudit(latestHistoryEdition, "data/news-history.json latest edition");
  validateShortBatchEditorialNote(
    latestHistoryEdition,
    latestHistoryEdition.items || [],
    "data/news-history.json latest edition",
  );
  validateSourceConcentration(
    latestHistoryEdition.sourceConcentration,
    latestHistoryEdition.items || [],
    "data/news-history.json latest edition",
  );

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

      validateEditionMetadataReadability(edition, "data/news-history.json latest edition");
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
        validateWhoShouldCare(item, "data/news-history.json latest promoted item");
        validateIncidentBriefingReadiness(item, "data/news-history.json latest promoted item");
        validateEvidenceThresholdSpecificity(item, "data/news-history.json latest promoted item");
        validateCounterEvidenceSpecificity(item, "data/news-history.json latest promoted item");
        validateDetailParagraphLength(item, "data/news-history.json latest promoted item");
        validateDetailTrendSplit(item, "data/news-history.json latest item");
        validateMediaSourceReminder(item, "data/news-history.json latest item");
        validatePromotedVendorNarrativeCard(item, "data/news-history.json latest promoted item");
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
