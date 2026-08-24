# Candidate Intake Format

Use this lightweight record before turning a discovered URL into `data/news.json`. The goal is to preserve the editor's source judgment and drafting decision without copying source text or creating a long internal database.

This format sits after the readable editor path in `docs/candidate-workflow-plain-language-guide.md` and between `docs/candidate-source-checklist.md`, `docs/candidate-hold-reject-reasons.md`, `docs/held-candidate-review-note.md`, `docs/candidate-priority-rubric.md`, `docs/source-diversity-triage-note.md`, `docs/original-source-replacement-guide.md`, `docs/candidate-to-news-handoff.md`, `docs/update-run-checklist.md`, and `docs/editorial-checklist.md`.

## Where This Record Starts And Ends

Use this entry order when candidate workflow documents feel overlapping:

1. `docs/candidate-workflow-plain-language-guide.md` is the human decision path: what happened, why it matters, what remains unproven, and whether the item should draft, hold, or reject.
2. `docs/candidate-source-checklist.md` is the hard source gate: source role, timestamp, copyright/paywall safety, duplicate risk, original-source need, and concentration risk.
3. This intake format is the structured record only after the source gate passes or after a `hold` / `reject` reason must be preserved. It should capture short field answers, not reopen source judgment or become public copy.
4. `docs/candidate-to-news-handoff.md` starts only after `draftingDecision` is `draft`, when the editor maps safe intake fields into `data/news.json`.

If the source checklist blocks a URL, do not fill a full intake as if it were draft-ready. Record only the blocker, reason code, and any held-candidate review timing needed for a later recheck.

The normal sequence is:

1. The plain-language guide asks the editor to answer what happened, why it matters, what is unproven, which source is safest, whether the batch is balanced, and whether the item should draft, hold, or reject.
2. The candidate checklist decides whether a URL is allowed into intake.
3. This intake record captures the minimum editorial judgment needed before drafting.
4. The hold/reject vocabulary keeps non-draft decisions consistent and reviewable.
5. The held-candidate review note records promising non-draft leads with `holdUntilJst`, `recheckTrigger`, `freshnessLimit`, and `staleFallback` so later runs do not treat old leads as fresh current news.
6. The priority rubric ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
7. The source-diversity triage note checks whether the draftable batch is too concentrated by owner, source family, evidence mode, company, geography, or narrative angle.
8. The original-source replacement guide decides whether a media report should be replaced by an official, filing, paper, regulator, customer-side, dataset, or benchmark original before drafting.
9. The candidate-to-news handoff maps intake fields into `data/news.json` fields without duplicating source article text.
10. The update-run checklist records source discovery, candidate intake, duplicate reporting, drafting, validation, commit, and push status for the whole news update.
11. The editorial checklist and validators review the finished `data/news.json` item.

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
- `originalSourceSearch`: For media-started candidates, whether `docs/original-source-replacement-guide.md` found a stronger original source, found none, or intentionally kept the media report as a limited signal.
- `duplicateStatus`: Result of checking `data/news-history.json`, current `data/news.json`, and `node scripts/report-duplicate-candidates.mjs` when a batch file exists.
- `copyrightPosture`: How the item will avoid becoming a source-article replacement, especially for media and paywalled sources.
- `priorityScore`: Optional batch score from `docs/candidate-priority-rubric.md`, used after source safety is settled and before drafting order is chosen.
- `priorityReason`: Optional one-sentence explanation of the score, especially when a lower-scoring item is held for source diversity or copyright safety.
- `batchDiversityNote`: Optional note from `docs/source-diversity-triage-note.md` when safe candidates are concentrated by source owner, source family, evidence mode, company, geography, or narrative angle.
- `draftingDecision`: `draft`, `hold`, or `reject`.
- `decisionReason`: Why the editor chose that decision. For `hold` or `reject`, start with a reason code from `docs/candidate-hold-reject-reasons.md`, then add one short Chinese sentence naming the concrete blocker.

## Duplicate Status Interpretation

Use `duplicateStatus` to explain what the duplicate check means, not only whether the script found a match. The field should help the next editor decide whether the candidate is blocked, needs review, or can still be drafted because it contains a genuinely new source fact.

| Status | Meaning | Drafting decision |
| --- | --- | --- |
| `repeated-url` | The candidate uses the same normalized source URL as a current or archived item, or another candidate in the same batch. | Usually `reject-repeated-source-fact`; use `hold-duplicate-review` only if the page itself was materially updated and the new fact can be named. |
| `near-title-review` | The title resembles a current, archived, or same-batch candidate, but the URL may be different. | Hold until the editor compares the exact source-backed fact; similar wording alone is not proof of duplication. |
| `fresh-source-fact` | A repeated topic or similar title has a new source-specific action, such as a new official announcement, filing, audit result, model card, customer metric, regulator text, paper revision, or independent benchmark. | Draft only if `sourceBackedFact` names that new action and `proofBoundary` says what remains unproven. |
| `manual-clear` | No repeated URL or near-title match appeared in the script report, or no batch file existed and the editor manually checked current and history URLs/titles. | Drafting can continue if the other source, proof-boundary, copyright, and batch-mix gates also pass. |

Do not mark a candidate as fresh only because a media outlet rewrote the same event, a company repeated a marketing claim, or the title uses different Chinese wording. Freshness needs a new source-backed fact visible in `sourceBackedFact`; otherwise keep the item on hold or reject it as repeated.

## Intake Scratch Template

During 08:00 and 17:00 JST news runs, paste this short block into the run note before drafting. It is a scratch template, not a public article and not a place to paste source paragraphs. Fill one block per candidate, then convert only `draft` items through `docs/candidate-to-news-handoff.md`.

```text
Candidate:
- candidateUrl:
- sourceId / sourceName / sourceRole:
- publishedAt / discoveryRoute:
- sourceBackedFact: 一句话，只写来源直接支持的最小事实。
- aiRelevance: 一句话，写这件事今天帮中文 AI 读者判断什么。
- proofBoundary: 一句话，写该来源不能证明什么。
- nextIndependentCheck: 写下一步应看官方文件、监管文本、客户指标、审计、benchmark、论文复现、filing、合同或第三方测试中的哪一种。
- originalSourceSearch: media-started / replaced-with-original / no-original-found / not-needed，并写一句结果。
- duplicateStatus: repeated-url / near-title-review / fresh-source-fact / manual-clear，并写当前与历史核查结果。
- copyrightPosture: 写如何只用最小事实和本站解读，避免替代原文。
- priorityScore / priorityReason:
- batchDiversityNote:
- draftingDecision: draft / hold / reject
- decisionReason: draft 写一句入选理由；hold 或 reject 用 docs/candidate-hold-reject-reasons.md 的代码开头。
```

Keep scratch notes brief. If `duplicateStatus` is `fresh-source-fact`, the `sourceBackedFact` line must name the new source action; if the editor needs long source detail to prove novelty, hold or reject it instead of drafting from copied article structure.

## Decision Rules

Use `draft`, `hold`, or `reject` as the intake decision. Use `draft` only when the candidate has a source-backed fact, clear AI relevance, a named proof boundary, a next independent check, no unresolved duplicate, and a copyright-safe path to concise Chinese explanation.

Use `hold` when the candidate may become useful but needs registration, a better original source, clearer date, duplicate review, independent confirmation, a stated proof boundary, or a stronger AI consequence. Use the shared hold codes from `docs/candidate-hold-reject-reasons.md`. If the candidate should be revisited after this run, add a compact block from `docs/held-candidate-review-note.md` with `holdUntilJst`, `recheckTrigger`, `freshnessLimit`, and `staleFallback`; do not leave an open-ended "later" note.

Use `reject` when the candidate is paywall/body-dependent, login-only, repeated, stale, shallow commentary, routine marketing, weakly AI-related, unverifiable, copyright-substitute risk, or unable to support a detail-page briefing. Use the shared reject codes from `docs/candidate-hold-reject-reasons.md`.

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
  "batchDiversityNote": "同批候选已有多条可靠媒体背景，若没有官方、研究或监管来源补位，应发布短批次并保留来源集中提示。",
  "draftingDecision": "hold",
  "decisionReason": "hold-original-source-needed: 需要找到官方文件后再决定是否进入当前批次。"
}
```

## Drafting Handoff

Before drafting, use `docs/candidate-to-news-handoff.md` to convert the intake record into these `data/news.json` responsibilities:

- `sourceBackedFact` becomes the basis for `body`, `summary`, and `detailBody`, kept short.
- `aiRelevance` informs `whyItMatters`, `impact`, `readerUse`, and `whoShouldCare`.
- `proofBoundary` informs `claimBoundary`, `provenance`, and media-source `originalDependency`.
- `nextIndependentCheck` informs `nextCheck`, `evidenceThreshold`, and `followUpQuestions`.
- `duplicateStatus` and `copyrightPosture` should remain visible in the editor's decision, even when they do not become public copy.
- `priorityScore` and `priorityReason` decide drafting order only; they should not be published as a false precision score for readers.
- `batchDiversityNote` informs whether to publish normally, draft with a source-concentration caveat, hold a repetitive safe candidate with `hold-batch-balance`, or publish a shorter batch without padding.
- `decisionReason` should preserve the hold/reject reason code when the candidate does not move forward, so later runs can distinguish stale, duplicated, paywalled, unclear-role, weak-relevance, and missing-boundary blockers.

Do not paste source paragraphs into intake records. If a field cannot be answered without copying source text, keep the candidate on hold and revisit the original source manually.
