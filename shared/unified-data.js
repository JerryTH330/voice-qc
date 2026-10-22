/* Shared facts for lists, details and dashboards. */
(function (global) {
  'use strict';
  const data = global.__SESSION_REAL_RECORDING_DATA;
  if (!data || !global.__LEADS_REAL_DATA || !global.AIQCLinkedDemo) throw new Error('统一数据缺少基础数据源');
  const directory = global.__DEVICE_ORGANIZATION_DEALERS;
  const linked = global.AIQCLinkedDemo;
  const dealers = directory;
  const dealerMap = new Map(dealers.map(d => [d.brand + '::' + d.dealerCode, d]));
  const customerPhoneCache = new Map();
  function text(value) {
    return String(value == null ? '' : value);
  }
  function decodeSeriesLabel(value) {
    return text(value)
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function normalizeDigits(value) {
    return text(value).replace(/\D/g, '');
  }
  function getPersonnelCode(value) {
    var matched = text(value).match(/\|(?:patroler|governor):code:([^|]+)/);
    return matched ? matched[1] : '';
  }
  function maskName(value) {
    var chars = Array.from(text(value));
    if (!chars.length) return '—';
    if (chars.length === 1) return chars[0];
    if (chars.length === 2) return chars[0] + '*';
    return chars[0] + '*'.repeat(Math.max(1, chars.length - 2)) + chars[chars.length - 1];
  }
  function inferSourceType(audioId, source) {
    if (source === '工牌') return '实体卡';
    var digits = text(audioId).replace(/\D/g, '');
    var digitSum = Array.from(digits).reduce(function (sum, digit) {
      return sum + Number(digit);
    }, 0);
    return digitSum % 2 === 0 ? '虚拟号' : '工作号';
  }
  function maskPhone(value) {
    var digits = normalizeDigits(value);
    if (!digits) return '—';
    return digits.slice(0, 3) + '****' + digits.slice(-4);
  }
  function customerPhone(customerKey) {
    var key = text(customerKey);
    if (!key) return '—';
    if (!customerPhoneCache.has(key)) {
      customerPhoneCache.set(key, '139****' + key.slice(-4).padStart(4, '0'));
    }
    return customerPhoneCache.get(key);
  }
  function parseDate(value) {
    var parsed = Date.parse(text(value).replace(/-/g, '/'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function compareAudioId(left, right) {
    var a = text(left);
    var b = text(right);
    if (a.length !== b.length) return b.length - a.length;
    return b.localeCompare(a);
  }
  function formatDuration(milliseconds) {
    var seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var rest = seconds % 60;
    var pad = function (value) { return String(value).padStart(2, '0'); };
    if (hours > 0) return hours + ':' + pad(minutes) + ':' + pad(rest);
    return minutes + ':' + pad(rest);
  }
  function getDealer(key) {
    return dealerMap.get(text(key)) || {
      brand: '',
      dealerCode: '',
      dealerName: '—',
      area: '—',
      zone: '—',
      province: '—',
      city: '—',
      patroler: '',
      patrolerId: '',
      governor: '',
      governorId: ''
    };
  }
  function hydrateRecords() {
    var result = data.rows.map(function (row) {
      var dealerKey = Array.isArray(data.dealerKeys) ? data.dealerKeys[row[5]] : '';
      var dealer = getDealer(dealerKey && dealerKey[0] + '::' + dealerKey[1]);
      var advisorTuple = Array.isArray(data.advisors) ? data.advisors[row[6]] || [] : [];
      var customerTuple = Array.isArray(data.customers) ? data.customers[row[7]] || [] : [];
      var leadSeries = Array.isArray(data.series) ? decodeSeriesLabel(data.series[row[13]] || '未知') : '未知';
      var aiSeries = Array.isArray(data.series) && row[17] != null ? decodeSeriesLabel(data.series[row[17]] || '') : '';
      var scenario = Array.isArray(data.scenarios) ? (data.scenarios[row[14]] || '') : '';
      var source = Array.isArray(data.sources) ? (data.sources[row[15]] || '未知') : '未知';
      var clueSources = Array.isArray(data.clueSources) ? data.clueSources : [];
      function clueSourceAt(index) {
        var sourceIndex = row[index];
        return sourceIndex == null ? '' : (clueSources[sourceIndex] || '');
      }
      var leadSource = clueSourceAt(18);
      var secondSource = clueSourceAt(19);
      var thirdSource = clueSourceAt(20);
      var fourthSource = clueSourceAt(21);
      var leadBrand = Array.isArray(data.leadBrands) && row[22] != null ? (data.leadBrands[row[22]] || '') : '';
      var advisorId = text(advisorTuple[3]);
      var advisorName = text(advisorTuple[2]);
      var advisorPhone = maskPhone(advisorTuple[4]);
      var customerKey = text(customerTuple[0]);
      var customerName = text(customerTuple[1]);
      var status = Number(row[3]) === 1 ? '已完成' : '失败';
      if (status === '失败') {
        leadSeries = '—';
        aiSeries = '—';
      }
      var dealerKeyValue = dealerKey ? dealerKey[0] + '::' + dealerKey[1] : '';
      return {
        audioId: text(row[0]),
        startTime: text(row[1]),
        uploadTime: text(row[2]),
        status: status,
        durationMs: Number(row[4]) || 0,
        duration: formatDuration(row[4]),
        dealerKey: dealerKeyValue,
        dealer: dealer,
        brand: text(dealer.brand || (dealerKey && dealerKey[0])),
        province: text(dealer.province || '—'),
        city: text(dealer.city || '—'),
        dealerCode: text(dealer.dealerCode || (dealerKey && dealerKey[1])),
        store: text(dealer.dealerName || '—'),
        region: text(dealer.area || '—'),
        zone: text(dealer.zone || '—'),
        patrolerCode: getPersonnelCode(dealer.patrolerId) || '-',
        patroler: text(dealer.patroler || '—'),
        governor: text(dealer.governor || '—'),
        advisorKey: dealerKeyValue + '::' + advisorId,
        advisorId: advisorId || '—',
        advisorName: advisorName || '—',
        advisorPhone: advisorPhone,
        leadId: text(row[8]) || '—',
        leadBrand: leadBrand || '—',
        customerName: customerName || '—',
        customerNameMasked: maskName(customerName),
        customerPhone: text(customerTuple[2]) || customerPhone(customerKey),
        qualifiedRate: status === '失败' ? '—' : (text(row[11]) || '—'),
        intentLevel: status === '失败' ? '—' : (text(row[12]) || '无法判断'),
        carSeries: aiSeries || '—',
        leadCarSeries: leadSeries || '未知',
        scenario: scenario,
        source: source,
        leadSource: leadSource || '—',
        secondSource: secondSource || '—',
        thirdSource: thirdSource || '—',
        fourthSource: fourthSource || '—',
        sourceType: inferSourceType(row[0], source),
        endTime: text(row[16])
      };
    });
    return result.concat(global.AIQCLinkedDemo?.recordings || []).sort(function (left, right) {
      var uploadDiff = parseDate(right.uploadTime) - parseDate(left.uploadTime);
      return uploadDiff || compareAudioId(left.audioId, right.audioId);
    });
  }

  const storeKey = r => `${r.brand}::${r.dealerCode || r.storeCode}`;
  const org = dealer => {
    const brandId = `brand:${dealer.brand}`, regionId = `${brandId}|region:${dealer.area}`, provinceId = `province:${dealer.province}`;
    return { brand: dealer.brand, brandId, region: dealer.area, regionId, zone: dealer.zone,
      zoneId: `${regionId}|zone:${dealer.zone}`, province: dealer.province, provinceId, city: dealer.city,
      cityId: `${provinceId}|city:${dealer.city}`, store: dealer.dealerName, storeCode: dealer.dealerCode,
      dealerCode: dealer.dealerCode, storeId: dealer.dealerWid || `${brandId}|store:${dealer.dealerCode}`,
      patroler: dealer.patroler || '', patrolerId: dealer.patrolerId || '', governor: dealer.governor || '', governorId: dealer.governorId || '' };
  };
  const recordings = hydrateRecords().map(r => ({ ...r, ...org(r.dealer), advisor: r.advisorName,
    advisorKey: r.advisorId && r.advisorId !== '—' ? `${storeKey(r)}::${r.advisorId}` : '',
    originalSource: r.source, source: r.source === '工牌录音' ? '工牌' : r.source, recordingId: r.audioId }));
  const recordingMap = new Map(recordings.map(r => [r.audioId, r]));
  const recordingByLead = new Map();
  for (const r of recordings) {
    if (!recordingByLead.has(r.leadId)) recordingByLead.set(r.leadId, []);
    recordingByLead.get(r.leadId).push(r);
  }
  function stableHash(value) {
    let hash = 2166136261;
    for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  }
  function dateTimeFromOffset(date, minutes) {
    const [year, month, day] = date.split('-').map(Number), t = new Date(Date.UTC(year, month - 1, day, 0, minutes));
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,'0')}-${String(t.getUTCDate()).padStart(2,'0')} ${String(t.getUTCHours()).padStart(2,'0')}:${String(t.getUTCMinutes()).padStart(2,'0')}`;
  }
  const leads = [...global.__LEADS_REAL_DATA, ...linked.leads].map(row => {
    const dealer = dealerMap.get(storeKey(row)), matches = recordingByLead.get(String(row.id)) || [];
    const hash = stableHash(row.id), issued = 480 + hash % 540;
    const arrival = issued + (1 + ((hash >>> 5) % 3)) * 1440 + 60 + ((hash >>> 9) % 240);
    const latest = [...matches].sort((a,b) => b.startTime.localeCompare(a.startTime))[0];
    const missing = Number(row.recordingCount) > matches.length;
    const advisorId = row.linkedDemo ? row.advisorId : '';
    return { ...row, ...(dealer ? org(dealer) : {}), id: String(row.id),
      advisorId, advisorCode: advisorId, advisorKey: advisorId ? `${storeKey(row)}::${advisorId}` : '', advisor: row.advisorName,
      advisorPhone: row.advisorPhone || '', recordingIds: matches.map(r => r.audioId), loadedRecordingCount: matches.length,
      associationMissing: missing, associationLabel: missing ? '关联缺失' : matches.length ? '已关联' : '暂无录音',
      aiLeadValidity: row.linkedDemo ? row.aiLeadValidity : missing ? '关联缺失' : '未分析',
      intentLevel: latest?.intentLevel && latest.intentLevel !== '—' ? latest.intentLevel : '无法判断',
      leadIssuedAt: row.leadIssuedAt || dateTimeFromOffset(row.leadDate, issued),
      arrivalTime: row.arrivalTime || dateTimeFromOffset(row.leadDate, arrival),
      testDriveTime: row.testDriveTime || (row.linkedDemo ? '' : dateTimeFromOffset(row.leadDate, arrival + 30 + ((hash >>> 13) % 150))),
      lastContact: row.lastContact || dateTimeFromOffset(row.leadDate, 540 + hash % 660),
      customer:row.customerName,owner:row.advisorName,model:row.carSeries,intent:row.intentGrade,stage:row.leadStatus,
      qcScene:row.qcScene || '',source:row.leadSource || '',sourceType:row.sourceType || '—',tags:row.tags || [],followUpTime:row.followUpTime || '',
      updatedAt:row.lastContact || dateTimeFromOffset(row.leadDate,540+hash%660),recordStartTime:row.recordStartTime || dateTimeFromOffset(row.leadDate,issued),
      regionOrganizationPath:`${row.brand} > ${dealer?.area || row.region} > ${dealer?.zone || row.zone} > ${dealer?.dealerName || row.store}`,
      provinceOrganizationPath:`${row.brand} > ${dealer?.province || row.province} > ${dealer?.city || row.city} > ${dealer?.dealerName || row.store}`,
      summary: row.summary || '未提供对应录音分析结果。', action: row.action || '请补齐关联记录后查看分析结果。',
      derivedDates: !row.linkedDemo };
  }).sort((a,b) => b.leadDate.localeCompare(a.leadDate) || b.id.localeCompare(a.id));
  const leadMap = new Map(leads.map(l => [l.id, l]));
  for (const r of recordings) {
    r.associationMissing = !leadMap.has(r.leadId);
    r.associationLabel = r.associationMissing ? '关联缺失' : '已关联';
  }
  const badges = (global.AIQCOrganization.badges || []).map((b, index) => {
    const dealer = dealerMap.get(`${b.dealer.brand}::${b.dealer.dealerCode}`) || b.dealer;
    const bound = index % 47 !== 9, connected = index % 31 !== 0;
    const type = ['充电坞版本工牌','4G版本工牌','明略Wi-Fi工牌','智能工牌·LIVE'][index % 4];
    const bucket = index % 10;
    return { ...org(dealer), sn: b.sn, advisorId: bound ? b.advisorId : '', advisorName: bound ? b.advisorName : '',
      badgeType: type, badgeStatus: bucket === 0 ? '未知' : bucket <= 2 ? '离线' : bucket <= 4 ? '开机' : '在线',
      recordingStatus: connected && index % 5 === 0 ? '录音中' : '未录音', connectionStatus: type === '4G版本工牌' ? '—' : connected ? '已连接' : '未连接',
      dockConnected: index % 4 === 0, signal: ['信号良好','一般','较弱'][index % 3],
      battery: index === 6 ? 100 : index % 25 === 0 && index < 425 ? 7 + index % 13 : 56 + (index * 7) % 43,
      remainingMemory: 72 - (index * 13) % 68,
      uptime: connected ? `${String(4+index%5).padStart(2,'0')}:${String(index*13%60).padStart(2,'0')}:${String(index*17%60).padStart(2,'0')}` : `${String(index%3).padStart(2,'0')}:${String(index*11%60).padStart(2,'0')}:${String(index*19%60).padStart(2,'0')}`,
      pendingUploads: index % 48 === 0 ? 1 + index % 6 : 0, queryDate: '2026-08-12',
      syncedAt: connected ? `2026-08-13 14:${String(59-index%48).padStart(2,'0')}:${String(index*7%60).padStart(2,'0')}` : '2026-08-13 11:18:06' };
  }).concat(linked.badges);
  const badgeMap = new Map(badges.map(b => [b.sn,b]));
  const history=global.__BADGE_HISTORY_DATA || {events:[],uploads:[]};
  const badgeEvents=[...history.events,...linked.events].map(record=>{
    const visits=linked.visits.filter(v=>record.linkedDemo&&v.badgeSn===record.sn&&v.date===record.date);
    const advisors=[...new Set(visits.map(v=>v.advisorId).filter(Boolean))];
    return {...record,historicalAdvisorId:advisors.length===1?advisors[0]:'',associationMissing:advisors.length!==1,
      associationLabel:advisors.length===1?'已关联':'历史人员关联缺失'};
  });
  const badgeUploads=[...history.uploads,...linked.uploads].map(record=>{
    const visit=record.businessId?linked.getVisit(record.businessId):null;
    const exact=!!visit && visit.badgeSn===record.sn && visit.recordingId===record.recordingId;
    return {...record,historicalAdvisorId:exact?visit.advisorId:'',associationMissing:!exact,
      associationLabel:exact?'已关联':'历史人员关联缺失'};
  });
  for(const badge of badges){
    badge.loadedPendingUploads=badgeUploads.filter(r=>r.sn===badge.sn&&r.status==='未上传').length;
    badge.pendingAssociationMissing=badge.pendingUploads!==badge.loadedPendingUploads;
  }
  const stores = [...new Set(badges.map(storeKey))].map(key => {
    const assets = badges.filter(b => storeKey(b) === key), dealer = dealerMap.get(key), bindings = assets.filter(b => b.advisorId);
    const employees = new Map((global.AIQCOrganization.dealers.find(d => `${d.brand}::${d.dealerCode}` === key)?.advisors || []).map(a => [a.advisorId,a]));
    for (const b of bindings) employees.set(b.advisorId, { advisorId:b.advisorId,advisorName:b.advisorName });
    return { brand:dealer.brand, organization:dealer.area, zone:dealer.zone, province:dealer.province,city:dealer.city,
      code:dealer.dealerCode,name:dealer.dealerName,dealer:{...dealer,advisors:[...employees.values()]},
      employees:employees.size,badges:assets.length,bindings:bindings.length,boundEmployees:new Set(bindings.map(b=>b.advisorId)).size,
      syncedAt:assets.map(b=>b.syncedAt).sort().at(-1) };
  });
  const visits = linked.visits;
  const defaultRange = { ...linked.dateRange };
  const bindingSnapshotDate = defaultRange.endDate;
  const sceneNames = ['首触跟进','邀约到店','排程确认','销售接待','试乘试驾'];
  function modelOptions(brands = []) {
    const values = new Map();
    for (const r of recordings) if ((!brands.length || brands.includes(r.brand)) && r.leadCarSeries && r.leadCarSeries !== '—') {
      const value = `${r.brand}::${r.leadCarSeries}`; values.set(value,{value,label:r.leadCarSeries,meta:r.brand});
    }
    return [...values.values()].sort((a,b)=>a.value.localeCompare(b.value,'zh-CN'));
  }
  const inRange = (date,scope) => (!scope.startDate || date >= scope.startDate) && (!scope.endDate || date <= scope.endDate);
  function matches(record, scope, date) {
    if (!inRange(date,scope)) return false;
    if (scope.predicate && !scope.predicate(record)) return false;
    if (scope.advisorKeys?.length && !scope.advisorKeys.includes(record.advisorKey)) return false;
    if (scope.scenes?.length && !scope.scenes.includes(record.scenario || record.qcScene || record.scene)) return false;
    if (scope.source && scope.source !== 'all' && record.source !== scope.source) return false;
    const model = record.leadCarSeries || record.carSeries;
    if (scope.models?.length && !scope.models.includes(`${record.brand}::${model}`)) return false;
    return true;
  }
  function metrics(rows) {
    const complete = rows.filter(r=>r.status==='已完成');
    const scored = complete.filter(r=>Number.isFinite(parseFloat(r.qualifiedRate)));
    const passed = scored.filter(r=>parseFloat(r.qualifiedRate)>=60);
    return { recordingCount:rows.length,completedCount:complete.length,failedCount:rows.filter(r=>r.status==='失败').length,
      cloudCount:rows.filter(r=>r.source==='云外呼').length,badgeCount:rows.filter(r=>r.source==='工牌').length,
      reception:rows.filter(r=>r.scenario==='销售接待').length,testDrive:rows.filter(r=>r.scenario==='试乘试驾').length,
      qualifiedCount:passed.length,qualifiedRate:scored.length?passed.length/scored.length*100:null,
      hitRate:scored.length?scored.reduce((n,r)=>n+parseFloat(r.qualifiedRate),0)/scored.length:null,
      averageMinutes:rows.length?rows.reduce((n,r)=>n+r.durationMs/60000,0)/rows.length:null,riskCount:null,
      missingAssociations:rows.filter(r=>r.associationMissing).length };
  }
  function trend(rows, scope) {
    let start = scope.startDate || rows.map(r=>r.startTime.slice(0,10)).sort()[0];
    const end = scope.endDate || rows.map(r=>r.startTime.slice(0,10)).sort().at(-1);
    const result=[];
    if (!start || !end) return result;
    const cursor = new Date(`${start}T12:00:00`);
    while (start <= end) {
      result.push({date:start,...metrics(rows.filter(r=>r.startTime.startsWith(start)))});
      cursor.setDate(cursor.getDate()+1);
      start=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    }
    return result;
  }
  function query(scope = {}) {
    const audio = recordings.filter(r=>matches(r,scope,r.startTime.slice(0,10)));
    const leadRows = leads.filter(l => {
      const related=recordingByLead.get(l.id)||[];
      const sources=related.length?[...new Set(related.map(r=>r.source))]:l.businessId && linked.getVisit(l.businessId)?['工牌']:[''];
      return sources.some(source=>matches({...l,source},scope,l.leadDate));
    });
    const visitRows = visits.filter(v=>matches({...v,advisorKey:`${v.brand}::${v.storeCode}::${v.advisorId}`,source:'工牌'},scope,v.date));
    const grouped=new Map();
    for(const r of audio) {
      const key=r.advisorKey || `unresolved:${r.audioId}`;
      if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(r);
    }
    const advisors=[...grouped].map(([key,rows])=>({...org(rows[0].dealer),advisorKey:key,advisorId:rows[0].advisorId,name:rows[0].advisorName,advisor:rows[0].advisorName,...metrics(rows),recordings:rows}));
    return {recordings:audio,leads:leadRows,visits:visitRows,advisors,metrics:metrics(audio),trend:trend(audio,scope),rules:[]};
  }
  function customerKey(lead) {
    return lead.customerId ? `${lead.linkedDemo?'demo':'source'}::${lead.customerId}` : `lead::${lead.id}`;
  }
  function customers(input) {
    const groups=new Map();
    for(const lead of input){const key=customerKey(lead);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(lead);}
    return [...groups.values()].map(items=>{
      items=[...items].sort((a,b)=>b.leadDate.localeCompare(a.leadDate)||b.id.localeCompare(a.id));
      const latest=items[0],recorded=items.filter(l=>l.recordingCount>0),loaded=items.filter(l=>l.loadedRecordingCount>0);
      const stores=new Set(items.map(storeKey)),recordedStores=new Set(recorded.map(storeKey));
      const declared=items.reduce((n,l)=>n+Number(l.recordingCount||0),0),count=items.reduce((n,l)=>n+l.loadedRecordingCount,0);
      const coverage=(total,part)=>part===0?'全部无录音':part===total?'全部有录音':'部分有录音';
      const aggregateValues=Object.fromEntries(['brand','province','city','dealerCode','store','region','zone','patroler','governor','advisorName'].map(key=>[key,[...new Set(items.map(l=>l[key]).filter(Boolean))]]));
      return {...latest,customerKey:customerKey(latest),customerAssociationMissing:!latest.customerId,aggregateLeadRecords:items,aggregateValues,
        aggregateLeadCount:items.length,aggregateStoreCount:stores.size,aggregateAudioCount:declared,aggregateLoadedAudioCount:count,
        aggregateHasRecordCount:recorded.length,aggregateLoadedLeadCount:loaded.length,aggregateRecordedStoreCount:recordedStores.size,
        associationMissing:items.some(l=>l.associationMissing),crossStore:stores.size>1,multiLead:items.length>1,
        recordCoverage:coverage(items.length,recorded.length),storeRecordCoverage:coverage(stores.size,recordedStores.size),
        firstLeadIssuedAt:items.at(-1).leadDate,latestLeadIssuedAt:latest.leadDate,
        firstRecordingAt:items.flatMap(l=>l.recordingIds.map(id=>recordingMap.get(id).startTime)).sort()[0] || '—',
        latestRecordingAt:items.flatMap(l=>l.recordingIds.map(id=>recordingMap.get(id).startTime)).sort().at(-1) || '—',
        associationSummary:`关联${items.length}条线索，${stores.size}家门店，原始标注${declared}条录音，已加载${count}条${items.some(l=>l.associationMissing)?'；录音关联缺失':''}${!latest.customerId?'；客户ID缺失，暂按线索分别展示':''}`};
    });
  }
  function customerPayload(selection) {
    const selected=leadMap.get(String(selection.id));
    const ids=selection.aggregateLeadRecords?.map(l=>String(l.id)) || (selected?[selected.id]:[]);
    const items=[...new Set(ids)].map(id=>leadMap.get(id)).filter(l=>l&&selected&&customerKey(l)===customerKey(selected));
    const summary=customers(items)[0],audio=items.flatMap(l=>l.recordingIds.map(id=>recordingMap.get(id))).sort((a,b)=>b.startTime.localeCompare(a.startTime));
    const storeGroups=new Map();for(const l of items){const key=storeKey(l);if(!storeGroups.has(key))storeGroups.set(key,[]);storeGroups.get(key).push(l);}
    const storeBreakdown=[...storeGroups].map(([key,leads],i)=>({name:leads[0].store,dealerCode:leads[0].dealerCode,filterKey:key,tone:i?'other':'current',
      audioCount:leads.reduce((n,l)=>n+l.loadedRecordingCount,0),status:leads[0].leadStatus,updatedAt:leads[0].lastContact}));
    const latest=audio.find(r=>r.status==='已完成'),loadedLeads=items.filter(l=>l.loadedRecordingCount>0).length,loadedStores=storeBreakdown.filter(s=>s.audioCount>0).length;
    const coverage=(total,count)=>count===0?'全部无录音':count===total?'全部有录音':'部分有录音';
    const message=summary?.associationMissing?'关联缺失：原始标注的录音未包含在当前数据中。':'暂无可关联的录音分析结果。';
    return { unified:true,customer:summary?.customerName || '未找到客户记录',customerStatus:summary?.leadStatus || '—',store:summary?.store || '—',
      aggregateLeadCount:items.length,aggregateStoreCount:storeGroups.size,aggregateRecordedLeadCount:loadedLeads,aggregateRecordedStoreCount:loadedStores,
      aggregateAudioCount:audio.length,declaredAudioCount:summary?.aggregateAudioCount || 0,associationMissing:summary?.associationMissing || false,
      latestRecordingSource:audio[0]?`${audio[0].store} · ${audio[0].startTime}`:'暂无已加载录音',
      currentIntentSummary:latest?.summary || '暂无录音分析摘要',currentEvidenceSummary:latest?.linkedDemo?latest.summary:message,
      aiIntentLevel:latest?.intentLevel || '—',aiIntentCarSeries:latest?.carSeries || '—',dialogueTags:[],showDefaultPublicTags:false,
      journeyEntries:audio.map(r=>({id:r.audioId,store:r.store,time:r.startTime,stage:r.scenario,intentLevel:r.intentLevel,advisorName:r.advisorName,
        filterKey:storeKey(r),tone:storeBreakdown.find(s=>s.filterKey===storeKey(r))?.tone || '',summary:r.summary || '暂无分析内容',action:r.action || '暂无跟进建议',tags:r.tags || []})),
      recordCoverage:coverage(items.length,loadedLeads),storeRecordCoverage:coverage(storeGroups.size,loadedStores),storeBreakdown,
      subtitle:`${summary?.customerPhone || '—'} · ${items.length} 条线索${!selected?.customerId?' · 客户ID缺失，未按姓名或脱敏号码合并':''}`,
      currentStoreTitle:`本门店评估 (${summary?.store || '—'})`,currentStoreStatus:`线索状态：${summary?.leadStatus || '—'}`,
      otherStoreStatus:'暂无其他门店关联',currentStoreBadge:summary?.store || '—',singleStoreName:summary?.store || '—',mergedProfile:message };
  }
  function ranking(rows, dimension = 'organization', startLevel = 0) {
    const levels = dimension === 'geography' ? ['province','city','store'] : ['region','zone','store'];
    function group(input, depth) {
      const field = levels[depth], groups = new Map();
      for (const row of input) {
        const id = `${row.brandId}::${row[field + 'Id'] || 'unresolved:' + row.audioId}`;
        if (!groups.has(id)) groups.set(id, []);
        groups.get(id).push(row);
      }
      return [...groups].map(([id, records]) => ({ id, level:field, name:records[0][field] || '关联缺失',
        brand:records[0].brand, parentName:depth ? records[0][levels[depth-1]] : '',
        ...metrics(records), invitation:records.filter(r=>sceneNames.slice(0,3).includes(r.scenario)).length,
        children:depth < levels.length-1 ? group(records,depth+1) : [] }));
    }
    return group(rows, startLevel);
  }
  function leadPayload(lead) {
    if (lead.linkedDemo) return linked.buildLeadPayload(lead);
    const audio = (recordingByLead.get(lead.id)||[]).slice().sort((a,b)=>b.startTime.localeCompare(a.startTime));
    return { leadId:lead.id,store:lead.store,advisorName:lead.advisorName,customer:lead.customerName,leadStatus:lead.leadStatus,
      lastTouchTime:lead.lastContact,subtitle:`${lead.customerPhone} · ${lead.carSeries}`,heroTags:[],intentLevel:lead.intentLevel,
      models:audio[0]?.carSeries && audio[0].carSeries!=='—'?[audio[0].carSeries]:['—'],
      intentText:'暂无可关联的录音分析结果',evidenceText:lead.associationMissing?'关联缺失：原始线索标注的录音未包含在当前数据中。':'暂无录音分析结果。',
      evolutionSteps:audio.map(r=>({label:r.scenario,scene:r.scenario,time:r.startTime,meta:r.startTime,recordingId:r.audioId,level:r.intentLevel,summary:r.summary||'暂无分析内容'})),
      actionText:'请补齐原始关联数据后查看分析结论。',reminderBadge:'数据待补齐',reminderTime:'—',conversationTags:[],publicProfile:{groups:[]} };
  }
  const advisors = [...new Map(recordings.filter(r=>r.advisorKey).map(r=>[r.advisorKey,{...org(r.dealer),advisor:r.advisorName,advisorName:r.advisorName,advisorId:r.advisorId,advisorKey:r.advisorKey}])).values()];
  global.AIQCData = { recordings,leads,visits,badges,badgeEvents,badgeUploads,stores,directory,advisors,defaultRange,sceneNames,modelOptions,query,metrics,ranking,customerKey,customers,customerPayload,
    bindingSnapshotDate, storesAt:scope=>inRange(bindingSnapshotDate,scope)?stores:[],
    getLead:id=>leadMap.get(String(id)),getRecording:id=>recordingMap.get(String(id)),getBadge:sn=>badgeMap.get(sn),leadPayload };
})(window);
