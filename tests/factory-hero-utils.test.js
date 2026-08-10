const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getFactoryHeroSubtitle,
  buildFactoryRecordingSummary
} = require('../factory-dashboard/factory-hero-utils.js');

test('factory hero subtitle uses user organization instead of active filters', () => {
  const subtitle = getFactoryHeroSubtitle({
    organization: '华南大区',
    region: '广州'
  }, {
    brand: '埃安',
    currentRegion: '华东大区',
    currentZone: '上海战区',
    currentStore: '上海浦东店'
  });

  assert.equal(subtitle, '华南大区');
});

test('factory hero subtitle falls back to region when organization is missing', () => {
  const subtitle = getFactoryHeroSubtitle({
    region: '广州'
  });

  assert.equal(subtitle, '广州');
});

test('recording summary exposes source visibility and only shows selected scene counts', () => {
  const summary = buildFactoryRecordingSummary({
    selectedScenes: ['first_follow'],
    visibility: { cloud: true, badge: false },
    cloudTotal: 6,
    badgeTotal: 26,
    sceneCounts: {
      first_follow: 3,
      invite_store: 2,
      schedule_confirm: 1,
      store_reception: 18,
      test_drive: 8
    }
  });

  assert.equal(summary.cloud.label, '云外呼录音数');
  assert.equal(summary.cloud.visible, true);
  assert.equal(summary.cloud.value, 6);
  assert.deepEqual(summary.cloud.scenes, [
    { key: 'first_follow', label: '首触跟进', value: 3 }
  ]);
  assert.equal(summary.badge.label, '门店工牌录音数');
  assert.equal(summary.badge.visible, false);
  assert.equal(summary.badge.value, 26);
  assert.deepEqual(summary.badge.scenes, []);
});

test('recording summary shows all five scene counts when all scenes are selected', () => {
  const summary = buildFactoryRecordingSummary({
    selectedScenes: [
      'first_follow',
      'invite_store',
      'schedule_confirm',
      'store_reception',
      'test_drive'
    ],
    cloudTotal: 6,
    badgeTotal: 26,
    sceneCounts: {
      first_follow: 3,
      invite_store: 2,
      schedule_confirm: 1,
      store_reception: 18,
      test_drive: 8
    }
  });

  assert.deepEqual(summary.cloud.scenes.map((scene) => scene.label), [
    '首触跟进',
    '邀约进店',
    '排程确认'
  ]);
  assert.deepEqual(summary.badge.scenes.map((scene) => scene.label), [
    '进店接待',
    '试乘试驾'
  ]);
});
