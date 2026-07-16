// ============================================================
//  First Motion — Language toggle (HE / EN)
//  Generic engine. HTML is authored in Hebrew; English lives in
//  data-en attributes. Setting persists across pages.
//  Include on every page AFTER content:
//    <script src="lang.js"></script>  (use ../lang.js on sub-pages)
// ============================================================
(function () {
  var KEY = 'ot-lang';
  var root = document.documentElement;
  var lang = 'he';
  try { lang = localStorage.getItem(KEY) || 'he'; } catch (e) {}

  function apply(l) {
    lang = (l === 'en') ? 'en' : 'he';
    var en = lang === 'en';
    root.setAttribute('lang', en ? 'en' : 'he');
    root.setAttribute('dir', en ? 'ltr' : 'rtl');

    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.getAttribute('data-he') === null) {
        el.setAttribute('data-he', el.innerHTML);
      }
      el.innerHTML = en ? el.getAttribute('data-en') : el.getAttribute('data-he');
    });

    document.querySelectorAll('.lang-opt').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  window.__setLang = apply;

  function wire() {
    document.querySelectorAll('.lang-opt').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-lang')); });
    });
    apply(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else { wire(); }
})();
