(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton && header) {
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });

    header.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add('in'); });
  }

  var board = document.querySelector('.system-board');
  var canParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (board && canParallax) {
    board.addEventListener('pointermove', function (event) {
      var rect = board.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
      var y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
      board.style.setProperty('--board-x', x.toFixed(2) + 'px');
      board.style.setProperty('--board-y', y.toFixed(2) + 'px');
    });
    board.addEventListener('pointerleave', function () {
      board.style.setProperty('--board-x', '0px');
      board.style.setProperty('--board-y', '0px');
    });
  }

  var scheduled = false;
  function updateProgress() {
    if (!header) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    header.style.setProperty('--progress', progress);
    scheduled = false;
  }
  window.addEventListener('scroll', function () {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  var faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  document.querySelectorAll('.yr').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
})();
