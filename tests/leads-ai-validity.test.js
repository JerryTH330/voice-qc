const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');

test('AI线索有效性位于线索状态之后并只使用三种标签', () => {
  const leadHeader = runtime.match(/function getLeadsTableHeaderMarkup[\s\S]*?function buildLeadCustomerAggregateRecords/)?.[0] || '';
  const leadStatusIndex = leadHeader.indexOf('<th>线索状态</th>');
  const aiValidityIndex = leadHeader.indexOf('<th>${renderAiLeadValidityHeader()}</th>');

  assert.ok(leadStatusIndex >= 0);
  assert.ok(aiValidityIndex > leadStatusIndex);
  assert.match(runtime, /const aiLeadValidityValues = \['有效', '无效', '暂未分析'\]/);
});

test('AI线索有效性提示严格使用产品判定口径', () => {
  const tooltip = runtime.match(/function renderAiLeadValidityHeader\(\)[\s\S]*?function syncLeadsViewTabs/)?.[0] || '';

  assert.match(tooltip, /有效：<\/b>线索下发后3天内，前3次外呼中，至少有1次通话时长不少于15秒，且客户未明确拒绝。/);
  assert.match(tooltip, /无效：<\/b>线索下发后3天内未外呼，或前3次外呼中没有任何一次同时满足“通话时长不少于15秒且客户未明确拒绝”。/);
  assert.match(tooltip, /暂未分析：<\/b>尚未对录音完成分析。/);
  assert.doesNotMatch(tooltip, /无法判断|录音中无有效内容/);
});

test('AI线索有效性标签按判定结果显示对应样式', () => {
  assert.match(runtime, /if \(value === '有效'\) return 'is-valid'/);
  assert.match(runtime, /if \(value === '无效'\) return 'is-invalid'/);
  assert.match(runtime, /<td><span class="ai-lead-validity-pill \$\{getAiLeadValidityClass\(item\.aiLeadValidity\)\}">\$\{escapeHtml\(item\.aiLeadValidity\)\}<\/span><\/td>/);
});
