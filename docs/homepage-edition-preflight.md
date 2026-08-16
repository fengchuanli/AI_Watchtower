# Homepage Edition Preflight

Use this note before finalizing the homepage edition in `data/news.json` and before mirroring it into `data/news-history.json`. Its job is to make the current batch easier for Chinese readers to use, especially on mobile, without turning source articles into substitute Chinese reports.

This preflight sits after candidate intake, priority scoring, source-diversity triage, and `docs/candidate-to-news-handoff.md`, and before `docs/current-to-history-publication-checklist.md`. It does not add new facts. It checks whether the homepage framing already tells readers what to do with the batch.

## Preflight Questions

Answer these in Chinese before publication:

1. `targetReaderQuestion`: What one question should this edition help a Chinese reader answer today?
2. `top3ReaderUse`: Does each TOP3 item explain why it matters now and which reader decision or checklist it supports?
3. `sourceMixBoundary`: Is the batch dominated by one source family, source owner, vendor, country, or evidence mode, and does the homepage say what not to conclude?
4. `coverageMixShape`: Does `coverageMix` merge tiny buckets so there is no more than one single-item bucket and no more than four total scan cues?
5. `shortBatchNote`: If fewer than 10 safe items are published, does `editorialInterpretation` say this is a quality-gate result and name what was not used for padding?
6. `omittedTopicFallback`: For each planned topic omitted from `edition.topicGroups`, does the fallback tell readers whether to use archive, tag-page, historical, or already-selected related items as background without adding a new claim?
7. `mobileScanPath`: Can a phone reader understand the edition from `readerFrame.mobile`, TOP3 titles, summaries, and source labels in 1 to 3 minutes?
8. `proofBoundary`: Do `sourceRisk`, `overreadBoundary`, `trendNotes`, `topicContinuity`, and promoted cards name the official, filing, audit, metric, benchmark, regulator, customer-side, or third-party evidence needed next?
9. `archiveMirror`: Will the newest history edition preserve the same reader frame, source boundary, item count, item order, and archive label?

## Compact Note Shape

Use this shape in an editor note or optimization log when the update changed content framing:

```text
Homepage preflight: done
Reader question: 今天读者要先判断哪些 AI 变化值得继续核对？
TOP3 use: done - 每条都说明读者用途、选择理由和下一步核验。
Source mix boundary: done - 单一来源/证据模式已标注，不把雷达版写成全市场结论。
Coverage mix shape: done - 单条小桶已合并为更宽的读者行动标签。
Short batch note: done - 少于 10 条时说明这是质量门槛结果，并列出未用于补量的来源类型。
Omitted topic fallback: done - 未入选主题只指向归档、标签或本期相关背景，不补写新事实。
Mobile scan path: done - readerFrame.mobile、TOP3 摘要和来源标签可在 1 到 3 分钟内扫完。
Proof boundary: done - 下一步证据指向官方、filing、审计、指标、benchmark、监管、客户侧或第三方材料。
Archive mirror: done - 最新历史版与首页版次 framing 和 item order 对齐。
```

## Stop Conditions

Do not publish the edition as-is when:

- The reader question is only a topic label, such as "AI news", rather than a decision or watch point.
- TOP3 copy explains why a story is interesting but not who should act on it or what to verify next.
- A concentrated media, vendor, or research batch lacks `sourceRisk`, `sourceConcentration`, or `overreadBoundary` framing.
- `coverageMix` reads like a topic inventory, has more than one single-item bucket, or needs more than four labels to explain the current batch.
- A short batch says "only", "not enough", or "unfinished" instead of explaining that duplicates, weak evidence, old items, paywall/login-wall body text, community discussion, or routine marketing were not used for padding.
- An omitted planned topic tells readers a new event happened, implies confirmation or rollout, or gives no archive, tag-page, historical, or already-selected related reading path.
- The mobile scan path requires reading the long `deepBriefing` before the reader can tell what changed.
- Proof-boundary copy repeats the same vague sentence across several fields instead of naming a concrete next evidence type.
- The latest archive snapshot would keep an older reader frame, item order, or source caveat after the homepage changes.

## Relationship To Existing Checks

- Use `docs/update-run-checklist.md` for the full run state: discovery, intake, duplicate reporting, validation, commit, and push.
- Use `docs/editorial-checklist.md` for item-level facts, copyright safety, source roles, and field quality.
- Use this preflight for edition-level reader value: what the homepage says first, what it warns against, and whether mobile readers can scan it quickly.
