# Candidate Source Checklist

Use this checklist before a semi-automated news run promotes a discovered URL into `data/news.json`. It is a gate for source candidates, not a replacement for the lightweight intake record in `docs/candidate-intake-format.md`, the priority ranking in `docs/candidate-priority-rubric.md`, or `docs/editorial-checklist.md` after drafting.

## 1. Candidate Identity

- Record the candidate URL, source name, source owner, source type, publication time, and discovery route.
- Match the source to `data/sources.json` before drafting. If it is not registered, add or skip the source deliberately instead of using a vague fallback.
- Prefer the exact article, announcement, paper, filing, changelog, or policy page over a source homepage or search result.
- Reject candidates that require paywall, login-wall, private channel, scraped screenshot, or unverifiable social repost access for the central fact.

## 2. Source Role

Choose one source role before summarizing:

- `官方核对`: the source directly verifies a company, product, policy, release, filing, or documentation fact.
- `研究原文`: the source is a paper, preprint, benchmark, dataset, or research note that supports a technical signal.
- `媒体背景`: the source supplies limited background and must not become a Chinese replacement for the article.
- `社区发现`: the source only points to a possible lead and needs official, research, regulator, or reliable-media confirmation before promotion.
- `厂商主张`: the source is vendor-authored narrative, customer story, benchmark framing, or policy proposal and needs independent proof before becoming a stronger conclusion.

If the source role is unclear, hold the candidate as a research note and do not publish it as a current item.

## 3. Minimum Evidence

Before promotion, confirm that the candidate has all of the following:

- A concrete event or claim that can be written in one sentence without adding speculation.
- A publication or update timestamp that fits the current batch, or a `freshSourceFact` reason if the underlying event is older than seven days.
- A clear AI consequence: model capability, agent workflow, infrastructure, policy, enterprise adoption, developer tooling, funding, compute, safety, or market structure.
- A source boundary explaining what this candidate does not prove.
- A next-check target such as official documentation, customer-side metric, regulator text, filing, audit result, code release, dataset, replication, independent benchmark, or follow-up source owner.

Skip candidates that are routine marketing, repeated coverage of an already archived URL, shallow commentary without a new source fact, or claims that cannot support a detail-page briefing.

## 4. Copyright And Paywall Safety

- Never fetch or summarize paywall or login-wall body text.
- For media sources, keep the source fact to the minimum needed: who acted, what happened, when, and the relevant object or amount.
- Do not copy article structure, interview details, charts, or long background sections into prompts or drafts.
- Set media-sourced items to `originalDependency: "must-read"` unless a stronger original source replaces the media as the central evidence.
- Keep original links as verification references, not the main reading experience.

## 5. Duplicate And Concentration Checks

- Check `data/news-history.json` for the normalized source URL before publishing.
- Check for near-matching Chinese or English titles before treating a candidate as new.
- For a batch of semi-automated candidates, write the discovered `title`, `sourceUrl`, and optional `publishedAt` values into a temporary JSON file and run `node scripts/report-duplicate-candidates.mjs <candidate-file.json>` before drafting. Treat any repeated URL or near-title match as a hold signal until the editor confirms a genuinely new source fact.
- If one source owner supplies most of the batch, prepare a `sourceConcentration` caveat and name the independent owner or source type to check next.
- Do not republish old archive items as current news unless a fresh source-specific fact changes the editorial value.

## 6. Drafting Handoff

Only hand a candidate to drafting when it can answer these six prompts:

1. What source-backed fact happened?
2. Why should a Chinese AI reader care today?
3. What does the source prove, and what does it not prove?
4. What evidence would upgrade the claim?
5. What evidence would weaken or downgrade the claim?
6. Which original source link should readers use for full context?

Before drafting, capture those answers in `docs/candidate-intake-format.md` terms: `sourceBackedFact`, `aiRelevance`, `proofBoundary`, `nextIndependentCheck`, `duplicateStatus`, `copyrightPosture`, `draftingDecision`, and `decisionReason`. When a batch has more candidates than current-news slots, use `docs/candidate-priority-rubric.md` to rank safe candidates by reader utility, evidence strength, novelty, source diversity, and copyright safety before drafting order is chosen. After drafting, run `docs/editorial-checklist.md` and `node scripts/validate-data.mjs` before committing.
