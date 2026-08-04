const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'store-dashboard', 'page.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');

test('store advisor ranking defaults to ten rows and does not offer five rows per page', () => {
  assert.ok(html.includes('page.js?v=20260804-shared-insight-heading-icon'));
  assert.ok(bootstrap.includes("const version = '20260804-shared-insight-heading-icon'"));
  assert.ok(runtime.includes('let advisorPaginationState = { page: 1, pageSize: 10 }'));
  assert.ok(runtime.includes('${[10, 20, 50].map(size => `'));
  assert.ok(!runtime.includes('${[5, 10, 20, 50].map(size => `'));
});

test('store advisor ranking matches Figma 538:10206', () => {
  assert.ok(runtime.includes('data-column-count="${headers.length}"'));
  assert.match(css, /\/\* Figma 538:10206 — 顾问排行 \*\//);
  assert.match(css, /\.advisor-rank-card\s*{[\s\S]*?border-radius:\s*20px;[\s\S]*?box-shadow:\s*0 18px 32px rgba\(15, 23, 42, 0\.05\);/);
  assert.match(css, /\.advisor-rank-content\s*{[\s\S]*?padding:\s*20px 0 0;/);
  assert.match(css, /\.advisor-rank-content \.section-title-bar\s*{[\s\S]*?padding:\s*0 20px;[\s\S]*?margin-bottom:\s*20px;/);
  assert.match(css, /\.advisor-list\s*{[\s\S]*?padding:\s*0 20px;/);
  assert.match(css, /\.advisor-table thead th\s*{[\s\S]*?height:\s*41px;[\s\S]*?padding:\s*0 12px;[\s\S]*?line-height:\s*16\.1px;/);
  assert.match(css, /\.advisor-table tbody tr\s*{[\s\S]*?height:\s*55px;/);
  assert.match(css, /\.advisor-pagination\s*{[\s\S]*?padding:\s*21px 20px 20px;[\s\S]*?border-top:\s*1px solid rgba\(217, 226, 239, 0\.72\);/);
  assert.match(css, /\.advisor-pagination \.page-size-trigger\s*{[\s\S]*?min-width:\s*116px;[\s\S]*?min-height:\s*38px;[\s\S]*?border-radius:\s*12px;/);
  assert.match(css, /\.advisor-pagination \.page-arrow,[\s\S]*?\.advisor-pagination \.page-num\s*{[\s\S]*?width:\s*36px;[\s\S]*?height:\s*36px;[\s\S]*?border-radius:\s*12px;/);
});
