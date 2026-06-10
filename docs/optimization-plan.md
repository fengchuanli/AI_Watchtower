# AI Watchtower 30-Day Optimization Plan

This plan guides two daily optimization passes for roughly 30 days. Each pass should make one small, useful improvement, verify the site still works, update the optimization log, commit the change, and push to GitHub.

## Daily Rhythm

- 14:00 JST: Content and information pass. Improve headlines, summaries, categories, source framing, trend wording, or dated editorial notes.
- 15:00 JST: Product and quality pass. Improve layout, accessibility, mobile behavior, loading, documentation, or the publishing workflow.

## Week 1: Foundation

- Day 1: Create the optimization plan and log, confirm GitHub Pages workflow.
- Day 2: Move sample news data into a clearer structure and make updates easier.
- Day 3: Add date labels and a daily briefing area that can be refreshed.
- Day 4: Improve mobile readability and spacing.
- Day 5: Add clearer category labels for models, products, research, policy, funding, and tools.
- Day 6: Add a simple source policy so every news item has provenance.
- Day 7: Review visual hierarchy and remove any weak placeholder wording.

## Week 2: Content Depth

- Day 8: Add a weekly trend summary section.
- Day 9: Add ranking explanations for why each trend matters.
- Day 10: Add a model watch section for notable model releases.
- Day 11: Add an AI tools watch section for product launches.
- Day 12: Add research-to-product interpretation cards.
- Day 13: Add regulation and copyright tracking notes.
- Day 14: Review copy consistency across the homepage.

## Week 3: Usability

- Day 15: Improve navigation between sections.
- Day 16: Add empty and loading states for future data integration.
- Day 17: Improve keyboard and screen reader behavior.
- Day 18: Tighten typography and contrast.
- Day 19: Add compact cards for quicker scanning.
- Day 20: Add a clear archive or previous updates entry point.
- Day 21: Review GitHub Pages behavior after deployment.

## Week 4: Automation Readiness

- Day 22: Prepare the data layer for RSS or API ingestion.
- Day 23: Add a contributor/editor guide.
- Day 24: Add a checklist for validating AI news quality.
- Day 25: Add JSON examples for future automated content updates.
- Day 26: Improve performance by reviewing image weight and CSS.
- Day 27: Add metadata for social sharing.
- Day 28: Review content freshness and remove stale placeholders.

## Final Polish

- Day 29: Full homepage review across desktop and mobile.
- Day 30: Summarize progress, list remaining opportunities, and prepare the next 30-day plan.

## Rules For Each Optimization Run

- Pull the latest `main` before editing.
- Use `data/sources.json` and `docs/source-policy.md` as the source guide for content-related changes.
- Make a scoped improvement that matches the plan.
- Do not add secrets, private data, or unverified claims.
- Prefer clear, useful editorial wording over decoration.
- Run lightweight checks before committing.
- Update `docs/optimization-log.md` with date, time, focus, changed files, verification, and commit hash.
- Commit with a concise message.
- Push to `origin main`.
