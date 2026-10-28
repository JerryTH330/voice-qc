const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function setup(reduced = false) {
  const animations = [], timers = [], handlers = {}, classes = new Set();
  let extra = null, html = '';
  const root = {
    childElementCount: 0,
    classList: { add: name => classes.add(name), contains: name => classes.has(name), toggle(name, active) { active ? classes.add(name) : classes.delete(name); } },
    set innerHTML(value) {
      html = value; this.childElementCount = 1;
      extra = value.includes('data-fo-extra') ? {
        style: {}, attrs: {}, measuredHeight: 112,
        getBoundingClientRect() { return { height: this.measuredHeight }; },
        setAttribute(name, value) { this.attrs[name] = value; },
        removeAttribute(name) { delete this.attrs[name]; },
        animate(frames, options) { const animation = { frames, options, canceled: false, cancel() { this.canceled = true; } }; animations.push(animation); return animation; }
      } : null;
    },
    get innerHTML() { return html; },
    querySelector: selector => selector === '[data-fo-extra]' ? extra : null,
    querySelectorAll: () => [],
    addEventListener: (name, callback) => { handlers[name] = callback; },
    contains: () => true
  };
  const context = vm.createContext({ window: { DimensionSwitcher: require('../shared/dimension-switcher.js'), matchMedia: () => ({matches: reduced}), setTimeout: fn => timers.push(fn) }, document: {addEventListener() {}, removeEventListener() {}} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../factory-dashboard/organization-filter.js'),'utf8'), context);
  const model = context.window.FactoryOrganizationFilter.mount({root, records:[], onChange() {}});
  const click = (attribute = 'data-fo-collapse') => {
    const button = { dataset: {}, hasAttribute: name => name === attribute, getAttribute: () => '' };
    handlers.click({target: {closest: () => button}});
  };
  return {root, classes, animations, timers, model, click, extra: () => extra};
}
test('starts collapsed; expansion matches leads duration, easing and final overflow', () => {
  const ui = setup();
  assert(ui.classes.has('is-collapsed'));
  assert.equal(ui.extra(),null);
  assert(ui.root.innerHTML.indexOf('fo-primary') < ui.root.innerHTML.indexOf('data-fo-collapse'));
  ui.click();
  assert(!ui.classes.has('is-collapsed'));
  const animation = ui.animations[0];
  assert.equal(animation.options.duration,280);
  assert.equal(animation.options.easing,'cubic-bezier(0.22, 1, 0.36, 1)');
  assert.equal(animation.frames[0].height,'0px');
  assert.equal(animation.frames[1].height,'112px');
  animation.onfinish();
  assert.equal(ui.extra().style.overflow,'');
  assert.equal(ui.extra().attrs['aria-hidden'],'false');
});
test('rapid reversal starts at current height and stale callbacks cannot settle new animation', () => {
  const ui = setup(); ui.click();
  const opening = ui.animations[0];
  ui.extra().measuredHeight = 47;
  ui.click();
  const closing = ui.animations[1];
  assert(opening.canceled);
  assert.equal(closing.frames[0].height,'47px');
  assert.equal(closing.frames[1].height,'0px');
  opening.onfinish();
  assert.equal(ui.root._foCollapseAnimation,closing);
  closing.onfinish();
  assert.equal(ui.extra().style.height,'0px');
  assert.equal(ui.extra().attrs['aria-hidden'],'true');
  assert.equal(ui.extra().attrs.inert,'');
  assert.equal(ui.extra().style.pointerEvents,'none');
});
test('reduced motion settles immediately and reset restores collapsed layout', () => {
  const ui = setup(true); ui.click();
  assert.equal(ui.animations.length,0);
  assert.equal(ui.extra().style.height,'');
  ui.click('data-fo-reset');
  assert(ui.classes.has('is-collapsed'));
  assert.equal(ui.extra().style.height,'0px');
  assert.equal(ui.animations.length,0);
});
