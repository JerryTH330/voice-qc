const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const filters = require('../device-management/visit-organization-filter.js');
const dates = require('../date-filter-component-utils.js');
const fields = require('../device-management/visit-field-settings.js');
const matchingFields = require('../device-management/matching-field-settings.js');
const exportTasks = require('../shared/export-tasks.js');
const xlsx = require('../device-management/xlsx-export-utils.js');

const dealers = [
  { dealerWid: 'A1', brand: '埃安', dealerCode: 'A01', dealerName: '同名店', area: '东区', zone: '一战区', province: '上海市', city: '上海市', patroler: '巡回甲', patrolerId: 'P1', governor: '治理甲', governorId: 'G1' },
  { dealerWid: 'A2', brand: '埃安', dealerCode: 'A02', dealerName: '杭州店', area: '东区', zone: '二战区', province: '浙江省', city: '杭州市', patroler: '巡回乙', patrolerId: 'P2', governor: '治理乙', governorId: 'G2' },
  { dealerWid: 'B1', brand: '传祺', dealerCode: 'B01', dealerName: '同名店', area: '东区', zone: '一战区', province: '江苏省', city: '苏州市', patroler: '巡回丙', patrolerId: 'P3', governor: '治理丙', governorId: 'G3' }
];
const fixtureRecords = dealers.map((dealer, index) => ({ ...filters.organizationRecord(dealer),
  businessId: `B${index}`, date: '2026-08-11', advisor: '同名顾问', advisorId: `ADV-${index}`, advisorKey: `ADV-${index}` }));
const create = () => filters.createModel(dealers, fixtureRecords, { mode: 'matching' });
const ids = (model, key) => model.options(key).map((item) => item.value);
const plain = (value) => JSON.parse(JSON.stringify(value));

test('geography and personnel candidates stay independent of brand and organization', () => {
  const model = create();
  model.set('brand', ['brand:埃安']);
  model.set('region', [fixtureRecords[0].regionId]);
  assert.equal(model.options('province').length, 3);
  assert.equal(model.options('patroler').length, 3);
  assert.equal(model.options('governor').length, 3);
  assert.equal(model.options('advisor').length, 3);
  model.setDimension('geography');
  model.set('province', [fixtureRecords[2].provinceId]);
  assert.deepEqual(ids(model, 'city'), [fixtureRecords[2].cityId]);
  assert.deepEqual(ids(model, 'store'), []);
  model.apply();
  assert.equal(fixtureRecords.filter(model.matches).length, 0);
  assert.deepEqual(model.draft.province, [fixtureRecords[2].provinceId]);
  assert.deepEqual(model.draft.brand, ['brand:埃安']);
});

test('upstream changes only prune conflicting descendants and preserve independent staff', () => {
  const model = create();
  for (const key of ['region', 'zone', 'store', 'patroler', 'governor', 'advisor']) {
    model.set(key, [fixtureRecords[0][filters.fields[key].idKey]]);
  }
  model.set('brand', ['brand:传祺']);
  assert.deepEqual(model.draft.region, []);
  assert.deepEqual(model.draft.zone, []);
  assert.deepEqual(model.draft.store, []);
  assert.deepEqual(model.draft.patroler, ['P1']);
  assert.deepEqual(model.draft.governor, ['G1']);
  assert.deepEqual(model.draft.advisor, ['ADV-0']);
  model.apply();
  assert.equal(fixtureRecords.filter(model.matches).length, 0);
});

test('stores combine all personnel conditions while personnel do not constrain each other', () => {
  const model = create();
  model.set('patroler', ['P1', 'P2']);
  model.set('governor', ['G1']);
  assert.deepEqual(ids(model, 'store'), ['A1']);
  assert.equal(model.options('advisor').length, 3);
  assert.equal(model.options('governor').length, 3);
  model.set('advisor', ['ADV-1']);
  assert.deepEqual(ids(model, 'store'), []);
  model.apply();
  assert.equal(fixtureRecords.filter(model.matches).length, 0);
  assert.deepEqual(model.draft.patroler, ['P1', 'P2']);
  assert.deepEqual(model.draft.governor, ['G1']);
  assert.deepEqual(model.draft.advisor, ['ADV-1']);
});

test('selecting a store scopes personnel by ID without selecting any parents', () => {
  const model = create();
  model.set('store', ['A1']);
  for (const key of ['brand', 'region', 'zone']) assert.deepEqual(model.draft[key], []);
  assert.deepEqual(ids(model, 'patroler'), ['P1']);
  assert.deepEqual(ids(model, 'governor'), ['G1']);
  assert.deepEqual(ids(model, 'advisor'), ['ADV-0']);
  model.apply();
  assert.deepEqual(fixtureRecords.filter(model.matches).map((record) => record.businessId), ['B0']);
  model.set('store', []);
  assert.equal(model.options('advisor').length, 3);
});

test('same names remain separate, searches use display IDs, and menu order stays pinned', () => {
  const model = create();
  const names = model.options('advisor', { query: '同名顾问' });
  assert.equal(names.length, 3);
  assert.equal(new Set(names.map((item) => item.value)).size, 3);
  assert.ok(names.every((item) => item.meta.endsWith(` · ${item.value}`)));
  assert.deepEqual(model.options('advisor', { query: ' a d v - 1 ' }).map((item) => item.value), ['ADV-1']);
  const original = model.options('store', { pinnedIds: [] }).map((item) => item.value);
  model.set('store', [original.at(-1)]);
  assert.deepEqual(model.options('store', { pinnedIds: [] }).map((item) => item.value), original);
  assert.equal(model.options('store')[0].value, original.at(-1));
});

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'device-management/page.js'), 'utf8');
function sourceFunction(name) {
  let start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, name);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  return source.slice(start, source.indexOf('\n}\n', start) + 2);
}
function declaration(name, kind = 'const') {
  const start = source.indexOf(`${kind} ${name} = `);
  assert.notEqual(start, -1, name);
  const end = /;\n(?=\n|const |let |function |$)/.exec(source.slice(start));
  assert.ok(end, `${name} declaration must close`);
  return source.slice(start, start + end.index + 1);
}

function createHarness({ savedSettings, storageError = false, linkedDemo = false } = {}) {
  const nodes = {};
  let state;
  let focused;
  const listeners = {};
  const controllers = [];
  const timers = [];
  const cancelledTimers = [];
  const storage = new Map();
  const submissions = [];
  if (savedSettings !== undefined) storage.set(matchingFields.storageKey, typeof savedSettings === 'string' ? savedSettings : JSON.stringify(savedSettings));
  function node(selector, dataset = {}) {
    if (nodes[selector]) return nodes[selector];
    const classes = new Set();
    const attributes = {};
    const value = {
      dataset, style: {}, _html: '', scrollTop: 0, hidden: true, isConnected: true,
      get ownerDocument() { return context.document; },
      get innerHTML() { return this._html; },
      set innerHTML(value) {
        this._html = value;
        const active = value.match(/<button id="([^"]+)"[^>]*aria-selected="true"[^>]*aria-controls="([^"]+)"/);
        if (active) {
          const selectedTab = node('[data-dimension-option][aria-selected="true"]');
          selectedTab.id = active[1];
          selectedTab.setAttribute('aria-controls', active[2]);
        }
      },
      classList: { contains: (name) => classes.has(name), add: (...names) => names.forEach((name) => classes.add(name)), remove: (...names) => names.forEach((name) => classes.delete(name)), toggle(name, on = !classes.has(name)) { on ? classes.add(name) : classes.delete(name); } },
      setAttribute: (key, val) => { attributes[key] = String(val); },
      getAttribute: (key) => attributes[key], removeAttribute: (key) => { delete attributes[key]; },
      toggleAttribute(key, on) { on ? this.setAttribute(key, '') : this.removeAttribute(key); },
      hasAttribute: (key) => Object.hasOwn(attributes, key),
      getBoundingClientRect: () => ({ top: 100, bottom: 150, left: 100, height: 240 }),
      focus() { focused = selector; context.document.activeElement = value; },
      setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
      append(child) { child.parent = selector; },
      querySelector(child) { return node(`${selector} ${child}`); },
      querySelectorAll() { return []; },
      closest() { return null; }
    };
    nodes[selector] = value;
    return value;
  }
  function query(selector) {
    if (selector === '.matching-filter-menu .badge-advisor-options') return state?.menu.openMenu && state.menu.openMenu !== 'time' ? node('options') : null;
    if (selector === '.matching-filter-card .matching-filter-menu') return state?.menu.openMenu || state?.menu.closingMenu ? node('menu') : null;
    const menuRoot = selector.match(/^\[data-matching-menu-root="(.+)"\]$/);
    if (menuRoot) {
      const control = node(selector);
      control.querySelector = () => node('menu');
      return control;
    }
    return node(selector);
  }
  const controls = node('matchingFilterControls');
  controls.classList.toggle('is-collapsed', true);
  controls.querySelector = (selector) => selector === '.matching-filter-menu' || selector === '.session-menu-panel'
    ? state?.menu.openMenu || state?.menu.closingMenu ? node('menu') : null : node(selector);
  const actions = node('.matching-filter-actions');
  actions.querySelector = () => node('[data-matching-advanced-toggle]');
  node('[data-matching-time-trigger]').closest = () => node('time-root');
  node('matchingMetricRate').closest = () => node('rate-card');
  const context = vm.createContext({
    console, URLSearchParams,
    window: { VisitOrganizationFilter: filters, MatchingFieldSettings: matchingFields, DimensionSwitcher: require('../shared/dimension-switcher.js'),
      location: { hash: '#dashboard' }, scrollY: 0, scrollTo(position) { context.scrollPosition = position; },
      __exportReady: Promise.resolve(), ExportTaskUI: { async submit(request) { submissions.push(plain(request)); } },
      innerHeight: 900, matchMedia: () => ({ matches: true }),
      requestAnimationFrame(callback) { callback(); }, setTimeout(callback) { timers.push(callback); return timers.length; },
      clearTimeout(id) { cancelledTimers.push(id); },
      __fieldSettingsInteractions: { createController(config) {
        const controller = { config, cancellations: 0, cancel() { this.cancellations++; } };
        controllers.push(controller);
        return controller;
      } }
    },
    localStorage: { getItem(key) { if (storageError) throw new Error('blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageError) throw new Error('blocked'); storage.set(key, value); } },
    __dateFilterComponentUtils: dates,
    document: { activeElement: null, body: { style: {} }, documentElement: { clientWidth: 1440 },
      getElementById: node, querySelector: query,
      querySelectorAll(selector) {
        if (selector === '[data-matching-select-value]') return state.model.options(state.menu.openMenu || 'brand').map((item) => node(item.value, { matchingSelectValue: item.value }));
        return [];
      },
      addEventListener(name, handler) { (listeners[name] ||= []).push(handler); }
    },
    visitFieldSettingsModel: fields, visitFieldSettingsState: fields.createDefaultSettings(),
    badgeRecordDrawer: null, badgeFieldSettingsDrawer: null, visitFieldSettingsDrawer: null,
    visitDrawer: { getAttribute: () => 'true' }, importModal: { hidden: true },
    badgeUploadDetailModal: { hidden: true }, visitEventDetailModal: { hidden: true },
    visitPaginationState: { page: 8, pageSize: 20 },
    currentDeviceRoute: '',
    visitStoreDrilldownActions: node('[data-visit-store-drilldown-actions]'),
    renderVisitOrganizationFilters() {}, renderVisits() {}, closeVisitFilterMenu() {}, setRoute(route) { context.route = route; },
    showToast(message) { context.toast = message; }, BADGE_MENU_MOTION_EASE: 'linear'
  });
  context.document.defaultView = context.window;
  vm.runInContext(fs.readFileSync(path.join(root, 'device-management/organization-data.js'), 'utf8'), context);
  if (linkedDemo) vm.runInContext(fs.readFileSync(path.join(root, 'shared/linked-demo-data.js'), 'utf8'), context);
  const functions = [
    'expandVisitRecordTemplates', 'getVisitDefaultFilters', 'escapeBadgeHtml', 'formatDeviceCount',
    'normalizeDeviceQuery', 'matchesVisitCustomerKeyword', 'getVisitLeadId', 'getFilteredVisitRecords',
    'formatStoreDateValue', 'formatStoreDateDisplay', 'parseStoreDateValue',
    'syncVisitDateView', 'syncVisitDateDraft', 'applyVisitDateDraft', 'applyVisitDateShortcut', 'getVisitDateCells',
    'prefersBadgeReducedMotion', 'isRecordDrawerMenuVisible', 'beginRecordDrawerMenuRender',
    'closeRecordDrawerMenuState', 'openRecordDrawerMenuState', 'playRecordDrawerMenuMotion',
    'settleBadgeFilterExtra', 'setVisitFiltersCollapsed', 'clearHiddenVisitFilters', 'isVisitFilterVisible',
    'copyVisitOrganizationState', 'enforceVisitStoreScope', 'getVisitStoreDrilldownHash', 'resetVisitFilters',
    'applyVisitStoreDrilldown', 'applyVisitStoreDrilldownFromRoute', 'restoreOrdinaryVisitState',
    'restoreVisitDrilldownScroll', 'leaveVisitStoreDrilldown', 'handleVisitStoreDrilldownClick',
    'getVisitSelectValues', 'getVisitSelectCandidates', 'renderVisitMultiSelect', 'updateVisitResults',
    'handleVisitOrganizationClick', 'handleVisitDateClick', 'getVisitExportFilters', 'getVisibleVisitFields',
    'getVisitFieldValue', 'syncVisitExportButton', 'exportVisitDetailExcel',
    'getUniqueVisitRecordsByBusinessId', 'sumVisitWeights', 'getMatchingRecordCategory',
    'getFilteredMatchingVisitRecords', 'getMatchingStoreSummaries', 'renderMatchingStoreCell', 'renderMatchingStoreTable', 'renderMatchingPagination', 'renderMatchingDashboard',
    'getMatchingExportFilters', 'getMatchingExportCellValue', 'syncMatchingExportButton', 'exportMatchingStoreExcel', 'getBadgeExportTimestamp',
    'loadMatchingFieldSettings', 'getVisibleMatchingFields', 'isMatchingFilterVisible', 'clearHiddenMatchingFilters',
    'renderMatchingFieldSettings', 'openMatchingFieldSettings', 'closeMatchingFieldSettings', 'saveMatchingFieldSettings',
    'handleMatchingFieldSettingsClick', 'handleMatchingFieldSettingsChange', 'handleMatchingFieldSettingsKeydown', 'syncBodyScrollLock',
    'matchesMatchingDateRange', 'getMatchingSelectCandidates', 'syncMatchingDateDraft',
    'renderMatchingMultiSelect', 'renderMatchingOrganizationFilters', 'renderMatchingDateMenu', 'syncMatchingTimeFilterControl',
    'positionMatchingFilterMenu', 'closeMatchingFilterMenus', 'handleMatchingFilterClick', 'handleMatchingDateClick',
    'updateMatchingFilterSearch', 'updateMatchingResults', 'handleMatchingFilterKeydown', 'openVisitsFromMatching', 'syncFilterControls'
  ];
  vm.runInContext(functions.map(sourceFunction).join('\n'), context);
  const constants = [
    'visitDefaultFilters', 'visitFilterState', 'visitEnumFields', 'visitProcessingStatuses', 'visitRecordTemplates', 'visitDemoStoreMappings',
    'visitDemoAdvisorMappings', 'visitDirectoryDealers', 'visitRecords', 'visitOrganizationModel', 'visitMenuState',
    'visitDateMenuState', 'visitMatchingFilterKeys', 'visitStoreDrilldownState', 'visitExportButton',
    'matchingPaginationState', 'matchingDefaultFilters', 'matchingFilterState', 'matchingExportButton', 'matchingOrganizationModel',
    'matchingMenuState', 'matchingMenuMotion', 'matchingDateMenuState', 'matchingFieldSettingsModel'
  ];
  vm.runInContext(constants.map((name) => declaration(name)).join('\n'), context);
  vm.runInContext(['matchingFieldSettingsState', 'matchingFieldSettingsDraft', 'matchingFieldSettingsTrigger', 'matchingExportBusy', 'visitExportBusy']
    .map((name) => declaration(name, 'let')).join('\n'), context);
  vm.runInContext(['matchingFieldSettingsDrawer', 'matchingFieldSettingsBackdrop', 'matchingFieldSettingsList', 'matchingFieldSettingsDragController']
    .map((name) => declaration(name)).join('\n'), context);
  state = vm.runInContext('({ model: matchingOrganizationModel, filter: matchingFilterState, menu: matchingMenuState, date: matchingDateMenuState, visits: visitRecords, visitModel: visitOrganizationModel, visitFilter: visitFilterState, visitDate: visitDateMenuState, visitMenu: visitMenuState, inherited: visitMatchingFilterKeys, visitScope: visitStoreDrilldownState, pagination: matchingPaginationState, get settings() { return matchingFieldSettingsState; }, set settings(value) { matchingFieldSettingsState = value; }, get draft() { return matchingFieldSettingsDraft; }, get exportBusy() { return matchingExportBusy; } })', context);
  function event(selector, dataset = {}, key) {
    const target = node(`event:${selector}:${JSON.stringify(dataset)}`, dataset);
    target.closest = (requested) => {
      if (requested.split(', ').includes(selector)) return target;
      if (selector === '[data-matching-dimension]' && requested === '[data-dimension-option]') {
        target.dataset.dimensionOption = dataset.matchingDimension;
        return target;
      }
      if (selector === '[data-matching-dimension]' && requested === '[data-dimension-switcher]') {
        return node('dimension-group', { dimensionNamespace: 'matching' });
      }
      return null;
    };
    return { target, key, preventDefault() { this.prevented = true; }, stopPropagation() {}, stopImmediatePropagation() { this.stopped = true; } };
  }
  return { context, state, nodes, node, event, listeners, controllers, storage, timers, cancelledTimers, submissions, focus: () => focused };
}

test('actual page data preserves counts, categories, sorting and store identity', () => {
  const { context, state, nodes } = createHarness();
  context.renderMatchingOrganizationFilters();
  context.renderMatchingDashboard();
  assert.equal(state.visits.length, 1286);
  assert.equal(nodes.matchingMetricVisits.textContent, '1,286');
  assert.equal(nodes.matchingMetricMatched.textContent, '1,185');
  assert.equal(nodes.matchingMetricProcessing.textContent, '69');
  assert.equal(nodes.matchingMetricProblems.textContent, '32');
  assert.equal(nodes.matchingMetricRate.textContent, '92.1%');
  assert.match(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="zone"/);
  assert.match(nodes.matchingPersonnelFilters.innerHTML, /data-matching-select-trigger="advisor"/);
  const summaries = context.getMatchingStoreSummaries(state.visits);
  assert.equal(summaries.length, 3);
  assert.ok(summaries.every((item) => item.visits === item.matched + item.processing + item.action));
  assert.ok(summaries.every((item, index) => !index || summaries[index - 1].action >= item.action));
  assert.match(nodes.matchingTableBody.innerHTML, /data-matching-store-id="G216-/);
  const sameNames = fixtureRecords.map((record) => ({ ...record, store: '同名店', status: '无录音' }));
  assert.equal(context.getMatchingStoreSummaries(sameNames).length, 3);
});

test('multi-select updates results immediately, keeps its menu and scroll, and select-all respects search', () => {
  const { context, state, nodes, event, focus } = createHarness();
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'store' }));
  const storeIds = [...new Set(state.visits.map((record) => record.storeId))];
  nodes.options.scrollTop = 240;
  context.handleMatchingFilterClick(event('[data-matching-select-value]', { matchingSelectKey: 'store', matchingSelectValue: storeIds[0] }));
  assert.equal(state.menu.openMenu, 'store');
  assert.equal(nodes.options.scrollTop, 240);
  assert.deepEqual(plain(state.model.applied.store), [storeIds[0]]);
  assert.equal(Number(nodes.matchingMetricVisits.textContent.replaceAll(',', '')), state.visits.filter((record) => record.storeId === storeIds[0]).length);
  const input = { value: state.visits.find((record) => record.storeId === storeIds[1]).storeCode, selectionStart: 2, selectionEnd: 2 };
  context.updateMatchingFilterSearch(input);
  assert.equal(focus(), '[data-matching-select-search]');
  assert.equal(nodes['[data-matching-select-search]'].selectionStart, 2);
  context.handleMatchingFilterClick(event('[data-matching-select-all]', { matchingSelectAll: 'store' }));
  assert.deepEqual(new Set(state.model.applied.store), new Set(storeIds.slice(0, 2)));
  context.handleMatchingFilterClick(event('[data-matching-select-all]', { matchingSelectAll: 'store' }));
  assert.deepEqual(plain(state.model.applied.store), [storeIds[0]]);
});

test('switching dimensions clears the old path and stores while retaining personnel and brand', () => {
  const { context, state, nodes, event } = createHarness();
  const record = state.visits[0];
  for (const key of ['brand', 'region', 'zone', 'patroler', 'governor', 'advisor', 'store']) state.model.set(key, [record[filters.fields[key].idKey]]);
  context.updateMatchingResults();
  context.handleMatchingFilterClick(event('[data-matching-dimension]', { matchingDimension: 'geography' }));
  assert.equal(state.model.applied.dimensionMode, 'geography');
  for (const key of ['region', 'zone', 'store']) assert.deepEqual(plain(state.model.applied[key]), []);
  for (const key of ['brand', 'patroler', 'governor', 'advisor']) assert.deepEqual(plain(state.model.applied[key]), [record[filters.fields[key].idKey]]);
  assert.match(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="province"/);
  assert.match(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="city"/);
  assert.doesNotMatch(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="zone"/);
  assert.equal(state.visitModel.applied.dimensionMode, 'organization');
});

test('dimension tabs expose one tab stop and connect the active path to its filter panel', () => {
  const { context, nodes, event } = createHarness();
  context.renderMatchingOrganizationFilters();
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /data-matching-dimension="organization"[^>]+aria-selected="true"[^>]+tabindex="0"/);
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /data-matching-dimension="geography"[^>]+aria-selected="false"[^>]+tabindex="-1"/);
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /dimension-switcher__indicator" aria-hidden="true"/);
  assert.equal(nodes.matchingDimensionFilters.getAttribute('aria-labelledby'), 'matching-dimension-organization');
  context.handleMatchingFilterClick(event('[data-matching-dimension]', { matchingDimension: 'geography' }));
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /data-matching-dimension="geography"[^>]+aria-selected="true"[^>]+tabindex="0"/);
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /地理路径：/);
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /dimension-switcher__step is-specific">省份/);
  assert.equal(nodes.matchingDimensionFilters.getAttribute('aria-labelledby'), 'matching-dimension-geography');
});

test('pointer dimension changes animate only the slider and replaced fields and cancel on reversal', () => {
  const { context, state, node, event } = createHarness();
  context.window.matchMedia = () => ({ matches: false });
  const calls = [];
  const targets = ['.dimension-switcher__indicator', '.dimension-switcher__indicator-labels',
    '[data-matching-menu-root="province"]', '[data-matching-menu-root="city"]',
    '[data-matching-menu-root="region"]', '[data-matching-menu-root="zone"]'];
  targets.forEach((selector) => {
    node(selector).animate = (frames, timing) => {
      const call = { selector, frames: plain(frames), timing: plain(timing), cancelled: false };
      calls.push(call);
      return { cancel() { call.cancelled = true; } };
    };
  });
  const pointer = (mode) => ({ ...event('[data-matching-dimension]', { matchingDimension: mode }), detail: 1 });
  context.handleMatchingFilterClick(pointer('geography'));
  assert.equal(state.model.applied.dimensionMode, 'geography');
  assert.deepEqual(calls.map((call) => call.selector), targets.slice(0, 4));
  assert.equal(calls[0].timing.duration, 180);
  assert.deepEqual(calls[0].timing, calls[1].timing);
  assert.deepEqual(calls[0].frames.map((frame) => frame.transform), ['translateX(0)', 'translateX(100%)']);
  assert.deepEqual(calls[1].frames.map((frame) => frame.transform), ['translateX(0)', 'translateX(-50%)']);
  assert.ok(calls.slice(2).every((call) => call.timing.duration === 140));
  context.handleMatchingFilterClick(pointer('organization'));
  assert.ok(calls.slice(0, 4).every((call) => call.cancelled));
  assert.deepEqual(calls.slice(4).map((call) => call.selector), [targets[0], targets[1], ...targets.slice(4)]);
  assert.deepEqual(calls[4].frames.map((frame) => frame.transform), ['translateX(100%)', 'translateX(0)']);
  context.handleMatchingFilterClick(pointer('organization'));
  assert.equal(calls.length, 8);
});

test('keyboard dimension navigation switches immediately and reduced motion prevents pointer animations', () => {
  const { context, state, node, event, focus } = createHarness();
  let animations = 0;
  ['.dimension-switcher__indicator', '.dimension-switcher__indicator-labels',
    '[data-matching-menu-root="province"]', '[data-matching-menu-root="city"]',
    '[data-matching-menu-root="region"]', '[data-matching-menu-root="zone"]'].forEach((selector) => {
    node(selector).animate = () => { animations++; return { cancel() {} }; };
  });
  context.window.matchMedia = () => ({ matches: false });
  for (const mode of ['organization', 'geography']) {
    node(`[data-matching-dimension="${mode}"]`).click = () => context.handleMatchingFilterClick({
      ...event('[data-matching-dimension]', { matchingDimension: mode }), detail: 0
    });
  }
  for (const [mode, key, expected] of [['organization', 'ArrowRight', 'geography'],
    ['geography', 'ArrowLeft', 'organization'], ['organization', 'End', 'geography'], ['geography', 'Home', 'organization']]) {
    const keyEvent = event('[data-matching-dimension]', { matchingDimension: mode }, key);
    assert.equal(context.handleMatchingFilterKeydown(keyEvent), true);
    assert.equal(keyEvent.prevented, true);
    assert.equal(state.model.applied.dimensionMode, expected);
    assert.equal(focus(), `matching-dimension-${expected}`);
  }
  assert.equal(animations, 0);
  context.window.matchMedia = () => ({ matches: true });
  context.handleMatchingFilterClick({ ...event('[data-matching-dimension]', { matchingDimension: 'geography' }), detail: 1 });
  assert.equal(state.model.applied.dimensionMode, 'geography');
  assert.equal(animations, 0);
  assert.equal(state.visitModel.applied.dimensionMode, 'organization');
});

test('dimension feedback reports actual cleared path selections, expires and leaves common conditions intact', () => {
  const { context, state, nodes, node, event, timers, cancelledTimers } = createHarness();
  const switchMode = (mode) => context.handleMatchingFilterClick(event('[data-matching-dimension]', { matchingDimension: mode }));
  switchMode('geography');
  assert.equal(node('[data-dimension-feedback]').textContent, undefined);
  assert.equal(timers.length, 0);
  switchMode('organization');
  const record = state.visits[0];
  for (const key of ['brand', 'region', 'zone', 'store', 'patroler', 'governor', 'advisor']) {
    state.model.set(key, [record[filters.fields[key].idKey]]);
  }
  const datesBefore = plain(state.filter);
  switchMode('geography');
  assert.match(node('[data-dimension-feedback]').textContent, /已切换至地理维度，原路径条件已清除/);
  assert.match(nodes.matchingDimensionSwitcher.innerHTML, /role="status" aria-live="polite"/);
  for (const key of ['brand', 'patroler', 'governor', 'advisor']) {
    assert.deepEqual(plain(state.model.applied[key]), [record[filters.fields[key].idKey]]);
  }
  assert.deepEqual(plain(state.filter), datesBefore);
  const timerId = timers.length;
  timers.at(-1)();
  assert.equal(node('[data-dimension-feedback]').textContent, '');
  context.renderMatchingOrganizationFilters();
  assert.ok(cancelledTimers.includes(timerId));
});

test('date selection is a draft until applied and includes whole days regardless of start time', () => {
  const { context, state, event, nodes } = createHarness();
  const beforeVisitDate = plain(state.visitDate);
  const beforeVisitFilters = plain(state.visitFilter);
  context.handleMatchingFilterClick(event('[data-matching-time-trigger]'));
  assert.match(nodes.matchingTimePanel.innerHTML, /data-matching-date-apply/);
  context.handleMatchingDateClick(event('[data-matching-date-value]', { matchingDateValue: '2026-08-12' }));
  assert.equal(state.filter.startDate, '2026-08-11');
  context.handleMatchingDateClick(event('[data-matching-date-apply]', { matchingDateApply: '' }));
  assert.equal(state.filter.startDate, '2026-08-12');
  assert.equal(state.filter.endDate, '2026-08-12');
  assert.ok(context.matchesMatchingDateRange({ date: '2026-08-12', startTime: '00:00:00' }));
  assert.ok(context.matchesMatchingDateRange({ date: '2026-08-12', startTime: '23:59:59' }));
  assert.equal(context.matchesMatchingDateRange({ date: '2026-08-13' }), false);
  assert.deepEqual(plain(state.visitDate), beforeVisitDate);
  assert.deepEqual(plain(state.visitFilter), beforeVisitFilters);
  state.date.viewYear = 2024; state.date.viewMonth = 2;
  assert.equal(context.getVisitDateCells(state.date).filter(Boolean).length, 29);
  context.applyVisitDateDraft('endDate', '2024-02-29', state.date);
  assert.equal(state.date.draftStartDate, '2024-02-29');
  state.date.viewMonth = 12;
  context.handleMatchingDateClick(event('[data-matching-date-nav]', { matchingDateNav: '1' }));
  assert.equal(state.date.viewYear, 2025);
  assert.equal(state.date.viewMonth, 1);
});

test('reset restores the default dimension and dates while retaining expanded layout', () => {
  const { context, state, nodes, event } = createHarness();
  context.handleMatchingFilterClick(event('[data-matching-advanced-toggle]'));
  assert.equal(nodes.matchingAdvancedFilters.hidden, false);
  state.model.setDimension('geography');
  state.model.set('province', [state.visits[0].provinceId]);
  state.filter.startDate = '2026-08-12';
  context.updateMatchingResults();
  context.handleMatchingFilterClick(event('[data-matching-filter-reset]'));
  assert.equal(state.model.applied.dimensionMode, 'organization');
  assert.equal(state.filter.startDate, '2026-08-11');
  assert.equal(state.filter.endDate, '2026-08-12');
  assert.equal(nodes.matchingMetricVisits.textContent, '1,286');
  assert.equal(nodes.matchingAdvancedFilters.hidden, false);
  assert.equal(nodes.matchingFilterControls.classList.contains('is-collapsed'), false);
});

test('geographic drilldown hides inherited organization and personnel filters while retaining ID arrays and dates', () => {
  const { context, state } = createHarness();
  const record = state.visits[0];
  state.model.setDimension('geography');
  for (const key of ['brand', 'province', 'city', 'patroler', 'governor', 'advisor']) state.model.set(key, [record[filters.fields[key].idKey]]);
  context.updateMatchingResults();
  const before = plain({ model: state.model.applied, filter: state.filter });
  context.visitFieldSettingsState.visible = [];
  context.openVisitsFromMatching(record.storeId, '异常需处理');
  assert.equal(context.route, 'store-visits');
  assert.equal(state.visitScope.active, true);
  assert.equal(context.visitPaginationState.page, 1);
  assert.equal(state.visitModel.applied.dimensionMode, 'geography');
  for (const key of ['brand', 'province', 'city', 'patroler', 'governor', 'advisor']) {
    assert.deepEqual(plain(state.visitModel.applied[key]), before.model[key]);
    assert.notEqual(state.visitModel.applied[key], state.model.applied[key]);
    assert.equal(context.isVisitFilterVisible(key), false);
  }
  assert.deepEqual(plain(state.visitModel.applied.store), [record.storeId]);
  assert.deepEqual(plain(state.visitFilter.status), ['异常需处理']);
  assert.equal(context.isVisitFilterVisible('time'), true);
  assert.equal(context.isVisitFilterVisible('status'), true);
  assert.deepEqual(context.visitFieldSettingsState.visible, []);
  const expected = context.getFilteredMatchingVisitRecords().filter((item) => item.storeId === record.storeId && context.getMatchingRecordCategory(item) === 'action');
  assert.deepEqual(context.getFilteredVisitRecords().map((item) => item.businessId), expected.map((item) => item.businessId));
  assert.deepEqual(plain({ model: state.model.applied, filter: state.filter }), before);
});

test('Escape and outside clicks close the matching menu and page listeners delegate matching actions', () => {
  const harness = createHarness();
  const { context, state, event, focus, listeners } = harness;
  for (const name of ['click', 'keydown', 'input', 'compositionend']) {
    const start = source.indexOf(`document.addEventListener('${name}', function (event) {`);
    assert.notEqual(start, -1, name);
    vm.runInContext(source.slice(start, source.indexOf('\n});', start) + 4), context);
  }
  const open = event('[data-matching-select-trigger]', { matchingSelectTrigger: 'advisor' });
  listeners.click[0](open);
  assert.equal(state.menu.openMenu, 'advisor');
  assert.equal(open.stopped, true);
  const escape = event('button', {}, 'Escape');
  listeners.keydown[0](escape);
  assert.equal(escape.prevented, true);
  assert.equal(state.menu.openMenu, null);
  assert.equal(focus(), '[data-matching-select-trigger="advisor"]');
  listeners.click[0](open);
  listeners.click[0](event('outside'));
  assert.equal(state.menu.openMenu, null);
  const input = event('[data-matching-select-search]');
  input.target.matches = (selector) => selector === '[data-matching-select-search]';
  input.target.value = '王';
  listeners.input[0](input);
  assert.equal(state.menu.query, '王');
  input.target.value = '李'; input.isComposing = true;
  listeners.input[0](input);
  assert.equal(state.menu.query, '王');
  listeners.compositionend[0](input);
  assert.equal(state.menu.query, '李');
});

test('date changes scope advisor choices while preserving selected zero-result conditions', () => {
  const { context, state, event, nodes } = createHarness();
  const advisor = state.visits.find((record) => record.date === '2026-08-11'
    && !state.visits.some((other) => other.date === '2026-08-12' && other.advisorKey === record.advisorKey));
  state.model.set('advisor', [advisor.advisorKey]);
  context.updateMatchingResults();
  state.date.draftStartDate = '2026-08-12'; state.date.draftEndDate = '2026-08-12';
  context.handleMatchingDateClick(event('[data-matching-date-apply]', { matchingDateApply: '' }));
  assert.ok(!ids(state.model, 'advisor').includes(advisor.advisorKey));
  assert.deepEqual(plain(state.model.applied.advisor), [advisor.advisorKey]);
  assert.equal(state.model.display('advisor'), advisor.advisor);
  assert.equal(nodes.matchingMetricVisits.textContent, '0');
  assert.equal(nodes.matchingMetricRate.textContent, '0.0%');
  assert.match(nodes.matchingTableBody.innerHTML, /当前筛选条件没有共同数据/);
  context.handleMatchingFilterClick(event('[data-matching-filter-reset]'));
  assert.equal(nodes.matchingMetricVisits.textContent, '1,286');
});

test('the shared calendar defaults continue to operate on the visit page only', () => {
  const { context, state } = createHarness();
  const before = plain(state.date);
  context.syncVisitDateView('2024-02-01');
  assert.equal(state.visitDate.viewYear, 2024);
  assert.equal(context.getVisitDateCells().filter(Boolean).length, 29);
  context.applyVisitDateDraft('startDate', '2026-12-31');
  assert.equal(state.visitDate.draftStartDate, '2026-12-31');
  assert.equal(state.visitDate.draftEndDate, '2026-12-31');
  context.applyVisitDateDraft('endDate', '2026-01-01');
  assert.equal(state.visitDate.draftStartDate, '2026-01-01');
  context.applyVisitDateShortcut('last7');
  const end = new Date(`${state.visitDate.draftEndDate}T00:00:00Z`);
  const start = new Date(`${state.visitDate.draftStartDate}T00:00:00Z`);
  assert.equal((end - start) / 86400000, 6);
  assert.deepEqual(plain(state.date), before);
});

test('keyboard navigation moves from search to the first or last visible option', () => {
  const { context, state, event, node, focus } = createHarness();
  const open = event('[data-matching-select-trigger]', { matchingSelectTrigger: 'brand' }, 'ArrowDown');
  context.handleMatchingFilterKeydown(open);
  assert.equal(state.menu.openMenu, 'brand');
  const root = node('keyboard-root');
  const options = [node('all'), node('first-brand'), node('last-brand')];
  root.querySelectorAll = () => options;
  const search = event('[data-matching-select-search]', {}, 'ArrowUp');
  search.target.closest = (selector) => selector === '[data-matching-menu-root]' ? root
    : selector === '[data-matching-select-search]' ? search.target : null;
  context.handleMatchingFilterKeydown(search);
  assert.equal(focus(), 'last-brand');
  search.key = 'ArrowDown';
  context.handleMatchingFilterKeydown(search);
  assert.equal(focus(), 'all');
  const option = event('[data-matching-select-value]', {}, 'Home');
  option.target.closest = (selector) => selector === '[data-matching-menu-root]' ? root
    : selector.includes('[data-matching-select-value]') ? options[1] : null;
  context.handleMatchingFilterKeydown(option);
  assert.equal(focus(), 'all');
  option.key = 'End';
  context.handleMatchingFilterKeydown(option);
  assert.equal(focus(), 'last-brand');
});

test('matching menus reuse closing motion and cancel stale animation on rapid switching', () => {
  const { context, state, nodes, node, event } = createHarness();
  context.window.matchMedia = () => ({ matches: false });
  node('menu').animate = () => {};
  const animations = [];
  context.animateBadgeFilterMenu = (panel, direction) => {
    const animation = { direction, cancelled: false, cancel() { this.cancelled = true; this.oncancel?.(); } };
    animations.push(animation);
    return animation;
  };
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'brand' }));
  assert.equal(animations.at(-1).direction, 'in');
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'store' }));
  assert.equal(animations[0].cancelled, true);
  context.closeMatchingFilterMenus({ restoreFocus: true });
  const exit = animations.at(-1);
  assert.equal(exit.direction, 'out');
  assert.equal(state.menu.closingMenu, 'store');
  assert.match(nodes.matchingDimensionFilters.innerHTML, /inert aria-hidden="true"/);
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'brand' }));
  assert.equal(exit.cancelled, true);
  assert.equal(state.menu.openMenu, 'brand');
  context.closeMatchingFilterMenus();
  animations.at(-1).onfinish();
  assert.equal(state.menu.closingMenu, null);
  assert.doesNotMatch(nodes.matchingDimensionFilters.innerHTML, /badge-advisor-menu/);
});

test('summary settings default to the agreed 14 columns and have independent storage', () => {
  assert.deepEqual(matchingFields.fields.map((field) => field.label), [
    '品牌', '大区', '战区', '省份', '城市', '店代码', '门店', '巡回员', '治理员',
    '到访数', '已匹配到访', '处理中', '异常需处理', '录音匹配率'
  ]);
  const defaults = matchingFields.createDefaultSettings();
  assert.equal(matchingFields.getVisibleFields(defaults).length, 14);
  assert.notEqual(matchingFields.storageKey, fields.storageKey);
  assert.ok(!matchingFields.fields.some((field) => field.label === '操作'));
  defaults.visible.pop();
  assert.equal(matchingFields.createDefaultSettings().visible.length, 14);
});

test('saved column normalization preserves visibility and manual order while adding missing known fields', () => {
  const defaults = matchingFields.createDefaultSettings();
  const custom = { order: [...defaults.order].reverse(), visible: ['rate', 'store'] };
  assert.deepEqual(matchingFields.normalizeSettings(custom), { ...custom, schemaVersion: defaults.schemaVersion });
  const oldOrder = custom.order.filter((key) => key !== 'province');
  const normalized = matchingFields.normalizeSettings({ order: [...oldOrder, 'unknown', 'store'], visible: ['store', 'unknown'] });
  assert.deepEqual(normalized.order.filter((key) => key !== 'province'), oldOrder);
  assert.deepEqual(new Set(normalized.visible), new Set(['store', 'province']));
  assert.deepEqual(matchingFields.normalizeSettings({ order: defaults.order, visible: [] }), defaults);
  assert.deepEqual(matchingFields.normalizeSettings(null), defaults);
});

test('summary metadata comes from the same visit records, with escaped text and missing names shown as a dash', () => {
  const { context, state, nodes } = createHarness();
  const metadata = ['brand', 'region', 'zone', 'province', 'city', 'storeCode', 'store', 'patroler', 'governor'];
  for (const summary of context.getMatchingStoreSummaries(state.visits)) {
    const record = state.visits.find((item) => item.storeId === summary.storeId);
    for (const key of metadata) assert.equal(summary[key], record[key], key);
  }
  const record = { ...fixtureRecords[0], status: '无录音', store: '<店 & "名">', patroler: '', governor: undefined };
  context.renderMatchingStoreTable([record]);
  const body = nodes.matchingTableBody.innerHTML;
  assert.match(body, /data-matching-field="patroler">—<\/td>/);
  assert.match(body, /data-matching-field="governor">—<\/td>/);
  assert.match(body, /&lt;店 &amp; &quot;名&quot;&gt;/);
  assert.doesNotMatch(body, /<small>|>P1<|>G1</);
  assert.match(body, /danger-text/);
  assert.match(body, /bad-rate/);
  assert.match(body, /muted-text">0/);
});

test('visible column order drives headers, cells and empty colspan with the action always last', () => {
  const { context, state, nodes } = createHarness();
  context.renderMatchingStoreTable(state.visits);
  assert.equal((nodes.matchingTableHead.innerHTML.match(/<th\b/g) || []).length, 15);
  assert.equal((nodes.matchingTableBody.innerHTML.split('</tr>')[0].match(/<td\b/g) || []).length, 15);
  state.settings.order.reverse();
  state.settings.visible = ['rate', 'store'];
  context.renderMatchingStoreTable(state.visits);
  const headers = nodes.matchingTableHead.innerHTML;
  assert.ok(headers.indexOf('录音匹配率') < headers.indexOf('门店'));
  assert.match(headers, /matching-actions-column">操作<\/th><\/tr>$/);
  assert.equal((headers.match(/<th\b/g) || []).length, 3);
  const row = nodes.matchingTableBody.innerHTML.split('</tr>')[0];
  assert.ok(row.indexOf('data-matching-field="rate"') < row.indexOf('data-matching-field="store"'));
  assert.match(row, /data-matching-store-id="[^"]+">查看<\/button><\/td>\s*$/);
  context.renderMatchingStoreTable([]);
  assert.match(nodes.matchingTableBody.innerHTML, /colspan="3"/);
});

test('checkbox and drag changes remain a draft, and cancel keeps the table and selected filters', () => {
  const { context, state, nodes, event, controllers, storage } = createHarness();
  state.model.set('store', [state.visits[0].storeId]);
  context.updateMatchingResults();
  context.renderMatchingDashboard();
  const before = plain({ settings: state.settings, filters: state.model.applied });
  const body = nodes.matchingTableBody.innerHTML;
  context.openMatchingFieldSettings();
  assert.equal(controllers[0].config.enabled(), true);
  const change = event('[data-matching-field-settings-check]', { matchingFieldSettingsCheck: 'store' });
  change.target.checked = false;
  context.document.activeElement = change.target;
  context.handleMatchingFieldSettingsChange(change);
  assert.equal(context.document.activeElement, nodes['matchingFieldSettingsList [data-matching-field-settings-check="store"]']);
  const reversed = [...state.draft.order].reverse();
  controllers[0].config.onOrderChange(reversed);
  assert.deepEqual(plain(state.draft.order), reversed);
  assert.equal(nodes.matchingTableBody.innerHTML, body);
  assert.deepEqual(plain(state.settings), before.settings);
  assert.deepEqual(plain(state.model.applied), before.filters);
  context.handleMatchingFieldSettingsClick(event('[data-matching-field-settings-close]'));
  assert.equal(state.draft, null);
  assert.equal(controllers[0].config.enabled(), false);
  assert.ok(controllers[0].cancellations > 0);
  assert.deepEqual(plain(state.settings), before.settings);
  assert.deepEqual(plain(state.model.applied), before.filters);
  assert.equal(storage.has(matchingFields.storageKey), false);
});

test('saving persists manual order and visibility across reload and both dimensions without changing visit settings', () => {
  const { context, state, nodes, event, controllers, storage } = createHarness();
  const visitConfig = JSON.stringify({ order: ['date'], visible: ['date'] });
  storage.set(fields.storageKey, visitConfig);
  const beforeVisitSettings = plain(context.visitFieldSettingsState);
  context.openMatchingFieldSettings();
  for (const key of ['brand', 'governor']) {
    const change = event('[data-matching-field-settings-check]', { matchingFieldSettingsCheck: key });
    change.target.checked = false;
    context.handleMatchingFieldSettingsChange(change);
  }
  const order = ['rate', 'store', ...state.draft.order.filter((key) => !['rate', 'store'].includes(key))];
  controllers[0].config.onOrderChange(order);
  context.saveMatchingFieldSettings();
  const saved = storage.get(matchingFields.storageKey);
  assert.deepEqual(JSON.parse(saved), plain(state.settings));
  assert.deepEqual(plain(state.settings.order), order);
  assert.equal(state.settings.visible.length, 12);
  assert.doesNotMatch(nodes.matchingTableHead.innerHTML, />品牌<|>治理员</);
  context.handleMatchingFilterClick(event('[data-matching-dimension]', { matchingDimension: 'geography' }));
  assert.equal(storage.get(matchingFields.storageKey), saved);
  assert.equal(storage.get(fields.storageKey), visitConfig);
  assert.deepEqual(plain(context.visitFieldSettingsState), beforeVisitSettings);
  const reloaded = createHarness({ savedSettings: saved });
  reloaded.context.renderMatchingDashboard();
  assert.deepEqual(plain(reloaded.state.settings), plain(state.settings));
  assert.equal(reloaded.nodes.matchingTableHead.innerHTML, nodes.matchingTableHead.innerHTML);
});

test('saving hidden columns clears their conditions in both paths and keeps date and advisor filtering active', () => {
  const { context, state, nodes, event } = createHarness();
  const record = state.visits[0];
  const linked = ['brand', 'region', 'zone', 'province', 'city', 'store', 'patroler', 'governor'];
  for (const key of [...linked, 'advisor']) state.model.draft[key] = [record[filters.fields[key].idKey]];
  Object.assign(state.filter, { startDate: record.date, endDate: record.date });
  state.model.apply();
  context.openMatchingFieldSettings();
  for (const key of linked) {
    const change = event('[data-matching-field-settings-check]', { matchingFieldSettingsCheck: key });
    change.target.checked = false;
    context.handleMatchingFieldSettingsChange(change);
  }
  context.saveMatchingFieldSettings();
  for (const key of linked) assert.deepEqual(plain(state.model.applied[key]), [], key);
  assert.deepEqual(plain(state.model.applied.advisor), [record.advisorKey]);
  assert.deepEqual(plain(state.filter), { startDate: record.date, endDate: record.date });
  assert.equal(nodes.matchingDimensionSwitcher.hidden, true);
  assert.equal(nodes.matchingDimensionFilters.innerHTML, '');
  assert.match(nodes.matchingPersonnelFilters.innerHTML, /data-matching-select-trigger="advisor"/);
  assert.doesNotMatch(nodes.matchingPersonnelFilters.innerHTML, /data-matching-select-trigger="patroler"|data-matching-select-trigger="governor"/);
  assert.equal(context.isMatchingFilterVisible('time'), true);
  const expected = state.visits.filter((item) => item.date === record.date && item.advisorKey === record.advisorKey).length;
  assert.equal(Number(nodes.matchingMetricVisits.textContent.replaceAll(',', '')), expected);
  const saved = plain(state.settings);
  context.handleMatchingFilterClick(event('[data-matching-filter-reset]'));
  assert.deepEqual(plain(state.settings), saved);
  assert.equal(nodes.matchingMetricVisits.textContent, '1,286');
});

test('hiding one field preserves other selected conditions even when they already produce no results', () => {
  const { context, state, nodes } = createHarness();
  const record = state.visits.find((item) => item.date === '2026-08-11'
    && !state.visits.some((other) => other.date === '2026-08-12' && other.advisorKey === item.advisorKey));
  for (const key of ['brand', 'region', 'store', 'advisor']) state.model.draft[key] = [record[filters.fields[key].idKey]];
  Object.assign(state.filter, { startDate: '2026-08-12', endDate: '2026-08-12' });
  state.model.apply();
  const before = plain(state.model.applied);
  context.openMatchingFieldSettings();
  state.draft.visible = state.draft.visible.filter((key) => key !== 'brand');
  context.saveMatchingFieldSettings();
  assert.deepEqual(plain(state.model.applied), { ...before, brand: [] });
  assert.equal(nodes.matchingMetricVisits.textContent, '0');
  assert.doesNotMatch(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="brand"/);
  assert.match(nodes.matchingDimensionFilters.innerHTML, /data-matching-select-trigger="region"/);
});

test('select all and restore operate on drafts, and saving no columns is rejected', () => {
  const { context, state, nodes, event, storage } = createHarness();
  context.openMatchingFieldSettings();
  context.handleMatchingFieldSettingsClick(event('[data-matching-field-settings-select-all]'));
  context.saveMatchingFieldSettings();
  assert.equal(state.draft.visible.length, 0);
  assert.equal(context.toast, '至少保留一个字段');
  assert.equal(storage.has(matchingFields.storageKey), false);
  assert.equal(nodes.matchingFieldSettingsDrawer.getAttribute('aria-hidden'), 'false');
  context.handleMatchingFieldSettingsClick(event('[data-matching-field-settings-select-all]'));
  assert.equal(state.draft.visible.length, 14);
  state.draft.visible = ['rate'];
  context.saveMatchingFieldSettings();
  assert.equal((nodes.matchingTableHead.innerHTML.match(/<th\b/g) || []).length, 2);
  context.openMatchingFieldSettings();
  context.handleMatchingFieldSettingsClick(event('[data-matching-field-settings-restore]'));
  assert.equal(state.draft.visible.length, 14);
  assert.deepEqual(plain(state.settings.visible), ['rate']);
  context.closeMatchingFieldSettings();
  assert.deepEqual(plain(state.settings.visible), ['rate']);
  context.openMatchingFieldSettings();
  context.handleMatchingFieldSettingsClick(event('[data-matching-field-settings-restore]'));
  context.saveMatchingFieldSettings();
  assert.deepEqual(plain(state.settings), matchingFields.createDefaultSettings());
});

test('corrupt or unavailable storage falls back to defaults and still permits a session setting', () => {
  assert.deepEqual(plain(createHarness({ savedSettings: '{broken' }).state.settings), matchingFields.createDefaultSettings());
  const { context, state } = createHarness({ storageError: true });
  context.openMatchingFieldSettings();
  state.draft.visible = ['store'];
  context.saveMatchingFieldSettings();
  assert.deepEqual(plain(state.settings.visible), ['store']);
  assert.equal(context.toast, '字段设置已保存');
});

test('drawer keyboard boundaries, Escape, backdrop and rapid reopening retain the right draft and focus', () => {
  const { context, state, nodes, node, event, timers, focus } = createHarness();
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'store' }));
  const trigger = node('settings-trigger');
  context.openMatchingFieldSettings(trigger);
  assert.equal(state.menu.openMenu, null);
  assert.equal(context.document.body.style.overflow, 'hidden');
  assert.equal(nodes.matchingFieldSettingsDrawer.inert, false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  const first = node('drawer-first'), last = node('drawer-last');
  nodes.matchingFieldSettingsDrawer.querySelectorAll = () => [first, last];
  nodes.matchingFieldSettingsDrawer.contains = (element) => [first, last].includes(element);
  context.document.activeElement = last;
  const tab = event('button', {}, 'Tab');
  context.handleMatchingFieldSettingsKeydown(tab);
  assert.equal(tab.prevented, true);
  assert.equal(focus(), 'drawer-first');
  tab.shiftKey = true;
  context.handleMatchingFieldSettingsKeydown(tab);
  assert.equal(focus(), 'drawer-last');
  context.document.activeElement = null;
  tab.shiftKey = false;
  context.handleMatchingFieldSettingsKeydown(tab);
  assert.equal(focus(), 'drawer-first');
  context.handleMatchingFieldSettingsKeydown(event('button', {}, 'Escape'));
  assert.equal(state.draft, null);
  assert.equal(nodes.matchingFieldSettingsDrawer.inert, true);
  assert.equal(context.document.body.style.overflow, '');
  assert.equal(focus(), 'settings-trigger');
  context.openMatchingFieldSettings(trigger);
  timers[0]();
  assert.equal(nodes.matchingFieldSettingsBackdrop.hidden, false);
  context.handleMatchingFieldSettingsClick({ target: nodes.matchingFieldSettingsBackdrop });
  timers.at(-1)();
  assert.equal(nodes.matchingFieldSettingsBackdrop.hidden, true);
  assert.equal(state.draft, null);
});

test('actual delegated click, checkbox and keyboard listeners drive settings and stop handled events', () => {
  const { context, state, event, listeners } = createHarness();
  for (const name of ['click', 'change', 'keydown']) {
    const start = source.indexOf(`document.addEventListener('${name}', function (event) {`);
    vm.runInContext(source.slice(start, source.indexOf('\n});', start) + 4), context);
  }
  const open = event('[data-matching-field-settings-open]');
  listeners.click[0](open);
  assert.equal(open.stopped, true);
  const change = event('[data-matching-field-settings-check]', { matchingFieldSettingsCheck: 'region' });
  change.target.checked = false;
  listeners.change[0](change);
  assert.equal(change.stopped, true);
  assert.ok(!state.draft.visible.includes('region'));
  const escape = event('button', {}, 'Escape');
  listeners.keydown[0](escape);
  assert.equal(escape.stopped, true);
  assert.ok(state.settings.visible.includes('region'));
  listeners.click[0](open);
  listeners.change[0](change);
  listeners.click[0](event('[data-matching-field-settings-save]'));
  assert.ok(!state.settings.visible.includes('region'));
});

test('leaving the route cancels unsaved settings and the header assigns each page its own drawer', () => {
  const { context, state, nodes, node, focus } = createHarness();
  let created = 0;
  context.document.createElement = (tag) => node(`created-${created++}-${tag}`);
  context.topActions = node('topActions');
  context.topActions.children = [];
  context.topActions.appendChild = (child) => context.topActions.children.push(child);
  context.validRoute = (route) => route;
  context.visitFieldSettingsDraft = null;
  context.storeFieldSettingsDraft = null;
  context.clearHiddenStoreFilters = () => {};
  context.routeButtons = [];
  context.pagePanels = [];
  context.title = node('title');
  context.description = node('description');
  context.document.body.classList = node('body').classList;
  context.window.location = { hash: '#dashboard' };
  context.window.scrollTo = () => {};
  vm.runInContext([declaration('pageMeta'), sourceFunction('renderActions'), sourceFunction('setRoute')].join('\n'), context);
  context.renderActions('dashboard');
  assert.equal(context.topActions.children.length, 1);
  assert.match(context.topActions.children[0].innerHTML, /data-matching-field-settings-open/);
  assert.match(context.topActions.children[0].innerHTML, /aria-controls="matchingFieldSettingsDrawer"/);
  context.openMatchingFieldSettings(node('route-trigger'));
  state.draft.visible = ['store'];
  const beforeFocus = focus();
  context.setRoute('visits');
  assert.equal(state.draft, null);
  assert.equal(state.settings.visible.length, 14);
  assert.equal(nodes.matchingFieldSettingsDrawer.getAttribute('aria-hidden'), 'true');
  assert.equal(focus(), beforeFocus);
  assert.match(context.topActions.children.at(-2).innerHTML, /data-visit-field-settings-open/);
  assert.equal(context.document.body.style.overflow, '');
});

function createExportFixture() {
  let tasks = [], time = Date.parse('2026-10-10T02:00:00Z');
  const store = { async update(action) {
    const draft = structuredClone(tasks);
    const result = action(draft);
    tasks = draft;
    return structuredClone(result);
  } };
  const make = () => exportTasks.createService({ store, userId: 'matching-test-user', now: () => time, buildFile: xlsx.createXlsxBytes });
  return { make, advance(milliseconds) { time += milliseconds; } };
}

test('matching exports create a managed task with all 14 saved fields and three store summary rows', async () => {
  const { context, state, nodes } = createHarness();
  const fixture = createExportFixture(), service = fixture.make();
  const submitted = [];
  context.window.ExportTaskUI.submit = (request) => { submitted.push(plain(request)); return service.submit(plain(request)); };
  context.renderMatchingDashboard();
  assert.equal(nodes.matchingExportButton.disabled, false);
  await context.exportMatchingStoreExcel();
  assert.equal(submitted.length, 1);
  const request = submitted[0];
  assert.equal(exportTasks.sources.matching, '录音排查');
  assert.equal(request.source, 'matching');
  assert.match(request.filename, /^录音排查_\d{8}_\d{6}\.xlsx$/);
  assert.equal(request.sheetName, '门店汇总');
  assert.deepEqual(request.columns.map((column) => column.label), matchingFields.fields.map((field) => field.label));
  assert.equal(request.rows.length, 3);
  assert.ok(request.rows.every((row) => row.length === 14 && row[9] === row[10] + row[11] + row[12]));
  for (const [index, total] of [[9, 1286], [10, 1185], [11, 69], [12, 32]]) {
    assert.equal(request.rows.reduce((sum, row) => sum + row[index], 0), total);
  }
  assert.ok(request.rows.every((row) => row[13] === `${(row[10] / row[9] * 100).toFixed(1)}%`));
  assert.equal(context.getMatchingExportCellValue({ visits: 0, matched: 0 }, 'rate'), '0.0%');
  assert.equal(context.getMatchingExportCellValue({ governor: '' }, 'governor'), '—');
  const task = (await fixture.make().list())[0];
  assert.equal(task.recordCount, 3);
  assert.equal(task.status, 'queued');
  assert.deepEqual(task.columns, request.columns);
  await assert.rejects(service.download(task.id), /尚未生成/);
  state.settings.visible = ['rate'];
  state.filter.startDate = '2099-01-01';
  fixture.advance(2000); await fixture.make().advance();
  assert.equal((await service.get(task.id)).status, 'running');
  fixture.advance(10000); await fixture.make().advance();
  const result = await service.download(task.id);
  const xml = new TextDecoder().decode(result.bytes);
  assert.match(xml, /sheet name="门店汇总"/);
  assert.match(xml, /dimension ref="A1:N4"/);
  assert.ok(!xml.includes('操作') && !xml.includes('data-matching-'));
  assert.deepEqual((await service.get(task.id)).filters, request.filters);
  assert.equal((await service.get(task.id)).status, 'completed');
  assert.equal(nodes.matchingExportButton.getAttribute('aria-busy'), 'false');
  if (process.env.MATCHING_EXPORT_QA_DIR) {
    const directory = process.env.MATCHING_EXPORT_QA_DIR;
    fs.writeFileSync(path.join(directory, 'matching-store-summary.xlsx'), result.bytes);
    fs.writeFileSync(path.join(directory, 'matching-store-summary.json'), JSON.stringify(request));
  }
});

test('matching export uses applied geographic filters and saved column order, ignoring open date and field drafts', async () => {
  const { context, state, submissions } = createHarness();
  const records = [...new Map(state.visits.map((record) => [record.storeId, record])).values()].slice(0, 2);
  state.model.setDimension('geography');
  for (const key of ['brand', 'province', 'city', 'store', 'advisor']) {
    state.model.draft[key] = [...new Set(records.map((record) => record[filters.fields[key].idKey]))];
  }
  state.model.apply();
  state.settings.order = ['rate', 'store', 'storeCode', 'action', ...state.settings.order.filter((key) => !['rate', 'store', 'storeCode', 'action'].includes(key))];
  state.settings.visible = ['rate', 'store', 'storeCode', 'action'];
  context.renderMatchingDashboard();
  context.openMatchingFieldSettings();
  state.draft.visible = [...state.draft.order];
  state.date.draftStartDate = '2099-01-01'; state.date.draftEndDate = '2099-01-02';
  state.model.draft.brand = [];
  await context.exportMatchingStoreExcel();
  const request = submissions[0];
  assert.deepEqual(request.columns.map((column) => column.label), ['录音匹配率', '门店', '店代码', '异常需处理']);
  assert.equal(request.rows.length, 2);
  assert.deepEqual(new Set(request.rows.map((row) => row[1])), new Set(records.map((record) => record.store)));
  const snapshot = new Map(request.filters.map((filter) => [filter.label, filter.value]));
  assert.equal(snapshot.get('筛选维度'), '地理维度');
  assert.equal(snapshot.get('到访日期'), '2026-08-11 至 2026-08-12');
  assert.equal(snapshot.get('品牌'), records[0].brand);
  assert.equal(snapshot.get('省份'), [...new Set(records.map((record) => record.provinceId))].map((id) => records.find((record) => record.provinceId === id).province).join('、'));
  assert.equal(snapshot.get('门店'), records.map((record) => record.store).join('、'));
  assert.equal(snapshot.get('顾问'), [...new Set(records.map((record) => record.advisorKey))].map((id) => records.find((record) => record.advisorKey === id).advisor).join('、'));
  assert.ok(!snapshot.has('大区') && !snapshot.has('战区'));
  assert.ok(!JSON.stringify(request.filters).includes('brand:'));
});

test('export content is fixed before readiness, repeat clicks are blocked and empty current results stay disabled', async () => {
  const { context, state, nodes, submissions, event } = createHarness();
  let ready;
  context.window.__exportReady = new Promise((resolve) => { ready = resolve; });
  context.renderMatchingDashboard();
  const pending = context.exportMatchingStoreExcel();
  assert.equal(state.exportBusy, true);
  assert.equal(nodes.matchingExportButton.disabled, true);
  assert.equal(nodes.matchingExportButton.getAttribute('aria-busy'), 'true');
  await context.exportMatchingStoreExcel();
  assert.equal(submissions.length, 0);
  state.settings.visible = ['store'];
  Object.assign(state.filter, { startDate: '2099-01-01', endDate: '2099-01-02' });
  context.renderMatchingDashboard();
  ready(); await pending;
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].rows.length, 3);
  assert.equal(submissions[0].columns.length, 14);
  assert.equal(submissions[0].filters.find((filter) => filter.label === '到访日期').value, '2026-08-11 至 2026-08-12');
  assert.equal(state.exportBusy, false);
  assert.equal(nodes.matchingExportButton.disabled, true);
  assert.equal(nodes.matchingExportButton.getAttribute('aria-busy'), 'false');
  await context.exportMatchingStoreExcel();
  assert.equal(submissions.length, 1);
  context.handleMatchingFilterClick(event('[data-matching-filter-reset]'));
  assert.equal(nodes.matchingExportButton.disabled, false);
});

test('load and submission errors are reported and export controls become usable again', async () => {
  for (const failure of ['load', 'submit']) {
    const { context, state, nodes, submissions } = createHarness();
    context.renderMatchingDashboard();
    const error = new Error(`${failure} failed`);
    if (failure === 'load') context.window.__exportReady = Promise.reject(error);
    else context.window.ExportTaskUI.submit = async () => { throw error; };
    await context.exportMatchingStoreExcel();
    assert.equal(context.toast, error.message);
    assert.equal(state.exportBusy, false);
    assert.equal(nodes.matchingExportButton.disabled, false);
    context.window.__exportReady = Promise.resolve();
    context.window.ExportTaskUI.submit = async (request) => { submissions.push(plain(request)); };
    await context.exportMatchingStoreExcel();
    assert.equal(submissions.length, 1);
  }
});

test('the delegated list export click submits the matching task and prevents the placeholder handler', async () => {
  const { context, state, event, listeners, submissions } = createHarness();
  context.renderMatchingDashboard();
  context.handleMatchingFilterClick(event('[data-matching-select-trigger]', { matchingSelectTrigger: 'store' }));
  const start = source.indexOf("document.addEventListener('click', function (event) {");
  vm.runInContext(source.slice(start, source.indexOf('\n});', start) + 4), context);
  const click = event('[data-matching-export]');
  listeners.click[0](click);
  assert.equal(click.stopped, true);
  assert.equal(state.menu.openMenu, null);
  await new Promise(setImmediate);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].source, 'matching');
});

test('export manager source menu, filtered list and details recognize the actual matching task', async () => {
  const { context, node } = createHarness();
  const fixture = createExportFixture(), service = fixture.make();
  context.window.ExportTaskUI.submit = (request) => service.submit(plain(request));
  context.renderMatchingDashboard();
  await context.exportMatchingStoreExcel();
  const task = (await service.list())[0];
  await service.submit({ source: 'leads', filename: 'other-source.xlsx', sheetName: '线索', filters: [], columns: [{ label: '线索ID' }], rows: [['L1']] });
  const manager = fs.readFileSync(path.join(root, 'export-management/page.js'), 'utf8');
  function managerFunction(name) {
    let start = manager.indexOf(`function ${name}(`);
    assert.notEqual(start, -1, name);
    if (manager.slice(start - 6, start) === 'async ') start -= 6;
    return manager.slice(start, manager.indexOf('\n  }\n', start) + 4);
  }
  const definitions = ['byId', 'escape', 'date', 'dateKey', 'status'].map((name) => manager.split('\n').find((line) => line.startsWith(`  const ${name} = `)));
  definitions.push(manager.split('\n').find((line) => line.startsWith('  function report(')));
  const choices = manager.indexOf('  const choices = ');
  definitions.push(manager.slice(choices, manager.indexOf('\n  };', choices) + 5));
  Object.assign(context, { ExportTasks: exportTasks, service, page: 1, pages: 1, detailId: null, lastMarkup: '', refreshVersion: 0, renderPages() {} });
  for (const id of ['exportSearch', 'exportStatus', 'exportStart', 'exportEnd']) node(id).value = '';
  node('exportSource').value = 'matching'; node('exportPageSize').value = '10';
  const control = node('source-control', { select: 'exportSource' });
  control.querySelector = () => ({ firstElementChild: node('source-label') });
  context.document.querySelectorAll = () => [control];
  vm.runInContext([...definitions, ...['filterValue', 'detail', 'syncSelects', 'refresh'].map(managerFunction)].join('\n'), context);
  context.syncSelects();
  assert.equal(node('source-label').textContent, '录音排查');
  assert.match(node('exportSourceMenu').innerHTML, /data-value="matching"><span>录音排查/);
  await context.refresh();
  assert.match(node('exportRows').innerHTML, /<td>录音排查<\/td>/);
  assert.match(node('exportRows').innerHTML, /<td>3<\/td>/);
  assert.ok(!node('exportRows').innerHTML.includes('other-source.xlsx'));
  const detail = context.detail(task);
  assert.match(detail, /来源：<strong>录音排查<\/strong>/);
  assert.match(detail, /2026-08-11 至 2026-08-12/);
  assert.equal((detail.match(/export-field-number/g) || []).length, 14);
  assert.ok(detail.indexOf('品牌') < detail.indexOf('录音匹配率'));
});

test('shared 50-store summaries paginate 20/20/10 while metrics and export cover the full filtered set', async () => {
  const { context, nodes, event, submissions } = createHarness({ linkedDemo: true });
  context.renderMatchingDashboard();
  const demo = context.window.AIQCLinkedDemo;
  const ordinaryVisits = context.getFilteredVisitRecords();
  assert.equal(ordinaryVisits.length, demo.visits.length);
  assert.equal(ordinaryVisits[0].date, demo.dateRange.endDate);
  assert.deepEqual(plain(ordinaryVisits.map(visit => `${visit.date} ${visit.startTime}`)),
    plain(ordinaryVisits.map(visit => `${visit.date} ${visit.startTime}`).sort().reverse()));
  assert.equal(nodes.matchingMetricVisits.textContent, demo.visits.length.toLocaleString('zh-CN'));
  assert.equal(nodes.matchingPaginationTotal.textContent, '共 50 家门店');
  const pageIds = () => [...nodes.matchingTableBody.innerHTML.matchAll(/data-matching-store-id="([^"]+)"/g)].map(match => match[1]);
  const all = [...pageIds()]; assert.equal(all.length, 20);
  context.handleMatchingFilterClick(event('[data-matching-page]', { matchingPage: '2' }));
  assert.equal(pageIds().length, 20); all.push(...pageIds());
  context.handleMatchingFilterClick(event('[data-matching-page]', { matchingPage: '3' }));
  assert.equal(pageIds().length, 10); all.push(...pageIds());
  assert.equal(new Set(all).size, 50);
  assert.equal(nodes.matchingMetricVisits.textContent, demo.visits.length.toLocaleString('zh-CN'));
  await context.exportMatchingStoreExcel();
  assert.equal(submissions[0].rows.length, 50);
  assert.equal(submissions[0].rows.reduce((sum, row) => sum + row[9], 0), demo.visits.length);
});

test('store filtering and anomaly drilldown use the same shared visits after pagination', () => {
  const { context, state, nodes, event } = createHarness({ linkedDemo: true });
  const demo = context.window.AIQCLinkedDemo;
  const store = demo.stores[4];
  state.model.set('store', [store.dealerWid]); state.model.apply();
  context.renderMatchingDashboard();
  assert.equal(nodes.matchingPaginationTotal.textContent, '共 1 家门店');
  const expected = demo.visits.filter(visit => visit.storeId === store.dealerWid);
  assert.equal(nodes.matchingMetricVisits.textContent, String(expected.length));
  context.openVisitsFromMatching(store.dealerWid, '异常需处理');
  const actual = plain(context.getFilteredVisitRecords());
  assert.ok(actual.length > 0);
  assert.ok(actual.every(visit => visit.storeId === store.dealerWid && ['无录音', '匹配失败'].includes(visit.status)));
});

test('visit ID navigation narrows a complete ID rather than also returning its suffixed copies', () => {
  const { context, state } = createHarness({ linkedDemo: true });
  state.visitFilter.businessId = 'BIZ-20260812-0136';
  state.visitFilter.startDate = state.visitFilter.endDate = context.window.AIQCLinkedDemo.getVisit(state.visitFilter.businessId).date;
  const actual = plain(context.getFilteredVisitRecords());
  assert.deepEqual(actual.map(visit => visit.businessId), ['BIZ-20260812-0136']);
});

test('template import hides business and lead IDs in list cells and exports while preserving sales records', async () => {
  const { context, state, submissions } = createHarness({ linkedDemo: true });
  vm.runInContext(sourceFunction('renderVisitFieldCell'), context);
  const imported = state.visits.filter(visit => visit.source === '模板导入');
  const sales = state.visits.find(visit => visit.source === '销售助手');
  const before = plain(state.visits);
  for (const visit of imported) {
    assert.equal(context.renderVisitFieldCell(visit, { key: 'businessId' }), '—');
    assert.equal(context.getVisitFieldValue(visit, { key: 'businessId' }), '—');
    assert.equal(context.getVisitFieldValue(visit, { key: 'leadId' }), '—');
    assert.equal(context.renderVisitFieldCell(visit, { key: 'leadId' }), '—');
  }
  assert.equal(context.renderVisitFieldCell(sales, { key: 'businessId' }), sales.businessId);
  state.visitFilter.source = ['模板导入'];
  context.visitFieldSettingsState.visible = ['businessId', 'leadId'];
  await context.exportVisitDetailExcel();
  const request = submissions[0];
  assert.deepEqual(request.columns.map(column => column.label), ['业务 ID', '线索ID']);
  assert.equal(request.rows.length, imported.length);
  assert.ok(request.rows.every(row => row[0] === '—' && row[1] === '—'));
  assert.deepEqual(plain(state.visits), before);
});

function visitDrilldownHarness() {
  const harness = createHarness({ linkedDemo: true });
  const { context, node } = harness;
  let created = 0;
  context.document.createElement = (tag) => node(`created-${tag}-${created++}`);
  context.document.body.classList = node('body').classList;
  context.topActions = node('topActions');
  context.topActions.children = [];
  context.topActions.appendChild = (child) => context.topActions.children.push(child);
  context.title = node('title'); context.description = node('description');
  context.routeButtons = ['dashboard', 'visits', 'stores', 'badges'].map((route) => node(`nav:${route}`, { route }));
  context.pagePanels = ['dashboard', 'visits', 'stores', 'badges'].map((page) => node(`panel:${page}`, { page }));
  context.visitFieldSettingsDraft = null;
  context.storeFieldSettingsDraft = null;
  context.clearHiddenStoreFilters = () => {};
  context.storeDrilldownState = { active: false };
  context.closeBadgeRecordDrawer = () => {};
  context.handleVisitEventFiltersClick = context.handleVisitFieldSettingsClick = context.handleBadgeManagementClick = () => false;
  context.closeVisitFieldSettings = () => { context.visitFieldSettingsDraft = null;
  context.storeFieldSettingsDraft = null;
  context.clearHiddenStoreFilters = () => {}; };
  node('visitFilterControls').classList.add('is-collapsed');
  node('visitTableHeadRow').closest = () => node('visit-table');
  vm.runInContext(declaration('pageMeta') + '\n' + [
    'validRoute', 'getRouteState', 'renderActions', 'setRoute', 'handleDeviceRouteChange', 'applyLinkedDemoRoute',
    'getVisitPaginationItems', 'renderVisitPagination', 'renderVisits', 'getVisitMetricCategory',
    'getVisitStatusClass', 'getVisitDetailType', 'renderVisitFieldCell', 'renderVisitActions', 'saveVisitFieldSettings'
  ].map(sourceFunction).join('\n') + '\n' + ['visitWaitingStatuses', 'visitUploadDetailStatuses', 'visitEventDetailStatuses'].map((name) => declaration(name)).join('\n'), context);
  const clickStart = source.indexOf("document.addEventListener('click', (event) => {");
  vm.runInContext(source.slice(clickStart, source.indexOf('\n});', clickStart) + 4), context);
  harness.click = (event) => harness.listeners.click[0](event);
  return harness;
}

test('store visit route uses the matching menu, a store title and the existing visit actions and return capsule', () => {
  const { context, state, nodes } = visitDrilldownHarness();
  const record = state.visits[0];
  context.openVisitsFromMatching(record.storeId);
  assert.equal(context.title.textContent, `${record.store} · 到访明细`);
  assert.equal(context.document.title, `${record.store} · 到访明细 · AI质检平台`);
  assert.equal(nodes['nav:dashboard'].classList.contains('active'), true);
  assert.equal(nodes['nav:dashboard'].getAttribute('aria-current'), 'page');
  assert.equal(nodes['nav:visits'].classList.contains('active'), false);
  assert.equal(nodes['panel:visits'].classList.contains('active'), true);
  assert.equal(nodes['[data-visit-store-drilldown-actions]'].hidden, false);
  assert.match(context.topActions.children.at(-2).innerHTML, /data-visit-field-settings-open/);
  assert.equal(context.topActions.children.at(-1).dataset.action, 'import');
  assert.match(context.window.location.hash, /^#store-visits\?/);
  const html = fs.readFileSync(path.join(root, 'device-management/index.html'), 'utf8');
  const panelStart = html.indexOf('data-page="visits"'), returnStart = html.indexOf('data-visit-store-drilldown-actions');
  assert.ok(returnStart > panelStart && returnStart < html.indexOf('data-visit-filter-card', panelStart));
  assert.match(html.slice(returnStart, html.indexOf('</div>', returnStart)), /class="store-drilldown-back"/);
  assert.doesNotMatch(html.slice(0, panelStart), /data-visits-back-matching/);
  const navigationSource = fs.readFileSync(path.join(root, 'unified-navigation-shell.js'), 'utf8');
  const navStart = navigationSource.indexOf('function getCurrentNavigationPage(');
  context.window.location.pathname = '/device-management/index.html';
  vm.runInContext(navigationSource.slice(navStart, navigationSource.indexOf('\n  }', navStart) + 4), context);
  assert.equal(context.getCurrentNavigationPage(), 'device-dashboard');
});

test('every one of the 50 store drilldowns matches its parent anomaly count and can only show that store', () => {
  const { context, state } = createHarness({ linkedDemo: true });
  for (const summary of context.getMatchingStoreSummaries(context.getFilteredMatchingVisitRecords())) {
    assert.equal(context.openVisitsFromMatching(summary.storeId), true);
    const anomalies = context.getFilteredVisitRecords();
    assert.equal(anomalies.length, summary.action, summary.storeCode);
    assert.ok(anomalies.every((record) => record.storeId === summary.storeId && ['无录音', '匹配失败'].includes(record.status)));
    state.visitFilter.status = [];
    state.visitModel.reset();
    assert.equal(context.getFilteredVisitRecords().length, summary.visits);
    assert.ok(context.getFilteredVisitRecords().every((record) => record.storeId === summary.storeId));
    context.restoreOrdinaryVisitState();
  }
});

test('status changes, dimension changes, hidden fields and reset retain the store and restore the entry conditions', () => {
  const { context, state, event, click } = visitDrilldownHarness();
  const record = state.visits.find((item) => item.status === '匹配失败' && item.patrolerId && item.governorId);
  state.model.setDimension('geography');
  for (const key of ['province', 'city', 'patroler', 'governor', 'advisor']) state.model.set(key, [record[filters.fields[key].idKey]]);
  state.filter.startDate = state.filter.endDate = record.date;
  context.updateMatchingResults();
  const parent = plain({ organization: state.model.applied, dates: state.filter });
  const expected = context.getFilteredMatchingVisitRecords().filter((item) => item.storeId === record.storeId && context.getMatchingRecordCategory(item) === 'action');
  click(event('[data-matching-drilldown]', { matchingStoreId: record.storeId }));
  assert.match(context.renderVisitMultiSelect('store'), /disabled/);
  assert.doesNotMatch(context.renderVisitMultiSelect('store'), /data-visit-select-trigger/);
  context.handleVisitOrganizationClick(event('[data-visit-select-value]', { visitSelectKey: 'status', visitSelectValue: '异常需处理' }));
  context.handleVisitOrganizationClick(event('[data-visit-select-value]', { visitSelectKey: 'status', visitSelectValue: '已匹配' }));
  assert.ok(context.getFilteredVisitRecords().length > 0);
  assert.ok(context.getFilteredVisitRecords().every((item) => item.storeId === record.storeId && item.status === '已匹配'));
  context.handleVisitOrganizationClick(event('[data-visit-dimension]', { visitDimension: 'organization' }));
  assert.deepEqual(plain(state.visitModel.applied.store), [record.storeId]);
  const otherStore = state.visits.find((item) => item.storeId !== record.storeId);
  context.handleVisitOrganizationClick(event('[data-visit-select-value]', { visitSelectKey: 'store', visitSelectValue: otherStore.storeId }));
  assert.deepEqual(plain(state.visitModel.applied.store), [record.storeId]);
  context.visitFieldSettingsState.visible = ['businessId'];
  context.clearHiddenVisitFilters();
  assert.ok(context.getFilteredVisitRecords().every((item) => item.storeId === record.storeId));
  assert.ok(context.getVisitSelectCandidates('advisor').every((item) => state.visits.some((visit) => visit.storeId === record.storeId && visit.advisorKey === item.value)));
  state.visitFilter.businessId = 'nothing'; state.visitFilter.startDate = '2020-01-01';
  click(event('[data-visit-filter-reset]'));
  assert.deepEqual(plain(state.visitModel.applied), { ...parent.organization, store: [record.storeId] });
  assert.equal(state.visitFilter.startDate, parent.dates.startDate);
  assert.equal(state.visitFilter.endDate, parent.dates.endDate);
  assert.deepEqual(plain(state.visitFilter.status), ['异常需处理']);
  assert.deepEqual(plain(context.getFilteredVisitRecords().map((item) => item.businessId)), plain(expected.map((item) => item.businessId)));
  assert.deepEqual(context.visitFieldSettingsState.visible, ['businessId']);
});

test('inherited selections from another store stay removable without offering new outside-store candidates', () => {
  const { context, state, event } = visitDrilldownHarness();
  const own = state.visits[0], other = state.visits.find((item) => item.storeId !== own.storeId);
  state.model.set('advisor', [own.advisorKey, other.advisorKey]);
  context.updateMatchingResults(); context.openVisitsFromMatching(own.storeId);
  context.handleVisitOrganizationClick(event('[data-visit-select-trigger]', { visitSelectTrigger: 'advisor' }));
  const choices = context.getVisitSelectCandidates('advisor');
  assert.ok(choices.some((item) => item.value === other.advisorKey));
  assert.ok(choices.every((item) => item.value === other.advisorKey || state.visits.some((visit) => visit.storeId === own.storeId && visit.advisorKey === item.value)));
  context.handleVisitOrganizationClick(event('[data-visit-select-value]', { visitSelectKey: 'advisor', visitSelectValue: other.advisorKey }));
  assert.deepEqual(plain(state.visitModel.applied.advisor), [own.advisorKey]);
  assert.deepEqual(plain(context.getVisitSelectCandidates('advisor').map((item) => item.value)), plain(choices.map((item) => item.value)));
  context.closeRecordDrawerMenuState(state.visitMenu, true);
  assert.ok(!context.getVisitSelectCandidates('advisor').some((item) => item.value === other.advisorKey));
  assert.ok(context.getFilteredVisitRecords().every((item) => item.storeId === own.storeId));
  assert.deepEqual(plain(state.model.applied.advisor), [own.advisorKey, other.advisorKey]);
});

test('return restores parent pagination and both scroll axes, ordinary visit state, and keeps shared saved fields', () => {
  const { context, state, event, click, nodes, node, storage } = visitDrilldownHarness();
  state.visitFilter.status = ['已匹配']; state.visitFilter.businessId = 'BIZ';
  Object.assign(state.visitFilter, context.window.AIQCLinkedDemo.dateRange);
  state.visitModel.set('brand', ['brand:埃安']); state.visitModel.apply();
  context.visitPaginationState.page = 4; context.visitPaginationState.pageSize = 50;
  node('visitFilterControls').classList.remove('is-collapsed');
  const ordinary = plain({ filters: state.visitFilter, organization: state.visitModel.applied, pagination: context.visitPaginationState });
  state.pagination.page = 3; context.renderMatchingStoreTable(context.getFilteredMatchingVisitRecords());
  nodes['.matching-table-scroll'] ||= node('.matching-table-scroll');
  nodes['.matching-table-scroll'].scrollTop = 241; nodes['.matching-table-scroll'].scrollLeft = 356;
  context.window.scrollY = 84;
  const parent = plain({ filters: state.filter, organization: state.model.applied, pagination: state.pagination });
  const parentRows = nodes.matchingTableBody.innerHTML;
  const record = context.getMatchingStoreSummaries(context.getFilteredMatchingVisitRecords())[42];
  click(event('[data-matching-drilldown]', { matchingStoreId: record.storeId }));
  const changedFields = { ...plain(context.visitFieldSettingsState), order: [...context.visitFieldSettingsState.order].reverse() };
  context.visitFieldSettingsDraft = changedFields;
  context.saveVisitFieldSettings();
  const savedFields = plain(context.visitFieldSettingsState);
  assert.deepEqual(savedFields.order, changedFields.order);
  state.visitFilter.status = ['无录音']; state.visitFilter.customerKeyword = '改变';
  context.visitPaginationState.pageSize = 20;
  nodes['.matching-table-scroll'].scrollTop = 0; nodes['.matching-table-scroll'].scrollLeft = 0;
  click(event('[data-visits-back-matching]'));
  assert.equal(context.title.textContent, '录音排查');
  assert.equal(state.visitScope.active, false);
  assert.deepEqual(plain({ filters: state.filter, organization: state.model.applied, pagination: state.pagination }), parent);
  assert.equal(nodes.matchingTableBody.innerHTML, parentRows);
  assert.equal(nodes['.matching-table-scroll'].scrollTop, 241); assert.equal(nodes['.matching-table-scroll'].scrollLeft, 356);
  assert.equal(context.scrollPosition.top, 84);
  assert.deepEqual(plain({ filters: state.visitFilter, organization: state.visitModel.applied, pagination: context.visitPaginationState }), ordinary);
  assert.deepEqual(plain(context.visitFieldSettingsState), savedFields);
  assert.deepEqual(JSON.parse(storage.get(fields.storageKey)), savedFields);
  assert.equal(node('visitFilterControls').classList.contains('is-collapsed'), false);
  assert.equal(state.inherited.size, 0);
  context.handleDeviceRouteChange();
  assert.equal(context.scrollPosition.top, 84);
  context.setRoute('visits');
  assert.equal(nodes['[data-visit-store-drilldown-actions]'].hidden, true);
  assert.equal(nodes['nav:visits'].classList.contains('active'), true);
  assert.match(nodes.visitPagination.innerHTML, /data-visit-page="4">4/);
});

test('hash handling retains a live child and restores ordinary state on back, then rebuilds the store on forward', () => {
  const { context, state, nodes, node } = visitDrilldownHarness();
  state.visitFilter.source = ['模板导入'];
  const before = plain(state.visitFilter);
  node('.matching-table-scroll').scrollTop = 188; state.pagination.page = 2;
  context.openVisitsFromMatching(state.visits[0].storeId);
  const hash = context.window.location.hash;
  state.visitFilter.status = ['已匹配']; context.updateVisitResults();
  context.handleDeviceRouteChange();
  assert.deepEqual(plain(state.visitFilter.status), ['已匹配']);
  context.window.location.hash = '#dashboard'; context.handleDeviceRouteChange();
  assert.equal(state.visitScope.active, false);
  assert.deepEqual(plain(state.visitFilter), before);
  assert.equal(state.pagination.page, 2); assert.equal(nodes['.matching-table-scroll'].scrollTop, 188);
  context.window.location.hash = hash; context.handleDeviceRouteChange();
  assert.equal(state.visitScope.active, true);
  assert.deepEqual(plain(state.visitFilter.status), ['异常需处理']);
  assert.equal(context.title.textContent, `${state.visits[0].store} · 到访明细`);
});

test('a cold route rebuilds entry dates and multi-select personnel without depending on ordinary saved visibility', () => {
  const original = visitDrilldownHarness(), { context, state } = original;
  const record = state.visits.find((item) => item.status === '匹配失败' && item.patrolerId && item.governorId);
  state.model.setDimension('geography');
  const advisors = [...new Set(state.visits.filter((item) => item.storeId === record.storeId).map((item) => item.advisorKey))];
  for (const key of ['brand', 'province', 'city', 'patroler', 'governor']) state.model.set(key, [record[filters.fields[key].idKey]]);
  state.model.set('advisor', advisors.slice(0, 2));
  state.filter.startDate = state.filter.endDate = record.date; context.updateMatchingResults();
  state.date.draftStartDate = '2030-01-01';
  context.openVisitsFromMatching(record.storeId);
  const expected = plain(context.getFilteredVisitRecords().map((item) => item.businessId));
  const entry = plain(state.visitModel.applied), hash = context.window.location.hash;
  state.visitFilter.status = [];
  const fresh = visitDrilldownHarness();
  fresh.context.visitFieldSettingsState.visible = ['businessId'];
  fresh.context.window.location.hash = hash;
  const start = source.indexOf('let initialRouteState = getRouteState();');
  vm.runInContext(source.slice(start, source.indexOf('\nrenderStoreOverview();', start)), fresh.context);
  assert.equal(fresh.state.visitScope.active, true);
  assert.deepEqual(plain(fresh.state.visitModel.applied), entry);
  assert.equal(fresh.state.visitFilter.startDate, record.date); assert.equal(fresh.state.visitFilter.endDate, record.date);
  assert.deepEqual(plain(fresh.state.visitFilter.status), ['异常需处理']);
  assert.deepEqual(plain(fresh.context.getFilteredVisitRecords().map((item) => item.businessId)), expected);
  assert.ok(fresh.context.isVisitFilterVisible('time') && fresh.context.isVisitFilterVisible('status'));
  assert.deepEqual(fresh.context.visitFieldSettingsState.visible, ['businessId']);
  assert.equal(fresh.context.title.textContent, `${record.store} · 到访明细`);
});

test('invalid store routes return to matching and malformed dates use safe default dates', () => {
  const { context, state } = visitDrilldownHarness();
  const before = plain(state.visitFilter);
  context.window.location.hash = '#store-visits?store=missing&brand=埃安';
  context.handleDeviceRouteChange();
  assert.equal(context.window.location.hash, '#dashboard');
  assert.equal(state.visitScope.active, false); assert.deepEqual(plain(state.visitFilter), before);
  assert.equal(context.openVisitsFromMatching('missing'), false);
  const record = state.visits[0];
  const params = new URLSearchParams({ store: record.storeCode, brand: record.brand, startDate: '2026-02-31', endDate: 'no-date' });
  assert.equal(context.applyVisitStoreDrilldownFromRoute(params), true);
  assert.equal(state.visitFilter.startDate, context.window.AIQCLinkedDemo.dateRange.startDate);
  assert.equal(state.visitFilter.endDate, context.window.AIQCLinkedDemo.dateRange.endDate);
  params.set('brand', record.brand === '埃安' ? '传祺' : '埃安');
  assert.equal(context.applyVisitStoreDrilldownFromRoute(params), false);
  context.window.location.hash = '#store-visits?store=missing'; context.handleDeviceRouteChange();
  assert.equal(state.visitScope.active, false); assert.deepEqual(plain(state.visitFilter), before);
});

test('child exports include all current store records and saved columns rather than only the displayed page', async () => {
  const { context, state, nodes, submissions } = visitDrilldownHarness();
  const record = state.visits[0];
  context.openVisitsFromMatching(record.storeId);
  state.visitFilter.status = ['已匹配'];
  context.visitFieldSettingsState.visible = ['businessId', 'storeCode', 'status'];
  context.updateVisitResults(); context.visitPaginationState.page = 2; context.renderVisits();
  const expected = context.getFilteredVisitRecords();
  assert.ok(expected.length > 20);
  assert.equal((nodes.visitTableBody.innerHTML.match(/<tr>/g) || []).length, 20);
  await context.exportVisitDetailExcel();
  assert.equal(submissions.length, 1);
  const request = submissions[0];
  assert.equal(request.source, 'visits'); assert.equal(request.rows.length, expected.length);
  assert.deepEqual(request.columns.map((column) => column.label), ['业务 ID', '店代码', '匹配状态']);
  assert.ok(request.rows.every((row) => row[1] === record.storeCode && row[2] === '已匹配'));
  assert.equal(request.filters.find((filter) => filter.label === '当前门店').value, record.store);
  assert.equal(request.filters.find((filter) => filter.label === '匹配状态').value, '已匹配');
});

test('following a linked visit from the child releases the store constraint and focuses the exact other-store record', () => {
  const { context, state, nodes } = visitDrilldownHarness();
  const original = state.visits[0], target = state.visits.find((item) => item.storeId !== original.storeId);
  context.openVisitsFromMatching(original.storeId);
  context.window.location.hash = new URL(context.window.AIQCLinkedDemo.listUrl('visit', target.businessId), 'https://local.test').hash;
  context.handleDeviceRouteChange();
  assert.equal(state.visitScope.active, false);
  assert.deepEqual(plain(context.getFilteredVisitRecords().map((item) => item.businessId)), [target.businessId]);
  assert.equal(state.visitFilter.startDate, target.date); assert.equal(state.visitFilter.endDate, target.date);
  assert.equal(nodes['[data-visit-store-drilldown-actions]'].hidden, true);
  assert.equal(nodes['nav:visits'].classList.contains('active'), true);
});


test('store drilldown hides both dimension fields and personnel without changing scope, reset or ordinary visibility', () => {
  const { context, state } = createHarness();
  const keys = Object.keys(filters.fields);
  const ordinary = keys.map(key => context.isVisitFilterVisible(key));
  const record = state.visits[0];
  for (const dimension of ['organization', 'geography']) {
    state.model.setDimension(dimension); context.updateMatchingResults();
    context.openVisitsFromMatching(record.storeId);
    assert(keys.every(key => !context.isVisitFilterVisible(key)));
    assert.equal(context.isVisitFilterVisible('source'), true);
    assert.equal(context.isVisitFilterVisible('status'), true);
    assert.equal(context.isVisitFilterVisible('time'), true);
    context.resetVisitFilters();
    assert(keys.every(key => !context.isVisitFilterVisible(key)));
    assert.deepEqual(plain(state.visitModel.applied.store), [record.storeId]);
    assert(context.getFilteredVisitRecords().every(item => item.storeId === record.storeId));
    context.restoreOrdinaryVisitState();
    assert.deepEqual(keys.map(key => context.isVisitFilterVisible(key)), ordinary);
  }
});

test('store drilldown rendering omits both dimension and personnel controls and restores ordinary controls', () => {
  const { context, state, nodes } = createHarness();
  context.beginRecordDrawerMenuRender = () => true;
  context.visitMenuMotion = { lastRendered: null };
  context.positionVisitFilterMenu = context.syncVisitTimeFilterControl = context.playRecordDrawerMenuMotion = () => {};
  vm.runInContext(sourceFunction('renderVisitOrganizationFilters'), context);
  for (const dimension of ['organization', 'geography']) {
    state.model.setDimension(dimension); context.updateMatchingResults();
    context.openVisitsFromMatching(state.visits[0].storeId);
    context.renderVisitOrganizationFilters();
    assert.equal(nodes.visitDimensionSwitcher.hidden, true);
    assert.equal(nodes.visitDimensionFilters.innerHTML, '');
    assert.equal(nodes.visitPersonnelFilters.innerHTML, '');
    assert.match(nodes.visitEnumFilters.innerHTML, /data-visit-select-trigger="source"/);
    assert.match(nodes.visitEnumFilters.innerHTML, /data-visit-select-trigger="status"/);
    context.restoreOrdinaryVisitState(); context.renderVisitOrganizationFilters();
    assert.equal(nodes.visitDimensionSwitcher.hidden, false);
    assert.match(nodes.visitDimensionFilters.innerHTML, /data-visit-select-trigger="store"/);
    assert.match(nodes.visitPersonnelFilters.innerHTML, /data-visit-select-trigger="advisor"/);
  }
});
