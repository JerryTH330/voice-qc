(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../sales-strategy-model.js'), require('./demo-topics.js'), require('./date-range.js'), require('../../../device-management/organization-data.js'));
  else root.InsightSimpleModel = factory(root.SalesStrategyModel, root.InsightDemoTopics, root.InsightDateRange, root.__DEVICE_ORGANIZATION_DEALERS);
})(typeof window === 'object' ? window : this, function (base, topics, dates, directory) {
  'use strict';
  const hash = text => Array.from(text).reduce((n, c) => (n * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const rate = (n, d) => d ? Math.round(n * 1000 / d) / 10 : null;
  const allStatuses = base.statuses;
  const allScenes = Object.keys(base.sceneLabels);
  const models = { ...base.models, 埃安: [...base.models['埃安'], 'AION UT'] };
  topics = { ...topics, all: topics.online };
  // Capture one analysis instant so every group uses the same elapsed-time boundary.
  const snapshotAt = new Date().toISOString();
  const minimumDispatchDate = dates.addMonths(base.cutoff, -6);
  const templates = {
    deposit: { label: '已下订（当前）', days: 0, defaultReference: 'lost', description: '截至数据时点已确认下订', rule: '截至数据时点有确认下订记录。' },
    lost: { label: '已战败（当前）', days: 0, defaultReference: 'deposit', description: '截至数据时点已确认战败', rule: '截至数据时点已确认战败，战败申请中不计入。' },
    arrived: { label: '已到店（当前）', days: 0, defaultReference: 'not_arrived', description: '截至数据时点已到店', rule: '截至数据时点有有效首次到店记录。' },
    not_arrived: { label: '未到店（当前）', days: 0, defaultReference: 'arrived', description: '截至数据时点仍未到店', rule: '截至数据时点明确未到店，到店信息待确认不计入。' },
    arrived7: { label: '下发后 7 天内已到店', days: 7, defaultReference: 'not_arrived7', description: '7天内到店', rule: '下发后7天内首次到店。' },
    not_arrived7: { label: '下发后超7天未到店', days: 7, defaultReference: 'arrived7', description: '下发超过7天且当前未到店', rule: '线索下发时间距离分析时点已超过7天，且截至分析时仍未到店；已到店及到店信息待确认的线索不纳入。' },
    arrived15: { label: '下发后 15 天内已到店', days: 15, defaultReference: 'not_arrived15', description: '15天内到店', rule: '下发后15天内首次到店。' },
    not_arrived15: { label: '下发后超15天未到店', days: 15, defaultReference: 'arrived15', description: '下发超过15天且当前未到店', rule: '线索下发时间距离分析时点已超过15天，且截至分析时仍未到店；已到店及到店信息待确认的线索不纳入。' },
    arrived30: { label: '下发后 30 天内已到店', days: 30, defaultReference: 'not_arrived30', description: '30天内到店', rule: '下发后30天内首次到店。' },
    not_arrived30: { label: '下发后超30天未到店', days: 30, defaultReference: 'arrived30', description: '下发超过30天且当前未到店', rule: '线索下发时间距离分析时点已超过30天，且截至分析时仍未到店；已到店及到店信息待确认的线索不纳入。' }
  };
  const ageLabel = days => Number(days) ? `下发后 ${days} 天观察期` : '未设置观察周期';
  function dispatchExplanation(scope) {
    const template = templates[scope.template];
    const prefix = '在所选下发时间范围内的线索中，';
    if (scope.template === 'all') return '分析所选下发时间范围内的全部线索。';
    if (scope.template.startsWith('not_arrived') && template?.days) return `${prefix}筛选下发时间距离分析当天已超过${template.days}天，且截至分析时仍未到店的线索。`;
    if (scope.template.startsWith('arrived') && template?.days) return `${prefix}筛选下发后${template.days}天内已首次到店的线索。`;
    if (scope.template === 'not_arrived') return `${prefix}筛选截至分析时仍未到店的线索，不限制下发时长。`;
    if (scope.template === 'arrived') return `${prefix}筛选截至分析时已到店的线索，不限制下发时长。`;
    return `${prefix}筛选截至分析时${scope.template === 'deposit' ? '已确认下订' : '已确认战败'}的线索，不限制下发时长。`;
  }
  const eventBy = (time, asOf = snapshotAt) => !!time && Number.isFinite(Date.parse(time)) && Date.parse(time) <= Date.parse(asOf);
  const ageInDays = (issuedAt, asOf = snapshotAt) => Math.floor((Date.parse(asOf) - Date.parse(issuedAt)) / 86400000);
  const matchesTemplate = (record, key, asOf = snapshotAt) => {
    const t = templates[key]; if (!t) return false;
    if (key === 'deposit') return eventBy(record.depositAt, asOf);
    if (key === 'lost') return record.lostConfirmed === true && eventBy(record.lostAt, asOf);
    if (key === 'arrived') return eventBy(record.firstVisitAt, asOf) && Date.parse(record.firstVisitAt) >= Date.parse(record.issuedAt);
    if (key === 'not_arrived') return record.visitState === false && !record.firstVisitAt;
    if (!t.days) return false;
    const start = Date.parse(record.issuedAt), end = start + t.days * 86400000, cutoff = Date.parse(asOf);
    if (!Number.isFinite(start) || !Number.isFinite(cutoff) || cutoff < end) return false;
    const visit = record.firstVisitAt ? Date.parse(record.firstVisitAt) : null;
    if (record.firstVisitAt && (!Number.isFinite(visit) || visit < start || visit > cutoff)) return false;
    if (visit === null && record.visitState !== false) return false;
    const within = visit !== null && visit >= start && visit <= end;
    return key.startsWith('not_') ? cutoff > end && visit === null && record.visitState === false : within;
  };
  const inGroup = (scope, record, group) => matchesTemplate(record, group === 'a' ? scope.template : scope.comparisonTemplate);
  const coverage = records => ({ total: records.length, ready: records.filter(r => r.analysisReady).length,
    no_recording: records.filter(r => r.analysisState === 'no_recording').length,
    failed: records.filter(r => r.analysisState === 'failed').length,
    no_scene: records.filter(r => r.analysisState === 'no_scene').length });
  const cache = new Map();
  const organizationFields = [
    { level: 'region', id: 'regionId', name: 'region', label: '大区' },
    { level: 'zone', id: 'zoneId', name: 'zone', label: '战区' },
    { level: 'store', id: 'storeId', name: 'store', label: '门店' },
    { level: 'advisor', id: 'advisorId', name: 'advisor', label: '顾问' }
  ];
  const geographyFields = [
    { level: 'province', id: 'province', name: 'province', label: '省份' },
    { level: 'city', id: 'city', name: 'city', label: '城市' },
    ...organizationFields.slice(2)
  ];
  // Canonical in-network directory extracted from 门店数据.xlsx; never invent organization paths.
  const dealers = directory.filter(dealer => Object.hasOwn(base.models, dealer.brand));
  const dealersByBrand = Object.fromEntries(Object.keys(base.models).map(brand => [brand, dealers.filter(dealer => dealer.brand === brand)]));
  function storeFields(dealer) {
    const { brand, area: region, zone, province, city, dealerCode, dealerName: store, patroler, patrolerId, governor, governorId } = dealer;
    const regionId = `${brand}::region::${region}`;
    return { brand, region, regionId, zone, zoneId: `${regionId}::zone::${zone}`,
      storeId: `${brand}::${dealerCode}`, store, province, city, patroler, patrolerId, governor, governorId };
  }
  function organizationRecords() {
    return dealers.map(dealer => ({ dealer }));
  }
  const filterFields = { brand: 'brand', region: 'region', zone: 'zone', province: 'province', city: 'city', store: 'storeId', patroler: 'patrolerId', governor: 'governorId', model: 'model' };
  function annotate(record) {
    if (cache.has(record.id)) return cache.get(record.id);
    // Add UT to this page's simulated model mix without changing shared strategy fixtures or cohort IDs.
    if (record.brand === '埃安' && record.model === 'AION V' && hash(record.id + ':intent-model') % 5 === 0) record = { ...record, model: 'AION UT' };
    const annotations = {};
    for (const [key, dimension] of Object.entries(topics[record.stage])) {
      if (hash(record.id + ':' + key + ':present') % 10 > 6) { annotations[key] = []; continue; }
      if (key === 'intent_model') { annotations[key] = [{ name: record.model, sub: '意向车型', text: `我主要想了解${record.model}。`, role: '客户' }]; continue; }
      if (!dimension.topics.length) { annotations[key] = []; continue; }
      const topic = dimension.topics[hash(record.id + ':' + key) % dimension.topics.length];
      const quote = topic.quotes[hash(record.id + ':' + key + ':quote') % (topic.quotes.length || 1)];
      annotations[key] = [{ name: key === 'intent_model' ? record.model : topic.name, sub: topic.sub, text: quote?.text || '', role: '客户', ...(dimension.sentiment ? { sentiment: dimension.sentiment, aspect: topic.name } : {}) }];
    }
    const stores = dealersByBrand[record.brand];
    const store = stores[hash(record.id + ':store') % stores.length];
    const advisorNumber = Math.floor(hash(record.id + ':advisor') / 17) % 4 + 1;
    const fields = storeFields(store);
    // Synthetic fixture facts are explicit and independent of recording availability.
    // Production must provide dispatch time and confirmed business events.
    const visited = ['到店跟进中', '已下定', '下订单', '终端成交', '战败已通过(已到店)', '战败申请中(已到店)'].includes(record.status);
    const notVisited = ['已预约到店', '已邀约到店', '未跟进', '继续邀约', '战败已通过(未到店)', '战败申请中(未到店)'].includes(record.status);
    const issuedAt = record.t0 + 'T09:00:00+08:00';
    const remaining = Math.max(0, ageInDays(issuedAt));
    const eventAt = days => base.shift(record.t0, Math.min(remaining, days)) + 'T14:00:00+08:00';
    const firstVisitAt = visited ? eventAt(1 + hash(record.id + ':visit') % 12) : null;
    // Generate varied comparison examples at lead level so drill-down evidence remains consistent.
    const earlyVisit = firstVisitAt && Date.parse(firstVisitAt) <= Date.parse(issuedAt) + 7 * 86400000;
    for (const [key, dimension] of Object.entries(topics[record.stage])) {
      if (key === 'intent_model' || dimension.topics.length < 3 || !annotations[key].length) continue;
      const draw = hash(record.id + ':' + key + ':comparison-mix') % 100;
      const index = draw < 45 ? (earlyVisit ? 0 : 1) : draw < 55 ? (earlyVisit ? 1 : 0) : 2 + hash(record.id + ':' + key + ':comparison-tail') % (dimension.topics.length - 2);
      const topic = dimension.topics[index];
      const quote = topic.quotes[hash(record.id + ':' + key + ':quote') % (topic.quotes.length || 1)];
      annotations[key] = [{ name: topic.name, sub: topic.sub, text: quote?.text || '', role: '客户', ...(dimension.sentiment ? { sentiment: dimension.sentiment, aspect: topic.name } : {}) }];
    }
    const depositAt = ['已下定', '终端成交'].includes(record.status) ? eventAt(13) : null;
    const lostConfirmed = ['战败', '战败已通过(已到店)', '战败已通过(未到店)'].includes(record.status);
    const availability = hash(record.id + ':availability') % 12;
    const analysisState = availability < 2 ? 'no_recording' : availability === 2 ? 'failed' : 'ready';
    const result = { ...record, ...fields, annotations, issuedAt, ageDays: ageInDays(issuedAt),
      firstVisitAt, visitState: visited ? true : notVisited ? false : null, depositAt,
      lostConfirmed, lostAt: lostConfirmed ? eventAt(14) : null, statusAsOf: snapshotAt,
      analysisState, analysisReady: analysisState === 'ready',
      advisorId: `${fields.storeId}-ADVISOR-${advisorNumber}`, advisor: `演示顾问 ${advisorNumber}` };
    cache.set(record.id, result);
    return result;
  }
  function defaults() {
    return { template: 'not_arrived7', comparisonTemplate: 'arrived7', stage: 'all', brand: '埃安', org: '全国', model: 'all',
      start: '2026-06-30', end: '2026-07-19', minAgeDays: 7, scenes: allScenes.slice(), organizationDimension: 'organization' };
  }
  function query(input = {}, compare = false, fixture) {
    const scope = { ...defaults(), ...input, stage: 'all', asOf: snapshotAt };
    const errors = [];
    if (!Object.hasOwn(templates, scope.template)) { errors.push('请选择有效的线索状态。'); scope.template = 'not_arrived7'; }
    if (!Object.hasOwn(templates, scope.comparisonTemplate) || scope.comparisonTemplate === scope.template) scope.comparisonTemplate = templates[scope.template].defaultReference;
    scope.minAgeDays = templates[scope.template].days;
    if (templates[scope.comparisonTemplate].days && templates[scope.comparisonTemplate].days !== scope.minAgeDays) scope.comparisonTemplate = templates[scope.template].defaultReference;
    delete scope.windowDays; delete scope.statuses; delete scope.a; delete scope.b;
    const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    if (!validDate(scope.start) || !validDate(scope.end)) errors.push('请选择有效的线索下发日期。');
    if (scope.start > scope.end) errors.push('开始日期不能晚于结束日期。');
    if (scope.start < minimumDispatchDate || scope.end > base.cutoff) errors.push(`可选下发日期范围为${minimumDispatchDate}至${base.cutoff}。`);
    const filters = scope.filters;
    scope.scenes = (filters?.scene?.length ? filters.scene : Array.isArray(input.scenes) ? input.scenes : allScenes).filter(value => allScenes.includes(value));
    const brands = filters ? (filters.brand?.length ? Object.keys(base.models).filter(brand => filters.brand.includes(brand)) : Object.keys(base.models)) : [scope.brand];
    // Scene selection scopes evidence, never excludes unrecorded/unanalysed leads from the business cohort.
    const source = fixture || base.sampleRecords.map(annotate);
    const population = errors.length ? [] : source.filter(record => brands.includes(record.brand)
      && record.issuedAt.slice(0, 10) >= scope.start && record.issuedAt.slice(0, 10) <= scope.end
      && (filters || scope.org === '全国' || record.region === scope.org)
      && (filters || scope.model === 'all' || record.model === scope.model))
      .filter(record => !filters || (Object.entries(filterFields).every(([key, field]) => !filters[key]?.length || filters[key].includes(record[field]))
        && (!Array.isArray(filters.organizationStores) || filters.organizationStores.includes(record.storeId))))
      .map(record => {
        const analysisState = record.analysisState === 'ready' && !scope.scenes.includes(record.scene) ? 'no_scene' : record.analysisState;
        return { ...record, ageDays: ageInDays(record.issuedAt), analysisState, analysisReady: analysisState === 'ready' };
      });
    const mature = population.filter(record => record.ageDays >= scope.minAgeDays);
    const counts = Object.fromEntries(Object.keys(templates).map(key => [key, mature.filter(record => matchesTemplate(record, key)).length]));
    const overlapCount = compare ? mature.filter(record => matchesTemplate(record, scope.template) && matchesTemplate(record, scope.comparisonTemplate)).length : 0;
    const records = mature.filter(record => compare ? matchesTemplate(record, scope.template) !== matchesTemplate(record, scope.comparisonTemplate) : matchesTemplate(record, scope.template));
    const a = compare ? records.filter(record => inGroup(scope, record, 'a')) : [];
    const b = compare ? records.filter(record => inGroup(scope, record, 'b')) : [];
    return { scope, compare, errors, records, a, b, latest: base.cutoff, statusAsOf: snapshotAt, counts, overlapCount,
      populationCount: population.length, matureCount: mature.length, immatureCount: population.length - mature.length,
      unknownVisitCount: scope.minAgeDays ? mature.filter(record => !matchesTemplate(record, `arrived${scope.minAgeDays}`) && !matchesTemplate(record, `not_arrived${scope.minAgeDays}`)).length : 0,
      coverage: coverage(records), analysed: records.filter(record => record.analysisReady) };
  }
  function distribution(result, dimension, byRegion = false) {
    const buckets = new Map();
    for (const record of result.records.filter(r => r.analysisReady)) for (const annotation of record.annotations[dimension] || []) {
      const region = byRegion ? record.region : '';
      const id = JSON.stringify([annotation.name, region]);
      if (!buckets.has(id)) buckets.set(id, { id, name: annotation.name, sub: annotation.sub, region, records: [] });
      buckets.get(id).records.push(record);
    }
    const meaningful = name => name && !/^(未知|未提及|未识别|无法识别|无法判断|不详|暂无|无数据)$/.test(name.trim());
    return [...buckets.values()].map(row => {
      const denominator = result.records.filter(r => r.analysisReady && (!byRegion || r.region === row.region) && (result.compare || (r.annotations[dimension] || []).some(a => meaningful(a.name))));
      const aTotal = denominator.filter(r => inGroup(result.scope, r, 'a')).length;
      const bTotal = denominator.filter(r => inGroup(result.scope, r, 'b')).length;
      const aCount = row.records.filter(r => inGroup(result.scope, r, 'a')).length;
      const bCount = row.records.filter(r => inGroup(result.scope, r, 'b')).length;
      const aRate = result.compare ? rate(aCount, aTotal) : null;
      const bRate = result.compare ? rate(bCount, bTotal) : null;
      return { ...row, count: row.records.length, denominator: denominator.length, share: rate(row.records.length, denominator.length), aCount, bCount, aTotal, bTotal, aRate, bRate, delta: aRate === null || bRate === null ? null : Math.round((aRate - bRate) * 10) / 10 };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
  }
  function actions(result) {
    // Definitions and assignments come from the original strategy demo. All metrics are recomputed.
    const definitions = Object.entries(base.rules).filter(([stage]) => base.scenes[stage].some(scene => result.scope.scenes.includes(scene))).flatMap(([, rules]) => rules);
    // Only consume the existing-SOP definitions. Candidate/new recognition is outside this page's scope.
    return [...new Map(definitions.filter(rule => rule.source === '已有 SOP').map(rule => [rule.id, rule])).values()].map(rule => {
      const records = result.records.filter(r => r.analysisReady && r.actions[rule.id]?.eligible);
      const done = records.filter(r => r.actions[rule.id].complete);
      const missed = records.filter(r => !r.actions[rule.id].complete);
      const group = list => { const eligible = list.filter(r => r.analysisReady && r.actions[rule.id]?.eligible); return { count: eligible.filter(r => r.actions[rule.id].complete).length, total: eligible.length }; };
      const a = group(result.a), b = group(result.b);
      const qualifiedCount = done.filter(r => r.actions[rule.id].qualified).length;
      const doneTarget = done.filter(r => inGroup(result.scope, r, 'a')).length;
      const missedTarget = missed.filter(r => inGroup(result.scope, r, 'a')).length;
      return { id: rule.id, name: rule.name, source: rule.source, trigger: rule.trigger, training: rule.training, records, count: records.length, done: done.length, missed: missed.length, qualifiedCount, completion: rate(done.length, records.length), qualified: rule.source === '已有 SOP' ? rate(qualifiedCount, records.length) : null, aRate: rate(a.count, a.total), bRate: rate(b.count, b.total), aCount: a.count, bCount: b.count, aTotal: a.total, bTotal: b.total, doneTarget, missedTarget, resultDone: result.compare ? rate(doneTarget, done.length) : null, resultMissed: result.compare ? rate(missedTarget, missed.length) : null };
    });
  }
  function subset(result, records) {
    return { ...result, records, coverage: coverage(records), analysed: records.filter(r => r.analysisReady), a: result.compare ? records.filter(r => inGroup(result.scope, r, 'a')) : [], b: result.compare ? records.filter(r => inGroup(result.scope, r, 'b')) : [] };
  }
  function summarize(result, selection) {
    if (selection.kind === 'actions') return actions(result).find(row => row.id === selection.targetId) || null;
    const existing = distribution(result, selection.dimension).find(row => row.name === selection.targetName);
    if (existing) return existing;
    const aTotal = result.a.filter(r => r.analysisReady).length, bTotal = result.b.filter(r => r.analysisReady).length;
    return { id: selection.targetId, name: selection.targetName, sub: topics[result.scope.stage][selection.dimension]?.label || '', records: [], count: 0, denominator: result.analysed.length, share: rate(0, result.analysed.length), aCount: 0, bCount: 0, aTotal, bTotal, aRate: result.compare ? rate(0, aTotal) : null, bRate: result.compare ? rate(0, bTotal) : null, delta: aTotal && bTotal ? 0 : null };
  }
  function drill(result, selection, path = []) {
    const fields = result.scope.organizationDimension === 'geography' ? geographyFields : organizationFields;
    const filters = result.scope.filters || {};
    // The top filters already restrict the population; drill only through levels below them.
    let offset = 0;
    fields.forEach((field, index) => { if (filters[field.level]?.length) offset = index + 1; });
    if (!result.scope.filters && result.scope.org && result.scope.org !== '全国' && result.scope.organizationDimension !== 'geography') offset = 1;
    let records = result.records;
    let valid = path.length <= fields.length - offset;
    for (let index = 0; index < path.length && valid; index++) {
      const field = fields[offset + index], entry = path[index];
      if (!field || entry.level !== field.level || !records.some(r => r[field.id] === entry.id)) { valid = false; break; }
      records = records.filter(r => r[field.id] === entry.id);
    }
    if (!valid) records = [];
    const scoped = subset(result, records);
    const summary = summarize(scoped, selection);
    const field = fields[offset + path.length];
    const groups = new Map();
    if (valid && field) for (const record of records) {
      if (!groups.has(record[field.id])) groups.set(record[field.id], { id: record[field.id], name: record[field.name], records: [] });
      groups.get(record[field.id]).records.push(record);
    }
    const children = [...groups.values()].map(group => ({ id: group.id, name: group.name, level: field.level, total: group.records.length, summary: summarize(subset(scoped, group.records), selection) }));
    children.sort((a,b)=>(b.summary?.count||0)-(a.summary?.count||0)||a.name.localeCompare(b.name,'zh-CN'));
    return { valid, result: scoped, summary, children, level: field?.level || 'leads', levelLabel: field?.label || '线索', leads: field ? [] : (summary?.records || []) };
  }
  function comparisonChart(input) {
    const values = input.flatMap(row => [row.aRate, row.bRate]).filter(value => Number.isFinite(value));
    const maximum = Math.max(0, ...values);
    const step = maximum > 60 ? 20 : maximum > 30 ? 10 : 5;
    const upper = Math.min(100, Math.max(step, Math.ceil(maximum / step) * step));
    const ticks = Array.from({ length: Math.round(upper / step) + 1 }, (_, index) => index * step);
    const rows = input.map((row, index) => ({ row, index, delta: Number.isFinite(row.aRate) && Number.isFinite(row.bRate) ? Math.round((row.aRate - row.bRate) * 10) / 10 : null, aWidth: Number.isFinite(row.aRate) ? row.aRate / upper * 100 : 0, bWidth: Number.isFinite(row.bRate) ? row.bRate / upper * 100 : 0 }));
    rows.sort((a,b) => (b.delta === null ? -1 : Math.abs(b.delta)) - (a.delta === null ? -1 : Math.abs(a.delta)) || a.index - b.index);
    return { upper, ticks, rows };
  }
  return { ageLabel, dispatchExplanation, defaults, query, distribution, actions, subset, summarize, drill, comparisonChart, organizationFields, geographyFields, organizationRecords, topics, templates, matchesTemplate, inGroup, ageInDays, snapshotAt, minimumDispatchDate, sampleRecords: () => base.sampleRecords.map(annotate), models, scenes: { ...base.scenes, all: allScenes }, sceneLabels: base.sceneLabels, statuses: allStatuses, cutoff: base.cutoff, shift: base.shift, rate };
});
