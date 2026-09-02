#!/usr/bin/env node
/** cleanup-p4.js — P4: 清理 gretelai 中文低质短模板（2026-09-02）
 *  规则：source 含 gretelai && lang==='zh' && 正文去空白后 < 80 字
 *  用法：node cleanup-p4.js          # dry-run，只统计
 *        node cleanup-p4.js --apply  # 写回 prompts.js + 自验
 */
const fs = require('fs'), vm = require('vm');
const SRC = 'assets/js/prompts.js';
const DO_WRITE = process.argv[2] === '--apply';
const raw = fs.readFileSync(SRC, 'utf8');

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(raw, ctx);
const P = ctx.window.PROMPTS;
const norm = s => (s || '').replace(/\s+/g, '');
const hollow = p => /gretelai/i.test(p.source || '') && p.lang === 'zh' && norm(p.prompt).length < 80;

const removed = P.filter(hollow);
console.log('总条数:', P.length);
console.log('P4 候选（gretelai zh <80字）:', removed.length, '→ 清理后:', P.length - removed.length);
console.log('  其中 title 含「扮演/作为/充当」:', removed.filter(p => /(扮演|作为|充当)/.test(p.title || '')).length);

// 额外的潜在候选（仅统计，不删）：gretelai zh 80~160 字 且是空壳角色卡句式
const extra = P.filter(p => /gretelai/i.test(p.source || '') && p.lang === 'zh' &&
  norm(p.prompt).length >= 80 && norm(p.prompt).length < 160 &&
  /(你将|您将|你作为|您作为|作为一名?|担任|充当)/.test(p.prompt));
console.log('\n额外候选（gretelai zh 80~160字 空壳句式，本次不删）:', extra.length);

// 分类影响
const byCat = {};
removed.forEach(p => { byCat[p.cat || '?'] = (byCat[p.cat || '?'] || 0) + 1; });
console.log('\n删除条目的分类分布:');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + v + '  ' + k));

console.log('\n候选样本（前10）:');
removed.slice(0, 10).forEach(p => console.log('  [' + (p.cat || '?') + '] ' + norm(p.prompt).slice(0, 40)));

if (!DO_WRITE) { console.log('\n(dry-run，未写回。加 --apply 执行)'); process.exit(0); }

// ---- 写回（切片拼接，保持 2 空格缩进）----
const keep = P.filter(p => !hollow(p));
const head = raw.slice(0, raw.indexOf('['));
const tail = raw.slice(raw.lastIndexOf(']') + 1);
fs.writeFileSync(SRC, head + JSON.stringify(keep, null, 2) + tail, 'utf8');

// ---- 回读自验 ----
const ctx2 = { window: {} }; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx2);
const V = ctx2.window.PROMPTS;
const left = V.filter(hollow);
console.log('\n回读:', V.length, '条 | 剩余 gretelai zh <80字:', left.length);
console.log(V.length === keep.length && left.length === 0 ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');
