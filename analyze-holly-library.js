const fs = require('fs');
const path = require('path');

const LIB = 'C:/Users/联想笔记本/好莱坞大片电影风格提示词库';
function walk(d, a) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, a);
    else if (/_Prompt\.txt$/i.test(e.name)) a.push(f);
  }
  return a;
}
const files = walk(LIB, []);

const aiList = ['photorealistic', 'hyper-realistic', 'hyperrealistic', 'hyper-detailed',
  'ultra-detailed', 'ultra detailed', '8k', 'masterpiece', 'breathtaking',
  'museum-quality', 'staggering', 'hyper-real', 'ultra-high', 'award-winning'];
const hwRe = /(ARRIFLEX|ARRI ALEXA|Panavision|Cooke|Zeiss|Leica|Hasselblad|Technovision|Mitchell|IMAX|70mm|65mm|35mm|Super ?16|anamorphic|spherical)/gi;
const filmRe = /(Kodak Vision[0-9]? ?[0-9]{3,4}[A-Za-z]?|Eastman [0-9]{3,4}|Double-X|Fujicolor|Technicolor|Agfa|bleach-bypass|cross-process)/gi;

const chars = [], ar = {}, aiWords = {};
const hw = new Set(), film = new Set();
let styleRaw = 0, v6 = 0, video = 0;

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
  const body = t.split(/\[Video Motion Specs\]/)[0];
  chars.push(body.trim().length);
  const m = body.match(/--ar\s+([\d.]+:\d)/);
  if (m) ar[m[1]] = (ar[m[1]] || 0) + 1;
  if (/--style\s+raw/.test(body)) styleRaw++;
  if (/--v\s*6/.test(body)) v6++;
  if (/\[Video Motion Specs\]/.test(t)) video++;
  for (const w of aiList) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const mm = body.match(re);
    if (mm) aiWords[w] = (aiWords[w] || 0) + mm.length;
  }
  for (const x of body.match(hwRe) || []) hw.add(x);
  for (const x of body.match(filmRe) || []) film.add(x);
}
chars.sort((a, b) => a - b);
const p = q => chars[Math.floor(chars.length * q)];

console.log('=== 全库 ' + files.length + ' 条 · 量化统计 ===');
console.log('\n[正文长度] 最短 ' + chars[0] + ' | p25 ' + p(.25) + ' | 中位 ' + p(.5) + ' | p75 ' + p(.75) + ' | 最长 ' + chars[chars.length - 1]);
console.log('\n[参数规范] --style raw: ' + styleRaw + '/' + files.length + ' | --v6: ' + v6 + '/' + files.length + ' | 含视频运镜: ' + video + '/' + files.length);
console.log('[画幅分布] ' + JSON.stringify(ar));
console.log('\n[AI味词频 · 全库总出现次数]');
Object.entries(aiWords).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k + ': ' + v));
console.log('\n[硬件锚定 · 去重 ' + hw.size + ' 种]');
console.log('  ' + [...hw].sort().join(' | '));
console.log('\n[胶片/工艺锚定 · 去重 ' + film.size + ' 种]');
console.log('  ' + [...film].sort().join(' | '));
