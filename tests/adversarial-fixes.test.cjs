const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {parseHTML} = require(process.env.AIQC_DOM_MODULE || 'linkedom');
const insightDateRange = require('../客户洞察/v2/simplified/date-range.js');

function sourceFunction(file, name) {
  const source = fs.readFileSync(require.resolve('../' + file), 'utf8');
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  const indent = source.slice(source.lastIndexOf('\n', start) + 1, start);
  const end = source.indexOf('\n' + indent + '}', start);
  return source.slice(start, end + indent.length + 2);
}

test('changing insight scope in overview invalidates compare output without rendering an absent comparison stage', () => {
  const {document} = parseHTML(`
    <div id="compareAiSummaryLoading"></div>
    <div id="aiResult"></div>
    <div id="compareAiExecutive"></div>
    <p id="aiExecutiveConclusion"></p>
    <div id="compareAiEvidenceStats"></div>
    <p id="compareAiSummaryStatus"></p>
    <button id="generateAiButton"></button>
  `);
  let renders = 0;
  const state = {stage: 'overview'};
  const c = vm.createContext({
    state, compareAiSummaryGenerated: true, compareAiSummaryGenerationId: 1,
    $: selector => document.querySelector(selector), setCompareAiGenerateLabel() {},
    renderCompareRuleInsights() {
      assert.notEqual(state.stage, 'overview');
      renders++;
    }
  });
  vm.runInContext(sourceFunction('客户洞察/v2/客户洞察.js', 'invalidateCompareAiSummary'), c);
  c.invalidateCompareAiSummary();
  assert.equal(renders, 0);
  assert.equal(c.compareAiSummaryGenerated, false);
  assert.equal(c.compareAiSummaryGenerationId, 2);
  for (const stage of ['online', 'offline']) { state.stage = stage; c.invalidateCompareAiSummary(); }
  assert.equal(renders, 2);
});

test('customer insight retains the five shared date shortcuts alongside all time', () => {
  const {preset, create} = insightDateRange;
  const latest = '2026-03-31';
  assert.deepEqual(preset('yesterday', latest), {start: '2026-03-30', end: '2026-03-30'});
  assert.deepEqual(preset('last30', latest), {start: '2026-03-02', end: latest});
  assert.deepEqual(preset('last6Months', '2026-08-31'), {start: '2026-02-28', end: '2026-08-31'});
  const draft = create({start: '2026-03-15', end: '2026-03-20', min: '2026-02-01', max: latest});
  assert.deepEqual(draft.preset('last6Months'), {start: '2026-02-01', end: latest});
  let {document} = parseHTML(draft.render());
  assert.deepEqual([...document.querySelectorAll('[data-range-shortcut]')].map(button => button.textContent),
    ['全部时间', '昨天', '近三天', '近七天', '近一月', '近半年']);
  assert.equal(document.querySelector('[data-range-shortcut="last6Months"]').getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelectorAll('.session-date-grid').length, 1);
  assert.equal(document.querySelector('[data-range-nav="-1"]').disabled, true);
  assert.equal(draft.navigate(1), true);
  assert.equal(draft.navigate(1), false);
  draft.pick('2026-03-20');
  ({document} = parseHTML(draft.render()));
  assert.equal(document.querySelector('[data-range-apply]').disabled, true);
  assert.deepEqual(draft.pick('2026-03-15'), {start: '2026-03-15', end: '2026-03-20'});
  draft.selectField('endDate');
  assert.deepEqual(draft.pick(latest), {start: '2026-03-15', end: latest});
  draft.selectField('startDate');
  draft.pick('2026-02-28');
  assert.deepEqual(draft.pick('2026-03-01'), {start: '2026-02-28', end: '2026-03-01'});
});

test('customer insight all-time calendar can stage and clear a manual range', () => {
  const allTime = {start: '', end: ''};
  const draft = insightDateRange.create({...allTime, min: '2026-02-01', max: '2026-03-31'});
  assert.equal(draft.state.month, '2026-03-01');
  assert.deepEqual(draft.selectedRange(), allTime);
  let {document} = parseHTML(draft.render());
  assert.equal(document.querySelector('[data-range-shortcut="all"]').getAttribute('aria-pressed'), 'true');
  assert.equal(document.querySelectorAll('.session-date-day.in-range').length, 0);
  draft.pick('2026-03-12');
  assert.equal(draft.selectedRange(), null);
  draft.pick('2026-03-15');
  assert.deepEqual(draft.selectedRange(), {start: '2026-03-12', end: '2026-03-15'});
  draft.preset('all');
  ({document} = parseHTML(draft.render()));
  assert.equal(document.querySelector('[data-range-apply]').disabled, false);
  assert.deepEqual(draft.selectedRange(), allTime);
});

test('customer insight all-time totals, drill evidence and report use the same eligible leads', () => {
  const window = {
    SalesStrategyModel: require('../客户洞察/v2/sales-strategy-model.js'),
    InsightDemoTopics: require('../客户洞察/v2/simplified/demo-topics.js'),
    InsightDateRange: insightDateRange,
    __DEVICE_ORGANIZATION_DEALERS: []
  };
  const context = vm.createContext({window});
  for (const file of ['model.js', 'report-model.js']) {
    const path = require.resolve('../客户洞察/v2/simplified/' + file);
    vm.runInContext(fs.readFileSync(path, 'utf8'), context, {filename: path});
  }
  const {InsightSimpleModel: insightModel, InsightReportModel: insightReport} = window;
  const defaults = insightModel.defaults();
  assert.equal(insightDateRange.label(defaults), '全部时间');
  assert.equal(defaults.template, 'not_arrived7');
  assert.equal(defaults.minAgeDays, 7);
  const filters = {brand: ['埃安'], organizationStores: ['aion-shop']};
  const cohort = {template: 'not_arrived', filters};
  const record = (leadId, issuedAt, patch = {}) => ({
    id: leadId, leadId, issuedAt, brand: '埃安', storeId: 'aion-shop', visitState: false,
    regionId: 'region-one', region: '大区一', scene: defaults.scenes[0], analysisState: 'ready',
    actions: {}, annotations: {resistance: [{name: '价格敏感'}]}, ...patch
  });
  const fixture = [
    record('old', '2025-12-01'),
    record('cutoff', insightModel.cutoff),
    record('after-cutoff', insightModel.shift(insightModel.cutoff, 1)),
    record('no-date', null),
    record('other-brand', insightModel.cutoff, {brand: '传祺'}),
    record('other-store', insightModel.cutoff, {storeId: 'other-shop'}),
    record('arrived', insightModel.cutoff, {visitState: true})
  ];
  const all = insightModel.query(cohort, false, fixture);
  assert.equal(all.errors.length, 0);
  assert.equal(all.populationCount, 3);
  assert.equal(all.counts.not_arrived, 2);
  const explicit = insightModel.query({...cohort, start: insightModel.cutoff, end: insightModel.cutoff}, false, fixture);
  for (const [result, leadIds] of [[all, ['old', 'cutoff']], [explicit, ['cutoff']]]) {
    assert.deepEqual(Array.from(result.records, item => item.leadId), leadIds);
    const drill = insightModel.drill(result, {kind: 'customers', dimension: 'resistance', targetName: '价格敏感'});
    assert.deepEqual(Array.from(drill.children[0].summary.records, item => item.leadId), leadIds);
    const report = insightReport.snapshot(result, insightDateRange.label(result.scope));
    assert.deepEqual(Array.from(report.leads, item => item.id), leadIds);
    assert.equal(report.coverage.total, leadIds.length);
  }
  const incomplete = insightModel.query({...cohort, start: insightModel.cutoff}, false, fixture);
  assert.ok(incomplete.errors.length);
  assert.equal(incomplete.records.length, 0);
});

test('customer insight leaves the main area empty until initialization', () => {
  const {document} = parseHTML(fs.readFileSync(require.resolve('../客户洞察/v2/index.html'), 'utf8'));
  assert.equal(document.querySelector('main.main').childElementCount, 0);
  const {content} = document.getElementById('tpl-customer-insight');
  assert.ok(content.querySelector('.topbar'));
  assert.ok(content.querySelector('.ci-workspace'));
  assert.equal(content.querySelector('.ci-filter').querySelectorAll('[data-select]').length, 0);
});

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
