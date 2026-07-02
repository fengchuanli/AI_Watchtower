# Source Diversity Triage Note

Use this note after a candidate batch has passed the hard source, copyright, duplicate, and original-source checks, but before drafting the final `data/news.json` items. Its job is to stop a safe batch from becoming a one-sided batch.

This note sits after `docs/candidate-priority-rubric.md` and before `docs/candidate-to-news-handoff.md`: first score safe candidates, then check whether the group is too concentrated by source owner, source family, company, geography, evidence mode, or narrative angle.

## When To Trigger The Note

Run the source-diversity triage when any of these are true:

- One source owner supplies half or more of the draftable candidates.
- One source family, such as vendor blogs, reliable media, research preprints, regulator texts, or community leads, supplies most of the batch.
- The top candidates all support the same narrative angle, such as one vendor winning, one model class accelerating, one policy direction tightening, or one infrastructure bottleneck dominating.
- The batch has enough safe candidates, but the current homepage would make readers overread a single company, country, evidence mode, or market story.

This is a batch-level check, not a reason to punish a strong individual source. A concentrated batch may still publish when the concentration itself is the honest news, but the page must say that clearly.

## Triage Decision

Choose one decision before drafting:

| Decision | Use when | Editor action |
| --- | --- | --- |
| `balance-draft` | The batch has enough variation across source owners, evidence modes, topics, and reader groups. | Draft normally and keep normal source boundaries. |
| `draft-with-caveat` | The concentration is real and newsworthy, or no stronger diverse candidate passed safety gates. | Draft the best items, add or preserve an edition-level `sourceConcentration` or source-risk caveat, and name the independent source type to check next. |
| `hold-for-balance` | A safe candidate would make the batch too repetitive while another safe candidate adds useful variation. | Mark the weaker concentrated candidate with `hold-batch-balance` and draft the balancing candidate first. |
| `publish-short-batch` | Too few diverse candidates passed safety gates, and adding weak items would lower trust. | Publish fewer items, record the shortage in the edition/log, and do not pad with duplicates, community-only leads, or thin media retellings. |

## Practical Swap Rules

When deciding which candidate to hold, prefer keeping the item that:

- Gives Chinese readers the clearest near-term judgment.
- Has an original official, research, regulator, filing, paper, dataset, benchmark, or customer-side source.
- Reduces dependence on media reports or vendor-authored narratives.
- Adds a different reader group, such as developers, enterprise buyers, policy watchers, students, researchers, or ordinary tool users.
- Names a concrete next independent check instead of repeating the same caveat as the rest of the batch.

Do not swap in a lower-quality candidate only for variety. Source diversity improves the batch only when the replacement still has a source-backed fact, clear AI relevance, proof boundary, duplicate clearance, and copyright-safe drafting path.

## Intake Wording

When the batch is concentrated, add a short `batchDiversityNote` beside the candidate records or update `priorityReason`:

```json
{
  "batchDiversityNote": "同批候选 6 条里有 4 条来自厂商博客，且都在强化模型能力叙事；保留最有读者效用的 2 条，另找研究、监管或客户侧来源平衡。",
  "priorityDecision": "hold",
  "decisionReason": "hold-batch-balance: 这条候选安全但会加重同一厂商叙事，先等待不同来源类型补位。"
}
```

For `draft-with-caveat`, keep the warning reader-facing:

```text
本批候选主要来自同一来源家族，因此只能说明这一类公开信号正在集中出现；还需要官方文件、客户侧指标、监管文本、独立 benchmark 或研究复现来确认趋势强度。
```

## Final Batch Questions

Before handing items to `docs/candidate-to-news-handoff.md`, answer these questions in Chinese:

1. If a reader only sees this batch, will they mistake one owner or one narrative for the whole AI market?
2. Which safe candidate adds the most new source owner, evidence mode, topic, geography, or reader group?
3. Which safe candidate mainly repeats the same source family or conclusion?
4. Does the batch need an explicit `sourceConcentration` caveat, or should the weakest repeated candidate be held?
5. If the batch stays short, what exact safety gate blocked the missing diversity?

The goal is not artificial balance. The goal is to make the published homepage honest about what the sources can and cannot show.
