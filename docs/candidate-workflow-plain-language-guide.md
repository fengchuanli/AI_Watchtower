# Candidate Workflow Plain-Language Guide

Use this guide when an editor has several possible AI news links and needs to decide, in plain Chinese, what can become the next homepage update. It is the readable path through the candidate workflow; the more detailed field names still live in the checklist, intake record, priority rubric, source-diversity note, original-source guide, and handoff checklist.

The goal is simple: do not ask a non-technical editor to think in schema names first. Ask them to make six editorial decisions in order.

## Six Editor Questions

### 1. What exactly happened?

Write one short Chinese sentence that only says what the source directly supports. If the sentence needs phrases like "可能", "据说", "有人认为", or "业内预计", stop and decide whether the source is only a lead.

Good enough:

- 某公司发布了一个模型、产品、政策、论文、文件、价格、合作或安全说明。
- 某媒体公开报道了一个仍待官方确认的动作。

Not good enough:

- 只是一段热闹讨论、二手转述、截图、长篇观点或没有新事实的营销内容。

### 2. Why should a Chinese AI reader care today?

Name the reader decision, not just the topic. The candidate is stronger when it helps someone decide what tool to try, what risk to watch, what policy may change, what cost or infrastructure signal matters, or which company/topic deserves follow-up.

If the answer is only "这是 AI 公司新闻", hold it with `hold-ai-relevance-weak` until the consequence is clearer.

### 3. What does the source prove, and what does it not prove?

Separate source fact from conclusion:

- "It proves" should be short and tied to the source page.
- "It does not prove" should block overclaiming, such as performance, adoption, legality, customer value, safety, market share, or government action.

If the boundary cannot be written in one sentence, hold it with `hold-proof-boundary-missing`.

### 4. Is this the right source to use?

Prefer the source closest to the fact:

1. Official announcement, documentation, changelog, status page, paper, filing, regulator text, benchmark, dataset, model card, system card, customer-side page, or public contract record.
2. Reliable media only when it is the public source for a limited reported signal.
3. Community or social discussion only as a lead, not as current news.

For media-started candidates, first ask: "Should this have an official, filing, paper, regulator, customer-side, dataset, or benchmark original?" If yes, search for that original before drafting. If no original exists but the media item is still useful, keep it visibly marked as `媒体背景`, keep the source fact short, and use `originalDependency: "must-read"`.

### 5. Is it safe and fresh enough for this batch?

Before drafting, check four stops:

- Access: the central fact must not depend on paywalled, login-only, private, scraped, or screenshot-only body text.
- Duplicate: the URL and source fact must not already be current or archived unless there is a fresh source-specific update.
- Freshness: an old page needs a current update reason, not just a newly discovered old link.
- Batch mix: if too many safe candidates say the same thing from the same owner, source family, evidence mode, company, geography, or narrative angle, hold the weakest repeated one or publish a shorter batch with a clear caveat.

Do not fill a weak batch with thin links. A shorter honest batch is better than a noisy batch.

### 6. What should happen next?

Choose one of three outcomes:

- `draft`: the source fact, reader value, proof boundary, next check, duplicate status, and copyright posture are all clear.
- `hold`: one named gap can be fixed later, such as source role, original source, date, duplicate review, proof boundary, AI relevance, or batch balance.
- `reject`: the candidate depends on unsafe access, repeats an old fact, is stale, is routine marketing, has weak AI relevance, is unverifiable, or would become a Chinese replacement for a source article.

For `hold` or `reject`, use the existing reason code and one Chinese sentence. The sentence should name the actual blocker, not repeat the code.

## Plain-Language Intake Note

An editor can write this short note before filling the structured record:

```text
发生了什么：<一句来源直接支持的事实>
为什么今天值得看：<一句中文读者判断>
来源证明了什么：<一句能确认的内容>
来源没有证明什么：<一句边界>
还要看哪里：<官方/文件/论文/监管/客户侧/审计/benchmark/复现/第二来源>
这批怎么处理：draft / hold / reject，原因：<原因代码 + 一句具体中文说明>
```

After this note is clear, map it into `docs/candidate-intake-format.md` and then use `docs/candidate-to-news-handoff.md` for `data/news.json` drafting.

## Stop Before Writing Public Copy

Stop before drafting when any of these are true:

- The editor would need to translate or paraphrase source paragraphs to make the item useful.
- The media article's interview details, charts, or background are the main value.
- The proof boundary sounds vague, such as "还要继续观察".
- The next check does not name a concrete source, document, metric, audit, benchmark, dataset, filing, regulator text, replication, or customer-side signal.
- The candidate only increases noise in a batch that is already concentrated.

Public copy should be the last step. The editor first decides what happened, why it matters, what is unproven, which source is safest, whether the batch remains balanced, and whether the item deserves `draft`, `hold`, or `reject`.
