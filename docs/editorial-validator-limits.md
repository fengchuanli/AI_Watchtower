# Editorial Validator Limits

This note documents where AI Watchtower's editorial validators are intentionally strict and where they can produce false positives. Use it before loosening `scripts/validate-data.mjs` or changing content only to satisfy a regular expression.

The validators protect the product goal: Chinese readers should get a clear, source-aware briefing without mistaking weak evidence, repeated background, or vendor narrative for confirmed AI change. They check structure and copy posture; they do not replace source reading, copyright judgment, or human editorial review.

## False-Positive Review Rules

- Prefer editing data copy when the validator correctly asks for a clearer source boundary, reader action, independent proof path, or shorter mobile paragraph.
- Prefer editing validator wording when a strong draft fails only because the accepted Chinese trigger words are too narrow.
- Do not add vague filler words just to satisfy a pattern. If a rule pushes copy toward unnatural Chinese, document the better phrase and expand the validator vocabulary.
- Keep failures actionable. Error messages should name the field, the missing editorial job, and the kind of evidence or wording needed.

## Intentional Limits

### Freshness and duplicate checks

- Current-feed items older than seven days are blocked unless `freshSourceFact` records a source-specific new fact inside the current freshness window.
- Repeated source URLs and near-matching titles are treated as likely duplicate coverage. This may flag separate follow-up stories with similar titles, so a new item should use a genuinely fresh source URL and explain the new fact instead of republishing older background.
- Near-title matching is approximate. It catches repeated Chinese and Latin titles, but it cannot understand story lineage, so editorial review decides whether a follow-up is distinct enough.

### Source concentration checks

- `sourceRisk` and `sourceConcentration` force batches dominated by one source family or source owner to name the next independent check.
- A small three-item batch can trigger concentration quickly. This is intentional because AI Watchtower is a briefing, not a large news portal; readers need to know when one feed or evidence mode dominates.
- The validator cannot judge whether the dominant source is actually wrong. It only requires a visible caveat and a next source type or owner to check.

### Vendor-claim checks

- Items marked `sourceRole: "厂商主张"` must say what the vendor narrative does not prove and must name independent evidence in `nextCheck`.
- The accepted proof vocabulary is deliberately concrete: customer-side metrics, third-party benchmarks, papers, regulator text, audits, contracts, filings, original data, deployment evidence, or external expert review.
- This may reject a valid story when the copy uses a new proof phrase. Expand the allowed vocabulary only if the phrase still points to an external evidence path, not to more vendor language.

### Promoted-item briefing checks

- `今日 TOP3` and the latest archive snapshot must support facts, impact, boundary, next check, downgrade signal, audience, follow-up questions, and selection scoring before promotion.
- The checks favor complete mobile-readable briefings over sparse headline aggregation. If the source cannot support these fields, keep the item out of the promoted feed.
- The validator checks field presence and minimum specificity; it cannot confirm that the source actually supports every sentence.

### Chinese readability and mobile length checks

- Detail paragraphs over 180 Chinese characters are rejected for mobile reading. Split or tighten the paragraph rather than hiding important context.
- Some English product names are allowed, but visible structural labels should stay Chinese-readable unless the English phrase is the actual product or source name.
- Metadata line-length limits are intentionally conservative so homepage source context remains glanceable.

### Source-reference labels

- Deep-briefing references must name both the source or source family and the source fact. This may reject elegant labels that are too short.
- Keep labels concise, but do not reduce them to source-owner names like "OpenAI" or "Reuters" without saying what source fact they support.

## When To Change A Validator

Change a validator when all of these are true:

1. The source material supports the content under `docs/source-policy.md` and `docs/copyright-safety.md`.
2. The draft already states facts, interpretation, uncertainty, and next evidence clearly in natural Chinese.
3. The failure comes from narrow vocabulary, thresholds, or pattern matching rather than a missing editorial boundary.
4. The updated rule remains testable and keeps a future editor from publishing vague, duplicated, stale, or overconfident copy.

When changing a validator, update the related data-format or policy docs and add a short note to `docs/optimization-log.md`.
