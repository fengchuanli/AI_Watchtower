# Remote Sync Log Convention

Use this convention whenever an optimization or news update run attempts to pull from or push to `origin main`. Its purpose is to make GitHub sync state readable in `docs/optimization-log.md` without hiding whether local data, archive data, and public GitHub state may have diverged.

This is a logging convention, not a reason to skip validation. If network sync fails, still finish the local content improvement only when the local branch can be validated and committed safely.

## Commit And Push Message Wording

Every public commit or push summary should make the work type visible at the beginning. Do not use vague titles such as `Day16`, `optimization`, `update`, or `fix` by themselves.

Use one of these title prefixes:

- `【新闻更新】`: for 08:00 or 17:00 news intelligence updates that change `data/news.json`, `data/news-history.json`, source records, or visible news content.
- `【网站优化】`: for ordinary website, document, validation, navigation, wording, archive, source-policy, or maintenance improvements.
- `【VisionHub网站风格优化】`: for changes that directly improve the VisionHub-inspired homepage structure, content expression, UI layout, mobile reading path, ranking cards, detail-page narrative structure, or visual briefing components.

Commit title examples:

```text
【新闻更新】发布17点AI新闻：10条模型与产业信号
【网站优化】修复首页TOP3模块显示
【VisionHub网站风格优化】简化首页首屏和新闻卡片层级
```

Each `docs/optimization-log.md` entry must include a short `Visible on site` or `网站可见变化` line. Say where the reader can see the change, such as homepage TOP3, more news feed, all-news list, detail page source panel, mobile layout, tag page, or archive page. If a change is only documentation or validation, write `网站可见变化：无，属于规则/校验/计划更新`.

## Status Values

Use these exact status values for pull and push notes:

| Value | Meaning | Required detail |
| --- | --- | --- |
| `pulled` | `git pull --ff-only origin main` succeeded before editing. | Record that local work started from the latest known remote. |
| `pushed` | `git push origin main` succeeded after commit. | Record the final commit hash visible on remote. |
| `blocked-dns` | GitHub hostname could not be resolved or reached. | Include the short error class, such as `Could not resolve hostname github.com`. |
| `blocked-auth` | Remote rejected credentials or access rights. | Say no content change was pushed and credentials need manual repair. |
| `blocked-conflict` | Pull could not fast-forward or local/remote history diverged. | Stop before editing unless the user explicitly chooses the merge/rebase path. |
| `blocked-non-fast-forward` | Push was rejected because remote moved ahead. | Do not force push; record that a future pull/reconcile run is needed. |
| `not-attempted-with-reason` | Sync was intentionally skipped. | Name the concrete reason, such as offline mode, no remote configured, or documentation-only dry run. |

Do not use vague wording like "network issue" or "GitHub failed" by itself. The next run should know whether to retry, authenticate, reconcile history, or continue from a validated local commit.

## Log Placement

Record remote sync state in three places when relevant:

1. `docs/optimization-log.md`: every optimization or news update run needs a `Git note` or `Remote sync` line.
2. The run checklist note from `docs/update-run-checklist.md`: use `remoteSyncBefore` and `Push`.
3. Automation memory: summarize whether local `main` is ahead of the known remote and whether push was blocked.

When the log entry itself is included in the commit, it is acceptable to record the implementation commit hash as a short hash and then let automation memory hold the final HEAD after the log-hash follow-up commit. Avoid repeatedly amending the same log entry just to update its own final hash.

## Pull Notes

Use one of these compact lines before editing:

```text
Remote before: pulled - git pull --ff-only origin main succeeded before editing.
```

```text
Remote before: blocked-dns - git pull --ff-only origin main failed because github.com could not be resolved; continued on validated local main.
```

```text
Remote before: blocked-conflict - pull was not fast-forwardable; stopped before editing pending manual reconciliation.
```

If pull is blocked by auth, non-fast-forward history, or a missing remote, do not describe the local branch as current. Say only that it is the latest validated local state.

## Push Notes

Use one of these compact lines after commit:

```text
Remote after: pushed - origin main accepted commit <short-hash>.
```

```text
Remote after: blocked-dns - local commit <short-hash> exists, but push failed because github.com could not be resolved.
```

```text
Remote after: blocked-non-fast-forward - local commit <short-hash> was not pushed; next run must pull/reconcile before publishing.
```

If push is blocked, also state whether the branch is ahead of the known remote when `git status --short --branch` can report it.

## Stop Conditions

Stop before making content edits when:

- Pull fails with `blocked-conflict` and the requested task depends on the latest remote state.
- Authentication failure means the run cannot know whether the remote branch or deployment target is current, and the user explicitly required a remote-only change.
- A previous push was blocked, the current branch is already ahead, and a new pull reports non-fast-forward divergence.

Continue locally, with an explicit log note, when:

- Pull or push fails only with `blocked-dns`.
- The task is documentation, content framing, validation, or data cleanup that can be verified locally.
- The run can create a normal forward commit without rewriting history.

## Minimum Log Wording

For a normal local-only run with DNS failure, use this shape:

```text
- Remote sync:
  - Before editing: blocked-dns - `git pull --ff-only origin main` failed because github.com could not be resolved.
  - After commit: blocked-dns - local commit `<short-hash>` was created, but `git push origin main` failed for the same DNS reason; local `main` is ahead of the known remote.
```

For a clean synced run, use this shape:

```text
- Remote sync:
  - Before editing: pulled - local branch fast-forwarded from `origin/main`.
  - After commit: pushed - `origin main` accepted commit `<short-hash>`.
```
