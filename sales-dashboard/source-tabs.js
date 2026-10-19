(function (global) {
  'use strict';
  let pending = null;

  function mount(root) {
    const document = root.ownerDocument;
    const window = document.defaultView || global;
    const role = root.dataset.salesSource;
    const buttons = [...root.querySelectorAll('[data-route]')];
    const indicator = root.querySelector('.sales-source-indicator');
    const labels = root.querySelector('.sales-source-indicator-labels');
    const route = value => value === 'advisor' ? 'sales-advisor' : 'sales-dcc';
    const animations = [];
    buttons.forEach(button => {
      const active = button.dataset.route === route(role);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (pending?.to === role) {
      if (pending.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && indicator?.animate && labels?.animate) {
        const timing = { duration: 180, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' };
        animations.push(indicator.animate([
          { transform: `translateX(${pending.from === 'advisor' ? '100%' : '0'})` },
          { transform: `translateX(${role === 'advisor' ? '100%' : '0'})` }
        ], timing));
        animations.push(labels.animate([
          { transform: `translateX(${pending.from === 'advisor' ? '-50%' : '0'})` },
          { transform: `translateX(${role === 'advisor' ? '-50%' : '0'})` }
        ], timing));
      }
      if (pending.focus) buttons.find(button => button.dataset.route === route(role))?.focus({ preventScroll: true });
      pending = null;
    }
    function click(event) {
      const button = event.target.closest('[data-route]');
      if (!button || !root.contains(button)) return;
      const to = button.dataset.route === 'sales-advisor' ? 'advisor' : 'dcc';
      pending = to === role ? null : { from: role, to, animate: event.detail > 0, focus: event.detail === 0 };
    }
    function keydown(event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !event.target.closest('[data-route]')) return;
      event.preventDefault();
      const to = event.key === 'Home' ? 'dcc' : event.key === 'End' ? 'advisor' : role === 'dcc' ? 'advisor' : 'dcc';
      buttons.find(button => button.dataset.route === route(to))?.click();
    }
    root.addEventListener('click', click, true);
    root.addEventListener('keydown', keydown);
    return { destroy() {
      animations.forEach(animation => animation.cancel());
      root.removeEventListener('click', click, true);
      root.removeEventListener('keydown', keydown);
    } };
  }

  global.SalesSourceTabs = { mount };
})(window);
