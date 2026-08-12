/* 厂端看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'factory-dashboard';
(function loadPageRuntime() {
  const assetVersion = '20260812-real-id-v1';
  const scripts = ["../dashboard-filter-utils.js","../date-filter-component-utils.js","../factory-multi-select-filter-utils.js","./factory-hero-utils.js","./issue-rule-analysis-utils.js","../shared/issue-rule-list.js","./factory-dashboard.js","../app-runtime.js"];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = `${scripts[index]}?v=${assetVersion}`;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
