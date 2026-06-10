(function (global, factory) {
  const api = factory();
  global.__factoryMultiSelectFilterUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderAttrs(attrs) {
    if (!attrs || typeof attrs !== 'object') {
      return '';
    }

    return Object.entries(attrs).map(([key, value]) => {
      if (value === false || value === null || typeof value === 'undefined') {
        return '';
      }

      if (value === true) {
        return ` ${escapeHtml(key)}`;
      }

      return ` ${escapeHtml(key)}="${escapeHtml(value)}"`;
    }).join('');
  }

  function renderCheckboxFilterOptionsMarkup({
    options = [],
    buttonClassName = '',
    checkClassName = '',
    textClassName = '',
    getOptionMeta
  }) {
    return (Array.isArray(options) ? options : []).map((option, index) => {
      const safeOption = option || {};
      const meta = typeof getOptionMeta === 'function' ? (getOptionMeta(safeOption, index) || {}) : {};
      const className = [buttonClassName, meta.className].filter(Boolean).join(' ').trim();
      const label = safeOption.label ?? safeOption.text ?? safeOption.value ?? '';

      return `
        <button type="button" class="${escapeHtml(className)}"${renderAttrs(meta.attrs)}>
          <span class="${escapeHtml(checkClassName)}" aria-hidden="true"></span>
          <span class="${escapeHtml(textClassName)}">${escapeHtml(label)}</span>
        </button>
      `;
    }).join('');
  }

  function renderInlineCheckboxFilterGroupMarkup({
    rootClassName = '',
    label = '',
    labelClassName = '',
    tabsId = '',
    tabsClassName = '',
    tabsAriaLabel = '',
    optionsMarkup = ''
  }) {
    return `
      <div class="${escapeHtml(rootClassName)}">
        <span class="${escapeHtml(labelClassName)}">${escapeHtml(label)}</span>
        <div class="${escapeHtml(tabsClassName)}" id="${escapeHtml(tabsId)}" role="group" aria-label="${escapeHtml(tabsAriaLabel || label)}">
          ${String(optionsMarkup || '')}
        </div>
      </div>
    `;
  }

  function renderStackedCheckboxFilterGroupMarkup({
    rowClassName = '',
    headClassName = '',
    title = '',
    titleClassName = '',
    summaryText = '',
    summaryClassName = '',
    tabsClassName = '',
    optionsMarkup = '',
    hideSummary = false
  }) {
    return `
      <div class="${escapeHtml(rowClassName)}">
        <div class="${escapeHtml(headClassName)}">
          <span class="${escapeHtml(titleClassName)}">${escapeHtml(title)}</span>
          <span class="${escapeHtml(summaryClassName)}"${hideSummary ? ' hidden' : ''}>${escapeHtml(summaryText)}</span>
        </div>
        <div class="${escapeHtml(tabsClassName)}">
          ${String(optionsMarkup || '')}
        </div>
      </div>
    `;
  }

  return {
    renderCheckboxFilterOptionsMarkup,
    renderInlineCheckboxFilterGroupMarkup,
    renderStackedCheckboxFilterGroupMarkup
  };
});
