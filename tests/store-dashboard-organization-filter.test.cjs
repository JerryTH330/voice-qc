const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createModel, organizationRecord } = require('../device-management/visit-organization-filter.js');

const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
class Node {
  constructor(tag, document, attributes = {}) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.attributes = { ...attributes };
    this.children = []; this.parentElement = null; this.listeners = {}; this.style = {};
    this.scrollTop = 0; this.scrollHeight = 180; this.offsetHeight = 300; this.hidden = false;
    this.classList = {
      contains: name => (this.attributes.class || '').split(/\s+/).includes(name),
      add: name => this.classList.toggle(name, true),
      toggle: (name, force) => {
        const classes = new Set((this.attributes.class || '').split(/\s+/).filter(Boolean));
        const add = force === undefined ? !classes.has(name) : force;
        if (add) classes.add(name); else classes.delete(name);
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
  get id() { return this.attributes.id || ''; }
  set id(value) { this.attributes.id = value; }
  get value() { return this.attributes.value || ''; }
  set value(value) { this.attributes.value = value; }
  get dataset() { return Object.fromEntries(Object.entries(this.attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value])); }
  appendChild(node) {
    if (node.parentElement) node.parentElement.children = node.parentElement.children.filter(child => child !== node);
    node.parentElement = this; this.children.push(node); return node;
  }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  hasAttribute(key) { return Object.hasOwn(this.attributes, key); }
  matches(selector) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attribute) return this.hasAttribute(attribute[1]) && (attribute[2] === undefined || this.getAttribute(attribute[1]) === attribute[2]);
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
  getBoundingClientRect() { return { left: 900, right: 1130, top: 100, bottom: 144, height: this.hidden ? 0 : 180 }; }
  scrollIntoView() {}
}

const dealers = [
  { dealerWid: 'S1', brand: '传祺', dealerCode: 'G01', dealerName: '上海店', area: '华东大区', zone: '沪苏战区', province: '上海市', city: '上海市', patroler: '巡回甲', patrolerId: 'P1', governor: '治理甲', governorId: 'G1' },
  { dealerWid: 'S2', brand: '埃安', dealerCode: 'A02', dealerName: '广州店', area: '华南大区', zone: '粤海战区', province: '广东省', city: '广州市', patroler: '巡回乙', patrolerId: 'P2', governor: '治理乙', governorId: 'G2' }
];
const records = dealers.flatMap((dealer, index) => ['张三', '李四'].map((advisor, person) => ({ ...organizationRecord(dealer), advisor, advisorKey: `person:${index}:${person}`, advisorId: `ADV-${index}${person}` })));

function setup() {
  const document = { listeners: {}, activeElement: null, documentElement: { clientWidth: 1100 },
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener };
  const calls = { change: [], reset: 0, before: 0, sync: 0, dimension: [] };
  const window = { innerWidth: 1100, innerHeight: 800, matchMedia: () => ({ matches: true }),
    clearTimeout() {}, setTimeout: () => 1, listeners: {},
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener,
    DimensionSwitcher: {
      render: ({ mode, namespace, panelId }) => `<div data-dimension-switcher data-dimension-namespace="${namespace}"><button data-sd-dimension="organization" data-dimension-option="organization" aria-controls="${panelId}" aria-selected="${mode === 'organization'}"></button><button data-sd-dimension="geography" data-dimension-option="geography" aria-controls="${panelId}" aria-selected="${mode === 'geography'}"></button></div>`,
      sync() { calls.sync++; }, change(root, options) { calls.dimension.push(options); }, handleKeydown: () => false
    }
  };
  document.defaultView = window;
  const root = new Node('div', document);
  const business = new Node('div', document);
  const businessButton = new Node('button', document, { 'data-existing-business': '' });
  businessButton.addEventListener('click', () => {}); business.appendChild(businessButton);
  const context = vm.createContext({ window });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../store-dashboard/organization-filter.js'), 'utf8'), context);
  const model = createModel(dealers, records, { mode: 'matching' });
  const instance = window.StoreDashboardOrganizationFilter.mount({ root, model, businessFilters: business,
    onChange: change => calls.change.push(change), onReset: () => calls.reset++, onBeforeChange: () => calls.before++ });
  function dispatch(type, target, values = {}) {
    const eventPath=[];
    for(let node=target;node;node=node.parentElement)eventPath.push(node);
    const event = { target, composedPath:()=>eventPath, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }, ...values };
    if (type === 'click') [...(document.listeners.click || [])].forEach(fn => fn(event));
    [...(root.listeners[type] || [])].forEach(fn => fn(event));
    return event;
  }
  const click = selector => dispatch('click', root.querySelector(selector));
  return { root, business, businessButton, model, instance, calls, document, window, click, dispatch };
}

test('initial view shows hierarchy controls without an advisor filter', () => {
  const h = setup();
  assert.deepEqual(h.root.querySelector('#storeDashboardDimensionFilters').querySelectorAll('[data-sd-control]').map(node => node.dataset.sdControl), ['brand', 'region', 'zone', 'store']);
  assert.deepEqual(h.root.querySelector('[data-sd-personnel]').querySelectorAll('[data-sd-control]').map(node => node.dataset.sdControl), ['patroler', 'governor']);
  assert.equal(h.root.querySelector('[data-sd-personnel]').parentElement, h.root.querySelector('[data-sd-business]').parentElement);
  const extra = h.root.querySelector('[data-sd-extra]');
  assert.equal(extra.hidden, true); assert.equal(extra.inert, true);
  h.click('[data-sd-collapse]');
  assert.equal(extra.hidden, false); assert.equal(extra.inert, false);
  h.businessButton.focus(); h.instance.render();
  assert.equal(h.root.querySelector('[data-existing-business]'), h.businessButton);
  assert.equal(h.document.activeElement, h.businessButton);
  assert.equal(h.businessButton.listeners.click.size, 1);
});

test('selecting a store applies its records immediately and preserves menu order until reopened', () => {
  const h = setup(); h.click('[data-sd-trigger="store"]');
  const before = h.root.querySelectorAll('[data-sd-option]').map(node => node.dataset.sdOption);
  const value = before.at(-1);
  h.click(`[data-sd-option="${value}"]`);
  assert(records.filter(h.model.matches).every(record => record.storeId === value));
  assert.deepEqual(h.root.querySelectorAll('[data-sd-option]').map(node => node.dataset.sdOption), before);
  h.instance.closeMenu(); h.click('[data-sd-trigger="store"]');
  assert.equal(h.root.querySelector('[data-sd-option]').dataset.sdOption, value);
  assert.equal(h.calls.change.length, 1);
});

test('search and select-all affect only visible matches and keep unrelated selections', () => {
  const h = setup(); h.click('[data-sd-trigger="store"]');
  h.click('[data-sd-option="S1"]');
  const input = h.root.querySelector('[data-sd-search]'); input.value = 'a02';
  h.dispatch('input', input);
  assert.equal(h.root.querySelectorAll('[data-sd-option]').length, 1);
  h.click('[data-sd-all]');
  assert.deepEqual([...h.model.applied.store].sort(), ['S1', 'S2']);
  h.click('[data-sd-all]');
  assert.deepEqual(h.model.applied.store, ['S1']);
});

test('composition search keeps the original input until composition ends', () => {
  const h = setup(); h.click('[data-sd-trigger="store"]');
  const input = h.root.querySelector('[data-sd-search]');
  h.dispatch('compositionstart', input); input.value = '广州'; h.dispatch('input', input);
  assert.equal(h.root.querySelector('[data-sd-search]'), input);
  h.dispatch('compositionend', input);
  assert.equal(h.root.querySelectorAll('[data-sd-option]').length, 1);
  assert.equal(h.root.querySelector('[data-sd-option]').dataset.sdOption, 'S2');
});

test('switching dimensions works while a menu is open and reset clears all conditions and business state', () => {
  const h = setup(); h.click('[data-sd-trigger="region"]'); h.click('[data-sd-option="brand:传祺|region:华东大区"]');
  h.click('[data-sd-dimension="geography"]');
  assert.equal(h.model.applied.dimensionMode, 'geography');
  assert.deepEqual(h.model.applied.region, []);
  assert.deepEqual(h.root.querySelector('#storeDashboardDimensionFilters').querySelectorAll('[data-sd-control]').map(node => node.dataset.sdControl), ['brand', 'province', 'city', 'store']);
  assert.equal(h.calls.dimension.length, 1); assert.equal(h.calls.dimension[0].cleared, true);
  h.click('[data-sd-reset]');
  assert.equal(h.model.applied.dimensionMode, 'organization');
  assert.equal(h.calls.reset, 1); assert.equal(h.calls.change.at(-1).reset, true);
  assert.equal(h.root.querySelector('[data-sd-extra]').hidden, true);
});

test('Escape restores focus, outside clicks close menus and viewport positioning stays inside the screen', () => {
  const h = setup(); h.click('[data-sd-trigger="store"]');
  const menu = h.root.querySelector('.sd-filter-menu');
  assert.equal(menu.style.left, '-236px'); assert.equal(menu.style.width, '420px');
  assert.equal(menu.style.top, '188px');
  const event = h.dispatch('keydown', h.root.querySelector('[data-sd-search]'), { key: 'Escape' });
  assert.equal(event.defaultPrevented, true); assert.equal(h.root.querySelector('.sd-filter-menu'), null);
  assert.equal(h.document.activeElement.dataset.sdTrigger, 'store');
  h.click('[data-sd-trigger="store"]');
  const outside = new Node('div', h.document); h.dispatch('click', outside);
  assert.equal(h.root.querySelector('.sd-filter-menu'), null);
  h.instance.destroy();
  assert.equal(h.document.listeners.click.size, 0); assert.equal(h.window.listeners.resize.size, 0);
});

test('menu positions above its control when there is more room and falls back to bounds height', () => {
  const h = setup(); h.click('[data-sd-trigger="store"]');
  const control = h.root.querySelector('[data-sd-control="store"]');
  control.getBoundingClientRect = () => ({ left: 100, right: 330, top: 650, bottom: 694 });
  [...h.window.listeners.resize].forEach(listener => listener());
  const menu = h.root.querySelector('.sd-filter-menu');
  assert.equal(menu.style.left, '0px'); assert.equal(menu.style.top, '-308px');
  control.getBoundingClientRect = () => ({ left: 100, right: 330, top: 100, bottom: 144 });
  [...h.window.listeners.resize].forEach(listener => listener());
  assert.equal(menu.style.top, '52px');
});
