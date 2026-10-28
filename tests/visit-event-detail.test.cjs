const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
const markup = fs.readFileSync(path.join(__dirname, '../device-management/index.html'), 'utf8');
const functionNames = [
  'escapeBadgeHtml', 'formatStoreDateDisplay', 'formatStoreDateValue', 'renderBadgeEventIcon',
  'badgeEventTimeToSeconds', 'formatBadgeDurationSeconds', 'formatBadgeEventDuration',
  'buildBadgeEventGroups', 'renderBadgeEventGroup', 'matchesBadgeEventGroupType',
  'syncBadgeEventDateView', 'getBadgeEventDateCells', 'renderBadgeEventDatePanel',
  'prefersBadgeReducedMotion', 'isRecordDrawerMenuVisible', 'beginRecordDrawerMenuRender',
  'closeRecordDrawerMenuState', 'openRecordDrawerMenuState', 'toggleRecordDrawerMenuState',
  'playRecordDrawerMenuMotion', 'renderVisitEventFilters', 'closeVisitEventMenus',
  'handleVisitEventFiltersClick', 'handleVisitEventFiltersKeydown', 'renderVisitEvents', 'renderVisitEventDetail', 'closeModal'
];
function sourceFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  return start < 0 ? '' : source.slice(start, source.indexOf('\n}', start) + 2);
}
function declaration(name) {
  const start = source.indexOf(`const ${name} = `);
  assert.notEqual(start, -1, `${name} must exist in the page`);
  return source.slice(start, source.indexOf(';\n', start) + 1);
}
function createHarness({ reducedMotion = true } = {}) {
  const nodes = {};
  let focused = '';
  const host = {
    innerHTML: '',
    querySelector(selector) {
      if (selector === '.session-menu-panel') return this.innerHTML.includes('class="session-menu-panel') ? { style: {} } : null;
      const attribute = selector.match(/\[([^=\]]+)(?:="([^"]+)")?\]/);
      if (!attribute || !this.innerHTML.includes(attribute[1])) return null;
      return { focus() { focused = selector; } };
    }
  };
  for (const name of ['visitEventDetailTitle', 'visitEventDetailDescription', 'visitEventAdvisorName', 'visitEventStoreName', 'visitEventSn', 'visitEventResultSummary']) nodes[name] = {};
  nodes.visitEventDetailTimeline = { innerHTML: '', classList: { toggle() {} } };
  const animations = [];
  const listeners = {};
  const modalClasses = new Set(['is-visit-detail']);
  const modal = { hidden: false, classList: { contains: (name) => modalClasses.has(name), remove: (name) => modalClasses.delete(name) } };
  const context = vm.createContext({
    ...nodes, visitEventFilterControls: host,
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    document: { addEventListener(name, handler) { listeners[name] = handler; } },
    visitEventDetailModal: modal, badgeUploadDetailModal: { hidden: true }, importModal: {},
    visitDetailTrigger: { isConnected: true, focus() { focused = 'visit-row-detail'; } },
    visitFieldSettingsDraft: null, visitMenuState: { openMenu: null },
    syncBodyScrollLock() {},
    badgeEventIconAssets: { 'power-on': 'power-on.svg', 'power-off': 'power-off.svg' },
    animateBadgeFilterMenu(panel, direction) {
      const animation = { direction, cancel() { this.oncancel?.(); }, commitStyles() {} };
      animations.push(animation);
      return animation;
    },
    showToast(message) { context.lastToast = message; }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../shared/badge-history-data.js'), 'utf8'), context);
  const declarations = ['badgeEventRecords', 'badgeEventTypeOptions', 'badgeEventDefaultFilters',
    'badgeEventFilterState', 'badgeEventMenuState', 'visitEventFilterState', 'visitEventMenuState', 'visitEventMenuMotion'];
  vm.runInContext([...declarations.map(declaration), ...functionNames.map(sourceFunction),
    'Object.assign(globalThis, { badgeEventFilterState, badgeEventMenuState, visitEventFilterState, visitEventMenuState, visitEventMenuMotion });'
  ].join('\n'), context);
  for (const name of ['click', 'keydown']) {
    const start = source.indexOf(`document.addEventListener('${name}', (event) => {`);
    vm.runInContext(source.slice(start, source.indexOf('\n});', start) + 4), context);
  }
  function clickEvent(attribute, value = '', inside = true) {
    const datasetKey = attribute.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const element = { dataset: { [datasetKey]: value } };
    return { target: { closest(selector) {
      if (selector === '#visitEventFilters') return inside ? host : null;
      return selector === `[${attribute}]` ? element : null;
    } } };
  }
  return {
    context, host, nodes, animations, listeners, modal, focused: () => focused,
    click(attribute, value = '', inside = true) {
      return context.handleVisitEventFiltersClick(clickEvent(attribute, value, inside));
    },
    dispatchClick(attribute, value = '') { listeners.click(clickEvent(attribute, value)); },
    key(key) {
      const event = { key, preventDefault() { this.prevented = true; }, target: { closest() { return null; } } };
      const handled = context.handleVisitEventFiltersKeydown(event);
      return { handled, prevented: event.prevented };
    }
  };
}
const visit = (overrides = {}) => ({
  badgeSn: 'MN-BDG-004792', date: '2026-08-11', advisor: '黄宇辰', store: '杭州奥体',
  detailText: '工牌未录音', startTime: '18:31:35', endTime: '18:31:55', ...overrides
});

test('opening the visit drawer provides interactive date and event-type controls', () => {
  const h = createHarness();
  assert.match(markup, /class="badge-record-drawer-controls visit-event-filter-preview" id="visitEventFilters"/);
  h.context.renderVisitEventDetail(visit());
  assert.match(h.host.innerHTML, /data-visit-event-date-trigger/);
  assert.match(h.host.innerHTML, /data-visit-event-type-trigger/);
  assert.doesNotMatch(h.host.innerHTML, /readonly|<select disabled/);
  assert.match(h.host.innerHTML, /2026\/08\/11/);
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 6 条/);
});

test('the calendar opens, navigates months, and selects a date without changing the reference drawer', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit());
  const reference = JSON.stringify([h.context.badgeEventFilterState, h.context.badgeEventMenuState]);
  h.click('data-visit-event-date-trigger');
  assert.match(h.host.innerHTML, /2026年8月/);
  assert.match(h.host.innerHTML, /is-start is-end[^>]+data-visit-event-date-value="2026-08-11"/);
  h.click('data-visit-event-date-nav', '-1');
  assert.match(h.host.innerHTML, /2026年7月/);
  assert.equal(h.context.visitEventFilterState.date, '2026-08-11');
  h.click('data-visit-event-date-value', '2026-07-31');
  assert.match(h.host.innerHTML, /2026\/07\/31/);
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  assert.match(h.nodes.visitEventResultSummary.textContent, /2026-07-31 · 共 0 条/);
  assert.match(h.nodes.visitEventDetailTimeline.innerHTML, /所选日期没有工牌事件/);
  assert.equal(JSON.stringify([h.context.badgeEventFilterState, h.context.badgeEventMenuState]), reference);
});

test('date changes query only the current SN and reset restores the original visit date', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit({ date: '2026-08-12' }));
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 0 条/);
  h.click('data-visit-event-date-trigger');
  h.click('data-visit-event-date-value', '2026-08-11');
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 6 条/);
  assert.doesNotMatch(h.nodes.visitEventDetailTimeline.innerHTML, /15:43:00|16:15:00/);
  h.click('data-visit-event-type-trigger');
  h.click('data-visit-event-type-value', 'recording');
  h.click('data-visit-event-reset');
  assert.equal(h.context.visitEventFilterState.date, '2026-08-12');
  assert.equal(h.context.visitEventFilterState.type, 'all');
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 0 条/);
});

test('all six type choices filter complete groups, preserve recording durations, and show empty results', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit({ badgeSn: 'MN-BDG-004821' }));
  const expectations = [
    ['all', 11, '工牌开机'], ['power-on', 2, '工牌开机'], ['power-off', 2, '工牌关机'],
    ['recording', 4, '2小时31分57秒'], ['charging', 2, '0小时58分59秒'], ['low-battery', 1, '剩余电量 19%']
  ];
  for (const [type, count, content] of expectations) {
    h.click('data-visit-event-type-trigger');
    assert.equal((h.host.innerHTML.match(/data-visit-event-type-value=/g) || []).length, 6);
    h.click('data-visit-event-type-value', type);
    assert.match(h.nodes.visitEventResultSummary.textContent, new RegExp(`共 ${count} 条`));
    assert.ok(h.nodes.visitEventDetailTimeline.innerHTML.includes(content));
    if (type !== 'all' && type !== 'power-on') assert.doesNotMatch(h.nodes.visitEventDetailTimeline.innerHTML, /<strong>工牌开机<\/strong>/);
  }
  h.context.renderVisitEventDetail(visit());
  h.click('data-visit-event-type-trigger');
  h.click('data-visit-event-type-value', 'charging');
  assert.match(h.nodes.visitEventDetailTimeline.innerHTML, /所选日期没有该类型事件/);
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 0 条/);
});

test('Escape and outside clicks close the menu, selections return focus, and reopening clears filters', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit());
  h.click('data-visit-event-type-trigger');
  assert.equal(h.key('Escape').handled, true);
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  assert.equal(h.focused(), '[data-visit-event-type-trigger]');
  assert.equal(h.key('Escape').handled, false, 'a second Escape can close the drawer');
  h.click('data-visit-event-type-trigger');
  h.click('data-visit-event-type-value', 'recording');
  assert.equal(h.focused(), '[data-visit-event-type-trigger]');
  h.click('data-visit-event-date-trigger');
  assert.equal(h.click('data-unrelated', '', false), false);
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  h.context.renderVisitEventDetail(visit({ badgeSn: 'MN-BDG-004845', date: '2026-08-12', detailText: '工牌未开机' }));
  assert.equal(h.context.visitEventFilterState.type, 'all');
  assert.match(h.nodes.visitEventDetailTimeline.innerHTML, /到访当天没有开机、关机、录音等工牌事件/);
});

test('closing animation completes before focus restoration and rapid switching cancels stale animation', () => {
  const h = createHarness({ reducedMotion: false });
  h.context.renderVisitEventDetail(visit());
  h.click('data-visit-event-type-trigger');
  h.animations.at(-1).onfinish();
  h.click('data-visit-event-type-value', 'recording');
  assert.equal(h.context.visitEventMenuState.closingMenu, 'type');
  h.animations.at(-1).onfinish();
  assert.equal(h.context.visitEventMenuState.closingMenu, null);
  assert.equal(h.focused(), '[data-visit-event-type-trigger]');
  h.click('data-visit-event-date-trigger');
  const oldAnimation = h.animations.at(-1);
  h.click('data-visit-event-type-trigger');
  oldAnimation.onfinish?.();
  assert.equal(h.context.visitEventMenuState.openMenu, 'type');
  assert.match(h.host.innerHTML, /role="listbox"/);
  h.context.closeVisitEventMenus(true);
  assert.doesNotMatch(h.host.innerHTML, /role="listbox"/);
});

test('calendar navigation supports leap February and year boundaries', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit({ date: '2024-02-29' }));
  h.click('data-visit-event-date-trigger');
  assert.match(h.host.innerHTML, /data-visit-event-date-value="2024-02-29"/);
  assert.doesNotMatch(h.host.innerHTML, /2024-02-30/);
  h.context.renderVisitEventDetail(visit({ date: '2026-12-31' }));
  h.click('data-visit-event-date-trigger');
  h.click('data-visit-event-date-nav', '1');
  assert.match(h.host.innerHTML, /2027年1月/);
});

test('page event delegation opens the menu from the whole control and Escape closes menu before drawer', () => {
  const h = createHarness();
  h.context.renderVisitEventDetail(visit());
  h.dispatchClick('data-visit-event-filter', 'type');
  assert.match(h.host.innerHTML, /role="listbox"/);
  h.dispatchClick('data-visit-event-type-value', 'recording');
  assert.match(h.nodes.visitEventResultSummary.textContent, /共 4 条/);
  h.dispatchClick('data-visit-event-date-trigger');
  h.listeners.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  assert.equal(h.modal.hidden, false);
  h.listeners.keydown({ key: 'Escape' });
  assert.equal(h.modal.hidden, true);
  assert.equal(h.focused(), 'visit-row-detail');
  h.context.renderVisitEventDetail(visit());
  h.dispatchClick('data-visit-event-date-trigger');
  h.context.closeModal(h.modal);
  assert.equal(h.context.visitEventMenuState.openMenu, null);
  assert.doesNotMatch(h.host.innerHTML, /role="dialog"/);
});
