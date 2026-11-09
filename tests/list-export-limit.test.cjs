const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function exportHarness(view, count) {
  const session = view === 'session';
  const source = fs.readFileSync(path.join(__dirname, session ? '../session/session-real-runtime.js' : '../leads/leads-modern-runtime.js'), 'utf8');
  const name = session ? 'exportRecords' : 'exportCurrent';
  const start = source.indexOf(`  async function ${name}(`);
  const body = source.slice(start, source.indexOf('\n  }', start) + 4);
  const items = Array.from({length: count}, (_, id) => ({id}));
  const state = {selections: {}, queries: {}, startDate: '2026-11-03', endDate: '2026-11-09'};
  const submitted = [], messages = [], button = {disabled: false};
  let dependenciesRequested = 0;
  const context = vm.createContext({
    document: {querySelector: () => button},
    global: {
      get __exportReady() { dependenciesRequested += 1; return Promise.resolve(); },
      ExportTaskUI: {submit: async request => submitted.push(request)}
    },
    currentView: view,
    state: session ? state : () => state,
    getFilteredRecords: () => items,
    filteredRecords: () => items,
    visibleColumns: () => [{key: 'id', label: 'ID', width: 120}],
    cellValue: item => item.id,
    displayValue: item => item.id,
    showToast: (message, kind) => messages.push({message, kind})
  });
  vm.runInContext(body, context);
  return {run: () => context[name](), submitted, messages, button, dependenciesRequested: () => dependenciesRequested};
}

for (const view of ['session', 'leads', 'customers']) {
  for (const count of [29999, 30000, 30001]) {
    test(`${view}: export ${count} filtered rows respects the inclusive 30000-row limit`, async () => {
      const h = exportHarness(view, count);
      await h.run();
      if (count <= 30000) {
        assert.equal(h.submitted.length, 1);
        assert.equal(h.submitted[0].source, view);
        assert.equal(h.submitted[0].rows.length, count);
        assert.equal(h.submitted[0].rows.at(-1)[0], count - 1);
        assert.deepEqual(h.messages, []);
      } else {
        assert.deepEqual(h.submitted, []);
        assert.equal(h.dependenciesRequested(), 0, 'blocked exports must not start the async export flow');
        assert.deepEqual(h.messages, [{message: '下载数据不能超过 3 万条，请缩小筛选范围后重试', kind: 'error'}]);
      }
      assert.equal(h.button.disabled, false, 'the user can narrow the scope and retry');
    });
  }
}
