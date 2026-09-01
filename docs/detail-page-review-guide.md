# Detail Page Review Guide

Use this guide after a drafted item has passed `docs/candidate-to-news-handoff.md` and before publishing `data/news.json`. Its job is to make each detail page useful for Chinese readers without turning the source article, vendor post, paper, or media report into a translated substitute. When the review reaches `counterEvidence`, use `docs/counter-evidence-observable-guide.md` to decide whether the downgrade signal should name a source artifact or a concrete observable outcome.

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
5. Name the next evidence object, not just the next news source. For `counterEvidence`, prefer an observable outcome when the claim is about adoption, deployment, safety, performance, cost, or policy effect.

Example shape:

```text
事实：来源称某模型在一个公开评测上更新了分数。
影响：采购或评测团队可以把它加入复测清单，但不能只按榜单决定供应商。
边界：这不证明模型在真实企业任务中整体更强。
下一步核对：等待第三方复测、任务日志、成本/延迟指标和失败样例。
```

## EvidenceThreshold Upgrade Examples

`evidenceThreshold` should say what stronger evidence would unlock, not only what to watch next. Use it to move from a source-limited signal to a named editorial status.

Use these common upgrade paths:

| Starting evidence | Upgrade evidence to name | Upgraded status unlocked | Good `evidenceThreshold` shape |
| --- | --- | --- | --- |
| Media signal | Official announcement, filing, regulator text, company statement, court record, or named organization document | Confirmed organization change, confirmed policy action, or confirmed transaction fact | `需要公司公告、监管文件或法院记录确认报道中的组织调整，才能从媒体信号升级为已确认公司动作。` |
| Vendor claim | Customer-side metric, signed contract, deployment log, third-party benchmark, audit material, external expert review, or regulator filing | Independently verified deployment, validated performance/cost claim, or externally supported safety claim | `需要客户侧上线指标、合同或第三方测试复现，才能从厂商主张升级为独立验证的部署成效。` |
| Research preprint | Peer review, independent replication, released dataset/code, third-party benchmark rerun, safety evaluation, or real-world transfer test | Replicated research result, validated benchmark movement, or deployable capability evidence | `需要独立团队复现、公开数据/代码和第三方安全评测，才能从预印本结果升级为可复核研究结论。` |

Keep the sentence concrete: name both the artifact and the status change. Avoid `等待更多证据`, `继续观察`, or `看后续进展` unless the same sentence also names the exact document, metric, replication, audit, or deployment outcome that would change the judgment.

## Follow-Up Question Specificity

`followUpQuestions` should turn the next check into two concrete editorial questions. They are not a generic reminder to keep watching the company.

Use this shape:

- Question 1 asks whether the source-of-record artifact has appeared: official announcement, filing, court record, regulator text, model card, price page, code, dataset, benchmark setup, audit sample, contract, deployment log, or customer metric.
- Question 2 asks whether that artifact changes the editorial status: confirms a reported fact, validates a deployment or performance claim, proves a policy effect, supports replication, or weakens the current judgment.

Avoid reusable templates such as `是否已有独立来源确认[公司]的核心事实？` or `下一版能否找到客户日志、官方文件、论文复现或监管材料？` because they do not tell the next editor where to look first. A good question names the actual source path for the item, for example `法院原始裁定、案卷编号或 DoD 采购文件是否已公开可核对？` or `真实 Agent 日志、CloudWatch 告警和评分漂移记录是否支持生产评估？`.

## Source-Fact Label Test

The detail-page source panel is a reference label, not a source directory. Before publishing, check that `sourceName`, `sourceUrl`, and especially `provenance` tell readers which exact source fact the link supports.

Use this shape:

- `sourceName` names the source owner or source family, such as `Google Research Blog` or `Axios AI / Technology`.
- `provenance` names the supported source fact with an action and object: published TimesFM-3, reported a data-center political campaign, announced an Ads Manager expansion, or discussed Agent execution governance.
- The same sentence names the boundary: what still needs original text, filings, logs, metrics, code, replication, customer evidence, or third-party review.

Avoid bare labels such as `VentureBeat AI 只支持最小报道事实`, `官方来源`, `source link`, or `original article` when the reader cannot tell which fact the source supports. If one item has multiple support paths, name the source-of-record fact first and put upgrade or downgrade proof in `evidenceThreshold`, `counterEvidence`, or `followUpQuestions`.

## Counter-Evidence Downgrade Test

When reviewing `counterEvidence`, first ask whether later evidence would refute the central reading or only make it smaller.

- Use `降级`, `下调`, `降低`, or `削弱` when the core claim fails: official denial, invalid legal basis, missing contract/filing, failed replication, cancelled delivery, or negative measured result. The sentence should name the weaker status that replaces the current reading.
- Use `收窄` or `限定` when the core fact remains but its reach is smaller: fewer users, regions, customers, tasks, features, dates, or deployment contexts. The sentence should name the smaller boundary.
- If a claim could move either way, write both outcomes briefly so a later editor does not treat a central refutation as a harmless scope correction.

## DetailTrend Split Rule

`detailTrend` should answer one question: what broader AI direction this item suggests. Split it when the same paragraph also tries to do another job.

Use this quick test before publication:

- If the sentence says who should act or how to use the signal, move that part to `readerUse`, `impact`, or `whoShouldCare`.
- If it says what would upgrade the claim, move that part to `evidenceThreshold` or `nextCheck`.
- If it says what would weaken the claim, move that part to `counterEvidence` or `claimBoundary`.
- If it mainly restates the source fact, move that part back to `detailBody` and keep `detailTrend` as interpretation.

Good shape:

```text
detailTrend：企业 Agent 的竞争正在从模型回答质量转向权限、审计和工作流集成。
readerUse：法务、数据和采购团队可用它检查 Agent 是否继承现有系统权限。
evidenceThreshold：需要客户上线记录、审计日志样例和第三方法律技术评测，才能升级为已验证部署趋势。
```

Stop and split when `detailTrend` reads like "趋势 + 对读者怎么用 + 下一步要看什么" in one paragraph. That shape slows mobile scanning and makes fact, interpretation, proof boundary, and next action harder to distinguish.

## Source-Type Adjustments

Official, research, regulator, and reliable-media items need different review pressure.

- Official or vendor source: fact can be clearer, but impact and boundary must avoid marketing语气. Require customer-side metric, third-party benchmark, public deployment evidence, audit, filing, or regulator text before upgrading outcome claims.
- Research source: separate measured result from general capability. Name dataset, benchmark, sample, replication, peer review, real-world transfer, or safety review as the next check.
- Regulator or policy source: name jurisdiction, effective date, enforcement body, comment period, and unresolved implementation path.
- Reliable media source: keep the media fact minimal, keep `originalDependency: "must-read"`, and tell readers which complete facts, interviews, figures, charts, or context still require the original article.
- Community or social signal: do not use as a confirmed detail-page fact unless an official, research, regulator, or reliable-media source has already supported the central claim.

## Media Original Reminder

For media-backed detail pages, the original-article reminder should be visible early without becoming the main explanation.

Use this placement:

- Keep the hero reminder short: say the item is media background and that AI Watchtower keeps only minimal facts plus Chinese interpretation.
- Add one compact reminder after `30 秒速览` and before the four-block proof path, using the shape `完整事实入口` + one sentence.
- In that reminder, name what still belongs in the original article: amount, interview, chart, file detail, figures, source wording, or full context.
- Keep the main explanatory sections focused on AI Watchtower's own fact, impact, boundary, trend, reader-use, and next-check analysis.
- Keep the bottom source block as the complete audit trail with source name, type, status, `originalDependency`, proof boundary, and source link.

Do not move the media reminder into a large warning panel, repeat it before every paragraph, or let it replace the actual source-boundary fields. The goal is a quick scan cue: readers should know when they must open the original article, while still getting enough Chinese framing to decide why the signal matters.

## Mobile Readability Pass

A useful detail page should be easy to scan on a phone.

- Put the four-block fact, impact, boundary, and next-check briefing immediately after the 30-second summary, before the longer prose sections. A phone reader should not need to scroll through narrative paragraphs before seeing what happened, why it matters, what remains unproven, and what evidence to check next.
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
