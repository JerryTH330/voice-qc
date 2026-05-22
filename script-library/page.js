/* 优秀话术库 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'script-library';
(function loadPageRuntime() {
  const scripts = ["./script-library-contract.js", "./script-library-utils.js", "../app-runtime.js"];
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
