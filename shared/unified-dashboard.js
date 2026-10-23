/* Dashboard views over the same facts consumed by the six source pages. */
(function (global) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = (value, suffix = '') => value === null || value === undefined ? '—' : `${Number(value).toLocaleString('zh-CN',{maximumFractionDigits:1})}${suffix}`;
  const sceneKeys = { first_follow:'首触跟进', invite_store:'邀约到店', schedule_confirm:'排程确认', store_reception:'销售接待', test_drive:'试乘试驾' };
  const dateValue = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const detailUrl = (kind,id) => `../${kind === 'lead' ? 'leads' : 'session'}/index.html?${new URLSearchParams(kind === 'lead' ? {route:'leads-detail',leadSource:'leads',leadId:id} : {route:'session-detail',sessionId:id})}`;
  const listUrl = (kind,id) => `../${kind === 'lead' ? 'leads' : 'session'}/index.html?${new URLSearchParams(kind === 'lead' ? {route:'leads',focusLeadId:id} : {route:'session',focusRecordingId:id})}`;
  const metricIcons = {'平均时长':'metric-duration','平均话术命中率':'metric-hit-rate','质检合格数':'metric-pass-count','质检合格率':'metric-pass-rate','风险录音':'metric-risk-count'};
  function metricMarkup(label,value,unit='') {
    const icon=metricIcons[label];
    return `<div class="hm-item single-metric"><div class="hm-label-row">${icon?`<img class="hm-label-icon hm-label-icon-image" src="../assets/store-core-metrics/${icon}.png" alt="">`:'<span class="hm-label-icon tone-blue" aria-hidden="true"><span class="hm-label-icon-core"></span><span class="hm-label-icon-dot"></span></span>'}<div class="hm-label">${escape(label)}</div></div><div class="hm-val-row"><span class="hm-value">${number(value)}</span><span class="hm-unit">${escape(unit)}</span></div></div>`;
  }
  const metricDescriptions = {
    '平均时长':'当前筛选录音的平均时长，单位为分钟。',
    '话术执行率':'已完成且有评分录音的平均话术命中率。',
    '话术命中率':'已完成且有评分录音的平均话术命中率。',
    '质检合格数':'已完成且话术命中率达到60%的录音数。',
    '质检合格率':'合格录音数 ÷ 已完成且有评分的录音数；无评分时显示—。',
    '风险录音数':'含风险分析结果的录音数；当前未提供逐录音风险结果。',
    '风险录音率':'风险录音占分析录音的比例；当前未提供逐录音风险结果。',
    '风险录音':'当前未提供逐录音风险结果，显示—。',
    '云外呼录音数':'当前筛选范围中的云外呼录音条数。',
    '门店工牌录音数':'当前筛选范围中的工牌录音条数。',
    '邀约录音数':'当前顾问、日期与业务场景内的云外呼录音条数。',
    '接待录音数':'当前顾问、日期内销售接待场景的录音条数。',
    '试驾录音数':'当前顾问、日期内试乘试驾场景的录音条数。',
    '接待数':'当前筛选范围中的销售接待到访记录数。',
    '试驾数':'当前筛选范围中的试乘试驾到访记录数。'
  };
  function metricHelp(label) {
    return `<button type="button" class="metric-def-btn" aria-label="${escape(label)}指标说明" title="${escape(metricDescriptions[label] || label)}">?<span class="metric-def-tooltip" role="tooltip">${escape(metricDescriptions[label] || label)}</span></button>`;
  }
  function factoryMetricMarkup(label,value,unit) {
    const icons={'平均时长':'metric-duration','话术执行率':'metric-hit-rate','质检合格数':'metric-pass-count','质检合格率':'metric-pass-rate','风险录音数':'metric-risk-count','风险录音率':'metric-risk-rate'};
    return `<div class="hm-item single-metric">${metricHelp(label)}<div class="hm-label-row"><img class="hm-label-icon hm-label-icon-image" src="../assets/store-core-metrics/${icons[label]}.png" alt="" aria-hidden="true"><div class="hm-label">${label}</div></div><div class="hm-val-row"><span class="hm-value">${number(value)}<small>${unit}</small></span></div></div>`;
  }
  function sourceMarkup(label,source,scenes,recordings) {
    const rows=recordings.filter(r=>r.source===source);
    return `<section class="store-recording-summary-group tone-${source==='云外呼'?'blue':'green'}" aria-label="${label}"><div class="store-recording-summary-total"><span class="store-recording-summary-ribbon" aria-label="录音总计"><span class="store-recording-summary-level" aria-hidden="true">录音总计</span><img class="store-recording-summary-ribbon-mask" src="../assets/store-core-metrics/recording-ribbon-mask.svg" alt=""></span><div class="hm-label-row"><span class="hm-label-icon tone-blue" aria-hidden="true"><span class="hm-label-icon-core"></span></span><div class="hm-label">${label}</div></div>${metricHelp(label)}<div class="hm-val-row"><span class="hm-value">${rows.length}<small>条</small></span></div></div><div class="store-recording-summary-breakdown"><div class="store-recording-summary-scenes" style="--recording-scene-count:${scenes.length}">${scenes.map(scene=>`<div class="store-recording-summary-scene"><span class="store-recording-summary-scene-label">${escape(scene)}</span><strong class="store-recording-summary-scene-value">${rows.filter(r=>r.scenario===scene).length}<small>条</small></strong></div>`).join('')}</div></div></section>`;
  }
  // Explicit demo identities are used only when no upstream subject is supplied.
  const previewSubject = {storeId:'G216-ZJA0400',advisorId:'DEMO-AION-ZJA0400-01'};
  function resolveSubject(kind,data,context) {
    if(kind==='factory')return null;
    const params=new URLSearchParams(global.location.search);
    const subjects=global.__unifiedDashboardSubjects ||= {};
    const fromUrl=params.has('storeId') || params.has('advisorId');
    const supplied=context ?? global.__AI_QC_DASHBOARD_CONTEXT ?? (fromUrl?{storeId:params.get('storeId'),advisorId:params.get('advisorId')}:null);
    const identity=supplied ?? subjects[kind] ?? previewSubject;
    const matches=data.advisors.filter(person=>person.advisorId===identity.advisorId && (!identity.storeId || person.storeId===identity.storeId));
    const advisor=kind==='sales' && matches.length===1?matches[0]:null;
    const storeId=kind==='sales'?advisor?.storeId:identity.storeId;
    const store=data.directory.find(dealer=>(dealer.dealerWid || `brand:${dealer.brand}|store:${dealer.dealerCode}`)===storeId);
    const resolved={storeId:storeId || identity.storeId || '',advisorId:advisor?.advisorId || identity.advisorId || ''};
    subjects[kind]=resolved;
    const url=new URL(global.location.href);
    url.searchParams.set('storeId',resolved.storeId);
    if(kind==='sales')url.searchParams.set('advisorId',resolved.advisorId);
    global.history.replaceState(null,'',`${url.pathname}${url.search}${url.hash}`);
    return {storeId,store,advisor,key:kind==='sales'?`${resolved.storeId}::${resolved.advisorId}`:resolved.storeId};
  }
  function mount({kind,root,role = '',subject:context}) {
    global.__unifiedDashboardController?.destroy();
    const data = global.AIQCData, document = root.ownerDocument, presentation = global.AIQCDashboardPresentation;
    const dateUtils = global.__dateFilterComponentUtils || globalThis.__dateFilterComponentUtils;
    const sales = kind === 'sales', source = sales ? role === 'dcc' ? '云外呼' : '工牌' : 'all';
    const allowedScenes = source === '云外呼' ? data.sceneNames.slice(0,3) : source === '工牌' ? data.sceneNames.slice(3) : data.sceneNames;
    const subject=resolveSubject(kind,data,context);
    const people = kind==='factory'?data.advisors:data.advisors.filter(person=>sales?person.advisorKey===subject.advisor?.advisorKey:person.storeId===subject.storeId);
    const directory=subject?data.directory.filter(dealer=>dealer===subject.store):data.directory;
    const model = global.VisitOrganizationFilter.createModel(directory,people,{mode:'matching'});
    const saved = global.__unifiedDashboardStates ||= {};
    const stateKey = sales ? `sales-${role}` : kind;
    if(subject && saved[stateKey]?.subjectKey && saved[stateKey].subjectKey!==subject.key)delete saved[stateKey];
    const state = saved[stateKey] ||= { ...data.defaultRange,scenes:[],models:[],intent:'all',sort:'recordingCount',descending:true,page:1,pageSize:10,timeMode:'followup',completed:[] };
    if(subject)state.subjectKey=subject.key;
    if(sales){state.scenes=[];state.models=[];}
    else if(subject?.store){const values=new Set(data.modelOptions([subject.store.brand]).map(option=>option.value));state.models=state.models.filter(value=>values.has(value));}
    const completionKey=sales?(role==='dcc'?'dcc-completed-leads':'advisor-completed-leads'):'store-handled-leads';
    try {const stored=global.localStorage?.getItem(completionKey);if(stored){const parsed=JSON.parse(stored);state.completed=Array.isArray(parsed)?parsed.filter(id=>typeof id==='string'):[];}} catch {}
    let ready=false,destroyed=false,ui,business,sourceTabs,chartInstance,stopSticky,dateOpen=false,draft={},activeField='startDate',viewDate;
    const node = id => root.querySelector(`#${id}`);
    const html = (id,value) => { const n=node(id);if(n)n.innerHTML=value; };
    const text = (id,value) => { const n=node(id);if(n)n.textContent=value; };
    const empty = message => `<div class="store-dashboard-empty empty-state-card">${escape(message)}</div>`;
    if(kind==='factory' && state.organization) { model.setDimension(state.organization.dimensionMode || 'organization'); for(const key of Object.keys(model.draft)) if(key !== 'dimensionMode') model.set(key,state.organization[key] || []); model.apply(); }
    else {
      const validAdvisors=new Set(people.map(person=>person.advisorKey));
      model.set('advisor',sales?people.map(person=>person.advisorKey):(state.organization?.advisor || []).filter(id=>validAdvisors.has(id)));model.apply();
      state.organization=JSON.parse(JSON.stringify(model.applied));
    }
    let filterRoot,businessRoot,dateHost;
    if(kind==='factory') {
      filterRoot=node('factoryOrgControlSlot');
      businessRoot=document.createElement('div');businessRoot.id='storeDashboardBusinessFilters';
      businessRoot.innerHTML='<div data-store-business-control="scene"></div><div data-store-business-control="model"></div><div class="fo-control badge-field-filter fo-date-control" id="unifiedStatisticsDate"></div>';
    } else if(sales) {
      filterRoot=root.querySelector('[data-sales-organization-filters]');businessRoot=root.querySelector('.sales-role-nav-filters');
      node('salesReviewSceneControl').remove();
      dateHost=node('salesRecommendDateControl');
    } else {filterRoot=node('storeDashboardOrganizationFilters');businessRoot=node('storeDashboardBusinessFilters');}
    function closeDate() { if(!dateOpen)return; dateOpen=false;renderDate(); }
    function closeMenus() {business?.closeMenu();closeDate();}
    function reset() {Object.assign(state,{...data.defaultRange,scenes:[],models:[],intent:'all',page:1,rankPage:1});if(sales){model.reset();model.set('advisor',people.map(person=>person.advisorKey));model.apply();}business?.render();closeDate();}
    function change() {
      state.organization=JSON.parse(JSON.stringify(model.applied));
      const brands=subject?.store?[subject.store.brand]:model.applied.brand.map(id=>id.replace(/^brand:/,''));
      const candidates=new Set(data.modelOptions(brands).map(o=>o.value));state.models=state.models.filter(v=>candidates.has(v));
      state.page=1;state.rankPage=1;state.rankExpanded=[];business?.render();if(ready)render();
    }
    if(sales){
      filterRoot.innerHTML='<div class="dashboard-fixed-filter-row"><div class="badge-dynamic-filter-grid"></div><div class="badge-dynamic-filter-actions"><button type="button" class="btn session-reset-btn" data-unified-reset>重置</button></div></div>';
      filterRoot.querySelector('.badge-dynamic-filter-grid').appendChild(businessRoot);
    } else ui = global.StoreDashboardOrganizationFilter.mount({
      root:filterRoot,model,businessFilters:businessRoot,fixedSubject:kind==='store',onBeforeChange:closeMenus,onReset:reset,onChange:change
    });
    dateHost ||= kind==='factory' ? node('unifiedStatisticsDate') : node('store-date-control');
    if(!sales)business=global.StoreDashboardBusinessFilters.mount({root:businessRoot,
      sceneOptions:allowedScenes.map(label=>({value:label,label})),
      modelOptions:()=>data.modelOptions(subject?.store?[subject.store.brand]:model.applied.brand.map(id=>id.replace(/^brand:/,''))),
      getSelection:key=>state[key==='scene'?'scenes':'models'],onBeforeOpen:()=>{ui?.closeMenu();closeDate();},
      onChange:(key,values)=>{state[key==='scene'?'scenes':'models']=values;state.page=1;render();}
    });
    if(sales)sourceTabs=global.SalesSourceTabs.mount(root.querySelector('.role-page-switch'));
    function range(days) {
      const end=new Date(),start=new Date(end);if(days===1){start.setDate(start.getDate()-1);end.setDate(end.getDate()-1);}else start.setDate(start.getDate()-days+1);
      return {startDate:dateValue(start),endDate:dateValue(end)};
    }
    function renderDate() {
      const today=dateValue(new Date()),minimum=new Date();minimum.setMonth(minimum.getMonth()-6);const min=dateValue(minimum);
      const cells=[];
      if(dateOpen) {
        const year=viewDate.getFullYear(),month=viewDate.getMonth(),first=new Date(year,month,1),offset=(first.getDay()+6)%7;
        for(let i=0;i<offset;i++)cells.push(null);
        for(let day=1;day<=new Date(year,month+1,0).getDate();day++) {const value=dateValue(new Date(year,month,day));cells.push({value,day,isDisabled:value<min||value>today,inRange:value>=draft.startDate&&value<=draft.endDate,isStart:value===draft.startDate,isEnd:value===draft.endDate,isToday:value===today});}
      }
      const menu=dateOpen?dateUtils.renderDateRangePanelMarkup({dataNamespace:'unified-date',title:'统计日期范围',rangeText:`${draft.startDate} 至 ${draft.endDate}`,panelClassName:`session-menu-panel session-menu-panel-date ${sales?'sales-statistics-date-panel':kind==='factory'?'fo-date-panel':'sd-statistics-date-panel'}`,monthLabel:`${viewDate.getFullYear()}年${viewDate.getMonth()+1}月`,activeField,startLabel:draft.startDate,endLabel:draft.endDate,cells,
        disablePrevMonth:dateValue(new Date(viewDate.getFullYear(),viewDate.getMonth(),1)).slice(0,7)<=min.slice(0,7),disableNextMonth:dateValue(viewDate).slice(0,7)>=today.slice(0,7),
        shortcuts:[{key:'1',label:'昨日'},{key:'7',label:'近7天'},{key:'15',label:'近半月'},{key:'30',label:'近1月'}]}):'';
      const control='<span>统计日期</span>'+dateUtils.renderDateRangeControlMarkup({currentValue:'custom',isOpen:dateOpen,startLabel:state.startDate,endLabel:state.endDate,dataNamespace:'unified-date',rootClassName:sales?'sales-role-date-root':kind==='factory'?'fo-date-root':'sd-statistics-date-root',triggerClassName:`session-date-trigger${sales?' sales-role-date-trigger':''}`,menuHtml:menu});
      dateHost.innerHTML=sales?`<div class="so-filter-control badge-field-filter sales-statistics-date-control">${control}</div>`:control;
    }
    function currentScope() {return {startDate:state.startDate,endDate:state.endDate,scenes:sales?[]:state.scenes,models:sales?[]:state.models,source,predicate:r=>(!subject || (sales?!!subject.advisor && r.advisorKey===subject.advisor.advisorKey:!!subject.store && r.storeId===subject.storeId)) && model.matches(r)};}
    function renderChart(result) {
      const canvas=node(sales?'trendChart':kind==='factory'?'factory-trendChart':'storeTrendChart');if(!canvas)return;
      const scope=currentScope(),selected=people.find(person=>person.advisorKey===model.applied.advisor[0]);
      const compare=data.query({...scope,predicate:sales?r=>!!selected&&r.storeId===selected.storeId&&model.matches({...r,advisorKey:selected.advisorKey}):undefined});
      const rows=result.trend,comparison=new Map(compare.trend.map(row=>[row.date,row.qualifiedRate]));
      const own=rows.map(row=>row.qualifiedRate),average=rows.map(row=>comparison.get(row.date) ?? null),volume=rows.map(row=>row.recordingCount);
      const labels=rows.map(row=>row.date.slice(5)),max=Math.max(1,...volume),step=Math.max(1,Math.ceil(max/5));
      const minimum=[...own,...average].filter(value=>value!==null).some(value=>value<50)?0:50;
      canvas.setAttribute('aria-label',`${state.startDate}至${state.endDate}，录音${result.metrics.recordingCount}条；合格率${number(result.metrics.qualifiedRate,'%')}`);
      canvas.dataset.recordingTotal=String(result.metrics.recordingCount);
      if(kind==='factory'&&global.Chart){
        chartInstance?.destroy();
        chartInstance=new global.Chart(canvas,{type:'line',data:{labels,datasets:[
          {label:'质检合格率',data:own,borderColor:'#3B82F6',backgroundColor:'rgba(59,130,246,0.08)',fill:true,tension:.4,borderWidth:2.5,pointRadius:3,pointHoverRadius:5,pointBackgroundColor:'#3B82F6',yAxisID:'y'},
          {label:'全国质检合格率',data:average,borderColor:'#F59E0B',backgroundColor:'transparent',borderDash:[6,4],borderWidth:1.5,pointRadius:0,pointHoverRadius:3,fill:false,yAxisID:'y'},
          {type:'bar',label:'录音量',data:volume,backgroundColor:'rgba(59,130,246,0.13)',borderColor:'rgba(37,99,235,.92)',borderWidth:1.5,borderSkipped:'bottom',borderRadius:4,barPercentage:.55,categoryPercentage:.7,yAxisID:'y1'}]},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:'#1E293B',titleColor:'#94A3B8',bodyColor:'#E2E8F0',padding:10,cornerRadius:8,callbacks:{label:context=>` ${context.dataset.label}: ${context.parsed.y}${context.dataset.yAxisID==='y'?'%':'条'}`}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:'#94A3B8',font:{size:11},maxTicksLimit:10}},y:{position:'left',min:minimum,max:100,grid:{color:'#F1F5F9'},border:{display:false},ticks:{color:'#94A3B8',font:{size:11},callback:value=>value+'%'}},y1:{position:'right',min:0,grid:{display:false},border:{display:false},ticks:{color:'#94A3B8',font:{size:11},callback:value=>value>=1000?(value/1000).toFixed(1)+'k':value}}}}});
      } else {
        const config={labels,leftAxis:{min:0,max:step*5,ticks:Array.from({length:6},(_,i)=>i*step),label:'录音量',formatLabel:value=>String(value)},rightAxis:{min:minimum,max:100,ticks:minimum===0?[0,25,50,75,100]:[50,60,70,80,90,100],label:'合格率',formatLabel:value=>`${value}%`},bars:{axis:'left',data:volume,fill:'rgba(37,99,235,.16)',stroke:'rgba(37,99,235,.92)',widthRatio:.72,radius:6},datasets:[{axis:'right',color:'#2563eb',data:own,pointRadius:4,lineWidth:3,curved:true,solidPoint:true,fillColor:'rgba(37,99,235,.08)'},{axis:'right',color:kind==='factory'?'#F59E0B':'#94a3b8',data:average,pointRadius:kind==='factory'?0:4,lineWidth:2.5,dash:[6,4],curved:true,solidPoint:true}]};
        const layout=presentation.drawTrendChart(canvas,config,1);
        global.__unifiedDashboardController.chartConfig=config;
        let tooltip=canvas.parentElement.querySelector('[data-unified-chart-tooltip]');
        if(!tooltip){tooltip=document.createElement('div');tooltip.dataset.unifiedChartTooltip='';tooltip.className='sales-trend-tooltip';tooltip.setAttribute('role','status');canvas.parentElement.appendChild(tooltip);}
        canvas.onmousemove=event=>{if(!rows.length)return;const bounds=canvas.getBoundingClientRect(),position=event.clientX-bounds.left;const bars=layout?.bars || [];const index=bars.length?bars.reduce((best,bar)=>Math.abs(bar.centerX-position)<Math.abs(bars[best].centerX-position)?bars.indexOf(bar):best,0):Math.max(0,Math.min(rows.length-1,Math.floor(position/(bounds.width||1)*rows.length)));const rowIndex=bars.length?bars[index].index:index,row=rows[rowIndex];tooltip.textContent=`${row.date} · 录音 ${row.recordingCount} 条 · ${sales?'个人':'当前'}合格率 ${number(row.qualifiedRate,'%')} · ${sales?'门店':'全国'}合格率 ${number(average[rowIndex],'%')}`;tooltip.style.left=`${Math.max(0,Math.min((bounds.width||700)-320,position))}px`;tooltip.style.top='12px';tooltip.classList.add('visible');};
        canvas.onmouseleave=()=>tooltip.classList.remove('visible');
      }
      const factory=kind==='factory';
      html(sales?'trend-legend':'chart-legend',`<span class="legend-item"><i class="legend-dot" style="background:${factory?'#3B82F6':'#2563eb'}"></i>${sales?'个人':'当前'}合格率</span><span class="legend-item"><i class="legend-dot" style="background:${factory?'#F59E0B':'#94a3b8'}"></i>${sales?'门店':'全国'}质检合格率</span><span class="legend-item"><i class="legend-dot" style="background:rgba(37,99,235,.15)"></i>${sales?'个人':''}录音量</span>`);
      const emptyNode=node('storeTrendEmpty');if(emptyNode)emptyNode.hidden=true;
    }
    function pager(total) {
      const pages=Math.max(1,Math.ceil(total/state.pageSize));state.page=Math.min(state.page,pages);
      if(sales&&total===0)return '';
      const pageSize=presentation.pageSizeControl(state.pageSize,[3,5,10,20,50]).replaceAll('data-dashboard-page-size','data-unified-page-size');
      return `<div class="dashboard-pagination session-pagination"><span class="session-pagination-total">共 ${total} 条</span><div class="dashboard-pagination-controls">${sales?pageSize:''}<div class="page-group"><button type="button" class="page-arrow" data-unified-page="${state.page-1}" ${state.page===1?'disabled':''} aria-label="上一页">‹</button>${presentation.paginationItems(pages,state.page).map(page=>typeof page==='number'?`<button type="button" class="page-num${page===state.page?' active':''}" data-unified-page="${page}">${page}</button>`:'<span class="page-ellipsis">…</span>').join('')}<button type="button" class="page-arrow" data-unified-page="${state.page+1}" ${state.page===pages?'disabled':''} aria-label="下一页">›</button></div><div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${pages}" value="${state.page}" data-unified-page-jump></label><span class="session-page-jump-suffix">页</span></div></div></div>`;
    }
    function salesCard(lead) {
      const completed=state.completed.includes(lead.id),open=(state.expandedLeads||[]).includes(lead.id),intent=({高:'h',中:'a',低:'c'}[lead.intentLevel]||'b');
      return `<div class="todo-item intent-${intent}${completed?' completed':''}" data-unified-lead="${escape(lead.id)}"><div class="todo-priority-icon" aria-hidden="true"><img class="todo-priority-icon-mark" src="../assets/sales-recommend-avatar-icon.png" alt=""></div><div class="todo-body"><div class="todo-head todo-head-compact"><div class="todo-summary-main"><div class="todo-customer-row"><div class="todo-customer-name">${escape(lead.customerName)}</div><span class="intent-badge ${intent}">${escape(lead.intentLevel)}·${escape(lead.qcScene || '场景未提供')}</span><span class="todo-model-chip">${escape(lead.carSeries)}</span><div class="todo-checkbox-wrapper"><button type="button" class="todo-status-toggle${completed?' is-revert':''}" data-unified-complete="${escape(lead.id)}">${completed?'撤销处理':'立即处理'}</button></div></div><div class="todo-time">最近更新 ${escape(lead.lastContact)}</div></div></div><div class="role-compact-body"><div class="todo-next-step"><div class="todo-guidance-head"><span class="todo-guidance-label todo-guidance-label-primary"><img class="todo-guidance-label-icon" src="../assets/sales-followup-icon.svg" alt="">跟进建议</span>${lead.followUpTime?`<span class="followup-time-badge">建议时间 ${escape(lead.followUpTime)}</span>`:''}</div><div class="todo-next-step-text">${escape(lead.action || '暂无分析结果')}</div><div class="todo-action-btns"><button type="button" class="lead-detail-toggle" data-unified-expand="${escape(lead.id)}" aria-expanded="${open}"><span class="toggle-text">${open?'收起':'展开'}</span><span class="toggle-arrow">${open?'▲':'▼'}</span></button>${lead.recordingIds[0]?`<a class="lead-detail-btn" href="${escape(detailUrl('recording',lead.recordingIds[0]))}">录音详情</a>`:`<a class="lead-detail-btn" href="${escape(detailUrl('lead',lead.id))}">线索详情</a>`}</div>${completed?'<div class="todo-processed-stamp" aria-hidden="true">已处理</div>':''}</div><div class="lead-detail-content" ${open?'':'hidden'} aria-hidden="${!open}"><div class="role-compact-grid"><div class="role-compact-panel"><div class="todo-guidance-label todo-guidance-label-reason">推荐理由</div><div class="todo-guidance-text sales-gap-top">${escape(lead.summary || '暂无分析结果')}</div></div><div class="role-compact-panel"><div class="todo-guidance-label todo-guidance-label-info">关键信息</div><div class="role-tag-row sales-gap-top">${(lead.tags||[]).map(tag=>`<span class="todo-tag-chip">${escape(tag)}</span>`).join('')}</div><p class="muted-text">线索 ${escape(lead.id)} · 原始标注 ${lead.recordingCount} 条录音 · 已加载 ${lead.loadedRecordingCount} 条${lead.associationMissing?' · 关联缺失':''} · <a class="text-btn" href="${escape(detailUrl('lead',lead.id))}">线索详情</a></p></div></div></div></div></div></div>`;
    }
    function renderClients(result) {
      const bucket=l=>({'高':'high','中':'medium','低':'low','无':'none','无法判断':'none'}[l.intentLevel]||'none');
      const pool=result.leads,filtered=pool.filter(l=>state.intent==='all'||bucket(l)===state.intent).sort((a,b)=>String((state.timeMode==='followup'?b.followUpTime:b.lastContact)||'').localeCompare((state.timeMode==='followup'?a.followUpTime:a.lastContact)||''));
      for(const key of ['all','high','medium','low','none'])text(`${sales?'tc':'fc'}-${key}`,key==='all'?pool.length:pool.filter(l=>bucket(l)===key).length);
      const pagination=pager(filtered.length),visible=filtered.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
      const cards=visible.map(l=>{
        if(sales)return salesCard(l);
        const completed=state.completed.includes(l.id),open=(state.expandedLeads||[]).includes(l.id),intentClass=({高:'h',中:'a',低:'c'}[l.intentLevel]||'b');
        return `<div class="todo-item client-card intent-${intentClass}${completed?' completed':''}" data-unified-lead="${escape(l.id)}"><div class="todo-priority-icon" aria-hidden="true"><img class="todo-priority-icon-mark" src="../assets/sales-recommend-avatar-icon.png" alt=""></div><div class="todo-body"><div class="todo-head todo-head-compact"><div class="todo-summary-main"><div class="todo-customer-row"><div class="todo-customer-stack"><div class="todo-customer-name">${escape(l.customerName)}</div><div class="todo-customer-meta-row"><span class="todo-advisor-chip">顾问 ${escape(l.advisorName||'关联缺失')} · ${escape(l.store)}</span><span class="todo-intent-badge intent-badge ${intentClass}">${escape(l.intentLevel)}意向</span><span class="todo-model-chip">${escape(l.carSeries)}</span></div></div><div class="todo-checkbox-wrapper"><button type="button" class="todo-status-toggle${completed?' is-revert':''}" data-unified-complete="${escape(l.id)}">${completed?'撤销处理':'立即处理'}</button></div></div><div class="todo-time">最近更新 ${escape(l.lastContact)}</div></div></div><div class="role-compact-body"><div class="todo-next-step"><div class="todo-guidance-head"><span class="todo-guidance-label todo-guidance-label-primary"><img class="todo-guidance-label-icon" src="../assets/sales-followup-icon.svg" alt="">跟进建议</span>${l.followUpTime?`<span class="followup-time-badge">建议时间 ${escape(l.followUpTime)}</span>`:''}</div><div class="todo-next-step-text">${escape(l.action||'暂无分析结果')}</div><div class="todo-action-btns"><button type="button" class="lead-detail-toggle" data-unified-expand="${escape(l.id)}" aria-expanded="${open}"><span class="toggle-text">${open?'收起':'展开'}</span><span class="toggle-arrow">${open?'▲':'▼'}</span></button><a class="lead-detail-btn" href="${escape(detailUrl('lead',l.id))}">线索详情</a>${l.recordingIds[0]?`<a class="lead-detail-btn" href="${escape(detailUrl('recording',l.recordingIds[0]))}">录音详情</a>`:''}</div>${completed?'<div class="todo-processed-stamp" aria-hidden="true">已处理</div>':''}</div><div class="lead-detail-content${open?' expanded':''}" ${open?'':'hidden'} aria-hidden="${!open}"><div class="role-compact-grid todo-summary-grid"><div class="role-compact-panel todo-summary-panel"><div class="todo-summary-title">推荐理由</div><div class="todo-summary-text">${escape(l.summary||'暂无分析结果')}</div></div><div class="role-compact-panel todo-summary-panel"><div class="todo-summary-title">关键信息</div><div class="todo-tag-row">${(l.tags||[]).map(tag=>`<span class="todo-tag-chip">${escape(tag)}</span>`).join('')}</div><p class="muted-text">线索 ${escape(l.id)} · 原始标注 ${l.recordingCount} 条录音 · 已加载 ${l.loadedRecordingCount} 条${l.associationMissing?' · 关联缺失':''}</p></div></div></div></div></div></div>`;
      }).join('');
      html(sales?'todo-list':'client-list',cards||(sales?presentation.salesEmptyState(role):empty('当前范围暂无可关联线索；缺失记录未补造。')));
      if(sales){html('salesTodoPagination',pagination);html('all-leads-thead',`<tr><th>客户</th><th>阶段</th>${role==='dcc'?'<th>来源</th><th>响应情况</th><th>接待顾问</th>':'<th>邀约</th><th>接待</th><th>跟进</th>'}<th>同步状态</th><th>最近说明</th></tr>`);html('all-leads-tbody',visible.map(l=>`<tr><td><a href="${escape(detailUrl('lead',l.id))}"><strong>${escape(l.customerName)}</strong></a><div class="sales-table-sub">${escape(l.carSeries)} · ${escape(l.intentLevel)}</div></td><td>${escape(l.stage||'—')}</td>${role==='dcc'?`<td>${escape(l.source||'—')}</td><td>—</td><td>—</td>`:`<td>—</td><td>—</td><td>${escape(l.advisorName||'—')}</td>`}<td><span class="sync-pill">—</span></td><td class="sales-table-note">${escape(l.associationLabel)} · 原始标注 ${l.recordingCount} 条录音，已加载 ${l.loadedRecordingCount} 条；暂无同步结果。<div class="sales-table-sub">${escape(l.id)}</div></td></tr>`).join('')||'<tr><td colspan="7">暂无可关联线索</td></tr>');}
      else html('client-list',(cards||empty('当前范围暂无线索'))+pagination);
    }
    function renderFactoryRanking(result) {
      const selection=model.applied, geographic=selection.dimensionMode==='geography';
      const levels=geographic?['省份','城市','门店']:['大区','战区','门店'];
      const depth=selection.store.length || (geographic?selection.city:selection.zone).length ? 2 : (geographic?selection.province:selection.region).length ? 1 : 0;
      const rows=data.ranking(result.recordings,selection.dimensionMode,depth);
      const expanded=new Set(state.rankExpanded || []),sortKey=state.rankSort || 'qualifiedRate';
      const sorted=list=>[...list].sort((a,b)=>{
        if(a[sortKey]===null)return b[sortKey]===null?a.id.localeCompare(b.id):1;
        if(b[sortKey]===null)return -1;
        return (a[sortKey]-b[sortKey])*(state.rankDescending===false?1:-1) || a.id.localeCompare(b.id);
      });
      const colgroup='<colgroup><col style="width:8.31%"><col style="width:11.51%"><col style="width:15.76%"><col style="width:16.22%"><col style="width:16.07%"><col style="width:16.07%"><col style="width:16.06%"></colgroup>';
      const tableRows=(list,nesting=0)=>sorted(list).map((row,index)=>{
        const open=expanded.has(row.id),children=row.children.length>0,indent=nesting===0?'':nesting===1?'-child':'-store';
        return `<tr class="rank-row${children?' rank-expandable':''}${open?' is-open':''}" ${children?`data-unified-rank-toggle="${escape(row.id)}" aria-expanded="${open}"`:''} data-unified-rank-id="${escape(row.id)}" data-recording-count="${row.recordingCount}"><td><span class="factory-rank-index${indent?' factory-rank-index'+indent:''}">${children?`<button type="button" style="display:inline-flex;align-items:center;border:0;background:none;padding:0;color:inherit;cursor:pointer" data-unified-rank-toggle="${escape(row.id)}" aria-expanded="${open}" aria-label="${open?'收起':'展开'}${escape(row.name)}"><svg class="rank-expand-icon" style="transform:rotate(${open?90:0}deg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>`:''}${nesting===0?`<span class="factory-rank-index-num">${index+1}</span>`:''}</span></td><td><span class="factory-rank-name${indent?' factory-rank-name'+indent:''}" title="${escape(row.brand)} · ${escape(row.parentName || row.name)}">${escape(row.name)}</span></td><td><span class="factory-rank-number">${row.invitation}</span></td><td><span class="factory-rank-number">${row.testDrive}</span></td><td><span class="factory-rank-number">${row.reception}</span></td><td><span class="factory-rank-rate">${number(row.hitRate,'%')}</span></td><td><span class="factory-rank-rate factory-rank-pass">${number(row.qualifiedRate,'%')}</span></td></tr>${children?`<tr class="rank-expand-panel${open?' is-open':''}" style="display:${open?'table-row':'none'}"><td colspan="7" style="padding:0"><table class="factory-qc-rank-table factory-qc-rank-nested${row.level==='zone'||row.level==='city'?' factory-qc-rank-store':''}">${colgroup}<tbody>${tableRows(row.children,nesting+1)}</tbody></table></td></tr>`:''}`;
      }).join('');
      const columns=[['invitation','邀约录音数'],['testDrive','试驾录音数'],['reception','接待录音数'],['hitRate','话术执行率'],['qualifiedRate','质检合格率']];
      html('rank-table-wrap',`<table class="factory-qc-rank-table">${colgroup}<thead><tr><th class="rank-th">排行</th><th class="rank-th">${geographic?'地域':'组织'}名称</th>${columns.map(([key,label])=>`<th class="rank-th${key===sortKey?' active':''}" aria-sort="${key===sortKey?(state.rankDescending===false?'ascending':'descending'):'none'}"><button type="button" class="factory-rank-th-sort-content" style="border:0;background:none;color:inherit;font:inherit;padding:0;cursor:pointer" data-unified-factory-sort="${key}">${label}<span class="factory-rank-sort-indicator${key===sortKey?(state.rankDescending===false?' is-asc':' is-desc'):''}" aria-hidden="true"></span></button></th>`).join('')}</tr></thead><tbody>${tableRows(rows)||'<tr><td colspan="7">当前筛选条件没有共同录音数据</td></tr>'}</tbody></table>`);
      text('rank-title','SOP执行排行');text('rank-sub',`支持下钻：${levels.slice(depth).join(' → ')}；按当前录音明细汇总，合格率按有评分的已完成录音加权计算。`);
      const ids=[];function collect(items){for(const row of items)if(row.children.length){ids.push(row.id);collect(row.children);}}collect(rows);
      const allOpen=ids.length>0&&ids.every(id=>expanded.has(id)),toggle=node('rank-expand-toggle');
      toggle.hidden=!ids.length;toggle.textContent=allOpen?'一键收起':'一键展开';toggle.setAttribute('aria-pressed',String(allOpen));
      toggle.onclick=()=>{state.rankExpanded=allOpen?[]:ids;render();};
    }
    function renderRanking(result) {
      if(sales)return;
      if(kind==='factory'){renderFactoryRanking(result);return;}
      const records=[...result.advisors].sort((a,b)=>((a[state.sort]??-1)-(b[state.sort]??-1))*(state.descending?-1:1));
      const target=kind==='factory'?'rank-table-wrap':'advisor-list';
      const pages=Math.max(1,Math.ceil(records.length/50));state.rankPage=Math.min(state.rankPage||1,pages);
      const ranked=records.slice((state.rankPage-1)*50,state.rankPage*50);
      html(target,`<table class="advisor-table data-table"><thead><tr><th>顾问</th><th>门店</th>${[['recordingCount','录音数'],['completedCount','已完成'],['hitRate','平均话术命中率'],['qualifiedRate','合格率']].map(([key,label])=>`<th><button class="text-btn" data-unified-sort="${key}">${label}${state.sort===key?(state.descending?' ↓':' ↑'):''}</button></th>`).join('')}</tr></thead><tbody>${ranked.map(a=>`<tr><td>${escape(a.name)}<span class="cell-sub">${escape(a.advisorId)}</span></td><td>${escape(a.store)}</td><td><a href="${escape(listUrl('recording',a.recordings[0].audioId))}">${a.recordingCount}</a></td><td>${a.completedCount}</td><td>${number(a.hitRate,'%')}</td><td>${number(a.qualifiedRate,'%')}</td></tr>`).join('')||'<tr><td colspan="6">当前范围暂无录音</td></tr>'}</tbody></table><div class="dashboard-pagination session-pagination"><span>共 ${records.length} 名顾问</span><div class="dashboard-pagination-controls"><button class="page-arrow" data-unified-rank-page="${state.rankPage-1}" ${state.rankPage===1?'disabled':''}>‹</button><span>${state.rankPage} / ${pages}</span><button class="page-arrow" data-unified-rank-page="${state.rankPage+1}" ${state.rankPage===pages?'disabled':''}>›</button></div></div>`);
      text('rank-title','顾问录音质检排行');text('rank-sub','按同一范围的录音明细统计；点击录音数定位对应记录。');
    }
    function missingRuleToolbar(factory=false,sortOnly=false) {
      const sort=`<div class="issue-rule-sort${factory?'':' store-sop-rule-field store-sop-rule-field--sort'}"><span>排序</span><div class="${factory?'issue-rule-sort-dropdown':'sales-review-sop-sort-dropdown'}"><button type="button" class="${factory?'issue-rule-sort-trigger':'sales-review-sop-sort-trigger'} store-model-trigger session-select-trigger" disabled title="暂无规则结果" aria-expanded="false"><span>命中率从高到低</span><svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>`;
      if(sortOnly)return sort;
      return `<div class="issue-rule-toolbar${factory?' has-export':' store-sop-rule-toolbar'}"><label class="issue-rule-search${factory?'':' store-sop-rule-field store-sop-rule-field--search'}"><span>搜索规则</span><input class="issue-rule-search-input${factory?'':' store-sop-rule-input'}" type="search" placeholder="输入规则名称" disabled title="暂无逐录音规则结果"></label>${sort}${factory?'<button type="button" class="issue-rule-export-btn" disabled><img src="../assets/factory-issue-overview/export-icon-565-5396.svg" alt="" aria-hidden="true"><span>导出</span></button>':''}</div>`;
    }
    function missingRuleList() {
      return '<div class="issue-rule-list-shell"><div class="issue-rule-list-head"><span class="issue-rule-name-head">规则名称</span><span>命中率</span><span>命中/样本</span><span>操作</span></div><div class="issue-rule-list"><div class="issue-rule-empty">暂无逐录音规则结果，暂不能统计命中、优势、短板或风险。</div></div></div>';
    }
    function renderMissingRuleResults() {
      html('sales-sop-review-toolbar',missingRuleToolbar());html('sales-sop-review-list',missingRuleList());
      const insights=node('review-insight-list');if(insights){insights.classList.add('sales-review-top-five-list');insights.classList.remove('issue-list');insights.innerHTML='<div class="sales-review-top-five-empty">暂无逐录音分析结果</div>';}
      for(const id of ['store-issue-sop-analysis-root','issue-sop-analysis-root'])html(id,missingRuleToolbar(kind==='factory')+missingRuleList());
      for(const id of ['store-issue-rule-analysis-root','issue-rule-analysis-root'])html(id,missingRuleList());
      html('issue-insight-sort-host',missingRuleToolbar(kind==='factory',true));
    }
    function renderMissingHistory() {
      for(const [prefix,title,labels] of [
        ['arrival','今日到店确认',['今日确认到店','已发送提醒','交接备注完整','到店已签到']],
        ['chain','交接与承接',['今日待接待','待试驾','报价中','战败待回访']]
      ]){
        html(`${prefix}-summary`,`<div class="history-summary-title">${title}</div><div class="history-summary-text">当前数据未提供对应业务结果，暂无统计。</div>`);
        html(`${prefix}-pipeline`,labels.map(label=>`<div class="pipeline-card"><div class="pipeline-title">${label}</div><div class="pipeline-value">—</div><div class="pipeline-sub">暂无对应业务结果</div></div>`).join(''));
        html(`${prefix}-board`,empty('暂无交接、提醒或业务进展明细，未补造记录。'));
      }
    }
    function render() {
      const result=data.query(currentScope()),m=result.metrics;
      root.dataset.unifiedRecordingCount=String(m.recordingCount);root.dataset.unifiedLeadCount=String(result.leads.length);
      const selectedScenes=state.scenes.length?state.scenes:allowedScenes;
      const cloudScenes=selectedScenes.filter(v=>data.sceneNames.slice(0,3).includes(v)),badgeScenes=selectedScenes.filter(v=>data.sceneNames.slice(3).includes(v));
      const summaryCards=(cloudScenes.length?sourceMarkup('云外呼录音数','云外呼',cloudScenes,result.recordings):'')+(badgeScenes.length?sourceMarkup('门店工牌录音数','工牌',badgeScenes,result.recordings):'');
      if(sales){
        const metricList=role==='dcc'?[
          ['邀约录音数',m.recordingCount,'条','metric-invite-recording'],['话术命中率',m.hitRate,'%','metric-hit-rate'],['平均时长',m.averageMinutes,'min','metric-duration'],['风险录音',null,'条','metric-risk-count']
        ]:[
          ['接待数',result.visits.filter(visit=>visit.scene==='销售接待').length,'条','metric-reception-count'],['试驾数',result.visits.filter(visit=>visit.scene==='试乘试驾').length,'条','metric-test-drive-count'],['接待录音数',m.reception,'条','metric-reception-recording'],['试驾录音数',m.testDrive,'条','metric-test-drive-recording'],['话术命中率',m.hitRate,'%','metric-hit-rate'],['平均时长',m.averageMinutes,'min','metric-duration'],['风险录音',null,'条','metric-risk-count']
        ];
        html('hero-metrics',metricList.map(([label,value,unit,icon],index)=>`<div class="hm-item${role==='advisor'&&index<2?' hm-item-summary':''}">${presentation.salesMetricIcon({iconUrl:`../assets/sales-role-metrics/${icon}.png`})}<div class="hm-body"><div class="hm-label hm-label--ellipsis" title="${label}">${label}</div><div class="hm-val-row"><span class="hm-value">${number(value)}<small>${unit}</small></span><span class="hm-trend">环比 —</span></div></div>${presentation.salesMetricHelp(label,metricDescriptions[label])}</div>${role==='advisor'&&index===1?'<div class="hm-sep hm-sep-divider" aria-hidden="true"></div>':''}`).join(''));
      } else {
        const metrics=kind==='factory'?[
          ['平均时长',m.averageMinutes,'min'],['话术执行率',m.hitRate,'%'],['质检合格数',m.qualifiedCount,'条'],['质检合格率',m.qualifiedRate,'%'],['风险录音数',null,'条'],['风险录音率',null,'%']
        ].map(args=>factoryMetricMarkup(...args)).join(''):metricMarkup('已完成录音',m.completedCount,'条')+metricMarkup('平均话术命中率',m.hitRate,'%')+metricMarkup('平均时长',m.averageMinutes,'min')+metricMarkup('质检合格数',m.qualifiedCount,'条')+metricMarkup('质检合格率',m.qualifiedRate,'%')+metricMarkup('风险录音',m.riskCount,'条');
        if(kind==='factory')node('hero-kpi-grid').classList.add('factory-hero-metrics-layout');
        html('hero-kpi-grid',`${kind==='factory'?'<svg class="hero-funnel-svg" id="hero-funnel-svg" aria-hidden="true"></svg>':''}<div class="hm-layout-top"><div class="store-recording-summary${!cloudScenes.length || !badgeScenes.length?' is-single-source':''}">${summaryCards}</div></div><div class="hm-layout-divider" aria-hidden="true"></div><div class="hm-layout-bottom">${metrics}</div>`);
      }
      const storeCount=new Set(result.recordings.map(r=>r.storeId)).size;
      text('storeDashboardScopeTitle',subject?.store?.dealerName || (kind==='store'?'未指定有效门店':storeCount===1?result.recordings[0].store:'门店经营概览'));text('storeDashboardScopeText',`${result.advisors.length} 名顾问 · 当前范围`);
      const description=root.querySelector('.store-page-desc');if(description)description.textContent='与录音、线索、工牌和到访明细使用同一基础数据；演示样本保留独立标识。';
      const gap=`当前范围 ${m.recordingCount} 条录音、${result.leads.length} 条线索。${m.missingAssociations} 条录音的线索关联缺失。未提供逐录音规则、风险和画像结果的部分显示暂无统计。`;
      html('sop-ai-summary',`<span class="hint-text">当前范围 ${m.recordingCount} 条录音，${m.missingAssociations?`${m.missingAssociations} 条线索关联缺失。`:'按已加载明细统计。'}暂无逐项规则与风险分析。</span>`);html('review-ai-summary',`<p>${m.recordingCount?`当前 ${m.recordingCount} 条录音，合格率 ${number(m.qualifiedRate,'%')}。`:'当前范围暂无录音。'}暂无逐项行为分析结果。</p>`);
      if(sales)presentation.updateScoreRing(m.qualifiedRate);
      html('sop-score-val',`${number(m.qualifiedRate)}<span>%</span>`);html('review-score-val',`${number(m.qualifiedRate)}<small>%</small>`);
      const fill=root.querySelector('#sop-dial-fill');if(fill)fill.style.strokeDashoffset=String(2*Math.PI*65*(1-(m.qualifiedRate||0)/100));
      const comparison=data.query({...currentScope(),predicate:undefined}),difference=m.qualifiedRate===null||comparison.metrics.qualifiedRate===null?null:m.qualifiedRate-comparison.metrics.qualifiedRate;
      text('sop-national-avg',number(comparison.metrics.qualifiedRate));
      if(kind==='factory'){html('sop-national-diff',`<span class="sop-improve-copy"><span class="sop-improve-label sop-national-diff-label">${difference>0?'+':''}</span><span class="sop-improve-value sop-national-diff-value">${number(difference,'%')}</span></span>`);node('sop-national-diff').classList.toggle('up',difference!==null&&difference>=0);node('sop-national-diff').classList.toggle('down',difference!==null&&difference<0);html('sop-period-change','<span class="sop-period-change-value" style="color:#64748b">环比 —</span>');node('sop-period-change').classList.remove('up','down');}else{text('sop-national-diff',number(difference,'%'));text('sop-period-change','暂无同比数据');}
      text('sop-summary-trend-title','优势发掘');text('sop-summary-trend-text',`${state.startDate} 至 ${state.endDate}，所有指标来自当前筛选的基础记录。`);text('sop-summary-weakness-text','暂无逐录音短板分析结果');text('sop-summary-risk-text','暂无逐录音风险分析结果');
      renderMissingRuleResults();
      if(sales){const completed=result.leads.filter(lead=>state.completed.includes(lead.id)).length;html('execution-focus-metrics',[{label:'高质量线索',value:result.leads.filter(lead=>['H','A'].includes(lead.intentGrade)).length,sub:'H/A级线索在筛选时间内',tone:'blue',icon:'star'},{label:'待处理',value:result.leads.length-completed,sub:'线索待人工确认',tone:'amber',icon:'clock'},{label:'已完成',value:completed,sub:'已标记完成状态',tone:'green',icon:'check'},{label:'线索总数',value:result.leads.length,sub:'筛选时间内的全部线索',tone:'violet',icon:'list'}].map(presentation.executionMetric).join(''));}
      renderMissingHistory();
      const oldBanner=root.querySelector('.focus-banner');if(oldBanner)oldBanner.textContent=gap;
      if(sales){const selected=people.find(a=>a.advisorKey===model.applied.advisor[0]);text('profile-name',selected?.advisorName||'未指定有效顾问');text('profile-avatar',selected?.advisorName?.slice(0,1)||'—');text('profile-store',selected?.store||'—');text('profile-title',selected?.title||'—');text('lead-view-note',`当前范围 ${result.leads.length} 条线索；按明确顾问ID关联。`);const hint=root.querySelector('.local-complete-hint .hint-text');if(hint)hint.textContent='本地完成标记：处理状态保存在当前浏览器，不与上游系统同步，可随时撤销。';}
      for(const [attribute,active] of [['data-filter',value=>value===state.intent],['data-mode',value=>value===state.timeMode],['data-range',value=>{const selected=range(Number(value));return selected.startDate===state.startDate&&selected.endDate===state.endDate;}]])root.querySelectorAll(`[${attribute}]`).forEach(button=>{const selected=active(button.getAttribute(attribute));button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
      renderRanking(result);renderClients(result);renderChart(result);renderDate();
      global.__unifiedDashboardController.result=result;
    }
    function click(event) {
      const button=event.target.closest('button,[data-unified-rank-toggle]');if(!button||!root.contains(button))return;
      const d=button.dataset;
      if(d.unifiedPageSizeTrigger!==undefined){const select=button.closest('.page-size-select'),open=select.querySelector('.page-size-options').classList.toggle('open');button.setAttribute('aria-expanded',String(open));return;}
      if(d.unifiedPageSize!==undefined){state.pageSize=Number(d.unifiedPageSize);state.page=1;render();return;}
      if(button.disabled)return;
      if(dateHost.contains(button))event.stopPropagation();
      if(d.unifiedReset!==undefined){reset();change();return;}
      if(d.unifiedDateTrigger!==undefined){event.stopPropagation();ui?.closeMenu();business?.closeMenu();dateOpen=!dateOpen;draft={startDate:state.startDate,endDate:state.endDate};activeField='startDate';viewDate=new Date(`${draft.startDate}T12:00:00`);renderDate();}
      else if(d.unifiedDateField){activeField=d.unifiedDateField;renderDate();}
      else if(d.unifiedDateNav){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+Number(d.unifiedDateNav),1);renderDate();}
      else if(d.unifiedDateValue){draft[activeField]=d.unifiedDateValue;if(draft.startDate>draft.endDate){if(activeField==='startDate')draft.endDate=draft.startDate;else draft.startDate=draft.endDate;}activeField=activeField==='startDate'?'endDate':'startDate';renderDate();}
      else if(d.unifiedDateShortcut){draft=range(Number(d.unifiedDateShortcut));viewDate=new Date(`${draft.startDate}T12:00:00`);renderDate();}
      else if(d.unifiedDateCancel!==undefined)closeDate();
      else if(d.unifiedDateApply!==undefined){Object.assign(state,draft,{page:1,rankPage:1});dateOpen=false;render();}
      else if(d.unifiedRankToggle){const expanded=new Set(state.rankExpanded||[]);if(expanded.has(d.unifiedRankToggle))expanded.delete(d.unifiedRankToggle);else expanded.add(d.unifiedRankToggle);state.rankExpanded=[...expanded];render();}
      else if(d.unifiedFactorySort){state.rankDescending=state.rankSort===d.unifiedFactorySort?!state.rankDescending:true;state.rankSort=d.unifiedFactorySort;render();}
      else if(d.unifiedExpand){const expanded=new Set(state.expandedLeads||[]);if(expanded.has(d.unifiedExpand))expanded.delete(d.unifiedExpand);else expanded.add(d.unifiedExpand);state.expandedLeads=[...expanded];render();}
      else if(d.unifiedComplete){const completed=new Set(state.completed);if(completed.has(d.unifiedComplete))completed.delete(d.unifiedComplete);else completed.add(d.unifiedComplete);state.completed=[...completed];try{global.localStorage?.setItem(completionKey,JSON.stringify(state.completed));}catch{global.PlatformToast?.show('处理状态暂存于当前会话，无法写入本地存储。');}render();}
      else if(d.unifiedPage){state.page=Number(d.unifiedPage);render();}
      else if(d.unifiedRankPage){state.rankPage=Number(d.unifiedRankPage);render();}
      else if(d.unifiedSort){state.descending=state.sort===d.unifiedSort?!state.descending:true;state.sort=d.unifiedSort;render();}
      else if(d.filter){state.intent=d.filter;state.page=1;root.querySelectorAll('[data-filter]').forEach(n=>{n.classList.toggle('active',n.dataset.filter===d.filter);n.setAttribute('aria-pressed',String(n.dataset.filter===d.filter));});render();}
      else if(d.range){Object.assign(state,range(Number(d.range)),{page:1});root.querySelectorAll('[data-range]').forEach(n=>n.classList.toggle('active',n===button));render();}
      else if(d.mode){state.timeMode=d.mode;root.querySelectorAll('[data-mode]').forEach(n=>n.classList.toggle('active',n===button));render();}
      else if(d.view){root.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===button));root.querySelectorAll('.lead-view-panel').forEach(n=>n.classList.toggle('active',n.id===`lead-view-${d.view}`));}
      else if(d.issueInsightTab || d.reviewInsightTab){const attribute=d.issueInsightTab?'data-issue-insight-tab':'data-review-insight-tab';root.querySelectorAll(`[${attribute}]`).forEach(n=>{n.classList.toggle('active',n===button);n.setAttribute('aria-selected',String(n===button));});}
    }
    function closePageSize(){root.querySelectorAll('.page-size-options.open').forEach(panel=>panel.classList.remove('open'));root.querySelectorAll('[data-unified-page-size-trigger]').forEach(button=>button.setAttribute('aria-expanded','false'));}
    function outside(event){if(dateOpen&&!event.composedPath().includes(dateHost))closeDate();if(!event.target.closest?.('.page-size-select'))closePageSize();}
    function changePage(event){const input=event.target.closest('[data-unified-page-jump]');if(!input||!root.contains(input))return;const next=Math.max(1,Math.min(Number(input.getAttribute('max')),Math.floor(Number(input.value)||1)));if(next===state.page)return;state.page=next;render();}
    function keydown(event){if(event.key==='Escape'){const trigger=root.querySelector('[data-unified-page-size-trigger][aria-expanded="true"]');if(trigger){closePageSize();trigger.focus();}}if(event.key==='Enter'&&event.target.closest?.('[data-unified-page-jump]')){event.preventDefault();changePage(event);}if(event.key==='Escape'&&dateOpen){event.preventDefault();closeDate();dateHost.querySelector('[data-unified-date-trigger]')?.focus();}}
    root.addEventListener('click',click);root.addEventListener('change',changePage);document.addEventListener('click',outside);document.addEventListener('keydown',keydown);
    const resize=()=>renderChart(global.__unifiedDashboardController.result);
    global.addEventListener('resize',resize);
    const controller={kind,subject,model,state,query:()=>data.query(currentScope()),render,result:null,destroy(){if(destroyed)return;destroyed=true;chartInstance?.destroy();stopSticky?.();global.removeEventListener('resize',resize);const canvas=node(sales?'trendChart':kind==='factory'?'factory-trendChart':'storeTrendChart');if(canvas){canvas.onmousemove=null;canvas.onmouseleave=null;}const expandToggle=node('rank-expand-toggle');if(expandToggle)expandToggle.onclick=null;ui?.destroy();business?.destroy();sourceTabs?.destroy();root.removeEventListener('click',click);root.removeEventListener('change',changePage);document.removeEventListener('click',outside);document.removeEventListener('keydown',keydown);}};
    global.__unifiedDashboardController=controller;ready=true;render();stopSticky=presentation.initStickyFilters();return controller;
  }
  function applyRecordingDetail(record,host,playerState) {
    if(record.linkedDemo)global.AIQCLinkedDemo.applyRecordingDetail(record,host,playerState);
    else {
      const set=(selector,value,isHtml=false)=>{const n=host.querySelector(selector);if(n)n[isHtml?'innerHTML':'textContent']=value;};
      set('#sessionDetailRecordId',`录音ID: ${record.audioId}`);set('#sessionDetailStore',`${record.store} · ${record.advisorName}`);set('#sessionDetailDate',`日期: ${record.startTime}`);set('#sessionDetailContextPill',`${record.customerNameMasked} / ${record.scenario} / ${record.status}`);
      const message=`${record.associationLabel}。当前原始数据仅提供录音元数据，未提供音频、转写和逐项分析结果。`;
      for(const selector of ['.session-ai-sketch-text','.session-ai-suggestion-card','#sessionDetailGreeting'])set(selector,message);
      for(const selector of ['#sessionDetailSketchCloud','.session-ai-portrait-grid'])set(selector,'',true);
      set('.session-ai-intention-tags',`<span class="tag-pill">AI意向：${escape(record.intentLevel)}</span><span class="tag-pill">AI意向车系：${escape(record.carSeries)}</span>`,true);
      for(const selector of ['.session-ai-intention-list','#sessionAiTranscriptPanel .transcript-list'])set(selector,`<p class="muted-text">${escape(message)}</p>`,true);
      set('.session-detail-actions-main',`<a class="btn" href="${escape(listUrl('recording',record.audioId))}">返回录音列表</a>${global.AIQCData.getLead(record.leadId)?`<a class="btn" href="${escape(detailUrl('lead',record.leadId))}">关联线索</a>`:'<span class="muted-text">线索关联缺失</span>'}`,true);
      playerState.duration=Math.floor(record.durationMs/1000);playerState.currentTime=0;
    }
    const resultStatus=['已完成','失败'].includes(record.status)?record.status:'—';
    const context=host.querySelector('#sessionDetailContextPill');
    if(context)context.textContent=record.status==='未找到记录'?'未找到对应录音记录':`${record.customerNameMasked || record.customerName || '—'} / ${record.scenario || '—'} / ${resultStatus}`;
    if(record.linkedDemo && resultStatus==='—') {
      const summary=host.querySelector('.session-ai-sketch-text');if(summary)summary.textContent='暂无分析结果';
      const cloud=host.querySelector('#sessionDetailSketchCloud');if(cloud)cloud.innerHTML='';
      const evidence=host.querySelector('.session-ai-intention-list .session-ai-intention-row:first-child p');if(evidence)evidence.textContent='暂无分析结果';
    }
    host.querySelectorAll('.session-metrics-card .metric-card').forEach(card=>{
      const label=card.querySelector('.metric-note')?.textContent || '',value=card.querySelector('strong');
      if(value)value.textContent=label.includes('时长')?`${number(record.durationMs/60000)} min`:label.includes('命中率')?(record.qualifiedRate || '—'):(record.followUpTime || '—');
    });
    const sop=host.querySelector('.sop-result-list');if(sop)sop.innerHTML='<p class="muted-text">暂无逐项SOP分析结果，未补造规则和证据。</p>';
    const sopCount=host.querySelector('.session-detail-sop .mini-pill');if(sopCount)sopCount.textContent='暂无统计';
    host.querySelectorAll('audio,video').forEach(n=>{n.pause?.();n.removeAttribute('autoplay');});
    host.querySelectorAll('[data-session-play],#sessionPlayToggle,#sessionBack15,#sessionForward15,#sessionSpeedToggle,#sessionProgressRange,.session-play-button').forEach(n=>{n.disabled=true;n.title='当前数据未提供音频';});
    host.querySelectorAll('[data-rule-id],.session-sop-list,.session-risk-list').forEach(n=>{n.innerHTML='<p class="muted-text">暂无逐项分析结果</p>';});
  }
  global.AIQCDashboard={mount,applyRecordingDetail};
})(window);
