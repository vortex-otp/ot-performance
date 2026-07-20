'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildMessage, COPY } = require('../fit-check.js');

const full = { q1: 'lead', q2: 'consistent', q3: 'steadily', q4: 'learn' };

test('COPY has exactly 4 questions in both languages', () => {
  assert.strictEqual(COPY.he.q.length, 4);
  assert.strictEqual(COPY.en.q.length, 4);
});

test('COPY has a single positive result block (no three-way verdict)', () => {
  assert.ok(COPY.he.result && COPY.he.result.title && COPY.he.result.starts);
  assert.ok(COPY.en.result && COPY.en.result.title && COPY.en.result.starts);
  assert.strictEqual(COPY.he.verdict, undefined);
});

test('result.starts covers every Q4 answer value', () => {
  ['operate', 'convert', 'learn', 'unsure'].forEach(function (k) {
    assert.ok(COPY.he.result.starts[k], 'he starts missing ' + k);
    assert.ok(COPY.en.result.starts[k], 'en starts missing ' + k);
  });
});

test('buildMessage HE: intro + all four answer labels + name, no verdict claim', () => {
  const msg = buildMessage('he', full, 'דנה', '');
  assert.match(msg, /היי First Motion/);
  assert.match(msg, /הנה מה שעניתי/);
  assert.match(msg, /סוג עסק: לידים/);
  assert.match(msg, /שיווק פעיל: כן, באופן קבוע/);
  assert.match(msg, /הצעה מוכחת: כן, מוכרים באופן קבוע/);
  assert.match(msg, /החסם המרכזי: אי אפשר למדוד מה עובד/);
  assert.match(msg, /השם שלי: דנה/);
  assert.ok(!/התאמה חזקה|התאמה חלקית|התוצאה:/.test(msg), 'no verdict label in message');
  assert.ok(!/עסק\/אתר:/.test(msg), 'no business line when business empty');
});

test('buildMessage includes business line when provided', () => {
  const msg = buildMessage('he', full, 'דנה', 'example.co.il');
  assert.match(msg, /עסק\/אתר: example\.co\.il/);
});

test('buildMessage EN uses English labels', () => {
  const msg = buildMessage('en', full, 'Dana', '');
  assert.match(msg, /I took the compatibility check/);
  assert.match(msg, /Business type: Lead generation/);
  assert.match(msg, /My name: Dana/);
});

test('buildMessage unknown lang falls back to HE', () => {
  assert.match(buildMessage('xx', full, 'דנה', ''), /היי First Motion/);
});

test('buildMessage output URL-encodes with newlines', () => {
  const enc = encodeURIComponent(buildMessage('he', full, 'דנה', ''));
  assert.match(enc, /%0A/);
});
