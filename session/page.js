/* 录音列表 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'session';
(function loadPageRuntime() {
  const version = '20260811-session-lead-filter-v1';
  const scripts = [`../session-search-utils.js?v=${version}`, `../shared/issue-rule-list.js?v=${version}`, `../app-runtime.js?v=${version}`];
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
