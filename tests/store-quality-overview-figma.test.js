const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const assets = [
  'comparison-vs.png',
  'store-tail.svg',
  'zone-tail.svg',
  'summary-strength.png',
  'summary-weakness.png',
  'summary-risk.png',
];

test('store quality overview uses local assets exported from Figma 553:4383', () => {
  assets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', 'store-quality-overview', asset)), `${asset} should exist`);
    assert.ok(html.includes(`../assets/store-quality-overview/${asset}`), `${asset} should be referenced`);
  });
  assert.ok(!html.includes('store-quality-rate-figma-514-6817.png'));
  assert.ok(!html.includes('zone-quality-rate-figma-514-6817.png'));
});

test('store quality overview uses the Figma 553:4383 gradient surface', () => {
  assert.match(css, /\.sop-overview-track\s*{[\s\S]*?background:\s*linear-gradient\(180deg, rgba\(255, 255, 255, 0\.98\), rgba\(243, 247, 253, 0\.94\)\);/);
});

test('quality overview heading reuses the lead detail customer insight image', () => {
  assert.match(html, /<span class="sop-overview-heading-media"[^>]*>[\s\S]*?<img class="sop-overview-heading-image" src="\.\.\/assets\/lead-customer-insight-figma-533-8804\.png"[^>]*>[\s\S]*?<\/span>/);
  assert.ok(html.indexOf('class="sop-overview-heading-media"') < html.indexOf('<h2 class="track-title">质检概览</h2>'));
  assert.ok(!html.includes('ai-robot-loop.mp4'));
  assert.ok(!html.includes('<video class="sop-overview-heading-video"'));
  assert.match(css, /\.sop-overview-heading-media\s*{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;/);
  assert.match(css, /\.sop-overview-heading-image\s*{[\s\S]*?top:\s*-11px;[\s\S]*?left:\s*-11px;[\s\S]*?width:\s*78px;[\s\S]*?height:\s*78px;/);
  assert.ok(!css.includes('.sop-overview-heading-video'));
});

test('quality insight and connected comparison follow the Figma top row', () => {
  assert.ok(html.includes('class="sop-overview-primary-row"'));
  assert.ok(html.indexOf('id="sop-ai-summary"') < html.indexOf('class="sop-metric-row"'));
  assert.match(css, /\.sop-overview-grid\s*{[\s\S]*?padding:\s*17\.5px;[\s\S]*?border:\s*1\.5px solid #dbeafe;[\s\S]*?border-radius:\s*18px;[\s\S]*?background:\s*#ffffff;[\s\S]*?box-shadow:\s*0 4px 16px rgba\(37, 99, 235, 0\.12\);/);
  assert.match(css, /\.sop-overview-primary-row\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 32\.04%\) minmax\(0, 1fr\);[\s\S]*?gap:\s*16px;/);
  assert.match(css, /\.sop-ai-summary\s*{[^}]*width:\s*100%;[^}]*height:\s*86px;[^}]*margin-left:\s*0;[^}]*border-radius:\s*14px;/);
  assert.match(css, /\.sop-overview-track \.sop-metric-row\s*{[\s\S]*?display:\s*flex;[\s\S]*?height:\s*86px;[\s\S]*?gap:\s*0;/);
});

test('quality insight card follows the latest Figma surface without floating media', () => {
  assert.match(css, /\.sop-ai-summary\s*{[^}]*border:\s*1px solid #dbeafe;[^}]*background:\s*linear-gradient/);
  assert.ok(!css.includes('.sop-ai-summary::before'));
  assert.ok(!css.includes('.sop-ai-summary .hint-icon'));
});

test('connected quality cards match Figma geometry and typography', () => {
  assert.match(css, /\.sop-metric-panel-store\s*{[\s\S]*?z-index:\s*3;[\s\S]*?margin-right:\s*-64px;/);
  assert.match(css, /\.sop-metric-panel-zone\s*{[\s\S]*?z-index:\s*2;[\s\S]*?margin-right:\s*-64px;/);
  assert.match(css, /\.sop-metric-card-store\s*{[\s\S]*?border-radius:\s*14px 0 0 14px;[\s\S]*?background:\s*#dbeafe;/);
  assert.match(css, /\.sop-metric-card-zone\s*{[\s\S]*?padding-left:\s*65px;[\s\S]*?background:\s*#ffffff;/);
  assert.match(css, /\.sop-metric-panel-store \.sop-metric-tail\s*{[\s\S]*?width:\s*76\.904px;/);
  assert.match(css, /\.sop-metric-panel-zone \.sop-metric-tail\s*{[\s\S]*?width:\s*61\.16px;/);
  assert.match(css, /\.sop-metric-vs\s*{[^}]*top:\s*50%;[^}]*left:\s*calc\(50% - 70px\);[^}]*width:\s*52px;[^}]*height:\s*52px;[^}]*padding:\s*6px;[^}]*transform:\s*translateY\(-50%\);/);
  assert.match(css, /\.sop-metric-vs\s*{[^}]*box-shadow:\s*0 0 16px rgba\(37, 99, 235, 0\.2\);/);
  assert.match(css, /\.sop-metric-vs::before\s*{[^}]*box-shadow:\s*0 0 4px rgba\(37, 99, 235, 0\.3\);/);
  assert.match(css, /\.sop-metric-vs-image\s*{[\s\S]*?width:\s*28px;[\s\S]*?height:\s*28px;/);
  assert.match(css, /\.sop-metric-score\s*{[\s\S]*?font-size:\s*24px;[\s\S]*?font-weight:\s*600;/);
});

test('VS anchor stays on the card connection across row widths', () => {
  [720, 908, 1200, 1960].forEach((rowWidth) => {
    const flexiblePanelWidth = (rowWidth - 140 + 64 * 2) / 2;
    const connectionX = flexiblePanelWidth - 64;
    const vsAnchorX = rowWidth / 2 - 70;
    assert.equal(vsAnchorX, connectionX);
  });
});

test('quality difference keeps dynamic plus and minus states', () => {
  assert.ok(html.includes('<span class="sop-improve-label sop-national-diff-label">+</span>'));
  assert.match(css, /\.sop-overview-track \.sop-improve\s*{[\s\S]*?flex:\s*0 0 140px;[\s\S]*?padding:\s*17px 17px 17px 65px;/);
  assert.ok(runtime.includes("nationalDiffLabelEl.textContent = nationalDiff >= 0 ? '+' : '-'"));
  assert.ok(runtime.includes("nationalDiffVal.textContent = `${nationalDiff >= 0 ? '+' : '-'}${diffText}`"));
});

test('summary cards match Figma 553:4430', () => {
  assert.equal((html.match(/class="summary-item-copy"/g) || []).length, 3);
  assert.match(css, /\.sop-overview-track \.summary-list\s*{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\) !important;[\s\S]*?gap:\s*16px;/);
  assert.match(css, /\.sop-overview-track \.summary-item\s*{[\s\S]*?min-height:\s*108px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*18px 16px;[\s\S]*?border-radius:\s*14px;/);
  assert.match(css, /\.sop-overview-track \.summary-item-icon,[\s\S]*?\.summary-item\.danger \.summary-item-icon\s*{[\s\S]*?width:\s*48px;[\s\S]*?height:\s*48px;/);
  assert.match(css, /\.summary-item-copy strong\s*{[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*22px;/);
  assert.match(css, /\.summary-item-copy > span\s*{[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*24px;/);
});

test('store quality overview refreshes the latest CSS', () => {
  assert.ok(html.includes('page.css?v=20260810-sticky-24px-v5'));
});
