# GitHub Pages 发布兼容清单

这份清单用于发布前确认 AI Watchtower 在 GitHub Pages 项目站点路径下仍然可读、可恢复、可核对。目标不是增加发布流程复杂度，而是避免中文读者因为路径差异、404 或数据文件加载失败而失去站内阅读入口。

## 路径规则

- HTML、CSS、JS、图片和数据文件都使用 `./` 开头的相对路径，避免 `/assets/...`、`/data/...` 或 `/news-detail.html` 这类根绝对路径。
- 页面之间的入口保持站内相对链接：`./`、`./all-news.html`、`./archive.html`、`./tags.html`、`./news-detail.html?id=...`。
- 详情页参数只承载站内定位信息，不把外部来源 URL 当作主要阅读路径。
- 新增页面时同步加入 `scripts/validate-site.mjs` 的静态页面检查，确认文件存在、锚点存在、路径不会逃出仓库根目录。

## 404 恢复路径

GitHub Pages 会把未知路径交给 `404.html`。这个页面必须帮助读者继续阅读，而不只是显示错误：

- 返回首页，重新进入当前 TOP3 和本期简报。
- 进入 `全部 AI 新闻`，按题目找到历史站内解读。
- 进入 `期次归档`，确认当前批次和历史批次状态。
- 打开公开 JSON 数据 `./data/news.json`，在页面脚本异常时仍可核对最新结构化内容。

## 发布前检查

从仓库根目录运行：

```bash
node --check app.js
node --check all-news.js
node --check news-detail.js
node --check tags.js
node --check scripts/validate-data.mjs
node --check scripts/validate-site.mjs
node --check scripts/validate-pages.mjs
node scripts/validate-data.mjs
node scripts/validate-site.mjs
node scripts/validate-pages.mjs
git diff --check
```

如果校验提示根绝对路径、缺失本地文件、缺失锚点或 404 恢复链接，先修复再发布。无法推送时，在 `docs/optimization-log.md` 记录 GitHub 网络错误和本地提交哈希。
