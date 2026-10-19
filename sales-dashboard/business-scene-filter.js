(function (global) {
  'use strict';

  const keys = ['scene'];
  const labels = { scene: '业务场景' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const normalize = value => String(value ?? '').toLocaleLowerCase('zh-CN').replace(/\s+/g, '');

  function mount({ root, sceneOptions, getSelection, onChange, onBeforeOpen = () => {} }) {
    const document = root.ownerDocument;
    const window = document.defaultView || global;
    const slots = Object.fromEntries(keys.map(key => [key, root.querySelector(`[data-sales-business-control="${key}"]`)]));
    let openKey = '', query = '', composing = false, pinnedIds = [], destroyed = false;
    root.classList.add('so-business-filters');
    keys.forEach(key => { slots[key].classList.add('so-filter-control', 'badge-field-filter', 'badge-field-filter-select'); slots[key].classList.add('session-toolbar-menu'); });

    const options = key => sceneOptions.filter(item => item.value !== 'all');
    const selection = key => [...(getSelection(key) || [])];
    const candidates = key => {
      const pinned = new Set(pinnedIds);
      const keyword = normalize(query);
      return options(key).filter(item => !keyword || normalize(`${item.label} ${item.meta || ''}`).includes(keyword))
        .sort((a, b) => Number(pinned.has(b.value)) - Number(pinned.has(a.value)));
    };
    const display = key => {
      const available = options(key);
      const names = selection(key).map(value => available.find(item => item.value === value)?.label || '—');
      return names.length ? names.length <= 2 ? names.join('、') : `${names[0]}等 ${names.length} 项` : `请选择${labels[key]}`;
    };
    const optionMarkup = (item, selected) => {
      const checked = selected.has(item.value);
      return `<button type="button" class="so-filter-option badge-advisor-option${checked ? ' is-selected' : ''}" data-ssb-option="${escape(item.value)}" role="option" aria-selected="${checked}"><span class="so-filter-check badge-advisor-option-check" aria-hidden="true">${checked ? '✓' : ''}</span><span class="so-filter-option-copy badge-advisor-option-copy"><strong>${escape(item.label)}</strong>${item.meta ? `<small>${escape(item.meta)}</small>` : ''}</span></button>`;
    };
    function menuMarkup(key) {
      const items = candidates(key), selected = new Set(selection(key));
      const allSelected = items.length > 0 && items.every(item => selected.has(item.value));
      const partial = !allSelected && items.some(item => selected.has(item.value));
      const markup = items.map(item => optionMarkup(item, selected)).join('');
      return `<div class="session-menu-panel so-filter-menu badge-advisor-menu so-business-menu" role="dialog" aria-label="${labels[key]}筛选">
        <form class="so-filter-search badge-advisor-search" role="search"><span aria-hidden="true"></span><input type="search" data-ssb-search aria-label="搜索${labels[key]}" placeholder="搜索${labels[key]}" value="${escape(query)}" autocomplete="off" spellcheck="false"></form>
        <button type="button" class="so-filter-all badge-advisor-select-all${allSelected ? ' is-selected' : partial ? ' is-partial' : ''}" data-ssb-all ${items.length ? '' : 'disabled'} aria-pressed="${allSelected}"><span class="so-filter-check badge-advisor-option-check" aria-hidden="true">${allSelected ? '✓' : ''}</span><span>全选</span><small>共 ${items.length} 条数据</small></button>
        <div class="so-filter-options badge-advisor-options" id="ssb-options-${key}" role="listbox" aria-label="${labels[key]}候选" aria-multiselectable="true">${markup || '<p class="so-filter-empty badge-advisor-empty">未找到匹配数据</p>'}</div>
      </div>`;
    }

    function positionMenu() {
      if (!openKey || destroyed) return;
      const control = slots[openKey], menu = control.querySelector('.so-business-menu');
      if (!menu) return;
      const bounds = control.getBoundingClientRect();
      const width = document.documentElement.clientWidth || window.innerWidth, height = window.innerHeight, margin = 16;
      if (bounds.bottom < 0 || bounds.top > height) { closeMenu(); return; }
      const menuWidth = Math.min(420, Math.max(0, width - margin * 2));
      const below = height - bounds.bottom - margin - 8, above = bounds.top - margin - 8;
      const opensAbove = below < 260 && above > below;
      menu.style.width = `${menuWidth}px`;
      menu.style.maxHeight = `${Math.max(0, Math.min(opensAbove ? above : below, height - margin * 2))}px`;
      menu.style.left = `${Math.max(margin, Math.min(bounds.left, width - menuWidth - margin)) - bounds.left}px`;
      menu.style.top = `${opensAbove ? -menu.offsetHeight - 8 : (bounds.height || bounds.bottom - bounds.top) + 8}px`;
    }

    function render({ scrollTop = 0 } = {}) {
      if (destroyed) return;
      keys.forEach(key => {
        const selected = selection(key), text = display(key);
        slots[key].classList.toggle('is-open', key === openKey);
        slots[key].innerHTML = `<span>${labels[key]}</span><button type="button" class="session-select-trigger${key === openKey ? ' active' : ''}" data-ssb-trigger="${key}" aria-label="${labels[key]}筛选" aria-haspopup="listbox" aria-controls="ssb-options-${key}" aria-expanded="${key === openKey}"><strong class="${selected.length ? '' : 'is-placeholder'}" title="${escape(text)}">${escape(text)}</strong><i class="session-select-caret" aria-hidden="true"></i></button>${key === openKey ? menuMarkup(key) : ''}`;
      });
      const list = root.querySelector('.so-filter-options');
      if (list) list.scrollTop = scrollTop;
      positionMenu();
    }

    function closeMenu({ restoreFocus = false } = {}) {
      if (!openKey) return;
      const key = openKey;
      openKey = ''; query = ''; pinnedIds = [];
      render();
      if (restoreFocus) slots[key].querySelector('[data-ssb-trigger]')?.focus({ preventScroll: true });
    }
    function openMenu(key, focusOption = '') {
      onBeforeOpen();
      openKey = key; query = ''; pinnedIds = selection(key);
      render();
      if (focusOption) {
        const items = slots[key].querySelectorAll('[data-ssb-option]');
        (focusOption === 'last' ? items[items.length - 1] : items[0])?.focus({ preventScroll: true });
      } else if (!window.matchMedia('(pointer: coarse)').matches) slots[key].querySelector('[data-ssb-search]')?.focus({ preventScroll: true });
    }
    function click(event) {
      const control = event.target.closest('[data-sales-business-control]');
      const fieldTrigger = control && !event.target.closest('.so-business-menu') && control.querySelector('[data-ssb-trigger]');
      const button = event.target.closest('button') || fieldTrigger;
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-ssb-trigger')) {
        const key = button.dataset.ssbTrigger;
        if (key === openKey) closeMenu({ restoreFocus: true }); else openMenu(key);
        return;
      }
      if (!openKey || (!button.hasAttribute('data-ssb-option') && !button.hasAttribute('data-ssb-all'))) return;
      const key = openKey, value = button.dataset.ssbOption;
      const selected = new Set(selection(key));
      if (value !== undefined) selected.has(value) ? selected.delete(value) : selected.add(value);
      else {
        const items = candidates(key), removing = items.every(item => selected.has(item.value));
        items.forEach(item => removing ? selected.delete(item.value) : selected.add(item.value));
      }
      const scrollTop = root.querySelector('.so-filter-options')?.scrollTop || 0;
      onChange(key, [...selected]);
      render({ scrollTop });
      const next = value === undefined ? root.querySelector('[data-ssb-all]')
        : [...root.querySelectorAll('[data-ssb-option]')].find(option => option.dataset.ssbOption === value);
      next?.focus({ preventScroll: true });
    }
    function search(input) {
      const start = input.selectionStart, end = input.selectionEnd;
      query = input.value; render();
      const next = root.querySelector('[data-ssb-search]');
      next?.focus({ preventScroll: true });
      if (start !== null && next?.setSelectionRange) next.setSelectionRange(start, end);
    }
    function input(event) { if (!composing && event.target.hasAttribute('data-ssb-search')) search(event.target); }
    function compositionStart(event) { if (event.target.hasAttribute('data-ssb-search')) composing = true; }
    function compositionEnd(event) { if (event.target.hasAttribute('data-ssb-search')) { composing = false; search(event.target); } }
    function submit(event) { if (event.target.classList.contains('so-filter-search')) event.preventDefault(); }
    function keydown(event) {
      if (event.key === 'Escape' && openKey) { event.preventDefault(); event.stopPropagation(); closeMenu({ restoreFocus: true }); return; }
      const trigger = event.target.closest('[data-ssb-trigger]');
      if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation(); openMenu(trigger.dataset.ssbTrigger, event.key === 'ArrowUp' ? 'last' : 'first'); return;
      }
      if (!openKey || !event.target.closest('.so-business-menu') || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      if (event.target.hasAttribute('data-ssb-search') && ['Home', 'End'].includes(event.key)) return;
      const items = [...root.querySelectorAll('[data-ssb-option]')];
      if (!items.length) return;
      event.preventDefault(); event.stopPropagation();
      const current = items.indexOf(event.target.closest('[data-ssb-option]'));
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : current < 0
        ? event.key === 'ArrowUp' ? items.length - 1 : 0 : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
      items[index].focus({ preventScroll: true }); items[index].scrollIntoView?.({ block: 'nearest' });
    }
    function outside(event) {
      if (openKey && (!root.contains(event.target) || !keys.some(key => slots[key].contains(event.target)))) closeMenu();
    }
    root.addEventListener('click', click);
    root.addEventListener('input', input);
    root.addEventListener('compositionstart', compositionStart);
    root.addEventListener('compositionend', compositionEnd);
    root.addEventListener('submit', submit);
    root.addEventListener('keydown', keydown);
    document.addEventListener('click', outside, true);
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    render();
    return {
      render, closeMenu,
      destroy() {
        destroyed = true;
        root.removeEventListener('click', click);
        root.removeEventListener('input', input);
        root.removeEventListener('compositionstart', compositionStart);
        root.removeEventListener('compositionend', compositionEnd);
        root.removeEventListener('submit', submit);
        root.removeEventListener('keydown', keydown);
        document.removeEventListener('click', outside, true);
        window.removeEventListener('resize', positionMenu);
        window.removeEventListener('scroll', positionMenu, true);
      }
    };
  }

  global.SalesBusinessSceneFilter = { mount };
})(window);
