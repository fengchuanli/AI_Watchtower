# AI Watchtower 月度优化总结

这份 `docs/monthly-optimization-summary.md` 总结对应 `docs/optimization-plan.md` 中 2026-08-10 至 2026-09-08 的 30 天优化计划。它不是发布宣传稿，而是给后续自动化和人工维护看的产品质量复盘：本轮降低了哪些日常更新摩擦，哪些内容质量边界仍然薄弱，下一轮计划应该先补什么。

更新时间：2026-09-10 20:00 JST。当前计划已完成 Day 0 至 Day 29；下一次有用任务是 Day 30，先写下一轮 30 天优化计划，再继续执行新计划的第一项。

## 已改善的方向

- 首页更接近中文简报入口：本轮把 readerFrame、briefing.summary、deepBriefing.overview、coverageMix、分类说明、遗漏主题说明和 First-Screen Reader Order Guard 连起来，守住 hero -> today briefing -> TOP3 -> deep briefing -> compact feed 的阅读顺序，让手机读者先知道今天发生了什么和为什么值得看。
- TOP3 与首页卡片更有证据边界：短批次发布、`docs/vendor-narrative-promotion-rule.md`、sourceRisk、sourceConcentration、overreadBoundary 和同日 TOP3 排序 guard 共同限制弱信号、重复媒体叙事或 vivid vendor narrative 被包装成确定结论。
- 详情页从标签堆叠转向解释路径：Day 14 至 Day 20 把 30 秒速览、fact/impact/boundary/next-check 四块、媒体 must-read 提醒、detailTrend 拆分、evidenceThreshold 升级例、followUpQuestions、counterEvidence 和 provenance source-fact label 串成更清楚的文章阅读路线。
- 候选与来源工作流更低摩擦：候选 scratch template、重复 URL / near-title / fresh-source-fact 判断、source-of-record 选择、中文 source role、held-candidate 复查和流程入口顺序，让 08:00/17:00 JST 新闻更新更容易解释“为什么发、为什么暂缓、为什么拒绝”。
- 连续观察更能避免重复劳动：companyContinuity、topicContinuity、archive-diff correction-only、历史背景标签、nextCheck 退休、source-concentration archive review 和 monthly-continuity-snapshot 让 repeated、stronger、weaker、resolved 的判断更稳定。
- 校验开始保护读者真正会看到的结构：`scripts/validate-data.mjs` 与 `scripts/validate-site.mjs` 已覆盖移动短文案、详情页段落长度、来源事实标签、首页首屏顺序、TOP3 去重、历史背景措辞、validator limits 和关键编辑文档锚点。

## 仍然薄弱的地方

- 新闻发现和 JSON 维护仍偏手工；候选输入、排序、镜像归档、全部新闻同步和提交状态虽然有规则，但还不是一条稳定的低摩擦流水线。
- Validator 能检查字段、关键词、长度和页面结构，不能替代人工事实判断；来源能证明什么、是否有更好的 official/source-of-record、媒体最小事实是否过界，仍需逐条读源。
- 首页已经有今日 TOP3、今日简报、深度简报、移动短版、来源风险和连续观察，但 dense edition 仍可能让手机读者在 1 到 3 分钟内读到太多编辑机器信息。
- 详情页 narrative path 已改善，但不同新闻项的语气、段落密度和读者行动建议仍不完全一致；媒体 must-read 与站内原创分析的比例还需要继续抽查。
- 连续观察仍主要服务编辑维护，缺少一个读者可见的月度或跨期视图来说明哪些公司、主题、未解主张已经 stronger、weaker、repeated 或 resolved。
- 文档和 guard 继续增长；README、decision index 和 validator limits 已降低查找成本，但下一轮应把真实更新时的必读入口压缩成更少、更顺的操作路径。
- GitHub DNS / publishing review 偶发阻塞仍会影响发布可见性；日志现在能记录 blocked-dns 和推送状态，但自动化仍需要明确处理本地领先与远程同步的安全边界。

## 下一步优先级

- Day 30 应先写下一轮 30 天优化计划，把 VisionHub-style briefing polish、手机 1 到 3 分钟阅读、详情页叙事一致性、候选到新闻低摩擦流水线和读者可见连续观察列为一等目标。
- 下一轮优先减少首页信息负担：保留今日 TOP3 和紧凑新闻流，把编辑流程、来源机械信息、长风险解释和重复 continuity notes 移到更合适的位置。
- 下一轮继续守住版权安全、媒体 must-read、sourceRole/claimStatus、vendor narrative 独立证据、重复 URL、stale signal 和 source-of-record 边界，不要为了凑满条数发布弱信号。
- 优先改善日常内容生产：候选输入模板、候选排序输出、重复候选报告、归档差异记录、失败发布状态、当前/历史镜像核对和新闻更新后自检路径。
- 为连续观察设计读者可见的轻量组件，帮助中文读者看出某个公司或主题这月是 stronger、weaker、repeated 或 resolved，而不是只在内部文档里保存判断。

## 后续维护规则

- 每次新一轮优化开始前，先看这份总结、`docs/optimization-decision-index.md` 和 `docs/optimization-log.md` 顶部条目，确认没有重复做 Day 29 或 Day 30，避免重复劳动。
- 新增规则时优先问：它会不会降低中文读者理解成本，或减少下一次新闻更新的具体摩擦；如果只是让文档更多，就不要纳入计划。
- 修改新闻内容时继续把原始来源当作事实入口，本站只承担中文解释、趋势判断、读者使用方法和核验边界。
- 如果 GitHub pull/push 继续被 DNS 阻塞，日志必须记录 blocked-dns，并把最终本地 commit hash 写清楚，方便网络恢复后补推。
