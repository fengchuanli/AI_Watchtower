# AI Watchtower 30-Day Optimization Plan

## 2026-11-17 to 2026-12-16: Calm, Verifiable Daily Briefing

The previous cycle established the mobile first-screen order, TOP3 evidence cues, short detail-page briefing voice, publishing-path guardrails, and reader-visible continuity. This cycle keeps those gains and turns the homepage into a more decisive daily reading surface: a Chinese reader should reach the ranked briefing quickly, understand what is confirmed versus still open, and choose whether to stop, read an item, or compare prior editions without meeting workflow language first.

The VisionHub-style briefing direction remains the priority. It means AI Watchtower's own calm, compact, evidence-conscious editorial design—not copied code, assets, copy, or branding. Every visible change must use existing verified data or clearly-labelled editorial UI; it must not turn a media source into a substitute article.

## Product Outcome

- A phone reader can move from the five-second daily takeaway to the ranked TOP3 in one clear action.
- TOP3 stays useful as a comparison surface: what happened, who should care, source role, what is not proved, and the next evidence path remain visible without score-detail hunting.
- Detail pages feel like short Chinese event briefings, with original sources still needed for full facts and context.
- Continuity and archives clarify what changed across editions, rather than making older questions look current.
- Editors can safely publish a small, well-framed edition without creating extra reading burden.

## Daily Rhythm

- 08:00 JST: morning news intelligence update.
- 17:00 JST: evening news intelligence update.
- 20:00 JST: one focused site optimization pass.

Before content, source framing, detail-page copy, continuity, or visual-briefing work, read `docs/product-principles.md` and `docs/copyright-safety.md`. Prefer a small reader-visible improvement over decorative work. Pull `origin/main` before editing when network access works; validate relevant scripts; log the visible result; commit and push only the audited local range.

## Phase 1: Make The First Decision Obvious (Day 0-5)

- Day 0: ✅ Make the five-second takeaway point directly to today’s TOP3, so the first action matches the mobile reading path.
- Day 1: Audit the hero, five-second takeaway, and Today Briefing at 390px; remove the smallest duplicate instruction that delays TOP3.
- Day 2: Make the Today Briefing CTA tell readers whether it opens ranked signals, a reader job, or deeper context; avoid ambiguous “查看” labels.
- Day 3: Review the first-screen source/trust cue and shorten one phrase that is process-heavy or repeats a later boundary.
- Day 4: Test a low-item edition (one or two signals) and ensure its first screen still feels intentional rather than empty or over-explained.
- Day 5: Run a mobile reading-path QA at 390px and 768px; fix the smallest visible tap, spacing, or hierarchy problem.

## Phase 2: Strengthen TOP3 Comparison (Day 6-11)

- Day 6: Audit whether each TOP3 card can be compared by reader job before the reader sees score details.
- Day 7: Refine one compact TOP3 label so source role, claim state, and outcome evidence cannot be confused.
- Day 8: Review a vendor-backed TOP3 card; make publication fact and unverified outcome visually distinct using existing fields only.
- Day 9: Review a media-backed TOP3 card; keep the original-source dependency prominent without turning the card into an external-link wall.
- Day 10: Improve the empty/no-TOP3 state so it explains the data condition without imitating a published briefing.
- Day 11: Add or refine the smallest rendering guard for the TOP3 comparison cue changed this phase.

## Phase 3: Detail Pages That Read Like Briefings (Day 12-17)

- Day 12: Audit one official-source detail page for opening rhythm: minimum fact before interpretation, without repeated claim labels.
- Day 13: Audit one media-backed detail page for source-substitution risk and original-source reminder placement.
- Day 14: Improve one mobile detail-page anchor or summary cue so readers can choose a section without scanning long prose.
- Day 15: Review end-of-article rhythm: reader impact, next check, and original source should not restate the same conclusion.
- Day 16: Tighten one dense paragraph pattern only when it makes a source boundary or practical use easier to scan.
- Day 17: Document the human-review gap for the new detail-page readability choice.

## Phase 4: Continuity And Archive As Reader Tools (Day 18-23)

- Day 18: Audit the homepage continuity disclosure on a multi-card edition; ensure its summary says whether each signal strengthened, repeated, weakened, or resolved.
- Day 19: Make one archive/continuity link label state what context it opens, not merely where it goes.
- Day 20: Review a resolved or retired check so old uncertainty cannot be read as a live warning.
- Day 21: Improve the archive route from a TOP3 or detail page with the smallest useful context cue.
- Day 22: Test the no-continuity state and remove any reader-facing promise it cannot fulfill.
- Day 23: Add a lightweight guard or preflight note for the continuity/archival cue changed this phase.

## Phase 5: Editorial Confidence And Next Cycle (Day 24-30)

- Day 24: Review the shortest safe way to frame an edition with only official sources, without treating source concentration as independent proof.
- Day 25: Review category navigation against actual reader jobs and improve one unclear transition.
- Day 26: Run homepage → TOP3 → detail → archive reader-path QA and fix one concrete confusion.
- Day 27: Audit keyboard focus, link wording, and mobile touch targets for the changed briefing controls.
- Day 28: Summarize this cycle’s reader-visible changes and remaining evidence/readability weaknesses.
- Day 29: Draft the next 30-day plan from the completed work and unresolved reader friction.
- Day 30: Publish the next plan in this file before beginning a new cycle.

## Rules For Each Optimization Run

- Choose the earliest useful unfinished VisionHub-style item that improves homepage structure, content expression, UI layout, mobile reading path, ranking cards, detail-page narrative, article readability, or visual briefing components.
- Use ordinary maintenance only when it directly supports that direction or no VisionHub-style item is available.
- Keep original sources as fact references, not the primary reading experience; keep `must-read` sources visibly necessary for full facts.
- Do not add private data, unsupported certainty, stale signals, copied source structure, or unverified claims.
- Update `docs/optimization-log.md` with JST date/time, focus, changed files, verification, commit hash if available, and a `网站可见变化` line. Documentation-only work must say `网站可见变化：无，属于规则/校验/计划更新`.
- Use `【VisionHub网站风格优化】` for reader-visible structure, visual, mobile, ranking, article, or continuity work; use `【网站优化】` only for non-visible maintenance. The VisionHub title takes priority when both apply.

## Historical Validation Anchors

The completed 2026-10-11 through 2026-11-09 cycle covered Mobile First-Screen Relief, TOP3 Visual Briefing, Detail-Page Article Consistency, Publishing Path And Remote Sync, and Reader-Visible Continuity And Next Cycle. Its remote-sync vocabulary included local-ahead, blocked DNS, approval-required push. Keep this record so validation retains the previous-cycle contract: create the next 30-day plan and Do not stop daily optimization when a cycle closes.

Before any content expansion, Preserve the balance: make AI news understandable through original analysis while keeping copyright, source, duplicate, or vendor-claim boundaries. Apply this to the candidate workflow, or future optimization plans as well as published content.

For commit titles, `【VisionHub网站风格优化】` has priority over `【网站优化】` whenever a change is reader-visible. The optimization log must always include `网站可见变化`.
