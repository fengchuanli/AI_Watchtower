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
│   └── ai-intel-hero.png
├── app.js
├── index.html
├── styles.css
└── README.md
```

## 后续接入真实数据

当前新闻和趋势数据在 `app.js` 中，后续可以按 `data/sources.json` 里的情报源逐步替换为真实数据。

来源规则：

- 情报源列表：`data/sources.json`
- 来源使用规则：`docs/source-policy.md`

后续数据接入方式可以是：

- RSS 抓取
- GitHub Actions 定时更新 JSON
- Notion / Airtable / Supabase 后台
- OpenAI 总结和分类工作流

## 自动优化

项目使用一个约 30 天的优化计划持续改进：

- 计划文件：`docs/optimization-plan.md`
- 优化履历：`docs/optimization-log.md`
- 频率：每天 01:00 和 05:00 JST 各一次

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
