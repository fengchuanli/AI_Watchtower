# AI Watchtower Recent Decision Index

This index is a short companion to `docs/optimization-log.md`. It helps daily optimization runs find the latest relevant decision without scanning the full log first. Keep it concise: update only the most recent plan-day completions, current blockers, and the next useful task.

## Current Plan Window

- Plan: `docs/optimization-plan.md`
- Window: 2026-09-11 through 2026-10-10
- Current phase: Phase 1, Homepage Briefing Clarity
- Last indexed run: 2026-09-12 20:00 JST
- Network status: Latest 20:00 run pulled `origin/main` successfully after network authorization; local `main` remained ahead of `origin/main` before this run.

## Recent Plan-Day Decisions

| Plan day | Status | Latest local commit | Decision shortcut |
| --- | --- | --- | --- |
| Previous Day 28 | Complete | `829b83e` | `docs/homepage-edition-preflight.md` has a First-Screen Reader Order Guard, and `scripts/validate-site.mjs` enforces hero -> today briefing -> TOP3 -> deep briefing -> compact feed plus data-backed today/TOP3/feed hooks. |
| Previous Day 29 | Complete | `5a0ae94` | `docs/monthly-optimization-summary.md` summarizes the 2026-08-10 to 2026-09-08 cycle's homepage, detail-page, candidate workflow, continuity, validation, and remaining VisionHub-style weaknesses. |
| Previous Day 30 | Complete | `166baeb` | `docs/optimization-plan.md` now covers 2026-09-11 through 2026-10-10 and puts VisionHub-style briefing polish, mobile reading, article readability, update workflow friction, and reader-visible continuity first. |
| Day 0 | Complete | `166baeb` | `docs/visionhub-briefing-scorecard.md` gives homepage/detail edits a pass/partial/fail check for five-second understanding, TOP3 reader use, source boundary, original-source dependency, mobile burden, continuity use, and visual-aid purpose. |
| Day 1 | Complete | `3f6416b` | Current `data/news.json` and mirrored current history/today data now make the homepage hero/today/mobile path start with three reader questions: bottom-layer platform change, safety source files, and government/enterprise adoption evidence. |

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

- Continue with Day 2: tighten TOP3 card hierarchy so each promoted item shows title, minimum fact, why now, reader use, source role, and next-check boundary without duplicating detail-page paragraphs.
- Before choosing work, still read the latest entries at the top of `docs/optimization-log.md` in case another automation completed Day 1 first.
- If Day 1 is already complete, continue with the first useful unfinished task from the current plan.

## Update Rules

- Add only decisions that help a future run avoid duplicate work.
- Keep commit hashes short and link the full details through `docs/optimization-log.md` rather than repeating the log.
- When a plan phase rolls over, keep the latest completed phase and the next two useful tasks visible.
- Record recurring blockers only when they change what the next run should do.
