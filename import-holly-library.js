/**
 * 批量吸收用户本地「好莱坞大片电影风格提示词库」（106 个 .txt）
 * 递归读取目录下所有 *_Prompt.txt，逐条入库。
 * 策略（用户确认）：
 *   - 全量吸收 106 条，同片也保留（不按片名去重）
 *   - 原文零改动：prompt 字段 = 文件全文（含 [Video Motion Specs]: 标签原样保留）
 *   - source = 用户投稿（好莱坞大片电影风格提示词库），contributor = @用户
 * 运行: node import-holly-library.js
 */
const fs = require('fs');
const path = require('path');

const LIB_DIR = 'C:/Users/联想笔记本/好莱坞大片电影风格提示词库';
const PROMPTS_PATH = 'assets/js/prompts.js';

// ---- 读母本 ----
const text = fs.readFileSync(PROMPTS_PATH, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
const existingIds = new Set(prompts.map(p => p.id));

const source = '用户投稿（好莱坞大片电影风格提示词库）';
const contributor = '@用户';

// 递归收集所有 *_Prompt.txt
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

const newItems = [];
const collisions = [];
const seenSlug = new Set();

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); // 去 BOM
  const prompt = raw.replace(/\s+$/, ''); // 去尾部空白，保留内部换行

  const parentDir = path.basename(path.dirname(file)); // 如 01_黑客帝国_赛博黑色电影
  const fileStem = path.basename(file).replace(/_Prompt\.txt$/i, '');

  // 解析父目录：NN_中文片名_描述
  let filmZh = parentDir, descZh = '';
  const m = parentDir.match(/^(?:\d+)[_－](.+?)[_－](.+)$/);
  if (m) { filmZh = m[1]; descZh = m[2]; }

  const engTitle = fileStem.replace(/_/g, ' ').trim();

  // 唯一 id
  let slug = 'hollylib-' + slugify(fileStem);
  if (seenSlug.has(slug) || existingIds.has(slug)) {
    let i = 2;
    while (seenSlug.has(slug + '-' + i) || existingIds.has(slug + '-' + i)) i++;
    slug = slug + '-' + i;
  }
  if (existingIds.has(slug)) { collisions.push(slug); continue; }
  seenSlug.add(slug);

  const titleZh = descZh ? `${filmZh}·${descZh}` : filmZh;

  newItems.push({
    id: slug,
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
  });
}

if (collisions.length) throw new Error('ID 冲突: ' + collisions.join(', '));

prompts.push(...newItems);
fs.writeFileSync(PROMPTS_PATH, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`已添加 ${newItems.length} 条，母本现在 ${prompts.length} 条`);
console.log('新增 ID 示例:', newItems.slice(0, 6).map(x => x.id).join(', '), '...');
