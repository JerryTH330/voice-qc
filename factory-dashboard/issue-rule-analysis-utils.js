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

  const aggregateIssueRulesByScenes = (rules, selectedScenes) => {
    const selected = new Set(Array.isArray(selectedScenes) ? selectedScenes : []);
    const sourceRules = Array.isArray(rules) ? rules : [];

    return sourceRules.map((rule) => {
      const sceneStats = rule && typeof rule.sceneStats === 'object' && rule.sceneStats
        ? rule.sceneStats
        : null;
      if (!sceneStats) return { ...rule };

      const applicableScenes = Object.keys(sceneStats).filter((scene) => selected.has(scene));
      if (!applicableScenes.length) return null;

      const totals = applicableScenes.reduce((result, scene) => {
        const stat = sceneStats[scene] || {};
        const sampleCount = Math.max(0, Math.round(Number(stat.sampleCount) || 0));
        const hitCount = Number.isFinite(Number(stat.hitCount))
          ? Math.max(0, Math.round(Number(stat.hitCount)))
          : Math.round(sampleCount * (Number(stat.rate) || 0) / 100);
        result.sampleCount += sampleCount;
        result.hitCount += Math.min(sampleCount, hitCount);
        return result;
      }, { sampleCount: 0, hitCount: 0 });

      return {
        ...rule,
        applicableScenes,
        sampleCount: totals.sampleCount,
        hitCount: totals.hitCount,
        rate: totals.sampleCount
          ? Math.round(totals.hitCount * 100 / totals.sampleCount)
          : 0
      };
    }).filter(Boolean);
  };

  return {
    sortIssueOrgRows,
    aggregateIssueRulesByScenes
  };
});
