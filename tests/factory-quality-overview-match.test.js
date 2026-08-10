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
const parityCss = css.slice(css.lastIndexOf('/* 厂端核心指标：与门店看板的 Figma 卡片样式保持一致。 */'));

const overviewAssets = [
  'store-tail.svg',
  'zone-tail.svg',
  'comparison-vs.png',
  'summary-strength.png',
  'summary-weakness.png',
  'summary-risk.png'
];

const coreMetricAssets = [
  'recording-ribbon-mask.svg',
  'recording-card-background-layer.png',
  'metric-duration.png',
  'metric-hit-rate.png',
  'metric-pass-count.png',
  'metric-pass-rate.png',
  'metric-risk-count.png',
  'metric-risk-rate.png'
];

test('factory core metrics reuse the store assets and card structure', () => {
  coreMetricAssets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', 'store-core-metrics', asset)), `${asset} should exist`);
  });
  assert.ok(source.includes('class="store-recording-summary-ribbon"'));
  assert.ok(source.includes('../assets/store-core-metrics/recording-ribbon-mask.svg'));
  assert.equal((source.match(/\.\.\/assets\/store-core-metrics\/metric-[a-z-]+\.png/g) || []).length, 6);
  assert.match(parityCss, /\.store-recording-summary\s*{[\s\S]*?min-height:\s*166px;[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(parityCss, /\.store-recording-summary-ribbon\s*{[\s\S]*?width:\s*123px;[\s\S]*?height:\s*61px;/);
  assert.match(parityCss, /\.hm-layout-bottom\s*{[\s\S]*?grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\);/);
  assert.match(parityCss, /\.hm-layout-bottom \.hm-item\.single-metric\s*{[\s\S]*?min-height:\s*78px;[\s\S]*?border-radius:\s*16px;/);
});

test('factory overview reuses the current store overview assets and structure', () => {
  overviewAssets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', 'store-quality-overview', asset)), `${asset} should exist`);
    assert.ok(source.includes(`../assets/store-quality-overview/${asset}`), `${asset} should be referenced`);
  });
  assert.ok(source.includes('../assets/lead-customer-insight-figma-533-8804.png'));
  assert.ok(source.indexOf('class="sop-overview-heading-media"') < source.indexOf('<h2 class="track-title">质检概览</h2>'));
  assert.ok(source.includes('class="sop-overview-primary-row"'));
  assert.ok(source.indexOf('id="sop-ai-summary"') < source.indexOf('class="sop-metric-row"'));
  assert.equal((source.match(/class="summary-item-copy"/g) || []).length, 3);
});

test('factory overview follows the current store composition dimensions', () => {
  assert.match(parityCss, /\.sop-overview-heading-media\s*{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;/);
  assert.match(parityCss, /\.sop-overview-grid\s*{[\s\S]*?padding:\s*17\.5px;[\s\S]*?border:\s*1\.5px solid #dbeafe;[\s\S]*?border-radius:\s*18px;/);
  assert.match(parityCss, /\.sop-overview-primary-row\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 32\.04%\) minmax\(0, 1fr\);[\s\S]*?gap:\s*16px;/);
  assert.match(parityCss, /\.sop-metric-row\s*{[\s\S]*?display:\s*flex;[\s\S]*?height:\s*86px;[\s\S]*?gap:\s*0;/);
  assert.match(parityCss, /\.sop-metric-vs-image\s*{[\s\S]*?width:\s*28px;[\s\S]*?height:\s*28px;/);
  assert.match(parityCss, /\.sop-improve\s*{[\s\S]*?flex:\s*0 0 140px;[\s\S]*?padding:\s*17px 17px 17px 65px;/);
});

test('factory quality difference keeps the same plus and minus presentation', () => {
  assert.ok(source.includes('<span class="sop-improve-label sop-national-diff-label">+</span>'));
  assert.ok(source.includes("nationalDiffLabelEl.textContent = diff >= 0 ? '+' : '-'"));
  assert.ok(source.includes('const diffText = `${Math.abs(diff)}%`;'));
  assert.match(parityCss, /\.sop-improve-label,[\s\S]*?\.sop-improve-value\s*{[\s\S]*?font-size:\s*24px;/);
});

test('factory summary cards match the current store horizontal card layout', () => {
  assert.match(parityCss, /\.summary-item\s*{[\s\S]*?min-height:\s*108px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*18px 16px;[\s\S]*?border-radius:\s*14px;/);
  assert.match(parityCss, /\.summary-item-icon-shell\s*{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*48px;[\s\S]*?flex:\s*0 0 48px;/);
  assert.match(parityCss, /\.summary-list\s*{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\) !important;[\s\S]*?gap:\s*16px;/);
});

test('factory overview cache versions are updated together', () => {
  const version = '20260810-sticky-24px-v5';
  assert.ok(pageHtml.includes(`page.css?v=${version}`));
  assert.ok(pageHtml.includes(`page.js?v=${version}`));
  assert.ok(pageCss.includes(`factory-dashboard.css?v=${version}`));
  assert.ok(pageJs.includes(`const assetVersion = '${version}'`));
});
