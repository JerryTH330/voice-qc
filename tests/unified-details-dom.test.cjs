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
test('historical examples open their own complete journeys from the top of the customer list', () => {
  const list = setup('store', '', { file: 'leads/index.html', search: '?route=leads&leadsView=customers' });
  list.run('shared/field-settings-interactions.js');
  list.run('leads/leads-modern-runtime.js');
  const customers = list.window.AIQCData.customers(list.window.AIQCData.leads);
  const rows = [...list.host.querySelectorAll('#leadsTableBody > tr')];
  assert.deepEqual(rows.slice(0, 2).map(row => row.dataset.customerExampleRow), ['multi-node', 'multi-store']);
  assert.deepEqual(rows.slice(0, 2).map(row => row.querySelector('[data-column-key="customerName"]').textContent.trim()), ['林嘉远演示样例', '郑昱辰演示样例']);
  assert.equal(rows.length, 12);
  assert.equal(list.host.querySelector('#leadsPagination .session-pagination-total').textContent, `共 ${customers.length} 条`);
  const links = rows.slice(0, 2).map(row => row.querySelector('.lead-customer-example-link'));
  list.click('[data-lr-page="2"]');
  assert.equal(list.host.querySelectorAll('#leadsTableBody > tr').length, 10);
  assert(!list.host.querySelector('[data-customer-example-row]'));
  list.click('[data-lr-view="leads"]');
  assert(!list.host.querySelector('[data-customer-example-row]'));

  const fixtures = [
    { customer: '林*远', leads: 4, stores: 3, recordings: 21 },
    { customer: '郑*辰', leads: 7, stores: 7, recordings: 8 }
  ];
  for (const [index, fixture] of fixtures.entries()) {
    const { search } = new URL(links[index].getAttribute('href'), list.window.location.href);
    const h = setup('store', '', { file: 'leads/index.html', search });
    assert.equal(h.host.querySelector('#customerDetailHeroTitle').textContent, fixture.customer);
    assert.equal(h.host.querySelector('#customerDetailLeadCount').textContent, `关联线索：${fixture.leads}条线索`);
    assert.equal(h.host.querySelector('#customerDetailStoreCount').textContent, `关联门店：${fixture.stores}个门店`);
    assert.equal(h.host.querySelectorAll('[data-customer-journey-entry]').length, fixture.recordings);
    assert(!h.host.querySelector('[data-customer-example-label]').hidden);
    assert(h.host.querySelector('[data-customer-ai-generate]'));
    assert(!h.host.querySelector('[data-lead-session-link]'));
    const detailedSummaries = h.host.querySelectorAll('[data-example-journey-summary]');
    assert.equal(detailedSummaries.length, 1);
    const summary = detailedSummaries[0];
    const summaryCard = summary.closest('[data-customer-journey-entry]');
    assert.equal(summary.querySelectorAll('p').length, 3);
    assert(summary.textContent.includes(summaryCard.querySelector('.customer-journey-store-name').textContent.split(' · ')[0]));
    assert.equal(summaryCard.querySelector('[data-journey-card-toggle]').getAttribute('aria-controls'), summary.id);

    h.run('shared/field-settings-interactions.js');
    h.run('leads/leads-modern-runtime.js');
    h.click('.customer-detail-page [data-route="leads"]');
    const returned = new URLSearchParams(h.window.location.search);
    assert.equal(returned.get('leadsView'), 'customers');
    assert(!returned.has('customerExample'));
  }
});
