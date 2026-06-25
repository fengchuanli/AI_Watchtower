# Candidate Intake Format

Use this lightweight record before turning a discovered URL into `data/news.json`. The goal is to preserve the editor's source judgment and drafting decision without copying source text or creating a long internal database.

This format sits between `docs/candidate-source-checklist.md`, `docs/candidate-priority-rubric.md`, and `docs/editorial-checklist.md`:

1. The candidate checklist decides whether a URL is allowed into intake.
2. This intake record captures the minimum editorial judgment needed before drafting.
3. The priority rubric ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
4. The editorial checklist and validators review the finished `data/news.json` item.

## Required Intake Fields

Each candidate record should answer these fields in Chinese unless the value is a product, source, paper, or organization name.

- `candidateUrl`: Exact source URL. Prefer the original article, announcement, paper, filing, changelog, or policy page.
- `sourceId`: Matching `data/sources.json` source ID, or `unregistered-hold` if the source must be reviewed before drafting.
- `sourceName`: Human-readable source name.
- `sourceRole`: One of `官方核对`, `研究原文`, `媒体背景`, `社区发现`, or `厂商主张`.
- `publishedAt`: Source publication or update time, including timezone when available.
- `discoveryRoute`: How the candidate was found, such as official RSS, source homepage, reliable-media scan, search query, or manual tip.
- `sourceBackedFact`: One short sentence stating only what the source directly supports.
- `aiRelevance`: One short sentence explaining why this matters to AI readers now.
- `proofBoundary`: What this source does not prove.
- `nextIndependentCheck`: The official, original, regulator, filing, paper, customer-side, audit, metric, replication, or independent source needed next.
- `duplicateStatus`: Result of checking `data/news-history.json`, current `data/news.json`, and `node scripts/report-duplicate-candidates.mjs` when a batch file exists.
- `copyrightPosture`: How the item will avoid becoming a source-article replacement, especially for media and paywalled sources.
- `priorityScore`: Optional batch score from `docs/candidate-priority-rubric.md`, used after source safety is settled and before drafting order is chosen.
- `priorityReason`: Optional one-sentence explanation of the score, especially when a lower-scoring item is held for source diversity or copyright safety.
- `draftingDecision`: `draft`, `hold`, or `reject`.
- `decisionReason`: Why the editor chose that decision.

## Decision Rules

Use `draft`, `hold`, or `reject` as the intake decision. Use `draft` only when the candidate has a source-backed fact, clear AI relevance, a named proof boundary, a next independent check, no unresolved duplicate, and a copyright-safe path to concise Chinese explanation.

Use `hold` when the candidate may become useful but needs registration, a better original source, clearer date, duplicate review, independent confirmation, or a stronger AI consequence.

Use `reject` when the candidate is paywall/body-dependent, login-only, repeated, shallow commentary, routine marketing, weakly AI-related, unverifiable, or unable to support a detail-page briefing.

## Minimal JSON Example

```json
{
  "candidateUrl": "https://example.com/source-page",
  "sourceId": "example-source",
  "sourceName": "Example Source",
  "sourceRole": "媒体背景",
  "publishedAt": "2026-06-24T17:00:00+09:00",
  "discoveryRoute": "reliable-media scan",
  "sourceBackedFact": "该来源报道了某 AI 公司的一项新合同或政策动作。",
  "aiRelevance": "这会影响中文读者判断 AI 基础设施、合规或产品可用性。",
  "proofBoundary": "该报道不能单独证明合同已经执行或客户效果已经出现。",
  "nextIndependentCheck": "下一步需要公司公告、合同文件、监管披露或客户侧指标。",
  "duplicateStatus": "未发现重复 URL；相似标题待人工确认。",
  "copyrightPosture": "只记录最小事实，完整采访、图表、细节和上下文请读原文。",
  "priorityScore": 6,
  "priorityReason": "读者效用清楚，但仍需要官方文件确认，且媒体来源必须保持最小事实。",
  "draftingDecision": "hold",
  "decisionReason": "需要找到官方文件后再决定是否进入当前批次。"
}
```

## Drafting Handoff

Before drafting, convert the intake record into these `data/news.json` responsibilities:

- `sourceBackedFact` becomes the basis for `body`, `summary`, and `detailBody`, kept short.
- `aiRelevance` informs `whyItMatters`, `impact`, `readerUse`, and `whoShouldCare`.
- `proofBoundary` informs `claimBoundary`, `provenance`, and media-source `originalDependency`.
- `nextIndependentCheck` informs `nextCheck`, `evidenceThreshold`, and `followUpQuestions`.
- `duplicateStatus` and `copyrightPosture` should remain visible in the editor's decision, even when they do not become public copy.
- `priorityScore` and `priorityReason` decide drafting order only; they should not be published as a false precision score for readers.

Do not paste source paragraphs into intake records. If a field cannot be answered without copying source text, keep the candidate on hold and revisit the original source manually.
