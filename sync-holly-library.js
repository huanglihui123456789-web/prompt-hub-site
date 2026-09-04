/**
 * 增量同步用户本地「好莱坞大片电影风格提示词库」→ prompts.js
 * 幂等：已入库的按 id 比对
 *   - id 存在 + 内容一致 → 跳过
 *   - id 存在 + 内容不同 → 更新 prompt（同步用户的修改）
 *   - id 不存在 → 新增
 * 策略延续用户确认：原文零改动；source=用户投稿（好莱坞大片电影风格提示词库）；contributor=@用户
 * 运行: node sync-holly-library.js
 */
const fs = require('fs');
const path = require('path');

const LIB_DIR = 'C:/Users/联想笔记本/好莱坞大片电影风格提示词库';
const PROMPTS_PATH = 'assets/js/prompts.js';

const text = fs.readFileSync(PROMPTS_PATH, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const byId = new Map(prompts.map(p => [p.id, p]));

const source = '用户投稿（好莱坞大片电影风格提示词库）';
const contributor = '@用户';

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/_Prompt\.txt$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}
const files = walk(LIB_DIR, []);
console.log(`扫描到 ${files.length} 个 *_Prompt.txt`);

function slugify(s) {
  return s
    .replace(/_Prompt$/i, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const added = [];
const updated = [];
const skipped = [];

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const prompt = raw.replace(/\s+$/, '');

  const parentDir = path.basename(path.dirname(file));
  const fileStem = path.basename(file).replace(/_Prompt\.txt$/i, '');

  let filmZh = parentDir, descZh = '';
  const m = parentDir.match(/^(?:\d+)[_－](.+?)[_－](.+)$/);
  if (m) { filmZh = m[1]; descZh = m[2]; }

  const engTitle = fileStem.replace(/_/g, ' ').trim();
  const baseSlug = 'hollylib-' + slugify(fileStem);

  // 解析该文件的序号（父目录开头数字），用于同 slug 多版本时的稳定映射
  const numMatch = parentDir.match(/^(\d+)[_－]/);
  const num = numMatch ? numMatch[1] : null;

  // 候选 id：基础 slug，若被别的条目占用则尝试 -序号 / -2 -3 ...
  const candidates = [baseSlug];
  if (num) candidates.push(`${baseSlug}-${num}`);
  let i = 2;
  while (i < 50) { candidates.push(`${baseSlug}-${i}`); i++; }

  let targetId = null;
  for (const c of candidates) {
    if (!byId.has(c)) { targetId = c; break; }
    // 已存在：判断是否是"同一文件"——用 titleZh + 英文 title 双重确认
    const e = byId.get(c);
    if (e && e.title === engTitle && e.titleZh === (descZh ? `${filmZh}·${descZh}` : filmZh)) {
      targetId = c; break;
    }
  }
  if (targetId === null) { console.warn('  跳过（无法定位条目）:', fileStem); continue; }

  const titleZh = descZh ? `${filmZh}·${descZh}` : filmZh;

  if (byId.has(targetId)) {
    const e = byId.get(targetId);
    if (e.prompt === prompt) { skipped.push(targetId); continue; }
    e.prompt = prompt;
    e.title = engTitle;
    e.titleZh = titleZh;
    e.tags = ['设计', 'Midjourney', '电影美学', '好莱坞', filmZh, 'AI绘画'];
    updated.push(targetId);
  } else {
    const entry = {
      id: targetId,
      cat: '设计',
      tags: ['设计', 'Midjourney', '电影美学', '好莱坞', filmZh, 'AI绘画'],
      title: engTitle,
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
      lang: 'en',
      views: 500,
      copies: 50,
      score: 7.6
    };
    prompts.push(entry);
    byId.set(targetId, entry);
    added.push(targetId);
  }
}

fs.writeFileSync(PROMPTS_PATH, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`\n新增 ${added.length} 条`);
console.log(`更新 ${updated.length} 条`);
console.log(`跳过（无变化）${skipped.length} 条`);
console.log(`母本现在 ${prompts.length} 条`);
if (added.length) {
  console.log('\n新增条目:');
  added.forEach(id => console.log('  + ' + id + '  ' + byId.get(id).titleZh));
}
if (updated.length) {
  console.log('\n更新条目:');
  updated.forEach(id => console.log('  ~ ' + id + '  ' + byId.get(id).titleZh));
}
