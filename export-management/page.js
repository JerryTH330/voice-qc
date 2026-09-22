(async function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const date = value => value == null ? '—' : new Date(value).toLocaleString('zh-CN', { hour12: false });
  const dateKey = value => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  let page = 1, pages = 1, detailId = null, deleteId = null, lastMarkup = '', lastDetail = '', refreshVersion = 0;
  let ui, service;
  function report(error) { byId('exportError').hidden = false; byId('exportError').textContent = error.message; }
  try { await window.__exportReady; ui = window.ExportTaskUI; service = ui.service; }
  catch (error) { report(error); return; }
  const status = task => `<span class="export-status ${escape(task.status)}">${escape(ExportTasks.statuses[task.status])}</span>`;
  function detail(task) {
    return `<dl><dt>文件名称</dt><dd>${escape(task.filename)}</dd><dt>来源</dt><dd>${escape(ExportTasks.sources[task.source])}</dd><dt>状态</dt><dd>${status(task)}</dd><dt>记录数</dt><dd>${task.recordCount.toLocaleString('zh-CN')} 条</dd><dt>提交时间</dt><dd>${date(task.createdAt)}</dd><dt>完成时间</dt><dd>${date(task.completedAt)}</dd><dt>失效时间</dt><dd>${date(task.expiresAt)}</dd></dl>${task.status === 'failed' ? `<h3>失败原因</h3><p>${escape(task.error)}</p><p class="export-muted">请回原列表重新发起导出。</p>` : ''}<h3>提交时的筛选条件</h3>${task.filters?.length ? `<dl>${task.filters.map(filter => `<dt>${escape(filter.label)}</dt><dd>${escape(filter.value)}</dd>`).join('')}</dl>` : '<p class="export-muted">未设置筛选条件，导出全部记录</p>'}<h3>导出字段（按导出顺序）</h3><ol class="export-field-list">${task.columns.map(column => `<li>${escape(column.label)}</li>`).join('')}</ol>`;
  }
  async function refresh() {
    const version = ++refreshVersion;
    try {
      const all = await service.list();
      if (version !== refreshVersion) return;
      byId('exportError').hidden = true;
      const query = byId('exportSearch').value.trim().toLocaleLowerCase('zh-CN');
      const source = byId('exportSource').value, selectedStatus = byId('exportStatus').value;
      const start = byId('exportStart').value, end = byId('exportEnd').value;
      if (start && end && start > end) throw new Error('提交开始日期不能晚于结束日期');
      const filtered = all.filter(task => (!query || task.filename.toLocaleLowerCase('zh-CN').includes(query)) && (!source || task.source === source) && (!selectedStatus || task.status === selectedStatus) && (!start || dateKey(task.createdAt) >= start) && (!end || dateKey(task.createdAt) <= end));
      const size = Number(byId('exportPageSize').value);
      pages = Math.max(1, Math.ceil(filtered.length / size)); page = Math.min(page, pages);
      const markup = filtered.slice((page - 1) * size, page * size).map(task => `<tr><td><button class="export-link export-name" data-detail="${escape(task.id)}" title="${escape(task.filename)}">${escape(task.filename)}</button></td><td>${escape(ExportTasks.sources[task.source])}</td><td>${status(task)}</td><td>${task.recordCount.toLocaleString('zh-CN')}</td><td>${date(task.createdAt)}</td><td>${date(task.completedAt)}</td><td>${date(task.expiresAt)}</td><td><div class="export-actions">${task.status === 'completed' ? `<button class="export-link" data-download="${escape(task.id)}">下载</button>` : ''}${['completed', 'failed', 'expired'].includes(task.status) ? `<button class="export-link danger" data-delete="${escape(task.id)}">删除</button>` : '<span class="export-muted">—</span>'}</div></td></tr>`).join('');
      if (markup !== lastMarkup) { byId('exportRows').innerHTML = markup; lastMarkup = markup; }
      byId('exportCount').textContent = `当前匹配 ${filtered.length} 个任务`;
      byId('exportTotal').textContent = `共 ${filtered.length} 条`;
      byId('exportPage').textContent = `${page} / ${pages}`;
      byId('exportPrevious').disabled = page <= 1; byId('exportNext').disabled = page >= pages;
      byId('exportEmpty').hidden = filtered.length > 0;
      byId('exportEmpty').querySelector('h3').textContent = all.length ? '没有匹配的导出任务' : '暂无导出任务';
      byId('exportEmpty').querySelector('p').textContent = all.length ? '试试调整筛选条件或搜索词' : '在录音列表、线索列表或工牌明细中点击导出，即可创建任务';
      if (detailId && byId('exportDetail').open) {
        const task = all.find(item => item.id === detailId);
        if (!task) { byId('exportDetail').close(); ui.notify('任务已被删除'); }
        else { const html = detail(task); if (html !== lastDetail) { byId('exportDetailBody').innerHTML = html; lastDetail = html; } }
      }
    } catch (error) { if (version === refreshVersion) report(error); }
  }
  async function openDetail(id) {
    const task = await service.get(id);
    detailId = id; lastDetail = detail(task); byId('exportDetailBody').innerHTML = lastDetail;
    byId('exportDetail').showModal();
  }
  ['exportSearch', 'exportSource', 'exportStatus', 'exportStart', 'exportEnd', 'exportPageSize'].forEach(id => byId(id).addEventListener('input', () => { page = 1; refresh(); }));
  byId('exportStart').addEventListener('input', () => { byId('exportEnd').min = byId('exportStart').value; });
  byId('exportEnd').addEventListener('input', () => { byId('exportStart').max = byId('exportEnd').value; });
  byId('exportReset').onclick = () => { ['exportSearch', 'exportSource', 'exportStatus', 'exportStart', 'exportEnd'].forEach(id => { byId(id).value = ''; }); byId('exportStart').max = ''; byId('exportEnd').min = ''; page = 1; refresh(); };
  byId('exportRefresh').onclick = async () => { const button = byId('exportRefresh'); button.disabled = true; try { await service.advance(); await refresh(); } catch (error) { report(error); } finally { button.disabled = false; } };
  byId('exportPrevious').onclick = () => { page = Math.max(1, page - 1); refresh(); };
  byId('exportNext').onclick = () => { page = Math.min(pages, page + 1); refresh(); };
  document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => byId(button.dataset.close).close(); });
  byId('exportRows').addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button) return;
    try {
      if (button.dataset.detail) await openDetail(button.dataset.detail);
      if (button.dataset.download) await ui.download(button.dataset.download);
      if (button.dataset.delete) {
        const task = await service.get(button.dataset.delete);
        if (['queued', 'running'].includes(task.status)) throw new Error('进行中的任务不能删除');
        deleteId = task.id; byId('exportDeleteName').textContent = `确定删除“${task.filename}”？`; byId('exportDelete').showModal();
      }
    } catch (error) { ui.notify(error.message); await refresh(); }
  });
  byId('exportConfirmDelete').onclick = async () => {
    const button = byId('exportConfirmDelete'); button.disabled = true;
    try { await service.remove(deleteId); byId('exportDelete').close(); ui.notify('导出任务已删除'); await refresh(); }
    catch (error) { ui.notify(error.message); }
    finally { button.disabled = false; }
  };
  window.addEventListener('export-tasks-changed', refresh);
  await refresh();
  const target = new URLSearchParams(location.search).get('task');
  if (target) { try { await openDetail(target); } catch (error) { ui.notify(error.message); } }
})();
