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

  var scenarioOptions = ['首触跟进', '邀约到店', '排程确认', '销售接待', '试乘试驾'];
  var intentOptions = ['高', '中', '低', '无', '无法判断'];
  var brandOptions = ['传祺', '埃安'];
  var statusOptions = ['已完成', '失败'];
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

  function maskName(value) {
    var chars = Array.from(text(value));
    if (!chars.length) return '—';
    if (chars.length === 1) return chars[0];
    if (chars.length === 2) return chars[0] + '*';
    return chars[0] + '*'.repeat(Math.max(1, chars.length - 2)) + chars[chars.length - 1];
  }

  function maskPhone(value) {
    var digits = normalizeDigits(value);
    if (!digits) return '—';
    return digits.slice(0, 3) + '****' + digits.slice(-4);
  }

  function customerPhone(customerId) {
    var key = text(customerId);
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
      var customerId = text(customerTuple[0]);
      var customerName = text(customerTuple[1]);
      var status = Number(row[3]) === 1 ? '已完成' : '失败';
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
        patroler: text(dealer.patroler || '—'),
        governor: text(dealer.governor || '—'),
        advisorKey: dealerKeyValue + '::' + advisorId,
        advisorId: advisorId || '—',
        advisorName: advisorName || '—',
        advisorPhone: advisorPhone,
        leadId: text(row[8]) || '—',
        customerId: customerId,
        customerName: customerName || '—',
        customerNameMasked: maskName(customerName),
        customerPhone: customerPhone(customerId),
        qualifiedRate: text(row[11]) || '—',
        intentLevel: status === '失败' ? '—' : (text(row[12]) || '无法判断'),
        carSeries: series || '未知',
        scenario: scenario,
        source: source,
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
  var filterKeys = ['brand', 'scenario', 'source', 'intentLevel', 'carSeries', 'province', 'city', 'store', 'region', 'zone', 'patroler', 'governor', 'advisor', 'status'];
  var state = {
    selections: {},
    queries: {
      leadId: '',
      advisorPhone: '',
      customerName: '',
      customerPhone: ''
    },
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    collapsed: true,
    openMenu: null,
    menuQueries: {},
    menuOrders: {},
    settingsOpen: false,
    refreshBusy: false,
    columnDragging: '',
    page: 1,
    pageSize: 10
  };
  filterKeys.forEach(function (key) { state.selections[key] = []; });

  var columns = [
    { key: 'audioId', label: '录音ID', width: 22 },
    { key: 'brand', label: '品牌', width: 10 },
    { key: 'startTime', label: '录音开始时间', width: 20 },
    { key: 'uploadTime', label: '录音上传时间', width: 20 },
    { key: 'status', label: '录音状态', width: 12 },
    { key: 'duration', label: '录音时长', width: 12 },
    { key: 'province', label: '省份', width: 12 },
    { key: 'city', label: '城市', width: 12 },
    { key: 'dealerCode', label: '店代码', width: 14 },
    { key: 'store', label: '门店', width: 20 },
    { key: 'region', label: '大区', width: 16 },
    { key: 'zone', label: '战区', width: 16 },
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
    patroler: [],
    province: ['brand'],
    city: ['brand', 'province'],
    governor: [],
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

  function recordMatches(record, options) {
    var ignore = options && options.ignore;
    if ((!ignore || ignore !== 'brand') && !matchesSelection('brand', record.brand)) return false;
    if ((!ignore || ignore !== 'scenario') && !matchesSelection('scenario', record.scenario)) return false;
    if ((!ignore || ignore !== 'source') && !matchesSelection('source', record.source)) return false;
    if ((!ignore || ignore !== 'intentLevel') && !matchesSelection('intentLevel', record.intentLevel)) return false;
    if ((!ignore || ignore !== 'carSeries') && !matchesSelection('carSeries', record.carSeries)) return false;
    if (!dealerMatches(record.dealer, { ignore: ignore && ['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor'].includes(ignore) ? ignore : undefined })) return false;
    if ((!ignore || ignore !== 'advisor') && !matchesSelection('advisor', record.advisorKey)) return false;
    if ((!ignore || ignore !== 'status') && !matchesSelection('status', record.status)) return false;
    if (!options || !options.ignoreDate) {
      var recordDate = text(record.startTime).slice(0, 10);
      if (state.startDate && recordDate < state.startDate) return false;
      if (state.endDate && recordDate > state.endDate) return false;
    }
    if (!options || !options.ignoreQueries) {
      var leadQuery = normalize(state.queries.leadId);
      var advisorPhoneQuery = normalizeDigits(state.queries.advisorPhone);
      var customerNameQuery = normalize(state.queries.customerName);
      var customerPhoneQuery = normalizeDigits(state.queries.customerPhone);
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
        return { value: dealer.patrolerId || dealer.patroler, label: dealer.patroler, meta: dealer.patrolerId };
      });
    } else if (key === 'governor') {
      options = list.filter(function (dealer) { return dealer.governor; }).map(function (dealer) {
        return { value: dealer.governorId || dealer.governor, label: dealer.governor, meta: dealer.governorId };
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
      if (!map.has(record.advisorKey)) {
        map.set(record.advisorKey, {
          value: record.advisorKey,
          label: record.advisorName,
          meta: record.advisorId,
          search: record.advisorName + ' ' + record.advisorId
        });
      }
    });
    return Array.from(map.values());
  }

  function currentValueOptions(key) {
    if (key === 'brand') return brandOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'scenario') return scenarioOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'source') return sourceOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'intentLevel') return intentOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'status') return statusOptions.map(function (value) { return { value: value, label: value }; });
    if (key === 'advisor') return advisorOptions();
    if (['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor'].includes(key)) return dealerOptionsFor(key);
    if (key === 'carSeries') {
      var series = records.filter(function (record) { return recordMatches(record, { ignore: 'carSeries' }); }).map(function (record) {
        return { value: record.carSeries, label: record.carSeries, meta: record.brand };
      });
      return uniqueOptions(series);
    }
    return [];
  }

  function optionLabel(key, option) {
    if (key === 'store') return '<span class="sr-option-label">' + escapeHtml(option.label) + '</span><small>' + escapeHtml(option.meta || '') + '</small>';
    if (key === 'advisor') return '<span class="sr-option-label">' + escapeHtml(option.label) + '</span><small>' + escapeHtml(option.meta || '') + '</small>';
    if (key === 'patroler' || key === 'governor') return '<span class="sr-option-label">' + escapeHtml(option.label) + '</span><small>' + escapeHtml(option.meta || '') + '</small>';
    if (key === 'carSeries' && option.meta) return '<span class="sr-option-label">' + escapeHtml(option.label) + '</span><small>' + escapeHtml(option.meta) + '</small>';
    return '<span class="sr-option-label">' + escapeHtml(option.label) + '</span>';
  }

  function getFilterLabel(key) {
    var labels = {
      brand: '品牌',
      scenario: '质检场景',
      source: '数据来源',
      intentLevel: 'AI意向等级',
      carSeries: '车系',
      province: '省份',
      city: '城市',
      store: '门店',
      region: '大区',
      zone: '战区',
      patroler: '巡回员',
      governor: '治理员',
      advisor: '顾问',
      status: '录音状态'
    };
    return labels[key] || key;
  }

  function getSelectionText(key) {
    var values = selected(key);
    if (!values.length) return '全部';
    var options = currentValueOptions(key);
    var labels = values.map(function (value) {
      var option = options.find(function (item) { return item.value === value; });
      return option ? option.label : value;
    });
    if (labels.length <= 2) return labels.join('、');
    return labels.slice(0, 2).join('、') + ' +' + (labels.length - 2);
  }

  function filterOptions(key) {
    var query = normalize(state.menuQueries[key]);
    var options = currentValueOptions(key);
    if (!query) return sortOptions(options, key);
    return options.filter(function (option) {
      return normalize(option.label + ' ' + (option.meta || '') + ' ' + (option.search || '')).includes(query);
    });
  }

  function renderOptionMenu(key) {
    var options = filterOptions(key);
    var values = selected(key);
    var selectedCurrentCount = options.filter(function (option) { return values.includes(option.value); }).length;
    var allActive = options.length > 0 && selectedCurrentCount === options.length;
    var partiallyActive = selectedCurrentCount > 0 && !allActive;
    return '<div class="sr-menu" data-sr-menu="' + escapeHtml(key) + '">' +
      '<div class="sr-menu-search-row">' +
        '<span class="sr-menu-search-icon" aria-hidden="true"></span>' +
        '<input type="search" data-sr-menu-search="' + escapeHtml(key) + '" value="' + escapeHtml(state.menuQueries[key] || '') + '" placeholder="搜索' + escapeHtml(getFilterLabel(key)) + '" autocomplete="off">' +
      '</div>' +
      '<div class="sr-menu-actions">' +
        '<button type="button" class="sr-menu-action sr-menu-select-all' + (allActive ? ' is-active' : '') + (partiallyActive ? ' is-partial' : '') + '" data-sr-select-all="' + escapeHtml(key) + '" aria-pressed="' + (allActive ? 'true' : 'false') + '"><span class="sr-menu-action-check" aria-hidden="true">' + (allActive ? '✓' : partiallyActive ? '−' : '') + '</span>全选当前结果</button>' +
        '<button type="button" class="sr-menu-action" data-sr-clear="' + escapeHtml(key) + '">取消全选</button>' +
      '</div>' +
      '<div class="sr-menu-options" data-sr-menu-options="' + escapeHtml(key) + '">' +
      (options.length ? options.map(function (option) {
        var active = values.includes(option.value);
        return '<button type="button" class="sr-option' + (active ? ' is-selected' : '') + '" role="option" aria-selected="' + (active ? 'true' : 'false') + '" data-sr-option-key="' + escapeHtml(key) + '" data-sr-option-value="' + escapeHtml(option.value) + '">' +
          '<span class="sr-checkbox' + (active ? ' is-checked' : '') + '" aria-hidden="true">' + (active ? '✓' : '') + '</span>' +
          '<span class="sr-option-copy">' + optionLabel(key, option) + '</span>' +
        '</button>';
      }).join('') : '<div class="sr-menu-empty">暂无可选项</div>') +
      '</div>' +
      '<div class="sr-menu-footer"><span>已选 ' + (allActive ? '全部' : values.length + ' 项') + '</span><button type="button" class="sr-menu-done" data-sr-menu-done="' + escapeHtml(key) + '">完成</button></div>' +
    '</div>';
  }

  function renderFilterControl(key, options) {
    var open = state.openMenu === key;
    var label = getFilterLabel(key);
    return '<div class="sr-filter-control' + (open ? ' is-open' : '') + '" data-sr-control="' + escapeHtml(key) + '">' +
      '<span class="sr-filter-label">' + escapeHtml(label) + '</span>' +
      '<button type="button" class="sr-filter-trigger' + (selected(key).length ? ' has-selection' : '') + '" data-sr-trigger="' + escapeHtml(key) + '" aria-haspopup="listbox" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        '<span>' + escapeHtml(getSelectionText(key)) + '</span><i class="sr-caret" aria-hidden="true"></i>' +
      '</button>' +
      (open ? renderOptionMenu(key) : '') +
    '</div>';
  }

  function renderTextControl(key, label, placeholder) {
    return '<label class="sr-filter-control sr-text-control">' +
      '<span class="sr-filter-label">' + escapeHtml(label) + '</span>' +
      '<span class="sr-text-input-wrap"><input type="search" data-sr-query="' + escapeHtml(key) + '" value="' + escapeHtml(state.queries[key] || '') + '" placeholder="' + escapeHtml(placeholder || ('请输入' + label)) + '" autocomplete="off"><i class="sr-search-icon" aria-hidden="true"></i></span>' +
    '</label>';
  }

  function renderDateControl() {
    return '<div class="sr-filter-control sr-date-control">' +
      '<span class="sr-filter-label">录音开始时间</span>' +
      '<span class="sr-date-inputs">' +
        '<input type="date" data-sr-date="startDate" value="' + escapeHtml(state.startDate) + '" aria-label="录音开始日期">' +
        '<em>至</em>' +
        '<input type="date" data-sr-date="endDate" value="' + escapeHtml(state.endDate) + '" aria-label="录音结束日期">' +
      '</span>' +
    '</div>';
  }

  function renderFilters() {
    var container = document.getElementById('sessionRealFilterControls');
    if (!container) return;
    var primary = ['brand', 'scenario', 'source', 'intentLevel'].filter(isColumnVisible);
    var org = ['province', 'city', 'store', 'region', 'zone', 'patroler', 'governor'].filter(isColumnVisible);
    if (isColumnVisible('advisorId') || isColumnVisible('advisorName')) org.push('advisor');
    var existing = ['carSeries', 'status'].filter(isColumnVisible);
    var textControls = [
      { key: 'leadId', label: '线索ID' },
      { key: 'advisorPhone', label: '顾问号码' },
      { key: 'customerName', label: '客户姓名' },
      { key: 'customerPhone', label: '客户号码' }
    ].filter(function (field) { return isColumnVisible(field.key); });
    container.innerHTML =
      '<div class="sr-filter-row sr-filter-primary">' +
        primary.map(function (key) { return renderFilterControl(key); }).join('') +
        '<div class="sr-filter-actions">' +
          '<button type="button" class="sr-btn sr-btn-light" data-sr-reset>重置筛选</button>' +
          '<button type="button" class="sr-text-action" data-sr-collapse aria-expanded="' + (!state.collapsed ? 'true' : 'false') + '">' + (state.collapsed ? '展开' : '收起') + '<i class="sr-chevron ' + (state.collapsed ? 'is-down' : 'is-up') + '" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="sr-filter-extra' + (state.collapsed ? ' is-collapsed' : '') + '">' +
        '<div class="sr-filter-row sr-filter-org">' +
          org.map(function (key) { return renderFilterControl(key); }).join('') +
        '</div>' +
        '<div class="sr-filter-row sr-filter-existing">' +
          existing.map(function (key) { return renderFilterControl(key); }).join('') +
          textControls.map(function (field) { return renderTextControl(field.key, field.label); }).join('') +
          (isColumnVisible('startTime') ? renderDateControl() : '') +
        '</div>' +
      '</div>';
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
      return '<th data-column-key="' + escapeHtml(column.key) + '">' + escapeHtml(column.label) + '</th>';
    }).join('') + '<th class="sr-operation-col">操作</th></tr>';
    total.textContent = String(recordsForView.length);
    completed.textContent = String(recordsForView.filter(function (record) { return record.status === '已完成'; }).length);
    failed.textContent = String(recordsForView.filter(function (record) { return record.status === '失败'; }).length);
    var pageSize = Number(state.pageSize || 10);
    var totalPages = Math.max(1, Math.ceil(recordsForView.length / pageSize));
    if ((state.page || 1) > totalPages) state.page = totalPages;
    var start = ((state.page || 1) - 1) * pageSize;
    var pageRecords = recordsForView.slice(start, start + pageSize);
    if (!recordsForView.length) {
      body.innerHTML = '<tr class="session-empty-row"><td colspan="' + (visible.length + 1) + '">当前筛选条件下暂无录音，请调整筛选条件后重试。</td></tr>';
      if (pagination) pagination.innerHTML = '';
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
        '<div class="custom-select-container page-select page-size-select"><button type="button" class="custom-select-trigger page-size-trigger" data-sr-page-size-trigger><span>' + pageSize + ' 条/页</span></button><div class="custom-select-options page-size-options">' +
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
    if (!host) return;
    if (!state.settingsOpen) {
      host.innerHTML = '';
      return;
    }
    var working = getWorkingColumnSettings();
    var ordered = working.order.map(function (key) { return getColumn(key); }).filter(Boolean);
    var visibleCount = ordered.filter(function (column) { return !working.hidden.includes(column.key); }).length;
    host.innerHTML = '<div class="sr-settings-backdrop" data-sr-settings-close></div>' +
      '<aside class="sr-settings-panel" role="dialog" aria-modal="true" aria-label="字段设置">' +
        '<div class="sr-settings-head"><div><strong>字段设置</strong><p class="sr-settings-hint">勾选字段并拖动调整列表顺序，指定筛选字段会同步控制筛选项</p></div><button type="button" class="sr-settings-close" data-sr-settings-close aria-label="关闭字段设置">×</button></div>' +
        '<div class="sr-settings-summary"><span>已选 <strong>' + visibleCount + '</strong> / ' + ordered.length + ' 个字段</span><button type="button" data-sr-settings-select-all>全选</button></div>' +
        '<div class="sr-settings-list" aria-label="可配置字段列表">' + ordered.map(function (column, index) {
          var visible = !working.hidden.includes(column.key);
          return '<div class="sr-settings-item' + (visible ? ' is-visible' : '') + '" draggable="true" data-sr-column-item="' + escapeHtml(column.key) + '">' +
            '<span class="sr-drag-handle" aria-hidden="true">⠿</span>' +
            '<label><input type="checkbox" data-sr-column-visible="' + escapeHtml(column.key) + '" ' + (visible ? 'checked' : '') + '><span>' + escapeHtml(column.label) + '</span></label>' +
            '<small>' + (visible ? '已显示' : '已隐藏') + '</small>' +
            '<span class="sr-settings-move"><button type="button" data-sr-column-move="' + escapeHtml(column.key) + '" data-sr-column-direction="-1" ' + (index === 0 ? 'disabled' : '') + ' aria-label="上移">↑</button><button type="button" data-sr-column-move="' + escapeHtml(column.key) + '" data-sr-column-direction="1" ' + (index === ordered.length - 1 ? 'disabled' : '') + ' aria-label="下移">↓</button></span>' +
          '</div>';
        }).join('') + '</div>' +
        '<div class="sr-settings-foot"><button type="button" class="sr-btn sr-btn-light" data-sr-settings-restore>恢复默认</button><div><button type="button" class="sr-btn sr-btn-light" data-sr-settings-close>取消</button><button type="button" class="sr-btn sr-btn-primary" data-sr-settings-save>保存设置</button></div></div>' +
      '</aside>';
  }

  function renderShell() {
    var pageHost = document.getElementById('pageHost');
    if (!pageHost || getCurrentRoute() !== 'session') return;
    pageHost.innerHTML =
      '<div class="page-stack session-real-root">' +
        '<section class="card session-filter-card sr-filter-card"><div id="sessionRealFilterControls"></div></section>' +
        '<section class="card table-card sr-table-card"><div class="table-shell">' +
          '<div class="table-headbar session-list-table-headbar sr-table-headbar">' +
            '<div class="panel-title"><h3>录音总览</h3></div>' +
            '<div class="session-filter-summary"><span>当前匹配 <strong id="sessionRealCount">0</strong> 条录音</span><span class="leads-stage-summary"><span class="leads-stage-summary-icon status-completed" aria-hidden="true"></span><span>已完成 <strong id="sessionRealCompleted">0</strong> 条</span></span><span class="leads-stage-summary"><span class="leads-stage-summary-icon status-failed" aria-hidden="true"></span><span>失败 <strong id="sessionRealFailed">0</strong> 条</span></span></div>' +
            '<div class="sr-table-actions"><button type="button" class="sr-btn sr-btn-light" data-sr-refresh aria-busy="false"><span class="sr-refresh-icon" aria-hidden="true">↻</span>刷新</button><button type="button" class="sr-btn sr-btn-light" data-sr-settings aria-expanded="false">字段设置</button><button type="button" class="sr-btn sr-btn-primary" data-sr-export disabled>导出</button><div id="sessionRealFieldSettings"></div></div>' +
          '</div>' +
          '<div class="table-wrap session-list-table-wrap"><table class="data-table session-data-table sr-real-table" id="sessionRealTable"><thead></thead><tbody></tbody></table></div>' +
          '<div class="session-pagination" id="sessionRealPagination"></div>' +
        '</div></section>' +
      '</div>';
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
      toast.className = 'session-feedback-toast';
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
    button.innerHTML = state.refreshBusy
      ? '<span class="sr-refresh-icon" aria-hidden="true">↻</span>刷新中'
      : '<span class="sr-refresh-icon" aria-hidden="true">↻</span>刷新';
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
    if (changedKey === 'brand') affected = ['province', 'city', 'store', 'region', 'zone'];
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
    options.forEach(function (option) { values.add(option.value); });
    state.selections[key] = Array.from(values);
    clearDownstreamSelections(key);
    state.page = 1;
  }

  function clearCurrentSelection(key) {
    var values = new Set(selected(key));
    filterOptions(key).forEach(function (option) { values.delete(option.value); });
    state.selections[key] = Array.from(values);
    clearDownstreamSelections(key);
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

  function moveColumn(key, direction) {
    if (!columnSettingsDraft) return;
    var index = columnSettingsDraft.order.indexOf(key);
    var target = index + Number(direction);
    if (index < 0 || target < 0 || target >= columnSettingsDraft.order.length) return;
    var next = columnSettingsDraft.order.slice();
    var temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    columnSettingsDraft.order = next;
    renderFieldSettings();
    bindEvents();
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
    next.hidden.filter(function (key) { return !previousHidden.has(key); }).forEach(clearFilterForColumn);
    if (next.hidden.includes('advisorId') && next.hidden.includes('advisorName')) state.selections.advisor = [];
    columnSettings = next;
    persistColumnSettings();
    columnSettingsDraft = null;
    state.settingsOpen = false;
    state.openMenu = null;
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
    document.querySelectorAll('[data-sr-detail]').forEach(function (node) {
      node.addEventListener('click', function () { openDetail(node.dataset.srDetail); });
    });
    document.querySelectorAll('[data-sr-page]').forEach(function (node) {
      node.addEventListener('click', function () { state.page = Number(node.dataset.srPage); rerender(); });
    });
    document.querySelectorAll('[data-sr-page-arrow]').forEach(function (node) {
      node.addEventListener('click', function () { state.page = Math.max(1, (state.page || 1) + Number(node.dataset.srPageArrow)); rerender(); });
    });
    document.querySelectorAll('[data-sr-page-size-trigger]').forEach(function (node) {
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var options = node.parentElement.querySelector('.page-size-options');
        options.classList.toggle('open');
        node.classList.toggle('is-open');
      });
    });
    document.querySelectorAll('[data-sr-page-size]').forEach(function (node) {
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        state.pageSize = Number(node.dataset.srPageSize);
        state.page = 1;
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-page-jump]').forEach(function (node) {
      node.addEventListener('change', function () {
        var totalPages = Math.max(1, Math.ceil(getFilteredRecords().length / Number(state.pageSize || 10)));
        state.page = Math.min(totalPages, Math.max(1, Number(node.value || 1)));
        rerender();
      });
    });
  }

  var documentEventsBound = false;

  function bindEvents() {
    document.querySelectorAll('[data-sr-trigger]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        var key = node.dataset.srTrigger;
        if (state.openMenu === key) {
          state.openMenu = null;
          rerender();
          return;
        }
        state.openMenu = key;
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
      node.addEventListener('input', function () {
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
    document.querySelectorAll('[data-sr-clear]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        clearCurrentSelection(node.dataset.srClear);
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-menu-done]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function (event) {
        event.stopPropagation();
        state.openMenu = null;
        state.menuQueries[node.dataset.srMenuDone] = '';
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
    document.querySelectorAll('[data-sr-date]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('change', function () {
        state[node.dataset.srDate] = node.value;
        if (state.startDate && state.endDate && state.startDate > state.endDate) {
          if (node.dataset.srDate === 'startDate') state.endDate = state.startDate;
          else state.startDate = state.endDate;
        }
        state.page = 1;
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-reset]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        filterKeys.forEach(function (key) { state.selections[key] = []; });
        Object.keys(state.queries).forEach(function (key) { state.queries[key] = ''; });
        state.startDate = defaultStartDate;
        state.endDate = defaultEndDate;
        state.page = 1;
        state.collapsed = true;
        state.openMenu = null;
        state.menuQueries = {};
        rerender();
      });
    });
    document.querySelectorAll('[data-sr-collapse]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        state.collapsed = !state.collapsed;
        state.openMenu = null;
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
        state.openMenu = null;
        columnSettingsDraft = state.settingsOpen ? cloneColumnSettings(columnSettings) : null;
        renderFieldSettings();
        bindEvents();
        syncSettingsButton();
      });
    });
    document.querySelectorAll('[data-sr-settings-close]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        state.settingsOpen = false;
        columnSettingsDraft = null;
        renderFieldSettings();
        bindEvents();
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
    document.querySelectorAll('[data-sr-column-move]').forEach(function (node) {
      if (node.dataset.srBound === 'true') return;
      node.dataset.srBound = 'true';
      node.addEventListener('click', function () {
        moveColumn(node.dataset.srColumnMove, node.dataset.srColumnDirection);
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
      document.addEventListener('click', function (event) {
        if (state.openMenu && !event.target.closest('[data-sr-control]')) {
          state.openMenu = null;
          rerender();
        }
        if (state.settingsOpen && !event.target.closest('.sr-settings-panel') && !event.target.closest('[data-sr-settings]')) {
          state.settingsOpen = false;
          columnSettingsDraft = null;
          renderFieldSettings();
          bindEvents();
          syncSettingsButton();
        }
        document.querySelectorAll('.page-size-options.open').forEach(function (node) {
          if (!event.target.closest('.page-size-select')) node.classList.remove('open');
        });
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
