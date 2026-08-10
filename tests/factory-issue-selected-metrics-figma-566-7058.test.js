const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const rule = (selector) => css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] || '';

test('下钻指标卡按 Figma 566:7058 的双列尺寸展示', () => {
  const metrics = rule('\\.issue-selected-metrics');
  const card = rule('\\.issue-selected-metric-card');

  assert.match(metrics, /grid-template-columns:\s*repeat\(2, minmax\(0, 321px\)\);/);
  assert.match(metrics, /width:\s*100%;/);
  assert.match(metrics, /max-width:\s*654px;/);
  assert.match(metrics, /gap:\s*12px;/);
  assert.match(card, /height:\s*80px;/);
  assert.match(card, /padding:\s*13px 17px 13px 13px;/);
  assert.match(card, /border:\s*1px solid rgba\(37, 99, 235, 0\.14\);/);
  assert.match(card, /border-radius:\s*14px;/);
  assert.match(card, /background:\s*linear-gradient\(180deg, rgba\(248, 251, 255, 0\.49\), rgba\(241, 246, 255, 0\.46\)\);/);
  assert.match(card, /backdrop-filter:\s*blur\(4px\);/);
});

test('下钻指标卡使用 Figma 原始图标和文字规格', () => {
  const icon = rule('\\.issue-selected-metric-icon');
  const image = rule('\\.issue-selected-metric-icon img');
  const body = rule('\\.issue-selected-metric-body');
  const label = rule('\\.issue-selected-metric-label');
  const value = rule('\\.issue-selected-metric-value');
  const rateAsset = path.join(root, 'assets', 'factory-issue-overview', 'metric-rate-icon-566-7059.png');
  const countAsset = path.join(root, 'assets', 'factory-issue-overview', 'metric-count-icon-566-7081.png');

  assert.ok(fs.existsSync(rateAsset));
  assert.ok(fs.existsSync(countAsset));
  assert.ok(runtime.includes('../assets/factory-issue-overview/metric-rate-icon-566-7059.png'));
  assert.ok(runtime.includes('../assets/factory-issue-overview/metric-count-icon-566-7081.png'));
  assert.match(icon, /width:\s*48px;/);
  assert.match(icon, /height:\s*48px;/);
  assert.match(image, /width:\s*48px;/);
  assert.match(image, /height:\s*48px;/);
  assert.match(body, /gap:\s*0;/);
  assert.match(label, /color:\s*#52627a;/);
  assert.match(label, /font-size:\s*14px;/);
  assert.match(label, /font-weight:\s*500;/);
  assert.match(value, /color:\s*#243047;/);
  assert.match(value, /font-size:\s*24px;/);
  assert.match(value, /font-weight:\s*600;/);
  assert.match(value, /line-height:\s*normal;/);
});
