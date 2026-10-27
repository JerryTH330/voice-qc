const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../leads/leads-modern-runtime.js'), 'utf8');
const columnsSource = source.slice(source.indexOf('  var LEAD_COLUMNS ='), source.indexOf('  function text('));
const tableSource = source.slice(source.indexOf('  function renderTable()'), source.indexOf('  function paginationItems('));
const clickSource = source.slice(source.indexOf('  function handleClick(event)'), source.indexOf('  function handleInput(event)'));

function classList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) { names.forEach(name => values.add(name)); },
    toggle(name, enabled) { if (enabled) values.add(name); else values.delete(name); },
    contains(name) { return values.has(name); }
  };
}

function setup(view, legacyCustomerLayout) {
  const wrap = { classList: classList(legacyCustomerLayout ? ['customer-aggregate-wrap'] : []) };
  const table = {
    classList: classList(legacyCustomerLayout ? ['customer-aggregate-table'] : []),
    closest: () => wrap
  };
  const nodes = {
    leadsDataTable: table,
    leadsTableHeader: { innerHTML: '' },
    leadsTableBody: { innerHTML: '' },
    leadsEmptyState: { hidden: true, querySelector: selector => selector === 'p' ? nodes.leadsEmptyStateHint : null },
    leadsEmptyStateTitle: { textContent: '' },
    leadsEmptyStateHint: { textContent: '' },
    leadsTableHeadTitle: { textContent: '' }
  };
  const states = { leads: { page: 1, pageSize: 10 }, customers: { page: 1, pageSize: 10 } };
  const rows = {
    leads: [{ id: '2097957319138082983', brand: '埃安', store: '湛江麻章' }],
    customers: [{ id: 'customer-1', brand: '埃安', aggregateAudioCount: 1, aggregateLeadCount: 2 }]
  };
  const context = vm.createContext({
    currentView: view,
    focusLeadId: null,
    linkedLead: null,
    URL,
    document: { getElementById: id => nodes[id] || null },
    global: {
      location: { href: `file:///prototype/leads/index.html?route=leads&leadsView=${view}` },
      history: { replaceState(_state, _title, url) { this.url = url; } }
    },
    restoreValidityTooltip() {},
    bindAiLeadValidityHelp() {},
    renderAiLeadValidityHeader: () => 'AI线索有效性',
    escapeHtml: value => String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character])),
    renderCell: (item, key) => String(item[key] ?? '—'),
    renderTools() {},
    renderPagination() {},
    closeMenu() {},
    animateViewContent() {}
  });
  vm.runInContext(columnsSource + tableSource + clickSource, context);
  const visible = { leads: Array.from(context.LEAD_COLUMNS), customers: Array.from(context.CUSTOMER_COLUMNS) };
  context.visibleColumns = selectedView => visible[selectedView];
  context.filteredRecords = () => rows[context.currentView];
  context.state = () => states[context.currentView];
  context.renderAll = () => context.renderTable();
  function click(nextView) {
    const button = { dataset: { lrView: nextView } };
    context.handleClick({ target: { closest: selector => selector === '[data-lr-view]' ? button : null } });
  }
  return { context, table, wrap, nodes, visible, rows, states, click };
}

test('returning from customer view clears the fixed customer layout from the lead table', () => {
  const ui = setup('customers', true);
  ui.click('leads');
  assert.equal(ui.table.classList.contains('customer-aggregate-table'), false);
  assert.equal(ui.wrap.classList.contains('customer-aggregate-wrap'), false);
  assert.equal(ui.table.classList.contains('lr-data-table'), true);
  assert.match(ui.nodes.leadsTableHeader.innerHTML, /^<tr><th data-column-key="id">线索ID<\/th>/);
  assert.match(ui.nodes.leadsTableBody.innerHTML, /2097957319138082983/);
  assert.equal(new URL(ui.context.global.history.url).searchParams.get('leadsView'), 'leads');
});

test('entering customer view applies its layout without depending on the initial legacy view', () => {
  const ui = setup('leads', false);
  ui.click('customers');
  assert.equal(ui.table.classList.contains('customer-aggregate-table'), true);
  assert.equal(ui.wrap.classList.contains('customer-aggregate-wrap'), true);
  assert.match(ui.nodes.leadsTableHeader.innerHTML, /^<tr><th data-column-key="brand">品牌<\/th>/);
  assert.equal((ui.nodes.leadsTableHeader.innerHTML.match(/<th\b/g) || []).length, ui.visible.customers.length + 1);
});

test('repeated view changes keep the active layout and each view’s visible field order, including empty results', () => {
  const ui = setup('customers', true);
  ui.visible.leads = ['store', 'id', 'brand'].map(key => ui.visible.leads.find(column => column.key === key));
  ui.rows.customers = [];
  for (const view of ['leads', 'customers', 'leads', 'customers', 'leads']) {
    ui.click(view);
    assert.equal(ui.table.classList.contains('customer-aggregate-table'), view === 'customers');
    assert.equal(ui.wrap.classList.contains('customer-aggregate-wrap'), view === 'customers');
    const keys = [...ui.nodes.leadsTableHeader.innerHTML.matchAll(/data-column-key="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(keys, ui.visible[view].map(column => column.key));
    assert.equal(ui.nodes.leadsEmptyState.hidden, view === 'leads');
    assert.equal(ui.nodes.leadsEmptyStateTitle.textContent, view === 'customers' ? '暂无符合条件的客户' : '暂无符合条件的线索');
    assert.equal(ui.nodes.leadsEmptyStateHint.textContent, '请调整筛选条件后重试');
    assert.equal(ui.states[view].pageSize, 10);
  }
  assert.deepEqual(ui.visible.leads.map(column => column.key), ['store', 'id', 'brand']);
});
