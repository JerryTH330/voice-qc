const test = require('node:test');
const assert = require('node:assert/strict');

const {
  VIEW_KEYS,
  SCENE_KEYS,
  ALL_FILTER,
  SCRIPT_LIBRARY_TAGS,
  scriptLibraryExamplePayload,
  getMonthlyPackage,
  getLatestMonth,
  getSceneTopicsFromPayload
} = require('../script-library/script-library-contract.js');

test('VIEW_KEYS equals the shared view contract', () => {
  assert.deepEqual(VIEW_KEYS, { global: 'global', monthly: 'monthly' });
});

test('SCENE_KEYS equals the shared scene contract', () => {
  assert.deepEqual(SCENE_KEYS, { invite: 'invite', reception: 'reception', testDrive: 'test_drive' });
});

test('ALL_FILTER equals all', () => {
  assert.equal(ALL_FILTER, 'all');
});

test('latest month from example payload is 2026-05', () => {
  assert.equal(getLatestMonth(scriptLibraryExamplePayload), '2026-05');
});

test('getMonthlyPackage returns the 2026-05 monthly package', () => {
  assert.equal(getMonthlyPackage(scriptLibraryExamplePayload, '2026-05').month, '2026-05');
});

test('monthly invite topics for 2026-05 contains exactly 2 topics', () => {
  assert.equal(
    getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-05', SCENE_KEYS.invite).length,
    2
  );
});

test('first monthly invite topic uses tag objects and array conditions', () => {
  const firstMonthlyTopic = getSceneTopicsFromPayload(
    scriptLibraryExamplePayload,
    'monthly',
    '2026-05',
    SCENE_KEYS.invite
  )[0];

  assert.equal(firstMonthlyTopic.primary_tags[0].tag_code, 'T01');
  assert.equal(Array.isArray(firstMonthlyTopic.apply_when), true);
  assert.equal(Array.isArray(firstMonthlyTopic.avoid_when), true);
});

test('2026-04 monthly invite topic also uses normalized tag and condition arrays', () => {
  const aprilMonthlyTopic = getSceneTopicsFromPayload(
    scriptLibraryExamplePayload,
    'monthly',
    '2026-04',
    SCENE_KEYS.invite
  )[0];

  assert.equal(aprilMonthlyTopic.primary_tags[0].tag_code, 'T04');
  assert.equal(Array.isArray(aprilMonthlyTopic.apply_when), true);
  assert.equal(Array.isArray(aprilMonthlyTopic.avoid_when), true);
});

test('monthly reception topics for 2026-05 are empty', () => {
  assert.equal(
    getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-05', SCENE_KEYS.reception).length,
    0
  );
});

test('global invite topics contains exactly 3 topics', () => {
  assert.equal(
    getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.invite).length,
    3
  );
});

test('first global invite topic uses the expected second tag object', () => {
  const firstGlobalTopic = getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.invite)[0];

  assert.equal(firstGlobalTopic.primary_tags[1].tag_code, 'T09');
});

test('getMonthlyPackage returns null for missing months', () => {
  assert.equal(getMonthlyPackage(scriptLibraryExamplePayload, '2099-01'), null);
});

test('getSceneTopicsFromPayload returns an empty array for invalid mode', () => {
  assert.deepEqual(
    getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'invalid-mode', '', SCENE_KEYS.invite),
    []
  );
});

test('global test drive topics are empty', () => {
  assert.equal(
    getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.testDrive).length,
    0
  );
});

test('tag metadata includes the expected labels', () => {
  assert.equal(SCRIPT_LIBRARY_TAGS.T01.tag_name, '深度需求挖掘');
  assert.equal(SCRIPT_LIBRARY_TAGS.T07.tag_name, '微信留资承接');
  assert.equal(SCRIPT_LIBRARY_TAGS.T09.tag_name, '到店邀约推进');
});
