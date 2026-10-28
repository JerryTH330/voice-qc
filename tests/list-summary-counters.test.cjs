const test = require('node:test');
const assert = require('node:assert/strict');
const { createController, formatNumber } = require('../shared/list-summary-counters.js');
function setup() {
  let serial = 0, observe, overlay = false;
  const frames = new Map(), events = new Map(), mediaEvents = new Map();
  const motion = { matches: false, addEventListener: (key, callback) => mediaEvents.set(key, callback), removeEventListener: key => mediaEvents.delete(key) };
  const host = { location: { pathname: '/device-management/index.html', hash: '#stores' },
    document: { hidden: false, body: {}, querySelector: () => overlay ? {} : null, getElementById: () => null,
      addEventListener: (key, callback) => events.set(key, callback), removeEventListener: key => events.delete(key) },
    matchMedia: () => motion,
    getComputedStyle: root => ({ visibility: root.visibility || 'visible' }),
    requestAnimationFrame(callback) { frames.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener: (key, callback) => events.set(key, callback), removeEventListener: key => events.delete(key),
    MutationObserver: class { constructor(callback) { observe = callback; } observe() {} disconnect() {} }
  };
  const root = { isConnected: true, shown: true, blocked: false, scope: null,
    getClientRects() { return this.shown ? [{}] : []; },
    closest(selector) { return selector.includes('[hidden]') ? this.blocked ? {} : null : this.scope; },
    contains(other) { return other === this; } };
  function node(text = '') { return { textContent: text, parentElement: root, style: {}, attributes: {},
    contains() { return false; }, setAttribute(key, value) { this.attributes[key] = value; } }; }
  const counter = createController(host);
  function frame(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)); }
  return { host, root, node, counter, frame, motion, frames, events, mutate: records => observe(records),
    reduce(value) { motion.matches = value; mediaEvents.get('change')(); }, overlay(value) { overlay = value; } };
}

test('the reference cubic easing, duration, staggering and numeric formatting are shared', () => {
  const h = setup(), first = h.node(), second = h.node();
  h.counter.update('summary', [{node:first,value:1000,grouping:true},{node:second,value:1000}], {root:h.root});
  assert.equal(first.textContent,'0'); h.frame(0); h.frame(80); assert.equal(first.textContent,'0');
  h.frame(540); assert.equal(first.textContent,'875'); assert.ok(Number(second.textContent)<875);
  h.frame(1055); assert.equal(first.textContent,'1,000'); assert.equal(second.textContent,'1000'); assert.equal(h.frames.size,0);
  assert.equal(first.attributes['aria-label'],'1,000');
  assert.equal(formatNumber(84,{decimals:1,suffix:'%'}),'84.0%');
});

test('hidden initialization waits until the list becomes visible, then every later entry starts at zero', () => {
  const h=setup(), n=h.node(); h.root.shown=false;
  h.counter.update('summary',[{node:n,value:142}],{root:h.root});
  assert.equal(n.textContent,'142'); assert.equal(h.frames.size,0);
  h.root.shown=true; h.counter.refresh(); assert.equal(n.textContent,'0'); h.frame(0);h.frame(2000);assert.equal(n.textContent,'142');
  h.root.shown=false;h.counter.refresh();h.root.shown=true;h.counter.refresh();assert.equal(n.textContent,'0');
});

test('filter changes continue from the currently displayed value, including rapid reversals', () => {
  const h=setup(), n=h.node(); h.counter.update('summary',[{node:n,value:1000}],{root:h.root});h.frame(0);h.frame(540);
  const visible=n.textContent; h.counter.update('summary',[{node:n,value:20}],{root:h.root});assert.equal(n.textContent,visible);
  h.frame(550);h.frame(1100);assert.ok(Number(n.textContent)<Number(visible));
  const reversed=n.textContent;h.counter.update('summary',[{node:n,value:2000}],{root:h.root});assert.equal(n.textContent,reversed);
  h.frame(1110);h.frame(3000);assert.equal(n.textContent,'2000');
});

test('recreated count nodes keep an in-flight animation and unchanged refreshes do not replay it', () => {
  const h=setup(), n=h.node();h.counter.update('summary',[{node:n,value:100}],{root:h.root});h.frame(0);h.frame(540);
  const replacement=h.node('100');h.counter.update('summary',[{node:replacement,value:100}],{root:h.root});
  assert.equal(replacement.textContent,n.textContent);h.frame(1100);assert.equal(replacement.textContent,'100');
  h.counter.update('summary',[{node:h.node('100'),value:100}],{root:h.root});assert.equal(h.frames.size,0);
});

test('view changes and same-panel drilldown routes replay without altering the target', () => {
  const h=setup(), n=h.node();h.counter.update('summary',[{node:n,value:50}],{root:h.root,context:'leads'});h.frame(0);h.frame(2000);
  h.counter.update('summary',[{node:n,value:50}],{root:h.root,context:'customers'});assert.equal(n.textContent,'0');h.frame(2100);h.frame(4000);
  h.host.location.hash='#store-badges?store=one';h.counter.refresh();assert.equal(n.textContent,'0');
});

test('opening a drawer after moving its existing content counts as a new list entry', () => {
  const h=setup(), n=h.node();h.counter.update('events',[{node:n,value:8,format:value=>`共 ${Math.round(value)} 组记录`}],{root:h.root});h.frame(0);h.frame(2000);
  h.root.scope={id:'drawer'};h.counter.refresh();assert.equal(n.textContent,'共 0 组记录');h.frame(2100);h.frame(4000);assert.equal(n.textContent,'共 8 组记录');
  h.root.blocked=true;h.counter.refresh();h.root.blocked=false;h.counter.refresh();assert.equal(n.textContent,'共 0 组记录');
});

test('date prefixes, percent suffixes, zero and missing values retain their exact display semantics', () => {
  const h=setup(), date=h.node(), rate=h.node(), missing=h.node(), zero=h.node();
  h.counter.update('summary',[{node:date,value:9,format:v=>`2026-10-15 · 共 ${Math.round(v)} 条`},{node:rate,value:84,decimals:1,suffix:'%'},{node:missing,value:null},{node:zero,value:0}],{root:h.root});
  assert.equal(date.textContent,'2026-10-15 · 共 0 条');assert.equal(missing.textContent,'—');assert.equal(zero.textContent,'0');
  h.frame(0);h.frame(3000);assert.equal(rate.textContent,'84.0%');assert.equal(date.textContent,'2026-10-15 · 共 9 条');
  h.counter.update('summary',[{node:date,value:NaN,placeholder:'/'}],{root:h.root});assert.equal(date.textContent,'/');
});

test('reduced motion immediately displays final values, even when enabled mid-animation', () => {
  const h=setup(), n=h.node();h.motion.matches=true;h.counter.update('summary',[{node:n,value:620}],{root:h.root});assert.equal(n.textContent,'620');assert.equal(h.frames.size,0);
  h.motion.matches=false;h.counter.update('summary',[{node:n,value:900}],{root:h.root});h.frame(0);h.frame(400);h.reduce(true);assert.equal(n.textContent,'900');h.frame(3000);assert.equal(h.frames.size,0);
});

test('visibility observers ignore numeric frame writes and react to ancestor or shell visibility changes', () => {
  const h=setup(), n=h.node();h.counter.update('summary',[{node:n,value:20}],{root:h.root});h.frame(0);h.frame(2000);
  h.mutate([{target:n}]);assert.equal(h.frames.size,0);
  h.overlay(true);h.mutate([{target:{contains:root=>root===h.root}}]);h.frame(2100);
  h.overlay(false);h.mutate([{target:{contains:root=>root===h.root}}]);h.frame(2200);assert.equal(n.textContent,'0');
  h.counter.destroy();assert.equal(h.frames.size,0);
});
