const test = require('node:test');
const assert = require('node:assert/strict');
const { createModel, organizationRecord } = require('../device-management/visit-organization-filter.js');
const { setup } = require('./helpers/unified-dom.cjs');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dealers = ['传祺', '埃安'].map((brand, index) => ({
  brand, dealerWid: `S${index}`, dealerCode: `D${index}`, dealerName: `${brand}测试店`,
  area: '同名大区', zone: '同名战区', province: '广东省', city: '广州市'
}));
const keys = ['region', 'zone', 'province', 'city'];
const geographic = key => ['province', 'city'].includes(key);

for (const config of [{ mode: 'visits' }, { mode: 'matching' }, { mode: 'matching', brandScopedProvinces: true }]) {
  test(`${JSON.stringify(config)}: same-name choices carry one brand and match only that brand`, () => {
    const records = dealers.map(organizationRecord);
    const model = createModel(dealers, records, config);
    for (const key of keys) {
      model.reset();
      if (geographic(key)) model.setDimension('geography');
      const options = model.options(key);
      assert.equal(options.length, 2);
      assert.equal(new Set(options.map(option => option.value)).size, 2);
      assert.deepEqual(new Set(options.map(option => option.meta)), new Set(['传祺', '埃安']));
      const gac = options.find(option => option.meta === '传祺');
      assert.deepEqual(model.options(key, { query: `${gac.label} 传祺` }), [gac]);
      model.set(key, [gac.value]);
      model.apply();
      assert.deepEqual(records.filter(model.matches).map(record => record.brand), ['传祺']);
      assert.equal(model.display(key), `${gac.label}（传祺）`);
      assert.deepEqual(model.draft.brand, [], 'selecting a child must not fill its parent');
      model.set(key, options.map(option => option.value));
      model.apply();
      assert.equal(records.filter(model.matches).length, 2, 'multi-select remains OR');
      model.reset();
      assert.equal(records.filter(model.matches).length, 2);
    }
  });
}

test('old province/city selections migrate within the restored parent scope and conflicting children are cleared', () => {
  const records = dealers.map(organizationRecord);
  const model = createModel(dealers, records, { mode: 'matching', brandScopedProvinces: true });
  model.setDimension('geography');
  model.set('province', ['province:广东省']);
  assert.equal(model.draft.province.length, 2);
  model.set('province', ['brand:传祺|province:广东省']);
  model.set('city', ['province:广东省|city:广州市']);
  assert.deepEqual(model.draft.city, ['brand:传祺|province:广东省|city:广州市']);
  model.set('brand', ['brand:埃安']);
  assert.deepEqual(model.draft.province, []);
  assert.deepEqual(model.draft.city, []);
});

test('customer insight preserves brand-scoped geography in its applied filters and summary', () => {
  const window = {
    VisitOrganizationFilter: require('../device-management/visit-organization-filter.js'),
    StoreDashboardOrganizationFilter: { mount: () => ({ render() {} }) },
    StoreDashboardBusinessFilters: { mount: () => ({ render() {} }) }
  };
  const source = fs.readFileSync(path.join(__dirname, '../客户洞察/v2/simplified/factory-filters.js'), 'utf8');
  vm.runInNewContext(source, { window });
  const M = {
    organizationRecords: () => dealers.map(dealer => ({ dealer })),
    models: {}, sceneLabels: {}, scenes: { all: [] }
  };
  const scope = { brand: '埃安', stage: 'all', organizationDimension: 'geography', filters: {} };
  const filters = window.InsightFactoryFilters.mount({ M, getScope: () => scope });
  filters.model.set('province', ['brand:传祺|province:广东省']);
  filters.model.set('city', ['brand:传祺|province:广东省|city:广州市']);
  filters.model.apply();
  const snapshot = filters.snapshot();
  assert.deepEqual(Array.from(snapshot.filters.province), ['广东省']);
  assert.deepEqual(Array.from(snapshot.filters.city), ['广州市']);
  assert.deepEqual(snapshot.filters.organizationStores, ['传祺::D0']);
  filters.sync({ ...scope, ...snapshot });
  assert.equal(filters.summary(), '省份：广东省（传祺） · 城市：广州市（传祺）');
});

test('badge filters scope city data and migrate old province/city IDs only within their parent candidates', () => {
  const api = require('../device-management/visit-organization-filter.js');
  const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
  const context = vm.createContext({ window: { VisitOrganizationFilter: api }, badgeFilterState: {},
    badgeOrganizationRecords: dealers.map(organizationRecord), badgeDetailRecords: [],
    storeDrilldownState: { active: false }, badgeOrganizationFilterKeys: ['brand', ...keys], badgeStatusMultiSelectKeys: [],
    badgeCandidateDependencies: { province: ['brand'], city: ['brand', 'province'] },
    badgeFieldDefinitionMap: Object.fromEntries(Object.entries(api.fields)),
    getBadgeSelectedValuesFromValue: value => Array.isArray(value) ? value.map(String) : []
  });
  for (const name of ['getBadgeSelectedValues', 'getBadgeRecordFieldValue', 'getBadgeCandidateRecords', 'assignBadgeFilterState']) {
    const start = source.indexOf(`function ${name}(`);
    assert(start >= 0);
    vm.runInContext(source.slice(start, source.indexOf('\n}\n', start) + 2), context);
  }
  context.assignBadgeFilterState({ brand: ['brand:传祺'], province: ['province:广东省'], city: ['province:广东省|city:广州市'] });
  assert.deepEqual(Array.from(context.badgeFilterState.province), ['brand:传祺|province:广东省']);
  assert.deepEqual(Array.from(context.badgeFilterState.city), ['brand:传祺|province:广东省|city:广州市']);
  const values = context.badgeOrganizationRecords.map(record => context.getBadgeRecordFieldValue(record, 'city'));
  assert.notEqual(values[0], values[1]);
});

function list(view) {
  const session = view === 'session';
  const h = setup('store', '', { file: session ? 'session/index.html' : 'leads/index.html', search: session ? '?route=session' : '?route=leads&leadsView=' + view });
  const data = h.window.AIQCData;
  const fixture = (row, dealer) => ({ ...row, ...organizationRecord(dealer), dealer,
    dealerCode: dealer.dealerCode, advisorKey: dealer.dealerCode + '-advisor', advisorId: dealer.dealerCode + '-advisor',
    status: '已完成', leadDate: data.defaultRange.endDate, startTime: data.defaultRange.endDate + ' 12:00:00',
    id: dealer.dealerCode + '-lead', audioId: dealer.dealerCode + '-audio', customerId: dealer.dealerCode + '-customer'
  });
  h.window.__DEVICE_ORGANIZATION_DEALERS = dealers;
  h.window.AIQCData = { ...data,
    recordings: dealers.map(dealer => fixture(data.recordings[0], dealer)),
    leads: dealers.map(dealer => fixture(data.leads[0], dealer))
  };
  h.run('session-search-utils.js');
  h.run('shared/field-settings-interactions.js');
  h.run(session ? 'session/session-real-runtime.js' : 'leads/leads-modern-runtime.js');
  h.flush();
  h.submitted = [];
  h.window.ExportTaskUI = { submit: async request => h.submitted.push(request) };
  return { h, prefix: session ? 'sr' : 'lr' };
}

for (const view of ['session', 'leads', 'customers']) {
  test(`${view}: four menus show brands, select independently and export only the chosen brand`, async () => {
    const { h, prefix } = list(view);
    const count = () => Number(h.host.querySelector(view === 'session' ? '#sessionRealCount' : '#leadsFilterCount').textContent);
    assert.equal(count(), 2);
    for (const key of keys) {
      h.click(`[data-${prefix}-reset]`);
      if (geographic(key)) h.click(`[data-${prefix}-dimension="geography"]`);
      h.click(`[data-${prefix}-trigger="${key}"]`);
      const options = [...h.host.querySelectorAll(`[data-${prefix}-option-key="${key}"]`)];
      assert.equal(options.length, 2);
      assert.deepEqual(new Set(options.map(node => node.querySelector('small').textContent)), new Set(['传祺', '埃安']));
      const gac = options.find(node => node.querySelector('small').textContent === '传祺');
      gac.querySelector('small').dispatchEvent(new h.window.Event('click', { bubbles: true }));
      assert.equal(count(), 1);
      assert.match(h.host.querySelector(`[data-${prefix}-trigger="${key}"]`).textContent, /传祺/);
      h.click(`[data-${prefix}-export]`);
      await Promise.resolve(); await Promise.resolve();
      const request = h.submitted.pop();
      assert(request);
      assert.equal(request.rows.length, 1);
      const brandColumn = request.columns.findIndex(column => column.label === '品牌');
      assert.equal(request.rows[0][brandColumn], '传祺');
      assert(request.filters.some(filter => /传祺/.test(filter.value)));
      if (h.host.querySelector(`[data-${prefix}-trigger="${key}"]`).getAttribute('aria-expanded') !== 'true') h.click(`[data-${prefix}-trigger="${key}"]`);
      const aion = h.host.querySelector(`[data-${prefix}-option-key="${key}"][data-${prefix}-option-value="${options.find(node => node !== gac).getAttribute(`data-${prefix}-option-value`)}"]`);
      assert(aion);
      aion.dispatchEvent(new h.window.Event('click', { bubbles: true }));
      assert.equal(count(), 2);
    }
    h.click(`[data-${prefix}-reset]`);
    assert.equal(count(), 2);
  });
}
