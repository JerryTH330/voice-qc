const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildMonthlyTopicGenerationInput,
  buildMonthlyTopicGenerationPrompt,
  MONTHLY_TOPIC_OUTPUT_SCHEMA
} = require('../script-library/script-library-llm-assets.js');

test('buildMonthlyTopicGenerationInput keeps only monthly summarization fields and includes source_month', () => {
  const input = buildMonthlyTopicGenerationInput({
    month: '2026-05',
    scene: 'invite',
    successCases: [
      {
        call_id: 'call-1',
        success_result: '到店成功',
        source_month: '2026-05',
        advantage: {
          tag_code: 'T09',
          tag_name: '到店邀约推进',
          confidence: '高',
          level: 'A',
          quote: '您方便的话周末到店，我把现车和试驾都给您安排好。',
          replicable_point: '把时间、收益、后续安排一次讲完整。',
          extra_field: 'should-not-appear'
        },
        nested: { ignored: true },
        unrelated_field: 'ignore-me'
      }
    ]
  });

  assert.equal(input.month, '2026-05');
  assert.equal(input.scene, 'invite');
  assert.equal(input.success_cases.length, 1);
  assert.deepEqual(input.success_cases[0], {
    call_id: 'call-1',
    success_result: '到店成功',
    source_month: '2026-05',
    tag_code: 'T09',
    tag_name: '到店邀约推进',
    confidence: '高',
    level: 'A',
    quote: '您方便的话周末到店，我把现车和试驾都给您安排好。',
    replicable_point: '把时间、收益、后续安排一次讲完整。'
  });
});

test('prompt text explicitly locks monthly-layer outputs and representative samples', () => {
  const prompt = buildMonthlyTopicGenerationPrompt({
    month: '2026-05',
    scene: 'invite',
    success_cases: []
  });

  assert.match(prompt, /按主题归纳/);
  assert.match(prompt, /不要重新判断单条优劣势/);
  assert.match(prompt, /只基于已给出的优势证据/);
  assert.match(prompt, /顶层字段.*month.*scene.*summary.*topics/);
  assert.match(prompt, /apply_when/);
  assert.match(prompt, /avoid_when/);
  assert.match(prompt, /representative_samples/);
});

test('output schema requires locked monthly topic fields and representative sample shape', () => {
  assert.equal(MONTHLY_TOPIC_OUTPUT_SCHEMA.type, 'object');
  assert.equal(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.type, 'array');
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('topic_name'));
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('recommended_script'));
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('training_points'));
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('apply_when'));
  assert.ok(MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.required.includes('avoid_when'));
  assert.equal(
    MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.properties.primary_tags.items.properties.tag_code.type,
    'string'
  );
  assert.equal(
    MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.properties.primary_tags.items.properties.tag_name.type,
    'string'
  );
  assert.equal(
    MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.properties.training_points.items.type,
    'string'
  );
  assert.ok(
    MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.properties.representative_samples.items.required.includes('source_month')
  );
  assert.ok(
    MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items.properties.representative_samples.items.required.includes('quote')
  );
});

test('CommonJS require exposes the expected monthly topic API shape', () => {
  const requiredModule = require('../script-library/script-library-llm-assets.js');

  assert.deepEqual(Object.keys(requiredModule), [
    'MONTHLY_TOPIC_OUTPUT_SCHEMA',
    'buildMonthlyTopicGenerationInput',
    'buildMonthlyTopicGenerationPrompt'
  ]);
});
