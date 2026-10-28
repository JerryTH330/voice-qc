/* 销售看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'sales-dashboard';
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
    "../date-filter-component-utils.js",
    "../shared/issue-rule-list.js",
    "../shared/dimension-switcher.js?v=20261028-full-sync-v1",
    "../device-management/visit-organization-filter.js?v=20261028-full-sync-v1",
    "./business-scene-filter.js?v=20261028-full-sync-v1",
    "./source-tabs.js?v=20261028-full-sync-v1",
    "./organization-filter.js?v=20261028-full-sync-v1",
    "../store-dashboard/organization-filter.js?v=20261028-full-sync-v1",
    "../store-dashboard/business-filters.js?v=20261028-full-sync-v1",
    "../shared/unified-dashboard.js?v=20261028-full-sync-v1",
    "../app-runtime.js?v=20261028-full-sync-v1"
];
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
