# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-06-20 through 2026-07-19
- Current phase: Phase 4, Editorial Safety And Validation
- Last indexed run: 2026-06-24 14:00 JST
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
| Day 25 | Complete | `785c5d3` | `scripts/report-duplicate-candidates.mjs` now produces a pre-drafting report for repeated candidate URLs and near-matching titles against current and historical items. |

## Next Useful Task

- Continue with Day 26: improve source-policy examples for AI-adjacent capital, compute, leadership, and infrastructure events.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 25 first.
- If Day 26 is already complete, move to Day 27 and add validation that vendor-claim items name the independent evidence needed next.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
