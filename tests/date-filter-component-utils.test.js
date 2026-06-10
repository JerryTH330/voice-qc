const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderDateRangeControlMarkup,
  renderDateRangePanelMarkup
} = require('../date-filter-component-utils.js');

test('date range control renders nothing when current value is not custom', () => {
  const html = renderDateRangeControlMarkup({
    currentValue: '7',
    customValue: 'custom',
    isOpen: false,
    startLabel: '2026/06/03',
    endLabel: '2026/06/03',
    dataNamespace: 'store-date',
    menuHtml: '<div class="session-menu-panel session-menu-panel-date"></div>'
  });

  assert.equal(html, '');
});

test('date range control renders trigger and panel with namespace attrs', () => {
  const html = renderDateRangeControlMarkup({
    currentValue: 'custom',
    customValue: 'custom',
    isOpen: true,
    startLabel: '2026/06/03',
    endLabel: '2026/06/03',
    dataNamespace: 'factory-date',
    rootClassName: 'store-date-root',
    triggerClassName: 'session-date-trigger store-date-trigger',
    menuHtml: '<div class="session-menu-panel session-menu-panel-date">日期范围</div>'
  });

  assert.match(html, /data-factory-date-root="true"/);
  assert.match(html, /data-factory-date-trigger="true"/);
  assert.match(html, /session-menu-panel-date/);
});

test('date range panel renders active field and shortcut buttons with namespace attrs', () => {
  const html = renderDateRangePanelMarkup({
    dataNamespace: 'sales-date',
    rangeText: '2026/06/01 至 2026/06/03',
    monthLabel: '2026年6月',
    activeField: 'endDate',
    startLabel: '2026/06/01',
    endLabel: '2026/06/03',
    disablePrevMonth: false,
    disableNextMonth: true,
    cells: [
      null,
      {
        day: 1,
        value: '2026/06/01',
        isDisabled: false,
        inRange: true,
        isStart: true,
        isEnd: false,
        isToday: false
      },
      {
        day: 2,
        value: '2026/06/02',
        isDisabled: true,
        inRange: false,
        isStart: false,
        isEnd: false,
        isToday: false
      }
    ],
    shortcuts: [
      { key: '1', label: '昨日' },
      { key: '7', label: '近7天' }
    ],
    panelStyle: 'left: 0; right: auto;',
    summaryText: '已选择 2026/06/01 至 2026/06/03'
  });

  assert.match(html, /data-sales-date-nav="-1"/);
  assert.match(html, /data-sales-date-nav="1"/);
  assert.match(html, /data-sales-date-field="endDate"/);
  assert.match(html, /data-sales-date-value="2026\/06\/01"/);
  assert.match(html, /data-sales-date-shortcut="1"/);
  assert.match(html, /data-sales-date-apply="true"/);
  assert.match(html, /style="left: 0; right: auto;"/);
  assert.match(html, /session-date-day is-disabled/);
});
