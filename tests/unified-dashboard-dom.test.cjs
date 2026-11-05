const test=require('node:test');
const assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
for(const kind of ['store','factory','sales'])test(`${kind}: calendar clicks stay open and drafts apply only explicitly`,()=>{
  const h=setup(kind),a=h.controller,initial=[a.state.startDate,a.state.endDate],total=a.result.recordings.length;
  if(kind==='sales'){const person=h.window.AIQCData.advisors.find(p=>p.advisorKey===a.model.applied.advisor[0]);assert.equal(h.host.querySelector('#profile-avatar').textContent,person.advisorName.slice(0,1));assert.equal(h.host.querySelector('[data-mode].active').dataset.mode,a.state.timeMode);}
  h.click('[data-unified-date-trigger]');
  for(const selector of ['[data-unified-date-field="endDate"]','[data-unified-date-nav="-1"]','[data-unified-date-shortcut="1"]']){
    h.click(selector);
    assert(h.host.querySelector('[data-unified-date-apply]'),`${selector} must leave calendar open`);
    assert.deepEqual([a.state.startDate,a.state.endDate],initial);
    assert.equal(a.result.recordings.length,total);
  }
  h.click('[data-unified-date-cancel]');h.click('[data-unified-date-trigger]');
  assert.equal(h.host.querySelector('[data-unified-date-field="startDate"] strong').textContent,initial[0]);
  h.click('[data-unified-date-shortcut="1"]');h.key('Escape');h.click('[data-unified-date-trigger]');
  assert.equal(h.host.querySelector('[data-unified-date-field="startDate"] strong').textContent,initial[0]);
  h.click('[data-unified-date-shortcut="1"]');h.click('[data-unified-date-apply]');
  assert.equal(a.state.startDate,'2026-10-19');assert.equal(a.state.endDate,'2026-10-19');
  assert(a.result.recordings.every(r=>r.startTime.startsWith('2026-10-19')));
  h.click('[data-unified-date-trigger]');h.click('[data-unified-date-shortcut="30"]');
  h.window.document.body.dispatchEvent(new h.window.Event('click',{bubbles:true}));
  assert(!h.host.querySelector('[data-unified-date-apply]'));assert.equal(a.state.startDate,'2026-10-19');
  a.destroy();
});
test('migrates old geographic selections to a fixed store and clears removed advisor conditions',()=>{
  const first=setup('store'),a=first.controller,p=first.window.AIQCData.advisors[0];
  a.model.setDimension('geography');a.model.set('province',[p.provinceId]);a.model.set('city',[p.cityId]);a.model.set('store',[p.storeId]);a.model.set('advisor',[p.advisorKey]);a.model.apply();
  const organization=plain(a.model.applied);a.destroy();
  const h=setup('store','',{saved:{store:{...plain(a.state),organization}}});
  assert.deepEqual(plain(h.controller.model.applied.advisor),[]);
  assert.equal(h.controller.model.applied.dimensionMode,'organization');
  for(const key of ['brand','region','zone','province','city','store','patroler','governor'])assert.deepEqual(plain(h.controller.model.applied[key]),[]);
  assert(h.controller.result.recordings.length>0);
  assert(h.controller.result.recordings.every(r=>r.storeId===h.controller.subject.storeId));
  h.controller.destroy();
});
test('malformed completion storage never crashes or overwrites saved data',()=>{
  for(const value of ['{}','null','42','"bad"','[null,123,"lead"]']){
    const h=setup('store','',{storage:{'store-handled-leads':value}});
    assert(Array.isArray(h.controller.state.completed));assert(h.controller.state.completed.every(v=>typeof v==='string'));
    assert.equal(h.storage.get('store-handled-leads'),value);h.controller.destroy();
  }
});
test('factory retains organization and geography ranking hierarchy with conserved child totals',()=>{
  const h=setup('factory'),a=h.controller;
  assert.equal(h.host.querySelector('#rank-title').textContent,'SOP执行排行');
  const tree=h.window.AIQCData.ranking(a.result.recordings,'organization');
  const check=rows=>{for(const r of rows)if(r.children.length){assert.equal(r.recordingCount,r.children.reduce((n,c)=>n+c.recordingCount,0));assert.equal(r.qualifiedCount,r.children.reduce((n,c)=>n+c.qualifiedCount,0));check(r.children);}};
  check(tree);assert.equal(tree.reduce((n,r)=>n+r.recordingCount,0),a.result.recordings.length);
  h.click('[data-unified-rank-toggle]');assert(h.host.querySelector('.rank-expand-panel.is-open'));
  h.click('#rank-expand-toggle');assert.equal(h.host.querySelector('#rank-expand-toggle').textContent,'一键收起');
  h.click('#rank-expand-toggle');assert(!h.host.querySelector('.rank-expand-panel.is-open'));
  a.model.setDimension('geography');a.model.apply();a.render();assert.match(h.host.querySelector('#rank-sub').textContent,/省份.*城市.*门店/);
  check(h.window.AIQCData.ranking(a.result.recordings,'geography'));
  const r=a.result.recordings[0];a.model.set('city',[r.cityId]);a.model.apply();a.render();
  assert(h.host.querySelector('[data-unified-rank-toggle]'));assert.match(h.host.querySelector('#rank-sub').textContent,/城市.*门店/);
  assert([...h.host.querySelectorAll('#rank-table-wrap > table > tbody > .rank-row .factory-rank-name')].every(node=>node.textContent===r.city));
  a.destroy();
});
test('factory starts at brands or the deepest selected level and retains empty organizations', () => {
  const h = setup('factory'), a = h.controller;
  const rootRows = () => [...h.host.querySelectorAll('#rank-table-wrap > table > tbody > .rank-row')];
  assert.deepEqual(rootRows().map(row => row.querySelector('.factory-rank-name').textContent).sort(), ['传祺', '埃安'].sort());
  assert.equal(h.host.querySelectorAll('.rank-expand-panel').length, 0);
  const record = a.result.recordings[0];
  for (const mode of ['organization', 'geography']) {
    a.model.reset();
    a.model.setDimension(mode);
    for (const key of a.model.dimensionKeys()) {
      a.model.set(key, [record[key + 'Id']]);
      a.model.apply();
      a.render();
      assert.equal(rootRows().length, 1, key);
      assert.equal(rootRows()[0].querySelector('.factory-rank-name').textContent, record[key]);
      assert.equal(rootRows()[0].hasAttribute('data-unified-rank-toggle'), key !== 'store');
      assert.equal(h.host.querySelectorAll('.rank-expand-panel').length, 0);
    }
  }
  a.model.reset();
  const regions = a.model.options('region').slice(0, 2);
  a.model.set('region', regions.map(option => option.value));
  a.model.apply();
  a.render();
  assert.deepEqual(rootRows().map(row => row.querySelector('.factory-rank-name').textContent).sort(), Array.from(regions, option => option.label).sort());
  const recordedStores = new Set(a.result.recordings.map(row => row.storeId));
  const emptyStore = a.model.directory.find(row => !recordedStores.has(row.storeId) && a.model.matches(row));
  assert(emptyStore);
  a.model.set('store', [emptyStore.storeId]);
  a.model.apply();
  a.render();
  assert.equal(rootRows().length, 1);
  assert.equal(rootRows()[0].querySelector('.factory-rank-name').textContent, emptyStore.store);
  assert.deepEqual([...rootRows()[0].querySelectorAll('td')].slice(2).map(node => node.textContent), ['0', '0', '0', '—', '—']);
  assert(h.host.querySelector('#rank-expand-toggle').hidden);
  a.destroy();
});
test('collapsing a factory parent clears expanded descendants and all-open still reaches stores', () => {
  const h = setup('factory'), a = h.controller;
  const root = h.host.querySelector('#rank-table-wrap > table > tbody > .rank-row');
  const rootSelector = `[data-unified-rank-id="${root.dataset.unifiedRankId}"]`;
  h.click(rootSelector + ' button');
  const region = h.host.querySelector('.rank-expand-panel .rank-row');
  const regionSelector = `[data-unified-rank-id="${region.dataset.unifiedRankId}"]`;
  h.click(regionSelector + ' button');
  const zone = h.host.querySelector('.rank-expand-panel .rank-expand-panel .rank-row');
  h.click(`[data-unified-rank-id="${zone.dataset.unifiedRankId}"] button`);
  assert.equal(a.state.rankExpanded.length, 3);
  h.click(rootSelector + ' button');
  assert.deepEqual(plain(a.state.rankExpanded), []);
  h.click(rootSelector + ' button');
  assert.equal(h.host.querySelectorAll('.rank-expand-panel').length, 1);
  assert.equal(h.host.querySelector(regionSelector).getAttribute('aria-expanded'), 'false');
  h.click('#rank-expand-toggle');
  const stores = [...h.host.querySelectorAll('#rank-table-wrap .rank-row')].filter(row => !row.hasAttribute('data-unified-rank-toggle'));
  assert.equal(stores.length, a.model.directory.length);
  h.click('#rank-expand-toggle');
  assert.deepEqual(plain(a.state.rankExpanded), []);
  assert.equal(h.host.querySelectorAll('#rank-table-wrap .rank-row').length, 2);
  a.destroy();
});
test('applying factory dates resets expansion while date drafts and sorting preserve it', () => {
  const h = setup('factory'), a = h.controller;
  h.click('[data-unified-rank-toggle]');
  const expanded = plain(a.state.rankExpanded);
  h.click('[data-unified-factory-sort="invitation"]');
  assert.deepEqual(plain(a.state.rankExpanded), expanded);
  h.click('[data-unified-date-trigger]');
  h.click('[data-unified-date-shortcut="1"]');
  assert.deepEqual(plain(a.state.rankExpanded), expanded);
  h.click('[data-unified-date-apply]');
  assert.deepEqual(plain(a.state.rankExpanded), []);
  a.destroy();
});
test('calendar boundaries, reversed dates and month end navigation remain valid',()=>{
  const h=setup('store','',{saved:{store:{startDate:'2026-05-31',endDate:'2026-06-01',scenes:[],models:[],intent:'all',page:1,pageSize:10,completed:[]}}}),a=h.controller;
  h.click('[data-unified-date-trigger]');h.click('[data-unified-date-nav="-1"]');
  assert.match(h.host.querySelector('.session-date-nav strong').textContent,/2026年4月/);
  assert(h.host.querySelector('[data-unified-date-nav="-1"]').disabled);
  assert(!h.host.querySelector('[data-unified-date-value="2026-04-19"]'));
  h.click('[data-unified-date-value="2026-04-20"]');h.click('[data-unified-date-value="2026-04-20"]');h.click('[data-unified-date-apply]');
  assert.equal(a.state.startDate,'2026-04-20');assert.equal(a.state.endDate,'2026-04-20');
  h.click('[data-unified-date-trigger]');h.click('[data-unified-date-shortcut="7"]');
  assert(h.host.querySelector('[data-unified-date-nav="1"]').disabled);assert(!h.host.querySelector('[data-unified-date-value="2026-10-21"]'));
  h.click('[data-unified-date-value="2026-10-20"]');h.click('[data-unified-date-value="2026-10-18"]');h.click('[data-unified-date-apply]');
  assert.equal(a.state.startDate,'2026-10-18');assert.equal(a.state.endDate,'2026-10-18');a.destroy();
});
test('customer card expansion and completion survive rerender, and destroy removes handlers',()=>{
  const h=setup('sales','advisor'),a=h.controller,l=a.result.leads[0];
  const toggle=`[data-unified-lead="${l.id}"] [data-unified-expand]`;
  h.click(toggle);assert.equal(h.host.querySelector(toggle).getAttribute('aria-expanded'),'true');
  h.click(`[data-unified-complete="${l.id}"]`);assert(a.state.completed.includes(l.id));
  assert.equal(h.host.querySelector(toggle).getAttribute('aria-expanded'),'true');
  h.click(`[data-unified-complete="${l.id}"]`);assert(!a.state.completed.includes(l.id));
  a.model.set('advisor',[]);a.model.apply();a.render();
  a.destroy();const count=a.state.page;h.click('[data-unified-date-trigger]');assert.equal(a.state.page,count);assert(!h.host.querySelector('[data-unified-date-apply]'));
});
test('routing away from a dashboard destroys its controller before rendering detail',()=>{
 const h=setup('store'),a=h.controller,l=a.result.leads[0];
 const fs=require('node:fs'),path=require('node:path');
 const template=h.window.document.createElement('template');template.id='tpl-customer-detail';
 template.innerHTML=fs.readFileSync(path.join(__dirname,'../leads/index.html'),'utf8').match(/<template id="tpl-customer-detail">([\s\S]*?)<\/template>/)[1];
 h.window.document.body.appendChild(template);
 let destroyed=0;const destroy=a.destroy;a.destroy=()=>{destroyed++;destroy();};
 h.window.__openLeadCustomerDetail({...l,aggregateLeadRecords:[l]});
 assert.equal(destroyed,1);assert(h.host.querySelector('.customer-detail-page'));
});
