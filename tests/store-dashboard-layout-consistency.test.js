const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'store-dashboard/page.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'store-dashboard/index.html'), 'utf8');

test('store dashboard primary panels use one 20px content inset', () => {
  const layoutCss = css.slice(css.lastIndexOf('/* 门店看板统一板块间距与自适应 */'));

  assert.match(layoutCss, /\.global-filter-bar,[\s\S]*?\.hero-panel,[\s\S]*?\.main-tabs-bar,[\s\S]*?\.sop-overview-track,[\s\S]*?\.advisor-rank-card,[\s\S]*?\.issue-overview-wrapper,[\s\S]*?\.store-trend-card,[\s\S]*?#main-panel-leads \.leads-grid > \.track\s*{[\s\S]*?padding:\s*20px;/);
  assert.match(layoutCss, /\.sop-overview-track \.track-header,[\s\S]*?\.sop-overview-track \.track-body\s*{[\s\S]*?padding:\s*0;/);
  assert.match(layoutCss, /\.advisor-rank-content\s*{[\s\S]*?padding:\s*0;/);
  assert.match(layoutCss, /\.advisor-rank-content \.section-title-bar,[\s\S]*?\.advisor-list\s*{[\s\S]*?padding-right:\s*0;[\s\S]*?padding-left:\s*0;/);
  assert.match(layoutCss, /\.store-trend-content\s*{[\s\S]*?padding:\s*0;/);
});

test('store dashboard responds to available content width instead of viewport width', () => {
  const layoutCss = css.slice(css.lastIndexOf('/* 门店看板统一板块间距与自适应 */'));

  assert.match(layoutCss, /\.store-dashboard-page \.dashboard\s*{[\s\S]*?container-type:\s*inline-size;/);
  assert.match(layoutCss, /@container \(max-width:\s*1180px\)[\s\S]*?#main-panel-advisors > \.tab-dual-grid\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(layoutCss, /@container \(max-width:\s*1180px\)[\s\S]*?\.sop-overview-track,[\s\S]*?\.advisor-rank-card,[\s\S]*?\.issue-overview-wrapper\s*{[\s\S]*?grid-column:\s*1;[\s\S]*?grid-row:\s*auto;[\s\S]*?height:\s*auto;/);
  assert.match(layoutCss, /@container \(max-width:\s*1180px\)[\s\S]*?\.store-hero-metrics \.hm-layout-bottom\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(layoutCss, /#detail-sop \.store-sop-rule-toolbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) minmax\(150px,\s*194px\);/);
  assert.match(layoutCss, /#detail-sop \.store-sop-rule-field--sort\s*{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/);
  assert.match(layoutCss, /\.issue-rule-pagination \.dashboard-pagination-controls,[\s\S]*?\.advisor-pagination \.dashboard-pagination-controls\s*{[\s\S]*?flex-wrap:\s*wrap;/);
});

test('store dashboard loads the unified spacing and responsive stylesheet version', () => {
  assert.ok(html.includes('page.css?v=20260804-store-layout-responsive'));
  assert.ok(html.includes('page.js?v=20260804-store-layout-responsive'));
});
