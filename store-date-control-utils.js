(function (global, factory) {
  const sharedUtils = global.__dateFilterComponentUtils || (() => {
    if (typeof require !== 'function') {
      return null;
    }
    try {
      return require('./date-filter-component-utils.js');
    } catch (error) {
      return null;
    }
  })();
  const api = factory(sharedUtils || {});
  global.__storeDateControlUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function ({ renderDateRangeControlMarkup } = {}) {
  const renderSharedDateRangeControlMarkup = typeof renderDateRangeControlMarkup === 'function'
    ? renderDateRangeControlMarkup
    : function fallbackRenderDateRangeControlMarkup({
      currentValue,
      customValue = 'custom',
      isOpen = false,
      startLabel,
      endLabel,
      dataNamespace = 'store-date',
      rootClassName = 'store-date-root',
      triggerClassName = 'session-date-trigger store-date-trigger',
      triggerLabel = '日期范围筛选',
      menuHtml = ''
    }) {
      if (currentValue !== customValue) {
        return '';
      }

      return `
        <div class="${rootClassName}${isOpen ? ' is-open' : ''}" data-${dataNamespace}-root="true">
          <button
            type="button"
            class="${triggerClassName}${isOpen ? ' active' : ''}"
            data-${dataNamespace}-trigger="true"
            aria-label="${triggerLabel}"
            aria-haspopup="dialog"
            aria-expanded="${isOpen ? 'true' : 'false'}"
          >
            <strong>${startLabel || '未选择'}</strong>
            <em>至</em>
            <strong>${endLabel || '未选择'}</strong>
            <span class="session-date-icon" aria-hidden="true"></span>
          </button>
          ${isOpen ? String(menuHtml || '') : ''}
        </div>
      `;
    };

  function renderStoreDateControlMarkup({ currentTime, isOpen, startLabel, endLabel, menuHtml }) {
    return renderSharedDateRangeControlMarkup({
      currentValue: currentTime,
      customValue: 'custom',
      isOpen,
      startLabel,
      endLabel,
      dataNamespace: 'store-date',
      rootClassName: 'store-date-root',
      triggerClassName: 'session-date-trigger store-date-trigger',
      triggerLabel: '日期范围筛选',
      menuHtml
    });
  }

  return {
    renderStoreDateControlMarkup
  };
});
