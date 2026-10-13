(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MatchingFieldSettings = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const fields = Object.freeze([
    { key: 'brand', label: '品牌' },
    { key: 'region', label: '大区' },
    { key: 'zone', label: '战区' },
    { key: 'province', label: '省份' },
    { key: 'city', label: '城市' },
    { key: 'storeCode', label: '店代码' },
    { key: 'store', label: '门店' },
    { key: 'patroler', label: '巡回员' },
    { key: 'governor', label: '治理员' },
    { key: 'visits', label: '到访数' },
    { key: 'matched', label: '已匹配到访' },
    { key: 'processing', label: '处理中' },
    { key: 'action', label: '异常需处理' },
    { key: 'rate', label: '录音匹配率' }
  ].map((field) => Object.freeze(field)));
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const defaultOrder = fields.map((field) => field.key);
  const filterKeys = new Set(['brand', 'region', 'zone', 'province', 'city', 'store', 'patroler', 'governor']);
  const storageKey = 'aiqc-device-matching-field-settings-v1';
  const schemaVersion = 1;

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
    return !filterKeys.has(key) || settings.visible.includes(key);
  }

  function getHiddenFilterKeys(settings) {
    return [...filterKeys].filter((key) => !isFilterVisible(settings, key));
  }

  return Object.freeze({ fields, storageKey, createDefaultSettings, normalizeSettings, getVisibleFields, isFilterVisible, getHiddenFilterKeys });
});
