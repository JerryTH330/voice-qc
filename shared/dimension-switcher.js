(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DimensionSwitcher = api;
})(typeof window === 'undefined' ? globalThis : window, function (host) {
  'use strict';

  const motion = new WeakMap();
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const windowFor = container => container.ownerDocument?.defaultView || host;

  function render({ namespace, mode, label, path, panelId = '' }) {
    const geography = mode === 'geography';
    const steps = path || (geography ? ['品牌', '省份', '城市', '门店'] : ['品牌', '大区', '战区', '门店']);
    const pathMarkup = steps.map((text, index) => `${index ? '<i class="session-select-caret dimension-switcher__arrow" aria-hidden="true"></i>' : ''}<span class="dimension-switcher__step${index === 1 || index === 2 ? ' is-specific' : ''}">${escape(text)}</span>`).join('');
    return `<div class="dimension-switcher" data-dimension-switcher data-dimension-namespace="${escape(namespace)}" data-dimension-mode="${geography ? 'geography' : 'organization'}">
      <div class="dimension-switcher__tabs" role="tablist" aria-label="${escape(label)}">
        <span class="dimension-switcher__indicator" aria-hidden="true"><span class="dimension-switcher__indicator-labels"><span>组织维度</span><span>地理维度</span></span></span>
        ${[['organization', '组织维度'], ['geography', '地理维度']].map(([value, text]) => {
          const active = value === (geography ? 'geography' : 'organization');
          return `<button id="${escape(namespace)}-dimension-${value}" type="button" class="dimension-switcher__tab${active ? ' active' : ''}" data-dimension-option="${value}" data-${escape(namespace)}-dimension="${value}" role="tab" aria-selected="${active}"${panelId ? ` aria-controls="${escape(panelId)}"` : ''} tabindex="${active ? '0' : '-1'}">${text}</button>`;
        }).join('')}
      </div>
      <div class="dimension-switcher__path"><img src="../assets/filter-path-icon.svg" alt="" aria-hidden="true"><span class="dimension-switcher__path-label">${geography ? '地理路径' : '组织路径'}：</span><strong title="${escape(steps.join(' / '))}">${pathMarkup}</strong></div>
      <span class="dimension-switcher__feedback" data-dimension-feedback role="status" aria-live="polite" aria-atomic="true"></span>
    </div>`;
  }

  function sync(container) {
    if (!container) return;
    const previous = motion.get(container);
    if (previous) {
      previous.animations.forEach(animation => animation.cancel());
      windowFor(container).clearTimeout(previous.timer);
    }
    motion.set(container, { animations: [], timer: null });
    const active = container.querySelector('[data-dimension-option][aria-selected="true"]');
    const panelId = active?.getAttribute('aria-controls');
    const panel = panelId && (container.ownerDocument || host.document)?.getElementById(panelId);
    if (panel) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', active.id);
    }
  }

  function change(container, { from, mode, event, fields = [], cleared = false }) {
    if (!container || from === mode) return;
    const window = windowFor(container);
    sync(container);
    const state = motion.get(container);
    const feedback = container.querySelector('[data-dimension-feedback]');
    if (cleared && feedback) {
      feedback.textContent = `已切换至${mode === 'geography' ? '地理' : '组织'}维度，原路径条件已清除`;
      state.timer = window.setTimeout(() => {
        if (motion.get(container) === state) feedback.textContent = '';
      }, 3000);
    }
    container.querySelector(`[data-dimension-option="${mode}"]`)?.focus({ preventScroll: true });
    if (!(event?.detail > 0) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const indicator = container.querySelector('.dimension-switcher__indicator');
    const labels = container.querySelector('.dimension-switcher__indicator-labels');
    const timing = { duration: 180, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' };
    if (indicator?.animate && labels?.animate) {
      state.animations.push(indicator.animate([
        { transform: `translateX(${from === 'geography' ? '100%' : '0'})` },
        { transform: `translateX(${mode === 'geography' ? '100%' : '0'})` }
      ], timing));
      state.animations.push(labels.animate([
        { transform: `translateX(${from === 'geography' ? '-50%' : '0'})` },
        { transform: `translateX(${mode === 'geography' ? '-50%' : '0'})` }
      ], timing));
    }
    fields.forEach(field => {
      if (field?.animate) state.animations.push(field.animate(
        [{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      ));
    });
  }

  function handleKeydown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return false;
    const option = event.target.closest('[data-dimension-option]');
    const group = option?.closest('[data-dimension-switcher]');
    if (!group) return false;
    event.preventDefault();
    const next = event.key === 'Home' ? 'organization' : event.key === 'End' ? 'geography'
      : option.dataset.dimensionOption === 'organization' ? 'geography' : 'organization';
    const document = option.ownerDocument || host.document;
    document.querySelector(`[data-${group.dataset.dimensionNamespace}-dimension="${next}"]`)?.click();
    document.getElementById(`${group.dataset.dimensionNamespace}-dimension-${next}`)?.focus({ preventScroll: true });
    return true;
  }

  if (host.document) host.document.addEventListener('keydown', event => {
    if (handleKeydown(event)) event.stopImmediatePropagation();
  });

  return { render, sync, change, handleKeydown };
});
