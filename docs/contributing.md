# AI Watchtower 贡献指南

这份指南用于人工编辑和自动化任务在不破坏 GitHub Pages 站点的前提下更新内容、页面或校验脚本。

## 基本约束

- 站点必须继续从仓库根目录直接发布，不依赖构建步骤或服务端运行时。
- 页面资源使用仓库内的相对路径，确保项目站点子路径可以正常加载。
- 不提交密钥、私人数据、抓取凭证或无法公开复核的信息。
- 不把样例、社区讨论或单一二手来源写成已经核验的事实。
- 修改范围保持单一；不要顺手重排无关文件或覆盖其他任务的改动。

## 内容更新流程

1. 阅读 `docs/source-policy.md`、`docs/candidate-source-checklist.md` 和 `docs/editorial-checklist.md`。
2. 对半自动采集或批量候选 URL，先用候选来源清单筛掉付费墙、重复、来源角色不清或证据不足的 URL。
3. 在 `data/sources.json` 中确认来源；缺少来源时先补充来源记录。
4. 按 `docs/news-data-format.md` 更新 `data/news.json`。
5. 核对标题、摘要、日期、链接、核验状态和下一步检查项。
6. 运行数据与站点校验，再提交改动。

内容编辑应优先链接支持中心事实的原始页面。自动校验只能检查结构，不能代替来源阅读和事实判断。

## 页面与代码更新流程

1. 保持 `index.html`、`styles.css` 和 `app.js` 无构建工具也能直接运行。
2. 新增本地资源时使用相对 URL，并确认文件已经纳入版本控制。
3. 修改交互时同时检查键盘操作、焦点状态、无脚本降级和窄屏布局。
4. 修改元数据、页面入口或回退页时同步扩展对应校验脚本。
5. 修改 GitHub Pages 发布路径、404 或站内入口时同步检查 `docs/github-pages-readiness.md`。
6. 在 `docs/optimization-log.md` 记录目标、文件、检查结果和提交哈希。

`scripts/validate-site.mjs` 会检查首页的本地 `href`、`src` 和页内锚点，阻止缺失文件、逃逸仓库根目录的路径及不兼容 GitHub 项目站点的根绝对路径。
`scripts/validate-pages.mjs` 会检查 404 页是否保留相对路径、noindex 和站内恢复入口。

## 提交前检查

从仓库根目录运行：

```bash
node --check app.js
node --check scripts/validate-data.mjs
node --check scripts/validate-site.mjs
node --check scripts/validate-pages.mjs
node scripts/validate-data.mjs
node scripts/validate-site.mjs
node scripts/validate-pages.mjs
git diff --check
```

涉及 HTML 时，还应使用 HTML 解析器检查 `index.html` 和新增页面；涉及 JSON 时，应确认文件能够被标准 JSON 解析器读取。

## 提交与发布

- 开始编辑前运行 `git pull --ff-only origin main`；网络不可用时在优化日志中明确记录。
- 远程仓库使用 SSH：`git@github.com:fengchuanli/AI_Watchtower.git`。不要把 `origin` 或 `pushurl` 改成 HTTPS。
- 提交信息应简短说明实际改进，不使用宽泛的“更新”或“优化”。
- 推送前确认提交只包含本次任务相关文件。
- 推送到 `origin main` 后检查 GitHub Pages 部署状态；无法推送时保留本地提交并记录具体错误。
