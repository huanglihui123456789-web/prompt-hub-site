#!/usr/bin/env node
/** cleanup-p2p3.js — P2 内容去重 + P3 垃圾条清理（2026-09-02） */
const fs = require('fs'), vm = require('vm');
const SRC = 'assets/js/prompts.js';
const raw = fs.readFileSync(SRC, 'utf8');

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(raw, ctx);
const P = ctx.window.PROMPTS;
const before = P.length;

// ---- P2: 正文哈希去重（保留 verified 优先 > heat 高 > 顺序靠前）----
const groups = new Map();
P.forEach((p, i) => {
  const k = (p.prompt || '').replace(/\s+/g, '').toLowerCase();
  if (!k) return;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(i);
});
const remove = new Set();
let dupGroups = 0;
groups.forEach(idxArr => {
  if (idxArr.length < 2) return;
  dupGroups++;
  idxArr.sort((a, b) => {
    const pa = P[a], pb = P[b];
    if ((pb.verified ? 1 : 0) !== (pa.verified ? 1 : 0)) return (pb.verified ? 1 : 0) - (pa.verified ? 1 : 0);
    if ((pb.heat || 0) !== (pa.heat || 0)) return (pb.heat || 0) - (pa.heat || 0);
    return a - b;
  });
  idxArr.slice(1).forEach(i => remove.add(i));
});

// ---- P3: 明确垃圾条 ----
P.forEach((p, i) => {
  if (remove.has(i)) return;
  const t = (p.prompt || '').trim();
  const hollow = (p.source || '').includes('gretelai') && t.length < 60 && /(你将|您将)扮演一名?.{2,12}(的角色|的角色。)$/.test(t);
  const broken = t.length < 50 && /[：:，,]$/.test(t);
  if (hollow || broken) remove.add(i);
});

const kept = P.filter((_, i) => !remove.has(i));
console.log('原始:', before, '| 正文重复组:', dupGroups, '| 删除合计:', remove.size, '| 保留:', kept.length);
console.log('verified(true/false):', kept.filter(p => p.verified).length, '/', kept.filter(p => !p.verified).length);

// ---- 安全写回（切片拼接，不用正则替换；保持 2 空格缩进可编辑格式）----
const head = raw.slice(0, raw.indexOf('['));
const tail = raw.slice(raw.lastIndexOf(']') + 1);
const out = head + JSON.stringify(kept, null, 2) + tail;
fs.writeFileSync(SRC, out, 'utf8');

// ---- 回读自验 ----
const ctx2 = { window: {} }; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx2);
const V = ctx2.window.PROMPTS;
const hash2 = new Set();
let dup2 = 0, hollow2 = 0, broken2 = 0;
V.forEach(p => {
  const k = (p.prompt || '').replace(/\s+/g, '').toLowerCase();
  if (hash2.has(k)) dup2++; else hash2.add(k);
  const t = (p.prompt || '').trim();
  if ((p.source || '').includes('gretelai') && t.length < 60 && /(你将|您将)扮演一名?.{2,12}(的角色|的角色。)$/.test(t)) hollow2++;
  if (t.length < 50 && /[：:，,]$/.test(t)) broken2++;
});
console.log('回读:', V.length, '条 | 剩余正文重复:', dup2, '| 空转:', hollow2, '| 残缺:', broken2);
console.log(V.length === kept.length && dup2 === 0 && hollow2 === 0 && broken2 === 0 ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');
