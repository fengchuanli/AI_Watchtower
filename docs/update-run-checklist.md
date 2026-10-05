# Update Run Checklist

Use this checklist for every 08:00 JST and 17:00 JST AI news intelligence update before changing `data/news.json`. Its purpose is to make the run state visible: what was searched, which candidates were held or drafted, whether duplicates were checked, whether homepage/archive publication gates passed, which validators passed, and whether GitHub sync succeeded. Use `docs/remote-sync-log-convention.md` for exact pull/push status wording, commit title prefixes, and the required `网站可见变化` note; use `docs/failure-status-wording-guide.md` whenever pull, validation, commit, push, or publication is blocked. If validation, archive mirroring, source role, duplicate, or copyright checks reveal bad current data, switch to `docs/bad-data-rollback-note.md` before republishing.

This checklist sits after the candidate workflow docs and before the final optimization log entry. It does not replace source judgment. If a step produces too few safe candidates, use `docs/partial-batch-publication-guide.md` to decide whether to publish a short batch with a clear reason, continue searching, or hold the update instead of padding the homepage with weak, repeated, or copyright-risk items.

For a normal 08:00 or 17:00 run, the shortest candidate-to-news path is recorded in `docs/candidate-to-news-handoff.md`: plain-language note, source gate, duplicate report, short intake, priority/mix check, field mapping into `data/news.json`, homepage/archive preflight, derived-data rebuild gate, validation, commit, and push status.

## Normal News Update Must-Read Path

For an ordinary 08:00 or 17:00 news update, read these documents in this order and do not scan older optimization logs or every historical rule before drafting:

1. `docs/candidate-workflow-plain-language-guide.md` for the first human judgment: what happened, why it matters, what is unproven, safest source, batch safety, and draft/hold/reject.
2. `docs/candidate-source-checklist.md` for the hard source, copyright, duplicate, source-label, original-source, and concentration gate.
3. `docs/candidate-intake-format.md` only for surviving candidates, keeping intake fields short enough to map into public copy.
4. `docs/candidate-to-news-handoff.md` for the normal shortest path and field mapping into `data/news.json`.
5. `docs/homepage-edition-preflight.md` and `docs/current-to-history-publication-checklist.md` after drafting, so the homepage reader frame and newest archive mirror are aligned before derived data is rebuilt.
6. This checklist's status rows for derived data, validation, commit, push, and `网站可见变化`.

Open conditional documents only when their trigger appears: `docs/held-candidate-review-note.md` for promising holds, `docs/original-source-replacement-guide.md` for media-started candidates that may have a stronger primary source, `docs/source-diversity-triage-note.md` when one owner/source family/evidence mode dominates, `docs/partial-batch-publication-guide.md` when fewer than 10 safe items remain, `docs/archive-diff-summary-format.md` for 17:00 same-day morning/evening comparisons, and `docs/bad-data-rollback-note.md` when current or archive data is already wrong.

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
| Source label review | When adding a source, confirm the `docs/source-policy.md` source-label stewardship rule: `create-separate-label`, `merge-under-existing-label`, `rename-misleading-label`, `clarify-source-notes`, or `not-needed`. Required if more than two same-owner source entries would be added in one batch. |
| Candidate intake | Confirm that draftable URLs used the `docs/candidate-intake-format.md` scratch template and have `sourceBackedFact`, `aiRelevance`, `proofBoundary`, `nextIndependentCheck`, `originalSourceSearch`, `duplicateStatus`, `copyrightPosture`, `priorityReason`, and `draftingDecision`. |
| Held-candidate review | For any promising `hold`, confirm `docs/held-candidate-review-note.md` recorded `holdUntilJst`, `recheckTrigger`, `freshnessLimit`, `staleFallback`, and one concrete `nextEditorAction`; if no fresh source action appears before `freshnessLimit`, reject or convert it to background context instead of drafting it as current news. |
| Original-source search | For media-started candidates, say whether an official, filing, paper, regulator, customer-side, dataset, or benchmark original replaced the media report; when several pages exist for the same event, name which one owns the source-of-record fact and which pages remain only background. |
| Duplicate reporting | Run `node scripts/report-duplicate-candidates.mjs <candidate-file.json>` when a batch file exists, or record the manual current/history duplicate check when no file exists. Interpret results as `repeated-url`, `near-title-review`, `fresh-source-fact`, or `manual-clear`, copy the report's review action into the run note when it finds a match, and name the new source action before clearing any near-title or repeated-topic item. |
| Priority and mix | Note whether `docs/candidate-priority-rubric.md` and `docs/source-diversity-triage-note.md` changed the drafting order or caused a held candidate. If TechCrunch, Axios, one vendor, or one research feed supplies three or more draftable candidates, record the Common Owner Concentration Review result and the independent owner/source type to check next. |
| Partial batch | Required when fewer than 10 safe candidates remain, and especially when only one or two remain. Record `publish-partial-batch`, `continue-searching`, `hold-no-safe-batch`, or `not-needed` from `docs/partial-batch-publication-guide.md`. |
| Drafting | Confirm the public copy came from minimum source facts plus AI Watchtower interpretation, not copied or expanded source paragraphs. |
| Editorial review | Confirm `docs/editorial-checklist.md`, `docs/source-policy.md`, and `docs/copyright-safety.md` were applied to the final items. |
| Homepage preflight | Confirm `docs/homepage-edition-preflight.md` was applied, and say whether reader question, TOP3 use, source boundary, mobile scan path, proof boundary, and archive mirror are `done`, `partial`, or `blocked`. |
| Archive mirror | Confirm `docs/current-to-history-publication-checklist.md` was applied after drafting, and say whether the latest history edition was mirrored, corrected, not needed, or blocked. |
| Archive diff | For 17:00 JST runs, confirm `docs/archive-diff-summary-format.md` was applied and say whether the morning/evening comparison was done, skipped because only one same-day edition exists, skipped because the update was correction-only with no reader-facing story change, or blocked by archive drift. |
| Monthly continuity snapshot | Near the end of a plan window, use `docs/monthly-continuity-snapshot.md` when recurring companies, topics, unresolved claims, or resolved checks should inform the next plan, standing editorial rules, or a future public continuity component. Record `done`, `not-needed`, or `blocked`, and do not add fresh source claims from the snapshot. If a public component is being considered, add `publicContinuityHandoff` and separate ready cards from `archive-only` and `do-not-publish` patterns before any homepage UI work. |
| Rollback check | If bad data was detected, confirm `docs/bad-data-rollback-note.md` was applied and say whether rollback was corrected, not needed, or blocked. |
| Derived data | After `data/news.json` and the newest `data/news-history.json` edition are aligned, run `node scripts/build-derived-data.mjs` before validation so `data/news-index.json` and `data/news-today.json` are regenerated from the final current/history state. Then run `node scripts/build-derived-data.mjs --check` and `node scripts/validate-data.mjs`; do not commit if either derived file is stale, missing, or based on the pre-mirror edition. |
| Duplicate copy repair | 若校验报出字段重复，跑 `node scripts/repair-duplicate-copy.mjs` 后重新校验。 |
| Data validation | Record `node scripts/validate-data.mjs` result and item/source counts. |
| Site validation | Record `node scripts/validate-site.mjs`, `node scripts/validate-pages.mjs`, and any HTML/JSON parsing used. |
| Commit | Record the local commit message and whether the log can include the final hash without amending itself. News runs must use a `【新闻更新】` title prefix and the log must include `网站可见变化`, naming homepage TOP3, more news feed, all-news, archive, or detail pages where readers can see the update. If commit is blocked, use `blocked-validation`, `blocked-dirty-unrelated`, `blocked-git-error`, or `not-needed` from `docs/failure-status-wording-guide.md`. |
| Push | Record `pushed`, `blocked-dns`, `blocked-auth`, `blocked-non-fast-forward`, or `not-attempted-with-reason` using `docs/remote-sync-log-convention.md`; if publication is unsafe, add the publication blocker value from `docs/failure-status-wording-guide.md`. |

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
Validation: done - build-derived-data, validate-data, validate-site, validate-pages, HTML parse, JSON parse, diff check.
Derived data: done - rebuilt data/news-index.json and data/news-today.json after archive mirror; --check passed.
Archive diff: done - morning/evening editions compared for source posture and proof-boundary change.
Push: blocked-dns
Commit title: 【新闻更新】发布17点AI新闻：3条研究与产品信号
网站可见变化：首页TOP3、更多新闻流、全部AI新闻和详情页可看到本次新闻更新。
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
