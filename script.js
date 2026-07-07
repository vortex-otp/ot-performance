// O.T Performance — interactions

// WhatsApp number (placeholder until the real number arrives)
var WA_NUMBER = '972500000000';

// 1. Scroll reveal (sections)
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

// 2. Staggered children (progressive enhancement — class added here so
//    content stays visible if JS never runs)
var staggerIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      staggerIO.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.hero-cards, .matrix, .quad, .tri, .flow, .results, .timeline, .faq, .toc-list')
  .forEach(function (box) {
    Array.prototype.forEach.call(box.children, function (child, i) {
      child.style.setProperty('--d', Math.min(i * 55, 500) + 'ms');
    });
    box.classList.add('stagger');
    staggerIO.observe(box);
  });

// 3. Sticky document bar: show after masthead scrolls out, track progress
var topbar = document.getElementById('topbar');
var topbarSec = document.getElementById('topbar-sec');
var masthead = document.querySelector('.masthead');

if (topbar && masthead) {
  new IntersectionObserver(function (entries) {
    topbar.classList.toggle('show', !entries[0].isIntersecting && window.scrollY > 200);
  }, { rootMargin: '-60px 0px 0px 0px' }).observe(masthead);

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      topbar.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      ticking = false;
    });
  }, { passive: true });
}

// 4. Scrollspy — current section indicator in the sticky bar
var currentSection = null;

function sectionLabel(sec) {
  if (!sec) return 'Capability Profile';
  var num = sec.querySelector('.section-num');
  var title = sec.querySelector('.he-title');
  if (!num || !title) return 'Capability Profile';
  return num.textContent.trim() + ' · ' + title.textContent.trim();
}

function updateIndicator() {
  if (topbarSec) topbarSec.textContent = sectionLabel(currentSection);
}

var spyIO = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      currentSection = e.target;
      updateIndicator();
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

document.querySelectorAll('.section[id]').forEach(function (sec) { spyIO.observe(sec); });

// language switch changes titles — refresh the indicator after it runs
document.querySelectorAll('.lang-opt').forEach(function (b) {
  b.addEventListener('click', function () { setTimeout(updateIndicator, 0); });
});

// 5. FAQ — one item open at a time
var faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(function (item) {
  item.addEventListener('toggle', function () {
    if (!item.open) return;
    faqItems.forEach(function (other) {
      if (other !== item) other.open = false;
    });
  });
});

// 6. Contact form -> validation, success state + WhatsApp bridge
var form = document.getElementById('lead-form');
var success = document.getElementById('form-success');
var successWa = document.getElementById('success-wa');

if (form) {
  var phoneField = document.getElementById('field-phone');
  var phoneInput = document.getElementById('f-phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      if (phoneField) phoneField.classList.remove('has-err');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var digits = (phoneInput ? phoneInput.value : '').replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) {
      if (phoneField) phoneField.classList.add('has-err');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // prefill a WhatsApp message with the lead's own details
    if (successWa) {
      var en = document.documentElement.getAttribute('lang') === 'en';
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var lines = en
        ? ['Hi, I left my details on the O.T Performance site:',
           'Name: ' + (v('f-name') || '-'),
           'Phone: ' + (v('f-phone') || '-')]
        : ['היי, השארתי פרטים באתר O.T Performance:',
           'שם: ' + (v('f-name') || '-'),
           'טלפון: ' + (v('f-phone') || '-')];
      if (v('f-biz')) lines.push((en ? 'Business: ' : 'עסק: ') + v('f-biz'));
      if (v('f-msg')) lines.push((en ? 'What to improve: ' : 'מה לשפר: ') + v('f-msg'));
      successWa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    form.style.display = 'none';
    success.classList.add('show');
  });
}

// 7. Year stamps
document.querySelectorAll('.yr').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});
