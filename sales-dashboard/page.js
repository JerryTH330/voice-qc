/* 销售看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'sales-dashboard';
(function loadPageRuntime() {
  const assetVersion = '20260810-sticky-24px-v5';
  const scripts = ["../date-filter-component-utils.js","../shared/issue-rule-list.js","../app-runtime.js"];
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
