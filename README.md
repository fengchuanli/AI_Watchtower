# AI Watchtower

一个用于追踪 AI 最新动向的静态情报站原型，参考了 `visionhub.jp` 的信息架构方向，但视觉和内容均重新设计。

## 本地查看

直接打开 `index.html` 即可预览。

也可以使用任意静态服务器：

```bash
npx serve .
```

## 文件结构

```text
.
├── assets/
│   ├── ai-intel-hero.jpg
│   └── ai-intel-hero.png
├── data/
│   ├── news.json
│   └── sources.json
├── docs/
│   ├── contributing.md
│   ├── candidate-workflow-plain-language-guide.md
│   ├── candidate-hold-reject-reasons.md
│   ├── held-candidate-review-note.md
│   ├── candidate-intake-format.md
│   ├── candidate-priority-rubric.md
│   ├── candidate-source-checklist.md
│   ├── candidate-to-news-handoff.md
│   ├── company-continuity-review-note.md
│   ├── topic-continuity-review-note.md
│   ├── next-check-retirement-note.md
│   ├── counter-evidence-observable-guide.md
│   ├── detail-page-review-guide.md
│   ├── homepage-edition-preflight.md
│   ├── vendor-narrative-promotion-rule.md
│   ├── current-to-history-publication-checklist.md
│   ├── archive-diff-summary-format.md
│   ├── automation-health-check.md
│   ├── bad-data-rollback-note.md
│   ├── partial-batch-publication-guide.md
│   ├── remote-sync-log-convention.md
│   ├── original-source-replacement-guide.md
│   ├── source-diversity-triage-note.md
│   ├── source-concentration-archive-review-note.md
│   ├── update-run-checklist.md
│   ├── news-data-format.md
│   ├── editorial-checklist.md
│   ├── editorial-validator-limits.md
│   ├── github-pages-readiness.md
│   ├── local-preview-qa.md
│   ├── monthly-optimization-summary.md
│   ├── optimization-decision-index.md
│   ├── optimization-log-archive-guide.md
│   ├── optimization-log.md
│   ├── optimization-plan.md
│   ├── product-principles.md
│   └── source-policy.md
├── scripts/
│   ├── validate-data.mjs
│   └── validate-site.mjs
├── app.js
├── index.html
├── styles.css
└── README.md
```

## 后续接入真实数据

当前新闻和趋势数据在 `data/news.json` 中维护，后续可以按 `data/sources.json` 里的情报源逐步替换为真实数据。

来源规则：

- 产品目标与优化基准：`docs/product-principles.md`
- 版权安全规则：`docs/copyright-safety.md`
- 情报源列表：`data/sources.json`
- 候选入口顺序：先读 `docs/candidate-workflow-plain-language-guide.md`，再用 `docs/candidate-source-checklist.md` 做硬门槛，通过后才填 `docs/candidate-intake-format.md`
- 候选暂缓/拒绝原因词表：`docs/candidate-hold-reject-reasons.md`
- 暂缓候选复查记录：`docs/held-candidate-review-note.md`
- 候选优先级评分：`docs/candidate-priority-rubric.md`
- 批次来源多样性判断：`docs/source-diversity-triage-note.md`
- 归档来源集中复查：`docs/source-concentration-archive-review-note.md`
- 媒体报道替换原始来源判断：`docs/original-source-replacement-guide.md`
- 候选到新闻字段交接：`docs/candidate-to-news-handoff.md`
- 公司连续观察复查：`docs/company-continuity-review-note.md`
- 主题连续观察复查：`docs/topic-continuity-review-note.md`
- 过期 nextCheck 退休判断：`docs/next-check-retirement-note.md`
- 反向证据可观察结果写法：`docs/counter-evidence-observable-guide.md`
- 详情页技术主张审稿：`docs/detail-page-review-guide.md`
- 首页版次发布预检：`docs/homepage-edition-preflight.md`
- 厂商叙事首页提升规则：`docs/vendor-narrative-promotion-rule.md`
- 新闻更新运行清单：`docs/update-run-checklist.md`
- 短批次发布判断：`docs/partial-batch-publication-guide.md`
- 当前版归档发布核对：`docs/current-to-history-publication-checklist.md`
- 早晚归档差异摘要：`docs/archive-diff-summary-format.md`
- 错误数据回滚说明：`docs/bad-data-rollback-note.md`
- 定时任务健康检查：`docs/automation-health-check.md`
- 远程同步日志约定：`docs/remote-sync-log-convention.md`
- 新闻数据：`data/news.json`
- 来源使用规则：`docs/source-policy.md`
- 编辑核对清单：`docs/editorial-checklist.md`
- 编辑校验误报与限制：`docs/editorial-validator-limits.md`
- 数据格式：`docs/news-data-format.md`
- 本地视觉 QA：`docs/local-preview-qa.md`
- GitHub Pages 发布兼容：`docs/github-pages-readiness.md`
- 月度优化总结：`docs/monthly-optimization-summary.md`
- 最近优化决策索引：`docs/optimization-decision-index.md`
- 优化履历季度归档规则：`docs/optimization-log-archive-guide.md`
- 贡献与发布流程：`docs/contributing.md`

提交内容更新前可以运行：

```bash
node scripts/validate-data.mjs
node scripts/validate-site.mjs
```

后续数据接入方式可以是：

- RSS 抓取
- GitHub Actions 定时更新 JSON
- Notion / Airtable / Supabase 后台
- OpenAI 总结和分类工作流

## 自动优化

项目使用一个约 30 天的优化计划持续改进：

- 计划文件：`docs/optimization-plan.md`
- 最近决策索引：`docs/optimization-decision-index.md`
- 优化履历：`docs/optimization-log.md`
- 新闻情报更新：每天 08:00 和 17:00 JST 各一次
- 页面与内容优化：每天 20:00 JST 一次

每次抓取或优化都应该留下清楚的履历，并推送到 GitHub。定时任务异常时先检查 `docs/automation-health-check.md`，尤其确认 `ACTIVE` 任务没有过期的 `UNTIL` 日期。

所有优化都应优先服务一个核心目标：让不擅长英语和 AI 情报收集的中文读者，可以轻松、愉悦、可信地跟上 AI 时代的重要变化。

## 推送到新远程仓库

你新建远程仓库后，在本目录执行：

```bash
git init
git add .
git commit -m "Initial AI Watchtower site"
git branch -M main
git remote add origin <你的远程仓库地址>
git push -u origin main
```
