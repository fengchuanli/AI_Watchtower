# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-08-10 through 2026-09-08. It follows the 2026-08-09 monthly summary: the next cycle should make real news updates lower-friction, keep homepage reading lighter on mobile, and turn accumulated editorial rules into clearer update habits without weakening copyright, source, duplicate, or vendor-claim boundaries.

Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a Chinese message, and push to `origin main` when network access allows.

When all tasks in this plan are complete, create the next 30-day plan in this same file before continuing optimization. Do not stop daily optimization just because this plan ends.

## Daily Rhythm

News intelligence updates run twice per day.

- 08:00 JST: Morning news intelligence update.
- 17:00 JST: Evening news intelligence update.

Site optimization runs separately and should follow this plan.

- 20:00 JST: One focused site optimization pass. Choose the next useful item from the current phase or the VisionHub-style redesign track below.
- Older 14:00, 15:00, 16:00, 17:30, 18:00, 19:00, and 21:00 optimization jobs should remain paused unless the user explicitly restores a higher cadence.

## VisionHub-Style Redesign Track

Added on 2026-09-01 after reviewing VisionHub's public homepage structure. This track has priority over routine polish because the user cares about UI quality and wants AI Watchtower to become a Chinese, easy-to-read AI news briefing site rather than a dense intelligence-system dashboard.

Target: create a VisionHub-inspired Chinese reading experience without copying VisionHub's code, assets, text, brand, or protected presentation materials. Match the information architecture, reading rhythm, visual clarity, and editorial impact; keep AI Watchtower's own identity, copyright safety rules, and original Chinese analysis.

Priority order:

- UI direction: use a strong daily hero, compact "5-second key points", clear TOP3 ranking, readable briefing bands, and visual hierarchy that feels closer to an editorial briefing than an operations dashboard.
- Content structure: every news item should be explainable as a short event page with title, three-line summary, context, why it matters, trend meaning, next watch points, and source boundary.
- Homepage structure: put "today's AI changes", "TOP3", and "latest highlights" before process notes, scoring details, source caveats, or internal checklists.
- Mobile first: make the phone view the baseline. The first screen should answer what happened today and why it matters before showing editorial machinery.
- Selection logic: keep official/research/regulator sources as evidence anchors, but also track AI leaders, major investments, acquisitions, compute moves, policy fights, and business events when they materially affect the AI era.
- Detail pages: replace repeated labels with a clean narrative path: quick take, event context, AI Watchtower interpretation, trend meaning, reader impact, next checks, source links.
- Visual assets: prefer self-made diagrams, timelines, ranking cards, and relationship maps. Do not reuse media article images, paid screenshots, or third-party presentation graphics unless licensing is clear.
- Link behavior: make in-site article reading primary, but keep original links prominent as verification and deeper context. Do not create a replacement for paywalled or media source articles.
- Validation: add checks gradually so future automatic optimization cannot break TOP3 rendering, hidden/folded mobile sections, source links, article structure, or copyright boundaries again.

Suggested rollout within the remaining current plan:

- Day 21-23: Review the homepage against the VisionHub-style structure and simplify the first-screen order, TOP3, latest highlights, and mobile fold.
- Day 24-26: Redesign one detail-page template into a cleaner article/briefing layout, then apply it to all current news items.
- Day 27-28: Add visual explanation components such as timeline, actor map, number cards, or cause-effect diagram generated from structured fields.
- Day 29: Run mobile visual QA and record remaining UI gaps compared with the target.
- Day 30: Write the next 30-day plan with UI quality, content understandability, and VisionHub-style briefing polish as explicit first-class goals.

## Phase 1: Homepage Edition Quality

- Day 0: Add a homepage edition preflight note so each update starts from reader question, source mix, TOP3 reason, mobile scan burden, archive mirror, and proof-boundary checks before public copy is finalized.
- Day 1: Review `edition.readerFrame.mobile` against the current homepage and shorten any repeated or dense phrasing that slows 1-to-3-minute phone scanning.
- Day 2: Review `briefing.summary` and `deepBriefing.overview` so the homepage first states the daily reader decision, then separates source caveats and AI Watchtower interpretation.
- Day 3: Add a small rule for when `coverageMix` should merge tiny buckets instead of showing too many labels with one item each.
- Day 4: Review current `categories[].description` after the latest news update and remove stale "本期" angles that no longer match visible items.
- Day 5: Add a compact editorial note format for explaining why the current batch has fewer than 10 safe items without sounding incomplete or apologetic.
- Day 6: Review omitted-topic copy so each omitted planned topic tells readers where to look next without introducing unsupported fresh facts.

## Phase 2: Source And Candidate Workflow Friction

- Day 7: Add a one-command or one-section intake scratch template that mirrors the candidate fields editors actually fill during 08:00 and 17:00 runs.
- Day 8: Make duplicate-candidate reporting easier to interpret by documenting the difference between repeated URL, near-title match, and fresh source fact.
- Day 9: Add guidance for choosing the best source-of-record when official, media, filing, and research pages all exist for the same event.
- Day 10: Review `data/sources.json` labels and descriptions so source roles are readable to non-technical Chinese editors.
- Day 11: Add a source-owner concentration review note for batches dominated by TechCrunch, Axios, one vendor, or one research feed.
- Day 12: Add a safer way to record held-but-promising candidates for later runs without letting them become stale current news.
- Day 13: Review candidate workflow documents and merge or cross-link the two most confusing entry points.

## Phase 3: Detail Pages And Proof Boundaries

- Day 14: Review one current detail page path and make the fact, impact, boundary, and next-check blocks easier to scan on mobile.
- Day 15: Add an editorial rule for when `detailTrend` should be split because it carries more than one idea.
- Day 16: Review media-backed detail pages and make sure the original-article must-read reminder is visible without overwhelming the primary explanation.
- Day 17: Add examples for `evidenceThreshold` upgrades from media signal to official confirmation, from vendor claim to independent proof, and from research preprint to replicated result.
- Day 18: Review `followUpQuestions` so they point to concrete next checks rather than generic "continue observing" prompts.
- Day 19: Add guidance for when `counterEvidence` should downgrade a story rather than merely narrow it.
- Day 20: Review detail-page source references to ensure labels name the exact source fact they support.

## Phase 4: Continuity And Archive Usefulness

- Day 21: Add a lightweight cross-edition review note for recurring companies that asks whether the latest signal is stronger, weaker, repeated, or resolved.
- Day 22: Review `topicContinuity` notes and remove any wording that implies a trend is confirmed only because several media items repeated it.
- Day 23: Add archive-diff guidance for correction-only updates where the reader-facing story did not materially change.
- Day 24: Review all-news and tag-page framing so archive readers understand older items as context, not current alerts.
- Day 25: Add a note for retiring stale `nextCheck` questions when later official, filing, audit, metric, or third-party evidence appears.
- Day 26: Review source-concentration notes across the latest archived editions and identify any repeated caveat that should become a clearer standing rule.
- Day 27: Add a compact monthly continuity snapshot shape that can summarize the most repeated companies, topics, unresolved claims, and resolved checks.

## Phase 5: Validation, QA, And Next Cycle

- Day 28: Add or refine a lightweight validation guard for whichever homepage, detail-page, or workflow rule most directly affects current reader trust during this cycle.
- Day 29: Summarize what improved during this 30-day cycle and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Read `docs/product-principles.md` first and keep every improvement aligned with the product purpose.
- Read `docs/copyright-safety.md` before changing news content, source policy, detail-page copy, candidate workflow, or future optimization plans.
- Follow this plan in order unless a user request overrides it.
- Treat the VisionHub-style redesign track as the current product/UI priority until the homepage, detail pages, mobile scan path, and article briefings visibly reach that standard.
- If the plan is complete, write the next 30-day plan before making further daily improvements.
- When writing the next 30-day plan, preserve the product goal: help Chinese-native readers who are not comfortable tracking English AI sources understand important AI changes easily.
- Use `data/sources.json`, `docs/source-policy.md`, `docs/candidate-source-checklist.md`, and `docs/editorial-checklist.md` for content-related decisions.
- Preserve the balance: make AI news understandable through original analysis, but do not create a substitute for the original source article.
- Avoid publishing repeated source URLs or stale signals as new news.
- Keep original source links as references, not the primary reading path.
- Prefer readable Chinese labels and avoid repeated section titles.
- Run lightweight checks before committing.
- Update `docs/optimization-log.md` with focus, changed files, verification, and commit status.
- Commit with a concise Chinese message.
- Push to `origin main` when GitHub network access is available.
