# Next Check Retirement Note

Use this note when a later edition, archived follow-up, official page, filing, audit, metric, regulator text, customer-side record, replication, or third-party test answers an older `nextCheck`, `evidenceThreshold`, or `followUpQuestions` prompt. Its purpose is to keep AI Watchtower's continuity useful: readers should see what still needs checking now, not an ever-growing list of questions that later evidence already resolved, weakened, or made irrelevant.

This is not a license to erase uncertainty. Retire only the old question that has a newer source-backed answer, then move any remaining uncertainty into a sharper current question.

## When To Use It

Use this review before publishing a current edition or archive correction when:

- A later official announcement, company statement, SEC or regulator filing, court record, policy text, audit note, customer metric, deployment log, benchmark rerun, released code/data, peer review, or independent test appears for a previously listed next check.
- A recurring company or topic has a newer continuity note that repeats an old question without saying what changed.
- `nextCheck` still asks for evidence that already exists in a later current or archived edition.
- `followUpQuestions` name an old artifact, date, funding status, rollout status, approval step, benchmark, or incident follow-up that later evidence has answered.

## Retirement Decision

Classify the old question before changing public copy.

| Decision | Use when | Public copy action |
| --- | --- | --- |
| `retire-resolved` | Later source-of-record evidence answers the old question. | Remove the old question and, if useful, mention the resolved status in continuity or archive background. |
| `retire-replaced` | A stronger artifact supersedes the old evidence path. | Replace the old source target with the stronger official, filing, audit, metric, or third-party proof path. |
| `retire-downgraded` | Later evidence weakens or refutes the old premise. | Move the result into `counterEvidence` or continuity copy, then write the next check around the new lower-confidence status. |
| `keep-open` | Later evidence is partial, same-owner, unverifiable, or only repeats the same claim. | Keep the question, but narrow it to the missing artifact, metric, region, customer, task, date, or independent source. |

## Field Updates

When a stale prompt is retired, update the smallest necessary fields:

- `nextCheck`: remove answered evidence requests; name the current unresolved artifact or observable result.
- `followUpQuestions`: keep at least two concrete questions, but make them about current missing proof rather than old already-answered artifacts.
- `evidenceThreshold`: if the old upgrade path has appeared, either upgrade the editorial status or name the stronger evidence still missing.
- `counterEvidence`: if later evidence weakened the premise, say whether the story is `降级`, `下调`, `削弱`, `收窄`, or `限定`.
- `companyContinuity` / `topicContinuity`: summarize that a previous check was resolved, replaced, downgraded, or remains open without presenting archive background as a new alert.

## Good Shapes

```text
retire-resolved：旧问题要求核对 SEC 文件；后续 8-K 已公开。删除旧问题，改问监管批准和交割时间是否更新。
```

```text
retire-replaced：旧问题要求等待媒体后续；公司公告已出现。改用公司公告、监管文件或客户日志作为下一步证据。
```

```text
retire-downgraded：旧问题假设 rollout 会扩大；后续状态页显示暂停。把判断下调为受限上线，再检查恢复公告、错误率和客户影响。
```

```text
keep-open：后续只有同一厂商博客重复性能说法。保留问题，但改成第三方 benchmark、客户指标和审计报告是否出现。
```

## Stop Conditions

Do not retire a question when:

- The later evidence only repeats the same media report, vendor claim, community post, or unverifiable summary.
- The old question asked for independent proof and the later artifact is still from the same interested party.
- The new evidence answers a different scope, region, feature, customer, date, model, policy, or metric.
- Retiring the question would make a reported or vendor-claim item look confirmed without updating `claimStatus`, `sourceRole`, `claimBoundary`, and `counterEvidence`.

The review is complete only when the next editor can tell which old question was answered, which evidence answered it, and what still needs checking now.
