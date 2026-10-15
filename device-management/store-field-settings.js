(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StoreFieldSettings = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const fields = Object.freeze([
    { key: 'brand', label: '品牌' },
    { key: 'region', label: '大区' },
    { key: 'zone', label: '战区' },
    { key: 'store', label: '门店名称' },
    { key: 'badgeAssets', label: '工牌资产数', sortable: true },
    { key: 'bindings', label: '工牌绑定数', sortable: true },
    { key: 'bindingRate', label: '工牌绑定率', sortable: true },
    { key: 'employees', label: '员工数', sortable: true },
    { key: 'boundEmployees', label: '绑定工牌员工数', sortable: true },
    { key: 'syncedAt', label: '最新数据同步时间' }
  ].map((field) => Object.freeze(field)));
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const defaultOrder = fields.map((field) => field.key);
  const filterKeys = new Set(['brand', 'region', 'zone', 'store']);
  const storageKey = 'aiqc-device-store-field-settings-v1';
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
