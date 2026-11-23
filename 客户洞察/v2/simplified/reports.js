(function (host) {
  'use strict';
  function mount({ root, getSnapshot, notify }) {
    const R = host.InsightReportModel, key = 'voice-qc-insight-report-tasks-v1';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const labels = { queued: '排队中', running: '生成中', succeeded: '已完成', failed: '失败' };
    let tasks = [], active = '', timer;
    try { const saved = JSON.parse(host.localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) tasks = saved.filter(t => t?.id && labels[t.status] && t.snapshot?.version === 1 && t.snapshot.scope && t.snapshot.coverage).slice(0, 20); } catch {}
    const save = () => { try { host.localStorage.setItem(key, JSON.stringify(tasks)); } catch { notify('报告任务暂存在当前页面，浏览器保存失败。', 'error'); } };
    const table = (heads, rows) => `<div class="ci-report-table"><table class="data-table badge-data-table"><thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const percent = value => value === null ? '—' : value.toFixed(1) + '%';
    function render() {
      const body = root.querySelector('[data-report-body]');
      const task = tasks.find(t => t.id === active);
      const busy = tasks.some(t => ['queued', 'running'].includes(t.status));
      document.getElementById('generateReport').textContent = busy ? '查看报告进度' : '生成AI解读报告';
      if (!task) {
        body.innerHTML = `<p class="ci-note">点击生成时会锁定当前筛选范围；完成后可直接阅读，不需要下载。当前为演示任务。</p>${tasks.length ? tasks.map(t => `<article class="ci-report-task"><div><strong>${esc(t.snapshot.template)}线索报告</strong><p>${esc(t.snapshot.scope.start)} 至 ${esc(t.snapshot.scope.end)}下发 · ${esc(t.snapshot.template)} · ${t.snapshot.coverage.total}条</p><small>${esc(new Date(t.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))}</small></div><div><span class="ci-report-status" data-status="${esc(t.status)}">${labels[t.status]}</span><button class="ci-text" data-report-open="${esc(t.id)}" type="button">${t.status === 'succeeded' ? '阅读报告' : '查看进度'}</button>${['succeeded','failed'].includes(t.status) ? `<button class="ci-text" data-report-remove="${esc(t.id)}" type="button">删除</button>` : ''}</div></article>`).join('') : '<p class="ci-report-empty">暂无报告。选择数据范围后，点击“生成AI解读报告”。</p>'}`;
        return;
      }
      const data = task.snapshot;
      body.innerHTML = `<button class="ci-text" data-report-back type="button">← 返回报告列表</button><section class="ci-section"><h3>${esc(data.template)}线索分析报告 <span class="ci-report-status" data-status="${esc(task.status)}">${labels[task.status]}</span></h3><p class="ci-report-scope">${esc(data.scopeText)}</p><p class="ci-note">数据截至 ${esc(data.statusAsOf.replace('T', ' '))} · 演示任务</p></section>`;
      if (task.status === 'failed') { body.innerHTML += `<p class="ci-warning">${esc(task.error)}</p><button class="btn" type="button" data-report-retry="${esc(task.id)}">重试</button>`; return; }
      if (task.status !== 'succeeded') { body.innerHTML += `<div class="ci-report-progress" role="status" aria-live="polite"><strong>${task.status === 'queued' ? '报告已提交，等待处理' : '正在整理固定模板报告'}</strong><p>任务使用提交时保存的数据范围，你可以关闭窗口继续查看看板。</p></div>`; return; }
      const report = task.report;
      body.innerHTML += `<section class="ci-section"><h3>一、解读摘要</h3><p>${esc(report.summary)}</p></section><section class="ci-section"><h3>二、人群与AI覆盖</h3>${table(['人群线索','可分析','无录音','分析失败','无所选场景结果'], [[data.coverage.total,data.coverage.ready,data.coverage.no_recording,data.coverage.failed,data.coverage.no_scene]])}<p class="ci-note">未满时长${data.immatureCount}条未纳入；成熟线索中到店状态待确认${data.unknownVisitCount}条，不默认归为未到店。${data.compare ? `本次对比排除重叠${data.overlapCount}条。` : ''}</p></section><section class="ci-section"><h3>三、主要客户顾虑</h3>${data.signals.length ? table(['标签','提及线索','可分析分母','提及占比'],data.signals.map(r=>[r.name,r.count,r.denominator,percent(r.share)])) : '<p>当前无可用结果，暂不判断。</p>'}</section><section class="ci-section"><h3>四、销售动作执行</h3>${data.actions.length ? table(['动作','适用线索','完成','完成率','合格率'],data.actions.map(r=>[r.name,r.count,r.done,percent(r.completion),percent(r.qualified)])) : '<p>当前无所选场景的动作结果。</p>'}</section><section class="ci-section"><h3>五、建议与验证</h3><ul>${report.recommendations.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section><section class="ci-section"><h3>六、统计口径</h3><p>到店人群按下发时间及首次到店时间判断观察周期内是否到店，观察期未结束及到店信息待确认的线索不纳入周期结果；下订和战败人群按截至数据时点已确认的业务事实筛选。人群包含无录音、分析失败和无所选场景结果的线索；客户标签与SOP仅使用可分析样本。</p><p>${esc(report.limitation)}</p></section>`;
    }
    function tick() {
      timer = null;
      const index = tasks.findIndex(t => ['queued', 'running'].includes(t.status));
      if (index < 0) return;
      tasks[index] = R.advance(tasks[index]); save(); render();
      if (tasks.some(t => ['queued', 'running'].includes(t.status))) timer = host.setTimeout(tick, 900);
    }
    function open() { active = ''; render(); root.showModal(); }
    function submit() {
      const busy = tasks.find(t => ['queued', 'running'].includes(t.status));
      if (busy) { active = busy.id; render(); root.showModal(); return; }
      if (tasks.length >= 20) { notify('当前浏览器已保留20份报告，请先删除不再需要的已完成或失败报告。'); open(); return; }
      const data = getSnapshot();
      if (!data) { notify('当前没有可提交的线索范围。'); return; }
      const task = R.newTask(data);
      tasks.unshift(task); active = task.id; save(); render(); root.showModal();
      if (!timer) timer = host.setTimeout(tick, 700);
    }
    root.addEventListener('click', event => {
      const openButton = event.target.closest('[data-report-open]'), retry = event.target.closest('[data-report-retry]'), remove = event.target.closest('[data-report-remove]');
      if (openButton) active = openButton.dataset.reportOpen;
      else if (event.target.closest('[data-report-back]')) active = '';
      else if (remove) { tasks = tasks.filter(task => task.id !== remove.dataset.reportRemove || ['queued','running'].includes(task.status)); save(); }
      else if (retry) { const index = tasks.findIndex(t => t.id === retry.dataset.reportRetry); tasks[index] = R.retry(tasks[index]); save(); if (!timer) timer = host.setTimeout(tick, 700); }
      else return;
      render();
    });
    render(); if (tasks.some(t => ['queued', 'running'].includes(t.status))) timer = host.setTimeout(tick, 700);
    return { open, submit };
  }
  host.InsightReports = { mount };
})(window);
