const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { setup } = require('./helpers/unified-dom.cjs');

function list(kind, search = '') {
  const h = setup('store', '', { file: `${kind}/index.html`, search: `?route=${kind}${search}` });
  h.run('session-search-utils.js');
  h.run('shared/field-settings-interactions.js');
  h.run(kind === 'session' ? 'session/session-real-runtime.js' : 'leads/leads-modern-runtime.js');
  h.flush();
  h.submitted = [];
  h.window.ExportTaskUI = { submit: async request => h.submitted.push(request) };
  return h;
}

async function exportedIds(h, kind) {
  h.click(kind === 'session' ? '[data-sr-export]' : '[data-lr-export]');
  await Promise.resolve();
  await Promise.resolve();
  const request = h.submitted.at(-1);
  if (!request) return [];
  const column = request.columns.findIndex(item => item.label === (kind === 'session' ? '录音ID' : '线索ID'));
  return request.rows.map(row => row[column]);
}

for (const kind of ['session', 'leads']) test(`${kind}: missing focused ID stays empty and reset restores the default range`, async () => {
  const queryKey = kind === 'session' ? 'focusRecordingId' : 'focusLeadId';
  const h = list(kind, `&${queryKey}=missing-record`);
  assert.match(h.host.textContent, /未找到对应.*记录/);
  assert.deepEqual(await exportedIds(h, kind), []);
  h.click(kind === 'session' ? '[data-sr-reset]' : '[data-lr-reset]');
  assert(!h.window.location.search.includes(queryKey));
  assert((await exportedIds(h, kind)).length > 0);
});

test('advisor recording count opens and exports the full current scope, including scene and model restrictions', async () => {
  const h = setup('store'), a = h.controller;
  const person = a.result.advisors.find(item => item.recordingCount > 1);
  const sample = person.recordings.find(row => row.status === '已完成');
  a.state.scenes = [sample.scenario];
  a.state.models = [`${sample.brand}::${sample.leadCarSeries}`];
  a.render();
  const expected = a.result.recordings.filter(row => row.advisorKey === person.advisorKey);
  const row = [...h.host.querySelectorAll('#advisor-list tbody tr')].find(item => item.textContent.includes(person.advisorId));
  const url = new URL(row.querySelector('a').getAttribute('href'), h.window.location.href);
  assert(!url.searchParams.has('focusRecordingId'));
  assert.equal(url.searchParams.get('advisorId'), person.advisorId);
  assert.equal(url.searchParams.get('storeId'), person.storeId);
  const target = list('session', '&' + [...url.searchParams].filter(([key]) => key !== 'route').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&'));
  assert.deepEqual(new Set(await exportedIds(target, 'session')), new Set(expected.map(record => record.audioId)));
  const request = target.submitted.at(-1);
  for (const label of ['顾问', '门店', '质检场景', '意向车系']) assert(request.filters.some(filter => filter.label === label), label);
  target.click('[data-sr-reset]');
  assert(!target.window.location.search.includes('recordingScope'));
  assert((await exportedIds(target, 'session')).length > expected.length);
  a.destroy();
});

test('a missing advisor scope never widens to other advisors or stores', async () => {
  const h = list('session', '&recordingScope=advisor&storeId=missing&advisorId=missing&startDate=2026-10-14&endDate=2026-10-20');
  assert.match(h.host.textContent, /未找到对应顾问范围/);
  assert.deepEqual(await exportedIds(h, 'session'), []);
  h.click('[data-sr-reset]');
  assert((await exportedIds(h, 'session')).length > 0);
});

function management({ legacy = false } = {}) {
  const h = setup('store'), d = h.window.AIQCData;
  h.controller.destroy();
  h.c.badgeDetailRecords = d.badges;
  h.c.sharedOrganizationDirectory = h.window.AIQCLinkedDemo.buildOrganizationView(h.window.AIQCOrganization);
  if (legacy) {
    h.c.badgeDetailRecords = d.badges.map(badge => ({ ...badge, dealer: d.directory.find(dealer => dealer.brand === badge.brand && dealer.dealerCode === badge.dealerCode) }));
    h.window.AIQCData = undefined;
  }
  const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
  const start = source.indexOf('const badgeManagementDealer =');
  vm.runInContext(source.slice(start, source.indexOf('function renderBadgeManagementPage()', start)), h.c);
  function include(name) {
    const begin = source.indexOf(`function ${name}(`);
    assert(begin >= 0, name);
    vm.runInContext(source.slice(begin, source.indexOf('\n}\n', begin) + 2), h.c);
  }
  for (const name of ['getDeviceListExportRequest', 'submitBadgeManagementRebind', 'submitBadgeManagementConfirm']) include(name);
  Object.assign(h.c, { getBadgeExportTimestamp: () => 'test', renderBadgeManagementPage() {}, closeBadgeManagementConfirm() {}, closeBadgeManagementMemberModal() {}, showToast() {} });
  return { ...h, data: d, model: vm.runInContext('({dealer:badgeManagementDealer,badges:badgeManagementBadges,employees:badgeManagementEmployees,state:badgeManagementState})', h.c) };
}

test('badge management lists every exact store asset and shares search, binding changes and export scope', () => {
  const h = management(), m = h.model;
  const expected = h.data.badges.filter(badge => badge.brand === m.dealer.brand && badge.dealerCode === m.dealer.dealerCode);
  assert(expected.length >= 5);
  assert.deepEqual(new Set(m.badges.map(badge => badge.sn)), new Set(expected.map(badge => badge.sn)));
  assert.equal(h.c.getDeviceListExportRequest('management').rows.length, expected.length);
  const badge = m.badges.find(item => item.employeeId);
  assert(h.c.getBadgeManagementEmployee(badge.employeeId));
  m.state.query = badge.sn;
  assert.deepEqual(Array.from(h.c.getBadgeManagementRecords(), item => item.sn), [badge.sn]);
  assert.equal(h.c.getDeviceListExportRequest('management').rows.length, 1);
  m.state.confirmSn = badge.sn; m.state.confirmAction = 'unbind';
  h.c.submitBadgeManagementConfirm();
  assert.equal(h.c.getDeviceListExportRequest('management').rows[0][3], '未绑定');
  const employee = m.employees.find(item => !h.c.getBadgeManagementBinding(item.employeeId));
  m.state.activeSn = badge.sn; m.state.selectedEmployeeId = employee.employeeId;
  h.c.submitBadgeManagementRebind();
  assert.equal(h.c.getDeviceListExportRequest('management').rows[0][2], employee.employeeId);
  m.state.confirmSn = badge.sn; m.state.confirmAction = 'remove';
  h.c.submitBadgeManagementConfirm();
  assert.equal(h.c.getDeviceListExportRequest('management').rows.length, 0);
});

test('legacy badge data keeps the same exact store assets without appending a template badge', () => {
  const h = management({ legacy: true }), m = h.model;
  const expected = h.data.badges.filter(badge => badge.brand === m.dealer.brand && badge.dealerCode === m.dealer.dealerCode);
  assert.deepEqual(new Set(m.badges.map(badge => badge.sn)), new Set(expected.map(badge => badge.sn)));
  assert.equal(h.c.getDeviceListExportRequest('management').rows.length, expected.length);
});
