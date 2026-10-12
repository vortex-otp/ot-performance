/* FirstMotion: lightweight navigation. All content is usable without animation. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var menu = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  function setMenu(open) {
    if (!header || !menu || !nav) return;
    header.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
  }
  if (menu && nav) {
    if (!nav.id) nav.id = 'main-nav';
    menu.setAttribute('aria-controls', nav.id);
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    });
    document.addEventListener('click', function (event) { if (header && !header.contains(event.target)) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
    window.addEventListener('firstmotion:modal', function () { setMenu(false); });
  }
  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  // Preserve the existing Vortex event names and non-personal event payloads.
  function track(name, data) {
    if (typeof window.vtx === 'function') window.vtx('track', name, data || {});
  }
  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    var method = event.target.closest('.contact-method');
    if (method) {
      track('contact_click', { channel: (method.className.match(/contact-(email|facebook|whatsapp)/) || [])[1] || 'other' });
      return;
    }
    var cta = event.target.closest('a[href="#fit-check"]');
    if (cta) {
      var where = cta.closest('section, header');
      track('fit_check_cta', { placement: where ? (where.id || where.className.split(' ')[0]) : 'page' });
    }
  });
  // Preserve legacy deep links while using a new information architecture.
  window.__fmReady = true;
})();
