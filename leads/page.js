/* 线索列表 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'leads';
(function loadPageRuntime() {
  const scripts = ["../factory-multi-select-filter-utils.js?v=20260612customer-journey-filter","../shared/issue-rule-list.js?v=20260805-issue-rule-shared","../app-runtime.js?v=20260812-customer-demo-order-v20"];
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
