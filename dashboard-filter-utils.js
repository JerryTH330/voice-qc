(function (global, factory) {
  const api = factory();
  global.__dashboardFilterUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const SOURCE_KEYS = {
    all: 'all',
    cloud: 'cloud',
    badge: 'badge'
  };

  const SCENE_KEYS = {
    all: 'all',
    firstFollow: 'first_follow',
    inviteStore: 'invite_store',
    scheduleConfirm: 'schedule_confirm',
    storeReception: 'store_reception',
    testDrive: 'test_drive',
    cloudMulti: 'cloud_multi'
  };

  const SOURCE_ALLOWED_SCENES = {
    [SOURCE_KEYS.all]: [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm,
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ],
    [SOURCE_KEYS.cloud]: [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm
    ],
    [SOURCE_KEYS.badge]: [
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ]
  };

  const SOURCE_DEFAULT_SCENES = {
    [SOURCE_KEYS.all]: [SCENE_KEYS.all],
    [SOURCE_KEYS.cloud]: [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm
    ],
    [SOURCE_KEYS.badge]: [
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ]
  };

  const SCENE_LABELS = {
    [SCENE_KEYS.all]: '全部',
    [SCENE_KEYS.firstFollow]: '首触跟进',
    [SCENE_KEYS.inviteStore]: '邀约进店',
    [SCENE_KEYS.scheduleConfirm]: '排程确认',
    [SCENE_KEYS.storeReception]: '进店接待',
    [SCENE_KEYS.testDrive]: '试乘试驾',
    [SCENE_KEYS.cloudMulti]: '云外呼'
  };

  const SOURCE_LABELS = {
    [SOURCE_KEYS.all]: '全部',
    [SOURCE_KEYS.cloud]: '云外呼',
    [SOURCE_KEYS.badge]: '工牌'
  };

  function getAllowedScenes(source) {
    return [...(SOURCE_ALLOWED_SCENES[source] || SOURCE_ALLOWED_SCENES[SOURCE_KEYS.all])];
  }

  function getDefaultScenes(source) {
    return [...(SOURCE_DEFAULT_SCENES[source] || SOURCE_DEFAULT_SCENES[SOURCE_KEYS.all])];
  }

  function dedupeScenes(scenes) {
    return [...new Set((scenes || []).filter(Boolean))];
  }

  function areAllAllowedScenesSelected(source, scenes) {
    const allowed = getAllowedScenes(source);
    return allowed.length > 0 && allowed.every((scene) => scenes.includes(scene));
  }

  function getLegacySceneBucket(sceneKey) {
    if ([SCENE_KEYS.firstFollow, SCENE_KEYS.inviteStore, SCENE_KEYS.scheduleConfirm, SCENE_KEYS.cloudMulti].includes(sceneKey)) {
      return '邀约';
    }
    if (sceneKey === SCENE_KEYS.storeReception) {
      return '门店接待';
    }
    if (sceneKey === SCENE_KEYS.testDrive) {
      return '试乘试驾';
    }
    return 'all';
  }

  function normalizeSceneSelection(source, scenes) {
    const allowedScenes = getAllowedScenes(source);
    const deduped = dedupeScenes(scenes);
    const explicitAll = deduped.includes(SCENE_KEYS.all);
    const cleaned = deduped.filter((scene) => allowedScenes.includes(scene));

    if (explicitAll || cleaned.length === 0 || areAllAllowedScenesSelected(source, cleaned)) {
      return {
        source,
        allowedScenes,
        activeScenes: [],
        isAllSelected: true,
        effectiveSceneKey: SCENE_KEYS.all,
        legacySceneBucket: 'all'
      };
    }

    if (cleaned.length === 1) {
      return {
        source,
        allowedScenes,
        activeScenes: cleaned,
        isAllSelected: false,
        effectiveSceneKey: cleaned[0],
        legacySceneBucket: getLegacySceneBucket(cleaned[0])
      };
    }

    return {
      source,
      allowedScenes,
      activeScenes: cleaned,
      isAllSelected: false,
      effectiveSceneKey: SCENE_KEYS.cloudMulti,
      legacySceneBucket: getLegacySceneBucket(SCENE_KEYS.cloudMulti)
    };
  }

  function setSourceSelection(source) {
    return getDefaultScenes(source);
  }

  function toggleSceneSelection(source, scenes, targetScene) {
    if (targetScene === SCENE_KEYS.all) {
      return [SCENE_KEYS.all];
    }

    const allowed = getAllowedScenes(source);
    if (!allowed.includes(targetScene)) {
      const current = normalizeSceneSelection(source, scenes);
      return current.isAllSelected ? [SCENE_KEYS.all] : current.activeScenes;
    }

    const normalized = normalizeSceneSelection(source, scenes);
    const active = normalized.isAllSelected ? [] : [...normalized.activeScenes];
    const nextActive = active.includes(targetScene)
      ? active.filter((scene) => scene !== targetScene)
      : [...active, targetScene];

    const next = normalizeSceneSelection(source, nextActive);
    return next.isAllSelected ? [SCENE_KEYS.all] : next.activeScenes;
  }

  function getSceneLabel(sceneKey) {
    return SCENE_LABELS[sceneKey] || SCENE_LABELS[SCENE_KEYS.all];
  }

  function getInvitationSceneCount(total, sceneKey) {
    const safeTotal = Math.max(0, Math.round(Number(total) || 0));
    if (sceneKey === SCENE_KEYS.firstFollow) return Math.max(1, Math.round(safeTotal * 0.42));
    if (sceneKey === SCENE_KEYS.inviteStore) return Math.max(1, Math.round(safeTotal * 0.36));
    if (sceneKey === SCENE_KEYS.scheduleConfirm) {
      const firstFollowCount = Math.max(1, Math.round(safeTotal * 0.42));
      const inviteStoreCount = Math.max(1, Math.round(safeTotal * 0.36));
      return Math.max(1, safeTotal - firstFollowCount - inviteStoreCount);
    }
    return safeTotal;
  }

  function getSceneVolumeLabel(sceneKey) {
    if (sceneKey === SCENE_KEYS.firstFollow) return '首触跟进录音数';
    if (sceneKey === SCENE_KEYS.inviteStore) return '邀约进店录音数';
    if (sceneKey === SCENE_KEYS.scheduleConfirm) return '排程确认录音数';
    if (sceneKey === SCENE_KEYS.cloudMulti) return '云外呼录音数';
    if (sceneKey === SCENE_KEYS.storeReception) return '接待数';
    if (sceneKey === SCENE_KEYS.testDrive) return '试驾数';
    return '总量';
  }

  function getSourceLabel(sourceKey) {
    return SOURCE_LABELS[sourceKey] || SOURCE_LABELS[SOURCE_KEYS.all];
  }

  return {
    SOURCE_KEYS,
    SCENE_KEYS,
    getAllowedScenes,
    getDefaultScenes,
    normalizeSceneSelection,
    setSourceSelection,
    toggleSceneSelection,
    getLegacySceneBucket,
    getSceneLabel,
    getInvitationSceneCount,
    getSceneVolumeLabel,
    getSourceLabel
  };
});
