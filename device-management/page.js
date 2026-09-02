const pageMeta = {
  stores: {
    title: '工牌总览',
    description: '按查询日期、品牌、组织和门店名称查看员工与工牌绑定情况',
    actions: []
  },
  badges: {
    title: '工牌明细',
    description: '查看当前绑定员工的录音、连接、剩余电量、剩余内存与上传状态',
    actions: [{ label: '字段设置', style: 'badge-field-settings-trigger', action: 'field-settings' }]
  },
  docks: {
    title: '充电坞明细',
    description: '按门店、状态和充电坞 SN 查看充电坞资产与子设备状态',
    actions: []
  },
  'store-badges': {
    title: '门店工牌明细',
    description: '查看当前门店绑定员工的录音、连接、剩余电量、剩余内存与上传状态',
    actions: [
      { label: '字段设置', style: 'badge-field-settings-trigger', action: 'field-settings' },
      { label: '导出明细', style: 'recording-primary', action: 'export' }
    ]
  },
  events: {
    title: '工牌详情',
    description: '查看当前顾问工牌的设备事件和录音上传记录',
    actions: [{ label: '导出事件', style: 'ghost', action: 'export' }]
  },
  uploads: {
    title: '工牌详情',
    description: '查看当前顾问工牌的设备事件和录音上传记录',
    actions: []
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
    title: '录音排查',
    description: '按门店发现未匹配到访、查看具体原因并进入处理',
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
      { type: 'power-on', label: '工牌开机', time: '08:03:32', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '08:05:00', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '10:36:57', icon: '停', color: 'red' },
      { type: 'power-off', label: '工牌关机', time: '10:36:57', color: 'neutral' },
      { type: 'charging-start', label: '开始充电', time: '10:36:59', icon: '充', color: 'violet' },
      { type: 'charging-end', label: '结束充电', time: '11:35:58', icon: '满', color: 'neutral' },
      { type: 'power-on', label: '工牌开机', time: '11:36:00', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '11:36:13', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '14:59:16', icon: '停', color: 'red' },
      { type: 'low-battery', label: '工牌电量预警', time: '15:43:00', icon: '低', color: 'red', note: '剩余电量 19%' },
      { type: 'power-off', label: '工牌关机', time: '15:44:35', color: 'neutral' }
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
      { type: 'power-on', label: '工牌开机', time: '08:30:00', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '08:45:00', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '12:00:00', icon: '停', color: 'red' },
      { type: 'low-battery', label: '工牌电量预警', time: '16:00:00', icon: '低', color: 'red', note: '剩余电量 18%' },
      { type: 'charging-start', label: '开始充电', time: '16:15:00', icon: '充', color: 'violet' },
      { type: 'charging-end', label: '结束充电', time: '17:00:00', icon: '满', color: 'neutral' },
      { type: 'power-off', label: '工牌关机', time: '17:10:00', color: 'neutral' }
    ]
  },
  {
    date: '2026-08-11',
    sn: 'MN-BDG-004792',
    employeeName: '韩如臣',
    storeName: '杭州滨江体验中心',
    powerOnDuration: '10:28:32',
    uploadedRecordingDuration: '01:13:20',
    events: [
      { type: 'power-on', label: '工牌开机', time: '08:03:32', color: 'green' },
      { type: 'recording-start', label: '开始录音', time: '09:30:00', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '10:36:57', icon: '停', color: 'red' },
      { type: 'recording-start', label: '开始录音', time: '11:36:13', icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: '11:42:36', icon: '停', color: 'red' },
      { type: 'power-off', label: '工牌关机', time: '18:32:04', color: 'neutral' }
    ]
  },
  {
    date: '2026-08-12',
    sn: 'MN-BDG-004845',
    employeeName: '李洋',
    storeName: '上海浦东体验中心',
    powerOnDuration: '—',
    uploadedRecordingDuration: '—',
    events: []
  }
];

const badgeEventDefaultFilters = {
  date: '2026-08-11',
  sn: 'MN-BDG-004821',
  type: 'all'
};

const badgeEventFilterState = { ...badgeEventDefaultFilters };
const badgeEventTypeOptions = [
  ['all', '全部事件'],
  ['power-on', '工牌开机'],
  ['power-off', '工牌关机'],
  ['recording', '录音'],
  ['charging', '充电'],
  ['low-battery', '电量预警']
];
const badgeEventMenuState = {
  openMenu: null,
  dateViewYear: 2026,
  dateViewMonth: 8
};
const badgeSecondaryEventTypes = new Set(['recording-start', 'recording-end', 'low-battery']);
const badgeEventIconAssets = {
  'power-on': 'power-on.svg',
  'power-off': 'power-off.svg'
};

function renderBadgeEventIcon(event) {
  const iconAsset = badgeEventIconAssets[event.type];
  return iconAsset
    ? `<img src="../assets/device-event-icons/${iconAsset}" alt="" aria-hidden="true" />`
    : escapeBadgeHtml(event.icon || '');
}

const badgeRecordState = {
  sn: badgeEventDefaultFilters.sn,
  advisorName: '陈佳'
};

const badgeUploadRecords = [
  { date: '2026-08-08', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '1', audioTime: '09:02:18—09:07:18', duration: '00:05:00', size: '4.7 MB', status: '已上传', completedAt: '2026-08-08 09:07:56' },
  { date: '2026-08-09', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '1', audioTime: '10:16:04—10:21:04', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-09 10:21:43' },
  { date: '2026-08-09', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '2', audioTime: '10:21:04—10:26:04', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-09 10:26:45' },
  { date: '2026-08-11', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '1', audioTime: '15:32:10—15:37:10', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-11 15:37:51' },
  { date: '2026-08-11', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '2', audioTime: '15:37:10—15:42:10', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-11 15:42:49' },
  { date: '2026-08-11', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '3', audioTime: '15:42:10—15:47:10', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-11 15:47:54' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '1', audioTime: '13:03:03—13:08:03', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-12 13:08:41' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '2', audioTime: '13:08:03—13:13:03', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-12 13:13:42' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '3', audioTime: '13:13:03—13:18:03', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-12 13:20:34' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '4', audioTime: '13:18:03—13:23:03', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-12 13:33:48' },
  { date: '2026-08-12', advisorName: '陈佳', sn: 'MN-BDG-004821', sequence: '5', audioTime: '13:23:03—13:28:03', duration: '00:05:00', size: '4.7 MB', status: '已上传', completedAt: '2026-08-12 13:34:58' },
  { date: '2026-08-10', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '1', audioTime: '11:05:10—11:10:10', duration: '00:05:00', size: '4.8 MB', status: '已上传', completedAt: '2026-08-10 11:10:49' },
  { date: '2026-08-12', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '2', audioTime: '13:20:58—13:25:58', duration: '00:05:00', size: '4.9 MB', status: '已上传', completedAt: '2026-08-12 13:26:37' },
  { date: '2026-08-12', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '3', audioTime: '13:25:58—13:30:58', duration: '00:05:00', size: '4.7 MB', status: '未上传', completedAt: '未上传' },
  { date: '2026-08-12', advisorName: '李洋', sn: 'MN-BDG-004836', sequence: '4 · 结束片段', audioTime: '13:30:58—13:35:58', duration: '00:05:00', size: '4.6 MB', status: '未上传', completedAt: '未上传' }
];

const badgeUploadDefaultFilters = {
  startDate: '2026-08-06',
  endDate: '2026-08-12'
};
const badgeUploadFilterState = { ...badgeUploadDefaultFilters };
const badgeUploadDailyPaginationState = { page: 1, pageSize: 10 };
const badgeUploadModalPaginationState = { page: 1, pageSize: 10 };
const badgeUploadModalState = { records: [], emptyText: '当前日期没有上传完成的录音。' };
const badgeUploadMenuState = {
  openMenu: null,
  dateDraftStartDate: badgeUploadDefaultFilters.startDate,
  dateDraftEndDate: badgeUploadDefaultFilters.endDate,
  activeDateField: 'startDate',
  dateViewYear: 2026,
  dateViewMonth: 8
};
let badgeUploadSelectedDate = badgeUploadDefaultFilters.endDate;

const visitDefaultFilters = {
  startDateTime: '2026-08-11T00:00:00',
  endDateTime: '2026-08-12T23:59:59',
  organization: '全部组织',
  source: '全部来源',
  status: '全部状态',
  businessId: '',
  recordingId: '',
  customerId: '',
  customerName: '',
  customerPhone: '',
  advisorName: ''
};
const visitFilterState = { ...visitDefaultFilters };
const visitProcessingStatuses = new Set(['待匹配', '录音上传中', '录音转写中', '模型分析中']);
const visitWaitingStatuses = new Set(visitProcessingStatuses);
const visitUploadDetailStatuses = new Set(['已匹配', '匹配失败', '录音上传中']);
const visitEventDetailStatuses = new Set(['无录音']);
const visitRecordTemplates = [
  { businessId: 'BIZ-20260812-0136', recordingId: 'REC-20260812-0136', customerId: 'C202608120315', customerName: '王先生', customerPhone: '138****0628', date: '2026-08-12', startTime: '13:04:00', endTime: '13:28:00', status: '已匹配', detailText: '已匹配完成5段录音', completedAt: '13:36:10', advisor: '陈佳', badgeSn: 'MN-BDG-004821', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '13:36:10', scene: '进店接待', carSeries: '星海 S7', detailKey: 'matched', weight: 450 },
  { businessId: 'BIZ-20260811-0735', recordingId: 'REC-20260811-0735', customerId: 'C202608110816', customerName: '郑女士', customerPhone: '137****3091', date: '2026-08-11', startTime: '15:18:20', endTime: '15:52:46', status: '已匹配', detailText: '已匹配完成4段录音', completedAt: '16:01:22', advisor: '韩如臣', badgeSn: 'MN-BDG-004792', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '16:01:22', scene: '试乘试驾', carSeries: '星海 S7', detailKey: 'matched', weight: 372 },
  { businessId: 'BIZ-20260811-0712', recordingId: 'REC-20260811-0712', customerId: 'C202608110793', customerName: '吴女士', customerPhone: '136****5826', date: '2026-08-11', startTime: '14:36:08', endTime: '15:06:41', status: '已匹配', detailText: '已匹配完成3段录音', completedAt: '15:14:09', advisor: '周宁', badgeSn: 'MN-BDG-004867', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '销售助手', updatedAt: '15:14:09', scene: '进店接待', carSeries: '星海 V6', detailKey: 'matched', weight: 320 },
  { businessId: 'BIZ-20260812-0148', customerId: 'C202608120342', customerName: '赵女士', customerPhone: '159****8312', date: '2026-08-12', startTime: '13:22:45', endTime: '13:56:08', status: '录音上传中', detailText: '可能存在未上传录音', completedAt: '—', advisor: '李洋', badgeSn: 'MN-BDG-004836', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '14:14:02', scene: '试乘试驾', carSeries: '星海 L9', detailKey: 'uploading', weight: 67 },
  { businessId: 'BIZ-20260812-0154', customerId: 'C202608120354', customerName: '郑先生', customerPhone: '136****4195', date: '2026-08-12', startTime: '14:08:20', endTime: '14:41:12', status: '录音转写中', detailText: '—', completedAt: '—', advisor: '李洋', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '14:49:36', scene: '进店接待', carSeries: '星海 L9', weight: 21 },
  { businessId: 'BIZ-20260812-0162', customerId: 'C202608120368', customerName: '吴先生', customerPhone: '137****5220', date: '2026-08-12', startTime: '15:06:18', endTime: '15:42:31', status: '模型分析中', detailText: '—', completedAt: '—', advisor: '陈佳', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '15:48:20', scene: '进店接待', carSeries: '星海 S7', weight: 22 },
  { businessId: 'BIZ-20260812-0171', customerId: 'C202608120377', customerName: '孙女士', customerPhone: '158****2754', date: '2026-08-12', startTime: '16:12:04', endTime: '16:39:28', status: '匹配失败', detailText: '到访和结束日期非同一天', completedAt: '—', advisor: '陈佳', badgeSn: 'MN-BDG-004821', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '16:46:11', scene: '进店接待', carSeries: '星海 S7', weight: 9 },
  { businessId: 'BIZ-20260812-0183', customerId: 'C202608120389', customerName: '林先生', customerPhone: '133****6187', date: '2026-08-12', startTime: '17:05:16', endTime: '17:26:44', status: '无录音', detailText: '工牌未开机', completedAt: '—', advisor: '李洋', badgeSn: 'MN-BDG-004845', region: '华东大区', zone: '上海战区', store: '上海浦东体验中心', storeCode: 'SH-PD-001', source: '销售助手', updatedAt: '17:30:02', scene: '进店接待', carSeries: '星海 L9', weight: 5 },
  { businessId: 'BIZ-20260811-0831', customerId: 'C202608110922', customerName: '刘先生', customerPhone: '186****1045', date: '2026-08-11', startTime: '18:31:35', endTime: '18:31:55', status: '无录音', detailText: '工牌未录音', completedAt: '—', advisor: '韩如臣', badgeSn: 'MN-BDG-004792', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '18:32:06', scene: '进店接待', carSeries: '星海 S7', detailKey: 'no-record', weight: 6 },
  { businessId: 'BIZ-20260811-0816', customerId: 'C202608110907', customerName: '钱女士', customerPhone: '189****4036', date: '2026-08-11', startTime: '17:42:08', endTime: '18:05:20', status: '待匹配', detailText: '到访记录已接收，等待录音匹配', completedAt: '—', advisor: '韩如臣', region: '华东大区', zone: '浙江战区', store: '杭州滨江体验中心', storeCode: 'HZ-BJ-003', source: '销售助手', updatedAt: '18:06:03', scene: '试乘试驾', carSeries: '星海 S7', weight: 2 },
  { businessId: 'BIZ-20260811-0793', customerId: 'C202608110884', customerName: '沈女士', customerPhone: '139****7272', date: '2026-08-11', startTime: '16:46:15', endTime: '17:03:40', status: '无录音', detailText: '客户明确不同意录音，本次未采集', completedAt: '—', advisor: '周宁', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '模板导入', updatedAt: '17:04:12', scene: '进店接待', carSeries: '星海 V6', weight: 3 },
  { businessId: 'BIZ-20260811-0772', customerId: 'C202608110861', customerName: '周女士', customerPhone: '135****2776', date: '2026-08-11', startTime: '16:23:41', endTime: '17:08:02', status: '匹配失败', detailText: '未绑定工牌', completedAt: '—', advisor: '周宁', region: '华东大区', zone: '江苏战区', store: '苏州园区体验中心', storeCode: 'SZ-YQ-006', source: '模板导入', updatedAt: '17:09:11', scene: '进店接待', carSeries: '星海 V6', detailKey: 'unbound', weight: 9 }
];

function expandVisitRecordTemplates(templates) {
  const remaining = templates.map((item) => Number(item.weight ?? 1));
  const copyIndexes = templates.map(() => 0);
  const records = [];
  let hasRemaining = true;
  while (hasRemaining) {
    hasRemaining = false;
    templates.forEach((template, templateIndex) => {
      if (remaining[templateIndex] <= 0) return;
      hasRemaining = true;
      const copyIndex = copyIndexes[templateIndex];
      const suffix = copyIndex ? `-${String(copyIndex + 1).padStart(4, '0')}` : '';
      records.push({
        ...template,
        businessId: `${template.businessId}${suffix}`,
        customerId: `${template.customerId}${suffix}`,
        recordingId: template.recordingId ? `${template.recordingId}${suffix}` : undefined,
        weight: 1
      });
      copyIndexes[templateIndex] += 1;
      remaining[templateIndex] -= 1;
    });
  }
  return records;
}

function getBadgeUploadStartTime(item) {
  return String(item.audioTime || '').split(/[—-]/)[0] || '—';
}

function getBadgeUploadMatchTime(item) {
  const matchingRecord = visitRecordTemplates.find((record) => record.status === '已匹配'
    && record.date === item.date
    && record.advisor === item.advisorName
    && record.badgeSn === item.sn);
  return matchingRecord ? `${matchingRecord.date} ${matchingRecord.completedAt}` : '—';
}

const visitRecords = expandVisitRecordTemplates(visitRecordTemplates);
const visitPaginationState = { page: 1, pageSize: 20 };
let visitReturnToMatching = window.location.hash.startsWith('#visits?')
  && new URLSearchParams(window.location.hash.split('?')[1] || '').get('from') === 'dashboard';

const matchingDefaultFilters = {
  startDateTime: '2026-08-11T00:00:00',
  endDateTime: '2026-08-12T23:59:59',
  brand: '全部品牌',
  region: '全部大区',
  zone: '全部战区',
  store: '全部门店'
};
const matchingFilterState = { ...matchingDefaultFilters };

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

function getBadgeUploadCompletedDate(item) {
  return item.status === '已上传' && /^\d{4}-\d{2}-\d{2}/.test(item.completedAt) ? item.completedAt.slice(0, 10) : '';
}

function shiftBadgeUploadDate(date, dayOffset) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + dayOffset);
  return value.toISOString().slice(0, 10);
}

function getBadgeUploadDateRange(startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) return [];
  const dates = [];
  for (let date = startDate; date <= endDate; date = shiftBadgeUploadDate(date, 1)) dates.push(date);
  return dates;
}

function getCompletedBadgeUploadRecords() {
  return getCurrentBadgeUploadRecords().filter((item) => {
    const completedDate = getBadgeUploadCompletedDate(item);
    return completedDate && completedDate >= badgeUploadFilterState.startDate && completedDate <= badgeUploadFilterState.endDate;
  });
}

function getLatestBadgeUploadDate(records, fallbackDate) {
  return records.map(getBadgeUploadCompletedDate).filter(Boolean).sort().at(-1) || fallbackDate;
}

function resetBadgeUploadDateRange() {
  const completedRecords = getCurrentBadgeUploadRecords().filter((item) => getBadgeUploadCompletedDate(item));
  const latestDate = getLatestBadgeUploadDate(completedRecords, badgeUploadDefaultFilters.endDate);
  badgeUploadFilterState.startDate = shiftBadgeUploadDate(latestDate, -6);
  badgeUploadFilterState.endDate = latestDate;
  badgeUploadSelectedDate = latestDate;
}

function normalizeDeviceQuery(value) {
  return String(value || '').trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
}

function getVisitRecordingId(record) {
  return record.status === '已匹配' ? record.recordingId || '' : '';
}

function getFilteredVisitRecords() {
  const queryFields = {
    businessId: 'businessId',
    recordingId: 'recordingId',
    customerId: 'customerId',
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    advisorName: 'advisor'
  };
  return visitRecords.filter((item) => {
    const dateMatch = isWithinDateTimeRange(getRecordDateTime(item.date, item.startTime), visitFilterState.startDateTime, visitFilterState.endDateTime);
    const organizationMatch = visitFilterState.organization === '全部组织'
      || item.region === visitFilterState.organization
      || item.zone === visitFilterState.organization
      || item.store === visitFilterState.organization;
    const sourceMatch = visitFilterState.source === '全部来源' || item.source === visitFilterState.source;
    const statusMatch = visitFilterState.status === '全部状态'
      || (visitFilterState.status === '全部未匹配' && item.status !== '已匹配')
      || (visitFilterState.status === '异常需处理' && (item.status === '匹配失败' || item.status === '无录音'))
      || item.status === visitFilterState.status;
    const queryMatch = Object.entries(queryFields).every(([filterKey, recordKey]) => {
      const query = normalizeDeviceQuery(visitFilterState[filterKey]);
      const recordValue = filterKey === 'recordingId' ? getVisitRecordingId(item) : item[recordKey];
      return !query || normalizeDeviceQuery(recordValue).includes(query);
    });
    return dateMatch && organizationMatch && sourceMatch && statusMatch && queryMatch;
  });
}

function formatDeviceCount(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function getVisitStatusClass(status) {
  if (status === '已匹配') return 'success';
  if (visitWaitingStatuses.has(status)) return 'waiting';
  return 'danger';
}

function getVisitDetailType(record) {
  if (visitUploadDetailStatuses.has(record.status)) return 'uploads';
  if (visitEventDetailStatuses.has(record.status) && record.badgeSn) return 'events';
  return '';
}

function getUniqueVisitRecordsByBusinessId(records) {
  const uniqueRecords = new Map();
  records.forEach((item) => {
    if (item.businessId && !uniqueRecords.has(item.businessId)) uniqueRecords.set(item.businessId, item);
  });
  return [...uniqueRecords.values()];
}

function getVisitMetricCategory(status) {
  if (status === '已匹配') return 'matched';
  if (visitProcessingStatuses.has(status)) return 'processing';
  if (status === '匹配失败') return 'failed';
  if (status === '无录音') return 'noRecording';
  return '';
}

function getVisitPaginationItems(totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  if (visitPaginationState.page > 3) items.push('left');
  for (let page = Math.max(2, visitPaginationState.page - 1); page <= Math.min(totalPages - 1, visitPaginationState.page + 1); page += 1) items.push(page);
  if (visitPaginationState.page < totalPages - 2) items.push('right');
  items.push(totalPages);
  return items;
}

function renderVisitPagination(totalItems) {
  const container = document.getElementById('visitPagination');
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / visitPaginationState.pageSize));
  visitPaginationState.page = Math.min(visitPaginationState.page, totalPages);
  container.innerHTML = `
    <div class="dashboard-pagination">
      <span class="session-pagination-total">共 ${formatDeviceCount(totalItems)} 条</span>
      <div class="dashboard-pagination-controls">
        <label class="page-select store-page-size"><select data-visit-page-size aria-label="每页条数"><option value="20"${visitPaginationState.pageSize === 20 ? ' selected' : ''}>20 条/页</option><option value="50"${visitPaginationState.pageSize === 50 ? ' selected' : ''}>50 条/页</option></select></label>
        <div class="page-group">
          <button type="button" class="page-arrow" data-visit-page-action="prev" ${visitPaginationState.page === 1 ? 'disabled' : ''}>‹</button>
          ${getVisitPaginationItems(totalPages).map((item) => typeof item === 'number' ? `<button type="button" class="page-num${item === visitPaginationState.page ? ' active' : ''}" data-visit-page="${item}">${item}</button>` : '<span class="page-ellipsis">…</span>').join('')}
          <button type="button" class="page-arrow" data-visit-page-action="next" ${visitPaginationState.page === totalPages ? 'disabled' : ''}>›</button>
        </div>
        <div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${totalPages}" value="${visitPaginationState.page}" data-visit-page-jump aria-label="跳转页码" /></label><span class="session-page-jump-suffix">页</span></div>
      </div>
    </div>`;
}

function renderVisits() {
  const tbody = document.getElementById('visitTableBody');
  if (!tbody) return;
  const records = getFilteredVisitRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / visitPaginationState.pageSize));
  visitPaginationState.page = Math.min(visitPaginationState.page, totalPages);
  const start = (visitPaginationState.page - 1) * visitPaginationState.pageSize;
  const visibleRecords = records.slice(start, start + visitPaginationState.pageSize);
  const metricRecords = getUniqueVisitRecordsByBusinessId(records);
  const sumWeight = (predicate = () => true) => metricRecords.filter(predicate).reduce((total, item) => total + Number(item.weight ?? 1), 0);
  const total = sumWeight();
  const countCategory = (category) => sumWeight((item) => getVisitMetricCategory(item.status) === category);
  const matched = countCategory('matched');
  const processing = countCategory('processing');
  const failed = countCategory('failed');
  const noRecording = countCategory('noRecording');
  const resultSummary = document.getElementById('visitResultSummary');
  if (resultSummary) resultSummary.textContent = `共 ${formatDeviceCount(total)} 条 · 已匹配 ${formatDeviceCount(matched)} 条 · 处理中 ${formatDeviceCount(processing)} 条 · 异常需处理 ${formatDeviceCount(failed + noRecording)} 条`;
  tbody.innerHTML = visibleRecords.length ? visibleRecords.map((item) => {
    const tone = getVisitStatusClass(item.status);
    const detailType = getVisitDetailType(item);
    const detailControl = detailType
      ? `<button class="text-btn" data-visit-detail-type="${detailType}" data-business-id="${escapeBadgeHtml(item.businessId)}">${escapeBadgeHtml(item.detailText)}</button>`
      : '<span class="visit-detail-disabled">—</span>';
    return `<tr>
      <td>${escapeBadgeHtml(item.date)}</td><td>${escapeBadgeHtml(item.startTime)}</td><td>${escapeBadgeHtml(item.endTime)}</td><td><span class="status ${tone}">${escapeBadgeHtml(item.status)}</span></td>
      <td>${detailControl}</td><td>${escapeBadgeHtml(item.customerName)}</td><td>${escapeBadgeHtml(item.customerPhone)}</td><td>${escapeBadgeHtml(item.advisor)}</td><td>${escapeBadgeHtml(item.store)}</td>
      <td>${escapeBadgeHtml(item.scene)}</td><td>${escapeBadgeHtml(item.carSeries)}</td><td>${escapeBadgeHtml(item.completedAt)}</td><td><span class="source-tag ${item.source === '销售助手' ? 'api' : 'excel'}">${escapeBadgeHtml(item.source)}</span></td>
      <td>${escapeBadgeHtml(item.updatedAt)}</td><td>${escapeBadgeHtml(item.customerId)}</td><td>${escapeBadgeHtml(item.storeCode)}</td><td>${escapeBadgeHtml(item.businessId)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="17" class="badge-record-empty">当前筛选条件下暂无到访记录。</td></tr>';
  renderVisitPagination(records.length);
}

function sumVisitWeights(records) {
  return records.reduce((total, record) => total + Number(record.weight ?? 1), 0);
}

function getMatchingRecordCategory(record) {
  if (visitProcessingStatuses.has(record.status)) return 'processing';
  if (record.status === '匹配失败' || record.status === '无录音') return 'action';
  return 'matched';
}

function getFilteredMatchingVisitRecords() {
  return getUniqueVisitRecordsByBusinessId(visitRecords).filter((record) => {
    const dateMatch = isWithinDateTimeRange(getRecordDateTime(record.date, record.startTime), matchingFilterState.startDateTime, matchingFilterState.endDateTime);
    const brandMatch = matchingFilterState.brand === '全部品牌' || matchingFilterState.brand === '星海汽车';
    const regionMatch = matchingFilterState.region === '全部大区' || record.region === matchingFilterState.region;
    const zoneMatch = matchingFilterState.zone === '全部战区' || record.zone === matchingFilterState.zone;
    const storeMatch = matchingFilterState.store === '全部门店' || record.store === matchingFilterState.store;
    return dateMatch && brandMatch && regionMatch && zoneMatch && storeMatch;
  });
}

function getMatchingStoreSummaries(records) {
  const stores = new Map();
  records.forEach((record) => {
    if (!stores.has(record.store)) {
      stores.set(record.store, {
        store: record.store,
        region: record.region,
        zone: record.zone,
        visits: 0,
        matched: 0,
        processing: 0,
        action: 0
      });
    }
    const summary = stores.get(record.store);
    const count = Number(record.weight ?? 1);
    const category = getMatchingRecordCategory(record);
    summary.visits += count;
    summary[category] += count;
  });
  return [...stores.values()].sort((left, right) => {
    if (right.action !== left.action) return right.action - left.action;
    const leftRate = left.visits ? left.matched / left.visits : 0;
    const rightRate = right.visits ? right.matched / right.visits : 0;
    return leftRate - rightRate;
  });
}

function renderMatchingStoreTable(records) {
  const tbody = document.getElementById('matchingTableBody');
  const thead = document.getElementById('matchingTableHead');
  const pagination = document.getElementById('matchingPaginationTotal');
  const summaries = getMatchingStoreSummaries(records);
  thead.innerHTML = '<tr><th>门店</th><th>到访数</th><th>已匹配到访</th><th>处理中</th><th>异常需处理</th><th>录音匹配率</th><th>操作</th></tr>';
  tbody.innerHTML = summaries.length ? summaries.map((item) => {
    const rate = item.visits ? item.matched / item.visits * 100 : 0;
    const rateTone = rate >= 88 ? 'good-rate' : 'bad-rate';
    const processingControl = item.processing
      ? `<span class="amber-text">${formatDeviceCount(item.processing)}</span>`
      : '<span class="muted-text">0</span>';
    const actionControl = item.action
      ? `<span class="danger-text">${formatDeviceCount(item.action)}</span>`
      : '<span class="muted-text">0</span>';
    return `<tr>
      <td><span class="matching-store-cell"><strong>${escapeBadgeHtml(item.store)}</strong><small>${escapeBadgeHtml(item.region)} · ${escapeBadgeHtml(item.zone)}</small></span></td>
      <td>${formatDeviceCount(item.visits)}</td><td>${formatDeviceCount(item.matched)}</td>
      <td>${processingControl}</td><td>${actionControl}</td>
      <td><span class="rate-cell ${rateTone}"><strong>${rate.toFixed(1)}%</strong><i><b style="width:${rate.toFixed(1)}%"></b></i></span></td>
      <td><button class="text-btn" type="button" data-matching-drilldown="action" data-matching-store="${escapeBadgeHtml(item.store)}">查看异常需处理</button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" class="badge-record-empty">当前筛选条件下暂无门店数据。</td></tr>';
  if (pagination) pagination.textContent = `共 ${summaries.length} 家门店`;
}

function renderMatchingDashboard() {
  const records = getFilteredMatchingVisitRecords();
  const visits = sumVisitWeights(records);
  const matched = sumVisitWeights(records.filter((record) => getMatchingRecordCategory(record) === 'matched'));
  const processing = sumVisitWeights(records.filter((record) => getMatchingRecordCategory(record) === 'processing'));
  const problems = sumVisitWeights(records.filter((record) => getMatchingRecordCategory(record) === 'action'));
  const rate = visits ? matched / visits * 100 : 0;
  const metricValues = {
    matchingMetricVisits: formatDeviceCount(visits),
    matchingMetricMatched: formatDeviceCount(matched),
    matchingMetricRate: `${rate.toFixed(1)}%`,
    matchingMetricProcessing: formatDeviceCount(processing),
    matchingMetricProblems: formatDeviceCount(problems),
    matchingMetricRateNote: `${formatDeviceCount(matched)} ÷ ${formatDeviceCount(visits)}`
  };
  Object.entries(metricValues).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
  renderMatchingStoreTable(records);
}

function openVisitsFromMatching(store, status) {
  const organization = store
    || (matchingFilterState.store !== '全部门店' ? matchingFilterState.store : '')
    || (matchingFilterState.zone !== '全部战区' ? matchingFilterState.zone : '')
    || (matchingFilterState.region !== '全部大区' ? matchingFilterState.region : '全部组织');
  Object.assign(visitFilterState, {
    ...visitDefaultFilters,
    startDateTime: matchingFilterState.startDateTime,
    endDateTime: matchingFilterState.endDateTime,
    organization,
    status
  });
  visitPaginationState.page = 1;
  visitReturnToMatching = true;
  syncFilterControls('[data-visit-filter]', visitFilterState);
  renderVisits();
  setRoute('visits');
  showToast('已带入录音排查条件');
}

function syncBadgeEventDateView() {
  const parsedDate = new Date(`${badgeEventFilterState.date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return;
  badgeEventMenuState.dateViewYear = parsedDate.getFullYear();
  badgeEventMenuState.dateViewMonth = parsedDate.getMonth() + 1;
}

function getBadgeEventDateCells() {
  const cells = [];
  const { dateViewYear: year, dateViewMonth: month } = badgeEventMenuState;
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingSlots; index += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    const value = formatStoreDateValue(new Date(year, month - 1, day));
    cells.push({ day, value, selected: value === badgeEventFilterState.date });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderBadgeEventDatePanel() {
  return `
    <div class="session-menu-panel session-menu-panel-date badge-event-date-panel" role="dialog" aria-label="查询日期">
      <div class="session-date-panel-head">
        <div class="session-date-panel-copy"><span>查询日期</span><strong>${escapeBadgeHtml(formatStoreDateDisplay(badgeEventFilterState.date))}</strong></div>
        <div class="session-date-nav">
          <button type="button" class="session-date-nav-btn" data-badge-event-date-nav="-1" aria-label="上一个月"><i class="session-date-nav-arrow prev" aria-hidden="true"></i></button>
          <strong>${badgeEventMenuState.dateViewYear}年${badgeEventMenuState.dateViewMonth}月</strong>
          <button type="button" class="session-date-nav-btn" data-badge-event-date-nav="1" aria-label="下一个月"><i class="session-date-nav-arrow next" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="session-date-weekdays"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
      <div class="session-date-grid">
        ${getBadgeEventDateCells().map((cell) => cell
          ? `<button type="button" class="session-date-day${cell.selected ? ' is-start is-end' : ''}" data-badge-event-date-value="${cell.value}">${cell.day}</button>`
          : '<span class="session-date-empty" aria-hidden="true"></span>').join('')}
      </div>
    </div>`;
}

function renderBadgeEventFilters() {
  const container = document.getElementById('badgeEventFilters');
  if (!container) return;
  const dateOpen = badgeEventMenuState.openMenu === 'date';
  const typeOpen = badgeEventMenuState.openMenu === 'type';
  const typeLabel = badgeEventTypeOptions.find(([value]) => value === badgeEventFilterState.type)?.[1] || '全部事件';
  container.innerHTML = `
    <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date badge-event-filter-control${dateOpen ? ' is-open' : ''}">
      <span>查询日期</span>
      <button type="button" class="session-date-trigger${dateOpen ? ' active' : ''}" data-badge-event-date-trigger aria-label="查询日期筛选" aria-haspopup="dialog" aria-expanded="${dateOpen}">
        <strong>${escapeBadgeHtml(formatStoreDateDisplay(badgeEventFilterState.date))}</strong><span class="session-date-icon" aria-hidden="true"></span>
      </button>
      ${dateOpen ? renderBadgeEventDatePanel() : ''}
    </div>
    <div class="session-toolbar-control session-toolbar-menu badge-event-filter-control${typeOpen ? ' is-open' : ''}">
      <span>事件类型</span>
      <button type="button" class="session-select-trigger${typeOpen ? ' active' : ''}" data-badge-event-type-trigger aria-haspopup="listbox" aria-expanded="${typeOpen}">
        <strong>${escapeBadgeHtml(typeLabel)}</strong><i class="session-select-caret" aria-hidden="true"></i>
      </button>
      ${typeOpen ? `<div class="session-menu-panel" role="listbox"><div class="session-menu-option-list">${badgeEventTypeOptions.map(([value, label]) => `<button type="button" class="session-menu-option${badgeEventFilterState.type === value ? ' active' : ''}" data-badge-event-type-value="${value}" role="option" aria-selected="${badgeEventFilterState.type === value}"><span>${label}</span></button>`).join('')}</div></div>` : ''}
    </div>
    <button class="btn session-reset-btn badge-event-filter-reset" type="button" data-badge-event-reset>重置筛选</button>`;
}

function closeBadgeEventMenus() {
  if (!badgeEventMenuState.openMenu) return false;
  badgeEventMenuState.openMenu = null;
  renderBadgeEventFilters();
  return true;
}

function syncBadgeUploadDateDraft() {
  badgeUploadMenuState.dateDraftStartDate = badgeUploadFilterState.startDate;
  badgeUploadMenuState.dateDraftEndDate = badgeUploadFilterState.endDate;
  const parsedDate = new Date(`${badgeUploadMenuState.dateDraftStartDate}T00:00:00`);
  if (!Number.isNaN(parsedDate.getTime())) {
    badgeUploadMenuState.dateViewYear = parsedDate.getFullYear();
    badgeUploadMenuState.dateViewMonth = parsedDate.getMonth() + 1;
  }
}

function getBadgeUploadDateCells() {
  const cells = [];
  const { dateViewYear: year, dateViewMonth: month } = badgeUploadMenuState;
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingSlots; index += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    const value = formatStoreDateValue(new Date(year, month - 1, day));
    cells.push({
      day,
      value,
      inRange: value >= badgeUploadMenuState.dateDraftStartDate && value <= badgeUploadMenuState.dateDraftEndDate,
      isStart: value === badgeUploadMenuState.dateDraftStartDate,
      isEnd: value === badgeUploadMenuState.dateDraftEndDate,
      isToday: value === storeTodayDateValue
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderBadgeUploadFilters() {
  const container = document.getElementById('badgeUploadFilters');
  if (!container) return;
  const dateOpen = badgeUploadMenuState.openMenu === 'date';
  const panelRenderer = globalThis.__dateFilterComponentUtils?.renderDateRangePanelMarkup;
  const startDate = badgeUploadFilterState.startDate;
  const endDate = badgeUploadFilterState.endDate;
  const draftRangeText = `${formatStoreDateDisplay(badgeUploadMenuState.dateDraftStartDate)} 至 ${formatStoreDateDisplay(badgeUploadMenuState.dateDraftEndDate)}`;
  const datePanel = dateOpen && panelRenderer ? panelRenderer({
    dataNamespace: 'badge-upload-date',
    rangeText: draftRangeText,
    monthLabel: `${badgeUploadMenuState.dateViewYear}年${badgeUploadMenuState.dateViewMonth}月`,
    activeField: badgeUploadMenuState.activeDateField,
    startLabel: formatStoreDateDisplay(badgeUploadMenuState.dateDraftStartDate),
    endLabel: formatStoreDateDisplay(badgeUploadMenuState.dateDraftEndDate),
    cells: getBadgeUploadDateCells(),
    summaryText: `已选择 ${draftRangeText}`,
    panelClassName: 'session-menu-panel session-menu-panel-date badge-upload-date-panel',
    title: '上传完成日期范围'
  }) : '';
  container.innerHTML = `
    <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date badge-event-filter-control${dateOpen ? ' is-open' : ''}">
      <span>上传完成日期</span>
      <button type="button" class="session-date-trigger${dateOpen ? ' active' : ''}" data-badge-upload-date-trigger aria-label="上传完成日期筛选" aria-haspopup="dialog" aria-expanded="${dateOpen}">
        <strong>${escapeBadgeHtml(formatStoreDateDisplay(startDate))}</strong><em>至</em><strong>${escapeBadgeHtml(formatStoreDateDisplay(endDate))}</strong><span class="session-date-icon" aria-hidden="true"></span>
      </button>
      ${datePanel}
    </div>
    <button class="btn session-reset-btn badge-event-filter-reset" type="button" data-badge-upload-filter-reset>重置筛选</button>`;
}

function closeBadgeUploadMenus() {
  if (!badgeUploadMenuState.openMenu) return false;
  badgeUploadMenuState.openMenu = null;
  renderBadgeUploadFilters();
  return true;
}

function getBadgeRecordProfile() {
  const detailRecord = badgeDetailRecords.find((item) => item.sn === badgeRecordState.sn);
  if (detailRecord) return { advisorName: detailRecord.advisorName, storeName: detailRecord.store, sn: detailRecord.sn };
  const eventRecord = badgeEventRecords.find((item) => item.sn === badgeRecordState.sn);
  if (eventRecord) return { advisorName: eventRecord.employeeName, storeName: eventRecord.storeName, sn: eventRecord.sn };
  return { advisorName: badgeRecordState.advisorName || '—', storeName: '—', sn: badgeRecordState.sn || '—' };
}

function renderBadgeRecordHeader() {
  const profile = getBadgeRecordProfile();
  badgeRecordState.advisorName = profile.advisorName;
  const advisorName = document.getElementById('badgeRecordAdvisorName');
  const storeName = document.getElementById('badgeRecordStoreName');
  const sn = document.getElementById('badgeRecordSn');
  const drawerAdvisorName = document.getElementById('badgeRecordDrawerAdvisorName');
  const drawerStoreName = document.getElementById('badgeRecordDrawerStoreName');
  const drawerSn = document.getElementById('badgeRecordDrawerSn');
  if (advisorName) advisorName.textContent = profile.advisorName;
  if (storeName) storeName.textContent = profile.storeName;
  if (sn) sn.textContent = profile.sn;
  if (drawerAdvisorName) drawerAdvisorName.textContent = profile.advisorName;
  if (drawerStoreName) drawerStoreName.textContent = profile.storeName;
  if (drawerSn) drawerSn.textContent = profile.sn;
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

function getBadgeRecordPaginationItems(state, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  if (state.page > 3) items.push('left');
  for (let page = Math.max(2, state.page - 1); page <= Math.min(totalPages - 1, state.page + 1); page += 1) items.push(page);
  if (state.page < totalPages - 2) items.push('right');
  items.push(totalPages);
  return items;
}

function getBadgeRecordPaginationState(key) {
  if (key === 'daily') return badgeUploadDailyPaginationState;
  return badgeUploadModalPaginationState;
}

function renderBadgeRecordPagination(containerId, totalItems, key) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const state = getBadgeRecordPaginationState(key);
  const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  container.innerHTML = `
    <div class="dashboard-pagination">
      <span class="session-pagination-total">共 ${totalItems} 条</span>
      <div class="dashboard-pagination-controls">
        <div class="custom-select-container page-select page-size-select">
          <button type="button" class="custom-select-trigger page-size-trigger" data-badge-record-page-size-trigger="${key}"><span>${state.pageSize} 条/页</span></button>
          <div class="custom-select-options page-size-options">${[10, 20, 50].map((size) => `<button type="button" class="custom-option page-size-option${size === state.pageSize ? ' active' : ''}" data-badge-record-page-size="${key}" data-page-size="${size}"><span>${size} 条/页</span></button>`).join('')}</div>
        </div>
        <div class="page-group">
          <button type="button" class="page-arrow" data-badge-record-page-action="${key}" data-page-action="prev" aria-label="上一页" ${state.page === 1 ? 'disabled' : ''}>‹</button>
          ${getBadgeRecordPaginationItems(state, totalPages).map((item) => typeof item === 'number' ? `<button type="button" class="page-num${item === state.page ? ' active' : ''}" data-badge-record-page="${key}" data-page="${item}" aria-label="第 ${item} 页" ${item === state.page ? 'aria-current="page"' : ''}>${item}</button>` : '<span class="page-ellipsis">…</span>').join('')}
          <button type="button" class="page-arrow" data-badge-record-page-action="${key}" data-page-action="next" aria-label="下一页" ${state.page === totalPages ? 'disabled' : ''}>›</button>
        </div>
        <div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${totalPages}" value="${state.page}" data-badge-record-page-jump="${key}" /></label><span class="session-page-jump-suffix">页</span></div>
      </div>
    </div>`;
}

function renderBadgeUploadModal() {
  const tbody = document.getElementById('badgeUploadTableBody');
  if (!tbody) return;
  const totalPages = Math.max(1, Math.ceil(badgeUploadModalState.records.length / badgeUploadModalPaginationState.pageSize));
  badgeUploadModalPaginationState.page = Math.min(badgeUploadModalPaginationState.page, totalPages);
  const start = (badgeUploadModalPaginationState.page - 1) * badgeUploadModalPaginationState.pageSize;
  const visibleRecords = badgeUploadModalState.records.slice(start, start + badgeUploadModalPaginationState.pageSize);
  tbody.innerHTML = visibleRecords.length ? visibleRecords.map((item) => `<tr>
    <td>${escapeBadgeHtml(item.advisorName)}</td><td>${escapeBadgeHtml(item.sn)}</td><td>${escapeBadgeHtml(item.sequence)}</td>
    <td>${escapeBadgeHtml(item.size)}</td><td>${escapeBadgeHtml(getBadgeUploadStartTime(item))}</td><td>${escapeBadgeHtml(item.duration)}</td>
    <td>${escapeBadgeHtml(item.completedAt)}</td><td>${escapeBadgeHtml(getBadgeUploadMatchTime(item))}</td>
  </tr>`).join('') : `<tr><td colspan="8" class="badge-record-empty">${escapeBadgeHtml(badgeUploadModalState.emptyText)}</td></tr>`;
  renderBadgeRecordPagination('badgeUploadPagination', badgeUploadModalState.records.length, 'modal');
}

function renderBadgeUploads() {
  const dailyTbody = document.getElementById('badgeUploadDailyTableBody');
  if (!dailyTbody) return;
  const completedRecords = getCompletedBadgeUploadRecords();
  const dates = getBadgeUploadDateRange(badgeUploadFilterState.startDate, badgeUploadFilterState.endDate);
  if (!dates.includes(badgeUploadSelectedDate)) badgeUploadSelectedDate = getLatestBadgeUploadDate(completedRecords, badgeUploadFilterState.endDate);
  const countsByDate = completedRecords.reduce((result, item) => {
    const completedDate = getBadgeUploadCompletedDate(item);
    result[completedDate] = (result[completedDate] || 0) + 1;
    return result;
  }, {});
  const dailySummary = document.getElementById('badgeUploadDailySummary');
  if (dailySummary) dailySummary.textContent = `${badgeUploadFilterState.startDate} 至 ${badgeUploadFilterState.endDate} · 共 ${completedRecords.length} 条上传完成录音 · 点击数量查看明细`;
  const orderedDates = [...dates].reverse();
  const dailyTotalPages = Math.max(1, Math.ceil(orderedDates.length / badgeUploadDailyPaginationState.pageSize));
  badgeUploadDailyPaginationState.page = Math.min(badgeUploadDailyPaginationState.page, dailyTotalPages);
  const dailyStart = (badgeUploadDailyPaginationState.page - 1) * badgeUploadDailyPaginationState.pageSize;
  const visibleDates = orderedDates.slice(dailyStart, dailyStart + badgeUploadDailyPaginationState.pageSize);
  dailyTbody.innerHTML = dates.length ? visibleDates.map((date) => {
    const count = countsByDate[date] || 0;
    return `<tr class="${date === badgeUploadSelectedDate ? 'is-selected' : ''}"><td>${escapeBadgeHtml(date)}</td><td><button class="badge-upload-count-button" type="button" data-badge-upload-day="${escapeBadgeHtml(date)}" aria-label="查看 ${escapeBadgeHtml(date)} 的 ${count} 条录音上传明细">${count}</button></td></tr>`;
  }).join('') : '<tr><td colspan="2" class="badge-record-empty">请选择有效的日期范围。</td></tr>';
  renderBadgeRecordPagination('badgeUploadDailyPagination', dates.length, 'daily');
}

function selectBadgeRecord(sn, advisorName) {
  badgeRecordState.sn = sn || badgeRecordState.sn;
  badgeRecordState.advisorName = advisorName || badgeRecordState.advisorName;
  badgeEventFilterState.sn = badgeRecordState.sn;
  badgeEventFilterState.type = 'all';
  const eventRecord = getBadgeEventRecord(badgeRecordState.sn);
  const detailRecord = badgeDetailRecords.find((item) => item.sn === badgeRecordState.sn);
  badgeEventFilterState.date = eventRecord?.date || detailRecord?.queryDate || badgeEventDefaultFilters.date;
  resetBadgeUploadDateRange();
  badgeUploadDailyPaginationState.page = 1;
  badgeUploadModalPaginationState.page = 1;
  syncBadgeEventDateView();
  renderBadgeEventFilters();
  syncBadgeUploadDateDraft();
  renderBadgeUploadFilters();
  renderBadgeRecordHeader();
  renderBadgeEvents();
  renderBadgeUploads();
}

function getVisitFailedUploadMessage(record) {
  if (record.detailText === '未绑定工牌') return '未匹配到录音，请绑定工牌';
  if (record.detailText === '到访和结束日期非同一天') return '未匹配到录音，请确认并更新到访日期';
  return '未匹配到录音，请检查匹配失败原因';
}

function renderVisitUploadDetail(record) {
  const isPendingDetail = record.status === '录音上传中';
  const isFailedDetail = record.status === '匹配失败';
  const detailRecords = isFailedDetail ? [] : badgeUploadRecords.filter((item) => item.sn === record.badgeSn
    && item.date === record.date
    && (isPendingDetail ? item.status !== '已上传' : item.status === '已上传'));
  const detailTitle = document.getElementById('badgeUploadDetailTitle');
  detailTitle.textContent = `${record.date} 录音上传明细`;
  badgeUploadDetailDescription.textContent = isFailedDetail
    ? `${record.status} · ${record.advisor} · 到访日期 ${record.date} · ${record.detailText}`
    : `${record.status} · ${record.advisor} · ${record.badgeSn} · ${isPendingDetail ? `共 ${detailRecords.length} 条未上传录音` : record.date}`;
  badgeUploadModalState.records = detailRecords.map((item, index) => ({
    ...item,
    sequence: isPendingDetail ? String(index + 1) : item.sequence,
    completedAt: isPendingDetail ? '未上传' : item.completedAt
  }));
  badgeUploadModalState.emptyText = isFailedDetail ? getVisitFailedUploadMessage(record) : isPendingDetail ? '当前没有未上传录音。' : '当前日期没有上传完成的录音。';
  badgeUploadModalPaginationState.page = 1;
  renderBadgeUploadModal();
}

function renderVisitEventDetail(record) {
  const eventRecord = badgeEventRecords.find((item) => item.sn === record.badgeSn && item.date === record.date);
  const events = (eventRecord?.events || []).slice().sort((left, right) => left.time.localeCompare(right.time));
  visitEventDetailTitle.textContent = '工牌事件明细';
  visitEventDetailDescription.textContent = `${record.detailText} · 到访 ${record.startTime}—${record.endTime} · 展示当天全部工牌事件`;
  visitEventAdvisorName.textContent = record.advisor;
  visitEventStoreName.textContent = record.store;
  visitEventSn.textContent = record.badgeSn;
  visitEventDate.value = record.date;
  visitEventResultSummary.textContent = `${record.date} · 共 ${events.length} 条`;
  visitEventDetailTimeline.innerHTML = events.length ? events.map((item) => `
    <article class="${badgeSecondaryEventTypes.has(item.type) ? 'event-secondary' : 'event-primary'}${item.note ? ' event-wide' : ''}">
      <span class="event-dot ${item.color}" aria-hidden="true">${renderBadgeEventIcon(item)}</span>
      <div><strong>${escapeBadgeHtml(item.label)}</strong><p>${escapeBadgeHtml(item.time)}</p></div>
      ${item.note ? `<em>${escapeBadgeHtml(item.note)}</em>` : ''}
    </article>`).join('') : `<div class="event-empty-state">${record.detailText === '工牌未开机' ? '到访当天没有开机、关机、录音等工牌事件。' : '当前工牌在所选日期没有工牌事件。'}</div>`;
}

function openVisitMatchDetail(record, detailType) {
  if (detailType === 'uploads') {
    renderVisitUploadDetail(record);
    openModal(badgeUploadDetailModal);
    return;
  }

  renderVisitEventDetail(record);
  openModal(visitEventDetailModal);
}

function syncBadgeRecordTabs(route) {
  const activeTab = route === 'uploads' ? 'uploads' : 'events';
  badgeEventMenuState.openMenu = null;
  badgeUploadMenuState.openMenu = null;
  renderBadgeEventFilters();
  renderBadgeUploadFilters();
  document.querySelectorAll('[data-badge-record-tab]').forEach((button) => {
    const active = button.dataset.badgeRecordTab === activeTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-badge-record-content]').forEach((content) => {
    content.hidden = content.dataset.badgeRecordContent !== activeTab;
  });
  syncBadgeRecordDrawerFilter(activeTab);
}

function badgeEventTimeToSeconds(time) {
  const [hours = 0, minutes = 0, seconds = 0] = String(time || '').split(':').map(Number);
  return (hours * 60 * 60) + (minutes * 60) + seconds;
}

function formatBadgeEventDuration(startTime, endTime) {
  if (!startTime || !endTime) return '—';
  const duration = Math.max(0, badgeEventTimeToSeconds(endTime) - badgeEventTimeToSeconds(startTime));
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  if (hours > 0) return `${hours}小时${String(minutes).padStart(2, '0')}分`;
  return `${minutes}分${String(seconds).padStart(2, '0')}秒`;
}

function buildBadgeEventGroups(events) {
  const groups = [];
  let activeSession = null;
  let activeRecording = null;
  let activeCharging = null;
  let sessionNumber = 0;

  function startSession(event) {
    sessionNumber += 1;
    activeSession = {
      kind: 'session',
      number: sessionNumber,
      start: event,
      end: null,
      endReason: null,
      powerOns: [],
      powerOffs: [],
      recordings: [],
      warnings: [],
      types: new Set()
    };
    groups.push(activeSession);
  }

  events.forEach((event) => {
    if (event.type === 'power-on') {
      if (!activeSession && !activeCharging) startSession(event);
      if (!activeSession) {
        groups.push({ kind: 'standalone', event, types: new Set([event.type]) });
        return;
      }
      activeSession.powerOns.push(event);
      activeSession.types.add(event.type);
      activeRecording = null;
      return;
    }

    if (event.type === 'recording-start') {
      if (!activeSession && !activeCharging) startSession(event);
      if (!activeSession) {
        groups.push({ kind: 'standalone', event, types: new Set([event.type]) });
        return;
      }
      activeRecording = { start: event, end: null };
      activeSession.recordings.push(activeRecording);
      activeSession.types.add(event.type);
      return;
    }

    if (event.type === 'recording-end' && activeSession) {
      if (activeRecording && !activeRecording.end) activeRecording.end = event;
      activeSession.types.add(event.type);
      activeRecording = null;
      return;
    }

    if (event.type === 'low-battery' && activeSession) {
      activeSession.warnings.push(event);
      activeSession.types.add(event.type);
      return;
    }

    if (event.type === 'power-off' && activeSession) {
      activeSession.powerOffs.push(event);
      activeSession.end = event;
      activeSession.endReason = 'power-off';
      activeSession.types.add(event.type);
      activeSession = null;
      activeRecording = null;
      return;
    }

    if (event.type === 'charging-start') {
      if (activeSession) {
        activeSession.end = event;
        activeSession.endReason = 'charging-start';
        activeSession = null;
        activeRecording = null;
      }
      activeCharging = {
        kind: 'charging',
        start: event,
        end: null,
        types: new Set(['charging-start'])
      };
      groups.push(activeCharging);
      return;
    }

    if (event.type === 'charging-end' && activeCharging) {
      activeCharging.end = event;
      activeCharging.types.add(event.type);
      activeCharging = null;
      return;
    }

    groups.push({ kind: 'standalone', event, types: new Set([event.type]) });
  });

  return groups;
}

function renderBadgeEventGroup(group, activeType) {
  if (group.kind === 'charging') {
    const endTime = group.end?.time || '进行中';
    return `
      <article class="event-group-card event-charge-card">
        <div class="event-group-row event-charge-row">
          <span class="event-dot green"><img src="../assets/device-event-icons/charging.svg" alt="" aria-hidden="true" /></span>
          <div class="event-group-copy"><strong>充电</strong><p>${escapeBadgeHtml(group.start.time)} — ${escapeBadgeHtml(endTime)}</p></div>
          <em>${group.end ? escapeBadgeHtml(formatBadgeEventDuration(group.start.time, group.end.time)) : '进行中'}</em>
        </div>
      </article>`;
  }

  if (group.kind === 'session') {
    const showAllDetails = activeType === 'all';
    const detailRows = [];

    if (showAllDetails || activeType === 'power-on') {
      group.powerOns.forEach((event) => detailRows.push({
        time: event.time,
        html: `
          <div class="event-group-row event-detail-row event-power-row">
            <span class="event-dot green" aria-hidden="true">${renderBadgeEventIcon(event)}</span>
            <div class="event-group-copy"><strong>工牌开机</strong><p>${escapeBadgeHtml(event.time)}</p></div>
          </div>`
      }));
    }

    if (showAllDetails || activeType === 'recording') {
      group.recordings.forEach((recording) => {
      const recordingEndTime = recording.end?.time || '进行中';
        detailRows.push({
          time: recording.start.time,
          html: `
            <div class="event-group-row event-detail-row">
              <span class="event-dot blue"><img src="../assets/device-event-icons/recording.svg" alt="" aria-hidden="true" /></span>
              <div class="event-group-copy"><strong>录音</strong><p>${escapeBadgeHtml(recording.start.time)} — ${escapeBadgeHtml(recordingEndTime)}</p></div>
              <em>${recording.end ? escapeBadgeHtml(formatBadgeEventDuration(recording.start.time, recording.end.time)) : '进行中'}</em>
            </div>`
        });
      });
    }

    if (showAllDetails || activeType === 'low-battery') {
      group.warnings.forEach((warning) => detailRows.push({
        time: warning.time,
        html: `
          <div class="event-group-row event-detail-row event-warning-row">
            <span class="event-dot red"><img src="../assets/device-event-icons/low-battery.svg" alt="" aria-hidden="true" /></span>
            <div class="event-group-copy"><strong>电量预警</strong><p>${escapeBadgeHtml(warning.time)}</p></div>
            <em>${escapeBadgeHtml(warning.note || '请及时充电')}</em>
          </div>`
      }));
    }

    if (showAllDetails || activeType === 'power-off') {
      group.powerOffs.forEach((event) => detailRows.push({
        time: event.time,
        html: `
          <div class="event-group-row event-detail-row event-power-row">
            <span class="event-dot neutral" aria-hidden="true">${renderBadgeEventIcon(event)}</span>
            <div class="event-group-copy"><strong>工牌关机</strong><p>${escapeBadgeHtml(event.time)}</p></div>
          </div>`
      }));
    }

    const detailMarkup = detailRows
      .sort((left, right) => left.time.localeCompare(right.time))
      .map((row) => row.html)
      .join('');
    return `
      <article class="event-group-card event-session-card">
        <div class="event-session-head">
          <div class="event-session-main">
            <span class="event-session-status${group.end ? ' is-ended' : ''}" aria-hidden="true"></span>
            <div class="event-group-copy"><strong>工牌事件${group.number}</strong></div>
          </div>
          <div class="event-session-duration"><span>持续时长</span><strong>${group.end ? escapeBadgeHtml(formatBadgeEventDuration(group.start.time, group.end.time)) : '进行中'}</strong></div>
        </div>
        ${detailMarkup ? `<div class="event-session-details">${detailMarkup}</div>` : ''}
      </article>`;
  }

  const item = group.event;
  return `
    <article class="event-group-card event-standalone-card">
      <div class="event-group-row">
        <span class="event-dot ${item.color}" aria-hidden="true">${renderBadgeEventIcon(item)}</span>
        <div class="event-group-copy"><strong>${escapeBadgeHtml(item.label)}</strong><p>${escapeBadgeHtml(item.time)}</p></div>
        ${item.note ? `<em>${escapeBadgeHtml(item.note)}</em>` : ''}
      </div>
    </article>`;
}

function renderBadgeEvents() {
  const timeline = document.getElementById('badgeEventTimeline');
  const summary = document.getElementById('badgeEventResultSummary');
  if (!timeline || !summary) return;

  const record = getBadgeEventRecord(badgeEventFilterState.sn, badgeEventFilterState.date);

  if (!record) {
    summary.textContent = '共 0 组记录';
    timeline.classList.remove('event-timeline-grouped');
    timeline.innerHTML = '<div class="event-empty-state">当前日期和工牌 SN 下暂无事件，请检查 SN 是否完整或调整查询日期。</div>';
    return;
  }

  const emptyMessage = badgeEventFilterState.type === 'all'
    ? '当前工牌在所选日期没有工牌事件。'
    : '当前工牌在所选日期没有该类型事件。';
  const groupedEvents = buildBadgeEventGroups(record.events.slice().sort((left, right) => left.time.localeCompare(right.time)))
    .filter((group) => {
      if (badgeEventFilterState.type === 'all') return true;
      if (badgeEventFilterState.type === 'power-on') {
        return (group.kind === 'session' && group.powerOns.length > 0)
          || (group.kind === 'standalone' && group.event.type === 'power-on');
      }
      if (badgeEventFilterState.type === 'power-off') {
        return (group.kind === 'session' && group.powerOffs.length > 0)
          || (group.kind === 'standalone' && group.event.type === 'power-off');
      }
      if (badgeEventFilterState.type === 'recording') return group.kind === 'session' && group.recordings.length > 0;
      if (badgeEventFilterState.type === 'charging') return group.kind === 'charging';
      if (badgeEventFilterState.type === 'low-battery') {
        return (group.kind === 'session' && group.warnings.length > 0)
          || (group.kind === 'standalone' && group.event.type === 'low-battery');
      }
      return false;
    });
  summary.textContent = `共 ${groupedEvents.length} 组记录`;
  timeline.classList.toggle('event-timeline-grouped', groupedEvents.length > 0);
  timeline.innerHTML = groupedEvents.length
    ? groupedEvents.map((group) => renderBadgeEventGroup(group, badgeEventFilterState.type)).join('')
    : `<div class="event-empty-state">${emptyMessage}</div>`;
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
        <div class="fragment-table"><div class="fragment-head"><span>录音片段</span><span>音频时间</span><span>音频时长</span><span>录音上传时间</span></div>
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
        <div class="fragment-table"><div class="fragment-head"><span>录音片段</span><span>音频时间</span><span>音频时长</span><span>录音上传时间</span></div>
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
        <div class="detail-grid"><span><small>客户姓名</small><strong>刘先生</strong></span><span><small>到访时间</small><strong>2026-08-11 18:31:35—18:31:55</strong></span><span><small>员工 / 工牌</small><strong>韩如臣 / MN-BDG-004792</strong></span><span><small>判定结果</small><strong class="danger-text">当天存在开机事件，到访时段未匹配到录音</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>当日录音时段</h3>
        <div class="period-chips"><span>开始边界未知—08:03:32</span><span>09:30:00—10:36:57</span><span>11:36:13—11:42:36</span></div>
      </section>
      <section class="detail-section">
        <h3>工牌日志详情</h3>
        <div class="log-list">
          <article><time>08:03:32</time><div><strong>工牌开机</strong></div></article>
          <article><time>09:28:54</time><div><strong>工牌开机</strong></div></article>
          <article><time>09:30:00—10:36:57</time><div><strong>工牌开启录音</strong><p>期间关联牛先生、余先生、蒋女士 3 条已匹配到访</p></div></article>
          <article><time>11:36:13—11:42:36</time><div><strong>工牌开启录音</strong></div></article>
          <article class="log-highlight"><time>18:31:35—18:31:55</time><div><strong>【未匹配】客户（刘先生）到访</strong><p class="danger-text">该到访时段未匹配到录音</p></div></article>
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
        <div class="detail-grid"><span><small>客户姓名</small><strong>周女士</strong></span><span><small>到访时间</small><strong>2026-08-11 16:23:41—17:08:02</strong></span><span><small>顾问姓名</small><strong>周宁（A01362）</strong></span><span><small>所属门店</small><strong>苏州园区体验中心</strong></span></div>
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

function createVisitRecordDetail(record) {
  const statusClass = getVisitStatusClass(record.status);
  const messageClass = statusClass === 'waiting' ? 'waiting-message' : 'danger-message';
  return {
    businessId: record.businessId,
    status: record.status,
    statusClass,
    html: `
      <section class="detail-section">
        <h3>到访信息</h3>
        <div class="detail-grid"><span><small>客户姓名</small><strong>${escapeBadgeHtml(record.customerName)}</strong></span><span><small>客户 ID</small><strong>${escapeBadgeHtml(record.customerId)}</strong></span><span><small>到访时间</small><strong>${escapeBadgeHtml(`${record.date} ${record.startTime}—${record.endTime}`)}</strong></span><span><small>顾问姓名</small><strong>${escapeBadgeHtml(record.advisor)}</strong></span><span><small>所属门店</small><strong>${escapeBadgeHtml(record.store)}</strong></span><span><small>到访来源</small><strong>${escapeBadgeHtml(record.source)}</strong></span></div>
      </section>
      <section class="detail-section">
        <h3>匹配结果</h3>
        <div class="detail-message ${messageClass}">${escapeBadgeHtml(record.detailText)}</div>
        <div class="detail-grid"><span><small>当前状态</small><strong>${escapeBadgeHtml(record.status)}</strong></span><span><small>数据更新时间</small><strong>${escapeBadgeHtml(`${record.date} ${record.updatedAt}`)}</strong></span><span><small>匹配完成时间</small><strong>${escapeBadgeHtml(record.completedAt)}</strong></span></div>
      </section>`
  };
}
const title = document.getElementById('pageTitle');
const description = document.getElementById('pageDescription');
const topActions = document.getElementById('topActions');
const visitOriginBackButton = document.querySelector('[data-visits-back-matching]');
const toast = document.getElementById('toast');
const importModal = document.getElementById('importModal');
const visitImportDropzone = document.getElementById('visitImportDropzone');
const visitImportFileInput = document.getElementById('visitImportFileInput');
const visitImportFileName = document.getElementById('visitImportFileName');
const visitImportFileHint = document.getElementById('visitImportFileHint');
const visitImportSubmitButton = document.querySelector('[data-visit-import-submit]');
const badgeUploadDetailModal = document.getElementById('badgeUploadDetailModal');
const badgeUploadDetailTitle = document.getElementById('badgeUploadDetailTitle');
const badgeUploadDetailDescription = document.getElementById('badgeUploadDetailDescription');
const visitEventDetailModal = document.getElementById('visitEventDetailModal');
const visitEventDetailTitle = document.getElementById('visitEventDetailTitle');
const visitEventDetailDescription = document.getElementById('visitEventDetailDescription');
const visitEventAdvisorName = document.getElementById('visitEventAdvisorName');
const visitEventStoreName = document.getElementById('visitEventStoreName');
const visitEventSn = document.getElementById('visitEventSn');
const visitEventDate = document.getElementById('visitEventDate');
const visitEventResultSummary = document.getElementById('visitEventResultSummary');
const visitEventDetailTimeline = document.getElementById('visitEventDetailTimeline');
const visitDrawer = document.getElementById('visitDetail');
const drawerBackdrop = document.getElementById('visitDrawer');
const drawerStatus = document.getElementById('drawerStatus');
const drawerBusinessId = document.getElementById('drawerBusinessId');
const drawerBody = document.getElementById('drawerBody');
const badgeRecordPageContent = document.getElementById('badgeRecordPageContent');
const badgeRecordDrawer = document.getElementById('badgeRecordDrawer');
const badgeRecordDrawerBackdrop = document.getElementById('badgeRecordDrawerBackdrop');
const badgeRecordDrawerBody = document.getElementById('badgeRecordDrawerBody');
const badgeRecordDrawerFilterHost = document.getElementById('badgeRecordDrawerFilterHost');
const badgeRecordDrawerContentHost = document.getElementById('badgeRecordDrawerContentHost');
const badgeRecordDrawerTitle = document.getElementById('badgeRecordDrawerTitle');
const badgeRecordDrawerSubtitle = document.getElementById('badgeRecordDrawerSubtitle');
const badgeFieldSettingsDrawer = document.getElementById('badgeFieldSettingsDrawer');
const badgeFieldSettingsBackdrop = document.getElementById('badgeFieldSettingsBackdrop');
const badgeFieldSettingsList = document.getElementById('badgeFieldSettingsList');
const badgeFieldSettingsSelectedCount = document.getElementById('badgeFieldSettingsSelectedCount');
const badgeDockDrawerView = document.getElementById('badgeDockDrawerView');
const badgeDockSubdeviceList = document.getElementById('badgeDockSubdeviceList');
const badgeDockLogTimeline = document.getElementById('badgeDockLogTimeline');
const badgeDockRefreshBtn = document.getElementById('badgeDockRefreshBtn');
const badgeDockEventControl = document.getElementById('badgeDockEventControl');
const badgeDockDateControl = document.getElementById('badgeDockDateControl');
let badgeRecordDrawerTrigger = null;
let badgeRecordDrawerCloseTimer = 0;
let visitImportFile = null;

const sharedOrganizationDirectory = window.AIQCOrganization;
const storeOverviewRecords = (sharedOrganizationDirectory?.dealers || []).map((dealer, index) => ({
  brand: dealer.brand,
  organization: dealer.area,
  zone: dealer.zone,
  province: dealer.province,
  city: dealer.city,
  code: dealer.dealerCode,
  name: dealer.dealerName,
  dealer,
  employees: dealer.advisors.length,
  badges: dealer.advisors.length,
  boundEmployees: dealer.advisors.length,
  bindings: dealer.advisors.length,
  syncedAt: `2026-08-12 14:${String(59 - (index % 50)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`
}));

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
  brand: '全部',
  organizationDimension: 'region',
  organization: '全部组织',
  organizationDraft: '全部组织',
  organizationSearchQuery: '',
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

const badgeTypes = ['充电坞版本工牌', '4G版本工牌', '明略Wi-Fi工牌', '智能工牌·LIVE'];
const badgePatrolerNames = ['周明远', '沈嘉禾', '林致远', '顾清扬', '唐若川', '许安澜', '程景行', '韩知远', '罗承宇', '谢予安'];
const badgeGovernorNames = ['陈昕', '吴越', '赵宁', '刘畅', '孙悦', '郑凯', '黄静', '何宇', '马嘉宁', '宋亦凡', '梁安然', '徐知夏'];

function getStableBadgeOwnerName(value, names) {
  const seed = Array.from(String(value || '')).reduce((total, character) => total + character.charCodeAt(0), 0);
  return names[seed % names.length];
}

const badgeDetailRecords = (sharedOrganizationDirectory?.badges || []).map((badge, index) => {
  const store = storeOverviewRecords.find((item) => item.code === badge.dealer.dealerCode);
  const connected = index % 31 !== 0;
  const recording = connected && index % 5 === 0;
  const battery = index === 6 ? 100 : index % 25 === 0 && index < 425 ? 7 + (index % 13) : 56 + ((index * 7) % 43);
  const usedMemory = 28 + ((index * 13) % 68);
  const pendingUploads = index % 48 === 0 ? 1 + (index % 6) : 0;
  const dockConnected = index % 4 === 0;
  return {
    brand: store.brand,
    region: store.organization,
    zone: store.zone,
    patroler: getStableBadgeOwnerName(`${store.brand}-${store.zone}`, badgePatrolerNames),
    store: store.name,
    queryDate: store.syncedAt.slice(0, 10),
    province: store.province,
    city: store.city,
    governor: getStableBadgeOwnerName(`${store.brand}-${store.city}`, badgeGovernorNames),
    dealer: store.dealer,
    advisorName: badge.advisorName,
    advisorId: badge.advisorId,
    sn: badge.sn,
    badgeType: badgeTypes[index % badgeTypes.length],
    recordingStatus: recording ? '录音中' : '—',
    connectionStatus: connected ? '已连接' : '未连接',
    dockConnected,
    signal: index % 3 === 0 ? '信号良好' : index % 3 === 1 ? '一般' : '较弱',
    battery,
    remainingMemory: 100 - usedMemory,
    uptime: connected
      ? `${String(4 + (index % 5)).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')}:${String((index * 17) % 60).padStart(2, '0')}`
      : `${String(index % 3).padStart(2, '0')}:${String((index * 11) % 60).padStart(2, '0')}:${String((index * 19) % 60).padStart(2, '0')}`,
    pendingUploads,
    syncedAt: connected ? `2026-08-13 14:${String(59 - (index % 48)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}` : '2026-08-13 11:18:06'
  };
});

function formatGeneratedBadgeEventTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.min((24 * 60 * 60) - 1, totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildGeneratedBadgeEvents(detailRecord) {
  const seed = Number(String(detailRecord.sn).replace(/\D/g, '').slice(-6)) || 0;
  const startAt = (8 * 60 * 60) + ((seed % 43) * 60) + (seed % 47);
  const at = (offsetSeconds) => formatGeneratedBadgeEventTime(startAt + offsetSeconds);
  const events = [
    { type: 'power-on', label: '工牌开机', time: at(0), color: 'green' },
    { type: 'recording-start', label: '开始录音', time: at(18 * 60), icon: '录', color: 'blue' },
    { type: 'recording-end', label: '结束录音', time: at(54 * 60), icon: '停', color: 'red' }
  ];

  if (seed % 3 === 0) {
    events.push(
      { type: 'recording-start', label: '开始录音', time: at(3 * 60 * 60 + 12 * 60), icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: at(4 * 60 * 60 + 6 * 60), icon: '停', color: 'red' },
      { type: 'low-battery', label: '工牌电量预警', time: at(7 * 60 * 60 + 8 * 60), icon: '低', color: 'red', note: `剩余电量 ${14 + (seed % 6)}%` },
      { type: 'power-off', label: '工牌关机', time: at(7 * 60 * 60 + 22 * 60), color: 'neutral' }
    );
  } else if (seed % 3 === 1) {
    events.push(
      { type: 'recording-start', label: '开始录音', time: at(4 * 60 * 60 + 35 * 60), icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: at(5 * 60 * 60 + 28 * 60), icon: '停', color: 'red' },
      { type: 'power-off', label: '工牌关机', time: at(7 * 60 * 60 + 5 * 60), color: 'neutral' },
      { type: 'charging-start', label: '开始充电', time: at(7 * 60 * 60 + 8 * 60), icon: '充', color: 'violet' },
      { type: 'charging-end', label: '结束充电', time: at(8 * 60 * 60 + 2 * 60), icon: '满', color: 'neutral' }
    );
  } else {
    events.push(
      { type: 'recording-start', label: '开始录音', time: at(5 * 60 * 60 + 16 * 60), icon: '录', color: 'blue' },
      { type: 'recording-end', label: '结束录音', time: at(6 * 60 * 60 + 3 * 60), icon: '停', color: 'red' }
    );
  }

  return events;
}

function getBadgeEventRecord(sn, date = '') {
  const normalizedSn = String(sn || '').trim().toLowerCase();
  const fixedRecord = badgeEventRecords.find((item) => item.sn.toLowerCase() === normalizedSn
    && (!date || item.date === date));
  if (fixedRecord) return fixedRecord;

  const detailRecord = badgeDetailRecords.find((item) => item.sn.toLowerCase() === normalizedSn);
  if (!detailRecord || (date && detailRecord.queryDate !== date)) return null;
  return {
    date: detailRecord.queryDate,
    sn: detailRecord.sn,
    employeeName: detailRecord.advisorName,
    storeName: detailRecord.store,
    powerOnDuration: detailRecord.uptime,
    uploadedRecordingDuration: '—',
    events: buildGeneratedBadgeEvents(detailRecord)
  };
}

const dockDetailRecords = [{
  index: 22,
  sn: 'GAC-DCK-DEMO-001',
  brand: '广汽埃安',
  region: '华东大区',
  zone: '上海战区',
  store: '上海浦东体验中心',
  storeCode: 'SH-PD-001',
  status: '离线',
  hasBoundBadges: false
}, ...storeOverviewRecords.flatMap((store, storeIndex) => Array.from({ length: 2 }, (_, dockIndex) => {
  const index = storeIndex * 2 + dockIndex;
  return {
    index,
    sn: `GAC-DCK-${String(21001 + index * 13).padStart(6, '0')}`,
    brand: '广汽埃安',
    region: store.organization,
    zone: store.zone,
    store: store.name,
    storeCode: store.code,
    status: index % 4 === 0 ? '离线' : '在线',
    hasBoundBadges: true
  };
}))];

let activeDockDetailRecord = null;
let dockSubdeviceRecords = [];
let dockLogRecords = [];
const badgeDockEventOptions = [
  '充电坞上线',
  '充电坞下线',
  '工牌上线',
  '工牌下线',
  '录音上传完成',
  '当天录音上传完成',
  '设备日志上传完成',
  '定位日志上传完成'
];

function buildDockDrawerRecords(dockRecord) {
  const storeBadges = badgeDetailRecords.filter((item) => item.store === dockRecord.store);
  const deviceCount = Math.min(storeBadges.length, 2 + (dockRecord.index % 3));
  const startIndex = (dockRecord.index * 3) % Math.max(1, storeBadges.length);
  dockSubdeviceRecords = Array.from({ length: deviceCount }, (_, offset) => storeBadges[(startIndex + offset) % storeBadges.length])
    .filter(Boolean)
    .map((badge, offset) => ({
      port: `端口 ${offset + 1}`,
      sn: badge.sn,
      employee: badge.advisorName,
      availableSpace: `${Math.max(2.4, badge.remainingMemory * 0.32).toFixed(1)} GB`,
      battery: badge.battery,
      capturedAt: `${storeTodayDateValue.replaceAll('-', '/')} ${String(14 - offset).padStart(2, '0')}:${String(11 + dockRecord.index).padStart(2, '0')}:02`
    }));
  const logEvents = badgeDockEventOptions.filter((eventName) => !eventName.startsWith('充电坞'));
  dockLogRecords = [];
  for (let daysAgo = 0; daysAgo < 7; daysAgo += 1) {
    const date = parseStoreDateValue(storeTodayDateValue);
    date.setDate(date.getDate() - daysAgo);
    const dateText = formatStoreDateValue(date).replaceAll('-', '/');
    dockSubdeviceRecords.forEach((device, deviceIndex) => {
      const hour = 9 + ((dockRecord.index + deviceIndex + daysAgo) % 7);
      dockLogRecords.push({
        time: `${dateText} ${String(hour).padStart(2, '0')}:${String(12 + deviceIndex * 9).padStart(2, '0')}:${String(10 + daysAgo).padStart(2, '0')}`,
        event: logEvents[(dockRecord.index + deviceIndex + daysAgo) % logEvents.length],
        sn: device.sn,
        employee: device.employee
      });
    });
    if (daysAgo === 0 || daysAgo === 3) {
      dockLogRecords.push({
        time: `${dateText} 08:${String(20 + dockRecord.index).padStart(2, '0')}:05`,
        event: daysAgo === 0 ? '充电坞上线' : '充电坞下线',
        sn: '-',
        employee: '-'
      });
    }
  }
  dockLogRecords.sort((left, right) => right.time.localeCompare(left.time));
}

const badgeDockDateDefaultFilters = { startDate: getStoreRelativeDateValue(-6), endDate: storeTodayDateValue };
const badgeDockDateFilterState = { ...badgeDockDateDefaultFilters };
const badgeDockEventFilterState = { selectedEvents: new Set(badgeDockEventOptions) };
const badgeDockEventMenuState = { open: false };
const badgeDockDateMenuState = {
  open: false,
  dateDraftStartDate: badgeDockDateDefaultFilters.startDate,
  dateDraftEndDate: badgeDockDateDefaultFilters.endDate,
  activeDateField: 'startDate',
  dateViewYear: storeDefaultQueryDateObject.getFullYear(),
  dateViewMonth: storeDefaultQueryDateObject.getMonth() + 1
};
const badgeFieldDefinitions = Object.freeze([
  { key: 'sn', label: '工牌 SN', filterType: 'text', queryKey: 'snQuery' },
  { key: 'badgeType', label: '工牌类型', filterType: 'select' },
  { key: 'brand', label: '品牌', filterType: 'select' },
  { key: 'region', label: '大区', filterType: 'select', organizationLevel: 0 },
  { key: 'zone', label: '战区', filterType: 'select', organizationLevel: 1 },
  { key: 'patroler', label: '巡回员', filterType: 'select', organizationLevel: 2 },
  { key: 'province', label: '省份', filterType: 'select', organizationLevel: 3 },
  { key: 'city', label: '城市', filterType: 'select', organizationLevel: 4 },
  { key: 'governor', label: '治理员', filterType: 'select', organizationLevel: 5 },
  { key: 'store', label: '门店', filterType: 'select', organizationLevel: 6 },
  { key: 'advisorId', label: '顾问 ID', filterType: 'text', queryKey: 'advisorIdQuery' },
  { key: 'advisorName', label: '顾问姓名', filterType: 'text', queryKey: 'advisorNameQuery' },
  { key: 'recordingStatus', label: '录音状态', filterType: 'select' },
  { key: 'connectionStatus', label: 'WiFi 连接', filterType: 'select' },
  { key: 'dockConnected', label: '是否接入充电坞', filterType: 'select' },
  { key: 'signal', label: '信号', filterType: 'select' },
  { key: 'battery', label: '剩余电量', filterType: 'numberRange', minKey: 'batteryMin', maxKey: 'batteryMax', unit: '%' },
  { key: 'remainingMemory', label: '剩余内存', filterType: 'numberRange', minKey: 'memoryMin', maxKey: 'memoryMax', unit: '%' },
  { key: 'uptime', label: '今日开机时长', filterType: 'numberRange', minKey: 'uptimeMin', maxKey: 'uptimeMax', unit: '小时' },
  { key: 'pendingUploads', label: '待上传录音', filterType: 'numberRange', minKey: 'pendingMin', maxKey: 'pendingMax', unit: '条' },
  { key: 'syncedAt', label: '最新数据同步时间', filterType: 'dateTimeRange', minKey: 'syncStart', maxKey: 'syncEnd' }
]);
const badgeFieldDefinitionMap = Object.freeze(Object.fromEntries(badgeFieldDefinitions.map((field) => [field.key, field])));
const badgeDefaultFieldOrder = Object.freeze(badgeFieldDefinitions.map((field) => field.key));
const badgeFieldSettingsStorageKey = 'aiqc-device-badge-field-settings-v1';

function createDefaultBadgeFieldSettings() {
  return { order: [...badgeDefaultFieldOrder], visible: [...badgeDefaultFieldOrder] };
}

function loadBadgeFieldSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(badgeFieldSettingsStorageKey) || 'null');
    const order = Array.isArray(parsed?.order) ? parsed.order.filter((key) => badgeFieldDefinitionMap[key]) : [];
    badgeDefaultFieldOrder.forEach((key) => { if (!order.includes(key)) order.push(key); });
    const visible = Array.isArray(parsed?.visible)
      ? parsed.visible.filter((key) => badgeFieldDefinitionMap[key] && order.includes(key))
      : [...badgeDefaultFieldOrder];
    if (!visible.length) visible.push(order[0]);
    return { order, visible };
  } catch (error) {
    return createDefaultBadgeFieldSettings();
  }
}

let badgeFieldSettingsState = loadBadgeFieldSettings();
let badgeFieldSettingsDraft = null;
let badgeFieldPointerDrag = null;
let badgeFieldDragAutoScrollFrame = 0;

const badgeDefaultFilters = {
  snQuery: '',
  badgeType: '全部',
  brand: '全部',
  region: '全部',
  zone: '全部',
  patroler: '全部',
  province: '全部',
  city: '全部',
  governor: '全部',
  store: '全部',
  advisorIdQuery: '',
  advisorNameQuery: '',
  recordingStatus: '全部',
  connectionStatus: '全部',
  dockConnected: '全部',
  signal: '全部',
  batteryMin: '',
  batteryMax: '',
  memoryMin: '',
  memoryMax: '',
  uptimeMin: '',
  uptimeMax: '',
  pendingMin: '',
  pendingMax: '',
  syncStart: '',
  syncEnd: '',
  collapsed: true
};

const badgeFilterState = { ...badgeDefaultFilters };
const badgeMenuState = {
  openMenu: '',
  organizationDraft: '全部组织',
  organizationSearchQuery: '',
  dateDraftStartDate: storeDefaultQueryDate,
  dateDraftEndDate: storeDefaultQueryDate,
  dateDraftStartTime: '00:00',
  dateDraftEndTime: '23:59',
  activeDateField: 'startDate',
  dateViewYear: storeDefaultQueryDateObject.getFullYear(),
  dateViewMonth: storeDefaultQueryDateObject.getMonth() + 1
};
const badgePaginationState = { page: 1, pageSize: 10 };
const dockDefaultFilters = {
  store: '全部门店',
  snQuery: '',
  status: '全部'
};
const dockFilterState = { ...dockDefaultFilters };
const dockMenuState = {
  openMenu: '',
  storeQuery: ''
};
const dockPaginationState = { page: 1, pageSize: 10 };
const storeDrilldownState = {
  active: false,
  storeCode: '',
  storeName: '',
  returnScrollY: 0,
  previousBadgeFilters: null,
  previousBadgePage: 1
};

function escapeBadgeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderDockStoreMenu() {
  const query = dockMenuState.storeQuery.trim().toLocaleLowerCase('zh-CN');
  const stores = [...new Set(dockDetailRecords.map((item) => item.store))]
    .filter((store) => !query || store.toLocaleLowerCase('zh-CN').includes(query))
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));
  return `
    <div class="session-menu-panel dock-store-menu" data-dock-menu-panel="store">
      <div class="dock-store-options" id="dockStoreOptions" role="listbox" aria-label="门店选项">
        <button type="button" role="option" aria-selected="${dockFilterState.store === '全部门店'}" class="session-menu-option${dockFilterState.store === '全部门店' ? ' active' : ''}" data-dock-store-option="全部门店"><span>全部门店</span></button>
        ${stores.length ? stores.map((store) => `<button type="button" role="option" aria-selected="${dockFilterState.store === store}" class="session-menu-option${dockFilterState.store === store ? ' active' : ''}" data-dock-store-option="${escapeBadgeHtml(store)}"><span>${escapeBadgeHtml(store)}</span></button>`).join('') : '<div class="dock-store-empty">未找到匹配门店</div>'}
      </div>
    </div>`;
}

function renderDockStatusMenu() {
  return `
    <div class="session-menu-panel dock-status-menu" data-dock-menu-panel="status">
      <div class="session-menu-option-list" role="listbox" aria-label="状态选项">
        ${['全部', '在线', '离线'].map((option) => `<button type="button" role="option" aria-selected="${dockFilterState.status === option}" class="session-menu-option${dockFilterState.status === option ? ' active' : ''}" data-dock-status="${option}"><span>${option}</span></button>`).join('')}
      </div>
    </div>`;
}

function renderDockSearchControl(key, label, value) {
  return `
    <label class="session-toolbar-control session-toolbar-control-search-field">
      <span>${label}</span>
      <input type="search" class="session-search-input badge-search-input" value="${escapeBadgeHtml(value)}" placeholder="请输入${label}" data-dock-search="${key}" />
    </label>`;
}

function renderDockFilters() {
  const container = document.getElementById('dockDetailFilterControls');
  if (!container) return;
  const storeOpen = dockMenuState.openMenu === 'store';
  const statusOpen = dockMenuState.openMenu === 'status';
  const storeSearchActive = storeOpen || Boolean(dockMenuState.storeQuery.trim());
  container.innerHTML = `
    <div class="session-filter-row session-filter-row-main dock-filter-row-main">
      <div class="session-toolbar-control session-toolbar-control-org session-toolbar-menu${storeOpen ? ' is-open' : ''}" data-dock-menu-root="store">
        <span>门店</span>
        <div class="session-select-trigger session-select-trigger-search${storeOpen ? ' active' : ''}">
          <div class="session-select-trigger-search-main">
            <input type="search" class="session-select-trigger-search-input${storeSearchActive ? '' : ' is-display-mode'}" value="${escapeBadgeHtml(storeSearchActive ? dockMenuState.storeQuery : '')}" placeholder="${escapeBadgeHtml(storeSearchActive ? '搜索门店名称' : dockFilterState.store)}" data-dock-store-search role="combobox" aria-label="搜索并筛选门店" aria-autocomplete="list" aria-expanded="${storeOpen}" aria-controls="dockStoreOptions" />
          </div>
          <button type="button" class="session-select-trigger-search-toggle" data-dock-store-trigger aria-label="${storeOpen ? '收起' : '展开'}门店选项" aria-expanded="${storeOpen}" aria-haspopup="listbox"><span class="session-select-caret" aria-hidden="true"></span></button>
        </div>
        ${storeOpen ? renderDockStoreMenu() : ''}
      </div>
      ${renderDockSearchControl('snQuery', '充电坞SN', dockFilterState.snQuery)}
      <div class="session-toolbar-control session-toolbar-menu dock-status-control${statusOpen ? ' is-open' : ''}" data-dock-menu-root="status">
        <span>状态</span>
        <button type="button" class="session-select-trigger${statusOpen ? ' active' : ''}" data-dock-status-trigger aria-label="筛选充电坞状态" aria-expanded="${statusOpen}" aria-haspopup="listbox"><strong>${dockFilterState.status}</strong><span class="session-select-caret" aria-hidden="true"></span></button>
        ${statusOpen ? renderDockStatusMenu() : ''}
      </div>
      <button type="button" class="btn session-reset-btn dock-filter-reset" data-dock-reset>重置筛选</button>
    </div>`;
}

function getFilteredDockRecords() {
  const snQuery = dockFilterState.snQuery.trim().toLowerCase();
  return dockDetailRecords.filter((item) => {
    const storeMatch = dockFilterState.store === '全部门店' || item.store === dockFilterState.store;
    const statusMatch = dockFilterState.status === '全部' || item.status === dockFilterState.status;
    return storeMatch && statusMatch && (!snQuery || item.sn.toLowerCase().includes(snQuery));
  });
}

function getDockPaginationItems(totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  if (dockPaginationState.page > 3) items.push('left');
  for (let page = Math.max(2, dockPaginationState.page - 1); page <= Math.min(totalPages - 1, dockPaginationState.page + 1); page += 1) items.push(page);
  if (dockPaginationState.page < totalPages - 2) items.push('right');
  items.push(totalPages);
  return items;
}

function renderDockPagination(totalItems) {
  const container = document.getElementById('dockDetailPagination');
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / dockPaginationState.pageSize));
  dockPaginationState.page = Math.min(dockPaginationState.page, totalPages);
  container.innerHTML = `
    <div class="dashboard-pagination">
      <span class="session-pagination-total">共 ${totalItems} 条</span>
      <div class="dashboard-pagination-controls">
        <div class="custom-select-container page-select page-size-select">
          <button type="button" class="custom-select-trigger page-size-trigger" data-dock-page-size-trigger><span>${dockPaginationState.pageSize} 条/页</span></button>
          <div class="custom-select-options page-size-options">${[10, 20, 50].map((size) => `<button type="button" class="custom-option page-size-option${size === dockPaginationState.pageSize ? ' active' : ''}" data-dock-page-size="${size}"><span>${size} 条/页</span></button>`).join('')}</div>
        </div>
        <div class="page-group">
          <button type="button" class="page-arrow" data-dock-page-action="prev" ${dockPaginationState.page === 1 ? 'disabled' : ''}>‹</button>
          ${getDockPaginationItems(totalPages).map((item) => typeof item === 'number' ? `<button type="button" class="page-num${item === dockPaginationState.page ? ' active' : ''}" data-dock-page="${item}">${item}</button>` : '<span class="page-ellipsis">…</span>').join('')}
          <button type="button" class="page-arrow" data-dock-page-action="next" ${dockPaginationState.page === totalPages ? 'disabled' : ''}>›</button>
        </div>
        <div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="${totalPages}" value="${dockPaginationState.page}" data-dock-page-jump /></label><span class="session-page-jump-suffix">页</span></div>
      </div>
    </div>`;
}

function renderDockDetail() {
  const tbody = document.getElementById('dockDetailTableBody');
  if (!tbody) return;
  const records = getFilteredDockRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / dockPaginationState.pageSize));
  dockPaginationState.page = Math.min(dockPaginationState.page, totalPages);
  const start = (dockPaginationState.page - 1) * dockPaginationState.pageSize;
  const visibleRecords = records.slice(start, start + dockPaginationState.pageSize);
  const count = document.getElementById('dockFilterCount');
  if (count) count.textContent = records.length.toLocaleString('zh-CN');
  tbody.innerHTML = visibleRecords.length ? visibleRecords.map((item) => `<tr>
    <td><span class="cell-main">${escapeBadgeHtml(item.sn)}</span></td>
    <td><span class="status-inline ${item.status === '在线' ? 'green' : 'gray'}"><span class="status-inline-dot" aria-hidden="true"></span><span>${escapeBadgeHtml(item.status)}</span></span></td>
    <td>${escapeBadgeHtml(item.brand)}</td>
    <td>${escapeBadgeHtml(item.region)}</td>
    <td>${escapeBadgeHtml(item.zone)}</td>
    <td>${escapeBadgeHtml(item.store)}</td>
    <td><button class="table-link${item.hasBoundBadges ? '' : ' table-link-disabled'}" type="button" data-dock-detail-open data-dock-sn="${escapeBadgeHtml(item.sn)}"${item.hasBoundBadges ? '' : ' disabled aria-disabled="true" title="暂无绑定工牌"'}>查看</button></td>
  </tr>`).join('') : '<tr class="session-empty-row"><td colspan="7">当前筛选条件下暂无充电坞，请调整门店、状态或充电坞 SN 后重试。</td></tr>';
  renderDockPagination(records.length);
}

function renderDockPage() {
  renderDockFilters();
  renderDockDetail();
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
  const query = badgeMenuState.organizationSearchQuery || '';
  const isSearching = Boolean(query.trim());
  const columns = sharedOrganizationDirectory.getColumns(draft, badgeFilterState.organizationDimension, badgeFilterState.brand);
  const searchResults = isSearching
    ? sharedOrganizationDirectory.search(query, badgeFilterState.organizationDimension, badgeFilterState.brand)
    : [];
  const renderNode = (node, fromSearch = false) => `<button type="button" class="session-cascader-option${fromSearch ? ' organization-search-result' : ''}${draft === node.path || draft.startsWith(`${node.path} > `) ? ' active' : ''}" data-badge-org-path="${escapeBadgeHtml(node.path)}" data-badge-org-level="${escapeBadgeHtml(node.type)}"${fromSearch ? ' data-badge-org-from-search="true"' : ''}><span>${fromSearch ? `<strong>${escapeBadgeHtml(node.label)}</strong><small>${escapeBadgeHtml(sharedOrganizationDirectory.formatPath(node.path, badgeFilterState.brand))}</small>` : escapeBadgeHtml(node.label)}</span>${node.children?.length ? '<i class="session-cascader-arrow"></i>' : ''}</button>`;
  return `
    <div class="session-menu-panel session-menu-panel-cascader badge-organization-menu" data-badge-menu-panel="organization">
      <div class="session-cascader-top">
        <button type="button" class="session-menu-option session-menu-option-clear${draft === '全部组织' ? ' active' : ''}" data-badge-org-clear><span>全部组织</span></button>
        <div class="session-cascader-current"><span>${badgeFilterState.organizationDimension === 'province' ? '省份维度' : '大区维度'}·当前层级</span><strong>${escapeBadgeHtml(sharedOrganizationDirectory.formatPath(draft, badgeFilterState.brand))}</strong></div>
      </div>
      <label class="organization-cascader-search"><span aria-hidden="true">⌕</span><input type="search" value="${escapeBadgeHtml(query)}" data-badge-org-search placeholder="搜索组织、门店编码或顾问"></label>
      ${isSearching
        ? `<div class="organization-cascader-search-results">${searchResults.length ? searchResults.map((node) => renderNode(node, true)).join('') : '<div class="badge-org-empty">未找到匹配结果</div>'}</div>`
        : `<div class="session-cascader-columns badge-cascader-columns">${columns.map((nodes) => `<div class="session-cascader-column">${nodes.map((node) => renderNode(node)).join('')}</div>`).join('')}</div>`}
      <div class="session-cascader-footer"><span>筛选将覆盖当前层级及其下属门店与销售顾问</span><button type="button" class="btn primary" data-badge-org-apply>应用组织</button></div>
    </div>`;
}

function renderBadgeSegmentControl() {
  return `
    <div class="session-toolbar-control session-toolbar-segment-control badge-brand-control">
      <span>品牌</span>
      <div class="todo-filter-tabs">
        ${['全部', '传祺', '埃安'].map((option) => `<button type="button" class="todo-filter-tab${badgeFilterState.brand === option ? ' active' : ''}" data-badge-brand="${option}">${option}</button>`).join('')}
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

function getBadgeSyncDateTimeBounds() {
  const values = badgeDetailRecords.map((item) => item.syncedAt.replace(' ', 'T').slice(0, 16)).sort();
  return { start: values[0] || `${storeDefaultQueryDate}T00:00`, end: values.at(-1) || `${storeDefaultQueryDate}T23:59` };
}

function syncBadgeSyncDateTimeDraft() {
  const bounds = getBadgeSyncDateTimeBounds();
  const startValue = badgeFilterState.syncStart || bounds.start;
  const endValue = badgeFilterState.syncEnd || bounds.end;
  badgeMenuState.dateDraftStartDate = startValue.slice(0, 10);
  badgeMenuState.dateDraftEndDate = endValue.slice(0, 10);
  badgeMenuState.dateDraftStartTime = startValue.slice(11, 16) || '00:00';
  badgeMenuState.dateDraftEndTime = endValue.slice(11, 16) || '23:59';
  badgeMenuState.activeDateField = 'startDate';
  syncBadgeDateView(badgeMenuState.dateDraftStartDate);
}

function normalizeBadgeTime(value, fallback) {
  const matched = String(value || '').trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!matched) return fallback;
  const hours = Math.min(23, Math.max(0, Number(matched[1])));
  const minutes = Math.min(59, Math.max(0, Number(matched[2])));
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatBadgeSyncDateTimeLabel(value) {
  if (!value) return '未选择';
  const [date = '', time = ''] = value.split('T');
  return `${formatStoreDateDisplay(date)} ${time.slice(0, 5)}`.trim();
}

function renderBadgeSyncDateTimeFilter(field) {
  const open = badgeMenuState.openMenu === 'syncDateTime';
  const panelRenderer = globalThis.__dateFilterComponentUtils?.renderDateRangePanelMarkup;
  const hasRange = Boolean(badgeFilterState.syncStart || badgeFilterState.syncEnd);
  const startLabel = formatBadgeSyncDateTimeLabel(badgeFilterState.syncStart);
  const endLabel = formatBadgeSyncDateTimeLabel(badgeFilterState.syncEnd);
  const draftStartLabel = `${formatStoreDateDisplay(badgeMenuState.dateDraftStartDate)} ${badgeMenuState.dateDraftStartTime}`;
  const draftEndLabel = `${formatStoreDateDisplay(badgeMenuState.dateDraftEndDate)} ${badgeMenuState.dateDraftEndTime}`;
  const draftRangeText = `${draftStartLabel} 至 ${draftEndLabel}`;
  let menuHtml = open && panelRenderer ? panelRenderer({
    dataNamespace: 'badge-sync-date',
    rangeText: draftRangeText,
    monthLabel: `${badgeMenuState.dateViewYear}年${badgeMenuState.dateViewMonth}月`,
    activeField: badgeMenuState.activeDateField,
    startLabel: draftStartLabel,
    endLabel: draftEndLabel,
    cells: getBadgeDateCells(badgeMenuState.dateViewYear, badgeMenuState.dateViewMonth),
    shortcuts: [
      { key: 'today', label: '今天' },
      { key: 'last3', label: '近3天' },
      { key: 'last7', label: '近7天' }
    ],
    summaryText: `已选择 ${draftRangeText}`,
    panelClassName: 'session-menu-panel session-menu-panel-date badge-sync-date-time-panel',
    title: '最新数据同步时间',
    startFieldLabel: '开始时间',
    endFieldLabel: '结束时间',
    showCancel: false,
    applyLabel: '应用时间'
  }) : '';
  if (menuHtml) {
    const timeFields = `<div class="badge-sync-time-fields">
      <label><span>开始时分</span><input type="text" inputmode="numeric" maxlength="5" value="${escapeBadgeHtml(badgeMenuState.dateDraftStartTime)}" placeholder="00:00" data-badge-sync-time-input="start" aria-label="开始时分" /></label>
      <label><span>结束时分</span><input type="text" inputmode="numeric" maxlength="5" value="${escapeBadgeHtml(badgeMenuState.dateDraftEndTime)}" placeholder="23:59" data-badge-sync-time-input="end" aria-label="结束时分" /></label>
    </div>`;
    menuHtml = menuHtml.replace('<div class="session-cascader-footer session-date-footer">', `${timeFields}<div class="session-cascader-footer session-date-footer">`);
  }
  return `
    <div class="badge-field-filter badge-field-filter-date-time session-toolbar-menu${open ? ' is-open' : ''}" data-badge-menu-root="syncDateTime">
      <span>${field.label}</span>
      <button type="button" class="session-date-trigger${open ? ' active' : ''}" data-badge-sync-date-trigger aria-label="${field.label}筛选" aria-haspopup="dialog" aria-expanded="${open ? 'true' : 'false'}">
        ${hasRange ? `<strong>${escapeBadgeHtml(startLabel)}</strong><em>至</em><strong>${escapeBadgeHtml(endLabel)}</strong>` : '<strong>全部时间</strong>'}<span class="session-date-icon" aria-hidden="true"></span>
      </button>
      ${menuHtml}
    </div>`;
}

function renderBadgeFilterActions() {
  return `
    <div class="session-filter-inline-actions session-filter-inline-actions-search">
      <button type="button" class="btn session-reset-btn" data-badge-reset>重置</button>
      <button type="button" class="session-toggle-text-btn" data-badge-toggle aria-expanded="${badgeFilterState.collapsed ? 'false' : 'true'}">
        <span>${badgeFilterState.collapsed ? '展开' : '收起'}</span>
        <svg class="session-toggle-text-btn-icon${badgeFilterState.collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </button>
    </div>`;
}

function renderBadgeFilters() {
  const container = document.getElementById('sessionFilterControls');
  if (!container) return;
  const visibleFields = getVisibleBadgeFields();
  const renderedFields = badgeFilterState.collapsed ? visibleFields.slice(0, 4) : visibleFields;
  container.classList.toggle('is-store-drilldown', storeDrilldownState.active);
  container.classList.toggle('is-collapsed', badgeFilterState.collapsed);
  container.innerHTML = `
    <div class="badge-dynamic-filter-grid">
      ${renderedFields.map((field) => renderBadgeFieldFilter(field)).join('')}
    </div>
    <div class="badge-dynamic-filter-actions">
      ${storeDrilldownState.active ? `<span class="badge-drilldown-context">当前门店：<strong>${escapeBadgeHtml(storeDrilldownState.storeName)}</strong></span>` : '<span></span>'}
      <div>
        <button type="button" class="btn session-reset-btn" data-badge-reset>重置</button>
        ${visibleFields.length > 4 ? `<button type="button" class="session-toggle-text-btn" data-badge-toggle aria-expanded="${badgeFilterState.collapsed ? 'false' : 'true'}"><span>${badgeFilterState.collapsed ? '展开' : '收起'}</span><svg class="session-toggle-text-btn-icon${badgeFilterState.collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>` : ''}
      </div>
    </div>`;
}

function getVisibleBadgeFields(settings = badgeFieldSettingsState) {
  const visibleSet = new Set(settings.visible);
  return settings.order.filter((key) => visibleSet.has(key)).map((key) => badgeFieldDefinitionMap[key]);
}

function getBadgeOrganizationSource(field) {
  const organizationKeys = ['region', 'zone', 'patroler', 'province', 'city', 'governor', 'store'];
  const fieldIndex = organizationKeys.indexOf(field.key);
  return badgeDetailRecords.filter((item) => {
    if (storeDrilldownState.active && item.dealer?.dealerCode !== storeDrilldownState.storeCode) return false;
    if (badgeFilterState.brand !== '全部' && item.brand !== badgeFilterState.brand) return false;
    return organizationKeys.slice(0, fieldIndex).every((key) => badgeFilterState[key] === '全部' || item[key] === badgeFilterState[key]);
  });
}

function getBadgeFieldSelectOptions(field) {
  if (field.key === 'dockConnected') return [{ value: '已接入', label: '已接入' }, { value: '未接入', label: '未接入' }];
  const drilldownRecords = storeDrilldownState.active
    ? badgeDetailRecords.filter((item) => item.dealer?.dealerCode === storeDrilldownState.storeCode)
    : badgeDetailRecords;
  const source = Number.isInteger(field.organizationLevel) ? getBadgeOrganizationSource(field) : drilldownRecords;
  return [...new Set(source.map((item) => item[field.key]))]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => ({ value: String(value), label: String(value) }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'));
}

function renderBadgeFieldFilter(field) {
  if (field.filterType === 'text') {
    return `<label class="badge-field-filter"><span>${field.label}</span><input type="search" value="${escapeBadgeHtml(badgeFilterState[field.queryKey])}" placeholder="请输入${field.label}" data-badge-search="${field.queryKey}" /></label>`;
  }
  if (field.filterType === 'select') {
    const value = badgeFilterState[field.key];
    const menuKey = `field:${field.key}`;
    const open = badgeMenuState.openMenu === menuKey;
    const options = [{ value: '全部', label: `全部${field.label}` }, ...getBadgeFieldSelectOptions(field)];
    const selectedLabel = options.find((option) => option.value === value)?.label || `全部${field.label}`;
    return `<div class="badge-field-filter badge-field-filter-select session-toolbar-menu${open ? ' is-open' : ''}" data-badge-menu-root="${field.key}">
      <span>${field.label}</span>
      <button type="button" class="session-select-trigger${open ? ' active' : ''}" data-badge-field-select-trigger="${field.key}" aria-label="${field.label}筛选" aria-haspopup="listbox" aria-expanded="${open ? 'true' : 'false'}">
        <strong>${escapeBadgeHtml(selectedLabel)}</strong><i class="session-select-caret" aria-hidden="true"></i>
      </button>
      ${open ? `<div class="session-menu-panel badge-field-select-menu" role="listbox" aria-label="${field.label}筛选选项"><div class="session-menu-option-list">${options.map((option) => `<button type="button" class="session-menu-option${value === option.value ? ' active' : ''}" data-badge-field-select-value="${escapeBadgeHtml(option.value)}" data-badge-field-select-key="${field.key}" role="option" aria-selected="${value === option.value ? 'true' : 'false'}"><span>${escapeBadgeHtml(option.label)}</span></button>`).join('')}</div></div>` : ''}
    </div>`;
  }
  if (field.filterType === 'numberRange') {
    return `<label class="badge-field-filter"><span>${field.label}</span><span class="badge-range-filter"><input type="number" min="0" value="${escapeBadgeHtml(badgeFilterState[field.minKey])}" placeholder="最小" data-badge-range-key="${field.minKey}" /><i>至</i><input type="number" min="0" value="${escapeBadgeHtml(badgeFilterState[field.maxKey])}" placeholder="最大" data-badge-range-key="${field.maxKey}" /><em>${field.unit}</em></span></label>`;
  }
  return renderBadgeSyncDateTimeFilter(field);
}

function applyBadgeFieldSelectValue(key, value) {
  badgeFilterState[key] = value;
  const organizationKeys = ['region', 'zone', 'patroler', 'province', 'city', 'governor', 'store'];
  if (key === 'brand') organizationKeys.forEach((organizationKey) => { badgeFilterState[organizationKey] = '全部'; });
  const levelIndex = organizationKeys.indexOf(key);
  if (levelIndex >= 0) organizationKeys.slice(levelIndex + 1).forEach((organizationKey) => { badgeFilterState[organizationKey] = '全部'; });
  badgeMenuState.openMenu = '';
  badgePaginationState.page = 1;
  renderBadgePage();
}

function getBadgeUptimeHours(value) {
  const [hours = 0, minutes = 0, seconds = 0] = String(value || '').split(':').map(Number);
  return hours + (minutes / 60) + (seconds / 3600);
}

function isBadgeNumberInRange(value, minValue, maxValue) {
  const min = minValue === '' ? null : Number(minValue);
  const max = maxValue === '' ? null : Number(maxValue);
  return (min === null || value >= min) && (max === null || value <= max);
}

function getFilteredBadgeRecords() {
  const visibleKeys = new Set(badgeFieldSettingsState.visible);
  const textMatches = (item, fieldKey, queryKey) => !visibleKeys.has(fieldKey)
    || !badgeFilterState[queryKey].trim()
    || String(item[fieldKey]).toLocaleLowerCase('zh-CN').includes(badgeFilterState[queryKey].trim().toLocaleLowerCase('zh-CN'));
  const selectMatches = (item, key) => !visibleKeys.has(key) || badgeFilterState[key] === '全部' || String(item[key]) === badgeFilterState[key];
  return badgeDetailRecords.filter((item) => {
    if (storeDrilldownState.active && item.dealer?.dealerCode !== storeDrilldownState.storeCode) return false;
    if (!textMatches(item, 'sn', 'snQuery') || !textMatches(item, 'advisorId', 'advisorIdQuery') || !textMatches(item, 'advisorName', 'advisorNameQuery')) return false;
    if (!['badgeType', 'brand', 'region', 'zone', 'patroler', 'province', 'city', 'governor', 'store', 'recordingStatus', 'connectionStatus', 'signal'].every((key) => selectMatches(item, key))) return false;
    if (visibleKeys.has('dockConnected') && badgeFilterState.dockConnected !== '全部' && (item.dockConnected ? '已接入' : '未接入') !== badgeFilterState.dockConnected) return false;
    if (visibleKeys.has('battery') && !isBadgeNumberInRange(item.battery, badgeFilterState.batteryMin, badgeFilterState.batteryMax)) return false;
    if (visibleKeys.has('remainingMemory') && !isBadgeNumberInRange(item.remainingMemory, badgeFilterState.memoryMin, badgeFilterState.memoryMax)) return false;
    if (visibleKeys.has('uptime') && !isBadgeNumberInRange(getBadgeUptimeHours(item.uptime), badgeFilterState.uptimeMin, badgeFilterState.uptimeMax)) return false;
    if (visibleKeys.has('pendingUploads') && !isBadgeNumberInRange(item.pendingUploads, badgeFilterState.pendingMin, badgeFilterState.pendingMax)) return false;
    if (visibleKeys.has('syncedAt')) {
      const timestamp = new Date(item.syncedAt.replace(' ', 'T')).getTime();
      const start = badgeFilterState.syncStart ? new Date(badgeFilterState.syncStart).getTime() : null;
      const end = badgeFilterState.syncEnd ? new Date(badgeFilterState.syncEnd).getTime() : null;
      if ((start !== null && timestamp < start) || (end !== null && timestamp > end)) return false;
    }
    return true;
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

function renderBatteryIndicator(value, ariaLabel = '剩余电量') {
  const battery = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `<span class="battery battery-with-value" style="--battery-level:${battery}%" role="progressbar" aria-label="${escapeBadgeHtml(ariaLabel)} ${battery}%" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${battery}"><i style="width:${battery}%"></i><strong aria-hidden="true">${battery}%</strong></span>`;
}

function renderBadgeFieldCell(item, field) {
  if (field.key === 'sn') return `<span class="cell-main">${escapeBadgeHtml(item.sn)}</span>`;
  if (field.key === 'recordingStatus') return item.recordingStatus === '录音中'
    ? '<span class="status-inline green"><span class="status-inline-dot"></span><span>录音中</span></span>'
    : '<span class="status-inline gray"><span>—</span></span>';
  if (field.key === 'connectionStatus') return `<span class="status-inline ${item.connectionStatus === '已连接' ? 'green' : 'red'}"><span class="status-inline-dot"></span><span>${escapeBadgeHtml(item.connectionStatus)}</span></span>`;
  if (field.key === 'dockConnected') return `<span class="status-inline ${item.dockConnected ? 'green' : 'gray'}"><span class="status-inline-dot"></span><span>${item.dockConnected ? '已接入' : '未接入'}</span></span>`;
  if (field.key === 'battery') return renderBatteryIndicator(item.battery);
  if (field.key === 'remainingMemory') return `<strong class="${item.remainingMemory < 20 ? 'danger-text' : ''}">${item.remainingMemory}%</strong>`;
  if (field.key === 'pendingUploads') return `<strong class="${item.pendingUploads >= 5 ? 'danger-text' : item.pendingUploads > 0 ? 'amber-text' : ''}">${item.pendingUploads}</strong>`;
  return escapeBadgeHtml(item[field.key]);
}

function renderBadgeTableHead(visibleFields) {
  const headRow = document.getElementById('badgeDetailTableHeadRow');
  const table = headRow?.closest('table');
  if (!headRow || !table) return;
  headRow.innerHTML = `${visibleFields.map((field) => `<th data-badge-column="${field.key}">${field.label}</th>`).join('')}<th>操作</th>`;
  table.style.minWidth = `${Math.max(760, (visibleFields.length * 136) + 116)}px`;
}

function renderBadgeDetail() {
  const tbody = document.getElementById('badgeDetailTableBody');
  if (!tbody) return;
  const visibleFields = getVisibleBadgeFields();
  renderBadgeTableHead(visibleFields);
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
  tbody.innerHTML = visibleRecords.length ? visibleRecords.map((item) => `<tr>
    ${visibleFields.map((field) => `<td data-badge-column="${field.key}">${renderBadgeFieldCell(item, field)}</td>`).join('')}
    <td><button class="table-link" type="button" data-badge-record-drawer-open="events" data-badge-sn="${escapeBadgeHtml(item.sn)}" data-advisor-name="${escapeBadgeHtml(item.advisorName)}">事件</button><button class="table-link badge-inline-action" type="button" data-badge-record-drawer-open="uploads" data-badge-sn="${escapeBadgeHtml(item.sn)}" data-advisor-name="${escapeBadgeHtml(item.advisorName)}">日志</button></td>
  </tr>`).join('') : `<tr class="session-empty-row"><td colspan="${visibleFields.length + 1}">当前筛选条件下暂无工牌，请调整筛选条件后重试。</td></tr>`;
  renderBadgePagination(records.length);
}

function renderBadgePage() {
  renderBadgeFilters();
  renderBadgeDetail();
}

function renderBadgeFieldSettings() {
  if (!badgeFieldSettingsList || !badgeFieldSettingsDraft) return;
  const visibleSet = new Set(badgeFieldSettingsDraft.visible);
  badgeFieldSettingsSelectedCount.textContent = visibleSet.size;
  badgeFieldSettingsList.innerHTML = badgeFieldSettingsDraft.order.map((key) => {
    const field = badgeFieldDefinitionMap[key];
    const checked = visibleSet.has(key);
    return `<div class="badge-field-settings-item${checked ? ' is-visible' : ''}" draggable="false" data-badge-field-settings-item="${key}">
      <span class="badge-field-drag-handle" aria-hidden="true"><i></i><i></i><i></i></span>
      <label><input type="checkbox" data-badge-field-settings-check="${key}"${checked ? ' checked' : ''} /><span>${field.label}</span></label>
      <small>${checked ? '已显示' : '已隐藏'}</small>
    </div>`;
  }).join('');
}

function openBadgeFieldSettings() {
  if (!badgeFieldSettingsDrawer || !badgeFieldSettingsBackdrop) return;
  badgeFieldSettingsDraft = { order: [...badgeFieldSettingsState.order], visible: [...badgeFieldSettingsState.visible] };
  renderBadgeFieldSettings();
  badgeFieldSettingsBackdrop.hidden = false;
  badgeFieldSettingsDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => {
    badgeFieldSettingsDrawer.classList.add('open');
    badgeFieldSettingsDrawer.querySelector('[data-badge-field-settings-close]')?.focus();
    syncBodyScrollLock();
  });
}

function closeBadgeFieldSettings() {
  if (!badgeFieldSettingsDrawer || !badgeFieldSettingsBackdrop) return;
  cancelBadgeFieldPointerDrag();
  badgeFieldSettingsDrawer.classList.remove('open');
  badgeFieldSettingsDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { badgeFieldSettingsBackdrop.hidden = true; }, 220);
  badgeFieldSettingsDraft = null;
  syncBodyScrollLock();
}

function clearBadgeFilterForField(field) {
  if (field.filterType === 'text') badgeFilterState[field.queryKey] = '';
  else if (field.filterType === 'select') badgeFilterState[field.key] = '全部';
  else {
    badgeFilterState[field.minKey] = '';
    badgeFilterState[field.maxKey] = '';
  }
}

function saveBadgeFieldSettings() {
  if (!badgeFieldSettingsDraft?.visible.length) {
    showToast('至少保留一个字段');
    return;
  }
  const nextVisible = new Set(badgeFieldSettingsDraft.visible);
  badgeFieldSettingsState.visible.filter((key) => !nextVisible.has(key)).forEach((key) => clearBadgeFilterForField(badgeFieldDefinitionMap[key]));
  badgeFieldSettingsState = { order: [...badgeFieldSettingsDraft.order], visible: [...badgeFieldSettingsDraft.visible] };
  try { localStorage.setItem(badgeFieldSettingsStorageKey, JSON.stringify(badgeFieldSettingsState)); } catch (error) { /* 本地存储不可用时仍保留当前会话配置。 */ }
  badgePaginationState.page = 1;
  closeBadgeFieldSettings();
  renderBadgePage();
  showToast('字段设置已保存');
}

function getBadgeFieldSettingsDomOrder() {
  return [...badgeFieldSettingsList?.querySelectorAll('[data-badge-field-settings-item]') || []]
    .map((item) => item.dataset.badgeFieldSettingsItem);
}

function animateBadgeFieldSettingsReflow(mutate) {
  const items = [...badgeFieldSettingsList.querySelectorAll('[data-badge-field-settings-item]')];
  const firstTops = new Map(items.map((item) => [item, item.getBoundingClientRect().top]));
  mutate();
  items.forEach((item) => {
    const deltaY = firstTops.get(item) - item.getBoundingClientRect().top;
    if (Math.abs(deltaY) < 1) return;
    item.style.transform = `translateY(${deltaY}px)`;
    window.requestAnimationFrame(() => {
      if (item.isConnected) item.style.transform = '';
    });
  });
}

function updateBadgeFieldDragGhostPosition(drag, clientX, clientY) {
  if (!drag?.ghost) return;
  const maxLeft = Math.max(8, window.innerWidth - drag.rect.width - 8);
  const maxTop = Math.max(8, window.innerHeight - drag.rect.height - 8);
  const left = Math.min(maxLeft, Math.max(8, clientX - drag.grabOffsetX));
  const top = Math.min(maxTop, Math.max(8, clientY - drag.grabOffsetY));
  drag.ghost.style.left = `${left}px`;
  drag.ghost.style.top = `${top}px`;
}

function updateBadgeFieldDragTarget(drag, clientX, clientY) {
  if (!drag?.active || !drag.placeholder) return;
  const target = document.elementFromPoint(clientX, clientY)?.closest('[data-badge-field-settings-item]');
  if (!target || !badgeFieldSettingsList.contains(target)) return;
  const targetRect = target.getBoundingClientRect();
  const insertBefore = clientY < targetRect.top + (targetRect.height / 2);
  const placeholderBeforeTarget = drag.placeholder.previousElementSibling === target;
  const placeholderAfterTarget = drag.placeholder.nextElementSibling === target;
  if ((insertBefore && placeholderBeforeTarget) || (!insertBefore && placeholderAfterTarget)) return;
  animateBadgeFieldSettingsReflow(() => {
    if (insertBefore) target.before(drag.placeholder);
    else target.after(drag.placeholder);
  });
}

function stopBadgeFieldDragAutoScroll() {
  if (!badgeFieldDragAutoScrollFrame) return;
  window.cancelAnimationFrame(badgeFieldDragAutoScrollFrame);
  badgeFieldDragAutoScrollFrame = 0;
}

function runBadgeFieldDragAutoScroll() {
  const drag = badgeFieldPointerDrag;
  if (!drag?.active) {
    badgeFieldDragAutoScrollFrame = 0;
    return;
  }
  const scroller = badgeFieldSettingsDrawer?.querySelector('.badge-field-settings-body');
  const scrollerRect = scroller?.getBoundingClientRect();
  if (scroller && scrollerRect && scroller.scrollHeight > scroller.clientHeight) {
    const edge = 64;
    const topDistance = scrollerRect.top + edge - drag.lastClientY;
    const bottomDistance = drag.lastClientY - (scrollerRect.bottom - edge);
    let delta = 0;
    if (topDistance > 0) delta = -Math.ceil(Math.min(1, topDistance / edge) ** 2 * 14);
    else if (bottomDistance > 0) delta = Math.ceil(Math.min(1, bottomDistance / edge) ** 2 * 14);
    if (delta) {
      scroller.scrollTop += delta;
      updateBadgeFieldDragGhostPosition(drag, drag.lastClientX, drag.lastClientY);
      updateBadgeFieldDragTarget(drag, drag.lastClientX, drag.lastClientY);
    }
  }
  badgeFieldDragAutoScrollFrame = window.requestAnimationFrame(runBadgeFieldDragAutoScroll);
}

function startBadgeFieldPointerDrag(event) {
  const drag = badgeFieldPointerDrag;
  if (!drag || drag.active || !badgeFieldSettingsDraft) return;
  drag.active = true;
  drag.rect = drag.item.getBoundingClientRect();
  drag.grabOffsetX = event.clientX - drag.rect.left;
  drag.grabOffsetY = event.clientY - drag.rect.top;
  drag.placeholder = document.createElement('div');
  drag.placeholder.className = 'badge-field-settings-placeholder';
  drag.placeholder.setAttribute('aria-hidden', 'true');
  drag.placeholder.style.height = `${drag.rect.height}px`;
  drag.placeholder.style.width = `${drag.rect.width}px`;
  drag.item.parentElement.insertBefore(drag.placeholder, drag.item);
  drag.item.classList.add('is-drag-source');
  drag.item.remove();
  drag.ghost = drag.item.cloneNode(true);
  drag.ghost.classList.add('badge-field-settings-drag-ghost');
  drag.ghost.classList.remove('is-drag-source', 'is-drop-hidden');
  drag.ghost.style.width = `${drag.rect.width}px`;
  drag.ghost.style.height = `${drag.rect.height}px`;
  drag.ghost.setAttribute('aria-hidden', 'true');
  drag.ghost.removeAttribute('draggable');
  document.body.appendChild(drag.ghost);
  badgeFieldSettingsList.classList.add('is-dragging');
  document.body.classList.add('badge-field-settings-dragging');
  updateBadgeFieldDragGhostPosition(drag, event.clientX, event.clientY);
  badgeFieldDragAutoScrollFrame = window.requestAnimationFrame(runBadgeFieldDragAutoScroll);
}

function finishBadgeFieldPointerDrag() {
  const drag = badgeFieldPointerDrag;
  if (!drag) return;
  stopBadgeFieldDragAutoScroll();
  if (!drag.active) {
    badgeFieldPointerDrag = null;
    return;
  }
  const item = drag.item;
  const placeholder = drag.placeholder;
  if (placeholder?.isConnected) placeholder.replaceWith(item);
  else if (!item.isConnected) badgeFieldSettingsList.appendChild(item);
  item.classList.remove('is-drag-source');
  item.classList.add('is-drop-hidden');
  badgeFieldSettingsDraft.order = getBadgeFieldSettingsDomOrder();
  const targetRect = item.getBoundingClientRect();
  badgeFieldSettingsList.classList.remove('is-dragging');
  document.body.classList.remove('badge-field-settings-dragging');
  if (drag.ghost) {
    drag.ghost.classList.add('is-dropping');
    drag.ghost.style.left = `${targetRect.left}px`;
    drag.ghost.style.top = `${targetRect.top}px`;
    window.setTimeout(() => {
      drag.ghost?.remove();
      item.classList.remove('is-drop-hidden');
    }, 180);
  } else {
    item.classList.remove('is-drop-hidden');
  }
  badgeFieldPointerDrag = null;
}

function cancelBadgeFieldPointerDrag() {
  const drag = badgeFieldPointerDrag;
  if (!drag) return;
  stopBadgeFieldDragAutoScroll();
  if (drag.placeholder?.isConnected) drag.placeholder.replaceWith(drag.item);
  else if (!drag.item.isConnected) badgeFieldSettingsList.appendChild(drag.item);
  const itemsByKey = new Map([...badgeFieldSettingsList.querySelectorAll('[data-badge-field-settings-item]')].map((item) => [item.dataset.badgeFieldSettingsItem, item]));
  drag.originalOrder.forEach((key) => {
    const item = itemsByKey.get(key);
    if (item) badgeFieldSettingsList.appendChild(item);
  });
  drag.item.classList.remove('is-drag-source', 'is-drop-hidden');
  drag.ghost?.remove();
  badgeFieldSettingsList.classList.remove('is-dragging');
  document.body.classList.remove('badge-field-settings-dragging');
  badgeFieldPointerDrag = null;
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
  const query = storeOverviewState.organizationSearchQuery || '';
  const isSearching = Boolean(query.trim());
  const columns = sharedOrganizationDirectory.getColumns(draft, storeOverviewState.organizationDimension, storeOverviewState.brand);
  const searchResults = isSearching
    ? sharedOrganizationDirectory.search(query, storeOverviewState.organizationDimension, storeOverviewState.brand)
    : [];
  const renderNode = (node, fromSearch = false) => `<button type="button" class="store-org-option${fromSearch ? ' organization-search-result' : ''}${draft === node.path || draft.startsWith(`${node.path} > `) ? ' active' : ''}" data-store-org-path="${escapeBadgeHtml(node.path)}" data-store-org-level="${escapeBadgeHtml(node.type)}"><span>${fromSearch ? `<strong>${escapeBadgeHtml(node.label)}</strong><small>${escapeBadgeHtml(sharedOrganizationDirectory.formatPath(node.path, storeOverviewState.brand))}</small>` : escapeBadgeHtml(node.label)}</span>${node.children?.length ? '<i aria-hidden="true"></i>' : ''}</button>`;

  menu.innerHTML = `
    <div class="store-org-menu-top">
      <button type="button" class="store-org-clear${draft === '全部组织' ? ' active' : ''}" data-store-org-clear>全部组织</button>
      <div class="store-org-current"><span>${storeOverviewState.organizationDimension === 'province' ? '省份维度' : '大区维度'}·当前层级</span><strong>${sharedOrganizationDirectory.formatPath(draft, storeOverviewState.brand)}</strong></div>
    </div>
    <label class="organization-cascader-search"><span aria-hidden="true">⌕</span><input type="search" value="${escapeBadgeHtml(query)}" data-store-org-search placeholder="搜索组织、门店编码或顾问"></label>
    ${isSearching
      ? `<div class="organization-cascader-search-results">${searchResults.length ? searchResults.map((node) => renderNode(node, true)).join('') : '<div class="store-org-empty">未找到匹配结果</div>'}</div>`
      : `<div class="store-org-columns">${columns.map((nodes) => `<section class="store-org-column"><div class="store-org-options">${nodes.map(renderNode).join('')}</div></section>`).join('')}</div>`}
    <div class="store-org-menu-footer">
      <span>筛选将覆盖当前层级及其下属门店与顾问</span>
      <button type="button" class="btn primary" data-store-org-apply>应用组织</button>
    </div>`;
  syncDeviceOrganizationMenuLayout('.store-organization-menu', '.store-org-columns', '--store-org-shift-x');
}

function syncDeviceOrganizationMenuLayout(panelSelector, columnsSelector, cssVariable) {
  window.requestAnimationFrame(() => {
    const panel = document.querySelector(panelSelector);
    if (!panel || panel.hidden) return;
    panel.style.setProperty(cssVariable, '0px');
    const rect = panel.getBoundingClientRect();
    const safeInset = 16;
    let shiftX = 0;
    if (rect.right > window.innerWidth - safeInset) shiftX -= rect.right - (window.innerWidth - safeInset);
    if (rect.left + shiftX < safeInset) shiftX += safeInset - (rect.left + shiftX);
    panel.style.setProperty(cssVariable, `${Math.round(shiftX)}px`);
    const columns = panel.querySelector(columnsSelector);
    columns?.scrollTo({ left: columns.scrollWidth, behavior: 'smooth' });
  });
}

function closeStoreFilterMenus(except = '') {
  document.querySelectorAll('[data-store-filter-menu]').forEach((menu) => {
    const key = menu.dataset.storeFilterMenu;
    const shouldOpen = key === except;
    menu.hidden = !shouldOpen;
    const root = menu.closest('[data-store-filter-root]');
    const trigger = root?.querySelector(`[data-store-filter-trigger="${key}"]`);
    trigger?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  });
  document.querySelectorAll('[data-store-filter-root]').forEach((root) => {
    root.classList.toggle('is-open', Boolean(root.querySelector('[data-store-filter-menu]:not([hidden])')));
  });
  storeOverviewState.openFilter = except;
  renderStoreDateFilter();
}

function getFilteredStoreRecords() {
  let records = storeOverviewRecords.filter((item) => {
    const brandMatch = storeOverviewState.brand === '全部' || item.brand === storeOverviewState.brand;
    const normalizedStoreNameQuery = storeOverviewState.storeNameQuery.trim().toLocaleLowerCase('zh-CN');
    const storeNameMatch = !normalizedStoreNameQuery || item.name.toLocaleLowerCase('zh-CN').includes(normalizedStoreNameQuery);
    const organizationPath = sharedOrganizationDirectory.getDealerPath(item.dealer, storeOverviewState.organizationDimension);
    const advisorPathMatch = item.dealer.advisors.some((advisor) => `${organizationPath} > ${advisor.advisorName}`.startsWith(storeOverviewState.organization));
    const organizationMatch = storeOverviewState.organization === '全部组织'
      || organizationPath.startsWith(storeOverviewState.organization)
      || advisorPathMatch;
    // 工牌总览是每日快照原型：每个查询日期复用同一份门店数据。
    return item.bindings >= 1 && brandMatch && storeNameMatch && organizationMatch;
  });
  const selectedNode = sharedOrganizationDirectory.findNode(storeOverviewState.organization, storeOverviewState.organizationDimension);
  if (selectedNode?.type === 'advisor') {
    records = records.map((item) => ({ ...item, employees: 1, badges: 1, boundEmployees: 1, bindings: 1 }));
  }
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
    if (icon) icon.dataset.direction = direction || 'none';
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

const storeOverviewMetricFrames = new Map();

function formatStoreOverviewMetricValue(value, decimals = 0, suffix = '') {
  return `${Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}${suffix}`;
}

function setStoreOverviewMetricValue(node, value, decimals = 0, suffix = '') {
  node.textContent = formatStoreOverviewMetricValue(value, decimals, suffix);
}

function animateStoreOverviewMetric(node, target, options = {}) {
  if (!node) return;
  const activeFrame = storeOverviewMetricFrames.get(node);
  if (activeFrame) window.cancelAnimationFrame(activeFrame);

  if (!Number.isFinite(target)) {
    storeOverviewMetricFrames.delete(node);
    delete node.dataset.storeOverviewMetricValue;
    node.textContent = '—';
    return;
  }

  const decimals = options.decimals || 0;
  const suffix = options.suffix || '';
  const previousValue = Number(node.dataset.storeOverviewMetricValue);
  const startValue = Number.isFinite(previousValue) ? previousValue : 0;
  node.dataset.storeOverviewMetricValue = String(target);

  if (startValue === target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    storeOverviewMetricFrames.delete(node);
    setStoreOverviewMetricValue(node, target, decimals, suffix);
    return;
  }

  const duration = options.duration ?? 920;
  const delay = options.delay ?? 0;
  let animationStart = null;
  const step = (timestamp) => {
    if (animationStart === null) animationStart = timestamp + delay;
    if (timestamp < animationStart) {
      storeOverviewMetricFrames.set(node, window.requestAnimationFrame(step));
      return;
    }

    const progress = Math.min((timestamp - animationStart) / duration, 1);
    const eased = 1 - ((1 - progress) ** 3);
    setStoreOverviewMetricValue(node, startValue + ((target - startValue) * eased), decimals, suffix);
    if (progress < 1) {
      storeOverviewMetricFrames.set(node, window.requestAnimationFrame(step));
      return;
    }
    storeOverviewMetricFrames.delete(node);
    setStoreOverviewMetricValue(node, target, decimals, suffix);
  };

  setStoreOverviewMetricValue(node, startValue, decimals, suffix);
  storeOverviewMetricFrames.set(node, window.requestAnimationFrame(step));
}

function animateStoreOverviewMetrics(metrics) {
  metrics.forEach((metric, index) => {
    animateStoreOverviewMetric(document.getElementById(metric.id), metric.value, {
      decimals: metric.decimals,
      suffix: metric.suffix,
      delay: 80 + (index * 55),
      duration: 920
    });
  });
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

  animateStoreOverviewMetrics([
    { id: 'storeMetricStoreCount', value: records.length },
    { id: 'storeMetricBadgeAssetCount', value: badgeAssetCount },
    { id: 'storeMetricBindingCount', value: bindingCount },
    { id: 'storeMetricBindingRate', value: bindingRate, decimals: 1, suffix: '%' },
    { id: 'storeMetricEmployeeCount', value: sumStoreMetric(records, 'employees') },
    { id: 'storeMetricBoundEmployeeCount', value: sumStoreMetric(records, 'boundEmployees') }
  ]);
  document.getElementById('storeFilteredCount').textContent = records.length.toLocaleString('zh-CN');
  document.getElementById('storeBrandFilterText').textContent = storeOverviewState.brand;
  document.getElementById('storeOrganizationDimensionText').textContent = storeOverviewState.organizationDimension === 'province' ? '省份维度' : '大区维度';
  document.getElementById('storeOrganizationFilterText').textContent = sharedOrganizationDirectory.formatPath(storeOverviewState.organization, storeOverviewState.brand);
  renderStoreDateFilter();

  document.querySelectorAll('[data-store-filter-option]').forEach((button) => {
    button.classList.toggle('active', storeOverviewState[button.dataset.storeFilterOption] === button.dataset.value);
  });
  document.querySelectorAll('[data-store-org-dimension]').forEach((button) => {
    button.classList.toggle('active', storeOverviewState.organizationDimension === button.dataset.storeOrgDimension);
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
        <td><button class="text-btn" data-store-drilldown data-store-code="${escapeBadgeHtml(item.code)}" data-store-brand="${escapeBadgeHtml(item.brand)}" data-store-region="${escapeBadgeHtml(item.organization)}" data-store-zone="${escapeBadgeHtml(item.zone)}" data-store-name="${escapeBadgeHtml(item.name)}">查看明细</button></td>
      </tr>`).join('')
    : '<tr class="store-empty-row"><td colspan="11">当前筛选条件下暂无已绑定工牌的门店，请调整品牌或组织后重试。</td></tr>';
  renderStoreOverviewPagination(records.length);
}

function validRoute(value) {
  return Object.prototype.hasOwnProperty.call(pageMeta, value) ? value : 'visits';
}

function getRouteState() {
  const [routeValue = '', queryString = ''] = window.location.hash.replace(/^#/, '').split('?');
  return { route: validRoute(routeValue), params: new URLSearchParams(queryString) };
}

function getRoute() {
  return getRouteState().route;
}

function getStoreDrilldownHash() {
  const params = new URLSearchParams({ store: storeDrilldownState.storeCode });
  return `#store-badges?${params.toString()}`;
}

function applyStoreDrilldown(store, { captureReturnState = false } = {}) {
  if (!store) return false;
  if (captureReturnState) {
    storeDrilldownState.returnScrollY = window.scrollY;
    storeDrilldownState.previousBadgeFilters = { ...badgeFilterState };
    storeDrilldownState.previousBadgePage = badgePaginationState.page;
  }
  storeDrilldownState.active = true;
  storeDrilldownState.storeCode = store.code;
  storeDrilldownState.storeName = store.name;
  Object.assign(badgeFilterState, badgeDefaultFilters);
  badgeFilterState.brand = store.brand;
  badgeFilterState.store = store.name;
  badgeFilterState.collapsed = true;
  badgeMenuState.openMenu = '';
  badgePaginationState.page = 1;
  renderBadgePage();
  return true;
}

function applyStoreDrilldownFromRoute(params) {
  const store = storeOverviewRecords.find((item) => item.code === params.get('store'));
  if (!store) return false;
  if (storeDrilldownState.active && storeDrilldownState.storeCode === store.code) {
    renderBadgePage();
    return true;
  }
  return applyStoreDrilldown(store, { captureReturnState: true });
}

function syncStoreDrilldownHash() {
  if (!storeDrilldownState.active) return;
  window.history.replaceState(null, '', getStoreDrilldownHash());
}

function restoreOrdinaryBadgeState() {
  Object.assign(badgeFilterState, storeDrilldownState.previousBadgeFilters || badgeDefaultFilters);
  badgePaginationState.page = storeDrilldownState.previousBadgeFilters ? storeDrilldownState.previousBadgePage : 1;
  badgeMenuState.openMenu = '';
  storeDrilldownState.active = false;
  storeDrilldownState.storeCode = '';
  storeDrilldownState.storeName = '';
  storeDrilldownState.previousBadgeFilters = null;
  renderBadgePage();
}

function leaveStoreDrilldown(destination = 'stores') {
  const returnScrollY = storeDrilldownState.returnScrollY;
  restoreOrdinaryBadgeState();
  setRoute(destination);
  if (destination === 'stores') {
    renderStoreOverview();
    window.requestAnimationFrame(() => window.scrollTo({ top: returnScrollY, behavior: 'auto' }));
  }
}

function renderActions(route) {
  topActions.innerHTML = '';
  pageMeta[route].actions.forEach((item) => {
    if (item.action === 'field-settings') {
      const action = document.createElement('div');
      action.className = 'badge-field-settings-action';
      action.innerHTML = `<button class="btn badge-field-settings-trigger" type="button" data-badge-field-settings-open aria-describedby="badgeFieldSettingsTooltip">
        <svg class="badge-field-settings-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
          <path d="M6.675 15.75H2.625C2.4 15.75 2.25 15.6 2.25 15.375V2.625C2.25 2.4 2.4 2.25 2.625 2.25H13.425C13.65 2.25 13.8 2.4 13.8 2.625V7.575C13.8 7.95 14.1 8.325 14.55 8.325C15 8.325 15.3 8.025 15.3 7.575V2.625C15.3 1.575 14.475 0.75 13.425 0.75H2.625C1.575 0.75 0.75 1.575 0.75 2.625V15.375C0.75 16.425 1.575 17.25 2.625 17.25H6.675C7.05 17.25 7.425 16.95 7.425 16.5C7.425 16.05 7.125 15.75 6.675 15.75Z" fill="currentColor"/>
          <path d="M6.67539 11.2502C7.12539 11.2502 7.42539 10.9502 7.42539 10.5002V5.32519H9.07539C9.52539 5.32519 9.82539 5.0252 9.82539 4.5752C9.82539 4.1252 9.52539 3.8252 9.07539 3.8252H4.27539C3.82539 3.8252 3.52539 4.1252 3.52539 4.5752C3.52539 5.0252 3.82539 5.32519 4.27539 5.32519H5.92539V10.5002C5.92539 10.9502 6.30039 11.2502 6.67539 11.2502ZM7.35039 12.5252H4.27539C3.82539 12.5252 3.52539 12.8252 3.52539 13.2752C3.52539 13.7252 3.82539 14.0252 4.27539 14.0252H7.35039C7.80039 14.0252 8.10039 13.7252 8.10039 13.2752C8.10039 12.8252 7.80039 12.5252 7.35039 12.5252ZM9.45039 8.7752H11.7004C12.1504 8.7752 12.4504 8.4752 12.4504 8.0252C12.4504 7.5752 12.1504 7.2752 11.7004 7.2752H9.45039C9.00039 7.2752 8.70039 7.5752 8.70039 8.0252C8.70039 8.4752 9.00039 8.7752 9.45039 8.7752ZM9.90039 11.2502C10.3504 11.2502 10.6504 10.9502 10.6504 10.5002C10.6504 10.0502 10.3504 9.7502 9.90039 9.7502H9.45039C9.00039 9.7502 8.70039 10.0502 8.70039 10.5002C8.70039 10.9502 9.00039 11.2502 9.45039 11.2502H9.90039ZM17.0254 11.2502L15.5254 9.7502C15.2254 9.4502 14.7754 9.4502 14.4754 9.7502L9.52539 14.6252C9.37539 14.7752 9.30039 14.9252 9.30039 15.1502V16.5002C9.30039 16.9502 9.60039 17.2502 10.0504 17.2502H11.7754C12.0004 17.2502 12.1504 17.1752 12.3004 17.0252L17.0254 12.3002C17.1754 12.1502 17.2504 12.0002 17.2504 11.7752C17.2504 11.5502 17.1754 11.4002 17.0254 11.2502ZM11.4754 15.7502H10.8004V15.3752L15.0004 11.2502L15.4504 11.7002L11.4754 15.7502Z" fill="currentColor"/>
        </svg>
        <span>${item.label}</span>
      </button>
      <span class="badge-field-settings-tooltip" id="badgeFieldSettingsTooltip" role="tooltip">同步设置表格字段与筛选项</span>`;
      topActions.appendChild(action);
      return;
    }
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
  const storeDrilldownRoute = safeRoute === 'store-badges';
  document.body.classList.toggle('device-store-overview-page', safeRoute === 'stores');
  document.body.classList.toggle('device-badge-detail-page', safeRoute === 'badges' || storeDrilldownRoute);
  document.body.classList.toggle('device-dock-detail-page', safeRoute === 'docks');
  const detailRoute = safeRoute === 'events' || safeRoute === 'uploads';
  if (detailRoute) {
    closeBadgeRecordDrawer({ restoreFocus: false, immediate: true });
    moveBadgeRecordContents(badgeRecordPageContent);
  }
  const visiblePanel = detailRoute ? 'events' : storeDrilldownRoute ? 'badges' : safeRoute;
  const activeNavigationRoute = storeDrilldownRoute ? 'stores' : detailRoute ? 'badges' : safeRoute;
  routeButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === activeNavigationRoute));
  pagePanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.page === visiblePanel));
  if (detailRoute) syncBadgeRecordTabs(safeRoute);
  title.textContent = storeDrilldownRoute ? `${storeDrilldownState.storeName} · 工牌明细` : pageMeta[safeRoute].title;
  description.textContent = pageMeta[safeRoute].description;
  if (visitOriginBackButton) visitOriginBackButton.hidden = safeRoute !== 'visits' || !visitReturnToMatching;
  document.title = `${storeDrilldownRoute ? `${storeDrilldownState.storeName} · 工牌明细` : pageMeta[safeRoute].title} · AI质检平台`;
  const drilldownActions = document.querySelector('[data-store-drilldown-actions]');
  if (drilldownActions) drilldownActions.hidden = !storeDrilldownRoute;
  renderActions(safeRoute);
  const nextHash = storeDrilldownRoute
    ? getStoreDrilldownHash()
    : safeRoute === 'visits' && visitReturnToMatching
      ? '#visits?from=dashboard'
      : `#${safeRoute}`;
  if (updateHash && window.location.hash !== nextHash) window.location.hash = nextHash;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function resetVisitImport() {
  visitImportFile = null;
  if (visitImportFileInput) visitImportFileInput.value = '';
  if (visitImportFileName) visitImportFileName.textContent = '点击或拖拽 Excel 文件到这里';
  if (visitImportFileHint) visitImportFileHint.textContent = '支持 .xlsx、.xls，单个文件不超过 10 MB';
  if (visitImportSubmitButton) visitImportSubmitButton.disabled = true;
  visitImportDropzone?.classList.remove('has-file', 'is-dragover');
}

function selectVisitImportFile(file) {
  if (!file) return;
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  if (!isExcel) {
    resetVisitImport();
    showToast('请选择 .xlsx 或 .xls 文件');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    resetVisitImport();
    showToast('文件不能超过 10 MB');
    return;
  }
  visitImportFile = file;
  if (visitImportFileName) visitImportFileName.textContent = file.name;
  if (visitImportFileHint) visitImportFileHint.textContent = `${(file.size / 1024).toFixed(1)} KB · 文件已选择，可开始上传`;
  if (visitImportSubmitButton) visitImportSubmitButton.disabled = false;
  visitImportDropzone?.classList.add('has-file');
}

function downloadVisitTemplate() {
  const link = document.createElement('a');
  link.href = './templates/到访明细上传模板.xlsx';
  link.download = '到访明细上传模板.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('到访明细模板已下载');
}

function moveBadgeRecordContents(host) {
  if (!host) return;
  document.querySelectorAll('[data-badge-record-content]').forEach((content) => host.appendChild(content));
}

function restoreBadgeRecordFilterToolbars() {
  const toolbarByTab = {
    events: document.getElementById('badgeEventFilters'),
    uploads: document.getElementById('badgeUploadFilters')
  };
  Object.entries(toolbarByTab).forEach(([tab, toolbar]) => {
    const slot = document.querySelector(`[data-badge-record-filter-slot="${tab}"]`);
    if (toolbar && slot && toolbar.previousElementSibling !== slot) slot.insertAdjacentElement('afterend', toolbar);
  });
}

function syncBadgeRecordDrawerFilter(activeTab) {
  restoreBadgeRecordFilterToolbars();
  if (!badgeRecordDrawerContentHost?.querySelector('[data-badge-record-content]')) return;
  const toolbar = activeTab === 'uploads'
    ? document.getElementById('badgeUploadFilters')
    : document.getElementById('badgeEventFilters');
  if (toolbar && badgeRecordDrawerFilterHost) badgeRecordDrawerFilterHost.appendChild(toolbar);
}

function isBadgeRecordDrawerOpen() {
  return badgeRecordDrawer?.classList.contains('open');
}

function syncBodyScrollLock() {
  const locked = badgeRecordDrawer?.getAttribute('aria-hidden') === 'false'
    || badgeFieldSettingsDrawer?.getAttribute('aria-hidden') === 'false'
    || visitDrawer.getAttribute('aria-hidden') === 'false'
    || !importModal.hidden;
  document.body.style.overflow = locked ? 'hidden' : '';
}

function getBadgeRecordDrawerFocusableElements() {
  if (!badgeRecordDrawer) return [];
  return Array.from(badgeRecordDrawer.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hidden && !element.closest('[hidden]') && element.getAttribute('aria-hidden') !== 'true');
}

function renderBadgeDockSubdeviceCards() {
  if (!badgeDockSubdeviceList) return;
  const visibleRecords = dockSubdeviceRecords;
  if (visibleRecords.length) {
    badgeDockSubdeviceList.innerHTML = visibleRecords.map((item) => {
      return `<article class="badge-dock-device-card" aria-label="${escapeBadgeHtml(item.port)}，工牌 ${escapeBadgeHtml(item.sn)}">
        <div class="badge-dock-device-identity">
          <span class="badge-dock-device-port">${escapeBadgeHtml(item.port)}</span>
          <strong class="badge-dock-device-sn">${escapeBadgeHtml(item.sn)}</strong>
        </div>
        <div class="badge-dock-device-battery">
          ${renderBatteryIndicator(item.battery, '电池电量')}
        </div>
        <div class="badge-dock-device-meta">
          <div class="badge-dock-device-fact"><span>可用空间</span><strong>${escapeBadgeHtml(item.availableSpace)}</strong></div>
          <div class="badge-dock-device-fact"><span>设备获取时间</span><strong>${escapeBadgeHtml(item.capturedAt)}</strong></div>
        </div>
      </article>`;
    }).join('');
  } else {
    badgeDockSubdeviceList.innerHTML = `<div class="badge-dock-empty-state"><div class="badge-dock-empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#E2E8F0" d="M24 6a18 18 0 0 0-18 18c0 9.941 8.059 18 18 18s18-8.059 18-18A18 18 0 0 0 24 6Zm-9 16h18v4H15v-4Z" /><path fill="#94A3B8" d="M24 30a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0-14a2 2 0 0 0-2 2v8a2 2 0 0 0 4 0v-8a2 2 0 0 0-2-2Z" /></svg></div><span>暂无设备</span></div>`;
  }
}

function syncBadgeDockDateView(value) {
  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return;
  badgeDockDateMenuState.dateViewYear = parsedDate.getFullYear();
  badgeDockDateMenuState.dateViewMonth = parsedDate.getMonth() + 1;
}

function syncBadgeDockDateDraft() {
  badgeDockDateMenuState.dateDraftStartDate = badgeDockDateFilterState.startDate;
  badgeDockDateMenuState.dateDraftEndDate = badgeDockDateFilterState.endDate;
  badgeDockDateMenuState.activeDateField = 'startDate';
  syncBadgeDockDateView(badgeDockDateMenuState.dateDraftStartDate);
}

function getBadgeDockDateCells() {
  const cells = [];
  const { dateViewYear: year, dateViewMonth: month } = badgeDockDateMenuState;
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingSlots; index += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    const value = formatStoreDateValue(new Date(year, month - 1, day));
    cells.push({
      day,
      value,
      inRange: value >= badgeDockDateMenuState.dateDraftStartDate && value <= badgeDockDateMenuState.dateDraftEndDate,
      isStart: value === badgeDockDateMenuState.dateDraftStartDate,
      isEnd: value === badgeDockDateMenuState.dateDraftEndDate,
      isToday: value === storeTodayDateValue
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderBadgeDockDateControl() {
  if (!badgeDockDateControl) return;
  const panelRenderer = globalThis.__dateFilterComponentUtils?.renderDateRangePanelMarkup;
  const draftRangeText = `${formatStoreDateDisplay(badgeDockDateMenuState.dateDraftStartDate)} 至 ${formatStoreDateDisplay(badgeDockDateMenuState.dateDraftEndDate)}`;
  const panel = badgeDockDateMenuState.open && panelRenderer ? panelRenderer({
    dataNamespace: 'badge-dock-date',
    rangeText: draftRangeText,
    monthLabel: `${badgeDockDateMenuState.dateViewYear}年${badgeDockDateMenuState.dateViewMonth}月`,
    activeField: badgeDockDateMenuState.activeDateField,
    startLabel: formatStoreDateDisplay(badgeDockDateMenuState.dateDraftStartDate),
    endLabel: formatStoreDateDisplay(badgeDockDateMenuState.dateDraftEndDate),
    cells: getBadgeDockDateCells(),
    summaryText: `已选择 ${draftRangeText}`,
    panelClassName: 'session-menu-panel session-menu-panel-date badge-dock-date-panel',
    title: '日志日期范围',
    applyLabel: '确定'
  }) : '';
  badgeDockDateControl.classList.toggle('is-open', badgeDockDateMenuState.open);
  badgeDockDateControl.innerHTML = `
    <span>日期范围</span>
    <button type="button" class="session-date-trigger${badgeDockDateMenuState.open ? ' active' : ''}" data-badge-dock-date-trigger aria-label="选择子设备日志日期范围" aria-haspopup="dialog" aria-expanded="${badgeDockDateMenuState.open ? 'true' : 'false'}">
      <strong>${escapeBadgeHtml(formatStoreDateDisplay(badgeDockDateFilterState.startDate))}</strong>
      <em>至</em>
      <strong>${escapeBadgeHtml(formatStoreDateDisplay(badgeDockDateFilterState.endDate))}</strong>
      <span class="session-date-icon" aria-hidden="true"></span>
    </button>
    ${panel}`;
}

function renderBadgeDockEventControl() {
  if (!badgeDockEventControl) return;
  const selectedEvents = badgeDockEventFilterState.selectedEvents;
  const allSelected = selectedEvents.size === badgeDockEventOptions.length;
  const someSelected = selectedEvents.size > 0 && !allSelected;
  const selectionLabel = allSelected
    ? '全部事件'
    : selectedEvents.size === 1
      ? [...selectedEvents][0]
      : selectedEvents.size > 1
        ? `已选 ${selectedEvents.size} 项`
        : '未选择';
  const optionMarkup = (value, label, selected, indeterminate = false) => `<button type="button" class="session-menu-option badge-dock-event-option${selected ? ' active' : ''}${indeterminate ? ' is-indeterminate' : ''}" data-badge-dock-event-option="${escapeBadgeHtml(value)}" role="option" aria-selected="${selected}" aria-checked="${indeterminate ? 'mixed' : selected}"><span class="badge-dock-event-check" aria-hidden="true"></span><span>${escapeBadgeHtml(label)}</span></button>`;
  badgeDockEventControl.classList.toggle('is-open', badgeDockEventMenuState.open);
  badgeDockEventControl.innerHTML = `
    <span>事件名称</span>
    <button type="button" class="session-select-trigger${badgeDockEventMenuState.open ? ' active' : ''}" data-badge-dock-event-trigger aria-label="筛选子设备日志事件名称" aria-haspopup="listbox" aria-expanded="${badgeDockEventMenuState.open}">
      <strong>${escapeBadgeHtml(selectionLabel)}</strong>
      <span class="session-select-caret" aria-hidden="true"></span>
    </button>
    ${badgeDockEventMenuState.open ? `<div class="session-menu-panel badge-dock-event-menu"><div class="session-menu-option-list" role="listbox" aria-label="事件名称选项" aria-multiselectable="true">${optionMarkup('all', '全部事件', allSelected, someSelected)}${badgeDockEventOptions.map((option) => optionMarkup(option, option, selectedEvents.has(option))).join('')}</div></div>` : ''}`;
}

function getFilteredBadgeDockLogRecords() {
  return dockLogRecords.filter((item) => {
    const date = item.time.slice(0, 10).replaceAll('/', '-');
    const dateMatch = date >= badgeDockDateFilterState.startDate && date <= badgeDockDateFilterState.endDate;
    return dateMatch && badgeDockEventFilterState.selectedEvents.has(item.event);
  });
}

const badgeDockLogEventVisuals = {
  '充电坞上线': { tone: 'green', icon: '../assets/device-dock-log-icons/dock-online.svg' },
  '充电坞下线': { tone: 'neutral', icon: '../assets/device-dock-log-icons/dock-offline.svg' },
  '工牌上线': { tone: 'green', icon: '../assets/device-dock-log-icons/badge-online.svg' },
  '工牌下线': { tone: 'neutral', icon: '../assets/device-dock-log-icons/badge-offline.svg' },
  '录音上传完成': { tone: 'blue', icon: '../assets/device-dock-log-icons/recording-uploaded.svg' },
  '当天录音上传完成': { tone: 'blue', icon: '../assets/device-dock-log-icons/recording-uploaded.svg' },
  '设备日志上传完成': { tone: 'violet', icon: '../assets/device-dock-log-icons/device-log-uploaded.svg' },
  '定位日志上传完成': { tone: 'violet', icon: '../assets/device-dock-log-icons/device-log-uploaded.svg' }
};

function getBadgeDockLogEventVisual(eventName) {
  return badgeDockLogEventVisuals[eventName] || badgeDockLogEventVisuals['设备日志上传完成'];
}

function renderBadgeDockLogTimeline() {
  if (!badgeDockLogTimeline) return;
  const filteredRecords = getFilteredBadgeDockLogRecords();
  badgeDockLogTimeline.classList.toggle('event-timeline-grouped', filteredRecords.length > 0);
  badgeDockLogTimeline.innerHTML = filteredRecords.length ? filteredRecords.map((item) => {
    const visual = getBadgeDockLogEventVisual(item.event);
    const employee = String(item.employee || '').trim();
    const badgeSn = String(item.sn || '').trim();
    const employeeHtml = employee && employee !== '-' && employee !== '—' ? `<strong>${escapeBadgeHtml(employee)}</strong>` : '';
    const badgeSnHtml = badgeSn && badgeSn !== '-' && badgeSn !== '—' ? `<span>${escapeBadgeHtml(badgeSn)}</span>` : '';
    const metaHtml = employeeHtml || badgeSnHtml ? `<div class="badge-dock-log-event-meta">${employeeHtml}${badgeSnHtml}</div>` : '';
    return `<article class="event-group-card event-standalone-card badge-dock-log-event">
      <div class="event-group-row">
        <span class="event-dot ${visual.tone}" aria-hidden="true"><img src="${visual.icon}" alt="" width="16" height="16"></span>
        <div class="event-group-copy">
          <strong>${escapeBadgeHtml(item.event)}</strong>
          <p>${escapeBadgeHtml(item.time)}</p>
        </div>
        ${metaHtml}
      </div>
    </article>`;
  }).join('') : '<div class="event-empty-state">当前筛选条件下暂无子设备日志。</div>';
}

function renderBadgeDockDrawer(sn) {
  if (!badgeRecordDrawerTitle || !badgeRecordDrawerSubtitle || !badgeDockDrawerView) return;
  activeDockDetailRecord = dockDetailRecords.find((item) => item.sn === sn) || null;
  if (!activeDockDetailRecord) return;
  buildDockDrawerRecords(activeDockDetailRecord);
  badgeRecordDrawerTitle.textContent = '充电坞详情';
  badgeRecordDrawerSubtitle.textContent = `充电坞 SN：${activeDockDetailRecord.sn}`;
  Object.assign(badgeDockDateFilterState, badgeDockDateDefaultFilters);
  badgeDockEventFilterState.selectedEvents = new Set(badgeDockEventOptions);
  badgeDockEventMenuState.open = false;
  badgeDockDateMenuState.open = false;
  syncBadgeDockDateDraft();
  renderBadgeDockSubdeviceCards();
  renderBadgeDockEventControl();
  renderBadgeDockDateControl();
  renderBadgeDockLogTimeline();
}

function setBadgeRecordDrawerMode(isDock) {
  const normalSections = badgeRecordDrawerBody?.querySelectorAll('.badge-record-profile-card, .badge-record-drawer-controls, .badge-record-drawer-content-host');
  normalSections?.forEach((section) => { section.hidden = isDock; });
  if (badgeDockDrawerView) badgeDockDrawerView.hidden = !isDock;
}

function openBadgeRecordDrawer(tab, trigger) {
  if (!badgeRecordDrawer || !badgeRecordDrawerBackdrop || !badgeRecordDrawerContentHost) return;
  window.clearTimeout(badgeRecordDrawerCloseTimer);
  badgeRecordDrawerTrigger = trigger || null;
  const sn = trigger?.dataset.badgeSn;
  selectBadgeRecord(sn, trigger?.dataset.advisorName);
  setBadgeRecordDrawerMode(false);
  moveBadgeRecordContents(badgeRecordDrawerContentHost);
  syncBadgeRecordTabs(tab);
  if (badgeRecordDrawerTitle) badgeRecordDrawerTitle.textContent = '工牌记录';
  if (badgeRecordDrawerSubtitle) badgeRecordDrawerSubtitle.textContent = '查看当前顾问工牌的设备事件和录音上传记录';
  badgeRecordDrawerBackdrop.hidden = false;
  badgeRecordDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => {
    badgeRecordDrawer.classList.add('open');
    badgeRecordDrawer.querySelector('[data-badge-record-drawer-close]')?.focus();
    syncBodyScrollLock();
  });
}

function openDockDetailDrawer(trigger) {
  if (!badgeRecordDrawer || !badgeRecordDrawerBackdrop || !badgeDockDrawerView) return;
  window.clearTimeout(badgeRecordDrawerCloseTimer);
  badgeRecordDrawerTrigger = trigger || null;
  setBadgeRecordDrawerMode(true);
  renderBadgeDockDrawer(trigger?.dataset.dockSn);
  badgeRecordDrawerBackdrop.hidden = false;
  badgeRecordDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => {
    badgeRecordDrawer.classList.add('open');
    badgeRecordDrawer.querySelector('[data-badge-record-drawer-close]')?.focus();
    syncBodyScrollLock();
  });
}

function closeBadgeRecordDrawer({ restoreFocus = true, immediate = false } = {}) {
  if (!badgeRecordDrawer || !badgeRecordDrawerBackdrop) return;
  window.clearTimeout(badgeRecordDrawerCloseTimer);
  const trigger = badgeRecordDrawerTrigger;
  badgeEventMenuState.openMenu = null;
  badgeUploadMenuState.openMenu = null;
  badgeDockEventMenuState.open = false;
  badgeDockDateMenuState.open = false;
  badgeRecordDrawer.classList.remove('open');
  badgeRecordDrawer.setAttribute('aria-hidden', 'true');

  const finishClose = () => {
    badgeRecordDrawerBackdrop.hidden = true;
    restoreBadgeRecordFilterToolbars();
    moveBadgeRecordContents(badgeRecordPageContent);
    setBadgeRecordDrawerMode(false);
    if (badgeRecordDrawerTitle) badgeRecordDrawerTitle.textContent = '工牌记录';
    if (badgeRecordDrawerSubtitle) badgeRecordDrawerSubtitle.textContent = '查看当前顾问工牌的设备事件和录音上传记录';
    if (restoreFocus && trigger?.isConnected) trigger.focus();
    badgeRecordDrawerTrigger = null;
  };

  if (immediate) finishClose();
  else badgeRecordDrawerCloseTimer = window.setTimeout(finishClose, 230);
  syncBodyScrollLock();
}

function openModal(modal) {
  modal.hidden = false;
  syncBodyScrollLock();
}

function closeModal(modal) {
  modal.hidden = true;
  if (modal === importModal) resetVisitImport();
  syncBodyScrollLock();
}

document.querySelector('[data-visit-import-select]')?.addEventListener('click', () => visitImportFileInput?.click());
document.querySelector('[data-visit-template-download]')?.addEventListener('click', downloadVisitTemplate);
visitImportFileInput?.addEventListener('change', () => selectVisitImportFile(visitImportFileInput.files?.[0]));
visitImportSubmitButton?.addEventListener('click', () => {
  if (!visitImportFile) return;
  const fileName = visitImportFile.name;
  closeModal(importModal);
  showToast(`${fileName} 已上传并进入校验`);
});
visitImportDropzone?.addEventListener('click', (event) => {
  if (!event.target.closest('button')) visitImportFileInput?.click();
});
['dragenter', 'dragover'].forEach((eventName) => {
  visitImportDropzone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    visitImportDropzone.classList.add('is-dragover');
  });
});
['dragleave', 'drop'].forEach((eventName) => {
  visitImportDropzone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    visitImportDropzone.classList.remove('is-dragover');
    if (eventName === 'drop') selectVisitImportFile(event.dataTransfer?.files?.[0]);
  });
});

function openDrawer(type) {
  const record = visitRecords.find((item) => item.businessId === type);
  const detail = detailData[type]
    || (record?.detailKey ? detailData[record.detailKey] : null)
    || (record ? createVisitRecordDetail(record) : detailData.matched);
  drawerStatus.textContent = detail.status;
  drawerStatus.className = `status ${detail.statusClass}`;
  drawerBusinessId.textContent = detail.businessId;
  drawerBody.innerHTML = detail.html;
  drawerBackdrop.hidden = false;
  visitDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => visitDrawer.classList.add('open'));
  syncBodyScrollLock();
}

function closeDrawer() {
  visitDrawer.classList.remove('open');
  visitDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { drawerBackdrop.hidden = true; }, 220);
  syncBodyScrollLock();
}

routeButtons.forEach((button) => button.addEventListener('click', () => {
  closeBadgeRecordDrawer({ restoreFocus: false, immediate: true });
  visitReturnToMatching = false;
  if (storeDrilldownState.active) {
    if (button.dataset.route === 'badges') {
      leaveStoreDrilldown('badges');
      return;
    }
    if (button.dataset.route === 'stores') {
      leaveStoreDrilldown('stores');
      return;
    }
    restoreOrdinaryBadgeState();
  }
  setRoute(button.dataset.route);
}));
document.querySelectorAll('.nav-button[data-href]:not(.device-nav)').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = new URL(button.dataset.href, window.location.href).href;
  });
});
window.addEventListener('hashchange', () => {
  closeBadgeRecordDrawer({ restoreFocus: false, immediate: true });
  const routeState = getRouteState();
  visitReturnToMatching = routeState.route === 'visits' && routeState.params.get('from') === 'dashboard';
  if (routeState.route === 'store-badges') {
    if (!applyStoreDrilldownFromRoute(routeState.params)) {
      leaveStoreDrilldown('stores');
      return;
    }
  } else if (storeDrilldownState.active) {
    const returnScrollY = storeDrilldownState.returnScrollY;
    restoreOrdinaryBadgeState();
    if (routeState.route === 'stores') {
      renderStoreOverview();
      window.requestAnimationFrame(() => window.scrollTo({ top: returnScrollY, behavior: 'auto' }));
    }
  }
  setRoute(routeState.route, false);
});

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-visits-back-matching]')) {
    visitReturnToMatching = false;
    setRoute('dashboard');
    return;
  }

  if (event.target.closest('[data-store-drilldown-back]')) {
    leaveStoreDrilldown('stores');
    return;
  }

  if (event.target.closest('[data-badge-field-settings-open]')) {
    openBadgeFieldSettings();
    return;
  }

  if (event.target.closest('[data-badge-field-settings-close]') || event.target === badgeFieldSettingsBackdrop) {
    closeBadgeFieldSettings();
    return;
  }

  if (event.target.closest('[data-badge-field-settings-restore]')) {
    badgeFieldSettingsDraft = createDefaultBadgeFieldSettings();
    renderBadgeFieldSettings();
    showToast('已恢复默认草稿，保存后生效');
    return;
  }

  if (event.target.closest('[data-badge-field-settings-select-all]')) {
    if (!badgeFieldSettingsDraft) return;
    badgeFieldSettingsDraft.visible = [...badgeFieldSettingsDraft.order];
    renderBadgeFieldSettings();
    return;
  }

  if (event.target.closest('[data-badge-field-settings-save]')) {
    saveBadgeFieldSettings();
    return;
  }

  const dockDetailOpen = event.target.closest('[data-dock-detail-open]');
  if (dockDetailOpen) {
    openDockDetailDrawer(dockDetailOpen);
    return;
  }

  const badgeRecordDrawerOpen = event.target.closest('[data-badge-record-drawer-open]');
  if (badgeRecordDrawerOpen) {
    openBadgeRecordDrawer(badgeRecordDrawerOpen.dataset.badgeRecordDrawerOpen, badgeRecordDrawerOpen);
    return;
  }

  if (event.target.closest('#badgeDockRefreshBtn')) {
    if (badgeDockRefreshBtn) {
      window.clearTimeout(badgeDockRefreshBtn.refreshTimer);
      badgeDockRefreshBtn.classList.add('spinning');
      badgeDockRefreshBtn.setAttribute('aria-busy', 'true');
      badgeDockRefreshBtn.refreshTimer = window.setTimeout(() => {
        badgeDockRefreshBtn.classList.remove('spinning');
        badgeDockRefreshBtn.removeAttribute('aria-busy');
      }, 700);
    }
    renderBadgeDockSubdeviceCards();
    renderBadgeDockLogTimeline();
    showToast('子设备状态已刷新');
    return;
  }

  if (!event.target.closest('#badgeDockEventControl') && badgeDockEventMenuState.open) {
    badgeDockEventMenuState.open = false;
    renderBadgeDockEventControl();
  }

  if (event.target.closest('[data-badge-dock-event-trigger]')) {
    badgeDockEventMenuState.open = !badgeDockEventMenuState.open;
    badgeDockDateMenuState.open = false;
    renderBadgeDockEventControl();
    renderBadgeDockDateControl();
    return;
  }

  const badgeDockEventOption = event.target.closest('[data-badge-dock-event-option]');
  if (badgeDockEventOption) {
    const value = badgeDockEventOption.dataset.badgeDockEventOption;
    const selectedEvents = badgeDockEventFilterState.selectedEvents;
    if (value === 'all') {
      badgeDockEventFilterState.selectedEvents = selectedEvents.size === badgeDockEventOptions.length
        ? new Set()
        : new Set(badgeDockEventOptions);
    } else if (selectedEvents.has(value)) {
      selectedEvents.delete(value);
    } else {
      selectedEvents.add(value);
    }
    renderBadgeDockEventControl();
    renderBadgeDockLogTimeline();
    return;
  }

  if (!event.target.closest('#badgeDockDateControl') && badgeDockDateMenuState.open) {
    badgeDockDateMenuState.open = false;
    renderBadgeDockDateControl();
  }

  if (event.target.closest('[data-badge-dock-date-trigger]')) {
    badgeDockDateMenuState.open = !badgeDockDateMenuState.open;
    badgeDockEventMenuState.open = false;
    if (badgeDockDateMenuState.open) syncBadgeDockDateDraft();
    renderBadgeDockEventControl();
    renderBadgeDockDateControl();
    return;
  }

  const badgeDockDateNav = event.target.closest('[data-badge-dock-date-nav]');
  if (badgeDockDateNav) {
    const nextMonth = new Date(badgeDockDateMenuState.dateViewYear, badgeDockDateMenuState.dateViewMonth - 1 + Number(badgeDockDateNav.dataset.badgeDockDateNav), 1);
    badgeDockDateMenuState.dateViewYear = nextMonth.getFullYear();
    badgeDockDateMenuState.dateViewMonth = nextMonth.getMonth() + 1;
    renderBadgeDockDateControl();
    return;
  }

  const badgeDockDateField = event.target.closest('[data-badge-dock-date-field]');
  if (badgeDockDateField) {
    badgeDockDateMenuState.activeDateField = badgeDockDateField.dataset.badgeDockDateField;
    syncBadgeDockDateView(badgeDockDateMenuState.activeDateField === 'startDate'
      ? badgeDockDateMenuState.dateDraftStartDate
      : badgeDockDateMenuState.dateDraftEndDate);
    renderBadgeDockDateControl();
    return;
  }

  const badgeDockDateValue = event.target.closest('[data-badge-dock-date-value]');
  if (badgeDockDateValue) {
    const value = badgeDockDateValue.dataset.badgeDockDateValue;
    if (badgeDockDateMenuState.activeDateField === 'startDate') {
      badgeDockDateMenuState.dateDraftStartDate = value;
      if (badgeDockDateMenuState.dateDraftEndDate < value) badgeDockDateMenuState.dateDraftEndDate = value;
      badgeDockDateMenuState.activeDateField = 'endDate';
    } else {
      badgeDockDateMenuState.dateDraftEndDate = value;
      if (badgeDockDateMenuState.dateDraftStartDate > value) badgeDockDateMenuState.dateDraftStartDate = value;
      badgeDockDateMenuState.activeDateField = 'startDate';
    }
    renderBadgeDockDateControl();
    return;
  }

  if (event.target.closest('[data-badge-dock-date-cancel]')) {
    badgeDockDateMenuState.open = false;
    syncBadgeDockDateDraft();
    renderBadgeDockDateControl();
    return;
  }

  if (event.target.closest('[data-badge-dock-date-apply]')) {
    badgeDockDateFilterState.startDate = badgeDockDateMenuState.dateDraftStartDate;
    badgeDockDateFilterState.endDate = badgeDockDateMenuState.dateDraftEndDate;
    badgeDockDateMenuState.open = false;
    renderBadgeDockDateControl();
    renderBadgeDockLogTimeline();
    return;
  }

  if (event.target.closest('[data-badge-record-drawer-close]') || event.target === badgeRecordDrawerBackdrop) {
    closeBadgeRecordDrawer();
    return;
  }

  const badgeRecordTab = event.target.closest('[data-badge-record-tab]');
  if (badgeRecordTab) {
    if (badgeRecordTab.closest('#badgeRecordDrawer')) syncBadgeRecordTabs(badgeRecordTab.dataset.badgeRecordTab);
    else setRoute(badgeRecordTab.dataset.badgeRecordTab);
    return;
  }

  if (event.target.closest('[data-badge-detail-back]')) {
    setRoute(storeDrilldownState.active ? 'store-badges' : 'badges');
    return;
  }

  const visitDetailButton = event.target.closest('[data-visit-detail-type]');
  if (visitDetailButton) {
    const record = visitRecords.find((item) => item.businessId === visitDetailButton.dataset.businessId);
    if (record) openVisitMatchDetail(record, visitDetailButton.dataset.visitDetailType);
    return;
  }

  const badgeUploadDayButton = event.target.closest('[data-badge-upload-day]');
  if (badgeUploadDayButton) {
    badgeUploadSelectedDate = badgeUploadDayButton.dataset.badgeUploadDay;
    renderBadgeUploads();
    badgeUploadDetailTitle.textContent = `${badgeUploadSelectedDate} 录音上传明细`;
    badgeUploadDetailDescription.textContent = '仅展示当前顾问、当前工牌在所选日期上传完成的录音';
    badgeUploadModalState.records = getCompletedBadgeUploadRecords().filter((item) => getBadgeUploadCompletedDate(item) === badgeUploadSelectedDate);
    badgeUploadModalState.emptyText = '当前日期没有上传完成的录音。';
    badgeUploadModalPaginationState.page = 1;
    renderBadgeUploadModal();
    openModal(badgeUploadDetailModal);
    return;
  }

  const badgeRecordPageSizeTrigger = event.target.closest('[data-badge-record-page-size-trigger]');
  if (badgeRecordPageSizeTrigger) {
    const options = badgeRecordPageSizeTrigger.parentElement.querySelector('.page-size-options');
    const willOpen = !options.classList.contains('open');
    document.querySelectorAll('.badge-record-pagination .page-size-options.open').forEach((node) => node.classList.remove('open'));
    document.querySelectorAll('.badge-record-pagination .page-size-trigger.is-open').forEach((node) => node.classList.remove('is-open'));
    options.classList.toggle('open', willOpen);
    badgeRecordPageSizeTrigger.classList.toggle('is-open', willOpen);
    return;
  }

  const badgeRecordPageSize = event.target.closest('[data-badge-record-page-size]');
  if (badgeRecordPageSize) {
    const key = badgeRecordPageSize.dataset.badgeRecordPageSize;
    const state = getBadgeRecordPaginationState(key);
    state.pageSize = Number(badgeRecordPageSize.dataset.pageSize);
    state.page = 1;
    if (key === 'modal') renderBadgeUploadModal();
    else renderBadgeUploads();
    return;
  }

  const badgeRecordPage = event.target.closest('[data-badge-record-page]');
  if (badgeRecordPage) {
    const key = badgeRecordPage.dataset.badgeRecordPage;
    getBadgeRecordPaginationState(key).page = Number(badgeRecordPage.dataset.page);
    if (key === 'modal') renderBadgeUploadModal();
    else renderBadgeUploads();
    return;
  }

  const badgeRecordPageAction = event.target.closest('[data-badge-record-page-action]');
  if (badgeRecordPageAction && !badgeRecordPageAction.disabled) {
    const key = badgeRecordPageAction.dataset.badgeRecordPageAction;
    const state = getBadgeRecordPaginationState(key);
    state.page += badgeRecordPageAction.dataset.pageAction === 'next' ? 1 : -1;
    if (key === 'modal') renderBadgeUploadModal();
    else renderBadgeUploads();
    return;
  }

  if (!event.target.closest('#badgeEventFilters')) closeBadgeEventMenus();
  if (!event.target.closest('#badgeUploadFilters')) closeBadgeUploadMenus();

  if (event.target.closest('[data-badge-event-date-trigger]')) {
    badgeEventMenuState.openMenu = badgeEventMenuState.openMenu === 'date' ? null : 'date';
    if (badgeEventMenuState.openMenu === 'date') syncBadgeEventDateView();
    renderBadgeEventFilters();
    return;
  }

  const badgeEventDateNav = event.target.closest('[data-badge-event-date-nav]');
  if (badgeEventDateNav) {
    const nextMonth = new Date(badgeEventMenuState.dateViewYear, badgeEventMenuState.dateViewMonth - 1 + Number(badgeEventDateNav.dataset.badgeEventDateNav), 1);
    badgeEventMenuState.dateViewYear = nextMonth.getFullYear();
    badgeEventMenuState.dateViewMonth = nextMonth.getMonth() + 1;
    renderBadgeEventFilters();
    return;
  }

  const badgeEventDateValue = event.target.closest('[data-badge-event-date-value]');
  if (badgeEventDateValue) {
    badgeEventFilterState.date = badgeEventDateValue.dataset.badgeEventDateValue;
    badgeEventMenuState.openMenu = null;
    renderBadgeEventFilters();
    renderBadgeEvents();
    return;
  }

  if (event.target.closest('[data-badge-event-type-trigger]')) {
    badgeEventMenuState.openMenu = badgeEventMenuState.openMenu === 'type' ? null : 'type';
    renderBadgeEventFilters();
    return;
  }

  const badgeEventTypeValue = event.target.closest('[data-badge-event-type-value]');
  if (badgeEventTypeValue) {
    badgeEventFilterState.type = badgeEventTypeValue.dataset.badgeEventTypeValue;
    badgeEventMenuState.openMenu = null;
    renderBadgeEventFilters();
    renderBadgeEvents();
    return;
  }

  if (event.target.closest('[data-badge-event-reset]')) {
    const currentRecord = badgeEventRecords.find((item) => item.sn === badgeRecordState.sn && item.date === badgeEventFilterState.date)
      || badgeEventRecords.find((item) => item.sn === badgeRecordState.sn);
    badgeEventFilterState.date = currentRecord?.date || badgeEventDefaultFilters.date;
    badgeEventFilterState.sn = badgeRecordState.sn;
    badgeEventFilterState.type = 'all';
    badgeEventMenuState.openMenu = null;
    syncBadgeEventDateView();
    renderBadgeEventFilters();
    renderBadgeEvents();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-badge-upload-date-trigger]')) {
    const opening = badgeUploadMenuState.openMenu !== 'date';
    badgeUploadMenuState.openMenu = opening ? 'date' : null;
    if (opening) syncBadgeUploadDateDraft();
    renderBadgeUploadFilters();
    return;
  }

  const badgeUploadDateNav = event.target.closest('[data-badge-upload-date-nav]');
  if (badgeUploadDateNav) {
    const nextMonth = new Date(badgeUploadMenuState.dateViewYear, badgeUploadMenuState.dateViewMonth - 1 + Number(badgeUploadDateNav.dataset.badgeUploadDateNav), 1);
    badgeUploadMenuState.dateViewYear = nextMonth.getFullYear();
    badgeUploadMenuState.dateViewMonth = nextMonth.getMonth() + 1;
    renderBadgeUploadFilters();
    return;
  }

  const badgeUploadDateField = event.target.closest('[data-badge-upload-date-field]');
  if (badgeUploadDateField) {
    badgeUploadMenuState.activeDateField = badgeUploadDateField.dataset.badgeUploadDateField;
    renderBadgeUploadFilters();
    return;
  }

  const badgeUploadDateValue = event.target.closest('[data-badge-upload-date-value]');
  if (badgeUploadDateValue) {
    const value = badgeUploadDateValue.dataset.badgeUploadDateValue;
    if (badgeUploadMenuState.activeDateField === 'startDate') {
      badgeUploadMenuState.dateDraftStartDate = value;
      if (badgeUploadMenuState.dateDraftEndDate < value) badgeUploadMenuState.dateDraftEndDate = value;
      badgeUploadMenuState.activeDateField = 'endDate';
    } else {
      badgeUploadMenuState.dateDraftEndDate = value;
      if (badgeUploadMenuState.dateDraftStartDate > value) badgeUploadMenuState.dateDraftStartDate = value;
      badgeUploadMenuState.activeDateField = 'startDate';
    }
    renderBadgeUploadFilters();
    return;
  }

  if (event.target.closest('[data-badge-upload-date-cancel]')) {
    badgeUploadMenuState.openMenu = null;
    syncBadgeUploadDateDraft();
    renderBadgeUploadFilters();
    return;
  }

  if (event.target.closest('[data-badge-upload-date-apply]')) {
    badgeUploadFilterState.startDate = badgeUploadMenuState.dateDraftStartDate;
    badgeUploadFilterState.endDate = badgeUploadMenuState.dateDraftEndDate;
    badgeUploadSelectedDate = getLatestBadgeUploadDate(getCompletedBadgeUploadRecords(), badgeUploadFilterState.endDate);
    badgeUploadDailyPaginationState.page = 1;
    badgeUploadModalPaginationState.page = 1;
    badgeUploadMenuState.openMenu = null;
    renderBadgeUploadFilters();
    renderBadgeUploads();
    return;
  }

  if (event.target.closest('[data-badge-upload-filter-reset]')) {
    resetBadgeUploadDateRange();
    badgeUploadMenuState.openMenu = null;
    badgeUploadMenuState.activeDateField = 'startDate';
    badgeUploadDailyPaginationState.page = 1;
    badgeUploadModalPaginationState.page = 1;
    syncBadgeUploadDateDraft();
    renderBadgeUploadFilters();
    if (!badgeUploadDetailModal.hidden) closeModal(badgeUploadDetailModal);
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
    visitPaginationState.page = 1;
    renderVisits();
    showToast('已按当前条件更新到访明细');
    return;
  }

  if (event.target.closest('[data-visit-filter-reset]')) {
    Object.assign(visitFilterState, visitDefaultFilters);
    visitPaginationState.page = 1;
    syncFilterControls('[data-visit-filter]', visitFilterState);
    const advancedSearch = document.querySelector('[data-visit-advanced-search]');
    const advancedToggle = document.querySelector('[data-visit-advanced-toggle]');
    if (advancedSearch) advancedSearch.hidden = true;
    if (advancedToggle) {
      advancedToggle.setAttribute('aria-expanded', 'false');
      advancedToggle.querySelector('span').textContent = '更多查询';
    }
    renderVisits();
    showToast('筛选条件已重置');
    return;
  }

  const visitAdvancedToggle = event.target.closest('[data-visit-advanced-toggle]');
  if (visitAdvancedToggle) {
    const advancedSearch = document.querySelector('[data-visit-advanced-search]');
    const opening = Boolean(advancedSearch?.hidden);
    if (advancedSearch) advancedSearch.hidden = !opening;
    visitAdvancedToggle.setAttribute('aria-expanded', String(opening));
    visitAdvancedToggle.querySelector('span').textContent = opening ? '收起精确查询' : '更多查询';
    return;
  }

  const visitPage = event.target.closest('[data-visit-page]');
  if (visitPage) {
    visitPaginationState.page = Number(visitPage.dataset.visitPage);
    renderVisits();
    return;
  }

  const visitPageAction = event.target.closest('[data-visit-page-action]');
  if (visitPageAction && !visitPageAction.disabled) {
    visitPaginationState.page += visitPageAction.dataset.visitPageAction === 'next' ? 1 : -1;
    renderVisits();
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

  const matchingDrilldown = event.target.closest('[data-matching-drilldown]');
  if (matchingDrilldown) {
    openVisitsFromMatching(matchingDrilldown.dataset.matchingStore || '', '异常需处理');
    return;
  }

  if (event.target.matches('[data-dock-store-search]')) {
    if (dockMenuState.openMenu !== 'store') {
      dockMenuState.openMenu = 'store';
      dockMenuState.storeQuery = '';
      renderDockFilters();
      window.requestAnimationFrame(() => document.querySelector('[data-dock-store-search]')?.focus());
    }
    return;
  }

  if (event.target.closest('[data-dock-store-trigger]')) {
    dockMenuState.openMenu = dockMenuState.openMenu === 'store' ? '' : 'store';
    dockMenuState.storeQuery = '';
    renderDockFilters();
    if (dockMenuState.openMenu === 'store') {
      window.requestAnimationFrame(() => document.querySelector('[data-dock-store-search]')?.focus());
    }
    return;
  }

  const dockStoreOption = event.target.closest('[data-dock-store-option]');
  if (dockStoreOption) {
    dockFilterState.store = dockStoreOption.dataset.dockStoreOption;
    dockMenuState.openMenu = '';
    dockMenuState.storeQuery = '';
    dockPaginationState.page = 1;
    renderDockPage();
    return;
  }

  if (event.target.closest('[data-dock-status-trigger]')) {
    dockMenuState.openMenu = dockMenuState.openMenu === 'status' ? '' : 'status';
    dockMenuState.storeQuery = '';
    renderDockFilters();
    return;
  }

  const dockStatus = event.target.closest('[data-dock-status]');
  if (dockStatus) {
    dockFilterState.status = dockStatus.dataset.dockStatus;
    dockPaginationState.page = 1;
    dockMenuState.openMenu = '';
    renderDockPage();
    return;
  }

  if (event.target.closest('[data-dock-reset]')) {
    Object.assign(dockFilterState, dockDefaultFilters);
    dockMenuState.openMenu = '';
    dockMenuState.storeQuery = '';
    dockPaginationState.page = 1;
    renderDockPage();
    showToast('筛选条件已重置');
    return;
  }

  const dockPage = event.target.closest('[data-dock-page]');
  if (dockPage) {
    dockPaginationState.page = Number(dockPage.dataset.dockPage);
    renderDockDetail();
    return;
  }

  const dockPageAction = event.target.closest('[data-dock-page-action]');
  if (dockPageAction && !dockPageAction.disabled) {
    dockPaginationState.page += dockPageAction.dataset.dockPageAction === 'next' ? 1 : -1;
    renderDockDetail();
    return;
  }

  if (event.target.closest('[data-dock-page-size-trigger]')) {
    event.target.closest('[data-dock-page-size-trigger]').parentElement.querySelector('.page-size-options')?.classList.toggle('open');
    return;
  }

  const dockPageSize = event.target.closest('[data-dock-page-size]');
  if (dockPageSize) {
    dockPaginationState.pageSize = Number(dockPageSize.dataset.dockPageSize);
    dockPaginationState.page = 1;
    renderDockDetail();
    return;
  }

  if (!event.target.closest('[data-dock-menu-root]') && dockMenuState.openMenu) {
    dockMenuState.openMenu = '';
    renderDockFilters();
  }

  if (event.target.closest('[data-badge-reset]')) {
    const drilldownStore = storeDrilldownState.active
      ? storeOverviewRecords.find((item) => item.code === storeDrilldownState.storeCode)
      : null;
    const collapsed = badgeFilterState.collapsed;
    Object.assign(badgeFilterState, badgeDefaultFilters);
    badgeFilterState.collapsed = collapsed;
    if (drilldownStore) {
      badgeFilterState.brand = drilldownStore.brand;
      badgeFilterState.store = drilldownStore.name;
    }
    badgeMenuState.openMenu = '';
    badgePaginationState.page = 1;
    renderBadgePage();
    syncStoreDrilldownHash();
    showToast('筛选条件已重置');
    return;
  }

  if (event.target.closest('[data-badge-toggle]')) {
    badgeFilterState.collapsed = !badgeFilterState.collapsed;
    badgeMenuState.openMenu = '';
    renderBadgeFilters();
    return;
  }

  const badgeFieldSelectTrigger = event.target.closest('[data-badge-field-select-trigger]');
  if (badgeFieldSelectTrigger) {
    const key = badgeFieldSelectTrigger.dataset.badgeFieldSelectTrigger;
    const menuKey = `field:${key}`;
    badgeMenuState.openMenu = badgeMenuState.openMenu === menuKey ? '' : menuKey;
    renderBadgeFilters();
    window.requestAnimationFrame(() => document.querySelector(`[data-badge-field-select-trigger="${key}"]`)?.focus());
    return;
  }

  const badgeFieldSelectValue = event.target.closest('[data-badge-field-select-value]');
  if (badgeFieldSelectValue) {
    applyBadgeFieldSelectValue(badgeFieldSelectValue.dataset.badgeFieldSelectKey, badgeFieldSelectValue.dataset.badgeFieldSelectValue);
    return;
  }

  if (event.target.closest('[data-badge-sync-date-trigger]')) {
    const willOpen = badgeMenuState.openMenu !== 'syncDateTime';
    if (willOpen) syncBadgeSyncDateTimeDraft();
    badgeMenuState.openMenu = willOpen ? 'syncDateTime' : '';
    renderBadgeFilters();
    return;
  }

  const badgeSyncDateField = event.target.closest('[data-badge-sync-date-field]');
  if (badgeSyncDateField) {
    badgeMenuState.activeDateField = badgeSyncDateField.dataset.badgeSyncDateField;
    syncBadgeDateView(badgeMenuState.activeDateField === 'startDate' ? badgeMenuState.dateDraftStartDate : badgeMenuState.dateDraftEndDate);
    renderBadgeFilters();
    return;
  }

  const badgeSyncDateNav = event.target.closest('[data-badge-sync-date-nav]');
  if (badgeSyncDateNav) {
    shiftBadgeDateView(Number(badgeSyncDateNav.dataset.badgeSyncDateNav));
    renderBadgeFilters();
    return;
  }

  const badgeSyncDateValue = event.target.closest('[data-badge-sync-date-value]');
  if (badgeSyncDateValue) {
    applyBadgeDateDraft(badgeMenuState.activeDateField, badgeSyncDateValue.dataset.badgeSyncDateValue);
    renderBadgeFilters();
    return;
  }

  const badgeSyncDateShortcut = event.target.closest('[data-badge-sync-date-shortcut]');
  if (badgeSyncDateShortcut) {
    const endDate = parseStoreDateValue(storeTodayDateValue);
    const startDate = new Date(endDate);
    if (badgeSyncDateShortcut.dataset.badgeSyncDateShortcut === 'last3') startDate.setDate(startDate.getDate() - 2);
    if (badgeSyncDateShortcut.dataset.badgeSyncDateShortcut === 'last7') startDate.setDate(startDate.getDate() - 6);
    badgeMenuState.dateDraftStartDate = formatStoreDateValue(startDate);
    badgeMenuState.dateDraftEndDate = formatStoreDateValue(endDate);
    badgeMenuState.dateDraftStartTime = '00:00';
    badgeMenuState.dateDraftEndTime = '23:59';
    badgeMenuState.activeDateField = 'endDate';
    syncBadgeDateView(badgeMenuState.dateDraftEndDate);
    renderBadgeFilters();
    return;
  }

  if (event.target.closest('[data-badge-sync-date-cancel]')) {
    badgeMenuState.openMenu = '';
    renderBadgeFilters();
    return;
  }

  if (event.target.closest('[data-badge-sync-date-apply]')) {
    const startTime = normalizeBadgeTime(badgeMenuState.dateDraftStartTime, '00:00');
    const endTime = normalizeBadgeTime(badgeMenuState.dateDraftEndTime, '23:59');
    badgeFilterState.syncStart = `${badgeMenuState.dateDraftStartDate}T${startTime}`;
    badgeFilterState.syncEnd = `${badgeMenuState.dateDraftEndDate}T${endTime}`;
    if (badgeFilterState.syncStart > badgeFilterState.syncEnd) badgeFilterState.syncEnd = badgeFilterState.syncStart;
    badgeMenuState.openMenu = '';
    badgePaginationState.page = 1;
    renderBadgePage();
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
      storeOverviewState.organizationSearchQuery = '';
      renderStoreOrganizationMenu();
    }
    closeStoreFilterMenus(nextFilter);
    return;
  }

  const storeOrgPath = event.target.closest('[data-store-org-path]');
  if (storeOrgPath) {
    storeOverviewState.organizationDraft = storeOrgPath.dataset.storeOrgPath;
    if (storeOrgPath.dataset.storeOrgLevel === 'advisor') {
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

  const storeOrgDimension = event.target.closest('[data-store-org-dimension]');
  if (storeOrgDimension) {
    const nextDimension = storeOrgDimension.dataset.storeOrgDimension || 'region';
    if (storeOverviewState.organizationDimension !== nextDimension) {
      storeOverviewState.organizationDimension = nextDimension;
      storeOverviewState.organization = '全部组织';
      storeOverviewState.organizationDraft = '全部组织';
      storeOverviewState.organizationSearchQuery = '';
    }
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
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
    const filterKey = storeFilterOption.dataset.storeFilterOption;
    const nextValue = storeFilterOption.dataset.value;
    if (filterKey === 'brand' && storeOverviewState.brand !== nextValue) {
      storeOverviewState.organization = '全部组织';
      storeOverviewState.organizationDraft = '全部组织';
      storeOverviewState.organizationSearchQuery = '';
    }
    storeOverviewState[filterKey] = nextValue;
    storeOverviewState.page = 1;
    closeStoreFilterMenus();
    renderStoreOverview();
    return;
  }

  if (event.target.closest('[data-store-filter-reset]')) {
    storeOverviewState.brand = '全部';
    storeOverviewState.organizationDimension = 'region';
    storeOverviewState.organization = '全部组织';
    storeOverviewState.organizationDraft = '全部组织';
    storeOverviewState.organizationSearchQuery = '';
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
    const store = storeOverviewRecords.find((item) => item.code === storeDrilldown.dataset.storeCode)
      || storeOverviewRecords.find((item) => item.name === storeDrilldown.dataset.storeName);
    applyStoreDrilldown(store, { captureReturnState: true });
    setRoute('store-badges');
    return;
  }

  if (!event.target.closest('[data-store-filter-root]')) closeStoreFilterMenus();

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'import') {
    resetVisitImport();
    openModal(importModal);
  }
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
  if (event.target.matches('[data-dock-page-jump]')) {
    const totalPages = Math.max(1, Math.ceil(getFilteredDockRecords().length / dockPaginationState.pageSize));
    dockPaginationState.page = Math.min(totalPages, Math.max(1, Number(event.target.value) || 1));
    renderDockDetail();
    return;
  }
  if (event.target.matches('[data-badge-record-page-jump]')) {
    const key = event.target.dataset.badgeRecordPageJump;
    const state = getBadgeRecordPaginationState(key);
    const totalItems = key === 'daily'
      ? getBadgeUploadDateRange(badgeUploadFilterState.startDate, badgeUploadFilterState.endDate).length
      : badgeUploadModalState.records.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
    state.page = Math.min(totalPages, Math.max(1, Number(event.target.value) || 1));
    if (key === 'modal') renderBadgeUploadModal();
    else renderBadgeUploads();
    return;
  }
  if (event.target.matches('[data-visit-page-size]')) {
    visitPaginationState.pageSize = Number(event.target.value);
    visitPaginationState.page = 1;
    renderVisits();
    return;
  }
  if (event.target.matches('[data-visit-page-jump]')) {
    const totalPages = Math.max(1, Math.ceil(getFilteredVisitRecords().length / visitPaginationState.pageSize));
    visitPaginationState.page = Math.min(totalPages, Math.max(1, Number(event.target.value) || 1));
    renderVisits();
    return;
  }
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

function syncDockStoreSearchInput(input) {
  const value = input.value;
  const cursorStart = input.selectionStart ?? value.length;
  const cursorEnd = input.selectionEnd ?? value.length;
  dockMenuState.storeQuery = value;
  renderDockFilters();
  window.requestAnimationFrame(() => {
    const nextInput = document.querySelector('[data-dock-store-search]');
    nextInput?.focus();
    nextInput?.setSelectionRange(cursorStart, cursorEnd);
  });
}

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-store-org-search]') && !event.isComposing) {
    const value = event.target.value || '';
    storeOverviewState.organizationSearchQuery = value;
    renderStoreOrganizationMenu();
    closeStoreFilterMenus('organization');
    requestAnimationFrame(() => {
      const input = document.querySelector('[data-store-org-search]');
      input?.focus();
      input?.setSelectionRange(value.length, value.length);
    });
    return;
  }
  if (event.target.matches('[data-store-name-search]') && !event.isComposing) {
    storeOverviewState.storeNameQuery = event.target.value;
    storeOverviewState.page = 1;
    renderStoreOverview();
    return;
  }
  if (event.target.matches('[data-dock-search]') && !event.isComposing) {
    dockFilterState[event.target.dataset.dockSearch] = event.target.value;
    dockPaginationState.page = 1;
    renderDockDetail();
    return;
  }
  if (event.target.matches('[data-dock-store-search]') && !event.isComposing) {
    syncDockStoreSearchInput(event.target);
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

document.addEventListener('compositionend', (event) => {
  if (!event.target.matches('[data-dock-store-search]')) return;
  syncDockStoreSearchInput(event.target);
});

document.addEventListener('change', (event) => {
  const fieldCheck = event.target.closest('[data-badge-field-settings-check]');
  if (fieldCheck && badgeFieldSettingsDraft) {
    const key = fieldCheck.dataset.badgeFieldSettingsCheck;
    const visibleSet = new Set(badgeFieldSettingsDraft.visible);
    if (fieldCheck.checked) visibleSet.add(key);
    else if (visibleSet.size === 1) {
      fieldCheck.checked = true;
      showToast('至少保留一个字段');
      return;
    } else visibleSet.delete(key);
    badgeFieldSettingsDraft.visible = badgeFieldSettingsDraft.order.filter((fieldKey) => visibleSet.has(fieldKey));
    renderBadgeFieldSettings();
    return;
  }

});

document.addEventListener('input', (event) => {
  const syncTimeInput = event.target.closest('[data-badge-sync-time-input]');
  if (syncTimeInput) {
    if (syncTimeInput.dataset.badgeSyncTimeInput === 'start') badgeMenuState.dateDraftStartTime = syncTimeInput.value;
    else badgeMenuState.dateDraftEndTime = syncTimeInput.value;
    return;
  }
  const rangeInput = event.target.closest('[data-badge-range-key]');
  if (!rangeInput || event.isComposing) return;
  badgeFilterState[rangeInput.dataset.badgeRangeKey] = rangeInput.value;
  badgePaginationState.page = 1;
  renderBadgeDetail();
});

document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const handle = event.target.closest('.badge-field-drag-handle');
  const item = handle?.closest('[data-badge-field-settings-item]');
  if (!item || !badgeFieldSettingsDraft) return;
  event.preventDefault();
  badgeFieldPointerDrag = {
    key: item.dataset.badgeFieldSettingsItem,
    item,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastClientX: event.clientX,
    lastClientY: event.clientY,
    originalOrder: getBadgeFieldSettingsDomOrder(),
    active: false
  };
  handle.setPointerCapture?.(event.pointerId);
});

document.addEventListener('pointermove', (event) => {
  if (!badgeFieldPointerDrag || event.pointerId !== badgeFieldPointerDrag.pointerId || !badgeFieldSettingsDraft) return;
  event.preventDefault();
  const drag = badgeFieldPointerDrag;
  drag.lastClientX = event.clientX;
  drag.lastClientY = event.clientY;
  if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return;
  if (!drag.active) startBadgeFieldPointerDrag(event);
  updateBadgeFieldDragGhostPosition(drag, event.clientX, event.clientY);
  updateBadgeFieldDragTarget(drag, event.clientX, event.clientY);
});

document.addEventListener('pointerup', (event) => {
  if (!badgeFieldPointerDrag || event.pointerId !== badgeFieldPointerDrag.pointerId) return;
  finishBadgeFieldPointerDrag();
});

document.addEventListener('pointercancel', () => {
  cancelBadgeFieldPointerDrag();
});

document.addEventListener('pointerleave', () => {
  if (badgeFieldPointerDrag?.active) cancelBadgeFieldPointerDrag();
});

window.addEventListener('blur', () => cancelBadgeFieldPointerDrag());

document.addEventListener('focusin', (event) => {
  if (!event.target.matches('[data-dock-store-search]') || dockMenuState.openMenu === 'store') return;
  dockMenuState.openMenu = 'store';
  dockMenuState.storeQuery = '';
  renderDockFilters();
  window.requestAnimationFrame(() => document.querySelector('[data-dock-store-search]')?.focus());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && badgeFieldPointerDrag) {
    cancelBadgeFieldPointerDrag();
    return;
  }
  if (event.key === 'Tab' && isBadgeRecordDrawerOpen()) {
    const focusable = getBadgeRecordDrawerFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (event.key === 'Enter' && event.target.matches('[data-badge-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key === 'Enter' && event.target.matches('[data-dock-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key === 'Enter' && event.target.matches('[data-visit-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key === 'Enter' && event.target.matches('[data-store-page-jump]')) {
    event.target.blur();
    return;
  }
  if (event.key !== 'Escape') return;
  if (badgeMenuState.openMenu) {
    badgeMenuState.openMenu = '';
    renderBadgeFilters();
    return;
  }
  if (dockMenuState.openMenu) {
    dockMenuState.openMenu = '';
    renderDockFilters();
    return;
  }
  if (badgeDockEventMenuState.open) {
    badgeDockEventMenuState.open = false;
    renderBadgeDockEventControl();
    return;
  }
  if (badgeDockDateMenuState.open) {
    badgeDockDateMenuState.open = false;
    renderBadgeDockDateControl();
    return;
  }
  if (closeBadgeEventMenus()) return;
  if (closeBadgeUploadMenus()) return;
  closeStoreFilterMenus();
  if (isBadgeRecordDrawerOpen()) closeBadgeRecordDrawer();
  if (visitDrawer.classList.contains('open')) closeDrawer();
  if (!importModal.hidden) closeModal(importModal);
  if (!badgeUploadDetailModal.hidden) closeModal(badgeUploadDetailModal);
  if (!visitEventDetailModal.hidden) closeModal(visitEventDetailModal);
});

let initialRouteState = getRouteState();
if (initialRouteState.route === 'store-badges' && !applyStoreDrilldownFromRoute(initialRouteState.params)) {
  window.location.hash = 'stores';
  initialRouteState = { route: 'stores', params: new URLSearchParams() };
}
setRoute(initialRouteState.route, !window.location.hash);
renderStoreOverview();
renderBadgePage();
renderDockPage();
selectBadgeRecord(badgeRecordState.sn, badgeRecordState.advisorName);
renderVisits();
renderMatchingDashboard();
