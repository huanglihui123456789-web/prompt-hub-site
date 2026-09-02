/* 端到端测试：验证 P1 来源两档徽章（已校准/精选 + 社区/原生）+ 可信度筛选 + 图例 */
const { JSDOM } = require('C:/Users/联想笔记本/.workbuddy/binaries/node/workspace/node_modules/jsdom');
const path = 'D:/Users/联想笔记本/WorkBuddy/prompt-hub-site/index.html';

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, timeout, step) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { try { if (fn()) return true; } catch (e) {} await sleep(step || 150); }
  return false;
}

(async () => {
  const dom = await JSDOM.fromFile(path, {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = window.matchMedia || function () { return { matches: false, addEventListener() {}, addListener() {} }; };
      window.scrollTo = function () {};
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.requestAnimationFrame = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
      window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
    }
  });
  const { document, window } = dom.window;
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const booted = await waitFor(() => $('#statTotal') && $('#statTotal').textContent.trim() !== '0', 15000);
  console.log('1) boot 完成:', booted ? 'OK' : 'FAIL');

  // 图例存在且两档齐全（绿=已校准/精选，蓝=社区/原生；无黄标）
  const legend = $('.tier-legend');
  const dots = legend ? $$('.tier-legend .tier-dot') : [];
  const has2 = legend && dots.length === 2 &&
    $('.tier-dot.dot-green', legend) && $('.tier-dot.dot-blue', legend) &&
    !$('.tier-dot.dot-amber', legend);
  console.log('2) 图例两档齐全(无黄标):', has2 ? 'OK' : 'FAIL', '(dots=' + dots.length + ')');

  // 数据层 tier 分布（复刻 sourceTier 新逻辑：黄标档已取消）
  const P = window.PROMPTS || [];
  function tier(p) {
    if (p.community) return 'community';
    if (p.verified) return 'verified';
    return 'native';
  }
  const tc = { verified: 0, synthetic: 0, community: 0, native: 0 };
  P.forEach(p => tc[tier(p)]++);
  const dataOk = tc.verified === 1097 && tc.synthetic === 0 && tc.native === 555 && tc.community === 0;
  console.log('3) 数据 tier 分布:', JSON.stringify(tc),
    '| 期望 1097/0/555/0:', dataOk ? 'OK' : 'FAIL');

  // 每张已渲染卡片都有合法两档徽章（green 或 blue，无 amber）
  const cards = $$('#promptGrid .prompt-card');
  let badgeOk = cards.length > 0;
  const seen = {};
  cards.forEach(c => {
    const b = c.querySelector('.tier-badge');
    if (!b || !/tier-(green|blue)/.test(b.className)) badgeOk = false;
    else { const m = b.className.match(/tier-(green|blue)/); seen[m[1]] = (seen[m[1]] || 0) + 1; }
  });
  console.log('4) 渲染卡片数:', cards.length, '| 每张含合法两档徽章:', badgeOk ? 'OK' : 'FAIL',
    '| 徽章色分布:', JSON.stringify(seen));

  // 来源筛选：点「已校准/精选」→ 共 1097 条
  function clickTier(label) {
    const btn = Array.from($$('#tierFilter .tier-btn')).find(b => b.textContent.trim() === label);
    if (btn) btn.click();
  }
  const num = () => { const m = ($('#resultCount').textContent || '').match(/\d+/); return m ? +m[0] : -1; };

  clickTier('已校准/精选'); await sleep(250);
  const nVer = num();
  console.log('5) 点「已校准/精选」→ 共', nVer, '条 | 期望 1097:', nVer === 1097 ? 'OK' : 'FAIL');

  clickTier('社区/原生'); await sleep(250);
  const nNat = num();
  console.log('6) 点「社区/原生」→ 共', nNat, '条 | 期望 555:', nNat === 555 ? 'OK' : 'FAIL');

  // 回到「全部」→ 1652，且 active 态正确；确认不存在「机器生成」按钮
  const hasSynBtn = Array.from($$('#tierFilter .tier-btn')).some(b => b.textContent.trim() === '机器生成');
  clickTier('全部'); await sleep(250);
  const nAll = num();
  const allActive = $('#tierFilter .tier-btn.is-active') &&
    $('#tierFilter .tier-btn.is-active').textContent.trim() === '全部';
  console.log('7) 点「全部」→ 共', nAll, '条 | 期望 1652:', nAll === 1652 ? 'OK' : 'FAIL',
    '| 全部按钮 active:', allActive ? 'OK' : 'FAIL', '| 无「机器生成」按钮:', hasSynBtn ? 'FAIL' : 'OK');

  // 8) 多语言包：切 Français → 200 条，渲染卡徽章全绿（intl 已翻 verified）
  function clickLang(lang) {
    const b = document.querySelector('.lang-btn[data-lang="' + lang + '"]');
    if (b) b.click();
  }
  clickLang('fr');
  const nFr = await waitFor(() => num() === 200, 20000);
  const frCards = $$('#promptGrid .prompt-card');
  let frGreen = 0;
  frCards.forEach(c => {
    const b = c.querySelector('.tier-badge');
    if (b && /tier-green/.test(b.className)) frGreen++;
  });
  const frBadgeOk = frCards.length > 0 && frGreen === frCards.length;
  console.log('8) 切 Français →', num(), '条 | 期望 200:', nFr ? 'OK' : 'FAIL',
    '| 渲染卡', frCards.length, '| 徽章全绿:', frBadgeOk ? 'OK' : 'FAIL');

  const pass = booted && has2 && dataOk && badgeOk && nVer === 1097 &&
    nNat === 555 && nAll === 1652 && allActive && !hasSynBtn && nFr && frBadgeOk;
  console.log(pass ? '\n=== 来源两档徽章 + 多语言包测试全部 PASS ===' : '\n=== 存在 FAIL ===');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('测试异常:', e.message); process.exit(2); });
