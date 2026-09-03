# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-08-10 through 2026-09-08
- Current phase: Phase 4, Continuity And Archive Usefulness
- Last indexed run: 2026-09-03 20:00 JST
- Network status: Latest 20:00 follow-up run could not pull or push because `github.com` DNS resolution failed; local commits are ahead of known `origin/main`.

## Recent Plan-Day Decisions

| Plan day | Status | Latest local commit | Decision shortcut |
| --- | --- | --- | --- |
| Previous Day 27 | Complete | `c5778cc` | `docs/vendor-narrative-promotion-rule.md` blocks vivid vendor narratives from TOP3 unless first-screen card copy names the independent proof path. |
| Previous Day 28 | Complete | `e701b59` | `docs/vendor-narrative-promotion-rule.md` now has a validator guard in `scripts/validate-site.mjs`, including source-role, first-screen field list, evidence-quality floor, stop conditions, and independent proof examples. |
| Previous Day 29 | Complete | `a1947c6` | `docs/monthly-optimization-summary.md` summarizes the 2026-06-24 to 2026-07-23 cycle's workflow, homepage, continuity, detail-source, and validation improvements, plus remaining weaknesses. |
| Previous Day 30 | Complete | `68eebfc` | `docs/optimization-plan.md` now covers 2026-08-10 through 2026-09-08 and shifts the cycle toward lower-friction real news updates, lighter mobile homepage reading, and clearer cross-edition continuity. |
| Day 0 | Complete | `68eebfc` | `docs/homepage-edition-preflight.md` checks each edition's reader question, TOP3 reader use, source mix boundary, mobile scan path, proof boundary, and archive mirror before publication. |
| Day 1 | Complete | `cbcf78d` | The current `readerFrame.mobile` copy now gives phone readers a shorter scan path: judge Agent overreach, then policy pressure, then infrastructure evidence. |
| Day 2 | Complete | `ea18f83` | The current `briefing.summary` and `deepBriefing.overview` now start with the reader decision, then separate official/media source boundaries from AI Watchtower interpretation. |
| Day 3 | Complete | `262ed6b` | `coverageMix` now has a tiny-bucket merge rule: keep at most one single-item bucket and no more than four scan cues, with validation and homepage preflight coverage. |
| Day 4 | Complete | `f2defb8` | Current `categories[].description` copy now names only visible category anchors, and data validation rejects stale anchors from another current category. |
| Day 5 | Complete | `4483450` | Short batches now use compact `editorialInterpretation` copy that states the published safe-signal count, frames fewer than 10 items as a quality-gate result, and names unsafe padding that was not used. |
| Day 6 | Complete | `2d2832e` | Omitted planned topics now point readers to archive, tag-page, historical, or already-selected related background only, with a runtime validator and homepage preflight check that blocks unsupported fresh claims. |
| Day 7 | Complete | `02cd2b2` | `docs/candidate-intake-format.md` now has an Intake Scratch Template for 08:00 and 17:00 JST runs, mirrored in `docs/update-run-checklist.md` and guarded by `scripts/validate-site.mjs`. |
| Day 8 | Complete | `e113ec8` | Duplicate reporting now distinguishes `repeated-url`, `near-title-review`, `fresh-source-fact`, and `manual-clear`, so editors know when to reject, hold, or draft based on a new source-backed action. |
| Day 9 | Complete | `071eadc` | `docs/original-source-replacement-guide.md` now has a source-of-record decision table: official pages own product/policy facts, filings or regulator records own accountable business/legal facts, research artifacts own capability claims, and customer-side or independent evidence owns deployment outcomes. |
| Day 10 | Complete | `813f364` | `data/sources.json` policy, trust-level descriptions, and every source note now use Chinese editor-facing source-role language, with data validation blocking English `Use for...` style instructions from returning. |
| Day 11 | Complete | `60a16b8` | `docs/source-diversity-triage-note.md` now has a Common Owner Concentration Review for TechCrunch, Axios, one vendor, and one research feed, with checklist prompts to name the independent owner or source type needed next. |
| Day 12 | Complete | `9acbfc9` | `docs/held-candidate-review-note.md` now records promising held candidates with `holdUntilJst`, `recheckTrigger`, `freshnessLimit`, `staleFallback`, and `nextEditorAction` so later runs must recheck evidence before treating old leads as current news. |
| Day 13 | Complete | `1510ea4` | Candidate workflow entry points now route editors in order: plain-language guide for judgment, `docs/candidate-source-checklist.md` as the hard source gate, `docs/candidate-intake-format.md` as the structured record, and `docs/candidate-to-news-handoff.md` only after `draft`. |
| Day 14 | Complete | `e493b97` | Current detail pages now show the four-block fact, impact, boundary, and next-check briefing immediately after the 30-second summary, before longer narrative sections. |
| Day 15 | Complete | `b407942` | `detailTrend` now has a split rule: keep one trend meaning there, and move reader action, upgrade proof, downgrade proof, or source-caveat logic into `readerUse`, `impact`, `evidenceThreshold`, `nextCheck`, `counterEvidence`, or `claimBoundary`. |
| Day 16 | Complete | `849c751` | media-backed detail pages now show a compact `完整事实入口` reminder after `30 秒速览`, while preserving AI Watchtower's primary explanation and the full source audit block. |
| Day 17 | Complete | `7166932` | `docs/detail-page-review-guide.md` and `docs/news-data-format.md` now give `evidenceThreshold` upgrade examples for media signal -> official confirmation, vendor claim -> independent proof, and research preprint -> replicated result. |
| Day 18 | Complete | `2dee98b` | Current and latest archived `followUpQuestions` now name item-specific source artifacts and observable checks, and validation rejects generic `核心事实` / `继续观察` prompts. |
| Day 19 | Complete | `179876e` | `counterEvidence` guidance now distinguishes central downgrade from scope narrowing: downgrade when the core claim breaks, narrow when the fact still stands but the boundary is smaller. |
| Day 20 | Complete | `05fa6e8` | Current and latest archived detail-page `provenance` source references now name the exact source fact they support, and validation rejects bare source labels. |
| Day 21 | Complete | `06f1307` | `docs/company-continuity-review-note.md` classifies recurring-company signals as stronger, weaker, repeated, or resolved before editors write public `companyContinuity` notes. |
| Day 22 | Complete | `809cc8d` | `docs/topic-continuity-review-note.md` classifies recurring-topic signals as stronger, weaker, or repeated, and validation blocks repeated media coverage from being written as stronger trend evidence. |
| Day 23 | Complete | `3d61d30` | `docs/archive-diff-summary-format.md` now has a correction-only decision rule: skip archive diffs only when wording, metadata, URL/name, order, or mirror fixes do not change items, source posture, topic movement, proof boundaries, or reader interpretation. |

## Historical Guard Anchors

These compact anchors keep validation and future automation aware of the most important completed workflow documents from the previous cycle without repeating the full log.

- Day 1: `docs/candidate-priority-rubric.md` ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
- Day 0: `docs/candidate-source-checklist.md` gates semi-automated candidates by source identity, role, minimum evidence, copyright/paywall safety, duplicates, and concentration before drafting.
- Day 2: `docs/candidate-hold-reject-reasons.md` standardizes hold/reject reasons for stale, duplicated, paywalled, unclear-role, weak-relevance, and missing-boundary candidates.
- Day 4: `docs/original-source-replacement-guide.md` decides when media reports should be replaced by official, filing, paper, regulator, customer-side, dataset, or benchmark originals.
- Day 5: `docs/source-diversity-triage-note.md` checks whether a candidate batch is too concentrated by owner, source family, company, geography, evidence mode, or narrative angle.
- Day 6: `docs/candidate-workflow-plain-language-guide.md` gives non-technical editors a six-question Chinese path before schema drafting.
- Day 7: `docs/update-run-checklist.md` records source discovery, candidate intake, duplicate reporting, drafting, validation, commit, and push status.
- Day 8: `docs/current-to-history-publication-checklist.md` keeps the newest history edition aligned with `data/news.json`.
- Day 9: `docs/bad-data-rollback-note.md` names rollback files, restore shapes, validators, and log wording before republishing bad data.
- Day 10: `docs/remote-sync-log-convention.md` standardizes blocked-dns, blocked-auth, conflict, push, and pull wording.
- Day 12: `docs/partial-batch-publication-guide.md` explains when to publish one or two reliable, non-duplicate, copyright-safe candidates.
- Day 13: `docs/optimization-log-archive-guide.md` decides when older optimization-log entries move to quarterly archive files.
- Day 21: `docs/detail-page-review-guide.md` converts detail-page technical claims into fact, impact, boundary, and next-check blocks.
- Day 25: `scripts/report-duplicate-candidates.mjs` reports repeated candidate URLs and near-matching titles before drafting.
- Day 25: `docs/counter-evidence-observable-guide.md` tells editors when `counterEvidence` should name a concrete observable outcome instead of another document.
- Day 27: `docs/vendor-narrative-promotion-rule.md` blocks vendor narratives from homepage promotion unless independent proof appears in first-screen card copy.

## Next Useful Task

- Continue with Day 24: review all-news and tag-page framing so archive readers understand older items as context, not current alerts.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 22 first.
- If Day 23 is already complete, continue with the first useful unfinished task from the current plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
