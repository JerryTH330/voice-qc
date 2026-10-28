const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
function detail(route,id,source='leads') {return setup('store','',{file:route==='session-detail'?'session/index.html':'leads/index.html',search:'?'+new URLSearchParams({route,[route==='session-detail'?'sessionId':'leadId']:id,leadSource:source})});}
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
