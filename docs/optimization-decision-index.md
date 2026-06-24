# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-06-20 through 2026-07-19
- Current phase: Phase 5, Rollover And Next Plan
- Last indexed run: 2026-06-24 18:00 JST
- Network status: GitHub DNS resolution failed in recent runs; local commits may be ahead of `origin/main`.

## Recent Plan-Day Decisions

| Plan day | Status | Latest local commit | Decision shortcut |
| --- | --- | --- | --- |
| Day 15 | Complete | `9445425` | Cross-edition trend notes already exist in current data, latest history, homepage rendering, validation, and data-format docs. |
| Day 16 | Complete | `19403f2` | Company tag pages already show latest signal, last-seen date, and source caveat for major company tags. |
| Day 17 | Complete | `898216d` | Topic sections already include why-now summaries and omission boundaries for the planned topic vocabulary. |
| Day 18 | Complete | `e6bc26d` | Archive page already renders morning/evening labels and current-vs-archived status from structured data. |
| Day 19 | Complete | `5a98d51` | Data validation already checks current feed and latest history agree on key archive snapshot fields. |
| Day 20 | Complete | `a808e4d` | This index now summarizes recent optimization decisions and points future runs to the next useful plan item. |
| Day 21 | Complete | `787cf06` | Cross-page navigation copy now distinguishes latest feed, title-list scanning, company continuity, in-site detail briefings, and edition archive status. |
| Day 22 | Complete | `3fa91e1` | Stale current-feed items now need a source-specific `freshSourceFact` exception with a fresh source timestamp, URL, type, and concrete new source fact. |
| Day 23 | Complete | `7d39ab9` | Current editions now validate and render source-owner concentration when one registered `sourceId` supplies most of the batch. |
| Day 24 | Complete | `539ff62` | `docs/candidate-source-checklist.md` now gates semi-automated candidates by source identity, role, evidence, copyright/paywall safety, duplicates, and concentration before drafting. |
| Day 25 | Complete | `2b7fe85` | `scripts/report-duplicate-candidates.mjs` now produces a pre-drafting report for repeated candidate URLs and near-matching titles against current and historical items. |
| Day 26 | Complete | `7b1087d` | `docs/source-policy.md` now gives promote/hold/source-posture examples for AI-adjacent capital, compute, leadership, and infrastructure events. |
| Day 27 | Complete | `7cf3f07` | Vendor-claim next checks now need to name independent evidence directly, so customer stories, benchmark pages, and vendor-written case studies point readers to the next external proof path. |
| Day 28 | Complete | `f186a87` | Editorial validator limits are now documented so future runs can distinguish useful strictness from false positives before loosening data or site checks. |
| Day 29 | Complete | `254b175` | `docs/monthly-optimization-summary.md` now summarizes the current 30-day cycle's concrete improvements, remaining weaknesses, and next-plan priorities before the rollover task. |

## Next Useful Task

- Continue with Day 30: write the next 30-day optimization plan in `docs/optimization-plan.md`, keeping completed work as historical context.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 30 first.
- If Day 30 is already complete, continue with the first useful task from the new plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
