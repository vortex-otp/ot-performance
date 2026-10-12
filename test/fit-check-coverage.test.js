'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { COPY, buildMessage } = require('../fit-check.js');

for (const lang of ['he', 'en']) {
  test(`${lang}: all 144 answer combinations are represented accurately`, () => {
    const questions = COPY[lang].q;
    let count = 0;
    for (const a of questions[0].a) for (const b of questions[1].a) for (const c of questions[2].a) for (const d of questions[3].a) {
      const message = buildMessage(lang, { q1: a.v, q2: b.v, q3: c.v, q4: d.v }, 'QA visitor', '');
      for (const option of [a, b, c, d]) assert.ok(message.includes(option.label));
      assert.ok(!message.includes('undefined'));
      assert.ok(!message.includes('null'));
      count++;
    }
    assert.equal(count, 144);
  });

  test(`${lang}: every answer value is distinct within its question`, () => {
    COPY[lang].q.forEach(question => {
      assert.equal(new Set(question.a.map(answer => answer.v)).size, question.a.length);
      question.a.forEach(answer => { assert.ok(answer.label.trim()); assert.ok(answer.v); });
    });
  });

  test(`${lang}: WhatsApp encoding preserves Unicode, punctuation, newlines, and a URL`, () => {
    const answers = { q1: 'b2b', q2: 'starting', q3: 'earlysales', q4: 'unsure' };
    const name = 'QA דנה 🚀 + & #? =';
    const business = 'https://example.test/path?q=hello world&lang=עברית#fragment';
    const message = buildMessage(lang, answers, name, business);
    const url = new URL('https://wa.me/972000000000?text=' + encodeURIComponent(message));
    assert.equal(url.searchParams.get('text'), message);
    assert.deepEqual([...url.searchParams.keys()], ['text']);
    assert.equal(url.hash, '');
    assert.ok(message.includes(name));
    assert.ok(message.includes(business));
    assert.ok(url.href.includes('%0A'));
  });

  test(`${lang}: optional business is omitted cleanly`, () => {
    const message = buildMessage(lang, { q1: 'other', q2: 'nothing', q3: 'notreally', q4: 'operate' }, 'QA', '');
    assert.ok(!message.includes(COPY[lang].wa.businessLine));
    assert.ok(!message.includes('\n\n'));
  });

  test(`${lang}: recommendation branches and direct contact text are nonempty`, () => {
    COPY[lang].q[3].a.forEach(answer => assert.ok(COPY[lang].result.starts[answer.v].trim()));
    assert.ok(COPY[lang].wa.contactGreeting.trim());
  });
}

test('question and answer keys match between HE and EN', () => {
  assert.deepEqual(COPY.he.q.map(q => q.a.map(a => a.v)), COPY.en.q.map(q => q.a.map(a => a.v)));
});

test('unknown answer values remain visible instead of silently changing meaning', () => {
  const message = buildMessage('en', { q1: 'future-type', q2: 'starting', q3: 'earlysales', q4: 'unsure' }, 'QA', '');
  assert.ok(message.includes('future-type'));
});
