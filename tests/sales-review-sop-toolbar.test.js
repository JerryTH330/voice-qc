const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'sales-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');

test('sales review SOP toolbar uses the factory dashboard filter shell', () => {
  assert.ok(html.includes('page.css?v=20260729sales-review-robot'));
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.store-sop-rule-toolbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) max-content;[\s\S]*?gap:\s*10px;[\s\S]*?min-height:\s*44px;/);
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.store-sop-rule-field\s*{[\s\S]*?height:\s*44px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*0 8px 20px rgba\(15, 23, 42, 0\.04\);/);
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.store-sop-rule-field:focus-within\s*{[\s\S]*?border-color:\s*rgba\(37, 99, 235, 0\.5\);[\s\S]*?box-shadow:\s*0 0 0 4px rgba\(37, 99, 235, 0\.08\);/);
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.sales-review-sop-sort-panel\.store-model-panel\.session-menu-panel\s*{[\s\S]*?display:\s*none;[\s\S]*?padding:\s*10px;[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*0 24px 48px rgba\(15, 23, 42, 0\.14\);/);
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.sales-review-sop-sort-option\.store-model-option\.session-menu-option\s*{[\s\S]*?min-height:\s*40px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*12px;/);
  assert.match(css, /\.sales-role-dashboard-page \.review-insight-toolbar \.sales-review-sop-sort-option\.store-model-option\.session-menu-option\.active\s*{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(37, 99, 235, 0\.12\), rgba\(56, 189, 248, 0\.1\)\);/);
});

test('sales review SOP toolbar removes the rule count and uses the factory custom sort options', () => {
  assert.ok(runtime.includes('<span>搜索规则</span>'));
  assert.ok(runtime.includes('<span>排序</span>'));
  assert.ok(runtime.includes('data-sales-review-sop-search'));
  assert.ok(runtime.includes('data-sales-review-sop-sort-trigger'));
  assert.ok(runtime.includes('data-sales-review-sop-sort-panel'));
  assert.ok(runtime.includes('sales-review-sop-sort-option store-model-option session-menu-option'));
  assert.ok(runtime.includes("sortPanel?.classList.add('show')"));
  assert.ok(runtime.includes("state.reviewSopSort = option.dataset.salesReviewSopSort || 'rate-desc'"));
  assert.ok(runtime.includes('renderSalesReviewToolbar(role, activeTab)'));
  assert.ok(runtime.includes("state.reviewSopQuery = event.target.value || ''"));
  assert.ok(!runtime.includes('id="sales-review-rule-meta"'));
  assert.ok(!css.includes('.store-sop-rule-meta'));
});
