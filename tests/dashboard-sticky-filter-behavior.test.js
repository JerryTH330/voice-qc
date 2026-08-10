const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const coreCss = fs.readFileSync(path.join(root, 'voice-qc-admin.css'), 'utf8');
const factoryCss = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const storeCss = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const salesCss = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.css'), 'utf8');

test('dashboard filter cards enter their sticky state at the shared 24px threshold', () => {
  assert.match(runtime, /rootMargin:\s*'-24px 0px 0px 0px'/);
  assert.match(runtime, /position:absolute;height:1px;width:1px/);
  assert.doesNotMatch(runtime, /sticky-sentinel[^\n]*position:relative|position:relative;height:1px;width:1px;margin-bottom:-1px/);
  assert.match(coreCss, /\.main\s*{[\s\S]*?padding:\s*24px;/);
  assert.match(factoryCss, /factory-filter-sticky-body\.global-filter-bar\.session-filter-card\s*{[\s\S]*?top:\s*0;/);
  assert.match(storeCss, /global-filter-bar\.session-filter-card\s*{[\s\S]*?top:\s*0;/);
  assert.match(salesCss, /\.sales-role-dashboard-page \.sales-role-nav\s*{[\s\S]*?top:\s*0;/);
});

test('all sticky filter cards share the 80 percent frosted background', () => {
  [factoryCss, storeCss, salesCss].forEach((css) => {
    assert.match(css, /\.is-stuck\s*{[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.8\);[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(140%\);/);
    assert.match(css, /@supports not[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.96\);/);
  });
});

test('sales tabs and divider collapse only while the filter card is stuck', () => {
  assert.match(salesCss, /\.sales-role-nav\.is-stuck \.role-page-switch,[\s\S]*?\.sales-role-nav\.is-stuck \.sales-role-nav-divider\s*{[\s\S]*?max-height:\s*0;[\s\S]*?opacity:\s*0;/);
  assert.match(salesCss, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?transition:\s*none;/);
});
