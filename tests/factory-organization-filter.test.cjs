const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {} });
for (const file of ['device-management/organization-data.js', 'shared/organization-directory.js', 'factory-dashboard/organization-filter.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const records = context.window.AIQCOrganization.recordings;
const create = () => context.window.FactoryOrganizationFilter.createModel(records);
const scoped = model => records.filter(model.matches);

test('multiple values form a union within a field and an intersection across fields', () => {
  const model = create();
  const brands = model.options('brand').map(item => item.value);
  model.set('brand', brands);
  assert.equal(scoped(model).length, records.length);
  const brand = brands[0];
  model.set('brand', [brand]);
  const regions = model.options('region').slice(0, 2).map(item => item.value);
  model.set('region', regions);
  const expected = records.filter(record => record.dealer.brand === brand && regions.includes(record.dealer.area));
  assert.equal(scoped(model).length, expected.length);
  assert(scoped(model).length > 0);
});

test('changing brand removes invalid descendants and staff selections', () => {
  const model = create();
  model.set('brand', ['埃安']);
  model.set('store', [model.options('store')[0].value]);
  model.set('advisor', [model.options('advisor')[0].value]);
  model.set('patroler', [model.options('patroler')[0].value]);
  model.set('brand', ['传祺']);
  for (const key of ['store', 'advisor', 'patroler']) assert.equal(model.selections[key].length, 0);
  assert(scoped(model).every(record => record.dealer.brand === '传祺'));
});

test('geography switch resets hierarchy, keeps brand, and filters province and city', () => {
  const model = create();
  model.set('brand', ['埃安']);
  model.set('region', [model.options('region')[0].value]);
  model.set('store', [model.options('store')[0].value]);
  model.setDimension('geography');
  assert.equal(model.selections.region.length, 0);
  assert.equal(model.selections.store.length, 0);
  assert.equal(model.selections.brand[0], '埃安');
  const provinces = model.options('province').slice(0, 2).map(item => item.value);
  model.set('province', provinces);
  const city = model.options('city')[0].value;
  model.set('city', [city]);
  assert(scoped(model).length > 0);
  assert(scoped(model).every(record => provinces.includes(record.dealer.province) && record.dealer.city === city));
});

test('staff and advisor use stable identities and constrain statistics', () => {
  const model = create();
  const record = records.find(item => item.dealer.patrolerId && item.dealer.governorId);
  model.set('patroler', [record.dealer.patrolerId]);
  model.set('governor', [record.dealer.governorId]);
  model.set('advisor', [record.advisorId]);
  assert.equal(scoped(model).length, 1);
  assert.equal(scoped(model)[0].advisorId, record.advisorId);
  model.reset();
  assert.equal(scoped(model).length, records.length);
});

test('incompatible independent staff filters produce an empty intersection', () => {
  const model = create();
  const patroler = model.options('patroler')[0].value;
  model.set('patroler', [patroler]);
  const matchingGovernors = new Set(scoped(model).map(item => item.dealer.governorId));
  const governor = model.options('governor').find(item => !matchingGovernors.has(item.value));
  assert(governor);
  model.set('governor', [governor.value]);
  assert.equal(scoped(model).length, 0);
  assert.equal(model.options('store').length, 0);
});


test('additional multi-select fields retain multiple values without narrowing organization options', () => {
  const model = context.window.FactoryOrganizationFilter.createModel(records, [
    { key: 'scene', label: '业务场景', options: [{ value: 'visit', label: '邀约到店' }, { value: 'drive', label: '试乘试驾' }] },
    { key: 'model', label: '车系', options: [{ value: 'M8', label: '传祺M8' }, { value: 'S7', label: '传祺S7' }] }
  ]);
  model.set('scene', ['visit', 'drive']);
  model.set('model', ['M8', 'S7', 'invalid']);
  assert.equal(model.selections.scene.length, 2);
  assert.equal(model.selections.model.length, 2);
  assert.equal(model.display('model'), '传祺M8、传祺S7');
  assert.equal(scoped(model).length, records.length);
  model.setDimension('geography');
  assert.equal(model.selections.scene.length, 2);
  model.reset();
  assert.equal(model.selections.scene.length, 0);
  assert.equal(model.selections.model.length, 0);
});

test('lead series options preserve brand identity, decoding, unknowns and exclude failed recordings', () => {
  const row = (brand, series, status = 1) => { const value = []; value[3] = status; value[5] = brand; value[13] = series; return value; };
  const data = { dealerKeys: [['传祺', 'A'], ['埃安', 'B']], series: ['M8系列', 'AION&nbsp;Y', '', '—'], rows: [row(0, 0), row(0, 0), row(1, 1), row(0, 2), row(1, 0, 0), row(0, 3)] };
  const options = context.window.FactoryOrganizationFilter.leadSeriesOptions(data);
  assert.deepEqual(Array.from(options, item => item.value).sort(), ['传祺::M8系列', '传祺::未知', '埃安::AION Y'].sort());
  const model = context.window.FactoryOrganizationFilter.createModel(records, [{ key: 'model', label: '车系', options: selections => context.window.FactoryOrganizationFilter.leadSeriesOptions(data, selections.brand) }]);
  model.set('model', ['传祺::M8系列', '埃安::AION Y']);
  model.set('brand', ['埃安']);
  assert.deepEqual(Array.from(model.selections.model), ['埃安::AION Y']);
  assert.equal(model.options('model').length, 1);
  model.reset();
  assert.equal(model.options('model').length, 3);
});
