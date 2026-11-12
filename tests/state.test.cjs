const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = path.join(__dirname, '../src/state.js');
const context = {};
if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
const S = context.KittyState || {};

test('restored running timer uses its absolute deadline after a refresh', () => {
  assert.equal(typeof S.start, 'function', 'start is not implemented');
  const state = S.start(S.fresh(), 25, 1000);
  const restored = S.restore(JSON.stringify(state));
  assert.equal(S.remaining(restored, 61000), 1440000);
});
test('a completed session rewards once, even when ticked repeatedly after reload', () => {
  assert.equal(typeof S.tick, 'function', 'tick is not implemented');
  const state = S.start(S.fresh(), 25, 0);
  const complete = S.tick(state, 1500000);
  assert.equal(complete.xp, 50);
  assert.equal(complete.totalMinutes, 25);
  assert.equal(complete.sessions, 1);
  assert.equal(complete.session, null);
  assert.equal(S.tick(S.restore(JSON.stringify(complete)), 2000000).xp, 50);
});
test('quitting early does not award XP or record a completed session', () => {
  assert.equal(typeof S.cancel, 'function', 'cancel is not implemented');
  const state = S.cancel(S.start(S.fresh(), 5, 0), 10000);
  assert.equal(state.xp, 0);
  assert.equal(state.sessions, 0);
  assert.equal(state.session, null);
  assert.equal(state.notice.type, 'cancel');
});
test('a session crossing the level threshold advances the cat and carries remaining XP', () => {
  assert.equal(typeof S.level, 'function', 'level is not implemented');
  let state = S.fresh();
  state.xp = 90;
  state = S.tick(S.start(state, 10, 0), 600000);
  assert.equal(state.xp, 110);
  assert.equal(S.level(state.xp).level, 2);
  assert.equal(S.level(state.xp).progress, 10);
});
test('duration validation rejects empty, fractional, negative and excessive sessions', () => {
  assert.equal(typeof S.start, 'function', 'start is not implemented');
  for (const minutes of ['', 0, -1, 1.5, 181, NaN]) assert.throws(() => S.start(S.fresh(), minutes, 0));
});
test('corrupt saves safely recover without manufacturing progress', () => {
  assert.equal(typeof S.restore, 'function', 'restore is not implemented');
  for (const raw of ['broken', 'null', '{"xp":-2}', '{"session":{"end":9}}']) {
    const state = S.restore(raw);
    assert.equal(state.xp, 0);
    assert.equal(state.session, null);
  }
});
test('quitting at the deadline settles a finished session instead of losing its reward', () => {
  assert.equal(typeof S.cancel, 'function', 'cancel is not implemented');
  const state = S.cancel(S.start(S.fresh(), 1, 0), 60000);
  assert.equal(state.xp, 2);
  assert.equal(state.sessions, 1);
  assert.equal(state.notice.type, 'complete');
});
