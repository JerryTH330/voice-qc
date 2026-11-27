const test = require('node:test');
const assert = require('node:assert/strict');
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

test('visit and test drive statuses are blue in both lead table views', () => {
  const h = list('leads');
  for (const view of ['leads', 'customers']) {
    h.click(`[data-lr-view="${view}"]`);
    const statuses = [...h.host.querySelectorAll('#leadsTableBody td[data-column-key="leadStatus"] .status-inline')];
    for (const value of ['已到店', '已试驾']) {
      const matches = statuses.filter(status => status.textContent.trim() === value);
      assert(matches.length && matches.every(status => status.classList.contains('blue')), `${view}: ${value}`);
    }
  }
});

test('lead dates default to all and calendar changes apply only after confirmation', async () => {
  const h = list('leads');
  const total = () => h.host.querySelector('#leadsPagination .session-pagination-total').textContent;
  const data = h.window.AIQCData;
  const all = `共 ${data.leads.length} 条`;
  assert.equal(total(), all);
  h.click('[data-lr-collapse]');
  h.click('[data-lr-date-trigger]');
  h.click('[data-lr-date-shortcut="last7"]');
  assert.equal(total(), all);
  h.click('[data-lr-date-apply]');
  assert.equal(total(), `共 ${data.query(data.defaultRange).leads.length} 条`);
  h.click('[data-lr-date-trigger]');
  h.click('[data-lr-date-shortcut="all"]');
  assert.notEqual(total(), all);
  h.click('[data-lr-date-apply]');
  assert.equal(total(), all);
  await exportedIds(h, 'leads');
  assert(h.submitted.at(-1).filters.some(filter => filter.label === '统计日期' && filter.value === '全部时间'));
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
  for (const label of ['顾问', '门店', '业务场景', '意向车系']) assert(request.filters.some(filter => filter.label === label), label);
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

test('badge assets and event histories omit retired charge data', () => {
  const h = setup('store');
  const { badges, badgeEvents } = h.window.AIQCData;
  const original = h.window.AIQCOrganization.badges;
  assert(original.every(asset => badges.some(badge => badge.sn === asset.sn)));
  assert.deepEqual(new Set(badges.map(badge => badge.badgeType)), new Set(['—', '4G版本工牌', '明略Wi-Fi工牌', '智能工牌·LIVE']));
  assert(badges.every(badge => !Object.hasOwn(badge, 'dockConnected')));
  const eventTypes = new Set(badgeEvents.flatMap(record => record.events.map(event => event.type)));
  assert(eventTypes.has('recording-start') && eventTypes.has('low-battery'));
  assert(!eventTypes.has('charging-start') && !eventTypes.has('charging-end'));
  h.controller.destroy();
});
