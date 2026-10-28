const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function sourceFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, name);
  return source.slice(start, source.indexOf('\n}\n', start) + 2);
}

function setup(now = '2026-10-13T12:00:00') {
  let currentTime = now;
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [currentTime])); }
  }
  const organization = { draft: { brand: [], store: [] }, matches: () => true, reset() {}, apply() {} };
  const context = vm.createContext({
    Date: ClockDate,
    window: { VisitOrganizationFilter: { fields: { brand: {}, store: {} } } },
    visitOrganizationModel: organization,
    visitStoreDrilldownState: { active: false },
    visitMatchingFilterKeys: new Set(),
    visitFieldSettingsModel: { getHiddenFilterKeys: () => [] },
    visitFieldSettingsState: {},
    visitMenuState: { openMenu: '', closingMenu: null },
    visitEnumFields: {},
    visitPaginationState: { page: 8, pageSize: 20 },
    visitRecords: [],
    normalizeDeviceQuery: value => String(value || '').trim().toLowerCase(),
    getVisitLeadId: record => record.leadId || '',
    matchesVisitCustomerKeyword: () => true,
    closeVisitFilterMenu() {},
    enforceVisitStoreScope() {},
    closeRecordDrawerMenuState() {},
    renderVisitOrganizationFilters() {},
    syncFilterControls() {},
    renderVisits() {},
    copyVisitOrganizationState: value => structuredClone(value)
  });
  const defaults = source.slice(source.indexOf('const visitDefaultFilters ='), source.indexOf('const visitEnumFields ='));
  const menu = source.match(/const visitDateMenuState = \{[\s\S]*?\n\};/)[0];
  const functions = ['formatStoreDateValue', 'parseStoreDateValue', 'syncVisitDateView', 'syncVisitDateDraft',
    'clearHiddenVisitFilters', 'getFilteredVisitRecords', 'resetVisitFilters'].map(sourceFunction).join('\n');
  vm.runInContext(functions + '\n' + defaults + '\n' + menu, context);
  const filter = vm.runInContext('visitFilterState', context);
  const calendar = vm.runInContext('visitDateMenuState', context);
  return { context, filter, calendar, setNow: value => { currentTime = value; } };
}

test('initial visit range includes today and the preceding six dates, with matching calendar state', () => {
  const { filter, calendar } = setup();
  assert.equal(filter.startDate, '2026-10-07');
  assert.equal(filter.endDate, '2026-10-13');
  assert.equal(calendar.draftStartDate, filter.startDate);
  assert.equal(calendar.draftEndDate, filter.endDate);
  assert.equal(calendar.viewYear, 2026);
  assert.equal(calendar.viewMonth, 10);
});

test('recent-seven-day defaults cross month, year and leap-day boundaries', () => {
  for (const [today, start] of [['2027-01-03', '2026-12-28'], ['2024-03-03', '2024-02-26'], ['2026-11-02', '2026-10-27']]) {
    const { filter } = setup(`${today}T12:00:00`);
    assert.equal(filter.startDate, start);
    assert.equal(filter.endDate, today);
  }
});

test('ordinary reset recalculates the range after midnight and restores the first page', () => {
  const ui = setup('2026-10-13T23:59:00');
  ui.filter.startDate = '2026-08-11';
  ui.filter.source.push('模板导入');
  ui.setNow('2026-10-14T00:01:00');
  ui.context.resetVisitFilters();
  assert.equal(ui.filter.startDate, '2026-10-08');
  assert.equal(ui.filter.endDate, '2026-10-14');
  assert.deepEqual(plain(ui.filter.source), []);
  assert.equal(ui.context.visitPaginationState.page, 1);
  assert.equal(ui.calendar.draftEndDate, '2026-10-14');
});

test('hiding the arrival-date field restores a freshly calculated default range', () => {
  const ui = setup();
  ui.filter.startDate = '2020-01-01';
  ui.setNow('2026-10-14T12:00:00');
  ui.context.visitFieldSettingsModel.getHiddenFilterKeys = () => ['time'];
  ui.context.clearHiddenVisitFilters();
  assert.equal(ui.filter.startDate, '2026-10-08');
  assert.equal(ui.filter.endDate, '2026-10-14');
  assert.equal(ui.calendar.draftEndDate, ui.filter.endDate);
});

test('arrival dates include both complete boundary days and newest arrivals come first', () => {
  const ui = setup();
  ui.filter.startDate = '2026-10-07';
  ui.filter.endDate = '2026-10-13';
  ui.context.visitRecords = [
    { businessId: 'old-boundary', date: '2026-10-07', startTime: '00:00:00', updatedAt: '2099-01-01' },
    { businessId: 'new-early', date: '2026-10-13', startTime: '00:00:00', updatedAt: '2099-01-01' },
    { businessId: 'before-window', date: '2026-10-06', startTime: '23:59:59', updatedAt: '2026-10-13' },
    { businessId: 'new-late', date: '2026-10-13', startTime: '23:59:59', updatedAt: '2020-01-01' },
    { businessId: 'after-window', date: '2026-10-14', startTime: '00:00:00', updatedAt: '2026-10-07' }
  ];
  const original = plain(ui.context.visitRecords);
  assert.deepEqual(plain(ui.context.getFilteredVisitRecords()).map(record => record.businessId), ['new-late', 'new-early', 'old-boundary']);
  assert.deepEqual(plain(ui.context.visitRecords), original);
});

test('an ordinary recent range does not move historical demo records into today', () => {
  const ui = setup();
  ui.context.visitRecords = [{ businessId: 'historical', date: '2026-08-12', startTime: '17:05:16' }];
  assert.equal(ui.context.getFilteredVisitRecords().length, 0);
  ui.filter.startDate = ui.filter.endDate = '2026-08-12';
  assert.equal(ui.context.getFilteredVisitRecords()[0].businessId, 'historical');
});

test('store drilldown reset retains the entry dates and anomaly scope', () => {
  const ui = setup();
  Object.assign(ui.context.visitStoreDrilldownState, {
    active: true, storeId: 'store-a', initialOrganization: { brand: [], store: ['store-a'] },
    initialFilters: { startDate: '2026-08-11', endDate: '2026-08-12' }
  });
  ui.context.resetVisitFilters();
  assert.equal(ui.filter.startDate, '2026-08-11');
  assert.equal(ui.filter.endDate, '2026-08-12');
  assert.deepEqual(plain(ui.filter.status), ['异常需处理']);
  assert.equal(ui.context.visitMatchingFilterKeys.has('time'), true);
  assert.equal(ui.calendar.draftStartDate, '2026-08-11');
});


test('default first page exposes every matching status while retaining newest-first order', () => {
  const ui = setup('2026-10-14T12:00:00');
  ui.context.window.location = { search: '' };
  ui.context.URLSearchParams = URLSearchParams;
  for (const file of ['leads/organization-data.js', 'shared/organization-directory.js', 'device-management/organization-data.js', 'session/real-recording-data.js', 'leads/real-lead-data.js', 'shared/linked-demo-data.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ui.context, { filename: file });
  }
  ui.context.visitRecords = ui.context.window.AIQCLinkedDemo.visits;
  const records = plain(ui.context.getFilteredVisitRecords());
  const expected = ['已匹配', '待匹配', '录音上传中', '匹配失败', '无录音'].sort();
  assert.deepEqual([...new Set(records.map(record => record.status))].sort(), expected);
  assert.deepEqual([...new Set(records.slice(0, 10).map(record => record.status))].sort(), expected);
  for (let index = 1; index < records.length; index++) {
    assert.ok(`${records[index - 1].date} ${records[index - 1].startTime}` >= `${records[index].date} ${records[index].startTime}`);
  }
});
