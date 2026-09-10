# AI Watchtower 设计系统 v2（深色基调）

这份文档是**不可协商的视觉基准**。任何优化任务（包括自动化任务）都必须对照本文件执行，
不得引入本文件之外的颜色、间距、字号、圆角或阴影值。

对标参考：`visionhub.jp` 的**信息架构与阅读节奏**。视觉实现为本站原创，
不复制其配色、字体、文案或图形。

## 1. 基本判断

| 维度 | 决定 | 理由 |
| --- | --- | --- |
| 明暗 | **深色为主**，`color-scheme: dark` | 情报站的默认阅读场景是长时间扫读；深色 + 单一强调色能让"新"和"重要"一眼可见 |
| 强调色 | **只有一个**：琥珀金 `--accent` | 旧版同时使用 cyan / green / amber / coral 四色装饰，导致没有真正的视觉重点 |
| 状态色 | 只做语义，不做装饰 | `--state-ok / warn / risk / info` 仅用于来源可信度、风险提示等有含义的地方 |
| 标题字体 | 系统衬线（宋体族） | 对应 visionhub 的明朝体重量感；**不引 webfont**——中文衬线字库动辄数 MB |

## 2. Token 清单

全部定义在 `styles.css` 的 `:root`。**禁止在其他位置写死颜色值。**

### 2.1 底色阶

`--navy-900` `#060a12` → `--navy-850` → `--navy-800` → `--navy-750` → `--navy-700` → `--navy-650` → `--navy-600` `#253656`

### 2.2 语义色

| Token | 用途 |
| --- | --- |
| `--bg-base` | 页面底色 |
| `--bg-band` | 交替色带（相邻 section 区分） |
| `--bg-raised` | 卡片、面板 |
| `--bg-raised-2` | 卡片上的二级块、hover 态 |
| `--bg-deep` | 比页面更深的强调面板（hero、深度简报） |
| `--bg-inset` | 内嵌凹陷块（tab 容器、代码块） |
| `--fg-primary` / `--fg-secondary` / `--fg-muted` | 正文三级 |
| `--accent` / `--accent-soft` / `--accent-fg` | 主 CTA、徽章、eyebrow、hover |
| `--link` / `--link-hover` | 正文内链接 |
| `--border` / `--border-strong` | 描边 |

### 2.3 语义底纹

`--tint-ok` / `--tint-warn` / `--tint-risk` / `--tint-info` / `--tint-link`，
各自配一个 `-border` 变体。用于来源可信度、风险提示、连续观察等语义块。

### 2.4 间距 / 字号 / 圆角 / 阴影

- 间距：`--space-1` 4px 起，到 `--space-9` 104px
- 字号：`--text-xs` 12px 到 `--text-3xl` 46px
- 圆角：`--radius-sm` 8 / `md` 14 / `lg` 20 / `xl` 28 / `pill`
- 阴影：`--shadow-1/2/3`

## 3. 组件规则

- **主 CTA / 激活态 / 徽章**：`background: var(--accent); color: var(--accent-fg)`。全站一致。
- **次级按钮**：透明底 + `1px solid var(--border-strong)`。
- **卡片**：`var(--bg-raised)` + `1px solid var(--border)` + `--radius-md`。
- **eyebrow 小标签**：`var(--accent)`，大写，字距 0.08em。
- **正文行长**：`max-width: 68ch`。

## 4. 兼容层

旧变量 `--ink / --muted / --line / --paper / --panel / --cyan / --green / --amber / --coral / --dark / --soft`
已重映射到语义 token，**仅为迁移期保留**。新代码一律直接用语义 token；
改到某个区块时顺手把旧变量换掉。

## 5. 硬规则

1. 新增硬编码颜色值 = 不通过。只允许 `rgb(255 255 255 / x%)` 和 `rgb(0 0 0 / x%)` 两类透明叠加。
2. **每次优化必须同时删掉一些东西，净行数不增。**
3. 改动前后跑 `python3 scripts/check_layout.py`，横向溢出、低对比元素和 JS 报错必须全为 0。
   版面确实需要变化时，用 `--update` 重建 `scripts/layout-baseline.json` 并在提交里说明原因。
