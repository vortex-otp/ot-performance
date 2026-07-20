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
