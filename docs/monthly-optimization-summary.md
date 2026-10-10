# AI Watchtower 月度优化总结

这份 `docs/monthly-optimization-summary.md` 总结对应 `docs/optimization-plan.md` 中 2026-09-11 至 2026-10-10 的 30 天优化计划。它不是发布宣传稿，而是给后续自动化和人工维护看的产品质量复盘：本轮围绕 VisionHub-style 中文简报体验、手机阅读负担、详情页叙事一致性、候选到新闻工作流、读者可见连续观察和校验守护，记录已经改善的方向、仍然薄弱的地方，以及 Day 30 下一轮计划应优先处理的主题。

更新时间：2026-10-10 20:00 JST。当前计划已完成 Day 0 至 Day 29；下一次有用任务是 Day 30，先写下一轮 30 天优化计划，再继续执行新计划的第一项。

## 已改善的方向

- 首页更像一份中文日常简报：本轮从 VisionHub Briefing Scorecard 开始，把 hero、今日简报、今日 TOP3、按目的阅读、深度简报和紧凑非 TOP3 feed 连成更顺的首屏路径；手机读者先看到今天发生了什么、为什么值得看、自己该先读哪几条。
- TOP3 卡片更有判断理由：排名卡现在把最小事实、why now、reader use、source role、claim status、proof boundary 和 nextCheck 放到更靠前的位置，避免只有标题、热度或厂商叙事在驱动阅读。
- 详情页更接近短事件简报：媒体 must-read 边界、官方/研究页的本站解读、开头句去重、impact / whoShouldCare / readerUse 拆分、结尾核验规则和移动目录压缩，让详情页更像一篇有起点、有解释、有下一步核查的中文短文。
- 新闻更新工作流更低摩擦：候选到新闻最短路径、派生数据发布关口、duplicate candidate review actions、failure-status wording、source-label stewardship 和 normal news update must-read path，让 08:00 / 17:00 JST 更新更容易知道先读哪些文档、何时暂缓、何时拒绝、何时可以发布。
- 连续观察从内部维护走向读者辅助：首页 `本期连续观察` 已能展示 topic/company 卡片，并用 `怎么用`、`已回答后仍需看`、当前首页批次/历史背景和 `publicContinuityHandoff` 区分 stronger、weaker、repeated 或 resolved，不再只是编辑表格里的重复信号。
- 校验开始保护真实读者路径：`scripts/validate-site.mjs` 和 `scripts/validate-data.mjs` 已覆盖 Today Briefing、TOP3 证据路径、详情页重复句首、公共连续观察、HTML 静态页面壳、skip/main landmark、移动 viewport、站内恢复路径和关键动态容器。
- 文档入口更可操作：README、decision index、validator limits、local-preview QA 和 workflow docs 已把本轮关键守卫串起来，后续自动化不必每次从长日志里重新推理 Day 0 至 Day 29 的脉络。

## 仍然薄弱的地方

- 首页信息负担仍偏高；当新闻批次较 dense 时，今日简报、TOP3、深度简报、连续观察、来源边界和 feed 容易一起挤压手机 1 到 3 分钟阅读。
- TOP3 的证据边界已经更清楚，但排名解释还主要依赖文本字段；缺少轻量视觉 briefing 组件来帮非技术读者快速看懂安全、政策、开发者工具和资本/基础设施信号之间的关系。
- 详情页结构更稳定，但不同条目的语气和段落密度仍会随人工写法波动；媒体来源页尤其需要继续抽查，确保本站不是原文中文版替代品，而是最小事实加 AI Watchtower 原创解释。
- 新闻发现、候选排序、当前/历史镜像和派生数据维护仍偏手工；规则越来越完整，但还没有形成更短、更自动、更不易漏步的一条发布流水线。
- Validator 能检查字段、关键词、长度和页面结构，不能替代人工事实判断；来源是否真正支持结论、是否有更好的 source-of-record、vendor narrative 是否缺少独立证据，仍必须逐条读源。
- 连续观察已有首页入口和月度公开交接形状，但还缺少一个真正读者可见的跨期/月度页面或模块，帮助读者回看某个公司、主题、未解主张的状态变化。
- GitHub DNS、push approval 和本地领先远程的安全边界仍会影响发布节奏；日志已能记录 blocked-dns、push held 和 pending 状态，但自动化仍需要更稳定地处理“本地已有未推送新闻提交”的情况。

## 下一步优先级

- Day 30 应写下一轮 30 天优化计划，把首页首屏减负、TOP3 视觉 briefing、详情页语气一致性、新闻发布流水线、读者可见月度连续观察和远程同步边界列为一等目标。
- 下一轮优先减少手机阅读负担：保留今日 TOP3 和紧凑新闻流，把编辑流程、来源机械信息、长风险说明和重复 continuity notes 移到更合适的位置。
- 继续守住版权安全、媒体 must-read、sourceRole/claimStatus、`docs/vendor-narrative-promotion-rule.md`、重复 URL、stale signal、source-of-record 和人工事实判断边界，不要为了凑满条数发布弱信号。
- 为读者可见连续观察设计更稳定的公开形态，让 stronger、weaker、repeated 或 resolved 不只服务编辑复盘，也帮助中文读者理解“这个主题这月到底变没变”。
- 优先改善日常内容生产：候选输入、候选排序、重复报告、归档镜像、派生数据、验证、提交、推送状态和异常恢复应变成更短的操作路径。

## 后续维护规则

- 每次新一轮优化开始前，先看这份总结、`docs/optimization-decision-index.md` 和 `docs/optimization-log.md` 顶部条目，确认没有重复做 Day 29 或 Day 30，避免重复劳动。
- 新增规则时优先问：它会不会降低中文读者理解成本，或减少下一次新闻更新的具体摩擦；如果只是让文档更多，就不要纳入计划。
- 修改新闻内容时继续把原始来源当作事实入口，本站只承担中文解释、趋势判断、读者使用方法和核验边界。
- 如果 GitHub pull/push 继续被 DNS 阻塞，日志必须记录 blocked-dns；如果本地 `main` 已领先 `origin/main` 且包含非本次优化提交，不要把无关提交混入本次自动化推送。
