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
      job_id: 'job-script-library-2026-05',
      tenant_id: 'voice-qc',
      generated_at: '2026-05-20T10:00:00Z'
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
              action_pattern: '先通过需求挖掘建立到店理由，再顺势推进邀约。',
              training_goal: '提升顾问从需求探查过渡到到店邀约的自然度。',
              summary: '适用于客户尚未明确购车动机时的邀约推进。',
              recommended_script: '先确认您的使用场景，我再结合情况给您安排到店详细体验。',
              training_points: ['先问需求背景', '再给到店理由', '用明确动作收口'],
              apply_when: ['客户愿意继续沟通，但尚未形成明确到店计划。'],
              avoid_when: ['客户已经明确拒绝近期到店，或沟通仍停留在基础信息确认。'],
              source_sample_count: 6,
              representative_samples: [
                {
                  call_id: 'call-2026-05-001',
                  audio_id: 'audio-2026-05-001',
                  store_id: 'store-sh-001',
                  sales_id: 'sales-018',
                  source_month: '2026-05',
                  success_result: '到店成功',
                  tag_code: 'T09',
                  tag_name: '到店邀约推进',
                  confidence: '高',
                  level: 'A',
                  quote: '我先了解一下您平时主要是谁开，方便的话这周来店里我给您做个详细方案。',
                  replicable_point: '先基于需求建立到店理由，再发出明确邀约。',
                  start_time: '03:12',
                  end_time: '03:46',
                  qc_source_ref: 'qc://monthly/2026-05/invite/inv-2026-05-01/sample-1',
                  asr_excerpt_ref: 'asr://monthly/2026-05/call-2026-05-001#132-156'
                }
              ]
            },
            {
              topic_id: 'inv-2026-05-02',
              topic_name: '先发资料再承接微信',
              primary_tags: [SCRIPT_LIBRARY_TAGS.T07],
              action_pattern: '先提供客户感兴趣的资料，再自然转入微信承接。',
              training_goal: '提升资料发送与微信留资的衔接成功率。',
              summary: '适用于客户短时无法深聊但愿意继续接收信息的场景。',
              recommended_script: '我先把您关心的配置和活动发您微信，您看完后我再跟进。',
              training_points: ['给出具体资料内容', '说明微信承接价值', '降低客户操作成本'],
              apply_when: ['客户对车型有兴趣，但当前不方便深入通话。'],
              avoid_when: ['客户已经在微信端建立稳定联系，或明确不愿添加微信。'],
              source_sample_count: 4,
              representative_samples: []
            }
          ]
        },
        reception: {
          overview: {
            top_tags: []
          },
          topics: []
        },
        test_drive: {
          overview: {
            top_tags: []
          },
          topics: []
        }
      },
      {
        month: '2026-04',
        invite: {
          overview: {
            top_tags: [
              { tag_code: 'T04', tag_name: '价格异议处理', count: 3 },
              { tag_code: 'T09', tag_name: '到店邀约推进', count: 2 }
            ]
          },
          topics: [
            {
              topic_id: 'inv-2026-04-01',
              topic_name: '先处理价格顾虑再锁到店',
              primary_tags: [SCRIPT_LIBRARY_TAGS.T04, SCRIPT_LIBRARY_TAGS.T09],
              action_pattern: '先回应价格顾虑，再通过到店方案承接。',
              training_goal: '减少因价格异议导致的邀约流失。',
              summary: '适用于客户先表达预算压力的邀约对话。',
              recommended_script: '价格我先帮您拆开讲清楚，方便的话到店我把活动和金融方案一起给您对比。',
              training_points: ['先承认顾虑', '补充价格解释', '用到店方案收束'],
              apply_when: ['客户的主要阻力是价格或优惠不透明。'],
              avoid_when: ['客户当前只想了解基础配置，尚未进入价格讨论。'],
              source_sample_count: 3,
              representative_samples: []
            }
          ]
        },
        reception: {
          overview: {
            top_tags: []
          },
          topics: []
        },
        test_drive: {
          overview: {
            top_tags: []
          },
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
            primary_tags: [SCRIPT_LIBRARY_TAGS.T01, SCRIPT_LIBRARY_TAGS.T09],
            action_pattern: '需求挖掘后顺势推进到店。',
            training_goal: '沉淀需求挖掘到邀约推进的可复用打法。',
            summary: '高频适用于意向初步明确但未承诺到店的客户。',
            recommended_script: '我先了解下您的核心需求，再帮您安排到店重点体验。',
            training_points: ['问需求', '连到店理由', '明确下一步'],
            apply_when: ['客户愿意继续交流但还未明确到店安排。'],
            avoid_when: ['客户已明确拒绝到店或沟通尚未进入需求环节。'],
            first_seen_month: '2026-03',
            last_seen_month: '2026-05',
            source_months: ['2026-03', '2026-04', '2026-05'],
            recent_3m_count: 11,
            status: 'active',
            source_sample_count: 11,
            representative_samples: []
          },
          {
            topic_id: 'inv-p-002',
            topic_name: '先发资料再承接微信',
            primary_tags: [SCRIPT_LIBRARY_TAGS.T07],
            action_pattern: '资料触发兴趣后承接到微信。',
            training_goal: '沉淀短时沟通中的微信承接打法。',
            summary: '适用于客户愿意看资料但不方便长聊的情况。',
            recommended_script: '我把重点资料先发您微信，您看完我再接着跟进。',
            training_points: ['给资料理由', '强调微信承接便利', '约定后续节奏'],
            apply_when: ['客户对信息有兴趣但当前通话时间有限。'],
            avoid_when: ['客户对微信接收信息有明显抗拒。'],
            first_seen_month: '2026-05',
            last_seen_month: '2026-05',
            source_months: ['2026-05'],
            recent_3m_count: 4,
            status: 'observing',
            source_sample_count: 4,
            representative_samples: []
          },
          {
            topic_id: 'inv-p-003',
            topic_name: '先处理价格顾虑再锁到店',
            primary_tags: [SCRIPT_LIBRARY_TAGS.T04, SCRIPT_LIBRARY_TAGS.T09],
            action_pattern: '价格异议消除后承接到店。',
            training_goal: '沉淀价格顾虑场景下的邀约转化脚本。',
            summary: '适用于价格是主要阻碍时的邀约推进。',
            recommended_script: '我先把价格和活动说明白，您来店里我再给您做完整对比。',
            training_points: ['先回应顾虑', '补充价格依据', '推动到店'],
            apply_when: ['客户明确提出价格或优惠顾虑。'],
            avoid_when: ['客户对价格并未产生顾虑，过早进入价格解释会打断节奏。'],
            first_seen_month: '2026-04',
            last_seen_month: '2026-05',
            source_months: ['2026-04', '2026-05'],
            recent_3m_count: 5,
            status: 'active',
            source_sample_count: 5,
            representative_samples: []
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

  function getLatestMonth(payload) {
    const monthlyPackages = payload && Array.isArray(payload.monthly_packages) ? payload.monthly_packages : [];
    return monthlyPackages[0] && monthlyPackages[0].month ? monthlyPackages[0].month : '';
  }

  function getMonthlyPackage(payload, month) {
    const monthlyPackages = payload && Array.isArray(payload.monthly_packages) ? payload.monthly_packages : [];
    return monthlyPackages.find(function (monthlyPackage) {
      return monthlyPackage && monthlyPackage.month === month;
    }) || null;
  }

  function getSceneTopicsFromPayload(payload, mode, month, sceneKey) {
    if (mode === VIEW_KEYS.monthly) {
      const monthlyPackage = getMonthlyPackage(payload, month);
      return (monthlyPackage && monthlyPackage[sceneKey] && monthlyPackage[sceneKey].topics) || [];
    }

    if (mode === VIEW_KEYS.global) {
      return (payload && payload.global_pool && payload.global_pool[sceneKey] && payload.global_pool[sceneKey].topics) || [];
    }

    return [];
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
