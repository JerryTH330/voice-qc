(function (host, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else host.InsightDateRange = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const iso = date => date.toISOString().slice(0, 10);
  const day = (value, delta) => iso(new Date(Date.parse(value + 'T00:00:00Z') + delta * 86400000));
  function addMonths(value, delta) {
    const [year, month, date] = value.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1 + delta, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-${pad(Math.min(date, last))}`;
  }
  const presets = [['month', '本月'], ['lastMonth', '上个月'], ['1m', '近1月'], ['3m', '近3月'], ['6m', '近半年']];
  function preset(key, latest) {
    if (key === 'month') return { start: latest.slice(0, 7) + '-01', end: latest };
    if (key === 'lastMonth') {
      const thisMonth = latest.slice(0, 7) + '-01';
      return { start: addMonths(thisMonth, -1), end: day(thisMonth, -1) };
    }
    const months = { '6m': 6, '3m': 3, '1m': 1 }[key];
    return months ? { start: addMonths(latest, -months), end: latest } : null;
  }
  const arrow = (direction, double) => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${direction < 0 ? 'M12 5 7 10l5 5' : 'M8 5l5 5-5 5'}${double ? direction < 0 ? ' M17 5l-5 5 5 5' : ' M3 5l5 5-5 5' : ''}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function create({ start, end, min, max }) {
    const minimumMonth = min.slice(0, 7) + '-01';
    const maximumMonth = addMonths(max.slice(0, 7) + '-01', -1);
    const state = { start, end, selectingEnd: false, hover: '', month: addMonths(end.slice(0, 7) + '-01', -1) };
    state.month = state.month < minimumMonth ? minimumMonth : state.month;
    function canNavigate(delta) {
      const next = addMonths(state.month, delta);
      return next >= minimumMonth && next <= maximumMonth;
    }
    function navigate(delta) { if (!canNavigate(delta)) return false; state.month = addMonths(state.month, delta); return true; }
    function pick(value) {
      if (value < min || value > max) return null;
      if (!state.selectingEnd) { state.start = value; state.end = ''; state.hover = ''; state.selectingEnd = true; return null; }
      const range = { start: value < state.start ? value : state.start, end: value < state.start ? state.start : value };
      state.start = range.start; state.end = range.end; state.selectingEnd = false; state.hover = '';
      return range;
    }
    function choosePreset(key) {
      const range = preset(key, max);
      if (!range) return null;
      range.start = range.start < min ? min : range.start;
      state.start = range.start; state.end = range.end; state.selectingEnd = false; state.hover = '';
      return range;
    }
    function hover(value) {
      if (!state.selectingEnd || value === state.hover || value < min || value > max) return false;
      state.hover = value; return true;
    }
    function reveal(value) {
      if (value < min || value > max) return false;
      const month = value.slice(0,7) + '-01';
      if (month < state.month || month > addMonths(state.month,1)) state.month = month > maximumMonth ? maximumMonth : month < minimumMonth ? minimumMonth : month;
      return true;
    }
    function render() {
      const previewEnd = state.end || state.hover || state.start;
      const from = previewEnd < state.start ? previewEnd : state.start;
      const to = previewEnd < state.start ? state.start : previewEnd;
      const visibleEnd = addMonths(state.month,2);
      const focusDate = state.start >= state.month && state.start < visibleEnd ? state.start : state.end >= state.month && state.end < visibleEnd ? state.end : state.month < min ? min : state.month;
      const nav = (delta, label, double) => `<button type="button" class="ci-range-nav" data-range-nav="${delta}" aria-label="${label}" ${canNavigate(delta) ? '' : 'disabled'}>${arrow(delta, double)}</button>`;
      function monthPanel(index) {
        const month = addMonths(state.month, index), [year, number] = month.split('-').map(Number);
        const offset = new Date(month + 'T00:00:00Z').getUTCDay();
        const first = day(month, -offset);
        const weeks = Array.from({ length: 6 }, (_, week) => `<div class="ci-range-week" role="row">${Array.from({ length: 7 }, (_, weekday) => {
          const value = day(first, week * 7 + weekday), ownMonth = value.slice(0,7) === month.slice(0,7), disabled = value < min || value > max;
          const start = value === from, end = value === to, selected = value >= from && value <= to;
          const classes = `ci-range-cell${selected && ownMonth && !disabled ? ' is-in-range' : ''}${start && ownMonth ? ' is-start' : ''}${end && ownMonth ? ' is-end' : ''}${!ownMonth ? ' is-outside' : ''}`;
          return `<div class="${classes}" role="gridcell" aria-selected="${selected && ownMonth && !disabled}">${ownMonth ? `<button type="button" data-range-day="${value}" aria-label="${value}" aria-pressed="${(start || end) && !disabled}" tabindex="${value === focusDate ? '0' : '-1'}" ${disabled ? 'disabled' : ''}>${Number(value.slice(8))}</button>` : `<span aria-hidden="true">${Number(value.slice(8))}</span>`}</div>`;
        }).join('')}</div>`).join('');
        return `<section class="ci-range-month" aria-label="${year}年${number}月"><header><div>${index === 0 ? nav(-12, '上一年', true) + nav(-1, '上个月', false) : ''}</div><strong aria-live="polite">${year} 年 ${number} 月</strong><div>${index === 1 ? nav(1, '下个月', false) + nav(12, '下一年', true) : ''}</div></header><div role="grid" aria-label="${year}年${number}月日期"><div class="ci-range-week ci-range-weekdays" role="row">${['日','一','二','三','四','五','六'].map(label => `<span role="columnheader">${label}</span>`).join('')}</div>${weeks}</div></section>`;
      }
      return `<nav class="ci-range-shortcuts" aria-label="日期快捷筛选">${presets.map(([key,label]) => {
        const range = preset(key, max), active = !state.selectingEnd && range.start === state.start && range.end === state.end;
        return `<button type="button" data-range-preset="${key}" class="${active ? 'is-active' : ''}" aria-pressed="${active}">${label}</button>`;
      }).join('')}</nav><div class="ci-range-content"><div class="ci-range-months">${monthPanel(0)}${monthPanel(1)}</div><footer><span role="status" aria-live="polite">${state.selectingEnd ? `${state.start} → 请选择结束日期` : `${state.start} — ${state.end}`}</span><button class="ci-text" type="button" id="cancelDate">取消</button></footer></div>`;
    }
    return { state, pick, preset: choosePreset, hover, navigate, canNavigate, reveal, render };
  }
  return { addMonths, day, presets, preset, create };
});
