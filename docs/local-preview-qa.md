# Local Preview QA

Use this lightweight visual QA pass after layout, copy, navigation, loading, or data-rendering changes. It is intentionally short so each optimization run can check the site without turning preview into a heavy release process.

## Preview Setup

Start from the repository root.

```bash
npx serve .
```

If a static server is unavailable, opening `index.html` directly is acceptable for copy and layout review, but use a local server before publishing when the change touches fetch behavior or cross-page navigation.

## Viewports

Check these widths at minimum:

- Mobile: 390px wide.
- Tablet: 768px wide.
- Desktop: 1280px wide.

For each viewport, confirm that text does not overlap, horizontal scrolling does not appear, sticky navigation does not cover anchored sections, and cards keep stable spacing while content loads.

## Reader Path

Follow the primary Chinese-reader path:

1. Open the homepage and scan `今日 TOP3`.
2. Open one TOP3 detail page and read `30 秒速览`, `全貌图`, `事件解读`, `核验边界`, and `来源`.
3. Return to the homepage through normal navigation.
4. Open `全部 AI 新闻`, change category and sort controls, then open one archived detail page.
5. Open `公司标签` and confirm OpenAI, Anthropic, Google, and Meta pages show useful empty or populated states.

The site should keep original sources secondary; readers should be able to understand each item through the in-site Chinese explanation first.

## Loading And Failure States

Temporarily block or rename a local data file only in a throwaway working copy, then reload:

- `data/news.json`: homepage should show a clear retry action and fallback links to all-news, raw current data, and archive.
- `data/news-history.json`: all-news should distinguish a failed archive load from an empty archive and offer retry plus fallback links.

Restore the file immediately and run the validators before committing.

## Accessibility Checks

Use the keyboard only:

- The skip link appears on focus and moves to `main`.
- Header, filter, TOP3, all-news, tag, detail, and source links have understandable focus order.
- Buttons and links have visible focus outlines.
- External source links announce that they open in a new window.

Also enable reduced motion in the browser or OS and confirm smooth scrolling is disabled.

## Publish Readiness

Before committing, run:

```bash
node --check app.js
node --check all-news.js
node --check news-detail.js
node --check tags.js
node --check scripts/validate-data.mjs
node --check scripts/validate-site.mjs
node --check scripts/validate-pages.mjs
node scripts/validate-data.mjs
node scripts/validate-site.mjs
node scripts/validate-pages.mjs
git diff --check
```

Do not publish if any local link is root-absolute, any source-backed claim changed without a source update, or any mobile viewport makes the daily briefing harder to scan.
