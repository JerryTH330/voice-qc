const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '客户洞察', 'v2');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, '客户洞察.css'), 'utf8');
const script = fs.readFileSync(path.join(root, '客户洞察.js'), 'utf8');

test('客户洞察首页删除本周建议先处理区域', () => {
  const overview = html.slice(html.indexOf('id="overviewPage"'), html.indexOf('id="stageAnalysis"'));
  assert.doesNotMatch(overview, /本周建议先处理|id="overviewDecisionList"|overview-decisions|overview-decision-note/);
  assert.doesNotMatch(script, /getScopedAttentionItems|overviewDecisionList|data-attention-stage/);
  assert.doesNotMatch(css, /\.overview-decision-grid|\.overview-decision-item|\.overview-decision-note/);
  assert.doesNotMatch(html, /近 7 周阶段指标走势/);
  assert.doesNotMatch(html, /id="orgOverviewTitle"/);
  assert.doesNotMatch(html, /本周关键经营信号/);
  assert.doesNotMatch(html, /id="attentionList"/);
});

test('客群洞察与客群对比使用独立时间筛选', () => {
  const controls = html.match(/<section class="scope-panel"[\s\S]*?<\/section>/)?.[0] || '';
  const overviewTime = controls.match(/<div class="scope-field overview-date-field" id="overviewTimeControls">[\s\S]*?<\/footer>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/)?.[0] || '';
  assert.match(overviewTime, /统计日期/);
  assert.doesNotMatch(overviewTime, /统计周期|观测周期/);
  assert.match(controls, /id="brandFilter"[\s\S]*?id="orgFilter"[\s\S]*?id="modelFilter"[\s\S]*?id="sceneFilter"[\s\S]*?id="overviewStatusFilter"[\s\S]*?id="overviewTimeControls"/);
  assert.match(controls, /id="customerDateTrigger"/);
  assert.match(controls, /2026-07-14 至 2026-07-20/);
  ['今天', '近3天', '近7天', '近半个月', '近一个月', '近三个月', '近半年'].forEach((label) => {
    assert.match(controls, new RegExp(label));
  });
  assert.match(controls, /id="stageTimeControls" hidden/);
  assert.match(controls, /观测周期/);
  assert.match(controls, /统计周期/);
  assert.match(controls, /data-window="7"[^>]*>7 天/);
  assert.match(controls, /data-window="15"[^>]*>15 天/);
  assert.match(controls, /data-window="30"[^>]*>30 天/);
  assert.match(controls, /id="latestSelectableDate"/);
  assert.match(controls, /id="stageDateTrigger"/);
  assert.match(controls, /id="stageDateRangeLabel">2026-06-14 至 2026-07-13/);
  assert.match(controls, /id="stageDatePopover"[\s\S]*?aria-label="选择统计周期"/);
  assert.match(controls, /id="stageCalendarMonths"/);
  assert.match(controls, /id="applyStageDate"/);
  const observationField = controls.match(/class="stage-filter-field observation-period-field"[\s\S]*?<\/div>[\s\S]*?<\/div>/)?.[0] || '';
  assert.match(observationField, /class="observation-period-inline"[\s\S]*?统计周期[\s\S]*?继续观察[\s\S]*?确认线索状态/);
  assert.doesNotMatch(controls, /class="observation-period-example"/);
  assert.match(script, /statisticsDays: 7/);
  assert.match(script, /state\.stage === "overview" \? state\.statisticsDays : state\.batchDays/);
  assert.match(script, /统计日期已更新为/);
  assert.match(script, /function getStageLatestSelectableDate/);
  assert.match(script, /shiftDate\(DATA_CUTOFF, -state\.windowDays\)/);
  assert.match(script, /function renderStageCalendarPanel/);
  assert.match(script, /date > latest/);
  assert.match(script, /setDefaultStageStartDate\(\)/);
  assert.match(script, /stageEndDate/);
  assert.match(script, /getDateRangeLabel\(state\.stageStartDate, state\.stageEndDate\)/);
  assert.match(script, /const fixedStartDate = state\.stageStartDate/);
  assert.match(css, /\.customer-date-presets/);
  assert.match(css, /\.stage-date-popover/);
  assert.match(css, /\.stage-time-controls/);
  assert.match(css, /\.observation-period-inline/);
  assert.match(css, /\.customer-calendar-months[\s\S]*?grid-template-columns: 1fr 1fr/);
  assert.match(css, /\.scope-fields[\s\S]*?grid-template-columns: repeat\(5, minmax\(130px, 1fr\)\) minmax\(240px, 1\.25fr\)/);
  assert.match(css, /\.overview-status-filter-menu[\s\S]*?width: 560px/);
  assert.match(css, /\.overview-date-trigger[\s\S]*?width: 100%/);
});

test('页面顶部突出展示核心分析模式并删除原三个大页签', () => {
  assert.match(html, /class="primary-mode-panel"[\s\S]*?核心分析模式[\s\S]*?class="page-mode-switch"[\s\S]*?客群洞察模式[\s\S]*?洞察整体客群特征[\s\S]*?客群对比模式[\s\S]*?比较两组客群差异/);
  assert.ok(html.indexOf('class="primary-mode-panel"') < html.indexOf('class="page-host"'));
  assert.match(html, /id="compareAnalysisTabs"[\s\S]*?邀约客群对比分析[\s\S]*?到店客群对比分析/);
  assert.doesNotMatch(html, /class="stage-control"|class="stage-tabs"|class="stage-tab"/);
  assert.match(html, /<section class="scope-panel" aria-label="经营范围筛选">/);
  assert.doesNotMatch(html, /class="scope-panel card"/);
  assert.doesNotMatch(html, /id="scopeTitle"|id="scopeDescription"|id="resetFilters"/);
  assert.match(script, /pageMode: "insight"/);
  assert.match(script, /\$\$\("\[data-page-mode\]"\)/);
  assert.match(script, /\$\$\("\[data-compare-stage\]"\)/);
  assert.match(css, /\.primary-mode-panel[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.page-mode-switch button[\s\S]*?min-height: 56px/);
  assert.match(css, /\.page-mode-switch button\.active[\s\S]*?background: linear-gradient/);
});

test('客群洞察模式展示首页内容，客群对比模式展示 A/B 分析', () => {
  const overview = html.slice(html.indexOf('id="overviewPage"'), html.indexOf('id="stageAnalysis"'));
  const stageAnalysis = html.slice(html.indexOf('id="stageAnalysis"'));
  assert.doesNotMatch(overview, /data-mode="compare"|data-mode="single"/);
  assert.doesNotMatch(stageAnalysis, /data-mode="compare"|data-mode="single"|单客群洞察/);
  assert.match(script, /if \(state\.stage === "overview"\)[\s\S]*?#stageAnalysis"\)\.hidden = true/);
  assert.match(script, /state\.stage = state\.pageMode === "insight" \? "overview" : "online"/);
});

test('首页概览删除品牌经营总览及指标统计区域', () => {
  const overview = html.slice(html.indexOf('id="overviewPage"'), html.indexOf('id="stageAnalysis"'));
  assert.match(html, /客群洞察模式/);
  assert.doesNotMatch(html, />进入分析 →</);
  assert.doesNotMatch(html, /data-enter-stage/);
  assert.doesNotMatch(overview, /overview-journey|journey-boundary|journey-stage|journey-link/);
  assert.doesNotMatch(overview, /id="onlineCustomers"|id="onlineValidCustomers"|id="arrivalCustomers"/);
  assert.doesNotMatch(overview, /id="offlineCustomers"|id="offlineValidCustomers"|id="offlineResultCustomers"/);
  assert.doesNotMatch(overview, /overview-hero|品牌经营总览|id="overviewTitle"|AI 生成经营摘要/);
  assert.doesNotMatch(script, /\$\("#onlineCustomers"\)|\$\("#offlineCustomers"\)|\$\("#journeyWindowNote"\)/);
  assert.doesNotMatch(script, /overviewTitle|overviewDescription|overviewCompareBadge|generateOverviewAi(?!Summary)|overviewAiResult|getOverviewAiText/);
});

test('客户洞察默认展示五类规则模块，仅按需生成 AI 总结', () => {
  const overview = html.slice(html.indexOf('id="overviewPage"'), html.indexOf('id="stageAnalysis"'));
  assert.match(overview, /id="overviewAiSummary"/);
  assert.match(overview, /id="overviewAiSummaryTitle">客户洞察/);
  assert.match(overview, /id="generateOverviewAiSummary"[\s\S]*?生成 AI 综合判断/);
  assert.doesNotMatch(overview, /class="overview-ai-result-kicker">AI总结/);
  assert.match(overview, /id="overviewAiSummaryLoading"/);
  assert.match(overview, /id="overviewAiSummaryResult">/);
  assert.doesNotMatch(overview, /id="overviewAiSummaryResult" hidden/);
  assert.match(overview, /id="overviewAiExecutive"[\s\S]*?id="generateOverviewAiSummary"[\s\S]*?id="overviewAiExecutiveConclusion" hidden/);
  assert.doesNotMatch(overview, /id="overviewAiEvidenceStats"|id="overviewAiInsightCount"|id="overviewAiCustomerCount"|id="overviewAiEvidenceCount"/);
  assert.ok(overview.indexOf('id="overviewAiExecutive"') < overview.indexOf('id="generateOverviewAiSummary"'));
  assert.match(overview, /id="overviewAiInsightGrid"/);
  assert.doesNotMatch(overview, /AI 自动分析流程|多源数据汇聚|语义聚类|交叉验证|结论生成/);
  assert.doesNotMatch(overview, /collapseOverviewAiSummary|>收起</);
  assert.doesNotMatch(overview, /overview-ai-summary-foot|结论均可回溯/);
  assert.match(overview, /id="overviewAiExecutiveConclusion"/);
  assert.doesNotMatch(overview, /置信度/);
  assert.doesNotMatch(overview, /基于当前筛选/);
  assert.match(script, /function getOverviewRuleInsightData/);
  assert.match(script, /function renderOverviewRuleInsights/);
  assert.match(script, /function renderOverview\(\)[\s\S]*?renderOverviewRuleInsights\(\)/);
  assert.match(script, /function generateOverviewAiSummary/);
  assert.match(script, /function invalidateOverviewAiSummary/);
  ['distribution', 'profile'].forEach((target) => {
    assert.match(script, new RegExp(`target: "${target}"`));
  });
  assert.match(script, /\["product", "policy", "competitor"\]\.map/);
  assert.match(script, /executive: `综合 5 类洞察后/);
  assert.match(script, /setOverviewAiGenerateLabel\("AI 正在生成…"\)/);
  assert.match(script, /setOverviewAiGenerateLabel\("重新生成"\)/);
  assert.doesNotMatch(script, /setOverviewAiGenerateLabel\("重新生成 AI 综合判断"\)/);
  assert.match(script, /5 类规则洞察/);
  assert.match(script, /renderOverviewRuleInsights\(\)[\s\S]*?\$\("#overviewAiExecutiveConclusion"\)\.textContent = data\.executive[\s\S]*?hidden = false/);
  assert.doesNotMatch(script, /overviewAiEvidenceStats|overviewAiInsightCount|overviewAiCustomerCount|overviewAiEvidenceCount/);
  assert.doesNotMatch(script, /overviewAiSummaryCollapsed|collapseOverviewAiSummary/);
  assert.doesNotMatch(script, /overview-ai-insight-source|证据来源 ·/);
  assert.doesNotMatch(script, /overview-ai-executive-item/);
  assert.match(script, /查看明细/);
  assert.doesNotMatch(script, /查看对应洞察|查看明细\s*[→➜]/);
  assert.match(css, /\.overview-ai-summary/);
  assert.doesNotMatch(css, /\.overview-ai-process/);
  assert.doesNotMatch(css, /\.overview-ai-insight-source|\.overview-ai-summary-foot/);
  assert.match(css, /\.overview-ai-evidence-stats/);
  assert.match(css, /#overviewAiExecutiveConclusion[\s\S]*?font-size: 14px/);
  assert.match(css, /#overviewAiSummary \.overview-ai-insight-grid[\s\S]*?grid-template-columns: repeat\(5, minmax\(190px, 1fr\)\)/);
  assert.match(css, /#overviewAiSummary \.overview-ai-insight-card > p[\s\S]*?font-size: 13px/);
  assert.doesNotMatch(css, /\.overview-ai-executive-item/);
});

test('客户标签支持热门标签分布与区域画像矩阵切换', () => {
  const categoryTabs = html.match(/<div class="matrix-category-tabs"[\s\S]*?<\/div>/)?.[0] || '';
  assert.match(html, /id="modelMatrixTitle">客户画像/);
  assert.match(html, /data-insight-view="distribution"[^>]*>热门标签分布/);
  assert.match(html, /data-insight-view="profile"[^>]*>区域画像矩阵/);
  assert.match(html, /id="hotDistributionBody"/);
  assert.match(html, /热门问题/);
  assert.match(script, /matrixView: "distribution"/);
  assert.match(script, /function renderHotDistribution/);
  assert.match(script, /\.slice\(0, 10\)/);
  assert.doesNotMatch(html, /TOP3 占全部抗拒点客户|价格敏感较上期上升/);
  assert.equal((categoryTabs.match(/data-matrix-category=/g) || []).length, 13);
  [
    '抗拒点', '付款方式', '决策阶段', '意向车型', '置换情况', '购车时间', '用车人',
    '客户职业', '对比竞品', '试驾状态', '购车场景', '需求特征', '预算区间'
  ].forEach((label) => assert.match(categoryTabs, new RegExp(label)));
  assert.doesNotMatch(categoryTabs, /更多/);
  assert.match(html, /id="regionModelMatrixHead"/);
  assert.match(html, /id="regionModelMatrixBody"/);
  assert.match(html, /与全国基准差异/);
  assert.doesNotMatch(html, /id="matrixSort"|id="modelMatrixBody"|5 个业务场景<\/th>/);
  assert.match(script, /REGION_MODEL_INSIGHTS/);
  assert.match(script, /华东大区.*华南大区.*华北大区.*华中大区.*西南大区/);
  assert.match(script, /12\.6, 6\.2, 7\.1, 5\.0, 6\.4, 4\.1/);
  assert.match(script, /renderRegionModelMatrix/);
  assert.match(css, /\.region-model-matrix/);
  assert.match(css, /\.heat-high/);
  assert.match(css, /\.insight-view-switch button[\s\S]*?font-size: 14px/);
  assert.match(css, /\.model-matrix \.panel-title p,[\s\S]*?\.deep-insight \.panel-title p[\s\S]*?font-size: 14px/);
  assert.match(css, /\.matrix-category-tabs button[\s\S]*?font-size: 14px/);
  assert.match(css, /\.hot-distribution-table th,[\s\S]*?\.hot-distribution-table td[\s\S]*?font-size: 14px/);
  assert.match(css, /\.hot-analysis-link[\s\S]*?font-size: 14px/);
  assert.match(css, /\.region-model-matrix thead th[\s\S]*?font-size: 14px/);
  assert.match(css, /\.region-model-matrix td \.matrix-label[\s\S]*?font-size: 14px/);
});

test('三主题深度洞察使用 TOP10、评价解构和评价证据三列联动', () => {
  const deepInsight = html.slice(html.indexOf('class="deep-insight card"'), html.indexOf('id="stageAnalysis"'));
  assert.match(deepInsight, /id="deepInsightTitle">深度洞察/);
  assert.match(deepInsight, /data-deep-insight="product"[^>]*>产品深度洞察/);
  assert.match(deepInsight, /data-deep-insight="policy"[^>]*>金融政策深度洞察/);
  assert.match(deepInsight, /data-deep-insight="competitor"[^>]*>竞品深度洞察/);
  assert.match(deepInsight, /id="deepTopList"/);
  assert.match(deepInsight, /id="deepSentimentContent"/);
  assert.match(deepInsight, /id="deepVoiceList" tabindex="0"/);
  assert.match(deepInsight, />TOP10</);
  assert.match(deepInsight, />评价解构</);
  assert.match(deepInsight, />评价证据</);
  assert.match(deepInsight, /认可证据或顾虑证据/);
  assert.doesNotMatch(deepInsight, /机器人|AI客户分析|吸引点|抗性|待判断/);
  assert.match(script, /deepInsight: "product"/);
  assert.match(script, /deepEvidenceType: "positive"/);
  assert.match(script, /DEEP_EVALUATION_LABELS/);
  assert.match(script, /product:[\s\S]*?policy:[\s\S]*?competitor:/);
  assert.match(script, /function renderDeepInsights/);
  assert.match(script, /\["positive", "正向"[\s\S]*?\["neutral", "中性"[\s\S]*?\["negative", "负向"/);
  assert.match(script, /data-deep-topic=/);
  assert.match(script, /aria-label="小结"/);
  assert.doesNotMatch(script, /AI 评价摘要/);
  assert.match(script, /客户认可点/);
  assert.match(script, /客户顾虑点/);
  assert.match(script, /data-evaluation-type=/);
  assert.match(script, /data-deep-evidence-type="positive"/);
  assert.match(script, /data-deep-evidence-type="negative"/);
  assert.match(script, />认可证据</);
  assert.match(script, />顾虑证据</);
  assert.match(script, /type === "positive" \? "正向" : "客户顾虑"/);
  assert.doesNotMatch(script, /同一客户可命中多个评价点/);
  assert.match(script, /state\.deepInsightSelections\[state\.deepInsight\]/);
  assert.match(script, /renderDeepInsights\(\)/);
  assert.match(css, /\.deep-insight-grid[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.deep-sentiment-bar/);
  assert.match(css, /\.deep-ai-evaluation-summary/);
  assert.match(css, /\.deep-evaluation-groups/);
  assert.match(css, /\.deep-sentiment-summary[\s\S]*?border-bottom: 1px solid #e8eef5/);
  assert.match(css, /\.deep-sentiment-bar[\s\S]*?height: 14px[\s\S]*?border-radius: 999px/);
  assert.match(css, /\.deep-sentiment-labels span:nth-child\(2\)[\s\S]*?justify-content: center/);
  assert.match(css, /\.deep-ai-evaluation-summary::before/);
  assert.match(css, /\.deep-evaluation-group > header[\s\S]*?margin-bottom: 12px/);
  assert.match(css, /\.deep-evaluation-groups\s*\{[^}]*flex: 1[^}]*align-items: stretch/);
  assert.match(css, /\.deep-evaluation-group\s*\{[^}]*height: 100%/);
  assert.match(css, /\.deep-evaluation-list\s*\{[^}]*flex: 1[^}]*grid-template-rows: repeat\(3, minmax\(0, 1fr\)\)[^}]*gap: 10px/);
  assert.match(css, /\.deep-evaluation-item\s*\{[^}]*align-content: center/);
  assert.doesNotMatch(css, /\.deep-evaluation-note/);
  assert.match(css, /\.deep-evaluation-group[\s\S]*?border-radius: 12px[\s\S]*?background: #fbfcfe/);
  assert.match(css, /\.deep-evaluation-group\.positive > header::before/);
  assert.match(css, /\.deep-evaluation-group\.negative > header::before/);
  assert.match(css, /\.deep-evaluation-item\.active/);
  assert.match(css, /\.deep-evidence-tabs/);
  assert.match(css, /\.deep-insight-tabs button[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-column-head p[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-topic-main strong[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-topic-value small[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-sentiment-labels span[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-ai-evaluation-summary p[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-evaluation-name\s*\{[^}]*grid-column: 1 \/ -1/);
  assert.match(css, /\.deep-evaluation-name strong\s*\{[^}]*font-size: 14px[^}]*white-space: normal/);
  assert.doesNotMatch(css, /\.deep-evaluation-name strong\s*\{[^}]*text-overflow: ellipsis/);
  assert.match(css, /\.deep-evaluation-metric\s*\{[^}]*grid-row: 2/);
  assert.match(css, /\.deep-evaluation-change\s*\{[^}]*grid-row: 2 \/ 4/);
  assert.match(css, /\.deep-evaluation-metric small[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-evidence-tabs button[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-voice-item blockquote[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-voice-item footer[\s\S]*?font-size: 14px/);
  assert.match(css, /\.deep-insight-grid[\s\S]*?height: 680px/);
  assert.match(script, /class="deep-evidence-marquee" aria-label="评价证据弹幕，自动向上滚动，悬停或聚焦暂停"/);
  assert.match(script, /class="deep-evidence-copy"[\s\S]*?class="deep-evidence-copy" aria-hidden="true"/);
  assert.match(css, /\.deep-evidence-track[\s\S]*?animation: deep-evidence-marquee 32s linear infinite/);
  assert.match(css, /\.deep-voice-list:hover \.deep-evidence-track,[\s\S]*?animation-play-state: paused/);
  assert.match(css, /@keyframes deep-evidence-marquee/);
  assert.match(css, /\.deep-voice-item[\s\S]*?min-height: 92px/);
  assert.match(css, /\.deep-voice-item/);
  assert.doesNotMatch(script, /class="deep-voice-track"/);
  assert.doesNotMatch(css, /@keyframes deep-voice-carousel/);
});

test('客户洞察入口使用客户洞察名称', () => {
  const activeNav = html.match(/<a class="nav-item active"[\s\S]*?<\/a>/)?.[0] || '';
  assert.match(activeNav, /<span class="nav-text">客户洞察<\/span>/);
  assert.doesNotMatch(activeNav, /<span class="nav-text">首页<\/span>/);
});

test('区域车型矩阵只展示顶部所选品牌和车型', () => {
  assert.match(script, /const brandModels = getOverviewBrand\(\)\.models\.map/);
  assert.match(script, /selectedModel === "all"[\s\S]*?\? brandModels[\s\S]*?: brandModels\.filter/);
  assert.doesNotMatch(script, /const allModels = REGION_MODEL_INSIGHTS\.models/);
  assert.match(script, /"传祺 GS8", "传祺 ES9"/);
});

test('区域车型矩阵展示客户占比，区域默认每页10条并支持车型横向滑动', () => {
  assert.match(html, /id="regionModelMatrixTopScroll"/);
  assert.match(html, /id="regionModelMatrixScrollTrack"/);
  assert.match(html, /id="regionModelMatrixScrollThumb"/);
  assert.match(html, /id="regionModelMatrixScroll"/);
  assert.match(html, /class="region-model-matrix-scroll"/);
  assert.match(html, /id="regionModelMatrixPagination"/);
  assert.match(script, /const REGION_MODEL_PAGE_SIZE = 10/);
  assert.match(script, /matrixRegionPage: 1/);
  assert.match(script, /visibleRegions\.slice\(pageStart, pageStart \+ REGION_MODEL_PAGE_SIZE\)/);
  assert.match(script, /matrix-metrics"><b>\$\{customerShare\.toFixed\(2\)\}%<\/b>/);
  assert.doesNotMatch(script, /matrix-customer-share">客户占比/);
  assert.match(script, /共 \$\{visibleRegions\.length\} 个区域/);
  assert.match(script, /"新疆大区"/);
  assert.match(script, /function setupRegionModelHorizontalScroll/);
  assert.match(script, /scroll\.addEventListener\("pointermove"/);
  assert.match(script, /scroll\.scrollLeft = dragState\.startScrollLeft - distance/);
  assert.match(script, /thumb\.addEventListener\("pointermove"/);
  assert.match(script, /new ResizeObserver\(refreshRegionModelHorizontalScroll\)/);
  assert.match(script, /--matrix-content-width/);
  assert.match(css, /\.region-model-matrix-scroll[\s\S]*?overflow-x: auto/);
  assert.match(css, /\.region-model-matrix \{[\s\S]*?width: 100%[\s\S]*?min-width: var\(--matrix-content-width, 880px\)/);
  assert.match(css, /\.matrix-scroll-thumb/);
  assert.match(css, /\.region-model-matrix thead th:first-child,[\s\S]*?position: sticky/);
  assert.match(css, /\.region-model-matrix th,[\s\S]*?height: 58px/);
  assert.match(css, /\.region-model-matrix td \.matrix-label[\s\S]*?font-size: 14px/);
  assert.match(css, /\.matrix-pagination/);
});

test('A/B 客群对比页统一按手选线索状态分组', () => {
  const stageAnalysis = html.slice(html.indexOf('id="stageAnalysis"'));
  assert.doesNotMatch(stageAnalysis, /class="analysis-config card"|id="analysisConfigTitle"|id="analysisRuleText"|id="evidenceWindowLabel"/);
  assert.doesNotMatch(stageAnalysis, /class="ai-pill">AI · 1\.0 新增/);
  assert.match(stageAnalysis, /id="comparisonTitle">客群对比分析</);
  assert.match(stageAnalysis, /id="groupAName">已预约到店、已邀约到店、到店跟进中</);
  assert.match(stageAnalysis, /id="groupBName">未跟进、战败已通过\(未到店\)</);
  assert.match(stageAnalysis, /id="aiTitle">A\/B 对比洞察</);
  assert.match(stageAnalysis, /id="comparisonDesc">A\/B 客群按“观测 7 天 \+ 用户选中的线索状态”定义/);
  assert.match(stageAnalysis, /id="aiDesc">基于客户画像、区域画像、产品、金融政策与竞品五个维度/);
  assert.match(script, /title: "客群对比分析"/);
  assert.match(script, /\$\{a\.name\} vs \$\{b\.name\}/);
  assert.doesNotMatch(script, /name: `\$\{state\.windowDays\}日内(?:已到店|未到店)`/);
  assert.match(script, /function getCurrentStatusGroups/);
  assert.match(script, /const selectedGroups = getCurrentStatusGroups\(\)/);
  assert.doesNotMatch(script, /analysisConfigTitle|analysisRuleText|evidenceWindowLabel/);
  assert.match(html, /id="comparisonStatusFilterField" hidden[\s\S]*?线索状态对比筛选[\s\S]*?id="editGroupsButton"[\s\S]*?id="comparisonStatusFilterSummary"/);
  assert.ok(html.indexOf('id="comparisonStatusFilterField"') < html.indexOf('id="stageTimeControls"'));
  assert.doesNotMatch(stageAnalysis, /comparison-primary-action|立即筛选|优先配置 A\/B 对比客群/);
  assert.match(stageAnalysis, /id="groupAValue"[\s\S]*?<span>可分析样本数<\/span>/);
  assert.match(stageAnalysis, /id="groupBValue"[\s\S]*?<span>可分析样本数<\/span>/);
  assert.doesNotMatch(stageAnalysis, /class="sample-grid"|当前客群样本说明|id="journeySample"|id="overlapButton"/);
  assert.doesNotMatch(script, /journeySample|totalSample|validSample|recordingSample|overlapSample|overlapButton/);
});

test('A/B 客群默认展示五维规则模块，仅按需生成 AI 综合判断', () => {
  const stageAnalysis = html.slice(html.indexOf('id="stageAnalysis"'));
  assert.match(stageAnalysis, /class="ai-brief overview-ai-summary compare-ai-summary card"/);
  assert.match(stageAnalysis, /id="compareAiSummaryStatus"/);
  assert.match(stageAnalysis, /id="aiTitle">A\/B 对比洞察/);
  assert.match(stageAnalysis, /id="generateAiButton"[^>]*>[\s\S]*?生成 AI 综合判断/);
  assert.match(stageAnalysis, /id="compareAiSummaryLoading"[\s\S]*?客户画像、区域画像、产品、金融政策、竞品与客户原声/);
  assert.match(stageAnalysis, /id="aiResult">[\s\S]*?id="compareAiExecutive"[\s\S]*?id="generateAiButton"[\s\S]*?id="aiExecutiveConclusion" hidden/);
  assert.match(stageAnalysis, /id="compareAiEvidenceStats"[\s\S]*?hidden/);
  assert.ok(stageAnalysis.indexOf('id="compareAiExecutive"') < stageAnalysis.indexOf('id="generateAiButton"'));
  assert.doesNotMatch(stageAnalysis, /id="aiResult" hidden/);
  assert.doesNotMatch(stageAnalysis, /AI 自动分析流程|多源数据汇聚|语义聚类|交叉验证|结论生成/);
  assert.doesNotMatch(stageAnalysis, /overview-ai-summary-foot|结论均可下钻/);
  assert.match(stageAnalysis, /id="compareAiCustomerCount"/);
  assert.match(stageAnalysis, /id="compareAiRecordingCount"/);
  assert.doesNotMatch(stageAnalysis, /id="compareAiGroupCount"/);
  assert.doesNotMatch(stageAnalysis, /置信度/);
  assert.match(stageAnalysis, /class="overview-ai-insight-grid compare-ai-insight-grid" id="aiSummaryList"/);
  assert.match(stageAnalysis, /id="workspaceTitle">五维对比明细/);
  ["客户画像对比", "区域画像对比", "产品对比", "金融政策对比", "竞品对比"].forEach((label) => {
    assert.match(stageAnalysis, new RegExp(label));
  });
  assert.match(stageAnalysis, /id="differenceInsightList"/);
  assert.match(stageAnalysis, /data-voice-group="a"[\s\S]*?data-voice-group="b"/);
  assert.match(stageAnalysis, /A 向左、B 向右，共用中间基准线/);
  assert.match(stageAnalysis, /差异表示两组客群中的相关性差别，不直接代表因果关系/);
  assert.doesNotMatch(stageAnalysis, /id="aiEmpty"|class="ai-empty"|id="regenerateButton"/);
  assert.match(script, /const COMPARE_DIMENSIONS = \[[\s\S]*?topic: "profile"[\s\S]*?topic: "region"[\s\S]*?topic: "product"[\s\S]*?topic: "policy"[\s\S]*?topic: "competitor"/);
  assert.match(script, /const COMPARE_DATA = \{/);
  assert.match(script, /function getCompareRuleInsightItems/);
  assert.match(script, /function renderCompareRuleInsights/);
  assert.match(script, /function renderDifferenceInsights/);
  assert.match(script, /function invalidateCompareAiSummary/);
  assert.match(script, /setCompareAiGenerateLabel\("AI 正在生成…"\)/);
  assert.match(script, /setCompareAiGenerateLabel\("重新生成 AI 综合判断"\)/);
  assert.match(script, /renderCompareRuleInsights\(\)[\s\S]*?\$\("#aiExecutiveConclusion"\)\.textContent = `综合客户画像、区域画像、产品、金融政策与竞品 5 个维度后/);
  assert.match(script, /\$\("#aiExecutiveConclusion"\)\.hidden = true[\s\S]*?\$\("#compareAiEvidenceStats"\)\.hidden = true/);
  assert.match(script, /compareAiSummaryGenerated = true/);
  assert.match(script, /class="overview-ai-insight-card"/);
  assert.match(script, /class="compare-insight-metric \$\{item\.winner\}"/);
  assert.match(script, /class="mirror-comparison"[\s\S]*?class="mirror-half a"[\s\S]*?class="mirror-axis"[\s\S]*?class="mirror-half b"/);
  assert.doesNotMatch(script, /class="dual-track"|class="track-line/);
  assert.doesNotMatch(script, /overview-ai-insight-source|证据来源 ·/);
  assert.doesNotMatch(script, /客户需求差异|阶段难点差异|销售动作差异|竞品信号差异|4 个方面后/);
  assert.match(script, /data-ai-topic="\$\{item\.topic\}"[^>]*data-ai-row="\$\{item\.row\}"[^>]*>查看明细</);
  assert.doesNotMatch(script, /查看对应数据/);
  assert.match(css, /\.compare-ai-summary \.compare-ai-insight-grid \{[\s\S]*?repeat\(5/);
  assert.match(css, /\.difference-panel/);
  assert.match(css, /\.voice-group-switch/);
  assert.match(css, /\.mirror-comparison/);
  assert.match(css, /\.mirror-bars \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 2px minmax\(0, 1fr\)/);
  assert.doesNotMatch(css, /\.dual-track|\.track-line/);
  assert.match(css, /#aiExecutiveConclusion[\s\S]*?font-size: 14px/);
  assert.match(css, /\.compare-ai-summary \.overview-ai-insight-card > p[\s\S]*?font-size: 13px/);
});

test('洞察筛选与邀约、门店对比共用完整线索状态', () => {
  const statusBlock = script.match(/const STATUS_OPTIONS = \[([\s\S]*?)\];/)?.[1] || '';
  const statuses = [
    '下订单', '到店跟进中', '已下定', '已预约到店', '已邀约到店', '异地', '战败',
    '战败已通过(已到店)', '战败已通过(未到店)', '战败申请中(已到店)',
    '战败申请中(未到店)', '无效', '无效申请中', '有效', '未跟进',
    '终端成交', '继续邀约', '跟进中'
  ];
  statuses.forEach((status) => assert.match(statusBlock, new RegExp(`"${status.replace(/[()]/g, '\\$&')}"`)));
  assert.equal((statusBlock.match(/"/g) || []).length / 2, statuses.length);
  assert.match(html, /id="overviewStatusFilterField"[\s\S]*?线索状态[\s\S]*?id="overviewStatusFilterSummary">全部线索状态（18）/);
  assert.match(html, /id="overviewStatusOptions"/);
  assert.match(script, /overviewStatuses: new Set\(STATUS_OPTIONS\)/);
  assert.match(script, /function renderOverviewStatusFilter/);
  assert.match(script, /function getOverviewStatusScale/);
  assert.match(script, /getOverviewStatusScale\(\)/);
  assert.match(script, /\$\("#overviewStatusOptions"\)\.addEventListener\("change"/);
  assert.match(html, /线索状态对比筛选[\s\S]*?id="editGroupsButton"/);
  assert.match(html, /id="groupModalTitle">选择 A\/B 客群线索状态</);
  assert.match(html, /id="groupModalKicker"/);
  assert.match(script, /groups: \{[\s\S]*?online: \{[\s\S]*?offline: \{/);
  assert.match(script, /state\.groups\[state\.stage\]/);
  assert.match(script, /offline: \{[\s\S]*?a: new Set\(\["下订单"\]\)[\s\S]*?b: new Set\(\["战败"\]\)/);
  assert.match(script, /: "下订单 <b>vs<\/b> 战败"/);
  assert.match(script, /\$\("#comparisonStatusFilterField"\)\.hidden = isInsightMode/);
  assert.match(script, /function updateComparisonStatusFilterSummary/);
  assert.match(script, /`A组 \$\{a\.length\} 项 vs B组 \$\{b\.length\} 项`/);
  assert.match(script, /state\.stage === "online"[\s\S]*?已预约到店[\s\S]*?已邀约到店[\s\S]*?到店跟进中[\s\S]*?未跟进[\s\S]*?战败已通过\(未到店\)/);
  assert.doesNotMatch(script, /offlineCustom|offlineConfigured/);
  assert.match(script, /const OFFLINE_STATUS_DATA = \{/);
  assert.match(script, /const buildGroup = \(key\) =>/);
  assert.match(script, /aria-pressed="\$\{selected\}"/);
});

test('区域车型分布不再提供单独的 AI 生成关键洞察', () => {
  assert.doesNotMatch(html, /id="generateRegionModelAi"|id="regionModelAiInsight"|画像洞察关键结论/);
  assert.doesNotMatch(script, /regionModelAiGenerationId|renderRegionModelAiInterpretation|resetRegionModelAiInterpretation/);
  assert.doesNotMatch(css, /\.matrix-ai-interpretation|\.matrix-ai-head/);
  assert.match(html, /id="generateOverviewAiSummary"/);
});

test('点击矩阵单元格展示影响客户、场景分布、趋势和原声', () => {
  assert.match(script, /data-matrix-cell=/);
  assert.match(script, /function openRegionModelInsightDrawer/);
  assert.match(script, /影响客户/);
  assert.match(script, /场景分布/);
  assert.match(script, /近 6 周趋势/);
  assert.match(script, /客户原声/);
  assert.match(css, /\.matrix-impact-summary/);
  assert.match(css, /\.matrix-scene-list/);
  assert.match(css, /\.matrix-trend-chart/);
  assert.match(css, /\.matrix-voice-list/);
});

test('经营范围增加默认全选的业务场景筛选', () => {
  const filter = html.match(/<div class="scope-field scene-filter">[\s\S]*?<\/details>[\s\S]*?<\/div>/)?.[0] || '';
  assert.match(filter, />业务场景</);
  assert.match(filter, /全部业务场景（5）/);
  assert.equal((filter.match(/type="checkbox"/g) || []).length, 5);
  assert.equal((filter.match(/checked/g) || []).length, 5);
  assert.match(filter, /<strong>邀约场景<\/strong>[\s\S]*?首触跟进[\s\S]*?邀约到店[\s\S]*?排程确认/);
  assert.match(filter, /<strong>门店场景<\/strong>[\s\S]*?门店接待[\s\S]*?试乘试驾/);
  assert.match(script, /scenes: new Set\(SCENE_VALUES\)/);
  assert.match(script, /function setDefaultScenesForStage/);
  assert.match(script, /STAGE_SCENES\.offline : STAGE_SCENES\.online/);
  assert.match(script, /updateSceneFilterSummary/);
});

test('经营范围筛选会统一刷新概览和阶段分析内容', () => {
  assert.match(script, /function getOrgScale/);
  assert.match(script, /function getSceneScale/);
  assert.match(script, /function getModelScale/);
  assert.match(script, /function getScopeLabel/);
  assert.match(script, /state\.scenes\.size \/ SCENE_VALUES\.length/);
  assert.match(script, /renderDeepInsights\(\)/);
  assert.match(script, /renderRegionModelMatrix\(selectedModel\)/);
  assert.match(script, /\$\$\("\.scope-fields select"\)[\s\S]*?renderStage\(\)/);
  assert.match(script, /\$\$\("#sceneFilter input\[type='checkbox'\]"\)[\s\S]*?renderStage\(\)/);
  assert.match(script, /当前阶段未选择业务场景，暂无信号数据/);
  assert.match(css, /\.analysis-filter-empty/);
});

test('客户洞察统一使用邀约场景和门店场景名称', () => {
  assert.match(html, /<strong>邀约场景<\/strong>/);
  assert.match(html, /<strong>门店场景<\/strong>/);
  assert.doesNotMatch(html, /线上邀约|线下接待/);
  assert.doesNotMatch(script, /线上邀约|线下接待/);
});
