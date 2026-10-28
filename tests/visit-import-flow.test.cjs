const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const demo = require('../device-management/visit-import-demo.js');
const fields = require('../device-management/visit-field-settings.js');
const xlsx = require('../device-management/xlsx-export-utils.js');
const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const visits = Array.from({ length: 20 }, (_, index) => ({
  businessId: `BIZ-${index}`, leadId: `LEAD-${index}`, store: '演示店', storeCode: 'A1', advisorId: `ADVISOR-${index}`, advisor: '演示顾问',
  date: '2026-10-13', startTime: '09:00:00', endTime: '10:00:00', source: '销售助手'
}));

function setup() {
  const nodes = new Map();
  function node(name) {
    if (!nodes.has(name)) nodes.set(name, {
      textContent: '', value: '', disabled: false, hidden: false, style: {}, attributes: {}, classes: new Set(),
      setAttribute(key, value) { this.attributes[key] = value; },
      classList: { add() {}, remove() {}, contains() { return false; } },
      click() { this.clicked = true; }, scrollIntoView() { this.scrolled = true; }
    });
    return nodes.get(name);
  }
  const timers = new Map(); let serial = 0;
  const toasts = [], downloads = [];
  const modal = node('importModal'); modal.querySelectorAll = () => [node('close'), node('cancel')];
  const context = vm.createContext({
    window: { VisitImportDemo: demo, __xlsxExportUtils: { downloadXlsx: request => downloads.push(request) },
      setTimeout(fn) { const id = ++serial; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); } },
    visitRecords: visits, visitDirectoryDealers: [], visitFieldSettingsModel: fields, visitImportFile: null,
    visitImportState: { phase: 'idle', progress: 0, result: null, timer: 0 },
    visitEventDetailModal: {}, syncBodyScrollLock() {}, closeVisitEventMenus() {},
    showToast: (...args) => toasts.push(args), escapeBadgeHtml: value => String(value).replaceAll('<', '&lt;'),
    importModal: modal
  });
  for (const name of ['visitImportFileInput','visitImportFileName','visitImportFileHint','visitImportSubmitButton','visitImportSelectButton',
    'visitImportDropzone','visitImportProgress','visitImportProgressStage','visitImportProgressPercent','visitImportProgressTrack',
    'visitImportProgressFill','visitImportErrors','visitImportErrorsSummary','visitImportErrorsBody']) context[name] = node(name);
  for (const name of ['isVisitImportBusy','resetVisitImport','renderVisitImportState','requestVisitImportFile','selectVisitImportFile',
    'startVisitImport','finishVisitImport','downloadVisitImportFailures','closeModal']) {
    const start = source.indexOf(`function ${name}(`); assert.ok(start >= 0);
    vm.runInContext(source.slice(start, source.indexOf('\n}\n', start) + 2), context);
  }
  function tick() { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); }
  function finish() { let limit = 30; while (timers.size) { assert.ok(limit--); tick(); } }
  const file = name => ({ name, size: 2048 });
  return { context, node, timers, toasts, downloads, tick, finish, file };
}

test('file selection uses reselect, cancellation keeps the current file, and reset restores initial state', () => {
  const ui = setup(), c = ui.context;
  c.selectVisitImportFile(ui.file('演示.xlsx'));
  assert.equal(ui.node('visitImportSelectButton').textContent, '重新选择');
  c.requestVisitImportFile(); assert.equal(ui.node('visitImportFileInput').clicked, true);
  c.selectVisitImportFile(undefined); assert.equal(c.visitImportFile.name, '演示.xlsx');
  c.resetVisitImport();
  assert.equal(ui.node('visitImportSelectButton').textContent, '选择文件');
  assert.equal(ui.node('visitImportSubmitButton').disabled, true);
  assert.equal(ui.node('visitImportProgress').hidden, true);
});

test('processing locks all closing and selection paths, rejects repeated submit and reports both stages', () => {
  const ui = setup(), c = ui.context;
  c.selectVisitImportFile(ui.file('演示.xlsx')); c.startVisitImport();
  assert.equal(ui.node('close').disabled, true); assert.equal(ui.node('cancel').disabled, true);
  assert.equal(ui.node('visitImportFileInput').disabled, true);
  c.startVisitImport(); assert.equal(ui.timers.size, 1);
  c.closeModal(c.importModal); assert.equal(c.importModal.hidden, false);
  c.resetVisitImport(); c.selectVisitImportFile(ui.file('别的.xlsx'));
  assert.equal(c.visitImportFile.name, '演示.xlsx');
  c.requestVisitImportFile(); assert.notEqual(ui.node('visitImportFileInput').clicked, true);
  for (let index = 0; index < 5; index++) ui.tick();
  assert.equal(c.visitImportState.phase, 'validating');
  assert.equal(ui.node('visitImportProgressTrack').attributes['aria-valuenow'], '70');
  assert.equal(ui.node('visitImportProgressFill').style.transform, 'scaleX(0.7)');
});

test('all-success completes only at the end, closes the modal and reports the demo count without modifying visits', () => {
  const ui = setup(), c = ui.context, before = plain(visits);
  c.selectVisitImportFile(ui.file('成功演示.xlsx')); c.startVisitImport();
  assert.equal(ui.toasts.length, 0); ui.finish();
  assert.equal(c.importModal.hidden, true);
  assert.deepEqual(ui.toasts, [['导入成功，共 20 条', 'success']]);
  assert.equal(c.visitImportFile, null); assert.equal(ui.node('close').disabled, false);
  assert.equal(ui.timers.size, 0); assert.deepEqual(visits, before);
});

test('failure imports zero rows, keeps the file and enables reselection with exact Excel row details', () => {
  const ui = setup(), c = ui.context;
  c.selectVisitImportFile(ui.file('到访_失败演示.xlsx')); c.startVisitImport(); ui.finish();
  assert.equal(c.importModal.hidden, false); assert.equal(c.visitImportState.result.imported, 0);
  assert.equal(c.visitImportFile.name, '到访_失败演示.xlsx');
  assert.equal(ui.node('visitImportSelectButton').disabled, false);
  assert.equal(ui.node('visitImportErrors').hidden, false);
  assert.equal(ui.node('visitImportProgress').attributes['data-phase'], 'failed');
  assert.match(ui.node('visitImportErrorsSummary').textContent, /20 条数据均未导入.*3 条错误/);
  assert.deepEqual(plain(c.visitImportState.result.failures.map(row => row.rowNumber)), [3, 8, 15]);
  assert.match(ui.node('visitImportErrorsBody').innerHTML, /结束时间必须晚于开始时间/);
  assert.equal(ui.node('visitImportErrors').scrolled, true);
  c.selectVisitImportFile(ui.file('成功演示.xlsx'));
  assert.equal(ui.node('visitImportErrors').hidden, true);
  assert.equal(ui.node('visitImportProgress').attributes['data-phase'], 'ready');
  assert.equal(c.visitImportState.result, null);
  c.startVisitImport(); ui.finish(); assert.equal(ui.toasts.at(-1)[1], 'success');
});

test('failure workbook has only failed rows, retains eleven required fields and combines each row reasons', () => {
  const ui = setup(), c = ui.context;
  c.selectVisitImportFile(ui.file('到访_失败演示.xls')); c.startVisitImport(); ui.finish();
  c.downloadVisitImportFailures(); const request = ui.downloads[0];
  assert.equal(request.filename, '到访_失败演示_失败明细.xlsx');
  assert.equal(request.columns.length, 13); assert.equal(request.rows.length, 3);
  assert.equal(request.columns[0].label, '门店编码');
  assert.ok(!request.columns.some(column => column.label === '业务 ID'));
  assert.deepEqual(request.rows.map(row => row[11]), [3, 8, 15]);
  assert.match(request.rows[2][12], /到访日期格式不正确；结束时间必须晚于开始时间/);
  assert.ok(xlsx.createXlsxBytes(request).byteLength > 1000);
});

test('invalid extension and size never start progress and ordinary filenames do not randomly fail', () => {
  const ui = setup(), c = ui.context;
  c.selectVisitImportFile(ui.file('bad.csv')); c.startVisitImport(); assert.equal(ui.timers.size, 0);
  c.selectVisitImportFile({ name: 'large.xlsx', size: 10 * 1024 * 1024 + 1 });
  assert.equal(c.visitImportFile, null);
  assert.deepEqual(demo.createResult('正常.xlsx', visits).failures, []);
  assert.equal(demo.createResult('失败演示.xlsx', visits).imported, 0);
});

test('templates contain exactly eleven required fields in the same order as the upload dialog', () => {
  const columns = demo.templateColumns(fields.fields);
  assert.deepEqual(columns.map(column => column.label), ['门店编码', '所属门店', '顾问 ID', '顾问姓名', '客户名称', '客户号码', '业务场景', '意向车系', '到访日期', '开始时间', '结束时间']);
  const result = demo.createResult('成功演示.xlsx', visits);
  assert.equal(result.rows[0].businessId, undefined);
  assert.equal(result.rows[0].leadId, undefined);
  assert.equal(result.rows[0].advisorId, visits[0].advisorId);
});

const directory = [
  { dealerCode: 'A1', dealerName: '演示店', dealerWid: 'store-a', brand: '埃安', area: '大区甲', zone: '战区甲', province: '省甲', city: '市甲', patroler: '巡回甲', governor: '治理甲' },
  { dealerCode: 'A1', dealerName: '另一门店', dealerWid: 'store-b', brand: '传祺', area: '大区乙', zone: '战区乙', province: '省乙', city: '市乙' }
];

test('exact code and name enrich only directory-owned fields and preserve customer and advisor inputs', () => {
  const input = { ...visits[0], storeCode: ' A1 ', store: ' 演示店 ', businessId: undefined, leadId: undefined };
  const before = plain(input);
  const match = demo.matchStore(input, directory);
  assert.deepEqual(match.reasons, []);
  assert.equal(match.record.brand, '埃安'); assert.equal(match.record.region, '大区甲');
  assert.equal(match.record.storeId, 'store-a'); assert.equal(match.record.patroler, '巡回甲');
  assert.equal(match.record.governor, '治理甲'); assert.equal(match.record.advisor, input.advisor);
  assert.equal(match.record.advisorId, input.advisorId); assert.equal(match.record.leadId, undefined);
  assert.deepEqual(plain(input), before);
});

test('unknown codes, mismatched names and duplicate code-name pairs never pick the first store', () => {
  assert.match(demo.matchStore({ storeCode: 'missing', store: '演示店' }, directory).reasons[0], /未找到/);
  assert.match(demo.matchStore({ storeCode: 'A1', store: '不一致' }, directory).reasons[0], /不一致/);
  const ambiguous = [...directory, { ...directory[0], brand: '传祺', dealerWid: 'store-c' }];
  const match = demo.matchStore({ storeCode: 'A1', store: '演示店' }, ambiguous);
  assert.match(match.reasons[0], /无法唯一匹配/);
  assert.equal(match.record.brand, undefined);
});

test('directory matching failures produce row errors and reject the whole demo batch', () => {
  const ok = demo.createResult('成功演示.xlsx', visits, directory);
  assert.equal(ok.imported, 20); assert.ok(ok.rows.every(record => record.brand === '埃安'));
  const invalid = visits.map((visit, index) => index === 4 ? { ...visit, store: '不一致' } : visit);
  const result = demo.createResult('普通.xlsx', invalid, directory);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.failures.map(failure => failure.rowNumber), [6]);
});

test('advisor ID is required and preserves supplied text without inferring it from the name', () => {
  const input = visits.map((record, index) => ({ ...record, advisorId: index === 2 ? '  ' : index === 0 ? '00001234' : record.advisorId }));
  const result = demo.createResult('普通.xlsx', input, directory);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.failures.map(failure => failure.rowNumber), [4]);
  assert.deepEqual(result.failures[0].reasons, ['顾问 ID 不能为空']);
  assert.equal(result.rows[0].advisorId, '00001234');
  assert.equal(result.rows[2].advisorId, '  ');
  const report = demo.failureWorkbook(result, fields.fields);
  assert.equal(report.columns[2].label, '顾问 ID');
  assert.equal(report.rows[0][2], '  ');
});
