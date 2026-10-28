/* 50 家门店的关联演示样本；保留导入主体数据，不代表真实业务记录。 */
(function initLinkedDemo(global) {
  'use strict';
  if (global.AIQCLinkedDemo) return;
  const legacyTemplates = [
  { businessId: 'BIZ-20260812-0136', recordingId: 'REC-20260812-0136', leadId: '', customerName: '王先生', customerPhone: '138****0628', date: '2026-08-12', startTime: '13:04:00', endTime: '13:28:00', status: '已匹配', detailText: '已匹配完成5段录音', completedAt: '13:36:10', advisor: '陈佳', badgeSn: 'MN-BDG-004821', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '13:36:10', scene: '销售接待', carSeries: '星海 S7', detailKey: 'matched', weight: 450 },
  { businessId: 'BIZ-20260811-0735', recordingId: 'REC-20260811-0735', leadId: '', customerName: '郑女士', customerPhone: '137****3091', date: '2026-08-11', startTime: '15:18:20', endTime: '15:52:46', status: '已匹配', detailText: '已匹配完成4段录音', completedAt: '16:01:22', advisor: '韩如臣', badgeSn: 'MN-BDG-004792', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '16:01:22', scene: '试乘试驾', carSeries: '星海 S7', detailKey: 'matched', weight: 372 },
  { businessId: 'BIZ-20260811-0712', recordingId: 'REC-20260811-0712', leadId: '', customerName: '吴女士', customerPhone: '136****5826', date: '2026-08-11', startTime: '14:36:08', endTime: '15:06:41', status: '已匹配', detailText: '已匹配完成3段录音', completedAt: '15:14:09', advisor: '周宁', badgeSn: 'MN-BDG-004867', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '销售助手', updatedAt: '15:14:09', scene: '销售接待', carSeries: '星海 V6', detailKey: 'matched', weight: 320 },
  { businessId: 'BIZ-20260812-0148', leadId: '', customerName: '赵女士', customerPhone: '159****8312', date: '2026-08-12', startTime: '13:22:45', endTime: '13:56:08', status: '录音上传中', detailText: '可能存在未上传录音', completedAt: '—', advisor: '李洋', badgeSn: 'MN-BDG-004836', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '14:14:02', scene: '试乘试驾', carSeries: '星海 L9', detailKey: 'uploading', weight: 67 },
  { businessId: 'BIZ-20260812-0154', leadId: '', customerName: '郑先生', customerPhone: '136****4195', date: '2026-08-12', startTime: '14:08:20', endTime: '14:41:12', status: '已匹配', audioStatus: '录音转写中', detailText: '—', completedAt: '14:49:36', advisor: '李洋', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '14:49:36', scene: '销售接待', carSeries: '星海 L9', weight: 21 },
  { businessId: 'BIZ-20260812-0162', leadId: '', customerName: '吴先生', customerPhone: '137****5220', date: '2026-08-12', startTime: '15:06:18', endTime: '15:42:31', status: '已匹配', audioStatus: '模型分析中', detailText: '—', completedAt: '15:48:20', advisor: '陈佳', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '15:48:20', scene: '销售接待', carSeries: '星海 S7', weight: 22 },
  { businessId: 'BIZ-20260812-0171', leadId: '', customerName: '孙女士', customerPhone: '158****2754', date: '2026-08-12', startTime: '16:12:04', endTime: '16:39:28', status: '匹配失败', detailText: '到访和结束日期非同一天', completedAt: '—', advisor: '陈佳', badgeSn: 'MN-BDG-004821', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '16:46:11', scene: '销售接待', carSeries: '星海 S7', weight: 9 },
  { businessId: 'BIZ-20260812-0183', leadId: '', customerName: '林先生', customerPhone: '133****6187', date: '2026-08-12', startTime: '17:05:16', endTime: '17:26:44', status: '无录音', detailText: '工牌未开机', completedAt: '—', advisor: '李洋', badgeSn: 'MN-BDG-004845', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '17:30:02', scene: '销售接待', carSeries: '星海 L9', weight: 5 },
  { businessId: 'BIZ-20260811-0831', leadId: '', customerName: '刘先生', customerPhone: '186****1045', date: '2026-08-11', startTime: '18:31:35', endTime: '18:31:55', status: '无录音', detailText: '工牌未录音', completedAt: '—', advisor: '韩如臣', badgeSn: 'MN-BDG-004792', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '18:32:06', scene: '销售接待', carSeries: '星海 S7', detailKey: 'no-record', weight: 6 },
  { businessId: 'BIZ-20260811-0816', leadId: '', customerName: '钱女士', customerPhone: '189****4036', date: '2026-08-11', startTime: '17:42:08', endTime: '18:05:20', status: '待匹配', detailText: '到访记录已接收，等待录音匹配', completedAt: '—', advisor: '韩如臣', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '18:06:03', scene: '试乘试驾', carSeries: '星海 S7', weight: 2 },
  { businessId: 'BIZ-20260811-0793', leadId: '', customerName: '沈女士', customerPhone: '139****7272', date: '2026-08-11', startTime: '16:46:15', endTime: '17:03:40', status: '无录音', detailText: '客户明确不同意录音，本次未采集', completedAt: '—', advisor: '周宁', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '模板导入', updatedAt: '17:04:12', scene: '销售接待', carSeries: '星海 V6', weight: 3 },
  { businessId: 'BIZ-20260811-0772', leadId: '', customerName: '周女士', customerPhone: '135****2776', date: '2026-08-11', startTime: '16:23:41', endTime: '17:08:02', status: '匹配失败', detailText: '未绑定工牌', completedAt: '—', advisor: '周宁', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '模板导入', updatedAt: '17:09:11', scene: '销售接待', carSeries: '星海 V6', detailKey: 'unbound', weight: 9 }
];
  const directory = global.__DEVICE_ORGANIZATION_DEALERS || [];
  const oldCodes = ['SHA0120', 'ZJA0400', 'JSE0600'];
  const oldCodeMap = { 'SH-PD-001': oldCodes[0], 'HZ-BJ-003': oldCodes[1], 'SZ-YQ-006': oldCodes[2] };
  const oldAdvisorMap = { '陈佳': [0, '王若曦'], '李洋': [1, '李若曦'], '韩如臣': [0, '黄宇辰'], '周宁': [0, '孙诗涵'] };
  const stores = oldCodes.map(code => directory.find(d => d.brand === '埃安' && d.dealerCode === code));
  if (stores.some(store => !store)) throw new Error('关联演示缺少原有门店目录');
  const buckets = new Map();
  directory.forEach(dealer => {
    if (stores.includes(dealer)) return;
    const key = `${dealer.brand}|${dealer.area}|${dealer.province}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(dealer);
  });
  const groups = [...buckets.values()].sort((a, b) => `${a[0].brand}|${a[0].area}|${a[0].province}`.localeCompare(`${b[0].brand}|${b[0].area}|${b[0].province}`));
  for (let cursor = 0; stores.length < 50; cursor++) {
    const group = groups[cursor % groups.length];
    if (group.length) stores.push(group.shift());
    if (!groups.some(group => group.length) && stores.length < 50) throw new Error('关联演示门店不足 50 家');
  }
  function organization(dealer) {
    const brandId = `brand:${dealer.brand}`;
    const regionId = `${brandId}|region:${dealer.area}`;
    const provinceId = `province:${dealer.province}`;
    return { brand: dealer.brand, brandId, region: dealer.area, regionId, zone: dealer.zone,
      zoneId: `${regionId}|zone:${dealer.zone}`, province: dealer.province, provinceId,
      city: dealer.city, cityId: `${provinceId}|city:${dealer.city}`, store: dealer.dealerName,
      storeCode: dealer.dealerCode, dealerCode: dealer.dealerCode,
      storeId: dealer.dealerWid || `${brandId}|store:${dealer.dealerCode}`,
      patroler: dealer.patroler || '', patrolerId: dealer.patrolerId || '',
      governor: dealer.governor || '', governorId: dealer.governorId || '' };
  }
  const pad = n => String(n).padStart(2, '0');
  const today = new Date();
  const recentDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  });
  const dateRange = { startDate: recentDates[6], endDate: recentDates[0] };
  const clock = seconds => `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
  const seconds = time => time.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  const names = ['陈知夏', '刘嘉怡', '赵思远', '徐安然', '杨晨曦', '何书瑶', '周沐阳', '张明轩'];
  const badges = stores.flatMap((dealer, storeIndex) => Array.from({ length: 3 }, (_, advisorIndex) => {
    const advisorId = `DEMO-${dealer.brand === '埃安' ? 'AION' : 'GAC'}-${dealer.dealerCode}-${pad(advisorIndex + 1)}`;
    const advisorName = storeIndex === 0 && advisorIndex < 2 ? ['王若曦', '李若曦'][advisorIndex]
      : storeIndex === 1 && advisorIndex === 0 ? '黄宇辰'
        : storeIndex === 2 && advisorIndex === 0 ? '孙诗涵' : names[(storeIndex * 3 + advisorIndex) % names.length];
    return { ...organization(dealer), dealer, advisorId, advisorName,
      advisorPhone: `138****${String(storeIndex * 3 + advisorIndex + 1).padStart(4, '0')}`,
      sn: `MN-LINK-${String(storeIndex * 3 + advisorIndex + 1).padStart(6, '0')}`,
      linkedDemo: true, queryDate: dateRange.endDate, badgeType: '明略Wi-Fi工牌', badgeStatus: '在线',
      recordingStatus: '未录音', connectionStatus: '已连接', dockConnected: true, signal: '信号良好',
      battery: 61 + (storeIndex * 7 + advisorIndex) % 39, remainingMemory: 45 + (storeIndex * 11) % 50,
      uptime: '10:00:00', pendingUploads: 0, syncedAt: `${dateRange.endDate} 23:59:59` };
  }));
  function linkVisit(record, storeIndex, advisorIndex) {
    const dealer = stores[storeIndex];
    const badge = badges[storeIndex * 3 + advisorIndex];
    const audioStatus = record.audioStatus || (record.status === '已匹配' ? '已完成' : record.status === '匹配失败' ? '失败' : record.status);
    const status = ['录音转写中', '模型分析中'].includes(record.status) ? '已匹配' : record.status;
    const unbound = record.detailText === '未绑定工牌';
    const noConsent = record.detailText.includes('不同意录音');
    const hasAudio = !unbound && !noConsent && !['无录音', '待匹配'].includes(record.status);
    const carSeries = dealer.brand === '埃安' ? ['埃安Y Plus', '埃安S MAX', '昊铂GT'][storeIndex % 3] : ['传祺M8', '传祺GS8', '传祺E8'][storeIndex % 3];
    return { ...record, ...organization(dealer), status, audioStatus,
      completedAt: status === '已匹配' && record.completedAt === '—' ? record.updatedAt : record.completedAt,
      linkedDemo: true, advisor: badge.advisorName,
      advisorId: badge.advisorId, advisorKey: badge.advisorId, badgeSn: unbound || noConsent ? '' : badge.sn,
      leadId: `LEAD-LINK-${record.businessId.replace(/^BIZ-/, '')}`,
      recordingId: hasAudio ? (record.recordingId || `REC-LINK-${record.businessId.replace(/^BIZ-/, '')}`) : undefined,
      scene: record.scene === '试乘试驾' ? '试乘试驾' : '销售接待', carSeries,
      detailText: record.detailText, weight: 1 };
  }
  const legacyVisits = [];
  const remaining = legacyTemplates.map(record => record.weight);
  const copyIndexes = legacyTemplates.map(() => 0);
  while (remaining.some(count => count > 0)) {
    legacyTemplates.forEach((template, index) => {
      if (remaining[index] <= 0) return;
      const copyIndex = copyIndexes[index]++;
      remaining[index]--;
      const suffix = copyIndex ? `-${String(copyIndex + 1).padStart(4, '0')}` : '';
      const storeIndex = oldCodes.indexOf(oldCodeMap[template.storeCode]);
      const advisorIndex = oldAdvisorMap[template.advisor][0];
      legacyVisits.push(linkVisit({ ...template, businessId: template.businessId + suffix,
        recordingId: template.recordingId ? template.recordingId + suffix : undefined }, storeIndex, advisorIndex));
    });
  }
  const visits = [...legacyVisits];
  const audioStatuses = ['已匹配', '录音上传中', '录音转写中', '模型分析中', '待匹配', '匹配失败', '无录音'];
  for (let storeIndex = 3; storeIndex < stores.length; storeIndex++) {
    const count = 18 + (storeIndex * 19) % 63;
    const matchedCount = Math.floor(count * (0.52 + (storeIndex % 7) * 0.06));
    for (let index = 0; index < count; index++) {
      const status = index < matchedCount ? '已匹配' : audioStatuses[1 + (index + storeIndex) % 6];
      const date = index % 3 ? '2026-08-12' : '2026-08-11';
      const start = 9 * 3600 + Math.floor(index / 3) * 15 * 60 + (storeIndex % 9) * 60;
      const duration = (8 + (index * 7 + storeIndex) % 6) * 60;
      const detailText = status === '匹配失败' ? '到访时间段未找到可关联录音'
        : status === '无录音' ? '工牌未录音' : status === '录音上传中' ? '可能存在未上传录音' : status === '待匹配' ? '到访记录已接收，等待录音匹配' : '—';
      const record = { businessId: `BIZ-LINK-${pad(storeIndex + 1)}-${String(index + 1).padStart(4, '0')}`,
        date, startTime: clock(start), endTime: clock(start + duration), status, detailText,
        completedAt: status === '已匹配' ? clock(start + duration + 300) : '—', updatedAt: clock(start + duration + 300),
        customerName: `${['张', '刘', '陈', '赵', '孙', '许', '周'][index % 7]}${index % 2 ? '女士' : '先生'}`,
        customerPhone: `139****${String(storeIndex * 100 + index).padStart(4, '0')}`,
        source: index % 5 ? '销售助手' : '模板导入', scene: index % 3 ? '销售接待' : '试乘试驾' };
      visits.push(linkVisit(record, storeIndex, index % 3));
    }
  }
  visits.forEach((visit, index) => { visit.date = recentDates[index % recentDates.length]; });
  // 将原有 12 条不同状态／原因样本安排为今天最新到访，保持列表按时间倒序。
  visits.slice(0, legacyTemplates.length).forEach((visit, index) => {
    const shift = 20 * 3600 - index * 5 * 60 - seconds(visit.startTime);
    visit.date = recentDates[0];
    for (const key of ['startTime', 'endTime', 'completedAt', 'updatedAt']) {
      if (visit[key] && visit[key] !== '—') visit[key] = clock(seconds(visit[key]) + shift);
    }
  });
  const byBadgePhone = (sn, advisorId) => badges.find(badge => badge.sn === sn || badge.advisorId === advisorId)?.advisorPhone || '';
  const leads = [], recordings = [], uploads = [];
  const levels = ['高', '中', '低'];
  let pendingVisitIndex = 0;
  visits.forEach((visit, index) => {
    const dealer = stores.find(store => store.brand === visit.brand && store.dealerCode === visit.storeCode);
    const durationSeconds = Math.max(1, seconds(visit.endTime) - seconds(visit.startTime));
    const fragmentCount = Math.ceil(durationSeconds / 300);
    const status = visit.audioStatus;
    const analysisCompleted = status === '已完成';
    if (visit.status === '已匹配') visit.detailText = `已匹配完成${fragmentCount}段录音`;
    const level = visit.recordingId && analysisCompleted ? levels[index % 3] : '无法判断';
    const summary = `${visit.customerName}在${visit.store}了解${visit.carSeries}，关注${index % 2 ? '空间和家庭出行' : '价格、续航及金融方案'}。本次${visit.scene}的处理状态为${visit.status}。`;
    const action = visit.status === '已匹配' ? `由${visit.advisor}跟进${visit.carSeries}报价与试驾安排。` : `由${visit.advisor}核查本次到访：${visit.detailText === '—' ? visit.status : visit.detailText}。`;
    const record = { id: visit.leadId, linkedDemo: true, ...organization(dealer),
      advisorName: visit.advisor, advisorId: visit.advisorId, advisorCode: visit.advisorId, advisorPhone: byBadgePhone(visit.badgeSn, visit.advisorId),
      customerName: visit.customerName, customer: visit.customerName, customerPhone: visit.customerPhone,
      intentGrade: level === '高' ? 'A' : level === '中' ? 'B' : 'C', intent: level === '高' ? 'A' : level === '中' ? 'B' : 'C',
      intentLevel: level, carSeries: visit.carSeries, model: visit.carSeries,
      leadStatus: visit.scene === '试乘试驾' ? '已试驾' : '已到店', stage: visit.scene === '试乘试驾' ? '已试驾' : '已到店',
      leadDate: visit.date, leadIssuedAt: `${visit.date} 08:00`, recordStartTime: `${visit.date} ${visit.startTime}`,
      arrivalTime: `${visit.date} ${visit.startTime}`, testDriveTime: visit.scene === '试乘试驾' ? `${visit.date} ${visit.endTime}` : '',
      lastContact: `${visit.date} ${visit.endTime}`, updatedAt: `${visit.date} ${visit.endTime}`,
      leadSource: visit.source === '模板导入' ? '线下导入' : '自然到店', source: visit.source === '模板导入' ? '线下导入' : '自然到店',
      secondSource: '门店接待', thirdSource: '', fourthSource: '', recordingCount: visit.recordingId ? 1 : 0,
      validRecording: visit.recordingId ? '是' : '否',
      aiLeadValidity: analysisCompleted ? '有效' : visit.recordingId ? '分析中' : '未分析',
      isFinalStatus: analysisCompleted ? '是' : '否',
      patrolerCode: dealer.patrolerId?.match(/:code:([^|]+)/)?.[1] || '—',
      qcClueStatus: analysisCompleted ? '有效' : '待确认', finalStatus: '', finalInvalidReason: '',
      qcScene: visit.scene, summary, action, tags: [visit.carSeries, visit.scene, visit.status],
      followUpTime: `${visit.date} 19:00`, businessId: visit.businessId, badgeSn: visit.badgeSn,
      recordingIds: visit.recordingId ? [visit.recordingId] : [],
      organizationPath: `${visit.brand} > ${visit.region} > ${visit.zone} > ${visit.store}`,
      regionOrganizationPath: `${visit.brand} > ${visit.region} > ${visit.zone} > ${visit.store}`,
      provinceOrganizationPath: `${visit.brand} > ${visit.province} > ${visit.city} > ${visit.store}` };
    leads.push(record);
    if (!visit.recordingId) return;
    const recording = { ...record, audioId: visit.recordingId, leadId: visit.leadId, leadBrand: visit.brand,
      dealer, dealerKey: `${visit.brand}::${visit.storeCode}`, dealerCode: visit.storeCode,
      advisorKey: `${visit.brand}::${visit.storeCode}::${visit.advisorId}`,
      customerNameMasked: visit.customerName, startTime: `${visit.date} ${visit.startTime}`, endTime: `${visit.date} ${visit.endTime}`,
      uploadTime: `${visit.date} ${visit.updatedAt}`, durationMs: durationSeconds * 1000,
      duration: `${pad(Math.floor(durationSeconds / 60))}:${pad(durationSeconds % 60)}`,
      qualifiedRate: status === '已完成' ? `${72 + index % 27}%` : '—', intentLevel: status === '已完成' ? level : '—',
      carSeries: status === '已完成' ? visit.carSeries : '—', leadCarSeries: visit.carSeries, scenario: visit.scene, source: '工牌录音', sourceType: '实体卡', status,
      visitStatus: visit.status, transcript: ['已完成', '模型分析中'].includes(status) ? [
        { time: 0, speaker: visit.advisor, text: `${visit.customerName}您好，欢迎来到${visit.store}。今天想了解${visit.carSeries}的哪些方面？` },
        { time: Math.floor(durationSeconds * 0.2), speaker: visit.customerName, text: `我比较关注${index % 2 ? '空间、舒适性和家庭出行' : '价格、续航和月供'}，想了解${visit.carSeries}的方案。` },
        { time: Math.floor(durationSeconds * 0.45), speaker: visit.advisor, text: `我们可以结合您的预算介绍${visit.carSeries}，并安排${visit.scene === '试乘试驾' ? '试驾体验' : '展车体验'}。` },
        { time: Math.floor(durationSeconds * 0.8), speaker: visit.customerName, text: '请把配置和报价发给我，后续再联系。' }
      ] : [], summary, action };
    recordings.push(recording);
    const isPending = visit.status === '录音上传中';
    const uploadedCount = isPending
      ? (pendingVisitIndex++ % 2 === 0 ? Math.floor(fragmentCount / 2) : 0)
      : fragmentCount;
    for (let fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex++) {
      const offset = fragmentIndex * 300;
      const fragmentSeconds = Math.min(300, durationSeconds - offset);
      const uploaded = fragmentIndex < uploadedCount;
      uploads.push({ linkedDemo: true, businessId: visit.businessId, recordingId: visit.recordingId,
        fragmentId: `FRAGMENT-${visit.businessId}-${pad(fragmentIndex + 1)}`,
        date: visit.date, advisorName: visit.advisor, sn: visit.badgeSn, sequence: String(fragmentIndex + 1),
        audioTime: `${clock(seconds(visit.startTime) + offset)}—${clock(seconds(visit.startTime) + offset + fragmentSeconds)}`,
        duration: clock(fragmentSeconds), size: `${(fragmentSeconds / 60 * 0.9).toFixed(1)} MB`,
        status: uploaded ? '已上传' : '未上传',
        completedAt: uploaded ? `${visit.date} ${visit.updatedAt}` : '未上传' });
    }
  });
  const events = [];
  const badgeDayVisits = new Map();
  visits.filter(visit => visit.badgeSn).forEach(visit => {
    const key = `${visit.badgeSn}|${visit.date}`;
    if (!badgeDayVisits.has(key)) badgeDayVisits.set(key, []);
    badgeDayVisits.get(key).push(visit);
  });
  badgeDayVisits.forEach(dayVisits => {
    const visit = dayVisits[0];
    const timeline = new Map();
    const active = dayVisits.filter(item => item.status !== '无录音');
    if (active.length) {
      timeline.set('07:55:00|power-on', { type: 'power-on', label: '工牌开机', time: '07:55:00', color: 'green' });
      active.forEach(item => {
        if (!item.recordingId) return;
        timeline.set(`${item.startTime}|recording-start`, { type: 'recording-start', label: '开始录音', time: item.startTime, icon: '录', color: 'blue' });
        timeline.set(`${item.endTime}|recording-end`, { type: 'recording-end', label: '结束录音', time: item.endTime, icon: '停', color: 'red' });
      });
      const offTime = clock(Math.max(...active.map(item => seconds(item.endTime))) + 60);
      timeline.set(`${offTime}|power-off`, { type: 'power-off', label: '工牌关机', time: offTime, color: 'neutral' });
    }
    events.push({ linkedDemo: true, date: visit.date, sn: visit.badgeSn, employeeName: visit.advisor,
      storeName: visit.store, powerOnDuration: active.length ? '12:05:00' : '—',
      uploadedRecordingDuration: '—', events: [...timeline.values()].sort((a, b) => a.time.localeCompare(b.time)) });
  });
  badges.forEach(badge => { badge.pendingUploads = uploads.filter(upload => upload.sn === badge.sn && upload.status !== '已上传').length; });
  const byVisit = new Map(visits.map(record => [record.businessId, record]));
  const byLead = new Map(leads.map(record => [record.id, record]));
  const byRecording = new Map(recordings.map(record => [record.audioId, record]));
  const byBadge = new Map(badges.map(record => [record.sn, record]));
  function listUrl(kind, id) {
    if (kind === 'lead') return `../leads/index.html?${new URLSearchParams({ route: 'leads', focusLeadId: id })}`;
    if (kind === 'recording') return `../session/index.html?${new URLSearchParams({ route: 'session', focusRecordingId: id })}`;
    const record = byVisit.get(id);
    return `../device-management/index.html#visits?${new URLSearchParams({ businessId: id, date: record?.date || '' })}`;
  }
  function badgeUrl(sn, date) {
    const badge = byBadge.get(sn);
    return `../device-management/index.html#store-badges?${new URLSearchParams({ brand: badge.brand, store: badge.storeCode, sn, date })}`;
  }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  function buildLeadPayload(lead) {
    const visit = byVisit.get(lead.businessId);
    const audio = byRecording.get(lead.recordingIds[0]);
    return { linkedDemo: true, leadId: lead.id, businessId: lead.businessId, badgeSn: lead.badgeSn,
      store: lead.store, advisorName: lead.advisorName, customer: lead.customerName, leadStatus: lead.leadStatus,
      lastTouchTime: lead.lastContact, subtitle: `${lead.customerPhone} · ${lead.carSeries}`,
      heroTags: [lead.customerPhone, lead.carSeries], intentLevel: lead.intentLevel,
      models: audio?.status === '已完成' ? [lead.carSeries] : ['—'], intentText: lead.summary,
      evidenceText: audio?.status === '已完成' ? `本次${lead.qcScene}的录音已完成分析；顾问${lead.advisorName}，客户${lead.customerName}，关联业务 ID ${lead.businessId}。`
        : `本次到访状态：${visit.status}。${visit.detailText === '—' ? '暂无完成的录音分析结果。' : visit.detailText}`,
      evolutionSteps: [{ label: lead.qcScene, meta: `${visit.date.slice(5).replace('-', '/')} ${visit.startTime.slice(0, 5)}`,
        level: lead.intentLevel, entryKey: 'linked-visit', time: `${visit.date} ${visit.startTime}`, recordingId: audio?.audioId,
        scene: lead.qcScene, summary: lead.summary, status: visit.status }],
      actionText: lead.action, reminderBadge: '建议跟进', reminderTime: lead.followUpTime,
      conversationTags: audio?.status === '已完成' ? lead.tags : [visit.status, '待完成分析'],
      publicProfile: { groups: [[{ label: `${lead.province} ${lead.city}`, tone: 'green', icon: '../assets/lead-tag-public-location-v2.svg' },
        { label: lead.carSeries, tone: 'blue', icon: '../assets/lead-tag-public-car-status.svg' }]] } };
  }
  function renderLeadJourney(payload, host) {
    const timeline = host.querySelector('.lead-journey-scroll');
    if (!timeline) return;
    const visit = byVisit.get(payload.businessId);
    const back = host.querySelector('.lead-detail-back-button');
    if (back) back.outerHTML = `<a class="btn lead-detail-back-button" href="${escape(listUrl('lead', payload.leadId))}">返回线索列表</a>`;
    timeline.innerHTML = `<div class="journey-axis-track" aria-hidden="true">
      </div>${payload.evolutionSteps.map(entry => `<div class="journey-item" data-lead-journey-entry="${escape(entry.entryKey)}">
      <div class="journey-header">
      <div class="journey-headline">
      <div class="journey-time">${escape(entry.time)}</div>
      <div class="journey-level">${escape(entry.scene)} · ${escape(entry.level)}</div>
      </div>${entry.recordingId ? `<div class="journey-call-id">
      <span class="journey-call-id-label">录音ID</span>
      <a class="lead-journey-session-link" data-lead-session-link="true" data-session-id="${escape(entry.recordingId)}" data-session-date="${visit.date.replaceAll('-', '/')}" data-session-scene="${escape(entry.scene)}">
      <span class="journey-call-id-value">${escape(entry.recordingId)}</span>
      <span class="journey-call-id-arrow" aria-hidden="true">
      </span>
      </a>
      </div>` : ''}</div>
      <div class="journey-axis" aria-hidden="true">
      <span class="journey-axis-dot">
      </span>
      </div>
      <div class="journey-body">
      <div class="journey-section">
      <div class="journey-section-label">
      <img class="journey-section-icon" src="../assets/journey-summary.svg" alt="" />会话小结</div>
      <div class="journey-section-content">${escape(entry.summary)}</div>
      </div>
      <div class="journey-section">
      <div class="journey-section-label">
      <img class="journey-section-icon" src="../assets/journey-follow.svg" alt="" />策略跟进</div>
      <div class="journey-section-content">${escape(payload.actionText)}</div>
      </div>
      <div class="journey-section">
      <div class="journey-section-label">关联记录</div>
      <div class="journey-section-content">
      <a class="text-btn" href="${escape(listUrl('visit', visit.businessId))}">到访 ${escape(visit.businessId)}</a>${visit.badgeSn ? ` · <a class="text-btn" href="${escape(badgeUrl(visit.badgeSn, visit.date))}">工牌 ${escape(visit.badgeSn)}</a>` : ''}<p>匹配状态：${escape(entry.status)}</p>
      </div>
      </div>
      </div>
      </div>`).join('')}`;
  }
  function applyRecordingDetail(record, host, playerState) {
    const visit = byVisit.get(record.businessId);
    const setText = (selector, value) => { const node = host.querySelector(selector); if (node) node.textContent = value; };
    const setHtml = (selector, value) => { const node = host.querySelector(selector); if (node) node.innerHTML = value; };
    setText('#sessionDetailRecordId', `录音ID: ${record.audioId}`);
    setText('#sessionDetailStore', `${record.store} · ${record.advisorName}`);
    setText('#sessionDetailDate', `日期: ${record.startTime.slice(0, 10).replaceAll('-', '/')}`);
    setText('#sessionDetailContextPill', `${record.customerName} / ${record.scenario} / ${record.status}`);
    playerState.duration = Math.floor(record.durationMs / 1000);
    playerState.currentTime = 0;
    const completed = record.status === '已完成';
    const resultText = completed ? record.summary : record.status === '模型分析中' ? '转写已完成，洞察生成中。' : `本次到访状态为${visit.status}，暂无完成的转写和洞察。`;
    setText('.session-ai-sketch-text', resultText);
    setHtml('#sessionDetailSketchCloud', (completed ? [record.customerName, record.carSeries, record.store, record.scenario] : [record.status]).map(value => `<span class="lead-cloud-term blue md"><span class="lead-cloud-term-copy">${escape(value)}</span></span>`).join(''));
    setHtml('.session-ai-intention-tags', `<span class="tag-pill level-medium">意向等级：${completed ? escape(record.intentLevel) : '—'}</span><span class="tag-pill">意向车型：${completed ? escape(record.carSeries) : '—'}</span>`);
    setHtml('.session-ai-intention-list', `<div class="session-ai-intention-row"><p>${escape(resultText)}</p></div><div class="session-ai-intention-row"><p>客户：${escape(record.customerName)} · ${escape(record.customerPhone)}；顾问：${escape(record.advisorName)} · ${escape(record.advisorId)}</p></div>`);
    setHtml('.session-ai-suggestion-card', `<div class="session-ai-suggestion-head"><div class="session-ai-suggestion-title"><strong>建议跟进</strong></div><div class="session-ai-suggestion-time"><span>建议二次跟进时间</span><strong>${escape(record.followUpTime)}</strong></div></div><p>${escape(record.action)}</p>`);
    const portrait = completed ? [['需求特征', record.summary], ['关注车型', record.carSeries], ['到访场景', record.scenario], ['地区', `${record.province} ${record.city}`]] : [['处理状态', visit.status], ['待处理原因', visit.detailText]];
    setHtml('.session-ai-portrait-grid', portrait.map(([label, value]) => `<div class="session-ai-portrait-item"><div class="session-ai-portrait-head"><span class="session-ai-portrait-title">${escape(label)}</span></div><div class="session-ai-portrait-lines"><div class="session-ai-portrait-line"><span>${escape(value)}</span></div></div></div>`).join(''));
    setHtml('#sessionAiTranscriptPanel .transcript-list', record.transcript.length ? record.transcript.map((segment, index) => `<div class="bubble ${index % 2 ? 'customer' : 'sales'} transcript-bubble" data-session-transcript-id="seg-${index + 1}" data-session-transcript-time="${segment.time}" tabindex="0" role="button"><div class="bubble-head"><span>${escape(segment.speaker)} · ${pad(Math.floor(segment.time / 60))}:${pad(segment.time % 60)}</span></div><div class="bubble-copy"${index === 0 ? ' id="sessionDetailGreeting"' : ''}>${escape(segment.text)}</div></div>`).join('') : `<p class="muted-text">${escape(resultText)}</p>`);
    const actions = host.querySelector('.session-detail-actions-main');
    if (actions) actions.innerHTML = `<a class="btn" href="${escape(listUrl('recording', record.audioId))}">返回录音列表</a><a class="btn" href="${escape(listUrl('lead', record.leadId))}">关联线索</a><a class="btn" href="${escape(listUrl('visit', visit.businessId))}">关联到访</a>${visit.badgeSn ? `<a class="btn" href="${escape(badgeUrl(visit.badgeSn, visit.date))}">工牌记录</a>` : ''}`;
  }
  function buildOrganizationView(base) {
    if (!base) return base;
    const combined = [...base.dealers];
    stores.forEach(dealer => {
      const advisors = badges.filter(badge => badge.dealer === dealer).map(badge => ({ advisorName: badge.advisorName, advisorId: badge.advisorId }));
      const existing = combined.findIndex(item => item.brand === dealer.brand && item.dealerCode === dealer.dealerCode);
      const oldAdvisors = existing < 0 ? [] : combined[existing].advisors;
      const extended = { ...dealer, advisors: [...oldAdvisors, ...advisors] };
      if (existing < 0) combined.push(extended); else combined[existing] = extended;
    });
    const trees = {};
    ['region', 'province'].forEach(dimension => {
      const roots = [];
      combined.forEach(dealer => dealer.advisors.forEach(advisor => {
        const labels = [...base.getDealerPath(dealer, dimension).split(' > '), advisor.advisorName];
        let nodes = roots, path = '';
        labels.forEach((label, index) => {
          path = path ? `${path} > ${label}` : label;
          let node = nodes.find(item => item.path === path);
          if (!node) { node = { path, label, type: index === labels.length - 1 ? 'advisor' : index === labels.length - 2 ? 'dealer' : 'organization', dealerCode: dealer.dealerCode, advisorId: index === labels.length - 1 ? advisor.advisorId : '', children: index === labels.length - 1 ? undefined : [] }; nodes.push(node); }
          nodes = node.children || [];
        });
      }));
      trees[dimension] = roots;
    });
    const flatten = nodes => nodes.flatMap(node => [node, ...flatten(node.children || [])]);
    const flat = { region: flatten(trees.region), province: flatten(trees.province) };
    function roots(dimension = 'region', brand = '全部') { return brand === '全部' ? trees[dimension] : trees[dimension].find(node => node.label === base.normalizeBrand(brand))?.children || []; }
    return { ...base, getRootNodes: roots,
      getColumns(path = '全部组织', dimension = 'region', brand = '全部') {
        const columns = []; let nodes = roots(dimension, brand);
        while (nodes.length) { columns.push(nodes); const active = nodes.find(node => path === node.path || path.startsWith(`${node.path} > `)); if (!active?.children?.length) break; nodes = active.children; }
        return columns;
      },
      findNode: (path, dimension = 'region') => flat[dimension].find(node => node.path === path) || null,
      search(query, dimension = 'region', brand = '全部') { const keyword = String(query).trim().toLowerCase().replace(/\s/g, ''); return flat[dimension].filter(node => (brand === '全部' || node.path.startsWith(`${base.normalizeBrand(brand)} > `)) && `${node.label} ${node.path} ${node.dealerCode} ${node.advisorId}`.toLowerCase().replace(/\s/g, '').includes(keyword)).slice(0, 80); }
    };
  }

  global.AIQCLinkedDemo = { dateRange, stores, visits, legacyVisits, leads, recordings, badges, uploads, events,
    getVisit: id => byVisit.get(id), getLead: id => byLead.get(id), getRecording: id => byRecording.get(id), getBadge: sn => byBadge.get(sn),
    listUrl, badgeUrl, buildLeadPayload, renderLeadJourney, applyRecordingDetail, buildOrganizationView };
})(window);
