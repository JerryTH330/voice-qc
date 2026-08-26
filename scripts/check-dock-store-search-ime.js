const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
const helperStart = source.indexOf('function syncDockStoreSearchInput');
const start = helperStart >= 0 ? helperStart : source.indexOf("document.addEventListener('input'");
const end = source.indexOf("document.addEventListener('focusin'", start);

assert.notEqual(start, -1, '找不到输入事件监听代码');
assert.notEqual(end, -1, '找不到输入事件监听结束位置');

const listeners = {};
const nextInput = { focus() {}, setSelectionRange() {} };
const document = {
  addEventListener(type, callback) { listeners[type] = callback; },
  querySelector() { return nextInput; }
};
const window = { requestAnimationFrame(callback) { callback(); } };
const dockMenuState = { openMenu: 'store', storeQuery: '' };
const storeOverviewState = {};
const dockPaginationState = {};
const badgeFilterState = {};
const badgePaginationState = {};
const noop = () => {};

new Function(
  'document',
  'window',
  'dockMenuState',
  'storeOverviewState',
  'dockPaginationState',
  'badgeFilterState',
  'badgePaginationState',
  'renderDockFilters',
  'renderStoreOverview',
  'renderDockDetail',
  'renderBadgeDetail',
  source.slice(start, end)
)(
  document,
  window,
  dockMenuState,
  storeOverviewState,
  dockPaginationState,
  badgeFilterState,
  badgePaginationState,
  noop,
  noop,
  noop,
  noop
);

const target = {
  value: '北京',
  selectionStart: 2,
  selectionEnd: 2,
  matches(selector) { return selector === '[data-dock-store-search]'; }
};

listeners.input({ target, isComposing: true });
assert.equal(dockMenuState.storeQuery, '', '中文组合输入期间不应提前刷新列表');
assert.equal(typeof listeners.compositionend, 'function', '中文输入完成后必须同步门店搜索词');
listeners.compositionend({ target });
assert.equal(dockMenuState.storeQuery, '北京', '中文输入完成后门店搜索词没有更新');

console.log('门店中文输入搜索回归测试通过');
