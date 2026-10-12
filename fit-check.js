(function () {
  'use strict';

  // ── Go-live config: fill these to activate. Empty = inert (no broken links). ──
  var WHATSAPP_NUMBER = '972504950377'; // international digits-only — powers the fit-check handoff AND the WhatsApp contact button
  var CONTACT_EMAIL = 'Marketing@firstmotion.co'; // main email — shows the Email contact button when set
  var FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61592606906080'; // page URL — shows the Facebook contact button when set

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
        title: 'יש לנו נקודת פתיחה',
        body: 'לפי התשובות שלכם, זה הנושא שכדאי לבדוק יחד בשיחה:',
        starts: {
          operate: 'נראה שהחסם המרכזי הוא בטיפול בלידים — נבדוק יחד את מהירות התגובה, הסינון והניתוב.',
          convert: 'נראה שהחסם המרכזי הוא בהמרה — נבדוק יחד את העמוד, ההצעה והצעד הבא.',
          learn: 'נראה שהחסם המרכזי הוא מדידה — נבדוק יחד את הטראקינג, הייחוס והחלטות הדאטה.',
          unsure: 'נתחיל במיפוי מהיר כדי לזהות את צוואר הבקבוק המרכזי.'
        }
      },
      cta: 'נמשיך בוואטסאפ', helper: 'הפרטים יופיעו בהודעה שתוכלו לבדוק ולשלוח בוואטסאפ.', comingSoon: 'בקרוב',
      nameLabel: 'שם', nameRequired: 'נא למלא שם', businessLabel: 'אתר / עסק (רשות)',
      wa: {
        greeting: 'היי FirstMotion 👋', intro: 'עשיתי את בדיקת ההתאמה, הנה מה שעניתי:',
        labels: { q1: 'סוג עסק', q2: 'שיווק פעיל', q3: 'הצעה מוכחת', q4: 'החסם המרכזי' },
        nameLine: 'השם שלי: ', businessLine: '• עסק/אתר: ', closing: 'אשמח לדבר.',
        // Pre-filled draft for the plain WhatsApp contact button — the visitor only has to press send.
        contactGreeting: 'היי, הגעתי מהאתר ואשמח לקבל פרטים.'
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
        title: 'We have a starting point',
        body: 'Based on your answers, here is a useful topic to explore together:',
        starts: {
          operate: 'Your main constraint looks like lead handling — we\'d look at response speed, qualification and routing together.',
          convert: 'Your main constraint looks like conversion — we\'d look at the page, the offer and the next step together.',
          learn: 'Your main constraint looks like measurement — we\'d look at tracking, attribution and data-driven decisions together.',
          unsure: 'We\'d start with a quick mapping to find the main bottleneck.'
        }
      },
      cta: 'Continue on WhatsApp', helper: 'Your details will appear in a message you can review and send on WhatsApp.', comingSoon: 'Coming soon',
      nameLabel: 'Name', nameRequired: 'Please enter a name', businessLabel: 'Site / business (optional)',
      wa: {
        greeting: 'Hi FirstMotion 👋', intro: 'I took the compatibility check, here\'s what I answered:',
        labels: { q1: 'Business type', q2: 'Active marketing', q3: 'Proven offer', q4: 'Main constraint' },
        nameLine: 'My name: ', businessLine: '• Business/site: ', closing: 'Happy to talk.',
        // Pre-filled draft for the plain WhatsApp contact button — the visitor only has to press send.
        contactGreeting: 'Hi, I came from the website and would like to get some details.'
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

  // Answer codes only: name and business text stay in the WhatsApp draft, never in tracking.
  function fitEventProps(a, lang, hasBusiness, eventId) {
    var props = {
      business_type: a.q1 || 'unknown', marketing: a.q2 || 'unknown',
      offer: a.q3 || 'unknown', constraint: a.q4 || 'unknown',
      lang: lang === 'en' ? 'en' : 'he', has_business: !!hasBusiness
    };
    // Vortex upserts on eventId, so a repeat click in the same run stays one event.
    if (eventId) props.eventId = eventId;
    return props;
  }

  // Tracking must never block the WhatsApp handoff.
  function track(name, props) {
    try {
      if (typeof window !== 'undefined' && typeof window.vtx === 'function') window.vtx('track', name, props);
    } catch (e) { if (window.console) console.warn('fit-check tracking failed', e); }
  }

  if (typeof document !== 'undefined') {
    var fit = { open: false, step: 0, answers: {}, name: '', business: '', lastFocus: null, runId: '' };
    var overlay, modal, bodyEl, prevOverflow = '', closeTimer;

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
      if (fit.open) return;
      clearTimeout(closeTimer);
      buildModal();
      // EVENT SEAM: fit_check_started — attach Meta pixel custom event here when pixel lands.
      fit.open = true; fit.step = 0; fit.answers = {};
      fit.runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
      window.dispatchEvent(new CustomEvent('firstmotion:modal', { detail: { open: true } }));
    }

    function closeModal() {
      if (!overlay || !fit.open) return;
      fit.open = false;
      overlay.classList.remove('open');
      document.body.style.overflow = prevOverflow;
      if (location.hash === '#fit-check') {
        history.replaceState(null, '', location.pathname + location.search);
      }
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { if (!fit.open) overlay.hidden = true; }, 220);
      window.dispatchEvent(new CustomEvent('firstmotion:modal', { detail: { open: false } }));
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
      else {
        fit.step = last + 1;
        track('fit_check_completed', fitEventProps(fit.answers, lang(), false, 'fc-' + fit.runId + '-completed'));
        renderResult();
      }
    }

    function goBack() { if (fit.step > 0) { fit.step -= 1; renderStep(); } }

    function renderResult() {
      var c = COPY[lang()];
      var block = c.result;
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
        (numberSet ? c.cta : c.comingSoon) + '</button>' +
        '<p class="fitc-helper">' + c.helper + '</p></div>';
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
      // sendBeacon in t.js survives the navigation to wa.me below.
      track('fit_check_submitted', fitEventProps(fit.answers, lang(), !!business, 'fc-' + fit.runId + '-submitted'));
      var msg = buildMessage(lang(), fit.answers, name, business);
      window.location.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    }

    function handleHash() { if (location.hash === '#fit-check') openModal(); }

    // Wire the contact buttons from the go-live config. Buttons stay visible always;
    // an unset one is inert (aria-disabled, no href) so no broken link ships.
    function wireContact() {
      var wrap = document.querySelector('.contact-methods');
      if (!wrap) return;
      function apply(sel, href) {
        var b = wrap.querySelector(sel);
        if (!b) return;
        if (href) { b.href = href; b.removeAttribute('aria-disabled'); }
        else { b.removeAttribute('href'); b.setAttribute('aria-disabled', 'true'); }
      }
      // The WhatsApp button opens a chat with a ready-to-send draft in the visitor's
      // current site language, so all they have to do is press send.
      var waGreeting = (COPY[lang()].wa || {}).contactGreeting || '';
      var waHref = WHATSAPP_NUMBER
        ? 'https://wa.me/' + WHATSAPP_NUMBER + (waGreeting ? '?text=' + encodeURIComponent(waGreeting) : '')
        : '';
      apply('.contact-email', CONTACT_EMAIL ? 'mailto:' + CONTACT_EMAIL : '');
      apply('.contact-facebook', FACEBOOK_URL);
      apply('.contact-whatsapp', waHref);
    }

    function init() { buildModal(); handleHash(); wireContact(); }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a[href="#fit-check"]') : null;
      if (t) { e.preventDefault(); openModal(); }
    });
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('firstmotion:language', function () {
      wireContact(); // re-draft the WhatsApp message in the newly selected language
      if (!fit.open) return;
      syncChrome();
      renderStep();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildMessage: buildMessage, fitEventProps: fitEventProps, COPY: COPY };
  }
})();
