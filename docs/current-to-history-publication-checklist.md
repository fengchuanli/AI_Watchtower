# Current To History Publication Checklist

Use this checklist during every 08:00 JST and 17:00 JST news publication after `data/news.json` has been drafted and before the run is committed. Its purpose is to keep the latest archived edition in `data/news-history.json` aligned with the homepage edition, so archive readers do not see stale framing, missing caveats, or a different item order from the current homepage. After a clean 17:00 JST mirror, use `docs/archive-diff-summary-format.md` when a same-day morning edition exists so the archive can explain what changed without duplicating both batches. When recurring topics appear, use `docs/topic-continuity-review-note.md` before writing `topicContinuity` so repeated media mentions are classified as `repeated` unless the current source adds a stronger artifact. When recurring companies appear, use `docs/company-continuity-review-note.md` before writing `companyContinuity` so repeated company names are classified as stronger, weaker, repeated, or resolved rather than treated as automatic trend proof.

This is a publication check, not a license to republish old material as new. If the current homepage intentionally advances to a new edition, create or update the newest history edition for that same batch. If the current batch is only a correction, keep the same edition ID and record what changed in the optimization log.

## When To Run

Run this checklist whenever any of these files changes:

- `data/news.json`
- `data/news-history.json`
- `docs/optimization-log.md` for a news intelligence update

Also run it when a validator reports archive readiness drift, repeated current-vs-history coverage, stale current items, mismatched item counts, or a missing latest history edition. If the drift comes from bad current data rather than a simple mirror omission, use `docs/bad-data-rollback-note.md` before republishing.

## Mirror Fields

The newest `data/news-history.json` edition should match the current `data/news.json` edition for these fields before publication:

| Current field | Latest history field | Check |
| --- | --- | --- |
| `edition.id` | `editions[0].id` | Same edition key. Do not leave yesterday's archive ID at the top. |
| `updatedAt`, `edition.date`, `edition.timezone` | `updatedAt`, `editions[0].date`, `editions[0].timezone` | Same editorial date and timezone. |
| `edition.archiveStatus`, `edition.archiveLabel` | `editions[0].archiveStatus`, `editions[0].archiveLabel` | Same visible status and batch label. |
| `edition.note` | `editions[0].note` | Same short scope note, without extra operational prose. |
| `edition.operationalStatus` | `editions[0].operationalStatus` | Same pull, source-check, or retrieval status. |
| `edition.editorialInterpretation` | `editions[0].editorialInterpretation` | Same Chinese editorial reading and proof boundary. |
| `edition.readerFrame` | `editions[0].readerFrame` | Same reader use case, mobile scan variant, and not-proven-yet notes. |
| `edition.changeSummary` | `editions[0].changeSummary` | Same fresh-facts and repeated-background framing. |
| `edition.coverageMix` | `editions[0].coverageMix` | Same count and meaning by signal group. |
| `edition.sourceFamilies` | `editions[0].sourceFamilies` | Same source-tier counts and roles. |
| `edition.sourceRisk` | `editions[0].sourceRisk` | Same source-family caveat and next check. |
| `edition.sourceConcentration` | `editions[0].sourceConcentration` | Same dominant source-owner caveat when required. |
| `edition.trendNotes` | `editions[0].trendNotes` | Same cross-edition trend wording and boundary. |
| `edition.topicContinuity` | `editions[0].topicContinuity` | Same recurring-topic strength direction and proof boundary. |
| `edition.companyContinuity` | `editions[0].companyContinuity` | Same recurring-company change notes and still-unproven boundaries, after the company continuity review has classified the latest signal as stronger, weaker, repeated, or resolved. |
| `edition.topicGroups` | `editions[0].topicGroups` | Same topic grouping, item IDs, and action-oriented meanings. |
| `items.length` | `editions[0].itemCount`, `editions[0].items.length` | Same item count. Short batches need a log reason, not a silent mismatch. |
| `items[].id` order | `editions[0].items[].id` order | Same newest-first item order unless the homepage was deliberately re-ranked. |
| each current item object | matching latest history item object | Same source fields, proof boundaries, reader-use fields, and detail briefing fields. |

## Publication Steps

1. Draft or update `data/news.json` first, including edition metadata and all item fields.
2. Copy the completed current edition into the newest `data/news-history.json` entry, keeping the current item order unchanged.
3. Update `data/news-history.json` `updatedAt` and `totalItems` after the newest edition is correct.
4. Check that no older history edition repeats a current `sourceUrl` or near-duplicate title unless the current item has a valid `freshSourceFact`.
5. Run `node scripts/validate-data.mjs` and treat any archive-readiness mismatch as a publication blocker.
6. Open or parse `archive.html`, `all-news.html`, and `news-detail.html` when page behavior changed or when an archived detail link was affected.
7. For 17:00 JST editions, check whether `docs/archive-diff-summary-format.md` should produce a morning/evening comparison or a skipped reason. For correction-only updates, apply its correction-only decision before deciding whether the reader-facing story changed.
8. Record in `docs/optimization-log.md` whether the latest history edition was mirrored, created, corrected, or intentionally left unchanged with a reason.
9. If a correction removes or demotes a bad current item, also record the rollback shape from `docs/bad-data-rollback-note.md` so future runs know whether the issue reached draft, commit, or push.

## Stop Conditions

Do not commit the publication until the drift is resolved when:

- The newest history edition ID does not match the current homepage edition ID.
- The latest history item count differs from the current homepage item count.
- Archive metadata omits reader frame, change summary, source risk, source concentration, trend notes, coverage mix, source families, or topic groups that the homepage uses.
- A current item has different `claimBoundary`, `provenance`, `originalDependency`, `nextCheck`, `evidenceThreshold`, or `counterEvidence` in history.
- The archive would show an older batch as the newest edition after the homepage has advanced.
- A repeated current/history URL is being used as fresh news without a concrete `freshSourceFact`.

## Compact Log Note

Use this short wording when the mirror check is clean:

```text
Archive mirror: done - newest data/news-history.json edition matches data/news.json for edition metadata, reader/source framing, item count, and item order.
```

Use this wording when the homepage changed but history intentionally did not:

```text
Archive mirror: not-needed - no change to data/news.json current edition; history left unchanged.
```

Use this wording when a correction was required:

```text
Archive mirror: corrected - latest history edition was updated to match the current homepage reader frame, source boundary, and item order before validation.
```
