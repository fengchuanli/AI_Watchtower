# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-10-11 through 2026-11-09. It follows the 2026-10-10 monthly summary: the next cycle should make AI Watchtower easier to read on a phone in 1 to 3 minutes, turn TOP3 into a clearer visual briefing, stabilize detail-page article tone, shorten the daily news publishing path, make continuity useful beyond the current homepage batch, and handle remote-sync boundaries without weakening copyright, source, duplicate, or vendor-claim boundaries.

Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a categorized Chinese message, and push to `origin main` when network access and push boundaries allow. `【VisionHub网站风格优化】` has priority over `【网站优化】`: use it for reader-visible homepage structure, content expression, UI layout, mobile reading path, ranking cards, detail-page narrative structure, article readability, visual briefing, or reader-facing continuity work. Use `【网站优化】` only for ordinary non-VisionHub maintenance, documentation, validation, schedule, archive bookkeeping, or infrastructure work.

When all tasks in this plan are complete, create the next 30-day plan in this same file before continuing optimization. Do not stop daily optimization just because this plan ends.

## Daily Rhythm

News intelligence updates run twice per day.

- 08:00 JST: Morning news intelligence update.
- 17:00 JST: Evening news intelligence update.

Site optimization runs separately and should follow this plan.

- 20:00 JST: One focused site optimization pass. Choose the next useful item from the current phase or the VisionHub-style briefing track below.
- Older 14:00, 15:00, 16:00, 17:30, 18:00, 19:00, and 21:00 optimization jobs should remain paused unless the user explicitly restores a higher cadence.

## VisionHub-Style Briefing Track

The VisionHub-style direction remains the product/UI priority for this cycle. The goal is not to copy VisionHub's code, assets, text, brand, or protected presentation materials. The goal is to make AI Watchtower's own Chinese editorial briefing clearer: calm daily first screen, TOP3 reasoned ranking, compact latest highlights, readable article pages, and light visual explanations that help a non-technical reader understand what changed today.

Priority order:

- Mobile first-screen relief: a phone reader should understand the day's most important AI changes before seeing process notes, long source machinery, archive navigation, or repeated continuity details.
- Visual ranking confidence: TOP3 should show source role, proof boundary, reader use, and next-check path with a small visual briefing layer, not only dense text.
- Article consistency: detail pages should read like short event briefings with a quick take, minimum fact, AI Watchtower interpretation, trend meaning, reader impact, next checks, and source links.
- Public continuity: repeated companies, topics, unresolved claims, and resolved checks should help readers see what changed this month, not only help editors avoid duplicates.
- Production simplicity: candidate intake, duplicate reporting, current/history mirroring, derived data generation, validation, commit, and push status should become easier to perform correctly during the 08:00 and 17:00 runs.
- Remote-sync hygiene: local-ahead, blocked DNS, approval-required push, and already-pushed states should be visible in logs without causing unrelated commits to be published by accident.
- Copyright safety: media-backed items remain original-source dependent; AI Watchtower provides minimum facts, Chinese explanation, trend interpretation, reader use, and verification boundaries.

Suggested rollout:

- Day 0-6: reduce mobile first-screen burden and make homepage modules easier to scan.
- Day 7-12: add TOP3 visual briefing and ranking-card evidence clarity without increasing text density.
- Day 13-18: stabilize detail-page article voice, source boundaries, and paragraph density.
- Day 19-24: shorten the daily publishing path and improve remote-sync/status handling.
- Day 25-28: make continuity reader-visible across editions or months using only existing fields and safe handoff shapes.
- Day 29-30: summarize the cycle and write the next 30-day plan before continuing.

## Phase 1: Mobile First-Screen Relief

- Day 0: Audit the current homepage first-screen order on phone and mark which modules belong before or after the first TOP3 decision.
- Day 1: Tighten `briefing.summary`, watch points, or `readerFrame.mobile` so phone readers get one calmer 1 to 3 minute path before the deep briefing.
- Day 2: Review homepage editor notes and move any process-heavy boundary text out of the first scan path when a shorter trust cue can do the job.
- Day 3: Rebalance TOP3, deep briefing, continuity, and compact feed spacing so dense editions do not feel like one uninterrupted text wall.
- Day 4: Add a small homepage rule for when continuity cards should collapse, summarize, or move below the compact feed on mobile.
- Day 5: Review category and purpose navigation labels so a phone reader can choose "what should I read next" without scanning internal taxonomy.
- Day 6: Run mobile reading-path QA at 390px and 768px, record the remaining first-screen friction, and fix the smallest reader-visible issue.

## Phase 2: TOP3 Visual Briefing

- Day 7: Design a lightweight visual briefing shape for TOP3 that uses existing fields only: signal type, source role, proof boundary, reader use, and next-check artifact.
- Day 8: Implement the smallest TOP3 visual cue that helps readers compare safety, policy, product, research, infrastructure, or capital signals without adding new claims.
- Day 9: Review one TOP3 official-source card and make its visual cue distinguish confirmed release facts from vendor claims or unproven outcomes.
- Day 10: Review one TOP3 media-backed card and make the visual cue reinforce `must-read` original-source dependency rather than replacing the article.
- Day 11: Add or refine guidance for TOP3 visual cues in `docs/news-data-format.md` or homepage preflight docs.
- Day 12: Add the smallest validation guard that prevents TOP3 visual briefing fields or labels from drifting into unsupported certainty.

## Phase 3: Detail-Page Article Consistency

- Day 13: Audit one media-backed detail page for tone, paragraph density, and source substitution risk; trim only what helps the page stay a briefing.
- Day 14: Audit one official, research, or regulator-backed detail page so interpretation, trend meaning, reader impact, and next checks read as one short article.
- Day 15: Add a detail-page voice rule for avoiding repeated "this means" labels when the article already explains the trend in plain Chinese.
- Day 16: Review detail-page opening and ending rhythm so quick take, minimum fact, interpretation, and source links do not repeat the same claim.
- Day 17: Add a small mobile paragraph-density or anchor-label guard for detail pages if recent pages show drift.
- Day 18: Document expected false positives or human-review gaps for any new detail-page readability guard.

## Phase 4: Publishing Path And Remote Sync

- Day 19: Review the normal 08:00 / 17:00 publishing path and remove or reorder one step that slows a safe ordinary update.
- Day 20: Make current/history mirroring, derived-data generation, and validation status easier to copy into the news update log without missing a file.
- Day 21: Improve duplicate-candidate or held-candidate output so editors can see reject, hold, replace-source, or publish decisions faster.
- Day 22: Add a clearer local-ahead / push-held rule for optimization runs when unrelated news commits are already ahead of `origin/main`.
- Day 23: Review `docs/remote-sync-log-convention.md` and logs for blocked-dns, approval-required, already-up-to-date, and pushed wording consistency.
- Day 24: Add or refine the smallest validation guard that keeps the publishing path and remote-sync boundary discoverable.

## Phase 5: Reader-Visible Continuity And Next Cycle

- Day 25: Review recent `publicContinuityHandoff` candidates and choose one safe public continuity shape that can be shown without inventing new claims.
- Day 26: Prototype or document a monthly/cross-edition continuity view for one company or topic using only existing current/history fields.
- Day 27: Add a resolved/retired-check presentation rule so old uncertainty does not look current in any public continuity view.
- Day 28: Run a reader-path QA pass for homepage -> TOP3 -> detail -> tag/archive continuity routes and fix the smallest broken or confusing cue.
- Day 29: Summarize what improved during this 30-day cycle and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Read `docs/product-principles.md` first and keep every improvement aligned with the product purpose.
- Read `docs/copyright-safety.md` before changing news content, source policy, detail-page copy, candidate workflow, or future optimization plans; also apply it before continuity displays or visual briefing work.
- Follow this plan in order unless a user request overrides it.
- Treat the VisionHub-style briefing track as the current product/UI priority until the homepage, TOP3 visual briefing, detail pages, mobile scan path, article briefings, reader-visible continuity, and sync/status path reach that standard; when a task could be classified as either ordinary website optimization or VisionHub-style improvement, choose `【VisionHub网站风格优化】`.
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
- Push to `origin main` when GitHub network access and push boundaries allow.
