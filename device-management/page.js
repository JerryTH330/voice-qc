const pageMeta = {
  stores: {
    title: '门店总览',
    description: '按查询日期、品牌、组织和门店名称查看员工与工牌绑定情况',
    actions: [{ label: '导出门店', style: 'recording-primary', action: 'export' }]
  },
  badges: {
    title: '工牌明细',
    description: '查看当前绑定员工的录音、连接、剩余电量、剩余内存与上传状态',
    actions: [{ label: '导出明细', style: 'recording-primary', action: 'export' }]
  },
  events: {
    title: '工牌详情',
    description: '查看当前顾问工牌的设备事件和录音上传记录',
    actions: [{ label: '导出事件', style: 'ghost', action: 'export' }]
  },
  uploads: {
    title: '工牌详情',
    description: '查看当前顾问工牌的设备事件和录音上传记录',
    actions: [{ label: '导出日志', style: 'ghost', action: 'export' }]
  },
  visits: {
    title: '到访明细',
    description: '查看销售助手到访数据与工牌录音的完整处理状态',
    actions: [
      { label: '导出', style: 'ghost', action: 'export' },
      { label: '模板导入', style: 'primary', action: 'import' }
    ]
  },
  dashboard: {
    title: '录音匹配排查',
    description: '按组织和员工查看已匹配到访占全部到访的比例',
    actions: [{ label: '导出报表', style: 'ghost', action: 'export' }]
  }
};

const badgeEventRecords = [
  {
    date: '2026-08-11',
    sn: 'MN-BDG-004821',
    employeeName: '陈佳',
    storeName: '上海浦东体验中心',
    powerOnDuration: '06:42:00',
    uploadedRecordingDuration: '05:55:00',
    events: [
      { type: 'power-on', label: '工牌开机', time: '08:03:32', icon: '开', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '08:05:00', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '10:36:57', icon: '停', color: 'red' },
      { type: 'power-off', label: '工牌关机', time: '10:36:57', icon: '关', color: 'neutral' },
      { type: 'charging-start', label: '开始充电', time: '10:36:59', icon: '充', color: 'violet' },
      { type: 'charging-end', label: '结束充电', time: '11:35:58', icon: '满', color: 'neutral' },
      { type: 'power-on', label: '工牌开机', time: '11:36:00', icon: '开', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '11:36:13', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '14:59:16', icon: '停', color: 'red' },
      { type: 'low-battery', label: '工牌电量预警', time: '15:43:00', icon: '低', color: 'red', note: '剩余电量 19%' },
      { type: 'power-off', label: '工牌关机', time: '15:44:35', icon: '关', color: 'neutral' }
    ]
  },
  {
    date: '2026-08-11',
    sn: 'MN-BDG-004836',
    employeeName: '李洋',
    storeName: '上海浦东体验中心',
    powerOnDuration: '08:40:00',
    uploadedRecordingDuration: '03:15:00',
    events: [
      { type: 'power-on', label: '工牌开机', time: '08:30:00', icon: '开', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '08:45:00', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '12:00:00', icon: '停', color: 'red' },
      { type: 'low-battery', label: '工牌电量预警', time: '16:00:00', icon: '低', color: 'red', note: '剩余电量 18%' },
      { type: 'charging-start', label: '开始充电', time: '16:15:00', icon: '充', color: 'violet' },
      { type: 'charging-end', label: '结束充电', time: '17:00:00', icon: '满', color: 'neutral' },
      { type: 'power-off', label: '工牌关机', time: '17:10:00', icon: '关', color: 'neutral' }
    ]
  }
];

const badgeEventDefaultFilters = {
  date: '2026-08-11',
  sn: 'MN-BDG-004821',
  type: 'all'
};

const badgeEventFilterState = { ...badgeEventDefaultFilters };
const badgeSecondaryEventTypes = new Set(['recording-start', 'recording-end', 'low-battery']);
const badgeRecordState = {
  sn: badgeEventDefaultFilters.sn,
  advisorName: '陈佳'
};

const badgeUploadRecords = [
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '1', audioTime: '13:03:03—13:08:03', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-12 13:08:41' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '2', audioTime: '13:08:03—13:13:03', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-12 13:13:42' },
  { date: '2026-08-12', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '3', audioTime: '13:25:58—13:30:58', duration: '00:05:00', size: '4.7 MB', status: '未上传', completedAt: '未上传' },
  { date: '2026-08-12', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '4 · 结束片段', audioTime: '13:30:58—13:35:58', duration: '00:05:00', size: '4.6 MB', status: '未上传', completedAt: '未上传' }
];

const badgeUploadDefaultFilters = {
  startDateTime: '2026-08-12T00:00:00',
  endDateTime: '2026-08-12T23:59:59',
  status: '全部状态'
};
const badgeUploadFilterState = { ...badgeUploadDefaultFilters };

const visitDefaultFilters = {
  startDateTime: '2026-08-11T00:00:00',
  endDateTime: '2026-08-12T23:59:59',
  organization: '全部组织',
  advisor: '全部销售顾问',
  source: '全部来源',
  status: '全部状态',
  query: ''
};
const visitFilterState = { ...visitDefaultFilters };
const visitProcessingStatuses = new Set(['录音转写中', '模型分析中']);
const visitRecords = [
  { businessId: 'BIZ-20260812-0136', customerId: 'C202608120315', customerName: '王先生', customerPhone: '138****0628', date: '2026-08-12', startTime: '13:04:00', endTime: '13:28:00', status: '已匹配', detailText: '已匹配 5 个录音片段', completedAt: '13:36:10', advisor: '陈佳', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '13:36:10', scene: '进店接待', carSeries: '星海 S7', detailKey: 'matched', weight: 1142 },
  { businessId: 'BIZ-20260812-0148', customerId: 'C202608120342', customerName: '赵女士', customerPhone: '159****8312', date: '2026-08-12', startTime: '13:22:45', endTime: '13:56:08', status: '录音上传中', detailText: '可能存在未上传录音', completedAt: '—', advisor: '李洋', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '14:14:02', scene: '试乘试驾', carSeries: '星海 L9', detailKey: 'uploading', weight: 67 },
  { businessId: 'BIZ-20260812-0162', customerId: 'C202608120368', customerName: '吴先生', customerPhone: '137****5220', date: '2026-08-12', startTime: '15:06:18', endTime: '15:42:31', status: '模型分析中', detailText: '已完成转写，等待模型分析', completedAt: '—', advisor: '陈佳', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '15:48:20', scene: '进店接待', carSeries: '星海 S7', detailKey: 'uploading', weight: 43 },
  { businessId: 'BIZ-20260811-0831', customerId: 'C202608110922', customerName: '刘先生', customerPhone: '186****1045', date: '2026-08-11', startTime: '18:31:35', endTime: '18:31:55', status: '到访时段无录音', detailText: '工牌开机但未开启录音', completedAt: '—', advisor: '韩如臣', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '18:32:06', scene: '进店接待', carSeries: '星海 S7', detailKey: 'no-record', weight: 17 },
  { businessId: 'BIZ-20260811-0772', customerId: 'C202608110861', customerName: '周女士', customerPhone: '135****2776', date: '2026-08-11', startTime: '16:23:41', endTime: '17:08:02', status: '员工未绑定工牌', detailText: '到访时点无有效绑定关系', completedAt: '—', advisor: '周宁', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '模板导入', updatedAt: '17:09:11', scene: '进店接待', carSeries: '星海 V6', detailKey: 'unbound', weight: 17 }
];

const matchingDefaultFilters = {
  startDateTime: '2026-08-11T00:00:00',
  endDateTime: '2026-08-12T23:59:59',
  organization: '全国',
  advisor: '全部销售顾问',
  dimension: 'store'
};
const matchingFilterState = { ...matchingDefaultFilters };
const matchingStoreRecords = [
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '上海战区', name: '上海浦东体验中心', advisors: ['陈佳', '李洋'], visits: 186, matched: 174, uploading: 4, processing: 3, unbound: 1, powerOff: 1, noRecord: 2, other: 1 },
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '浙江战区', name: '杭州滨江体验中心', advisors: ['韩如臣'], visits: 148, matched: 132, uploading: 7, processing: 4, unbound: 1, powerOff: 1, noRecord: 2, other: 1 },
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '江苏战区', name: '苏州园区体验中心', advisors: ['周宁'], visits: 126, matched: 104, uploading: 10, processing: 5, unbound: 2, powerOff: 2, noRecord: 2, other: 1 }
];
const matchingAdvisorRecords = [
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '上海战区', name: '陈佳', visits: 100, matched: 95, uploading: 2, processing: 1, unbound: 0, powerOff: 0, noRecord: 1, other: 1 },
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '上海战区', name: '李洋', visits: 86, matched: 79, uploading: 2, processing: 2, unbound: 1, powerOff: 1, noRecord: 1, other: 0 },
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '浙江战区', name: '韩如臣', visits: 148, matched: 132, uploading: 7, processing: 4, unbound: 1, powerOff: 1, noRecord: 2, other: 1 },
  { date: '2026-08-12', brand: '星海汽车', region: '华东大区', zone: '江苏战区', name: '周宁', visits: 126, matched: 104, uploading: 10, processing: 5, unbound: 2, powerOff: 2, noRecord: 2, other: 1 }
];

function syncFilterControls(selector, state) {
  document.querySelectorAll(selector).forEach((control) => {
    const key = control.dataset.badgeUploadFilter || control.dataset.visitFilter || control.dataset.matchingFilter;
    if (key && Object.hasOwn(state, key)) control.value = state[key];
  });
}

function readFilterControls(selector, state) {
  document.querySelectorAll(selector).forEach((control) => {
    const key = control.dataset.badgeUploadFilter || control.dataset.visitFilter || control.dataset.matchingFilter;
    if (key && Object.hasOwn(state, key)) state[key] = control.value;
  });
}

function getRecordDateTime(date, time = '00:00:00') {
  return `${date}T${time}`;
}

function isWithinDateTimeRange(value, startDateTime, endDateTime) {
  return (!startDateTime || value >= startDateTime) && (!endDateTime || value <= endDateTime);
}

function getFilteredBadgeUploadRecords() {
  return getCurrentBadgeUploadRecords().filter((item) => {
    const startTime = item.audioTime.split('—')[0] || '00:00:00';
    const dateTime = getRecordDateTime(item.date, startTime);
    const dateMatch = isWithinDateTimeRange(dateTime, badgeUploadFilterState.startDateTime, badgeUploadFilterState.endDateTime);
    const statusMatch = badgeUploadFilterState.status === '全部状态' || item.status === badgeUploadFilterState.status;
    return dateMatch && statusMatch;
  });
}

function normalizeDeviceQuery(value) {
  return String(value || '').trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
}

function getFilteredVisitRecords() {
  const query = normalizeDeviceQuery(visitFilterState.query);
  return visitRecords.filter((item) => {
    const dateMatch = isWithinDateTimeRange(getRecordDateTime(item.date, item.startTime), visitFilterState.startDateTime, visitFilterState.endDateTime);
    const organizationMatch = visitFilterState.organization === '全部组织'
      || item.region === visitFilterState.organization
      || item.zone === visitFilterState.organization;
    const advisorMatch = visitFilterState.advisor === '全部销售顾问' || item.advisor === visitFilterState.advisor;
    const sourceMatch = visitFilterState.source === '全部来源' || item.source === visitFilterState.source;
    const statusMatch = visitFilterState.status === '全部状态' || item.status === visitFilterState.status;
    const queryMatch = !query || [item.businessId, item.customerId, item.customerName, item.customerPhone]
      .some((value) => normalizeDeviceQuery(value).includes(query));
    return dateMatch && organizationMatch && advisorMatch && sourceMatch && statusMatch && queryMatch;
  });
}

function formatDeviceCount(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function getVisitStatusClass(status) {
  if (status === '已匹配') return 'success';
  if (status === '录音上传中' || visitProcessingStatuses.has(status)) return 'waiting';
  return 'danger';
}

function renderVisits() {
  const tbody = document.getElementById('visitTableBody');
  if (!tbody) return;
  const records = getFilteredVisitRecords();
  const sumWeight = (predicate = () => true) => records.filter(predicate).reduce((total, item) => total + item.weight, 0);
  const total = sumWeight();
  const matched = sumWeight((item) => item.status === '已匹配');
  const uploading = sumWeight((item) => item.status === '录音上传中');
  const processing = sumWeight((item) => visitProcessingStatuses.has(item.status));
  const problems = total - matched - uploading - processing;
  const metrics = {
    visitMetricTotal: total,
    visitMetricMatched: matched,
    visitMetricUploading: uploading,
    visitMetricProcessing: processing,
    visitMetricProblems: problems
  };
  Object.entries(metrics).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = formatDeviceCount(value);
  });
  const resultSummary = document.getElementById('visitResultSummary');
  const paginationTotal = document.getElementById('visitPaginationTotal');
  if (resultSummary) resultSummary.textContent = `共 ${formatDeviceCount(total)} 条 · 匹配状态按当前最新处理状态展示`;
  if (paginationTotal) paginationTotal.textContent = `共 ${formatDeviceCount(total)} 条`;
  tbody.innerHTML = records.length ? records.map((item) => {
    const tone = getVisitStatusClass(item.status);
    const detailTone = tone === 'danger' ? ' danger-text' : '';
    return `<tr>
      <td>${escapeBadgeHtml(item.businessId)}</td><td>${escapeBadgeHtml(item.customerId)}</td><td>${escapeBadgeHtml(item.customerName)}</td><td>${escapeBadgeHtml(item.customerPhone)}</td>
      <td>${escapeBadgeHtml(item.date)}</td><td>${escapeBadgeHtml(item.startTime)}</td><td>${escapeBadgeHtml(item.endTime)}</td><td><span class="status ${tone}">${escapeBadgeHtml(item.status)}</span></td>
      <td><button class="text-btn${detailTone} open-detail" data-detail="${escapeBadgeHtml(item.detailKey)}">${escapeBadgeHtml(item.detailText)}</button></td><td>${escapeBadgeHtml(item.completedAt)}</td>
      <td>${escapeBadgeHtml(item.advisor)}</td><td>${escapeBadgeHtml(item.store)}</td><td>${escapeBadgeHtml(item.storeCode)}</td><td><span class="source-tag ${item.source === '销售助手' ? 'api' : 'excel'}">${escapeBadgeHtml(item.source)}</span></td>
      <td>${escapeBadgeHtml(item.updatedAt)}</td><td>${escapeBadgeHtml(item.scene)}</td><td>${escapeBadgeHtml(item.carSeries)}</td><td class="sticky-right"><button class="text-btn open-detail" data-detail="${escapeBadgeHtml(item.detailKey)}">查看</button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="18" class="badge-record-empty">当前筛选条件下暂无到访记录。</td></tr>';
}

function getFilteredMatchingRecords() {
  const source = matchingFilterState.dimension === 'advisor' ? matchingAdvisorRecords : matchingStoreRecords;
  return source.filter((item) => {
    const dateMatch = isWithinDateTimeRange(getRecordDateTime(item.date), matchingFilterState.startDateTime, matchingFilterState.endDateTime);
    const organizationMatch = matchingFilterState.organization === '全国'
      || item.region === matchingFilterState.organization
      || item.zone === matchingFilterState.organization;
    const advisorMatch = matchingFilterState.advisor === '全部销售顾问'
      || (matchingFilterState.dimension === 'advisor' ? item.name === matchingFilterState.advisor : item.advisors.includes(matchingFilterState.advisor));
    return dateMatch && organizationMatch && advisorMatch;
  });
}

function renderMatchingDashboard() {
  const tbody = document.getElementById('matchingTableBody');
  const thead = document.getElementById('matchingTableHead');
  if (!tbody || !thead) return;
  const records = getFilteredMatchingRecords();
  const sum = (key) => records.reduce((total, item) => total + item[key], 0);
  const visits = sum('visits');
  const matched = sum('matched');
  const processing = sum('uploading') + sum('processing');
  const problems = sum('unbound') + sum('powerOff') + sum('noRecord') + sum('other');
  const rate = visits ? matched / visits * 100 : 0;
  const metricValues = {
    matchingMetricVisits: formatDeviceCount(visits),
    matchingMetricMatched: formatDeviceCount(matched),
    matchingMetricRate: `${rate.toFixed(1)}%`,
    matchingMetricProcessing: formatDeviceCount(processing),
    matchingMetricProblems: formatDeviceCount(problems),
    matchingMetricRateNote: `${formatDeviceCount(matched)} ÷ ${formatDeviceCount(visits)}`,
    matchingPaginationTotal: `共 ${records.length} 条`
  };
  Object.entries(metricValues).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
  document.querySelectorAll('[data-matching-dimension]').forEach((button) => {
    button.classList.toggle('active', button.dataset.matchingDimension === matchingFilterState.dimension);
  });
  const dimensionLabel = matchingFilterState.dimension === 'advisor' ? '销售顾问' : '门店';
  thead.innerHTML = `<tr><th>日期</th><th>品牌</th><th>大区</th><th>战区</th><th>${dimensionLabel}</th><th>到访数</th><th>已匹配</th><th>录音上传中</th><th>转写/分析中</th><th>员工未绑定工牌</th><th>到访时段未开机</th><th>到访时段无录音</th><th>其他失败</th><th>录音匹配率</th><th>问题分类</th></tr>`;
  tbody.innerHTML = records.length ? records.map((item) => {
    const itemRate = item.visits ? item.matched / item.visits * 100 : 0;
    const issueCount = item.unbound + item.powerOff + item.noRecord + item.other;
    const rateTone = itemRate >= 88 ? 'good-rate' : 'bad-rate';
    return `<tr><td>${item.date}</td><td>${item.brand}</td><td>${item.region}</td><td>${item.zone}</td><td><strong>${item.name}</strong></td>
      <td>${item.visits}</td><td>${item.matched}</td><td>${item.uploading}</td><td>${item.processing}</td><td>${item.unbound}</td><td>${item.powerOff}</td><td>${item.noRecord}</td><td>${item.other}</td>
      <td><span class="rate-cell ${rateTone}"><strong>${itemRate.toFixed(1)}%</strong><i><b style="width:${itemRate.toFixed(1)}%"></b></i></span></td>
      <td><button class="text-btn route-target" data-target="visits">查看 ${issueCount} 条问题</button></td></tr>`;
  }).join('') : '<tr><td colspan="15" class="badge-record-empty">当前筛选条件下暂无匹配数据。</td></tr>';
}

function syncBadgeEventFilterControls() {
  const dateInput = document.getElementById('badgeEventDate');
  const typeSelect = document.getElementById('badgeEventType');
  if (dateInput) dateInput.value = badgeEventFilterState.date;
  if (typeSelect) typeSelect.value = badgeEventFilterState.type;
}

function getBadgeRecordProfile() {
  const detailRecord = badgeDetailRecords.find((item) => item.sn === badgeRecordState.sn);
  if (detailRecord) return { advisorName: detailRecord.advisorName, sn: detailRecord.sn };
  const eventRecord = badgeEventRecords.find((item) => item.sn === badgeRecordState.sn);
  if (eventRecord) return { advisorName: eventRecord.employeeName, sn: eventRecord.sn };
  return { advisorName: badgeRecordState.advisorName || '—', sn: badgeRecordState.sn || '—' };
}

function renderBadgeRecordHeader() {
  const profile = getBadgeRecordProfile();
  badgeRecordState.advisorName = profile.advisorName;
  const avatar = document.getElementById('badgeRecordAvatar');
  const advisorName = document.getElementById('badgeRecordAdvisorName');
  const sn = document.getElementById('badgeRecordSn');
  if (avatar) avatar.textContent = profile.advisorName === '—' ? '—' : profile.advisorName.slice(0, 1);
  if (advisorName) advisorName.textContent = profile.advisorName;
  if (sn) sn.textContent = profile.sn;
}

function getCurrentBadgeUploadRecords() {
  const matchedRecords = badgeUploadRecords.filter((item) => item.sn === badgeRecordState.sn);
  if (matchedRecords.length) return matchedRecords;
  const detailRecord = badgeDetailRecords.find((item) => item.sn === badgeRecordState.sn);
  if (!detailRecord) return [];
  const records = [
    { date: detailRecord.queryDate, advisorName: detailRecord.advisorName, sn: detailRecord.sn, sequence: '1', audioTime: '09:10:00—09:15:00', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: `${detailRecord.queryDate} 09:15:38` },
    { date: detailRecord.queryDate, advisorName: detailRecord.advisorName, sn: detailRecord.sn, sequence: '2', audioTime: '09:15:00—09:20:00', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: `${detailRecord.queryDate} 09:20:42` }
  ];
  for (let index = 0; index < detailRecord.pendingUploads; index += 1) {
    records.push({ date: detailRecord.queryDate, advisorName: detailRecord.advisorName, sn: detailRecord.sn, sequence: String(index + 3), audioTime: `10:${String(index * 5).padStart(2, '0')}:00—10:${String(index * 5 + 5).padStart(2, '0')}:00`, duration: '00:05:00', size: '4.7 MB', status: '未上传', completedAt: '未上传' });
  }
  return records;
}

function renderBadgeUploads() {
  const tbody = document.getElementById('badgeUploadTableBody');
  if (!tbody) return;
  const records = getFilteredBadgeUploadRecords();
  const completed = records.filter((item) => item.status === '已上传').length;
  const pending = records.length - completed;
  const rate = records.length ? `${(completed / records.length * 100).toFixed(1)}%` : '—';
  const summary = {
    badgeUploadTotal: records.length,
    badgeUploadCompleted: completed,
    badgeUploadPending: pending,
    badgeUploadRate: rate,
    badgeUploadPaginationTotal: `共 ${records.length} 条`
  };
  Object.entries(summary).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
  tbody.innerHTML = records.length ? records.map((item) => `<tr>
    <td>${escapeBadgeHtml(item.date)}</td><td>${escapeBadgeHtml(item.advisorName)}</td><td>${escapeBadgeHtml(item.sn)}</td><td>${escapeBadgeHtml(item.sequence)}</td>
    <td>${escapeBadgeHtml(item.audioTime)}</td><td>${escapeBadgeHtml(item.duration)}</td><td>${escapeBadgeHtml(item.size)}</td>
    <td><span class="status ${item.status === '已上传' ? 'success' : 'waiting'}">${escapeBadgeHtml(item.status)}</span></td>
    <td class="${item.status === '已上传' ? '' : 'muted-text'}">${escapeBadgeHtml(item.completedAt)}</td>
  </tr>`).join('') : '<tr><td colspan="9" class="badge-record-empty">当前工牌暂无录音上传记录。</td></tr>';
}

function selectBadgeRecord(sn, advisorName) {
  badgeRecordState.sn = sn || badgeRecordState.sn;
  badgeRecordState.advisorName = advisorName || badgeRecordState.advisorName;
  badgeEventFilterState.sn = badgeRecordState.sn;
  const eventRecord = badgeEventRecords.find((item) => item.sn === badgeRecordState.sn);
  if (eventRecord) badgeEventFilterState.date = eventRecord.date;
  const uploadDate = getCurrentBadgeUploadRecords()[0]?.date;
  if (uploadDate) {
    badgeUploadFilterState.startDateTime = `${uploadDate}T00:00:00`;
    badgeUploadFilterState.endDateTime = `${uploadDate}T23:59:59`;
    badgeUploadFilterState.status = '全部状态';
  }
  syncBadgeEventFilterControls();
  syncFilterControls('[data-badge-upload-filter]', badgeUploadFilterState);
  renderBadgeRecordHeader();
  renderBadgeEvents();
  renderBadgeUploads();
}

function syncBadgeRecordTabs(route) {
  const activeTab = route === 'uploads' ? 'uploads' : 'events';
  document.querySelectorAll('[data-badge-record-tab]').forEach((button) => {
    const active = button.dataset.badgeRecordTab === activeTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-badge-record-content]').forEach((content) => {
    content.hidden = content.dataset.badgeRecordContent !== activeTab;
  });
}

function renderBadgeEvents() {
  const timeline = document.getElementById('badgeEventTimeline');
  const summary = document.getElementById('badgeEventResultSummary');
  if (!timeline || !summary) return;

  const normalizedSn = badgeEventFilterState.sn.trim().toLowerCase();
  const record = badgeEventRecords.find((item) => item.date === badgeEventFilterState.date
    && (!normalizedSn || item.sn.toLowerCase() === normalizedSn));

  if (!record) {
    summary.textContent = `${badgeEventFilterState.date || '未选择日期'} · 共 0 条`;
    timeline.innerHTML = '<div class="event-empty-state">当前日期和工牌 SN 下暂无事件，请检查 SN 是否完整或调整查询日期。</div>';
    return;
  }

  const visibleEvents = (badgeEventFilterState.type === 'all'
    ? record.events
    : record.events.filter((item) => item.type === badgeEventFilterState.type))
    .slice()
    .sort((left, right) => left.time.localeCompare(right.time));
  summary.textContent = `${record.date} · 共 ${visibleEvents.length} 条`;
  timeline.innerHTML = visibleEvents.length ? visibleEvents.map((item) => `
    <article class="${badgeSecondaryEventTypes.has(item.type) ? 'event-secondary' : 'event-primary'}${item.note ? ' event-wide' : ''}">
      <span class="event-dot ${item.color}">${escapeBadgeHtml(item.icon)}</span>
      <div><strong>${escapeBadgeHtml(item.label)}</strong><p>${escapeBadgeHtml(item.time)}</p></div>
      ${item.note ? `<em>${escapeBadgeHtml(item.note)}</em>` : ''}
    </article>`).join('') : '<div class="event-empty-state">当前工牌在所选日期没有该类型事件。</div>';
}

function applyBadgeEventFilters() {
  badgeEventFilterState.date = document.getElementById('badgeEventDate')?.value || '';
  badgeEventFilterState.type = document.getElementById('badgeEventType')?.value || 'all';
  renderBadgeEvents();
}

const detailData = {
  matched: {
    businessId: 'BIZ-20260812-0136',
    status: '已匹配',
    statusClass: 'success',
    html: `
      <section class="detail-section">
        <h3>到访信息</h3>
        <div class="detail-grid"><span><small>客户姓名</small><strong>王先生</strong></span><span><small>客户 ID</small><strong>C202608120315</strong></span><span><small>到访时间</small><strong>2026-08-12 13:04:00—13:28:00</strong></span><span><small>员工 / 工牌</small><strong>陈佳 / MN-BDG-004821</strong></span><span><small>所属门店</small><strong>上海浦东体验中心</strong></span><span><small>匹配完成时间</small><strong>2026-08-12 13:36:10</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>录音匹配</h3>
        <div class="detail-message success-message">2026/08/12 13:36:10 匹配成功</div>
        <div class="fragment-table"><div class="fragment-head"><span>录音片段</span><span>音频时间</span><span>片段时长</span><span>录音上传时间</span></div>
          <div><span>1</span><span>13:03:03—13:08:03</span><span>00:05:00</span><span>13:08:41</span></div>
          <div><span>2</span><span>13:08:03—13:13:03</span><span>00:05:00</span><span>13:13:42</span></div>
          <div><span>3</span><span>13:13:03—13:18:03</span><span>00:05:00</span><span>13:20:34</span></div>
          <div><span>4</span><span>13:18:03—13:23:03</span><span>00:05:00</span><span>13:33:48</span></div>
          <div><span>5</span><span>13:23:03—13:28:03</span><span>00:05:00</span><span>13:34:58</span></div>
        </div>
        <p class="detail-footnote">到访时间只用于命中片段；录音不裁剪、不合并，也不展示跨片段合计时长。</p>
      </section>`
  },
  uploading: {
    businessId: 'BIZ-20260812-0148',
    status: '录音上传中',
    statusClass: 'waiting',
    html: `
      <section class="detail-section">
        <h3>到访信息</h3>
        <div class="detail-grid"><span><small>客户姓名</small><strong>赵女士</strong></span><span><small>客户 ID</small><strong>C202608120342</strong></span><span><small>到访时间</small><strong>2026-08-12 13:22:45—13:56:08</strong></span><span><small>员工 / 工牌</small><strong>李洋 / MN-BDG-004836</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>录音匹配</h3>
        <div class="detail-message waiting-message">可能存在未上传录音，请稍候。录音上传后系统将自动重新匹配。</div>
        <div class="fragment-table"><div class="fragment-head"><span>录音片段</span><span>音频时间</span><span>片段时长</span><span>录音上传时间</span></div>
          <div><span>1</span><span>13:16:05—13:21:05</span><span>00:05:00</span><span class="amber-text">未上传</span></div>
          <div><span>2</span><span>13:20:58—13:25:58</span><span>00:05:00</span><span class="amber-text">未上传</span></div>
          <div><span>3</span><span>13:25:58—13:30:58</span><span>00:05:00</span><span class="amber-text">未上传</span></div>
          <div><span>4</span><span>13:30:58—13:35:58</span><span>00:05:00</span><span class="amber-text">未上传</span></div>
        </div>
        <p class="detail-footnote">未上传明细来自 reclist；无有效上传时间统一显示“未上传”。该状态不设等待截止时间。</p>
      </section>`
  },
  'no-record': {
    businessId: 'BIZ-20260811-0831',
    status: '到访时段无录音',
    statusClass: 'danger',
    html: `
      <section class="detail-section">
        <h3>到访信息</h3>
        <div class="detail-grid"><span><small>客户姓名</small><strong>刘先生</strong></span><span><small>到访时间</small><strong>2026-08-11 18:31:35—18:31:55</strong></span><span><small>员工 / 工牌</small><strong>韩如臣 / MN-BDG-004792</strong></span><span><small>判定结果</small><strong class="danger-text">工牌开机但未开启录音</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>当日录音时段</h3>
        <div class="period-chips"><span>开始边界未知—08:03:32</span><span>09:30:00—10:36:57</span><span>11:36:13—11:42:36</span></div>
      </section>
      <section class="detail-section">
        <h3>工牌日志详情</h3>
        <div class="log-list">
          <article><time>08:03:32</time><div><strong>工牌开机</strong><p class="danger-text">未发现工牌开启录音记录</p></div></article>
          <article><time>09:28:54</time><div><strong>工牌开机</strong></div></article>
          <article><time>09:30:00—10:36:57</time><div><strong>工牌开启录音</strong><p>期间关联牛先生、余先生、蒋女士 3 条已匹配到访</p></div></article>
          <article><time>11:36:13—11:42:36</time><div><strong>工牌开启录音</strong></div></article>
          <article class="log-highlight"><time>18:31:35—18:31:55</time><div><strong>【未匹配】客户（刘先生）到访</strong><p class="danger-text">未发现工牌开启录音记录</p></div></article>
          <article><time>18:32:04</time><div><strong>工牌关机</strong></div></article>
        </div>
      </section>`
  },
  unbound: {
    businessId: 'BIZ-20260811-0772',
    status: '员工未绑定工牌',
    statusClass: 'danger',
    html: `
      <section class="detail-section">
        <h3>到访信息</h3>
        <div class="detail-grid"><span><small>客户姓名</small><strong>周女士</strong></span><span><small>到访时间</small><strong>2026-08-11 16:23:41—17:08:02</strong></span><span><small>员工姓名</small><strong>周宁（A01362）</strong></span><span><small>所属门店</small><strong>苏州园区体验中心</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>匹配证据</h3>
        <div class="detail-message danger-message">到访发生时未找到员工—工牌有效关系</div>
        <div class="match-timeline"><article><i class="done">✓</i><div><strong>收到到访记录</strong><p>销售助手 · 2026-08-11 16:23:35</p></div></article><article><i class="failed">!</i><div><strong>查询到访时点绑定关系</strong><p>未找到 16:23:41 时有效的工牌 SN</p></div></article></div>
      </section>`
  }
};

const routeButtons = Array.from(document.querySelectorAll('.device-nav[data-route]'));
const pagePanels = Array.from(document.querySelectorAll('.page-panel[data-page]'));
const title = document.getElementById('pageTitle');
const description = document.getElementById('pageDescription');
const topActions = document.getElementById('topActions');
const toast = document.getElementById('toast');
const importModal = document.getElementById('importModal');
const visitDrawer = document.getElementById('visitDetail');
const drawerBackdrop = document.getElementById('visitDrawer');
const drawerStatus = document.getElementById('drawerStatus');
const drawerBusinessId = document.getElementById('drawerBusinessId');
const drawerBody = document.getElementById('drawerBody');

const storeOverviewRecords = [
  { brand: '广汽传祺', organization: '华东大区', zone: '上海战区', code: 'SH-PD-001', name: '上海浦东体验中心', employees: 36, badges: 30, boundEmployees: 28, bindings: 28, syncedAt: '2026-08-12 14:18:32' },
  { brand: '广汽传祺', organization: '华东大区', zone: '浙江战区', code: 'HZ-BJ-003', name: '杭州滨江体验中心', employees: 31, badges: 26, boundEmployees: 24, bindings: 24, syncedAt: '2026-08-12 14:17:46' },
  { brand: '广汽埃安', organization: '华东大区', zone: '江苏战区', code: 'SZ-YQ-006', name: '苏州园区体验中心', employees: 27, badges: 23, boundEmployees: 21, bindings: 21, syncedAt: '2026-08-12 14:16:58' },
  { brand: '广汽埃安', organization: '华南大区', zone: '深圳战区', code: 'SZ-NS-008', name: '深圳南山体验中心', employees: 40, badges: 35, boundEmployees: 32, bindings: 32, syncedAt: '2026-08-12 14:15:21' },
  { brand: '广汽传祺', organization: '华南大区', zone: '广州战区', code: 'GZ-TH-002', name: '广州天河体验中心', employees: 38, badges: 33, boundEmployees: 30, bindings: 31, syncedAt: '2026-08-12 14:14:55' },
  { brand: '广汽埃安', organization: '华南大区', zone: '佛山战区', code: 'FS-NH-004', name: '佛山南海体验中心', employees: 29, badges: 25, boundEmployees: 23, bindings: 23, syncedAt: '2026-08-12 14:13:42' },
  { brand: '广汽传祺', organization: '华北大区', zone: '北京战区', code: 'BJ-CY-001', name: '北京朝阳体验中心', employees: 42, badges: 37, boundEmployees: 35, bindings: 35, syncedAt: '2026-08-12 14:12:38' },
  { brand: '广汽埃安', organization: '华北大区', zone: '天津战区', code: 'TJ-HX-005', name: '天津河西体验中心', employees: 26, badges: 22, boundEmployees: 20, bindings: 20, syncedAt: '2026-08-12 14:11:49' },
  { brand: '广汽传祺', organization: '华东大区', zone: '南京战区', code: 'NJ-JN-007', name: '南京江宁体验中心', employees: 33, badges: 29, boundEmployees: 27, bindings: 27, syncedAt: '2026-08-12 14:10:26' },
  { brand: '广汽埃安', organization: '西南大区', zone: '成都战区', code: 'CD-GX-009', name: '成都高新体验中心', employees: 35, badges: 31, boundEmployees: 29, bindings: 29, syncedAt: '2026-08-12 14:09:17' },
  { brand: '广汽传祺', organization: '西南大区', zone: '重庆战区', code: 'CQ-YB-011', name: '重庆渝北体验中心', employees: 30, badges: 26, boundEmployees: 24, bindings: 25, syncedAt: '2026-08-12 14:08:33' },
  { brand: '广汽埃安', organization: '华东大区', zone: '合肥战区', code: 'HF-SX-012', name: '合肥蜀山体验中心', employees: 25, badges: 21, boundEmployees: 19, bindings: 19, syncedAt: '2026-08-12 14:07:45' }
];

function getStoreRelativeDateValue(offsetDays) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return formatStoreDateValue(date);
}

const storeTodayDateValue = getStoreRelativeDateValue(0);
const storeDefaultQueryDate = getStoreRelativeDateValue(-1);
const storeDefaultQueryDateObject = parseStoreDateValue(storeDefaultQueryDate);

const storeOverviewState = {
  brand: '全部品牌',
  organization: '全部组织',
  organizationDraft: '全部组织',
  storeNameQuery: '',
  startDate: storeDefaultQueryDate,
  endDate: storeDefaultQueryDate,
  dateDraftStartDate: storeDefaultQueryDate,
  dateDraftEndDate: storeDefaultQueryDate,
  activeDateField: 'startDate',
  dateViewYear: storeDefaultQueryDateObject.getFullYear(),
  dateViewMonth: storeDefaultQueryDateObject.getMonth() + 1,
  sortKey: '',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
  openFilter: ''
};

const badgeAdvisorNames = [
  '陈佳', '李洋', '王蕾', '赵强', '孙悦', '周明', '许静', '郑昱辰',
  '高翔', '林涛', '张华', '王萌', '刘青', '郭芹', '顾承宇', '韩如臣',
  '周宁', '徐璐', '沈博', '叶晨', '吴桐', '宋妍', '何俊', '方敏',
  '曹阳', '蒋欣', '谢林', '邹悦', '潘明', '罗倩', '冯磊', '杜欣',
  '梁浩', '任洁', '袁凯', '陆瑶', '程峰', '戴宁', '孔明', '白露',
  '邵华', '唐琳', '魏然', '苏晴', '卢晨', '郝悦', '金鹏', '严静'
];

const badgeTypes = ['充电坞版本工牌', '4G版本工牌', '明略Wi-Fi工牌', '智能工牌·LIVE'];

let badgeRecordSequence = 0;
const badgeDetailRecords = storeOverviewRecords.flatMap((store) => Array.from({ length: store.bindings }, () => {
  const index = badgeRecordSequence;
  badgeRecordSequence += 1;
  const connected = index % 31 !== 0;
  const recording = connected && index % 5 === 0;
  const battery = index % 25 === 0 && index < 425 ? 7 + (index % 13) : 56 + ((index * 7) % 43);
  const usedMemory = 28 + ((index * 13) % 68);
  const pendingUploads = index % 48 === 0 ? 1 + (index % 6) : 0;
  const dockConnected = index % 4 === 0;
  return {
    brand: store.brand,
    region: store.organization,
    zone: store.zone,
    store: store.name,
    queryDate: store.syncedAt.slice(0, 10),
    advisorName: badgeAdvisorNames[index % badgeAdvisorNames.length],
    advisorId: `A${String(1728 + index * 17).padStart(5, '0')}`,
    sn: `MN-BDG-${String(4821 + index * 7).padStart(6, '0')}`,
    badgeType: badgeTypes[index % badgeTypes.length],
    recordingStatus: recording ? '录音中' : '—',
    connectionStatus: connected ? '已连接' : '未连接',
    dockConnected,
    signal: index % 3 === 0 ? '信号良好' : index % 3 === 1 ? '一般' : '较弱',
    battery,
    operationLogs: index % 37 === 3 ? [{ ops: 'system', act: 'battery low' }] : [],
    remainingMemory: 100 - usedMemory,
    uptime: connected
      ? `${String(4 + (index % 5)).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')}:${String((index * 17) % 60).padStart(2, '0')}`
      : `${String(index % 3).padStart(2, '0')}:${String((index * 11) % 60).padStart(2, '0')}:${String((index * 19) % 60).padStart(2, '0')}`,
    pendingUploads,
    syncedAt: connected ? `2026-08-13 14:${String(59 - (index % 48)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}` : '2026-08-13 11:18:06'
  };
}));

const badgeDefaultFilters = {
  brand: '全部',
  organization: '全部组织',
  storeNameQuery: '',
  advisorNameQuery: '',
  advisorIdQuery: '',
  snQuery: '',
  queryStartDate: storeDefaultQueryDate,
  queryEndDate: storeDefaultQueryDate,
  collapsed: false
};

const badgeFilterState = { ...badgeDefaultFilters };
const badgeMenuState = {
  openMenu: '',
  organizationDraft: '全部组织',
  dateDraftStartDate: storeDefaultQueryDate,
  dateDraftEndDate: storeDefaultQueryDate,
  activeDateField: 'startDate',
  dateViewYear: storeDefaultQueryDateObject.getFullYear(),
  dateViewMonth: storeDefaultQueryDateObject.getMonth() + 1
};
const badgePaginationState = { page: 1, pageSize: 10 };

function escapeBadgeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getBadgeOrganizationParts(path) {
  return path === '全部组织' ? [] : path.split(' > ');
}

function formatBadgeOrganizationPath(path) {
  return path === '全部组织' ? path : path.replaceAll(' > ', ' / ');
}

function getBadgeOrganizationColumns(path) {
  const [region = '', zone = '', store = ''] = getBadgeOrganizationParts(path);
  const regions = [...new Set(badgeDetailRecords.map((item) => item.region))];
  const zones = region
    ? [...new Set(badgeDetailRecords.filter((item) => item.region === region).map((item) => item.zone))]
    : [];
  const stores = region && zone
    ? [...new Set(badgeDetailRecords.filter((item) => item.region === region && item.zone === zone).map((item) => item.store))]
    : [];
  const advisors = region && zone && store
    ? badgeDetailRecords.filter((item) => item.region === region && item.zone === zone && item.store === store)
    : [];
  return { regions, zones, stores, advisors };
}

function renderBadgeOrganizationMenu() {
  const draft = badgeMenuState.organizationDraft || badgeFilterState.organization;
  const [selectedRegion = '', selectedZone = '', selectedStore = '', selectedAdvisor = ''] = getBadgeOrganizationParts(draft);
  const { regions, zones, stores, advisors } = getBadgeOrganizationColumns(draft);
  const renderColumn = (items, emptyText) => `
    <div class="session-cascader-column">
      ${items.length ? items.join('') : `<div class="badge-org-empty">${emptyText}</div>`}
    </div>`;
  return `
    <div class="session-menu-panel session-menu-panel-cascader badge-organization-menu" data-badge-menu-panel="organization">
      <div class="session-cascader-top">
        <button type="button" class="session-menu-option session-menu-option-clear${draft === '全部组织' ? ' active' : ''}" data-badge-org-clear><span>全部组织</span></button>
        <div class="session-cascader-current"><span>当前层级</span><strong>${escapeBadgeHtml(formatBadgeOrganizationPath(draft))}</strong></div>
      </div>
      <div class="badge-cascader-headings"><span>大区</span><span>战区</span><span>门店</span><span>销售顾问</span></div>
      <div class="session-cascader-columns badge-cascader-columns">
        ${renderColumn(regions.map((item) => `<button type="button" class="session-cascader-option${selectedRegion === item ? ' active' : ''}" data-badge-org-path="${escapeBadgeHtml(item)}" data-badge-org-level="region"><span>${escapeBadgeHtml(item)}</span><i class="session-cascader-arrow"></i></button>`), '暂无大区')}
        ${renderColumn(zones.map((item) => `<button type="button" class="session-cascader-option${selectedZone === item ? ' active' : ''}" data-badge-org-path="${escapeBadgeHtml(`${selectedRegion} > ${item}`)}" data-badge-org-level="zone"><span>${escapeBadgeHtml(item)}</span><i class="session-cascader-arrow"></i></button>`), '请先选择大区')}
        ${renderColumn(stores.map((item) => `<button type="button" class="session-cascader-option${selectedStore === item ? ' active' : ''}" data-badge-org-path="${escapeBadgeHtml(`${selectedRegion} > ${selectedZone} > ${item}`)}" data-badge-org-level="store"><span>${escapeBadgeHtml(item)}</span><i class="session-cascader-arrow"></i></button>`), '请先选择战区')}
        ${renderColumn(advisors.map((item) => `<button type="button" class="session-cascader-option${selectedAdvisor === item.advisorId ? ' active' : ''}" data-badge-org-path="${escapeBadgeHtml(`${selectedRegion} > ${selectedZone} > ${selectedStore} > ${item.advisorId}`)}" data-badge-org-level="advisor"><span>${escapeBadgeHtml(item.advisorName)}（${escapeBadgeHtml(item.advisorId)}）</span></button>`), '请先选择门店')}
      </div>
      <div class="session-cascader-footer"><span>筛选将覆盖当前层级及其下属门店与销售顾问</span><button type="button" class="btn primary" data-badge-org-apply>应用组织</button></div>
    </div>`;
}

function renderBadgeSegmentControl() {
  return `
    <div class="session-toolbar-control session-toolbar-segment-control badge-brand-control">
      <span>品牌</span>
      <div class="todo-filter-tabs">
        ${['全部', '广汽传祺', '广汽埃安'].map((option) => `<button type="button" class="todo-filter-tab${badgeFilterState.brand === option ? ' active' : ''}" data-badge-brand="${option}">${option}</button>`).join('')}
      </div>
    </div>`;
}

function renderBadgeSearchControl(key, label, value) {
  return `
    <label class="session-toolbar-control session-toolbar-control-search-field">
      <span>${label}</span>
      <input type="search" class="session-search-input badge-search-input" value="${escapeBadgeHtml(value)}" placeholder="请输入${label}" data-badge-search="${key}" />
    </label>`;
}

function syncBadgeDateView(value) {
  const target = parseStoreDateValue(value);
  if (!target) return;
  badgeMenuState.dateViewYear = target.getFullYear();
  badgeMenuState.dateViewMonth = target.getMonth() + 1;
}

function shiftBadgeDateView(offset) {
  let year = badgeMenuState.dateViewYear;
  let month = badgeMenuState.dateViewMonth + offset;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  badgeMenuState.dateViewYear = year;
  badgeMenuState.dateViewMonth = month;
}

function applyBadgeDateDraft(field, value) {
  if (field === 'startDate') {
    badgeMenuState.dateDraftStartDate = value;
    if (!badgeMenuState.dateDraftEndDate || badgeMenuState.dateDraftEndDate < value) {
      badgeMenuState.dateDraftEndDate = value;
    }
    badgeMenuState.activeDateField = 'endDate';
    syncBadgeDateView(badgeMenuState.dateDraftEndDate);
    return;
  }
  badgeMenuState.dateDraftEndDate = value;
  if (!badgeMenuState.dateDraftStartDate || badgeMenuState.dateDraftStartDate > value) {
    badgeMenuState.dateDraftStartDate = value;
  }
}

function getBadgeDateCells(year, month) {
  const cells = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingSlots; index += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    const value = formatStoreDateValue(new Date(year, month - 1, day));
    cells.push({
      day,
      value,
      inRange: value >= badgeMenuState.dateDraftStartDate && value <= badgeMenuState.dateDraftEndDate,
      isStart: value === badgeMenuState.dateDraftStartDate,
      isEnd: value === badgeMenuState.dateDraftEndDate,
      isToday: value === storeTodayDateValue
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderBadgeDateControl() {
  const open = badgeMenuState.openMenu === 'date';
  const panelRenderer = globalThis.__dateFilterComponentUtils?.renderDateRangePanelMarkup;
  const startLabel = formatStoreDateDisplay(badgeFilterState.queryStartDate);
  const endLabel = formatStoreDateDisplay(badgeFilterState.queryEndDate);
  const draftRangeText = `${formatStoreDateDisplay(badgeMenuState.dateDraftStartDate)} 至 ${formatStoreDateDisplay(badgeMenuState.dateDraftEndDate)}`;
  const menuHtml = open && panelRenderer ? panelRenderer({
    dataNamespace: 'badge-query-date',
    rangeText: draftRangeText,
    monthLabel: `${badgeMenuState.dateViewYear}年${badgeMenuState.dateViewMonth}月`,
    activeField: badgeMenuState.activeDateField,
    startLabel: formatStoreDateDisplay(badgeMenuState.dateDraftStartDate),
    endLabel: formatStoreDateDisplay(badgeMenuState.dateDraftEndDate),
    cells: getBadgeDateCells(badgeMenuState.dateViewYear, badgeMenuState.dateViewMonth),
    shortcuts: [
      { key: 'today', label: '今天' },
      { key: 'last3', label: '近3天' },
      { key: 'last7', label: '近7天' }
    ],
    summaryText: `已选择 ${draftRangeText}`,
    title: '查询日期范围'
  }) : '';
  return `
    <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date${open ? ' is-open' : ''}" data-badge-menu-root="date">
      <span>查询日期</span>
      <button type="button" class="session-date-trigger${open ? ' active' : ''}" data-badge-query-date-trigger aria-label="查询日期筛选" aria-haspopup="dialog" aria-expanded="${open ? 'true' : 'false'}">
        <strong>${escapeBadgeHtml(startLabel)}</strong><em>至</em><strong>${escapeBadgeHtml(endLabel)}</strong><span class="session-date-icon" aria-hidden="true"></span>
      </button>
      ${menuHtml}
    </div>`;
}

function renderBadgeFilterActions() {
  return `
    <div class="session-filter-inline-actions session-filter-inline-actions-search">
      <button type="button" class="btn session-reset-btn" data-badge-reset>重置筛选</button>
      <button type="button" class="session-toggle-text-btn" data-badge-toggle aria-expanded="${badgeFilterState.collapsed ? 'false' : 'true'}">
        <span>${badgeFilterState.collapsed ? '展开' : '收起'}</span>
        <svg class="session-toggle-text-btn-icon${badgeFilterState.collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </button>
    </div>`;
}

function renderBadgeFilters() {
  const container = document.getElementById('sessionFilterControls');
  if (!container) return;
  const organizationOpen = badgeMenuState.openMenu === 'organization';
  const mainControls = `
    <div class="session-toolbar-control session-toolbar-control-org session-toolbar-menu${organizationOpen ? ' is-open' : ''}" data-badge-menu-root="organization">
      <span>组织</span>
      <button type="button" class="session-select-trigger${organizationOpen ? ' active' : ''}" data-badge-org-trigger><strong>${escapeBadgeHtml(formatBadgeOrganizationPath(badgeFilterState.organization))}</strong><i class="session-select-caret"></i></button>
      ${organizationOpen ? renderBadgeOrganizationMenu() : ''}
    </div>
    ${renderBadgeDateControl()}`;
  container.innerHTML = `
    <div class="session-filter-row session-filter-row-segment${badgeFilterState.collapsed ? ' is-collapsed' : ''}">
      ${renderBadgeSegmentControl()}
      ${badgeFilterState.collapsed ? renderBadgeFilterActions() : ''}
    </div>
    <div class="session-filter-row session-filter-row-main session-filter-extra${badgeFilterState.collapsed ? '' : ' is-visible'}">
      ${mainControls}
    </div>
    <div class="session-filter-row session-filter-row-search session-filter-extra${badgeFilterState.collapsed ? '' : ' is-visible'}">
      ${renderBadgeSearchControl('snQuery', '工牌SN', badgeFilterState.snQuery)}
      ${renderBadgeSearchControl('storeNameQuery', '门店名称', badgeFilterState.storeNameQuery)}
      ${renderBadgeSearchControl('advisorIdQuery', '顾问ID', badgeFilterState.advisorIdQuery)}
      ${renderBadgeSearchControl('advisorNameQuery', '顾问姓名', badgeFilterState.advisorNameQuery)}
      ${renderBadgeFilterActions()}
    </div>`;
}

function getFilteredBadgeRecords() {
  const [region = '', zone = '', store = '', advisorId = ''] = getBadgeOrganizationParts(badgeFilterState.organization);
  const storeNameQuery = badgeFilterState.storeNameQuery.trim().toLocaleLowerCase('zh-CN');
  const nameQuery = badgeFilterState.advisorNameQuery.trim().toLowerCase();
  const idQuery = badgeFilterState.advisorIdQuery.trim().toLowerCase();
  const snQuery = badgeFilterState.snQuery.trim().toLowerCase();
  return badgeDetailRecords.filter((item) => {
    const brandMatch = badgeFilterState.brand === '全部' || item.brand === badgeFilterState.brand;
    const organizationMatch = badgeFilterState.organization === '全部组织' || (
      item.region === region && (!zone || item.zone === zone) && (!store || item.store === store) && (!advisorId || item.advisorId === advisorId)
    );
    // 原型数据按查询日期复用同一份快照，保证选择任意日期都有完整工牌数据。
    return brandMatch && organizationMatch
      && (!storeNameQuery || item.store.toLocaleLowerCase('zh-CN').includes(storeNameQuery))
      && (!nameQuery || item.advisorName.toLowerCase().includes(nameQuery))
      && (!idQuery || item.advisorId.toLowerCase().includes(idQuery))
      && (!snQuery || item.sn.toLowerCase().includes(snQuery));
  });
}

function getBadgePaginationItems(totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  if (badgePaginationState.page > 3) items.push('left');
  for (let page = Math.max(2, badgePaginationState.page - 1); page <= Math.min(totalPages - 1, badgePaginationState.page + 1); page += 1) items.push(page);
  if (badgePaginationState.page < totalPages - 2) items.push('right');
  items.push(totalPages);
  return items;
}

function renderBadgePagination(totalItems) {
  const container = document.getElementById('badgeDetailPagination');
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / badgePaginationState.pageSize));
  badgePaginationState.page = Math.min(badgePaginationState.page, totalPages);
  container.innerHTML = `
    <div class="dashboard-pagination">
      <span class="session-pagination-total">共 ${totalItems} 条</span>
      <div class="dashboard-pagination-controls">
        <div class="custom-select-container page-select page-size-select">
          <button type="button" class="custom-select-trigger page-size-trigger" data-badge-page-size-trigger><span>${badgePaginationState.pageSize} 条/页</span></button>
          <div class="custom-select-options page-size-options">${[10, 20, 50].map((size) => `<button type="button" class="custom-option page-size-option${size === badgePaginationState.pageSize ? ' active' : ''}" data-badge-page-size="${size}"><span>${size} 条/页</span></button>`).join('')}</div>
        </div>
        <div class="page-group">
          <button type="button" class="page-arrow" data-badge-page-action="prev" ${badgePaginationState.page === 1 ? 'disabled' : ''}>‹</button>
          ${getBadgePaginationItems(totalPages).map((item) => typeof item === 'number' ? `<button type="button" class="page-num${item === badgePaginationState.page ? ' active' : ''}" data-badge-page="${item}">${item}</button>` : '<span class="page-ellipsis">…</span>').join('')}
          <button type="button" class="page-arrow" data-badge-page-action="next" ${badgePaginationState.page === totalPages ? 'disabled' : ''}>›</button>
        </div>
        <div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${totalPages}" value="${badgePaginationState.page}" data-badge-page-jump /></label><span class="session-page-jump-suffix">页</span></div>
      </div>
    </div>`;
}

function renderBadgeDetail() {
  const tbody = document.getElementById('badgeDetailTableBody');
  if (!tbody) return;
  const records = getFilteredBadgeRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / badgePaginationState.pageSize));
  badgePaginationState.page = Math.min(badgePaginationState.page, totalPages);
  const start = (badgePaginationState.page - 1) * badgePaginationState.pageSize;
  const visibleRecords = records.slice(start, start + badgePaginationState.pageSize);
  const connectedCount = records.filter((item) => item.connectionStatus === '已连接').length;
  const recordingCount = records.filter((item) => item.recordingStatus === '录音中').length;
  const summaryValues = {
    badgeFilterCount: records.length,
    badgeConnectedCount: connectedCount,
    badgeRecordingCount: recordingCount
  };
  Object.entries(summaryValues).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = Number(value).toLocaleString('zh-CN');
  });
  tbody.innerHTML = visibleRecords.length ? visibleRecords.map((item) => {
    const memoryTone = item.remainingMemory < 20 ? 'danger-text' : '';
    const pendingTone = item.pendingUploads >= 5 ? 'danger-text' : item.pendingUploads > 0 ? 'amber-text' : '';
    return `<tr>
      <td><span class="cell-main">${escapeBadgeHtml(item.sn)}</span></td>
      <td>${escapeBadgeHtml(item.badgeType)}</td>
      <td>${escapeBadgeHtml(item.brand)}</td><td>${escapeBadgeHtml(item.region)}</td><td>${escapeBadgeHtml(item.zone)}</td><td>${escapeBadgeHtml(item.store)}</td>
      <td>${escapeBadgeHtml(item.advisorId)}</td><td>${escapeBadgeHtml(item.advisorName)}</td>
      <td>${item.recordingStatus === '录音中' ? '<span class="status-inline green"><span class="status-inline-dot"></span><span>录音中</span></span>' : '<span class="status-inline gray"><span>—</span></span>'}</td>
      <td><span class="status-inline ${item.connectionStatus === '已连接' ? 'green' : 'red'}"><span class="status-inline-dot"></span><span>${item.connectionStatus}</span></span></td>
      <td><span class="status-inline ${item.dockConnected ? 'green' : 'gray'}"><span class="status-inline-dot"></span><span>${item.dockConnected ? '已接入' : '未接入'}</span></span></td>
      <td>${escapeBadgeHtml(item.signal)}</td>
      <td><span class="battery"><i style="width:${item.battery}%"></i></span><strong>${item.battery}%</strong></td>
      <td>${item.operationLogs.some((log) => log.ops === 'system' && log.act === 'battery low') ? '<span class="status-inline red"><span class="status-inline-dot"></span><span>有预警</span></span>' : '<span class="status-inline gray"><span>—</span></span>'}</td>
      <td><strong class="${memoryTone}">${item.remainingMemory}%</strong></td><td>${item.uptime}</td>
      <td><strong class="${pendingTone}">${item.pendingUploads}</strong></td><td>${escapeBadgeHtml(projectDemoTimestampToDate(item.syncedAt, badgeFilterState.queryEndDate))}</td>
      <td><button class="table-link route-target" data-target="events" data-badge-sn="${escapeBadgeHtml(item.sn)}" data-advisor-name="${escapeBadgeHtml(item.advisorName)}">事件</button><button class="table-link route-target badge-inline-action" data-target="uploads" data-badge-sn="${escapeBadgeHtml(item.sn)}" data-advisor-name="${escapeBadgeHtml(item.advisorName)}">日志</button></td>
    </tr>`;
  }).join('') : '<tr class="session-empty-row"><td colspan="19">当前筛选条件下暂无工牌，请调整品牌、组织、顾问姓名、顾问ID或工牌SN后重试。</td></tr>';
  renderBadgePagination(records.length);
}

function renderBadgePage() {
  renderBadgeFilters();
  renderBadgeDetail();
}

function formatStoreDateDisplay(value) {
  if (!value) return '不限';
  const [year, month, day] = value.split('-');
  return `${year}/${month}/${day}`;
}

function formatStoreDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseStoreDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function projectDemoTimestampToDate(timestamp, selectedDate) {
  if (!timestamp || !selectedDate) return timestamp;
  const separatorIndex = timestamp.indexOf(' ');
  return separatorIndex === -1 ? selectedDate : `${selectedDate}${timestamp.slice(separatorIndex)}`;
}

function syncStoreDateView(value) {
  const target = parseStoreDateValue(value);
  if (!target) return;
  storeOverviewState.dateViewYear = target.getFullYear();
  storeOverviewState.dateViewMonth = target.getMonth() + 1;
}

function shiftStoreDateView(offset) {
  let year = storeOverviewState.dateViewYear;
  let month = storeOverviewState.dateViewMonth + offset;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  storeOverviewState.dateViewYear = year;
  storeOverviewState.dateViewMonth = month;
}

function applyStoreDateDraft(field, value) {
  if (field === 'startDate') {
    storeOverviewState.dateDraftStartDate = value;
    if (!storeOverviewState.dateDraftEndDate || storeOverviewState.dateDraftEndDate < value) {
      storeOverviewState.dateDraftEndDate = value;
    }
    storeOverviewState.activeDateField = 'endDate';
    syncStoreDateView(storeOverviewState.dateDraftEndDate);
    return;
  }
  storeOverviewState.dateDraftEndDate = value;
  if (!storeOverviewState.dateDraftStartDate || storeOverviewState.dateDraftStartDate > value) {
    storeOverviewState.dateDraftStartDate = value;
  }
}

function getStoreDateCells(year, month) {
  const cells = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingSlots; index += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    const value = formatStoreDateValue(new Date(year, month - 1, day));
    cells.push({
      day,
      value,
      inRange: value >= storeOverviewState.dateDraftStartDate && value <= storeOverviewState.dateDraftEndDate,
      isStart: value === storeOverviewState.dateDraftStartDate,
      isEnd: value === storeOverviewState.dateDraftEndDate,
      isToday: value === storeTodayDateValue
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderStoreDateFilter() {
  const host = document.getElementById('storeDateFilterControl');
  if (!host) return;
  const open = storeOverviewState.openFilter === 'date';
  const panelRenderer = globalThis.__dateFilterComponentUtils?.renderDateRangePanelMarkup;
  const startLabel = formatStoreDateDisplay(storeOverviewState.startDate);
  const endLabel = formatStoreDateDisplay(storeOverviewState.endDate);
  const draftRangeText = `${formatStoreDateDisplay(storeOverviewState.dateDraftStartDate)} 至 ${formatStoreDateDisplay(storeOverviewState.dateDraftEndDate)}`;
  const menuHtml = open && panelRenderer ? panelRenderer({
    dataNamespace: 'store-query-date',
    rangeText: draftRangeText,
    monthLabel: `${storeOverviewState.dateViewYear}年${storeOverviewState.dateViewMonth}月`,
    activeField: storeOverviewState.activeDateField,
    startLabel: formatStoreDateDisplay(storeOverviewState.dateDraftStartDate),
    endLabel: formatStoreDateDisplay(storeOverviewState.dateDraftEndDate),
    cells: getStoreDateCells(storeOverviewState.dateViewYear, storeOverviewState.dateViewMonth),
    shortcuts: [
      { key: 'today', label: '今天' },
      { key: 'last3', label: '近3天' },
      { key: 'last7', label: '近7天' }
    ],
    summaryText: `已选择 ${draftRangeText}`,
    title: '查询日期范围'
  }) : '';
  host.innerHTML = `
    <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date${open ? ' is-open' : ''}" data-store-filter-root="date">
      <span>查询日期</span>
      <button type="button" class="session-date-trigger${open ? ' active' : ''}" data-store-query-date-trigger aria-label="查询日期筛选" aria-haspopup="dialog" aria-expanded="${open ? 'true' : 'false'}">
        <strong>${escapeBadgeHtml(startLabel)}</strong><em>至</em><strong>${escapeBadgeHtml(endLabel)}</strong><span class="session-date-icon" aria-hidden="true"></span>
      </button>
      ${menuHtml}
    </div>`;
}

function getStoreOrganizationParts(path) {
  return path === '全部组织' ? [] : path.split(' > ');
}

function formatStoreOrganizationPath(path) {
  return path === '全部组织' ? path : path.replaceAll(' > ', ' / ');
}

function renderStoreOrganizationMenu() {
  const menu = document.querySelector('[data-store-filter-menu="organization"]');
  if (!menu) return;
  const draft = storeOverviewState.organizationDraft || storeOverviewState.organization;
  const [selectedArea = '', selectedZone = ''] = getStoreOrganizationParts(draft);
  const areas = [...new Set(storeOverviewRecords.map((item) => item.organization))];
  const zones = selectedArea
    ? [...new Set(storeOverviewRecords.filter((item) => item.organization === selectedArea).map((item) => item.zone))]
    : [];
  const stores = selectedArea && selectedZone
    ? storeOverviewRecords.filter((item) => item.organization === selectedArea && item.zone === selectedZone)
    : [];

  const renderColumn = (title, items, emptyText) => `
    <section class="store-org-column">
      <div class="store-org-column-title">${title}</div>
      <div class="store-org-options">
        ${items.length ? items.join('') : `<div class="store-org-empty">${emptyText}</div>`}
      </div>
    </section>`;

  menu.innerHTML = `
    <div class="store-org-menu-top">
      <button type="button" class="store-org-clear${draft === '全部组织' ? ' active' : ''}" data-store-org-clear>全部组织</button>
      <div class="store-org-current"><span>当前层级</span><strong>${formatStoreOrganizationPath(draft)}</strong></div>
    </div>
    <div class="store-org-columns">
      ${renderColumn('大区', areas.map((area) => `
        <button type="button" class="store-org-option${selectedArea === area ? ' active' : ''}" data-store-org-path="${area}" data-store-org-level="area"><span>${area}</span><i aria-hidden="true"></i></button>`), '暂无大区')}
      ${renderColumn('战区', zones.map((zone) => `
        <button type="button" class="store-org-option${selectedZone === zone ? ' active' : ''}" data-store-org-path="${selectedArea} > ${zone}" data-store-org-level="zone"><span>${zone}</span><i aria-hidden="true"></i></button>`), '请先选择大区')}
      ${renderColumn('门店', stores.map((store) => {
        const path = `${selectedArea} > ${selectedZone} > ${store.name}`;
        return `<button type="button" class="store-org-option store-org-store-option${draft === path ? ' active' : ''}" data-store-org-path="${path}" data-store-org-level="store"><span>${store.name}</span></button>`;
      }), '请先选择战区')}
    </div>
    <div class="store-org-menu-footer">
      <span>筛选将覆盖当前层级及其下属门店</span>
      <button type="button" class="btn primary" data-store-org-apply>应用组织</button>
    </div>`;
}

function closeStoreFilterMenus(except = '') {
  document.querySelectorAll('[data-store-filter-menu]').forEach((menu) => {
    const key = menu.dataset.storeFilterMenu;
    const shouldOpen = key === except;
    menu.hidden = !shouldOpen;
    const root = menu.closest('[data-store-filter-root]');
    root?.classList.toggle('is-open', shouldOpen);
    const trigger = root?.querySelector('[data-store-filter-trigger]');
    trigger?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  });
  storeOverviewState.openFilter = except;
  renderStoreDateFilter();
}

function getFilteredStoreRecords() {
  const records = storeOverviewRecords.filter((item) => {
    const brandMatch = storeOverviewState.brand === '全部品牌' || item.brand === storeOverviewState.brand;
    const normalizedStoreNameQuery = storeOverviewState.storeNameQuery.trim().toLocaleLowerCase('zh-CN');
    const storeNameMatch = !normalizedStoreNameQuery || item.name.toLocaleLowerCase('zh-CN').includes(normalizedStoreNameQuery);
    const [area = '', zone = '', store = ''] = getStoreOrganizationParts(storeOverviewState.organization);
    const organizationMatch = storeOverviewState.organization === '全部组织' || (
      item.organization === area &&
      (!zone || item.zone === zone) &&
      (!store || item.name === store)
    );
    // 门店总览是每日快照原型：每个查询日期复用同一份门店数据。
    return item.bindings >= 1 && brandMatch && storeNameMatch && organizationMatch;
  });
  if (!storeOverviewState.sortKey) return records;
  return records.sort((left, right) => {
    const sortAccessors = {
      employees: (item) => item.employees,
      badgeAssets: getStoreBadgeAssetCount,
      boundEmployees: (item) => item.boundEmployees,
      bindings: (item) => item.bindings,
      bindingRate: getStoreBindingRate
    };
    const getSortValue = sortAccessors[storeOverviewState.sortKey] || ((item) => item.name);
    const leftValue = getSortValue(left);
    const rightValue = getSortValue(right);
    if (leftValue === null && rightValue === null) return left.name.localeCompare(right.name, 'zh-CN');
    if (leftValue === null) return 1;
    if (rightValue === null) return -1;
    const difference = leftValue - rightValue;
    return difference === 0
      ? left.name.localeCompare(right.name, 'zh-CN')
      : storeOverviewState.sortDirection === 'asc' ? difference : -difference;
  });
}

function sumStoreMetric(records, key) {
  return records.reduce((total, item) => total + item[key], 0);
}

function getStoreBadgeAssetCount(item) {
  return Number.isFinite(item.badges) && item.badges >= 0 ? item.badges : null;
}

function getStoreBindingRate(item) {
  const assetCount = getStoreBadgeAssetCount(item);
  return assetCount && Number.isFinite(item.bindings) ? item.bindings / assetCount * 100 : null;
}

function formatStoreBindingRate(value) {
  return value === null ? '—' : `${value.toFixed(1)}%`;
}

function updateStoreSortHeaders() {
  document.querySelectorAll('[data-store-sort]').forEach((button) => {
    const active = button.dataset.storeSort === storeOverviewState.sortKey;
    const direction = active ? storeOverviewState.sortDirection : '';
    button.classList.toggle('active', active);
    button.classList.toggle('is-ascending', active && direction === 'asc');
    button.classList.toggle('is-descending', active && direction === 'desc');
    button.closest('th')?.setAttribute('aria-sort', active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none');
    const icon = button.querySelector('[data-store-sort-icon]');
    if (icon) icon.textContent = active && direction === 'desc' ? '▼' : '▲';
  });
}

function renderStoreOverviewPagination(totalItems) {
  const container = document.getElementById('storeOverviewPagination');
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / storeOverviewState.pageSize));
  storeOverviewState.page = Math.min(storeOverviewState.page, totalPages);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  container.innerHTML = `
    <div class="dashboard-pagination store-pagination-layout">
      <span class="session-pagination-total store-pagination-total">共 ${totalItems} 条</span>
      <div class="dashboard-pagination-controls store-pagination-controls">
        <label class="page-select store-page-size"><select data-store-page-size aria-label="每页条数"><option value="10"${storeOverviewState.pageSize === 10 ? ' selected' : ''}>10 条/页</option><option value="20"${storeOverviewState.pageSize === 20 ? ' selected' : ''}>20 条/页</option><option value="50"${storeOverviewState.pageSize === 50 ? ' selected' : ''}>50 条/页</option></select></label>
        <div class="page-group store-page-group">
          <button type="button" class="page-arrow" data-store-page-action="prev" ${storeOverviewState.page === 1 ? 'disabled' : ''}>‹</button>
          ${pages.map((page) => `<button type="button" class="page-num${page === storeOverviewState.page ? ' active' : ''}" data-store-page="${page}">${page}</button>`).join('')}
          <button type="button" class="page-arrow" data-store-page-action="next" ${storeOverviewState.page === totalPages ? 'disabled' : ''}>›</button>
        </div>
        <div class="page-group page-jump-group store-page-jump"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${totalPages}" value="${storeOverviewState.page}" data-store-page-jump aria-label="跳转页码" /></label><span class="session-page-jump-suffix">页</span></div>
      </div>
    </div>`;
}

function renderStoreOverview() {
  const tbody = document.getElementById('storeOverviewTableBody');
  if (!tbody) return;
  const records = getFilteredStoreRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / storeOverviewState.pageSize));
  storeOverviewState.page = Math.min(storeOverviewState.page, totalPages);
  const start = (storeOverviewState.page - 1) * storeOverviewState.pageSize;
  const visibleRecords = records.slice(start, start + storeOverviewState.pageSize);
  const hasCompleteAssetData = records.every((item) => getStoreBadgeAssetCount(item) !== null);
  const badgeAssetCount = hasCompleteAssetData ? records.reduce((total, item) => total + getStoreBadgeAssetCount(item), 0) : null;
  const bindingCount = sumStoreMetric(records, 'bindings');
  const bindingRate = badgeAssetCount ? bindingCount / badgeAssetCount * 100 : null;

  document.getElementById('storeMetricStoreCount').textContent = records.length.toLocaleString('zh-CN');
  document.getElementById('storeMetricEmployeeCount').textContent = sumStoreMetric(records, 'employees').toLocaleString('zh-CN');
  document.getElementById('storeMetricBadgeAssetCount').textContent = badgeAssetCount === null ? '—' : badgeAssetCount.toLocaleString('zh-CN');
  document.getElementById('storeMetricBoundEmployeeCount').textContent = sumStoreMetric(records, 'boundEmployees').toLocaleString('zh-CN');
  document.getElementById('storeMetricBindingCount').textContent = bindingCount.toLocaleString('zh-CN');
  document.getElementById('storeMetricBindingRate').textContent = formatStoreBindingRate(bindingRate);
  document.getElementById('storeFilteredCount').textContent = records.length.toLocaleString('zh-CN');
  document.getElementById('storeBrandFilterText').textContent = storeOverviewState.brand;
  document.getElementById('storeOrganizationFilterText').textContent = formatStoreOrganizationPath(storeOverviewState.organization);
  renderStoreDateFilter();

  document.querySelectorAll('[data-store-filter-option]').forEach((button) => {
    button.classList.toggle('active', storeOverviewState[button.dataset.storeFilterOption] === button.dataset.value);
  });
  updateStoreSortHeaders();

  tbody.innerHTML = visibleRecords.length
    ? visibleRecords.map((item) => `
      <tr>
        <td>${item.brand}</td>
        <td>${item.organization}</td>
        <td>${item.zone}</td>
        <td><strong>${item.name}</strong></td>
        <td>${getStoreBadgeAssetCount(item) ?? '—'}</td>
        <td>${item.bindings}</td>
        <td>${formatStoreBindingRate(getStoreBindingRate(item))}</td>
        <td>${item.employees}</td>
        <td>${item.boundEmployees}</td>
        <td>${escapeBadgeHtml(projectDemoTimestampToDate(item.syncedAt, storeOverviewState.endDate))}</td>
        <td><button class="text-btn" data-store-drilldown data-store-brand="${escapeBadgeHtml(item.brand)}" data-store-region="${escapeBadgeHtml(item.organization)}" data-store-zone="${escapeBadgeHtml(item.zone)}" data-store-name="${escapeBadgeHtml(item.name)}">查看明细</button></td>
      </tr>`).join('')
    : '<tr class="store-empty-row"><td colspan="11">当前筛选条件下暂无已绑定工牌的门店，请调整品牌或组织后重试。</td></tr>';
  renderStoreOverviewPagination(records.length);
}

function validRoute(value) {
  return Object.prototype.hasOwnProperty.call(pageMeta, value) ? value : 'visits';
}

function getRoute() {
  return validRoute(window.location.hash.replace('#', ''));
}

function renderActions(route) {
  topActions.innerHTML = '';
  pageMeta[route].actions.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn ${item.style}`;
    button.dataset.action = item.action;
    button.textContent = item.label;
    topActions.appendChild(button);
  });
}

function setRoute(route, updateHash = true) {
  const safeRoute = validRoute(route);
  document.body.classList.toggle('device-store-overview-page', safeRoute === 'stores');
  document.body.classList.toggle('device-badge-detail-page', safeRoute === 'badges');
  const detailRoute = safeRoute === 'events' || safeRoute === 'uploads';
  const visiblePanel = detailRoute ? 'events' : safeRoute;
  routeButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === safeRoute));
  pagePanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.page === visiblePanel));
  if (detailRoute) syncBadgeRecordTabs(safeRoute);
  title.textContent = pageMeta[safeRoute].title;
  description.textContent = pageMeta[safeRoute].description;
  document.title = `${pageMeta[safeRoute].title} · AI质检平台`;
  renderActions(safeRoute);
  if (updateHash && window.location.hash !== `#${safeRoute}`) window.location.hash = safeRoute;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.hidden = true;
  if (!visitDrawer.classList.contains('open')) document.body.style.overflow = '';
}

function openDrawer(type) {
  const detail = detailData[type] || detailData.matched;
  drawerStatus.textContent = detail.status;
  drawerStatus.className = `status ${detail.statusClass}`;
  drawerBusinessId.textContent = detail.businessId;
  drawerBody.innerHTML = detail.html;
  drawerBackdrop.hidden = false;
  visitDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => visitDrawer.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  visitDrawer.classList.remove('open');
  visitDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { drawerBackdrop.hidden = true; }, 220);
  document.body.style.overflow = '';
}

routeButtons.forEach((button) => button.addEventListener('click', () => setRoute(button.dataset.route)));
document.querySelectorAll('.nav-button[data-href]:not(.device-nav)').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = new URL(button.dataset.href, window.location.href).href;
  });
});
window.addEventListener('hashchange', () => setRoute(getRoute(), false));

document.addEventListener('click', (event) => {
  const badgeRecordTab = event.target.closest('[data-badge-record-tab]');
  if (badgeRecordTab) {
    setRoute(badgeRecordTab.dataset.badgeRecordTab);
    return;
  }

  if (event.target.closest('[data-badge-detail-back]')) {
    setRoute('badges');
    return;
  }

  if (event.target.closest('[data-badge-event-query]')) {
    applyBadgeEventFilters();
    showToast('已按当前条件更新工牌事件');
    return;
  }

  if (event.target.closest('[data-badge-event-reset]')) {
    const currentRecord = badgeEventRecords.find((item) => item.sn === badgeRecordState.sn);
    badgeEventFilterState.date = currentRecord?.date || badgeEventDefaultFilters.date;
    badgeEventFilterState.sn = badgeRecordState.sn;
    badgeEventFilterState.type = 'all';
    syncBadgeEventFilterControls();
    renderBadgeEvents();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-badge-upload-filter-apply]')) {
    const nextFilters = { ...badgeUploadFilterState };
    readFilterControls('[data-badge-upload-filter]', nextFilters);
    if (nextFilters.startDateTime && nextFilters.endDateTime && nextFilters.startDateTime > nextFilters.endDateTime) {
      showToast('录音开始时间不能晚于结束时间');
      return;
    }
    Object.assign(badgeUploadFilterState, nextFilters);
    renderBadgeUploads();
    showToast('已按当前条件更新录音上传日志');
    return;
  }

  if (event.target.closest('[data-badge-upload-filter-reset]')) {
    const uploadDate = getCurrentBadgeUploadRecords()[0]?.date || badgeUploadDefaultFilters.startDateTime.slice(0, 10);
    Object.assign(badgeUploadFilterState, badgeUploadDefaultFilters, {
      startDateTime: `${uploadDate}T00:00:00`,
      endDateTime: `${uploadDate}T23:59:59`
    });
    syncFilterControls('[data-badge-upload-filter]', badgeUploadFilterState);
    renderBadgeUploads();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-visit-filter-apply]')) {
    const nextFilters = { ...visitFilterState };
    readFilterControls('[data-visit-filter]', nextFilters);
    if (nextFilters.startDateTime && nextFilters.endDateTime && nextFilters.startDateTime > nextFilters.endDateTime) {
      showToast('到访开始时间不能晚于结束时间');
      return;
    }
    Object.assign(visitFilterState, nextFilters);
    renderVisits();
    showToast('已按当前条件更新到访明细');
    return;
  }

  if (event.target.closest('[data-visit-filter-reset]')) {
    Object.assign(visitFilterState, visitDefaultFilters);
    syncFilterControls('[data-visit-filter]', visitFilterState);
    renderVisits();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-matching-filter-apply]')) {
    const nextFilters = { ...matchingFilterState };
    readFilterControls('[data-matching-filter]', nextFilters);
    if (nextFilters.startDateTime && nextFilters.endDateTime && nextFilters.startDateTime > nextFilters.endDateTime) {
      showToast('匹配统计开始时间不能晚于结束时间');
      return;
    }
    Object.assign(matchingFilterState, nextFilters);
    renderMatchingDashboard();
    showToast('已按当前条件更新匹配排查数据');
    return;
  }

  if (event.target.closest('[data-matching-filter-reset]')) {
    Object.assign(matchingFilterState, matchingDefaultFilters);
    syncFilterControls('[data-matching-filter]', matchingFilterState);
    renderMatchingDashboard();
    showToast('筛选条件已重置');
    return;
  }

  const matchingDimension = event.target.closest('[data-matching-dimension]');
  if (matchingDimension) {
    matchingFilterState.dimension = matchingDimension.dataset.matchingDimension || 'store';
    renderMatchingDashboard();
    return;
  }

  const badgeBrand = event.target.closest('[data-badge-brand]');
  if (badgeBrand) {
    badgeFilterState.brand = badgeBrand.dataset.badgeBrand;
    badgePaginationState.page = 1;
    badgeMenuState.openMenu = '';
    renderBadgePage();
    return;
  }

  if (event.target.closest('[data-badge-org-trigger]')) {
    badgeMenuState.openMenu = badgeMenuState.openMenu === 'organization' ? '' : 'organization';
    badgeMenuState.organizationDraft = badgeFilterState.organization;
    renderBadgeFilters();
    return;
  }

  const badgeOrgPath = event.target.closest('[data-badge-org-path]');
  if (badgeOrgPath) {
    badgeMenuState.organizationDraft = badgeOrgPath.dataset.badgeOrgPath;
    if (badgeOrgPath.dataset.badgeOrgLevel === 'advisor') {
      badgeFilterState.organization = badgeMenuState.organizationDraft;
      badgePaginationState.page = 1;
      badgeMenuState.openMenu = '';
      renderBadgePage();
    } else {
      renderBadgeFilters();
    }
    return;
  }

  if (event.target.closest('[data-badge-org-clear]')) {
    badgeFilterState.organization = '全部组织';
    badgeMenuState.organizationDraft = '全部组织';
    badgeMenuState.openMenu = '';
    badgePaginationState.page = 1;
    renderBadgePage();
    return;
  }

  if (event.target.closest('[data-badge-org-apply]')) {
    badgeFilterState.organization = badgeMenuState.organizationDraft || '全部组织';
    badgeMenuState.openMenu = '';
    badgePaginationState.page = 1;
    renderBadgePage();
    return;
  }

  if (event.target.closest('[data-badge-query-date-trigger]')) {
    const willOpen = badgeMenuState.openMenu !== 'date';
    if (willOpen) {
      badgeMenuState.dateDraftStartDate = badgeFilterState.queryStartDate;
      badgeMenuState.dateDraftEndDate = badgeFilterState.queryEndDate;
      badgeMenuState.activeDateField = 'startDate';
      syncBadgeDateView(badgeMenuState.dateDraftStartDate);
    }
    badgeMenuState.openMenu = willOpen ? 'date' : '';
    renderBadgeFilters();
    return;
  }

  const badgeDateField = event.target.closest('[data-badge-query-date-field]');
  if (badgeDateField) {
    badgeMenuState.activeDateField = badgeDateField.dataset.badgeQueryDateField;
    syncBadgeDateView(badgeMenuState.activeDateField === 'startDate'
      ? badgeMenuState.dateDraftStartDate
      : badgeMenuState.dateDraftEndDate);
    renderBadgeFilters();
    return;
  }

  const badgeDateNav = event.target.closest('[data-badge-query-date-nav]');
  if (badgeDateNav) {
    shiftBadgeDateView(Number(badgeDateNav.dataset.badgeQueryDateNav));
    renderBadgeFilters();
    return;
  }

  const badgeDateValue = event.target.closest('[data-badge-query-date-value]');
  if (badgeDateValue) {
    applyBadgeDateDraft(badgeMenuState.activeDateField, badgeDateValue.dataset.badgeQueryDateValue);
    renderBadgeFilters();
    return;
  }

  const badgeDateShortcut = event.target.closest('[data-badge-query-date-shortcut]');
  if (badgeDateShortcut) {
    const endDate = parseStoreDateValue(storeTodayDateValue);
    const startDate = new Date(endDate);
    if (badgeDateShortcut.dataset.badgeQueryDateShortcut === 'last3') startDate.setDate(startDate.getDate() - 2);
    if (badgeDateShortcut.dataset.badgeQueryDateShortcut === 'last7') startDate.setDate(startDate.getDate() - 6);
    badgeMenuState.dateDraftStartDate = formatStoreDateValue(startDate);
    badgeMenuState.dateDraftEndDate = formatStoreDateValue(endDate);
    badgeMenuState.activeDateField = 'endDate';
    syncBadgeDateView(badgeMenuState.dateDraftEndDate);
    renderBadgeFilters();
    return;
  }

  if (event.target.closest('[data-badge-query-date-cancel]')) {
    badgeMenuState.openMenu = '';
    renderBadgeFilters();
    return;
  }

  if (event.target.closest('[data-badge-query-date-apply]')) {
    badgeFilterState.queryStartDate = badgeMenuState.dateDraftStartDate;
    badgeFilterState.queryEndDate = badgeMenuState.dateDraftEndDate;
    badgeMenuState.openMenu = '';
    badgePaginationState.page = 1;
    renderBadgePage();
    return;
  }

  if (event.target.closest('[data-badge-reset]')) {
    Object.assign(badgeFilterState, badgeDefaultFilters);
    badgeMenuState.openMenu = '';
    badgeMenuState.organizationDraft = '全部组织';
    badgeMenuState.dateDraftStartDate = badgeDefaultFilters.queryStartDate;
    badgeMenuState.dateDraftEndDate = badgeDefaultFilters.queryEndDate;
    badgeMenuState.activeDateField = 'startDate';
    syncBadgeDateView(badgeDefaultFilters.queryStartDate);
    badgePaginationState.page = 1;
    renderBadgePage();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-badge-toggle]')) {
    badgeFilterState.collapsed = !badgeFilterState.collapsed;
    badgeMenuState.openMenu = '';
    renderBadgeFilters();
    return;
  }

  const badgePage = event.target.closest('[data-badge-page]');
  if (badgePage) {
    badgePaginationState.page = Number(badgePage.dataset.badgePage);
    renderBadgeDetail();
    return;
  }

  const badgePageAction = event.target.closest('[data-badge-page-action]');
  if (badgePageAction && !badgePageAction.disabled) {
    badgePaginationState.page += badgePageAction.dataset.badgePageAction === 'next' ? 1 : -1;
    renderBadgeDetail();
    return;
  }

  if (event.target.closest('[data-badge-page-size-trigger]')) {
    const options = event.target.closest('[data-badge-page-size-trigger]').parentElement.querySelector('.page-size-options');
    options.classList.toggle('open');
    return;
  }

  const badgePageSize = event.target.closest('[data-badge-page-size]');
  if (badgePageSize) {
    badgePaginationState.pageSize = Number(badgePageSize.dataset.badgePageSize);
    badgePaginationState.page = 1;
    renderBadgeDetail();
    return;
  }

  if (!event.target.closest('[data-badge-menu-root]')) {
    if (badgeMenuState.openMenu) {
      badgeMenuState.openMenu = '';
      renderBadgeFilters();
    }
  }

  if (event.target.closest('[data-store-query-date-trigger]')) {
    const willOpen = storeOverviewState.openFilter !== 'date';
    if (willOpen) {
      storeOverviewState.dateDraftStartDate = storeOverviewState.startDate;
      storeOverviewState.dateDraftEndDate = storeOverviewState.endDate;
      storeOverviewState.activeDateField = 'startDate';
      syncStoreDateView(storeOverviewState.dateDraftStartDate);
    }
    closeStoreFilterMenus(willOpen ? 'date' : '');
    return;
  }

  const storeDateField = event.target.closest('[data-store-query-date-field]');
  if (storeDateField) {
    storeOverviewState.activeDateField = storeDateField.dataset.storeQueryDateField;
    syncStoreDateView(storeOverviewState.activeDateField === 'startDate'
      ? storeOverviewState.dateDraftStartDate
      : storeOverviewState.dateDraftEndDate);
    renderStoreDateFilter();
    return;
  }

  const storeDateNav = event.target.closest('[data-store-query-date-nav]');
  if (storeDateNav) {
    shiftStoreDateView(Number(storeDateNav.dataset.storeQueryDateNav));
    renderStoreDateFilter();
    return;
  }

  const storeDateValue = event.target.closest('[data-store-query-date-value]');
  if (storeDateValue) {
    applyStoreDateDraft(storeOverviewState.activeDateField, storeDateValue.dataset.storeQueryDateValue);
    renderStoreDateFilter();
    return;
  }

  const storeDateShortcut = event.target.closest('[data-store-query-date-shortcut]');
  if (storeDateShortcut) {
    const endDate = parseStoreDateValue(storeTodayDateValue);
    const startDate = new Date(endDate);
    if (storeDateShortcut.dataset.storeQueryDateShortcut === 'last3') startDate.setDate(startDate.getDate() - 2);
    if (storeDateShortcut.dataset.storeQueryDateShortcut === 'last7') startDate.setDate(startDate.getDate() - 6);
    storeOverviewState.dateDraftStartDate = formatStoreDateValue(startDate);
    storeOverviewState.dateDraftEndDate = formatStoreDateValue(endDate);
    storeOverviewState.activeDateField = 'endDate';
    syncStoreDateView(storeOverviewState.dateDraftEndDate);
    renderStoreDateFilter();
    return;
  }

  if (event.target.closest('[data-store-query-date-cancel]')) {
    closeStoreFilterMenus();
    return;
  }

  if (event.target.closest('[data-store-query-date-apply]')) {
    storeOverviewState.startDate = storeOverviewState.dateDraftStartDate;
    storeOverviewState.endDate = storeOverviewState.dateDraftEndDate;
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
    return;
  }

  const storeFilterTrigger = event.target.closest('[data-store-filter-trigger]');
  if (storeFilterTrigger) {
    const key = storeFilterTrigger.dataset.storeFilterTrigger;
    const nextFilter = storeOverviewState.openFilter === key ? '' : key;
    if (nextFilter === 'organization') {
      storeOverviewState.organizationDraft = storeOverviewState.organization;
      renderStoreOrganizationMenu();
    }
    closeStoreFilterMenus(nextFilter);
    return;
  }

  const storeOrgPath = event.target.closest('[data-store-org-path]');
  if (storeOrgPath) {
    storeOverviewState.organizationDraft = storeOrgPath.dataset.storeOrgPath;
    if (storeOrgPath.dataset.storeOrgLevel === 'store') {
      storeOverviewState.organization = storeOverviewState.organizationDraft;
      storeOverviewState.page = 1;
      closeStoreFilterMenus();
      renderStoreOverview();
    } else {
      renderStoreOrganizationMenu();
      closeStoreFilterMenus('organization');
    }
    return;
  }

  if (event.target.closest('[data-store-org-clear]')) {
    storeOverviewState.organization = '全部组织';
    storeOverviewState.organizationDraft = '全部组织';
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
    return;
  }

  if (event.target.closest('[data-store-org-apply]')) {
    storeOverviewState.organization = storeOverviewState.organizationDraft || '全部组织';
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
    return;
  }

  const storeFilterOption = event.target.closest('[data-store-filter-option]');
  if (storeFilterOption) {
    storeOverviewState[storeFilterOption.dataset.storeFilterOption] = storeFilterOption.dataset.value;
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
    return;
  }

  if (event.target.closest('[data-store-filter-reset]')) {
    storeOverviewState.brand = '全部品牌';
    storeOverviewState.organization = '全部组织';
    storeOverviewState.organizationDraft = '全部组织';
    storeOverviewState.storeNameQuery = '';
    storeOverviewState.startDate = storeDefaultQueryDate;
    storeOverviewState.endDate = storeDefaultQueryDate;
    storeOverviewState.dateDraftStartDate = storeDefaultQueryDate;
    storeOverviewState.dateDraftEndDate = storeDefaultQueryDate;
    storeOverviewState.activeDateField = 'startDate';
    storeOverviewState.dateViewYear = storeDefaultQueryDateObject.getFullYear();
    storeOverviewState.dateViewMonth = storeDefaultQueryDateObject.getMonth() + 1;
    storeOverviewState.page = 1;
    const storeNameSearch = document.querySelector('[data-store-name-search]');
    if (storeNameSearch) storeNameSearch.value = '';
    closeStoreFilterMenus();
    renderStoreOverview();
    showToast('筛选条件已重置');
    return;
  }

  const storeSort = event.target.closest('[data-store-sort]');
  if (storeSort) {
    const nextKey = storeSort.dataset.storeSort;
    storeOverviewState.sortDirection = storeOverviewState.sortKey === nextKey && storeOverviewState.sortDirection === 'desc' ? 'asc' : 'desc';
    storeOverviewState.sortKey = nextKey;
    storeOverviewState.page = 1;
    renderStoreOverview();
    return;
  }

  const storePage = event.target.closest('[data-store-page]');
  if (storePage) {
    storeOverviewState.page = Number(storePage.dataset.storePage);
    renderStoreOverview();
    return;
  }

  const storePageAction = event.target.closest('[data-store-page-action]');
  if (storePageAction && !storePageAction.disabled) {
    storeOverviewState.page += storePageAction.dataset.storePageAction === 'next' ? 1 : -1;
    renderStoreOverview();
    return;
  }

  const storeDrilldown = event.target.closest('[data-store-drilldown]');
  if (storeDrilldown) {
    badgeFilterState.brand = storeDrilldown.dataset.storeBrand;
    badgeFilterState.organization = `${storeDrilldown.dataset.storeRegion} > ${storeDrilldown.dataset.storeZone} > ${storeDrilldown.dataset.storeName}`;
    badgeFilterState.advisorNameQuery = '';
    badgeFilterState.advisorIdQuery = '';
    badgeFilterState.snQuery = '';
    badgeFilterState.queryStartDate = storeOverviewState.startDate;
    badgeFilterState.queryEndDate = storeOverviewState.endDate;
    badgeFilterState.collapsed = false;
    badgeMenuState.openMenu = '';
    badgeMenuState.organizationDraft = badgeFilterState.organization;
    badgeMenuState.dateDraftStartDate = badgeFilterState.queryStartDate;
    badgeMenuState.dateDraftEndDate = badgeFilterState.queryEndDate;
    badgeMenuState.activeDateField = 'startDate';
    syncBadgeDateView(badgeFilterState.queryStartDate);
    badgePaginationState.page = 1;
    renderBadgePage();
    setRoute('badges');
    showToast(`已展示${storeDrilldown.dataset.storeName}的工牌明细`);
    return;
  }

  if (!event.target.closest('[data-store-filter-root]')) closeStoreFilterMenus();

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'import') openModal(importModal);
  if (action === 'export') showToast('导出任务已创建');

  const routeTargetButton = event.target.closest('.route-target');
  const routeTarget = routeTargetButton?.dataset.target;
  if ((routeTarget === 'events' || routeTarget === 'uploads') && routeTargetButton.dataset.badgeSn) {
    selectBadgeRecord(routeTargetButton.dataset.badgeSn, routeTargetButton.dataset.advisorName);
  }
  if (routeTarget) setRoute(routeTarget);

  const detailButton = event.target.closest('.open-detail');
  if (detailButton) openDrawer(detailButton.dataset.detail);
  if (event.target.closest('.close-drawer') || event.target === drawerBackdrop) closeDrawer();
  if (event.target.closest('.close-modal') || event.target.classList.contains('modal-backdrop')) {
    const modal = event.target.closest('.modal-backdrop');
    if (modal) closeModal(modal);
  }
  if (event.target.closest('.toast-action')) showToast('原型操作已响应');
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[data-badge-page-jump]')) {
    const totalPages = Math.max(1, Math.ceil(getFilteredBadgeRecords().length / badgePaginationState.pageSize));
    badgePaginationState.page = Math.min(totalPages, Math.max(1, Number(event.target.value) || 1));
    renderBadgeDetail();
    return;
  }
  if (event.target.matches('[data-store-page-size]')) {
    storeOverviewState.pageSize = Number(event.target.value);
    storeOverviewState.page = 1;
    renderStoreOverview();
  }
  if (event.target.matches('[data-store-page-jump]')) {
    const totalPages = Math.max(1, Math.ceil(getFilteredStoreRecords().length / storeOverviewState.pageSize));
    storeOverviewState.page = Math.min(totalPages, Math.max(1, Number(event.target.value) || 1));
    renderStoreOverview();
  }
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-store-name-search]') && !event.isComposing) {
    storeOverviewState.storeNameQuery = event.target.value;
    storeOverviewState.page = 1;
    renderStoreOverview();
    return;
  }
  if (!event.target.matches('[data-badge-search]') || event.isComposing) return;
  const key = event.target.dataset.badgeSearch;
  const value = event.target.value;
  const cursorStart = event.target.selectionStart ?? value.length;
  const cursorEnd = event.target.selectionEnd ?? value.length;
  badgeFilterState[key] = value;
  badgePaginationState.page = 1;
  renderBadgeDetail();
  window.requestAnimationFrame(() => {
    const nextInput = document.querySelector(`[data-badge-search="${key}"]`);
    if (!nextInput) return;
    nextInput.focus();
    nextInput.setSelectionRange(cursorStart, cursorEnd);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.matches('[data-badge-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key === 'Enter' && event.target.matches('[data-store-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key !== 'Escape') return;
  closeStoreFilterMenus();
  if (visitDrawer.classList.contains('open')) closeDrawer();
  if (!importModal.hidden) closeModal(importModal);
});

setRoute(getRoute(), !window.location.hash);
renderStoreOverview();
renderBadgePage();
selectBadgeRecord(badgeRecordState.sn, badgeRecordState.advisorName);
renderVisits();
renderMatchingDashboard();
