# Monthly Continuity Snapshot

Use this shape near the end of a plan window, or before writing a monthly optimization summary, to turn repeated archive context into a compact editorial snapshot. It helps the next editor see which companies, topics, unresolved claims, and resolved checks kept returning without treating repetition as new evidence.

This is an internal continuity aid, not a new reporting surface. Build it only from current `data/news.json`, archived `data/news-history.json` editions, tag-page context, `edition.companyContinuity`, `edition.topicContinuity`, `trendNotes`, and already published optimization decisions. Do not add fresh facts, hidden article details, scraped source text, or broad market conclusions.

If the snapshot may later feed a public continuity component, add the public handoff fields below. The handoff is still an editor note, not publishable copy. Its job is to separate cards that are ready to become a reader-facing monthly continuity module from patterns that must stay archive-only background.

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
publicContinuityHandoff:
  candidateCards:
    - label:
      sourceFields:
      readerUse:
      proofBoundary:
      publicStatus: ready / needs-current-edition / archive-only
  archiveOnlyContext:
    - pattern:
      reason:
  doNotPublish:
    - claimOrPattern:
      missingEvidence:
  nextComponentQuestion:
```

## Field Guidance

- `window`: Use the plan or calendar range being summarized, such as `2026-08-10 to 2026-09-08`.
- `sourceEditions`: Name the archive editions or log window reviewed; do not imply a complete internet search.
- `mostRepeatedCompanies`: List only companies that appear often enough to affect reader framing. Use `docs/company-continuity-review-note.md` status language for `latestStatus`.
- `mostRepeatedTopics`: List recurring topic groups or visible topic labels. Use `docs/topic-continuity-review-note.md` status language for `latestStatus`.
- `unresolvedClaims`: Include claims or open questions that still lack official, filing, contract, audit, metric, regulator, dataset, benchmark, replication, deployment-log, or customer-side proof.
- `resolvedChecks`: Include only questions answered by a later source-of-record artifact, not by repeated media or vendor narration.
- `standingRuleCandidates`: Use this only when the same caveat keeps returning and should become a checklist rule, data-format rule, validation guard, or next-plan task.
- `publicContinuityHandoff.candidateCards`: List at most three possible public cards. Each card must name the current/archive fields that support it, such as `topicContinuity.currentSignal`, `companyContinuity.whatChanged`, `trendNotes.boundary`, or tag-page batch status. Use `publicStatus: ready` only when the card can explain reader use and proof boundary without adding a new claim.
- `publicContinuityHandoff.archiveOnlyContext`: Keep repeated companies, topics, or source caveats here when they are useful background but lack a current-edition signal, clear reader use, or concrete proof boundary.
- `publicContinuityHandoff.doNotPublish`: Name tempting but unsafe patterns, especially repeated media coverage, vendor narration, old unresolved questions, or cross-edition clusters whose next evidence path is still vague.
- `publicContinuityHandoff.nextComponentQuestion`: One product question for the future UI, such as whether the homepage needs a monthly strip, whether tag pages are enough, or whether the pattern belongs only in the next 30-day plan.

## Writing Rules

- Count appearances from AI Watchtower archive fields, not from web search volume.
- Treat repeated media, vendor, newsletter, podcast, or secondary summaries as `repeated` until a stronger source artifact changes the evidence.
- Keep `readerMeaning` practical for Chinese readers: what to watch, where to be cautious, or which page/tag/archive context to revisit.
- Keep `nextEvidenceNeeded` concrete. Avoid "继续观察" unless the sentence also names the exact source artifact or observable result.
- Do not turn the snapshot into public homepage copy unless each statement is already supported by current or archived fields.
- Public handoff candidate cards must be short, source-field backed, and downgradeable: if the handoff cannot name `readerUse`, `proofBoundary`, and `sourceFields`, set `publicStatus: archive-only` and keep the pattern out of public UI.
- Do not use the monthly handoff to create all-month trend claims such as market share, adoption momentum, or policy consensus unless those claims already exist in reviewed AI Watchtower current/history fields and point to the required evidence.

## Compact Log Note

Use this wording when the snapshot is added or applied:

```text
Monthly continuity snapshot: done - repeated companies, topics, unresolved claims, and resolved checks were summarized from current/archive fields without adding new source claims.
Monthly continuity public handoff: done - possible reader-facing cards were separated into ready, needs-current-edition, archive-only, and do-not-publish groups from existing AI Watchtower fields.
```
