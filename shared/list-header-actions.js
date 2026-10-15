(function (host, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else host.ListHeaderActions = api.createController(host);
})(typeof window === 'undefined' ? globalThis : window, function () {
  function createController(host) {
    const lists = new Map();
    const notify = (message, kind) => host.PlatformToast.show(message, { kind, duration: 1800 });
    function sync(key) {
      const list = lists.get(key);
      if (!list) return;
      const request = list.request();
      host.document.querySelectorAll(`[data-list-export="${key}"]`).forEach(button => {
        button.disabled = list.exporting || !request?.rows.length;
        button.setAttribute('aria-busy', String(Boolean(list.exporting)));
      });
      host.document.querySelectorAll(`[data-list-refresh="${key}"]`).forEach(button => {
        button.disabled = Boolean(list.refreshing);
        button.classList.toggle('is-refreshing', Boolean(list.refreshing));
        button.setAttribute('aria-busy', String(Boolean(list.refreshing)));
        button.lastElementChild.textContent = list.refreshing ? '刷新中' : '刷新';
      });
    }
    async function exportList(key) {
      const list = lists.get(key);
      if (!list || list.exporting) return;
      const request = list.request();
      if (!request?.rows.length) { sync(key); return; }
      list.exporting = true;
      sync(key);
      try {
        await host.__exportReady;
        await host.ExportTaskUI.submit(request);
      } catch (error) { notify(error.message || '导出任务创建失败，请重试', 'error'); }
      finally { list.exporting = false; sync(key); }
    }
    function refresh(key) {
      const list = lists.get(key);
      if (!list || list.refreshing) return;
      list.refreshing = true;
      sync(key);
      host.setTimeout(() => {
        try { list.refresh(); notify('数据已刷新', 'success'); }
        catch (error) { notify(error.message || '刷新失败，请重试', 'error'); }
        finally { list.refreshing = false; sync(key); }
      }, 700);
    }
    host.document.addEventListener('click', event => {
      const button = event.target.closest('[data-list-refresh], [data-list-export]');
      if (!button || button.disabled) return;
      const key = button.dataset.listRefresh || button.dataset.listExport;
      if (!lists.has(key)) return;
      event.stopImmediatePropagation();
      if (button.dataset.listRefresh) refresh(key);
      else exportList(key);
    });
    return { register(key, adapter) { lists.set(key, adapter); sync(key); }, sync, export: exportList, refresh };
  }
  return { createController };
});
