# Detail Page Review Guide

Use this guide after a drafted item has passed `docs/candidate-to-news-handoff.md` and before publishing `data/news.json`. Its job is to make each detail page useful for Chinese readers without turning the source article, vendor post, paper, or media report into a translated substitute.

Review technical claims by converting them into four visible blocks: fact, impact, boundary, and next check. If any block cannot be written in plain Chinese from the available source material, hold the item or downgrade the claim before publication.

## When To Use It

Use this guide for every item whose detail page contains technical, product, research, infrastructure, policy, safety, benchmark, funding, or adoption claims.

Always use it when the item mentions:

- Model capability, benchmark, safety, evaluation, cost, latency, adoption, revenue, infrastructure capacity, energy constraint, customer deployment, regulatory effect, or market share.
- Vendor claims, media-reported numbers, research findings, or policy interpretations that could be overread as confirmed outcomes.
- Detail copy longer than the homepage card, especially `detailBody`, `detailTrend`, `sourceFacts`, `claimBoundary`, `nextCheck`, `evidenceThreshold`, `counterEvidence`, `followUpQuestions`, and `sourceReferences`.

## Four-Block Review

For each important claim, write or verify these four blocks before saving the item.

| Block | Public fields | Review question | Good shape |
| --- | --- | --- | --- |
| Fact | `body`, `summary`, `sourceFacts`, first sentence of `detailBody` | What did the source directly support? | One short source-backed statement with actor, action, object, date or scope when relevant. |
| Impact | `whyItMatters`, `impact`, `readerUse`, `whoShouldCare`, `detailTrend` | Who should adjust their reading, checklist, budget, risk model, or follow-up question? | Plain Chinese reader value, not a generic "industry impact" sentence. |
| Boundary | `claimBoundary`, `provenance`, `verificationStatus`, `originalDependency` | What does this source not prove yet? | Explicitly says whether the claim is official, reported, measured, early, limited, or still unconfirmed. |
| Next check | `nextCheck`, `evidenceThreshold`, `counterEvidence`, `followUpQuestions`, `sourceReferences` | What observable evidence would upgrade, confirm, weaken, or refute the claim? | Names a concrete artifact or outcome: official file, customer metric, audit, benchmark, dataset, replication, contract, filing, regulator text, logs, deployment status, or third-party test. |

Do not publish a detail page where the fact is long, the impact is vague, the boundary is missing, or the next check says only "继续关注".

## Technical Claim Conversion

Use this sequence when rewriting a dense technical sentence.

1. Extract the smallest source-backed fact.
2. Remove adjectives the source cannot independently prove, such as "全面", "领先", "革命性", "已经解决", or "行业标准".
3. Translate the technical relevance into a reader decision: procurement, governance, safety review, model choice, workflow design, research tracking, policy monitoring, or budget planning.
4. Write the proof boundary in negative form: "这不能证明..." or "这仍需...".
5. Name the next evidence object, not just the next news source.

Example shape:

```text
事实：来源称某模型在一个公开评测上更新了分数。
影响：采购或评测团队可以把它加入复测清单，但不能只按榜单决定供应商。
边界：这不证明模型在真实企业任务中整体更强。
下一步核对：等待第三方复测、任务日志、成本/延迟指标和失败样例。
```

## Source-Type Adjustments

Official, research, regulator, and reliable-media items need different review pressure.

- Official or vendor source: fact can be clearer, but impact and boundary must avoid marketing语气. Require customer-side metric, third-party benchmark, public deployment evidence, audit, filing, or regulator text before upgrading outcome claims.
- Research source: separate measured result from general capability. Name dataset, benchmark, sample, replication, peer review, real-world transfer, or safety review as the next check.
- Regulator or policy source: name jurisdiction, effective date, enforcement body, comment period, and unresolved implementation path.
- Reliable media source: keep the media fact minimal, keep `originalDependency: "must-read"`, and tell readers which complete facts, interviews, figures, charts, or context still require the original article.
- Community or social signal: do not use as a confirmed detail-page fact unless an official, research, regulator, or reliable-media source has already supported the central claim.

## Mobile Readability Pass

A useful detail page should be easy to scan on a phone.

- Keep each paragraph focused on one job: fact, interpretation, boundary, or next check.
- Prefer short Chinese clauses over stacked English technical terms.
- Put the reader-facing consequence before deep background.
- Move long caveats into `claimBoundary`, `provenance`, or `nextCheck` instead of repeating them in every section.
- If a sentence needs more than one semicolon, split it or convert it into a follow-up question.

## Stop Conditions

Hold or rewrite the item when:

- The detail page only works by copying the source's article structure, long background, interview detail, chart explanation, or vendor narrative.
- A media report becomes the only place where readers can learn the complete fact from AI Watchtower rather than the original link.
- `impact` cannot name a concrete Chinese reader group or decision.
- `claimBoundary`, `evidenceThreshold`, or `counterEvidence` cannot name what evidence would change the judgment.
- The page uses a source number, benchmark, adoption claim, revenue figure, or safety claim without saying what the number does not prove.

The review is complete only when a reader can tell, in under 30 seconds, what happened, why it matters, what remains unproven, and exactly what should be checked next.
