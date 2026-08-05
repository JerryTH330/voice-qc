const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');

const rule = (selector) => css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] || '';
const lastRule = (selector) => [...css.matchAll(new RegExp(`${selector}\\s*\\{([^}]*)\\}`, 'g'))].at(-1)?.[1] || '';

test('组织列表按 Figma 566:7129 的外框与四列布局展示', () => {
  const card = rule('\\.issue-org-rank-card');
  const head = rule('\\.issue-org-list-head');
  const actionHead = rule('\\.issue-org-list-head > :last-child');

  assert.match(card, /--issue-org-list-columns:\s*minmax\(0, 406px\) 48px 76px 42px;/);
  assert.match(card, /width:\s*100%;/);
  assert.match(card, /max-width:\s*654px;/);
  assert.match(card, /align-self:\s*center;/);
  assert.match(card, /gap:\s*12px;/);
  assert.match(card, /padding:\s*13px;/);
  assert.match(head, /padding:\s*0 12px;/);
  assert.match(head, /color:\s*#8a96ab;/);
  assert.match(head, /font-size:\s*14px;/);
  assert.match(head, /font-weight:\s*600;/);
  assert.match(head, /line-height:\s*21px;/);
  assert.match(actionHead, /justify-self:\s*start;/);
});

test('组织列表行与文字按 Figma 566:7129 收紧', () => {
  const row = lastRule('\\.issue-org-row');
  const rank = rule('\\.issue-org-main em');
  const name = rule('\\.issue-org-main strong');
  const metrics = rule('\\.issue-org-rate,\\s*\\n\\.factory-dashboard-page \\.issue-org-count');
  const drill = rule('\\.issue-org-drill');

  assert.match(row, /min-height:\s*40px;/);
  assert.match(row, /padding:\s*9px 13px;/);
  assert.match(rank, /font-weight:\s*500;/);
  assert.match(name, /color:\s*#162033;/);
  assert.match(name, /font-weight:\s*600;/);
  assert.match(metrics, /font-family:\s*inherit;/);
  assert.match(metrics, /font-weight:\s*600;/);
  assert.match(drill, /display:\s*inline-flex;/);
  assert.match(drill, /gap:\s*6px;/);
  assert.match(drill, /justify-self:\s*start;/);
  assert.match(drill, /font-weight:\s*500;/);
});

test('组织下钻保留交互、补齐右箭头并与操作表头左对齐', () => {
  assert.match(runtime, /class="issue-org-drill\$\{row\.drillable \? ' drill-link' : ''\}"/);
  assert.match(css, /\.issue-org-drill\.drill-link::after\s*\{[\s\S]*?width:\s*6px;[\s\S]*?height:\s*6px;[\s\S]*?transform:\s*rotate\(45deg\);/);
});
