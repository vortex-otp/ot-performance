# Compatibility Check (בדיקת התאמה) — Design Spec

**Date:** 2026-07-20
**Status:** Approved for implementation
**Repo:** `vortex-otp/ot-performance` (First Motion marketing site)

---

## 1. Problem

The header CTA **בדיקת התאמה** ("Check fit") is the highest-intent action on the
site. It currently links to `#contact`, a section that says the contact channel
isn't open yet (`ממתינים לחיבור`). The strongest call-to-action dead-ends.

Separately, the site has **no conversion action of any kind** — no form, no
WhatsApp, no email (verified: zero `<form>`/`<input>` elements anywhere). This
blocks any future Meta advertising, which needs a real conversion event to
optimize toward.

This feature turns the CTA into a working, self-qualifying compatibility check
that ends in a WhatsApp handoff — closing the dead-end, creating the first
contact channel, and establishing the conversion action a Meta campaign needs.

## 2. Goals / Non-goals

**Goals**
- A 5-question modal wizard that produces an honest three-way verdict.
- Route qualified leads to WhatsApp with their answers pre-filled.
- Backend-free, dependency-free, secret-free. Pure client-side + a final `wa.me` open.
- Bilingual (HE/EN) consistent with the existing `data-en` engine.
- WCAG 2.2 AA (matches `PRODUCT.md` target).
- Leave clean, commented seams for future Meta pixel events — build none now.

**Non-goals (this version)**
- No pixel / CAPI / analytics (none exist today; `privacy.html` truthfully says so).
- No Vortex integration, no server, no database, no email service.
- No dedicated `/fit` page (placement chosen: homepage modal — see §3).
- No lead storage; the WhatsApp handoff is the only capture path.

## 3. Architecture

### Placement: self-injecting modal
One new file, `fit-check.js`, mirroring the proven pattern of
`accessibility.js` — it builds its entire UI in JS and loads on every page via a
single `<script>` tag. The fit-check modal is likewise **injected on every page**,
so the header CTA opens it in place from anywhere with no navigation.

Loaded after `accessibility.js` in all 5 pages:
- `index.html`: `<script src="fit-check.js"></script>`
- `pages/*.html`: `<script src="../fit-check.js"></script>`

### Trigger points
All become in-place modal openers (no navigation), via `href="#fit-check"`:
- **Header CTA** `בדיקת התאמה` — `index.html:38` (`#contact` → `#fit-check`) and the
  4 sub-page headers (`../index.html#contact` → `#fit-check`).
- **Contact section** (`index.html` ~228) — add a trigger button that opens the
  modal, and replace the now-false "channel opens with the domain" copy (exact
  text in §7a) since a real channel now exists.
- **Hero button** `נסו את המהלך הראשון` — **unchanged**, keeps launching the game (decided).

### Deep-link auto-open
On load or `hashchange`, if `location.hash === '#fit-check'`, the modal opens
automatically. This is the Meta-ad entry point: a campaign points to
`https://<domain>/index.html#fit-check` → homepage loads → modal opens.

### Trigger wiring
`fit-check.js` opens the modal on:
1. click of any element with `href="#fit-check"` (preventDefault),
2. `hashchange`/load when `location.hash === '#fit-check'`.

### Bilingual
Static chrome (buttons, labels authored in HTML the modal builds) uses `data-en`
so `lang.js` handles it. Dynamic strings (questions, answer labels, verdicts,
WhatsApp message) live in a `copy = { he: {...}, en: {...} }` object keyed by
`document.documentElement.lang` — the exact pattern of `gameCopy` in
`script.js:69`. The modal subscribes to the `firstmotion:language` event and
re-renders the current step + any shown verdict on language change.

### State machine
Mirrors the game's `game = { state, round, ... }` object (`script.js:87`):
```
fit = { open, step, answers: {q1..q5}, verdict, name, business }
```
`step` ∈ 0..4 (questions) then a result state. `answers` persists across
back/next so navigation never loses input.

## 4. The five questions

Full copy. Each answer carries a weight or a personalization tag.

### Q1 — Business type  *(from the three fitting types in `#fit`)*
- HE: `מה סוג העסק שלך?` · EN: `What type of business do you run?`

| Answer (HE / EN) | Effect |
|---|---|
| `לידים` / Lead generation | in-scope |
| `איקומרס` / Ecommerce | in-scope |
| `B2B` / B2B | in-scope |
| `אחר` / Something else | soft — caps result at Partial (not a gate) |

### Q2 — Active marketing  *(`פעילות שיווקית קיימת`)* — **gate**
- HE: `האם יש כרגע פעילות שיווקית פעילה?` · EN: `Do you have active marketing running right now?`

| Answer | Weight |
|---|---|
| `כן, באופן קבוע` / Yes, running consistently | 2 |
| `רק מתחילים` / Just starting | 1 |
| `עדיין כלום` / Nothing active yet | **GATE → Not yet** |

### Q3 — Proven offer  *(`הצעה מוכחת`)* — **gate**
- HE: `האם ההצעה שלך כבר מוכחת בשוק?` · EN: `Is your offer already proven in the market?`

| Answer | Weight |
|---|---|
| `כן, מוכרים באופן קבוע` / Yes, selling steadily | 2 |
| `יש מכירות ראשונות` / Some early sales | 1 |
| `עדיין לא באמת` / Not really yet | **GATE → Not yet** |

### Q4 — Biggest constraint  *(maps to the 4 system layers — personalization, NOT scored)*
- HE: `מה הכי מפריע לך היום?` · EN: `Where does it hurt most today?`

| Answer | Layer tag |
|---|---|
| `איכות ומהירות הלידים` / Lead quality & speed | OPERATE |
| `הפיכת תנועה לפעולה` / Turning traffic into action | CONVERT |
| `אי אפשר למדוד מה עובד` / Can't measure what works | LEARN |
| `לא בטוח/ה` / Not sure | generic |

### Q5 — The key condition  *(`התנאי החשוב` — verbatim from the site)* — **gate**
- HE: `מה הכי מדויק לגביך?` · EN: `Which is most true for you?`

| Answer | Weight |
|---|---|
| `מוכן/ה למדוד בכנות ולתקן תשתיות` / Ready to measure honestly & fix infrastructure | 2 |
| `פתוח/ה לזה` / Open to it | 1 |
| `בעיקר רוצה יותר תנועה` / Mainly just want more traffic | **GATE → Not yet** |

## 5. Scoring & verdict logic

Pure function `score(answers) → 'strong' | 'partial' | 'notyet'`:

```
GATES (any true → 'notyet'):
  q2 === 'nothing'  OR  q3 === 'notreally'  OR  q5 === 'trafficonly'

If no gate:
  'strong'  IF  q2 === 'consistent' AND q3 === 'steadily'
                AND q5 === 'ready'  AND q1 ∈ {lead, ecom, b2b}
  else      'partial'
```

Notes:
- Gates take absolute priority — a single disqualifier yields `notyet` regardless
  of other answers.
- `q1 === 'other'` cannot reach `strong` (business type outside the core three);
  it degrades an otherwise-strong result to `partial`.
- Q4 never affects the verdict; it only personalizes copy.

## 6. Result screens

### ① Strong fit
- Title — HE: `יש כאן התאמה חזקה` · EN: `Strong fit`
- Body — HE: `עסק פעיל, הצעה מוכחת ונכונות למדוד — זה בדיוק מה ש-First Motion מחברת.`
  EN: `An active business, a proven offer and the will to measure — exactly what First Motion connects.`
- **Personalized "מאיפה נתחיל" line** from Q4 layer tag:
  - OPERATE — `נראה שהחסם המרכזי הוא בטיפול בלידים — נתחיל משכבת OPERATE: מהירות תגובה, סינון וניתוב.`
  - CONVERT — `נראה שהחסם המרכזי הוא בהמרה — נתחיל משכבת CONVERT: העמוד, ההצעה והצעד הבא.`
  - LEARN — `נראה שהחסם המרכזי הוא מדידה — נתחיל משכבת LEARN: טראקינג, ייחוס והחלטות מדאטה.`
  - generic — `נתחיל במיפוי מהיר כדי לזהות את צוואר הבקבוק המרכזי.`
  - (EN mirrors each.)
- Capture: `name` (required) + `business/site` (optional).
- CTA — HE: `שלחו את התוצאה בוואטסאפ` · EN: `Let's talk on WhatsApp`.

### ② Partial fit
- Title — HE: `יש בסיס טוב, עם דבר אחד לחדד` · EN: `Solid basis, one thing to shore up first`.
- Body — dynamic, names the single gap (priority order q3 > q2 > q5 > q1):
  - q3 === 'earlysales' — `הכיוון נכון. לפני שמאיצים, כדאי לבסס עוד את ההצעה בשוק.`
  - q2 === 'starting' — `הכיוון נכון. הפעילות עדיין צעירה — נבנה אותה נכון מההתחלה.`
  - q5 === 'open' — `הכיוון נכון. ההצלחה תלויה בנכונות למדוד ולתקן, לא רק להריץ תנועה.`
  - q1 === 'other' — `סוג העסק קצת מחוץ למוקד הקלאסי שלנו, אבל יש על מה לדבר.`
  - (EN mirrors each.)
- Capture + CTA: same as Strong.

### ③ Not yet — gives nothing (decided)
- Title — HE: `כנראה שעדיין מוקדם — וזה בסדר` · EN: `Probably too early — and that's OK`.
- Body — dynamic reason (priority q3 > q2 > q5):
  - q3 === 'notreally' — `לפני שמשקיעים במדיה, שווה שההצעה תוכיח את עצמה בשוק.`
  - q2 === 'nothing' — `לפני שכדאי לדבר, שווה שתהיה פעילות שיווקית ראשונית שאפשר למדוד.`
  - q5 === 'trafficonly' — `אנחנו לא עוסקים רק בהבאת תנועה. כשחשוב לך גם מה קורה עם התנועה — נדבר.`
  - (EN mirrors each.)
- Close line — HE: `כשזה קיים, נשמח שתחזרו.` · EN: `When that's in place, we'd be glad to talk.`
- **No capture form, no WhatsApp button.** Single soft action:
  `[ חזרה למערכת ]` / `[ Back to the system ]` — closes modal, scrolls to `#system`.

## 7. Lead capture & WhatsApp handoff

Fields on Strong/Partial result: **`name` required**, `business/site` optional.
No phone, no email (redundant one tap before WhatsApp; every field costs completions).

### WhatsApp message (HE)
```
היי First Motion 👋
עשיתי את בדיקת ההתאמה — התוצאה: {verdictLabel}.
• סוג עסק: {q1 label}
• שיווק פעיל: {q2 label}
• הצעה מוכחת: {q3 label}
• החסם המרכזי: {q4 label}
השם שלי: {name}{businessLine}
אשמח לדבר.
```
- `verdictLabel`: `התאמה חזקה` (strong) / `התאמה חלקית` (partial).
- `businessLine`: `\n• עסק/אתר: {business}` when provided, else empty.
- EN template mirrors, chosen by current `lang`.

### Open behavior
```
const msg = buildMessage(lang, answers, name, business);
window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
```
`wa.me` requires international format, digits only, no `+`/`00`
(e.g. `972501234567`).

## 7a. Contact-section rewrite (exact copy)

The contact section (`index.html` ~228) currently claims the channel opens with
the domain — false once the check ships. Concrete changes:

- **Main paragraph** replaces the current one:
  - HE: `רוצים לדעת אם זה מתאים? עשו בדיקת התאמה קצרה — אם יש בסיס, נמשיך בוואטסאפ.`
  - EN: `Want to know if it's a fit? Take the short compatibility check — if there's a basis, we continue on WhatsApp.`
- **Add a CTA button** inside `.contact-main`, after the paragraph:
  - HE: `לבדיקת התאמה` · EN: `Start the check` · `href="#fit-check"` (opens modal).
- **`.contact-status` block** stays — `דומיין, מייל עסקי וערוץ קשר ישיר` is still
  genuinely pending, so it remains truthful. Only the `ממתינים לחיבור` strong
  label softens to HE `ערוץ ישיר בקרוב` / EN `Direct channel soon`, so it no longer
  contradicts the now-live check.

## 8. Accessibility (WCAG 2.2 AA)
- Modal: `role="dialog"`, `aria-modal="true"`, labelled by its heading id.
- Focus trap: Tab cycles within the modal; open moves focus to first control;
  close returns focus to the trigger element that opened it.
- ESC closes; backdrop click closes (pattern from `accessibility.js:86-89`).
- Body scroll-lock while open.
- Each question is a `role="radiogroup"`; answers are real keyboard-navigable
  radio controls (arrow keys, Space), never clickable `<div>`s.
- Inherits the existing a11y widget (reduced-motion, high-contrast, font scale)
  automatically — same design tokens, no extra work.

## 9. Edge cases / robustness
- **Next disabled** until the current step has a selection.
- **Back preserves answers** — state object holds all five.
- **Language switch mid-wizard** re-renders current step and any shown verdict.
- **Deep-link `#fit-check`** opens cleanly and applies scroll-lock even if the
  page was mid-scroll.
- **Inert WhatsApp button** while `WHATSAPP_NUMBER` is empty: button shows a
  `בקרוב` / `Coming soon` state and does not emit a broken `wa.me/` link.
- Restarting: closing and reopening resets to step 0 with a clean state.

## 10. Meta event seams (marked, not built)
No pixel exists; build zero tracking. Leave three clearly-commented hook points
in `fit-check.js` where events attach when the pixel lands later:
- `fit_check_started` — on modal open.
- `fit_check_completed` — on verdict render (include verdict as a property).
- `Lead` / `Contact` — on WhatsApp button click.
Empty comment seams, not dead code (YAGNI). Wiring later is a drop-in, not a refactor.

## 11. Config — the single go-live step
`const WHATSAPP_NUMBER = '';` at the top of `fit-check.js`. Empty = inert button
(§9). Setting it to the real international-format number is the one change that
flips the feature live. The number is **not** a secret (it ships in client JS by
design), but note it puts a personal WhatsApp on a public, ad-targeted page.

## 12. Testing
- **Scoring** — `score(answers)` is a pure function. Table-driven test over every
  gate (both sides of each threshold) and the strong/partial boundary, including
  the `q1==='other'` degrade rule.
- **WhatsApp assembly** — `buildMessage()` unit test: correct fields, correct
  `businessLine` presence/absence, correct URL-encoding, HE vs EN selection.
- **DOM/behavior** — verified in Chrome after build: focus trap, ESC, backdrop
  close, scroll-lock, deep-link auto-open, disabled-Next, back-preserves-answers,
  language switch mid-wizard, inert button when number empty.

## 13. Files changed
**New**
- `fit-check.js` — modal builder, wizard state machine, `score()`, `buildMessage()`,
  trigger + deep-link wiring, language subscription, event seams.
- CSS block appended to `styles.css` — modal/overlay/steps/progress, existing tokens only.

**Edited**
- `index.html` — header CTA `href="#contact"` → `#fit-check` (line ~38); add
  `fit-check.js` include after `accessibility.js`; add modal trigger to contact
  section and soften `ממתינים לחיבור` copy.
- `pages/about.html`, `pages/privacy.html`, `pages/terms.html`,
  `pages/accessibility.html` — header CTA `../index.html#contact` → `#fit-check`;
  add `../fit-check.js` include after `accessibility.js`.

**Unchanged**
- `privacy.html` tracking language — still accurate (no pixel added).
- Hero button, the game, `lang.js`, `accessibility.js`.

## 14. Out of scope / future
- Meta pixel + CAPI wiring (separate task once a pixel + domain exist).
- Vortex intake for leads (a later architecture upgrade from WhatsApp-only).
- Email fallback path.
- Dedicated `/fit` landing page.
