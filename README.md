# PROMPT · 提示词库

一个覆盖 **13 个行业**、收录 **2117 条精选中英提示词**、并附 **1000 条精选多语言包（法 / 德 / 西 / 葡 / 荷，每语种 200 条，按需懒加载）** 的免费公开网站：支持关键词 / 场景搜索、行业与标签云筛选、热度排序、收藏点赞、一键复制（可带出处署名）、社区投稿（GitHub API 直提交）。高级感杂志风格，深色 / 浅色可切换。纯静态、零构建、数据全在本地。

> **收录原则：保留原文语言，不做翻译。** 英文源的提示词就是英文，中文社区的就是中文，卡片上标注源语言（EN 原文 / 中文原文）。英文条目下方会附一行中文小字标签，仅为辅助扫读与中文搜索，**正文一字不改**。

## 行业覆盖（13 类）
编程/技术 · 教育 · 写作/内容 · 营销/自媒体 · 商业/金融 · 法律 · 医疗健康 · 设计 · 翻译/语言 · 效率/生活 · 娱乐/游戏 · 科研/科学 · **前端开发**

## 内容来源与准确性
| 来源 | 条数 | 协议 | 校准级别 |
|---|---|---|---|
| [prompts.chat](https://github.com/f/prompts.chat)（原 Awesome ChatGPT Prompts，CC0） | 150（已剔除损坏条目） | CC0 1.0 公开领域 | 英文原文，逐字搬运 |
| [mattnigh/ChatGPT3-Free-Prompt-List](https://github.com/mattnigh/ChatGPT3-Free-Prompt-List) | 225 | MIT（仓库） | 英文原文，逐字搬运 |
| [PlexPt/awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) | 150 | —（社区整理） | 中文原文，社区原样 |
| [nomaan5541/motionsites-prompt-collection](https://github.com/nomaan5541/motionsites-prompt-collection)（GitHub） | 249（**新增「前端开发」分类**） | MIT | 英文原文（AI 建站 / UI 组件规格，React+Tailwind+Framer Motion 等），逐字搬运；已过滤 Nike/NVIDIA/Ray-Ban 等品牌侵权风险条目 |
| [gretelai/synthetic_multilingual_llm_prompts](https://huggingface.co/datasets/gretelai/synthetic_multilingual_llm_prompts)（HuggingFace） | 1214（中文版，已并入「已校准/精选」档）+ 1000（法/德/西/葡/荷，**质量筛选后每语种保留 200 条，按语言分包懒加载**，亦已并入「已校准/精选」档） | Apache-2.0 | 中文版：**AI 合成语料**（官方发布，LLM 评分≥7/10 筛选；与库内已有英文条目同角色的已剔除），已并入「已校准/精选」档（tooltip 注明含经质量筛选的 AI 生成内容）。法/德/西/葡/荷五语版：机器生成原文，逐字取自官方发布 CSV，按角色映射至 13 行业，**经 LLM 质量评分（1-5 分）抽验后每语种只保留得分最高的 200 条**，点对应语言按钮时才加载 `prompts-intl-<lang>.js`（每包约 190KB，5 种语言独立分包）；加载后同样显示「已校准/精选」绿标 |
| [anyangsong/MAGA-ROLE-80](https://huggingface.co/datasets/anyangsong/MAGA-ROLE-80)（HuggingFace） | 79 | MIT | 中文原生角色扮演系统提示词 |
| [langgptai/wonderful-prompts](https://github.com/langgptai/wonderful-prompts)（云中江树「中文 prompt 精选」） | 57 | MIT | **中文原生**（写作/营销/编程/娱乐等），正文逐字取自 README，零翻译 |
| [langgptai/LangGPT](https://github.com/langgptai/LangGPT)（云中江树，结构化提示词） | 21 | Apache-2.0 | **中文原生**（AI 分身角色 / 小红书系列 / 结构化写作），正文逐字取自 `Prompts/` 与 `examples/prompts_zh.md` |
| [maliksandra838-lgtm/ai-prompt-armory](https://github.com/maliksandra838-lgtm/ai-prompt-armory)（电商/自媒体实战提示词） | 18 | MIT | **中文原生**（淘宝/小红书/短视频/社群运营实战模板，带使用技巧，零依赖复制即用） |

- 每条数据带 `lang` 字段（`en` / `zh` / `fr` / `de` / `es` / `pt` / `nl`），正文即源头语言原文，**不做任何翻译**。
- 已删除上游损坏条目（如 prompts.chat 的 Financial Analyst），并修正错误分类。
- 已校正 8 处历史遗留的译文与原文不符问题（一次性脚本已归档至 `D:\Users\联想笔记本\WorkBuddy\_归档\2026-09-01-prompt-hub-site\`）。
- 复制时可勾选「带出处署名」，自动追加 `— 来源：xxx (url)`；商用请保留署名。

## 功能
- **搜索**：标题/正文/标签实时筛选；内置场景词映射（如搜「面试」「写周报」「起名」可命中相关提示词）。
- **筛选**：行业分类 + 行业下「热门话题」子标签（按词频生成、随所选行业联动，最多 24 个）+「我的收藏」过滤。
- **来源可信度两档徽章（P1 内容可信度可视化）**：每张卡片右上角标注可信度——🟢 已校准/精选（站内已审核收录，1639 条，含经质量筛选的 AI 生成内容（评分≥7/10））/ 🔵 社区·原生（未逐条校验，574 条）；吸顶栏可一键按可信度层级过滤，图例位于筛选栏下方。
- **排序**：默认 / 热度（基础热度 + 本地点赞）。
- **收藏 / 点赞**：本地 localStorage 持久化（键 `phub-fav` / `phub-like`）。
- **一键复制**：复制的就是原文（英文即英文、中文即中文、法语即法语…），可选带出处署名。
- **多语言包（质量筛选 + 按语言分包懒加载）**：工具栏点 `Français / Deutsch / Español / Português / Nederlands` 任一按钮，才按需拉取对应的 `assets/js/prompts-intl-<lang>.js`（每语种 200 条精选、每包约 190KB，替换原先 5.6MB 单文件 / 1250 条每包，点哪个语言只下哪个，加载快 5 倍+、失败率更低），加载完成即只显示该语言条目；切回「全部 / 中文 / EN」不加载。`全部` 视图始终只含精选中英主库（2213 条，含「前端开发」249 条与 LangGPT/wonderful-prompts/ai-prompt-armory 中文原生 96 条），不被多语言分包内容淹没。
- **中文参考译文（AI 生成）**：多语言条目卡片带中文标题（`titleZh`，1000 条全量），正文下方有可折叠的「查看中文参考」（`promptZh`，随保留条目附带，当前每语言 13-20 条代表性正文），译文明确标注「AI 生成」，**正文原文始终优先、一字不改**——外语条目绝不是"中文翻译成外语"的产物。
- **社区投稿**：右上角「投稿」打开表单——无后端，直接通过 GitHub Contents API 提交到仓库 `submissions/` 目录（Fine-grained Token，仅 `contents:write`，只存本地 localStorage）；也可「加载社区投稿」拉取仓库中已合并的投稿。
- **分批渲染**：每次渲染 60 张卡，「加载更多」增量展示，500+ 条也流畅。
- **深色 / 浅色**：跟随系统并可手动切换记忆；响应式适配移动端。

## 运行说明
无需构建，任选其一：

```bash
# 方式一：本地静态服务器（推荐）
cd prompt-hub-site
npx http-server -p 8095
# 浏览器打开 http://localhost:8095/

# 方式二：直接双击 index.html
```

> 注：复制功能依赖浏览器 Clipboard API，`file://` 下会回退到 `execCommand` 方案；用本地服务器体验最佳。

## 部署（GitHub Pages）
1. 在 GitHub 新建仓库（如 `your-name/prompt-hub-site`），把本目录全部文件推送上去。
2. 仓库 Settings → Pages → Source 选 `main` 分支 `/ (root)`。
3. 若要启用社区投稿直提交，让投稿人把 `main.js` 顶部 `REPO_DEFAULT` 改成你的 `用户名/仓库名`（或投稿时在表单里填写仓库）。

## 社区投稿（无后端方案）
- 投稿人本地填好表单 + 自己的 GitHub Fine-grained Token（仅授 `contents:write`）→ 前端 PUT 到 `submissions/{id}.json`。
- 维护者审核后把文件移入正式数据（或直接保留在 `submissions/`，前端「加载社区投稿」即可拉取展示）。

## 目录结构
```
prompt-hub-site/
├── index.html              # 页面结构（含投稿弹窗、工具栏、标签云）
├── favicon.svg             # 主题图标（魔法棒 + 星光）
├── assets/
│   ├── css/style.css       # 全部样式与主题变量
│   ├── js/
│   │   ├── prompts.js      # 提示词数据（2117 条，原文语言 + 出处，含前端开发 249 条）
│   │   └── main.js         # 渲染 / 搜索 / 筛选 / 排序 / 收藏 / 投稿 / 主题
│   └── data/               # 抓取的原始 JSONL（英文源 + 中文社区源）
└── README.md

> 数据构建用的一次性脚本（transform / merge1-5 / fix-translations / keep-original）
> 已归档至 `D:\Users\联想笔记本\WorkBuddy\_归档\2026-09-01-prompt-hub-site\`，需要时可取回。
```

## 自定义
- **增删提示词**：编辑 `assets/js/prompts.js` 中的 `window.PROMPTS` 数组（字段：`id, cat, tags, lang, title, titleZh, titleEn, prompt, promptEn, source, sourceUrl, contributor, heat, verified, community`）。注意：`prompt` 请保持源头语言原文，`titleZh` 只作中文辅助标签。
- **新增行业**：在 `window.PROMPT_CATEGORIES` 增加一项（含 `key` 与 Font Awesome `icon`），并在 `PROMPTS` 中使用相同 `cat` 值。
- **场景搜索词**：`main.js` 中的 `SCENARIO` 映射对象。
- **配色**：修改 `assets/css/style.css` 顶部 `:root` 与 `[data-theme="dark"]` 变量。
