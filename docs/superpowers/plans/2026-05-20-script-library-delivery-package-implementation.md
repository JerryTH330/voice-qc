# Script Library Delivery Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a handoff-ready delivery package that includes a backend-neutral LLM output architecture and prompt/script assets, plus a front-end page redesign and code that consumes that output contract.

**Architecture:** Split the work into three layers: a shared contract layer that defines the monthly/global payload and example data, an LLM asset layer that packages prompt text and input/output builders without tying to any SDK, and a front-end layer that renders the approved topic-library UI from that contract. Finish by writing two handoff docs so backend and frontend engineers can each take over with minimal explanation.

**Tech Stack:** Plain HTML, plain browser JavaScript, static CSS, Node `--test`, Python `http.server`, Markdown.

---

## File Structure

- Create: `script-library/script-library-contract.js`
  - Shared constants, tag metadata, payload contract helpers, and a handoff-friendly example payload.
- Create: `script-library/script-library-llm-assets.js`
  - Backend-neutral prompt text, normalized monthly input builder, and output schema object for the monthly topic-generation job.
- Modify: `script-library/script-library-utils.js`
  - Front-end view-model builder that consumes the shared contract payload instead of owning the contract itself.
- Create: `tests/script-library-contract.test.js`
  - Node tests for contract helpers, latest-month selection, and example payload structure.
- Create: `tests/script-library-llm-assets.test.js`
  - Node tests for prompt/input builder behavior and schema fields.
- Modify: `tests/script-library-utils.test.js`
  - Node tests for monthly/global front-end view-model behavior using the shared contract payload.
- Modify: `script-library/page.js`
  - Load `script-library-contract.js`, `script-library-utils.js`, then `app-runtime.js` in the correct order.
- Modify: `script-library/index.html`
  - Replace the old static “scene / ability / template” shell with the approved view-range / scene / tag / goal / status / month filter shell.
- Modify: `app-runtime.js`
  - Remove the old hard-coded `scriptLibraryOptions` and `scriptLibraryData`, then render the page from the shared contract + utility view model.
- Modify: `voice-qc-admin.css`
  - Style the new filter rows, topic cards, stats, representative sample cards, and empty scene states.
- Create: `docs/script-library-backend-handoff.md`
  - Explain the LLM contract, prompt assets, input shape, output shape, and monthly job sequence for backend engineers.
- Create: `docs/script-library-frontend-handoff.md`
  - Explain the page structure, runtime integration points, and what data the front-end expects from backend engineers.

## Task 1: Extract the shared output contract into its own module

**Files:**
- Create: `script-library/script-library-contract.js`
- Create: `tests/script-library-contract.test.js`

- [ ] **Step 1: Write the failing contract test**

```js
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

test('contract exports stable view, scene, and filter constants', () => {
  assert.deepEqual(VIEW_KEYS, {
    global: 'global',
    monthly: 'monthly'
  });
  assert.deepEqual(SCENE_KEYS, {
    invite: 'invite',
    reception: 'reception',
    testDrive: 'test_drive'
  });
  assert.equal(ALL_FILTER, 'all');
});

test('latest month is selected from the example payload', () => {
  assert.equal(getLatestMonth(scriptLibraryExamplePayload), '2026-05');
  assert.equal(getMonthlyPackage(scriptLibraryExamplePayload, '2026-05').month, '2026-05');
});

test('example payload keeps monthly and global layers for all scenes', () => {
  assert.equal(getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-05', SCENE_KEYS.invite).length, 2);
  assert.equal(getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-05', SCENE_KEYS.reception).length, 0);
  assert.equal(getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.invite).length, 3);
  assert.equal(getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.testDrive).length, 0);
});

test('tag metadata includes the invite tag set needed by the LLM job', () => {
  assert.equal(SCRIPT_LIBRARY_TAGS.T01.tag_name, '深度需求挖掘');
  assert.equal(SCRIPT_LIBRARY_TAGS.T07.tag_name, '微信留资承接');
  assert.equal(SCRIPT_LIBRARY_TAGS.T09.tag_name, '到店邀约推进');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/script-library-contract.test.js
```

Expected: FAIL with `Cannot find module '../script-library/script-library-contract.js'`.

- [ ] **Step 3: Create the shared contract module**

```js
(function (global, factory) {
  const api = factory();
  global.__scriptLibraryContract = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const VIEW_KEYS = {
    global: 'global',
    monthly: 'monthly'
  };

  const SCENE_KEYS = {
    invite: 'invite',
    reception: 'reception',
    testDrive: 'test_drive'
  };

  const ALL_FILTER = 'all';

  const SCRIPT_LIBRARY_TAGS = {
    T01: { tag_code: 'T01', tag_name: '深度需求挖掘' },
    T04: { tag_code: 'T04', tag_name: '价格异议处理' },
    T07: { tag_code: 'T07', tag_name: '微信留资承接' },
    T09: { tag_code: 'T09', tag_name: '到店邀约推进' }
  };

  const scriptLibraryExamplePayload = {
    job: {
      job_id: 'scriptlib-2026-05',
      run_time: '2026-06-08T02:00:00+08:00',
      version: 'v1',
      mode: 'monthly'
    },
    monthly_packages: [
      {
        month: '2026-05',
        invite: {
          overview: {
            top_tags: [
              { tag_code: 'T09', tag_name: '到店邀约推进', count: 6 },
              { tag_code: 'T07', tag_name: '微信留资承接', count: 4 }
            ]
          },
          topics: [
            {
              topic_id: 'inv-2026-05-01',
              topic_name: '先挖需求再推进到店',
              primary_tags: [SCRIPT_LIBRARY_TAGS.T01, SCRIPT_LIBRARY_TAGS.T09],
              action_pattern: '需求挖掘->到店推进',
              training_goal: '提升到店确认率',
              summary: '先确认真实需求，再把到店动作收口。',
              recommended_script: '您平时主要是谁开、更多是通勤还是家用？我先帮您把版本范围收一收，您到店看车会更高效。',
              training_points: ['前 3 分钟至少确认两项需求', '到店推进必须带具体收益'],
              apply_when: ['客户仍在比较车型'],
              avoid_when: ['客户明确拒绝继续沟通'],
              source_sample_count: 7,
              representative_samples: [
                {
                  call_id: 'call-202605-011',
                  audio_id: 'audio-202605-011',
                  store_id: 'store-sh-pd',
                  sales_id: 'sales-021',
                  source_month: '2026-05',
                  success_result: '到店成功',
                  tag_code: 'T09',
                  tag_name: '到店邀约推进',
                  confidence: '高',
                  level: 'A',
                  quote: '您明天下午过来，我把现车和试驾都给您安排好。',
                  replicable_point: '时间、收益、后续安排一次讲完整。',
                  start_time: '03:12',
                  end_time: '03:46',
                  qc_source_ref: 'invite-qc-202605-011',
                  asr_excerpt_ref: 'asr-segment-202605-011'
                }
              ]
            },
            {
              topic_id: 'inv-2026-05-02',
              topic_name: '先发资料再承接微信',
              primary_tags: [SCRIPT_LIBRARY_TAGS.T07],
              action_pattern: '资料承接->微信留资',
              training_goal: '提升微信承接率',
              summary: '给客户一个自然的资料承接理由，再顺势留资。',
              recommended_script: '我把配置表、报价范围和店里位置一起发您微信，后面比较版本会更方便。',
              training_points: ['微信承接要有自然理由', '资料和下一步动作要一起交代'],
              apply_when: ['客户主动索要资料'],
              avoid_when: ['客户明确不愿留资'],
              source_sample_count: 5,
              representative_samples: []
            }
          ]
        },
        reception: { overview: { top_tags: [] }, topics: [] },
        test_drive: { overview: { top_tags: [] }, topics: [] }
      },
      {
        month: '2026-04',
        invite: {
          overview: { top_tags: [{ tag_code: 'T04', tag_name: '价格异议处理', count: 4 }] },
          topics: [
            {
              topic_id: 'inv-2026-04-01',
              topic_name: '先处理价格顾虑再锁到店',
              primary_tags: [SCRIPT_LIBRARY_TAGS.T04, SCRIPT_LIBRARY_TAGS.T09],
              action_pattern: '价格顾虑->到店详谈',
              training_goal: '降低价格顾虑流失',
              summary: '先承接预算压力，再把价格问题转成到店后可解释的完整方案。',
              recommended_script: '电话里很难把补贴和金融一起讲清，您到店我把完整落地方案给您拆开看。',
              training_points: ['先共情预算压力', '不要直接说已经到底价'],
              apply_when: ['客户重点卡在预算'],
              avoid_when: ['客户已明确不考虑'],
              source_sample_count: 4,
              representative_samples: []
            }
          ]
        },
        reception: { overview: { top_tags: [] }, topics: [] },
        test_drive: { overview: { top_tags: [] }, topics: [] }
      }
    ],
    global_pool: {
      invite: {
        topics: [
          {
            topic_id: 'inv-p-001',
            topic_name: '先挖需求再推进到店',
            primary_tags: [SCRIPT_LIBRARY_TAGS.T01, SCRIPT_LIBRARY_TAGS.T09],
            action_pattern: '需求挖掘->到店推进',
            training_goal: '提升到店确认率',
            summary: '长期有效的邀约主题：先收真实需求，再把到店价值收口成明确动作。',
            recommended_script: '您平时是谁开、主要是通勤还是家用？我先帮您把版本和体验重点收一收。',
            training_points: ['需求探询要服务后续推进'],
            apply_when: ['客户仍在比较车型'],
            avoid_when: ['客户只想结束通话'],
            first_seen_month: '2026-04',
            last_seen_month: '2026-05',
            source_months: ['2026-04', '2026-05'],
            recent_3m_count: 2,
            status: 'active',
            source_sample_count: 11,
            representative_samples: []
          },
          {
            topic_id: 'inv-p-002',
            topic_name: '先发资料再承接微信',
            primary_tags: [SCRIPT_LIBRARY_TAGS.T07],
            action_pattern: '资料承接->微信留资',
            training_goal: '提升微信承接率',
            summary: '通过资料发送和后续动作捆绑，提升微信承接成功率。',
            recommended_script: '我把配置、报价范围和定位一起发您微信，也能直接约试驾。',
            training_points: ['先给资料理由，再承接微信'],
            apply_when: ['客户主动要资料'],
            avoid_when: ['客户明确拒绝留资'],
            first_seen_month: '2026-05',
            last_seen_month: '2026-05',
            source_months: ['2026-05'],
            recent_3m_count: 1,
            status: 'observing',
            source_sample_count: 5,
            representative_samples: []
          },
          {
            topic_id: 'inv-p-003',
            topic_name: '先处理价格顾虑再锁到店',
            primary_tags: [SCRIPT_LIBRARY_TAGS.T04, SCRIPT_LIBRARY_TAGS.T09],
            action_pattern: '价格顾虑->到店详谈',
            training_goal: '降低价格顾虑流失',
            summary: '先拆解压力点，再把比较空间留到店里。',
            recommended_script: '您先别只盯裸车价，我把置换补贴和金融一起给您拆一版。',
            training_points: ['把价格拉回总成本和完整方案'],
            apply_when: ['客户重点卡在预算'],
            avoid_when: ['客户已经明确不考虑'],
            first_seen_month: '2026-03',
            last_seen_month: '2026-04',
            source_months: ['2026-03', '2026-04'],
            recent_3m_count: 2,
            status: 'active',
            source_sample_count: 8,
            representative_samples: []
          }
        ]
      },
      reception: { topics: [] },
      test_drive: { topics: [] }
    }
  };

  function getLatestMonth(payload) {
    const monthlyPackages = payload?.monthly_packages || [];
    return monthlyPackages[0]?.month || '';
  }

  function getMonthlyPackage(payload, month) {
    return (payload?.monthly_packages || []).find((item) => item.month === month) || null;
  }

  function getSceneTopicsFromPayload(payload, mode, month, sceneKey) {
    if (mode === VIEW_KEYS.monthly) {
      return getMonthlyPackage(payload, month)?.[sceneKey]?.topics || [];
    }
    return payload?.global_pool?.[sceneKey]?.topics || [];
  }

  return {
    VIEW_KEYS,
    SCENE_KEYS,
    ALL_FILTER,
    SCRIPT_LIBRARY_TAGS,
    scriptLibraryExamplePayload,
    getLatestMonth,
    getMonthlyPackage,
    getSceneTopicsFromPayload
  };
});
```

- [ ] **Step 4: Run the contract test to verify it passes**

Run:

```bash
node --test tests/script-library-contract.test.js
```

Expected: PASS with 4 passing tests.

- [ ] **Step 5: Commit the contract layer**

```bash
git add script-library/script-library-contract.js tests/script-library-contract.test.js
git commit -m "feat: add script library output contract"
```

## Task 2: Add backend-neutral LLM prompt and output-script assets

**Files:**
- Create: `script-library/script-library-llm-assets.js`
- Create: `tests/script-library-llm-assets.test.js`

- [ ] **Step 1: Write the failing LLM-asset test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildMonthlyTopicGenerationInput,
  buildMonthlyTopicGenerationPrompt,
  MONTHLY_TOPIC_OUTPUT_SCHEMA
} = require('../script-library/script-library-llm-assets.js');

test('monthly topic generation input keeps only fields needed for LLM summarization', () => {
  const input = buildMonthlyTopicGenerationInput({
    month: '2026-05',
    scene: 'invite',
    successCases: [
      {
        call_id: 'call-1',
        success_result: '到店成功',
        advantage: {
          tag_code: 'T09',
          tag_name: '到店邀约推进',
          confidence: '高',
          level: 'A',
          quote: '您明天下午过来，我把现车和试驾都给您安排好。',
          replicable_point: '把时间、收益、后续安排一次讲完整。'
        }
      }
    ]
  });

  assert.equal(input.month, '2026-05');
  assert.equal(input.scene, 'invite');
  assert.equal(input.success_cases.length, 1);
  assert.deepEqual(Object.keys(input.success_cases[0]), [
    'call_id',
    'success_result',
    'tag_code',
    'tag_name',
    'confidence',
    'level',
    'quote',
    'replicable_point'
  ]);
});

test('prompt text explicitly requests topic output and representative samples', () => {
  const prompt = buildMonthlyTopicGenerationPrompt({ month: '2026-05', scene: 'invite', success_cases: [] });
  assert.match(prompt, /按主题归纳/);
  assert.match(prompt, /representative_samples/);
  assert.match(prompt, /不要重新判断单条优劣势/);
});

test('output schema requires monthly topic fields needed by frontend', () => {
  assert.equal(MONTHLY_TOPIC_OUTPUT_SCHEMA.type, 'object');
  assert.equal(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.type, 'array');
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('topic_name'));
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('recommended_script'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/script-library-llm-assets.test.js
```

Expected: FAIL with `Cannot find module '../script-library/script-library-llm-assets.js'`.

- [ ] **Step 3: Create the LLM asset module**

```js
(function (global, factory) {
  const api = factory();
  global.__scriptLibraryLlmAssets = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const MONTHLY_TOPIC_OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
      month: { type: 'string' },
      scene: { type: 'string' },
      summary: { type: 'string' },
      topics: {
        type: 'array',
        items: {
          type: 'object',
          required: [
            'topic_id',
            'topic_name',
            'primary_tags',
            'action_pattern',
            'training_goal',
            'summary',
            'recommended_script',
            'training_points',
            'representative_samples'
          ],
          properties: {
            topic_id: { type: 'string' },
            topic_name: { type: 'string' },
            primary_tags: { type: 'array' },
            action_pattern: { type: 'string' },
            training_goal: { type: 'string' },
            summary: { type: 'string' },
            recommended_script: { type: 'string' },
            training_points: { type: 'array' },
            representative_samples: { type: 'array' }
          }
        }
      }
    },
    required: ['month', 'scene', 'topics']
  };

  function buildMonthlyTopicGenerationInput({ month, scene, successCases }) {
    return {
      month,
      scene,
      success_cases: (successCases || []).map((item) => ({
        call_id: item.call_id,
        success_result: item.success_result,
        tag_code: item.advantage.tag_code,
        tag_name: item.advantage.tag_name,
        confidence: item.advantage.confidence,
        level: item.advantage.level,
        quote: item.advantage.quote,
        replicable_point: item.advantage.replicable_point
      }))
    };
  }

  function buildMonthlyTopicGenerationPrompt(input) {
    return [
      '你是优秀话术库月度沉淀助手。',
      '请按主题归纳成功邀约样本，只输出适合培训复用的方法论主题。',
      '不要重新判断单条优劣势，单条优势标签已经由上游质检流程给出。',
      '请为每个主题输出 topic_id、topic_name、primary_tags、action_pattern、training_goal、summary、recommended_script、training_points、representative_samples。',
      'representative_samples 只保留少量最能说明问题的样本，并保留 quote 与 replicable_point。',
      '输出必须符合下面的 JSON schema：',
      JSON.stringify(MONTHLY_TOPIC_OUTPUT_SCHEMA, null, 2),
      '输入数据：',
      JSON.stringify(input, null, 2)
    ].join('\n\n');
  }

  return {
    MONTHLY_TOPIC_OUTPUT_SCHEMA,
    buildMonthlyTopicGenerationInput,
    buildMonthlyTopicGenerationPrompt
  };
});
```

- [ ] **Step 4: Run the LLM-asset test to verify it passes**

Run:

```bash
node --test tests/script-library-llm-assets.test.js
```

Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit the LLM-asset layer**

```bash
git add script-library/script-library-llm-assets.js tests/script-library-llm-assets.test.js
git commit -m "feat: add script library llm prompt assets"
```

## Task 3: Rebuild the front-end utility around the shared contract output

**Files:**
- Modify: `script-library/script-library-utils.js`
- Modify: `tests/script-library-utils.test.js`
- Modify: `script-library/page.js`

- [ ] **Step 1: Rewrite the front-end utility test against the shared contract payload**

```js
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

test('default state lands on global invite and keeps newest month for monthly mode', () => {
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

test('monthly invite mode exposes May topics and hides the status filter', () => {
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

test('global invite mode can filter active topics only', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    status: 'active'
  });

  assert.deepEqual(model.topics.map((topic) => topic.topic_id), ['inv-p-001', 'inv-p-003']);
});

test('reception scene stays selectable and returns empty-state copy', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.reception
  });

  assert.equal(model.sceneMeta.hasSceneData, false);
  assert.equal(model.sceneMeta.emptyTitle, '接待主题待接入');
  assert.match(model.sceneMeta.emptyDescription, /后续接入接待单条打标/);
});
```

- [ ] **Step 2: Run the test to verify it fails against the current utility**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: FAIL because the current utility still owns the contract directly instead of consuming `script-library-contract.js`.

- [ ] **Step 3: Refactor `script-library-utils.js` into a front-end-only view-model layer**

```js
(function (global, factory) {
  const api = factory(global.__scriptLibraryContract || {});
  global.__scriptLibraryUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (contract) {
  const {
    VIEW_KEYS,
    SCENE_KEYS,
    ALL_FILTER,
    scriptLibraryExamplePayload,
    getLatestMonth,
    getMonthlyPackage,
    getSceneTopicsFromPayload
  } = contract;

  const STATUS_LABELS = {
    active: '持续有效',
    observing: '观察中',
    stale: '历史沉淀'
  };

  function getDefaultScriptLibraryState(payload = scriptLibraryExamplePayload) {
    return {
      view: VIEW_KEYS.global,
      scene: SCENE_KEYS.invite,
      tag: ALL_FILTER,
      goal: ALL_FILTER,
      status: ALL_FILTER,
      month: getLatestMonth(payload),
      selectedTopicId: null
    };
  }

  function buildScriptLibraryViewModel(payload = scriptLibraryExamplePayload, rawState = {}) {
    const defaultState = getDefaultScriptLibraryState(payload);
    const monthlyPackages = payload.monthly_packages || [];
    const months = monthlyPackages.map((item) => ({ value: item.month, label: item.month }));
    const state = {
      ...defaultState,
      ...rawState
    };

    if (!months.some((item) => item.value === state.month)) {
      state.month = defaultState.month;
    }

    const allTopics = getSceneTopicsFromPayload(payload, state.view, state.month, state.scene);
    const filteredTopics = allTopics.filter((topic) => {
      const tagMatch = state.tag === ALL_FILTER || (topic.primary_tags || []).some((tag) => tag.tag_code === state.tag);
      const goalMatch = state.goal === ALL_FILTER || topic.training_goal === state.goal;
      const statusMatch = state.view !== VIEW_KEYS.global || state.status === ALL_FILTER || topic.status === state.status;
      return tagMatch && goalMatch && statusMatch;
    });

    const selectedTopic = filteredTopics.find((topic) => topic.topic_id === state.selectedTopicId) || filteredTopics[0] || null;
    const monthlyPackage = getMonthlyPackage(payload, state.month);
    const topTag = monthlyPackage?.[state.scene]?.overview?.top_tags?.[0] || null;

    return {
      state: {
        ...state,
        selectedTopicId: selectedTopic ? selectedTopic.topic_id : null
      },
      filters: {
        months
      },
      flags: {
        showStatusFilter: state.view === VIEW_KEYS.global,
        showMonthFilter: state.view === VIEW_KEYS.monthly
      },
      sceneMeta: {
        hasSceneData: allTopics.length > 0,
        emptyTitle: state.scene === SCENE_KEYS.reception ? '接待主题待接入' : state.scene === SCENE_KEYS.testDrive ? '试驾主题待接入' : '当前筛选下暂无匹配主题',
        emptyDescription: state.scene === SCENE_KEYS.reception
          ? '当前保留场景入口和数据结构，后续接入接待单条打标与月度沉淀后展示。'
          : state.scene === SCENE_KEYS.testDrive
            ? '当前保留场景入口和数据结构，后续接入试驾单条打标与月度沉淀后展示。'
            : '可以切换主题标签、训练目标、状态或月份后再试一次。'
      },
      stats: state.view === VIEW_KEYS.monthly
        ? [
            { label: '本月新增主题数', value: String(allTopics.length), description: '本月进入培训沉淀的邀约主题数量。' },
            { label: '本月入选代表样本数', value: String(filteredTopics.reduce((sum, topic) => sum + ((topic.representative_samples || []).length), 0)), description: '当前筛选下可回溯的代表样本总数。' },
            { label: '本月高频主标签', value: topTag ? topTag.tag_name : '--', description: topTag ? `命中 ${topTag.count} 个成功样本片段。` : '当前场景暂无主标签统计。' }
          ]
        : [
            { label: '长期沉淀主题数', value: String(filteredTopics.length), description: '当前筛选下可长期复用的主题数量。' },
            { label: '最近 3 个月活跃主题数', value: String(filteredTopics.filter((topic) => topic.status === 'active').length), description: '最近仍被月包验证到的有效主题。' },
            { label: '累计代表样本数', value: String(filteredTopics.reduce((sum, topic) => sum + ((topic.representative_samples || []).length), 0)), description: '这些主题下可直接用于培训的代表样本总数。' }
          ],
      topics: filteredTopics,
      selectedTopic,
      listTitle: state.view === VIEW_KEYS.global ? '长期主题库' : `${state.month} 月新增主题`,
      listDescription: state.view === VIEW_KEYS.global ? '默认展示长期沉淀下来的邀约培训主题。' : '查看单月独立沉淀结果，不与历史月份互相覆盖。',
      detailSubtitle: selectedTopic ? `${state.scene} · ${selectedTopic.training_goal}` : '点击左侧主题查看推荐话术、训练要点与代表样本。',
      modeHint: state.view === VIEW_KEYS.global ? '长期沉淀主题' : `${state.month} 月新增`,
      matchCountLabel: `匹配 ${filteredTopics.length} 个主题`
    };
  }

  return {
    getDefaultScriptLibraryState,
    buildScriptLibraryViewModel,
    getStatusLabel(status) {
      return STATUS_LABELS[status] || '未标记';
    }
  };
});
```

- [ ] **Step 4: Update the bootstrap loader order**

```js
/* 优秀话术库 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'script-library';
(function loadPageRuntime() {
  const scripts = ['./script-library-contract.js', './script-library-utils.js', '../app-runtime.js'];
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
node --test tests/script-library-utils.test.js
```

Expected: PASS with 4 passing tests.

- [ ] **Step 6: Commit the front-end view-model refactor**

```bash
git add script-library/script-library-utils.js script-library/page.js tests/script-library-utils.test.js
git commit -m "feat: refactor script library frontend view model"
```

## Task 4: Redesign the front-end page and connect it to the shared output contract

**Files:**
- Modify: `script-library/index.html`
- Modify: `app-runtime.js`
- Modify: `voice-qc-admin.css`

- [ ] **Step 1: Add one more failing utility test for UI-facing state labels**

```js
test('global invite mode exposes list titles and empty-scene metadata for the approved UI copy', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryExamplePayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite
  });

  assert.equal(model.listTitle, '长期主题库');
  assert.equal(model.modeHint, '长期沉淀主题');
  assert.equal(model.matchCountLabel, '匹配 3 个主题');
});
```

- [ ] **Step 2: Run the utility test to verify the new assertion fails if the UI copy has not been updated**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: FAIL if the current copy does not match the approved UI wording yet.

- [ ] **Step 3: Replace the script-library template in `script-library/index.html`**

```html
<template id="tpl-script-library">
  <div class="page-stack scriptlib-page">
    <section class="card scriptlib-filter-card">
      <div class="panel-header">
        <div class="panel-title">
          <h3>筛选条件</h3>
          <p>默认查看完整池，可切换月度新增，并按主题标签、训练目标和月份快速定位培训内容。</p>
        </div>
        <div class="mini-pill" id="scriptLibraryModeHint">长期沉淀主题</div>
      </div>
      <div class="scriptlib-filter-stack">
        <div class="scriptlib-filter-row">
          <span class="scriptlib-filter-label">查看范围</span>
          <div class="scriptlib-chip-group" id="scriptViewFilters"></div>
        </div>
        <div class="scriptlib-filter-row">
          <span class="scriptlib-filter-label">业务场景</span>
          <div class="scriptlib-chip-group" id="scriptSceneFilters"></div>
        </div>
        <div class="scriptlib-filter-row">
          <span class="scriptlib-filter-label">主题标签</span>
          <div class="scriptlib-chip-group" id="scriptTagFilters"></div>
        </div>
        <div class="scriptlib-filter-row">
          <span class="scriptlib-filter-label">训练目标</span>
          <div class="scriptlib-chip-group" id="scriptGoalFilters"></div>
        </div>
        <div class="scriptlib-filter-row" id="scriptStatusFilterRow">
          <span class="scriptlib-filter-label">主题状态</span>
          <div class="scriptlib-chip-group" id="scriptStatusFilters"></div>
        </div>
        <div class="scriptlib-filter-row" id="scriptMonthFilterRow">
          <span class="scriptlib-filter-label">月份</span>
          <div class="scriptlib-chip-group" id="scriptMonthFilters"></div>
        </div>
      </div>
    </section>

    <div class="scriptlib-stats-grid">
      <div class="stat-card scriptlib-stat-card">
        <div class="stat-label" id="scriptStatOneLabel"></div>
        <div class="stat-value" id="scriptStatOneValue"></div>
        <p id="scriptStatOneDesc"></p>
      </div>
      <div class="stat-card scriptlib-stat-card">
        <div class="stat-label" id="scriptStatTwoLabel"></div>
        <div class="stat-value" id="scriptStatTwoValue"></div>
        <p id="scriptStatTwoDesc"></p>
      </div>
      <div class="stat-card scriptlib-stat-card">
        <div class="stat-label" id="scriptStatThreeLabel"></div>
        <div class="stat-value" id="scriptStatThreeValue"></div>
        <p id="scriptStatThreeDesc"></p>
      </div>
    </div>

    <div class="stack-16">
      <section class="card scriptlib-list-card">
        <div class="panel-header">
          <div class="panel-title">
            <h3 id="scriptListTitle">长期主题库</h3>
            <p id="scriptListDescription">默认展示长期沉淀下来的邀约培训主题。</p>
          </div>
          <div class="mini-pill" id="scriptMatchCount">匹配 0 个主题</div>
        </div>
        <div class="scriptlib-list" id="scriptLibraryList"></div>
      </section>

      <section class="card scriptlib-detail-card">
        <div class="panel-header">
          <div class="panel-title">
            <h3>主题详情</h3>
            <p id="scriptDetailSubtitle">点击左侧主题查看推荐话术、训练要点与代表样本。</p>
          </div>
          <div class="mini-pill" id="scriptDetailBadge">主题详情</div>
        </div>
        <div id="scriptLibraryDetail"></div>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Replace the script-library runtime block in `app-runtime.js`**

Replace the current script-library block that starts at `const scriptLibraryOptions = {` and ends at `renderScriptLibraryPage()` with a contract-driven implementation that:

```js
const scriptLibraryContract = window.__scriptLibraryContract;
const scriptLibraryUtils = window.__scriptLibraryUtils;
const scriptLibraryPayload = scriptLibraryContract?.scriptLibraryExamplePayload || { monthly_packages: [], global_pool: {} };
const scriptLibraryState = scriptLibraryUtils
  ? scriptLibraryUtils.getDefaultScriptLibraryState(scriptLibraryPayload)
  : {
      view: 'global',
      scene: 'invite',
      tag: 'all',
      goal: 'all',
      status: 'all',
      month: '',
      selectedTopicId: null
    };
```

and render:

- `scriptViewFilters`
- `scriptSceneFilters`
- `scriptTagFilters`
- `scriptGoalFilters`
- `scriptStatusFilters`
- `scriptMonthFilters`
- stat cards from `model.stats`
- left topic cards from `model.topics`
- right detail area from `model.selectedTopic`
- empty states for reception/test-drive with selectable scene entry

Keep the route hook unchanged:

```js
if (activeRouteId === 'script-library') {
  renderScriptLibraryPage();
}
```

- [ ] **Step 5: Extend `voice-qc-admin.css` for the new topic-library layout**

```css
.scriptlib-filter-row[hidden] {
  display: none;
}

.scriptlib-sample-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.scriptlib-sample-card {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line-soft);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(249, 251, 254, 0.94));
}

.scriptlib-sample-quote-card {
  margin-top: 14px;
}
```

Keep the existing `scriptlib-*` card/chip styles and only add what the new detail and sample layout needs.

- [ ] **Step 6: Run the utility test again after the UI rewrite**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: PASS with the new UI-facing assertion included.

- [ ] **Step 7: Start a local server and verify the page in a browser**

Run:

```bash
python -m http.server 4173 --directory "C:/Users/xieyuxin/.config/superpowers/worktrees/voice-qc/script-library-monthly-training"
```

Open:

```text
http://localhost:4173/script-library/index.html
```

Manual checklist:

1. Default load lands on **完整池 / 邀约**.
2. Switching to **月度新增** shows the month row and hides the status row.
3. **2026-05 / 邀约** shows 2 monthly topics and top tag `到店邀约推进`.
4. Clicking **接待** keeps the page shell visible and shows the `接待主题待接入` empty state.
5. Clicking **试驾** keeps the page shell visible and shows the `试驾主题待接入` empty state.
6. Clicking `微信留资承接` filters the long-term topic list down to `先发资料再承接微信`.

- [ ] **Step 8: Commit the front-end redesign**

```bash
git add script-library/index.html app-runtime.js voice-qc-admin.css
git commit -m "feat: redesign script library for monthly topic output"
```

## Task 5: Write the backend and frontend handoff documents

**Files:**
- Create: `docs/script-library-backend-handoff.md`
- Create: `docs/script-library-frontend-handoff.md`

- [ ] **Step 1: Write the backend handoff doc**

```md
# Script Library Backend Handoff

## What the backend needs to own

1. Monthly success-case filtering
2. Reuse of invite `优势发掘[]`
3. Monthly topic generation prompt execution
4. Writing payloads that match `script-library/script-library-contract.js`
5. Rule-based `global_pool` merge

## Source files to follow

- `script-library/script-library-contract.js`
- `script-library/script-library-llm-assets.js`

## Expected monthly input

```json
{
  "month": "2026-05",
  "scene": "invite",
  "success_cases": []
}
```

## Expected monthly output

Use `MONTHLY_TOPIC_OUTPUT_SCHEMA` from `script-library/script-library-llm-assets.js`.

## Monthly job sequence

1. Filter success invite cases
2. Expand `优势发掘[]`
3. Build normalized LLM input
4. Call model with `buildMonthlyTopicGenerationPrompt(...)`
5. Validate output against `MONTHLY_TOPIC_OUTPUT_SCHEMA`
6. Write `monthly_packages`
7. Merge into `global_pool`
```
```

- [ ] **Step 2: Write the frontend handoff doc**

```md
# Script Library Frontend Handoff

## What the frontend currently expects

The page consumes a payload with two layers:

- `monthly_packages`
- `global_pool`

The contract and example payload live in `script-library/script-library-contract.js`.

## Frontend runtime files

- `script-library/page.js`
- `script-library/index.html`
- `script-library/script-library-utils.js`
- `app-runtime.js`
- `voice-qc-admin.css`

## Supported views

1. `完整池`
2. `月度新增`

## Supported scenes

1. `邀约`
2. `接待` (empty state for now)
3. `试驾` (empty state for now)

## Integration rule

Once backend API is ready, replace the example payload source in `script-library/script-library-contract.js` with real API data that preserves the same field names.
```
```

- [ ] **Step 3: Verify the handoff docs mention the code artifacts engineers should follow**

Run:

```bash
git diff -- docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
```

Expected: both docs explicitly mention the contract file, the LLM asset file, and the frontend runtime files.

- [ ] **Step 4: Commit the handoff docs**

```bash
git add docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
git commit -m "docs: add script library handoff packages"
```

## Final verification pass

- [ ] **Step 1: Run all focused Node tests**

Run:

```bash
node --test tests/script-library-contract.test.js tests/script-library-llm-assets.test.js tests/script-library-utils.test.js
```

Expected: PASS with all contract, LLM asset, and front-end utility tests green.

- [ ] **Step 2: Check the final diff for only the delivery-package files**

Run:

```bash
git diff -- script-library/script-library-contract.js script-library/script-library-llm-assets.js script-library/script-library-utils.js tests/script-library-contract.test.js tests/script-library-llm-assets.test.js tests/script-library-utils.test.js script-library/page.js script-library/index.html app-runtime.js voice-qc-admin.css docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
```

Expected: only the contract layer, prompt assets, front-end integration, styling, and handoff docs are included.

- [ ] **Step 3: Summarize the delivery package for the reviewer**

Use this handoff summary:

```text
Built a script-library delivery package for two downstream engineers.
Backend handoff: shared output contract, neutral monthly LLM prompt/input builder, output schema, and backend handoff doc.
Frontend handoff: contract-driven topic-library page, monthly/global filters, empty states for reception/test-drive, and frontend handoff doc.
Verified with Node tests and browser checks at /script-library/index.html.
```