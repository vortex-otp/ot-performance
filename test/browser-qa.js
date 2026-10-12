#!/usr/bin/env node
'use strict';

/**
 * Deterministic, offline-first browser regression checks.
 * Usage: node test/browser-qa.js [--root /path/to/site] [--out /tmp/qa-report] [--label baseline]
 * PLAYWRIGHT_MODULE and CHROMIUM_PATH can override the available browser runtime.
 * All non-local requests, including analytics and WhatsApp, are blocked before transmission.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, key, i, all) => {
  if (key.startsWith('--')) pairs.push([key.slice(2), all[i + 1]]);
  return pairs;
}, []));
const root = path.resolve(args.root || path.join(__dirname, '..'));
const out = path.resolve(args.out || '/tmp/firstmotion-browser-qa');
const label = args.label || 'current';
fs.mkdirSync(out, { recursive: true });

let playwright;
for (const candidate of [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'].filter(Boolean)) {
  try { playwright = require(candidate); break; } catch (_) {}
}
if (!playwright) throw new Error('Playwright is required. Set PLAYWRIGHT_MODULE to its installed module directory.');
const { COPY, buildMessage } = require(path.join(root, 'fit-check.js'));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json' };
const checks = [];
const report = { label, root, startedAt: new Date().toISOString(), checks, blockedRequests: [], localErrors: [] };
let browser;
let origin;

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch (_) { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  });
});

async function session(options = {}) {
  const context = await browser.newContext({
    viewport: { width: options.width || 1440, height: options.height || 960 },
    reducedMotion: options.motion || 'reduce',
    serviceWorkers: 'block',
  });
  const blocked = [];
  const pageErrors = [];
  const localErrors = [];
  await context.route('**/*', async route => {
    const url = route.request().url();
    if (new URL(url).origin === origin) return route.continue();
    blocked.push({ url, type: route.request().resourceType(), navigation: route.request().isNavigationRequest() });
    report.blockedRequests.push({ check: options.name, url, type: route.request().resourceType() });
    return route.abort('blockedbyclient');
  });
  await context.addInitScript(({ lang }) => {
    try { if (!localStorage.getItem('ot-lang')) localStorage.setItem('ot-lang', lang); sessionStorage.setItem('fm-intro', '1'); } catch (_) {}
    window.__qaPopups = [];
    window.open = function (url) { window.__qaPopups.push(String(url)); return null; };
  }, { lang: options.lang || 'he' });
  const page = await context.newPage();
  page.setDefaultTimeout(4500);
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(origin) && response.status() >= 400) localErrors.push({ url: response.url(), status: response.status() });
  });
  async function go(url = '/') {
    await page.goto(origin + url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(120);
  }
  await go(options.path || '/');
  return { context, page, blocked, pageErrors, localErrors, go };
}

async function check(name, options, callback) {
  if (args.match && !name.toLowerCase().includes(args.match.toLowerCase())) return;
  const start = Date.now();
  let s;
  const record = { name, status: 'passed' };
  try {
    s = await session({ ...options, name });
    await callback(s, record);
    assert.deepEqual(s.pageErrors, [], 'Uncaught browser errors');
    assert.deepEqual(s.localErrors, [], 'Local resources returned an error');
  } catch (error) {
    record.status = 'failed';
    record.error = error.message;
    record.stack = error.stack;
    if (s) {
      const screenshot = path.join(out, name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png');
      try { await s.page.screenshot({ path: screenshot, fullPage: false }); record.screenshot = screenshot; } catch (_) {}
    }
  } finally {
    record.durationMs = Date.now() - start;
    checks.push(record);
    if (s) { report.localErrors.push(...s.localErrors); await s.context.close(); }
    console.log(`${record.status === 'passed' ? 'PASS' : 'FAIL'} ${name}${record.error ? '\n  ' + record.error.split('\n').join('\n  ') : ''}`);
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  }
}

async function poll(assertion, description) {
  let last;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { const value = await assertion(); if (value) return; } catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(description + (last ? ': ' + last.message : ''));
}

async function verifyOverflow(page) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      viewport: width,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      candidates: Array.from(document.querySelectorAll('body *')).filter(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && s.visibility !== 'hidden' && s.display !== 'none' && (r.left < -2 || r.right > width + 2);
      }).slice(0, 12).map(el => ({ tag: el.tagName, class: el.className, id: el.id })),
    };
  });
  assert.ok(overflow.document <= overflow.viewport + 1 && overflow.body <= overflow.viewport + 1,
    'Horizontal document overflow: ' + JSON.stringify(overflow));
}

async function openFit(page) {
  const trigger = page.locator('main a[href="#fit-check"]:visible').first();
  assert.ok(await trigger.count(), 'Main fit-check trigger exists');
  await trigger.click();
  await page.locator('.fitc-overlay.open').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.fitc-modal').getAttribute('aria-modal'), 'true');
  assert.equal(await page.locator('.fitc-next').isDisabled(), true, 'First question requires an answer');
  return trigger;
}

async function answer(page, step, value) {
  const radio = page.locator(`.fitc-opts input[name="fitc-q${step}"][value="${value}"]`);
  await radio.check();
  assert.equal(await radio.isChecked(), true);
  await page.locator('.fitc-next').click();
}

async function closeAndCheck(page, trigger, method) {
  if (method === 'escape') await page.keyboard.press('Escape');
  else if (method === 'overlay') await page.locator('.fitc-overlay').click({ position: { x: 2, y: 2 } });
  else await page.locator('.fitc-close').click();
  await page.locator('.fitc-overlay').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'Body scrolling is restored');
  if (trigger) assert.equal(await trigger.evaluate(el => el === document.activeElement), true, 'Focus returns to the opening trigger');
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await playwright.chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  for (const width of [375, 390, 768, 1440]) {
    for (const lang of ['he', 'en']) {
      await check(`Layout ${width}px ${lang}`, { width, lang }, async ({ page }) => {
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        assert.equal(await page.locator('html').getAttribute('dir'), lang === 'he' ? 'rtl' : 'ltr');
        await verifyOverflow(page);
        const sections = page.locator('main section');
        for (let i = 0; i < await sections.count(); i++) {
          await sections.nth(i).scrollIntoViewIfNeeded();
          await page.waitForTimeout(40);
          await verifyOverflow(page);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(out, `layout-${width}-${lang}.png`), fullPage: false });
        const duplicates = await page.evaluate(() => {
          const seen = new Set();
          return Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(id => seen.has(id) || !seen.add(id));
        });
        assert.deepEqual(duplicates, [], 'Duplicate DOM IDs');
      });
    }
  }

  for (const width of [390, 1440]) {
    await check(`Language switching and persistence ${width}px`, { width }, async ({ page, context }) => {
      const headingHE = await page.locator('h1').textContent();
      await page.locator('.lang-opt[data-lang="en"]').first().click();
      assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
      assert.notEqual(await page.locator('h1').textContent(), headingHE, 'Hero heading translates');
      assert.equal(await page.locator('.lang-opt[data-lang="en"]').first().getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => localStorage.getItem('ot-lang')), 'en');
      const freshPage = await context.newPage();
      await freshPage.goto(origin + '/');
      assert.equal(await freshPage.locator('html').getAttribute('lang'), 'en', 'Another tab shares language preference');
      await freshPage.close();
      await page.locator('.lang-opt[data-lang="he"]').first().click();
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
      assert.equal(await page.locator('h1').textContent(), headingHE);
      assert.equal(await page.locator('.lang-opt[data-lang="he"]').first().getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => localStorage.getItem('ot-lang')), 'he');
    });
  }

  await check('Language preference survives reload and legal-page navigation', {}, async ({ page }) => {
    await page.locator('.lang-opt[data-lang="en"]').first().click();
    // The fixture only seeds an empty store, so this represents an actual return visit.
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.goto(origin + '/pages/privacy.html', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
    await page.locator('.lang-opt[data-lang="he"]').first().click();
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'he');
  });

  for (const width of [375, 390, 768]) {
    for (const lang of ['he', 'en']) {
      await check(`Mobile navigation ${width}px ${lang}`, { width, lang }, async ({ page }) => {
        const menu = page.locator('.menu-toggle');
        assert.equal(await menu.isVisible(), true, 'Mobile menu button visible');
        assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        await menu.click();
        assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('.main-nav').isVisible(), true);
        await verifyOverflow(page);
        await page.keyboard.press('Escape');
        assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        assert.equal(await menu.evaluate(el => el === document.activeElement), true, 'Escape restores menu focus');
        await menu.click();
        await page.locator('.main-nav a').first().click();
        assert.equal(await menu.getAttribute('aria-expanded'), 'false', 'Selecting a nav link closes the menu');
      });
    }
  }

  await check('Every local page and hash link resolves', {}, async ({ page }, record) => {
    const queue = ['/'];
    const checked = new Set();
    const links = [];
    while (queue.length) {
      const pathname = queue.shift();
      if (checked.has(pathname)) continue;
      checked.add(pathname);
      const response = await page.goto(origin + pathname, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, 'Page exists: ' + pathname);
      const anchors = await page.locator('a[href]').evaluateAll(els => els.map(el => ({ href: el.getAttribute('href'), resolved: el.href, target: el.target, rel: el.rel })));
      const documentIds = await page.locator('[id]').evaluateAll(els => els.map(el => el.id));
      for (const a of anchors) {
        if (/^(mailto:|tel:|javascript:)/.test(a.href)) continue;
        const url = new URL(a.resolved);
        if (url.origin !== origin) {
          if (a.target === '_blank') assert.match(a.rel, /noopener|noreferrer/, 'External new-tab link has a safe rel: ' + a.href);
          continue;
        }
        links.push({ page: pathname, href: a.href });
        if (url.pathname === pathname || (pathname === '/' && url.pathname === '/index.html')) {
          if (url.hash === '#fit-check') assert.ok(await page.locator('script[src$="fit-check.js"]').count(), 'Fit-check handler exists');
          else if (url.hash) assert.ok(documentIds.includes(decodeURIComponent(url.hash.slice(1))), `Missing hash target ${pathname}${url.hash}`);
        } else if (url.hash) {
          const destination = await page.context().newPage();
          await destination.goto(origin + url.pathname, { waitUntil: 'domcontentloaded' });
          if (url.hash === '#fit-check') assert.ok(await destination.locator('script[src$="fit-check.js"]').count());
          else assert.ok(await destination.locator('[id]').evaluateAll((els, id) => els.some(el => el.id === id), decodeURIComponent(url.hash.slice(1))), 'Missing cross-page hash: ' + a.href);
          await destination.close();
        }
        if (!checked.has(url.pathname) && /(?:\/|\.html)$/.test(url.pathname)) queue.push(url.pathname);
      }
    }
    record.pages = Array.from(checked);
    record.linksChecked = links.length;
  });

  for (const width of [390, 1440]) {
    for (const lang of ['he', 'en']) {
      await check(`Fit-check complete, back, validation and safe WhatsApp ${width}px ${lang}`, { width, lang }, async ({ page, blocked }, record) => {
        const trigger = await openFit(page);
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
        assert.equal(await page.locator('#fitc-title').textContent(), COPY[lang].dialogTitle);
        await verifyOverflow(page);
        await answer(page, 1, 'lead');
        await page.locator('.fitc-back').click();
        assert.equal(await page.locator('input[value="lead"]').isChecked(), true, 'Back preserves the answer');
        assert.equal(await page.locator('.fitc-next').isDisabled(), false);
        await page.locator('.fitc-next').click();
        await answer(page, 2, 'consistent');
        await answer(page, 3, 'steadily');
        await answer(page, 4, 'learn');
        assert.equal(await page.locator('.fitc-result h3').textContent(), COPY[lang].result.title);
        assert.equal(await page.locator('.fitc-start').textContent(), COPY[lang].result.starts.learn);
        await page.locator('.fitc-cta').click();
        assert.equal(await page.locator('.fitc-err').textContent(), COPY[lang].nameRequired);
        assert.equal(await page.locator('.fitc-name').evaluate(el => el === document.activeElement), true);
        assert.equal(blocked.filter(r => r.url.startsWith('https://wa.me/')).length, 0, 'No handoff before required name');
        const name = ' QA דנה & + #? ';
        const business = ' example.test/?a=1&b=two words#fragment ';
        await page.locator('.fitc-name').fill(name);
        await page.locator('.fitc-biz').fill(business);
        await page.locator('.fitc-cta').click({ noWaitAfter: true });
        await poll(() => blocked.some(r => r.url.startsWith('https://wa.me/')), 'WhatsApp navigation was intercepted');
        const handoff = new URL(blocked.find(r => r.url.startsWith('https://wa.me/')).url);
        assert.equal(handoff.hostname, 'wa.me');
        assert.match(handoff.pathname, /^\/\d{10,15}$/);
        assert.equal(handoff.searchParams.get('text'), buildMessage(lang, { q1: 'lead', q2: 'consistent', q3: 'steadily', q4: 'learn' }, name.trim(), business.trim()));
        assert.equal(Array.from(handoff.searchParams.keys()).length, 1, 'Special characters remain inside one encoded text parameter');
        assert.ok(handoff.href.includes('%0A'), 'Newlines are encoded');
        record.handoffVerified = true;
        record.externalNavigationBlocked = true;
        // Request interception prevents contacting WhatsApp. Chromium may show an error page after a blocked navigation.
      });
    }
  }

  for (const lang of ['he', 'en']) {
    await check(`Fit-check dismissal, reset, focus trap and hash ${lang}`, { width: 390, lang }, async ({ page }) => {
      for (const method of ['close', 'escape', 'overlay']) {
        const trigger = await openFit(page);
        await answer(page, 1, 'ecom');
        await closeAndCheck(page, trigger, method);
        await openFit(page);
        assert.equal(await page.locator('.fitc-opts input:checked').count(), 0, 'Reopening starts a clean check');
        assert.ok((await page.locator('.fitc-progress').textContent()).includes('1'));
        const close = page.locator('.fitc-close');
        await close.focus();
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => !!document.activeElement.closest('.fitc-modal')), true, 'Reverse tab stays in modal');
        await page.keyboard.press('Tab');
        assert.equal(await close.evaluate(el => el === document.activeElement), true, 'Forward tab wraps to close button');
        await closeAndCheck(page, trigger, 'escape');
      }
      await page.goto(origin + '/#fit-check', { waitUntil: 'networkidle' });
      await page.locator('.fitc-overlay.open').waitFor({ state: 'visible' });
      await closeAndCheck(page, null, 'escape');
      assert.equal(new URL(page.url()).hash, '', 'Closing a deep-linked modal removes the modal hash');
    });
  }

  await check('Fit-check all recommendation branches and in-dialog language changes', { width: 390 }, async ({ page }) => {
    for (const value of ['operate', 'convert', 'learn', 'unsure']) {
      const trigger = await openFit(page);
      await answer(page, 1, 'other');
      await answer(page, 2, 'nothing');
      await answer(page, 3, 'notreally');
      await page.evaluate(() => window.__setLang('en'));
      assert.equal(await page.locator('.fitc-q').textContent(), COPY.en.q[3].q);
      await answer(page, 4, value);
      assert.equal(await page.locator('.fitc-start').textContent(), COPY.en.result.starts[value]);
      await closeAndCheck(page, trigger, 'escape');
      await page.evaluate(() => window.__setLang('he'));
    }
  });

  await check('Fit-check immediate reopen is not hidden by a stale close timer', { width: 390 }, async ({ page }) => {
    await openFit(page);
    await page.locator('.fitc-close').click();
    await page.evaluate(() => document.querySelector('main a[href="#fit-check"]').click());
    await page.waitForTimeout(350);
    assert.equal(await page.locator('.fitc-overlay').isVisible(), true, 'Immediate reopen stays visible');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  });

  await check('Direct contact buttons are configured and translated', {}, async ({ page }) => {
    const email = await page.locator('.contact-email').getAttribute('href');
    assert.match(email, /^mailto:[^@]+@[^@]+$/);
    assert.match(await page.locator('.contact-facebook').getAttribute('href'), /^https:\/\/www\.facebook\.com\//);
    for (const lang of ['he', 'en']) {
      await page.evaluate(lang => window.__setLang(lang), lang);
      const wa = new URL(await page.locator('.contact-whatsapp').getAttribute('href'));
      assert.equal(wa.searchParams.get('text'), COPY[lang].wa.contactGreeting);
      assert.equal(await page.locator('.contact-whatsapp').getAttribute('aria-disabled'), null);
    }
  });

  for (const width of [390, 1440]) {
    await check(`Accessibility controls and persistence ${width}px`, { width }, async ({ page }) => {
      const toggle = page.locator('#a11y-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.locator('#a11y-font-up').click();
      assert.equal(await page.locator('html').evaluate(el => el.style.zoom), '1.12');
      await page.locator('#a11y-font-down').click();
      assert.equal(await page.locator('html').evaluate(el => el.style.zoom), '');
      for (const [key, css] of [['links', 'a11y-links'], ['readable', 'a11y-readable'], ['motion', 'a11y-no-motion'], ['contrast', 'a11y-contrast'], ['grayscale', 'a11y-grayscale']]) {
        await page.locator(`#a11y-panel [data-toggle="${key}"]`).click();
        assert.equal(await page.locator('html').evaluate((el, css) => el.classList.contains(css), css), true);
        assert.equal(await page.locator(`#a11y-panel [data-toggle="${key}"]`).getAttribute('aria-pressed'), 'true');
      }
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('a11y-links')), true);
      assert.equal(await page.locator('html').evaluate(el => el.classList.contains('a11y-no-motion')), true);
      await toggle.click();
      await page.locator('#a11y-reset').click();
      assert.equal(await page.locator('html').evaluate(el => /a11y-(contrast|grayscale|links|readable|no-motion)/.test(el.className)), false);
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('ot-a11y'))), { font: 0, contrast: false, grayscale: false, links: false, readable: false, motion: false });
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await page.locator('#a11y-panel').waitFor({ state: 'hidden' });
    });
  }

  for (const lang of ['he', 'en']) {
    await check(`FAQ interaction ${lang}`, { width: 390, lang }, async ({ page }) => {
      const details = page.locator('.faq-list details');
      assert.ok(await details.count() >= 2, 'FAQ has at least two items');
      await details.nth(0).locator('summary').click();
      assert.equal(await details.nth(0).evaluate(el => el.open), true);
      await details.nth(1).locator('summary').click();
      await page.waitForTimeout(100);
      assert.equal(await details.nth(1).evaluate(el => el.open), true);
      assert.equal(await details.nth(0).evaluate(el => el.open), false, 'FAQ keeps one answer open');
      await details.nth(1).locator('summary').click();
      assert.equal(await details.nth(1).evaluate(el => el.open), false);
      await verifyOverflow(page);
    });
  }

  for (const width of [390, 1440]) {
    await check(`Normal motion startup and resize ${width}px`, { width, motion: 'no-preference' }, async ({ page }) => {
      await page.waitForTimeout(1500);
      await verifyOverflow(page);
      await page.locator('main section').last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await verifyOverflow(page);
      await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 960 });
      await page.waitForTimeout(350);
      await verifyOverflow(page);
      const trigger = await openFit(page);
      await closeAndCheck(page, trigger, 'escape');
    });
  }
})().catch(error => {
  console.error(error);
  report.fatalError = error.stack;
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  report.finishedAt = new Date().toISOString();
  report.summary = { passed: checks.filter(c => c.status === 'passed').length, failed: checks.filter(c => c.status === 'failed').length, total: checks.length, externalRequestsBlocked: report.blockedRequests.length };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n' + JSON.stringify(report.summary));
  console.log('Report: ' + path.join(out, 'report.json'));
  if (report.summary.failed) process.exitCode = 1;
});
