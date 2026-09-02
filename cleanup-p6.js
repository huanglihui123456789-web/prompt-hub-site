#!/usr/bin/env node
/** cleanup-p6.js — P6: 清理 prompts.chat「X vs Act as X」剩余重复变体（2026-09-02）
 *  规则：同源(prompts.chat) + 标题仅差 Act as/Be a 前缀 + 正文 jac>=0.75 → 删低优者
 *  排除：MotionSites（同构模板，保留）
 *  用法：node cleanup-p6.js          # dry-run
 *        node cleanup-p6.js --apply  # 写回 + 自验
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

// 只处理 prompts.chat 内部
const pc = P.map((p, i) => [p, i]).filter(([p]) => srcOf(p).includes('prompts.chat'));
for (let a = 0; a < pc.length; a++) {
  const [pa, ia] = pc[a];
  if (remove.has(ia)) continue;
  const ta = norm(pa.prompt); if (ta.length < 40) continue;
  for (let b = a + 1; b < pc.length; b++) {
    const [pb, ib] = pc[b];
    if (remove.has(ib)) continue;
    const tb = norm(pb.prompt); if (tb.length < 40) continue;
    // 标题归一化后（去 Act as/Be a 前缀）相同，才是同一提示词的变体
    const tNorm = t => norm(t).replace(/^(act as|be a|be an|act like|a)\s*/, '').trim();
    if (tNorm(pa.title) !== tNorm(pb.title)) continue;
    const s = jac(ta, tb);
    if (s >= 0.75) {
      const [keep, del] = keepRank(pa, pb) <= 0 ? [ia, ib] : [ib, ia];
      if (!remove.has(del)) {
        remove.add(del);
        reasons.push('同题变体(jac=' + s.toFixed(2) + '): ' + P[del].title + ' → 保留 ' + P[keep].title);
      }
    }
  }
}

const kept = P.filter((_, i) => !remove.has(i));
console.log('总条数:', P.length, '| 待删:', remove.size, '| 保留:', kept.length);
console.log('\n删除明细:');
reasons.forEach(r => console.log('  - ' + r));

if (!DO_WRITE) { console.log('\n(dry-run，未写回。加 --apply 执行)'); process.exit(0); }

const head = raw.slice(0, raw.indexOf('['));
const tail = raw.slice(raw.lastIndexOf(']') + 1);
fs.writeFileSync(SRC, head + JSON.stringify(kept, null, 2) + tail, 'utf8');

const ctx2 = { window: {} }; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx2);
const V = ctx2.window.PROMPTS;
console.log('\n回读:', V.length, '条 |', V.length === kept.length ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');