# Source Diversity Triage Note

Use this note after a candidate batch has passed the hard source, copyright, duplicate, and original-source checks, but before drafting the final `data/news.json` items. Its job is to stop a safe batch from becoming a one-sided batch.

This note sits after `docs/candidate-priority-rubric.md` and before `docs/candidate-to-news-handoff.md`: first score safe candidates, then check whether the group is too concentrated by source owner, source family, company, geography, evidence mode, or narrative angle.

After the current edition has been archived, use `docs/source-concentration-archive-review-note.md` to inspect repeated `sourceRisk`, `sourceConcentration`, and `overreadBoundary` caveats across recent editions. If the same warning keeps returning, turn it into a standing rule here, in `docs/news-data-format.md`, or in the relevant validator instead of relying on batch-by-batch prose.

## When To Trigger The Note

Run the source-diversity triage when any of these are true:

- One source owner supplies half or more of the draftable candidates.
- TechCrunch, Axios, one vendor blog, or one research feed supplies three or more draftable candidates in a normal 8-to-12 item batch.
- One source family, such as vendor blogs, reliable media, research preprints, regulator texts, or community leads, supplies most of the batch.
- The top candidates all support the same narrative angle, such as one vendor winning, one model class accelerating, one policy direction tightening, or one infrastructure bottleneck dominating.
- The batch has enough safe candidates, but the current homepage would make readers overread a single company, country, evidence mode, or market story.

This is a batch-level check, not a reason to punish a strong individual source. A concentrated batch may still publish when the concentration itself is the honest news, but the page must say that clearly.

## Common Owner Concentration Review

Use this quick review before final ranking when the draft list leans on a familiar source owner. The goal is to decide whether concentration changes the reader frame, not to hide useful items from strong sources.

| Dominant owner or feed | Main overread risk | Review action |
| --- | --- | --- |
| TechCrunch | Readers may mistake startup/product/funding velocity for the whole AI market. | Keep the strongest product, funding, or developer-tooling facts, then look for official docs, filings, customer-side metrics, regulator texts, or non-startup sources before filling more slots. |
| Axios | Readers may overread policy, deal, election, or executive radar as confirmed organization change. | Keep media facts minimal, label them as radar/background, and name the official, filing, regulator, company, or data source that would confirm the trend. |
| One vendor | A vendor-authored release, benchmark, customer story, or policy proposal may sound like independent proof. | Treat the source as `厂商主张` unless it directly owns a narrow official fact; require third-party benchmark, customer-side metric, contract, audit, filing, regulator, or original data before upgrading the conclusion. |
| One research feed | Several papers or benchmark notes may look like field consensus even when they share lab incentives or methods. | Keep method limits visible, prefer replicated results or independent datasets, and say whether the batch is research exploration rather than deployment evidence. |

If the owner stays dominant after review, add or preserve `edition.sourceConcentration` / `sourceRisk` and write the caveat as a reader instruction: what the source owner can show, what it cannot prove, and which independent owner or source type should be checked next.

Archive reviews in September 2026 showed three caveats returning across adjacent editions: official/technical releases can verify publication and access but not effects, media-heavy batches are radar rather than confirmation, and repeated single-owner feeds should trigger a balance search even when they stay below two thirds. Treat those as default posture checks before final ranking.

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
