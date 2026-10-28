/* 录音列表 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'session';
(function loadPageRuntime() {
  const scripts = [
    "../leads/organization-data.js?v=20261028-full-sync-v1",
    "../shared/organization-directory.js?v=20261028-full-sync-v1",
    "../device-management/organization-data.js?v=20261028-full-sync-v1",
    "../session/real-recording-data.js?v=20261028-full-sync-v1",
    "../leads/real-lead-data.js?v=20261028-full-sync-v1",
    "../shared/linked-demo-data.js?v=20261028-full-sync-v1",
    "../shared/badge-history-data.js?v=20261028-full-sync-v1",
    "../shared/unified-data.js?v=20261028-full-sync-v1",
    "../session-search-utils.js?v=20261028-full-sync-v1",
    "../shared/issue-rule-list.js?v=20261028-full-sync-v1",
    "../device-management/xlsx-export-utils.js?v=20261028-full-sync-v1",
    "../shared/field-settings-interactions.js?v=20261028-full-sync-v1",
    "../shared/unified-dashboard.js?v=20261028-full-sync-v1",
    "../app-runtime.js?v=20261028-full-sync-v1",
    "./session-real-runtime.js?v=20261028-full-sync-v1"
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
