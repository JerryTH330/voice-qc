const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require(process.env.AIQC_DOM_MODULE || 'linkedom');

function sourceFunction(file, name) {
  const source = fs.readFileSync(require.resolve('../' + file), 'utf8');
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  const indent = source.slice(source.lastIndexOf('\n', start) + 1, start);
  const end = source.indexOf('\n' + indent + '}', start);
  return source.slice(start, end + indent.length + 2);
}

test('visit route retains explicit missing and empty IDs without widening or keeping the prior record', () => {
  const record = {businessId: 'BIZ-known-123', date: '2026-10-28', startTime: '12:00:00'};
  const c = vm.createContext({
    URLSearchParams, window: {AIQCLinkedDemo: {getVisit: id => id === record.businessId ? record : undefined}},
    visitRecords: [record], visitStoreDrilldownState: {active: false}, visitFilterState: {},
    getVisitDefaultFilters: () => ({businessId: '', linkedBusinessId: null, startDate: '', endDate: '', source: [], status: []}),
    visitOrganizationModel: {reset() {}, apply() {}, matches: () => true},
    visitMatchingFilterKeys: new Set(), visitPaginationState: {page: 5},
    syncVisitDateDraft() {}, renderVisitOrganizationFilters() {}, renderVisits() {},
    normalizeDeviceQuery: value => String(value || '').toLowerCase(), matchesVisitCustomerKeyword: () => true,
    getVisitLeadId: () => ''
  });
  vm.runInContext(['applyLinkedDemoRoute', 'getFilteredVisitRecords'].map(name => sourceFunction('device-management/page.js', name)).join('\n'), c);
  const apply = id => c.applyLinkedDemoRoute({route: 'visits', params: new URLSearchParams({businessId: id})});
  apply(record.businessId);
  assert.equal(c.getFilteredVisitRecords().length, 1);
  for (const id of ['BIZ-known', '', 'missing-audit-visit']) {
    apply(id);
    assert.equal(c.visitFilterState.businessId, id);
    assert.equal(c.getFilteredVisitRecords().length, 0, `explicit invalid ID ${id} must stay empty`);
    assert.equal(c.visitPaginationState.page, 1);
  }
  c.applyLinkedDemoRoute({route: 'visits', params: new URLSearchParams()});
  assert.equal(c.getFilteredVisitRecords().length, 1, 'returning to the ordinary list clears the linked scope');
  c.visitFilterState.businessId = 'known';
  assert.equal(c.getFilteredVisitRecords().length, 1, 'manual ID queries remain fuzzy');
});

test('export detail renders every submitted filter, including analysis result, with escaped values', () => {
  const task = {filename: '录音.xlsx', source: 'session', status: 'completed', recordCount: 127,
    createdAt: 1, completedAt: 2, expiresAt: 3, columns: [{label: '录音ID'}],
    filters: [{label: '录音日期', value: '2026-10-22 至 2026-10-28'}, {label: '分析结果', value: '失败'}, {label: '顾问', value: '<script>bad</script>'}]};
  const c = vm.createContext({ExportTasks: {sources: {session: '录音列表'}}, date: String,
    status: () => '已完成', escape: value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')});
  vm.runInContext(['filterValue', 'detail'].map(name => sourceFunction('export-management/page.js', name)).join('\n'), c);
  const html = c.detail(task);
  const {document} = parseHTML(`<main>${html}</main>`);
  const filters = [...document.querySelectorAll('.export-detail-filters dl > div')];
  assert.deepEqual(filters.map(row => [row.querySelector('dt').textContent, row.querySelector('dd').textContent]), task.filters.map(filter => [filter.label, filter.value]));
  assert.equal(document.querySelector('script'), null);
});

test('customer insight uses its durable standalone URL from multiple modules and can leave through navigation', () => {
  for (const file of ['script-library/index.html', 'session/index.html', '客户洞察/v2/index.html']) {
    const {window, document} = parseHTML(fs.readFileSync(require.resolve('../' + file), 'utf8'));
    let url = new URL('file://' + require.resolve('../' + file));
    window.location = {get href() {return url.href;}, set href(value) {url = new URL(value, url);}, get pathname() {return url.pathname;}, get hash() {return url.hash;}};
    Object.defineProperty(document, 'currentScript', {value: {src: 'file://' + require.resolve('../unified-navigation-shell.js')}, configurable: true});
    vm.runInNewContext(fs.readFileSync(require.resolve('../unified-navigation-shell.js'), 'utf8'), {window, document, URL, console});
    document.querySelector('.nav-button[data-page="customer-insight"]').click();
    assert.equal(decodeURIComponent(url.pathname).split('/').slice(-3).join('/'), '客户洞察/v2/index.html');
    assert.equal(document.querySelector('.unified-content-frame'), null);
    document.querySelector('.nav-button[data-page="session"]').click();
    assert.match(url.pathname, /\/session\/index\.html$/);
  }
});

test('closed device drawers are inert initially and visit drawer restores focus on close', () => {
  const {document} = parseHTML(fs.readFileSync(require.resolve('../device-management/index.html'), 'utf8'));
  for (const id of ['visitDetail', 'badgeRecordDrawer', 'badgeFieldSettingsDrawer']) {
    assert(document.getElementById(id).hasAttribute('inert'), id);
  }
  const drawer = document.getElementById('visitDetail');
  const trigger = {isConnected: true, focus() { document.__focused = this; }};
  Object.defineProperty(document, 'activeElement', {value: trigger});
  drawer.querySelector('.close-drawer').focus = function () {document.__focused = this;};
  const c = vm.createContext({document, window: {clearTimeout() {}, setTimeout() {return 1;}, requestAnimationFrame: fn => fn()},
    visitDrawer: drawer, visitDrawerTrigger: null, visitDrawerCloseTimer: null, drawerBackdrop: {hidden: true},
    drawerStatus: {}, drawerBusinessId: {}, drawerBody: {}, visitRecords: [],
    detailData: {matched: {status: '已匹配', statusClass: 'success', businessId: 'BIZ-1', html: '内容'}}, syncBodyScrollLock() {}});
  vm.runInContext(['openDrawer', 'closeDrawer'].map(name => sourceFunction('device-management/page.js', name)).join('\n'), c);
  c.openDrawer('matched');
  assert.equal(drawer.inert, false);
  assert.equal(drawer.getAttribute('aria-hidden'), 'false');
  assert.equal(document.__focused, drawer.querySelector('.close-drawer'));
  c.closeDrawer();
  assert.equal(drawer.inert, true);
  assert.equal(drawer.getAttribute('aria-hidden'), 'true');
  assert.equal(document.__focused, trigger);
});
