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


function setup(reduced = false, animated = true) {
  const document = { activeElement: null };
  const window = { matchMedia: () => ({ matches: reduced }) }; document.defaultView = window;
  const context = vm.createContext({ window });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../sales-dashboard/source-tabs.js'), 'utf8'), context);
  const animations = [];
  const create = role => {
    const root = new Node('div', document, { 'data-sales-source': role });
    root.innerHTML = '<span class="sales-source-indicator"><span class="sales-source-indicator-labels"></span></span><button data-route="sales-dcc"></button><button data-route="sales-advisor"></button>';
    root.querySelectorAll('[data-route]').forEach(button => { button.setAttribute = (key, value) => button.attributes[key] = value;
      button.click = () => dispatch(root, 'click', button, { detail: 0 }); });
    for (const selector of ['.sales-source-indicator', '.sales-source-indicator-labels']) {
      if (animated) root.querySelector(selector).animate = (frames, timing) => {
        const animation = { frames, timing, cancelled: false, cancel() { this.cancelled = true; } }; animations.push(animation); return animation;
      };
    }
    return { root, instance: window.SalesSourceTabs.mount(root) };
  };
  function dispatch(root, type, target, values = {}) {
    const event = { target, preventDefault() { this.defaultPrevented = true; }, ...values };
    [...(root.listeners[type] || [])].forEach(fn => fn(event)); return event;
  }
  return { document, animations, create, dispatch };
}

test('source tabs initialize selected aria and tab order without animation', () => {
  const h = setup(), a = h.create('dcc');
  const buttons = a.root.querySelectorAll('[data-route]');
  assert.equal(buttons[0].attributes['aria-selected'], 'true'); assert.equal(buttons[0].tabIndex, 0);
  assert.equal(buttons[1].attributes['aria-selected'], 'false'); assert.equal(buttons[1].tabIndex, -1);
  assert.equal(h.animations.length, 0);
});
test('pointer navigation animates the slider and clipped labels, and reversal disposes old motion', () => {
  const h = setup(), a = h.create('dcc');
  h.dispatch(a.root, 'click', a.root.querySelector('[data-route="sales-advisor"]'), { detail: 1 }); a.instance.destroy();
  const b = h.create('advisor'); assert.equal(h.animations.length, 2); assert.equal(h.animations[0].timing.duration, 180);
  assert.equal(h.animations[0].frames[1].transform, 'translateX(100%)');
  h.dispatch(b.root, 'click', b.root.querySelector('[data-route="sales-dcc"]'), { detail: 1 }); b.instance.destroy();
  assert(h.animations.every(animation => animation.cancelled));
  const c = h.create('dcc'); assert.equal(h.animations.length, 4); assert.equal(h.animations[2].frames[1].transform, 'translateX(0)');
  c.instance.destroy(); assert.equal(c.root.listeners.click.size, 0); assert.equal(c.root.listeners.keydown.size, 0);
});
test('keyboard navigation calls original buttons and restores active focus without motion', () => {
  const h = setup(), a = h.create('dcc'); const button = a.root.querySelector('[data-route="sales-dcc"]');
  const event = h.dispatch(a.root, 'keydown', button, { key: 'End' }); assert.equal(event.defaultPrevented, true); a.instance.destroy();
  const b = h.create('advisor'); assert.equal(h.document.activeElement.dataset.route, 'sales-advisor'); assert.equal(h.animations.length, 0);
  h.dispatch(b.root, 'keydown', h.document.activeElement, { key: 'ArrowLeft' }); b.instance.destroy();
  const c = h.create('dcc'); assert.equal(h.document.activeElement.dataset.route, 'sales-dcc');
  h.dispatch(c.root, 'keydown', h.document.activeElement, { key: 'Home' }); assert.equal(h.animations.length, 0);
});
test('reduced motion and unavailable Web Animations retain source state feedback', () => {
  for (const [reduced, animated] of [[true, true], [false, false]]) {
    const h = setup(reduced, animated), a = h.create('dcc');
    h.dispatch(a.root, 'click', a.root.querySelector('[data-route="sales-advisor"]'), { detail: 1 }); a.instance.destroy();
    const b = h.create('advisor'); assert.equal(h.animations.length, 0);
    assert.equal(b.root.querySelector('[data-route="sales-advisor"]').attributes['aria-selected'], 'true');
  }
});
