'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { score, partialGap, notyetReason } = require('../fit-check.js');

const base = { q1: 'lead', q2: 'consistent', q3: 'steadily', q4: 'learn', q5: 'ready' };
const A = (over) => Object.assign({}, base, over);

test('strong fit: all maxed + core business type', () => {
  assert.strictEqual(score(A()), 'strong');
  assert.strictEqual(score(A({ q1: 'ecom' })), 'strong');
  assert.strictEqual(score(A({ q1: 'b2b' })), 'strong');
});

test('q1 other cannot be strong, degrades to partial', () => {
  assert.strictEqual(score(A({ q1: 'other' })), 'partial');
});

test('gate: nothing active → notyet regardless of others', () => {
  assert.strictEqual(score(A({ q2: 'nothing' })), 'notyet');
});

test('gate: unproven offer → notyet', () => {
  assert.strictEqual(score(A({ q3: 'notreally' })), 'notyet');
});

test('gate: traffic-only → notyet', () => {
  assert.strictEqual(score(A({ q5: 'trafficonly' })), 'notyet');
});

test('partial: one middle answer, no gate', () => {
  assert.strictEqual(score(A({ q2: 'starting' })), 'partial');
  assert.strictEqual(score(A({ q3: 'earlysales' })), 'partial');
  assert.strictEqual(score(A({ q5: 'open' })), 'partial');
});

test('gate beats a would-be partial', () => {
  assert.strictEqual(score(A({ q2: 'starting', q3: 'notreally' })), 'notyet');
});

test('partialGap priority q3 > q2 > q5 > q1', () => {
  assert.strictEqual(partialGap(A({ q3: 'earlysales', q2: 'starting' })), 'q3');
  assert.strictEqual(partialGap(A({ q2: 'starting', q5: 'open' })), 'q2');
  assert.strictEqual(partialGap(A({ q5: 'open' })), 'q5');
  assert.strictEqual(partialGap(A({ q1: 'other' })), 'q1');
});

test('notyetReason priority q3 > q2 > q5', () => {
  assert.strictEqual(notyetReason(A({ q3: 'notreally', q2: 'nothing' })), 'q3');
  assert.strictEqual(notyetReason(A({ q2: 'nothing', q5: 'trafficonly' })), 'q2');
  assert.strictEqual(notyetReason(A({ q5: 'trafficonly' })), 'q5');
});

const { buildMessage } = require('../fit-check.js');

const full = { q1: 'lead', q2: 'consistent', q3: 'steadily', q4: 'learn', q5: 'ready' };

test('buildMessage HE: contains verdict label + all four answer labels + name', () => {
  const msg = buildMessage('he', full, 'דנה', '');
  assert.match(msg, /התוצאה: התאמה חזקה\./);
  assert.match(msg, /סוג עסק: לידים/);
  assert.match(msg, /שיווק פעיל: כן, באופן קבוע/);
  assert.match(msg, /הצעה מוכחת: כן, מוכרים באופן קבוע/);
  assert.match(msg, /החסם המרכזי: אי אפשר למדוד מה עובד/);
  assert.match(msg, /השם שלי: דנה/);
  assert.ok(!/עסק\/אתר:/.test(msg), 'no business line when business empty');
});

test('buildMessage includes business line when provided', () => {
  const msg = buildMessage('he', full, 'דנה', 'example.co.il');
  assert.match(msg, /עסק\/אתר: example\.co\.il/);
});

test('buildMessage EN uses English labels', () => {
  const msg = buildMessage('en', full, 'Dana', '');
  assert.match(msg, /result: Strong fit\./);
  assert.match(msg, /Business type: Lead generation/);
  assert.match(msg, /My name: Dana/);
});

test('buildMessage unknown lang falls back to HE', () => {
  assert.match(buildMessage('xx', full, 'דנה', ''), /היי First Motion/);
});

test('buildMessage output URL-encodes with newlines', () => {
  const enc = encodeURIComponent(buildMessage('he', full, 'דנה', ''));
  assert.match(enc, /%0A/); // newlines preserved and encodable
});
