# News Data Format

Homepage news items live in `data/news.json`. Captured historical items live in `data/news-history.json`. This keeps editorial content separate from page behavior and prepares the site for future RSS or API ingestion.

## Edition Fields

The required top-level `edition` object gives each homepage snapshot a stable archive identity. Update it whenever the feed advances to a new editorial date.

- `id`: Stable lowercase archive key ending in an ISO date, such as `sample-2026-06-12`.
- `date`: Editorial date in `YYYY-MM-DD` format; must match top-level `updatedAt`.
- `timezone`: IANA timezone used to interpret the edition date, such as `Asia/Tokyo`.
- `archiveStatus`: `preview` for sample or incomplete snapshots, or `published` for a reviewed edition.
- `archiveLabel`: Short Chinese status label shown in the homepage feed metadata.
- `note`: Chinese scope note explaining what the archived edition does and does not represent.

## Briefing Fields

The optional top-level `briefing` object powers the homepage Today Briefing section. Use it to summarize how readers should interpret the current feed, not to introduce unsupported claims.

- `label`: Short Chinese label shown above the briefing headline.
- `headline`: Chinese editorial headline for the daily briefing.
- `summary`: Chinese paragraph that frames the current feed and verification posture.
- `cta`: Short link text pointing readers toward the feed.
- `watchPoints`: Exactly three Chinese observation objects, each with `title` and `body`.

## Deep Briefing Fields

The required top-level `deepBriefing` object powers the homepage long-form explanation section. It should make the news understandable inside AI Watchtower, using original links only as references.

- `kicker`: Short English or Chinese section label.
- `title`: Chinese briefing title.
- `subtitle`: Chinese one-paragraph summary of the briefing angle.
- `dateLabel`: Human-readable date label.
- `status`: Publication or verification status.
- `overview`: Chinese overview explaining the whole briefing.
- `timeline`: At least three objects with `label`, `title`, and `body`.
- `keyNumbers`: At least three metric objects with `value` and `label`.
- `sections`: At least three explainer sections with `number`, `label`, `title`, `body`, and `soWhat`.
- `actions`: Reader actions or takeaways.
- `references`: Source references retained for verification rather than primary navigation.

## Category Fields

The top-level `categories` array defines the editorial boundary of every homepage filter. Keep one definition for each supported category so the page can explain what is included instead of relying on a short label alone.

- `id`: Stable category code matching item `category` and the homepage filter.
- `label`: Chinese label shared by the filter and every item in that category.
- `description`: Concise Chinese scope note covering what belongs in the category and any important evidence caveat.

## History Fields

`data/news-history.json` keeps every captured edition visible after the homepage advances to a newer batch.

- `version`: History schema version.
- `updatedAt`: Latest history update date.
- `totalItems`: Total captured item count across all editions.
- `editions`: Newest-first array of captured batches. A source URL may appear only once across history; repeated source URLs should be skipped instead of re-captured.
- `editions[].id`: Edition ID matching `data/news.json` when the edition is current.
- `editions[].date`: Capture or editorial date.
- `editions[].timezone`: IANA timezone for the capture batch.
- `editions[].archiveLabel`: Human-readable batch label, such as `17:00 JST 发布`.
- `editions[].itemCount`: Number of items in the batch; must match `items.length`.
- `editions[].items`: Full item objects using the same required fields as the current feed.

## Required Fields

- `id`: Stable unique item ID.
- `category`: One of `model`, `product`, `research`, `tool`, `funding`, or `policy` for the current homepage filters.
- `label`: Chinese category label shown on the card.
- `title`: Chinese headline.
- `body`: Short Chinese summary for homepage cards. Keep it focused on what happened.
- `detailBody`: Longer Chinese explanation for the detail page. It must add context beyond `body` and be meaningfully longer.
- `trend`: Chinese editorial interpretation that links the item to a broader observable trend without adding unverified facts.
- `detailTrend`: Longer Chinese trend explanation for the detail page. It must add context beyond `trend` and be meaningfully longer.
- `whyRanked`: Short Chinese explanation for why the item deserves homepage attention or ranking priority.
- `detailWhyRanked`: Longer Chinese detail-page explanation of why the item matters. It should preserve important source facts, boundaries, and caveats that are too long for the homepage card.
- `impact`: Short editorial line explaining why the item matters or what to watch next.
- `readerUse`: Short Chinese line naming who should use the signal and what decision or checklist it informs.
- `nextCheck`: Short editorial note stating what should be verified before treating the item as fully confirmed.
- `followUpQuestions`: At least two concrete Chinese questions ending in `？` that guide the next editorial update or source check.
- `evidenceThreshold`: Concrete minimum evidence required before the observation can be upgraded to a confirmed editorial judgment. Name the source type and proof needed rather than using a vague phrase such as "more evidence".
- `claimBoundary`: Short Chinese caution stating what the current item does not prove, so readers do not overread a signal beyond its available evidence.
- `counterEvidence`: Short Chinese condition explaining what later evidence would weaken, downgrade, or narrow the current editorial judgment.
- `source`: Human-readable source group.
- `sourceId`: Must match an entry in `data/sources.json`.
- `sourceUrl`: Original source or source-group URL.
- `sourceRole`: Controlled Chinese label describing what the linked source can support: `官方核对`, `研究原文`, `媒体背景`, `社区发现`, or `厂商主张`.
- `provenance`: How readers should interpret the source and claim quality.
- `trustLevel`: Visible source-tier label such as official, media, research, or community. It describes the source type, not whether the item claim has been verified.
- `verificationStatus`: Claim-level review status. Use `结构样例，未作事实核验` for sample cards and reserve `已核验` for items whose central claim has been checked against the cited source.
- `publishedAt`: ISO-like timestamp with timezone.
- `time`: Short display time.

## Validation

Run this before committing content updates:

```bash
node scripts/validate-data.mjs
```

The validator checks edition metadata, category definitions and label consistency, newest-first sorting, repeated source URLs across history, current and historical item fields including dedicated detail-page explanations, reader-use notes, editorial follow-up questions, evidence thresholds, claim boundaries, downgrade signals, source ID references, and URL shape.
