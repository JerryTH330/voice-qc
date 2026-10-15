(function (host, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else host.ListSummaryCounters = api.createController(host);
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const formatNumber = (value, { decimals = 0, suffix = '', grouping = false } = {}) =>
    `${value.toLocaleString('zh-CN', { useGrouping: grouping, minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  function createController(host) {
    const groups = new Map();
    const reducedMotion = host.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = null;
    let visibilityFrame = null;

    function visible(root) {
      return root?.isConnected && !host.document.hidden
        && !host.document.querySelector('.unified-content-frame.is-visible')
        && !root.closest('[hidden], [inert], [aria-hidden="true"], dialog:not([open])')
        && root.getClientRects().length > 0
        && host.getComputedStyle(root).visibility !== 'hidden';
    }

    function paint(metric, value) {
      metric.current = value;
      const text = Number.isFinite(value)
        ? metric.format(value)
        : metric.placeholder;
      if (metric.node.textContent !== text) metric.node.textContent = text;
    }

    function settle(metric) {
      metric.animation = null;
      paint(metric, metric.target);
    }

    function animate(metric, from, index) {
      if (!Number.isFinite(metric.target) || reducedMotion.matches || from === metric.target) {
        settle(metric);
        return;
      }
      metric.animation = { from, start: null, delay: 80 + index * 55 };
      paint(metric, from);
    }

    function sync(group) {
      const shown = visible(group.root);
      const scope = group.root?.closest('dialog, .modal-backdrop, .badge-record-drawer, .page-panel');
      const context = `${host.location.pathname}${host.location.hash}|${group.context || ''}`;
      const entering = shown && (!group.visible || context !== group.contextKey || scope !== group.scope);
      group.visible = shown;
      group.contextKey = context;
      group.scope = scope;
      group.metrics.forEach((metric, index) => {
        if (!shown || reducedMotion.matches) settle(metric);
        else if (entering) animate(metric, 0, index);
        else if (metric.changed) animate(metric, Number.isFinite(metric.current) ? metric.current : 0, index);
        else paint(metric, metric.current);
        metric.changed = false;
      });
      requestTick();
    }

    function tick(timestamp) {
      animationFrame = null;
      groups.forEach(group => group.metrics.forEach(metric => {
        const animation = metric.animation;
        if (!animation) return;
        if (animation.start === null) animation.start = timestamp + animation.delay;
        const progress = Math.max(0, Math.min((timestamp - animation.start) / 920, 1));
        const eased = 1 - (1 - progress) ** 3;
        paint(metric, animation.from + (metric.target - animation.from) * eased);
        if (progress === 1) settle(metric);
      }));
      requestTick();
    }

    function requestTick() {
      if (animationFrame !== null) return;
      if ([...groups.values()].some(group => group.metrics.some(metric => metric.animation))) {
        animationFrame = host.requestAnimationFrame(tick);
      }
    }

    function refresh() {
      groups.forEach(sync);
    }

    function scheduleRefresh() {
      if (visibilityFrame !== null) return;
      visibilityFrame = host.requestAnimationFrame(() => {
        visibilityFrame = null;
        refresh();
      });
    }

    function update(key, entries, { root, context = '' } = {}) {
      const previous = groups.get(key);
      const metrics = entries.map((entry, index) => {
        const node = entry.node || host.document.getElementById(entry.id);
        if (!node) return null;
        const old = previous?.metrics[index];
        const metric = old || { current: 0, target: undefined, animation: null };
        metric.changed = !old || !Object.is(metric.target, entry.value);
        metric.target = entry.value;
        metric.node = node;
        metric.format = entry.format || (value => formatNumber(value, entry));
        metric.placeholder = entry.placeholder || '—';
        node.style.fontVariantNumeric = 'tabular-nums';
        node.setAttribute('aria-label', Number.isFinite(entry.value) ? metric.format(entry.value) : metric.placeholder);
        return metric;
      }).filter(Boolean);
      if (!metrics.length) return;
      const group = previous || { visible: false };
      Object.assign(group, { metrics, root: root || metrics[0].node.parentElement, context });
      groups.set(key, group);
      sync(group);
    }

    const observer = new host.MutationObserver(records => {
      if (records.some(record => [...groups.values()].some(group =>
        !group.root.isConnected || record.target === group.root || record.target.contains(group.root)))) scheduleRefresh();
    });
    observer.observe(host.document.body, { subtree: true, childList: true, attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'inert', 'aria-hidden', 'open'] });
    host.addEventListener('hashchange', scheduleRefresh);
    host.addEventListener('pageshow', scheduleRefresh);
    host.document.addEventListener('visibilitychange', scheduleRefresh);
    reducedMotion.addEventListener('change', refresh);

    function destroy() {
      observer.disconnect();
      host.removeEventListener('hashchange', scheduleRefresh);
      host.removeEventListener('pageshow', scheduleRefresh);
      host.document.removeEventListener('visibilitychange', scheduleRefresh);
      reducedMotion.removeEventListener('change', refresh);
      if (animationFrame !== null) host.cancelAnimationFrame(animationFrame);
      if (visibilityFrame !== null) host.cancelAnimationFrame(visibilityFrame);
      groups.clear();
    }

    return { update, refresh, destroy };
  }

  return { createController, formatNumber };
});
