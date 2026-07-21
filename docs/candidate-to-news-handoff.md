# Candidate To News Handoff Checklist

Use this checklist after a candidate has passed `docs/candidate-source-checklist.md`, has a completed `docs/candidate-intake-format.md` record, has resolved any media-to-original-source decision with `docs/original-source-replacement-guide.md`, has been ranked with `docs/candidate-priority-rubric.md`, and has passed any needed batch-level source-diversity triage in `docs/source-diversity-triage-note.md`. Pair it with `docs/update-run-checklist.md` so the whole news update also records source discovery, duplicate reporting, partial-batch decisions from `docs/partial-batch-publication-guide.md`, validation, commit, and push status. After the current edition is drafted, apply `docs/current-to-history-publication-checklist.md` before committing so the newest archive edition keeps the same reader frame, source boundary, item count, and item order as the homepage. Its job is to turn one approved `draft` candidate into `data/news.json` without copying source article text or losing the editorial boundaries recorded during intake.

This is a drafting checklist, not a new content source. If the intake record cannot answer a row below, return the candidate to `hold` and update `decisionReason` with a code from `docs/candidate-hold-reject-reasons.md`.

## Pre-Draft Gate

Draft only when all of these are true:

- `draftingDecision` is `draft`.
- `sourceId` exists in `data/sources.json`.
- `duplicateStatus` says the URL and central source fact are not already current or archived.
- Media-started candidates either use the stronger original source as `candidateUrl` or explicitly remain `媒体背景` with `originalDependency: "must-read"`.
- `copyrightPosture` explains how the draft avoids becoming a Chinese replacement for the source article.
- `proofBoundary` and `nextIndependentCheck` are specific enough to become public reader guidance.
- Media-sourced items can be useful with the minimum source fact plus AI Watchtower analysis; otherwise use `reject-copyright-substitute-risk`.
- If only one or two items remain, `docs/partial-batch-publication-guide.md` has chosen `publish-partial-batch` and the short-batch reason names the safety gates that blocked additional items.

## Field Mapping

| Intake field | `data/news.json` field | Drafting rule |
| --- | --- | --- |
| `candidateUrl` | `sourceUrl` | Use the exact original source URL. Do not replace it with a homepage, search page, or syndicated copy. |
| `sourceId`, `sourceName`, `sourceRole` | `sourceId`, `sourceName`, `sourceType`, `sourceReliability`, `claimStatus`, `verificationStatus` | Match the registered source and visible status. Media reports stay `reported`; official/research/regulator originals can be stronger only when they directly support the central fact. |
| `publishedAt` | `publishedAt`, `time`, edition metadata | Preserve the source time and use the visible Chinese time label. If the event is older than seven days, add a fresh-source reason before drafting. |
| `sourceBackedFact` | `body`, `summary`, `detailBody`, `sourceFacts` | Keep this short. It should state the minimum fact the source supports, not the full article structure, interview detail, chart context, or long background. |
| `aiRelevance` | `whyItMatters`, `impact`, `readerUse`, `whoShouldCare`, `category` | Turn relevance into reader-facing Chinese value: who should care, what decision or watch point changes, and which topic bucket fits. |
| `proofBoundary` | `claimBoundary`, `provenance`, `originalDependency`, `verificationStatus` | Say what the source proves and what it does not prove. Media items normally require `originalDependency: "must-read"`. |
| `nextIndependentCheck` | `nextCheck`, `evidenceThreshold`, `followUpQuestions` | Name observable evidence that could upgrade the claim: official file, regulator text, customer metric, audit, benchmark, dataset, replication, filing, or independent source. |
| `duplicateStatus` | `freshSourceFact`, `whyRanked`, editor notes | Only publish if there is a new source fact. Do not reuse an archived URL as current news without explaining what changed. |
| `copyrightPosture` | `sourceFacts`, `detailBody`, `sourceReferences`, detail source reminder | Keep source links as verification references. Do not paste source paragraphs, quote paywalled text, or recreate the source article's order. |
| `priorityScore`, `priorityReason` | `selectionScore`, `whyRanked`, daily TOP3 consideration | Translate the reason into editorial judgment. Do not show the intake score as mechanical precision or let it override source safety. |
| `decisionReason` | not published for `draft`; kept in intake notes for `hold` or `reject` | A drafted item should not expose internal hold/reject codes. If a blocker still exists, stop drafting. |

## Drafting Order

1. Write `sourceFacts` and `body` from `sourceBackedFact` first, using the shortest safe wording.
2. Write `whyItMatters`, `impact`, `readerUse`, and `whoShouldCare` from `aiRelevance`, using plain Chinese reader language.
3. Write `claimBoundary`, `provenance`, `verificationStatus`, and `originalDependency` from `proofBoundary`.
4. Write `nextCheck`, `evidenceThreshold`, `followUpQuestions`, and `counterEvidence` from `nextIndependentCheck` plus the observable downgrade signal.
5. Assign `category`, `tags`, source fields, and ranking fields only after the fact, reader value, boundary, and next check are already clear.
6. Run `node scripts/report-duplicate-candidates.mjs` when using a batch candidate file, then run `node scripts/validate-data.mjs`.

## Copyright Safety Checks

Before saving the item, verify:

- `body` and `summary` are not translated or expanded source paragraphs.
- `detailBody` reads as AI Watchtower's explanation, not a paragraph-by-paragraph remake of the source.
- Media-sourced facts are short enough that readers still need the original source for complete facts, interviews, figures, charts, and context.
- `sourceReferences` point readers to original material; they are not used to justify copying extra source detail.
- Any quoted wording is rare, short, public, attributed, and unnecessary to replace the source article.

## Stop Conditions

Return to intake instead of drafting when:

- The only useful version would require source article structure or paywalled/login-wall body text.
- The intake record cannot name a proof boundary in one sentence.
- The candidate duplicates a current or archived item and adds no fresh source fact.
- The AI relevance is still generic, such as "AI company did business news", without a model, workflow, policy, infrastructure, safety, adoption, or market-structure consequence.
- The next check is vague, such as "continue watching", rather than a concrete source, metric, filing, benchmark, audit, dataset, replication, or official update.

The handoff is complete only when a future editor can trace every public claim in `data/news.json` back to a short intake field and can also see which parts are AI Watchtower's own Chinese interpretation.
