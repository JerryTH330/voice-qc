const test = require('node:test');
const assert = require('node:assert/strict');
const { setup } = require('./helpers/unified-dom.cjs');

function config() {
  const h = setup('store', '', { file: 'config/index.html', search: '?route=config' });
  Object.defineProperty(h.window.HTMLInputElement.prototype, 'checked', {
    configurable: true,
    get() { return this.hasAttribute('checked'); },
    set(value) { this.toggleAttribute('checked', Boolean(value)); }
  });
  return h;
}

function system(storage) {
  const h = setup('store', '', { file: 'system/index.html', search: '?route=system', storage });
  const dialog = h.host.querySelector('#systemRoleDialog');
  if (dialog) {
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => { dialog.removeAttribute('open'); dialog.dispatchEvent(new h.window.Event('close')); };
  }
  const scope = h.host.querySelector('#systemRoleScope');
  if (scope) Object.defineProperty(scope, 'value', { configurable: true, writable: true, value: '门店' });
  return h;
}

test('quality rule names and descriptions survive task switches as literal text', () => {
  const h = config();
  h.c.selectTask(1);
  const name = '确认"意向车型" <必问> & 预算';
  const desc = '说明 </textarea><img src=x onerror=alert(1)>\n第二行 & "原句"';
  h.host.querySelector('.rule-card .rule-input').value = name;
  h.host.querySelector('.rule-card .rule-textarea').value = desc;
  h.c.enableTaskConfig();
  h.c.selectTask(2);
  h.c.selectTask(1);
  assert.equal(h.host.querySelector('.rule-card .rule-input').value, name);
  assert.equal(h.host.querySelector('.rule-card .rule-textarea').value, desc);
  assert.equal(h.host.querySelectorAll('.rule-card img').length, 0);
});

test('duplicate quality names cannot activate a task or be saved as a draft', () => {
  for (const save of ['enableTaskConfig', 'saveAsDraft']) {
    const h = config();
    h.c.selectTask(1);
    h.c.addRuleItem(' 开场白与确认 ', '另一项定义');
    h.c[save]();
    assert.match(h.host.querySelector('#feedbackModalTitle').textContent, /重复/);
    assert.match(h.host.querySelector('#feedbackModalMessage').textContent, /开场白与确认/);
    h.c.selectTask(2);
    h.c.selectTask(1);
    assert.equal(h.host.querySelectorAll('.rule-card').length, 1, 'failed save must preserve the prior task');
  }
});

test('all models selects available models and empty models has an honest placeholder', () => {
  const h = config();
  h.c.selectTask(1);
  h.c.clearCustomOptions('modelSelectOptions');
  assert.match(h.host.querySelector('#modelSelectTrigger').textContent, /请选择车型/);
  assert.equal(typeof h.c.selectAllCustomOptions, 'function');
  h.c.selectAllCustomOptions('modelSelectOptions');
  const choices = h.host.querySelectorAll('#modelSelectOptions input[type="checkbox"]');
  assert.equal(h.c.getCustomSelectValues('modelSelectOptions').length, choices.length);
  assert.match(h.host.querySelector('#modelSelectTrigger').textContent, /全部车型/);
  h.c.enableTaskConfig();
  assert.match(h.host.querySelector('#feedbackModalTitle').textContent, /已更新/);
  h.c.selectTask(2);
  h.c.setCustomSelectValues('modelSelectOptions', ['M8'], 'modelSelectTrigger');
  h.c.setCustomSelectValues('scenarioSelectOptions', ['邀约'], 'scenarioSelectTrigger');
  h.c.addRuleItem('不同规则', '说明');
  h.c.enableTaskConfig();
  assert.match(h.host.querySelector('#feedbackModalTitle').textContent, /配置重复/);
});

test('no-audio message is visible to assistive technology and waveform state can recover', () => {
  const h = setup('store', '', { file: 'session/index.html', search: '?route=session-detail' });
  h.c.renderSessionDetailWaveform();
  const waveform = h.window.document.getElementById('sessionWaveform');
  assert(waveform.classList.contains('is-empty'));
  assert.equal(waveform.getAttribute('role'), 'status');
  assert.equal(waveform.getAttribute('aria-hidden'), null);
  h.window.AIQCData = null;
  h.c.renderSessionDetailWaveform(30);
  assert(!waveform.classList.contains('is-empty'));
  assert.equal(waveform.getAttribute('role'), null);
  assert.equal(waveform.getAttribute('aria-hidden'), 'true');
  assert(waveform.querySelector('.waveform-bar'));
});

test('linked lead journey retains each recording summary rather than a fixed portrait', () => {
  const base = setup('store');
  const lead = base.window.AIQCData.leads.find(row => row.linkedDemo && row.recordingIds.length);
  const recording = base.window.AIQCData.getRecording(lead.recordingIds[0]);
  const h = setup('store', '', { file: 'leads/index.html', search: '?route=leads-detail&leadId=' + encodeURIComponent(lead.id) });
  assert.doesNotMatch(h.host.textContent, /核心关注拍照|有7座车购车意向/);
  assert(h.host.querySelector('.journey-section-content'));
  assert.match(h.host.textContent, new RegExp((recording.summary || '未提供').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('customer journey retains recording summaries and preserves missing-summary empty states', () => {
  const h = setup('store', '', { file: 'leads/index.html', search: '?route=leads' });
  const lead = h.window.AIQCData.leads.find(row => row.linkedDemo && row.recordingIds.length);
  const record = h.window.AIQCData.getRecording(lead.recordingIds[0]);
  record.summary = '只属于当前录音的摘要 <原句> & 客户需求';
  h.window.__openLeadCustomerDetail({ ...lead, aggregateLeadRecords: [lead] });
  assert.match(h.host.querySelector('.customer-journey-timeline').textContent, /只属于当前录音的摘要 <原句> & 客户需求/);
  assert.doesNotMatch(h.host.textContent, /核心关注拍照|有7座车购车意向/);
  h.c.renderCustomerDetailJourney({ journeyEntries: [{ id: record.audioId, time: record.startTime, stage: record.scene, store: record.store, tags: [], summary: '' }] });
  assert.match(h.host.querySelector('.customer-journey-timeline').textContent, /当前录音未提供会话小结/);
});

test('system actions use buttons, persist local roles, and export the displayed audit rows', () => {
  const h = system();
  assert(h.window.document.querySelector('button[data-system-action="add-role"]'));
  assert(h.window.document.querySelector('button[data-system-action="export-audit"]'));
  h.c.openSystemRoleDialog();
  h.host.querySelector('#systemRoleName').value = '测试角色 <本地>';
  h.host.querySelector('#systemRoleScope').value = '门店';
  h.host.querySelector('#systemRoleForm').dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.match(h.host.querySelector('[data-system-roles]').textContent, /测试角色 <本地>/);
  assert.equal(h.host.querySelector('[data-system-roles] img'), null);
  const refreshed = system(Object.fromEntries(h.storage));
  assert.match(refreshed.host.querySelector('[data-system-roles]').textContent, /测试角色 <本地>/);
  assert.match(refreshed.host.textContent, /不会授予线上权限/);
  const csv = refreshed.c.buildSystemAuditCsv();
  const rows = refreshed.host.querySelectorAll('[data-system-audit] .table-list-row');
  assert.equal(csv.trim().split('\r\n').length, rows.length);
  for (const row of rows) for (const cell of row.children) assert(csv.includes(cell.textContent.trim()));
});

test('blank, duplicate and cancelled roles do not change the role table or storage', () => {
  const h = system();
  const rows = () => h.host.querySelectorAll('[data-system-roles] .table-list-row').length;
  const originalCount = rows();
  const submit = () => h.host.querySelector('#systemRoleForm').dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
  h.c.openSystemRoleDialog();
  h.host.querySelector('#systemRoleName').value = '   ';
  submit();
  assert.match(h.host.querySelector('#systemRoleError').textContent, /请输入/);
  h.host.querySelector('#systemRoleName').value = ' 总部运营 ';
  submit();
  assert.match(h.host.querySelector('#systemRoleError').textContent, /已存在/);
  h.host.querySelector('#systemRoleName').value = '取消的角色';
  h.click('[data-system-role-close]');
  assert.equal(rows(), originalCount);
  assert.equal(h.storage.has('aiqc-system-local-roles-v1'), false);
  assert.equal(h.window.document.__focused, h.window.document.querySelector('[data-system-action="add-role"]'));
});

test('role storage failure leaves the dialog open and never reports a saved role', () => {
  const h = system();
  h.c.openSystemRoleDialog();
  h.host.querySelector('#systemRoleName').value = '不可保存';
  h.window.localStorage.setItem = () => { throw new Error('quota'); };
  h.host.querySelector('#systemRoleForm').dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
  assert(h.host.querySelector('#systemRoleDialog').hasAttribute('open'));
  assert.match(h.host.querySelector('#systemRoleError').textContent, /保存失败/);
  assert.doesNotMatch(h.host.querySelector('[data-system-roles]').textContent, /不可保存/);
  assert.doesNotMatch(h.c.buildSystemAuditCsv(), /不可保存/);
});
