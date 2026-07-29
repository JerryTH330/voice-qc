const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');

test('store review SOP toolbar matches the sales dashboard shell and custom options', () => {
  assert.ok(html.includes('page.css?v=20260729store-sop-toolbar-match'));
  assert.ok(html.includes('<span>搜索规则</span>'));
  assert.ok(html.includes('<span>排序</span>'));
  assert.ok(html.includes('data-store-sop-rule-sort-trigger'));
  assert.ok(html.includes('data-store-sop-rule-sort-panel'));
  assert.equal((html.match(/data-store-sop-rule-sort="/g) || []).length, 3);
  assert.ok(!html.includes('id="store-sop-rule-meta"'));
  assert.ok(!html.includes('id="store-sop-rule-sort"'));
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-toolbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) max-content;[\s\S]*?min-height:\s*44px;[\s\S]*?gap:\s*10px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-field\s*{[\s\S]*?height:\s*44px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*16px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-sort-option\.store-model-option\.session-menu-option\s*{[\s\S]*?min-height:\s*40px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*12px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-sort-option\.store-model-option\.session-menu-option\.active\s*{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(37, 99, 235, 0\.12\), rgba\(56, 189, 248, 0\.1\)\);/);
});

test('store review custom sort keeps filtering and sorting behavior', () => {
  assert.ok(runtime.includes("const sortTrigger = sortField?.querySelector('[data-store-sop-rule-sort-trigger]')"));
  assert.ok(runtime.includes("sortPanel?.classList.add('show')"));
  assert.ok(runtime.includes("storeSopRuleState.sort = option.dataset.storeSopRuleSort || 'rate-desc'"));
  assert.ok(runtime.includes("sortValue.textContent = option.textContent.trim()"));
  assert.ok(runtime.includes("storeSopRuleState.query = event.target.value || ''"));
  assert.ok(!runtime.includes("document.getElementById('store-sop-rule-meta')"));
});
