# Archive Diff Summary Format

Use this compact format after the 17:00 JST news update when both a morning and evening edition exist for the same editorial date. Its purpose is to help archive readers quickly see what changed during the day without rereading two full batches or treating repeated context as a new source fact.

This is an archive-reading aid, not a new reporting surface. Build the diff only from fields already present in `data/news.json` and `data/news-history.json`: edition metadata, item IDs, titles, source roles, source families, topic groups, `freshSourceFact`, `changeSummary`, `sourceRisk`, and `trendNotes`. Do not add external claims, extra source details, media article paraphrases, or speculation that is not already supported by the two editions.

## When To Write It

Write or update an archive-diff note when:

- The 17:00 JST edition is published and the same date already has an 08:00 JST edition in `data/news-history.json`.
- A correction changes the newest evening edition or the matching morning edition.
- The archive page, all-news page, or optimization log needs a compact explanation of what changed between the two same-day batches.

Skip the diff with a reason when:

- Only one same-day edition exists.
- The second batch is a correction-only update with no item, source-family, topic, or proof-boundary change.
- The morning edition is missing, invalid, or not yet mirrored from `data/news.json`; fix archive readiness first with `docs/current-to-history-publication-checklist.md`.

## Correction-Only Decision

Use this check before writing a morning/evening diff for a correction. A correction-only update should be logged, but it should not create a reader-facing archive diff unless the correction changes what the reader should believe.

| Correction type | Reader-facing story changed? | Archive-diff action |
| --- | --- | --- |
| Typo, punctuation, label cleanup, short wording fix, or validator-only field alignment | No | Skip the diff and log `archive-diff: skipped-correction-only`. |
| Source URL, source name, timestamp, item order, or mirror metadata corrected without changing item count, source family, topic group, claim status, proof boundary, or next check | No | Skip the diff and mention the fixed field in `docs/optimization-log.md`. |
| Claim boundary, `nextCheck`, `evidenceThreshold`, `counterEvidence`, `claimStatus`, `sourceRole`, source family, topic group, added item, removed item, or re-ranked TOP3 changed | Yes | Write or update the archive diff because the reader's interpretation changed. |

When skipping, the log should still name the correction and say why no diff was written. Do not hide a correction behind the skip status if it demotes a claim, changes the supported source fact, removes a repeated item, or narrows a proof boundary.

## Comparison Scope

Compare only adjacent same-day morning/evening editions. Do not compare against yesterday, last week, or an unrelated archive entry unless a future plan adds an explicit continuity feature.

Use these inputs:

| Question | Field source |
| --- | --- |
| Which edition is morning and which is evening? | `edition.archiveLabel`, `edition.id`, `edition.date`, and timestamp/order in `data/news-history.json` |
| What was newly added or removed? | `items[].id`, `items[].title`, `items[].sourceUrl`, and `freshSourceFact` |
| Did source posture change? | `items[].sourceRole`, `sourceFamilies`, `sourceRisk`, and `sourceConcentration` |
| Did topic coverage change? | `topicGroups`, item `category`, and item IDs |
| Did proof strength change? | `claimStatus`, `originalDependency`, `claimBoundary`, `nextCheck`, and `evidenceThreshold` |
| What should readers not overread? | `changeSummary.repeatedContext`, `trendNotes[].boundary`, and item `counterEvidence` |

## Compact Shape

Keep the diff to four lines. Each line should be one concise Chinese sentence or a short semicolon-separated list.

```text
Archive diff: 08:00 -> 17:00 JST, 2026-07-08
New signals: 3 research-original agent/workflow/search training items replaced 2 morning media-background/company-safety and enterprise-stack signals.
Source posture: evening moved from reliable-media background to research preprints; still needs code, data, logs, third-party replication, or peer review before engineering conclusions.
Reader takeaway: treat the day as a shift from market/safety narratives toward agent-evaluation research signals, not as validated product or policy change.
```

If the evening batch is smaller or repeats context, name that directly:

```text
Archive diff: 08:00 -> 17:00 JST, 2026-07-08
New signals: 1 fresh official update; 2 morning background items remain useful context but were not republished.
Source posture: official publication fact is stronger than the morning media signal, but capability or adoption claims still need independent results.
Reader takeaway: update the watchlist for this source, but do not infer a broader market turn from a single same-day addition.
```

## Field Meanings

- `New signals`: Count concrete additions, removals, or replacements. Name the evidence type and topic, not every title.
- `Source posture`: Say whether the day moved toward official, research, regulator, reliable-media, vendor-claim, or community evidence. Name the proof still missing.
- `Reader takeaway`: Explain how a Chinese reader should use the same-day shift. Prefer "更新观察清单", "暂不升级结论", "等待官方/论文/监管/第三方材料" over broad trend language.

Do not write:

- "The evening edition proves..." unless both editions already contain confirmed official or original evidence.
- A list of all article details from a media source.
- A new trend conclusion that is not already supported by `trendNotes` or item fields.
- A diff against stale archive items just because they share a company or topic.

## Publication Steps

1. After mirroring the evening edition into `data/news-history.json`, find the nearest same-date morning edition.
2. Compare item IDs, source URLs, source roles, source-family counts, topic groups, and proof-boundary fields.
3. Draft the four-line compact diff using only the existing edition and item fields.
4. If the diff is written into an edition field in a future schema, mirror it between current and history the same way as `changeSummary`.
5. Record the diff status in `docs/optimization-log.md`: `archive-diff: done`, `archive-diff: skipped-one-edition`, `archive-diff: skipped-correction-only`, or `archive-diff: blocked-archive-drift`.
6. Run `node scripts/validate-data.mjs` after any data edit and `node scripts/validate-site.mjs` after workflow-doc changes.

## Stop Conditions

Do not publish or log a diff when:

- The newest history edition does not match `data/news.json`.
- Either same-day edition has invalid item counts, missing source roles, or repeated source URLs that validation would reject.
- The proposed diff depends on reading a paywalled body, login-only content, screenshots, comments, or long media paraphrases.
- The wording makes the evening batch sound more certain than its `claimBoundary`, `claimStatus`, `originalDependency`, or `nextCheck` allows.
- The comparison would force a broad daily trend from fewer than two concrete same-day signals.

## Compact Log Note

Use this wording when the same-day diff is available and clean:

```text
Archive diff: done - morning/evening editions were compared for new signals, source posture, topic movement, and proof-boundary change.
```

Use this wording when the diff is intentionally skipped:

```text
Archive diff: skipped-one-edition - only one same-day archive edition exists, so no morning/evening comparison was written.
```

Use this wording when a correction did not change the reader-facing story:

```text
Archive diff: skipped-correction-only - correction fixed wording, metadata, or mirroring without changing items, source posture, topic movement, or proof boundaries.
```

Use this wording when archive drift blocks the diff:

```text
Archive diff: blocked-archive-drift - fix the latest current/history mirror before writing a morning/evening comparison.
```
