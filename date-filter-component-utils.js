(function (global, factory) {
  const api = factory();
  global.__dateFilterComponentUtils = api;
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

  function getDataAttrName(namespace, suffix) {
    return `data-${namespace}-${suffix}`;
  }

  function renderDateRangeControlMarkup({
    currentValue,
    customValue = 'custom',
    isOpen = false,
    startLabel,
    endLabel,
    dataNamespace = 'session-date',
    rootClassName = 'store-date-root',
    triggerClassName = 'session-date-trigger',
    triggerLabel = '日期范围筛选',
    menuHtml = ''
  }) {
    if (currentValue !== customValue) {
      return '';
    }

    return `
      <div class="${escapeHtml(rootClassName)}${isOpen ? ' is-open' : ''}" ${getDataAttrName(dataNamespace, 'root')}="true">
        <button
          type="button"
          class="${escapeHtml(triggerClassName)}${isOpen ? ' active' : ''}"
          ${getDataAttrName(dataNamespace, 'trigger')}="true"
          aria-label="${escapeHtml(triggerLabel)}"
          aria-haspopup="dialog"
          aria-expanded="${isOpen ? 'true' : 'false'}"
        >
          <strong>${escapeHtml(startLabel || '未选择')}</strong>
          <em>至</em>
          <strong>${escapeHtml(endLabel || '未选择')}</strong>
          <span class="session-date-icon" aria-hidden="true"></span>
        </button>
        ${isOpen ? String(menuHtml || '') : ''}
      </div>
    `;
  }

  function renderDateRangePanelMarkup({
    dataNamespace = 'session-date',
    rangeText = '',
    monthLabel = '',
    activeField = 'startDate',
    startLabel = '',
    endLabel = '',
    disablePrevMonth = false,
    disableNextMonth = false,
    cells = [],
    shortcuts = [],
    summaryText = '',
    panelClassName = 'session-menu-panel session-menu-panel-date',
    panelStyle = '',
    title = '日期范围',
    startFieldLabel = '开始日期',
    endFieldLabel = '结束日期',
    cancelLabel = '取消',
    showCancel = true,
    applyLabel = '应用日期'
  }) {
    const safeSummaryText = summaryText || `已选择 ${rangeText}`;
    const safeCells = Array.isArray(cells) ? cells : [];
    const safeShortcuts = Array.isArray(shortcuts) ? shortcuts : [];
    const panelStyleAttr = panelStyle ? ` style="${escapeHtml(panelStyle)}"` : '';

    return `
      <div class="${escapeHtml(panelClassName)}"${panelStyleAttr}>
        <div class="session-date-panel-head">
          <div class="session-date-panel-copy">
            <span>${escapeHtml(title)}</span>
            <strong>${escapeHtml(rangeText)}</strong>
          </div>
          <div class="session-date-nav">
            <button type="button" class="session-date-nav-btn" ${getDataAttrName(dataNamespace, 'nav')}="-1" aria-label="上一个月"${disablePrevMonth ? ' disabled' : ''}>
              <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
            </button>
            <strong>${escapeHtml(monthLabel)}</strong>
            <button type="button" class="session-date-nav-btn" ${getDataAttrName(dataNamespace, 'nav')}="1" aria-label="下一个月"${disableNextMonth ? ' disabled' : ''}>
              <i class="session-date-nav-arrow next" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="session-date-tabs">
          <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" ${getDataAttrName(dataNamespace, 'field')}="startDate">
            <span>${escapeHtml(startFieldLabel)}</span>
            <strong>${escapeHtml(startLabel)}</strong>
          </button>
          <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" ${getDataAttrName(dataNamespace, 'field')}="endDate">
            <span>${escapeHtml(endFieldLabel)}</span>
            <strong>${escapeHtml(endLabel)}</strong>
          </button>
        </div>
        <div class="session-date-weekdays">
          <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
        </div>
        <div class="session-date-grid">
          ${safeCells.map((cell) => {
            if (!cell) {
              return '<span class="session-date-empty" aria-hidden="true"></span>';
            }

            const classNames = ['session-date-day'];
            if (cell.isDisabled) classNames.push('is-disabled');
            if (cell.inRange) classNames.push('in-range');
            if (cell.isStart) classNames.push('is-start');
            if (cell.isEnd) classNames.push('is-end');
            if (cell.isToday) classNames.push('is-today');

            return `
              <button
                type="button"
                class="${classNames.join(' ')}"
                ${cell.isDisabled ? 'disabled' : `${getDataAttrName(dataNamespace, 'value')}="${escapeHtml(cell.value)}"`}
              >
                ${escapeHtml(cell.day)}
              </button>
            `;
          }).join('')}
        </div>
        <div class="session-date-shortcuts">
          ${safeShortcuts.map((option) => `
            <button type="button" class="session-date-shortcut" ${getDataAttrName(dataNamespace, 'shortcut')}="${escapeHtml(option.key)}">${escapeHtml(option.label)}</button>
          `).join('')}
        </div>
        <div class="session-cascader-footer session-date-footer">
          <span>${escapeHtml(safeSummaryText)}</span>
          <div class="session-date-actions">
            ${showCancel ? `<button type="button" class="btn session-date-action-btn" ${getDataAttrName(dataNamespace, 'cancel')}="true">${escapeHtml(cancelLabel)}</button>` : ''}
            <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" ${getDataAttrName(dataNamespace, 'apply')}="true">${escapeHtml(applyLabel)}</button>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderDateRangeControlMarkup,
    renderDateRangePanelMarkup
  };
});
