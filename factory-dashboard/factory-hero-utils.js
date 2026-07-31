(function (global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  global.__factoryHeroUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const getFactoryHeroSubtitle = (profile) => {
    const organization = String(profile?.organization || '').trim();
    if (organization) {
      return organization;
    }
    return String(profile?.region || '').trim();
  };

  const buildFactoryRecordingSummary = ({
    selectedScenes = [],
    cloudTotal = 0,
    badgeTotal = 0,
    sceneCounts = {}
  } = {}) => {
    const selected = new Set(selectedScenes);
    const createScene = (key, label) => ({
      key,
      label,
      value: Number(sceneCounts[key]) || 0
    });

    return {
      cloud: {
        label: '云外呼录音数',
        value: Number(cloudTotal) || 0,
        unit: '条',
        tone: 'blue',
        scenes: [
          createScene('first_follow', '首触跟进'),
          createScene('invite_store', '邀约进店'),
          createScene('schedule_confirm', '排程确认')
        ].filter((scene) => selected.has(scene.key))
      },
      badge: {
        label: '门店工牌录音数',
        value: Number(badgeTotal) || 0,
        unit: '条',
        tone: 'green',
        scenes: [
          createScene('store_reception', '进店接待'),
          createScene('test_drive', '试乘试驾')
        ].filter((scene) => selected.has(scene.key))
      }
    };
  };

  return {
    getFactoryHeroSubtitle,
    buildFactoryRecordingSummary
  };
});
