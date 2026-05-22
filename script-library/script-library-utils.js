(function (global, factory) {
  const api = factory(global.__scriptLibraryContract || {});
  global.__scriptLibraryUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (contract) {
  const VIEW_KEYS = contract.VIEW_KEYS || {
    global: 'global',
    monthly: 'monthly'
  };
  const SCENE_KEYS = contract.SCENE_KEYS || {
    invite: 'invite',
    reception: 'reception',
    testDrive: 'test_drive'
  };
  const ALL_FILTER = contract.ALL_FILTER || 'all';
  const scriptLibraryExamplePayload = contract.scriptLibraryExamplePayload || { monthly_packages: [], global_pool: {} };
  const getLatestMonth = typeof contract.getLatestMonth === 'function'
    ? contract.getLatestMonth
    : function getLatestMonthFallback(payload) {
        const monthlyPackages = Array.isArray(payload && payload.monthly_packages) ? payload.monthly_packages : [];
        return monthlyPackages[0] && monthlyPackages[0].month ? monthlyPackages[0].month : '';
      };
  const getMonthlyPackage = typeof contract.getMonthlyPackage === 'function'
    ? contract.getMonthlyPackage
    : function getMonthlyPackageFallback(payload, month) {
        const monthlyPackages = Array.isArray(payload && payload.monthly_packages) ? payload.monthly_packages : [];
        return monthlyPackages.find(function (monthlyPackage) {
          return monthlyPackage && monthlyPackage.month === month;
        }) || null;
      };
  const getSceneTopicsFromPayload = typeof contract.getSceneTopicsFromPayload === 'function'
    ? contract.getSceneTopicsFromPayload
    : function getSceneTopicsFromPayloadFallback(payload, mode, month, sceneKey) {
        if (mode === VIEW_KEYS.monthly) {
          const monthlyPackage = getMonthlyPackage(payload, month);
          return (monthlyPackage && monthlyPackage[sceneKey] && monthlyPackage[sceneKey].topics) || [];
        }
        return (payload && payload.global_pool && payload.global_pool[sceneKey] && payload.global_pool[sceneKey].topics) || [];
      };

  const SCENE_META = {};
  SCENE_META[SCENE_KEYS.invite] = {
    label: '邀约',
    emptyTitle: '当前筛选下暂无匹配主题',
    emptyDescription: '可以切换标签、训练目标或主题范围后重试。'
  };
  SCENE_META[SCENE_KEYS.reception] = {
    label: '接待',
    emptyTitle: '接待主题待接入',
    emptyDescription: '后续接入接待单条打标后，将在这里展示接待主题。'
  };
  SCENE_META[SCENE_KEYS.testDrive] = {
    label: '试驾',
    emptyTitle: '试驾主题待接入',
    emptyDescription: '后续接入试驾单条打标后，将在这里展示试驾主题。'
  };

  function getStatusLabel(status) {
    if (status === 'active') return '长期生效';
    if (status === 'observing') return '观察中';
    return '全部状态';
  }

  function getMonthOptions(payload) {
    const monthlyPackages = Array.isArray(payload && payload.monthly_packages) ? payload.monthly_packages : [];
    return monthlyPackages
      .map(function (monthlyPackage) {
        return monthlyPackage && monthlyPackage.month ? monthlyPackage.month : '';
      })
      .filter(Boolean);
  }

  function getDefaultScriptLibraryState(payload) {
    return {
      view: VIEW_KEYS.global,
      scene: SCENE_KEYS.invite,
      tag: ALL_FILTER,
      goal: ALL_FILTER,
      status: ALL_FILTER,
      month: getLatestMonth(payload || scriptLibraryExamplePayload),
      selectedTopicId: null
    };
  }

  function normalizeState(payload, rawState) {
    const sourcePayload = payload || scriptLibraryExamplePayload;
    const defaultState = getDefaultScriptLibraryState(sourcePayload);
    const monthOptions = getMonthOptions(sourcePayload);
    const nextState = Object.assign({}, defaultState, rawState || {});

    if (!Object.keys(SCENE_META).includes(nextState.scene)) {
      nextState.scene = defaultState.scene;
    }
    if (!Object.values(VIEW_KEYS).includes(nextState.view)) {
      nextState.view = defaultState.view;
    }
    if (!monthOptions.includes(nextState.month)) {
      nextState.month = defaultState.month;
    }
    if (!nextState.tag) nextState.tag = ALL_FILTER;
    if (!nextState.goal) nextState.goal = ALL_FILTER;
    if (!nextState.status) nextState.status = ALL_FILTER;
    if (nextState.selectedTopicId === undefined) nextState.selectedTopicId = null;

    return nextState;
  }

  function getTagCode(tag) {
    if (!tag) return '';
    if (typeof tag === 'string') return tag;
    return tag.tag_code || '';
  }

  function getTagName(tag) {
    if (!tag) return '';
    if (typeof tag === 'string') return tag;
    return tag.tag_name || tag.tag_code || '';
  }

  function filterTopics(topics, state) {
    return (topics || []).filter(function (topic) {
      if (state.tag !== ALL_FILTER) {
        const matchesTag = (topic.primary_tags || []).some(function (tag) {
          return getTagCode(tag) === state.tag;
        });
        if (!matchesTag) return false;
      }

      if (state.goal !== ALL_FILTER && topic.training_goal !== state.goal) {
        return false;
      }

      if (state.view === VIEW_KEYS.global && state.status !== ALL_FILTER && topic.status !== state.status) {
        return false;
      }

      return true;
    });
  }

  function buildFilterOptions(items, buildEntries, allLabel) {
    const seen = new Set();
    const options = [{ value: ALL_FILTER, label: allLabel }];

    (items || []).forEach(function (item) {
      buildEntries(item).forEach(function (entry) {
        if (!entry || !entry.value || seen.has(entry.value)) {
          return;
        }
        seen.add(entry.value);
        options.push(entry);
      });
    });

    return options;
  }

  function buildStats(payload, state, allTopics, visibleTopics) {
    if (state.view === VIEW_KEYS.monthly) {
      const monthlyPackage = getMonthlyPackage(payload, state.month);
      const monthlyScene = monthlyPackage && monthlyPackage[state.scene];
      const topTag = monthlyScene && monthlyScene.overview && Array.isArray(monthlyScene.overview.top_tags)
        ? monthlyScene.overview.top_tags[0]
        : null;

      return [
        {
          label: '本月新增主题数',
          value: String(allTopics.length),
          desc: '基于当月新增优质样本沉淀。'
        },
        {
          label: '当前匹配主题数',
          value: String(visibleTopics.length),
          desc: '按当前筛选条件返回的月度主题。'
        },
        {
          label: '高频主题标签',
          value: topTag ? topTag.tag_name : '暂无',
          desc: '来自本月高频标签概览。'
        }
      ];
    }

    const activeCount = allTopics.filter(function (topic) {
      return topic.status === 'active';
    }).length;
    const sampleTotal = allTopics.reduce(function (sum, topic) {
      return sum + (Number(topic.source_sample_count) || 0);
    }, 0);

    return [
      {
        label: '长期主题数',
        value: String(allTopics.length),
        desc: '长期沉淀并可持续复用的主题。'
      },
      {
        label: '长期生效主题数',
        value: String(activeCount),
        desc: '当前状态为长期生效的主题。'
      },
      {
        label: '累计样本数',
        value: String(sampleTotal),
        desc: '全局主题关联的样本总量。'
      }
    ];
  }

  function buildSceneMeta(state, allTopics, visibleTopics) {
    const baseMeta = SCENE_META[state.scene] || SCENE_META[SCENE_KEYS.invite];
    const hasSceneData = allTopics.length > 0;

    if (state.scene === SCENE_KEYS.invite && hasSceneData && !visibleTopics.length) {
      return {
        sceneKey: state.scene,
        sceneLabel: baseMeta.label,
        hasSceneData: true,
        emptyTitle: '当前筛选下暂无匹配主题',
        emptyDescription: '可以切换标签、训练目标或主题范围后重试。'
      };
    }

    return {
      sceneKey: state.scene,
      sceneLabel: baseMeta.label,
      hasSceneData: hasSceneData,
      emptyTitle: baseMeta.emptyTitle,
      emptyDescription: baseMeta.emptyDescription
    };
  }

  function toDisplayList(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (!value) {
      return [];
    }
    return [value];
  }

  function buildDisplaySample(sample) {
    const nextSample = sample || {};
    return Object.assign({}, nextSample, {
      display_tag_name: getTagName(nextSample.tag_name || nextSample.tag_code || ''),
      display_success_result: nextSample.success_result || '暂无结果',
      display_quote: nextSample.quote || '暂无摘录'
    });
  }

  function buildDisplayTopic(topic, state) {
    const nextTopic = topic || {};
    const representativeSamples = Array.isArray(nextTopic.representative_samples)
      ? nextTopic.representative_samples.map(buildDisplaySample)
      : [];
    const displayStatusLabel = nextTopic.status
      ? getStatusLabel(nextTopic.status)
      : (state.view === VIEW_KEYS.monthly ? '月度新增' : '主题样本');
    const displaySampleCount = Number(nextTopic.source_sample_count) || representativeSamples.length;

    return Object.assign({}, nextTopic, {
      display_title: nextTopic.topic_name || '未命名主题',
      display_summary: nextTopic.summary || nextTopic.action_pattern || '暂无主题说明',
      display_status_label: displayStatusLabel,
      display_status_class: nextTopic.status === 'active' ? 'green' : 'blue',
      display_tag_names: (nextTopic.primary_tags || []).map(getTagName).filter(Boolean),
      display_sample_count: displaySampleCount,
      display_time_text: state.view === VIEW_KEYS.monthly ? state.month : ('最近出现 ' + (nextTopic.last_seen_month || '-')),
      display_training_goal: nextTopic.training_goal || '暂无训练目标',
      display_training_points: toDisplayList(nextTopic.training_points),
      display_apply_when: toDisplayList(nextTopic.apply_when),
      display_avoid_when: toDisplayList(nextTopic.avoid_when),
      display_representative_samples: representativeSamples
    });
  }

  function buildScriptLibraryViewModel(payload, rawState) {
    const sourcePayload = payload || scriptLibraryExamplePayload;
    const state = normalizeState(sourcePayload, rawState);
    const allTopics = getSceneTopicsFromPayload(sourcePayload, state.view, state.month, state.scene);
    const visibleTopics = filterTopics(allTopics, state).map(function (topic) {
      return buildDisplayTopic(topic, state);
    });
    const selectedTopic = visibleTopics.find(function (topic) {
      return topic.topic_id === state.selectedTopicId;
    }) || visibleTopics[0] || null;
    const nextState = Object.assign({}, state, {
      selectedTopicId: selectedTopic ? selectedTopic.topic_id : null
    });

    return {
      state: nextState,
      filters: {
        viewOptions: [
          { value: VIEW_KEYS.global, label: '长期主题库' },
          { value: VIEW_KEYS.monthly, label: '月度主题库' }
        ],
        sceneOptions: [
          { value: SCENE_KEYS.invite, label: '邀约' },
          { value: SCENE_KEYS.reception, label: '接待' },
          { value: SCENE_KEYS.testDrive, label: '试驾' }
        ],
        tagOptions: buildFilterOptions(allTopics, function (topic) {
          return (topic.primary_tags || []).map(function (tag) {
            return {
              value: getTagCode(tag),
              label: getTagName(tag)
            };
          });
        }, '全部标签'),
        goalOptions: buildFilterOptions(allTopics, function (topic) {
          return topic.training_goal ? [{ value: topic.training_goal, label: topic.training_goal }] : [];
        }, '全部目标'),
        statusOptions: [
          { value: ALL_FILTER, label: '全部状态' },
          { value: 'active', label: getStatusLabel('active') },
          { value: 'observing', label: getStatusLabel('observing') }
        ],
        monthOptions: getMonthOptions(sourcePayload).map(function (month) {
          return { value: month, label: month };
        })
      },
      flags: {
        showStatusFilter: nextState.view === VIEW_KEYS.global,
        showMonthFilter: nextState.view === VIEW_KEYS.monthly
      },
      sceneMeta: buildSceneMeta(nextState, allTopics, visibleTopics),
      stats: buildStats(sourcePayload, nextState, allTopics, visibleTopics),
      topics: visibleTopics,
      selectedTopic: selectedTopic,
      listTitle: nextState.view === VIEW_KEYS.monthly ? '月度主题库' : '长期主题库',
      listDescription: nextState.view === VIEW_KEYS.monthly
        ? '聚焦当月新增主题，便于月度训练和复盘。'
        : '沉淀跨月份可复用的长期主题，便于持续培训复用。',
      detailSubtitle: selectedTopic ? selectedTopic.display_training_goal : '暂无主题详情',
      modeHint: nextState.view === VIEW_KEYS.monthly ? '当月新增主题' : '长期沉淀主题',
      matchCountLabel: '匹配 ' + visibleTopics.length + ' 个主题'
    };
  }

  return {
    getDefaultScriptLibraryState: getDefaultScriptLibraryState,
    buildScriptLibraryViewModel: buildScriptLibraryViewModel,
    getStatusLabel: getStatusLabel
  };
});