# AI Watchtower 30-Day Optimization Plan

This plan guides daily AI Watchtower optimization work from 2026-06-24 through 2026-07-23. It follows the 2026-06-24 monthly summary: the next cycle should make routine news updates easier, more reliable, and more readable without weakening copyright, source, duplicate, or vendor-claim boundaries.

Each automated optimization pass should complete one small, verifiable improvement from the current phase, update `docs/optimization-log.md`, commit with a Chinese message, and push to `origin main` when network access allows.

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

## Phase 1: Candidate Intake And Editorial Triage

- Day 0: Define a lightweight candidate-intake record so future semi-automated gathering captures source fact, source role, AI relevance, proof boundary, duplicate status, and drafting decision before writing news copy.
- Day 1: Add a candidate priority rubric that ranks candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety.
- Day 2: Add a hold/reject reason vocabulary for candidates that should not become current news, including stale, duplicated, paywalled, source-role unclear, AI relevance weak, and proof boundary missing.
- Day 3: Add a simple candidate-to-news handoff checklist that maps intake fields to `data/news.json` fields without duplicating source article text.
- Day 4: Add guidance for when a media report should be replaced by an original official, filing, paper, or regulator source before publication.
- Day 5: Add a source-diversity triage note for batches with too many candidates from one owner, one source family, or one narrative angle.
- Day 6: Review the candidate workflow for Chinese readability so non-technical editors can apply it without learning internal schema jargon.

## Phase 2: Update Workflow And Archive Reliability

- Day 7: Add an update-run checklist that separates source discovery, candidate intake, duplicate reporting, drafting, validation, commit, and push status.
- Day 8: Add a current-to-history publication checklist so the latest archived edition cannot drift from the homepage edition.
- Day 9: Add a rollback note for bad data updates, naming which files to inspect and which validators to rerun before re-publishing.
- Day 10: Add a remote-sync status convention for optimization logs when GitHub pull or push fails.
- Day 11: Add a compact archive-diff summary format for what changed between morning and evening editions.
- Day 12: Add guidance for handling partial news batches when only one or two reliable candidates pass the intake gate.
- Day 13: Review the growing optimization log and decide whether older entries need a quarterly archive document.

## Phase 3: Reader-First Homepage Content

- Day 14: Tighten homepage briefing language so it names the reader decision first and source caveat second.
- Day 15: Add a shorter mobile-oriented variant for edition reader frames when the current Chinese copy becomes dense.
- Day 16: Review coverage-mix labels and make each one answer "what should I check now?"
- Day 17: Improve omitted-topic explanations so they distinguish "no new source fact" from "not important."
- Day 18: Add an edition-level "do not overread this batch" note when all current items share the same evidence mode.
- Day 19: Review category labels and descriptions against the current item set, removing stale or overly broad wording.
- Day 20: Add a homepage copy audit that catches repeated caveat sentences across reader frame, source risk, and trend notes.

## Phase 4: Detail Briefing And Continuity

- Day 21: Add a detail-page review guide for converting technical claims into fact, impact, boundary, and next-check blocks.
- Day 22: Add continuity notes for recurring companies that say what changed since the last mention and what stayed unproven.
- Day 23: Add continuity notes for recurring topics that say whether the signal is stronger, weaker, or merely repeated.
- Day 24: Improve detail-page source reminders for media-sourced items so complete facts remain clearly assigned to the original article.
- Day 25: Add guidance for when `counterEvidence` should mention a concrete observable outcome rather than another document.
- Day 26: Review promoted-item `whoShouldCare` copy for concrete Chinese reader groups rather than generic "industry observers."
- Day 27: Add an editorial rule for not promoting vivid vendor narratives unless independent proof is named in the first-screen card copy.

## Phase 5: Validation, QA, And Next Cycle

- Day 28: Add or refine a lightweight validation guard for whichever new workflow document became most important during this cycle.
- Day 29: Summarize what improved during this 30-day cycle and list remaining weaknesses.
- Day 30: Write the next 30-day optimization plan, keeping completed work as historical context.

## Rules For Each Optimization Run

- Pull the latest `main` before editing when network access works.
- Read `docs/product-principles.md` first and keep every improvement aligned with the product purpose.
- Read `docs/copyright-safety.md` before changing news content, source policy, detail-page copy, candidate workflow, or future optimization plans.
- Follow this plan in order unless a user request overrides it.
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
