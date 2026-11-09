const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
function list(kind,search=''){
 const h=setup('store','',{file:kind==='session'?'session/index.html':'leads/index.html',search:'?route='+kind+search});
 h.run('session-search-utils.js');h.run('shared/field-settings-interactions.js');
 h.run(kind==='session'?'session/session-real-runtime.js':'leads/leads-modern-runtime.js');h.flush();
 h.submitted=[];h.window.ExportTaskUI={submit:async r=>h.submitted.push(r)};
 return h;
}
async function exportRows(h,selector){h.click(selector);await Promise.resolve();await Promise.resolve();assert.equal(h.submitted.length,1);return h.submitted.pop();}
for(const kind of ['session','leads'])test(`${kind}: visible fields and export rows use the same filtered facts and exact ID`,async()=>{
 const h=list(kind),d=h.window.AIQCData,rows=kind==='session'?d.query(d.defaultRange).recordings:d.query(d.defaultRange).leads;
 const request=await exportRows(h,kind==='session'?'[data-sr-export]':'[data-lr-export]');
 assert.equal(request.rows.length,rows.length);
 const headers=[...h.host.querySelectorAll(kind==='session'?'#sessionRealTable th':'.data-table th')].map(n=>n.textContent.trim());
 assert(headers.length>0);for(const c of request.columns)assert(headers.some(label=>label===c.label||label.startsWith(c.label)),c.label);
 const idIndex=request.columns.findIndex(c=>c.label===(kind==='session'?'录音ID':'线索ID'));assert(idIndex>=0);
 assert.deepEqual(new Set(request.rows.map(r=>r[idIndex])),new Set(rows.map(r=>kind==='session'?r.audioId:r.id)));
});
test('focused original lead and recording export retain exact IDs and association warnings',async()=>{
 const base=list('leads'),d=base.window.AIQCData;
 for(const kind of ['leads','session']){
   const r=(kind==='leads'?d.leads:d.recordings).find(r=>!r.linkedDemo&&r.associationMissing);
   const id=kind==='leads'?r.id:r.audioId,h=list(kind,'&'+new URLSearchParams({[kind==='leads'?'focusLeadId':'focusRecordingId']:id}));
   const request=await exportRows(h,kind==='leads'?'[data-lr-export]':'[data-sr-export]');
   assert.equal(request.rows.length,1);assert(request.rows[0].includes(id));assert(request.rows[0].some(v=>String(v).includes('关联缺失')));
 }
});
test('customer aggregation and export never merge masked names or phones',async()=>{
 const h=list('leads','&leadsView=customers'),d=h.window.AIQCData;
 const request=await exportRows(h,'[data-lr-export]');
 assert.equal(request.rows.length,d.customers(d.leads.filter(l=>l.leadDate>=d.defaultRange.startDate&&l.leadDate<=d.defaultRange.endDate)).length);
 assert(request.rows.every(row=>row.some(value=>String(value).includes('客户ID缺失'))));
});
for(const kind of ['session','leads'])test(`${kind}: hiding a field updates table and export together`,async()=>{
 const h=list(kind),ns=kind==='session'?'sr':'lr';h.click(`[data-${ns}-settings]`);
 const checkbox=h.window.document.querySelector(`[data-${ns}-column-visible="brand"]`);assert(checkbox);checkbox.checked=false;
 checkbox.dispatchEvent(new h.window.Event('change',{bubbles:true}));h.click(`[data-${ns}-settings-save]`);
 const request=await exportRows(h,`[data-${ns}-export]`);assert(!request.columns.some(c=>c.label==='品牌'));
 const head=h.host.querySelector(kind==='session'?'#sessionRealTable thead':'.data-table thead');
 assert(![...head.querySelectorAll('th')].some(n=>n.textContent.trim()==='品牌'));
 assert(h.storage.get(kind==='session'?'aiqc-session-real-columns':'aiqc-leads-modern-columns-leads').includes('brand'));
});

for (const view of ['session', 'leads', 'customers']) test(`${view}: statistics time follows applied dates, reset and collapsed filters`, () => {
 const h = list(view === 'session' ? 'session' : 'leads', view === 'customers' ? '&leadsView=customers' : '');
 const ns = view === 'session' ? 'sr' : 'lr';
 const dateTrigger = ns === 'sr' ? '[data-sr-trigger="date"]' : '[data-lr-date-trigger]';
 const displayed = () => h.host.querySelector('.dimension-switcher__statistics-time').textContent;
 const range = h.window.AIQCData.defaultRange;
 const initial = `统计时间：${range.startDate.replace(/-/g, '/')} 至 ${range.endDate.replace(/-/g, '/')}`;
 assert.equal(displayed(), initial);
 const exportButton = h.host.querySelector(`[data-${ns}-export]`);
 assert.equal(h.window.document.getElementById(exportButton.getAttribute('aria-describedby')).textContent, '下载数据条数限制在 3 万条');
 h.click(`[data-${ns}-collapse]`);
 h.click(dateTrigger);
 h.click(`[data-${ns}-date-shortcut="last3"]`);
 assert.equal(displayed(), initial, 'draft dates must not change the displayed effective range');
 h.key('Escape');
 h.flush();
 assert.equal(displayed(), initial);
 h.click(dateTrigger);
 h.click(`[data-${ns}-date-shortcut="last3"]`);
 h.click(`[data-${ns}-date-apply]`);
 h.flush();
 const dates = [...h.host.querySelector(dateTrigger).querySelectorAll('strong')].map(node => node.textContent);
 assert.equal(displayed(), `统计时间：${dates.join(' 至 ')}`);
 assert.notEqual(displayed(), initial);
 h.click(`[data-${ns}-collapse]`);
 h.flush();
 assert.equal(displayed(), `统计时间：${dates.join(' 至 ')}`);
 h.click(`[data-${ns}-dimension="geography"]`);
 h.flush();
 assert.equal(displayed(), `统计时间：${dates.join(' 至 ')}`);
 assert.match(h.host.querySelector('.dimension-switcher__path').textContent, /地理路径/);
 h.click(`[data-${ns}-reset]`);
 h.flush();
 assert.equal(displayed(), initial);
});

test('lead statistics time becomes unlimited when the date field is hidden', () => {
 const h = list('leads');
 h.click('[data-lr-settings]');
 const field = h.window.document.querySelector('[data-lr-column-visible="leadDate"]');
 field.checked = false;
 field.dispatchEvent(new h.window.Event('change', {bubbles: true}));
 h.click('[data-lr-settings-save]');
 h.flush();
 assert.equal(h.host.querySelector('.dimension-switcher__statistics-time').textContent, '统计时间：不限');
});
