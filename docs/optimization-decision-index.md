# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-06-24 through 2026-07-23
- Current phase: Phase 4, Detail Briefing And Continuity
- Last indexed run: 2026-08-04 20:00 JST
- Network status: Latest 20:00 run was blocked by GitHub DNS for pull and push; push status is recorded in `docs/optimization-log.md`; local `main` remains ahead of the known remote until sync succeeds.

## Recent Plan-Day Decisions

| Plan day | Status | Latest local commit | Decision shortcut |
| --- | --- | --- | --- |
| Previous Day 24 | Complete | `539ff62` | `docs/candidate-source-checklist.md` gates semi-automated candidates by source identity, role, evidence, copyright/paywall safety, duplicates, and concentration before drafting. |
| Previous Day 25 | Complete | `2b7fe85` | `scripts/report-duplicate-candidates.mjs` reports repeated candidate URLs and near-matching titles against current and historical items. |
| Previous Day 26 | Complete | `7b1087d` | `docs/source-policy.md` gives promote/hold/source-posture examples for AI-adjacent capital, compute, leadership, and infrastructure events. |
| Previous Day 27 | Complete | `7cf3f07` | Vendor-claim next checks need to name independent evidence directly, so customer stories, benchmark pages, and vendor-written case studies point readers to the next external proof path. |
| Previous Day 28 | Complete | `f186a87` | Editorial validator limits are documented so future runs can distinguish useful strictness from false positives before loosening data or site checks. |
| Previous Day 29 | Complete | `254b175` | `docs/monthly-optimization-summary.md` summarizes the prior cycle's concrete improvements, remaining weaknesses, and next-plan priorities before rollover. |
| Previous Day 30 | Complete | `e1700b1` | `docs/optimization-plan.md` now covers 2026-06-24 through 2026-07-23 and shifts the cycle toward lower-friction, trustworthy daily news workflow. |
| Day 0 | Complete | `e1700b1` | `docs/candidate-intake-format.md` defines the pre-draft intake record: source-backed fact, AI relevance, proof boundary, next independent check, duplicate status, copyright posture, and draft/hold/reject decision. |
| Day 1 | Complete | `e319df1` | `docs/candidate-priority-rubric.md` ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety before drafting order is chosen. |
| Day 2 | Complete | `f8f4569` | `docs/candidate-hold-reject-reasons.md` standardizes why candidates are held or rejected, including stale, duplicated, paywalled, unclear-role, weak-relevance, missing-boundary, routine-marketing, and copyright-substitute blockers. |
| Day 3 | Complete | `b7134a1` | `docs/candidate-to-news-handoff.md` maps intake fields into `data/news.json` responsibilities while separating minimum source facts from AI Watchtower's original Chinese interpretation. |
| Day 4 | Complete | `93b671e` | `docs/original-source-replacement-guide.md` decides when a media report must be replaced by an official, filing, paper, regulator, customer-side, dataset, or benchmark original before drafting. |
| Day 5 | Complete | `7417364` | `docs/source-diversity-triage-note.md` decides whether a safe candidate batch should draft normally, draft with a caveat, hold repetitive items with `hold-batch-balance`, or publish short without padding. |
| Day 6 | Complete | `19dd9da` | `docs/candidate-workflow-plain-language-guide.md` gives non-technical editors a six-question Chinese path before they touch schema fields or `data/news.json`. |
| Day 7 | Complete | `bf0ee88` | `docs/update-run-checklist.md` separates each 08:00/17:00 news update into source discovery, candidate intake, original-source search, duplicate reporting, drafting, validation, commit, and push status. |
| Day 8 | Complete | `09fc440` | `docs/current-to-history-publication-checklist.md` keeps the newest `data/news-history.json` edition aligned with `data/news.json` for edition metadata, reader/source framing, item count, and item order before publication. |
| Day 9 | Complete | `b2c883c` | `docs/bad-data-rollback-note.md` names the files, rollback shapes, restore steps, validators, and log wording needed before republishing after a bad data update. |
| Day 10 | Complete | `742dad3` | `docs/remote-sync-log-convention.md` standardizes pull/push log wording for `pulled`, `pushed`, `blocked-dns`, `blocked-auth`, `blocked-conflict`, `blocked-non-fast-forward`, and `not-attempted-with-reason` states. |
| Day 11 | Complete | `6bbe8bc` | `docs/archive-diff-summary-format.md` gives 17:00 JST runs a compact morning/evening archive comparison for new signals, source posture, reader takeaway, and proof-boundary change. |
| Day 12 | Complete | `be0e2cf` | `docs/partial-batch-publication-guide.md` decides when one or two safe candidates may publish as a short batch, when to continue searching, and when to hold instead of padding. |
| Day 13 | Complete | `3ebf46d` | `docs/optimization-log-archive-guide.md` decides when older optimization-log entries should move to quarterly archive files and what must remain in the live log and decision index. |
| Day 14 | Complete | `9315c17` | Current homepage briefing and reader frame now name the reader checklist first, then place official-delivery and media-number caveats second. |
| Day 15 | Complete | `2def4b8` | Current homepage and latest archive reader frame now include a compact `mobile` scan variant, and validators require future dense editions to give phone readers a short action/proof-boundary path. |
| Day 16 | Complete | `9d5fba5` | Current homepage and latest archive coverage-mix labels now read as check-now cues, and validators reject passive topic-only coverage labels. |
| Day 17 | Complete | `465ad79` | Homepage omitted-topic explanations now label omissions as `无新来源事实` and explicitly say the topic remains important but lacks a fresh promotable source fact this batch. |
| Day 18 | Complete | `b4c4cd4` | Current homepage and latest archive now include an `overreadBoundary` when one evidence mode dominates, so all-media batches are framed as radar/checklists rather than full-market conclusions. |
| Day 19 | Complete | `b95de25` | Current homepage categories now use current-batch descriptions tied to reader use and proof boundaries, and data validation rejects stale generic category descriptions. |
| Day 20 | Complete | `6389ba4` | `scripts/validate-data.mjs` now audits repeated caveat sentences across `readerFrame`, `sourceRisk`, and `trendNotes`, keeping reader orientation, source-risk warning, and trend boundaries distinct. |
| Day 21 | Complete | `a62adbf` | `docs/detail-page-review-guide.md` now tells editors to convert detail-page technical claims into fact, impact, boundary, and next-check blocks before publication. |
| Day 22 | Complete | `3567a13` | Current and latest archived editions now include `companyContinuity` notes for recurring companies, with each note naming prior context, the current-edition change, and what remains unproven. |
| Day 23 | Complete | `f95e99b` | Current and latest archived editions now include `topicContinuity` notes for recurring topics, with each note marking the signal as stronger, weaker, or repeated and naming what still needs proof. |
| Day 24 | Complete | `54400ea` | Detail pages now render media-specific source reminders that name the original article as the home for complete facts, and validation guards current/latest media items against weakening that boundary. |
| Day 25 | Complete | `08401c4` | `docs/counter-evidence-observable-guide.md` now tells editors when `counterEvidence` should name a concrete observable outcome instead of another document, especially for adoption, deployment, safety, performance, cost, and policy-effect claims. |
| Day 26 | Complete | `2c1cb12` | Current and latest archived `whoShouldCare` copy now names concrete Chinese reader/work contexts, and validation rejects generic observer/practitioner labels or audience lists without a scenario. |

## Next Useful Task

- Continue with Day 27: add an editorial rule for not promoting vivid vendor narratives unless independent proof is named in the first-screen card copy.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 26 first.
- If Day 27 is already complete, continue with the next useful task from the current plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
