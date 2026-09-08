# Monthly Continuity Snapshot

Use this shape near the end of a plan window, or before writing a monthly optimization summary, to turn repeated archive context into a compact editorial snapshot. It helps the next editor see which companies, topics, unresolved claims, and resolved checks kept returning without treating repetition as new evidence.

This is an internal continuity aid, not a new reporting surface. Build it only from current `data/news.json`, archived `data/news-history.json` editions, tag-page context, `edition.companyContinuity`, `edition.topicContinuity`, `trendNotes`, and already published optimization decisions. Do not add fresh facts, hidden article details, scraped source text, or broad market conclusions.

## When To Use It

Use the snapshot when:

- A 30-day plan is close to completion and the next plan needs continuity context.
- Several current or archived editions repeat the same company, topic, proof boundary, source caveat, or next-check question.
- The editor needs to decide whether a repeated pattern deserves a standing rule, a validation guard, a next-cycle task, or only archive background.

Skip it when there are too few editions to compare, when the pattern comes only from one headline match, or when the editor cannot name the source-backed facts behind the repeated context.

## Snapshot Shape

Keep the snapshot short enough to read before a news run. One monthly note should fit on one screen.

```text
Monthly continuity snapshot
window:
sourceEditions:
mostRepeatedCompanies:
  - company:
    appearances:
    latestStatus: stronger / weaker / repeated / resolved / mixed
    readerMeaning:
    nextEvidenceNeeded:
mostRepeatedTopics:
  - topic:
    appearances:
    latestStatus: stronger / weaker / repeated / mixed
    readerMeaning:
    nextEvidenceNeeded:
unresolvedClaims:
  - claim:
    lastSeen:
    blockingEvidence:
    nextEditorAction:
resolvedChecks:
  - check:
    resolvedBy:
    remainingBoundary:
standingRuleCandidates:
  - pattern:
    proposedRule:
    validationOrDocTarget:
```

## Field Guidance

- `window`: Use the plan or calendar range being summarized, such as `2026-08-10 to 2026-09-08`.
- `sourceEditions`: Name the archive editions or log window reviewed; do not imply a complete internet search.
- `mostRepeatedCompanies`: List only companies that appear often enough to affect reader framing. Use `docs/company-continuity-review-note.md` status language for `latestStatus`.
- `mostRepeatedTopics`: List recurring topic groups or visible topic labels. Use `docs/topic-continuity-review-note.md` status language for `latestStatus`.
- `unresolvedClaims`: Include claims or open questions that still lack official, filing, contract, audit, metric, regulator, dataset, benchmark, replication, deployment-log, or customer-side proof.
- `resolvedChecks`: Include only questions answered by a later source-of-record artifact, not by repeated media or vendor narration.
- `standingRuleCandidates`: Use this only when the same caveat keeps returning and should become a checklist rule, data-format rule, validation guard, or next-plan task.

## Writing Rules

- Count appearances from AI Watchtower archive fields, not from web search volume.
- Treat repeated media, vendor, newsletter, podcast, or secondary summaries as `repeated` until a stronger source artifact changes the evidence.
- Keep `readerMeaning` practical for Chinese readers: what to watch, where to be cautious, or which page/tag/archive context to revisit.
- Keep `nextEvidenceNeeded` concrete. Avoid "继续观察" unless the sentence also names the exact source artifact or observable result.
- Do not turn the snapshot into public homepage copy unless each statement is already supported by current or archived fields.

## Compact Log Note

Use this wording when the snapshot is added or applied:

```text
Monthly continuity snapshot: done - repeated companies, topics, unresolved claims, and resolved checks were summarized from current/archive fields without adding new source claims.
```
