#!/usr/bin/env node
/** cleanup-p7.js — P7: 清理跨来源重复（2026-09-02）
 *  仅清理明确识别的 2 对：PlexPt「充当 Linux 终端/充当英翻中」≈ langgptai「模拟 Linux 终端/中文翻译」
 *  用法：node cleanup-p7.js --apply
 */
const fs = require('fs'), vm = require('vm');
const SRC = 'assets/js/prompts.js';
const raw = fs.readFileSync(SRC, 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(raw, ctx);
const P = ctx.window.PROMPTS;

// 精确按标题+正文首段匹配目标条目
const targets = [
  // PlexPt 版「充当 Linux 终端」（langgptai 版标题「模拟 Linux 终端」更规范，保留 langgptai）
  { src: 'PlexPt', title: '充当 Linux 终端' },
  // PlexPt 版「充当英翻中」（langgptai 版「中文翻译」保留）
  { src: 'PlexPt', title: '充当英翻中' }
];
const remove = new Set();
const reasons = [];
targets.forEach(t => {
  const hit = P.find(p => (p.source || '').includes(t.src) && p.title.trim() === t.title);
  if (hit) {
    const pair = P.filter(q => q.title.trim() === t.title || (t.title === '充当 Linux 终端' && q.title.trim() === '模拟 Linux 终端') || (t.title === '充当英翻中' && q.title.trim() === '中文翻译'));
    const keep = pair.find(q => q !== hit);
    if (keep) {
      remove.add(hit.id);
      reasons.push('跨来源重复: ' + hit.title + ' [PlexPt] → 保留 ' + keep.title + ' [langgptai] (v=' + keep.verified + ', h=' + (keep.heat || 0) + ')');
    }
  }
});

const kept = P.filter(p => !remove.has(p.id));
console.log('总条数:', P.length, '| 待删:', remove.size, '| 保留:', kept.length);
reasons.forEach(r => console.log('  - ' + r));
if (remove.size === 0) { console.log('无匹配，退出'); process.exit(1); }
if (process.argv[2] !== '--apply') { console.log('(dry-run，加 --apply 执行)'); process.exit(0); }

const head = raw.slice(0, raw.indexOf('['));
const tail = raw.slice(raw.lastIndexOf(']') + 1);
fs.writeFileSync(SRC, head + JSON.stringify(kept, null, 2) + tail, 'utf8');

const ctx2 = { window: {} }; vm.createContext(ctx2);
vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx2);
console.log('回读:', ctx2.window.PROMPTS.length, '条 |', ctx2.window.PROMPTS.length === kept.length ? '=== 清理完成，自验通过 ===' : '!!! 自验未通过');