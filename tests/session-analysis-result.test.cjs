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
