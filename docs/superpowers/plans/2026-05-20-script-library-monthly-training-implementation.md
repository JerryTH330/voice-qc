# Script Library Monthly Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static “优秀话术库” demo with a monthly/global topic library that consumes backend-contract-shaped mock data, defaults to the complete pool, supports monthly drill-down, and keeps invite / reception / test-drive scene entry behavior aligned with the approved spec.

**Architecture:** Keep the current static-app structure, but move all script-library data contract, filtering, stats, empty-state, and selected-topic fallback logic into one browser-safe utility module under Node tests. Then rewire the existing script-library shell in `app-runtime.js` to render from that utility, while `script-library/index.html` and `voice-qc-admin.css` provide the new filter rows, stat placeholders, topic cards, and representative-sample detail layout.

**Tech Stack:** Plain HTML, plain browser JavaScript, static CSS, Node `--test`, Python `http.server` for manual browser verification.

---

## File Structure

- Create: `script-library/script-library-utils.js`
  - UMD/browser-safe module exporting the mock `monthly_packages` + `global_pool` payload and pure helpers for state defaults, filter options, stats, empty scenes, and selected-topic fallback.
- Create: `tests/script-library-utils.test.js`
  - Node tests for default state, monthly/global filtering, active/stale status filtering, reception/test-drive empty states, and selected-topic fallback.
- Modify: `script-library/page.js:1-13`
  - Load `script-library-utils.js` before `app-runtime.js`.
- Modify: `script-library/index.html:121-186`
  - Replace the old static filter rows and hard-coded stat copy with dynamic containers for view / scene / tag / goal / status / month filters and stat-card placeholders.
- Modify: `app-runtime.js:4676-4809, 5415-5585, 15472-15474`
  - Remove the hard-coded script library options/data and render the page from the shared utility model.
- Modify: `voice-qc-admin.css:5136-5360`
  - Extend the current script library styles for the new filter rows, stat copy, topic metadata, representative sample cards, and empty-scene states.

## Task 1: Add a shared script-library data contract utility and load it before `app-runtime.js`

**Files:**
- Create: `script-library/script-library-utils.js`
- Create: `tests/script-library-utils.test.js`
- Modify: `script-library/page.js:1-13`

- [ ] **Step 1: Write the failing Node test for the shared utility**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  VIEW_KEYS,
  SCENE_KEYS,
  ALL_FILTER,
  scriptLibraryPayload,
  getDefaultScriptLibraryState,
  buildScriptLibraryViewModel
} = require('../script-library/script-library-utils.js');

test('default state lands on global invite and keeps the newest month ready for monthly mode', () => {
  assert.deepEqual(getDefaultScriptLibraryState(scriptLibraryPayload), {
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
  const model = buildScriptLibraryViewModel(scriptLibraryPayload, {
    view: VIEW_KEYS.monthly,
    scene: SCENE_KEYS.invite,
    month: '2026-05'
  });

  assert.equal(model.flags.showMonthFilter, true);
  assert.equal(model.flags.showStatusFilter, false);
  assert.equal(model.topics.length, 2);
  assert.equal(model.stats[0].label, '本月新增主题数');
  assert.equal(model.stats[0].value, '2');
  assert.equal(model.stats[2].value, '到店邀约推进');
});

test('global invite mode can filter active topics only', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryPayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    status: 'active'
  });

  assert.deepEqual(
    model.topics.map((topic) => topic.topic_id),
    ['inv-p-001', 'inv-p-003']
  );
});

test('reception scene stays selectable and returns empty-state copy', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryPayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.reception
  });

  assert.equal(model.sceneMeta.hasSceneData, false);
  assert.equal(model.sceneMeta.emptyTitle, '接待主题待接入');
  assert.match(model.sceneMeta.emptyDescription, /后续接入接待单条打标/);
});

test('selected topic falls back to the first visible topic after filtering', () => {
  const model = buildScriptLibraryViewModel(scriptLibraryPayload, {
    view: VIEW_KEYS.global,
    scene: SCENE_KEYS.invite,
    tag: 'T07',
    selectedTopicId: 'inv-p-001'
  });

  assert.equal(model.selectedTopic.topic_id, 'inv-p-002');
  assert.equal(model.state.selectedTopicId, 'inv-p-002');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: FAIL with `Cannot find module '../script-library/script-library-utils.js'`.

- [ ] **Step 3: Create `script-library/script-library-utils.js` with the mock payload and pure view-model helpers**

```js
(function (global, factory) {
  const api = factory();
  global.__scriptLibraryUtils = api;
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

  const VIEW_OPTIONS = [
    { value: VIEW_KEYS.global, label: '完整池' },
    { value: VIEW_KEYS.monthly, label: '月度新增' }
  ];

  const SCENE_OPTIONS = [
    { value: SCENE_KEYS.invite, label: '邀约' },
    { value: SCENE_KEYS.reception, label: '接待' },
    { value: SCENE_KEYS.testDrive, label: '试驾' }
  ];

  const STATUS_LABELS = {
    active: '持续有效',
    observing: '观察中',
    stale: '历史沉淀'
  };

  const scriptLibraryPayload = {
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
              primary_tags: [
                { tag_code: 'T01', tag_name: '深度需求挖掘' },
                { tag_code: 'T09', tag_name: '到店邀约推进' }
              ],
              action_pattern: '需求挖掘->到店推进',
              training_goal: '提升到店确认率',
              summary: '先把家庭结构、用车场景和预算问清，再用明确到店收益收口。',
              recommended_script: '您平时主要是谁开、更多是通勤还是家用？我先帮您把版本范围收一收，您到店看车和试驾会更高效。',
              training_points: [
                '前 3 分钟至少确认两项真实需求。',
                '到店推进必须带具体体验收益。',
                '不要只说“有空来看看”，要给时间锚点。'
              ],
              apply_when: ['客户仍在比较车型', '客户尚未锁定版本'],
              avoid_when: ['客户明确拒绝继续沟通', '非真实购车场景'],
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
                  quote: '您明天下午过来，我把现车和试驾都给您安排好，您会更直观。',
                  replicable_point: '把时间、到店收益和后续安排一次说完整。',
                  start_time: '03:12',
                  end_time: '03:46',
                  qc_source_ref: 'invite-qc-202605-011',
                  asr_excerpt_ref: 'asr-segment-202605-011'
                },
                {
                  call_id: 'call-202605-024',
                  audio_id: 'audio-202605-024',
                  store_id: 'store-su-gy',
                  sales_id: 'sales-034',
                  source_month: '2026-05',
                  success_result: '接待成功',
                  tag_code: 'T01',
                  tag_name: '深度需求挖掘',
                  confidence: '高',
                  level: 'A',
                  quote: '您平时更多是自己通勤还是带家人一起用？我按这个帮您筛版本。',
                  replicable_point: '先问使用人群和场景，再引出版本与到店动作。',
                  start_time: '01:28',
                  end_time: '01:58',
                  qc_source_ref: 'invite-qc-202605-024',
                  asr_excerpt_ref: 'asr-segment-202605-024'
                }
              ]
            },
            {
              topic_id: 'inv-2026-05-02',
              topic_name: '先发资料再承接微信',
              primary_tags: [
                { tag_code: 'T07', tag_name: '微信留资承接' }
              ],
              action_pattern: '资料承接->微信留资',
              training_goal: '提升微信承接率',
              summary: '先给客户一个自然的资料承接理由，再顺势完成微信留资。',
              recommended_script: '我把配置表、报价范围和店里位置一起发您微信，您后面想比较版本时也方便直接看。',
              training_points: [
                '微信承接要有自然理由。',
                '资料、定位、后续动作最好一次讲全。',
                '避免生硬地直接索要微信。'
              ],
              apply_when: ['客户主动索要报价或配置', '客户愿意继续比较版本'],
              avoid_when: ['客户明确不愿留资', '客户只问售后问题'],
              source_sample_count: 5,
              representative_samples: [
                {
                  call_id: 'call-202605-043',
                  audio_id: 'audio-202605-043',
                  store_id: 'store-hz-gs',
                  sales_id: 'sales-056',
                  source_month: '2026-05',
                  success_result: '试驾成功',
                  tag_code: 'T07',
                  tag_name: '微信留资承接',
                  confidence: '高',
                  level: 'A',
                  quote: '我把两版配置和这周试驾时段一起发您微信，您看完直接回我就行。',
                  replicable_point: '把资料发送和下一步动作绑定，不让加微信变成孤立动作。',
                  start_time: '02:06',
                  end_time: '02:31',
                  qc_source_ref: 'invite-qc-202605-043',
                  asr_excerpt_ref: 'asr-segment-202605-043'
                }
              ]
            }
          ]
        },
        reception: {
          overview: { top_tags: [] },
          topics: []
        },
        test_drive: {
          overview: { top_tags: [] },
          topics: []
        }
      },
      {
        month: '2026-04',
        invite: {
          overview: {
            top_tags: [
              { tag_code: 'T04', tag_name: '价格异议处理', count: 4 }
            ]
          },
          topics: [
            {
              topic_id: 'inv-2026-04-01',
              topic_name: '先处理价格顾虑再锁到店',
              primary_tags: [
                { tag_code: 'T04', tag_name: '价格异议处理' },
                { tag_code: 'T09', tag_name: '到店邀约推进' }
              ],
              action_pattern: '价格顾虑->到店详谈',
              training_goal: '降低价格顾虑流失',
              summary: '先承接预算压力，再把价格问题转成到店后可验证的完整方案。',
              recommended_script: '我理解您现在卡在总预算上，电话里很难把补贴和金融一起讲清，您到店我把完整落地方案给您拆开看。',
              training_points: [
                '先共情预算压力，不要立刻说“已经到底价”。',
                '把价格顾虑转换成方案解释空间。',
                '用到店后的具体动作收口。'
              ],
              apply_when: ['客户主要卡在预算', '客户仍愿意继续比较'],
              avoid_when: ['客户只想终止沟通'],
              source_sample_count: 4,
              representative_samples: [
                {
                  call_id: 'call-202604-014',
                  audio_id: 'audio-202604-014',
                  store_id: 'store-nj-jy',
                  sales_id: 'sales-009',
                  source_month: '2026-04',
                  success_result: '到店成功',
                  tag_code: 'T04',
                  tag_name: '价格异议处理',
                  confidence: '高',
                  level: 'A',
                  quote: '您先别只盯裸车价，我把置换补贴和金融一起给您拆一版，到店看会更清楚。',
                  replicable_point: '把价格拉扯转成总成本拆解。',
                  start_time: '04:01',
                  end_time: '04:28',
                  qc_source_ref: 'invite-qc-202604-014',
                  asr_excerpt_ref: 'asr-segment-202604-014'
                }
              ]
            }
          ]
        },
        reception: {
          overview: { top_tags: [] },
          topics: []
        },
        test_drive: {
          overview: { top_tags: [] },
          topics: []
        }
      }
    ],
    global_pool: {
      invite: {
        topics: [
          {
            topic_id: 'inv-p-001',
            topic_name: '先挖需求再推进到店',
            primary_tags: [
              { tag_code: 'T01', tag_name: '深度需求挖掘' },
              { tag_code: 'T09', tag_name: '到店邀约推进' }
            ],
            action_pattern: '需求挖掘->到店推进',
            training_goal: '提升到店确认率',
            summary: '长期有效的邀约主题：先收真实需求，再把到店价值收口成明确动作。',
            recommended_script: '您平时是谁开、主要是通勤还是家用？我先帮您把版本和体验重点收一收，您到店看车会快很多。',
            training_points: [
              '需求探询要能服务后续推进。',
              '到店推进要有明确收益和时间锚点。',
              '不要把需求探询做成问卷。'
            ],
            apply_when: ['客户仍在比较车型', '客户尚未锁定版本'],
            avoid_when: ['客户只想结束通话'],
            first_seen_month: '2026-04',
            last_seen_month: '2026-05',
            source_months: ['2026-04', '2026-05'],
            recent_3m_count: 2,
            status: 'active',
            source_sample_count: 11,
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
                quote: '您明天下午过来，我把现车和试驾都给您安排好，您会更直观。',
                replicable_point: '时间、收益、后续安排一次讲完整。',
                start_time: '03:12',
                end_time: '03:46',
                qc_source_ref: 'invite-qc-202605-011',
                asr_excerpt_ref: 'asr-segment-202605-011'
              }
            ]
          },
          {
            topic_id: 'inv-p-002',
            topic_name: '先发资料再承接微信',
            primary_tags: [
              { tag_code: 'T07', tag_name: '微信留资承接' }
            ],
            action_pattern: '资料承接->微信留资',
            training_goal: '提升微信承接率',
            summary: '通过资料发送和后续动作捆绑，提升微信承接成功率。',
            recommended_script: '我把配置、报价范围和定位一起发您微信，您后面对比版本更方便，也能直接约试驾。',
            training_points: [
              '先给资料理由，再承接微信。',
              '发完资料要带下一步动作。'
            ],
            apply_when: ['客户主动要资料', '客户愿意继续比较'],
            avoid_when: ['客户明确拒绝留资'],
            first_seen_month: '2026-05',
            last_seen_month: '2026-05',
            source_months: ['2026-05'],
            recent_3m_count: 1,
            status: 'observing',
            source_sample_count: 5,
            representative_samples: [
              {
                call_id: 'call-202605-043',
                audio_id: 'audio-202605-043',
                store_id: 'store-hz-gs',
                sales_id: 'sales-056',
                source_month: '2026-05',
                success_result: '试驾成功',
                tag_code: 'T07',
                tag_name: '微信留资承接',
                confidence: '高',
                level: 'A',
                quote: '我把两版配置和这周试驾时段一起发您微信，您看完直接回我就行。',
                replicable_point: '资料发送和下一步动作必须一起交代。',
                start_time: '02:06',
                end_time: '02:31',
                qc_source_ref: 'invite-qc-202605-043',
                asr_excerpt_ref: 'asr-segment-202605-043'
              }
            ]
          },
          {
            topic_id: 'inv-p-003',
            topic_name: '先处理价格顾虑再锁到店',
            primary_tags: [
              { tag_code: 'T04', tag_name: '价格异议处理' },
              { tag_code: 'T09', tag_name: '到店邀约推进' }
            ],
            action_pattern: '价格顾虑->到店详谈',
            training_goal: '降低价格顾虑流失',
            summary: '长期有效的价格顾虑承接方法：先拆解压力点，再把比较空间留到店里。',
            recommended_script: '电话里只聊裸车价很难讲完整，我把补贴、金融和置换拆开给您算一版，您到店看会更清楚。',
            training_points: [
              '共情预算压力，避免直接反驳。',
              '把价格争论转换成完整方案说明。'
            ],
            apply_when: ['客户重点卡在预算'],
            avoid_when: ['客户已经明确不考虑'],
            first_seen_month: '2026-03',
            last_seen_month: '2026-04',
            source_months: ['2026-03', '2026-04'],
            recent_3m_count: 2,
            status: 'active',
            source_sample_count: 8,
            representative_samples: [
              {
                call_id: 'call-202604-014',
                audio_id: 'audio-202604-014',
                store_id: 'store-nj-jy',
                sales_id: 'sales-009',
                source_month: '2026-04',
                success_result: '到店成功',
                tag_code: 'T04',
                tag_name: '价格异议处理',
                confidence: '高',
                level: 'A',
                quote: '您先别只盯裸车价，我把置换补贴和金融一起给您拆一版，到店看会更清楚。',
                replicable_point: '把价格顾虑拉回总成本和完整方案。',
                start_time: '04:01',
                end_time: '04:28',
                qc_source_ref: 'invite-qc-202604-014',
                asr_excerpt_ref: 'asr-segment-202604-014'
              }
            ]
          }
        ]
      },
      reception: {
        topics: []
      },
      test_drive: {
        topics: []
      }
    }
  };

  function getMonthlyPackages(payload = scriptLibraryPayload) {
    return payload.monthly_packages || [];
  }

  function getMonthOptions(payload = scriptLibraryPayload) {
    return getMonthlyPackages(payload).map((entry) => ({
      value: entry.month,
      label: entry.month
    }));
  }

  function getDefaultScriptLibraryState(payload = scriptLibraryPayload) {
    const months = getMonthOptions(payload);
    return {
      view: VIEW_KEYS.global,
      scene: SCENE_KEYS.invite,
      tag: ALL_FILTER,
      goal: ALL_FILTER,
      status: ALL_FILTER,
      month: months[0] ? months[0].value : '',
      selectedTopicId: null
    };
  }

  function getSceneCollection(payload, state) {
    if (state.view === VIEW_KEYS.monthly) {
      const monthlyEntry = getMonthlyPackages(payload).find((item) => item.month === state.month) || getMonthlyPackages(payload)[0] || {};
      return monthlyEntry[state.scene] || { overview: { top_tags: [] }, topics: [] };
    }

    return payload.global_pool?.[state.scene] || { topics: [] };
  }

  function getStatusLabel(status) {
    return STATUS_LABELS[status] || '未标记';
  }

  function getPrimaryTagCodes(topic) {
    return (topic.primary_tags || []).map((tag) => tag.tag_code);
  }

  function getPrimaryTagNames(topic) {
    return (topic.primary_tags || []).map((tag) => tag.tag_name);
  }

  function topicMatchesFilters(topic, state) {
    const tagMatch = state.tag === ALL_FILTER || getPrimaryTagCodes(topic).includes(state.tag);
    const goalMatch = state.goal === ALL_FILTER || topic.training_goal === state.goal;
    const statusMatch = state.view !== VIEW_KEYS.global || state.status === ALL_FILTER || topic.status === state.status;
    return tagMatch && goalMatch && statusMatch;
  }

  function uniq(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function getTagOptions(topics) {
    return [
      { value: ALL_FILTER, label: '全部' },
      ...uniq(topics.flatMap(getPrimaryTagCodes)).map((tagCode) => {
        const topic = topics.find((item) => getPrimaryTagCodes(item).includes(tagCode));
        const tag = (topic.primary_tags || []).find((item) => item.tag_code === tagCode);
        return {
          value: tagCode,
          label: tag ? tag.tag_name : tagCode
        };
      })
    ];
  }

  function getGoalOptions(topics) {
    return [
      { value: ALL_FILTER, label: '全部' },
      ...uniq(topics.map((topic) => topic.training_goal)).map((goal) => ({
        value: goal,
        label: goal
      }))
    ];
  }

  function getStatusOptions(topics) {
    return [
      { value: ALL_FILTER, label: '全部' },
      ...uniq(topics.map((topic) => topic.status)).map((status) => ({
        value: status,
        label: getStatusLabel(status)
      }))
    ];
  }

  function decorateTopic(topic, state) {
    const sampleCount = (topic.representative_samples || []).length;
    return {
      ...topic,
      status_label: getStatusLabel(topic.status),
      primary_tag_names: getPrimaryTagNames(topic),
      sample_count: sampleCount,
      source_months_text: state.view === VIEW_KEYS.global
        ? `来源月份：${(topic.source_months || []).join(' / ') || '--'}`
        : `所属月份：${state.month}`,
      freshness_text: state.view === VIEW_KEYS.global
        ? `最近验证：${topic.last_seen_month || '--'}`
        : `来源样本：${topic.source_sample_count || 0} 条`
    };
  }

  function getSampleCount(topics) {
    return topics.reduce((total, topic) => total + ((topic.representative_samples || []).length), 0);
  }

  function getStats(state, sceneCollection, topics) {
    if (state.view === VIEW_KEYS.monthly) {
      const topTag = (sceneCollection.overview?.top_tags || [])[0];
      return [
        {
          label: '本月新增主题数',
          value: String(topics.length),
          description: '本月进入培训沉淀的邀约主题数量。'
        },
        {
          label: '本月入选代表样本数',
          value: String(getSampleCount(topics)),
          description: '当前筛选下可回溯的代表样本总数。'
        },
        {
          label: '本月高频主标签',
          value: topTag ? topTag.tag_name : '--',
          description: topTag ? `命中 ${topTag.count} 个成功样本片段。` : '当前场景暂无主标签统计。'
        }
      ];
    }

    return [
      {
        label: '长期沉淀主题数',
        value: String(topics.length),
        description: '当前筛选下可长期复用的主题数量。'
      },
      {
        label: '最近 3 个月活跃主题数',
        value: String(topics.filter((topic) => topic.status === 'active').length),
        description: '最近仍被月包验证到的有效主题。'
      },
      {
        label: '累计代表样本数',
        value: String(getSampleCount(topics)),
        description: '这些主题下可直接用于培训的代表样本总数。'
      }
    ];
  }

  function getSceneMeta(state, sourceTopicsLength) {
    if (sourceTopicsLength > 0) {
      return {
        hasSceneData: true,
        emptyTitle: '',
        emptyDescription: ''
      };
    }

    if (state.scene === SCENE_KEYS.reception) {
      return {
        hasSceneData: false,
        emptyTitle: '接待主题待接入',
        emptyDescription: '当前保留场景入口和数据结构，后续接入接待单条打标与月度沉淀后展示。'
      };
    }

    if (state.scene === SCENE_KEYS.testDrive) {
      return {
        hasSceneData: false,
        emptyTitle: '试驾主题待接入',
        emptyDescription: '当前保留场景入口和数据结构，后续接入试驾单条打标与月度沉淀后展示。'
      };
    }

    return {
      hasSceneData: false,
      emptyTitle: '当前筛选下暂无匹配主题',
      emptyDescription: '可以切换主题标签、训练目标或月份后再试一次。'
    };
  }

  function buildScriptLibraryViewModel(payload = scriptLibraryPayload, rawState = {}) {
    const defaultState = getDefaultScriptLibraryState(payload);
    const months = getMonthOptions(payload);
    const state = {
      ...defaultState,
      ...rawState
    };

    if (!months.some((option) => option.value === state.month)) {
      state.month = defaultState.month;
    }

    const sceneCollection = getSceneCollection(payload, state);
    const sourceTopics = sceneCollection.topics || [];
    const topics = sourceTopics
      .filter((topic) => topicMatchesFilters(topic, state))
      .map((topic) => decorateTopic(topic, state));
    const selectedTopic = topics.find((topic) => topic.topic_id === state.selectedTopicId) || topics[0] || null;
    const activeScene = SCENE_OPTIONS.find((option) => option.value === state.scene);

    return {
      state: {
        ...state,
        selectedTopicId: selectedTopic ? selectedTopic.topic_id : null
      },
      filters: {
        views: VIEW_OPTIONS,
        scenes: SCENE_OPTIONS,
        tags: getTagOptions(sourceTopics),
        goals: getGoalOptions(sourceTopics),
        statuses: getStatusOptions(sourceTopics),
        months
      },
      flags: {
        showStatusFilter: state.view === VIEW_KEYS.global,
        showMonthFilter: state.view === VIEW_KEYS.monthly
      },
      sceneMeta: getSceneMeta(state, sourceTopics.length),
      stats: getStats(state, sceneCollection, topics),
      topics,
      selectedTopic,
      listTitle: state.view === VIEW_KEYS.global ? '长期主题库' : `${state.month} 月新增主题`,
      listDescription: state.view === VIEW_KEYS.global
        ? '默认展示长期沉淀下来的邀约培训主题，可按标签、训练目标和状态筛选。'
        : '查看单月独立沉淀结果，不与历史月份互相覆盖。',
      detailSubtitle: selectedTopic
        ? `${activeScene ? activeScene.label : '邀约'} · ${selectedTopic.training_goal}`
        : '点击左侧主题查看推荐话术、训练要点与代表样本。',
      modeHint: state.view === VIEW_KEYS.global ? '长期沉淀主题' : `${state.month} 月新增`,
      matchCountLabel: `匹配 ${topics.length} 个主题`
    };
  }

  return {
    VIEW_KEYS,
    SCENE_KEYS,
    ALL_FILTER,
    scriptLibraryPayload,
    getDefaultScriptLibraryState,
    buildScriptLibraryViewModel,
    getStatusLabel
  };
});
```

- [ ] **Step 4: Load the shared utility before `app-runtime.js`**

```js
/* 优秀话术库 independent page bootstrap. */
window.__AI_QC_DEFAULT_ROUTE = 'script-library';
(function loadPageRuntime() {
  const scripts = ['./script-library-utils.js', '../app-runtime.js'];
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

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: PASS with 5 passing tests.

- [ ] **Step 6: Commit the utility, tests, and bootstrap loader**

```bash
git add script-library/script-library-utils.js script-library/page.js tests/script-library-utils.test.js
git commit -m "feat: add script library data contract utilities"
```

## Task 2: Rebuild the script-library page shell and `app-runtime.js` around the shared utility model

**Files:**
- Modify: `script-library/index.html:121-186`
- Modify: `app-runtime.js:4676-4809, 5415-5585, 15472-15474`

- [ ] **Step 1: Replace the old static script-library template with dynamic filter/stat placeholders**

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
            <h3 id="scriptDetailTitle">主题详情</h3>
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

- [ ] **Step 2: Replace the hard-coded script-library options/data/state block in `app-runtime.js`**

```js
const scriptLibraryUtils = window.__scriptLibraryUtils;
const scriptLibraryPayload = scriptLibraryUtils?.scriptLibraryPayload || { monthly_packages: [], global_pool: {} };
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

Delete the old block that starts at `const scriptLibraryOptions = {` and ends at the closing `]` of `scriptLibraryData`.

- [ ] **Step 3: Replace the old filter/list/detail render functions with utility-driven rendering**

```js
function renderScriptLibraryChips(containerId, filterKey, options) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = options
    .map((option) => {
      const active = scriptLibraryState[filterKey] === option.value ? ' active' : '';
      return `<button type="button" class="scriptlib-chip${active}" data-script-filter="${filterKey}" data-script-value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</button>`;
    })
    .join('');
}

function getScriptLibraryStatusClass(status) {
  if (status === 'active') return 'green';
  if (status === 'observing') return 'blue';
  return 'gray';
}

function renderScriptLibraryStats(cards) {
  const [first, second, third] = cards;
  const mappings = [
    ['scriptStatOneLabel', 'scriptStatOneValue', 'scriptStatOneDesc', first],
    ['scriptStatTwoLabel', 'scriptStatTwoValue', 'scriptStatTwoDesc', second],
    ['scriptStatThreeLabel', 'scriptStatThreeValue', 'scriptStatThreeDesc', third]
  ];

  mappings.forEach(([labelId, valueId, descId, card]) => {
    const labelNode = document.getElementById(labelId);
    const valueNode = document.getElementById(valueId);
    const descNode = document.getElementById(descId);
    if (!labelNode || !valueNode || !descNode || !card) {
      return;
    }
    labelNode.textContent = card.label;
    valueNode.textContent = card.value;
    descNode.textContent = card.description;
  });
}

function renderScriptLibraryList(model) {
  const list = document.getElementById('scriptLibraryList');
  const count = document.getElementById('scriptMatchCount');
  const title = document.getElementById('scriptListTitle');
  const description = document.getElementById('scriptListDescription');
  if (!list || !count || !title || !description) {
    return;
  }

  title.textContent = model.listTitle;
  description.textContent = model.listDescription;
  count.textContent = model.matchCountLabel;

  if (!model.sceneMeta.hasSceneData) {
    list.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon"></div>
        <strong>${escapeHtml(model.sceneMeta.emptyTitle)}</strong>
        <span>${escapeHtml(model.sceneMeta.emptyDescription)}</span>
      </div>
    `;
    return;
  }

  if (!model.topics.length) {
    list.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon"></div>
        <strong>当前筛选下暂无匹配主题</strong>
        <span>可以切换主题标签、训练目标、状态或月份后再试一次。</span>
      </div>
    `;
    return;
  }

  list.innerHTML = model.topics
    .map((topic) => {
      const selected = topic.topic_id === model.state.selectedTopicId ? ' selected' : '';
      const statusClass = getScriptLibraryStatusClass(topic.status);
      return `
        <article class="scriptlib-item${selected}">
          <div class="scriptlib-item-head">
            <div>
              <div class="scriptlib-item-title-row">
                <h4>${escapeHtml(topic.topic_name)}</h4>
                <span class="status ${statusClass}">${escapeHtml(topic.status_label || '月度主题')}</span>
              </div>
              <p>${escapeHtml(topic.summary)}</p>
            </div>
            <div class="scriptlib-item-metric">
              <strong>${escapeHtml(String(topic.sample_count))}</strong>
              <span>代表样本</span>
            </div>
          </div>
          <div class="scriptlib-item-tags">
            ${topic.primary_tag_names.map((tag) => `<span class="mini-pill">${escapeHtml(tag)}</span>`).join('')}
            <span class="mini-pill">${escapeHtml(topic.training_goal)}</span>
          </div>
          <div class="scriptlib-item-foot">
            <div class="scriptlib-item-meta">
              <span>${escapeHtml(topic.source_months_text)}</span>
              <span>${escapeHtml(topic.freshness_text)}</span>
            </div>
            <button type="button" class="btn scriptlib-detail-trigger" data-script-select="${escapeHtml(topic.topic_id)}">查看详情</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderScriptLibraryDetail(model) {
  const subtitle = document.getElementById('scriptDetailSubtitle');
  const badge = document.getElementById('scriptDetailBadge');
  const detail = document.getElementById('scriptLibraryDetail');
  if (!subtitle || !badge || !detail) {
    return;
  }

  if (!model.selectedTopic) {
    subtitle.textContent = '点击左侧主题查看推荐话术、训练要点与代表样本。';
    badge.textContent = model.sceneMeta.hasSceneData ? '暂无详情' : '场景空态';
    detail.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon"></div>
        <strong>${escapeHtml(model.sceneMeta.hasSceneData ? '当前筛选下暂无详情' : model.sceneMeta.emptyTitle)}</strong>
        <span>${escapeHtml(model.sceneMeta.hasSceneData ? '先从左侧选择一个主题。' : model.sceneMeta.emptyDescription)}</span>
      </div>
    `;
    return;
  }

  const topic = model.selectedTopic;
  subtitle.textContent = model.detailSubtitle;
  badge.textContent = topic.training_goal;
  detail.innerHTML = `
    <div class="scriptlib-detail-hero">
      <div class="scriptlib-detail-copy">
        <h4>${escapeHtml(topic.topic_name)}</h4>
        <p>${escapeHtml(topic.summary)}</p>
      </div>
      <div class="scriptlib-detail-kpis">
        <div class="scriptlib-detail-kpi">
          <span>代表样本</span>
          <strong>${escapeHtml(String(topic.sample_count))}</strong>
        </div>
        <div class="scriptlib-detail-kpi">
          <span>${model.state.view === 'global' ? '最近验证' : '所属月份'}</span>
          <strong>${escapeHtml(model.state.view === 'global' ? (topic.last_seen_month || '--') : model.state.month)}</strong>
        </div>
      </div>
    </div>
    <div class="scriptlib-detail-snippet">
      <span class="scriptlib-detail-label">推荐培训话术</span>
      <blockquote>${escapeHtml(topic.recommended_script)}</blockquote>
    </div>
    <div class="scriptlib-detail-grid">
      <div class="scriptlib-detail-block">
        <span class="scriptlib-detail-label">训练要点</span>
        <ul class="scriptlib-tip-list">
          ${topic.training_points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      </div>
      <div class="scriptlib-detail-block">
        <span class="scriptlib-detail-label">适用边界</span>
        <ul class="scriptlib-tip-list">
          ${topic.apply_when.map((item) => `<li>适用：${escapeHtml(item)}</li>`).join('')}
          ${topic.avoid_when.map((item) => `<li>避免：${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="scriptlib-sample-list">
      ${topic.representative_samples.map((sample) => `
        <article class="scriptlib-sample-card">
          <div class="scriptlib-item-title-row">
            <h4>${escapeHtml(sample.tag_name)}</h4>
            <span class="mini-pill">${escapeHtml(sample.source_month)}</span>
            <span class="mini-pill">${escapeHtml(sample.success_result)}</span>
          </div>
          <div class="scriptlib-item-meta">
            <span>通话：${escapeHtml(sample.call_id)}</span>
            <span>片段：${escapeHtml(sample.start_time)} - ${escapeHtml(sample.end_time)}</span>
            <span>置信度：${escapeHtml(sample.confidence)}</span>
          </div>
          <div class="scriptlib-detail-snippet scriptlib-sample-quote-card">
            <span class="scriptlib-detail-label">关键原句</span>
            <blockquote>${escapeHtml(sample.quote)}</blockquote>
          </div>
          <ul class="scriptlib-tip-list">
            <li>${escapeHtml(sample.replicable_point)}</li>
          </ul>
        </article>
      `).join('')}
    </div>
  `;
}

function bindScriptLibraryEvents() {
  pageHost.querySelectorAll('[data-script-filter]').forEach((node) => {
    node.addEventListener('click', () => {
      const { scriptFilter, scriptValue } = node.dataset;
      scriptLibraryState[scriptFilter] = scriptValue;
      if (scriptFilter !== 'selectedTopicId') {
        scriptLibraryState.selectedTopicId = null;
      }
      renderScriptLibraryPage();
    });
  });

  pageHost.querySelectorAll('[data-script-select]').forEach((node) => {
    node.addEventListener('click', () => {
      scriptLibraryState.selectedTopicId = node.dataset.scriptSelect;
      renderScriptLibraryPage();
    });
  });
}

function renderScriptLibraryPage() {
  if (!scriptLibraryUtils) {
    return;
  }

  const model = scriptLibraryUtils.buildScriptLibraryViewModel(scriptLibraryPayload, scriptLibraryState);
  Object.assign(scriptLibraryState, model.state);

  const statusRow = document.getElementById('scriptStatusFilterRow');
  const monthRow = document.getElementById('scriptMonthFilterRow');
  const modeHint = document.getElementById('scriptLibraryModeHint');

  if (statusRow) {
    statusRow.hidden = !model.flags.showStatusFilter;
  }
  if (monthRow) {
    monthRow.hidden = !model.flags.showMonthFilter;
  }
  if (modeHint) {
    modeHint.textContent = model.modeHint;
  }

  renderScriptLibraryChips('scriptViewFilters', 'view', model.filters.views);
  renderScriptLibraryChips('scriptSceneFilters', 'scene', model.filters.scenes);
  renderScriptLibraryChips('scriptTagFilters', 'tag', model.filters.tags);
  renderScriptLibraryChips('scriptGoalFilters', 'goal', model.filters.goals);
  renderScriptLibraryChips('scriptStatusFilters', 'status', model.filters.statuses);
  renderScriptLibraryChips('scriptMonthFilters', 'month', model.filters.months);

  renderScriptLibraryStats(model.stats);
  renderScriptLibraryList(model);
  renderScriptLibraryDetail(model);
  bindScriptLibraryEvents();
}
```

- [ ] **Step 4: Keep the route hook unchanged so the rebuilt page still initializes from `renderPage`**

```js
if (activeRouteId === 'script-library') {
  renderScriptLibraryPage();
}
```

This stays where it is today at `app-runtime.js:15472-15474`; do not remove it while replacing the old script-library functions.

- [ ] **Step 5: Run the shared utility test again after wiring the page to the new model**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: PASS with the same 5 passing tests, proving that the runtime wiring did not change the pure data contract.

- [ ] **Step 6: Commit the template and runtime rewrite**

```bash
git add script-library/index.html app-runtime.js
git commit -m "feat: rebuild script library monthly and global views"
```

## Task 3: Extend the script-library styles and manually verify the new flows in a browser

**Files:**
- Modify: `voice-qc-admin.css:5136-5360`

- [ ] **Step 1: Extend the existing script-library styles for the new rows and sample cards**

```css
.scriptlib-filter-row[hidden] {
  display: none;
}

.scriptlib-stat-card .stat-label {
  min-height: 20px;
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

.scriptlib-sample-card .scriptlib-item-meta {
  margin-top: 10px;
}

.scriptlib-sample-quote-card {
  margin-top: 14px;
}

.scriptlib-sample-card .scriptlib-tip-list {
  margin-bottom: 0;
}
```

Keep the rest of the existing `scriptlib-*` styles intact unless the new layout visibly breaks. The current card, chip, stat, and detail classes at `voice-qc-admin.css:5136-5359` already cover most of the visual language.

- [ ] **Step 2: Run the shared utility test suite again after the style change**

Run:

```bash
node --test tests/script-library-utils.test.js
```

Expected: PASS with 5 passing tests.

- [ ] **Step 3: Start a local static server for browser verification**

Run:

```bash
python -m http.server 4173 --directory "C:/Users/xieyuxin/Desktop/voice-qc-git/voice-qc"
```

Expected: `Serving HTTP on :: port 4173` (or the IPv4 equivalent).

- [ ] **Step 4: Verify the approved UI flows in the browser**

Open:

```text
http://localhost:4173/script-library/index.html
```

Manual checklist:

1. Default load lands on **完整池 / 邀约** and shows the three long-term invite topics.
2. Switching to **月度新增** hides the `主题状态` row, shows the `月份` row, and defaults to `2026-05`.
3. In **2026-05 / 邀约**, the stat cards show `本月新增主题数 = 2` and `本月高频主标签 = 到店邀约推进`.
4. Clicking **接待** keeps the page shell visible, sets all stat numbers to `0` or `--`, and shows `接待主题待接入` empty-state copy.
5. Clicking **试驾** behaves the same way with `试驾主题待接入` copy.
6. Returning to **完整池 / 邀约** and filtering by `微信留资承接` shows only `先发资料再承接微信`, and the detail pane updates to that topic’s representative sample.
7. Switching back to `全部` tag restores the full invite topic list and automatically selects the first visible topic.

- [ ] **Step 5: Commit the style polish after browser verification**

```bash
git add voice-qc-admin.css
git commit -m "style: polish script library topic and sample cards"
```

## Final verification pass

- [ ] **Step 1: Run the focused Node test suite one last time**

```bash
node --test tests/script-library-utils.test.js
```

Expected: PASS with 5 passing tests.

- [ ] **Step 2: Check the final diff before handing off**

Run:

```bash
git diff -- script-library/script-library-utils.js tests/script-library-utils.test.js script-library/page.js script-library/index.html app-runtime.js voice-qc-admin.css
```

Expected: only the new script-library contract utility, tests, bootstrap loader, runtime rewrite, template changes, and style additions.

- [ ] **Step 3: Summarize the implementation status for the reviewer**

Use this handoff summary:

```text
Implemented the script-library monthly/global topic library in the current static front-end repo.
Covered: utility-backed mock contract, complete-pool/monthly filters, invite detail rendering, reception/test-drive empty states, and representative-sample detail cards.
Verified with: node --test tests/script-library-utils.test.js and manual browser checks at /script-library/index.html.
```