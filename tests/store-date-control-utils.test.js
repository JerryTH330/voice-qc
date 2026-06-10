const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderStoreDateControlMarkup
} = require('../store-date-control-utils.js');

test('custom store date control renders trigger first when picker is closed', () => {
  const html = renderStoreDateControlMarkup({
    currentTime: 'custom',
    isOpen: false,
    startLabel: '2026/06/03',
    endLabel: '2026/06/03',
    menuHtml: '<div class="session-menu-panel session-menu-panel-date"></div>'
  });

  assert.match(html, /data-store-date-trigger="true"/);
  assert.doesNotMatch(html, /session-menu-panel-date/);
});

test('custom store date control renders trigger and panel when picker is open', () => {
  const html = renderStoreDateControlMarkup({
    currentTime: 'custom',
    isOpen: true,
    startLabel: '2026\/06\/03',
    endLabel: '2026\/06\/03',
    menuHtml: '<div class="session-menu-panel session-menu-panel-date">日期范围</div>'
  });

  assert.match(html, /data-store-date-trigger="true"/);
  assert.match(html, /session-menu-panel-date/);
});

test('non-custom store date control renders nothing', () => {
  const html = renderStoreDateControlMarkup({
    currentTime: '7',
    isOpen: false,
    startLabel: '2026/06/03',
    endLabel: '2026/06/03',
    menuHtml: '<div class="session-menu-panel session-menu-panel-date"></div>'
  });

  assert.equal(html, '');
});
