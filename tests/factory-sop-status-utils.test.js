const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeSOPLeadStatuses,
  toggleSOPLeadStatusSelection,
  getSOPLeadStatusOptionState
} = require('../factory-sop-status-utils.js');

const OPTIONS = [
  '全部',
  '已下订',
  '战败',
  '战败申请中',
  '跟进中',
  '无效',
  '有效',
  '异地成交'
];

test('全部选中时，其它状态都显示为选中', () => {
  const selection = normalizeSOPLeadStatuses(['全部'], OPTIONS, ['全部']);

  assert.deepEqual(selection, ['全部']);
  assert.equal(getSOPLeadStatusOptionState(selection, '全部', OPTIONS).isActive, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '全部', OPTIONS).isIndeterminate, false);
  assert.equal(getSOPLeadStatusOptionState(selection, '已下订', OPTIONS).isActive, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '异地成交', OPTIONS).isActive, true);
});

test('选中一个或多个具体状态时，全部显示为半选', () => {
  let selection = toggleSOPLeadStatusSelection(['全部'], '已下订', OPTIONS, ['全部']);
  selection = toggleSOPLeadStatusSelection(selection, '战败', OPTIONS, ['全部']);

  assert.deepEqual(selection, ['已下订', '战败']);
  assert.equal(getSOPLeadStatusOptionState(selection, '全部', OPTIONS).isActive, false);
  assert.equal(getSOPLeadStatusOptionState(selection, '全部', OPTIONS).isIndeterminate, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '已下订', OPTIONS).isActive, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '战败', OPTIONS).isActive, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '有效', OPTIONS).isActive, false);
});

test('取消最后一个具体状态时，回退到全部', () => {
  const selection = toggleSOPLeadStatusSelection(['已下订'], '已下订', OPTIONS, ['全部']);

  assert.deepEqual(selection, ['全部']);
  assert.equal(getSOPLeadStatusOptionState(selection, '全部', OPTIONS).isActive, true);
  assert.equal(getSOPLeadStatusOptionState(selection, '跟进中', OPTIONS).isActive, true);
});
