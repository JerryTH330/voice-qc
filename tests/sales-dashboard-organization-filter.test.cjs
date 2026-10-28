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

function setup(withBusiness = false) {
  const document = { listeners: {}, activeElement: null, documentElement: { clientWidth: 1100 },
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener };
  const calls = { change: [], reset: 0, before: 0, sync: 0, dimension: [] };
  const window = { innerWidth: 1100, innerHeight: 800, matchMedia: () => ({ matches: true }),
    clearTimeout() {}, setTimeout: () => 1, listeners: {},
    addEventListener: Node.prototype.addEventListener, removeEventListener: Node.prototype.removeEventListener,
    DimensionSwitcher: {
      render: ({ mode, namespace, panelId }) => `<div data-dimension-switcher data-dimension-namespace="${namespace}"><button data-so-dimension="organization" data-dimension-option="organization" aria-controls="${panelId}" aria-selected="${mode === 'organization'}"></button><button data-so-dimension="geography" data-dimension-option="geography" aria-controls="${panelId}" aria-selected="${mode === 'geography'}"></button></div>`,
      sync() { calls.sync++; }, change(root, options) { calls.dimension.push(options); }, handleKeydown: () => false
    }
  };
  document.defaultView = window;
  const root = new Node('div', document);
  const business = new Node('div', document);
  const businessButton = new Node('button', document, { 'data-existing-business': '' });
  businessButton.addEventListener('click', () => {});
  if (withBusiness) {
    business.attributes.class = 'sales-role-nav-filters';
    const scene = new Node('div', document, { class: 'sales-role-scene-host' });
    const date = new Node('div', document, { class: 'sales-role-date-host' });
    scene.innerHTML = '<button data-existing-scene>业务场景</button>';
    date.appendChild(businessButton); business.appendChild(scene); business.appendChild(date);
  } else business.appendChild(businessButton);
  const context = vm.createContext({ window });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../sales-dashboard/organization-filter.js'), 'utf8'), context);
  const model = createModel(dealers, records, { mode: 'matching' });
  const instance = window.SalesDashboardOrganizationFilter.mount({ root, model, businessRoot: withBusiness ? business : null,
    onChange: change => calls.change.push(change), onReset: () => calls.reset++, onBeforeChange: () => calls.before++ });
  function dispatch(type, target, values = {}) {
    const event = { target, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }, ...values };
    if (type === 'click') [...(document.listeners.click || [])].forEach(fn => fn(event));
    [...(root.listeners[type] || [])].forEach(fn => fn(event));
    return event;
  }
  const click = selector => dispatch('click', root.querySelector(selector));
  return { root, business, businessButton, model, instance, calls, document, window, click, dispatch };
}

test('sales component has four hierarchy fields and leaves external business nodes alone', () => {
  const h = setup();
  assert.deepEqual(h.root.querySelector('#salesDashboardDimensionFilters').querySelectorAll('[data-so-control]').map(node => node.dataset.soControl), ['brand', 'region', 'zone', 'store']);
  assert.deepEqual(h.root.querySelector('[data-so-personnel]').querySelectorAll('[data-so-control]').map(node => node.dataset.soControl), ['advisor', 'patroler', 'governor']);
  const extra = h.root.querySelector('[data-so-extra]');
  assert.equal(extra.hidden, true); assert.equal(extra.inert, true);
  h.click('[data-so-collapse]');
  assert.equal(extra.hidden, false); assert.equal(extra.inert, false);
  h.businessButton.focus(); h.instance.render();
  assert.equal(h.businessButton.listeners.click.size, 1);
  assert.equal(h.document.activeElement, h.businessButton);
  assert.equal(h.business.parentElement, null);
});

test('selecting an advisor applies only that person immediately and preserves menu order until reopened', () => {
  const h = setup(); h.click('[data-so-collapse]'); h.click('[data-so-trigger="advisor"]');
  const before = h.root.querySelectorAll('[data-so-option]').map(node => node.dataset.soOption);
  const value = before.at(-1);
  h.click(`[data-so-option="${value}"]`);
  assert.deepEqual(records.filter(h.model.matches).map(record => record.advisorKey), [value]);
  assert.deepEqual(h.root.querySelectorAll('[data-so-option]').map(node => node.dataset.soOption), before);
  h.instance.closeMenu(); h.click('[data-so-trigger="advisor"]');
  assert.equal(h.root.querySelector('[data-so-option]').dataset.soOption, value);
  assert.equal(h.calls.change.length, 1);
});

test('search and select-all affect only visible matches and keep unrelated selections', () => {
  const h = setup(); h.click('[data-so-trigger="store"]');
  h.click('[data-so-option="S1"]');
  const input = h.root.querySelector('[data-so-search]'); input.value = 'a02';
  h.dispatch('input', input);
  assert.equal(h.root.querySelectorAll('[data-so-option]').length, 1);
  h.click('[data-so-all]');
  assert.deepEqual([...h.model.applied.store].sort(), ['S1', 'S2']);
  h.click('[data-so-all]');
  assert.deepEqual(h.model.applied.store, ['S1']);
});

test('composition search keeps the original input until composition ends', () => {
  const h = setup(); h.click('[data-so-trigger="store"]');
  const input = h.root.querySelector('[data-so-search]');
  h.dispatch('compositionstart', input); input.value = '广州'; h.dispatch('input', input);
  assert.equal(h.root.querySelector('[data-so-search]'), input);
  h.dispatch('compositionend', input);
  assert.equal(h.root.querySelectorAll('[data-so-option]').length, 1);
  assert.equal(h.root.querySelector('[data-so-option]').dataset.soOption, 'S2');
});

test('switching dimensions works while a menu is open and reset clears only component conditions', () => {
  const h = setup(); h.click('[data-so-trigger="region"]'); h.click('[data-so-option="brand:传祺|region:华东大区"]');
  h.click('[data-so-dimension="geography"]');
  assert.equal(h.model.applied.dimensionMode, 'geography');
  assert.deepEqual(h.model.applied.region, []);
  assert.deepEqual(h.root.querySelector('#salesDashboardDimensionFilters').querySelectorAll('[data-so-control]').map(node => node.dataset.soControl), ['brand', 'province', 'city', 'store']);
  assert.equal(h.calls.dimension.length, 1); assert.equal(h.calls.dimension[0].cleared, true);
  h.click('[data-so-reset]');
  assert.equal(h.model.applied.dimensionMode, 'organization');
  assert.equal(h.calls.reset, 1); assert.equal(h.calls.change.at(-1).reset, true);
  assert.equal(h.root.querySelector('[data-so-extra]').hidden, true);
});

test('Escape restores focus, outside clicks close menus and viewport positioning stays inside the screen', () => {
  const h = setup(); h.click('[data-so-trigger="store"]');
  const menu = h.root.querySelector('.so-filter-menu');
  assert.equal(menu.style.left, '-236px'); assert.equal(menu.style.width, '420px');
  assert.equal(menu.style.top, '188px');
  const event = h.dispatch('keydown', h.root.querySelector('[data-so-search]'), { key: 'Escape' });
  assert.equal(event.defaultPrevented, true); assert.equal(h.root.querySelector('.so-filter-menu'), null);
  assert.equal(h.document.activeElement.dataset.soTrigger, 'store');
  h.click('[data-so-trigger="store"]');
  const outside = new Node('div', h.document); h.dispatch('click', outside);
  assert.equal(h.root.querySelector('.so-filter-menu'), null);
  h.instance.destroy();
  assert.equal(h.document.listeners.click.size, 0); assert.equal(h.window.listeners.resize.size, 0);
});

test('menu positions above its control when there is more room and falls back to bounds height', () => {
  const h = setup(); h.click('[data-so-trigger="store"]');
  const control = h.root.querySelector('[data-so-control="store"]');
  control.getBoundingClientRect = () => ({ left: 100, right: 330, top: 650, bottom: 694 });
  [...h.window.listeners.resize].forEach(listener => listener());
  const menu = h.root.querySelector('.so-filter-menu');
  assert.equal(menu.style.left, '0px'); assert.equal(menu.style.top, '-308px');
  control.getBoundingClientRect = () => ({ left: 100, right: 330, top: 100, bottom: 144 });
  [...h.window.listeners.resize].forEach(listener => listener());
  assert.equal(menu.style.top, '52px');
});


test('page connection preserves personal and business nodes during component choices and disposes on route replacement', () => {
  const h = setup(); h.instance.destroy();
  const host = new Node('div', h.document);
  const root = new Node('div', h.document, { 'data-sales-organization-filters': 'dcc' });
  host.appendChild(root);
  const profile = new Node('span', h.document, { id: 'profile-name' }); profile.textContent = '张琳'; host.appendChild(profile);
  const store = new Node('span', h.document, { id: 'profile-store' }); store.textContent = '上海中心店'; host.appendChild(store);
  const metric = new Node('span', h.document, { id: 'hero-metrics' }); metric.textContent = '6条'; host.appendChild(metric);
  const date = new Node('button', h.document, { id: 'salesRecommendDateControl' }); date.textContent = '原时间范围'; host.appendChild(date);
  date.addEventListener('click', () => {});
  h.document.getElementById = id => host.querySelector('#' + id);
  h.window.__DEVICE_ORGANIZATION_DEALERS = dealers;
  h.window.VisitOrganizationFilter = { createModel };
  let notify, observed, disconnected = false;
  h.window.MutationObserver = class { constructor(callback) { notify = callback; } observe(node, options) { observed = { node, options }; } disconnect() { disconnected = true; } };
  const controller = h.window.SalesDashboardOrganizationFilter.connect(host);
  assert.equal(observed.node, host); assert.deepEqual(plain(observed.options), { childList: true });
  function click(selector) { const event = { target: root.querySelector(selector), preventDefault() {}, stopPropagation() {} }; [...root.listeners.click].forEach(fn => fn(event)); }
  click('[data-so-trigger="brand"]'); click('[data-so-option="brand:传祺"]');
  click('[data-so-dimension="geography"]'); click('[data-so-collapse]'); click('[data-so-reset]');
  assert.equal(host.querySelector('#profile-name'), profile); assert.equal(profile.textContent, '张琳');
  assert.equal(host.querySelector('#profile-store'), store); assert.equal(store.textContent, '上海中心店');
  assert.equal(host.querySelector('#hero-metrics'), metric); assert.equal(metric.textContent, '6条');
  assert.equal(host.querySelector('#salesRecommendDateControl'), date); assert.equal(date.textContent, '原时间范围'); assert.equal(date.listeners.click.size, 1);
  host.children = []; notify();
  assert.equal(h.document.listeners.click.size, 0); assert.equal(h.window.listeners.resize.size, 0);
  controller.destroy(); assert.equal(disconnected, true);
});

const plain = value => JSON.parse(JSON.stringify(value));

test('component choices stay independent for cloud-call and badge templates without replacing either profile', () => {
  const h = setup(); h.instance.destroy(); const host = new Node('div', h.document);
  let notify;
  h.window.MutationObserver = class { constructor(callback) { notify = callback; } observe() {} disconnect() {} };
  h.window.__DEVICE_ORGANIZATION_DEALERS = dealers; h.window.VisitOrganizationFilter = { createModel };
  h.document.getElementById = id => host.querySelector('#' + id);
  const show = role => {
    host.innerHTML = `<div data-sales-organization-filters="${role}"></div><span id="profile-name"></span><span id="profile-store"></span>`;
    host.querySelector('#profile-name').textContent = role === 'dcc' ? '张琳' : '李昱';
    host.querySelector('#profile-store').textContent = '上海中心店';
    notify?.(); return host.querySelector('[data-sales-organization-filters]');
  };
  let root = show('dcc'); const controller = h.window.SalesDashboardOrganizationFilter.connect(host);
  const click = selector => { const event = { target: root.querySelector(selector), preventDefault() {}, stopPropagation() {} }; [...root.listeners.click].forEach(fn => fn(event)); };
  click('[data-so-dimension="geography"]');
  root = show('advisor');
  assert(root.querySelector('[data-so-control="region"]')); assert.equal(host.querySelector('#profile-name').textContent, '李昱');
  root = show('dcc');
  assert(root.querySelector('[data-so-control="province"]')); assert.equal(host.querySelector('#profile-name').textContent, '张琳');
  controller.destroy();
});

test('template replacement disposes source-tab and business-menu controllers', () => {
  const h = setup(); h.instance.destroy(); const host = new Node('div', h.document);
  let notify, sourceMounted = 0, sourceDestroyed = 0, sceneDestroyed = 0;
  h.window.MutationObserver = class { constructor(callback) { notify = callback; } observe() {} disconnect() {} };
  h.window.__DEVICE_ORGANIZATION_DEALERS = dealers; h.window.VisitOrganizationFilter = { createModel };
  h.window.SalesSourceTabs = { mount() { sourceMounted++; return { destroy() { sourceDestroyed++; } }; } };
  h.document.getElementById = id => host.querySelector('#' + id);
  const show = role => {
    host.innerHTML = `<div class="sales-role-nav"><div class="role-page-switch"></div><div data-sales-organization-filters="${role}"></div><div id="salesReviewSceneControl"></div></div>`;
    host.querySelector('#salesReviewSceneControl').salesSceneFilter = { destroy() { sceneDestroyed++; } };
    notify?.();
  };
  show('dcc'); const controller = h.window.SalesDashboardOrganizationFilter.connect(host);
  assert.equal(sourceMounted, 1); assert.equal(sceneDestroyed, 0);
  show('advisor'); assert.equal(sourceMounted, 2); assert.equal(sourceDestroyed, 1); assert.equal(sceneDestroyed, 1);
  controller.destroy(); assert.equal(sourceDestroyed, 2); assert.equal(sceneDestroyed, 2);
  assert.equal(h.document.listeners.click.size, 0);
});


test('business scene and date share the personnel grid and the same collapse state without replacing nodes', () => {
  const h = setup(true), secondary = h.root.querySelector('.so-filter-secondary');
  const scene = h.business.querySelector('.sales-role-scene-host'), date = h.business.querySelector('.sales-role-date-host');
  assert.equal(h.business.parentElement, secondary);
  assert.deepEqual(secondary.children, [h.root.querySelector('[data-so-personnel]'), h.business]);
  assert.deepEqual(h.root.querySelector('[data-so-personnel]').querySelectorAll('[data-so-control]').map(node => node.dataset.soControl), ['advisor', 'patroler', 'governor']);
  assert.equal(h.root.querySelector('[data-so-extra]').hidden, true);
  h.click('[data-so-collapse]');
  assert.equal(h.root.querySelector('[data-so-extra]').hidden, false);
  assert.equal(h.root.querySelector('[data-so-actions]').parentElement, h.root);
  h.instance.render(); h.click('[data-so-dimension="geography"]');
  assert.equal(h.business.querySelector('.sales-role-scene-host'), scene); assert.equal(h.business.querySelector('.sales-role-date-host'), date);
  assert.equal(h.business.querySelector('[data-existing-business]'), h.businessButton); assert.equal(h.businessButton.listeners.click.size, 1);
  h.click('[data-so-reset]'); assert.equal(h.root.querySelector('[data-so-extra]').hidden, true);
  assert.equal(h.business.parentElement, secondary); assert.equal(h.businessButton.listeners.click.size, 1);
});

test('clicking an integrated business control closes the organization menu before its own handler', () => {
  const h = setup(true); h.click('[data-so-collapse]'); h.click('[data-so-trigger="store"]');
  assert(h.root.querySelector('.so-filter-menu'));
  h.dispatch('click', h.businessButton);
  assert.equal(h.root.querySelector('.so-filter-menu'), null);
  assert.equal(h.businessButton.listeners.click.size, 1);
});
