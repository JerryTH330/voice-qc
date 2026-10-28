const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const filters = require('../dashboard-filter-utils.js');
const utils = require('../factory-dashboard/issue-rule-analysis-utils.js');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'factory-dashboard/factory-dashboard.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const block = (start, end) => {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert(from >= 0 && to > from, start + ' → ' + end);
  return source.slice(from, to);
};
const totals = rows => rows.reduce((sum, row) => ({ sampleCount: sum.sampleCount + row.sampleCount, hitCount: sum.hitCount + row.hitCount }), { sampleCount: 0, hitCount: 0 });

function setup() {
  const context = vm.createContext({ window: {}, filters, utils });
  vm.runInContext(fs.readFileSync(path.join(root, 'factory-dashboard/organization-filter.js'), 'utf8'), context);
  vm.runInContext(`
    const { SCENE_KEYS, SOURCE_KEYS, normalizeSceneSelection } = filters;
    const { aggregateIssueRulesByScenes, sortIssueOrgRows, buildIssueOrgRows, scopeIssueRules } = utils;
    const dealers = [
      { brand: '传祺', area: '华南大区', regionId: 'R1', zone: '广州战区', zoneId: 'Z1', province: '广东省', city: '广州市', dealerCode: 'S1', dealerName: '同名店', patrolerId: 'P1', governorId: 'G1' },
      { brand: '传祺', area: '华南大区', regionId: 'R1', zone: '深圳战区', zoneId: 'Z2', province: '广东省', city: '深圳市', dealerCode: 'S2', dealerName: '同名店', patrolerId: 'P2', governorId: 'G2' },
      { brand: '埃安', area: '华南大区', regionId: 'R2', zone: '广州战区', zoneId: 'Z3', province: '广东省', city: '广州市', dealerCode: 'S3', dealerName: '乙店', patrolerId: 'P3', governorId: 'G3' },
      { brand: '埃安', area: '华东大区', regionId: 'R3', zone: '上海战区', zoneId: 'Z4', province: '上海市', city: '上海市', dealerCode: 'S4', dealerName: '丙店', patrolerId: 'P4', governorId: 'G4' }
    ];
    dealers.forEach((dealer, index) => Object.assign(dealer, { patroler: '巡回' + index, governor: '治理' + index }));
    const records = [0, 0, 1, 2, 3].map((dealer, index) => ({ advisorId: 'A' + index, advisorName: '顾问' + index, dealer: dealers[dealer] }));
    const sharedOrganizationDirectory = { recordings: records };
    const row = (dealer, series) => { const result = []; result[3] = 1; result[5] = dealer; result[13] = series; return result; };
    window.__SESSION_REAL_RECORDING_DATA = { dealerKeys: [['传祺', 'S1'], ['埃安', 'S3']], series: ['M8系列', 'GS8系列', 'AION Y'], rows: [row(0, 0), row(0, 1), row(1, 2)] };
    const FACTORY_SCENE_FILTER_OPTIONS = Object.values(SCENE_KEYS).map(value => ({ value, label: value }));
    const issueRuleAnalysisState = { activeTab: 'advantage', path: [], sort: 'rate-desc', page: 1, pageSize: 10, query: '', selectedRuleId: 'r' };
    const sopAnalysisState = { ...issueRuleAnalysisState, path: [], activeTab: 'sop' };
    const config = { metricLabel: '命中率', countLabel: '命中/样本', rules: [{ id: 'r', name: '规则', sampleCount: 120, hitCount: 90, rate: 75, sceneStats: { [SCENE_KEYS.firstFollow]: { sampleCount: 80, hitCount: 64 }, [SCENE_KEYS.inviteStore]: { sampleCount: 40, hitCount: 26 } } }] };
    const ISSUE_RULE_TABS = { advantage: config, sop: config };
    let currentRegion = 'all', currentZone = 'all', currentStore = 'all', currentBrand = 'all', currentTime = '1', currentModels = [], currentModel = 'all';
    let currentSource = SOURCE_KEYS.all, currentScenes = [SCENE_KEYS.all], factorySelectedOrgPath = '';
    let factoryTimeStartDate = '2026-10-18', factoryTimeEndDate = '2026-10-18';
    const factoryDateState = { open: false, draftStartDate: '', draftEndDate: '' };
    const parseFactoryDateValue = value => value ? new Date(value + 'T00:00:00') : null;
    const clampFactoryDateValue = value => value;
    const FACTORY_ALL_ORG_VALUE = '全部组织';
    const factoryDateReady = false;
    const renderFactoryDateControl = () => {};
    const updateOrgLabel = () => {};
    const syncFactoryTimeRangeFromQuickFilter = () => { factoryTimeStartDate = factoryTimeEndDate = '2026-10-18'; };
    let change, refreshes = 0;
    const applyGlobalFilter = () => { refreshes++; };
    const renderSOPAnalysis = applyGlobalFilter, renderIssueRuleAnalysis = applyGlobalFilter;
    const realCreate = window.FactoryOrganizationFilter.createModel;
    window.FactoryOrganizationFilter.mount = options => { change = options.onChange; return realCreate(options.records, options.fields); };
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let eventRoot;
    const document = { getElementById: () => eventRoot || ({}), body: { dataset: { issueRuleSortBound: 'true' } } };
    ${block('  const organizationFilter = window.FactoryOrganizationFilter.mount({', '  // ── 7b.')}
    ${block('  const getFactorySceneSelection =', '  // 绑定人员筛选')}
    ${block('  const getFactoryRangeInclusiveDays =', '  const getFactoryTimeRangeKey =')}
    ${block('  const getActiveIssueRuleConfig =', '  const getIssueRuleSortLabel =')}
    ${block('  const getCurrentOrgChildren =', '  const getVisibleIssueRules =')}
    ${block('  const getVisibleIssueRules =', '  const escapeIssueExportCsvCell =')}
    ${block('  const renderOrgRankList =', '  const renderIssueSelectedMetricIcon =')}
    ${block('  const renderOrgDrillView =', '  const bindIssueRuleAnalysisEvents =')}
    ${block('  const bindIssueRuleAnalysisEvents =', '  const renderIssueRuleAnalysis =')}
    ${block('  const getFactoryScopedRecordings =', '  const syncFactorySharedKpiCounts =')}
    ${block('  function applyFactoryDateFilters()', '  syncFactoryTimeRangeFromQuickFilter(currentTime);')}
    const state = issueRuleAnalysisState;
    const bindRows = () => {
      const nodes = getCurrentOrgChildren(state, getActiveIssueRule(state) || {}).filter(row => row.drillable)
        .map(row => ({ dataset: { orgId: row.id }, addEventListener(type, fn) { this[type] = fn; } }));
      const back = { addEventListener(type, fn) { this[type] = fn; } };
      eventRoot = {
        querySelector: selector => selector === '.issue-org-back' ? back : null,
        querySelectorAll: selector => selector === '.issue-org-row:not(.disabled)' ? nodes : [],
        closest() { return this; }
      };
      bindIssueRuleAnalysisEvents(false, 'issue-sop-analysis-root', state);
      return { nodes, back };
    };
    this.api = {
      filter: organizationFilter, state, sop: sopAnalysisState, records,
      change: () => change(),
      select(key, values) { organizationFilter.set(key, values); change(); },
      rule: () => getActiveIssueRule(state),
      children: () => getCurrentOrgChildren(state, getActiveIssueRule(state) || {}),
      markup: () => renderOrgDrillView(config, getActiveIssueRule(state) || {}, state),
      draft(start, end) { factoryDateState.draftStartDate = start; factoryDateState.draftEndDate = end; },
      applyDate: applyFactoryDateFilters,
      reset() { organizationFilter.reset(); change({ reset: true }); },
      drill(id) { const row = bindRows().nodes.find(node => node.dataset.orgId === id); if (!row) throw new Error('No drillable row'); row.click(); },
      back() { bindRows().back.click(); },
      refreshes: () => refreshes
    };
  `, context);
  return context.api;
}

test('current organization list uses the selected brand scope instead of the independent demo tree', () => {
  const h = setup(); h.select('brand', ['传祺']);
  assert.deepEqual(plain(h.children().map(row => row.name)), ['华南大区']);
  assert(h.children().every(row => row.records.every(record => record.dealer.brand === '传祺')));
  assert.equal(h.rule().sampleCount, 72);
});

test('multi-select follows selected levels, and same-name stores and organizations retain separate identities', () => {
  const h = setup();
  const south = h.children().filter(row => row.name.includes('华南大区'));
  assert.equal(south.length, 2); assert.notEqual(south[0].id, south[1].id);
  h.select('brand', ['传祺']); h.select('region', ['华南大区']);
  assert.deepEqual(plain(h.children().map(row => row.level)), ['zone', 'zone']);
  h.select('store', ['传祺::S1', '传祺::S2']);
  const rows = h.children(); assert.equal(rows.length, 2);
  assert.notEqual(rows[0].id, rows[1].id); assert.notEqual(rows[0].name, rows[1].name);
  assert(rows.every(row => row.level === 'store' && !row.drillable));
});

test('geography uses province, city and the filtered stores rather than organization nodes', () => {
  const h = setup(); h.filter.setDimension('geography'); h.change();
  assert(h.children().every(row => row.level === 'province'));
  h.select('brand', ['传祺']); h.select('province', ['广东省']);
  assert.deepEqual(plain(h.children().map(row => row.name)).sort(), ['广州市', '深圳市']);
  h.select('city', ['深圳市']);
  assert.equal(h.children().length, 1); assert.equal(h.children()[0].records[0].dealer.dealerCode, 'S2');
});

test('advisor and independent staff constraints narrow counts and preserve empty intersections', () => {
  const h = setup(); h.select('advisor', ['A0']);
  assert.equal(h.rule().sampleCount, 24);
  assert(h.children().every(row => row.records.every(record => record.advisorId === 'A0')));
  h.reset(); h.select('patroler', ['P1']); h.select('governor', ['G4']);
  assert.equal(h.rule(), null); assert.deepEqual(plain(h.children()), []);
  assert.match(h.markup(), /当前筛选范围暂无组织统计/); assert.doesNotMatch(h.markup(), /NaN|undefined%/);
  assert.equal(h.filter.selections.patroler[0], 'P1'); assert.equal(h.filter.selections.governor[0], 'G4');
});

test('drilldown and back conserve displayed totals and never fall back to an unrelated path', () => {
  const h = setup();
  for (const first of h.children()) {
    h.drill(first.id);
    assert.deepEqual(totals(h.children()), { sampleCount: first.sampleCount, hitCount: first.hitCount });
    for (const zone of h.children()) {
      h.drill(zone.id);
      assert.deepEqual(totals(h.children()), { sampleCount: zone.sampleCount, hitCount: zone.hitCount });
      assert(h.children().every(row => row.level === 'store'));
      h.back();
    }
    h.back();
  }
  h.state.path.push({ id: 'stale-path' }); assert.deepEqual(plain(h.children()), []);
  h.sop.path.push({ id: 'other-pane' }); h.select('brand', ['埃安']);
  assert.equal(h.state.path.length, 0); assert.equal(h.sop.path.length, 0);
});

test('scene, vehicle and applied date use the same scope while date drafts leave results unchanged', () => {
  const h = setup(); h.select('scene', [filters.SCENE_KEYS.firstFollow]);
  assert.equal(h.rule().sampleCount, 80);
  h.select('model', ['传祺::M8系列']);
  assert.equal(h.rule().sampleCount, 24);
  assert(h.children().every(row => row.records.every(record => record.dealer.brand === '传祺')));
  const before = h.rule().sampleCount;
  h.draft('2026-10-12', '2026-10-18'); assert.equal(h.rule().sampleCount, before);
  h.applyDate(); assert.equal(h.rule().sampleCount, before * 7);
  assert.deepEqual(totals(h.children()), { sampleCount: h.rule().sampleCount, hitCount: h.rule().hitCount });
  h.reset(); assert.equal(h.rule().sampleCount, 120);
});

test('rendered identifiers use stable keys and the selected metric matches the current rows', () => {
  const h = setup(); const row = h.children()[0]; h.drill(row.id);
  const markup = h.markup(); const count = totals(h.children());
  assert.match(markup, new RegExp(count.hitCount + '/' + count.sampleCount + '</strong>'));
  assert.match(markup, /当前组织列表（演示统计）/); assert.match(markup, /data-org-id=/); assert.doesNotMatch(markup, /data-org-name=/);
  assert.equal(h.state.path.at(-1).id, row.id);
});

test('allocation handles tiny and empty samples without overcounting or invalid percentages', () => {
  const h = setup();
  for (const sampleCount of [0, 1, 2, 5, 23]) {
    for (const hitCount of [0, sampleCount]) {
      const rows = utils.buildIssueOrgRows({ records: plain(h.records), selections: {}, dimension: 'organization', rule: { sampleCount, hitCount } });
      assert.deepEqual(totals(rows), { sampleCount, hitCount });
      assert(rows.every(row => row.hitCount <= row.sampleCount && (row.rate === null || row.rate >= 0 && row.rate <= 100)));
    }
  }
});
