# Company Continuity Review Note

Use this note when a current edition mentions a company that has appeared in earlier AI Watchtower editions. Its purpose is to help editors decide whether the latest company signal is stronger, weaker, repeated, or resolved before writing `edition.companyContinuity`.

This is a cross-edition review aid, not a new reporting surface. Use only current and archived AI Watchtower fields, plus the source already being reviewed for the current item. Do not add fresh claims, hidden article details, or broad trend conclusions just because the same company appears often.

## When To Use It

Run this check before publication when:

- A company appears in current `items[].companies` and was also visible in recent archive editions, tag pages, `trendNotes`, or prior `companyContinuity`.
- The current item could look like a continuation of an older OpenAI, Anthropic, Google, Microsoft, NVIDIA, Meta, xAI, Amazon, or other recurring-company storyline.
- The editor is tempted to write "继续推进", "再次强化", or "持续加速" without naming what changed in the source evidence.

Skip it when the company is new to the archive, appears only as background in a media paragraph, or has no current item-level source fact.

## Four-Way Continuity Decision

Choose one status for the editorial scratch note before writing public copy.

| Status | Use when | Public wording cue |
| --- | --- | --- |
| `stronger` | The current source adds a new official artifact, filing, model card, product page, customer metric, audit, benchmark, regulator text, deployment log, or concrete scope expansion beyond the earlier mention. | `本期变化` names the new artifact or scope, and `stillUnproven` says what still blocks a stronger conclusion. |
| `weaker` | The current source narrows, delays, disputes, corrects, cancels, fails to replicate, or otherwise lowers the older reading. | `本期变化` says the earlier interpretation should be downgraded or narrowed, not merely "继续观察". |
| `repeated` | The current source repeats a similar company claim, product framing, media angle, or topic without a new source-backed action. | Use archive/tag context only; do not promote it as a fresh company trend unless another current source fact exists. |
| `resolved` | A later official file, regulator text, court record, audit, model/system card, customer metric, benchmark, or company statement answers a previous open question. | Say which previous question is now answered, and move any remaining uncertainty into a smaller `stillUnproven` boundary. |

Do not mark a signal `stronger` only because the same company appears in several editions. Repetition is not evidence strength unless the later source changes the artifact, actor, scope, metric, date, or accountable owner.

## Scratch Shape

Use this compact scratch note during the update run. It does not need to be stored in `data/news.json` unless a future schema adds a field for it.

```text
Company continuity review
company:
currentItemId:
priorContext: archive edition, tag page, or previous companyContinuity note used as background
continuityStatus: stronger / weaker / repeated / resolved
whatChanged: the exact current source-backed action, scope change, correction, or answer
readerMeaning: how a Chinese reader should use the change
stillUnproven: artifact, metric, filing, audit, log, regulator text, dataset, benchmark, replication, or customer evidence still needed
publicCopyDecision: write companyContinuity / use archive context only / hold current item / update resolved note
```

## Writing `companyContinuity`

Keep public notes short and source-bounded.

- `company` must match a company in current `items[].companies`.
- `lastMention` should name the prior archive, tag, or continuity context without retelling the old item.
- `whatChanged` should reflect the four-way decision: stronger, weaker, repeated, or resolved.
- `stillUnproven` must name the next evidence object or say what smaller uncertainty remains after a resolved check.
- Do not introduce a new source fact in `companyContinuity`; the fact must already exist in the current item fields.

Good shapes:

```text
stronger: 此前 OpenAI 多次出现医疗和企业入口信号；本期变化是 ChatGPT Healthcare 以 EHR 连接和护理流程作为更具体入口。仍需临床审计、权限日志、客户指标和监管材料证明效果。
repeated: 此前 Anthropic 已多次把 Claude 放进企业安全和权限语境；本期如果只是重复厂商采用叙事，应放回归档背景，不能写成采用趋势增强。
resolved: 此前等待 Debian 是否给 LLM 辅助贡献明确规则；若本期已有正式投票结果或维护者规则，就写清哪个问题被回答，并保留执行记录作为未证实边界。
```

## Stop Conditions

Hold or downgrade the continuity note when:

- The prior context comes only from a headline match and the editor cannot name the old source fact.
- The current source repeats a vendor claim without independent metric, audit, filing, regulator text, or customer-side proof.
- A media report would require article structure, interviews, charts, or paywalled body text to explain the continuity.
- The wording implies a company trend is confirmed only because several archive entries share the same company name.
- `stillUnproven` says only "继续观察" instead of naming the next evidence object.

## Compact Log Note

Use this wording when the check is applied in a publication or optimization run:

```text
Company continuity review: done - recurring companies were classified as stronger, weaker, repeated, or resolved before public continuity copy was written.
```
