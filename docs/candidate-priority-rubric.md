# Candidate Priority Rubric

Use this rubric after a candidate passes `docs/candidate-source-checklist.md` and has a lightweight intake record in `docs/candidate-intake-format.md`. Its job is to decide which safe candidates deserve the limited current-news slots first.

The rubric does not replace editorial judgment. It makes that judgment explicit, so a batch does not promote the loudest vendor story, the newest headline, or the easiest source when another candidate is more useful to Chinese readers.

## Scoring Fields

Score each field from 0 to 2. A normal daily batch should draft the highest total score first, then check whether the final mix still has enough source and topic diversity.

| Field | 0 points | 1 point | 2 points |
| --- | --- | --- | --- |
| Reader utility | Mostly interesting to insiders, investors, or one vendor audience. | Helps a clear reader group understand one AI product, policy, workflow, or market signal. | Helps non-specialist Chinese readers make a near-term judgment about tools, work, risk, regulation, cost, or learning priorities. |
| Evidence strength | Depends on community talk, marketing narrative, unclear source role, or one unconfirmed media line. | Has a registered official, research, regulator, or reliable-media source, but needs a clear next check before stronger claims. | Has an original official, research, regulator, filing, paper, benchmark, or first-party document that directly supports the central fact. |
| Novelty | Repeats an archived URL, old narrative, or routine product/marketing update without a fresh source fact. | Adds a new source fact to a familiar company, topic, or trend. | Changes the reader's understanding of an AI capability, constraint, adoption pattern, market structure, safety issue, or policy path. |
| Source diversity | Would deepen an already concentrated source owner, source family, or narrative angle in the current batch. | Uses a familiar source family but adds a different company, topic, geography, or evidence mode. | Adds a different source owner, evidence mode, geography, or topic that balances the batch. |
| Copyright safety | Needs paywall/login body text, article structure, interview detail, chart detail, or long paraphrase to be useful. | Can be drafted from a minimal fact plus original AI Watchtower analysis, but needs a `must-read` source reminder. | Can be explained with concise source facts and mostly original analysis without replacing the source article. |

## Decision Bands

- `8-10`: Draft first if it also passes duplicate and source-concentration checks.
- `5-7`: Draft only if the batch needs this topic, source type, or reader group; otherwise hold for a better source.
- `3-4`: Hold unless it fills a critical gap and the proof boundary can be written plainly.
- `0-2`: Reject or keep as a private lead, because it is not ready for current-news treatment.

Do not let a high total score override a hard stop from the candidate-source checklist. Paywall/body dependence, unresolved duplicate status, unclear source role, or missing proof boundary still blocks drafting.

## Tie Breakers

When two candidates have similar scores, prefer the one that:

- Gives Chinese readers a clearer action or watch point today.
- Uses an original source over a media retelling, unless the media item is the only public evidence and can stay minimal.
- Reduces batch concentration across source owner, source family, geography, company, and narrative angle.
- Names a concrete next independent check.
- Can be drafted without copying source wording, structure, charts, or interview detail.

## Intake Record Addition

For batch work, add this compact note beside each intake record before drafting:

```json
{
  "priorityScore": 7,
  "priorityReason": "读者效用高，证据来自官方文档；但同批已有两个厂商来源，需保留来源集中度提示。",
  "priorityDecision": "draft"
}
```

Use `priorityDecision` values `draft`, `hold`, or `reject`. The value should match the rubric, not just the editor's interest in the topic.

## Batch Mix Check

Before drafting the final current-news set, scan the top-scoring candidates together:

1. If all top candidates come from one source owner or source family, hold the weakest one and look for an independent source type.
2. If all top candidates share the same proof mode, such as vendor claims or media reports, prepare a source caveat or choose a lower-scoring official/research/regulator item.
3. If a lower-scoring candidate gives ordinary readers a clearer "what should I watch now?" answer, it may outrank a more technical but less useful item.
4. If a candidate only wins because it is recent, hold it until the source-backed fact and AI relevance are stronger.

The goal is not numerical precision. The goal is to make the homepage news set useful, balanced, and defensible before Chinese copy is written.
