const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SOURCE_KEYS,
  SCENE_KEYS,
  getAllowedScenes,
  getDefaultScenes,
  normalizeSceneSelection,
  setSourceSelection,
  toggleSceneSelection,
  getLegacySceneBucket,
  getInvitationSceneCount,
  getSceneVolumeLabel,
  getBusinessMetricKeysForSelection
} = require('../dashboard-filter-utils.js');

test('cloud source defaults to three cloud scenes', () => {
  assert.deepEqual(getAllowedScenes(SOURCE_KEYS.cloud), [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore,
    SCENE_KEYS.scheduleConfirm
  ]);
  assert.deepEqual(getDefaultScenes(SOURCE_KEYS.cloud), [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore,
    SCENE_KEYS.scheduleConfirm
  ]);
});

test('badge source removes cloud-only scenes and keeps badge defaults', () => {
  const normalized = normalizeSceneSelection(SOURCE_KEYS.badge, [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.storeReception
  ]);

  assert.equal(normalized.isAllSelected, false);
  assert.deepEqual(normalized.activeScenes, [SCENE_KEYS.storeReception]);
  assert.equal(normalized.effectiveSceneKey, SCENE_KEYS.storeReception);
});

test('changing all source defaults to all individual scenes', () => {
  assert.deepEqual(
    setSourceSelection(SOURCE_KEYS.all),
    [SCENE_KEYS.all]
  );
});

test('all-selected scene set deselecting one child keeps the rest selected', () => {
  const next = toggleSceneSelection(
    SOURCE_KEYS.cloud,
    [SCENE_KEYS.firstFollow, SCENE_KEYS.inviteStore, SCENE_KEYS.scheduleConfirm],
    SCENE_KEYS.firstFollow
  );
  assert.deepEqual(next, [SCENE_KEYS.inviteStore, SCENE_KEYS.scheduleConfirm]);
});

test('cloud source keeps every allowed scene selected when all children are selected', () => {
  const next = toggleSceneSelection(
    SOURCE_KEYS.cloud,
    [SCENE_KEYS.firstFollow, SCENE_KEYS.inviteStore],
    SCENE_KEYS.scheduleConfirm
  );
  assert.deepEqual(next, [SCENE_KEYS.all]);
});

test('cloud sub-scenes map back to legacy invitation bucket', () => {
  assert.equal(getLegacySceneBucket(SCENE_KEYS.firstFollow), '邀约');
  assert.equal(getLegacySceneBucket(SCENE_KEYS.inviteStore), '邀约');
  assert.equal(getLegacySceneBucket(SCENE_KEYS.scheduleConfirm), '邀约');
});

test('changing source resets to that source default selection', () => {
  assert.deepEqual(
    setSourceSelection(SOURCE_KEYS.badge),
    [SCENE_KEYS.storeReception, SCENE_KEYS.testDrive]
  );
});

test('single cloud scenes keep distinct effective keys', () => {
  assert.equal(
    normalizeSceneSelection(SOURCE_KEYS.cloud, [SCENE_KEYS.firstFollow]).effectiveSceneKey,
    SCENE_KEYS.firstFollow
  );
  assert.equal(
    normalizeSceneSelection(SOURCE_KEYS.cloud, [SCENE_KEYS.inviteStore]).effectiveSceneKey,
    SCENE_KEYS.inviteStore
  );
  assert.equal(
    normalizeSceneSelection(SOURCE_KEYS.cloud, [SCENE_KEYS.scheduleConfirm]).effectiveSceneKey,
    SCENE_KEYS.scheduleConfirm
  );
});

test('partial cloud multi-select returns cloudMulti for legacy invitation rendering', () => {
  const normalized = normalizeSceneSelection(SOURCE_KEYS.cloud, [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore
  ]);

  assert.equal(normalized.isAllSelected, false);
  assert.equal(normalized.effectiveSceneKey, SCENE_KEYS.cloudMulti);
  assert.equal(normalized.legacySceneBucket, '邀约');
});

test('all selection reports 全部 label semantics through empty active scenes', () => {
  const normalized = normalizeSceneSelection(SOURCE_KEYS.all, [SCENE_KEYS.all]);

  assert.equal(normalized.isAllSelected, true);
  assert.equal(normalized.isNoneSelected, false);
  assert.deepEqual(normalized.activeScenes, []);
  assert.equal(normalized.effectiveSceneKey, SCENE_KEYS.all);
});

test('clicking all scene always returns all token', () => {
  const next = toggleSceneSelection(
    SOURCE_KEYS.cloud,
    [SCENE_KEYS.firstFollow],
    SCENE_KEYS.all
  );

  assert.deepEqual(next, [SCENE_KEYS.all]);
});

test('cloud source deselecting down to none returns empty state', () => {
  const next = toggleSceneSelection(
    SOURCE_KEYS.cloud,
    [SCENE_KEYS.firstFollow],
    SCENE_KEYS.firstFollow
  );

  assert.deepEqual(next, []);
});

test('empty selection is represented as none-selected, not all-selected', () => {
  const normalized = normalizeSceneSelection(SOURCE_KEYS.cloud, []);
  assert.equal(normalized.isAllSelected, false);
  assert.equal(normalized.isNoneSelected, true);
  assert.deepEqual(normalized.activeScenes, []);
});

test('badge source ignores cloud-only toggle attempts', () => {
  const next = toggleSceneSelection(
    SOURCE_KEYS.badge,
    [SCENE_KEYS.storeReception],
    SCENE_KEYS.firstFollow
  );

  assert.deepEqual(next, [SCENE_KEYS.storeReception]);
});

test('cloud invitation scenes produce distinct demo invitation counts', () => {
  assert.equal(getInvitationSceneCount(10, SCENE_KEYS.firstFollow), 4);
  assert.equal(getInvitationSceneCount(10, SCENE_KEYS.inviteStore), 4);
  assert.equal(getInvitationSceneCount(10, SCENE_KEYS.scheduleConfirm), 2);
  assert.equal(getInvitationSceneCount(10, SCENE_KEYS.cloudMulti), 10);
});

test('scene volume labels match spec wording', () => {
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.firstFollow), '首触跟进录音数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.inviteStore), '邀约进店录音数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.scheduleConfirm), '排程确认录音数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.cloudMulti), '云外呼录音数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.storeReception), '接待数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.testDrive), '试驾数');
  assert.equal(getSceneVolumeLabel(SCENE_KEYS.all), '总量');
});

test('business metric keys follow source and scene selection rules', () => {
  assert.deepEqual(
    getBusinessMetricKeysForSelection(SOURCE_KEYS.cloud, [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm
    ]),
    ['invitation']
  );
  assert.deepEqual(
    getBusinessMetricKeysForSelection(SOURCE_KEYS.badge, [
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ]),
    ['reception', 'test_drive']
  );
  assert.deepEqual(
    getBusinessMetricKeysForSelection(SOURCE_KEYS.all, [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm
    ]),
    ['invitation']
  );
  assert.deepEqual(
    getBusinessMetricKeysForSelection(SOURCE_KEYS.all, [
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ]),
    ['reception', 'test_drive']
  );
});
