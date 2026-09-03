# Update Run Checklist

Use this checklist for every 08:00 JST and 17:00 JST AI news intelligence update before changing `data/news.json`. Its purpose is to make the run state visible: what was searched, which candidates were held or drafted, whether held-but-promising candidates were recorded with `docs/held-candidate-review-note.md`, whether duplicates were checked, whether `docs/homepage-edition-preflight.md` confirmed the reader question, TOP3 use, source boundary, mobile scan path, proof boundary, and archive mirror, whether `docs/partial-batch-publication-guide.md` was needed for a one- or two-item safe batch, whether `docs/current-to-history-publication-checklist.md` kept the latest archive aligned with the homepage, whether `docs/archive-diff-summary-format.md` should summarize the same-day morning/evening change, which validators passed, and whether GitHub sync succeeded. Use `docs/remote-sync-log-convention.md` for exact pull/push status wording. If validation, archive mirroring, source role, duplicate, or copyright checks reveal bad current data, switch to `docs/bad-data-rollback-note.md` before republishing.

This checklist sits after the candidate workflow docs and before the final optimization log entry. It does not replace source judgment. If a step produces too few safe candidates, use `docs/partial-batch-publication-guide.md` to decide whether to publish a short batch with a clear reason, continue searching, or hold the update instead of padding the homepage with weak, repeated, or copyright-risk items.

## Automation health

Before investigating source or data issues, confirm the scheduled task itself is still valid. Check `docs/automation-health-check.md` when a run was missed, especially for stale `UNTIL` dates that can stop an `ACTIVE` cron automation from firing.

## Run Header

Record these fields at the top of the editor note for the run:

- `runTimeJst`: Planned update time, such as `2026-07-04 17:00 JST`.
- `runType`: `morning-news` or `evening-news`.
- `remoteSyncBefore`: `pulled`, `blocked-dns`, `blocked-auth`, `blocked-conflict`, or `not-attempted-with-reason`; follow `docs/remote-sync-log-convention.md`.
- `sourceWindow`: The previous edition time and the current cutoff used to decide freshness.
- `targetReaderQuestion`: One short Chinese question the batch should help readers answer today.
- `shortBatchReason`: Required when fewer than 10 safe current-news items are published.

## Status Checklist

Use these status values for each step: `done`, `partial`, `blocked`, or `not-needed`. A `partial` or `blocked` step needs one short Chinese note naming the concrete gap.

| Step | Required status note |
| --- | --- |
| Source discovery | Name which official, research, regulator, reliable-media, and registered source surfaces were checked. Do not just write "searched the web." |
| Candidate intake | Confirm that draftable URLs used the `docs/candidate-intake-format.md` scratch template and have `sourceBackedFact`, `aiRelevance`, `proofBoundary`, `nextIndependentCheck`, `originalSourceSearch`, `duplicateStatus`, `copyrightPosture`, `priorityReason`, and `draftingDecision`. |
| Held-candidate review | For any promising `hold`, confirm `docs/held-candidate-review-note.md` recorded `holdUntilJst`, `recheckTrigger`, `freshnessLimit`, `staleFallback`, and one concrete `nextEditorAction`; if no fresh source action appears before `freshnessLimit`, reject or convert it to background context instead of drafting it as current news. |
| Original-source search | For media-started candidates, say whether an official, filing, paper, regulator, customer-side, dataset, or benchmark original replaced the media report; when several pages exist for the same event, name which one owns the source-of-record fact and which pages remain only background. |
| Duplicate reporting | Run `node scripts/report-duplicate-candidates.mjs <candidate-file.json>` when a batch file exists, or record the manual current/history duplicate check when no file exists. Interpret results as `repeated-url`, `near-title-review`, `fresh-source-fact`, or `manual-clear`, and name the new source action before clearing any near-title or repeated-topic item. |
| Priority and mix | Note whether `docs/candidate-priority-rubric.md` and `docs/source-diversity-triage-note.md` changed the drafting order or caused a held candidate. If TechCrunch, Axios, one vendor, or one research feed supplies three or more draftable candidates, record the Common Owner Concentration Review result and the independent owner/source type to check next. |
| Partial batch | Required when fewer than 10 safe candidates remain, and especially when only one or two remain. Record `publish-partial-batch`, `continue-searching`, `hold-no-safe-batch`, or `not-needed` from `docs/partial-batch-publication-guide.md`. |
| Drafting | Confirm the public copy came from minimum source facts plus AI Watchtower interpretation, not copied or expanded source paragraphs. |
| Editorial review | Confirm `docs/editorial-checklist.md`, `docs/source-policy.md`, and `docs/copyright-safety.md` were applied to the final items. |
| Homepage preflight | Confirm `docs/homepage-edition-preflight.md` was applied, and say whether reader question, TOP3 use, source boundary, mobile scan path, proof boundary, and archive mirror are `done`, `partial`, or `blocked`. |
| Archive mirror | Confirm `docs/current-to-history-publication-checklist.md` was applied after drafting, and say whether the latest history edition was mirrored, corrected, not needed, or blocked. |
| Archive diff | For 17:00 JST runs, confirm `docs/archive-diff-summary-format.md` was applied and say whether the morning/evening comparison was done, skipped because only one same-day edition exists, skipped because the update was correction-only with no reader-facing story change, or blocked by archive drift. |
| Rollback check | If bad data was detected, confirm `docs/bad-data-rollback-note.md` was applied and say whether rollback was corrected, not needed, or blocked. |
| Data validation | Record `node scripts/validate-data.mjs` result and item/source counts. |
| Site validation | Record `node scripts/validate-site.mjs`, `node scripts/validate-pages.mjs`, and any HTML/JSON parsing used. |
| Commit | Record the local commit message and whether the log can include the final hash without amending itself. |
| Push | Record `pushed`, `blocked-dns`, `blocked-auth`, `blocked-non-fast-forward`, or `not-attempted-with-reason` using `docs/remote-sync-log-convention.md`. |

## Minimum Editor Note

When time is short, leave this compact note before drafting or committing:

```text
Run: 2026-07-04 17:00 JST, evening-news
Remote before: blocked-dns
Source discovery: done - checked official AI labs, registered media/research surfaces, and current-history duplicate URLs.
Candidate intake: done - 3 draft, 4 hold, 2 reject; holds mainly need original-source confirmation.
Held-candidate review: done - 4 holds recorded with holdUntilJst, recheckTrigger, freshnessLimit, staleFallback, and nextEditorAction.
Duplicate reporting: done - manual-clear for 3 drafts; one near-title-review held until a new source action is named.
Drafting: done - public copy uses minimum source facts and original Chinese interpretation.
Validation: done - validate-data, validate-site, validate-pages, HTML parse, JSON parse, diff check.
Archive diff: done - morning/evening editions compared for source posture and proof-boundary change.
Push: blocked-dns
Short batch reason: only three reliable non-duplicate research originals passed the source and copyright gates.
Partial batch: publish-partial-batch - the shortage came from source, duplicate, proof-boundary, and copyright gates, not from padding avoidance alone.
```

## Stop Conditions

Do not publish the batch until the relevant step is resolved when:

- Source discovery found only community discussion, scraped screenshots, reposts, or login/paywall body text.
- Candidate intake cannot state the proof boundary or next independent check in Chinese.
- Duplicate reporting finds the same URL or a near-matching title and the editor cannot name a fresh source fact.
- Media candidates would require article structure, interviews, figures, charts, or paywalled body text to be useful.
- Validation fails on current data, static links, archive/detail pages, or repeated current-vs-history coverage.
- A bad item has already reached `data/news.json`, `data/news-history.json`, a local commit, or a visible push and the rollback note has not been applied.

Do publish a shorter batch when the safe candidates are few but clear, current, non-duplicated, and useful to Chinese readers. In that case, record `shortBatchReason` in the edition/log so later runs know this was a quality decision rather than an incomplete run.
