# 协作指南（CONTRIBUTING）

AI 提示词精选库 · 纯静态站：**零构建、无依赖**，`index.html` + `assets/` 直接打开就能跑。以下约定帮助每一位协作者快速上手。

---

## 一、目录结构

| 路径 | 作用 |
| --- | --- |
| `index.html` | 页面骨架；底部引用脚本并带 `?v=` 缓存版本号 |
| `assets/css/style.css` | 全部样式（暖色杂志风、明暗双主题、响应式、3D 卡片） |
| `assets/js/main.js` | 全部交互逻辑：搜索 / 行业筛选 / 子标签 / 复制 / 收藏 / 点赞 / 投稿 / 主题 / 占位填充 / 分享 |
| `assets/js/prompts.js` | **主提示词库**（`window.PROMPTS`，当前 1710 条） |
| `assets/js/prompts-intl-{fr,de,es,pt,nl}.js` | 多语言包（各 200 条，懒加载） |
| `assets/data/` | 原始数据语料（**不纳入版本控制**，勿提交） |
| `e2e_regression_test.js` | 回归测试脚本 |
| `README.md` | 项目说明 / 部署说明 |

---

## 二、本地预览（任选其一）

1. 直接双击 `index.html`（最省事）；
2. 静态服务器：`python -m http.server 8000` → 打开 `http://localhost:8000`；
3. VS Code 安装 Live Server 插件。

> 提示：改完 `assets/` 下的文件后，浏览器可能缓存旧版本，**建议硬刷新**（Ctrl/Cmd + Shift + R）。

---

## 三、参与方式（两种都行）

### A. 仓库协作者（Collaborator）
被加为协作者后，直接推分支：

```bash
git clone <仓库地址>
cd prompt-hub-site
git checkout -b feat/你的改动描述
# ... 改代码 ...
git add .
git commit -m "描述这次改动"
git push origin feat/你的改动描述
```

然后在 GitHub 上发起 **Pull Request**，由仓库主审核合并。

### B. 访客（Fork + PR）
1. 在 GitHub 上点击 **Fork** 到自己账号；
2. `git clone` 自己 fork 的仓库，改完后 push；
3. 回到原仓库发起 **Pull Request**。

> 建议：大改动先开 **Issue** 说明意图，避免白做。

---

## 四、怎么改提示词内容（重点）

数据在 `assets/js/prompts.js`，结构为 `window.PROMPTS = [ ... ]`，每条记录字段如下：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一英文标识，如 `linux-terminal` |
| `cat` | 所属行业，**必须是下方 13 类之一**（否则行业筛选里看不到） |
| `tags` | 标签数组（用于子标签/搜索） |
| `title` / `titleZh` | 标题（英文 / 中文） |
| `prompt` / `promptEn` | 提示词正文（英文 / 中文） |
| `source` / `sourceUrl` | 出处名称 / 链接 |
| `contributor` | 贡献者 |
| `heat` | 热度评分 0–9（站内编辑评分，非真实使用量） |
| `verified` | `true` = 绿标「已校准 / 精选」 |
| `community` | `true` = 蓝标「社区 / 原生」 |
| `lang` | `zh` 或 `en` |

**13 个行业（`cat` 合法值）**：
`编程/技术`、`前端开发`、`写作/内容`、`教育`、`娱乐/游戏`、`商业/金融`、`效率/生活`、`科研/科学`、`营销/自媒体`、`医疗健康`、`设计`、`翻译/语言`、`法律`

### ⚠️ 改完必须重新分片 + 同步版本号（容易忘）
`index.html` 底部引用脚本带 `?v=`：

```html
<script src="assets/js/data/chunk-1.js?v=20260901aj" defer></script>
<!-- chunk-2..5 同理 -->
<script src="assets/js/main.js?v=20260901aj" defer></script>
```

**改了 `prompts.js` 数据后，先运行 `node split-prompts.js` 重新生成分片**（网站加载的是分片，不是 prompts.js 本身），再把对应 `v=` 递增一位。改了哪个文件就 bump 哪个，否则浏览器用旧缓存，**看不到你的改动**。CSS 同理。用「更新网站.bat」则会自动 bump 全部版本号。

---

## 五、约定与注意事项

- **不要改 `assets/data/`**：那是原始语料（未纳入版本控制），提示词以 `prompts.js` 为准。
- **新增行业**：先往 `main.js` 的 `window.PROMPT_CATEGORIES` 里加一项（key + FontAwesome 图标），再给数据条目打上对应的 `cat`，行业筛选才会出现。
- **提交信息**：中英文皆可，说清楚改了什么（如 `fix: 修复行业筛选不显示`）。
- **回归**：涉及搜索 / 筛选 / 复制 / 主题的改动，跑一遍 `node e2e_regression_test.js` 确认无回归。
- **数据敏感**：源数据里含 AI 生成内容，标注请沿用现有 `verified` / `community` 语义，不要混标。

---

## 六、上线（GitHub Pages）

仓库 Settings → **Pages** → Source 选 `Deploy from a branch` / 分支 `main` 根目录 → 保存。几分钟后访问 `https://<用户名>.github.io/<仓库名>/`，线上版会自动跟随合并到 main 的代码更新。
