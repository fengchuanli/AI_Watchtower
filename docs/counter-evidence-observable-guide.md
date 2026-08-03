# Counter-Evidence Observable Outcome Guide

Use this guide when writing or reviewing `counterEvidence` in `data/news.json` and the latest `data/news-history.json` snapshot. Its job is to keep downgrade signals useful for Chinese readers: a reader should know what later evidence would make AI Watchtower narrow, weaken, or reverse the current judgment.

`counterEvidence` is not the same as `nextCheck` or `evidenceThreshold`.

- `nextCheck` says what to look at next.
- `evidenceThreshold` says what would upgrade the item.
- `counterEvidence` says what would downgrade, narrow, or weaken the current editorial reading.

## When To Name An Observable Outcome

Prefer a concrete observable outcome instead of another document when the claim is about real-world effect, adoption, deployment, safety, performance, cost, or policy implementation.

Use an observable outcome when the downgrade would be visible in behavior or measurement, such as:

- 产品发布后没有按时交付、地区范围很窄，或功能只停留在演示阶段。
- 客户采用、留存、收入、搜索流量、任务完成率、错误率、延迟或成本指标不支持来源叙述。
- 第三方复测、真实设备测试、访问日志、公开运行日志、红队样本或事故记录显示结果不可复现。
- 监管执行、审批通过、采购落地、法院进展或政策适用范围没有出现。
- 用户反馈、客户工单、审计记录或安全事件显示治理能力不足。

Good shape:

```text
如果客户侧采用指标、任务日志或第三方复测显示收益消失，应下调为早期试点信号。
```

This is useful because the reader can later check a measurable result, not just wait for another article.

## When A Document Is Enough

A document, filing, announcement, paper, regulator text, or contract can be the right downgrade signal when the current claim is mainly about whether a stated fact exists.

Use a source artifact when the downgrade depends on:

- 官方否认或修正文案。
- 监管文件、法院文件、采购合同、财报、政策文本或论文附录给出不同范围。
- 公司角色、发布时间、产品范围、适用地区、融资条款或参与方身份需要确认。
- 原始数据、代码、模型卡、系统卡或 benchmark 脚本缺失。

Good shape:

```text
如果监管文件或采购合同显示适用范围更窄，应下调为单一地区试点信号。
```

## Mixed Claims

Many AI Watchtower items contain both a document fact and an outcome claim. In those cases, write `counterEvidence` with both parts, but keep the sentence short.

Use this pattern:

```text
如果[来源文件/官方材料]显示范围更窄，或[可观察结果]不支持效果，应下调为[更弱状态]。
```

Examples:

- 如果官方发布范围更窄，或客户侧任务日志显示错误率仍高，应下调为受限试点。
- 如果论文附录确认样本偏置，或第三方复测无法重现主要结果，应下调为方法探索。
- 如果政策文本没有执行细则，或审批和采购记录长期缺失，应下调为政策意向。

## Bad Shapes

Avoid `counterEvidence` that only says:

- 继续关注后续消息。
- 等待更多证据。
- 如果没有新报道。
- 需要进一步确认。
- 后续文件将决定判断。

These phrases do not tell readers what would change the judgment. Replace them with the exact document, metric, log, record, deployment state, retest, user outcome, or official action that would matter.

## Stop Conditions

Do not publish or promote the item until `counterEvidence` is rewritten when:

- The field only names a supportive next source and never says what would downgrade the judgment.
- The claim is about adoption, performance, safety, cost, deployment, or policy effect but the downgrade signal names only "another report."
- The downgrade action is missing: `下调`, `收窄`, `削弱`, `降低`, `降级`, or `限定`.
- A reader cannot tell what evidence to check in the next edition.

The field is complete when it names a condition, a concrete artifact or observable outcome, and the weaker editorial status that should replace the current judgment.
