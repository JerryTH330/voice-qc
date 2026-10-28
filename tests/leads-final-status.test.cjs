const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/unified-dom.cjs');
function list(options={}){
  const h=setup('store','',{file:'leads/index.html',search:'?route=leads'+(options.search || ''),storage:options.storage});
  if(options.fixture){
    const rows=h.window.AIQCData.leads.filter(row=>row.linkedDemo).slice(0,4).map((row,index)=>({...row,isFinalStatus:[true,false,undefined,'unknown'][index],aiLeadValidity:'有效',leadStatus:'已下定'}));
    h.window.AIQCData={...h.window.AIQCData,leads:rows};
  }
  h.run('shared/field-settings-interactions.js');h.run('leads/leads-modern-runtime.js');h.flush();
  h.submitted=[];h.window.ExportTaskUI={submit:async request=>h.submitted.push(request)};
  return h;
}
const labels=h=>Array.from(h.host.querySelectorAll('#leadsTableHeader th'),node=>node.textContent.trim());
const values=h=>Array.from(h.host.querySelectorAll('#leadsTableBody tr td[data-column-key="isFinalStatus"]'),node=>node.textContent.trim());
const count=h=>Number(h.host.querySelector('#leadsFilterCount').textContent);
const expand=h=>h.click('[data-lr-collapse]');
const choose=(h,value)=>h.click(`[data-lr-option-key="isFinalStatus"][data-lr-option-value="${value}"]`);
async function exported(h){h.click('[data-lr-export]');await Promise.resolve();await Promise.resolve();assert.equal(h.submitted.length,1);return h.submitted.pop();}

test('explicit yes/no flags drive table, filter and export independently of AI validity and business status',async()=>{
  const h=list({fixture:true});
  assert.equal(count(h),4);
  assert.deepEqual(values(h),['是','否','—','—']);
  const header=Array.from(h.host.querySelectorAll('#leadsTableHeader th[data-column-key]'),node=>node.dataset.columnKey),at=header.indexOf('aiLeadValidity');
  assert.equal(header[at+1],'isFinalStatus');assert.equal(header[at+2],'validRecording');
  expand(h);
  const filters=Array.from(h.host.querySelectorAll('[data-lr-extra] [data-lr-control]'),node=>node.dataset.lrControl);
  assert.equal(filters[filters.indexOf('aiLeadValidity')+1],'isFinalStatus');
  h.click('[data-lr-trigger="isFinalStatus"]');
  assert.deepEqual(Array.from(h.host.querySelectorAll('[data-lr-option-key="isFinalStatus"]'),node=>node.dataset.lrOptionValue),['是','否']);
  choose(h,'否');
  assert.equal(count(h),1);assert.deepEqual(values(h),['否']);
  const request=await exported(h),column=request.columns.findIndex(item=>item.label==='是否最终状态');
  assert(column>=0);assert.equal(request.rows.length,1);assert.equal(request.rows[0][column],'否');
  assert(request.filters.some(item=>item.label==='是否最终状态' && item.value==='否'));
  if(h.host.querySelector('[data-lr-trigger="isFinalStatus"]').getAttribute('aria-expanded')!=='true')h.click('[data-lr-trigger="isFinalStatus"]');
  h.click('[data-lr-select-all="isFinalStatus"]');assert.equal(count(h),4);
  choose(h,'是');assert.equal(count(h),1);assert.deepEqual(values(h),['是']);
  h.click('[data-lr-reset]');assert.equal(count(h),4);
});

test('hiding final status clears its active filter and removes it from table and export, with saved visibility retained',async()=>{
  const h=list({fixture:true});expand(h);h.click('[data-lr-trigger="isFinalStatus"]');choose(h,'否');
  h.click('[data-lr-settings]');
  const checkbox=h.window.document.querySelector('[data-lr-column-visible="isFinalStatus"]');assert(checkbox);
  checkbox.checked=false;checkbox.dispatchEvent(new h.window.Event('change',{bubbles:true}));h.click('[data-lr-settings-save]');
  assert.equal(count(h),4);assert(!labels(h).includes('是否最终状态'));
  assert(!h.host.querySelector('[data-lr-trigger="isFinalStatus"]'));
  const request=await exported(h);assert(!request.columns.some(item=>item.label==='是否最终状态'));
  assert(!request.filters.some(item=>item.label==='是否最终状态'));
  const reloaded=list({fixture:true,storage:Object.fromEntries(h.storage)});
  assert(!labels(reloaded).includes('是否最终状态'));
});

test('old lead column order and hidden fields survive migration, while customer settings stay separate',()=>{
  const key='aiqc-leads-modern-columns-leads';
  const saved={order:['store','aiLeadValidity','id','brand','leadDate'],hidden:['brand']};
  const h=list({storage:{[key]:JSON.stringify(saved),[key+'-schema-version']:'20260915-lead-overview-order-v1','aiqc-leads-modern-columns-customers':'unrelated'}});
  const migrated=JSON.parse(h.storage.get(key));
  assert.deepEqual(migrated.order.slice(0,6),['store','aiLeadValidity','isFinalStatus','id','brand','leadDate']);
  assert.deepEqual(migrated.hidden,['brand']);
  assert.equal(h.storage.get('aiqc-leads-modern-columns-customers'),'unrelated');
  migrated.order=migrated.order.filter(key=>key!=='isFinalStatus').concat('isFinalStatus');
  const reloaded=list({storage:{...Object.fromEntries(h.storage),[key]:JSON.stringify(migrated)}});
  assert.deepEqual(JSON.parse(reloaded.storage.get(key)),migrated);
  assert.equal(labels(reloaded).at(-2),'是否最终状态');
});

test('original missing flags remain missing and demo samples explicitly provide both states',async()=>{
  const h=list(),d=h.window.AIQCData;
  assert(d.leads.filter(row=>!row.linkedDemo).every(row=>row.isFinalStatus===undefined));
  assert.deepEqual(new Set(d.leads.filter(row=>row.linkedDemo).map(row=>row.isFinalStatus)),new Set(['是','否']));
  const original=d.leads.find(row=>!row.linkedDemo),focused=list({search:'&focusLeadId='+original.id});
  assert.deepEqual(values(focused),['—']);
  const request=await exported(focused),column=request.columns.findIndex(item=>item.label==='是否最终状态');
  assert.equal(request.rows[0][column],'—');
  expand(focused);focused.click('[data-lr-trigger="isFinalStatus"]');choose(focused,'否');
  assert.equal(count(focused),0);
});

test('customer aggregation has no final-status column, filter or export field',async()=>{
  const h=list({search:'&leadsView=customers'});expand(h);
  assert(!labels(h).includes('是否最终状态'));assert(!h.host.querySelector('[data-lr-trigger="isFinalStatus"]'));
  h.click('[data-lr-settings]');assert(!h.window.document.querySelector('[data-lr-column-visible="isFinalStatus"]'));
  h.click('[data-lr-settings-close]');
  const request=await exported(h);assert(!request.columns.some(item=>item.label==='是否最终状态'));
});
