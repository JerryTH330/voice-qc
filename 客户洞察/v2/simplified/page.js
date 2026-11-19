(function () {
  'use strict';
  const M = window.InsightSimpleModel;
  const F = window.InsightScopeFilters;
  const D = window.InsightDateRange;
  let dateRange = null;
  let factoryFilters, reportCenter, cohortPage = 1, cohortFilter = 'all';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = value => value === null ? '—' : value.toFixed(1) + '%';
  const num = value => Number(value).toLocaleString('zh-CN');
  const storageKey = 'voice-qc-insight-simple-draft-v1';
  const primaryEntry = document.body?.dataset.insightEntry === 'primary';
  // Add an entry only in this page's shell; the shared navigation and original route stay intact.
  const originalNav = document.querySelector('.nav-button[data-page="customer-insight"]');
  if (originalNav && !primaryEntry) {
    const simpleNav = originalNav.cloneNode(true);
    simpleNav.dataset.page = 'customer-insight-simple';
    simpleNav.dataset.href = new URL('./index.html', window.location.href).href;
    simpleNav.querySelector('.nav-text').textContent = '客户洞察 V2';
    originalNav.classList.remove('active'); originalNav.removeAttribute('aria-current');
    originalNav.insertAdjacentElement('afterend', simpleNav);
  }
  let scope = M.defaults(), workspace = 'customers', compare = false, dimension = 'resistance', byRegion = false;
  let profileView = 'chart', orgView = 'cards', orgMetric = 'local';
  const expandedOrgs = new Set(), expandedOrgTree = new Set();
  let orgTreePaths = [];
  const expandedProfiles = new Set();
  let result, rows = [], selected = null, evidencePage = 1, evidenceGroup = 'all', completion = 'all', reviewed = new Set(), groupDraft;
  let drillState = null, drillView = null, activeResult, leadPage = 1, compareView = 'chart';
  let customerView = 'overview', summaryExpanded = false, actionPage = 1, actionSort = 'asc';
  const actionPageSize = 10;
  const sortedActions = () => rows.map((row, index) => ({ row, index })).sort((a, b) => {
    const left = a.row.completion, right = b.row.completion;
    if (left == null || right == null) return (left == null) - (right == null) || a.index - b.index;
    return (actionSort === 'desc' ? right - left : left - right) || a.index - b.index;
  });
  const profileGroups = [
    { label: '购车计划', keys: ['intent_model', 'budget', 'timing', 'payment', 'trade_in', 'decision'] },
    { label: '需求与反馈', keys: ['resistance', 'need', 'competitor', 'policy', 'test_drive'] },
    { label: '客户背景', keys: ['driver', 'occupation', 'scenario'] },
    { label: '产品提及', keys: ['product_positive', 'product_negative', 'product_neutral'] }
  ];
  const isProfileOverview = () => workspace === 'customers' && customerView === 'overview' && !drillState;
  const drillScroll = new Map();
  const drillRootLabel = () => factoryFilters?.summary() ?? F.summary(F.create(M, scope));
  let draft = { items: [], sales: '', operations: '', owner: '', reviewDate: '' };
  let draftSaveTimer;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored && Array.isArray(stored.items)) draft = { ...draft, ...stored, items: stored.items.filter(i => i && typeof i.name === 'string' && Array.isArray(i.evidence)).slice(0, 30) };
  } catch { /* A disabled or malformed local store must not prevent analysis. */ }
  const notify = (message, kind = 'info') => window.PlatformToast.show(message, { kind });
  function select(id, label, value, options) {
    const current = options.find(o => o[0] === String(value));
    return `<div class="badge-field-filter badge-field-filter-select ci-select" data-select="${id}"><span>${esc(label)}</span><button class="session-select-trigger" type="button" aria-label="${esc(label)}：${esc(current?.[1] || value)}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}Menu"><strong>${esc(current?.[1] || value)}</strong><i class="session-select-caret" aria-hidden="true"></i></button><div class="session-menu-panel badge-field-select-menu" id="${id}Menu" role="listbox" aria-label="${esc(label)}" hidden>${options.map(([key, name, group]) => `<button class="session-menu-option${key === String(value) ? ' active' : ''}" type="button" role="option" aria-selected="${key === String(value)}" data-value="${esc(key)}"><span>${esc(name)}</span>${group ? `<em>${esc(group)}</em>` : ''}</button>`).join('')}</div></div>`;
  }
  function closeMenus() {
    dateRange = null;
    factoryFilters?.closeMenu();
    document.querySelectorAll('.ci-select').forEach(control => {
      control.classList.remove('is-open');
      const trigger = control.querySelector('.session-select-trigger');
      trigger?.setAttribute('aria-expanded', 'false');
      const menu = control.querySelector('.session-menu-panel');
      if (menu) menu.hidden = true;
    });
  }
  function scopeText(s = scope, includeGroups = compare, includeDrill = true) {
    const filterScope = s === scope ? drillRootLabel() : F.summary(F.create(M, s));
    return `${includeGroups ? `${M.templates[s.template].label} vs ${M.templates[s.comparisonTemplate].label}` : M.templates[s.template].label} · ${filterScope}\n线索下发日期 ${s.start} 至 ${s.end} · ${M.ageLabel(s.minAgeDays)}\n数据截至 ${M.snapshotAt.replace('T', ' ')}\n语音证据场景：${s.scenes.map(k => M.sceneLabels[k]).join('、') || '未选择'}${includeDrill && drillState ? `\n分析项：${drillState.targetName}\n组织路径：${drillState.path.map(p => p.name).join(' / ') || drillRootLabel()}` : ''}`;
  }
  function renderTemplates() {
    $('analysisTemplates').innerHTML = select('leadStatus', '分析人群', scope.template, Object.entries(M.templates).map(([key, state]) => [key, state.label]));
    $('templateDescription').textContent = M.dispatchExplanation(scope);
    $('dispatchExplanation').textContent = M.dispatchExplanation(scope);
  }
  function selectTemplate(value) {
    if (!Object.hasOwn(M.templates, value)) return;
    compare = false; closeMenus();
    updateScope({ template: value, comparisonTemplate: M.templates[value].defaultReference });
    document.querySelector('[data-select="leadStatus"] .session-select-trigger')?.focus({ preventScroll: true });
  }
  function renderCoverage() {
    const c = result.coverage;
    $('coverageSummary').innerHTML = [['all','当前人群',c.total],['recorded','已关联录音线索数',c.total - c.no_recording],['no_recording','无录音',c.no_recording]].map(([key,label,count]) => `<button type="button" class="ci-coverage-item" data-cohort-filter="${key}" aria-label="查看${label}的${num(count)}条线索" title="查看${key === 'recorded' ? '已关联录音线索' : label + '线索'}"><span>${label}</span><strong>${num(count)}</strong><small>条</small><svg class="ci-coverage-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`).join('');
    $('coverageRate').textContent = c.total ? (c.ready * 100 / c.total).toFixed(1) + '%' : '—';
  }
  function openCohort(filter = 'all', preservePage = false) {
    cohortFilter = filter; if (!preservePage) cohortPage = 1;
    const records = result.records.filter(record => filter === 'all' || (filter === 'recorded' ? record.analysisState !== 'no_recording' : record.analysisState === filter));
    const pages = Math.max(1, Math.ceil(records.length / 10)); cohortPage = Math.min(pages, Math.max(1, cohortPage));
    selected = null; $('addFinding').hidden = true;
    const labels = { all:'人群线索', recorded:'已关联录音线索', ready:'可分析线索', no_recording:'无录音线索', failed:'分析失败线索', no_scene:'无所选场景结果' };
    const states = { ready:'可分析', no_recording:'无录音', failed:'分析失败', no_scene:'无所选场景结果' };
    $('detailTitle').textContent = `${M.templates[scope.template].label} · ${labels[filter]}`;
    $('detailSubtitle').textContent = `共 ${records.length} 条 · 线索下发日期 ${scope.start} 至 ${scope.end} · ${M.ageLabel(scope.minAgeDays)}`;
    $('detailBody').innerHTML = `<section class="ci-section"><p class="ci-report-scope">${esc(scopeText())}</p><div class="ci-report-table"><table><thead><tr><th>线索ID / 门店</th><th>下发时间</th><th>周期内到店情况</th><th>当前业务状态</th><th>语音分析</th></tr></thead><tbody>${records.slice((cohortPage-1)*10,cohortPage*10).map(record=>`<tr><td>${esc(record.leadId)}<small>${esc(record.store)}</small></td><td>${record.issuedAt.slice(0,10)}<small>已满${record.ageDays}天</small></td><td>${scope.minAgeDays ? (M.inGroup({ ...scope, template: `arrived${scope.minAgeDays}` }, record, 'a') ? `${scope.minAgeDays}天内已到店` : `${scope.minAgeDays}天内未到店`) : '未设置观察周期'}${record.firstVisitAt ? `<small>首次到店 ${esc(record.firstVisitAt.slice(0,10))}</small>` : ''}</td><td>${esc(record.status)}</td><td>${states[record.analysisState]}</td></tr>`).join('') || '<tr><td colspan="5">当前无匹配线索</td></tr>'}</tbody></table></div><div class="ci-drill-pagination"><button class="btn ghost" type="button" data-cohort-page="-1" ${cohortPage===1?'disabled':''}>上一页</button><span>${cohortPage}/${pages}</span><button class="btn ghost" type="button" data-cohort-page="1" ${cohortPage===pages?'disabled':''}>下一页</button></div></section>`;
    $('detailFooterNote').textContent = '业务人群与语音分析覆盖分开统计';
    if (!$('detailDialog').open) openDialog('detailDialog');
  }
  function renderFilters() {
    const statusHelp = $('mainFilters').querySelector('.ci-status-help');
    $('mainFilters').innerHTML = `<div class="badge-field-filter badge-field-filter-select ci-select" data-select="dates"><span>线索下发时间</span><button class="session-select-trigger" id="dateTrigger" type="button" aria-label="线索下发时间" aria-haspopup="dialog" aria-expanded="false" aria-controls="dateMenu"><strong>${scope.start} — ${scope.end}</strong><i class="session-select-caret" aria-hidden="true"></i></button><div class="session-menu-panel ci-range-panel" id="dateMenu" role="dialog" aria-label="选择线索下发时间" hidden></div></div>`
      + `<div id="analysisTemplates">${select('leadStatus', '分析人群', scope.template, Object.entries(M.templates).map(([key, state]) => [key, state.label]))}</div>`
;
    if (statusHelp) $('mainFilters').appendChild(statusHelp);
    const root = $('insightScopeFilters');
    if (root?.ownerDocument) {
      if (!factoryFilters) factoryFilters = window.InsightFactoryFilters.mount({
        root, businessRoot: $('insightBusinessFilters'), M, getScope: () => scope,
        onChange: patch => updateScope(patch), onReset: reset,
        onBeforeOpen: () => {
          dateRange = null;
          document.querySelectorAll('.ci-select').forEach(control => {
            control.classList.remove('is-open');
            control.querySelector('.session-select-trigger')?.setAttribute('aria-expanded', 'false');
            const menu = control.querySelector('.session-menu-panel'); if (menu) menu.hidden = true;
          });
        }
      });
      else factoryFilters.sync(scope);
    }
  }

  function renderDateRange(focusDay) {
    if (!dateRange) return;
    const panel = $('dateMenu'); panel.innerHTML = dateRange.render(); panel.hidden = false;
    if (panel.getBoundingClientRect) {
      panel.style.marginLeft = '0px';
      panel.style.maxHeight = '';
      panel.style.top = '';
      const control = panel.closest('.ci-select');
      if (control?.getBoundingClientRect) {
        const bounds = control.getBoundingClientRect();
        const below = window.innerHeight - bounds.bottom - 24, above = bounds.top - 24;
        const opensAbove = below < 280 && above > below;
        panel.style.maxHeight = Math.max(120, Math.min(680, opensAbove ? above : below)) + 'px';
        panel.style.top = opensAbove ? -panel.getBoundingClientRect().height - 8 + 'px' : bounds.height + 8 + 'px';
      }
      const rect = panel.getBoundingClientRect();
      panel.style.marginLeft = Math.min(0, window.innerWidth - 16 - rect.right) + 'px';
    }
    if (focusDay) {
      panel.querySelectorAll('[data-range-day]').forEach(button => button.tabIndex = button.dataset.rangeDay === focusDay ? 0 : -1);
      document.querySelector(`[data-range-day="${focusDay}"]:not(:disabled)`)?.focus({ preventScroll: true });
    }
  }
  function openDateRange() {
    closeMenus();
    dateRange = D.create({ start: scope.start, end: scope.end, min: M.minimumDispatchDate, max: M.cutoff });
    $('dateTrigger').setAttribute('aria-expanded','true');
    document.querySelector('[data-select="dates"]')?.classList.add('is-open');
    renderDateRange();
    document.querySelector('[data-range-preset]:not(:disabled)')?.focus({ preventScroll: true });
  }
  function commitDateRange() {
    if (!dateRange?.state.end) return;
    const { start, end } = dateRange.state;
    closeMenus(); updateScope({ start, end }); $('dateTrigger').focus({ preventScroll: true });
  }

  function render() {
    result = M.query(scope, compare);
    scope = result.scope;
    $('filterError').hidden = !result.errors.length;
    $('filterError').textContent = result.errors.join(' ');
    renderTemplates(); renderCoverage();
    const selectedScope = drillRootLabel();
    const scenes = scope.scenes.length === M.scenes[scope.stage].length ? '全部场景' : scope.scenes.map(key => M.sceneLabels[key]).join('、') || '未选择';
    $('activeScopeSummary').textContent = `${compare ? M.templates[scope.template].label + ' / ' + M.templates[scope.comparisonTemplate].label : M.templates[scope.template].label} · ${selectedScope} · 业务场景：${scenes} · 下发 ${scope.start} 至 ${scope.end}`;
    const emptyNote = $('emptyState').querySelector('p');
    if (emptyNote) emptyNote.textContent = result.records.length && !result.coverage.ready ? '当前人群有线索，但暂无所选场景的可分析结果。可查看人群明细或调整业务场景。' : '请调整线索下发日期、到店情况或范围。';
    document.querySelectorAll('[data-workspace]').forEach(button => {
      const active = button.dataset.workspace === workspace;
      button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    $('analysisPanel').setAttribute('aria-labelledby', workspace === 'customers' ? 'customerTab' : 'actionTab');
    $('comparePanel').hidden = !compare;
    $('toggleCompare').textContent = compare ? '调整对比客群' : '客群对比分析'; $('toggleCompare').disabled = false; $('toggleCompare').title = '';
    $('toggleCompare').setAttribute('aria-expanded', String(compare));
    $('groupSummary').textContent = `A · ${M.templates[scope.template].label} ${num(result.a.length)} 条 ｜ B · ${M.templates[scope.comparisonTemplate].label} ${num(result.b.length)} 条`;
    $('groupSummary').title = `对比统一排除两组重叠线索 ${result.overlapCount} 条；其余条件相同。`;
    $('analysisControls').innerHTML = workspace === 'customers'
      ? (isProfileOverview() ? '' : '<button class="btn ghost" type="button" data-profile-home>返回画像总览</button>' + (drillState || scope.organizationDimension === 'geography' || ['region', 'zone', 'store'].some(key => scope.filters?.[key]?.length) ? '' : `<button class="btn ghost" id="byRegion" type="button" aria-pressed="${byRegion}">${byRegion ? '查看总体' : '按区域查看'}</button>`))
      : '<span class="ci-note">仅展示已有 SOP 项目</span>';
    $('analysisTitle').textContent = workspace === 'customers' ? `${M.templates[scope.template].label} · ${M.topics[scope.stage][dimension].label}${compare ? '对比' : '分布'}` : `${M.templates[scope.template].label} · SOP分析`;
    $('analysisDescription').textContent = workspace === 'customers' ? '先看分布，再点开条目核实样本；不预设问题结论。' : '查看适用范围和动作执行情况。';
    $('analysisContext').textContent = `当前筛选：${drillRootLabel()} · ` + (compare ? `A：${M.templates[scope.template].label}（${num(result.a.length)}条） ｜ B：${M.templates[scope.comparisonTemplate].label}（${num(result.b.length)}条） · 重叠${result.overlapCount}条已从两组排除` : `当前人群${num(result.records.length)}条 · 客户标签分析分母${num(result.coverage.ready)}条可分析线索 · 按线索ID去重`);
    $('analysisContext').hidden = !drillState;
    drillView = drillState ? M.drill(result, drillState, drillState.path) : null;
    activeResult = drillView ? drillView.result : result;
    rows = !result.records.length ? [] : drillView ? drillView.children.map(group => ({ ...group.summary, orgId: group.id, orgName: group.name, orgLevel: group.level, displayName: group.name })) : workspace === 'customers' ? M.distribution(result, dimension, byRegion) : M.actions(result);
    renderDrillNavigation();
    if (drillState) {
      $('analysisTitle').textContent = `${drillState.targetName} · ${drillView.levelLabel}${drillView.level === 'leads' ? '明细' : '分布'}`;
      $('analysisDescription').textContent = drillView.level === 'leads' ? (workspace === 'actions' ? '仅展示当前分析项和组织路径内的线索。' : '仅展示当前分析项和组织路径内的线索，点击查看对应证据。') : '点击下一级组织继续定位，路径与顶部筛选保持一致。';
      $('analysisContext').textContent = `顶部筛选：${drillRootLabel()}${drillState.path.length ? ' · 下钻：' + drillState.path.map(p => p.name).join(' / ') : ''} · 当前组织范围 ${num(activeResult.records.length)} 条线索${compare ? ` · A ${num(activeResult.a.length)} / B ${num(activeResult.b.length)}` : ''} · ${workspace === 'customers' ? '提及' : '适用'} ${num(drillView.summary?.count || 0)} 条`;
    }
    if (isProfileOverview()) {
      $('analysisTitle').textContent = `${M.templates[scope.template].label} · 客户画像总览`;
      $('analysisDescription').textContent = '从购车计划、需求反馈到客户背景，同时查看全部维度；点击图中标签继续下钻。';
    }
    renderProfileOverview();
    const heads = workspace === 'customers'
      ? [drillView ? drillView.levelLabel : '客户标签', ...(!drillView && byRegion ? ['区域'] : []), '提及线索', ...(compare ? ['A 组占比', 'B 组占比', '差异（A−B）'] : ['提及占比']), '操作']
      : [drillView ? drillView.levelLabel : 'SOP', '适用线索', ...(compare ? ['A / B 完成率'] : ['动作完成率']), 'SOP 合格率', ...(compare ? ['A 组结果率¹'] : []), '操作'];
    $('analysisHead').innerHTML = `<tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr>`;
    const pagedActions = workspace === 'actions' && !compare && !drillState;
    const tableItems = pagedActions ? sortedActions().slice((actionPage - 1) * actionPageSize, actionPage * actionPageSize) : rows.map((row, index) => ({ row, index }));
    $('analysisRows').innerHTML = tableItems.map(({row, index}) => {
      const details = `<button class="ci-text" type="button" data-start-drill="${index}" aria-label="下钻分析${esc(row.displayName || row.name)}">${workspace === 'actions' ? '下钻' : '下钻分析'}</button>`;
      if (workspace === 'customers') return `<tr><td><strong>${esc(row.displayName || row.name)}</strong><small>${esc(drillView ? drillState.targetName : row.sub)}</small></td>${!drillView && byRegion ? `<td>${esc(row.region)}</td>` : ''}<td>${num(row.count)}<small>分母 ${num(row.denominator)} 条</small></td>${compare ? `<td>${pct(row.aRate)}<small>${row.aCount}/${row.aTotal}</small></td><td>${pct(row.bRate)}<small>${row.bCount}/${row.bTotal}</small></td><td class="ci-blue">${row.delta === null ? '—' : `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)} pp`}</td>` : `<td><span class="ci-bar-value"><strong>${pct(row.share)}</strong><span class="ci-bar" aria-hidden="true"><i style="width:${row.share || 0}%"></i></span></span></td>`}<td>${details}</td></tr>`;
      return `<tr><td><strong>${esc(row.displayName || row.name)}</strong></td><td>${num(row.count)}<small>完成 ${num(row.done)} / 未完成 ${num(row.missed)}</small></td><td>${compare ? `${pct(row.aRate)} / ${pct(row.bRate)}` : pct(row.completion)}</td><td>${pct(row.qualified)}</td>${compare ? `<td>${pct(row.resultDone)} / ${pct(row.resultMissed)}<small>完成 / 未完成动作</small></td>` : ''}<td>${details}</td></tr>`;
    }).join('');
    if (drillView?.level === 'leads') renderLeads();
    renderComparisonChart();
    if (pagedActions && rows.length) {
      const pages = Math.ceil(rows.length / actionPageSize);
      actionPage = Math.min(actionPage, pages);
      $('drillPagination').hidden = false;
      $('drillPagination').innerHTML = `<span>共 ${num(rows.length)} 条 · 每页 ${actionPageSize} 条</span><div class="ci-tools"><button class="btn ghost" type="button" data-action-page="-1" ${actionPage === 1 ? 'disabled' : ''}>上一页</button><span>${actionPage} / ${pages}</span><button class="btn ghost" type="button" data-action-page="1" ${actionPage === pages ? 'disabled' : ''}>下一页</button></div>`;
    }
    renderOrganizationDrill();
    renderActionOrganizationDrill();
    $('emptyState').hidden = drillState?.organizationMode && !compare ? true : drillView?.level === 'leads' ? drillView.leads.length > 0 : rows.length > 0 && result.records.length > 0;
    $('analysisRows').hidden = result.records.length === 0;
    if (isProfileOverview()) {
      $('analysisTableWrap').hidden = true;
      $('compareVisual').hidden = true;
    }
    $('draftCount').textContent = draft.items.length;
  }
  function renderProfileOverview() {
    const directory = $('profileDirectory'), board = $('profileOverview');
    directory.hidden = !isProfileOverview();
    board.hidden = !isProfileOverview();
    document.querySelector('.ci-analysis-toolbar').hidden = isProfileOverview();
    if (workspace !== 'customers') return;
    if (!isProfileOverview()) return;
    $('reportButtonParking').appendChild($('generateReport'));
    directory.innerHTML = renderProfileSummary();
    const overviewScope = document.createElement('p');
    overviewScope.className = 'ci-overview-scope';
    overviewScope.textContent = $('analysisTitle').textContent;
    directory.querySelector('.ci-summary-heading h3')?.after(overviewScope);
    directory.querySelector('.ci-summary-heading')?.appendChild($('generateReport'));
    const legend = compare ? `<span><i class="ci-series-a"></i>A · ${esc(M.templates[scope.template].label)} · ${num(result.a.filter(r => r.analysisReady).length)} 条可分析</span><span><i class="ci-series-b"></i>B · ${esc(M.templates[scope.comparisonTemplate].label)} · ${num(result.b.filter(r => r.analysisReady).length)} 条可分析</span>` : `<span><i class="ci-series-a"></i>提及占比 · 分母 ${num(result.coverage.ready)} 条可分析线索</span>`;
    board.classList.toggle('ci-profile-list-view', profileView === 'list');
    board.classList.toggle('ci-profile-has-expanded', expandedProfiles.size > 0);
    board.innerHTML = `<div class="ci-profile-view-toolbar"><div class="ci-profile-toolbar-heading"><h3>画像明细</h3><div class="ci-profile-legend">${compare ? legend : ''}</div></div><div class="seg-tabs" aria-label="画像展示方式"><button type="button" class="seg-tab ${profileView === 'chart' ? 'active' : ''}" data-profile-view="chart" aria-pressed="${profileView === 'chart'}">图表</button><button type="button" class="seg-tab ${profileView === 'list' ? 'active' : ''}" data-profile-view="list" aria-pressed="${profileView === 'list'}">列表</button></div></div>` + `<div class="ci-profile-grid">${profileGroups.flatMap(group => group.keys).filter(key => M.topics[scope.stage][key]).map(key => profileCard(key)).join('')}</div>`;
  }
  function renderProfileSummary() {
    const keys = profileGroups.flatMap(group => group.keys.filter(key => M.topics[scope.stage][key]));
      const dimensionIcon = label => {
        const paths = /车型|车系/.test(label) ? '<path d="M5 17h14l-1-5-2-4H8l-2 4-1 5Zm0 0v2m14-2v2M7 14h.01M17 14h.01"/>' : /预算|付款|价格/.test(label) ? '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18m-13 5h3"/>' : /时间|阶段|计划/.test(label) ? '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' : /试驾/.test(label) ? '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M4 10h16M10 13l-2 6m6-6 2 6"/>' : /人|职业|性别|年龄/.test(label) ? '<circle cx="12" cy="8" r="3"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>' : /抗性|顾虑/.test(label) ? '<path d="M12 3 3 19h18L12 3Zm0 6v4m0 3h.01"/>' : /需求|场景/.test(label) ? '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 .7-1.5 1.4-1.5 2h-5c0-.6-.5-1.3-1.5-2Z"/>' : '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8M12 8v8"/>';
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
      };
    if (compare) {
      const ranked = keys.map(key => ({ key, row: M.distribution(result, key).filter(row => Number.isFinite(row.delta)).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.count - a.count)[0] }))
        .filter(item => item.row)
        .sort((a, b) => Math.abs(b.row.delta) - Math.abs(a.row.delta));
      const shown = summaryExpanded ? ranked : ranked.slice(0, 5);
      const groupA = M.templates[scope.template].label, groupB = M.templates[scope.comparisonTemplate].label;
      const cardMarkup = ({ key, row }) => {
        const label = esc(M.topics[scope.stage][key].label);
        const direction = row.delta === 0 ? '两组持平' : `${esc(row.delta > 0 ? groupA : groupB)}更高`;
        const difference = `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)}%`;
        return `<button type="button" class="ci-diff-card" data-profile-dimension="${key}" title="A：${num(row.aCount)}/${num(row.aTotal)}；B：${num(row.bCount)}/${num(row.bTotal)}" aria-label="${label}，${esc(row.name)}，${esc(groupA)} ${pct(row.aRate)}，${num(row.aCount)}/${num(row.aTotal)}，${esc(groupB)} ${pct(row.bRate)}，${num(row.bCount)}/${num(row.bTotal)}，${direction}，${difference}，查看对应画像"><span class="ci-diff-card-head"><span class="ci-diff-dimension-label"><i class="ci-diff-icon">${dimensionIcon(M.topics[scope.stage][key].label)}</i>${label}</span></span><strong class="ci-diff-card-tag">${esc(row.name)}</strong><span class="ci-diff-direction">${direction}</span><span class="ci-diff-card-footer"><span>差值</span><strong>${difference}</strong><span>查看画像 ›</span></span></button>`;
      };
      return `<div class="ci-summary-heading"><div><h3>客户画像差异总览</h3></div><div class="ci-difference-legend"><span><i class="ci-diff-legend-a"></i>A · ${esc(groupA)}</span><span><i class="ci-diff-legend-b"></i>B · ${esc(groupB)}</span></div></div><div class="ci-difference-list ci-diff-cards">${shown.length ? shown.map(cardMarkup).join('') : '<p class="ci-difference-note">暂无可比较数据</p>'}</div>${ranked.length > 5 ? `<button class="ci-diff-expand" type="button" data-summary-expand aria-expanded="${summaryExpanded}">${summaryExpanded ? '收起' : `查看更多（${ranked.length}项）`} <span aria-hidden="true">${summaryExpanded ? '↑' : '↓'}</span></button>` : ''}<p class="ci-difference-note">差值＝当前组占比 − 对比组占比，单位为百分点；悬停卡片查看线索数。</p>`;
    }
    const meaningful = name => name && !/^(未知|未提及|未识别|无法识别|无法判断|不详|暂无|无数据)$/.test(name.trim());
    const ranked = keys.map(key => ({ key, row: M.distribution(result, key).filter(row => meaningful(row.name)).sort((a, b) => (b.count ?? -1) - (a.count ?? -1))[0] })).sort((a, b) => (b.row?.count ?? -1) - (a.row?.count ?? -1));
    const shown = summaryExpanded ? ranked : ranked.slice(0, 5);
    return `<div class="ci-summary-heading"><div><h3>客户画像概览</h3></div></div><div class="ci-highlight-grid">${shown.map(({ key, row }) => {
      const identified = result.records.filter(record => record.analysisReady && (record.annotations[key] || []).some(a => meaningful(a.name))).length;
      const total = result.records.length;
      const label = esc(M.topics[scope.stage][key].label);
      return `<button type="button" class="ci-highlight-card" data-profile-dimension="${key}" aria-label="${label}，${row ? `${esc(row.name)}，${pct(row.share)}，${num(row.count)} / ${num(identified)}` : '暂无数据'}，识别覆盖 ${num(identified)} / ${num(total)}，查看画像明细"><span class="ci-highlight-head"><span class="ci-highlight-title"><i class="ci-diff-icon">${dimensionIcon(M.topics[scope.stage][key].label)}</i>${label}</span></span><strong class="ci-highlight-name">${row ? esc(row.name) : '暂无数据'}</strong><span class="ci-highlight-metric"><b>${row ? pct(row.share) : '—'}</b>${row ? `<small>${num(row.count)} / ${num(identified)}</small>` : ''}</span></button>`;
    }).join('')}</div>${ranked.length > 5 ? `<button class="ci-diff-expand" type="button" data-summary-expand aria-expanded="${summaryExpanded}">${summaryExpanded ? '收起' : `查看更多（${ranked.length}项）`} <span aria-hidden="true">${summaryExpanded ? '↑' : '↓'}</span></button>` : ''}`;
  }
  function butterfly(label, aRate, bRate, aCount, aTotal, bCount, bTotal, upper = 100) {
    const bar = (value, series) => `<span class="ci-butterfly-track ci-butterfly-${series}" aria-hidden="true"><i class="ci-series-${series}" style="width:${Number.isFinite(value) ? Math.max(0, Math.min(100, value / upper * 100)) : 0}%"></i></span>`;
    return `<span class="ci-butterfly"><span class="ci-butterfly-value ci-value-a"><strong>${pct(aRate)}</strong><small>${num(aCount)}/${num(aTotal)}</small></span>${bar(aRate, 'a')}<span class="ci-butterfly-label">${esc(label)}</span>${bar(bRate, 'b')}<span class="ci-butterfly-value ci-value-b"><strong>${pct(bRate)}</strong><small>${num(bCount)}/${num(bTotal)}</small></span></span>`;
  }
  function profilePieCard(key, items) {
    const expanded = expandedProfiles.has(key);
    const colors = ['#426fd1','#6d91df','#8bbce0','#60a9a1','#94c7b1','#e2b969','#d99278','#a18cc8','#c294b4','#95a5ba','#7390ab','#c9aa84','#9bb6a8'];
    const pie = (field, group) => {
      const total = items.reduce((sum, row) => sum + (row[field] || 0), 0);
      let position = 0;
      const stops = (expanded ? items : items.slice(0, 5)).map((row, index) => { const start = position; position += total ? (row[field] || 0) / total * 100 : 0; return `${colors[index % colors.length]} ${start}% ${position}%`; });
      if (!expanded && items.length > 5 && position < 100) stops.push(`#dce3ed ${position}% 100%`);
      return `<div class="ci-pie-group"><span class="ci-pie-chart${total ? '' : ' is-empty'}" role="img" aria-label="${esc(group)}：${total ? '按标签提及次数构成' : '暂无数据'}" style="${total ? `background:conic-gradient(${stops.join(',')})` : ''}"></span>${compare ? `<strong>${group}</strong>` : ''}</div>`;
    };
    const ranked = items.map((row, index) => ({ row, index }));
    if (compare) ranked.sort((a, b) => (Number.isFinite(b.row.aRate) ? b.row.aRate : -1) - (Number.isFinite(a.row.aRate) ? a.row.aRate : -1) || a.index - b.index);
    return `<article class="ci-profile-card ci-pie-card${M.topics[scope.stage][key].sentiment ? ' ci-product-card ci-product-' + M.topics[scope.stage][key].sentiment : ''}" id="profile-card-${key}" tabindex="-1" aria-label="${esc(M.topics[scope.stage][key].label)}分布"><header><h4>${esc(M.topics[scope.stage][key].label)}</h4><button type="button" class="ci-text ci-profile-download" data-profile-download="${key}" aria-label="下载${esc(M.topics[scope.stage][key].label)}图片">下载图片</button>${!compare ? `<button type="button" class="ci-text ci-org-entry" data-org-entry="${key}">按组织分析 →</button>` : ''}${compare && items.length > 5 ? `<button type="button" class="ci-text" data-profile-expand="${key}" aria-expanded="${expanded}">${expanded ? '收起 ↑' : '查看更多 ↓'}</button>` : ''}</header><div class="ci-pie-layout"><div class="ci-pie-visual">${compare ? pie('aCount', 'A组') + pie('bCount', 'B组') : pie('count', '当前人群')}</div><div class="ci-pie-list">${(expandedProfiles.has(key) ? ranked : ranked.slice(0, 5)).map(({row, index}) => `<button type="button" class="ci-pie-item" data-profile-drill="${key}" data-profile-index="${index}"><i style="background:${colors[index % colors.length]}"></i><span>${esc(row.name)}</span><strong>${compare ? `A ${pct(row.aRate)}（${num(row.aCount)}/${num(row.aTotal)}）<br>B ${pct(row.bRate)}（${num(row.bCount)}/${num(row.bTotal)}）` : `${pct(row.share)}（${num(row.count)}/${num(row.denominator)}）`}</strong>${compare ? `<small>差异 ${Number.isFinite(row.delta) ? `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)} pp` : '—'}</small>` : ''}</button>`).join('') || '<p class="ci-note">暂无可分析数据</p>'}${items.length > 5 && !compare ? `<button type="button" class="ci-pie-other" data-profile-expand="${key}" aria-expanded="${expanded}">${expanded ? '<span class="ci-pie-other-action">收起 ↑</span>' : '<i></i><span>其他</span><span class="ci-pie-other-action">查看更多 ↓</span>'}</button>` : ''}</div></div></article>`;
  }
  function profileCard(key) {
    const items = M.distribution(result, key);
    if (!compare || profileView === 'list') return profilePieCard(key, items);
    const ranked = items.map((row, index) => ({ row, index })).sort((a, b) => (Number.isFinite(b.row.aRate) ? b.row.aRate : -1) - (Number.isFinite(a.row.aRate) ? a.row.aRate : -1) || a.index - b.index);
    return `<article class="ci-profile-card ci-profile-comparison" id="profile-card-${key}" tabindex="-1" aria-label="${esc(M.topics[scope.stage][key].label)}对比"><header><h4>${esc(M.topics[scope.stage][key].label)}</h4><button type="button" class="ci-text ci-profile-download" data-profile-download="${key}" aria-label="下载${esc(M.topics[scope.stage][key].label)}图片">下载图片</button>${items.length > 5 ? `<button type="button" class="ci-text" data-profile-expand="${key}" aria-expanded="${expandedProfiles.has(key)}">${expandedProfiles.has(key) ? '收起 ↑' : '查看更多 ↓'}</button>` : ''}</header><div class="ci-profile-bars">${(expandedProfiles.has(key) ? ranked : ranked.slice(0, 5)).map(({row, index}) => `<button type="button" class="ci-profile-bar-row" data-profile-drill="${key}" data-profile-index="${index}" title="A：${num(row.aCount)}/${num(row.aTotal)}；B：${num(row.bCount)}/${num(row.bTotal)}" aria-label="下钻分析${esc(row.name)}，A ${pct(row.aRate)}，${num(row.aCount)}/${num(row.aTotal)}，B ${pct(row.bRate)}，${num(row.bCount)}/${num(row.bTotal)}"><span class="ci-profile-difference-heading"><strong>${esc(row.name)}</strong><span>差值 <b>${Number.isFinite(row.delta) ? `${row.delta > 0 ? '+' : ''}${row.delta.toFixed(1)}%` : '—'}</b></span></span>${butterfly(row.name, row.aRate, row.bRate, row.aCount, row.aTotal, row.bCount, row.bTotal)}</button>`).join('') || '<p class="ci-note">暂无可分析数据</p>'}</div></article>`;
  }
  function expandedProfileMarkup(key) {
    const wasExpanded = expandedProfiles.has(key);
    try {
      expandedProfiles.add(key);
      return profileCard(key);
    } finally {
      if (!wasExpanded) expandedProfiles.delete(key);
    }
  }
  function prepareProfileImageContent(card) {
    card.removeAttribute('id');
    card.querySelectorAll('header, footer, [data-profile-expand]').forEach(element => element.remove());
    Object.assign(card.style, { width: '100%', boxSizing: 'border-box', height: 'auto', minHeight: '0', maxHeight: 'none', margin: '0', padding: '0', border: '0', borderRadius: '0', boxShadow: 'none', background: '#fff', overflow: 'visible', outline: 'none' });
    const plot = card.querySelector('.ci-pie-layout, .ci-profile-bars');
    if (plot) Object.assign(plot.style, { flex: 'none', minHeight: '0', maxHeight: 'none', height: 'auto', margin: '0', padding: '0', overflow: 'visible' });
    return card;
  }
  const downloadingProfiles = new Set();
  async function downloadProfileImage(key) {
    const label = M.topics[scope.stage][key]?.label;
    const source = $('profile-card-' + key);
    if (!label || !source || downloadingProfiles.has(key)) return;
    const fileName = `${label}-${scope.start}-${scope.end}.png`;
    const board = source.closest('.ci-profile-overview');
    const mount = document.createElement('div');
    // Inherit the same view classes, viewport and card width, without touching the live card.
    mount.className = board.className;
    mount.setAttribute('aria-hidden', 'true');
    mount.setAttribute('inert', '');
    Object.assign(mount.style, { position: 'fixed', left: '-100000px', top: '0', width: (source.getBoundingClientRect().width - ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((sum, property) => sum + (parseFloat(window.getComputedStyle(source)[property]) || 0), 0)) + 'px', margin: '0', padding: '0', pointerEvents: 'none' });
    mount.innerHTML = expandedProfileMarkup(key);
    const card = prepareProfileImageContent(mount.firstElementChild);
    const button = source.querySelector('[data-profile-download]');
    downloadingProfiles.add(key);
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      document.body.appendChild(mount);
      const blob = await window.InsightCardImage.toBlob(card, { pixelRatio: 2 });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      try {
        link.href = url; link.download = fileName;
        document.body.appendChild(link); link.click();
      } finally {
        link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      notify('图片导出失败，请重试。' + (error.message || ''), 'error');
    } finally {
      mount.remove(); downloadingProfiles.delete(key);
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
    }
  }
  function openProfileDetail(key) {
    if (!M.topics[scope.stage][key]) return;
    dimension = key; customerView = 'detail'; byRegion = false; drillState = null; drillScroll.clear(); leadPage = 1; compareView = 'chart'; render();
    $('analysisTitle').tabIndex = -1; $('analysisTitle').focus({ preventScroll: true });
    $('analysisTitle').scrollIntoView?.({ block: 'start' });
  }
  function showProfileOverview() {
    customerView = 'overview'; drillState = null; drillScroll.clear(); byRegion = false; render();
    const card = $('profile-card-' + dimension); card?.focus({ preventScroll: true }); card?.scrollIntoView?.({ block: 'center' });
  }
  function renderDrillNavigation() {
    $('drillNavigation').hidden = !drillState;
    $('drillPagination').hidden = true;
    if (!drillState) { $('drillNavigation').innerHTML = ''; return; }
    const baseLabel = workspace === 'customers' ? '客户画像' : 'SOP分析';
    const crumbs = [`<button class="ci-text" data-drill-back="-1" type="button">${baseLabel}</button>`, `<button class="ci-text" data-drill-back="0" type="button">${esc(drillState.organizationMode ? M.topics[scope.stage][dimension].label : drillState.targetName)}</button>`, ...drillState.path.map((item,index) => `<button class="ci-text" data-drill-back="${index+1}" type="button" ${index === drillState.path.length-1 ? 'aria-current="location"' : ''}>${esc(item.name)}</button>`)];
    $('drillNavigation').innerHTML = `<div class="ci-breadcrumbs">${crumbs.join('<span aria-hidden="true">/</span>')}</div><div class="ci-tools"><button class="ci-text" data-drill-back="${drillState.path.length ? drillState.path.length-1 : -1}" type="button">← 返回上级</button>${workspace === 'actions' || drillState.organizationMode === 'all' ? '' : `<button class="btn ghost" id="scopeEvidence" type="button" ${drillView?.summary?.records.length ? '' : 'disabled'}>查看当前证据</button>`}</div>`;
  }
  function positionKey() { return drillState ? JSON.stringify([drillState.kind, drillState.dimension, drillState.targetId, drillState.path.map(p=>p.id)]) : 'root:' + workspace; }
  function rememberPosition() { const main = document.querySelector('.main'); drillScroll.set(positionKey(), { scrollTop: main?.scrollTop || 0, leadPage }); }
  function restorePosition() {
    const saved = drillScroll.get(positionKey()), main = document.querySelector('.main');
    leadPage = saved?.leadPage || 1; render();
    $('analysisTitle').tabIndex = -1; $('analysisTitle').focus({ preventScroll: true });
    if (main && saved) main.scrollTop = saved.scrollTop;
    else $('analysisTitle').scrollIntoView?.({ block: 'start' });
  }
  function startDrill(index) {
    const row = rows[index]; if (!row) return;
    rememberPosition();
    if (drillState) {
      drillState.path.push({ level: row.orgLevel, id: row.orgId, name: row.orgName });
    } else {
      if (workspace === 'customers') customerView = 'detail';
      expandedOrgTree.clear();
      drillState = { kind: workspace, dimension, targetId: row.id, targetName: row.name, path: [], organizationMode: workspace === 'customers' && !compare ? 'tag' : null };
      const chosenRegion = scope.organizationDimension === 'geography' || scope.filters?.region?.length || scope.filters?.zone?.length || scope.filters?.store?.length ? '' : row.region;
      const record = result.records.find(r => r.region === chosenRegion);
      if (record && scope.organizationDimension !== 'geography') drillState.path.push({ level:'region', id:record.regionId, name:record.region });
    }
    leadPage = 1; restorePosition();
  }
  function drillBack(depth) {
    if (!drillState) return; rememberPosition();
    if (depth < 0) drillState = null; else drillState.path = drillState.path.slice(0, depth);
    restorePosition();
  }
  function renderLeads() {
    const total = drillView.leads.length, pages = Math.max(1, Math.ceil(total/10));
    leadPage = Math.min(pages, Math.max(1, leadPage));
    $('analysisHead').innerHTML = `<tr><th>线索 ID</th><th>车型 / 场景</th><th>当前状态</th><th>下发日期 / 时长</th>${workspace === 'customers' ? '<th>操作</th>' : ''}</tr>`;
    $('analysisRows').innerHTML = drillView.leads.slice((leadPage-1)*10,leadPage*10).map(record => `<tr><td><strong>${esc(record.leadId)}</strong><small>${esc(record.advisor)}</small></td><td>${esc(record.model)}<small>${esc(M.sceneLabels[record.scene])}</small></td><td>${esc(record.status)}${compare ? `<small>${M.inGroup(scope, record, 'a')?'A':'B'} 组</small>` : ''}</td><td>${record.issuedAt.slice(0,10)}<small>已满${record.ageDays}天</small></td>${workspace === 'customers' ? `<td><button class="ci-text" data-lead-evidence="${esc(record.id)}" type="button">查看证据</button></td>` : ''}</tr>`).join('');
    $('drillPagination').hidden = total === 0;
    $('drillPagination').innerHTML = `<span>共 ${num(total)} 条 · 每页 10 条</span><div class="ci-tools"><button class="btn ghost" type="button" data-lead-page="-1" ${leadPage===1?'disabled':''}>上一页</button><span>${leadPage}/${pages}</span><button class="btn ghost" type="button" data-lead-page="1" ${leadPage===pages?'disabled':''}>下一页</button></div>`;
  }
  function renderActionChart() {
    $('chartLegend').innerHTML = '';
    const sorted = sortedActions().slice((actionPage - 1) * actionPageSize, actionPage * actionPageSize);
    $('comparisonChart').innerHTML = `<div class="ci-action-chart ci-action-simple ci-action-reference" role="group" aria-label="SOP执行率条形图"><div class="ci-action-reference-head"><span>SOP项目</span><span>执行率</span><span>已执行 / 适用</span><span>操作</span></div>${sorted.map(({row,index}) => {
      const name = row.displayName || row.name;
      const available = row.count > 0;
      return `<button class="ci-action-row" type="button" data-start-drill="${index}" aria-label="${esc(name)}，执行率${pct(row.completion)}，${num(row.done)} / ${num(row.count)}，按组织下钻"><span class="ci-action-name">${esc(name)}</span><span class="ci-action-reference-rate"><strong>${pct(row.completion)}</strong><span class="ci-action-track${available ? '' : ' is-empty'}" aria-hidden="true"><i class="ci-action-done" style="width:${row.completion || 0}%"></i></span></span><span class="ci-action-reference-count">${available ? `${num(row.done)} / ${num(row.count)}` : '暂无数据'}</span><span class="ci-action-reference-link">下钻 <b aria-hidden="true">›</b></span></button>`;
    }).join('')}</div>`;
  }
  function renderComparisonChart() {
    const visible = rows.length > 0 && drillView?.level !== 'leads';
    $('analysisTableWrap').classList.toggle('ci-action-reference-table', workspace === 'actions' && !compare && !drillState);
    $('compareVisual').classList.toggle('ci-action-reference-visual', workspace === 'actions' && !compare && !drillState);
    $('drillPagination').classList.toggle('ci-action-reference-pagination', workspace === 'actions' && !compare && !drillState);
    $('compareVisual').hidden = !visible;
    $('comparisonChart').hidden = false;
    $('analysisTableWrap').hidden = visible;
    $('actionSortControls').innerHTML = workspace === 'actions' && !compare && !drillState
      ? `<span class="ci-note">执行率排序</span><button class="btn ${actionSort === 'desc' ? 'primary' : 'ghost'}" type="button" data-action-sort="desc" aria-pressed="${actionSort === 'desc'}">从高到低</button><button class="btn ${actionSort === 'asc' ? 'primary' : 'ghost'}" type="button" data-action-sort="asc" aria-pressed="${actionSort === 'asc'}">从低到高</button>` : '';
    if (!visible) { $('comparisonChart').innerHTML = ''; return; }
    if (!compare && workspace === 'actions') { renderActionChart(); return; }
    if (!compare) {
      $('chartLegend').innerHTML = `<span><i class="ci-series-a" aria-hidden="true"></i>${esc(M.templates[scope.template].label)} · 提及占比</span><small>分母为各组织范围内可分析线索 · 点击条形图下钻</small>`;
      $('comparisonChart').innerHTML = `<div class="ci-chart-axis-row"><span>${drillView ? drillView.levelLabel : '客户标签'}</span><span class="ci-profile-detail-axis"><span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></span><span>提及 / 可分析</span></div><div role="group" aria-label="提及占比条形图">${rows.map((row,index) => `<button type="button" class="ci-compare-row ci-profile-detail-row" data-start-drill="${index}" aria-label="下钻分析${esc(row.displayName || row.name)}：${pct(row.share)}，${row.count}/${row.denominator}条"><span class="ci-chart-name"><strong>${esc(row.displayName || row.name)}</strong><small>${esc(row.region || row.sub || drillState?.targetName || '')}</small></span><span class="ci-profile-detail-plot"><span class="ci-profile-track" aria-hidden="true"><i class="ci-series-a" style="width:${row.share || 0}%"></i></span><strong>${pct(row.share)}</strong></span><span class="ci-chart-difference"><strong>${num(row.count)}/${num(row.denominator)}</strong><em>下钻分析 →</em></span></button>`).join('')}</div><p class="ci-chart-caption">统一使用0–100%刻度；提及线索按线索ID去重。同一线索可提及多个标签。</p>`;
      return;
    }
    $('chartLegend').innerHTML = `<span><i class="ci-series-a" aria-hidden="true"></i>A · ${esc(M.templates[scope.template].label)} · ${num(activeResult.a.filter(r=>r.analysisReady).length)}条可分析</span><span><i class="ci-series-b" aria-hidden="true"></i>B · ${esc(M.templates[scope.comparisonTemplate].label)} · ${num(activeResult.b.filter(r=>r.analysisReady).length)}条可分析</span><small>${workspace==='customers'?'提及占比':'动作完成率'} · 每项保留自身分母</small>`;
    const chart = M.comparisonChart(rows);
    $('comparisonChart').innerHTML = `<div role="group" aria-label="A、B 组蝴蝶对比图">${chart.rows.map(item => {
      const row = item.row, label = row.displayName || row.name;
      const delta = item.delta === null ? '—' : `${item.delta > 0 ? '+' : ''}${item.delta.toFixed(1)} pp`;
      return `<button class="ci-butterfly-row" type="button" data-start-drill="${item.index}" aria-label="下钻分析${esc(label)}：A ${pct(row.aRate)}，B ${pct(row.bRate)}，差异 ${delta}">${butterfly(label, row.aRate, row.bRate, row.aCount, row.aTotal, row.bCount, row.bTotal, chart.upper)}<span class="ci-butterfly-delta">差异 ${delta} · 下钻分析 →</span></button>`;
    }).join('')}</div><p class="ci-chart-caption">两侧均从中间的 0 向外延伸，共用 0–${chart.upper}% 刻度；按绝对差异排序，差异仅表示关联。</p>`;
  }
  function renderOrganizationDrill() {
    let host = $('organizationDrill');
    if (!host) { host = document.createElement('section'); host.id = 'organizationDrill'; $('compareVisual').before(host); }
    const enabled = !!(drillState?.organizationMode && !compare && workspace === 'customers');
    host.hidden = !enabled;
    if (!enabled) return;
    $('compareVisual').hidden = true; $('analysisTableWrap').hidden = true;
    const all = drillState.organizationMode === 'all', label = M.topics[scope.stage][dimension].label;
    $('analysisTitle').textContent = all ? `${label} · 按组织分析` : `${label}：${drillState.targetName} · 组织分布`;
    $('analysisDescription').textContent = drillView.level === 'leads' ? '已到组织末级，可查看当前范围内的线索。' : `查看下一级${drillView.levelLabel}，点击组织继续下钻。`;
    $('analysisContext').textContent = `当前范围：${drillRootLabel()}${drillState.path.length ? ' / ' + drillState.path.map(p => p.name).join(' / ') : ''} · ${num(activeResult.records.length)} 条线索`;
    const fields = scope.organizationDimension === 'geography' ? M.geographyFields : M.organizationFields;
    const field = fields.find(f => f.level === drillView.level);
    const groups = drillView.children.map((child, index) => {
      const sub = M.subset(activeResult, activeResult.records.filter(r => r[field.id] === child.id));
      const values = M.distribution(sub, dimension).filter(r => !/^(未知|未提及|未识别|无法识别|无法判断|不详|暂无|无数据)$/.test(r.name));
      const tag = values.find(r => r.name === drillState.targetName);
      const denominator = values[0]?.denominator || 0;
      return { child, index, sub, values, tag, denominator };
    });
    const scopedValues = M.distribution(activeResult, dimension);
    const totalTag = scopedValues.find(r => r.name === drillState.targetName)?.count || 0;
    const tabs = all ? `<div class="seg-tabs"><button type="button" data-org-view="cards" class="seg-tab ${orgView==='cards'?'active':''}">卡片</button><button type="button" data-org-view="list" class="seg-tab ${orgView==='list'?'active':''}">列表</button></div>` : `<div class="seg-tabs"><button type="button" data-org-metric="local" class="seg-tab ${orgMetric==='local'?'active':''}">组织内画像占比</button><button type="button" data-org-metric="source" class="seg-tab ${orgMetric==='source'?'active':''}">上级线索来源占比</button></div>`;
    let body = '';
    if (drillView.level === 'leads') {
      const records = all ? activeResult.records : (drillView.summary?.records || []);
      body = `<div class="ci-org-end"><strong>已到组织末级</strong><p>当前${all?'组织':'画像值'}共 ${num(records.length)} 条线索</p>${records.map(r=>`<div>${esc(r.leadId)} ${all?'':`<button class="ci-text" data-lead-evidence="${esc(r.id)}">查看证据</button>`}</div>`).join('')}</div>`;
    } else if (all && orgView === 'cards') {
      body = `<div class="ci-org-grid">${groups.map(g=>`<article class="ci-org-card"><header><div><strong>${esc(g.child.name)}</strong><small>提及${esc(label)} ${num(g.denominator)} / ${num(g.sub.records.length)} 条</small></div><button class="ci-text" data-org-next="${g.index}">查看下一级 →</button></header><div>${(expandedOrgs.has(String(g.index)) ? g.values : g.values.slice(0,5)).map(v=>`<button class="ci-org-value" data-org-next="${g.index}" data-tag-name="${esc(v.name)}"><span>${esc(v.name)}</span><strong>${pct(v.share)}</strong><small>${num(v.count)}/${num(v.denominator)}</small><span>›</span></button>`).join('') || '<p class="ci-note">暂无画像数据</p>'}</div>${g.values.length>5?`<button class="ci-text ci-org-expand" data-org-expand="${g.index}">${expandedOrgs.has(String(g.index))?'收起':'展开全部'} ${g.values.length} 项</button>`:''}</article>`).join('')}</div>`;
    } else {
      // Each expanded row keeps its own path; siblings remain visible.
      orgTreePaths = [];
      const names = scopedValues.filter(v => !/^(未知|未提及|未识别|无法识别|无法判断|不详|暂无|无数据)$/.test(v.name)).map(v => v.name);
      const renderLevel = (path, depth) => {
        const parent = M.drill(result, drillState, path);
        const parentValues = M.distribution(parent.result, dimension);
        const parentTagCount = parentValues.find(v => v.name === drillState.targetName)?.count || 0;
        const levelField = fields.find(f => f.level === parent.level);
        if (!levelField) return '';
        const siblings = parent.children.map(child => {
          const nextPath = [...path, {level:child.level, id:child.id, name:child.name}];
          const subset = M.subset(parent.result, parent.result.records.filter(r => r[levelField.id] === child.id));
          const values = M.distribution(subset, dimension).filter(v => !/^(未知|未提及|未识别|无法识别|无法判断|不详|暂无|无数据)$/.test(v.name));
          const tag = values.find(v => v.name === drillState.targetName);
          const denominator = values[0]?.denominator || 0;
          const count = tag?.count || 0, den = orgMetric === 'local' ? denominator : parentTagCount;
          return {child,nextPath,values,denominator,count,den,value:den ? count / den * 100 : null};
        });
        if (!all) siblings.sort((a,b) => (b.value ?? -1) - (a.value ?? -1));
        return siblings.map(item => {
          const pathKey = JSON.stringify(item.nextPath), index = orgTreePaths.push(item.nextPath) - 1;
          const next = M.drill(result, drillState, item.nextPath);
          const expandable = next.level !== 'leads' && next.children.length > 0;
          const expanded = expandedOrgTree.has(pathKey);
          const toggle = expandable ? `<button type="button" class="ci-tree-toggle" data-tree-toggle="${index}" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}${esc(item.child.name)}">${expanded?'▾':'▸'}</button>` : '<span class="ci-tree-spacer"></span>';
          const name = `<span class="ci-tree-name" style="padding-left:${depth*22}px">${toggle}<span>${esc(item.child.name)}</span></span>`;
          const cells = all ? names.map(n => { const v=item.values.find(x=>x.name===n); return `<td><button class="ci-org-cell" data-tree-tag="${index}" data-tag-name="${esc(n)}">${v?pct(v.share):item.denominator?'0.0%':'—'}<small>${v?`${num(v.count)}/${num(v.denominator)}`:item.denominator?`0/${num(item.denominator)}`:''}</small></button></td>`; }).join('') : `<td><strong class="ci-tree-rate">${item.value===null?'—':pct(item.value)}</strong></td><td>${num(item.count)} / ${num(item.den)}</td>`;
          return `<tr class="ci-tree-depth-${Math.min(depth,3)}"><th scope="row">${name}</th>${cells}</tr>${expanded && expandable ? renderLevel(item.nextPath, depth+1) : ''}`;
        }).join('');
      };
      const heading = all ? names.map(n=>`<th scope="col">${esc(n)}</th>`).join('') : `<th scope="col">${orgMetric==='local'?'组织内画像占比':'上级线索来源占比'}</th><th scope="col">画像值线索数 / 分母线索数</th>`;
      body = `<div class="ci-org-table-wrap"><table class="ci-org-table"><thead><tr><th scope="col">组织</th>${heading}</tr></thead><tbody>${renderLevel(drillState.path,0)}</tbody></table></div>`;
    }
    if (drillView.level !== 'leads' && !groups.length) body = '<div class="ci-org-end">当前范围暂无下级组织数据</div>';
    host.innerHTML = `<div class="ci-org-toolbar"><div><strong>${all?`各${esc(drillView.levelLabel)}画像分布`:`${esc(drillState.targetName)} · ${num(totalTag)} 条`}</strong><small>${all?'点击画像值，追踪该值在下一级组织的分布':orgMetric==='local'?`分母为本组织提及${esc(label)}的线索数`:`分母为直接上级组织提及该画像值的线索数`}</small></div><div class="ci-org-controls">${!all?'<button class="ci-text" data-org-mode="all">查看完整画像</button>':''}${drillView.level!=='leads'?tabs:''}<details class="ci-org-help"><summary aria-label="查看统计口径说明" title="统计口径说明">?</summary><div class="ci-org-help-panel"><strong>统计口径</strong><p><b>组织内画像占比</b>：本组织提及该画像值的去重线索数 ÷ 本组织提及该画像维度的去重线索数。用于比较画像值在各组织的普遍程度。</p><p><b>上级线索来源占比</b>：本组织提及该画像值的去重线索数 ÷ 直接上级组织提及该画像值的去重线索数。用于查看上级命中的线索来自哪些下级组织；展开后每层以上一级为分母。</p><p><b>画像值线索数 / 分母线索数</b>：依次对应当前占比的分子与分母。分母为 0 时显示“—”。同一线索按线索 ID 去重。</p></div></details></div></div>${body}`;
  }
  function renderActionOrganizationDrill() {
    const host = $('organizationDrill');
    if (!host || workspace !== 'actions' || compare || !drillState || drillView.level === 'leads') return;
    host.hidden = false;
    $('compareVisual').hidden = true;
    $('analysisTableWrap').hidden = true;
    $('analysisTitle').textContent = `${drillState.targetName} · 组织执行分析`;
    $('analysisDescription').textContent = '展开组织，逐级查看该 SOP 的执行情况。';
    const fields = scope.organizationDimension === 'geography' ? M.geographyFields : M.organizationFields;
    orgTreePaths = [];
    const renderLevel = (path, depth) => {
      const parent = M.drill(result, drillState, path);
      const ordered = [...parent.children].sort((a,b) => (a.summary?.completion ?? Infinity) - (b.summary?.completion ?? Infinity) || a.name.localeCompare(b.name,'zh-CN'));
      return ordered.map(child => {
        const nextPath = [...path, {level:child.level, id:child.id, name:child.name}];
        const index = orgTreePaths.push(nextPath) - 1;
        const next = M.drill(result, drillState, nextPath);
        const expandable = next.level !== 'leads' && next.children.length > 0;
        const expanded = expandedOrgTree.has(JSON.stringify(nextPath));
        const toggle = expandable ? `<button type="button" class="ci-tree-toggle" data-tree-toggle="${index}" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}${esc(child.name)}">${expanded?'▾':'▸'}</button>` : '<span class="ci-tree-spacer"></span>';
        const row = child.summary;
        const done = row?.done || 0, count = row?.count || 0, missed = row?.missed || 0;
        return `<tr class="ci-tree-depth-${Math.min(depth,3)}"><th scope="row"><span class="ci-tree-name" style="padding-left:${depth*22}px">${toggle}<span>${esc(child.name)}</span></span></th><td>${num(count)}</td><td>${num(done)}</td><td>${num(missed)}</td><td><strong class="ci-tree-rate">${pct(row?.completion ?? null)}</strong><small>${num(done)} / ${num(count)}</small></td><td>${pct(row?.qualified ?? null)}<small>${num(row?.qualifiedCount || 0)} / ${num(count)}</small></td><td>${expandable ? `<button type="button" class="ci-text" data-tree-toggle="${index}" aria-expanded="${expanded}">${expanded ? '收起' : '下钻'}</button>` : '—'}</td></tr>${expanded && expandable ? renderLevel(nextPath,depth+1) : ''}`;
      }).join('');
    };
    const body = renderLevel(drillState.path,0);
    host.innerHTML = `<div class="ci-org-toolbar"><div><strong>各组织 SOP 分析</strong><small>按同级完成率从低到高排序 · 完成率及合格率均以适用线索数为分母</small></div></div>${body ? `<div class="ci-org-table-wrap"><table class="ci-org-table ci-sop-tree"><thead><tr><th scope="col">组织</th><th scope="col">适用线索</th><th scope="col">已完成</th><th scope="col">未完成</th><th scope="col">完成率</th><th scope="col">合格率</th><th scope="col">操作</th></tr></thead><tbody>${body}</tbody></table></div>` : '<div class="ci-org-end">当前范围暂无下级组织数据</div>'}`;
  }
  function openScopeEvidence(leadId) {
    if (!drillView?.summary) return;
    selected = { ...drillView.summary };
    if (leadId) { selected.records = selected.records.filter(r=>r.id===leadId); selected.singleLeadId = leadId; }
    if (!selected.records.length) return;
    reviewed = new Set(); evidencePage = 1; evidenceGroup = 'all'; completion = 'all';
    $('detailTitle').textContent = selected.singleLeadId || selected.name;
    $('detailSubtitle').textContent = `${selected.name} · ${drillState.path.map(p=>p.name).join(' / ')||scope.org}`;
    renderDetail(); openDialog('detailDialog');
  }
  function updateScope(patch) {
    scope = { ...scope, ...patch };
    actionPage = 1;
    byRegion = false;
    expandedOrgTree.clear();
    drillState = null; drillView = null; leadPage = 1; drillScroll.clear();
    selected = null;
    renderFilters(); render();
  }
  function openDialog(id) {
    closeMenus();
    const dialog = $(id); dialog.showModal();
    const body = dialog.querySelector('.badge-field-settings-body'); if (body) body.scrollTop = 0;
  }
  function closeDialog(id) {
    if (id === 'draftDialog' && $('draftStatus').textContent === '有未保存修改') { clearTimeout(draftSaveTimer); saveDraft(); }
    document.querySelector('.main').inert = false;
    document.querySelector('.sidebar').inert = false;
    $(id).close();
  }
  function metrics(items) {
    return `<div class="ci-metrics">${items.map(([label, value, note]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`).join('')}</div>`;
  }
  function findingStats(row) {
    return workspace === 'customers'
      ? `提及 ${row.count}/${row.denominator} 条（${pct(row.share)}）${compare ? `；A ${row.aCount}/${row.aTotal}（${pct(row.aRate)}），B ${row.bCount}/${row.bTotal}（${pct(row.bRate)}）` : ''}`
      : `适用 ${row.count} 条；完成 ${row.done} 条（${pct(row.completion)}）；SOP 合格 ${row.qualifiedCount} 条（${pct(row.qualified)}）${compare ? `；完成/未完成动作的 A 组结果率 ${pct(row.resultDone)} / ${pct(row.resultMissed)}` : ''}`;
  }
  function openDetail(index) {
    selected = rows[index]; if (!selected) return;
    reviewed = new Set(); evidencePage = 1; evidenceGroup = 'all'; completion = 'all';
    $('detailTitle').textContent = selected.name;
    $('detailSubtitle').textContent = `${workspace === 'customers' ? M.topics[scope.stage][dimension].label : selected.source} · ${scope.brand} · ${scope.model === 'all' ? '全部车型' : scope.model} · ${selected.region || scope.org}`;
    renderDetail(); openDialog('detailDialog');
  }
  function evidenceRows() {
    return selected.records.filter(record => (evidenceGroup === 'all' || M.inGroup(scope, record, evidenceGroup)) && (workspace !== 'actions' || completion === 'all' || record.actions[selected.id].complete === (completion === 'done')));
  }
  function evidenceText(record) {
    return workspace === 'customers' ? (record.annotations[dimension].find(a => a.name === selected.name)?.text || '') : record.actions[selected.id].text;
  }
  function renderDetail() {
    if (!selected) return;
    const row = selected;
    const metricItems = workspace === 'customers'
      ? [['提及线索', `${num(row.count)} 条`, `分母 ${num(row.denominator)} 条`], ['提及占比', pct(row.share), '按线索 ID 去重'], ['原文可用样本', `${num(row.records.filter(r => evidenceText(r)).length)} 条`, '均为模拟转写']]
      : [['适用线索', `${num(row.count)} 条`, `完成 ${row.done} / 未完成 ${row.missed}`], ['动作完成率', pct(row.completion), `${row.done}/${row.count}`], ['SOP 合格率', pct(row.qualified), `${row.qualifiedCount}/${row.count}`]];
    const samples = evidenceRows(), pages = Math.max(1, Math.ceil(samples.length / 6));
    evidencePage = Math.min(evidencePage, pages);
    const preview = samples.slice((evidencePage - 1) * 6, evidencePage * 6);
    $('detailBody').innerHTML = `<section class="ci-section">${row.singleLeadId ? '<h3>所在组织的分析指标</h3>' : ''}${metrics(metricItems)}<p class="ci-note">${esc(scopeText()).replaceAll('\n', '<br>')}${row.singleLeadId ? `<br>证据范围：仅线索 ${esc(row.singleLeadId)}` : ''}</p></section>`
      + (workspace === 'actions' ? `<section class="ci-section"><h3>动作定义</h3><p>适用条件：${esc(row.trigger)}</p><p>执行要求：${esc(row.training)}</p></section>` : '')
      + (compare ? `<section class="ci-section"><h3>当前客群对比</h3><p>A：${esc(M.templates[scope.template].label)}<br>B：${esc(M.templates[scope.comparisonTemplate].label)}</p>${metrics([['A 组'+(workspace === 'actions'?'完成率':'占比'), pct(row.aRate), `${row.aCount}/${row.aTotal}`], ['B 组'+(workspace === 'actions'?'完成率':'占比'), pct(row.bRate), `${row.bCount}/${row.bTotal}`], workspace === 'actions' ? ['完成 / 未完成的 A 组结果率', `${pct(row.resultDone)} / ${pct(row.resultMissed)}`, `${row.doneTarget}/${row.done} · ${row.missedTarget}/${row.missed}`] : ['差异（A−B）', row.delta === null ? '—' : row.delta.toFixed(1)+' pp', '仅表达分布差异']])}</section>` : '')
      + `<section class="ci-section"><h3>线索证据 <span class="ci-note">${num(samples.length)} 条 · <span id="detailReviewCount">已复核 ${reviewed.size} 条</span></span></h3><div class="ci-evidence-toolbar"><div class="ci-tools">${compare ? select('evidenceGroup', '客群', evidenceGroup, [['all','全部'],['a','A · '+M.templates[scope.template].label],['b','B · '+M.templates[scope.comparisonTemplate].label]]) : ''}${workspace === 'actions' ? select('completion', '执行', completion, [['all','全部'],['done','已完成'],['missed','未完成']]) : ''}</div><div class="ci-pager"><button class="ci-text" data-evidence-page="-1" type="button" ${evidencePage === 1 ? 'disabled' : ''}>上一页</button><span>${evidencePage}/${pages}</span><button class="ci-text" data-evidence-page="1" type="button" ${evidencePage === pages ? 'disabled' : ''}>下一页</button></div></div>${preview.map(record => {
        const text = evidenceText(record);
        return `<article class="ci-evidence"><header><span>${esc(record.store)} · ${esc(record.advisor)}</span><span>${esc(record.status)}${compare ? ` · ${M.inGroup(scope, record, 'a') ? 'A' : 'B'}组` : ''}</span></header><blockquote>${text ? `${workspace === 'customers' ? '客户' : '销售'}：${esc(text)}` : '该样本只有模拟标签标注，未提供对应原文，不能作为原文证据。'}</blockquote><footer><span>线索 ${esc(record.leadId)}<br>${esc(record.model)} · ${M.sceneLabels[record.scene]}</span><span>下发 ${record.issuedAt.slice(0,10)} · 已满${record.ageDays}天<br>状态截至 ${M.cutoff}</span></footer><label><input type="checkbox" data-review="${esc(record.id)}" ${reviewed.has(record.id) ? 'checked' : ''} ${text ? '' : 'disabled'}>已复核此条演示证据${workspace === 'actions' ? ` · 动作${record.actions[selected.id].complete ? '已完成' : '未完成'}` : ''}</label></article>`;
      }).join('') || '<p class="ci-note">当前证据筛选无匹配样本，请调整筛选。</p>'}</section><p class="ci-note">模拟标签和话术仅用于验证操作流程。差异不代表原因，未命中也不能直接解释为未执行；真实接入需保留无法判断状态。</p>`;
    updateReviewState();
  }
  function updateReviewState() {
    $('addFinding').disabled = !selected || !reviewed.size;
    if ($('detailReviewCount')) $('detailReviewCount').textContent = `已复核 ${reviewed.size} 条`;
    $('detailFooterNote').textContent = reviewed.size ? `已复核 ${reviewed.size} 条演示证据` : '至少复核 1 条证据后加入草稿';
  }
  function openGroups() {
    groupDraft = scope.comparisonTemplate;
    $('groupOptions').innerHTML = `<p>当前分析人群：<strong>${M.templates[scope.template].label}</strong>。请选择另一种人群作为参照。</p><div class="ci-reference-options">${Object.entries(M.templates).filter(([key, template])=>key!==scope.template && (!template.days || template.days === scope.minAgeDays)).map(([key,template])=>`<label><input type="radio" name="comparison-template" data-reference value="${key}" ${key===groupDraft?'checked':''}><span><strong>${template.label}</strong><small>${template.description} · ${num(result.counts[key])}条</small></span></label>`).join('')}</div><p class="ci-note">对比使用同一批下发线索${scope.minAgeDays ? `，两组均只包含下发已满 ${scope.minAgeDays} 天的线索` : ''}；当前状态按数据时点判断。两组重叠的线索不参与对比，卡片数量为排除重叠前的数量。</p>`;
    $('groupError').hidden = true; openDialog('groupDialog');
  }
  function evidenceDateText(e) { return e.issuedAt ? `下发${e.issuedAt.slice(0,10)} · 已满${e.ageDays}天 · 状态截至${e.statusAsOf.slice(0,10)}` : `历史草稿原口径：进入${e.t0 || '—'} · 结果确认${e.resultDate || '—'}`; }
  function saveDraft() {
    draft.sales = $('salesText').value; draft.operations = $('operationsText').value; draft.owner = $('draftOwner').value; draft.reviewDate = $('draftReviewDate').value;
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); $('draftStatus').textContent = '已保存到当前浏览器'; return true; }
    catch { $('draftStatus').textContent = '浏览器保存失败，请下载留存'; notify('无法保存草稿，请下载留存。', 'error'); return false; }
  }
  function renderDraftItems() {
    $('draftItems').innerHTML = draft.items.length ? draft.items.map((item, index) => `<article class="ci-draft-item"><header><strong>${esc(item.name)}</strong><button class="ci-text" type="button" data-remove-item="${index}">移除</button></header><p>${esc(item.kind)} · ${esc(item.stats)}</p>${item.reference ? `<p>动作定义中的参考执行要求：${esc(item.reference)}</p>` : ''}<details><summary>查看加入时的范围与 ${item.evidence.length} 条复核证据</summary><p>${esc(item.scopeText)}</p>${item.evidence.map(e => `<blockquote>${esc(e.text)}<br>线索 ${esc(e.id)} · ${esc(e.store)} · ${esc(e.advisor)}</blockquote>`).join('')}</details></article>`).join('') : '<div class="ci-empty-draft">尚未添加分析依据<br>从客户标签或SOP详情中复核证据后添加。</div>';
    $('downloadDraft').disabled = !draft.items.length;
    $('draftCount').textContent = draft.items.length;
  }
  function openDraft() {
    renderDraftItems(); $('salesText').value = draft.sales; $('operationsText').value = draft.operations; $('draftOwner').value = draft.owner; $('draftReviewDate').value = draft.reviewDate;
    openDialog('draftDialog');
  }
  function changeSelect(id, value) {
    if (id === 'leadStatus') { selectTemplate(value); return; }
    if (id === 'dimension') { openProfileDetail(value); return; }
    if (id === 'evidenceGroup' || id === 'completion') { if (id === 'evidenceGroup') evidenceGroup = value; else completion = value; evidencePage = 1; renderDetail(); return; }
    if (id === 'minAgeDays') updateScope({ minAgeDays: Number(value) });
  }
  function showSummarySegment(summarySegment) {
  const { summaryKey: key, summaryIndex, summaryField: field } = summarySegment.dataset;
  const items = M.distribution(result, key), row = items[Number(summaryIndex)];
  if (!row) return;
  const count = row[field], denominator = field === 'aCount' ? row.aTotal : field === 'bCount' ? row.bTotal : row.denominator;
  const rate = field === 'aCount' ? row.aRate : field === 'bCount' ? row.bRate : row.share;
  const total = items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
  const selection = $('summarySelection');
  selection.innerHTML = `<span>${esc(M.topics[scope.stage][key].label)}${field === 'aCount' ? ' · A组' : field === 'bCount' ? ' · B组' : ''}</span><strong>${esc(row.name)} ${pct(rate)}</strong><span>提及 ${num(count)} / ${num(denominator)} 条可分析线索</span><small>堆积构成占比 ${total ? (count / total * 100).toFixed(1) : '0.0'}%</small>`;
  selection.hidden = false;
  const container = $('profileDirectory'), containerBox = container.getBoundingClientRect(), segmentBox = summarySegment.getBoundingClientRect();
  const left = Math.min(segmentBox.right - containerBox.left + 10, container.clientWidth - selection.offsetWidth - 10);
  const top = Math.max(8, Math.min(segmentBox.top - containerBox.top, container.clientHeight - selection.offsetHeight - 8));
  selection.style.left = `${Math.max(8, left)}px`;
  selection.style.top = `${top}px`;
  document.querySelectorAll('.ci-summary-segment.is-selected').forEach(el => el.classList.remove('is-selected'));
  summarySegment.classList.add('is-selected');

  }
  function hideSummarySegment() {
    const tip = $('summarySelection');
    if (tip) tip.hidden = true;
    document.querySelectorAll('.ci-summary-segment.is-selected').forEach(el => el.classList.remove('is-selected'));
  }
  document.addEventListener('mouseover', event => {
    const segment = event.target.closest('[data-summary-key]');
    if (segment && !segment.contains(event.relatedTarget)) showSummarySegment(segment);
  });
  document.addEventListener('mouseout', event => {
    const segment = event.target.closest('[data-summary-key]');
    if (segment && !segment.contains(event.relatedTarget)) hideSummarySegment();
  });
  document.addEventListener('focusin', event => {
    const segment = event.target.closest('[data-summary-key]');
    if (segment) showSummarySegment(segment);
  });
  document.addEventListener('focusout', event => {
    if (event.target.closest('[data-summary-key]')) hideSummarySegment();
  });
  document.addEventListener('click', event => {
    const target = event.target;
    const preset = target.closest('[data-range-preset]:not(:disabled)');
    if (preset && dateRange) {
      const { rangePreset } = preset.dataset;
      dateRange.preset(rangePreset);
      renderDateRange();
      $('dateMenu').querySelector(`[data-range-preset="${rangePreset}"]`)?.focus({ preventScroll: true });
      return;
    }
    const monthNav = target.closest('[data-range-nav]'); if (monthNav && dateRange) { dateRange.navigate(Number(monthNav.dataset.rangeNav)); renderDateRange(); document.querySelector(`[data-range-nav="${monthNav.dataset.rangeNav}"]:not(:disabled)`)?.focus(); return; }
    const calendarDay = target.closest('[data-range-day]:not(:disabled)'); if (calendarDay && dateRange) {
      dateRange.pick(calendarDay.dataset.rangeDay);
      renderDateRange(calendarDay.dataset.rangeDay);
      return;
    }
    if (target.id === 'applyDate') { commitDateRange(); return; }
    if (target.id === 'cancelDate') { closeMenus(); $('dateTrigger').focus(); return; }
    document.querySelectorAll('.ci-template-help[open]').forEach(help => { if (!help.contains(target)) help.open = false; });
    const templateButton = target.closest('[data-template]'); if (templateButton) { selectTemplate(templateButton.dataset.template); return; }
    const cohort = target.closest('[data-cohort-filter]'); if (cohort) { openCohort(cohort.dataset.cohortFilter); return; }
    const cohortTurn = target.closest('[data-cohort-page]'); if (cohortTurn) { cohortPage += Number(cohortTurn.dataset.cohortPage); openCohort(cohortFilter, true); return; }
    // Shared filters may replace the clicked control before the event reaches the document.
    if (event.composedPath().includes($('insightScopeFilters'))) return;
    const option = target.closest('[role="option"][data-value]');
    if (option) { const control = option.closest('[data-select]'), id = control.dataset.select, value = option.dataset.value; closeMenus(); changeSelect(id, value); document.querySelector(`[data-select="${id}"] .session-select-trigger`)?.focus(); return; }
    const trigger = target.closest('.ci-select .session-select-trigger');
    if (trigger) {
      const control = trigger.closest('.ci-select'), menu = control.querySelector('.session-menu-panel'), open = menu.hidden;
      if (control.dataset.select === 'dates') { if (open) openDateRange(); else { closeMenus(); trigger.focus(); } return; }
      closeMenus(); menu.hidden = !open; control.classList.toggle('is-open', open); trigger.setAttribute('aria-expanded', String(open)); return;
    }
    if (!target.closest('.ci-select')) closeMenus();
    if (target.closest('[data-profile-home]')) { showProfileOverview(); return; }
    if (target.closest('[data-summary-expand]')) { summaryExpanded = !summaryExpanded; renderProfileOverview(); document.querySelector('[data-summary-expand]')?.focus({ preventScroll: true }); return; }
    const profileViewButton = target.closest('[data-profile-view]');
    if (profileViewButton) { profileView = profileViewButton.dataset.profileView; renderProfileOverview(); return; }
    const profileLink = target.closest('[data-profile-dimension]');
    if (profileLink) {
      const key = profileLink.dataset.profileDimension;
      if (isProfileOverview()) { const card = $('profile-card-' + key); card?.scrollIntoView({ block: 'center', behavior: 'smooth' }); card?.focus({ preventScroll: true }); }
      else openProfileDetail(key);
      return;
    }
    const profileDownload = target.closest('[data-profile-download]');
    if (profileDownload) { downloadProfileImage(profileDownload.dataset.profileDownload); return; }
    const profileExpand = target.closest('[data-profile-expand]');
    if (profileExpand) {
      const key = profileExpand.dataset.profileExpand, board = $('profileOverview');
      if (!expandedProfiles.size) board.style.setProperty('--profile-base-height', `${profileExpand.closest('.ci-profile-card').getBoundingClientRect().height}px`);
      if (expandedProfiles.has(key)) expandedProfiles.delete(key); else expandedProfiles.add(key);
      renderProfileOverview();
      if (!expandedProfiles.size) board.style.removeProperty('--profile-base-height');
      board.querySelector(`[data-profile-expand="${key}"]`)?.focus({ preventScroll: true });
      return;
    }
    const profileDetail = target.closest('[data-profile-detail]'); if (profileDetail) { openProfileDetail(profileDetail.dataset.profileDetail); return; }
    const orgEntry = target.closest('[data-org-entry]');
    if (orgEntry) { dimension = orgEntry.dataset.orgEntry; customerView = 'detail'; drillState = { kind:'customers', dimension, targetName:M.topics[scope.stage][dimension].label, path:[], organizationMode:'all' }; orgView='cards'; expandedOrgs.clear(); expandedOrgTree.clear(); render(); $('analysisTitle').scrollIntoView?.({block:'start'}); return; }
    const orgToggle = target.closest('[data-org-view]'); if (orgToggle) { orgView=orgToggle.dataset.orgView; render(); return; }
    const metricToggle = target.closest('[data-org-metric]'); if (metricToggle) { orgMetric=metricToggle.dataset.orgMetric; render(); return; }
    const orgExpand = target.closest('[data-org-expand]'); if (orgExpand) { const id=orgExpand.dataset.orgExpand; expandedOrgs.has(id) ? expandedOrgs.delete(id) : expandedOrgs.add(id); render(); return; }
    const treeToggle = target.closest('[data-tree-toggle]'); if (treeToggle) { const path=orgTreePaths[Number(treeToggle.dataset.treeToggle)]; if (!path) return; const key=JSON.stringify(path); expandedOrgTree.has(key) ? expandedOrgTree.delete(key) : expandedOrgTree.add(key); render(); return; }
    const treeTag = target.closest('[data-tree-tag]'); if (treeTag) { const path=orgTreePaths[Number(treeTag.dataset.treeTag)]; if (!path) return; drillState.organizationMode='tag'; drillState.targetName=treeTag.dataset.tagName; drillState.targetId=treeTag.dataset.tagName; drillState.path=path.slice(); expandedOrgTree.clear(); orgMetric='local'; render(); return; }
    const orgNext = target.closest('[data-org-next]'); if (orgNext) { const child=drillView.children[Number(orgNext.dataset.orgNext)]; if (!child) return; if (orgNext.dataset.tagName) { drillState.organizationMode='tag'; drillState.targetName=orgNext.dataset.tagName; drillState.targetId=orgNext.dataset.tagName; orgMetric='local'; } drillState.path.push({level:child.level,id:child.id,name:child.name}); expandedOrgs.clear(); render(); return; }
    const orgMode = target.closest('[data-org-mode]'); if (orgMode) { drillState.organizationMode=orgMode.dataset.orgMode; if (drillState.organizationMode==='all') drillState.targetName=M.topics[scope.stage][dimension].label; render(); return; }
    const profileDrill = target.closest('[data-profile-drill]');
    if (profileDrill) { openProfileDetail(profileDrill.dataset.profileDrill); startDrill(Number(profileDrill.dataset.profileIndex)); return; }
    const sortButton = target.closest('[data-action-sort]');
    if (sortButton && ['asc', 'desc'].includes(sortButton.dataset.actionSort)) {
      actionSort = sortButton.dataset.actionSort; actionPage = 1; render();
      document.querySelector(`[data-action-sort="${actionSort}"]`)?.focus({ preventScroll: true }); return;
    }
    const actionTurn = target.closest('[data-action-page]'); if (actionTurn) { actionPage += Number(actionTurn.dataset.actionPage); render(); document.querySelector(`[data-action-page="${actionTurn.dataset.actionPage}"]:not(:disabled)`)?.focus({ preventScroll: true }); return; }
    const downward = target.closest('[data-start-drill]'); if (downward) { startDrill(Number(downward.dataset.startDrill)); return; }
    const upward = target.closest('[data-drill-back]'); if (upward) { drillBack(Number(upward.dataset.drillBack)); return; }
    const leadEvidence = target.closest('[data-lead-evidence]'); if (leadEvidence) { openScopeEvidence(leadEvidence.dataset.leadEvidence); return; }
    const leadTurn = target.closest('[data-lead-page]'); if (leadTurn) { leadPage += Number(leadTurn.dataset.leadPage); render(); return; }
    if (target.closest('#scopeEvidence')) { openScopeEvidence(); return; }
    const detail = target.closest('[data-detail]'); if (detail) { openDetail(Number(detail.dataset.detail)); return; }
    const close = target.closest('[data-close]'); if (close) { closeDialog(close.dataset.close); return; }
    const page = target.closest('[data-evidence-page]'); if (page) { evidencePage += Number(page.dataset.evidencePage); renderDetail(); return; }
    const remove = target.closest('[data-remove-item]'); if (remove) { draft.items.splice(Number(remove.dataset.removeItem), 1); renderDraftItems(); saveDraft(); return; }
    if (target.id === 'byRegion') { byRegion = !byRegion; drillState = null; render(); return; }
  });
  document.addEventListener('mouseover', event => {
    const date = event.target.closest('[data-range-day]:not(:disabled)');
    if (date && dateRange?.hover(date.dataset.rangeDay)) renderDateRange();
  });
  document.addEventListener('keydown', event => {
    const coverageHelp = event.target.closest('.ci-coverage-explanation[open]');
    if (event.key === 'Escape' && coverageHelp) { coverageHelp.open = false; coverageHelp.querySelector('summary').focus(); event.preventDefault(); return; }
    if (event.key === 'Escape' && dateRange) { closeMenus(); $('dateTrigger').focus(); event.preventDefault(); event.stopPropagation(); return; }
    if (event.key === 'Escape' && event.target.closest('.ci-template-help[open]')) { event.target.closest('.ci-template-help').open = false; event.preventDefault(); return; }
    const dayButton = event.target.closest('[data-range-day]');
    if (dayButton && dateRange && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) {
      event.preventDefault();
      const current = dayButton.dataset.rangeDay;
      let next;
      if (event.key === 'PageUp' || event.key === 'PageDown') next = D.addMonths(current,event.key === 'PageUp' ? -1 : 1);
      else {
        const weekday = new Date(current+'T00:00:00Z').getUTCDay();
        const offset = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday}[event.key];
        next = D.day(current,offset);
      }
      if (dateRange.reveal(next)) { dateRange.hover(next); renderDateRange(next); }
      return;
    }
    if (event.target.closest('[data-template]') && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); const keys = Object.keys(M.templates), index = keys.indexOf(scope.template);
      selectTemplate(keys[event.key === 'Home' ? 0 : event.key === 'End' ? keys.length-1 : (index+(event.key === 'ArrowLeft' ? -1 : 1)+keys.length)%keys.length]); return;
    }
    const control = event.target.closest('.ci-select');
    if (event.key === 'Escape' && control && !control.querySelector('.session-menu-panel').hidden) { closeMenus(); control.querySelector('.session-select-trigger').focus(); event.preventDefault(); event.stopPropagation(); return; }
    if (control && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const menu = control.querySelector('[role="listbox"]'); if (!menu) return;
      event.preventDefault(); menu.hidden = false; control.classList.add('is-open'); control.querySelector('.session-select-trigger').setAttribute('aria-expanded', 'true');
      const options = [...menu.querySelectorAll('[role="option"]')], index = options.indexOf(document.activeElement);
      options[event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length]?.focus();
    }
  });
  document.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-review]')) { if (input.checked) reviewed.add(input.dataset.review); else reviewed.delete(input.dataset.review); updateReviewState(); }
    if (input.matches('[data-reference]')) groupDraft = input.value;
  });
  document.querySelectorAll('[data-workspace]').forEach(button => {
    button.addEventListener('click', () => { workspace = button.dataset.workspace; drillState = null; drillScroll.clear(); leadPage = 1; render(); });
    button.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); const other = workspace === 'customers' ? $('actionTab') : $('customerTab'); other.click(); other.focus(); } });
  });
  function reset() {
    closeMenus(); scope = { ...M.defaults(), filters: {}, organizationDimension: 'organization' };
    compare = false; dimension = 'resistance'; byRegion = false; customerView = 'overview';
    drillState = null; drillView = null; drillScroll.clear(); leadPage = 1; compareView = 'chart';
    renderFilters(); render();
  }
  $('emptyReset').onclick = reset;
  $('toggleCompare').onclick = openGroups;
  $('stopCompare').onclick = () => { summaryExpanded = false; compare = false; renderFilters(); render(); };
  $('editGroups').onclick = openGroups;
  $('applyGroups').onclick = () => {
    if (!Object.hasOwn(M.templates, groupDraft) || groupDraft === scope.template) { $('groupError').hidden = false; $('groupError').textContent = '请选择不同的对比客群。'; return; }
    closeDialog('groupDialog'); summaryExpanded = false; compare = true; compareView = 'chart'; profileView = 'chart'; updateScope({ comparisonTemplate: groupDraft });
  };
  $('detailDialog').addEventListener('close', () => { $('addFinding').hidden = false; selected = null; });
  $('addFinding').onclick = () => {
    if (!selected || !reviewed.size) return;
    const key = JSON.stringify([workspace, dimension, selected.id, scopeText()]);
    if (draft.items.some(item => item.key === key)) { notify('该分析项已在草稿中，可在策略草稿中查看。'); return; }
    if (draft.items.length >= 30) { notify('草稿最多保留 30 项，请先整理已有依据。'); return; }
    const evidence = selected.records.filter(r => reviewed.has(r.id)).map(r => ({ id: r.id, text: evidenceText(r), store: r.store, advisor: r.advisor, issuedAt: r.issuedAt, ageDays: r.ageDays, statusAsOf: M.snapshotAt }));
    draft.items.push({ key, name: selected.name, kind: workspace === 'customers' ? '客户画像依据' : 'SOP依据', reference: workspace === 'actions' ? selected.training : '', stats: findingStats(selected), scopeText: scopeText(), scope: { ...structuredClone(scope), drill: drillState ? structuredClone(drillState) : null }, compare, evidence, addedAt: new Date().toISOString() });
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); notify('已加入策略草稿，可继续分析或打开草稿填写建议。', 'success'); }
    catch { notify('已加入本次草稿，浏览器保存失败，请下载留存。', 'error'); }
    $('draftCount').textContent = draft.items.length; closeDialog('detailDialog');
  };
  $('openDraft').onclick = openDraft;
  $('saveDraft').onclick = () => { if (saveDraft()) notify('草稿已保存到当前浏览器。', 'success'); };
  $('draftForm').addEventListener('submit', event => event.preventDefault());
  $('draftForm').addEventListener('input', () => { draft.sales = $('salesText').value; draft.operations = $('operationsText').value; draft.owner = $('draftOwner').value; draft.reviewDate = $('draftReviewDate').value; $('draftStatus').textContent = '有未保存修改'; clearTimeout(draftSaveTimer); draftSaveTimer = setTimeout(saveDraft, 350); });
  $('downloadDraft').onclick = () => {
    if (!draft.items.length) return; saveDraft();
    const text = `# 客户洞察策略草稿（演示）\n\n所有数据及话术均为演示，不代表真实经营表现；建议由业务人员填写。\n\n## 分析依据\n\n${draft.items.map((item, i) => `### ${i + 1}. ${item.name}\n\n${item.scopeText}\n\n${item.stats}\n\n已复核证据：\n${item.evidence.map(e => `- ${e.id}｜${e.store}｜${e.advisor}｜${evidenceDateText(e)}\n  ${e.text}`).join('\n')}`).join('\n\n')}\n\n## 销售策略\n\n${draft.sales || '待业务补充'}\n\n## 运营策略\n\n${draft.operations || '待业务补充'}\n\n负责人：${draft.owner || '待明确'}\n计划复盘日期：${draft.reviewDate || '待明确'}\n\n关联差异不代表因果；本草稿未修改正式SOP或下发任务。\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' })), link = document.createElement('a');
    link.href = url; link.download = '客户洞察V2-策略草稿.md'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('策略草稿下载已开始。', 'success');
  };
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog.id); });
    dialog.addEventListener('close', () => { document.querySelector('.main').inert = false; document.querySelector('.sidebar').inert = false; });
    dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog.id); });
  });
  renderFilters(); render();
  if ($('reportDialog')?.ownerDocument) {
    reportCenter = window.InsightReports.mount({ root: $('reportDialog'), notify,
      getSnapshot: () => !result.errors.length && result.records.length ? window.InsightReportModel.snapshot(result, scopeText(scope, compare, false)) : null });
    $('generateReport').onclick = () => reportCenter.submit();
    $('openReports').onclick = () => reportCenter.open();
  }
})();
