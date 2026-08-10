# 销售看板布局重构计划：SOP 执行分析独立 + 推荐清单下移

## 1. 摘要

将销售看板（云外呼、工牌两个角色页）中当前位于「顾问行为洞察」卡片内的「SOP 执行分析」页签拆分为独立卡片，放置于「顾问行为洞察」左侧并排显示；将左侧的「推荐清单」卡片整体下移到第二行独占一行；原来的「SOP 执行趋势分布图」卡片下移到最底部独占一行。

最终三行布局：
1. SOP 执行分析 | 顾问行为洞察
2. 推荐清单（整行）
3. SOP 执行趋势分布图（整行）

## 2. 当前状态分析

### 2.1 HTML 结构

`sales-dashboard/index.html` 中 `tpl-sales-dcc` 与 `tpl-sales-advisor` 模板结构对称：

- `.main-content` 为两列 grid：
  - `.col-left`：`.todo-card`（推荐清单/今日清单）
  - `.col-right`：`.review-card`（顾问行为洞察，含 4 个 tab） + `.sales-role-trend-card`（趋势图）

- 顾问行为洞察卡片内部 tab：
  - `data-review-insight-tab="sop"`：SOP 执行分析
  - `data-review-insight-tab="strength"`：优势项识别
  - `data-review-insight-tab="weakness"`：短板项识别
  - `data-review-insight-tab="risk"`：风险命中分析

### 2.2 JS 逻辑

`app-runtime.js` 中：

- `SALES_REVIEW_INSIGHT_CONFIG` 同时配置 sop / strength / weakness / risk 四种类型。
- `renderSalesReviewToolbar(role, activeTab)`、`renderSalesReviewInsightContent(role, activeTab)`、`renderSalesReviewPagination(role, activeTab, totalItems)` 根据 activeTab 渲染搜索排序工具栏、规则列表、分页。
- `renderSalesReviewInsights(role)` 读取 `state.reviewInsightTab`（默认 `'sop'`），高亮对应 tab 并调用上述函数。
- 场景筛选变化时调用 `renderSalesReviewInsights(role)` 刷新列表。
- 状态字段：`reviewInsightTab`、`reviewInsightPage`、`reviewRuleQuery`、`reviewRuleSort`。

### 2.3 CSS 布局

`voice-qc-admin.css` 中：

- `.sales-role-dashboard-page .main-content` 为 `grid-template-columns: minmax(0, 0.98fr) minmax(0, 1.02fr)`。
- `.col-left`、`.col-right` 分别控制 flex 列。
- `.sales-role-trend-card` 已有 `grid-column: 1 / -1`，但当前被放在 `.col-right` 内部，实际占满列宽而非整行。
- 响应式在 `max-width: 900px` 时将 `.main-content` 改为单列。

## 3. 待修改内容

### 3.1 `sales-dashboard/index.html`

对 `tpl-sales-dcc` 和 `tpl-sales-advisor` 两个 `<template>` 内的 `.main-content` 做统一改造：

1. 移除原有 `.col-left` / `.col-right` 包裹。
2. 新增 `.sales-insight-row` 行，内部左右并排放置：
   - 左侧：`.card.sales-sop-review-card`，包含：
     - `.card-header`：标题「SOP 执行分析」+ 副标题
     - `.sales-sop-review-toolbar`（ID：`sales-sop-review-toolbar`）
     - `.sales-sop-review-list`（ID：`sales-sop-review-list`）
   - 右侧：原有 `.review-card.sales-inline-review-card.sales-embedded-review-card`，但内部 tab 只保留 strength / weakness / risk 三个。
3. 新增 `.sales-recommend-row` 行，放置原有 `.todo-card`（推荐清单）。
4. 新增 `.sales-trend-row` 行，放置原有 `.sales-role-trend-card`（趋势图）。

### 3.2 `voice-qc-admin.css`

1. `.sales-role-dashboard-page .main-content`：
   - 改为 `display: flex; flex-direction: column; gap: 16px;`。
2. 新增 `.sales-role-dashboard-page .sales-insight-row`：
   - `display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch;`。
3. 新增 `.sales-role-dashboard-page .sales-recommend-row`、`.sales-role-dashboard-page .sales-trend-row`：
   - 整行展示，内部卡片占满宽度。
4. 新增 `.sales-role-dashboard-page .sales-sop-review-card`：
   - 与 `.review-card` 视觉一致：padding、圆角、边框、背景、阴影。
   - `display: flex; flex-direction: column;`。
   - `.sales-sop-review-body`：`display: flex; flex-direction: column; gap: 16px; flex: 1; min-height: 0;`。
5. 调整 `.sales-role-dashboard-page .todo-card`：
   - 在 `.sales-recommend-row` 内占满整行，保持现有内边距与列表样式。
6. 调整响应式 `max-width: 900px`：
   - `.sales-insight-row` 改为 `grid-template-columns: 1fr`。
   - `.sales-recommend-row`、`.sales-trend-row` 保持整行。

### 3.3 `sales-dashboard/page.css`

1. 将 `.sales-role-dashboard-page .review-insight-toolbar .store-sop-rule-toolbar` 相关样式复制或重用到 `.sales-role-dashboard-page .sales-sop-review-toolbar .store-sop-rule-toolbar`，确保 SOP 独立卡片的搜索/排序工具栏样式与顾问行为洞察一致。
2. 将 `.sales-role-dashboard-page .review-insight-list` 相关样式（列表、行、分页、空态）复用到 `.sales-role-dashboard-page .sales-sop-review-list`。
3. 或更简单地：将原有选择器 `.review-insight-toolbar`、`.review-insight-list` 扩展为同时匹配 `.sales-sop-review-toolbar`、`.sales-sop-review-list`。

### 3.4 `app-runtime.js`

#### 3.4.1 状态字段扩展

在 `createDefaultDccState()` 与 `createDefaultAdvisorState()` 中新增 SOP 独立状态：

```js
sopReviewPage: 1,
sopReviewRuleQuery: '',
sopReviewRuleSort: 'rate-desc',
```

#### 3.4.2 兼容旧状态

读取 `state.reviewInsightTab` 时，如果值为 `'sop'`，则重置为 `'strength'`（顾问行为洞察默认 tab）。

#### 3.4.3 新增 SOP 渲染函数

基于现有 `renderSalesReviewToolbar` / `renderSalesReviewInsightContent` / `renderSalesReviewPagination` 的逻辑，新增：

- `renderSalesSopReviewToolbar(role)`：渲染到 `#sales-sop-review-toolbar`，使用 `SALES_REVIEW_INSIGHT_CONFIG.sop`，状态字段使用 `sopReviewRuleQuery` / `sopReviewRuleSort`。
- `renderSalesSopReviewContent(role)`：渲染到 `#sales-sop-review-list`，使用 `SALES_REVIEW_INSIGHT_CONFIG.sop`，状态字段使用 `sopReviewPage`。
- `renderSalesSopReview(role)`：调用上述两个函数。

#### 3.4.4 修改顾问行为洞察渲染

- `renderSalesReviewInsights(role)`：
  - activeTab 限定为 `['strength', 'weakness', 'risk']`，默认 `'strength'`。
  - 不再渲染 SOP 内容。
  - 保持现有 strength/weakness/risk 的工具栏、列表、分页逻辑不变。

- HTML 模板中移除 `data-review-insight-tab="sop"` 按钮。

#### 3.4.5 事件绑定调整

- `.review-insight-tabs` 点击事件：只处理 strength/weakness/risk，不再处理 sop。
- `#sales-sop-review-toolbar` 内的搜索/排序事件：绑定到 SOP 状态并调用 `renderSalesSopReviewContent(role)`。
- 场景筛选变化：在 `renderSalesReviewSceneControl` 的回调中同时调用 `renderSalesSopReview(role)` 与 `renderSalesReviewInsights(role)`。

#### 3.4.6 页面级渲染入口

- `renderDccReview()` 末尾增加 `renderSalesSopReview('dcc')`。
- `renderAdvisorReview()` 末尾增加 `renderSalesSopReview('advisor')`。

## 4. 验证步骤

1. **语法检查**：
   - `node --check app-runtime.js`
   - `node --check sales-dashboard/page.js`

2. **版本同步检查**：
   - 运行 `node scripts/check-version-sync.js`（如存在）。
   - 统一更新 `sales-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/page.css` 中的版本号为新版本（例如 `20260807-sales-layout-sop-v4`）。

3. **静态内容检查**：
   - 确认 `sales-dashboard/index.html` 中不再包含 `data-review-insight-tab="sop"`。
   - 确认新增 `#sales-sop-review-toolbar` 与 `#sales-sop-review-list`。
   - 确认两个模板（dcc/advisor）结构一致。

4. **样式检查**：
   - 确认 `.sales-insight-row` 为两列 grid，`.sales-recommend-row`、`.sales-trend-row` 为整行。
   - 确认响应式 900px 以下 `.sales-insight-row` 变为单列。

5. **运行时检查（浏览器）**：
   - 硬刷新销售看板云外呼页与工牌页。
   - 确认第一行左侧为「SOP 执行分析」独立卡片，右侧为「顾问行为洞察」且只有 3 个 tab。
   - 确认第二行为「推荐清单」/「今日清单」独占一行。
   - 确认最底部为「SOP 执行趋势分布图」独占一行。
   - 确认 SOP 卡片内搜索、排序、分页可正常使用。
   - 确认顾问行为洞察 3 个 tab 切换保留原有搜索/排序/分页状态。
   - 确认业务场景筛选变化时，SOP 卡片与顾问行为洞察卡片均刷新。

## 5. 假设与决策

1. **SIP = SOP**：用户已确认「SIP 执行分析」即当前「顾问行为洞察」中的「SOP 执行分析」页签。
2. **两角色页均调整**：云外呼页（`tpl-sales-dcc`）与工牌页（`tpl-sales-advisor`）同步修改，保持结构一致。
3. **趋势图位置**：用户已确认趋势图放到最底部整行展示。
4. **状态隔离**：SOP 独立卡片使用自己的页码、搜索词、排序状态，不与顾问行为洞察共享，避免互相干扰。
5. **顾问行为洞察默认 tab**：SOP 拆分后，默认显示「优势项识别」，旧状态中若残留 `'sop'` 则自动修正为 `'strength'`。
6. **样式复用**：SOP 独立卡片的列表、工具栏、分页尽量复用现有 `.store-sop-rule-*` 与 `.issue-rule-*` 样式类，减少新增样式量。
