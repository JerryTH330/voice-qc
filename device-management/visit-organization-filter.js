(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VisitOrganizationFilter = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const fields = Object.freeze({
    brand: { label: '品牌', idKey: 'brandId', nameKey: 'brand' },
    region: { label: '大区', idKey: 'regionId', nameKey: 'region' },
    zone: { label: '战区', idKey: 'zoneId', nameKey: 'zone' },
    province: { label: '省份', idKey: 'provinceId', nameKey: 'province' },
    city: { label: '城市', idKey: 'cityId', nameKey: 'city' },
    store: { label: '门店', idKey: 'storeId', nameKey: 'store' },
    patroler: { label: '巡回员', idKey: 'patrolerId', nameKey: 'patroler' },
    governor: { label: '治理员', idKey: 'governorId', nameKey: 'governor' },
    advisor: { label: '顾问', idKey: 'advisorKey', nameKey: 'advisor' }
  });
  const organizationKeys = Object.freeze(['brand', 'region', 'zone', 'patroler', 'province', 'city', 'governor', 'store']);
  const dependencies = Object.freeze({
    brand: [],
    region: ['brand'],
    zone: ['brand', 'region'],
    province: ['brand'],
    city: ['brand', 'province'],
    patroler: ['brand'],
    governor: ['brand'],
    store: ['brand', 'region', 'zone', 'patroler', 'province', 'city', 'governor'],
    advisor: organizationKeys
  });
  const chains = [['brand', 'region', 'zone'], ['brand', 'province', 'city']];
  const normalize = (value) => String(value ?? '').trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
  const valueOf = (record, key) => String(record[fields[key].idKey] ?? '');
  const defaults = () => ({ dimensionMode: 'organization', ...Object.fromEntries(Object.keys(fields).map((key) => [key, []])) });
  const copyState = (state) => ({ dimensionMode: state.dimensionMode, ...Object.fromEntries(Object.keys(fields).map((key) => [key, [...state[key]]])) });
  const dimensionKeys = (mode) => mode === 'geography' ? ['brand', 'province', 'city', 'store'] : ['brand', 'region', 'zone', 'store'];

  function organizationRecord(dealer) {
    const brandId = `brand:${dealer.brand}`;
    const regionId = `${brandId}|region:${dealer.area}`;
    const provinceId = `province:${dealer.province}`;
    return {
      brand: dealer.brand, brandId,
      region: dealer.area, regionId,
      zone: dealer.zone, zoneId: `${regionId}|zone:${dealer.zone}`,
      province: dealer.province, provinceId,
      city: dealer.city, cityId: `${provinceId}|city:${dealer.city}`,
      store: dealer.dealerName,
      storeId: dealer.dealerWid || `${brandId}|store:${dealer.dealerCode}`,
      storeCode: dealer.dealerCode,
      patroler: dealer.patroler || '', patrolerId: dealer.patrolerId || '',
      governor: dealer.governor || '', governorId: dealer.governorId || ''
    };
  }

  function optionMeta(key, record) {
    if (key === 'region') return record.brand;
    if (key === 'zone') return `${record.brand} · ${record.region}`;
    if (key === 'city') return record.province;
    if (key === 'store') return record.storeCode;
    if (key === 'patroler' || key === 'governor') {
      const code = valueOf(record, key).match(/\|(?:patroler|governor):code:([^|]+)/)?.[1];
      return code ? `${record.brand} · ${code}` : record.brand;
    }
    return '';
  }

  function createModel(dealers, records) {
    const directory = dealers.map(organizationRecord);
    const draft = defaults();
    const applied = defaults();
    const sourceFor = (key) => key === 'advisor' ? records : directory;
    const labelFor = (key, id) => sourceFor(key).find((item) => valueOf(item, key) === id)?.[fields[key].nameKey] || '—';
    const matchesFields = (record, keys, state) => keys.every((key) => !state[key].length || state[key].includes(valueOf(record, key)));
    const candidateRecords = (key, keys = dependencies[key]) => sourceFor(key).filter((record) => matchesFields(record, keys, draft));

    function options(key, { query = '', pinnedIds = draft[key] } = {}) {
      const candidates = new Map();
      candidateRecords(key).forEach((record) => {
        const value = valueOf(record, key);
        if (!value || candidates.has(value)) return;
        const label = String(record[fields[key].nameKey] || '—');
        const advisorId = String(record.advisorId || '');
        candidates.set(value, {
          value, label,
          meta: key === 'advisor' ? `${record.store} · ${advisorId || '—'}` : optionMeta(key, record),
          search: key === 'advisor' ? `${label} ${advisorId}` : `${label} ${optionMeta(key, record)}`
        });
      });
      const pinned = new Set(pinnedIds);
      const normalizedQuery = normalize(query);
      return [...candidates.values()]
        .filter((item) => !normalizedQuery || normalize(item.search).includes(normalizedQuery))
        .sort((left, right) => Number(pinned.has(right.value)) - Number(pinned.has(left.value))
          || left.label.localeCompare(right.label, 'zh-CN') || left.value.localeCompare(right.value, 'zh-CN'));
    }

    function prune(key, keys = dependencies[key]) {
      const validIds = new Set(candidateRecords(key, keys).map((record) => valueOf(record, key)));
      const removed = draft[key].filter((id) => !validIds.has(id));
      draft[key] = draft[key].filter((id) => validIds.has(id));
      return removed.map((id) => `${fields[key].label}：${labelFor(key, id)}`);
    }

    function set(key, values) {
      const available = new Set(candidateRecords(key).map((record) => valueOf(record, key)).filter(Boolean));
      draft[key] = [...new Set(values.map(String))].filter((id) => available.has(id));
      const removed = [];
      chains.filter((chain) => chain.includes(key)).forEach((chain) => {
        chain.slice(chain.indexOf(key) + 1).forEach((child) => removed.push(...prune(child, chain.slice(0, chain.indexOf(child)))));
      });
      if (key === 'brand') ['patroler', 'governor'].forEach((child) => removed.push(...prune(child)));
      if (dependencies.store.includes(key)) removed.push(...prune('store'));
      if (key === 'store' || dependencies.advisor.includes(key)) removed.push(...prune('advisor'));
      return removed;
    }

    function setDimension(mode) {
      if (!['organization', 'geography'].includes(mode) || draft.dimensionMode === mode) return;
      (mode === 'geography' ? ['region', 'zone'] : ['province', 'city']).forEach((key) => { draft[key] = []; });
      draft.store = [];
      draft.dimensionMode = mode;
      prune('advisor');
    }

    return {
      draft, applied, directory, options, set, setDimension,
      dimensionKeys: () => dimensionKeys(draft.dimensionMode),
      display: (key) => draft[key].map((id) => labelFor(key, id)).join('、'),
      apply: () => { Object.assign(applied, copyState(draft)); },
      reset: () => { Object.assign(draft, defaults()); Object.assign(applied, defaults()); },
      matches: (record) => matchesFields(record, [...dimensionKeys(applied.dimensionMode), 'patroler', 'governor', 'advisor'], applied)
    };
  }

  return { fields, organizationRecord, createModel };
});
