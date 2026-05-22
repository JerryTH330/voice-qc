# Script Library Frontend Handoff

## Scope
The current frontend runtime is already wired to render script-library payloads with two data layers:

- `monthly_packages`
- `global_pool`

The contract and example payload that define this shape live in `script-library/script-library-contract.js`.

## Frontend runtime files
The active runtime is split across these files:

- `script-library/page.js`
- `script-library/index.html`
- `script-library/script-library-utils.js`
- `app-runtime.js`
- `voice-qc-admin.css`

## What the frontend currently expects
- Payload field names must remain consistent with `script-library/script-library-contract.js`.
- The runtime reads from `monthly_packages` for monthly view content.
- The runtime reads from `global_pool` for long-term pooled content.
- The current example payload in `script-library/script-library-contract.js` is the reference fixture for integration and UI behavior.

## Supported views
1. `完整池`
2. `月度新增`

In code, these correspond to the global and monthly view modes exposed through the contract/runtime utilities.

## Supported scenes
1. `邀约`
2. `接待` (empty state for now)
3. `试驾` (empty state for now)

Only `邀约` currently has populated example data. `接待` and `试驾` already have runtime support and designed empty states, so backend can start returning data later without changing the screen model.

## Integration rule
When the backend API is ready, replace the example payload source in `script-library/script-library-contract.js` with real API data that preserves the same field names.

The safest integration path is to keep the contract shape stable and swap only the data source, rather than changing renderer field names or adding a frontend-only adapter layer.

## Utility/runtime boundary
Renderer-ready `display_*` fields are currently built in `script-library/script-library-utils.js`.

Future frontend changes should keep this utility/runtime boundary stable:
- raw payload contract stays aligned with backend data
- transformation into renderer-friendly `display_*` fields stays in `script-library/script-library-utils.js`
- DOM rendering stays in `app-runtime.js`

This separation is what currently allows the runtime to render list/detail cards, stats, empty states, and filter labels without mutating the source payload directly.
