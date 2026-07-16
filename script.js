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

  var labRange = document.getElementById('motion-range');
  var labPanel = document.querySelector('.lab-panel');
  var labVisual = document.querySelector('.lab-visual');
  var labStatus = document.querySelector('.lab-status');
  var labStep = document.querySelector('.lab-step');
  var labLive = document.getElementById('motion-live');
  var labWords = {
    he: ['כיוון', 'תנועה', 'מערכת', 'צמיחה'],
    en: ['Direction', 'Motion', 'System', 'Growth']
  };

  function updateLab(announce) {
    if (!labRange || !labPanel || !labVisual || !labStatus) return;
    var value = Number(labRange.value);
    var step = Math.min(3, Math.floor(value / 25));
    var activeLang = document.documentElement.lang === 'en' ? 'en' : 'he';
    var word = labWords[activeLang][step];

    labPanel.style.setProperty('--lab-fill', value + '%');
    labPanel.style.setProperty('--lab-f1x', (-14 - value * 0.62).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f1y', (-8 - value * 0.12).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f1r', (-2 - value * 0.075).toFixed(1) + 'deg');
    labPanel.style.setProperty('--lab-f2x', (-5 - value * 0.22).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f2y', (-3 - value * 0.04).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f2r', (-0.5 - value * 0.025).toFixed(1) + 'deg');
    labPanel.style.setProperty('--lab-f3x', (5 + value * 0.22).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f3y', (3 + value * 0.04).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f3r', (0.5 + value * 0.025).toFixed(1) + 'deg');
    labPanel.style.setProperty('--lab-f4x', (14 + value * 0.62).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f4y', (8 + value * 0.12).toFixed(1) + 'px');
    labPanel.style.setProperty('--lab-f4r', (2 + value * 0.075).toFixed(1) + 'deg');
    labPanel.style.setProperty('--lab-origin-x', (-108 + value * 2.16).toFixed(1) + 'px');
    labVisual.setAttribute('data-step', String(step));
    labStatus.textContent = word;
    if (labStep) labStep.textContent = '0' + (step + 1) + ' / 04';
    labRange.setAttribute('aria-valuetext', word + ', ' + value + '%');
    if (announce && labLive) labLive.textContent = word;
  }

  if (labRange) {
    labRange.addEventListener('input', function () { updateLab(false); });
    labRange.addEventListener('change', function () { updateLab(true); });
    window.addEventListener('firstmotion:language', function () { updateLab(false); });
    updateLab(false);
  }

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
