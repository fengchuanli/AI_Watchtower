# AI Watchtower 月度优化总结

这份 `docs/monthly-optimization-summary.md` 总结对应 `docs/optimization-plan.md` 中 2026-06-24 至 2026-07-23 的 30 天优化计划。它不是发布宣传稿，而是给后续自动化和人工维护看的产品质量复盘：本轮降低了哪些日常更新摩擦，哪些内容质量边界仍然薄弱，下一轮计划应该先补什么。

更新时间：2026-08-09 20:00 JST。当前计划已完成 Day 0 至 Day 29；下一次有用任务是 Day 30，先写下一轮 30 天优化计划，再继续执行新计划的第一项。

## 已改善的方向

- 候选进入新闻前更可控：本轮补齐了候选记录、优先级评分、暂缓/拒绝原因、候选到新闻字段交接、原始来源替换判断、来源多样性三色判断和通俗中文流程，减少了半自动采集直接变成首页新闻的风险。
- 新闻更新流程更清楚：08:00/17:00 JST 更新现在有运行清单、当前版归档核对、错误数据回滚说明、远程同步日志约定、早晚归档差异摘要和短批次发布判断，能解释为什么发布、暂缓或只发布少量可靠信号。
- 首页更像读者决策入口：本轮把 briefing、readerFrame、移动端短版、coverage mix、遗漏主题、overreadBoundary、分类说明和重复 caveat 审计连起来，让中文读者先看到“今天该检查什么”，再看到来源 caveat 和 proof boundary。
- 连续观察更有解释力：公司与主题连续观察已经能说明 OpenAI、Google、Anthropic 等 recurring companies 或 Agent/基础设施/政策等 recurring topics 的信号是 stronger、weaker 还是 repeated，并指出 what remains unproven。
- 详情页来源边界更稳：详情页审稿指南、媒体来源提醒、counterEvidence 可观察结果指南、whoShouldCare 具体读者场景和 vendor-narrative-promotion-rule.md 共同限制媒体背景、厂商主张和 vivid vendor narrative 被写成确定结论。
- 校验开始守住关键编辑规则：`scripts/validate-data.mjs` 与 `scripts/validate-site.mjs` 已经覆盖当前/最新归档数据、重复 caveat、具体读者场景、媒体 must-read 提醒、厂商主张 TOP3 提升门槛和 workflow 文档完整性，减少重复劳动和规则遗失。

## 仍然薄弱的地方

- 新闻发现仍依赖人工判断和手工 JSON 维护；候选源输入、去重报告、排序理由、归档镜像和提交状态虽然有文档，但还不是一条稳定的低摩擦流水线。
- 当前验证能检查字段和关键词，不能替代人工事实判断；来源能证明什么、不能证明什么、是否存在更好的 official/source-of-record，仍需要编辑逐条读源和判断。
- 首页信息质量提高后，页面元信息也变多；手机读者虽然有 compact scan variant，但 dense editions 仍可能让非技术读者在 reader frame、source risk、trend notes 和 continuity blocks 之间来回跳。
- 连续观察仍偏期次内提示，缺少更稳定的跨期复盘：上次的 nextCheck 是否被满足、哪些公司或主题的信号已经降级、哪些只是重复媒体叙事，还没有形成独立视图。
- 文档型 guard 增长很快；`docs/optimization-log.md`、decision index 和 validators 已经降低查找成本，但下一轮需要把“必须读的入口”压缩得更清楚，避免维护者为了改一条新闻先读太多文档。
- GitHub DNS/network failure 在多次自动化运行中反复出现，本地 `main` 和 `origin/main` 容易产生状态差；远程同步失败不会影响本地质量，但会影响发布可见性和后续协作。

## 下一步优先级

- Day 30 应先写下一轮 30 天优化计划，把重点从“补齐规则文档”转向“让真实新闻更新更省力、更少重复、更易手机阅读”。
- 下一轮应继续守住版权安全、媒体 must-read、sourceRole/claimStatus、vendor narrative 独立证据、重复 URL 和 stale signal 边界，不要为了凑满条数发布弱信号。
- 优先改善日常内容生产：候选输入模板、候选排序输出、重复候选报告的使用路径、归档差异记录、失败发布状态和首页 reader-use copy 的例行复查。
- 优先改善读者实际看到的内容：压缩首页元信息、让 `今日 TOP3` 和移动端短版更像 1 到 3 分钟扫读入口、让详情页继续把技术 claim 改写成 fact、impact、boundary、next check。
- 为连续观察补一条更清楚的跨期复盘路径，帮助后续更新说明某个公司/主题是 stronger、weaker、repeated，还是已经被新的官方文件、日志、评测或监管动作推翻。

## 后续维护规则

- 每次新一轮优化开始前，先看这份总结、`docs/optimization-decision-index.md` 和 `docs/optimization-log.md` 顶部条目，确认没有重复做 Day 29 或 Day 30，避免重复劳动。
- 新增规则时优先问：它会不会降低中文读者理解成本，或减少下一次新闻更新的具体摩擦；如果只是让文档更多，就不要纳入计划。
- 修改新闻内容时继续把原始来源当作事实入口，本站只承担中文解释、趋势判断、读者使用方法和核验边界。
- 如果 GitHub pull/push 继续被 DNS 阻塞，日志必须记录 blocked-dns，并把最终本地 commit hash 写清楚，方便网络恢复后补推。
