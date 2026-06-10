const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderCheckboxFilterOptionsMarkup,
  renderInlineCheckboxFilterGroupMarkup,
  renderStackedCheckboxFilterGroupMarkup
} = require('../factory-multi-select-filter-utils.js');

test('renderCheckboxFilterOptionsMarkup renders active and indeterminate option states', () => {
  const html = renderCheckboxFilterOptionsMarkup({
    options: [
      { value: 'all', label: '全部' },
      { value: 'first_follow', label: '首触跟进' }
    ],
    buttonClassName: 'gf-tab todo-filter-tab',
    checkClassName: 'filter-check',
    textClassName: 'filter-text',
    getOptionMeta(option) {
      if (option.value === 'all') {
        return {
          className: 'active is-indeterminate',
          attrs: {
            'data-scene': option.value,
            'aria-checked': 'mixed'
          }
        };
      }

      return {
        attrs: {
          'data-scene': option.value,
          'aria-checked': 'true'
        }
      };
    }
  });

  assert.match(html, /class="gf-tab todo-filter-tab active is-indeterminate"/);
  assert.match(html, /data-scene="all"/);
  assert.match(html, /aria-checked="mixed"/);
  assert.match(html, /<span class="filter-check" aria-hidden="true"><\/span>/);
  assert.match(html, /<span class="filter-text">首触跟进<\/span>/);
});

test('renderInlineCheckboxFilterGroupMarkup renders label and tabs container', () => {
  const html = renderInlineCheckboxFilterGroupMarkup({
    rootClassName: 'gf-group store-filter-box',
    label: '业务场景',
    labelClassName: 'gf-label',
    tabsId: 'gf-scene',
    tabsClassName: 'gf-tabs todo-filter-tabs',
    tabsAriaLabel: '业务场景',
    optionsMarkup: '<button type="button">首触跟进</button>'
  });

  assert.match(html, /class="gf-group store-filter-box"/);
  assert.match(html, /<span class="gf-label">业务场景<\/span>/);
  assert.match(html, /id="gf-scene"/);
  assert.match(html, /aria-label="业务场景"/);
});

test('renderStackedCheckboxFilterGroupMarkup can hide summary while keeping title and tabs', () => {
  const html = renderStackedCheckboxFilterGroupMarkup({
    rowClassName: 'sop-analysis-status-row',
    headClassName: 'sop-analysis-status-head',
    title: '线索状态',
    titleClassName: 'sop-analysis-status-title',
    summaryText: '全部',
    summaryClassName: 'sop-analysis-status-selected',
    tabsClassName: 'sop-analysis-status-tabs',
    optionsMarkup: '<button type="button">全部</button>',
    hideSummary: true
  });

  assert.match(html, /class="sop-analysis-status-row"/);
  assert.match(html, /<span class="sop-analysis-status-title">线索状态<\/span>/);
  assert.match(html, /<span class="sop-analysis-status-selected" hidden>全部<\/span>/);
  assert.match(html, /class="sop-analysis-status-tabs"/);
});
