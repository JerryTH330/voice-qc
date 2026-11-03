const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { setup } = require('./helpers/unified-dom.cjs');

const scenes = ['首触跟进', '邀约到店', '排程确认', '销售接待', '试乘试驾'];

test('configuration saves each standard scene independently for the same model', () => {
  const h = setup('store', '', { file: 'config/index.html', search: '?route=config' });
  Object.defineProperty(h.window.HTMLInputElement.prototype, 'checked', {
    configurable: true,
    get() { return this.hasAttribute('checked'); },
    set(value) { this.toggleAttribute('checked', Boolean(value)); }
  });
  h.c.selectTask(2);
  assert.deepEqual([...h.host.querySelectorAll('#scenarioSelectOptions input')].map(input => input.value), scenes);
  for (const scene of scenes) {
    h.c.setCustomSelectValues('scenarioSelectOptions', [scene], 'scenarioSelectTrigger');
    h.c.setCustomSelectValues('modelSelectOptions', ['M8'], 'modelSelectTrigger');
    if (!h.host.querySelector('.rule-card')) h.c.addRuleItem('确认需求', '确认客户需求');
    h.c.enableTaskConfig();
    assert.match(h.host.querySelector('#feedbackModalTitle').textContent, /已更新/, scene);
    h.c.selectTask(1);
    h.c.selectTask(2);
    assert.deepEqual(Array.from(h.c.getCustomSelectValues('scenarioSelectOptions')), [scene]);
    assert(h.host.querySelector('#taskList').textContent.includes(`业务场景: ${scene}`));
  }
});

test('script lookup isolates all five scenes and never falls back to invitation topics', () => {
  const h = setup('store', '', { file: 'script-library/index.html', search: '?route=script-library' });
  const keys = ['first_follow', 'invite_store', 'schedule_confirm', 'store_reception', 'test_drive'];
  const source = Object.fromEntries(keys.map((key, index) => [key, { topics: [{ id: key, scene: scenes[index] }] }]));
  for (const [index, scene] of scenes.entries()) {
    assert.deepEqual(Array.from(h.c.getScriptLibraryTopicsByScene(scene, source), item => item.id), [keys[index]]);
    assert.equal(h.c.getScriptLibraryEvidenceLabel(scene), index < 3 ? '到店' : '下订');
  }
  assert.equal(h.c.getScriptLibraryTopicsByScene('旧场景', source).length, 0);
  assert.deepEqual(Array.from(h.c.getScriptLibraryTopicsByScene('全部', source), item => item.id), keys);
  const topics = h.c.getScriptLibraryTopicsByScene('邀约到店', vm.runInContext('scriptLibraryData.globalPool', h.c));
  assert(topics.length > 0);
  assert(topics.every(topic => topic.scene === '邀约到店'));
  assert.equal(h.c.getScriptLibraryTopicsByScene('首触跟进', vm.runInContext('scriptLibraryData.globalPool', h.c)).length, 0);
});

test('monthly training has five independent packages and empty scenes stay empty', () => {
  const h = setup('store', '', { file: 'script-library/index.html', search: '?route=script-library' });
  for (const scene of scenes) {
    vm.runInContext(`scriptLibraryState.monthlyScene = ${JSON.stringify(scene)}`, h.c);
    const items = h.c.getMonthlyTrainingItems();
    assert(items.every(topic => topic.scene === scene));
    assert.equal(items.length > 0, scene === '邀约到店');
  }
});

test('recording detail accepts old scene links without displaying old scene names', () => {
  const h = setup('store');
  for (const scene of scenes) assert.equal(h.c.normalizeLeadDetailSceneLabel(scene), scene);
  for (const [old, expected] of [['电话邀约', '邀约到店'], ['试驾PDC', '排程确认'], ['门店接待', '销售接待'], ['试驾', '试乘试驾']]) {
    assert.equal(h.c.normalizeLeadDetailSceneLabel(old), expected);
  }
  assert.equal(h.c.normalizeLeadDetailSceneLabel('未提供的场景'), '—');
});

test('recording source mapping recognizes the five standard scenes', () => {
  const { getSessionSourceFromStage } = require('../session-search-utils.js');
  assert.deepEqual(scenes.map(getSessionSourceFromStage), ['云外呼', '云外呼', '云外呼', '工牌', '工牌']);
});
