const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const switcher = require('../shared/dimension-switcher.js');

function setup(namespace = 'matching', { reduced = false, animation = true } = {}) {
  const calls = [], timers = [], cancelledTimers = [], focus = [];
  const panel = { attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } };
  const window = {
    matchMedia: () => ({ matches: reduced }),
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; },
    clearTimeout(id) { cancelledTimers.push(id); }
  };
  const document = { defaultView: window };
  const group = { dataset: { dimensionNamespace: namespace } };
  let mode = 'organization';
  function element(name) {
    const node = { name, ownerDocument: document, focus() { focus.push(name); } };
    if (animation) node.animate = (frames, timing) => {
      const call = { name, frames, timing, cancelled: false };
      calls.push(call);
      return { cancel() { call.cancelled = true; } };
    };
    return node;
  }
  const indicator = element('indicator'), labels = element('labels');
  const fields = [element('first-field'), element('second-field')];
  const feedback = { textContent: '' };
  const buttons = Object.fromEntries(['organization', 'geography'].map(value => [value, {
    ...element(value), id: `${namespace}-dimension-${value}`, dataset: { dimensionOption: value },
    getAttribute: key => key === 'aria-controls' ? `${namespace}-panel` : null,
    closest: selector => selector === '[data-dimension-option]' ? buttons[value]
      : selector === '[data-dimension-switcher]' ? group : null,
    click() { if (value === mode) return; const from = mode; mode = value; switcher.change(root, { from, mode, event: { detail: 0 }, fields }); }
  }]));
  document.getElementById = id => id === `${namespace}-panel` ? panel : Object.values(buttons).find(button => button.id === id);
  document.querySelector = selector => Object.entries(buttons).find(([value]) => selector === `[data-${namespace}-dimension="${value}"]`)?.[1];
  const root = {
    ownerDocument: document,
    querySelector(selector) {
      if (selector === '[data-dimension-option][aria-selected="true"]') return buttons[mode];
      if (selector === '.dimension-switcher__indicator') return indicator;
      if (selector === '.dimension-switcher__indicator-labels') return labels;
      if (selector === '[data-dimension-feedback]') return feedback;
      const value = selector.match(/^\[data-dimension-option="(\w+)"\]$/)?.[1];
      return buttons[value] || null;
    }
  };
  return { root, document, buttons, panel, fields, calls, timers, cancelledTimers, focus, feedback,
    get mode() { return mode; }, set mode(value) { mode = value; } };
}

test('all six namespaces retain page actions with one selected tab and escaped path content', () => {
  const ids = [];
  for (const namespace of ['matching', 'visit', 'badge', 'sr', 'lr', 'fo']) {
    const html = switcher.render({ namespace, mode: 'geography', label: '筛选维度', panelId: `${namespace}-panel`,
      path: ['品牌', '省份', '<script>alert(1)</script>', '门店&分店'] });
    assert.match(html, new RegExp(`data-${namespace}-dimension="geography"[^>]+aria-selected="true"`));
    assert.match(html, /aria-selected="true"[^>]+tabindex="0"/);
    assert.match(html, /aria-selected="false"[^>]+tabindex="-1"/);
    assert.match(html, /地理路径：/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(html, /门店&amp;分店/);
    assert.doesNotMatch(html, /<script>/);
    ids.push(...[...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  }
  assert.equal(new Set(ids).size, 12);
});

test('panel labels follow the active tab without affecting another instance', () => {
  const first = setup('matching'), second = setup('visit');
  switcher.sync(first.root);
  switcher.sync(second.root);
  assert.deepEqual(first.panel.attributes, { role: 'tabpanel', 'aria-labelledby': 'matching-dimension-organization' });
  first.mode = 'geography';
  switcher.sync(first.root);
  assert.equal(first.panel.attributes['aria-labelledby'], 'matching-dimension-geography');
  assert.equal(second.panel.attributes['aria-labelledby'], 'visit-dimension-organization');
});

test('pointer changes move the slider and clipped labels together and fade only supplied fields', () => {
  const ui = setup();
  ui.mode = 'geography';
  switcher.change(ui.root, { from: 'organization', mode: ui.mode, event: { detail: 1 }, fields: [...ui.fields, null] });
  assert.deepEqual(ui.calls.map(call => call.name), ['indicator', 'labels', 'first-field', 'second-field']);
  assert.equal(ui.calls[0].timing.duration, 180);
  assert.deepEqual(ui.calls[0].timing, ui.calls[1].timing);
  assert.deepEqual(ui.calls[0].frames.map(frame => frame.transform), ['translateX(0)', 'translateX(100%)']);
  assert.deepEqual(ui.calls[1].frames.map(frame => frame.transform), ['translateX(0)', 'translateX(-50%)']);
  assert.ok(ui.calls.slice(2).every(call => call.timing.duration === 140));
  assert.equal(ui.focus.at(-1), 'geography');
  assert.equal(ui.feedback.textContent, '');
});

test('rapid reversal cancels old motion while another component keeps its motion', () => {
  const first = setup('matching'), second = setup('visit');
  for (const ui of [first, second]) {
    ui.mode = 'geography';
    switcher.change(ui.root, { from: 'organization', mode: ui.mode, event: { detail: 1 }, fields: ui.fields });
  }
  first.mode = 'organization';
  switcher.change(first.root, { from: 'geography', mode: first.mode, event: { detail: 1 }, fields: first.fields });
  assert.ok(first.calls.slice(0, 4).every(call => call.cancelled));
  assert.ok(second.calls.every(call => !call.cancelled));
  assert.deepEqual(first.calls[4].frames.map(frame => frame.transform), ['translateX(100%)', 'translateX(0)']);
  assert.deepEqual(first.calls[5].frames.map(frame => frame.transform), ['translateX(-50%)', 'translateX(0)']);
});

test('keyboard arrows and Home or End use the page action and restore the new tab focus', () => {
  for (const namespace of ['matching', 'visit', 'badge', 'sr', 'lr', 'fo']) {
    const ui = setup(namespace);
    for (const [key, expected] of [['ArrowRight', 'geography'], ['ArrowLeft', 'organization'], ['End', 'geography'], ['Home', 'organization']]) {
      const event = { key, target: ui.buttons[ui.mode], preventDefault() { this.prevented = true; } };
      assert.equal(switcher.handleKeydown(event), true);
      assert.equal(event.prevented, true);
      assert.equal(ui.mode, expected);
      assert.equal(ui.focus.at(-1), expected);
    }
    assert.equal(ui.calls.length, 0);
    assert.equal(switcher.handleKeydown({ key: 'ArrowDown', target: ui.buttons[ui.mode] }), false);
  }
});

test('reduced motion and missing animation support retain immediate state feedback', () => {
  for (const options of [{ reduced: true }, { animation: false }]) {
    const ui = setup('matching', options);
    ui.mode = 'geography';
    switcher.change(ui.root, { from: 'organization', mode: ui.mode, event: { detail: 1 }, fields: ui.fields, cleared: true });
    assert.equal(ui.calls.length, 0);
    assert.equal(ui.focus.at(-1), 'geography');
    assert.match(ui.feedback.textContent, /已切换至地理维度/);
  }
});

test('cleared-condition notices expire and stale callbacks cannot clear a newer notice', () => {
  const ui = setup();
  ui.mode = 'geography';
  switcher.change(ui.root, { from: 'organization', mode: ui.mode, event: { detail: 0 }, cleared: true });
  const firstTimer = ui.timers[0];
  assert.equal(firstTimer.delay, 3000);
  ui.mode = 'organization';
  switcher.change(ui.root, { from: 'geography', mode: ui.mode, event: { detail: 0 }, cleared: true });
  assert.ok(ui.cancelledTimers.includes(1));
  firstTimer.callback();
  assert.match(ui.feedback.textContent, /已切换至组织维度/);
  ui.timers[1].callback();
  assert.equal(ui.feedback.textContent, '');
  switcher.change(ui.root, { from: 'organization', mode: 'organization', event: { detail: 1 }, cleared: true });
  assert.equal(ui.timers.length, 2);
  assert.equal(ui.calls.length, 0);
});

test('the browser script installs one keyboard handler that ignores unrelated controls', () => {
  const handlers = [];
  const window = { document: { addEventListener(name, callback) { handlers.push({ name, callback }); } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../shared/dimension-switcher.js'), 'utf8'), { window });
  assert.equal(handlers.length, 1);
  assert.equal(handlers[0].name, 'keydown');
  assert.equal(typeof window.DimensionSwitcher.render, 'function');
  handlers[0].callback({ key: 'ArrowRight', target: { closest: () => null }, stopImmediatePropagation() { throw new Error('unrelated input was intercepted'); } });
});
