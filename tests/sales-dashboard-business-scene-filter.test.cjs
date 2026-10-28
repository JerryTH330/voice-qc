const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
class Node {
  constructor(tag, document, attributes = {}) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.attributes = { ...attributes };
    this.children = []; this.parentElement = null; this.listeners = {}; this.style = {}; this.scrollTop = 0; this.offsetHeight = 300;
    this.classList = {
      contains: name => (this.attributes.class || '').split(/\s+/).includes(name),
      add: name => this.classList.toggle(name, true),
      toggle: (name, force) => {
        const classes = new Set((this.attributes.class || '').split(/\s+/).filter(Boolean));
        if (force === undefined ? !classes.has(name) : force) classes.add(name); else classes.delete(name);
        this.attributes.class = [...classes].join(' ');
      }
    };
  }
  set innerHTML(html) {
    this.html = html; this.children.forEach(child => { child.parentElement = null; }); this.children = [];
    const stack = [this];
    for (const match of html.matchAll(/<\/?([a-z][a-z\d-]*)([^>]*)>/gi)) {
      if (match[0].startsWith('</')) { stack.pop(); continue; }
      const attributes = {};
      for (const attribute of match[2].matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) attributes[attribute[1]] = decode(attribute[2] || '');
      const node = new Node(match[1], this.ownerDocument, attributes);
      stack.at(-1).appendChild(node);
      if (!['input', 'img', 'br'].includes(match[1]) && !match[0].endsWith('/>')) stack.push(node);
    }
  }
  get innerHTML() { return this.html || ''; }
  get value() { return this.attributes.value || ''; }
  set value(value) { this.attributes.value = value; }
  get dataset() { return Object.fromEntries(Object.entries(this.attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value])); }
  appendChild(node) { node.parentElement = this; this.children.push(node); return node; }
  hasAttribute(key) { return Object.hasOwn(this.attributes, key); }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attribute) return this.hasAttribute(attribute[1]) && (attribute[2] === undefined || this.attributes[attribute[1]] === attribute[2]);
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  addEventListener(type, fn) { (this.listeners[type] ||= new Set()).add(fn); }
  removeEventListener(type, fn) { this.listeners[type]?.delete(fn); }
  focus() { this.ownerDocument.activeElement = this; }
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  getBoundingClientRect() { return { left: 900, right: 1130, top: 100, bottom: 144, height: 44 }; }
  scrollIntoView() {}
}

function setup() {
  const document = { listeners: {}, activeElement: null, documentElement: { clientWidth: 1100 },
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener };
  const window = { innerWidth: 1100, innerHeight: 800, matchMedia: () => ({ matches: true }), listeners: {},
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener };
  document.defaultView = window;
  const root = new Node('div', document);
  root.innerHTML = '<div data-sales-business-control="scene"></div><div data-sales-business-control="date"><button data-date-event>日期</button></div>';
  const date = root.querySelector('[data-sales-business-control="date"]'), dateButton = root.querySelector('[data-date-event]');
  dateButton.addEventListener('click', () => {});
  const selected = { scene: [] }, calls = { changes: [], before: 0 };
  const scenes = [{ value: 'all', label: '全部' }, { value: 'first_follow', label: '首触跟进' }, { value: 'invite_store', label: '邀约到店' }, { value: 'schedule_confirm', label: '排程确认' }, { value: 'store_reception', label: '销售接待' }, { value: 'test_drive', label: '试乘试驾' }];
  const context = vm.createContext({ window });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../sales-dashboard/business-scene-filter.js'), 'utf8'), context);
  const instance = window.SalesBusinessSceneFilter.mount({ root, sceneOptions: scenes,
    getSelection: key => selected[key], onChange(key, values) { selected[key] = Array.from(values); calls.changes.push({ key, values: selected[key] }); },
    onBeforeOpen() { calls.before++; } });
  function dispatch(type, target, values = {}) {
    const event = { target, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }, ...values };
    if (type === 'click') [...(document.listeners.click || [])].forEach(fn => fn(event));
    [...(root.listeners[type] || [])].forEach(fn => fn(event)); return event;
  }
  const click = selector => dispatch('click', root.querySelector(selector));
  return { root, date, dateButton, instance, selected, calls, document, window, dispatch, click };
}

test('scene selection is immediate, supports multiple values and returns an empty array for all', () => {
  const h = setup(); h.click('[data-ssb-trigger="scene"]');
  assert.equal(h.root.querySelectorAll('[data-ssb-option]').length, 5);
  h.click('[data-ssb-option="first_follow"]'); h.click('[data-ssb-option="invite_store"]');
  assert.deepEqual(h.selected.scene, ['first_follow', 'invite_store']);
  h.click('[data-ssb-all]'); assert.equal(h.selected.scene.length, 5);
  h.click('[data-ssb-all]'); assert.deepEqual(h.selected.scene, []);
  assert.match(h.root.querySelector('[data-sales-business-control="scene"]').innerHTML, /请选择业务场景/);
});

test('selection summaries match factory wording and selected options move to top when reopening', () => {
  const h = setup(); h.click('[data-ssb-trigger="scene"]');
  h.click('[data-ssb-option="test_drive"]'); h.click('[data-ssb-option="store_reception"]'); h.click('[data-ssb-option="schedule_confirm"]');
  assert.match(h.root.querySelector('[data-sales-business-control="scene"]').innerHTML, /试乘试驾等 3 项/);
  assert.equal(h.root.querySelector('[data-ssb-option]').dataset.ssbOption, 'first_follow');
  h.instance.closeMenu(); h.click('[data-ssb-trigger="scene"]');
  assert.equal(h.root.querySelector('[data-ssb-option]').dataset.ssbOption, 'schedule_confirm');
});

test('Escape restores focus, date clicks close the menu, and menus use local viewport-clamped coordinates', () => {
  const h = setup(); h.click('[data-ssb-trigger="scene"]');
  const menu = h.root.querySelector('.so-business-menu');
  assert.equal(menu.style.left, '-236px'); assert.equal(menu.style.top, '52px');
  const escaped = h.dispatch('keydown', h.root.querySelector('[data-ssb-search]'), { key: 'Escape' });
  assert.equal(escaped.defaultPrevented, true); assert.equal(h.document.activeElement.dataset.ssbTrigger, 'scene');
  h.click('[data-ssb-trigger="scene"]'); h.dispatch('click', h.dateButton);
  assert.equal(h.root.querySelector('.so-business-menu'), null); assert.equal(h.calls.before, 2);
  h.instance.destroy(); assert.equal(h.document.listeners.click.size, 0); assert.equal(h.window.listeners.scroll.size, 0);
});

test('keyboard arrows open the menu and move between options', () => {
  const h = setup();
  h.dispatch('keydown', h.root.querySelector('[data-ssb-trigger="scene"]'), { key: 'ArrowUp' });
  assert.equal(h.document.activeElement.dataset.ssbOption, 'test_drive');
  h.dispatch('keydown', h.document.activeElement, { key: 'ArrowDown' });
  assert.equal(h.document.activeElement.dataset.ssbOption, 'first_follow');
  h.dispatch('keydown', h.document.activeElement, { key: 'End' });
  assert.equal(h.document.activeElement.dataset.ssbOption, 'test_drive');
});

test('scene search keeps input during IME and select-all touches only current matches', () => {
  const h = setup(); h.click('[data-ssb-trigger="scene"]'); h.click('[data-ssb-option="test_drive"]');
  const input = h.root.querySelector('[data-ssb-search]'); h.dispatch('compositionstart', input);
  input.value = '到店'; h.dispatch('input', input); assert.equal(h.root.querySelector('[data-ssb-search]'), input);
  h.dispatch('compositionend', input); assert.equal(h.root.querySelectorAll('[data-ssb-option]').length, 1);
  h.click('[data-ssb-all]'); assert.equal(h.selected.scene.length, 2);
  h.click('[data-ssb-all]'); assert.deepEqual(h.selected.scene, ['test_drive']);
  const search = h.root.querySelector('[data-ssb-search]'); search.value = '无结果'; h.dispatch('input', search);
  assert.equal(h.root.querySelectorAll('[data-ssb-option]').length, 0);
  assert.equal(h.root.querySelector('[data-ssb-all]').hasAttribute('disabled'), true);
});
