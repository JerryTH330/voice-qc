const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const pageRuntime = fs.readFileSync(path.join(root, 'store-dashboard', 'page.js'), 'utf8');

const assets = [
  'manager-avatar.png',
  'store-icon.svg',
  'role-icon.svg',
  'recording-ribbon-mask.svg',
  'recording-card-background-layer.png',
  'metric-duration.png',
  'metric-hit-rate.png',
  'metric-pass-count.png',
  'metric-pass-rate.png',
  'metric-risk-count.png',
  'metric-risk-rate.png'
];

test('store core metrics uses local assets exported from Figma 546:1160', () => {
  assets.forEach((asset) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', 'store-core-metrics', asset)), `${asset} should exist`);
  });
  assert.ok(html.includes('../assets/store-core-metrics/manager-avatar.png'));
  assert.ok(html.includes('../assets/store-core-metrics/store-icon.svg'));
  assert.ok(html.includes('../assets/store-core-metrics/role-icon.svg'));
  assert.ok(css.includes('../assets/store-core-metrics/recording-card-background-layer.png'));
  assert.equal((runtime.match(/\.\.\/assets\/store-core-metrics\/metric-[a-z-]+\.png/g) || []).length, 6);
});

test('store manager identity follows Figma layout and copy', () => {
  assert.ok(html.includes('class="hero-profile-tags"'));
  assert.ok(html.includes('门店：上海中心店'));
  assert.ok(html.includes('职位：店长'));
  assert.ok(!html.includes('上海中心店 · 店长'));
  assert.match(css, /\.hero-avatar\s*{[\s\S]*?width:\s*40px;[\s\S]*?height:\s*40px;/);
  assert.match(css, /\.hero-profile-tag\s*{[\s\S]*?min-height:\s*30px;[\s\S]*?padding:\s*1px 17px;[\s\S]*?border-radius:\s*999px;/);
});

test('recording groups and six quality metrics follow Figma card dimensions', () => {
  assert.ok(runtime.includes('class="store-recording-summary-ribbon"'));
  assert.ok(runtime.includes('../assets/store-core-metrics/recording-ribbon-mask.svg'));
  assert.match(css, /\.store-recording-summary-ribbon\s*{[\s\S]*?width:\s*123px;[\s\S]*?height:\s*61px;/);
  assert.match(css, /\.store-recording-summary-level\s*{[\s\S]*?width:\s*107px;[\s\S]*?height:\s*48px;[\s\S]*?padding:\s*6px 12px 4px;/);
  assert.ok(!css.includes('clip-path: polygon(15% 0'));
  assert.match(css, /\.store-recording-summary-group::before\s*{[\s\S]*?width:\s*316px;[\s\S]*?height:\s*164px;[\s\S]*?recording-card-background-layer\.png[\s\S]*?opacity:\s*1;/);
  assert.match(css, /\.store-recording-summary\s*{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?min-height:\s*166px;/);
  assert.match(css, /\.store-recording-summary-group,[\s\S]*?\.tone-green\s*{[\s\S]*?grid-template-rows:\s*61px minmax\(86px, auto\);[\s\S]*?border-radius:\s*16px;/);
  assert.match(css, /\.store-recording-summary-scene\s*{[\s\S]*?min-height:\s*70px;[\s\S]*?border-radius:\s*14px;/);
  assert.match(css, /\.hm-layout-bottom\s*{[\s\S]*?grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.hm-layout-bottom \.hm-item\.single-metric\s*{[\s\S]*?min-height:\s*78px;[\s\S]*?border-radius:\s*16px;/);
});

test('the first quality metric tooltip opens inward without being clipped', () => {
  assert.match(css, /\.hm-layout-bottom \.hm-item:first-child \.metric-def-tooltip\s*{[\s\S]*?left:\s*0;[\s\S]*?right:\s*auto;/);
  assert.match(css, /\.hm-layout-bottom \.hm-item:first-child \.metric-def-tooltip::before\s*{[\s\S]*?left:\s*6px;[\s\S]*?right:\s*auto;/);
});

test('store dashboard cache versions refresh the updated CSS and runtime', () => {
  const version = '20260805-issue-rule-shared';
  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(pageRuntime.includes(`const version = '${version}'`));
});
