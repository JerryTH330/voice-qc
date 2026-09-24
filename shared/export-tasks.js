(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ExportTasks = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sources = { session: '录音列表', leads: '线索列表', customers: '客户聚合列表', badges: '工牌明细' };
  const statuses = { queued: '排队中', running: '导出中', completed: '已完成', failed: '失败', expired: '已过期' };
  const copy = value => structuredClone(value);
  // 演示耗时：排队 2 秒，准备 8 秒，每 100 条增加 2 秒。
  const queueDuration = 2000;
  const exportDuration = recordCount => 8000 + Math.ceil(recordCount / 100) * 2000;
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
            if (task.status === 'queued' && now() - task.createdAt >= queueDuration) {
              task.status = 'running'; task.startedAt = now(); task.revision++;
            } else if (task.status === 'running' && now() - task.startedAt >= exportDuration(task.recordCount)) {
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
      seedDemoTasks() {
        return update(tasks => {
          const markerId = `__export_demo_seed_v2__:${userId}`;
          if (tasks.some(task => task.id === markerId)) return false;
          const hasOriginalDemo = tasks.some(task => task.id === `__export_demo_seed_v1__:${userId}`);
          const minute = 60000;
          const baseTime = now();
          const pad = value => String(value).padStart(2, '0');
          const stamp = value => {
            const date = new Date(value);
            return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
          };
          const examples = [
            { source: 'session', status: 'failed', minutesAgo: 18, recordCount: 780, filters: [{ label: '品牌', value: '传祺' }], error: '演示：文件生成失败。' },
            { source: 'leads', status: 'completed', minutesAgo: 75, recordCount: 236, filters: [{ label: '线索品牌', value: '埃安' }] },
            { source: 'session', status: 'completed', minutesAgo: 210, recordCount: 428, filters: [{ label: '质检场景', value: '邀约到店' }] },
            { source: 'customers', status: 'failed', minutesAgo: 1440, recordCount: 1680, filters: [{ label: '线索品牌', value: '传祺' }], error: '演示：导出服务繁忙。' },
            { source: 'badges', status: 'completed', minutesAgo: 2880, recordCount: 84, filters: [{ label: '工牌状态', value: '录音中' }] },
            { source: 'leads', status: 'expired', minutesAgo: 14400, recordCount: 52, filters: [] }
          ];
          const extraSources = ['session', 'leads', 'customers', 'badges'];
          for (let index = 0; index < 24; index++) {
            const source = extraSources[index % extraSources.length];
            const status = index >= 20 ? 'expired' : index % 5 === 0 ? 'failed' : 'completed';
            examples.push({
              source, status,
              minutesAgo: status === 'expired' ? (8 + index % 4) * 1440 : 35 + index * 317,
              recordCount: 36 + (index * 137) % 960,
              filters: source === 'session' ? [{ label: '品牌', value: '传祺' }, { label: '质检场景', value: '邀约到店' }]
                : source === 'leads' ? [{ label: '线索品牌', value: '埃安' }, { label: '意向车系', value: 'AION Y' }]
                : source === 'customers' ? [{ label: 'AI意向等级', value: '高' }]
                : [{ label: '工牌状态', value: '录音中' }],
              error: status === 'failed' ? ['演示：生成文件超时，请回原列表重新发起导出。', '演示：导出服务暂时不可用，请稍后重试。'][index % 2] : ''
            });
          }
          const sampleColumns = {
            session: [{ label: '录音ID' }, { label: '品牌' }, { label: '质检场景' }],
            leads: [{ label: '线索ID' }, { label: '线索品牌' }, { label: '意向车系' }],
            customers: [{ label: '客户名称' }, { label: '录音数' }, { label: 'AI意向等级' }],
            badges: [{ label: '工牌编号' }, { label: '门店' }, { label: '工牌状态' }]
          };
          examples.forEach((example, index) => {
            if (hasOriginalDemo && index < 6) return;
            const createdAt = baseTime - example.minutesAgo * minute;
            const sheetName = sources[example.source];
            const columns = sampleColumns[example.source];
            const completedAt = ['completed', 'expired'].includes(example.status)
              ? createdAt + queueDuration + exportDuration(example.recordCount) : null;
            const rows = example.status === 'completed' ? Array.from({ length: example.recordCount }, (_, row) => {
              const number = pad(row + 1);
              if (example.source === 'session') return [`DEMO-REC-${number}`, '传祺', '邀约到店'];
              if (example.source === 'leads') return [`DEMO-LEAD-${number}`, '埃安', 'AION Y'];
              if (example.source === 'customers') return [`演示客户 ${number}`, 1 + row % 8, '高'];
              return [`DEMO-BADGE-${number}`, `演示门店 ${pad((row % 8) + 1)}`, '录音中'];
            }) : null;
            tasks.push({
              id: `__export_demo_${index < 6 ? 'v1' : 'v2'}_${index}__:${userId}`, userId, revision: 1, notified: true,
              source: example.source, status: example.status, sheetName, columns,
              filename: `演示_${sheetName}_${stamp(createdAt)}.xlsx`, filters: example.filters,
              recordCount: example.recordCount, createdAt, startedAt: createdAt + queueDuration,
              completedAt, expiresAt: completedAt === null ? null : completedAt + 604800000,
              error: example.error || '',
              ...(rows ? { file: buildFile({ columns, rows, sheetName }) } : {})
            });
          });
          if (!hasOriginalDemo) tasks.push({ id: `__export_demo_seed_v1__:${userId}`, userId: '__export_demo_seed__', revision: 1 });
          tasks.push({ id: markerId, userId: '__export_demo_seed__', revision: 1 });
          return true;
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
