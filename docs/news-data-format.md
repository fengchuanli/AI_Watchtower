# News Data Format

Homepage news items live in `data/news.json`. 首页优先读取 `summary` and `whyItMatters`; the detail page can use longer detail fields after the reader chooses to open an item. Captured historical items live in `data/news-history.json`. This keeps editorial content separate from page behavior and prepares the site for future RSS or API ingestion.

All item fields must follow `docs/copyright-safety.md`. The data model should help readers understand the news, but it must not turn source articles into full Chinese replacements. Use source fields for minimum necessary facts, and use editorial fields for AI Watchtower's own interpretation, trend reading, reader use, and verification boundary.

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
- Metadata readability: Keep top-level `editorNote`, `operationalStatus`, `editorialInterpretation`, and `sourceRisk` responsible for different jobs. Do not repeat the same pull status, media-boundary caveat, or next-check sentence across multiple fields; the homepage metadata line should read as short labels, not as a paragraph.
- `readerFrame`: Required Chinese object explaining how readers should use this edition. Include `headline`, `whyItMatters`, at least two `useThisIssueFor` bullets naming concrete readers or teams, and at least two `notProvenYet` bullets stating what the batch still does not prove. Keep it focused on reader orientation, not new unsupported claims.
- `changeSummary`: Required Chinese object explaining what changed since the previous batch. Include `headline`, at least two `freshFacts` bullets written as this batch's new source facts, and at least two `repeatedContext` bullets naming background or older storylines that should not be mistaken for new facts.
- `coverageMix`: At least two objects with `label`, positive integer `count`, and Chinese `meaning`. The counts must add up to the current `items.length`, and each meaning should name the reader action that signal group supports, such as updating a policy watchlist, checking engineering dependencies, adjusting a product dashboard, or verifying a source list.
- `sourceRisk`: Compact Chinese source-concentration note with `label`, `note`, and `nextCheck`. Use it when a batch is dominated by one source family, one vendor, or one evidence mode; the note should tell readers whether the batch is a radar signal or confirmed evidence, and `nextCheck` should name the independent official, original, filing, or policy source needed next.
- `sourceFamilies`: One object for each source tier used by current `items`, with `family`, `label`, positive integer `count`, and Chinese `role`. Counts must match item `sourceId` entries through `data/sources.json` `trustLevel`; use this to explain whether a batch relies on official sources, research originals, reliable media, or community signals.
- `topicGroups`: One or more topic discovery groups for the current `items`, with `id`, `label`, positive integer `count`, `itemIds`, and Chinese `meaning`. Supported IDs are `agent`, `model`, `enterprise`, `policy`, `infrastructure`, and `developer-tooling`; each `itemIds` value must reference a current news item, and `count` must match `itemIds.length`. Each meaning should be action-oriented rather than a passive topic label, for example "用来更新...", "用来检查...", or "用来调整...".

Homepage topic groups also render planned-topic omission boundaries for supported topics that are not represented in the current batch. Each omitted topic should explain why it was not promoted, what evidence would make it promotable, and where readers can look instead. Keep this wording editorial and source-boundary focused; do not use omitted-topic copy to introduce new factual claims.

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
- `references`: Source references retained for verification rather than primary navigation. Each reference needs `label` and an `http` or `https` `url`; the homepage opens these links in a new window with an explicit accessible label.

Deep-briefing visible labels should be Chinese-first. Avoid unexplained structural English such as `Intelligence Briefing`, `Health AI`, `Medical Research`, `Enterprise Ops`, `So What?`, `checklist`, or `FinOps` in reader-facing copy when a clear Chinese label works. Product names, model names, API names, and source titles may remain in English when that is the actual name readers need to recognize.

## Category Fields

The top-level `categories` array defines the editorial boundary of every homepage filter. Keep one definition for each supported category so the page can explain what is included instead of relying on a short label alone.

- `id`: Stable category code matching item `category` and the homepage filter.
- `label`: Chinese label shared by the filter and every item in that category.
- `description`: Concise Chinese scope note covering what belongs in the category and any important evidence caveat.

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
- `editions[].itemCount`: Number of items in the batch; must match `items.length`.
- `editions[].items`: Full item objects using the same required fields as the current feed.

The all-news history page derives its category filters from historical item `category` and `label` values, then lets readers switch between newest-first and oldest-first batch order. Keep historical categories stable and labels readable so older coverage remains discoverable without using original source links as the primary reading path.

The current feed must not promote stale background material as a new batch. Keep `publishedAt` within seven days of `updatedAt` unless a new source fact produces a distinct fresh item. If an older archive item already uses the same normalized source URL or a near-duplicate title, reuse the archive for background context instead of re-publishing the item as current news.

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
- `whoShouldCare`: Required for promoted current items and the latest archived snapshot. Write one Chinese sentence naming the concrete audience that should care before describing how they should use the signal, for example legal, procurement, policy, infrastructure, strategy, investment, or product teams.
- `readerUse`: Short Chinese line naming who should use the signal and what decision or checklist it informs.
- `nextCheck`: Short editorial note stating what should be verified before treating the item as fully confirmed.
- `followUpQuestions`: At least two concrete Chinese questions ending in `？` that guide the next editorial update or source check.
- `evidenceThreshold`: Concrete minimum evidence required before the observation can be upgraded to a confirmed editorial judgment. Name the source artifact or proof type needed, and say what verified editorial status it would unlock, such as moving from a media signal to a confirmed organization change, fact conclusion, verified policy, or validated deployment. Avoid vague phrases such as "more evidence".
- `claimBoundary`: Short Chinese caution stating what the current item does not prove, so readers do not overread a signal beyond its available evidence.
- `counterEvidence`: Short Chinese condition explaining what later evidence would weaken, downgrade, or narrow the current editorial judgment. For promoted current items and the latest archived snapshot, name a concrete proof type, source artifact, or observable outcome such as policy text, official announcement, access logs, approval records, adoption metrics, role confirmation, third-party retest, or product delivery status; avoid vague phrasing like "更多证据".
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
- `time`: Short display time.

The detail page derives a source-boundary panel from existing item fields rather than adding a separate claim layer. `provenance` is shown as what the linked source can directly support, `detailTrend` is shown as AI Watchtower's interpretation, and `claimBoundary` is shown as what the item still cannot prove. Keep these fields written so a reader can distinguish source-backed facts from editorial judgment without leaving the page.

Detail pages also render a canonical four-block briefing from existing item fields: `detailBody` as the minimum source-supported fact, `impact` as the reader-facing impact judgment, `claimBoundary` as the proof boundary, and `nextCheck` as the next verification step. Keep these four fields independently readable because they are the fastest path for mobile readers who need facts, impact, boundary, and next action before deciding whether to continue into the full explanation.

For VisionHub-style narrative events, source role matters more than story appeal. Use `厂商主张` for company-written policy proposals, customer stories, benchmark narratives, or other vendor-framed pages unless the linked page directly verifies a stronger category such as an official release fact, research original, or regulator action. A `厂商主张` item may be marked `已核验` only for the narrow fact that the vendor made the claim or proposal; `provenance`, `claimBoundary`, `nextCheck`, `evidenceThreshold`, and `counterEvidence` must name the missing external proof so readers do not mistake a vivid narrative for independent confirmation.

Promoted items, including the current `今日 TOP3` and the latest archived snapshot, must be able to support a full in-site incident briefing before publication. The validator treats promotion as a combined contract: each promoted item needs event explanation, trend meaning, ranking value, reader impact, reader use, next checks, evidence threshold, claim boundary, downgrade signal, source role, provenance, verification status, at least two follow-up questions, and selection scores with enough narrative strength and evidence quality. The evidence threshold must name the concrete artifact or observable result needed before an item can be upgraded, and must state the upgraded status in plain Chinese. If an item lacks these sections, keep it out of the promoted feed until the source material can support the briefing.

## Validation

Run this before committing content updates:

```bash
node scripts/validate-data.mjs
```

The validator checks source-count metadata, concise edition metadata without repeated explanations, action-oriented coverage and topic meanings, category definitions and label consistency, deep-briefing coverage limits, newest-first sorting, stale current items, repeated current-vs-history coverage, repeated source URLs and near-duplicate titles across history, current and historical item fields including dedicated detail-page explanations, promoted-item incident briefing readiness, selection scores, reader-use notes, editorial follow-up questions, evidence thresholds, claim boundaries, downgrade signals with concrete follow-up artifacts, source ID references, and URL shape.
