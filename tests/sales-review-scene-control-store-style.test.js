const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'sales-dashboard', 'index.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');

test('sales review scene control reuses the store dashboard structure and behavior', () => {
  assert.match(runtime, /id="salesReviewSceneControl"|document\.getElementById\('salesReviewSceneControl'\)/);
  assert.match(runtime, /class="gf-group store-filter-box session-toolbar-control session-toolbar-segment-control session-toolbar-control-intent"/);
  assert.match(runtime, /class="gf-tabs todo-filter-tabs" id="gf-scene"/);
  assert.match(runtime, /class="gf-tab todo-filter-tab\$\{active \? ' active' : ''\}"/);
});

test('sales review scene control matches the effective store dashboard appearance', () => {
  assert.match(
    css,
    /\.sales-role-dashboard-page \.sales-role-scene-host \.gf-group\s*{[\s\S]*?height:\s*44px;[\s\S]*?padding:\s*0 14px;[\s\S]*?border-radius:\s*16px;[\s\S]*?gap:\s*12px;/
  );
  assert.match(
    css,
    /\.sales-role-dashboard-page \.sales-role-scene-host \.gf-tabs\s*{[\s\S]*?min-height:\s*44px;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?flex-wrap:\s*nowrap;/
  );
  assert.match(
    css,
    /#gf-scene \.gf-tab\.todo-filter-tab\s*{[\s\S]*?min-height:\s*26px;[\s\S]*?padding:\s*0 0 0 24px;[\s\S]*?font-size:\s*14px;[\s\S]*?line-height:\s*20px;/
  );
  assert.match(css, /#gf-scene\.gf-tabs\.todo-filter-tabs\s*{[\s\S]*?gap:\s*14px;/);
  assert.ok(html.includes('page.css?v=20260810-sticky-24px-v5'));
});
