# Codex 抓情报，Claude 做二次加工

两边分工固定，各自只做自己擅长的那一半。

| | Codex（每天 08:00 / 17:00 JST） | Claude（每天一次，Codex 跑完之后） |
| --- | --- | --- |
| 做什么 | 抓来源、去重、填事实层字段、过校验、提交 | 读原文，写 `deepSections`，画图，补 `keyFacts` |
| 不做什么 | **不写 `deepSections`，不画图** | 不抓取、不改选题 |
| 判断标准 | 事实是否可核对 | 读者看完能不能讲清楚这件事 |

为什么这么分：Codex 擅长稳定地把事实装进字段，但写解释时会退化成通用模板
（历史上 12/12 条新闻的 `detailBody` 后缀完全相同）。读原文、分辨「来源说了什么」和
「来源没说什么」、决定画哪张图，这些需要逐条判断，交给 Claude。

---

## Codex 每天要交付什么

### 1. 选题配额（解决技术情报太少）

近 20 期的实际分布是 policy 77 / tool 65 / product 51 / research 32 / model 17——
政策和资本压过了技术。从现在起每期按下面的下限选题：

| 要求 | 下限 |
| --- | --- |
| `category` 为 `model` / `research` 的条目 | **每期至少 2 条** |
| 其中带「机制级细节」的 | **每期至少 1 条** |
| 单期 `policy` + `funding` 合计占比 | **不超过一半** |

「机制级细节」指来源里有下列任意一项：架构或流程的变化、基准数字与对照基准、
API 或接口变更、成本/延迟/准确率的具体数值、论文或技术报告链接。
只有公司动态、人事或融资的条目**不算**技术情报。

配额凑不满时，宁可少发，也不要用政策条目顶替。在 `editorNote` 里写明
「本期技术条目 N 条，未达下限，原因：…」。

### 2. 技术类来源优先级

`data/sources.json` 里这些是机制级来源，技术条目优先从这里找：

`openai-research`、`anthropic-engineering`、`anthropic-research`、
`google-deepmind-research`、`google-research-blog`、`microsoft-research-blog`、
`pytorch-blog`、`nvidia-technical-blog`、`huggingface-blog`、`huggingface-papers`、
`github-releases-openai`、`github-releases-anthropic`、
`arxiv-ai` / `arxiv-cl` / `arxiv-cv` / `arxiv-lg` / `arxiv-ma` / `arxiv-se`

发布公告类来源（`openai-news`、`anthropic-news`、各家 newsroom）可以用，
但**不要只凭公告就标成技术条目**——公告通常不含机制。

### 3. 技术条目要多存一个字段

抓到技术条目时，在 item 上加：

```jsonc
"needsDiagram": {
  "kind": "architecture",        // architecture | flow | comparison
  "why": "来源描述了监控器从模型外部移到前向计算内部",
  "sourceHasBefore": true        // 来源是否说明了「改之前是什么样」
}
```

这是给 Claude 的工单，不渲染到页面。**`sourceHasBefore` 必须如实填**：
来源没说旧做法是什么，就填 `false`，Claude 不会画对比图（画出来就是编的）。

Codex 不要自己填 `deepSections`、`techDiagram`、`relationGraph`、`beforeAfter`、`comparison`。
填了会被 Claude 覆盖，还会让详情页误判成「已有深度」而切到精简版面。

---

## Claude 每天要做什么

1. 拉最新的 `data/news.json`，找出 `needsDiagram` 的条目和当期 TOP3
2. **逐条打开 `sourceUrl` 读原文**——读不到就不加工，按下面第 5 条处理
3. 按 `docs/news-data-format.md` 的规范写 `deepSections`（通常 5–6 节）
4. 能画图的画图：
   - `techDiagram`：来源同时给出旧做法和新做法 → 左右对比流程 + 差异数字表
   - `relationGraph`：有争议双方或多方关系 → 分层有向图
   - `beforeAfter`：只有判断变化、没有结构变化 → 前后判断对照
   - `comparison` / `timeline`：放进 `deepSections` 内部，不单独占区块
5. 原文读不到（付费墙、拒绝抓取）时，写一节说明读不到以及补齐需要什么，
   **不要把摘要扩写成段落**
6. 跑 `node scripts/build-derived-data.mjs` 和三个校验脚本，再 commit

### 每天加工多少条

全部加工不现实。按这个优先级，做完为止：

1. 当期 TOP3
2. 带 `needsDiagram` 的技术条目
3. 其余条目保持 Codex 的事实层——详情页会自动回退到通用版面，不会坏

详情页用 `deepSections.length >= 3` 判断是否切到精简版面。
Codex 生成的占位单节不会触发，这是故意的。

---

## 画图的三条硬规则

1. **没有「之前」就不画对比图。** 来源没说改之前是什么样，就只画新结构，
   或者干脆不画。`sourceHasBefore: false` 时必须遵守。
2. **图里只放机制，数字放表格。** 架构图回答「数据怎么流、哪一步变了」；
   成本、准确率、延迟放在图下方的差异表里，并标明是谁测的。
3. **左右两栏数据不对称时要写明。** 常见情况是新方案有完整数字、旧方案只有成本，
   这时在「读图要注意」里说清楚，不要让图看起来像一次完整评测。

颜色、箭头和排版规则见 `docs/design-system.md`；只有「这次真正改掉的那一步」用强调色。
