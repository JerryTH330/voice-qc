const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function dataContext(search = '', today) {
  const context = vm.createContext({ window: { location: { search } }, URLSearchParams, console,
    ...(today ? { Date: class extends Date { constructor(...args) { super(...(args.length ? args : [today])); } } } : {}) });
  for (const file of ['leads/organization-data.js', 'shared/organization-directory.js', 'device-management/organization-data.js', 'session/real-recording-data.js', 'leads/real-lead-data.js', 'shared/linked-demo-data.js']) vm.runInContext(read(file), context, { filename: file });
  return context;
}
const plain = value => JSON.parse(JSON.stringify(value));
function fn(source, name, indentation = '  ') {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf(`\n${indentation}}`, start) + indentation.length + 2);
}
function listContext(kind, search = '') {
  const context = dataContext(search);
  const source = read(kind === 'session' ? 'session/session-real-runtime.js' : 'leads/leads-modern-runtime.js');
  const stop = kind === 'session' ? '  var lastRenderedOpenMenu' : '  var columnSettings';
  const functions = kind === 'session'
    ? ['selected', 'matchesSelection', 'dealerMatches', 'matchesCarSeries', 'matchesLeadCarSeries', 'carSeriesOptionValue', 'recordMatches']
    : ['normalizedQuery', 'selected', 'matchesValues', 'recordMatchesOrganization', 'recordFieldValue', 'staffValue', 'storeValue', 'filteredLeadRecords'];
  const prefix = source.slice(0, source.indexOf(stop));
  const expose = kind === 'session' ? '({ records, state, matches: recordMatches })' : '({ records, states, filter: filteredLeadRecords, advisorValue })';
  vm.runInContext(prefix + '\n' + functions.map(name => fn(source, name)).join('\n') + `\n global.testList = ${expose};\n})(window);`, context);
  return context.window;
}

test('shared samples cover exactly 50 real-directory stores and retain every legacy business ID and category', () => {
  const context = dataContext(), demo = context.window.AIQCLinkedDemo;
  assert.equal(demo.stores.length, 50);
  assert.equal(new Set(demo.stores.map(store => store.dealerWid)).size, 50);
  assert.equal(demo.legacyVisits.length, 1286);
  const original = read('device-management/page.js');
  const start = original.indexOf('const visitRecordTemplates = '), end = original.indexOf('\n];', start);
  vm.runInContext(original.slice(start, end + 3) + '\n' + fn(original, 'expandVisitRecordTemplates', '') + '\nwindow.originalVisits = expandVisitRecordTemplates(visitRecordTemplates);', context);
  assert.deepEqual(plain(demo.legacyVisits.map(record => [record.businessId, record.status])), plain(context.window.originalVisits.map(record => [record.businessId, record.status])));
  assert.equal(demo.legacyVisits.filter(record => record.status === '已匹配').length, 1185);
  const counts = demo.stores.map(store => demo.visits.filter(visit => visit.storeCode === store.dealerCode && visit.brand === store.brand).length);
  assert.ok(new Set(counts).size > 20);
  assert.equal(new Set(demo.stores.map(store => store.brand)).size, 2);
  assert.ok(new Set(demo.stores.map(store => store.area)).size >= 6);
  assert.ok(new Set(demo.stores.map(store => store.province)).size >= 10);
});

test('all visits resolve exact leads, optional recordings and badges without borrowing original identities', () => {
  const { AIQCLinkedDemo: demo, AIQCOrganization: original, __LEADS_REAL_DATA: rawLeads, __SESSION_REAL_RECORDING_DATA: rawAudio } = dataContext().window;
  for (const [records, key] of [[demo.visits, 'businessId'], [demo.leads, 'id'], [demo.recordings, 'audioId'], [demo.badges, 'sn']]) assert.equal(new Set(records.map(record => record[key])).size, records.length);
  const oldSn = new Set(original.badges.map(badge => badge.sn)), oldAdvisor = new Set(original.advisors.map(advisor => advisor.advisorId));
  assert.ok(demo.badges.every(badge => !oldSn.has(badge.sn) && !oldAdvisor.has(badge.advisorId)));
  const leadIds = new Set(rawLeads.map(record => record.id)), audioIds = new Set(rawAudio.rows.map(record => record[0]));
  assert.ok(demo.leads.every(lead => !leadIds.has(lead.id)));
  assert.ok(demo.recordings.every(record => !audioIds.has(record.audioId)));
  for (const visit of demo.visits) {
    const lead = demo.getLead(visit.leadId);
    for (const key of ['storeId', 'brand', 'province', 'city', 'storeCode', 'advisorId', 'customerName', 'customerPhone', 'businessId']) assert.equal(lead[key], visit[key], `${visit.businessId} ${key}`);
    assert.equal(lead.leadDate, visit.date);
    if (visit.badgeSn) {
      const badge = demo.getBadge(visit.badgeSn);
      assert.equal(badge.storeId, visit.storeId); assert.equal(badge.advisorId, visit.advisorId);
      assert.equal(badge.advisorPhone, lead.advisorPhone);
      assert.ok(demo.events.some(event => event.sn === badge.sn && event.date === visit.date));
    }
    if (visit.recordingId) {
      const audio = demo.getRecording(visit.recordingId);
      assert.equal(audio.leadId, lead.id); assert.equal(audio.businessId, visit.businessId);
      assert.equal(audio.advisorId, visit.advisorId); assert.equal(audio.startTime, `${visit.date} ${visit.startTime}`);
      assert.deepEqual(plain(lead.recordingIds), [audio.audioId]);
      const upload = demo.uploads.find(item => item.businessId === visit.businessId);
      assert.equal(upload.recordingId, audio.audioId); assert.equal(upload.sn, visit.badgeSn);
      if (visit.status !== '录音上传中') assert.equal(upload.status, '已上传');
      assert.equal(audio.status, visit.audioStatus);
      if (audio.status !== '已完成') { assert.equal(audio.carSeries, '—'); assert.equal(audio.intentLevel, '—'); assert.equal(audio.qualifiedRate, '—'); }
      assert.ok(audio.transcript.every(segment => segment.time >= 0 && segment.time < audio.durationMs / 1000));
    } else assert.equal(lead.recordingCount, 0);
  }
});

test('recording and lead runtimes append shared data while preserving raw sources and default dates', () => {
  const session = listContext('session');
  assert.equal(session.testList.records.length, session.__SESSION_REAL_RECORDING_DATA.rows.length + session.AIQCLinkedDemo.recordings.length);
  assert.equal(session.testList.state.startDate, '2026-08-27'); assert.equal(session.testList.state.endDate, '2026-09-07');
  const leads = listContext('leads');
  assert.equal(leads.testList.records.length, leads.__LEADS_REAL_DATA.length + leads.AIQCLinkedDemo.leads.length);
  assert.equal(leads.testList.states.leads.startDate, '2026-09-10');
  for (const lead of leads.AIQCLinkedDemo.leads) {
    const actual = leads.testList.records.find(record => record.id === lead.id);
    assert.equal(actual.advisorId, lead.advisorId); assert.equal(actual.arrivalTime, lead.arrivalTime);
    assert.equal(actual.leadIssuedAt, lead.leadIssuedAt); assert.equal(actual.testDriveTime, lead.testDriveTime);
    assert.equal(leads.testList.advisorValue(actual), lead.advisorId);
  }
});

test('linked list navigation supplies matching dates and uses exact IDs even for prefix-related legacy copies', () => {
  const demo = dataContext().window.AIQCLinkedDemo;
  for (const id of ['REC-20260812-0136', demo.recordings.find(record => record.status === '录音上传中').audioId]) {
    const url = new URL(demo.listUrl('recording', id), 'https://local.test/device-management/index.html');
    const session = listContext('session', url.search);
    const matches = session.testList.records.filter(record => session.testList.matches(record));
    assert.deepEqual(plain(matches.map(record => record.audioId)), [id]);
    assert.equal(session.testList.state.startDate, demo.getRecording(id).startTime.slice(0, 10));
  }
  const leadId = demo.visits[0].leadId, url = new URL(demo.listUrl('lead', leadId), 'https://local.test/device-management/index.html');
  const leads = listContext('leads', url.search);
  assert.deepEqual(plain(leads.testList.filter(leads.testList.states.leads).map(record => record.id)), [leadId]);
});

test('demo details synchronize duration, transcript, intent, journey and reciprocal links', () => {
  const demo = dataContext().window.AIQCLinkedDemo;
  const nodes = new Map();
  const host = { querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, { textContent: '', innerHTML: '' }); return nodes.get(selector); } };
  for (const record of [demo.recordings[0], demo.recordings.find(record => record.status === '模型分析中')]) {
    const player = {};
    demo.applyRecordingDetail(record, host, player);
    assert.equal(player.duration, record.durationMs / 1000); assert.equal(player.currentTime, 0);
    assert.ok(nodes.get('#sessionDetailStore').textContent.includes(record.store));
    assert.ok(nodes.get('#sessionDetailContextPill').textContent.includes(record.customerName));
    const transcript = nodes.get('#sessionAiTranscriptPanel .transcript-list').innerHTML;
    assert.equal((transcript.match(/data-session-transcript-time=/g) || []).length, record.transcript.length);
    assert.ok(nodes.get('.session-detail-actions-main').innerHTML.includes(record.leadId));
    const lead = demo.getLead(record.leadId), payload = demo.buildLeadPayload(lead);
    assert.equal(payload.leadId, lead.id); assert.equal(payload.intentLevel, lead.intentLevel);
    assert.equal(payload.evolutionSteps[0].recordingId, record.audioId);
    demo.renderLeadJourney(payload, host);
    assert.ok(nodes.get('.lead-journey-scroll').innerHTML.includes(record.audioId));
    assert.ok(nodes.get('.lead-journey-scroll').innerHTML.includes(record.businessId));
    assert.ok(nodes.get('.lead-detail-back-button').outerHTML.includes(lead.id));
    assert.ok(!nodes.get('.lead-journey-scroll').innerHTML.includes('2026-03'));
  }
  const noAudio = demo.leads.find(lead => !lead.recordingIds.length);
  demo.renderLeadJourney(demo.buildLeadPayload(noAudio), host);
  assert.ok(!nodes.get('.lead-journey-scroll').innerHTML.includes('data-lead-session-link'));
  const malicious = { ...demo.recordings[0], customerName: '<img src=x onerror=1>' };
  demo.applyRecordingDetail(malicious, host, {});
  assert.ok(!nodes.get('.session-ai-intention-list').innerHTML.includes('<img src=x'));
});

test('extended badge organization includes new stores while keeping original directory and SN ownership intact', () => {
  const global = dataContext().window, base = global.AIQCOrganization;
  const before = JSON.stringify(base);
  const view = global.AIQCLinkedDemo.buildOrganizationView(base);
  assert.equal(JSON.stringify(base), before);
  assert.equal(base.badges[0].sn, 'MN-BDG-004821');
  for (const store of global.AIQCLinkedDemo.stores) {
    const path = base.getDealerPath(store, 'region');
    assert.ok(view.findNode(path));
    assert.ok(view.getColumns(path).some(nodes => nodes.some(node => node.path === path)));
  }
});

test('device association route selects one visit or one badge and carries its date without changing field settings', () => {
  const context = dataContext(), demo = context.window.AIQCLinkedDemo, source = read('device-management/page.js');
  const filters = require('../device-management/visit-organization-filter.js');
  const visitModel = filters.createModel(context.window.__DEVICE_ORGANIZATION_DEALERS, demo.visits);
  const selected = demo.visits[0], fieldSettings = { order: ['customerName', 'businessId'], visible: ['customerName'] };
  const capture = [];
  const drawerAttributes = {};
  let activeTab;
  Object.assign(context.window, { clearTimeout() {}, requestAnimationFrame(callback) { callback(); } });
  Object.assign(context, {
    visitOrganizationModel: visitModel, visitFilterState: {}, visitPaginationState: { page: 5 }, visitMatchingFilterKeys: new Set(),
    visitFieldSettingsState: fieldSettings, badgeFilterState: {}, badgeEventFilterState: {}, badgeUploadFilterState: {},
    document: { querySelector() { return null; } },
    getVisitDefaultFilters() { return { source: [], status: [], leadId: '', recordingId: '', customerKeyword: '' }; },
    syncVisitDateDraft() {}, renderVisitOrganizationFilters() {}, renderVisits() {}, renderBadgePage() {},
    selectBadgeRecord(sn, advisorName) { if (sn) capture.push([sn, advisorName]); },
    badgeRecordDrawer: { inert: true, setAttribute(key, value) { drawerAttributes[key] = value; }, classList: { add() {} }, querySelector() { return { focus() {} }; } },
    badgeRecordDrawerBackdrop: { hidden: true }, badgeRecordDrawerContentHost: {}, badgeRecordDrawerCloseTimer: null,
    badgeRecordDrawerTrigger: null, badgeRecordDrawerTitle: {}, badgeRecordDrawerSubtitle: {},
    setBadgeRecordDrawerMode() {}, moveBadgeRecordContents() {}, syncBadgeRecordTabs(tab) { activeTab = tab; }, syncBodyScrollLock() {},
    syncBadgeEventDateView() {}, syncBadgeUploadDateDraft() {}, renderBadgeEventFilters() {}, renderBadgeUploadFilters() {}, renderBadgeEvents() {}, renderBadgeUploads() {}
  });
  vm.runInContext(fn(source, 'applyLinkedDemoRoute', ''), context);
  vm.runInContext(fn(source, 'openBadgeRecordDrawer', ''), context);
  context.applyLinkedDemoRoute({ route: 'visits', params: new URLSearchParams({ businessId: selected.businessId }) });
  assert.equal(context.visitFilterState.businessId, selected.businessId);
  assert.equal(context.visitFilterState.startDate, selected.date);
  assert.equal(context.visitFilterState.endDate, selected.date);
  assert.ok(context.visitMatchingFilterKeys.has('businessId'));
  assert.ok(context.visitMatchingFilterKeys.has('time'));
  assert.equal(context.visitPaginationState.page, 1);
  assert.deepEqual(fieldSettings, { order: ['customerName', 'businessId'], visible: ['customerName'] });
  const badgeLink = new URL(demo.badgeUrl(selected.badgeSn, selected.date), 'https://local.test/leads/index.html');
  const params = new URLSearchParams(badgeLink.hash.split('?')[1]);
  context.applyLinkedDemoRoute({ route: 'store-badges', params });
  assert.equal(context.badgeFilterState.snQuery, selected.badgeSn);
  assert.equal(context.badgeEventFilterState.date, selected.date);
  assert.equal(context.badgeUploadFilterState.startDate, selected.date);
  assert.equal(context.badgeUploadFilterState.endDate, selected.date);
  assert.deepEqual(capture[0], [selected.badgeSn, selected.advisor]);
  assert.equal(activeTab, 'events');
  assert.equal(context.badgeRecordDrawer.inert, false);
  assert.equal(context.badgeRecordDrawerBackdrop.hidden, false);
  assert.equal(drawerAttributes['aria-hidden'], 'false');
  assert.equal(context.badgeRecordDrawerTrigger, null);
  const trigger = { dataset: { badgeSn: selected.badgeSn, advisorName: selected.advisor } };
  context.document.querySelector = () => trigger;
  context.applyLinkedDemoRoute({ route: 'store-badges', params });
  assert.equal(context.badgeRecordDrawerTrigger, trigger);
  assert.deepEqual(capture.at(-1), [selected.badgeSn, selected.advisor]);
});

test('each visit matching drawer uses its own upload evidence rather than all same-day advisor fragments', () => {
  const context = dataContext(), demo = context.window.AIQCLinkedDemo, source = read('device-management/page.js');
  const nodes = new Map();
  context.document = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, {}); return nodes.get(id); } };
  Object.assign(context, { badgeUploadRecords: demo.uploads, badgeUploadModalState: {}, badgeUploadModalPaginationState: { page: 10 },
    getVisitStatusClass: () => 'success', renderBadgeUploadModal() {} });
  vm.runInContext(fn(source, 'getVisitFailedUploadMessage', '') + '\n' + fn(source, 'getBadgeUploadMatchTime', '') + '\n' + fn(source, 'renderVisitUploadDetail', ''), context);
  for (const record of [demo.visits[0], demo.visits.find(visit => visit.status === '录音上传中'), demo.visits.find(visit => visit.status === '匹配失败')]) {
    context.renderVisitUploadDetail(record);
    const rows = context.badgeUploadModalState.records;
    const expected = record.status === '匹配失败' ? [] : demo.uploads.filter(item => item.businessId === record.businessId && item.status === (record.status === '录音上传中' ? '未上传' : '已上传'));
    assert.equal(rows.length, expected.length);
    assert.ok(rows.every(row => row.businessId === record.businessId && row.sn === record.badgeSn));
    assert.deepEqual(plain(rows.map(row => row.sequence)), plain(expected.map(row => row.sequence)));
    assert.ok(rows.every(row => row.duration <= '00:05:00'));
    if (record.status === '录音上传中') assert.equal(nodes.get('visitUploadListDescription').textContent, `共 ${expected.length} 条未上传录音`);
    if (record.status === '已匹配') assert.equal(context.getBadgeUploadMatchTime(rows[0]), `${record.date} ${record.completedAt}`);
  }
});

test('demo visits fill all seven local calendar days and linked evidence follows the same date', () => {
  for (const [today, first, last] of [
    ['2026-10-13T12:00:00', '2026-10-07', '2026-10-13'],
    ['2027-01-03T12:00:00', '2026-12-28', '2027-01-03'],
    ['2028-03-03T12:00:00', '2028-02-26', '2028-03-03']
  ]) {
    const demo = dataContext('', today).window.AIQCLinkedDemo;
    assert.deepEqual(plain(demo.dateRange), { startDate: first, endDate: last });
    assert.equal(demo.visits.length, 3615);
    assert.equal(new Set(demo.visits.map(visit => visit.date)).size, 7);
    assert.ok(demo.visits.every(visit => visit.date >= first && visit.date <= last));
    for (const visit of demo.visits) {
      const lead = demo.getLead(visit.leadId);
      assert.equal(lead.leadDate, visit.date);
      assert.equal(lead.arrivalTime, `${visit.date} ${visit.startTime}`);
      assert.equal(demo.buildLeadPayload(lead).evolutionSteps[0].time, lead.arrivalTime);
      if (visit.recordingId) {
        const audio = demo.getRecording(visit.recordingId);
        const upload = demo.uploads.find(item => item.businessId === visit.businessId);
        assert.equal(audio.startTime, lead.arrivalTime);
        assert.equal(audio.uploadTime, `${visit.date} ${visit.updatedAt}`);
        assert.equal(upload.date, visit.date);
        if (upload.status === '已上传') assert.equal(upload.completedAt.slice(0, 10), visit.date);
      }
      if (visit.badgeSn) assert.ok(demo.events.some(item => item.date === visit.date && item.sn === visit.badgeSn));
      const url = new URL(demo.listUrl('visit', visit.businessId), 'https://local.test');
      assert.equal(new URLSearchParams(url.hash.split('?')[1]).get('date'), visit.date);
    }
    assert.ok(demo.badges.every(badge => badge.queryDate === last && badge.syncedAt.slice(0, 10) === last));
  }
});

test('moving the demo calendar retains all identities, visit times and status totals across days', () => {
  const before = dataContext('', '2026-10-13T12:00:00').window.AIQCLinkedDemo;
  const after = dataContext('', '2026-10-14T12:00:00').window.AIQCLinkedDemo;
  const stable = demo => plain(demo.visits.map(({ date, ...visit }) => visit));
  assert.deepEqual(stable(after), stable(before));
  assert.equal(after.dateRange.endDate, '2026-10-14');
  for (let index = 0; index < before.visits.length; index++) {
    const nextDate = new Date(`${before.visits[index].date}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);
    assert.equal(after.visits[index].date, `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`);
  }
  const counts = ['已匹配', '录音上传中', '待匹配', '匹配失败', '无录音'].map(status => after.visits.filter(visit => visit.status === status).length);
  assert.equal(counts[0], 3036);
  assert.equal(counts.slice(1, 3).reduce((sum, count) => sum + count, 0), 308);
  assert.equal(counts.slice(3).reduce((sum, count) => sum + count, 0), 271);
});


test('raw upload fragments cover each recording in contiguous five-minute pieces with unique identities', () => {
  const demo = dataContext().window.AIQCLinkedDemo;
  const seconds = time => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  assert.equal(new Set(demo.uploads.map(row => row.fragmentId)).size, demo.uploads.length);
  for (const recording of demo.recordings) {
    const visit = demo.getVisit(recording.businessId);
    const rows = demo.uploads.filter(row => row.businessId === visit.businessId);
    assert.equal(rows.length, Math.ceil(recording.durationMs / 300000));
    let cursor = seconds(visit.startTime), total = 0;
    rows.forEach((row, index) => {
      const [start, end] = row.audioTime.split('—').map(seconds);
      const duration = seconds(row.duration);
      assert.equal(start, cursor); assert.equal(end - start, duration);
      assert.ok(duration > 0 && duration <= 300);
      if (index < rows.length - 1) assert.equal(duration, 300);
      assert.equal(row.sequence, String(index + 1));
      assert.equal(row.recordingId, recording.audioId);
      assert.equal(row.completedAt === '未上传', row.status === '未上传');
      cursor = end; total += duration;
    });
    assert.equal(cursor, seconds(visit.endTime));
    assert.equal(total * 1000, recording.durationMs);
    if (visit.status === '已匹配') assert.equal(visit.detailText, `已匹配完成${rows.length}段录音`);
  }
  const first = demo.uploads.filter(row => row.businessId === demo.visits[0].businessId);
  assert.deepEqual(plain(first.map(row => row.duration)), ['00:05:00', '00:05:00', '00:05:00', '00:05:00', '00:04:00']);
});

test('pending demos cover both partial and absent uploads and badge counts count actual pending fragments', () => {
  const demo = dataContext().window.AIQCLinkedDemo;
  const pending = demo.visits.filter(visit => visit.status === '录音上传中');
  const groups = pending.map(visit => demo.uploads.filter(row => row.businessId === visit.businessId));
  assert.ok(groups.some(rows => rows.some(row => row.status === '已上传') && rows.some(row => row.status === '未上传')));
  assert.ok(groups.some(rows => rows.every(row => row.status === '未上传')));
  for (const badge of demo.badges) {
    assert.equal(badge.pendingUploads, demo.uploads.filter(row => row.sn === badge.sn && row.status === '未上传').length);
  }
});


test('visit matching has five statuses while linked audio retains unfinished transcription and analysis', () => {
  const demo = dataContext().window.AIQCLinkedDemo;
  assert.deepEqual([...new Set(demo.visits.map(visit => visit.status))].sort(), ['已匹配', '录音上传中', '待匹配', '匹配失败', '无录音'].sort());
  for (const [status, count] of [['录音转写中', 144], ['模型分析中', 141]]) {
    const audio = demo.recordings.filter(record => record.status === status);
    assert.equal(audio.length, count);
    for (const record of audio) {
      const visit = demo.getVisit(record.businessId), lead = demo.getLead(record.leadId);
      assert.equal(visit.status, '已匹配');
      assert.equal(record.visitStatus, '已匹配');
      assert.equal(visit.completedAt, visit.updatedAt);
      assert.match(visit.detailText, /^已匹配完成\d+段录音$/);
      assert.equal(record.intentLevel, '—'); assert.equal(record.qualifiedRate, '—');
      assert.equal(lead.intentLevel, '无法判断'); assert.equal(lead.aiLeadValidity, '分析中');
      assert.equal(lead.qcClueStatus, '待确认');
      const payload = demo.buildLeadPayload(lead);
      assert.deepEqual(plain(payload.models), ['—']);
      assert.ok(!payload.evidenceText.includes('录音已完成分析'));
      assert.ok(demo.uploads.filter(row => row.businessId === visit.businessId).every(row => row.status === '已上传'));
      if (status === '录音转写中') assert.equal(record.transcript.length, 0);
      else assert.ok(record.transcript.length > 0);
    }
  }
  assert.equal(demo.recordings.filter(record => record.status === '已完成').length, 2751);
});
