const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
const labels=(root,selector)=>[...root.querySelectorAll(selector)].map(n=>n.textContent.trim());
test('factory retains original metric layout, six slots, help and comparison markup',()=>{
 const h=setup('factory'),root=h.host,hero=root.querySelector('#hero-kpi-grid');
 assert(hero.classList.contains('factory-hero-metrics-layout'));
 assert.deepEqual(labels(root,'.hm-layout-bottom .hm-label'),['平均时长','话术执行率','质检合格数','质检合格率','风险录音数','风险录音率']);
 assert.equal(root.querySelectorAll('.hm-layout-bottom .metric-def-btn').length,6);
 assert.equal(root.querySelectorAll('.hm-layout-bottom .hm-value small').length,6);
 assert(root.querySelector('#sop-ai-summary .hint-text'));assert(root.querySelector('#sop-national-diff .sop-improve-value'));
 assert.equal(root.querySelectorAll('#chart-legend .legend-dot').length,3);
 h.click('[data-unified-rank-toggle]');assert(root.querySelector('.factory-rank-name-child'));assert(root.querySelector('.factory-rank-name-store'));
 h.controller.destroy();
});
for(const role of ['dcc','advisor'])test(`sales ${role} retains its own KPI, summary, date, chart and pagination components`,()=>{
 const h=setup('sales',role),root=h.host,hero=root.querySelector('#hero-metrics'),a=h.controller;
 const expected=role==='dcc'?['邀约录音数','话术命中率','平均时长','风险录音']:['接待数','试驾数','接待录音数','试驾录音数','话术命中率','平均时长','风险录音'];
 assert.deepEqual(labels(hero,'.hm-label'),expected);
 assert.equal(hero.querySelectorAll('.hm-body').length,expected.length);assert.equal(hero.querySelectorAll('.hm-metric-icon').length,expected.length);
 assert.equal(hero.querySelectorAll('.hm-help').length,expected.length);
 assert.equal(hero.querySelectorAll('.hm-item-summary').length,role==='advisor'?2:0);
 assert.equal(root.querySelectorAll('#execution-focus-metrics .execution-metric').length,4);
 assert(root.querySelector('.sales-statistics-date-control .sales-role-date-root .sales-role-date-trigger'));
 assert.equal(root.querySelectorAll('#trend-legend .legend-dot').length,3);
 if(a.result.leads.length){assert(root.querySelector('#salesTodoPagination [data-unified-page-size]'));assert(root.querySelector('[data-unified-page-jump]'));h.click('[data-unified-expand]');assert(root.querySelector('.todo-guidance-label-reason'));assert(root.querySelector('.role-tag-row'));assert(root.querySelector('.review-score-progress').getAttribute('d'));}
 else assert(root.querySelector('#todo-list .todo-empty-illustration'));
 a.destroy();
});
test('missing analysis keeps the rule toolbar, table headers and history metric slots',()=>{
 const h=setup('sales','advisor'),root=h.host;
 assert(root.querySelector('#sales-sop-review-toolbar .issue-rule-search-input').disabled);
 assert.equal(root.querySelectorAll('#sales-sop-review-list .issue-rule-list-head span').length,4);
 assert(root.querySelector('#sales-sop-review-list .issue-rule-empty'));
 assert(root.querySelector('#review-insight-list.sales-review-top-five-list .sales-review-top-five-empty'));
 assert.equal(root.querySelectorAll('#chain-pipeline .pipeline-card').length,4);
 assert.deepEqual(labels(root,'#chain-pipeline .pipeline-value'),['—','—','—','—']);
 assert.deepEqual(labels(root,'#all-leads-thead th'),['客户','阶段','邀约','接待','跟进','同步状态','最近说明']);
 h.controller.destroy();
});
test('restored sales pagination changes page size and closes with Escape or an outside click',()=>{
 const h=setup('sales','advisor'),root=h.host,a=h.controller;
 h.click('[data-unified-page-size-trigger]');assert(root.querySelector('.page-size-options.open'));
 assert.equal(root.querySelector('[data-unified-page-size-trigger]').getAttribute('aria-expanded'),'true');
 h.key('Escape');assert(!root.querySelector('.page-size-options.open'));
 h.click('[data-unified-page-size-trigger]');h.click('#profile-name');assert(!root.querySelector('.page-size-options.open'));
 h.click('[data-unified-page-size-trigger]');h.click('[data-unified-page-size="3"]');
 assert.equal(a.state.pageSize,3);assert.equal(root.querySelectorAll('#todo-list [data-unified-lead]').length,3);
 h.click('[data-unified-page="2"]');assert.equal(a.state.page,2);
 a.destroy();
});
test('sales comparison uses the same store and preserves absent scores as gaps',()=>{
 const h=setup('sales','advisor'),a=h.controller,d=h.window.AIQCData;
 const selected=d.advisors.find(p=>p.advisorKey===a.model.applied.advisor[0]);
 const expected=d.query({startDate:a.state.startDate,endDate:a.state.endDate,source:'工牌',predicate:r=>r.storeId===selected.storeId});
 assert.deepEqual(Array.from(a.chartConfig.datasets[1].data),Array.from(expected.trend,r=>r.qualifiedRate));
 a.state.startDate='2026-04-01';a.state.endDate='2026-04-07';a.render();
 assert(a.chartConfig.datasets[0].data.every(v=>v===null));assert(a.chartConfig.datasets[1].data.every(v=>v===null));
 a.destroy();
});
test('original sales canvas draws score gaps without zero points and fills separate segments',()=>{
 const h=setup('sales','advisor'),calls=[],canvas=h.host.querySelector('#trendChart');
 const context=new Proxy({},{get:(t,key)=>key==='measureText'?()=>({width:20}):(...args)=>calls.push([key,...args]),set:(t,k,v)=>{t[k]=v;return true;}});
 canvas.getContext=()=>context;
 const values=[80,90,null,70,60];
 h.window.AIQCDashboardPresentation.drawTrendChart(canvas,{labels:['a','b','c','d','e'],leftAxis:{min:0,max:100,ticks:[]},rightAxis:{min:0,max:100,ticks:[]},datasets:[{data:values,axis:'right',color:'blue',fillColor:'blue',solidPoint:true}]},1);
 assert.equal(calls.filter(c=>c[0]==='arc').length,4);
 assert.equal(calls.filter(c=>c[0]==='fill').length,6); // Two separate area fills and four points.
 assert(calls.filter(c=>c[0]==='arc').every(c=>Number.isFinite(c[1])&&Number.isFinite(c[2])));
 h.controller.destroy();
});
test('same-page change from the jump input does not replace a focused pagination subtree',()=>{
 const h=setup('sales','advisor'),a=h.controller,input=h.host.querySelector('[data-unified-page-jump]');
 input.value=String(a.state.page);input.dispatchEvent(new h.window.Event('change',{bubbles:true}));
 assert(h.host.querySelector('[data-unified-page-jump]')===input);
 input.value='3';input.dispatchEvent(new h.window.Event('change',{bubbles:true}));assert.equal(a.state.page,3);
 const next=h.host.querySelector('[data-unified-page-jump]');next.dispatchEvent(new h.window.Event('change',{bubbles:true}));
 assert(h.host.querySelector('[data-unified-page-jump]')===next);
 a.destroy();
});
