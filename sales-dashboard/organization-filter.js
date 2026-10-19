(function (global) {
  'use strict';

  const labels = { brand: '品牌', region: '大区', zone: '战区', province: '省份', city: '城市', store: '门店', advisor: '顾问', patroler: '巡回员', governor: '治理员' };
  const personnelKeys = ['advisor', 'patroler', 'governor'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function mount({ root, model, businessRoot = null, onChange = () => {}, onReset = () => {}, onBeforeChange = () => {} }) {
    const document = root.ownerDocument;
    const window = document.defaultView || global;
    let openKey = '', query = '', pinnedIds = [], collapsed = true, composing = false;
    let collapseAnimation = null;
    let collapseTimer = null;
    let destroyed = false;

    root.classList.add('so-organization-filters');
    root.innerHTML = '<div data-so-dimension-slot></div><div class="so-filter-primary"><div class="so-filter-grid badge-dynamic-filter-grid" id="salesDashboardDimensionFilters"></div></div><div class="so-filter-extra" data-so-extra hidden inert aria-hidden="true"><div class="so-filter-extra-inner"><div class="so-filter-grid so-filter-secondary badge-dynamic-filter-grid"><div class="so-filter-personnel" data-so-personnel></div></div></div></div><div class="so-filter-actions badge-dynamic-filter-actions" data-so-actions></div>';
    const dimensionSlot = root.querySelector('[data-so-dimension-slot]');
    const primaryGrid = root.querySelector('#salesDashboardDimensionFilters');
    const primary = primaryGrid.parentElement;
    const extra = root.querySelector('[data-so-extra]');
    const personnel = root.querySelector('[data-so-personnel]');
    const actions = root.querySelector('[data-so-actions]');
    if (businessRoot) personnel.parentElement.appendChild(businessRoot);

    const candidates = key => model.options(key, { query: openKey === key ? query : '', pinnedIds });
    const menuMarkup = key => {
      const items = candidates(key);
      const selected = new Set(model.draft[key]);
      const allSelected = items.length > 0 && items.every(item => selected.has(item.value));
      const partial = !allSelected && items.some(item => selected.has(item.value));
      const placeholder = key === 'advisor' ? '输入顾问姓名或 ID' : key === 'store' ? '输入店名或店代码' : `搜索${labels[key]}`;
      return `<div class="session-menu-panel so-filter-menu badge-advisor-menu" role="dialog" aria-label="${labels[key]}筛选">
        <form class="so-filter-search badge-advisor-search" role="search"><span aria-hidden="true"></span><input type="search" data-so-search aria-label="搜索${labels[key]}" placeholder="${placeholder}" value="${escape(query)}" autocomplete="off" spellcheck="false"></form>
        <button type="button" class="so-filter-all badge-advisor-select-all${allSelected ? ' is-selected' : partial ? ' is-partial' : ''}" data-so-all="${key}" ${items.length ? '' : 'disabled'} aria-pressed="${allSelected}"><span class="so-filter-check badge-advisor-option-check" aria-hidden="true">${allSelected ? '✓' : ''}</span><span>全选</span><small>共 ${items.length} 条数据</small></button>
        <div class="so-filter-options badge-advisor-options" id="so-options-${key}" role="listbox" aria-label="${labels[key]}候选" aria-multiselectable="true">${items.length ? items.map(item => {
          const checked = selected.has(item.value);
          return `<button type="button" class="so-filter-option badge-advisor-option${checked ? ' is-selected' : ''}" data-so-option="${escape(item.value)}" role="option" aria-selected="${checked}"><span class="so-filter-check badge-advisor-option-check" aria-hidden="true">${checked ? '✓' : ''}</span><span class="so-filter-option-copy badge-advisor-option-copy"><strong>${escape(item.label)}</strong>${item.meta ? `<small>${escape(item.meta)}</small>` : ''}</span></button>`;
        }).join('') : '<p class="so-filter-empty badge-advisor-empty">未找到匹配数据</p>'}</div>
      </div>`;
    };
    const controlMarkup = key => {
      const selected = model.draft[key];
      const display = selected.length ? model.display(key) : `请选择${labels[key]}`;
      return `<div class="so-filter-control badge-field-filter badge-field-filter-select session-toolbar-menu${openKey === key ? ' is-open' : ''}" data-so-control="${key}"><span>${labels[key]}</span><button type="button" class="session-select-trigger${openKey === key ? ' active' : ''}" data-so-trigger="${key}" aria-label="${labels[key]}筛选" aria-haspopup="listbox" aria-controls="so-options-${key}" aria-expanded="${openKey === key}"><strong class="${selected.length ? '' : 'is-placeholder'}" title="${escape(display)}">${escape(display)}</strong><i class="session-select-caret" aria-hidden="true"></i></button>${openKey === key ? menuMarkup(key) : ''}</div>`;
    };

    function positionMenu() {
      if (!openKey || destroyed) return;
      const control = root.querySelector(`[data-so-control="${openKey}"]`);
      const menu = control?.querySelector('.so-filter-menu');
      if (!menu) return;
      const bounds = control.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (bounds.bottom < 0 || bounds.top > viewportHeight) { closeMenu(); return; }
      const margin = 16;
      const width = Math.min(420, Math.max(0, viewportWidth - margin * 2));
      const below = viewportHeight - bounds.bottom - margin - 8;
      const above = bounds.top - margin - 8;
      const opensAbove = below < 260 && above > below;
      menu.style.width = `${width}px`;
      menu.style.maxHeight = `${Math.max(0, Math.min(opensAbove ? above : below, viewportHeight - margin * 2))}px`;
      const viewportLeft = Math.max(margin, Math.min(bounds.left, viewportWidth - width - margin));
      menu.style.left = `${viewportLeft - bounds.left}px`;
      menu.style.top = `${opensAbove ? -menu.offsetHeight - 8 : (bounds.height || bounds.bottom - bounds.top) + 8}px`;
    }

    function render({ preserveScroll = false } = {}) {
      if (destroyed) return;
      const scrollTop = preserveScroll ? root.querySelector('.so-filter-options')?.scrollTop || 0 : 0;
      const keys = model.dimensionKeys();
      dimensionSlot.innerHTML = window.DimensionSwitcher.render({
        namespace: 'so', mode: model.draft.dimensionMode, label: '销售看板筛选维度', panelId: 'salesDashboardDimensionFilters',
        path: keys.map(key => model.draft[key].length ? model.display(key) : `全部${labels[key]}`)
      });
      primaryGrid.innerHTML = keys.map(controlMarkup).join('');
      personnel.innerHTML = personnelKeys.map(controlMarkup).join('');
      actions.innerHTML = `<div><button type="button" class="btn session-reset-btn" data-so-reset>重置</button><button type="button" class="session-toggle-text-btn" data-so-collapse aria-expanded="${!collapsed}" aria-controls="salesDashboardExtraFilters"><span>${collapsed ? '展开' : '收起'}</span><svg class="session-toggle-text-btn-icon${collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
      extra.id = 'salesDashboardExtraFilters';
      root.classList.toggle('is-collapsed', collapsed);
      (collapsed ? primary : root).appendChild(actions);
      if (!collapseAnimation) settleExtra();
      window.DimensionSwitcher.sync(root);
      const options = root.querySelector('.so-filter-options');
      if (options) options.scrollTop = scrollTop;
      positionMenu();
    }

    function settleExtra() {
      extra.hidden = collapsed;
      extra.inert = collapsed;
      extra.setAttribute('aria-hidden', String(collapsed));
      extra.style.height = '';
      extra.style.overflow = '';
    }

    function closeMenu({ restoreFocus = false } = {}) {
      if (!openKey) return;
      const key = openKey;
      openKey = ''; query = ''; pinnedIds = [];
      render();
      if (restoreFocus) root.querySelector(`[data-so-trigger="${key}"]`)?.focus({ preventScroll: true });
    }

    function openMenu(key, focusOption = '') {
      onBeforeChange();
      openKey = key; query = ''; pinnedIds = [...model.draft[key]];
      render();
      if (focusOption) {
        const options = root.querySelectorAll('[data-so-option]');
        (focusOption === 'last' ? options[options.length - 1] : options[0])?.focus({ preventScroll: true });
      } else if (!window.matchMedia('(pointer: coarse)').matches) root.querySelector('[data-so-search]')?.focus({ preventScroll: true });
    }

    function toggleCollapsed() {
      onBeforeChange();
      closeMenu();
      const previousHeight = extra.hidden ? 0 : extra.getBoundingClientRect().height;
      if (collapseAnimation) collapseAnimation.cancel();
      window.clearTimeout(collapseTimer);
      collapseAnimation = null;
      collapsed = !collapsed;
      extra.hidden = false;
      extra.inert = collapsed;
      extra.setAttribute('aria-hidden', String(collapsed));
      render();
      if (!extra.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      extra.hidden = false;
      const nextHeight = collapsed ? 0 : extra.scrollHeight;
      extra.style.overflow = 'clip';
      const animation = extra.animate([{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }], {
        duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards'
      });
      collapseAnimation = animation;
      const finish = () => {
        if (collapseAnimation !== animation) return;
        collapseAnimation = null;
        window.clearTimeout(collapseTimer);
        animation.cancel();
        settleExtra();
      };
      animation.onfinish = finish;
      collapseTimer = window.setTimeout(finish, 340);
    }

    function click(event) {
      const fieldTrigger = !event.target.closest('.so-filter-menu')
        && event.target.closest('[data-so-control]')?.querySelector('[data-so-trigger]');
      const button = event.target.closest('button') || fieldTrigger;
      if (!button) {
        if (!event.target.closest('.so-filter-menu')) closeMenu();
        return;
      }
      if (!root.contains(button)) return;
      if (button.hasAttribute('data-so-trigger')) {
        const key = button.dataset.soTrigger;
        if (key === openKey) closeMenu({ restoreFocus: true });
        else openMenu(key);
        return;
      }
      if (button.hasAttribute('data-so-collapse')) {
        toggleCollapsed();
        root.querySelector('[data-so-collapse]')?.focus({ preventScroll: true });
        return;
      }
      if (button.hasAttribute('data-so-reset')) {
        onBeforeChange();
        model.reset();
        openKey = ''; query = ''; pinnedIds = [];
        collapsed = true;
        if (collapseAnimation) collapseAnimation.cancel();
        collapseAnimation = null;
        window.clearTimeout(collapseTimer);
        onReset();
        render();
        onChange({ reset: true });
        root.querySelector('[data-so-reset]')?.focus({ preventScroll: true });
        return;
      }
      if (button.hasAttribute('data-so-dimension')) {
        const from = model.draft.dimensionMode, mode = button.dataset.soDimension;
        if (from === mode) return;
        onBeforeChange();
        const cleared = model.dimensionKeys().some(key => key !== 'brand' && model.draft[key].length);
        model.setDimension(mode); model.apply();
        openKey = ''; query = ''; pinnedIds = [];
        render();
        onChange({ dimension: mode });
        window.DimensionSwitcher.change(root, {
          from, mode, event, cleared,
          fields: (mode === 'geography' ? ['province', 'city'] : ['region', 'zone']).map(key => root.querySelector(`[data-so-control="${key}"]`))
        });
        return;
      }
      if (!openKey || (!button.hasAttribute('data-so-option') && !button.hasAttribute('data-so-all'))) return;
      onBeforeChange();
      const selected = new Set(model.draft[openKey]);
      const value = button.dataset.soOption;
      if (value !== undefined) selected.has(value) ? selected.delete(value) : selected.add(value);
      else {
        const items = candidates(openKey);
        const removing = items.every(item => selected.has(item.value));
        items.forEach(item => removing ? selected.delete(item.value) : selected.add(item.value));
      }
      const key = openKey;
      const removed = model.set(key, [...selected]);
      model.apply();
      render({ preserveScroll: true });
      onChange({ key, removed });
      const nextButton = value === undefined ? root.querySelector('[data-so-all]')
        : [...root.querySelectorAll('[data-so-option]')].find(option => option.dataset.soOption === value);
      nextButton?.focus({ preventScroll: true });
    }

    function search(input) {
      const start = input.selectionStart, end = input.selectionEnd;
      query = input.value;
      render();
      const next = root.querySelector('[data-so-search]');
      next?.focus({ preventScroll: true });
      if (start !== null && next?.setSelectionRange) next.setSelectionRange(start, end);
    }
    function input(event) { if (!composing && event.target.hasAttribute('data-so-search')) search(event.target); }
    function compositionStart(event) { if (event.target.hasAttribute('data-so-search')) composing = true; }
    function compositionEnd(event) { if (event.target.hasAttribute('data-so-search')) { composing = false; search(event.target); } }
    function submit(event) { if (event.target.classList.contains('so-filter-search')) event.preventDefault(); }
    function keydown(event) {
      if (window.DimensionSwitcher.handleKeydown(event)) { event.stopPropagation(); return; }
      if (event.key === 'Escape' && openKey) { event.preventDefault(); event.stopPropagation(); closeMenu({ restoreFocus: true }); return; }
      const trigger = event.target.closest('[data-so-trigger]');
      if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); openMenu(trigger.dataset.soTrigger, event.key === 'ArrowUp' ? 'last' : 'first'); return;
      }
      if (!openKey || !event.target.closest('.so-filter-menu') || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      if (event.target.hasAttribute('data-so-search') && ['Home', 'End'].includes(event.key)) return;
      const options = [...root.querySelectorAll('[data-so-option]')];
      if (!options.length) return;
      event.preventDefault();
      const current = options.indexOf(event.target.closest('[data-so-option]'));
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : current < 0 ? (event.key === 'ArrowUp' ? options.length - 1 : 0)
          : (current + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
      options[index].focus({ preventScroll: true });
      options[index].scrollIntoView?.({ block: 'nearest' });
    }
    function outside(event) {
      if (openKey && (!root.contains(event.target) || businessRoot?.contains(event.target))) closeMenu();
    }
    function viewportChange() { positionMenu(); }

    root.addEventListener('click', click);
    root.addEventListener('input', input);
    root.addEventListener('compositionstart', compositionStart);
    root.addEventListener('compositionend', compositionEnd);
    root.addEventListener('submit', submit);
    root.addEventListener('keydown', keydown);
    document.addEventListener('click', outside, true);
    window.addEventListener('resize', viewportChange);
    window.addEventListener('scroll', viewportChange, true);
    render();
    return {
      render, closeMenu,
      destroy() {
        destroyed = true;
        window.DimensionSwitcher.sync(root);
        if (collapseAnimation) collapseAnimation.cancel();
        window.clearTimeout(collapseTimer);
        root.removeEventListener('click', click);
        root.removeEventListener('input', input);
        root.removeEventListener('compositionstart', compositionStart);
        root.removeEventListener('compositionend', compositionEnd);
        root.removeEventListener('submit', submit);
        root.removeEventListener('keydown', keydown);
        document.removeEventListener('click', outside, true);
        window.removeEventListener('resize', viewportChange);
        window.removeEventListener('scroll', viewportChange, true);
      }
    };
  }

  // 只观察页面模板的更换；组件选值不调用个人看板的数据或渲染函数。
  function connect(host) {
    const models = new Map();
    let activeRoot = null;
    let instance = null;
    let sourceTabs = null;
    const destroySceneFilter = () => activeRoot?.closest('.sales-role-nav')?.querySelector('#salesReviewSceneControl')?.salesSceneFilter?.destroy();
    const activate = () => {
      const root = host.querySelector('[data-sales-organization-filters]');
      if (root === activeRoot) return;
      instance?.destroy();
      destroySceneFilter();
      sourceTabs?.destroy();
      sourceTabs = null;
      instance = null;
      activeRoot = root;
      if (!root) return;
      const role = root.dataset.salesOrganizationFilters;
      if (!models.has(role)) {
        const document = root.ownerDocument;
        const profile = document.getElementById('profile-name')?.textContent.trim();
        const store = document.getElementById('profile-store')?.textContent.trim() || '';
        // 现有个人资料没有门店和顾问业务ID，不推断与目录门店的绑定。
        const people = profile ? [{ advisorKey: `sales-profile:${role}`, advisorId: '', advisor: profile, store, storeId: '' }] : [];
        const model = global.VisitOrganizationFilter.createModel(global.__DEVICE_ORGANIZATION_DEALERS, people, { mode: 'matching' });
        model.apply();
        models.set(role, model);
      }
      const businessRoot = root.closest('.sales-filter-card')?.querySelector('.sales-role-nav-filters');
      instance = mount({ root, model: models.get(role), businessRoot });
      const source = root.closest('.sales-role-nav')?.querySelector('.role-page-switch');
      if (source) sourceTabs = global.SalesSourceTabs.mount(source);
    };
    const observer = new global.MutationObserver(activate);
    observer.observe(host, { childList: true });
    activate();
    return { destroy() { observer.disconnect(); instance?.destroy(); destroySceneFilter(); sourceTabs?.destroy(); sourceTabs = null; instance = null; activeRoot = null; } };
  }

  global.SalesDashboardOrganizationFilter = { mount, connect };
  const host = global.document?.getElementById('pageHost');
  if (host) connect(host);
})(window);
