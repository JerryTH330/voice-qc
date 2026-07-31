const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pageHtml = fs.readFileSync(path.join(root, 'factory-dashboard', 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const pageCss = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.css'), 'utf8');
const pageJs = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.js'), 'utf8');
const assets = [
  'store-quality-rate-figma-514-6817.png',
  'store-quality-tail-figma-514-6817.svg',
  'quality-rate-vs-figma-514-6817.png',
  'zone-quality-tail-figma-514-6817.svg',
  'zone-quality-rate-figma-514-6817.png',
  'store-summary-strength-figma-514-6868.png',
  'store-summary-weakness-figma-514-6878.png',
  'store-summary-risk-figma-514-6888.png',
];

test('factory overview reuses the complete local assets and structure from store overview', () => {
  assets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', asset)), `${asset} should exist`);
    assert.ok(source.includes(`../assets/${asset}`), `${asset} should be referenced`);
  });
  assert.ok(source.includes('sop-metric-panel sop-metric-panel-store'));
  assert.ok(source.includes('sop-metric-panel sop-metric-panel-zone'));
  assert.equal((source.match(/class="summary-item-copy"/g) || []).length, 3);
  assert.ok(!source.includes('sop-improve-arrow-image sop-national-diff-arrow'));
});

test('factory overview follows the store comparison card dimensions and overlap layers', () => {
  assert.match(css, /\.sop-metric-row\s*{[\s\S]*?gap:\s*32px;/);
  assert.match(css, /\.sop-metric-panel\s*{[\s\S]*?height:\s*105px;/);
  assert.match(css, /\.sop-metric-card\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*2;[\s\S]*?gap:\s*20px;[\s\S]*?padding:\s*21\.5px 20px;[\s\S]*?border-width:\s*1\.5px;/);
  assert.match(css, /\.sop-metric-tail\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*1;[\s\S]*?margin-left:\s*-2px;/);
  assert.match(css, /\.sop-metric-card-image\s*{[\s\S]*?width:\s*80px;[\s\S]*?height:\s*80px;/);
  assert.match(css, /\.sop-metric-vs-image\s*{[\s\S]*?width:\s*88px;[\s\S]*?height:\s*88px;/);
});

test('factory quality difference uses the same plus and minus presentation as store overview', () => {
  assert.ok(source.includes('<span class="sop-improve-label sop-national-diff-label">+</span>'));
  assert.ok(source.includes("nationalDiffLabelEl.textContent = diff >= 0 ? '+' : '-'"));
  assert.ok(source.includes('const diffText = `${Math.abs(diff)}%`;'));
  assert.match(css, /\.sop-improve-label,[\s\S]*?\.sop-improve-value\s*{[\s\S]*?font-size:\s*40px;/);
});

test('factory summary cards match the current store horizontal card layout', () => {
  assert.match(css, /\.summary-item\s*{[\s\S]*?min-height:\s*108px;[\s\S]*?flex-direction:\s*row;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*17px 15px;[\s\S]*?border:\s*1px solid #e2e8f0;/);
  assert.match(css, /\.summary-item-icon-shell\s*{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*48px;[\s\S]*?flex:\s*0 0 48px;/);
  assert.match(css, /\.summary-item-copy strong\s*{[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*22px;/);
  assert.match(css, /\.summary-item-copy > span\s*{[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*24px;/);
});

test('factory overview cache versions are updated together', () => {
  const version = '20260731main-local-preserved';
  assert.ok(pageHtml.includes(`page.css?v=${version}`));
  assert.ok(pageHtml.includes(`page.js?v=${version}`));
  assert.ok(pageCss.includes(`factory-dashboard.css?v=${version}`));
  assert.ok(pageJs.includes(`const assetVersion = '${version}'`));
});
