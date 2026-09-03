/* 换行符体检：区分「真换行 U+000A」与「字面反斜杠+n」（后者会在页面上显示成 \n 字符）
   用法：node check-newline.js */
const fs = require('fs');
const vm = require('vm');

const ctx = { window: {} };
vm.createContext(ctx);
fs.readdirSync('assets/js/data')
  .filter(f => f.startsWith('chunk-'))
  .forEach(f => vm.runInContext(fs.readFileSync('assets/js/data/' + f, 'utf8'), ctx));

const P = ctx.window.PROMPTS;
const BACKSLASH = String.fromCharCode(92); // 反斜杠，避免任何转义歧义
const LITERAL = BACKSLASH + 'n';           // 字面 \n（2 字符）
const REAL = String.fromCharCode(10);      // 真换行 U+000A

function count(s, needle) {
  let n = 0, i = 0;
  while ((i = s.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

console.log('=== 全库 ' + P.length + ' 条 · 换行符类型统计 ===');
let withLiteral = 0, withReal = 0, withBoth = 0, withNone = 0;
const bySource = {};

P.forEach(p => {
  const lit = count(p.prompt, LITERAL);
  const real = count(p.prompt, REAL);
  if (lit > 0 && real > 0) withBoth++;
  else if (lit > 0) withLiteral++;
  else if (real > 0) withReal++;
  else withNone++;

  const key = (p.source || '').includes('原创') ? '站内原创' : '外部收录';
  bySource[key] = bySource[key] || { n: 0, lit: 0, real: 0 };
  bySource[key].n++;
  bySource[key].lit += lit;
  bySource[key].real += real;
});

console.log('仅含「字面 \\n」（有 bug）：  ' + withLiteral + ' 条');
console.log('仅含「真换行」(正常)：        ' + withReal + ' 条');
console.log('两者都有：                    ' + withBoth + ' 条');
console.log('无任何换行：                  ' + withNone + ' 条');

console.log('\n=== 按来源 ===');
Object.entries(bySource).forEach(([k, v]) => {
  console.log(k.padEnd(10) + ' 条目 ' + String(v.n).padStart(4) +
    ' | 字面\\n 共 ' + String(v.lit).padStart(5) +
    ' | 真换行 共 ' + String(v.real).padStart(5));
});

// 抽样：确认渲染效果
const sample = P.find(p => count(p.prompt, LITERAL) > 0);
if (sample) {
  console.log('\n=== 抽样（含字面 \\n 的条目）===');
  console.log('id: ' + sample.id + ' | source: ' + sample.source);
  console.log('原始片段: ' + JSON.stringify(sample.prompt.slice(0, 120)));
  console.log('浏览器将渲染为: ' + sample.prompt.slice(0, 120).replace(/[<>]/g, ''));
}
