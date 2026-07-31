const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
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

test('store quality overview uses the local assets exported from Figma 514:6817', () => {
  assets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', asset)), `${asset} should exist`);
    assert.ok(html.includes(`../assets/${asset}`), `${asset} should be referenced`);
  });
  assert.ok(html.includes('sop-metric-panel sop-metric-panel-store'));
  assert.ok(html.includes('sop-metric-panel sop-metric-panel-zone'));
  assert.ok(!html.includes('sop-improve-arrow-image sop-national-diff-arrow'));
});

test('store quality overview follows the Figma layout, type, color and spacing tokens', () => {
  assert.ok(html.includes('page.css?v=20260731main-local-preserved'));
  assert.match(css, /\.sop-overview-track \.sop-metric-row\s*{[\s\S]*?gap:\s*32px;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-panel\s*{[\s\S]*?height:\s*105px;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-card\s*{[\s\S]*?gap:\s*20px;[\s\S]*?padding:\s*21\.5px 20px;[\s\S]*?border-width:\s*1\.5px;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-card-store\s*{[\s\S]*?border-color:\s*#dbeafe;[\s\S]*?border-radius:\s*18px 0 0 18px;[\s\S]*?linear-gradient\(180deg, #eff6ff 0%, #ffffff 100%\);/);
  assert.match(css, /\.sop-overview-track \.sop-metric-card-zone\s*{[\s\S]*?border-color:\s*#facece;[\s\S]*?border-radius:\s*0 18px 18px 0;[\s\S]*?linear-gradient\(180deg, #ffefef 0%, #ffffff 100%\);/);
  assert.match(css, /\.sop-overview-track \.sop-metric-card-image\s*{[\s\S]*?width:\s*80px;[\s\S]*?height:\s*80px;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-vs-image\s*{[\s\S]*?width:\s*88px;[\s\S]*?height:\s*88px;/);
  assert.match(css, /\.sop-overview-track \.sop-improve-label\s*{[\s\S]*?font-size:\s*40px;/);
  assert.match(css, /\.sop-overview-track \.sop-improve-value\s*{[\s\S]*?font-size:\s*40px;/);
});

test('metric card bodies cover the inner tail strokes at the overlap', () => {
  assert.match(css, /\.sop-overview-track \.sop-metric-card\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*2;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-tail\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*1;[\s\S]*?margin-left:\s*-2px;/);
});

test('quality difference matches Figma node 514:6851 in static and dynamic states', () => {
  assert.ok(html.includes('<span class="sop-improve-label sop-national-diff-label">+</span>'));
  assert.match(css, /\.sop-overview-track \.sop-improve-copy\s*{[\s\S]*?align-items:\s*center;[\s\S]*?gap:\s*4px;/);
  assert.ok(runtime.includes("nationalDiffLabelEl.textContent = nationalDiff >= 0 ? '+' : '-'"));
  assert.ok(runtime.includes("nationalDiffVal.textContent = `${nationalDiff >= 0 ? '+' : '-'}${diffText}`"));
  assert.ok(!runtime.includes("nationalDiffLabelEl.textContent = nationalDiff >= 0 ? '提升' : '落后'"));
});

test('summary cards match Figma node 514:6865', () => {
  assert.equal((html.match(/class="summary-item-copy"/g) || []).length, 3);
  assert.match(css, /\.sop-overview-track \.summary-item\s*{[\s\S]*?min-height:\s*108px;[\s\S]*?flex-direction:\s*row;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*17px 15px;[\s\S]*?border:\s*1px solid #e2e8f0;[\s\S]*?border-radius:\s*12px;/);
  assert.match(css, /\.sop-overview-track \.summary-item-icon-shell\s*{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*48px;[\s\S]*?padding:\s*0;[\s\S]*?border-radius:\s*10\.667px;[\s\S]*?background:\s*transparent;/);
  assert.match(css, /\.sop-overview-track \.summary-item-icon,[\s\S]*?\.summary-item\.danger \.summary-item-icon\s*{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*48px;/);
  assert.match(css, /\.summary-item-copy strong\s*{[\s\S]*?color:\s*#1e293b;[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*22px;/);
  assert.match(css, /\.summary-item-copy > span\s*{[\s\S]*?color:\s*#334155;[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*24px;/);
});

test('weakness and risk cards override the legacy full-width direct-span rule', () => {
  assert.match(css, /#sop-summary-weakness > \.summary-item-icon-shell,[\s\S]*?#sop-summary-risk > \.summary-item-icon-shell\s*{[\s\S]*?display:\s*grid;[\s\S]*?width:\s*48px;[\s\S]*?max-width:\s*48px;[\s\S]*?flex:\s*0 0 48px;/);
  assert.match(css, /#sop-summary-weakness > \.summary-item-copy,[\s\S]*?#sop-summary-risk > \.summary-item-copy\s*{[\s\S]*?width:\s*auto;[\s\S]*?min-width:\s*0;[\s\S]*?flex:\s*1 1 0;/);
});
