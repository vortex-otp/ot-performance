(function () {
  'use strict';

  var WHATSAPP_NUMBER = ''; // set to international digits-only to go live, e.g. '972501234567'

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
          { v: 'learn', label: 'אי אפשר למדוד מה עובד' }, { v: 'unsure', label: 'לא בטוח/ה' } ] },
        { q: 'מה הכי מדויק לגביך?', a: [
          { v: 'ready', label: 'מוכן/ה למדוד בכנות ולתקן תשתיות' }, { v: 'open', label: 'פתוח/ה לזה' },
          { v: 'trafficonly', label: 'בעיקר רוצה יותר תנועה' } ] }
      ],
      verdict: {
        strong: {
          title: 'יש כאן התאמה חזקה',
          body: 'עסק פעיל, הצעה מוכחת ונכונות למדוד — זה בדיוק מה ש-First Motion מחברת.',
          starts: {
            operate: 'נראה שהחסם המרכזי הוא בטיפול בלידים — נתחיל משכבת OPERATE: מהירות תגובה, סינון וניתוב.',
            convert: 'נראה שהחסם המרכזי הוא בהמרה — נתחיל משכבת CONVERT: העמוד, ההצעה והצעד הבא.',
            learn: 'נראה שהחסם המרכזי הוא מדידה — נתחיל משכבת LEARN: טראקינג, ייחוס והחלטות מדאטה.',
            unsure: 'נתחיל במיפוי מהיר כדי לזהות את צוואר הבקבוק המרכזי.'
          }
        },
        partial: {
          title: 'יש בסיס טוב, עם דבר אחד לחדד',
          gap: {
            q3: 'הכיוון נכון. לפני שמאיצים, כדאי לבסס עוד את ההצעה בשוק.',
            q2: 'הכיוון נכון. הפעילות עדיין צעירה — נבנה אותה נכון מההתחלה.',
            q5: 'הכיוון נכון. ההצלחה תלויה בנכונות למדוד ולתקן, לא רק להריץ תנועה.',
            q1: 'סוג העסק קצת מחוץ למוקד הקלאסי שלנו, אבל יש על מה לדבר.'
          }
        },
        notyet: {
          title: 'כנראה שעדיין מוקדם — וזה בסדר',
          reason: {
            q3: 'לפני שמשקיעים במדיה, שווה שההצעה תוכיח את עצמה בשוק.',
            q2: 'לפני שכדאי לדבר, שווה שתהיה פעילות שיווקית ראשונית שאפשר למדוד.',
            q5: 'אנחנו לא עוסקים רק בהבאת תנועה. כשחשוב לך גם מה קורה עם התנועה — נדבר.'
          },
          closeLine: 'כשזה קיים, נשמח שתחזרו.', backToSystem: 'חזרה למערכת'
        }
      },
      cta: 'שלחו את התוצאה בוואטסאפ', comingSoon: 'בקרוב',
      nameLabel: 'שם', nameRequired: 'נא למלא שם', businessLabel: 'אתר / עסק (רשות)',
      wa: {
        greeting: 'היי First Motion 👋', resultPrefix: 'עשיתי את בדיקת ההתאמה — התוצאה: ',
        labels: { q1: 'סוג עסק', q2: 'שיווק פעיל', q3: 'הצעה מוכחת', q4: 'החסם המרכזי' },
        nameLine: 'השם שלי: ', businessLine: '• עסק/אתר: ', closing: 'אשמח לדבר.',
        verdictLabel: { strong: 'התאמה חזקה', partial: 'התאמה חלקית' }
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
          { v: 'learn', label: 'Can\'t measure what works' }, { v: 'unsure', label: 'Not sure' } ] },
        { q: 'Which is most true for you?', a: [
          { v: 'ready', label: 'Ready to measure honestly & fix infrastructure' }, { v: 'open', label: 'Open to it' },
          { v: 'trafficonly', label: 'Mainly just want more traffic' } ] }
      ],
      verdict: {
        strong: {
          title: 'Strong fit',
          body: 'An active business, a proven offer and the will to measure — exactly what First Motion connects.',
          starts: {
            operate: 'Your main constraint looks like lead handling — we\'d start with the OPERATE layer: response speed, qualification and routing.',
            convert: 'Your main constraint looks like conversion — we\'d start with the CONVERT layer: the page, the offer and the next step.',
            learn: 'Your main constraint looks like measurement — we\'d start with the LEARN layer: tracking, attribution and data-driven decisions.',
            unsure: 'We\'d start with a quick mapping to find the main bottleneck.'
          }
        },
        partial: {
          title: 'Solid basis, one thing to shore up first',
          gap: {
            q3: 'The direction is right. Before accelerating, it\'s worth proving the offer further in the market.',
            q2: 'The direction is right. The activity is still young — we\'d build it right from the start.',
            q5: 'The direction is right. Success depends on the will to measure and fix, not just to run traffic.',
            q1: 'Your business type is a little outside our classic focus, but there\'s a basis to talk.'
          }
        },
        notyet: {
          title: 'Probably too early — and that\'s OK',
          reason: {
            q3: 'Before investing in media, it\'s worth letting the offer prove itself in the market.',
            q2: 'Before it\'s worth talking, it helps to have some initial marketing activity to measure.',
            q5: 'We don\'t just drive traffic. When what happens to that traffic matters to you too — let\'s talk.'
          },
          closeLine: 'When that\'s in place, we\'d be glad to talk.', backToSystem: 'Back to the system'
        }
      },
      cta: 'Let\'s talk on WhatsApp', comingSoon: 'Coming soon',
      nameLabel: 'Name', nameRequired: 'Please enter a name', businessLabel: 'Site / business (optional)',
      wa: {
        greeting: 'Hi First Motion 👋', resultPrefix: 'I took the compatibility check — result: ',
        labels: { q1: 'Business type', q2: 'Active marketing', q3: 'Proven offer', q4: 'Main constraint' },
        nameLine: 'My name: ', businessLine: '• Business/site: ', closing: 'Happy to talk.',
        verdictLabel: { strong: 'Strong fit', partial: 'Partial fit' }
      }
    }
  };

  function score(a) {
    if (a.q2 === 'nothing' || a.q3 === 'notreally' || a.q5 === 'trafficonly') return 'notyet';
    if (a.q2 === 'consistent' && a.q3 === 'steadily' && a.q5 === 'ready' &&
        (a.q1 === 'lead' || a.q1 === 'ecom' || a.q1 === 'b2b')) return 'strong';
    return 'partial';
  }

  function partialGap(a) {
    if (a.q3 === 'earlysales') return 'q3';
    if (a.q2 === 'starting') return 'q2';
    if (a.q5 === 'open') return 'q5';
    if (a.q1 === 'other') return 'q1';
    return 'q3';
  }

  function notyetReason(a) {
    if (a.q3 === 'notreally') return 'q3';
    if (a.q2 === 'nothing') return 'q2';
    if (a.q5 === 'trafficonly') return 'q5';
    return 'q2';
  }

  function labelFor(c, qIndex, value) {
    var opts = c.q[qIndex].a;
    for (var i = 0; i < opts.length; i++) if (opts[i].v === value) return opts[i].label;
    return value;
  }

  function buildMessage(lang, a, name, business) {
    var c = COPY[lang === 'en' ? 'en' : 'he'];
    var w = c.wa;
    var vLabel = w.verdictLabel[score(a)] || '';
    var lines = [
      w.greeting,
      w.resultPrefix + vLabel + '.',
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
    var fit = { open: false, step: 0, answers: {}, verdict: null, name: '', business: '', lastFocus: null };
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
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function openModal() {
      buildModal();
      // EVENT SEAM: fit_check_started — attach Meta pixel custom event here when pixel lands.
      fit.open = true; fit.step = 0; fit.answers = {}; fit.verdict = null;
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

    // Placeholder — replaced by the real wizard in Task 5.
    function renderStep() {
      bodyEl.innerHTML = '<p class="fitc-q">…</p>';
    }

    function handleHash() { if (location.hash === '#fit-check') openModal(); }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a[href="#fit-check"]') : null;
      if (t) { e.preventDefault(); openModal(); }
    });
    window.addEventListener('hashchange', handleHash);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { buildModal(); handleHash(); });
    } else { buildModal(); handleHash(); }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { score: score, partialGap: partialGap, notyetReason: notyetReason, buildMessage: buildMessage, COPY: COPY };
  }
})();
