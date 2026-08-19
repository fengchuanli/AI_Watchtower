# Original Source Replacement Guide

Use this guide when a candidate starts from a media report but the public item may need a stronger original source before drafting. Its purpose is to protect readers from overreading media background and to keep AI Watchtower from becoming a Chinese replacement for the article.

This guide sits between `docs/candidate-source-checklist.md` and `docs/candidate-to-news-handoff.md`: first decide whether the media report is enough for a minimal, clearly attributed signal, or whether the candidate must wait for an official announcement, filing, paper, regulator text, customer page, dataset, benchmark, or other original source.

## Replacement Rule

Replace a media report as the central source when the public value depends on a fact that should be verifiable outside the article.

Do not replace the media report merely to hide attribution. If the article is the only source for the reported fact, keep the media link visible, mark the item as `媒体背景`, use `originalDependency: "must-read"`, and keep the source-backed fact short.

## Must Replace Before Drafting

Hold the candidate with `hold-original-source-needed` when any of these are true:

- The report describes a company release, policy change, model access rule, pricing change, benchmark result, safety claim, acquisition, funding round, legal filing, government action, or customer deployment that should have an official, filing, regulator, paper, or customer-side original.
- The article's useful detail is mostly interview material, leaked context, internal document description, chart analysis, or market color that cannot be safely summarized without recreating the article.
- The central claim would change reader behavior, such as upgrading a model, trusting a capability, buying a tool, judging compliance risk, or interpreting a regulation.
- The report names numbers, dates, restrictions, contracts, performance gains, user counts, valuation, legal obligations, or government decisions that need a primary document or original data.
- The source is paywalled or login-gated and the central fact cannot be supported by public title, source metadata, official confirmation, or another open original source.

If no original source can be found and the media article cannot be reduced to a safe one-sentence signal, reject it with `reject-copyright-substitute-risk` or `reject-paywall-body-dependent`.

## Media Can Remain Central

A media report can remain the central source only when all of these are true:

- The item is valuable as a limited reported signal, not as confirmed fact.
- `sourceBackedFact` can be written in one short sentence without article structure, interview detail, long background, charts, or paywalled body text.
- `proofBoundary` clearly says what the report does not prove.
- `nextIndependentCheck` names the original evidence that would upgrade the item.
- `copyrightPosture` says完整事实、采访细节、图表和上下文仍需阅读原文.
- The draft will use `sourceRole: "媒体背景"`, `claimStatus: "reported"`, and `originalDependency: "must-read"`.

## Replacement Search Order

Search in this order before drafting:

1. Company or organization announcement, product blog, changelog, documentation, status page, press release, customer case page, pricing page, or policy page.
2. Regulator, court, legislature, standards body, public procurement, export-control, or government database page.
3. Filing, investor relation page, public contract record, grant record, dataset, benchmark page, paper, code repository, model card, system card, or evaluation report.
4. Direct customer, partner, university, lab, nonprofit, or agency confirmation that names the same fact.
5. A second reliable-media source only as a corroborating report, not as a substitute for an original source when the claim needs one.

Record the search result in `nextIndependentCheck` or the intake note. If the original exists, use that original URL as `candidateUrl` and keep the media report as background only when it adds safe reader context.

## Source-Of-Record Decision

When official, media, filing, and research pages all exist for the same event, choose the page that directly owns the central fact as the source of record. Do not pick the most readable article if another source carries the legal, technical, product, or disclosure responsibility for the claim. The source-of-record choice decides `candidateUrl`, `sourceRole`, and the first sentence of `sourceBackedFact`; other pages can stay in `sourceReferences` only when they add safe context without changing the evidence posture.

| Central fact type | Best source of record | How to use the other pages |
| --- | --- | --- |
| Product launch, model access, pricing, policy, documentation, safety-system change, or platform rule | Official announcement, product docs, changelog, system card, model card, status page, or policy page from the responsible organization | Media can explain market reaction only as `媒体背景`; filings or research pages should support only the facts they directly contain. |
| Funding, acquisition, listing, board change, legal exposure, public-company number, government contract, or export/control obligation | Filing, investor relation page, regulator/court/government record, contract notice, procurement page, or legally accountable disclosure | Official blogs can explain company framing; media remains background unless no public filing or disclosure exists. |
| Capability, benchmark, dataset, safety result, research method, model evaluation, or replication claim | Paper, benchmark page, dataset, code repository, model/system card, evaluation report, or independent replication page | Vendor posts can introduce the claim but should not become independent proof; media should not replace the research artifact. |
| Adoption, deployment, ROI, customer outcome, medical/legal/finance effect, reliability, cost, or operational metric | Customer-side page, audit, implementation record, public metric, regulator result, independent benchmark, or contract/performance evidence | Vendor case studies stay `厂商主张` until external evidence appears; media can remain a limited reported signal if no stronger public source exists. |

If two source types support different parts of the story, split the claim instead of forcing one page to prove everything. Use the accountable source for the headline fact, then name the weaker page's boundary in `proofBoundary`, `nextIndependentCheck`, or `sourceReferences`.

Do not upgrade a candidate just because several pages discuss the same event. Upgrade only when the chosen source of record adds a new accountable fact, such as an official release, filing, regulator text, paper artifact, customer-side metric, audit, contract, dataset, or independent benchmark.

## Intake Wording

When replacement is needed, write:

```text
decisionReason: hold-original-source-needed: 这条媒体报道涉及 <事实类型>，发布前需要 <官方/文件/论文/监管/客户侧来源> 支持中心事实。
```

When media can remain central, write:

```text
copyrightPosture: 只使用媒体报道支持的一句最小事实；完整事实、采访细节、图表和上下文仍需阅读原文。
proofBoundary: 该报道不能单独证明 <尚未证明的效果、政策执行、客户采用、技术指标或监管结论>。
nextIndependentCheck: 下一步需要查看 <原始来源类型>。
```

## Drafting Guard

Before a media-sourced candidate enters `data/news.json`, confirm:

- The original-source search was attempted or the media report is intentionally treated as a limited signal.
- The central source role is not stronger than the evidence allows.
- The homepage card does not make the reported claim sound confirmed.
- The detail page does not turn the article into a Chinese substitute.
- `sourceReferences` keep the media article as the full-context link.

If any answer is unclear, return to intake instead of drafting.
