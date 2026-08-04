# News Data Format

Homepage news items live in `data/news.json`. 首页优先读取 `summary` and `whyItMatters`; the detail page can use longer detail fields after the reader chooses to open an item. Captured historical items live in `data/news-history.json`. This keeps editorial content separate from page behavior and prepares the site for future RSS or API ingestion.

Each future news-intelligence run should aim for at least 10 qualified `items` so the homepage news flow has enough non-TOP3 stories to scan. This is a target, not permission to lower quality: duplicate, paywall/login-wall, unclear-source, weak-proof, or copyright-risk candidates must still be skipped. If a run publishes fewer than 10 safe items, record the reason in the edition metadata and optimization log. When only one or two reliable candidates remain, use `docs/partial-batch-publication-guide.md` before drafting so the run explicitly chooses to publish a partial batch, continue searching, or hold the update.

Before committing a news publication, use `docs/current-to-history-publication-checklist.md` to mirror the current homepage edition into the newest `data/news-history.json` edition. The latest archive entry is part of the publication surface, not an optional backup copy. For 17:00 JST runs with a same-day morning edition, use `docs/archive-diff-summary-format.md` to summarize what changed between the two batches without adding new claims. If validation or source review shows that current or history data is wrong, use `docs/bad-data-rollback-note.md` to restore trustworthy data before republishing.

Homepage `今日 TOP3` is a daily ranking. The page may combine the current `data/news.json` edition with same-date editions in `data/news-history.json`, then rank the best three by editorial score, reader utility, impact, evidence quality, narrative strength, and freshness. The current feed itself should stay sorted newest-first for the news flow; TOP3 selection should not be confused with current-batch order.

All item fields must follow `docs/copyright-safety.md`. The data model should help readers understand the news, but it must not turn source articles into full Chinese replacements. Use source fields for minimum necessary facts, and use editorial fields for AI Watchtower's own interpretation, trend reading, reader use, and verification boundary.

Before a semi-automated gathering run drafts item fields, use `docs/candidate-source-checklist.md` to confirm the candidate URL, source identity, source role, duplicate status, freshness posture, copyright/paywall safety, and source-owner concentration risk. Only candidates that pass that gate should be turned into the structured fields below.

## Feed Metadata

- `sourceCount`: Number of registered sources available to the current homepage. It must match `data/sources.json` `sources.length` so the hero stats do not drift from the source registry.

## Edition Fields

The required top-level `edition` object gives each homepage snapshot a stable archive identity. Update it whenever the feed advances to a new editorial date.

- `id`: Stable lowercase archive key ending in an ISO date, such as `sample-2026-06-12`.
- `date`: Editorial date in `YYYY-MM-DD` format; must match top-level `updatedAt`.
- `timezone`: IANA timezone used to interpret the edition date, such as `Asia/Tokyo`.
- `archiveStatus`: `preview` for sample or incomplete snapshots, or `published` for a reviewed edition.
- `archiveLabel`: Short Chinese status label shown in the homepage feed metadata.
- `note`: Short Chinese scope note explaining what the archived edition represents. Keep it under 80 characters; do not mix operational status or editorial interpretation into this field.
- `operationalStatus`: Chinese retrieval and source-check status for this batch, such as pull/network outcome and whether official/source indexes were checked.
- `editorialInterpretation`: Chinese editorial reading of why this batch was selected and which evidence boundary still applies. Keep this as AI Watchtower's interpretation, not a source-article replacement.
- Metadata readability: Keep top-level `editorNote`, `operationalStatus`, `editorialInterpretation`, and `sourceRisk` responsible for different jobs. Do not repeat the same pull status, media-boundary caveat, or next-check sentence across multiple fields; the homepage metadata line should read as short labels, not as a paragraph. The validator also audits normalized caveat sentences across `readerFrame`, `sourceRisk`, and `trendNotes`, so each section must add a distinct reader orientation, source-risk warning, or cross-edition proof boundary instead of pasting the same caution.
- `readerFrame`: Required Chinese object explaining how readers should use this edition. Include `headline`, `whyItMatters`, at least two `useThisIssueFor` bullets naming concrete readers or teams, and at least two `notProvenYet` bullets stating what the batch still does not prove. Include a shorter `mobile` object with `headline`, `summary`, two or three compact `primaryUses`, and one `proofBoundary` so dense editions still give phone readers a quick scan path. Keep it focused on reader orientation, not new unsupported claims.
- `changeSummary`: Required Chinese object explaining what changed since the previous batch. Include `headline`, at least two `freshFacts` bullets written as this batch's new source facts, and at least two `repeatedContext` bullets naming background or older storylines that should not be mistaken for new facts.
- `overreadBoundary`: Required when one evidence mode or source family supplies at least two thirds of the current batch. Include `label`, `body`, `doNotConclude`, and `useInstead`. Use it for edition-level "do not overread this batch" copy: say the batch is a radar or checklist, state which conclusion readers must not draw, and name the official, original, filing, contract, dataset, benchmark, or third-party evidence to check next.
- `coverageMix`: At least two objects with `label`, positive integer `count`, and Chinese `meaning`. The counts must add up to the current `items.length`. Each label should be an action-oriented scan cue that answers "what should I check now?", such as `查健康与模型入口`, `核对政策与安全边界`, or `验证资本与算力证据`; avoid passive topic-only labels. Each meaning should name the reader action that signal group supports, such as updating a policy watchlist, checking engineering dependencies, adjusting a product dashboard, or verifying a source list.
- `sourceRisk`: Compact Chinese source-concentration note with `label`, `note`, and `nextCheck`. Use it when a batch is dominated by one source family, one vendor, or one evidence mode; the note should tell readers whether the batch is a radar signal or confirmed evidence, and `nextCheck` should name the independent official, original, filing, or policy source needed next.
- `sourceConcentration`: Required when one registered `sourceId` supplies at least two thirds of the current batch. Include `sourceId`, `sourceName`, `count`, `share`, `note`, and `nextCheck`. Use it to name repeated source-owner concentration separately from source-family concentration, so readers can distinguish “all research sources” from “all items came from the same feed or owner.” `count` and `share` must match current items, `sourceName` must match `data/sources.json`, and `nextCheck` should name the independent owner or source type to check next.
- `trendNotes`: At least two compact cross-edition trend notes with `topic`, `label`, `note`, and `boundary`. Use them to connect recurring companies or topics across the current and archived editions without building a heavy trend database. Each `note` should explicitly frame the signal as cross-edition, recurring, continuous, or historical context; each `boundary` must say what the pattern still does not prove and name the official, original, third-party, audit, regulatory, data, metric, or replication evidence needed next.
- `topicContinuity`: At least two compact current-edition notes for recurring topics. Each object needs `topic`, `label`, `status`, `previousPattern`, `currentSignal`, `signalDirection`, and `stillUnproven`. `topic` must match a current `topicGroups[].id`, and `status` must be `stronger`, `weaker`, or `repeated`. Use this to tell readers whether a recurring theme has stronger evidence, weaker evidence, or is merely repeating; do not introduce new source facts beyond current and archived edition context. `stillUnproven` must name the official, original, filing, contract, log, audit, metric, regulator, data, report, or third-party proof needed next.
- `companyContinuity`: At least two compact current-edition company notes for recurring companies. Each object needs `company`, `label`, `lastMention`, `whatChanged`, and `stillUnproven`. Use this for company-level continuity only when the company appears in current `items[].companies`; `lastMention` should name the previous or historical context, `whatChanged` should state what this edition adds, and `stillUnproven` must say what remains unproven while naming the official, original, filing, contract, log, audit, metric, regulator, data, or third-party proof needed next. Do not use this field to introduce new source facts.
- `sourceFamilies`: One object for each source tier used by current `items`, with `family`, `label`, positive integer `count`, and Chinese `role`. Counts must match item `sourceId` entries through `data/sources.json` `trustLevel`; use this to explain whether a batch relies on official sources, research originals, reliable media, or community signals.
- `topicGroups`: One or more topic discovery groups for the current `items`, with `id`, `label`, positive integer `count`, `itemIds`, and Chinese `meaning`. Supported IDs are `agent`, `model`, `enterprise`, `policy`, `infrastructure`, and `developer-tooling`; each `itemIds` value must reference a current news item, and `count` must match `itemIds.length`. Each meaning should be action-oriented rather than a passive topic label, for example "用来更新...", "用来检查...", or "用来调整...".

Homepage topic groups also render planned-topic why-now summaries and omission boundaries for supported topics. Each supported topic should have a compact `whyNow` framing line explaining why Agent, model, enterprise, policy, infrastructure, or developer-tooling signals matter in the current AI cycle. Each omitted topic should include an explicit omission status such as `无新来源事实`, a short reason, a `omissionBoundary` line that says the omission does not mean the topic is unimportant, the evidence that would make it promotable, and where readers can look instead. Keep this wording editorial and source-boundary focused; do not use topic context or omitted-topic copy to introduce new factual claims.

## Briefing Fields

The optional top-level `briefing` object powers the homepage Today Briefing section. Use it to summarize how readers should interpret the current feed, not to introduce unsupported claims.

- `label`: Short Chinese label shown above the briefing headline.
- `headline`: Chinese editorial headline for the daily briefing.
- `summary`: Chinese paragraph that frames the current feed and verification posture.
- `cta`: Short link text pointing readers toward the feed.
- `watchPoints`: Exactly three Chinese observation objects, each with `title` and `body`.

## Deep Briefing Fields

The required top-level `deepBriefing` object powers the homepage long-form explanation section. It should make the news understandable inside AI Watchtower, using original links only as references.

- `kicker`: Short Chinese-first section label; keep English only when it is a product or source name readers need to recognize.
- `title`: Chinese briefing title.
- `subtitle`: Chinese one-paragraph summary of the briefing angle.
- `dateLabel`: Human-readable date label.
- `status`: Publication or verification status.
- `overview`: Chinese overview explaining the whole briefing.
- `timeline`: At least three objects with `label`, `title`, and `body`.
- `keyNumbers`: At least three metric objects with `value` and `label`.
- `sections`: At least three explainer sections with `number`, `label`, `title`, `body`, and `soWhat`.
- `actions`: Reader actions or takeaways.
- `coverageLimits`: At least two objects with `label` and `body` that state the edition's time, source, or conclusion boundaries so readers do not treat a snapshot as complete market coverage.
- `sourceFrame`: Required object that separates what sources directly support from AI Watchtower's interpretation. It needs `sourceFacts`, `editorialJudgment`, and `unknowns`; each array should contain at least two Chinese statements.
- `references`: Source references retained for verification rather than primary navigation. Each reference needs `label` and an `http` or `https` `url`; the homepage opens these links in a new window with an explicit accessible label. Reference labels must name the source or source family and the specific source fact it supports, such as "Guardian 报道 Europe 2031 与欧洲 AI 主权讨论"; avoid vague labels like "Guardian", "source link", or "original article".

Deep-briefing visible labels should be Chinese-first. Avoid unexplained structural English such as `Intelligence Briefing`, `Health AI`, `Medical Research`, `Enterprise Ops`, `So What?`, `checklist`, or `FinOps` in reader-facing copy when a clear Chinese label works. Product names, model names, API names, and source titles may remain in English when that is the actual name readers need to recognize.

## Category Fields

The top-level `categories` array defines the editorial boundary of every homepage filter. Keep one definition for each supported category so the page can explain what is included instead of relying on a short label alone.

- `id`: Stable category code matching item `category` and the homepage filter.
- `label`: Chinese label shared by the filter and every item in that category.
- `description`: Concise Chinese scope note covering what belongs in the category and any important evidence caveat. Review these descriptions against the current item set during content-quality passes: each one should explain the reader use of the filter, name a current-batch angle with words such as `本期` or `当前`, and include a proof-boundary cue such as `需验证`, `仍需确认`, `不直接证明`, or `等待复现`.

## History Fields

`data/news-history.json` keeps every captured edition visible after the homepage advances to a newer batch. Current homepage items should represent fresh source facts, not old archive items resurfaced as new coverage.

- `version`: History schema version.
- `updatedAt`: Latest history update date.
- `totalItems`: Total captured item count across all editions.
- `editions`: Newest-first array of captured batches. A source URL may appear only once across history; repeated source URLs should be skipped instead of re-captured. Near-duplicate titles are also rejected after normalization so the archive does not republish the same event with slightly different wording unless the source facts are clearly distinct.
- `editions[].id`: Edition ID matching `data/news.json` when the edition is current.
- `editions[].date`: Capture or editorial date.
- `editions[].timezone`: IANA timezone for the capture batch.
- `editions[].archiveLabel`: Human-readable batch label, such as `17:00 JST 发布`.
- `editions[].note`, `editions[].operationalStatus`, and `editions[].editorialInterpretation`: Copy of the current edition's short scope, operational status, and editorial reading, so archive readers can distinguish running state from editorial judgment.
- `editions[].readerFrame`: Copy of the latest current edition's reader frame, so archive readers retain the same use case and proof-boundary context after the homepage advances.
- `editions[].changeSummary`: Copy of the latest current edition's change summary, so archive readers can distinguish fresh facts from repeated background after the homepage advances.
- `editions[].overreadBoundary`: Copy of the latest current edition's edition-level overread boundary when the current batch has one dominant evidence mode or source family, so archive readers do not treat the snapshot as full-market coverage.
- `editions[].trendNotes`: Copy of the latest current edition's cross-edition trend notes, so archive readers can see recurring topic context without treating it as a new source fact.
- `editions[].topicContinuity`: Copy of the latest current edition's recurring-topic continuity notes, including whether each topic signal is stronger, weaker, or repeated, so archive readers keep the same evidence-strength framing.
- `editions[].sourceConcentration`: Copy of the latest current edition's source-owner concentration note when a dominant `sourceId` exists, so archive readers retain the same source-diversity caveat after the homepage advances.
- `editions[].itemCount`: Number of items in the batch; must match `items.length`.
- `editions[].items`: Full item objects using the same required fields as the current feed.

The latest history edition is the archive-ready copy of the current homepage edition. Before publication, keep the newest `data/news-history.json` edition aligned with `data/news.json` for the edition ID, date, timezone, archive status, archive label, note, operational status, editorial interpretation, reader frame, change summary, overread boundary, coverage mix, source families, source risk, source concentration, trend notes, topic continuity, company continuity, topic groups, item count, and item order. If any of those fields differ, update the history snapshot or advance the homepage edition deliberately; do not let archive readers see a stale framing of the current batch.

When both 08:00 JST and 17:00 JST editions exist for the same date, the archive-diff summary should compare adjacent same-day editions only. Keep the comparison to new signals, source posture, topic movement, and proof-boundary change already present in the structured data. Do not use the diff to introduce fresh facts, long source summaries, or broader trend claims beyond the two editions.

The all-news history page derives its category filters from historical item `category` and `label` values, then lets readers switch between newest-first and oldest-first batch order. Keep historical categories stable and labels readable so older coverage remains discoverable without using original source links as the primary reading path.

Company tag pages derive OpenAI, Anthropic, Google, and Meta views from historical `sourceId`, `source`, and `sourceUrl` fields. Each tag context should show the latest matched signal, the last-seen edition date, and a source caveat derived from `claimBoundary`, `provenance`, or `nextCheck`, so company pages remain a tracking aid rather than a new source of unverified claims.

The current feed must not promote stale background material as a new batch. Keep `publishedAt` within seven days of `updatedAt`. If an older event deserves renewed current-feed treatment because a source published a concrete new fact, keep the old event date in `publishedAt` and add `freshSourceFact` with `sourceType`, `sourceUrl`, `publishedAt`, and `fact`. The validator accepts this exception only when the fresh source fact is inside the seven-day freshness window, `freshSourceFact.sourceType` matches the item's `sourceType`, and the `fact` names a concrete new source action such as a publication, announcement, filing, disclosure, revision, or response. Media-based exceptions must keep `originalDependency: "must-read"`; community-signal exceptions must name the non-community source needed for confirmation. If an older archive item already uses the same normalized source URL or a near-duplicate title, reuse the archive for background context instead of re-publishing the item as current news.

## Required Fields

- `id`: Stable unique item ID.
- `category`: One of `model`, `product`, `research`, `tool`, `funding`, or `policy` for the current homepage filters.
- `label`: Chinese category label shown on the card.
- `title`: Chinese headline.
- `body`: Short Chinese summary for homepage cards. Keep it focused on what happened.
- `summary`: Preferred one-sentence homepage news content. Keep it to 1-2 mobile lines. During migration, `body` remains the fallback.
- `whyItMatters`: Preferred one-sentence reader-facing reason this item matters. During migration, `impact`, `trend`, or `whyRanked` remain fallbacks.
- `detailBody`: Source-supported event explanation for the detail page. It must add context beyond `body`, but for media sources it should remain a minimum-fact summary rather than a replacement for the original article.
- `trend`: Chinese editorial interpretation that links the item to a broader observable trend without adding unverified facts.
- `detailTrend`: Longer Chinese trend explanation for the detail page. It should be AI Watchtower's own interpretation, not a rewritten version of the source article.
- `whyRanked`: Short Chinese explanation for why the item deserves homepage attention or ranking priority.
- `topReason`: Preferred concise explanation for why the item entered Today TOP3. Keep it behind the expandable editorial judgment area on the homepage.
- `detailWhyRanked`: Longer Chinese detail-page explanation of why the item matters. It should preserve important source facts, boundaries, and caveats that are too long for the homepage card.
- `selectionScore`: Object with integer 1-5 scores for `impact`, `novelty`, `narrativeStrength`, `evidenceQuality`, and `readerUtility`, plus a matching `total` and Chinese `note` explaining the editorial tradeoff.
- `editorScore`: Preferred alias for `selectionScore` when future ingestion separates editorial scoring from source facts.
- `impact`: Short editorial line explaining why the item matters or what to watch next.
- `whoShouldCare`: Required for promoted current items and the latest archived snapshot. Write one Chinese sentence naming concrete Chinese reader groups and the work setting that makes the item relevant, before `readerUse` explains how to use the signal. Prefer phrases such as "要把合同、表单、票据交给 Agent 处理的数据/法务/审计团队" or "负责语音助手、桌面 Agent、实时会议协作和平台可靠性排障的产品/工程团队"; avoid generic audience labels such as "industry observers", "行业观察者", "相关团队", "AI 从业者", or a bare list of departments with no scenario.
- `readerUse`: Short Chinese line naming who should use the signal and what decision or checklist it informs.
- `nextCheck`: Short editorial note stating what should be verified before treating the item as fully confirmed. For `sourceRole: "厂商主张"`, this field itself must name the independent evidence needed next, such as customer-side metrics, third-party benchmarks, papers, regulator text, audit material, contracts, filings, original data, or external expert review; do not leave that proof path only in `evidenceThreshold`.
- `followUpQuestions`: At least two concrete Chinese questions ending in `？` that guide the next editorial update or source check.
- `evidenceThreshold`: Concrete minimum evidence required before the observation can be upgraded to a confirmed editorial judgment. Name the source artifact or proof type needed, and say what verified editorial status it would unlock, such as moving from a media signal to a confirmed organization change, fact conclusion, verified policy, or validated deployment. Avoid vague phrases such as "more evidence".
- `claimBoundary`: Short Chinese caution stating what the current item does not prove, so readers do not overread a signal beyond its available evidence.
- `counterEvidence`: Short Chinese condition explaining what later evidence would weaken, downgrade, or narrow the current editorial judgment. For promoted current items and the latest archived snapshot, use `docs/counter-evidence-observable-guide.md` to decide whether the field should name a source artifact or a concrete observable outcome. Prefer observable outcomes when the claim is about adoption, deployment, safety, performance, cost, or policy effect; examples include access logs, approval records, adoption metrics, third-party retests, product delivery status, customer-side task results, error rates, latency/cost records, audit findings, regulator enforcement, or user impact. Use documents such as policy text, official announcements, filings, contracts, papers, model cards, system cards, or role confirmations when the downgrade depends on whether a stated fact exists. Avoid vague phrasing like "更多证据".
- `source`: Human-readable source group.
- `sourceName`: Preferred human-readable source name for cards and detail pages. During migration, `source` remains the fallback.
- `sourceId`: Must match an entry in `data/sources.json`.
- `sourceUrl`: Original source or source-group URL.
- `originalUrl`: Preferred original source URL. During migration, `sourceUrl` remains the fallback.
- `sourceRole`: Controlled Chinese label describing what the linked source can support: `官方核对`, `研究原文`, `媒体背景`, `社区发现`, or `厂商主张`.
- `provenance`: How readers should interpret the source and claim quality. For media sources, it should remind readers that full facts, quotes, charts, interviews, and context belong in the original source.
- `trustLevel`: Visible source-tier label such as official, media, research, or community. It describes the source type, not whether the item claim has been verified.
- `verificationStatus`: Claim-level review status. Use `结构样例，未作事实核验` for sample cards and reserve `已核验` for items whose central claim has been checked against the cited source.
- `originalDependency`: Planned copyright-safety field. Use `must-read`, `recommended`, or `optional`; media sources should default to `must-read` so readers know the original article remains necessary for full facts.
- `sourceType`: Planned structured source field. Use `official`, `research`, `regulator`, `reliable_media`, `media_report`, or `community_signal`.
- `sourceReliability`: Planned structured source reliability field. Use `high`, `medium`, `low`, or `unknown`.
- `claimStatus`: Planned structured claim status field. Use `confirmed`, `reported`, `rumored`, `disputed`, or `unclear`.
- `publishedAt`: ISO-like timestamp with timezone.
- `freshSourceFact`: Optional stale-news exception object for current-feed items whose event `publishedAt` is older than seven days. Use only when a fresh source-specific fact makes the older event newly relevant; include `sourceType`, `sourceUrl`, `publishedAt`, and `fact`, and keep the object tied to the same source tier as the item.
- `time`: Short display time.

The detail page derives a source-boundary panel from existing item fields rather than adding a separate claim layer. `provenance` is shown as what the linked source can directly support, `detailTrend` is shown as AI Watchtower's interpretation, and `claimBoundary` is shown as what the item still cannot prove. Keep these fields written so a reader can distinguish source-backed facts from editorial judgment without leaving the page.

For media-sourced detail pages, the top and bottom source reminders must explicitly assign complete facts to the original article. Keep `sourceRole: "媒体背景"`, `sourceType: "reliable_media"` or `media_report`, `claimStatus: "reported"`, and `originalDependency: "must-read"`. The page reminder should say AI Watchtower keeps only the minimum fact and original Chinese interpretation, while full facts, quotes, interviews, charts, data, and context remain in the named source article.

Detail pages also render a canonical four-block briefing from existing item fields: `detailBody` as the minimum source-supported fact, `impact` as the reader-facing impact judgment, `claimBoundary` as the proof boundary, and `nextCheck` as the next verification step. Keep these four fields independently readable because they are the fastest path for mobile readers who need facts, impact, boundary, and next action before deciding whether to continue into the full explanation.

On mobile detail pages, primary explanation must stay ahead of secondary context. The page should render fact, AI Watchtower interpretation, trend meaning, and next-check sections before the source/editor context block; source provenance, evidence thresholds, downgrade signals, original-source links, and editor scores belong after that primary explanation so readers first understand the item before handling verification detail.

Current and latest archived promoted items should keep each `detailBody`, `detailTrend`, and `detailWhyRanked` paragraph under 180 Chinese characters. If a detail-page explanation needs more room, split the idea across fields or move secondary context into verification notes, so mobile readers do not meet a single dense block before they can judge the item.

For VisionHub-style narrative events, source role matters more than story appeal. Use `厂商主张` for company-written policy proposals, customer stories, benchmark narratives, or other vendor-framed pages unless the linked page directly verifies a stronger category such as an official release fact, research original, or regulator action. A `厂商主张` item may be marked `已核验` only for the narrow fact that the vendor made the claim or proposal; `provenance`, `claimBoundary`, `nextCheck`, `evidenceThreshold`, and `counterEvidence` must name the missing external proof so readers do not mistake a vivid narrative for independent confirmation. The validator now checks `nextCheck` separately for this independent evidence path because it is the first follow-up cue readers see on cards and detail pages.

Promoted items, including the current `今日 TOP3` and the latest archived snapshot, must be able to support a full in-site incident briefing before publication. The validator treats promotion as a combined contract: each promoted item needs event explanation, trend meaning, ranking value, reader impact, reader use, next checks, evidence threshold, claim boundary, downgrade signal, source role, provenance, verification status, at least two follow-up questions, and selection scores with enough narrative strength and evidence quality. The evidence threshold must name the concrete artifact or observable result needed before an item can be upgraded, and must state the upgraded status in plain Chinese. If an item lacks these sections, keep it out of the promoted feed until the source material can support the briefing.

## Validation

Run this before committing content updates:

```bash
node scripts/validate-data.mjs
```

The validator checks source-count metadata, concise edition metadata without repeated explanations, homepage caveat-copy duplication across `readerFrame`, `sourceRisk`, and `trendNotes`, topic continuity notes that classify recurring themes as stronger, weaker, or repeated, company continuity notes that say what changed and what remains unproven, action-oriented coverage labels and topic meanings, source-family and source-owner concentration notes, category definitions and label consistency, deep-briefing coverage limits and source-fact reference labels, archive readiness between the current edition and latest history snapshot, newest-first sorting, stale current items with source-specific `freshSourceFact` exceptions, repeated current-vs-history coverage, repeated source URLs and near-duplicate titles across history, current and historical item fields including dedicated detail-page explanations, current/latest promoted detail paragraph length, promoted-item concrete-audience wording, promoted-item incident briefing readiness, selection scores, reader-use notes, editorial follow-up questions, evidence thresholds, claim boundaries, vendor-claim next checks with independent evidence, downgrade signals with concrete follow-up artifacts, source ID references, and URL shape.
