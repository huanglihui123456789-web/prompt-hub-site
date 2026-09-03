/* 自产内容质量校验（一次性工具，非站点运行时依赖）
   用法：node qc-original.js
   检查项：占位符配对 / 长度分布 / 结构化要素 / 内部重复 / 模板残留 */
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {} };
vm.createContext(ctx);
fs.readdirSync('assets/js/data')
  .filter(f => f.startsWith('chunk-'))
  .forEach(f => vm.runInContext(fs.readFileSync('assets/js/data/' + f, 'utf8'), ctx));

const P = ctx.window.PROMPTS;
const orig = P.filter(p => (p.source || '').includes('原创'));

console.log('=== 站内原创：' + orig.length + ' 条 / 全库 ' + P.length + ' 条 ===\n');

// 1. 占位符配对（逐字符扫描，避免正则转义坑）
// 注意：不检查 < > —— 技术类提示词里它常作比较符/箭头（<2.5s、>8 项、=>），会大量误报
const PAIRS = { '[': ']', '【': '】', '（': '）', '(': ')' };
function checkBrackets(text) {
  const st = [];
  for (const ch of text) {
    if (PAIRS[ch]) st.push(ch);
    else if (Object.values(PAIRS).includes(ch)) {
      if (!st.length || PAIRS[st.pop()] !== ch) return '括号不配对:' + ch;
    }
  }
  return st.length ? '未闭合:' + st.join('') : null;
}
function checkBrace(text) {
  const open = (text.match(/\{\{/g) || []).length;
  const close = (text.match(/\}\}/g) || []).length;
  return open !== close ? `{{}} 左${open}右${close}` : null;
}

const bad = [];
orig.forEach(p => {
  const e = [checkBrackets(p.prompt), checkBrace(p.prompt)].filter(Boolean);
  if (e.length) bad.push({ id: p.id, t: p.title.slice(0, 20), cat: p.cat, e: e.join(' | ') });
});
console.log('【1】占位符/括号不配对：' + bad.length + ' 条');
bad.slice(0, 15).forEach(x => console.log('   ✗ ' + x.id + ' [' + x.cat + '] ' + x.t + ' → ' + x.e));

// 2. 长度分布
const L = orig.map(p => p.prompt.length).sort((a, b) => a - b);
const q = f => L[Math.floor(L.length * f)];
console.log('\n【2】长度(字符)：最短 ' + L[0] + ' | p25 ' + q(0.25) + ' | 中位 ' + q(0.5) +
  ' | p75 ' + q(0.75) + ' | 最长 ' + L[L.length - 1]);
console.log('   <100字 ' + L.filter(x => x < 100).length + ' 条 | <200字 ' +
  L.filter(x => x < 200).length + ' 条');

// 3. 结构化要素
const hasStep = orig.filter(p => /(步骤|1\.|①|第一步|首先)/.test(p.prompt)).length;
const hasOut = orig.filter(p => /(输出|格式|要求|请给出|返回)/.test(p.prompt)).length;
const hasRole = orig.filter(p => /(你是|充当|扮演|作为一[名个位])/.test(p.prompt)).length;
console.log('\n【3】结构化：含步骤 ' + hasStep + ' | 含输出/格式要求 ' + hasOut +
  ' | 含角色设定 ' + hasRole + ' （共 ' + orig.length + '）');

// 4. 内部重复
const seen = new Set();
const dup = [];
orig.forEach(p => {
  const h = p.prompt.replace(/\s+/g, '');
  if (seen.has(h)) dup.push(p.id); else seen.add(h);
});
console.log('\n【4】自产内部完全重复：' + dup.length + ' 条' + (dup.length ? ' → ' + dup.slice(0, 6).join(', ') : ''));

// 5. 模板残留（排除「占位符」一词：它在配色/表单类提示词里是合法正文）
const sus = orig.filter(p => /待填|TODO|xxx|示例文本|此处填写|XXX/i.test(p.prompt));
console.log('【5】模板残留痕迹：' + sus.length + ' 条' +
  (sus.length ? ' → ' + sus.slice(0, 5).map(p => p.id).join(', ') : ''));

// 6. 分类分布
const byCat = {};
orig.forEach(p => { byCat[p.cat] = (byCat[p.cat] || 0) + 1; });
console.log('\n【6】分类分布：');
Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('   ' + k + ': ' + v));

// 7. 抽样（各分类首条前 120 字）
console.log('\n【7】抽样预览（每分类 1 条）：');
const picked = new Set();
orig.forEach(p => {
  if (!picked.has(p.cat)) {
    picked.add(p.cat);
    console.log('\n◆ [' + p.cat + '] ' + p.title);
    console.log('   ' + p.prompt.slice(0, 160).replace(/\n/g, ' / ') + '…');
  }
});
