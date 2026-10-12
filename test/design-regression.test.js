'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
for (const page of ['index.html', 'pages/about.html']) {
  test(`${page}: founder profiles use SVG marks and grounded detail lists`, () => {
    const html = read(page);
    for (const name of ['tamir', 'ofir']) {
      const card = html.match(new RegExp(`<article class="founder-card founder-${name}">([\\s\\S]*?)</article>`));
      assert.ok(card, name);
      assert.match(card[1], /class="founder-symbol"[^>]*><svg/);
      assert.match(card[1], /class="founder-bio"/);
      assert.match(card[1], /class="founder-details"/);
      assert.equal((card[1].match(/<li>/g) || []).length, 3);
      assert.ok(!/[↗↙⌘✳]/u.test(card[1]), 'No platform-dependent emoji symbols');
    }
  });
}
test('homepage workflow uses four custom SVG icons', () => {
  const html = read('index.html');
  assert.equal((html.match(/class="flow-icon" aria-hidden="true"><svg/g) || []).length, 4);
  assert.ok(!/[↗↙⌘✳]/u.test(html));
});
test('sticky header has an explicit opaque override', () => {
  assert.match(read('styles.css'), /\.site-header\{background:#fff;isolation:isolate\}/);
});
