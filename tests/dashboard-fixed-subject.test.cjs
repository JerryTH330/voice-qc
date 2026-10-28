const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));
const shop='G216-SHA0120';

for(const kind of ['store','factory'])test(`${kind}: advisor controls stay absent and saved advisor filters are discarded`,()=>{
  const initial=setup(kind),first=initial.controller;
  const expected=Array.from(first.result.recordings,row=>row.audioId);
  const person=initial.window.AIQCData.advisors.find(item=>first.result.recordings.some(row=>row.advisorKey===item.advisorKey));
  const saved={...plain(first.state),organization:{...plain(first.model.applied),advisor:[person.advisorKey]}};
  first.destroy();
  const h=setup(kind,'',{saved:{[kind]:saved}}),a=h.controller;
  const absent=()=>assert(!h.host.querySelector('[data-sd-control="advisor"], [data-sd-trigger="advisor"]'));
  absent();assert.deepEqual(plain(a.model.applied.advisor),[]);assert.deepEqual(plain(a.state.organization.advisor),[]);
  assert.deepEqual(Array.from(a.result.recordings,row=>row.audioId),expected);
  if(kind==='factory'){
    h.click('[data-sd-collapse]');absent();
    h.click('[data-sd-dimension="geography"]');absent();
  }
  h.click('[data-sd-reset]');absent();
  assert.deepEqual(plain(a.model.applied.advisor),[]);
  assert.deepEqual(Array.from(a.result.recordings,row=>row.audioId),expected);
  a.destroy();
});

test('store business controls and every result stay within its explicit store through reset',()=>{
  const h=setup('store','',{search:'?storeId='+shop}),a=h.controller,d=h.window.AIQCData;
  const expected=d.query({...d.defaultRange,predicate:row=>row.storeId===shop});
  assert(expected.recordings.length>0);
  assert.deepEqual(Array.from(a.result.recordings,row=>row.audioId),Array.from(expected.recordings,row=>row.audioId));
  assert.deepEqual(Array.from(a.result.leads,row=>row.id),Array.from(expected.leads,row=>row.id));
  assert.equal(h.host.querySelectorAll('[data-sd-trigger]').length,0);
  assert(!h.host.querySelector('[data-sd-dimension],[data-sd-collapse],[data-sd-extra]'));
  assert.equal(h.host.querySelectorAll('[data-sdb-trigger]').length,2);
  assert.equal(h.host.querySelector('#storeTrendChart').dataset.recordingTotal,String(a.result.recordings.length));
  h.click('[data-sd-reset]');
  assert.deepEqual(plain(a.model.applied.advisor),[]);
  assert.equal(a.subject.storeId,shop);
  assert.equal(a.result.recordings.length,expected.recordings.length);
  a.state.startDate='2026-04-01';a.state.endDate='2026-04-02';a.render();
  assert.equal(a.result.recordings.length,0);
  assert.equal(a.result.leads.length,0);
  assert.equal(h.host.querySelector('#storeDashboardScopeTitle').textContent,'上海吉鸿');
  assert(!h.host.querySelector('.dashboard-fixed-scope'));
  a.destroy();
});

test('sales has only date and keeps the same advisor when changing source, date and reset',()=>{
  const h=setup('sales','advisor'),a=h.controller,advisor=a.subject.advisor;
  assert(a.result.recordings.length>0);
  assert(a.result.recordings.every(row=>row.advisorKey===advisor.advisorKey && row.source==='工牌'));
  assert(!h.host.querySelector('[data-so-trigger],[data-so-dimension],[data-so-collapse],[data-sales-business-control]'));
  assert.equal(h.host.querySelectorAll('[data-unified-date-trigger]').length,1);
  a.state.startDate='2026-04-01';a.state.endDate='2026-04-02';a.render();
  h.click('[data-unified-reset]');
  assert.equal(a.subject.advisor.advisorKey,advisor.advisorKey);
  assert.equal(a.state.startDate,h.window.AIQCData.defaultRange.startDate);
  assert(a.result.recordings.length>0);
  h.window.location.search='';
  h.click('[data-route="sales-dcc"]');
  const cloud=h.window.__unifiedDashboardController;
  assert.equal(cloud.subject.advisor.advisorKey,advisor.advisorKey);
  assert.equal(cloud.result.recordings.length,0);
  assert.equal(cloud.result.leads.length,0);
  assert.equal(h.host.querySelector('#profile-name').textContent,advisor.advisorName);
  assert(!h.host.querySelector('.dashboard-fixed-scope'));
  h.click('[data-unified-reset]');
  assert.equal(cloud.subject.advisor.advisorKey,advisor.advisorKey);
  assert.equal(cloud.result.recordings.length,0);
  h.click('[data-route="sales-advisor"]');
  const badge=h.window.__unifiedDashboardController;
  assert.equal(badge.subject.advisor.advisorKey,advisor.advisorKey);
  assert(badge.result.recordings.length>0);
  badge.destroy();
});

test('upstream sales identity overrides URL and removed saved conditions cannot hide its data',()=>{
  const identity={storeId:'G216-ZJA0400',advisorId:'DEMO-AION-ZJA0400-01'};
  const h=setup('sales','advisor',{subject:identity,search:'?storeId=missing&advisorId=missing',saved:{'sales-advisor':{startDate:'2026-10-14',endDate:'2026-10-20',scenes:['首触跟进'],models:['unknown'],page:1,pageSize:10,intent:'all',completed:[],organization:{brand:['brand:传祺'],advisor:['other']}}}}),a=h.controller;
  assert.equal(a.subject.advisor.advisorId,identity.advisorId);
  assert.deepEqual(plain(a.state.scenes),[]);assert.deepEqual(plain(a.state.models),[]);
  assert.deepEqual(plain(a.model.applied.brand),[]);
  assert(a.result.recordings.length>0);
  assert(a.result.recordings.every(row=>row.advisorId===identity.advisorId));
  a.destroy();
});

for(const kind of ['store','sales'])test(`${kind}: unknown subject stays empty through reset instead of using all data or another person`,()=>{
  const h=setup(kind,'advisor',{search:'?storeId=missing&advisorId=missing'}),a=h.controller;
  for(const rows of [a.result.recordings,a.result.leads,a.result.visits])assert.equal(rows.length,0);
  assert(!h.host.querySelector('.dashboard-fixed-scope'));
  assert.match(h.host.querySelector(kind==='sales'?'#profile-name':'#storeDashboardScopeTitle').textContent,/未指定有效/);
  h.click(kind==='sales'?'[data-unified-reset]':'[data-sd-reset]');
  assert.equal(a.result.recordings.length,0);assert.equal(a.result.leads.length,0);
  assert.equal(a.model.options('advisor').length,0);
  a.destroy();
});
