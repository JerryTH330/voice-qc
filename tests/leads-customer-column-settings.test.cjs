const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../leads/leads-modern-runtime.js'), 'utf8');
const expected = ['brand', 'region', 'zone', 'province', 'city', 'dealerCode', 'store', 'advisorName', 'patroler', 'governor', 'customerName', 'customerPhone', 'crossStore', 'aggregateStoreCount', 'multiLead', 'aggregateLeadCount', 'aggregateAudioCount', 'leadStatus', 'firstLeadIssuedAt', 'latestLeadIssuedAt'];
const removed = ['recordCoverage', 'storeRecordCoverage', 'firstRecordingAt', 'latestRecordingAt', 'associationSummary'];
function setup() {
  const stored = new Map();
  const context = vm.createContext({ global: { localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) } } });
  const constants = source.match(/var (?:LEAD|CUSTOMER)_COLUMN_SCHEMA_VERSION = '[^']+';/g).join('\n');
  const columns = source.slice(source.indexOf('  var CUSTOMER_COLUMNS ='), source.indexOf('  function text('));
  const functions = source.slice(source.indexOf('  function storageKey('), source.indexOf('  function state('));
  vm.runInContext(constants + columns + 'var columnSettings = {};\n' + functions, context);
  return { stored, context, read: () => JSON.parse(JSON.stringify(context.loadColumnSettings('customers', context.CUSTOMER_COLUMNS))) };
}
test('new customer view uses the agreed complete order', () => {
  assert.deepEqual(setup().read(), { order: expected, hidden: [] });
});
test('old customer order migrates once, preserves hidden fields and leaves lead settings untouched', () => {
  const { stored, read } = setup();
  stored.set('aiqc-leads-modern-columns-customers', JSON.stringify({ order: [...expected].reverse(), hidden: ['city', 'governor'] }));
  stored.set('aiqc-leads-modern-columns-leads', 'unrelated-settings');
  assert.deepEqual(read(), { order: expected, hidden: ['city', 'governor'] });
  assert.equal(stored.get('aiqc-leads-modern-columns-leads'), 'unrelated-settings');
  const custom = { order: [...expected].reverse(), hidden: ['city'] };
  stored.set('aiqc-leads-modern-columns-customers', JSON.stringify({
    order: [...removed, ...custom.order], hidden: [...removed, ...custom.hidden]
  }));
  assert.deepEqual(read(), custom);
  assert.deepEqual(JSON.parse(stored.get('aiqc-leads-modern-columns-customers')), custom);
});
test('saving a custom order marks its version so reload preserves it', () => {
  const { context, read } = setup();
  const custom = { order: [...expected.slice(1), expected[0]], hidden: ['province'] };
  context.columnSettings.customers = custom;
  context.saveColumnSettings('customers');
  assert.deepEqual(read(), custom);
});

test('old settings that only showed a deleted field recover visible columns', () => {
  const { context, read } = setup();
  context.columnSettings.customers = { order: [...expected, ...removed], hidden: [...expected, ...removed.slice(1)] };
  context.saveColumnSettings('customers');
  assert.deepEqual(read(), { order: expected, hidden: [] });
});
