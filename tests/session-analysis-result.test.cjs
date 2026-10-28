const test = require('node:test');
const assert = require('node:assert/strict');
const {setup} = require('./helpers/unified-dom.cjs');

const processStates = ['录音上传中', '录音转写中', '模型分析中'];

function list(status, original = false) {
  const h = setup('store', '', {file: 'session/index.html', search: '?route=session'});
  if (status) {
    h.record = h.window.AIQCData.recordings.find(record => record.status === status && Boolean(record.linkedDemo) !== original);
    assert(h.record, `missing ${original ? 'original' : 'demo'} fixture for ${status}`);
    h.window.location.search = '?' + new URLSearchParams({route: 'session', focusRecordingId: h.record.audioId});
  }
  h.run('session-search-utils.js');
  h.run('shared/field-settings-interactions.js');
  h.run('session/session-real-runtime.js');
  h.flush();
  h.submitted = [];
  h.window.ExportTaskUI = {submit: async request => h.submitted.push(request)};
  return h;
}

function resultCell(h) {
  const headers = [...h.host.querySelectorAll('#sessionRealTable > thead > tr > th')];
  const index = headers.findIndex(header => header.dataset.columnKey === 'status');
  assert(index >= 0, 'analysis result column must remain');
  const rows = h.host.querySelectorAll('#sessionRealTable > tbody > tr[data-session-real-row]');
  assert.equal(rows.length, 1, 'focused recording must remain visible');
  assert.equal(rows[0].dataset.sessionRealRow, h.record.audioId);
  return rows[0].children[index];
}

function openResultMenu(h) {
  if (!h.host.querySelector('[data-sr-trigger="status"]')) h.click('[data-sr-collapse]');
  h.click('[data-sr-trigger="status"]');
  return [...h.host.querySelectorAll('[data-sr-option-key="status"]')];
}

async function exportedResult(h, expected) {
  h.click('[data-sr-export]');
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.submitted.length, 1);
  const request = h.submitted[0];
  assert.equal(request.rows.length, 1, 'export must retain the focused recording');
  const idIndex = request.columns.findIndex(column => column.label === '录音ID');
  const resultIndex = request.columns.findIndex(column => column.label === '分析结果');
  assert(idIndex >= 0 && resultIndex >= 0);
  assert.equal(request.rows[0][idIndex], h.record.audioId);
  assert.equal(request.rows[0][resultIndex], expected);
}

test('analysis result menu contains only completed and failed outcomes', () => {
  const h = list();
  assert.deepEqual(openResultMenu(h).map(option => option.dataset.srOptionValue), ['已完成', '失败']);
});

for (const status of processStates) {
  test(`${status}: focused row and export keep the recording with an absent analysis result`, async () => {
    const h = list(status);
    const cell = resultCell(h);
    assert.equal(cell.textContent.trim(), '—');
    assert(!cell.querySelector('.status-inline-dot'), 'absent result must not have a status dot');
    await exportedResult(h, '—');
    assert.equal(h.window.AIQCData.getRecording(h.record.audioId).status, status, 'shared processing state must remain unchanged');
  });
}

for (const status of ['已完成', '失败']) {
  test(`original ${status}: list, export and detail preserve the outcome`, async () => {
    const h = list(status, true);
    assert.equal(resultCell(h).textContent.trim(), status);
    await exportedResult(h, status);
    const detail = setup('store', '', {
      file: 'session/index.html',
      search: '?' + new URLSearchParams({route: 'session-detail', sessionId: h.record.audioId})
    });
    assert.equal(detail.host.querySelector('#sessionDetailContextPill').textContent.split(' / ').at(-1), status);
    assert.equal(detail.window.AIQCData.getRecording(h.record.audioId).status, status);
  });
}

for (const status of processStates) {
  test(`${status}: detail shows an absent result while preserving shared processing state`, () => {
    const h = setup('store', '', {file: 'session/index.html', search: '?route=session'});
    const record = h.window.AIQCData.recordings.find(item => item.linkedDemo && item.status === status);
    assert(record);
    const detail = setup('store', '', {
      file: 'session/index.html',
      search: '?' + new URLSearchParams({route: 'session-detail', sessionId: record.audioId})
    });
    assert.match(detail.host.querySelector('#sessionDetailRecordId').textContent, new RegExp(record.audioId));
    assert.equal(detail.host.querySelector('#sessionDetailContextPill').textContent.split(' / ').at(-1), '—');
    assert.equal(detail.window.AIQCData.getRecording(record.audioId).status, status);
  });
}

test('reset keeps the existing completed default without restoring a process filter', () => {
  const h = list('录音转写中');
  h.click('[data-sr-reset]');
  const options = openResultMenu(h);
  assert.deepEqual(options.map(option => option.dataset.srOptionValue), ['已完成', '失败']);
  assert.deepEqual(options.filter(option => option.getAttribute('aria-selected') === 'true').map(option => option.dataset.srOptionValue), ['已完成']);
});

test('reset after hiding analysis result keeps all outcomes and exports the same scope', async () => {
  const h = list();
  const expected = h.window.AIQCData.query(h.window.AIQCData.defaultRange).recordings;
  h.click('[data-sr-settings]');
  const checkbox = h.window.document.querySelector('[data-sr-column-visible="status"]');
  checkbox.checked = false;
  checkbox.dispatchEvent(new h.window.Event('change', {bubbles: true}));
  h.click('[data-sr-settings-save]');
  h.click('[data-sr-reset]');
  h.click('[data-sr-collapse]');
  assert.equal(h.host.querySelector('[data-sr-trigger="status"]'), null);
  h.click('[data-sr-export]');
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.submitted.length, 1);
  assert.equal(h.submitted[0].rows.length, expected.length);
  assert(!h.submitted[0].filters.some(filter => filter.label === '分析结果'));
  assert(!h.submitted[0].columns.some(column => column.label === '分析结果'));

  h.click('[data-sr-settings]');
  const restored = h.window.document.querySelector('[data-sr-column-visible="status"]');
  restored.checked = true;
  restored.dispatchEvent(new h.window.Event('change', {bubbles: true}));
  h.click('[data-sr-settings-save]');
  assert.deepEqual(openResultMenu(h).filter(option => option.getAttribute('aria-selected') === 'true'), []);
});

test('invalid phone input stays empty and cannot export; clearing it restores the current scope', () => {
  const h = list();
  h.click('[data-sr-collapse]');
  const input = h.host.querySelector('[data-sr-query="advisorPhone"]');
  input.value = 'ABC';
  input.dispatchEvent(new h.window.Event('input', {bubbles: true}));
  h.flush();
  assert.equal(h.host.querySelectorAll('#sessionRealTable [data-session-real-row]').length, 0);
  assert.equal(h.host.querySelector('[data-sr-export]').disabled, true);
  assert.match(h.host.querySelector('#sessionRealEmptyState').textContent, /手机号需包含数字/);
  const currentInput = h.host.querySelector('[data-sr-query="advisorPhone"]');
  assert.equal(currentInput.getAttribute('placeholder'), '输入顾问手机号');
  currentInput.value = '';
  currentInput.dispatchEvent(new h.window.Event('input', {bubbles: true}));
  h.flush();
  assert(h.host.querySelectorAll('#sessionRealTable [data-session-real-row]').length > 0);
  assert.equal(h.host.querySelector('[data-sr-export]').disabled, false);
});
