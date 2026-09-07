# Automation Health Check

Use this check when AI Watchtower scheduled news or optimization runs appear to stop, or once per week before relying on unattended updates.

## What Failed On 2026-07-21

The AI Watchtower cron automations still showed `ACTIVE`, but their RRULE strings contained an `UNTIL=20260708T145900` end date. After that time passed, the app no longer triggered the jobs even though the status label was active.

This means a task can look enabled but still be expired by schedule.

## Active Schedule To Verify

AI Watchtower currently expects three active daily automations:

- 08:00 JST news intelligence update.
- 17:00 JST news intelligence update.
- 20:00 JST content optimization.

Older 14:00, 15:00, 16:00, 17:30, 18:00, 19:00, and 21:00 optimization jobs should remain paused unless the user explicitly asks to restore them.

## Weekly Check

For each active AI Watchtower automation, verify:

- `status` is `ACTIVE`.
- `rrule` has the correct hour and minute for JST.
- `rrule` has no stale `UNTIL` date. Use `UNTIL` only for intentionally temporary jobs.
- `cwds` points to `/Users/zhangxiaoying/Documents/Codex/ai-watchtower`.
- The prompt asks the run to pull, validate, write `网站可见变化` in the log, commit with `【新闻更新】`, `【网站优化】`, or `【VisionHub网站风格优化】`, and push to `origin main`.
- The repo remote remains SSH: `git@github.com:fengchuanli/AI_Watchtower.git`.

## If A Run Is Missed

1. Check whether the automation is expired before assuming the website code failed.
2. Pull `origin/main` before editing when network access works.
3. If multiple days were missed, publish an honest catch-up edition instead of fabricating historical 08:00 and 17:00 snapshots.
4. Keep stale items out of the current homepage unless they have a valid `freshSourceFact`.
5. Update `docs/optimization-log.md` with the cause, fix, source posture, validation, commit, and push result.
6. After fixing the schedule, re-read the automation files or app view to confirm the stale `UNTIL` is gone.

## Why This Matters

The site exists to reduce the user's AI information burden. A silent expired schedule breaks trust more than a short news batch does, so schedule health should be treated as part of product quality, not just maintenance.
