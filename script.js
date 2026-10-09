(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function motionOff() {
    return reduceMotion.matches || document.documentElement.classList.contains('a11y-no-motion');
  }

  // ── Mobile menu ──
  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.main-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.focus();
      }
    });
  }

  // ── Header hairline once the page scrolls ──
  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  // ── Hero domino chain: the page's one orchestrated motion moment ──
  var stage = document.getElementById('domino-stage');
  var replay = document.getElementById('domino-replay');
  var resetTimer = 0;

  function fall() {
    if (!stage) return;
    clearTimeout(resetTimer);
    stage.setAttribute('data-state', 'fallen');
  }

  function pushAgain() {
    if (!stage) return;
    if (motionOff()) { stage.setAttribute('data-state', 'fallen'); return; }
    stage.setAttribute('data-state', 'resetting');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      stage.setAttribute('data-state', 'idle');
      // two frames so the upright pose is committed before the next fall
      requestAnimationFrame(function () { requestAnimationFrame(fall); });
    }, 520);
  }

  if (stage) {
    if (motionOff()) {
      fall();
    } else if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setTimeout(fall, 450);
          seen.disconnect();
        });
      }, { threshold: 0.45 });
      seen.observe(stage);
    } else {
      fall();
    }
    if (replay) replay.addEventListener('click', pushAgain);
  }

  // ── FAQ: one open answer at a time ──
  var faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  document.querySelectorAll('.yr').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  // ── Measurement seams (Vortex) ──
  function track(name, data) {
    if (window.vtx) window.vtx('track', name, data || {});
  }
  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    var method = event.target.closest('.contact-method');
    if (method) {
      var channel = (method.className.match(/contact-(email|facebook|whatsapp)/) || [])[1] || 'other';
      track('contact_click', { channel: channel });
      return;
    }
    var cta = event.target.closest('a[href="#fit-check"]');
    if (cta) {
      var where = cta.closest('section, header');
      track('fit_check_cta', { placement: where ? (where.id || where.className.split(' ')[0]) : 'page' });
    }
  });
})();
