# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-06-17 through 2026-07-16. Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a Chinese message, and push to `origin main` when network access allows.

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

## Phase 1: Clarity And Reading Flow

- Day 1: Remove repeated labels in detail pages and unify terms across homepage and detail pages.
- Day 2: Improve the auto overview diagram so it explains relationships visually, not just with text.
- Day 3: Tighten the `速览` block so every article can be understood in 30 seconds.
- Day 4: Add clearer visual hierarchy between `速览`, `全貌图`, `事件解读`, `核验边界`, and `来源`.
- Day 5: Review mobile detail pages and reduce dense text blocks.
- Day 6: Improve `今日 TOP3` ranking cards and make the ranking reason obvious.
- Day 7: Audit all labels and remove remaining generic wording.

## Phase 2: Better Topic Discovery

- Day 8: Improve company tag pages for OpenAI, Anthropic, Google, and Meta.
- Day 9: Add source-family grouping such as official, research, media, and community signals.
- Day 10: Add topic grouping for Agent, model, enterprise, policy, infrastructure, and developer tooling.
- Day 11: Improve all-news history filters and sorting.
- Day 12: Add “new this batch” vs “already archived” explanations.
- Day 13: Add empty states for companies or topics with no captured items.
- Day 14: Review navigation between homepage, tag pages, all-news, archive, and detail pages.

## Phase 3: Editorial Quality

- Day 15: Add stronger selection scoring for impact, novelty, narrative strength, evidence quality, and reader utility.
- Day 16: Add validation that every promoted item can support an incident briefing.
- Day 17: Improve source-boundary wording so readers can distinguish facts from interpretation.
- Day 18: Add stronger de-duplication checks across source URLs and similar titles.
- Day 19: Improve source policy for VisionHub-style narrative events without weakening fact safety.
- Day 20: Add checks for stale items and repeated historical coverage.
- Day 21: Review Chinese copy for clarity, brevity, and consistency.

## Phase 4: Visual And Product Polish

- Day 22: Improve visual rhythm and spacing of cards on desktop and mobile.
- Day 23: Improve accessibility labels, keyboard navigation, and skip links.
- Day 24: Add better metadata and sharing descriptions for detail pages and tag pages.
- Day 25: Optimize CSS size and remove unused selectors.
- Day 26: Improve loading and error states for `data/news.json` and `data/news-history.json`.
- Day 27: Add lightweight visual QA instructions for local preview checks.
- Day 28: Review GitHub Pages compatibility and root-relative link safety.

## Phase 5: Rollover And Next Plan

- Day 29: Summarize what improved during the month and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Follow this plan in order unless a user request overrides it.
- If the plan is complete, write the next 30-day plan before making further daily improvements.
- Use `data/sources.json`, `docs/source-policy.md`, and `docs/editorial-checklist.md` for content-related decisions.
- Avoid publishing repeated source URLs or stale signals as new news.
- Keep original source links as references, not the primary reading path.
- Prefer readable Chinese labels and avoid repeated section titles.
- Run lightweight checks before committing.
- Update `docs/optimization-log.md` with focus, changed files, verification, and commit status.
- Commit with a concise Chinese message.
- Push to `origin main` when GitHub network access is available.
