(async function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const date = value => value == null ? '—' : new Date(value).toLocaleString('zh-CN', { hour12: false });
  const dateKey = value => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  let page = 1, pages = 1, detailId = null, deleteId = null, lastMarkup = '', lastDetail = '', refreshVersion = 0;
  let ui, service;
  function showRefreshToast() {
    window.PlatformToast.show('导出任务已刷新', { kind: 'success', duration: 1800 });
  }

  function report(error) { byId('exportError').hidden = false; byId('exportError').textContent = error.message; }
  try { await window.__exportReady; ui = window.ExportTaskUI; service = ui.service; await service.seedDemoTasks(); }
  catch (error) { report(error); return; }
  const status = task => `<span class="export-status ${escape(task.status)}">${escape(ExportTasks.statuses[task.status])}</span>`;
  let detailDownloadBusy = false;
  function detail(task) {
    return `<section class="export-file-summary" aria-label="任务信息">
      <div class="export-file-art"><img src="../assets/export-detail/excel.svg" width="72" height="72" alt=""><span>XLSX</span></div>
      <div class="export-file-copy"><h3>${escape(task.filename)}</h3><p>来源：<strong>${escape(ExportTasks.sources[task.source])}</strong></p>${status(task)}</div>
      <div class="export-record-count"><span>记录数</span><p><strong>${task.recordCount.toLocaleString('zh-CN')}</strong><span>条</span></p></div>
    </section>
    <div class="export-detail-content">
      <section class="export-detail-section export-detail-times" aria-label="任务时间"><h3>任务时间</h3><div class="export-detail-section-body"><dl>${[['提交时间', task.createdAt], ['完成时间', task.completedAt], ['失效时间', task.expiresAt]].map(([label, value]) => `<div><dt>${label}</dt><dd>${date(value)}</dd></div>`).join('')}</dl></div></section>
      <section class="export-detail-section"><h3>提交时的筛选条件</h3><div class="export-detail-section-body">${task.filters?.length ? `<dl>${task.filters.map(filter => `<div><dt>${escape(filter.label)}</dt><dd>${escape(filter.value)}</dd></div>`).join('')}</dl>` : '<p class="export-muted">未设置筛选条件，导出全部记录</p>'}</div></section>
      <section class="export-detail-section"><h3>导出字段<span class="export-field-caption">（按导出顺序）</span></h3><div class="export-detail-section-body"><ol class="export-field-list">${task.columns.map((column, index) => `<li><span class="export-field-number" aria-hidden="true">${index + 1}</span><span>${escape(column.label)}</span></li>`).join('')}</ol></div></section>
    </div>`;
  }
  function renderDetail(task) {
    const html = detail(task);
    if (html !== lastDetail) { byId('exportDetailBody').innerHTML = html; lastDetail = html; }
    const notes = {
      completed: `文件将于 ${date(task.expiresAt)} 失效，请及时下载`,
      queued: '任务排队中，完成后可下载文件',
      running: '正在生成文件，完成后可下载',
      failed: '文件生成失败，请回原列表重新发起导出',
      expired: '文件已过期，请回原列表重新发起导出'
    };
    byId('exportDetailNote').textContent = notes[task.status];
    const footer = byId('exportDetail').querySelector('.export-detail-footer');
    footer.classList.toggle('is-failed', task.status === 'failed');
    footer.classList.toggle('is-completed', task.status === 'completed');
    const download = byId('exportDetailDownload');
    download.disabled = task.status !== 'completed' || detailDownloadBusy;
    download.setAttribute('aria-busy', String(detailDownloadBusy));
    download.querySelector('span:last-child').textContent = detailDownloadBusy ? '下载中…' : '下载文件';
  }
  const choices = {
    exportSource: [['', '全部来源'], ...Object.entries(ExportTasks.sources)],
    exportStatus: [['', '全部状态'], ...Object.entries(ExportTasks.statuses)],
    exportPageSize: ['10', '20', '50'].map(value => [value, `${value} 条/页`])
  };
  function closeMenus() {
    document.querySelectorAll('.export-select, .export-date-control').forEach(control => {
      control.classList.remove('is-open');
      const trigger = control.querySelector('button');
      trigger.setAttribute('aria-expanded', 'false'); trigger.classList.remove('is-open', 'active');
      const menu = control.querySelector('[role="listbox"], [role="dialog"]');
      menu.hidden = true; menu.classList.remove('open');
    });
  }
  function syncSelects() {
    document.querySelectorAll('.export-select').forEach(control => {
      const id = control.dataset.select, value = byId(id).value, isSize = id === 'exportPageSize';
      control.querySelector('button').firstElementChild.textContent = choices[id].find(option => option[0] === value)[1];
      byId(`${id}Menu`).innerHTML = choices[id].map(([key, label]) => `<button type="button" role="option" aria-selected="${key === value}" class="${isSize ? 'page-size-option' : 'session-menu-option'}${key === value ? ' active' : ''}" data-value="${escape(key)}"><span>${escape(label)}</span></button>`).join('');
    });
  }
  document.querySelectorAll('.export-select').forEach(control => {
    const trigger = control.querySelector('button'), menu = control.querySelector('[role="listbox"]');
    function open() {
      closeMenus(); control.classList.add('is-open'); menu.hidden = false; menu.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true'); trigger.classList.add('is-open', 'active');
    }
    trigger.onclick = () => { const wasOpen = !menu.hidden; closeMenus(); if (!wasOpen) open(); };
    trigger.onkeydown = event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); (menu.querySelector('[aria-selected="true"]') || menu.querySelector('button')).focus(); }
    };
    menu.onclick = event => {
      const option = event.target.closest('[data-value]'); if (!option) return;
      byId(control.dataset.select).value = option.dataset.value; syncSelects(); closeMenus(); trigger.focus(); page = 1; refresh();
    };
    menu.onkeydown = event => {
      const options = [...menu.querySelectorAll('button')], index = options.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      }
    };
  });
  let draftStart = '', draftEnd = '', activeDate = 'start', viewDate = new Date();
  const rangeText = (start, end) => start || end ? `${start || '不限'} 至 ${end || '不限'}` : '不限日期';
  function syncDate() { byId('exportDateTrigger').querySelector('strong').textContent = rangeText(byId('exportStart').value, byId('exportEnd').value); }
  function renderCalendar() {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7, count = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: Math.ceil((leading + count) / 7) * 7 }, (_, index) => {
      const day = index - leading + 1;
      if (day < 1 || day > count) return '<span class="session-date-empty" aria-hidden="true"></span>';
      const value = dateKey(new Date(year, month, day)), inRange = draftStart && draftEnd && value >= draftStart && value <= draftEnd;
      return `<button type="button" class="session-date-day${inRange ? ' in-range' : ''}${value === draftStart ? ' is-start' : ''}${value === draftEnd ? ' is-end' : ''}${value === dateKey(Date.now()) ? ' is-today' : ''}" data-day="${value}" aria-label="${value}">${day}</button>`;
    }).join('');
    byId('exportDateMenu').innerHTML = `<div class="session-date-panel-head"><div class="session-date-panel-copy"><span>提交日期范围</span><strong>${draftStart || draftEnd ? '已选择日期范围' : '不限日期'}</strong></div><div class="session-date-nav"><button type="button" class="session-date-nav-btn" data-month="-1" aria-label="上一个月"><i class="session-date-nav-arrow prev"></i></button><strong>${year}年${month + 1}月</strong><button type="button" class="session-date-nav-btn" data-month="1" aria-label="下一个月"><i class="session-date-nav-arrow next"></i></button></div></div><div class="session-date-tabs">${[['start', '开始日期', draftStart], ['end', '结束日期', draftEnd]].map(([key, label, value]) => `<button type="button" class="session-date-tab${activeDate === key ? ' active' : ''}" data-date-field="${key}"><span>${label}</span><strong>${value || '不限'}</strong></button>`).join('')}</div><div class="session-date-weekdays">${['一','二','三','四','五','六','日'].map(day => `<span>${day}</span>`).join('')}</div><div class="session-date-grid">${cells}</div><div class="session-date-shortcuts"><button type="button" class="session-date-shortcut" data-days="1">今天</button><button type="button" class="session-date-shortcut" data-days="3">近3天</button><button type="button" class="session-date-shortcut" data-days="7">近7天</button><button type="button" class="session-date-shortcut" data-days="0">不限日期</button></div><div class="session-cascader-footer session-date-footer"><span>按提交日期筛选</span><div class="session-date-actions"><button type="button" class="session-date-shortcut" data-date-cancel>取消</button><button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-date-apply>应用日期</button></div></div>`;
  }
  byId('exportDateTrigger').onclick = () => {
    const wasOpen = !byId('exportDateMenu').hidden; closeMenus(); if (wasOpen) return;
    draftStart = byId('exportStart').value; draftEnd = byId('exportEnd').value; activeDate = 'start';
    viewDate = draftStart ? new Date(`${draftStart}T00:00:00`) : new Date(); renderCalendar();
    byId('exportDateMenu').hidden = false; byId('exportDateTrigger').setAttribute('aria-expanded', 'true');
    byId('exportDateTrigger').classList.add('active'); byId('exportDateTrigger').parentElement.classList.add('is-open');
  };
  byId('exportDateMenu').onclick = event => {
    event.stopPropagation();
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-date-apply')) {
      byId('exportStart').value = draftStart; byId('exportEnd').value = draftEnd;
      syncDate(); closeMenus(); byId('exportDateTrigger').focus(); page = 1; refresh(); return;
    }
    if (button.hasAttribute('data-date-cancel')) { closeMenus(); byId('exportDateTrigger').focus(); return; }
    if (button.dataset.month) viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + Number(button.dataset.month), 1);
    if (button.dataset.dateField) activeDate = button.dataset.dateField;
    if (button.dataset.day) {
      if (activeDate === 'start') { draftStart = button.dataset.day; if (draftEnd && draftEnd < draftStart) draftEnd = draftStart; activeDate = 'end'; }
      else { draftEnd = button.dataset.day; if (draftStart && draftStart > draftEnd) draftStart = draftEnd; }
    }
    if (button.dataset.days !== undefined) {
      const days = Number(button.dataset.days), today = new Date(), start = new Date();
      start.setDate(today.getDate() - days + 1); draftStart = days ? dateKey(start) : ''; draftEnd = days ? dateKey(today) : ''; viewDate = today;
    }
    const focusSelector = button.dataset.month ? `[data-month="${button.dataset.month}"]` : button.dataset.day ? `[data-day="${button.dataset.day}"]` : button.dataset.dateField ? `[data-date-field="${button.dataset.dateField}"]` : `[data-days="${button.dataset.days}"]`;
    renderCalendar(); byId('exportDateMenu').querySelector(focusSelector)?.focus();
  };
  document.addEventListener('click', event => { if (!event.target.closest('.export-select, .export-date-control')) closeMenus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const control = document.querySelector('.export-select.is-open, .export-date-control.is-open');
      if (control) { event.preventDefault(); closeMenus(); control.querySelector('button').focus(); }
    }
  });
  document.addEventListener('focusin', event => { if (!event.target.closest('.export-select, .export-date-control')) closeMenus(); });
  function renderPages() {
    const visible = [...new Set([1, page - 1, page, page + 1, pages])].filter(value => value >= 1 && value <= pages).sort((a, b) => a - b);
    const markup = visible.map((value, index) => `${index && value - visible[index - 1] > 1 ? '<span class="page-ellipsis">…</span>' : ''}<button type="button" class="page-num${value === page ? ' active' : ''}" data-page="${value}" aria-label="第 ${value} 页"${value === page ? ' aria-current="page"' : ''}>${value}</button>`).join('');
    if (byId('exportPage').innerHTML !== markup) byId('exportPage').innerHTML = markup;
    byId('exportJump').max = pages; if (document.activeElement !== byId('exportJump')) byId('exportJump').value = page;
  }
  byId('exportPage').onclick = event => { const button = event.target.closest('[data-page]'); if (button) { page = Number(button.dataset.page); refresh(); } };
  function jump() { const value = Number(byId('exportJump').value); page = Math.max(1, Math.min(pages, Number.isFinite(value) ? Math.trunc(value) : 1)); byId('exportJump').value = page; refresh(); }
  byId('exportJump').onchange = jump;
  byId('exportJump').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); jump(); } };
  syncSelects(); syncDate();
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
      const markup = filtered.slice((page - 1) * size, page * size).map(task => `<tr><td><button class="export-link export-name" data-detail="${escape(task.id)}" title="${escape(task.filename)}">${escape(task.filename)}</button></td><td>${escape(ExportTasks.sources[task.source])}</td><td>${status(task)}</td><td>${task.recordCount.toLocaleString('zh-CN')}</td><td>${date(task.createdAt)}</td><td>${date(task.completedAt)}</td><td>${date(task.expiresAt)}</td><td><div class="export-actions"><button class="export-link" type="button" ${task.status === 'completed' ? `data-download="${escape(task.id)}"` : 'disabled'}>下载</button>${['completed', 'failed', 'expired'].includes(task.status) ? `<button class="export-link danger" data-delete="${escape(task.id)}">删除</button>` : '<span class="export-muted">—</span>'}</div></td></tr>`).join('');
      if (markup !== lastMarkup) { byId('exportRows').innerHTML = markup; lastMarkup = markup; }
      byId('exportCount').innerHTML = `当前匹配 <strong>${filtered.length}</strong> 个任务`;
      byId('exportTotal').textContent = `共 ${filtered.length} 条`;
      renderPages();
      byId('exportPrevious').disabled = page <= 1; byId('exportNext').disabled = page >= pages;
      byId('exportEmpty').hidden = filtered.length > 0;
      byId('exportEmpty').querySelector('h3').textContent = all.length ? '没有匹配的导出任务' : '暂无导出任务';
      byId('exportEmpty').querySelector('p').textContent = all.length ? '试试调整筛选条件或搜索词' : '在录音列表、线索列表或工牌明细中点击导出，即可创建任务';
      if (detailId && byId('exportDetail').open) {
        const task = all.find(item => item.id === detailId);
        if (!task) { closeDetail(); ui.notify('任务已被删除', null, 'info'); }
        else renderDetail(task);
      }
    } catch (error) { if (version === refreshVersion) report(error); return false; }
  }
  const detailDrawer = byId('exportDetail');
  let detailCloseTimer, detailTrigger, detailOpenVersion = 0;
  function closeDetail() {
    if (!detailDrawer.open) return;
    ++detailOpenVersion;
    clearTimeout(detailCloseTimer);
    detailDrawer.classList.remove('is-open');
    const finish = () => {
      detailDrawer.close();
      detailId = null;
      if (detailTrigger?.isConnected) detailTrigger.focus();
      detailTrigger = null;
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else detailCloseTimer = setTimeout(finish, 230);
  }
  async function openDetail(id) {
    const version = ++detailOpenVersion;
    const trigger = document.activeElement;
    const task = await service.get(id);
    if (version !== detailOpenVersion) return;
    clearTimeout(detailCloseTimer);
    detailTrigger = trigger;
    detailId = id; renderDetail(task);
    if (!detailDrawer.open) detailDrawer.showModal();
    byId('exportDetailBody').scrollTop = 0;
    detailDrawer.getBoundingClientRect();
    detailDrawer.classList.add('is-open');
    detailDrawer.querySelector('[data-close]').focus();
  }
  byId('exportDetailDownload').onclick = async () => {
    if (!detailId || detailDownloadBusy || byId('exportDetailDownload').disabled) return;
    detailDownloadBusy = true;
    const button = byId('exportDetailDownload');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.querySelector('span:last-child').textContent = '下载中…';
    try { await ui.download(detailId); }
    catch (error) { ui.notify(error.message, null, 'error'); }
    finally { detailDownloadBusy = false; await refresh(); }
  };
  detailDrawer.addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
  let detailBackdropPressed = false;
  function isOutsideDetail(event) {
    const rect = detailDrawer.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  detailDrawer.addEventListener('pointerdown', event => { detailBackdropPressed = event.target === detailDrawer && isOutsideDetail(event); });
  detailDrawer.addEventListener('click', event => {
    if (detailBackdropPressed && event.target === detailDrawer && isOutsideDetail(event)) closeDetail();
    detailBackdropPressed = false;
  });
  ['exportSearch', 'exportSource', 'exportStatus', 'exportStart', 'exportEnd', 'exportPageSize'].forEach(id => byId(id).addEventListener('input', () => { page = 1; refresh(); }));
  byId('exportReset').onclick = () => { ['exportSearch', 'exportSource', 'exportStatus', 'exportStart', 'exportEnd'].forEach(id => { byId(id).value = ''; }); syncSelects(); syncDate(); closeMenus(); page = 1; refresh(); window.PlatformToast.show('筛选条件已重置', { kind: 'info', duration: 2200 }); };
  byId('exportRefresh').onclick = async () => {
    const button = byId('exportRefresh');
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-refreshing');
    button.setAttribute('aria-busy', 'true');
    button.lastElementChild.textContent = '刷新中';
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      await service.advance();
      if (await refresh() !== false) showRefreshToast();
    } catch (error) { report(error); }
    finally {
      button.disabled = false;
      button.classList.remove('is-refreshing');
      button.setAttribute('aria-busy', 'false');
      button.lastElementChild.textContent = '刷新';
    }
  };
  byId('exportPrevious').onclick = () => { page = Math.max(1, page - 1); refresh(); };
  byId('exportNext').onclick = () => { page = Math.min(pages, page + 1); refresh(); };
  document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => button.dataset.close === 'exportDetail' ? closeDetail() : byId(button.dataset.close).close(); });
  byId('exportRows').addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button) return;
    try {
      if (button.dataset.detail) await openDetail(button.dataset.detail);
      if (button.dataset.download) await ui.download(button.dataset.download);
      if (button.dataset.delete) {
        const task = await service.get(button.dataset.delete);
        if (['queued', 'running'].includes(task.status)) throw new Error('进行中的任务不能删除');
        deleteId = task.id;
        const deleteName = byId('exportDeleteName');
        const filename = document.createElement('span');
        filename.className = 'export-delete-filename';
        filename.textContent = task.filename;
        deleteName.replaceChildren('确定删除“', filename, '”？');
        byId('exportDelete').showModal();
      }
    } catch (error) { ui.notify(error.message, null, 'error'); await refresh(); }
  });
  byId('exportConfirmDelete').onclick = async () => {
    const button = byId('exportConfirmDelete'); button.disabled = true;
    try { await service.remove(deleteId); byId('exportDelete').close(); ui.notify('导出任务已删除', null, 'success'); await refresh(); }
    catch (error) { ui.notify(error.message, null, 'error'); }
    finally { button.disabled = false; }
  };
  window.addEventListener('export-tasks-changed', refresh);
  await refresh();
  const target = new URLSearchParams(location.search).get('task');
  if (target) { try { await openDetail(target); } catch (error) { ui.notify(error.message, null, 'error'); } }
})();
