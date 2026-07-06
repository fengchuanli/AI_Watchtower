# Bad Data Rollback Note

Use this note when a published or ready-to-publish news update has bad data: a wrong source role, duplicate URL, stale item, archive drift, unsafe media summary, broken detail page, failed validator, or accidental overstatement in `data/news.json` or `data/news-history.json`.

The goal is to restore a trustworthy current edition before republishing. Do not hide the issue by adding more copy, changing ranking language, or creating a new edition ID unless the source facts actually changed.

## When To Roll Back

Start rollback instead of patching in place when any of these are true:

- `node scripts/validate-data.mjs` fails on current items, history mirroring, duplicate current/history URLs, source registration, source concentration, or required proof-boundary fields.
- `node scripts/validate-site.mjs` or `node scripts/validate-pages.mjs` fails after a data-only news update.
- The latest `data/news-history.json` edition no longer matches the homepage edition after `docs/current-to-history-publication-checklist.md`.
- A media-sourced item needs article structure, interview details, charts, or paywalled/login-wall body text to remain useful.
- A current item repeats an archived URL or near-duplicate title without a concrete `freshSourceFact`.
- A source later proves the headline fact, date, company, model, regulator, or claim status was wrong or unsupported.

## Files To Inspect

Check these files before choosing the rollback shape:

| File | What to inspect |
| --- | --- |
| `data/news.json` | Current edition ID, date, item order, source fields, proof boundaries, current URLs, TOP3/ranking fields, and short-batch reason. |
| `data/news-history.json` | Newest edition mirror, item count, item order, duplicated URLs, `totalItems`, and whether the broken item was already archived. |
| `data/sources.json` | Registered `sourceId`, trust level, RSS/official status, and source owner for the disputed item. |
| `docs/optimization-log.md` | The last news run's source posture, validation results, commit note, push status, and any short-batch reason. |
| `docs/update-run-checklist.md` | Whether source discovery, candidate intake, duplicate reporting, archive mirror, validation, commit, and push statuses were recorded. |
| `docs/current-to-history-publication-checklist.md` | Which homepage/history fields must be restored together before republishing. |

If the issue is copyright or source-body dependence, also reread `docs/copyright-safety.md` and reduce the public copy to title, source, link, minimal fact, AI Watchtower interpretation, and a clear original-source reminder.

## Rollback Shapes

Choose the smallest shape that makes the current public data trustworthy:

| Situation | Action |
| --- | --- |
| Bad item was added before commit | Remove or correct it in `data/news.json`, mirror the corrected current edition into `data/news-history.json`, and rerun validators. |
| Bad item was committed locally but not pushed | Create a new corrective commit. Do not rewrite history unless the user explicitly asks. |
| Bad item was pushed or may be visible | Publish a corrective commit that removes, corrects, or demotes the item and records the correction in `docs/optimization-log.md`. |
| Current homepage is unreliable but previous edition is clean | Restore `data/news.json` from the latest clean `data/news-history.json` edition, keep the clean edition ID, and record why the newer draft was rolled back. |
| History mirror is wrong but homepage is clean | Update only the newest `data/news-history.json` edition to match `data/news.json`, then rerun the archive mirror checklist and validators. |
| Source role or claim status is too strong | Demote the item to the supported status, such as `媒体背景` / `reported`, or hold it until an official, paper, filing, regulator, customer, dataset, benchmark, or audit source exists. |

## Restore Steps

1. Identify the last clean state: latest passing commit, latest clean history edition, or current `data/news.json` before the disputed item.
2. Fix `data/news.json` first. Remove unsafe items rather than padding the batch; if fewer than 10 safe items remain, update the edition short-batch reason.
3. Apply `docs/current-to-history-publication-checklist.md` so the newest history edition matches the corrected homepage edition.
4. Recheck source posture against `data/sources.json`, `docs/source-policy.md`, `docs/candidate-source-checklist.md`, and `docs/editorial-checklist.md`.
5. Update `docs/optimization-log.md` with the rollback reason, changed files, validators rerun, whether the bad data was pushed, and the new commit status.
6. Commit with a corrective Chinese message, for example `回滚错误新闻数据` or `修正新闻来源状态`.
7. Push when network access works. If push fails, record the exact blocker in the log and memory.

## Validators To Rerun

Run at least these checks before republishing:

```bash
node --check app.js
node --check all-news.js
node --check news-detail.js
node --check archive.js
node --check tags.js
node --check scripts/validate-data.mjs
node --check scripts/validate-site.mjs
node --check scripts/validate-pages.mjs
node scripts/validate-data.mjs
node scripts/validate-site.mjs
node scripts/validate-pages.mjs
git diff --check
```

Also parse the public static pages when page behavior, detail links, archive links, or the current/history JSON shape changed:

```bash
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path

class Parser(HTMLParser):
    pass

for name in ["index.html", "all-news.html", "news-detail.html", "archive.html", "tags.html", "404.html"]:
    Parser().feed(Path(name).read_text(encoding="utf-8"))
PY
```

For JSON shape changes, parse `data/news.json`, `data/news-history.json`, and `data/sources.json` before committing.

## Compact Log Note

Use this wording when a rollback removed or corrected bad current data:

```text
Rollback: corrected - restored trustworthy current/history data after bad update; reran validate-data, validate-site, validate-pages, HTML parsing, JSON parsing, and diff check before republishing.
```

Use this wording when rollback was not needed after inspection:

```text
Rollback: not-needed - inspected data/news.json, data/news-history.json, sources, log, and validators; issue was documentation-only or already blocked before publication.
```

## Stop Conditions

Do not republish until:

- `data/news.json` and the newest `data/news-history.json` edition agree on edition metadata, reader/source framing, item count, and item order.
- Every current item has a registered source, visible source role, proof boundary, next check, and copyright-safe source fact.
- The log says whether the bad data reached a commit, a push, or only a draft.
- The validators above pass, or the remaining failure is explicitly unrelated and documented.
