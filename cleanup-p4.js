#!/usr/bin/env node
/** cleanup-p4.js — P4: 清理 gretelai 中文低质模板（2026-09-02，阈值 v2）
 *  规则（source 含 gretelai && lang==='zh'）：
 *    档1：正文去空白后 < 80 字           → 纯模板，必删
 *    档2：80~160 字 且 以角色扮演句式开头 → 空壳角色卡，删
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
// 角色扮演空壳开场（开头锚定，限定 80~160 档，避免任意位置误伤）
const ROLE_OPEN = /^(你将|您将|你作为|您作为|作为一位|作为一名|担任|充当|我要你(扮演|充当)|扮演一名)/;
const hollow = p => {
  if (!/gretelai/i.test(p.source || '') || p.lang !== 'zh') return false;
  const t = norm(p.prompt), L = t.length;
  if (L < 80) return true;
  if (L < 160 && ROLE_OPEN.test(t)) return true;
  return false;
};

const removed = P.filter(hollow);
const t1 = P.filter(p => /gretelai/i.test(p.source || '') && p.lang === 'zh' && norm(p.prompt).length < 80);
const t2 = removed.filter(p => norm(p.prompt).length >= 80);
console.log('总条数:', P.length);
console.log('P4 候选合计:', removed.length, '→ 清理后:', P.length - removed.length);
console.log('  档1 (<80字):', t1.length, '| 档2 (80~160 空壳角色卡):', t2.length);

// 分类影响
const byCat = {};
removed.forEach(p => { byCat[p.cat || '?'] = (byCat[p.cat || '?'] || 0) + 1; });
console.log('\n删除条目的分类分布:');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + v + '  ' + k));

console.log('\n候选样本（档2 前10，80~160 字）:');
t2.slice(0, 10).forEach(p => console.log('  [' + (p.cat || '?') + '] ' + norm(p.prompt).slice(0, 52)));

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
console.log('\n回读:', V.length, '条 | 剩余 gretelai zh 低质候选:', left.length);
console.log(V.length === keep.length && left.length === 0 ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');
