(function (global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  global.__factoryIssueRuleAnalysisUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const compareByName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN');

  const sortIssueOrgRows = (rows, sortMode) => {
    const list = Array.isArray(rows) ? [...rows] : [];

    return list.sort((a, b) => {
      if (sortMode === 'rate-asc') {
        return a.rate - b.rate
          || b.hitCount - a.hitCount
          || b.sampleCount - a.sampleCount
          || compareByName(a, b);
      }
      if (sortMode === 'count-desc') {
        return b.hitCount - a.hitCount
          || b.rate - a.rate
          || b.sampleCount - a.sampleCount
          || compareByName(a, b);
      }
      if (sortMode === 'sample-desc') {
        return b.sampleCount - a.sampleCount
          || b.hitCount - a.hitCount
          || b.rate - a.rate
          || compareByName(a, b);
      }
      return b.rate - a.rate
        || b.hitCount - a.hitCount
        || b.sampleCount - a.sampleCount
        || compareByName(a, b);
    });
  };

  return {
    sortIssueOrgRows
  };
});
