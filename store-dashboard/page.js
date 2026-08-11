/* 门店看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'dashboard';
(function loadPageRuntime() {
  const version = '20260811-figma-panels-v13';
  const scripts = [`../dashboard-filter-utils.js?v=${version}`, `../date-filter-component-utils.js?v=${version}`, `../store-date-control-utils.js?v=${version}`, `../shared/issue-rule-list.js?v=${version}`, `../app-runtime.js?v=${version}`];
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
