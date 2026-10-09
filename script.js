(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');

  function a11yMotionOff() {
    try { return !!(JSON.parse(localStorage.getItem('ot-a11y') || '{}').motion); } catch (e) { return false; }
  }
  var motion = !root.classList.contains('no-motion') && !a11yMotionOff() && !!window.gsap && !!window.ScrollTrigger;
  if (!motion) root.classList.add('no-motion');
  window.__fmReady = true;

  function isRTL() { return (root.getAttribute('dir') || 'rtl') === 'rtl'; }

  // ── Mobile menu ──
  if (menuButton && header) {
    var closeMenu = function () { header.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); };
    menuButton.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.main-nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); menuButton.focus(); }
    });
  }

  // ── Header: glass after the hero starts scrolling, hides on the way down ──
  var lastY = window.scrollY;
  function onScroll(y) {
    if (!header) return;
    header.classList.toggle('scrolled', y > 40);
    var goingDown = y > lastY + 4;
    var goingUp = y < lastY - 4;
    if (goingDown && y > 400 && !header.classList.contains('menu-open')) header.classList.add('hide');
    else if (goingUp || y < 400) header.classList.remove('hide');
    lastY = y;
  }

  // ── FAQ: one answer at a time, animated height ──
  var faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(function (item) {
    var summary = item.querySelector('summary');
    var body = item.querySelector('.faq-a');
    if (!summary || !body) return;
    summary.addEventListener('click', function (e) {
      if (!motion) return; // native toggle
      e.preventDefault();
      if (item.open) {
        gsap.to(body, { height: 0, duration: .4, ease: 'power2.inOut', onComplete: function () { item.open = false; body.style.height = ''; } });
      } else {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) {
            var ob = other.querySelector('.faq-a');
            gsap.to(ob, { height: 0, duration: .4, ease: 'power2.inOut', onComplete: function () { other.open = false; ob.style.height = ''; } });
          }
        });
        item.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .55, ease: 'power3.out' });
      }
    });
    item.addEventListener('toggle', function () {
      if (motion || !item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ── Measurement seams (Vortex) ──
  function track(name, data) { if (window.vtx) window.vtx('track', name, data || {}); }
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

  // ── Hero video: swap in when a source is configured ──
  var video = document.querySelector('.hero-video');
  if (video && video.getAttribute('data-src') && !root.classList.contains('no-motion')) {
    video.src = video.getAttribute('data-src');
    video.addEventListener('playing', function () { video.classList.add('playing'); }, { once: true });
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!motion) {
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    onScroll(window.scrollY);
    var stageStatic = document.querySelector('.cd-last');
    if (stageStatic) stageStatic.classList.add('lit');
    return;
  }

  // =================================================================
  //  Motion
  // =================================================================
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scrolling
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      prevent: function (node) { return !!(node.closest && node.closest('.fitc-overlay, .a11y-panel')); }
    });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.addEventListener('firstmotion:modal', function (e) { if (e.detail && e.detail.open) lenis.stop(); else lenis.start(); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#fit-check' || id === '#') return;
      var target = id === '#main' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      if (id !== '#main' && target.setAttribute) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    });
  } else {
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
  }

  // Split headings into words for masked reveals
  function splitWords(el) {
    if (el.getAttribute('data-split') === el.innerHTML) return el.querySelectorAll('.w > span');
    var text = el.textContent.trim();
    el.innerHTML = text.split(/\s+/).map(function (w) { return '<span class="w"><span>' + w + '</span></span>'; }).join(' ');
    el.setAttribute('data-split', el.innerHTML);
    el.setAttribute('aria-label', text);
    return el.querySelectorAll('.w > span');
  }
  document.querySelectorAll('.reveal-lines').forEach(function (el) {
    var words = splitWords(el);
    gsap.set(el, { visibility: 'visible' });
    gsap.from(words, {
      yPercent: 115, rotate: function () { return isRTL() ? -4 : 4; }, duration: 1.1, ease: 'expo.out', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
  // After a language switch, headings come back as plain text: keep them visible.
  window.addEventListener('firstmotion:language', function () {
    document.querySelectorAll('.reveal-lines').forEach(function (el) {
      el.removeAttribute('aria-label'); el.removeAttribute('data-split'); el.style.visibility = 'visible';
    });
    ScrollTrigger.refresh();
  });

  gsap.utils.toArray('.reveal-up').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // ── Intro → hero entrance ──
  function heroIn() {
    var tl = gsap.timeline();
    tl.to('.hero-title .line-in', { y: 0, duration: 1.3, ease: 'expo.out', stagger: .14 })
      .to('.hero-foot', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=.8')
      .to('.scroll-cue', { opacity: 1, duration: .6 }, '-=.4')
      .from('.hero-poster', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0);
    return tl;
  }
  var intro = document.getElementById('intro');
  if (intro && !root.classList.contains('intro-seen')) {
    if (lenis) lenis.stop();
    var tile = intro.querySelector('.intro-tile');
    var word = intro.querySelector('.intro-word');
    gsap.timeline({ onComplete: function () {
      intro.remove();
      try { sessionStorage.setItem('fm-intro', '1'); } catch (e) {}
      if (lenis) lenis.start();
    } })
      .from(tile, { yPercent: 40, opacity: 0, duration: .6, ease: 'power3.out' })
      .to(word, { opacity: 1, duration: .5 }, '-=.2')
      .to(tile, { rotate: function () { return isRTL() ? -88 : 88; }, duration: .55, ease: 'power3.in' }, '+=.15')
      .to(word, { opacity: 0, duration: .3 }, '-=.25')
      .to(intro, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.05')
      .add(heroIn(), '-=.55');
  } else {
    if (intro) intro.remove();
    heroIn();
  }

  // ── Hero parallax on scroll ──
  gsap.to('.hero-media', { yPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-inner', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });

  // ── Marquee that answers scroll velocity ──
  var track = document.querySelector('.marquee-track');
  if (track) {
    root.classList.add('gsap-marquee');
    var dirSign = function () { return isRTL() ? 1 : -1; };
    var loop = gsap.to(track, { xPercent: function () { return 50 * dirSign(); }, duration: 38, ease: 'none', repeat: -1 });
    var speed = gsap.quickTo(loop, 'timeScale', { duration: .6, ease: 'power3' });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) { speed(1 + Math.min(Math.abs(self.getVelocity()) / 260, 5)); },
      onLeave: function () { speed(1); }, onLeaveBack: function () { speed(1); }
    });
    window.addEventListener('firstmotion:language', function () { loop.invalidate().restart(); });
  }

  // ── The domino chain ──
  var chain = document.querySelector('.chain');
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (min-height: 640px)', function () {
    if (!chain) return;
    chain.classList.add('is-pinned');
    var panels = gsap.utils.toArray('.cpanel');
    var tiles = gsap.utils.toArray('.cd');
    var dots = gsap.utils.toArray('.chain-dots li');
    var last = document.querySelector('.cd-last');
    gsap.set(panels, { autoAlpha: 0, y: 40 });
    gsap.set(panels[0], { autoAlpha: 1, y: 0 });
    gsap.set(panels.map(function (p) { return p.querySelector('img'); }), { scale: 1.15 });
    dots[0] && dots[0].classList.add('on');

    var lean = function () { return isRTL() ? -26 : 26; };
    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: chain, pin: '.chain-pin', start: 'top top', end: function () { return '+=' + window.innerHeight * 4; },
        scrub: .8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) {
          var idx = Math.min(4, Math.floor(self.progress * 5));
          dots.forEach(function (d, i) { d.classList.toggle('on', i <= idx); });
          if (last) last.classList.toggle('lit', self.progress > .9);
        }
      }
    });
    tl.to(panels[0].querySelector('img'), { scale: 1, duration: 1 }, 0);
    for (var i = 0; i < 4; i++) {
      var at = i + .2;
      tl.to(tiles[i], { rotate: lean, duration: .5, ease: 'power2.in' }, at)
        .to(panels[i], { autoAlpha: 0, y: -40, duration: .4 }, at + .25)
        .to(panels[i + 1], { autoAlpha: 1, y: 0, duration: .45 }, at + .45)
        .to(panels[i + 1].querySelector('img'), { scale: 1, duration: .9 }, at + .45);
    }
    tl.to(last, { rotate: function () { return isRTL() ? -5 : 5; }, duration: .15, yoyo: true, repeat: 1, ease: 'power1.out' }, 4.4);
    window.addEventListener('firstmotion:language', function () { tl.invalidate(); });

    return function () {
      chain.classList.remove('is-pinned');
      gsap.set(panels.concat(tiles), { clearProps: 'all' });
    };
  });
  mm.add('(max-width: 1023px), (max-height: 639px)', function () {
    gsap.utils.toArray('.cpanel').forEach(function (panel) {
      gsap.from(panel, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 88%' } });
      var img = panel.querySelector('img');
      if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  // ── Where it breaks: crack opens, then First Motion closes it ──
  var gapMap = document.querySelector('.gap-map');
  if (gapMap) {
    gsap.from('.gap-tiles span', { y: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: gapMap, start: 'top 80%' } });
    gsap.fromTo(gapMap, { '--crack': 0 }, { '--crack': 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: gapMap, start: 'top 70%' } });
    gsap.from('.gap .owner', { opacity: 0, y: 12, duration: .6, stagger: .12, scrollTrigger: { trigger: gapMap, start: 'top 65%' } });
    gsap.fromTo(gapMap, { '--bar': 0 }, { '--bar': 1, ease: 'none', scrollTrigger: { trigger: '.gap-us', start: 'top 90%', end: 'top 55%', scrub: true } });
    gsap.from('.gap-us p', { opacity: 0, y: 14, duration: .6, scrollTrigger: { trigger: '.gap-us', start: 'top 60%' } });
  }

  // ── First move: the line draws, steps land one by one ──
  var steps = document.querySelector('.steps');
  if (steps) {
    gsap.fromTo(steps, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 85%', end: 'top 35%', scrub: true } });
    gsap.from('.step', { y: 50, opacity: 0, duration: .9, ease: 'power3.out', stagger: .14, scrollTrigger: { trigger: steps, start: 'top 75%' } });
    gsap.from('.step-num', { yPercent: 60, rotate: function () { return isRTL() ? -12 : 12; }, duration: 1, ease: 'back.out(1.6)', stagger: .14, scrollTrigger: { trigger: steps, start: 'top 75%' } });
  }

  // ── Fit cards: stagger in, tilt toward the pointer ──
  gsap.from('.fit-grid article', { y: 60, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.fit-grid', start: 'top 82%' } });
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        rx(-py * 10); ry(px * 12);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }

  // ── Founders ──
  gsap.from('.founder-card', { y: 70, opacity: 0, duration: 1, ease: 'power3.out', stagger: .15, scrollTrigger: { trigger: '.founder-pair', start: 'top 82%' } });
  gsap.utils.toArray('.founder-initial span').forEach(function (s, i) {
    gsap.fromTo(s, { yPercent: 35 }, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: s.closest('.founder-card'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ── FAQ rows ──
  gsap.from('.faq-list details', { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });

  // ── Contact: dominoes tip, glow follows the pointer ──
  var cdom = gsap.utils.toArray('.contact-dominos span');
  if (cdom.length) {
    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 60%' } })
      .from(cdom, { y: 50, opacity: 0, duration: .6, ease: 'power3.out', stagger: .08 })
      .to(cdom.slice(0, 2), { rotate: function () { return isRTL() ? -24 : 24; }, duration: .45, ease: 'power2.in', stagger: .15 }, '+=.2');
  }
  var contact = document.querySelector('.contact');
  if (contact && window.matchMedia('(hover: hover)').matches) {
    contact.addEventListener('pointermove', function (e) {
      var r = contact.getBoundingClientRect();
      contact.querySelector('.contact-glow').style.setProperty('--gx', (e.clientX - r.left - r.width / 2) * .5 + 'px');
      contact.querySelector('.contact-glow').style.setProperty('--gy', (e.clientY - r.top - r.height / 2) * .5 + 'px');
    });
  }

  // ── Magnetic buttons ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var mx = gsap.quickTo(btn, 'x', { duration: .5, ease: 'elastic.out(1, .45)' });
      var my = gsap.quickTo(btn, 'y', { duration: .5, ease: 'elastic.out(1, .45)' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .28);
        my((e.clientY - r.top - r.height / 2) * .38);
      });
      btn.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  // Fonts can shift layout: recalc pin positions once they're ready.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
