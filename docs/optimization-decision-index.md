# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-09-11 through 2026-10-10
- Current phase: Phase 3, News Update Workflow Friction
- Last indexed run: 2026-09-24 20:00 JST
- Network status: Latest 20:00 run first hit sandbox GitHub DNS failure, then pulled `origin/main` successfully after network authorization; push status is recorded in `docs/optimization-log.md`.

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

## Historical Guard Anchors

These compact anchors keep validation and future automation aware of the most important completed workflow documents from recent cycles without repeating the full log.

- Previous cycle window: 2026-08-10 through 2026-09-08. Previous phase: Phase 5, Validation, QA, And Next Cycle. Historical handoff before rollover: Continue with Day 30. Current handoff is Day 1.
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
- Homepage order: `docs/homepage-edition-preflight.md` protects hero -> today briefing -> TOP3 -> deep briefing -> compact feed.
- Detail article path: `docs/detail-page-review-guide.md` converts detail-page technical claims into fact, impact, boundary, and next-check blocks.
- Candidate source gate: `docs/candidate-source-checklist.md` gates semi-automated candidates by source identity, role, minimum evidence, copyright/paywall safety, duplicates, and concentration before drafting.
- Candidate priority: `docs/candidate-priority-rubric.md` ranks safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
- Duplicate reporting: `scripts/report-duplicate-candidates.mjs` reports repeated candidate URLs and near-matching titles before drafting.
- Archive mirror: `docs/current-to-history-publication-checklist.md` keeps the newest history edition aligned with `data/news.json`.
- Continuity review: `docs/company-continuity-review-note.md`, `docs/topic-continuity-review-note.md`, and `docs/monthly-continuity-snapshot.md` classify repeated signals without treating repetition as stronger proof.
- Vendor promotion: `docs/vendor-narrative-promotion-rule.md` blocks vendor narratives from TOP3 unless first-screen card copy names the independent proof path.
- Remote sync: `docs/remote-sync-log-convention.md` standardizes blocked-dns, blocked-auth, conflict, push, and pull wording.

## Next Useful Task

- Continue with Day 14: add or refine a pre-publication checklist step for regenerating and validating `data/news-index.json` and `data/news-today.json` after current/history changes.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation already completed Day 12.
- If Day 12 is already complete, continue with the first useful unfinished task from the current plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
