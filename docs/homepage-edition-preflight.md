# Homepage Edition Preflight

Use this note before finalizing the homepage edition in `data/news.json` and before mirroring it into `data/news-history.json`. Its job is to make the current batch easier for Chinese readers to use, especially on mobile, without turning source articles into substitute Chinese reports.

This preflight sits after candidate intake, priority scoring, source-diversity triage, and `docs/candidate-to-news-handoff.md`, and before `docs/current-to-history-publication-checklist.md`. It does not add new facts. It checks whether the homepage framing already tells readers what to do with the batch.

## Preflight Questions

Answer these in Chinese before publication:

1. `targetReaderQuestion`: What one question should this edition help a Chinese reader answer today?
2. `top3ReaderUse`: Does each TOP3 item explain why it matters now and which reader decision or checklist it supports?
3. `sourceMixBoundary`: Is the batch dominated by one source family, source owner, vendor, country, or evidence mode, and does the homepage say what not to conclude?
4. `coverageMixShape`: Does `coverageMix` merge tiny buckets so there is no more than one single-item bucket and no more than four total scan cues?
5. `categoryRouteDecision`: Do homepage filters follow the current reader question, with category descriptions rewritten, categories reordered, or the first reading path collapsed into `coverageMix` when several tiny categories answer the same question?
6. `shortBatchNote`: If fewer than 10 safe items are published, does `editorialInterpretation` say this is a quality-gate result and name what was not used for padding?
7. `omittedTopicFallback`: For each planned topic omitted from `edition.topicGroups`, does the fallback tell readers whether to use archive, tag-page, historical, or already-selected related items as background without adding a new claim?
8. `mobileScanPath`: Can a phone reader understand the edition from `readerFrame.mobile`, TOP3 titles, summaries, and source labels in 1 to 3 minutes?
9. `proofBoundary`: Do `sourceRisk`, `overreadBoundary`, `trendNotes`, `topicContinuity`, and promoted cards name the official, filing, audit, metric, benchmark, regulator, customer-side, or third-party evidence needed next?
10. `publicContinuityBrief`: If recurring topics or companies appear, can the homepage continuity brief use only `topicContinuity` and `companyContinuity` to show what changed, what still needs proof, and which reader-use check each topic/company note supports, without adding a new fact layer? If an old check is resolved or retired, does the card say the old question was answered before showing the smaller remaining gap?
11. `archiveMirror`: Will the newest history edition preserve the same reader frame, source boundary, item count, item order, and archive label?

## Compact Note Shape

Use this shape in an editor note or optimization log when the update changed content framing:

```text
Homepage preflight: done
Reader question: 今天读者要先判断哪些 AI 变化值得继续核对？
TOP3 use: done - 每条都说明读者用途、选择理由和下一步核验。
Source mix boundary: done - 单一来源/证据模式已标注，不把雷达版写成全市场结论。
Coverage mix shape: done - 单条小桶已合并为更宽的读者行动标签。
Category route decision: done - 分类说明和顺序贴合本期读者问题；多个单条小类先合并进 coverageMix 阅读路径。
Short batch note: done - 少于 10 条时说明这是质量门槛结果，并列出未用于补量的来源类型。
Omitted topic fallback: done - 未入选主题只指向归档、标签或本期相关背景，不补写新事实。
Mobile scan path: done - readerFrame.mobile、TOP3 摘要和来源标签可在 1 到 3 分钟内扫完。
Proof boundary: done - 下一步证据指向官方、filing、审计、指标、benchmark、监管、客户侧或第三方材料。
Public continuity brief: done - 连续观察只来自 topicContinuity/companyContinuity，说明本期变化、仍需核验证据以及主题/公司信号的读者用途；resolved/retired 旧问题先标明已回答，再显示缩小后的新证据缺口。
Archive mirror: done - 最新历史版与首页版次 framing 和 item order 对齐。
```

## Stop Conditions

Do not publish the edition as-is when:

- The reader question is only a topic label, such as "AI news", rather than a decision or watch point.
- TOP3 copy explains why a story is interesting but not who should act on it or what to verify next.
- A concentrated media, vendor, or research batch lacks `sourceRisk`, `sourceConcentration`, or `overreadBoundary` framing.
- `coverageMix` reads like a topic inventory, has more than one single-item bucket, or needs more than four labels to explain the current batch.
- Category descriptions, labels, or display order answer yesterday's topic map instead of today's reader question.
- Several one-item categories all serve the same reader job, but the homepage still asks mobile readers to hop through separate filters before it offers a broader `coverageMix` scan cue.
- A short batch says "only", "not enough", or "unfinished" instead of explaining that duplicates, weak evidence, old items, paywall/login-wall body text, community discussion, or routine marketing were not used for padding.
- An omitted planned topic tells readers a new event happened, implies confirmation or rollout, or gives no archive, tag-page, historical, or already-selected related reading path.
- The mobile scan path requires reading the long `deepBriefing` before the reader can tell what changed.
- Proof-boundary copy repeats the same vague sentence across several fields instead of naming a concrete next evidence type.
- The public continuity brief introduces a fact that is not already present in `topicContinuity`, `companyContinuity`, or the current/history item fields.
- A topic continuity card appears on the public brief but cannot tell readers whether to use it as enterprise adoption evidence, Agent-control proof, policy/data-boundary proof, infrastructure evidence, model-capability evidence, a downgrade check, or archive background from existing fields.
- A company continuity card appears on the public brief but cannot tell readers whether to use it as a safety/regulatory, product/model, adoption-evidence, research-evidence, or archive-background check from existing fields.
- The latest archive snapshot would keep an older reader frame, item order, or source caveat after the homepage changes.

## Relationship To Existing Checks

- Use `docs/update-run-checklist.md` for the full run state: discovery, intake, duplicate reporting, validation, commit, and push.
- Use `docs/editorial-checklist.md` for item-level facts, copyright safety, source roles, and field quality.
- Use this preflight for edition-level reader value: what the homepage says first, what it warns against, and whether mobile readers can scan it quickly.

## First-Screen Reader Order Guard

`scripts/validate-site.mjs` protects the VisionHub-style homepage reading path as a reader-trust rule, not a decorative layout preference. The homepage should keep this first-screen order:

```text
hero -> today briefing -> TOP3 -> purpose navigation -> deep briefing -> compact feed
```

This order lets a phone reader see the daily promise, the short "what changed today" briefing, the ranked three strongest items, and only then choose a purpose-driven reading route before deeper context and the non-TOP3 flow. The purpose navigation should sit after TOP3 and before deep briefing so it supports the reader's next decision without delaying the first ranked briefing. If a future design changes the layout, keep the same editorial job visible before process notes, source machinery, archive links, or internal workflow copy.

The guard also checks that `app.js` still renders `briefingHeadline`, `briefingSummary`, the same-day TOP3 ranking, and the compact feed that removes items already covered by TOP3. If any of those pieces move, update this note and the validator together so homepage structure still starts from reader understanding rather than editor operations.

## Day 0 Mobile First-Screen Audit

For the 2026-10-11 through 2026-11-09 cycle, the phone first-screen audit keeps this module split:

| First TOP3 decision stage | Modules | Reader job |
| --- | --- | --- |
| Before TOP3 | hero, 5 秒今日要点, 今日深挖 watch points | Say what changed today without source machinery or archive links. |
| TOP3 decision | 今日 TOP3 ranking cards and the immediate all-news follow-up | Decide the three strongest signals first, then offer a fast title-only escape hatch. |
| After TOP3 | 按目的阅读, 分类最新, 深度简报, 连续观察, 更多新闻流, 资料库 | Let readers choose depth, background, source boundaries, continuity, or full history after the first ranking decision. |

The header navigation and the small `手机先读` cue should mirror this split: `今日重点` -> `今日 TOP3` -> `按目的阅读` -> `深度简报` -> `最新新闻流`. The cue belongs below the Today Briefing watch points because it marks the path without delaying the TOP3 cards. If future work moves modules, keep the audit table, header order, and visible cue synchronized.

## Continuity Mobile Disclosure Rule

- 连续观察没有有效卡片时不显示；只有一条时默认展开。
- 首次渲染宽度不超过 768px 且有两条及以上时默认折叠；桌面默认展开。使用原生 details/summary，读者可用键盘或触屏切换。
- 折叠摘要保留卡片数量、主题/公司及状态，并提示重复出现不代表证据更强；展开后保留变化、读者用途和核验边界。
- 不随窗口缩放重置读者的展开选择，不移动 DOM 或复制卡片；连续观察仍位于深度简报末尾，新闻流之前。

## Day 7 TOP3 Visual Briefing Shape

Use existing fields only. The eyebrow carries signal type (`label`); the card retains minimum fact, why-now rationale and reader use (`readerUse`). A shared left rule groups source role/status, proof boundary (`claimBoundary`) and next-check artifact (`nextCheck`) into one evidence path. Keep all three text labels visible on mobile; color alone must not convey certainty. Show `originalDependency` beside the source so media-backed full-fact dependency is visible without opening scoring details. Never infer confidence from rank or source type, truncate boundary sentences, or invent an artifact when the field is absent. This initial shape adds one explicit boundary row; Day 8 should review comparative cues without duplicating these sentences.

## TOP3 Visual Cue Editorial Review (Day 11)

逐张检查页面实际选出的同日 TOP3（包含同日历史批次），不要只检查当前 `items` 的前三条。视觉提示复用既有字段，不新增置信度字段，也不把排名当作事实证明。

| 卡片位置 / 字段 | 编辑检查 | 不应出现的表达 |
| --- | --- | --- |
| 信号标签 `label` | 只说明既有新闻类别；与日期分开，保持简短中文。 | 把“安全”类别写成“已安全”，或用“第一名”暗示证据最充分。 |
| 来源边界 `sourceType`、`sourceRole`、`claimStatus` | 保留来源角色和声明状态；官方来源不自动等于独立验证。 | 把厂商主张写成本站确认的效果。 |
| 尚未证明 `claimBoundary` | 点名该来源尚未支持的结果；与最小事实区分，不重复整段摘要。 | 用“值得关注”等泛泛措辞替代具体证据缺口。 |
| 读者用途 `readerUse` | 说明读者可据此核对的一个决定或清单。 | 把待验证性能写成采购或部署保证。 |
| 下一步核验 `nextCheck` | 指向既有字段中的具体文件、测试或独立证据路径；保留未知状态。 | 虚构已存在的审计、客户结果或第三方复测。 |
| 原文依赖 `originalDependency`、`originalUrl` / `sourceUrl` | `must-read` 在评分折叠前提供“完整事实请读原文”及上下文提示。 | 将本站简报描述为媒体全文的替代品。 |

现有渲染分支必须准确保留：只有 `sourceType: official`、`sourceRole: 厂商主张` 且 `claimStatus: confirmed` 同时满足，才使用“发布事实已确认 · 效果待核验”；其他组合继续使用对应声明状态，不为统一外观强行升级。该短标签仍不能替代具体的 `claimBoundary`。

示例（仅说明写法，不是新增新闻）：厂商发布模型说明，可以确认“发布说明”这一动作；不能据此写成“模型效果已获独立验证”。媒体卡片则保留报道状态与必读原文入口，不因进入 TOP3 改成官方确认。

发布前在 390px 与 768px 核对标签、来源、边界、下一步核验是否可读：不能只靠颜色表达状态，不能截断边界句子，不能把原文入口藏到评分详情中；避免新增与现有证据行重复的解释段落。原文链接只接受 HTTP(S)，新窗口说明、键盘焦点和长文本换行应保留；缺失有效链接时保留提醒并修正数据，不编造地址。

本条是人工编辑规则。现有数据和页面检查不能证明来源事实、独立性或真实手机阅读负担；未实际检查浏览器时不得记录视觉验收通过。Day 12 再补最小确定性漂移校验，不把本条当作已实现的自动拦截。

## TOP3 Certainty Regression Guard

`node scripts/validate-site.mjs` invokes `scripts/check-top3-cues.mjs` against the real homepage renderer using isolated fixtures. It checks the pre-expansion vendor publication/outcome distinction, non-confirmed statuses, category cue, proof boundary and next check, missing-boundary fallback, and media must-read link/context reminder. Fixtures run even when today's TOP3 contains no media item.

This is a rendering regression check, not a fact checker or browser layout test. It cannot establish whether a source supports a claim, catch every misleading phrase, or prove that CSS keeps a cue visible on a phone; retain editorial source review and mobile QA.
