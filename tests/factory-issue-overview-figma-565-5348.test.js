const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'factory-dashboard', 'factory-dashboard.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'factory-dashboard', 'index.html'), 'utf8');
const pageCss = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.css'), 'utf8');
const pageJs = fs.readFileSync(path.join(root, 'factory-dashboard', 'page.js'), 'utf8');

test('厂端录音复盘按 Figma 565:5348 收紧外框与列表', () => {
  assert.match(css, /\.issue-overview-wrapper\s*{[\s\S]*?gap:\s*16px;[\s\S]*?padding:\s*21px;/);
  assert.match(css, /\.issue-detail-pad\s*{[\s\S]*?padding:\s*0;/);
  assert.match(css, /\.issue-rule-list-shell\s*{[\s\S]*?padding:\s*13px;/);
  assert.match(css, /\.issue-rule-row\s*{[\s\S]*?min-height:\s*40px;[\s\S]*?padding:\s*8px 13px;/);
  assert.match(css, /\.issue-rule-name-line\s*{[\s\S]*?flex-direction:\s*row;[\s\S]*?align-items:\s*center;/);
});

test('规则表头与分页使用设计稿结构', () => {
  assert.doesNotMatch(runtime, /<small>所属业务场景<\/small>/);
  assert.match(runtime, /class="issue-pagination-page-size">\$\{ISSUE_RULE_PAGE_SIZE\} 条\/\u9875<\/span>/);
  assert.match(runtime, /class="issue-rule-page-number page-num\$\{page === currentPage \? ' active' : ''\}"/);
  assert.match(runtime, /class="page-select page-jump-select"/);
  assert.match(runtime, /data-issue-page-jump/);
  assert.match(css, /\.issue-rule-pagination \.dashboard-pagination\s*{[\s\S]*?padding:\s*0;/);
});

test('场景标签仅显示首字并保留完整语义', () => {
  assert.match(runtime, /const getIssueRuleSceneTagLabel = \(label\) => Array\.from\(String\(label \?\? ''\)\.trim\(\)\)\[0\] \|\| '';/);
  assert.match(runtime, /<em title="\$\{escapeHtml\(label\)\}" data-tag-label="\$\{escapeHtml\(label\)\}" aria-label="\$\{escapeHtml\(label\)\}">\$\{escapeHtml\(getIssueRuleSceneTagLabel\(label\)\)\}<span class="issue-rule-tag-popover" role="tooltip">\$\{escapeHtml\(label\)\}<\/span><\/em>/);
});

test('操作列补齐右箭头，表头与数据列对齐', () => {
  assert.match(css, /\.issue-rule-action::after\s*\{/);
  const headInlinePadding = Number(css.match(/\.issue-rule-list-head\s*\{[\s\S]*?padding:\s*0 (\d+)px;/)?.[1]);
  const rowBorderWidth = Number(css.match(/\.issue-rule-row\s*\{[\s\S]*?border:\s*(\d+)px solid/)?.[1]);
  const rowInlinePadding = Number(css.match(/\.issue-rule-row\s*\{[\s\S]*?padding:\s*\d+px (\d+)px;/)?.[1]);
  const actionHeadRule = css.match(/\.issue-rule-list-head > :last-child\s*\{([^}]*)\}/)?.[1] || '';
  const actionRule = css.match(/\.issue-rule-action\s*\{([^}]*)\}/)?.[1] || '';

  assert.equal(headInlinePadding, rowBorderWidth + rowInlinePadding);
  assert.match(actionHeadRule, /justify-self:\s*start;/);
  assert.match(actionHeadRule, /width:\s*auto;/);
  assert.match(actionRule, /justify-self:\s*start;/);
});

test('规则列表按 Figma 565:5402 的尺寸与间距展示', () => {
  assert.match(css, /--issue-rule-list-columns:\s*minmax\(0, 312px\) 70px 98px 92px;/);
  assert.match(css, /\.issue-rule-list-shell\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*654px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*13px;/);
  assert.match(css, /\.issue-rule-row\s*\{[\s\S]*?height:\s*40px;[\s\S]*?padding:\s*8px 13px;/);
  assert.match(css, /\.issue-rule-list-head > :last-child\s*\{[\s\S]*?justify-self:\s*start;[\s\S]*?width:\s*auto;/);
  assert.match(css, /\.issue-rule-tags > em\s*\{[\s\S]*?width:\s*30px;[\s\S]*?height:\s*22px;[\s\S]*?border:\s*1px solid #d3dff6;[\s\S]*?color:\s*#215fd0;/);
});

test('排序下拉 icon 保持原有 SVG 不变', () => {
  assert.match(runtime, /<svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">\s*<path d="M4 6\.5L8 10\.5L12 6\.5"/);
});

test('导出按钮使用 Figma 原始图标资源', () => {
  const asset = path.join(root, 'assets', 'factory-issue-overview', 'export-icon-565-5396.svg');

  assert.ok(fs.existsSync(asset));
  assert.ok(runtime.includes('../assets/factory-issue-overview/export-icon-565-5396.svg'));
  assert.match(css, /\.issue-rule-export-btn img\s*{[\s\S]*?width:\s*18px;[\s\S]*?height:\s*18px;/);
});

test('厂端页面刷新 Figma 565:5348 版本资源', () => {
  const version = '20260805-issue-rule-shared';

  assert.ok(html.includes(`page.css?v=${version}`));
  assert.ok(html.includes(`page.js?v=${version}`));
  assert.ok(pageCss.includes(`factory-dashboard.css?v=${version}`));
  assert.ok(pageJs.includes(`const assetVersion = '${version}'`));
});
