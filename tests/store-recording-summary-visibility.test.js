const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'store-dashboard/page.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'store-dashboard/index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'store-dashboard/page.js'), 'utf8');

test('store recording summary hides unselected sources and expands the remaining card', () => {
  assert.ok(runtime.includes('getRecordingSourceVisibility'));
  assert.match(runtime, /const visibleGroups = \[summary\.cloud, summary\.badge\]\.filter\(\(group\) => group\.visible\);/);
  assert.match(runtime, /store-recording-summary\$\{visibleGroups\.length === 1 \? ' is-single-source' : ''\}/);
  assert.match(runtime, /visibleGroups\.map\(renderStoreRecordingSummaryGroup\)\.join\(''\)/);
  assert.match(css, /\.store-recording-summary\.is-single-source\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/);
});

test('store dashboard refreshes the recording visibility assets together', () => {
  const version = '20260810-sticky-24px-v5';

  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(bootstrap.includes(`const version = '${version}'`));
});
