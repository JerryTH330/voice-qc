(function (global, factory) {
  const api = factory();
  global.__sessionSearchUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const SESSION_SEARCH_FIELDS = [
    { key: 'advisorId', label: '顾问ID' },
    { key: 'advisorName', label: '顾问姓名' },
    { key: 'advisorPhone', label: '顾问号码' },
    { key: 'customerName', label: '客户姓名' },
    { key: 'customerPhone', label: '客户号码' }
  ];
  const SESSION_SOURCE_OPTIONS = ['全部', '云外呼', '工牌'];

  const SESSION_SEARCH_FIELD_KEYS = SESSION_SEARCH_FIELDS.map((field) => field.key);

  function createDefaultSessionSearchQueries() {
    return SESSION_SEARCH_FIELD_KEYS.reduce((result, key) => {
      result[key] = '';
      return result;
    }, {});
  }

  function normalizeSessionSearchValue(value, target) {
    const normalizedValue = String(value || '').trim().toLowerCase();

    if (target === 'advisorPhone' || target === 'customerPhone') {
      return normalizedValue.replace(/\D/g, '');
    }

    if (target === 'advisorId') {
      return normalizedValue.replace(/[^a-z0-9]/g, '');
    }

    return normalizedValue.replace(/\s+/g, '');
  }

  function getActiveSessionSearchQueries(searchQueries) {
    const safeQueries = searchQueries || {};
    return SESSION_SEARCH_FIELDS.reduce((result, field) => {
      const normalized = normalizeSessionSearchValue(safeQueries[field.key], field.key);
      if (normalized) {
        result[field.key] = normalized;
      }
      return result;
    }, {});
  }

  function doesSessionRecordMatchSearch(record, searchQueries) {
    const activeQueries = getActiveSessionSearchQueries(searchQueries);
    const activeKeys = Object.keys(activeQueries);

    if (!activeKeys.length) {
      return true;
    }

    const normalizedRecord = {
      advisorId: normalizeSessionSearchValue(record && record.advisorId, 'advisorId'),
      advisorName: normalizeSessionSearchValue(record && record.advisorName, 'advisorName'),
      advisorPhone: normalizeSessionSearchValue(record && record.advisorPhone, 'advisorPhone'),
      customerName: normalizeSessionSearchValue(record && record.customerName, 'customerName'),
      customerPhone: normalizeSessionSearchValue(record && record.customerPhone, 'customerPhone')
    };

    return activeKeys.every((key) => normalizedRecord[key].includes(activeQueries[key]));
  }

  function getSessionSourceFromStage(stage) {
    if (stage === '邀约' || stage === '试驾PDC') {
      return '云外呼';
    }

    if (stage === '试驾' || stage === '到店接待') {
      return '工牌';
    }

    return '-';
  }

  return {
    SESSION_SEARCH_FIELDS,
    SESSION_SOURCE_OPTIONS,
    createDefaultSessionSearchQueries,
    getSessionSourceFromStage,
    normalizeSessionSearchValue,
    getActiveSessionSearchQueries,
    doesSessionRecordMatchSearch
  };
});
