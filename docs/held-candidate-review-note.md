# Held Candidate Review Note

Use this note when a candidate is promising enough to revisit, but not safe enough to publish in the current 08:00 or 17:00 JST news run. The purpose is to keep useful leads visible without letting them become stale current news or a quiet backlog of unverified claims.

This note sits after `docs/candidate-intake-format.md` and `docs/candidate-hold-reject-reasons.md`, and before any later attempt to move the candidate through `docs/candidate-to-news-handoff.md`. A held candidate is not a draft queue. It is a small review ledger for one missing proof, date, source-role, duplicate, relevance, or batch-balance question.

## Ledger Shape

Record one short block per held candidate. Do not paste source paragraphs, article structure, screenshots, paywalled text, or long background notes.

```text
Held candidate:
- heldAtJst:
- candidateUrl:
- title:
- sourceId / sourceName / sourceRole:
- originalDecisionReason: hold-... code plus one Chinese sentence.
- holdUntilJst:
- recheckTrigger: official update / filing / regulator text / customer metric / audit / benchmark / dataset / replication / independent media / source-role review / duplicate review / next batch mix.
- freshnessLimit: latest date this source fact can still be treated as current news.
- staleFallback: reject-stale-no-current-hook / background-only / archive-context / replace-with-fresh-source.
- nextEditorAction: one concrete search, comparison, or source registration step.
```

## Review Rules

- `holdUntilJst` should normally be the next scheduled news run or the next day. Use a longer date only when the expected proof source has a known publication cadence, such as a filing, regulator agenda, benchmark release, or conference session.
- `freshnessLimit` must be explicit. If the source-backed fact is older than seven days when reviewed, do not draft it as current news unless a new source action is named in `sourceBackedFact`.
- `recheckTrigger` must name the evidence that would change the decision. "继续观察" is too vague.
- `staleFallback` must say what happens if no new evidence appears. Prefer reject or background-only notes over keeping the candidate alive indefinitely.
- A held media item can become draftable only if the later review still uses minimum source facts and keeps `originalDependency: "must-read"`, or if a stronger original source replaces it.
- A held vendor or community item can become draftable only when the later review names independent proof, official confirmation, or a reliable-media source fact.
- A held duplicate can become draftable only when the later review names a fresh source-backed action, not merely a rewritten headline.

## Stop Conditions

Reject or convert to background context instead of drafting when:

- `holdUntilJst` passed and no `recheckTrigger` evidence appeared.
- The only fresh detail requires paywalled, login-only, private, screenshot, or scraped body text.
- The URL or source fact is already current or archived and no new source action is visible.
- The AI relevance still depends on speculative business, politics, finance, or labor interpretation without a concrete model, workflow, policy, infrastructure, safety, adoption, or market-structure consequence.
- The candidate was held for batch balance, but the later batch is still concentrated by the same owner, company, geography, evidence mode, or narrative angle.

## Compact Run Note

Use this line in `docs/update-run-checklist.md` or the optimization log when a run revisits held items:

```text
Held-candidate review: done - 2 revisited; 1 replaced by official source, 1 expired to background-only because no fresh source action appeared before freshnessLimit.
```

The safe outcome is often "do not publish." This note is successful when it helps a later editor quickly reject stale leads, replace weak sources with stronger originals, or publish only candidates that gained a fresh source-backed fact.
