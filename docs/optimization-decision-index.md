# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-06-20 through 2026-07-19
- Current phase: Phase 3, Discovery And Continuity
- Last indexed run: 2026-06-23 17:30 JST
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

## Next Useful Task

- Continue with Day 21: review navigation copy between homepage, all-news, archive, tags, and detail pages.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 21 first.
- If Day 21 is already complete, move to Phase 4 Day 22 and strengthen stale-news validation with source-specific exceptions only when a fresh source fact exists.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
