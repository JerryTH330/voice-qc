/* 质检配置 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'config';
(function loadPageRuntime() {
  const scripts = ["../shared/issue-rule-list.js?v=20260805-issue-rule-shared","../app-runtime.js?v=20260813-back-to-top-v1"];
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
