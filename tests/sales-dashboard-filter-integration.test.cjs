const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../app-runtime.js'), 'utf8');
const dates = require('../date-filter-component-utils.js');
const plain = value => JSON.parse(JSON.stringify(value));
function declaration(name) {
  const fn = source.match(new RegExp(`^      function ${name}\\([^\\n]*`, 'm'));
  if (fn) {
    const rest = source.slice(fn.index), end = rest.match(/^      }\s*$/m);
    return rest.slice(0, end.index + end[0].length);
  }
  const match = source.match(new RegExp(`^      (?:const|let) ${name} = [^\\n]+`, 'm'));
  assert(match, name);
  if (!/[{[]$/.test(match[0])) return match[0];
  const rest = source.slice(match.index), end = rest.match(/^      [}\]]\s*$/m);
  return rest.slice(0, end.index + end[0].length);
}
function setup() {
  const controls = {}, listeners = {};
  const control = dataset => ({ dataset, addEventListener(type, fn) { this[type] = fn; } });
  for (const key of ['trigger', 'apply', 'cancel']) controls[`[data-sales-date-${key}]`] = [control({})];
  controls['[data-sales-date-shortcut]'] = ['yesterday', 'last7', 'last15', 'last30'].map(key => control({ salesDateShortcut: key }));
  const host = { innerHTML: '' };
  const document = { getElementById: id => id === 'salesRecommendDateControl' ? host : null,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); }, querySelectorAll: () => [] };
  const context = vm.createContext({ document, window: { __dateFilterComponentUtils: dates }, pageHost: { querySelectorAll: selector => controls[selector] || [] } });
  const names = ['createDefaultDccState', 'createDefaultAdvisorState', 'getSalesRoleState', 'salesRoleDateState', 'salesRecommendRangeOptions', 'salesRecommendDateShortcutOptions',
    'shiftSalesRoleReferenceDate', 'getSalesRoleAnchorDate', 'getSalesRoleRangeValues', 'applySalesRoleRangeMode', 'syncSalesRoleDateView', 'getSalesRoleDateLimitRange',
    'clampSalesRoleDateValue', 'isSalesRoleDateSelectable', 'shiftSalesRoleDateView', 'applySalesRoleDateDraft', 'renderSalesRoleDateMenu', 'renderSalesRoleDateControl',
    'closeSalesRoleDatePicker', 'openSalesRoleDatePicker', 'applySalesRoleDateFilters', 'bindSalesRoleDateEvents'];
  vm.runInContext(`
    const RealDate = Date;
    Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [2026, 2, 23, 12])); } };
    const escapeHtml = value => String(value);
    const formatSessionDateValue = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const parseSessionDateValue = value => value ? new Date(...value.split('-').map((part, index) => Number(part) - (index === 1 ? 1 : 0))) : null;
    const formatSessionDateDisplay = value => value;
    const getSessionDateRangeText = (start, end) => start + ' 至 ' + end;
    const formatSessionMonthLabel = (year, month) => year + '-' + month;
    const getSessionDateCells = () => [new Date(2026, 2, 22), new Date(2026, 2, 23), new Date(2026, 2, 24)];
    let refreshCount = 0, resetCount = 0;
    const refreshSalesRoleRecommendView = () => refreshCount++;
    const resetSalesRoleReviewSummaryState = () => resetCount++;
    const dccDashboard = { leads: [{ updatedAt: '2026-03-23 11:06' }] }, advisorDashboard = { leads: [{ updatedAt: '2026-03-23 10:00' }] };
    ${names.map(declaration).join('\n')}
    const dccState = createDefaultDccState(), advisorState = createDefaultAdvisorState();
    for (const role of ['dcc', 'advisor']) {
      const range = getSalesRoleRangeValues(getSalesRoleState(role).recommendRangeMode, role);
      Object.assign(getSalesRoleState(role), { recommendDateStart: range.startDate, recommendDateEnd: range.endDate });
    }
    renderSalesRoleDateControl('dcc');
    this.api = { open: openSalesRoleDatePicker, close: closeSalesRoleDatePicker, draft: applySalesRoleDateDraft, apply: applySalesRoleDateFilters,
      render: renderSalesRoleDateControl, ranges: getSalesRoleRangeValues, state: salesRoleDateState, selectable: isSalesRoleDateSelectable,
      snapshot: role => ({ ...getSalesRoleState(role), refreshCount, resetCount }) };
  `, context);
  return { ...context.api, host, context, click(selector, index = 0) { controls[selector][index].click({ stopPropagation() {} }); } };
}
test('statistics date is always visible and keeps the original personal last7 defaults', () => {
  const h = setup();
  assert.match(h.host.innerHTML, /统计日期/); assert.match(h.host.innerHTML, /2026-03-17/); assert.match(h.host.innerHTML, /2026-03-23/);
  assert.doesNotMatch(h.host.innerHTML, /data-sales-range-mode|sales-role-quick-range-tabs/);
  assert.equal(h.snapshot('dcc').recommendRangeMode, 'last7'); assert.equal(h.snapshot('advisor').recommendRangeMode, 'last7');
  assert.equal(h.snapshot('dcc').refreshCount, 0);
});
test('calendar shortcuts only alter drafts and Apply uses the existing custom-range path', () => {
  const h = setup(); h.open('dcc');
  assert.match(h.host.innerHTML, /统计日期范围/); assert.match(h.host.innerHTML, /应用日期/);
  assert.equal((h.host.innerHTML.match(/data-sales-date-shortcut=/g) || []).length, 4);
  h.click('[data-sales-date-shortcut]', 0);
  assert.equal(h.state.draftStartDate, '2026-03-22'); assert.equal(h.snapshot('dcc').recommendDateStart, '2026-03-17');
  assert.equal(h.snapshot('dcc').refreshCount, 0);
  h.click('[data-sales-date-apply]');
  assert.equal(h.snapshot('dcc').recommendRangeMode, 'custom'); assert.equal(h.snapshot('dcc').recommendDateStart, '2026-03-22');
  assert.equal(h.snapshot('dcc').refreshCount, 1); assert.equal(h.snapshot('advisor').recommendDateStart, '2026-03-17');
});
test('cancel and close discard unapplied ranges on reopening; ordered dates and bounds remain unchanged', () => {
  const h = setup(); h.open('advisor'); h.draft('startDate', '2026-03-20'); h.draft('endDate', '2026-03-18');
  assert.equal(h.state.draftStartDate, '2026-03-18'); assert.equal(h.state.draftEndDate, '2026-03-18');
  h.click('[data-sales-date-cancel]'); h.open('advisor');
  assert.equal(h.state.draftStartDate, '2026-03-17'); assert.equal(h.state.draftEndDate, '2026-03-23');
  h.draft('startDate', '2026-03-19'); h.close(); h.open('advisor'); assert.equal(h.state.draftStartDate, '2026-03-17');
  assert.equal(h.selectable('2026-03-24'), false); assert.equal(h.selectable('2025-09-22'), false); assert.equal(h.selectable('2025-09-23'), true);
  h.draft('endDate', '2027-01-01'); assert.equal(h.state.draftEndDate, '2026-03-23');
  assert.equal(h.snapshot('advisor').refreshCount, 0);
});
test('date shortcuts retain their original anchor and inclusive range lengths', () => {
  const h = setup();
  for (const [key, start] of [['yesterday', '2026-03-22'], ['last7', '2026-03-17'], ['last15', '2026-03-09'], ['last30', '2026-02-22']]) {
    assert.equal(h.ranges(key, 'dcc').startDate, start);
  }
});
test('scene integration retains original role candidates and only refreshes SOP and insights', () => {
  let options, destroyCount = 0;
  const host = { innerHTML: '', salesSceneFilter: { destroy() { destroyCount++; } } };
  const window = { SalesBusinessSceneFilter: { mount(value) { options = value; return { destroy() { destroyCount++; } }; } } };
  const context = vm.createContext({ document: { getElementById: () => host }, window });
  vm.runInContext(`
    const dccState = { reviewScenes: [], sopReviewPage: 4, reviewInsightPage: 3 }, advisorState = { reviewScenes: [] };
    ${declaration('SALES_REVIEW_QC_SCENES')}
    let sopCount = 0, insightCount = 0, dateClosed = 0;
    const renderSalesSopReview = () => sopCount++, renderSalesReviewInsights = () => insightCount++;
    const closeSalesRoleDatePicker = () => dateClosed++;
    ${['getSalesRoleState','getSalesReviewAllowedScenes','getSalesReviewSelectedScenes','renderSalesReviewSceneControl'].map(declaration).join('\n')}
    this.api = { render: renderSalesReviewSceneControl, selected: getSalesReviewSelectedScenes, dccState, snapshot: () => ({ sopCount, insightCount, dateClosed }) };
  `, context);
  context.api.render('dcc'); assert.equal(destroyCount, 1);
  assert.deepEqual(plain(options.sceneOptions.map(item => item.value)), ['首触跟进', '邀约到店', '排程确认']);
  options.onBeforeOpen(); assert.equal(context.api.snapshot().dateClosed, 1);
  options.onChange('scene', ['邀约到店']); assert.equal(context.api.dccState.sopReviewPage, 1); assert.equal(context.api.dccState.reviewInsightPage, 1);
  assert.equal(context.api.snapshot().sopCount, 1); assert.deepEqual(plain(context.api.selected('dcc')), ['邀约到店']);
  options.onChange('scene', []); assert.equal(context.api.selected('dcc').length, 3);
  context.api.render('advisor'); assert.deepEqual(plain(options.sceneOptions.map(item => item.value)), ['销售接待', '试乘试驾']);
});
