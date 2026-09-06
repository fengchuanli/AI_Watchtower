# Source Concentration Archive Review Note

Use this note during continuity and archive review, after the latest homepage edition has already been mirrored into `data/news-history.json`. Its job is to turn repeated source-concentration caveats into a standing editorial rule, instead of rewriting the same vague warning in every batch.

This review looks backward across recent archived editions. It complements `docs/source-diversity-triage-note.md`, which is used before drafting a current batch.

## When To Run

Run this review when at least two recent archived editions repeat one of these caveats:

- Official or technical sources dominate the batch, but effect, adoption, ROI, safety, cost, or deployment outcomes still need outside proof.
- Reliable media sources dominate the batch, so the edition is a radar or checklist rather than confirmed market, policy, legal, or organization change.
- One registered source owner or feed, such as TechCrunch, Axios, AWS Machine Learning Blog, OpenAI News, Google Workspace Updates, or VentureBeat, becomes the largest repeated owner across adjacent editions.
- `sourceRisk`, `sourceConcentration`, and `overreadBoundary` all point to the same missing evidence type, such as customer logs, filings, audit samples, regulator texts, independent benchmarks, or source-of-record responses.

## Repeated Caveat Decisions

Choose one decision before editing public or workflow copy:

| Decision | Use when | Standing rule to add |
| --- | --- | --- |
| `official-release-boundary` | Official, status, technical blog, or vendor-owned pages repeatedly supply most items. | Say the batch can verify publication, access, status, disclosure, or self-described scope; do not upgrade to customer outcome, adoption, safety, ROI, cost, or deployment effect without customer-side logs, filings, audits, independent benchmarks, regulator material, contracts, or third-party tests. |
| `media-radar-boundary` | Reliable media repeatedly supplies most items or the largest single owner. | Keep media facts minimal, set `originalDependency: "must-read"`, and frame the edition as a radar that needs official response, filing, court record, named organization document, original report, regulator material, customer metric, or independent test before becoming confirmed fact. |
| `single-owner-balance` | One source owner or feed repeatedly becomes the largest batch contributor, even below two thirds. | Keep only the highest-utility items from that owner, then look for a different owner, source family, geography, reader group, or evidence mode before filling more slots. If no safe balancing item exists, publish short or keep the owner-specific `sourceConcentration` caveat. |
| `proof-path-repeat` | The same missing evidence type appears across `sourceRisk`, `sourceConcentration`, `overreadBoundary`, `trendNotes`, or item-level `nextCheck`. | Move the repeated proof path into `docs/candidate-source-checklist.md`, `docs/source-diversity-triage-note.md`, `docs/news-data-format.md`, or validation wording so future editors know the required artifact before drafting. |

## Review Shape

Inspect the newest 5 to 12 archived editions and record the pattern in the optimization log:

```text
archive-source-concentration: official-release-boundary; recent editions repeatedly need customer logs, filings, audits, and third-party benchmarks before publication facts can become effect claims.
```

Keep the note concise. The archive review should not introduce fresh news facts, quote source articles, or change historical items only to make past wording uniform. It should identify the repeated editorial lesson, add the smallest reusable rule, and leave older archive snapshots intact unless they contain an actual error.

## Stop Conditions

Do not add a new standing rule when:

- Only one edition has the caveat.
- The repeated phrase is already covered by an existing rule and current validators enforce it.
- The issue is a one-off source mix caused by a single event day.
- A rule would encourage artificial balance by adding weaker, stale, duplicated, paywalled, login-walled, or unclear-source candidates.

The goal is honest reader framing: a concentrated batch can be useful, but readers should immediately know whether it is proof, radar, official self-description, or a queue for independent checks.
