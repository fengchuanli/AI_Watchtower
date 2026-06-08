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

当前新闻和趋势数据在 `app.js` 中，后续可以替换为：

- RSS 抓取
- GitHub Actions 定时更新 JSON
- Notion / Airtable / Supabase 后台
- OpenAI 总结和分类工作流

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
