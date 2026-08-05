# Vendor Narrative Promotion Rule

Use this rule before a vendor-authored story, customer case, benchmark page, policy proposal, or company-written outcome narrative enters the homepage TOP3 or any first-screen card position.

The goal is not to ban vendor sources. It is to stop vivid stories from outranking better-supported AI signals when the visible homepage copy does not show the proof gap.

## Promotion Gate

Promote a vendor narrative only when all of these are true:

- The item has a concrete AI event, product, policy, benchmark, deployment, or operational claim that matters to Chinese readers.
- `sourceRole` is `厂商主张` unless the linked page directly verifies a stronger source category such as official release fact, research original, regulator action, filing, or customer-side document.
- The first-screen card copy names the independent proof path, not only the vendor's own framing.
- `nextCheck`, `evidenceThreshold`, `claimBoundary`, and `counterEvidence` all keep the same proof boundary instead of letting the card sound more certain than the detail page.

For this rule, first-screen card copy means fields a reader sees or uses before opening the detail page: `summary`, `whyItMatters`, `whyRanked`, `topReason`, `readerUse`, and `nextCheck`.

## Required First-Screen Shape

At least one first-screen reason field should explicitly name the missing independent proof:

- customer-side metric, deployment log, procurement record, contract, filing, audit, or regulator text
- third-party benchmark, reproduction, paper, dataset, code, or expert review
- original source from the customer, government, lab, platform, or affected organization

Good shape:

```text
读者可用它列出要核对的客户侧部署指标、第三方 benchmark 和合同/filing。
```

Bad shape:

```text
这家公司展示了一个很有代表性的 AI 落地故事。
```

The bad shape may be a true description of the vendor page, but it does not tell homepage readers what remains unproven.

## Scoring Rule

`selectionScore.narrativeStrength` can reward a clear storyline, but it cannot compensate for weak proof. If `evidenceQuality` is lower than 3, do not promote the item. If the story is vivid and proof is still vendor-only, keep it below TOP3 unless the visible copy names the independent evidence readers should check next.

## Rewrite Or Hold

When a vendor item fails the gate, choose one action:

- Rewrite the first-screen fields so the card says what independent proof is missing.
- Move the proof path from `evidenceThreshold` into `nextCheck` and one visible reason field.
- Keep the item in the normal feed if it is useful but not TOP3-ready.
- Hold or reject the item when the source cannot support a concrete event, reader use, and next independent check.

## Stop Conditions

Do not publish or promote when:

- The card sounds like confirmed adoption, ROI, safety, customer success, clinical effect, legal status, or benchmark superiority but the source is only vendor-authored.
- The independent proof path appears only in a hidden detail section and not in first-screen card copy.
- The copy relies on vivid adjectives, customer-story drama, or vendor benchmark language instead of naming what readers can verify next.

Compact log wording:

```text
vendor-narrative-promotion: checked - promoted vendor items name independent proof in first-screen copy.
```
