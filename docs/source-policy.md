# Source Policy

AI Watchtower should grow from a clear source list instead of scraping random pages. The canonical source list lives in `data/sources.json`.

## Priority

1. Official sources: product releases, model announcements, policy posts, research notes, and platform updates.
2. Research sources: arXiv and research-focused feeds for technical direction. Preprints should be summarized carefully.
3. Reliable media: market context, funding, product movement, and broader analysis.
4. Community signals: Hacker News, GitHub Trending, Product Hunt, Reddit, and social sources. These are discovery inputs only.

## Selection Logic

AI Watchtower should not publish every official update with equal weight. Each captured item should be able to become a readable incident briefing, similar to a daily AI slide: a clear change, a concrete conflict or tension, and a practical consequence.

Prioritize items that match at least one of these story patterns:

- **Paradigm shift**: a model, product, or workflow changes how work is organized, such as agent OS, model councils, autonomous development, or local/private AI ownership.
- **Strategic risk**: safety, export controls, data sovereignty, model access, security incidents, or regulatory intervention change what companies can rely on.
- **Workflow replacement**: AI turns a manual profession, coding flow, research process, design loop, or business operation into a new operating model.
- **Infrastructure unlock**: new hardware, orchestration, memory, evaluation, observability, or agent runtime makes previously experimental AI deployable.
- **Adoption proof**: a credible enterprise, government, medical, finance, education, or public-sector case gives evidence about real deployment and governance.
- **Open-source or developer shock**: a tool, repo, SDK, CLI, or protocol changes how builders work, especially when it affects agent teams, codebases, memory, or automation.

Use this scoring before publishing:

- **Impact**: who is affected and how large the shift could be.
- **Novelty**: whether the item changes the previous mental model, not just repeats a routine release.
- **Narrative strength**: whether the event has a timeline, tension, numbers, and a clear "so what".
- **Evidence quality**: whether the central claim can be traced to an official source, paper, reliable media report, or clearly labeled signal.
- **Reader utility**: whether a founder, developer, enterprise buyer, policy watcher, or operator can make a decision or update a checklist from it.

Low-priority items should be skipped or kept in source notes when they are routine marketing, small feature updates without a larger pattern, repeated coverage of an already captured source, or claims that cannot be verified.

## Publishing Rules

- Preserve the original source URL for each item.
- State the source's role in the item: official verification, research original, media background, community discovery, or vendor claim.
- Write summaries in Chinese.
- Do not copy full articles.
- Do not present community discussion, rumors, leaks, or unconfirmed posts as facts.
- Prefer official confirmation when covering model releases, company claims, pricing, policy changes, or funding.
- Do not use a vendor blog as confirmation of regulation; link the applicable law, regulator, or platform policy before publishing.
- Mark uncertain items as signals instead of confirmed news.

## Narrative Event Sources

VisionHub-style incident briefings work best when an item has a clear storyline: who acted, what changed, why there is tension, and what the reader should watch next. Narrative strength is useful for selection, but it must not lower the evidence bar.

When a source is mainly a company narrative, customer story, policy proposal, benchmark page, or vendor-written case study:

- Use `sourceRole: "厂商主张"` unless the linked page directly verifies an official release fact, research paper, regulator action, or other stronger source category.
- Treat the page as evidence of the author's claim, framing, dates, named partners, and disclosed numbers only.
- Do not treat vendor-written outcomes as independent proof of market adoption, ROI, safety, clinical effect, legal status, customer satisfaction, or regulatory acceptance.
- Keep `verificationStatus: "已核验"` only when the central sentence is limited to "this vendor made this claim or proposal" and the page supports that sentence.
- Require `provenance`, `claimBoundary`, `nextCheck`, and `evidenceThreshold` to name the missing external confirmation, such as customer-side metrics, paper replication, regulator text, contract filing, audit result, or independent benchmark.
- Downgrade or skip the item if the narrative is vivid but the source cannot support a concrete event, timeline, tension, and next verification step.

## Automation Notes

News intelligence jobs run at 08:00 and 17:00 JST. They should start with sources where `hasRss` is `true`, then add official non-RSS pages with conservative fetching rules. The site should summarize and explain the news in Chinese, while keeping original URLs as references rather than forcing readers to leave the page.

Each published item should have enough material for an in-site incident briefing: what happened, why it matters, trend meaning, timeline, source boundaries, and next checks. If an item cannot support that structure, do not promote it into the homepage feed.
