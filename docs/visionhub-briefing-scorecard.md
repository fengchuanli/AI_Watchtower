# VisionHub Briefing Scorecard

Use this scorecard before changing homepage structure, TOP3 cards, mobile reading order, detail-page entry points, or public continuity components. It keeps the VisionHub-style direction tied to AI Watchtower's own editorial purpose: a calm Chinese AI briefing that explains what changed, why it matters, what is still uncertain, and where to verify the original facts.

This scorecard does not add facts and does not replace `docs/homepage-edition-preflight.md`. Use it before visual or content-structure work, then use the preflight before publishing a concrete `data/news.json` edition.

## Scorecard

Rate each line as `pass`, `partial`, or `fail` before editing.

| Check | Pass condition |
| --- | --- |
| `fiveSecondUnderstanding` | A phone reader can say what changed today from the hero, today briefing, and TOP3 titles without reading process notes. |
| `top3ReaderUse` | Each TOP3 card names why the item matters now, who should care, and the next evidence path without becoming a long detail page. |
| `sourceBoundaryVisible` | Official, research, regulator, vendor, media, or community status is visible early enough to prevent overreading. |
| `originalSourceDependency` | Media-backed or `must-read` items still make the original article necessary for full facts, interviews, charts, and context. |
| `mobileBurden` | The first 1 to 3 minutes prioritize today's change, TOP3, and compact latest highlights before internal workflow language. |
| `continuityUse` | Repeated companies or topics help readers tell stronger, weaker, repeated, or resolved signals apart without inventing new claims. |
| `visualAidPurpose` | Any timeline, number card, actor map, ranking cue, or diagram clarifies the story rather than decorating the page. |

## Compact Note Shape

Use this shape in an optimization log when the run changes briefing structure or validates that no change is needed:

```text
VisionHub briefing scorecard: done
Five-second understanding: pass/partial/fail - ...
TOP3 reader use: pass/partial/fail - ...
Source boundary visible: pass/partial/fail - ...
Original source dependency: pass/partial/fail - ...
Mobile burden: pass/partial/fail - ...
Continuity use: pass/partial/fail - ...
Visual aid purpose: pass/partial/fail - ...
```

## Stop Conditions

Do not ship a VisionHub-style homepage or detail-page change when:

- The first screen looks cleaner but no longer tells readers what changed today.
- TOP3 cards are visually prominent but hide source role, claim status, or next-check boundary.
- Source warnings appear before the reader knows the event itself.
- Media-backed content becomes a Chinese replacement for the original article.
- A visual component adds color, icons, or layout weight without making facts, relationships, sequence, or proof boundaries easier to understand.
- Continuity language implies repeated coverage is stronger evidence without a stronger source artifact.

## Relationship To Existing Checks

- Use `docs/product-principles.md` to confirm the change helps Chinese readers follow AI changes lightly and confidently.
- Use `docs/copyright-safety.md` before editing news copy, source framing, article structure, or future optimization plans.
- Use `docs/homepage-edition-preflight.md` for edition-level reader questions, TOP3 use, source mix boundary, mobile scan path, and archive mirror checks.
- Use `docs/detail-page-review-guide.md` for item-level article structure, proof path, source reminders, and next-check clarity.
