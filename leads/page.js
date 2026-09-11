/* 线索列表 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'leads';
(function loadPageRuntime() {
  const scripts = [
    "../factory-multi-select-filter-utils.js?v=20260612customer-journey-filter",
    "../shared/issue-rule-list.js?v=20260805-issue-rule-shared",
    "./organization-data.js?v=20260828-shared-org-v2",
    "../device-management/organization-data.js?v=20260903-real-stores-v1",
    "../shared/organization-directory.js?v=20260828-shared-org-v2",
    "../date-filter-component-utils.js?v=20260906-date-filter-v1",
    "../device-management/xlsx-export-utils.js?v=20260902-badge-list-actions-v1",
    "../shared/field-settings-interactions.js?v=20260911-field-settings-motion-v1",
    "./real-lead-data.js?v=20260910-real-leads-v1",
    "../app-runtime.js?v=20260910-real-leads-v3",
    "./leads-modern-runtime.js?v=20260911-field-settings-motion-v1"
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
