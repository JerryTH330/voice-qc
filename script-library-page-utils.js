(function (global, factory) {
  const api = factory();
  global.__scriptLibraryPageUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function getScriptLibraryListBadge(mode, count) {
    return mode === 'quick' ? `匹配 ${count} 条话术` : `匹配 ${count} 条主题`;
  }

  function shouldRenderMonthlySummaryStats() {
    return false;
  }

  function shouldRenderQuickLookupHeroBadge() {
    return false;
  }

  return {
    getScriptLibraryListBadge,
    shouldRenderMonthlySummaryStats,
    shouldRenderQuickLookupHeroBadge
  };
});
