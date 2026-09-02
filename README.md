# PROMPT · 提示词库

一个覆盖 **13 个行业**、收录 **1770 条精选中英提示词**、并附 **1000 条精选多语言包（法 / 德 / 西 / 葡 / 荷，每语种 200 条，按需懒加载）** 的免费公开网站：支持关键词 / 场景搜索、行业与热门话题筛选、热度排序、收藏点赞、一键复制（可带出处署名）、滚动自动加载。杂志风视觉、深色 / 浅色可切换、移动端深度适配。含社交分享卡片（OG/Twitter）、可分享的筛选链接（`#q=`）、首屏骨架屏 + 分片懒加载、键盘快捷键（`/` 聚焦搜索）与自定义 404 页。纯静态、零构建。

> **收录原则：保留原文语言，不做翻译。** 英文源的提示词就是英文，中文社区的就是中文，卡片上标注源语言。英文条目下方附一行中文小字标签，仅为辅助扫读与中文搜索，**正文一字不改**。

**线上地址**：<https://huanglihui123456789-web.github.io/prompt-hub-site/>（GitHub Pages）
**国内代码镜像**：<https://gitee.com/h1549520007/prompt-hub-site>（仅代码备份，不提供网页托管）

## 行业覆盖（13 类）

编程/技术 · 前端开发 · 写作/内容 · 教育 · 娱乐/游戏 · 商业/金融 · 效率/生活 · 科研/科学 · 营销/自媒体 · 医疗健康 · 设计 · 翻译/语言 · 法律

## 内容来源与可信度

| 来源 | 条数 | 协议 | 说明 |
|---|---|---|---|
| [prompts.chat](https://github.com/f/prompts.chat)（CC0） | 150（已剔除损坏条目 + 重复变体） | CC0 1.0 | 英文原文，逐字搬运 |
| [mattnigh/ChatGPT3-Free-Prompt-List](https://github.com/mattnigh/ChatGPT3-Free-Prompt-List) | 225 | MIT | 英文原文，逐字搬运 |
| [PlexPt/awesome-chatgpt-prompts-zh](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) | 150（已剔除损坏/重复条目） | —（社区整理） | 中文原文，社区原样 |
| [motionsites-prompt-collection](https://github.com/nomaan5541/motionsites-prompt-collection) | 249（「前端开发」分类） | MIT | 英文原文；已过滤品牌侵权风险条目 |
| [gretelai/synthetic_multilingual_llm_prompts](https://huggingface.co/datasets/gretelai/synthetic_multilingual_llm_prompts) | 703（中文版）+ 1000（五语分包） | Apache-2.0 | **AI 合成语料**（官方发布；中文版经 LLM 评分≥7/10 筛选 + 低质短模板清理；五语版每语种精选 200 条） |
| [anyangsong/MAGA-ROLE-80](https://huggingface.co/datasets/anyangsong/MAGA-ROLE-80) | 79 | MIT | 中文原生角色扮演 |
| [langgptai/wonderful-prompts](https://github.com/langgptai/wonderful-prompts)（云中江树） | 57 | MIT | **中文原生**，零翻译 |
| [langgptai/LangGPT](https://github.com/langgptai/LangGPT)（云中江树） | 21 | Apache-2.0 | **中文原生**结构化提示词 |
| [ai-prompt-armory](https://github.com/maliksandra838-lgtm/ai-prompt-armory) | 18 | MIT | **中文原生**电商/自媒体实战模板 |
| [prompt-hub-site（站内原创）](https://github.com/huanglihui123456789-web/prompt-hub-site) | 100（前端设计 35 + 短视频 35 + 工作提效 10 + 小红书 8 + 写作 6 + 生活 6） | CC0 1.0 | **站内自产中文原创**，覆盖前端设计、爆款短视频（含 AI 生图）、职场提效、小红书、写作、生活健康等高频场景，打绿标 |

**可信度两档徽章**：🟢 已校准/精选 1192 条（站内审核收录，其中 gretelai 部分为经质量筛选的 AI 生成内容、prompt-hub-site 为站内自产原创，卡片 tooltip 已注明）/ 🔵 社区·原生 548 条（未逐条校验）。

- 每条数据带 `lang` 字段（`en/zh/fr/de/es/pt/nl`），正文即源头语言原文。
- 复制时可勾选「带出处署名」，自动追加来源；商用请保留署名。

## 功能

- **搜索**：标题/正文/标签实时筛选；内置场景词映射（搜「面试」「写周报」「起名」可直接命中）。
- **筛选**：行业分类 + 行业下「热门话题」子标签（随行业联动）+ 可信度筛选 + 「我的收藏」；「清除筛选 ✕」一键重置。
- **排序**：默认 / 热度（基础热度 + 本地点赞）。
- **一键复制**：复制原文（可选带出处署名），三级兜底（Clipboard API → execCommand → 手动复制面板）。
- **多语言包懒加载**：点语言按钮才加载对应 `prompts-intl-<lang>.js`（每包约 190KB）；「全部」视图只含中英主库。
- **数据分片加载**：主库拆为 5 个分片并行加载（见「数据分片」一节），单分片失败不阻塞其余分片。
- **滚动自动加载**：卡片每批 60 张，滑到底自动加载下一批。
- **移动端适配**：行业横滑单行、「更多筛选」折叠、触控目标 ≥44px、滚动预加载。
- **深色 / 浅色**：跟随系统并可手动切换记忆。
- **防缓存机制**：资源带版本号，入口页自动跳转到最新版本（部署更新后无需手动清缓存）。

## 运行说明

无需构建，任选其一：

```bash
# 方式一：本地静态服务器（推荐）
cd prompt-hub-site
npx http-server -p 8095
# 浏览器打开 http://localhost:8095/

# 方式二：直接双击 index.html（复制功能会回退到兼容方案）
```

## 部署（GitHub Pages）

1. 推送本仓库到 GitHub。
2. 仓库 Settings → Pages → Source 选 `main` 分支 `/ (root)`。
3. 更新流程：修改内容后双击「更新网站.bat」（自动 bump 版本号 → commit → push），1–3 分钟后自动上线。

## 社区投稿（现状说明）

- 站内「投稿」表单提交后**保存在投稿人自己的浏览器**（localStorage），仅本人可见。
- 开放投稿请通过 GitHub **Pull Request**（见 [CONTRIBUTING.md](CONTRIBUTING.md)）或外部表单收集后由维护者合并。

## 目录结构

```
prompt-hub-site/
├── index.html                  # 页面结构（投稿弹窗、工具栏、筛选区）
├── 更新网站.bat                 # 一键更新（版本号 bump + commit + push）
├── split-prompts.js            # 数据分片脚本（编辑 prompts.js 后运行）
├── favicon.svg
├── assets/
│   ├── css/style.css           # 全部样式与主题变量
│   ├── js/
│   │   ├── main.js             # 渲染 / 搜索 / 筛选 / 排序 / 收藏 / 主题
│   │   ├── prompts.js          # 主库数据源（编辑这份！1770 条）
│   │   ├── data/               # 分片输出（由 split-prompts.js 生成，勿手改）
│   │   │   └── chunk-1..5.js
│   │   └── prompts-intl-*.js   # 多语言分包（懒加载）
│   └── vendor/fontawesome/     # 自托管图标库（CSS + 字体）
├── CONTRIBUTING.md             # 协作与投稿指南
└── README.md
```

## 数据分片（性能）

主库 `prompts.js`（约 2.3MB）拆分为 5 个分片（`assets/js/data/chunk-*.js`），浏览器**并行下载**——整体加载更快，且单分片网络失败不再导致全部数据丢失。

**编辑数据后必须重新分片**：

```bash
node split-prompts.js   # 重新生成 chunk-*.js
```

再运行「更新网站.bat」发布。

## 自定义

- **增删提示词**：编辑 `assets/js/prompts.js`（字段：`id, cat, tags, lang, title, titleZh, titleEn, prompt, source, sourceUrl, contributor, heat, verified, community`）→ 运行 `node split-prompts.js`。`prompt` 保持源头语言原文，`titleZh` 只作中文辅助标签。
- **新增行业**：在 `main.js` 的 `window.PROMPT_CATEGORIES` 增加一项（`key` + Font Awesome `icon`），数据用相同 `cat` 值。
- **场景搜索词**：`main.js` 中的 `SCENARIO` 映射对象。
- **配色**：`assets/css/style.css` 顶部 `:root` 与 `[data-theme="dark"]` 变量。
