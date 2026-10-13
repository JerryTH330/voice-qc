(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VisitFieldSettings = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const fields = Object.freeze([
    { key: 'businessId', label: '业务 ID' },
    { key: 'leadId', label: '线索ID' },
    { key: 'brand', label: '品牌' },
    { key: 'region', label: '大区' },
    { key: 'zone', label: '战区' },
    { key: 'province', label: '省份' },
    { key: 'city', label: '城市' },
    { key: 'storeCode', label: '店代码' },
    { key: 'store', label: '所属门店' },
    { key: 'advisorId', label: '顾问 ID' },
    { key: 'advisor', label: '顾问姓名' },
    { key: 'patroler', label: '巡回员' },
    { key: 'governor', label: '治理员' },
    { key: 'customerName', label: '客户名称' },
    { key: 'customerPhone', label: '客户号码' },
    { key: 'scene', label: '业务场景' },
    { key: 'carSeries', label: '意向车系' },
    { key: 'source', label: '到访来源' },
    { key: 'date', label: '到访日期' },
    { key: 'startTime', label: '开始时间' },
    { key: 'endTime', label: '结束时间' },
    { key: 'status', label: '匹配状态' },
    { key: 'detail', label: '匹配详情' },
    { key: 'recordingId', label: '录音 ID' },
    { key: 'completedAt', label: '匹配完成时间' },
    { key: 'updatedAt', label: '数据更新时间' }
  ].map((field) => Object.freeze(field)));
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const defaultOrder = fields.map((field) => field.key);
  const storageKey = 'aiqc-device-visit-field-settings-v1';
  const schemaVersion = 2;
  const filterColumns = new Map(Object.entries({
    time: ['date'],
    customerKeyword: ['customerName', 'customerPhone'],
    advisor: ['advisorId', 'advisor'],
    brand: ['brand'],
    region: ['region'],
    zone: ['zone'],
    province: ['province'],
    city: ['city'],
    store: ['store'],
    patroler: ['patroler'],
    governor: ['governor'],
    source: ['source'],
    status: ['status'],
    businessId: ['businessId'],
    recordingId: ['recordingId'],
    leadId: ['leadId']
  }));

  function createDefaultSettings() {
    return { order: [...defaultOrder], visible: [...defaultOrder], schemaVersion };
  }

  function knownKeys(value) {
    return Array.isArray(value) ? [...new Set(value)].filter((key) => fieldByKey.has(key)) : [];
  }

  function normalizeSettings(value) {
    const visible = knownKeys(value?.visible);
    if (!visible.length) return createDefaultSettings();
    const order = knownKeys(value?.order);
    const addedKeys = defaultOrder.filter((key) => !order.includes(key));
    addedKeys.forEach((key) => {
      const nextKey = defaultOrder.slice(defaultOrder.indexOf(key) + 1).find((candidate) => order.includes(candidate));
      order.splice(nextKey ? order.indexOf(nextKey) : order.length, 0, key);
    });
    const visibleKeys = new Set([...visible, ...addedKeys]);
    return { order, visible: order.filter((key) => visibleKeys.has(key)), schemaVersion };
  }

  function getVisibleFields(settings = createDefaultSettings()) {
    const visible = new Set(settings.visible);
    return settings.order.filter((key) => visible.has(key)).map((key) => fieldByKey.get(key)).filter(Boolean);
  }

  function isFilterVisible(settings, key) {
    const visible = new Set(settings.visible);
    return Boolean(filterColumns.get(key)?.some((columnKey) => visible.has(columnKey)));
  }

  function getHiddenFilterKeys(settings) {
    return [...filterColumns.keys()].filter((key) => !isFilterVisible(settings, key));
  }

  return Object.freeze({ fields, storageKey, createDefaultSettings, normalizeSettings, getVisibleFields, isFilterVisible, getHiddenFilterKeys });
});
