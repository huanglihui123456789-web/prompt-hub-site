/**
 * 增量同步用户本地「极限工业级图片提示词库」→ prompts.js（幂等，可复跑）
 *
 * 覆盖范围（2026-09-05 与用户确认的整库）：
 *   A. 好莱坞库内 8 大场景全集（头像/电商/Logo/海报/摄影/插画/动漫/壁纸 各30条）
 *   B. 世界文明极境·工业级系列（基础库4条 + 第二十九~三十五辑，库内；第三十六~三十七辑，C盘根目录）
 *   C. 中式雪景系列（第二十八辑 / 进阶空间与微观气象 / 终极参数极限版）
 *   D. 赛博机械江湖（电影剧照一/二辑 + 漫画风格第三辑，C盘根目录，编号01~20连续）
 *
 * 幂等规则（同 sync-holly-library.js）：
 *   - id 存在 + 内容一致 → 跳过
 *   - id 存在 + 内容不同 → 更新 prompt/title/titleZh/tags
 *   - id 不存在 → 新增
 * 红线：正文逐字零改动（仅去 BOM/首尾空白）；promptEn 恒为空。
 * id 规则：imglib-<系列码>-<路径序号链>，路径序号取各级目录/文件名的前导数字，保证复跑稳定。
 * 运行: node sync-image-library.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LIB = 'C:/Users/联想笔记本/好莱坞大片电影风格提示词库';
const HOME = 'C:/Users/联想笔记本';
const PROMPTS_PATH = path.join(__dirname, 'assets/js/prompts.js');

// ---------- 系列清单 ----------
const SCENES = [
  ['01_头像与人设全集_30条', '头像人设'],
  ['02_电商产品图全集_30条', '电商产品图'],
  ['03_Logo与品牌标识全集_30条', 'Logo品牌标识'],
  ['04_海报与封面全集_30条', '海报封面'],
  ['05_摄影风格全集_30条', '摄影风格'],
  ['06_插画与绘本全集_30条', '插画绘本'],
  ['07_动漫与二次元全集_30条', '动漫二次元'],
  ['08_壁纸与背景全集_30条', '壁纸背景'],
];
const SERIES = [];
SCENES.forEach(([dir, tag], i) => {
  SERIES.push({ code: 's' + String(i + 1).padStart(2, '0'), dir: path.join(LIB, dir), tag });
});
// 世界文明极境：库内（基础库 + 各辑）+ C盘根目录（各辑）
for (const root of [LIB, HOME]) {
  for (const name of fs.readdirSync(root)) {
    if (!name.startsWith('世界文明极境')) continue;
    const full = path.join(root, name);
    if (!fs.statSync(full).isDirectory()) continue;
    const m = name.match(/第(.+?)辑/);
    const vol = m ? cn2num(m[1]) : 0;
    SERIES.push({ code: 'sj' + String(vol).padStart(2, '0'), dir: full, tag: '世界文明极境' });
  }
}
// 中式雪景系列
SERIES.push({ code: 'zs28', dir: path.join(LIB, '中式雪景与宏大古建美学提示词库_第二十八辑'), tag: '中式雪景古建' });
SERIES.push({ code: 'zsjj', dir: path.join(LIB, '中式雪景古建体系_进阶空间与微观气象'), tag: '中式雪景古建' });
SERIES.push({ code: 'zszj', dir: path.join(LIB, '中式雪景庭院与红枫美学_终极参数极限版'), tag: '中式雪景古建' });
// 赛博机械江湖
SERIES.push({ code: 'cb1', dir: path.join(HOME, '赛博机械江湖_工业级电影剧照提示词'), tag: '赛博机械江湖' });
SERIES.push({ code: 'cb2', dir: path.join(HOME, '赛博机械江湖_工业级电影剧照提示词_第二辑'), tag: '赛博机械江湖' });
SERIES.push({ code: 'cb3', dir: path.join(HOME, '赛博机械江湖_工业级漫画风格提示词_第三辑'), tag: '赛博机械江湖' });

function cn2num(s) {
  const M = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const ten = s.indexOf('十');
  if (ten === -1) return M[s] || 0;
  const t = ten > 0 ? (M[s[ten - 1]] || 1) : 1;
  const o = ten + 1 < s.length ? (M[s[ten + 1]] || 0) : 0;
  return t * 10 + o;
}

// ---------- 读取母本 ----------
const text = fs.readFileSync(PROMPTS_PATH, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const byId = new Map(prompts.map(p => [p.id, p]));

const source = '用户投稿（极限工业级图片提示词库）';
const contributor = '@用户';

function leadNum(s) {
  const m = s.match(/^(\d+)/);
  return m ? m[1] : null;
}
function hash8(s) {
  return crypto.createHash('md5').update(s, 'utf8').digest('hex').slice(0, 8);
}
function cleanStem(stem) {
  return stem
    .replace(/^(\d+)[_－]/, '')                       // 去前导序号
    .replace(/_?(中文)?(极限)?工业级提示词$/, '')      // 去各类"提示词"后缀
    .replace(/_提示词$/, '')
    .replace(/_/g, '·')
    .trim();
}

const added = [];
const updated = [];
const skipped = [];
const contentSeen = new Map(); // prompt 正文 hash → id（只告警不阻断）
let dupContent = 0;

for (const series of SERIES) {
  if (!fs.existsSync(series.dir)) {
    console.warn(`⚠️ 系列目录不存在，跳过: ${series.dir}`);
    continue;
  }
  // 收集该系列下所有 .txt（含子目录）
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.txt')) files.push(full);
    }
  })(series.dir);

  for (const file of files) {
    const rel = path.relative(series.dir, file);
    const relParts = rel.split(path.sep);
    const fileStem = path.basename(file).replace(/\.txt$/i, '');

    // id：取各级前导数字；缺数字的层级用短哈希兜底
    const segs = relParts.map((p, idx) => {
      const n = leadNum(p);
      if (n) return n;
      return 'h' + hash8(p + '|' + idx);
    });
    const id = ['imglib', series.code, ...segs].join('-');

    const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
    const prompt = raw.replace(/\s+$/, '');
    if (!prompt) { console.warn('  空文件跳过:', file); continue; }

    // 标题：子目录名（去序号）· 文件名（去序号/后缀）
    const subDir = relParts.length >= 2 ? cleanStem(relParts[relParts.length - 2]) : '';
    const fileTitle = cleanStem(fileStem);
    let titleZh;
    if (subDir && fileTitle.startsWith(subDir)) titleZh = fileTitle;
    else if (subDir && subDir !== fileTitle) titleZh = `${subDir}·${fileTitle}`;
    else titleZh = fileTitle || series.tag;

    const h = hash8(prompt);
    if (contentSeen.has(h)) {
      dupContent++;
      console.warn(`  ⚠️ 内容与已入库条目重复（${contentSeen.get(h)}）: ${id}`);
    } else {
      contentSeen.set(h, id);
    }

    const tags = ['设计', 'Midjourney', 'AI绘画', series.tag];

    if (byId.has(id)) {
      const e = byId.get(id);
      if (e.prompt === prompt) { skipped.push(id); continue; }
      e.prompt = prompt;
      e.title = titleZh;
      e.titleZh = titleZh;
      e.tags = tags;
      updated.push(id);
    } else {
      const entry = {
        id,
        cat: 'AI绘画',
        tags,
        title: titleZh,
        titleZh,
        prompt,
        titleEn: '',
        promptEn: '',
        source,
        sourceUrl: '',
        contributor,
        heat: 4,
        verified: false,
        community: true,
        lang: 'zh',
        views: 500,
        copies: 50,
        score: 7.6
      };
      prompts.push(entry);
      byId.set(id, entry);
      added.push(id);
    }
  }
}

// 冲突自检：同 id 必须同内容（幂等保证）
const seenId = new Set();
for (const p of prompts) {
  if (seenId.has(p.id)) throw new Error('母本出现重复 id: ' + p.id);
  seenId.add(p.id);
}

fs.writeFileSync(PROMPTS_PATH, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`\n新增 ${added.length} 条`);
console.log(`更新 ${updated.length} 条`);
console.log(`跳过（无变化）${skipped.length} 条`);
console.log(`正文重复告警 ${dupContent} 条`);
console.log(`母本现在 ${prompts.length} 条`);
if (added.length) {
  const bySeries = {};
  added.forEach(id => { const k = id.split('-')[1]; bySeries[k] = (bySeries[k] || 0) + 1; });
  console.log('\n按系列新增:', JSON.stringify(bySeries, null, 0));
  console.log('\n新增样例（前10）:');
  added.slice(0, 10).forEach(id => console.log('  + ' + id + '  ' + byId.get(id).titleZh));
}
if (updated.length) {
  console.log('\n更新条目:');
  updated.forEach(id => console.log('  ~ ' + id));
}
