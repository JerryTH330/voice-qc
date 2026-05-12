# Dashboard Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the new 数据来源筛选 to the store and factory dashboards, convert 业务场景 to constrained multi-select, and split the 云外呼 demo metrics so 首触跟进 / 邀约进店 / 排程确认 produce visibly different KPI output.

**Architecture:** Put the source/scene rules in one shared browser-safe utility file, test that utility with Node’s built-in test runner, then wire both dashboards to that shared state model. Keep the existing pages and rendering structure, but replace single-value scene decisions with normalized selection helpers plus a small demo-metric split layer.

**Tech Stack:** Plain HTML, plain browser JavaScript, static CSS, Node `--test`, Python `http.server` for manual browser verification.

---

## File Structure

- Create: `dashboard-filter-utils.js`
  - Shared source/scene constants and pure selection helpers for store and factory dashboards.
- Create: `tests/dashboard-filter-utils.test.js`
  - Node built-in tests for default scenes, disabled-scene cleanup, all/none behavior, and effective scene key derivation.
- Modify: `store-dashboard/page.js`
  - Load the shared utility before `app-runtime.js`.
- Modify: `factory-dashboard/page.js`
  - Load the shared utility before `factory-dashboard.js` and `app-runtime.js`.
- Modify: `store-dashboard/index.html`
  - Add 数据来源 tabs and replace the old scene tabs with the new 6-option set.
- Modify: `factory-dashboard/factory-dashboard.js`
  - Update the factory dashboard template to match the new source/scene filter markup.
- Modify: `app-runtime.js`
  - Refactor the store dashboard to use `currentSource + currentScenes`, derive normalized scene keys, and split 云外呼 demo metrics.
- Modify: `factory-dashboard/factory-dashboard.js`
  - Refactor factory dashboard state/rendering to use the shared selection model and split 云外呼 KPI/trend output.

## Task 1: Add shared dashboard filter utilities and tests

**Files:**
- Create: `dashboard-filter-utils.js`
- Create: `tests/dashboard-filter-utils.test.js`
- Modify: `store-dashboard/page.js:1-14`
- Modify: `factory-dashboard/page.js:1-14`

- [ ] **Step 1: Write the failing test**

```js
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
  getLegacySceneBucket
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

test('all source keeps only all when all is clicked', () => {
  const next = toggleSceneSelection(SOURCE_KEYS.all, [SCENE_KEYS.firstFollow], SCENE_KEYS.all);
  assert.deepEqual(next, [SCENE_KEYS.all]);
});

test('cloud source collapses back to all when every allowed scene is selected', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: FAIL with `Cannot find module '../dashboard-filter-utils.js'`.

- [ ] **Step 3: Write the shared utility file**

```js
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
      return normalizeSceneSelection(source, scenes).isAllSelected ? [SCENE_KEYS.all] : normalizeSceneSelection(source, scenes).activeScenes;
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
    getSourceLabel
  };
});
```

- [ ] **Step 4: Load the utility before the page runtimes**

```js
// store-dashboard/page.js
window.__AI_QC_DEFAULT_ROUTE = 'dashboard';
(function loadPageRuntime() {
  const scripts = ['../dashboard-filter-utils.js', '../app-runtime.js'];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();

// factory-dashboard/page.js
window.__AI_QC_DEFAULT_ROUTE = 'factory-dashboard';
(function loadPageRuntime() {
  const scripts = ['../dashboard-filter-utils.js', './factory-dashboard.js', '../app-runtime.js'];
  const loadNext = (index) => {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => loadNext(index + 1);
    script.onerror = () => { throw new Error('Failed to load ' + scripts[index]); };
    document.body.appendChild(script);
  };
  loadNext(0);
})();
```

- [ ] **Step 5: Run the utility test to verify it passes**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: PASS with 6 passing tests.

- [ ] **Step 6: Commit the shared utility work**

```bash
git add dashboard-filter-utils.js tests/dashboard-filter-utils.test.js store-dashboard/page.js factory-dashboard/page.js
git commit -m "$(cat <<'EOF'
feat: add shared dashboard filter utilities
EOF
)"
```

## Task 2: Replace the old filter markup on both dashboards

**Files:**
- Modify: `store-dashboard/index.html:144-184`
- Modify: `factory-dashboard/factory-dashboard.js:14-52`

- [ ] **Step 1: Replace the store dashboard filter markup**

```html
<section class="global-filter-bar" aria-label="全局筛选">
  <div class="gf-group store-filter-box">
    <span class="gf-label">数据来源</span>
    <div class="gf-tabs" id="gf-source">
      <button class="gf-tab active" data-source="all">全部</button>
      <button class="gf-tab" data-source="cloud">云外呼</button>
      <button class="gf-tab" data-source="badge">工牌</button>
    </div>
  </div>
  <div class="gf-group store-filter-box">
    <span class="gf-label">业务场景</span>
    <div class="gf-tabs" id="gf-scene">
      <button class="gf-tab active" data-scene="all">全部</button>
      <button class="gf-tab" data-scene="first_follow">首触跟进</button>
      <button class="gf-tab" data-scene="invite_store">邀约进店</button>
      <button class="gf-tab" data-scene="schedule_confirm">排程确认</button>
      <button class="gf-tab" data-scene="store_reception">进店接待</button>
      <button class="gf-tab" data-scene="test_drive">试乘试驾</button>
    </div>
  </div>
  <div class="gf-group gf-time-group store-filter-box">
    <span class="gf-label">时间</span>
    <div class="gf-tabs" id="gf-time">
      <button class="gf-tab active" data-time="1">昨日</button>
      <button class="gf-tab" data-time="7">近7天</button>
      <button class="gf-tab" data-time="15">近半月</button>
      <button class="gf-tab" data-time="30">近1月</button>
      <button class="gf-tab gf-tab-custom" data-time="custom" id="gf-custom-btn">自定义</button>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Replace the factory dashboard filter markup inside the template string**

```js
<div class="gf-group store-filter-box">
  <span class="gf-label">数据来源</span>
  <div class="gf-tabs" id="gf-source">
    <button class="gf-tab active" data-source="all">全部</button>
    <button class="gf-tab" data-source="cloud">云外呼</button>
    <button class="gf-tab" data-source="badge">工牌</button>
  </div>
</div>
<div class="gf-group store-filter-box">
  <span class="gf-label">业务场景</span>
  <div class="gf-tabs" id="gf-scene">
    <button class="gf-tab active" data-scene="all">全部</button>
    <button class="gf-tab" data-scene="first_follow">首触跟进</button>
    <button class="gf-tab" data-scene="invite_store">邀约进店</button>
    <button class="gf-tab" data-scene="schedule_confirm">排程确认</button>
    <button class="gf-tab" data-scene="store_reception">进店接待</button>
    <button class="gf-tab" data-scene="test_drive">试乘试驾</button>
  </div>
</div>
```

- [ ] **Step 3: Run the utility test again after the DOM rename**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: PASS. The test suite should still pass because the utility API is unchanged.

- [ ] **Step 4: Open both files and verify the IDs match the runtime plan**

Check for these exact IDs in both pages:

```text
gf-source
gf-scene
```

Expected: both dashboards expose `#gf-source` and `#gf-scene` once each.

- [ ] **Step 5: Commit the markup changes**

```bash
git add store-dashboard/index.html factory-dashboard/factory-dashboard.js
git commit -m "$(cat <<'EOF'
feat: update dashboard source and scene filter markup
EOF
)"
```

## Task 3: Refactor the store dashboard to use source + multi-scene selection

**Files:**
- Modify: `app-runtime.js:762-789`
- Modify: `app-runtime.js:823-858`
- Modify: `app-runtime.js:1427-1433`
- Modify: `app-runtime.js:1475-1522`
- Modify: `app-runtime.js:1934-1989`
- Modify: `app-runtime.js:2081-2128`
- Modify: `app-runtime.js:2270-2384`
- Modify: `app-runtime.js:3080-3104`

- [ ] **Step 1: Expand the utility test to cover effective scene keys for split demo output**

```js
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

test('partial cloud multi-select returns cloud_multi for legacy invitation rendering', () => {
  const normalized = normalizeSceneSelection(SOURCE_KEYS.cloud, [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore
  ]);

  assert.equal(normalized.isAllSelected, false);
  assert.equal(normalized.effectiveSceneKey, SCENE_KEYS.cloudMulti);
  assert.equal(normalized.legacySceneBucket, '邀约');
});
```

- [ ] **Step 2: Run the test and verify it fails before the runtime refactor**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: FAIL because `SCENE_KEYS.cloudMulti` or the cloud multi-selection behavior is not returned yet.

- [ ] **Step 3: Update the utility if needed so the new tests pass**

Use this normalized multi-select behavior:

```js
if (cleaned.length > 1) {
  return {
    source,
    allowedScenes,
    activeScenes: cleaned,
    isAllSelected: false,
    effectiveSceneKey: SCENE_KEYS.cloudMulti,
    legacySceneBucket: getLegacySceneBucket(SCENE_KEYS.cloudMulti)
  };
}
```

- [ ] **Step 4: Replace the store dashboard single-scene state with source + scenes**

```js
const FILTER_UTILS = window.__dashboardFilterUtils;
const {
  SOURCE_KEYS,
  SCENE_KEYS,
  getAllowedScenes,
  getSceneLabel,
  normalizeSceneSelection,
  setSourceSelection,
  toggleSceneSelection,
  getLegacySceneBucket
} = FILTER_UTILS;

let currentRole = 'all';
let currentSource = SOURCE_KEYS.all;
let currentScenes = [SCENE_KEYS.all];
let currentTime = '1';
let currentModel = 'all';

const getStoreSceneSelection = () => normalizeSceneSelection(currentSource, currentScenes);
const getEffectiveSceneKey = () => getStoreSceneSelection().effectiveSceneKey;
const getLegacySceneKey = () => getStoreSceneSelection().legacySceneBucket;

const getStoreSceneLabel = () => {
  const selection = getStoreSceneSelection();
  if (selection.isAllSelected) return '全场景';
  return selection.activeScenes.map(getSceneLabel).join(' / ');
};
```

- [ ] **Step 5: Replace the old scene tab binder with explicit source/scene button syncing**

```js
const syncStoreSceneTabs = () => {
  const sourceTabs = document.querySelectorAll('#gf-source .gf-tab');
  const sceneTabs = document.querySelectorAll('#gf-scene .gf-tab');
  const selection = getStoreSceneSelection();
  const allowed = new Set(getAllowedScenes(currentSource));

  sourceTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.source === currentSource);
  });

  sceneTabs.forEach((tab) => {
    const scene = tab.dataset.scene;
    const isAll = scene === SCENE_KEYS.all;
    const isAllowed = isAll || allowed.has(scene);
    const isActive = isAll
      ? selection.isAllSelected
      : (!selection.isAllSelected && selection.activeScenes.includes(scene));

    tab.classList.toggle('disabled', !isAllowed);
    tab.classList.toggle('active', isActive);
  });
};

document.getElementById('gf-source')?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-source]');
  if (!tab) return;
  currentSource = tab.dataset.source;
  currentScenes = setSourceSelection(currentSource);
  syncStoreSceneTabs();
  applyGlobalFilter();
});

document.getElementById('gf-scene')?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-scene]');
  if (!tab || tab.classList.contains('disabled')) return;
  currentScenes = toggleSceneSelection(currentSource, currentScenes, tab.dataset.scene);
  syncStoreSceneTabs();
  applyGlobalFilter();
});
```

- [ ] **Step 6: Split the store KPI and summary branches for the three cloud scenes**

```js
const SCENE_KPI_MAP = {
  all: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'reception', pairedWith: 'drive_rate', isBiz: true },
    { key: 'test_drive', pairedWith: 'order_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  first_follow: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  invite_store: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  schedule_confirm: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  cloud_multi: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  store_reception: [
    { key: 'reception', pairedWith: 'drive_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  test_drive: [
    { key: 'test_drive', pairedWith: 'order_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  }
};

const STORE_KPI_SCENE_FACTORS = {
  all: {},
  first_follow: { invitation: 0.96, reception: 0.46, test_drive: 0.32, valid_record: 0.76, avg_duration: 0.86, visit_rate: -1.8, drive_rate: -5.2, order_rate: -2.4, cover_rate: -1.1, hit_rate: 0.8, qa_pass_rate: 0.4, risk_rate: -0.6 },
  invite_store: { invitation: 1.08, reception: 0.62, test_drive: 0.44, valid_record: 0.88, avg_duration: 0.93, visit_rate: 2.8, drive_rate: -4.2, order_rate: -1.7, cover_rate: -0.4, hit_rate: 1.3, qa_pass_rate: 0.9, risk_rate: -0.1 },
  schedule_confirm: { invitation: 0.82, reception: 0.74, test_drive: 0.52, valid_record: 0.92, avg_duration: 0.98, visit_rate: 5.1, drive_rate: -3.1, order_rate: -1.1, cover_rate: 0.6, hit_rate: 1.7, qa_pass_rate: 1.2, risk_rate: 0.2 },
  cloud_multi: { invitation: 1.02, reception: 0.58, test_drive: 0.43, valid_record: 0.85, avg_duration: 0.91, visit_rate: 2.1, drive_rate: -4.4, order_rate: -1.8, cover_rate: -0.2, hit_rate: 1.1, qa_pass_rate: 0.7, risk_rate: -0.2 },
  store_reception: { invitation: 0.76, reception: 1.16, test_drive: 0.88, valid_record: 1.12, avg_duration: 1.04, visit_rate: -0.8, drive_rate: 4.2, order_rate: 0.8, cover_rate: 1.8, hit_rate: 0.9, qa_pass_rate: 1.4, risk_rate: 0.2 },
  test_drive: { invitation: 0.58, reception: 0.82, test_drive: 1.26, valid_record: 1.18, avg_duration: 1.14, visit_rate: -1.6, drive_rate: 1.6, order_rate: 3.4, cover_rate: 1.1, hit_rate: 1.8, qa_pass_rate: 1.9, risk_rate: 0.6 }
};
```

Also update summary text and rate/count seeds to use `getEffectiveSceneKey()` instead of the removed single `currentScene`:

```js
const sceneKey = getEffectiveSceneKey();
const sceneSummaryMap = {
  all: '全店接待整体平稳，服务态度与进店接待表现良好，但试驾邀约与竞品应对仍是主要短板。',
  first_follow: '首触跟进的开场需求确认整体稳定，但早段利益点铺垫仍偏弱。',
  invite_store: '邀约进店场景的到店推进更关键，建议强化明确时间与到店收益表达。',
  schedule_confirm: '排程确认更依赖时间承诺与到店前提醒，建议重点复盘确认节点。',
  cloud_multi: '云外呼多个环节表现存在波动，建议按首触、邀约、排程三个节点拆开复盘。',
  store_reception: '进店接待过程中的礼貌开场和需求确认表现较好，但车型卖点承接与异议处理深度仍需加强。',
  test_drive: '试乘试驾环节体验介绍更充分，但试驾前场景铺垫和试驾后下订推进存在断点。'
};
```

- [ ] **Step 7: Update the advisor table to use normalized keys instead of the deleted single-scene branches**

```js
const renderAdvisorTable = () => {
  const advisorList = document.getElementById('advisor-list');
  if (!advisorList) return;

  const sceneKey = getEffectiveSceneKey();
  const legacySceneKey = getLegacySceneKey();

  const getInvitationView = (advisor) => {
    const invitationMap = {
      first_follow: Math.max(1, Math.round(advisor.invitation * 0.42)),
      invite_store: Math.max(1, Math.round(advisor.invitation * 0.36)),
      schedule_confirm: Math.max(1, advisor.invitation - Math.round(advisor.invitation * 0.42) - Math.round(advisor.invitation * 0.36)),
      cloud_multi: advisor.invitation
    };
    return invitationMap[sceneKey] ?? advisor.invitation;
  };

  if (legacySceneKey === '邀约') {
    bizHeaders = [
      { label: '邀约录音数', key: 'invitation', sortable: true },
      { label: '到店率', key: 'visit_rate_col', sortable: false }
    ];
  } else if (sceneKey === 'store_reception') {
    bizHeaders = [
      { label: '接待录音数', key: 'reception', sortable: true },
      { label: '试驾率', key: 'drive_rate_col', sortable: false }
    ];
  } else if (sceneKey === 'test_drive') {
    bizHeaders = [
      { label: '试驾录音数', key: 'test_drive', sortable: true },
      { label: '下订率', key: 'order_rate_col', sortable: false }
    ];
  } else {
    bizHeaders = [
      { label: '邀约录音数', key: 'invitation', sortable: true },
      { label: '接待录音数', key: 'reception', sortable: true },
      { label: '试驾录音数', key: 'test_drive', sortable: true }
    ];
  }
};
```

- [ ] **Step 8: Run the utility test after the store refactor**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: PASS. No runtime syntax work should break the pure utility test.

- [ ] **Step 9: Commit the store dashboard refactor**

```bash
git add app-runtime.js dashboard-filter-utils.js tests/dashboard-filter-utils.test.js
git commit -m "$(cat <<'EOF'
feat: refactor store dashboard source and scene filters
EOF
)"
```

## Task 4: Refactor the factory dashboard to use source + multi-scene selection

**Files:**
- Modify: `factory-dashboard/factory-dashboard.js:399-433`
- Modify: `factory-dashboard/factory-dashboard.js:495-500`
- Modify: `factory-dashboard/factory-dashboard.js:1147-1206`
- Modify: `factory-dashboard/factory-dashboard.js:1546-1563`
- Modify: `factory-dashboard/factory-dashboard.js:2147-2160`
- Modify: `factory-dashboard/factory-dashboard.js:5332-5337`

- [ ] **Step 1: Introduce source + scenes state in the factory runtime**

```js
const FILTER_UTILS = window.__dashboardFilterUtils;
const {
  SOURCE_KEYS,
  SCENE_KEYS,
  getAllowedScenes,
  normalizeSceneSelection,
  setSourceSelection,
  toggleSceneSelection,
  getLegacySceneBucket
} = FILTER_UTILS;

let currentRegion = 'all';
let currentZone = 'all';
let currentStore = 'all';
let currentSource = SOURCE_KEYS.all;
let currentScenes = [SCENE_KEYS.all];
let currentBrand = '传祺';
let currentQcScene = 'all';
let currentTime = '1';
let currentModel = 'all';

const getFactorySceneSelection = () => normalizeSceneSelection(currentSource, currentScenes);
const getEffectiveSceneKey = () => getFactorySceneSelection().effectiveSceneKey;
const getLegacySceneKey = () => getFactorySceneSelection().legacySceneBucket;
```

- [ ] **Step 2: Replace the old role-based scene locking with source-driven scene syncing**

```js
const syncFactorySceneTabs = () => {
  const sourceTabs = document.querySelectorAll('#gf-source .gf-tab');
  const sceneTabs = document.querySelectorAll('#gf-scene .gf-tab');
  const selection = getFactorySceneSelection();
  const allowed = new Set(getAllowedScenes(currentSource));

  sourceTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.source === currentSource);
  });

  sceneTabs.forEach((tab) => {
    const scene = tab.dataset.scene;
    const isAll = scene === SCENE_KEYS.all;
    const isAllowed = isAll || allowed.has(scene);
    const isActive = isAll
      ? selection.isAllSelected
      : (!selection.isAllSelected && selection.activeScenes.includes(scene));

    tab.classList.toggle('disabled', !isAllowed);
    tab.classList.toggle('active', isActive);
  });
};

document.getElementById('gf-source')?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-source]');
  if (!tab) return;
  currentSource = tab.dataset.source;
  currentScenes = setSourceSelection(currentSource);
  syncFactorySceneTabs();
  applyGlobalFilter();
});

document.getElementById('gf-scene')?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-scene]');
  if (!tab || tab.classList.contains('disabled')) return;
  currentScenes = toggleSceneSelection(currentSource, currentScenes, tab.dataset.scene);
  syncFactorySceneTabs();
  applyGlobalFilter();
});
```

- [ ] **Step 3: Expand the factory KPI map for the new scene keys**

```js
const SCENE_KPI_MAP = {
  all: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'reception', pairedWith: 'drive_rate', isBiz: true },
    { key: 'test_drive', pairedWith: 'order_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  first_follow: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  invite_store: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  schedule_confirm: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  cloud_multi: [
    { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  store_reception: [
    { key: 'reception', pairedWith: 'drive_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ],
  test_drive: [
    { key: 'test_drive', pairedWith: 'order_rate', isBiz: true },
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  }
};
```

- [ ] **Step 4: Build split 云外呼 demo KPI output instead of always reading raw `ALL_KPI_DATA`**

```js
const cloneFactoryKpiData = (data) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [key, { ...value }])
);

const FACTORY_SCENE_FACTORS = {
  all: {},
  first_follow: { invitation: 0.94, visit_rate: -2.1, hit_rate: 0.8, qa_pass_rate: 0.5, risk_rate: -0.3 },
  invite_store: { invitation: 1.06, visit_rate: 2.4, hit_rate: 1.4, qa_pass_rate: 0.9, risk_rate: 0.1 },
  schedule_confirm: { invitation: 0.86, visit_rate: 4.8, hit_rate: 1.8, qa_pass_rate: 1.3, risk_rate: 0.4 },
  cloud_multi: { invitation: 1.01, visit_rate: 2.0, hit_rate: 1.1, qa_pass_rate: 0.8, risk_rate: 0.0 },
  store_reception: { reception: 1.08, drive_rate: 2.6, hit_rate: 0.7, qa_pass_rate: 1.1, risk_rate: 0.2 },
  test_drive: { test_drive: 1.14, order_rate: 2.9, hit_rate: 1.3, qa_pass_rate: 1.6, risk_rate: 0.5 }
};

const buildFactoryFilteredKpiData = () => {
  const sceneKey = getEffectiveSceneKey();
  if (sceneKey === 'all') {
    return cloneFactoryKpiData(ALL_KPI_DATA);
  }

  const nextData = cloneFactoryKpiData(ALL_KPI_DATA);
  const factors = FACTORY_SCENE_FACTORS[sceneKey] || {};

  ['invitation', 'reception', 'test_drive'].forEach((key) => {
    if (!nextData[key]) return;
    const base = Number(nextData[key].num || 0);
    const scale = factors[key] ?? 1;
    nextData[key].num = String(Math.max(0, Math.round(base * scale)));
  });

  ['visit_rate', 'drive_rate', 'order_rate', 'hit_rate', 'qa_pass_rate', 'risk_rate'].forEach((key) => {
    if (!nextData[key]) return;
    const base = Number(nextData[key].num || 0);
    const delta = factors[key] ?? 0;
    nextData[key].num = String(Math.max(0, Math.min(99, Math.round((base + delta) * 10) / 10)));
  });

  return nextData;
};
```

Then switch the KPI render to use the filtered data:

```js
const sceneKey = getEffectiveSceneKey();
const isContributionTab = currentTab === 'sop-improvement';
const kpiData = isContributionTab ? buildContributionKPIData() : buildFactoryFilteredKpiData();
const kpiItems = isContributionTab ? SOP_CONTRIBUTION_KPI_MAP : (SCENE_KPI_MAP[sceneKey] || SCENE_KPI_MAP.all);
```

- [ ] **Step 5: Update the trend chart to give cloud sub-scenes distinct labels while keeping invitation volume data**

```js
const sceneKey = getEffectiveSceneKey();
if (sceneKey === 'first_follow') {
  volData = d.invitation;
  volLabel = '首触跟进录音数';
} else if (sceneKey === 'invite_store') {
  volData = d.invitation;
  volLabel = '邀约进店录音数';
} else if (sceneKey === 'schedule_confirm') {
  volData = d.invitation;
  volLabel = '排程确认录音数';
} else if (sceneKey === 'cloud_multi') {
  volData = d.invitation;
  volLabel = '云外呼录音数';
} else if (sceneKey === 'store_reception') {
  volData = d.reception;
  volLabel = '接待数';
} else if (sceneKey === 'test_drive') {
  volData = d.test_drive;
  volLabel = '试驾数';
} else {
  volData = d.validRec;
  volLabel = '有效录音量';
}
```

- [ ] **Step 6: Run the shared utility test after the factory refactor**

Run:

```bash
node --test tests/dashboard-filter-utils.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit the factory dashboard refactor**

```bash
git add factory-dashboard/factory-dashboard.js dashboard-filter-utils.js tests/dashboard-filter-utils.test.js
git commit -m "$(cat <<'EOF'
feat: refactor factory dashboard source and scene filters
EOF
)"
```

## Task 5: Verify both dashboards in a browser

**Files:**
- Verify: `store-dashboard/index.html`
- Verify: `factory-dashboard/index.html`

- [ ] **Step 1: Start a local static server from the repo root**

Run:

```bash
python -m http.server 4173
```

Expected: `Serving HTTP on 0.0.0.0 port 4173`.

- [ ] **Step 2: Verify the store dashboard default state and source switching**

Open:

```text
http://127.0.0.1:4173/store-dashboard/index.html
```

Expected:
- default = `数据来源: 全部` and `业务场景: 全部`
- switching to `云外呼` auto-highlights `首触跟进 / 邀约进店 / 排程确认`
- `进店接待 / 试乘试驾` become disabled
- clicking `全部` clears the specific scene selection

- [ ] **Step 3: Verify split 云外呼 demo output on the store dashboard**

Click these one by one under `云外呼`:

```text
首触跟进
邀约进店
排程确认
```

Expected:
- the KPI card labeled `邀约录音数` changes between the three scenes
- the summary copy changes between the three scenes
- the advisor table still uses the invitation view, but its derived invitation counts/rates are not identical across all three scene tabs

- [ ] **Step 4: Verify the factory dashboard default state and source switching**

Open:

```text
http://127.0.0.1:4173/factory-dashboard/index.html
```

Expected:
- default = `数据来源: 全部` and `业务场景: 全部`
- switching to `工牌` auto-highlights `进店接待 / 试乘试驾`
- cloud-only scenes become disabled
- selecting both allowed badge scenes collapses back to `全部`

- [ ] **Step 5: Verify split 云外呼 demo output on the factory dashboard**

Click these one by one under `云外呼`:

```text
首触跟进
邀约进店
排程确认
```

Expected:
- the hero KPI card labeled `邀约录音数` changes between the three scenes
- the legend volume label changes to the exact scene label
- the factory trend chart does not throw errors and still renders bars/lines

- [ ] **Step 6: Stop the local server after verification**

Stop the running `python -m http.server 4173` process.

Expected: the background server exits cleanly and no longer serves port `4173`.

- [ ] **Step 7: Commit the verified UI changes**

```bash
git add dashboard-filter-utils.js tests/dashboard-filter-utils.test.js store-dashboard/page.js factory-dashboard/page.js store-dashboard/index.html factory-dashboard/factory-dashboard.js app-runtime.js
git commit -m "$(cat <<'EOF'
feat: add source-aware dashboard scene filters
EOF
)"
```

## Notes for the executor

- Do not reintroduce `currentScene` as the primary store/factory state. The new source/scene behavior should be driven from `currentSource + currentScenes` plus normalized helpers.
- Keep the store and factory scene-key vocabulary identical:
  - `all`
  - `first_follow`
  - `invite_store`
  - `schedule_confirm`
  - `cloud_multi`
  - `store_reception`
  - `test_drive`
- For legacy invitation-only branches, use `getLegacySceneBucket()` rather than duplicating the cloud-scene checks all over the runtime.
- The only automated tests in this repo are the new Node tests. The UI work still requires browser verification before claiming completion.
