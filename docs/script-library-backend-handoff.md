# Script Library Backend Handoff

## Scope
This repo provides backend-neutral contract and prompt assets for the monthly script-library pipeline. It does not include a production SDK binding, scheduler, model client, or storage integration.

## Backend ownership
Backend engineering owns the monthly pipeline that produces script-library payloads:

1. Monthly success-case filtering
2. Reuse of invite `优势发掘[]`
3. Monthly topic generation prompt execution
4. Writing payloads that match `script-library/script-library-contract.js`
5. Rule-based `global_pool` merge

## Source files to follow
Backend implementations should treat these files as the source of truth:

- `script-library/script-library-contract.js`
- `script-library/script-library-llm-assets.js`

## Expected monthly input
The monthly topic-generation input should be normalized to month + scene + success cases. Example:

```json
{
  "month": "2026-05",
  "scene": "invite",
  "success_cases": [
    {
      "call_id": "call-2026-05-001",
      "success_result": "到店成功",
      "tag_code": "T09",
      "tag_name": "到店邀约推进",
      "confidence": "高",
      "level": "A",
      "quote": "我先了解一下您平时主要是谁开，方便的话这周来店里我给您做个详细方案。",
      "replicable_point": "先基于需求建立到店理由，再发出明确邀约。"
    }
  ]
}
```

In upstream data, `success_cases` should come from monthly success invite records and should reuse invite `优势发掘[]` content before normalization.

## Expected monthly output
The model response should be validated against `MONTHLY_TOPIC_OUTPUT_SCHEMA` exported from `script-library/script-library-llm-assets.js`.

Do not invent a parallel schema in backend code. Use the shared schema definition from this repo as the validation target for monthly topic output.

## Monthly job sequence
Recommended monthly job flow:

1. Filter success invite cases
2. Expand `优势发掘[]`
3. Build normalized LLM input
4. Call model with `buildMonthlyTopicGenerationPrompt(...)`
5. Validate output against `MONTHLY_TOPIC_OUTPUT_SCHEMA`
6. Write `monthly_packages`
7. Merge into `global_pool`

## Implementation notes
- `buildMonthlyTopicGenerationInput(...)` in `script-library/script-library-llm-assets.js` shows the expected normalized shape for model input.
- `buildMonthlyTopicGenerationPrompt(...)` packages both instructions and schema for the model call.
- `script-library/script-library-contract.js` shows the field names and nested structure expected by the frontend runtime, including `monthly_packages` and `global_pool`.
- The `global_pool` merge is expected to be rule-based in backend code, with stable topic identity and month tracking managed outside this repo’s frontend assets.
- Keep payload field names unchanged so the current runtime can consume backend data without adapter churn.
