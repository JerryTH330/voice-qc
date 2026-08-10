const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.js'), 'utf8');

test('factory dashboard goes directly from the filter card to its filter content', () => {
  const filterCardIndex = runtime.indexOf('factory-filter-sticky-body global-filter-bar session-filter-card');
  const filtersIndex = runtime.indexOf('store-filter-shell session-filter-toolbar');

  assert.ok(filterCardIndex >= 0);
  assert.ok(filterCardIndex < filtersIndex);
  assert.doesNotMatch(runtime, /factory-toolbar-tabs-row|factory-filter-panel-divider|data-tab="sop-|SOP策略洞察/);
});

test('factory sticky filter card is not trapped inside an equal-height wrapper', () => {
  assert.match(
    runtime,
    /<section class="factory-filter-panel factory-filter-sticky-body global-filter-bar session-filter-card" aria-label="全局筛选">\s*<div class="store-filter-shell session-filter-toolbar">/
  );
  assert.doesNotMatch(
    runtime,
    /<section class="factory-filter-panel"[^>]*>\s*<div class="factory-filter-sticky-body global-filter-bar session-filter-card">/
  );
});

test('factory dashboard removes the strategy insight page and its dedicated runtime', () => {
  assert.doesNotMatch(runtime, /panel-sop-improvement|sop-analysis-filter-shell|renderSOPImprovementTab|contribution-mode|currentSOPAnalysisMode/);
  assert.doesNotMatch(css, /panel-sop-improvement|sop-analysis-filter-shell|sop-analysis-mode|sop-contribution|contribution-track/);
  assert.doesNotMatch(bootstrap, /factory-sop-status-utils/);
  assert.match(runtime, /id="panel-sop-execution" aria-label="SOP执行质检"/);
});
