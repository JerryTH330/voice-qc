const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createController } = require('../shared/list-header-actions.js');
const { createService, sources } = require('../shared/export-tasks.js');
const { createXlsxBytes } = require('../device-management/xlsx-export-utils.js');
const source = fs.readFileSync(path.join(__dirname, '../device-management/page.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
function fn(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf('\n}\n', start) + 2);
}
function controller() {
  const timers = [], notices = [], buttons = [], submitted = [];
  let handler;
  const host = { document: {
    addEventListener(type, callback) { handler = callback; },
    querySelectorAll(selector) { return buttons.filter(button => button.matches === selector); }
  }, setTimeout(callback) { timers.push(callback); }, PlatformToast: { show(...args) { notices.push(args); } },
  ExportTaskUI: { async submit(request) { submitted.push(request); } } };
  function button(type, key) {
    const classes = new Set();
    const value = { matches: `[data-list-${type}="${key}"]`, dataset: { [type === 'export' ? 'listExport' : 'listRefresh']: key },
      disabled: false, lastElementChild: { textContent: '' }, attributes: {},
      setAttribute(key, value) { this.attributes[key] = value; },
      classList: { toggle(key, value) { if (value) classes.add(key); else classes.delete(key); }, contains: key => classes.has(key) },
      closest() { return this; } };
    buttons.push(value); return value;
  }
  return { host, api: createController(host), button, timers, notices, submitted,
    click(button) { const event = { target: button, stopImmediatePropagation() { this.stopped = true; } }; handler(event); return event; } };
}
function adapterContext(overrides = {}) {
  const context = vm.createContext({ window: {}, visitRecordTemplates: [], storeFieldSettingsModel: require('../device-management/store-field-settings.js'),
    storeFieldSettingsState: require('../device-management/store-field-settings.js').createDefaultSettings(),
    getBadgeExportTimestamp: () => '20261015_123456',
    storeOverviewState: { startDate:'2026-10-14', endDate:'2026-10-14' },
    getFilteredStoreRecords: () => [{ brand:'埃安', organization:'大区甲', zone:'战区甲', name:'门店乙', badges:null, bindings:2, employees:3, boundEmployees:2, syncedAt:'2026-08-01 09:00:00' }],
    getStoreBadgeAssetCount: item => item.badges,
    getStoreBindingRate: item => item.badges ? item.bindings / item.badges * 100 : null,
    formatStoreBindingRate: value => value === null ? '—' : `${value.toFixed(1)}%`,
    projectDemoTimestampToDate: (value,date) => date + value.slice(10),
    badgeManagementDealer: { dealerName:'门店甲' }, badgeManagementState: { query:'0007',status:'已绑定' },
    badgeManagementEmployees: [{employeeId:'0007',employeeName:'陈佳'}],
    badgeManagementBadges: [
      {sn:'SN-A',employeeId:'0007',connectionStatus:'已连接',battery:52,syncedAt:'2026-10-14 09:00:00'},
      {sn:'SN-B',employeeId:'',connectionStatus:'未连接',battery:82,syncedAt:'2026-10-14 09:00:00'}],
    badgeUploadFilterState: { startDate:'2026-10-12',endDate:'2026-10-14' },
    getCurrentBadgeUploadRecords: () => [
      {status:'已上传',completedAt:'2026-10-12 11:00:00'}, {status:'已上传',completedAt:'2026-10-12 12:00:00'},
      {status:'未上传',completedAt:'未上传'}, {status:'已上传',completedAt:'2026-10-10 12:00:00'}],
    badgeRecordState: {sn:'SN-A'}, badgeUploadSelectedDate:'2026-10-12',
    badgeUploadModalState: {isVisitDetail:true,visitRecord:{businessId:'BIZ-1',badgeSn:'SN-A',date:'2026-10-14',status:'录音上传中'},
      records:[{sequence:4,advisorName:'陈佳',sn:'SN-A',size:'2 MB',startTime:'2026-10-14 12:15:00',duration:'00:04:00',completedAt:'未上传'}]},
    badgeEventRecords: [], badgeEventFilterState:{sn:'SN-A',date:'2026-10-14',type:'all'},
    visitEventFilterState:{record:{badgeSn:'SN-MISSING',businessId:'BIZ-2',advisor:'陈佳',date:'2026-10-14',startTime:'12:00:00',endTime:'12:24:00'},date:'2026-10-14',type:'all'},
    getBadgeEventRecord: () => ({events:[{type:'power-on',time:'08:00:00',label:'工牌开机'}]}),
    badgeEventTypeOptions: [['all','全部事件'],['recording','录音'],['charging','充电']], ...overrides });
  const functions = ['getVisibleStoreFields','getStoreFieldValue','badgeEventTimeToSeconds','formatBadgeDurationSeconds','getStoreOverviewExportFilters','getVisibleEventExportRows','getDeviceListExportRequest','buildBadgeEventGroups','matchesBadgeEventGroupType','formatBadgeEventDuration',
    'getBadgeManagementEmployee','getBadgeManagementRecords','getBadgeUploadStartTime','getBadgeUploadMatchTime','getBadgeUploadCompletedDate','getBadgeUploadDateRange','shiftBadgeUploadDate','getCompletedBadgeUploadRecords'];
  vm.runInContext(functions.map(fn).join('\n'),context);
  context.getStoreOverviewExportFilters = () => [{label:'查询日期',value:'2026-10-14 至 2026-10-14'}];
  return context;
}

test('refresh locks repeated clicks, shows feedback, and retains the current page/filter state', () => {
  const h = controller(), refresh = h.button('refresh','stores'), state = {page:4,query:'门店甲'};
  let count = 0;
  h.api.register('stores',{request:()=>null,refresh(){count++;assert.deepEqual(state,{page:4,query:'门店甲'});}});
  assert.ok(h.click(refresh).stopped); h.click(refresh);
  assert.equal(h.timers.length,1); assert.equal(refresh.disabled,true); assert.equal(refresh.attributes['aria-busy'],'true');
  assert.equal(refresh.lastElementChild.textContent,'刷新中'); assert.ok(refresh.classList.contains('is-refreshing'));
  h.timers.shift()(); assert.equal(count,1); assert.equal(refresh.disabled,false); assert.equal(refresh.lastElementChild.textContent,'刷新');
  assert.equal(h.notices[0][0],'数据已刷新');
});

test('an export freezes the selected rows before loading, blocks double clicks and restores controls', async () => {
  const h = controller(), button = h.button('export','stores');
  let rows = [['门店甲']]; let ready;
  h.host.__exportReady = new Promise(resolve=>{ready=resolve;});
  h.api.register('stores',{request:()=>({rows:rows.map(row=>row.slice())}),refresh(){}});
  const pending = h.api.export('stores'); h.click(button); rows=[['门店乙']];
  assert.equal(button.disabled,true); assert.equal(button.attributes['aria-busy'],'true');
  ready(); await pending;
  assert.deepEqual(h.submitted,[{rows:[['门店甲']]}]); assert.equal(button.disabled,false);
});

test('empty exports are disabled; refresh and export failures release their locks and report errors', async () => {
  const h = controller(), button = h.button('export','events'), refresh = h.button('refresh','events');
  let rows=[];
  h.api.register('events',{request:()=>({rows}),refresh(){throw new Error('刷新失败');}});
  assert.ok(button.disabled); await h.api.export('events'); assert.equal(h.submitted.length,0);
  rows=[['数据']]; h.api.sync('events'); assert.equal(button.disabled,false);
  h.host.ExportTaskUI.submit=async()=>{throw new Error('存储不可用');};
  await h.api.export('events'); assert.equal(button.disabled,false); assert.equal(button.attributes['aria-busy'],'false');
  h.api.refresh('events'); h.timers.shift()(); assert.equal(refresh.disabled,false);
  assert.deepEqual(h.notices.map(item=>item[0]),['存储不可用','刷新失败']);
});

test('store exports include every filtered row in current order, preserve missing assets and use the selected date', () => {
  const c=adapterContext(), input=c.getDeviceListExportRequest('stores');
  assert.equal(input.source,'stores'); assert.equal(input.rows.length,1); assert.equal(input.columns.length,10);
  assert.deepEqual(plain(input.rows[0]),['埃安','大区甲','战区甲','门店乙','—',2,'—',3,2,'2026-10-14 09:00:00']);
  assert.equal(input.filters[0].value,'2026-10-14 至 2026-10-14');
});

test('store filter metadata uses applied selections and directory names, never uncommitted date drafts or internal IDs', () => {
  const c=adapterContext({window:{VisitOrganizationFilter:require('../device-management/visit-organization-filter.js')},
    storeOrganizationModel:{applied:{dimensionMode:'geography',brand:['B1'],province:[],city:[],region:[],zone:[],store:[],patroler:[],governor:[],advisor:['A1']},directory:[{brandId:'B1',brand:'埃安'}]},
    storeOrganizationRecords:[{advisorKey:'A1',advisor:'陈佳'}]});
  vm.runInContext(fn('getStoreOverviewExportFilters'),c);
  const filters=plain(c.getStoreOverviewExportFilters());
  assert.ok(filters.some(item=>item.value==='地理维度')); assert.ok(filters.some(item=>item.value==='埃安'));
  assert.ok(filters.some(item=>item.value==='陈佳')); assert.ok(!JSON.stringify(filters).includes('A1'));
});

test('management exports match search and binding filters and retain employee ID text', () => {
  const c=adapterContext(); let input=c.getDeviceListExportRequest('management');
  assert.equal(input.rows.length,1); assert.equal(input.rows[0][2],'0007'); assert.equal(input.rows[0][3],'已绑定');
  c.badgeManagementState.query=''; c.badgeManagementState.status='未绑定'; input=c.getDeviceListExportRequest('management');
  assert.equal(input.rows.length,1); assert.equal(input.rows[0][0],'SN-B'); assert.equal(input.rows[0][2],'—');
});

test('daily upload export follows completion dates, includes zero-count days and excludes pending/out-of-range data', () => {
  const c=adapterContext(), input=c.getDeviceListExportRequest('uploads');
  assert.deepEqual(plain(input.rows),[['2026-10-14',0],['2026-10-13',0],['2026-10-12',2]]);
});

test('upload detail exports keep exact visit evidence, original fragment numbers and the correct six/eight columns', () => {
  const c=adapterContext(); let input=c.getDeviceListExportRequest('upload-details');
  assert.equal(input.columns.length,6); assert.equal(input.rows.length,1); assert.equal(input.rows[0][0],4);
  assert.equal(input.rows[0][4],'未上传'); assert.ok(!input.columns.some(item=>item.label==='工牌 SN'));
  c.badgeUploadModalState.isVisitDetail=false; input=c.getDeviceListExportRequest('upload-details');
  assert.equal(input.columns.length,8); assert.equal(input.rows[0][2],'SN-A');
  c.badgeUploadModalState.records=[]; assert.equal(c.getDeviceListExportRequest('upload-details').rows.length,0);
});

test('event export merges intervals, retains open intervals and exports only the selected event type', () => {
  const c=adapterContext(), events=[
    {type:'power-on',label:'工牌开机',time:'08:00:00'}, {type:'recording-start',time:'08:05:00'}, {type:'recording-end',time:'08:10:00'},
    {type:'recording-start',time:'08:15:00'}, {type:'low-battery',time:'08:20:00',note:'剩余 19%'},
    {type:'power-off',time:'08:30:00'}, {type:'charging-start',time:'08:31:00'}, {type:'charging-end',time:'09:00:00'}];
  const rows=plain(c.getVisibleEventExportRows(events,'recording','2026-10-14','SN-A'));
  assert.equal(rows.length,2); assert.equal(rows[0][4],'08:10:00'); assert.equal(rows[1][4],'进行中');
  assert.ok(rows.every(row=>row[2]==='录音'));
  const charge=plain(c.getVisibleEventExportRows(events,'charging','2026-10-14','SN-A'));
  assert.equal(charge.length,1); assert.equal(charge[0][2],'充电'); assert.equal(charge[0][4],'09:00:00');
});

test('visit event export keeps an empty evidence set and never substitutes generated badge events', () => {
  const c=adapterContext(); assert.equal(c.getDeviceListExportRequest('visit-events').rows.length,0);
  assert.equal(c.getDeviceListExportRequest('events').rows.length,1);
});

test('every new source completes as a real workbook in the shared export task service', async () => {
  const c=adapterContext(); c.badgeEventRecords.push({sn:'SN-MISSING',date:'2026-10-14',events:[{type:'power-on',time:'08:00:00',label:'工牌开机'}]});
  let tasks=[], time=Date.parse('2026-10-15T00:00:00Z');
  const service=createService({userId:'test',now:()=>time,buildFile:createXlsxBytes,store:{async update(fn){const result=fn(tasks);return structuredClone(result);}}});
  for (const key of ['stores','management','uploads','upload-details','events','visit-events']) {
    const input=plain(c.getDeviceListExportRequest(key)); const task=await service.submit(input);
    assert.equal(task.source,input.source); assert.equal(task.recordCount,input.rows.length);
    time+=2000; await service.advance(); time+=10000; await service.advance();
    const output=await service.download(task.id), xml=new TextDecoder().decode(output.bytes);
    assert.equal(output.bytes[0],80); assert.equal(output.bytes[1],75);
    assert.ok(xml.includes(input.columns[0].label)); assert.ok(xml.includes(String(input.rows[0][0])));
  }
  for (const key of ['customerInsights','adoptedActions','docks','scriptLibrary']) assert.equal(sources[key],undefined);
});

test('matching refresh keeps its current page while a new filter render returns to page one', () => {
  const nodes=new Map();
  const c=vm.createContext({window:{},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{closest:()=>({})});return nodes.get(id);}},
    matchingPaginationState:{page:3},getFilteredMatchingVisitRecords:()=>[],sumVisitWeights:()=>0,
    getMatchingRecordCategory:()=>'',formatDeviceCount:String,renderMatchingStoreTable(){}});
  vm.runInContext(fn('renderMatchingDashboard'),c);
  c.renderMatchingDashboard({preservePage:true}); assert.equal(c.matchingPaginationState.page,3);
  c.renderMatchingDashboard(); assert.equal(c.matchingPaginationState.page,1);
});
