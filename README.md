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
│   ├── news-data-format.md
│   ├── editorial-checklist.md
│   ├── optimization-log.md
│   ├── optimization-plan.md
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

- 情报源列表：`data/sources.json`
- 新闻数据：`data/news.json`
- 来源使用规则：`docs/source-policy.md`
- 编辑核对清单：`docs/editorial-checklist.md`
- 数据格式：`docs/news-data-format.md`
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
- 优化履历：`docs/optimization-log.md`
- 新闻情报更新：每天 08:00 和 17:00 JST 各一次
- 页面与内容优化：每天 14:00、15:00、16:00、17:30、18:00、19:00、20:00、21:00 JST 各一次

每次优化都应该留下清楚的履历，并推送到 GitHub。

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
