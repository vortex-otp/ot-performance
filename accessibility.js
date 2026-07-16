// ============================================================
//  Wave Zero — Accessibility widget
//  Israeli IS-5568 / WCAG 2.0 AA helper. Self-injecting.
//  Include on every page:  <script src="accessibility.js"></script>
// ============================================================
(function () {
  var KEY = 'ot-a11y';
  var root = document.documentElement;

  // root-relative prefix so sub-pages link back correctly
  var prefix = (function () {
    var p = location.pathname;
    return p.indexOf('/pages/') !== -1 ? '../' : '';
  })();

  var state = { font: 0, contrast: false, grayscale: false, links: false, readable: false, motion: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function apply() {
    var scale = [1, 1.12, 1.24, 1.38][state.font] || 1;
    root.style.zoom = scale === 1 ? '' : scale;
    root.classList.toggle('a11y-contrast', state.contrast);
    root.classList.toggle('a11y-grayscale', state.grayscale);
    root.classList.toggle('a11y-links', state.links);
    root.classList.toggle('a11y-readable', state.readable);
    root.classList.toggle('a11y-no-motion', state.motion);
    syncUI();
  }

  function syncUI() {
    var p = document.getElementById('a11y-panel');
    if (!p) return;
    p.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.classList.toggle('active', !!state[b.getAttribute('data-toggle')]);
      b.setAttribute('aria-pressed', !!state[b.getAttribute('data-toggle')]);
    });
    var fl = document.getElementById('a11y-font-label');
    if (fl) fl.textContent = state.font === 0 ? 'רגיל' : '+' + state.font;
  }

  var icon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 5.5c0 .7-.5 1.2-1.2 1.3l-4.3.6v3.2l1.9 6.6a1.2 1.2 0 0 1-2.3.7L13.4 15h-2.8l-1.4 4.9a1.2 1.2 0 0 1-2.3-.7l1.9-6.6V9.4l-4.3-.6A1.3 1.3 0 0 1 3 7.5C3 6.8 3.6 6.2 4.4 6.3L9.7 7c1.5.2 3.1.2 4.6 0l5.3-.7c.8-.1 1.4.5 1.4 1.2z"/></svg>';

  function build() {
    var btn = document.createElement('button');
    btn.className = 'a11y-toggle';
    btn.id = 'a11y-toggle';
    btn.setAttribute('aria-label', 'תפריט נגישות');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = icon;

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'אפשרויות נגישות');
    panel.innerHTML =
      '<h2>נגישות<button class="a11y-close" id="a11y-close" aria-label="סגירה">\u00d7</button></h2>' +
      '<p class="a11y-sub">התאמת התצוגה לצרכים שלך. ההגדרות נשמרות בדפדפן.</p>' +
      '<div class="a11y-group">' +
        '<button class="a11y-btn" id="a11y-font-down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" stroke-linecap="round"/></svg>הקטן טקסט</button>' +
        '<button class="a11y-btn" id="a11y-font-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>הגדל טקסט</button>' +
      '</div>' +
      '<div style="text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--ink-3);margin:2px 0 12px">גודל טקסט: <span id="a11y-font-label">רגיל</span></div>' +
      '<div class="a11y-group">' +
        '<button class="a11y-btn" data-toggle="contrast"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20V2z"/><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>ניגודיות גבוהה</button>' +
        '<button class="a11y-btn" data-toggle="grayscale"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>גווני אפור</button>' +
        '<button class="a11y-btn" data-toggle="links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke-linecap="round"/><path d="M14 10a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke-linecap="round"/></svg>הדגשת קישורים</button>' +
        '<button class="a11y-btn" data-toggle="readable"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h10" stroke-linecap="round"/></svg>פונט קריא</button>' +
        '<button class="a11y-btn full" data-toggle="motion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>עצירת אנימציות</button>' +
      '</div>' +
      '<button class="a11y-reset" id="a11y-reset">איפוס הגדרות</button>' +
      '<a class="a11y-statement-link" href="' + prefix + 'pages/accessibility.html">הצהרת נגישות מלאה</a>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function open(o) {
      panel.classList.toggle('open', o);
      btn.setAttribute('aria-expanded', String(o));
    }
    btn.addEventListener('click', function () { open(!panel.classList.contains('open')); });
    document.getElementById('a11y-close').addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) open(false);
    });

    document.getElementById('a11y-font-up').addEventListener('click', function () {
      state.font = Math.min(3, state.font + 1); save(); apply();
    });
    document.getElementById('a11y-font-down').addEventListener('click', function () {
      state.font = Math.max(0, state.font - 1); save(); apply();
    });
    panel.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-toggle');
        state[k] = !state[k]; save(); apply();
      });
    });
    document.getElementById('a11y-reset').addEventListener('click', function () {
      state = { font: 0, contrast: false, grayscale: false, links: false, readable: false, motion: false };
      save(); apply();
    });

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else { build(); }
})();
