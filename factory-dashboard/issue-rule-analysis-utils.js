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

  const allocateCounts = (total, weights) => {
    const weight = weights.reduce((sum, value) => sum + value, 0);
    if (!weight) return weights.map(() => 0);
    const shares = weights.map(value => total * value / weight);
    const counts = shares.map(Math.floor);
    let remainder = total - counts.reduce((sum, value) => sum + value, 0);
    const order = shares.map((value, index) => ({ index, fraction: value - counts[index] }))
      .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
    for (const item of order) {
      if (remainder-- <= 0) break;
      counts[item.index]++;
    }
    return counts;
  };

  const buildIssueOrgRows = ({ records, dimension, selections, path = [], rule = {} }) => {
    const levels = dimension === 'geography' ? ['province', 'city', 'store'] : ['region', 'zone', 'store'];
    const value = (dealer, level) => level === 'region' ? dealer.area : level === 'store' ? dealer.dealerName : dealer[level];
    const key = (dealer, level) => {
      if (level === 'store') return JSON.stringify(['store', dealer.brand, dealer.dealerCode]);
      const ancestors = levels.slice(0, levels.indexOf(level) + 1);
      return JSON.stringify([level, dealer.brand, ...ancestors.map(field => dealer[field + 'Id'] || value(dealer, field) || '')]);
    };
    const group = (items, level, parent) => {
      const groups = new Map();
      for (const record of items) {
        const id = key(record.dealer, level);
        if (!groups.has(id)) groups.set(id, { id, name: value(record.dealer, level) || '未知', level, records: [] });
        groups.get(id).records.push(record);
      }
      const rows = [...groups.values()].sort((a, b) => a.id.localeCompare(b.id, 'zh-CN'));
      const counts = new Map();
      rows.forEach(row => counts.set(row.name, (counts.get(row.name) || 0) + 1));
      const samples = allocateCounts(parent.sampleCount, rows.map(row => row.records.length));
      const hits = allocateCounts(parent.hitCount, samples);
      return rows.map((row, index) => ({
        ...row,
        name: counts.get(row.name) > 1
          ? [row.records[0].dealer.brand, ...levels.slice(0, levels.indexOf(level) + 1).map(field => value(row.records[0].dealer, field))].join(' · ')
          : row.name,
        sampleCount: samples[index],
        hitCount: hits[index],
        rate: samples[index] ? Math.round(hits[index] * 100 / samples[index]) : null,
        drillable: level !== 'store'
      }));
    };
    let levelIndex = selections.store?.length || selections[levels[1]]?.length ? 2 : selections[levels[0]]?.length ? 1 : 0;
    let items = records;
    let parent = { sampleCount: Math.max(0, Math.round(Number(rule.sampleCount) || 0)), hitCount: Math.max(0, Math.round(Number(rule.hitCount) || 0)) };
    parent.hitCount = Math.min(parent.hitCount, parent.sampleCount);
    for (const crumb of path) {
      if (levelIndex >= levels.length) return [];
      const selected = group(items, levels[levelIndex], parent).find(row => row.id === crumb.id);
      if (!selected || !selected.drillable) return [];
      items = selected.records;
      parent = selected;
      levelIndex++;
    }
    return group(items, levels[levelIndex], parent);
  };

  const scopeIssueRules = (rules, scopeCount, totalCount, factor = 1) => {
    if (!scopeCount || !totalCount || factor <= 0) return [];
    return rules.map(rule => {
      const sampleCount = Math.max(rule.sampleCount > 0 ? 1 : 0, Math.round(rule.sampleCount * scopeCount / totalCount * factor));
      const hitCount = Math.min(sampleCount, Math.round(sampleCount * (rule.sampleCount ? rule.hitCount / rule.sampleCount : 0)));
      return { ...rule, sampleCount, hitCount, rate: sampleCount ? Math.round(hitCount * 100 / sampleCount) : 0 };
    });
  };

  return {
    sortIssueOrgRows,
    aggregateIssueRulesByScenes,
    buildIssueOrgRows,
    scopeIssueRules
  };
});
