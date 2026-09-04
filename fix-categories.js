/**
 * 分类错配修正（gretelai 批次）
 * 目标批次：lang=zh 且 UI 显示标题无汉字的条目（即 gretelai「中文正文+英文标题」批，~707 条）
 * 规则：标题关键词 → 正确分类，按特异性排序，命中即停；无命中保持原分类
 *
 * 用法：
 *   node fix-categories.js            → dry-run（只生成预览报告，不改库）
 *   node fix-categories.js --apply    → 真正落库（改前自动备份）
 */
const fs = require('fs');

const PROMPTS = 'assets/js/prompts.js';
const REPORT = 'design/category-fix-report.md';
const APPLY = process.argv.includes('--apply');

/* ── 规则表：顺序即优先级（具体在前，泛化在后）──
   教训 v2：裸 develop 会误撞 Personal Development / Curriculum Developer（个人成长/课程开发），
   已收紧为 developer|engineer；教育规则提到编程前并去掉 learning（避免撞 Machine Learning） */
const RULES = [
  { cat: '翻译/语言', name: 'translate/linguist', re: /translat|linguist|language policy|language learn|interpreter/i },
  { cat: '法律',      name: 'law/legal', re: /\blaw(yer)?\b|legal|attorney|compliance|regulat/i },
  { cat: '医疗健康',  name: 'health/medical', re: /health|medical|doctor|nurse|dental|clinic|patient|therap|hospital|nutrition|diet|psychiatr|disease|symptom|fitness trainer|wellness/i },
  { cat: '科研/科学', name: 'science/research', re: /scien|research|\blab\b|physics|chemi|biolog|astronom|geolog|mathematic|statisti|environ/i },
  { cat: '教育',      name: 'teach/education', re: /teach|educat|tutor|student|course|school|professor|curriculum|training|academ/i },
  { cat: '编程/技术', name: 'code/cloud/network', re: /\bcode\b|coding|program|developer|software|python|javascript|\bsql\b|\bapi\b|debug|frontend|backend|terminal|linux|\bgit\b|database|cyber|network|algorithm|machine learning|data scien|\bweb\b|website|\bapp\b|\bit\b|cloud|devops|\bengineer/i },
  { cat: '设计',      name: 'design/graphic', re: /\bdesign(er)?\b|graphic|\blogo\b|illustrat|photo|interior|fashion|\bui\b|\bux\b/i },
  { cat: '营销/自媒体', name: 'marketing/brand', re: /market|brand|advertis|social media|\bseo\b|sales|ecommerce|e-commerce|influencer|public relation/i },
  { cat: '商业/金融', name: 'finance/business', re: /financ|invest|stock|account|bank|econom|business|\bhr\b|recruit|supply chain|logistic|real estate/i },
  { cat: '娱乐/游戏', name: 'game/music/film', re: /\bgame|gaming|music|movie|film|\bjoke\b|comedy|party|trivia|sport|anime/i },
  { cat: '写作/内容', name: 'writing/content', re: /writ|content creation|blog|copywrit|story|novelist|poem|editor|journal|screenplay|essay|newsletter/i },
  { cat: '效率/生活', name: 'life/travel/home', re: /travel|recipe|cook|garden|flower|\bhome\b|clean|\bpet\b|shopping|personal assist|habit|relation|parenting|event planner/i },
];

const text = fs.readFileSync(PROMPTS, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const hasHan = s => /[\u4e00-\u9fa5]/.test(s || '');
const shown = p => (p.titleZh && p.titleZh.trim()) ? p.titleZh.trim() : (p.title || '');

// 目标批次：中文正文 + 英文标题（gretelai 批）
const targets = prompts.filter(p => p.lang === 'zh' && !hasHan(shown(p)));
console.log(`目标批次（lang=zh 且标题无汉字）: ${targets.length} 条\n`);

const changes = [], unchanged = [], noHit = [];
for (const p of targets) {
  const title = shown(p);
  const hit = RULES.find(r => r.re.test(title));
  if (!hit) { noHit.push(p); continue; }
  if (hit.cat !== p.cat) changes.push({ p, to: hit.cat, title });
  else unchanged.push(p);
}

console.log(`命中规则且需改分类: ${changes.length} 条`);
console.log(`命中规则但分类已正确: ${unchanged.length} 条（不动）`);
console.log(`无规则命中（保守跳过）: ${noHit.length} 条\n`);

// 按目标分类分组统计
const byTo = {};
changes.forEach(c => (byTo[c.to] = byTo[c.to] || []).push(c));

/* ── 生成报告 ── */
let md = `# 分类错配修正预览（${APPLY ? '已应用' : 'dry-run 预览'}）\n\n`;
md += `- 生成时间：${new Date().toLocaleString('zh-CN')}\n`;
md += `- 目标批次：${targets.length} 条（gretelai：中文正文 + 英文标题）\n`;
md += `- 需改分类：**${changes.length} 条** · 分类已正确 ${unchanged.length} 条 · 无规则命中保守跳过 ${noHit.length} 条\n\n`;
md += `> 规则命中即停（按特异性排序）。每条标注命中关键词，请重点复核有歧义的条目。\n\n`;

for (const [to, list] of Object.entries(byTo).sort((a, b) => b[1].length - a[1].length)) {
  const fromCount = {};
  list.forEach(c => (fromCount[c.p.cat] = (fromCount[c.p.cat] || 0) + 1));
  md += `## → ${to}（${list.length} 条，来自 ${Object.entries(fromCount).map(([k, v]) => `${k} ${v}`).join('、')}）\n\n`;
  md += `| 标题 | 现分类 → 新分类 | 命中词 |\n|------|----------------|--------|\n`;
  for (const c of list) {
    const kw = RULES.find(r => r.cat === c.to).name;
    md += `| ${c.title} | ${c.p.cat} → **${c.to}** | ${kw} |\n`;
  }
  md += `\n`;
}

md += `## 保守跳过（无规则命中，保持原分类 ${noHit.length} 条）\n\n`;
md += noHit.slice(0, 40).map(p => `- ${shown(p)} [${p.cat}]`).join('\n');
if (noHit.length > 40) md += `\n- …（其余 ${noHit.length - 40} 条略，保持原分类）`;

fs.writeFileSync(REPORT, md, 'utf8');
console.log(`报告已生成: ${REPORT}`);

/* ── apply 模式才真正写库 ── */
if (APPLY) {
  const bak = PROMPTS + '.bak-fixcat';
  fs.copyFileSync(PROMPTS, bak);
  console.log(`已备份 → ${bak}`);
  const map = new Map(changes.map(c => [c.p.id, c.to]));
  let n = 0;
  for (const p of prompts) {
    if (map.has(p.id)) { p.cat = map.get(p.id); n++; }
  }
  fs.writeFileSync(PROMPTS, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
  console.log(`已改写 ${n} 条分类，母本共 ${prompts.length} 条`);
  console.log('下一步: node split-prompts.js && 质检 && bump 版本 && commit+push');
} else {
  console.log('\n（dry-run 模式：未改动任何数据。确认后运行 node fix-categories.js --apply 落库）');
}
