# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-06-20 through 2026-07-19. Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a Chinese message, and push to `origin main` when network access allows.

When all tasks in this plan are complete, create the next 30-day plan in this same file before continuing optimization. Do not stop daily optimization just because this plan ends.

## Daily Rhythm

News intelligence updates run twice per day.

- 08:00 JST: Morning news intelligence update.
- 17:00 JST: Evening news intelligence update.

Site optimization runs separately and should follow this plan.

- 14:00 JST: Content and structure improvement.
- 15:00 JST: Product quality, layout, accessibility, or validation improvement.
- 16:00 JST: Editorial depth, source framing, or data structure improvement.
- 17:30 JST: Detail-page, navigation, or interaction improvement.
- 18:00 JST: Readability, wording, or visual hierarchy improvement.
- 19:00 JST: Maintenance, documentation, checks, or publishing resilience.
- 20:00 JST: Content polish, Chinese copy, summaries, or category clarity.
- 21:00 JST: Final quality pass, consistency check, or deployment hygiene.

## Phase 1: Edition-Level Understanding

- Day 1: Add a reader frame for each current edition so readers know the top conclusion, why this batch matters, and what remains unproven.
- Day 2: Add a short "what changed since last batch" summary that distinguishes fresh facts from repeated background.
- Day 3: Make the edition note shorter and split operational status from editorial interpretation.
- Day 4: Add stronger homepage wording for why omitted topics were not promoted.
- Day 5: Review the current edition's coverage mix and make each signal group name the user action it supports.
- Day 6: Add a compact source-risk note for batches dominated by one vendor or one source family.
- Day 7: Audit all current-edition metadata for Chinese readability and remove duplicated explanations.

## Phase 2: Detail Briefing Depth

- Day 8: Tighten each detail page into facts, impact, boundary, and next-check blocks.
- Day 9: Add a clear "who should care" sentence to promoted items and validate that it names a concrete audience.
- Day 10: Improve the downgrade-signal wording so counterevidence is specific enough to guide follow-up.
- Day 11: Add a stronger field for what evidence would upgrade a vendor claim to a verified conclusion.
- Day 12: Review source-reference labels so they describe the source fact, not just the source owner.
- Day 13: Add a lightweight recurring check for overlong detail paragraphs.
- Day 14: Review mobile detail pages after content edits and move secondary context below primary explanation.

## Phase 3: Discovery And Continuity

- Day 15: Add cross-edition trend notes for recurring companies or topics without turning them into a heavy database.
- Day 16: Improve company tag pages with latest signal, last-seen date, and source caveat.
- Day 17: Improve topic pages or topic sections with "why now" summaries for Agent, model, enterprise, policy, infrastructure, and developer tooling.
- Day 18: Add clearer archive labels for morning/evening editions and current-vs-archived status.
- Day 19: Add a simple archive readiness check that confirms current news and latest history agree on key edition fields.
- Day 20: Add a recent-decision index for optimization logs so daily runs can find the last relevant change faster.
- Day 21: Review navigation copy between homepage, all-news, archive, tags, and detail pages.

## Phase 4: Editorial Safety And Validation

- Day 22: Strengthen stale-news validation with source-specific exceptions only when a fresh source fact exists.
- Day 23: Add validation for repeated source-owner concentration in the current batch.
- Day 24: Add a candidate-source checklist for future semi-automated news gathering.
- Day 25: Add a duplicate-candidate report for URLs and near-matching titles before publication.
- Day 26: Improve source-policy examples for AI-adjacent capital, compute, leadership, and infrastructure events.
- Day 27: Add validation that vendor-claim items name the independent evidence needed next.
- Day 28: Review all editorial validators for false positives and document intentional limits.

## Phase 5: Rollover And Next Plan

- Day 29: Summarize what improved during this 30-day cycle and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Read `docs/product-principles.md` first and keep every improvement aligned with the product purpose.
- Follow this plan in order unless a user request overrides it.
- If the plan is complete, write the next 30-day plan before making further daily improvements.
- When writing the next 30-day plan, preserve the product goal: help Chinese-native readers who are not comfortable tracking English AI sources understand important AI changes easily.
- Use `data/sources.json`, `docs/source-policy.md`, and `docs/editorial-checklist.md` for content-related decisions.
- Avoid publishing repeated source URLs or stale signals as new news.
- Keep original source links as references, not the primary reading path.
- Prefer readable Chinese labels and avoid repeated section titles.
- Run lightweight checks before committing.
- Update `docs/optimization-log.md` with focus, changed files, verification, and commit status.
- Commit with a concise Chinese message.
- Push to `origin main` when GitHub network access is available.
