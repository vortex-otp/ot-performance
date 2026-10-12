'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { fitEventProps } = require('../fit-check.js');

const full = { q1: 'lead', q2: 'consistent', q3: 'steadily', q4: 'learn' };

test('fitEventProps maps all four answers and the language', () => {
  assert.deepStrictEqual(fitEventProps(full, 'he', false), {
    business_type: 'lead', marketing: 'consistent', offer: 'steadily', constraint: 'learn',
    lang: 'he', has_business: false
  });
});

test('fitEventProps carries no personal fields', () => {
  const props = fitEventProps(full, 'en', true);
  ['name', 'business', 'email', 'phone', 'firstName'].forEach(function (k) {
    assert.strictEqual(props[k], undefined, k + ' must not be sent');
  });
  assert.strictEqual(props.has_business, true);
});

test('fitEventProps falls back to he and marks missing answers', () => {
  const props = fitEventProps({ q1: 'b2b' }, 'xx', false);
  assert.strictEqual(props.lang, 'he');
  assert.strictEqual(props.marketing, 'unknown');
});

test('fitEventProps adds a stable eventId so Vortex drops repeat submits', () => {
  const a = fitEventProps(full, 'he', false, 'run1-submitted');
  const b = fitEventProps(full, 'he', false, 'run1-submitted');
  assert.strictEqual(a.eventId, 'run1-submitted');
  assert.strictEqual(a.eventId, b.eventId);
  assert.strictEqual(fitEventProps(full, 'he', false).eventId, undefined);
});
