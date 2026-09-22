(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ExportTasks = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sources = { session: '录音列表', leads: '线索列表', customers: '客户聚合列表', badges: '工牌明细' };
  const statuses = { queued: '排队中', running: '导出中', completed: '已完成', failed: '失败', expired: '已过期' };
  const copy = value => structuredClone(value);
  function metadata(task) {
    const { rows, file, revision, notified, ...summary } = task;
    return copy(summary);
  }
  function createService({ store, userId, now = Date.now, buildFile }) {
    if (!userId) throw new Error('缺少当前用户');
    function owned(tasks, id) {
      const task = tasks.find(item => item.id === id && item.userId === userId);
      if (!task) throw new Error('任务不存在或无权访问');
      return task;
    }
    function update(action) {
      return store.update(tasks => {
        tasks.forEach(task => {
          if (task.userId === userId && task.status === 'completed' && now() >= task.expiresAt) {
            task.status = 'expired'; task.revision++; delete task.file; delete task.rows;
          }
        });
        return action(tasks);
      });
    }
    return {
      advance() {
        return update(tasks => {
          tasks.filter(task => task.userId === userId).forEach(task => {
            if (task.status === 'queued' && now() - task.createdAt >= 1000) {
              task.status = 'running'; task.startedAt = now(); task.revision++;
            } else if (task.status === 'running' && now() - task.startedAt >= 4000) {
              try {
                task.file = buildFile({ columns: task.columns, rows: task.rows, sheetName: task.sheetName });
                task.status = 'completed'; task.completedAt = now(); task.expiresAt = now() + 604800000;
              } catch (error) {
                task.status = 'failed'; task.error = error.message || '文件生成失败，请回原列表重新发起';
              }
              task.revision++;
              delete task.rows;
            }
          });
        });
      },
      remove(id) {
        return update(tasks => {
          const task = owned(tasks, id);
          if (['queued', 'running'].includes(task.status)) throw new Error('进行中的任务不能删除');
          tasks.splice(tasks.indexOf(task), 1);
        });
      },
      takeNotices() {
        return update(tasks => tasks.filter(task => task.userId === userId && ['completed', 'failed'].includes(task.status) && !task.notified).map(task => {
          task.notified = true; task.revision++;
          return metadata(task);
        }));
      },
      async download(id) {
        const result = await update(tasks => {
          const task = owned(tasks, id);
          return task.status === 'completed' ? { filename: task.filename, bytes: copy(task.file) } : null;
        });
        if (!result) throw new Error('文件尚未生成或已过期，无法下载');
        return result;
      },
      submit(input) {
        const snapshot = copy(input);
        if (!sources[snapshot.source] || !snapshot.columns?.length || !snapshot.rows?.length) return Promise.reject(new Error('没有可导出的数据或字段'));
        return store.update(tasks => {
          const task = { ...snapshot, id: globalThis.crypto.randomUUID(), userId, revision: 1, status: 'queued', recordCount: snapshot.rows.length, createdAt: now(), completedAt: null, expiresAt: null, error: '' };
          tasks.push(task);
          return metadata(task);
        });
      },
      get(id) { return update(tasks => metadata(owned(tasks, id))); },
      list() { return update(tasks => tasks.filter(task => task.userId === userId).sort((a, b) => b.createdAt - a.createdAt).map(metadata)); }
    };
  }
  return { createService, sources, statuses };
});
