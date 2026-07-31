const test = require('node:test');
const assert = require('node:assert/strict');

const {
  sortIssueOrgRows,
  aggregateIssueRulesByScenes
} = require('../factory-dashboard/issue-rule-analysis-utils.js');

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

test('same rule id aggregates hit and sample counts across selected applicable scenes', () => {
  const rules = [{
    id: 'rule-shared',
    name: '需求确认',
    sceneStats: {
      first_follow: { hitCount: 80, sampleCount: 100 },
      invite_store: { hitCount: 30, sampleCount: 50 },
      schedule_confirm: { hitCount: 18, sampleCount: 20 }
    }
  }];

  const [rule] = aggregateIssueRulesByScenes(rules, ['first_follow', 'invite_store']);

  assert.deepEqual(rule.applicableScenes, ['first_follow', 'invite_store']);
  assert.equal(rule.hitCount, 110);
  assert.equal(rule.sampleCount, 150);
  assert.equal(rule.rate, 73);
});

test('different rule ids remain separate even when their names are the same', () => {
  const rules = [
    {
      id: 'reception-needs',
      name: '需求确认',
      sceneStats: {
        store_reception: { hitCount: 36, sampleCount: 60 }
      }
    },
    {
      id: 'test-drive-needs',
      name: '需求确认',
      sceneStats: {
        test_drive: { hitCount: 32, sampleCount: 40 }
      }
    }
  ];

  const visible = aggregateIssueRulesByScenes(rules, ['store_reception', 'test_drive']);

  assert.equal(visible.length, 2);
  assert.deepEqual(visible.map(rule => rule.id), ['reception-needs', 'test-drive-needs']);
  assert.deepEqual(visible.map(rule => rule.applicableScenes), [['store_reception'], ['test_drive']]);
});

test('rules outside the selected scene range are hidden', () => {
  const rules = [{
    id: 'test-drive-safety',
    name: '试驾安全说明',
    sceneStats: {
      test_drive: { hitCount: 32, sampleCount: 40 }
    }
  }];

  assert.deepEqual(aggregateIssueRulesByScenes(rules, ['store_reception']), []);
});
