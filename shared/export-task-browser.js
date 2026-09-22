(function () {
  'use strict';
  const rootUrl = new URL('../', document.currentScript.src);
  const managerUrl = new URL('export-management/index.html', rootUrl);
  const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const database = new Promise((resolve, reject) => {
    const request = indexedDB.open('aiqc-export-tasks-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tasks', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('无法打开导出任务存储，请检查浏览器存储权限'));
    request.onblocked = () => reject(new Error('请关闭旧的导出管理页面后重试'));
  });
  const store = {
    async update(action) {
      const db = await database;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('tasks', 'readwrite');
        const table = transaction.objectStore('tasks');
        let result, error;
        const request = table.getAll();
        request.onsuccess = () => {
          try {
            const tasks = request.result;
            const originals = new Map(tasks.map(task => [task.id, task.revision]));
            result = action(tasks);
            const remaining = new Set(tasks.map(task => task.id));
            originals.forEach((_, id) => { if (!remaining.has(id)) table.delete(id); });
            tasks.forEach(task => {
              const previous = originals.get(task.id);
              if (!originals.has(task.id) || previous !== task.revision) table.put(task);
            });
          } catch (caught) { error = caught; transaction.abort(); }
        };
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = transaction.onerror = () => reject(error || new Error('导出任务保存失败，可能是浏览器存储空间不足'));
      });
    }
  };
  const service = ExportTasks.createService({ store, userId: 'prototype-current-user', buildFile: window.__xlsxExportUtils.createXlsxBytes });
  let toast, closeTimer, busy = false, lastError = '';
  function notify(message, id) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'export-task-toast'; toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.replaceChildren();
    const text = document.createElement('span'); text.textContent = message; toast.appendChild(text);
    if (id) {
      const link = document.createElement('a'); link.textContent = '查看任务';
      link.href = managerUrl.href + '?task=' + encodeURIComponent(id); toast.appendChild(link);
    }
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭提示');
    close.onclick = () => { toast.hidden = true; }; toast.appendChild(close);
    toast.hidden = false; clearTimeout(closeTimer); closeTimer = setTimeout(() => { toast.hidden = true; }, 10000);
  }
  async function tick() {
    if (busy || document.hidden) return;
    busy = true;
    try {
      await service.advance();
      const notices = await service.takeNotices();
      if (notices.length) {
        const item = notices[0];
        notify(notices.length > 1 ? `${notices.length} 个导出任务已处理，请查看结果` : `${item.filename}：${ExportTasks.statuses[item.status]}`, item.id);
      }
      window.dispatchEvent(new Event('export-tasks-changed'));
      lastError = '';
    } catch (error) {
      if (lastError !== error.message) { notify(error.message); lastError = error.message; }
    } finally { busy = false; }
  }
  window.ExportTaskUI = {
    service, notify,
    async submit(request) {
      const task = await service.submit(request);
      notify('导出任务已创建', task.id);
      window.dispatchEvent(new Event('export-tasks-changed'));
      return task;
    },
    async download(id) {
      const result = await service.download(id);
      const url = URL.createObjectURL(new Blob([result.bytes], { type: mime }));
      const link = document.createElement('a'); link.href = url; link.download = result.filename;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
  tick();
})();
