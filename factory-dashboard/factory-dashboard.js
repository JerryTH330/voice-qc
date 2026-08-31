/* Generated from /Users/linxianxin/Downloads/厂端看板/factory-v2.* for native SPA route. */
(function () {
  const buildFactoryMockRecordingId = (sequence = 0) => `2087346${String(17925713920 + Number(sequence || 0)).padStart(12, '0')}`;
  const normalizeFactoryMockRecordingId = (value) => {
    const safeValue = String(value || '').trim();
    const legacyMatch = safeValue.match(/^R-(\d+)$/i);
    return legacyMatch ? buildFactoryMockRecordingId(700000 + Number(legacyMatch[1])) : safeValue;
  };
  const FILTER_UTILS = window.__dashboardFilterUtils;
  const FACTORY_HERO_UTILS = window.__factoryHeroUtils || {};
  const ISSUE_RULE_ANALYSIS_UTILS = window.__factoryIssueRuleAnalysisUtils || {};
  const MULTI_SELECT_FILTER_UTILS = window.__factoryMultiSelectFilterUtils || {};
  const {
    SOURCE_KEYS,
    SCENE_KEYS,
    getAllowedScenes,
    normalizeSceneSelection,
    setSourceSelection,
    toggleSceneSelection,
    getInvitationSceneCount,
    getSceneVolumeLabel,
    getSceneLabel,
    getRecordingSourceVisibility
  } = FILTER_UTILS;
  const {
    getFactoryHeroSubtitle = (profile) => String(profile?.organization || profile?.region || '').trim(),
    buildFactoryRecordingSummary
  } = FACTORY_HERO_UTILS;
  const {
    sortIssueOrgRows = (rows) => (Array.isArray(rows) ? [...rows] : []),
    aggregateIssueRulesByScenes = (rules) => (Array.isArray(rules) ? [...rules] : [])
  } = ISSUE_RULE_ANALYSIS_UTILS;
  const {
    renderCheckboxFilterOptionsMarkup: renderSharedCheckboxFilterOptionsMarkup,
    renderInlineCheckboxFilterGroupMarkup: renderSharedInlineCheckboxFilterGroupMarkup
  } = MULTI_SELECT_FILTER_UTILS;

  const escapeFilterMarkupHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderFilterMarkupAttrs = (attrs) => {
    if (!attrs || typeof attrs !== 'object') return '';
    return Object.entries(attrs).map(([key, value]) => {
      if (value === false || value === null || typeof value === 'undefined') return '';
      if (value === true) return ` ${escapeFilterMarkupHtml(key)}`;
      return ` ${escapeFilterMarkupHtml(key)}="${escapeFilterMarkupHtml(value)}"`;
    }).join('');
  };

  const fallbackRenderCheckboxFilterOptionsMarkup = ({
    options = [],
    buttonClassName = '',
    checkClassName = '',
    textClassName = '',
    getOptionMeta
  }) => (Array.isArray(options) ? options : []).map((option, index) => {
    const safeOption = option || {};
    const meta = typeof getOptionMeta === 'function' ? (getOptionMeta(safeOption, index) || {}) : {};
    const className = [buttonClassName, meta.className].filter(Boolean).join(' ').trim();
    const label = safeOption.label ?? safeOption.text ?? safeOption.value ?? '';
    return `
      <button type="button" class="${escapeFilterMarkupHtml(className)}"${renderFilterMarkupAttrs(meta.attrs)}>
        <span class="${escapeFilterMarkupHtml(checkClassName)}" aria-hidden="true"></span>
        <span class="${escapeFilterMarkupHtml(textClassName)}">${escapeFilterMarkupHtml(label)}</span>
      </button>
    `;
  }).join('');

  const fallbackRenderInlineCheckboxFilterGroupMarkup = ({
    rootClassName = '',
    label = '',
    labelClassName = '',
    tabsId = '',
    tabsClassName = '',
    tabsAriaLabel = '',
    optionsMarkup = ''
  }) => `
    <div class="${escapeFilterMarkupHtml(rootClassName)}">
      <span class="${escapeFilterMarkupHtml(labelClassName)}">${escapeFilterMarkupHtml(label)}</span>
      <div class="${escapeFilterMarkupHtml(tabsClassName)}" id="${escapeFilterMarkupHtml(tabsId)}" role="group" aria-label="${escapeFilterMarkupHtml(tabsAriaLabel || label)}">
        ${String(optionsMarkup || '')}
      </div>
    </div>
  `;

  const renderCheckboxFilterOptionsMarkup = typeof renderSharedCheckboxFilterOptionsMarkup === 'function'
    ? renderSharedCheckboxFilterOptionsMarkup
    : fallbackRenderCheckboxFilterOptionsMarkup;
  const renderInlineCheckboxFilterGroupMarkup = typeof renderSharedInlineCheckboxFilterGroupMarkup === 'function'
    ? renderSharedInlineCheckboxFilterGroupMarkup
    : fallbackRenderInlineCheckboxFilterGroupMarkup;
  const FACTORY_DASHBOARD_HTML = `<section class="factory-filter-panel factory-filter-sticky-body global-filter-bar session-filter-card" aria-label="全局筛选">
    <div class="store-filter-shell session-filter-toolbar">
      <div class="session-filter-row session-filter-row-segment factory-filter-row-segment factory-filter-row-segment-primary">
        <div class="gf-group store-filter-box session-toolbar-control session-toolbar-segment-control factory-toolbar-control-brand">
          <span class="gf-label">品牌</span>
          <div class="gf-tabs todo-filter-tabs" id="gf-brand" role="group" aria-label="品牌">
            <button class="gf-tab todo-filter-tab active" data-brand="all" aria-pressed="true">全部</button>
            <button class="gf-tab todo-filter-tab" data-brand="传祺" aria-pressed="false">传祺</button>
            <button class="gf-tab todo-filter-tab" data-brand="埃安" aria-pressed="false">埃安</button>
          </div>
        </div>
        <div id="factoryOrgControlSlot" class="factory-org-control-slot"></div>
      </div>
      <div class="session-filter-row session-filter-row-segment factory-filter-row-segment factory-filter-row-segment-secondary">
        <div id="factorySceneFilterSlot"></div>
        <div class="gf-group gf-time-group store-filter-box session-toolbar-control session-toolbar-segment-control store-toolbar-control-time">
          <span class="gf-label">时间</span>
          <div class="gf-tabs todo-filter-tabs" id="gf-time" role="group" aria-label="时间">
            <button class="gf-tab todo-filter-tab active" data-time="1" aria-pressed="true">昨日</button>
            <button class="gf-tab todo-filter-tab" data-time="7" aria-pressed="false">近7天</button>
            <button class="gf-tab todo-filter-tab" data-time="15" aria-pressed="false">近半月</button>
            <button class="gf-tab todo-filter-tab" data-time="30" aria-pressed="false">近1月</button>
            <button class="gf-tab gf-tab-custom todo-filter-tab" data-time="custom" id="gf-custom-btn" aria-pressed="false">自定义</button>
          </div>
        </div>
        <div class="store-date-popover-anchor" id="store-date-control"></div>
      </div>
      <div class="session-filter-row session-filter-row-main factory-filter-row-main">
        <div class="gf-group store-filter-box session-toolbar-control session-toolbar-menu session-toolbar-control-car store-model-dropdown factory-model-dropdown" id="factory-model-dropdown">
          <span class="gf-label">车系</span>
          <button type="button" class="store-model-trigger session-select-trigger" id="factory-model-trigger" aria-haspopup="listbox" aria-expanded="false">
            <strong id="factory-model-display">全部车系</strong>
            <span class="store-model-caret session-select-caret"></span>
          </button>
          <div class="store-model-panel session-menu-panel" id="factory-model-panel">
            <div class="session-menu-option-list">
              <button type="button" class="store-model-option session-menu-option active" data-model="all"><span>全部车系</span></button>
              <button type="button" class="store-model-option session-menu-option" data-model="M8"><span>传祺M8</span></button>
              <button type="button" class="store-model-option session-menu-option" data-model="S7"><span>传祺S7</span></button>
              <button type="button" class="store-model-option session-menu-option" data-model="GS8"><span>传祺GS8</span></button>
              <button type="button" class="store-model-option session-menu-option" data-model="E8"><span>传祺E8</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="dashboard-content">
    <section class="hero-panel fade-in" aria-label="厂端核心指标">
      <div class="hero-kpi-grid hero-metrics store-hero-metrics" id="hero-kpi-grid" aria-label="厂端关键指标">
        <svg class="hero-funnel-svg" id="hero-funnel-svg" aria-hidden="true"></svg>
      </div>
    </section>
    <main>
      <section class="main-panel active" id="panel-sop-execution" aria-label="SOP执行质检">
        <div class="tab-dual-grid">
          <div class="tab-left-stack">
            <section class="track sop-overview-track" aria-label="质检概览">
              <div class="track-header">
                <div class="track-header-main">
                  <span class="sop-overview-heading-media" aria-hidden="true">
                    <img class="sop-overview-heading-image" src="../assets/lead-customer-insight-figma-533-8804.png" alt="" aria-hidden="true">
                  </span>
                  <div class="sop-overview-heading-copy">
                    <h2 class="track-title">质检概览</h2>
                    <p class="track-sub">质检合格率 · 质检小结</p>
                  </div>
                </div>
              </div>
              <div class="track-body">
                <div class="sop-overview-grid">
                  <div class="sop-overview-primary-row">
                    <div id="sop-ai-summary" class="sop-ai-summary">
                      <span class="hint-text">全品牌SOP执行整体平稳，竞品对比话术和试驾邀约环节仍是最大短板。</span>
                    </div>
                    <div class="sop-metric-row">
                      <div class="sop-metric-panel sop-metric-panel-store">
                        <div class="sop-metric-card sop-metric-card-store">
                          <div class="sop-metric-card-content">
                            <div class="sop-metric-label">质检合格率</div>
                            <div class="sop-metric-score-wrap">
                              <div class="sop-metric-score" id="sop-score-val">82<span>%</span></div>
                              <div class="sop-period-change up" id="sop-period-change"><span class="sop-period-change-value">环比 +3%</span></div>
                            </div>
                          </div>
                        </div>
                        <span class="sop-metric-tail" aria-hidden="true">
                          <img src="../assets/store-quality-overview/store-tail.svg" alt="">
                        </span>
                      </div>
                      <div class="sop-metric-panel sop-metric-panel-zone">
                        <div class="sop-metric-card sop-metric-card-zone">
                          <div class="sop-metric-card-content">
                            <div class="sop-metric-label">全国均值</div>
                            <div class="sop-metric-score-wrap">
                              <div class="sop-metric-score sop-metric-score-zone"><strong id="sop-national-avg" class="sop-metric-value">73</strong><span>%</span></div>
                            </div>
                          </div>
                        </div>
                        <span class="sop-metric-tail" aria-hidden="true">
                          <img src="../assets/store-quality-overview/zone-tail.svg" alt="">
                        </span>
                      </div>
                      <div class="sop-metric-vs" aria-hidden="true">
                        <img class="sop-metric-vs-image" src="../assets/store-quality-overview/comparison-vs.png" alt="" aria-hidden="true">
                      </div>
                      <div class="sop-improve up" id="sop-national-diff">
                        <span class="sop-improve-copy">
                          <span class="sop-improve-label sop-national-diff-label">+</span>
                          <span class="sop-improve-value sop-national-diff-value">9%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="summary-list">
                  <div class="summary-item success" id="sop-summary-trend">
                    <span class="summary-item-icon-shell" aria-hidden="true">
                      <img class="summary-item-icon" src="../assets/store-quality-overview/summary-strength.png" alt="" aria-hidden="true">
                    </span>
                    <div class="summary-item-copy">
                      <strong id="sop-summary-trend-title">优势发掘</strong>
                      <span id="sop-summary-trend-text">需求挖掘、接待礼仪、客户异议处理等环节表现突出，可作为团队培训样本。</span>
                    </div>
                  </div>
                  <div class="summary-item warning" id="sop-summary-weakness">
                    <span class="summary-item-icon-shell" aria-hidden="true">
                      <img class="summary-item-icon" src="../assets/store-quality-overview/summary-weakness.png" alt="" aria-hidden="true">
                    </span>
                    <div class="summary-item-copy">
                      <strong>短板改善</strong>
                      <span id="sop-summary-weakness-text">竞品对比、试驾邀约、需求深挖三项未命中率仍高。</span>
                    </div>
                  </div>
                  <div class="summary-item danger" id="sop-summary-risk">
                    <span class="summary-item-icon-shell" aria-hidden="true">
                      <img class="summary-item-icon" src="../assets/store-quality-overview/summary-risk.png" alt="" aria-hidden="true">
                    </span>
                    <div class="summary-item-copy">
                      <strong>风险管控</strong>
                      <span id="sop-summary-risk-text">超授权优惠和贬低竞品话术需纳入红线提醒。</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="track sop-rank-track" aria-label="SOP执行排行">
              <div class="section-title-bar">
                <div>
                  <h2 class="section-title" id="rank-title">SOP执行排行</h2>
                  <p class="section-sub" id="rank-sub">支持下钻：大区-战区-门店，默认按照SOP执行合格率降序排列</p>
                </div>
                <button type="button" class="rank-action-btn" id="rank-expand-toggle" hidden>一键展开</button>
              </div>
              <div class="track-body">
                <div id="rank-table-wrap"></div>
              </div>
            </section>
          </div>

          <div class="tab-right-stack issue-sop-analysis-wrapper" aria-label="SOP执行分析">
            <div class="card-header">
              <div>
                <div class="card-title">SOP执行分析</div>
                <div class="card-sub">从规则维度查看各组织、各场景的 SOP 命中表现。</div>
              </div>
            </div>
            <div class="issue-detail-section">
              <section class="track issue-detail-card active" id="detail-sop-analysis" role="tabpanel" aria-label="规则命中分析">
                <div class="store-section-content issue-detail-content">
                  <div class="issue-detail-pad">
                    <div id="issue-sop-analysis-root" class="issue-rule-analysis-root"></div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="tab-right-stack issue-overview-wrapper" aria-label="问题概览与明细">
            <div class="card-header">
              <div>
                <div class="card-title">顾问行为洞察</div>
                <div class="card-sub">从录音中识别顾问的优势、短板与风险行为。</div>
              </div>
            </div>
            <div class="issue-insight-controls">
              <div class="issue-insight-tabs" role="tablist" aria-label="顾问行为洞察类型">
                <button type="button" class="issue-insight-tab active" data-issue-insight-tab="advantage" role="tab" aria-selected="true">优势项识别</button>
                <button type="button" class="issue-insight-tab" data-issue-insight-tab="defect" role="tab" aria-selected="false">短板项识别</button>
                <button type="button" class="issue-insight-tab" data-issue-insight-tab="risk" role="tab" aria-selected="false">风险命中分析</button>
              </div>
              <div class="issue-insight-sort-host" id="issue-insight-sort-host"></div>
            </div>
            <div class="issue-detail-section">
              <section class="track issue-detail-card active" id="detail-rule-analysis" role="tabpanel" aria-label="规则命中分析">
                <div class="store-section-content issue-detail-content">
                  <div class="issue-detail-pad">
                    <div id="issue-rule-analysis-root" class="issue-rule-analysis-root"></div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <section class="track trend-section store-trend-card" aria-label="SOP执行趋势分布图">
          <div class="store-section-content store-trend-content">
            <div class="trend-header">
              <div>
                <h2 class="section-title">SOP执行趋势分布图</h2>
                <p class="section-sub">质检合格率vs全国质检合格率</p>
              </div>
            </div>
            <div class="trend-chart-wrap">
              <canvas id="factory-trendChart" aria-label="SOP执行趋势分布图" role="img"></canvas>
            </div>
            <div class="sales-trend-footer store-trend-footer">
              <div class="trend-legend chart-legend" id="chart-legend"></div>
            </div>
          </div>
        </section>
      </section>

    </main>
  </div>`;

  window.destroyFactoryDashboardPage = function destroyFactoryDashboardPage() {
    if (window.__factoryDashboardClockTimer) {
      window.clearInterval(window.__factoryDashboardClockTimer);
      window.__factoryDashboardClockTimer = null;
    }
    if (window.__factoryDashboardOrgOutsideHandler) {
      document.removeEventListener('click', window.__factoryDashboardOrgOutsideHandler, true);
      window.__factoryDashboardOrgOutsideHandler = null;
    }
  };

  window.initFactoryDashboardPage = function initFactoryDashboardPage() {
    const mount = document.getElementById('factoryDashboardMount');
    const factoryPage = document.querySelector('.factory-dashboard-page');
    if (!mount || !factoryPage) return;
    window.destroyFactoryDashboardPage?.();
    mount.innerHTML = FACTORY_DASHBOARD_HTML;


  // ══════════════════════════════════════════════════
  // 1. 组织架构数据（大区 → 战区 → 门店，三级级联）
  // ══════════════════════════════════════════════════
  const ORG_TREE = {
    '华南大区': {
      '广州战区': ['广州白云店', '广州天河店', '广州番禺店', '广州增城店'],
      '深圳战区': ['深圳南山店', '深圳龙华店', '深圳宝安店'],
      '佛山战区': ['佛山禅城店', '佛山南海店'],
      '东莞战区': ['东莞莞城店', '东莞虎门店', '东莞长安店']
    },
    '华东大区': {
      '上海战区': ['上海浦东店', '上海闵行店', '上海嘉定店', '上海松江店'],
      '杭州战区': ['杭州西湖店', '杭州余杭店', '杭州萧山店'],
      '南京战区': ['南京江宁店', '南京建邺店'],
      '苏州战区': ['苏州工业园店', '苏州吴中店', '苏州昆山店']
    },
    '华北大区': {
      '北京战区': ['北京朝阳店', '北京海淀店', '北京丰台店', '北京通州店'],
      '天津战区': ['天津滨海店', '天津南开店'],
      '石家庄战区': ['石家庄裕华店', '石家庄长安店'],
      '郑州战区': ['郑州金水店', '郑州中原店', '郑州二七店']
    },
    '华中大区': {
      '武汉战区': ['武汉武昌店', '武汉洪山店', '武汉汉口店'],
      '长沙战区': ['长沙岳麓店', '长沙雨花店', '长沙开福店'],
      '南昌战区': ['南昌红谷店', '南昌青山湖店']
    },
    '西南大区': {
      '成都战区': ['成都武侯店', '成都锦江店', '成都高新店', '成都龙泉驿店'],
      '重庆战区': ['重庆渝北店', '重庆九龙坡店', '重庆南岸店'],
      '昆明战区': ['昆明官渡店', '昆明盘龙店']
    },
    '西北大区': {
      '西安战区': ['西安雁塔店', '西安未央店', '西安长安店'],
      '兰州战区': ['兰州城关店', '兰州安宁店'],
      '乌鲁木齐战区': ['乌鲁木齐天山店']
    },
    '东北大区': {
      '沈阳战区': ['沈阳铁西店', '沈阳皇姑店', '沈阳浑南店'],
      '哈尔滨战区': ['哈尔滨南岗店', '哈尔滨道里店'],
      '长春战区': ['长春朝阳店', '长春南关店']
    }
  };

  const FACTORY_ALL_ORG_VALUE = '全部组织';

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const formatFactoryDateDisplay = (value) => {
    if (!value) {
      return '不限';
    }

    const [year, month, day] = value.split('-');
    return `${year}/${month}/${day}`;
  };

  const formatFactoryMonthLabel = (year, month) => `${year}年${month}月`;

  const parseFactoryDateValue = (value) => {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatFactoryDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFactoryDateCells = (year, month) => {
    const days = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0).getDate();
    const leadingSlots = (firstDay.getDay() + 6) % 7;

    for (let index = 0; index < leadingSlots; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDate; day += 1) {
      days.push(new Date(year, month - 1, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const getFactoryDateRangeText = (startDate, endDate) => `${formatFactoryDateDisplay(startDate)} 至 ${formatFactoryDateDisplay(endDate)}`;

  const buildFactoryOrganizationTree = () => {
    return Object.entries(ORG_TREE).map(([region, zones]) => ({
      label: region,
      path: region,
      children: Object.entries(zones).map(([zone, stores]) => ({
        label: zone,
        path: `${region} > ${zone}`,
        children: stores.map((store) => ({
          label: store,
          path: `${region} > ${zone} > ${store}`,
          children: []
        }))
      }))
    }));
  };

  const sharedOrganizationDirectory = window.AIQCOrganization;
  const getFactoryOrganizationTree = () => sharedOrganizationDirectory
    ? sharedOrganizationDirectory.getRootNodes(factoryOrgDimension, currentBrand === 'all' ? '全部' : currentBrand)
    : buildFactoryOrganizationTree();

  const flattenFactoryOrganizationNodes = (nodes, collection = []) => {
    nodes.forEach((node) => {
      collection.push(node);
      if (node.children && node.children.length) {
        flattenFactoryOrganizationNodes(node.children, collection);
      }
    });
    return collection;
  };

  const getFlatFactoryOrganizationNodes = () => flattenFactoryOrganizationNodes(getFactoryOrganizationTree(), []);

  // ══════════════════════════════════════════════════
  // 2. KPI 数据（全国汇总级 — 复用门店看板模式）
  // ══════════════════════════════════════════════════
  const ALL_KPI_DATA = {
    invitation:    { label: "邀约录音数", num: "6",    unit: "条",  trend: "↑1",    trendDir: "up" },
    reception:     { label: "接待录音数", num: "18",   unit: "条",  trend: "↑3",    trendDir: "up" },
    test_drive:    { label: "试驾录音数", num: "8",    unit: "条",  trend: "↑2",    trendDir: "up" },
    visit_rate:    { label: "到店率",     num: "33.3", unit: "%",   trend: "↑5%",   trendDir: "up",   isRate: true },
    drive_rate:    { label: "试驾率",     num: "44.4", unit: "%",   trend: "↑2%",   trendDir: "up",   isRate: true },
    order_rate:    { label: "下订率",     num: "12.5", unit: "%",   trend: "↑1%",   trendDir: "up",   isRate: true },
    valid_record:  { label: "有效录音",   num: "5",    unit: "条",  trend: "↑1",    trendDir: "up" },
    hit_rate:      { label: "话术执行率", num: "78",   unit: "%",   trend: "↑3%",   trendDir: "up",   isRate: true },
    cover_rate:    { label: "覆盖率",     num: "83.3", unit: "%",   trend: "↑1.3%", trendDir: "up",   isRate: true },
    avg_duration:  { label: "平均时长",   num: "12",   unit: "min", trend: "↑2",    trendDir: "up" },
    qa_pass_count: { label: "质检合格数", num: "4",    unit: "条",  trend: "↑1",    trendDir: "up" },
    qa_pass_rate:  { label: "质检合格率", num: "80",   unit: "%",   trend: "↑2%",   trendDir: "up",   isRate: true },
    risk_record:   { label: "风险录音数", num: "0",    unit: "条",  trend: "↓1",    trendDir: "down", isDanger: false, isSuccess: true },
    risk_rate:     { label: "风险录音率", num: "0",    unit: "%",   trend: "↓2%",   trendDir: "down", isDanger: false, isSuccess: true, isRate: true }
  };

  // 各场景对应的 KPI 显示列表
  const SCENE_KPI_MAP = {
    all: [
      { key: 'invitation', pairedWith: 'visit_rate',   isBiz: true },
      { key: 'reception',  pairedWith: 'drive_rate',   isBiz: true },
      { key: 'test_drive', pairedWith: 'order_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    first_follow: [
      { key: 'invitation', pairedWith: 'visit_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    invite_store: [
      { key: 'invitation', pairedWith: 'visit_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    schedule_confirm: [
      { key: 'invitation', pairedWith: 'visit_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    cloud_multi: [
      { key: 'invitation', pairedWith: 'visit_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    store_reception: [
      { key: 'reception', pairedWith: 'drive_rate',    isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ],
    test_drive: [
      { key: 'test_drive', pairedWith: 'order_rate',   isBiz: true },
      { key: 'avg_duration', pairedWith: 'hit_rate' },
      { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
      { key: 'risk_record', pairedWith: 'risk_rate' }
    ]
  };

  const HERO_METRIC_TONE_MAP = {
    invitation: 'blue',
    visit_rate: 'blue',
    reception: 'cyan',
    drive_rate: 'cyan',
    test_drive: 'green',
    order_rate: 'green',
    avg_duration: 'violet',
    hit_rate: 'fuchsia',
    qa_pass_count: 'emerald',
    qa_pass_rate: 'emerald',
    risk_record: 'red',
    risk_rate: 'red'
  };

  // 执行页录音汇总区使用的业务指标，与已删除的策略洞察无关。
  const SUMMARY_GROUP_METRIC_KEYS = new Set([
    'invitation',
    'reception',
    'test_drive'
  ]);

  const FACTORY_SCENE_FILTER_OPTIONS = [
    { value: SCENE_KEYS.all, label: '全部' },
    { value: SCENE_KEYS.firstFollow, label: '首触跟进' },
    { value: SCENE_KEYS.inviteStore, label: '邀约进店' },
    { value: SCENE_KEYS.scheduleConfirm, label: '排程确认' },
    { value: SCENE_KEYS.storeReception, label: '进店接待' },
    { value: SCENE_KEYS.testDrive, label: '试乘试驾' }
  ];

  // ══════════════════════════════════════════════════
  // 3. 全局状态变量
  // ══════════════════════════════════════════════════
  let currentRegion = 'all';   // 大区
  let currentZone   = 'all';   // 战区
  let currentStore  = 'all';   // 门店
  let currentRole   = 'all';   // 人员角色
  let currentSource = SOURCE_KEYS.all;
  let currentScenes = [SCENE_KEYS.all];
  let currentBrand  = 'all';
  let factoryOrgDimension = 'region';
  let factorySelectedOrgPath = FACTORY_ALL_ORG_VALUE;
  let currentAdvisor = 'all';
  let currentTime   = '1';     // 时间: 1=昨日, 7=近7天, 15=近半月, 30=近1月, custom
  let factoryTimeStartDate = '';
  let factoryTimeEndDate = '';
  let currentModel  = 'all';   // 车型
  const factoryOrgMenuState = {
    open: false,
    dimensionOpen: false,
    draftPath: FACTORY_ALL_ORG_VALUE,
    searchQuery: '',
    searchActive: false
  };
  const factoryDateShortcutOptions = [
    { key: '1', label: '近1天' },
    { key: '7', label: '近7天' },
    { key: '15', label: '近15天' },
    { key: '30', label: '近30天' }
  ];
  const factoryDateState = {
    open: false,
    activeField: 'startDate',
    draftStartDate: '',
    draftEndDate: '',
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth() + 1
  };
  const renderSharedDateRangeControlMarkup = (
    typeof globalThis !== 'undefined'
      && globalThis.__dateFilterComponentUtils
      && typeof globalThis.__dateFilterComponentUtils.renderDateRangeControlMarkup === 'function'
  )
    ? globalThis.__dateFilterComponentUtils.renderDateRangeControlMarkup
    : ({ currentValue, customValue = 'custom', isOpen, startLabel, endLabel, dataNamespace = 'factory-date', rootClassName = 'store-date-root', triggerClassName = 'session-date-trigger store-date-trigger', triggerLabel = '日期范围筛选', menuHtml }) => {
      if (currentValue !== customValue) {
        return '';
      }

      return `
        <div class="${rootClassName}${isOpen ? ' is-open' : ''}" data-${dataNamespace}-root="true">
          <button
            type="button"
            class="${triggerClassName}${isOpen ? ' active' : ''}"
            data-${dataNamespace}-trigger="true"
            aria-label="${triggerLabel}"
            aria-haspopup="dialog"
            aria-expanded="${isOpen ? 'true' : 'false'}"
          >
            <strong>${escapeHtml(startLabel || '未选择')}</strong>
            <em>至</em>
            <strong>${escapeHtml(endLabel || '未选择')}</strong>
            <span class="session-date-icon" aria-hidden="true"></span>
          </button>
          ${isOpen ? String(menuHtml || '') : ''}
        </div>
      `;
    };
  const renderSharedDateRangePanelMarkup = (
    typeof globalThis !== 'undefined'
      && globalThis.__dateFilterComponentUtils
      && typeof globalThis.__dateFilterComponentUtils.renderDateRangePanelMarkup === 'function'
  )
    ? globalThis.__dateFilterComponentUtils.renderDateRangePanelMarkup
    : ({ dataNamespace = 'factory-date', rangeText = '', monthLabel = '', activeField = 'startDate', startLabel = '', endLabel = '', disablePrevMonth = false, disableNextMonth = false, cells = [], shortcuts = [], summaryText = '', panelClassName = 'session-menu-panel session-menu-panel-date', panelStyle = '', title = '日期范围', startFieldLabel = '开始日期', endFieldLabel = '结束日期', cancelLabel = '取消', applyLabel = '应用日期' }) => {
      const safeSummaryText = summaryText || `已选择 ${rangeText}`;
      const panelStyleAttr = panelStyle ? ` style="${escapeHtml(panelStyle)}"` : '';
      return `
        <div class="${panelClassName}"${panelStyleAttr}>
          <div class="session-date-panel-head">
            <div class="session-date-panel-copy">
              <span>${escapeHtml(title)}</span>
              <strong>${escapeHtml(rangeText)}</strong>
            </div>
            <div class="session-date-nav">
              <button type="button" class="session-date-nav-btn" data-${dataNamespace}-nav="-1" aria-label="上一个月"${disablePrevMonth ? ' disabled' : ''}>
                <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
              </button>
              <strong>${escapeHtml(monthLabel)}</strong>
              <button type="button" class="session-date-nav-btn" data-${dataNamespace}-nav="1" aria-label="下一个月"${disableNextMonth ? ' disabled' : ''}>
                <i class="session-date-nav-arrow next" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div class="session-date-tabs">
            <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" data-${dataNamespace}-field="startDate">
              <span>${escapeHtml(startFieldLabel)}</span>
              <strong>${escapeHtml(startLabel)}</strong>
            </button>
            <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" data-${dataNamespace}-field="endDate">
              <span>${escapeHtml(endFieldLabel)}</span>
              <strong>${escapeHtml(endLabel)}</strong>
            </button>
          </div>
          <div class="session-date-weekdays">
            <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
          </div>
          <div class="session-date-grid">
            ${cells.map((cell) => {
              if (!cell) {
                return '<span class="session-date-empty" aria-hidden="true"></span>';
              }
              const classNames = ['session-date-day'];
              if (cell.isDisabled) classNames.push('is-disabled');
              if (cell.inRange) classNames.push('in-range');
              if (cell.isStart) classNames.push('is-start');
              if (cell.isEnd) classNames.push('is-end');
              if (cell.isToday) classNames.push('is-today');
              return `
                <button
                  type="button"
                  class="${classNames.join(' ')}"
                  ${cell.isDisabled ? 'disabled' : `data-${dataNamespace}-value="${escapeHtml(cell.value)}"`}
                >
                  ${escapeHtml(cell.day)}
                </button>
              `;
            }).join('')}
          </div>
          <div class="session-date-shortcuts">
            ${shortcuts.map((option) => `
              <button type="button" class="session-date-shortcut" data-${dataNamespace}-shortcut="${escapeHtml(option.key)}">${escapeHtml(option.label)}</button>
            `).join('')}
          </div>
          <div class="session-cascader-footer session-date-footer">
            <span>${escapeHtml(safeSummaryText)}</span>
            <div class="session-date-actions">
              <button type="button" class="btn session-date-action-btn" data-${dataNamespace}-cancel="true">${escapeHtml(cancelLabel)}</button>
              <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-${dataNamespace}-apply="true">${escapeHtml(applyLabel)}</button>
            </div>
          </div>
        </div>
      `;
    };

  // ══════════════════════════════════════════════════
  // 4. 顶部时间渲染
  // ══════════════════════════════════════════════════
  const updateTime = () => {
    const el = document.getElementById("topbar-time");
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  };
  updateTime();
  if (window.__factoryDashboardClockTimer) window.clearInterval(window.__factoryDashboardClockTimer);
  window.__factoryDashboardClockTimer = window.setInterval(updateTime, 1000);

  // 更新顶部组织名称
  const updateOrgLabel = () => {
    const el = document.getElementById("topbar-org-name");
    if (!el) return;
    if (currentStore !== 'all') {
      el.textContent = currentStore;
    } else if (currentZone !== 'all') {
      el.textContent = currentZone;
    } else if (currentRegion !== 'all') {
      el.textContent = currentRegion;
    } else {
      el.textContent = '全国';
    }
  };

  const factoryUserProfile = {
    surname: '李',
    fullName: '李李',
    region: '广州',
    organization: '华南大区'
  };

  const updateFactoryHeroIdentity = () => {
    const avatar = document.getElementById('factoryHeroAvatar');
    const name = document.getElementById('factoryHeroName');
    const subtitle = document.getElementById('factoryHeroSubtitle');
    if (avatar) {
      avatar.textContent = factoryUserProfile.surname;
    }
    if (name) {
      name.textContent = factoryUserProfile.fullName;
    }
    if (subtitle) {
      subtitle.textContent = getFactoryHeroSubtitle(factoryUserProfile);
    }
  };

  const getCurrentFactoryOrgPath = () => {
    if (sharedOrganizationDirectory) {
      return factorySelectedOrgPath;
    }
    if (currentStore !== 'all') {
      return `${currentRegion} > ${currentZone} > ${currentStore}`;
    }
    if (currentZone !== 'all') {
      return `${currentRegion} > ${currentZone}`;
    }
    if (currentRegion !== 'all') {
      return currentRegion;
    }
    return FACTORY_ALL_ORG_VALUE;
  };

  const getFactoryTrendSubjectLabel = () => {
    if (currentStore !== 'all') {
      return `${currentStore}质检合格率`;
    }
    if (currentZone !== 'all') {
      return `${currentZone}质检合格率`;
    }
    if (currentRegion !== 'all') {
      return `${currentRegion}质检合格率`;
    }
    return '质检合格率';
  };

  const formatFactoryOrganizationDisplay = (value) => {
    if (!value || value === FACTORY_ALL_ORG_VALUE) {
      return FACTORY_ALL_ORG_VALUE;
    }
    return sharedOrganizationDirectory?.formatPath(value, currentBrand === 'all' ? '全部' : currentBrand)
      || value.replaceAll(' > ', ' / ');
  };

  const normalizeFactoryOrganizationSearchText = (value) => {
    return String(value || '')
      .toLowerCase()
      .replaceAll(' > ', '')
      .replaceAll('/', '')
      .replaceAll('／', '')
      .replace(/\s+/g, '');
  };

  const getFactoryOrganizationColumns = (draftPath) => {
    if (sharedOrganizationDirectory) {
      return sharedOrganizationDirectory.getColumns(draftPath, factoryOrgDimension, currentBrand === 'all' ? '全部' : currentBrand);
    }
    const columns = [];
    let currentNodes = getFactoryOrganizationTree();

    while (currentNodes && currentNodes.length) {
      columns.push(currentNodes);
      const activeNode = currentNodes.find((node) => draftPath === node.path || draftPath.startsWith(`${node.path} > `));
      if (!activeNode || !activeNode.children || !activeNode.children.length) {
        break;
      }
      currentNodes = activeNode.children;
    }

    return columns;
  };

  const getFactoryOrganizationSearchResults = (keyword) => {
    if (sharedOrganizationDirectory) {
      return sharedOrganizationDirectory.search(keyword, factoryOrgDimension, currentBrand === 'all' ? '全部' : currentBrand);
    }
    const normalizedKeyword = normalizeFactoryOrganizationSearchText(keyword);
    if (!normalizedKeyword) {
      return [];
    }

    return getFlatFactoryOrganizationNodes().filter((node) => {
      const normalizedLabel = normalizeFactoryOrganizationSearchText(node.label);
      const normalizedPath = normalizeFactoryOrganizationSearchText(node.path);
      return normalizedLabel.includes(normalizedKeyword) || normalizedPath.includes(normalizedKeyword);
    });
  };

  const getFactoryOrganizationNodeByPath = (path) => {
    if (!path || path === FACTORY_ALL_ORG_VALUE) {
      return null;
    }
    return sharedOrganizationDirectory?.findNode(path, factoryOrgDimension)
      || getFlatFactoryOrganizationNodes().find((node) => node.path === path)
      || null;
  };

  const applyFactoryOrgPath = (path) => {
    factorySelectedOrgPath = path || FACTORY_ALL_ORG_VALUE;
    currentAdvisor = 'all';
    if (!path || path === FACTORY_ALL_ORG_VALUE) {
      currentRegion = 'all';
      currentZone = 'all';
      currentStore = 'all';
      return;
    }

    if (sharedOrganizationDirectory) {
      const node = sharedOrganizationDirectory.findNode(path, factoryOrgDimension);
      if (node?.type === 'advisor') currentAdvisor = node.advisorId;
      const dealerCode = node?.dealerCode;
      const dealer = sharedOrganizationDirectory.dealers.find((item) => item.dealerCode === dealerCode);
      currentRegion = dealer?.area || 'all';
      currentZone = dealer?.zone || 'all';
      currentStore = dealer?.dealerName || 'all';
      return;
    }

    const [region, zone, store] = path.split(' > ');
    currentRegion = region || 'all';
    currentZone = zone || 'all';
    currentStore = store || 'all';
  };

  const renderFactoryOrganizationMenu = () => {
    const draftPath = factoryOrgMenuState.draftPath || getCurrentFactoryOrgPath();
    const searchQuery = factoryOrgMenuState.searchQuery || '';
    const isSearching = Boolean(searchQuery.trim());
    const searchResults = isSearching ? getFactoryOrganizationSearchResults(searchQuery) : [];
    const columns = getFactoryOrganizationColumns(draftPath);

    return `
      <div class="factory-org-panel" data-factory-org-menu-panel="true">
        <div class="factory-org-panel-top">
          <button
            type="button"
            class="factory-org-clear${draftPath === FACTORY_ALL_ORG_VALUE ? ' active' : ''}"
            data-factory-org-clear="true"
          >
            <span>${FACTORY_ALL_ORG_VALUE}</span>
          </button>
          <div class="factory-org-current">
            <span>${factoryOrgDimension === 'province' ? '省份维度' : '大区维度'}·当前层级</span>
            <strong>${escapeHtml(formatFactoryOrganizationDisplay(draftPath))}</strong>
          </div>
        </div>
        ${
          isSearching
            ? `
              <div class="factory-org-search-panel">
                ${
                  searchResults.length
                    ? `
                      <div class="factory-org-search-results">
                        ${searchResults.map((node) => {
                          const active = draftPath === node.path || draftPath.startsWith(`${node.path} > `) ? ' active' : '';
                          return `
                            <button
                              type="button"
                              class="factory-org-search-option${active}"
                              data-factory-org-path="${escapeHtml(node.path)}"
                              data-factory-org-has-children="${node.children && node.children.length ? 'true' : 'false'}"
                              data-factory-org-from-search="true"
                            >
                              <span class="factory-org-search-main">
                                <span class="factory-org-search-label">${escapeHtml(node.label)}</span>
                                <span class="factory-org-search-copy">${escapeHtml(formatFactoryOrganizationDisplay(node.path))}</span>
                              </span>
                              ${node.children && node.children.length ? '<i class="factory-org-arrow" aria-hidden="true"></i>' : ''}
                            </button>
                          `;
                        }).join('')}
                      </div>
                    `
                    : '<div class="factory-org-empty">未找到匹配的组织</div>'
                }
              </div>
            `
            : `
              <div class="factory-org-columns">
                ${columns.map((nodes) => `
                  <div class="factory-org-column">
                    ${nodes.map((node) => {
                      const active = draftPath === node.path || draftPath.startsWith(`${node.path} > `) ? ' active' : '';
                      return `<button type="button" class="factory-org-option${active}" data-factory-org-path="${escapeHtml(node.path)}" data-factory-org-has-children="${node.children && node.children.length ? 'true' : 'false'}"><span>${escapeHtml(node.label)}</span>${node.children && node.children.length ? '<i class="factory-org-arrow" aria-hidden="true"></i>' : ''}</button>`;
                    }).join('')}
                  </div>`).join('')}
              </div>
            `
        }
        <div class="factory-org-footer">
          <span>筛选将覆盖当前层级及其下属门店与顾问</span>
          <button type="button" class="btn-primary" data-factory-org-apply="${escapeHtml(draftPath)}">应用组织</button>
        </div>
      </div>
    `;
  };

  const renderFactoryOrganizationControl = () => {
    const slot = document.getElementById('factoryOrgControlSlot');
    if (!slot) return;

    const open = factoryOrgMenuState.open;
    const searchQuery = factoryOrgMenuState.searchQuery || '';
    const hasSearchQuery = Boolean(searchQuery.trim());
    const isSearchActive = factoryOrgMenuState.searchActive || hasSearchQuery;
    const displayValue = open
      ? factoryOrgMenuState.draftPath || getCurrentFactoryOrgPath()
      : getCurrentFactoryOrgPath();

    slot.innerHTML = `
      <div class="store-filter-box session-toolbar-control session-toolbar-menu${open || factoryOrgMenuState.dimensionOpen ? ' is-open' : ''} session-toolbar-control-org factory-organization-combined-control" data-factory-org-root="true">
        <div class="factory-organization-combined-main">
          <button type="button" class="session-select-trigger factory-organization-dimension-trigger${factoryOrgMenuState.dimensionOpen ? ' active' : ''}" data-factory-org-dimension-toggle="true" aria-expanded="${factoryOrgMenuState.dimensionOpen ? 'true' : 'false'}">
            <strong>${factoryOrgDimension === 'province' ? '省份维度' : '大区维度'}</strong><span class="session-select-caret" aria-hidden="true"></span>
          </button>
          <div class="session-select-trigger session-select-trigger-search factory-organization-path-trigger${open ? ' active' : ''}">
          <div class="session-select-trigger-search-main">
            <input
              type="text"
              class="session-select-trigger-search-input${isSearchActive ? '' : ' is-display-mode'}"
              data-factory-org-trigger-input="true"
              value="${escapeHtml(searchQuery)}"
              placeholder="${escapeHtml(isSearchActive ? '搜索组织/门店/顾问' : formatFactoryOrganizationDisplay(displayValue))}"
              aria-label="搜索组织"
            />
          </div>
          <button
            type="button"
            class="session-select-trigger-search-toggle"
            data-factory-org-trigger-toggle="true"
            aria-label="展开组织筛选"
            aria-haspopup="listbox"
            aria-expanded="${open ? 'true' : 'false'}"
          >
            <span class="session-select-caret" aria-hidden="true"></span>
          </button>
          </div>
        </div>
        ${factoryOrgMenuState.dimensionOpen ? `<div class="session-menu-panel factory-org-dimension-menu"><button type="button" class="session-menu-option${factoryOrgDimension === 'region' ? ' active' : ''}" data-factory-org-dimension="region"><span>大区维度</span></button><button type="button" class="session-menu-option${factoryOrgDimension === 'province' ? ' active' : ''}" data-factory-org-dimension="province"><span>省份维度</span></button></div>` : ''}
        ${open ? renderFactoryOrganizationMenu() : ''}
      </div>
    `;
  };

  const rerenderFactoryOrganizationControl = (keepFocus = false) => {
    renderFactoryOrganizationControl();
    bindFactoryOrganizationControlEvents();
    syncFactoryOrganizationMenuLayout();

    if (!keepFocus) {
      return;
    }

    window.requestAnimationFrame(() => {
      const input = document.querySelector('[data-factory-org-trigger-input="true"]');
      if (!input) {
        return;
      }
      input.focus();
      const position = input.value.length;
      input.setSelectionRange(position, position);
    });
  };

  const syncFactoryOrganizationMenuLayout = () => {
    window.requestAnimationFrame(() => {
      const panel = document.querySelector('[data-factory-org-menu-panel="true"]');
      if (!panel) return;
      panel.style.setProperty('--factory-org-shift-x', '0px');
      const rect = panel.getBoundingClientRect();
      const safeInset = 16;
      let shiftX = 0;
      if (rect.right > window.innerWidth - safeInset) shiftX -= rect.right - (window.innerWidth - safeInset);
      if (rect.left + shiftX < safeInset) shiftX += safeInset - (rect.left + shiftX);
      panel.style.setProperty('--factory-org-shift-x', `${Math.round(shiftX)}px`);
      const columns = panel.querySelector('.factory-org-columns');
      columns?.scrollTo({ left: columns.scrollWidth, behavior: 'smooth' });
    });
  };

  const commitFactoryOrganizationFilter = (path) => {
    applyFactoryOrgPath(path);
    issueRuleAnalysisState.path = [];
    sopAnalysisState.path = [];
    factoryOrgMenuState.draftPath = getCurrentFactoryOrgPath();
    factoryOrgMenuState.searchQuery = '';
    factoryOrgMenuState.searchActive = false;
    factoryOrgMenuState.open = false;
    updateOrgLabel();
    rerenderFactoryOrganizationControl();
    applyGlobalFilter();
  };

  const bindFactoryOrganizationControlEvents = () => {
    const root = document.querySelector('[data-factory-org-root="true"]');
    if (!root) return;

    const toggle = root.querySelector('[data-factory-org-trigger-toggle="true"]');
    const dimensionToggle = root.querySelector('[data-factory-org-dimension-toggle="true"]');
    const input = root.querySelector('[data-factory-org-trigger-input="true"]');

    dimensionToggle?.addEventListener('click', (event) => {
      event.stopPropagation();
      factoryOrgMenuState.dimensionOpen = !factoryOrgMenuState.dimensionOpen;
      factoryOrgMenuState.open = false;
      factoryOrgMenuState.searchQuery = '';
      factoryOrgMenuState.searchActive = false;
      rerenderFactoryOrganizationControl();
    });

    root.querySelectorAll('[data-factory-org-dimension]').forEach((node) => {
      node.addEventListener('click', () => {
        const nextDimension = node.dataset.factoryOrgDimension || 'region';
        if (factoryOrgDimension !== nextDimension) {
          factoryOrgDimension = nextDimension;
          applyFactoryOrgPath(FACTORY_ALL_ORG_VALUE);
        }
        factoryOrgMenuState.dimensionOpen = false;
        factoryOrgMenuState.draftPath = FACTORY_ALL_ORG_VALUE;
        rerenderFactoryOrganizationControl();
        applyGlobalFilter();
      });
    });

    if (toggle) {
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const willOpen = !factoryOrgMenuState.open;
        factoryOrgMenuState.open = willOpen;
        factoryOrgMenuState.dimensionOpen = false;
        if (willOpen) {
          factoryOrgMenuState.draftPath = getCurrentFactoryOrgPath();
        } else {
          factoryOrgMenuState.searchQuery = '';
          factoryOrgMenuState.searchActive = false;
        }
        rerenderFactoryOrganizationControl(willOpen && factoryOrgMenuState.searchActive);
      });
    }

    if (input) {
      input.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      input.addEventListener('focus', () => {
        const shouldActivateSearch = !factoryOrgMenuState.searchActive;
        const shouldOpen = !factoryOrgMenuState.open;

        if (shouldActivateSearch) {
          factoryOrgMenuState.searchActive = true;
          factoryOrgMenuState.searchQuery = '';
        }
        if (shouldOpen) {
          factoryOrgMenuState.open = true;
          factoryOrgMenuState.draftPath = getCurrentFactoryOrgPath();
        }

        if (shouldActivateSearch || shouldOpen) {
          rerenderFactoryOrganizationControl(true);
        }
      });

      input.addEventListener('input', (event) => {
        if (event.isComposing) return;
        factoryOrgMenuState.searchQuery = input.value || '';
        factoryOrgMenuState.searchActive = true;
        if (!factoryOrgMenuState.open) {
          factoryOrgMenuState.open = true;
          factoryOrgMenuState.draftPath = getCurrentFactoryOrgPath();
        }
        rerenderFactoryOrganizationControl(true);
      });
    }

    root.querySelectorAll('[data-factory-org-path]').forEach((node) => {
      node.addEventListener('click', () => {
        const nextPath = node.dataset.factoryOrgPath || FACTORY_ALL_ORG_VALUE;
        const hasChildren = node.dataset.factoryOrgHasChildren === 'true';
        const fromSearch = node.dataset.factoryOrgFromSearch === 'true';
        factoryOrgMenuState.draftPath = nextPath;

        if (hasChildren) {
          if (fromSearch) {
            factoryOrgMenuState.searchQuery = '';
            factoryOrgMenuState.searchActive = false;
          }
          rerenderFactoryOrganizationControl();
          return;
        }

        commitFactoryOrganizationFilter(nextPath);
      });
    });

    root.querySelectorAll('[data-factory-org-clear]').forEach((node) => {
      node.addEventListener('click', () => {
        commitFactoryOrganizationFilter(FACTORY_ALL_ORG_VALUE);
      });
    });

    root.querySelectorAll('[data-factory-org-apply]').forEach((node) => {
      node.addEventListener('click', () => {
        const nextPath = node.dataset.factoryOrgApply || factoryOrgMenuState.draftPath || FACTORY_ALL_ORG_VALUE;
        commitFactoryOrganizationFilter(nextPath);
      });
    });
  };

  // ══════════════════════════════════════════════════
  // 5. 指标定义系统（? 图标 + 弹窗）
  // ══════════════════════════════════════════════════
  const METRIC_DEFS = {
    '到店率':        '邀约客户中实际到店的比例（到店数 ÷ 邀约录音数）',
    '试驾率':        '到店客户中完成试驾的比例（试驾录音数 ÷ 接待录音数）',
    '下订率':        '到店客户中完成下订的比例（下订数 ÷ 接待录音数）',
    '有效录音':      '质检系统判定为有效互动（邀约成功或多轮对话）的录音条数',
    '话术执行率':    '顾问在录音中命中 SOP 话术的比率（命中项 ÷ 质检项）',
    '话术执行':      '顾问在录音中命中 SOP 话术的比率（命中项 ÷ 质检项）',
    '平均时长':      '有效录音的平均通话或面谈时长（分钟）',
    '质检合格数':    '话术命中率 ≥ 60% 的录音条数',
    '质检合格率':    '合格录音占分析录音的比率（合格数 ÷ 分析录音数）',
    '风险录音数':    '含违规或风险话术的录音条数',
    '风险录音率':    '风险录音占分析录音的比率（风险数 ÷ 分析录音数）',
    '邀约录音数':    '当期邀约场景下进入质检分析的录音条数',
    '接待录音数':    '当期门店接待场景下进入质检分析的录音条数',
    '试驾录音数':    '当期试乘试驾场景下进入质检分析的录音条数',
    '云外呼录音数':  '当期云外呼来源下进入质检分析的录音总条数',
    '门店工牌录音数': '当期门店工牌来源下进入质检分析的录音总条数',
    '分析用户数':    '进入 SOP 分析样本池的去重客户数',
    '分析录音数':    '进入 SOP 分析样本池的录音条数',
    '下订用户数':    '样本周期内已下订客户的去重人数',
    '下订录音数':    '下订客户关联的有效录音条数',
    '战败用户数':    '样本周期内判定为战败客户的去重人数',
    '战败录音数':    '战败客户关联的有效录音条数',
    '话术命中率':    '样本录音中关键话术被命中的比例',
    '质检合格率':     '样本录音中达到质检合格标准的比例',
    '下订话术命中率': '下订样本中关键话术被命中的比例',
    '下订质检合格率': '下订样本中达到质检合格标准的比例',
    '战败话术命中率': '战败样本中关键话术被命中的比例',
    '战败质检合格率': '战败样本中达到质检合格标准的比例',
    'SOP单项命中率': '各 SOP 话术项的未命中率，数值越低代表执行越好'
  };

  const metricBtn = (label) => {
    if (!METRIC_DEFS[label]) return '';
    return `<button type="button" class="metric-def-btn" onclick="event.stopPropagation()" aria-label="${label}指标说明">?<span class="metric-def-tooltip" role="tooltip">${METRIC_DEFS[label]}</span></button>`;
  };

  window.closeRecordingPlayer = function() {
    const overlay = document.getElementById('rec-modal-overlay');
    if (overlay) overlay.remove();
  };

  window.openRecordingPlayer = function(id) {
    const displayId = normalizeFactoryMockRecordingId(id);
    const existing = document.getElementById('rec-modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'rec-modal-overlay';
    overlay.className = 'rec-modal-overlay';
    overlay.innerHTML = `
      <div class="rec-modal" role="dialog" aria-modal="true" aria-label="录音试听">
        <div class="rec-modal-head">
          <div>
            <div class="rec-modal-eyebrow">录音信息及试听</div>
            <div class="rec-modal-title">${displayId}</div>
          </div>
          <button class="rec-modal-close" onclick="closeRecordingPlayer()" aria-label="关闭">×</button>
        </div>
        <div class="rec-player-line">
          <span>00:00</span>
          <div class="rec-wave">
            ${Array.from({ length: 34 }).map((_, i) => `<i style="height:${10 + (i * 7) % 34}px"></i>`).join('')}
          </div>
          <span>03:42</span>
        </div>
        <div class="rec-modal-body">
          <div><strong>试听摘要</strong><span>该录音命中了关键话术，可用于查看客户原声、顾问应对与 SOP 建议。</span></div>
          <div><strong>关联动作</strong><span>建议结合展开卡片中的策略说明，沉淀为门店晨会话术训练素材。</span></div>
        </div>
      </div>`;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) window.closeRecordingPlayer();
    });
    factoryPage.appendChild(overlay);
  };

  // ══════════════════════════════════════════════════
  // ══════════════════════════════════════════════════
  // 7. 全局筛选栏事件绑定
  // ══════════════════════════════════════════════════

  // ── 7a. 组织级联选择 ────────────────────────────
  renderFactoryOrganizationControl();
  bindFactoryOrganizationControlEvents();
  updateOrgLabel();

  if (window.__factoryDashboardOrgOutsideHandler) {
    document.removeEventListener('click', window.__factoryDashboardOrgOutsideHandler, true);
  }

  window.__factoryDashboardOrgOutsideHandler = (event) => {
    if (!factoryOrgMenuState.open) {
      return;
    }
    const root = document.querySelector('[data-factory-org-root="true"]');
    if (root && !root.contains(event.target)) {
      factoryOrgMenuState.open = false;
      factoryOrgMenuState.searchQuery = '';
      factoryOrgMenuState.searchActive = false;
      rerenderFactoryOrganizationControl();
    }
  };
  document.addEventListener('click', window.__factoryDashboardOrgOutsideHandler, true);

  // ── 7b. 通用 Tab 筛选绑定器 ─────────────────────
  const bindGlobalFilter = (containerId, dataAttr, stateUpdater) => {
    const tabs = document.querySelectorAll(`#${containerId} .gf-tab`);
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains('disabled')) return;
        tabs.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add("active");
        tab.setAttribute('aria-pressed', 'true');
        stateUpdater(tab.dataset[dataAttr]);
        // 自定义时间不自动 apply
        if (containerId === 'gf-time' && tab.dataset[dataAttr] === 'custom') return;
        applyGlobalFilter();
      });
    });
  };

  const syncFactorySceneTabs = () => {
    const sourceTabs = document.querySelectorAll('#gf-source .gf-tab');
    const selection = getFactorySceneSelection();
    const allowed = new Set(getAllowedScenes(currentSource));
    const sceneSlot = document.getElementById('factorySceneFilterSlot');

    sourceTabs.forEach((tab) => {
      const isActive = tab.dataset.source === currentSource;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (!sceneSlot) {
      return;
    }

    const optionsMarkup = renderCheckboxFilterOptionsMarkup({
      options: FACTORY_SCENE_FILTER_OPTIONS,
      buttonClassName: 'factory-scene-filter-option factory-multi-select-option',
      checkClassName: 'factory-multi-select-check',
      textClassName: 'factory-multi-select-text',
      getOptionMeta(option) {
        const scene = option.value;
        const isAll = scene === SCENE_KEYS.all;
        const isAllowed = isAll || allowed.has(scene);
        const isActive = isAll
          ? selection.isAllSelected
          : (selection.isAllSelected ? allowed.has(scene) : selection.activeScenes.includes(scene));
        const isIndeterminate = isAll && !selection.isAllSelected && !selection.isNoneSelected;
        const isHidden = isAll || !isAllowed;

        return {
          className: [
            isActive ? 'active' : '',
            isIndeterminate ? 'is-indeterminate' : '',
            isHidden ? 'is-hidden' : '',
            !isAllowed ? 'disabled' : ''
          ].filter(Boolean).join(' '),
          attrs: {
            'data-scene': scene,
            'aria-pressed': isActive ? 'true' : 'false',
            'aria-checked': isIndeterminate ? 'mixed' : (isActive ? 'true' : 'false'),
            'aria-hidden': isHidden ? 'true' : 'false',
            tabindex: isHidden ? -1 : (isAllowed ? 0 : -1)
          }
        };
      }
    });

    sceneSlot.innerHTML = renderInlineCheckboxFilterGroupMarkup({
      rootClassName: 'gf-group store-filter-box session-toolbar-control session-toolbar-segment-control factory-toolbar-control-scene',
      label: '业务场景',
      labelClassName: 'gf-label',
      tabsId: 'gf-scene',
      tabsClassName: 'gf-tabs todo-filter-tabs factory-multi-select-tabs',
      tabsAriaLabel: '业务场景',
      optionsMarkup
    });
  };

  const getFactorySceneSelection = () => normalizeSceneSelection(currentSource, currentScenes);
  const getEffectiveSceneKey = () => getFactorySceneSelection().effectiveSceneKey;

  // 绑定人员筛选
  bindGlobalFilter("gf-role", "role", val => {
    currentRole = val;
  });

  document.getElementById('gf-source')?.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-source]');
    if (!tab) return;
    currentSource = tab.dataset.source;
    currentScenes = setSourceSelection(currentSource);
    syncFactorySceneTabs();
    applyGlobalFilter();
  });

  document.getElementById('factorySceneFilterSlot')?.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-scene]');
    if (!tab || tab.classList.contains('disabled') || tab.classList.contains('is-hidden')) return;
    const nextScenes = toggleSceneSelection(currentSource, currentScenes, tab.dataset.scene);
    if (Array.isArray(nextScenes) && nextScenes.length === 0) return;
    currentScenes = nextScenes;
    syncFactorySceneTabs();
    applyGlobalFilter();
  });

  bindGlobalFilter("gf-brand", "brand", val => {
    const changed = currentBrand !== val;
    currentBrand = val;
    if (changed) {
      applyFactoryOrgPath(FACTORY_ALL_ORG_VALUE);
      factoryOrgMenuState.draftPath = FACTORY_ALL_ORG_VALUE;
      factoryOrgMenuState.open = false;
      factoryOrgMenuState.dimensionOpen = false;
      factoryOrgMenuState.searchQuery = '';
      rerenderFactoryOrganizationControl();
    }
  });

  const shiftFactoryReferenceDate = (date, offsetDays) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + offsetDays);
    return nextDate;
  };

  const getFactoryRangeValues = (rangeKey) => {
    const anchorDate = new Date();
    let startDate = anchorDate;
    let endDate = anchorDate;

    if (rangeKey === '1') {
      startDate = shiftFactoryReferenceDate(anchorDate, -1);
      endDate = startDate;
    } else if (rangeKey === '7') {
      startDate = shiftFactoryReferenceDate(anchorDate, -6);
    } else if (rangeKey === '15') {
      startDate = shiftFactoryReferenceDate(anchorDate, -14);
    } else if (rangeKey === '30') {
      startDate = shiftFactoryReferenceDate(anchorDate, -29);
    }

    return {
      startDate: formatFactoryDateValue(startDate),
      endDate: formatFactoryDateValue(endDate)
    };
  };

  const syncFactoryTimeRangeFromQuickFilter = (rangeKey) => {
    const { startDate, endDate } = getFactoryRangeValues(rangeKey);
    factoryTimeStartDate = startDate;
    factoryTimeEndDate = endDate;
  };

  const getFactoryDateLimitRange = () => {
    const maxDate = new Date();
    const minYear = maxDate.getFullYear();
    const minMonth = maxDate.getMonth() - 6;
    const minMonthLastDate = new Date(minYear, minMonth + 1, 0).getDate();
    const minDate = new Date(minYear, minMonth, Math.min(maxDate.getDate(), minMonthLastDate));

    return {
      minDate,
      maxDate,
      minValue: formatFactoryDateValue(minDate),
      maxValue: formatFactoryDateValue(maxDate)
    };
  };

  const clampFactoryDateValue = (value) => {
    if (!value) {
      return '';
    }

    const { minValue, maxValue } = getFactoryDateLimitRange();
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
  };

  const isFactoryDateSelectable = (value) => {
    if (!value) {
      return false;
    }

    const { minValue, maxValue } = getFactoryDateLimitRange();
    return value >= minValue && value <= maxValue;
  };

  const syncFactoryDateView = (value) => {
    const target = parseFactoryDateValue(clampFactoryDateValue(value)) || getFactoryDateLimitRange().maxDate;
    factoryDateState.viewYear = target.getFullYear();
    factoryDateState.viewMonth = target.getMonth() + 1;
  };

  const shiftFactoryDateView = (offset) => {
    const { minDate, maxDate } = getFactoryDateLimitRange();
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = factoryDateState.viewYear * 12 + factoryDateState.viewMonth - 1;
    const nextMonthIndex = Math.min(maxMonthIndex, Math.max(minMonthIndex, currentMonthIndex + offset));

    factoryDateState.viewYear = Math.floor(nextMonthIndex / 12);
    factoryDateState.viewMonth = (nextMonthIndex % 12) + 1;
  };

  const applyFactoryDateDraft = (field, value) => {
    const nextValue = clampFactoryDateValue(value);
    if (!nextValue) {
      return;
    }

    if (field === 'startDate') {
      factoryDateState.draftStartDate = nextValue;
      if (!factoryDateState.draftEndDate || factoryDateState.draftEndDate < nextValue) {
        factoryDateState.draftEndDate = nextValue;
      }
      factoryDateState.activeField = 'endDate';
      syncFactoryDateView(factoryDateState.draftEndDate);
      return;
    }

    factoryDateState.draftEndDate = nextValue;
    if (!factoryDateState.draftStartDate || factoryDateState.draftStartDate > nextValue) {
      factoryDateState.draftStartDate = nextValue;
    }
  };

  const getFactoryRangeInclusiveDays = (startDate, endDate) => {
    const start = parseFactoryDateValue(startDate);
    const end = parseFactoryDateValue(endDate);
    if (!start || !end) {
      return 7;
    }

    const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
    return Math.max(1, diff + 1);
  };

  const getFactoryTimeRangeKey = () => {
    if (currentTime !== 'custom') {
      return currentTime;
    }

    const days = getFactoryRangeInclusiveDays(factoryTimeStartDate, factoryTimeEndDate);
    if (days <= 1) return '1';
    if (days <= 7) return '7';
    if (days <= 15) return '15';
    return '30';
  };

  const renderFactoryDateMenu = () => {
    const activeField = factoryDateState.activeField;
    const startDate = factoryDateState.draftStartDate;
    const endDate = factoryDateState.draftEndDate;
    const { minDate, maxDate, maxValue } = getFactoryDateLimitRange();
    const todayValue = maxValue;
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = factoryDateState.viewYear * 12 + factoryDateState.viewMonth - 1;
    const disablePrevMonth = currentMonthIndex <= minMonthIndex;
    const disableNextMonth = currentMonthIndex >= maxMonthIndex;
    const cells = getFactoryDateCells(factoryDateState.viewYear, factoryDateState.viewMonth);

    return renderSharedDateRangePanelMarkup({
      dataNamespace: 'factory-date',
      rangeText: getFactoryDateRangeText(startDate, endDate),
      monthLabel: formatFactoryMonthLabel(factoryDateState.viewYear, factoryDateState.viewMonth),
      activeField,
      startLabel: formatFactoryDateDisplay(startDate),
      endLabel: formatFactoryDateDisplay(endDate),
      disablePrevMonth,
      disableNextMonth,
      panelStyle: 'left: 0; right: auto;',
      cells: cells.map((date) => {
        if (!date) {
          return null;
        }

        const value = formatFactoryDateValue(date);
        return {
          day: date.getDate(),
          value,
          isDisabled: !isFactoryDateSelectable(value),
          inRange: Boolean(startDate && endDate && value >= startDate && value <= endDate),
          isStart: value === startDate,
          isEnd: value === endDate,
          isToday: value === todayValue
        };
      }),
      shortcuts: factoryDateShortcutOptions,
      summaryText: `已选择 ${getFactoryDateRangeText(startDate, endDate)}`
    });
  };

  const bindFactoryDateEvents = () => {
    const host = document.getElementById('store-date-control');
    if (!host) {
      return;
    }

    host.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    host.querySelectorAll('[data-factory-date-trigger]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.stopPropagation();

        if (factoryDateState.open) {
          factoryDateState.open = false;
          renderFactoryDateControl();
          return;
        }

        openFactoryDatePicker();
      });
    });

    host.querySelectorAll('[data-factory-date-field]').forEach((node) => {
      node.addEventListener('click', () => {
        factoryDateState.activeField = node.dataset.factoryDateField;
        const value = factoryDateState.activeField === 'startDate'
          ? factoryDateState.draftStartDate
          : factoryDateState.draftEndDate;
        syncFactoryDateView(value);
        renderFactoryDateControl();
      });
    });

    host.querySelectorAll('[data-factory-date-nav]').forEach((node) => {
      node.addEventListener('click', () => {
        shiftFactoryDateView(Number(node.dataset.factoryDateNav));
        renderFactoryDateControl();
      });
    });

    host.querySelectorAll('[data-factory-date-value]').forEach((node) => {
      node.addEventListener('click', () => {
        applyFactoryDateDraft(factoryDateState.activeField, node.dataset.factoryDateValue);
        renderFactoryDateControl();
      });
    });

    host.querySelectorAll('[data-factory-date-shortcut]').forEach((node) => {
      node.addEventListener('click', () => {
        const { startDate, endDate } = getFactoryRangeValues(node.dataset.factoryDateShortcut);
        factoryDateState.draftStartDate = startDate;
        factoryDateState.draftEndDate = endDate;
        factoryDateState.activeField = 'endDate';
        syncFactoryDateView(endDate);
        renderFactoryDateControl();
      });
    });

    host.querySelectorAll('[data-factory-date-cancel]').forEach((node) => {
      node.addEventListener('click', () => {
        closeFactoryDatePicker();
      });
    });

    host.querySelectorAll('[data-factory-date-apply]').forEach((node) => {
      node.addEventListener('click', () => {
        applyFactoryDateFilters();
      });
    });
  };

  function renderFactoryDateControl() {
    const host = document.getElementById('store-date-control');
    if (!host) {
      return;
    }

    if (currentTime !== 'custom') {
      host.innerHTML = '';
      return;
    }

    host.innerHTML = renderSharedDateRangeControlMarkup({
      currentValue: currentTime,
      customValue: 'custom',
      isOpen: factoryDateState.open,
      startLabel: formatFactoryDateDisplay(factoryTimeStartDate),
      endLabel: formatFactoryDateDisplay(factoryTimeEndDate),
      dataNamespace: 'factory-date',
      rootClassName: 'store-date-root',
      triggerClassName: 'session-date-trigger store-date-trigger',
      triggerLabel: '日期范围筛选',
      menuHtml: factoryDateState.open ? renderFactoryDateMenu() : ''
    });

    bindFactoryDateEvents();
  }

  function closeFactoryDatePicker(shouldRender = true) {
    if (!factoryDateState.open) {
      return;
    }

    factoryDateState.open = false;
    if (shouldRender) {
      renderFactoryDateControl();
    }
  }

  function openFactoryDatePicker() {
    if (!factoryTimeStartDate || !factoryTimeEndDate) {
      syncFactoryTimeRangeFromQuickFilter('7');
    }

    factoryDateState.open = true;
    factoryDateState.activeField = 'startDate';
    factoryDateState.draftStartDate = clampFactoryDateValue(factoryTimeStartDate);
    factoryDateState.draftEndDate = clampFactoryDateValue(factoryTimeEndDate);
    if (factoryDateState.draftStartDate && factoryDateState.draftEndDate && factoryDateState.draftStartDate > factoryDateState.draftEndDate) {
      factoryDateState.draftStartDate = factoryDateState.draftEndDate;
    }
    syncFactoryDateView(factoryTimeStartDate || factoryTimeEndDate);
    renderFactoryDateControl();
  }

  function applyFactoryDateFilters() {
    const startDate = clampFactoryDateValue(factoryDateState.draftStartDate);
    const endDate = clampFactoryDateValue(factoryDateState.draftEndDate);
    factoryTimeStartDate = startDate && endDate && startDate > endDate ? endDate : startDate;
    factoryTimeEndDate = startDate && endDate && startDate > endDate ? startDate : endDate;
    currentTime = 'custom';
    factoryDateState.open = false;
    renderFactoryDateControl();
    applyGlobalFilter();
  }

  syncFactoryTimeRangeFromQuickFilter(currentTime);

  // 绑定时间筛选
  bindGlobalFilter("gf-time", "time", val => {
    currentTime = val;
    if (val === 'custom') {
      openFactoryDatePicker();
    } else {
      syncFactoryTimeRangeFromQuickFilter(val);
      closeFactoryDatePicker(false);
      renderFactoryDateControl();
    }
  });

  const initFactoryModelDropdown = () => {
    const trigger = document.getElementById('factory-model-trigger');
    const panel = document.getElementById('factory-model-panel');
    const display = document.getElementById('factory-model-display');
    if (!trigger || !panel || !display) return;

    const modelLabels = { all: '全部车系', M8: '传祺M8', S7: '传祺S7', GS8: '传祺GS8', E8: '传祺E8' };

    const openDropdown = () => {
      panel.classList.add('show');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    };

    const closeDropdown = () => {
      panel.classList.remove('show');
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const selectModel = (model) => {
      panel.querySelectorAll('.store-model-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.model === model);
      });
      currentModel = model;
      display.textContent = modelLabels[model] || model;
      closeDropdown();
      applyGlobalFilter();
    };

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (panel.classList.contains('show')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    panel.addEventListener('click', (event) => {
      const option = event.target.closest('.store-model-option');
      if (option && option.dataset.model) {
        selectModel(option.dataset.model);
      }
    });

    document.addEventListener('click', (event) => {
      if (!trigger.contains(event.target) && !panel.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDropdown();
    });
  };
  initFactoryModelDropdown();

  document.addEventListener('click', (event) => {
    const root = document.querySelector('[data-factory-date-root="true"]');
    const timeTabs = document.getElementById('gf-time');
    if (
      factoryDateState.open
      && root
      && !root.contains(event.target)
      && !timeTabs?.contains(event.target)
    ) {
      closeFactoryDatePicker();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeFactoryDatePicker();
    }
  });

  // ══════════════════════════════════════════════════
  // 全局筛选应用 + KPI 渲染
  // ══════════════════════════════════════════════════
  const trendBadge = (trend, dir, options = {}) => {
    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';
    const val = trend.replace(/[↑↓]/g, '');
    const extraClass = options.riskTrend ? ' risk-trend' : '';
    return `<span class="hm-trend ${dir}${extraClass}">${arrow}${val}</span>`;
  };

  const factoryHeroCounterFrames = new Set();

  const clearFactoryHeroCounterAnimations = () => {
    factoryHeroCounterFrames.forEach((frameId) => cancelAnimationFrame(frameId));
    factoryHeroCounterFrames.clear();
  };

  const parseFactoryHeroCounterMeta = (rawValue) => {
    const text = String(rawValue ?? '').trim();
    const match = text.match(/^([^0-9+-]*)([-+]?\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    const numericText = match[2];
    return {
      prefix: match[1] || '',
      target: Number(numericText),
      decimals: (numericText.split('.')[1] || '').length,
      suffix: match[3] || ''
    };
  };

  const formatFactoryHeroCounterValue = (value, decimals) => {
    if (decimals > 0) return Number(value).toFixed(decimals);
    return String(Math.round(value));
  };

  const buildFactoryHeroCounterDisplay = (valueText, options = {}) => {
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    const unit = options.unit || '';
    const safeMain = `${escapeHtml(prefix)}${escapeHtml(valueText)}`;

    if (unit) return `${safeMain}<small>${escapeHtml(unit)}</small>`;
    if (suffix === '%') return `${safeMain}<small>${escapeHtml(suffix)}</small>`;
    return `${safeMain}${escapeHtml(suffix)}`;
  };

  const buildFactoryHeroCounterAttrs = (rawValue, unit = '') => {
    const meta = parseFactoryHeroCounterMeta(rawValue);
    if (!meta || !Number.isFinite(meta.target)) return '';

    return [
      `data-factory-count-target="${meta.target}"`,
      `data-factory-count-decimals="${meta.decimals}"`,
      meta.prefix ? `data-factory-count-prefix="${escapeHtml(meta.prefix)}"` : '',
      meta.suffix ? `data-factory-count-suffix="${escapeHtml(meta.suffix)}"` : '',
      unit ? `data-factory-count-unit="${escapeHtml(unit)}"` : ''
    ].filter(Boolean).join(' ');
  };

  const renderFactoryHeroCounterValue = (rawValue, unit = '') => {
    const meta = parseFactoryHeroCounterMeta(rawValue);
    if (!meta || !Number.isFinite(meta.target)) {
      return `${escapeHtml(rawValue)}${unit ? `<small>${escapeHtml(unit)}</small>` : ''}`;
    }

    return buildFactoryHeroCounterDisplay(formatFactoryHeroCounterValue(meta.target, meta.decimals), {
      prefix: meta.prefix,
      suffix: meta.suffix,
      unit
    });
  };

  const setFactoryHeroCounterDisplay = (node, value) => {
    if (!node) return;

    const decimals = Number(node.dataset.factoryCountDecimals || 0);
    const prefix = node.dataset.factoryCountPrefix || '';
    const suffix = node.dataset.factoryCountSuffix || '';
    const unit = node.dataset.factoryCountUnit || '';
    const displayValue = formatFactoryHeroCounterValue(value, decimals);
    node.innerHTML = buildFactoryHeroCounterDisplay(displayValue, { prefix, suffix, unit });
  };

  const animateFactoryHeroCounterNode = (node, options = {}) => {
    if (!node) return;

    const target = Number(node.dataset.factoryCountTarget);
    if (!Number.isFinite(target)) return;

    const duration = options.duration ?? 920;
    const delay = options.delay ?? 0;
    const startValue = options.startValue ?? 0;
    const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3);
    let frameId = 0;
    let animationStart = null;

    const scheduleFrame = () => {
      frameId = requestAnimationFrame(step);
      factoryHeroCounterFrames.add(frameId);
    };

    const step = (timestamp) => {
      factoryHeroCounterFrames.delete(frameId);

      if (animationStart === null) {
        animationStart = timestamp + delay;
      }

      if (timestamp < animationStart) {
        scheduleFrame();
        return;
      }

      const progress = Math.min((timestamp - animationStart) / duration, 1);
      const currentValue = startValue + ((target - startValue) * easeOutCubic(progress));
      setFactoryHeroCounterDisplay(node, currentValue);

      if (progress < 1) {
        scheduleFrame();
        return;
      }

      setFactoryHeroCounterDisplay(node, target);
    };

    setFactoryHeroCounterDisplay(node, startValue);
    scheduleFrame();
  };

  const animateFactoryHeroCounters = (root) => {
    if (!root) return;

    clearFactoryHeroCounterAnimations();
    [...root.querySelectorAll('[data-factory-count-target]')].forEach((node, index) => {
      animateFactoryHeroCounterNode(node, {
        delay: 80 + (index * 55),
        duration: 920
      });
    });
  };

  const STORE_HERO_METRIC_ICON_MAP = {
    '平均时长': '../assets/store-core-metrics/metric-duration.png',
    '话术执行率': '../assets/store-core-metrics/metric-hit-rate.png',
    '质检合格数': '../assets/store-core-metrics/metric-pass-count.png',
    '质检合格率': '../assets/store-core-metrics/metric-pass-rate.png',
    '风险录音数': '../assets/store-core-metrics/metric-risk-count.png',
    '风险录音率': '../assets/store-core-metrics/metric-risk-rate.png'
  };

  const renderStoreHeroMetricIcon = (tone = 'blue', label = '') => {
    const iconSrc = STORE_HERO_METRIC_ICON_MAP[label];
    if (iconSrc) {
      return `<img class="hm-label-icon hm-label-icon-image" src="${iconSrc}" alt="" aria-hidden="true">`;
    }
    return `
      <span class="hm-label-icon tone-${tone}" aria-hidden="true">
        <span class="hm-label-icon-core"></span>
        <span class="hm-label-icon-dot"></span>
      </span>
    `;
  };

  const buildFactoryHeroMetric = (metricKey, metric) => ({
    ...metric,
    tone: metric.tone || HERO_METRIC_TONE_MAP[metricKey] || 'blue'
  });

  const renderKpiMetricBody = (metric) => {
    const valueClass = metric.isDanger ? 'danger' : metric.isSuccess ? 'success' : metric.isRate ? 'rate' : '';
    const tone = metric.tone || 'blue';
    const isRiskTrend = metric.label === '风险录音数' || metric.label === '风险录音率';
    return `
      ${metricBtn(metric.label)}
      <div class="hm-label-row">
        ${renderStoreHeroMetricIcon(tone, metric.label)}
        <div class="hm-label">${metric.label}</div>
      </div>
      <div class="hm-val-row">
        <span class="hm-value ${valueClass}" ${buildFactoryHeroCounterAttrs(metric.num, metric.unit)}>${renderFactoryHeroCounterValue(metric.num, metric.unit)}</span>
        ${trendBadge(metric.trend, metric.trendDir, { riskTrend: isRiskTrend })}
      </div>
    `;
  };

  const renderSingleKpiMetric = (metric) => `
    <div class="hm-item single-metric">
      ${renderKpiMetricBody(metric)}
    </div>
  `;

  const renderRecordingSummaryScene = (scene) => `
    <div class="store-recording-summary-scene" data-recording-scene="${escapeHtml(scene.key)}">
      <span class="store-recording-summary-scene-label">${escapeHtml(scene.label)}</span>
      <strong class="store-recording-summary-scene-value" ${buildFactoryHeroCounterAttrs(scene.value, '条')}>${renderFactoryHeroCounterValue(scene.value, '条')}</strong>
    </div>
  `;

  const renderRecordingSummaryGroup = (group) => `
    <section class="store-recording-summary-group tone-${escapeHtml(group.tone)}" aria-label="${escapeHtml(group.label)}">
      <div class="store-recording-summary-total">
        <span class="store-recording-summary-ribbon" aria-label="录音总计">
          <span class="store-recording-summary-level" aria-hidden="true">录音总计</span>
          <img class="store-recording-summary-ribbon-mask" src="../assets/store-core-metrics/recording-ribbon-mask.svg" alt="" aria-hidden="true">
        </span>
        ${metricBtn(group.label)}
        <div class="hm-label-row">
          ${renderStoreHeroMetricIcon(group.tone)}
          <div class="hm-label">${escapeHtml(group.label)}</div>
        </div>
        <div class="hm-val-row">
          <span class="hm-value" ${buildFactoryHeroCounterAttrs(group.value, group.unit)}>${renderFactoryHeroCounterValue(group.value, group.unit)}</span>
        </div>
      </div>
      ${group.scenes.length
        ? `<div class="store-recording-summary-breakdown">
            <div class="store-recording-summary-scenes" style="--recording-scene-count:${group.scenes.length}">${group.scenes.map(renderRecordingSummaryScene).join('')}</div>
          </div>`
        : ''}
    </section>
  `;

  const getFactoryRecordingSummaryData = () => {
    const selection = getFactorySceneSelection();
    const visibility = getRecordingSourceVisibility(currentSource, currentScenes);
    const selectedScenes = selection.isAllSelected
      ? selection.allowedScenes
      : selection.activeScenes;
    const cloudTotal = Number(ALL_KPI_DATA.invitation.num) || 0;
    const receptionTotal = Number(ALL_KPI_DATA.reception.num) || 0;
    const testDriveTotal = Number(ALL_KPI_DATA.test_drive.num) || 0;

    return buildFactoryRecordingSummary({
      selectedScenes,
      visibility,
      cloudTotal,
      badgeTotal: receptionTotal + testDriveTotal,
      sceneCounts: {
        [SCENE_KEYS.firstFollow]: getInvitationSceneCount(cloudTotal, SCENE_KEYS.firstFollow),
        [SCENE_KEYS.inviteStore]: getInvitationSceneCount(cloudTotal, SCENE_KEYS.inviteStore),
        [SCENE_KEYS.scheduleConfirm]: getInvitationSceneCount(cloudTotal, SCENE_KEYS.scheduleConfirm),
        [SCENE_KEYS.storeReception]: receptionTotal,
        [SCENE_KEYS.testDrive]: testDriveTotal
      }
    });
  };

  const renderFactoryRecordingSummary = () => {
    const summary = getFactoryRecordingSummaryData();
    const visibleGroups = [summary.cloud, summary.badge].filter((group) => group.visible);
    return `
      <div class="store-recording-summary${visibleGroups.length === 1 ? ' is-single-source' : ''}" aria-label="录音数统计">
        ${visibleGroups.map(renderRecordingSummaryGroup).join('')}
      </div>
    `;
  };

  const renderExecutionHeroKpiLayout = (kpiData, kpiItems) => {
    const bottomMetricCards = [];

    kpiItems.forEach((item) => {
      if (SUMMARY_GROUP_METRIC_KEYS.has(item.key)) return;

      const primaryMetricRaw = kpiData[item.key];
      const secondaryMetricRaw = item.pairedWith ? kpiData[item.pairedWith] : null;
      if (!primaryMetricRaw) return;

      const primaryMetric = buildFactoryHeroMetric(item.key, primaryMetricRaw);
      const secondaryMetric = secondaryMetricRaw ? buildFactoryHeroMetric(item.pairedWith, secondaryMetricRaw) : null;

      bottomMetricCards.push(renderSingleKpiMetric(primaryMetric));
      if (secondaryMetric) {
        bottomMetricCards.push(renderSingleKpiMetric(secondaryMetric));
      }
    });

    const layoutSections = [
      `<div class="hm-layout-top">${renderFactoryRecordingSummary()}</div>`
    ];
    if (bottomMetricCards.length) {
      layoutSections.push('<div class="hm-layout-divider" aria-hidden="true"></div>');
    }
    if (bottomMetricCards.length) {
      layoutSections.push(`<div class="hm-layout-bottom">${bottomMetricCards.join('')}</div>`);
    }

    return layoutSections.join('');
  };

  const buildFactoryFilteredKpiData = () => {
    const sceneKey = getEffectiveSceneKey();
    const nextData = Object.fromEntries(Object.entries(ALL_KPI_DATA).map(([key, value]) => [key, { ...value }]));

    if (sceneKey === SCENE_KEYS.firstFollow || sceneKey === SCENE_KEYS.inviteStore || sceneKey === SCENE_KEYS.scheduleConfirm) {
      nextData.invitation.num = String(getInvitationSceneCount(nextData.invitation.num, sceneKey));
      nextData.visit_rate.num = sceneKey === SCENE_KEYS.firstFollow ? '29.8' : sceneKey === SCENE_KEYS.inviteStore ? '36.4' : '43.2';
      nextData.hit_rate.num = sceneKey === SCENE_KEYS.firstFollow ? '76' : sceneKey === SCENE_KEYS.inviteStore ? '79' : '82';
      nextData.qa_pass_rate.num = sceneKey === SCENE_KEYS.firstFollow ? '78' : sceneKey === SCENE_KEYS.inviteStore ? '81' : '84';
      nextData.invitation.trend = sceneKey === SCENE_KEYS.firstFollow ? '↑1' : sceneKey === SCENE_KEYS.inviteStore ? '↑2' : '↑1';
      nextData.visit_rate.trend = sceneKey === SCENE_KEYS.firstFollow ? '↑3%' : sceneKey === SCENE_KEYS.inviteStore ? '↑5%' : '↑6%';
    } else if (sceneKey === SCENE_KEYS.cloudMulti) {
      nextData.invitation.num = String(nextData.invitation.num);
      nextData.visit_rate.num = '35.4';
      nextData.visit_rate.trend = '↑4%';
    }

    return nextData;
  };

  const renderHeroKPI = () => {
    const grid = document.getElementById("hero-kpi-grid");
    if (!grid) return;

    const sceneKey = getEffectiveSceneKey();
    const kpiData = buildFactoryFilteredKpiData();
    const kpiItems = SCENE_KPI_MAP[sceneKey] || SCENE_KPI_MAP.all;
    grid.className = 'hero-kpi-grid hero-metrics store-hero-metrics factory-hero-metrics-layout';
    grid.innerHTML = `<svg class="hero-funnel-svg" id="hero-funnel-svg" aria-hidden="true"></svg>${renderExecutionHeroKpiLayout(kpiData, kpiItems)}`;
    window.requestAnimationFrame(() => animateFactoryHeroCounters(grid));
  };
  // Tab 1 — 经营概览：三级排行榜 + 趋势图
  // ══════════════════════════════════════════════════

  // ── 排行榜数据（大区 → 战区 → 门店，三级）─────────
  const RANK_DATA = {
    regions: [
      {
        name: '华南大区', passRate: 82.3, validRec: 412, hitRate: 78.5, riskRate: 4.2, trend: 'up',
        zones: [
          {
            name: '广州战区', passRate: 85.1, validRec: 156, hitRate: 81.2, riskRate: 3.5, trend: 'up',
            stores: [
              { name: '广州天河店', passRate: 89.6, validRec: 48, hitRate: 84.3, riskRate: 2.8, trend: 'up' },
              { name: '广州白云店', passRate: 86.2, validRec: 42, hitRate: 82.1, riskRate: 3.1, trend: 'up' },
              { name: '广州番禺店', passRate: 82.5, validRec: 38, hitRate: 79.8, riskRate: 4.2, trend: 'down' },
              { name: '广州增城店', passRate: 78.4, validRec: 28, hitRate: 76.5, riskRate: 5.3, trend: 'up' }
            ]
          },
          {
            name: '深圳战区', passRate: 80.9, validRec: 134, hitRate: 77.6, riskRate: 4.8, trend: 'up',
            stores: [
              { name: '深圳南山店', passRate: 84.3, validRec: 52, hitRate: 80.2, riskRate: 3.6, trend: 'up' },
              { name: '深圳龙华店', passRate: 79.8, validRec: 46, hitRate: 76.5, riskRate: 5.1, trend: 'down' },
              { name: '深圳宝安店', passRate: 77.6, validRec: 36, hitRate: 74.8, riskRate: 5.9, trend: 'up' }
            ]
          },
          {
            name: '佛山战区', passRate: 78.4, validRec: 72, hitRate: 75.1, riskRate: 5.6, trend: 'down',
            stores: [
              { name: '佛山禅城店', passRate: 80.2, validRec: 40, hitRate: 77.3, riskRate: 5.0, trend: 'up' },
              { name: '佛山南海店', passRate: 75.8, validRec: 32, hitRate: 72.4, riskRate: 6.4, trend: 'down' }
            ]
          },
          {
            name: '东莞战区', passRate: 76.1, validRec: 50, hitRate: 73.2, riskRate: 6.8, trend: 'down',
            stores: [
              { name: '东莞莞城店', passRate: 78.5, validRec: 22, hitRate: 75.1, riskRate: 6.2, trend: 'up' },
              { name: '东莞虎门店', passRate: 74.6, validRec: 18, hitRate: 71.8, riskRate: 7.3, trend: 'down' },
              { name: '东莞长安店', passRate: 74.2, validRec: 10, hitRate: 70.6, riskRate: 7.5, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '华东大区', passRate: 78.6, validRec: 386, hitRate: 75.1, riskRate: 5.8, trend: 'up',
        zones: [
          {
            name: '上海战区', passRate: 81.4, validRec: 148, hitRate: 77.8, riskRate: 4.9, trend: 'up',
            stores: [
              { name: '上海浦东店', passRate: 85.2, validRec: 46, hitRate: 81.5, riskRate: 3.8, trend: 'up' },
              { name: '上海闵行店', passRate: 82.1, validRec: 42, hitRate: 78.6, riskRate: 4.5, trend: 'up' },
              { name: '上海嘉定店', passRate: 79.3, validRec: 36, hitRate: 75.4, riskRate: 5.8, trend: 'down' },
              { name: '上海松江店', passRate: 76.5, validRec: 24, hitRate: 72.9, riskRate: 6.4, trend: 'up' }
            ]
          },
          {
            name: '杭州战区', passRate: 79.2, validRec: 112, hitRate: 76.3, riskRate: 5.5, trend: 'up',
            stores: [
              { name: '杭州西湖店', passRate: 82.4, validRec: 44, hitRate: 79.1, riskRate: 4.8, trend: 'up' },
              { name: '杭州余杭店', passRate: 78.6, validRec: 40, hitRate: 75.2, riskRate: 5.6, trend: 'up' },
              { name: '杭州萧山店', passRate: 75.8, validRec: 28, hitRate: 72.1, riskRate: 6.5, trend: 'down' }
            ]
          },
          {
            name: '南京战区', passRate: 76.5, validRec: 72, hitRate: 73.4, riskRate: 6.7, trend: 'down',
            stores: [
              { name: '南京江宁店', passRate: 78.9, validRec: 40, hitRate: 75.6, riskRate: 6.1, trend: 'up' },
              { name: '南京建邺店', passRate: 73.8, validRec: 32, hitRate: 70.8, riskRate: 7.5, trend: 'down' }
            ]
          },
          {
            name: '苏州战区', passRate: 75.2, validRec: 54, hitRate: 72.1, riskRate: 7.2, trend: 'up',
            stores: [
              { name: '苏州工业园店', passRate: 77.4, validRec: 24, hitRate: 74.2, riskRate: 6.8, trend: 'up' },
              { name: '苏州吴中店', passRate: 74.8, validRec: 18, hitRate: 71.5, riskRate: 7.4, trend: 'up' },
              { name: '苏州昆山店', passRate: 72.6, validRec: 12, hitRate: 69.8, riskRate: 8.1, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '西南大区', passRate: 76.2, validRec: 298, hitRate: 73.8, riskRate: 6.1, trend: 'down',
        zones: [
          {
            name: '成都战区', passRate: 79.1, validRec: 128, hitRate: 76.2, riskRate: 5.4, trend: 'up',
            stores: [
              { name: '成都武侯店', passRate: 82.6, validRec: 42, hitRate: 79.3, riskRate: 4.6, trend: 'up' },
              { name: '成都锦江店', passRate: 79.8, validRec: 36, hitRate: 76.5, riskRate: 5.2, trend: 'up' },
              { name: '成都高新店', passRate: 77.4, validRec: 32, hitRate: 74.1, riskRate: 5.9, trend: 'down' },
              { name: '成都龙泉驿店', passRate: 74.2, validRec: 18, hitRate: 71.2, riskRate: 6.8, trend: 'down' }
            ]
          },
          {
            name: '重庆战区', passRate: 74.8, validRec: 96, hitRate: 71.9, riskRate: 6.8, trend: 'down',
            stores: [
              { name: '重庆渝北店', passRate: 77.2, validRec: 40, hitRate: 74.5, riskRate: 6.2, trend: 'up' },
              { name: '重庆九龙坡店', passRate: 74.1, validRec: 32, hitRate: 71.3, riskRate: 7.1, trend: 'down' },
              { name: '重庆南岸店', passRate: 71.8, validRec: 24, hitRate: 68.9, riskRate: 7.9, trend: 'down' }
            ]
          },
          {
            name: '昆明战区', passRate: 73.1, validRec: 74, hitRate: 70.2, riskRate: 7.5, trend: 'down',
            stores: [
              { name: '昆明官渡店', passRate: 75.4, validRec: 42, hitRate: 72.3, riskRate: 7.0, trend: 'up' },
              { name: '昆明盘龙店', passRate: 70.2, validRec: 32, hitRate: 67.6, riskRate: 8.2, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '华北大区', passRate: 74.1, validRec: 342, hitRate: 71.2, riskRate: 7.3, trend: 'up',
        zones: [
          {
            name: '北京战区', passRate: 76.8, validRec: 148, hitRate: 73.5, riskRate: 6.5, trend: 'up',
            stores: [
              { name: '北京朝阳店', passRate: 80.1, validRec: 52, hitRate: 77.2, riskRate: 5.6, trend: 'up' },
              { name: '北京海淀店', passRate: 77.4, validRec: 44, hitRate: 74.1, riskRate: 6.3, trend: 'up' },
              { name: '北京丰台店', passRate: 74.2, validRec: 32, hitRate: 71.3, riskRate: 7.1, trend: 'down' },
              { name: '北京通州店', passRate: 71.6, validRec: 20, hitRate: 68.5, riskRate: 7.9, trend: 'up' }
            ]
          },
          {
            name: '天津战区', passRate: 73.5, validRec: 88, hitRate: 70.6, riskRate: 7.8, trend: 'up',
            stores: [
              { name: '天津滨海店', passRate: 76.2, validRec: 48, hitRate: 73.1, riskRate: 7.2, trend: 'up' },
              { name: '天津南开店', passRate: 70.1, validRec: 40, hitRate: 67.5, riskRate: 8.7, trend: 'down' }
            ]
          },
          {
            name: '郑州战区', passRate: 71.8, validRec: 66, hitRate: 68.5, riskRate: 8.4, trend: 'down',
            stores: [
              { name: '郑州金水店', passRate: 73.4, validRec: 28, hitRate: 70.2, riskRate: 8.0, trend: 'up' },
              { name: '郑州中原店', passRate: 71.2, validRec: 22, hitRate: 68.1, riskRate: 8.6, trend: 'down' },
              { name: '郑州二七店', passRate: 69.8, validRec: 16, hitRate: 66.5, riskRate: 9.2, trend: 'down' }
            ]
          },
          {
            name: '石家庄战区', passRate: 70.4, validRec: 40, hitRate: 67.2, riskRate: 8.9, trend: 'down',
            stores: [
              { name: '石家庄裕华店', passRate: 72.1, validRec: 24, hitRate: 68.9, riskRate: 8.4, trend: 'up' },
              { name: '石家庄长安店', passRate: 68.2, validRec: 16, hitRate: 65.1, riskRate: 9.6, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '华中大区', passRate: 71.8, validRec: 215, hitRate: 69.5, riskRate: 8.5, trend: 'down',
        zones: [
          {
            name: '武汉战区', passRate: 74.2, validRec: 98, hitRate: 71.5, riskRate: 7.6, trend: 'up',
            stores: [
              { name: '武汉武昌店', passRate: 77.1, validRec: 38, hitRate: 74.2, riskRate: 7.0, trend: 'up' },
              { name: '武汉洪山店', passRate: 74.5, validRec: 32, hitRate: 71.6, riskRate: 7.8, trend: 'up' },
              { name: '武汉汉口店', passRate: 70.8, validRec: 28, hitRate: 68.1, riskRate: 8.4, trend: 'down' }
            ]
          },
          {
            name: '长沙战区', passRate: 71.3, validRec: 72, hitRate: 68.4, riskRate: 8.8, trend: 'down',
            stores: [
              { name: '长沙岳麓店', passRate: 73.6, validRec: 28, hitRate: 70.5, riskRate: 8.2, trend: 'up' },
              { name: '长沙雨花店', passRate: 71.2, validRec: 24, hitRate: 68.3, riskRate: 9.0, trend: 'down' },
              { name: '长沙开福店', passRate: 68.5, validRec: 20, hitRate: 65.2, riskRate: 9.8, trend: 'down' }
            ]
          },
          {
            name: '南昌战区', passRate: 68.9, validRec: 45, hitRate: 66.1, riskRate: 9.5, trend: 'down',
            stores: [
              { name: '南昌红谷店', passRate: 71.2, validRec: 26, hitRate: 68.3, riskRate: 9.0, trend: 'up' },
              { name: '南昌青山湖店', passRate: 65.8, validRec: 19, hitRate: 63.1, riskRate: 10.2, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '西北大区', passRate: 68.5, validRec: 98, hitRate: 66.2, riskRate: 9.8, trend: 'down',
        zones: [
          {
            name: '西安战区', passRate: 70.8, validRec: 58, hitRate: 68.1, riskRate: 9.1, trend: 'up',
            stores: [
              { name: '西安雁塔店', passRate: 73.4, validRec: 26, hitRate: 70.5, riskRate: 8.5, trend: 'up' },
              { name: '西安未央店', passRate: 70.1, validRec: 20, hitRate: 67.4, riskRate: 9.4, trend: 'up' },
              { name: '西安长安店', passRate: 67.8, validRec: 12, hitRate: 65.1, riskRate: 10.1, trend: 'down' }
            ]
          },
          {
            name: '兰州战区', passRate: 66.2, validRec: 28, hitRate: 63.5, riskRate: 10.8, trend: 'down',
            stores: [
              { name: '兰州城关店', passRate: 68.5, validRec: 16, hitRate: 65.8, riskRate: 10.2, trend: 'up' },
              { name: '兰州安宁店', passRate: 63.1, validRec: 12, hitRate: 60.4, riskRate: 11.6, trend: 'down' }
            ]
          },
          {
            name: '乌鲁木齐战区', passRate: 63.4, validRec: 12, hitRate: 61.2, riskRate: 12.5, trend: 'down',
            stores: [
              { name: '乌鲁木齐天山店', passRate: 63.4, validRec: 12, hitRate: 61.2, riskRate: 12.5, trend: 'down' }
            ]
          }
        ]
      },
      {
        name: '东北大区', passRate: 65.2, validRec: 72, hitRate: 63.1, riskRate: 11.2, trend: 'down',
        zones: [
          {
            name: '沈阳战区', passRate: 67.8, validRec: 36, hitRate: 65.2, riskRate: 10.5, trend: 'up',
            stores: [
              { name: '沈阳铁西店', passRate: 70.2, validRec: 16, hitRate: 67.5, riskRate: 9.8, trend: 'up' },
              { name: '沈阳皇姑店', passRate: 67.4, validRec: 12, hitRate: 64.8, riskRate: 10.8, trend: 'up' },
              { name: '沈阳浑南店', passRate: 64.5, validRec: 8, hitRate: 62.1, riskRate: 11.8, trend: 'down' }
            ]
          },
          {
            name: '哈尔滨战区', passRate: 63.2, validRec: 22, hitRate: 61.0, riskRate: 12.1, trend: 'down',
            stores: [
              { name: '哈尔滨南岗店', passRate: 65.4, validRec: 12, hitRate: 63.2, riskRate: 11.5, trend: 'up' },
              { name: '哈尔滨道里店', passRate: 60.8, validRec: 10, hitRate: 58.5, riskRate: 12.8, trend: 'down' }
            ]
          },
          {
            name: '长春战区', passRate: 62.1, validRec: 14, hitRate: 59.8, riskRate: 13.2, trend: 'down',
            stores: [
              { name: '长春朝阳店', passRate: 63.8, validRec: 8, hitRate: 61.4, riskRate: 12.8, trend: 'up' },
              { name: '长春南关店', passRate: 59.8, validRec: 6, hitRate: 57.5, riskRate: 14.0, trend: 'down' }
            ]
          }
        ]
      }
    ]
  };

  const buildFactorySharedRankRegions = () => {
    if (!sharedOrganizationDirectory) return RANK_DATA.regions;
    const records = getFactoryScopedRecordings();
    const regionMap = new Map();
    records.forEach((recording) => {
      const dealer = recording.dealer;
      if (!regionMap.has(dealer.area)) regionMap.set(dealer.area, new Map());
      const zoneMap = regionMap.get(dealer.area);
      if (!zoneMap.has(dealer.zone)) zoneMap.set(dealer.zone, new Map());
      const storeMap = zoneMap.get(dealer.zone);
      if (!storeMap.has(dealer.dealerName)) storeMap.set(dealer.dealerName, []);
      storeMap.get(dealer.dealerName).push(recording);
    });

    const makeMetricRow = (name, scopedRecords, extra = {}) => {
      const seed = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
      const passRate = Number((78 + (seed % 13) * 0.7).toFixed(1));
      return {
        name,
        validRec: scopedRecords.length,
        hitRate: Number(Math.max(68, passRate - 3.2).toFixed(1)),
        passRate,
        riskRate: Number(Math.max(1.8, 7.2 - (seed % 9) * 0.45).toFixed(1)),
        trend: seed % 4 === 0 ? 'down' : 'up',
        ...extra
      };
    };

    return [...regionMap.entries()].map(([regionName, zoneMap]) => {
      const zones = [...zoneMap.entries()].map(([zoneName, storeMap]) => {
        const stores = [...storeMap.entries()].map(([storeName, storeRecords]) => makeMetricRow(storeName, storeRecords));
        return makeMetricRow(zoneName, stores.flatMap((store) => Array.from({ length: store.validRec })), { stores });
      });
      return makeMetricRow(regionName, zones.flatMap((zone) => Array.from({ length: zone.validRec })), { zones });
    });
  };

  // ── 排行榜排序状态 ────────────────────────────────
  let rankSortKey = 'passRate';
  let rankSortDesc = true;
  let syncRankExpandToggle = () => {};

  const rankRecordingCounts = (r) => {
    const total = Number(r.validRec) || 0;
    const invitation = r.invitation ?? Math.round(total * 0.34);
    const testDrive = r.testDrive ?? r.test_drive ?? Math.round(total * 0.24);
    return {
      invitation,
      testDrive,
      reception: r.reception ?? Math.max(0, total - invitation - testDrive)
    };
  };

  const getRankSortValue = (row, key) => {
    const counts = rankRecordingCounts(row);
    if (key === 'invitation') return counts.invitation;
    if (key === 'testDrive') return counts.testDrive;
    if (key === 'reception') return counts.reception;
    return row[key];
  };

  // ── renderRankTable：支持三级展开 / 排序 ──────────
  const renderRankTable = () => {
    const wrap = document.getElementById('rank-table-wrap');
    const expandToggleBtn = document.getElementById('rank-expand-toggle');
    if (!wrap) return;

    // 动态标题
    const titleEl = document.getElementById('rank-title');
    const subEl   = document.getElementById('rank-sub');

    const rankRegions = buildFactorySharedRankRegions();

    // 决定当前显示哪一级数据
    let rows = [];
    let level = 'region'; // 'region' | 'zone' | 'store'

    if (currentStore !== 'all') {
      // 已选门店 → 不再展开，只显示该门店
      const region = rankRegions.find(r => r.name === currentRegion);
      const zone   = region?.zones.find(z => z.name === currentZone);
      rows = (zone?.stores || []).filter(s => s.name === currentStore);
      level = 'store';
      if (titleEl) titleEl.textContent = `${currentZone} · 门店详情`;
    } else if (currentZone !== 'all') {
      // 已选战区 → 显示门店列表
      const region = rankRegions.find(r => r.name === currentRegion);
      const zone   = region?.zones.find(z => z.name === currentZone);
      rows = zone?.stores || [];
      level = 'store';
      if (titleEl) titleEl.textContent = `${currentZone} · 门店排行`;
    } else if (currentRegion !== 'all') {
      // 已选大区 → 显示战区列表
      const region = rankRegions.find(r => r.name === currentRegion);
      rows = region?.zones || [];
      level = 'zone';
      if (titleEl) titleEl.textContent = `${currentRegion} · 战区排行`;
    } else {
      // 全国 → 显示大区（可展开战区）
      rows = rankRegions;
      level = 'region';
      if (titleEl) titleEl.textContent = 'SOP执行排行';
    }
    if (subEl) subEl.textContent = '支持下钻：大区-战区-门店，默认按照质检合格率降序排列';

    // 排序
    const sorted = [...rows].sort((a, b) => {
      const av = getRankSortValue(a, rankSortKey), bv = getRankSortValue(b, rankSortKey);
      return rankSortDesc ? bv - av : av - bv;
    });

    const rankColgroup = `
      <colgroup>
        <col style="width:8.31%">
        <col style="width:11.51%">
        <col style="width:15.76%">
        <col style="width:16.22%">
        <col style="width:16.07%">
        <col style="width:16.07%">
        <col style="width:16.06%">
      </colgroup>`;

    // 表头排序按钮
    const thBtn = (key, label, align = 'left') => {
      if (!key) {
        return `<th class="rank-th" style="text-align:${align};white-space:nowrap">${label}</th>`;
      }
      const active = rankSortKey === key;
      const sortDirectionClass = active ? (rankSortDesc ? ' is-desc' : ' is-asc') : '';
      const ariaSort = active ? (rankSortDesc ? 'descending' : 'ascending') : 'none';
      return `<th class="rank-th${active ? ' active' : ''}" data-sort="${key}" aria-sort="${ariaSort}" style="text-align:${align};cursor:pointer;user-select:none;white-space:nowrap">
        <span class="factory-rank-th-sort-content">${label}<span class="factory-rank-sort-indicator${sortDirectionClass}" aria-hidden="true"></span></span>
      </th>`;
    };

    // 行 HTML 生成
    const rowHtml = (r, i) => {
      const hasChildren = level !== 'store' && (
        (level === 'region' && r.zones?.length > 0) ||
        (level === 'zone' && r.stores?.length > 0)
      );
      const counts = rankRecordingCounts(r);
      const rowId = `rank-row-${r.name.replace(/\s/g, '_')}`;
      const expandId = `rank-expand-${r.name.replace(/\s/g, '_')}`;

      return `
        <tr class="rank-row${hasChildren ? ' rank-expandable' : ''}"
            id="${rowId}"
            ${hasChildren ? `data-expand-id="${expandId}"` : ''}
            style="cursor:${hasChildren ? 'pointer' : 'default'}"
            ${hasChildren ? `onclick="window._rankToggle('${expandId}', this)"` : ''}>
          <td>
            <span class="factory-rank-index">
              ${hasChildren
                ? `<svg class="rank-expand-icon" id="icon-${expandId}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`
                : ''}
              <span class="factory-rank-index-num">${i + 1}</span>
            </span>
          </td>
          <td><span class="factory-rank-name">${r.name}</span></td>
          <td><span class="factory-rank-number">${counts.invitation}</span></td>
          <td><span class="factory-rank-number">${counts.testDrive}</span></td>
          <td><span class="factory-rank-number">${counts.reception}</span></td>
          <td><span class="factory-rank-rate">${r.hitRate}%</span></td>
          <td><span class="factory-rank-rate factory-rank-pass">${r.passRate}%</span></td>
        </tr>
        ${hasChildren && level === 'region' ? `
        <tr id="${expandId}" class="rank-expand-panel" style="display:none">
          <td colspan="7" style="padding:0">
            <table class="factory-qc-rank-table factory-qc-rank-nested">
              ${rankColgroup}
              ${r.zones.map((z, zi) => {
                const zRowId   = `rank-row-${z.name.replace(/\s/g, '_')}`;
                const zExpandId = `rank-expand-${z.name.replace(/\s/g, '_')}`;
                const zCounts = rankRecordingCounts(z);
                return `
                  <tr class="rank-row rank-expandable" id="${zRowId}"
                      data-expand-id="${zExpandId}"
                      style="cursor:pointer"
                      onclick="window._rankToggle('${zExpandId}', this)">
                    <td>
                      <span class="factory-rank-index factory-rank-index-child">
                        <svg class="rank-expand-icon" id="icon-${zExpandId}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </span>
                    </td>
                    <td><span class="factory-rank-name factory-rank-name-child">${z.name}</span></td>
                    <td><span class="factory-rank-number">${zCounts.invitation}</span></td>
                    <td><span class="factory-rank-number">${zCounts.testDrive}</span></td>
                    <td><span class="factory-rank-number">${zCounts.reception}</span></td>
                    <td><span class="factory-rank-rate">${z.hitRate}%</span></td>
                    <td><span class="factory-rank-rate factory-rank-pass">${z.passRate}%</span></td>
                  </tr>
                  <tr id="${zExpandId}" class="rank-expand-panel" style="display:none">
                    <td colspan="7" style="padding:0">
                      <table class="factory-qc-rank-table factory-qc-rank-nested factory-qc-rank-store">
                        ${rankColgroup}
                        ${z.stores.map(s => {
                          const sCounts = rankRecordingCounts(s);
                          return `
                            <tr>
                              <td><span class="factory-rank-index factory-rank-index-store"></span></td>
                              <td><span class="factory-rank-name factory-rank-name-store">${s.name}</span></td>
                              <td><span class="factory-rank-number">${sCounts.invitation}</span></td>
                              <td><span class="factory-rank-number">${sCounts.testDrive}</span></td>
                              <td><span class="factory-rank-number">${sCounts.reception}</span></td>
                              <td><span class="factory-rank-rate">${s.hitRate}%</span></td>
                              <td><span class="factory-rank-rate factory-rank-pass">${s.passRate}%</span></td>
                            </tr>`;
                        }).join('')}
                      </table>
                    </td>
                  </tr>`;
              }).join('')}
            </table>
          </td>
        </tr>` : hasChildren && level === 'zone' ? `
        <tr id="${expandId}" class="rank-expand-panel" style="display:none">
          <td colspan="7" style="padding:0">
            <table class="factory-qc-rank-table factory-qc-rank-nested factory-qc-rank-store">
              ${rankColgroup}
              ${(r.stores || []).map(s => {
                const sCounts = rankRecordingCounts(s);
                return `
                  <tr>
                    <td><span class="factory-rank-index factory-rank-index-store"></span></td>
                    <td><span class="factory-rank-name factory-rank-name-store">${s.name}</span></td>
                    <td><span class="factory-rank-number">${sCounts.invitation}</span></td>
                    <td><span class="factory-rank-number">${sCounts.testDrive}</span></td>
                    <td><span class="factory-rank-number">${sCounts.reception}</span></td>
                    <td><span class="factory-rank-rate">${s.hitRate}%</span></td>
                    <td><span class="factory-rank-rate factory-rank-pass">${s.passRate}%</span></td>
                  </tr>`;
              }).join('')}
            </table>
          </td>
        </tr>` : ''}`;
    };

    wrap.innerHTML = `
      <table class="factory-qc-rank-table">
        ${rankColgroup}
        <thead>
          <tr>
            ${thBtn('', '排行', 'left')}
            ${thBtn('', '组织名称', 'left')}
            ${thBtn('invitation', '邀约录音数')}
            ${thBtn('testDrive', '试驾录音数')}
            ${thBtn('reception', '接待录音数')}
            ${thBtn('hitRate', '话术执行率')}
            ${thBtn('passRate', '质检合格率')}
          </tr>
        </thead>
        <tbody>
          ${sorted.map((r, i) => rowHtml(r, i)).join('')}
        </tbody>
      </table>`;

    // 绑定表头排序
    wrap.querySelectorAll('.rank-th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (!key) return;
        if (rankSortKey === key) {
          rankSortDesc = !rankSortDesc;
        } else {
          rankSortKey = key;
          rankSortDesc = true;
        }
        renderRankTable();
      });
    });

    syncRankExpandToggle = () => {
      if (!expandToggleBtn) return;
      const rows = Array.from(wrap.querySelectorAll('.rank-row.rank-expandable[data-expand-id]'));
      if (!rows.length) {
        expandToggleBtn.hidden = true;
        return;
      }
      const allOpen = rows.every(row => row.classList.contains('is-open'));
      expandToggleBtn.hidden = false;
      expandToggleBtn.textContent = allOpen ? '一键收起' : '一键展开';
      expandToggleBtn.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
    };

    if (expandToggleBtn) {
      expandToggleBtn.onclick = () => {
        const rows = Array.from(wrap.querySelectorAll('.rank-row.rank-expandable[data-expand-id]'));
        if (!rows.length) return;
        const shouldOpen = rows.some(row => !row.classList.contains('is-open'));
        rows.forEach(row => {
          const expandId = row.dataset.expandId;
          if (!expandId) return;
          window._rankToggle(expandId, row, shouldOpen);
        });
      };
    }

    syncRankExpandToggle();
  };

  // 展开/收起子行（全局函数，供内联 onclick 调用）
  window._rankToggle = function(expandId, rowEl, forceOpen) {
    const panel = document.getElementById(expandId);
    const icon  = document.getElementById('icon-' + expandId);
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
    panel.style.display = nextOpen ? 'table-row' : 'none';
    panel.classList.toggle('is-open', nextOpen);
    if (icon) icon.style.transform = nextOpen ? 'rotate(90deg)' : '';
    if (rowEl) {
      rowEl.style.background = nextOpen ? 'rgba(59,130,246,0.06)' : '';
      rowEl.classList.toggle('is-open', nextOpen);
    }
    syncRankExpandToggle();
  };

  // ── TREND_DATA — 按时间段的静态趋势数据 ──────────
  const TREND_DATA = {
    '1':  {
      labels: ['今日'],
      passRate:   [73.6],
      nationalAvg:[73.6],
      invitation: [156],
      reception:  [312],
      test_drive: [128],
      validRec:   [245]
    },
    '7': {
      labels: ['4-3','4-4','4-5','4-6','4-7','4-8','4-9'],
      passRate:   [71.2, 72.5, 70.8, 73.1, 74.5, 73.2, 73.6],
      nationalAvg:[72.0, 72.0, 72.0, 72.0, 72.0, 72.0, 72.0],
      invitation: [986, 1024, 958, 1102, 1156, 1098, 1086],
      reception:  [1853, 1942, 1812, 2018, 2156, 2098, 1978],
      test_drive: [812, 856, 798, 892, 986, 942, 876],
      validRec:   [1624, 1712, 1598, 1782, 1823, 1756, 1698]
    },
    '15': {
      labels: ['3-25','3-26','3-27','3-28','3-29','3-30','3-31','4-1','4-2','4-3','4-4','4-5','4-6','4-7','4-8'],
      passRate:   [68.4,69.2,70.1,69.8,71.2,70.5,71.8,72.1,71.5,71.2,72.5,70.8,73.1,74.5,73.2],
      nationalAvg:[72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0],
      invitation: [856,912,878,945,986,932,968,1012,978,986,1024,958,1102,1156,1098],
      reception:  [1624,1745,1682,1812,1853,1798,1842,1924,1856,1853,1942,1812,2018,2156,2098],
      test_drive: [712,768,745,812,825,786,824,856,814,812,856,798,892,986,942],
      validRec:   [1456,1582,1524,1648,1672,1612,1664,1742,1682,1624,1712,1598,1782,1823,1756]
    },
    '30': {
      labels: ['3-10','3-12','3-14','3-16','3-18','3-20','3-22','3-24','3-26','3-28','3-30','4-1','4-3','4-5','4-7'],
      passRate:   [65.2,66.5,67.8,68.1,69.4,68.9,70.2,71.5,69.8,71.2,70.5,72.1,71.2,70.8,74.5],
      nationalAvg:[72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0,72.0],
      invitation: [756,812,845,878,912,892,945,968,912,945,932,1012,986,958,1156],
      reception:  [1456,1562,1624,1682,1745,1712,1812,1853,1798,1812,1798,1924,1853,1812,2156],
      test_drive: [628,678,712,745,768,752,812,825,786,812,786,856,812,798,986],
      validRec:   [1284,1378,1456,1524,1582,1548,1648,1672,1612,1648,1612,1742,1624,1598,1823]
    }
  };

  // ── buildChart：Chart.js 趋势图 + 场景联动 ───────
  let trendChartInstance = null;

  const buildChart = (range) => {
    const canvas = document.getElementById('factory-trendChart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (trendChartInstance) { trendChartInstance.destroy(); trendChartInstance = null; }

    const d = TREND_DATA[range] || TREND_DATA['7'];
    const trendSubjectLabel = getFactoryTrendSubjectLabel();

    const trendSubEl = document.querySelector('#panel-sop-execution .trend-header .section-sub');
    if (trendSubEl) {
      trendSubEl.textContent = `${trendSubjectLabel}vs全国质检合格率`;
    }

    // 根据场景选择业务量数据
    let volData, volLabel;
    const sceneKey = getEffectiveSceneKey();
    if (sceneKey === SCENE_KEYS.firstFollow || sceneKey === SCENE_KEYS.inviteStore || sceneKey === SCENE_KEYS.scheduleConfirm) {
      volData = d.invitation.map((value) => getInvitationSceneCount(value, sceneKey));
      volLabel = getSceneVolumeLabel(sceneKey);
    } else if (sceneKey === SCENE_KEYS.cloudMulti) {
      volData = d.invitation;
      volLabel = getSceneVolumeLabel(sceneKey);
    } else if (sceneKey === SCENE_KEYS.storeReception) {
      volData = d.reception;
      volLabel = getSceneVolumeLabel(sceneKey);
    } else if (sceneKey === SCENE_KEYS.testDrive) {
      volData = d.test_drive;
      volLabel = getSceneVolumeLabel(sceneKey);
    } else {
      volData = d.validRec;
      volLabel = '有效录音量';
    }

    // 动态更新图例
    const legendEl = document.getElementById('chart-legend');
    if (legendEl) {
      legendEl.innerHTML = `
        <span class="legend-item"><span class="legend-dot" style="background:#3B82F6"></span>${trendSubjectLabel}</span>
        <span class="legend-item"><span class="legend-dot" style="background:#F59E0B;border-radius:0;height:2px;width:12px;margin-top:3px;display:inline-block"></span>全国质检合格率</span>
        <span class="legend-item"><span class="legend-dot" style="background:rgba(59,130,246,0.28);border-radius:2px"></span>${volLabel}</span>`;
    }

    trendChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: trendSubjectLabel,
            data: d.passRate,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#3B82F6',
            yAxisID: 'y'
          },
          {
            label: '全国质检合格率',
            data: d.nationalAvg,
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            fill: false,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: volLabel,
            data: volData,
            backgroundColor: 'rgba(59,130,246,0.13)',
            borderColor: 'rgba(37, 99, 235, 0.92)',
            borderWidth: 1.5,
            borderSkipped: 'bottom',
            borderRadius: 4,
            barPercentage: 0.55,
            categoryPercentage: 0.7,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#94A3B8',
            bodyColor: '#E2E8F0',
            titleFont: { size: 12, family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Fira Code', monospace" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.yAxisID === 'y') return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
                return ` ${ctx.dataset.label}: ${ctx.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#94A3B8', font: { size: 11 }, maxTicksLimit: 10 }
          },
          y: {
            position: 'left',
            min: 55,
            max: 100,
            grid: { color: '#F1F5F9' },
            border: { display: false },
            ticks: {
              color: '#94A3B8',
              font: { size: 11 },
              callback: v => v + '%'
            }
          },
          y1: {
            position: 'right',
            min: 0,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#94A3B8',
              font: { size: 11 },
              callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v
            }
          }
        }
      }
    });
  };

  // renderTrendChart 包装（供筛选更新和初始渲染调用）
  const renderTrendChart = () => {
    const range = !TREND_DATA[getFactoryTimeRangeKey()]
      ? '7'
      : getFactoryTimeRangeKey();
    buildChart(range);
  };

  // ══════════════════════════════════════════════════
  // Tab 2 — 行为分析：数据层
  // ══════════════════════════════════════════════════

  // ── 成交客户 数据 ─────────────────────────────────
  const DEAL_STATS = {
    total: 186,       // 成交客户总数
    avgCycle: 12.4,   // 平均成交周期（天）
    avgTouch: 3.8     // 平均触达次数
  };

  const DEAL_TOP5 = [
    {
      rank: 1, title: '确认客户想看车型_i60', hitRate: 91.4, count: 170,
      scope: 'shared',
      strategy: '下订客户中高频先完成车型倾向和用车场景确认，再进入产品介绍。建议将「纯电/增程倾向 + 城市通勤/长途驾驶」作为接待开场必检项，避免直接讲配置。',
      recordings: [
        { id: 'R-0401', advisor: '李昱', time: '3-25 10:30', score: 95 },
        { id: 'R-0293', advisor: '王萌', time: '3-24 15:30', score: 82 }
      ]
    },
    {
      rank: 2, title: '邀约话术_i60', hitRate: 86.0, count: 160,
      scope: 'shared',
      strategy: '成交客户在到店接待中更常被主动邀请试驾，并听到「车好不好要亲自感受」类体验引导。建议将试驾邀约前置到产品介绍后半段，而不是等客户主动提出。',
      recordings: [
        { id: 'R-0401', advisor: '李昱', time: '3-25 10:30', score: 95 },
        { id: 'R-0287', advisor: '张华', time: '3-24 09:50', score: 83 }
      ]
    },
    {
      rank: 3, title: '试驾手续办理_i60', hitRate: 82.3, count: 153,
      scope: 'multi',
      strategy: '成交样本中，顾问明确推进手机号、驾照和试驾手续办理的比例更高，说明试驾动作被真正落地。建议将「办理手续」从口头邀约后置动作改为可质检节点。',
      recordings: [
        { id: 'R-0401', advisor: '李昱', time: '3-25 10:30', score: 95 },
        { id: 'R-0375', advisor: '王萌', time: '3-23 10:00', score: 85 }
      ]
    },
    {
      rank: 4, title: '顺畅加速纯电/增程_i60', hitRate: 78.5, count: 146,
      scope: 'multi',
      strategy: '试驾中讲清加速、推背感、亏电状态超车等体验点，有助于让客户形成「开得爽」的直接感知。建议按能源版本分别配置纯电和增程加速话术。',
      recordings: [
        { id: 'R-0313', advisor: '李昱', time: '3-25 16:10', score: 91 }
      ]
    },
    {
      rank: 5, title: '舒适制动系统_i60', hitRate: 73.7, count: 137,
      scope: 'single',
      strategy: '成交客户更容易在试驾中被引导感知「刹车线性、不点头、不头晕」。建议把舒适制动演示放入固定试驾路线，并要求顾问先提醒客户留意体感。',
      recordings: [
        { id: 'R-0313', advisor: '李昱', time: '3-25 16:10', score: 91 }
      ]
    }
  ];

  DEAL_TOP5.push(
    {
      rank: 6, title: '8点按摩座椅_i60', hitRate: 68.8, count: 128,
      scope: 'single',
      strategy: '按摩座椅、享受感等舒适配置在家庭用户和长途用户中有较强促成作用。建议销售在客户试乘时直接打开功能，而不是只口头介绍。',
      recordings: [{ id: 'R-0331', advisor: '张华', time: '3-24 13:20', score: 88 }]
    },
    {
      rank: 7, title: '最长续航_增程/纯电_i60', hitRate: 65.1, count: 121,
      scope: 'multi',
      strategy: '下订客户更常听到按版本区分的续航解释：增程讲 210/1240 公里，纯电讲 75 度电池/650 公里和补能网络。建议避免泛泛说「续航够用」。',
      recordings: [{ id: 'R-0342', advisor: '王萌', time: '3-23 16:40', score: 86 }]
    },
    {
      rank: 8, title: '融合泊车辅助_i60', hitRate: 58.6, count: 109,
      scope: 'single',
      strategy: '回店泊车演示能形成最后的智能化记忆点，尤其对新手和家庭客户有效。建议将融合泊车辅助作为试驾回店前的固定收尾体验。',
      recordings: [{ id: 'R-0356', advisor: '赵强', time: '3-23 11:15', score: 84 }]
    },
    {
      rank: 9, title: '邀请回店_i60', hitRate: 53.8, count: 100,
      scope: 'multi',
      strategy: '试驾后询问满意度、顾虑和购车权益，是从体验转向成交动作的关键桥。建议把「这次试驾您还满意吗」纳入试驾后必检话术。',
      recordings: [{ id: 'R-0368', advisor: '李昱', time: '3-22 10:05', score: 83 }]
    },
    {
      rank: 10, title: '优势总结_i60', hitRate: 49.5, count: 92,
      scope: 'single',
      strategy: '成交客户更常在试驾后被加微信并接收 i60 视频、活动信息和权益材料。建议把优势总结从「客套结束」改为「微信承接 + 活动信息」闭环。',
      recordings: [{ id: 'R-0371', advisor: '林涛', time: '3-21 17:25', score: 81 }]
    }
  );

  // ── 战败客户 数据 ─────────────────────────────────
  const LOSS_STATS = {
    total: 128,       // 战败客户总数
    mainCompete: '比亚迪',  // 主要竞品
    avgDays: 8.6      // 平均流失周期（天）
  };

  const LOSS_TOP5 = [
    {
      rank: 1, title: '试驾邀约_i60缺失', hitRate: 74.2, count: 95,
      scope: 'shared',
      strategy: '战败客户中最高频缺口是没有主动邀请试驾，客户停留在静态看车阶段，无法形成真实体验差异。建议将「主动邀请客户亲自感受」设为接待必检项。',
      recordings: [
        { id: 'R-0312', advisor: '林涛', time: '3-25 15:20', score: 64 },
        { id: 'R-0278', advisor: '赵强', time: '3-23 09:30', score: 70 }
      ]
    },
    {
      rank: 2, title: '需求分析_i60未确认车型', hitRate: 68.0, count: 87,
      scope: 'shared',
      strategy: '未确认客户倾向纯电还是增程、城市通勤还是长途驾驶，后续讲解容易失焦。建议把需求分析作为所有接待录音的首个判定节点。',
      recordings: [
        { id: 'R-0312', advisor: '林涛', time: '3-25 15:20', score: 64 },
        { id: 'R-0305', advisor: '林涛', time: '3-25 09:20', score: 58 }
      ]
    },
    {
      rank: 3, title: '试驾手续办理_i60缺失', hitRate: 60.9, count: 78,
      scope: 'multi',
      strategy: '部分顾问虽然口头邀约试驾，但没有推进手机号、驾照和手续办理，导致试驾动作没有落地。建议区分「邀约试驾」和「办理试驾手续」两个质检点。',
      recordings: [
        { id: 'R-0310', advisor: '林涛', time: '3-25 14:00', score: 58 },
        { id: 'R-0309', advisor: '林涛', time: '3-25 13:30', score: 62 }
      ]
    },
    {
      rank: 4, title: '最长续航未按版本讲清_i60', hitRate: 55.5, count: 71,
      scope: 'multi',
      strategy: '战败客户常出现续航解释泛化，未区分增程 1240 公里综合续航与纯电 650 公里补能优势。建议根据客户倾向车型自动匹配版本化讲解脚本。',
      recordings: [
        { id: 'R-0306', advisor: '林涛', time: '3-25 10:45', score: 68 }
      ]
    },
    {
      rank: 5, title: '基础性能体验_i60缺失', hitRate: 51.6, count: 66,
      scope: 'single',
      strategy: '未演示顺畅加速、亏电超车或舒适制动，客户无法感知动态性能差异。建议试驾路线必须包含直线加速和制动体验点。',
      recordings: [
        { id: 'R-0410', advisor: '林涛', time: '3-25 15:00', score: 66 },
        { id: 'R-0395', advisor: '赵强', time: '3-24 16:20', score: 71 }
      ]
    }
  ];

  LOSS_TOP5.push(
    {
      rank: 6, title: '舒适操控体验_i60缺失', hitRate: 46.1, count: 59,
      scope: 'multi',
      strategy: '未覆盖按摩座椅、全景天幕、弯道、颠簸路段等舒适操控体验，导致 i60 的舒适价值没有被客户记住。建议按客户家庭/长途需求优先触发舒适体验项。',
      recordings: [{ id: 'R-0420', advisor: '张华', time: '3-24 18:10', score: 69 }]
    },
    {
      rank: 7, title: '高速领航辅助_i60未演示', hitRate: 39.8, count: 51,
      scope: 'single',
      strategy: '对关注智驾的客户，如果未演示跟车、变道、限速识别或匝道选择，容易被竞品智能化话术带走。建议智驾关注客户必须触发高速领航体验说明。',
      recordings: [{ id: 'R-0425', advisor: '王萌', time: '3-24 12:30', score: 67 }]
    },
    {
      rank: 8, title: '融合泊车辅助_i60未演示', hitRate: 35.9, count: 46,
      scope: 'single',
      strategy: '回店泊车未演示会损失临门一脚的智能化记忆点。建议试驾结束前固定安排一次融合泊车或遥控泊车辅助演示。',
      recordings: [{ id: 'R-0432', advisor: '赵强', time: '3-23 14:45', score: 65 }]
    },
    {
      rank: 9, title: '邀请回店_i60缺失', hitRate: 30.5, count: 39,
      scope: 'multi',
      strategy: '试驾后未询问满意度、顾虑和购车权益，客户体验没有被及时转成成交推进。建议把「满意度/顾虑/权益」三连问做成试驾回店必检项。',
      recordings: [{ id: 'R-0440', advisor: '李昱', time: '3-22 16:30', score: 66 }]
    },
    {
      rank: 10, title: '优势总结_i60缺失', hitRate: 26.6, count: 34,
      scope: 'single',
      strategy: '没有加微信、活动信息或最新视频承接，客户离店后难以继续触达。建议把试驾后优势总结与微信承接绑定，形成后续转化路径。',
      recordings: [{ id: 'R-0448', advisor: '林涛', time: '3-21 11:40', score: 63 }]
    }
  );

  // ── 邀约场景 TOP10 数据：到店客户 / 邀约失败客户 ─────
  const INVITE_STATS = {
    arrived: 216,
    failed: 148
  };

  const INVITE_ARRIVED_TOP10 = [
    {
      rank: 1, title: '询问意向车型', hitRate: 88.4, count: 191, scope: 'shared',
      strategy: '到店客户中，高质量邀约通常先确认客户当前关注车型，再围绕车型库存、配置和体验点设计到店理由。建议将「您目前主要看哪款车型」作为邀约开场必问项。',
      recordings: [{ id: 'R-0601', advisor: '王萌', time: '4-08 09:40', score: 92 }, { id: 'R-0608', advisor: '张华', time: '4-07 14:30', score: 89 }]
    },
    {
      rank: 2, title: '询问购车关注点', hitRate: 84.7, count: 183, scope: 'shared',
      strategy: '邀约到店客户更常被问到空间、动力、续航、舒适性等关注点。建议把关注点转成到店体验任务，例如「到店重点体验第三排空间和座椅舒适度」。',
      recordings: [{ id: 'R-0612', advisor: '李昱', time: '4-08 10:15', score: 91 }]
    },
    {
      rank: 3, title: '询问对比车型', hitRate: 78.2, count: 169, scope: 'multi',
      strategy: '客户提及竞品后，邀约成功率明显提升，因为顾问能给出更具体的对比理由。建议用「最近有没有看其他品牌」承接竞品线索，再邀约到店做实车对比。',
      recordings: [{ id: 'R-0616', advisor: '林涛', time: '4-08 11:20', score: 88 }]
    },
    {
      rank: 4, title: '询问增换购情况', hitRate: 72.6, count: 157, scope: 'multi',
      strategy: '确认增购或置换能帮助顾问匹配置换补贴、金融权益和评估服务。建议邀约话术加入「您现在开的是哪款车，是增购还是置换」。',
      recordings: [{ id: 'R-0620', advisor: '赵强', time: '4-07 16:05', score: 86 }]
    },
    {
      rank: 5, title: '询问计划购车时间', hitRate: 69.4, count: 150, scope: 'shared',
      strategy: '计划购车时间越明确，越适合给出限时权益和预约档期。建议将近期购车客户直接导向「本周到店锁定配置和试驾」。',
      recordings: [{ id: 'R-0626', advisor: '王萌', time: '4-07 10:50', score: 85 }]
    },
    {
      rank: 6, title: '开口邀请试乘试驾', hitRate: 65.3, count: 141, scope: 'shared',
      strategy: '邀约到店客户中，明确试乘试驾理由的话术更有效。建议从「您看这个周末有空吗」升级为「我提前帮您准备好试驾车和礼品」。',
      recordings: [{ id: 'R-0631', advisor: '张华', time: '4-06 15:40', score: 84 }]
    },
    {
      rank: 7, title: '开口邀请添加微信', hitRate: 62.5, count: 135, scope: 'multi',
      strategy: '添加微信能完成车型资料、门店地址和预约提醒的闭环承接。建议使用「我把资料和定位发您」替代单纯索要微信。',
      recordings: [{ id: 'R-0638', advisor: '李昱', time: '4-06 13:10', score: 83 }]
    },
    {
      rank: 8, title: '包装到店理由', hitRate: 58.8, count: 127, scope: 'multi',
      strategy: '只说「来店看看」转化弱，优秀邀约会绑定现车、试驾、权益或专属讲解。建议为每个车型准备 3 个标准到店理由。',
      recordings: [{ id: 'R-0642', advisor: '林涛', time: '4-05 17:20', score: 82 }]
    },
    {
      rank: 9, title: '明确到店时间', hitRate: 54.2, count: 117, scope: 'single',
      strategy: '模糊邀约容易流失，建议从「有空来」改为「周六上午还是下午方便，我帮您预约试驾档期」。',
      recordings: [{ id: 'R-0649', advisor: '赵强', time: '4-05 11:35', score: 80 }]
    },
    {
      rank: 10, title: '发送门店定位和资料', hitRate: 49.1, count: 106, scope: 'single',
      strategy: '邀约后未发送定位、资料和预约提醒，会导致到店意愿衰减。建议电话结束后 5 分钟内完成微信承接。',
      recordings: [{ id: 'R-0654', advisor: '王萌', time: '4-04 16:25', score: 79 }]
    }
  ];

  const INVITE_FAILED_TOP10 = [
    {
      rank: 1, title: '未建立到店价值', hitRate: 76.4, count: 113, scope: 'shared',
      strategy: '邀约失败样本中，最常见问题是只问客户有没有时间，没有给出值得到店的理由。建议围绕「现车体验、试驾预约、限时权益、配置讲解」设计到店钩子。',
      recordings: [{ id: 'R-0701', advisor: '林涛', time: '4-08 15:20', score: 58 }, { id: 'R-0706', advisor: '赵强', time: '4-07 09:30', score: 61 }]
    },
    {
      rank: 2, title: '机械询问未深挖需求', hitRate: 72.3, count: 107, scope: 'shared',
      strategy: '邀约失败话术常停留在「您要不要来店」，没有追问车型、预算、用途和关注点。建议先完成 2-3 个需求问题，再提出到店邀约。',
      recordings: [{ id: 'R-0710', advisor: '王萌', time: '4-08 10:00', score: 64 }]
    },
    {
      rank: 3, title: '未提出试乘试驾邀约', hitRate: 68.9, count: 102, scope: 'multi',
      strategy: '客户对产品有兴趣但未被引导试乘试驾，是邀约失败的高频原因。建议将试乘试驾作为首邀约动作，而不是等客户主动提出。',
      recordings: [{ id: 'R-0715', advisor: '张华', time: '4-07 14:20', score: 60 }]
    },
    {
      rank: 4, title: '未询问购车时间', hitRate: 64.2, count: 95, scope: 'multi',
      strategy: '不确认购车周期，无法判断邀约强度和权益话术。建议通过「近期有没有特别的时间安排」识别急迫程度。',
      recordings: [{ id: 'R-0720', advisor: '李昱', time: '4-06 16:10', score: 66 }]
    },
    {
      rank: 5, title: '客户拒绝后缺少二次邀约', hitRate: 59.5, count: 88, scope: 'shared',
      strategy: '客户说没空后，顾问直接结束通话会造成线索冷却。建议改为「那我先把资料发您，明天再帮您确认周末试驾档期」。',
      recordings: [{ id: 'R-0727', advisor: '赵强', time: '4-06 11:00', score: 62 }]
    },
    {
      rank: 6, title: '未添加微信承接', hitRate: 55.4, count: 82, scope: 'multi',
      strategy: '邀约失败后没有微信承接，后续无法持续触达。建议用门店定位、车型资料、活动信息作为添加微信理由。',
      recordings: [{ id: 'R-0732', advisor: '王萌', time: '4-05 13:45', score: 65 }]
    },
    {
      rank: 7, title: '竞品对比未承接', hitRate: 51.4, count: 76, scope: 'multi',
      strategy: '客户提到竞品时，如果只说「我们也不错」，无法形成到店动机。建议约客户到店做同级配置和空间实车对比。',
      recordings: [{ id: 'R-0738', advisor: '林涛', time: '4-05 10:30', score: 59 }]
    },
    {
      rank: 8, title: '邀约时间不具体', hitRate: 47.3, count: 70, scope: 'single',
      strategy: '「有空来」不具备执行性。建议顾问必须给出两个可选时间，并说明预约后能获得的具体服务。',
      recordings: [{ id: 'R-0744', advisor: '张华', time: '4-04 17:00', score: 63 }]
    },
    {
      rank: 9, title: '促销权益表达笼统', hitRate: 43.2, count: 64, scope: 'single',
      strategy: '只说「活动力度大」容易被客户忽略。建议明确权益类型、领取条件和到店确认动作，但避免过度承诺。',
      recordings: [{ id: 'R-0751', advisor: '李昱', time: '4-04 15:20', score: 67 }]
    },
    {
      rank: 10, title: '缺少下次跟进承诺', hitRate: 39.2, count: 58, scope: 'single',
      strategy: '邀约未成功也要留下下一次触达节点。建议在通话结束前明确「我明天下午再跟您确认时间」。',
      recordings: [{ id: 'R-0756', advisor: '赵强', time: '4-03 16:40', score: 64 }]
    }
  ];

  // ── TOP10 渲染辅助 ────────────────────────────────
  const scopeBadge = (scope) => {
    const map = {
      shared: { cls: 'scope-shared', label: '共性问题' },
      multi:  { cls: 'scope-multi',  label: '多人问题' },
      single: { cls: 'scope-single', label: '个人问题' }
    };
    const s = map[scope] || map.single;
    return `<span class="scope-badge ${s.cls}">${s.label}</span>`;
  };

  const formatRate = value => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(1);
  };

  const renderTopRecordings = (recordings = []) => {
    if (!recordings.length) {
      return '<div class="empty-hint">暂无关联录音</div>';
    }
    return recordings.map(r =>
      `<a class="rec-link" href="javascript:void(0)" onclick="event.stopPropagation();openRecordingPlayer('${r.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span class="rec-advisor">${r.advisor}</span>
        <span class="rec-time">${r.time}</span>
        ${typeof r.score === 'number' ? `<span style="margin-left:auto;font-family:var(--font-mono);font-size:var(--text-aux);color:${r.score >= 80 ? 'var(--color-success)' : r.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'};font-weight:600">${r.score}分</span>` : ''}
      </a>`
    ).join('');
  };

  const renderOutcomeSummary = (items, config, totalCount) => {
    const topItems = items.slice(0, 3);
    const topNames = topItems.map(item => `「${item.title}」`).join('、');
    const avgTopRate = topItems.reduce((sum, item) => sum + Number(item[config.rateKey] || 0), 0) / (topItems.length || 1);
    const tone = config.summaryTone || 'positive';
    const title = config.summaryTitle || '归因小结';
    const text = config.summaryText || `本期样本中，${topNames}最突出，TOP3 平均${config.rateLabel}${formatRate(avgTopRate)}%。展开细项可查看对应录音证据。`;
    return `
      <div class="outcome-summary-card ${tone}">
        <div class="outcome-summary-eyebrow">${config.summaryLabel || '结果归因'}</div>
        <div class="outcome-summary-title">${title}</div>
        <div class="outcome-summary-text">${text}</div>
      </div>`;
  };

  const renderFactoryTopSeries = (containerId, items, config) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const totalCount = config.totalCount || items.reduce((sum, item) => sum + (item.count || 0), 0);
    const summaryHtml = config.summary ? renderOutcomeSummary(items, config, totalCount) : '';
    const rowsHtml = items.map((item, i) => {
      const rateValue = item[config.rateKey] ?? 0;
      const rateText = `${formatRate(rateValue)}%`;
      const badgeHtml = config.showBadge === false ? '' : (config.badgeRenderer ? config.badgeRenderer(item) : scopeBadge(item.scope));
      const recordingsHtml = renderTopRecordings(item.recordings || []);
      return `
        <div class="issue-card outcome-issue-card" onclick="window.toggleIssue('${containerId}', ${i})" role="button" tabindex="0">
          <div class="issue-header">
            <div class="issue-rank">${item.rank || i + 1}</div>
            <div class="issue-info">
              <div class="issue-title-row">
                <span class="issue-title">${item.title}</span>
                ${badgeHtml}
              </div>
              <div class="issue-bar-row">
                <div class="issue-bar-track"><div class="issue-bar-fill" style="width:${rateValue}%;background:${config.color}"></div></div>
                <span class="issue-stat">${rateText}</span>
              </div>
            </div>
            <div class="action-hint"><span>查看策略与明细</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
          </div>
          <div class="issue-detail">
            <div class="issue-strategy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg><span><strong>${config.strategyLabel || '应对策略'}：</strong>${item.strategy}</span></div>
            <div class="issue-recordings">
              <div class="detail-label"><span class="dot-g" style="background:#64748B"></span>录音证据</div>
              ${recordingsHtml}
            </div>
          </div>
        </div>`;
    }).join('');
    el.innerHTML = `${summaryHtml}${rowsHtml}`;
  };

  // 本品洞察：意向车型 TOP5 + 客户标签分布
  // ══════════════════════════════════════════════════
  const INTENT_MODEL_DATA = [
    { model: '传祺 M8', count: 1842, customerCount: 986, focus: [
        { name: '空间大适合家庭', count: 1128, strategy: '重点展示第三排空间和座椅折叠灵活性，对比竞品空间数据。全国数据显示空间是 M8 最核心的成交驱动因素。', recordings: [{ advisor: '李昱', time: '4-08 10:30', id: 'R-0401' }, { advisor: '张华', time: '4-07 14:00', id: 'R-0388' }] },
        { name: '性价比高', count: 842, strategy: '突出同价位配置优势，用「配置清单对比法」量化价值差。全国 48.6% 的M8成交客户将性价比列为首要考虑。', recordings: [{ advisor: '王萌', time: '4-08 11:20', id: 'R-0403' }] },
        { name: '座椅舒适度', count: 624, strategy: '邀请客户体验零重力座椅，强调航空头等舱级座椅卖点。数据显示体验过座椅的客户成交率提升 35%。', recordings: [{ advisor: '李昱', time: '4-07 09:45', id: 'R-0382' }] }
      ], resist: [
        { name: '油耗偏高', count: 726, strategy: '引导关注综合用车成本，用年均行驶里程计算实际油费差异。建议准备实测油耗数据对比表。', recordings: [{ advisor: '林涛', time: '4-08 15:00', id: 'R-0410' }, { advisor: '赵强', time: '4-07 16:20', id: 'R-0395' }] },
        { name: '品牌认知度低', count: 542, strategy: '展示销量数据和用户口碑，引用第三方评测和获奖信息。建议将J.D. Power排名纳入标准话术。', recordings: [{ advisor: '张华', time: '4-08 09:30', id: 'R-0398' }] },
        { name: '保值率担忧', count: 386, strategy: '提供官方回购保障政策，展示二手车市场实际成交价参考。', recordings: [{ advisor: '王萌', time: '4-07 11:10', id: 'R-0385' }] }
      ] },
    { model: '传祺 E9', count: 1356, customerCount: 724, focus: [
        { name: '新能源免购置税', count: 892, strategy: '帮客户算清省税金额，对比燃油车落地价差异。购置税优势约1.5-2万元。', recordings: [{ advisor: '李昱', time: '4-08 14:20', id: 'R-0408' }] },
        { name: '商务接待合适', count: 712, strategy: '强调车内静谧性和后排豪华感，示范商务场景使用。NVH测试数据领先竞品。', recordings: [{ advisor: '张华', time: '4-07 15:40', id: 'R-0392' }] },
        { name: '智能驾驶辅助', count: 486, strategy: '安排试驾体验L2+辅助驾驶，突出安全和便捷性。建议设计专项体验路线。', recordings: [{ advisor: '王萌', time: '4-06 10:00', id: 'R-0375' }] }
      ], resist: [
        { name: '充电不便', count: 582, strategy: '展示周边充电桩分布图，介绍家充桩安装服务和费用。建议各区域准备本地充电网络地图。', recordings: [{ advisor: '赵强', time: '4-08 11:50', id: 'R-0404' }] },
        { name: '纯电续航焦虑', count: 468, strategy: '用客户日均通勤里程对比续航，证明覆盖率足够。展示长途出行的超充桩覆盖方案。', recordings: [{ advisor: '林涛', time: '4-07 13:30', id: 'R-0389' }] },
        { name: '售后网点少', count: 286, strategy: '展示服务网点规划图和上门取送车服务说明。新能源渠道正在快速扩张。', recordings: [{ advisor: '张华', time: '4-06 16:00', id: 'R-0380' }] }
      ] },
    { model: '传祺 GS8', count: 1124, customerCount: 612, focus: [
        { name: '外观大气', count: 742, strategy: '引导客户近距离感受车身线条和灯组设计细节。建议门店增加灯光展示环节。', recordings: [{ advisor: '李昱', time: '4-08 09:00', id: 'R-0397' }] },
        { name: '动力充足', count: 528, strategy: '安排山路或高速试驾路线，让客户亲身感受动力输出。2.0T发动机是核心卖点。', recordings: [{ advisor: '赵强', time: '4-07 10:30', id: 'R-0383' }] },
        { name: '四驱系统', count: 392, strategy: '展示四驱演示视频和越野场景测试数据。华北/西北区域重点推介。', recordings: [{ advisor: '王萌', time: '4-06 14:00', id: 'R-0377' }] }
      ], resist: [
        { name: '价格偏高', count: 486, strategy: '拆分配置价值，用「每日成本法」降低价格感知。充分利用金融方案降低月供。', recordings: [{ advisor: '林涛', time: '4-08 13:00', id: 'R-0406' }] },
        { name: '后排空间一般', count: 342, strategy: '邀请全家体验实车乘坐空间，弱化数据对比。GS8定位是运动型7座。', recordings: [{ advisor: '张华', time: '4-07 09:20', id: 'R-0381' }] },
        { name: '竞品汉兰达更保值', count: 218, strategy: '承认竞品优势，转向强调本品配置和价格优势。', recordings: [{ advisor: '李昱', time: '4-06 11:30', id: 'R-0376' }] }
      ] },
    { model: '传祺 影豹', count: 786, customerCount: 432, focus: [
        { name: '外观运动', count: 512, strategy: '突出运动套件设计，展示改装案例和用户分享。年轻群体核心关注点。', recordings: [{ advisor: '王萌', time: '4-08 16:00', id: 'R-0412' }] },
        { name: '操控好', count: 356, strategy: '安排弯道试驾体验，对比同级操控表现数据。1.5T+7DCT动力总成标定优秀。', recordings: [{ advisor: '赵强', time: '4-07 14:30', id: 'R-0390' }] },
        { name: '年轻化设计', count: 284, strategy: '强调目标用户定位，展示年轻车主社群和活动。', recordings: [{ advisor: '李昱', time: '4-06 09:00', id: 'R-0372' }] }
      ], resist: [
        { name: '后排空间小', count: 312, strategy: '定位为个人座驾，弱化空间需求，强化驾驶乐趣。', recordings: [{ advisor: '林涛', time: '4-08 10:00', id: 'R-0399' }] },
        { name: '品牌溢价不足', count: 186, strategy: '用配置和性能数据证明产品力，淡化品牌比较。', recordings: [{ advisor: '张华', time: '4-07 11:40', id: 'R-0386' }] }
      ] },
    { model: '传祺 GS4', count: 568, customerCount: 324, focus: [
        { name: '价格亲民', count: 386, strategy: '强调入门即高配，展示同价位竞品配置差距。', recordings: [{ advisor: '赵强', time: '4-08 15:30', id: 'R-0411' }] },
        { name: '配置丰富', count: 298, strategy: '逐项展示配置亮点，用配置表直观对比竞品。', recordings: [{ advisor: '李昱', time: '4-07 16:00', id: 'R-0394' }] },
        { name: '油耗低', count: 186, strategy: '展示实测油耗数据和车主实际油耗反馈。', recordings: [{ advisor: '林涛', time: '4-06 10:30', id: 'R-0374' }] }
      ], resist: [
        { name: '动力偏弱', count: 224, strategy: '引导关注日常驾驶够用性，强调平顺和燃油经济性。', recordings: [{ advisor: '张华', time: '4-08 14:00', id: 'R-0407' }] },
        { name: '内饰质感一般', count: 126, strategy: '展示内饰升级改款，强调实用性和耐用性。', recordings: [{ advisor: '王萌', time: '4-07 13:00', id: 'R-0387' }] }
      ] }
  ];

  INTENT_MODEL_DATA.push(
    { model: '传祺 E8', count: 486, customerCount: 276, focus: [
        { name: '新能源家用', count: 328, strategy: '强调城市通勤低成本和家庭多人出行舒适性，建议用一周通勤成本做直观测算。', recordings: [{ advisor: '李昱', time: '4-08 13:20', id: 'R-0451' }] },
        { name: '空间灵活', count: 296, strategy: '安排二三排座椅变化演示，让客户看到儿童座椅、露营和接送场景的空间弹性。', recordings: [{ advisor: '王萌', time: '4-07 17:10', id: 'R-0458' }] }
      ], resist: [
        { name: '续航焦虑', count: 214, strategy: '用客户日均里程倒推纯电覆盖率，并展示周边充电网络。', recordings: [{ advisor: '赵强', time: '4-07 10:40', id: 'R-0462' }] }
      ] },
    { model: '传祺 S7', count: 412, customerCount: 238, focus: [
        { name: '智能座舱', count: 286, strategy: '建议门店设置语音控制、导航联动和智能泊车三段式体验，降低客户学习成本。', recordings: [{ advisor: '张华', time: '4-08 15:10', id: 'R-0470' }] },
        { name: '外观科技感', count: 228, strategy: '面向年轻客户强化灯组、轮毂和座舱氛围的视觉记忆点。', recordings: [{ advisor: '林涛', time: '4-06 14:35', id: 'R-0476' }] }
      ], resist: [
        { name: '品牌认知', count: 166, strategy: '补充销量、口碑和安全评测素材，避免只讲配置。', recordings: [{ advisor: '王萌', time: '4-05 16:45', id: 'R-0480' }] }
      ] },
    { model: '传祺 ES9', count: 364, customerCount: 206, focus: [
        { name: '长途自驾', count: 248, strategy: '重点演示长续航和补能方案，用节假日出行场景建立价值感。', recordings: [{ advisor: '赵强', time: '4-08 12:00', id: 'R-0486' }] },
        { name: '大七座', count: 216, strategy: '邀请客户全家试乘，强调第三排和后备厢兼顾能力。', recordings: [{ advisor: '李昱', time: '4-07 13:20', id: 'R-0491' }] }
      ], resist: [
        { name: '价格门槛', count: 142, strategy: '用金融方案和置换权益拆解一次性支出压力。', recordings: [{ advisor: '张华', time: '4-06 10:25', id: 'R-0496' }] }
      ] },
    { model: '传祺 M6', count: 318, customerCount: 184, focus: [
        { name: '入门MPV', count: 226, strategy: '突出低预算多人出行场景，对比同价位轿车和SUV空间差异。', recordings: [{ advisor: '林涛', time: '4-08 09:45', id: 'R-0501' }] },
        { name: '经济实用', count: 184, strategy: '强调保养成本和日常使用便利，适合家庭第一台多座车。', recordings: [{ advisor: '王萌', time: '4-07 15:15', id: 'R-0507' }] }
      ], resist: [
        { name: '动力担忧', count: 118, strategy: '通过城市路况试驾证明日常够用，并引导关注空间与成本。', recordings: [{ advisor: '赵强', time: '4-06 11:55', id: 'R-0512' }] }
      ] },
    { model: '传祺 Empow R', count: 276, customerCount: 156, focus: [
        { name: '运动性能', count: 198, strategy: '安排短途动态体验，强化加速、转向和声浪记忆点。', recordings: [{ advisor: '张华', time: '4-08 16:25', id: 'R-0520' }] },
        { name: '年轻社群', count: 146, strategy: '推荐车主活动和改装案例，让客户看到长期拥有后的圈层价值。', recordings: [{ advisor: '李昱', time: '4-07 12:35', id: 'R-0526' }] }
      ], resist: [
        { name: '家用空间', count: 96, strategy: '明确性能车定位，同时提供 GS4/GS8 作为家庭诉求的备选方案。', recordings: [{ advisor: '林涛', time: '4-06 17:05', id: 'R-0531' }] }
      ] }
  );

  const MODEL_TAG_DATA = {
    M8: {
      positive: [
        { name: '空间大', count: 2156, customerCount: 1245, strategy: '重点展示第三排空间和座椅折叠灵活性。', recordings: [{ advisor: '李昱', time: '4-08 10:30', id: 'R-0401' }] },
        { name: '座椅舒适', count: 1728, customerCount: 986, strategy: '邀请全家实车体验零重力座椅。', recordings: [{ advisor: '张华', time: '4-07 14:00', id: 'R-0388' }] },
        { name: '性价比高', count: 1382, customerCount: 842, strategy: '突出同价位配置优势，用配置清单对比法量化。', recordings: [{ advisor: '王萌', time: '4-08 11:20', id: 'R-0403' }] },
        { name: '外观大气', count: 1124, customerCount: 686, strategy: '引导客户近距离感受车身线条和灯组设计。', recordings: [] },
        { name: '配置丰富', count: 926, customerCount: 542, strategy: '逐项展示配置亮点，对比竞品。', recordings: [{ advisor: '赵强', time: '4-07 10:15', id: 'R-0289' }] }
      ],
      negative: [
        { name: '油耗偏高', count: 1236, customerCount: 782, strategy: '引导关注综合用车成本，用年均行驶里程计算实际油费差异。', recordings: [{ advisor: '林涛', time: '4-08 15:00', id: 'R-0410' }] },
        { name: '品牌认知低', count: 986, customerCount: 624, strategy: '展示销量数据和用户口碑，引用第三方评测。', recordings: [{ advisor: '张华', time: '4-08 09:30', id: 'R-0398' }] },
        { name: '保值率担忧', count: 842, customerCount: 486, strategy: '提供官方回购保障政策。', recordings: [{ advisor: '王萌', time: '4-07 11:10', id: 'R-0385' }] },
        { name: '价格敏感', count: 726, customerCount: 412, strategy: '主推低首付金融方案。', recordings: [{ advisor: '李昱', time: '4-08 16:10', id: 'R-0313' }] },
        { name: '售后网点少', count: 482, customerCount: 286, strategy: '展示服务网点规划图和上门取送车服务。', recordings: [{ advisor: '张华', time: '4-06 16:00', id: 'R-0380' }] }
      ],
      neutral: [
        { name: '三口之家', count: 1542, customerCount: 926 },
        { name: '商务接待', count: 1128, customerCount: 724 },
        { name: '二胎家庭', count: 924, customerCount: 542 },
        { name: '自驾游', count: 624, customerCount: 386 }
      ]
    },
    S7: {
      positive: [
        { name: '智能座舱', count: 1856, customerCount: 1342 },
        { name: '续航够用', count: 1482, customerCount: 1024 },
        { name: '外观时尚', count: 1236, customerCount: 912 },
        { name: '动力充沛', count: 986, customerCount: 672 },
        { name: '科技感强', count: 742, customerCount: 486 }
      ],
      negative: [
        { name: '充电设施', count: 1124, customerCount: 786 },
        { name: '续航虚标', count: 842, customerCount: 586 },
        { name: '品牌认知', count: 624, customerCount: 412 }
      ],
      neutral: [
        { name: '年轻白领', count: 1342, customerCount: 924 },
        { name: '科技爱好者', count: 986, customerCount: 642 },
        { name: '城市通勤', count: 842, customerCount: 586 }
      ]
    },
    GS8: {
      positive: [
        { name: '外观大气', count: 1542, customerCount: 986 },
        { name: '动力充足', count: 1286, customerCount: 842 },
        { name: '四驱可靠', count: 986, customerCount: 624 },
        { name: '空间大', count: 842, customerCount: 542 }
      ],
      negative: [
        { name: '价格偏高', count: 1024, customerCount: 686 },
        { name: '油耗偏高', count: 842, customerCount: 542 },
        { name: '保值率', count: 624, customerCount: 386 }
      ],
      neutral: [
        { name: '中产家庭', count: 1124, customerCount: 742 },
        { name: '越野爱好', count: 642, customerCount: 412 },
        { name: '长途自驾', count: 486, customerCount: 312 }
      ]
    },
    E8: {
      positive: [
        { name: '新能源政策', count: 1286, customerCount: 842 },
        { name: '智能化', count: 1024, customerCount: 686 },
        { name: '用车成本低', count: 842, customerCount: 542 }
      ],
      negative: [
        { name: '充电焦虑', count: 986, customerCount: 642 },
        { name: '品牌力', count: 724, customerCount: 486 },
        { name: '保值率', count: 542, customerCount: 342 }
      ],
      neutral: [
        { name: '新能源接受者', count: 1124, customerCount: 742 },
        { name: '家庭第二台车', count: 842, customerCount: 542 }
      ]
    }
  };

  // ── 本品洞察渲染函数 ─────────────────────────────
  const renderTagItem = (tag, cssClass) => {
    const recsHtml = tag.recordings ? tag.recordings.map(r =>
      `<a class="rec-link" href="javascript:void(0)" onclick="event.stopPropagation();openRecordingPlayer('${r.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span class="rec-advisor">${r.advisor}</span><span class="rec-time">${r.time}</span>
      </a>`).join('') : '';
    return `<div class="tag-card ${cssClass}" onclick="event.stopPropagation();this.classList.toggle('tag-expanded')">
      <div class="tag-card-header">
        <span class="detail-tag ${cssClass}">${tag.name}</span>
        <span class="tag-hit-count">${tag.count}次</span>
          <div class="action-hint"><span>查看明细</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="tag-card-detail">
        ${tag.strategy ? `<div class="ai-strategy-card">
          <div class="ai-strategy-label"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></svg> AI 建议策略</div>
          <div class="ai-strategy-text">${tag.strategy}</div>
        </div>` : ''}
        <div class="tag-recordings">${recsHtml}</div>
      </div>
    </div>`;
  };

  const renderInsightList = (containerId, data, type, totalCount, totalCustomer) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = data.map((item, i) => {
      const rankClass = i < 3 ? ` r${i + 1}` : '';
      let detailHtml = '';
      if (type === 'intent') {
        detailHtml = `
          <div class="insight-detail" id="${containerId}-detail-${i}">
            <div class="detail-group">
              <div class="detail-label"><span class="dot-g" style="background:#2563EB"></span>本品关注点</div>
              <div class="tag-cards-list">${item.focus.map(t => renderTagItem(t, 'focus')).join('')}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label"><span class="dot-g" style="background:#DC2626"></span>抗拒点</div>
              <div class="tag-cards-list">${item.resist.map(t => renderTagItem(t, 'resist')).join('')}</div>
            </div>
          </div>`;
      } else {
        detailHtml = `
          <div class="insight-detail" id="${containerId}-detail-${i}">
            <div class="detail-group">
              <div class="detail-label"><span class="dot-g" style="background:#7C3AED"></span>客户提及的竞品优势</div>
              <div class="tag-cards-list">${(item.advantages || []).map(t => renderTagItem(t, 'resist')).join('')}</div>
            </div>
          </div>`;
      }
      const hintText = type === 'compete' ? '拆解竞品优势' : '拆解意向与抗拒';
      return `
        <div class="insight-row" onclick="window.toggleInsight('${containerId}',${i})" role="button" tabindex="0">
          <div class="insight-rank${rankClass}">${i + 1}</div>
          <div class="insight-model">${item.model}</div>
          <div class="insight-count"><span class="ic-label">提及数</span><span class="ic-val">${item.count}/${totalCount}</span><span class="ic-dot">·</span><span class="ic-label">客户数</span><span class="ic-val">${item.customerCount}/${totalCustomer}</span></div>
          <div class="action-hint"><span>${hintText}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        ${detailHtml}`;
    }).join('');
  };

  window.toggleInsight = (containerId, idx) => {
    const row = document.querySelectorAll(`#${containerId} .insight-row`)[idx];
    const detail = document.getElementById(`${containerId}-detail-${idx}`);
    if (!row || !detail) return;
    const isOpen = row.classList.contains('active');
    document.querySelectorAll(`#${containerId} .insight-row`).forEach(r => r.classList.remove('active'));
    document.querySelectorAll(`#${containerId} .insight-detail`).forEach(d => d.classList.remove('show'));
    if (!isOpen) {
      row.classList.add('active');
      detail.classList.add('show');
    }
  };

  const PRODUCT_FOCUS_CLOUD = [
    { name: '空间大', count: 2156 },
    { name: '座椅舒适', count: 1728 },
    { name: '性价比高', count: 1382 },
    { name: '智能座舱', count: 1186 },
    { name: '外观大气', count: 1124 },
    { name: '配置丰富', count: 926 },
    { name: '用车成本', count: 842 },
    { name: '油耗续航', count: 736 },
    { name: '品牌认知', count: 624 },
    { name: '售后服务', count: 486 }
  ];

  const PRODUCT_RESIST_CLOUD = [
    { name: '油耗偏高', count: 1236 },
    { name: '价格偏高', count: 1024 },
    { name: '品牌认知低', count: 986 },
    { name: '续航焦虑', count: 842 },
    { name: '保值率担忧', count: 842 },
    { name: '充电不便', count: 786 },
    { name: '价格敏感', count: 726 },
    { name: '后排空间一般', count: 542 },
    { name: '售后网点少', count: 482 },
    { name: '动力担忧', count: 368 }
  ];

  const PRODUCT_MODEL_CLOUD = INTENT_MODEL_DATA.map(item => ({
    name: item.model.replace(/\s+/g, ''),
    count: item.count
  }));

  const MODEL_CLOUD_PALETTES = {
    model: [
      { bg: '#DBEAFE', text: '#1D4ED8' },
      { bg: '#E0F2FE', text: '#0369A1' },
      { bg: '#DCFCE7', text: '#15803D' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#F1F5F9', text: '#475569' }
    ],
    focus: [
      { bg: '#ECFDF5', text: '#047857' },
      { bg: '#EFF6FF', text: '#2563EB' },
      { bg: '#FFFBEB', text: '#D97706' },
      { bg: '#FEF2F2', text: '#DC2626' },
      { bg: '#F8FAFC', text: '#64748B' }
    ],
    resist: [
      { bg: '#FEF2F2', text: '#DC2626' },
      { bg: '#FFF7ED', text: '#EA580C' },
      { bg: '#FFFBEB', text: '#D97706' },
      { bg: '#F1F5F9', text: '#475569' },
      { bg: '#EFF6FF', text: '#2563EB' }
    ]
  };

  const renderProductCloud = (containerId, data, palette) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!data.length) {
      el.innerHTML = '<span class="cloud-word" style="font-size:14px;color:#64748B;background:#F8FAFC">暂无数据</span>';
      return;
    }
    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));
    el.innerHTML = data.map((item, idx) => {
      const fontSize = 14 + ((item.count - minCount) / (maxCount - minCount || 1)) * 14;
      const weight = Math.round(((item.count - minCount) / (maxCount - minCount || 1)) * 8) + 2;
      const colors = palette[idx % palette.length];
      return `<span class="cloud-word" style="font-size:${fontSize}px;font-weight:${weight};color:${colors.text};background:${colors.bg}" title="提及次数: ${item.count}">${item.name}</span>`;
    }).join('');
  };

  const formatInsightOverviewPct = (part, total) => {
    if (!total) return '0.0%';
    return `${(part / total * 100).toFixed(1)}%`;
  };

  const renderOverviewItem = (item) => `
    <div class="insight-overview-item ${item.tone || 'blue'}">
      <div class="insight-overview-icon" aria-hidden="true">${item.icon}</div>
      <div class="insight-overview-copy">
        <div class="insight-overview-label">${item.label}</div>
        <div class="insight-overview-value">${item.value}</div>
        <div class="insight-overview-meta">${item.meta}</div>
      </div>
    </div>`;

  const renderProductInsightOverview = () => {
    const el = document.getElementById('product-insight-overview');
    if (!el) return;

    const tags = MODEL_TAG_DATA[currentModel];
    const focusItems = currentModel === 'all'
      ? [...PRODUCT_FOCUS_CLOUD]
      : [...(tags?.positive || PRODUCT_FOCUS_CLOUD)];
    const riskItems = currentModel === 'all'
      ? [...PRODUCT_RESIST_CLOUD]
      : [...(tags?.negative || PRODUCT_RESIST_CLOUD)];
    const totalFocus = focusItems.reduce((sum, item) => sum + item.count, 0);
    const totalRisk = riskItems.reduce((sum, item) => sum + item.count, 0);
    const topFocus = focusItems.slice().sort((a, b) => b.count - a.count).slice(0, 3);
    const topRisk = riskItems.slice().sort((a, b) => b.count - a.count)[0] || { name: '暂无风险点', count: 0 };
    const opportunity = focusItems.find(item => /智能|座舱|配置|服务/.test(item.name)) || topFocus[2] || topFocus[0] || { name: '核心卖点', count: 0 };
    const scopeText = currentModel === 'all' ? '全车系' : currentModel;

    const items = [
      {
        label: '用户最关注',
        value: topFocus.map(item => item.name).join(' / ') || '暂无高频关注',
        meta: `${scopeText} 占关注提及量 ${formatInsightOverviewPct(topFocus.reduce((sum, item) => sum + item.count, 0), totalFocus)}`,
        tone: 'hot',
        icon: '<svg viewBox="0 0 24 24"><path d="M13.5 2.5c.2 3-1.4 4.8-3.1 6.3-1.6 1.4-3.1 2.9-3.1 5.5a5.2 5.2 0 0 0 10.4 0c0-2.2-1.1-4.1-2.6-5.7.1 1.7-.7 3-1.9 3.8.3-2.3-.3-4.8-2.1-6.7Z"/></svg>'
      },
      {
        label: '风险点',
        value: `${topRisk.name}，高频提及`,
        meta: `抗拒提及 ${topRisk.count} 次`,
        tone: 'risk',
        icon: '<svg viewBox="0 0 24 24"><path d="M11 4.4 3.4 18a1.3 1.3 0 0 0 1.1 2h15a1.3 1.3 0 0 0 1.1-2L13 4.4a1.2 1.2 0 0 0-2 0Z"/><path d="M12 8.5v4.8M12 16.8h.01"/></svg>'
      },
      {
        label: '机会点',
        value: `${opportunity.name}认知不足`,
        meta: `相关问题占比 ${formatInsightOverviewPct(opportunity.count, totalFocus + totalRisk)}`,
        tone: 'chance',
        icon: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8.2 14.3a6 6 0 1 1 7.6 0c-.8.6-1.2 1.5-1.2 2.4H9.4c0-.9-.4-1.8-1.2-2.4Z"/></svg>'
      },
      {
        label: '推荐动作',
        value: `主推“${topFocus[0]?.name || '核心卖点'} + ${topRisk.name}”`,
        meta: '组合话术转化率更高',
        tone: 'action',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M22 12h-4M12 22v-4M2 12h4"/></svg>'
      }
    ];

    el.innerHTML = items.map(renderOverviewItem).join('');
  };

  const renderProductClouds = () => {
    renderProductInsightOverview();
    const subEl = document.getElementById('product-cloud-sub');
    const primaryTitle = document.getElementById('product-primary-cloud-title');
    const secondaryTitle = document.getElementById('product-secondary-cloud-title');
    const modelTags = MODEL_TAG_DATA[currentModel];

    if (currentModel === 'all') {
      if (subEl) subEl.textContent = '本品关注车型词云 · 本品关注点词云 · 本品关注 TOP10';
      if (primaryTitle) primaryTitle.textContent = '本品关注车型词云';
      if (secondaryTitle) secondaryTitle.textContent = '本品关注点词云';
      renderProductCloud('product-focus-cloud', PRODUCT_MODEL_CLOUD, MODEL_CLOUD_PALETTES.model);
      renderProductCloud('product-resist-cloud', PRODUCT_FOCUS_CLOUD, MODEL_CLOUD_PALETTES.focus);
      return;
    }

    if (subEl) subEl.textContent = '本品关注点词云 · 本品抗拒点词云 · 本品关注 TOP10';
    if (primaryTitle) primaryTitle.textContent = '本品关注点词云';
    if (secondaryTitle) secondaryTitle.textContent = '本品抗拒点词云';
    renderProductCloud('product-focus-cloud', modelTags?.positive || PRODUCT_FOCUS_CLOUD, MODEL_CLOUD_PALETTES.focus);
    renderProductCloud('product-resist-cloud', modelTags?.negative || PRODUCT_RESIST_CLOUD, MODEL_CLOUD_PALETTES.resist);
  };

  const renderInsightSection = () => {
    const body = document.getElementById('insight-body');
    const titleEl = document.getElementById('product-top-title');
    const subEl = document.getElementById('product-top-sub');
    if (!body) return;
    if (currentModel === 'all') {
      if (titleEl) titleEl.textContent = '本品关注 TOP10';
      if (subEl) subEl.textContent = '展开查看本品关注点、抗拒点、录音信息及试听';
      body.innerHTML = `
        <div class="insight-list" id="intent-model-list"></div>`;
      const intentTotal = INTENT_MODEL_DATA.reduce((s, d) => s + d.count, 0);
      const intentCustTotal = INTENT_MODEL_DATA.reduce((s, d) => s + d.customerCount, 0);
      renderInsightList('intent-model-list', INTENT_MODEL_DATA, 'intent', intentTotal, intentCustTotal);
    } else {
      if (titleEl) titleEl.textContent = `客户标签分布 · ${currentModel}`;
      if (subEl) subEl.textContent = '按正向、负向、中性标签查看客户关注内容';
      const tags = MODEL_TAG_DATA[currentModel];
      if (!tags) { body.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-muted);font-size:var(--text-body)">暂无该车系标签数据</div>'; return; }
      const allTags = [...(tags.positive||[]), ...(tags.negative||[]), ...(tags.neutral||[])];
      const maxCount = Math.max(...allTags.map(t => t.count));
      const renderBars = (items, polarity) => items.map(t => {
        const hasDetail = t.strategy || (t.recordings && t.recordings.length > 0);
        const cssClass = hasDetail ? 'tag-card' : '';
        const clickAttr = hasDetail ? "onclick=\"event.stopPropagation();this.classList.toggle('tag-expanded')\"" : "";
        const expandIcon = hasDetail ? `<div class="action-hint"><span>查看策略</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>` : '';
        const recsHtml = t.recordings ? t.recordings.map(r =>
          `<a class="rec-link" href="javascript:void(0)" onclick="event.stopPropagation();openRecordingPlayer('${r.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span class="rec-advisor">${r.advisor}</span><span class="rec-time">${r.time}</span>
          </a>`).join('') : '';
        const detailHtml = hasDetail ? `
          <div class="tag-card-detail">
            ${t.strategy ? `<div class="ai-strategy-card"><div class="ai-strategy-label"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></svg> AI 建议策略</div><div class="ai-strategy-text">${t.strategy}</div></div>` : ''}
            ${recsHtml ? `<div class="tag-recordings">${recsHtml}</div>` : ''}
          </div>` : '';
        return `
        <div class="tag-bar-wrapper ${cssClass}" ${clickAttr} style="margin-bottom:6px">
          <div class="tag-bar-item ${hasDetail ? 'tag-card-header' : ''}" style="${hasDetail ? 'padding:6px 10px; margin:0;' : ''}">
            <div class="tag-bar-name" style="width:80px;text-align:left;flex-shrink:0;">${t.name}</div>
            <div class="tag-bar-track"><div class="tag-bar-fill ${polarity}" style="width:${(t.count / maxCount * 100).toFixed(0)}%"></div></div>
            <div class="tag-bar-count" style="width:120px;text-align:right;flex-shrink:0;color:#94A3B8;display:flex;align-items:center;justify-content:flex-end">
              <strong style="color:#334155;font-size:14px;font-family:var(--font-mono)">${t.count}</strong><span style="margin:0 2px">次</span>·<strong style="color:#334155;font-size:14px;font-family:var(--font-mono);margin-left:4px">${t.customerCount || Math.floor(t.count*0.6)}</strong><span style="margin:0 2px">客</span>
              ${expandIcon}
            </div>
          </div>
          ${detailHtml}
        </div>`;
      }).join('');
      body.innerHTML = `
        <div class="tag-section-label"><span class="polarity-dot" style="background:#22C55E"></span>正向标签</div>
        <div class="tag-grid">${renderBars(tags.positive, 'positive')}</div>
        <div class="tag-section-label"><span class="polarity-dot" style="background:#EF4444"></span>负向标签</div>
        <div class="tag-grid">${renderBars(tags.negative, 'negative')}</div>
        <div class="tag-section-label"><span class="polarity-dot" style="background:#94A3B8"></span>中性标签</div>
        <div class="tag-grid">${renderBars(tags.neutral, 'neutral')}</div>`;
    }
  };

  // ══════════════════════════════════════════════════
  // Tab 3 — 竞品情报：数据层
  // ══════════════════════════════════════════════════

  // ── 竞品车型 TOP5 数据（全国汇总）────────────────
  const COMPETE_TOP5 = [
    {
      rank: 1, model: '比亚迪 宋PLUS DM-i', brand: '比亚迪', mentions: 842, storeCount: 156,
      trendDir: 'up', trendVal: '+12.3%',
      scope: 'shared',
      advantages: [
        { name: '新能源政策优势', count: 486, pct: 57.7 },
        { name: '综合油耗低', count: 412, pct: 48.9 },
        { name: '价格竞争力强', count: 398, pct: 47.3 },
        { name: '配置丰富', count: 324, pct: 38.5 }
      ],
      counters: [
        { name: '空间与舒适度碾压', desc: '本品第三排空间 +15cm，座椅支持独立调节，宋PLUS 无真正三排布局。' },
        { name: '品质做工代差', desc: '内饰用料、装配工艺、NVH 静谧性全面领先，邀请客户触摸对比即可感知。' },
        { name: '智能驾驶领先', desc: '标配 L2+ 辅助驾驶 + 智能泊车，宋PLUS 需选装。安排试驾重点体验。' }
      ],
      recordings: [
        { id: 'R-1042', advisor: '李昱', store: '广州天河店', time: '4-08 10:30', score: 92 },
        { id: 'R-1038', advisor: '王萌', store: '深圳南山店', time: '4-07 15:20', score: 88 },
        { id: 'R-1029', advisor: '张华', store: '佛山禅城店', time: '4-07 09:50', score: 85 }
      ]
    },
    {
      rank: 2, model: '丰田 汉兰达', brand: '丰田', mentions: 716, storeCount: 142,
      trendDir: 'down', trendVal: '-3.1%',
      scope: 'shared',
      advantages: [
        { name: '保值率高', count: 502, pct: 70.1 },
        { name: '品牌影响力强', count: 468, pct: 65.4 },
        { name: '质量稳定', count: 386, pct: 53.9 },
        { name: '空间大', count: 312, pct: 43.6 }
      ],
      counters: [
        { name: '配置差距巨大', desc: '同价位配置清单对比（安全/智能/舒适三维度），本品多 12 项标配。' },
        { name: '价格优势明显', desc: '落地价低 3-5 万，叠加金融方案月供更低。用总成本对比表量化差异。' },
        { name: '智能化代差', desc: '汉兰达车机/辅助驾驶落后一代，安排智能座舱 PK 体验形成记忆点。' }
      ],
      recordings: [
        { id: 'R-1045', advisor: '林涛', store: '上海浦东店', time: '4-08 14:00', score: 86 },
        { id: 'R-1031', advisor: '赵强', store: '杭州萧山店', time: '4-07 11:20', score: 82 }
      ]
    },
    {
      rank: 3, model: '别克 GL8', brand: '别克', mentions: 534, storeCount: 118,
      trendDir: 'down', trendVal: '-5.6%',
      scope: 'multi',
      advantages: [
        { name: '商务标杆认知', count: 402, pct: 75.3 },
        { name: '空间灵活', count: 318, pct: 59.6 },
        { name: '品牌溢价', count: 256, pct: 48.0 }
      ],
      counters: [
        { name: '新能源路线优势', desc: 'GL8 无纯电/混动版本，本品在用车成本和政策补贴上有结构性优势。' },
        { name: '智能座舱碾压', desc: 'GL8 座舱交互停留上一代，安排语音控制 + HUD 体验 PK。' },
        { name: '座椅舒适度', desc: '零重力座椅 GL8 高配才有，本品标配。到店必体验项目。' }
      ],
      recordings: [
        { id: 'R-1040', advisor: '王萌', store: '北京朝阳店', time: '4-08 09:00', score: 90 },
        { id: 'R-1036', advisor: '李昱', store: '成都武侯店', time: '4-07 16:40', score: 84 }
      ]
    },
    {
      rank: 4, model: '理想 L7', brand: '理想', mentions: 428, storeCount: 96,
      trendDir: 'up', trendVal: '+8.7%',
      scope: 'multi',
      advantages: [
        { name: '增程无续航焦虑', count: 312, pct: 72.9 },
        { name: '智能座舱体验', count: 268, pct: 62.6 },
        { name: '家庭用车首选', count: 224, pct: 52.3 }
      ],
      counters: [
        { name: '价格落差巨大', desc: 'L7 起售价高出本品 10 万+，用落地价差做性价比对比。' },
        { name: '三排空间差异化', desc: '本品三排真七座 vs L7 两排座，空间维度降维打击。' },
        { name: '售后网络成熟度', desc: '本品 4S 全国覆盖 800+ 家，理想仅 400+，维保更便捷。' }
      ],
      recordings: [
        { id: 'R-1033', advisor: '张华', store: '武汉洪山店', time: '4-07 14:30', score: 87 }
      ]
    },
    {
      rank: 5, model: '本田 CR-V', brand: '本田', mentions: 356, storeCount: 88,
      trendDir: 'down', trendVal: '-2.4%',
      scope: 'single',
      advantages: [
        { name: '省油耐用', count: 268, pct: 75.3 },
        { name: '品质可靠', count: 224, pct: 62.9 },
        { name: '保值率高', count: 186, pct: 52.2 }
      ],
      counters: [
        { name: '空间碾压', desc: 'CR-V 为紧凑 SUV，从车身尺寸到后排空间全面落后，邀请实车对比。' },
        { name: '配置代差', desc: '同价位本品在安全和智能配置上有代差优势，用配置清单量化。' }
      ],
      recordings: [
        { id: 'R-1028', advisor: '赵强', store: '西安雁塔店', time: '4-06 10:15', score: 83 },
        { id: 'R-1024', advisor: '林涛', store: '郑州金水店', time: '4-06 09:00', score: 79 }
      ]
    }
  ];

  COMPETE_TOP5.push(
    {
      rank: 6, model: '问界 M7', brand: '问界', mentions: 312, storeCount: 74,
      trendDir: 'up', trendVal: '+6.4%',
      scope: 'multi',
      advantages: [
        { name: '智能座舱', count: 216, pct: 69.2 },
        { name: '辅助驾驶', count: 184, pct: 59.0 },
        { name: '华为生态', count: 168, pct: 53.8 }
      ],
      counters: [
        { name: '交付与售后确定性', desc: '强调广汽体系服务网点和交付稳定性，降低客户对新势力售后的担忧。' },
        { name: '家用空间体验', desc: '安排三排乘坐和储物空间演示，用实车体验替代参数争论。' }
      ],
      recordings: [{ id: 'R-1051', advisor: '李昱', store: '广州天河店', time: '4-06 16:20', score: 84 }]
    },
    {
      rank: 7, model: '特斯拉 Model Y', brand: '特斯拉', mentions: 286, storeCount: 69,
      trendDir: 'down', trendVal: '-1.8%',
      scope: 'multi',
      advantages: [
        { name: '品牌认知', count: 218, pct: 76.2 },
        { name: '三电成熟', count: 172, pct: 60.1 },
        { name: '保值率', count: 136, pct: 47.6 }
      ],
      counters: [
        { name: '舒适配置差异', desc: '突出座椅舒适、车内静谧、后排空间等家庭用车体验差异。' },
        { name: '本地服务优势', desc: '用门店服务半径和售后响应速度增强客户信任。' }
      ],
      recordings: [{ id: 'R-1058', advisor: '王萌', store: '深圳南山店', time: '4-06 14:10', score: 82 }]
    },
    {
      rank: 8, model: '大众途昂', brand: '大众', mentions: 244, storeCount: 58,
      trendDir: 'down', trendVal: '-4.2%',
      scope: 'single',
      advantages: [
        { name: '品牌稳定', count: 176, pct: 72.1 },
        { name: '空间大', count: 151, pct: 61.9 },
        { name: '燃油成熟', count: 112, pct: 45.9 }
      ],
      counters: [
        { name: '智能配置代差', desc: '对比智能座舱、辅助驾驶和主动安全配置，形成同价高配心智。' },
        { name: '总成本测算', desc: '结合金融和用车成本，解释本品长期使用优势。' }
      ],
      recordings: [{ id: 'R-1062', advisor: '赵强', store: '上海浦东店', time: '4-05 15:35', score: 80 }]
    },
    {
      rank: 9, model: '腾势 D9', brand: '腾势', mentions: 216, storeCount: 52,
      trendDir: 'up', trendVal: '+3.9%',
      scope: 'multi',
      advantages: [
        { name: '新能源MPV', count: 168, pct: 77.8 },
        { name: '豪华感', count: 132, pct: 61.1 },
        { name: '商务接待', count: 108, pct: 50.0 }
      ],
      counters: [
        { name: '价格门槛对比', desc: '用同配置落地价和金融方案拆解总预算差异。' },
        { name: '家商兼顾场景', desc: '强调家庭出行、商务接待和售后便利的综合平衡。' }
      ],
      recordings: [{ id: 'R-1068', advisor: '张华', store: '成都武侯店', time: '4-05 11:50', score: 81 }]
    },
    {
      rank: 10, model: '小鹏 G9', brand: '小鹏', mentions: 188, storeCount: 46,
      trendDir: 'down', trendVal: '-2.7%',
      scope: 'single',
      advantages: [
        { name: '智能驾驶', count: 142, pct: 75.5 },
        { name: '充电速度', count: 118, pct: 62.8 },
        { name: '科技感', count: 96, pct: 51.1 }
      ],
      counters: [
        { name: '空间与舒适', desc: '把客户注意力从智能参数拉回真实乘坐体验和家庭场景。' },
        { name: '保值与售后', desc: '补充保值政策、质保和服务网点信息，降低长期用车顾虑。' }
      ],
      recordings: [{ id: 'R-1074', advisor: '林涛', store: '杭州西湖店', time: '4-04 17:20', score: 78 }]
    }
  );

  // ── 竞品市场动态时间线数据 ─────────────────────────
  const COMPETE_TIMELINE = [
    {
      date: '2026-04-08',
      level: 'high',
      title: '比亚迪宣布宋PLUS DM-i 冠军版降价 8000 元',
      brand: '比亚迪',
      model: '宋PLUS DM-i',
      tags: [
        { label: '价格战', color: 'var(--color-danger)' },
        { label: '高影响', color: 'var(--color-danger)' }
      ],
      aiTip: '建议立即更新竞品对比话术卡，重点强调：降价后配置同步缩水（导航变选装、轮毂降级），本品「不减配」是核心差异。同时准备限时置换补贴方案应对价格冲击。'
    },
    {
      date: '2026-04-06',
      level: 'mid',
      title: '理想 L7 Air 新增入门版，售价下探至 28.98 万',
      brand: '理想',
      model: 'L7',
      tags: [
        { label: '新车型', color: 'var(--color-warning)' },
        { label: '价格下探', color: 'var(--color-warning)' }
      ],
      aiTip: '虽然价格下探，但 Air 版取消了空气悬架和 HUD，增程油耗也有所上升。建议话术重点强调「减配版本」的性价比陷阱，并用本品满配落地价对比其实际到手价。'
    },
    {
      date: '2026-04-04',
      level: 'mid',
      title: '汉兰达 2026 款上市，新增 2.0T 混动版本',
      brand: '丰田',
      model: '汉兰达',
      tags: [
        { label: '换代上市', color: 'var(--color-warning)' },
        { label: '混动加入', color: 'var(--color-info)' }
      ],
      aiTip: '汉兰达补上混动短板但智能化仍落后。建议重点强调「配置清单对比」——新款汉兰达混动起步价已达 28.98 万，本品同价位多 12 项智能配置。安排智能座舱 PK 演示。'
    },
    {
      date: '2026-04-02',
      level: 'low',
      title: '别克 GL8 推出 48 期 0 息金融方案',
      brand: '别克',
      model: 'GL8',
      tags: [
        { label: '金融政策', color: 'var(--color-success)' }
      ],
      aiTip: '本品同样支持 0 息分期，且新能源免购置税可额外省 1.5-2 万。建议在金融方案对比时加入购置税差异项，形成总成本优势。影响有限，常规应对即可。'
    },
    {
      date: '2026-03-30',
      level: 'mid',
      title: '比亚迪全国经销商开展「油电同价」促销活动',
      brand: '比亚迪',
      model: '宋PLUS DM-i',
      tags: [
        { label: '促销活动', color: 'var(--color-warning)' },
        { label: '渠道行为', color: 'var(--color-text-muted)' }
      ],
      aiTip: '「油电同价」主要是营销概念，实际终端优惠幅度与前期基本一致。建议不要被概念带节奏，专注本品差异化价值传递。可准备「真实落地价对比表」让客户自行判断。'
    }
  ];

  const MODEL_COMPETE_PRIORITY = {
    M8: ['别克 GL8', '腾势 D9', '丰田 汉兰达', '比亚迪 宋PLUS DM-i', '理想 L7', '问界 M7', '大众途昂', '本田 CR-V', '特斯拉 Model Y', '小鹏 G9'],
    S7: ['特斯拉 Model Y', '小鹏 G9', '问界 M7', '比亚迪 宋PLUS DM-i', '理想 L7', '本田 CR-V', '丰田 汉兰达', '大众途昂', '腾势 D9', '别克 GL8'],
    GS8: ['丰田 汉兰达', '大众途昂', '理想 L7', '问界 M7', '本田 CR-V', '比亚迪 宋PLUS DM-i', '特斯拉 Model Y', '小鹏 G9', '腾势 D9', '别克 GL8'],
    E8: ['腾势 D9', '别克 GL8', '比亚迪 宋PLUS DM-i', '理想 L7', '问界 M7', '丰田 汉兰达', '特斯拉 Model Y', '小鹏 G9', '大众途昂', '本田 CR-V']
  };

  const getCompeteRowsForCurrentModel = () => {
    if (currentModel === 'all') return [...COMPETE_TOP5].sort((a, b) => a.rank - b.rank);
    const priority = MODEL_COMPETE_PRIORITY[currentModel] || [];
    const priorityIndex = name => {
      const idx = priority.findIndex(p => p === name);
      return idx === -1 ? 999 : idx;
    };
    return [...COMPETE_TOP5]
      .sort((a, b) => priorityIndex(a.model) - priorityIndex(b.model) || a.rank - b.rank)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
        mentions: Math.max(80, Math.round(item.mentions * (1 - idx * 0.045))),
        storeCount: Math.max(18, Math.round(item.storeCount * (1 - idx * 0.035)))
      }));
  };

  // ── renderCompeteTop5：竞品车型 TOP10 ───────────────
  const renderCompeteTop5 = () => {
    const competeInsightRows = getCompeteRowsForCurrentModel().map(item => ({
      model: item.model,
      count: item.mentions,
      customerCount: item.storeCount,
      advantages: item.advantages.map(a => ({
        name: a.name,
        count: a.count,
        strategy: `客户提及占比 ${a.pct}%。建议先承认该竞品优势，再引导回本品在空间、配置、服务或用车成本上的差异价值。`,
        recordings: item.recordings || []
      })),
      counters: item.counters.map(c => ({
        name: c.name,
        count: Math.max(1, Math.round(item.mentions / item.counters.length)),
        strategy: c.desc,
        recordings: item.recordings || []
      }))
    }));
    const competeTotal = competeInsightRows.reduce((sum, item) => sum + item.count, 0);
    const competeCustomerTotal = competeInsightRows.reduce((sum, item) => sum + item.customerCount, 0);

    renderInsightList('compete-top5', competeInsightRows, 'compete', competeTotal, competeCustomerTotal);
  };

  const renderCompeteInsightOverview = () => {
    const el = document.getElementById('compete-insight-overview');
    if (!el) return;

    const rows = getCompeteRowsForCurrentModel();
    const topRows = rows.slice(0, 3);
    const topCompete = topRows[0] || { model: '暂无竞品', mentions: 0, advantages: [], counters: [] };
    const topAdvantage = topCompete.advantages?.[0] || { name: '暂无优势', count: 0, pct: 0 };
    const topFocus = COMPETE_FOCUS_CLOUD.slice().sort((a, b) => b.count - a.count)[0] || { name: '暂无关注点', count: 0 };
    const totalMentions = rows.reduce((sum, item) => sum + item.mentions, 0);
    const scopeText = currentModel === 'all' ? '全车系' : currentModel;

    const items = [
      {
        label: '用户最关注',
        value: topRows.map(item => item.model.replace(/\s+/g, '')).join(' / ') || '暂无高频竞品',
        meta: `${scopeText} 竞品提及量 ${formatInsightOverviewPct(topRows.reduce((sum, item) => sum + item.mentions, 0), totalMentions)}`,
        tone: 'hot',
        icon: '<svg viewBox="0 0 24 24"><path d="M13.5 2.5c.2 3-1.4 4.8-3.1 6.3-1.6 1.4-3.1 2.9-3.1 5.5a5.2 5.2 0 0 0 10.4 0c0-2.2-1.1-4.1-2.6-5.7.1 1.7-.7 3-1.9 3.8.3-2.3-.3-4.8-2.1-6.7Z"/></svg>'
      },
      {
        label: '风险点',
        value: `${topCompete.model}，${topAdvantage.name}`,
        meta: `竞品优势提及 ${topAdvantage.count || topAdvantage.pct || 0} 次`,
        tone: 'risk',
        icon: '<svg viewBox="0 0 24 24"><path d="M11 4.4 3.4 18a1.3 1.3 0 0 0 1.1 2h15a1.3 1.3 0 0 0 1.1-2L13 4.4a1.2 1.2 0 0 0-2 0Z"/><path d="M12 8.5v4.8M12 16.8h.01"/></svg>'
      },
      {
        label: '机会点',
        value: `${topFocus.name}对比不足`,
        meta: `相关问题占比 ${formatInsightOverviewPct(topFocus.count, COMPETE_FOCUS_CLOUD.reduce((sum, item) => sum + item.count, 0))}`,
        tone: 'chance',
        icon: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8.2 14.3a6 6 0 1 1 7.6 0c-.8.6-1.2 1.5-1.2 2.4H9.4c0-.9-.4-1.8-1.2-2.4Z"/></svg>'
      },
      {
        label: '推荐动作',
        value: `主推“承认优势 + 实车对比”`,
        meta: '先承认，再拉回可体验差异',
        tone: 'action',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M22 12h-4M12 22v-4M2 12h4"/></svg>'
      }
    ];

    el.innerHTML = items.map(renderOverviewItem).join('');
  };

  // ── renderCompeteTimeline：竞品市场动态时间线 ──────
  const renderCompeteTimeline = () => {
    const el = document.getElementById('compete-timeline');
    if (!el) return;

    el.innerHTML = COMPETE_TIMELINE.map((item, i) => {
      const isLast = i === COMPETE_TIMELINE.length - 1;
      const tagsHtml = item.tags.map(t =>
        `<span class="timeline-badge" style="background:${t.color}12;color:${t.color};border:1px solid ${t.color}30">${t.label}</span>`
      ).join('');

      return `
        <div class="timeline-item">
          <div class="timeline-dot-col">
            <div class="timeline-dot ${item.level}"></div>
            ${!isLast ? '<div class="timeline-line"></div>' : ''}
          </div>
          <div class="timeline-content">
            <div class="timeline-date">${item.date} · ${item.brand}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-meta">${tagsHtml}</div>
            <div class="timeline-ai-tip">
              <strong>AI 应对建议：</strong>${item.aiTip}
            </div>
          </div>
        </div>`;
    }).join('');
  };

  // ── renderCompeteTab 总调度 ────────────────────────
  const renderCompeteTab = () => {
    renderCompeteInsightOverview();
    renderCompeteTop5();
    renderCompeteTimeline();
    renderCompeteWordcloud();
    renderCompeteFocusCloud();
  };

  // 竞品词云数据
  const COMPETE_WORDCLOUD = [
    { name: '比亚迪汉', count: 892 },
    { name: '特斯拉Model 3', count: 756 },
    { name: '理想L6', count: 634 },
    { name: '小鹏P7', count: 521 },
    { name: '蔚来ET5', count: 418 },
    { name: '问界M7', count: 387 },
    { name: '极氪001', count: 342 },
    { name: '宝马3系', count: 298 },
    { name: '奥迪A4L', count: 265 },
    { name: '奔驰C级', count: 234 },
    { name: '红旗H5', count: 198 },
    { name: '长安深蓝', count: 176 },
    { name: '零跑C11', count: 154 },
    { name: '哪吒S', count: 132 },
    { name: '飞凡F7', count: 108 },
    { name: '昊铂GT', count: 89 },
    { name: '岚图追光', count: 76 },
    { name: '智己L6', count: 65 }
  ];

  // 渲染竞品词云
  const renderCompeteWordcloud = () => {
    const el = document.getElementById('compete-wordcloud');
    if (!el) return;
    const data = COMPETE_WORDCLOUD;
    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));

    // 品牌色系 - 按热度从高到低
    const colorScale = [
      { bg: '#FEE2E2', text: '#DC2626' },  // 比亚迪 - 红
      { bg: '#FEF3C7', text: '#D97706' },  // 特斯拉 - 橙
      { bg: '#DCFCE7', text: '#16A34A' },  // 理想 - 绿
      { bg: '#DBEAFE', text: '#2563EB' },  // 小鹏 - 蓝
      { bg: '#F3E8FF', text: '#9333EA' },  // 蔚来 - 紫
      { bg: '#FEF9C3', text: '#CA8A04' },  // 问界 - 黄
      { bg: '#FFEDD5', text: '#EA580C' },  // 极氪 - 深橙
      { bg: '#E0E7FF', text: '#4F46E5' },  // 宝马 - 靛蓝
      { bg: '#F1F5F9', text: '#475569' },  // 奥迪 - 灰
      { bg: '#FCE7F3', text: '#DB2777' },  // 奔驰 - 粉
      { bg: '#FFFBEB', text: '#B45309' },  // 红旗 - 琥珀
      { bg: '#F0FDF4', text: '#15803D' },  // 长安深蓝 - 翠绿
      { bg: '#FFF7ED', text: '#C2410C' },  // 零跑 - 橘红
      { bg: '#FAF5FF', text: '#7C3AED' },  // 哪吒 - 紫罗
      { bg: '#F8FAFC', text: '#64748B' },  // 飞凡 - 石板
      { bg: '#ECFDF5', text: '#059669' },  // 昊铂 - 青绿
      { bg: '#F0F9FF', text: '#0284C7' },  // 岚图 - 天蓝
      { bg: '#F5F3FF', text: '#7C3AED' }   // 智己 - 紫
    ];

    el.innerHTML = data.map((item, idx) => {
      // 计算字体大小 (14px - 28px)
      const fontSize = 14 + ((item.count - minCount) / (maxCount - minCount || 1)) * 14;
      // 权重值用于排序
      const weight = Math.round(((item.count - minCount) / (maxCount - minCount || 1)) * 9) + 1;
      const colors = colorScale[idx % colorScale.length];

      return `<span class="cloud-word" style="font-size:${fontSize}px;font-weight:${weight};color:${colors.text};background:${colors.bg}" title="提及次数: ${item.count}">${item.name}</span>`;
    }).join('');
  };

  // 竞品关注点词云数据
  const COMPETE_FOCUS_CLOUD = [
    { name: '续航里程', count: 1245 },
    { name: '智能驾驶', count: 1089 },
    { name: '价格性价比', count: 987 },
    { name: '空间大小', count: 856 },
    { name: '外观设计', count: 734 },
    { name: '电池安全', count: 621 },
    { name: '充电便利', count: 543 },
    { name: '品牌口碑', count: 487 },
    { name: '保值率', count: 423 },
    { name: '能耗费用', count: 398 },
    { name: '售后服务', count: 356 },
    { name: '辅助驾驶', count: 312 },
    { name: '车内舒适', count: 287 },
    { name: '隔音效果', count: 243 },
    { name: '动力性能', count: 218 },
    { name: '科技配置', count: 192 },
    { name: '保值服务', count: 167 },
    { name: '维修成本', count: 145 }
  ];

  // 渲染竞品关注点词云
  const renderCompeteFocusCloud = () => {
    const el = document.getElementById('compete-focus-cloud');
    if (!el) return;
    const data = COMPETE_FOCUS_CLOUD;
    const maxCount = Math.max(...data.map(d => d.count));
    const minCount = Math.min(...data.map(d => d.count));

    // 关注点颜色 - 蓝色系渐变
    const focusColors = [
      { bg: '#DBEAFE', text: '#1D4ED8' },  // 深蓝
      { bg: '#BFDBFE', text: '#2563EB' },
      { bg: '#93C5FD', text: '#3B82F6' },
      { bg: '#60A5FA', text: '#60A5FA' },
      { bg: '#FEF3C7', text: '#D97706' },  // 橙色
      { bg: '#FDE68A', text: '#CA8A04' },
      { bg: '#DCFCE7', text: '#16A34A' },  // 绿色
      { bg: '#BBF7D0', text: '#22C55E' },
      { bg: '#FCE7F3', text: '#DB2777' },  // 粉色
      { bg: '#FBCFE8', text: '#EC4899' },
      { bg: '#E0E7FF', text: '#4F46E5' },  // 靛蓝
      { bg: '#C7D2FE', text: '#6366F1' },
      { bg: '#F3E8FF', text: '#9333EA' },  // 紫色
      { bg: '#E9D5FF', text: '#A855F7' },
      { bg: '#FED7AA', text: '#EA580C' },  // 橘色
      { bg: '#FFEDD5', text: '#F97316' },
      { bg: '#CCFBF1', text: '#0D9488' },  // 青色
      { bg: '#A7F3D0', text: '#10B981' }   // 青绿
    ];

    el.innerHTML = data.map((item, idx) => {
      const fontSize = 14 + ((item.count - minCount) / (maxCount - minCount || 1)) * 14;
      const weight = Math.round(((item.count - minCount) / (maxCount - minCount || 1)) * 9) + 1;
      const colors = focusColors[idx % focusColors.length];

      return `<span class="cloud-word" style="font-size:${fontSize}px;font-weight:${weight};color:${colors.text};background:${colors.bg}" title="提及次数: ${item.count}">${item.name}</span>`;
    }).join('');
  };

  // ══════════════════════════════════════════════════
  // Tab 4 — SOP 执行：数据层
  // ══════════════════════════════════════════════════

  const SOP_DIAL = { score: 82, nationalAvg: 73, periodDelta: 3, summary: '全品牌SOP执行整体平稳，竞品对比话术和试驾邀约环节仍是最大短板。' };

  const TOTAL_ADVISOR_COUNT = 8;

  const weaknessData = [
    { title: "竞品对比-无特定对比车型", unhit_ratio: "85%", unhit_count: 42, advisor_count: 4,
      strategy: "培训竞品对比话术，提前准备 TOP3 竞品优劣势对照表，强化差异化卖点输出。",
      recordings: [
        { advisor: "林涛", time: "3-25 15:20", id: "R-0312" },
        { advisor: "张华", time: "3-25 11:05", id: "R-0308" },
        { advisor: "王萌", time: "3-24 16:40", id: "R-0295" },
        { advisor: "赵强", time: "3-24 10:15", id: "R-0289" }
      ]},
    { title: "试驾邀约-首次未提", unhit_ratio: "72%", unhit_count: 36, advisor_count: 3,
      strategy: "在需求确认环节后立即切入试驾邀约，形成固定话术节点，每次接待必邀。",
      recordings: [
        { advisor: "林涛", time: "3-25 14:00", id: "R-0310" },
        { advisor: "王萌", time: "3-24 15:30", id: "R-0293" },
        { advisor: "赵强", time: "3-23 11:20", id: "R-0280" }
      ]},
    { title: "促单逼单-金融方案介绍", unhit_ratio: "68%", unhit_count: 31, advisor_count: 4,
      strategy: "议价环节主动引入金融方案降低月供门槛，用「算账法」替代直接让价。",
      recordings: [
        { advisor: "李昱", time: "3-25 16:10", id: "R-0313" },
        { advisor: "林涛", time: "3-25 10:45", id: "R-0306" },
        { advisor: "王萌", time: "3-24 14:20", id: "R-0291" },
        { advisor: "赵强", time: "3-23 09:30", id: "R-0278" }
      ]},
    { title: "客户需求-购车时间确认", unhit_ratio: "55%", unhit_count: 24, advisor_count: 2,
      strategy: "开场3分钟内完成购车时间探询，用「您大概什么时候用车」自然切入。",
      recordings: [
        { advisor: "林涛", time: "3-25 13:30", id: "R-0309" },
        { advisor: "张华", time: "3-24 09:50", id: "R-0287" }
      ]},
    { title: "异议处理-价格异议未抛断", unhit_ratio: "45%", unhit_count: 18, advisor_count: 1,
      strategy: "价格异议出现时先认同再转移，用配置价值拆解代替直接回应价格。",
      recordings: [
        { advisor: "林涛", time: "3-25 09:20", id: "R-0305" }
      ]}
  ];

  const strengthData = [
    { title: "深度需求挖掘", hit_ratio: "87%", hit_count: 46, advisor_count: 4,
      strategy: "沉淀高分录音中的需求追问句式，作为战区与门店晨会示范样本，带动团队把预算、用途、换购原因问完整。",
      recordings: [
        { advisor: "李昱", time: "3-25 10:30", id: "R-0401" },
        { advisor: "王萌", time: "3-25 11:20", id: "R-0403" },
        { advisor: "韩宇", time: "3-24 15:10", id: "R-0395" },
        { advisor: "许明", time: "3-24 09:40", id: "R-0386" }
      ]},
    { title: "本品价值塑造", hit_ratio: "71%", hit_count: 38, advisor_count: 4,
      strategy: "把配置、空间、售后权益串成价值话术卡，优先复用在 M8、GS8 等高关注车型接待中。",
      recordings: [
        { advisor: "王萌", time: "3-25 14:20", id: "R-0410" },
        { advisor: "吴俊", time: "3-24 16:00", id: "R-0397" },
        { advisor: "李昱", time: "3-24 10:15", id: "R-0388" },
        { advisor: "张华", time: "3-23 15:50", id: "R-0379" }
      ]},
    { title: "竞品差异化对比", hit_ratio: "72%", hit_count: 34, advisor_count: 3,
      strategy: "保留「先认可竞品，再拉回本品优势」的表达模板，整理成可复用的竞品对比清单。",
      recordings: [
        { advisor: "张华", time: "3-25 11:05", id: "R-0308" },
        { advisor: "李昱", time: "3-24 13:30", id: "R-0389" },
        { advisor: "韩宇", time: "3-23 17:20", id: "R-0374" }
      ]},
    { title: "价格异议处理", hit_ratio: "56%", hit_count: 25, advisor_count: 2,
      strategy: "将优秀录音中的价值拆解和金融测算话术做成短视频片段，供新人复盘学习。",
      recordings: [
        { advisor: "许明", time: "3-25 16:10", id: "R-0413" },
        { advisor: "王萌", time: "3-24 14:20", id: "R-0291" }
      ]},
    { title: "版本配置引导", hit_ratio: "44%", hit_count: 18, advisor_count: 1,
      strategy: "保留按预算逐级推荐版本的样本，补充到车型配置讲解 SOP 中，提升版本推荐一致性。",
      recordings: [
        { advisor: "李昱", time: "3-25 09:20", id: "R-0305" }
      ]}
  ];

  const riskData = [
    { title: "过度承诺交车时间", hit_count: 15, hit_ratio: "38%", advisor_count: 3,
      strategy: "严禁口头承诺具体交车日期，统一使用「预计X周内」并引导签订书面协议。",
      recordings: [
        { advisor: "林涛", time: "3-25 16:20", id: "R-0314" },
        { advisor: "赵强", time: "3-24 15:10", id: "R-0292" },
        { advisor: "王萌", time: "3-24 11:30", id: "R-0290" }
      ]},
    { title: "贬低竞品车型", hit_count: 11, hit_ratio: "28%", advisor_count: 2,
      strategy: "禁止直接贬低竞品，改用「我们的优势在于…」正向引导话术。",
      recordings: [
        { advisor: "林涛", time: "3-25 14:50", id: "R-0311" },
        { advisor: "赵强", time: "3-23 16:00", id: "R-0282" }
      ]},
    { title: "优惠方案超授权底线", hit_count: 8, hit_ratio: "20%", advisor_count: 2,
      strategy: "明确告知授权底线，超出需店长审批；引导客户关注附加价值而非价格。",
      recordings: [
        { advisor: "林涛", time: "3-24 16:40", id: "R-0296" },
        { advisor: "张华", time: "3-23 14:20", id: "R-0281" }
      ]},
    { title: "强制加装装饰包", hit_count: 5, hit_ratio: "13%", advisor_count: 1,
      strategy: "装饰包必须作为可选项介绍，强调自愿原则，禁止捆绑销售。",
      recordings: [
        { advisor: "赵强", time: "3-24 10:00", id: "R-0288" }
      ]},
    { title: "泄露其他客户隐私", hit_count: 2, hit_ratio: "5%", advisor_count: 1,
      strategy: "严禁引用其他客户下订价、个人信息；违规一次记警告处分。",
      recordings: [
        { advisor: "林涛", time: "3-23 15:30", id: "R-0283" }
      ]}
  ];

  const parseSignedNumber = (value) => {
    const cleaned = String(value || '').replace(/[↑↓%]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const renderSOPOverviewSummary = () => {
    const trendCard = document.getElementById('sop-summary-trend');
    const trendTitleEl = document.getElementById('sop-summary-trend-title');
    const trendTextEl = document.getElementById('sop-summary-trend-text');
    const weaknessTextEl = document.getElementById('sop-summary-weakness-text');
    const riskTextEl = document.getElementById('sop-summary-risk-text');
    if (!trendCard || !trendTitleEl || !trendTextEl || !weaknessTextEl || !riskTextEl) return;

    trendCard.classList.remove('success', 'danger');
    trendCard.classList.add('success');
    trendTitleEl.textContent = '优势发掘';
    trendTextEl.textContent = '需求挖掘、接待礼仪、客户异议处理等环节表现突出，可作为团队培训样本。';
    weaknessTextEl.textContent = '竞品对比、试驾邀约、需求深挖三项未命中率仍高。';
    riskTextEl.textContent = '超授权优惠和贬低竞品话术需纳入红线提醒。';
  };

  // SOP 大区排行数据
  const SOP_RANK_DATA = {
    regions: [
      { name:'华南大区', sopRate:82.3, weakItems:3.2, riskHit:4.1, improvement:'+2.8%', trend:'up',
        zones:[
          { name:'广州战区', sopRate:85.1, weakItems:2.8, riskHit:3.5, improvement:'+3.2%', trend:'up',
            stores:[
              {name:'广州天河店',sopRate:89.6,weakItems:2.1,riskHit:2.8,improvement:'+4.1%',trend:'up'},
              {name:'广州白云店',sopRate:86.2,weakItems:2.6,riskHit:3.1,improvement:'+3.5%',trend:'up'},
              {name:'广州番禺店',sopRate:82.5,weakItems:3.2,riskHit:4.2,improvement:'+1.8%',trend:'down'},
              {name:'广州增城店',sopRate:78.4,weakItems:3.8,riskHit:5.3,improvement:'+0.6%',trend:'up'}]},
          { name:'深圳战区', sopRate:80.9, weakItems:3.4, riskHit:4.8, improvement:'+2.1%', trend:'up',
            stores:[
              {name:'深圳南山店',sopRate:84.3,weakItems:2.9,riskHit:3.6,improvement:'+2.8%',trend:'up'},
              {name:'深圳龙华店',sopRate:79.8,weakItems:3.6,riskHit:5.1,improvement:'+1.5%',trend:'down'},
              {name:'深圳宝安店',sopRate:77.6,weakItems:3.9,riskHit:5.9,improvement:'+1.2%',trend:'up'}]},
          { name:'佛山战区', sopRate:78.4, weakItems:3.8, riskHit:5.6, improvement:'+1.2%', trend:'down',
            stores:[
              {name:'佛山禅城店',sopRate:80.2,weakItems:3.5,riskHit:5.0,improvement:'+1.6%',trend:'up'},
              {name:'佛山南海店',sopRate:75.8,weakItems:4.2,riskHit:6.4,improvement:'+0.4%',trend:'down'}]},
          { name:'东莞战区', sopRate:76.1, weakItems:4.1, riskHit:6.8, improvement:'+0.8%', trend:'down',
            stores:[
              {name:'东莞莞城店',sopRate:78.5,weakItems:3.7,riskHit:6.2,improvement:'+1.2%',trend:'up'},
              {name:'东莞虎门店',sopRate:74.6,weakItems:4.4,riskHit:7.3,improvement:'+0.3%',trend:'down'},
              {name:'东莞长安店',sopRate:74.2,weakItems:4.6,riskHit:7.5,improvement:'-0.1%',trend:'down'}]}
        ]},
      { name:'华东大区', sopRate:78.6, weakItems:3.6, riskHit:5.8, improvement:'+2.1%', trend:'up',
        zones:[
          { name:'上海战区', sopRate:81.4, weakItems:3.1, riskHit:4.9, improvement:'+2.6%', trend:'up',
            stores:[
              {name:'上海浦东店',sopRate:85.2,weakItems:2.5,riskHit:3.8,improvement:'+3.4%',trend:'up'},
              {name:'上海闵行店',sopRate:82.1,weakItems:2.9,riskHit:4.5,improvement:'+2.2%',trend:'up'},
              {name:'上海嘉定店',sopRate:79.3,weakItems:3.4,riskHit:5.8,improvement:'+1.5%',trend:'down'},
              {name:'上海松江店',sopRate:76.5,weakItems:3.8,riskHit:6.4,improvement:'+0.8%',trend:'up'}]},
          { name:'杭州战区', sopRate:79.2, weakItems:3.5, riskHit:5.5, improvement:'+1.9%', trend:'up',
            stores:[
              {name:'杭州西湖店',sopRate:82.4,weakItems:3.0,riskHit:4.8,improvement:'+2.5%',trend:'up'},
              {name:'杭州余杭店',sopRate:78.6,weakItems:3.6,riskHit:5.6,improvement:'+1.6%',trend:'up'},
              {name:'杭州萧山店',sopRate:75.8,weakItems:4.0,riskHit:6.5,improvement:'+0.9%',trend:'down'}]}
        ]},
      { name:'华北大区', sopRate:74.2, weakItems:4.2, riskHit:7.1, improvement:'+1.5%', trend:'up',
        zones:[
          { name:'北京战区', sopRate:77.8, weakItems:3.6, riskHit:6.2, improvement:'+2.0%', trend:'up',
            stores:[
              {name:'北京朝阳店',sopRate:81.3,weakItems:3.1,riskHit:5.2,improvement:'+2.8%',trend:'up'},
              {name:'北京海淀店',sopRate:78.5,weakItems:3.5,riskHit:6.0,improvement:'+1.8%',trend:'up'},
              {name:'北京丰台店',sopRate:75.2,weakItems:3.9,riskHit:6.8,improvement:'+1.2%',trend:'down'},
              {name:'北京通州店',sopRate:73.1,weakItems:4.2,riskHit:7.2,improvement:'+0.6%',trend:'up'}]},
          { name:'天津战区', sopRate:72.5, weakItems:4.5, riskHit:7.6, improvement:'+1.0%', trend:'down',
            stores:[
              {name:'天津滨海店',sopRate:74.8,weakItems:4.2,riskHit:7.0,improvement:'+1.4%',trend:'up'},
              {name:'天津南开店',sopRate:69.5,weakItems:4.9,riskHit:8.4,improvement:'+0.5%',trend:'down'}]}
        ]},
      { name:'华中大区', sopRate:75.8, weakItems:3.9, riskHit:6.5, improvement:'+1.8%', trend:'up',
        zones:[
          { name:'武汉战区', sopRate:78.2, weakItems:3.5, riskHit:5.8, improvement:'+2.2%', trend:'up',
            stores:[
              {name:'武汉武昌店',sopRate:80.6,weakItems:3.2,riskHit:5.2,improvement:'+2.6%',trend:'up'},
              {name:'武汉洪山店',sopRate:77.8,weakItems:3.6,riskHit:5.8,improvement:'+2.0%',trend:'up'},
              {name:'武汉汉口店',sopRate:75.4,weakItems:3.9,riskHit:6.5,improvement:'+1.4%',trend:'down'}]},
          { name:'长沙战区', sopRate:74.5, weakItems:4.1, riskHit:6.9, improvement:'+1.5%', trend:'up',
            stores:[
              {name:'长沙岳麓店',sopRate:77.2,weakItems:3.7,riskHit:6.2,improvement:'+2.0%',trend:'up'},
              {name:'长沙雨花店',sopRate:73.8,weakItems:4.3,riskHit:7.1,improvement:'+1.2%',trend:'down'},
              {name:'长沙开福店',sopRate:72.1,weakItems:4.5,riskHit:7.6,improvement:'+0.8%',trend:'up'}]}
        ]},
      { name:'西南大区', sopRate:73.5, weakItems:4.3, riskHit:7.4, improvement:'+1.2%', trend:'down',
        zones:[
          { name:'成都战区', sopRate:76.8, weakItems:3.8, riskHit:6.5, improvement:'+1.8%', trend:'up',
            stores:[
              {name:'成都武侯店',sopRate:79.5,weakItems:3.4,riskHit:5.8,improvement:'+2.2%',trend:'up'},
              {name:'成都锦江店',sopRate:77.2,weakItems:3.7,riskHit:6.2,improvement:'+1.6%',trend:'up'},
              {name:'成都高新店',sopRate:75.6,weakItems:4.0,riskHit:6.8,improvement:'+1.2%',trend:'down'},
              {name:'成都龙泉驿店',sopRate:73.8,weakItems:4.3,riskHit:7.2,improvement:'+0.8%',trend:'up'}]},
          { name:'重庆战区', sopRate:72.1, weakItems:4.5, riskHit:7.8, improvement:'+0.8%', trend:'down',
            stores:[
              {name:'重庆渝北店',sopRate:74.6,weakItems:4.2,riskHit:7.2,improvement:'+1.2%',trend:'up'},
              {name:'重庆九龙坡店',sopRate:71.2,weakItems:4.6,riskHit:8.0,improvement:'+0.5%',trend:'down'},
              {name:'重庆南岸店',sopRate:70.1,weakItems:4.8,riskHit:8.4,improvement:'+0.3%',trend:'down'}]}
        ]},
      { name:'西北大区', sopRate:68.4, weakItems:5.1, riskHit:8.8, improvement:'+0.6%', trend:'down',
        zones:[
          { name:'西安战区', sopRate:71.2, weakItems:4.6, riskHit:8.0, improvement:'+1.0%', trend:'up',
            stores:[
              {name:'西安雁塔店',sopRate:74.5,weakItems:4.2,riskHit:7.2,improvement:'+1.5%',trend:'up'},
              {name:'西安未央店',sopRate:70.8,weakItems:4.7,riskHit:8.2,improvement:'+0.8%',trend:'down'},
              {name:'西安长安店',sopRate:67.6,weakItems:5.1,riskHit:8.8,improvement:'+0.4%',trend:'down'}]},
          { name:'兰州战区', sopRate:66.5, weakItems:5.4, riskHit:9.2, improvement:'+0.3%', trend:'down',
            stores:[
              {name:'兰州城关店',sopRate:68.8,weakItems:5.1,riskHit:8.8,improvement:'+0.5%',trend:'up'},
              {name:'兰州安宁店',sopRate:63.5,weakItems:5.8,riskHit:9.8,improvement:'-0.2%',trend:'down'}]}
        ]},
      { name:'东北大区', sopRate:70.1, weakItems:4.8, riskHit:8.2, improvement:'+0.9%', trend:'down',
        zones:[
          { name:'沈阳战区', sopRate:72.8, weakItems:4.4, riskHit:7.6, improvement:'+1.2%', trend:'up',
            stores:[
              {name:'沈阳铁西店',sopRate:75.6,weakItems:4.0,riskHit:6.8,improvement:'+1.8%',trend:'up'},
              {name:'沈阳皇姑店',sopRate:72.4,weakItems:4.5,riskHit:7.8,improvement:'+1.0%',trend:'up'},
              {name:'沈阳浑南店',sopRate:70.1,weakItems:4.8,riskHit:8.4,improvement:'+0.5%',trend:'down'}]},
          { name:'哈尔滨战区', sopRate:68.2, weakItems:5.1, riskHit:8.6, improvement:'+0.6%', trend:'down',
            stores:[
              {name:'哈尔滨南岗店',sopRate:70.5,weakItems:4.8,riskHit:8.0,improvement:'+0.9%',trend:'up'},
              {name:'哈尔滨道里店',sopRate:65.4,weakItems:5.5,riskHit:9.4,improvement:'+0.1%',trend:'down'}]}
        ]}
    ]
  };

  const makeIssueRule = (id, name, category, rate, sampleCount, extra = {}) => ({
    id,
    name,
    category,
    rate,
    sampleCount,
    hitCount: Math.round(sampleCount * rate / 100),
    ...extra
  });

  const makeIssueSceneStat = (rate, sampleCount) => ({
    rate,
    sampleCount,
    hitCount: Math.round(sampleCount * rate / 100)
  });

  const makeCloudIssueRule = (id, name, category, rate, sampleCount) => {
    const firstFollowSamples = Math.round(sampleCount * 0.42);
    const inviteStoreSamples = Math.round(sampleCount * 0.36);
    const scheduleConfirmSamples = Math.max(0, sampleCount - firstFollowSamples - inviteStoreSamples);
    return makeIssueRule(id, name, category, rate, sampleCount, {
      sceneStats: {
        [SCENE_KEYS.firstFollow]: makeIssueSceneStat(Math.max(1, rate - 2), firstFollowSamples),
        [SCENE_KEYS.inviteStore]: makeIssueSceneStat(Math.min(98, rate + 1), inviteStoreSamples),
        [SCENE_KEYS.scheduleConfirm]: makeIssueSceneStat(Math.min(98, rate + 3), scheduleConfirmSamples)
      }
    });
  };

  const makeSingleSceneIssueRule = (id, name, category, rate, sampleCount, scene) => (
    makeIssueRule(id, name, category, rate, sampleCount, {
      sceneStats: {
        [scene]: makeIssueSceneStat(rate, sampleCount)
      }
    })
  );

  const makeScopedIssueRule = (id, name, category, rate, sampleCount, scenes) => {
    const applicableScenes = [...new Set(Array.isArray(scenes) ? scenes : [])];
    const baseSampleCount = applicableScenes.length
      ? Math.floor(sampleCount / applicableScenes.length)
      : 0;
    const remainder = applicableScenes.length
      ? sampleCount - baseSampleCount * applicableScenes.length
      : 0;
    const sceneStats = applicableScenes.reduce((result, scene, index) => {
      result[scene] = makeIssueSceneStat(rate, baseSampleCount + (index < remainder ? 1 : 0));
      return result;
    }, {});

    return makeIssueRule(id, name, category, rate, sampleCount, { sceneStats });
  };

  const CLOUD_ISSUE_SCENES = [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore,
    SCENE_KEYS.scheduleConfirm
  ];
  const ALL_ISSUE_SCENES = [
    ...CLOUD_ISSUE_SCENES,
    SCENE_KEYS.storeReception,
    SCENE_KEYS.testDrive
  ];

  const ISSUE_RULE_TABS = {
    sop: {
      label: 'SOP执行分析',
      metricLabel: '命中率',
      countLabel: '命中/样本',
      emptyText: '暂无匹配 SOP 规则',
      topTitle: '表现最好 TOP5',
      bottomTitle: '表现待提升 BOT5',
      rules: [
        makeCloudIssueRule('sop-compare-model', '对比车型', '需求确认', 78, 1280),
        makeCloudIssueRule('sop-intent-model', '意向车型', '需求确认', 74, 1280),
        makeCloudIssueRule('sop-rebuy', '增换购情况', '需求确认', 67, 1180),
        makeCloudIssueRule('sop-concern', '购车关注点', '需求确认', 63, 1180),
        makeCloudIssueRule('sop-wechat', '添加微信要求', '留资承接', 61, 1120),
        makeCloudIssueRule('sop-buy-time', '计划购车时间', '需求确认', 58, 1090),
        makeCloudIssueRule('sop-test-drive-time', '试乘试驾时间', '到店邀约', 55, 1060),
        makeCloudIssueRule('sop-budget', '预算范围确认', '需求确认', 72, 1190),
        makeCloudIssueRule('sop-purpose', '用车场景确认', '需求确认', 69, 1170),
        makeCloudIssueRule('sop-family', '家庭成员需求', '需求确认', 64, 980),
        makeCloudIssueRule('sop-config-guide', '配置版本推荐', '产品讲解', 62, 1050),
        makeCloudIssueRule('sop-value-rights', '权益政策说明', '产品讲解', 60, 1010),
        makeCloudIssueRule('sop-price-anchor', '价格锚点铺垫', '价格沟通', 57, 990),
        makeCloudIssueRule('sop-finance', '金融方案介绍', '促单转化', 53, 960),
        makeCloudIssueRule('sop-trade-in', '置换政策说明', '促单转化', 51, 880),
        makeCloudIssueRule('sop-next-step', '下一步跟进约定', '跟进承接', 49, 920),
        makeCloudIssueRule('sop-store-route', '到店路线引导', '到店邀约', 47, 760),
        makeCloudIssueRule('sop-objection-price', '价格异议承接', '异议处理', 46, 870),
        makeCloudIssueRule('sop-objection-wait', '等待周期解释', '异议处理', 44, 690),
        makeCloudIssueRule('sop-summary', '接待结束总结', '跟进承接', 42, 820),
        makeCloudIssueRule('sop-customer-tag', '客户标签补充', '跟进承接', 39, 760),
        makeSingleSceneIssueRule('sop-reception-needs-confirm', '需求确认', '接待流程', 81, 860, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-reception-opening', '接待开场规范', '接待流程', 79, 860, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-reception-product', '车型核心卖点讲解', '产品讲解', 73, 810, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-reception-competitor', '竞品差异回应', '产品讲解', 68, 760, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-reception-price', '报价信息说明', '价格沟通', 64, 720, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-reception-next-step', '接待后续安排', '跟进承接', 59, 690, SCENE_KEYS.storeReception),
        makeSingleSceneIssueRule('sop-drive-needs-confirm', '需求确认', '试驾准备', 76, 540, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-qualification', '试驾资格确认', '试驾准备', 82, 540, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-safety', '试驾安全说明', '试驾准备', 88, 520, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-route', '试驾路线说明', '试驾过程', 71, 500, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-feature', '车辆功能讲解', '试驾过程', 69, 490, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-feedback', '驾乘感受追问', '试驾复盘', 63, 470, SCENE_KEYS.testDrive),
        makeSingleSceneIssueRule('sop-drive-conversion', '试驾后转化引导', '试驾复盘', 57, 450, SCENE_KEYS.testDrive)
      ]
    },
    advantage: {
      label: '优势项识别',
      metricLabel: '命中率',
      countLabel: '命中/样本',
      emptyText: '暂无匹配优势项规则',
      topTitle: '优势组织 TOP5',
      bottomTitle: '优势待提升 BOT5',
      rules: [
        makeScopedIssueRule('adv-need', '深度需求挖掘', '需求洞察', 83, 980, ALL_ISSUE_SCENES),
        makeScopedIssueRule('adv-product-value', '本品价值塑造', '产品表达', 76, 960, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception, SCENE_KEYS.testDrive]),
        makeScopedIssueRule('adv-competitor', '竞品差异化对比', '产品表达', 71, 930, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('adv-price', '价格异议处理', '异议处理', 64, 890, [...CLOUD_ISSUE_SCENES, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('adv-version', '版本配置引导', '产品表达', 62, 850, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('adv-store', '门店/公司优势塑造', '信任建立', 59, 820, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('adv-wechat', '微信留资承接', '留资承接', 56, 800, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('adv-retain-lead', '留人稳线索', '线索承接', 52, 760, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('adv-invite', '到店邀约推进', '到店邀约', 49, 740, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('adv-boundary', '承诺与风险边界', '风险边界', 45, 680, ALL_ISSUE_SCENES)
      ]
    },
    defect: {
      label: '短板项识别',
      metricLabel: '短板出现率',
      countLabel: '短板/样本',
      emptyText: '暂无匹配短板项规则',
      topTitle: '短板最高 TOP5',
      bottomTitle: '短板最低 BOT5',
      rules: [
        makeScopedIssueRule('defect-need', '深度需求挖掘不足', '需求洞察', 68, 980, ALL_ISSUE_SCENES),
        makeScopedIssueRule('defect-product-value', '本品价值塑造偏弱', '产品表达', 63, 960, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception, SCENE_KEYS.testDrive]),
        makeScopedIssueRule('defect-competitor', '竞品对比缺少差异点', '产品表达', 59, 930, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('defect-price', '价格异议承接不到位', '异议处理', 55, 890, [...CLOUD_ISSUE_SCENES, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('defect-version', '版本配置引导不清晰', '产品表达', 52, 850, [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception]),
        makeScopedIssueRule('defect-store', '门店/公司优势未建立', '信任建立', 48, 820, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('defect-wechat', '微信留资承接缺失', '留资承接', 45, 800, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('defect-retain-lead', '线索承接节奏断档', '线索承接', 42, 760, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('defect-invite', '到店邀约推进不足', '到店邀约', 39, 740, CLOUD_ISSUE_SCENES),
        makeScopedIssueRule('defect-boundary', '承诺边界表达不清', '风险边界', 35, 680, ALL_ISSUE_SCENES)
      ]
    },
    risk: {
      label: '风险命中分析',
      metricLabel: '风险命中率',
      countLabel: '命中/样本',
      emptyText: '暂无匹配风险规则',
      topTitle: '风险最高 TOP5',
      bottomTitle: '风险最低 BOT5',
      rules: [
        makeScopedIssueRule('risk-abuse', '辱骂/嘲讽客户', '服务红线', 12, 860, ALL_ISSUE_SCENES),
        makeScopedIssueRule('risk-impatient', '明显不耐烦、催促打断客户', '服务红线', 18, 910, ALL_ISSUE_SCENES),
        makeScopedIssueRule('risk-conflict', '与客户争执、冲突', '服务红线', 9, 820, ALL_ISSUE_SCENES),
        makeScopedIssueRule('risk-no-apology-complaint', '客户明确表达不满后，销售未致歉', '服务补救', 21, 940, ALL_ISSUE_SCENES),
        makeScopedIssueRule('risk-no-apology-problem', '出现问题，或是客户不满时，未及时表示歉意', '服务补救', 24, 970, ALL_ISSUE_SCENES)
      ]
    }
  };

  const issueRuleAnalysisState = {
    activeTab: 'advantage',
    query: '',
    sort: 'rate-desc',
    page: 1,
    selectedRuleId: null,
    path: []
  };

  const sopAnalysisState = {
    activeTab: 'sop',
    query: '',
    sort: 'rate-desc',
    page: 1,
    selectedRuleId: null,
    path: []
  };

  const ISSUE_RULE_PAGE_SIZE = 10;
  const ISSUE_RULE_SORT_OPTIONS = [
    { value: 'rate-desc', label: '命中率从高到低' },
    { value: 'rate-asc', label: '命中率从低到高' },
    { value: 'count-desc', label: '命中数量优先' },
    { value: 'sample-desc', label: '样本数量优先' }
  ];

  const clampPercent = (value) => Math.max(1, Math.min(98, Math.round(value)));

  const textHash = (value) => String(value || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const getActiveIssueRuleConfig = (state = issueRuleAnalysisState) => ISSUE_RULE_TABS[state.activeTab] || ISSUE_RULE_TABS.sop;

  const getSelectedIssueScenes = () => {
    const selection = getFactorySceneSelection();
    return selection.isAllSelected
      ? selection.allowedScenes
      : selection.activeScenes;
  };

  const getIssueRulesForCurrentFilter = (state = issueRuleAnalysisState) => {
    const config = getActiveIssueRuleConfig(state);
    return aggregateIssueRulesByScenes(config.rules, getSelectedIssueScenes());
  };

  const getActiveIssueRule = (state = issueRuleAnalysisState) => (
    getIssueRulesForCurrentFilter(state).find(rule => rule.id === state.selectedRuleId) || null
  );
  const getIssueRuleSortLabel = (value) => ISSUE_RULE_SORT_OPTIONS.find(option => option.value === value)?.label || ISSUE_RULE_SORT_OPTIONS[0].label;

  const ISSUE_RULE_SCENE_PREVIEW_LIMIT = 99;
  const getIssueRuleSceneTagLabel = (label) => Array.from(String(label ?? '').trim())[0] || '';

  const renderIssueRuleSceneTagsHtml = (labels, previewLimit) => {
    const previewLabels = labels.slice(0, previewLimit);
    const hasMore = labels.length > previewLimit;
    return `
      <span class="issue-rule-tags">
        ${previewLabels.map(label => `<em tabindex="0" data-tag-label="${escapeHtml(label)}" aria-label="业务场景：${escapeHtml(label)}">${escapeHtml(getIssueRuleSceneTagLabel(label))}</em>`).join('')}
      </span>
      ${hasMore ? `
        <span class="issue-rule-scene-more" tabindex="0" aria-label="查看全部所属业务场景">...</span>
      ` : ''}
      <span class="issue-rule-scene-popover" role="tooltip">
        <strong>所属业务场景</strong>
        <span class="issue-rule-scene-popover-tags">
          ${labels.map(label => `<em>${escapeHtml(label)}</em>`).join('')}
        </span>
      </span>
    `;
  };

  const renderIssueRuleSceneTags = (sceneLabels = []) => {
    const labels = [...new Set(sceneLabels.filter(Boolean))];
    const dataLabels = escapeHtml(JSON.stringify(labels));
    return `<span class="issue-rule-scenes" data-issue-rule-scenes data-issue-rule-scenes-labels='${dataLabels}'>${renderIssueRuleSceneTagsHtml(labels, ISSUE_RULE_SCENE_PREVIEW_LIMIT)}</span>`;
  };

  const autoCollapseIssueRuleScenes = IssueRuleList.createAutoCollapser({
    renderHtml: renderIssueRuleSceneTagsHtml,
    previewLimit: ISSUE_RULE_SCENE_PREVIEW_LIMIT,
    progressive: true,
  });

  const getIssueRuleBaseOrg = () => {
    const region = currentRegion !== 'all'
      ? SOP_RANK_DATA.regions.find(item => item.name === currentRegion)
      : null;
    const zone = region && currentZone !== 'all'
      ? (region.zones || []).find(item => item.name === currentZone)
      : null;
    const store = zone && currentStore !== 'all'
      ? (zone.stores || []).find(item => item.name === currentStore)
      : null;

    return { region, zone, store };
  };

  const getCurrentOrgChildren = (state = issueRuleAnalysisState) => {
    const { region: baseRegion, zone: baseZone, store: baseStore } = getIssueRuleBaseOrg();
    const [firstCrumb, secondCrumb] = state.path;

    if (baseStore) {
      return [{ ...baseStore, level: 'store' }];
    }

    if (baseZone) {
      return (baseZone.stores || []).map(store => ({ ...store, level: 'store' }));
    }

    if (baseRegion) {
      if (!firstCrumb) {
        return (baseRegion.zones || []).map(zone => ({ ...zone, level: 'zone' }));
      }
      const zone = (baseRegion.zones || []).find(item => item.name === firstCrumb.name);
      if (!zone) return [];
      return (zone.stores || []).map(store => ({ ...store, level: 'store' }));
    }

    if (!firstCrumb) {
      return SOP_RANK_DATA.regions.map(region => ({ ...region, level: 'region' }));
    }
    const region = SOP_RANK_DATA.regions.find(item => item.name === firstCrumb.name);
    if (!region) return [];
    if (!secondCrumb) {
      return (region.zones || []).map(zone => ({ ...zone, level: 'zone' }));
    }
    const zone = (region.zones || []).find(item => item.name === secondCrumb.name);
    if (!zone) return [];
    return (zone.stores || []).map(store => ({ ...store, level: 'store' }));
  };

  const buildOrgRuleStats = (rule, org, index, state = issueRuleAnalysisState) => {
    const tab = state.activeTab;
    const hashOffset = (textHash(`${rule.id}-${org.name}`) % 13) - 6;
    const levelOffset = org.level === 'region' ? 0 : org.level === 'zone' ? -1 : -2;
    const sampleBase = org.level === 'region' ? 980 : org.level === 'zone' ? 360 : 118;
    const ruleScopeFactor = Math.max(0.2, Math.min(1.2, (Number(rule.sampleCount) || 0) / 1200));
    const sampleCount = Math.max(20, Math.round((sampleBase - index * 23 + (textHash(org.name) % 37)) * ruleScopeFactor));
    const orgSopRate = Number(org.sopRate || 75);
    const orgWeakItems = Number(org.weakItems || 4);
    const orgRiskRate = Number(org.riskHit || 6);
    const rate = tab === 'defect'
      ? clampPercent(rule.rate + (orgWeakItems - 4) * 6.2 + hashOffset + levelOffset)
      : tab === 'risk'
        ? clampPercent(rule.rate + (orgRiskRate - 6) * 3.4 + hashOffset + levelOffset)
        : clampPercent(rule.rate + (orgSopRate - 75) * 0.56 + hashOffset + levelOffset);

    return {
      name: org.name,
      level: org.level,
      rate,
      sampleCount,
      hitCount: Math.round(sampleCount * rate / 100),
      drillable: org.level !== 'store'
    };
  };

  const getVisibleIssueRules = (state = issueRuleAnalysisState) => {
    const availableRules = getIssueRulesForCurrentFilter(state);
    const query = state.query.trim();
    const filtered = query
      ? availableRules.filter(rule => rule.name.includes(query))
      : availableRules;

    const sorted = filtered.sort((a, b) => {
      if (state.sort === 'rate-asc') return a.rate - b.rate;
      if (state.sort === 'count-desc') return b.hitCount - a.hitCount;
      if (state.sort === 'sample-desc') return b.sampleCount - a.sampleCount;
      return b.rate - a.rate;
    });

    return sorted;
  };

  const escapeIssueExportCsvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const getIssueExportTimeLabel = () => {
    if (currentTime === 'custom') {
      return factoryTimeStartDate && factoryTimeEndDate
        ? `${factoryTimeStartDate} 至 ${factoryTimeEndDate}`
        : '自定义时间';
    }
    return ({ '1': '昨日', '7': '近7天', '15': '近15天', '30': '近30天' })[currentTime] || '昨日';
  };

  const exportSOPRuleList = () => {
    const rules = getVisibleIssueRules(sopAnalysisState);
    if (!rules.length) return 0;

    const organization = formatFactoryOrganizationDisplay(getCurrentFactoryOrgPath());
    const sceneSelection = getFactorySceneSelection();
    const selectedScenes = sceneSelection.isAllSelected
      ? '全部'
      : sceneSelection.activeScenes.map(getSceneLabel).join('、');
    const rows = [[
      '统计组织',
      '品牌',
      '车系',
      '时间范围',
      '业务场景筛选',
      'SOP规则',
      '所属业务场景',
      '命中率',
      '命中数',
      '样本数'
    ]];

    rules.forEach(rule => {
      rows.push([
        organization,
        currentBrand || '全部品牌',
        currentModel === 'all' ? '全部车系' : currentModel,
        getIssueExportTimeLabel(),
        selectedScenes || '未选择',
        rule.name,
        (rule.applicableScenes || []).map(getSceneLabel).join('、'),
        `${rule.rate}%`,
        rule.hitCount,
        rule.sampleCount
      ]);
    });

    const csv = `\ufeff${rows.map(row => row.map(escapeIssueExportCsvCell).join(',')).join('\n')}`;
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    const date = new Date();
    const dateLabel = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    link.href = blobUrl;
    link.download = `厂端SOP执行分析-${organization}-${dateLabel}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    return rules.length;
  };

  const getCompactIssueRulePaginationPages = (pageCount, currentPage) => {
    if (pageCount <= 3) return new Set(Array.from({ length: pageCount }, (_, index) => index + 1));
    const startPage = Math.min(Math.max(currentPage - 1, 1), pageCount - 2);
    return new Set([startPage, startPage + 1, startPage + 2]);
  };

  const renderIssueRulePagination = (totalItems, currentPage, pageCount) => {
    const compactPages = getCompactIssueRulePaginationPages(pageCount, currentPage);
    return `
    <div class="issue-rule-footer issue-rule-pagination session-pagination">
      <div class="dashboard-pagination">
        <span class="session-pagination-total">共 ${totalItems} 条</span>
        <div class="dashboard-pagination-controls">
          <span class="issue-pagination-page-size">${ISSUE_RULE_PAGE_SIZE} 条/页</span>
          <div class="page-group" aria-label="规则分页">
            <button type="button" class="issue-rule-page-btn page-arrow" data-page-action="prev" aria-label="上一页" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: pageCount }, (_, index) => index + 1).map(page => `
              <button type="button" class="issue-rule-page-number page-num${page === currentPage ? ' active' : ''}${compactPages.has(page) ? ' is-compact-visible' : ''}" data-page-number="${page}" aria-label="第 ${page} 页" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>
            `).join('')}
            <button type="button" class="issue-rule-page-btn page-arrow" data-page-action="next" aria-label="下一页" ${currentPage >= pageCount ? 'disabled' : ''}>›</button>
          </div>
          <label class="page-jump-group">
            <span class="session-page-jump-label">前往</span>
            <span class="page-select page-jump-select">
              <input type="number" min="1" max="${pageCount}" value="${currentPage}" data-issue-page-jump aria-label="前往页码">
            </span>
            <span class="session-page-jump-suffix">页</span>
          </label>
        </div>
      </div>
    </div>
  `;
  };

  const renderIssueRuleSortControl = (state = issueRuleAnalysisState) => `
    <div class="issue-rule-sort">
      <span>排序</span>
      <div class="issue-rule-sort-dropdown">
        <button type="button" class="issue-rule-sort-trigger store-model-trigger session-select-trigger" aria-haspopup="listbox" aria-expanded="false">
          <span class="issue-rule-sort-value">${escapeHtml(getIssueRuleSortLabel(state.sort))}</span>
          <svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
        <div class="issue-rule-sort-panel store-model-panel session-menu-panel" role="listbox" aria-label="排序方式">
          <div class="session-menu-option-list">
            ${ISSUE_RULE_SORT_OPTIONS.map(option => `
              <button
                type="button"
                class="issue-rule-sort-option store-model-option session-menu-option${state.sort === option.value ? ' active' : ''}"
                data-sort-value="${option.value}"
                role="option"
                aria-selected="${state.sort === option.value ? 'true' : 'false'}"
              ><span>${escapeHtml(option.label)}</span></button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  const renderRuleListView = (config, rules, state = issueRuleAnalysisState) => {
    const canExport = state.activeTab === 'sop';
    const pageCount = Math.max(1, Math.ceil(rules.length / ISSUE_RULE_PAGE_SIZE));
    const currentPage = Math.min(state.page, pageCount);
    const start = (currentPage - 1) * ISSUE_RULE_PAGE_SIZE;
    const visibleRules = rules.slice(start, start + ISSUE_RULE_PAGE_SIZE);
    const rows = visibleRules.map(rule => {
      const tagLabels = (rule.applicableScenes || []).map(getSceneLabel);

      return `
        <div class="issue-rule-row" data-rule-id="${rule.id}">
          <span class="issue-rule-name">
            <span class="issue-rule-name-line">
              <span class="issue-rule-name-copy">
                <strong class="issue-rule-name-text" data-rule-name-ellipsis-target tabindex="0">${escapeHtml(rule.name)}</strong>
                <span class="issue-rule-name-popover" role="tooltip">${escapeHtml(rule.name)}</span>
              </span>
              ${renderIssueRuleSceneTags(tagLabels)}
            </span>
          </span>
          <span class="issue-rule-rate">${rule.rate}%</span>
          <span class="issue-rule-count">${rule.hitCount}/${rule.sampleCount}</span>
          <button type="button" class="issue-rule-action" data-rule-id="${rule.id}" aria-label="查看${escapeHtml(rule.name)}的组织表现">看组织表现</button>
        </div>
      `;
    }).join('');

    return `
      ${canExport ? `
        <div class="issue-rule-toolbar has-export">
          <label class="issue-rule-search">
            <span>搜索规则</span>
            <input class="issue-rule-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="输入规则名称" autocomplete="off">
          </label>
          ${renderIssueRuleSortControl(state)}
          <button type="button" class="issue-rule-export-btn" ${rules.length ? '' : 'disabled'}>
            <img src="../assets/factory-issue-overview/export-icon-565-5396.svg" alt="" aria-hidden="true">
            <span>导出</span>
          </button>
        </div>
      ` : ''}
      <div class="issue-rule-list-shell">
        <div class="issue-rule-list-head">
          <span class="issue-rule-name-head">规则名称</span>
          <span>${config.metricLabel}</span>
          <span>${config.countLabel}</span>
          <span>操作</span>
        </div>
        <div class="issue-rule-list">
          ${rows || `<div class="issue-rule-empty">${config.emptyText}</div>`}
        </div>
      </div>
      ${renderIssueRulePagination(rules.length, currentPage, pageCount)}
    `;
  };

  const renderOrgRankList = (title, rows, config, tone = '') => `
    <div class="issue-org-rank-card ${tone}">
      <div class="issue-org-list-head">
        <span>${title}</span>
        <span>${config.metricLabel}</span>
        <span>${config.countLabel}</span>
        <span>操作</span>
      </div>
      <div class="issue-org-rank-list">
        ${rows.map((row, index) => `
          <button type="button" class="issue-org-row${row.drillable ? '' : ' disabled'}" data-org-name="${escapeHtml(row.name)}" ${row.drillable ? '' : 'disabled'}>
            <span class="issue-org-main">
              <em>${index + 1}</em>
              <strong>${escapeHtml(row.name)}</strong>
            </span>
            <span class="issue-org-rate">${row.rate}%</span>
            <span class="issue-org-count">${row.hitCount}/${row.sampleCount}</span>
            <span class="issue-org-drill${row.drillable ? ' drill-link' : ''}">${row.drillable ? '下钻' : '门店层'}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const renderIssueSelectedMetricIcon = (type) => {
    if (type === 'count') {
      return `
        <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
          <path opacity="0.96" d="M6.77684 10.5133C7.61631 10.5133 8.29684 9.83276 8.29684 8.99329C8.29684 8.15382 7.61631 7.47329 6.77684 7.47329C5.93736 7.47329 5.25684 8.15382 5.25684 8.99329C5.25684 9.83276 5.93736 10.5133 6.77684 10.5133Z" fill="url(#issue-count-0)"/>
          <path opacity="0.88" d="M6.77684 16.7199C7.61631 16.7199 8.29684 16.0394 8.29684 15.1999C8.29684 14.3605 7.61631 13.6799 6.77684 13.6799C5.93736 13.6799 5.25684 14.3605 5.25684 15.1999C5.25684 16.0394 5.93736 16.7199 6.77684 16.7199Z" fill="url(#issue-count-1)"/>
          <path opacity="0.8" d="M6.77684 22.9266C7.61631 22.9266 8.29684 22.246 8.29684 21.4066C8.29684 20.5671 7.61631 19.8866 6.77684 19.8866C5.93736 19.8866 5.25684 20.5671 5.25684 21.4066C5.25684 22.246 5.93736 22.9266 6.77684 22.9266Z" fill="url(#issue-count-2)"/>
          <path d="M22.2302 7.40991H11.9702C11.0958 7.40991 10.3869 8.11879 10.3869 8.99325C10.3869 9.8677 11.0958 10.5766 11.9702 10.5766H22.2302C23.1047 10.5766 23.8136 9.8677 23.8136 8.99325C23.8136 8.11879 23.1047 7.40991 22.2302 7.40991Z" fill="url(#issue-count-3)"/>
          <path opacity="0.9" d="M22.2302 13.6167H11.9702C11.0958 13.6167 10.3869 14.3255 10.3869 15.2C10.3869 16.0744 11.0958 16.7833 11.9702 16.7833H22.2302C23.1047 16.7833 23.8136 16.0744 23.8136 15.2C23.8136 14.3255 23.1047 13.6167 22.2302 13.6167Z" fill="url(#issue-count-4)"/>
          <path opacity="0.8" d="M22.2302 19.8233H11.9702C11.0958 19.8233 10.3869 20.5322 10.3869 21.4066C10.3869 22.2811 11.0958 22.99 11.9702 22.99H22.2302C23.1047 22.99 23.8136 22.2811 23.8136 21.4066C23.8136 20.5322 23.1047 19.8233 22.2302 19.8233Z" fill="url(#issue-count-5)"/>
          <defs>
            <linearGradient id="issue-count-0" x1="5.06684" y1="3.79996" x2="25.3335" y2="26.6" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
            <linearGradient id="issue-count-1" x1="5.06684" y1="3.79993" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
            <linearGradient id="issue-count-2" x1="5.06684" y1="3.7999" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
            <linearGradient id="issue-count-3" x1="5.06691" y1="3.79991" x2="25.3336" y2="26.5999" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
            <linearGradient id="issue-count-4" x1="5.06691" y1="3.79998" x2="25.3336" y2="26.6" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
            <linearGradient id="issue-count-5" x1="5.06691" y1="3.79996" x2="25.3336" y2="26.6" gradientUnits="userSpaceOnUse"><stop stop-color="#A78BFA"/><stop offset="0.54" stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
          </defs>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
        <path d="M15.2 4.2 24 7.4v6.58c0 4.94-3.28 9.56-8.8 12.22-5.52-2.66-8.8-7.28-8.8-12.22V7.4l8.8-3.2Z" fill="url(#issue-rate-a)"/>
        <path d="M15.2 9.26a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2.22a2.48 2.48 0 1 0 0 4.96 2.48 2.48 0 0 0 0-4.96Z" fill="url(#issue-rate-b)"/>
        <path d="M15.2 7.14c3.9 0 7.06 3.16 7.06 7.06 0 .87-.16 1.7-.45 2.46l-1.97-.76c.2-.53.3-1.1.3-1.7a4.94 4.94 0 1 0-9.88 0c0 2.73 2.21 4.94 4.94 4.94.84 0 1.64-.21 2.33-.58l1.05 1.83a7.02 7.02 0 0 1-3.38.86 7.06 7.06 0 0 1 0-14.1Z" fill="url(#issue-rate-c)"/>
        <defs>
          <linearGradient id="issue-rate-a" x1="7.17" y1="5.08" x2="25.31" y2="24.86" gradientUnits="userSpaceOnUse"><stop stop-color="#86EFAC"/><stop offset="0.58" stop-color="#22C55E"/><stop offset="1" stop-color="#16A34A"/></linearGradient>
          <linearGradient id="issue-rate-b" x1="10.5" y1="9.9" x2="20.55" y2="19.53" gradientUnits="userSpaceOnUse"><stop stop-color="#F0FDF4"/><stop offset="1" stop-color="#BBF7D0"/></linearGradient>
          <linearGradient id="issue-rate-c" x1="8.94" y1="7.14" x2="23.36" y2="20.72" gradientUnits="userSpaceOnUse"><stop stop-color="#DCFCE7"/><stop offset="1" stop-color="#22C55E"/></linearGradient>
        </defs>
      </svg>
    `;
  };

  const renderOrgDrillView = (config, rule, state = issueRuleAnalysisState) => {
    const children = getCurrentOrgChildren(state).map((org, index) => buildOrgRuleStats(rule, org, index, state));
    const sortedRows = sortIssueOrgRows(children, state.sort);
    const canBackLevel = state.path.length > 0;

    return `
      <div class="issue-selected-metrics">
        <div class="issue-selected-metric-card">
          <div class="issue-selected-metric-main">
            <div class="issue-selected-metric-icon">
              <img src="../assets/factory-issue-overview/metric-rate-icon-566-7059.png" alt="" aria-hidden="true">
            </div>
            <div class="issue-selected-metric-body">
              <span class="issue-selected-metric-label">${config.metricLabel}</span>
              <strong class="issue-selected-metric-value">${rule.rate}%</strong>
            </div>
          </div>
        </div>
        <div class="issue-selected-metric-card">
          <div class="issue-selected-metric-main">
            <div class="issue-selected-metric-icon">
              <img src="../assets/factory-issue-overview/metric-count-icon-566-7081.png" alt="" aria-hidden="true">
            </div>
            <div class="issue-selected-metric-body">
              <span class="issue-selected-metric-label">${config.countLabel}</span>
              <strong class="issue-selected-metric-value">${rule.hitCount}/${rule.sampleCount}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="issue-drill-actions">
        <button type="button" class="issue-rule-back">返回规则列表</button>
        ${canBackLevel ? '<button type="button" class="issue-org-back">返回上一级</button>' : ''}
      </div>
      <div class="issue-org-rank-grid">
        ${renderOrgRankList('当前组织列表', sortedRows, config)}
      </div>
    `;
  };

  const bindIssueRuleAnalysisEvents = (focusSearch = false, rootId = 'issue-rule-analysis-root', state = issueRuleAnalysisState) => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const searchInput = root.querySelector('.issue-rule-search-input');
    if (searchInput) {
      const applyIssueRuleSearch = (value) => {
        const nextQuery = value || '';
        if (state.query === nextQuery) return;
        state.query = nextQuery;
        state.page = 1;
        const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
        render(true);
      };
      searchInput.addEventListener('input', (event) => {
        if (event.isComposing) return;
        applyIssueRuleSearch(event.currentTarget.value);
      });
      searchInput.addEventListener('compositionend', (event) => applyIssueRuleSearch(event.currentTarget.value));
      searchInput.addEventListener('search', (event) => applyIssueRuleSearch(event.currentTarget.value));
      if (focusSearch) {
        const position = searchInput.value.length;
        requestAnimationFrame(() => {
          searchInput.focus();
          searchInput.setSelectionRange(position, position);
        });
      }
    }

    root.querySelector('.issue-rule-export-btn')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const exportedCount = exportSOPRuleList();
      if (!exportedCount) return;
      const label = button.querySelector('span');
      button.classList.add('is-success');
      if (label) label.textContent = `已导出 ${exportedCount} 条`;
      window.setTimeout(() => {
        button.classList.remove('is-success');
        if (label) label.textContent = '导出';
      }, 1600);
    });

    const sortScope = rootId === 'issue-rule-analysis-root'
      ? root.closest('.issue-overview-wrapper')
      : root;
    const sortTrigger = sortScope?.querySelector('.issue-rule-sort-trigger');
    const sortPanel = sortScope?.querySelector('.issue-rule-sort-panel');
    const closeSortPanel = () => {
      if (!sortTrigger || !sortPanel) return;
      sortPanel.classList.remove('show');
      sortTrigger.classList.remove('active');
      sortTrigger.setAttribute('aria-expanded', 'false');
    };
    const openSortPanel = () => {
      if (!sortTrigger || !sortPanel) return;
      sortPanel.classList.add('show');
      sortTrigger.classList.add('active');
      sortTrigger.setAttribute('aria-expanded', 'true');
    };

    sortTrigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (sortPanel?.classList.contains('show')) {
        closeSortPanel();
      } else {
        openSortPanel();
      }
    });

    sortPanel?.addEventListener('click', (event) => {
      const option = event.target.closest('.issue-rule-sort-option');
      if (!option || !option.dataset.sortValue) return;
      state.sort = option.dataset.sortValue;
      state.page = 1;
      closeSortPanel();
      const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
      render();
    });

    root.querySelectorAll('.issue-rule-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const rules = getVisibleIssueRules(state);
        const pageCount = Math.max(1, Math.ceil(rules.length / ISSUE_RULE_PAGE_SIZE));
        const delta = btn.dataset.pageAction === 'next' ? 1 : -1;
        state.page = Math.max(1, Math.min(pageCount, state.page + delta));
        const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
        render();
      });
    });

    root.querySelectorAll('.issue-rule-page-number').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = Number(btn.dataset.pageNumber);
        if (!Number.isInteger(targetPage) || targetPage === state.page) return;
        state.page = targetPage;
        const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
        render();
      });
    });

    const pageJumpInput = root.querySelector('[data-issue-page-jump]');
    const applyPageJump = () => {
      if (!pageJumpInput) return;
      const rules = getVisibleIssueRules(state);
      const pageCount = Math.max(1, Math.ceil(rules.length / ISSUE_RULE_PAGE_SIZE));
      const requestedPage = Number(pageJumpInput.value);
      const targetPage = Math.max(1, Math.min(pageCount, Number.isFinite(requestedPage) ? Math.round(requestedPage) : state.page));
      if (targetPage === state.page) {
        pageJumpInput.value = String(targetPage);
        return;
      }
      state.page = targetPage;
      const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
      render();
    };
    pageJumpInput?.addEventListener('change', applyPageJump);
    pageJumpInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      applyPageJump();
    });

    const rules = getVisibleIssueRules(state);
    const pageCount = Math.max(1, Math.ceil(rules.length / ISSUE_RULE_PAGE_SIZE));
    if (state.page > pageCount) {
      state.page = pageCount;
      const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
      render();
      return;
    }

    root.querySelectorAll('.issue-rule-action').forEach(actionBtn => {
      actionBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const row = actionBtn.closest('.issue-rule-row');
        if (!row) return;
        state.selectedRuleId = row.dataset.ruleId;
        state.path = [];
        const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
        render();
      });
    });

    root.querySelector('.issue-rule-back')?.addEventListener('click', () => {
      state.selectedRuleId = null;
      state.path = [];
      const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
      render();
    });

    root.querySelector('.issue-org-back')?.addEventListener('click', () => {
      state.path.pop();
      const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
      render();
    });

    root.querySelectorAll('.issue-org-row:not(.disabled)').forEach(row => {
      row.addEventListener('click', () => {
        state.path.push({ name: row.dataset.orgName });
        const render = rootId === 'issue-sop-analysis-root' ? renderSOPAnalysis : renderIssueRuleAnalysis;
        render();
      });
    });

    if (!document.body.dataset.issueRuleSortBound) {
      document.body.dataset.issueRuleSortBound = 'true';

      document.addEventListener('click', (event) => {
        ['issue-rule-analysis-root', 'issue-sop-analysis-root'].forEach(id => {
          const activeRoot = document.getElementById(id);
          const activeScope = id === 'issue-rule-analysis-root'
            ? activeRoot?.closest('.issue-overview-wrapper')
            : activeRoot;
          const activeTrigger = activeScope?.querySelector('.issue-rule-sort-trigger');
          const activePanel = activeScope?.querySelector('.issue-rule-sort-panel');
          if (!activeTrigger || !activePanel) return;
          if (activeTrigger.contains(event.target) || activePanel.contains(event.target)) return;
          activePanel.classList.remove('show');
          activeTrigger.classList.remove('active');
          activeTrigger.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        ['issue-rule-analysis-root', 'issue-sop-analysis-root'].forEach(id => {
          const activeRoot = document.getElementById(id);
          const activeScope = id === 'issue-rule-analysis-root'
            ? activeRoot?.closest('.issue-overview-wrapper')
            : activeRoot;
          const activeTrigger = activeScope?.querySelector('.issue-rule-sort-trigger');
          const activePanel = activeScope?.querySelector('.issue-rule-sort-panel');
          if (!activeTrigger || !activePanel) return;
          activePanel.classList.remove('show');
          activeTrigger.classList.remove('active');
          activeTrigger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  };

  const renderIssueRuleAnalysis = (focusSearch = false) => {
    const root = document.getElementById('issue-rule-analysis-root');
    if (!root) return;
    const sortHost = document.getElementById('issue-insight-sort-host');
    if (sortHost) sortHost.innerHTML = renderIssueRuleSortControl(issueRuleAnalysisState);
    const config = getActiveIssueRuleConfig();
    const selectedRule = getActiveIssueRule();
    const rules = getVisibleIssueRules();
    root.innerHTML = selectedRule
      ? renderOrgDrillView(config, selectedRule)
      : renderRuleListView(config, rules);
    bindIssueRuleAnalysisEvents(focusSearch);
    autoCollapseIssueRuleScenes(root);
  };

  function renderSOPAnalysis(focusSearch = false) {
    const root = document.getElementById('issue-sop-analysis-root');
    if (!root) return;
    const config = getActiveIssueRuleConfig(sopAnalysisState);
    const selectedRule = getActiveIssueRule(sopAnalysisState);
    const rules = getVisibleIssueRules(sopAnalysisState);
    root.innerHTML = selectedRule
      ? renderOrgDrillView(config, selectedRule, sopAnalysisState)
      : renderRuleListView(config, rules, sopAnalysisState);
    bindIssueRuleAnalysisEvents(focusSearch, 'issue-sop-analysis-root', sopAnalysisState);
    autoCollapseIssueRuleScenes(root);
  }

  // ── renderSOPDial：圆环动画 ─────────────────────────
  const renderSOPDial = () => {
    const fill = document.getElementById('sop-dial-fill');
    if (fill) {
      const circumference = 2 * Math.PI * 65; // ~408.4
      const offset = circumference * (1 - SOP_DIAL.score / 100);
      requestAnimationFrame(() => { fill.style.strokeDashoffset = offset; });
    }
    const valEl = document.getElementById('sop-score-val');
    if (valEl) valEl.innerHTML = `${SOP_DIAL.score}<span>%</span>`;
    const periodEl = document.getElementById('sop-period-change');
    const periodValueEl = periodEl?.querySelector('.sop-period-change-value');
    if (periodEl) {
      const periodDelta = Number(SOP_DIAL.periodDelta || 0);
      const periodText = `${periodDelta >= 0 ? '+' : ''}${periodDelta}%`;
      if (periodValueEl) {
        periodValueEl.textContent = `环比 ${periodText}`;
      } else {
        periodEl.textContent = `环比 ${periodText}`;
      }
      periodEl.classList.toggle('up', periodDelta >= 0);
      periodEl.classList.toggle('down', periodDelta < 0);
    }
    const avgEl = document.getElementById('sop-national-avg');
    if (avgEl) avgEl.textContent = String(SOP_DIAL.nationalAvg);
    const nationalDiffEl = document.getElementById('sop-national-diff');
    const nationalDiffLabelEl = nationalDiffEl?.querySelector('.sop-national-diff-label');
    const nationalDiffValueEl = nationalDiffEl?.querySelector('.sop-national-diff-value');
    if (nationalDiffEl) {
      const diff = SOP_DIAL.score - SOP_DIAL.nationalAvg;
      const diffText = `${Math.abs(diff)}%`;
      if (nationalDiffLabelEl) {
        nationalDiffLabelEl.textContent = diff >= 0 ? '+' : '-';
      }
      if (nationalDiffValueEl) {
        nationalDiffValueEl.textContent = diffText;
      } else {
        nationalDiffEl.textContent = `VS.全国 ${diffText}`;
      }
      nationalDiffEl.classList.toggle('up', diff >= 0);
      nationalDiffEl.classList.toggle('down', diff < 0);
    }
    const sumEl = document.getElementById('sop-ai-summary');
    const sumTextEl = sumEl?.querySelector('.hint-text');
    if (sumTextEl) {
      sumTextEl.textContent = SOP_DIAL.summary;
    } else if (sumEl) {
      sumEl.textContent = SOP_DIAL.summary;
    }
  };

  // ── renderSOPWeakness / Risk：严格沿用门店看板 TOP5 ──
  window.toggleIssue = (containerId, idx) => {
    const cards = document.querySelectorAll(`#${containerId} .issue-card`);
    const target = cards[idx];
    if (!target) return;
    const isExpanded = target.classList.contains('expanded');
    cards.forEach(c => c.classList.remove('expanded'));
    if (!isExpanded) {
      target.classList.add('expanded');
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }
  };

  const advisorScopeBadge = (count) => {
    const ratio = `${count}/${TOTAL_ADVISOR_COUNT}`;
    if (count >= 3) return `<span class="scope-badge scope-shared">共性·${ratio}</span>`;
    if (count === 2) return `<span class="scope-badge scope-multi">多人·${ratio}</span>`;
    return `<span class="scope-badge scope-single">个人·${ratio}</span>`;
  };

  const advisorScopeText = (count) => {
    const ratio = `${count}/${TOTAL_ADVISOR_COUNT}`;
    if (count >= 3) return `<span class="issue-scope-text scope-shared">共性·${ratio}</span>`;
    if (count === 2) return `<span class="issue-scope-text scope-multi">多人·${ratio}</span>`;
    return `<span class="issue-scope-text scope-single">个人·${ratio}</span>`;
  };

  const advisorOrgPath = (recording) => {
    if (recording.orgPath) return recording.orgPath;
    const orgMap = {
      '林涛': '华南大区-广东省-广州市-传祺经典店-林涛',
      '张华': '华南大区-广东省-深圳市-传祺南山店-张华',
      '王萌': '华东大区-浙江省-杭州市-传祺西湖店-王萌',
      '赵强': '华北大区-北京市-北京市-传祺朝阳店-赵强',
      '李昱': '华东大区-上海市-上海市-传祺浦东店-李昱'
    };
    return orgMap[recording.advisor] || recording.advisor;
  };

  const issueRecLinks = (recs = []) => recs.map(r =>
    `<a class="rec-link issue-rec-link" href="javascript:void(0)" onclick="event.stopPropagation();openRecordingPlayer('${r.id}')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span class="rec-advisor rec-org-path">${advisorOrgPath(r)}</span>
      <span class="rec-meta"><span class="rec-time">${r.time}</span></span>
    </a>`).join('');

  const renderSOPWordCloud = (containerId, items, type) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    const valueKey = type === 'risk' ? 'hit_ratio' : 'unhit_ratio';
    const sortedItems = [...items].sort((a, b) => parseFloat(b[valueKey]) - parseFloat(a[valueKey]));
    const values = sortedItems.map(item => parseFloat(item[valueKey]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const tones = type === 'risk'
      ? ['red', 'amber', 'violet', 'red', 'amber']
      : ['amber', 'blue', 'green', 'violet', 'blue'];
    const offsets = ['', ' offset-up', '', ' offset-down', ''];
    const cloudItems = sortedItems.map((item, index) => {
      const value = parseFloat(item[valueKey]) || 0;
      const normalized = max === min ? 0.72 : (value - min) / (max - min);
      const sizeClass = normalized >= 0.82 ? 'xl' : normalized >= 0.58 ? 'lg' : normalized >= 0.32 ? 'md' : 'sm';
      return `<span class="lead-cloud-term ${tones[index % tones.length]} ${sizeClass}${offsets[index % offsets.length]}" title="${item.title} · ${item[valueKey]}">
        <span class="lead-cloud-term-copy">${item.title}</span>
      </span>`;
    }).join('');
    el.innerHTML = `<div class="issue-word-cloud ${type}">
      <div class="issue-word-cloud-body">${cloudItems}</div>
    </div>`;
  };

  const setupSOPIssueCloudTabs = () => {
    const tabs = document.querySelectorAll('.issue-overview-wrapper [data-issue-insight-tab]');
    if (!tabs.length) return;

    const switchTo = (target = 'advantage') => {
      tabs.forEach(tab => {
        const active = tab.dataset.issueInsightTab === target;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      issueRuleAnalysisState.activeTab = ISSUE_RULE_TABS[target] ? target : 'advantage';
      issueRuleAnalysisState.query = '';
      issueRuleAnalysisState.page = 1;
      issueRuleAnalysisState.selectedRuleId = null;
      issueRuleAnalysisState.path = [];
      renderIssueRuleAnalysis();
    };

    tabs.forEach(tab => {
      const activate = () => switchTo(tab.dataset.issueInsightTab);
      tab.onclick = activate;
      tab.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      };
    });
  };

  let factoryIssueRecordingLibraryState = null;

  window.openFactoryIssueRecordingLibrary = (type, index) => {
    const items = type === 'strength'
      ? [...strengthData].sort((a, b) => parseFloat(b.hit_ratio) - parseFloat(a.hit_ratio))
      : type === 'risk'
        ? [...riskData].sort((a, b) => parseFloat(b.hit_ratio) - parseFloat(a.hit_ratio))
        : [...weaknessData];
    const issue = items[index];
    if (!issue) return;

    const existing = document.getElementById('issue-recording-library-overlay');
    if (existing) existing.remove();

    const fallbackTimes = ['3-25 15:20', '3-25 11:05', '3-24 16:40', '3-24 10:15', '3-23 14:20'];
    const baseId = type === 'risk' ? 2087346132915122176n : 2087346017925713920n;
    const records = (issue.recordings || []).map((record, recordIndex) => ({
      advisor: record.advisor,
      time: record.time || fallbackTimes[recordIndex % fallbackTimes.length],
      id: String(baseId + BigInt(recordIndex)),
      orgPath: `${advisorOrgPath(record)}-${record.customer || `${record.advisor || '顾问'}相关客户`}`,
      store: '上海中心店',
      scene: type === 'risk' ? '风险命中' : '质检复盘',
      customer: record.customer || `${record.advisor || '顾问'}相关录音`
    }));

    factoryIssueRecordingLibraryState = {
      issue,
      type,
      records,
      query: '',
      page: 1
    };

    const overlay = document.createElement('div');
    overlay.id = 'issue-recording-library-overlay';
    overlay.className = 'issue-recording-library-overlay';
    overlay.innerHTML = `
      <section class="issue-recording-library-page" role="dialog" aria-modal="true" aria-labelledby="issue-recording-library-title">
        <div class="recording-library-head">
          <div>
            <div class="recording-library-eyebrow">${type === 'risk' ? '风险命中录音' : type === 'strength' ? '优势发掘录音' : '短板改善录音'}</div>
            <h2 id="issue-recording-library-title">${issue.title}</h2>
            <p>${type === 'risk' ? '按风险命中样本查看原声证据' : '按未命中样本查看原声证据'}，支持搜索顾问、门店、录音编号。</p>
          </div>
          <button type="button" class="recording-library-close" aria-label="关闭录音列表" onclick="closeFactoryIssueRecordingLibrary()">×</button>
        </div>
        <div class="recording-library-summary">
          <div><strong>${records.length}</strong><span>全部录音</span></div>
          <div><strong>${issue.advisor_count || 0}/${TOTAL_ADVISOR_COUNT}</strong><span>涉及顾问</span></div>
        </div>
        <div class="recording-library-tools">
          <label class="recording-library-search">
            <span>搜索</span>
            <input id="issue-recording-library-search" type="search" placeholder="输入顾问、门店、录音编号" autocomplete="off">
          </label>
        </div>
        <div class="recording-library-result-row">
          <span id="issue-recording-library-result"></span>
        </div>
        <div class="recording-library-list" id="issue-recording-library-list"></div>
        <div class="recording-library-footer">
          <button type="button" id="issue-recording-library-more" class="recording-library-more" hidden>加载更多</button>
        </div>
      </section>`;

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) window.closeFactoryIssueRecordingLibrary();
    });
    document.body.appendChild(overlay);

    const searchInput = document.getElementById('issue-recording-library-search');
    searchInput?.addEventListener('input', (event) => {
      factoryIssueRecordingLibraryState.query = event.target.value;
      factoryIssueRecordingLibraryState.page = 1;
      renderFactoryIssueRecordingLibraryList();
    });

    const loadMoreBtn = document.getElementById('issue-recording-library-more');
    loadMoreBtn?.addEventListener('click', () => {
      factoryIssueRecordingLibraryState.page += 1;
      renderFactoryIssueRecordingLibraryList();
    });

    renderFactoryIssueRecordingLibraryList();
    setTimeout(() => searchInput?.focus(), 0);
  };

  window.closeFactoryIssueRecordingLibrary = () => {
    const overlay = document.getElementById('issue-recording-library-overlay');
    if (overlay) overlay.remove();
    factoryIssueRecordingLibraryState = null;
  };

  const renderFactoryIssueRecordingLibraryList = () => {
    if (!factoryIssueRecordingLibraryState) return;

    const { records, query, page } = factoryIssueRecordingLibraryState;
    const listEl = document.getElementById('issue-recording-library-list');
    const resultEl = document.getElementById('issue-recording-library-result');
    const loadMoreBtn = document.getElementById('issue-recording-library-more');
    if (!listEl || !resultEl || !loadMoreBtn) return;

    const PAGE_SIZE = 10;
    const normalizedQuery = String(query || '').trim();
    const filtered = normalizedQuery
      ? records.filter(record =>
          (record.advisor || '').includes(normalizedQuery)
          || (record.orgPath || '').includes(normalizedQuery)
          || (record.id || '').includes(normalizedQuery)
          || (record.time || '').includes(normalizedQuery)
        )
      : records;

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);
    const hasMore = start + PAGE_SIZE < total;

    resultEl.textContent = `共 ${total} 条`;
    loadMoreBtn.hidden = !hasMore;

    if (!pageRecords.length) {
      listEl.innerHTML = '<div class="recording-library-empty">暂无匹配录音</div>';
      return;
    }

    const html = pageRecords.map(record => `
      <div class="recording-library-row">
        <div class="recording-library-play">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div class="recording-library-main">
          <strong>${record.orgPath}</strong>
          <span>${record.time} · ${record.id}</span>
        </div>
        <button type="button" class="recording-library-detail" onclick="openRecordingPlayer('${record.id}')" aria-label="查看录音详情">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>`).join('');

    if (page === 1) {
      listEl.innerHTML = html;
    } else {
      listEl.innerHTML += html;
    }
  };

  const renderSOPWeakness = () => {
    const weaknessEl = document.getElementById("weakness-chart");
    if (!weaknessEl) return;
    weaknessEl.style.height = 'auto';
    weaknessEl.innerHTML = weaknessData.map((w, i) => {
      const pct = parseFloat(w.unhit_ratio);
      const rankContent = i < 3
        ? `<img class="issue-rank-icon" src="../assets/insight-rank-${i + 1}.png" alt="${i + 1}">`
        : `${i + 1}`;
      return `<div class="issue-card rank-${i + 1}" role="button" tabindex="0">
        <div class="issue-header issue-header-stacked-actions">
          <div class="issue-rank${i < 3 ? ' has-rank-icon' : ''}">${rankContent}</div>
          <div class="issue-info">
            <div class="issue-title-row"><span class="issue-title">${w.title}</span></div>
            <div class="issue-bar-row">
              <div class="issue-bar-track"><div class="issue-bar-fill" style="width:${pct}%"></div></div>
              <span class="issue-stat">${w.unhit_ratio}</span>
            </div>
          </div>
          <div class="issue-actions-stack">
            ${advisorScopeText(w.advisor_count)}
            <button type="button" class="issue-rec-more" onclick="event.stopPropagation();openFactoryIssueRecordingLibrary('weakness', ${i})">
              <span>查看</span>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  };

  const renderSOPStrength = () => {
    const strengthEl = document.getElementById("strength-chart");
    if (!strengthEl) return;
    strengthEl.style.height = 'auto';
    const sortedStrengthData = [...strengthData].sort((a, b) => parseFloat(b.hit_ratio) - parseFloat(a.hit_ratio));
    strengthEl.innerHTML = sortedStrengthData.map((s, i) => {
      const barW = parseFloat(s.hit_ratio);
      const rankContent = i < 3
        ? `<img class="issue-rank-icon" src="../assets/insight-rank-${i + 1}.png" alt="${i + 1}">`
        : `${i + 1}`;
      return `<div class="issue-card strength rank-${i + 1}" role="button" tabindex="0">
        <div class="issue-header issue-header-stacked-actions">
          <div class="issue-rank${i < 3 ? ' has-rank-icon' : ''}">${rankContent}</div>
          <div class="issue-info">
            <div class="issue-title-row"><span class="issue-title">${s.title}</span></div>
            <div class="issue-bar-row">
              <div class="issue-bar-track"><div class="issue-bar-fill" style="width:${barW}%"></div></div>
              <span class="issue-stat">${s.hit_ratio}</span>
            </div>
          </div>
          <div class="issue-actions-stack">
            ${advisorScopeText(s.advisor_count)}
            <button type="button" class="issue-rec-more" onclick="event.stopPropagation();openFactoryIssueRecordingLibrary('strength', ${i})">
              <span>查看</span>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  };

  const renderSOPRisk = () => {
    const riskEl = document.getElementById("risk-chart");
    if (!riskEl) return;
    riskEl.style.height = 'auto';
    const sortedRiskData = [...riskData].sort((a, b) => parseFloat(b.hit_ratio) - parseFloat(a.hit_ratio));
    riskEl.innerHTML = sortedRiskData.map((r, i) => {
      const barW = parseFloat(r.hit_ratio);
      const rankContent = i < 3
        ? `<img class="issue-rank-icon" src="../assets/insight-rank-${i + 1}.png" alt="${i + 1}">`
        : `${i + 1}`;
      return `<div class="issue-card risk rank-${i + 1}" role="button" tabindex="0">
        <div class="issue-header issue-header-stacked-actions">
          <div class="issue-rank${i < 3 ? ' has-rank-icon' : ''}">${rankContent}</div>
          <div class="issue-info">
            <div class="issue-title-row"><span class="issue-title">${r.title}</span></div>
            <div class="issue-bar-row">
              <div class="issue-bar-track"><div class="issue-bar-fill" style="width:${barW}%"></div></div>
              <span class="issue-stat">${r.hit_ratio}</span>
            </div>
          </div>
          <div class="issue-actions-stack">
            ${advisorScopeText(r.advisor_count)}
            <button type="button" class="issue-rec-more" onclick="event.stopPropagation();openFactoryIssueRecordingLibrary('risk', ${i})">
              <span>查看</span>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  };

  // ── renderSOPRankTable：大区 SOP 执行排行 ──────────
  let sopSortKey = 'sopRate';
  let sopSortDesc = true;

  const renderSOPRankTable = () => {
    const wrap = document.getElementById('sop-rank-table-wrap');
    if (!wrap) return;
    const titleEl = document.getElementById('sop-rank-title');

    let rows = [];
    let level = 'region';
    if (currentStore !== 'all') {
      const region = SOP_RANK_DATA.regions.find(r => r.name === currentRegion);
      const zone = region?.zones.find(z => z.name === currentZone);
      rows = (zone?.stores || []).filter(s => s.name === currentStore);
      level = 'store';
      if (titleEl) titleEl.textContent = `${currentZone} · 门店 SOP 详情`;
    } else if (currentZone !== 'all') {
      const region = SOP_RANK_DATA.regions.find(r => r.name === currentRegion);
      const zone = region?.zones.find(z => z.name === currentZone);
      rows = zone?.stores || [];
      level = 'store';
      if (titleEl) titleEl.textContent = `${currentZone} · 门店 SOP 排行`;
    } else if (currentRegion !== 'all') {
      const region = SOP_RANK_DATA.regions.find(r => r.name === currentRegion);
      rows = region?.zones || [];
      level = 'zone';
      if (titleEl) titleEl.textContent = `${currentRegion} · 战区 SOP 排行`;
    } else {
      rows = SOP_RANK_DATA.regions;
      level = 'region';
      if (titleEl) titleEl.textContent = '大区 SOP 执行排行';
    }

    const sorted = [...rows].sort((a, b) => sopSortDesc ? b[sopSortKey] - a[sopSortKey] : a[sopSortKey] - b[sopSortKey]);

    const sopRateColor = r => r >= 80 ? '#059669' : r >= 70 ? '#D97706' : '#DC2626';
    const thBtn = (key, label, align = 'center') => {
      const active = sopSortKey === key;
      const arrow = active ? (sopSortDesc ? ' ↓' : ' ↑') : '';
      return `<th class="sop-rank-th${active ? ' active' : ''}" data-sort="${key}" style="padding:9px 8px;text-align:${align};cursor:pointer;user-select:none;white-space:nowrap;font-size:14px;color:#64748B;border-bottom:1px solid #E2E8F0">${label}${arrow}</th>`;
    };

    const rowHtml = (r, i, isChild = false, isGrandchild = false) => {
      const hasChildren = level === 'region' && r.zones?.length > 0;
      const indent = isGrandchild ? 'padding-left:40px' : isChild ? 'padding-left:20px' : '';
      const trendIcon = r.trend === 'up'
        ? '<span style="color:#22C55E;font-weight:700">↑</span>'
        : '<span style="color:#EF4444;font-weight:700">↓</span>';
      const bgRow = isGrandchild ? 'background:#F8FAFC' : isChild ? 'background:#FAFCFF' : i < 3 ? 'background:rgba(59,130,246,0.03)' : '';
      const rowId = `sop-row-${r.name.replace(/\s/g, '_')}`;
      const expandId = `sop-expand-${r.name.replace(/\s/g, '_')}`;

      return `
        <tr class="${hasChildren ? 'rank-expandable' : ''}" id="${rowId}"
            style="border-bottom:1px solid #F1F5F9;${bgRow};cursor:${hasChildren ? 'pointer' : 'default'}"
            ${hasChildren ? `onclick="window._sopRankToggle('${expandId}', this)"` : ''}>
          <td style="padding:9px 8px;${indent}">
            <span style="display:inline-flex;align-items:center;gap:6px">
              ${!isChild && !isGrandchild ? medalIcon(i) : ''}
              ${hasChildren ? `<svg class="rank-expand-icon" id="icon-${expandId}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" style="transition:transform .2s;flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>` : (isChild ? '<span style="display:inline-block;width:12px"></span>' : '')}
            </span>
          </td>
          <td style="padding:9px 8px;font-weight:${isGrandchild?'400':'600'};color:${isGrandchild?'#475569':'#1E293B'};font-size:14px">${r.name}</td>
          <td style="padding:9px 8px;text-align:center">
            <span style="display:inline-block;padding:2px 9px;border-radius:99px;font-weight:600;font-size:14px;font-family:'Fira Code',monospace;background:${sopRateColor(r.sopRate)}18;color:${sopRateColor(r.sopRate)}">${r.sopRate}%</span>
          </td>
          <td style="padding:9px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:#64748B">${r.weakItems}</td>
          <td style="padding:9px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${r.riskHit>8?'#EF4444':r.riskHit>6?'#F59E0B':'#64748B'}">${r.riskHit}%</td>
          <td style="padding:9px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${r.improvement.startsWith('-')?'#EF4444':'#059669'};font-weight:600">${r.improvement}</td>
          <td style="padding:9px 8px;text-align:center;font-size:14px">${trendIcon}</td>
        </tr>
        ${hasChildren ? `
        <tr id="${expandId}" style="display:none">
          <td colspan="7" style="padding:0">
            <table style="width:100%;border-collapse:collapse">
              ${r.zones.map((z, zi) => {
                const zExpandId = `sop-expand-${z.name.replace(/\s/g, '_')}`;
                const zTrend = z.trend === 'up' ? '<span style="color:#22C55E;font-weight:700">↑</span>' : '<span style="color:#EF4444;font-weight:700">↓</span>';
                return `
                  <tr class="rank-expandable" id="sop-row-${z.name.replace(/\s/g,'_')}"
                      style="border-bottom:1px solid #F1F5F9;background:#FAFCFF;cursor:pointer"
                      onclick="window._sopRankToggle('${zExpandId}', this)">
                    <td style="padding:8px 8px;padding-left:28px">
                      <svg class="rank-expand-icon" id="icon-${zExpandId}" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" style="transition:transform .2s"><polyline points="9 18 15 12 9 6"/></svg>
                    </td>
                    <td style="padding:8px 8px;font-weight:600;color:#334155;font-size:14px">${z.name}</td>
                    <td style="padding:8px 8px;text-align:center">
                      <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-weight:600;font-size:14px;font-family:'Fira Code',monospace;background:${sopRateColor(z.sopRate)}18;color:${sopRateColor(z.sopRate)}">${z.sopRate}%</span>
                    </td>
                    <td style="padding:8px 8px;text-align:center;font-family:'Fira Code',monospace;color:#64748B;font-size:14px">${z.weakItems}</td>
                    <td style="padding:8px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${z.riskHit>8?'#EF4444':z.riskHit>6?'#F59E0B':'#64748B'}">${z.riskHit}%</td>
                    <td style="padding:8px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${z.improvement.startsWith('-')?'#EF4444':'#059669'};font-weight:600">${z.improvement}</td>
                    <td style="padding:8px 8px;text-align:center">${zTrend}</td>
                  </tr>
                  <tr id="${zExpandId}" style="display:none">
                    <td colspan="7" style="padding:0">
                      <table style="width:100%;border-collapse:collapse">
                        ${z.stores.map(s => {
                          const sTrend = s.trend === 'up' ? '<span style="color:#22C55E;font-weight:700">↑</span>' : '<span style="color:#EF4444;font-weight:700">↓</span>';
                          return `
                            <tr style="border-bottom:1px solid #F1F5F9;background:#F8FAFC">
                              <td style="padding:7px 8px;padding-left:52px"></td>
                              <td style="padding:7px 8px;color:#475569;font-size:14px">${s.name}</td>
                              <td style="padding:7px 8px;text-align:center">
                                <span style="display:inline-block;padding:1px 7px;border-radius:99px;font-weight:600;font-size:14px;font-family:'Fira Code',monospace;background:${sopRateColor(s.sopRate)}18;color:${sopRateColor(s.sopRate)}">${s.sopRate}%</span>
                              </td>
                              <td style="padding:7px 8px;text-align:center;font-family:'Fira Code',monospace;color:#94A3B8;font-size:14px">${s.weakItems}</td>
                              <td style="padding:7px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${s.riskHit>8?'#EF4444':s.riskHit>6?'#F59E0B':'#64748B'}">${s.riskHit}%</td>
                              <td style="padding:7px 8px;text-align:center;font-family:'Fira Code',monospace;font-size:14px;color:${s.improvement.startsWith('-')?'#EF4444':'#059669'};font-weight:600">${s.improvement}</td>
                              <td style="padding:7px 8px;text-align:center">${sTrend}</td>
                            </tr>`;
                        }).join('')}
                      </table>
                    </td>
                  </tr>`;
              }).join('')}
            </table>
          </td>
        </tr>` : ''}`;
    };

    wrap.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="color:#64748B;font-size:14px;border-bottom:1px solid #E2E8F0;">
            ${thBtn('', '排名', 'left')}
            ${thBtn('name', '名称', 'left')}
            ${thBtn('sopRate', '质检合格率')}
            ${thBtn('weakItems', '短板项')}
            ${thBtn('riskHit', '风险命中率')}
            ${thBtn('improvement', '环比改善')}
            ${thBtn('trend', '趋势')}
          </tr>
        </thead>
        <tbody>
          ${sorted.map((r, i) => rowHtml(r, i)).join('')}
        </tbody>
      </table>`;

    // 绑定表头排序
    wrap.querySelectorAll('.sop-rank-th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (!key) return;
        if (sopSortKey === key) { sopSortDesc = !sopSortDesc; }
        else { sopSortKey = key; sopSortDesc = true; }
        renderSOPRankTable();
      });
    });
  };

  // SOP 排行展开/收起
  window._sopRankToggle = function(expandId, rowEl) {
    const panel = document.getElementById(expandId);
    const icon = document.getElementById('icon-' + expandId);
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'table-row';
    if (icon) icon.style.transform = isOpen ? '' : 'rotate(90deg)';
    if (rowEl) rowEl.style.background = isOpen ? '' : 'rgba(59,130,246,0.06)';
  };

  // ── renderSOPExecutionTab：SOP执行质检总调度 ───────
  const renderSOPExecutionTab = () => {
    renderSOPDial();
    renderSOPOverviewSummary();
    renderTrendChart();
    setupSOPIssueCloudTabs();
    renderSOPAnalysis();
    renderIssueRuleAnalysis();
  };

  // 保留原线索稽查模拟数据，供后续页面迁移或业务模块复用。
  const CLUE_CHANGE_DATA = {
    totalChanges: 156,
    i60Changes: 89,
    suspicious: 23,
    confirmed: 8,
    trend: [
      { date: '04-15', i60ToOther: 12, otherToOther: 5 },
      { date: '04-16', i60ToOther: 15, otherToOther: 7 },
      { date: '04-17', i60ToOther: 8, otherToOther: 3 },
      { date: '04-18', i60ToOther: 18, otherToOther: 6 },
      { date: '04-19', i60ToOther: 14, otherToOther: 4 },
      { date: '04-20', i60ToOther: 10, otherToOther: 8 },
      { date: '04-21', i60ToOther: 12, otherToOther: 5 }
    ],
    storeRank: [
      { store: '广州白云店', changes: 18, inventory: 'i60库存: 45台' },
      { store: '深圳南山店', changes: 15, inventory: 'i60库存: 38台' },
      { store: '上海浦东店', changes: 12 },
      { store: '成都武侯店', changes: 10 },
      { store: '北京朝阳店', changes: 9 },
      { store: '杭州西湖店', changes: 8 },
      { store: '武汉武昌店', changes: 7 },
      { store: '西安雁塔店', changes: 5 },
      { store: '重庆渝北店', changes: 3 },
      { store: '南京江宁店', changes: 2 }
    ],
    abnormalClues: [
      {
        id: 'CL001',
        customer: '张**',
        phone: '138****5678',
        fromModel: 'i60',
        toModel: 'n60',
        store: '广州白云店',
        consultant: '李明',
        changeTime: '04-21 14:32',
        status: 'suspect',
        reason: '疑似强制变更'
      },
      {
        id: 'CL002',
        customer: '王**',
        phone: '139****1234',
        fromModel: 'i60',
        toModel: 'n60',
        store: '深圳南山店',
        consultant: '张伟',
        changeTime: '04-21 10:15',
        status: 'suspect',
        reason: '客户主动变更'
      },
      {
        id: 'CL003',
        customer: '刘**',
        phone: '136****9012',
        fromModel: 'i60',
        toModel: 'M8',
        store: '上海浦东店',
        consultant: '陈静',
        changeTime: '04-20 16:48',
        status: 'confirmed',
        reason: '已确认违规'
      },
      {
        id: 'CL004',
        customer: '陈**',
        phone: '137****4567',
        fromModel: 'i60',
        toModel: 'n60',
        store: '广州白云店',
        consultant: '李明',
        changeTime: '04-20 11:22',
        status: 'suspect',
        reason: '疑似强制变更'
      },
      {
        id: 'CL005',
        customer: '赵**',
        phone: '135****7890',
        fromModel: 'i60',
        toModel: 'S7',
        store: '成都武侯店',
        consultant: '王强',
        changeTime: '04-19 09:35',
        status: 'confirmed',
        reason: '已确认违规'
      }
    ],
    aiSuggestions: [
      {
        title: '重点稽核广州白云店',
        priority: 'high',
        text: '该店近期变更18条，变更数量最高，建议抽查该店近期录音，核实是否存在强制变更车型的情况。'
      },
      {
        title: '核查深圳南山店顾问张伟',
        priority: 'high',
        text: '该顾问连续多日出现i60→n60变更记录，且变更时间集中在下班前，需核实是否存在为了完成线索转化指标而强制变更的情况。'
      },
      {
        title: '关注高变更顾问',
        priority: 'medium',
        text: '建议增加高变更量门店的稽核频次，防止大规模诱导客户变更车型。'
      }
    ],
    auditLog: [
      { time: '14:32', action: '标记为疑似异常', target: '张** (i60→n60)', status: 'suspect' },
      { time: '11:15', action: '确认为违规', target: '刘** (i60→M8)', status: 'confirmed' },
      { time: '10:22', action: '标记为疑似异常', target: '陈** (i60→n60)', status: 'suspect' },
      { time: '09:35', action: '确认为违规', target: '赵** (i60→S7)', status: 'confirmed' },
      { time: '16:48', action: '标记为疑似异常', target: '刘** (i60→M8)', status: 'suspect' },
      { time: '15:20', action: '澄清为正常变更', target: '周** (i60→n60)', status: 'cleared' },
      { time: '14:05', action: '标记为疑似异常', target: '吴** (i60→n60)', status: 'suspect' },
      { time: '11:30', action: '确认为违规', target: '郑** (i60→n60)', status: 'confirmed' }
    ]
  };

  // ══════════════════════════════════════════════════
  // 全局筛选应用 — 统一调度
  // ══════════════════════════════════════════════════
  const getFactoryScopedRecordings = () => {
    if (!sharedOrganizationDirectory?.recordings) return [];
    return sharedOrganizationDirectory.recordings.filter((recording) => {
      const brandMatch = currentBrand === 'all' || recording.dealer.brand === currentBrand;
      const recordPath = sharedOrganizationDirectory.getRecordPath(recording, factoryOrgDimension, true);
      const organizationMatch = factorySelectedOrgPath === FACTORY_ALL_ORG_VALUE || recordPath.startsWith(factorySelectedOrgPath);
      return brandMatch && organizationMatch;
    });
  };

  const syncFactorySharedKpiCounts = () => {
    if (!sharedOrganizationDirectory) return;
    const records = getFactoryScopedRecordings();
    const invitation = records.filter((_, index) => index % 4 < 2).length;
    const reception = records.filter((_, index) => index % 4 === 2).length;
    const testDrive = records.filter((_, index) => index % 4 === 3).length;
    ALL_KPI_DATA.invitation.num = String(invitation);
    ALL_KPI_DATA.reception.num = String(reception);
    ALL_KPI_DATA.test_drive.num = String(testDrive);
    ALL_KPI_DATA.valid_record.num = String(records.length);
    ALL_KPI_DATA.qa_pass_count.num = String(Math.round(records.length * 0.82));
    ALL_KPI_DATA.risk_record.num = String(Math.round(records.length * 0.06));
    ALL_KPI_DATA.risk_rate.num = records.length ? '6.0' : '0';
  };

  const applyGlobalFilter = () => {
    syncFactorySharedKpiCounts();
    updateFactoryHeroIdentity();
    renderHeroKPI();
    renderSOPExecutionTab();
    renderRankTable();
  };

  // ══════════════════════════════════════════════════
  // 初始渲染
  // ══════════════════════════════════════════════════
  syncFactorySceneTabs();
  syncFactorySharedKpiCounts();
  updateFactoryHeroIdentity();
  renderHeroKPI();
  renderSOPExecutionTab();
  renderRankTable();

  // ── 卡片插画自适应隐藏 ─────────────────────
  const sopMetricCards = document.querySelectorAll('.sop-metric-card');
  if (sopMetricCards.length && typeof ResizeObserver !== 'undefined') {
    const sopCardObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const card = entry.target;
        const image = card.querySelector('.sop-metric-card-image');
        if (!image) continue;
        const cardWidth = card.clientWidth;
        if (cardWidth < 200) {
          image.classList.add('is-hidden');
        } else {
          image.classList.remove('is-hidden');
        }
      }
    });
    sopMetricCards.forEach(card => sopCardObserver.observe(card));
  }

  if (typeof initStickyFilterBars === 'function') {
    initStickyFilterBars();
  }
}
})();
