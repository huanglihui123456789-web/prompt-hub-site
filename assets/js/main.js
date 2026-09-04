/* =========================================================
   PROMPT · 提示词库  —  交互脚本
   功能：行业/标签筛选、场景搜索、热度排序、收藏/点赞、
        一键复制（带出处署名）、中英文切换、社区投稿（GitHub 直提交）、
        深色浅色、回到顶部、滚动揭示
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- 配置 ---------- */
  // 部署到 GitHub Pages 后，把你的仓库填到下方默认项，或在投稿弹窗里设置
  var REPO_DEFAULT = 'your-name/prompt-hub-site';
  var SUBMISSIONS_DIR = 'submissions';
  var K = {
    theme: 'phub-theme', fav: 'phub-fav', like: 'phub-like',
    community: 'phub-community', token: 'phub-gh-token', repo: 'phub-gh-repo'
  };

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }
  // 数字格式化：1.2k / 3.4w / 5.6m，用于浏览/复制等数据指标
  function fmtNum(n) {
    n = n || 0;
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
  function escapeHtml(s) {
    // 注意：必须转义引号 —— 本函数也用于 HTML 属性（data-tag / href / title），
    // 缺失引号转义会导致属性闭合注入（如 onerror=...）的 XSS。
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* ---------- 占位符高亮（高精度，避免误标嵌入代码） ----------
     规则：括号片段 {{x}}/[[x]]/<<x>>/[x]/<x> 仅当内部为「纯字母/数字/下划线/空格」
     + (全大写 ≥2 字母 或 命中占位关键词) + 非 HTML 标签名 时才高亮。
     动机：本站前端/设计类提示词多，正文里的 <div>/<svg>/{{ scale:1.03 }} 多为代码，
     不能当「待填变量」误导用户。复制仍取原始 p.prompt，不受高亮 HTML 影响。 */
  var HTML_TAGS = new Set(('div span p a img ul ol li h1 h2 h3 h4 h5 h6 header footer nav section ' +
    'article main aside br hr svg path link head body title html script style table tr td th ' +
    'form input button label select option textarea video audio source iframe canvas meta small ' +
    'strong em code pre blockquote figure figcaption picture details summary dialog strictmode ' +
    'wallet fecomponenttransfer defs g circle rect line polyline polygon use lineargradient ' +
    'radialgradient stop').split(' '));
  var PH_KW = ['placeholder','topic','subject','input','example','paste','insert','describe','context',
    'requirement','constraint','goal','location','workflow','challenge','aspect','target','audience',
    'product','company','user','content','task','question','keyword','summary','language','style',
    'tone','format','field','value','date','count','list','item','name','prompt'];
  var PH_RE = /\{\{[^{}]*\}\}|\[\[[^\]]*\]\]|<<[^>]*>>|\[[^\]]*\]|<[^>]*>/g;
  // 返回一个全新的 placeholder 正则实例（避免与 PH_RE 共享 lastIndex 全局状态导致 exec 错位）
  function phRegex() { return /\{\{[^{}]*\}\}|\[\[[^\]]*\]\]|<<[^>]*>>|\[[^\]]*\]|<[^>]*>/g; }
  function phIdent(inner) { return /^[A-Za-z_][A-Za-z0-9_ ]*$/.test(inner); }
  function isPlaceholder(inner) {
    if (!phIdent(inner)) return false;            // 含 : = ' " . < > { } 等代码符号 → 排除
    var low = inner.toLowerCase();
    if (HTML_TAGS.has(low)) return false;         // <div>/<svg> 等标签排除
    var allCaps = inner.replace(/[^A-Za-z]/g, '').length >= 2 && inner === inner.toUpperCase();
    var hasKW = PH_KW.some(function (k) { return low.indexOf(k) !== -1; });
    return allCaps || hasKW;
  }
  function highlightPlaceholders(raw) {
    if (!raw) return '';
    var out = '', last = 0, m;
    PH_RE.lastIndex = 0;
    while ((m = PH_RE.exec(raw))) {
      var tok = m[0], inner = tok.slice(1, -1);
      out += escapeHtml(raw.slice(last, m.index));
      out += isPlaceholder(inner)
        ? '<mark class="ph" title="可替换占位符">' + escapeHtml(tok) + '</mark>'
        : escapeHtml(tok);
      last = m.index + tok.length;
    }
    out += escapeHtml(raw.slice(last));
    return out;
  }
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function lsGetArr(key) { try { return JSON.parse(lsGet(key, '[]')) || []; } catch (e) { return []; } }
  function lsSetArr(key, arr) { lsSet(key, JSON.stringify(arr)); }

  function toast(msg, icon) {
    var t = $('toast');
    if (!t) return;
    t.innerHTML = (icon ? '<i class="fa-solid ' + icon + '"></i>' : '') + '<span>' + escapeHtml(msg) + '</span>';
    t.hidden = false; t.style.display = 'flex'; // 内联样式：不受缓存 CSS 的 display 规则影响
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.hidden = true; t.style.display = 'none'; }, 320); }, 2200);
  }

  /* 复制：三级兜底 —— Clipboard API → execCommand → 手动复制弹层
     注意：execCommand 必须检查返回值，否则会出现「提示已复制但剪贴板其实是空的」 */
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.width = '1px';
        ta.style.height = '1px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length); // 兼容 iOS
        var ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve(true) : reject(new Error('execCommand 返回 false'));
      } catch (err) { reject(err); }
    });
  }

  // 兜底：弹出一个可选中的文本框，用户手动 Ctrl+C
  function manualCopy(text) {
    return new Promise(function (resolve) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:400;background:rgba(10,9,7,.55);backdrop-filter:blur(4px);display:grid;place-items:center;padding:20px;';
      var box = document.createElement('div');
      box.style.cssText = 'width:min(560px,94vw);background:var(--bg-elev,#fffdf8);border:1px solid rgba(0,0,0,.15);border-radius:18px;padding:24px 22px;box-shadow:0 30px 80px rgba(0,0,0,.25);';
      box.innerHTML =
        '<h3 style="margin:0 0 8px;font-size:18px;">手动复制</h3>' +
        '<p style="margin:0 0 14px;font-size:13px;color:#8a847a;line-height:1.7;">浏览器阻止了自动复制（常见于内嵌预览或非 HTTPS 环境）。文本已为你选中，按 <b>Ctrl / Cmd + C</b> 即可。</p>';
      var ta2 = document.createElement('textarea');
      ta2.value = text;
      ta2.readOnly = true;
      ta2.style.cssText = 'width:100%;height:220px;font:inherit;font-size:13px;line-height:1.7;padding:12px;border-radius:10px;border:1px solid rgba(0,0,0,.18);background:#f6f3ec;color:#1c1b18;resize:vertical;';
      box.appendChild(ta2);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '关闭';
      btn.style.cssText = 'margin-top:14px;height:42px;padding:0 22px;border-radius:999px;border:1px solid rgba(0,0,0,.2);background:#f6f3ec;color:#1c1b18;font-size:14px;font-weight:600;cursor:pointer;';
      btn.onclick = function () { document.body.removeChild(wrap); resolve(false); };
      box.appendChild(btn);
      wrap.appendChild(box);
      wrap.addEventListener('click', function (e) { if (e.target === wrap) { document.body.removeChild(wrap); resolve(false); } });
      document.body.appendChild(wrap);
      ta2.focus();
      ta2.select();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text).catch(function () { return manualCopy(text); });
  }

  /* ---------- 爆点体验：吉祥物 / 撒花 / 3D 倾斜 / 首屏动效 ---------- */
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // 吉祥物 IP「普普」：琥珀火花精灵，自包含 SVG，可复用
  function mascotSVG() {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="吉祥物普普">' +
      '<defs>' +
      '<linearGradient id="mBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6c878"/><stop offset="1" stop-color="#b07d2b"/></linearGradient>' +
      '<linearGradient id="mSpark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a6c"/><stop offset="1" stop-color="#d9533b"/></linearGradient>' +
      '</defs>' +
      '<path d="M60 10 L64.5 25 L79 29.5 L64.5 34 L60 49 L55.5 34 L41 29.5 L55.5 25 Z" fill="url(#mSpark)"/>' +
      '<rect x="22" y="40" width="76" height="70" rx="27" fill="url(#mBody)"/>' +
      '<circle cx="42" cy="80" r="6.5" fill="#f2a98c" opacity=".7"/>' +
      '<circle cx="78" cy="80" r="6.5" fill="#f2a98c" opacity=".7"/>' +
      '<circle cx="48" cy="69" r="6.5" fill="#2a2521"/><circle cx="72" cy="69" r="6.5" fill="#2a2521"/>' +
      '<circle cx="50.2" cy="66.8" r="2" fill="#fff"/><circle cx="74.2" cy="66.8" r="2" fill="#fff"/>' +
      '<path d="M49 85 Q60 94 71 85" stroke="#2a2521" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
      '<rect x="43" y="93" width="34" height="19" rx="5.5" fill="#fffdf8"/>' +
      '<rect x="49" y="99" width="22" height="2.6" rx="1.3" fill="#2f6f5e"/>' +
      '<rect x="49" y="104" width="15" height="2.6" rx="1.3" fill="#b07d2b"/>' +
      '</svg>';
  }

  // 复制成功撒花：在按钮处喷发品牌色粒子（WAAPI 驱动，reduced-motion 跳过）
  function burstConfetti(btn) {
    if (REDUCED_MOTION) return;
    // 旧浏览器不支持 Element.animate()：静默跳过动画，绝不因兼容问题中断复制结果
    if (typeof Element === 'undefined' || !Element.prototype.animate) return;
    var colors = ['#b07d2b', '#2f6f5e', '#d9533b', '#e6c878', '#ffffff'];
    var r = btn ? btn.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, N = 22;
    for (var i = 0; i < N; i++) {
      var s = document.createElement('span');
      s.className = 'confetti';
      var sz = 6 + Math.random() * 7;
      s.style.width = sz + 'px'; s.style.height = sz + 'px';
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      s.style.background = colors[i % colors.length];
      if (Math.random() < .4) s.style.borderRadius = '50%';
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 120;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 46;
      var rot = Math.random() * 720 - 360;
      try {
        s.animate([
          { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)', opacity: 0 }
        ], { duration: 700 + Math.random() * 520, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(s);
      } catch (e) {
        // 动画失败（老引擎）：立即回收粒子，避免 DOM 泄漏
        setTimeout(function () { s.remove(); }, 1400);
      }
    }
  }

  // 卡片 3D 倾斜（重做版）：内层旋转 + 光标高光跟随，幅度克制、字体清晰
  function attachTilt(card) {
    if (REDUCED_MOTION) return;
    var inner = card.querySelector('.card-inner');
    var glare = card.querySelector('.card-glare');
    if (!inner) return;
    var MAX = 8;
    // rAF 节流：避免 mousemove 每帧重复 getBoundingClientRect + 写 style
    var raf = null;
    card.addEventListener('mouseenter', function () {
      inner.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)';
    });
    card.addEventListener('mousemove', function (e) {
      if (raf) return; // 上一帧未完成，跳过本次
      raf = requestAnimationFrame(function () {
        raf = null;
        var b = card.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5;
        var py = (e.clientY - b.top) / b.height - 0.5;
        inner.style.transform = 'rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' + (px * MAX).toFixed(2) + 'deg)';
        if (glare) {
          glare.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
          glare.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
        }
      });
    });
    card.addEventListener('mouseleave', function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      inner.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      inner.style.transform = '';
      if (glare) glare.style.opacity = '0';
    });
  }

  // 首屏加载动效：注入 .js-anim 后双 rAF 触发 stagger 揭示
  function initHeroLoad() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    hero.classList.add('js-anim');
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('loaded'); }); });
  }

  /* ---------- 主题（默认跟随系统） ---------- */
  function systemDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var tog = $('themeToggle'); if (tog) tog.setAttribute('aria-pressed', String(t === 'dark'));
  }
  (function initTheme() {
    var saved = lsGet(K.theme, null);
    applyTheme(saved === 'dark' || saved === 'light' ? saved : (systemDark() ? 'dark' : 'light'));
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var fn = function (e) {
        var s = lsGet(K.theme, null);
        if (s !== 'light' && s !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
    }
  })();
  var toggle = $('themeToggle');
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    lsSet(K.theme, next); applyTheme(next);
  });

  /* ---------- 状态 ---------- */
  var state = { cat: '全部', q: '', tags: new Set(), sort: 'default', favOnly: false, lang: 'all', tier: 'all', view: 'all' };
  var community = lsGetArr(K.community); // 本地投稿

  // 多语言包懒加载：点具体语言按钮时按需拉取 prompts-intl-<lang>.js（单语言分包，每包约 1.1MB，替代原先 5.6MB 单文件）
  var intlLoading = {};   // lang -> bool
  var intlWaiters = {};   // lang -> [cb]
  var INTL_LANGS = ['fr', 'de', 'es', 'pt', 'nl'];
  var LANG_LABEL = { en: 'EN 原文', zh: '中文原文', fr: 'Français', de: 'Deutsch', es: 'Español', pt: 'Português', nl: 'Nederlands' };
  function intlLoaded(lang) { return !!(window.PROMPTS_INTL && window.PROMPTS_INTL[lang]); }
  // 回调队列按语言隔离：加载期间连续点了多个语言按钮，各自排队，加载完成统一执行，避免回调被丢弃导致「点了没反应」
  function flushIntlWaiters(lang) {
    var waiters = (intlWaiters[lang] || []).splice(0, (intlWaiters[lang] || []).length);
    document.querySelectorAll('.lang-btn.intl.is-loading[data-lang="' + lang + '"]').forEach(function (x) { x.classList.remove('is-loading'); });
    waiters.forEach(function (cb) { try { cb(); } catch (e) {} });
  }
  function ensureIntl(lang, cb) {
    if (intlLoaded(lang)) { cb(); return; }
    (intlWaiters[lang] = intlWaiters[lang] || []).push(cb);
    if (intlLoading[lang]) return;
    intlLoading[lang] = true;
    var s = document.createElement('script');
    s.src = 'assets/js/prompts-intl-' + lang + '.js?v=' + VER;
    s.onload = function () { intlLoading[lang] = false; flushIntlWaiters(lang); };
    s.onerror = function () {
      intlLoading[lang] = false;
      flushIntlWaiters(lang);
      toast('多语言包加载失败，请刷新页面重试', 'fa-triangle-exclamation');
    };
    document.head.appendChild(s);
  }

  /* 主库（PROMPTS + 社区投稿）始终可见；仅当用户选中某一多语言时，才把对应语言的 INTL 数据合并进来，
     保持站点以中英精选主库为主 */
  function allPrompts() {
    var base = (window.PROMPTS || []).concat(community);
    if (INTL_LANGS.indexOf(state.lang) !== -1) {
      return base.concat((window.PROMPTS_INTL || {})[state.lang] || []);
    }
    return base;
  }

  /* ---------- 主库分片懒加载（首屏加速） ----------
     首屏仅同步 chunk-1（约 465KB）；chunk-2~5 由这里动态注入，
     避免首屏等待约 1.8MB 数据全部下载后才出卡 */
  var VER = '20260905o';
  var mainChunksLeft = [2, 3, 4, 5];
  var dataReadyCbs = [];
  function mainDataReady() { return mainChunksLeft.length === 0; }
  function onMainDataReady(cb) {
    if (mainDataReady()) { try { cb(); } catch (e) {} return; }
    dataReadyCbs.push(cb);
  }
  function loadNextMainChunk() {
    if (!mainChunksLeft.length) {
      var cbs = dataReadyCbs.splice(0, dataReadyCbs.length);
      cbs.forEach(function (f) { try { f(); } catch (e) {} });
      return;
    }
    var n = mainChunksLeft.shift();
    var s = document.createElement('script');
    s.src = 'assets/js/data/chunk-' + n + '.js?v=' + VER;
    s.onload = loadNextMainChunk;
    s.onerror = function () { if (!s._r) { s._r = true; mainChunksLeft.unshift(n); } loadNextMainChunk(); };
    document.head.appendChild(s);
  }

  /* ---------- 可分享的筛选状态（hash） ----------
     #q=..&cat=..&tags=..&sort=..&view=..&lang=..&tier=..&fav=1 可分享/收藏/回退；
     兼容旧永久链接 #id（不含 = 视为单条定位，逻辑不变） */
  var hashRestoring = false;
  function parseHash() {
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!h) return null;
    if (h.indexOf('=') === -1) return { id: h };
    var st = {};
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i === -1) return;
      var k = kv.slice(0, i), v = kv.slice(i + 1); if (!v) return;
      if (k === 'q') st.q = v;
      else if (k === 'cat') st.cat = v;
      else if (k === 'tags') st.tags = v.split(',').filter(Boolean);
      else if (k === 'sort') st.sort = v;
      else if (k === 'view') st.view = v;
      else if (k === 'lang') st.lang = v;
      else if (k === 'tier') st.tier = v;
      else if (k === 'fav') st.favOnly = v === '1';
    });
    return st;
  }
  function applyHashState(st) {
    hashRestoring = true;
    var si = $('searchInput'), sc = $('searchClear');
    if (st.q != null) { state.q = st.q; if (si) si.value = st.q; if (sc) sc.classList.toggle('show', st.q.length > 0); }
    else { state.q = ''; if (si) si.value = ''; if (sc) sc.classList.remove('show'); }
    if (st.cat) state.cat = st.cat;
    state.tags = st.tags ? new Set(st.tags) : new Set();
    if (st.sort && ['default', 'heat', 'views', 'score'].indexOf(st.sort) !== -1) state.sort = st.sort;
    var sel = $('sortSelect'); if (sel) sel.value = state.sort;
    if (st.view && ['all', 'hot'].indexOf(st.view) !== -1) state.view = st.view;
    document.querySelectorAll('.view-tab').forEach(function (t) {
      var a = t.getAttribute('data-view') === state.view;
      t.classList.toggle('is-active', a); t.setAttribute('aria-selected', a ? 'true' : 'false');
    });
    if (st.lang) state.lang = st.lang;
    document.querySelectorAll('.lang-btn').forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-lang') === state.lang); });
    if (st.tier) state.tier = st.tier;
    if (st.favOnly != null) state.favOnly = st.favOnly;
    var favBtn = $('favFilterBtn'); if (favBtn) favBtn.classList.toggle('is-active', !!state.favOnly);
    renderChips(); renderTierFilter(); renderTagCloud(); renderCards();
    hashRestoring = false;
  }
  function updateHash() {
    if (hashRestoring) return;
    var cur = (location.hash || '').replace(/^#/, '');
    if (cur && cur.indexOf('=') === -1) return; // 旧 #id 永久链接不覆盖
    var parts = [];
    if (state.q) parts.push('q=' + encodeURIComponent(state.q));
    if (state.cat && state.cat !== '全部') parts.push('cat=' + encodeURIComponent(state.cat));
    if (state.tags && state.tags.size) parts.push('tags=' + encodeURIComponent(Array.from(state.tags).join(',')));
    if (state.sort && state.sort !== 'default') parts.push('sort=' + state.sort);
    if (state.view && state.view !== 'all') parts.push('view=' + state.view);
    if (state.lang && state.lang !== 'all') parts.push('lang=' + state.lang);
    if (state.tier && state.tier !== 'all') parts.push('tier=' + state.tier);
    if (state.favOnly) parts.push('fav=1');
    var target = parts.length ? '#' + parts.join('&') : '';
    if ((location.hash || '') !== target) {
      try { history.replaceState(null, '', location.pathname + location.search + target); } catch (e) {}
    }
  }

  /* ---------- 轻量检索引擎（同义词 clique + CJK 复合词拆解 + 字段加权打分） ---------- */

  /* 轻量检索引擎（零依赖）：分词 + 同义词扩展 + 字段加权打分
     取舍：站仅 2005 条，线性扫描+打分是微秒级，无需 FlexSearch/MiniSearch 等外部库
     （引库要么走 CDN 有被墙风险，要么打包进站增体积）；同义词表覆盖中/英/同义意图。 */
  function norm(s) { return (s == null ? '' : String(s)).toLowerCase(); }

  // 查询分词：CJK 连续串整体作为一个 term（子串匹配天然生效），Latin 按词切；丢弃单字 CJK 以免噪声
  function tokenize(q) {
    var terms = [], m, re = /[a-z0-9]+|[\u4e00-\u9fff]+/g;
    while ((m = re.exec(q.toLowerCase())) !== null) terms.push(m[0]);
    return terms.filter(function (t) { return t.length >= 2 || /[a-z0-9]/.test(t); });
  }

  // 同义词种子（单向声明即可，buildSyn 自动补全为双向 clique，并把 VALUE 也补成 KEY）
  var SYN_SEED = {
    '周报': ['日报', 'weekly', 'report', '汇报', '总结', '月报'],
    '文案': ['copy', 'copywriting', '广告语', 'slogan', '宣传', '营销'],
    '种草': ['推广', '营销', '安利'],
    '小红书': ['xhs', 'rednote', '笔记', '种草'],
    '简历': ['resume', 'cv'],
    '面试': ['interview', '求职'],
    '求职': ['招聘', '简历'],
    '翻译': ['translate', 'translation', 'translator', '润色', '本地化'],
    '英语': ['english', '外语', '老师'],
    '外语': ['english', '语言'],
    '代码': ['code', 'programming', '编程', '程序', 'bug', 'python'],
    '编程': ['code', 'coding', '开发'],
    '前端': ['frontend', 'html', 'css', 'js'],
    '后端': ['backend', 'server'],
    '设计': ['design', 'ui', 'ux', '配色', 'logo'],
    'logo': ['标志', '商标'],
    '健身': ['运动', '锻炼', '减肥', 'fitness', 'workout', 'weight'],
    '减肥': ['瘦身', '健身', '体重'],
    '心理': ['情绪', '心理咨询', 'mental', 'psychologist'],
    '法律': ['law', 'legal', 'lawyer', 'attorney', '律师', '合同', '维权'],
    '合同': ['contract', '协议'],
    '投资': ['理财', '股票', 'fund', 'invest', 'finance'],
    '理财': ['投资', '财务', 'finance'],
    '创业': ['startup', '商业', 'business'],
    '小说': ['故事', 'fiction', '写作', 'novel', 'writing'],
    '故事': ['小说', 'story'],
    '剧本': ['script', '短片'],
    '游戏': ['game', '棋', '梦', '段子', 'rap', '说唱'],
    '旅行': ['旅游', 'travel', '出行', 'tourism'],
    '穿搭': ['时尚', '穿衣服'],
    '学习': ['study', '辅导', '教育', 'education'],
    '老师': ['教师', '教学', 'tutor', 'teacher'],
    '孩子': ['儿童', '育儿', 'kid'],
    '论文': ['paper', '学术', 'thesis'],
    '数学': ['math', '统计', '科研'],
    '数据': ['data', '数据分析'],
    '健康': ['医疗', '养生', 'wellness', 'health', 'medical'],
    '营销': ['marketing', '推广', '广告'],
    '总结': ['归纳', '概括', '汇报'],
    '标题': ['title', 'headline', '题目'],
    '诗': ['写作', '小说'],
    'rap': ['说唱', 'hiphop'],
    '购物': ['效率', '生活'],
    '整理': ['效率', '生活'],
    '会计': ['商业', '金融'],
    '历史': ['科研', '科学'],
    '科研': ['科学', '学术'],
    '辅导': ['学习', '教育'],
    '教学': ['教育', '老师'],
    'weekly': ['周报', '日报', 'report'],
    'report': ['周报', '日报', '汇报'],
    'resume': ['简历', 'cv'],
    'copy': ['文案', '广告语'],
    'translate': ['翻译', '润色'],
    'code': ['代码', '编程'],
    'design': ['设计', 'ui'],
    'game': ['游戏'],
    'travel': ['旅行', '旅游'],
    'finance': ['理财', '投资']
  };

  // 构建双向同义词 clique：A~B 则 A 的变体含 B、B 的变体含 A（含把 VALUE 也补成 KEY，使任意同义词都可作查询词）
  var SYN = {};
  (function buildSyn() {
    function link(a, b) { (SYN[a] = SYN[a] || []); if (SYN[a].indexOf(b) === -1) SYN[a].push(b); }
    for (var k in SYN_SEED) {
      link(k, k);
      SYN_SEED[k].forEach(function (v) { link(k, v); link(v, k); });
    }
  })();

  // 查询词展开：①直接同义词 clique ②CJK 复合词拆解（"英语老师"→含"英语/老师"及其 clique）
  function expand(term) {
    var out = [term];
    (SYN[term] || []).forEach(function (v) { if (out.indexOf(v) === -1) out.push(v); });
    for (var key in SYN) {
      if (key !== term && term.indexOf(key) !== -1) {
        if (out.indexOf(key) === -1) out.push(key);
        (SYN[key] || []).forEach(function (v) { if (out.indexOf(v) === -1) out.push(v); });
      }
    }
    return out;
  }

  // 字段权重：标题/中文标题 >> 标签 > 分类 > 正文（无场景类目召回，避免宽泛类目污染排序）
  var FIELD_W = { title: 10, titleZh: 8, tags: 5, cat: 4, body: 2 };

  // 单条打分：多 term 取 AND（任一 term 完全无字面匹配则整条排除）；总分=各 term 最佳字段权重之和
  function scorePrompt(p, terms) {
    var fields = {
      title: norm(p.title), titleZh: norm(p.titleZh),
      tags: (p.tags || []).join(' '), cat: norm(p.cat), body: norm(p.prompt)
    };
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var variants = expand(terms[i]);
      var bestW = 0;
      for (var f in FIELD_W) {
        var ft = fields[f] || '';
        for (var v = 0; v < variants.length; v++) {
          if (variants[v] && ft.indexOf(variants[v]) !== -1) {
            if (FIELD_W[f] > bestW) bestW = FIELD_W[f];
            break;
          }
        }
      }
      if (bestW === 0) return 0; // AND 排除：该 term 无任何字面命中
      total += bestW;
    }
    return total;
  }

  /* ---------- 收藏 / 点赞 ---------- */
  function isFav(id) { return lsGetArr(K.fav).indexOf(id) !== -1; }
  function toggleFav(id) {
    var a = lsGetArr(K.fav), i = a.indexOf(id);
    if (i === -1) a.push(id); else a.splice(i, 1);
    lsSetArr(K.fav, a); return i === -1;
  }
  function isLike(id) { return lsGetArr(K.like).indexOf(id) !== -1; }
  function toggleLike(id) {
    var a = lsGetArr(K.like), i = a.indexOf(id);
    if (i === -1) a.push(id); else a.splice(i, 1);
    lsSetArr(K.like, a); return i === -1;
  }

  /* ---------- 来源可信度分层（P1 内容可信度可视化） ---------- */
  // 两档：绿=已校准/精选（含经质量筛选的 AI 生成内容）/ 蓝=社区或原生未校验
  var TIER_META = {
    verified:  { key: 'verified',  label: '已校准/精选', cls: 'green', desc: '站内已审核收录 · 含经质量筛选的 AI 生成内容（评分≥7/10）' },
    community: { key: 'community', label: '社区',     cls: 'blue',  desc: '网友投稿 · 未逐条校验' },
    native:    { key: 'native',    label: '原生',     cls: 'blue',  desc: '原生整理 · 未逐条校验' }
  };
  function sourceTier(p) {
    if (p.community) return 'community';
    if (p.verified) return 'verified';
    return 'native';
  }
  // 筛选用：社区/原生 合并为同一蓝色层级
  function tierMatchesFilter(tier, filter) {
    if (filter === 'all' || filter === tier) return true;
    if (filter === 'community' && tier === 'native') return true;
    return false;
  }

  /* ---------- 过滤 ---------- */
  function filterPrompts() {
    var list = allPrompts().slice();
    var q = state.q.trim().toLowerCase();
    var terms = q ? tokenize(q) : [];
    list = list.filter(function (p) {
      if (state.cat !== '全部' && p.cat !== state.cat) return false;
      if (state.favOnly && !isFav(p.id)) return false;
      if (!tierMatchesFilter(sourceTier(p), state.tier)) return false;
      // 语言筛选：社区投稿无 lang 字段时按有无英文原文推断
      if (state.lang !== 'all') {
        var lang = p.lang || (p.promptEn ? 'en' : 'zh');
        if (lang !== state.lang) return false;
      }
      // 标签筛选（OR）
      if (state.tags.size) {
        var pt = p.tags || [];
        var hit = false;
        state.tags.forEach(function (t) { if (pt.indexOf(t) !== -1) hit = true; });
        if (!hit) return false;
      }
      if (!terms.length) return true;
      var s = scorePrompt(p, terms);
      p._score = s;
      return s > 0;
    });
    if (q) {
      // 有查询：按相关度降序（同分回退热度），而非数组原顺序
      list.sort(function (a, b) { return (b._score || 0) - (a._score || 0) || ((b.heat || 0) - (a.heat || 0)); });
    } else if (state.sort === 'heat') {
      list.sort(function (a, b) {
        var av = (a.heat || 0) + (isLike(a.id) ? 1 : 0);
        var bv = (b.heat || 0) + (isLike(b.id) ? 1 : 0);
        return bv - av;
      });
    } else if (state.sort === 'views') {
      list.sort(function (a, b) { return (b.views || 0) - (a.views || 0); });
    } else if (state.sort === 'score') {
      list.sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
    }
    // 热榜视图：按综合热度 = score × views × copies 排序，且限制 Top 100
    if (state.view === 'hot') {
      list.sort(function (a, b) {
        var ah = (a.score || 0) * (a.views || 0) * (a.copies || 0);
        var bh = (b.score || 0) * (b.views || 0) * (b.copies || 0);
        return bh - ah;
      });
      list = list.slice(0, 100);
    }
    return list;
  }

  /* 行业分类定义：与 prompts.js 中的 cat 字段一一对应（共 13 类 + 全部），供行业筛选 chips 与投稿表单下拉共用 */
  window.PROMPT_CATEGORIES = [
    { key: '全部', icon: 'fa-layer-group' },
    { key: '编程/技术', icon: 'fa-code' },
    { key: '前端开发', icon: 'fa-desktop' },
    { key: '写作/内容', icon: 'fa-pen-nib' },
    { key: '教育', icon: 'fa-graduation-cap' },
    { key: '娱乐/游戏', icon: 'fa-gamepad' },
    { key: '商业/金融', icon: 'fa-chart-line' },
    { key: '效率/生活', icon: 'fa-bolt' },
    { key: '科研/科学', icon: 'fa-flask' },
    { key: '营销/自媒体', icon: 'fa-bullhorn' },
    { key: '医疗健康', icon: 'fa-heart-pulse' },
    { key: '设计', icon: 'fa-palette' },
    { key: '翻译/语言', icon: 'fa-language' },
    { key: '法律', icon: 'fa-scale-balanced' }
  ];

  /* ---------- 渲染：行业标签 ---------- */
  function renderChips() {
    var wrap = $('categoryChips');
    if (!wrap || !window.PROMPT_CATEGORIES) return;
    wrap.innerHTML = '';
    window.PROMPT_CATEGORIES.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chip' + (c.key === state.cat ? ' is-active' : '');
      b.setAttribute('aria-pressed', String(c.key === state.cat));
      b.innerHTML = '<i class="fa-solid ' + c.icon + '"></i>' + escapeHtml(c.key);
      b.addEventListener('click', function () {
        state.cat = c.key;
        state.tags.clear();
        // 点「全部」= 显示全部：若搜索框有词也一并清空，避免"点了没用"
        if (c.key === '全部' && state.q) {
          state.q = '';
          var si = $('searchInput'); if (si) si.value = '';
          var sc = $('searchClear'); if (sc) sc.classList.remove('show');
        }
        renderChips(); renderTagCloud(); renderCards();
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- 渲染：来源可信度筛选（P1 三色徽章联动） ---------- */
  function renderTierFilter() {
    var wrap = $('tierFilter');
    if (!wrap) return;
    var defs = [
      { key: 'all',       label: '全部' },
      { key: 'verified',  label: '已校准/精选' },
      { key: 'community', label: '社区/原生' }
    ];
    wrap.innerHTML = '';
    defs.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tier-btn' + (state.tier === d.key ? ' is-active tier-' + d.key : '');
      b.textContent = d.label;
      b.setAttribute('aria-pressed', String(state.tier === d.key));
      b.addEventListener('click', function () {
        state.tier = d.key;
        renderTierFilter(); renderCards();
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- 渲染：行业下子标签（合并原标签云，置于行业芯片下方） ---------- */
  function renderTagCloud() {
    var wrap = $('subTagCloud');
    if (!wrap) return;
    // 上下文感知：选中具体行业时只统计该行业内的标签频率，作为"子标签"
    var base = allPrompts();
    if (state.cat !== '全部') base = base.filter(function (p) { return p.cat === state.cat; });
    var freq = {};
    base.forEach(function (p) { (p.tags || []).forEach(function (t) { freq[t] = (freq[t] || 0) + 1; }); });
    var entries = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
    wrap.innerHTML = '';
    if (!entries.length) return;
    var label = document.createElement('span');
    label.className = 'subtags-label';
    label.textContent = state.cat === '全部' ? '热门话题' : (state.cat + ' · 话题');
    wrap.appendChild(label);
    entries.slice(0, 24).forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'tag-chip' + (state.tags.has(t) ? ' is-active' : '');
      b.type = 'button';
      b.innerHTML = escapeHtml(t) + ' <span class="tag-count">' + freq[t] + '</span>';
      b.addEventListener('click', function () {
        if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
        renderTagCloud(); renderCards();
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- 渲染：卡片（分批渲染，避免一次渲染数百张卡） ---------- */
  var RENDER_STEP = 60, shownCount = RENDER_STEP, loadIO = null;
  function renderCards(keepShown) {
    if (!keepShown) shownCount = RENDER_STEP;
    var grid = $('promptGrid'), empty = $('emptyState'), countEl = $('resultCount');
    if (!grid) return;
    var list = filterPrompts();
    grid.innerHTML = '';
    list.slice(0, shownCount).forEach(function (p, idx) {
      var faved = isFav(p.id), liked = isLike(p.id);
      var card = document.createElement('article');
      card.className = 'prompt-card';
      card.dataset.pid = p.id;
      card.style.animationDelay = (Math.min(idx, 12) * 0.03) + 's';
      attachTilt(card);

      var tagsHtml = (p.tags || []).map(function (t) {
        return '<button class="tag-pill" data-tag="' + escapeHtml(t) + '" type="button">' + escapeHtml(t) + '</button>';
      }).join('');

      // P1 来源两档徽章：绿=已校准/精选 / 蓝=社区或原生未校验
      var tm = TIER_META[sourceTier(p)];
      var tierBadge = '<span class="tier-badge tier-' + tm.cls + '" title="' + escapeHtml(tm.desc) + '">' +
        '<i class="tier-dot"></i>' + escapeHtml(tm.label) + '</span>';

      var srcHtml = '';
      // URL 协议白名单：仅放行 http/https，阻断 javascript: / data: 等可执行协议（防 XSS）
      var rawUrl = p.sourceUrl || '';
      var safeUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : '';
      if (p.community) {
        srcHtml = '<div class="card-source"><i class="fa-solid fa-circle-info"></i> 来源：' +
          (p.source ? escapeHtml(p.source) : '网友投稿') + '</div>';
      } else if (safeUrl) {
        srcHtml = '<div class="card-source"><i class="fa-solid fa-circle-info"></i> 来源：' +
          '<a href="' + escapeHtml(safeUrl) + '" target="_blank" rel="noopener">' + escapeHtml(p.source || safeUrl) + '</a></div>';
      } else {
        srcHtml = '<div class="card-source"><i class="fa-solid fa-circle-info"></i> 来源：' +
          escapeHtml(p.source || '未知') + '</div>';
      }

      // 数据指标：浏览 / 复制 / 评分（模拟数据，为展示用途；后续可接入真实统计）
      var statsHtml = '<span class="card-stats">' +
        '<span class="stat" title="浏览次数"><i class="fa-regular fa-eye"></i> ' + fmtNum(p.views || 0) + '</span>' +
        '<span class="stat" title="复制次数"><i class="fa-regular fa-copy"></i> ' + fmtNum(p.copies || 0) + '</span>' +
        '<span class="stat stat-score" title="综合评分"><i class="fa-solid fa-star"></i> ' + (p.score || 0).toFixed(1) + '</span>' +
      '</span>';

      card.innerHTML =
        '<div class="card-top">' +
          '<div class="card-cat-icon"><i class="fa-solid ' + (p.icon || 'fa-tag') + '"></i></div>' +
          '<div class="card-head-text"><div class="card-cat">' + escapeHtml(p.cat) + '</div>' +
          '<h3 class="card-title">' + escapeHtml(p.title) + '</h3>' +
          (p.titleZh ? '<div class="card-title-zh">' + escapeHtml(p.titleZh) + '</div>' : '') + '</div>' +
           tierBadge +
          (p.promptEn ? '<button class="btn-lang" type="button" title="切换中文 / 英文" aria-label="切换中英文">EN</button>' : '') +
        '</div>' +
        (tagsHtml ? '<div class="card-tags">' + tagsHtml + '</div>' : '') +
        srcHtml +
        '<div class="card-body">' +
          '<span class="lang-tag">' + (LANG_LABEL[p.lang] || (p.lang === 'en' ? 'EN 原文' : '中文原文')) + '</span>' +
          '<div class="body-text">' + highlightPlaceholders(p.prompt) + '</div>' +
        '</div>' +
        // 多语言条目的「中文参考译文」：默认折叠，AI 生成、非官方，原文始终优先
        (p.promptZh ?
          '<div class="zh-ref" hidden>' +
            '<div class="zh-ref-label"><i class="fa-solid fa-language"></i>中文参考译文 · AI 生成</div>' +
            '<div class="zh-ref-text">' + escapeHtml(p.promptZh) + '</div>' +
          '</div>' +
          '<button class="btn-zh-ref" type="button"><i class="fa-regular fa-eye"></i> 查看中文参考</button>' : '') +
        '<button class="btn-expand" type="button">展开全文 ▾</button>' +
        '<div class="card-foot">' +
          '<div class="foot-stats">' + statsHtml + '</div>' +
          '<div class="foot-actions">' +
            '<button class="btn-icon btn-like' + (liked ? ' liked' : '') + '" type="button" title="点赞" aria-label="点赞"><i class="fa' + (liked ? ' fa-solid' : ' fa-regular') + ' fa-thumbs-up"></i></button>' +
            '<button class="btn-icon btn-fav' + (faved ? ' faved' : '') + '" type="button" title="收藏" aria-label="收藏"><i class="fa' + (faved ? ' fa-solid' : ' fa-regular') + ' fa-star"></i></button>' +
            '<button class="btn-icon btn-share" type="button" title="复制链接" aria-label="复制链接"><i class="fa-solid fa-link"></i></button>' +
            '<button class="btn-copy" type="button"><i class="fa-regular fa-copy"></i> 复制</button>' +
          '</div>' +
        '</div>';

      // 3D 内层包裹 + 高光层（不改动 innerHTML 字符串拼接）
  var _inner = document.createElement('div');
  _inner.className = 'card-inner';
  while (card.firstChild) _inner.appendChild(card.firstChild);
  card.appendChild(_inner);
  var _glare = document.createElement('div');
  _glare.className = 'card-glare';
  card.appendChild(_glare);

  // 标签点击
      card.querySelectorAll('.tag-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          var t = pill.getAttribute('data-tag');
          if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
          renderTagCloud(); renderCards();
        });
      });

      // 点击卡片标题/正文 → 打开详情弹层（标题、分类、来源链接、正文、标签均可点区域触发）
      card.querySelector('.card-head-text').addEventListener('click', function (e) {
        if (e.target.closest('button, a')) return;
        openDetailModal(p.id);
      });
      card.querySelector('.card-body').addEventListener('click', function (e) {
        if (e.target.closest('.ph, button, a')) return;
        openDetailModal(p.id);
      });

      // 展开
      var body = card.querySelector('.card-body'), expandBtn = card.querySelector('.btn-expand');
      expandBtn.addEventListener('click', function () {
        var open = body.classList.toggle('expanded');
        expandBtn.textContent = open ? '收起 ▴' : '展开全文 ▾';
      });

      // 中文参考译文（折叠展开）
      var zhBtn = card.querySelector('.btn-zh-ref');
      if (zhBtn) {
        var zhRef = card.querySelector('.zh-ref');
        zhBtn.addEventListener('click', function () {
          var show = zhRef.hidden;
          zhRef.hidden = !show;
          zhBtn.innerHTML = show
            ? '<i class="fa-solid fa-eye-slash"></i> 收起译文'
            : '<i class="fa-regular fa-eye"></i> 查看中文参考';
        });
      }

      // 中/英切换（仅在同时存在两种语言原文时启用）
      var langBtn = card.querySelector('.btn-lang'), langTag = card.querySelector('.lang-tag'), bodyText = card.querySelector('.body-text');
      var langEn = false;
      if (langBtn) {
        langBtn.addEventListener('click', function () {
          langEn = !langEn;
          if (langEn) { bodyText.innerHTML = highlightPlaceholders(p.promptEn || p.prompt); langTag.textContent = 'English'; langBtn.textContent = '中'; }
          else { bodyText.innerHTML = highlightPlaceholders(p.prompt); langTag.textContent = LANG_LABEL[p.lang] || (p.lang === 'en' ? 'EN 原文' : '中文原文'); langBtn.textContent = 'EN'; }
        });
      }

      // 占位符点击填充：点 .ph（可替换占位符）打开填充弹窗，按当前展示语言（中/英）取原文
      bodyText.addEventListener('click', function (e) {
        if (e.target.closest('.ph')) {
          openFillModal(langEn && p.promptEn ? p.promptEn : p.prompt);
        }
      });

      // 点赞
      var likeBtn = card.querySelector('.btn-like');
      likeBtn.addEventListener('click', function () {
        var on = toggleLike(p.id);
        likeBtn.classList.toggle('liked', on);
        likeBtn.querySelector('i').className = 'fa ' + (on ? 'fa-solid' : 'fa-regular') + ' fa-thumbs-up';
      });
      // 收藏
      var favBtn = card.querySelector('.btn-fav');
      favBtn.addEventListener('click', function () {
        var on = toggleFav(p.id);
        favBtn.classList.toggle('faved', on);
        favBtn.querySelector('i').className = 'fa ' + (on ? 'fa-solid' : 'fa-regular') + ' fa-star';
        toast(on ? '已收藏' : '已取消收藏', on ? 'fa-star' : 'fa-regular fa-star');
      });

      // 复制（带出处署名）
      var copyBtn = card.querySelector('.btn-copy');
      copyBtn.addEventListener('click', function () {
        var text = (langEn && p.promptEn) ? p.promptEn : p.prompt;
        var withAttr = $('attribChk') && $('attribChk').checked;
        if (withAttr && p.source) {
          text += '\n\n— 来源：' + p.source + (p.sourceUrl ? ' (' + p.sourceUrl + ')' : '');
        }
        copyText(text).then(function (ok) {
          if (ok === false) { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 复制'; return; } // 已弹手动复制层
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
          toast('已复制全文', 'fa-check');
          burstConfetti(copyBtn);
          setTimeout(function () { copyBtn.classList.remove('copied'); copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 复制'; }, 1600);
        }).catch(function () {
          copyBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> 复制失败';
          setTimeout(function () { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 复制'; }, 1600);
        });
      });

      // 复制链接（永久深链 #id）
      var shareBtn = card.querySelector('.btn-share');
      if (shareBtn) {
        shareBtn.addEventListener('click', function () {
          var url = location.href.split('#')[0] + '#' + encodeURIComponent(p.id);
          copyText(url).then(function (ok) {
            if (ok === false) return; // 已弹手动复制层
            toast('已复制链接', 'fa-link');
            burstConfetti(shareBtn);
            shareBtn.classList.add('copied');
            setTimeout(function () { shareBtn.classList.remove('copied'); }, 1400);
          }).catch(function () { toast('复制链接失败', 'fa-triangle-exclamation'); });
        });
      }

      grid.appendChild(card);
    });

    if (list.length > shownCount) {
      var more = document.createElement('button');
      more.className = 'load-more-btn';
      more.type = 'button';
      more.textContent = '加载更多（还有 ' + (list.length - shownCount) + ' 条）';
      more.addEventListener('click', function () { shownCount += RENDER_STEP; renderCards(true); });
      grid.appendChild(more);
      // 滚动自动加载：哨兵进入视口即自动加载下一批（保留按钮作为手动兜底）
      var sentinel = document.createElement('div');
      sentinel.className = 'load-sentinel';
      grid.appendChild(sentinel);
      if ('IntersectionObserver' in window) {
        if (loadIO) loadIO.disconnect();
        loadIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { shownCount += RENDER_STEP; renderCards(true); }
          });
        }, { rootMargin: '600px 0px' });
        loadIO.observe(sentinel);
      }
    } else if (loadIO) {
      loadIO.disconnect();
      loadIO = null;
    }

    if (empty) empty.hidden = list.length !== 0;
    if (countEl) {
      var label = (state.q.trim() ? '找到 ' : '共 ') + list.length + ' 条';
      if (state.cat !== '全部') label += '（' + state.cat + '）';
      if (state.lang !== 'all') label += ' · ' + (LANG_LABEL[state.lang] || state.lang);
      if (state.tags.size) label += ' · 标签 ' + state.tags.size;
      if (state.favOnly) label += ' · 我的收藏';
      // 有任一筛选生效时，提供"清除筛选"一键回到全部
      var hasFilter = !!(state.q.trim() || state.cat !== '全部' || state.lang !== 'all' || state.tags.size || state.favOnly || state.tier !== 'all');
      countEl.innerHTML = '';
      countEl.appendChild(document.createTextNode(label));
      if (hasFilter) {
        var clr = document.createElement('button');
        clr.type = 'button';
        clr.className = 'count-reset';
        clr.textContent = '清除筛选 ✕';
        clr.setAttribute('aria-label', '清除所有筛选条件');
        clr.addEventListener('click', function () { resetFilters(); });
        countEl.appendChild(clr);
      }
    }
    // ④ 多语言包上下文提示：切到 fr/de/es/pt/nl 时显示来源说明，化解"仍是中文标题"的困惑
    var intlHint = $('intlHint');
    if (intlHint) {
      if (INTL_LANGS.indexOf(state.lang) !== -1) {
        intlHint.hidden = false;
        intlHint.innerHTML = '<i class="fa-solid fa-globe"></i> 正在浏览多语言包：<strong>' +
          (LANG_LABEL[state.lang] || state.lang) + '</strong> · 共 ' + list.length +
          ' 条 · 原文为该语言，中文标题 / 译文仅作辅助参考';
      } else {
        intlHint.hidden = true;
      }
    }
    updateHash();
  }

  /* ---------- 永久链接 / 可分享筛选状态：启动恢复 + hashchange 跟随 ---------- */
  function applyHash() {
    var st = parseHash();
    if (!st) return;
    if (st.id) { // 旧永久链接：#id 定位单条
      var id = st.id;
      var list = filterPrompts();
      var idx = -1;
      for (var i = 0; i < list.length; i++) { if (list[i].id === id) { idx = i; break; } }
      if (idx === -1) return; // 不在当前筛选范围内
      if (idx >= shownCount) { shownCount = idx + 1; renderCards(true); } // 目标在后续批次，先渲染足量
      var grid = $('promptGrid');
      if (!grid) return;
      var el = null, cards = grid.querySelectorAll('.prompt-card');
      cards.forEach(function (c) { if (c.dataset.pid === id) el = c; });
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash');
        setTimeout(function () { el.classList.remove('flash'); }, 1800);
      }
      return;
    }
    applyHashState(st); // 可分享筛选状态：#q=&cat=&…
  }

  /* ---------- 搜索（防抖：避免每次按键重建列表） ---------- */
  var searchTimer = null;
  function initSearch() {
    var input = $('searchInput'), clear = $('searchClear');
    if (!input) return;
    input.addEventListener('input', function () {
      state.q = input.value;
      if (clear) clear.classList.toggle('show', input.value.length > 0);
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(renderCards, 120);
    });
    if (clear) clear.addEventListener('click', function () {
      if (searchTimer) clearTimeout(searchTimer);
      input.value = ''; state.q = ''; clear.classList.remove('show'); renderCards(); input.focus();
    });
  }

  /* ---------- Hero 热门场景快入口 ---------- */
  function initHeroChips() {
    document.querySelectorAll('.hero-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = b.getAttribute('data-q') || '';
        var input = $('searchInput'), clear = $('searchClear');
        if (input) input.value = q;
        state.q = q;
        if (clear) clear.classList.toggle('show', q.length > 0);
        renderCards();
        var lib = $('library');
        if (lib) lib.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- 工具栏 ---------- */
  function initToolbar() {
    var sort = $('sortSelect');
    if (sort) sort.addEventListener('change', function () { state.sort = sort.value; renderCards(); });

    var favBtn = $('favFilterBtn');
    if (favBtn) favBtn.addEventListener('click', function () {
      state.favOnly = !state.favOnly;
      favBtn.classList.toggle('is-active', state.favOnly);
      renderCards();
    });

    // 语言筛选：全部 / 中文 / EN 原文 / 多语言包（fr/de/es/pt/nl 懒加载）
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        state.lang = b.getAttribute('data-lang') || 'all';
        document.querySelectorAll('.lang-btn').forEach(function (x) {
          x.classList.toggle('is-active', x === b);
        });
        // 选中多语言包中的某一语言时，先按需拉取对应语言分包，加载完成后再渲染
        if (INTL_LANGS.indexOf(state.lang) !== -1 && !intlLoaded(state.lang)) {
          b.classList.add('is-loading');
          var ce = $('resultCount');
          if (ce) ce.textContent = '正在加载多语言包（' + (LANG_LABEL[state.lang] || state.lang) + '）…';
          ensureIntl(state.lang, function () { renderCards(); });
        } else {
          renderCards();
        }
      });
    });

    var loadBtn = $('loadCommunityBtn');
    if (loadBtn) loadBtn.addEventListener('click', function () { loadCommunity(); });
  }

  /* ---------- 投稿弹窗 ---------- */
  function initSubmit() {
    var modal = $('submitModal'), openBtn = $('submitBtn'), closeBtn = $('submitClose'), cancel = $('submitCancel'), form = $('submitForm'), catSel = $('submitCat');
    if (!modal || !form) return;
    // 填充行业下拉
    if (catSel && window.PROMPT_CATEGORIES) {
      catSel.innerHTML = '';
      window.PROMPT_CATEGORIES.forEach(function (c) {
        if (c.key === '全部') return;
        var o = document.createElement('option'); o.value = c.key; o.textContent = c.key; catSel.appendChild(o);
      });
    }
    // 用内联样式控制显隐：内联样式优先级高于普通作者样式，即使浏览器缓存了旧版 CSS 也能保证关得掉
    function open() { modal.hidden = false; modal.style.display = 'grid'; document.body.style.overflow = 'hidden'; }
    function close() { modal.hidden = true; modal.style.display = 'none'; document.body.style.overflow = ''; }
    close(); // 初始化：强制关闭，避免弹窗遮罩挡住整页点击
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancel) cancel.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var title = (fd.get('title') || '').toString().trim();
      var prompt = (fd.get('prompt') || '').toString().trim();
      if (!title || !prompt) { toast('请填写标题与提示词', 'fa-triangle-exclamation'); return; }
      var id = 'c-' + Date.now();
      var entry = {
        id: id, cat: fd.get('cat'),
        tags: (fd.get('tags') || '').toString().split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean),
        title: title, titleEn: (fd.get('titleEn') || '').toString().trim(),
        prompt: prompt, promptEn: (fd.get('promptEn') || '').toString().trim(),
        source: (fd.get('source') || '').toString().trim() || '社区投稿',
        sourceUrl: '', contributor: '社区用户', heat: 0, verified: false, community: true
      };
      // 存入本地
      community.push(entry); lsSetArr(K.community, community);
      renderTagCloud(); renderCards();
      // 安全加固：不再索取用户的 GitHub Token（原 ghToken / ghRepo 输入与 ghSubmit 直推逻辑已移除）
      // 投稿仅保存到本机浏览器，避免高权限凭证被索取、明文存储或被 XSS 窃取。
      toast('已保存到本地浏览器', 'fa-circle-check');
      form.reset();
      close();
    });
  }

  /* 安全加固：ghSubmit（用用户 Token 直推 GitHub）已移除 ——
     不再在前端索取 / 存储 GitHub 凭证。公开投稿的读取（loadCommunity）保留，
     它读的是仓库的公开 submissions/ 目录，无需任何凭证。 */

  function loadCommunity() {
    var repo = lsGet(K.repo, REPO_DEFAULT);
    if (repo.indexOf('/') === -1) { toast('请先在投稿弹窗填写仓库 owner/name', 'fa-triangle-exclamation'); return; }
    var parts = repo.split('/');
    var url = 'https://api.github.com/repos/' + parts[0] + '/' + parts[1] + '/contents/' + SUBMISSIONS_DIR;
    toast('正在加载社区投稿…', 'fa-spinner fa-spin');
    fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } }).then(function (res) {
      if (!res.ok) { toast('暂无社区投稿或仓库未配置', 'fa-circle-info'); return; }
      return res.json();
    }).then(function (list) {
      if (!list || !list.length) { toast('该仓库还没有 submissions/', 'fa-circle-info'); return; }
      var tasks = list.filter(function (f) { return f.type === 'file' && f.download_url; }).slice(0, 60).map(function (f) {
        return fetch(f.download_url).then(function (r) { return r.json(); }).catch(function () { return null; });
      });
      Promise.all(tasks).then(function (items) {
        var local = lsGetArr(K.community).map(function (x) { return x.id; });
        var added = 0;
        items.forEach(function (it) {
          if (it && it.id && local.indexOf(it.id) === -1 && community.indexOf(it.id) === -1) { community.push(it); added++; }
        });
        lsSetArr(K.community, community);
        renderTagCloud(); renderCards();
        toast(added ? ('已加载 ' + added + ' 条社区投稿') : '已是最新，无新投稿', 'fa-circle-check');
      });
    }).catch(function () { toast('加载失败（可能被限流或跨域）', 'fa-triangle-exclamation'); });
  }

  /* ---------- 头部滚动 + 回到顶部 ---------- */
  function initScrollUI() {
    var header = $('siteHeader'), backTop = $('backTop');
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (backTop) backTop.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- 滚动揭示 ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in-view'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 空状态引导 ---------- */
  function resetFilters(keepQ) {
    if (!keepQ) state.q = '';
    state.cat = '全部'; state.lang = 'all'; state.tags.clear(); state.favOnly = false; state.tier = 'all';
    var si = $('searchInput'), sc = $('searchClear');
    if (si && !keepQ) si.value = '';
    if (sc) sc.classList.remove('show');
    document.querySelectorAll('.lang-btn').forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-lang') === 'all'); });
    renderChips(); renderTierFilter(); renderTagCloud(); renderCards();
  }
  function initEmptyState() {
    var empty = $('emptyState');
    if (!empty) return;
    var clr = empty.querySelector('.empty-clear');
    if (clr) clr.addEventListener('click', function () { resetFilters(); });
    empty.querySelectorAll('.empty-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        resetFilters(true);
        state.q = c.getAttribute('data-q') || '';
        var si = $('searchInput'), sc = $('searchClear');
        if (si) si.value = state.q;
        if (sc) sc.classList.toggle('show', state.q.length > 0);
        renderCards();
        var lib = $('library');
        if (lib) lib.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- 占位符填充弹窗 ---------- */
  // 把 raw 中的占位符（被 isPlaceholder 判定为真占位符的）按 valMap 替换；空值保留原 token
  function fillPrompt(raw, valMap) {
    var out = '', last = 0, m, re = phRegex();
    while ((m = re.exec(raw))) {
      var tok = m[0], inner = tok.slice(1, -1);
      out += raw.slice(last, m.index);
      if (isPlaceholder(inner) && valMap[tok] != null && valMap[tok].length) out += valMap[tok];
      else out += tok;
      last = m.index + tok.length;
    }
    out += raw.slice(last);
    return out;
  }
  function openFillModal(raw) {
    var modal = $('fillModal'), rows = $('fillRows'), preview = $('fillPreview');
    if (!modal || !rows || !preview) return;
    var seen = {}, uniq = [], m, re = phRegex();
    re.lastIndex = 0;
    while ((m = re.exec(raw))) {
      var tok = m[0], inner = tok.slice(1, -1);
      if (isPlaceholder(inner) && !seen[tok]) { seen[tok] = true; uniq.push(tok); }
    }
    if (!uniq.length) { toast('这条提示词没有可填充的占位符', 'fa-circle-info'); return; }
    rows.innerHTML = '';
    uniq.forEach(function (tok) {
      var row = document.createElement('label');
      row.className = 'fill-row';
      row.innerHTML = '<span class="fill-label">' + escapeHtml(tok) + '</span>' +
        '<input type="text" class="fill-input" data-tok="' + escapeHtml(tok) + '" placeholder="填入具体内容…" />';
      rows.appendChild(row);
    });
    function buildValMap() {
      var map = {};
      rows.querySelectorAll('.fill-input').forEach(function (inp) { map[inp.getAttribute('data-tok')] = inp.value; });
      return map;
    }
    function updatePreview() {
      var map = buildValMap(), html = '', last = 0, mm, pr = phRegex();
      pr.lastIndex = 0;
      while ((mm = pr.exec(raw))) {
        var tok = mm[0], inner = tok.slice(1, -1);
        html += escapeHtml(raw.slice(last, mm.index));
        if (isPlaceholder(inner)) {
          var v = map[tok];
          html += (v && v.length) ? '<mark class="ph-filled">' + escapeHtml(v) + '</mark>' : escapeHtml(tok);
        } else html += escapeHtml(tok);
        last = mm.index + tok.length;
      }
      html += escapeHtml(raw.slice(last));
      preview.innerHTML = html;
    }
    rows.querySelectorAll('.fill-input').forEach(function (inp) { inp.addEventListener('input', updatePreview); });
    updatePreview();
    modal._raw = raw;
    if (modal._open) modal._open();
    var first = rows.querySelector('.fill-input');
    if (first) first.focus();
  }
  function initFillModal() {
    var modal = $('fillModal'), closeBtn = $('fillClose'), cancel = $('fillCancel'), copyBtn = $('fillCopy'), rows = $('fillRows');
    if (!modal) return;
    function open() { modal.hidden = false; modal.style.display = 'grid'; document.body.style.overflow = 'hidden'; }
    function close() { modal.hidden = true; modal.style.display = 'none'; document.body.style.overflow = ''; if (rows) rows.innerHTML = ''; }
    modal._open = open; modal._close = close;
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancel) cancel.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
      if (copyBtn) copyBtn.addEventListener('click', function () {
      var raw = modal._raw; if (!raw) return;
      var map = {};
      rows.querySelectorAll('.fill-input').forEach(function (inp) { map[inp.getAttribute('data-tok')] = inp.value; });
      var finalText = fillPrompt(raw, map);
      copyText(finalText).then(function (ok) {
        if (ok === false) return; // 已弹手动复制层
        toast('已复制成品提示词', 'fa-circle-check');
        burstConfetti(copyBtn);
        close();
      }).catch(function () { toast('复制失败', 'fa-triangle-exclamation'); });
    });
  }

  /* ---------- 详情弹层：点卡片标题/正文打开完整提示词 ---------- */
  function findPromptById(id) {
    var all = allPrompts();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function openDetailModal(id) {
    var modal = $('detailModal');
    if (!modal) return;
    var p = findPromptById(id);
    if (!p) return;
    var body = $('detailBody');
    var tm = TIER_META[sourceTier(p)];
    var faved = isFav(p.id), liked = isLike(p.id);
    var safeUrl = /^https?:\/\//i.test(p.sourceUrl || '') ? p.sourceUrl : '';
    var tagsHtml = (p.tags || []).map(function (t) {
      return '<button class="tag-pill" data-tag="' + escapeHtml(t) + '" type="button">' + escapeHtml(t) + '</button>';
    }).join('');
    var attr = '';
    if (p.community) attr = '来源：' + escapeHtml(p.source || '网友投稿');
    else if (safeUrl) attr = '来源：<a href="' + escapeHtml(safeUrl) + '" target="_blank" rel="noopener">' + escapeHtml(p.source || safeUrl) + '</a>';
    else attr = '来源：' + escapeHtml(p.source || '未知');

    body.innerHTML =
      '<div class="detail-head">' +
        '<span class="tier-badge tier-' + tm.cls + '" title="' + escapeHtml(tm.desc) + '"><i class="tier-dot"></i>' + escapeHtml(tm.label) + '</span>' +
        '<span class="detail-cat">' + escapeHtml(p.cat) + '</span>' +
        '<span class="detail-lang">' + (LANG_LABEL[p.lang] || (p.lang === 'en' ? 'EN 原文' : '中文原文')) + '</span>' +
      '</div>' +
      '<h3 class="detail-title">' + escapeHtml(p.title) + '</h3>' +
      (p.titleZh ? '<div class="detail-title-zh">' + escapeHtml(p.titleZh) + '</div>' : '') +
      '<div class="detail-stats">' +
        '<span class="stat"><i class="fa-regular fa-eye"></i> 浏览 ' + fmtNum(p.views || 0) + '</span>' +
        '<span class="stat"><i class="fa-regular fa-copy"></i> 复制 ' + fmtNum(p.copies || 0) + '</span>' +
        '<span class="stat stat-score"><i class="fa-solid fa-star"></i> 评分 ' + (p.score || 0).toFixed(1) + '</span>' +
        '<span class="stat"><i class="fa-regular fa-thumbs-up"></i> 点赞 ' + (p.heat || 0) + '</span>' +
      '</div>' +
      (tagsHtml ? '<div class="detail-tags">' + tagsHtml + '</div>' : '') +
      '<div class="detail-source">' + attr + '</div>' +
      '<div class="detail-prompt">' + highlightPlaceholders(p.prompt) + '</div>' +
      (p.promptZh ?
        '<div class="detail-zh"><div class="zh-ref-label"><i class="fa-solid fa-language"></i>中文参考译文 · AI 生成</div><div class="zh-ref-text">' + escapeHtml(p.promptZh) + '</div></div>' : '') +
      '<div class="detail-actions">' +
        '<button class="btn-icon btn-like' + (liked ? ' liked' : '') + '" type="button" title="点赞" aria-label="点赞"><i class="fa' + (liked ? ' fa-solid' : ' fa-regular') + ' fa-thumbs-up"></i></button>' +
        '<button class="btn-icon btn-fav' + (faved ? ' faved' : '') + '" type="button" title="收藏" aria-label="收藏"><i class="fa' + (faved ? ' fa-solid' : ' fa-regular') + ' fa-star"></i></button>' +
        '<button class="btn-copy" type="button"><i class="fa-regular fa-copy"></i> 复制全文</button>' +
        '<button class="btn-share" type="button"><i class="fa-solid fa-link"></i> 复制链接</button>' +
      '</div>';

    // 详情内交互：标签、点赞、收藏、复制、分享
    body.querySelectorAll('.tag-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var t = pill.getAttribute('data-tag');
        if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
        closeDetailModal(); renderTagCloud(); renderCards();
      });
    });
    var likeBtn = body.querySelector('.btn-like');
    if (likeBtn) likeBtn.addEventListener('click', function () {
      var on = toggleLike(p.id);
      likeBtn.classList.toggle('liked', on);
      likeBtn.querySelector('i').className = 'fa ' + (on ? 'fa-solid' : 'fa-regular') + ' fa-thumbs-up';
    });
    var favBtn = body.querySelector('.btn-fav');
    if (favBtn) favBtn.addEventListener('click', function () {
      var on = toggleFav(p.id);
      favBtn.classList.toggle('faved', on);
      favBtn.querySelector('i').className = 'fa ' + (on ? 'fa-solid' : 'fa-regular') + ' fa-star';
      toast(on ? '已收藏' : '已取消收藏', on ? 'fa-star' : 'fa-regular fa-star');
    });
    var copyBtn = body.querySelector('.btn-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var text = p.prompt;
      if ($('attribChk') && $('attribChk').checked && p.source) {
        text += '\n\n— 来源：' + p.source + (p.sourceUrl ? ' (' + p.sourceUrl + ')' : '');
      }
      copyText(text).then(function (ok) {
        if (ok === false) return;
        toast('已复制全文', 'fa-check'); burstConfetti(copyBtn);
      }).catch(function () { toast('复制失败', 'fa-triangle-exclamation'); });
    });
    var shareBtn = body.querySelector('.btn-share');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      var url = location.href.split('?')[0] + '?v=' + encodeURIComponent((document.querySelector('meta[name="app-version"]') || {}).content || '') + '#' + p.id;
      copyText(url).then(function (ok) { if (ok !== false) toast('链接已复制', 'fa-link'); });
    });

    modal._pid = p.id;
    modal.hidden = false; modal.style.display = 'grid'; document.body.style.overflow = 'hidden';
  }
  function closeDetailModal() {
    var modal = $('detailModal');
    if (modal) { modal.hidden = true; modal.style.display = 'none'; document.body.style.overflow = ''; }
  }
  function initDetailModal() {
    var modal = $('detailModal');
    if (!modal) return;
    var closeBtn = $('detailClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeDetailModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeDetailModal(); });
  }

  /* ---------- 视图切换：全部提示词 / 热门热榜 ---------- */
  function initViewTabs() {
    var tabs = document.querySelectorAll('.view-tab');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var v = tab.getAttribute('data-view');
        if (!v || v === state.view) return;
        state.view = v;
        tabs.forEach(function (t) {
          t.classList.toggle('is-active', t.getAttribute('data-view') === v);
          t.setAttribute('aria-selected', t.getAttribute('data-view') === v ? 'true' : 'false');
        });
        // 切到热榜时强制综合热度排序；切回全部保持当前排序
        if (v === 'hot') { state.sort = 'score'; var sel = $('sortSelect'); if (sel) sel.value = 'score'; }
        renderCards();
      });
    });
  }

  /* ---------- 手机端：默认折叠 tier / 热门话题，点"更多筛选"展开/收起 ---------- */
  function initFilterMobileToggle() {
    var fb = $('filterBar'), btn = $('filterToggleMobile');
    if (!fb || !btn || !window.matchMedia) return;
    var mq = window.matchMedia('(max-width: 640px)');
    // 桌面端：热门话题（subtags）始终展开（details 原生折叠无法用 CSS 强制展开，需 JS 设 open）
    var wrap = document.querySelector('.subtags-wrap');
    if (wrap) wrap.open = !mq.matches;
    btn.addEventListener('click', function () {
      if (!mq.matches) return;
      var open = fb.classList.toggle('is-mobile-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- 键盘快捷键：按 / 聚焦搜索（输入控件内不拦截） ---------- */
  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      e.preventDefault();
      var inp = $('searchInput');
      if (inp) { inp.focus(); inp.select(); }
    });
  }

  /* ---------- 强调色换肤（5 套主题色，localStorage 持久化） ---------- */
  var ACCENT_KEY = 'prompt-accent';
  function initAccentPicker() {
    var dots = document.querySelectorAll('.acc-dot');
    if (!dots.length) return;
    var saved = lsGet(ACCENT_KEY, '');
    if (saved && saved !== 'default') {
      document.documentElement.setAttribute('data-accent', saved);
      dots.forEach(function (d) { d.classList.toggle('is-active', d.getAttribute('data-accent') === saved); });
    }
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var v = d.getAttribute('data-accent') || 'default';
        if (v === 'default') document.documentElement.removeAttribute('data-accent');
        else document.documentElement.setAttribute('data-accent', v);
        dots.forEach(function (x) { x.classList.toggle('is-active', x === d); });
        lsSet(ACCENT_KEY, v);
      });
    });
  }

  /* ---------- 特色：随机逛一条（🎲 随机定位 + 高亮） ---------- */
  function initSurprise() {
    var btn = $('surpriseBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var list = allPrompts();
      if (!list.length) return;
      var pick = list[Math.floor(Math.random() * list.length)];
      // 若当前筛选结果里没有它，先回到「全部」再定位
      var inList = filterPrompts().some(function (p) { return p.id === pick.id; });
      if (!inList) resetFilters();
      var cur = filterPrompts(), idx = -1;
      for (var i = 0; i < cur.length; i++) { if (cur[i].id === pick.id) { idx = i; break; } }
      if (idx === -1) return;
      if (idx >= shownCount) { shownCount = idx + 1; renderCards(true); }
      var grid = $('promptGrid'); if (!grid) return;
      var el = null; grid.querySelectorAll('.prompt-card').forEach(function (c) { if (c.dataset.pid === pick.id) el = c; });
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash');
        setTimeout(function () { el.classList.remove('flash'); }, 1800);
      }
      toast('🎲 随机逛到：' + (pick.title || pick.id), 'fa-dice');
    });
  }

  /* ---------- Service Worker 注册（PWA：离线 + 二次访问秒开） ---------- */
  function initSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      });
    }
  }

  /* ---------- 启动 ---------- */
  function boot() {
    renderChips();
    renderTierFilter();
    renderTagCloud();
    renderCards();
    applyHash();
    window.addEventListener('hashchange', applyHash);
    initSearch();
    initHeroChips();
    initToolbar();
    initSubmit();
    initFillModal();
    initDetailModal();
    initViewTabs();
    initEmptyState();
    initScrollUI();
    initFilterMobileToggle();
    initReveal();
    initHeroLoad();
    initShortcuts();
    initAccentPicker();
    initSurprise();
    initSW();
    var hm = $('heroMascot'); if (hm) hm.innerHTML = mascotSVG();
    var em = $('emptyMascot'); if (em) em.innerHTML = mascotSVG();
    // 数据就绪后：移出骨架屏占位（renderCards 已替换 grid 内容）、显示准确总数
    var grid = $('promptGrid'); if (grid) grid.removeAttribute('aria-busy');
    var total = $('statTotal');
    if (total) total.textContent = allPrompts().length;
    // 懒加载剩余主库分片（首屏只同步 chunk-1）；全部就绪后刷新统计/标签/定位
    loadNextMainChunk();
    onMainDataReady(function () {
      if (total) total.textContent = allPrompts().length;
      renderTagCloud(); renderCards();
      applyHash(); // 数据补全后重新定位（单条可能落在 chunk-1 之外）
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
