const test = require('node:test');
const assert = require('node:assert/strict');
const { createModel, organizationRecord } = require('../device-management/visit-organization-filter.js');

const dealers = [
  { dealerWid: 'A1', brand: '埃安', dealerCode: 'A01', dealerName: '上海店', area: '东区', zone: '一战区', province: '上海市', city: '上海市', patroler: '巡回甲', patrolerId: 'P1', governor: '治理甲', governorId: 'G1' },
  { dealerWid: 'A2', brand: '埃安', dealerCode: 'A02', dealerName: '杭州店', area: '东区', zone: '二战区', province: '浙江省', city: '杭州市', patroler: '巡回乙', patrolerId: 'P2', governor: '治理乙', governorId: 'G2' },
  { dealerWid: 'B1', brand: '传祺', dealerCode: 'B01', dealerName: '苏州店', area: '东区', zone: '一战区', province: '江苏省', city: '苏州市', patroler: '巡回丙', patrolerId: 'P3', governor: '治理丙', governorId: 'G3' },
  { dealerWid: 'B2', brand: '传祺', dealerCode: 'B02', dealerName: '青岛店', area: '北区', zone: '三战区', province: '山东省', city: '青岛市' }
];
const visit = (dealer, advisor, id, advisorId = '') => ({
  ...organizationRecord(dealer), id, advisor, advisorId,
  advisorKey: `demo-advisor:${dealer.dealerWid}|${advisor}`
});
const records = [visit(dealers[0], '王五', 1), visit(dealers[0], '李四', 2, 'ADV-02'), visit(dealers[1], '王五', 3), visit(dealers[0], '王五', 4)];
const create = () => createModel(dealers, records);
const scoped = (model) => records.filter((record) => model.matches(record));

test('applying selections replaces the filter snapshot without sharing arrays', () => {
  const model = create();
  model.set('store', ['A1']);
  assert.equal(scoped(model).length, 4);
  model.apply();
  assert.deepEqual(scoped(model).map((record) => record.id), [1, 2, 4]);
  model.set('store', ['A2']);
  assert.deepEqual(scoped(model).map((record) => record.id), [1, 2, 4]);
  model.apply();
  assert.deepEqual(scoped(model).map((record) => record.id), [3]);
  assert.notEqual(model.draft.store, model.applied.store);
});

test('multiple values form OR within fields and AND across fields using IDs', () => {
  const model = create();
  model.set('store', ['A1', 'A2']);
  model.set('patroler', ['P1']);
  model.apply();
  assert.deepEqual(scoped(model).map((record) => record.id), [1, 2, 4]);
  model.reset();
  const otherBrandRegion = organizationRecord(dealers[2]).regionId;
  model.set('region', [otherBrandRegion]);
  model.apply();
  assert.equal(scoped(model).length, 0, 'same region label in another brand cannot match');
});

test('upstream changes remove conflicting descendants, stores, staff and advisors', () => {
  const model = create();
  const scope = organizationRecord(dealers[0]);
  for (const key of ['region', 'zone', 'store', 'patroler', 'governor']) model.set(key, [scope[`${key}Id`]]);
  model.set('advisor', [records[0].advisorKey]);
  const removed = model.set('brand', ['brand:传祺']);
  assert.ok(removed.length > 0);
  for (const key of ['region', 'zone', 'store', 'patroler', 'governor', 'advisor']) assert.equal(model.draft[key].length, 0);
  model.reset();
  model.set('city', [organizationRecord(dealers[1]).cityId]);
  assert.deepEqual(model.draft.brand, []);
  assert.deepEqual(model.draft.province, [], 'choosing a child never auto-fills parents');
});

test('dimension switch clears the old path and store while preserving brand and staff', () => {
  const model = create();
  const scope = organizationRecord(dealers[0]);
  model.set('brand', [scope.brandId]);
  model.set('region', [scope.regionId]);
  model.set('zone', [scope.zoneId]);
  model.set('patroler', [scope.patrolerId]);
  model.set('store', [scope.storeId]);
  model.apply();
  model.setDimension('geography');
  assert.deepEqual(model.draft.region, []);
  assert.deepEqual(model.draft.zone, []);
  assert.deepEqual(model.draft.store, []);
  assert.deepEqual(model.draft.brand, [scope.brandId]);
  assert.deepEqual(model.draft.patroler, [scope.patrolerId]);
  assert.equal(model.applied.dimensionMode, 'organization');
  model.set('province', [scope.provinceId]);
  model.set('city', [scope.cityId]);
  model.apply();
  assert.deepEqual(scoped(model).map((record) => record.id), [1, 2, 4]);
});

test('incompatible staff conditions remain selected and produce an empty intersection', () => {
  const model = create();
  model.set('patroler', ['P1']);
  model.set('governor', ['G2']);
  assert.deepEqual(model.draft.patroler, ['P1']);
  assert.deepEqual(model.draft.governor, ['G2']);
  assert.equal(model.options('store').length, 0);
  assert.equal(model.options('advisor').length, 0);
  model.apply();
  assert.equal(scoped(model).length, 0);
});

test('advisors use separate identities, filter only themselves and never expose internal keys', () => {
  const model = create();
  const sameName = model.options('advisor', { query: '王 五' });
  assert.equal(sameName.length, 2);
  assert.notEqual(sameName[0].value, sameName[1].value);
  assert.ok(sameName.every((item) => item.meta.endsWith(' · —')));
  assert.equal(model.options('advisor', { query: 'demo-advisor:' }).length, 0);
  assert.equal(model.options('advisor', { query: ' adv - 02 ' }).length, 1);
  model.set('advisor', [records[0].advisorKey]);
  model.apply();
  assert.deepEqual(scoped(model).map((record) => record.id), [1, 4]);
  model.set('store', ['A2']);
  assert.deepEqual(model.draft.advisor, []);
});

test('directory options include stores with no visits and preserve sorting during selection', () => {
  const model = create();
  const original = model.options('store', { pinnedIds: [] }).map((item) => item.value);
  assert.ok(original.includes('B2'));
  assert.equal(model.options('store', { query: ' b 0 2 ' })[0].value, 'B2');
  model.set('store', [original.at(-1)]);
  assert.deepEqual(model.options('store', { pinnedIds: [] }).map((item) => item.value), original);
  assert.equal(model.options('store')[0].value, original.at(-1), 'reopening pins selected entries');
  model.set('store', ['B2']);
  model.apply();
  assert.equal(scoped(model).length, 0);
});

test('reset clears both snapshots and returns to the organization dimension', () => {
  const model = create();
  model.setDimension('geography');
  model.set('city', [organizationRecord(dealers[1]).cityId]);
  model.apply();
  model.reset();
  assert.equal(model.draft.dimensionMode, 'organization');
  assert.equal(model.applied.dimensionMode, 'organization');
  assert.equal(scoped(model).length, records.length);
  model.set('store', ['A1']);
  assert.deepEqual(model.applied.store, []);
});
