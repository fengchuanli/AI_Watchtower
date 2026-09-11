# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-09-11 through 2026-10-10. It follows the 2026-09-10 monthly summary: the next cycle should make AI Watchtower feel more like a Chinese daily AI briefing, reduce mobile reading burden, strengthen detail-page narrative consistency, smooth the candidate-to-news workflow, and turn continuity notes into reader-useful context without weakening copyright, source, duplicate, or vendor-claim boundaries.

Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a categorized Chinese message, and push to `origin main` when network access allows. `【VisionHub网站风格优化】` has priority over `【网站优化】`: use it for reader-visible homepage structure, content expression, UI layout, mobile reading path, ranking cards, detail-page narrative structure, article readability, or visual briefing work. Use `【网站优化】` only for ordinary non-VisionHub maintenance, documentation, validation, schedule, archive bookkeeping, or infrastructure work.

When all tasks in this plan are complete, create the next 30-day plan in this same file before continuing optimization. Do not stop daily optimization just because this plan ends.

## Daily Rhythm

News intelligence updates run twice per day.

- 08:00 JST: Morning news intelligence update.
- 17:00 JST: Evening news intelligence update.

Site optimization runs separately and should follow this plan.

- 20:00 JST: One focused site optimization pass. Choose the next useful item from the current phase or the VisionHub-style briefing track below.
- Older 14:00, 15:00, 16:00, 17:30, 18:00, 19:00, and 21:00 optimization jobs should remain paused unless the user explicitly restores a higher cadence.

## VisionHub-Style Briefing Track

The VisionHub-style direction remains the product/UI priority for this cycle. The goal is not to copy VisionHub's code, assets, text, brand, or protected presentation materials. The goal is to make AI Watchtower's own Chinese editorial briefing clearer: daily hero, 5-second key points, TOP3 ranking, compact latest highlights, readable article pages, and light visual explanations that help a non-technical reader understand what changed today.

Priority order:

- First-screen clarity: a phone reader should understand today's most important AI changes before seeing process notes, source machinery, archive navigation, or internal validation language.
- Ranking confidence: TOP3 should feel like a reasoned briefing choice, with source role, proof boundary, reader use, and next-check path visible without turning cards into long reports.
- Article readability: detail pages should read as short event briefings with quick take, context, AI Watchtower interpretation, trend meaning, reader impact, next checks, and source links.
- Continuity for readers: repeated companies, topics, unresolved claims, and resolved checks should become a lightweight public reading aid, not only internal maintenance notes.
- Production friction: candidate intake, duplicate reporting, current/history mirroring, derived data generation, and validation should become easier to perform correctly during the 08:00 and 17:00 runs.
- Copyright safety: media-backed items remain original-source dependent; AI Watchtower provides minimum facts, Chinese explanation, trend interpretation, reader use, and verification boundaries.

Suggested rollout:

- Day 0-6: establish a briefing-quality scorecard and use it to lighten homepage first-screen copy, TOP3 card hierarchy, and mobile scan order.
- Day 7-12: improve detail-page article consistency, especially source-dependent media pages and repeated label density.
- Day 13-18: reduce real update friction around candidate intake, ranking, mirroring, derived data, duplicate review, and failed publication status.
- Day 19-24: make continuity useful to readers with compact monthly or cross-edition components while preserving source boundaries.
- Day 25-28: add validation and QA guards for the highest-risk reader-facing regressions from this cycle.
- Day 29-30: summarize the cycle and write the next 30-day plan before continuing.

## Phase 1: Homepage Briefing Clarity

- Day 0: Add a VisionHub-style briefing scorecard so future homepage edits can judge 5-second understanding, TOP3 clarity, mobile burden, proof boundaries, and source-original dependency before changing layout or copy.
- Day 1: Review the current homepage hero, today briefing, and `readerFrame.mobile` so the first screen answers what changed today in one calm Chinese reading path.
- Day 2: Tighten TOP3 card hierarchy so each promoted item shows title, minimum fact, why now, reader use, source role, and next-check boundary without duplicating detail-page paragraphs.
- Day 3: Review the compact non-TOP3 feed and remove repeated metadata that slows scanning after readers already saw TOP3.
- Day 4: Rebalance homepage source-risk, overread-boundary, and continuity modules so warnings support trust but do not dominate the first 1 to 3 minutes.
- Day 5: Add a short rule for when homepage categories should be collapsed, renamed, or reordered because the reader question changed.
- Day 6: Run mobile reading-path QA for the homepage at 390px and 768px, record the remaining hierarchy issues, and fix the smallest reader-visible issue.

## Phase 2: Detail-Page Article Quality

- Day 7: Audit one media-backed detail page and reduce any source-fact copy that feels like a substitute for the original article.
- Day 8: Review one official or research-backed detail page and make the interpretation, trend meaning, and reader impact feel like one article rather than separate labels.
- Day 9: Add guidance for choosing the strongest opening sentence in `summary`, `fact`, or `detailTrend` without repeating the same claim three times.
- Day 10: Review `whoShouldCare`, `readerUse`, and `impact` for overlap so detail pages give one concrete reader action path.
- Day 11: Add a compact detail-page ending rule: next checks and source links should close the article without burying the verification path.
- Day 12: Run a small detail-page mobile QA pass and fix the smallest paragraph-density or label-density issue that affects article readability.

## Phase 3: News Update Workflow Friction

- Day 13: Review the candidate intake to news handoff and mark the shortest path an editor should follow during a normal 08:00 or 17:00 run.
- Day 14: Add or refine a pre-publication checklist step for regenerating and validating `data/news-index.json` and `data/news-today.json` after current/history changes.
- Day 15: Review duplicate-candidate output against recent runs and make the report easier to act on when a candidate has a fresh source fact but a similar title.
- Day 16: Add a compact failure-status wording guide for pull, validation, commit, push, and publication blockers in optimization and news logs.
- Day 17: Review `data/sources.json` growth and add a small rule for when to merge, rename, or clarify source labels without losing source-role precision.
- Day 18: Simplify the must-read document path for a normal news update so editors do not need to scan every historical optimization rule before drafting.

## Phase 4: Reader-Visible Continuity

- Day 19: Design a lightweight public continuity component shape for recurring companies or topics, using only existing current/history fields.
- Day 20: Review recent `companyContinuity` notes and identify which repeated-company signals would be useful to readers rather than only editors.
- Day 21: Review recent `topicContinuity` notes and separate real stronger/weaker signals from repeated media radar in reader-facing language.
- Day 22: Add a rule for displaying resolved or retired checks without making old uncertainty look current.
- Day 23: Review all-news and tag pages for cross-edition continuity cues that help readers understand "latest" versus "background".
- Day 24: Add a compact monthly continuity handoff shape that can feed a future public component without inventing new claims.

## Phase 5: Validation, QA, And Next Cycle

- Day 25: Add or refine the smallest validation guard that protects the current VisionHub-style homepage briefing scorecard.
- Day 26: Add or refine the smallest validation guard that protects detail-page article readability or source-original dependency.
- Day 27: Review validator limits after the new guards and document any expected false positives or human-review gaps.
- Day 28: Run a final mobile and HTML QA pass for the most reader-visible homepage/detail-page path touched this cycle.
- Day 29: Summarize what improved during this 30-day cycle and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Read `docs/product-principles.md` first and keep every improvement aligned with the product purpose.
- Read `docs/copyright-safety.md` before changing news content, source policy, detail-page copy, candidate workflow, or future optimization plans.
- Follow this plan in order unless a user request overrides it.
- Treat the VisionHub-style briefing track as the current product/UI priority until the homepage, detail pages, mobile scan path, article briefings, and reader-visible continuity reach that standard; when a task could be classified as either ordinary website optimization or VisionHub-style improvement, choose `【VisionHub网站风格优化】`.
- If the plan is complete, write the next 30-day plan before making further daily improvements.
- When writing the next 30-day plan, preserve the product goal: help Chinese-native readers who are not comfortable tracking English AI sources understand important AI changes easily.
- Use `data/sources.json`, `docs/source-policy.md`, `docs/candidate-source-checklist.md`, and `docs/editorial-checklist.md` for content-related decisions.
- Preserve the balance: make AI news understandable through original analysis, but do not create a substitute for the original source article.
- Avoid publishing repeated source URLs or stale signals as new news.
- Keep original source links as references, not the primary reading path.
- Prefer readable Chinese labels and avoid repeated section titles.
- Run lightweight checks before committing.
- Update `docs/optimization-log.md` with focus, changed files, verification, commit status, and `网站可见变化` that says where readers can see the change; if there is no visible website change, say it is a rule, validation, or plan-only update.
- Commit with a categorized Chinese title: `【新闻更新】`, `【VisionHub网站风格优化】`, or `【网站优化】`, followed by the concrete improvement. Use `【VisionHub网站风格优化】` before `【网站优化】` whenever the change affects visible UI or reader-facing content structure.
- Push to `origin main` when GitHub network access is available.
