(function () {
  'use strict';

  // ── Go-live config: fill these to activate. Empty = inert (no broken links). ──
  var WHATSAPP_NUMBER = ''; // international digits-only, e.g. '972501234567' — powers the fit-check handoff AND the WhatsApp contact button
  var CONTACT_EMAIL = '';   // main email, e.g. 'hello@firstmotion.co.il' — shows the Email contact button when set
  var CONTACT_PHONE = '';   // international phone, e.g. '+972501234567' — shows the Phone contact button when set

  var COPY = {
    he: {
      dialogTitle: 'בדיקת התאמה', close: 'סגירה', next: 'הבא', back: 'חזרה',
      progress: 'שלב', of: 'מתוך',
      q: [
        { q: 'מה סוג העסק שלך?', a: [
          { v: 'lead', label: 'לידים' }, { v: 'ecom', label: 'איקומרס' },
          { v: 'b2b', label: 'B2B' }, { v: 'other', label: 'אחר' } ] },
        { q: 'האם יש כרגע פעילות שיווקית פעילה?', a: [
          { v: 'consistent', label: 'כן, באופן קבוע' }, { v: 'starting', label: 'רק מתחילים' },
          { v: 'nothing', label: 'עדיין כלום' } ] },
        { q: 'האם ההצעה שלך כבר מוכחת בשוק?', a: [
          { v: 'steadily', label: 'כן, מוכרים באופן קבוע' }, { v: 'earlysales', label: 'יש מכירות ראשונות' },
          { v: 'notreally', label: 'עדיין לא באמת' } ] },
        { q: 'מה הכי מפריע לך היום?', a: [
          { v: 'operate', label: 'איכות ומהירות הלידים' }, { v: 'convert', label: 'הפיכת תנועה לפעולה' },
          { v: 'learn', label: 'אי אפשר למדוד מה עובד' }, { v: 'unsure', label: 'לא בטוח/ה' } ] }
      ],
      result: {
        title: 'יש כאן התאמה',
        body: 'נשמע שיש בסיס טוב להתחיל ממנו. הנה מאיפה היינו מתחילים איתכם:',
        starts: {
          operate: 'נראה שהחסם המרכזי הוא בטיפול בלידים — נתחיל משכבת OPERATE: מהירות תגובה, סינון וניתוב.',
          convert: 'נראה שהחסם המרכזי הוא בהמרה — נתחיל משכבת CONVERT: העמוד, ההצעה והצעד הבא.',
          learn: 'נראה שהחסם המרכזי הוא מדידה — נתחיל משכבת LEARN: טראקינג, ייחוס והחלטות מדאטה.',
          unsure: 'נתחיל במיפוי מהיר כדי לזהות את צוואר הבקבוק המרכזי.'
        }
      },
      cta: 'שלחו את הפרטים בוואטסאפ', comingSoon: 'בקרוב',
      nameLabel: 'שם', nameRequired: 'נא למלא שם', businessLabel: 'אתר / עסק (רשות)',
      wa: {
        greeting: 'היי First Motion 👋', intro: 'עשיתי את בדיקת ההתאמה, הנה מה שעניתי:',
        labels: { q1: 'סוג עסק', q2: 'שיווק פעיל', q3: 'הצעה מוכחת', q4: 'החסם המרכזי' },
        nameLine: 'השם שלי: ', businessLine: '• עסק/אתר: ', closing: 'אשמח לדבר.'
      }
    },
    en: {
      dialogTitle: 'Compatibility check', close: 'Close', next: 'Next', back: 'Back',
      progress: 'Step', of: 'of',
      q: [
        { q: 'What type of business do you run?', a: [
          { v: 'lead', label: 'Lead generation' }, { v: 'ecom', label: 'Ecommerce' },
          { v: 'b2b', label: 'B2B' }, { v: 'other', label: 'Something else' } ] },
        { q: 'Do you have active marketing running right now?', a: [
          { v: 'consistent', label: 'Yes, running consistently' }, { v: 'starting', label: 'Just starting' },
          { v: 'nothing', label: 'Nothing active yet' } ] },
        { q: 'Is your offer already proven in the market?', a: [
          { v: 'steadily', label: 'Yes, selling steadily' }, { v: 'earlysales', label: 'Some early sales' },
          { v: 'notreally', label: 'Not really yet' } ] },
        { q: 'Where does it hurt most today?', a: [
          { v: 'operate', label: 'Lead quality & speed' }, { v: 'convert', label: 'Turning traffic into action' },
          { v: 'learn', label: 'Can\'t measure what works' }, { v: 'unsure', label: 'Not sure' } ] }
      ],
      result: {
        title: 'Looks like a fit',
        body: 'Sounds like a solid basis to build on. Here\'s where we\'d start with you:',
        starts: {
          operate: 'Your main constraint looks like lead handling — we\'d start with the OPERATE layer: response speed, qualification and routing.',
          convert: 'Your main constraint looks like conversion — we\'d start with the CONVERT layer: the page, the offer and the next step.',
          learn: 'Your main constraint looks like measurement — we\'d start with the LEARN layer: tracking, attribution and data-driven decisions.',
          unsure: 'We\'d start with a quick mapping to find the main bottleneck.'
        }
      },
      cta: 'Send the details on WhatsApp', comingSoon: 'Coming soon',
      nameLabel: 'Name', nameRequired: 'Please enter a name', businessLabel: 'Site / business (optional)',
      wa: {
        greeting: 'Hi First Motion 👋', intro: 'I took the compatibility check, here\'s what I answered:',
        labels: { q1: 'Business type', q2: 'Active marketing', q3: 'Proven offer', q4: 'Main constraint' },
        nameLine: 'My name: ', businessLine: '• Business/site: ', closing: 'Happy to talk.'
      }
    }
  };

  function labelFor(c, qIndex, value) {
    var opts = c.q[qIndex].a;
    for (var i = 0; i < opts.length; i++) if (opts[i].v === value) return opts[i].label;
    return value;
  }

  function buildMessage(lang, a, name, business) {
    var c = COPY[lang === 'en' ? 'en' : 'he'];
    var w = c.wa;
    var lines = [
      w.greeting,
      w.intro,
      '• ' + w.labels.q1 + ': ' + labelFor(c, 0, a.q1),
      '• ' + w.labels.q2 + ': ' + labelFor(c, 1, a.q2),
      '• ' + w.labels.q3 + ': ' + labelFor(c, 2, a.q3),
      '• ' + w.labels.q4 + ': ' + labelFor(c, 3, a.q4),
      w.nameLine + name + (business ? '\n' + w.businessLine + business : ''),
      w.closing
    ];
    return lines.join('\n');
  }

  if (typeof document !== 'undefined') {
    var fit = { open: false, step: 0, answers: {}, name: '', business: '', lastFocus: null };
    var overlay, modal, bodyEl, prevOverflow = '';

    function lang() { return document.documentElement.lang === 'en' ? 'en' : 'he'; }

    function buildModal() {
      if (overlay) return;
      overlay = document.createElement('div');
      overlay.className = 'fitc-overlay';
      overlay.hidden = true;
      modal = document.createElement('div');
      modal.className = 'fitc-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'fitc-title');
      modal.innerHTML =
        '<div class="fitc-head"><h2 id="fitc-title"></h2>' +
        '<button type="button" class="fitc-close" aria-label=""></button></div>' +
        '<div class="fitc-body"></div>';
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      bodyEl = modal.querySelector('.fitc-body');

      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      modal.querySelector('.fitc-close').addEventListener('click', closeModal);
      document.addEventListener('keydown', function (e) {
        if (!fit.open) return;
        if (e.key === 'Escape') { closeModal(); return; }
        if (e.key === 'Tab') trapFocus(e);
      });
    }

    function syncChrome() {
      var c = COPY[lang()];
      modal.querySelector('#fitc-title').textContent = c.dialogTitle;
      modal.querySelector('.fitc-close').setAttribute('aria-label', c.close);
    }

    function trapFocus(e) {
      var f = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      f = Array.prototype.filter.call(f, function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (Array.prototype.indexOf.call(f, document.activeElement) === -1) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function openModal() {
      buildModal();
      // EVENT SEAM: fit_check_started — attach Meta pixel custom event here when pixel lands.
      fit.open = true; fit.step = 0; fit.answers = {};
      fit.name = ''; fit.business = '';
      fit.lastFocus = document.activeElement;
      syncChrome();
      renderStep();
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      overlay.hidden = false;
      void overlay.offsetWidth; // commit the display change so the element is focusable now
      var focusables = modal.querySelectorAll('button:not(.fitc-close), [href], input');
      (focusables[0] || modal.querySelector('.fitc-close')).focus({ preventScroll: true });
      requestAnimationFrame(function () { overlay.classList.add('open'); });
    }

    function closeModal() {
      if (!overlay) return;
      fit.open = false;
      overlay.classList.remove('open');
      document.body.style.overflow = prevOverflow;
      if (location.hash === '#fit-check') {
        history.replaceState(null, '', location.pathname + location.search);
      }
      setTimeout(function () { overlay.hidden = true; }, 220);
      if (fit.lastFocus && fit.lastFocus.focus) fit.lastFocus.focus();
    }

    function renderStep() {
      if (fit.step >= COPY[lang()].q.length) { renderResult(); return; }
      renderQuestion(fit.step);
    }

    function renderQuestion(i) {
      var c = COPY[lang()];
      var qData = c.q[i];
      var chosen = fit.answers['q' + (i + 1)];
      var html = '<p class="fitc-progress">' + c.progress + ' ' + (i + 1) + ' ' + c.of + ' ' + c.q.length + '</p>' +
        '<p class="fitc-q" id="fitc-qtext" tabindex="-1">' + qData.q + '</p>' +
        '<div class="fitc-opts" role="radiogroup" aria-labelledby="fitc-qtext">';
      qData.a.forEach(function (opt) {
        var sel = opt.v === chosen;
        html += '<label class="fitc-opt' + (sel ? ' sel' : '') + '">' +
          '<input type="radio" name="fitc-q' + (i + 1) + '" value="' + opt.v + '"' +
          (sel ? ' checked' : '') + '>' +
          '<span>' + opt.label + '</span></label>';
      });
      html += '</div><div class="fitc-nav">' +
        (i > 0 ? '<button type="button" class="button fitc-back">' + c.back + '</button>' : '<span></span>') +
        '<button type="button" class="button button-primary fitc-next"' +
        (chosen ? '' : ' disabled') + '>' + c.next + '</button></div>';
      bodyEl.innerHTML = html;

      Array.prototype.forEach.call(bodyEl.querySelectorAll('input[type="radio"]'), function (r) {
        r.addEventListener('change', function () { selectAnswer(i, r.value); });
      });
      var backBtn = bodyEl.querySelector('.fitc-back');
      if (backBtn) backBtn.addEventListener('click', goBack);
      bodyEl.querySelector('.fitc-next').addEventListener('click', goNext);

      var fh = bodyEl.querySelector('#fitc-qtext');
      if (fh) fh.focus({ preventScroll: true });
    }

    function selectAnswer(i, value) {
      fit.answers['q' + (i + 1)] = value;
      Array.prototype.forEach.call(bodyEl.querySelectorAll('.fitc-opt'), function (l) {
        var input = l.querySelector('input');
        l.classList.toggle('sel', input.value === value);
      });
      bodyEl.querySelector('.fitc-next').disabled = false;
    }

    function goNext() {
      if (!fit.answers['q' + (fit.step + 1)]) return;
      var last = COPY[lang()].q.length - 1;
      if (fit.step < last) { fit.step += 1; renderStep(); }
      else { fit.step = last + 1; renderResult(); }
    }

    function goBack() { if (fit.step > 0) { fit.step -= 1; renderStep(); } }

    function renderResult() {
      var c = COPY[lang()];
      var block = c.result;
      // EVENT SEAM: fit_check_completed — attach Meta custom event here when pixel lands.
      var start = block.starts[fit.answers.q4] || block.starts.unsure;
      var numberSet = WHATSAPP_NUMBER !== '';
      var html = '<div class="fitc-result"><h3 tabindex="-1">' + block.title + '</h3>' +
        '<p>' + block.body + '</p>' +
        '<p class="fitc-start">' + start + '</p>' +
        '<label class="fitc-field"><span>' + c.nameLabel + '</span>' +
        '<input type="text" class="fitc-name" autocomplete="name"></label>' +
        '<label class="fitc-field"><span>' + c.businessLabel + '</span>' +
        '<input type="text" class="fitc-biz" autocomplete="organization"></label>' +
        '<p class="fitc-err" role="alert"></p>' +
        '<button type="button" class="button button-primary fitc-cta"' +
        (numberSet ? '' : ' disabled') + '>' +
        (numberSet ? c.cta : c.comingSoon) + '</button></div>';
      bodyEl.innerHTML = html;
      if (numberSet) bodyEl.querySelector('.fitc-cta').addEventListener('click', submitWhatsApp);

      var rh = bodyEl.querySelector('h3');
      if (rh) rh.focus({ preventScroll: true });
    }

    function submitWhatsApp() {
      var c = COPY[lang()];
      var name = (bodyEl.querySelector('.fitc-name').value || '').trim();
      var business = (bodyEl.querySelector('.fitc-biz').value || '').trim();
      var err = bodyEl.querySelector('.fitc-err');
      if (!name) { err.textContent = c.nameRequired; bodyEl.querySelector('.fitc-name').focus(); return; }
      err.textContent = '';
      fit.name = name; fit.business = business;
      // EVENT SEAM: Lead / Contact — attach Meta pixel + CAPI here when pixel lands.
      var msg = buildMessage(lang(), fit.answers, name, business);
      window.location.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    function handleHash() { if (location.hash === '#fit-check') openModal(); }

    // Wire the contact buttons from the go-live config. Buttons stay visible always;
    // an unset one is inert (aria-disabled, no href) so no broken link ships.
    function wireContact() {
      var wrap = document.querySelector('.contact-methods');
      if (!wrap) return;
      var live = 0;
      function apply(sel, href) {
        var b = wrap.querySelector(sel);
        if (!b) return;
        if (href) { b.href = href; b.removeAttribute('aria-disabled'); live++; }
        else { b.removeAttribute('href'); b.setAttribute('aria-disabled', 'true'); }
      }
      apply('.contact-email', CONTACT_EMAIL ? 'mailto:' + CONTACT_EMAIL : '');
      apply('.contact-phone', CONTACT_PHONE ? 'tel:' + CONTACT_PHONE : '');
      apply('.contact-whatsapp', WHATSAPP_NUMBER ? 'https://wa.me/' + WHATSAPP_NUMBER : '');
      var status = document.querySelector('.contact-status');
      if (status && live > 0) status.hidden = true;
    }

    function init() { buildModal(); handleHash(); wireContact(); }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a[href="#fit-check"]') : null;
      if (t) { e.preventDefault(); openModal(); }
    });
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('firstmotion:language', function () {
      if (!fit.open) return;
      syncChrome();
      renderStep();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildMessage: buildMessage, COPY: COPY };
  }
})();
