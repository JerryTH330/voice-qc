const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'factory-dashboard', 'index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.js'), 'utf8');

test('厂端录音统计按业务场景隐藏未选来源并让单卡满宽', () => {
  assert.ok(runtime.includes('getRecordingSourceVisibility'));
  assert.match(runtime, /const visibility = getRecordingSourceVisibility\(currentSource, currentScenes\);/);
  assert.match(runtime, /const visibleGroups = \[summary\.cloud, summary\.badge\]\.filter\(\(group\) => group\.visible\);/);
  assert.match(runtime, /store-recording-summary\$\{visibleGroups\.length === 1 \? ' is-single-source' : ''\}/);
  assert.match(runtime, /visibleGroups\.map\(renderRecordingSummaryGroup\)\.join\(''\)/);
  assert.match(css, /\.factory-dashboard-page \.store-recording-summary\.is-single-source\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/);
});

test('厂端页面统一刷新录音来源联动资源', () => {
  const version = '20260805-issue-rule-shared';

  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(bootstrap.includes(`const assetVersion = '${version}'`));
});
