/* 真实录音列表：在不改动详情主体假数据的前提下，替换录音列表的演示数据与筛选交互。 */
(function initSessionRealRuntime(global) {
  'use strict';

  var data = global.__SESSION_REAL_RECORDING_DATA;
  if (!data || !Array.isArray(data.rows)) return;

  var dealers = Array.isArray(global.__DEVICE_ORGANIZATION_DEALERS)
    ? global.__DEVICE_ORGANIZATION_DEALERS.slice()
    : [];
  var dealerMap = new Map();
  dealers.forEach(function (dealer) {
    dealerMap.set(String(dealer.brand) + '::' + String(dealer.dealerCode), dealer);
  });

  var scenarioDefinitions = [
    { value: '首触跟进', label: '首触跟进', source: '云外呼' },
    { value: '邀约到店', label: '邀约进店', source: '云外呼' },
    { value: '排程确认', label: '排程确认', source: '云外呼' },
    { value: '销售接待', label: '进店接待', source: '工牌' },
    { value: '试乘试驾', label: '试乘试驾', source: '工牌' }
  ];
  var intentOptions = ['高', '中', '低', '无', '无法判断'];
  var brandOptions = ['传祺', '埃安'];
  var statusOptions = ['已完成', '失败'];
  var sourceTypeOptions = ['实体卡', '虚拟号', '工作号'];
  var sourceOptions = Array.isArray(data.sources) && data.sources.length
    ? data.sources.filter(function (value) { return value && value !== '未知'; })
    : ['云外呼', '工牌'];
  var customerPhoneCache = new Map();

  function text(value) {
    return String(value == null ? '' : value);
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return text(value).trim().toLocaleLowerCase('zh-CN');
  }

  function normalizeDigits(value) {
    return text(value).replace(/\D/g, '');
  }

  function getPersonnelCode(value) {
    var matched = text(value).match(/\|(?:patroler|governor):code:([^|]+)/);
    return matched ? matched[1] : '';
  }

  function getPersonnelMeta(dealer, personnelId) {
    var brand = text(dealer && dealer.brand);
    var code = getPersonnelCode(personnelId);
    return code ? brand + ' · ' + code : brand;
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

  function formatDateTime(value) {
    return text(value).slice(0, 16);
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
      var series = Array.isArray(data.series) ? (data.series[row[13]] || '未知') : '未知';
      var scenario = Array.isArray(data.scenarios) ? (data.scenarios[row[14]] || '') : '';
      var source = Array.isArray(data.sources) ? (data.sources[row[15]] || '未知') : '未知';
      var advisorId = text(advisorTuple[3]);
      var advisorName = text(advisorTuple[2]);
      var advisorPhone = maskPhone(advisorTuple[4]);
      var customerKey = text(customerTuple[0]);
      var customerName = text(customerTuple[1]);
      var status = Number(row[3]) === 1 ? '已完成' : '失败';
      if (status === '失败') series = '—';
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
        customerName: customerName || '—',
        customerNameMasked: maskName(customerName),
        customerPhone: text(customerTuple[2]) || customerPhone(customerKey),
        qualifiedRate: status === '失败' ? '—' : (text(row[11]) || '—'),
        intentLevel: status === '失败' ? '—' : (text(row[12]) || '无法判断'),
        carSeries: series || '未知',
        leadCarSeries: series || '未知',
        scenario: scenario,
        source: source,
        sourceType: inferSourceType(row[0], source),
        endTime: text(row[16])
      };
    });
    return result.sort(function (left, right) {
      var uploadDiff = parseDate(right.uploadTime) - parseDate(left.uploadTime);
      return uploadDiff || compareAudioId(left.audioId, right.audioId);
    });
  }

  var records = hydrateRecords();
  var defaultStartDate = '2026-08-27';
  var defaultEndDate = '2026-09-07';
  var filterKeys = ['brand', 'scenario', 'sourceType', 'intentLevel', 'carSeries', 'leadCarSeries', 'province', 'city', 'store', 'region', 'zone', 'patroler', 'governor', 'advisor', 'customer', 'status'];
  var state = {
    selections: {},
    queries: {
      audioId: '',
      leadId: '',
      advisorPhone: '',
      customerName: '',
      customerPhone: ''
    },
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    dimensionMode: 'organization',
    collapsed: true,
    openMenu: null,
    closingMenu: null,
    menuQueries: {},
    menuOrders: {},
    activeDateField: 'startDate',
    dateDraftStartDate: defaultStartDate,
    dateDraftEndDate: defaultEndDate,
    dateViewYear: Number(defaultStartDate.slice(0, 4)),
    dateViewMonth: Number(defaultStartDate.slice(5, 7)),
    settingsOpen: false,
    refreshBusy: false,
    columnDragging: '',
    page: 1,
    pageSize: 10
  };
  filterKeys.forEach(function (key) { state.selections[key] = []; });
  state.selections.status = ['已完成'];
  var lastRenderedOpenMenu = null;
  var MENU_MOTION_MS = 180;
  var MENU_MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function prefersReducedMotion() {
    return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function showFilterMenu(key) {
    return state.openMenu === key || state.closingMenu === key;
  }

  function closePageSizeMenu() {
    document.querySelectorAll('.session-real-root .page-size-options.open').forEach(function (node) {
      node.classList.remove('open');
    });
    document.querySelectorAll('.session-real-root [data-sr-page-size-trigger].is-open').forEach(function (node) {
      node.classList.remove('is-open');
    });
  }

  function closeFilterMenu(instant) {
    if (!state.openMenu && !state.closingMenu) return;
    if (instant || prefersReducedMotion()) {
      state.openMenu = null;
      state.closingMenu = null;
      return;
    }
    if (state.openMenu) state.closingMenu = state.openMenu;
    state.openMenu = null;
  }

  function openFilterMenu(key) {
    state.closingMenu = null;
    state.openMenu = key;
  }

  function animateFilterMenu(panel, mode) {
    if (!panel) return null;
    var hiddenY = '-8px';
    var from = mode === 'in'
      ? { opacity: 0, transform: 'translateY(' + hiddenY + ')' }
      : { opacity: 1, transform: 'translateY(0px)' };
    var to = mode === 'in'
      ? { opacity: 1, transform: 'translateY(0px)' }
      : { opacity: 0, transform: 'translateY(' + hiddenY + ')' };
    panel.style.pointerEvents = mode === 'out' ? 'none' : '';
    panel.style.opacity = String(from.opacity);
    panel.style.transform = from.transform;
    panel.getBoundingClientRect();
    return panel.animate([from, to], {
      duration: MENU_MOTION_MS,
      easing: MENU_MOTION_EASE,
      fill: 'forwards'
    });
  }

  var columns = [
    { key: 'audioId', label: '录音ID', width: 22 },
    { key: 'brand', label: '品牌', width: 10 },
    { key: 'startTime', label: '录音开始时间', width: 20 },
    { key: 'uploadTime', label: '录音上传时间', width: 20 },
    { key: 'status', label: '分析结果', width: 12 },
    { key: 'duration', label: '录音时长', width: 12 },
    { key: 'province', label: '省份', width: 12 },
    { key: 'city', label: '城市', width: 12 },
    { key: 'dealerCode', label: '店代码', width: 14 },
    { key: 'store', label: '门店', width: 20 },
    { key: 'region', label: '大区', width: 16 },
    { key: 'zone', label: '战区', width: 16 },
    { key: 'patrolerCode', label: '巡回员code', width: 16 },
    { key: 'patroler', label: '巡回员', width: 14 },
    { key: 'governor', label: '治理员', width: 14 },
    { key: 'advisorId', label: '顾问ID', width: 20 },
    { key: 'advisorName', label: '顾问姓名', width: 14 },
    { key: 'advisorPhone', label: '顾问号码', width: 16 },
    { key: 'leadId', label: '线索ID', width: 22 },
    { key: 'customerName', label: '客户姓名', width: 14 },
    { key: 'customerPhone', label: '客户号码', width: 16 },
    { key: 'qualifiedRate', label: '话术命中率', width: 14 },
    { key: 'intentLevel', label: 'AI意向等级', width: 14 },
    { key: 'carSeries', label: '意向车系', width: 20 },
    { key: 'scenario', label: '质检场景', width: 16 },
    { key: 'source', label: '数据来源', width: 14 }
  ];

  function createDefaultColumnSettings() {
    return { order: columns.map(function (column) { return column.key; }), hidden: [] };
  }

  function readColumnSettings() {
    var fallback = createDefaultColumnSettings();
    try {
      var raw = global.localStorage && global.localStorage.getItem('aiqc-session-real-columns');
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.order)) return fallback;
      var known = new Set(columns.map(function (column) { return column.key; }));
      var order = parsed.order.filter(function (key) { return known.has(key); });
      if (!order.includes('patrolerCode')) {
        var patrolerIndex = order.indexOf('patroler');
        order.splice(patrolerIndex < 0 ? order.length : patrolerIndex, 0, 'patrolerCode');
      }
      columns.forEach(function (column) {
        if (!order.includes(column.key)) order.push(column.key);
      });
      return { order: order, hidden: Array.isArray(parsed.hidden) ? parsed.hidden.filter(function (key) { return known.has(key); }) : [] };
    } catch (error) {
      return fallback;
    }
  }

  var columnSettings = readColumnSettings();
  var columnSettingsDraft = null;

  function cloneColumnSettings(settings) {
    return { order: settings.order.slice(), hidden: settings.hidden.slice() };
  }

  function getWorkingColumnSettings() {
    return columnSettingsDraft || columnSettings;
  }

  function persistColumnSettings() {
    try {
      global.localStorage.setItem('aiqc-session-real-columns', JSON.stringify(columnSettings));
    } catch (error) {
      /* file:// 环境可能禁用 storage，页面状态仍在本次打开期间保留。 */
    }
  }

  function visibleColumns() {
    return columnSettings.order
      .map(function (key) { return columns.find(function (column) { return column.key === key; }); })
      .filter(function (column) { return column && !columnSettings.hidden.includes(column.key); });
  }

  function isColumnVisible(key) {
    return !columnSettings.hidden.includes(key);
  }

  function getColumn(key) {
    return columns.find(function (column) { return column.key === key; });
  }

  function selected(key) {
    return state.selections[key] || [];
  }

  function hasSelection(key, value) {
    return selected(key).includes(value);
  }

  function matchesSelection(key, value, selections) {
    var values = selections || selected(key);
    return !values.length || values.includes(value);
  }

  function dealerMatches(dealer, options) {
    var ignore = options && options.ignore;
    if ((!ignore || ignore !== 'brand') && !matchesSelection('brand', dealer.brand)) return false;
    if ((!ignore || ignore !== 'province') && !matchesSelection('province', dealer.province)) return false;
    if ((!ignore || ignore !== 'city') && !matchesSelection('city', dealer.city)) return false;
    if ((!ignore || ignore !== 'store') && !matchesSelection('store', dealer.brand + '::' + dealer.dealerCode)) return false;
    if ((!ignore || ignore !== 'region') && !matchesSelection('region', dealer.area)) return false;
    if ((!ignore || ignore !== 'zone') && !matchesSelection('zone', dealer.zone)) return false;
    if ((!ignore || ignore !== 'patroler') && !matchesSelection('patroler', dealer.patrolerId || dealer.patroler || '')) return false;
    if ((!ignore || ignore !== 'governor') && !matchesSelection('governor', dealer.governorId || dealer.governor || '')) return false;
    return true;
  }

  var dealerCandidateDependencies = {
    brand: [],
    region: ['brand'],
    zone: ['brand', 'region'],
    patroler: ['brand'],
    province: ['brand'],
    city: ['brand', 'province'],
    governor: ['brand'],
    store: ['brand', 'region', 'zone', 'patroler', 'province', 'city', 'governor']
  };

  function dealerMatchesDependencies(dealer, key) {
    var dependencies = dealerCandidateDependencies[key] || [];
    return dependencies.every(function (dependency) {
      if (dependency === 'brand') return matchesSelection('brand', dealer.brand);
      if (dependency === 'region') return matchesSelection('region', dealer.area);
      if (dependency === 'province') return matchesSelection('province', dealer.province);
      if (dependency === 'patroler') return matchesSelection('patroler', dealer.patrolerId || dealer.patroler || '');
      if (dependency === 'governor') return matchesSelection('governor', dealer.governorId || dealer.governor || '');
      if (dependency === 'zone') return matchesSelection('zone', dealer.zone);
      if (dependency === 'city') return matchesSelection('city', dealer.city);
      return true;
    });
  }

  function carSeriesOptionValue(brand, series) {
    return text(brand) + '::' + text(series);
  }

  function matchesCarSeries(record) {
    var values = selected('carSeries');
    if (!values.length) return true;
    return values.some(function (value) {
      return value === record.carSeries || value === carSeriesOptionValue(record.brand, record.carSeries);
    });
  }

  function matchesLeadCarSeries(record) {
    var values = selected('leadCarSeries');
    if (!values.length) return true;
    return values.some(function (value) {
      return value === record.leadCarSeries || value === carSeriesOptionValue(record.brand, record.leadCarSeries);
    });
  }

  function recordMatches(record, options) {
    var ignore = options && options.ignore;
    if ((!ignore || ignore !== 'brand') && !matchesSelection('brand', record.brand)) return false;
    if ((!ignore || ignore !== 'scenario') && !matchesSelection('scenario', record.scenario)) return false;
    if ((!ignore || ignore !== 'sourceType') && !matchesSelection('sourceType', record.sourceType)) return false;
    if ((!ignore || ignore !== 'intentLevel') && !matchesSelection('intentLevel', record.intentLevel)) return false;
    if ((!ignore || ignore !== 'carSeries') && !matchesCarSeries(record)) return false;
    if ((!ignore || ignore !== 'leadCarSeries') && !matchesLeadCarSeries(record)) return false;
    if (!dealerMatches(record.dealer, { ignore: ignore && ['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor'].includes(ignore) ? ignore : undefined })) return false;
    if ((!ignore || ignore !== 'advisor') && !matchesSelection('advisor', record.advisorId)) return false;
    if ((!ignore || ignore !== 'customer') && !matchesSelection('customer', record.leadId)) return false;
    if ((!ignore || ignore !== 'status') && !matchesSelection('status', record.status)) return false;
    if (!options || !options.ignoreDate) {
      var recordDate = text(record.startTime).slice(0, 10);
      if (state.startDate && recordDate < state.startDate) return false;
      if (state.endDate && recordDate > state.endDate) return false;
    }
    if (!options || !options.ignoreQueries) {
      var audioIdQuery = normalize(state.queries.audioId);
      var leadQuery = normalize(state.queries.leadId);
      var advisorPhoneQuery = normalizeDigits(state.queries.advisorPhone);
      var customerNameQuery = normalize(state.queries.customerName);
      var customerPhoneQuery = normalizeDigits(state.queries.customerPhone);
      if (audioIdQuery && !normalize(record.audioId).includes(audioIdQuery)) return false;
      if (leadQuery && !normalize(record.leadId).includes(leadQuery)) return false;
      if (advisorPhoneQuery && !normalizeDigits(record.advisorPhone).includes(advisorPhoneQuery)) return false;
      if (customerNameQuery && !normalize(record.customerName).includes(customerNameQuery) && !normalize(record.customerNameMasked).includes(customerNameQuery)) return false;
      if (customerPhoneQuery && !normalizeDigits(record.customerPhone).includes(customerPhoneQuery)) return false;
    }
    return true;
  }

  function getFilteredRecords(options) {
    return records.filter(function (record) { return recordMatches(record, options); });
  }

  function uniqueOptions(values) {
    var seen = new Set();
    return values.filter(function (item) {
      var value = text(item.value);
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  function sortOptions(options, key) {
    var order = state.menuOrders[key];
    if (!Array.isArray(order) || state.openMenu !== key) return options;
    var rank = new Map(order.map(function (value, index) { return [value, index]; }));
    return options.slice().sort(function (left, right) {
      var leftRank = rank.has(left.value) ? rank.get(left.value) : order.length + 1;
      var rightRank = rank.has(right.value) ? rank.get(right.value) : order.length + 1;
      return leftRank - rightRank;
    });
  }

  function dealerOptionsFor(key) {
    var list = dealers.filter(function (dealer) { return dealerMatchesDependencies(dealer, key); });
    var options = [];
    if (key === 'province') {
      options = list.map(function (dealer) { return { value: dealer.province, label: dealer.province }; });
    } else if (key === 'city') {
      options = list.map(function (dealer) { return { value: dealer.city, label: dealer.city }; });
    } else if (key === 'store') {
      options = list.map(function (dealer) {
        return { value: dealer.brand + '::' + dealer.dealerCode, label: dealer.dealerName, meta: dealer.dealerCode };
      });
    } else if (key === 'region') {
      options = list.map(function (dealer) { return { value: dealer.area, label: dealer.area }; });
    } else if (key === 'zone') {
      options = list.map(function (dealer) { return { value: dealer.zone, label: dealer.zone }; });
    } else if (key === 'patroler') {
      options = list.filter(function (dealer) { return dealer.patroler; }).map(function (dealer) {
        var code = getPersonnelCode(dealer.patrolerId);
        return {
          value: dealer.patrolerId || dealer.patroler,
          label: dealer.patroler,
          meta: text(dealer.brand) + ' · ' + (code || '-'),
          search: dealer.brand
        };
      });
    } else if (key === 'governor') {
      options = list.filter(function (dealer) { return dealer.governor; }).map(function (dealer) {
        return { value: dealer.governorId || dealer.governor, label: dealer.governor, meta: getPersonnelMeta(dealer, dealer.governorId) };
      });
    }
    return uniqueOptions(options);
  }

  function advisorOptions() {
    var map = new Map();
    records.filter(function (record) {
      return dealerMatches(record.dealer, { ignore: 'advisor' });
    }).forEach(function (record) {
      if (!record.advisorId || record.advisorId === '—') return;
      if (!map.has(record.advisorId)) {
        map.set(record.advisorId, {
          value: record.advisorId,
          label: record.advisorName,
          phones: new Set(),
          stores: new Set()
        });
      }
      if (record.advisorPhone && record.advisorPhone !== '—') map.get(record.advisorId).phones.add(record.advisorPhone);
      if (record.store && record.store !== '—') map.get(record.advisorId).stores.add(record.store);
    });
    return Array.from(map.values()).map(function (option) {
      var phones = Array.from(option.phones);
      var stores = Array.from(option.stores);
      return {
        value: option.value,
        label: option.label,
        meta: stores.length ? stores.join('、') : '—',
        submeta: option.value + ' · ' + (phones.length ? phones.join('、') : '—'),
        search: option.label + ' ' + option.value + ' ' + phones.join(' '),
        searchDigits: phones.map(normalizeDigits).join(' ')
      };
    }).sort(function (left, right) {
      return left.label.localeCompare(right.label, 'zh-CN') || left.value.localeCompare(right.value, 'zh-CN');
    });
  }

  function customerOptions() {
    var map = new Map();
    records.filter(function (record) {
      return recordMatches(record, { ignore: 'customer', ignoreQueries: true });
    }).forEach(function (record) {
      if (!record.leadId || record.leadId === '—') return;
      if (!map.has(record.leadId)) {
        map.set(record.leadId, {
          value: record.leadId,
          label: record.customerName || '—',
          phones: new Set(),
          stores: new Set()
        });
      }
      if (record.customerPhone && record.customerPhone !== '—') map.get(record.leadId).phones.add(record.customerPhone);
      if (record.store && record.store !== '—') map.get(record.leadId).stores.add(record.store);
    });
    return Array.from(map.values()).map(function (option) {
      var phones = Array.from(option.phones);
      var stores = Array.from(option.stores);
      return {
        value: option.value,
        label: option.label,
        meta: (stores.length ? stores.join('、') : '—') + ' · ' + option.value + ' · ' + (phones.length ? phones.join('、') : '—'),
        search: option.label + ' ' + option.value + ' ' + phones.join(' '),
        searchDigits: phones.map(normalizeDigits).join(' ')
      };
    }).sort(function (left, right) {
      return left.label.localeCompare(right.label, 'zh-CN') || left.value.localeCompare(right.value, 'zh-CN');
    });
  }

  function scenarioOptions() {
    return scenarioDefinitions.map(function (item) {
      return { value: item.value, label: item.label, meta: item.source };
    });
  }

  function currentValueOptions(key) {
    if (key === 'brand') return brandOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'scenario') return scenarioOptions();
    if (key === 'sourceType') return sourceTypeOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'intentLevel') return intentOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'status') return statusOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'advisor') return advisorOptions();
    if (key === 'customer') return customerOptions();
    if (['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor'].includes(key)) return dealerOptionsFor(key);
    if (key === 'carSeries' || key === 'leadCarSeries') {
      var selectedBrands = selected('brand');
      var brands = selectedBrands.length ? selectedBrands : brandOptions;
      var seriesOptions = [];
      brands.forEach(function (brand) {
        var seriesSet = new Set(records.filter(function (record) {
          return record.brand === brand && record[key] !== '—';
        }).map(function (record) { return record[key]; }));
        Array.from(seriesSet).sort(function (left, right) { return left.localeCompare(right, 'zh-CN'); }).forEach(function (series) {
          seriesOptions.push({
            value: carSeriesOptionValue(brand, series),
            label: series,
            meta: brand,
            search: brand + ' ' + series
          });
        });
      });
      return seriesOptions;
    }
    return [];
  }

  function getFilterLabel(key) {
    var labels = {
      brand: '品牌',
      scenario: '质检场景',
      source: '数据来源',
      sourceType: '数据来源类型',
      intentLevel: 'AI意向等级',
      carSeries: 'AI意向车系',
      leadCarSeries: '线索车系',
      province: '省份',
      city: '城市',
      store: '门店',
      region: '大区',
      zone: '战区',
      patroler: '巡回员',
      governor: '治理员',
      advisor: '顾问',
      customer: '客户',
      status: '分析结果'
    };
    return labels[key] || key;
  }

  function getSelectionText(key) {
    var values = selected(key);
    if (!values.length) return '请选择' + getFilterLabel(key);
    if (key === 'scenario') {
      var allScenarioValues = scenarioDefinitions.map(function (item) { return item.value; });
      if (allScenarioValues.every(function (value) { return values.includes(value); })) return '全部';
      var selectedSources = sourceOptions.filter(function (source) {
        var sourceValues = scenarioDefinitions.filter(function (item) { return item.source === source; }).map(function (item) { return item.value; });
        return sourceValues.length && sourceValues.every(function (value) { return values.includes(value); });
      });
      if (selectedSources.length === 1 && values.length === scenarioDefinitions.filter(function (item) { return item.source === selectedSources[0]; }).length) {
        return selectedSources[0];
      }
    }
    var options = currentValueOptions(key);
    var labels = values.map(function (value) {
      var option = options.find(function (item) { return item.value === value; });
      return option ? option.label : value;
    });
    return labels.join('、');
  }

  function filterOptions(key) {
    var query = normalize(state.menuQueries[key]);
    var queryDigits = normalizeDigits(state.menuQueries[key]);
    var options = currentValueOptions(key);
    if (!query) return sortOptions(options, key);
    return options.filter(function (option) {
      var textMatched = normalize(option.label + ' ' + (option.meta || '') + ' ' + (option.submeta || '') + ' ' + (option.search || '')).includes(query);
      var phoneMatched = ['advisor', 'customer'].includes(key) && queryDigits && text(option.searchDigits).includes(queryDigits);
      return textMatched || phoneMatched;
    });
  }

  function renderOptionMenu(key) {
    var options = filterOptions(key);
    var values = selected(key);
    var selectedCurrentCount = options.filter(function (option) { return values.includes(option.value); }).length;
    var allActive = options.length > 0 && selectedCurrentCount === options.length;
    var partiallyActive = selectedCurrentCount > 0 && !allActive;
    var renderOption = function (option) {
      var active = values.includes(option.value);
      return '<button type="button" class="badge-advisor-option' + (active ? ' is-selected' : '') + '" role="option" aria-selected="' + active + '" data-sr-option-key="' + escapeHtml(key) + '" data-sr-option-value="' + escapeHtml(option.value) + '">' +
        '<span class="badge-advisor-option-check" aria-hidden="true">' + (active ? '✓' : '') + '</span>' +
        '<span class="badge-advisor-option-copy"><strong>' + escapeHtml(option.label) + '</strong>' + (option.meta && key !== 'scenario' ? '<small>' + escapeHtml(option.meta) + '</small>' : '') + (option.submeta ? '<small>' + escapeHtml(option.submeta) + '</small>' : '') + '</span></button>';
    };
    var optionMarkup = options.length ? (key === 'scenario'
      ? sourceOptions.map(function (source) {
          var group = options.filter(function (option) { return option.meta === source; });
          if (!group.length) return '';
          var sourceValues = scenarioDefinitions.filter(function (item) { return item.source === source; }).map(function (item) { return item.value; });
          var selectedCount = sourceValues.filter(function (value) { return values.includes(value); }).length;
          var groupActive = selectedCount === sourceValues.length;
          var groupPartial = selectedCount > 0 && !groupActive;
          return '<div class="sr-menu-group sr-scenario-source-group"><button type="button" class="sr-scenario-group-select' + (groupActive ? ' is-selected' : '') + (groupPartial ? ' is-partial' : '') + '" data-sr-scenario-group="' + escapeHtml(source) + '" aria-pressed="' + groupActive + '"><span class="badge-advisor-option-check" aria-hidden="true">' + (groupActive ? '✓' : '') + '</span><strong>' + escapeHtml(source) + '</strong><small>全选 · ' + sourceValues.length + ' 项</small></button>' + group.map(renderOption).join('') + '</div>';
        }).join('')
      : key === 'carSeries' || key === 'leadCarSeries'
      ? ['传祺', '埃安'].map(function (brand) {
          var group = options.filter(function (option) { return option.meta === brand; });
          return group.length ? '<div class="sr-menu-group"><div class="sr-menu-group-label">' + escapeHtml(brand) + '</div>' + group.map(renderOption).join('') + '</div>' : '';
        }).join('') : options.map(renderOption).join('')) : '<div class="badge-advisor-empty">未找到匹配' + escapeHtml(getFilterLabel(key)) + '</div>';
    var placeholder = key === 'store' ? '输入店名或店代码' : key === 'advisor' ? '输入顾问姓名、ID或手机号' : key === 'customer' ? '输入客户姓名、线索ID或手机号' : '搜索' + getFilterLabel(key);
    return '<div class="session-menu-panel badge-advisor-menu" data-sr-menu="' + escapeHtml(key) + '" role="dialog" aria-label="' + escapeHtml(getFilterLabel(key)) + '筛选">' +
      '<label class="badge-advisor-search"><span aria-hidden="true"></span><input type="search" data-sr-menu-search="' + escapeHtml(key) + '" value="' + escapeHtml(state.menuQueries[key] || '') + '" placeholder="' + escapeHtml(placeholder) + '" autocomplete="off"></label>' +
      '<button type="button" class="badge-advisor-select-all' + (allActive ? ' is-selected' : '') + (partiallyActive ? ' is-partial' : '') + '" data-sr-select-all="' + escapeHtml(key) + '" aria-pressed="' + allActive + '"' + (options.length ? '' : ' disabled') + '><span class="badge-advisor-option-check" aria-hidden="true">' + (allActive ? '✓' : '') + '</span><span>全选</span><strong>共 ' + options.length + ' 条数据</strong></button>' +
      '<div class="badge-advisor-options" data-sr-menu-options="' + escapeHtml(key) + '" role="listbox" aria-label="' + escapeHtml(getFilterLabel(key)) + '候选" aria-multiselectable="true">' + optionMarkup + '</div></div>';
  }

  function renderFilterControl(key) {
    var open = state.openMenu === key;
    var label = getFilterLabel(key);
    var placeholder = selected(key).length === 0;
    return '<div class="badge-field-filter badge-field-filter-select session-toolbar-menu' + (open ? ' is-open' : '') + '" data-sr-control="' + escapeHtml(key) + '">' +
      '<span>' + escapeHtml(label) + '</span>' +
      '<button type="button" class="session-select-trigger' + (open ? ' active' : '') + '" data-sr-trigger="' + escapeHtml(key) + '" aria-label="' + escapeHtml(label) + '筛选" aria-haspopup="listbox" aria-expanded="' + open + '">' +
        '<strong class="' + (placeholder ? 'is-placeholder' : '') + '">' + escapeHtml(getSelectionText(key)) + '</strong><i class="session-select-caret" aria-hidden="true"></i></button>' +
      (showFilterMenu(key) ? renderOptionMenu(key) : '') + '</div>';
  }

  function renderTextControl(key, label, placeholder) {
    return '<label class="badge-field-filter"><span>' + escapeHtml(label) + '</span>' +
      '<input type="search" data-sr-query="' + escapeHtml(key) + '" value="' + escapeHtml(state.queries[key] || '') + '" placeholder="' + escapeHtml(placeholder || ('请输入' + label)) + '" autocomplete="off"></label>';
  }

  function formatSessionDateDisplay(value) {
    if (!value) return '不限';
    var parts = value.split('-');
    return parts.join('/');
  }

  function parseSessionDateValue(value) {
    if (!value) return null;
    var parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(function (part) { return !Number.isFinite(part); })) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatSessionDateValue(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function getSessionDateCells(year, month) {
    var cells = [];
    var firstDay = new Date(year, month - 1, 1);
    var lastDate = new Date(year, month, 0).getDate();
    var leadingSlots = (firstDay.getDay() + 6) % 7;
    for (var index = 0; index < leadingSlots; index += 1) cells.push(null);
    for (var day = 1; day <= lastDate; day += 1) cells.push(new Date(year, month - 1, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function shiftSessionDateView(offset) {
    var nextYear = state.dateViewYear;
    var nextMonth = state.dateViewMonth + Number(offset || 0);
    while (nextMonth < 1) { nextMonth += 12; nextYear -= 1; }
    while (nextMonth > 12) { nextMonth -= 12; nextYear += 1; }
    state.dateViewYear = nextYear;
    state.dateViewMonth = nextMonth;
  }

  function syncSessionDateView(value) {
    var date = parseSessionDateValue(value);
    if (!date) return;
    state.dateViewYear = date.getFullYear();
    state.dateViewMonth = date.getMonth() + 1;
  }

  function applySessionDateDraft(field, value) {
    if (field === 'startDate') {
      state.dateDraftStartDate = value;
      if (!state.dateDraftEndDate || state.dateDraftEndDate < value) state.dateDraftEndDate = value;
      state.activeDateField = 'endDate';
      syncSessionDateView(state.dateDraftEndDate);
      return;
    }
    state.dateDraftEndDate = value;
    if (!state.dateDraftStartDate || state.dateDraftStartDate > value) state.dateDraftStartDate = value;
  }

  function getSessionDateRangeText(startDate, endDate) {
    return formatSessionDateDisplay(startDate) + ' 至 ' + formatSessionDateDisplay(endDate);
  }

  function renderSessionDateMenu() {
    var startDate = state.dateDraftStartDate;
    var endDate = state.dateDraftEndDate;
    var todayValue = formatSessionDateValue(new Date());
    var cells = getSessionDateCells(state.dateViewYear, state.dateViewMonth);
    return '<div class="session-menu-panel session-menu-panel-date" data-sr-date-panel>' +
      '<div class="session-date-panel-head"><div class="session-date-panel-copy"><span>录音开始时间范围</span><strong>' + escapeHtml(getSessionDateRangeText(startDate, endDate)) + '</strong></div>' +
        '<div class="session-date-nav"><button type="button" class="session-date-nav-btn" data-sr-date-nav="-1" aria-label="上一个月"><i class="session-date-nav-arrow prev" aria-hidden="true"></i></button><strong>' + state.dateViewYear + '年' + state.dateViewMonth + '月</strong><button type="button" class="session-date-nav-btn" data-sr-date-nav="1" aria-label="下一个月"><i class="session-date-nav-arrow next" aria-hidden="true"></i></button></div></div>' +
      '<div class="session-date-tabs"><button type="button" class="session-date-tab' + (state.activeDateField === 'startDate' ? ' active' : '') + '" data-sr-date-field="startDate"><span>开始日期</span><strong>' + escapeHtml(formatSessionDateDisplay(startDate)) + '</strong></button><button type="button" class="session-date-tab' + (state.activeDateField === 'endDate' ? ' active' : '') + '" data-sr-date-field="endDate"><span>结束日期</span><strong>' + escapeHtml(formatSessionDateDisplay(endDate)) + '</strong></button></div>' +
      '<div class="session-date-weekdays"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>' +
      '<div class="session-date-grid">' + cells.map(function (date) {
        if (!date) return '<span class="session-date-empty" aria-hidden="true"></span>';
        var value = formatSessionDateValue(date);
        var inRange = startDate && endDate && value >= startDate && value <= endDate;
        return '<button type="button" class="session-date-day' + (inRange ? ' in-range' : '') + (value === startDate ? ' is-start' : '') + (value === endDate ? ' is-end' : '') + (value === todayValue ? ' is-today' : '') + '" data-sr-date-value="' + value + '">' + date.getDate() + '</button>';
      }).join('') + '</div>' +
      '<div class="session-date-shortcuts"><button type="button" class="session-date-shortcut" data-sr-date-shortcut="today">今天</button><button type="button" class="session-date-shortcut" data-sr-date-shortcut="last3">近3天</button><button type="button" class="session-date-shortcut" data-sr-date-shortcut="last7">近7天</button></div>' +
      '<div class="session-cascader-footer session-date-footer"><span>' + escapeHtml('已选择 ' + getSessionDateRangeText(startDate, endDate)) + '</span><div class="session-date-actions"><button type="button" class="btn session-date-action-btn" data-sr-date-cancel>取消</button><button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-sr-date-apply>应用日期</button></div></div>' +
    '</div>';
  }

  function renderDateControl() {
    var open = state.openMenu === 'date';
    return '<div class="badge-field-filter badge-field-filter-date-time session-toolbar-menu sr-date-control' + (open ? ' is-open' : '') + '" data-sr-control="date">' +
      '<span>录音开始时间</span>' +
      '<button type="button" class="session-date-trigger' + (open ? ' active' : '') + '" data-sr-trigger="date" aria-label="录音开始时间筛选" aria-haspopup="dialog" aria-expanded="' + (open ? 'true' : 'false') + '"><strong>' + escapeHtml(formatSessionDateDisplay(state.startDate)) + '</strong><em>至</em><strong>' + escapeHtml(formatSessionDateDisplay(state.endDate)) + '</strong><span class="session-date-icon" aria-hidden="true"></span></button>' +
      (showFilterMenu('date') ? renderSessionDateMenu() : '') +
    '</div>';
  }

  function renderDimensionSwitcher() {
    var organizationActive = state.dimensionMode === 'organization';
    var pathItems = organizationActive
      ? ['品牌', '大区', '战区', '门店']
      : ['品牌', '省份', '城市', '门店'];
    var pathHtml = pathItems.map(function (item, index) {
      return (index ? '<i class="session-select-caret badge-filter-dimension-path-arrow" aria-hidden="true"></i>' : '') +
        '<span class="badge-filter-dimension-path-step">' + escapeHtml(item) + '</span>';
    }).join('');
    return '<div class="sr-filter-dimension-bar">' +
      '<div class="sr-filter-dimension-main">' +
        '<div class="sr-filter-dimension-tabs leads-view-tabs" role="tablist" aria-label="录音组织筛选维度">' +
          '<button type="button" class="sr-filter-dimension-tab leads-view-tab' + (organizationActive ? ' active' : '') + '" data-sr-dimension="organization" role="tab" aria-selected="' + organizationActive + '">组织维度</button>' +
          '<button type="button" class="sr-filter-dimension-tab leads-view-tab' + (!organizationActive ? ' active' : '') + '" data-sr-dimension="geography" role="tab" aria-selected="' + !organizationActive + '">地理维度</button>' +
        '</div></div>' +
      '<div class="sr-filter-dimension-path badge-filter-dimension-path">' +
        '<img src="../assets/filter-path-icon.svg" alt="" aria-hidden="true">' +
        '<span class="badge-filter-dimension-path-label">当前路径：</span>' +
        '<strong>' + pathHtml + '</strong>' +
      '</div>' +
    '</div>';
  }

  function renderFilterActions() {
    return '<div class="badge-dynamic-filter-actions"><span></span><div>' +
      '<button type="button" class="btn session-reset-btn" data-sr-reset>重置</button>' +
      '<button type="button" class="session-toggle-text-btn" data-sr-collapse aria-expanded="' + !state.collapsed + '"><span>' + (state.collapsed ? '展开' : '收起') + '</span><svg class="session-toggle-text-btn-icon' + (state.collapsed ? ' is-collapsed' : '') + '" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>' +
    '</div></div>';
  }

  function settleFilterExtra(extraEl, collapsed) {
    if (!extraEl) return;
    extraEl.style.height = collapsed ? '0px' : '';
    extraEl.style.overflow = collapsed ? 'clip' : '';
    extraEl.style.pointerEvents = collapsed ? 'none' : '';
    if (collapsed) extraEl.setAttribute('inert', '');
    else extraEl.removeAttribute('inert');
    extraEl.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
  }

  function renderFilters() {
    var container = document.getElementById('sessionRealFilterControls');
    if (!container) return;
    var extraEl = container.querySelector('[data-sr-extra]');
    var previousExtraHeight = extraEl ? extraEl.getBoundingClientRect().height : 0;
    var collapseChanged = container.childElementCount > 0 &&
      container.classList.contains('is-collapsed') !== state.collapsed;
    var closingInProgress = container._menuAnimation && state.closingMenu && !state.openMenu;
    if (closingInProgress && !collapseChanged) {
      positionFilterMenu();
      return;
    }
    if (container._menuAnimation) {
      container._menuAnimation.cancel();
      container._menuAnimation = null;
    }
    if (container._collapseAnimation) {
      container._collapseAnimation.cancel();
      container._collapseAnimation = null;
    }
    var dimensionKeys = state.dimensionMode === 'geography'
      ? ['brand', 'province', 'city', 'store']
      : ['brand', 'region', 'zone', 'store'];
    var primary = dimensionKeys.filter(isColumnVisible);
    var secondary = [];
    if (isColumnVisible('advisorId') || isColumnVisible('advisorName')) secondary.push('advisor');
    if (isColumnVisible('patrolerCode') || isColumnVisible('patroler')) secondary.push('patroler');
    if (isColumnVisible('governor')) secondary.push('governor');
    if (isColumnVisible('leadId') || isColumnVisible('customerName') || isColumnVisible('customerPhone')) secondary.push('customer');
    secondary.push('scenario', 'sourceType');
    secondary = secondary.concat(['intentLevel', 'carSeries'].filter(isColumnVisible));
    if (isColumnVisible('status')) secondary.push('status');
    secondary.push('leadCarSeries');
    var textControls = [
      { key: 'audioId', label: '录音ID' }
    ].filter(function (field) { return isColumnVisible(field.key); });
    var extraInner = secondary.map(function (key) { return renderFilterControl(key); }).join('') +
      textControls.map(function (field) { return renderTextControl(field.key, field.label); }).join('') +
      (isColumnVisible('startTime') ? renderDateControl() : '');
    var keepExtra = !!extraInner && (!state.collapsed || collapseChanged);
    container.classList.toggle('is-collapsed', state.collapsed);
    container.innerHTML =
      renderDimensionSwitcher() +
      '<div class="sr-filter-primary">' +
        '<div class="badge-dynamic-filter-grid">' +
          primary.map(function (key) { return renderFilterControl(key); }).join('') +
        '</div>' +
        (state.collapsed ? renderFilterActions() : '') +
      '</div>' +
      (keepExtra
        ? '<div class="sr-filter-extra" data-sr-extra><div class="sr-filter-extra-inner"><div class="badge-dynamic-filter-grid">' + extraInner + '</div></div></div>'
        : '') +
      (state.collapsed ? '' : renderFilterActions());
    extraEl = container.querySelector('[data-sr-extra]');
    var reduceMotion = prefersReducedMotion();
    var shouldEnterMenu = !!state.openMenu && state.openMenu !== lastRenderedOpenMenu;
    var shouldExitMenu = !!state.closingMenu && lastRenderedOpenMenu === state.closingMenu;
    lastRenderedOpenMenu = state.openMenu;
    if (extraEl && collapseChanged && !reduceMotion) {
      var fromHeight = previousExtraHeight;
      var toHeight = state.collapsed ? 0 : extraEl.getBoundingClientRect().height;
      extraEl.style.overflow = 'clip';
      extraEl.style.pointerEvents = 'none';
      extraEl.style.height = fromHeight + 'px';
      extraEl.setAttribute('aria-hidden', state.collapsed ? 'true' : 'false');
      if (state.collapsed) extraEl.setAttribute('inert', '');
      else extraEl.removeAttribute('inert');
      extraEl.getBoundingClientRect();
      var animation = extraEl.animate([
        { height: fromHeight + 'px' },
        { height: toHeight + 'px' }
      ], { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
      container._collapseAnimation = animation;
      animation.onfinish = function () {
        if (container._collapseAnimation !== animation) return;
        container._collapseAnimation = null;
        if (typeof animation.commitStyles === 'function') animation.commitStyles();
        animation.cancel();
        settleFilterExtra(extraEl, state.collapsed);
      };
      animation.oncancel = function () {
        if (container._collapseAnimation === animation) container._collapseAnimation = null;
      };
    } else {
      settleFilterExtra(extraEl, state.collapsed);
    }
    positionFilterMenu();
    var panel = container.querySelector('[data-sr-menu], [data-sr-date-panel]');
    if (panel && shouldEnterMenu && !reduceMotion) {
      var enterAnimation = animateFilterMenu(panel, 'in');
      container._menuAnimation = enterAnimation;
      if (enterAnimation) {
        enterAnimation.onfinish = function () {
          if (container._menuAnimation !== enterAnimation) return;
          container._menuAnimation = null;
          if (typeof enterAnimation.commitStyles === 'function') enterAnimation.commitStyles();
          enterAnimation.cancel();
          panel.style.opacity = '';
          panel.style.transform = '';
          panel.style.pointerEvents = '';
        };
        enterAnimation.oncancel = function () {
          if (container._menuAnimation === enterAnimation) container._menuAnimation = null;
        };
      }
    } else if (panel && shouldExitMenu && !reduceMotion) {
      var exitAnimation = animateFilterMenu(panel, 'out');
      container._menuAnimation = exitAnimation;
      if (exitAnimation) {
        exitAnimation.onfinish = function () {
          if (container._menuAnimation !== exitAnimation) return;
          container._menuAnimation = null;
          state.closingMenu = null;
          lastRenderedOpenMenu = null;
          renderFilters();
          bindEvents();
        };
        exitAnimation.oncancel = function () {
          if (container._menuAnimation === exitAnimation) container._menuAnimation = null;
        };
      }
    } else if (panel && shouldExitMenu) {
      state.closingMenu = null;
    }
  }

  function positionFilterMenu() {
    var menu = document.querySelector('#sessionRealFilterControls [data-sr-menu], #sessionRealFilterControls [data-sr-date-panel]');
    if (!menu) return;
    menu.style.left = '0px';
    var bounds = menu.getBoundingClientRect();
    var shift = Math.min(0, global.innerWidth - 24 - bounds.right);
    menu.style.left = Math.max(24 - bounds.left, shift) + 'px';
    if (menu.hasAttribute('data-sr-date-panel')) {
      menu.style.maxHeight = Math.max(240, global.innerHeight - bounds.top - 24) + 'px';
    }
  }

  function cellValue(record, key) {
    var values = {
      audioId: record.audioId,
      brand: record.brand,
      startTime: formatDateTime(record.startTime),
      uploadTime: formatDateTime(record.uploadTime),
      status: record.status,
      duration: record.duration,
      province: record.province,
      city: record.city,
      dealerCode: record.dealerCode,
      store: record.store,
      region: record.region,
      zone: record.zone,
      patrolerCode: record.patrolerCode,
      patroler: record.patroler,
      governor: record.governor,
      advisorId: record.advisorId,
      advisorName: record.advisorName,
      advisorPhone: record.advisorPhone,
      leadId: record.leadId,
      customerName: record.customerNameMasked,
      customerPhone: record.customerPhone,
      qualifiedRate: record.qualifiedRate,
      intentLevel: record.intentLevel,
      carSeries: record.carSeries,
      scenario: record.scenario,
      source: record.source
    };
    return values[key] == null || values[key] === '' ? '—' : values[key];
  }

  function statusClass(value) {
    return value === '已完成' ? 'green' : value === '失败' ? 'red' : 'blue';
  }

  function intentClass(value) {
    return value === '高' ? 'red' : value === '中' ? 'amber' : value === '低' ? 'blue' : 'gray';
  }

  function renderIntentLevelHeader() {
    return '<span class="session-intent-help sr-intent-header-help">' +
      '<span>AI意向等级</span>' +
      '<button type="button" class="session-intent-help-btn" data-sr-intent-help aria-label="查看AI意向等级判定标准" aria-describedby="sessionRealIntentRuleTooltip">?</button>' +
      '<span class="session-intent-rule-tooltip sr-intent-rule-tooltip" id="sessionRealIntentRuleTooltip" role="tooltip">' +
        '<table class="session-intent-rule-table"><thead><tr><th scope="col">等级</th><th scope="col">判定标准</th></tr></thead><tbody>' +
          '<tr><th scope="row">高</th><td>近期购买、问具体配置价格、主动约试驾、询问提车时间</td></tr>' +
          '<tr><th scope="row">中</th><td>有需求但时间未定、对比阶段、需再考虑、已约定跟进</td></tr>' +
          '<tr><th scope="row">低</th><td>仅初步了解、无明确计划、被推销后简单应付、ASR内容杂乱但是能判断想购车（未明确拒绝）</td></tr>' +
          '<tr><th scope="row">无</th><td>明确拒绝、明确表达无意向、已购车</td></tr>' +
          '<tr><th scope="row">无法判断</th><td>无法提取有效信息，AI无法判断，录音为空，客户未实际接通，内容短且无法判断为高中低意向，购车无关场景(如维修售后)</td></tr>' +
        '</tbody></table>' +
      '</span>' +
    '</span>';
  }

  function positionIntentRuleTooltip(button) {
    var tooltip = button && button.parentElement && button.parentElement.querySelector('.sr-intent-rule-tooltip');
    if (!tooltip) return;
    var buttonRect = button.getBoundingClientRect();
    var tooltipWidth = tooltip.offsetWidth;
    var tooltipHeight = tooltip.offsetHeight;
    var edge = 16;
    var gap = 12;
    var left = Math.min(
      Math.max(buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2, edge),
      Math.max(edge, global.innerWidth - tooltipWidth - edge)
    );
    var fitsBelow = buttonRect.bottom + gap + tooltipHeight <= global.innerHeight - edge;
    var top = fitsBelow
      ? buttonRect.bottom + gap
      : Math.max(edge, buttonRect.top - gap - tooltipHeight);
    tooltip.dataset.placement = fitsBelow ? 'bottom' : 'top';
    tooltip.style.setProperty('--sr-intent-tooltip-left', left + 'px');
    tooltip.style.setProperty('--sr-intent-tooltip-top', top + 'px');
    tooltip.style.setProperty('--sr-intent-tooltip-arrow-left', Math.min(Math.max(buttonRect.left + buttonRect.width / 2 - left - 4, 12), tooltipWidth - 20) + 'px');
  }

  function renderTable(recordsForView) {
    var table = document.getElementById('sessionRealTable');
    var total = document.getElementById('sessionRealCount');
    var completed = document.getElementById('sessionRealCompleted');
    var failed = document.getElementById('sessionRealFailed');
    var pagination = document.getElementById('sessionRealPagination');
    if (!table || !total || !completed || !failed) return;
    var visible = visibleColumns();
    var head = table.querySelector('thead');
    var body = table.querySelector('tbody');
    if (!head || !body) return;
    head.innerHTML = '<tr>' + visible.map(function (column) {
      var label = column.key === 'intentLevel' ? renderIntentLevelHeader() : escapeHtml(column.label);
      return '<th data-column-key="' + escapeHtml(column.key) + '">' + label + '</th>';
    }).join('') + '<th class="sr-operation-col">操作</th></tr>';
    total.textContent = String(recordsForView.length);
    completed.textContent = String(recordsForView.filter(function (record) { return record.status === '已完成'; }).length);
    failed.textContent = String(recordsForView.filter(function (record) { return record.status === '失败'; }).length);
    var pageSize = Number(state.pageSize || 10);
    var totalPages = Math.max(1, Math.ceil(recordsForView.length / pageSize));
    if ((state.page || 1) > totalPages) state.page = totalPages;
    var start = ((state.page || 1) - 1) * pageSize;
    var pageRecords = recordsForView.slice(start, start + pageSize);
    var emptyState = document.getElementById('sessionRealEmptyState');
    if (emptyState) emptyState.hidden = recordsForView.length > 0;
    table.closest('.session-list-table-wrap').classList.toggle('is-empty', !recordsForView.length);
    if (!recordsForView.length) {
      body.innerHTML = '';
      if (pagination) renderPagination(pagination, 0, 1);
      bindTableEvents();
      return;
    }
    body.innerHTML = pageRecords.map(function (record) {
      var cells = visible.map(function (column) {
        var value = cellValue(record, column.key);
        if (column.key === 'status') {
          return '<td><span class="status-inline ' + statusClass(value) + '"><span class="status-inline-dot" aria-hidden="true"></span><span>' + escapeHtml(value) + '</span></span></td>';
        }
        if (column.key === 'intentLevel') {
          return '<td><span class="pill-inline ai-intent-pill ' + intentClass(value) + '">' + escapeHtml(value) + '</span></td>';
        }
        if (column.key === 'audioId' || column.key === 'leadId') {
          return '<td><span class="cell-main">' + escapeHtml(value) + '</span></td>';
        }
        return '<td>' + escapeHtml(value) + '</td>';
      }).join('');
      return '<tr data-session-real-row="' + escapeHtml(record.audioId) + '">' + cells +
        '<td class="sr-operation-col"><button type="button" class="table-link" data-sr-detail="' + escapeHtml(record.audioId) + '">查看详情</button></td></tr>';
    }).join('');
    if (pagination) renderPagination(pagination, recordsForView.length, totalPages);
    bindTableEvents();
  }

  function renderPagination(container, totalItems, totalPages) {
    var pageSize = Number(state.pageSize || 10);
    var pages = [];
    var current = state.page || 1;
    if (totalPages <= 7) {
      for (var i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('…');
      for (var page = Math.max(2, current - 1); page <= Math.min(totalPages - 1, current + 1); page += 1) pages.push(page);
      if (current < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    container.innerHTML = '<div class="dashboard-pagination sr-pagination">' +
      '<span class="session-pagination-total">共 ' + totalItems + ' 条</span>' +
      '<div class="dashboard-pagination-controls">' +
        '<div class="custom-select-container page-select page-size-select"><button type="button" class="custom-select-trigger page-size-trigger" data-sr-page-size-trigger><span>' + pageSize + ' 条/页</span><i class="session-select-caret" aria-hidden="true"></i></button><div class="custom-select-options page-size-options">' +
          [10, 20, 50].map(function (size) { return '<button type="button" class="custom-option page-size-option' + (size === pageSize ? ' active' : '') + '" data-sr-page-size="' + size + '">' + size + ' 条/页</button>'; }).join('') +
        '</div></div>' +
        '<div class="page-group"><button type="button" class="page-arrow" data-sr-page-arrow="-1" ' + (current <= 1 ? 'disabled' : '') + '>‹</button>' +
          pages.map(function (item) { return typeof item === 'number' ? '<button type="button" class="page-num ' + (item === current ? 'active' : '') + '" data-sr-page="' + item + '">' + item + '</button>' : '<span class="page-ellipsis">…</span>'; }).join('') +
          '<button type="button" class="page-arrow" data-sr-page-arrow="1" ' + (current >= totalPages ? 'disabled' : '') + '>›</button></div>' +
        '<div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="' + totalPages + '" value="' + current + '" data-sr-page-jump></label><span class="session-page-jump-suffix">页</span></div>' +
      '</div></div>';
  }

  function renderFieldSettings() {
    var host = document.getElementById('sessionRealFieldSettings');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sessionRealFieldSettings';
      document.body.appendChild(host);
    }
    document.body.classList.toggle('sr-settings-open', state.settingsOpen);
    if (!state.settingsOpen) {
      host.innerHTML = '';
      return;
    }
    var scrollTop = host.querySelector('.badge-field-settings-body')?.scrollTop || 0;
    var working = getWorkingColumnSettings();
    var ordered = working.order.map(function (key) { return getColumn(key); }).filter(Boolean);
    var visibleCount = ordered.filter(function (column) { return !working.hidden.includes(column.key); }).length;
    host.innerHTML = '<div class="drawer-backdrop badge-field-settings-backdrop" data-sr-settings-close></div>' +
      '<aside class="drawer detail-drawer badge-field-settings-drawer open sr-settings-panel" role="dialog" aria-modal="true" aria-label="字段设置">' +
        '<div class="drawer-head badge-field-settings-head"><div><h2>字段设置</h2><p>勾选字段并拖动调整列表顺序，指定筛选字段会同步控制筛选项</p></div><button type="button" class="icon-btn" data-sr-settings-close aria-label="关闭字段设置">×</button></div>' +
        '<div class="drawer-body badge-field-settings-body"><div class="badge-field-settings-summary"><span>已选 <strong>' + visibleCount + '</strong> / ' + ordered.length + ' 个字段</span><button type="button" data-sr-settings-select-all>全选</button></div>' +
        '<div class="badge-field-settings-list" aria-label="可配置字段列表">' + ordered.map(function (column) {
          var visible = !working.hidden.includes(column.key);
          return '<div class="badge-field-settings-item' + (visible ? ' is-visible' : '') + '" draggable="true" data-sr-column-item="' + escapeHtml(column.key) + '">' +
            '<span class="badge-field-drag-handle" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '<label><input type="checkbox" data-sr-column-visible="' + escapeHtml(column.key) + '" ' + (visible ? 'checked' : '') + '><span>' + escapeHtml(column.label) + '</span></label>' +
            '<small>' + (visible ? '已显示' : '已隐藏') + '</small></div>';
        }).join('') + '</div></div>' +
        '<div class="badge-field-settings-footer"><button type="button" class="btn ghost" data-sr-settings-restore>恢复默认</button><div><button type="button" class="btn ghost" data-sr-settings-close>取消</button><button type="button" class="btn primary" data-sr-settings-save>保存设置</button></div></div></aside>';
    host.querySelector('.badge-field-settings-body').scrollTop = scrollTop;
  }

  function renderShell() {
    var pageHost = document.getElementById('pageHost');
    if (!pageHost || getCurrentRoute() !== 'session') return;
    pageHost.innerHTML =
      '<div class="page-stack session-real-root">' +
        '<section class="card session-filter-card badge-session-filter-card sr-filter-card"><div id="sessionRealFilterControls"></div></section>' +
        '<section class="card table-card badge-detail-table-card sr-table-card"><div class="table-shell">' +
          '<div class="table-headbar session-list-table-headbar sr-table-headbar">' +
            '<div class="panel-title"><h3>录音总览</h3></div>' +
            '<div class="badge-detail-table-head-tools"><div class="session-filter-summary"><span>当前匹配 <strong id="sessionRealCount">0</strong> 条录音</span><span class="leads-stage-summary"><span class="leads-stage-summary-icon status-completed" aria-hidden="true"></span><span>已完成 <strong id="sessionRealCompleted">0</strong> 条</span></span><span class="leads-stage-summary"><span class="leads-stage-summary-icon status-failed" aria-hidden="true"></span><span>失败 <strong id="sessionRealFailed">0</strong> 条</span></span></div>' +
            '<i class="badge-detail-table-divider" aria-hidden="true"></i><div class="badge-detail-table-actions"><button type="button" class="btn ghost badge-detail-table-action badge-detail-refresh-btn" data-sr-refresh aria-busy="false"><span class="badge-detail-refresh-icon" aria-hidden="true"></span><span>刷新</span></button><div class="badge-detail-export-action"><button type="button" class="btn primary badge-detail-table-action badge-detail-export-btn" data-sr-export aria-describedby="sessionRealExportTooltip" disabled><span class="badge-detail-export-icon" aria-hidden="true"></span><span>导出</span></button><span class="badge-detail-export-tooltip" id="sessionRealExportTooltip" role="tooltip">导出 Excel</span></div></div></div>' +
          '</div>' +
          '<div class="table-wrap session-list-table-wrap"><table class="data-table session-data-table badge-data-table sr-real-table" id="sessionRealTable"><thead></thead><tbody></tbody></table><div class="badge-list-empty-state" id="sessionRealEmptyState" role="status" hidden><svg class="badge-list-empty-illustration" viewBox="0 0 180 132" fill="none" aria-hidden="true"> <ellipse cx="90" cy="119" rx="59" ry="7" fill="#E8EEF8" /> <path d="M53 27c0-5.5 4.5-10 10-10h54l18 18v61c0 5.5-4.5 10-10 10H63c-5.5 0-10-4.5-10-10V27Z" fill="#F8FAFD" stroke="#CAD7EA" stroke-width="3" /> <path d="M117 17v18h18" fill="#E8F0FC" stroke="#CAD7EA" stroke-width="3" stroke-linejoin="round" /> <path d="M70 48h47M70 62h31M70 76h24" stroke="#B7C6DB" stroke-width="5" stroke-linecap="round" /> <circle cx="117" cy="83" r="21" fill="#EEF5FF" stroke="#5B8DEF" stroke-width="4" /> <path d="m132 98 15 15" stroke="#5B8DEF" stroke-width="6" stroke-linecap="round" /> <path d="M108 83h18" stroke="#8EAFE9" stroke-width="4" stroke-linecap="round" /> </svg><strong>暂无符合条件的录音</strong><p>请调整筛选条件后重试</p></div></div>' +
          '<div class="session-pagination" id="sessionRealPagination"></div>' +
        '</div></section>' +
      '</div>';
    var toolbar = document.getElementById('toolbarActions');
    if (toolbar) {
      toolbar.innerHTML = '<div class="badge-field-settings-action"><button type="button" class="btn badge-field-settings-trigger" data-sr-settings aria-expanded="false" aria-describedby="sessionRealSettingsTooltip"><svg class="badge-field-settings-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false"> <path d="M6.675 15.75H2.625C2.4 15.75 2.25 15.6 2.25 15.375V2.625C2.25 2.4 2.4 2.25 2.625 2.25H13.425C13.65 2.25 13.8 2.4 13.8 2.625V7.575C13.8 7.95 14.1 8.325 14.55 8.325C15 8.325 15.3 8.025 15.3 7.575V2.625C15.3 1.575 14.475 0.75 13.425 0.75H2.625C1.575 0.75 0.75 1.575 0.75 2.625V15.375C0.75 16.425 1.575 17.25 2.625 17.25H6.675C7.05 17.25 7.425 16.95 7.425 16.5C7.425 16.05 7.125 15.75 6.675 15.75Z" fill="currentColor"/> <path d="M6.67539 11.2502C7.12539 11.2502 7.42539 10.9502 7.42539 10.5002V5.32519H9.07539C9.52539 5.32519 9.82539 5.0252 9.82539 4.5752C9.82539 4.1252 9.52539 3.8252 9.07539 3.8252H4.27539C3.82539 3.8252 3.52539 4.1252 3.52539 4.5752C3.52539 5.0252 3.82539 5.32519 4.27539 5.32519H5.92539V10.5002C5.92539 10.9502 6.30039 11.2502 6.67539 11.2502ZM7.35039 12.5252H4.27539C3.82539 12.5252 3.52539 12.8252 3.52539 13.2752C3.52539 13.7252 3.82539 14.0252 4.27539 14.0252H7.35039C7.80039 14.0252 8.10039 13.7252 8.10039 13.2752C8.10039 12.8252 7.80039 12.5252 7.35039 12.5252ZM9.45039 8.7752H11.7004C12.1504 8.7752 12.4504 8.4752 12.4504 8.0252C12.4504 7.5752 12.1504 7.2752 11.7004 7.2752H9.45039C9.00039 7.2752 8.70039 7.5752 8.70039 8.0252C8.70039 8.4752 9.00039 8.7752 9.45039 8.7752ZM9.90039 11.2502C10.3504 11.2502 10.6504 10.9502 10.6504 10.5002C10.6504 10.0502 10.3504 9.7502 9.90039 9.7502H9.45039C9.00039 9.7502 8.70039 10.0502 8.70039 10.5002C8.70039 10.9502 9.00039 11.2502 9.45039 11.2502H9.90039ZM17.0254 11.2502L15.5254 9.7502C15.2254 9.4502 14.7754 9.4502 14.4754 9.7502L9.52539 14.6252C9.37539 14.7752 9.30039 14.9252 9.30039 15.1502V16.5002C9.30039 16.9502 9.60039 17.2502 10.0504 17.2502H11.7754C12.0004 17.2502 12.1504 17.1752 12.3004 17.0252L17.0254 12.3002C17.1754 12.1502 17.2504 12.0002 17.2504 11.7752C17.2504 11.5502 17.1754 11.4002 17.0254 11.2502ZM11.4754 15.7502H10.8004V15.3752L15.0004 11.2502L15.4504 11.7002L11.4754 15.7502Z" fill="currentColor"/> </svg><span>字段设置</span></button><span class="badge-field-settings-tooltip" id="sessionRealSettingsTooltip" role="tooltip">同步设置表格字段与筛选项</span></div>';
      toolbar.closest('.toolbar').hidden = false;
    }
    renderFilters();
    renderTable(getFilteredRecords());
    renderFieldSettings();
    bindEvents();
  }

  function showToast(message) {
    var toast = document.getElementById('sessionRealToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sessionRealToast';
      toast.className = 'badge-list-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    global.clearTimeout(showToast.timer);
    showToast.timer = global.setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function syncRefreshButton() {
    var button = document.querySelector('[data-sr-refresh]');
    if (!button) return;
    button.disabled = Boolean(state.refreshBusy);
    button.classList.toggle('is-refreshing', Boolean(state.refreshBusy));
    button.setAttribute('aria-busy', state.refreshBusy ? 'true' : 'false');
    button.innerHTML = '<span class="badge-detail-refresh-icon" aria-hidden="true"></span><span>' + (state.refreshBusy ? '刷新中' : '刷新') + '</span>';
  }

  function syncSettingsButton() {
    document.querySelectorAll('[data-sr-settings]').forEach(function (button) {
      button.setAttribute('aria-expanded', state.settingsOpen ? 'true' : 'false');
    });
  }

  function rerender(options) {
    var menuScroll = null;
    if (state.openMenu) {
      var currentOptions = document.querySelector('[data-sr-menu-options="' + state.openMenu + '"]');
      if (currentOptions) menuScroll = currentOptions.scrollTop;
    }
    renderFilters();
    renderTable(getFilteredRecords());
    renderFieldSettings();
    bindEvents();
    syncRefreshButton();
    syncSettingsButton();
    if (menuScroll != null && state.openMenu) {
      var nextOptions = document.querySelector('[data-sr-menu-options="' + state.openMenu + '"]');
      if (nextOptions) nextOptions.scrollTop = menuScroll;
    }
    if (options && options.keepSettings) {
      state.settingsOpen = true;
      renderFieldSettings();
      bindEvents();
      syncRefreshButton();
      syncSettingsButton();
    }
  }

  function clearDownstreamSelections(changedKey) {
    var affected = [];
    if (changedKey === 'brand') affected = ['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor', 'carSeries', 'leadCarSeries'];
    if (changedKey === 'province') affected = ['city', 'store'];
    if (changedKey === 'city') affected = ['store'];
    if (changedKey === 'region') affected = ['zone', 'store'];
    if (changedKey === 'zone') affected = ['store'];
    if (changedKey === 'patroler' || changedKey === 'governor') affected = ['store'];
    affected.forEach(function (key) {
      state.selections[key] = selected(key).filter(function (value) {
        return currentValueOptions(key).some(function (option) { return option.value === value; });
      });
    });
    state.selections.advisor = selected('advisor').filter(function (value) {
      return advisorOptions().some(function (option) { return option.value === value; });
    });
    state.selections.customer = selected('customer').filter(function (value) {
      return customerOptions().some(function (option) { return option.value === value; });
    });
  }

  function switchDimensionMode(mode) {
    if (!['organization', 'geography'].includes(mode) || state.dimensionMode === mode) return;
    var inactiveKeys = mode === 'organization' ? ['province', 'city'] : ['region', 'zone'];
    inactiveKeys.forEach(function (key) { state.selections[key] = []; });
    state.selections.store = [];
    state.dimensionMode = mode;
    closeFilterMenu(true);
    state.menuQueries = {};
    state.page = 1;
  }

  function toggleSelection(key, value) {
    if (!value) return;
    var values = selected(key).slice();
    if (values.includes(value)) {
      values = values.filter(function (item) { return item !== value; });
    } else {
      values.push(value);
    }
    state.selections[key] = values;
    clearDownstreamSelections(key);
    state.page = 1;
  }

  function selectAllCurrent(key) {
    var options = filterOptions(key);
    var values = new Set(selected(key));
    var allSelected = options.length > 0 && options.every(function (option) { return values.has(option.value); });
    options.forEach(function (option) {
      if (allSelected) values.delete(option.value);
      else values.add(option.value);
    });
    state.selections[key] = Array.from(values);
    clearDownstreamSelections(key);
    state.page = 1;
  }

  function toggleScenarioGroup(source) {
    var groupValues = scenarioDefinitions.filter(function (item) {
      return item.source === source;
    }).map(function (item) { return item.value; });
    if (!groupValues.length) return;
    var values = new Set(selected('scenario'));
    var allSelected = groupValues.every(function (value) { return values.has(value); });
    groupValues.forEach(function (value) {
      if (allSelected) values.delete(value);
      else values.add(value);
    });
    state.selections.scenario = Array.from(values);
    state.page = 1;
  }

  function setDraftColumnVisible(key, visible) {
    if (!columnSettingsDraft) return;
    var hidden = new Set(columnSettingsDraft.hidden);
    if (visible) hidden.delete(key);
    else hidden.add(key);
    columnSettingsDraft.hidden = Array.from(hidden);
    renderFieldSettings();
    bindEvents();
    syncSettingsButton();
  }

  function dragColumn(key, targetKey) {
    if (!columnSettingsDraft || !key || !targetKey || key === targetKey) return;
    var next = columnSettingsDraft.order.filter(function (item) { return item !== key; });
    var targetIndex = next.indexOf(targetKey);
    next.splice(targetIndex < 0 ? next.length : targetIndex, 0, key);
    columnSettingsDraft.order = next;
    renderFieldSettings();
    bindEvents();
  }

  function clearFilterForColumn(key) {
    if (filterKeys.includes(key)) state.selections[key] = [];
    var queryKeyByColumn = {
      audioId: 'audioId',
      leadId: 'leadId',
      advisorPhone: 'advisorPhone',
      customerName: 'customerName',
      customerPhone: 'customerPhone'
    };
    if (queryKeyByColumn[key]) state.queries[queryKeyByColumn[key]] = '';
    if (key === 'startTime') {
      state.startDate = defaultStartDate;
      state.endDate = defaultEndDate;
    }
  }

  function saveColumnSettings() {
    if (!columnSettingsDraft) return;
    var previousHidden = new Set(columnSettings.hidden);
    var next = cloneColumnSettings(columnSettingsDraft);
    if (!next.order.some(function (key) { return !next.hidden.includes(key); })) {
      showToast('至少保留一个字段');
      return;
    }
    next.hidden.filter(function (key) { return !previousHidden.has(key); }).forEach(function (key) {
      if (key === 'patroler' && !next.hidden.includes('patrolerCode')) return;
      clearFilterForColumn(key);
    });
    if (next.hidden.includes('patrolerCode') && next.hidden.includes('patroler')) state.selections.patroler = [];
    if (next.hidden.includes('advisorId') && next.hidden.includes('advisorName')) state.selections.advisor = [];
    if (next.hidden.includes('leadId') && next.hidden.includes('customerName') && next.hidden.includes('customerPhone')) state.selections.customer = [];
    columnSettings = next;
    persistColumnSettings();
    columnSettingsDraft = null;
    state.settingsOpen = false;
    closeFilterMenu(true);
    state.page = 1;
    rerender();
    showToast('字段设置已保存');
  }

  function restoreColumnSettingsDraft() {
    columnSettingsDraft = createDefaultColumnSettings();
    renderFieldSettings();
    bindEvents();
  }

  function selectAllColumnSettingsDraft() {
    if (!columnSettingsDraft) return;
    columnSettingsDraft.hidden = [];
    renderFieldSettings();
    bindEvents();
  }

  function exportRecords() {
    var exportRecordsList = getFilteredRecords();
    var exportButton = document.querySelector('[data-sr-export]');
    if (!exportRecordsList.length || (exportButton && exportButton.disabled)) return;
    var exporter = global.__xlsxExportUtils;
    if (!exporter || typeof exporter.downloadXlsx !== 'function') {
      showToast('Excel 导出功能加载失败，请刷新页面后重试');
      return;
    }
    var visible = visibleColumns();
    var now = new Date();
    var pad = function (value) { return String(value).padStart(2, '0'); };
    var filename = '录音列表_' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds()) + '.xlsx';
    try {
      exporter.downloadXlsx({
        filename: filename,
        sheetName: '录音列表',
        columns: visible.map(function (column) { return { label: column.label, width: column.width }; }),
        rows: exportRecordsList.map(function (record) { return visible.map(function (column) { return cellValue(record, column.key); }); })
      });
      showToast('已导出 ' + exportRecordsList.length + ' 条录音');
    } catch (error) {
      console.error('Session export failed', error);
      showToast('导出失败，请稍后重试');
    }
  }

  function refreshRecords() {
    if (state.refreshBusy) return;
    state.refreshBusy = true;
    syncRefreshButton();
    global.setTimeout(function () {
      state.refreshBusy = false;
      rerender();
      showToast('录音列表已刷新');
    }, 280);
  }

  function openDetail(audioId) {
    var record = records.find(function (item) { return item.audioId === audioId; });
    if (!record) return;
    var url = new URL('../session/index.html', global.location.href);
    url.searchParams.set('route', 'session-detail');
    url.searchParams.set('sessionId', record.audioId);
    url.searchParams.set('sessionStore', record.store);
    url.searchParams.set('sessionDate', text(record.startTime).slice(0, 10).replace(/-/g, '/'));
    url.searchParams.set('sessionCustomer', record.customerNameMasked);
    url.searchParams.set('sessionScene', record.scenario);
    url.searchParams.set('sessionBrand', record.brand);
    global.location.href = url.pathname + url.search + url.hash;
  }

  function bindTableEvents() {
    document.querySelectorAll('[data-sr-intent-help]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('pointerenter', function () { positionIntentRuleTooltip(node); });
      node.addEventListener('focus', function () { positionIntentRuleTooltip(node); });
    });
    document.querySelectorAll('[data-sr-detail]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { openDetail(node.dataset.srDetail); });
    });
    document.querySelectorAll('[data-sr-page]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { state.page = Number(node.dataset.srPage); rerender(); });
    });
    document.querySelectorAll('[data-sr-page-arrow]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { state.page = Math.max(1, (state.page || 1) + Number(node.dataset.srPageArrow)); rerender(); });
    });
    document.querySelectorAll('[data-sr-page-size-trigger]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var willOpen = !node.classList.contains('is-open');
        if (state.openMenu || state.closingMenu) {
          closeFilterMenu(true);
          rerender();
          if (willOpen) {
            var next = document.querySelector('[data-sr-page-size-trigger]');
            var nextOptions = next && next.parentElement.querySelector('.page-size-options');
            if (next && nextOptions) {
              nextOptions.getBoundingClientRect();
              global.requestAnimationFrame(function () {
                nextOptions.classList.add('open');
                next.classList.add('is-open');
              });
            }
          }
          return;
        }
        var options = node.parentElement.querySelector('.page-size-options');
        if (options) options.classList.toggle('open', willOpen);
        node.classList.toggle('is-open', willOpen);
      });
    });
    document.querySelectorAll('[data-sr-page-size]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var size = Number(node.dataset.srPageSize);
        var select = node.closest('.page-size-select');
        var options = select && select.querySelector('.page-size-options');
        var trigger = select && select.querySelector('[data-sr-page-size-trigger]');
        if (options) options.classList.remove('open');
        if (trigger) trigger.classList.remove('is-open');
        var apply = function () {
          state.pageSize = size;
          state.page = 1;
          rerender();
        };
        if (prefersReducedMotion()) apply();
        else global.setTimeout(apply, MENU_MOTION_MS);
      });
    });
    document.querySelectorAll('[data-sr-page-jump]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('change', function () {
        var totalPages = Math.max(1, Math.ceil(getFilteredRecords().length / Number(state.pageSize || 10)));
        state.page = Math.min(totalPages, Math.max(1, Number(node.value || 1)));
        rerender();
      });
    });
  }

  var documentEventsBound = false;

  function bindEvents() {
    document.querySelectorAll('[data-sr-dimension]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        switchDimensionMode(node.dataset.srDimension);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-trigger]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var key = node.dataset.srTrigger;
        closePageSizeMenu();
        if (state.openMenu === key) {
          closeFilterMenu(false);
          rerender();
          return;
        }
        openFilterMenu(key);
        if (key === 'date') {
          state.activeDateField = 'startDate';
          state.dateDraftStartDate = state.startDate;
          state.dateDraftEndDate = state.endDate;
          syncSessionDateView(state.dateDraftStartDate);
          rerender();
          return;
        }
        state.menuQueries[key] = '';
        var values = selected(key);
        var options = currentValueOptions(key);
        state.menuOrders[key] = options.map(function (option) { return option.value; }).sort(function (left, right) {
          var leftSelected = values.includes(left) ? 0 : 1;
          var rightSelected = values.includes(right) ? 0 : 1;
          return leftSelected - rightSelected;
        });
        rerender();
        global.requestAnimationFrame(function () {
          var input = document.querySelector('[data-sr-menu-search="' + key + '"]');
          if (input) input.focus();
        });
      });
    });

    document.querySelectorAll('[data-sr-option-key]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var key = node.dataset.srOptionKey;
        var value = node.dataset.srOptionValue;
        var options = document.querySelector('[data-sr-menu-options="' + key + '"]');
        var scrollTop = options ? options.scrollTop : 0;
        toggleSelection(key, value);
        rerender();
        global.requestAnimationFrame(function () {
          var nextOptions = document.querySelector('[data-sr-menu-options="' + key + '"]');
          if (nextOptions) nextOptions.scrollTop = scrollTop;
        });
      });
    });

    document.querySelectorAll('[data-sr-menu-search]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('input', function (event) {
        if (event.isComposing) return;
        var key = node.dataset.srMenuSearch;
        var value = node.value;
        var cursor = node.selectionStart;
        state.menuQueries[key] = value;
        rerender();
        global.requestAnimationFrame(function () {
          var input = document.querySelector('[data-sr-menu-search="' + key + '"]');
          if (input) {
            input.focus();
            input.setSelectionRange(cursor, cursor);
          }
        });
      });
      node.addEventListener('compositionend', function () {
        var key = node.dataset.srMenuSearch;
        var value = node.value;
        state.menuQueries[key] = value;
        rerender();
        global.requestAnimationFrame(function () {
          var input = document.querySelector('[data-sr-menu-search="' + key + '"]');
          if (input) {
            input.focus();
            input.setSelectionRange(value.length, value.length);
          }
        });
      });
    });

    document.querySelectorAll('[data-sr-select-all]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        selectAllCurrent(node.dataset.srSelectAll);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-scenario-group]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleScenarioGroup(node.dataset.srScenarioGroup);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-query]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('input', function () {
        var key = node.dataset.srQuery;
        var value = node.value;
        var cursor = node.selectionStart;
        state.queries[key] = value;
        state.page = 1;
        rerender();
        global.requestAnimationFrame(function () {
          var input = document.querySelector('[data-sr-query="' + key + '"]');
          if (input) {
            input.focus();
            input.setSelectionRange(cursor, cursor);
          }
        });
      });
    });
    document.querySelectorAll('[data-sr-date-field]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        state.activeDateField = node.dataset.srDateField;
        syncSessionDateView(state.activeDateField === 'startDate' ? state.dateDraftStartDate : state.dateDraftEndDate);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-date-nav]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        shiftSessionDateView(node.dataset.srDateNav);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-date-value]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        applySessionDateDraft(state.activeDateField, node.dataset.srDateValue);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-date-shortcut]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var today = new Date();
        var endValue = formatSessionDateValue(today);
        var startValue = endValue;
        if (node.dataset.srDateShortcut === 'last3') {
          var last3 = new Date(today);
          last3.setDate(last3.getDate() - 2);
          startValue = formatSessionDateValue(last3);
        }
        if (node.dataset.srDateShortcut === 'last7') {
          var last7 = new Date(today);
          last7.setDate(last7.getDate() - 6);
          startValue = formatSessionDateValue(last7);
        }
        state.dateDraftStartDate = startValue;
        state.dateDraftEndDate = endValue;
        state.activeDateField = 'endDate';
        syncSessionDateView(endValue);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-date-cancel]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        closeFilterMenu(false);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-date-apply]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        state.startDate = state.dateDraftStartDate;
        state.endDate = state.dateDraftEndDate;
        state.page = 1;
        closeFilterMenu(false);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-reset]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        filterKeys.forEach(function (key) { state.selections[key] = []; });
        state.selections.status = ['已完成'];
        Object.keys(state.queries).forEach(function (key) { state.queries[key] = ''; });
        state.startDate = defaultStartDate;
        state.endDate = defaultEndDate;
        state.dateDraftStartDate = defaultStartDate;
        state.dateDraftEndDate = defaultEndDate;
        state.activeDateField = 'startDate';
        syncSessionDateView(defaultStartDate);
        state.page = 1;
        state.collapsed = true;
        closeFilterMenu(true);
        state.menuQueries = {};
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-collapse]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        state.collapsed = !state.collapsed;
        closeFilterMenu(true);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-refresh]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', refreshRecords);
    });
    document.querySelectorAll('[data-sr-export]').forEach(function (node) {
      if (node.dataset.srBound === 'true') {
        node.disabled = !getFilteredRecords().length;
        return;
      }
      node.dataset.srBound = 'true';
      node.disabled = !getFilteredRecords().length;
      node.addEventListener('click', exportRecords);
    });
    document.querySelectorAll('[data-sr-settings]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        state.settingsOpen = !state.settingsOpen;
        closeFilterMenu(true);
        columnSettingsDraft = state.settingsOpen ? cloneColumnSettings(columnSettings) : null;
        rerender();
        syncSettingsButton();
        if (state.settingsOpen) document.querySelector('.sr-settings-panel [data-sr-settings-close]')?.focus();
      });
    });
    document.querySelectorAll('[data-sr-settings-close]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        state.settingsOpen = false;
        columnSettingsDraft = null;
        rerender();
        syncSettingsButton();
      });
    });
    document.querySelectorAll('[data-sr-column-visible]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('change', function () {
        setDraftColumnVisible(node.dataset.srColumnVisible, node.checked);
      });
    });
    document.querySelectorAll('[data-sr-settings-restore]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { restoreColumnSettingsDraft(); });
    });
    document.querySelectorAll('[data-sr-settings-select-all]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { selectAllColumnSettingsDraft(); });
    });
    document.querySelectorAll('[data-sr-settings-save]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () { saveColumnSettings(); });
    });
    document.querySelectorAll('[data-sr-column-item]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('dragstart', function () {
        state.columnDragging = node.dataset.srColumnItem;
        node.classList.add('is-dragging');
      });
      node.addEventListener('dragend', function () {
        state.columnDragging = '';
        node.classList.remove('is-dragging');
      });
      node.addEventListener('dragover', function (event) { event.preventDefault(); });
      node.addEventListener('drop', function (event) {
        event.preventDefault();
        dragColumn(state.columnDragging, node.dataset.srColumnItem);
      });
    });

    if (!documentEventsBound) {
      documentEventsBound = true;
      global.addEventListener('resize', positionFilterMenu);
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && (state.settingsOpen || state.openMenu || state.closingMenu)) {
          var settingsWasOpen = state.settingsOpen;
          state.settingsOpen = false;
          columnSettingsDraft = null;
          closeFilterMenu(!!settingsWasOpen);
          closePageSizeMenu();
          rerender();
          if (settingsWasOpen) document.querySelector('[data-sr-settings]')?.focus();
        } else if (event.key === 'Escape') {
          closePageSizeMenu();
        }
      });
      document.addEventListener('click', function (event) {
        if (state.openMenu && !event.target.closest('[data-sr-control]')) {
          closeFilterMenu(false);
          rerender();
        }
        if (state.settingsOpen && !event.target.closest('.sr-settings-panel') && !event.target.closest('[data-sr-settings]')) {
          state.settingsOpen = false;
          columnSettingsDraft = null;
          rerender();
          syncSettingsButton();
        }
        document.querySelectorAll('.page-size-options.open').forEach(function (node) {
          if (!event.target.closest('.page-size-select')) {
            node.classList.remove('open');
          }
        });
        if (!event.target.closest('.page-size-select')) {
          document.querySelectorAll('[data-sr-page-size-trigger].is-open').forEach(function (node) {
            node.classList.remove('is-open');
          });
        }
      });
    }
  }

  function getCurrentRoute() {
    var params = new URLSearchParams(global.location.search);
    return params.get('route') || global.__AI_QC_DEFAULT_ROUTE || 'dashboard';
  }

  var installQueued = false;
  function installForCurrentRoute() {
    if (installQueued) return;
    installQueued = true;
    global.setTimeout(function () {
      installQueued = false;
      if (getCurrentRoute() === 'session' && document.getElementById('pageHost') && !document.querySelector('.session-real-root')) {
        renderShell();
      }
    }, 0);
  }

  var pageHost = document.getElementById('pageHost');
  if (pageHost && typeof MutationObserver !== 'undefined') {
    new MutationObserver(function () { installForCurrentRoute(); }).observe(pageHost, { childList: true });
  }
  global.addEventListener('popstate', installForCurrentRoute);
  global.addEventListener('hashchange', installForCurrentRoute);
  installForCurrentRoute();
})(window);
