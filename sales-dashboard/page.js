/* 销售看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'sales-dashboard';
(function loadPageRuntime() {
  const assetVersion = '20261019-dashboard-filter-standard-v1';
  const scripts = ["../date-filter-component-utils.js","../shared/issue-rule-list.js",
    "../shared/dimension-switcher.js?v=20261012-shared-dimension-v1",
    "../device-management/organization-data.js?v=20260903-real-stores-v1",
    "../device-management/visit-organization-filter.js?v=20261010-matching-org-v1",
    "./business-scene-filter.js?v=20261019-dashboard-filter-standard-v1",
    "./source-tabs.js?v=20261019-sales-leads-style-v2",
    "./organization-filter.js?v=20261019-dashboard-filter-standard-v1",
    "../app-runtime.js"];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index].includes('?') ? scripts[index] : `${scripts[index]}?v=${assetVersion}`;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
