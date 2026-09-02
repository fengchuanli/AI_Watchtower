# Topic Continuity Review Note

Use this note when a current edition mentions a topic that has appeared in earlier AI Watchtower editions. Its purpose is to help editors decide whether the latest topic signal is stronger, weaker, or repeated before writing `edition.topicContinuity`.

This is a cross-edition review aid, not a new reporting surface. Use only current and archived AI Watchtower fields, plus the source already being reviewed for the current item. Do not add fresh claims, hidden media details, or broad trend conclusions just because several articles point at the same theme.

## When To Use It

Run this check before publication when:

- A current `topicGroups[].id` also appears in recent archive editions, `trendNotes`, or prior `topicContinuity`.
- The current batch could make Agent, model, enterprise, policy, infrastructure, or developer-tooling coverage look more certain than the source evidence allows.
- The editor is tempted to write "趋势已确认", "持续加速", "行业共识", or "媒体多次报道已经证明" without naming a stronger source artifact.

Skip it when the topic is new to the archive, appears only as a background phrase, or has no current item-level source fact.

## Three-Way Continuity Decision

Choose one status for the editorial scratch note before writing public copy.

| Status | Use when | Public wording cue |
| --- | --- | --- |
| `stronger` | The current source adds a new official artifact, research result, filing, contract, audit, benchmark, regulator text, deployment log, customer metric, dataset, model/system card, or concrete scope expansion beyond the earlier topic mention. | `currentSignal` names the new evidence object; `signalDirection` says why the evidence is stronger; `stillUnproven` names the proof still missing. |
| `weaker` | The current source narrows, delays, disputes, corrects, fails to replicate, cancels, or lowers the earlier topic reading. | `signalDirection` says the older interpretation should be downgraded or narrowed, not merely "继续观察". |
| `repeated` | The current source repeats a similar media angle, vendor framing, product claim, or broad topic label without a new source-backed action. | Use archive context only; do not write it as trend confirmation or evidence strengthening. |

Do not mark a topic `stronger` only because several media reports, newsletters, podcasts, or secondary summaries repeat the same storyline. Repetition is not evidence strength unless the later source changes the artifact, actor, scope, metric, date, or accountable owner.

## Scratch Shape

Use this compact scratch note during the update run. It does not need to be stored in `data/news.json` unless a future schema adds a field for it.

```text
Topic continuity review
topic:
currentItemIds:
priorContext: archive edition, topic group, trend note, or prior topicContinuity note used as background
continuityStatus: stronger / weaker / repeated
whatChanged: exact current source-backed action, evidence object, scope change, correction, or repeated angle
readerMeaning: how a Chinese reader should use the topic movement
stillUnproven: official file, research artifact, filing, contract, audit, log, regulator text, dataset, benchmark, replication, or customer evidence still needed
publicCopyDecision: write topicContinuity / use archive context only / hold current item / downgrade topic note
```

## Writing `topicContinuity`

Keep public notes short and source-bounded.

- `topic` must match a current `topicGroups[].id`.
- `previousPattern` should name prior archive or continuity context without retelling old items.
- `currentSignal` should name the current source-backed fact or explicitly say it is a repeated angle.
- `signalDirection` should match the selected status: `增强`, `减弱`, or `重复`.
- `stillUnproven` must name the next evidence object or the smaller uncertainty that remains.
- Do not introduce a new source fact in `topicContinuity`; the fact must already exist in the current item fields.

Good shapes:

```text
stronger: 此前 policy 主题包含安全评测和数据治理背景；本期新增 system card、透明度报告或监管文件后，才能写成证据增强。仍需审计、执行记录和第三方复核确认效果。
repeated: 如果本期只是多家媒体继续讨论数据中心阻力，应写成重复背景；不能把报道次数当作政策趋势确认。
weaker: 如果后续监管文本缩小适用范围，`signalDirection` 应写成减弱或收窄，而不是继续沿用此前趋势判断。
```

## Stop Conditions

Hold or downgrade the continuity note when:

- The prior context comes only from a headline match and the editor cannot name the old source fact.
- The current source repeats a media or vendor narrative without official, research, filing, regulator, audit, metric, dataset, benchmark, log, contract, or customer-side proof.
- Explaining the continuity would require article structure, interviews, charts, paywalled body text, or long media paraphrase.
- The wording implies a topic trend is confirmed because several media items repeated it.
- `stillUnproven` says only "继续观察" instead of naming the next evidence object.

## Compact Log Note

Use this wording when the check is applied in a publication or optimization run:

```text
Topic continuity review: done - recurring topics were classified as stronger, weaker, or repeated before public continuity copy was written.
```
