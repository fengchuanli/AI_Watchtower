# Failure Status Wording Guide

Use this guide when an optimization run or news update cannot finish the normal happy path. Its job is to make failure notes short, consistent, and useful to the next run. Pair it with `docs/remote-sync-log-convention.md` for pull and push values, and with `docs/update-run-checklist.md` for news-update step status.

Do not write vague notes such as "failed", "network issue", "validation problem", or "publish blocked" by themselves. A useful blocker note names the blocked stage, the exact status value, the concrete error class, the local artifact that is safe to trust, and the next editor action.

## Compact Shape

Use this one-line shape in `docs/optimization-log.md`, automation memory, and any short run note:

```text
<Stage>: <status> - <what failed>; <what is safe locally>; <next action>.
```

Example:

```text
Validation: blocked-data - `node scripts/validate-data.mjs` found stale derived data; no commit created; rebuild derived data after fixing the current/history mirror.
```

## Status Values By Stage

| Stage | Use these values | Required detail |
| --- | --- | --- |
| Pull | `pulled`, `blocked-dns`, `blocked-auth`, `blocked-conflict`, `not-attempted-with-reason` | Follow `docs/remote-sync-log-convention.md`; say whether editing continued from latest remote or only from validated local state. |
| Validation | `passed`, `blocked-data`, `blocked-site`, `blocked-pages`, `blocked-html`, `blocked-diff`, `not-run-with-reason` | Name the command or parser, the error class, and whether any edited files remain uncommitted. |
| Commit | `committed`, `blocked-validation`, `blocked-dirty-unrelated`, `blocked-git-error`, `not-needed` | Say whether a local commit exists; if not, name the validation, unrelated-change, or Git error that stopped it. |
| Push | `pushed`, `blocked-dns`, `blocked-auth`, `blocked-non-fast-forward`, `not-attempted-with-reason` | Follow `docs/remote-sync-log-convention.md`; if blocked, include the local commit hash and whether local `main` is ahead. |
| Publication | `published`, `blocked-validation`, `blocked-archive-drift`, `blocked-derived-data`, `blocked-source-boundary`, `blocked-short-batch`, `not-needed` | Say which reader-visible surface is safe or unsafe: homepage, TOP3, feed, all-news, archive, tags, or detail pages. |

## Stage Notes

### Pull

Use pull notes before editing. If the pull is `blocked-conflict`, stop before content edits unless the user chooses the reconcile path. If the pull is only `blocked-dns`, a documentation, validation, or locally verifiable content pass may continue on validated local `main`.

### Validation

Validation notes must name the failing command, not just the domain. Prefer this order when relevant: `node scripts/build-derived-data.mjs --check`, `node scripts/validate-data.mjs`, `node scripts/validate-site.mjs`, `node scripts/validate-pages.mjs`, HTML parsing, JSON parsing, and `git diff --check`.

If validation is blocked by stale derived data, call it `blocked-data` or `blocked-derived-data` rather than "site failed". If the site validator catches a documentation guard, call it `blocked-site` and name the missing guide or anchor.

### Commit

Do not create a commit after a relevant validation failure. Use `blocked-validation` and name the command to rerun after the fix. If unrelated dirty files stop a clean commit decision, use `blocked-dirty-unrelated` and list only the paths that need a human decision.

### Push

Use the same push vocabulary as `docs/remote-sync-log-convention.md`. Never write "probably pushed" or "GitHub issue"; say whether `origin main` accepted the commit. If push is blocked after a commit, record the short hash and local-ahead state from `git status --short --branch` when available.

### Publication

Publication blockers are about reader-visible state, not only Git state. Use `blocked-archive-drift` when `data/news.json` and the newest `data/news-history.json` edition disagree; use `blocked-derived-data` when `data/news-index.json` or `data/news-today.json` is stale; use `blocked-source-boundary` when a current item would overstate or replace its source; use `blocked-short-batch` when too few safe candidates remain and `docs/partial-batch-publication-guide.md` says to hold.

## Minimum Log Lines

```text
Pull: pulled - `git pull --ff-only origin main` succeeded before editing; local work started from latest remote.
Validation: passed - build-derived-data --check, validate-data, validate-site, validate-pages, HTML parse, and git diff checks passed.
Commit: committed - local commit `<short-hash>` created with `【网站优化】...`.
Push: pushed - `origin main` accepted commit `<short-hash>`.
Publication: not-needed - documentation-only run; 网站可见变化：无，属于规则/校验/计划更新.
```

```text
Pull: blocked-dns - `git pull --ff-only origin main` could not resolve github.com; continued on validated local main.
Validation: blocked-site - `node scripts/validate-site.mjs` could not find the Day 16 failure-status guide anchor; no commit created.
Commit: blocked-validation - no local commit because site validation failed.
Push: not-attempted-with-reason - no commit existed after validation failure.
Publication: blocked-validation - reader-visible pages were not changed or published.
```

## Stop Conditions

Stop rather than papering over the problem when:

- Pull is `blocked-conflict` and the work depends on current remote data.
- Validation is blocked on data, site links, archive drift, or source-boundary claims that affect public pages.
- Commit would mix unrelated dirty user changes with the automation's files.
- Push is `blocked-non-fast-forward`; do not force push.
- Publication would leave homepage, all-news, archive, tags, or detail pages showing different versions of the same edition.
