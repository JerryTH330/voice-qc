/* 门店看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'dashboard';
(function loadPageRuntime() {
  const version = '20260812-real-id-v1';
  const scripts = [
    `../dashboard-filter-utils.js?v=${version}`,
    `../date-filter-component-utils.js?v=${version}`,
    `../store-date-control-utils.js?v=${version}`,
    `../shared/issue-rule-list.js?v=${version}`,
    '../device-management/organization-data.js?v=20260903-real-stores-v1',
    '../shared/organization-directory.js?v=20260828-shared-org-v2',
    '../device-management/visit-organization-filter.js?v=20261010-matching-org-v1',
    '../session/real-recording-data.js?v=20261009-advisor-meta-v1',
    '../factory-dashboard/organization-filter.js?v=20261021-dashboard-no-advisor-v1',
    './demo-data.js?v=20261016-store-organization-v1',
    './organization-filter.js?v=20261021-dashboard-no-advisor-v1',
    './business-filters.js?v=20261019-dashboard-filter-standard-v1',
    '../app-runtime.js?v=20261016-store-business-filters-v1'
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
