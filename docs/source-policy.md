# Source Policy

AI Watchtower should grow from a clear source list instead of scraping random pages. The canonical source list lives in `data/sources.json`.

## Priority

1. Official sources: product releases, model announcements, policy posts, research notes, and platform updates.
2. Research sources: arXiv and research-focused feeds for technical direction. Preprints should be summarized carefully.
3. Reliable media: market context, funding, product movement, and broader analysis.
4. Community signals: Hacker News, GitHub Trending, Product Hunt, Reddit, and social sources. These are discovery inputs only.

## Publishing Rules

- Preserve the original source URL for each item.
- State the source's role in the item: official verification, research original, media background, community discovery, or vendor claim.
- Write summaries in Chinese.
- Do not copy full articles.
- Do not present community discussion, rumors, leaks, or unconfirmed posts as facts.
- Prefer official confirmation when covering model releases, company claims, pricing, policy changes, or funding.
- Do not use a vendor blog as confirmation of regulation; link the applicable law, regulator, or platform policy before publishing.
- Mark uncertain items as signals instead of confirmed news.

## Automation Notes

News intelligence jobs run at 08:00 and 17:00 JST. They should start with sources where `hasRss` is `true`, then add official non-RSS pages with conservative fetching rules. The site should summarize and explain the news in Chinese, while keeping original URLs as references rather than forcing readers to leave the page.
