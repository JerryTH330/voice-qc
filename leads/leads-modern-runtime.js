(function installLeadsModernRuntime(global) {
  'use strict';

  if (global.__LEADS_MODERN_RUNTIME_INSTALLED__) return;
  global.__LEADS_MODERN_RUNTIME_INSTALLED__ = true;

  var sourceRows = Array.isArray(global.__LEADS_REAL_DATA) ? global.__LEADS_REAL_DATA : [];
  var sourceDirectory = Array.isArray(global.__DEVICE_ORGANIZATION_DEALERS) ? global.__DEVICE_ORGANIZATION_DEALERS : [];
  if (!sourceRows.length) return;

  var FILTER_MOTION_MS = 180;
  var FILTER_MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var VIEW_CONTENT_MOTION_MS = 160;
  var DEFAULT_DATE = '2026-09-10';
  var ORGANIZATION_KEYS = ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor', 'store', 'advisor'];
  var FILTER_LABELS = {
    brand: '品牌',
    province: '省份',
    city: '城市',
    dealerCode: '店代码',
    store: '门店',
    region: '大区',
    zone: '战区',
    patroler: '巡回员',
    governor: '治理员',
    advisor: '顾问',
    customerName: '客户名称',
    customerPhone: '客户手机',
    intentGrade: '意向级别',
    leadStatus: '线索状态',
    customerCrossStore: '是否跨门店',
    customerStoreCountRange: '关联门店数',
    customerMultiLead: '是否多线索',
    customerLeadCountRange: '关联线索数',
    customerAudioCountRange: '关联录音数',
    customerRecordCoverage: '线索录音覆盖',
    customerStoreRecordCoverage: '门店录音覆盖',
    customerStatus: '最新线索状态'
  };

  var ORGANIZATION_DEPENDENCIES = {
    brand: [],
    region: ['brand'],
    zone: ['brand', 'region'],
    province: ['brand'],
    city: ['brand', 'province'],
    patroler: ['brand'],
    governor: ['brand'],
    store: ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor'],
    advisor: ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor', 'store']
  };

  var LEAD_COLUMNS = [
    column('id', '线索ID', 24),
    column('brand', '品牌', 12),
    column('province', '省份', 14),
    column('city', '城市', 14),
    column('dealerCode', '店代码', 16),
    column('store', '门店', 22),
    column('region', '大区', 16),
    column('zone', '战区', 16),
    column('patroler', '巡回员', 14),
    column('governor', '治理员', 14),
    column('advisorName', '顾问', 14),
    column('customerName', '客户名称', 14),
    column('customerPhone', '客户手机', 17),
    column('intentGrade', '意向级别', 12),
    column('carSeries', '意向车系', 18),
    column('leadStatus', '线索状态', 14),
    column('leadDate', '线索日期', 15),
    column('leadSource', '一级来源', 15),
    column('secondSource', '二级来源', 18),
    column('thirdSource', '三级来源', 22),
    column('fourthSource', '四级来源', 24),
    column('recordingCount', '录音数量', 12),
    column('validRecording', '是否有录音', 14),
    column('aiLeadValidity', 'AI线索有效性', 17),
    column('lastContact', '最近一次联系时间', 20)
  ];

  var CUSTOMER_COLUMNS = [
    column('brand', '品牌', 12),
    column('province', '省份', 14),
    column('city', '城市', 14),
    column('dealerCode', '店代码', 16),
    column('store', '门店', 22),
    column('region', '大区', 16),
    column('zone', '战区', 16),
    column('patroler', '巡回员', 14),
    column('governor', '治理员', 14),
    column('advisorName', '顾问', 14),
    column('customerName', '客户姓名', 14),
    column('customerPhone', '客户手机号', 17),
    column('crossStore', '是否跨门店', 14),
    column('aggregateStoreCount', '关联门店数', 14),
    column('multiLead', '是否多线索', 14),
    column('aggregateLeadCount', '关联线索数', 14),
    column('aggregateAudioCount', '关联录音数', 14),
    column('recordCoverage', '线索录音覆盖', 20),
    column('storeRecordCoverage', '门店录音覆盖', 20),
    column('leadStatus', '最新线索状态', 16),
    column('firstLeadIssuedAt', '线索首次下发时间', 20),
    column('latestLeadIssuedAt', '线索最新下发时间', 20),
    column('firstRecordingAt', '首次录音时间', 20),
    column('latestRecordingAt', '最近录音时间', 20),
    column('associationSummary', '关联概况', 38)
  ];

  function column(key, label, width) {
    return { key: key, label: label, width: width };
  }

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stableHash(value) {
    var hash = 2166136261;
    var input = text(value);
    for (var index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function dealerKey(brand, dealerCode) {
    return text(brand) + '::' + text(dealerCode);
  }

  function storeValue(record) {
    return dealerKey(record.brand, record.dealerCode);
  }

  function advisorValue(record) {
    return storeValue(record) + '::' + text(record.advisorName);
  }

  function staffValue(record, key) {
    var idKey = key === 'patroler' ? 'patrolerId' : 'governorId';
    var value = text(record[idKey]);
    return value || (record[key] ? record.brand + '::' + key + '::' + record[key] : '');
  }

  var directoryByDealer = new Map(sourceDirectory.map(function (dealer) {
    return [dealerKey(dealer.brand, dealer.dealerCode), dealer];
  }));
  var recordOrganizationByDealer = new Map();
  sourceRows.forEach(function (record) {
    var key = dealerKey(record.brand, record.dealerCode);
    if (!recordOrganizationByDealer.has(key)) recordOrganizationByDealer.set(key, record);
  });

  var records = sourceRows.map(function (row) {
    var directory = directoryByDealer.get(dealerKey(row.brand, row.dealerCode)) || {};
    var hash = stableHash(row.id);
    var minuteOfDay = (9 * 60) + (hash % (11 * 60));
    var hours = String(Math.floor(minuteOfDay / 60)).padStart(2, '0');
    var minutes = String(minuteOfDay % 60).padStart(2, '0');
    var recordingCount = Math.max(0, Number(row.recordingCount) || 0);
    return Object.assign({}, row, {
      id: text(row.id),
      patroler: text(directory.patroler),
      patrolerId: text(directory.patrolerId),
      governor: text(directory.governor),
      governorId: text(directory.governorId),
      advisorId: advisorValue(row),
      recordStartTime: row.leadDate + ' 00:00',
      leadIssuedAt: row.leadDate + ' 00:00',
      lastContact: row.leadDate + ' ' + hours + ':' + minutes,
      aiLeadValidity: recordingCount === 0 ? '暂未分析' : (hash % 2 ? '有效' : '无效')
    });
  }).sort(function (left, right) {
    return right.leadDate.localeCompare(left.leadDate) || right.id.localeCompare(left.id);
  });

  var dealers = sourceDirectory.map(function (dealer) {
    var override = recordOrganizationByDealer.get(dealerKey(dealer.brand, dealer.dealerCode));
    if (!override) return dealer;
    return Object.assign({}, dealer, {
      brand: override.brand,
      province: override.province,
      city: override.city,
      dealerCode: override.dealerCode,
      dealerName: override.store,
      area: override.region,
      zone: override.zone
    });
  });

  global.__LEADS_EFFECTIVE_DATA = records;

  function createState(view) {
    return {
      view: view,
      dimensionMode: 'organization',
      collapsed: true,
      selections: {},
      startDate: DEFAULT_DATE,
      endDate: DEFAULT_DATE,
      dateDraftStart: DEFAULT_DATE,
      dateDraftEnd: DEFAULT_DATE,
      dateActiveField: 'startDate',
      dateViewYear: 2026,
      dateViewMonth: 9,
      openMenu: null,
      closingMenu: null,
      menuQueries: {},
      menuOrder: {},
      page: 1,
      pageSize: 10,
      pageMenuOpen: false,
      settingsOpen: false,
      workingColumns: null,
      dragColumn: ''
    };
  }

  var requestedView = new URLSearchParams(global.location.search).get('leadsView');
  var currentView = requestedView === 'customers' ? 'customers' : 'leads';
  var states = {
    leads: createState('leads'),
    customers: createState('customers')
  };
  var columnSettings = {
    leads: loadColumnSettings('leads', LEAD_COLUMNS),
    customers: loadColumnSettings('customers', CUSTOMER_COLUMNS)
  };
  var lastRenderedMenu = { leads: null, customers: null };
  var customerRecords = buildCustomerRecords(records);
  var installedFilterHost = null;
  var validityTooltipHideTimer = 0;
  var validityTooltipAnchor = null;
  var refreshTimer = 0;
  var fieldSettingsCloseTimer = 0;
  var fieldSettingsDragController = global.__fieldSettingsInteractions.createController({
    listSelector: '#leadsModernFieldSettings .badge-field-settings-list',
    itemSelector: '[data-lr-column-item]',
    scrollerSelector: '#leadsModernFieldSettings .badge-field-settings-body',
    enabled: function () { return Boolean(state().settingsOpen && state().workingColumns); },
    getKey: function (item) { return item.dataset.lrColumnItem; },
    onOrderChange: function (order) { if (state().workingColumns) state().workingColumns.order = order; }
  });

  function storageKey(view) {
    return 'aiqc-leads-modern-columns-' + view;
  }

  function defaultColumnSettings(columns) {
    return { order: columns.map(function (item) { return item.key; }), hidden: [] };
  }

  function loadColumnSettings(view, columns) {
    var fallback = defaultColumnSettings(columns);
    try {
      var saved = JSON.parse(global.localStorage.getItem(storageKey(view)) || 'null');
      if (!saved || !Array.isArray(saved.order) || !Array.isArray(saved.hidden)) return fallback;
      var validKeys = columns.map(function (item) { return item.key; });
      var order = saved.order.filter(function (key) { return validKeys.includes(key); });
      validKeys.forEach(function (key) { if (!order.includes(key)) order.push(key); });
      return { order: order, hidden: saved.hidden.filter(function (key) { return validKeys.includes(key); }) };
    } catch (error) {
      return fallback;
    }
  }

  function saveColumnSettings(view) {
    global.localStorage.setItem(storageKey(view), JSON.stringify(columnSettings[view]));
  }

  function state() {
    return states[currentView];
  }

  function selected(key, targetState) {
    var viewState = targetState || state();
    return Array.isArray(viewState.selections[key]) ? viewState.selections[key] : [];
  }

  function setSelected(key, values, targetState) {
    var viewState = targetState || state();
    viewState.selections[key] = Array.from(new Set(values.filter(Boolean)));
  }

  function getColumns(view) {
    return view === 'customers' ? CUSTOMER_COLUMNS : LEAD_COLUMNS;
  }

  function getColumn(view, key) {
    return getColumns(view).find(function (item) { return item.key === key; });
  }

  function visibleColumns(view) {
    var settings = columnSettings[view];
    return settings.order
      .filter(function (key) { return !settings.hidden.includes(key); })
      .map(function (key) { return getColumn(view, key); })
      .filter(Boolean);
  }

  function isColumnVisible(key, view) {
    return !columnSettings[view || currentView].hidden.includes(key);
  }

  function filterVisible(key, view) {
    view = view || currentView;
    var map = {
      advisor: 'advisorName',
      customerStatus: 'leadStatus',
      customerCrossStore: 'crossStore',
      customerStoreCountRange: 'aggregateStoreCount',
      customerMultiLead: 'multiLead',
      customerLeadCountRange: 'aggregateLeadCount',
      customerAudioCountRange: 'aggregateAudioCount',
      customerRecordCoverage: 'recordCoverage',
      customerStoreRecordCoverage: 'storeRecordCoverage'
    };
    if (key === 'date') {
      return view === 'leads'
        ? isColumnVisible('leadDate', view)
        : ['firstLeadIssuedAt', 'latestLeadIssuedAt', 'firstRecordingAt', 'latestRecordingAt'].some(function (columnKey) { return isColumnVisible(columnKey, view); });
    }
    return isColumnVisible(map[key] || key, view);
  }

  function option(value, label, meta, search) {
    return { value: text(value), label: text(label || value), meta: text(meta), search: text(search) };
  }

  function uniqueOptions(items) {
    var seen = new Set();
    return items.filter(function (item) {
      if (!item.value || seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    }).sort(function (left, right) {
      return left.label.localeCompare(right.label, 'zh-CN', { numeric: true });
    });
  }

  function dealerFieldValue(dealer, key) {
    if (key === 'region') return text(dealer.area);
    if (key === 'store') return dealerKey(dealer.brand, dealer.dealerCode);
    if (key === 'patroler') return text(dealer.patrolerId) || (dealer.patroler ? dealer.brand + '::patroler::' + dealer.patroler : '');
    if (key === 'governor') return text(dealer.governorId) || (dealer.governor ? dealer.brand + '::governor::' + dealer.governor : '');
    return text(dealer[key]);
  }

  function recordFieldValue(record, key) {
    if (key === 'store') return storeValue(record);
    if (key === 'advisor') return advisorValue(record);
    if (key === 'patroler' || key === 'governor') return staffValue(record, key);
    return text(record[key]);
  }

  function matchesValues(value, values) {
    return !values.length || values.includes(text(value));
  }

  function dealerMatchesDependencies(dealer, key, targetState) {
    return (ORGANIZATION_DEPENDENCIES[key] || []).every(function (dependency) {
      return matchesValues(dealerFieldValue(dealer, dependency), selected(dependency, targetState));
    });
  }

  function recordMatchesOrganization(record, targetState, ignoreKey) {
    return ORGANIZATION_KEYS.every(function (key) {
      if (key === ignoreKey) return true;
      return matchesValues(recordFieldValue(record, key), selected(key, targetState));
    });
  }

  function organizationOptions(key, targetState) {
    if (key === 'advisor') {
      return uniqueOptions(records
        .filter(function (record) {
          return (ORGANIZATION_DEPENDENCIES.advisor || []).every(function (dependency) {
            return matchesValues(recordFieldValue(record, dependency), selected(dependency, targetState));
          });
        })
        .map(function (record) {
          return option(advisorValue(record), record.advisorName, record.store + ' · ' + record.dealerCode, record.brand);
        }));
    }
    var candidates = dealers.filter(function (dealer) { return dealerMatchesDependencies(dealer, key, targetState); });
    if (key === 'store') {
      return uniqueOptions(candidates.map(function (dealer) {
        return option(dealerKey(dealer.brand, dealer.dealerCode), dealer.dealerName, dealer.dealerCode, dealer.brand);
      }));
    }
    if (key === 'patroler' || key === 'governor') {
      return uniqueOptions(candidates.map(function (dealer) {
        return option(dealerFieldValue(dealer, key), dealer[key], dealer.brand);
      }));
    }
    return uniqueOptions(candidates.map(function (dealer) {
      return option(dealerFieldValue(dealer, key), dealerFieldValue(dealer, key));
    }));
  }

  function rangeMatch(value, range) {
    var number = Number(value) || 0;
    if (range === '1条' || range === '1家') return number === 1;
    if (range === '2条' || range === '2家') return number === 2;
    if (range === '3条' || range === '3家') return number === 3;
    if (range === '4条及以上' || range === '4家及以上') return number >= 4;
    return true;
  }

  function currentOptions(key, targetState) {
    targetState = targetState || state();
    if (ORGANIZATION_KEYS.includes(key)) return organizationOptions(key, targetState);
    if (key === 'customerCrossStore' || key === 'customerMultiLead') return ['是', '否'].map(function (value) { return option(value); });
    if (key === 'customerStoreCountRange') return ['1家', '2家', '3家', '4家及以上'].map(function (value) { return option(value); });
    if (key === 'customerLeadCountRange' || key === 'customerAudioCountRange') return ['1条', '2条', '3条', '4条及以上'].map(function (value) { return option(value); });
    if (key === 'customerRecordCoverage' || key === 'customerStoreRecordCoverage') return ['全部有录音', '部分有录音', '全部无录音'].map(function (value) { return option(value); });
    var source = targetState.view === 'customers' ? customerRecords : records.filter(function (record) {
      return recordMatchesOrganization(record, targetState);
    });
    var sourceKey = key === 'customerStatus' ? 'leadStatus' : key;
    return uniqueOptions(source.map(function (item) { return option(item[sourceKey]); }));
  }

  function pruneOrganizationSelections(targetState) {
    var changed = false;
    ORGANIZATION_KEYS.forEach(function (key) {
      var allowed = new Set(organizationOptions(key, targetState).map(function (item) { return item.value; }));
      var next = selected(key, targetState).filter(function (value) { return allowed.has(value); });
      if (next.length !== selected(key, targetState).length) {
        setSelected(key, next, targetState);
        changed = true;
      }
    });
    return changed;
  }

  function getRecordCoverage(total, recorded) {
    if (!recorded) return '全部无录音';
    if (recorded >= total) return '全部有录音';
    return '部分有录音';
  }

  function buildCustomerRecords(input) {
    var groups = new Map();
    input.forEach(function (record) {
      var key = record.customerPhone + '::' + record.customerName;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    });
    return Array.from(groups.values()).map(function (items) {
      items.sort(function (left, right) {
        return right.leadDate.localeCompare(left.leadDate) || right.id.localeCompare(left.id);
      });
      var latest = items[0];
      var values = {};
      ['brand', 'province', 'city', 'dealerCode', 'store', 'region', 'zone', 'patroler', 'governor', 'advisorName'].forEach(function (key) {
        values[key] = Array.from(new Set(items.map(function (item) { return text(item[key]); }).filter(Boolean)));
      });
      var storeSet = new Set(items.map(storeValue));
      var recordedItems = items.filter(function (item) { return Number(item.recordingCount) > 0; });
      var recordedStoreSet = new Set(recordedItems.map(storeValue));
      var audioCount = items.reduce(function (sum, item) { return sum + (Number(item.recordingCount) || 0); }, 0);
      return Object.assign({}, latest, {
        aggregateLeadRecords: items,
        aggregateValues: values,
        aggregateLeadCount: items.length,
        aggregateStoreCount: storeSet.size,
        aggregateAudioCount: audioCount,
        aggregateHasRecordCount: recordedItems.length,
        aggregateRecordedStoreCount: recordedStoreSet.size,
        crossStore: storeSet.size > 1,
        multiLead: items.length > 1,
        recordCoverage: getRecordCoverage(items.length, recordedItems.length),
        storeRecordCoverage: getRecordCoverage(storeSet.size, recordedStoreSet.size),
        firstLeadIssuedAt: items[items.length - 1].leadDate,
        latestLeadIssuedAt: latest.leadDate,
        firstRecordingAt: items[items.length - 1].leadDate,
        latestRecordingAt: latest.leadDate,
        associationSummary: '关联' + items.length + '条线索，' + storeSet.size + '家门店，' + audioCount + '条录音，其中' + recordedStoreSet.size + '家门店有录音'
      });
    }).sort(function (left, right) {
      return right.latestLeadIssuedAt.localeCompare(left.latestLeadIssuedAt) || right.id.localeCompare(left.id);
    });
  }

  function filteredLeadRecords(targetState) {
    return records.filter(function (record) {
      return recordMatchesOrganization(record, targetState)
        && matchesValues(record.leadStatus, selected('leadStatus', targetState))
        && matchesValues(record.intentGrade, selected('intentGrade', targetState))
        && matchesValues(record.customerName, selected('customerName', targetState))
        && matchesValues(record.customerPhone, selected('customerPhone', targetState))
        && (!targetState.startDate || record.leadDate >= targetState.startDate)
        && (!targetState.endDate || record.leadDate <= targetState.endDate);
    });
  }

  function filteredCustomerRecords(targetState) {
    return customerRecords.filter(function (customer) {
      var organizationMatch = customer.aggregateLeadRecords.some(function (record) {
        return recordMatchesOrganization(record, targetState);
      });
      var crossStoreValues = selected('customerCrossStore', targetState);
      var multiLeadValues = selected('customerMultiLead', targetState);
      var storeRanges = selected('customerStoreCountRange', targetState);
      var leadRanges = selected('customerLeadCountRange', targetState);
      var audioRanges = selected('customerAudioCountRange', targetState);
      var datesMatch = customer.aggregateLeadRecords.some(function (record) {
        return (!targetState.startDate || record.leadDate >= targetState.startDate)
          && (!targetState.endDate || record.leadDate <= targetState.endDate);
      });
      return organizationMatch
        && matchesValues(customer.crossStore ? '是' : '否', crossStoreValues)
        && matchesValues(customer.multiLead ? '是' : '否', multiLeadValues)
        && (!storeRanges.length || storeRanges.some(function (range) { return rangeMatch(customer.aggregateStoreCount, range); }))
        && (!leadRanges.length || leadRanges.some(function (range) { return rangeMatch(customer.aggregateLeadCount, range); }))
        && (!audioRanges.length || audioRanges.some(function (range) { return rangeMatch(customer.aggregateAudioCount, range); }))
        && matchesValues(customer.recordCoverage, selected('customerRecordCoverage', targetState))
        && matchesValues(customer.storeRecordCoverage, selected('customerStoreRecordCoverage', targetState))
        && matchesValues(customer.leadStatus, selected('customerStatus', targetState))
        && datesMatch;
    });
  }

  function filteredRecords() {
    return currentView === 'customers' ? filteredCustomerRecords(state()) : filteredLeadRecords(state());
  }

  function selectionText(key) {
    var values = selected(key);
    if (!values.length) return '请选择' + FILTER_LABELS[key];
    var options = currentOptions(key);
    var labels = values.map(function (value) {
      var item = options.find(function (entry) { return entry.value === value; });
      return item ? item.label : value;
    });
    if (labels.length <= 2) return labels.join('、');
    return labels[0] + '等 ' + labels.length + ' 项';
  }

  function normalizedQuery(value) {
    return text(value).toLowerCase().replace(/\s+/g, '');
  }

  function filteredOptions(key) {
    var viewState = state();
    var query = normalizedQuery(viewState.menuQueries[key]);
    var options = currentOptions(key);
    var order = viewState.menuOrder[key] || [];
    options.sort(function (left, right) {
      var leftIndex = order.indexOf(left.value);
      var rightIndex = order.indexOf(right.value);
      if (leftIndex >= 0 || rightIndex >= 0) return (leftIndex < 0 ? 999999 : leftIndex) - (rightIndex < 0 ? 999999 : rightIndex);
      return left.label.localeCompare(right.label, 'zh-CN', { numeric: true });
    });
    if (!query) return options;
    return options.filter(function (item) {
      return normalizedQuery(item.label + item.meta + item.search).includes(query);
    });
  }

  function renderOptionMenu(key) {
    var options = filteredOptions(key);
    var values = selected(key);
    var selectedCount = options.filter(function (item) { return values.includes(item.value); }).length;
    var allActive = options.length > 0 && selectedCount === options.length;
    var partial = selectedCount > 0 && !allActive;
    var placeholder = key === 'store' ? '输入店名或店代码' : '搜索' + FILTER_LABELS[key];
    return '<div class="session-menu-panel badge-advisor-menu lr-filter-menu" data-lr-menu="' + escapeHtml(key) + '" role="dialog">' +
      '<label class="badge-advisor-search"><span aria-hidden="true"></span><input type="search" data-lr-menu-search="' + escapeHtml(key) + '" value="' + escapeHtml(state().menuQueries[key] || '') + '" placeholder="' + escapeHtml(placeholder) + '" autocomplete="off"></label>' +
      '<button type="button" class="badge-advisor-select-all' + (allActive ? ' is-selected' : '') + (partial ? ' is-partial' : '') + '" data-lr-select-all="' + escapeHtml(key) + '"' + (options.length ? '' : ' disabled') + '><span class="badge-advisor-option-check" aria-hidden="true">' + (allActive ? '✓' : '') + '</span><span>全选</span><strong>共 ' + options.length + ' 条数据</strong></button>' +
      '<div class="badge-advisor-options" role="listbox" aria-multiselectable="true">' +
        (options.length ? options.map(function (item) {
          var active = values.includes(item.value);
          return '<button type="button" class="badge-advisor-option' + (active ? ' is-selected' : '') + '" data-lr-option-key="' + escapeHtml(key) + '" data-lr-option-value="' + escapeHtml(item.value) + '" role="option" aria-selected="' + active + '"><span class="badge-advisor-option-check" aria-hidden="true">' + (active ? '✓' : '') + '</span><span class="badge-advisor-option-copy"><strong>' + escapeHtml(item.label) + '</strong>' + (item.meta ? '<small>' + escapeHtml(item.meta) + '</small>' : '') + '</span></button>';
        }).join('') : '<div class="badge-advisor-empty">未找到匹配数据</div>') +
      '</div></div>';
  }

  function menuVisible(key) {
    return state().openMenu === key || state().closingMenu === key;
  }

  function renderFilterControl(key) {
    var open = state().openMenu === key;
    var placeholder = !selected(key).length;
    return '<div class="badge-field-filter badge-field-filter-select session-toolbar-menu' + (open ? ' is-open' : '') + '" data-lr-control="' + escapeHtml(key) + '">' +
      '<span>' + escapeHtml(FILTER_LABELS[key]) + '</span>' +
      '<button type="button" class="session-select-trigger' + (open ? ' active' : '') + '" data-lr-trigger="' + escapeHtml(key) + '" aria-expanded="' + open + '"><strong class="' + (placeholder ? 'is-placeholder' : '') + '">' + escapeHtml(selectionText(key)) + '</strong><i class="session-select-caret" aria-hidden="true"></i></button>' +
      (menuVisible(key) ? renderOptionMenu(key) : '') + '</div>';
  }

  function formatDateDisplay(value) {
    return value ? value.replace(/-/g, '/') : '不限';
  }

  function formatDateValue(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function dateCells() {
    var viewState = state();
    var firstDay = new Date(viewState.dateViewYear, viewState.dateViewMonth - 1, 1);
    var leading = (firstDay.getDay() + 6) % 7;
    var last = new Date(viewState.dateViewYear, viewState.dateViewMonth, 0).getDate();
    var cells = [];
    for (var blank = 0; blank < leading; blank += 1) cells.push(null);
    for (var day = 1; day <= last; day += 1) {
      var value = viewState.dateViewYear + '-' + String(viewState.dateViewMonth).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      cells.push({
        day: day,
        value: value,
        inRange: value >= viewState.dateDraftStart && value <= viewState.dateDraftEnd,
        isStart: value === viewState.dateDraftStart,
        isEnd: value === viewState.dateDraftEnd,
        isToday: value === formatDateValue(new Date())
      });
    }
    while (cells.length % 7) cells.push(null);
    return cells;
  }

  function renderDatePanel() {
    var renderer = global.__dateFilterComponentUtils && global.__dateFilterComponentUtils.renderDateRangePanelMarkup;
    if (!renderer) return '';
    var viewState = state();
    return renderer({
      dataNamespace: 'lr-date',
      rangeText: formatDateDisplay(viewState.dateDraftStart) + ' 至 ' + formatDateDisplay(viewState.dateDraftEnd),
      monthLabel: viewState.dateViewYear + '年' + viewState.dateViewMonth + '月',
      activeField: viewState.dateActiveField,
      startLabel: formatDateDisplay(viewState.dateDraftStart),
      endLabel: formatDateDisplay(viewState.dateDraftEnd),
      cells: dateCells(),
      summaryText: '已选择 ' + formatDateDisplay(viewState.dateDraftStart) + ' 至 ' + formatDateDisplay(viewState.dateDraftEnd),
      panelClassName: 'session-menu-panel session-menu-panel-date lr-date-panel',
      title: '线索日期范围',
      shortcuts: [
        { key: 'today', label: '今天' },
        { key: 'last3', label: '近3天' },
        { key: 'last7', label: '近7天' }
      ]
    });
  }

  function renderDateControl() {
    var open = state().openMenu === 'date';
    return '<div class="badge-field-filter badge-field-filter-date-time session-toolbar-menu session-toolbar-control-date' + (open ? ' is-open' : '') + '">' +
      '<span>线索日期</span><button type="button" class="session-date-trigger' + (open ? ' active' : '') + '" data-lr-date-trigger aria-expanded="' + open + '"><strong>' + escapeHtml(formatDateDisplay(state().startDate)) + '</strong><em>至</em><strong>' + escapeHtml(formatDateDisplay(state().endDate)) + '</strong><span class="session-date-icon" aria-hidden="true"></span></button>' +
      (menuVisible('date') ? renderDatePanel() : '') + '</div>';
  }

  function dimensionKeys() {
    return state().dimensionMode === 'geography'
      ? ['brand', 'province', 'city', 'store']
      : ['brand', 'region', 'zone', 'store'];
  }

  function renderDimensionSwitcher() {
    var viewState = state();
    var keys = dimensionKeys();
    var path = keys.map(function (key) {
      var values = selected(key);
      if (!values.length) return '全部' + FILTER_LABELS[key];
      var options = currentOptions(key);
      if (values.length === 1) {
        var found = options.find(function (item) { return item.value === values[0]; });
        return found ? found.label : values[0];
      }
      return values.length + '项' + FILTER_LABELS[key];
    }).map(function (label, index) {
      return (index ? '<i class="session-select-caret badge-filter-dimension-path-arrow" aria-hidden="true"></i>' : '') + '<span>' + escapeHtml(label) + '</span>';
    }).join('');
    return '<div class="badge-filter-dimension-row"><div class="badge-filter-dimension-switcher" role="tablist">' +
      '<button type="button" class="' + (viewState.dimensionMode === 'organization' ? 'active' : '') + '" data-lr-dimension="organization">组织维度</button>' +
      '<button type="button" class="' + (viewState.dimensionMode === 'geography' ? 'active' : '') + '" data-lr-dimension="geography">地理维度</button></div>' +
      '<div class="badge-filter-dimension-path"><img src="../assets/filter-path-icon.svg" alt="" aria-hidden="true"><span class="badge-filter-dimension-path-label">当前路径：</span><strong>' + path + '</strong></div></div>';
  }

  function secondaryKeys() {
    var common = ['patroler', 'governor', 'advisor'];
    return currentView === 'customers'
      ? common.concat(['customerCrossStore', 'customerStoreCountRange', 'customerMultiLead', 'customerLeadCountRange', 'customerAudioCountRange', 'customerRecordCoverage', 'customerStoreRecordCoverage', 'customerStatus'])
      : common.concat(['leadStatus', 'intentGrade', 'customerName', 'customerPhone']);
  }

  function renderFilterActions() {
    return '<div class="badge-dynamic-filter-actions"><span></span><div><button type="button" class="btn session-reset-btn" data-lr-reset>重置</button><button type="button" class="session-toggle-text-btn" data-lr-collapse aria-expanded="' + !state().collapsed + '"><span>' + (state().collapsed ? '展开' : '收起') + '</span><svg class="session-toggle-text-btn-icon' + (state().collapsed ? ' is-collapsed' : '') + '" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div>';
  }

  function settleExtra(extra, collapsed) {
    if (!extra) return;
    extra.style.height = collapsed ? '0px' : '';
    extra.style.overflow = collapsed ? 'clip' : '';
    extra.style.pointerEvents = collapsed ? 'none' : '';
    extra.setAttribute('aria-hidden', String(collapsed));
    if (collapsed) extra.setAttribute('inert', '');
    else extra.removeAttribute('inert');
  }

  function animateMenu(panel, mode) {
    if (!panel || global.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    var from = mode === 'in' ? { opacity: 0, transform: 'translateY(-8px)' } : { opacity: 1, transform: 'translateY(0)' };
    var to = mode === 'in' ? { opacity: 1, transform: 'translateY(0)' } : { opacity: 0, transform: 'translateY(-8px)' };
    panel.style.pointerEvents = mode === 'out' ? 'none' : '';
    return panel.animate([from, to], { duration: FILTER_MOTION_MS, easing: FILTER_MOTION_EASE, fill: 'forwards' });
  }

  function renderFilters() {
    var host = document.getElementById('leadsFilterControls');
    if (!host) return;
    var previousExtra = host.querySelector('[data-lr-extra]');
    var previousHeight = previousExtra ? previousExtra.getBoundingClientRect().height : 0;
    var collapseChanged = host.childElementCount > 0 && host.classList.contains('is-collapsed') !== state().collapsed;
    var closingInProgress = host._lrMenuAnimation
      && host._lrMenuAnimation.playState === 'running'
      && state().closingMenu
      && !state().openMenu;
    if (closingInProgress && !collapseChanged) return;
    if (host._lrMenuAnimation) {
      host._lrMenuAnimation.cancel();
      host._lrMenuAnimation = null;
    }
    if (host._lrCollapseAnimation) {
      host._lrCollapseAnimation.cancel();
      host._lrCollapseAnimation = null;
    }
    var primary = dimensionKeys().filter(function (key) { return filterVisible(key); });
    var secondary = secondaryKeys().filter(function (key) { return filterVisible(key); });
    var extraInner = secondary.map(renderFilterControl).join('') + (filterVisible('date') ? renderDateControl() : '');
    var keepExtra = extraInner && (!state().collapsed || collapseChanged);
    host.className = 'session-filter-toolbar leads-modern-filters' + (state().collapsed ? ' is-collapsed' : '');
    host.setAttribute('data-lr-installed', 'true');
    host.innerHTML = renderDimensionSwitcher() +
      '<div class="lr-filter-primary"><div class="badge-dynamic-filter-grid">' + primary.map(renderFilterControl).join('') + '</div>' + (state().collapsed ? renderFilterActions() : '') + '</div>' +
      (keepExtra ? '<div class="lr-filter-extra" data-lr-extra><div class="lr-filter-extra-inner"><div class="badge-dynamic-filter-grid">' + extraInner + '</div></div></div>' : '') +
      (state().collapsed ? '' : renderFilterActions());
    var extra = host.querySelector('[data-lr-extra]');
    if (extra && collapseChanged && !global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var targetHeight = state().collapsed ? 0 : extra.getBoundingClientRect().height;
      extra.style.height = previousHeight + 'px';
      extra.style.overflow = 'clip';
      var collapseAnimation = extra.animate([{ height: previousHeight + 'px' }, { height: targetHeight + 'px' }], { duration: 280, easing: FILTER_MOTION_EASE, fill: 'forwards' });
      host._lrCollapseAnimation = collapseAnimation;
      var finishCollapse = function () {
        if (host._lrCollapseAnimation !== collapseAnimation) return;
        host._lrCollapseAnimation = null;
        collapseAnimation.cancel();
        settleExtra(extra, state().collapsed);
      };
      collapseAnimation.onfinish = finishCollapse;
      global.setTimeout(finishCollapse, 340);
    } else settleExtra(extra, state().collapsed);
    var panel = host.querySelector('.session-menu-panel');
    var shouldEnter = state().openMenu && state().openMenu !== lastRenderedMenu[currentView];
    var shouldExit = state().closingMenu && state().closingMenu === lastRenderedMenu[currentView];
    lastRenderedMenu[currentView] = state().openMenu;
    if (panel && shouldEnter) {
      var enter = animateMenu(panel, 'in');
      host._lrMenuAnimation = enter;
      if (enter) {
        var finishEnter = function () {
          if (host._lrMenuAnimation !== enter) return;
          host._lrMenuAnimation = null;
          enter.cancel();
          panel.style.opacity = '';
          panel.style.transform = '';
          panel.style.pointerEvents = '';
        };
        enter.onfinish = finishEnter;
        global.setTimeout(finishEnter, FILTER_MOTION_MS + 60);
      } else {
        host._lrMenuAnimation = null;
        panel.style.opacity = '';
        panel.style.transform = '';
        panel.style.pointerEvents = '';
      }
    } else if (panel && shouldExit) {
      var exit = animateMenu(panel, 'out');
      host._lrMenuAnimation = exit;
      var finishExit = function () {
        if (exit && host._lrMenuAnimation !== exit) return;
        host._lrMenuAnimation = null;
        state().closingMenu = null;
        lastRenderedMenu[currentView] = null;
        renderFilters();
      };
      if (exit) {
        exit.onfinish = finishExit;
        global.setTimeout(finishExit, FILTER_MOTION_MS + 60);
      } else finishExit();
    } else if (shouldExit) {
      state().closingMenu = null;
      lastRenderedMenu[currentView] = null;
    }
  }

  function closeMenu(instant) {
    var viewState = state();
    if (!viewState.openMenu && !viewState.closingMenu) return false;
    if (instant || global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewState.openMenu = null;
      viewState.closingMenu = null;
      lastRenderedMenu[currentView] = null;
    } else {
      if (viewState.openMenu) viewState.closingMenu = viewState.openMenu;
      viewState.openMenu = null;
    }
    renderFilters();
    return true;
  }

  function openMenu(key) {
    var viewState = state();
    viewState.closingMenu = null;
    viewState.openMenu = key;
    var options = currentOptions(key);
    var values = selected(key);
    viewState.menuOrder[key] = options.slice().sort(function (left, right) {
      return Number(values.includes(right.value)) - Number(values.includes(left.value));
    }).map(function (item) { return item.value; });
  }

  function aggregateCell(item, key, exportAll) {
    var values = item.aggregateValues[key] || [];
    if (!values.length) return '—';
    if (exportAll) return values.join('、');
    if (values.length === 1) return values[0];
    return values[0] + ' · 另 ' + (values.length - 1) + ' 个';
  }

  function displayValue(item, key, exportMode) {
    if (currentView === 'customers' && item.aggregateValues && ['brand', 'province', 'city', 'dealerCode', 'store', 'region', 'zone', 'patroler', 'governor', 'advisorName'].includes(key)) {
      return aggregateCell(item, key, exportMode);
    }
    if (key === 'crossStore') return item.crossStore ? '是' : '否';
    if (key === 'multiLead') return item.multiLead ? '是' : '否';
    if (key === 'recordingCount' || key === 'aggregateAudioCount') return String(Number(item[key]) || 0);
    return text(item[key]) || '—';
  }

  function renderCell(item, key) {
    var value = displayValue(item, key, false);
    if (key === 'leadStatus') return '<span class="status-inline"><span class="status-inline-dot" aria-hidden="true"></span><span>' + escapeHtml(value) + '</span></span>';
    if (key === 'intentGrade') return '<span class="pill-inline intent-grade-pill">' + escapeHtml(value) + '</span>';
    if (key === 'aiLeadValidity') return '<span class="ai-lead-validity-pill">' + escapeHtml(value) + '</span>';
    if (currentView === 'customers' && item.aggregateValues && item.aggregateValues[key] && item.aggregateValues[key].length > 1) {
      return '<span class="lr-multi-value" title="' + escapeHtml(item.aggregateValues[key].join('、')) + '">' + escapeHtml(value) + '</span>';
    }
    return escapeHtml(value);
  }

  function renderAiLeadValidityHeader() {
    return '<span class="session-intent-help lr-validity-header-help">' +
      '<span>AI线索有效性</span>' +
      '<button type="button" class="session-intent-help-btn" data-lr-validity-help aria-label="查看AI线索有效性判定标准" aria-describedby="leadsAiValidityRuleTooltip">?</button>' +
      '<span class="session-intent-rule-tooltip lr-validity-rule-tooltip" id="leadsAiValidityRuleTooltip" role="tooltip">' +
        '<table class="session-intent-rule-table"><thead><tr><th scope="col">结果</th><th scope="col">判定标准</th></tr></thead><tbody>' +
          '<tr><th scope="row">有效</th><td>线索下发后3天内，最多分析3通时长≥15秒的外呼录音；任意一通识别出“高/中/低”意向，即判定为有效，并以该意向作为最终结果。</td></tr>' +
          '<tr><th scope="row">无效</th><td>达到3天观察期或已分析满3通符合条件的录音，仍未出现“高/中/低”意向，且已分析录音中至少一通识别为“无”。</td></tr>' +
          '<tr><th scope="row">无法判断</th><td>达到3天观察期或已分析满3通符合条件的录音，仍未出现“高/中/低”意向，且已分析录音全部为“无法判断”。</td></tr>' +
          '<tr><th scope="row">分析中</th><td>3天观察期内，且尚未分析满3通符合条件的录音，暂未产生最终分析结果。</td></tr>' +
          '<tr><th scope="row">未分析</th><td>当前线索不在分析范围内，无判定结果。</td></tr>' +
        '</tbody></table>' +
      '</span>' +
    '</span>';
  }

  function validityTooltipEl() {
    return document.getElementById('leadsAiValidityRuleTooltip');
  }

  function restoreValidityTooltip() {
    var tooltip = validityTooltipEl();
    var host = document.querySelector('.lr-validity-header-help');
    if (!tooltip) {
      validityTooltipAnchor = null;
      return;
    }
    tooltip.classList.remove('is-open');
    if (host && tooltip.parentElement !== host) host.appendChild(tooltip);
    else if (!host && tooltip.parentElement === document.body) tooltip.remove();
    validityTooltipAnchor = null;
    var button = document.querySelector('[data-lr-validity-help]');
    if (button && (button.matches(':hover') || button.matches(':focus-visible'))) {
      showAiLeadValidityTooltip(button);
    }
  }

  function hideAiLeadValidityTooltip() {
    global.clearTimeout(validityTooltipHideTimer);
    validityTooltipHideTimer = global.setTimeout(restoreValidityTooltip, 160);
  }

  function positionAiLeadValidityTooltip(button, tooltip) {
    tooltip = tooltip || validityTooltipEl();
    if (!button || !tooltip) return;
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
    tooltip.style.setProperty('--lr-validity-tooltip-left', left + 'px');
    tooltip.style.setProperty('--lr-validity-tooltip-top', top + 'px');
    tooltip.style.setProperty('--lr-validity-tooltip-arrow-left', Math.min(Math.max(buttonRect.left + buttonRect.width / 2 - left - 4, 12), tooltipWidth - 20) + 'px');
  }

  function showAiLeadValidityTooltip(button) {
    var tooltip = validityTooltipEl();
    if (!button || !tooltip) return;
    global.clearTimeout(validityTooltipHideTimer);
    validityTooltipAnchor = button;
    if (tooltip.parentElement !== document.body) document.body.appendChild(tooltip);
    positionAiLeadValidityTooltip(button, tooltip);
    tooltip.classList.add('is-open');
    positionAiLeadValidityTooltip(button, tooltip);
  }

  function bindAiLeadValidityHelp(header) {
    var button = header && header.querySelector('[data-lr-validity-help]');
    var tooltip = validityTooltipEl();
    var wrap = document.querySelector('.leads-list-table-wrap');
    if (!button) return;
    button.addEventListener('pointerenter', function () { showAiLeadValidityTooltip(button); });
    button.addEventListener('mouseenter', function () { showAiLeadValidityTooltip(button); });
    button.addEventListener('pointerleave', hideAiLeadValidityTooltip);
    button.addEventListener('focus', function () { showAiLeadValidityTooltip(button); });
    button.addEventListener('blur', hideAiLeadValidityTooltip);
    if (tooltip && tooltip.dataset.lrBound !== 'true') {
      tooltip.dataset.lrBound = 'true';
      tooltip.addEventListener('pointerenter', function () { global.clearTimeout(validityTooltipHideTimer); });
      tooltip.addEventListener('pointerleave', hideAiLeadValidityTooltip);
    }
    if (wrap && wrap.dataset.lrValidityScrollBound !== 'true') {
      wrap.dataset.lrValidityScrollBound = 'true';
      wrap.addEventListener('scroll', function () {
        if (!validityTooltipAnchor) return;
        positionAiLeadValidityTooltip(validityTooltipAnchor);
      }, { passive: true });
    }
  }

  function renderTools(total) {
    var headbar = document.querySelector('.leads-table-headbar');
    if (!headbar) return;
    var summary = headbar.querySelector('.session-filter-summary');
    if (summary) summary.innerHTML = '<span>当前匹配 <strong id="leadsFilterCount">' + total + '</strong> 条' + (currentView === 'customers' ? '客户' : '线索') + '</span>';
    var tools = headbar.querySelector('.lr-table-tools');
    if (!tools) {
      tools = document.createElement('div');
      tools.className = 'badge-detail-table-head-tools lr-table-tools';
      headbar.appendChild(tools);
    }
    var canExport = total > 0 && visibleColumns(currentView).length > 0;
    tools.innerHTML = '<div class="badge-detail-table-actions"><button type="button" class="btn ghost badge-detail-table-action badge-detail-refresh-btn" data-lr-refresh aria-busy="false"><span class="badge-detail-refresh-icon" aria-hidden="true"></span><span>刷新</span></button><div class="badge-detail-export-action"><button type="button" class="btn primary badge-detail-table-action badge-detail-export-btn" data-lr-export ' + (canExport ? '' : 'disabled') + '><span class="badge-detail-export-icon" aria-hidden="true"></span><span>导出</span></button></div></div>';
  }

  function renderTable() {
    var table = document.getElementById('leadsDataTable');
    var header = document.getElementById('leadsTableHeader');
    var body = document.getElementById('leadsTableBody');
    if (!table || !header || !body) return;
    restoreValidityTooltip();
    var items = filteredRecords();
    var viewState = state();
    var totalPages = Math.max(1, Math.ceil(items.length / viewState.pageSize));
    viewState.page = Math.min(viewState.page, totalPages);
    var start = (viewState.page - 1) * viewState.pageSize;
    var pageItems = items.slice(start, start + viewState.pageSize);
    var columns = visibleColumns(currentView);
    header.innerHTML = '<tr>' + columns.map(function (item) {
      var label = item.key === 'aiLeadValidity' ? renderAiLeadValidityHeader() : escapeHtml(item.label);
      return '<th data-column-key="' + escapeHtml(item.key) + '">' + label + '</th>';
    }).join('') + '<th class="fixed-action-column">操作</th></tr>';
    bindAiLeadValidityHelp(header);
    body.innerHTML = pageItems.length ? pageItems.map(function (item) {
      var detail = currentView === 'customers'
        ? Number(item.aggregateAudioCount) <= 0
          ? '<button class="table-link table-link-disabled" type="button" disabled aria-disabled="true">查看详情</button>'
          : item.crossStore || Number(item.aggregateLeadCount) > 1
            ? '<button class="table-link" data-lr-customer-detail-id="' + escapeHtml(item.id) + '">查看详情</button>'
            : '<button class="table-link" data-lr-detail-id="' + escapeHtml(item.id) + '" data-lr-return-view="customers">查看详情</button>'
        : '<button class="table-link" data-lr-detail-id="' + escapeHtml(item.id) + '" data-lr-return-view="leads">线索详情</button>';
      return '<tr>' + columns.map(function (column) { return '<td>' + renderCell(item, column.key) + '</td>'; }).join('') + '<td class="fixed-action-column">' + detail + '</td></tr>';
    }).join('') : '<tr><td colspan="' + (columns.length + 1) + '"><div class="badge-list-empty-state is-inline"><strong>暂无符合条件的数据</strong><p>请调整筛选条件后重试</p></div></td></tr>';
    table.classList.add('badge-data-table', 'lr-data-table');
    var title = document.getElementById('leadsTableHeadTitle');
    if (title) title.textContent = currentView === 'customers' ? '客户聚合总览' : '线索总览';
    renderTools(items.length);
    renderPagination(items.length);
  }

  function paginationItems(totalPages, current) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, function (_, index) { return index + 1; });
    var pages = [1];
    if (current > 3) pages.push('left');
    for (var page = Math.max(2, current - 1); page <= Math.min(totalPages - 1, current + 1); page += 1) pages.push(page);
    if (current < totalPages - 2) pages.push('right');
    pages.push(totalPages);
    return pages;
  }

  function renderPagination(total) {
    var host = document.getElementById('leadsPagination');
    if (!host) return;
    var viewState = state();
    var totalPages = Math.max(1, Math.ceil(total / viewState.pageSize));
    host.innerHTML = '<div class="dashboard-pagination lr-pagination"><span class="session-pagination-total">共 ' + total + ' 条</span><div class="dashboard-pagination-controls">' +
      '<div class="custom-select-container page-select page-size-select' + (viewState.pageMenuOpen ? ' open' : '') + '"><button type="button" class="custom-select-trigger page-size-trigger" data-lr-page-size-trigger><span>' + viewState.pageSize + ' 条/页</span><i class="session-select-caret" aria-hidden="true"></i></button><div class="custom-select-options page-size-options">' + [10, 20, 50].map(function (size) { return '<button type="button" class="custom-option page-size-option' + (size === viewState.pageSize ? ' active' : '') + '" data-lr-page-size="' + size + '">' + size + ' 条/页</button>'; }).join('') + '</div></div>' +
      '<div class="page-group"><button type="button" class="page-arrow" data-lr-page-arrow="-1" ' + (viewState.page <= 1 ? 'disabled' : '') + '>‹</button>' + paginationItems(totalPages, viewState.page).map(function (page) { return typeof page === 'number' ? '<button type="button" class="page-num' + (page === viewState.page ? ' active' : '') + '" data-lr-page="' + page + '">' + page + '</button>' : '<span class="page-ellipsis">…</span>'; }).join('') + '<button type="button" class="page-arrow" data-lr-page-arrow="1" ' + (viewState.page >= totalPages ? 'disabled' : '') + '>›</button></div>' +
      '<div class="page-group page-jump-group"><span class="session-page-jump-label">前往</span><label class="page-select page-jump-select"><input type="number" min="1" max="' + totalPages + '" value="' + viewState.page + '" data-lr-page-jump></label><span class="session-page-jump-suffix">页</span></div></div></div>';
  }

  function renderViewTabs() {
    var host = document.getElementById('leadsViewTabs');
    if (!host) return;
    if (!host.querySelector('[data-lr-view]')) {
      host.innerHTML = '<span class="leads-view-tab-indicator" aria-hidden="true"></span><button type="button" class="leads-view-tab" data-lr-view="leads" role="tab">线索视图</button><button type="button" class="leads-view-tab" data-lr-view="customers" role="tab">客户聚合视图</button>';
    }
    var buttons = Array.from(host.querySelectorAll('[data-lr-view]'));
    buttons.forEach(function (button) {
      var active = button.dataset.lrView === currentView;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    var activeButton = buttons.find(function (button) { return button.dataset.lrView === currentView; });
    var indicator = host.querySelector('.leads-view-tab-indicator');
    if (!activeButton || !indicator) return;
    if (host.dataset.lrIndicatorReady !== 'true') {
      indicator.style.transition = 'none';
      indicator.style.left = activeButton.offsetLeft + 'px';
      indicator.style.width = activeButton.offsetWidth + 'px';
      indicator.offsetWidth;
      indicator.style.transition = '';
      host.dataset.lrIndicatorReady = 'true';
      return;
    }
    indicator.style.left = activeButton.offsetLeft + 'px';
    indicator.style.width = activeButton.offsetWidth + 'px';
  }

  function animateViewContent() {
    if (global.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var root = document.querySelector('#pageHost .leads-modern-root');
    if (!root) return;
    Array.from(root.querySelectorAll('.lr-filter-card, .lr-table-card')).forEach(function (surface) {
      if (surface._lrViewAnimation) surface._lrViewAnimation.cancel();
      var animation = surface.animate([
        { opacity: .82, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: VIEW_CONTENT_MOTION_MS,
        easing: FILTER_MOTION_EASE
      });
      surface._lrViewAnimation = animation;
      animation.onfinish = function () {
        if (surface._lrViewAnimation === animation) surface._lrViewAnimation = null;
      };
      animation.oncancel = function () {
        if (surface._lrViewAnimation === animation) surface._lrViewAnimation = null;
      };
    });
  }

  function renderToolbar() {
    var toolbar = document.getElementById('toolbarActions');
    if (!toolbar) return;
    toolbar.innerHTML = '<div class="badge-field-settings-action"><button type="button" class="btn badge-field-settings-trigger" data-lr-settings aria-expanded="' + state().settingsOpen + '"><svg class="badge-field-settings-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false"><path d="M6.675 15.75H2.625C2.4 15.75 2.25 15.6 2.25 15.375V2.625C2.25 2.4 2.4 2.25 2.625 2.25H13.425C13.65 2.25 13.8 2.4 13.8 2.625V7.575C13.8 7.95 14.1 8.325 14.55 8.325C15 8.325 15.3 8.025 15.3 7.575V2.625C15.3 1.575 14.475 0.75 13.425 0.75H2.625C1.575 0.75 0.75 1.575 0.75 2.625V15.375C0.75 16.425 1.575 17.25 2.625 17.25H6.675C7.05 17.25 7.425 16.95 7.425 16.5C7.425 16.05 7.125 15.75 6.675 15.75Z" fill="currentColor"/><path d="M6.67539 11.2502C7.12539 11.2502 7.42539 10.9502 7.42539 10.5002V5.32519H9.07539C9.52539 5.32519 9.82539 5.0252 9.82539 4.5752C9.82539 4.1252 9.52539 3.8252 9.07539 3.8252H4.27539C3.82539 3.8252 3.52539 4.1252 3.52539 4.5752C3.52539 5.0252 3.82539 5.32519 4.27539 5.32519H5.92539V10.5002C5.92539 10.9502 6.30039 11.2502 6.67539 11.2502ZM7.35039 12.5252H4.27539C3.82539 12.5252 3.52539 12.8252 3.52539 13.2752C3.52539 13.7252 3.82539 14.0252 4.27539 14.0252H7.35039C7.80039 14.0252 8.10039 13.7252 8.10039 13.2752C8.10039 12.8252 7.80039 12.5252 7.35039 12.5252ZM9.45039 8.7752H11.7004C12.1504 8.7752 12.4504 8.4752 12.4504 8.0252C12.4504 7.5752 12.1504 7.2752 11.7004 7.2752H9.45039C9.00039 7.2752 8.70039 7.5752 8.70039 8.0252C8.70039 8.4752 9.00039 8.7752 9.45039 8.7752ZM9.90039 11.2502C10.3504 11.2502 10.6504 10.9502 10.6504 10.5002C10.6504 10.0502 10.3504 9.7502 9.90039 9.7502H9.45039C9.00039 9.7502 8.70039 10.0502 8.70039 10.5002C8.70039 10.9502 9.00039 11.2502 9.45039 11.2502H9.90039ZM17.0254 11.2502L15.5254 9.7502C15.2254 9.4502 14.7754 9.4502 14.4754 9.7502L9.52539 14.6252C9.37539 14.7752 9.30039 14.9252 9.30039 15.1502V16.5002C9.30039 16.9502 9.60039 17.2502 10.0504 17.2502H11.7754C12.0004 17.2502 12.1504 17.1752 12.3004 17.0252L17.0254 12.3002C17.1754 12.1502 17.2504 12.0002 17.2504 11.7752C17.2504 11.5502 17.1754 11.4002 17.0254 11.2502ZM11.4754 15.7502H10.8004V15.3752L15.0004 11.2502L15.4504 11.7002L11.4754 15.7502Z" fill="currentColor"/></svg><span>字段设置</span></button></div>';
    if (toolbar.closest('.toolbar')) toolbar.closest('.toolbar').hidden = false;
  }

  function workingSettings() {
    if (!state().workingColumns) state().workingColumns = JSON.parse(JSON.stringify(columnSettings[currentView]));
    return state().workingColumns;
  }

  function renderFieldSettings(options) {
    var host = document.getElementById('leadsModernFieldSettings');
    if (!host) {
      host = document.createElement('div');
      host.id = 'leadsModernFieldSettings';
      document.body.appendChild(host);
    }
    document.body.classList.toggle('lr-settings-open', state().settingsOpen);
    if (!state().settingsOpen) {
      if (host.dataset.lrSettingsClosing === 'true') return;
      host.innerHTML = '';
      return;
    }
    global.clearTimeout(fieldSettingsCloseTimer);
    delete host.dataset.lrSettingsClosing;
    var animateOpen = Boolean(options && options.animateOpen && !host.querySelector('.badge-field-settings-drawer.open'));
    var working = workingSettings();
    var ordered = working.order.map(function (key) { return getColumn(currentView, key); }).filter(Boolean);
    var visibleCount = ordered.filter(function (item) { return !working.hidden.includes(item.key); }).length;
    host.innerHTML = '<div class="drawer-backdrop badge-field-settings-backdrop" data-lr-settings-close></div><aside class="drawer detail-drawer badge-field-settings-drawer' + (animateOpen ? '' : ' open') + '" role="dialog" aria-modal="true" aria-label="字段设置" aria-hidden="false">' +
      '<div class="drawer-head badge-field-settings-head"><div><h2>字段设置</h2><p>当前为' + (currentView === 'customers' ? '客户聚合视图' : '线索视图') + '，字段和筛选项独立保存</p></div><button type="button" class="icon-btn" data-lr-settings-close>×</button></div>' +
      '<div class="drawer-body badge-field-settings-body"><div class="badge-field-settings-summary"><span>已选 <strong>' + visibleCount + '</strong> / ' + ordered.length + ' 个字段</span><button type="button" data-lr-settings-select-all>全选</button></div><div class="badge-field-settings-list">' +
        ordered.map(function (item) {
          var visible = !working.hidden.includes(item.key);
          return '<div class="badge-field-settings-item' + (visible ? ' is-visible' : '') + '" draggable="false" data-lr-column-item="' + escapeHtml(item.key) + '"><span class="badge-field-drag-handle"><i></i><i></i><i></i></span><label><input type="checkbox" data-lr-column-visible="' + escapeHtml(item.key) + '" ' + (visible ? 'checked' : '') + '><span>' + escapeHtml(item.label) + '</span></label><small>' + (visible ? '已显示' : '已隐藏') + '</small></div>';
        }).join('') +
      '</div></div><div class="badge-field-settings-footer"><button type="button" class="btn ghost" data-lr-settings-restore>恢复默认</button><div><button type="button" class="btn ghost" data-lr-settings-close>取消</button><button type="button" class="btn primary" data-lr-settings-save>保存设置</button></div></div></aside>';
    if (animateOpen) global.requestAnimationFrame(function () {
      var drawer = host.querySelector('.badge-field-settings-drawer');
      if (!drawer || !state().settingsOpen) return;
      drawer.classList.add('open');
      var closeButton = drawer.querySelector('[data-lr-settings-close]');
      if (closeButton) closeButton.focus();
    });
  }

  function closeFieldSettings() {
    var host = document.getElementById('leadsModernFieldSettings');
    var drawer = host && host.querySelector('.badge-field-settings-drawer');
    if (fieldSettingsDragController) fieldSettingsDragController.cancel();
    state().settingsOpen = false;
    state().workingColumns = null;
    document.body.classList.remove('lr-settings-open');
    renderToolbar();
    if (!host || !drawer) {
      if (host) host.innerHTML = '';
      return;
    }
    host.dataset.lrSettingsClosing = 'true';
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    global.clearTimeout(fieldSettingsCloseTimer);
    var finish = function () {
      if (state().settingsOpen) return;
      delete host.dataset.lrSettingsClosing;
      host.innerHTML = '';
    };
    if (global.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else fieldSettingsCloseTimer = global.setTimeout(finish, 230);
  }

  function renderAll() {
    renderViewTabs();
    renderToolbar();
    renderFilters();
    renderTable();
    renderFieldSettings();
  }

  function resetFilters() {
    var replacement = createState(currentView);
    replacement.pageSize = state().pageSize;
    states[currentView] = replacement;
    lastRenderedMenu[currentView] = null;
    renderAll();
    showToast('筛选条件已重置');
  }

  function showToast(message) {
    var toast = document.getElementById('leadsModernToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'leadsModernToast';
      toast.className = 'badge-list-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    global.clearTimeout(showToast.timer);
    showToast.timer = global.setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function exportCurrent() {
    var exporter = global.__xlsxExportUtils && global.__xlsxExportUtils.downloadXlsx;
    var items = filteredRecords();
    var columns = visibleColumns(currentView);
    if (!columns.length) {
      showToast('请先在字段设置中至少显示一个字段');
      return;
    }
    if (!exporter || !items.length) return;
    var now = new Date();
    var stamp = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '_' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
    exporter({
      filename: (currentView === 'customers' ? '客户聚合列表_' : '线索列表_') + stamp + '.xlsx',
      sheetName: currentView === 'customers' ? '客户聚合列表' : '线索列表',
      columns: columns.map(function (item) { return { label: item.label, width: item.width }; }),
      rows: items.map(function (item) {
        return columns.map(function (column) { return displayValue(item, column.key, true); });
      })
    });
    showToast('已导出 ' + items.length + ' 条数据');
  }

  function applyColumnSettings() {
    var working = workingSettings();
    columnSettings[currentView] = JSON.parse(JSON.stringify(working));
    saveColumnSettings(currentView);
    var filterHost = document.getElementById('leadsFilterControls');
    if (filterHost && filterHost._lrMenuAnimation) {
      filterHost._lrMenuAnimation.cancel();
      filterHost._lrMenuAnimation = null;
    }
    state().openMenu = null;
    state().closingMenu = null;
    lastRenderedMenu[currentView] = null;
    Object.keys(state().selections).forEach(function (key) {
      if (!filterVisible(key)) setSelected(key, []);
    });
    if (!filterVisible('date')) {
      state().startDate = '';
      state().endDate = '';
    }
    state().page = 1;
    closeFieldSettings();
    renderAll();
    showToast('字段设置已保存');
  }

  function handleClick(event) {
    var target = event.target;
    var customerDetailButton = target.closest('[data-lr-customer-detail-id]');
    if (customerDetailButton) {
      var customer = customerRecords.find(function (item) {
        return item.id === customerDetailButton.dataset.lrCustomerDetailId;
      });
      if (customer && typeof global.__openLeadCustomerDetail === 'function') {
        global.__openLeadCustomerDetail(customer);
      }
      return;
    }
    var detailButton = target.closest('[data-lr-detail-id]');
    if (detailButton) {
      var detailUrl = new URL(global.location.href);
      detailUrl.searchParams.set('route', 'leads-detail');
      detailUrl.searchParams.set('leadId', detailButton.dataset.lrDetailId);
      detailUrl.searchParams.set('leadSource', 'leads');
      detailUrl.searchParams.set('leadReturnView', detailButton.dataset.lrReturnView || currentView);
      detailUrl.hash = 'leads-detail';
      global.location.href = detailUrl.toString();
      return;
    }
    var viewButton = target.closest('[data-lr-view]');
    if (viewButton) {
      if (viewButton.dataset.lrView === currentView) return;
      closeMenu(true);
      currentView = viewButton.dataset.lrView;
      var viewUrl = new URL(global.location.href);
      viewUrl.searchParams.set('leadsView', currentView);
      global.history.replaceState({}, '', viewUrl.toString());
      renderAll();
      animateViewContent();
      return;
    }
    if (!target.closest('#leadsFilterControls')) closeMenu(false);
    var dimension = target.closest('[data-lr-dimension]');
    if (dimension) {
      closeMenu(true);
      state().dimensionMode = dimension.dataset.lrDimension;
      ['region', 'zone', 'province', 'city', 'store'].forEach(function (key) { setSelected(key, []); });
      state().page = 1;
      renderAll();
      return;
    }
    var trigger = target.closest('[data-lr-trigger]');
    if (trigger) {
      var key = trigger.dataset.lrTrigger;
      if (state().openMenu === key) closeMenu(false);
      else {
        closeMenu(true);
        openMenu(key);
        renderFilters();
      }
      return;
    }
    var optionButton = target.closest('[data-lr-option-value]');
    if (optionButton) {
      var optionKey = optionButton.dataset.lrOptionKey;
      var optionValue = optionButton.dataset.lrOptionValue;
      var values = selected(optionKey);
      setSelected(optionKey, values.includes(optionValue) ? values.filter(function (value) { return value !== optionValue; }) : values.concat(optionValue));
      if (ORGANIZATION_KEYS.includes(optionKey)) pruneOrganizationSelections(state());
      state().page = 1;
      renderFilters();
      renderTable();
      return;
    }
    var selectAll = target.closest('[data-lr-select-all]');
    if (selectAll) {
      var selectKey = selectAll.dataset.lrSelectAll;
      var current = filteredOptions(selectKey).map(function (item) { return item.value; });
      var active = current.length && current.every(function (value) { return selected(selectKey).includes(value); });
      setSelected(selectKey, active ? selected(selectKey).filter(function (value) { return !current.includes(value); }) : selected(selectKey).concat(current));
      if (ORGANIZATION_KEYS.includes(selectKey)) pruneOrganizationSelections(state());
      state().page = 1;
      renderFilters();
      renderTable();
      return;
    }
    if (target.closest('[data-lr-date-trigger]')) {
      if (state().openMenu === 'date') closeMenu(false);
      else {
        closeMenu(true);
        state().dateDraftStart = state().startDate || DEFAULT_DATE;
        state().dateDraftEnd = state().endDate || DEFAULT_DATE;
        state().dateActiveField = 'startDate';
        openMenu('date');
        renderFilters();
      }
      return;
    }
    var dateNav = target.closest('[data-lr-date-nav]');
    if (dateNav) {
      var next = new Date(state().dateViewYear, state().dateViewMonth - 1 + Number(dateNav.dataset.lrDateNav), 1);
      state().dateViewYear = next.getFullYear();
      state().dateViewMonth = next.getMonth() + 1;
      renderFilters();
      return;
    }
    var dateField = target.closest('[data-lr-date-field]');
    if (dateField) {
      state().dateActiveField = dateField.dataset.lrDateField;
      renderFilters();
      return;
    }
    var dateValue = target.closest('[data-lr-date-value]');
    if (dateValue) {
      var picked = dateValue.dataset.lrDateValue;
      if (state().dateActiveField === 'startDate') {
        state().dateDraftStart = picked;
        if (state().dateDraftEnd < picked) state().dateDraftEnd = picked;
        state().dateActiveField = 'endDate';
      } else {
        state().dateDraftEnd = picked;
        if (state().dateDraftStart > picked) state().dateDraftStart = picked;
        state().dateActiveField = 'startDate';
      }
      renderFilters();
      return;
    }
    var dateShortcut = target.closest('[data-lr-date-shortcut]');
    if (dateShortcut) {
      var today = new Date();
      var start = new Date(today);
      if (dateShortcut.dataset.lrDateShortcut === 'last3') start.setDate(start.getDate() - 2);
      if (dateShortcut.dataset.lrDateShortcut === 'last7') start.setDate(start.getDate() - 6);
      state().dateDraftStart = formatDateValue(start);
      state().dateDraftEnd = formatDateValue(today);
      state().dateActiveField = 'endDate';
      state().dateViewYear = today.getFullYear();
      state().dateViewMonth = today.getMonth() + 1;
      renderFilters();
      return;
    }
    if (target.closest('[data-lr-date-cancel]')) {
      closeMenu(false);
      return;
    }
    if (target.closest('[data-lr-date-apply]')) {
      state().startDate = state().dateDraftStart;
      state().endDate = state().dateDraftEnd;
      state().page = 1;
      closeMenu(false);
      renderTable();
      return;
    }
    if (target.closest('[data-lr-reset]')) {
      resetFilters();
      return;
    }
    if (target.closest('[data-lr-collapse]')) {
      closeMenu(true);
      state().collapsed = !state().collapsed;
      renderFilters();
      return;
    }
    if (target.closest('[data-lr-page-size-trigger]')) {
      state().pageMenuOpen = !state().pageMenuOpen;
      renderPagination(filteredRecords().length);
      return;
    }
    var pageSize = target.closest('[data-lr-page-size]');
    if (pageSize) {
      state().pageSize = Number(pageSize.dataset.lrPageSize);
      state().page = 1;
      state().pageMenuOpen = false;
      renderTable();
      return;
    }
    var pageButton = target.closest('[data-lr-page]');
    if (pageButton) {
      state().page = Number(pageButton.dataset.lrPage);
      renderTable();
      return;
    }
    var pageArrow = target.closest('[data-lr-page-arrow]');
    if (pageArrow && !pageArrow.disabled) {
      state().page += Number(pageArrow.dataset.lrPageArrow);
      renderTable();
      return;
    }
    if (target.closest('[data-lr-settings]')) {
      closeMenu(true);
      state().settingsOpen = true;
      state().workingColumns = JSON.parse(JSON.stringify(columnSettings[currentView]));
      renderToolbar();
      renderFieldSettings({ animateOpen: true });
      return;
    }
    if (target.closest('[data-lr-settings-close]')) {
      closeFieldSettings();
      return;
    }
    if (target.closest('[data-lr-settings-select-all]')) {
      workingSettings().hidden = [];
      renderFieldSettings();
      return;
    }
    if (target.closest('[data-lr-settings-restore]')) {
      state().workingColumns = defaultColumnSettings(getColumns(currentView));
      renderFieldSettings();
      return;
    }
    if (target.closest('[data-lr-settings-save]')) {
      applyColumnSettings();
      return;
    }
    if (target.closest('[data-lr-refresh]')) {
      var refreshButton = target.closest('[data-lr-refresh]');
      refreshButton.classList.add('is-refreshing');
      refreshButton.setAttribute('aria-busy', 'true');
      global.clearTimeout(refreshTimer);
      refreshTimer = global.setTimeout(function () {
        renderAll();
        showToast('线索数据已刷新');
      }, 280);
      return;
    }
    if (target.closest('[data-lr-export]')) exportCurrent();
  }

  function handleInput(event) {
    var search = event.target.closest('[data-lr-menu-search]');
    if (search) {
      var key = search.dataset.lrMenuSearch;
      state().menuQueries[key] = search.value;
      renderFilters();
      var replacement = document.querySelector('[data-lr-menu-search="' + CSS.escape(key) + '"]');
      if (replacement) {
        replacement.focus();
        replacement.setSelectionRange(replacement.value.length, replacement.value.length);
      }
    }
  }

  function handleChange(event) {
    var checkbox = event.target.closest('[data-lr-column-visible]');
    if (checkbox) {
      var working = workingSettings();
      var key = checkbox.dataset.lrColumnVisible;
      working.hidden = checkbox.checked ? working.hidden.filter(function (item) { return item !== key; }) : working.hidden.concat(key);
      renderFieldSettings();
      return;
    }
    var jump = event.target.closest('[data-lr-page-jump]');
    if (jump) {
      var totalPages = Math.max(1, Math.ceil(filteredRecords().length / state().pageSize));
      state().page = Math.max(1, Math.min(totalPages, Number(jump.value) || 1));
      renderTable();
    }
  }

  function handleDragStart(event) {
    var item = event.target.closest('[data-lr-column-item]');
    if (!item) return;
    state().dragColumn = item.dataset.lrColumnItem;
    item.classList.add('is-dragging');
  }

  function handleDragOver(event) {
    if (!state().dragColumn) return;
    var item = event.target.closest('[data-lr-column-item]');
    if (!item || item.dataset.lrColumnItem === state().dragColumn) return;
    event.preventDefault();
  }

  function handleDrop(event) {
    var item = event.target.closest('[data-lr-column-item]');
    if (!item || !state().dragColumn) return;
    event.preventDefault();
    var order = workingSettings().order;
    var from = order.indexOf(state().dragColumn);
    var to = order.indexOf(item.dataset.lrColumnItem);
    if (from >= 0 && to >= 0) {
      order.splice(to, 0, order.splice(from, 1)[0]);
      renderFieldSettings();
    }
    state().dragColumn = '';
  }

  function handleDragEnd() {
    state().dragColumn = '';
  }

  function install() {
    var host = document.getElementById('leadsFilterControls');
    if (!host || host === installedFilterHost && host.dataset.lrInstalled === 'true') return;
    installedFilterHost = host;
    var pageStack = host.closest('.page-stack');
    var filterCard = host.closest('.session-filter-card');
    var tableCard = document.querySelector('#pageHost .table-card');
    if (pageStack) pageStack.classList.add('leads-modern-root');
    if (filterCard) filterCard.classList.add('badge-session-filter-card', 'lr-filter-card');
    if (tableCard) tableCard.classList.add('badge-detail-table-card', 'lr-table-card');
    renderAll();
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleChange);
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragend', handleDragEnd);
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    restoreValidityTooltip();
    if (state().settingsOpen) {
      closeFieldSettings();
      return;
    }
    closeMenu(false);
  });

  global.addEventListener('resize', function () {
    if (!validityTooltipAnchor) return;
    global.clearTimeout(validityTooltipHideTimer);
    restoreValidityTooltip();
  });

  var observer = new MutationObserver(function () { global.requestAnimationFrame(install); });
  var pageHost = document.getElementById('pageHost');
  if (pageHost) observer.observe(pageHost, { childList: true, subtree: true });
  global.__LEADS_MODERN_RUNTIME_READY__ = true;
  install();
})(window);
