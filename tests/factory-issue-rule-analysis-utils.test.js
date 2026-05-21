const test = require('node:test');
const assert = require('node:assert/strict');

const { sortIssueOrgRows } = require('../factory-dashboard/issue-rule-analysis-utils.js');

const sampleRows = [
  { name: '广州天河店', rate: 50, hitCount: 72, sampleCount: 144 },
  { name: '广州番禺店', rate: 45, hitCount: 38, sampleCount: 84 },
  { name: '广州增城店', rate: 42, hitCount: 26, sampleCount: 63 },
  { name: '广州白云店', rate: 37, hitCount: 37, sampleCount: 100 },
  { name: '广州花都店', rate: 48, hitCount: 51, sampleCount: 106 },
  { name: '广州从化店', rate: 41, hitCount: 44, sampleCount: 108 }
];

test('issue org drill list keeps all rows and sorts by rate descending by default', () => {
  const sorted = sortIssueOrgRows(sampleRows, 'rate-desc');

  assert.equal(sorted.length, sampleRows.length);
  assert.deepEqual(
    sorted.map(item => item.name),
    ['广州天河店', '广州花都店', '广州番禺店', '广州增城店', '广州从化店', '广州白云店']
  );
});

test('issue org drill list can sort by rate ascending', () => {
  const sorted = sortIssueOrgRows(sampleRows, 'rate-asc');

  assert.deepEqual(
    sorted.map(item => item.name),
    ['广州白云店', '广州从化店', '广州增城店', '广州番禺店', '广州花都店', '广州天河店']
  );
});

test('issue org drill list follows hit count priority sort', () => {
  const sorted = sortIssueOrgRows(sampleRows, 'count-desc');

  assert.deepEqual(
    sorted.map(item => item.name),
    ['广州天河店', '广州花都店', '广州从化店', '广州番禺店', '广州白云店', '广州增城店']
  );
});

test('issue org drill list follows sample count priority sort', () => {
  const sorted = sortIssueOrgRows(sampleRows, 'sample-desc');

  assert.deepEqual(
    sorted.map(item => item.name),
    ['广州天河店', '广州从化店', '广州花都店', '广州白云店', '广州番禺店', '广州增城店']
  );
});
