#!/usr/bin/env node
/** cleanup-p5.js — P5: 去除高度重复（2026-09-02）
 *  规则：
 *    规则1 标题完全重复 → 保留 verified/heat 高者，删其余
 *    规则2 同源正文近乎相同(≥0.93)且标题是「X vs Act as X」变体 → 删
 *    规则3 同源正文完全重复(≥0.98)标题不同 → 删（langgptai 中英重名）
 *  排除：MotionSites 同构模板（保留）
 *  用法：node cleanup-p5.js          # dry-run
 *        node cleanup-p5.js --apply  # 写回 + 自验
 */
const fs = require('fs'), vm = require('vm');
const SRC = 'assets/js/prompts.js';
const DO_WRITE = process.argv[2] === '--apply';
const raw = fs.readFileSync(SRC, 'utf8');

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(raw, ctx);
const P = ctx.window.PROMPTS;
const norm = s => (s || '').replace(/\s+/g, '').toLowerCase();
const shingle = t => { const s = new Set(); for (let i = 0; i + 2 <= t.length; i++) s.add(t.slice(i, i + 2)); return s; };
const jac = (a, b) => { const sa = shingle(a), sb = shingle(b); let i = 0; sa.forEach(x => { if (sb.has(x)) i++; }); const u = sa.size + sb.size - i; return u ? i / u : 0; };
const srcOf = p => (p.source || 'unknown').split(/[\/|]/)[0];
const keepRank = (a, b) => ((b.verified ? 1 : 0) - (a.verified ? 1 : 0)) || ((b.heat || 0) - (a.heat || 0));

const remove = new Set();
const reasons = [];

// ---- 规则1: 标题完全重复 ----
const tMap = new Map();
P.forEach((p, i) => { const k = norm(p.title); if (!tMap.has(k)) tMap.set(k, []); tMap.get(k).push(i); });
tMap.forEach(idxArr => {
  if (idxArr.length < 2) return;
  const sorted = [...idxArr].sort((a, b) => keepRank(P[a], P[b]));
  sorted.slice(1).forEach(i => { if (!remove.has(i)) { remove.add(i); reasons.push('标题完全重复: ' + P[i].title); } });
});

// ---- 规则2+3: gretelai/MotionSites 之外的源，同源近同 ----
const srcGroups = new Map();
P.forEach((p, i) => { const k = srcOf(p); if (!srcGroups.has(k)) srcGroups.set(k, []); srcGroups.get(k).push(i); });
const seen = new Set();
srcGroups.forEach(idxArr => {
  const src = srcOf(P[idxArr[0]]);
  if (/MotionSites|gretelai/i.test(src)) return;
  for (let a = 0; a < idxArr.length; a++) {
    const ia = idxArr[a]; if (seen.has(ia) || remove.has(ia)) continue;
    const ta = norm(P[ia].prompt); if (ta.length < 40) continue;
    for (let b = a + 1; b < idxArr.length; b++) {
      const ib = idxArr[b];
      if (norm(P[ib].prompt).length < 40) continue;
      const s = jac(ta, norm(P[ib].prompt));
      if (s >= 0.93) {
        // 择优保留
        const [keep, del] = keepRank(P[ia], P[ib]) <= 0 ? [ia, ib] : [ib, ia];
        if (!remove.has(del)) { remove.add(del); reasons.push('正文近同(jac=' + s.toFixed(2) + '): ' + P[del].title + ' → 保留 ' + P[keep].title); }
        seen.add(keep);
        break;
      }
    }
  }
});

const kept = P.filter((_, i) => !remove.has(i));
console.log('总条数:', P.length, '| 待删:', remove.size, '| 保留:', kept.length);
console.log('\n删除明细:');
reasons.forEach(r => console.log('  - ' + r));
console.log('\n按来源统计删除:');
const bySrc = {};
[...remove].forEach(i => { const k = srcOf(P[i]); bySrc[k] = (bySrc[k] || 0) + 1; });
Object.entries(bySrc).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + v + '  ' + k));

if (!DO_WRITE) { console.log('\n(dry-run，未写回。加 --apply 执行)'); process.exit(0); }

// ---- 写回 ----
const head = raw.slice(0, raw.indexOf('['));
const tail = raw.slice(raw.lastIndexOf(']') + 1);
fs.writeFileSync(SRC, head + JSON.stringify(kept, null, 2) + tail, 'utf8');

// ---- 回读自验 ----
const ctx2 = { window: {} }; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx2);
const V = ctx2.window.PROMPTS;
console.log('\n回读:', V.length, '条 |', V.length === kept.length ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');