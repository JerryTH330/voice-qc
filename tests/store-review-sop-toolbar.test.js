const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const reviewCss = css.slice(css.lastIndexOf('/* Figma 538:10543 — 录音复盘 */'));

test('store review SOP toolbar matches the sales dashboard shell and custom options', () => {
  assert.ok(html.includes('page.css?v=20260804-store-layout-responsive'));
  assert.ok(html.includes('<span>搜索规则</span>'));
  assert.ok(html.includes('<span>排序</span>'));
  assert.ok(html.includes('data-store-sop-rule-sort-trigger'));
  assert.ok(html.includes('data-store-sop-rule-sort-panel'));
  assert.equal((html.match(/data-store-sop-rule-sort="/g) || []).length, 3);
  assert.ok(!html.includes('id="store-sop-rule-meta"'));
  assert.ok(!html.includes('id="store-sop-rule-sort"'));
  assert.match(reviewCss, /#detail-sop \.store-sop-rule-toolbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) 194px;[\s\S]*?min-height:\s*44px;[\s\S]*?gap:\s*10px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-field\s*{[\s\S]*?height:\s*44px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*16px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-sort-option\.store-model-option\.session-menu-option\s*{[\s\S]*?min-height:\s*40px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*12px;/);
  assert.match(css, /\.store-dashboard-page #detail-sop \.store-sop-rule-sort-option\.store-model-option\.session-menu-option\.active\s*{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(37, 99, 235, 0\.12\), rgba\(56, 189, 248, 0\.1\)\);/);
});

test('store recording review matches Figma 538:10543', () => {
  assert.match(reviewCss, /\.issue-overview-wrapper\s*{[\s\S]*?gap:\s*20px;[\s\S]*?padding:\s*21px;[\s\S]*?border-radius:\s*22px;[\s\S]*?box-shadow:\s*0 12px 28px rgba\(15, 23, 42, 0\.06\);/);
  assert.match(reviewCss, /\.issue-overview-wrapper \.issue-insight-tab\s*{[\s\S]*?min-height:\s*38px;[\s\S]*?padding:\s*0 19px;/);
  assert.match(reviewCss, /\.issue-overview-wrapper \.issue-card\s*{[\s\S]*?min-height:\s*73\.594px;[\s\S]*?border-radius:\s*20px;/);
  assert.match(reviewCss, /\.issue-overview-wrapper \.issue-header\s*{[\s\S]*?min-height:\s*71\.594px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*12px 16px;/);
  assert.match(reviewCss, /\.issue-overview-wrapper \.issue-rule-pagination\s*{[\s\S]*?padding:\s*16px 4px 0;/);
  assert.match(reviewCss, /\.issue-rule-pagination \.session-pagination-total\s*{[\s\S]*?white-space:\s*nowrap;/);
  assert.match(reviewCss, /\.issue-rule-pagination \.page-arrow,[\s\S]*?\.issue-rule-pagination \.page-num\s*{[\s\S]*?width:\s*36px;[\s\S]*?height:\s*36px;[\s\S]*?border-radius:\s*12px;/);
  assert.match(reviewCss, /\.issue-rec-more::after\s*{[\s\S]*?display:\s*none;/);
});

test('store review custom sort keeps filtering and sorting behavior', () => {
  assert.ok(runtime.includes("const sortTrigger = sortField?.querySelector('[data-store-sop-rule-sort-trigger]')"));
  assert.ok(runtime.includes("sortPanel?.classList.add('show')"));
  assert.ok(runtime.includes("storeSopRuleState.sort = option.dataset.storeSopRuleSort || 'rate-desc'"));
  assert.ok(runtime.includes("sortValue.textContent = option.textContent.trim()"));
  assert.ok(runtime.includes("storeSopRuleState.query = event.target.value || ''"));
  assert.ok(!runtime.includes("document.getElementById('store-sop-rule-meta')"));
});
