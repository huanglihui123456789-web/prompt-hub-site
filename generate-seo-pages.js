#!/usr/bin/env node
/**
 * generate-seo-pages.js — 从母本生成 14 个分类静态页 + 重建 sitemap.xml
 *
 * 目的：站点主体是 JS 渲染的单页应用，搜索引擎抓不到 2549 条内容。
 * 分类页 = 可抓取的完整内容（每条含标题/来源/档位/全文），沿用站点视觉语言。
 *
 * 改数据后的发版 SOP：改 prompts.js → node split-prompts.js → node generate-seo-pages.js
 * 运行: node generate-seo-pages.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE_URL = 'https://huanglihui123456789-web.github.io/prompt-hub-site';
const OUT_DIR = path.join(__dirname, 'category');

const SLUGS = {
  '编程/技术': 'programming',
  '前端开发': 'frontend',
  '教育': 'education',
  '效率/生活': 'productivity-life',
  '科研/科学': 'science',
  '医疗健康': 'health',
  '法律': 'legal',
  '设计': 'design',
  'AI绘画': 'ai-art',
  '娱乐/游戏': 'entertainment',
  '写作/内容': 'writing',
  '营销/自媒体': 'marketing',
  '翻译/语言': 'translation',
  '商业/金融': 'business',
};

// ---------- 读母本 ----------
const code = fs.readFileSync(path.join(__dirname, 'assets/js/prompts.js'), 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const P = ctx.window.PROMPTS;
if (!Array.isArray(P) || !P.length) { console.error('母本解析失败'); process.exit(1); }

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const zh = p => (p.titleZh && String(p.titleZh).trim()) ? p.titleZh.trim() : (p.title || '未命名');

const CSS = `
:root{--bg:#f6f3ec;--bg-elev:#fffdf8;--ink:#1c1b18;--ink-soft:#4a4742;--muted:#6f685e;--accent:#b07d2b;--accent-2:#2f6f5e;--accent-3:#d9533b;--line:rgba(28,27,24,.12)}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Noto Sans SC",-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;font-size:15px;line-height:1.75}
.wrap{max-width:860px;margin:0 auto;padding:40px 20px 64px}
header.top{border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:34px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
header.top a{color:var(--accent);text-decoration:none;font-weight:600}
.kicker{font-size:12.5px;font-weight:600;letter-spacing:.2em;color:var(--accent);text-transform:uppercase}
.kicker::before{content:"✦";color:var(--accent-3);margin-right:8px}
h1{font-family:"Noto Serif SC",serif;font-size:clamp(28px,5vw,40px);margin:10px 0 12px;letter-spacing:-.01em}
.intro{color:var(--ink-soft);margin:0 0 8px}
.meta-line{font-size:13px;color:var(--muted);margin:0 0 30px}
article{background:var(--bg-elev);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:0 0 18px}
article h2{font-family:"Noto Serif SC",serif;font-size:19px;margin:0 0 6px;line-height:1.4}
.art-meta{font-size:12px;color:var(--muted);margin:0 0 12px}
.art-meta .badge{border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:10.5px}
.badge-green{color:#27500A;border-color:#97C459;background:#EAF3DE}
.badge-blue{color:#0C447C;border-color:#85B7EB;background:#E6F1FB}
pre{white-space:pre-wrap;word-break:break-word;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:0;font-family:inherit;font-size:13.5px;line-height:1.8;color:var(--ink-soft)}
footer{border-top:1px solid var(--line);margin-top:44px;padding-top:22px;font-size:13.5px}
footer nav{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:10px}
footer a{color:var(--accent);text-decoration:none}
.cta{display:inline-block;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;border-radius:999px;padding:10px 22px;text-decoration:none;font-weight:600;margin:6px 0 26px}
`;

function pageHTML(cat, entries, totalVerified) {
  const slug = SLUGS[cat];
  const title = `${cat}类 AI 提示词大全 · ${entries.length} 条 | PROMPT 提示词库`;
  const desc = `收录 ${entries.length} 条「${cat}」分类的精选 AI 提示词（中文 ${entries.filter(p => p.lang !== 'en').length} 条 / 英文 ${entries.filter(p => p.lang === 'en').length} 条），保留原文逐字收录，标注来源与可信档位，可在线搜索与一键复制。`;
  const items = entries.map(p => {
    const no = String(p._no).padStart(4, '0');
    const badge = p.verified
      ? '<span class="badge badge-green">已校准/精选</span>'
      : '<span class="badge badge-blue">社区/原生</span>';
    return `<article>
  <h2>${esc(zh(p))}</h2>
  <p class="art-meta">No.${no} · ${esc(p.cat)} · ${badge} · 来源：${esc(p.source || '社区投稿')} · ${p.lang === 'en' ? 'EN 原文' : '中文'}</p>
  <pre>${esc(p.prompt || '')}</pre>
</article>`;
  }).join('\n');

  const nav = Object.keys(SLUGS).filter(c => c !== cat)
    .map(c => `<a href="/prompt-hub-site/category/${SLUGS[c]}.html">${esc(c)}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${BASE_URL}/category/${slug}.html" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<link rel="icon" type="image/svg+xml" href="/prompt-hub-site/favicon.svg" />
<link rel="preconnect" href="https://fonts.loli.net" />
<link href="https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@600;700;900&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header class="top">
  <span><span class="kicker">PROMPT LIBRARY</span></span>
  <a href="/prompt-hub-site/">← 返回交互版（搜索 / 筛选 / 一键复制）</a>
</header>
<span class="kicker">${esc(cat)} · 提示词全集</span>
<h1>${esc(cat)}类 AI 提示词（${entries.length} 条）</h1>
<p class="intro">本页完整收录「${esc(cat)}」分类下的全部 ${entries.length} 条 AI 提示词，其中已校准/精选 ${totalVerified} 条。所有正文保留源语言原文、逐字收录，绝不做机器翻译；每条标注来源与可信档位。</p>
<p class="meta-line">想按行业、标签、语言自由筛选，或一键复制带出处署名的提示词，请使用交互版：</p>
<a class="cta" href="/prompt-hub-site/">打开 PROMPT 提示词库交互版 →</a>
${items}
<footer>
  <p style="margin:0 0 4px">浏览其他分类：</p>
  <nav>${nav}</nav>
  <p style="color:var(--muted);margin-top:18px">内容来自开源社区与作者自有库（CC0 · MIT · Apache-2.0 等），零翻译原则逐字收录。© 2026 PROMPT 提示词库</p>
</footer>
</div>
</body>
</html>`;
}

// ---------- 生成 ----------
fs.mkdirSync(OUT_DIR, { recursive: true });
const byCat = {};
P.forEach((p, i) => {
  const cat = SLUGS[p.cat] ? p.cat : null;
  if (!cat) return;
  (byCat[cat] = byCat[cat] || []).push(Object.assign({}, p, { _no: i + 1 }));
});

let totalBytes = 0;
for (const [cat, entries] of Object.entries(byCat)) {
  const html = pageHTML(cat, entries, entries.filter(p => p.verified).length);
  const file = path.join(OUT_DIR, SLUGS[cat] + '.html');
  fs.writeFileSync(file, html, 'utf8');
  totalBytes += Buffer.byteLength(html);
  console.log(`category/${SLUGS[cat]}.html  ${entries.length} 条  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
}

// ---------- sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: BASE_URL + '/', freq: 'daily', pri: '1.0' },
  ...Object.keys(byCat).map(c => ({ loc: `${BASE_URL}/category/${SLUGS[c]}.html`, freq: 'weekly', pri: '0.8' })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log(`\nsitemap.xml 重建：${urls.length} 个 URL（分类页首次进入站点地图）`);
console.log(`分类页合计 ${(totalBytes / 1024 / 1024).toFixed(1)} MB，覆盖 ${Object.values(byCat).reduce((a, b) => a + b.length, 0)} / ${P.length} 条`);
console.log('提醒：robots.txt 已指向 sitemap，无需改动。');
