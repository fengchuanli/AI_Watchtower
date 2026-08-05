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
- **Leadership and capital shock**: statements, investments, acquisitions, IPO/listing plans, compute commitments, or strategic reorganizations by AI leaders and AI-adjacent giants materially change the AI market map. Examples include Jensen Huang on demand or supply constraints, Elon Musk/xAI/SpaceX moves that affect AI compute or capital, Sam Altman on OpenAI strategy, major hyperscaler AI spending, or acquisitions of important AI companies.
- **Open-source or developer shock**: a tool, repo, SDK, CLI, or protocol changes how builders work, especially when it affects agent teams, codebases, memory, or automation.

Use this scoring before publishing:

- **Impact**: who is affected and how large the shift could be.
- **Novelty**: whether the item changes the previous mental model, not just repeats a routine release.
- **Narrative strength**: whether the event has a timeline, tension, numbers, and a clear "so what".
- **Evidence quality**: whether the central claim can be traced to an official source, paper, reliable media report, or clearly labeled signal.
- **Reader utility**: whether a founder, developer, enterprise buyer, policy watcher, or operator can make a decision or update a checklist from it.

AI-adjacent business events should be considered when they have a direct AI consequence: compute capacity, model competition, AI talent, enterprise adoption, chip supply, cloud spending, data-center buildout, AI company valuation, acquisition, or regulatory exposure. Do not include celebrity or stock-market noise unless the story can be explained as an AI infrastructure, capital, governance, or product-shift signal.

### AI-adjacent Event Examples

Use these examples when deciding whether capital, compute, leadership, or infrastructure stories belong in the daily batch. They are not investment guidance; they are editorial filters for whether a business event helps a Chinese reader understand a material AI shift.

| Event type | Promote when | Hold or skip when | Source posture |
| --- | --- | --- | --- |
| Capital or financing | A funding round, debt facility, IPO/listing plan, valuation reset, or acquisition changes AI model competition, compute access, enterprise distribution, or strategic control of an important AI company. | The only angle is stock price movement, celebrity wealth, investor gossip, routine fundraising, or speculative valuation without a concrete AI consequence. | Prefer company releases, filings, regulator disclosures, or deal participant statements; use reliable media as `媒体背景` and keep the source fact minimal. |
| Compute and data-center buildout | A chip order, cloud commitment, power deal, sovereign compute plan, or data-center expansion materially changes training/inference capacity, chip supply, deployment geography, or AI cost structure. | The story is generic cloud expansion, real-estate development, or supply-chain commentary that does not name an AI workload, model provider, accelerator, region, or capacity constraint. | Check original cloud, chip, utility, government, or filing sources where possible; record whether numbers are committed capacity, planned capacity, or vendor projection. |
| Leadership and strategy | A founder, CEO, lab lead, policy leader, or board-level change affects model roadmap, safety governance, capital allocation, product access, or enterprise trust. | It is only personality coverage, conference-stage commentary, social-media conflict, or a quote that does not change a verifiable product, governance, compute, or capital decision. | Treat interviews and media profiles as background; upgrade only with official statements, board filings, policy documents, product changes, or corroborated reporting. |
| Infrastructure providers | A chipmaker, hyperscaler, networking vendor, observability platform, data provider, or orchestration vendor releases evidence that production AI capacity, reliability, evaluation, security, or cost control is changing. | It is a routine partnership, logo list, benchmark claim, or vendor customer story without deployment scope, independent evidence, or a next-check path. | Label vendor-written outcome claims as `厂商主张`; require customer-side metrics, independent benchmarks, filings, audits, or implementation evidence before stronger conclusions. |

For every promoted AI-adjacent item, the draft should answer: what AI capability or constraint changed, who is affected, what the source proves, what remains unverified, and which independent source would upgrade or downgrade the signal.

Low-priority items should be skipped or kept in source notes when they are routine marketing, small feature updates without a larger pattern, repeated coverage of an already captured source, or claims that cannot be verified.

## Publishing Rules

- Preserve the original source URL for each item.
- State the source's role in the item: official verification, research original, media background, community discovery, or vendor claim.
- Write summaries in Chinese.
- Do not copy full articles.
- Do not create a Chinese replacement for a media article. For media sources, extract only the minimum necessary fact, then write AI Watchtower's own trend interpretation, source boundary, and next-check guidance.
- Keep source-fact summaries short enough that readers still need the original source for full facts, quotes, charts, interviews, and context.
- Do not present community discussion, rumors, leaks, or unconfirmed posts as facts.
- Prefer official confirmation when covering model releases, company claims, pricing, policy changes, or funding.
- Do not use a vendor blog as confirmation of regulation; link the applicable law, regulator, or platform policy before publishing.
- Mark uncertain items as signals instead of confirmed news.
- Follow `docs/copyright-safety.md` before publishing or expanding any item from a media source.

## Narrative Event Sources

VisionHub-style incident briefings work best when an item has a clear storyline: who acted, what changed, why there is tension, and what the reader should watch next. Narrative strength is useful for selection, but it must not lower the evidence bar.

When a source is mainly a company narrative, customer story, policy proposal, benchmark page, or vendor-written case study:

- Use `sourceRole: "厂商主张"` unless the linked page directly verifies an official release fact, research paper, regulator action, or other stronger source category.
- Treat the page as evidence of the author's claim, framing, dates, named partners, and disclosed numbers only.
- Do not treat vendor-written outcomes as independent proof of market adoption, ROI, safety, clinical effect, legal status, customer satisfaction, or regulatory acceptance.
- Keep `verificationStatus: "已核验"` only when the central sentence is limited to "this vendor made this claim or proposal" and the page supports that sentence.
- Require `provenance`, `claimBoundary`, `nextCheck`, and `evidenceThreshold` to name the missing external confirmation, such as customer-side metrics, paper replication, regulator text, contract filing, audit result, or independent benchmark.
- Write `nextCheck` as the immediate independent-evidence path for readers: it should name the specific customer, third-party, paper, regulator, audit, filing, contract, original-data, or expert-review source to check next, not just say "继续观察" or repeat the vendor's own page.
- Before promoting one of these items into TOP3, apply `docs/vendor-narrative-promotion-rule.md`; the homepage card's first-screen reason fields must name the independent proof path instead of relying on narrative appeal.
- Downgrade or skip the item if the narrative is vivid but the source cannot support a concrete event, timeline, tension, and next verification step.

## Automation Notes

News intelligence jobs run at 08:00 and 17:00 JST. They should start with sources where `hasRss` is `true`, then add official non-RSS pages with conservative fetching rules. Each run should aim to publish at least 10 qualified current-news items after duplicate, paywall, source-role, and copyright checks. If fewer than 10 safe items are available, publish only the safe items and write the shortage reason in `edition.operationalStatus` and `docs/optimization-log.md`; do not pad the batch with weak, repeated, or unsafe stories. The site should summarize and explain the news in Chinese, while keeping original URLs as references rather than forcing readers to leave the page.

Daily TOP3 is not the first three items of a single capture run. It is the best three items for the editorial date across all captured editions that day, ranked by reader utility, impact, evidence quality, narrative strength, and freshness. Later runs can replace the morning TOP3 if a stronger same-day signal appears.

Each published item should have enough material for an in-site incident briefing: what happened, why it matters, trend meaning, timeline, source boundaries, and next checks. If an item cannot support that structure, do not promote it into the homepage feed.

Before a semi-automated gathering run turns a discovered URL into a draft, apply `docs/candidate-source-checklist.md`. The checklist is the candidate gate: it confirms source identity, role, minimum evidence, copyright/paywall safety, duplicate status, and source-owner concentration before the editorial checklist handles the drafted item.
