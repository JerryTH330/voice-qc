/* 厂端看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'factory-dashboard';
(function loadPageRuntime() {
  const assetVersion = '20261028-full-sync-v1';
  const scripts = [
    "../leads/organization-data.js?v=20261028-full-sync-v1",
    "../shared/organization-directory.js?v=20261028-full-sync-v1",
    "../device-management/organization-data.js?v=20261028-full-sync-v1",
    "../session/real-recording-data.js?v=20261028-full-sync-v1",
    "../leads/real-lead-data.js?v=20261028-full-sync-v1",
    "../shared/linked-demo-data.js?v=20261028-full-sync-v1",
    "../shared/badge-history-data.js?v=20261028-full-sync-v1",
    "../shared/unified-data.js?v=20261028-full-sync-v1",
    "../dashboard-filter-utils.js",
    "../date-filter-component-utils.js",
    "../factory-multi-select-filter-utils.js",
    "./factory-hero-utils.js",
    "./issue-rule-analysis-utils.js",
    "../shared/issue-rule-list.js",
    "./organization-filter.js",
    "./factory-dashboard.js",
    "../device-management/visit-organization-filter.js?v=20261028-full-sync-v1",
    "../store-dashboard/organization-filter.js?v=20261028-full-sync-v1",
    "../store-dashboard/business-filters.js?v=20261028-full-sync-v1",
    "../shared/dimension-switcher.js?v=20261028-full-sync-v1",
    "../shared/unified-dashboard.js?v=20261028-full-sync-v1",
    "../app-runtime.js?v=20261028-full-sync-v1"
];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    const scriptVersion = ['../dashboard-filter-utils.js', './factory-hero-utils.js', './factory-dashboard.js'].includes(scripts[index])
      ? '20261020-unified-data-v3'
      : scripts[index] === './issue-rule-analysis-utils.js' ? '20261019-factory-rule-org-scope-v1'
      : scripts[index] === './organization-filter.js' ? '20261021-dashboard-no-advisor-v1' : assetVersion;
    script.src = scripts[index].includes('?') ? scripts[index] : `${scripts[index]}?v=${scriptVersion}`;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
