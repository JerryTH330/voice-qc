const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const fields = require('../device-management/visit-field-settings.js');
const source = fs.readFileSync(require.resolve('../device-management/page.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
function fn(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return (source.slice(start - 6, start) === 'async ' ? 'async ' : '') + source.slice(start, source.indexOf('\n}\n', start) + 2);
}

test('deleted recording column is absent while saved order and visibility survive normalization and persistence', () => {
  assert.equal(fields.fields.length, 25);
  assert.equal(fields.fields.some(field => field.key === 'recordingId'), false);
  const order = ['updatedAt', 'recordingId', ...fields.createDefaultSettings().order.filter(key => key !== 'updatedAt')];
  for (const schemaVersion of [1, 2]) {
    const saved = { order, visible: ['updatedAt', 'recordingId', 'advisor'], schemaVersion };
    let stored = JSON.stringify(saved);
    const context = vm.createContext({ visitFieldSettingsModel: fields, localStorage: {
      getItem: key => { assert.equal(key, fields.storageKey); return stored; },
      setItem: (key, value) => { assert.equal(key, fields.storageKey); stored = value; }
    } });
    vm.runInContext(fn('loadVisitFieldSettings'), context);
    const result = plain(context.loadVisitFieldSettings());
    assert.deepEqual(result.order, order.filter(key => key !== 'recordingId'));
    assert.deepEqual(result.visible, ['updatedAt', 'advisor']);
    assert.deepEqual(JSON.parse(stored), result);
    assert.equal(fields.isFilterVisible(result, 'recordingId'), false);
  }
  assert.deepEqual(fields.normalizeSettings({ order: ['recordingId'], visible: ['recordingId'] }), fields.createDefaultSettings());
});

test('stale recording query never filters ordinary visits or store drilldown', () => {
  const records = [{ businessId: 'a', storeId: 'one', date: '2026-10-14', startTime: '10:00:00', recordingId: 'internal-a' },
    { businessId: 'b', storeId: 'two', date: '2026-10-14', startTime: '09:00:00', recordingId: 'internal-b' }];
  const context = vm.createContext({ window: {}, visitRecords: records,
    visitFilterState: { startDate: '', endDate: '', source: [], status: [], businessId: '', leadId: '', customerKeyword: '', recordingId: 'obsolete-query' },
    visitStoreDrilldownState: { active: false, storeId: 'one' }, visitOrganizationModel: { matches: () => true },
    normalizeDeviceQuery: value => String(value || ''), getVisitLeadId: () => '', matchesVisitCustomerKeyword: () => true });
  vm.runInContext(fn('getFilteredVisitRecords'), context);
  assert.equal(context.getFilteredVisitRecords().length, 2);
  context.visitStoreDrilldownState.active = true;
  assert.equal(context.getFilteredVisitRecords()[0].businessId, 'a');
  assert.equal(records[0].recordingId, 'internal-a');
});

test('exports use the remaining configurable fields and omit deleted recording queries', async () => {
  const submissions = [], defaults = fields.createDefaultSettings();
  const context = vm.createContext({ window: { VisitOrganizationFilter: { fields: {} }, __exportReady: Promise.resolve(),
    ExportTaskUI: { async submit(request) { submissions.push(plain(request)); } } },
    visitStoreDrilldownState: { active: false, storeName: 'one' },
    visitOrganizationModel: { applied: { dimensionMode: 'organization', brand: [], region: [], zone: [], store: [], patroler: [], governor: [], advisor: [] } },
    visitFilterState: { startDate: '', endDate: '', businessId: '', leadId: '', customerKeyword: '', recordingId: 'obsolete-query' }, visitEnumFields: {},
    getFilteredVisitRecords: () => [{ businessId: 'a', source: '销售助手', recordingId: 'internal-a' }],
    getVisibleVisitFields: () => fields.getVisibleFields(defaults), getVisitLeadId: () => '', getBadgeExportTimestamp: () => 'test',
    visitExportBusy: false, visitExportButton: null, syncVisitExportButton() {}, showToast() {} });
  vm.runInContext(fn('getVisitFieldValue') + fn('getVisitExportFilters') + fn('exportVisitDetailExcel'), context);
  for (const active of [false, true]) {
    context.visitStoreDrilldownState.active = active;
    await context.exportVisitDetailExcel();
  }
  assert.equal(submissions.length, 2);
  for (const request of submissions) {
    assert.equal(request.columns.length, 25);
    assert.equal(request.rows[0].length, 25);
    assert.ok(request.columns.every(column => column.label !== '录音 ID'));
    assert.ok(request.filters.every(filter => filter.label !== '录音 ID'));
    assert.ok(!request.rows[0].includes('internal-a'));
  }
});


test('imported visits display and export no lead ID and cannot match internal demo lead queries', () => {
  const imported = { businessId: 'imported', linkedDemo: true, source: '模板导入', leadId: 'DEMO-INTERNAL-LEAD', date: '2026-10-14', startTime: '10:00:00' };
  const sales = { businessId: 'sales', linkedDemo: true, source: '销售助手', leadId: 'REAL-LEAD', date: '2026-10-14', startTime: '09:00:00' };
  const context = vm.createContext({ window: { AIQCLinkedDemo: { getVisit: () => undefined, listUrl: (kind, id) => `/leads/${id}` } },
    visitRecords: [imported, sales], visitStoreDrilldownState: { active: false }, visitOrganizationModel: { matches: () => true },
    visitFilterState: { startDate: '', endDate: '', source: [], status: [], businessId: '', leadId: '', customerKeyword: '' },
    normalizeDeviceQuery: value => String(value || ''), matchesVisitCustomerKeyword: () => true });
  vm.runInContext(['getVisitLeadId', 'getVisitFieldValue', 'escapeBadgeHtml', 'renderVisitFieldCell', 'getFilteredVisitRecords'].map(fn).join('\n'), context);
  for (const linkedDemo of [false, true]) {
    const record = { ...imported, linkedDemo };
    assert.equal(context.getVisitLeadId(record), '');
    assert.equal(context.getVisitFieldValue(record, { key: 'leadId' }), '—');
    assert.equal(context.renderVisitFieldCell(record, { key: 'leadId' }), '—');
  }
  assert.match(context.renderVisitFieldCell(sales, { key: 'leadId' }), /href="\/leads\/REAL-LEAD"/);
  assert.equal(context.getFilteredVisitRecords().length, 2);
  context.visitFilterState.leadId = 'DEMO-INTERNAL-LEAD';
  assert.equal(context.getFilteredVisitRecords().length, 0);
  context.visitFilterState.leadId = 'REAL-LEAD';
  assert.equal(context.getFilteredVisitRecords()[0].businessId, 'sales');
  assert.equal(imported.leadId, 'DEMO-INTERNAL-LEAD');
});
