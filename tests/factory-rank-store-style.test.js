const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const parityCss = css.slice(css.lastIndexOf('/* 厂端质检排行：对齐门店看板顾问排行，并保留组织层级展开。 */'));

test('factory quality ranking keeps its hierarchy interactions', () => {
  assert.ok(source.includes('id="rank-expand-toggle"'));
  assert.ok(source.includes('class="rank-row${hasChildren ? \' rank-expandable\' : \'\'}"'));
  assert.ok(source.includes('class="factory-qc-rank-table factory-qc-rank-nested"'));
  assert.ok(source.includes("window._rankToggle(expandId, row, shouldOpen)"));
});

test('factory quality ranking matches the store advisor ranking style', () => {
  assert.match(parityCss, /\.sop-rank-track\s*{[\s\S]*?padding:\s*20px 0 0;[\s\S]*?border-radius:\s*20px;[\s\S]*?box-shadow:\s*0 18px 32px rgba\(15, 23, 42, 0\.05\);/);
  assert.match(parityCss, /\.sop-rank-track \.section-title-bar\s*{[\s\S]*?padding:\s*0 20px;[\s\S]*?margin-bottom:\s*20px;/);
  assert.match(parityCss, /\.sop-rank-track \.track-body\s*{[\s\S]*?padding:\s*0 20px 20px;/);
  assert.match(parityCss, /\.factory-qc-rank-table thead th\s*{[\s\S]*?height:\s*41px;[\s\S]*?padding:\s*0 12px;[\s\S]*?line-height:\s*16\.1px;/);
  assert.match(parityCss, /tr:not\(\.rank-expand-panel\)\s*{[\s\S]*?height:\s*55px;/);
  assert.match(parityCss, /\.rank-expand-panel > td\s*{[\s\S]*?padding:\s*0;[\s\S]*?border-top:\s*0;/);
  assert.match(parityCss, /\.factory-rank-sort-indicator\s*{[\s\S]*?visibility:\s*hidden;/);
});

test('factory quality ranking uses the same seven-column proportions as store ranking', () => {
  assert.ok(source.includes('<col style="width:8.31%">'));
  assert.ok(source.includes('<col style="width:11.51%">'));
  assert.ok(source.includes('<col style="width:15.76%">'));
  assert.ok(source.includes('<col style="width:16.22%">'));
  assert.equal((source.match(/<col style="width:16\.0[67]%">/g) || []).length, 3);
});
