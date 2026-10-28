const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const start = runtime.indexOf('function initStoreDashboardPage() {');
const source = runtime.slice(start, runtime.indexOf('\nfunction ', start + 1));
const demoData = require('../store-dashboard/demo-data.js');
const organizationFilter = require('../device-management/visit-organization-filter.js');
const filterUtils = require('../dashboard-filter-utils.js');
const plain = value => JSON.parse(JSON.stringify(value));

function declaration(name) {
  const match = source.match(new RegExp(`^  (?:const|let) ${name} = [^\\n]+`, 'm'));
  if (!match) {
    const fn = source.match(new RegExp(`^  function ${name}\\([^\\n]*`, 'm'));
    assert(fn, `missing runtime declaration: ${name}`);
    const rest = source.slice(fn.index);
    const end = rest.match(/^  }\s*$/m);
    assert(end, `missing function end: ${name}`);
    return rest.slice(0, end.index + end[0].length);
  }
  assert(match, `missing runtime declaration: ${name}`);
  if (match[0].trim().endsWith(';')) return match[0];
  const rest = source.slice(match.index);
  const end = rest.match(/^  [})\]].*;\s*$/m);
  assert(end, `missing declaration end: ${name}`);
  return rest.slice(0, end.index + end[0].length);
}

function setup() {
  const nodes = new Map();
  for (const id of ['storeDashboardScopeTitle', 'storeDashboardScopeText', 'advisor-list', 'client-list', 'fc-all', 'fc-high', 'fc-medium', 'fc-low', 'fc-none', 'storeTrendChart', 'storeTrendEmpty', 'chart-legend', 'issue-recording-library-list', 'issue-recording-library-result', 'issue-recording-library-more']) {
    nodes.set(id, { textContent: '', innerHTML: '', querySelectorAll: () => [] });
  }
  const document = { getElementById: id => nodes.get(id) || null, querySelectorAll: () => [] };
  const window = { StoreDashboardDemoData: demoData, VisitOrganizationFilter: organizationFilter, location: { href: 'file:///prototype/store-dashboard/index.html?route=dashboard' } };
  const context = vm.createContext({ window, document, URL });
  vm.runInContext(fs.readFileSync(path.join(root, 'device-management/organization-data.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'session/real-recording-data.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'factory-dashboard/organization-filter.js'), 'utf8'), context);
  window.AIQCOrganization = { dealers: window.__DEVICE_ORGANIZATION_DEALERS };
  Object.assign(context, filterUtils);
  const names = [
    'ALL_KPI_DATA', 'advisorData', 'clientData', 'TOTAL_ADVISOR_COUNT', 'RECORDING_DB',
    'cloneStoreKpiData', 'formatStoreKpiNumber', 'clampStoreKpiValue',
    'STORE_KPI_ROLE_FACTORS', 'STORE_KPI_SCENE_FACTORS', 'STORE_KPI_MODEL_FACTORS',
    'getStoreKpiRangeDays', 'getStoreKpiVolumeScale', 'getStoreKpiJitter', 'getStoreCountFactor', 'getStoreRateDelta', 'getStoreTrendDirection', 'getStoreKpiTrend', 'buildStoreFilteredKpiData',
    'currentRole', 'currentSource', 'currentScenes', 'currentTime', 'currentModel', 'currentModels', 'storeModelSelection', 'currentFilter', 'currentClientTimeMode', 'currentSort', 'advisorPaginationState', 'storeTimeStartDate', 'storeTimeEndDate',
    'storeDashboardDataset', 'storeDashboardOrganizationModel',
    'getStoreSupportedModelKeys', 'getStoreModelFactor', 'getStoreBusinessModelOptions', 'syncStoreModelSelection',
    'getStoreDashboardAdvisors', 'getStoreDashboardClients', 'getStoreDashboardSummary', 'getStoreDashboardScopeLabel', 'renderStoreDashboardScope', 'getStoreDashboardKpiBase',
    'getStoreSceneSelection', 'getEffectiveSceneKey', 'getLegacySceneKey', 'getStoreSelectedInsightScenes', 'getStoreRecordingSourceTotal', 'getStoreRecordingSummaryData',
    'getTeamEfficiencyDialScores', 'chart', 'TREND_DATA', 'buildChart',
    'storeSopRecordingAdvisors', 'storeSopPeople', 'makeStoreSopRule', 'storeSopRuleData', 'scopeStoreInsightRuleToCurrentScenes',
    'getClientIntentBucket', 'getClientSupervisionPool', 'updateClientFilterCounts', 'renderClientList', 'renderAdvisorTable',
    'formatStoreRecordingDate', 'getRecordingDetailUrl',
    'intentModelData', 'modelTagData', 'scopeStoreInsightTag', 'scopeStoreInsightItems', 'getSelectedStoreModelTags',
    'storeRecordingLibraryState', 'resolveStoreDashboardRecording', 'getStoreRecordingFilterDateValue', 'renderStoreRecordingLibraryList'
  ];
  vm.runInContext(`
    const buildMockRecordingId = number => 'R-' + number;
    const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapeAttr = value => escapeHtml(value).replace(/"/g, '&quot;');
    let renderedTotal = null;
    let lastTrend = null;
    const animateSalesTrendChart = (node, config, data) => { lastTrend = { config, data }; };
    const renderAdvisorPagination = total => { renderedTotal = total; };
    const bindAdvisorPaginationEvents = () => {};
    ${names.map(declaration).join('\n')}
    this.api = {
      dataset: storeDashboardDataset, model: storeDashboardOrganizationModel,
      advisors: getStoreDashboardAdvisors, clients: getStoreDashboardClients, summary: getStoreDashboardSummary, kpi: getStoreDashboardKpiBase,
      scope: renderStoreDashboardScope, rule: scopeStoreInsightRuleToCurrentScenes, rules: storeSopRuleData,
      renderAdvisors: renderAdvisorTable, renderClients: renderClientList,
      setRole: value => { currentRole = value; },
      setScenes: value => { currentScenes = value; },
      setModels: values => { storeModelSelection = values; syncStoreModelSelection(); },
      models: () => ({ selected: storeModelSelection, keys: currentModels, display: currentModel }),
      modelOptions: getStoreBusinessModelOptions, modelFactor: getStoreModelFactor,
      dialScores: getTeamEfficiencyDialScores, recordingSummary: getStoreRecordingSummaryData, chart: buildChart,
      filteredKpi: buildStoreFilteredKpiData, recordingUrl: getRecordingDetailUrl,
      insights: () => scopeStoreInsightItems(intentModelData, 'intent'),
      modelTags: getSelectedStoreModelTags,
      resolveRecording: resolveStoreDashboardRecording,
      setRecordingLibrary: value => { storeRecordingLibraryState = value; },
      renderRecordingLibrary: renderStoreRecordingLibraryList,
      lastTrend: () => lastTrend,
      getTotal: () => renderedTotal,
      setPage: value => { advisorPaginationState.page = value; },
      getPage: () => advisorPaginationState.page
    };
  `, context);
  return { ...context.api, nodes };
}

function select(h, key, values) {
  h.model.set(key, values);
  h.model.apply();
}

function setupDates() {
  const listeners = {};
  const control = dataset => ({ dataset, listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; } });
  const controls = {
    '[data-store-date-trigger]': [control({})],
    '[data-store-date-shortcut]': ['1', '7', '15', '30'].map(key => control({ storeDateShortcut: key })),
    '[data-store-date-apply]': [control({})],
    '[data-store-date-cancel]': [control({})]
  };
  const host = { innerHTML: '', classList: { toggle() {} }, addEventListener() {}, querySelectorAll: selector => controls[selector] || [], querySelector: () => null };
  const document = { getElementById: id => id === 'store-date-control' ? host : null, addEventListener: (type, handler) => { (listeners[type] ||= []).push(handler); } };
  const dates = require('../date-filter-component-utils.js');
  const context = vm.createContext({ document, window: { innerWidth: 1303 }, renderSharedDateRangeControlMarkup: dates.renderDateRangeControlMarkup, renderSharedDateRangePanelMarkup: dates.renderDateRangePanelMarkup });
  const names = [
    'currentTime', 'storeTimeStartDate', 'storeTimeEndDate', 'storeTimeRangeOptions', 'storeTimeShortcutOptions', 'storeDateState',
    'shiftStoreReferenceDate', 'getStoreRangeValues', 'syncStoreTimeRangeFromQuickFilter', 'getStoreDateLimitRange', 'clampStoreDateValue', 'isStoreDateSelectable',
    'syncStoreDateView', 'shiftStoreDateView', 'applyStoreDateDraft', 'getStoreRangeInclusiveDays', 'getStoreTrendRangeKey', 'renderStoreDateControlMarkup', 'renderStoreDateMenu', 'bindStoreDateEvents',
    'renderStoreDateControl', 'closeStoreDatePicker', 'openStoreDatePicker', 'applyStoreDateFilters'
  ];
  const dateListeners = [...source.matchAll(/^  document\.addEventListener\((['"])(click|keydown)\1,[\s\S]*?^  \}\);/gm)]
    .filter(match => match[0].includes('storeDateState.open')).map(match => match[0]).join('\n');
  vm.runInContext(`
    const RealDate = Date;
    class FixedDate extends RealDate { constructor(...args) { super(...(args.length ? args : [2026, 9, 16, 12])); } }
    Date = FixedDate;
    const formatSessionDateValue = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const parseSessionDateValue = value => value ? new Date(...value.split('-').map((part, index) => Number(part) - (index === 1 ? 1 : 0))) : null;
    const formatSessionDateDisplay = value => value;
    const getSessionDateRangeText = (start, end) => start + ' 至 ' + end;
    const formatSessionMonthLabel = (year, month) => year + '-' + month;
    const getSessionDateCells = () => [new Date(2026, 9, 15), new Date(2026, 9, 16), new Date(2026, 9, 17)];
    let appliedCount = 0, closedOrganizationMenus = 0, closedBusinessMenus = 0;
    const applyGlobalFilter = () => { appliedCount++; };
    const storeDashboardFilterUI = { closeMenu: () => { closedOrganizationMenus++; } };
    const storeDashboardBusinessUI = { closeMenu: () => { closedBusinessMenus++; } };
    ${names.map(declaration).join('\n')}
    ${dateListeners}
    syncStoreTimeRangeFromQuickFilter(currentTime);
    renderStoreDateControl();
    this.api = {
      state: storeDateState, open: openStoreDatePicker, close: closeStoreDatePicker, draft: applyStoreDateDraft, apply: applyStoreDateFilters,
      ranges: getStoreRangeValues, clamp: clampStoreDateValue, selectable: isStoreDateSelectable, limits: getStoreDateLimitRange,
      snapshot: () => ({ currentTime, start: storeTimeStartDate, end: storeTimeEndDate, appliedCount, closedOrganizationMenus, closedBusinessMenus })
    };
  `, context);
  return { ...context.api, host,
    click: (selector, index = 0) => controls[selector][index].listeners.click({ stopPropagation() {} }),
    dispatch: (type, event) => (listeners[type] || []).forEach(listener => listener(event)) };
}

function assertCountsMatchScope(h) {
  const advisors = h.advisors();
  const summary = h.summary();
  const kpi = h.kpi();
  for (const key of ['invitation', 'reception', 'test_drive', 'valid_record']) {
    const total = advisors.reduce((sum, advisor) => sum + advisor[key], 0);
    assert.equal(summary[key], total, key);
    assert.equal(Number(kpi[key].num), total, key);
    assert.equal(Number(h.filteredKpi()[key].num), total, `${key} rendered KPI`);
  }
  const keys = new Set(advisors.map(advisor => advisor.advisorKey));
  assert(h.clients().every(client => keys.has(client.advisorKey)));
  h.scope(); h.renderAdvisors(); h.renderClients();
  assert.equal(h.getTotal(), advisors.length);
  assert.equal(Number(h.nodes.get('fc-all').textContent), h.clients().filter(client => client.status !== 'normal').length);
  return { advisors, summary, kpi };
}

test('all stores and a multi-store selection share the same KPI, advisor and customer scope', () => {
  const h = setup();
  assertCountsMatchScope(h);
  assert.equal(h.advisors().length, 800);
  assert.equal(h.nodes.get('storeDashboardScopeText').textContent, '50 家门店 · 800 名顾问');
  const stores = h.dataset.stores.slice(0, 2);
  select(h, 'store', stores.map(store => store.storeId));
  assertCountsMatchScope(h);
  assert.equal(h.advisors().length, 32);
  assert.equal(h.nodes.get('storeDashboardScopeText').textContent, '2 家门店 · 32 名顾问');
  assert(h.clients().every(client => stores.some(store => store.storeId === client.storeId)));
});

test('single advisor selection never includes same-name advisors or another store’s clients', () => {
  const h = setup();
  const advisor = h.dataset.advisors.find(person => person.templateId === 'A001');
  select(h, 'advisor', [advisor.advisorKey]);
  assertCountsMatchScope(h);
  assert.deepEqual(plain(h.advisors()), [plain(advisor)]);
  assert.equal(h.clients().length, 2);
  assert(h.clients().every(client => client.advisorKey === advisor.advisorKey));
  assert.equal(h.nodes.get('storeDashboardScopeTitle').textContent, advisor.store);
  assert.equal(h.nodes.get('storeDashboardScopeText').textContent, '1 家门店 · 1 名顾问');
  const advisorRows = h.nodes.get('advisor-list').innerHTML.match(/class="cell-main advisor-name"/g) || [];
  assert.equal(advisorRows.length, 1);
  const customerCards = h.nodes.get('client-list').innerHTML.match(/data-client-id=/g) || [];
  assert.equal(customerCards.length, 1, 'normal clients stay outside the supervision list');
});

test('personnel role continues to intersect the organization and advisor scope', () => {
  const h = setup();
  const store = h.dataset.stores[0];
  select(h, 'store', [store.storeId]);
  h.setRole('邀约专员');
  assertCountsMatchScope(h);
  assert(h.advisors().every(advisor => advisor.role === '邀约专员' && advisor.storeId === store.storeId));
  assert(h.clients().every(client => client.advisor_role === '邀约专员'));
  const salesAdvisor = h.dataset.advisors.find(advisor => advisor.storeId === store.storeId && advisor.role === '销售顾问');
  select(h, 'advisor', [salesAdvisor.advisorKey]);
  assertCountsMatchScope(h);
  assert.equal(h.advisors().length, 0);
  assert.equal(h.clients().length, 0);
});

test('conflicting cross-dimension conditions retain selections and clear all rendered scope data', () => {
  const h = setup();
  const patroler = h.model.options('patroler')[0].value;
  const governors = new Set(h.model.directory.filter(store => store.patrolerId === patroler).map(store => store.governorId));
  const governor = h.model.options('governor').find(option => !governors.has(option.value)).value;
  select(h, 'patroler', [patroler]);
  select(h, 'governor', [governor]);
  assertCountsMatchScope(h);
  assert.equal(h.advisors().length, 0);
  assert.equal(h.clients().length, 0);
  assert.deepEqual(plain(h.model.applied.patroler), [patroler]);
  assert.deepEqual(plain(h.model.applied.governor), [governor]);
  for (const key of ['hit_rate', 'cover_rate', 'avg_duration', 'qa_pass_rate', 'risk_rate']) assert.equal(h.kpi()[key].num, '—');
  assert.match(h.nodes.get('advisor-list').innerHTML, /当前筛选范围暂无顾问演示数据/);
  assert.match(h.nodes.get('client-list').innerHTML, /当前筛选条件下暂无需要督办的线索/);
  assert.equal(h.nodes.get('storeDashboardScopeText').textContent, '当前筛选范围暂无演示数据');
  assert(h.rules.every(rule => h.rule(rule) === null));
});

test('rule drilldowns use only scoped advisor IDs and selected scenes', () => {
  const h = setup();
  const advisor = h.dataset.advisors.find(person => person.templateId === 'A001');
  select(h, 'advisor', [advisor.advisorKey]);
  h.setScenes([filterUtils.SCENE_KEYS.storeReception]);
  const rule = h.rules.map(h.rule).find(Boolean);
  assert(rule);
  assert.equal(rule.advisor_count, 1);
  assert(rule.people.every(person => person.advisorKey === advisor.advisorKey));
  assert(rule.recordings.length > 0);
  assert(rule.recordings.every(recording => recording.advisorKey === advisor.advisorKey && recording.storeId === advisor.storeId && recording.sceneKey === filterUtils.SCENE_KEYS.storeReception));
  assert.equal(rule.hit_count, rule.recordings.length);
  assert.equal(rule.hit_count, rule.people.reduce((sum, person) => sum + person.hitCount, 0));
  assert.equal(rule.sample_count, rule.people.reduce((sum, person) => sum + person.sampleCount, 0));
});

test('multiple business scenes preserve their union in recording summaries and rule evidence', () => {
  const h = setup();
  select(h, 'advisor', [h.dataset.advisors[0].advisorKey]);
  const selected = [filterUtils.SCENE_KEYS.firstFollow, filterUtils.SCENE_KEYS.testDrive];
  h.setScenes(selected);
  const summary = h.recordingSummary();
  assert.deepEqual(plain(summary.cloud.scenes.map(scene => scene.key)), [selected[0]]);
  assert.deepEqual(plain(summary.badge.scenes.map(scene => scene.key)), [selected[1]]);
  const rule = h.rules.map(h.rule).find(Boolean);
  assert(rule);
  assert(rule.recordings.length > 0);
  assert(rule.recordings.every(recording => selected.includes(recording.sceneKey)));
  assert.deepEqual(plain(rule.applicableScenes).sort(), [...selected].sort());
});

test('multiple supported series retain separate keys and drive data and metric factors together', () => {
  const h = setup();
  const options = h.modelOptions();
  const m8 = options.find(option => option.label === 'M8系列' && option.meta === '传祺');
  const s7 = options.find(option => option.label === '向往S7' && option.meta === '传祺');
  assert(m8 && s7);
  h.setModels([m8.value, s7.value]);
  assert.deepEqual(plain(h.models().keys).sort(), ['M8', 'S7']);
  assert.deepEqual(plain(h.models().selected).sort(), [m8.value, s7.value].sort());
  assert(h.models().display.includes('M8系列') && h.models().display.includes('向往S7'));
  assert.equal(h.modelFactor('reception', 1), (1.08 + 0.88) / 2);
  assert(h.advisors().length > 0);
  assert(h.advisors().every(advisor => advisor.brand === '传祺'));
  assert(h.clients().every(client => /M8|S7/.test(client.car_model)));
  assert.equal(h.recordingSummary().badge.scenes.find(scene => scene.key === filterUtils.SCENE_KEYS.storeReception).value, Math.round(h.summary().reception * h.modelFactor('reception', 1)));
  const merged = plain(h.modelTags());
  h.setModels([m8.value]);
  const m8Tags = plain(h.modelTags());
  h.setModels([s7.value]);
  const s7Tags = plain(h.modelTags());
  for (const group of ['positive', 'negative', 'neutral']) {
    const sourceTags = [...m8Tags[group], ...s7Tags[group]];
    assert.deepEqual(merged[group].map(tag => tag.name).sort(), [...new Set(sourceTags.map(tag => tag.name))].sort());
    assert.equal(merged[group].reduce((sum, tag) => sum + tag.count, 0), sourceTags.reduce((sum, tag) => sum + tag.count, 0));
  }
  const gs8 = options.find(option => option.label === 'GS8' && option.meta === '传祺');
  assert(gs8);
  h.setModels([gs8.value]);
  assert.deepEqual(plain(h.models().keys), ['GS8']);
  assert(h.advisors().length > 0);
  assert(h.clients().every(client => client.car_model.includes('GS8')));
});

test('statistics date is always visible with yesterday applied and the four factory shortcut ranges', () => {
  const h = setupDates();
  assert.match(h.host.innerHTML, /统计日期/);
  assert.match(h.host.innerHTML, /data-store-date-trigger/);
  assert.equal(h.snapshot().currentTime, '1');
  assert.equal(h.snapshot().start, '2026-10-15');
  assert.equal(h.snapshot().end, '2026-10-15');
  assert.equal(h.snapshot().appliedCount, 0);
  for (const [key, start, end] of [['1', '2026-10-15', '2026-10-15'], ['7', '2026-10-10', '2026-10-16'], ['15', '2026-10-02', '2026-10-16'], ['30', '2026-09-17', '2026-10-16']]) {
    assert.deepEqual(plain(h.ranges(key)), { startDate: start, endDate: end });
  }
  h.open();
  const shortcuts = h.host.innerHTML.match(/data-store-date-shortcut=/g) || [];
  assert.equal(shortcuts.length, 4);
  assert.equal(h.snapshot().closedOrganizationMenus, 1);
  assert.equal(h.snapshot().closedBusinessMenus, 1);
});

test('date shortcuts and manual day choices stay in draft until Apply, with ordered inclusive ranges', () => {
  const h = setupDates();
  h.open();
  h.click('[data-store-date-shortcut]', 1);
  assert.equal(h.state.draftStartDate, '2026-10-10');
  assert.equal(h.state.draftEndDate, '2026-10-16');
  assert.equal(h.snapshot().start, '2026-10-15');
  assert.equal(h.snapshot().appliedCount, 0);
  h.click('[data-store-date-apply]');
  assert.equal(h.state.open, false);
  assert.equal(h.snapshot().currentTime, 'custom');
  assert.equal(h.snapshot().start, '2026-10-10');
  assert.equal(h.snapshot().end, '2026-10-16');
  assert.equal(h.snapshot().appliedCount, 1);
  h.open();
  h.draft('startDate', '2026-10-13');
  h.draft('endDate', '2026-10-11');
  assert.equal(h.state.draftStartDate, '2026-10-11');
  assert.equal(h.state.draftEndDate, '2026-10-11');
  assert.equal(h.snapshot().start, '2026-10-10');
  h.apply();
  assert.equal(h.snapshot().start, '2026-10-11');
  assert.equal(h.snapshot().end, '2026-10-11');
  assert.equal(h.snapshot().appliedCount, 2);
});

test('cancel, outside click and Escape discard date drafts when the picker is reopened', () => {
  const h = setupDates();
  for (const close of [() => h.close(), () => h.dispatch('click', { target: { closest: () => null } }), () => h.dispatch('keydown', { key: 'Escape' })]) {
    h.open();
    h.draft('startDate', '2026-10-01');
    h.draft('endDate', '2026-10-02');
    close();
    assert.equal(h.state.open, false);
    assert.equal(h.snapshot().start, '2026-10-15');
    assert.equal(h.snapshot().end, '2026-10-15');
    assert.equal(h.snapshot().appliedCount, 0);
    h.open();
    assert.equal(h.state.draftStartDate, '2026-10-15');
    assert.equal(h.state.draftEndDate, '2026-10-15');
    h.close();
  }
});

test('date range rejects future and more-than-six-month-old days in both state and calendar markup', () => {
  const h = setupDates();
  assert.equal(h.limits().minValue, '2026-04-16');
  assert.equal(h.limits().maxValue, '2026-10-16');
  assert.equal(h.selectable('2026-10-17'), false);
  assert.equal(h.selectable('2026-04-15'), false);
  assert.equal(h.clamp('2026-10-17'), '2026-10-16');
  assert.equal(h.clamp('2026-04-15'), '2026-04-16');
  h.open();
  assert(!h.host.innerHTML.includes('data-store-date-value="2026-10-17"'));
  assert.match(h.host.innerHTML, /is-disabled/);
  h.draft('startDate', '2026-04-01');
  h.draft('endDate', '2026-10-20');
  h.apply();
  assert.equal(h.snapshot().start, '2026-04-16');
  assert.equal(h.snapshot().end, '2026-10-16');
});

test('unsupported and cross-brand series keep their selections without silently restoring all-store demo data', () => {
  const h = setup();
  const aion = h.modelOptions().find(option => option.label === 'AION S' && option.meta === '埃安');
  const m8 = h.modelOptions().find(option => option.label === 'M8系列' && option.meta === '传祺');
  assert(aion && m8);
  h.setModels([aion.value]);
  assert.deepEqual(plain(h.models().keys), [aion.value]);
  assert.equal(h.models().display, aion.label);
  assert.equal(h.advisors().length, 0);
  assert.equal(h.clients().length, 0);
  assert.equal(h.kpi().qa_pass_rate.num, '—');
  assert.equal(h.modelTags(), null);
  assert(h.rules.every(rule => h.rule(rule) === null));
  h.setModels([aion.value, m8.value]);
  assert.equal(h.models().keys.length, 2);
  assert.deepEqual(plain(h.models().selected).sort(), [aion.value, m8.value].sort());
  assert(h.advisors().length > 0 && h.advisors().length < 800);
  assert(h.advisors().every(advisor => advisor.brand === '传祺'));
  assert(h.clients().every(client => client.car_model.includes('M8')));
});

test('brand changes reconcile series candidates while other scope conditions do not erase the selected series', () => {
  const h = setup();
  const m8 = h.modelOptions().find(option => option.label === 'M8系列' && option.meta === '传祺');
  const aionStore = h.dataset.stores.find(store => store.brand === '埃安');
  h.setModels([m8.value]);
  select(h, 'store', [aionStore.storeId]);
  assert.equal(h.advisors().length, 0);
  assert.deepEqual(plain(h.models().selected), [m8.value]);
  select(h, 'brand', [aionStore.brandId]);
  assert(h.modelOptions().every(option => option.meta === '埃安'));
  h.setModels(h.models().selected);
  assert.deepEqual(plain(h.models().keys), []);
  assert.equal(h.models().display, 'all');
  assert(h.advisors().every(advisor => advisor.brand === '埃安'));
});

test('opening a person’s recording library keeps the exact demo identity and actual store in its detail URL', () => {
  const h = setup();
  select(h, 'store', h.dataset.stores.slice(0, 2).map(store => store.storeId));
  const issue = h.rule(h.rules[0]);
  const person = issue.people[0];
  const prefix = source.slice(source.indexOf('  window.openStoreIssueRecordingLibrary = function('), source.indexOf("    const overlay = document.createElement('div');", source.indexOf('  window.openStoreIssueRecordingLibrary = function(')));
  const context = vm.createContext({ window: {}, document: { getElementById: () => null }, getStoreIssueRules: () => [issue], getStoreRecordingDateLimitRange: () => ({ maxDate: new Date(2026, 9, 15) }) });
  vm.runInContext(`let storeRecordingLibraryState; ${prefix} return storeRecordingLibraryState; };`, context);
  const library = context.window.openStoreIssueRecordingLibrary('sop', issue.id, person.advisorKey);
  assert(library.records.length > 0);
  assert(library.records.every(recording => recording.advisorKey === person.advisorKey && recording.storeId === person.storeId));
  assert.equal(library.records.length, issue.recordings.filter(recording => recording.advisorKey === person.advisorKey).length);
  const recording = library.records[0];
  const url = new URL(h.recordingUrl(recording.id, recording), 'file:///prototype/store-dashboard/index.html');
  assert.equal(url.searchParams.get('sessionId'), recording.id);
  assert.equal(url.searchParams.get('sessionStore'), recording.store);
  assert.equal(url.searchParams.get('sessionCustomer'), recording.customer);
  assert.equal(context.window.openStoreIssueRecordingLibrary('sop', issue.id, 'missing-advisor'), undefined);
});

test('customer insight tags and their recording evidence use the same selected advisor and store', () => {
  const h = setup();
  const advisor = h.dataset.advisors.find(person => person.templateId === 'A001');
  select(h, 'advisor', [advisor.advisorKey]);
  const insights = h.insights();
  assert(insights.length > 0);
  const tags = insights.flatMap(item => [...(item.focus || []), ...(item.resist || [])]);
  assert(tags.length > 0);
  const recordings = tags.flatMap(tag => tag.recordings);
  assert(recordings.length > 0);
  assert(recordings.every(recording => recording.advisorKey === advisor.advisorKey && recording.storeId === advisor.storeId));
  h.setRole('邀约专员');
  assert.deepEqual(plain(h.insights()), []);
});

test('new demo recording IDs open their own scoped metadata, with explicit missing-media state and valid click handlers', () => {
  const h = setup();
  const advisor = h.dataset.advisors.find(person => person.templateId === 'A001');
  select(h, 'advisor', [advisor.advisorKey]);
  const recording = h.rule(h.rules[0]).recordings[0];
  h.setRecordingLibrary({ records: [recording], query: '', dateValue: '', filterType: 'advisor', page: 1 });
  const resolved = h.resolveRecording(recording.id);
  assert.equal(resolved.storeId, advisor.storeId);
  assert.equal(resolved.advisorKey, advisor.advisorKey);
  assert.equal(resolved.customer, recording.customer);
  assert.equal(resolved.hasDetailSource, false);
  assert.equal(resolved.duration, 0);
  assert.deepEqual(plain(resolved.transcript), []);
  h.renderRecordingLibrary();
  const handler = h.nodes.get('issue-recording-library-list').innerHTML.match(/onclick="([^"]+)"/)[1];
  let clickedId;
  vm.runInNewContext(handler, { openRecordingPlayer: value => { clickedId = value; } });
  assert.equal(clickedId, recording.id);
  const prefix = source.slice(source.indexOf('  window.openRecordingPlayer = function('), source.indexOf('    document.body.appendChild(overlay);', source.indexOf('  window.openRecordingPlayer = function(')));
  const context = vm.createContext({ window: {}, document: { getElementById: () => null, createElement: () => ({}) }, resolveStoreDashboardRecording: h.resolveRecording, getRecordingDetailUrl: h.recordingUrl, fmtTime: seconds => String(seconds), genWaveHeights: () => [], alert: value => assert.fail(value) });
  vm.runInContext(`let recPlayerState = { timer: null }; ${prefix} return overlay; };`, context);
  const overlay = context.window.openRecordingPlayer(recording.id);
  assert.match(overlay.innerHTML, /disabled aria-disabled="true"/);
  assert.match(overlay.innerHTML, /当前演示记录未提供转写文本与音频/);
  assert(!overlay.innerHTML.includes('class="rec-detail-link"'));
  const withTemplate = { ...recording, templateId: 'R-0401' };
  h.setRecordingLibrary({ records: [withTemplate] });
  const known = h.resolveRecording(recording.id);
  assert.equal(known.hasDetailSource, true);
  assert(known.transcript.length > 0);
  assert.equal(known.customer, recording.customer);
  assert.equal(known.storeId, advisor.storeId);
  h.setRole('邀约专员');
  assert.equal(h.resolveRecording(recording.id), null, 'a stale library cannot revive another scope’s recording');
  assert.equal(h.resolveRecording('missing-demo-recording'), null);
});

test('model reset restores all scope results and clamps stale pagination when returning to a small scope', () => {
  const h = setup();
  const initial = plain(h.summary());
  h.model.setDimension('geography');
  select(h, 'city', [h.dataset.stores[0].cityId]);
  h.model.reset();
  assert.deepEqual(plain(h.summary()), initial);
  assert.equal(h.model.applied.dimensionMode, 'organization');
  assert.equal(h.clients().length, 200);
  h.setPage(80);
  select(h, 'advisor', [h.dataset.advisors[0].advisorKey]);
  h.renderAdvisors();
  assert.equal(h.getPage(), 1);
  assert.equal(h.getTotal(), 1);
});

test('quality dial and trend reflect the selected scope and hide stale charts for an empty result', () => {
  const h = setup();
  select(h, 'advisor', [h.dataset.advisors[0].advisorKey]);
  assert.equal(h.dialScores().team, Number(h.kpi().qa_pass_rate.num));
  h.chart('7');
  const trend = h.lastTrend();
  assert.equal(h.nodes.get('storeTrendChart').hidden, false);
  assert.equal(h.nodes.get('storeTrendEmpty').hidden, true);
  assert.equal(trend.data.personalQualifiedRate.at(-1), h.dialScores().team);
  assert.equal(trend.data.recordingVolume.reduce((sum, count) => sum + count, 0), h.summary().invitation + h.summary().reception + h.summary().test_drive);
  h.setRole('邀约专员');
  h.chart('7');
  assert.equal(h.nodes.get('storeTrendChart').hidden, true);
  assert.equal(h.nodes.get('storeTrendEmpty').hidden, false);
  assert.equal(h.nodes.get('chart-legend').innerHTML, '');
  assert.deepEqual(plain(h.dialScores()), { team: null, zone: null });
  assert.equal(h.lastTrend(), trend, 'empty scope never renders a fixed fallback trend');
});

test('empty dial clears prior displayed quality values instead of animating a fallback percentage', () => {
  const nodes = Object.fromEntries(['teamScoreVal', 'nationalAvgVal', 'periodChangeValueEl', 'nationalDiffValueEl', 'nationalDiffLabelEl', 'dialFill'].map(key => [key, { textContent: '82', style: {} }]));
  const attributes = {};
  const context = vm.createContext({ ...nodes, document: { querySelector: () => ({ setAttribute: (key, value) => { attributes[key] = value; } }) }, getTeamEfficiencyDialScores: () => ({ team: null, zone: null }), cancelTeamEfficiencyDialFrames() {} });
  vm.runInContext(`${declaration('updateTeamEfficiencyDials')} updateTeamEfficiencyDials();`, context);
  for (const key of ['teamScoreVal', 'nationalAvgVal', 'periodChangeValueEl', 'nationalDiffValueEl']) assert.equal(nodes[key].textContent, '—');
  assert.equal(nodes.nationalDiffLabelEl.textContent, '');
  assert.equal(nodes.dialFill.style.strokeDashoffset, 2 * Math.PI * 65);
  assert.equal(attributes['aria-label'], '门店质检合格率暂无数据');
});

test('organization UI callback resets pagination and refreshes every dashboard module; reset restores business defaults', () => {
  const calls = [];
  const node = { textContent: '', classList: { remove() {}, toggle() {} }, setAttribute() {}, addEventListener() {} };
  const document = { getElementById: id => id === 'lead-detail-overlay' ? { remove: () => calls.push('closeLead') } : id === 'rec-close-btn' ? { click: () => calls.push('closePlayer') } : node, querySelectorAll: () => [] };
  let mountOptions;
  let businessOptions;
  const window = { closeStoreIssueRecordingLibrary: () => calls.push('closeRule'),
    StoreDashboardOrganizationFilter: { mount: options => { mountOptions = options; return { closeMenu: () => calls.push('closeOrganizationMenu') }; } },
    StoreDashboardBusinessFilters: { mount: options => { businessOptions = options; return { render: () => context.calls.push('businessRender'), closeMenu: () => context.calls.push('businessClose') }; } }
  };
  const context = vm.createContext({ window, document, SOURCE_KEYS: filterUtils.SOURCE_KEYS, SCENE_KEYS: filterUtils.SCENE_KEYS, getAllowedScenes: filterUtils.getAllowedScenes, getSceneLabel: filterUtils.getSceneLabel });
  const businessMountRest = source.slice(source.indexOf('  storeDashboardBusinessUI = window.StoreDashboardBusinessFilters.mount('));
  const businessMountEnd = businessMountRest.match(/^  \}\);/m);
  assert(businessMountEnd);
  const businessMount = businessMountRest.slice(0, businessMountEnd.index + businessMountEnd[0].length);
  vm.runInContext(`
    let currentRole = '销售顾问', currentSource = SOURCE_KEYS.badge, currentScenes = [SCENE_KEYS.testDrive], currentTime = 'custom', currentModel = 'M8', currentModels = ['M8'], storeModelSelection = ['传祺::M8系列'], currentFilter = 'high';
    const advisorPaginationState = { page: 10 };
    const storeDashboardIssueRulesCache = new Map([['old-scope', []]]);
    const storeDashboardOrganizationModel = {};
    this.calls = [];
    let storeDashboardBusinessUI = null;
    const syncStoreModelSelection = () => calls.push('syncModels');
    const getStoreBusinessModelOptions = () => [];
    const resetStoreTeamSummaryState = options => calls.push(['resetSummary', options]);
    const renderStoreDashboardScope = () => calls.push('scope');
    const renderHeroKPI = () => calls.push('hero');
    const renderClientList = () => calls.push('clients');
    const renderAdvisorTable = () => calls.push('advisors');
    const renderInsightSection = () => calls.push('insight');
    const renderStoreIssueSections = () => calls.push('rules');
    const updateTeamEfficiencyDials = options => calls.push(['dial', options]);
    const buildChart = range => calls.push(['chart', range]);
    const getStoreTrendRangeKey = () => currentTime;
    const renderStoreTeamSummary = () => calls.push('summary');
    const closeStoreDatePicker = () => calls.push('closeDate');
    const syncStoreSceneTabs = () => calls.push('syncScenes');
    const syncStoreTimeRangeFromQuickFilter = range => calls.push(['syncDates', range]);
    const renderStoreDateControl = () => calls.push('renderDate');
    ${['applyGlobalFilter', 'closeStoreDashboardPopovers', 'resetStoreDashboardBusinessFilters', 'storeDashboardBusinessFilters', 'storeDashboardFilterUI'].map(declaration).join('\n')}
    ${businessMount}
    this.state = () => ({ currentRole, currentSource, currentScenes, currentTime, currentModel, currentModels, storeModelSelection, currentFilter, page: advisorPaginationState.page });
    this.cacheSize = () => storeDashboardIssueRulesCache.size;
  `, context);
  assert(mountOptions);
  assert.equal(mountOptions.root, node);
  mountOptions.onChange();
  assert.equal(context.state().page, 1);
  assert.equal(context.cacheSize(), 0);
  assert.deepEqual(calls, ['closePlayer', 'closeRule', 'closeLead']);
  assert.deepEqual(plain(context.calls), ['syncModels', 'businessRender', ['resetSummary', { render: false }], 'scope', 'hero', 'clients', 'advisors', 'insight', 'rules', ['dial', { fromZero: true }], ['chart', 'custom'], 'summary']);
  mountOptions.onReset();
  assert.deepEqual(plain(context.state()), { currentRole: 'all', currentSource: 'all', currentScenes: ['all'], currentTime: '1', currentModel: 'all', currentModels: [], storeModelSelection: [], currentFilter: 'all', page: 1 });
  assert(context.calls.some(call => Array.isArray(call) && call[0] === 'syncDates' && call[1] === '1'));
  assert(context.calls.includes('businessRender'));
  assert(businessOptions);
  assert.equal(businessOptions.root, node);
  businessOptions.onChange('scene', ['first_follow', 'test_drive']);
  assert.deepEqual(plain(context.state().currentScenes), ['first_follow', 'test_drive']);
  businessOptions.onChange('model', ['传祺::M8系列', '传祺::向往S7']);
  assert.deepEqual(plain(businessOptions.getSelection('model')), ['传祺::M8系列', '传祺::向往S7']);
  businessOptions.onBeforeOpen();
  assert.equal(calls.at(-1), 'closeOrganizationMenu');
  assert.equal(context.calls.at(-1), 'closeDate');
  mountOptions.onBeforeChange();
  assert.deepEqual(plain(context.calls.slice(-2)), ['businessClose', 'closeDate']);
  mountOptions.onReset();
  assert.deepEqual(plain(businessOptions.getSelection('model')), []);
  assert.deepEqual(plain(businessOptions.getSelection('scene')), []);
});

test('bootstrap loads directory, model and dashboard modules in order before runtime', () => {
  const bootstrap = fs.readFileSync(path.join(root, 'store-dashboard/page.js'), 'utf8');
  const appended = [];
  const document = {
    createElement: () => ({}),
    body: { appendChild(script) { appended.push(script.src.split('?')[0]); script.onload(); } }
  };
  vm.runInNewContext(bootstrap, { window: {}, document });
  const ordered = ['../shared/organization-directory.js', '../device-management/organization-data.js', '../session/real-recording-data.js', '../device-management/visit-organization-filter.js', '../factory-dashboard/organization-filter.js', './demo-data.js', './organization-filter.js', './business-filters.js', '../app-runtime.js'];
  assert.deepEqual(appended.filter(script => ordered.includes(script)), ordered);
  for (const relative of appended) assert(fs.existsSync(path.resolve(root, 'store-dashboard', relative)), relative);
});
