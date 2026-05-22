# Script Library Monthly LLM Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the script-library delivery package with the immutable single-call invite QC output by adding a backend-neutral monthly summarization prompt, a Python processing skeleton, and richer mock contract data that reflect the real monthly generation flow.

**Architecture:** Keep single-call invite QC immutable and treat it as the evidence source. Build one asset layer for monthly summarization prompt/schema, one Python skeleton layer that converts single-call QC output into monthly/global payloads, and one expanded contract fixture layer that mirrors the same field flow for the frontend. Reuse the existing front-end contract/runtime boundary instead of redesigning the page in this phase.

**Tech Stack:** Plain JavaScript modules (UMD/CommonJS-compatible), Python 3, Markdown, Node `--test`, Python `-m py_compile`.

---

## File Structure

- Modify: `script-library/script-library-llm-assets.js`
  - Refine the monthly summarization schema/prompt so it explicitly consumes normalized single-call invite QC output and emits the frontend-required monthly topic fields.
- Create: `tests/script-library-llm-assets.test.js`
  - Expand tests to lock the monthly prompt wording, normalized input shape, and output schema fields needed by the monthly/global payload flow.
- Create: `script-library/script-library-monthly-pipeline.py`
  - Python processing skeleton for loading QC output, filtering successful invites, expanding advantages, building monthly LLM input, validating monthly output, and merging the global pool.
- Create: `tests/script_library_monthly_pipeline_test.py`
  - Python unit tests for the normalization pipeline and global-pool merge rules.
- Modify: `script-library/script-library-contract.js`
  - Expand invite-only monthly/global example data so it looks like a plausible output of the monthly summarization pipeline.
- Modify: `tests/script-library-contract.test.js`
  - Add coverage for the expanded monthly/global invite fixture shape and sample richness.
- Modify: `docs/script-library-backend-handoff.md`
  - Point backend engineers at the new Python skeleton and clarify that monthly prompt/schema fields are derived from immutable single-call QC output.
- Modify: `docs/script-library-frontend-handoff.md`
  - Clarify that the contract fixture now mirrors the monthly summarization pipeline and identify which topic-level fields are monthly-layer outputs rather than single-call outputs.

## Task 1: Tighten the monthly LLM prompt/schema around immutable single-call QC output

**Files:**
- Modify: `script-library/script-library-llm-assets.js`
- Modify: `tests/script-library-llm-assets.test.js`

- [ ] **Step 1: Write the failing Node test for the refined monthly prompt contract**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildMonthlyTopicGenerationInput,
  buildMonthlyTopicGenerationPrompt,
  MONTHLY_TOPIC_OUTPUT_SCHEMA
} = require('../script-library/script-library-llm-assets.js');

test('monthly topic input normalizes immutable invite QC advantages only', () => {
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
          replicable_point: '把时间、收益、后续安排一次讲完整。'
        }
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

test('monthly prompt explicitly says not to rejudge single-call strengths and to output frontend topic fields', () => {
  const prompt = buildMonthlyTopicGenerationPrompt({
    month: '2026-05',
    scene: 'invite',
    success_cases: []
  });

  assert.match(prompt, /不要重新判断单条优劣势/);
  assert.match(prompt, /只基于已给出的优势证据/);
  assert.match(prompt, /apply_when/);
  assert.match(prompt, /avoid_when/);
  assert.match(prompt, /representative_samples/);
});

test('output schema includes topic-level fields that single-call QC does not provide directly', () => {
  const topicSchema = MONTHLY_TOPIC_OUTPUT_SCHEMA.properties.topics.items;
  assert.ok(topicSchema.required.includes('topic_name'));
  assert.ok(topicSchema.required.includes('recommended_script'));
  assert.ok(topicSchema.required.includes('training_points'));
  assert.ok(topicSchema.required.includes('apply_when'));
  assert.ok(topicSchema.required.includes('avoid_when'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/script-library-llm-assets.test.js
```

Expected: FAIL because the current prompt/schema/input builder do not yet expose `source_month`, `apply_when`, or `avoid_when` in the locked shape.

- [ ] **Step 3: Update `script-library/script-library-llm-assets.js` to reflect the monthly-only responsibilities**

```js
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
            apply_when: {
              type: 'array',
              items: { type: 'string' }
            },
            avoid_when: {
              type: 'array',
              items: { type: 'string' }
            },
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
    const sourceCases = Array.isArray(options?.successCases) ? options.successCases : [];

    return {
      month: options?.month,
      scene: options?.scene,
      success_cases: sourceCases.map((successCase) => ({
        call_id: successCase?.call_id,
        success_result: successCase?.success_result,
        source_month: successCase?.source_month,
        tag_code: successCase?.advantage?.tag_code,
        tag_name: successCase?.advantage?.tag_name,
        confidence: successCase?.advantage?.confidence,
        level: successCase?.advantage?.level,
        quote: successCase?.advantage?.quote,
        replicable_point: successCase?.advantage?.replicable_point
      }))
    };
  }

  function buildMonthlyTopicGenerationPrompt(input) {
    return [
      '你是优秀话术库的月度主题归纳助手。',
      '你的输入已经来自单条邀约打标结果中的优势证据。',
      '不要重新判断单条优劣势，不要推翻上游标签，只基于已给出的优势证据做主题归纳。',
      '请把成功样本按主题归纳，并为每个主题输出 topic_id、topic_name、primary_tags、action_pattern、training_goal、summary、recommended_script、training_points、apply_when、avoid_when、representative_samples。',
      'representative_samples 只保留少量最能代表主题的样本，并保留 call_id、success_result、source_month、tag_code、tag_name、confidence、level、quote、replicable_point。',
      '主题级字段（summary、recommended_script、training_points、apply_when、avoid_when）是月度归纳层补出的结果，不要要求单条层额外提供。',
      '输出必须满足下面的 MONTHLY_TOPIC_OUTPUT_SCHEMA：',
      JSON.stringify(MONTHLY_TOPIC_OUTPUT_SCHEMA, null, 2),
      '输入如下：',
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

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node --test tests/script-library-llm-assets.test.js
```

Expected: PASS with the refined prompt/schema tests green.

- [ ] **Step 5: Commit the monthly LLM asset refinement**

```bash
git add script-library/script-library-llm-assets.js tests/script-library-llm-assets.test.js
git commit -m "feat: align monthly script library llm assets"
```

## Task 2: Add a Python processing skeleton for the monthly summarization pipeline

**Files:**
- Create: `script-library/script-library-monthly-pipeline.py`
- Create: `tests/script_library_monthly_pipeline_test.py`

- [ ] **Step 1: Write the failing Python test for the normalization pipeline**

```python
import unittest

from script_library_monthly_pipeline import (
    expand_advantages,
    build_monthly_llm_input,
    merge_global_pool,
)


class ScriptLibraryMonthlyPipelineTest(unittest.TestCase):
    def test_expand_advantages_flattens_success_cases(self):
        cases = [
            {
                "call_id": "call-1",
                "source_month": "2026-05",
                "success_result": "到店成功",
                "优势发掘": [
                    {
                        "标签编码": "T09",
                        "亮点类型": "到店邀约推进",
                        "判定置信度": "高",
                        "亮点级别": "A",
                        "关联原文": "周末到店我把现车和试驾都给您安排好。",
                        "可复制点": "把时间和到店收益讲完整。"
                    }
                ]
            }
        ]

        flattened = expand_advantages(cases)

        self.assertEqual(len(flattened), 1)
        self.assertEqual(flattened[0]["call_id"], "call-1")
        self.assertEqual(flattened[0]["tag_code"], "T09")
        self.assertEqual(flattened[0]["replicable_point"], "把时间和到店收益讲完整。")

    def test_build_monthly_llm_input_keeps_only_monthly_prompt_fields(self):
        normalized = [
            {
                "call_id": "call-1",
                "source_month": "2026-05",
                "success_result": "到店成功",
                "tag_code": "T09",
                "tag_name": "到店邀约推进",
                "confidence": "高",
                "level": "A",
                "quote": "周末到店我把现车和试驾都给您安排好。",
                "replicable_point": "把时间和到店收益讲完整。"
            }
        ]

        payload = build_monthly_llm_input("2026-05", "invite", normalized)

        self.assertEqual(payload["month"], "2026-05")
        self.assertEqual(payload["scene"], "invite")
        self.assertEqual(payload["success_cases"][0]["source_month"], "2026-05")
        self.assertNotIn("raw_asr", payload["success_cases"][0])

    def test_merge_global_pool_updates_existing_topic_by_identity(self):
        current_pool = {
            "invite": {
                "topics": [
                    {
                        "topic_id": "inv-p-001",
                        "topic_name": "先挖需求再推进到店",
                        "source_months": ["2026-04"],
                        "first_seen_month": "2026-04",
                        "last_seen_month": "2026-04",
                        "recent_3m_count": 1,
                        "status": "active",
                        "representative_samples": []
                    }
                ]
            }
        }
        monthly_package = {
            "month": "2026-05",
            "invite": {
                "topics": [
                    {
                        "topic_id": "inv-p-001",
                        "topic_name": "先挖需求再推进到店",
                        "representative_samples": []
                    }
                ]
            }
        }

        merged = merge_global_pool(current_pool, monthly_package)

        self.assertEqual(merged["invite"]["topics"][0]["last_seen_month"], "2026-05")
        self.assertEqual(merged["invite"]["topics"][0]["source_months"], ["2026-04", "2026-05"])
        self.assertEqual(merged["invite"]["topics"][0]["recent_3m_count"], 2)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
python -m unittest tests/script_library_monthly_pipeline_test.py
```

Expected: FAIL with `ModuleNotFoundError: No module named 'script_library_monthly_pipeline'`.

- [ ] **Step 3: Create the Python skeleton**

```python
from copy import deepcopy
from typing import Any, Dict, List


def load_single_call_results(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return list(rows or [])


def filter_success_invites(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    success_results = {"到店成功", "接待成功", "试驾成功"}
    return [row for row in rows if row.get("success_result") in success_results]


def expand_advantages(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    flattened: List[Dict[str, Any]] = []
    for row in rows or []:
        for advantage in row.get("优势发掘", []):
            flattened.append(
                {
                    "call_id": row.get("call_id"),
                    "source_month": row.get("source_month"),
                    "success_result": row.get("success_result"),
                    "tag_code": advantage.get("标签编码"),
                    "tag_name": advantage.get("亮点类型"),
                    "confidence": advantage.get("判定置信度"),
                    "level": advantage.get("亮点级别"),
                    "quote": advantage.get("关联原文"),
                    "replicable_point": advantage.get("可复制点"),
                }
            )
    return flattened


def build_monthly_llm_input(month: str, scene: str, normalized_advantages: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "month": month,
        "scene": scene,
        "success_cases": [
            {
                "call_id": row.get("call_id"),
                "source_month": row.get("source_month"),
                "success_result": row.get("success_result"),
                "tag_code": row.get("tag_code"),
                "tag_name": row.get("tag_name"),
                "confidence": row.get("confidence"),
                "level": row.get("level"),
                "quote": row.get("quote"),
                "replicable_point": row.get("replicable_point"),
            }
            for row in normalized_advantages or []
        ],
    }


def build_monthly_prompt(prompt_builder, llm_input: Dict[str, Any]) -> str:
    return prompt_builder(llm_input)


def validate_monthly_output(schema_validator, llm_output: Dict[str, Any]) -> Dict[str, Any]:
    schema_validator(llm_output)
    return llm_output


def build_monthly_package(month: str, scene: str, monthly_output: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "month": month,
        scene: {
            "overview": {
                "top_tags": []
            },
            "topics": monthly_output.get("topics", []),
        },
        "reception": {"overview": {"top_tags": []}, "topics": []},
        "test_drive": {"overview": {"top_tags": []}, "topics": []},
    }


def merge_global_pool(current_pool: Dict[str, Any], monthly_package: Dict[str, Any]) -> Dict[str, Any]:
    merged = deepcopy(current_pool or {})
    month = monthly_package.get("month", "")
    merged.setdefault("invite", {"topics": []})
    invite_topics = merged["invite"].setdefault("topics", [])
    topic_by_id = {topic.get("topic_id"): topic for topic in invite_topics}

    for topic in monthly_package.get("invite", {}).get("topics", []):
        topic_id = topic.get("topic_id")
        if topic_id in topic_by_id:
          existing = topic_by_id[topic_id]
          existing["last_seen_month"] = month
          existing.setdefault("source_months", [])
          if month and month not in existing["source_months"]:
              existing["source_months"].append(month)
          existing["recent_3m_count"] = len(existing["source_months"])
          existing["representative_samples"] = topic.get("representative_samples", existing.get("representative_samples", []))
        else:
          invite_topics.append(
              {
                  **topic,
                  "first_seen_month": month,
                  "last_seen_month": month,
                  "source_months": [month] if month else [],
                  "recent_3m_count": 1 if month else 0,
                  "status": topic.get("status", "observing"),
              }
          )

    return merged
```

- [ ] **Step 4: Run the Python unit test to verify it passes**

Run:

```bash
python -m unittest tests/script_library_monthly_pipeline_test.py
```

Expected: PASS with 3 passing tests.

- [ ] **Step 5: Verify the Python file compiles**

Run:

```bash
python -m py_compile script-library/script-library-monthly-pipeline.py
```

Expected: no output and exit code 0.

- [ ] **Step 6: Commit the Python skeleton**

```bash
git add script-library/script-library-monthly-pipeline.py tests/script_library_monthly_pipeline_test.py
git commit -m "feat: add script library monthly pipeline skeleton"
```

## Task 3: Expand the invite-only contract fixture so it mirrors the monthly generation flow

**Files:**
- Modify: `script-library/script-library-contract.js`
- Modify: `tests/script-library-contract.test.js`

- [ ] **Step 1: Write the failing contract-fixture expansion test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  scriptLibraryExamplePayload,
  getMonthlyPackage,
  getSceneTopicsFromPayload,
  SCENE_KEYS
} = require('../script-library/script-library-contract.js');

test('2026-05 monthly invite package contains five invite topics', () => {
  const monthlyInviteTopics = getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-05', SCENE_KEYS.invite);
  assert.equal(monthlyInviteTopics.length, 5);
});

test('2026-04 monthly invite package contains four invite topics', () => {
  const monthlyInviteTopics = getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'monthly', '2026-04', SCENE_KEYS.invite);
  assert.equal(monthlyInviteTopics.length, 4);
});

test('global invite pool contains seven long-term topics', () => {
  const globalInviteTopics = getSceneTopicsFromPayload(scriptLibraryExamplePayload, 'global', '', SCENE_KEYS.invite);
  assert.equal(globalInviteTopics.length, 7);
});

test('expanded monthly topics carry multiple representative samples that look like QC-derived evidence', () => {
  const monthlyPackage = getMonthlyPackage(scriptLibraryExamplePayload, '2026-05');
  const firstTopic = monthlyPackage.invite.topics[0];
  assert.ok(firstTopic.representative_samples.length >= 2);
  assert.equal(firstTopic.representative_samples[0].tag_code.startsWith('T'), true);
  assert.ok(firstTopic.representative_samples[0].quote);
  assert.ok(firstTopic.representative_samples[0].replicable_point);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/script-library-contract.test.js
```

Expected: FAIL because the current example payload is still too small.

- [ ] **Step 3: Expand the invite monthly/global fixture in `script-library/script-library-contract.js`**

Update the example payload so it matches the approved invite-only richness:

- `2026-05` monthly invite topics = 5:
  1. `先挖需求再推进到店`
  2. `先发资料再承接微信`
  3. `竞品比较后拉回本品`
  4. `续航疑虑先处理再邀约试驾`
  5. `客户忙碌时留人稳线索`
- `2026-04` monthly invite topics = 4:
  1. `先处理价格顾虑再锁到店`
  2. `版本配置先收敛再推进到店`
  3. `门店优势塑造后推进到店`
  4. `需求挖掘后版本引导`
- `global_pool.invite.topics` = 7:
  1. `先挖需求再推进到店`
  2. `先发资料再承接微信`
  3. `先处理价格顾虑再锁到店`
  4. `竞品比较后拉回本品`
  5. `续航疑虑先处理再邀约试驾`
  6. `客户忙碌时留人稳线索`
  7. `版本配置先收敛再推进到店`

Each monthly topic should have 2-4 representative samples when it is a “full” example topic. Each sample should remain QC-derived in shape:
- `call_id`
- `audio_id`
- `store_id`
- `sales_id`
- `source_month`
- `success_result`
- `tag_code`
- `tag_name`
- `confidence`
- `level`
- `quote`
- `replicable_point`
- `start_time`
- `end_time`
- `qc_source_ref`
- `asr_excerpt_ref`

Keep reception/test-drive structures empty and unchanged.

- [ ] **Step 4: Run the contract fixture test to verify it passes**

Run:

```bash
node --test tests/script-library-contract.test.js
```

Expected: PASS with the expanded contract tests green.

- [ ] **Step 5: Commit the contract fixture expansion**

```bash
git add script-library/script-library-contract.js tests/script-library-contract.test.js
git commit -m "feat: expand script library invite contract fixtures"
```

## Task 4: Update the backend/frontend handoff docs to point at the aligned monthly pipeline

**Files:**
- Modify: `docs/script-library-backend-handoff.md`
- Modify: `docs/script-library-frontend-handoff.md`

- [ ] **Step 1: Write the failing documentation sanity test as a grep check**

Run:

```bash
grep -n "script-library-monthly-pipeline.py\|single-call QC\|monthly_packages\|global_pool\|display_" docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
```

Expected: FAIL or incomplete output before the docs are updated.

- [ ] **Step 2: Update `docs/script-library-backend-handoff.md`**

Make sure it explicitly says:
- single-call invite QC prompt is immutable
- monthly summarization is the only prompt layer being adjusted
- backend should follow:
  - `script-library/script-library-llm-assets.js`
  - `script-library/script-library-monthly-pipeline.py`
  - `script-library/script-library-contract.js`
- the Python skeleton is a handoff-ready reference, not a production integration

Use this block in the “Source files to follow” / implementation notes section:

```md
- `script-library/script-library-contract.js` defines the frontend-consumed payload shape.
- `script-library/script-library-llm-assets.js` defines the monthly prompt builder and schema.
- `script-library/script-library-monthly-pipeline.py` shows the intended field flow from immutable single-call QC output into monthly/global payloads.
- The single-call invite QC prompt is intentionally unchanged in this phase; only the monthly summarization layer is adjusted.
```

- [ ] **Step 3: Update `docs/script-library-frontend-handoff.md`**

Make sure it explicitly says:
- the contract fixture now mirrors a plausible monthly summarization output, not arbitrary display data
- topic-level fields such as `summary`, `recommended_script`, `training_points`, `apply_when`, and `avoid_when` are monthly-layer outputs, not raw single-call outputs
- `display_*` fields are still derived in `script-library/script-library-utils.js`

Use this block in the utility/runtime boundary section:

```md
The raw contract mirrors monthly summarization output, not raw single-call QC rows.
Fields like `summary`, `recommended_script`, `training_points`, `apply_when`, and `avoid_when` are topic-level monthly outputs.
Renderer-ready `display_*` fields are then derived in `script-library/script-library-utils.js` before DOM rendering.
```

- [ ] **Step 4: Run the documentation grep sanity check again**

Run:

```bash
grep -n "script-library-monthly-pipeline.py\|single-call invite QC\|monthly_packages\|global_pool\|display_" docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
```

Expected: matching lines in both docs proving the aligned handoff language is present.

- [ ] **Step 5: Commit the handoff doc alignment**

```bash
git add docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
git commit -m "docs: align script library handoff with monthly pipeline"
```

## Final verification pass

- [ ] **Step 1: Run all focused JS and Python tests**

Run:

```bash
node --test tests/script-library-llm-assets.test.js tests/script-library-contract.test.js tests/script-library-utils.test.js && python -m unittest tests/script_library_monthly_pipeline_test.py && python -m py_compile script-library/script-library-monthly-pipeline.py
```

Expected: all Node tests pass, Python unit tests pass, and Python compile step exits with code 0.

- [ ] **Step 2: Check the final diff for only the monthly-alignment files**

Run:

```bash
git diff -- script-library/script-library-llm-assets.js script-library/script-library-monthly-pipeline.py script-library/script-library-contract.js tests/script-library-llm-assets.test.js tests/script-library-contract.test.js tests/script-library-utils.test.js tests/script_library_monthly_pipeline_test.py docs/script-library-backend-handoff.md docs/script-library-frontend-handoff.md
```

Expected: only the refined monthly prompt/schema, Python skeleton, expanded contract fixture, and handoff doc updates appear.

- [ ] **Step 3: Summarize the aligned delivery package for the reviewer**

Use this handoff summary:

```text
Aligned the script-library delivery package around immutable single-call invite QC output.
Added: monthly summarization prompt/schema refinement, a Python monthly pipeline skeleton, and richer invite-only contract fixtures that mirror monthly/global output flow.
Updated handoff docs so backend and frontend engineers can trace the path from single-call QC evidence to monthly_packages/global_pool and then into the current page runtime.
```