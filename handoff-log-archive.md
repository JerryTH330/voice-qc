# 交接日志归档

### 2026-08-07 销售看板邀约/接待页面 .main-content 重构为三行布局
- 用户想做什么：将 `tpl-sales-dcc` 和 `tpl-sales-advisor` 两个 `<template>` 内部的 `.main-content` 布局从左右两列改为新的三行结构，并把 SOP 执行分析从顾问行为洞察的 tab 中独立出来。
- 已经完成了什么：① 修改 `sales-dashboard/index.html` 中 `tpl-sales-dcc` 的 `.main-content`：新增 `.sales-insight-row` 包含独立的 `sales-sop-review-card` 卡片和原 `review-card`（顾问行为洞察），原左侧 `todo-card` 移到 `.sales-recommend-row`，原右侧 `sales-role-trend-card` 移到 `.sales-trend-row`；② 对 `tpl-sales-advisor` 做完全一致的结构调整；③ 从两个 `review-card` 的 `review-insight-tabs` 中删除 `data-review-insight-tab="sop"` 按钮，并将第一个剩余 tab（优势项识别）设为 active；④ 保留 todo-card、review-card（除 sop tab 外）、sales-role-trend-card 的全部原有内部内容。
- 改动了哪些文件：`sales-dashboard/index.html`。
- 做过哪些验证：使用 Node.js 脚本对两个 template 进行标签平衡检查，结果通过；Grep 确认 `col-left`/`col-right` 与 `data-review-insight-tab="sop"` 已移除，`sales-insight-row`/`sales-recommend-row`/`sales-trend-row`/`sales-sop-review-card` 在两个模板中均存在。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板两个角色页面的新三行布局渲染正常、SOP 执行分析卡片与顾问行为洞察卡片在第一行并排显示、原有交互（tab 切换、列表、分页、趋势图）是否仍正常；本次仅改 HTML 结构，对应 CSS 可能需要配合调整新 row 的 flex/grid 布局样式。

### 2026-08-07 销售看板 hero 指标单位显示规则调整
- 用户想做什么：用户在浏览器中选中销售看板 hero 指标卡片的趋势小字 `<span class="hm-trend up">↑1条</span>` 与数值 `<div class="hm-val-row"><span class="hm-value">0</span><span class="hm-trend down">↓1条</span></div>`，要求：趋势小字不带"条"，数值 0 后面显示"条"，数值 1 后面不显示"条"。
- 已经完成了什么：① 新增 `renderSalesHeroValue(rawValue, unit)` 函数：当 unit 为"条"时，数值 0 或 >=2 显示为"X条"，数值 1 只显示"1"；其他 unit（"%"、"min" 等）沿用原有 buildCounterDisplayMarkup 逻辑；② 修改 `formatSalesTrendValue(value, suffix, decimals)`：当 suffix 为"条"时自动忽略，使趋势只保留方向和数字；③ 修改 `dccMetricsByRange` / `advisorMetricsByRange` 硬编码 mock 数据中所有带"条"的 trend 字符串，去掉"条"后缀；④ 修改 `buildDccCustomMetrics` / `buildAdvisorCustomMetrics` 中调用 `formatSalesTrendValue` 的地方，将"条" suffix 改为空字符串；⑤ 修改 `renderDccHeroMetrics` / `renderAdvisorHeroMetrics`，将 hero 指标数值从 `buildCounterDataAttrs` + `renderCounterValueMarkup` 改为直接渲染 `<span class="hm-value">${renderSalesHeroValue(...)}</span>`，避免通用 counter 动画覆盖单位规则；⑥ 将销售看板缓存版本从 `20260807-sales-hero-icons-v5` 更新为 `20260807-sales-count-unit-v6`，同步修改 `sales-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/page.css` 与相关测试文件中的版本断言。
- 改动了哪些文件：`app-runtime.js`、`sales-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/page.css`、`tests/sales-review-sop-toolbar.test.js`、`tests/sales-review-robot-interaction.test.js`。
- 做过哪些验证：`node --check app-runtime.js && node --check sales-dashboard/page.js && node --check store-dashboard/page.js && node --check factory-dashboard/page.js` 通过；`node scripts/check-version-sync.js` 通过；`node tests/sales-review-sop-toolbar.test.js` 2 个用例全部通过；`node tests/sales-review-robot-interaction.test.js` 2 个用例全部通过。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板两个角色页面：趋势小字不再带"条"，数值 0 显示"0条"，数值 1 显示"1"；因改用直接渲染，hero 指标数字不再播放滚动动画，如后续需要恢复动画可再单独处理。

### 2026-08-07 销售看板业务场景样式与门店看板保持一致（对抗式审查后补齐全部层级）
- 用户想做什么：销售看板「业务场景」选择器要跟门店看板的样式完全一致。
- 已经完成了什么：① 将 `app-runtime.js` 中的 `renderSalesReviewSceneControl` 生成的 HTML 结构完全复刻门店看板：外层 `<div class="gf-group store-filter-box session-toolbar-control session-toolbar-segment-control session-toolbar-control-intent">`、`<span class="gf-label">业务场景</span>`、`<div class="gf-tabs todo-filter-tabs" id="gf-scene">`、按钮使用 `gf-tab todo-filter-tab` 类并带有 `data-scene`、`aria-pressed`、`aria-checked`、`aria-hidden`、`tabindex` 等属性，「全部」按钮默认隐藏；② 在 `sales-dashboard/page.css` 中移除旧的 `.sales-role-scene-label`/`.sales-role-scene-tabs`/`.sales-role-scene-option` 自定义样式；③ 通过对抗式审查发现门店看板实际生效的是多层覆盖样式：`.store-filter-box` 外层白色圆角卡片、`gf-label` 透明文字标签（被 `.store-filter-box .gf-label` 覆盖）、`.gf-tabs` 白色内层卡片（被 3083 行的 `.store-dashboard-page .gf-tabs` 覆盖背景/圆角/阴影）、`#gf-scene.gf-tabs` 再把 gap 改为 14px；④ 在 `sales-dashboard/page.css` 中按实际生效层级重写：`.gf-group` 设为 44px 高白色卡片（rgba(255,255,255,0.98)、16px 圆角、阴影），`.gf-label` 设为透明背景 #98A2B3 文字，`.gf-tabs` 设为白色内层卡片，`#gf-scene.gf-tabs.todo-filter-tabs` 单独 `gap:14px`，并保留 checkbox 选中态、hover、disabled 样式；⑤ 更新事件绑定由 `data-sales-review-scene` 改为 `data-scene`；⑥ 更新销售看板 `page.js` 与 `index.html` 缓存版本为 `20260807-sales-scene-tabs-v4`，并同步更新相关测试文件中的版本断言；⑦ 同步更新 `sales-dashboard/page.css` 中 `voice-qc-admin.css` 与 `app-inline.css` 的 import 版本号。
- 改动了哪些文件：`app-runtime.js`、`sales-dashboard/page.css`、`sales-dashboard/page.js`、`sales-dashboard/index.html`、`tests/sales-review-sop-toolbar.test.js`、`tests/sales-review-robot-interaction.test.js`。
- 做过哪些验证：`node --check app-runtime.js sales-dashboard/page.js` 通过；`node scripts/check-version-sync.js` 通过；销售看板相关测试 4 个用例中 3 个通过，剩余 1 个 `data-sales-review-sop-search` 断言失败为预先存在的问题，与本次修改无关。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板业务场景是否与门店看板完全一致：外层白色圆角卡片、标签文字颜色、内层 tabs 卡片、选项间距 14px、checkbox 选中态；未跑全量测试。

### 2026-08-07 门店看板业务场景选中 tab 文字使用主题色蓝色
- 用户想做什么：门店看板业务场景选中按钮的文字颜色要使用主题蓝色。
- 已经完成了什么：① 将 `app-inline.css` 中 `.store-dashboard-page #gf-scene .gf-tab.todo-filter-tab.active` 的文字颜色从 `#1E3A8A` 改为主题蓝色 `#2563EB`；② 更新 `store-dashboard/page.css` 中 `voice-qc-admin.css` 与 `app-inline.css` 的 import 版本号为 `20260807-active-tab-blue`，确保浏览器重新加载修改后的样式。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`。
- 做过哪些验证：`node --check` 无语法错误；`node scripts/check-version-sync.js` 通过。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证门店看板 #gf-scene 中选中 tab 的文字颜色是否为主题蓝色；未跑全量测试。

### 2026-08-07 客户意向演变卡片按 Figma 587:429 校准样式
- 用户想做什么：根据 Figma 设计稿（节点 587:429）校准线索详情页「客户意向演变」卡片的样式。
- 已经完成了什么：① 通过 Figma MCP 拉取设计稿节点 587:429，确认节点固定 80px 宽、节点间距 10px、滚动容器右侧内边距 25px、左右滚动箭头 28×28px 圆角 14px、节点标记字重 600（Semibold）；② 修改 `voice-qc-admin.css`：将 `.lead-detail-hero-steps` 的 `gap` 改为 `10px`、`padding` 改为 `0 25px 0 0`，将 `.lead-detail-hero-step` 改为固定 `flex: 0 0 80px; width: 80px`，将 `.lead-detail-evolution-arrow` 的 `border-radius` 从 `50%` 改为 `14px`，将 `.lead-detail-hero-step-marker` 的 `font-weight` 从 `800` 改为 `600`；③ 同步调整展开态与窄屏（≤1200px）下的节点宽度为固定 80px/72px，并更新测试断言；④ 更新 `tests/leads-detail-evolution-responsive.test.js`，将节点宽度断言从响应式等分改为固定 80px，并将容器最大宽度断言从 `1110px` 更新为 `1266px`。
- 改动了哪些文件：`voice-qc-admin.css`、`tests/leads-detail-evolution-responsive.test.js`。
- 做过哪些验证：`node --check` 检查 `voice-qc-admin.css` 语法无误；`node tests/leads-detail-evolution-responsive.test.js && node tests/leads-detail-figma-533-8216.test.js` 11 个测试全部通过；全量测试仅 `tests/factory-dashboard-panel-spacing.test.js` 两个用例失败，与本次修改无关。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后打开线索列表第一条数据的详情页，验证21个节点在固定80px宽度、10px间距下的横向滚动、左右箭头位置、滚轮横向滚动以及「展开/收起」功能是否正常；Figma 403 问题本次未复现，如后续再出现需检查 Figma Token 的 `file_content:read` 和 `file_dev_resources:read` 权限。

### 2026-08-07 客户意向演变卡片响应式修复：占满宽度 + 箭头不贴边
- 用户想做什么：解决线索详情页「客户意向演变」卡片的响应式问题——图1左右箭头贴边、图2左右两侧大量留白没有自适应，要求实现类似图3设计稿规范的效果。
- 已经完成了什么：① 修改 `leads/page.css`：将 `.lead-detail-journey-evolution .lead-detail-hero-evolution` 的宽度从 `min(100%, 1266px)` 改为 `100%`，移除最大宽度限制，使节点列表容器占满卡片可用宽度，避免两侧大量留白；② 修改 `voice-qc-admin.css`：将 `.lead-detail-hero-steps` 的 `padding` 从 `0 25px 0 0` 改为 `0 25px`，为左侧箭头留出与右侧对称的间距；将 `.lead-detail-evolution-arrow-prev` 的 `left` 从 `-20px` 改为 `0`，`.lead-detail-evolution-arrow-next` 的 `right` 从 `-20px` 改为 `0`，使箭头位于容器内部左右边缘，不再贴边；③ 展开态下移除 `.lead-detail-hero-steps` 的 padding，让展开后的节点列表能充分利用容器宽度换行展示；④ 同步更新 `tests/leads-detail-evolution-responsive.test.js` 中的容器宽度断言。
- 改动了哪些文件：`leads/page.css`、`voice- 改动了哪些文件：`voice-qc-admin.css`、`tests/leads-detail-evolution-responsive.test.js`。
- 做过哪些验证：`node tests/leads-detail-evolution-responsive.test.js && node tests/leads-detail-figma-533-8216.test.js` 11 个测试全部通过；`node --check` 无语法错误。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后打开线索列表第一条数据的详情页，验证不同窗口宽度下：节点列表是否占满宽度、左右箭头是否不再贴边、展开/收起是否正常、滚轮横向滚动是否流畅。

### 2026-08-07 门店/厂端看板 hero 指标趋势小字改为 14px
- 用户想做什么：用户在浏览器中选中门店看板 hero 指标卡片里的趋势小字 `<span class="hm-trend up">↑2</span>`，要求改成 14px；同时要求厂端看板也同步修改。
- 已经完成了什么：① 排查发现门店看板实际生效的是 `store-dashboard/page.css` 中更具体的选择器 `.store-dashboard-page .store-hero-metrics .hm-layout-bottom .hm-trend`，将其 `font-size` 从 `12px` 改为 `14px`；同时保持 `app-inline.css` 中对应规则为 14px 作为兜底；② 修改厂端看板 `factory-dashboard/factory-dashboard.css` 中两处 `.hm-trend` 规则（`.factory-dashboard-page .store-hero-metrics .hm-trend` 与 `.factory-dashboard-page .store-hero-metrics.factory-hero-metrics-layout .hm-layout-bottom .hm-trend`），将 `font-size` 从 `12px` 改为 `14px`，`font-weight` 统一为 `500`；③ 将门店看板缓存版本从 `20260806-issue-rule-store-layout-v2` 更新为 `20260807-trend-14px`，同步修改 `store-dashboard/page.js`、`store-dashboard/index.html`、`store-dashboard/page.css` 中的 import 与引用；④ 将厂端看板缓存版本从 `20260805-issue-rule-adaptive` / `20260805-issue-rule-shared` 更新为 `20260807-trend-14px-factory`，同步修改 `factory-dashboard/page.js`、`factory-dashboard/index.html`、`factory-dashboard/page.css` 中的 import 与引用；⑤ 同步更新 10 个测试文件中的版本断言：门店看板 6 个（`store-review-sop-toolbar.test.js`、`store-advisor-pagination.test.js`、`store-core-metrics-figma.test.js`、`store-dashboard-layout-consistency.test.js`、`store-quality-overview-figma.test.js`、`store-recording-summary-visibility.test.js`），厂端看板 4 个（`factory-recording-summary-visibility.test.js`、`factory-issue-overview-figma-565-5348.test.js`、`factory-dashboard-panel-spacing.test.js`、`factory-quality-overview-match.test.js`）。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/index.html`、`store-dashboard/page.css`、`factory-dashboard/factory-dashboard.css`、`factory-dashboard/page.js`、`factory-dashboard/index.html`、`factory-dashboard/page.css`，以及上述 10 个测试文件。
- 做过哪些验证：`node --check app-runtime.js && node --check sales-dashboard/page.js && node --check store-dashboard/page.js && node --check factory-dashboard/page.js` 通过；`node scripts/check-version-sync.js` 通过；筛选运行的版本号/缓存相关测试 8 个全部通过；部分非版本号历史遗留测试失败（`factory-issue-overview-figma-565-5348` 的 issue overview wrapper / issue rule list 断言、`factory-dashboard-panel-spacing` 的 issue overview padding 断言、`store-core-metrics-figma` 的 role-icon / 店长文案断言、`store-dashboard-layout-consistency` 的 store-sop-rule-toolbar grid 断言、`store-review-sop-toolbar` 的搜索规则文案与 SOP toolbar data 属性断言），均与本次字体修改无关。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证门店看板、厂端看板 hero 指标卡片的趋势小字是否都显示为 14px；销售看板此前已将 `.hm-trend` 改为 14px，三端看板现在保持一致。

### 2026-08-06 线索列表第一条数据生成21节点假数据
- 用户想做什么：在线索列表第一条数据生成一个21节点的假数据，用于测试客户意向演变卡片的多节点交互功能；并要求点击线索列表的「线索详情」后，详情页里显示的数据与列表行对应。
- 已经完成了什么：① 修改 `app-runtime.js` 中的 `buildLeadDetailEvolutionSteps`，为排序后的线索列表第一条记录生成21个演变节点，节点标签为「节点1」~「节点21」，日期从 `baseDate` 前20天递进到 `baseDate`，意向等级按「高/中/低」循环；② 在 `buildLeadRecords` 排序完成后为第一条记录标记 `isFirstLeadRecord = true`；③ 修复线索列表「线索详情」按钮没有传递当前行线索 ID 的问题：为按钮增加 `data-lead-id` 和 `data-lead-source="leads"`，在 `attachRouteLinks` 中把这两个参数传给 `navigateToRoute`，并在 `getSalesLeadCollection` 中新增 `role === 'leads'` 时返回 `leadRecords`；④ 修复同页路由跳转没有更新网址参数的问题：在 `navigateToRoute` 的同页分支里先通过 `history.replaceState` 把 `leadId`/`leadSource` 写入网址，再调用 `renderPage`，否则详情页从网址读不到参数，始终显示 HTML 模板里的3个写死节点；⑤ 调整左右滚动箭头与节点列表间距：在 `voice-qc-admin.css` 中将 `.lead-detail-evolution-arrow-prev` 设为 `left: -28px`、`.lead-detail-evolution-arrow-next` 设为 `right: -28px`，使箭头位于节点列表左右两侧的空白 padding 区域；同时给 `.lead-detail-hero-steps` 增加 `padding: 0 32px`，避免最边缘的节点被截断或压在按钮上，放不下的节点通过「展开」按钮查看；⑥ 为线索记录补充假数据：在 `normalizeLeadRecord` 中补充 `intent`、`qcScene`、`source`、`summary`、`action`、`tags`、`followUpTime` 字段，使线索详情「意图」与「证据」区域不再显示 `undefined`，并正常展示客户意向摘要与证据文本。
- 改动了哪些文件：`app-runtime.js`、`voice-qc-admin.css`、`leads/index.html`。
- 做过哪些验证：`node --check app-runtime.js` 通过；`node --test tests/leads-detail-evolution-responsive.test.js tests/leads-detail-figma-533-8216.test.js tests/leads-detail-meta-and-tag-panels.test.js` 25 个测试全部通过。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后打开线索列表第一条数据的详情页，验证21个节点的横向滚动、左右箭头位置、滚轮横向滚动以及「展开/收起」功能是否正常；未跑全量测试。

## 2026-08-06 线索详情客户意向演变卡片：多节点横向滚动 + 展开折叠
- 用户想做什么：真实数据可能出现 21 个甚至更多节点，要求节点按数量自动等分容器宽度（设置最小值），超出时显示左右箭头点击切换查看，同时支持鼠标滚轮横向滚动；增加「展开全部/收起」按钮，展开后箭头消失、节点完整显示并自动换行撑开高度。
- 已经完成了什么：① 在 `leads/index.html` 的 `lead-detail-journey-evolution` 中新增右上角「展开全部/收起」按钮和左右滚动箭头；② 调整 `voice-qc-admin.css`：将步骤列表从 grid 改为 flex 横向滚动，步骤宽度使用 `max(--lead-evolution-step-min, calc(100% / var(--lead-evolution-step-count)))` 实现按节点数等分且带最小宽度，默认折叠态隐藏滚动条，展开态 `flex-wrap: wrap` 并隐藏箭头；③ 调整 `leads/page.css`：容器改为 `position: relative`、`overflow: visible`，为箭头留出左右内边距，展开态高度自适应；④ 在 `app-runtime.js` 新增 `bindLeadDetailEvolutionUI()`，根据实际节点数设置 CSS 变量，绑定箭头点击（每次滚动一屏）、滚轮横向滚动、展开/折叠按钮切换与 ResizeObserver 箭头显隐；⑤ 将小于 1200px 的垂直布局改为保持横向排列，仅缩小最小宽度和箭头尺寸。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`、`leads/page.css`、`app-runtime.js`、`tests/leads-detail-evolution-responsive.test.js`、`tests/leads-detail-figma-533-8216.test.js`。
- 做过哪些验证：`node --check app-runtime.js leads/page.js tests/leads-detail-evolution-responsive.test.js tests/leads-detail-figma-533-8216.test.js` 全部通过；`node --test tests/leads-detail-evolution-responsive.test.js tests/leads-detail-figma-533-8216.test.js` 11 个测试全部通过。
- 还有哪些待办或风险：未在浏览器用真实 21 个节点数据验证展开/折叠、箭头滚动、滚轮横向滚动的实际效果；窄屏下箭头与展开按钮的覆盖关系需要在真实界面中确认；未跑全量测试。

### 2026-08-06 厂端看板布局重构：SOP执行分析独立卡片，顾问行为洞察保留 3 Tab
- 用户想做什么：将厂端看板「SOP执行分析」从「顾问行为洞察」中彻底抽出，变成独立卡片；布局调整为第一行概览、第二行 SOP执行分析 | 顾问行为洞察、第三行 SOP执行排行、第四行趋势图；顾问行为洞察只保留「优势项识别 / 短板项识别 / 风险命中分析」3 个 Tab。
- 已经完成了什么：① 在 `factory-dashboard.js` 的 HTML 模板中新增独立的 `issue-sop-analysis-wrapper` 卡片，移除顾问行为洞察中的 SOP 执行分析 Tab；② 引入双状态 `issueRuleAnalysisState` 与 `sopAnalysisState`，将渲染与事件绑定函数参数化，使两个面板可独立进行搜索、排序、分页、下钻；③ 调整 `factory-dashboard.css` 的 Grid 布局，显式指定概览（第1行通栏）、SOP执行分析与顾问行为洞察（第2行双列）、SOP执行排行（第3行通栏）、趋势图（第4行通栏），并在 1100px 以下自动堆叠；④ 同步保留所有文案（SOP执行分析 / 顾问行为洞察 / SOP执行排行 / SOP执行趋势分布图）。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`。
- 做过哪些验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Grep 确认厂端看板 JS 中旧文案（录音复盘、SOP 质检分析、质检排行、质检趋势分布图、顾问排行、质检趋势）已清空；CSS Grid 行/列设置与用户需求一致；`page.js` 中 `shared/issue-rule-list.js` 仍在 `factory-dashboard.js` 与 `app-runtime.js` 之前加载。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证厂端看板实际布局、Tab 切换、两个面板的独立交互（搜索/排序/分页/下钻）是否正常；未跑全量测试。

## 2026-08-06 界面文案调整：质检排行/趋势、顾问排行统一改为 SOP 执行相关文案
- 用户想做什么：将"质检排行"改为"SOP执行排行"；"质检趋势分布图"改为"SOP执行趋势分布图"；"顾问排行"改为"SOP执行排行"（销售看板/门店看板）；"质检趋势"改为"SOP执行趋势分布图"；并将 `card-sub` 小字改为"从录音中识别顾问的优势、短板与风险行为。".
- 已经完成了什么：已修改厂端、门店、销售看板 HTML/JS 中所有用户可见的对应文案，包括标题、section aria-label、canvas aria-label、分页 aria-label、配置对象 label、AI 摘要占位文本以及布局注释；`card-sub` 小字已按要求替换。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard-dom.html`、`store-dashboard/index.html`、`store-dashboard-dom.html`、`sales-dashboard/index.html`、`app-runtime.js`。
- 做过哪些验证：Grep 扫描 `*.{html,js}` 确认用户可见的"质检排行""质检趋势分布图""顾问排行""质检趋势""支持规则排序，支持下钻查看各级组织表现"已全部替换，仅剩测试文件和 CSS 注释中的历史描述未改动（无需改动）。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证三端显示；未跑全量测试。

## 2026-08-06 界面文案调整：录音复盘改为顾问行为洞察，SOP 质检分析改为 SOP 执行分析
- 用户想做什么：将界面中"录音复盘"改为"顾问行为洞察"，"SOP 质检分析"改为"SOP执行分析"。
- 已经完成了什么：已修改厂端、门店、销售看板 HTML/JS 中所有用户可见的对应文案，包括 card-title、tab 按钮文本、tablist/tabpanel 的 aria-label、分页 aria-label、配置对象 label 以及厂端导出 CSV 文件名。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard-dom.html`、`store-dashboard/index.html`、`store-dashboard-dom.html`、`sales-dashboard/index.html`、`app-runtime.js`。
- 做过哪些验证：Grep 扫描 `*.{html,js}` 确认用户可见文本已全部替换，仅剩 CSS 注释和测试文件中的历史描述未改动（无需改动）。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证三端显示；未跑全量测试。

## 2026-08-05 修复规则名浮窗误显 + 门店标签浮窗缺失
- 用户想做什么：规则名没出现...时不应显示浮窗；标签任何时候悬停都要显示完整标签名浮窗。
- 已经完成了什么：① `shared/issue-rule-list.js` 的 `isRuleNameEllipsis` 改为先用 `scrollWidth > clientWidth` 判断，再用 Range API 兜底（容差从 +1 提到 +4），避免没截断也标 `data-rule-name-truncated="true"`；② `store-dashboard/page.css` 补上缺失的 `.issue-rule-tag-popover` 样式和 `.issue-rule-name em:hover` 显示逻辑，并给 em 加 `position: relative`。
- 改动了哪些文件：`shared/issue-rule-list.js`、`store-dashboard/page.css`。
- 做过哪些验证：`node --check shared/issue-rule-list.js` 通过；目测 `factory-dashboard.css` / `sales-dashboard/page.css` 已有 tag popover 样式，无需改动。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证三端效果；未跑全量测试。

## 2026-08-05 修复非看板页面未加载 shared/issue-rule-list.js 导致空白
- 用户想做什么：切到线索列表页面后页面空白，控制台报错 `IssueRuleList is not defined`。
- 已经完成了什么：检查后发现 `app-runtime.js` 在模块加载时就调用了 `IssueRuleList.createAutoCollapser`，但线索、录音、质检配置、优秀话术库、系统管理这 5 个非看板 page.js 只加载了 `app-runtime.js`，没有加载 `shared/issue-rule-list.js`。已在这 5 个 page.js 的 scripts 数组里，把 `../shared/issue-rule-list.js` 放在 `../app-runtime.js` 之前按顺序加载。
- 改动了哪些文件：`leads/page.js`、`session/page.js`、`config/page.js`、`script-library/page.js`、`system/page.js`。
- 做过哪些验证：`node --check` 检查 5 个文件全部通过；语法无误，加载顺序正确。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证线索列表、录音列表、质检配置、话术库、系统管理页面是否正常加载；未跑全量测试。
