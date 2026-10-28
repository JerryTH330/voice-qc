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
    if (selector.startsWith('#')) return this.attributes.id === selector.slice(1);
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


Node.prototype.appendChild = function(node) {
  if (node.parentElement) node.parentElement.children.splice(node.parentElement.children.indexOf(node), 1);
  node.parentElement = this; this.children.push(node); return node;
};
Node.prototype.replaceChildren = function(...nodes) {
  this.children.forEach(node => { node.parentElement = null; }); this.children = [];
  nodes.forEach(node => this.appendChild(node));
};
Node.prototype.insertBefore = function(node, reference) {
  if (node === reference) return node;
  if (node.parentElement) node.parentElement.children.splice(node.parentElement.children.indexOf(node), 1);
  const index = reference ? this.children.indexOf(reference) : this.children.length;
  assert(index >= 0); this.children.splice(index, 0, node); node.parentElement = this; return node;
};
Object.defineProperty(Node.prototype, 'nextSibling', { get() {
  return this.parentElement?.children[this.parentElement.children.indexOf(this) + 1] || null;
} });
const source = fs.readFileSync(path.resolve(__dirname, '../device-management/page.js'), 'utf8');
function fn(name) {
  const start = source.indexOf('function ' + name + '('), rest = source.slice(start), end = rest.indexOf('\n}');
  assert(start >= 0 && end >= 0); return rest.slice(0, end + 2);
}
function setup() {
  const document = {};
  const root = new Node('div', document);
  root.innerHTML = '<div id="visitFilterControls" class="is-collapsed"><div id="visitDimensionSwitcher"></div><div class="badge-filter-primary"><div id="visitDimensionFilters"></div><div class="visits-filter-actions"></div></div><div id="visitAdvancedFilters" hidden><div id="advancedGrid"><div id="visitPersonnelFilters"></div><div id="visitEnumFilters"></div><div class="visit-time-field" data-visit-filter-key="time"><button data-visit-time-trigger></button><div id="visitTimePanel"></div></div><input data-visit-filter-key="businessId" value="BIZ-123"><input data-visit-filter-key="leadId"><input data-visit-filter-key="customerKeyword"></div></div></div>';
  document.getElementById = id => root.querySelector('#' + id);
  document.querySelector = selector => root.querySelector(selector);
  document.querySelectorAll = selector => root.querySelectorAll(selector);
  const fields = require('../device-management/visit-organization-filter.js').fields;
  const state = { active: false }, draft = { dimensionMode: 'organization' };
  const context = vm.createContext({ document, visitStoreDrilldownState: state,
    window: { VisitOrganizationFilter: { fields }, DimensionSwitcher: { render: () => '<span>维度</span>', sync() {} } },
    visitMatchingFilterKeys: new Set(), visitFieldSettingsModel: { isFilterVisible: () => true }, visitFieldSettingsState: {},
    visitOrganizationModel: { draft, dimensionKeys: () => draft.dimensionMode === 'organization' ? ['brand', 'region', 'zone', 'store'] : ['brand', 'province', 'city', 'store'] },
    visitMenuState: {}, visitMenuMotion: {}, beginRecordDrawerMenuRender: () => true,
    positionVisitFilterMenu() {}, syncVisitTimeFilterControl() {}, playRecordDrawerMenuMotion() {},
    renderVisitMultiSelect: key => '<button data-visit-select-trigger="' + key + '">' + key + '</button>'
  });
  vm.runInContext(fn('isVisitFilterVisible') + '\n' + fn('renderVisitOrganizationFilters'), context);
  return { root, document, state, draft, render: context.renderVisitOrganizationFilters };
}
function hasHiddenAncestor(node) {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) if (parent.hasAttribute('hidden')) return true;
  return false;
}

test('both store dimensions promote four controls while preserving the existing date and business query nodes', () => {
  for (const dimensionMode of ['organization', 'geography']) {
    const h = setup(); h.draft.dimensionMode = dimensionMode;
    const time = h.root.querySelector('[data-visit-filter-key="time"]'), panel = h.document.getElementById('visitTimePanel');
    const business = h.root.querySelector('[data-visit-filter-key="businessId"]');
    let clicks = 0; const button = time.querySelector('[data-visit-time-trigger]'); button.addEventListener('click', () => clicks++);
    h.state.active = true; h.render();
    const primary = h.document.getElementById('visitDimensionFilters');
    assert.deepEqual(primary.children, [h.document.getElementById('visitEnumFilters'), time, business]);
    assert.equal(h.document.getElementById('visitDimensionSwitcher').hidden, true);
    assert.equal(h.document.getElementById('visitPersonnelFilters').children.length, 0);
    assert.equal(hasHiddenAncestor(time), false);
    assert.equal(hasHiddenAncestor(h.root.querySelector('[data-visit-select-trigger="source"]')), false);
    assert.equal(hasHiddenAncestor(h.root.querySelector('[data-visit-select-trigger="status"]')), false);
    assert.equal(hasHiddenAncestor(business), false); assert.equal(business.value, 'BIZ-123');
    assert.equal(primary.querySelectorAll('[data-visit-select-trigger]').length + primary.querySelectorAll('[data-visit-filter-key]').length, 4);
    assert.equal(hasHiddenAncestor(h.root.querySelector('[data-visit-filter-key="leadId"]')), true);
    let moves = 0; const replace = primary.replaceChildren;
    primary.replaceChildren = function(...nodes) { moves++; return replace.apply(this, nodes); };
    for (let index = 0; index < 3; index++) h.render();
    assert.equal(moves, 0);
    assert.equal(h.root.querySelector('[data-visit-filter-key="time"]'), time);
    assert.equal(h.document.getElementById('visitTimePanel'), panel);
    assert.equal(button.listeners.click.size, 1); [...button.listeners.click].forEach(handler => handler()); assert.equal(clicks, 1);
  }
});
test('leaving the store restores original filter order and reentry keeps the same date node and input state', () => {
  const h = setup(), time = h.root.querySelector('[data-visit-filter-key="time"]');
  const controls = h.document.getElementById('visitFilterControls');
  h.state.active = true; h.render(); controls.classList.toggle('is-collapsed', false); h.render();
  assert.equal(time.parentElement, h.document.getElementById('visitDimensionFilters'));
  h.state.active = false; h.render();
  const advanced = h.document.getElementById('advancedGrid');
  assert.deepEqual(advanced.children.slice(0, 4), [h.document.getElementById('visitPersonnelFilters'), h.document.getElementById('visitEnumFilters'), time, h.root.querySelector('[data-visit-filter-key="businessId"]')]);
  assert.equal(controls.classList.contains('is-store-drilldown'), false);
  assert.equal(h.document.getElementById('visitDimensionSwitcher').hidden, false);
  assert.equal(h.document.getElementById('visitDimensionFilters').children.length, 4);
  assert.equal(h.document.getElementById('visitPersonnelFilters').children.length, 3);
  controls.classList.add('is-collapsed'); h.state.active = true; h.render();
  assert.equal(time.parentElement, h.document.getElementById('visitDimensionFilters'));
  assert.equal(h.root.querySelector('[data-visit-filter-key="businessId"]').value, 'BIZ-123');
});
