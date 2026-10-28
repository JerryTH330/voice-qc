const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const api = require('../store-dashboard/demo-data.js');
const organizationFilter = require('../device-management/visit-organization-filter.js');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'device-management/organization-data.js'), 'utf8'), context);
const dealers = JSON.parse(JSON.stringify(context.window.__DEVICE_ORGANIZATION_DEALERS));
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const readTemplates = (name) => vm.runInNewContext(runtime.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n  \\]);`))[1]);
const advisorTemplates = JSON.parse(JSON.stringify(readTemplates('advisorData')));
const clientTemplates = JSON.parse(JSON.stringify(readTemplates('clientData')));
const create = (options = {}) => api.createDataset({ dealers, advisorTemplates, clientTemplates, ...options });

test('selects 50 real stores with broad brand, region and province coverage', () => {
  const data = create();
  assert.equal(data.stores.length, 50);
  assert.equal(new Set(data.stores.map((store) => store.brandId)).size, 2);
  assert(new Set(data.stores.map((store) => store.regionId)).size >= 12);
  assert(new Set(data.stores.map((store) => store.provinceId)).size >= 25);
  data.stores.forEach((store) => {
    const dealer = dealers.find((item) => item.dealerWid === store.storeId);
    assert(dealer);
    assert.deepEqual(Object.fromEntries(Object.keys(organizationFilter.organizationRecord(dealer)).map((key) => [key, store[key]])), organizationFilter.organizationRecord(dealer));
  });
  assert.equal(data.advisors.length, 800);
  assert.equal(data.clients.length, clientTemplates.length * 50);
});

test('derived IDs, counts and store selection are stable without mutating templates', () => {
  const before = JSON.stringify({ dealers, advisorTemplates, clientTemplates });
  const first = create();
  const second = create();
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify({ dealers, advisorTemplates, clientTemplates }), before);
  const ids = [...first.advisors, ...first.clients].map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert(ids.every((id) => id.startsWith('DEMO-STORE-')));
  assert(first.advisors.every((advisor) => advisor.advisorKey === advisor.id && advisor.advisorId === advisor.id && advisor.isDemo));
  assert(first.clients.every((client) => client.isDemo));
  assert(new Set(first.advisors.filter((advisor) => advisor.templateId === 'A001').map((advisor) => advisor.invitation)).size > 1);
  first.clients[0].user_profile.push('local-only');
  assert(!clientTemplates[0].user_profile.includes('local-only'));
});

test('clients link to only the matching demo advisor in their own store', () => {
  const data = create({ limit: 3 });
  data.clients.forEach((client) => {
    const advisor = data.advisors.find((item) => item.advisorKey === client.advisorKey);
    assert(advisor);
    assert.equal(client.storeId, advisor.storeId);
    assert.equal(client.advisor, advisor.name);
    assert.equal(client.advisor_role, advisor.role);
    assert.equal(client.advisorTemplateId, advisor.templateId);
    assert.equal(client.brandId, advisor.brandId);
  });
  const missing = create({ limit: 2, clientTemplates: [{ id: 'missing', advisor: '陈亮', advisor_role: '销售顾问' }] });
  assert.deepEqual(missing.clients, []);
});

test('same advisor names across stores remain separate candidates and query only the selected advisor', () => {
  const data = create();
  const model = organizationFilter.createModel(dealers, data.advisors, { mode: 'matching' });
  const repeated = model.options('advisor').filter((option) => option.label === '李昱');
  assert.equal(repeated.length, 50);
  assert.equal(new Set(repeated.map((option) => option.value)).size, 50);
  assert.equal(new Set(repeated.map((option) => option.meta)).size, 50);
  assert(repeated.every((option) => option.meta.includes('DEMO-STORE-')));
  const target = data.advisors[0];
  model.set('store', [target.storeId]);
  assert.equal(model.options('advisor').length, 16);
  model.set('advisor', [target.advisorKey]);
  model.apply();
  assert.deepEqual(data.advisors.filter(model.matches), [target]);
  assert(data.clients.filter(model.matches).every((client) => client.advisorKey === target.advisorKey));
});

test('independent personnel conditions can form an empty store intersection while retaining conditions', () => {
  const data = create();
  const model = organizationFilter.createModel(dealers, data.advisors, { mode: 'matching' });
  const patroler = model.options('patroler')[0].value;
  const relatedGovernors = new Set(model.directory.filter((store) => store.patrolerId === patroler).map((store) => store.governorId));
  const governor = model.options('governor').find((option) => !relatedGovernors.has(option.value)).value;
  model.set('patroler', [patroler]);
  model.set('governor', [governor]);
  assert.deepEqual(model.options('store'), []);
  model.apply();
  assert.deepEqual(data.advisors.filter(model.matches), []);
  assert.deepEqual(model.applied.patroler, [patroler]);
  assert.deepEqual(model.applied.governor, [governor]);
});

test('summary sums counts and calculates rates and duration from weighted raw counters', () => {
  const summary = api.summarize([
    { invitation: 10, reception: 20, test_drive: 10, valid_record: 10, hitCount: 9, qaPassCount: 8, riskCount: 1, durationMinutes: 100 },
    { invitation: 5, reception: 5, test_drive: 0, valid_record: 2, hitCount: 0, qaPassCount: 1, riskCount: 0, durationMinutes: 40 }
  ]);
  assert.deepEqual(summary, {
    invitation: 15, reception: 25, test_drive: 10, valid_record: 12,
    hit_rate: 75, cover_rate: 24, avg_duration: 140 / 12,
    qa_pass_count: 9, qa_pass_rate: 75, risk_record: 1, risk_rate: 100 / 12
  });
});

test('empty data and zero denominators produce zero counts and null rates', () => {
  assert.deepEqual(create({ limit: 0 }), { stores: [], advisors: [], clients: [] });
  const summary = api.summarize([]);
  ['invitation', 'reception', 'test_drive', 'valid_record', 'qa_pass_count', 'risk_record'].forEach((key) => assert.equal(summary[key], 0));
  ['hit_rate', 'cover_rate', 'avg_duration', 'qa_pass_rate', 'risk_rate'].forEach((key) => assert.equal(summary[key], null));
  assert.deepEqual(api.summarize([{ valid_record: 0, invitation: 0 }]), summary);
});

const rule = {
  id: 'test-rule', title: '示例规则', hit_ratio: '50%', hit_count: 4, sample_count: 8, advisor_count: 1,
  people: [{ id: 'A001', name: '李昱', sampleCount: 8, hitCount: 4, rate: 50, sceneStats: { reception: { sampleCount: 8, hitCount: 4 } } }],
  recordings: [{ id: 'R-001', advisor: '李昱', customer: '客户甲', sceneKey: 'reception' }]
};

test('rule expansion preserves template identity and gives people and recordings independent store identities', () => {
  const data = create({ limit: 2 });
  const before = JSON.stringify(rule);
  const expanded = api.expandRule(rule, data.advisors);
  assert.equal(expanded.people.length, 2);
  assert.equal(expanded.recordings.length, 2);
  assert.equal(expanded.advisor_count, 2);
  assert.equal(expanded.hit_count, 8);
  assert.equal(expanded.sample_count, 16);
  assert.equal(expanded.hit_ratio, '50%');
  assert.equal(new Set(expanded.recordings.map((recording) => recording.id)).size, 2);
  expanded.people.forEach((person) => {
    assert(person.id.startsWith('DEMO-STORE-'));
    assert.equal(person.id, person.advisorKey);
    assert.equal(person.templateId, 'A001');
    assert.deepEqual(person.sceneStats, rule.people[0].sceneStats);
    const recording = expanded.recordings.find((item) => item.advisorKey === person.id);
    assert.equal(recording.storeId, person.storeId);
    assert.equal(recording.store, person.store);
    assert.equal(recording.advisorId, person.advisorId);
    assert(recording.orgPath.includes(person.store));
    assert(recording.isDemo);
  });
  assert.equal(JSON.stringify(rule), before);
  assert.deepEqual(api.expandRule(rule, data.advisors), expanded);
});

test('rule scope and missing or inconsistent people never fall back to same-name advisors', () => {
  const data = create({ limit: 2 });
  const advisor = data.advisors.find((item) => item.templateId === 'A001');
  const scoped = api.expandRule(rule, [advisor]);
  assert.equal(scoped.people.length, 1);
  assert(scoped.recordings.every((recording) => recording.advisorKey === advisor.advisorKey));
  for (const invalidRule of [
    { ...rule, people: [{ name: '李昱', sampleCount: 8, hitCount: 4 }] },
    { ...rule, people: [{ id: 'A008', name: '陈亮', sampleCount: 8, hitCount: 4 }] },
    { ...rule, people: ['李昱'] }
  ]) {
    const result = api.expandRule(invalidRule, data.advisors);
    assert.deepEqual(result.people, []);
    assert.deepEqual(result.recordings, []);
  }
  const empty = api.expandRule(rule, []);
  assert.deepEqual(empty.people, []);
  assert.deepEqual(empty.recordings, []);
  assert.equal(empty.advisor_count, 0);
  assert.equal(empty.hit_count, 0);
  assert.equal(empty.sample_count, 0);
  assert.equal(empty.hit_ratio, '—');
});
