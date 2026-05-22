(function (global, factory) {
  const api = factory();
  global.__scriptLibraryLLMAssets = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const MONTHLY_TOPIC_OUTPUT_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['month', 'scene', 'summary', 'topics'],
    properties: {
      month: { type: 'string' },
      scene: { type: 'string' },
      summary: { type: 'string' },
      topics: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'topic_id',
            'topic_name',
            'primary_tags',
            'action_pattern',
            'training_goal',
            'summary',
            'recommended_script',
            'training_points',
            'apply_when',
            'avoid_when',
            'representative_samples'
          ],
          properties: {
            topic_id: { type: 'string' },
            topic_name: { type: 'string' },
            primary_tags: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['tag_code', 'tag_name'],
                properties: {
                  tag_code: { type: 'string' },
                  tag_name: { type: 'string' }
                }
              }
            },
            action_pattern: { type: 'string' },
            training_goal: { type: 'string' },
            summary: { type: 'string' },
            recommended_script: { type: 'string' },
            training_points: {
              type: 'array',
              items: { type: 'string' }
            },
            apply_when: { type: 'string' },
            avoid_when: { type: 'string' },
            representative_samples: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'call_id',
                  'success_result',
                  'source_month',
                  'tag_code',
                  'tag_name',
                  'confidence',
                  'level',
                  'quote',
                  'replicable_point'
                ],
                properties: {
                  call_id: { type: 'string' },
                  success_result: { type: 'string' },
                  source_month: { type: 'string' },
                  tag_code: { type: 'string' },
                  tag_name: { type: 'string' },
                  confidence: { type: 'string' },
                  level: { type: 'string' },
                  quote: { type: 'string' },
                  replicable_point: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  };

  function buildMonthlyTopicGenerationInput(options) {
    const sourceCases = Array.isArray(options && options.successCases) ? options.successCases : [];

    return {
      month: options ? options.month : undefined,
      scene: options ? options.scene : undefined,
      success_cases: sourceCases.map(function (successCase) {
        const advantage = successCase && successCase.advantage ? successCase.advantage : {};
        return {
          call_id: successCase ? successCase.call_id : undefined,
          success_result: successCase ? successCase.success_result : undefined,
          source_month: successCase ? successCase.source_month : undefined,
          tag_code: advantage.tag_code,
          tag_name: advantage.tag_name,
          confidence: advantage.confidence,
          level: advantage.level,
          quote: advantage.quote,
          replicable_point: advantage.replicable_point
        };
      })
    };
  }

  function buildMonthlyTopicGenerationPrompt(input) {
    return [
      '你是优秀脚本库的月度邀约主题归纳助手。',
      '当前提示词契约仅服务于单通邀约质检之后的月度邀约归纳，不用于其他场景改写。',
      '你的输入已经来自单通邀约质检产出的优势样本，用于月度主题归纳。',
      '你的任务是按主题归纳当月成功的邀约样本，提炼可复用的训练主题。',
      '不要重新判断单条优劣势，不要推翻上游已有标签。',
      '保留 scene 字段作为输出载荷的一部分，但当前 scene 的使用范围仍是邀约月度归纳。',
      '只基于已给出的优势证据对 success_cases 进行主题聚类。',
      '最终 JSON 顶层字段必须包含 month、scene、summary、topics，且不要输出任何其他顶层字段。',
      '其中 month 表示归纳月份，scene 保留当前场景标识，summary 表示当月邀约主题总览，topics 表示主题数组。',
      'topic 级别输出必须包含 topic_id、topic_name、primary_tags、action_pattern、training_goal、summary、recommended_script、training_points、apply_when、avoid_when、representative_samples。',
      'representative_samples 必须保留 call_id、success_result、source_month、tag_code、tag_name、confidence、level、quote、replicable_point。',
      'summary、recommended_script、training_points、apply_when、avoid_when 都是月度归纳层输出，不是额外的单通要求。',
      '请重点输出代表性样本 representative_samples，而不是逐条复述全部样本。',
      '输出必须符合以下 MONTHLY_TOPIC_OUTPUT_SCHEMA：',
      JSON.stringify(MONTHLY_TOPIC_OUTPUT_SCHEMA),
      '输入如下：',
      JSON.stringify(input)
    ].join('\n');
  }

  return {
    MONTHLY_TOPIC_OUTPUT_SCHEMA,
    buildMonthlyTopicGenerationInput,
    buildMonthlyTopicGenerationPrompt
  };
});
