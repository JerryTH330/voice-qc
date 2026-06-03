/* 门店看板 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'dashboard';
(function loadPageRuntime() {
  const version = '20260522165000';
  const scripts = [`../dashboard-filter-utils.js?v=${version}`, `../app-runtime.js?v=${version}`];
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
