const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function setup() {
  const context = vm.createContext({ window: {}, URLSearchParams, Date: class extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-20T12:00:00+08:00'])); }
  } });
  for (const file of ['leads/organization-data.js', 'shared/organization-directory.js', 'device-management/organization-data.js', 'session/real-recording-data.js', 'leads/real-lead-data.js', 'shared/linked-demo-data.js', 'shared/badge-history-data.js','shared/unified-data.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return context.window.AIQCData;
}
const plain = value => JSON.parse(JSON.stringify(value));
test('preserves all original and linked identities, with explicit unresolved associations', () => {
  const d = setup();
  assert.equal(d.recordings.length, 5315); assert.equal(d.leads.length, 5455);
  assert.equal(d.visits.length, 3615); assert.equal(d.badges.length, 620);
  assert.equal(d.recordings.filter(r => !r.linkedDemo && r.associationMissing).length, 1962);
  assert.equal(d.leads.filter(r => !r.linkedDemo).length, 1840);
  for (const v of d.visits) {
    assert.equal(d.getLead(v.leadId).businessId, v.businessId);
    if (v.recordingId) assert.equal(d.getRecording(v.recordingId).leadId, v.leadId);
  }
  assert.equal(d.getRecording('missing-recording'), undefined);
});
test('asset, binding and employee totals derive from exact SN and advisor identities', () => {
  const d = setup();
  assert.equal(d.stores.reduce((n,r) => n+r.badges, 0), 620);
  assert.equal(d.stores.reduce((n,r) => n+r.bindings, 0), 610);
  assert.equal(d.badges.filter(r => r.advisorId).length, 610);
  for (const s of d.stores) assert.equal(s.bindings, d.badges.filter(b => b.brand === s.brand && b.dealerCode === s.code && b.advisorId).length);
});
test('one scope drives recording totals, advisor ranking, evidence and daily chart', () => {
  const d = setup(), scope = { ...d.defaultRange };
  const all = d.query(scope), advisor = all.recordings[0].advisorKey;
  const one = d.query({ ...scope, advisorKeys: [advisor] });
  assert(one.recordings.length > 0); assert(one.recordings.every(r => r.advisorKey === advisor));
  assert.equal(one.metrics.recordingCount, one.recordings.length);
  assert.equal(one.trend.reduce((n,r) => n+r.recordingCount, 0), one.recordings.length);
  assert.equal(one.advisors.reduce((n,r) => n+r.recordingCount, 0), one.recordings.length);
  assert(one.leads.every(l => l.advisorKey === advisor));
  const empty = d.query({ ...scope, advisorKeys: ['unrelated-id'] });
  assert.equal(empty.metrics.recordingCount, 0); assert.equal(empty.metrics.qualifiedRate, null);
  assert.equal(empty.leads.length, 0); assert(empty.trend.every(r => r.recordingCount === 0));
});
test('source, scenes, vehicle identity and inclusive dates filter actual records', () => {
  const d = setup(), scope = { ...d.defaultRange, scenes: ['销售接待'] }, q = d.query(scope);
  assert(q.recordings.length > 0); assert(q.recordings.every(r => r.scenario === '销售接待'));
  assert.equal(q.metrics.cloudCount, 0); assert.equal(q.metrics.badgeCount, q.recordings.length);
  const oneDay = d.query({ startDate: scope.endDate, endDate: scope.endDate });
  assert(oneDay.recordings.every(r => r.startTime.startsWith(scope.endDate)));
  assert.deepEqual(plain(oneDay.trend.map(r => r.date)), [scope.endDate]);
  const r = q.recordings[0], model = r.brand + '::' + r.leadCarSeries;
  assert(d.query({ ...scope, models: [model] }).recordings.every(v => v.brand === r.brand && v.leadCarSeries === r.leadCarSeries));
  assert.equal(q.metrics.riskCount, null); assert.equal(q.rules.length, 0);
});
test('original lead fields are stable across list and detail, with no invented analysis or IDs', () => {
  const d = setup(), l = d.leads.find(r => !r.linkedDemo);
  assert.equal(d.getLead(l.id), l); assert.equal(l.advisorCode, '');
  assert.equal(l.aiLeadValidity, '关联缺失');
  const payload = d.leadPayload(l);
  assert.equal(payload.leadId, l.id); assert.equal(payload.intentLevel, '无法判断');
  assert.deepEqual(plain(payload.models), ['—']);
  assert.equal(payload.evolutionSteps.length, 0);
  assert.match(payload.evidenceText, /关联缺失/);
});
module.exports = { setup };
test('customer groups require customer IDs and preserve declaration versus loaded counts',()=>{
 const d=setup(),original=d.leads.filter(l=>!l.linkedDemo);
 const groups=d.customers(original);
 assert.equal(groups.length,original.length);
 assert.equal(groups.reduce((n,r)=>n+r.aggregateAudioCount,0),233);
 assert.equal(groups.reduce((n,r)=>n+r.aggregateLoadedAudioCount,0),0);
 const l=original.find(l=>l.associationMissing),other=original.find(r=>r.id!==l.id);
 const payload=d.customerPayload({...l,aggregateLeadRecords:[l,other]});
 assert.equal(payload.aggregateLeadCount,1);assert.equal(payload.aggregateAudioCount,0);
 assert.equal(payload.declaredAudioCount,l.recordingCount);
 const fake=[{...l,customerId:'same',customerName:'A'},{...other,customerId:'same',customerName:'B'}];
 assert.equal(d.customers(fake).length,1);
});
test('badge history preserves original events and never applies current binding names to history',()=>{
 const d=setup(),events=d.badgeEvents.filter(r=>!r.linkedDemo),uploads=d.badgeUploads.filter(r=>!r.linkedDemo);
 assert.equal(events.length,4);assert.equal(uploads.length,15);
 assert(events.every(r=>r.associationMissing&&r.historicalAdvisorId===''));
 assert(uploads.every(r=>r.associationMissing&&r.historicalAdvisorId===''));
 assert.equal(events[0].employeeName,'陈佳');assert.notEqual(d.getBadge(events[0].sn)?.advisorName,'陈佳');
 for(const u of d.badgeUploads.filter(r=>r.linkedDemo)){
   const v=d.visits.find(v=>v.businessId===u.businessId);assert.equal(v.recordingId,u.recordingId);assert.equal(v.badgeSn,u.sn);assert.equal(v.advisorId,u.historicalAdvisorId);
 }
 for(const b of d.badges)assert.equal(b.loadedPendingUploads,d.badgeUploads.filter(u=>u.sn===b.sn&&u.status==='未上传').length);
});
test('weighted hierarchy rates derive from scored recordings and stable organization IDs',()=>{
 const d=setup(),rows=d.query(d.defaultRange).recordings;
 function check(tree){for(const node of tree){const keys=new Set();for(const child of node.children){assert(!keys.has(child.id));keys.add(child.id);}if(node.children.length){assert.equal(node.recordingCount,node.children.reduce((n,c)=>n+c.recordingCount,0));assert.equal(node.qualifiedCount,node.children.reduce((n,c)=>n+c.qualifiedCount,0));check(node.children);}}}
 check(d.ranking(rows));check(d.ranking(rows,'geography'));
 const sample=rows[0],a={...sample,qualifiedRate:'80%',status:'已完成'},b={...sample,qualifiedRate:'20%',status:'已完成'},failed={...sample,qualifiedRate:'99%',status:'失败'};
 const result=d.ranking([a,b,b,failed])[0];assert(Math.abs(result.qualifiedRate-100/3)<1e-10);assert.equal(result.hitRate,40);
});
