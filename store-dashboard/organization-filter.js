(function (global) {
  'use strict';

  const labels = { brand: '品牌', region: '大区', zone: '战区', province: '省份', city: '城市', store: '门店', advisor: '顾问', patroler: '巡回员', governor: '治理员' };
  const personnelKeys = ['patroler', 'governor'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function mount({ root, model, businessFilters, fixedSubject = false, onChange = () => {}, onReset = () => {}, onBeforeChange = () => {} }) {
    const document = root.ownerDocument;
    const window = document.defaultView || global;
    if (model.draft.advisor.length || model.applied.advisor.length) {
      model.set('advisor', []);
      model.apply();
      onChange({ advisorRemoved: true });
    }
    let openKey = '', query = '', pinnedIds = [], collapsed = true, composing = false;
    let collapseAnimation = null;
    let collapseTimer = null;
    let destroyed = false;

    root.classList.add('sd-organization-filters');
    root.innerHTML = (fixedSubject ? '' : '<div data-sd-dimension-slot></div>') + '<div class="sd-filter-primary"><div class="sd-filter-grid badge-dynamic-filter-grid" id="storeDashboardDimensionFilters"></div></div>' + (fixedSubject ? '' : '<div class="sd-filter-extra" data-sd-extra hidden inert aria-hidden="true"><div class="sd-filter-extra-inner"><div class="sd-filter-grid badge-dynamic-filter-grid sd-filter-secondary"><div class="sd-filter-personnel" data-sd-personnel></div><div class="sd-filter-business" data-sd-business></div></div></div></div>') + '<div class="sd-filter-actions badge-dynamic-filter-actions" data-sd-actions></div>';
    const dimensionSlot = root.querySelector('[data-sd-dimension-slot]');
    const primaryGrid = root.querySelector('#storeDashboardDimensionFilters');
    const primary = primaryGrid.parentElement;
    const extra = root.querySelector('[data-sd-extra]');
    const personnel = root.querySelector('[data-sd-personnel]');
    const businessSlot = root.querySelector('[data-sd-business]');
    const actions = root.querySelector('[data-sd-actions]');
    if (businessFilters) (fixedSubject ? primaryGrid : businessSlot).appendChild(businessFilters);

    const candidates = key => model.options(key, { query: openKey === key ? query : '', pinnedIds });
    const menuMarkup = key => {
      const items = candidates(key);
      const selected = new Set(model.draft[key]);
      const allSelected = items.length > 0 && items.every(item => selected.has(item.value));
      const partial = !allSelected && items.some(item => selected.has(item.value));
      const placeholder = key === 'advisor' ? '输入顾问姓名或 ID' : key === 'store' ? '输入店名或店代码' : `搜索${labels[key]}`;
      return `<div class="session-menu-panel sd-filter-menu badge-advisor-menu" role="dialog" aria-label="${labels[key]}筛选">
        <form class="sd-filter-search badge-advisor-search" role="search"><span aria-hidden="true"></span><input type="search" data-sd-search aria-label="搜索${labels[key]}" placeholder="${placeholder}" value="${escape(query)}" autocomplete="off" spellcheck="false"></form>
        <button type="button" class="sd-filter-all badge-advisor-select-all${allSelected ? ' is-selected' : partial ? ' is-partial' : ''}" data-sd-all="${key}" ${items.length ? '' : 'disabled'} aria-pressed="${allSelected}"><span class="sd-filter-check badge-advisor-option-check" aria-hidden="true">${allSelected ? '✓' : ''}</span><span>全选</span><small>共 ${items.length} 条数据</small></button>
        <div class="sd-filter-options badge-advisor-options" id="sd-options-${key}" role="listbox" aria-label="${labels[key]}候选" aria-multiselectable="true">${items.length ? items.map(item => {
          const checked = selected.has(item.value);
          return `<button type="button" class="sd-filter-option badge-advisor-option${checked ? ' is-selected' : ''}" data-sd-option="${escape(item.value)}" role="option" aria-selected="${checked}"><span class="sd-filter-check badge-advisor-option-check" aria-hidden="true">${checked ? '✓' : ''}</span><span class="sd-filter-option-copy badge-advisor-option-copy"><strong>${escape(item.label)}</strong>${item.meta ? `<small>${escape(item.meta)}</small>` : ''}</span></button>`;
        }).join('') : '<p class="sd-filter-empty badge-advisor-empty">未找到匹配数据</p>'}</div>
      </div>`;
    };
    const controlMarkup = key => {
      const selected = model.draft[key];
      const display = selected.length ? model.display(key) : `请选择${labels[key]}`;
      return `<div class="sd-filter-control badge-field-filter badge-field-filter-select session-toolbar-menu${openKey === key ? ' is-open' : ''}" data-sd-control="${key}"><span>${labels[key]}</span><button type="button" class="session-select-trigger${openKey === key ? ' active' : ''}" data-sd-trigger="${key}" aria-label="${labels[key]}筛选" aria-haspopup="listbox" aria-controls="sd-options-${key}" aria-expanded="${openKey === key}"><strong class="${selected.length ? '' : 'is-placeholder'}" title="${escape(display)}">${escape(display)}</strong><i class="session-select-caret" aria-hidden="true"></i></button>${openKey === key ? menuMarkup(key) : ''}</div>`;
    };

    function positionMenu() {
      if (!openKey || destroyed) return;
      const control = root.querySelector(`[data-sd-control="${openKey}"]`);
      const menu = control?.querySelector('.sd-filter-menu');
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
      const scrollTop = preserveScroll ? root.querySelector('.sd-filter-options')?.scrollTop || 0 : 0;
      const activeBusinessNode = businessFilters?.contains(document.activeElement) ? document.activeElement : null;
      if (fixedSubject) {
        actions.innerHTML = '<button type="button" class="btn session-reset-btn" data-sd-reset>重置</button>';
        primary.classList.add('dashboard-fixed-filter-row');
        primary.appendChild(actions);
        const options = root.querySelector('.sd-filter-options');
        if (options) options.scrollTop = scrollTop;
        positionMenu();
        if (activeBusinessNode && document.activeElement !== activeBusinessNode) activeBusinessNode.focus({ preventScroll: true });
        return;
      }
      const keys = model.dimensionKeys();
      dimensionSlot.innerHTML = window.DimensionSwitcher.render({
        namespace: 'sd', mode: model.draft.dimensionMode, label: '门店看板筛选维度', panelId: 'storeDashboardDimensionFilters',
        path: keys.map(key => model.draft[key].length ? model.display(key) : `全部${labels[key]}`)
      });
      primaryGrid.innerHTML = keys.map(controlMarkup).join('');
      personnel.innerHTML = personnelKeys.map(controlMarkup).join('');
      actions.innerHTML = `<div><button type="button" class="btn session-reset-btn" data-sd-reset>重置</button><button type="button" class="session-toggle-text-btn" data-sd-collapse aria-expanded="${!collapsed}" aria-controls="storeDashboardExtraFilters"><span>${collapsed ? '展开' : '收起'}</span><svg class="session-toggle-text-btn-icon${collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
      extra.id = 'storeDashboardExtraFilters';
      root.classList.toggle('is-collapsed', collapsed);
      (collapsed ? primary : root).appendChild(actions);
      if (!collapseAnimation) settleExtra();
      window.DimensionSwitcher.sync(root);
      const options = root.querySelector('.sd-filter-options');
      if (options) options.scrollTop = scrollTop;
      positionMenu();
      if (activeBusinessNode && document.activeElement !== activeBusinessNode) activeBusinessNode.focus({ preventScroll: true });
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
      if (restoreFocus) root.querySelector(`[data-sd-trigger="${key}"]`)?.focus({ preventScroll: true });
    }

    function openMenu(key, focusOption = '') {
      onBeforeChange();
      openKey = key; query = ''; pinnedIds = [...model.draft[key]];
      render();
      if (focusOption) {
        const options = root.querySelectorAll('[data-sd-option]');
        (focusOption === 'last' ? options[options.length - 1] : options[0])?.focus({ preventScroll: true });
      } else if (!window.matchMedia('(pointer: coarse)').matches) root.querySelector('[data-sd-search]')?.focus({ preventScroll: true });
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
      const fieldTrigger = !event.target.closest('.sd-filter-menu')
        && event.target.closest('[data-sd-control]')?.querySelector('[data-sd-trigger]');
      const button = event.target.closest('button') || fieldTrigger;
      if (!button) {
        if (!event.target.closest('.sd-filter-menu')) closeMenu();
        return;
      }
      if (!root.contains(button)) return;
      if (button.hasAttribute('data-sd-trigger')) {
        const key = button.dataset.sdTrigger;
        if (key === openKey) closeMenu({ restoreFocus: true });
        else openMenu(key);
        return;
      }
      if (button.hasAttribute('data-sd-collapse')) {
        toggleCollapsed();
        root.querySelector('[data-sd-collapse]')?.focus({ preventScroll: true });
        return;
      }
      if (button.hasAttribute('data-sd-reset')) {
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
        root.querySelector('[data-sd-reset]')?.focus({ preventScroll: true });
        return;
      }
      if (button.hasAttribute('data-sd-dimension')) {
        const from = model.draft.dimensionMode, mode = button.dataset.sdDimension;
        if (from === mode) return;
        onBeforeChange();
        const cleared = model.dimensionKeys().some(key => key !== 'brand' && model.draft[key].length);
        model.setDimension(mode); model.apply();
        openKey = ''; query = ''; pinnedIds = [];
        render();
        onChange({ dimension: mode });
        window.DimensionSwitcher.change(root, {
          from, mode, event, cleared,
          fields: (mode === 'geography' ? ['province', 'city'] : ['region', 'zone']).map(key => root.querySelector(`[data-sd-control="${key}"]`))
        });
        return;
      }
      if (!openKey || (!button.hasAttribute('data-sd-option') && !button.hasAttribute('data-sd-all'))) return;
      onBeforeChange();
      const selected = new Set(model.draft[openKey]);
      const value = button.dataset.sdOption;
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
      const nextButton = value === undefined ? root.querySelector('[data-sd-all]')
        : [...root.querySelectorAll('[data-sd-option]')].find(option => option.dataset.sdOption === value);
      nextButton?.focus({ preventScroll: true });
    }

    function search(input) {
      const start = input.selectionStart, end = input.selectionEnd;
      query = input.value;
      render();
      const next = root.querySelector('[data-sd-search]');
      next?.focus({ preventScroll: true });
      if (start !== null && next?.setSelectionRange) next.setSelectionRange(start, end);
    }
    function input(event) { if (!composing && event.target.hasAttribute('data-sd-search')) search(event.target); }
    function compositionStart(event) { if (event.target.hasAttribute('data-sd-search')) composing = true; }
    function compositionEnd(event) { if (event.target.hasAttribute('data-sd-search')) { composing = false; search(event.target); } }
    function submit(event) { if (event.target.classList.contains('sd-filter-search')) event.preventDefault(); }
    function keydown(event) {
      if (window.DimensionSwitcher.handleKeydown(event)) { event.stopPropagation(); return; }
      if (event.key === 'Escape' && openKey) { event.preventDefault(); event.stopPropagation(); closeMenu({ restoreFocus: true }); return; }
      const trigger = event.target.closest('[data-sd-trigger]');
      if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); openMenu(trigger.dataset.sdTrigger, event.key === 'ArrowUp' ? 'last' : 'first'); return;
      }
      if (!openKey || !event.target.closest('.sd-filter-menu') || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      if (event.target.hasAttribute('data-sd-search') && ['Home', 'End'].includes(event.key)) return;
      const options = [...root.querySelectorAll('[data-sd-option]')];
      if (!options.length) return;
      event.preventDefault();
      const current = options.indexOf(event.target.closest('[data-sd-option]'));
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : current < 0 ? (event.key === 'ArrowUp' ? options.length - 1 : 0)
          : (current + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
      options[index].focus({ preventScroll: true });
      options[index].scrollIntoView?.({ block: 'nearest' });
    }
    function outside(event) {
      const path = event.composedPath();
      if (openKey && (!path.includes(root) || path.includes(businessFilters))) closeMenu();
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

  global.StoreDashboardOrganizationFilter = { mount };
})(window);
