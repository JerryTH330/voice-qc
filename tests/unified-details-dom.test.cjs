const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
function detail(route, id, source = 'leads', { returnView, focusLeadId } = {}) {
  const recording = route === 'session-detail';
  const params = new URLSearchParams({ route, [recording ? 'sessionId' : 'leadId']: id, leadSource: source });
  if (returnView) params.set('leadReturnView', returnView);
  if (focusLeadId) params.set('focusLeadId', focusLeadId);
  return setup('store', '', { file: recording ? 'session/index.html' : 'leads/index.html', search: '?' + params });
}
test('unknown lead and recording IDs never display template facts',()=>{
  for(const route of ['leads-detail','session-detail']){
    const h=detail(route,'missing-record');
    assert.match(h.host.textContent,/未找到.*记录/);
    assert(!h.host.querySelector('[data-lead-session-link]'));
    assert.doesNotMatch(h.host.textContent,/N60|有两个孩子/);
  }
});
test('original lead details clear template journey, tags and model',()=>{
  const base=setup('store'),l=base.window.AIQCData.leads.find(l=>!l.linkedDemo&&l.associationMissing);base.controller.destroy();
  const h=detail('leads-detail',l.id,'advisor');
  assert.match(h.host.querySelector('#leadDetailLeadId').textContent,new RegExp(l.id));
  assert.match(h.host.querySelector('#leadDetailEvidenceText').textContent,/关联缺失/);
  assert.equal(h.host.querySelectorAll('[data-lead-session-link]').length,0);
  assert.equal(h.host.querySelectorAll('.lead-detail-hero-step').length,0);
  assert.doesNotMatch(h.host.textContent,/N60|有两个孩子|18-24岁/);
});
test('undetermined lead intent uses neutral styles and shows the linked-record icon', () => {
  const { host } = detail('leads-detail', 'LEAD-LINK-LINK-50-0058');
  const marker = host.querySelector('#leadDetailHeroEvolutionSteps .lead-detail-hero-step-marker');
  assert.equal(marker.textContent, '无法判断');
  assert(!marker.matches('.tone-red, .tone-amber, .tone-blue'));
  const summary = host.querySelector('#leadDetailIntentLevel');
  assert.equal(summary.textContent, 'AI意向级别：无法判断');
  assert(summary.classList.contains('level-undetermined'));
  const label = [...host.querySelectorAll('.journey-section-label')].find(node => node.textContent.trim() === '关联记录');
  assert.equal(label.querySelector('.journey-section-icon').getAttribute('src'), '../assets/navigation/leads.svg');
});
test('returning from a linked lead detail restores the originating list view without adding a lead ID filter', () => {
  const id = 'LEAD-LINK-LINK-50-0058';
  for (const [returnView, focusLeadId] of [['leads', null], ['customers', null], ['leads', id], ['customers', id]]) {
    const h = detail('leads-detail', id, 'leads', { returnView, focusLeadId });
    h.run('shared/field-settings-interactions.js');
    h.run('leads/leads-modern-runtime.js');
    h.click('.lead-detail-back-button');
    const params = new URLSearchParams(h.window.location.search);
    assert.equal(params.get('route'), 'leads');
    assert.equal(params.get('leadsView'), returnView);
    assert.equal(params.get('focusLeadId'), returnView === 'leads' ? focusLeadId : null);
  }
});
test('recording metadata and transcript survive tab changes for each real processing state',()=>{
  const base=setup('store'),rows=base.window.AIQCData.recordings;
  const examples=[rows.find(r=>!r.linkedDemo&&r.status==='已完成'),rows.find(r=>!r.linkedDemo&&r.status==='失败'),...['已完成','失败','录音上传中','录音转写中','模型分析中'].map(status=>rows.find(r=>r.linkedDemo&&r.status===status))];base.controller.destroy();
  for(const r of examples){
    assert(r);const h=detail('session-detail',r.audioId);
    assert.match(h.host.querySelector('#sessionDetailRecordId').textContent,new RegExp(r.audioId));
    assert.match(h.host.querySelector('.sop-result-list').textContent,/暂无/);
    const before=h.host.querySelector('#sessionAiTranscriptPanel .transcript-list').textContent;
    h.click('[data-session-ai-view="transcript"]');h.click('[data-session-ai-view="insight"]');
    assert.equal(h.host.querySelector('#sessionAiTranscriptPanel .transcript-list').textContent,before);
    for(const id of ['sessionPlayToggle','sessionBack15','sessionForward15','sessionSpeedToggle','sessionProgressRange'])assert(h.host.querySelector('#'+id)?.disabled,id);
    assert(!h.host.querySelector('#sessionWaveform .waveform-bar'),'no invented audio waveform');
  }
});
test('customer detail uses selected exact lead IDs and loaded recordings only',()=>{
  const h=detail('leads',''),d=h.window.AIQCData,l=d.leads.find(l=>!l.linkedDemo&&l.associationMissing);
  h.window.__openLeadCustomerDetail({...l,aggregateLeadRecords:[l]});
  assert.match(h.host.querySelector('#customerDetailRecordingSummary').textContent,/已加载.*0/);
  assert.match(h.host.textContent,/关联缺失/);
  assert.equal(h.host.querySelectorAll('[data-lead-session-link]').length,0);
  assert.equal(h.host.querySelectorAll('[data-customer-ai-generate]').length,0);
  assert.doesNotMatch(h.host.textContent,/有两个孩子|苏州园区门店|N60/);
});
