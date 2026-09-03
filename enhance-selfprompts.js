/* 自产提示词增强（幂等，可重复运行）
   ① 修复：站内原创条目里的「字面 \n」（反斜杠+n）→ 真换行 U+000A
           仅处理站内原创；外部收录源严守零翻译/逐字原则，一个字符都不动
   ② 增强：按分类追加「【输出要求】」三件套（格式 / 篇幅 / 注意 + 信息缺失兜底）
   用法：node enhance-selfprompts.js
   然后：node split-prompts.js 重新分片 */
const fs = require('fs');

const FILE = 'assets/js/prompts.js';
const BS = String.fromCharCode(92);        // 反斜杠
const LITERAL = BS + 'n';                  // 字面 \n（2 字符，页面会显示成 \n）
const REAL = String.fromCharCode(10);      // 真换行 U+000A

// —— 按分类定制的「输出要求」三件套 ——
const SPEC = {
  '设计': ['用 Markdown 分节，色值/尺寸/间距等一律给出具体数值，可用表格对比方案',
    '每节 3 条以内，总长 ≤450 字',
    '每个参数说明取值依据，避免「高级感」「简约」这类无信息量的描述'],
  '前端开发': ['先给可直接运行的代码（含关键注释），再逐点说明原理',
    '代码贴合场景不冗长，说明每条 ≤2 句',
    '标注浏览器兼容性与性能影响；不确定的 API 要明确说明而非臆测'],
  '编程/技术': ['按「结论 → 代码/步骤 → 注意事项」组织',
    '代码精简可复用，说明部分 ≤400 字',
    '明确指出边界条件、异常分支与可能的坑'],
  '营销/自媒体': ['给出 ≥3 个并列方案，每个标注适用场景与预期效果',
    '每条 ≤2 句，口语自然，总长 ≤400 字',
    '避免「赋能/闭环」等空泛词，产出可直接使用文案'],
  '效率/生活': ['清单化或时间表呈现，拿到就能照做',
    '每步 ≤2 句，总长 ≤400 字',
    '步骤必须可执行，避免「注意休息」这类抽象建议'],
  '医疗健康': ['分三节：通俗解读 → 可执行建议 → 就医信号',
    '总长 ≤500 字',
    '只做科普参考、不替代医生诊断；出现警示症状明确建议及时就医'],
  '法律': ['分三节：要点审查 → 风险提示 → 建议动作',
    '总长 ≤500 字',
    '属普法参考、不构成法律意见；涉及具体纠纷建议咨询执业律师'],
  '商业/金融': ['分三节：现状分析 → 方案建议 → 风险提示',
    '总长 ≤450 字',
    '必须提示风险，不承诺任何收益；大额决策建议咨询专业人士'],
  '翻译/语言': ['对照呈现（原文 / 译文），关键处标注处理理由',
    '与原文体量相当，不擅自增删信息',
    '专有名词与术语全文统一，保持原文语气与正式度'],
  '科研/科学': ['分三节：分析 → 方案 → 可行性评估',
    '总长 ≤500 字',
    '严格区分「已证实事实」与「推测」，需要处标注文献或数据来源'],
  '教育': ['分阶段或分步骤，每阶段附可检查的里程碑',
    '总长 ≤450 字',
    '给出可量化的检验方式与跟不上时的调整办法'],
  '写作/内容': ['给出 8-12 个备选，每个标注适用场景',
    '每条 ≤1 句，总长 ≤400 字',
    '避免套路化表达，具体、有信息增量'],
  '娱乐/游戏': ['规则与机制分条列清，可附一个示例回合',
    '总长 ≤450 字',
    '确保规则自洽无漏洞，说明边界情况如何判定'],
};
const DEFAULT_SPEC = ['用 Markdown 分节，每节一个小标题 + 要点',
  '总长 ≤450 字',
  '要点具体可执行，避免空泛建议'];

const text = fs.readFileSync(FILE, 'utf8');
const arr = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

let fixNl = 0, enhanced = 0, skipped = 0;
const catHit = {};

arr.forEach(p => {
  if (!(p.source || '').includes('原创')) return;   // 只动站内原创

  // ① 修复字面 \n
  if (p.prompt.indexOf(LITERAL) !== -1) {
    p.prompt = p.prompt.split(LITERAL).join(REAL);
    fixNl++;
  }

  // ② 追加三件套（幂等）
  if (p.prompt.indexOf('【输出要求】') !== -1) { skipped++; return; }

  const spec = SPEC[p.cat] || DEFAULT_SPEC;
  catHit[p.cat] = (catHit[p.cat] || 0) + 1;

  p.prompt = p.prompt.replace(/[\s\r\n]+$/, '') + REAL + REAL +
    '【输出要求】' + REAL +
    '· 格式：' + spec[0] + REAL +
    '· 篇幅：' + spec[1] + REAL +
    '· 注意：' + spec[2] + REAL +
    '· 若关键信息缺失，先列出需要补充的内容向我提问，不要凭空假设或编造。';
  enhanced++;
});

// 写回（切片拼接，绝不用 re.sub）
// ⚠️ tail 必须从 lastIndexOf(']') + 1 开始——JSON.stringify 已自带结尾的 ']'
//    写成 slice(lastIndexOf(']')) 会多出一个 ']'，文件变 `]];` 直接语法错误
const head = text.slice(0, text.indexOf('['));
const tail = text.slice(text.lastIndexOf(']') + 1);
fs.writeFileSync(FILE, head + JSON.stringify(arr, null, 2) + tail);

console.log('① 修复字面 \\n → 真换行：' + fixNl + ' 条');
console.log('② 追加【输出要求】三件套：' + enhanced + ' 条（已存在跳过 ' + skipped + ' 条）');
console.log('\n分类命中：');
Object.entries(catHit).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log('   ' + k.padEnd(12) + v + ' 条' + (SPEC[k] ? '' : '  ← 用默认模板')));

// 自验
const vm = require('vm');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(FILE, 'utf8'), ctx);
const P = ctx.window.PROMPTS;
const O = P.filter(p => (p.source || '').includes('原创'));
const stillLit = O.filter(p => p.prompt.indexOf(LITERAL) !== -1).length;
const noTail = O.filter(p => p.prompt.indexOf('【输出要求】') === -1).length;
const L = O.map(p => p.prompt.length).sort((a, b) => a - b);
console.log('\n=== 自验 ===');
console.log('全库 ' + P.length + ' 条 | 站内原创 ' + O.length + ' 条');
console.log('残留字面 \\n：' + stillLit + '（应为 0）');
console.log('缺三件套：' + noTail + '（应为 0）');
console.log('长度：最短 ' + L[0] + ' | 中位 ' + L[Math.floor(L.length / 2)] + ' | 最长 ' + L[L.length - 1]);
