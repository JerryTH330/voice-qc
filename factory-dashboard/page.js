/* 厂端看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'factory-dashboard';
(function loadPageRuntime() {
  const assetVersion = '20261009-advisor-meta-v1';
  const scripts = ["../dashboard-filter-utils.js","../date-filter-component-utils.js","../factory-multi-select-filter-utils.js","./factory-hero-utils.js","./issue-rule-analysis-utils.js","../shared/issue-rule-list.js","../device-management/organization-data.js","../shared/organization-directory.js","../session/real-recording-data.js","./organization-filter.js","./factory-dashboard.js","../app-runtime.js"];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    const scriptVersion = ['./factory-dashboard.js', './issue-rule-analysis-utils.js'].includes(scripts[index])
      ? '20261019-factory-rule-org-scope-v1'
      : scripts[index] === './organization-filter.js' ? '20261021-dashboard-no-advisor-v1' : assetVersion;
    script.src = `${scripts[index]}?v=${scriptVersion}`;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
