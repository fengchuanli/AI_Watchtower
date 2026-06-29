# Candidate Hold And Reject Reasons

Use this vocabulary when `draftingDecision` or `priorityDecision` is `hold` or `reject`. The goal is to keep candidate triage readable, comparable, and safe: future editors should understand why a URL did not become current news without rereading the whole source page or inventing a new label every run.

Write the reason code in English for consistency, then add one short Chinese sentence that names the concrete blocker. Do not use these labels to hide uncertainty; if a blocker can be fixed by finding a better original source, use `hold` instead of `reject`.

## Hold Reasons

Use `hold` when the candidate may become useful after one specific gap is resolved.

| Code | Use when | Next editor action |
| --- | --- | --- |
| `hold-original-source-needed` | A media, community, or vendor item points to a fact that should be checked against an official announcement, filing, paper, regulator text, customer-side metric, or original dataset. | Search for the original source before drafting; if none appears, keep the media fact minimal or reject. |
| `hold-source-role-unclear` | The page exists, but it is unclear whether it is official confirmation, research original, media background, community lead, or vendor claim. | Classify the role using `docs/candidate-source-checklist.md`; register the source if needed. |
| `hold-duplicate-review` | The URL, title, company, or claim resembles a current or archived item, but may contain a fresh source fact. | Run the duplicate report and compare the exact new fact before deciding. |
| `hold-date-or-freshness-unclear` | The source date, update date, or batch freshness is unclear, especially for pages that keep changing without a visible timestamp. | Confirm publication/update timing or write a `freshSourceFact` reason. |
| `hold-proof-boundary-missing` | The candidate has an interesting claim, but the editor cannot yet state what the source does not prove. | Write the missing boundary and next independent check before scoring. |
| `hold-ai-relevance-weak` | The event is adjacent to business, chips, funding, politics, or labor, but the AI consequence is not yet clear. | Name the concrete model, workflow, policy, infrastructure, safety, or adoption consequence. |
| `hold-batch-balance` | The candidate is safe but would over-concentrate the current batch by source owner, source family, company, geography, evidence mode, or narrative angle. | Keep it for a later batch or replace the weakest concentrated item. |

## Reject Reasons

Use `reject` when the candidate should not enter current-news drafting unless a materially different source appears.

| Code | Use when | Why it should stop |
| --- | --- | --- |
| `reject-paywall-body-dependent` | The item needs paywalled, login-only, private, screenshot, or scraped body text for the central fact. | It violates the copyright and access boundary; only public title/source metadata is safe. |
| `reject-repeated-source-fact` | The candidate repeats an already published URL or source fact without a meaningful new update. | Reposting it would make the current feed stale and misleading. |
| `reject-stale-no-current-hook` | The source is old and has no fresh source-specific fact, update, or current reader decision. | It may belong in background research, not the current news batch. |
| `reject-routine-marketing` | The item is a routine product, webinar, award, partnership teaser, hiring note, or vendor narrative with no independent evidence path. | It adds promotional noise without enough reader value. |
| `reject-ai-relevance-too-weak` | The event may be technology, finance, politics, or business news, but the AI consequence remains speculative. | The site should not turn adjacent noise into AI news. |
| `reject-unverifiable-or-community-only` | The central fact depends on anonymous posts, unverifiable social screenshots, reposts, or forum discussion. | Community discussion can be a lead, not a published fact. |
| `reject-copyright-substitute-risk` | A media item would need article structure, interview detail, charts, or long paraphrase to be useful in Chinese. | It would become a substitute for the original article instead of AI Watchtower analysis. |

## Required Intake Wording

For every held or rejected candidate, write `decisionReason` as:

```text
<reason-code>: <one Chinese sentence naming the concrete missing proof, duplicated fact, freshness problem, copyright blocker, or weak AI consequence>.
```

Examples:

- `hold-original-source-needed: 这条报道涉及客户采用效果，但目前还缺客户侧指标或官方案例页。`
- `hold-duplicate-review: 标题接近 2026-06-25 晚间版 Anthropic 条目，需要先确认是否有新的来源事实。`
- `reject-paywall-body-dependent: 中心事实只能从付费正文获得，不能安全改写成本站内容。`
- `reject-ai-relevance-too-weak: 这是一般融资消息，尚未说明具体模型、算力、产品或监管影响。`

## Relationship To Other Workflow Docs

- Use `docs/candidate-source-checklist.md` first to identify hard stops such as paywall, login-wall, unclear source role, duplicate risk, and missing proof boundary.
- Use `docs/candidate-intake-format.md` to record the final `draftingDecision` and `decisionReason`.
- Use `docs/candidate-priority-rubric.md` only after source safety is settled; a rejected candidate should not be rescued by a high priority score.
- Use `docs/copyright-safety.md` whenever a media item cannot be useful without copying source structure, interview details, charts, or long background.

The reason vocabulary is deliberately small. Add a new code only when repeated real candidates cannot be described by the existing labels.
