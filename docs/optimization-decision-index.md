# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-06-24 through 2026-07-23
- Current phase: Phase 2, Update Workflow And Archive Reliability
- Last indexed run: 2026-07-06 20:00 JST
- Network status: GitHub DNS resolution failed during the latest pull attempt; push may need retry when network access returns.

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

## Next Useful Task

- Continue with Day 10: add a remote-sync status convention for optimization logs when GitHub pull or push fails.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 9 first.
- If Day 10 is already complete, continue with the next useful task from the current plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
