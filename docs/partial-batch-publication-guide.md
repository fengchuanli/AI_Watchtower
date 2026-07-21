# Partial Batch Publication Guide

Use this guide when a scheduled 08:00 JST or 17:00 JST news update finds only one or two reliable, non-duplicate, copyright-safe candidates after intake. Its purpose is to make a short batch a visible quality decision, not a silent failure or an excuse to pad the homepage.

This guide sits after `docs/update-run-checklist.md` and before final drafting or logging. Pair it with `docs/candidate-priority-rubric.md`, `docs/source-diversity-triage-note.md`, and `docs/candidate-to-news-handoff.md` so the editor can decide whether to publish one or two strong items, hold the run, or keep searching.

## When To Use It

Apply this guide when any of these are true:

- Fewer than 10 candidates passed source, duplicate, freshness, proof-boundary, and copyright gates.
- Only one or two candidates remain after media-to-original-source review.
- A batch would need repeated URLs, stale background, community-only leads, weak media retellings, or paywall-body-dependent items to reach the normal item target.
- The safe candidates are concentrated in one source family or evidence mode, but the available facts are still useful enough to publish with a caveat.

The normal target remains at least 10 qualified current-news items. The target measures scanning depth; it does not override source safety.

## Publish, Hold, Or Continue Searching

Choose one decision before editing `data/news.json`:

| Decision | Use when | Editor action |
| --- | --- | --- |
| `publish-partial-batch` | One or two candidates are current, source-backed, non-duplicated, useful to Chinese readers, and can support a concise detail briefing. | Publish the short batch, preserve source and proof boundaries, and record `shortBatchReason` in edition/log notes. |
| `continue-searching` | The current candidates are safe but too narrow, and another registered source surface is still likely to produce a better same-window signal. | Keep searching targeted official, research, regulator, filing, customer-side, benchmark, or reliable-media surfaces before drafting. |
| `hold-no-safe-batch` | The remaining candidates cannot explain AI relevance, proof boundary, duplicate status, or copyright posture without overusing source material. | Do not publish a new current batch. Record why the run held and keep the previous edition visible until a safer update exists. |

Do not use `publish-partial-batch` when the candidate is merely interesting. It must still answer what happened, why it matters now, what the source does not prove, and what should be checked next.

## Minimum Publication Bar

A one- or two-item batch may publish only when every drafted item has:

- A registered `sourceId` and a clear `sourceRole`.
- A short `sourceBackedFact` that does not require copying source article structure.
- Clear `aiRelevance` for a Chinese reader group.
- A specific `proofBoundary` and `nextIndependentCheck`.
- No repeated current or archived source URL, and no near-duplicate title unless a fresh source fact is explicitly named.
- A copyright posture that keeps media items as minimum facts with `originalDependency: "must-read"`.
- Enough detail-page material to fill fact, impact, boundary, and next-check blocks without becoming a source replacement.

If any item fails this bar, the batch is not "partial"; it is not ready.

## Short Batch Reason

Write `shortBatchReason` in plain Chinese. It should name the gate that blocked more items and the reason the published items remain useful:

```text
Short batch reason: only two reliable non-duplicate candidates passed source, duplicate, proof-boundary, and copyright gates; weaker search results repeated older coverage or required media body details, so this run publishes a shorter batch instead of padding.
```

For edition metadata, keep the wording shorter:

```text
本批只发布 2 条：同时间窗内只有这两条通过来源、重复、核验边界和版权安全检查；没有用旧闻或弱来源补数量。
```

Do not hide the short batch inside a generic operational note. Future readers and future automation runs should be able to tell that the shortage was a deliberate quality choice.

## What Not To Add

Never fill a partial batch with:

- Repeated current or archived URLs.
- Search-result snippets without a readable original source.
- Community posts, reposts, screenshots, or rumor threads treated as facts.
- Stale official posts that have no fresh source action in the current window.
- Media stories that require article paragraphs, interviews, charts, or paywalled body text to be useful.
- Routine vendor marketing without independent evidence or a concrete reader decision.

If a weak candidate would make the homepage look fuller but less trustworthy, hold it.

## Compact Log Note

Use this compact wording in `docs/optimization-log.md` or the update editor note:

```text
Partial batch: publish-partial-batch - only 2 candidates passed source, duplicate, proof-boundary, and copyright gates; no padding with stale, repeated, community-only, or media-body-dependent items.
```

If no batch publishes:

```text
Partial batch: hold-no-safe-batch - remaining candidates could not state source role, proof boundary, duplicate clearance, and copyright-safe drafting path.
```

## Stop Conditions

Stop instead of publishing when:

- The only candidate is a source role you cannot classify.
- The source-backed fact is too thin to support AI relevance without speculation.
- The item would need source article body text to be useful.
- Duplicate review is incomplete.
- The short-batch reason would be "not enough time" rather than a source-safety decision.
- The previous current edition is safer and more useful than the proposed partial update.

A short batch should make AI Watchtower more trustworthy. If it only makes the site look busy, do not publish it.
