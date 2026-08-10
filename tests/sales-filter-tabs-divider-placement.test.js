const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'sales-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.css'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.js'), 'utf8');
const version = '20260810-sticky-24px-v5';

test('sales dashboard puts tabs above the divider and filters in both role pages', () => {
  const templates = [...html.matchAll(/<template id="tpl-sales-(?:dcc|advisor)">([\s\S]*?)<\/template>/g)];
  assert.equal(templates.length, 2);

  templates.forEach(([, template]) => {
    const tabsIndex = template.indexOf('role-page-switch');
    const dividerIndex = template.indexOf('sales-role-nav-divider');
    const filtersIndex = template.indexOf('sales-role-nav-filters');
    assert.ok(tabsIndex >= 0 && tabsIndex < dividerIndex && dividerIndex < filtersIndex);
  });
});

test('sales dashboard filter card uses the same vertical hierarchy as factory dashboard', () => {
  assert.match(css, /\.sales-role-dashboard-page \.sales-role-nav\s*{[\s\S]*?flex-direction:\s*column;[\s\S]*?align-items:\s*stretch;[\s\S]*?gap:\s*16px;/);
  assert.match(css, /\.sales-role-dashboard-page \.sales-role-nav-divider\s*{[\s\S]*?height:\s*1px;[\s\S]*?background:/);
  assert.match(css, /\.sales-role-dashboard-page \.sales-role-nav-filters\s*{[\s\S]*?width:\s*100%;[\s\S]*?margin-left:\s*0;[\s\S]*?justify-content:\s*flex-start;/);
  assert.match(css, /\.sales-role-dashboard-page \.sales-role-date-host\s*{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?justify-content:\s*flex-start;/);
  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(bootstrap.includes(`const assetVersion = '${version}'`));
});
