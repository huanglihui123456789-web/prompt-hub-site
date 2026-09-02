#!/usr/bin/env node
/**
 * split-prompts.js — 把主库 prompts.js 拆分为 5 个并行加载分片
 *
 * 用法：编辑 assets/js/prompts.js 后运行  node split-prompts.js
 * 输出：assets/js/data/chunk-1.js .. chunk-5.js
 *   - chunk-1: window.PROMPTS = [...]
 *   - chunk-2..5: window.PROMPTS.push(...)
 * 浏览器按 defer 顺序执行，main.js 无需任何改动即可拿到完整 window.PROMPTS。
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = path.join(__dirname, 'assets', 'js', 'prompts.js');
const OUT_DIR = path.join(__dirname, 'assets', 'js', 'data');
const N_CHUNKS = 5;

// 1. 读取并解析主库
const code = fs.readFileSync(SRC, 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const prompts = ctx.window.PROMPTS;
if (!Array.isArray(prompts) || prompts.length === 0) {
  console.error('错误：prompts.js 未解析出 window.PROMPTS 数组');
  process.exit(1);
}

// 2. 按字节体积均衡切分（保序贪心：条目文本长度差异大，按条数切会严重不均）
const sizes = prompts.map(p => Buffer.byteLength(JSON.stringify(p), 'utf8'));
const totalSize = sizes.reduce((a, b) => a + b, 0);
const target = totalSize / N_CHUNKS;
const chunks = [];
let cur = [], curSize = 0;
prompts.forEach((p, i) => {
  // 若当前分片已达标且剩余条目足够再分一轮，则开新分片
  const remaining = N_CHUNKS - chunks.length - 1;
  if (cur.length && curSize + sizes[i] > target && remaining > 0) {
    chunks.push(cur); cur = []; curSize = 0;
  }
  cur.push(p); curSize += sizes[i];
});
if (cur.length) chunks.push(cur);

// 3. 写出分片
fs.mkdirSync(OUT_DIR, { recursive: true });
chunks.forEach((part, i) => {
  const body = JSON.stringify(part);
  const js = i === 0
    ? '/* 自动生成：主库分片 1/' + chunks.length + '（编辑数据请改 prompts.js 后运行 split-prompts.js） */\nwindow.PROMPTS=' + body + ';'
    : '/* 自动生成：主库分片 ' + (i + 1) + '/' + chunks.length + ' */\nwindow.PROMPTS.push(' + body.slice(1, -1) + ');';
  fs.writeFileSync(path.join(OUT_DIR, 'chunk-' + (i + 1) + '.js'), js, 'utf8');
  console.log('chunk-' + (i + 1) + '.js : ' + part.length + ' 条, ' + (Buffer.byteLength(js) / 1024).toFixed(0) + ' KB');
});

// 4. 自验：按序加载分片，确认与主库一致
const ctx2 = { window: {} };
vm.createContext(ctx2);
ctx2.window.PROMPTS = [];
for (let i = 1; i <= chunks.length; i++) {
  vm.runInContext(fs.readFileSync(path.join(OUT_DIR, 'chunk-' + i + '.js'), 'utf8'), ctx2);
}
const merged = ctx2.window.PROMPTS;
const ok = merged.length === prompts.length
  && JSON.stringify(merged) === JSON.stringify(prompts);
console.log('---');
console.log('合计: ' + merged.length + ' / ' + prompts.length + ' 条');
console.log('内容一致性: ' + (ok ? 'OK（与 prompts.js 完全一致）' : '不一致！禁止发布'));
if (!ok) process.exit(2);
console.log('分片完成。下一步：node 更新网站.bat 或手动 commit+push');
