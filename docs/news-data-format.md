# News Data Format

Homepage news items live in `data/news.json`. This keeps editorial content separate from page behavior and prepares the site for future RSS or API ingestion.

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

## Required Fields

- `id`: Stable unique item ID.
- `category`: One of `model`, `product`, `research`, `tool`, `funding`, or `policy` for the current homepage filters.
- `label`: Chinese category label shown on the card.
- `title`: Chinese headline.
- `body`: Short Chinese summary.
- `trend`: Chinese editorial interpretation that links the item to a broader observable trend without adding unverified facts.
- `whyRanked`: Short Chinese explanation for why the item deserves homepage attention or ranking priority.
- `impact`: Short editorial line explaining why the item matters or what to watch next.
- `nextCheck`: Short editorial note stating what should be verified before treating the item as fully confirmed.
- `source`: Human-readable source group.
- `sourceId`: Must match an entry in `data/sources.json`.
- `sourceUrl`: Original source or source-group URL.
- `provenance`: How readers should interpret the source and claim quality.
- `trustLevel`: Visible trust label such as official confirmation, media context, research lead, or unverified signal.
- `publishedAt`: ISO-like timestamp with timezone.
- `time`: Short display time.

## Validation

Run this before committing content updates:

```bash
node scripts/validate-data.mjs
```

The validator checks edition metadata, required item fields, category support, source ID references, and URL shape.
