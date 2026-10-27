/* 线索列表 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'leads';
(function loadPageRuntime() {
  const scripts = [
    "../leads/organization-data.js?v=20261020-unified-data-v3",
    "../shared/organization-directory.js?v=20261020-unified-data-v3",
    "../device-management/organization-data.js?v=20261020-unified-data-v3",
    "../session/real-recording-data.js?v=20261020-unified-data-v3",
    "../leads/real-lead-data.js?v=20261020-unified-data-v3",
    "../shared/linked-demo-data.js?v=20261022-dashboard-filter-release-v1",
    "../shared/badge-history-data.js?v=20261022-dashboard-filter-release-v1",
    "../shared/unified-data.js?v=20261022-dashboard-filter-release-v1",
    "../factory-multi-select-filter-utils.js?v=20260612customer-journey-filter",
    "../shared/issue-rule-list.js?v=20260805-issue-rule-shared",
    "../date-filter-component-utils.js?v=20260906-date-filter-v1",
    "../device-management/xlsx-export-utils.js?v=20260902-badge-list-actions-v1",
    "../shared/field-settings-interactions.js?v=20260911-field-settings-select-all-v1",
    "../shared/unified-dashboard.js?v=20261027-global-audit-fixes-v1",
    "../app-runtime.js?v=20261027-global-audit-fixes-v1",
    "./leads-modern-runtime.js?v=20261027-global-audit-fixes-v1"
];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
