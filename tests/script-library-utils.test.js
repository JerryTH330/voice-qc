const test = require('node:test');
const assert = require('node:assert/strict');

const {
  VIEW_KEYS,
  SCENE_KEYS,
  ALL_FILTER,
  scriptLibraryExamplePayload
} = require('../script-library/script-library-contract.js');
const {
  getDefaultScriptLibraryState,
  buildScriptLibraryViewModel
} = require('../script-library/script-library-utils.js');

test('default state equals the latest-month global invite all-filter state', () => {
  assert.deepEqual(getDefaultScriptLibraryState(scriptLibraryExamplePayload), {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    tag: ALL_FILTER,
    goal: ALL_FILTER,
    status: ALL_FILTER,
    month: '2026-05',
    selectedTopicId: null
  });
});

test('monthly invite mode for 2026-05 exposes approved monthly stats and topics', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.monthly,
    scene: SCENE_KEYS.invite,
    month: '2026-05'
  });

  assert.equal(model.flags.showMonthFilter, true);
  assert.equal(model.flags.showStatusFilter, false);
  assert.equal(model.topics.length, 2);
  assert.equal(model.stats[0].label, '本月新增主题数');
  assert.equal(model.stats[2].value, '到店邀约推进');
});

test('global invite mode with active status returns only active topic ids', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    status: 'active'
  });

  assert.deepEqual(
    model.topics.map((topic) => topic.topic_id),
    ['inv-p-001', 'inv-p-003']
  );
});

test('reception scene returns the selectable empty state metadata', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    scene: SCENE_KEYS.reception
  });

  assert.equal(model.sceneMeta.hasSceneData, false);
  assert.equal(model.sceneMeta.emptyTitle, '接待主题待接入');
  assert.match(model.sceneMeta.emptyDescription, /后续接入接待单条打标/);
});

test('selected topic falls back to first visible topic when filters remove current choice', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    tag: 'T07',
    selectedTopicId: 'inv-p-001'
  });

  assert.equal(model.selectedTopic.topic_id, 'inv-p-002');
  assert.equal(model.state.selectedTopicId, 'inv-p-002');
});

test('global invite mode exposes approved UI-facing copy', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite
  });

  assert.equal(model.listTitle, '长期主题库');
  assert.equal(model.modeHint, '长期沉淀主题');
  assert.equal(model.matchCountLabel, '匹配 3 个主题');
});

test('global invite selected topic exposes renderer-ready display fields', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    selectedTopicId: 'inv-p-001'
  });

  assert.equal(model.selectedTopic.display_title, '先挖需求再推进到店');
  assert.equal(Array.isArray(model.selectedTopic.display_tag_names), true);
  assert.equal(model.selectedTopic.display_status_label, '长期生效');
  assert.equal(Array.isArray(model.selectedTopic.display_training_points), true);
  assert.equal(Array.isArray(model.selectedTopic.display_apply_when), true);
  assert.equal(Array.isArray(model.selectedTopic.display_representative_samples), true);
});
