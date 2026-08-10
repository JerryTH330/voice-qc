const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'factory-dashboard/factory-dashboard.css'), 'utf8');
const pageCss = fs.readFileSync(path.join(root, 'factory-dashboard/page.css'), 'utf8');
const pageJs = fs.readFileSync(path.join(root, 'factory-dashboard/page.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'factory-dashboard/index.html'), 'utf8');

test('factory dashboard primary panels keep 20px inset except the latest Figma issue overview', () => {
  const layoutCss = css.slice(css.lastIndexOf('/* 厂端看板统一板块间距 */'));

  assert.match(layoutCss, /\.global-filter-bar\.session-filter-card,[\s\S]*?\.hero-panel,[\s\S]*?\.sop-overview-track,[\s\S]*?\.sop-rank-track,[\s\S]*?\.store-trend-card\s*{[\s\S]*?padding:\s*20px;/);
  assert.doesNotMatch(layoutCss, /\.issue-overview-wrapper,/);
  assert.match(css, /\.issue-overview-wrapper\s*{[\s\S]*?padding:\s*21px;/);
  assert.match(layoutCss, /\.sop-overview-track \.track-header,[\s\S]*?\.sop-overview-track \.track-body\s*{[\s\S]*?padding:\s*0;/);
  assert.match(layoutCss, /\.sop-rank-track \.section-title-bar,[\s\S]*?\.sop-rank-track \.track-body\s*{[\s\S]*?padding-right:\s*0;[\s\S]*?padding-left:\s*0;/);
  assert.match(layoutCss, /\.store-trend-content\s*{[\s\S]*?padding:\s*0;/);
  assert.doesNotMatch(layoutCss, /#panel-sop-improvement|contribution-track/);
});

test('factory dashboard loads the unified panel spacing stylesheet version', () => {
  const version = '20260810-sticky-24px-v5';

  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(pageCss.includes(`factory-dashboard.css?v=${version}`));
  assert.ok(pageJs.includes(`const assetVersion = '${version}'`));
});
