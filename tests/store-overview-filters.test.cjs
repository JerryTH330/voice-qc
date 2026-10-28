const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'device-management/page.js'), 'utf8');
const filters = require('../device-management/visit-organization-filter.js');
const switcher = require('../shared/dimension-switcher.js');
const plain = value => JSON.parse(JSON.stringify(value));
function fn(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf('\n}\n', start) + 2);
}
function setup({ storedSettings = null, storageThrows = false, unified = false } = {}) {
  const nodes = new Map(), messages = [], frames = [], dragAdapters = [];
  const storage = new Map(storedSettings ? [['aiqc-device-store-field-settings-v1', JSON.stringify(storedSettings)]] : []);
  let state, context, collapse;
  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const classes = new Set(id === 'storeFilterControls' ? ['is-collapsed'] : []);
    const value = { textContent: '', innerHTML: '', dataset: {}, scrollTop: 0, hidden: false,
      style: { setProperty() {} }, attributes: {}, isConnected: true,
      classList: { add(key) { classes.add(key); }, remove(key) { classes.delete(key); }, contains: key => classes.has(key), toggle(key, on) { if (on ?? !classes.has(key)) classes.add(key); else classes.delete(key); } },
      setAttribute(key, value) { this.attributes[key] = String(value); },
      getAttribute(key) { return this.attributes[key] || null; },
      getBoundingClientRect: () => ({ left: 260, top: 200, bottom: 244, height: 44 }),
      querySelector(selector) { return selector === '.store-filter-menu' ? state?.menu.openMenu ? node('menu') : null : node(selector); },
      querySelectorAll: () => [], closest: () => node('time-root'),
      focus() { context.document.activeElement = value; }, setSelectionRange() {} };
    nodes.set(id, value); return value;
  }
  context = vm.createContext({ window: { VisitOrganizationFilter: filters, DimensionSwitcher: switcher,
      StoreFieldSettings: require('../device-management/store-field-settings.js'),
      __fieldSettingsInteractions: { createController(config) { dragAdapters.push(config); return { cancel() {} }; } },
      setTimeout(callback) { frames.push(callback); },
      matchMedia: () => ({ matches: true }), addEventListener() {}, requestAnimationFrame(callback) { frames.push(callback); } },
    document: { getElementById: node, querySelectorAll: () => [], documentElement: { clientWidth: 1303 },
      querySelector: selector => selector.includes(' .badge-advisor-options') ? node('options') : node(selector) },
    localStorage: { getItem(key) { if(storageThrows) throw new Error('unavailable'); return storage.get(key); }, setItem(key,value) { if(storageThrows) throw new Error('unavailable'); storage.set(key,value); } },
    syncBodyScrollLock() {},
    beginRecordDrawerMenuRender: () => true, playRecordDrawerMenuMotion() {},
    showToast: message => messages.push(message),
    setVisitFiltersCollapsed(value, options) { collapse = { value, options }; },
    projectDemoTimestampToDate: value => value });
  context.window.innerHeight = 836;
  for (const file of ['date-filter-component-utils.js','leads/organization-data.js','shared/organization-directory.js','device-management/organization-data.js', ...(unified ? ['session/real-recording-data.js','leads/real-lead-data.js'] : []), 'shared/linked-demo-data.js', ...(unified ? ['shared/unified-data.js'] : [])]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
  }
  vm.runInContext(['formatStoreDateValue','parseStoreDateValue','getStoreRelativeDateValue'].map(fn).join('\n'), context);
  vm.runInContext(source.slice(source.indexOf('const sharedOrganizationDirectory ='), source.indexOf('const badgeTypes =')), context);
  vm.runInContext('const storeOverviewMetricFrames = new Map();', context);
  const functions = ['getStoreFieldValue','renderStoreFieldCell','getStoreOverviewExportFilters','getDeviceListExportRequest','getBadgeExportTimestamp','getFilteredStoreRecords','sumStoreMetric','getStoreBadgeAssetCount','getStoreBindingRate','formatStoreBindingRate',
    'updateStoreSortHeaders','renderStoreOverviewPagination','formatStoreOverviewMetricValue','setStoreOverviewMetricValue','animateStoreOverviewMetric','animateStoreOverviewMetrics','renderStoreOverview',
    'getStoreSelectCandidates','syncStoreDateDraft','renderStoreMultiSelect','renderStoreOrganizationFilters','renderStoreDateMenu','syncStoreTimeFilterControl','positionStoreFilterMenu','closeStoreFilterMenus','handleStoreFilterClick','handleStoreDateClick','updateStoreFilterSearch','handleStoreFilterKeydown','updateStoreResults',
    'escapeBadgeHtml','formatStoreDateDisplay','syncVisitDateView','applyVisitDateDraft','applyVisitDateShortcut','getVisitDateCells','isRecordDrawerMenuVisible','openRecordDrawerMenuState','closeRecordDrawerMenuState'];
  vm.runInContext(functions.map(fn).join('\n'), context);
  vm.runInContext(source.slice(source.indexOf('const storeFieldSettingsModel ='), source.indexOf('function getStoreSelectCandidates(')), context);
  state = vm.runInContext('({ model: storeOrganizationModel, records: storeOverviewRecords, advisors: storeOrganizationRecords, view: storeOverviewState, menu: storeMenuState, date: storeDateMenuState, defaults: storeDefaultFilters, get settings() { return storeFieldSettingsState; }, get draft() { return storeFieldSettingsDraft; } })', context);
  function event(dataset = {}, key) {
    const target = { dataset, focus() {}, hasAttribute: attr => Object.keys(dataset).some(k => `data-${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}` === attr),
      closest(selector) { return Object.keys(dataset).some(k => selector.includes(`[data-${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`)) ? this : null; } };
    return { target, key, preventDefault() { this.prevented = true; }, stopPropagation() {} };
  }
  const click = dataset => context.handleStoreFilterClick(event(dataset));
  const result = () => plain(context.getFilteredStoreRecords());
  return { context, state, nodes, node, click, result, event, messages, dragAdapters, storage, frames, collapse: () => collapse };
}

test('store filters retain the full directory and original six totals, independently of visit demo coverage', () => {
  const h = setup(); h.context.renderStoreOverview();
  const records = h.result();
  assert.equal(records.length, h.state.records.filter(record => record.bindings >= 1).length);
  assert.ok(records.length > h.context.window.AIQCLinkedDemo.stores.length);
  assert.equal(h.node('storeMetricStoreCount').textContent, records.length.toLocaleString('zh-CN'));
  assert.equal(h.node('storeMetricBindingCount').textContent, records.reduce((sum, r) => sum+r.bindings,0).toLocaleString('zh-CN'));
  assert.equal(h.node('storeMetricBindingRate').textContent, '100.0%');
  assert.equal(h.state.view.startDate, h.context.getStoreRelativeDateValue(-1));
});

test('the actual renderer exposes four independent multi-selects and the shared dimension paths', () => {
  const h = setup(); h.context.renderStoreOrganizationFilters();
  assert.match(h.node('storeDimensionSwitcher').innerHTML, /组织维度/);
  assert.match(h.node('storeDimensionSwitcher').innerHTML, /地理维度/);
  const before = h.node('storeDimensionFilters').innerHTML;
  for (const key of ['brand','region','zone','store']) assert.match(before, new RegExp(`data-store-select-trigger="${key}"`));
  assert.doesNotMatch(before, /全部组织|store-org-path/);
  h.click({ storeDimension: 'geography' });
  const after = h.node('storeDimensionFilters').innerHTML;
  for (const key of ['brand','province','city','store']) assert.match(after, new RegExp(`data-store-select-trigger="${key}"`));
  assert.doesNotMatch(after, /data-store-select-trigger="(?:region|zone)"/);
  assert.match(h.node('storePersonnelFilters').innerHTML, /data-store-select-trigger="advisor"/);
});

test('multi-select applies immediately with OR within fields and AND across fields; menu order and scroll stay put', () => {
  const h = setup(), stores = h.state.model.options('store').filter(option => h.state.records.some(item => item.code === option.meta && item.bindings > 0));
  h.click({ storeSelectTrigger: 'store' }); h.node('options').scrollTop = 180;
  for (const option of stores.slice(0,2)) h.click({ storeSelectKey:'store', storeSelectValue:option.value });
  assert.equal(h.result().length,2); assert.equal(h.state.menu.openMenu,'store'); assert.equal(h.node('options').scrollTop,180);
  assert.equal(h.state.menu.pinnedIds.size,0);
  const chosen = h.result()[0];
  h.state.model.set('brand',[filters.organizationRecord(chosen.dealer).brandId]); h.context.updateStoreResults();
  assert.ok(h.result().every(item=>item.brand===chosen.brand));
  assert.equal(h.state.view.page,1);
});

test('search and select-all operate on visible candidates without replacing existing selections', () => {
  const h = setup(); h.click({storeSelectTrigger:'store'});
  const candidate = h.state.model.options('store')[0];
  h.context.updateStoreFilterSearch({value:candidate.meta,selectionStart:0,selectionEnd:0});
  const visible = plain(h.context.getStoreSelectCandidates('store'));
  assert.ok(visible.length > 0 && visible.every(item=>item.search.includes(candidate.meta)));
  h.click({storeSelectAll:'store'});
  assert.deepEqual(plain(h.state.model.applied.store).sort(), visible.map(item=>item.value).sort());
  h.click({storeSelectAll:'store'}); assert.deepEqual(plain(h.state.model.applied.store),[]);
});

test('dimension switches clear path and store choices, keep common brand and personnel, and refresh pagination', () => {
  const h = setup(), record = h.state.advisors[0];
  for (const key of ['brand','region','zone','store','advisor']) h.state.model.set(key,[record[filters.fields[key].idKey]]);
  h.context.updateStoreResults(); h.state.view.page=4;
  h.click({storeDimension:'geography'});
  assert.equal(h.state.model.applied.dimensionMode,'geography');
  for (const key of ['region','zone','store']) assert.deepEqual(plain(h.state.model.applied[key]),[]);
  assert.deepEqual(plain(h.state.model.applied.advisor),[record.advisorKey]);
  assert.deepEqual(plain(h.state.model.applied.brand),[record.brandId]);
  assert.equal(h.state.view.page,1);
});

test('advisor selections count only selected people, allow more than one, and use source IDs', () => {
  const h = setup(), group = h.state.records.find(item=>item.dealer.advisors.length>=3);
  const scope = filters.organizationRecord(group.dealer);
  const people = h.state.advisors.filter(record=>record.storeId===scope.storeId).slice(0,2);
  h.state.model.set('advisor',people.map(person=>person.advisorKey)); h.context.updateStoreResults();
  assert.equal(h.result().length,1);
  for (const key of ['bindings','employees','boundEmployees','badges']) assert.equal(h.result()[0][key],2);
  assert.ok(people.every(person=>person.advisorKey===person.advisorId));
  assert.equal(h.node('storeMetricBindingCount').textContent,'2');
});

test('geography candidates remain independent, and incompatible cross-dimension personnel yield zero without silently clearing', () => {
  const h = setup(), model=h.state.model;
  const all = model.options('province').map(item=>item.value);
  const record=h.state.advisors.find(item=>item.patrolerId);
  model.set('brand',[record.brandId]);
  assert.deepEqual(model.options('province').map(item=>item.value),all);
  model.set('patroler',[record.patrolerId]);
  const other=h.state.advisors.find(item=>item.patrolerId && item.patrolerId!==record.patrolerId && item.brandId!==record.brandId);
  model.set('advisor',[other.advisorKey]); h.context.updateStoreResults();
  assert.equal(h.result().length,0); assert.equal(h.node('storeMetricStoreCount').textContent,'0');
  assert.deepEqual(plain(model.applied.advisor),[other.advisorKey]);
});

test('date selection remains a draft until apply; reset restores yesterday and the organization dimension', () => {
  const h = setup(), original=h.state.view.startDate;
  h.click({storeTimeTrigger:''}); h.click({storeDateValue:'2026-10-01'}); h.click({storeDateValue:'2026-10-03'});
  assert.equal(h.state.view.startDate,original);
  h.click({storeDateApply:''}); assert.equal(h.state.view.startDate,'2026-10-01'); assert.equal(h.state.view.endDate,'2026-10-03');
  h.click({storeDimension:'geography'}); h.click({storeFilterReset:''});
  assert.equal(h.state.model.applied.dimensionMode,'organization');
  assert.equal(h.state.view.startDate,original); assert.equal(h.state.view.endDate,original);
  assert.ok(Object.keys(filters.fields).every(key=>h.state.model.applied[key].length===0));
});

test('expand uses the same shared collapse controller and Escape restores menu trigger focus', () => {
  const h = setup(); h.click({storeAdvancedToggle:''});
  assert.equal(h.collapse().value,false); assert.equal(h.collapse().options.extraId,'storeAdvancedFilters');
  h.click({storeSelectTrigger:'brand'});
  const event=h.event({},'Escape'); h.context.handleStoreFilterKeydown(event);
  assert.ok(event.prevented); assert.ok(!h.state.menu.openMenu);
  assert.equal(h.context.document.activeElement,h.node('[data-store-select-trigger="brand"]'));
});


test('overview export follows all applied results and sorting across pages, then narrows to selected advisors', () => {
  const h=setup(), c=h.context;
  h.state.view.sortKey='bindings'; h.state.view.sortDirection='desc'; h.state.view.page=2;
  let input=c.getDeviceListExportRequest('stores'), records=h.result();
  assert.ok(input.rows.length>h.state.view.pageSize);
  assert.deepEqual(plain(input.rows.map(row=>row[3])),records.map(item=>item.name));
  const person=h.state.advisors.find(item=>h.state.records.some(store=>store.code===item.storeCode));
  h.state.model.set('advisor',[person.advisorKey]); h.context.updateStoreResults();
  input=c.getDeviceListExportRequest('stores'); records=h.result();
  assert.equal(input.rows.length,1); assert.equal(input.rows[0][5],1); assert.equal(input.rows[0][7],1);
  assert.ok(input.filters.some(item=>item.label==='顾问' && item.value===person.advisor));
});

const storeFields = require('../device-management/store-field-settings.js');
test('store field settings default to the existing ten data columns and normalize stale keys without losing custom order', () => {
  const defaults=storeFields.createDefaultSettings();
  assert.equal(storeFields.fields.length,10); assert.equal(defaults.visible.length,10);
  assert.equal(storeFields.storageKey,'aiqc-device-store-field-settings-v1');
  const custom={order:[...defaults.order].reverse(),visible:['store','brand','obsolete','store']};
  const normalized=storeFields.normalizeSettings(custom);
  assert.deepEqual(normalized.order,custom.order); assert.deepEqual(normalized.visible,['store','brand']);
  assert.ok(!normalized.visible.includes('obsolete'));
  assert.deepEqual(storeFields.normalizeSettings(null),defaults);
});

test('opening and cancelling fields discards draft visibility/order and restores focus without persisting', () => {
  const h=setup(), c=h.context, before=plain(h.state.settings), trigger=h.node('trigger');
  c.openStoreFieldSettings(trigger); h.frames.shift()();
  assert.equal(h.node('storeFieldSettingsDrawer').getAttribute('aria-hidden'),'false');
  assert.equal(trigger.getAttribute('aria-expanded'),'true');
  c.handleStoreFieldSettingsChange(h.event({storeFieldSettingsCheck:'brand'}));
  h.dragAdapters[0].onOrderChange([...h.state.draft.order].reverse());
  assert.deepEqual(plain(h.state.settings),before);
  c.closeStoreFieldSettings(); assert.equal(h.state.draft,null); assert.deepEqual(plain(h.state.settings),before);
  assert.equal(h.storage.size,0); assert.equal(c.document.activeElement,trigger);
  assert.equal(h.node('storeFieldSettingsDrawer').inert,true);
});

test('saved field order drives header, body and full export together while actions and six totals remain', () => {
  const h=setup(), c=h.context; c.renderStoreOverview(); const total=h.node('storeMetricStoreCount').textContent;
  c.openStoreFieldSettings();
  h.state.draft.visible=['store','bindingRate','brand'];
  h.dragAdapters[0].onOrderChange(['bindingRate','store','brand',...h.state.draft.order.filter(key=>!['bindingRate','store','brand'].includes(key))]);
  c.saveStoreFieldSettings();
  const head=h.node('storeOverviewTableHeadRow').innerHTML, body=h.node('storeOverviewTableBody').innerHTML;
  assert.ok(head.indexOf('bindingRate')<head.indexOf('store"')); assert.ok(head.indexOf('store"')<head.indexOf('brand'));
  assert.ok(!head.includes('syncedAt')); assert.ok(body.includes('data-store-drilldown'));
  assert.equal((head.match(/<th\b/g)||[]).length,4);
  const input=c.getDeviceListExportRequest('stores');
  assert.deepEqual(plain(input.columns.map(field=>field.label)),['工牌绑定率','门店名称','品牌']);
  assert.equal(input.rows.length,h.result().length); assert.equal(input.rows[0].length,3);
  assert.equal(h.node('storeMetricStoreCount').textContent,total);
  const stored=JSON.parse(h.storage.get(storeFields.storageKey));
  const reloaded=setup({storedSettings:stored}); reloaded.context.renderStoreOverview();
  assert.deepEqual(plain(reloaded.context.getVisibleStoreFields().map(field=>field.key)),['bindingRate','store','brand']);
});

test('saving hidden organization columns clears only corresponding filters and a hidden sort', () => {
  const h=setup(), c=h.context, person=h.state.advisors[0];
  for (const key of ['brand','region','zone','store','advisor']) h.state.model.set(key,[person[filters.fields[key].idKey]]);
  c.updateStoreResults(); h.state.view.sortKey='bindings';
  c.openStoreFieldSettings(); h.state.draft.visible=['badgeAssets','employees','boundEmployees','syncedAt']; c.saveStoreFieldSettings();
  for(const key of ['brand','region','zone','store']) assert.deepEqual(plain(h.state.model.applied[key]),[]);
  assert.deepEqual(plain(h.state.model.applied.advisor),[person.advisorKey]);
  assert.equal(h.state.view.sortKey,''); assert.equal(h.state.view.page,1);
  assert.ok(!h.node('storeDimensionFilters').innerHTML.includes('data-store-select-trigger'));
  assert.ok(h.node('storePersonnelFilters').innerHTML.includes('data-store-select-trigger="advisor"'));
  h.click({storeDimension:'geography'});
  assert.ok(h.node('storeDimensionFilters').innerHTML.includes('data-store-select-trigger="province"'));
  assert.ok(h.node('storeDimensionFilters').innerHTML.includes('data-store-select-trigger="city"'));
});

test('restore defaults and select-all change only drafts; empty save is blocked until a field is selected', () => {
  const h=setup(),c=h.context;c.openStoreFieldSettings();
  c.handleStoreFieldSettingsClick(h.event({storeFieldSettingsSelectAll:''})); c.saveStoreFieldSettings();
  assert.equal(h.state.draft.visible.length,0); assert.equal(h.state.settings.visible.length,10);
  assert.equal(h.messages.at(-1),'至少保留一个字段'); assert.equal(h.storage.size,0);
  const event=h.event({storeFieldSettingsCheck:'employees'});event.target.checked=true;
  c.handleStoreFieldSettingsChange(event);c.saveStoreFieldSettings();assert.equal(h.state.settings.visible.length,1);
  c.openStoreFieldSettings();c.handleStoreFieldSettingsClick(h.event({storeFieldSettingsRestore:''}));
  assert.equal(h.state.draft.visible.length,10);assert.equal(h.state.settings.visible.length,1);
  c.closeStoreFieldSettings();assert.equal(h.state.settings.visible.length,1);
});

test('empty results use the configured column span and a compact table width, with no lost settings on storage failure', () => {
  const h=setup({storageThrows:true}),c=h.context;c.openStoreFieldSettings();h.state.draft.visible=['store'];c.saveStoreFieldSettings();
  assert.equal(h.state.settings.visible.length,1);
  const first=h.state.advisors[0],other=h.state.advisors.find(person=>person.provinceId!==first.provinceId);
  h.state.model.setDimension('geography');
  h.state.model.set('advisor',[first.advisorKey]);h.state.model.set('province',[other.provinceId]);
  h.state.model.apply();c.renderStoreOverview();
  assert.equal(h.result().length,0);assert.ok(h.node('storeOverviewTableBody').innerHTML.includes('colspan="2"'));
  assert.equal(h.node('time-root').style.minWidth,'360px');
});

test('Escape cancels fields before page shortcuts and Tab stays inside the drawer', () => {
  const h=setup(),c=h.context,trigger=h.node('trigger');c.openStoreFieldSettings(trigger);
  const first=h.node('first'),last=h.node('last');
  h.node('storeFieldSettingsDrawer').querySelectorAll=()=>[first,last];
  h.node('storeFieldSettingsDrawer').contains=element=>[first,last].includes(element);
  c.document.activeElement=last;
  const tab=h.event({},'Tab');c.handleStoreFieldSettingsKeydown(tab);assert.ok(tab.prevented);assert.equal(c.document.activeElement,first);
  const escape=h.event({},'Escape');assert.equal(c.handleStoreFieldSettingsKeydown(escape),true);assert.ok(escape.prevented);
  assert.equal(h.state.draft,null);assert.equal(c.document.activeElement,trigger);
});


test('shared source mode reconciles assets and bindings and rejects unavailable historical snapshots', () => {
  const h = setup({unified:true});
  h.context.renderStoreOverview();
  const rows=h.result();
  assert.equal(rows.length,142);
  assert.equal(rows.reduce((n,r)=>n+r.badges,0),620);
  assert.equal(rows.reduce((n,r)=>n+r.bindings,0),610);
  assert.equal(h.node('storeMetricBindingCount').textContent,'610');
  assert.equal(h.node('storeMetricBindingRate').textContent,'98.4%');
  h.state.view.startDate='2025-01-01';h.state.view.endDate='2025-01-02';
  assert.equal(h.result().length,0);
});
