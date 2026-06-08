# Source Policy

AI Watchtower should grow from a clear source list instead of scraping random pages. The canonical source list lives in `data/sources.json`.

## Priority

1. Official sources: product releases, model announcements, policy posts, research notes, and platform updates.
2. Research sources: arXiv and research-focused feeds for technical direction. Preprints should be summarized carefully.
3. Reliable media: market context, funding, product movement, and broader analysis.
4. Community signals: Hacker News, GitHub Trending, Product Hunt, Reddit, and social sources. These are discovery inputs only.

## Publishing Rules

- Preserve the original source URL for each item.
- Write summaries in Chinese.
- Do not copy full articles.
- Do not present community discussion, rumors, leaks, or unconfirmed posts as facts.
- Prefer official confirmation when covering model releases, company claims, pricing, policy changes, or funding.
- Mark uncertain items as signals instead of confirmed news.

## Automation Notes

When future jobs ingest live data, they should start with sources where `hasRss` is `true`, then add official non-RSS pages with conservative fetching rules.
