# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-10-11 through 2026-11-09
- Current phase: Phase 3, Detail-Page Article Consistency
- Last indexed run: 2026-10-24 11:03:31 JST (20:00 scheduled run)
- Network status: Latest 20:00 run first hit sandbox GitHub DNS failure, then pulled successfully after network authorization. Local `main` matched `origin/main` before editing.

## Current Cycle Day 4 Completion

- Complete: mobile continuity with multiple cards defaults to collapsed; summary retains labels/statuses and a repetition boundary. Single cards and desktop default open. Reader choice is not reset on resize.
- Commit: see latest optimization log entry.

## Recent Plan-Day Decisions

| Plan day | Status | Latest local commit | Decision shortcut |
| --- | --- | --- | --- |
| Previous Day 28 | Complete | `829b83e` | `docs/homepage-edition-preflight.md` has a First-Screen Reader Order Guard, and `scripts/validate-site.mjs` enforces hero -> today briefing -> TOP3 -> deep briefing -> compact feed plus data-backed today/TOP3/feed hooks. |
| Previous Day 29 | Complete | `5a0ae94` | `docs/monthly-optimization-summary.md` summarizes the 2026-08-10 to 2026-09-08 cycle's homepage, detail-page, candidate workflow, continuity, validation, and remaining VisionHub-style weaknesses. |
| Previous Day 30 | Complete | `166baeb` | `docs/optimization-plan.md` now covers 2026-09-11 through 2026-10-10 and puts VisionHub-style briefing polish, mobile reading, article readability, update workflow friction, and reader-visible continuity first. |
| Day 0 | Complete | `166baeb` | `docs/visionhub-briefing-scorecard.md` gives homepage/detail edits a pass/partial/fail check for five-second understanding, TOP3 reader use, source boundary, original-source dependency, mobile burden, continuity use, and visual-aid purpose. |
| Day 1 | Complete | `3f6416b` | Current `data/news.json` and mirrored current history/today data now make the homepage hero/today/mobile path start with three reader questions: bottom-layer platform change, safety source files, and government/enterprise adoption evidence. |
| Day 2 | Complete | `9040c3a` | Homepage TOP3 cards now show minimum fact, why-now rationale, reader use, source boundary, and next-check path on the card face, with score and original-dependency details kept expandable. |
| Day 3 | Complete | `b2676ed` | Homepage non-TOP3 feed cards now collapse category, source role, and time into one low-weight context line so the compact feed does not repeat TOP3-style metadata chips. |
| Day 4 | Complete | `1fb33e8` | Homepage editor notes now lead boundary/source/continuity context with a concise `阅读边界速览`, while full overread, source-risk, topic continuity, company continuity, and source-family records sit behind `完整边界记录`. |
| Day 5 | Complete | `1adae4e` | `docs/homepage-edition-preflight.md` and `docs/news-data-format.md` now define `categoryRouteDecision`: rewrite, reorder, or collapse the homepage category reading path when the current reader question changes. |
| Day 6 | Complete | `1575584` | Homepage mobile reading path now puts `按目的阅读` after 今日简报 and TOP3, so 390px and 768px readers reach the ranked briefing sooner while keeping purpose navigation before the deep briefing. |
| Day 7 | Complete | `0030d96` | The TechCrunch-backed Agent-supervision detail page now keeps `detailBody` to a minimal reported signal and sends interviews, case detail, investigation background, and context back to the original article; current, latest archive, and derived today data are aligned. |
| Day 8 | Complete | `15386aa` | The Anthropic/Accenture official detail page now links trend meaning, ordinary reader impact, and safety/legal/procurement use into one clearer article path while keeping the official-source boundary and next-check artifacts visible. |
| Day 9 | Complete | `d229ecd` | `docs/detail-page-review-guide.md` and `docs/news-data-format.md` now require editors to choose one strongest opening sentence across `summary`, `detailBody`, and `detailTrend`, so detail pages do not repeat the same claim three times before reaching interpretation and proof boundaries. |
| Day 10 | Complete | `14a9a44` | The Guardian data-center debt detail item now separates `impact`, `whoShouldCare`, and `readerUse`: impact explains the capital-structure risk, audience names budget/contract owners, and reader use becomes a concrete checklist instead of repeating the same finance/platform group. |
| Day 11 | Complete | `56b56d6` | `docs/detail-page-review-guide.md` and `docs/news-data-format.md` now define the article ending rule: close with boundary, upgrade/downgrade proof, one concrete `nextCheck`, artifact-specific follow-up questions, and source/archive links instead of restating trend or long media caveats. |
| Day 12 | Complete | `d1ca805` | Detail-page mobile jump navigation now stays in one horizontally scrollable row below 620px, so the six section labels do not create a tall pre-article block between the proof path and the article body. `scripts/validate-site.mjs` guards this mobile-density behavior. |
| Day 13 | Complete | `8e1126f` | `docs/candidate-to-news-handoff.md` now marks the normal 08:00 / 17:00 shortest path: plain-language note, source gate, duplicate report, short intake, priority/mix check, field mapping, homepage/archive preflight, derived-data rebuild, validation, commit, and push status. `scripts/validate-site.mjs` guards the path. |
| Day 14 | Complete | `e99bb37` | `docs/current-to-history-publication-checklist.md`, `docs/update-run-checklist.md`, and `docs/candidate-to-news-handoff.md` now make the derived-data rebuild a publication gate: after current/history mirror is final, run `node scripts/build-derived-data.mjs`, then `node scripts/build-derived-data.mjs --check`, then validation so `data/news-index.json` and `data/news-today.json` cannot lag the homepage/archive pair. |
| Day 15 | Complete | `e462c01` | `scripts/report-duplicate-candidates.mjs` now prints review actions for repeated URLs, near-title matches, and fresh-source-fact clearance; candidate files may pass `sourceBackedFact` so editors can hold or reject similar-title items unless the new source action is explicit. `docs/candidate-source-checklist.md`, `docs/update-run-checklist.md`, and `scripts/validate-site.mjs` guard the behavior. |
| Day 16 | Complete | `1d8d39c` | `docs/failure-status-wording-guide.md` now gives optimization and news logs compact Pull, Validation, Commit, Push, and Publication blocker wording; `docs/update-run-checklist.md`, `docs/candidate-to-news-handoff.md`, `docs/remote-sync-log-convention.md`, `README.md`, and `scripts/validate-site.mjs` keep the guide discoverable and guarded. |
| Day 17 | Complete | `2be033f` | `docs/source-policy.md` now defines source-label stewardship for `data/sources.json`: create a separate source label only for distinct source role, trust level, feed cadence, or source-of-record duty; merge ordinary sections/tags/localized copies/reposts under existing owner labels; rename misleading labels; clarify `sources[].notes` when same-owner entries stay separate. `docs/news-data-format.md`, `docs/candidate-source-checklist.md`, `docs/update-run-checklist.md`, and `scripts/validate-site.mjs` guard the rule. |
| Day 18 | Complete | `bf53f18` | `docs/update-run-checklist.md` now has a `Normal News Update Must-Read Path`: candidate workflow plain-language note, source checklist, intake format, candidate-to-news handoff, homepage/archive publication gates, then derived-data/validation/commit/push status. `docs/candidate-to-news-handoff.md`, `README.md`, and `scripts/validate-site.mjs` keep specialized docs conditional instead of mandatory for every ordinary run. |
| Day 19 | Complete | `3fcec5e` | Homepage deep briefing now renders a public `本期连续观察` strip from existing `edition.topicContinuity` and `edition.companyContinuity` fields only, showing up to two topic cards and two company cards with status, current change, and still-needed proof. `docs/news-data-format.md`, `docs/homepage-edition-preflight.md`, and `scripts/validate-site.mjs` guard the derived-only shape. |
| Day 20 | Complete | `155b54e` | Company continuity public cards now add a derived `怎么用` cue so repeated-company signals become reader-use checks: safety/regulatory, product/model, adoption evidence, research evidence, or archive background only. `docs/company-continuity-review-note.md`, `docs/news-data-format.md`, `docs/homepage-edition-preflight.md`, and `scripts/validate-site.mjs` guard the shape. |
| Day 21 | Complete | `d420585` | Topic continuity public cards now add a derived `怎么用` cue so recurring-topic signals become reader-use checks: enterprise adoption evidence, Agent-control proof, policy/data-boundary proof, infrastructure evidence, model-capability evidence, downgrade check, or archive background only. `docs/topic-continuity-review-note.md`, `docs/news-data-format.md`, `docs/homepage-edition-preflight.md`, and `scripts/validate-site.mjs` guard the shape. |
| Day 22 | Complete | `9fa747b` | Resolved or retired continuity checks now have a public display rule: old questions must be named as answered before the remaining smaller evidence gap, and homepage continuity cards can render `已回答后仍需看` instead of making stale uncertainty look current. `docs/next-check-retirement-note.md`, `docs/news-data-format.md`, `docs/homepage-edition-preflight.md`, `docs/current-to-history-publication-checklist.md`, `docs/topic-continuity-review-note.md`, `app.js`, `scripts/validate-data.mjs`, and `scripts/validate-site.mjs` guard the shape. |
| Day 23 | Complete | `98d50ec` | Company tag result rows now mirror all-news batch status: each OpenAI / Anthropic / Google / Meta history card shows `当前首页批次` for the latest homepage edition or `历史背景` with `只作公司脉络回看` for older editions. `docs/news-data-format.md`, `tags.js`, `styles.css`, and `scripts/validate-site.mjs` guard this latest-versus-background cue. |
| Day 24 | Complete | `d0b5aba` | `docs/monthly-continuity-snapshot.md` now has a `publicContinuityHandoff` shape that separates future public continuity component candidates into `ready`, `needs-current-edition`, `archive-only`, and `do-not-publish` groups, with `sourceFields`, `readerUse`, and `proofBoundary` required before any card can become public UI. `docs/news-data-format.md`, `docs/update-run-checklist.md`, and `scripts/validate-site.mjs` guard the handoff. |
| Day 25 | Complete | `e9d19de` | `scripts/validate-site.mjs` now treats the VisionHub briefing scorecard as a live homepage data guard: Today Briefing must stay compact and Chinese-readable, and each TOP3 item must expose concrete audience/use, source role, claim status, proof-boundary wording, and a next-check evidence path. `docs/visionhub-briefing-scorecard.md`, `docs/news-data-format.md`, and `docs/editorial-validator-limits.md` document the guard. |
| Day 26 | Complete | `661f72c` | `scripts/validate-data.mjs` now rejects repeated sentence leads inside `detailBody`, `detailTrend`, and `detailWhyRanked` for current items and latest promoted archive items. The current 2026-10-07 detail pages had four AWS trend paragraphs tightened so mobile readers do not see duplicate narrative copy. |
| Day 27 | Complete | `a6b7213` | `docs/editorial-validator-limits.md` now has a 2026-10-08 guard review for the Day 25 homepage scorecard guard and Day 26 detail narrative guard: expected false positives, accepted vocabulary-expansion cases, detail sentence-lead review rules, and human-review gaps that validators cannot replace. `scripts/validate-site.mjs` guards this note. |
| Day 28 | Complete | `fb662b4` | `scripts/validate-pages.mjs` now covers the six static reader-path shells (`index.html`, `news-detail.html`, `all-news.html`, `tags.html`, `archive.html`, `404.html`) instead of only 404: balanced tags, mobile viewport metadata, project-site-safe links, skip/main landmarks, and key dynamic containers. `docs/local-preview-qa.md` records this as the lightweight static fallback when Playwright/browser QA is unavailable, and `scripts/validate-site.mjs` guards the fallback. |
| Day 29 | Complete | `b84cc97` | `docs/monthly-optimization-summary.md` now summarizes the 2026-09-11 to 2026-10-10 cycle: VisionHub-style homepage briefing, TOP3 proof boundaries, detail-page article path, workflow friction, reader-visible continuity, validation guards, and remaining weaknesses around mobile density, visual briefing, manual source judgment, continuity views, and remote sync boundaries. |
| Day 30 | Complete | `eb7bcf7` | `docs/optimization-plan.md` now covers 2026-10-11 through 2026-11-09 and turns the monthly summary weaknesses into the next cycle: mobile first-screen relief, TOP3 visual briefing, detail-page article consistency, publishing-path and remote-sync simplification, reader-visible continuity, and the next rollover. |
| Day 0 | Complete | `62fd30c` | 手机首屏审计把第一轮 TOP3 判断前后分清：header 现在按 `今日重点` -> `今日 TOP3` -> `按目的阅读` -> `深度简报` -> `最新新闻流` 排序，Today Briefing 下方有 `手机先读` cue，`docs/homepage-edition-preflight.md` 和 `scripts/validate-site.mjs` 守住 before/TOP3/after 分层。 |
| Day 1 | Complete | `b54eea1` | 当前 `news-1700-2026-10-13` 首页把 `briefing.summary`、三个 watch points 和 `readerFrame.mobile` 改成同一条手机阅读路径：先查 Agent 能力证据，再查安全刹车，最后查短信/会议/职能 AI 入口权限；当前首页、最新历史镜像和今日派生数据已对齐。 |
| Day 2 | Complete | `f4dac40` | 首页更多新闻流上方现在先显示三格 `首屏信任速记`：来源角色、不要误读、下一步查；原来的范围、运行、编辑判断仍保留在 `完整运行与编辑记录` 折叠项里，`scripts/validate-site.mjs` 守住这个简短信任提示。 |

| Day 3 | Complete | `addd459` | 首页 TOP3、深度简报、连续观察与紧凑新闻流分组留白；深度简报入口增加阅读深度提示和直达新闻流链接。 |

## Historical Guard Anchors

These compact anchors keep validation and future automation aware of the most important completed workflow documents from recent cycles without repeating the full log.

- Previous cycle window: 2026-08-10 through 2026-09-08. Previous phase: Phase 5, Validation, QA, And Next Cycle. Historical handoff before rollover: Continue with Day 30. Current handoff is Day 2.
- Completed cycle window: 2026-09-11 through 2026-10-10. Completed phase: Phase 5, Validation, QA, And Next Cycle. Day 30 rollover created the 2026-10-11 through 2026-11-09 plan.
- Previous Day 27: `docs/vendor-narrative-promotion-rule.md` blocks vivid vendor narratives from TOP3 unless first-screen card copy names the independent proof path.
- Previous Day 28: `docs/vendor-narrative-promotion-rule.md` has a validator guard for source-role, first-screen field list, evidence-quality floor, stop conditions, and independent proof examples.
- Previous Day 30: `docs/optimization-plan.md` covered the 2026-08-10 through 2026-09-08 plan before this rollover.
- Day 0: `docs/homepage-edition-preflight.md` checks reader question, TOP3 use, source mix boundary, mobile scan path, proof boundary, and archive mirror.
- Day 1: `readerFrame.mobile` shortened the phone scan path; previous candidate-cycle Day 1 also kept `docs/candidate-priority-rubric.md` as the reader utility, evidence strength, novelty, source diversity, and copyright safety rubric.
- Day 2: `briefing.summary` and `deepBriefing.overview` start with reader decision, then separate source boundaries from AI Watchtower interpretation. Previous candidate-cycle Day 2: `docs/candidate-hold-reject-reasons.md` standardizes hold/reject reasons.
- Day 3: `coverageMix` keeps no more than one single-item bucket and no more than four scan cues.
- Day 4: `categories[].description` copy names only visible category anchors.
- Previous candidate-cycle Day 4: `docs/original-source-replacement-guide.md` explains when media reports should be replaced by official, filing, paper, regulator, or customer-side originals.
- Day 5: `editorialInterpretation` frames short batches as quality-gate results. Previous candidate-cycle Day 5: `docs/source-diversity-triage-note.md` checks owner, source-family, and narrative-angle concentration.
- Day 6: Omitted planned topics point only to archive, tag-page, historical, or already-selected related background. Previous candidate-cycle Day 6: `docs/candidate-workflow-plain-language-guide.md` keeps a plain-language Chinese workflow path before schema-heavy intake fields.
- | Day 7 | Complete | `02cd2b2` | `docs/candidate-intake-format.md` has an Intake Scratch Template for 08:00 and 17:00 JST runs. |
- Day 8: duplicate reporting distinguishes `repeated-url`, `near-title-review`, and `fresh-source-fact`.
- Day 9: source-of-record guidance assigns official pages, filings or regulator records, and research artifacts to their strongest fact roles. Previous publication-cycle Day 9: `docs/bad-data-rollback-note.md` names rollback files and validators.
- Day 10: `data/sources.json` uses Chinese editor-facing source-role language.
- Day 11: Common Owner Concentration Review covers TechCrunch, Axios, one vendor, and one research feed.
- | Day 12 | Complete | `9acbfc9` | `docs/held-candidate-review-note.md` records `holdUntilJst`, `recheckTrigger`, and `freshnessLimit`; previous publication-cycle `docs/partial-batch-publication-guide.md` defines one- or two-item safe batches. |
- Day 13: `docs/candidate-source-checklist.md`, `docs/candidate-intake-format.md`, and `docs/candidate-to-news-handoff.md` define the candidate workflow order. Previous archive-cycle Day 13: `docs/optimization-log-archive-guide.md` defines quarterly log archiving.
- Day 14: detail pages show the four-block fact, impact, boundary, and next-check briefing after the 30-second summary.
- Day 15: `detailTrend` keeps one trend meaning and moves reader action or upgrade proof into `readerUse`, `impact`, or `evidenceThreshold`.
- Day 16: media-backed detail pages show `完整事实入口`.
- Day 17: `evidenceThreshold` examples cover media signal, vendor claim, and research preprint upgrades.
- Day 18: `followUpQuestions` name source artifacts and observable checks.
- Day 19: `counterEvidence` distinguishes downgrade from narrow.
- Day 20: `provenance` labels name the exact source fact.
- Day 21: `docs/company-continuity-review-note.md` classifies recurring-company signals as stronger, weaker, repeated, or resolved.
- Day 22: `docs/topic-continuity-review-note.md` classifies recurring-topic signals as stronger, weaker, or repeated.
- Day 24: all-news and tag pages label historical background separately from the current homepage batch.
- Day 25: `docs/next-check-retirement-note.md` retires stale checks after later official, filing, audit, metric, regulator, customer-side, replication, or third-party evidence; `retire-resolved`, `retire-replaced`, `retire-downgraded`, and `keep-open` preserve the decision. Previous proof-cycle Day 25: `counterEvidence` should name an observable outcome when downgrade signals need more than another document.
- Day 26: `docs/source-concentration-archive-review-note.md` turns official/technical concentration, media concentration, and single-owner feeds into standing source-posture rules.
- Day 27: `docs/monthly-continuity-snapshot.md` summarizes repeated companies, repeated topics, unresolved claims, and resolved checks.
- Day 28: `docs/homepage-edition-preflight.md` keeps the First-Screen Reader Order Guard.
- Day 29: `docs/monthly-optimization-summary.md` records the remaining VisionHub-style weaknesses.
- Homepage order: `docs/homepage-edition-preflight.md` protects hero -> today briefing -> TOP3 -> purpose navigation -> deep briefing -> compact feed, and the current Day 0 audit keeps the visible header / `手机先读` cue aligned with that split.
- Detail article path: `docs/detail-page-review-guide.md` converts detail-page technical claims into fact, impact, boundary, and next-check blocks.
- Candidate source gate: `docs/candidate-source-checklist.md` gates semi-automated candidates by source identity, role, minimum evidence, copyright/paywall safety, duplicates, and concentration before drafting.
- Candidate priority: `docs/candidate-priority-rubric.md` ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
- Duplicate reporting: `scripts/report-duplicate-candidates.mjs` reports repeated candidate URLs and near-matching titles before drafting.
- Archive mirror: `docs/current-to-history-publication-checklist.md` keeps the newest history edition aligned with `data/news.json`, then requires the derived-data rebuild gate for `data/news-index.json` and `data/news-today.json`.
- Continuity review: `docs/company-continuity-review-note.md`, `docs/topic-continuity-review-note.md`, and `docs/monthly-continuity-snapshot.md` classify repeated signals without treating repetition as stronger proof.
- Vendor promotion: `docs/vendor-narrative-promotion-rule.md` blocks vendor narratives from TOP3 unless first-screen card copy names the independent proof path.
- Remote sync: `docs/remote-sync-log-convention.md` standardizes blocked-dns, blocked-auth, conflict, push, and pull wording.

## Current Cycle Day 5 Completion

- Complete: 首页按目的阅读改为“读懂影响 / 核对来源 / 查找往期”，分别对应深度简报、来源覆盖、全部新闻；分类说明交代四类速览和完整分类入口，不承诺目标页没有的搜索功能。
- Commit: see latest optimization log entry.

## Current Cycle Day 6 Completion

- Complete: 本地 Chrome 在 390px / 768px 检查首页；修正手机先读窄屏规则被通用规则覆盖的问题，390px 三步说明改为完整横行，768px 保留三列。两种宽度均无横向溢出或 JS 报错。
- Remaining friction: 本期 TOP3 顶部约在 2008px / 1458px，hero 与今日简报仍长；本次优先修正窄列断行，后续需继续压缩前置负担。
- Commit: see latest optimization log entry.

## Current Cycle Day 7 Completion

- Complete: TOP3 用共同侧线串起来源边界、尚未证明、下一步核验；直接展示既有 claimBoundary 和原文依赖。保留信号类别、读者用途与评分折叠，不新增新闻事实。
- Commit: see latest optimization log entry.

## Next Useful Task

- Current-cycle Day 8 complete: TOP3 uses the existing label as a bordered Chinese signal cue, separated from the date; category is not confidence. No additional evidence sentences or inferred classification.
- Current-cycle Day 9 complete: official vendor TOP3 cards distinguish confirmed publication facts from unproven outcomes; existing sourceRole is visible alongside source type. Current AWS Agent Registry and PKI cards retain their explicit claimBoundary and independent nextCheck.
- Current-cycle Day 10 complete: must-read TOP3 cards expose a direct original-source link and a compact full-facts/context reminder before score details. Historical media item opencode-security-2026-10-20 verified; current official-only TOP3 is unchanged.
- Current-cycle Day 11 complete: homepage preflight and data-format guidance map each visual cue to existing fields, preserve vendor publication/outcome boundaries and must-read links, and distinguish manual review from automated checks.
- Current-cycle Day 12 complete: `validate-site.mjs` runs real TOP3 rendering fixtures via `check-top3-cues.mjs` to guard vendor certainty, reported/disputed/unclear states, visible proof/next checks, category labels, missing boundaries, and must-read links.
- Current-cycle Day 13 complete: OpenCode media-backed historical detail page removes generic procurement language and repeated next checks; interpretation, trend and reader use focus on account records while reported/must-read and original facts stay unchanged.
- Current-cycle Day 14 complete: Dessa official-source detail page separates reader impact, voice-interaction trend and concrete third-party follow-up questions; original facts and vendor proof boundary remain unchanged.
- Current-cycle Day 15 complete: 通用详情页趋势标题精简为“可能带来的变化”，保留推断状态；详情页审读指南与数据规范要求正文直接解释变化，人工去除重复套语且保留条件与来源边界。
- Continue with Day 16: review detail-page opening and ending rhythm.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
