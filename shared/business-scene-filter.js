(function () {
  'use strict';

  const pickerSelector = 'details[data-business-scene-picker]';
  const fieldSelector = '[data-business-scene-filter]';
  const menuSelector = '.business-scene-menu[data-business-scene-floating]';
  const isOpen = menu => menu.closest(pickerSelector)?.open || menu.classList.contains('open');

  function close(menu, restoreFocus = false) {
    const picker = menu.closest(pickerSelector), field = menu.closest(fieldSelector);
    if (picker) picker.open = false;
    else menu.classList.remove('open');
    const trigger = field.querySelector('.business-scene-trigger');
    if (trigger.tagName !== 'SUMMARY') trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  function position(menu) {
    const field = menu.closest(fieldSelector), bounds = field.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth;
    const margin = 16, gap = 8, menuWidth = Math.min(420, width - margin * 2);
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) { close(menu); return; }
    const below = window.innerHeight - bounds.bottom - margin - gap;
    const above = bounds.top - margin - gap;
    const opensAbove = below < 260 && above > below;
    menu.style.width = `${menuWidth}px`;
    menu.style.maxHeight = `${Math.max(0, Math.min(420, opensAbove ? above : below))}px`;
    menu.style.left = `${Math.max(margin, Math.min(bounds.left, width - menuWidth - margin))}px`;
    menu.style.right = 'auto';
    menu.style.top = `${opensAbove ? bounds.top - gap - menu.offsetHeight : bounds.bottom + gap}px`;
  }

  function sync() {
    document.querySelectorAll(menuSelector).forEach(menu => {
      const trigger = menu.closest(fieldSelector).querySelector('.business-scene-trigger');
      if (trigger.tagName !== 'SUMMARY') trigger.setAttribute('aria-expanded', String(isOpen(menu)));
      if (isOpen(menu)) position(menu);
    });
  }

  document.addEventListener('toggle', event => {
    if (!event.target.matches(pickerSelector) || !event.target.open) return;
    document.querySelectorAll(menuSelector).forEach(menu => {
      if (!event.target.contains(menu) && isOpen(menu)) close(menu);
    });
    const menu = event.target.querySelector(menuSelector);
    position(menu);
    if (!window.matchMedia('(pointer: coarse)').matches) menu.querySelector('[data-business-scene-search]')?.focus({ preventScroll: true });
  }, true);

  document.addEventListener('click', event => {
    document.querySelectorAll(menuSelector).forEach(menu => {
      if (isOpen(menu) && !menu.closest(fieldSelector).contains(event.target)) close(menu);
    });
    sync();
    requestAnimationFrame(sync);
  });

  document.addEventListener('input', event => {
    if (!event.target.matches('[data-business-scene-search]')) return;
    const menu = event.target.closest(menuSelector), query = event.target.value.trim().toLocaleLowerCase('zh-CN');
    const options = [...menu.querySelectorAll('[data-business-scene-option]')];
    options.forEach(option => { option.hidden = !option.textContent.toLocaleLowerCase('zh-CN').includes(query); });
    menu.querySelectorAll('.business-scene-group').forEach(group => {
      group.hidden = ![...group.querySelectorAll('[data-business-scene-option]')].some(option => !option.hidden);
    });
    const empty = menu.querySelector('.business-scene-empty');
    if (empty) empty.hidden = options.some(option => !option.hidden);
    position(menu);
  });

  document.addEventListener('keydown', event => {
    const field = event.target.closest(fieldSelector);
    const menu = field?.querySelector(menuSelector);
    if (!menu || !isOpen(menu)) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(menu, true); return; }
    if (['Enter', ' '].includes(event.key) && event.target.matches('div[data-business-scene-option]')) {
      event.preventDefault(); event.target.click(); return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    if (event.target.matches('input[type="search"]') && ['Home', 'End'].includes(event.key)) return;
    const options = [...menu.querySelectorAll('[data-business-scene-option]')].filter(option => !option.hidden);
    if (!options.length) return;
    event.preventDefault(); event.stopPropagation();
    const current = options.indexOf(event.target.closest('[data-business-scene-option]'));
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : current < 0
      ? event.key === 'ArrowUp' ? options.length - 1 : 0 : (current + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
    (options[index].hasAttribute('tabindex') ? options[index] : options[index].querySelector('input') || options[index]).focus({ preventScroll: true });
    options[index].scrollIntoView({ block: 'nearest' });
  }, true);
  window.addEventListener('resize', sync);
  window.addEventListener('scroll', sync, true);
})();
