(function (host, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../../date-filter-component-utils.js'));
  else host.InsightDateRange = factory(host.__dateFilterComponentUtils);
})(typeof window === 'object' ? window : this, function (dateUtils) {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  function addMonths(value, delta) {
    const [year, month, date] = value.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1 + delta, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-${pad(Math.min(date, last))}`;
  }
  const localDateValue = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  function preset(key, latest) {
    const range = dateUtils.getDateShortcutRange(key, new Date(latest + 'T12:00:00'));
    return range ? { start: localDateValue(range.startDate), end: localDateValue(range.endDate) } : null;
  }
  function create({ start, end, min, max }) {
    const monthOf = value => value.slice(0, 7) + '-01';
    const state = { start, end, activeField: 'startDate', month: monthOf(start), hover: '' };
    function canNavigate(delta) {
      const next = addMonths(state.month, delta);
      return next >= monthOf(min) && next <= monthOf(max);
    }
    function navigate(delta) {
      if (!canNavigate(delta)) return false;
      state.month = addMonths(state.month, delta);
      state.hover = '';
      return true;
    }
    function reveal(value) {
      if (!value || value < min || value > max) return false;
      state.month = monthOf(value);
      return true;
    }
    function selectField(field) {
      if (field !== 'startDate' && field !== 'endDate') return;
      state.activeField = field;
      state.hover = '';
      reveal(field === 'endDate' && state.end ? state.end : state.start);
    }
    function pick(value) {
      if (!value || value < min || value > max) return null;
      state.hover = '';
      if (state.activeField === 'startDate') {
        state.start = value;
        state.end = '';
        state.activeField = 'endDate';
        return null;
      }
      const range = { start: value < state.start ? value : state.start, end: value < state.start ? state.start : value };
      Object.assign(state, range, { activeField: 'startDate' });
      return range;
    }
    function availablePreset(key) {
      const range = preset(key, max);
      if (!range || range.end < min) return null;
      return { start: range.start < min ? min : range.start, end: range.end };
    }
    function choosePreset(key) {
      const range = availablePreset(key);
      if (!range) return null;
      Object.assign(state, range, { activeField: 'startDate', hover: '' });
      reveal(range.start);
      return range;
    }
    function hover(value) {
      if (state.end || state.activeField !== 'endDate' || state.hover === value || value < min || value > max) return false;
      state.hover = value;
      return true;
    }
    function inRange(value) {
      const last = state.end || state.hover || state.start;
      return value >= state.start && value <= last || value >= last && value <= state.start;
    }
    function render(focusDay) {
      const [year, month] = state.month.split('-').map(Number);
      const offset = (new Date(state.month + 'T00:00:00Z').getUTCDay() + 6) % 7;
      const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const selectedDay = state.activeField === 'endDate' && state.end ? state.end : state.start;
      const firstDay = state.month < min ? min : state.month;
      const focus = focusDay || (monthOf(selectedDay) === state.month ? selectedDay : firstDay);
      const cells = Array(offset).fill(null);
      for (let index = 1; index <= count; index++) {
        const value = state.month.slice(0, 8) + pad(index);
        cells.push({
          day: index, value, label: value, tabIndex: value === focus ? 0 : -1,
          isDisabled: value < min || value > max, inRange: inRange(value),
          isStart: value === state.start, isEnd: value === state.end, isToday: value === max
        });
      }
      return dateUtils.renderDateRangePanelMarkup({
        dataNamespace: 'range',
        panelClassName: 'session-menu-panel session-menu-panel-date fo-date-panel',
        title: '线索下发时间', rangeText: state.start + ' 至 ' + (state.end || '待选择'),
        monthLabel: year + '年' + month + '月', activeField: state.activeField,
        startLabel: state.start, endLabel: state.end || '请选择', cells,
        disablePrevMonth: !canNavigate(-1), disableNextMonth: !canNavigate(1),
        summaryText: state.end ? '已选择 ' + state.start + ' 至 ' + state.end : '请选择结束日期',
        applyDisabled: !state.end,
        shortcuts: dateUtils.dateShortcuts.map(({ key, label }) => {
          const range = availablePreset(key);
          return { key, label, disabled: !range, active: !!range && range.start === state.start && range.end === state.end };
        })
      });
    }
    return { state, pick, preset: choosePreset, hover, inRange, navigate, reveal, selectField, render };
  }
  return { addMonths, preset, create };
});
