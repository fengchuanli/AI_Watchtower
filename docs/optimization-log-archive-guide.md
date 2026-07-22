# Optimization Log Archive Guide

Use this guide when `docs/optimization-log.md` becomes too long for routine optimization runs to review quickly. Its purpose is to keep recent decisions easy to scan while preserving older run history for audit, rollback, and planning.

This is an archive-readability rule, not a reason to delete history. Move only completed older entries, keep the most recent working context in the live log, and leave a short index so future runs can still find the archived period.

## Archive Decision

Create or update a quarterly archive document when one of these conditions is true:

- `docs/optimization-log.md` covers more than one calendar quarter.
- The live log exceeds about 120 recent run entries and the newest plan-day decisions are hard to find without `docs/optimization-decision-index.md`.
- A monthly summary or plan rollover says older log entries are becoming maintenance noise.
- A validation or publishing issue requires keeping old evidence, but daily runs no longer need the full text inline.

Do not archive when:

- The log only contains the current plan window and the previous rollover context.
- A remote-sync blocker, rollback, or data correction is still unresolved and the older entries are needed for the next run.
- The archive would hide the source posture, verification, commit hash, or push status needed to audit a recent publication.

Current decision for the 2026-07-22 review: older entries should get a quarterly archive rule now, but the actual split can wait until the current 2026-06-24 to 2026-07-23 plan closes or the live log crosses the next quarter boundary. Keep recent news, optimization, and automation-health entries in `docs/optimization-log.md` until then.

## Archive File Shape

Name archive files by quarter:

```text
docs/optimization-log-archive-2026-q2.md
docs/optimization-log-archive-2026-q3.md
```

Each archive file should start with:

- Quarter and date range.
- Why the entries were moved.
- Which plan windows or major news-update periods are included.
- Any unresolved remote-sync, rollback, validation, or publication risks that still matter.
- The newest commit hash known at the time of archiving.

Then paste the moved log entries in reverse chronological order, preserving headings, changed files, verification notes, source posture, and commit/push status.

## Live Log After Archiving

After moving older entries, keep `docs/optimization-log.md` focused on active work:

- A top note that names the archive file and covered date range.
- Current and previous plan windows.
- Recent news-intelligence updates that may affect homepage data, archive mirrors, or source concentration.
- Recent optimization runs that affect current workflow, validation, or copy decisions.
- Any unresolved GitHub push, DNS, non-fast-forward, rollback, or validation blocker.

Do not leave a gap where a future run cannot tell whether a plan day was completed. If a moved entry contains the latest decision for a plan day, summarize that decision in `docs/optimization-decision-index.md` before archiving it.

## Archive Steps

1. Confirm the current run has read `docs/optimization-plan.md`, `docs/optimization-decision-index.md`, and the top of `docs/optimization-log.md`.
2. Choose the completed quarter or plan window to move.
3. Create or update the matching archive file and paste the older entries unchanged.
4. Add an archive note near the top of `docs/optimization-log.md` with the moved date range and archive path.
5. Update `README.md` if a new archive file becomes a regular maintenance entry.
6. Update `docs/optimization-decision-index.md` so the next useful task remains clear without scanning archived text.
7. Run `node scripts/validate-site.mjs` and `git diff --check`.

## Stop Conditions

Stop and do not move entries when:

- The selected entries include the only record of an unresolved data correction, failed push, or rollback.
- The archive file would mix unrelated quarters in a way that hides the date range.
- The current decision index does not name the latest completed plan day and next useful task.
- The move would change or summarize old run text instead of preserving it.

## Compact Log Note

Use this wording when a quarterly archive is created:

```text
Optimization-log archive: done - older entries through <date range> were moved to docs/optimization-log-archive-<year>-q<quarter>.md, while recent plan decisions remain in docs/optimization-decision-index.md.
```

Use this wording when the run only makes the archive decision:

```text
Optimization-log archive: rule-added - quarterly archive criteria are documented; no entries moved because the current plan window should remain visible.
```
