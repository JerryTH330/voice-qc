/* Shared runtime extracted from index.html for independent menu pages. */

const escapeInsightTop5Html = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// 正式环境的录音 ID 和线索 ID 均为 19 位纯数字。假数据始终按字符串生成，
// 避免超过 JavaScript 安全整数范围后出现末位精度丢失。
const buildMockRecordingId = (sequence = 0) => `2087346${String(17925713920 + Number(sequence || 0)).padStart(12, '0')}`;
const buildMockLeadId = (sequence = 0) => `2087208${String(482066334067 + Number(sequence || 0)).padStart(12, '0')}`;
const normalizeMockRecordingId = (value) => {
  const safeValue = String(value || '').trim();
  const legacyMatch = safeValue.match(/^R-(\d+)$/i);
  return legacyMatch ? buildMockRecordingId(700000 + Number(legacyMatch[1])) : safeValue;
};

function renderSharedInsightTop5Rank(index, options = {}) {
  const {
    baseClass = 'issue-rank',
    iconClass = 'issue-rank-icon'
  } = options;
  const rank = index + 1;
  if (rank <= 3) {
    return `<div class="${baseClass} has-rank-icon"><img class="${iconClass}" src="../assets/insight-rank-${rank}.png" alt="${rank}"></div>`;
  }
  return `<div class="${baseClass}">${rank}</div>`;
}

function renderSharedInsightTop5Cards(items, options = {}) {
  const {
    cardTag = 'div',
    baseCardClass = 'issue-card',
    getCardClassSuffix = () => '',
    getCardAttrs = () => '',
    headerClass = 'issue-header issue-header-stacked-actions',
    rankClass = 'issue-rank',
    rankIconClass = 'issue-rank-icon',
    infoClass = 'issue-info',
    titleRowClass = 'issue-title-row',
    titleClass = 'issue-title',
    barRowClass = 'issue-bar-row',
    barTrackClass = 'issue-bar-track',
    barFillClass = 'issue-bar-fill',
    statClass = 'issue-stat',
    actionStackClass = 'issue-actions-stack',
    valueAttrName = 'data-issue-target',
    getTitle = (item) => item?.title || '',
    getValue = (item) => item?.score || 0,
    getRankIndex = (_item, index) => index,
    getScopeHtml = () => '',
    getActionHtml = () => ''
  } = options;

  return items.map((item, index) => {
    const suffix = String(getCardClassSuffix(item, index) || '').trim();
    const className = `${baseCardClass}${suffix ? ` ${suffix}` : ''}`;
    const attrs = String(getCardAttrs(item, index) || '').trim();
    const tagAttrs = attrs ? ` ${attrs}` : '';
    const value = getValue(item, index);
    const title = escapeInsightTop5Html(String(getTitle(item, index) || ''));
    const scopeHtml = getScopeHtml(item, index) || '';
    const actionHtml = getActionHtml(item, index) || '';

    return `<${cardTag} class="${className}"${tagAttrs}>
      <div class="${headerClass}">
        ${renderSharedInsightTop5Rank(getRankIndex(item, index), { baseClass: rankClass, iconClass: rankIconClass })}
        <div class="${infoClass}">
          <div class="${titleRowClass}"><span class="${titleClass}">${title}</span></div>
          <div class="${barRowClass}">
            <div class="${barTrackClass}"><div class="${barFillClass}" ${valueAttrName}="${value}" style="width:0%"></div></div>
            <span class="${statClass}" ${valueAttrName}="${value}">0%</span>
          </div>
        </div>
        <div class="${actionStackClass}">
          ${scopeHtml}
          ${actionHtml}
        </div>
      </div>
    </${cardTag}>`;
  }).join('');
}

function initStickyFilterBars() {
  const bars = document.querySelectorAll('.global-filter-bar.session-filter-card, .sales-role-nav');
  bars.forEach((bar) => {
    if (bar.dataset.stickyInit === 'true') return;
    bar.dataset.stickyInit = 'true';

    const host = bar.parentNode;
    host.classList.add('sticky-sentinel-host');
    const sentinelTop = bar.offsetTop;
    const sentinel = document.createElement('div');
    sentinel.className = 'sticky-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;height:1px;width:1px;left:0;visibility:hidden;pointer-events:none;';
    sentinel.style.top = `${sentinelTop}px`;
    host.insertBefore(sentinel, bar);

    const root = bar.closest('.main');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        bar.classList.toggle('is-stuck', !entry.isIntersecting);
      });
    }, { root, threshold: 0, rootMargin: '-24px 0px 0px 0px' });

    observer.observe(sentinel);
  });
}

function initUnifiedMetricTooltips() {
  const root = document.documentElement;
  if (root.dataset.metricTooltipInit === 'true') return;
  root.dataset.metricTooltipInit = 'true';
  root.classList.add('dashboard-metric-tooltip-ready');

  const tooltip = document.createElement('div');
  tooltip.id = 'dashboard-metric-tooltip';
  tooltip.className = 'dashboard-metric-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltip);

  let activeButton = null;

  const getTooltipButton = (target) => {
    if (!(target instanceof Element)) return null;
    const button = target.closest('.metric-def-btn, .hm-help');
    if (!button) return null;
    const source = button.querySelector('.metric-def-tooltip');
    return source?.textContent?.trim() ? button : null;
  };

  const hideTooltip = () => {
    if (activeButton?.getAttribute('aria-describedby') === tooltip.id) {
      activeButton.removeAttribute('aria-describedby');
    }
    activeButton = null;
    tooltip.classList.remove('show');
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.style.visibility = 'hidden';
  };

  const showTooltip = (button) => {
    const source = button.querySelector('.metric-def-tooltip');
    const description = source?.textContent?.trim();
    if (!description) return;

    activeButton = button;
    tooltip.textContent = description;
    tooltip.classList.remove('show');
    tooltip.style.visibility = 'hidden';
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.dataset.placement = 'bottom';

    const rect = button.getBoundingClientRect();
    const gap = 8;
    const edge = 8;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const maxLeft = Math.max(edge, window.innerWidth - tooltipWidth - edge);
    const left = Math.min(Math.max(rect.left + rect.width / 2 - tooltipWidth / 2, edge), maxLeft);
    const fitsBelow = rect.bottom + gap + tooltipHeight <= window.innerHeight - edge;
    const placement = fitsBelow ? 'bottom' : 'top';
    const preferredTop = placement === 'bottom'
      ? rect.bottom + gap
      : rect.top - gap - tooltipHeight;
    const top = Math.min(
      Math.max(preferredTop, edge),
      Math.max(edge, window.innerHeight - tooltipHeight - edge)
    );
    const arrowLeft = Math.min(
      Math.max(rect.left + rect.width / 2 - left - 4, 8),
      Math.max(8, tooltipWidth - 16)
    );

    tooltip.dataset.placement = placement;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.setProperty('--metric-tooltip-arrow-left', `${arrowLeft}px`);
    tooltip.style.visibility = 'visible';
    button.setAttribute('aria-describedby', tooltip.id);
    tooltip.getBoundingClientRect();
    tooltip.classList.add('show');
  };

  document.addEventListener('pointerover', (event) => {
    const button = getTooltipButton(event.target);
    if (!button || (event.relatedTarget && button.contains(event.relatedTarget))) return;
    showTooltip(button);
  });

  document.addEventListener('pointerout', (event) => {
    const button = getTooltipButton(event.target);
    if (!button || button !== activeButton) return;
    if (event.relatedTarget && button.contains(event.relatedTarget)) return;
    hideTooltip();
  });

  document.addEventListener('focusin', (event) => {
    const button = getTooltipButton(event.target);
    if (button) showTooltip(button);
  });

  document.addEventListener('focusout', (event) => {
    const button = getTooltipButton(event.target);
    if (!button || button !== activeButton) return;
    if (event.relatedTarget && button.contains(event.relatedTarget)) return;
    hideTooltip();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideTooltip();
  });
  window.addEventListener('scroll', hideTooltip, true);
  window.addEventListener('resize', hideTooltip);
}

initUnifiedMetricTooltips();

function getCompactIssueRulePaginationPages(pageCount, currentPage) {
  if (pageCount <= 3) return new Set(Array.from({ length: pageCount }, (_, index) => index + 1));
  const startPage = Math.min(Math.max(currentPage - 1, 1), pageCount - 2);
  return new Set([startPage, startPage + 1, startPage + 2]);
}

function renderUnifiedIssueRulePagination({ totalItems, currentPage, pageCount, pageSize }) {
  const compactPages = getCompactIssueRulePaginationPages(pageCount, currentPage);
  return `
    <div class="issue-rule-footer issue-rule-pagination session-pagination">
      <div class="dashboard-pagination">
        <span class="session-pagination-total">共 ${totalItems} 条</span>
        <div class="dashboard-pagination-controls">
          <span class="issue-pagination-page-size">${pageSize} 条/页</span>
          <div class="page-group" aria-label="规则分页">
            <button type="button" class="issue-rule-page-btn page-arrow" data-unified-rule-page-action="prev" aria-label="上一页" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: pageCount }, (_, index) => index + 1).map(page => `
              <button type="button" class="issue-rule-page-number page-num${page === currentPage ? ' active' : ''}${compactPages.has(page) ? ' is-compact-visible' : ''}" data-unified-rule-page-number="${page}" aria-label="第 ${page} 页" ${page === currentPage ? 'aria-current="page"' : ''}>${page}</button>
            `).join('')}
            <button type="button" class="issue-rule-page-btn page-arrow" data-unified-rule-page-action="next" aria-label="下一页" ${currentPage >= pageCount ? 'disabled' : ''}>›</button>
          </div>
          <label class="page-jump-group">
            <span class="session-page-jump-label">前往</span>
            <span class="page-select page-jump-select">
              <input type="number" min="1" max="${pageCount}" value="${currentPage}" data-unified-rule-page-jump aria-label="前往页码">
            </span>
            <span class="session-page-jump-suffix">页</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function bindUnifiedIssueRulePagination(root, { currentPage, pageCount, onPageChange }) {
  if (!root) return;
  const changePage = (requestedPage) => {
    const parsedPage = Number(requestedPage);
    const targetPage = Math.max(1, Math.min(pageCount, Number.isFinite(parsedPage) ? Math.round(parsedPage) : currentPage));
    if (targetPage === currentPage) {
      const jumpInput = root.querySelector('[data-unified-rule-page-jump]');
      if (jumpInput) jumpInput.value = String(targetPage);
      return;
    }
    onPageChange(targetPage);
  };

  root.querySelectorAll('[data-unified-rule-page-action]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      changePage(currentPage + (button.dataset.unifiedRulePageAction === 'next' ? 1 : -1));
    });
  });
  root.querySelectorAll('[data-unified-rule-page-number]').forEach(button => {
    button.addEventListener('click', () => changePage(button.dataset.unifiedRulePageNumber));
  });
  const jumpInput = root.querySelector('[data-unified-rule-page-jump]');
  jumpInput?.addEventListener('change', () => changePage(jumpInput.value));
  jumpInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    changePage(jumpInput.value);
  });
}

function initStoreDashboardPage() {
  const FILTER_UTILS = window.__dashboardFilterUtils;
  const {
    SOURCE_KEYS,
    SCENE_KEYS,
    getAllowedScenes,
    getSceneLabel,
    normalizeSceneSelection,
    setSourceSelection,
    toggleSceneSelection,
    getLegacySceneBucket,
    getInvitationSceneCount,
    getSceneVolumeLabel,
    getBusinessMetricKeysForSelection,
    getRecordingSourceVisibility
  } = FILTER_UTILS;

// ── 0. 录音数据库 & 播放器 ──────────────────────
  const RECORDING_DB = {
    'R-0312': {
      advisor: '林涛', customer: '张先生', time: '3-25 15:20', duration: 1080,
      scene: '门店接待-首次看车', qaScore: 64, model: '传祺 E9',
      highlights: [
        { at: 180, label: '竞品对比缺失', type: 'weakness' },
        { at: 540, label: '过度承诺交车', type: 'risk' },
        { at: 720, label: '客户异议未处理', type: 'weakness' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '张先生您好，欢迎来到店里，我是您的销售顾问林涛。' },
        { ts: '0:15', speaker: 'customer', text: '你好，我想看一下 E9，之前在网上了解过一些。' },
        { ts: '0:28', speaker: 'advisor', text: '好的，E9 是我们的旗舰新能源 MPV，配置非常高。您主要是家用还是商务用途呢？' },
        { ts: '0:45', speaker: 'customer', text: '主要商务接待用，偶尔也会家用。我之前看过别克 GL8 和腾势 D9。' },
        { ts: '1:05', speaker: 'advisor', text: '嗯，那两款也不错。我们的 E9 空间也很大的。', flag: 'weakness', flagLabel: '竞品对比缺失', flagNote: '客户主动提起竞品，但顾问未进行针对性差异化对比' },
        { ts: '3:00', speaker: 'advisor', text: '您看中的这款，我们可以给您最优惠的价格。' },
        { ts: '3:15', speaker: 'customer', text: '最快什么时候能提车？白色有现车吗？' },
        { ts: '3:30', speaker: 'advisor', text: '白色的话，我跟您保证一周之内肯定能提到。', flag: 'risk', flagLabel: '过度承诺交车', flagNote: '口头承诺具体交车时间，违反销售红线' },
        { ts: '5:00', speaker: 'customer', text: '价格方面能再优惠点吗？感觉比 GL8 贵了不少。' },
        { ts: '5:15', speaker: 'advisor', text: '这个价格已经是底价了，没什么空间了。', flag: 'weakness', flagLabel: '异议处理不当', flagNote: '面对价格异议直接拒绝，未用价值拆解法处理' },
        { ts: '8:00', speaker: 'customer', text: '好吧，我再考虑考虑。' },
        { ts: '8:10', speaker: 'advisor', text: '好的张先生，有什么问题随时联系我。' }
      ]
    },
    'R-0308': {
      advisor: '张华', customer: '李女士', time: '3-25 11:05', duration: 720,
      scene: '电话邀约', qaScore: 85, model: '传祺 GS8',
      highlights: [
        { at: 120, label: '需求确认充分', type: 'strength' },
        { at: 360, label: '竞品对比弱', type: 'weakness' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '李女士您好，我是广汽传祺的张华，之前您在线上留了试驾信息。' },
        { ts: '0:12', speaker: 'customer', text: '对，我对 GS8 比较感兴趣，想了解一下。' },
        { ts: '0:25', speaker: 'advisor', text: '好的！请问您主要是什么用途呢？家里几口人？', flag: 'strength', flagLabel: '需求确认充分', flagNote: '开场即切入需求探询，符合SOP' },
        { ts: '2:00', speaker: 'customer', text: '四口之家，两个孩子。主要周末出去玩用，平时我通勤也开。' },
        { ts: '2:15', speaker: 'advisor', text: '那 GS8 特别适合您，七座空间很灵活，第三排也不勉强。' },
        { ts: '4:00', speaker: 'customer', text: '汉兰达怎么样？我老公说汉兰达保值。' },
        { ts: '4:15', speaker: 'advisor', text: '汉兰达确实也不错，不过我觉得 GS8 配置比它高不少。', flag: 'weakness', flagLabel: '竞品对比弱', flagNote: '未提供具体差异化数据，对比力度不够' },
        { ts: '6:00', speaker: 'advisor', text: '您看这周六方便过来看看实车吗？我帮您安排一次试驾。' },
        { ts: '6:15', speaker: 'customer', text: '周六下午应该可以，我和老公一起过来。' },
        { ts: '6:30', speaker: 'advisor', text: '太好了！我帮您预约周六下午两点，到时候我亲自接待您。' }
      ]
    },
    'R-0310': {
      advisor: '林涛', customer: '赵先生', time: '3-25 14:00', duration: 960,
      scene: '试乘试驾', qaScore: 58, model: '传祺 M8',
      highlights: [
        { at: 60, label: '试驾邀约缺失', type: 'weakness' },
        { at: 480, label: '贬低竞品', type: 'risk' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '赵先生，试驾体验感觉怎么样？' },
        { ts: '0:10', speaker: 'customer', text: '还行，空间是挺大的。不过隔壁丰田那个 GL8 我也想试试。' },
        { ts: '0:25', speaker: 'advisor', text: '其实不用去了，GL8 那个空间跟我们没法比。', flag: 'risk', flagLabel: '贬低竞品', flagNote: '直接贬低竞品，可能引起客户反感' },
        { ts: '1:00', speaker: 'customer', text: '你说的有道理吗？我看网上评价 GL8 口碑挺好的。' },
        { ts: '1:15', speaker: 'advisor', text: '网上评价不一定准的。我们 M8 性价比高很多，您放心。', flag: 'weakness', flagLabel: '异议处理不当', flagNote: '否定客户信息来源，未正面回应竞品优势' },
        { ts: '5:00', speaker: 'customer', text: '我再看看吧，回去跟家里人商量一下。' },
        { ts: '5:10', speaker: 'advisor', text: '好的好的，您有空再来。有什么问题打我电话。', flag: 'weakness', flagLabel: '试驾邀约缺失', flagNote: '客户离店时未二次邀约，也未提供限时权益' }
      ]
    },
    'R-0314': {
      advisor: '林涛', customer: '钱女士', time: '3-25 16:20', duration: 840,
      scene: '议价谈判', qaScore: 55, model: '传祺 E9',
      highlights: [
        { at: 300, label: '过度承诺交车', type: 'risk' },
        { at: 600, label: '过度承诺价格', type: 'risk' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '钱女士，您之前看的那台白色 E9 现在搞活动，非常划算。' },
        { ts: '0:20', speaker: 'customer', text: '优惠多少？如果合适我这周就定了。' },
        { ts: '0:35', speaker: 'advisor', text: '我跟领导申请一下，应该能给您最低价。' },
        { ts: '3:00', speaker: 'customer', text: '那提车呢？我希望月底之前能拿到。' },
        { ts: '3:15', speaker: 'advisor', text: '月底肯定没问题，我亲自给您盯着。', flag: 'risk', flagLabel: '过度承诺交车', flagNote: '再次口头承诺具体交车时间，属于重复违规' },
        { ts: '5:00', speaker: 'customer', text: '那能再便宜五千吗？隔壁店说可以更低。' },
        { ts: '5:15', speaker: 'advisor', text: '您说的那个价格，我这边也可以做到。', flag: 'risk', flagLabel: '过度承诺价格', flagNote: '突破授权底价承诺，可能超出门店授权范围' },
        { ts: '8:00', speaker: 'customer', text: '好，那我回去再想想。' },
        { ts: '8:10', speaker: 'advisor', text: '好的，您尽快决定，这个优惠力度不常有。' }
      ]
    },
    'R-0401': {
      advisor: '李昱', customer: '王先生', time: '3-25 10:30', duration: 1320,
      scene: '门店接待-二次到店', qaScore: 95, model: '传祺 M8',
      highlights: [
        { at: 120, label: '深度需求挖掘', type: 'strength' },
        { at: 480, label: '竞品差异化对比', type: 'strength' },
        { at: 840, label: '试驾邀约到位', type: 'strength' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '王先生，欢迎再次来到店里！上次您提到家里添了二宝，最近考虑得怎么样了？' },
        { ts: '0:18', speaker: 'customer', text: '是的，现在这辆车坐不下了，必须得换一台大的。' },
        { ts: '0:30', speaker: 'advisor', text: '理解！出行人数和行李空间确实是核心需求。那日常主要谁开？一般跑什么路况？', flag: 'strength', flagLabel: '深度需求挖掘', flagNote: '紧扣家庭场景，连续追问细分需求' },
        { ts: '2:00', speaker: 'advisor', text: '您上次提到对比了汉兰达。从空间来看，M8第三排腿部空间多了12cm，而且座椅放倒后纯平，自驾游装行李特别方便。' },
        { ts: '2:30', speaker: 'customer', text: '这个确实重要，汉兰达第三排我老婆坐着说不舒服。' },
        { ts: '3:00', speaker: 'advisor', text: '对，而且 M8 的零重力座椅是独有的，长途开两三个小时不累。我拉一张配置对比表给您看。', flag: 'strength', flagLabel: '竞品差异化对比', flagNote: '有数据、有场景、有量化对比，话术教科书级别' },
        { ts: '8:00', speaker: 'advisor', text: '这样，今天正好有试驾车，我建议您把嫂子和孩子一起请上车，直接走一圈体验一下实际乘坐感受。' },
        { ts: '8:15', speaker: 'customer', text: '行啊！正好一家人都在。' },
        { ts: '8:30', speaker: 'advisor', text: '太好了！我提前把儿童座椅给您安上，路线走城区+高速综合体验。', flag: 'strength', flagLabel: '试驾邀约到位', flagNote: '考虑家庭试驾细节（儿童座椅），非常周到' }
      ]
    },
    'R-0313': {
      advisor: '李昱', customer: '吴先生', time: '3-25 16:10', duration: 900,
      scene: '议价谈判', qaScore: 91, model: '传祺 M8',
      highlights: [
        { at: 240, label: '金融方案引导', type: 'strength' },
        { at: 600, label: '促单节奏好', type: 'strength' }
      ],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '吴先生，试驾体验您之前反馈很满意，今天咱们聊聊方案？' },
        { ts: '0:15', speaker: 'customer', text: '主要还是价格，能不能再便宜一些？落地价我心理预算在25万以内。' },
        { ts: '0:30', speaker: 'advisor', text: '理解。25万落地，我帮您算两种方案对比看看。' },
        { ts: '2:00', speaker: 'advisor', text: '方案一全款，方案二走两年免息，月供3200。免息方案算下来年均持有成本更低，而且首付压力小很多。', flag: 'strength', flagLabel: '金融方案引导', flagNote: '主动用金融方案降低价格感知，符合策略' },
        { ts: '4:00', speaker: 'customer', text: '免息方案确实划算，但还是想再便宜两千。' },
        { ts: '4:15', speaker: 'advisor', text: '这样，今天定下来的话，我再帮您申请一个增值礼包，包含三次保养和脚垫全车膜。算下来价值三千多，比直接让两千划算。' },
        { ts: '5:00', speaker: 'advisor', text: '而且这个月底是活动截止日，过了这周礼包就申请不到了。', flag: 'strength', flagLabel: '促单节奏好', flagNote: '用附加价值替代直接降价，加时间限制促单' },
        { ts: '5:30', speaker: 'customer', text: '那行吧，今天就定了。帮我走免息方案。' }
      ]
    },
    'R-0295': {
      advisor: '王萌', customer: '周先生', time: '3-24 16:40', duration: 660,
      scene: '电话邀约', qaScore: 78, model: '传祺 E9',
      highlights: [{ at: 120, label: '需求确认', type: 'strength' }, { at: 420, label: '邀约话术弱', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '周先生您好，我是传祺的王萌，之前您咨询过 E9 的信息。' },
        { ts: '0:15', speaker: 'customer', text: '对，我在比较几款新能源 MPV。' },
        { ts: '0:30', speaker: 'advisor', text: '请问您主要看重哪些方面呢？是空间、续航还是价格？', flag: 'strength', flagLabel: '需求确认', flagNote: '主动探询核心需求' },
        { ts: '2:00', speaker: 'customer', text: '主要看政策补贴和续航，比亚迪那边政策力度蛮大的。' },
        { ts: '2:15', speaker: 'advisor', text: '我们 E9 也享受同等的新能源补贴和免购置税政策哦。' },
        { ts: '5:00', speaker: 'advisor', text: '您方便来店里看看实车吗？随时欢迎。', flag: 'weakness', flagLabel: '邀约话术弱', flagNote: '邀约缺乏紧迫感和具体利益点' },
        { ts: '5:15', speaker: 'customer', text: '再看看吧，有空过来。' }
      ]
    },
    'R-0289': {
      advisor: '赵强', customer: '陈先生', time: '3-24 10:15', duration: 900,
      scene: '门店接待-首次到店', qaScore: 72, model: '传祺 GS8',
      highlights: [{ at: 180, label: '竞品应对不足', type: 'weakness' }, { at: 540, label: '试驾邀约', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '陈先生您好，欢迎光临。我是赵强。' },
        { ts: '0:12', speaker: 'customer', text: '我想看看 GS8，跟汉兰达比怎么样？' },
        { ts: '0:25', speaker: 'advisor', text: 'GS8 配置比汉兰达高很多的。', flag: 'weakness', flagLabel: '竞品应对不足', flagNote: '仅做笼统对比，缺乏具体数据支撑' },
        { ts: '3:00', speaker: 'customer', text: '具体高在哪里呢？能详细说说吗？' },
        { ts: '3:15', speaker: 'advisor', text: '比如安全配置方面，我们标配了全速域ACC和车道保持。您要不试驾感受一下？' },
        { ts: '5:00', speaker: 'advisor', text: '正好今天有试驾车，我帮您安排一次好吗？', flag: 'strength', flagLabel: '试驾邀约', flagNote: '主动邀约试驾' },
        { ts: '5:15', speaker: 'customer', text: '好的，那就试试吧。' }
      ]
    },
    'R-0280': {
      advisor: '赵强', customer: '孙女士', time: '3-23 11:20', duration: 720,
      scene: '门店接待-二次到店', qaScore: 80, model: '传祺 M8',
      highlights: [{ at: 240, label: '需求跟进好', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '孙女士，欢迎再次来到店里！上次您看的 M8 白色还有意向吗？' },
        { ts: '0:18', speaker: 'customer', text: '还在考虑，主要跟别克 GL8 在对比。' },
        { ts: '0:35', speaker: 'advisor', text: '理解。上次您提到家里两个孩子，其实 M8 的三排座椅在舒适度上有很大优势。', flag: 'strength', flagLabel: '需求跟进好', flagNote: '记住客户需求并跟进' },
        { ts: '2:00', speaker: 'customer', text: '是的，上次坐过确实不错。' },
        { ts: '4:00', speaker: 'advisor', text: '今天我们有一个特别的活动价，截止到这周末。' },
        { ts: '4:15', speaker: 'customer', text: '好的，我考虑一下。' }
      ]
    },
    'R-0293': {
      advisor: '王萌', customer: '杨先生', time: '3-24 15:30', duration: 840,
      scene: '门店接待-首次到店', qaScore: 82, model: '传祺 M8',
      highlights: [{ at: 120, label: '产品知识扎实', type: 'strength' }, { at: 480, label: '竞品对比到位', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '杨先生您好，我是王萌，听说您对我们的 M8 感兴趣？' },
        { ts: '0:15', speaker: 'customer', text: '对，朋友推荐的。我主要想了解质量和做工方面。' },
        { ts: '0:30', speaker: 'advisor', text: '我先带您近距离看看内饰用料。您摸一下这个门板皮质，这是真皮缝线的。', flag: 'strength', flagLabel: '产品知识扎实', flagNote: '用感官体验带入产品品质' },
        { ts: '2:00', speaker: 'customer', text: '做工确实不错。比亚迪唐那边怎么样？' },
        { ts: '2:15', speaker: 'advisor', text: '唐DM-i定位不同。论做工细节和驾乘质感，我建议您两家都摸一摸对比一下。我们在缝线工艺和隔音用料上投入更多。', flag: 'strength', flagLabel: '竞品对比到位', flagNote: '引导实车对比，不贬低竞品' },
        { ts: '5:00', speaker: 'customer', text: '有道理，那价格方面呢？' },
        { ts: '5:15', speaker: 'advisor', text: '我帮您做一个详细的配置价格对比表，您带回去慢慢看。' }
      ]
    },
    'R-0306': {
      advisor: '林涛', customer: '吴女士', time: '3-25 10:45', duration: 600,
      scene: '电话邀约', qaScore: 68, model: '传祺 M8',
      highlights: [{ at: 180, label: '邀约急促', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '吴女士您好，我是林涛，之前您来看过 M8。' },
        { ts: '0:12', speaker: 'customer', text: '对对，还在考虑中。' },
        { ts: '0:25', speaker: 'advisor', text: '最近我们有个活动力度蛮大的，您赶紧来定吧。', flag: 'weakness', flagLabel: '邀约急促', flagNote: '没有确认客户需求变化就直接催单' },
        { ts: '1:00', speaker: 'customer', text: '什么活动？能先说一下吗？' },
        { ts: '1:15', speaker: 'advisor', text: '到店了我跟您详细说，电话里不太方便。' },
        { ts: '2:00', speaker: 'customer', text: '那我看看吧，有空过来。' }
      ]
    },
    'R-0291': {
      advisor: '王萌', customer: '马女士', time: '3-24 14:20', duration: 780,
      scene: '议价谈判', qaScore: 76, model: '传祺 E9',
      highlights: [{ at: 300, label: '价格解释清晰', type: 'strength' }, { at: 540, label: '促单时机差', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '马女士，上次看完之后考虑得怎么样了？' },
        { ts: '0:15', speaker: 'customer', text: '价格还是觉得偏高，能不能再谈谈？' },
        { ts: '0:30', speaker: 'advisor', text: '我理解您的顾虑。我把配置拆开给您算一下，标配的这些配置单独买要加多少钱。', flag: 'strength', flagLabel: '价格解释清晰', flagNote: '用配置拆解法应对价格异议' },
        { ts: '3:00', speaker: 'customer', text: '这么算的话确实划算不少。' },
        { ts: '5:00', speaker: 'advisor', text: '嗯嗯，您再考虑考虑吧。', flag: 'weakness', flagLabel: '促单时机差', flagNote: '客户已认可价值时未及时促单' }
      ]
    },
    'R-0278': {
      advisor: '赵强', customer: '韩先生', time: '3-23 09:30', duration: 720,
      scene: '门店接待-首次到店', qaScore: 70, model: '传祺 GS8',
      highlights: [{ at: 360, label: '异议处理弱', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '韩先生您好，欢迎光临。' },
        { ts: '0:10', speaker: 'customer', text: '想看看GS8，价格什么区间？' },
        { ts: '0:25', speaker: 'advisor', text: '目前优惠后15到20万区间，看您选哪个配置。' },
        { ts: '3:00', speaker: 'customer', text: '这个价格比汉兰达贵了不少啊。' },
        { ts: '3:15', speaker: 'advisor', text: '嗯...价格是稍微高一点，但配置不一样的。', flag: 'weakness', flagLabel: '异议处理弱', flagNote: '先承认贵再解释，容易强化客户价格敏感' },
        { ts: '5:00', speaker: 'customer', text: '好吧，我再看看。' }
      ]
    },
    'R-0309': {
      advisor: '林涛', customer: '黄先生', time: '3-25 13:30', duration: 900,
      scene: '门店接待-试驾后', qaScore: 62, model: '传祺 E9',
      highlights: [{ at: 120, label: '需求确认不足', type: 'weakness' }, { at: 540, label: '急于报价', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '黄先生，试驾感觉怎么样？' },
        { ts: '0:10', speaker: 'customer', text: '动力不错，就是不知道性价比怎么样。' },
        { ts: '0:25', speaker: 'advisor', text: '性价比肯定高。现在有活动优惠两万。', flag: 'weakness', flagLabel: '需求确认不足', flagNote: '未深入探询需求就急于报价' },
        { ts: '3:00', speaker: 'customer', text: '两万优惠具体怎么算？' },
        { ts: '3:15', speaker: 'advisor', text: '现金优惠一万五，再加五千的装潢礼包。现在定就这个价。', flag: 'weakness', flagLabel: '急于报价', flagNote: '未建立足够产品价值就急于谈价格' },
        { ts: '5:00', speaker: 'customer', text: '我再对比对比，回去商量一下。' },
        { ts: '5:10', speaker: 'advisor', text: '好的，有问题联系我。' }
      ]
    },
    'R-0287': {
      advisor: '张华', customer: '朱先生', time: '3-24 09:50', duration: 660,
      scene: '电话邀约', qaScore: 83, model: '传祺 E8',
      highlights: [{ at: 180, label: '痛点挖掘好', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '朱先生您好，我是张华。上次您提到对 E8 比较感兴趣。' },
        { ts: '0:12', speaker: 'customer', text: '是的，一直在看新能源，主要考虑省油。' },
        { ts: '0:30', speaker: 'advisor', text: '理解！那您日常通勤多少公里？家里有没有充电条件？', flag: 'strength', flagLabel: '痛点挖掘好', flagNote: '围绕油耗痛点深入展开' },
        { ts: '2:00', speaker: 'customer', text: '单程15公里左右，小区有充电桩。' },
        { ts: '2:15', speaker: 'advisor', text: '太适合了，E8 纯电续航就能覆盖您一周通勤，基本不花油钱。' },
        { ts: '4:00', speaker: 'advisor', text: '这周末方便来店里看看实车吗？我帮您算一下一年能省多少油费。' },
        { ts: '4:15', speaker: 'customer', text: '好的，周末我过来。' }
      ]
    },
    'R-0305': {
      advisor: '林涛', customer: '田先生', time: '3-25 09:20', duration: 540,
      scene: '电话邀约', qaScore: 58, model: '传祺 GS8',
      highlights: [{ at: 120, label: '缺乏差异化', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '田先生您好，我是林涛，之前您来看过GS8。' },
        { ts: '0:10', speaker: 'customer', text: '对，还在犹豫。汉兰达那边也在谈。' },
        { ts: '0:25', speaker: 'advisor', text: '哦，汉兰达也不错。但我们GS8也挺好的，配置更高。', flag: 'weakness', flagLabel: '缺乏差异化', flagNote: '面对竞品没有提供具体差异化卖点' },
        { ts: '1:00', speaker: 'customer', text: '具体高在哪？' },
        { ts: '1:15', speaker: 'advisor', text: '呃...安全配置什么的都会更好一些。' },
        { ts: '2:00', speaker: 'customer', text: '行，我再考虑考虑。' }
      ]
    },
    'R-0292': {
      advisor: '赵强', customer: '沈先生', time: '3-24 15:10', duration: 780,
      scene: '议价谈判', qaScore: 65, model: '传祺 M8',
      highlights: [{ at: 300, label: '过度承诺', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '沈先生，之前的方案您考虑得怎么样？' },
        { ts: '0:15', speaker: 'customer', text: '还想再优惠一些，预算确实有限。' },
        { ts: '0:30', speaker: 'advisor', text: '我再去跟领导申请一下。' },
        { ts: '3:00', speaker: 'customer', text: '什么时候能提车？急用。' },
        { ts: '3:15', speaker: 'advisor', text: '下周三之前肯定给您准备好。', flag: 'risk', flagLabel: '过度承诺', flagNote: '口头承诺具体提车时间' },
        { ts: '5:00', speaker: 'customer', text: '好吧，那我再想想。' }
      ]
    },
    'R-0290': {
      advisor: '王萌', customer: '何女士', time: '3-24 11:30', duration: 840,
      scene: '门店接待-首次到店', qaScore: 74, model: '传祺 E9',
      highlights: [{ at: 360, label: '优惠方案超授权', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '何女士您好，我是王萌。您今天想看哪款车？' },
        { ts: '0:12', speaker: 'customer', text: 'E9，看看价格合不合适。' },
        { ts: '0:25', speaker: 'advisor', text: '好的，E9 目前有促销活动。' },
        { ts: '3:00', speaker: 'customer', text: '邻居在隔壁城市买的便宜三千。' },
        { ts: '3:15', speaker: 'advisor', text: '那个价格我们也可以做，我帮您申请。', flag: 'risk', flagLabel: '优惠方案超授权', flagNote: '未经确认就承诺匹配竞店价格' },
        { ts: '5:00', speaker: 'customer', text: '那帮我算算总价。' }
      ]
    },
    'R-0311': {
      advisor: '林涛', customer: '袁先生', time: '3-25 14:50', duration: 660,
      scene: '门店接待-首次到店', qaScore: 60, model: '传祺 GS8',
      highlights: [{ at: 240, label: '贬低竞品', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '袁先生，看上我们哪款了？' },
        { ts: '0:10', speaker: 'customer', text: 'GS8，但朋友说CR-V更省油，在犹豫。' },
        { ts: '0:25', speaker: 'advisor', text: 'CR-V 那种小车怎么比？完全不是一个级别。' },
        { ts: '2:00', speaker: 'advisor', text: '我们GS8是中大型SUV，空间和档次要高太多了。', flag: 'risk', flagLabel: '贬低竞品', flagNote: '直接贬低竞品并夸大差异' },
        { ts: '4:00', speaker: 'customer', text: '好吧，那我看看。' }
      ]
    },
    'R-0282': {
      advisor: '赵强', customer: '丁先生', time: '3-23 16:00', duration: 720,
      scene: '议价谈判', qaScore: 67, model: '传祺 M8',
      highlights: [{ at: 360, label: '强制加装', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '丁先生，这个价格真的已经很优惠了。' },
        { ts: '0:15', speaker: 'customer', text: '我知道，但能不能裸车不加装饰包？' },
        { ts: '0:30', speaker: 'advisor', text: '这个没办法，必须要带的。' },
        { ts: '3:00', speaker: 'advisor', text: '装饰包含了脚垫和贴膜，都是必备的，算下来也不亏。', flag: 'risk', flagLabel: '强制加装', flagNote: '将选配装饰包描述为强制搭售' },
        { ts: '5:00', speaker: 'customer', text: '好吧，那总价算下来多少？' }
      ]
    },
    'R-0296': {
      advisor: '林涛', customer: '梁先生', time: '3-24 16:40', duration: 600,
      scene: '议价谈判', qaScore: 56, model: '传祺 E9',
      highlights: [{ at: 180, label: '泄露客户信息', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '梁先生，您的报价我已经申请了。' },
        { ts: '0:15', speaker: 'customer', text: '别人买的什么价格？' },
        { ts: '0:30', speaker: 'advisor', text: '上个月有个客户跟您差不多配置，落地27万出头。', flag: 'risk', flagLabel: '泄露客户信息', flagNote: '透露其他客户下订价，违规' },
        { ts: '2:00', speaker: 'customer', text: '那我也要这个价格。' },
        { ts: '2:15', speaker: 'advisor', text: '情况不一样的，那个客户是全款。' }
      ]
    },
    'R-0281': {
      advisor: '张华', customer: '许先生', time: '3-23 14:20', duration: 780,
      scene: '门店接待-首次到店', qaScore: 80, model: '传祺 M8',
      highlights: [{ at: 180, label: '场景化介绍好', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '许先生您好，我是张华。今天主要看什么车？' },
        { ts: '0:10', speaker: 'customer', text: 'M8，家用为主。' },
        { ts: '0:25', speaker: 'advisor', text: '好的！那您一般周末出行是几个人？带孩子多吗？' },
        { ts: '1:00', speaker: 'advisor', text: '像您这种二胎家庭自驾游需求，M8 三排座放倒后可以铺成平面，带帐篷露营特别方便。', flag: 'strength', flagLabel: '场景化介绍好', flagNote: '用生活场景带入产品卖点' },
        { ts: '3:00', speaker: 'customer', text: '这个不错，我们确实经常出去露营。' }
      ]
    },
    'R-0288': {
      advisor: '赵强', customer: '郭先生', time: '3-24 10:00', duration: 660,
      scene: '门店接待-首次到店', qaScore: 73, model: '传祺 E9',
      highlights: [{ at: 300, label: '强制加装装饰', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '郭先生，这台 E9 您满意吗？' },
        { ts: '0:10', speaker: 'customer', text: '车还行，就是价格如果能再低一点就完美了。' },
        { ts: '0:25', speaker: 'advisor', text: '价格的话搭配我们的装潢套餐可以有更好的方案。' },
        { ts: '3:00', speaker: 'advisor', text: '这个套餐八千块，买车必须带上的。', flag: 'risk', flagLabel: '强制加装装饰', flagNote: '将选装套餐说成必须搭配' },
        { ts: '5:00', speaker: 'customer', text: '好吧那总价算一下。' }
      ]
    },
    'R-0283': {
      advisor: '林涛', customer: '冯先生', time: '3-23 15:30', duration: 540,
      scene: '电话邀约', qaScore: 55, model: '传祺 E9',
      highlights: [{ at: 120, label: '出现问题，或是客户不满时，未及时表示歉意', type: 'risk' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '冯先生，上次的车您考虑得怎么样？' },
        { ts: '0:10', speaker: 'customer', text: '还在看，你们最近有什么活动？' },
        { ts: '0:25', speaker: 'advisor', text: '活动有的，不过上次沟通没及时跟进上，我先跟您说声抱歉。您这边现在最关心的是价格还是提车时间？', flag: 'risk', flagLabel: '出现问题，或是客户不满时，未及时表示歉意', flagNote: '客户表达迟疑与不满前因时，销售未在第一时间先致歉安抚' },
        { ts: '1:00', speaker: 'customer', text: '我主要还是想看看现在能优惠多少。' },
        { ts: '1:15', speaker: 'advisor', text: '明白，我把今天能申请的政策先给您讲清楚，合适的话再约您到店细聊。' }
      ]
    },
    'R-0388': {
      advisor: '张华', customer: '于先生', time: '3-24 14:00', duration: 720,
      scene: '门店接待-首次到店', qaScore: 84, model: '传祺 M8',
      highlights: [{ at: 180, label: '空间展示到位', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '于先生您好，今天来看 M8 吗？' },
        { ts: '0:15', speaker: 'customer', text: '对，家里人多需要大空间。' },
        { ts: '0:30', speaker: 'advisor', text: '您过来看，这边第二排座椅可以前后滑动，第三排这样放倒后完全平整。', flag: 'strength', flagLabel: '空间展示到位', flagNote: '用实车演示空间灵活性' },
        { ts: '2:00', speaker: 'customer', text: '空间确实大，比我想象的好。' }
      ]
    },
    'R-0403': {
      advisor: '王萌', customer: '彭先生', time: '3-25 11:20', duration: 600,
      scene: '电话邀约', qaScore: 81, model: '传祺 M8',
      highlights: [{ at: 120, label: '价值对比清晰', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '彭先生您好，我是王萌，之前您来看过 M8。' },
        { ts: '0:15', speaker: 'customer', text: '是的，主要还是觉得性价比不太确定。' },
        { ts: '0:30', speaker: 'advisor', text: '我帮您做了一个详细对比：同价位的GL8陆尊版，我们多出10项配置，我发到您微信。', flag: 'strength', flagLabel: '价值对比清晰', flagNote: '量化配置差异，有理有据' },
        { ts: '2:00', speaker: 'customer', text: '好的发过来我看看。' }
      ]
    },
    'R-0382': {
      advisor: '李昱', customer: '贺先生', time: '3-24 09:45', duration: 900,
      scene: '门店接待-首次到店', qaScore: 90, model: '传祺 M8',
      highlights: [{ at: 240, label: '体验式销售', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '贺先生，您主要关注乘坐舒适度是吗？' },
        { ts: '0:15', speaker: 'customer', text: '对，经常长途出差，座椅很重要。' },
        { ts: '0:30', speaker: 'advisor', text: '我先不多说，请您直接坐上去感受一下。这个是零重力座椅模式。' },
        { ts: '2:00', speaker: 'advisor', text: '角度可以这样调，脚托自动升起来。连续开三四个小时也不累。', flag: 'strength', flagLabel: '体验式销售', flagNote: '让产品自己说话，体验优先' },
        { ts: '4:00', speaker: 'customer', text: '这个太舒服了，跟头等舱似的。' }
      ]
    },
    'R-0410': {
      advisor: '林涛', customer: '邓先生', time: '3-25 15:00', duration: 720,
      scene: '门店接待-二次到店', qaScore: 66, model: '传祺 M8',
      highlights: [{ at: 240, label: '油耗问题回避', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '邓先生，又来啦！上次看的 M8 决定了吗？' },
        { ts: '0:15', speaker: 'customer', text: '朋友说这车油耗高，有点犹豫。' },
        { ts: '0:30', speaker: 'advisor', text: '油耗的话... 其实还好，具体数字我不太确定。', flag: 'weakness', flagLabel: '油耗问题回避', flagNote: '面对油耗疑虑含糊回应，缺乏数据支撑' },
        { ts: '2:00', speaker: 'customer', text: '网上说百公里11个油？' },
        { ts: '2:15', speaker: 'advisor', text: '应该没那么高吧，具体您可以试驾感受一下。' }
      ]
    },
    'R-0395': {
      advisor: '赵强', customer: '龚女士', time: '3-24 16:20', duration: 600,
      scene: '电话邀约', qaScore: 71, model: '传祺 M8',
      highlights: [{ at: 180, label: '油耗说明不清', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '龚女士您好，我是赵强。上次您提到关心油耗。' },
        { ts: '0:15', speaker: 'customer', text: '对，这是我最大的顾虑。' },
        { ts: '0:30', speaker: 'advisor', text: '放心，我们的油耗不算太高的。' },
        { ts: '1:30', speaker: 'advisor', text: '综合油耗大概是市区多一点，高速少一点。', flag: 'weakness', flagLabel: '油耗说明不清', flagNote: '回答模糊，缺乏具体数据' },
        { ts: '3:00', speaker: 'customer', text: '能不能给个准确数字？' }
      ]
    },
    'R-0398': {
      advisor: '张华', customer: '任先生', time: '3-25 09:30', duration: 540,
      scene: '门店接待-首次到店', qaScore: 79, model: '传祺 M8',
      highlights: [{ at: 120, label: '品牌故事好', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '任先生您好，欢迎来看我们的 M8。' },
        { ts: '0:12', speaker: 'customer', text: '听说品牌一般，是合资的好还是国产好？' },
        { ts: '0:30', speaker: 'advisor', text: '过去可能有差距，但现在国产品质已经追上来了。我给您看看J.D.Power的最新排名。', flag: 'strength', flagLabel: '品牌故事好', flagNote: '用第三方数据建立品牌信心' },
        { ts: '2:00', speaker: 'customer', text: '排名还挺高的啊。' }
      ]
    },
    'R-0385': {
      advisor: '王萌', customer: '卢先生', time: '3-24 11:10', duration: 600,
      scene: '门店接待-首次到店', qaScore: 77, model: '传祺 M8',
      highlights: [{ at: 180, label: '保值率应对', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '卢先生，您之前提到保值率的顾虑。' },
        { ts: '0:15', speaker: 'customer', text: '对，毕竟换车的时候差价太大不划算。' },
        { ts: '0:30', speaker: 'advisor', text: '我理解。其实我们有官方回购保障政策，三年68折回购。这张表是二手车平台上的真实下订价。', flag: 'strength', flagLabel: '保值率应对', flagNote: '用保障政策和真实数据消除顾虑' },
        { ts: '2:00', speaker: 'customer', text: '有回购保障的话确实放心多了。' }
      ]
    },
    'R-0408': {
      advisor: '李昱', customer: '叶先生', time: '3-25 14:20', duration: 660,
      scene: '门店接待-首次到店', qaScore: 88, model: '传祺 E9',
      highlights: [{ at: 120, label: '政策算账到位', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '叶先生，您考虑新能源主要是因为什么呢？' },
        { ts: '0:15', speaker: 'customer', text: '主要想省购置税，听说还有补贴。' },
        { ts: '0:30', speaker: 'advisor', text: '对！我帮您具体算一下：购置税省2.6万，加上地方补贴8千，落地直接少了3.4万。', flag: 'strength', flagLabel: '政策算账到位', flagNote: '精确到具体金额，有说服力' },
        { ts: '2:00', speaker: 'customer', text: '这样确实省不少啊！' }
      ]
    },
    'R-0392': {
      advisor: '张华', customer: '段先生', time: '3-24 15:40', duration: 720,
      scene: '门店接待-首次到店', qaScore: 82, model: '传祺 E9',
      highlights: [{ at: 300, label: '商务场景展示', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '段先生，您主要是商务接待用途对吗？' },
        { ts: '0:12', speaker: 'customer', text: '对，经常接客户，要有面子。' },
        { ts: '0:25', speaker: 'advisor', text: '您坐到后排感受一下，关上门之后的隔音效果。' },
        { ts: '3:00', speaker: 'advisor', text: '这个独立空调、小桌板和氛围灯，接待客户的时候移动会客室的感觉。', flag: 'strength', flagLabel: '商务场景展示', flagNote: '用商务场景化语言展示产品' },
        { ts: '5:00', speaker: 'customer', text: '档次确实可以，比GL8气氛好。' }
      ]
    },
    'R-0375': {
      advisor: '王萌', customer: '曾先生', time: '3-23 10:00', duration: 600,
      scene: '试乘试驾', qaScore: 85, model: '传祺 S7',
      highlights: [{ at: 120, label: '智驾体验引导', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '曾先生，接下来我开启L2+辅助驾驶给您体验。' },
        { ts: '0:15', speaker: 'customer', text: '好的，我之前没体验过这种功能。' },
        { ts: '0:30', speaker: 'advisor', text: '您看，松开方向盘，车会自动跟车和保持车道。在高速上特别轻松。', flag: 'strength', flagLabel: '智驾体验引导', flagNote: '实际体验中讲解功能，印象深刻' },
        { ts: '2:00', speaker: 'customer', text: '挺智能的，这个功能实用！' }
      ]
    },
    'R-0404': {
      advisor: '赵强', customer: '范先生', time: '3-25 11:50', duration: 720,
      scene: '门店接待-首次到店', qaScore: 75, model: '传祺 S7',
      highlights: [{ at: 300, label: '充电焦虑应对', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '范先生，您对 S7 有什么顾虑吗？' },
        { ts: '0:12', speaker: 'customer', text: '主要是充电不方便，我住的地方没有固定车位。' },
        { ts: '0:25', speaker: 'advisor', text: '理解您的担忧。我这边有个充电桩分布图给您看看。' },
        { ts: '3:00', speaker: 'advisor', text: '您小区500米内就有3个快充桩，充电30分钟可以跑200公里。', flag: 'strength', flagLabel: '充电焦虑应对', flagNote: '用具体数据化解充电焦虑' },
        { ts: '5:00', speaker: 'customer', text: '这样的话倒还好。' }
      ]
    },
    'R-0389': {
      advisor: '林涛', customer: '蒋先生', time: '3-24 13:30', duration: 660,
      scene: '门店接待-首次到店', qaScore: 63, model: '传祺 S7',
      highlights: [{ at: 180, label: '续航解释不足', type: 'weakness' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '蒋先生您好，看 S7 是吗？' },
        { ts: '0:12', speaker: 'customer', text: '是的，但我主要担心续航。' },
        { ts: '0:30', speaker: 'advisor', text: '续航500多公里够用了。', flag: 'weakness', flagLabel: '续航解释不足', flagNote: '仅说数字，未结合客户实际使用场景分析' },
        { ts: '2:00', speaker: 'customer', text: '但冬天会缩水吧？' },
        { ts: '2:15', speaker: 'advisor', text: '冬天确实会少一些，但也还行。' }
      ]
    },
    'R-0380': {
      advisor: '张华', customer: '汪先生', time: '3-23 16:00', duration: 600,
      scene: '电话邀约', qaScore: 78, model: '传祺 S7',
      highlights: [{ at: 120, label: '售后服务说明', type: 'strength' }],
      transcript: [
        { ts: '0:00', speaker: 'advisor', text: '汪先生您好，我是张华。上次您提到对售后有顾虑。' },
        { ts: '0:15', speaker: 'customer', text: '对，家附近好像没有网点。' },
        { ts: '0:30', speaker: 'advisor', text: '我们现在有上门取送车服务，您不需要自己去网点。而且今年新开了3家服务点。', flag: 'strength', flagLabel: '售后服务说明', flagNote: '正面回应售后顾虑' },
        { ts: '2:00', speaker: 'customer', text: '有上门服务就方便多了。' }
      ]
    }
  };

  // 播放器状态
  let recPlayerState = { playing: false, timer: null, currentTime: 0, duration: 0, recordingId: null };

  // 格式化秒为 mm:ss
  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // 生成随机波形高度
  const genWaveHeights = (count) => {
    const h = [];
    for (let i = 0; i < count; i++) h.push(8 + Math.random() * 38);
    return h;
  };

  const escapeAttr = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const formatStoreRecordingDate = (time) => {
    const match = String(time || '').match(/(\d{1,2})[-/](\d{1,2})/);
    if (!match) return '2026/03/25';
    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    return `2026/${month}/${day}`;
  };

  const getRecordingDetailUrl = (id, rec = {}) => {
    const dbRecord = RECORDING_DB[rec.legacyId || id] || {};
    const detail = { ...dbRecord, ...rec };
    const url = new URL(window.location.href);
    url.searchParams.set('route', 'session-detail');
    url.searchParams.delete('leadId');
    url.searchParams.delete('leadSource');
    url.searchParams.set('sessionId', id);
    url.searchParams.set('sessionStore', detail.store || '上海中心店');
    url.searchParams.set('sessionDate', formatStoreRecordingDate(detail.time));
    url.searchParams.set('sessionCustomer', detail.customer || `${detail.advisor || '客户'}相关录音`);
    url.searchParams.set('sessionScene', detail.scene || '进店接待');
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const getRecordingDetailAttrs = (recording) => {
    const legacyId = recording?.id || '';
    const id = normalizeMockRecordingId(legacyId);
    return [
      `href="${escapeAttr(getRecordingDetailUrl(id, { ...recording, legacyId }))}"`,
      'target="_blank"',
      'rel="noopener noreferrer"',
      `aria-label="打开录音详情 ${escapeAttr(id)}"`
    ].join(' ');
  };

  // 打开录音播放器
  window.openRecordingPlayer = function(id) {
    const rec = RECORDING_DB[id];
    if (!rec) { alert(`录音 ${id} 暂无详情数据`); return; }

    // 清理旧播放状态
    if (recPlayerState.timer) clearInterval(recPlayerState.timer);
    recPlayerState = { playing: false, timer: null, currentTime: 0, duration: rec.duration, recordingId: id };

    // 移除旧 overlay
    let overlay = document.getElementById('rec-modal-overlay');
    if (overlay) overlay.remove();

    // 生成波形数据
    const barCount = 80;
    const waveHeights = genWaveHeights(barCount);

    const allHitTags = [];
    const pushHitTag = (label, type) => {
      if (!label || !type) return;
      const exists = allHitTags.some(item => item.label === label && item.type === type);
      if (!exists) allHitTags.push({ label, type });
    };
    (rec.highlights || []).forEach(item => pushHitTag(item.label, item.type));
    (rec.transcript || []).forEach(line => pushHitTag(line.flagLabel, line.flag));

    // 波形条
    const barsHtml = waveHeights.map((h, i) =>
      `<div class="rec-wave-bar" data-idx="${i}" style="height:${h}px"></div>`
    ).join('');

    // 转写文本
    const transcriptHtml = rec.transcript.map((line, i) => {
      return `<div class="rec-transcript-line" data-line-idx="${i}" data-ts="${line.ts}">
        <span class="rec-ts">${line.ts}</span>
        <span class="rec-speaker ${line.speaker}">${line.speaker === 'advisor' ? '顾问' : '客户'}</span>
        <span class="rec-text">${line.text}</span>
      </div>`;
    }).join('');

    const detailUrl = getRecordingDetailUrl(id, rec);

    overlay = document.createElement('div');
    overlay.id = 'rec-modal-overlay';
    overlay.className = 'rec-modal-overlay';
    overlay.innerHTML = `
      <div class="rec-modal">
        <div class="rec-modal-head">
          <button class="rec-modal-close" id="rec-close-btn">✕</button>
          <div class="rec-modal-head-main">
            <div class="rec-modal-title">${rec.advisor} → ${rec.customer} · ${rec.model}</div>
            <div class="rec-modal-meta">
              <span>🎙️ ${rec.scene}</span>
              <span>📅 ${rec.time}</span>
              <span>⏱️ ${fmtTime(rec.duration)}</span>
              <span>📋 ${id}</span>
            </div>
            <div class="rec-modal-tags">
              ${(allHitTags.length ? allHitTags : [{ label: '暂无命中标签', type: 'neutral' }]).map(tag => `<span class="rec-modal-tag ${tag.type}">${tag.label}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="rec-player-section">
          <div class="rec-waveform" id="rec-waveform">${barsHtml}</div>
          <div class="rec-controls">
            <button class="rec-play-btn" id="rec-play-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <div class="rec-time-display"><span class="current" id="rec-current-time">0:00</span> / ${fmtTime(rec.duration)}</div>
            <div class="rec-actions">
              <a class="rec-detail-link" href="${detailUrl}" target="_blank" rel="noopener noreferrer">跳转录音详情</a>
            </div>
          </div>
        </div>

        <div class="rec-transcript" id="rec-transcript">
          <div class="rec-transcript-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            AI 转写文本 · ${rec.transcript.length} 句
          </div>
          ${transcriptHtml}
        </div>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    // 绑定关闭
    const closeModal = () => {
      if (recPlayerState.timer) clearInterval(recPlayerState.timer);
      recPlayerState.playing = false;
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    };
    document.getElementById('rec-close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // 更新波形和转写高亮
    const updateUI = () => {
      const bars = document.querySelectorAll('#rec-waveform .rec-wave-bar');
      const pct = recPlayerState.currentTime / recPlayerState.duration;
      const activeIdx = Math.floor(pct * barCount);
      bars.forEach((b, i) => {
        b.classList.toggle('played', i < activeIdx);
        b.classList.toggle('active', i === activeIdx);
      });
      document.getElementById('rec-current-time').textContent = fmtTime(recPlayerState.currentTime);

      const lines = document.querySelectorAll('#rec-transcript .rec-transcript-line');
      let activeLineIdx = 0;
      const tsToSec = (ts) => {
        const parts = ts.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      };
      rec.transcript.forEach((t, i) => {
        if (tsToSec(t.ts) <= recPlayerState.currentTime) activeLineIdx = i;
      });
      lines.forEach((l, i) => {
        l.classList.toggle('active', i === activeLineIdx);
      });
      if (lines[activeLineIdx]) {
        lines[activeLineIdx].scrollIntoView({ block: 'nearest' });
      }

    };

    // 播放/暂停
    document.getElementById('rec-play-btn').addEventListener('click', function() {
      if (recPlayerState.playing) {
        clearInterval(recPlayerState.timer);
        recPlayerState.playing = false;
        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        this.classList.remove('playing');
      } else {
        if (recPlayerState.currentTime >= recPlayerState.duration) recPlayerState.currentTime = 0;
        recPlayerState.playing = true;
        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        this.classList.add('playing');
        recPlayerState.timer = setInterval(() => {
          recPlayerState.currentTime += 3;
          if (recPlayerState.currentTime >= recPlayerState.duration) {
            recPlayerState.currentTime = recPlayerState.duration;
            clearInterval(recPlayerState.timer);
            recPlayerState.playing = false;
            const btn = document.getElementById('rec-play-btn');
            if (btn) {
              btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
              btn.classList.remove('playing');
            }
          }
          updateUI();
        }, 100);
      }
    });

    // 波形点击跳转
    document.getElementById('rec-waveform').addEventListener('click', (e) => {
      const bar = e.target.closest('.rec-wave-bar');
      if (!bar) return;
      const idx = parseInt(bar.dataset.idx);
      recPlayerState.currentTime = (idx / barCount) * recPlayerState.duration;
      updateUI();
    });

    document.querySelectorAll('#rec-transcript .rec-transcript-line').forEach((line) => {
      line.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ts = line.dataset.ts;
        const parts = ts.split(':');
        recPlayerState.currentTime = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        updateUI();
      });
    });

    updateUI();
  };

  // ── 1. Mock 数据 ──────────────────────────────
  // 全量 KPI 数据（含新增的到店率/试驾率/下订率）
  const ALL_KPI_DATA = {
    invitation:    { label: "邀约录音数", num: "6",    unit: "条",  trend: "↑1",    trendDir: "up",   tone: "blue" },
    reception:     { label: "接待录音数", num: "18",   unit: "条",  trend: "↑3",    trendDir: "up",   tone: "cyan" },
    test_drive:    { label: "试驾录音数", num: "8",    unit: "条",  trend: "↑2",    trendDir: "up",   tone: "green" },
    visit_rate:    { label: "到店率",     num: "33.3", unit: "%",   trend: "↑5%",   trendDir: "up",   isRate: true, tone: "blue" },
    drive_rate:    { label: "试驾率",     num: "44.4", unit: "%",   trend: "↑2%",   trendDir: "up",   isRate: true, tone: "cyan" },
    order_rate:    { label: "下订率",     num: "12.5", unit: "%",   trend: "↑1%",   trendDir: "up",   isRate: true, tone: "green" },
    valid_record:  { label: "有效录音",   num: "5",    unit: "条",  trend: "↑1",    trendDir: "up",   tone: "violet" },
    hit_rate:      { label: "话术执行率", num: "78",   unit: "%",   trend: "↑3%",   trendDir: "up",   isRate: true, tone: "fuchsia" },
    cover_rate:    { label: "覆盖率",     num: "83.3", unit: "%",   trend: "↑1.3%", trendDir: "up",   tone: "amber" },
    avg_duration:  { label: "平均时长",   num: "12",   unit: "min", trend: "↑2",    trendDir: "up",   tone: "indigo" },
    qa_pass_count: { label: "质检合格数", num: "4",    unit: "条",  trend: "↑1",    trendDir: "up",   tone: "emerald" },
    qa_pass_rate:  { label: "质检合格率", num: "80",   unit: "%",   trend: "↑2%",   trendDir: "up",   isRate: true, tone: "emerald" },
    risk_record:   { label: "风险录音数", num: "0",    unit: "条",  trend: "↓1",    trendDir: "down", isDanger: false, isSuccess: true, tone: "red" },
    risk_rate:     { label: "风险录音率", num: "0",    unit: "%",   trend: "↓2%",   trendDir: "down", isDanger: false, isSuccess: true, isRate: true, tone: "red" }
  };

  // 各场景对应的 KPI 显示列表
  // pairedWith: 关联指标，显示在同一单元格底部
  const SCENE_KPI_MAP = {
    all:      [
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

  const STORE_KPI_ROLE_FACTORS = {
    all: {},
    '邀约专员': {
      invitation: 1.28,
      reception: 0.62,
      test_drive: 0.48,
      valid_record: 0.9,
      avg_duration: 0.94,
      visit_rate: 4.8,
      drive_rate: -3.2,
      order_rate: -1.1,
      cover_rate: -1.6,
      hit_rate: 1.4,
      qa_pass_rate: 0.8,
      risk_rate: -0.6
    },
    '销售顾问': {
      invitation: 0.72,
      reception: 1.18,
      test_drive: 1.3,
      valid_record: 1.16,
      avg_duration: 1.08,
      visit_rate: -1.4,
      drive_rate: 3.8,
      order_rate: 2.4,
      cover_rate: 1.2,
      hit_rate: 0.6,
      qa_pass_rate: 1.6,
      risk_rate: 0.4
    }
  };

  const STORE_KPI_SCENE_FACTORS = {
    all: {},
    first_follow: {
      invitation: 0.96,
      reception: 0.46,
      test_drive: 0.32,
      valid_record: 0.76,
      avg_duration: 0.86,
      visit_rate: -1.8,
      drive_rate: -5.2,
      order_rate: -2.4,
      cover_rate: -1.1,
      hit_rate: 0.8,
      qa_pass_rate: 0.4,
      risk_rate: -0.6
    },
    invite_store: {
      invitation: 1.08,
      reception: 0.62,
      test_drive: 0.44,
      valid_record: 0.88,
      avg_duration: 0.93,
      visit_rate: 2.8,
      drive_rate: -4.2,
      order_rate: -1.7,
      cover_rate: -0.4,
      hit_rate: 1.3,
      qa_pass_rate: 0.9,
      risk_rate: -0.1
    },
    schedule_confirm: {
      invitation: 0.82,
      reception: 0.74,
      test_drive: 0.52,
      valid_record: 0.92,
      avg_duration: 0.98,
      visit_rate: 5.1,
      drive_rate: -3.1,
      order_rate: -1.1,
      cover_rate: 0.6,
      hit_rate: 1.7,
      qa_pass_rate: 1.2,
      risk_rate: 0.2
    },
    cloud_multi: {
      invitation: 1.02,
      reception: 0.58,
      test_drive: 0.43,
      valid_record: 0.85,
      avg_duration: 0.91,
      visit_rate: 2.1,
      drive_rate: -4.4,
      order_rate: -1.8,
      cover_rate: -0.2,
      hit_rate: 1.1,
      qa_pass_rate: 0.7,
      risk_rate: -0.2
    },
    store_reception: {
      invitation: 0.76,
      reception: 1.16,
      test_drive: 0.88,
      valid_record: 1.12,
      avg_duration: 1.04,
      visit_rate: -0.8,
      drive_rate: 4.2,
      order_rate: 0.8,
      cover_rate: 1.8,
      hit_rate: 0.9,
      qa_pass_rate: 1.4,
      risk_rate: 0.2
    },
    test_drive: {
      invitation: 0.58,
      reception: 0.82,
      test_drive: 1.26,
      valid_record: 1.18,
      avg_duration: 1.14,
      visit_rate: -1.6,
      drive_rate: 2.8,
      order_rate: 3.2,
      cover_rate: 2.4,
      hit_rate: 1.8,
      qa_pass_rate: 2.2,
      risk_rate: 0.7
    }
  };

  const STORE_KPI_MODEL_FACTORS = {
    all: {},
    M8: {
      invitation: 1.12,
      reception: 1.08,
      test_drive: 1.04,
      valid_record: 1.1,
      avg_duration: 1.06,
      visit_rate: 2.4,
      drive_rate: 1.4,
      order_rate: 1.2,
      cover_rate: 1.5,
      hit_rate: 0.8,
      qa_pass_rate: 1.2,
      risk_rate: 0.4
    },
    S7: {
      invitation: 0.92,
      reception: 0.88,
      test_drive: 1.02,
      valid_record: 1.06,
      avg_duration: 1.1,
      visit_rate: -0.8,
      drive_rate: 1.9,
      order_rate: -0.4,
      cover_rate: 0.8,
      hit_rate: -1.6,
      qa_pass_rate: -1.2,
      risk_rate: 1.4
    },
    GS8: {
      invitation: 1.04,
      reception: 1,
      test_drive: 0.92,
      valid_record: 0.96,
      avg_duration: 1.02,
      visit_rate: 1.1,
      drive_rate: -0.6,
      order_rate: 0.5,
      cover_rate: -0.7,
      hit_rate: -0.4,
      qa_pass_rate: -0.8,
      risk_rate: 0.8
    },
    E8: {
      invitation: 0.82,
      reception: 0.86,
      test_drive: 0.9,
      valid_record: 1.02,
      avg_duration: 0.96,
      visit_rate: -1.2,
      drive_rate: 0.8,
      order_rate: 1.8,
      cover_rate: 2.1,
      hit_rate: 2.4,
      qa_pass_rate: 2.6,
      risk_rate: -0.9
    }
  };

  const cloneStoreKpiData = (data) => Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, { ...value }])
  );

  const clampStoreKpiValue = (value, min, max) => Math.min(max, Math.max(min, value));

  const getStoreKpiRangeDays = () => {
    if (currentTime === 'custom') {
      return getStoreRangeInclusiveDays(storeTimeStartDate, storeTimeEndDate);
    }

    return Number({
      '1': 1,
      '7': 7,
      '15': 15,
      '30': 30
    }[currentTime] || 1);
  };

  const getStoreKpiVolumeScale = () => {
    const days = getStoreKpiRangeDays();
    if (days <= 1) {
      return 1;
    }

    return clampStoreKpiValue((days * 0.82) + 0.34, 1, 24.8);
  };

  const getStoreKpiJitter = (key, amplitude = 1) => {
    const seed = `${currentRole}|${currentSource}|${getEffectiveSceneKey()}|${currentTime}|${currentModel}|${storeTimeStartDate}|${storeTimeEndDate}|${key}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }

    return ((((Math.abs(hash) % 2001) / 1000) - 1) * amplitude);
  };

  const getStoreCountFactor = (key) => {
    const roleFactor = STORE_KPI_ROLE_FACTORS[currentRole]?.[key] ?? 1;
    const sceneKey = getEffectiveSceneKey();
    const sceneFactor = STORE_KPI_SCENE_FACTORS[sceneKey]?.[key] ?? 1;
    const modelFactor = STORE_KPI_MODEL_FACTORS[currentModel]?.[key] ?? 1;
    const jitterFactor = 1 + getStoreKpiJitter(key, 0.055);
    return roleFactor * sceneFactor * modelFactor * jitterFactor;
  };

  const getStoreRateDelta = (key) => {
    const days = getStoreKpiRangeDays();
    const timeDelta = days <= 1 ? 0 : Math.min(4.2, Math.log2(days) * 0.72);
    const roleDelta = STORE_KPI_ROLE_FACTORS[currentRole]?.[key] ?? 0;
    const sceneKey = getEffectiveSceneKey();
    const sceneDelta = STORE_KPI_SCENE_FACTORS[sceneKey]?.[key] ?? 0;
    const modelDelta = STORE_KPI_MODEL_FACTORS[currentModel]?.[key] ?? 0;
    const jitterDelta = getStoreKpiJitter(`${key}-rate`, 0.85);
    return roleDelta + sceneDelta + modelDelta + timeDelta + jitterDelta;
  };

  const getStoreTrendDirection = (key, options = {}) => {
    const isRisk = Boolean(options.isRisk);
    const directionalSeed = getStoreKpiJitter(`${key}-trend-direction`, 1);
    const directionalBias = getStoreRateDelta(key) * (isRisk ? 0.12 : 0.08);
    const score = directionalSeed + directionalBias;

    if (isRisk) {
      return score > 0.45 ? 'up' : 'down';
    }

    return score < -0.28 ? 'down' : 'up';
  };

  const formatStoreKpiNumber = (value, decimals = 0) => {
    const text = decimals > 0 ? Number(value).toFixed(decimals) : String(Math.round(value));
    return text.replace(/\.0$/, '');
  };

  const getStoreKpiTrend = (value, options = {}) => {
    const numericValue = Number(value) || 0;
    const isRate = Boolean(options.isRate);
    const isRisk = Boolean(options.isRisk);
    const decimals = options.decimals ?? 0;
    const key = options.key || '';
    const direction = getStoreTrendDirection(key, { isRisk });

    if (isRisk) {
      if (numericValue <= 0 && direction === 'down') {
        return { trend: isRate ? '↓2%' : '↓1', trendDir: 'down' };
      }
      const riskMagnitude = isRate
        ? Math.max(0.6, Math.min(3.8, numericValue * 0.22 + Math.abs(getStoreKpiJitter(`${key}-risk-trend`, 0.7))))
        : Math.max(1, Math.round(Math.max(1, numericValue) * 0.18 + Math.abs(getStoreKpiJitter(`${key}-risk-trend`, 1.2))));
      const delta = isRate
        ? formatStoreKpiNumber(riskMagnitude, decimals)
        : String(riskMagnitude);
      return { trend: `${direction === 'up' ? '↑' : '↓'}${delta}${isRate ? '%' : ''}`, trendDir: direction };
    }

    const magnitudeSeed = Math.abs(getStoreKpiJitter(`${key}-trend-size`, 1));
    const delta = isRate
      ? formatStoreKpiNumber(Math.max(0.6, Math.min(6.8, numericValue * 0.045 + magnitudeSeed * 1.4)), decimals)
      : String(Math.max(1, Math.round(numericValue * 0.08 + magnitudeSeed * 2)));
    return { trend: `${direction === 'up' ? '↑' : '↓'}${delta}${isRate ? '%' : ''}`, trendDir: direction };
  };

  const buildStoreFilteredKpiData = () => {
    const sceneKey = getEffectiveSceneKey();
    const isDefaultFilter = currentRole === 'all'
      && currentSource === SOURCE_KEYS.all
      && sceneKey === SCENE_KEYS.all
      && currentTime === '1'
      && currentModel === 'all';

    if (isDefaultFilter) {
      return cloneStoreKpiData(ALL_KPI_DATA);
    }

    const nextData = cloneStoreKpiData(ALL_KPI_DATA);
    const volumeScale = getStoreKpiVolumeScale();
    const countKeys = ['invitation', 'reception', 'test_drive', 'valid_record'];

    countKeys.forEach((key) => {
      const baseValue = Number(ALL_KPI_DATA[key]?.num || 0);
      const scaledValue = baseValue * volumeScale * getStoreCountFactor(key);
      const minValue = key === 'avg_duration' ? 4 : 0;
      nextData[key].num = String(Math.max(minValue, Math.round(scaledValue)));
      Object.assign(nextData[key], getStoreKpiTrend(nextData[key].num, { key }));
    });

    if (sceneKey === SCENE_KEYS.firstFollow || sceneKey === SCENE_KEYS.inviteStore || sceneKey === SCENE_KEYS.scheduleConfirm) {
      nextData.invitation.num = String(getInvitationSceneCount(nextData.invitation.num, sceneKey));
      Object.assign(nextData.invitation, getStoreKpiTrend(nextData.invitation.num, { key: 'invitation' }));
    }

    const avgDurationValue = clampStoreKpiValue(
      12 * getStoreCountFactor('avg_duration') + getStoreKpiJitter('avg-duration-minutes', 1.4),
      7,
      19
    );
    nextData.avg_duration.num = formatStoreKpiNumber(avgDurationValue, 0);
    Object.assign(nextData.avg_duration, getStoreKpiTrend(nextData.avg_duration.num, { key: 'avg_duration' }));

    const visitRate = clampStoreKpiValue(33.3 + getStoreRateDelta('visit_rate'), 18, 68);
    const driveRate = clampStoreKpiValue(44.4 + getStoreRateDelta('drive_rate'), 24, 72);
    const orderRate = clampStoreKpiValue(12.5 + getStoreRateDelta('order_rate'), 6, 32);
    const coverRate = clampStoreKpiValue(83.3 + getStoreRateDelta('cover_rate'), 62, 96);
    const hitRate = clampStoreKpiValue(78 + getStoreRateDelta('hit_rate'), 58, 94);
    const qaPassRate = clampStoreKpiValue(80 + getStoreRateDelta('qa_pass_rate'), 56, 96);
    const riskRate = currentTime === '1'
      ? clampStoreKpiValue(0 + Math.max(0, getStoreRateDelta('risk_rate') * 0.28), 0, 3.8)
      : clampStoreKpiValue(2.2 + getStoreRateDelta('risk_rate') * 0.46, 0, 8.6);

    const rateConfig = [
      ['visit_rate', visitRate, 1],
      ['drive_rate', driveRate, 1],
      ['order_rate', orderRate, 1],
      ['cover_rate', coverRate, 1],
      ['hit_rate', hitRate, 0],
      ['qa_pass_rate', qaPassRate, 0]
    ];

    rateConfig.forEach(([key, value, decimals]) => {
      nextData[key].num = formatStoreKpiNumber(value, decimals);
      Object.assign(nextData[key], getStoreKpiTrend(value, { key, isRate: true, decimals }));
    });

    const validRecord = Number(nextData.valid_record.num || 0);
    const qaPassCount = Math.max(0, Math.round(validRecord * (qaPassRate / 100)));
    const riskRecord = riskRate <= 0.4 ? 0 : Math.max(1, Math.round(validRecord * (riskRate / 100)));

    nextData.qa_pass_count.num = String(qaPassCount);
    Object.assign(nextData.qa_pass_count, getStoreKpiTrend(qaPassCount, { key: 'qa_pass_count' }));
    nextData.risk_rate.num = formatStoreKpiNumber(riskRate, riskRate >= 1 ? 1 : 0);
    Object.assign(nextData.risk_rate, getStoreKpiTrend(riskRate, { key: 'risk_rate', isRate: true, isRisk: true, decimals: riskRate >= 1 ? 1 : 0 }));
    nextData.risk_record.num = String(riskRecord);
    nextData.risk_record.isDanger = riskRecord > 0;
    nextData.risk_record.isSuccess = riskRecord === 0;
    Object.assign(nextData.risk_record, getStoreKpiTrend(riskRecord, { key: 'risk_record', isRisk: true }));

    return nextData;
  };

  const clientData = [
    {
      id: "C-091", customer_name: "赵女士", intention_series: "高",
      car_model: "广汽传祺 M8", advisor: "李昱", advisor_role: "销售顾问", status: "urgent",
      user_profile: ["女性", "二胎家庭", "看重空间安全", "预算25万内"],
      qa_score: 92, ai_issue: "意向强烈，超 3 天未邀约复访，存在流失风险。",
      last_scene: "首触邀约", time: "今天 10:30",
      follow_up_time: "今天 17:30",
      follow_action: "17:30 做一次行程确认，同时补充客户通勤与补能场景，方便顾问接待时直接展开。",
      recommend_reason: "客户昨天已经确认今晚到店，需求信息基本齐全，当前主要看提醒和交接备注是否完整。",
      key_tags: ["A级中意向", "今日18:30", "交接备注待补"],
      manager_strategy: "建议今日亲自致电赵女士表达关怀，同时当面指导李昱制定本周复访计划。A级客户停止流动超3天视为高危，须在今日下班前完成复访动作，并在CRM记录跟进节点。"
    },
    {
      id: "C-092", customer_name: "刘先生", intention_series: "高",
      car_model: "广汽传祺 E9", advisor: "林涛", advisor_role: "销售顾问", status: "urgent",
      user_profile: ["男性", "增换购", "商务接待为主", "对价格极度敏感"],
      qa_score: 64, ai_issue: "录音命中红线：过度承诺提车时间，客户对报价有异议。",
      last_scene: "进店接待", time: "昨天 16:20",
      follow_up_time: "今天 16:00",
      follow_action: "先由店长统一合规报价口径，再安排林涛回电解释交付周期，避免继续放大承诺风险。",
      recommend_reason: "客户对报价和提车时间均有异议，上一通录音出现过度承诺风险，需要门店先收拢话术口径。",
      key_tags: ["高意向", "合规风险", "报价异议待处理"],
      manager_strategy: "须立即约谈林涛复盘此次录音，强调红线纪律（禁止口头承诺交车时间）。建议亲自接待刘先生下次来访，主导议价节奏，同时准备合规的书面报价单挽回客户信任。"
    },
    {
      id: "C-093", customer_name: "王先生", intention_series: "中",
      car_model: "广汽传祺 GS8", advisor: "张华", advisor_role: "邀约专员", status: "warn",
      user_profile: ["首购", "关注动力表现", "竞品对比汉兰达"],
      qa_score: 85, ai_issue: "未执行竞品优势拆解话术，可能被竞品截流。",
      last_scene: "战败客户回访", time: "前天 14:00",
      follow_up_time: "明天 10:00",
      follow_action: "回访前先补一版 GS8 与汉兰达对比话术卡，突出动力、智能配置和空间差异。",
      recommend_reason: "客户关注点集中在竞品对比，但录音里没有完成优势拆解，容易被竞品销售截流。",
      key_tags: ["B级关注", "竞品对比", "差异化话术待补"],
      manager_strategy: "建议向张华提供 GS8 vs 汉兰达的标准对比话术卡，要求本周内回访王先生，重点突出 GS8 在智能配置与空间上的具体差异。B级客户在竞品对比阶段最易流失，需在72小时内完成差异化触达。"
    },
    {
      id: "C-094", customer_name: "陈女士", intention_series: "低",
      car_model: "广汽传祺 影豹", advisor: "李昱", advisor_role: "销售顾问", status: "normal",
      user_profile: ["女性", "90后", "注重外观", "首付预算不足"],
      qa_score: 90, ai_issue: "常规跟进中，无异常。",
      last_scene: "到店接待", time: "今天 09:15",
      follow_up_time: "明天 11:00",
      follow_action: "补充金融方案测算后再做一次轻量触达，重点确认首付接受区间。",
      recommend_reason: "客户外观偏好明确，但首付预算仍有压力，适合用金融方案继续培育。",
      key_tags: ["低意向培育", "金融方案", "首付预算不足"],
      manager_strategy: "建议关注陈女士的金融方案匹配情况，可指导李昱推送低首付分期活动，结合外观定制权益激发下订意愿。"
    }
  ];

  const advisorData = [
    { id: "A001", name: "李昱", role: "销售顾问", invitation: 6, reception: 8, test_drive: 5, valid_record: 4, rec_pass_rate: "83%", hit_rate: "92%", qa_pass: "95%", danger: false },
    { id: "A002", name: "张华", role: "邀约专员", invitation: 12, reception: 5, test_drive: 2, valid_record: 2, rec_pass_rate: "75%", hit_rate: "86%", qa_pass: "88%", danger: false },
    { id: "A003", name: "林涛", role: "销售顾问", invitation: 4, reception: 6, test_drive: 1, valid_record: 3, rec_pass_rate: "62%", hit_rate: "68%", qa_pass: "60%", danger: true },
    { id: "A004", name: "王萌", role: "销售顾问", invitation: 9, reception: 12, test_drive: 8, valid_record: 10, rec_pass_rate: "90%", hit_rate: "89%", qa_pass: "91%", danger: false },
    { id: "A005", name: "赵强", role: "邀约专员", invitation: 18, reception: 15, test_drive: 4, valid_record: 3, rec_pass_rate: "78%", hit_rate: "75%", qa_pass: "82%", danger: false },
    { id: "A006", name: "陈涛", role: "销售顾问", invitation: 7, reception: 10, test_drive: 6, valid_record: 7, rec_pass_rate: "88%", hit_rate: "84%", qa_pass: "90%", danger: false },
    { id: "A007", name: "周倩", role: "销售顾问", invitation: 5, reception: 9, test_drive: 4, valid_record: 6, rec_pass_rate: "81%", hit_rate: "79%", qa_pass: "86%", danger: false },
    { id: "A008", name: "郭芹", role: "邀约专员", invitation: 21, reception: 11, test_drive: 3, valid_record: 4, rec_pass_rate: "72%", hit_rate: "73%", qa_pass: "80%", danger: false },
    { id: "A009", name: "韩宇", role: "销售顾问", invitation: 8, reception: 13, test_drive: 7, valid_record: 9, rec_pass_rate: "93%", hit_rate: "91%", qa_pass: "94%", danger: false },
    { id: "A010", name: "孙悦", role: "邀约专员", invitation: 16, reception: 9, test_drive: 2, valid_record: 5, rec_pass_rate: "76%", hit_rate: "82%", qa_pass: "84%", danger: false },
    { id: "A011", name: "刘洋", role: "销售顾问", invitation: 3, reception: 5, test_drive: 2, valid_record: 2, rec_pass_rate: "58%", hit_rate: "64%", qa_pass: "66%", danger: true },
    { id: "A012", name: "许明", role: "销售顾问", invitation: 10, reception: 14, test_drive: 9, valid_record: 11, rec_pass_rate: "91%", hit_rate: "87%", qa_pass: "89%", danger: false },
    { id: "A013", name: "何佳", role: "邀约专员", invitation: 14, reception: 7, test_drive: 1, valid_record: 3, rec_pass_rate: "69%", hit_rate: "71%", qa_pass: "77%", danger: false },
    { id: "A014", name: "吴俊", role: "销售顾问", invitation: 6, reception: 11, test_drive: 6, valid_record: 8, rec_pass_rate: "85%", hit_rate: "88%", qa_pass: "92%", danger: false },
    { id: "A015", name: "唐敏", role: "销售顾问", invitation: 4, reception: 7, test_drive: 3, valid_record: 4, rec_pass_rate: "74%", hit_rate: "69%", qa_pass: "73%", danger: true },
    { id: "A016", name: "郑凯", role: "邀约专员", invitation: 19, reception: 12, test_drive: 5, valid_record: 6, rec_pass_rate: "80%", hit_rate: "83%", qa_pass: "85%", danger: false }
  ];
  // 门店销售顾问总人数（含未在示例数据中列出的顾问）
  const TOTAL_ADVISOR_COUNT = 8;

  const storeSopRecordingAdvisors = ['李昱', '王萌', '韩宇', '许明', '张华', '林涛', '赵强', '陈亮'];
  const storeSopPeople = storeSopRecordingAdvisors.map((name, index) => ({
    id: advisorData.find(item => item.name === name)?.id || `A${String(index + 1).padStart(3, '0')}`,
    name,
    role: advisorData.find(item => item.name === name)?.role || '销售顾问'
  }));
  const makeStoreSopRule = (title, category, hitRate, advisorCount, ruleIndex) => {
    const applicableScenes = [
      SCENE_KEYS.firstFollow,
      SCENE_KEYS.inviteStore,
      SCENE_KEYS.scheduleConfirm,
      SCENE_KEYS.storeReception,
      SCENE_KEYS.testDrive
    ];
    const distributeByScene = (total, offset = 0) => {
      const base = Math.floor(total / applicableScenes.length);
      const values = Array.from({ length: applicableScenes.length }, () => base);
      for (let index = 0; index < total - (base * applicableScenes.length); index += 1) {
        values[(index + offset) % applicableScenes.length] += 1;
      }
      return values;
    };
    const rateOffsets = [9, 6, 3, 1, -2, -5, -8, -11];
    const involvedCount = Math.max(1, Math.min(TOTAL_ADVISOR_COUNT, Number(advisorCount) || 1));
    const involvedPeople = Array.from({ length: involvedCount }, (_, personIndex) => (
      storeSopPeople[(ruleIndex + personIndex) % storeSopPeople.length]
    ));
    const people = involvedPeople.map((person, personIndex) => {
      const sampleCount = 7 + ((ruleIndex * 3 + personIndex * 2) % 8);
      const personRate = Math.max(8, Math.min(98, hitRate + rateOffsets[(personIndex + ruleIndex) % rateOffsets.length]));
      const hitCount = Math.max(0, Math.min(sampleCount, Math.round(sampleCount * personRate / 100)));
      return {
        ...person,
        sampleCount,
        hitCount,
        rate: Math.round(hitCount * 100 / sampleCount)
      };
    });
    const sampleCount = people.reduce((sum, person) => sum + person.sampleCount, 0);
    const targetHitCount = Math.round(sampleCount * hitRate / 100);
    let hitDelta = targetHitCount - people.reduce((sum, person) => sum + person.hitCount, 0);
    let cursor = 0;
    while (hitDelta !== 0 && cursor < people.length * 4) {
      const person = people[cursor % people.length];
      if (hitDelta > 0 && person.hitCount < person.sampleCount) {
        person.hitCount += 1;
        hitDelta -= 1;
      } else if (hitDelta < 0 && person.hitCount > 0) {
        person.hitCount -= 1;
        hitDelta += 1;
      }
      person.rate = Math.round(person.hitCount * 100 / person.sampleCount);
      cursor += 1;
    }

    people.forEach((person, personIndex) => {
      const sceneHitCounts = distributeByScene(person.hitCount, ruleIndex + personIndex);
      const sceneExtraSamples = distributeByScene(person.sampleCount - person.hitCount, ruleIndex + personIndex + 1);
      person.sceneStats = applicableScenes.reduce((stats, sceneKey, sceneIndex) => {
        stats[sceneKey] = {
          hitCount: sceneHitCounts[sceneIndex],
          sampleCount: sceneHitCounts[sceneIndex] + sceneExtraSamples[sceneIndex]
        };
        return stats;
      }, {});
    });

    const resolvedHitCount = people.reduce((sum, person) => sum + person.hitCount, 0);
    const recordings = people.flatMap((person, personIndex) => applicableScenes.flatMap((sceneKey, sceneIndex) => (
      Array.from({ length: person.sceneStats[sceneKey].hitCount }, (_, recordingIndex) => ({
        advisor: person.name,
        customer: `${person.name}相关客户${sceneIndex + 1}-${recordingIndex + 1}`,
        time: `3-${25 - ((ruleIndex + personIndex + sceneIndex + recordingIndex) % 4)} ${String(9 + ((ruleIndex + personIndex + recordingIndex) % 8)).padStart(2, '0')}:${String((ruleIndex * 7 + personIndex * 13 + sceneIndex * 5 + recordingIndex * 9) % 60).padStart(2, '0')}`,
        id: buildMockRecordingId(10000 + ruleIndex * 1000 + personIndex * 100 + sceneIndex * 10 + recordingIndex),
        sceneKey,
        scene: getSceneLabel(sceneKey)
      }))
    )));

    return {
      id: `store-sop-${String(ruleIndex + 1).padStart(2, '0')}`,
      title,
      category,
      hit_ratio: `${hitRate}%`,
      hit_count: resolvedHitCount,
      sample_count: sampleCount,
      advisor_count: people.length,
      applicableScenes,
      people,
      recordings
    };
  };

  // 规则名称与厂端看板“质检规则”保持一致，命中率与范围标签按门店口径展示。
  const storeSopRuleData = [
    makeStoreSopRule('对比车型', '需求确认', 78, 4, 0),
    makeStoreSopRule('意向车型', '需求确认', 74, 4, 1),
    makeStoreSopRule('增换购情况', '需求确认', 67, 3, 2),
    makeStoreSopRule('购车关注点', '需求确认', 63, 3, 3),
    makeStoreSopRule('添加微信要求', '留资承接', 61, 2, 4),
    makeStoreSopRule('计划购车时间', '需求确认', 58, 3, 5),
    makeStoreSopRule('试乘试驾时间', '到店邀约', 55, 2, 6),
    makeStoreSopRule('预算范围确认', '需求确认', 72, 4, 7),
    makeStoreSopRule('用车场景确认', '需求确认', 69, 4, 8),
    makeStoreSopRule('家庭成员需求', '需求确认', 64, 3, 9),
    makeStoreSopRule('配置版本推荐', '产品讲解', 62, 3, 10),
    makeStoreSopRule('权益政策说明', '产品讲解', 60, 2, 11),
    makeStoreSopRule('价格锚点铺垫', '价格沟通', 57, 2, 12),
    makeStoreSopRule('金融方案介绍', '促单转化', 53, 2, 13),
    makeStoreSopRule('置换政策说明', '促单转化', 51, 2, 14),
    makeStoreSopRule('下一步跟进约定', '跟进承接', 49, 2, 15),
    makeStoreSopRule('到店路线引导', '到店邀约', 47, 1, 16),
    makeStoreSopRule('价格异议承接', '异议处理', 46, 2, 17),
    makeStoreSopRule('等待周期解释', '异议处理', 44, 1, 18),
    makeStoreSopRule('接待结束总结', '跟进承接', 42, 1, 19),
    makeStoreSopRule('客户标签补充', '跟进承接', 39, 1, 20)
  ];
  const storeSopRuleState = {
    activeTab: 'sop',
    query: '',
    sort: 'rate-desc',
    page: 1,
    selectedRuleId: null
  };
  const storeInsightRuleState = {
    activeTab: 'strength',
    query: '',
    sort: 'rate-desc',
    page: 1,
    selectedRuleId: null
  };
  const STORE_SOP_SORT_OPTIONS = [
    { value: 'rate-desc', label: '命中率从高到低' },
    { value: 'rate-asc', label: '命中率从低到高' },
    { value: 'count-desc', label: '命中数量优先' },
    { value: 'sample-desc', label: '样本数量优先' }
  ];
  const STORE_ISSUE_PAGE_SIZE = 5;

  const weaknessData = [
    { title: "深度需求挖掘", unhit_ratio: "85%", unhit_count: 42, advisor_count: 4,
      strategy: "围绕家庭结构、使用场景、购车预算与换购原因建立固定追问顺序，让后续邀约与看车推荐有明确抓手。",
      recordings: [
        { advisor: "林涛", time: "3-25 15:20", id: "R-0312" },
        { advisor: "张华", time: "3-25 11:05", id: "R-0308" },
        { advisor: "王萌", time: "3-24 16:40", id: "R-0295" },
        { advisor: "赵强", time: "3-24 10:15", id: "R-0289" }
      ]},
    { title: "本品价值塑造", unhit_ratio: "72%", unhit_count: 36, advisor_count: 3,
      strategy: "把空间、配置、权益和使用场景串成到店体验理由，避免只报参数、不讲价值的表达方式。",
      recordings: [
        { advisor: "林涛", time: "3-25 14:00", id: "R-0310" },
        { advisor: "王萌", time: "3-24 15:30", id: "R-0293" },
        { advisor: "赵强", time: "3-23 11:20", id: "R-0280" }
      ]},
    { title: "竞品差异化对比", unhit_ratio: "68%", unhit_count: 31, advisor_count: 4,
      strategy: "准备固定竞品对比模板，用客观数据、配置差异和试驾体验点把客户拉回本品。",
      recordings: [
        { advisor: "李昱", time: "3-25 16:10", id: "R-0313" },
        { advisor: "林涛", time: "3-25 10:45", id: "R-0306" },
        { advisor: "王萌", time: "3-24 14:20", id: "R-0291" },
        { advisor: "赵强", time: "3-23 09:30", id: "R-0278" }
      ]},
    { title: "价格异议处理", unhit_ratio: "55%", unhit_count: 24, advisor_count: 2,
      strategy: "出现价格顾虑时先认同再拆解价值，并结合金融方案或权益包把顾虑转成到店详谈理由。",
      recordings: [
        { advisor: "林涛", time: "3-25 13:30", id: "R-0309" },
        { advisor: "张华", time: "3-24 09:50", id: "R-0287" }
      ]},
    { title: "版本配置引导", unhit_ratio: "45%", unhit_count: 18, advisor_count: 1,
      strategy: "根据预算、人数和关注配置快速锁定版本区间，帮助客户带着明确目标到店看车。",
      recordings: [
        { advisor: "林涛", time: "3-25 09:20", id: "R-0305" }
      ]},
    { title: "门店/公司优势未建立", unhit_ratio: "48%", unhit_count: 21, advisor_count: 3,
      strategy: "在接待开场补充门店服务能力、品牌保障和售后优势，帮助客户先建立信任。",
      recordings: [
        { advisor: "张华", time: "3-24 11:40", id: "R-0298" },
        { advisor: "赵强", time: "3-23 15:10", id: "R-0284" },
        { advisor: "林涛", time: "3-23 09:35", id: "R-0279" }
      ]},
    { title: "微信留资承接缺失", unhit_ratio: "45%", unhit_count: 19, advisor_count: 2,
      strategy: "在客户表达兴趣后及时提出添加微信，并明确后续发送的车型、报价或活动资料。",
      recordings: [
        { advisor: "林涛", time: "3-24 15:25", id: "R-0294" },
        { advisor: "王萌", time: "3-23 10:50", id: "R-0285" }
      ]},
    { title: "线索承接节奏断档", unhit_ratio: "42%", unhit_count: 17, advisor_count: 2,
      strategy: "在结束沟通前约定下一次联系时间和动作，避免线索跟进中断。",
      recordings: [
        { advisor: "张华", time: "3-24 14:35", id: "R-0297" },
        { advisor: "赵强", time: "3-23 16:20", id: "R-0286" }
      ]},
    { title: "到店邀约推进不足", unhit_ratio: "39%", unhit_count: 15, advisor_count: 2,
      strategy: "结合客户关注点给出明确到店理由，并提供可选择的到店时间。",
      recordings: [
        { advisor: "林涛", time: "3-24 10:30", id: "R-0299" },
        { advisor: "张华", time: "3-23 13:45", id: "R-0283" }
      ]},
    { title: "承诺边界表达不清", unhit_ratio: "35%", unhit_count: 12, advisor_count: 1,
      strategy: "涉及价格、权益和交付周期时明确说明适用条件，避免模糊或超权限承诺。",
      recordings: [
        { advisor: "林涛", time: "3-23 15:30", id: "R-0283" }
      ]}
  ];

  const strengthData = [
    { title: "深度需求挖掘", hit_ratio: "87%", hit_count: 46, advisor_count: 4,
      strategy: "沉淀高分录音中的需求追问句式，作为晨会示范样本，带动团队把预算、用途、换购原因问完整。",
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
      ]},
    { title: "门店/公司优势塑造", hit_ratio: "59%", hit_count: 29, advisor_count: 3,
      strategy: "沉淀门店服务、品牌保障与售后能力的标准表达，强化客户信任。",
      recordings: [
        { advisor: "王萌", time: "3-25 13:10", id: "R-0415" },
        { advisor: "李昱", time: "3-24 11:30", id: "R-0391" },
        { advisor: "韩宇", time: "3-23 16:40", id: "R-0378" }
      ]},
    { title: "微信留资承接", hit_ratio: "56%", hit_count: 26, advisor_count: 2,
      strategy: "复用自然提出添加微信并说明资料用途的优秀表达，提高后续触达效率。",
      recordings: [
        { advisor: "李昱", time: "3-25 15:20", id: "R-0416" },
        { advisor: "王萌", time: "3-24 12:10", id: "R-0399" }
      ]},
    { title: "留人稳线索", hit_ratio: "52%", hit_count: 23, advisor_count: 2,
      strategy: "保留通过确认客户顾虑、约定跟进动作稳定线索的高质量样本。",
      recordings: [
        { advisor: "韩宇", time: "3-25 12:40", id: "R-0417" },
        { advisor: "许明", time: "3-24 10:50", id: "R-0400" }
      ]},
    { title: "到店邀约推进", hit_ratio: "49%", hit_count: 21, advisor_count: 2,
      strategy: "提炼以客户关注点为到店理由、同时给出可选时段的邀约方式。",
      recordings: [
        { advisor: "李昱", time: "3-25 11:50", id: "R-0418" },
        { advisor: "张华", time: "3-24 15:40", id: "R-0402" }
      ]},
    { title: "承诺与风险边界", hit_ratio: "45%", hit_count: 19, advisor_count: 1,
      strategy: "推广对价格、权益和交付条件说明清晰的合规表达，避免过度承诺。",
      recordings: [
        { advisor: "许明", time: "3-25 10:10", id: "R-0419" }
      ]}
  ];

  const riskData = [
    { title: "辱骂/嘲讽客户", hit_count: 15, hit_ratio: "38%", advisor_count: 3,
      strategy: "明确辱骂、挖苦、阴阳怪气为零容忍红线，一经命中立即复盘并纳入行为整改。",
      recordings: [
        { advisor: "林涛", time: "3-25 16:20", id: "R-0314" },
        { advisor: "赵强", time: "3-24 15:10", id: "R-0292" },
        { advisor: "王萌", time: "3-24 11:30", id: "R-0290" }
      ]},
    { title: "明显不耐烦、催促打断客户", hit_count: 11, hit_ratio: "28%", advisor_count: 2,
      strategy: "出现抢话、催促、敷衍时必须回听复盘，训练停顿等待与完整倾听，避免压迫式沟通。",
      recordings: [
        { advisor: "林涛", time: "3-25 14:50", id: "R-0311" },
        { advisor: "赵强", time: "3-23 16:00", id: "R-0282" }
      ]},
    { title: "与客户争执、冲突", hit_count: 8, hit_ratio: "20%", advisor_count: 2,
      strategy: "禁止与客户进行情绪对抗，遇到异议先降温复述，再转入事实澄清与解决路径。",
      recordings: [
        { advisor: "林涛", time: "3-24 16:40", id: "R-0296" },
        { advisor: "张华", time: "3-23 14:20", id: "R-0281" }
      ]},
    { title: "客户明确表达不满后，销售未致歉", hit_count: 5, hit_ratio: "13%", advisor_count: 1,
      strategy: "客户明确表示不满意时，第一反应必须先致歉再解释，避免直接辩解或跳过情绪安抚。",
      recordings: [
        { advisor: "赵强", time: "3-24 10:00", id: "R-0288" }
      ]},
    { title: "出现问题，或是客户不满时，未及时表示歉意", hit_count: 2, hit_ratio: "5%", advisor_count: 1,
      strategy: "凡是服务失误、流程问题或客户不满场景，要求在 1 句话内先表达歉意，再给出处理动作。",
      recordings: [
        { advisor: "林涛", time: "3-23 15:30", id: "R-0283" }
      ]}
  ];

  // 客户洞察数据
  const intentModelData = [
    { model: "传祺 M8", count: 28, customerCount: 16, focus: [
        { name: "空间大适合家庭", count: 18, strategy: "重点展示第三排空间和座椅折叠灵活性，对比竞品空间数据。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }, { advisor: "张华", time: "3-24 14:00", id: "R-0388" }] },
        { name: "性价比高", count: 14, strategy: "突出同价位配置优势，用「配置清单对比法」量化价值差。", recordings: [{ advisor: "王萌", time: "3-25 11:20", id: "R-0403" }] },
        { name: "座椅舒适度", count: 10, strategy: "邀请客户体验零重力座椅，强调航空头等舱级座椅卖点。", recordings: [{ advisor: "李昱", time: "3-24 09:45", id: "R-0382" }] }
      ], resist: [
        { name: "油耗偏高", count: 12, strategy: "引导关注综合用车成本，用年均行驶里程计算实际油费差异。", recordings: [{ advisor: "林涛", time: "3-25 15:00", id: "R-0410" }, { advisor: "赵强", time: "3-24 16:20", id: "R-0395" }] },
        { name: "品牌认知度低", count: 9, strategy: "展示销量数据和用户口碑，引用第三方评测和获奖信息。", recordings: [{ advisor: "张华", time: "3-25 09:30", id: "R-0398" }] },
        { name: "保值率担忧", count: 7, strategy: "提供官方回购保障政策，展示二手车市场实际下订价参考。", recordings: [{ advisor: "王萌", time: "3-24 11:10", id: "R-0385" }] }
      ] },
    { model: "传祺 E9", count: 22, customerCount: 13, focus: [
        { name: "新能源免购置税", count: 15, strategy: "帮客户算清省税金额，对比燃油车落地价差异。", recordings: [{ advisor: "李昱", time: "3-25 14:20", id: "R-0408" }] },
        { name: "商务接待合适", count: 12, strategy: "强调车内静谧性和后排豪华感，示范商务场景使用。", recordings: [{ advisor: "张华", time: "3-24 15:40", id: "R-0392" }] },
        { name: "智能驾驶辅助", count: 8, strategy: "安排试驾体验L2+辅助驾驶，突出安全和便捷性。", recordings: [{ advisor: "王萌", time: "3-23 10:00", id: "R-0375" }] }
      ], resist: [
        { name: "充电不便", count: 10, strategy: "展示周边充电桩分布图，介绍家充桩安装服务和费用。", recordings: [{ advisor: "赵强", time: "3-25 11:50", id: "R-0404" }] },
        { name: "纯电续航焦虑", count: 8, strategy: "用客户日均通勤里程对比续航，证明覆盖率足够。", recordings: [{ advisor: "林涛", time: "3-24 13:30", id: "R-0389" }] },
        { name: "售后网点少", count: 5, strategy: "展示服务网点规划图和上门取送车服务说明。", recordings: [{ advisor: "张华", time: "3-23 16:00", id: "R-0380" }] }
      ] },
    { model: "传祺 GS8", count: 18, customerCount: 11, focus: [
        { name: "外观大气", count: 12, strategy: "引导客户近距离感受车身线条和灯组设计细节。", recordings: [{ advisor: "李昱", time: "3-25 09:00", id: "R-0397" }] },
        { name: "动力充足", count: 9, strategy: "安排山路或高速试驾路线，让客户亲身感受动力输出。", recordings: [{ advisor: "赵强", time: "3-24 10:30", id: "R-0383" }] },
        { name: "四驱系统", count: 7, strategy: "展示四驱演示视频和越野场景测试数据。", recordings: [{ advisor: "王萌", time: "3-23 14:00", id: "R-0377" }] }
      ], resist: [
        { name: "价格偏高", count: 8, strategy: "拆分配置价值，用「每日成本法」降低价格感知。", recordings: [{ advisor: "林涛", time: "3-25 13:00", id: "R-0406" }] },
        { name: "后排空间一般", count: 6, strategy: "邀请全家体验实车乘坐空间，弱化数据对比。", recordings: [{ advisor: "张华", time: "3-24 09:20", id: "R-0381" }] },
        { name: "竞品汉兰达更保值", count: 4, strategy: "承认竞品优势，转向强调本品配置和价格优势。", recordings: [{ advisor: "李昱", time: "3-23 11:30", id: "R-0376" }] }
      ] },
    { model: "传祺 影豹", count: 12, customerCount: 8, focus: [
        { name: "外观运动", count: 8, strategy: "突出运动套件设计，展示改装案例和用户分享。", recordings: [{ advisor: "王萌", time: "3-25 16:00", id: "R-0412" }] },
        { name: "年轻化设计", count: 6, strategy: "强调目标用户定位，展示年轻车主社群和活动。", recordings: [{ advisor: "赵强", time: "3-24 14:30", id: "R-0390" }] },
        { name: "操控好", count: 4, strategy: "安排弯道试驾体验，对比同级操控表现数据。", recordings: [{ advisor: "李昱", time: "3-23 09:00", id: "R-0372" }] }
      ], resist: [
        { name: "后排空间小", count: 5, strategy: "定位为个人座驾，弱化空间需求，强化驾驶乐趣。", recordings: [{ advisor: "林涛", time: "3-25 10:00", id: "R-0399" }] },
        { name: "品牌溢价不足", count: 3, strategy: "用配置和性能数据证明产品力，淡化品牌比较。", recordings: [{ advisor: "张华", time: "3-24 11:40", id: "R-0386" }] },
        { name: "首付压力大", count: 2, strategy: "主推低首付金融方案和分期免息活动。", recordings: [{ advisor: "王萌", time: "3-23 15:20", id: "R-0379" }] }
      ] },
    { model: "传祺 GS4", count: 9, customerCount: 6, focus: [
        { name: "价格亲民", count: 6, strategy: "强调入门即高配，展示同价位竞品配置差距。", recordings: [{ advisor: "赵强", time: "3-25 15:30", id: "R-0411" }] },
        { name: "配置丰富", count: 5, strategy: "逐项展示配置亮点，用配置表直观对比竞品。", recordings: [{ advisor: "李昱", time: "3-24 16:00", id: "R-0394" }] },
        { name: "油耗低", count: 3, strategy: "展示实测油耗数据和车主实际油耗反馈。", recordings: [{ advisor: "林涛", time: "3-23 10:30", id: "R-0374" }] }
      ], resist: [
        { name: "动力偏弱", count: 4, strategy: "引导关注日常驾驶够用性，强调平顺和燃油经济性。", recordings: [{ advisor: "张华", time: "3-25 14:00", id: "R-0407" }] },
        { name: "内饰质感一般", count: 2, strategy: "展示内饰升级改款，强调实用性和耐用性。", recordings: [{ advisor: "王萌", time: "3-24 13:00", id: "R-0387" }] }
      ] }
  ];
  const competeModelData = [
    { model: "丰田 汉兰达", count: 15, customerCount: 9, advantages: [
        { name: "保值率高", count: 10, strategy: "提供官方回购保障政策，展示本品二手车实际下订价数据，用总持有成本对比弱化保值率差异。", recordings: [{ advisor: "林涛", time: "3-25 15:20", id: "R-0312" }, { advisor: "张华", time: "3-25 11:05", id: "R-0308" }] },
        { name: "质量稳定", count: 8, strategy: "引用第三方质量评测（如J.D. Power排名），展示本品近三年故障率下降数据。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] },
        { name: "品牌影响力强", count: 7, strategy: "承认品牌优势，转向强调本品配置优势和性价比，用「同价更高配」量化。", recordings: [{ advisor: "赵强", time: "3-24 10:15", id: "R-0289" }] },
        { name: "空间大", count: 5, strategy: "邀请客户实车对比第三排空间，用腿部空间数据（+12cm）做差异化。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] }
      ], counters: [
        { name: "配置差距大", count: 12, strategy: "制作同价位配置清单对比表（安全/智能/舒适三维度），逐项展示本品优势。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "价格更有竞争力", count: 9, strategy: "用落地价+金融方案做总成本对比，突出免购置税/低月供等优势。", recordings: [{ advisor: "李昱", time: "3-25 16:10", id: "R-0313" }] },
        { name: "智能化领先", count: 6, strategy: "安排试驾体验L2+辅助驾驶和智能座舱，形成体验差记忆。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] }
      ] },
    { model: "比亚迪 唐DM-i", count: 12, customerCount: 7, advantages: [
        { name: "新能源政策好", count: 8, strategy: "承认政策优势，引导关注本品同样享受的新能源补贴和免税政策。", recordings: [{ advisor: "赵强", time: "3-24 16:20", id: "R-0295" }] },
        { name: "油耗低", count: 7, strategy: "用本品实测油耗数据对比，强调混动/纯电模式下的综合用车成本优势。", recordings: [{ advisor: "张华", time: "3-24 09:50", id: "R-0287" }] },
        { name: "配置丰富", count: 6, strategy: "选取安全配置和智能驾驶两个维度做精准对比，避免全面铺开。", recordings: [{ advisor: "林涛", time: "3-25 14:00", id: "R-0310" }] },
        { name: "价格有竞争力", count: 5, strategy: "用「配置价值拆解法」计算单项配置价值差，证明本品性价比更高。", recordings: [{ advisor: "李昱", time: "3-25 16:10", id: "R-0313" }] }
      ], counters: [
        { name: "品质做工优势", count: 9, strategy: "邀请客户触摸对比内饰用料、缝线工艺，用感官体验建立品质认知。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "空间舒适度", count: 7, strategy: "邀请全家体验乘坐空间，重点展示二三排座椅的舒适性差异。", recordings: [{ advisor: "王萌", time: "3-24 11:10", id: "R-0293" }] },
        { name: "售后服务网络", count: 4, strategy: "展示本品4S店分布密度和上门取送车服务，弱化对手渠道优势。", recordings: [{ advisor: "张华", time: "3-24 14:00", id: "R-0308" }] }
      ] },
    { model: "别克 GL8", count: 10, customerCount: 6, advantages: [
        { name: "商务标杆", count: 7, strategy: "承认商务定位，转向展示本品在家商兼顾场景下的差异化优势。", recordings: [{ advisor: "林涛", time: "3-25 15:20", id: "R-0312" }] },
        { name: "空间灵活", count: 5, strategy: "用第三排平整度和后备箱容积数据做精准对比，本品座椅放倒后纯平是核心差异。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "品牌认知度高", count: 4, strategy: "展示本品销量增长趋势和用户口碑评分，用数据建立信心。", recordings: [{ advisor: "赵强", time: "3-23 11:20", id: "R-0280" }] }
      ], counters: [
        { name: "新能源优势", count: 8, strategy: "GL8无纯电/混动版本，本品新能源路线在政策和用车成本上有结构性优势。", recordings: [{ advisor: "李昱", time: "3-25 16:10", id: "R-0313" }] },
        { name: "智能化代差", count: 6, strategy: "安排智能座舱和辅助驾驶功能体验，GL8在智能化上明显落后。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] },
        { name: "座椅舒适度", count: 5, strategy: "邀请客户体验零重力座椅，GL8高配才有的功能本品标配。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] }
      ] },
    { model: "本田 CR-V", count: 8, customerCount: 5, advantages: [
        { name: "省油", count: 5, strategy: "用本品实测油耗和年均油费对比，混动版本油耗差距已大幅缩小。", recordings: [{ advisor: "林涛", time: "3-25 09:20", id: "R-0312" }] },
        { name: "品质可靠", count: 4, strategy: "引用本品质保政策（更长年限/里程）和故障率数据，建立品质信心。", recordings: [{ advisor: "张华", time: "3-24 09:50", id: "R-0287" }] },
        { name: "二手保值", count: 3, strategy: "提供本品官方回购政策和二手车平台实际挂牌价数据。", recordings: [{ advisor: "王萌", time: "3-24 11:10", id: "R-0293" }] }
      ], counters: [
        { name: "空间碾压", count: 6, strategy: "CR-V是紧凑SUV，从车身尺寸到后排空间全面落后，邀请实车对比体验。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "配置差距", count: 5, strategy: "同价位配置清单对比，本品在安全和智能配置上有代差优势。", recordings: [{ advisor: "赵强", time: "3-24 10:15", id: "R-0289" }] }
      ] },
    { model: "理想 L7", count: 6, customerCount: 4, advantages: [
        { name: "增程无续航焦虑", count: 4, strategy: "承认增程优势，转向展示本品充电网络建设进展和家充桩安装便捷性。", recordings: [{ advisor: "赵强", time: "3-24 16:20", id: "R-0295" }] },
        { name: "智能座舱", count: 3, strategy: "安排智能座舱功能PK体验，展示本品差异化的智能功能亮点。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] },
        { name: "家庭用车首选", count: 2, strategy: "用本品三排座布局 vs L7 两排座做空间维度差异化。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] }
      ], counters: [
        { name: "价格优势大", count: 5, strategy: "L7起售价高出本品10万+，用落地价差做性价比对比，强调「够用即最优」。", recordings: [{ advisor: "李昱", time: "3-25 16:10", id: "R-0313" }] },
        { name: "售后服务成熟", count: 3, strategy: "本品4S店全国覆盖更广，维保便捷性和配件供应更稳定。", recordings: [{ advisor: "张华", time: "3-25 11:05", id: "R-0308" }] }
      ] }
  ];
  const modelTagData = {
    M8: {
      positive: [
        { name: "空间大", count: 35, customerCount: 20, strategy: "重点展示第三排空间和座椅折叠灵活性。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "座椅舒适", count: 28, customerCount: 16, strategy: "邀请全家实车体验零重力座椅，强调头等舱级舒适。", recordings: [{ advisor: "张华", time: "3-24 14:00", id: "R-0388" }] },
        { name: "性价比高", count: 22, customerCount: 14, strategy: "突出同价位配置优势，用「配置清单对比法」量化价值差。", recordings: [{ advisor: "王萌", time: "3-25 11:20", id: "R-0403" }] },
        { name: "外观大气", count: 18, customerCount: 11, strategy: "引导客户近距离感受车身线条和灯组设计细节。", recordings: [] },
        { name: "配置丰富", count: 15, customerCount: 9, strategy: "逐项展示配置亮点，用配置表直观对比同级竞品。", recordings: [{ advisor: "赵强", time: "3-24 10:15", id: "R-0289" }] }
      ],
      negative: [
        { name: "油耗偏高", count: 20, customerCount: 13, strategy: "引导关注综合用车成本，用年均行驶里程计算实际油费差异。", recordings: [{ advisor: "林涛", time: "3-25 15:00", id: "R-0410" }] },
        { name: "品牌认知低", count: 16, customerCount: 10, strategy: "展示销量数据和用户口碑，引用第三方评测和获奖信息。", recordings: [{ advisor: "张华", time: "3-25 09:30", id: "R-0398" }] },
        { name: "保值率担忧", count: 14, customerCount: 8, strategy: "提供官方回购保障政策，展示二手车市场实际参考价。", recordings: [{ advisor: "王萌", time: "3-24 11:10", id: "R-0385" }] },
        { name: "价格敏感", count: 12, customerCount: 7, strategy: "主推低首付金融方案和本月专项免息活动。", recordings: [{ advisor: "李昱", time: "3-25 16:10", id: "R-0313" }] },
        { name: "售后网点少", count: 8, customerCount: 5, strategy: "展示服务网点规划图和上门取送车服务说明。", recordings: [{ advisor: "张华", time: "3-23 16:00", id: "R-0380" }] }
      ],
      neutral: [
        { name: "三口之家", count: 25, customerCount: 15, strategy: "介绍车内大空间和儿童安全座椅接口。", recordings: [{ advisor: "林涛", time: "3-25 10:00", id: "R-0399" }] },
        { name: "商务接待", count: 18, customerCount: 12, strategy: "展示独立空调、小桌板及私密隔音。", recordings: [{ advisor: "张华", time: "3-24 15:40", id: "R-0392" }] },
        { name: "二胎家庭", count: 15, customerCount: 9, strategy: "强调第三排空间平整及灵活储物。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "自驾游", count: 10, customerCount: 6, strategy: "介绍后备箱大空间及外放电功能。", recordings: [{ advisor: "王萌", time: "3-23 10:00", id: "R-0375" }] }
      ]
    },
    S7: {
      positive: [{ name: "智能座舱", count: 30, customerCount: 22, strategy: "安排智能座舱专项体验，着重演示语音免唤醒和车机交互。", recordings: [{ advisor: "林涛", time: "3-25 14:00", id: "R-0310" }] }, { name: "续航够用", count: 24, customerCount: 17 }, { name: "外观时尚", count: 20, customerCount: 15 }, { name: "动力充沛", count: 16, customerCount: 11 }, { name: "科技感强", count: 12, customerCount: 8 }],
      negative: [{ name: "充电不便", count: 18, customerCount: 12, strategy: "展示周边快充站分布，主推购车赠送家充桩安装服务。", recordings: [{ advisor: "赵强", time: "3-25 11:50", id: "R-0404" }] }, { name: "空间不足", count: 15, customerCount: 10 }, { name: "价格偏高", count: 13, customerCount: 9 }, { name: "续航焦虑", count: 10, customerCount: 6 }, { name: "等车周期长", count: 7, customerCount: 4 }],
      neutral: [
        { name: "年轻用户", count: 22, customerCount: 16, strategy: "重点突出智能科技和车机生态。", recordings: [{ advisor: "林涛", time: "3-25 10:00", id: "R-0399" }] },
        { name: "家用通勤", count: 16, customerCount: 11, strategy: "算一笔通勤成本账，突出省钱属性。", recordings: [{ advisor: "张华", time: "3-24 09:50", id: "R-0287" }] },
        { name: "首次购车", count: 12, customerCount: 9, strategy: "提供全流程一对一购车指导服务，降低防备心理。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] },
        { name: "新能源偏好", count: 10, customerCount: 6, strategy: "探讨充电网络布局和新一代三电技术。", recordings: [{ advisor: "赵强", time: "3-24 10:15", id: "R-0289" }] }
      ]
    },
    GS8: {
      positive: [{ name: "外观大气", count: 26, customerCount: 18, strategy: "重点绕车介绍霸气前脸和车身比例。", recordings: [{ advisor: "李昱", time: "3-25 09:00", id: "R-0397" }] }, { name: "四驱系统", count: 22, customerCount: 15 }, { name: "空间宽敞", count: 19, customerCount: 12 }, { name: "动力足", count: 15, customerCount: 10 }, { name: "安全配置高", count: 11, customerCount: 7 }],
      negative: [{ name: "价格偏高", count: 17, customerCount: 11, strategy: "拆解配置价值，强调同价位没有比它更大的真七座。", recordings: [{ advisor: "林涛", time: "3-25 13:00", id: "R-0406" }] }, { name: "汉兰达更保值", count: 14, customerCount: 9 }, { name: "后排空间一般", count: 11, customerCount: 7 }, { name: "油耗担忧", count: 9, customerCount: 5 }],
      neutral: [
        { name: "二胎家庭", count: 20, customerCount: 14, strategy: "示范三排无障碍进出以及后备箱放双推车。", recordings: [{ advisor: "李昱", time: "3-25 10:30", id: "R-0401" }] },
        { name: "自驾游需求", count: 14, customerCount: 9, strategy: "邀请长距离高速试驾，体验L2智驾降低疲劳。", recordings: [{ advisor: "王萌", time: "3-23 10:00", id: "R-0375" }] },
        { name: "增购换购", count: 10, customerCount: 7, strategy: "提供限时高额置换补贴方案刺激下订。", recordings: [{ advisor: "赵强", time: "3-25 15:30", id: "R-0411" }] }
      ]
    },
    E8: {
      positive: [{ name: "新能源免税", count: 28, customerCount: 19, strategy: "帮客户对比燃油车购置税和牌照费，直观展现落地成本优势。", recordings: [{ advisor: "李昱", time: "3-25 14:20", id: "R-0408" }] }, { name: "智能驾驶", count: 23, customerCount: 16 }, { name: "外观潮流", count: 18, customerCount: 12 }, { name: "降本省油", count: 14, customerCount: 9 }, { name: "配置超预期", count: 10, customerCount: 7 }],
      negative: [{ name: "续航焦虑", count: 16, customerCount: 11, strategy: "计算客户日常通勤距离，论证当前电池覆盖率足以满足多数需求。", recordings: [{ advisor: "王萌", time: "3-24 15:30", id: "R-0293" }] }, { name: "充电设施少", count: 13, customerCount: 8 }, { name: "品牌认知低", count: 10, customerCount: 7 }, { name: "保值率不确定", count: 8, customerCount: 5 }],
      neutral: [
        { name: "年轻家庭", count: 18, customerCount: 12, strategy: "强调潮人座驾属性和露营功能拓展性。", recordings: [{ advisor: "林涛", time: "3-25 10:00", id: "R-0399" }] },
        { name: "网约司机", count: 12, customerCount: 8, strategy: "着重计算每公里成本，提供网约版灵活金融方案。", recordings: [{ advisor: "张华", time: "3-24 14:00", id: "R-0388" }] },
        { name: "环保意识", count: 9, customerCount: 6, strategy: "展示环保内饰材料认证，主推无异味健康座舱。", recordings: [{ advisor: "李昱", time: "3-23 09:00", id: "R-0372" }] }
      ]
    }
  };

  // ── 2. 全局状态 ──────────────────────────────
  let currentRole = "all";
  let currentSource = SOURCE_KEYS.all;
  let currentScenes = [SCENE_KEYS.all];
  let currentTime = "1";
  let currentModel = "all";
  let currentFilter = "all";
  let currentClientTimeMode = "followup";
  let currentSort = { key: 'qa_pass', desc: true };
  let advisorPaginationState = { page: 1, pageSize: 10 };
  let storeTimeStartDate = "";
  let storeTimeEndDate = "";
  const storeTeamSummaryState = {
    generated: false,
    generating: false,
    generateTimer: null,
    typingTimer: null,
    typingDone: false,
    lastText: ''
  };

  const storeTimeRangeOptions = [
    { key: "1", label: "昨日" },
    { key: "7", label: "近7天" },
    { key: "15", label: "近半月" },
    { key: "30", label: "近1月" },
    { key: "custom", label: "自定义" }
  ];
  const storeTimeShortcutOptions = storeTimeRangeOptions.filter((option) => option.key !== "custom");
  const storeDateState = {
    open: false,
    activeField: "startDate",
    draftStartDate: "",
    draftEndDate: "",
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth() + 1
  };
  const renderSharedDateRangeControlMarkup = (
    typeof globalThis !== "undefined"
      && globalThis.__dateFilterComponentUtils
      && typeof globalThis.__dateFilterComponentUtils.renderDateRangeControlMarkup === "function"
  )
    ? globalThis.__dateFilterComponentUtils.renderDateRangeControlMarkup
    : ({ currentValue, customValue = "custom", isOpen, startLabel, endLabel, dataNamespace = "store-date", rootClassName = "store-date-root", triggerClassName = "session-date-trigger store-date-trigger", triggerLabel = "日期范围筛选", menuHtml }) => {
      if (currentValue !== customValue) {
        return "";
      }

      return `
        <div class="${rootClassName}${isOpen ? " is-open" : ""}" data-${dataNamespace}-root="true">
          <button
            type="button"
            class="${triggerClassName}${isOpen ? " active" : ""}"
            data-${dataNamespace}-trigger="true"
            aria-label="${triggerLabel}"
            aria-haspopup="dialog"
            aria-expanded="${isOpen ? "true" : "false"}"
          >
            <strong>${escapeHtml(startLabel || "未选择")}</strong>
            <em>至</em>
            <strong>${escapeHtml(endLabel || "未选择")}</strong>
            <span class="session-date-icon" aria-hidden="true"></span>
          </button>
          ${isOpen ? String(menuHtml || "") : ""}
        </div>
      `;
    };
  const renderSharedDateRangePanelMarkup = (
    typeof globalThis !== "undefined"
      && globalThis.__dateFilterComponentUtils
      && typeof globalThis.__dateFilterComponentUtils.renderDateRangePanelMarkup === "function"
  )
    ? globalThis.__dateFilterComponentUtils.renderDateRangePanelMarkup
    : ({ dataNamespace = "session-date", rangeText = "", monthLabel = "", activeField = "startDate", startLabel = "", endLabel = "", disablePrevMonth = false, disableNextMonth = false, cells = [], shortcuts = [], summaryText = "", panelClassName = "session-menu-panel session-menu-panel-date", panelStyle = "", title = "日期范围", startFieldLabel = "开始日期", endFieldLabel = "结束日期", cancelLabel = "取消", applyLabel = "应用日期" }) => {
      const safeSummaryText = summaryText || `已选择 ${rangeText}`;
      const panelStyleAttr = panelStyle ? ` style="${escapeHtml(panelStyle)}"` : "";
      return `
        <div class="${panelClassName}"${panelStyleAttr}>
          <div class="session-date-panel-head">
            <div class="session-date-panel-copy">
              <span>${escapeHtml(title)}</span>
              <strong>${escapeHtml(rangeText)}</strong>
            </div>
            <div class="session-date-nav">
              <button type="button" class="session-date-nav-btn" data-${dataNamespace}-nav="-1" aria-label="上一个月"${disablePrevMonth ? " disabled" : ""}>
                <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
              </button>
              <strong>${escapeHtml(monthLabel)}</strong>
              <button type="button" class="session-date-nav-btn" data-${dataNamespace}-nav="1" aria-label="下一个月"${disableNextMonth ? " disabled" : ""}>
                <i class="session-date-nav-arrow next" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <div class="session-date-tabs">
            <button type="button" class="session-date-tab${activeField === "startDate" ? " active" : ""}" data-${dataNamespace}-field="startDate">
              <span>${escapeHtml(startFieldLabel)}</span>
              <strong>${escapeHtml(startLabel)}</strong>
            </button>
            <button type="button" class="session-date-tab${activeField === "endDate" ? " active" : ""}" data-${dataNamespace}-field="endDate">
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
              const classNames = ["session-date-day"];
              if (cell.isDisabled) classNames.push("is-disabled");
              if (cell.inRange) classNames.push("in-range");
              if (cell.isStart) classNames.push("is-start");
              if (cell.isEnd) classNames.push("is-end");
              if (cell.isToday) classNames.push("is-today");
              return `
                <button
                  type="button"
                  class="${classNames.join(" ")}"
                  ${cell.isDisabled ? "disabled" : `data-${dataNamespace}-value="${escapeHtml(cell.value)}"`}
                >
                  ${escapeHtml(cell.day)}
                </button>
              `;
            }).join("")}
          </div>
          <div class="session-date-shortcuts">
            ${shortcuts.map((option) => `
              <button type="button" class="session-date-shortcut" data-${dataNamespace}-shortcut="${escapeHtml(option.key)}">${escapeHtml(option.label)}</button>
            `).join("")}
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
  const renderStoreDateControlMarkup = ({ currentTime: timeValue, isOpen, startLabel, endLabel, menuHtml }) => renderSharedDateRangeControlMarkup({
    currentValue: timeValue,
    customValue: "custom",
    isOpen,
    startLabel,
    endLabel,
    dataNamespace: "store-date",
    rootClassName: "store-date-root",
    triggerClassName: "session-date-trigger store-date-trigger",
    triggerLabel: "日期范围筛选",
    menuHtml
  });

  // ── 3. 渲染顶部时间 ───────────────────────────
  const updateTime = () => {
    const el = document.getElementById("topbar-time");
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  };
  updateTime();
  setInterval(updateTime, 1000);

  const getStoreFilterLabel = (value, fallback = '全部') => value === 'all' ? fallback : value;
  const getStoreSceneSelection = () => normalizeSceneSelection(currentSource, currentScenes);
  const getEffectiveSceneKey = () => getStoreSceneSelection().effectiveSceneKey;
  const getLegacySceneKey = () => getStoreSceneSelection().legacySceneBucket;
  const getStoreSceneLabel = () => {
    const selection = getStoreSceneSelection();
    if (selection.isAllSelected) return '全场景';
    if (selection.isNoneSelected) return '未选择场景';
    return selection.activeScenes.map(getSceneLabel).join(' / ');
  };

  const getStoreTimeLabel = () => {
    const option = storeTimeRangeOptions.find(item => item.key === currentTime);
    if (currentTime === 'custom') {
      const start = storeTimeStartDate ? formatSessionDateDisplay(storeTimeStartDate) : '未选择';
      const end = storeTimeEndDate ? formatSessionDateDisplay(storeTimeEndDate) : '未选择';
      return `${start} 至 ${end}`;
    }
    return option?.label || '昨日';
  };

  const getStoreTeamSummaryText = () => {
    const scopeParts = [
      getStoreTimeLabel(),
      getStoreFilterLabel(currentRole, '全员'),
      getStoreSceneLabel(),
      getStoreFilterLabel(currentModel, '全车系')
    ];
    const scopeText = scopeParts.join(' · ');

    const sceneKey = getEffectiveSceneKey();
    const sceneSummaryMap = {
      all: '全店接待整体平稳，服务态度与进店接待表现良好，但试驾邀约与竞品应对仍是主要短板。',
      first_follow: '首触跟进的开场需求确认整体稳定，但早段利益点铺垫仍偏弱。',
      invite_store: '邀约进店场景的到店推进更关键，建议强化明确时间与到店收益表达。',
      schedule_confirm: '排程确认更依赖时间承诺与到店前提醒，建议重点复盘确认节点。',
      cloud_multi: '云外呼多个环节表现存在波动，建议按首触、邀约、排程三个节点拆开复盘。',
      store_reception: '进店接待过程中的礼貌开场和需求确认表现较好，但车型卖点承接与异议处理深度仍需加强。',
      test_drive: '试乘试驾环节体验介绍更充分，但试驾前场景铺垫和试驾后下订推进存在断点。'
    };
    const roleSummaryMap = {
      all: '建议店长围绕共性短板做集中复盘，并同步跟进高风险录音样本。',
      '邀约专员': '建议优先强化邀约确认、到店利益点包装和沉默客户二次触达话术。',
      '销售顾问': '建议重点辅导需求挖掘、竞品对比和试驾后报价承接，减少转化链路流失。'
    };
    const modelSummaryMap = {
      all: '车型维度暂无明显单点异常，可按客群类型拆分训练素材。',
      M8: 'M8 客户对空间和商务场景关注度高，建议增加家庭与商务双场景价值拆解。',
      S7: 'S7 客户更关注智能化和价格感知，建议用配置差异和金融方案降低决策阻力。',
      GS8: 'GS8 客户常对油耗和保值率提出异议，建议统一竞品对比与长期用车成本话术。',
      E8: 'E8 客户集中关注续航、充电和新能源政策，建议强化补能场景与政策权益说明。'
    };
    const timeSummaryMap = {
      '1': '今日可先抽取昨日低分样本做 15 分钟快复盘。',
      '7': '近 7 天样本已能反映稳定趋势，适合安排本周专项训练。',
      '15': '近半月波动显示短板有持续性，建议拆到顾问个人维度逐项跟进。',
      '30': '近 1 月数据适合沉淀标准话术包，并复盘训练前后的改善幅度。',
      custom: '自定义时间范围内请结合活动节奏看转化变化，避免只用单日样本判断。'
    };

    return `${scopeText}：${sceneSummaryMap[sceneKey] || sceneSummaryMap.all}${roleSummaryMap[currentRole] || roleSummaryMap.all}${modelSummaryMap[currentModel] || modelSummaryMap.all}${timeSummaryMap[currentTime] || timeSummaryMap['1']}`;
  };

  const getStoreTeamSummaryPlaceholderHtml = () => `
    <div class="team-ai-summary-content team-ai-summary-content-obscured team-ai-summary-content-placeholder">
      <div class="team-ai-placeholder-line">系统将基于当前筛选条件下的顾问接待、录音质检、客户反馈和转化节点，自动生成团队效能总评。</div>
      <div class="team-ai-placeholder-line">内容会覆盖质检合格率变化、关键话术薄弱项、风险录音分布以及影响门店转化的核心原因。</div>
      <div class="team-ai-placeholder-line">生成后可结合短板改善项和SOP执行排行，快速定位本周需要专项辅导的动作。</div>
    </div>
    <div class="team-ai-summary-overlay" aria-hidden="true"></div>
  `;

  const clearStoreTeamSummaryTypingTimer = () => {
    if (storeTeamSummaryState.typingTimer) {
      window.clearInterval(storeTeamSummaryState.typingTimer);
      storeTeamSummaryState.typingTimer = null;
    }
  };

  const renderStoreTeamSummaryStatic = (summaryNode, summaryText) => {
    summaryNode.innerHTML = `<div class="team-ai-summary-content">${escapeHtml(summaryText)}</div>`;
  };

  const startStoreTeamSummaryTyping = (summaryNode, summaryText) => {
    clearStoreTeamSummaryTypingTimer();
    const fullText = String(summaryText || '');
    storeTeamSummaryState.typingDone = false;
    storeTeamSummaryState.lastText = fullText;

    if (!fullText) {
      renderStoreTeamSummaryStatic(summaryNode, '');
      storeTeamSummaryState.typingDone = true;
      return;
    }

    let visibleLength = 0;
    const typingInterval = 26;
    const step = () => {
      if (!document.body.contains(summaryNode)) {
        clearStoreTeamSummaryTypingTimer();
        storeTeamSummaryState.typingDone = false;
        return;
      }

      visibleLength = Math.min(fullText.length, visibleLength + 1);
      summaryNode.innerHTML = `
        <div class="team-ai-summary-content team-ai-summary-content-typing">
          ${escapeHtml(fullText.slice(0, visibleLength))}<span class="team-ai-typing-caret" aria-hidden="true"></span>
        </div>
      `;

      if (visibleLength >= fullText.length) {
        clearStoreTeamSummaryTypingTimer();
        storeTeamSummaryState.typingDone = true;
        renderStoreTeamSummaryStatic(summaryNode, fullText);
      }
    };

    step();
    if (visibleLength < fullText.length) {
      storeTeamSummaryState.typingTimer = window.setInterval(step, typingInterval);
    }
  };

  const renderStoreTeamSummary = () => {
    const summaryNode = document.getElementById('team-ai-summary');
    if (!summaryNode) return;

    const summaryText = getStoreTeamSummaryText();
    if (storeTeamSummaryState.generated) {
      summaryNode.classList.remove('is-obscured');
      if (storeTeamSummaryState.typingDone && storeTeamSummaryState.lastText === summaryText) {
        renderStoreTeamSummaryStatic(summaryNode, summaryText);
      } else {
        startStoreTeamSummaryTyping(summaryNode, summaryText);
      }
      return;
    }

    summaryNode.classList.add('is-obscured');
    if (storeTeamSummaryState.generating) {
      summaryNode.innerHTML = `
        ${getStoreTeamSummaryPlaceholderHtml()}
        <div class="team-ai-generate-loading" aria-live="polite" role="status">
          <span class="team-ai-loading-spinner" aria-hidden="true"></span>
          <span>生成中...</span>
        </div>
      `;
    } else {
      summaryNode.innerHTML = `
        ${getStoreTeamSummaryPlaceholderHtml()}
        <button type="button" class="btn-primary team-ai-generate-btn" data-store-team-summary-generate>立即生成</button>
      `;
    }
  };

  const resetStoreTeamSummaryState = (options = {}) => {
    if (storeTeamSummaryState.generateTimer) {
      window.clearTimeout(storeTeamSummaryState.generateTimer);
    }
    clearStoreTeamSummaryTypingTimer();
    storeTeamSummaryState.generated = false;
    storeTeamSummaryState.generating = false;
    storeTeamSummaryState.generateTimer = null;
    storeTeamSummaryState.typingDone = false;
    storeTeamSummaryState.lastText = '';
    if (options.render !== false) {
      renderStoreTeamSummary();
    }
  };

  // ══════════════════════════════════════════════
  // 4. 指标定义系统（? 图标 + 弹窗）
  // ══════════════════════════════════════════════
  const METRIC_DEFS = {
    '到店率':        '邀约客户中实际到店的比例（到店数 ÷ 邀约录音数）',
    '试驾率':        '到店客户中完成试驾的比例（试驾录音数 ÷ 接待录音数）',
    '下订率':        '到店客户中完成下订的比例（下订数 ÷ 接待录音数）',
    '有效录音':      '质检系统判定为有效互动（邀约成功或多轮对话）的录音条数',
    '话术执行率':    '顾问在录音中命中 SOP 话术的比率（命中项 ÷ 质检项）',
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
    'SOP单项命中率': '各 SOP 话术项的未命中率，数值越低代表执行越好'
  };

  const metricBtn = (label) => {
    if (!METRIC_DEFS[label]) return '';
    return `<button type="button" class="metric-def-btn" onclick="event.stopPropagation()" aria-label="${label}指标说明">?<span class="metric-def-tooltip" role="tooltip">${METRIC_DEFS[label]}</span></button>`;
  };

  // ══════════════════════════════════════════════
  // 4. 渲染 Hero KPI（独立卡片布局，对齐销售看板）
  // ══════════════════════════════════════════════
  const trendBadge = (trend, dir, options = {}) => {
    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';
    const val = trend.replace(/[↑↓]/g, '');
    const extraClass = options.riskTrend ? ' risk-trend' : '';
    return `<span class="hm-trend ${dir}${extraClass}">${arrow}${val}</span>`;
  };

  const storeHeroCounterFrames = new Set();

  const clearStoreHeroCounterAnimations = () => {
    storeHeroCounterFrames.forEach((frameId) => cancelAnimationFrame(frameId));
    storeHeroCounterFrames.clear();
  };

  const parseStoreHeroCounterMeta = (rawValue) => {
    const text = String(rawValue ?? '').trim();
    const match = text.match(/^([^0-9+-]*)([-+]?\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
      return null;
    }

    const numericText = match[2];
    return {
      prefix: match[1] || '',
      target: Number(numericText),
      decimals: (numericText.split('.')[1] || '').length,
      suffix: match[3] || ''
    };
  };

  const formatStoreHeroCounterValue = (value, decimals) => {
    if (decimals > 0) {
      return Number(value).toFixed(decimals);
    }
    return String(Math.round(value));
  };

  const buildStoreHeroCounterDisplay = (valueText, options = {}) => {
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    const unit = options.unit || '';
    const safeMain = `${escapeHtml(prefix)}${escapeHtml(valueText)}`;

    if (unit) {
      return `${safeMain}<small>${escapeHtml(unit)}</small>`;
    }

    if (suffix === '%') {
      return `${safeMain}<small>${escapeHtml(suffix)}</small>`;
    }

    return `${safeMain}${escapeHtml(suffix)}`;
  };

  const buildStoreHeroCounterAttrs = (rawValue, unit = '') => {
    const meta = parseStoreHeroCounterMeta(rawValue);
    if (!meta || !Number.isFinite(meta.target)) {
      return '';
    }

    return [
      `data-store-count-target="${meta.target}"`,
      `data-store-count-decimals="${meta.decimals}"`,
      meta.prefix ? `data-store-count-prefix="${escapeHtml(meta.prefix)}"` : '',
      meta.suffix ? `data-store-count-suffix="${escapeHtml(meta.suffix)}"` : '',
      unit ? `data-store-count-unit="${escapeHtml(unit)}"` : ''
    ].filter(Boolean).join(' ');
  };

  const renderStoreHeroCounterValue = (rawValue, unit = '') => {
    const meta = parseStoreHeroCounterMeta(rawValue);
    if (!meta || !Number.isFinite(meta.target)) {
      return `${escapeHtml(rawValue)}${unit ? `<small>${escapeHtml(unit)}</small>` : ''}`;
    }

    return buildStoreHeroCounterDisplay(formatStoreHeroCounterValue(meta.target, meta.decimals), {
      prefix: meta.prefix,
      suffix: meta.suffix,
      unit
    });
  };

  const setStoreHeroCounterDisplay = (node, value) => {
    if (!node) {
      return;
    }

    const decimals = Number(node.dataset.storeCountDecimals || 0);
    const prefix = node.dataset.storeCountPrefix || '';
    const suffix = node.dataset.storeCountSuffix || '';
    const unit = node.dataset.storeCountUnit || '';
    const displayValue = formatStoreHeroCounterValue(value, decimals);
    node.innerHTML = buildStoreHeroCounterDisplay(displayValue, { prefix, suffix, unit });
  };

  const animateStoreHeroCounterNode = (node, options = {}) => {
    if (!node) {
      return;
    }

    const target = Number(node.dataset.storeCountTarget);
    if (!Number.isFinite(target)) {
      return;
    }

    const duration = options.duration ?? 920;
    const delay = options.delay ?? 0;
    const startValue = options.startValue ?? 0;
    const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3);
    let frameId = 0;
    let animationStart = null;

    const scheduleFrame = () => {
      frameId = requestAnimationFrame(step);
      storeHeroCounterFrames.add(frameId);
    };

    const step = (timestamp) => {
      storeHeroCounterFrames.delete(frameId);

      if (animationStart === null) {
        animationStart = timestamp + delay;
      }

      if (timestamp < animationStart) {
        scheduleFrame();
        return;
      }

      const progress = Math.min((timestamp - animationStart) / duration, 1);
      const currentValue = startValue + ((target - startValue) * easeOutCubic(progress));
      setStoreHeroCounterDisplay(node, currentValue);

      if (progress < 1) {
        scheduleFrame();
        return;
      }

      setStoreHeroCounterDisplay(node, target);
    };

    setStoreHeroCounterDisplay(node, startValue);
    scheduleFrame();
  };

  const animateStoreHeroCounters = (root) => {
    if (!root) {
      return;
    }

    clearStoreHeroCounterAnimations();
    [...root.querySelectorAll('[data-store-count-target]')].forEach((node, index) => {
      animateStoreHeroCounterNode(node, {
        delay: 80 + (index * 55),
        duration: 920
      });
    });
  };

  const GROUPED_HERO_METRIC_KEYS = new Set([
    'invitation',
    'reception',
    'test_drive',
    'qa_pass_count',
    'risk_record'
  ]);
  const SUMMARY_GROUP_METRIC_KEYS = new Set([
    'invitation',
    'reception',
    'test_drive'
  ]);
  const FLOW_TONE_RGB = {
    blue: '37, 99, 235',
    cyan: '8, 145, 178',
    green: '16, 185, 129'
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
        <span class="hm-value ${valueClass}" ${buildStoreHeroCounterAttrs(metric.num, metric.unit)}>${renderStoreHeroCounterValue(metric.num, metric.unit)}</span>
        ${trendBadge(metric.trend, metric.trendDir, { riskTrend: isRiskTrend })}
      </div>
    `;
  };

  const renderSingleKpiMetric = (metric) => `
    <div class="hm-item single-metric">
      ${renderKpiMetricBody(metric)}
    </div>
  `;

  const renderGroupedKpiMetric = (primaryMetric, secondaryMetric, options = {}) => `
    <div class="hm-group-card${options.summary ? ' hm-item-summary' : ''}${options.hideSubRow ? ' hm-group-card-single' : ''}">
      <div class="hm-group-row">
        ${renderKpiMetricBody(primaryMetric)}
      </div>
      ${options.hideSubRow
        ? `<div class="hm-group-row kpi-row-sub" style="visibility:hidden;height:0;min-height:0;overflow:hidden">${renderKpiMetricBody(secondaryMetric)}</div>`
        : `<div class="hm-group-divider" aria-hidden="true"></div>
           <div class="hm-group-row">${renderKpiMetricBody(secondaryMetric)}</div>`}
    </div>
  `;

  const renderInlinePairKpiMetric = (primaryMetric, secondaryMetric, extraClass = '') => `
    <div class="hm-inline-pair-card${extraClass ? ` ${extraClass}` : ''}">
      <div class="hm-inline-pair-side">
        ${renderKpiMetricBody(primaryMetric)}
      </div>
      <div class="hm-inline-pair-divider" aria-hidden="true"></div>
      <div class="hm-inline-pair-side">
        ${renderKpiMetricBody(secondaryMetric)}
      </div>
    </div>
  `;

  const renderFlowLink = (fromTone = 'blue', toTone = 'cyan') => `
    <div class="hm-flow-link" aria-hidden="true" style="--flow-start-rgb:${FLOW_TONE_RGB[fromTone] || FLOW_TONE_RGB.blue};--flow-end-rgb:${FLOW_TONE_RGB[toTone] || FLOW_TONE_RGB.cyan};">
      <div class="hm-flow-row hm-flow-row-top">
        <span class="hm-flow-track"></span>
        <span class="hm-flow-pulse hm-flow-pulse-a"></span>
        <span class="hm-flow-pulse hm-flow-pulse-b"></span>
        <span class="hm-flow-arrow"></span>
      </div>
      <div class="hm-flow-gap" aria-hidden="true"></div>
      <div class="hm-flow-row hm-flow-row-bottom" style="visibility:hidden">
        <span class="hm-flow-track"></span>
        <span class="hm-flow-pulse hm-flow-pulse-a"></span>
        <span class="hm-flow-pulse hm-flow-pulse-b"></span>
        <span class="hm-flow-arrow"></span>
      </div>
    </div>
  `;

  const renderMetricDivider = () => `
    <div class="hm-sep hm-sep-divider" aria-hidden="true"></div>
  `;

  const renderStoreRecordingSummaryScene = (scene) => `
    <div class="store-recording-summary-scene" data-recording-scene="${escapeHtml(scene.key)}">
      <span class="store-recording-summary-scene-label">${escapeHtml(scene.label)}</span>
      <strong class="store-recording-summary-scene-value" ${buildStoreHeroCounterAttrs(scene.value, '条')}>${renderStoreHeroCounterValue(scene.value, '条')}</strong>
    </div>
  `;

  const renderStoreRecordingSummaryGroup = (group) => `
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
          <span class="hm-value" ${buildStoreHeroCounterAttrs(group.value, '条')}>${renderStoreHeroCounterValue(group.value, '条')}</span>
        </div>
      </div>
      ${group.scenes.length
        ? `<div class="store-recording-summary-breakdown">
            <div class="store-recording-summary-scenes" style="--recording-scene-count:${group.scenes.length}">
              ${group.scenes.map(renderStoreRecordingSummaryScene).join('')}
            </div>
          </div>`
        : ''}
    </section>
  `;

  const getStoreRecordingSourceTotal = (key) => {
    const baseValue = Number(ALL_KPI_DATA[key]?.num) || 0;
    const roleFactor = STORE_KPI_ROLE_FACTORS[currentRole]?.[key] ?? 1;
    const modelFactor = STORE_KPI_MODEL_FACTORS[currentModel]?.[key] ?? 1;
    return Math.max(0, Math.round(baseValue * getStoreKpiVolumeScale() * roleFactor * modelFactor));
  };

  const getStoreRecordingSummaryData = () => {
    const selection = getStoreSceneSelection();
    const visibility = getRecordingSourceVisibility(currentSource, currentScenes);
    const selectedScenes = selection.isAllSelected
      ? selection.allowedScenes
      : selection.activeScenes;
    const selected = new Set(selectedScenes);
    const cloudTotal = getStoreRecordingSourceTotal('invitation');
    const receptionTotal = getStoreRecordingSourceTotal('reception');
    const testDriveTotal = getStoreRecordingSourceTotal('test_drive');
    const createScene = (key, label, value) => ({ key, label, value });

    return {
      cloud: {
        visible: visibility.cloud,
        label: '云外呼录音数',
        value: cloudTotal,
        tone: 'blue',
        scenes: [
          createScene(SCENE_KEYS.firstFollow, '首触跟进', getInvitationSceneCount(cloudTotal, SCENE_KEYS.firstFollow)),
          createScene(SCENE_KEYS.inviteStore, '邀约进店', getInvitationSceneCount(cloudTotal, SCENE_KEYS.inviteStore)),
          createScene(SCENE_KEYS.scheduleConfirm, '排程确认', getInvitationSceneCount(cloudTotal, SCENE_KEYS.scheduleConfirm))
        ].filter((scene) => selected.has(scene.key))
      },
      badge: {
        visible: visibility.badge,
        label: '门店工牌录音数',
        value: receptionTotal + testDriveTotal,
        tone: 'green',
        scenes: [
          createScene(SCENE_KEYS.storeReception, '进店接待', receptionTotal),
          createScene(SCENE_KEYS.testDrive, '试乘试驾', testDriveTotal)
        ].filter((scene) => selected.has(scene.key))
      }
    };
  };

  const renderStoreRecordingSummary = () => {
    const summary = getStoreRecordingSummaryData();
    const visibleGroups = [summary.cloud, summary.badge].filter((group) => group.visible);
    return `
      <div class="store-recording-summary${visibleGroups.length === 1 ? ' is-single-source' : ''}" aria-label="录音数统计">
        ${visibleGroups.map(renderStoreRecordingSummaryGroup).join('')}
      </div>
    `;
  };

const HERO_BIZ_KPI_ITEM_MAP = {
    invitation: { key: 'invitation', pairedWith: 'visit_rate', isBiz: true },
    reception: { key: 'reception', pairedWith: 'drive_rate', isBiz: true },
    test_drive: { key: 'test_drive', pairedWith: 'order_rate', isBiz: true }
  };

  const HERO_SUMMARY_KPI_ITEMS = [
    { key: 'avg_duration', pairedWith: 'hit_rate' },
    { key: 'qa_pass_count', pairedWith: 'qa_pass_rate' },
    { key: 'risk_record', pairedWith: 'risk_rate' }
  ];

  const buildStoreHeroKpiItems = () => {
    const bizItems = getBusinessMetricKeysForSelection(currentSource, currentScenes)
      .map((key) => HERO_BIZ_KPI_ITEM_MAP[key])
      .filter(Boolean);

    return [...bizItems, ...HERO_SUMMARY_KPI_ITEMS];
  };

  const renderHeroKPI = () => {
    const grid = document.getElementById("hero-kpi-grid");
    if (!grid) return;

    const currentKpiData = buildStoreFilteredKpiData();
    const bottomRowCards = [];
    if (currentKpiData.avg_duration) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.avg_duration));
    }
    if (currentKpiData.hit_rate) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.hit_rate));
    }
    if (currentKpiData.qa_pass_count) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.qa_pass_count));
    }
    if (currentKpiData.qa_pass_rate) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.qa_pass_rate));
    }
    if (currentKpiData.risk_record) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.risk_record));
    }
    if (currentKpiData.risk_rate) {
      bottomRowCards.push(renderSingleKpiMetric(currentKpiData.risk_rate));
    }

    grid.innerHTML = `
      <div class="hm-layout-top">${renderStoreRecordingSummary()}</div>
      ${bottomRowCards.length ? '<div class="hm-layout-divider" aria-hidden="true"></div>' : ''}
      ${bottomRowCards.length ? `<div class="hm-layout-bottom">${bottomRowCards.join('')}</div>` : ''}
    `;
    window.requestAnimationFrame(() => animateStoreHeroCounters(grid));
  };

  // ══════════════════════════════════════════════
  // 漏斗线性数据流连接线（邀约→到店率→接待→试驾率→试驾→下订率）
  // 横向水平线，动画粒子沿路径流动
  // ══════════════════════════════════════════════
  const drawFunnelFlow = () => {
    const svg = document.getElementById("hero-funnel-svg");
    const grid = document.getElementById("hero-kpi-grid");
    if (!svg || !grid) return;

    requestAnimationFrame(() => {
      const gW = grid.offsetWidth;
      const gH = grid.offsetHeight;
      if (gW === 0 || gH === 0) return;

      svg.setAttribute("viewBox", `0 0 ${gW} ${gH}`);
      svg.innerHTML = "";

      // 六个指标的连接顺序
      const flowLabels = ['邀约录音数', '接待录音数', '试驾录音数'];
      const colors = ['#2563EB', '#7C3AED', '#10B981'];

      // 收集所有指标元素的位置（格子中心）
      const cells = grid.querySelectorAll('.kpi-cell.biz.paired');
      const positions = {}; // label -> {x, y}

      cells.forEach(cell => {
        const gRect = grid.getBoundingClientRect();
        const mainLabel = cell.querySelector('.kpi-row-main .kpi-label')?.textContent || '';
        const subLabel  = cell.querySelector('.kpi-row-sub  .kpi-label')?.textContent || '';

        if (mainLabel) {
          const mainRect = cell.querySelector('.kpi-row-main').getBoundingClientRect();
          positions[mainLabel] = {
            x: mainRect.left + mainRect.width  / 2 - gRect.left,
            y: mainRect.top  + mainRect.height / 2 - gRect.top
          };
        }
        if (subLabel) {
          const subRect = cell.querySelector('.kpi-row-sub').getBoundingClientRect();
          positions[subLabel] = {
            x: subRect.left + subRect.width  / 2 - gRect.left,
            y: subRect.top  + subRect.height / 2 - gRect.top
          };
        }
      });

      // 为每条连接绘制横向水平线 + 流动动画
      flowLabels.slice(0, -1).forEach((fromLabel, i) => {
        const toLabel = flowLabels[i + 1];
        const from = positions[fromLabel];
        const to   = positions[toLabel];
        if (!from || !to) return;

        const color = colors[i];
        const y = (from.y + to.y) / 2; // 水平线位于两个指标的中点高度

        // 渐变定义
        const gradId = `fg-${i}`;
        svg.innerHTML += `<defs>
          <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="${from.x}" y1="${y}" x2="${to.x}" y2="${y}">
            <stop offset="0%"   stop-color="${color}" stop-opacity="0.2"/>
            <stop offset="50%"  stop-color="${color}" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.2"/>
          </linearGradient>
        </defs>`;

        // 底层虚线横轨
        svg.innerHTML += `<line x1="${from.x}" y1="${y}" x2="${to.x}" y2="${y}"
          stroke="url(#${gradId})" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.6"/>`;

        // 流动粒子（沿水平线从左到右循环移动）
        const dur = 1.4 + i * 0.15;
        svg.innerHTML += `<circle r="4" fill="${color}" opacity="0.95">
          <animate attributeName="cx" values="${from.x};${to.x};${from.x}" dur="${dur}s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="${y};${y};${y}" dur="${dur}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.95;0.4;0.95" dur="${dur}s" repeatCount="indefinite"/>
        </circle>`;

        // 两侧端点圆点
        svg.innerHTML += `<circle cx="${from.x}" cy="${y}" r="2.5" fill="${color}" opacity="0.5"/>`;
        svg.innerHTML += `<circle cx="${to.x}"   cy="${y}" r="2.5" fill="${color}" opacity="0.5"/>`;
      });
    });
  };

  window.addEventListener("resize", drawFunnelFlow);

  // ══════════════════════════════════════════════
  // 5. 人员→场景级联逻辑（v3 核心）
  // ══════════════════════════════════════════════
  const syncStoreSceneTabs = () => {
    const sourceTabs = document.querySelectorAll('#gf-source .gf-tab');
    const sceneTabs = document.querySelectorAll('#gf-scene .gf-tab');
    const selection = getStoreSceneSelection();
    const allowed = new Set(getAllowedScenes(currentSource));

    sourceTabs.forEach((tab) => {
      const isActive = tab.dataset.source === currentSource;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    sceneTabs.forEach((tab) => {
      const scene = tab.dataset.scene;
      const isAllTab = scene === SCENE_KEYS.all;
      const isAllowed = isAllTab || allowed.has(scene);
      const isActive = isAllTab
        ? selection.isAllSelected
        : (selection.isAllSelected ? allowed.has(scene) : selection.activeScenes.includes(scene));
      const isIndeterminate = isAllTab && !selection.isAllSelected && !selection.isNoneSelected;
      const isHidden = isAllTab || !isAllowed;

      tab.classList.toggle('is-hidden', isHidden);
      tab.classList.toggle('disabled', !isAllowed);
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('is-indeterminate', isIndeterminate);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      tab.setAttribute('aria-checked', isIndeterminate ? 'mixed' : (isActive ? 'true' : 'false'));
      tab.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
      tab.tabIndex = isHidden ? -1 : (isAllowed ? 0 : -1);
    });
  };

  // ══════════════════════════════════════════════
  // 6. SOP执行排行榜（动态列，v2 逻辑保留）
  // ══════════════════════════════════════════════
  window.sortAdvisor = function(key) {
    if (currentSort.key === key) {
      currentSort.desc = !currentSort.desc;
    } else {
      currentSort.key = key;
      currentSort.desc = true;
    }
    advisorPaginationState.page = 1;
    renderAdvisorTable();
  };

  const getAdvisorPaginationItems = (totalPages) => {
    const current = advisorPaginationState.page;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items = [1];
    if (current > 3) items.push('ellipsis-left');
    for (let page = Math.max(2, current - 1); page <= Math.min(totalPages - 1, current + 1); page += 1) {
      items.push(page);
    }
    if (current < totalPages - 2) items.push('ellipsis-right');
    items.push(totalPages);
    return items;
  };

  const renderAdvisorPageSizeSelect = () => `
    <div class="custom-select-container page-select page-size-select">
      <button type="button" class="custom-select-trigger page-size-trigger" data-advisor-page-size-trigger>
        <span>${advisorPaginationState.pageSize} 条/页</span>
      </button>
      <div class="custom-select-options page-size-options">
        ${[10, 20, 50].map(size => `
          <button
            type="button"
            class="custom-option page-size-option${size === advisorPaginationState.pageSize ? ' active' : ''}"
            data-advisor-page-size-option="${size}"
          >
            <span>${size} 条/页</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const renderAdvisorPagination = (totalItems) => {
    const pagination = document.getElementById('advisorPagination');
    if (!pagination) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / advisorPaginationState.pageSize));
    if (advisorPaginationState.page > totalPages) {
      advisorPaginationState.page = totalPages;
    }
    const items = getAdvisorPaginationItems(totalPages);

    pagination.innerHTML = `
      <div class="dashboard-pagination">
        <span class="session-pagination-total">共 ${totalItems} 条</span>
        <div class="dashboard-pagination-controls">
          ${renderAdvisorPageSizeSelect()}
          <div class="page-group">
            <button type="button" class="page-arrow" data-advisor-page-arrow="prev" ${advisorPaginationState.page === 1 ? 'disabled' : ''}>‹</button>
            ${items.map(item =>
              typeof item === 'number'
                ? `<button type="button" class="page-num ${item === advisorPaginationState.page ? 'active' : ''}" data-advisor-page="${item}">${item}</button>`
                : '<span class="page-ellipsis">…</span>'
            ).join('')}
            <button type="button" class="page-arrow" data-advisor-page-arrow="next" ${advisorPaginationState.page === totalPages ? 'disabled' : ''}>›</button>
          </div>
          <div class="page-group page-jump-group">
            <span class="session-page-jump-label">前往</span>
            <label class="page-select page-jump-select">
              <input type="number" min="1" max="${totalPages}" value="${advisorPaginationState.page}" data-advisor-page-jump-input>
            </label>
            <span class="session-page-jump-suffix">页</span>
          </div>
        </div>
      </div>
    `;
  };

  const bindAdvisorPaginationEvents = (totalItems) => {
    const pagination = document.getElementById('advisorPagination');
    if (!pagination) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / advisorPaginationState.pageSize));

    pagination.querySelectorAll('[data-advisor-page]').forEach(node => {
      node.addEventListener('click', () => {
        advisorPaginationState.page = Number(node.dataset.advisorPage);
        renderAdvisorTable();
      });
    });

    pagination.querySelectorAll('[data-advisor-page-arrow]').forEach(node => {
      node.addEventListener('click', () => {
        const delta = node.dataset.advisorPageArrow === 'prev' ? -1 : 1;
        advisorPaginationState.page = Math.max(1, Math.min(totalPages, advisorPaginationState.page + delta));
        renderAdvisorTable();
      });
    });

    pagination.querySelectorAll('[data-advisor-page-size-trigger]').forEach(node => {
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        const options = node.parentElement?.querySelector('.page-size-options');
        const shouldOpen = !options?.classList.contains('open');
        pagination.querySelectorAll('.page-size-options').forEach(optionNode => optionNode.classList.remove('open'));
        pagination.querySelectorAll('[data-advisor-page-size-trigger]').forEach(triggerNode => triggerNode.classList.remove('is-open'));
        if (shouldOpen && options) {
          options.classList.add('open');
          node.classList.add('is-open');
        }
      });
    });

    pagination.querySelectorAll('[data-advisor-page-size-option]').forEach(node => {
      node.addEventListener('click', () => {
        advisorPaginationState.pageSize = Number(node.dataset.advisorPageSizeOption);
        advisorPaginationState.page = 1;
        renderAdvisorTable();
      });
    });

    pagination.querySelectorAll('[data-advisor-page-jump-input]').forEach(node => {
      const jump = () => {
        const nextPage = Math.max(1, Math.min(totalPages, Number(node.value) || 1));
        advisorPaginationState.page = nextPage;
        renderAdvisorTable();
      };
      node.addEventListener('change', jump);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') jump();
      });
    });
  };

  const renderAdvisorTable = () => {
    const advisorList = document.getElementById("advisor-list");
    if (!advisorList) return;

    const sceneKey = getEffectiveSceneKey();
    const legacySceneKey = getLegacySceneKey();

    // 按角色筛选
    let filteredData = [...advisorData];
    if (currentRole !== 'all') {
      filteredData = filteredData.filter(a => a.role === currentRole);
    }

    const sortedData = filteredData.sort((a, b) => {
      let valA = a[currentSort.key];
      let valB = b[currentSort.key];
      if (typeof valA === 'string' && valA.includes('%')) valA = parseFloat(valA);
      if (typeof valB === 'string' && valB.includes('%')) valB = parseFloat(valB);
      if (valA > valB) return currentSort.desc ? -1 : 1;
      if (valA < valB) return currentSort.desc ? 1 : -1;
      return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / advisorPaginationState.pageSize));
    if (advisorPaginationState.page > totalPages) {
      advisorPaginationState.page = totalPages;
    }
    const startIndex = (advisorPaginationState.page - 1) * advisorPaginationState.pageSize;
    const pagedData = sortedData.slice(startIndex, startIndex + advisorPaginationState.pageSize);

    const getInvitationView = (advisor) => getInvitationSceneCount(advisor.invitation, sceneKey);

    let bizHeaders = [];
    if (legacySceneKey === '邀约') {
      bizHeaders = [
        { label: "邀约录音数", key: "invitation", sortable: true },
        { label: "到店率", key: "visit_rate_col", sortable: false }
      ];
    } else if (sceneKey === SCENE_KEYS.storeReception) {
      bizHeaders = [
        { label: "接待录音数", key: "reception", sortable: true },
        { label: "试驾率", key: "drive_rate_col", sortable: false }
      ];
    } else if (sceneKey === SCENE_KEYS.testDrive) {
      bizHeaders = [
        { label: "试驾录音数", key: "test_drive", sortable: true },
        { label: "下订率", key: "order_rate_col", sortable: false }
      ];
    } else {
      bizHeaders = [
        { label: "邀约录音数", key: "invitation", sortable: true },
        { label: "接待录音数", key: "reception", sortable: true },
        { label: "试驾录音数", key: "test_drive", sortable: true }
      ];
    }
    const headers = [
      { label: "排名", key: "rank", sortable: false },
      { label: "姓名", key: "name", sortable: false },
      ...bizHeaders,
      { label: "话术命中率", key: "hit_rate", sortable: true },
      { label: "质检合格率", key: "qa_pass", sortable: true }
    ];

    const thead = headers.map(h => {
      if (!h.sortable) return `<th>${h.label}</th>`;
      const isSort = currentSort.key === h.key;
      const sortDirectionClass = isSort ? (currentSort.desc ? ' is-desc' : ' is-asc') : '';
      const ariaSort = isSort ? (currentSort.desc ? 'descending' : 'ascending') : 'none';
      return `<th class="sortable-th" onclick="window.sortAdvisor('${h.key}')" aria-sort="${ariaSort}" style="cursor:pointer; user-select:none;">
        <span class="advisor-th-sort-content">${h.label}<span class="advisor-sort-indicator${sortDirectionClass}" aria-hidden="true"></span></span>
      </th>`;
    }).join('');

    const buildRow = (a, rankIndex) => {
      let bizCells = '';
      if (legacySceneKey === '邀约') {
        const invitationValue = getInvitationView(a);
        const vRate = invitationValue > 0 ? ((a.reception / invitationValue * 100) || 0).toFixed(1) + '%' : '-';
        bizCells = `
          <td><span class="advisor-metric-number">${invitationValue}</span></td>
          <td><span class="advisor-metric-rate">${vRate}</span></td>`;
      } else if (sceneKey === SCENE_KEYS.storeReception) {
        const dRate = a.reception > 0 ? ((a.test_drive / a.reception * 100) || 0).toFixed(1) + '%' : '-';
        bizCells = `
          <td><span class="advisor-metric-number">${a.reception}</span></td>
          <td><span class="advisor-metric-rate">${dRate}</span></td>`;
      } else if (sceneKey === SCENE_KEYS.testDrive) {
        const oRate = a.test_drive > 0 ? ((a.test_drive * 0.3 / a.test_drive * 100) || 0).toFixed(1) + '%' : '-';
        bizCells = `
          <td><span class="advisor-metric-number">${a.test_drive}</span></td>
          <td><span class="advisor-metric-rate">${oRate}</span></td>`;
      } else {
        bizCells = `
          <td><span class="advisor-metric-number">${a.invitation}</span></td>
          <td><span class="advisor-metric-number">${a.reception}</span></td>
          <td><span class="advisor-metric-number">${a.test_drive}</span></td>`;
      }
      return `<tr>
        <td><span class="cell-main advisor-id">${rankIndex + 1}</span></td>
        <td>
          <span class="cell-main advisor-name">${a.name}</span>
          <span class="cell-sub advisor-role">${a.role}</span>
        </td>
        ${bizCells}
        <td><span class="advisor-metric-rate advisor-hit-rate${a.danger ? ' danger' : ''}">${a.hit_rate}</span></td>
        <td><span class="advisor-metric-rate advisor-qa-rate">${a.qa_pass}</span></td>
      </tr>`;
    };

    advisorList.innerHTML = `<table class="advisor-table data-table" data-column-count="${headers.length}">
      <thead>
        <tr>${thead}</tr>
      </thead>
      <tbody>
        ${pagedData.map((a, index) => buildRow(a, startIndex + index)).join("")}
      </tbody>
    </table>`;
    renderAdvisorPagination(sortedData.length);
    bindAdvisorPaginationEvents(sortedData.length);
  };

  // ── 7. 客户列表渲染 ───────────────────────────
  const getClientIntentBucket = (client) => {
    if (client.intention_series === "高") return "high";
    if (client.intention_series === "中") return "medium";
    if (client.intention_series === "低") return "low";
    return "none";
  };

  const getClientSupervisionPool = () => {
    let data = clientData.filter(c => c.status !== "normal");
    if (currentRole !== "all") data = data.filter(c => c.advisor_role === currentRole);
    return data;
  };

  const updateClientFilterCounts = () => {
    const data = getClientSupervisionPool();
    const countMap = {
      all: data.length,
      high: data.filter(c => getClientIntentBucket(c) === "high").length,
      medium: data.filter(c => getClientIntentBucket(c) === "medium").length,
      low: data.filter(c => getClientIntentBucket(c) === "low").length,
      none: data.filter(c => getClientIntentBucket(c) === "none").length
    };
    Object.entries(countMap).forEach(([key, value]) => {
      const node = document.getElementById(`fc-${key}`);
      if (node) node.textContent = value;
    });
  };

  const renderClientList = () => {
    const listEl = document.getElementById("client-list");
    if (!listEl) return;
    updateClientFilterCounts();
    let data = getClientSupervisionPool();
    if (currentFilter !== "all") data = data.filter(c => getClientIntentBucket(c) === currentFilter);

    const statusRank = { urgent: 0, warn: 1, normal: 2 };
    data = [...data].sort((a, b) => {
      if (currentClientTimeMode === "updated") {
        return clientData.indexOf(b) - clientData.indexOf(a);
      }
      return (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) || clientData.indexOf(a) - clientData.indexOf(b);
    });

    if (!data.length) {
      listEl.innerHTML = `<div class="todo-empty-state">当前筛选条件下暂无需要督办的线索</div>`;
      return;
    }

    const getPriorityClass = (status) => {
      if (status === "urgent") return "urgent";
      if (status === "warn") return "important";
      return "normal";
    };
    const getIntentClass = (level) => {
      if (level === "高") return "h";
      if (level === "中") return "a";
      if (level === "低") return "c";
      return "b";
    };
    const getAdvisorHitRate = (client) => {
      const advisor = advisorData.find((item) => item.name === client.advisor);
      return advisor?.hit_rate || `${client.qa_score}%`;
    };
    const getClientKeyTags = (client) => {
      if (Array.isArray(client.key_tags) && client.key_tags.length) {
        return client.key_tags;
      }
      return client.user_profile;
    };

    listEl.innerHTML = data.map(c => `
      <div class="todo-item ${getPriorityClass(c.status)} intent-${getIntentClass(c.intention_series)}" data-client-id="${c.id}">
        <div class="todo-priority-icon" aria-hidden="true">
          <img class="todo-priority-icon-mark" src="../assets/sales-recommend-avatar-icon.png" alt="" aria-hidden="true">
        </div>
        <div class="todo-body">
          <div class="todo-head todo-head-compact">
            <div class="todo-summary-main">
              <div class="todo-customer-row">
                <div class="todo-customer-stack">
                  <div class="todo-customer-name">${c.customer_name}</div>
                  <div class="todo-customer-meta-row">
                    <span class="todo-advisor-chip">顾问 ${c.advisor}</span>
                    <span class="todo-hit-rate-chip">话术执行率 ${getAdvisorHitRate(c)}</span>
                    <span class="todo-intent-badge intent-badge ${getIntentClass(c.intention_series)}">${c.intention_series}意向</span>
                    <span class="todo-model-chip">${c.car_model}</span>
                  </div>
                </div>
              </div>
              <div class="todo-time">最近场景 ${c.last_scene} · ${c.time}</div>
            </div>
          </div>

          <div class="todo-next-step">
            <div class="todo-guidance-head">
              <span class="todo-guidance-label todo-guidance-label-primary"><img class="todo-guidance-label-icon" src="../assets/sales-followup-icon.svg" alt="" aria-hidden="true">跟进建议</span>
              <span class="followup-time-badge">建议时间 ${c.follow_up_time || (c.status === "urgent" ? "今天 18:00" : "明天 10:00")}</span>
            </div>
            <div class="todo-next-step-text">${c.follow_action || c.manager_strategy}</div>
            <div class="todo-action-btns">
              <a class="lead-detail-btn" href="../prototype/index.html" target="_blank" rel="noopener noreferrer">录音详情</a>
              <button type="button" class="lead-detail-toggle" data-toggle-detail="${c.id}" aria-expanded="false">
                <span class="toggle-text">展开</span>
                <span class="toggle-arrow">▼</span>
              </button>
            </div>
          </div>

          <div class="lead-detail-content" id="lead-detail-${c.id}" aria-hidden="true">
            <div class="todo-summary-grid">
              <div class="todo-summary-panel">
                <div class="todo-summary-title">推荐理由</div>
                <div class="todo-summary-text">${c.recommend_reason || c.ai_issue}</div>
              </div>
              <div class="todo-summary-panel">
                <div class="todo-summary-title">关键信息</div>
                <div class="todo-tag-row">
                  ${getClientKeyTags(c).map(p => `<span class="todo-tag-chip">${p}</span>`).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll("[data-toggle-detail]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const targetId = toggle.dataset.toggleDetail;
        const content = document.getElementById(`lead-detail-${targetId}`);
        if (!content) return;
        const nextOpen = !content.classList.contains("is-open");
        content.classList.toggle("is-open", nextOpen);
        content.setAttribute("aria-hidden", String(!nextOpen));
        toggle.setAttribute("aria-expanded", String(nextOpen));
        const text = toggle.querySelector(".toggle-text");
        const arrow = toggle.querySelector(".toggle-arrow");
        if (text) text.textContent = nextOpen ? "收起" : "展开";
        if (arrow) arrow.textContent = nextOpen ? "▲" : "▼";
      });
    });
  };

  // ── 客户洞察渲染 ─────────────────────────
  // arrowSvg is replaced inline

  // 渲染单个标签（含次数 + 展开策略和录音）
  const renderTagItem = (tag, cssClass) => {
    const recsHtml = tag.recordings ? tag.recordings.map(r =>
      `<a class="rec-link" ${getRecordingDetailAttrs(r)} onclick="event.stopPropagation()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span class="rec-advisor">${r.advisor}</span><span class="rec-time">${r.time}</span><span class="rec-id">${normalizeMockRecordingId(r.id)}</span>
      </a>`).join('') : '';
    return `<div class="tag-card ${cssClass}" onclick="event.stopPropagation();this.classList.toggle('tag-expanded')">
      <div class="tag-card-header">
        <span class="detail-tag ${cssClass}">${tag.name}</span>
        <span class="tag-hit-count">${tag.count}次</span>
        <div class="action-hint"><span>查看</span><span class="toggle-arrow">▼</span></div>
      </div>
      <div class="tag-card-detail">
        <div class="ai-strategy-card">
          <div class="ai-strategy-label"><img class="ai-strategy-label-icon" src="../assets/sales-local-complete-icon.svg" alt="" aria-hidden="true"> AI 建议策略</div>
          <div class="ai-strategy-text">${tag.strategy}</div>
        </div>
        <div class="tag-recordings">${recsHtml}</div>
      </div>
    </div>`;
  };

  const renderInsightList = (containerId, data, type, totalCount, totalCustomer) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = data.map((item, i) => {
      const rankClass = i < 3 ? ` r${i + 1}` : '';
      const rankContent = i < 3
        ? `<img class="insight-rank-icon" src="../assets/insight-rank-${i + 1}.png" alt="${i + 1}">`
        : `${i + 1}`;
      let detailHtml = '';
      if (type === 'intent') {
        detailHtml = `
          <div class="insight-detail" id="${containerId}-detail-${i}">
            <div class="detail-group">
              <div class="detail-label detail-label-focus"><span class="dot-g"></span>本品关注点</div>
              <div class="tag-cards-list">${item.focus.map(t => renderTagItem(t, 'focus')).join('')}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label detail-label-risk"><span class="dot-g" style="background:#DC2626"></span>抗拒点</div>
              <div class="tag-cards-list">${item.resist.map(t => renderTagItem(t, 'resist')).join('')}</div>
            </div>
          </div>`;
      } else {
        detailHtml = `
          <div class="insight-detail" id="${containerId}-detail-${i}">
            <div class="detail-group">
              <div class="detail-label detail-label-risk"><span class="dot-g" style="background:#DC2626"></span>客户提及的竞品优势</div>
              <div class="tag-cards-list">${(item.advantages || []).map(t => renderTagItem(t, 'resist')).join('')}</div>
            </div>
            <div class="detail-group">
              <div class="detail-label detail-label-focus"><span class="dot-g"></span>本品应对策略</div>
              <div class="tag-cards-list">${(item.counters || []).map(t => renderTagItem(t, 'focus')).join('')}</div>
            </div>
          </div>`;
      }
      return `
        <div class="insight-item" data-insight-index="${i}">
          <div class="insight-row" onclick="window.toggleInsight('${containerId}',${i})" role="button" tabindex="0">
            <div class="insight-rank${rankClass}${i < 3 ? ' has-rank-icon' : ''}">${rankContent}</div>
            <div class="insight-model">${item.model}</div>
            <div class="insight-count"><span class="ic-label">提及数</span><span class="ic-val">${item.count}/${totalCount}</span><span class="ic-dot">·</span><span class="ic-label">客户数</span><span class="ic-val">${item.customerCount}/${totalCustomer}</span></div>
            <div class="action-hint insight-expand-toggle"><span>查看</span><span class="toggle-arrow">▼</span></div>
          </div>
          ${detailHtml}
        </div>`;
    }).join('');
  };

  window.toggleInsight = (containerId, idx) => {
    const item = document.querySelector(`#${containerId} .insight-item[data-insight-index="${idx}"]`);
    const row = item?.querySelector('.insight-row');
    const detail = document.getElementById(`${containerId}-detail-${idx}`);
    if (!row || !detail) return;
    const isOpen = row.classList.contains('active');
    document.querySelectorAll(`#${containerId} .insight-item`).forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`#${containerId} .insight-row`).forEach(r => r.classList.remove('active'));
    document.querySelectorAll(`#${containerId} .insight-detail`).forEach(d => d.classList.remove('show'));
    if (!isOpen) {
      item?.classList.add('active');
      row.classList.add('active');
      detail.classList.add('show');
    }
  };

  const renderInsightSection = () => {
    const body = document.getElementById('insight-body');
    if (!body) return;
    if (currentModel === 'all') {
      body.innerHTML = `
        <div class="insight-block">
          <div class="insight-block-title with-icon"><img class="insight-block-title-icon" src="../assets/insight-intent-top5.svg" alt="" aria-hidden="true">意向车型 TOP5</div>
          <div class="insight-list" id="intent-model-list"></div>
        </div>
        <div class="insight-block">
          <div class="insight-block-title with-icon"><img class="insight-block-title-icon" src="../assets/insight-compete-top5.svg" alt="" aria-hidden="true">竞品车型 TOP5</div>
          <div class="insight-list" id="compete-model-list"></div>
        </div>`;
      const intentTotal = intentModelData.reduce((s, d) => s + d.count, 0);
      const intentCustTotal = intentModelData.reduce((s, d) => s + d.customerCount, 0);
      const competeTotal = competeModelData.reduce((s, d) => s + d.count, 0);
      const competeCustTotal = competeModelData.reduce((s, d) => s + d.customerCount, 0);
      renderInsightList('intent-model-list', intentModelData, 'intent', intentTotal, intentCustTotal);
      renderInsightList('compete-model-list', competeModelData, 'compete', competeTotal, competeCustTotal);
    } else {
      const tags = modelTagData[currentModel];
      if (!tags) { body.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-muted);font-size:var(--text-sm)">暂无该车系标签数据</div>'; return; }
      const maxCount = Math.max(...[...tags.positive, ...tags.negative, ...tags.neutral].map(t => t.count));
      const renderBars = (items, polarity) => items.map(t => {
        const hasDetail = t.strategy || (t.recordings && t.recordings.length > 0);
        const cssClass = hasDetail ? 'tag-card' : '';
        const clickAttr = hasDetail ? "onclick=\"event.stopPropagation();this.classList.toggle('tag-expanded')\"" : "";
        const expandIcon = hasDetail ? `<div class="action-hint"><span>查看</span><span class="toggle-arrow">▼</span></div>` : "";
        const recsHtml = t.recordings ? t.recordings.map(r =>
          `<a class="rec-link" ${getRecordingDetailAttrs(r)} onclick="event.stopPropagation()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span class="rec-advisor">${r.advisor}</span><span class="rec-time">${r.time}</span><span class="rec-id">${normalizeMockRecordingId(r.id)}</span>
          </a>`).join('') : '';
        const detailHtml = hasDetail ? `
          <div class="tag-card-detail">
            ${t.strategy ? `<div class="ai-strategy-card"><div class="ai-strategy-label"><img class="ai-strategy-label-icon" src="../assets/sales-local-complete-icon.svg" alt="" aria-hidden="true"> AI 建议策略</div><div class="ai-strategy-text">${t.strategy}</div></div>` : ''}
            ${recsHtml ? `<div class="tag-recordings">${recsHtml}</div>` : ''}
          </div>` : '';

        return `
        <div class="tag-bar-wrapper ${polarity} ${cssClass}" ${clickAttr} style="margin-bottom:6px">
          <div class="tag-bar-item ${hasDetail ? 'tag-card-header' : ''}" style="${hasDetail ? 'padding:6px 10px; margin:0;' : ''}">
            <div class="tag-bar-name" style="width:72px;text-align:left;flex-shrink:0;">${t.name}</div>
            <div class="tag-bar-track"><div class="tag-bar-fill ${polarity}" style="width:${(t.count / maxCount * 100).toFixed(0)}%"></div></div>
            <div class="tag-bar-count" style="width:110px;text-align:right;flex-shrink:0;color:#94A3B8;display:flex;align-items:center;justify-content:flex-end">
              <strong style="color:#334155;font-size:13px;font-family:var(--font-mono)">${t.count}</strong><span style="margin:0 2px">次</span>·<strong style="color:#334155;font-size:13px;font-family:var(--font-mono);margin-left:4px">${t.customerCount || Math.floor(t.count*0.6)}</strong><span style="margin:0 2px">客</span>
              ${expandIcon}
            </div>
          </div>
          ${detailHtml}
        </div>`;
      }).join('');
      body.innerHTML = `
        <div class="insight-block">
          <div class="insight-block-title">客户标签分布 · ${currentModel}</div>
          <div class="tag-section-label"><span class="polarity-dot" style="background:#22C55E"></span>正向标签</div>
          <div class="tag-grid">${renderBars(tags.positive, 'positive')}</div>
          <div class="tag-section-label"><span class="polarity-dot" style="background:#EF4444"></span>负向标签</div>
          <div class="tag-grid">${renderBars(tags.negative, 'negative')}</div>
          <div class="tag-section-label"><span class="polarity-dot" style="background:#94A3B8"></span>中性标签</div>
          <div class="tag-grid">${renderBars(tags.neutral, 'neutral')}</div>
        </div>`;
    }
  };

  const shiftStoreReferenceDate = (date, offsetDays) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + offsetDays);
    return nextDate;
  };

  const parseStoreAnchorDateValue = (value) => {
    const match = String(value || "").match(/(\d{1,2})[-/](\d{1,2})/);
    if (!match) {
      return null;
    }

    const year = new Date().getFullYear();
    return new Date(year, Number(match[1]) - 1, Number(match[2]));
  };

  const getStoreAnchorDate = () => {
    let latestDate = null;
    clientData.forEach((item) => {
      const candidate = parseStoreAnchorDateValue(item.time);
      if (candidate && (!latestDate || candidate.getTime() > latestDate.getTime())) {
        latestDate = candidate;
      }
    });
    return latestDate || new Date();
  };

  const getStoreRangeValues = (rangeKey) => {
    const anchorDate = getStoreAnchorDate();
    let startDate = anchorDate;
    let endDate = anchorDate;

    if (rangeKey === "1") {
      startDate = shiftStoreReferenceDate(anchorDate, -1);
      endDate = startDate;
    } else if (rangeKey === "7") {
      startDate = shiftStoreReferenceDate(anchorDate, -6);
    } else if (rangeKey === "15") {
      startDate = shiftStoreReferenceDate(anchorDate, -14);
    } else if (rangeKey === "30") {
      startDate = shiftStoreReferenceDate(anchorDate, -29);
    }

    return {
      startDate: formatSessionDateValue(startDate),
      endDate: formatSessionDateValue(endDate)
    };
  };

  const syncStoreTimeRangeFromQuickFilter = (rangeKey) => {
    const { startDate, endDate } = getStoreRangeValues(rangeKey);
    storeTimeStartDate = startDate;
    storeTimeEndDate = endDate;
  };

  const getStoreDateLimitRange = () => {
    const maxDate = new Date();
    const minYear = maxDate.getFullYear();
    const minMonth = maxDate.getMonth() - 6;
    const minMonthLastDate = new Date(minYear, minMonth + 1, 0).getDate();
    const minDate = new Date(minYear, minMonth, Math.min(maxDate.getDate(), minMonthLastDate));

    return {
      minDate,
      maxDate,
      minValue: formatSessionDateValue(minDate),
      maxValue: formatSessionDateValue(maxDate)
    };
  };

  const clampStoreDateValue = (value) => {
    if (!value) {
      return "";
    }

    const { minValue, maxValue } = getStoreDateLimitRange();
    if (value < minValue) {
      return minValue;
    }
    if (value > maxValue) {
      return maxValue;
    }
    return value;
  };

  const isStoreDateSelectable = (value) => {
    if (!value) {
      return false;
    }

    const { minValue, maxValue } = getStoreDateLimitRange();
    return value >= minValue && value <= maxValue;
  };

  const syncStoreDateView = (value) => {
    const target = parseSessionDateValue(clampStoreDateValue(value)) || getStoreDateLimitRange().maxDate;
    storeDateState.viewYear = target.getFullYear();
    storeDateState.viewMonth = target.getMonth() + 1;
  };

  const shiftStoreDateView = (offset) => {
    const { minDate, maxDate } = getStoreDateLimitRange();
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = storeDateState.viewYear * 12 + storeDateState.viewMonth - 1;
    const nextMonthIndex = Math.min(maxMonthIndex, Math.max(minMonthIndex, currentMonthIndex + offset));

    storeDateState.viewYear = Math.floor(nextMonthIndex / 12);
    storeDateState.viewMonth = (nextMonthIndex % 12) + 1;
  };

  const applyStoreDateDraft = (field, value) => {
    const nextValue = clampStoreDateValue(value);
    if (!nextValue) {
      return;
    }

    if (field === "startDate") {
      storeDateState.draftStartDate = nextValue;
      if (!storeDateState.draftEndDate || storeDateState.draftEndDate < nextValue) {
        storeDateState.draftEndDate = nextValue;
      }
      storeDateState.activeField = "endDate";
      syncStoreDateView(storeDateState.draftEndDate);
      return;
    }

    storeDateState.draftEndDate = nextValue;
    if (!storeDateState.draftStartDate || storeDateState.draftStartDate > nextValue) {
      storeDateState.draftStartDate = nextValue;
    }
  };

  const getStoreRangeInclusiveDays = (startDate, endDate) => {
    const start = parseSessionDateValue(startDate);
    const end = parseSessionDateValue(endDate);
    if (!start || !end) {
      return 7;
    }

    const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
    return Math.max(1, diff + 1);
  };

  const getStoreTrendRangeKey = () => {
    if (currentTime !== "custom") {
      return currentTime;
    }

    const days = getStoreRangeInclusiveDays(storeTimeStartDate, storeTimeEndDate);
    if (days <= 1) return "1";
    if (days <= 7) return "7";
    if (days <= 15) return "15";
    return "30";
  };

  const renderStoreDateMenu = () => {
    const activeField = storeDateState.activeField;
    const startDate = storeDateState.draftStartDate;
    const endDate = storeDateState.draftEndDate;
    const { minDate, maxDate, maxValue } = getStoreDateLimitRange();
    const todayValue = maxValue;
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = storeDateState.viewYear * 12 + storeDateState.viewMonth - 1;
    const disablePrevMonth = currentMonthIndex <= minMonthIndex;
    const disableNextMonth = currentMonthIndex >= maxMonthIndex;
    const cells = getSessionDateCells(storeDateState.viewYear, storeDateState.viewMonth);

    return renderSharedDateRangePanelMarkup({
      dataNamespace: "store-date",
      rangeText: getSessionDateRangeText(startDate, endDate),
      monthLabel: formatSessionMonthLabel(storeDateState.viewYear, storeDateState.viewMonth),
      activeField,
      startLabel: formatSessionDateDisplay(startDate),
      endLabel: formatSessionDateDisplay(endDate),
      disablePrevMonth,
      disableNextMonth,
      cells: cells.map((date) => {
        if (!date) {
          return null;
        }

        const value = formatSessionDateValue(date);
        return {
          day: date.getDate(),
          value,
          isDisabled: !isStoreDateSelectable(value),
          inRange: Boolean(startDate && endDate && value >= startDate && value <= endDate),
          isStart: value === startDate,
          isEnd: value === endDate,
          isToday: value === todayValue
        };
      }),
      shortcuts: storeTimeShortcutOptions,
      summaryText: `已选择 ${getSessionDateRangeText(startDate, endDate)}`
    });
  };

  const bindStoreDateEvents = () => {
    const host = document.getElementById("store-date-control");
    if (!host) {
      return;
    }

    host.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    host.querySelectorAll("[data-store-date-trigger]").forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();

        if (storeDateState.open) {
          storeDateState.open = false;
          renderStoreDateControl();
          return;
        }

        openStoreDatePicker();
      });
    });

    host.querySelectorAll("[data-store-date-field]").forEach((node) => {
      node.addEventListener("click", () => {
        storeDateState.activeField = node.dataset.storeDateField;
        const value = storeDateState.activeField === "startDate"
          ? storeDateState.draftStartDate
          : storeDateState.draftEndDate;
        syncStoreDateView(value);
        renderStoreDateControl();
      });
    });

    host.querySelectorAll("[data-store-date-nav]").forEach((node) => {
      node.addEventListener("click", () => {
        shiftStoreDateView(Number(node.dataset.storeDateNav));
        renderStoreDateControl();
      });
    });

    host.querySelectorAll("[data-store-date-value]").forEach((node) => {
      node.addEventListener("click", () => {
        applyStoreDateDraft(storeDateState.activeField, node.dataset.storeDateValue);
        renderStoreDateControl();
      });
    });

    host.querySelectorAll("[data-store-date-shortcut]").forEach((node) => {
      node.addEventListener("click", () => {
        const { startDate, endDate } = getStoreRangeValues(node.dataset.storeDateShortcut);
        storeDateState.draftStartDate = startDate;
        storeDateState.draftEndDate = endDate;
        storeDateState.activeField = "endDate";
        syncStoreDateView(endDate);
        renderStoreDateControl();
      });
    });

    host.querySelectorAll("[data-store-date-cancel]").forEach((node) => {
      node.addEventListener("click", () => {
        closeStoreDatePicker();
      });
    });

    host.querySelectorAll("[data-store-date-apply]").forEach((node) => {
      node.addEventListener("click", () => {
        applyStoreDateFilters();
      });
    });
  };

  function renderStoreDateControl() {
    const host = document.getElementById("store-date-control");
    if (!host) {
      return;
    }

    if (currentTime !== "custom") {
      host.innerHTML = "";
      return;
    }

    host.innerHTML = renderStoreDateControlMarkup({
      currentTime,
      isOpen: storeDateState.open,
      startLabel: formatSessionDateDisplay(storeTimeStartDate),
      endLabel: formatSessionDateDisplay(storeTimeEndDate),
      menuHtml: renderStoreDateMenu()
    });

    bindStoreDateEvents();
  }

  function closeStoreDatePicker(shouldRender = true) {
    if (!storeDateState.open) {
      return;
    }

    storeDateState.open = false;
    if (shouldRender) {
      renderStoreDateControl();
    }
  }

  function openStoreDatePicker() {
    if (!storeTimeStartDate || !storeTimeEndDate) {
      syncStoreTimeRangeFromQuickFilter("7");
    }

    storeDateState.open = true;
    storeDateState.activeField = "startDate";
    storeDateState.draftStartDate = clampStoreDateValue(storeTimeStartDate);
    storeDateState.draftEndDate = clampStoreDateValue(storeTimeEndDate);
    if (storeDateState.draftStartDate && storeDateState.draftEndDate && storeDateState.draftStartDate > storeDateState.draftEndDate) {
      storeDateState.draftStartDate = storeDateState.draftEndDate;
    }
    syncStoreDateView(storeTimeStartDate || storeTimeEndDate);
    renderStoreDateControl();
  }

  function applyStoreDateFilters() {
    const startDate = clampStoreDateValue(storeDateState.draftStartDate);
    const endDate = clampStoreDateValue(storeDateState.draftEndDate);
    storeTimeStartDate = startDate && endDate && startDate > endDate ? endDate : startDate;
    storeTimeEndDate = startDate && endDate && startDate > endDate ? startDate : endDate;
    currentTime = "custom";
    storeDateState.open = false;
    renderStoreDateControl();
    applyGlobalFilter();
  }

  syncStoreTimeRangeFromQuickFilter(currentTime);

  // ══════════════════════════════════════════════
  // 8. 全局筛选栏 事件绑定
  // ══════════════════════════════════════════════
  const bindGlobalFilter = (containerId, dataAttr, stateUpdater) => {
    const tabs = document.querySelectorAll(`#${containerId} .gf-tab`);
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains('disabled')) return;
        tabs.forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-pressed", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-pressed", "true");
        stateUpdater(tab.dataset[dataAttr]);
        // 自定义时间先进入日期选择态，应用后再真正生效
        if (containerId === 'gf-time' && tab.dataset[dataAttr] === 'custom') return;
        applyGlobalFilter();
      });
    });
  };

  bindGlobalFilter("gf-role", "role", val => {
    currentRole = val;
  });

  document.getElementById('gf-source')?.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-source]');
    if (!tab) return;
    currentSource = tab.dataset.source;
    currentScenes = setSourceSelection(currentSource);
    syncStoreSceneTabs();
    applyGlobalFilter();
  });

  document.getElementById('gf-scene')?.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-scene]');
    if (!tab || tab.classList.contains('disabled') || tab.classList.contains('is-hidden')) return;
    const nextScenes = toggleSceneSelection(currentSource, currentScenes, tab.dataset.scene);
    if (Array.isArray(nextScenes) && nextScenes.length === 0) return;
    currentScenes = nextScenes;
    syncStoreSceneTabs();
    applyGlobalFilter();
  });

  bindGlobalFilter("gf-time", "time", val => {
    currentTime = val;
    if (val === 'custom') {
      if (!storeTimeStartDate || !storeTimeEndDate) {
        syncStoreTimeRangeFromQuickFilter("7");
      }
      closeStoreDatePicker(false);
      renderStoreDateControl();
    } else {
      syncStoreTimeRangeFromQuickFilter(val);
      closeStoreDatePicker(false);
      renderStoreDateControl();
    }
  });

  syncStoreSceneTabs();

  // 车系下拉筛选
  const initStoreModelDropdown = () => {
    const root = document.getElementById('store-model-dropdown');
    const trigger = document.getElementById('store-model-trigger');
    const panel = document.getElementById('store-model-panel');
    const display = document.getElementById('store-model-display');
    if (!root || !trigger || !panel || !display) return;

    const modelLabels = { all: '全部车系', M8: '传祺M8', S7: '传祺S7', GS8: '传祺GS8', E8: '传祺E8' };

    const openDropdown = () => {
      root.classList.add('is-open');
      panel.classList.add('show');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    };

    const closeDropdown = () => {
      root.classList.remove('is-open');
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

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.classList.contains('show')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    panel.addEventListener('click', (e) => {
      const option = e.target.closest('.store-model-option');
      if (option && option.dataset.model) {
        selectModel(option.dataset.model);
      }
    });

    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !panel.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });
  };
  initStoreModelDropdown();

  document.addEventListener('click', (e) => {
    const customBtn = document.getElementById('gf-custom-btn');
    const clickedInsideStoreDateRoot = e.target && typeof e.target.closest === 'function'
      ? e.target.closest('[data-store-date-root]')
      : null;
    const clickedCustomTrigger = e.target && typeof e.target.closest === 'function'
      ? e.target.closest('#gf-custom-btn')
      : null;

    if (storeDateState.open && !clickedInsideStoreDateRoot && !clickedCustomTrigger && (!customBtn || !customBtn.contains(e.target))) {
      closeStoreDatePicker();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && storeDateState.open) {
      closeStoreDatePicker();
    }
  });

  renderStoreDateControl();

  // 全局筛选应用
  const applyGlobalFilter = () => {
    resetStoreTeamSummaryState({ render: false });
    advisorPaginationState.page = 1;
    renderHeroKPI();
    renderClientList();
    renderAdvisorTable();
    renderInsightSection();
    renderStoreIssueSections();
    updateTeamEfficiencyDials({ fromZero: true });
    buildChart(getStoreTrendRangeKey());
    renderStoreTeamSummary();
  };

  // 督办清单筛选（意向等级）
  document.querySelectorAll(".todo-filter-tab[data-filter]").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".todo-filter-tab[data-filter]").forEach(p => { p.classList.remove("active"); p.setAttribute("aria-pressed","false"); });
      pill.classList.add("active");
      pill.setAttribute("aria-pressed","true");
      currentFilter = pill.dataset.filter;
      renderClientList();
    });
  });

  document.getElementById("client-time-mode-tabs")?.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-mode]");
    if (!pill) return;
    currentClientTimeMode = pill.dataset.mode;
    document.querySelectorAll("#client-time-mode-tabs [data-mode]").forEach(p => {
      const isActive = p.dataset.mode === currentClientTimeMode;
      p.classList.toggle("active", isActive);
      p.setAttribute("aria-pressed", String(isActive));
    });
    renderClientList();
  });

  document.getElementById('team-ai-summary')?.addEventListener('click', (event) => {
    const generateButton = event.target.closest('[data-store-team-summary-generate]');
    if (!generateButton || storeTeamSummaryState.generated || storeTeamSummaryState.generating) {
      return;
    }

    clearStoreTeamSummaryTypingTimer();
    storeTeamSummaryState.typingDone = false;
    storeTeamSummaryState.lastText = '';
    storeTeamSummaryState.generating = true;
    renderStoreTeamSummary();

    if (storeTeamSummaryState.generateTimer) {
      window.clearTimeout(storeTeamSummaryState.generateTimer);
    }
    storeTeamSummaryState.generateTimer = window.setTimeout(() => {
      storeTeamSummaryState.generating = false;
      storeTeamSummaryState.generated = true;
      storeTeamSummaryState.generateTimer = null;
      renderStoreTeamSummary();
    }, 1200);
  });

  // ── 9. 话术薄弱项 & 风险命中项（交互式卡片）──
  const getScopeMeta = (count) => {
    const safeTotal = Math.max(TOTAL_ADVISOR_COUNT || 0, 1);
    const safeCount = Math.max(1, Math.min(safeTotal, Number(count) || 1));
    const ratio = `${safeCount}/${safeTotal}`;
    if (safeCount >= Math.ceil(safeTotal / 2)) {
      return { type: 'shared', text: `团队共性·${ratio}` };
    }
    if (safeCount === 1) {
      return { type: 'single', text: `个人表现·${ratio}` };
    }
    return { type: 'multi', text: `多人表现·${ratio}` };
  };
  const scopeBadge = (count, toneClass = '') => {
    const scope = getScopeMeta(count);
    return `<span class="scope-badge scope-${scope.type}${toneClass ? ` ${toneClass}` : ''}">${scope.text}</span>`;
  };
  const scopeText = (count) => {
    const scope = getScopeMeta(count);
    return `<span class="issue-scope-text scope-${scope.type}">${scope.text}</span>`;
  };
  const recLinks = (recs) => recs.map(r =>
    `<a class="rec-link" ${getRecordingDetailAttrs(r)} onclick="event.stopPropagation()">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <span class="rec-advisor">${r.advisor}</span><span class="rec-time">${r.time}</span><span class="rec-id">${normalizeMockRecordingId(r.id)}</span>
    </a>`).join('');
  const storeIssueAnimationFrames = new Set();
  const parseStoreIssuePercent = (value) => Number.parseFloat(String(value || '').replace('%', '')) || 0;
  const formatStoreIssuePercent = (value) => `${Math.round(value)}%`;
  const clearStoreIssueAnimations = () => {
    storeIssueAnimationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    storeIssueAnimationFrames.clear();
  };
  const getStoreWeaknessMetricKey = (title = '') => {
    if (title.includes('试驾邀约')) return 'drive_rate';
    if (title.includes('金融方案')) return 'order_rate';
    if (title.includes('购车时间')) return 'visit_rate';
    return 'hit_rate';
  };
  const getStoreWeaknessContextDelta = (title = '') => {
    let delta = 0;
    const legacySceneKey = getLegacySceneKey();
    if (legacySceneKey === '邀约') {
      if (title.includes('试驾邀约')) delta += 5.2;
      if (title.includes('金融方案')) delta += 2.4;
      if (title.includes('购车时间')) delta += 1.8;
      if (title.includes('竞品对比')) delta -= 1.2;
    } else if (legacySceneKey === '门店接待') {
      if (title.includes('竞品对比')) delta += 2.8;
      if (title.includes('购车时间')) delta -= 3.4;
      if (title.includes('价格异议')) delta += 1.6;
      if (title.includes('试驾邀约')) delta -= 2.2;
    } else if (legacySceneKey === '试乘试驾') {
      if (title.includes('试驾邀约')) delta -= 4.8;
      if (title.includes('金融方案')) delta += 3.1;
      if (title.includes('竞品对比')) delta += 1.4;
    }

    if (currentRole === '邀约专员') {
      if (title.includes('试驾邀约')) delta -= 3.2;
      if (title.includes('金融方案') || title.includes('竞品对比') || title.includes('价格异议')) delta += 1.9;
    } else if (currentRole === '销售顾问') {
      if (title.includes('试驾邀约')) delta += 1.2;
      if (title.includes('竞品对比') || title.includes('价格异议')) delta -= 1.5;
      if (title.includes('金融方案')) delta -= 0.9;
    }

    if (currentModel === 'M8' || currentModel === 'GS8') {
      if (title.includes('竞品对比')) delta += 1.6;
    } else if (currentModel === 'E8') {
      if (title.includes('金融方案')) delta += 1.5;
      if (title.includes('购车时间')) delta += 0.8;
    } else if (currentModel === 'S7') {
      if (title.includes('价格异议')) delta += 1.7;
    }

    return delta;
  };
  const getStoreRiskContextDelta = (title = '') => {
    let delta = 0;
    const legacySceneKey = getLegacySceneKey();
    if (legacySceneKey === '邀约') {
      if (title.includes('贬低竞品')) delta += 1.6;
      if (title.includes('交车时间')) delta -= 0.8;
    } else if (legacySceneKey === '门店接待') {
      if (title.includes('交车时间')) delta += 2.1;
      if (title.includes('优惠方案')) delta += 1.4;
    } else if (legacySceneKey === '试乘试驾') {
      if (title.includes('贬低竞品')) delta += 1.2;
      if (title.includes('强制加装')) delta += 0.8;
    }

    if (currentRole === '销售顾问') {
      delta += 1.2;
      if (title.includes('交车时间')) delta += 0.8;
    } else if (currentRole === '邀约专员') {
      delta -= 0.9;
    }

    if (currentModel === 'M8' || currentModel === 'GS8') {
      if (title.includes('贬低竞品')) delta += 0.9;
    } else if (currentModel === 'E8') {
      if (title.includes('优惠方案')) delta += 1.1;
    }

    return delta;
  };
  const sortIssuesByPopulationShare = (a, b) => {
    const safeTotal = Math.max(TOTAL_ADVISOR_COUNT || 0, 1);
    const shareDiff = (b.advisor_count / safeTotal) - (a.advisor_count / safeTotal);
    if (Math.abs(shareDiff) > 1e-6) return shareDiff;
    const ratioDiff = (b.animated_ratio || 0) - (a.animated_ratio || 0);
    if (Math.abs(ratioDiff) > 1e-6) return ratioDiff;
    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN');
  };
  const getFilteredWeaknessData = () => {
    return weaknessData.map(item => {
      const base = parseStoreIssuePercent(item.unhit_ratio);
      const metricDelta = getStoreRateDelta(getStoreWeaknessMetricKey(item.title));
      const rangeBias = Math.log2(Math.max(getStoreKpiRangeDays(), 1)) * 0.55;
      const target = clampStoreKpiValue(
        base - (metricDelta * 0.82) + getStoreWeaknessContextDelta(item.title) + rangeBias + getStoreKpiJitter(`weakness-${item.title}`, 1.35),
        18,
        95
      );
      return {
        ...item,
        animated_ratio: Math.round(target),
        unhit_ratio: formatStoreIssuePercent(target)
      };
    }).sort(sortIssuesByPopulationShare);
  };
  const getFilteredRiskData = () => {
    return riskData.map(item => {
      const base = parseStoreIssuePercent(item.hit_ratio);
      const rangeBias = Math.log2(Math.max(getStoreKpiRangeDays(), 1)) * 0.36;
      const target = clampStoreKpiValue(
        base + (getStoreRateDelta('risk_rate') * 0.66) + getStoreRiskContextDelta(item.title) + rangeBias + getStoreKpiJitter(`risk-${item.title}`, 1.1),
        2,
        58
      );
      return {
        ...item,
        animated_ratio: Math.round(target),
        hit_ratio: formatStoreIssuePercent(target)
      };
    }).sort(sortIssuesByPopulationShare);
  };
  const getFilteredStrengthData = () => {
    return strengthData.map(item => {
      const base = parseStoreIssuePercent(item.hit_ratio);
      const rangeBias = Math.log2(Math.max(getStoreKpiRangeDays(), 1)) * 0.42;
      const target = clampStoreKpiValue(
        base + (getStoreRateDelta('qa_pass_rate') * 0.74) + rangeBias + getStoreKpiJitter(`strength-${item.title}`, 1.2),
        28,
        96
      );
      return {
        ...item,
        animated_ratio: Math.round(target),
        hit_ratio: formatStoreIssuePercent(target)
      };
    }).sort(sortIssuesByPopulationShare);
  };
  const animateStoreIssueCards = () => {
    clearStoreIssueAnimations();
    const issueCards = [...document.querySelectorAll('#sop-rule-chart .issue-card, #weakness-chart .issue-card, #strength-chart .issue-card, #risk-chart .issue-card')];
    const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3);

    issueCards.forEach((card, index) => {
      const fill = card.querySelector('.issue-bar-fill[data-issue-target]');
      const stat = card.querySelector('.issue-stat[data-issue-target]');
      const target = Number(fill?.dataset.issueTarget || stat?.dataset.issueTarget || 0);
      if (!fill || !stat || !Number.isFinite(target)) return;

      fill.style.width = '0%';
      stat.textContent = '0%';

      let frameId = 0;
      let animationStart = null;
      const delay = 90 + (index * 70);
      const duration = 920;

      const scheduleFrame = () => {
        frameId = requestAnimationFrame(step);
        storeIssueAnimationFrames.add(frameId);
      };

      const step = (timestamp) => {
        storeIssueAnimationFrames.delete(frameId);

        if (animationStart === null) {
          animationStart = timestamp + delay;
        }

        if (timestamp < animationStart) {
          scheduleFrame();
          return;
        }

        const progress = Math.min((timestamp - animationStart) / duration, 1);
        const currentValue = target * easeOutCubic(progress);
        fill.style.width = `${currentValue}%`;
        stat.textContent = formatStoreIssuePercent(currentValue);

        if (progress < 1) {
          scheduleFrame();
          return;
        }

        fill.style.width = `${target}%`;
        stat.textContent = formatStoreIssuePercent(target);
      };

      scheduleFrame();
    });
  };
  const setupStoreIssueToggles = () => {
    // expand/collapse removed - issue cards now open recording library overlay
  };

  const buildIssueWordCloud = (items, {
    title,
    note,
    valueKey,
    variant
  }) => {
    if (!items?.length) return '';

    const sortedItems = [...items].sort((a, b) => parseFloat(b[valueKey]) - parseFloat(a[valueKey]));
    const values = sortedItems.map(item => parseFloat(item[valueKey]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const cloudTones = variant === 'risk'
      ? ['red', 'amber', 'violet', 'red', 'amber']
      : ['amber', 'blue', 'green', 'violet', 'blue'];
    const cloudOffsets = ['', ' offset-up', '', ' offset-down', ''];

    const cloudItemsHtml = sortedItems.map((item, idx) => {
      const value = parseFloat(item[valueKey]) || 0;
      const normalized = max === min ? 0.72 : (value - min) / (max - min);
      const sizeClass = normalized >= 0.82 ? 'xl'
        : normalized >= 0.58 ? 'lg'
        : normalized >= 0.32 ? 'md'
        : 'sm';
      const toneClass = cloudTones[idx % cloudTones.length];
      const offsetClass = cloudOffsets[idx % cloudOffsets.length];
      return `<span class="lead-cloud-term ${toneClass} ${sizeClass}${offsetClass}" title="${item.title} · ${item[valueKey]}">
        <span class="lead-cloud-term-copy">${item.title}</span>
      </span>`;
    }).join('');

    return `<div class="track issue-word-cloud ${variant}">
      <div class="track-header issue-word-cloud-header">
        <div class="track-header-main">
          <div>
            <div class="track-title">${title}</div>
            <p class="track-sub">${note}</p>
          </div>
        </div>
      </div>
      <div class="session-ai-keyword-box issue-word-cloud-body">${cloudItemsHtml}</div>
    </div>`;
  };

  const getStoreInsightCategory = (type, title = '') => {
    if (type === 'risk') {
      return title.includes('致歉') || title.includes('歉意') ? '服务补救' : '服务红线';
    }
    if (title.includes('需求')) return '需求洞察';
    if (title.includes('竞品') || title.includes('本品') || title.includes('版本')) return '产品表达';
    if (title.includes('价格')) return '异议处理';
    if (title.includes('门店')) return '信任建立';
    if (title.includes('微信')) return '留资承接';
    if (title.includes('线索') || title.includes('留人')) return '线索承接';
    if (title.includes('到店') || title.includes('试驾')) return '到店邀约';
    return '风险边界';
  };

  const distributeStoreIssueTotal = (total, count, offset = 0) => {
    const safeCount = Math.max(1, count);
    const base = Math.floor(total / safeCount);
    const result = Array.from({ length: safeCount }, () => base);
    for (let index = 0; index < total - (base * safeCount); index += 1) {
      result[(index + offset) % safeCount] += 1;
    }
    return result;
  };

  const STORE_CLOUD_INSIGHT_SCENES = [
    SCENE_KEYS.firstFollow,
    SCENE_KEYS.inviteStore,
    SCENE_KEYS.scheduleConfirm
  ];
  const STORE_ALL_INSIGHT_SCENES = [
    ...STORE_CLOUD_INSIGHT_SCENES,
    SCENE_KEYS.storeReception,
    SCENE_KEYS.testDrive
  ];
  const getStoreInsightApplicableScenes = (type, title = '') => {
    if (type === 'risk') {
      if (title.includes('明确表达不满')) {
        return [SCENE_KEYS.inviteStore, SCENE_KEYS.scheduleConfirm, SCENE_KEYS.storeReception, SCENE_KEYS.testDrive];
      }
      if (title.includes('未及时表示歉意')) {
        return [SCENE_KEYS.scheduleConfirm, SCENE_KEYS.storeReception, SCENE_KEYS.testDrive];
      }
      return STORE_ALL_INSIGHT_SCENES;
    }
    if (title.includes('深度需求')) return STORE_CLOUD_INSIGHT_SCENES;
    if (title.includes('本品价值')) return [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception, SCENE_KEYS.testDrive];
    if (title.includes('竞品')) return [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception];
    if (title.includes('价格异议')) return [...STORE_CLOUD_INSIGHT_SCENES, SCENE_KEYS.storeReception];
    if (title.includes('版本配置')) return [SCENE_KEYS.inviteStore, SCENE_KEYS.storeReception];
    if (title.includes('承诺')) return STORE_ALL_INSIGHT_SCENES;
    return STORE_CLOUD_INSIGHT_SCENES;
  };

  const makeStoreInsightRule = (type, item, ruleIndex) => {
    const targetRate = Math.max(1, Math.min(100, Math.round(Number(item.animated_ratio ?? parseStoreIssuePercent(type === 'weakness' ? item.unhit_ratio : item.hit_ratio)))));
    const requestedAdvisorCount = Math.max(1, Math.min(TOTAL_ADVISOR_COUNT, Number(item.advisor_count) || 1));
    const hitCount = Math.max(requestedAdvisorCount, Number(type === 'weakness' ? item.unhit_count : item.hit_count) || requestedAdvisorCount);
    const sampleCount = Math.max(hitCount, Math.round(hitCount / Math.max(targetRate / 100, 0.01)));
    const seedNames = [...new Set((item.recordings || []).map(record => record.advisor).filter(Boolean))];
    const advisorNames = [...seedNames];
    storeSopPeople.forEach(person => {
      if (advisorNames.length < requestedAdvisorCount && !advisorNames.includes(person.name)) advisorNames.push(person.name);
    });
    const involvedAdvisors = advisorNames.slice(0, requestedAdvisorCount);
    const hitCounts = distributeStoreIssueTotal(hitCount, involvedAdvisors.length, ruleIndex);
    const extraSamples = distributeStoreIssueTotal(sampleCount - hitCount, involvedAdvisors.length, ruleIndex + 1);
    const applicableScenes = getStoreInsightApplicableScenes(type, item.title);
    const people = involvedAdvisors.map((name, personIndex) => {
      const personHitCount = hitCounts[personIndex];
      const personSampleCount = personHitCount + extraSamples[personIndex];
      const sceneHitCounts = distributeStoreIssueTotal(personHitCount, applicableScenes.length, ruleIndex + personIndex);
      const sceneExtraSamples = distributeStoreIssueTotal(personSampleCount - personHitCount, applicableScenes.length, ruleIndex + personIndex + 1);
      const advisor = advisorData.find(candidate => candidate.name === name);
      return {
        id: advisor?.id || `A${String(personIndex + 1).padStart(3, '0')}`,
        name,
        role: advisor?.role || '销售顾问',
        hitCount: personHitCount,
        sampleCount: personSampleCount,
        rate: personSampleCount ? Math.round(personHitCount * 100 / personSampleCount) : 0,
        sceneStats: applicableScenes.reduce((stats, sceneKey, sceneIndex) => {
          const sceneHitCount = sceneHitCounts[sceneIndex];
          const sceneSampleCount = sceneHitCount + sceneExtraSamples[sceneIndex];
          stats[sceneKey] = {
            hitCount: sceneHitCount,
            sampleCount: sceneSampleCount
          };
          return stats;
        }, {})
      };
    });
    const recordings = people.flatMap((person, personIndex) => {
      const seed = (item.recordings || []).find(record => record.advisor === person.name) || {};
      return applicableScenes.flatMap((sceneKey, sceneIndex) => (
        Array.from({ length: person.sceneStats[sceneKey].hitCount }, (_, recordingIndex) => ({
          advisor: person.name,
          customer: seed.customer || `${person.name}相关客户${sceneIndex + 1}-${recordingIndex + 1}`,
          time: sceneIndex === 0 && recordingIndex === 0 && seed.time
            ? seed.time
            : `3-${25 - ((ruleIndex + personIndex + sceneIndex + recordingIndex) % 4)} ${String(9 + ((ruleIndex + personIndex + recordingIndex) % 8)).padStart(2, '0')}:${String((ruleIndex * 7 + personIndex * 13 + sceneIndex * 5 + recordingIndex * 9) % 60).padStart(2, '0')}`,
          id: buildMockRecordingId(200000 + ruleIndex * 1000 + personIndex * 100 + sceneIndex * 10 + recordingIndex),
          sceneKey,
          scene: getSceneLabel(sceneKey)
        }))
      ));
    });
    const resolvedRate = sampleCount ? Math.round(hitCount * 100 / sampleCount) : 0;

    return {
      ...item,
      id: `store-${type}-${item.title}`,
      category: getStoreInsightCategory(type, item.title),
      hit_ratio: `${resolvedRate}%`,
      hit_count: hitCount,
      sample_count: sampleCount,
      advisor_count: people.length,
      applicableScenes,
      people,
      recordings
    };
  };

  const getStoreSelectedInsightScenes = () => {
    const selection = getStoreSceneSelection();
    return selection.isAllSelected ? selection.allowedScenes : selection.activeScenes;
  };

  const scopeStoreInsightRuleToCurrentScenes = (rule) => {
    const selectedScenes = new Set(getStoreSelectedInsightScenes());
    const applicableScenes = (rule.applicableScenes || []).filter(scene => selectedScenes.has(scene));
    if (!applicableScenes.length) return null;

    const scopedPeople = (rule.people || []).map(person => {
      const totals = applicableScenes.reduce((result, sceneKey) => {
        const stats = person.sceneStats?.[sceneKey] || {};
        result.hitCount += Number(stats.hitCount) || 0;
        result.sampleCount += Number(stats.sampleCount) || 0;
        return result;
      }, { hitCount: 0, sampleCount: 0 });
      return {
        ...person,
        ...totals,
        rate: totals.sampleCount ? Math.round(totals.hitCount * 100 / totals.sampleCount) : 0
      };
    });
    const hitCount = scopedPeople.reduce((sum, person) => sum + person.hitCount, 0);
    const sampleCount = scopedPeople.reduce((sum, person) => sum + person.sampleCount, 0);
    if (!hitCount || !sampleCount) return null;

    const people = scopedPeople.filter(person => person.hitCount > 0);
    const recordings = (rule.recordings || []).filter(record => applicableScenes.includes(record.sceneKey));
    return {
      ...rule,
      applicableScenes,
      hit_ratio: `${Math.round(hitCount * 100 / sampleCount)}%`,
      hit_count: hitCount,
      sample_count: sampleCount,
      advisor_count: people.length,
      people,
      recordings
    };
  };

  const STORE_ISSUE_RULE_CONFIG = {
    sop: {
      label: 'SOP执行分析',
      metricLabel: '命中率',
      countLabel: '命中/样本',
      countSortLabel: '命中数量',
      emptyText: '暂无匹配 SOP 规则',
      getRules: () => storeSopRuleData
    },
    strength: {
      label: '优势项识别',
      metricLabel: '优势命中率',
      countLabel: '命中/样本',
      countSortLabel: '命中数量',
      emptyText: '暂无匹配优势项规则',
      getRules: () => getFilteredStrengthData().map((item, index) => makeStoreInsightRule('strength', item, index))
    },
    weakness: {
      label: '短板项识别',
      metricLabel: '短板出现率',
      countLabel: '短板/样本',
      countSortLabel: '短板数量',
      emptyText: '暂无匹配短板项规则',
      getRules: () => getFilteredWeaknessData().map((item, index) => makeStoreInsightRule('weakness', item, index))
    },
    risk: {
      label: '风险命中分析',
      metricLabel: '风险命中率',
      countLabel: '命中/样本',
      countSortLabel: '命中数量',
      emptyText: '暂无匹配风险规则',
      getRules: () => getFilteredRiskData().map((item, index) => makeStoreInsightRule('risk', item, index))
    }
  };

  const getStoreIssueRuleConfig = (type = storeSopRuleState.activeTab) => (
    STORE_ISSUE_RULE_CONFIG[type] || STORE_ISSUE_RULE_CONFIG.sop
  );
  const getStoreIssueRules = (type = storeSopRuleState.activeTab) => {
    const rules = getStoreIssueRuleConfig(type).getRules();
    return rules.map(scopeStoreInsightRuleToCurrentScenes).filter(Boolean);
  };
  const getStoreIssueSortOptions = (config = getStoreIssueRuleConfig()) => STORE_SOP_SORT_OPTIONS.map(option => {
    if (option.value === 'rate-desc') return { ...option, label: `${config.metricLabel}从高到低` };
    if (option.value === 'rate-asc') return { ...option, label: `${config.metricLabel}从低到高` };
    if (option.value === 'count-desc') return { ...option, label: `${config.countSortLabel}优先` };
    return option;
  });

  const getVisibleStoreSopRules = (type = storeSopRuleState.activeTab, state = storeSopRuleState) => {
    const query = state.query.trim().toLocaleLowerCase('zh-CN');
    const visibleRules = getStoreIssueRules(type).filter(item => {
      if (!query) return true;
      return String(item.title || '').toLocaleLowerCase('zh-CN').includes(query);
    });

    return visibleRules.sort((a, b) => {
      const rateA = parseStoreIssuePercent(a.hit_ratio);
      const rateB = parseStoreIssuePercent(b.hit_ratio);
      if (state.sort === 'rate-asc') return rateA - rateB;
      if (state.sort === 'count-desc') return b.hit_count - a.hit_count || rateB - rateA;
      if (state.sort === 'sample-desc') return b.sample_count - a.sample_count || rateB - rateA;
      return rateB - rateA;
    });
  };

  const getStoreSopSortLabel = (state = storeSopRuleState) => {
    const options = getStoreIssueSortOptions();
    return options.find(option => option.value === state.sort)?.label || options[0].label;
  };

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

  const renderStoreSopMetricIcon = (type) => type === 'count'
    ? `<svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
        <circle cx="7" cy="9" r="1.7" fill="#8B5CF6"/><circle cx="7" cy="15.2" r="1.7" fill="#8B5CF6"/><circle cx="7" cy="21.4" r="1.7" fill="#8B5CF6"/>
        <path d="M11.8 9h11M11.8 15.2h11M11.8 21.4h11" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    : `<svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
        <path d="M15.2 4.2 24 7.4v6.58c0 4.94-3.28 9.56-8.8 12.22-5.52-2.66-8.8-7.28-8.8-12.22V7.4l8.8-3.2Z" fill="#22C55E"/>
        <path d="m10.6 15.2 3 3 6.4-7" stroke="#F0FDF4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const renderStoreInsightRank = (index) => {
    const rank = index + 1;
    if (rank <= 3) {
      return `<img class="store-insight-rank-image" src="../assets/store-issue-insight/rank-${rank}.png" alt="第 ${rank} 名">`;
    }
    return `<span class="store-insight-rank-number">${rank}</span>`;
  };

  const STORE_INSIGHT_TITLE_MAP = {
    strength: {
      '深度需求挖掘': '需求探询深入，有效建立邀约基础',
      '本品价值塑造': '本品卖点转化到位，到店理由充分',
      '竞品差异化对比': '竞品对比客观有力，有效拉回客户',
      '价格异议处理': '价格顾虑转化得当，引导到店详谈',
      '版本配置引导': '版本配置梳理清晰，看车目标明确',
    },
    weakness: {
      '深度需求挖掘': '需求探询不足，未能建立邀约基础',
      '本品价值塑造': '本品卖点转化不足，到店理由欠缺',
      '竞品差异化对比': '竞品对比薄弱，未能有效拉回客户',
      '价格异议处理': '价格顾虑转化不足，未引导到店详谈',
      '版本配置引导': '版本配置梳理不清，看车目标模糊',
    },
  };

  const getStoreInsightDisplayTitle = (rule, type) => (
    STORE_INSIGHT_TITLE_MAP[type]?.[rule.title] || rule.title
  );

  const renderStoreInsightTopFiveList = (visibleRules, state = storeInsightRuleState) => {
    const config = getStoreIssueRuleConfig(state.activeTab);
    const rules = visibleRules.slice(0, 5);

    return `
      <div class="store-insight-top-list" aria-label="${escapeHtml(config.label)} TOP5">
        ${rules.map((rule, index) => {
          const rate = Math.max(0, Math.min(100, parseStoreIssuePercent(rule.hit_ratio)));
          const scope = getScopeMeta(rule.advisor_count);
          const scopeLabel = scope.text
            .replace('团队共性', '共性')
            .replace('多人表现', '多人')
            .replace('个人表现', '个人');
          const displayTitle = getStoreInsightDisplayTitle(rule, state.activeTab);
          return `
            <article class="store-insight-top-card" role="button" tabindex="0" data-store-insight-rule-id="${escapeHtml(rule.id)}" aria-label="查看${escapeHtml(displayTitle)}相关录音">
              <span class="store-insight-rank">${renderStoreInsightRank(index)}</span>
              <div class="store-insight-main">
                <strong class="store-insight-title">${escapeHtml(displayTitle)}</strong>
                <div class="store-insight-progress-row">
                  <span class="store-insight-progress" aria-hidden="true"><i style="width:${rate}%"></i></span>
                  <span class="store-insight-rate">${escapeHtml(rule.hit_ratio)}</span>
                </div>
              </div>
              <div class="store-insight-actions">
                <span class="store-insight-scope scope-${scope.type}">${escapeHtml(scopeLabel)}</span>
                <button type="button" class="store-insight-view" data-store-sop-rule-id="${escapeHtml(rule.id)}" aria-label="查看${escapeHtml(displayTitle)}详情">查看</button>
              </div>
            </article>
          `;
        }).join('') || `<div class="issue-rule-empty">${escapeHtml(config.emptyText)}</div>`}
      </div>
    `;
  };

  const renderStoreSopRuleList = (visibleRules, state = storeSopRuleState) => {
    const config = getStoreIssueRuleConfig(state.activeTab);
    const totalPages = Math.max(1, Math.ceil(visibleRules.length / STORE_ISSUE_PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(totalPages, state.page || 1));
    state.page = currentPage;
    const offset = (currentPage - 1) * STORE_ISSUE_PAGE_SIZE;
    const pagedRules = visibleRules.slice(offset, offset + STORE_ISSUE_PAGE_SIZE);
    const rows = pagedRules.map(rule => `
      <div class="issue-rule-row" data-store-sop-rule-id="${escapeHtml(rule.id)}">
        <span class="issue-rule-name">
          <span class="issue-rule-name-line">
            <span class="issue-rule-name-copy">
              <strong class="issue-rule-name-text" data-rule-name-ellipsis-target tabindex="0">${escapeHtml(rule.title)}</strong>
              <span class="issue-rule-name-popover" role="tooltip">${escapeHtml(rule.title)}</span>
            </span>
            ${renderIssueRuleSceneTags((rule.applicableScenes || []).length
              ? rule.applicableScenes.map(getSceneLabel)
              : [rule.category])}
          </span>
        </span>
        <span class="issue-rule-rate">${escapeHtml(rule.hit_ratio)}</span>
        <span class="issue-rule-count">${rule.hit_count}/${rule.sample_count}</span>
        <button type="button" class="issue-rule-action" data-store-sop-rule-id="${escapeHtml(rule.id)}" aria-label="查看${escapeHtml(rule.title)}的人员表现">看人员表现</button>
      </div>
    `).join('');

    return `
      <div class="issue-rule-toolbar">
        <label class="issue-rule-search">
          <span>搜索规则</span>
          <input class="issue-rule-search-input" type="search" value="${escapeHtml(state.query)}" placeholder="输入规则名称" autocomplete="off" data-store-sop-rule-search>
        </label>
        <div class="issue-rule-sort">
          <span>排序</span>
          <div class="issue-rule-sort-dropdown">
            <button type="button" class="issue-rule-sort-trigger store-model-trigger session-select-trigger" aria-haspopup="listbox" aria-expanded="false" data-store-sop-rule-sort-trigger>
              <span class="issue-rule-sort-value">${escapeHtml(getStoreSopSortLabel(state))}</span>
              <svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <div class="issue-rule-sort-panel store-model-panel session-menu-panel" role="listbox" aria-label="排序方式" data-store-sop-rule-sort-panel>
              <div class="session-menu-option-list">
                ${getStoreIssueSortOptions(config).map(option => `
                  <button type="button" class="issue-rule-sort-option store-model-option session-menu-option${state.sort === option.value ? ' active' : ''}" data-store-sop-rule-sort="${option.value}" role="option" aria-selected="${state.sort === option.value ? 'true' : 'false'}"><span>${escapeHtml(option.label)}</span></button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="issue-rule-list-shell store-sop-standard-list">
        <div class="issue-rule-list-head">
          <span class="issue-rule-name-head">规则名称</span>
          <span>${config.metricLabel}</span><span>${config.countLabel}</span><span>操作</span>
        </div>
        <div class="issue-rule-list">
          ${rows || `<div class="issue-rule-empty">${config.emptyText}</div>`}
        </div>
      </div>
      ${renderUnifiedIssueRulePagination({
        totalItems: visibleRules.length,
        currentPage,
        pageCount: totalPages,
        pageSize: STORE_ISSUE_PAGE_SIZE,
      })}
    `;
  };

  const renderStoreSopPeopleDetail = (rule, state = storeSopRuleState) => {
    const config = getStoreIssueRuleConfig(state.activeTab);
    const people = [...rule.people].sort((left, right) => {
      if (state.sort === 'rate-asc') return left.rate - right.rate || right.hitCount - left.hitCount;
      if (state.sort === 'count-desc') return right.hitCount - left.hitCount || right.rate - left.rate;
      if (state.sort === 'sample-desc') return right.sampleCount - left.sampleCount || right.hitCount - left.hitCount;
      return right.rate - left.rate || right.hitCount - left.hitCount;
    });

    return `
      <div class="issue-selected-metrics">
        <div class="issue-selected-metric-card">
          <div class="issue-selected-metric-main">
            <div class="issue-selected-metric-icon tone-green">${renderStoreSopMetricIcon('rate')}</div>
            <div class="issue-selected-metric-body">
              <span class="issue-selected-metric-label">${config.metricLabel}</span>
              <strong class="issue-selected-metric-value">${escapeHtml(rule.hit_ratio)}</strong>
            </div>
          </div>
        </div>
        <div class="issue-selected-metric-card">
          <div class="issue-selected-metric-main">
            <div class="issue-selected-metric-icon tone-violet">${renderStoreSopMetricIcon('count')}</div>
            <div class="issue-selected-metric-body">
              <span class="issue-selected-metric-label">${config.countLabel}</span>
              <strong class="issue-selected-metric-value">${rule.hit_count}/${rule.sample_count}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="issue-drill-actions">
        <button type="button" class="issue-rule-back" data-store-sop-rule-back>返回规则列表</button>
      </div>
      <div class="issue-org-rank-grid">
        <div class="issue-org-rank-card">
          <div class="issue-org-list-head">
            <span>门店人员</span><span>命中率</span><span>命中/样本</span><span>操作</span>
          </div>
          <div class="issue-org-rank-list">
            ${people.map((person, index) => `
              <button type="button" class="issue-org-row" data-store-sop-person="${escapeHtml(person.name)}">
                <span class="issue-org-main">
                  <em>${index + 1}</em>
                  <span class="store-sop-person-copy"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.role)}</small></span>
                </span>
                <span class="issue-org-rate">${person.rate}%</span>
                <span class="issue-org-count">${person.hitCount}/${person.sampleCount}</span>
                <span class="issue-org-drill drill-link">录音明细</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const renderStoreSopRuleSection = (rootId = 'store-issue-rule-analysis-root', state = storeSopRuleState) => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const visibleRules = state.activeTab === 'sop'
      ? getVisibleStoreSopRules(state.activeTab, state)
      : getStoreIssueRules(state.activeTab);
    const selectedRule = getStoreIssueRules(state.activeTab).find(rule => rule.id === state.selectedRuleId);
    root.innerHTML = selectedRule
      ? renderStoreSopPeopleDetail(selectedRule, state)
      : state.activeTab === 'sop'
        ? renderStoreSopRuleList(visibleRules, state)
        : renderStoreInsightTopFiveList(visibleRules, state);
    bindStoreSopRuleEvents(rootId, state);
    if (state.activeTab === 'sop') autoCollapseIssueRuleScenes(root);
  };

  const bindStoreSopRuleEvents = (rootId = 'store-issue-rule-analysis-root', state = storeSopRuleState) => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const searchInput = root.querySelector('[data-store-sop-rule-search]');
    const sortTrigger = root.querySelector('[data-store-sop-rule-sort-trigger]');
    const sortPanel = root.querySelector('[data-store-sop-rule-sort-panel]');
    const closeSortPanel = () => {
      sortPanel?.classList.remove('show');
      sortTrigger?.classList.remove('active');
      sortTrigger?.setAttribute('aria-expanded', 'false');
    };

    const applyStoreSopRuleSearch = (value) => {
      const nextQuery = value || '';
      if (state.query === nextQuery) return;
      state.query = nextQuery;
      state.page = 1;
      renderStoreSopRuleSection(rootId, state);
      const nextInput = root.querySelector('[data-store-sop-rule-search]');
      if (nextInput) {
        const position = nextInput.value.length;
        nextInput.focus();
        nextInput.setSelectionRange(position, position);
      }
    };

    searchInput?.addEventListener('input', (event) => {
      if (event.isComposing) return;
      applyStoreSopRuleSearch(event.currentTarget.value);
    });
    searchInput?.addEventListener('compositionend', (event) => applyStoreSopRuleSearch(event.currentTarget.value));
    searchInput?.addEventListener('search', (event) => applyStoreSopRuleSearch(event.currentTarget.value));

    sortTrigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !sortPanel?.classList.contains('show');
      closeSortPanel();
      if (willOpen) {
        sortPanel?.classList.add('show');
        sortTrigger.classList.add('active');
        sortTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    sortPanel?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-store-sop-rule-sort]');
      if (!option) return;
      state.sort = option.dataset.storeSopRuleSort || 'rate-desc';
      state.page = 1;
      closeSortPanel();
      renderStoreSopRuleSection(rootId, state);
    });

    const visibleRules = getVisibleStoreSopRules(state.activeTab, state);
    bindUnifiedIssueRulePagination(root, {
      currentPage: state.page,
      pageCount: Math.max(1, Math.ceil(visibleRules.length / STORE_ISSUE_PAGE_SIZE)),
      onPageChange: (targetPage) => {
        state.page = targetPage;
        renderStoreSopRuleSection(rootId, state);
      },
    });

    root.querySelectorAll('.issue-rule-action[data-store-sop-rule-id], .store-insight-view[data-store-sop-rule-id]').forEach(actionBtn => {
      actionBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (state.activeTab !== 'sop') {
          window.openStoreIssueRecordingLibrary(state.activeTab, actionBtn.dataset.storeSopRuleId);
          return;
        }
        state.selectedRuleId = actionBtn.dataset.storeSopRuleId;
        renderStoreSopRuleSection(rootId, state);
      });
    });

    root.querySelectorAll('[data-store-insight-rule-id]').forEach(card => {
      const openInsightRecordings = () => {
        window.openStoreIssueRecordingLibrary(state.activeTab, card.dataset.storeInsightRuleId);
      };
      card.addEventListener('click', openInsightRecordings);
      card.addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        openInsightRecordings();
      });
    });

    root.querySelector('[data-store-sop-rule-back]')?.addEventListener('click', () => {
      state.selectedRuleId = null;
      renderStoreSopRuleSection(rootId, state);
    });

    root.querySelectorAll('[data-store-sop-person]').forEach(row => {
      row.addEventListener('click', () => {
        if (!state.selectedRuleId) return;
        window.openStoreIssueRecordingLibrary(state.activeTab, state.selectedRuleId, row.dataset.storeSopPerson || '');
      });
    });

    if (!document.body.dataset.storeSopSortBound) {
      document.body.dataset.storeSopSortBound = 'true';
      document.addEventListener('click', (event) => {
        ['store-issue-rule-analysis-root', 'store-issue-sop-analysis-root'].forEach(id => {
          const activeRoot = document.getElementById(id);
          const activeTrigger = activeRoot?.querySelector('[data-store-sop-rule-sort-trigger]');
          const activePanel = activeRoot?.querySelector('[data-store-sop-rule-sort-panel]');
          if (!activeTrigger || !activePanel) return;
          if (activeTrigger.contains(event.target) || activePanel.contains(event.target)) return;
          activePanel.classList.remove('show');
          activeTrigger.classList.remove('active');
          activeTrigger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  };

  function renderStoreIssueSections() {
    renderStoreSopRuleSection('store-issue-sop-analysis-root', storeSopRuleState);
    renderStoreSopRuleSection('store-issue-rule-analysis-root', storeInsightRuleState);
  }

  renderStoreIssueSections();
  initStickyFilterBars();

  // 录音库弹窗
  let storeRecordingLibraryState = null;

  const getStoreRecordingFilterDateValue = (time) => {
    const match = String(time || '').match(/(\d{1,2})[-/](\d{1,2})/);
    if (!match) return '';
    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    return `2026-${month}-${day}`;
  };

  const getStoreRecordingDateLimitRange = (records = []) => {
    const values = records
      .map((record) => getStoreRecordingFilterDateValue(record.time))
      .filter(Boolean)
      .sort();

    if (!values.length) {
      const todayValue = formatSessionDateValue(new Date());
      const todayDate = parseSessionDateValue(todayValue) || new Date();
      return {
        minValue: todayValue,
        maxValue: todayValue,
        minDate: todayDate,
        maxDate: todayDate
      };
    }

    const minValue = values[0];
    const maxValue = values[values.length - 1];
    return {
      minValue,
      maxValue,
      minDate: parseSessionDateValue(minValue) || new Date(),
      maxDate: parseSessionDateValue(maxValue) || new Date()
    };
  };

  const syncStoreRecordingDateView = (value) => {
    const { maxDate } = getStoreRecordingDateLimitRange(storeRecordingLibraryState?.records || []);
    const target = parseSessionDateValue(value) || maxDate;
    storeRecordingLibraryState.dateViewYear = target.getFullYear();
    storeRecordingLibraryState.dateViewMonth = target.getMonth() + 1;
  };

  const shiftStoreRecordingDateView = (offset) => {
    const { minDate, maxDate } = getStoreRecordingDateLimitRange(storeRecordingLibraryState?.records || []);
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = storeRecordingLibraryState.dateViewYear * 12 + storeRecordingLibraryState.dateViewMonth - 1;
    const nextMonthIndex = Math.min(maxMonthIndex, Math.max(minMonthIndex, currentMonthIndex + offset));

    storeRecordingLibraryState.dateViewYear = Math.floor(nextMonthIndex / 12);
    storeRecordingLibraryState.dateViewMonth = (nextMonthIndex % 12) + 1;
  };

  const renderStoreRecordingDateMenu = () => {
    if (!storeRecordingLibraryState) return '';

    const { minDate, maxDate, minValue, maxValue } = getStoreRecordingDateLimitRange(storeRecordingLibraryState.records || []);
    const selectedValue = storeRecordingLibraryState.dateDraftDate || storeRecordingLibraryState.dateValue || '';
    const cells = getSessionDateCells(storeRecordingLibraryState.dateViewYear, storeRecordingLibraryState.dateViewMonth);
    const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth();
    const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    const currentMonthIndex = storeRecordingLibraryState.dateViewYear * 12 + storeRecordingLibraryState.dateViewMonth - 1;
    const disablePrevMonth = currentMonthIndex <= minMonthIndex;
    const disableNextMonth = currentMonthIndex >= maxMonthIndex;

    return `
      <div class="session-menu-panel session-menu-panel-date">
        <div class="session-date-panel-head">
          <div class="session-date-panel-copy">
            <span>选择日期</span>
            <strong>${escapeHtml(selectedValue ? formatSessionDateDisplay(selectedValue) : '未选择')}</strong>
          </div>
          <div class="session-date-nav">
            <button type="button" class="session-date-nav-btn" data-store-recording-date-nav="-1" aria-label="上一个月"${disablePrevMonth ? ' disabled' : ''}>
              <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
            </button>
            <strong>${escapeHtml(formatSessionMonthLabel(storeRecordingLibraryState.dateViewYear, storeRecordingLibraryState.dateViewMonth))}</strong>
            <button type="button" class="session-date-nav-btn" data-store-recording-date-nav="1" aria-label="下一个月"${disableNextMonth ? ' disabled' : ''}>
              <i class="session-date-nav-arrow next" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="session-date-weekdays">
          <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
        </div>
        <div class="session-date-grid">
          ${cells.map((date) => {
            if (!date) {
              return '<span class="session-date-empty" aria-hidden="true"></span>';
            }

            const dateValue = formatSessionDateValue(date);
            const isDisabled = dateValue < minValue || dateValue > maxValue;
            const isSelected = dateValue === selectedValue;
            return `
              <button
                type="button"
                class="session-date-day${isDisabled ? ' is-disabled' : ''}${isSelected ? ' is-start is-end in-range' : ''}"
                ${isDisabled ? 'disabled' : `data-store-recording-date-value="${escapeHtml(dateValue)}"`}
              >
                ${date.getDate()}
              </button>
            `;
          }).join('')}
        </div>
        <div class="session-date-shortcuts">
          <button type="button" class="session-date-shortcut" data-store-recording-date-shortcut="${escapeHtml(minValue)}">最早一天</button>
          <button type="button" class="session-date-shortcut" data-store-recording-date-shortcut="${escapeHtml(maxValue)}">最近一天</button>
          ${storeRecordingLibraryState.dateValue ? '<button type="button" class="session-date-shortcut" data-store-recording-date-clear="true">清空日期</button>' : ''}
        </div>
        <div class="session-cascader-footer session-date-footer">
          <span>${escapeHtml(selectedValue ? `已选择 ${formatSessionDateDisplay(selectedValue)}` : '未选择日期')}</span>
          <div class="session-date-actions">
            <button type="button" class="btn session-date-action-btn" data-store-recording-date-cancel="true">取消</button>
            <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-store-recording-date-apply="true">应用日期</button>
          </div>
        </div>
      </div>
    `;
  };

  const closeStoreRecordingDatePicker = () => {
    if (!storeRecordingLibraryState?.dateOpen) return;
    storeRecordingLibraryState.dateOpen = false;
    renderStoreRecordingDateControl();
  };

  const getStoreRecordingFilterLabel = (value) => {
    const labelMap = {
      advisor: '按销售姓名',
      customer: '按客户姓名',
      id: '按录音ID'
    };
    return labelMap[value] || '按销售姓名';
  };

  const getStoreRecordingFilterPlaceholder = (value) => {
    const placeholderMap = {
      advisor: '输入销售姓名',
      customer: '输入客户姓名',
      id: '输入录音ID'
    };
    return placeholderMap[value] || '输入筛选关键词';
  };

  const renderStoreRecordingFilterMenu = () => {
    if (!storeRecordingLibraryState?.filterOpen) return '';
    return `
      <div class="recording-library-filter-panel session-menu-panel">
        <div class="session-menu-option-list">
          ${['advisor', 'customer', 'id'].map((value) => `
            <button
              type="button"
              class="recording-library-filter-option session-menu-option${storeRecordingLibraryState.filterType === value ? ' active' : ''}"
              data-store-recording-filter-value="${value}">
              <span>${getStoreRecordingFilterLabel(value)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  };

  const closeStoreRecordingFilterMenu = () => {
    if (!storeRecordingLibraryState?.filterOpen) return;
    storeRecordingLibraryState.filterOpen = false;
    renderStoreRecordingFilterControl();
  };

  const bindStoreRecordingFilterEvents = () => {
    const host = document.getElementById('issue-recording-library-filter-control');
    if (!host) return;

    host.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    host.querySelectorAll('[data-store-recording-filter-trigger]').forEach((node) => {
      node.addEventListener('click', () => {
        if (!storeRecordingLibraryState) return;
        if (storeRecordingLibraryState.filterOpen) {
          closeStoreRecordingFilterMenu();
          return;
        }
        if (storeRecordingLibraryState.dateOpen) {
          closeStoreRecordingDatePicker();
        }
        storeRecordingLibraryState.filterOpen = true;
        renderStoreRecordingFilterControl();
      });
    });

    host.querySelectorAll('[data-store-recording-filter-value]').forEach((node) => {
      node.addEventListener('click', () => {
        if (!storeRecordingLibraryState) return;
        storeRecordingLibraryState.filterType = node.dataset.storeRecordingFilterValue || 'advisor';
        storeRecordingLibraryState.filterOpen = false;
        storeRecordingLibraryState.query = '';
        storeRecordingLibraryState.page = 1;
        renderStoreRecordingFilterControl();
        renderStoreRecordingLibraryList();
        setTimeout(() => {
          document.getElementById('issue-recording-library-search')?.focus();
        }, 0);
      });
    });

    host.querySelectorAll('#issue-recording-library-search').forEach((node) => {
      node.addEventListener('input', (event) => {
        if (!storeRecordingLibraryState) return;
        storeRecordingLibraryState.query = event.target.value;
        storeRecordingLibraryState.page = 1;
        renderStoreRecordingLibraryList();
      });
    });
  };

  const renderStoreRecordingFilterControl = () => {
    const host = document.getElementById('issue-recording-library-filter-control');
    if (!host || !storeRecordingLibraryState) return;

    host.innerHTML = `
      <div class="recording-library-filter-select-wrap">
        <button
          type="button"
          class="recording-library-filter-trigger${storeRecordingLibraryState.filterOpen ? ' active' : ''}"
          data-store-recording-filter-trigger="true"
          aria-label="选择筛选字段">
          <span>${getStoreRecordingFilterLabel(storeRecordingLibraryState.filterType)}</span>
          <span class="session-select-caret" aria-hidden="true"></span>
        </button>
        ${renderStoreRecordingFilterMenu()}
      </div>
      <div class="recording-library-search-field">
        <input
          id="issue-recording-library-search"
          type="search"
          placeholder="${escapeHtml(getStoreRecordingFilterPlaceholder(storeRecordingLibraryState.filterType))}"
          autocomplete="off"
          value="${escapeHtml(storeRecordingLibraryState.query || '')}">
        <span class="session-search-icon" aria-hidden="true"></span>
      </div>
    `;

    bindStoreRecordingFilterEvents();
  };

  const openStoreRecordingDatePicker = () => {
    if (!storeRecordingLibraryState) return;
    if (storeRecordingLibraryState.filterOpen) {
      storeRecordingLibraryState.filterOpen = false;
      renderStoreRecordingFilterControl();
    }
    storeRecordingLibraryState.dateOpen = true;
    storeRecordingLibraryState.dateDraftDate = storeRecordingLibraryState.dateValue || '';
    syncStoreRecordingDateView(storeRecordingLibraryState.dateDraftDate);
    renderStoreRecordingDateControl();
  };

  const applyStoreRecordingDateFilter = () => {
    if (!storeRecordingLibraryState) return;
    storeRecordingLibraryState.dateValue = storeRecordingLibraryState.dateDraftDate || '';
    storeRecordingLibraryState.dateOpen = false;
    storeRecordingLibraryState.page = 1;
    renderStoreRecordingDateControl();
    renderStoreRecordingLibraryList();
  };

  const clearStoreRecordingDateFilter = () => {
    if (!storeRecordingLibraryState) return;
    storeRecordingLibraryState.dateValue = '';
    storeRecordingLibraryState.dateDraftDate = '';
    storeRecordingLibraryState.dateOpen = false;
    storeRecordingLibraryState.page = 1;
    renderStoreRecordingDateControl();
    renderStoreRecordingLibraryList();
  };

  const bindStoreRecordingDateEvents = () => {
    const host = document.getElementById('issue-recording-library-date-control');
    if (!host) return;

    host.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    host.querySelectorAll('[data-store-recording-date-trigger]').forEach((node) => {
      node.addEventListener('click', () => {
        if (storeRecordingLibraryState?.dateOpen) {
          closeStoreRecordingDatePicker();
          return;
        }
        openStoreRecordingDatePicker();
      });
    });

    host.querySelectorAll('[data-store-recording-date-nav]').forEach((node) => {
      node.addEventListener('click', () => {
        shiftStoreRecordingDateView(Number(node.dataset.storeRecordingDateNav));
        renderStoreRecordingDateControl();
      });
    });

    host.querySelectorAll('[data-store-recording-date-value]').forEach((node) => {
      node.addEventListener('click', () => {
        storeRecordingLibraryState.dateDraftDate = node.dataset.storeRecordingDateValue || '';
        renderStoreRecordingDateControl();
      });
    });

    host.querySelectorAll('[data-store-recording-date-shortcut]').forEach((node) => {
      node.addEventListener('click', () => {
        storeRecordingLibraryState.dateDraftDate = node.dataset.storeRecordingDateShortcut || '';
        syncStoreRecordingDateView(storeRecordingLibraryState.dateDraftDate);
        renderStoreRecordingDateControl();
      });
    });

    host.querySelectorAll('[data-store-recording-date-clear]').forEach((node) => {
      node.addEventListener('click', () => {
        clearStoreRecordingDateFilter();
      });
    });

    host.querySelectorAll('[data-store-recording-date-cancel]').forEach((node) => {
      node.addEventListener('click', () => {
        closeStoreRecordingDatePicker();
      });
    });

    host.querySelectorAll('[data-store-recording-date-apply]').forEach((node) => {
      node.addEventListener('click', () => {
        applyStoreRecordingDateFilter();
      });
    });
  };

  const renderStoreRecordingDateControl = () => {
    const host = document.getElementById('issue-recording-library-date-control');
    if (!host || !storeRecordingLibraryState) return;

    const selectedValue = storeRecordingLibraryState.dateValue;
    host.innerHTML = `
      <div class="recording-library-date-root${storeRecordingLibraryState.dateOpen ? ' is-open' : ''}">
        <button type="button" class="session-date-trigger${storeRecordingLibraryState.dateOpen ? ' active' : ''}" data-store-recording-date-trigger="true" aria-label="日期筛选">
          <span>日期</span>
          <strong>${escapeHtml(selectedValue ? formatSessionDateDisplay(selectedValue) : '请选择日期')}</strong>
          <span class="session-date-icon" aria-hidden="true"></span>
        </button>
        ${storeRecordingLibraryState.dateOpen ? renderStoreRecordingDateMenu() : ''}
      </div>
    `;

    bindStoreRecordingDateEvents();
  };

  const renderStoreInsightDialogFilters = () => {
    if (!storeRecordingLibraryState) return '';
    const { minValue, maxValue } = getStoreRecordingDateLimitRange(storeRecordingLibraryState.records || []);
    const searchIcon = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"></circle>
        <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>`;
    return `
      <div class="uat-review-dialog-filter-card">
        <div class="uat-review-dialog-filters">
          <label class="uat-review-filter-item session-toolbar-control">
            <span class="uat-review-filter-label">顾问姓名</span>
            <span class="uat-review-filter-field">
              <input type="search" data-store-review-filter="advisorQuery" placeholder="请输入顾问姓名" autocomplete="off" value="${escapeHtml(storeRecordingLibraryState.advisorQuery || '')}">
              <i>${searchIcon}</i>
            </span>
          </label>
          <label class="uat-review-filter-item session-toolbar-control">
            <span class="uat-review-filter-label">客户姓名</span>
            <span class="uat-review-filter-field">
              <input type="search" data-store-review-filter="customerQuery" placeholder="请输入客户姓名" autocomplete="off" value="${escapeHtml(storeRecordingLibraryState.customerQuery || '')}">
              <i>${searchIcon}</i>
            </span>
          </label>
          <label class="uat-review-filter-item session-toolbar-control">
            <span class="uat-review-filter-label">录音ID</span>
            <span class="uat-review-filter-field">
              <input type="search" data-store-review-filter="idQuery" placeholder="请输入录音ID" autocomplete="off" value="${escapeHtml(storeRecordingLibraryState.idQuery || '')}">
              <i>${searchIcon}</i>
            </span>
          </label>
          <label class="uat-review-filter-item session-toolbar-control">
            <span class="uat-review-filter-label">时间</span>
            <span class="uat-review-date-range">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"></rect><path d="M7 3v4M17 3v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>
              <input type="date" data-store-review-date="startDate" min="${minValue}" max="${maxValue}" value="${escapeHtml(storeRecordingLibraryState.startDate || minValue)}">
              <em>至</em>
              <input type="date" data-store-review-date="endDate" min="${minValue}" max="${maxValue}" value="${escapeHtml(storeRecordingLibraryState.endDate || maxValue)}">
            </span>
          </label>
        </div>
      </div>`;
  };

  const bindStoreInsightDialogFilters = () => {
    if (!storeRecordingLibraryState) return;
    document.querySelectorAll('[data-store-review-filter]').forEach((input) => {
      input.addEventListener('input', (event) => {
        if (!storeRecordingLibraryState) return;
        storeRecordingLibraryState[event.currentTarget.dataset.storeReviewFilter] = event.currentTarget.value;
        renderStoreRecordingLibraryList();
      });
    });
    document.querySelectorAll('[data-store-review-date]').forEach((input) => {
      input.addEventListener('change', (event) => {
        if (!storeRecordingLibraryState) return;
        storeRecordingLibraryState[event.currentTarget.dataset.storeReviewDate] = event.currentTarget.value;
        renderStoreRecordingLibraryList();
      });
    });
  };

  window.openStoreIssueRecordingLibrary = function(type, ruleRef, advisorName = '') {
    const items = getStoreIssueRules(type);
    const issue = typeof ruleRef === 'number'
      ? getVisibleStoreSopRules(type)[ruleRef]
      : items.find(item => item.id === ruleRef);
    if (!issue) return;

    const existing = document.getElementById('issue-recording-library-overlay');
    if (existing) existing.remove();

    const allAdvisors = ['林涛', '张华', '王萌', '赵强', '李昱', '韩宇', '许明', '陈亮'];
    const fallbackTimes = ['3-25 15:20', '3-25 11:05', '3-24 16:40', '3-24 10:15', '3-23 14:20'];
    const baseId = type === 'risk' ? 2087346132915122176n : 2087346017925713920n;
    const advisorOrgMap = {
      '林涛': '华南大区-粤桂战区-广州店-林涛',
      '张华': '华南大区-粤桂战区-深圳店-张华',
      '王萌': '华东大区-浙沪战区-杭州店-王萌',
      '赵强': '华北大区-京津战区-北京店-赵强',
      '李昱': '华东大区-浙沪战区-上海店-李昱',
      '韩宇': '华中大区-湘鄂战区-武汉店-韩宇',
      '许明': '华中大区-湘鄂战区-长沙店-许明',
      '陈亮': '西南大区-云贵战区-昆明店-陈亮'
    };

    const isAdvisorScoped = Boolean(advisorName);
    const isInsightDialog = type !== 'sop' && !isAdvisorScoped;
    const allRecords = (issue.recordings || []).map((r, i) => ({
      ...r,
      id: String(baseId + BigInt(i)),
      time: r.time || fallbackTimes[i % fallbackTimes.length],
      customer: r.customer || `${r.advisor || '顾问'}相关客户`,
      orgPath: `${r.orgPath || advisorOrgMap[r.advisor] || r.advisor}-${r.customer || `${r.advisor || '顾问'}相关客户`}`
    }));
    const records = isAdvisorScoped
      ? allRecords.filter(record => record.advisor === advisorName)
      : allRecords;

    const { maxDate } = getStoreRecordingDateLimitRange(records);
    storeRecordingLibraryState = {
      type,
      issue,
      records,
      isInsightDialog,
      query: '',
      dateValue: '',
      dateDraftDate: '',
      dateOpen: false,
      dateViewYear: maxDate.getFullYear(),
      dateViewMonth: maxDate.getMonth() + 1,
      filterType: 'advisor',
      filterOpen: false,
      advisorQuery: '',
      customerQuery: '',
      idQuery: '',
      startDate: '',
      endDate: '',
      page: 1
    };

    const overlay = document.createElement('div');
    overlay.id = 'issue-recording-library-overlay';
    overlay.className = `issue-recording-library-overlay store-recording-library-overlay${isInsightDialog ? ' uat-review-recording-overlay' : ''}`;
    const insightCategoryLabel = type === 'strength'
      ? '优势发掘TOP5'
      : type === 'weakness'
        ? '待改善短板TOP5'
        : '风险命中TOP5';
    const insightSubtitle = type === 'risk'
      ? '筛选风险命中项的原始录音，支持按销售顾问、客户姓名、录音ID筛选。'
      : '筛选未达标项的原始录音，支持按销售顾问、客户姓名、录音ID筛选。';
    overlay.innerHTML = isInsightDialog ? `
      <section class="issue-recording-library-page uat-review-recording-dialog" role="dialog" aria-modal="true" aria-labelledby="issue-recording-library-title">
        <div class="recording-library-head">
          <div>
            <h2 id="issue-recording-library-title">${escapeHtml(insightCategoryLabel)} · ${escapeHtml(getStoreInsightDisplayTitle(issue, type))}</h2>
            <p>${escapeHtml(insightSubtitle)}</p>
          </div>
          <button type="button" class="recording-library-close" aria-label="关闭录音列表" onclick="closeStoreIssueRecordingLibrary()">×</button>
        </div>
        <div class="uat-review-dialog-body">
          ${renderStoreInsightDialogFilters()}
          <div class="recording-library-result-row"><span id="issue-recording-library-result"></span></div>
          <div class="recording-library-list" id="issue-recording-library-list"></div>
        </div>
      </section>` : `
      <section class="issue-recording-library-page" role="dialog" aria-modal="true" aria-labelledby="issue-recording-library-title">
        <div class="recording-library-head">
          <div>
            <h2 id="issue-recording-library-title">${type === 'sop' ? 'SOP 质检录音' : type === 'risk' ? '风险命中录音' : type === 'strength' ? '优势项录音' : '短板项录音'}·${escapeHtml(type === 'sop' ? issue.title : getStoreInsightDisplayTitle(issue, type))}${advisorName ? `·${escapeHtml(advisorName)}` : ''}</h2>
            <p>${isAdvisorScoped ? `集中展示${escapeHtml(advisorName)}在该规则下的录音证据。` : `${type === 'weakness' ? '按短板出现样本查看原声证据' : type === 'strength' ? '按优势命中样本查看原声证据' : type === 'risk' ? '按风险命中样本查看原声证据' : '按规则命中样本查看原声证据'}，支持按销售姓名、客户姓名、日期、录音ID筛选。`}</p>
          </div>
          <button type="button" class="recording-library-close" aria-label="关闭录音列表" onclick="closeStoreIssueRecordingLibrary()">×</button>
        </div>
        ${isAdvisorScoped ? '' : `<div class="recording-library-summary">
          ${renderStoreRecordingSummaryCard({
            icon: 'list',
            tone: 'violet',
            label: '全部录音',
            value: String(records.length)
          })}
          ${renderStoreRecordingSummaryCard({
            icon: 'users',
            tone: 'blue',
            label: '涉及顾问',
            value: `${issue.advisor_count || 0}/${allAdvisors.length}`
          })}
        </div>`}
        ${isAdvisorScoped ? '' : `<div class="recording-library-tools">
          <label class="recording-library-search">
            <div class="recording-library-filter-group">
              <div class="recording-library-filter-control" id="issue-recording-library-filter-control"></div>
              <div class="recording-library-date-control" id="issue-recording-library-date-control"></div>
            </div>
          </label>
        </div>`}
        <div class="recording-library-result-row">
          <span id="issue-recording-library-result"></span>
        </div>
        <div class="recording-library-list" id="issue-recording-library-list"></div>
      </section>`;

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeStoreIssueRecordingLibrary();
    });
    overlay.querySelector('.issue-recording-library-page')?.addEventListener('click', () => {
      if (storeRecordingLibraryState?.dateOpen) {
        closeStoreRecordingDatePicker();
      }
      if (storeRecordingLibraryState?.filterOpen) {
        closeStoreRecordingFilterMenu();
      }
    });
    document.body.appendChild(overlay);

    if (isInsightDialog) {
      bindStoreInsightDialogFilters();
    } else if (!isAdvisorScoped) {
      renderStoreRecordingFilterControl();
      renderStoreRecordingDateControl();
    }
    renderStoreRecordingLibraryList();
    if (!isAdvisorScoped && !isInsightDialog) {
      setTimeout(() => document.getElementById('issue-recording-library-search')?.focus(), 0);
    }
  };

  window.closeStoreIssueRecordingLibrary = function() {
    const overlay = document.getElementById('issue-recording-library-overlay');
    if (overlay) overlay.remove();
    storeRecordingLibraryState = null;
  };

  function renderStoreRecordingSummaryCard(metric) {
    return `
      <div class="recording-library-summary-card execution-metric tone-${metric.tone}">
        <div class="execution-metric-main">
          <div class="execution-metric-icon tone-${metric.tone}">
            ${getExecutionMetricIcon(metric.icon, metric.tone)}
          </div>
          <div class="execution-metric-body">
            <div class="execution-metric-label">${metric.label}</div>
            <div class="execution-metric-value">${metric.value}</div>
          </div>
        </div>
      </div>
    `
  }

  const renderStoreRecordingLibraryList = ({ append = false } = {}) => {
    if (!storeRecordingLibraryState) return;
    const { records, query, dateValue, filterType, page, advisorQuery, customerQuery, idQuery, startDate, endDate, isInsightDialog } = storeRecordingLibraryState;
    const listEl = document.getElementById('issue-recording-library-list');
    const resultEl = document.getElementById('issue-recording-library-result');
    const loadMoreBtn = document.getElementById('issue-recording-library-more');
    if (!listEl || !resultEl) return;

    const PAGE_SIZE = 10;
    const normalizedQuery = String(query || '').trim();
    const getFilterTarget = (record) => {
      if (filterType === 'customer') return record.customer || '';
      if (filterType === 'id') return record.id || '';
      return record.advisor || '';
    };
    const normalizedDateValue = String(dateValue || '').trim();
    const filtered = records.filter((r) => {
      const matchPrimary = normalizedQuery
        ? String(getFilterTarget(r)).includes(normalizedQuery)
        : true;
      const matchDate = normalizedDateValue
        ? getStoreRecordingFilterDateValue(r.time) === normalizedDateValue
        : true;
      const recordDate = getStoreRecordingFilterDateValue(r.time);
      const matchAdvisor = advisorQuery ? String(r.advisor || '').includes(advisorQuery.trim()) : true;
      const matchCustomer = customerQuery ? String(r.customer || '').includes(customerQuery.trim()) : true;
      const matchId = idQuery ? String(r.id || '').includes(idQuery.trim()) : true;
      const matchStartDate = startDate ? recordDate >= startDate : true;
      const matchEndDate = endDate ? recordDate <= endDate : true;
      return matchPrimary && matchDate && matchAdvisor && matchCustomer && matchId && matchStartDate && matchEndDate;
    });

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageRecords = isInsightDialog
      ? filtered.slice(0, 6)
      : append
        ? filtered.slice(start, start + PAGE_SIZE)
        : filtered.slice(0, page * PAGE_SIZE);
    const hasMore = page * PAGE_SIZE < total;

    resultEl.textContent = `共 ${isInsightDialog ? pageRecords.length : total} 条`;
    if (loadMoreBtn) loadMoreBtn.hidden = isInsightDialog || !hasMore;

    if (pageRecords.length === 0 && !append) {
      listEl.innerHTML = '<div class="recording-library-empty">暂无匹配录音</div>';
      return;
    }

    const html = pageRecords.map(r => `
      <div class="recording-library-row" data-store-recording-row>
        <div class="recording-library-play">
          <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none" aria-hidden="true">
            <path d="M515.6 635.7c51 0 99.1-20 135.4-56.3 36.3-36.3 56.3-84.4 56.3-135.4V256.5c0-51-20-99.1-56.3-135.4-36.3-36.3-84.4-56.3-135.4-56.3s-99.1 20-135.4 56.3C344 157.4 324 205.5 324 256.5v187.6c0 51 20 99.1 56.3 135.4 36.2 36.2 84.3 56.2 135.3 56.2zM394 256.5c0-67.1 54.6-121.6 121.6-121.6 67.1 0 121.6 54.6 121.6 121.6v187.6c0 67.1-54.6 121.6-121.6 121.6-67.1 0-121.6-54.6-121.6-121.6V256.5z" fill="currentColor"></path>
            <path d="M787.7 436.9c-19.3 0-35 15.7-35 35 0 128.1-104.3 232.4-232.4 232.4H511c-128.1 0-232.4-104.3-232.4-232.4 0-19.3-15.7-35-35-35s-35 15.7-35 35c0 40.7 8 80.2 23.9 117.5 15.3 36 37.1 68.3 64.9 96.1 27.8 27.8 60.1 49.6 96.1 64.9 28.1 11.9 57.4 19.4 87.6 22.4V889h-66.5c-19 0-34.6 15.6-34.6 34.6s15.6 34.6 34.6 34.6H620c19 0 34.6-15.6 34.6-34.6S639 889 620 889h-69.7V772.8c30.1-3 59.5-10.5 87.6-22.4 36-15.3 68.3-37.1 96.1-64.9 27.8-27.8 49.6-60.1 64.9-96.1 15.8-37.3 23.9-76.8 23.9-117.5-0.1-19.3-15.8-35-35.1-35z" fill="currentColor"></path>
          </svg>
        </div>
        <div class="recording-library-main">
          <strong>${r.orgPath}</strong>
          <span>${r.time} · ${r.id}</span>
        </div>
        <button type="button" class="recording-library-detail" onclick="openRecordingPlayer('${r.id}')" aria-label="查看录音详情">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>`).join('');

    if (append && !isInsightDialog) {
      listEl.insertAdjacentHTML('beforeend', html);
    } else {
      listEl.innerHTML = html;
    }
  };

  // 团队复盘亮点（含溯源、辅导策略、可展开详情）
  const teamHighlightsData = [
    {
      type: 'good',
      advisor: '李昱',
      summary: '昨日接待 8 组，下订 1 台，质检均分 92 分。需求挖掘和竞品对比话术突出，可作为团队培训样本。',
      reasons: [
        { label: '深度需求挖掘', desc: '所有录音均在开场 3 分钟内完成家庭结构、用车场景、预算三项核心探询，命中率 100%。' },
        { label: '竞品差异化对比', desc: '面对客户提及汉兰达时，用空间数据+座椅体验+配置表三维度量化对比，成功转化 2 组。' },
        { label: '试驾邀约节奏好', desc: '在 8 组接待中 5 组完成试驾，试驾邀约转化率 62.5%，远高于门店均值 44.4%。' }
      ],
      strategy: '建议提取李昱的「需求挖掘 → 竞品对比 → 试驾邀约」三段式话术录制为培训视频，作为全店标准 SOP 示范。',
      recordings: [
        { advisor: '李昱', time: '3-25 10:30', id: buildMockRecordingId(700401), label: '深度需求挖掘样本' },
        { advisor: '李昱', time: '3-25 16:10', id: buildMockRecordingId(700313), label: '金融方案引导下订样本' }
      ]
    },
    {
      type: 'bad',
      advisor: '林涛',
      summary: '昨日 3 条录音触发服务风险标签（未及时致歉×1、明显不耐烦×1、与客户争执×1），建议今日面谈辅导。',
      reasons: [
        { label: '出现问题，或是客户不满时，未及时表示歉意', desc: `在 ${buildMockRecordingId(700283)} 中客户对前次跟进存在明显不满，销售未第一时间道歉安抚，直接进入促单沟通。` },
        { label: '明显不耐烦、催促打断客户', desc: `在 ${buildMockRecordingId(700310)} 中多次抢话并催促客户表态，导致客户表达空间被压缩，沟通氛围明显紧张。` },
        { label: '与客户争执、冲突', desc: `在 ${buildMockRecordingId(700314)} 中面对客户异议时持续辩解并提高语气，出现对抗式沟通苗头。` }
      ],
      coachingPlan: [
        { topic: '服务场景先致歉', action: '遇到客户表达不满、抱怨或指出问题时，先用一句明确致歉完成情绪安抚，再进入解释和解决方案。' },
        { topic: '完整倾听与停顿', action: '训练不抢话、不催促的倾听动作，客户说完后停顿 1-2 秒再回应，避免制造压迫感。' },
        { topic: '冲突降温表达', action: '使用「我理解您的顾虑 / 我先确认一下您的意思」等降温句式，禁止和客户正面争执。' }
      ],
      recordings: [
        { advisor: '林涛', time: '3-23 15:30', id: buildMockRecordingId(700283), label: '未及时致歉' },
        { advisor: '林涛', time: '3-25 14:00', id: buildMockRecordingId(700310), label: '明显不耐烦' },
        { advisor: '林涛', time: '3-25 16:20', id: buildMockRecordingId(700314), label: '与客户争执风险' }
      ]
    }
  ];

  const teamHighlights = document.getElementById("team-highlights");
  if (teamHighlights) {
    teamHighlights.innerHTML = teamHighlightsData.map((h, idx) => {
      const icon = h.type === 'good'
        ? '<span class="highlight-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>'
        : '<span class="highlight-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>';

      const reasonsList = h.reasons.map(r =>
        `<div class="highlight-reason-item">
          <div class="highlight-reason-label">${r.label}</div>
          <p class="highlight-reason-desc">${r.desc}</p>
        </div>`
      ).join('');

      let strategyHtml = '';
      if (h.strategy) {
        const actionTitle = h.type === 'good' ? '推荐行动' : '辅导策略';
        const actionIconHtml = h.type === 'good'
          ? '<img class="highlight-action-icon" src="../assets/team-recommend-action.png" alt="" aria-hidden="true">'
          : '';
        const actionIconClass = h.type === 'good' ? ' has-action-icon' : '';
        strategyHtml = `<div class="highlight-action-card${actionIconClass}">
          ${actionIconHtml}
          <div class="highlight-action-copy">
            <div class="highlight-action-title">${actionTitle}</div>
            <p class="highlight-action-text">${h.strategy}</p>
          </div>
        </div>`;
      }
      if (h.coachingPlan) {
        strategyHtml = `<div class="highlight-action-card has-action-icon">
          <img class="highlight-action-icon" src="../assets/team-personal-coaching.png" alt="" aria-hidden="true">
          <div class="highlight-action-copy">
            <div class="highlight-action-title">个性化辅导计划</div>
            <ul class="highlight-coaching-list">
              ${h.coachingPlan.map(c => `
                <li class="highlight-coaching-item">
                  <div class="highlight-coaching-topic">${c.topic}</div>
                  <div class="highlight-coaching-action">${c.action}</div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>`;
      }

      const recLinksHtml = h.recordings.map(r =>
        `<a class="highlight-rec-link" ${getRecordingDetailAttrs(r)} onclick="event.stopPropagation()">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ${r.label} · ${r.time}
        </a>`
      ).join('');
      const detailTitle = h.type === 'good' ? '推荐原因' : '问题溯源';
      const detailIconSrc = h.type === 'good'
        ? '../assets/team-recommend-reason.svg'
        : '../assets/team-issue-source.svg';

      return `<div class="highlight-item ${h.type}" role="button" tabindex="0" aria-expanded="false">
        <div class="highlight-summary-row">
          ${icon}
          <div class="highlight-summary-copy"><strong>${h.advisor}</strong> ${h.summary}</div>
          <button type="button" class="highlight-toggle" aria-label="展开详情">
            <svg class="hl-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <div class="hl-detail">
          <div class="highlight-detail-title has-detail-icon">
            <img class="highlight-detail-title-icon" src="${detailIconSrc}" alt="" aria-hidden="true">
            <span>${detailTitle}</span>
          </div>
          <div class="highlight-reason-list">${reasonsList}</div>
          ${strategyHtml}
          <div class="highlight-detail-title has-detail-icon highlight-recording-title">
            <img class="highlight-detail-title-icon" src="../assets/team-key-recording.svg" alt="" aria-hidden="true">
            <span>关联录音</span>
          </div>
          <div class="highlight-rec-links">${recLinksHtml}</div>
        </div>
      </div>`;
    }).join('');

    // 展开/收起逻辑
    teamHighlights.querySelectorAll('.highlight-item').forEach(item => {
      const detail = item.querySelector('.hl-detail');
      const toggleItem = () => {
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        item.setAttribute('aria-expanded', String(!isOpen));
      };
      item.addEventListener('click', (e) => {
        if (e.target.closest('.highlight-rec-link')) return;
        toggleItem();
      });
      item.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        toggleItem();
      });
    });
  }

  // 仪表盘圆环动画
  const dialFill = document.getElementById("sop-dial-fill");
  const teamScoreVal = document.getElementById("sop-score-val");
  const periodChangeVal = document.getElementById("sop-period-change");
  const nationalAvgVal = document.getElementById("sop-national-avg");
  const nationalDiffVal = document.getElementById("sop-national-diff");
  const periodChangeValueEl = periodChangeVal?.querySelector('.sop-period-change-value');
  const nationalDiffValueEl = nationalDiffVal?.querySelector('.sop-national-diff-value');
  const nationalDiffLabelEl = nationalDiffVal?.querySelector('.sop-national-diff-label');
  const nationalDiffArrowEl = nationalDiffVal?.querySelector('.sop-national-diff-arrow');
  const teamEfficiencyDialFrames = new Set();
  const SOP_NATIONAL_AVG = 73;
  const SOP_PERIOD_DELTA = 3;

  const cancelTeamEfficiencyDialFrames = () => {
    teamEfficiencyDialFrames.forEach(frameId => cancelAnimationFrame(frameId));
    teamEfficiencyDialFrames.clear();
  };

  const getTeamEfficiencyDialScores = () => {
    const sceneKey = getEffectiveSceneKey();
    const isDefaultFilter = currentRole === 'all'
      && currentSource === SOURCE_KEYS.all
      && sceneKey === SCENE_KEYS.all
      && currentTime === '1'
      && currentModel === 'all';

    if (isDefaultFilter) {
      return { team: 82, zone: 78 };
    }

    const qualityDelta = getStoreRateDelta('qa_pass_rate');
    const sceneDelta = sceneKey === SCENE_KEYS.firstFollow || sceneKey === SCENE_KEYS.inviteStore || sceneKey === SCENE_KEYS.scheduleConfirm || sceneKey === SCENE_KEYS.cloudMulti ? -0.8
      : sceneKey === SCENE_KEYS.storeReception ? 1.1
      : sceneKey === SCENE_KEYS.testDrive ? 1.8
      : 0;
    const roleDelta = currentRole === '销售顾问' ? 0.9
      : currentRole === '邀约专员' ? -0.4
      : 0;
    const timeDelta = Math.min(2.4, Math.log2(Math.max(getStoreKpiRangeDays(), 1)) * 0.36);
    const team = clampStoreKpiValue(
      82 + (qualityDelta * 0.72) + sceneDelta + roleDelta + timeDelta + getStoreKpiJitter('team-efficiency-score', 0.9),
      58,
      96
    );
    const zone = clampStoreKpiValue(
      78 + (qualityDelta * 0.36) + (sceneDelta * 0.4) + timeDelta + getStoreKpiJitter('zone-average-score', 0.7),
      56,
      92
    );

    return {
      team: Math.round(team),
      zone: Math.round(zone)
    };
  };

  const setDialScoreDisplay = (node, value) => {
    if (!node) return;
    node.innerHTML = `${Math.round(value)}<span>%</span>`;
  };
  const readDialScoreDisplay = (node) => {
    const parsed = Number.parseFloat(node?.textContent || '');
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const animateDialScoreValue = (node, target, { delay = 80, duration = 920, from = null } = {}) => {
    if (!node) return;
    const startValue = from === null ? readDialScoreDisplay(node) : from;
    const startTime = performance.now() + delay;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    let frameId = 0;
    const scheduleTick = () => {
      frameId = requestAnimationFrame(tick);
      teamEfficiencyDialFrames.add(frameId);
    };
    setDialScoreDisplay(node, startValue);

    const tick = (now) => {
      teamEfficiencyDialFrames.delete(frameId);
      if (now < startTime) {
        scheduleTick();
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      setDialScoreDisplay(node, startValue + (target - startValue) * easeOutCubic(progress));
      if (progress < 1) {
        scheduleTick();
      } else {
        setDialScoreDisplay(node, target);
      }
    };

    scheduleTick();
  };
  const animateDialFill = (node, target, delay = 120) => {
    if (!node) return;
    const circumference = 2 * Math.PI * 65;
    const offset = circumference * (1 - target / 100);
    setTimeout(() => { node.style.strokeDashoffset = offset; }, delay);
  };

  const updateTeamEfficiencyDials = ({ fromZero = false } = {}) => {
    cancelTeamEfficiencyDialFrames();
    const { team, zone } = getTeamEfficiencyDialScores();
    const teamStart = fromZero ? 0 : null;

    if (fromZero && dialFill) {
      dialFill.style.strokeDashoffset = 2 * Math.PI * 65;
    }

    document.querySelector('.sop-metric-card-store')?.setAttribute('aria-label', `门店质检合格率 ${team}%`);
    if (periodChangeVal) {
      const periodDelta = SOP_PERIOD_DELTA;
      const periodText = `环比 ${periodDelta >= 0 ? '+' : ''}${periodDelta}%`;
      if (periodChangeValueEl) {
        periodChangeValueEl.textContent = periodText;
      } else {
        periodChangeVal.textContent = periodText;
      }
      periodChangeVal.classList.toggle('up', periodDelta >= 0);
      periodChangeVal.classList.toggle('down', periodDelta < 0);
    }
    if (nationalAvgVal) nationalAvgVal.textContent = `${SOP_NATIONAL_AVG}`;
    if (nationalDiffVal) {
      const nationalDiff = Math.round(team - SOP_NATIONAL_AVG);
      const diffText = `${Math.abs(nationalDiff)}%`;
      if (nationalDiffValueEl) {
        nationalDiffValueEl.textContent = diffText;
        if (nationalDiffLabelEl) {
          nationalDiffLabelEl.textContent = nationalDiff >= 0 ? '+' : '-';
        }
      } else {
        nationalDiffVal.textContent = `${nationalDiff >= 0 ? '+' : '-'}${diffText}`;
      }
      nationalDiffVal.classList.toggle('up', nationalDiff >= 0);
      nationalDiffVal.classList.toggle('down', nationalDiff < 0);
    }
    animateDialFill(dialFill, team, fromZero ? 300 : 80);
    animateDialScoreValue(teamScoreVal, team, { delay: 80, duration: 920, from: teamStart });
  };

  updateTeamEfficiencyDials({ fromZero: true });

  // ── 10. 趋势图 ───────────────────────────────
  let chart = null;
  const TREND_DATA = {
    "1":  { labels:["3-26"], scores:[82], zoneAvg:[78], invitation:[6], reception:[11], test_drive:[4], order_count:[1] },
    "7":  { labels:["3-17","3-18","3-19","3-20","3-21","3-22","3-23"], scores:[80,81,79,85,87,85,82], zoneAvg:[78,78,78,78,78,78,78], invitation:[5,4,6,7,8,6,6], reception:[12,10,8,15,22,18,11], test_drive:[3,4,2,5,8,6,4], order_count:[1,1,1,2,3,2,1] },
    "15": { labels:["3-9","3-10","3-11","3-12","3-13","3-14","3-15","3-16","3-17","3-18","3-19","3-20","3-21","3-22","3-23"], scores:[75,76,78,80,79,82,81,79,80,81,79,85,87,85,82], zoneAvg:[78,78,78,78,78,78,78,78,78,78,78,78,78,78,78], invitation:[4,3,5,6,5,7,6,4,5,4,6,7,8,6,6], reception:[8,9,10,11,12,10,13,12,12,10,8,15,22,18,11], test_drive:[2,3,3,4,4,3,5,4,3,4,2,5,8,6,4], order_count:[1,1,1,1,2,1,2,1,1,1,1,2,3,2,1] },
    "30": { labels:["2-24","2-25","2-26","2-27","2-28","3-1","3-2","3-3","3-4","3-5","3-6","3-7","3-8","3-9","3-10","3-11","3-12","3-13","3-14","3-15","3-16","3-17","3-18","3-19","3-20","3-21","3-22","3-23","3-24","3-25"], scores:[70,72,73,74,72,73,75,76,74,76,77,78,79,80,76,78,80,79,82,81,79,80,81,79,85,87,85,82,84,83], zoneAvg:[78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78], invitation:[3,4,4,5,3,5,4,5,6,6,5,5,4,4,3,5,6,5,7,6,4,5,4,6,7,8,6,6,7,6], reception:[6,7,8,8,7,9,10,10,11,11,12,12,9,8,9,10,11,12,10,13,12,12,10,8,15,22,18,11,16,14], test_drive:[2,2,3,3,2,3,3,3,4,4,4,4,3,2,3,3,4,4,3,5,4,3,4,2,5,8,6,4,6,5], order_count:[1,1,1,1,1,1,1,1,2,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,2,3,2,1,2,1] }
  };

  const buildChart = (range) => {
    const ctx = document.getElementById("storeTrendChart");
    if (!ctx) return;
    if (chart?.destroy) chart.destroy();
    chart = null;
    const d = TREND_DATA[range] || TREND_DATA["1"];

    // Pick volume series & label based on current scene
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
      volData = d.invitation.map((v, i) => v + d.test_drive[i] + d.order_count[i]);
      volLabel = getSceneVolumeLabel(sceneKey);
    }

    // Update legend dynamically
    const legendEl = document.getElementById("chart-legend");
    if (legendEl) {
      legendEl.innerHTML = `
        <span><i class="legend-dot" style="background:#2563eb"></i>门店质检合格率</span>
        <span><i class="legend-dot" style="background:#94a3b8"></i>大区质检合格率</span>
        <span><i class="legend-dot" style="background:rgba(37,99,235,0.15)"></i>${volLabel}</span>
      `;
    }

    const volumeMax = Math.max(...volData, 0);
    const leftAxisMax = Math.max(5, Math.ceil(volumeMax / 5) * 5);
    const leftTickStep = leftAxisMax <= 10 ? 1 : leftAxisMax <= 25 ? 5 : 10;
    const leftTicks = [];
    for (let tick = 0; tick <= leftAxisMax; tick += leftTickStep) {
      leftTicks.push(tick);
    }
    if (leftTicks[leftTicks.length - 1] !== leftAxisMax) {
      leftTicks.push(leftAxisMax);
    }

    const trendData = {
      labels: d.labels,
      personalQualifiedRate: d.scores,
      storeAverageRate: d.zoneAvg,
      recordingVolume: volData,
      tooltipLabels: {
        primary: '门店质检合格率',
        average: '大区质检合格率',
        volume: volLabel
      },
      tooltipColors: {
        primary: '#2563eb',
        average: '#94a3b8',
        volume: 'rgba(37,99,235,0.3)'
      }
    };

    const chartConfig = {
        labels: d.labels,
        leftAxis: {
          min: 0,
          max: leftAxisMax,
          ticks: leftTicks,
          label: volLabel,
          formatLabel: (value) => String(value)
        },
        rightAxis: {
          min: 50,
          max: 100,
          ticks: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
          label: '合格率',
          formatLabel: (value) => `${value}%`
        },
        bars: {
          axis: 'left',
          data: volData,
          fill: 'rgba(37, 99, 235, 0.16)',
          stroke: 'rgba(37, 99, 235, 0.92)',
          widthRatio: 0.72,
          radius: 6
        },
        datasets: [
          { axis: 'right', color: '#2563eb', data: d.scores, pointRadius: 4, lineWidth: 3, curved: true, solidPoint: true, fillColor: 'rgba(37,99,235,0.08)' },
          { axis: 'right', color: '#94a3b8', data: d.zoneAvg, pointRadius: 4, lineWidth: 2.5, dash: [6, 4], curved: true, solidPoint: true }
        ]
      };

    if (typeof animateSalesTrendChart === 'function') {
      animateSalesTrendChart(ctx, chartConfig, trendData);
    }
  };

  // 图例在 buildChart 内动态渲染，首次先初始化一次

  // ── 12. 线索详情跳转 ─────────────────────────
  window.openLeadDetail = function(clientId) {
    const client = clientData.find(c => c.id === clientId);
    if (!client) { alert(`线索 ${clientId} 暂无详情`); return; }

    // Remove old overlay if any
    let ov = document.getElementById('lead-detail-overlay');
    if (ov) ov.remove();

    const statusLabel = client.status === 'urgent' ? '紧急' : client.status === 'warn' ? '提醒' : '正常';
    const statusColor = client.status === 'urgent' ? '#DC2626' : client.status === 'warn' ? '#D97706' : '#16A34A';
    const statusBg = client.status === 'urgent' ? '#FEF2F2' : client.status === 'warn' ? '#FFFBEB' : '#F0FDF4';
    const intentClass = client.intention_series === '高' ? 'a' : client.intention_series === '中' ? 'b' : 'c';

    ov = document.createElement('div');
    ov.id = 'lead-detail-overlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;justify-content:flex-end;background:rgba(15,23,42,0.45);backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease';

    ov.innerHTML = `
      <div id="lead-detail-drawer" style="width:420px;max-width:95vw;height:100%;background:#fff;box-shadow:-12px 0 40px rgba(15,23,42,0.18);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(0.22,0.61,0.36,1);overflow:hidden">
        <!-- drawer header -->
        <div style="padding:20px 24px 16px;background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
          <div>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:4px">线索详情 · ${client.id}</div>
            <div style="font-size:20px;font-weight:700">${client.customer_name}</div>
          </div>
          <button onclick="document.getElementById('lead-detail-overlay').dispatchEvent(new Event('close'))" style="width:32px;height:32px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
        </div>
        <!-- body -->
        <div style="flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px">
          <!-- status badges -->
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:9999px;background:${statusBg};color:${statusColor};border:1px solid ${statusColor}40">${statusLabel}</span>
            <span class="intent-badge intent-${intentClass}">${client.intention_series}</span>
            <span style="font-size:12px;color:#64748B;padding:3px 10px;background:#F1F5F9;border-radius:9999px">${client.car_model}</span>
          </div>

          <!-- AI 预警 -->
          <div style="padding:12px 14px;border-radius:10px;background:${statusBg};border:1px solid ${statusColor}40;font-size:13px;line-height:1.6;color:#374151">
            <div style="font-size:11px;font-weight:700;color:${statusColor};margin-bottom:6px;letter-spacing:0.05em">⚡ AI 预警</div>
            ${client.ai_issue}
          </div>

          <!-- 基本信息 -->
          <div style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden">
            <div style="font-size:11px;font-weight:700;color:#64748B;padding:10px 14px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;letter-spacing:0.05em">基本信息</div>
            <div style="padding:14px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div><div style="font-size:11px;color:#94A3B8;margin-bottom:3px">跟进顾问</div><div style="font-size:13px;font-weight:600;color:#0F172A">${client.advisor}</div><div style="font-size:11px;color:#94A3B8">${client.advisor_role}</div></div>
                <div><div style="font-size:11px;color:#94A3B8;margin-bottom:3px">质检评分</div><div style="font-size:22px;font-weight:700;font-family:monospace;color:${client.qa_score >= 80 ? '#16A34A' : client.qa_score >= 60 ? '#D97706' : '#DC2626'}">${client.qa_score}</div></div>
                <div><div style="font-size:11px;color:#94A3B8;margin-bottom:3px">最近场景</div><div style="font-size:13px;color:#334155">${client.last_scene}</div></div>
                <div><div style="font-size:11px;color:#94A3B8;margin-bottom:3px">最近时间</div><div style="font-size:13px;color:#334155">${client.time}</div></div>
              </div>
            </div>
          </div>

          <!-- 客户画像 -->
          <div style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden">
            <div style="font-size:11px;font-weight:700;color:#64748B;padding:10px 14px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;letter-spacing:0.05em">客户画像</div>
            <div style="padding:14px;display:flex;flex-wrap:wrap;gap:6px">
              ${client.user_profile.map(p => `<span class="profile-tag" style="font-size:12px;padding:4px 10px">${p}</span>`).join('')}
            </div>
          </div>

          <!-- 操作 -->
          <div style="display:flex;flex-direction:column;gap:8px">
            <button onclick="alert('已发送钉钉督办通知给 ${client.advisor}')" style="width:100%;padding:10px;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12.27 19.79 19.79 0 0 1 1.08 3.63 2 2 0 0 1 3.05 1.46h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
              发送钉钉督办给 ${client.advisor}
            </button>
            <button onclick="alert('已标记为重点跟进')" style="width:100%;padding:10px;background:#fff;color:#334155;border:1px solid #E2E8F0;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">
              ⭐ 标记重点跟进
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(ov);
    requestAnimationFrame(() => {
      ov.style.opacity = '1';
      document.getElementById('lead-detail-drawer').style.transform = 'translateX(0)';
    });

    const closeDrawer = () => {
      ov.style.opacity = '0';
      document.getElementById('lead-detail-drawer').style.transform = 'translateX(100%)';
      setTimeout(() => ov.remove(), 280);
    };
    ov.addEventListener('close', closeDrawer);
    ov.addEventListener('click', (e) => { if (e.target === ov) closeDrawer(); });
  };

  // ── 主Tab切换（线索管理 / 顾问管理）────────────
  const mainTabs = document.querySelectorAll('#main-tabs .main-tab');
  const mainPanels = document.querySelectorAll('.main-panel');

  // 功能模块tab（位于global-filter-bar）
  const moduleTabs = document.querySelectorAll('#gf-module .gf-tab');

  const switchMainTab = (tabName) => {
    mainTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    mainPanels.forEach(p => p.classList.remove('active'));
    moduleTabs.forEach(t => { t.classList.remove('active'); });
    const targetTab = document.querySelector(`#main-tabs .main-tab[data-tab="${tabName}"]`) || document.querySelector(`#gf-module .gf-tab[data-module="${tabName}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
      targetTab.setAttribute('aria-selected', 'true');
    }
    const targetPanel = document.getElementById('main-panel-' + tabName);
    if (targetPanel) targetPanel.classList.add('active');
    if (tabName === 'advisors') {
      setTimeout(() => { buildChart(getStoreTrendRangeKey()); }, 50);
    }
  };

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchMainTab(tab.dataset.tab);
    });
  });

  moduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchMainTab(tab.dataset.module);
    });
  });

  // ── 11. 质检复盘标签页切换 ───────────────────────────────
  const issueInsightTabs = document.querySelectorAll('.issue-overview-wrapper [data-issue-insight-tab]');
  const detailSop = document.getElementById('detail-sop');
  if (issueInsightTabs.length && detailSop) {
    const switchIssueInsightTab = (target = 'strength') => {
      issueInsightTabs.forEach(tab => {
        const active = tab.dataset.issueInsightTab === target;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      storeInsightRuleState.activeTab = STORE_ISSUE_RULE_CONFIG[target] ? target : 'strength';
      detailSop.setAttribute('aria-label', getStoreIssueRuleConfig(storeInsightRuleState.activeTab).label);
      renderStoreSopRuleSection('store-issue-rule-analysis-root', storeInsightRuleState);
    };

    issueInsightTabs.forEach(tab => {
      const activate = () => switchIssueInsightTab(tab.dataset.issueInsightTab);
      tab.addEventListener('click', activate);
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  // ── 12. 初始化 ───────────────────────────────
  renderHeroKPI();
  renderClientList();
  renderAdvisorTable();
  renderInsightSection();
  renderStoreTeamSummary();
  buildChart("1");

  // ── 13. 卡片插画自适应隐藏 ─────────────────────
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
}

    


      const pages = {
        'factory-dashboard': {
          navKey: 'factory-dashboard',
          label: '厂端看板',
          eyebrow: '00 / Factory Dashboard',
          title: '厂端看板',
          desc: '同步厂端管理视角，集中查看全国组织与 SOP 执行质检，适合厂端运营进行巡检和下钻分析。',
          noteTitle: '',
          noteText: '',
          userName: '厂端运营',
          userMeta: '全国质检总览',
          actions: [],
          filters: [],
          templateId: 'tpl-factory-dashboard'
        },
        dashboard: {
          navKey: 'dashboard',
          label: '门店看板',
          eyebrow: '01 / Store Dashboard',
          title: '门店看板',
          desc: '从门店与顾问视角查看客户规模、录音执行进度、顾问表现和客户关注点，适合店长进行日常经营分析。',
          hideShellTopbar: true,
          noteTitle: '',
          noteText: '',
          userName: '门店经理 · 李玥',
          userMeta: '近 30 天经营分析',
          actions: [],
          filters: [],
          templateId: 'tpl-store-dashboard'
        },
        'store-dashboard': {
          navKey: 'dashboard',
          label: '门店看板',
          eyebrow: '01 / Store Dashboard',
          title: '门店看板',
          desc: '从门店与顾问视角查看客户规模、录音执行进度、顾问表现和客户关注点，适合店长进行日常经营分析。',
          hideShellTopbar: true,
          noteTitle: '',
          noteText: '',
          userName: '门店经理 · 李玥',
          userMeta: '近 30 天经营分析',
          actions: [],
          filters: [],
          templateId: 'tpl-store-dashboard'
        },
        'sales-dashboard': {
          navKey: 'sales-dashboard',
          label: '销售看板',
          eyebrow: '01 / Sales Dashboard',
          title: '销售看板',
          desc: '围绕线索从首触到到店试驾的转化链路，集中展示任务节奏、执行指标与今日跟进重点。',
          noteTitle: '',
          noteText: '',
          userName: '邀约专员 · 张琳',
          userMeta: '默认视角',
          actions: [],
          filters: [],
          templateId: 'tpl-sales-dcc'
        },
        'sales-dcc': {
          navKey: 'sales-dashboard',
          label: '邀约专员看板',
          eyebrow: '01 / Sales Dashboard',
          title: '销售看板',
          desc: '围绕线索从首触到到店试驾的转化链路，集中展示任务节奏、执行指标与今日跟进重点。',
          noteTitle: '',
          noteText: '',
          userName: '邀约专员 · 张琳',
          userMeta: '角色拆分页',
          actions: [],
          filters: [],
          templateId: 'tpl-sales-dcc'
        },
        'sales-advisor': {
          navKey: 'sales-dashboard',
          label: '接待专员看板',
          eyebrow: '01 / Sales Dashboard',
          title: '销售看板',
          desc: '围绕线索从首触到到店试驾的转化链路，集中展示任务节奏、执行指标与今日跟进重点。',
          noteTitle: '',
          noteText: '',
          userName: '接待专员 · 李昱',
          userMeta: '角色拆分页',
          actions: [],
          filters: [],
          templateId: 'tpl-sales-advisor'
        },
        'script-library': {
          navKey: 'script-library',
          label: '优秀话术库',
          eyebrow: '06 / Script Library',
          title: '优秀话术库',
          desc: '围绕月度优秀样本沉淀主题，兼顾培训讲解、自主学习和代表样本回溯，优先展示可复用的高价值动作。',
          noteTitle: '',
          noteText: '',
          userName: '培训运营 · 许诺',
          userMeta: '月度沉淀已更新',
          actions: [],
          filters: [],
          templateId: 'tpl-script-library'
        },
        session: {
          navKey: 'session',
          label: '会话管理',
          eyebrow: '02 / Session',
          title: '录音列表',
          desc: '支持多维筛选、排序与快速质检，列表按接通时间和质检结果组织，适合主管集中查看。',
          noteTitle: '排版策略',
          noteText: '先用表格完成快速筛查，再通过单条详情进入播放、转写和评分联动页面。',
          userName: '门店主管 · 陈星',
          userMeta: '待人工复检 7 条',
          actions: [
            { label: '批量导出', primary: true }
          ],
          filters: [],
          templateId: 'tpl-session-list'
        },
        'session-detail': {
          navKey: 'session',
          label: '会话管理',
          eyebrow: '02 / Session Detail',
          title: '录音详情',
          desc: '录音播放、转写与质检分析集中在一页内，减少人工复检时的上下文切换。',
          noteTitle: '排版策略',
          noteText: '左侧放播放与转写，中右侧集中展示评分与通话数据，信息层级更稳定。',
          userName: '门店主管 · 陈星',
          userMeta: '当前会话待复检',
          actions: [
            { label: '导出报告', primary: true }
          ],
          filters: [],
          templateId: 'tpl-session-detail'
        },
        leads: {
          navKey: 'leads',
          label: '线索管理',
          eyebrow: '03 / Leads',
          title: '线索列表',
          desc: '将客户在不同门店的线索统一归集，并关联录音分析、沉淀客户画像',
          noteTitle: '',
          noteText: '',
          userName: '销售经理 · 刘青',
          userMeta: '今日新增高意向 26 条',
          actions: [
            { label: '导出线索', primary: true }
          ],
          filters: [],
          templateId: 'tpl-leads-list'
        },
        'leads-detail': {
          navKey: 'leads',
          label: '线索管理',
          eyebrow: '03 / Lead Detail',
          title: '线索详情',
          desc: '新版线索详情整合了客户级别、客户标签、沟通表现评分与经营建议，让销售经理能更快完成判断与接续跟进。',
          noteTitle: '排版策略',
          noteText: '新版采用“左侧主信息流 + 右侧经营侧卡片”的排版，把评分、标签和评级总结都收束进更稳定的阅读路径。',
          userName: '销售经理 · 刘青',
          userMeta: 'Lead H 级需跟进',
          actions: [],
          filters: [],
          templateId: 'tpl-leads-detail'
        },
        'customer-detail': {
          navKey: 'leads',
          label: '线索管理',
          eyebrow: '03 / Customer Detail',
          title: '客户详情',
          desc: '客户详情整合该客户在各个门店全生命周期的旅程表现，形成完整的用户画像。',
          noteTitle: '排版策略',
          noteText: '新版采用“左侧主信息流 + 右侧经营侧卡片”的排版，把评分、标签和评级总结都收束进更稳定的阅读路径。',
          userName: '销售经理 · 刘青',
          userMeta: '客户聚合视图',
          actions: [],
          filters: [],
          templateId: 'tpl-customer-detail'
        },
        config: {
          navKey: 'config',
          label: '质检配置',
          eyebrow: '04 / Config',
          title: '质检配置',
          desc: '将规则目录、逻辑编辑、权重阈值和申诉工作流做成稳定的运营工作台，减少页面碎片化。',
          noteTitle: '排版策略',
          noteText: '改成“规则目录 + 编辑器 + 工作流”三栏结构，规则配置更有秩序，阅读路径也更稳定。',
          userName: '质检运营 · 林岚',
          userMeta: '当前版本 v3.4 草稿',
          actions: [],
          filters: [],
          templateId: 'tpl-config'
        },
        system: {
          navKey: 'system',
          label: '系统管理',
          eyebrow: '05 / System',
          title: '系统管理',
          desc: '后台治理内容收束到更稳定的两栏结构，突出系统健康、组织权限、数据接入和审计留痕。',
          noteTitle: '排版策略',
          noteText: '系统页按“运行概览 + 组织权限 / 接入状态 + 审计日志”分层，避免信息横向散开。',
          userName: '平台管理员',
          userMeta: '最近巡检 08:10',
          actions: [
            { label: '导出审计日志', primary: false },
            { label: '新增角色组', primary: true }
          ],
          filters: ['组织: 全国', '环境: 生产', '巡检: 今日'],
          templateId: 'tpl-system'
        }
      }

      const scriptLibraryOptions = {
        page: ['话术速查', '月度训练重点'],
        quickScene: ['全部', '邀约', '接待', '试驾'],
        quickRecommendation: ['全部', '推荐', '慎用'],
        monthlyScene: ['邀约', '接待', '试驾'],
        monthlyPriority: ['全部', '优先训练', '持续有效', '持续观察', '暂不推荐'],
        monthlyCoachingMode: ['全部', '晨会讲解', '班组复盘', '一对一辅导', '陪练'],
        monthlyMonth: ['2026-04', '2026-03', '2026-02']
      }

      const scriptLibraryState = {
        page: '话术速查',
        quickScene: '全部',
        quickRecommendation: '全部',
        monthlyScene: '邀约',
        monthlyPriority: '全部',
        monthlyCoachingMode: '全部',
        monthlyMonth: '2026-04',
        search: '',
        searchDraft: '',
        evidenceWindow: 'last_3m',
        selectedId: 'invite-active-time-anchor'
      }

      const scriptLibraryData = {
        globalPool: {
          invite: {
            overview: {
              topTags: ['邀约动作待收口', '客户顾虑待化解'],
              recommendedTopics: 2,
              highValueTopics: 2
            },
            problemScenarios: [
              {
                id: 'problem-invite-window-drop',
                problemName: '客户有兴趣但迟迟不定到店时间',
                responseStrategy: '先确认兴趣，再用二选一时间降低客户决策负担。',
                trainingPriority: '高',
                problemFrequencyLevel: '高频',
                recommendedResponseGoal: '把泛泛兴趣推进到具体到店动作。',
                commonMistake: '讲太多优惠，迟迟不给明确时间选项。',
                coachFocus: '训练销售在出现兴趣信号后 20 秒内完成动作收口。'
              },
              {
                id: 'problem-budget-pressure',
                problemName: '客户在电话里提前暴露预算压力',
                responseStrategy: '先共情预算，再把讨论从总价拆到月供和节奏感知。',
                trainingPriority: '中',
                problemFrequencyLevel: '中频',
                recommendedResponseGoal: '降低价格阻力，恢复继续了解意愿。',
                commonMistake: '直接承诺还能便宜，导致客户只盯价格。',
                coachFocus: '训练销售先拆支付结构，再回到来店体验。'
              }
            ],
            topics: [
              {
                id: 'invite-active-time-anchor',
                scene: '邀约',
                topicName: '确认兴趣后立刻给时间锚点',
                summary: '优秀邀约不是继续讲很多权益，而是在客户已出现兴趣信号时，快速给出明确到店时间选择，减少继续拖延。',
                actionPattern: '兴趣确认 → 权益一句话 → 二选一时间',
                bestLine: '您这周既然已经打算抽空看看，我先把时间定轻一点：明天下午还是后天晚上，您选一个方便的时间。',
                recommendedScript: '您刚才提到这周正好想抽空看看，那我先帮您把时间定轻一点：明天下午还是后天晚上，您选一个方便的时间来店里坐一坐就行。',
                applyWhen: '客户已明确表达兴趣、窗口期或愿意继续了解。',
                avoidWhen: '客户仍停留在基础信息阶段，或对到店本身存在明显抵触。',
                trainingGoal: '提升到店确认率',
                trainingValueScore: 92,
                trainingValueLevel: '高价值',
                trainingValueReason: '样本量充足、连续 3 月验证有效，且动作简洁，适合快速标准化。',
                recommendedCoachingMode: '晨会讲解',
                replicabilityLevel: '高',
                stabilityLevel: '高',
                priorityForThisMonth: '是',
                managerAction: '安排晨会统一讲 1 次，并抽取近 7 天录音检查是否做到二选一收口。',
                coachFocus: '训练销售在客户兴趣出现后，不继续铺陈卖点，而是马上完成时间锚定。',
                commonMistake: '确认了兴趣，却继续讲很多配置和优惠，没有把决定变成具体时间动作。',
                status: '优先训练',
                firstSeenMonth: '2026-02',
                lastSeenMonth: '2026-04',
                sourceMonths: ['2026-02', '2026-03', '2026-04'],
                recent3mCount: 3,
                sourceSampleCount: 18,
                linkedProblemIds: ['problem-invite-window-drop'],
                resultEvidence: {
                  last_3m: {
                    matchedSampleCount: 18,
                    convertedCount: 7,
                    conversionLabel: '到店'
                  },
                  last_1m: {
                    matchedSampleCount: 6,
                    convertedCount: 3,
                    conversionLabel: '到店'
                  },
                  note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                },
                representativeSamples: [
                  {
                    quote: '您周末本来就打算带家里人看看车，我先给您占一个周六上午的试驾位，您到了直接体验。',
                    replicablePoint: '把客户原本计划和门店动作无缝接起来。',
                    level: 'A',
                    confidence: '92%',
                    month: '2026-04'
                  },
                  {
                    quote: '如果您担心白跑一趟，我先帮您把车和顾问都约好，您明晚下班过来最省事。',
                    replicablePoint: '提前消除到店成本顾虑。',
                    level: 'A',
                    confidence: '89%',
                    month: '2026-03'
                  },
                  {
                    quote: '今天先不做复杂决定，您选个方便时间来体验一下，很多问题到现场两分钟就能讲清楚。',
                    replicablePoint: '把决策门槛从买不买降到来看看。',
                    level: 'A',
                    confidence: '87%',
                    month: '2026-02'
                  }
                ]
              },
              {
                id: 'invite-observing-scenario-confirm',
                scene: '邀约',
                topicName: '先确认真实使用场景再回应顾虑',
                summary: '优秀顾虑处理不是先争论参数，而是先问清真实通勤或家庭使用场景，再把回应落到客户能感知的生活半径。',
                actionPattern: '场景追问 → 参数翻译 → 绑定到店体验',
                bestLine: '我先不急着讲参数，想确认一下您平时主要是市区通勤，还是周末会带家人跑长途？',
                recommendedScript: '我先不急着和您讲参数，想先确认一下，您平时主要是市区通勤，还是周末会带家人跑长途？这样我给您的建议会更贴近实际。',
                applyWhen: '客户已抛出续航、空间、补能等顾虑，但还愿意继续沟通。',
                avoidWhen: '客户只想尽快确定到店时间，不适合再拉长探询。',
                trainingGoal: '提升到店意愿',
                trainingValueScore: 76,
                trainingValueLevel: '中价值',
                trainingValueReason: '问题常见、训练价值明确，但表达路径依赖销售提问能力，适合针对性复盘。',
                recommendedCoachingMode: '班组复盘',
                replicabilityLevel: '中',
                stabilityLevel: '中',
                priorityForThisMonth: '否',
                managerAction: '挑 2-3 条好坏样本做班组复盘，重点对比“先问场景”和“直接讲参数”的效果。',
                coachFocus: '训练销售先用一个场景问题收窄客户顾虑，再把产品点翻译成客户能理解的生活表达。',
                commonMistake: '客户一提顾虑就马上反驳或堆参数，没有先问清真实使用半径。',
                status: '持续有效',
                firstSeenMonth: '2026-03',
                lastSeenMonth: '2026-04',
                sourceMonths: ['2026-03', '2026-04'],
                recent3mCount: 2,
                sourceSampleCount: 11,
                linkedProblemIds: ['problem-budget-pressure'],
                resultEvidence: {
                  last_3m: {
                    matchedSampleCount: 11,
                    convertedCount: 4,
                    conversionLabel: '到店'
                  },
                  last_1m: {
                    matchedSampleCount: 5,
                    convertedCount: 2,
                    conversionLabel: '到店'
                  },
                  note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                },
                representativeSamples: [
                  {
                    quote: '如果您每天就是上下班 30 多公里，这个续航其实完全够用，您来店里时我再带您看一下真实能耗显示。',
                    replicablePoint: '先贴合场景，再把疑虑绑定到现场验证。',
                    level: 'A',
                    confidence: '90%',
                    month: '2026-04'
                  },
                  {
                    quote: '您更在意的是补能麻烦，还是冬天续航变化？我先按您最在意的那个点跟您说。',
                    replicablePoint: '主动帮客户收窄问题范围。',
                    level: 'B',
                    confidence: '85%',
                    month: '2026-03'
                  }
                ]
              },
              {
                id: 'invite-stale-benefit-stack',
                scene: '邀约',
                topicName: '连续堆优惠促到店',
                summary: '单纯连续堆权益虽然短期能吸引注意，但复用后容易变成只谈优惠的话术习惯，最近验证效果明显弱于动作收口类主题。',
                actionPattern: '多权益堆叠 → 期待刺激',
                bestLine: '权益可以讲，但最好控制在一句话内，重点还是尽快回到到店动作。',
                recommendedScript: '我们现在活动比较多，但更建议把优惠控制在一句话内，重点还是尽快把客户带到到店动作上。',
                applyWhen: '只适合做反例提醒，帮助团队识别常见误区。',
                avoidWhen: '不要把它作为正向标准话术去培训。',
                trainingGoal: '提升到店意愿',
                trainingValueScore: 42,
                trainingValueLevel: '观察',
                trainingValueReason: '历史上出现过，但近期没有持续验证，更适合作为反例提醒而非主推动作。',
                recommendedCoachingMode: '一对一辅导',
                replicabilityLevel: '低',
                stabilityLevel: '低',
                priorityForThisMonth: '否',
                managerAction: '仅在个别录音辅导时点出，不作为晨会统一讲解主题。',
                coachFocus: '提醒销售不要把邀约做成优惠罗列，任何权益都要服务后续动作收口。',
                commonMistake: '一开口就连续列优惠，最后却没有明确推进客户到店。',
                status: '暂不推荐',
                firstSeenMonth: '2026-02',
                lastSeenMonth: '2026-02',
                sourceMonths: ['2026-02'],
                recent3mCount: 1,
                sourceSampleCount: 5,
                linkedProblemIds: [],
                resultEvidence: {
                  last_3m: {
                    matchedSampleCount: 5,
                    convertedCount: 1,
                    conversionLabel: '到店'
                  },
                  last_1m: {
                    matchedSampleCount: 0,
                    convertedCount: 0,
                    conversionLabel: '到店'
                  },
                  note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                },
                representativeSamples: [
                  {
                    quote: '我们现在现金优惠、金融补贴、置换补贴都有，您抽空来店里看看。',
                    replicablePoint: '只有利益点，没有动作设计。',
                    level: 'B',
                    confidence: '78%',
                    month: '2026-02'
                  }
                ]
              }
            ]
          },
          reception: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] },
          test_drive: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] }
        },
        monthlyPackages: {
          '2026-04': {
            invite: {
              overview: {
                topTags: ['邀约动作待收口', '客户顾虑待化解'],
                recommendedTopics: 2,
                highValueTopics: 2
              },
              problemScenarios: [
                {
                  id: 'monthly-problem-2026-04-window',
                  problemName: '客户愿意了解但总说改天再看',
                  responseStrategy: '围绕客户空闲窗口和门店可安排资源做轻量收口。',
                  trainingPriority: '高',
                  problemFrequencyLevel: '高频',
                  recommendedResponseGoal: '把愿意了解推进到明确到店时间。',
                  commonMistake: '一直泛泛跟进，没有给到轻量时间选项。',
                  coachFocus: '训练销售把“愿意看看”快速转换成“选时间”。'
                },
                {
                  id: 'monthly-problem-2026-04-budget',
                  problemName: '客户一上来就强调预算不够',
                  responseStrategy: '先拆总价压力，再引导客户按月供和节奏判断。',
                  trainingPriority: '中',
                  problemFrequencyLevel: '中频',
                  recommendedResponseGoal: '降低预算顾虑，避免客户直接流失。',
                  commonMistake: '直接承诺再便宜，导致谈判失控。',
                  coachFocus: '训练销售先共情再拆结构。'
                }
              ],
              topics: [
                {
                  id: 'monthly-2026-04-invite-window',
                  scene: '邀约',
                  month: '2026-04',
                  topicName: '用到店窗口替代泛泛跟进',
                  summary: '4 月新增优秀样本里，表现最好的一类动作是直接围绕客户的空闲窗口和门店可安排资源完成邀约，而不是继续泛泛跟进。',
                  actionPattern: '确认窗口 → 给资源 → 轻量收口',
                  bestLine: '您这两天如果刚好能抽 30 分钟，我把试驾车和接待时间一起给您约好，您到了不用等。',
                  recommendedScript: '您这两天如果刚好能抽 30 分钟，我把试驾车和接待时间一起给您约好，您到了不用等。',
                  applyWhen: '客户已经愿意了解，但迟迟没有明确来店动作。',
                  avoidWhen: '客户仍在强烈对比竞品价格，不适合直接推进时间。',
                  trainingGoal: '提升到店确认率',
                  trainingValueScore: 88,
                  trainingValueLevel: '高价值',
                  trainingValueReason: '是本月最集中出现的优秀动作，表达清晰，适合直接推广到一线。',
                  recommendedCoachingMode: '晨会讲解',
                  replicabilityLevel: '高',
                  stabilityLevel: '中',
                  priorityForThisMonth: '是',
                  managerAction: '本周晨会先统一讲 1 次，下周抽查录音看是否真正给了时间和资源。',
                  coachFocus: '训练销售把到店动作说具体，说轻量，说省时间。',
                  commonMistake: '客户说有空再看，销售顺着结束，没有继续把动作落到时间和资源。',
                  status: '优先训练',
                  recent3mCount: 1,
                  sourceSampleCount: 7,
                  linkedProblemIds: ['monthly-problem-2026-04-window'],
                  resultEvidence: {
                    last_3m: {
                      matchedSampleCount: 7,
                      convertedCount: 3,
                      conversionLabel: '到店'
                    },
                    last_1m: {
                      matchedSampleCount: 7,
                      convertedCount: 3,
                      conversionLabel: '到店'
                    },
                    note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                  },
                  representativeSamples: [
                    {
                      quote: '您下班路上拐一下店里就行，我把车停门口，您体验完再决定后面聊不聊。',
                      replicablePoint: '降低到店门槛，突出顺路与轻量。',
                      level: 'A',
                      confidence: '93%',
                      month: '2026-04'
                    },
                    {
                      quote: '我先给您占一个不排队的时间，您只要来体验，其他我们现场再说。',
                      replicablePoint: '突出节省时间，减少客户负担。',
                      level: 'A',
                      confidence: '90%',
                      month: '2026-04'
                    }
                  ]
                },
                {
                  id: 'monthly-2026-04-invite-budget',
                  scene: '邀约',
                  month: '2026-04',
                  topicName: '预算顾虑先拆总价再拆到月供',
                  summary: '当客户在电话里提前暴露预算压力时，优秀样本倾向先拆总成本结构，再把讨论切到客户可接受的支付节奏。',
                  actionPattern: '预算共情 → 拆成本结构 → 转月供感知',
                  bestLine: '您如果现在卡在预算，我们先不急着只看裸车价，我帮您拆一下首付、月供和现阶段权益。',
                  recommendedScript: '您如果现在卡在预算，我们先不急着只看裸车价，我帮您拆一下首付、月供和现阶段权益，您会更容易判断适不适合。',
                  applyWhen: '客户明确表达预算压力，但并未完全拒绝继续了解。',
                  avoidWhen: '客户只是想确认现价，不需要立刻展开金融结构。',
                  trainingGoal: '降低价格顾虑',
                  trainingValueScore: 72,
                  trainingValueLevel: '中价值',
                  trainingValueReason: '对价格异议有明显帮助，但需要销售具备一定金融拆解能力，适合定向训练。',
                  recommendedCoachingMode: '一对一辅导',
                  replicabilityLevel: '中',
                  stabilityLevel: '中',
                  priorityForThisMonth: '否',
                  managerAction: '先让高成交销售示范，再针对预算异议薄弱人员做一对一纠偏。',
                  coachFocus: '训练销售先共情压力，再把抽象总价转成可承受节奏。',
                  commonMistake: '一听预算就直接说还能便宜，反而让客户只盯价格。',
                  status: '持续观察',
                  recent3mCount: 1,
                  sourceSampleCount: 5,
                  linkedProblemIds: ['monthly-problem-2026-04-budget'],
                  resultEvidence: {
                    last_3m: {
                      matchedSampleCount: 5,
                      convertedCount: 2,
                      conversionLabel: '到店'
                    },
                    last_1m: {
                      matchedSampleCount: 5,
                      convertedCount: 2,
                      conversionLabel: '到店'
                    },
                    note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                  },
                  representativeSamples: [
                    {
                      quote: '先别急着把这件事想成一次性大支出，我给您拆成每个月更容易判断。',
                      replicablePoint: '主动降低心理压力。',
                      level: 'A',
                      confidence: '88%',
                      month: '2026-04'
                    }
                  ]
                }
              ]
            },
            reception: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] },
            test_drive: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] }
          },
          '2026-03': {
            invite: {
              overview: {
                topTags: ['客户需求待确认'],
                recommendedTopics: 1,
                highValueTopics: 1
              },
              problemScenarios: [
                {
                  id: 'monthly-problem-2026-03-family',
                  problemName: '客户愿意了解，但销售切口和家庭场景不匹配',
                  responseStrategy: '先问谁在用车，再决定邀约时强调的体验点。',
                  trainingPriority: '中',
                  problemFrequencyLevel: '中频',
                  recommendedResponseGoal: '让客户觉得来店体验对自己有必要。',
                  commonMistake: '没问使用人群，就直接推通用卖点。',
                  coachFocus: '训练销售第一问先锁定人群。'
                }
              ],
              topics: [
                {
                  id: 'monthly-2026-03-invite-need',
                  scene: '邀约',
                  month: '2026-03',
                  topicName: '先问家庭用车人群再定邀约切口',
                  summary: '3 月新增主题更强调先问使用人群，再决定后续邀约切口，适合高客单家庭场景。',
                  actionPattern: '人群确认 → 场景切入 → 邀约收口',
                  bestLine: '这台车平时主要是谁开？如果周末经常带家人出行，我建议您来现场重点感受一下二排和后备厢。',
                  recommendedScript: '这台车平时主要是谁开？如果周末经常带家人出行，我建议您来现场重点感受一下二排和后备厢，会比电话里更直观。',
                  applyWhen: '客户尚未明确主要使用人群，且产品体验依赖现场感受。',
                  avoidWhen: '客户已明确只想比较价格，不适合延长探询。',
                  trainingGoal: '提升到店意愿',
                  trainingValueScore: 68,
                  trainingValueLevel: '中价值',
                  trainingValueReason: '适合高客单家庭场景，但样本量仍偏少，建议作为补充训练主题。',
                  recommendedCoachingMode: '班组复盘',
                  replicabilityLevel: '中',
                  stabilityLevel: '中',
                  priorityForThisMonth: '否',
                  managerAction: '挑家庭场景录音做复盘，统一第一问的人群探询口径。',
                  coachFocus: '训练销售把“家庭成员谁在用”变成后续邀约体验点的依据。',
                  commonMistake: '没有先问人群，就直接讲配置和优惠。',
                  status: '持续观察',
                  recent3mCount: 1,
                  sourceSampleCount: 4,
                  linkedProblemIds: ['monthly-problem-2026-03-family'],
                  resultEvidence: {
                    last_3m: {
                      matchedSampleCount: 4,
                      convertedCount: 1,
                      conversionLabel: '到店'
                    },
                    last_1m: {
                      matchedSampleCount: 4,
                      convertedCount: 1,
                      conversionLabel: '到店'
                    },
                    note: '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。'
                  },
                  representativeSamples: [
                    {
                      quote: '如果是家里老人孩子都要坐，很多感受电话里讲不清，您来现场坐一下判断会更快。',
                      replicablePoint: '把场景变成到店必要性。',
                      level: 'A',
                      confidence: '86%',
                      month: '2026-03'
                    }
                  ]
                }
              ]
            },
            reception: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] },
            test_drive: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] }
          },
          '2026-02': {
            invite: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] },
            reception: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] },
            test_drive: { overview: { topTags: [], recommendedTopics: 0, highValueTopics: 0 }, problemScenarios: [], topics: [] }
          }
        }
      }

      const sessionRecordSeeds = [
        {
          id: buildMockRecordingId(0),
          scene: '上海浦东门店 / 邀约场景',
          uploadTime: '2026-03-13 09:13',
          status: '失败',
          duration: '12:43',
          region: '华东大区',
          zone: '上海战区',
          store: '上海浦东门店',
          organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
          advisorId: 'ADV-10021',
          advisorName: '李凯',
          advisorPhone: '138****8001',
          leadId: buildMockLeadId(0),
          customerName: '王先生',
          customerPhone: '139****1268',
          qualifiedRate: '82%',
          intentLevel: '高',
          intentLevelClass: 'red',
          carSeries: '传祺 E9',
          stage: '试驾'
        },
        {
          id: buildMockRecordingId(1),
          scene: '苏州园区门店 / 试驾跟进',
          uploadTime: '2026-03-13 08:21',
          status: '已完成',
          duration: '09:27',
          region: '华东大区',
          zone: '江苏战区',
          store: '苏州园区门店',
          organizationPath: '全国 > 华东大区 > 江苏战区 > 苏州园区门店',
          advisorId: 'ADV-10034',
          advisorName: '周倩',
          advisorPhone: '139****7332',
          leadId: buildMockLeadId(1),
          customerName: '陈女士',
          customerPhone: '137****4158',
          qualifiedRate: '96%',
          intentLevel: '高',
          intentLevelClass: 'red',
          carSeries: '埃安 Y Plus',
          stage: '邀约'
        },
        {
          id: buildMockRecordingId(2),
          scene: '杭州拱墅门店 / 价格异议',
          uploadTime: '2026-03-12 16:48',
          status: '已完成',
          duration: '08:18',
          region: '华东大区',
          zone: '浙江战区',
          store: '杭州拱墅门店',
          organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州拱墅门店',
          advisorId: 'ADV-10056',
          advisorName: '张帆',
          advisorPhone: '136****1886',
          leadId: buildMockLeadId(2),
          customerName: '赵女士',
          customerPhone: '186****0922',
          qualifiedRate: '88%',
          intentLevel: '中',
          intentLevelClass: 'amber',
          carSeries: '传祺 GS8',
          stage: '试驾PDC'
        },
        {
          id: buildMockRecordingId(3),
          scene: '南京建邺门店 / 到店接待',
          uploadTime: '2026-03-12 15:07',
          status: '失败',
          duration: '11:05',
          region: '华东大区',
          zone: '江苏战区',
          store: '南京建邺门店',
          organizationPath: '全国 > 华东大区 > 江苏战区 > 南京建邺门店',
          advisorId: 'ADV-10009',
          advisorName: '吴晨',
          advisorPhone: '135****1902',
          leadId: buildMockLeadId(3),
          customerName: '刘先生',
          customerPhone: '150****3821',
          qualifiedRate: '67%',
          intentLevel: '低',
          intentLevelClass: 'blue',
          carSeries: '埃安 Hyper HT',
          stage: '到店接待'
        },
        {
          id: buildMockRecordingId(4),
          scene: '合肥滨湖门店 / 回访成交',
          uploadTime: '2026-03-11 18:05',
          status: '已完成',
          duration: '06:42',
          region: '华东大区',
          zone: '安徽战区',
          store: '合肥滨湖门店',
          organizationPath: '全国 > 华东大区 > 安徽战区 > 合肥滨湖门店',
          advisorId: 'ADV-10073',
          advisorName: '许诺',
          advisorPhone: '137****2201',
          leadId: buildMockLeadId(4),
          customerName: '孙先生',
          customerPhone: '188****6739',
          qualifiedRate: '98%',
          intentLevel: '无',
          intentLevelClass: 'gray',
          carSeries: '传祺 M8',
          stage: '试驾'
        }
      ]

      function padNumber(value) {
        return String(value).padStart(2, '0')
      }

      function parseDateTimeValue(value) {
        const [datePart, timePart = '00:00'] = value.split(' ')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute] = timePart.split(':').map(Number)
        return new Date(year, month - 1, day, hour, minute)
      }

      function formatDateTimeValue(date) {
        return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`
      }

      function formatLeadLastContactValue(value, fallbackDateTime = '') {
        const safeValue = String(value || '').trim()
        const safeFallback = String(fallbackDateTime || '').trim()

        if (!safeValue) {
          return safeFallback ? `${safeFallback}:00` : ''
        }

        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(safeValue)) {
          return safeValue
        }

        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(safeValue)) {
          return `${safeValue}:00`
        }

        if (/^\d{2}-\d{2} \d{2}:\d{2}$/.test(safeValue)) {
          const fallbackYear = safeFallback ? safeFallback.slice(0, 4) : '2026'
          return `${fallbackYear}-${safeValue}:00`
        }

        const relativeTimeMatch = safeValue.match(/^(今天|昨天)\s+(\d{2}:\d{2})$/)
        if (relativeTimeMatch && safeFallback) {
          return `${safeFallback.slice(0, 10)} ${relativeTimeMatch[2]}:00`
        }

        return safeFallback ? `${safeFallback}:00` : safeValue
      }

      function getDurationMinutes(duration) {
        const [minutes, seconds] = duration.split(':').map(Number)
        return minutes + Math.ceil(seconds / 60)
      }

      function getSessionRecordStartTime(uploadTime, duration, bufferMinutes = 3) {
        const date = parseDateTimeValue(uploadTime)
        date.setMinutes(date.getMinutes() - getDurationMinutes(duration) - bufferMinutes)
        return formatDateTimeValue(date)
      }

      function buildSessionRecords() {
        const generated = []
        const stages = ['邀约', '试驾PDC', '到店接待', '试驾']
        const statuses = ['已完成', '失败']
        const intentLevels = [
          { label: '高', className: 'red' },
          { label: '中', className: 'amber' },
          { label: '低', className: 'blue' },
          { label: '无', className: 'gray' }
        ]
        const customerLastNames = ['王', '李', '陈', '张', '刘', '赵', '孙', '周', '吴', '许', '钱', '冯']
        const customerGivenNames = ['先生', '女士', '先生', '女士', '先生', '女士']

        sessionRecordSeeds.forEach((item, index) => {
          generated.push({
            ...item,
            recordStartTime: item.recordStartTime || getSessionRecordStartTime(item.uploadTime, item.duration, index + 2)
          })
          for (let offset = 1; offset <= 11; offset += 1) {
            const day = 11 + ((index + offset) % 3)
            const hour = 8 + ((index * 3 + offset) % 11)
            const minute = (13 + index * 11 + offset * 7) % 60
            const uploadTime = `2026-03-${padNumber(day)} ${padNumber(hour)}:${padNumber(minute)}`
            const status = statuses[(index + offset) % statuses.length]
            const intentLevel = intentLevels[(index + offset) % intentLevels.length]
            const stage = stages[(index + offset) % stages.length]
            const customerName = `${customerLastNames[(index + offset) % customerLastNames.length]}${customerGivenNames[(index + offset) % customerGivenNames.length]}`
            const phoneSuffix = `${(2600 + index * 73 + offset * 19) % 10000}`.padStart(4, '0')
            const duration = `${padNumber(6 + ((index + offset) % 9))}:${padNumber((12 + index * 9 + offset * 5) % 60)}`
            generated.push({
              ...item,
              id: buildMockRecordingId(100 + index * 20 + offset),
              recordStartTime: getSessionRecordStartTime(uploadTime, duration, 2 + ((index + offset) % 5)),
              uploadTime,
              status,
              duration,
              advisorId: `ADV-${10000 + index * 20 + offset}`,
              advisorPhone: `13${8 + ((index + offset) % 2)}****${phoneSuffix}`,
              leadId: buildMockLeadId(100 + index * 20 + offset),
              customerName,
              customerPhone: `13${7 + ((index + offset) % 2)}****${phoneSuffix}`,
              qualifiedRate: `${62 + ((index * 9 + offset * 4) % 37)}%`,
              intentLevel: intentLevel.label,
              intentLevelClass: intentLevel.className,
              stage
            })
          }
        })

        return generated.sort((a, b) => parseDateTimeValue(b.uploadTime) - parseDateTimeValue(a.uploadTime))
      }

      const sessionRecords = buildSessionRecords()

      const leadRecordSeeds = [
        {
          id: buildMockLeadId(1000),
          store: '上海浦东门店',
          organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
          customerPhone: '139****1268',
          customerName: '王巍娴',
          recordStartTime: '2026-03-12 09:13',
          validRecording: '是',
          sopScore: '45%',
          carSeries: '传祺 E9',
          stage: '到店接待',
          lastContact: '2 小时前',
          owner: '李凯'
        },
        {
          id: buildMockLeadId(1001),
          store: '苏州园区门店',
          organizationPath: '全国 > 华东大区 > 江苏战区 > 苏州园区门店',
          customerPhone: '137****4158',
          customerName: '王慕瑶',
          recordStartTime: '2026-03-11 09:40',
          validRecording: '是',
          sopScore: '52%',
          carSeries: '埃安 Y Plus',
          stage: '试驾',
          lastContact: '今天 09:40',
          owner: '周衡'
        },
        {
          id: buildMockLeadId(1002),
          store: '杭州拱墅门店',
          organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州拱墅门店',
          customerPhone: '186****0922',
          customerName: '吴耀锋',
          recordStartTime: '2026-03-10 16:48',
          validRecording: '是',
          sopScore: '38%',
          carSeries: '传祺 GS8',
          stage: '邀约',
          lastContact: '昨天 16:48',
          owner: '王诚'
        },
        {
          id: buildMockLeadId(1003),
          store: '南京建邺门店',
          organizationPath: '全国 > 华东大区 > 江苏战区 > 南京建邺门店',
          customerPhone: '150****3821',
          customerName: '冯靖宇',
          recordStartTime: '2026-03-09 11:22',
          validRecording: '否',
          sopScore: '42%',
          carSeries: '埃安 Hyper HT',
          stage: '到店接待',
          lastContact: '昨天 11:22',
          owner: '刘青'
        },
        {
          id: buildMockLeadId(1004),
          store: '合肥滨湖门店',
          organizationPath: '全国 > 华东大区 > 安徽战区 > 合肥滨湖门店',
          customerPhone: '188****6739',
          customerName: '钱泺西',
          recordStartTime: '2026-03-08 18:05',
          validRecording: '是',
          sopScore: '48%',
          carSeries: '传祺 M8',
          stage: '试驾',
          lastContact: '03-10 18:05',
          owner: '韩深'
        }
      ]

      const leadStatusValues = ['未跟进', '跟进中', '已下定', '战败', '有效', '异地']
      const aiLeadValidityValues = ['有效', '无效', '暂未分析']
      const leadIntentGradeValues = ['H', 'A', 'B', 'C']
      const leadSourceValues = ['400官网', '汽车之家', '懂车帝', '易车', '抖音直播', '老客户转介绍', '门店自然进店', '企微私域']
      const leadQcSceneValues = ['邀约', '试驾PDC', '到店接待', '试驾']
      const leadTagValues = ['价格敏感', '家庭出行', '金融方案诉求', '关注静谧性', '周末试驾', '竞品对比', '决策待推动', '新能源关注', '置换需求', '首次购车']
      const leadSummaryTemplates = [
        '客户对传祺 E9 表现出较高兴趣，重点询问了空间和续航表现。客户提到周末会带家人到店试驾，希望提前了解金融方案。',
        '客户关注埃安 Y Plus 的智能化配置，对比了竞品车型。顾问已邀请客户下周到店体验，并发送了相关资料。',
        '客户在意车辆静谧性和乘坐舒适性，对传祺 GS8 的座椅布局比较满意。需持续跟进试驾安排。',
        '客户对价格较为敏感，询问是否有置换补贴和购车优惠。顾问承诺反馈最新政策后二次联系。',
        '客户首次接触，了解了埃安 Hyper HT 的基本参数，意向中等，需要进一步培育。',
        '客户对传祺 M8 的商务用途比较关注，询问了后备箱空间和油耗表现，约定本周到店看车。',
        '客户了解传祺 ES9 的越野性能，希望安排户外试驾体验。顾问已记录需求并预约时间。',
        '客户对传祺向往 S7 的外观设计印象深刻，询问了交付周期和颜色可选情况。'
      ]
      const leadActionTemplates = [
        '发送试驾邀请，确认周末到店时间',
        '跟进金融方案，推送置换补贴政策',
        '预约到店体验，准备竞品对比资料',
        '二次电话回访，确认购车决策时间',
        '持续培育意向，定期推送车型资讯',
        '确认试驾安排，提前准备展车',
        '反馈最新优惠，推动下定决策',
        '邀请参加门店活动，增强客户粘性'
      ]
      const leadAiIntentLevelMetas = [
        { label: '高', className: 'red' },
        { label: '中', className: 'amber' },
        { label: '低', className: 'blue' }
      ]
      const leadSourceHierarchySeeds = [
        { leadSource: '线上', secondSource: '网销', thirdSource: '汽车之家', fourthSource: '其他' },
        { leadSource: '线下', secondSource: '到店', thirdSource: '展厅接待', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '新媒体', thirdSource: '抖音-经销商自然-私信', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '新媒体', thirdSource: '抖音-经销商投广-私信', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '网销', thirdSource: '懂车帝', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '新媒体', thirdSource: '抖音-经销商投广-直播', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '网销', thirdSource: '易车网', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '新媒体', thirdSource: '抖音-经销商-其他互动', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '市场传播', thirdSource: '太平洋汽车-常规-全车系', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '新媒体', thirdSource: '视频号-经销店-直播', fourthSource: '其他' },
        { leadSource: '线上', secondSource: '广宣投放线索', thirdSource: '其他媒体', fourthSource: '高德地图话单-25Q4' }
      ]

      function getLeadStatusFromStage(stage, fallbackIndex = 0) {
        if (!stage) {
          return leadStatusValues[fallbackIndex % leadStatusValues.length]
        }

        if (stage.includes('未跟进') || stage.includes('待首触')) {
          return '未跟进'
        }
        if (stage.includes('下订')) {
          return '已下定'
        }
        if (stage.includes('战败')) {
          return '战败'
        }
        if (stage.includes('异地')) {
          return '异地'
        }
        if (
          stage.includes('邀约') ||
          stage.includes('到店') ||
          stage.includes('试驾') ||
          stage.includes('跟进') ||
          stage.includes('确认') ||
          stage.includes('报价') ||
          stage.includes('议价') ||
          stage.includes('培育') ||
          stage.includes('回访')
        ) {
          return '跟进中'
        }

        return leadStatusValues[fallbackIndex % leadStatusValues.length]
      }

      function getLeadOrganizationMeta(organizationPath = '', store = '') {
        const [, region = '', zone = '', storeFromPath = ''] = String(organizationPath).split(' > ')
        return {
          region,
          zone,
          store: store || storeFromPath
        }
      }

      function getLeadAiIntentMeta(level, fallbackIndex = 0) {
        if (level) {
          return leadAiIntentLevelMetas.find((item) => item.label === level) || leadAiIntentLevelMetas[fallbackIndex % leadAiIntentLevelMetas.length]
        }

        return leadAiIntentLevelMetas[fallbackIndex % leadAiIntentLevelMetas.length]
      }

      function getLeadSourceHierarchyMeta(record = {}, fallbackIndex = 0) {
        const fallback = leadSourceHierarchySeeds[fallbackIndex % leadSourceHierarchySeeds.length]

        return {
          leadSource: record.leadSource || record.sourceTypeOneName || fallback.leadSource,
          secondSource: record.secondSource || record.sourceTypeTwoName || fallback.secondSource,
          thirdSource: record.thirdSource || record.sourceTypeThreeName || fallback.thirdSource,
          fourthSource: record.fourthSource || record.sourceTypeFourName || fallback.fourthSource
        }
      }

      const leadSourceTypeValues = ['实体卡', '虚拟号', '工作号']

      function normalizeLeadRecord(record, fallbackIndex = 0) {
        const advisorName = record.advisorName || record.owner || ''
        const organizationMeta = getLeadOrganizationMeta(record.organizationPath, record.store)
        const aiIntentMeta = getLeadAiIntentMeta(record.aiIntentLevel || record.intentLevel, fallbackIndex)
        const leadSourceMeta = getLeadSourceHierarchyMeta(record, fallbackIndex)
        const recordStartTime = record.recordStartTime || ''
        const leadIssuedAt = record.leadIssuedAt || record.leadCreatedAt || recordStartTime
        const hasRecording = Number(record.recordingCount) > 0 || record.validRecording === '是'
        const lastContact = formatLeadLastContactValue(record.lastContact, recordStartTime)
        const intent = record.intent || record.intentGrade || leadIntentGradeValues[fallbackIndex % leadIntentGradeValues.length]
        const qcScene = record.qcScene || leadQcSceneValues[fallbackIndex % leadQcSceneValues.length]
        const source = record.source || leadSourceValues[fallbackIndex % leadSourceValues.length]
        const summary = record.summary || leadSummaryTemplates[fallbackIndex % leadSummaryTemplates.length]
        const action = record.action || leadActionTemplates[fallbackIndex % leadActionTemplates.length]
        const tags = Array.isArray(record.tags) && record.tags.length
          ? record.tags
          : [leadTagValues[fallbackIndex % leadTagValues.length], leadTagValues[(fallbackIndex + 3) % leadTagValues.length]]
        const followUpTime = record.followUpTime || `2026-03-${13 + (fallbackIndex % 7)} ${String(14 + (fallbackIndex % 3)).padStart(2, '0')}:${String(10 + (fallbackIndex % 49)).padStart(2, '0')}`

        return {
          ...record,
          region: record.region || organizationMeta.region,
          zone: record.zone || organizationMeta.zone,
          store: organizationMeta.store,
          advisorName,
          owner: advisorName,
          recordStartTime,
          leadIssuedAt,
          lastContact,
          intent,
          qcScene,
          source,
          summary,
          action,
          tags,
          followUpTime,
          intentGrade: record.intentGrade || intent,
          aiIntentLevel: aiIntentMeta.label,
          aiIntentLevelClass: record.aiIntentLevelClass || aiIntentMeta.className,
          leadStatus: record.leadStatus || leadStatusValues[fallbackIndex % leadStatusValues.length],
          aiLeadValidity: aiLeadValidityValues.includes(record.aiLeadValidity)
            ? record.aiLeadValidity
            : aiLeadValidityValues[fallbackIndex % aiLeadValidityValues.length],
          sourceType: record.sourceType || leadSourceTypeValues[fallbackIndex % leadSourceTypeValues.length],
          ...leadSourceMeta
        }
      }

      function buildLeadRecords() {
        const generated = []
        const leadStages = ['邀约', '试驾PDC', '到店接待', '试驾']
        const leadCarSeries = ['传祺 E9', '埃安 Y Plus', '传祺 GS8', '埃安 Hyper HT', '传祺 M8', '传祺 ES9', '传祺向往 S7', '埃安 RT']
        const leadOwners = ['李凯', '周衡', '王诚', '刘青', '韩深', '陈璐', '顾明', '赵宁', '何川', '沈楠', '徐舟', '唐韵']
        const leadCustomerNames = ['王巍娴', '王慕瑶', '吴耀锋', '冯靖宇', '钱泺西', '林若彤', '郑昱辰', '蒋沐晴', '邵宇泽', '顾芮宁', '程嘉屹', '姚可欣']

        generated.push(normalizeLeadRecord({
          id: buildMockLeadId(9000),
          store: '上海浦东门店',
          organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
          customerPhone: '139****3488',
          customerName: '沈知远',
          recordStartTime: '2026-03-12 20:30',
          leadIssuedAt: '2026-02-21 09:20',
          lastContact: '2026-03-12 20:45',
          recordingCount: 21,
          validRecording: '是',
          sopScore: '86%',
          carSeries: '传祺 M8',
          stage: '试驾',
          owner: '李凯',
          intent: 'H',
          leadStatus: '跟进中',
          aiLeadValidity: '有效',
          isMultiNodeJourneyDemo: true,
          summary: '客户已完成多轮邀约、到店和试驾沟通，对传祺 M8 的空间与静谧性较满意，当前重点关注金融方案和置换补贴。',
          action: '持续跟进金融方案和置换政策，推动客户确认下定时间'
        }, 0))

        ;[
          {
            id: buildMockLeadId(9010),
            store: '上海浦东门店',
            organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
            leadIssuedAt: '2026-03-09 09:20',
            recordStartTime: '2026-03-12 18:40',
            lastContact: '2026-03-12 18:55',
            recordingCount: 8,
            stage: '试驾',
            owner: '李凯'
          },
          {
            id: buildMockLeadId(9011),
            store: '杭州西湖门店',
            organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州西湖门店',
            leadIssuedAt: '2026-03-09 10:10',
            recordStartTime: '2026-03-11 15:20',
            lastContact: '2026-03-11 15:38',
            recordingCount: 7,
            stage: '到店接待',
            owner: '周衡'
          },
          {
            id: buildMockLeadId(9012),
            store: '杭州滨江门店',
            organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州滨江门店',
            leadIssuedAt: '2026-03-10 08:50',
            recordStartTime: '2026-03-10 16:10',
            lastContact: '2026-03-10 16:28',
            recordingCount: 6,
            stage: '邀约',
            owner: '陈璐'
          },
          {
            id: buildMockLeadId(9013),
            store: '杭州西湖门店',
            organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州西湖门店',
            leadIssuedAt: '2026-03-10 11:30',
            recordStartTime: '2026-03-10 11:30',
            lastContact: '2026-03-10 11:30',
            recordingCount: 0,
            validRecording: '否',
            stage: '未跟进',
            owner: '周衡'
          }
        ].forEach((item, index) => {
          generated.push(normalizeLeadRecord({
            ...item,
            customerPhone: '138****6098',
            customerName: '林嘉远',
            validRecording: Number(item.recordingCount) > 0 ? '是' : '否',
            leadStatus: Number(item.recordingCount) > 0 ? '跟进中' : '未跟进',
            aiLeadValidity: Number(item.recordingCount) > 0 ? '有效' : '暂未分析',
            carSeries: '传祺 M8',
            intent: index === 0 ? 'H' : 'A',
            isMultiNodeCustomerDemo: true,
            summary: '客户在多家门店持续了解传祺 M8，重点比较空间、试驾体验、金融免息和置换补贴。',
            action: '统一多门店跟进信息，确认最终购车门店和成交方案'
          }, index + 1))
        })

        leadRecordSeeds.forEach((item, index) => {
          generated.push(normalizeLeadRecord(item, index))

          for (let offset = 1; offset <= 6; offset += 1) {
            const day = 8 + ((index + offset) % 5)
            const hour = 9 + ((index * 3 + offset) % 10)
            const minute = (8 + index * 11 + offset * 13) % 60
            const recordStartTime = `2026-03-${padNumber(day)} ${padNumber(hour)}:${padNumber(minute)}`
            const lastContactHour = hour >= 20 ? hour : hour + 1
            const lastContactMinute = (minute + 18) % 60
            const phoneSuffix = String((2418 + index * 137 + offset * 29) % 10000).padStart(4, '0')

            generated.push(normalizeLeadRecord({
              ...item,
              id: buildMockLeadId(1100 + index * 20 + offset),
              customerPhone: `13${7 + ((index + offset) % 3)}****${phoneSuffix}`,
              customerName: leadCustomerNames[(index * 2 + offset) % leadCustomerNames.length],
              recordStartTime,
              validRecording: (index + offset) % 5 === 0 ? '否' : '是',
              sopScore: `${34 + ((index * 9 + offset * 7) % 54)}%`,
              carSeries: leadCarSeries[(index + offset) % leadCarSeries.length],
              stage: leadStages[(index + offset) % leadStages.length],
              lastContact: `03-${padNumber(day)} ${padNumber(lastContactHour % 24)}:${padNumber(lastContactMinute)}`,
              owner: leadOwners[(index + offset) % leadOwners.length]
            }, index + offset))
          }
        })

        generated.push(normalizeLeadRecord({
          id: buildMockLeadId(1200),
          store: '上海浦东门店',
          organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
          customerPhone: '136****0000',
          customerName: '演示客户',
          recordStartTime: '2026-03-12 19:30',
          lastContact: '2026-03-12 19:30',
          validRecording: '否',
          recordingCount: 0,
          leadStatus: '未跟进',
          carSeries: '传祺 M8',
          stage: '未跟进',
          owner: '刘青'
        }, leadRecordSeeds.length))

        ;[
          {
            id: buildMockLeadId(1210),
            store: '上海浦东门店',
            organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
            leadIssuedAt: '2026-03-16 09:20',
            recordStartTime: '2026-03-16 10:05',
            lastContact: '2026-03-16 10:18',
            recordingCount: 1,
            validRecording: '是',
            stage: '邀约',
            owner: '李凯'
          },
          {
            id: buildMockLeadId(1211),
            store: '上海浦东门店',
            organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
            leadIssuedAt: '2026-03-17 13:40',
            recordStartTime: '2026-03-17 14:15',
            lastContact: '2026-03-17 14:28',
            recordingCount: 1,
            validRecording: '是',
            stage: '报价沟通',
            owner: '李凯'
          }
        ].forEach((item, index) => {
          generated.push(normalizeLeadRecord({
            ...item,
            customerPhone: '135****8826',
            customerName: '顾承宇',
            leadStatus: '跟进中',
            carSeries: '传祺 M8'
          }, leadRecordSeeds.length + index + 1))
        })

        ;[
          {
            id: buildMockLeadId(1220),
            store: '上海浦东门店',
            organizationPath: '全国 > 华东大区 > 上海战区 > 上海浦东门店',
            leadIssuedAt: '2026-03-13 09:13',
            recordStartTime: '2026-03-13 14:30',
            lastContact: '2026-03-15 13:00',
            recordingCount: 3,
            validRecording: '是',
            stage: '试驾',
            owner: '李凯'
          },
          {
            id: buildMockLeadId(1221),
            store: '杭州西湖门店',
            organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州西湖门店',
            leadIssuedAt: '2026-03-14 10:20',
            recordStartTime: '2026-03-14 10:20',
            lastContact: '2026-04-15 10:20',
            recordingCount: 0,
            validRecording: '否',
            stage: '跟进中',
            owner: '周衡'
          },
          {
            id: buildMockLeadId(1222),
            store: '杭州滨江门店',
            organizationPath: '全国 > 华东大区 > 浙江战区 > 杭州滨江门店',
            leadIssuedAt: '2026-03-15 09:40',
            recordStartTime: '2026-03-15 11:10',
            lastContact: '2026-05-16 11:10',
            recordingCount: 1,
            validRecording: '是',
            stage: '报价沟通',
            owner: '陈璐'
          }
        ].forEach((item, index) => {
          generated.push(normalizeLeadRecord({
            ...item,
            customerPhone: '138****2751',
            customerName: '郑昱辰',
            leadStatus: '跟进中',
            carSeries: '传祺 M8',
            isMultiStoreCustomerDemo: true
          }, leadRecordSeeds.length + index + 1))
        })

        return generated.sort((a, b) => {
          const demoPriority = Number(Boolean(b.isMultiNodeJourneyDemo)) - Number(Boolean(a.isMultiNodeJourneyDemo))
          return demoPriority || parseDateTimeValue(b.recordStartTime) - parseDateTimeValue(a.recordStartTime)
        })
      }

      const leadRecords = buildLeadRecords()

      function buildSessionOrganizationTree(records) {
        const roots = []

        records.forEach((item) => {
          const segments = [...item.organizationPath.split(' > '), item.advisorName]
          let currentNodes = roots
          let currentPath = ''

          segments.forEach((segment, index) => {
            currentPath = currentPath ? `${currentPath} > ${segment}` : segment
            const isAdvisor = index === segments.length - 1
            let node = currentNodes.find((entry) => entry.path === currentPath)

            if (!node) {
              node = {
                label: segment,
                path: currentPath,
                type: isAdvisor ? 'advisor' : 'organization'
              }

              if (!isAdvisor) {
                node.children = []
              }

              currentNodes.push(node)
            }

            if (!isAdvisor && !node.children) {
              node.children = []
            }

            currentNodes = node.children || []
          })
        })

        return roots
      }

      const sessionOrganizationTree = buildSessionOrganizationTree(sessionRecords)
      const sessionSearchUtils = (typeof module !== 'undefined' && module.exports)
        ? require('./session-search-utils.js')
        : (window.__sessionSearchUtils || {})
      const sessionSearchFields = Array.isArray(sessionSearchUtils.SESSION_SEARCH_FIELDS) && sessionSearchUtils.SESSION_SEARCH_FIELDS.length
        ? sessionSearchUtils.SESSION_SEARCH_FIELDS
        : [
            { key: 'advisorId', label: '顾问ID' },
            { key: 'advisorName', label: '顾问姓名' },
            { key: 'advisorPhone', label: '顾问号码' },
            { key: 'customerName', label: '客户姓名' },
            { key: 'customerPhone', label: '客户号码' },
            { key: 'leadId', label: '线索ID' }
          ]
      const createDefaultSessionSearchQueries = sessionSearchUtils.createDefaultSessionSearchQueries || (() => ({
        advisorId: '',
        advisorName: '',
        advisorPhone: '',
        customerName: '',
        customerPhone: '',
        leadId: ''
      }))
      const normalizeSessionSearchValue = sessionSearchUtils.normalizeSessionSearchValue || ((value, target) => {
        const normalizedValue = String(value || '').trim().toLowerCase()

        if (target === 'advisorPhone' || target === 'customerPhone') {
          return normalizedValue.replace(/\D/g, '')
        }

        if (target === 'advisorId' || target === 'leadId') {
          return normalizedValue.replace(/[^a-z0-9]/g, '')
        }

        return normalizedValue.replace(/\s+/g, '')
      })
      const getActiveSessionSearchQueries = sessionSearchUtils.getActiveSessionSearchQueries || ((searchQueries) => {
        const safeQueries = searchQueries || {}
        return sessionSearchFields.reduce((result, field) => {
          const normalized = normalizeSessionSearchValue(safeQueries[field.key], field.key)
          if (normalized) {
            result[field.key] = normalized
          }
          return result
        }, {})
      })
      const doesSessionRecordMatchSearch = sessionSearchUtils.doesSessionRecordMatchSearch || ((record, searchQueries) => {
        const activeQueries = getActiveSessionSearchQueries(searchQueries)
        const activeKeys = Object.keys(activeQueries)

        if (!activeKeys.length) {
          return true
        }

        const normalizedRecord = {
          advisorId: normalizeSessionSearchValue(record && record.advisorId, 'advisorId'),
          advisorName: normalizeSessionSearchValue(record && record.advisorName, 'advisorName'),
          advisorPhone: normalizeSessionSearchValue(record && record.advisorPhone, 'advisorPhone'),
          customerName: normalizeSessionSearchValue(record && record.customerName, 'customerName'),
          customerPhone: normalizeSessionSearchValue(record && record.customerPhone, 'customerPhone'),
          leadId: normalizeSessionSearchValue(record && record.leadId, 'leadId')
        }

        return activeKeys.every((key) => normalizedRecord[key].includes(activeQueries[key]))
      })

      const sessionStageOptions = ['全部', '邀约', '试驾PDC', '到店接待', '试驾']
      const sessionStatusOptions = ['全部', '已完成', '失败']
      const sessionIntentLevelOptions = ['全部', '高', '中', '低', '无']
      const sessionSourceOptions = Array.isArray(sessionSearchUtils.SESSION_SOURCE_OPTIONS) && sessionSearchUtils.SESSION_SOURCE_OPTIONS.length
        ? sessionSearchUtils.SESSION_SOURCE_OPTIONS
        : ['全部', '云外呼', '工牌']

      const sessionCarSeriesGroups = {
        埃安车型库: ['埃安 UT', '埃安 RT', '埃安 Y Plus', '埃安 S Plus', '埃安 LX Plus', '埃安 V Plus'],
        昊铂车型库: ['埃安 Hyper SSR', '埃安 Hyper GT', '埃安 Hyper HT'],
        传祺车型库: ['传祺 E8', '传祺 E9', '传祺 ES9', '影豹', '影酷', '传祺 影速', '传祺 GS4', '传祺 GS8', '传祺 M6', '传祺 M8', '传祺向往 S7']
      }
      const sessionCarSeriesGroupBrands = {
        埃安车型库: '埃安',
        昊铂车型库: '昊铂',
        传祺车型库: '传祺'
      }
      const sessionUnknownCarSeriesPrefix = '__unknown_car_series__:'

      const sessionDefaultFilters = {
        organization: '全国',
        stage: '全部',
        source: '全部',
        carSeries: '全部',
        intentLevel: '全部',
        searchQueries: createDefaultSessionSearchQueries(),
        startDate: '2026-03-11',
        endDate: '2026-03-13',
        status: '已完成'
      }

      const sessionFilterState = {
        ...sessionDefaultFilters,
        collapsed: true,
        searchQueries: createDefaultSessionSearchQueries()
      }
      const sessionPaginationState = {
        page: 1,
        pageSize: 10
      }
      const sessionMenuState = {
        openMenu: null,
        organizationDraftPath: sessionDefaultFilters.organization,
        organizationSearchQuery: '',
        organizationSearchActive: false,
        activeDateField: 'startDate',
        dateDraftStartDate: sessionDefaultFilters.startDate,
        dateDraftEndDate: sessionDefaultFilters.endDate,
        dateViewYear: Number(sessionDefaultFilters.startDate.slice(0, 4)),
        dateViewMonth: Number(sessionDefaultFilters.startDate.slice(5, 7))
      }

      const sessionBrandOptions = ['全部', '传祺', '埃安', '昊铂']
      const leadsStageOptions = ['全部', '邀约', '试驾PDC', '到店接待', '试驾']
      const leadStatusOptions = ['全部', ...leadStatusValues]
      const leadIntentGradeOptions = ['全部', ...leadIntentGradeValues]
      const leadSearchTargetOptions = [
        { label: '客户姓名', value: 'customerName' },
        { label: '顾问姓名', value: 'advisorName' },
        { label: '线索来源', value: 'leadSource' },
        { label: '二级来源', value: 'secondSource' },
        { label: '三级来源', value: 'thirdSource' }
      ]
      const leadCustomerSearchTargetOptions = [
        { label: '客户名称', value: 'customerName' },
        { label: '客户手机号', value: 'customerPhone' },
        { label: '线索数', value: 'aggregateLeadCount' },
        { label: '门店数', value: 'aggregateStoreCount' }
      ]
      const leadCustomerNameOptions = ['全部', ...new Set(leadRecords.map((item) => item.customerName).filter(Boolean))]
      const leadCustomerPhoneOptions = ['全部', ...new Set(leadRecords.map((item) => item.customerPhone).filter(Boolean))]
      const leadCustomerStatusOptions = ['全部', ...leadStatusValues]
      const leadSourceTypeOptions = ['全部', '实体卡', '虚拟号', '工作号']
      const leadsDefaultFilters = {
        brand: '全部',
        organization: '全国',
        intentGrade: '全部',
        leadStatus: '全部',
        sourceType: '全部',
        collapsed: true,
        advisorNameQuery: '',
        customerNameQuery: '',
        customerPhoneQuery: '',
        customerAggregateLeadCountQuery: '',
        customerAggregateStoreCountQuery: '',
        customerStatus: '全部',
        customerRecordCoverage: '全部',
        customerStoreRecordCoverage: '全部',
        customerCrossStore: '全部',
        customerMultiLead: '全部',
        customerLeadCountRange: '全部',
        customerStoreCountRange: '全部',
        customerAudioCountRange: '全部',
        customerLeadIssuedStartDate: '',
        customerLeadIssuedEndDate: '',
        customerFirstRecordingStartDate: '',
        customerFirstRecordingEndDate: '',
        customerLatestRecordingStartDate: '',
        customerLatestRecordingEndDate: '',
        startDate: '2026-03-08',
        endDate: '2026-03-12'
      }
      const leadsFilterState = { ...leadsDefaultFilters }
      const leadsPaginationState = {
        page: 1,
        pageSize: 10
      }
      const leadsMenuState = {
        openMenu: null,
        organizationDraftPath: leadsDefaultFilters.organization,
        activeDateField: 'startDate',
        dateDraftStartDate: leadsDefaultFilters.startDate,
        dateDraftEndDate: leadsDefaultFilters.endDate,
        dateViewYear: Number(leadsDefaultFilters.startDate.slice(0, 4)),
        dateViewMonth: Number(leadsDefaultFilters.startDate.slice(5, 7)),
        customerDateActiveField: 'startDate',
        customerDateDraftStartDate: leadsDefaultFilters.customerLeadIssuedStartDate,
        customerDateDraftEndDate: leadsDefaultFilters.customerLeadIssuedEndDate,
        customerDateViewYear: Number(leadsDefaultFilters.endDate.slice(0, 4)),
        customerDateViewMonth: Number(leadsDefaultFilters.endDate.slice(5, 7))
      }
      const leadsViewState = {
        mode: 'leads'
      }

      const scriptLibraryPageUtils = (typeof module !== 'undefined' && module.exports)
        ? require('./script-library-page-utils.js')
        : (window.__scriptLibraryPageUtils || {});
      const getScriptLibraryListBadge = scriptLibraryPageUtils.getScriptLibraryListBadge || ((mode, count) => mode === 'quick' ? `匹配 ${count} 条话术` : `匹配 ${count} 条主题`);
      const shouldRenderMonthlySummaryStats = scriptLibraryPageUtils.shouldRenderMonthlySummaryStats || (() => false);
      const shouldRenderQuickLookupHeroBadge = scriptLibraryPageUtils.shouldRenderQuickLookupHeroBadge || (() => false);

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      }

      function getScriptLibrarySceneKey(scene) {
        if (scene === '邀约') {
          return 'invite'
        }
        if (scene === '接待') {
          return 'reception'
        }
        if (scene === '试驾') {
          return 'test_drive'
        }
        return 'invite'
      }

      function getScriptLibraryTopicsByScene(scene, source) {
        if (scene === '全部') {
          return ['invite', 'reception', 'test_drive'].flatMap((key) => {
            const sceneData = source[key]
            return Array.isArray(sceneData)
              ? sceneData
              : sceneData && Array.isArray(sceneData.topics)
                ? sceneData.topics
                : []
          })
        }
        const sceneData = source[getScriptLibrarySceneKey(scene)]
        return Array.isArray(sceneData)
          ? sceneData
          : sceneData && Array.isArray(sceneData.topics)
            ? sceneData.topics
            : []
      }

      function getQuickLookupItems() {
        return getScriptLibraryTopicsByScene(scriptLibraryState.quickScene, scriptLibraryData.globalPool)
          .filter((item) => {
            const recommendationMatch = scriptLibraryState.quickRecommendation === '全部'
              || (scriptLibraryState.quickRecommendation === '推荐' ? item.status !== '暂不推荐' : item.status === '暂不推荐')
            const searchMatch = matchesScriptLibrarySearch([
              item.topicName,
              item.bestLine,
              item.recommendedScript,
              item.summary,
              item.applyWhen,
              item.trainingGoal,
              item.trainingValueReason,
              item.commonMistake,
              item.scene
            ])
            return recommendationMatch && searchMatch
          })
          .filter((item) => item.status !== '暂不推荐' || scriptLibraryState.quickRecommendation === '慎用')
          .sort((left, right) => (right.trainingValueScore || 0) - (left.trainingValueScore || 0))
      }

      function getMonthlyTrainingPackage() {
        return scriptLibraryData.monthlyPackages[scriptLibraryState.monthlyMonth] || {}
      }

      function getMonthlyTrainingSceneData() {
        return getMonthlyTrainingPackage()[getScriptLibrarySceneKey(scriptLibraryState.monthlyScene)] || { overview: {}, problemScenarios: [], topics: [] }
      }

      function getMonthlyTrainingItems() {
        return (getMonthlyTrainingSceneData().topics || [])
          .filter((item) => {
            const priorityMatch = scriptLibraryState.monthlyPriority === '全部' || item.status === scriptLibraryState.monthlyPriority
            const coachingMatch = scriptLibraryState.monthlyCoachingMode === '全部' || item.recommendedCoachingMode === scriptLibraryState.monthlyCoachingMode
            const searchMatch = matchesScriptLibrarySearch([
              item.topicName,
              item.summary,
              item.trainingValueReason,
              item.managerAction,
              item.coachFocus,
              item.commonMistake,
              item.recommendedScript,
              item.scene
            ])
            return priorityMatch && coachingMatch && searchMatch
          })
          .sort((left, right) => (right.trainingValueScore || 0) - (left.trainingValueScore || 0))
      }

      function getMonthlyTrainingProblems(items) {
        const allProblems = getMonthlyTrainingSceneData().problemScenarios || []
        const linkedIds = new Set(items.flatMap((item) => item.linkedProblemIds || []))
        return allProblems.filter((problem) => linkedIds.size === 0 || linkedIds.has(problem.id))
      }

      function renderScriptLibraryTabs() {
        const tabs = document.getElementById('scriptLibraryTabs')
        if (!tabs) {
          return
        }
        tabs.innerHTML = scriptLibraryOptions.page
          .map((page) => `<button type="button" class="scriptlib-tab${scriptLibraryState.page === page ? ' active' : ''}" data-script-tab="${escapeHtml(page)}">${escapeHtml(page)}</button>`)
          .join('')
      }

      function renderScriptLibraryChipGroup(options, stateKey) {
        return options
          .map((option) => `<button type="button" class="scriptlib-chip${scriptLibraryState[stateKey] === option ? ' active' : ''}" data-script-filter="${stateKey}" data-script-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`)
          .join('')
      }

      function getScriptLibraryEvidenceLabel(scene) {
        return scene === '邀约' ? '到店' : '下订'
      }

      function normalizeScriptLibrarySearchText(value) {
        return String(value || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[，。、“”‘’：；！!？?（）()【】\[\]\-_/]/g, '')
      }

      function isScriptLibrarySubsequenceMatch(haystack, query) {
        if (!query) {
          return true
        }
        let queryIndex = 0
        for (const char of haystack) {
          if (char === query[queryIndex]) {
            queryIndex += 1
            if (queryIndex === query.length) {
              return true
            }
          }
        }
        return false
      }

      function matchesScriptLibrarySearch(fields) {
        const keyword = normalizeScriptLibrarySearchText(scriptLibraryState.search)
        if (!keyword) {
          return true
        }
        const haystack = normalizeScriptLibrarySearchText(fields.filter(Boolean).join(' '))
        return haystack.includes(keyword) || isScriptLibrarySubsequenceMatch(haystack, keyword)
      }

      function getScriptLibraryResultEvidence(item) {
        const evidence = item && item.resultEvidence ? item.resultEvidence : {}
        const windowKey = scriptLibraryState.evidenceWindow
        const windowData = evidence[windowKey] || {
          matchedSampleCount: 0,
          convertedCount: 0,
          conversionLabel: getScriptLibraryEvidenceLabel(item ? item.scene : '邀约')
        }
        return {
          note: evidence.note || '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。',
          windowData
        }
      }

      function renderScriptLibraryResultEvidence(item) {
        const { note, windowData } = getScriptLibraryResultEvidence(item)
        return `
          <div class="scriptlib-detail-sample-block">
            <div class="scriptlib-detail-block">
              <div class="scriptlib-evidence-head">
                <span class="scriptlib-detail-label">结果证据</span>
                <div class="scriptlib-evidence-tabs">
                  <button type="button" class="scriptlib-evidence-tab${scriptLibraryState.evidenceWindow === 'last_3m' ? ' active' : ''}" data-script-filter="evidenceWindow" data-script-value="last_3m">近3月</button>
                  <button type="button" class="scriptlib-evidence-tab${scriptLibraryState.evidenceWindow === 'last_1m' ? ' active' : ''}" data-script-filter="evidenceWindow" data-script-value="last_1m">近1月</button>
                </div>
              </div>
              <div class="scriptlib-evidence-grid">
                <article class="scriptlib-evidence-card">
                  <span class="scriptlib-detail-label">命中该行为样本</span>
                  <strong>${escapeHtml(String(windowData.matchedSampleCount || 0))}</strong>
                </article>
                <article class="scriptlib-evidence-card">
                  <span class="scriptlib-detail-label">最终${escapeHtml(windowData.conversionLabel || getScriptLibraryEvidenceLabel(item.scene))}</span>
                  <strong>${escapeHtml(String(windowData.convertedCount || 0))}</strong>
                </article>
              </div>
              <p class="scriptlib-evidence-note">${escapeHtml(note)}</p>
            </div>
          </div>
        `
      }

      function renderQuickLookupPage() {
        const items = getQuickLookupItems()
        const selectedItem = items.find((item) => item.id === scriptLibraryState.selectedId) || items[0] || null
        if (selectedItem) {
          scriptLibraryState.selectedId = selectedItem.id
        }

        return `
          <div class="scriptlib-subpage">
            <section class="scriptlib-subhero">
              <div>
                <h4>话术速查</h4>
                <p>面向一线，优先回答“现在该怎么说”。先搜，再看推荐表达，再看适用边界。</p>
              </div>
              ${shouldRenderQuickLookupHeroBadge() ? `<div class="mini-pill">${escapeHtml(getScriptLibraryListBadge('quick', items.length))}</div>` : ''}
            </section>
            <section class="scriptlib-toolbar-card">
              <div class="scriptlib-search-row">
                <span class="scriptlib-search-label">搜索话术</span>
                <div class="scriptlib-search-group">
                  <input class="scriptlib-search-input" id="scriptLibrarySearch" type="search" placeholder="搜索主题、推荐表达、适用时机" value="${escapeHtml(scriptLibraryState.searchDraft)}" />
                  <button type="button" class="scriptlib-search-btn" data-script-search-submit>搜索</button>
                </div>
              </div>
              <div class="scriptlib-filter-stack">
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">业务场景</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.quickScene, 'quickScene')}</div>
                </div>
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">是否推荐</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.quickRecommendation, 'quickRecommendation')}</div>
                </div>
              </div>
            </section>
            <div class="scriptlib-body-grid">
              <section class="card scriptlib-list-card">
                <div class="panel-header">
                  <div class="panel-title">
                    <h3>可直接复用的话术</h3>
                    <p>只保留查话术真正有用的筛选，避免无效按钮干扰。</p>
                  </div>
                  <div class="mini-pill">${escapeHtml(getScriptLibraryListBadge('quick', items.length))}</div>
                </div>
                <div class="scriptlib-list">
                  ${items.length ? items.map((item) => `
                    <article class="scriptlib-item${selectedItem && selectedItem.id === item.id ? ' selected' : ''}" data-script-select="${escapeHtml(item.id)}" tabindex="0">
                      <div class="scriptlib-item-head">
                        <div>
                          <div class="scriptlib-item-title-row">
                            <h4>${escapeHtml(item.topicName)}</h4>
                            <span class="mini-pill">${escapeHtml(item.scene)}</span>
                          </div>
                          <p>${escapeHtml(item.summary)}</p>
                        </div>
                      </div>
                      <div class="scriptlib-item-snippet">
                        <span class="scriptlib-detail-label">推荐表达一句</span>
                        <blockquote>${escapeHtml(item.bestLine || item.recommendedScript || '暂无推荐表达')}</blockquote>
                      </div>
                      <div class="scriptlib-item-foot">
                        <div class="scriptlib-item-meta">
                          <span>${escapeHtml(item.applyWhen || '适用时机待补充')}</span>
                          <span>${escapeHtml(item.status || '推荐')}</span>
                        </div>
                        <button type="button" class="btn scriptlib-detail-trigger" data-script-select="${escapeHtml(item.id)}">查看详情</button>
                      </div>
                    </article>
                  `).join('') : '<div class="empty-state-card"><div class="empty-state-icon"></div><strong>暂无匹配话术</strong><span>换一个场景、问题或搜索词再试一次。</span></div>'}
                </div>
              </section>
              <section class="card scriptlib-detail-card">
                <div class="panel-header">
                  <div class="panel-title">
                    <h3>话术详情</h3>
                    <p>${selectedItem ? escapeHtml(selectedItem.scene) : '选择左侧话术后查看详情'}</p>
                  </div>
                </div>
                ${selectedItem ? `
                  <div class="scriptlib-detail-snippet">
                    <span class="scriptlib-detail-label">推荐话术</span>
                    <blockquote>${escapeHtml(selectedItem.recommendedScript || selectedItem.bestLine || '暂无推荐话术')}</blockquote>
                  </div>
                  <div class="scriptlib-detail-grid">
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">适用时机</span>
                      <ul class="scriptlib-tip-list">
                        <li>${escapeHtml(selectedItem.applyWhen || '待补充')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">慎用边界</span>
                      <ul class="scriptlib-tip-list">
                        <li>${escapeHtml(selectedItem.avoidWhen || '待补充')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">为什么推荐</span>
                      <ul class="scriptlib-tip-list">
                        <li>${escapeHtml(selectedItem.trainingValueReason || '待补充')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">代表样本</span>
                      <div class="scriptlib-sample-list">
                        ${(selectedItem.representativeSamples || []).slice(0, 2).map((sample) => `
                          <article class="scriptlib-sample-item">
                            <blockquote>${escapeHtml(sample.quote || '暂无原句')}</blockquote>
                            <p>${escapeHtml(sample.replicablePoint || '暂无可复制点')}</p>
                          </article>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                  ${renderScriptLibraryResultEvidence(selectedItem)}
                ` : '<div class="empty-state-card"><div class="empty-state-icon"></div><strong>暂无可展示详情</strong><span>先从左侧选一条话术。</span></div>'}
              </section>
            </div>
          </div>
        `
      }

      function renderMonthlyTrainingPage() {
        const items = getMonthlyTrainingItems()
        const problems = getMonthlyTrainingProblems(items)
        const selectedItem = items.find((item) => item.id === scriptLibraryState.selectedId) || items[0] || null
        if (selectedItem) {
          scriptLibraryState.selectedId = selectedItem.id
        }

        return `
          <div class="scriptlib-subpage">
            <section class="scriptlib-subhero">
              <div>
                <h4>月度训练重点</h4>
                <p>面向主管和培训负责人，优先回答“这个月该训什么、为什么、怎么训”。</p>
              </div>
              <div class="mini-pill">${escapeHtml(scriptLibraryState.monthlyMonth)} · ${escapeHtml(scriptLibraryState.monthlyScene)}</div>
            </section>
            <section class="scriptlib-toolbar-card">
              <div class="scriptlib-search-row">
                <span class="scriptlib-search-label">搜索训练主题</span>
                <div class="scriptlib-search-group">
                  <input class="scriptlib-search-input" id="scriptLibrarySearch" type="search" placeholder="搜索主题、问题场景、培训建议" value="${escapeHtml(scriptLibraryState.searchDraft)}" />
                  <button type="button" class="scriptlib-search-btn" data-script-search-submit>搜索</button>
                </div>
              </div>
              <div class="scriptlib-filter-stack">
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">月份</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.monthlyMonth, 'monthlyMonth')}</div>
                </div>
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">业务场景</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.monthlyScene, 'monthlyScene')}</div>
                </div>
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">训练优先级</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.monthlyPriority, 'monthlyPriority')}</div>
                </div>
                <div class="scriptlib-filter-row">
                  <span class="scriptlib-filter-label">培训方式</span>
                  <div class="scriptlib-chip-group">${renderScriptLibraryChipGroup(scriptLibraryOptions.monthlyCoachingMode, 'monthlyCoachingMode')}</div>
                </div>
              </div>
            </section>
            <div class="scriptlib-body-grid">
              <section class="card scriptlib-list-card">
                <div class="panel-header">
                  <div class="panel-title">
                    <h3>本月训练主题</h3>
                    <p>按训练价值分排序，只保留主管视角真正要用的信息。</p>
                  </div>
                  <div class="mini-pill">${escapeHtml(getScriptLibraryListBadge('monthly', items.length))}</div>
                </div>
                <div class="scriptlib-list">
                  ${items.length ? items.map((item) => `
                    <article class="scriptlib-item${selectedItem && selectedItem.id === item.id ? ' selected' : ''}" data-script-select="${escapeHtml(item.id)}" tabindex="0">
                      <div class="scriptlib-item-head">
                        <div>
                          <div class="scriptlib-item-title-row">
                            <h4>${escapeHtml(item.topicName)}</h4>
                            <span class="status ${(item.trainingValueScore || 0) >= 80 ? 'green' : 'amber'}">${escapeHtml(item.status || '持续观察')}</span>
                          </div>
                          <p>${escapeHtml(item.trainingValueReason || item.summary)}</p>
                        </div>
                        <div class="scriptlib-item-metric">
                          <strong>${escapeHtml(String(item.trainingValueScore || 0))}</strong>
                          <span>训练价值分</span>
                        </div>
                      </div>
                      <div class="scriptlib-item-tags">
                        <span class="mini-pill">${escapeHtml(item.recommendedCoachingMode || '待补充')}</span>
                        <span class="mini-pill">样本 ${escapeHtml(String(item.sourceSampleCount || 0))}</span>
                      </div>
                    </article>
                  `).join('') : '<div class="empty-state-card"><div class="empty-state-icon"></div><strong>当前月份暂无训练主题</strong><span>可切换月份或场景继续查看。</span></div>'}
                </div>
              </section>
              <section class="card scriptlib-detail-card">
                <div class="panel-header">
                  <div class="panel-title">
                    <h3>训练建议与证据</h3>
                    <p>${selectedItem ? escapeHtml(selectedItem.recommendedCoachingMode || '培训方式待补充') : '选择左侧主题后查看详情'}</p>
                  </div>
                </div>
                ${selectedItem ? `
                  <div class="scriptlib-detail-grid">
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">为什么本月要训</span>
                      <ul class="scriptlib-tip-list">
                        <li>${escapeHtml(selectedItem.trainingValueReason || '待补充')}</li>
                        <li>训练价值分：${escapeHtml(String(selectedItem.trainingValueScore || 0))}</li>
                        <li>主题状态：${escapeHtml(selectedItem.status || '持续观察')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">怎么训</span>
                      <ul class="scriptlib-tip-list">
                        <li>建议方式：${escapeHtml(selectedItem.recommendedCoachingMode || '待补充')}</li>
                        <li>主管动作：${escapeHtml(selectedItem.managerAction || '待补充')}</li>
                        <li>训练重点：${escapeHtml(selectedItem.coachFocus || '待补充')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">常见错误</span>
                      <ul class="scriptlib-tip-list">
                        <li>${escapeHtml(selectedItem.commonMistake || '待补充')}</li>
                      </ul>
                    </div>
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">推荐话术</span>
                      <blockquote>${escapeHtml(selectedItem.recommendedScript || selectedItem.bestLine || '暂无推荐话术')}</blockquote>
                    </div>
                  </div>
                  ${renderScriptLibraryResultEvidence(selectedItem)}
                  <div class="scriptlib-detail-sample-block">
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">关联问题场景</span>
                      ${problems.length ? `<div class="scriptlib-problem-list">${problems.map((problem) => `
                        <article class="scriptlib-problem-item">
                          <div class="scriptlib-problem-head">
                            <strong>${escapeHtml(problem.problemName || '问题场景')}</strong>
                            <span class="mini-pill">${escapeHtml(problem.trainingPriority || '观察')}</span>
                          </div>
                          <p>${escapeHtml(problem.responseStrategy || '暂无应对策略')}</p>
                        </article>
                      `).join('')}</div>` : '<div class="empty-inline-state">当前暂无关联问题场景。</div>'}
                    </div>
                  </div>
                  <div class="scriptlib-detail-sample-block">
                    <div class="scriptlib-detail-block">
                      <span class="scriptlib-detail-label">代表样本</span>
                      <div class="scriptlib-sample-list">
                        ${(selectedItem.representativeSamples || []).map((sample) => `
                          <article class="scriptlib-sample-item">
                            <div class="scriptlib-sample-head">
                              <span class="mini-pill">${escapeHtml(sample.level || '样本')}</span>
                              <span class="scriptlib-sample-meta">${escapeHtml(sample.month || scriptLibraryState.monthlyMonth)}</span>
                            </div>
                            <blockquote>${escapeHtml(sample.quote || '暂无原句')}</blockquote>
                            <p>${escapeHtml(sample.replicablePoint || '暂无可复制点')}</p>
                          </article>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                ` : '<div class="empty-state-card"><div class="empty-state-icon"></div><strong>暂无训练详情</strong><span>先从左侧选一个训练主题。</span></div>'}
              </section>
            </div>
          </div>
        `
      }

      function bindScriptLibraryEvents() {
        pageHost.querySelectorAll('[data-script-tab]').forEach((node) => {
          node.addEventListener('click', () => {
            scriptLibraryState.page = node.dataset.scriptTab
            scriptLibraryState.search = ''
            scriptLibraryState.searchDraft = ''
            scriptLibraryState.selectedId = null
            renderScriptLibraryPage()
          })
        })

        pageHost.querySelectorAll('[data-script-filter]').forEach((node) => {
          node.addEventListener('click', () => {
            const { scriptFilter, scriptValue } = node.dataset
            scriptLibraryState[scriptFilter] = scriptValue
            if (scriptFilter !== 'evidenceWindow') {
              scriptLibraryState.selectedId = null
            }
            renderScriptLibraryPage()
          })
        })

        const searchInput = document.getElementById('scriptLibrarySearch')
        if (searchInput) {
          const commitSearch = () => {
            scriptLibraryState.searchDraft = searchInput.value || ''
            scriptLibraryState.search = scriptLibraryState.searchDraft.trim()
            scriptLibraryState.selectedId = null
            renderScriptLibraryPage()
          }

          searchInput.addEventListener('input', () => {
            scriptLibraryState.searchDraft = searchInput.value || ''
          })
          searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitSearch()
            }
          })

          pageHost.querySelectorAll('[data-script-search-submit]').forEach((node) => {
            node.addEventListener('click', commitSearch)
          })
        }

        pageHost.querySelectorAll('[data-script-select]').forEach((node) => {
          const selectItem = () => {
            scriptLibraryState.selectedId = node.dataset.scriptSelect
            renderScriptLibraryPage()
          }
          node.addEventListener('click', selectItem)
          node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              selectItem()
            }
          })
        })
      }

      function renderScriptLibraryPage() {
        const badge = document.getElementById('scriptLibraryDataBadge')
        const body = document.getElementById('scriptLibraryPageBody')
        if (!body) {
          return
        }

        renderScriptLibraryTabs()
        if (badge) {
          badge.textContent = scriptLibraryState.page
        }
        body.innerHTML = scriptLibraryState.page === '话术速查'
          ? renderQuickLookupPage()
          : renderMonthlyTrainingPage()
        bindScriptLibraryEvents()
      }

      function getSessionBrand(carSeries) {
        if (sessionCarSeriesGroups.传祺车型库.includes(carSeries) || carSeries.startsWith('传祺')) {
          return '传祺'
        }
        if (sessionCarSeriesGroups.昊铂车型库.includes(carSeries) || carSeries.includes('Hyper')) {
          return '昊铂'
        }
        if (sessionCarSeriesGroups.埃安车型库.includes(carSeries) || carSeries.startsWith('埃安')) {
          return '埃安'
        }
        return '未知品牌'
      }

      function getSessionUnknownCarSeriesValue(brand) {
        return `${sessionUnknownCarSeriesPrefix}${brand}`
      }

      function isSessionUnknownCarSeriesValue(value) {
        return typeof value === 'string' && value.startsWith(sessionUnknownCarSeriesPrefix)
      }

      function getSessionUnknownCarSeriesBrand(value) {
        return isSessionUnknownCarSeriesValue(value) ? value.slice(sessionUnknownCarSeriesPrefix.length) : ''
      }

      function getLeadAvailableCarSeriesGroups(brand) {
        if (brand === '全部') {
          return sessionCarSeriesGroups
        }

        return Object.fromEntries(
          Object.entries(sessionCarSeriesGroups).filter(([label]) => sessionCarSeriesGroupBrands[label] === brand)
        )
      }

      function isLeadCarSeriesAvailable(carSeries, brand) {
        if (carSeries === '全部') {
          return true
        }
        if (isSessionUnknownCarSeriesValue(carSeries)) {
          return brand === '全部' || getSessionUnknownCarSeriesBrand(carSeries) === brand
        }

        const groups = getLeadAvailableCarSeriesGroups(brand)
        return Object.values(groups).some((items) => items.includes(carSeries))
      }

      function getSessionStatusClass(status) {
        if (status === '已完成') {
          return 'green'
        }
        if (status === '失败') {
          return 'red'
        }
        return 'blue'
      }

      function maskDisplayName(value) {
        const chars = Array.from(String(value))
        if (chars.length <= 1) {
          return value
        }
        if (chars.length === 2) {
          return `${chars[0]}*`
        }
        if (chars.length === 3) {
          return `${chars[0]}*${chars[2]}`
        }
        return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars[chars.length - 1]}`
      }

      function getSessionOrganizationFilterPath(item) {
        return `${item.organizationPath} > ${item.advisorName}`
      }

      function formatSessionOrganizationDisplay(value) {
        if (value === '全部组织') {
          return value
        }

        return value.replaceAll(' > ', ' / ')
      }

      function getSessionDisplayText(filterKey, value) {
        if (filterKey === 'organization') {
          return formatSessionOrganizationDisplay(value)
        }
        if (filterKey === 'carSeries' && isSessionUnknownCarSeriesValue(value)) {
          return `${getSessionUnknownCarSeriesBrand(value)} / 未知`
        }
        return value
      }

      function getSessionMenuOptions(options, selectedValue, filterKey) {
        return options
          .map((option) => {
            const normalizedOption = typeof option === 'string' ? { label: option, value: option } : option
            const active = selectedValue === normalizedOption.value ? ' active' : ''
            return `
              <button
                type="button"
                class="session-menu-option${active}"
                data-session-select-key="${escapeHtml(filterKey)}"
                data-session-select-value="${escapeHtml(normalizedOption.value)}"
              >
                <span>${escapeHtml(normalizedOption.label)}</span>
              </button>
            `
          })
          .join('')
      }

      function getSessionOrganizationColumns(draftPath) {
        const columns = []
        let currentNodes = sessionOrganizationTree

        while (currentNodes && currentNodes.length) {
          columns.push(currentNodes)

          const activeNode = currentNodes.find((node) => draftPath === node.path || draftPath.startsWith(`${node.path} > `))
          if (!activeNode || !activeNode.children || !activeNode.children.length) {
            break
          }

          currentNodes = activeNode.children
        }

        return columns
      }

      function normalizeSessionOrganizationSearchText(value) {
        return String(value || '')
          .toLowerCase()
          .replaceAll(' > ', '')
          .replaceAll('/', '')
          .replaceAll('／', '')
          .replace(/\s+/g, '')
      }

      function flattenSessionOrganizationNodes(nodes, collection = []) {
        nodes.forEach((node) => {
          collection.push(node)
          if (node.children && node.children.length) {
            flattenSessionOrganizationNodes(node.children, collection)
          }
        })

        return collection
      }

      const flatSessionOrganizationNodes = flattenSessionOrganizationNodes(sessionOrganizationTree)

      function getSessionOrganizationSearchResults(keyword) {
        const normalizedKeyword = normalizeSessionOrganizationSearchText(keyword)
        if (!normalizedKeyword) {
          return []
        }

        return flatSessionOrganizationNodes.filter((node) => {
          const normalizedLabel = normalizeSessionOrganizationSearchText(node.label)
          const normalizedPath = normalizeSessionOrganizationSearchText(node.path)
          return normalizedLabel.includes(normalizedKeyword) || normalizedPath.includes(normalizedKeyword)
        })
      }

      function formatSessionDateDisplay(value) {
        if (!value) {
          return '不限'
        }

        const [year, month, day] = value.split('-')
        return `${year}/${month}/${day}`
      }

      function formatSessionMonthLabel(year, month) {
        return `${year}年${month}月`
      }

      function parseSessionDateValue(value) {
        if (!value) {
          return null
        }

        const [year, month, day] = value.split('-').map(Number)
        return new Date(year, month - 1, day)
      }

      function formatSessionDateValue(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      function getSessionDateCells(year, month) {
        const days = []
        const firstDay = new Date(year, month - 1, 1)
        const lastDate = new Date(year, month, 0).getDate()
        const leadingSlots = (firstDay.getDay() + 6) % 7

        for (let index = 0; index < leadingSlots; index += 1) {
          days.push(null)
        }

        for (let day = 1; day <= lastDate; day += 1) {
          days.push(new Date(year, month - 1, day))
        }

        while (days.length % 7 !== 0) {
          days.push(null)
        }

        return days
      }

      function shiftSessionDateView(offset) {
        let nextYear = sessionMenuState.dateViewYear
        let nextMonth = sessionMenuState.dateViewMonth + offset

        while (nextMonth < 1) {
          nextMonth += 12
          nextYear -= 1
        }

        while (nextMonth > 12) {
          nextMonth -= 12
          nextYear += 1
        }

        sessionMenuState.dateViewYear = nextYear
        sessionMenuState.dateViewMonth = nextMonth
      }

      function syncSessionDateView(value) {
        if (!value) {
          return
        }

        const target = parseSessionDateValue(value)
        if (!target) {
          return
        }

        sessionMenuState.dateViewYear = target.getFullYear()
        sessionMenuState.dateViewMonth = target.getMonth() + 1
      }

      function applySessionDateDraft(field, value) {
        if (field === 'startDate') {
          sessionMenuState.dateDraftStartDate = value
          if (!sessionMenuState.dateDraftEndDate || sessionMenuState.dateDraftEndDate < value) {
            sessionMenuState.dateDraftEndDate = value
          }
          sessionMenuState.activeDateField = 'endDate'
          syncSessionDateView(sessionMenuState.dateDraftEndDate)
          return
        }

        sessionMenuState.dateDraftEndDate = value
        if (!sessionMenuState.dateDraftStartDate || sessionMenuState.dateDraftStartDate > value) {
          sessionMenuState.dateDraftStartDate = value
        }
      }

      function getSessionDateRangeText(startDate, endDate) {
        return `${formatSessionDateDisplay(startDate)} 至 ${formatSessionDateDisplay(endDate)}`
      }

      function renderSessionDateMenu() {
        const activeField = sessionMenuState.activeDateField
        const startDate = sessionMenuState.dateDraftStartDate
        const endDate = sessionMenuState.dateDraftEndDate
        const todayValue = formatSessionDateValue(new Date())
        const cells = getSessionDateCells(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth)

        return `
          <div class="session-menu-panel session-menu-panel-date" data-session-menu-panel="date">
            <div class="session-date-panel-head">
              <div class="session-date-panel-copy">
                <span>录音开始时间范围</span>
                <strong>${escapeHtml(getSessionDateRangeText(startDate, endDate))}</strong>
              </div>
              <div class="session-date-nav">
                <button type="button" class="session-date-nav-btn" data-session-date-nav="-1" aria-label="上一个月">
                  <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
                </button>
                <strong>${escapeHtml(formatSessionMonthLabel(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth))}</strong>
                <button type="button" class="session-date-nav-btn" data-session-date-nav="1" aria-label="下一个月">
                  <i class="session-date-nav-arrow next" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="session-date-tabs">
              <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" data-session-date-field="startDate">
                <span>开始日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(startDate))}</strong>
              </button>
              <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" data-session-date-field="endDate">
                <span>结束日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(endDate))}</strong>
              </button>
            </div>
            <div class="session-date-weekdays">
              <span>一</span>
              <span>二</span>
              <span>三</span>
              <span>四</span>
              <span>五</span>
              <span>六</span>
              <span>日</span>
            </div>
            <div class="session-date-grid">
              ${cells
                .map((date) => {
                  if (!date) {
                    return '<span class="session-date-empty" aria-hidden="true"></span>'
                  }

                  const value = formatSessionDateValue(date)
                  const inRange = startDate && endDate && value >= startDate && value <= endDate
                  const isStart = value === startDate
                  const isEnd = value === endDate
                  const isToday = value === todayValue
                  return `
                    <button
                      type="button"
                      class="session-date-day${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}${isToday ? ' is-today' : ''}"
                      data-session-date-value="${escapeHtml(value)}"
                    >
                      ${date.getDate()}
                    </button>
                  `
                })
                .join('')}
            </div>
            <div class="session-date-shortcuts">
              <button type="button" class="session-date-shortcut" data-session-date-shortcut="today">今天</button>
              <button type="button" class="session-date-shortcut" data-session-date-shortcut="last3">近3天</button>
              <button type="button" class="session-date-shortcut" data-session-date-shortcut="last7">近7天</button>
            </div>
            <div class="session-cascader-footer session-date-footer">
              <span>${escapeHtml(`已选择 ${getSessionDateRangeText(startDate, endDate)}`)}</span>
              <div class="session-date-actions">
                <button type="button" class="btn session-date-action-btn" data-session-date-cancel="true">取消</button>
                <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-session-date-apply="true">应用日期</button>
              </div>
            </div>
          </div>
        `
      }

      function renderSessionOrganizationControl() {
        const open = sessionMenuState.openMenu === 'organization'
        const searchQuery = sessionMenuState.organizationSearchQuery || ''
        const hasSearchQuery = Boolean(searchQuery.trim())
        const isSearchActive = sessionMenuState.organizationSearchActive || hasSearchQuery
        const displayValue = open
          ? sessionMenuState.organizationDraftPath || sessionFilterState.organization
          : sessionFilterState.organization

        return `
          <div class="session-toolbar-control session-toolbar-menu${open ? ' is-open' : ''} session-toolbar-control-org" data-session-menu-root="organization">
            <span>组织</span>
            <div class="session-select-trigger session-select-trigger-search${open ? ' active' : ''}">
              <div class="session-select-trigger-search-main">
                <input
                  type="text"
                  class="session-select-trigger-search-input${isSearchActive ? '' : ' is-display-mode'}"
                  data-session-org-trigger-input
                  value="${escapeHtml(searchQuery)}"
                  placeholder="${escapeHtml(isSearchActive ? '搜索门店/顾问' : getSessionDisplayText('organization', displayValue))}"
                  aria-label="搜索组织或顾问"
                />
              </div>
              <button
                type="button"
                class="session-select-trigger-search-toggle"
                data-session-org-trigger-toggle
                aria-label="展开组织筛选"
                aria-haspopup="listbox"
                aria-expanded="${open ? 'true' : 'false'}"
              >
                <span class="session-select-caret" aria-hidden="true"></span>
              </button>
            </div>
            ${open ? renderSessionOrganizationMenu() : ''}
          </div>
        `
      }

      function renderSessionMenuControl(filterKey, label, selectedValue, panelMarkup, extraClass = '') {
        const open = sessionMenuState.openMenu === filterKey
        return `
          <div class="session-toolbar-control session-toolbar-menu${open ? ' is-open' : ''} ${extraClass}" data-session-menu-root="${escapeHtml(filterKey)}">
            <span>${escapeHtml(label)}</span>
            <button
              type="button"
              class="session-select-trigger${open ? ' active' : ''}"
              data-session-menu-trigger="${escapeHtml(filterKey)}"
              aria-label="${escapeHtml(label)}"
              aria-haspopup="listbox"
              aria-expanded="${open ? 'true' : 'false'}"
            >
              <strong>${escapeHtml(getSessionDisplayText(filterKey, selectedValue))}</strong>
              <span class="session-select-caret" aria-hidden="true"></span>
            </button>
            ${open ? panelMarkup : ''}
          </div>
        `
      }

      function renderSessionIntentLevelHelp() {
        return `
          <span class="session-intent-help">
            <button
              type="button"
              class="session-intent-help-btn"
              aria-label="查看AI意向等级评定规则"
              aria-describedby="sessionIntentRuleTooltip"
            >?</button>
            <span class="session-intent-rule-tooltip" id="sessionIntentRuleTooltip" role="tooltip">
              <strong class="session-intent-rule-title">AI意向等级评定规则</strong>
              <table class="session-intent-rule-table">
                <thead>
                  <tr>
                    <th scope="col">等级</th>
                    <th scope="col">判定标准</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">高</th>
                    <td>近期购买、问具体配置价格、主动约试驾、询问提车时间</td>
                  </tr>
                  <tr>
                    <th scope="row">中</th>
                    <td>有需求但时间未定、对比阶段、需再考虑、已约定跟进</td>
                  </tr>
                  <tr>
                    <th scope="row">低</th>
                    <td>仅初步了解、无明确计划、被推销后简单应付</td>
                  </tr>
                  <tr>
                    <th scope="row">无</th>
                    <td>明确拒绝、无意向</td>
                  </tr>
                  <tr>
                    <th scope="row">无法判断</th>
                    <td>ASR内容过短或杂乱，无法提取信息，无法判断</td>
                  </tr>
                </tbody>
              </table>
            </span>
          </span>
        `
      }

      function renderSessionSegmentControl(filterKey, label, selectedValue, options, extraClass = '', labelAccessory = '') {
        return `
          <div class="session-toolbar-control session-toolbar-segment-control ${extraClass}">
            <span>${escapeHtml(label)}${labelAccessory}</span>
            <div class="todo-filter-tabs" role="group" aria-label="${escapeHtml(label)}">
              ${options.map((option) => `
                <button
                  type="button"
                  class="todo-filter-tab${selectedValue === option ? ' active' : ''}"
                  data-session-segment-filter="${escapeHtml(filterKey)}"
                  data-session-segment-value="${escapeHtml(option)}"
                  aria-pressed="${selectedValue === option ? 'true' : 'false'}"
                >
                  ${escapeHtml(option)}
                </button>
              `).join('')}
            </div>
          </div>
        `
      }

      function renderSessionSearchFieldControl(field) {
        const currentValue = (sessionFilterState.searchQueries && sessionFilterState.searchQueries[field.key]) || ''
        return `
          <div class="session-toolbar-control session-toolbar-control-search session-toolbar-control-search-field" aria-label="${escapeHtml(`${field.label}筛选`)}">
            <span>${escapeHtml(field.label)}</span>
            <div class="session-search-field">
              <input
                type="text"
                class="session-search-input"
                data-session-search-key="${escapeHtml(field.key)}"
                value="${escapeHtml(currentValue)}"
                aria-label="${escapeHtml(`${field.label}输入`)}"
                placeholder="${escapeHtml(`请输入${field.label}`)}"
              />
              <span class="session-search-icon" aria-hidden="true"></span>
            </div>
          </div>
        `
      }

      function renderSessionDateControl() {
        const open = sessionMenuState.openMenu === 'date'
        return `
          <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date${open ? ' is-open' : ''}" data-session-menu-root="date">
            <span>录音开始时间</span>
            <button
              type="button"
              class="session-date-trigger${open ? ' active' : ''}"
              data-session-menu-trigger="date"
              aria-label="录音开始时间筛选"
              aria-haspopup="dialog"
              aria-expanded="${open ? 'true' : 'false'}"
            >
              <strong>${escapeHtml(formatSessionDateDisplay(sessionFilterState.startDate))}</strong>
              <em>至</em>
              <strong>${escapeHtml(formatSessionDateDisplay(sessionFilterState.endDate))}</strong>
              <span class="session-date-icon" aria-hidden="true"></span>
            </button>
            ${open ? renderSessionDateMenu() : ''}
          </div>
        `
      }

      function renderSessionOptionMenu(filterKey, options, selectedValue, extraClass = '') {
        return `
          <div class="session-menu-panel ${extraClass}" data-session-menu-panel="${escapeHtml(filterKey)}">
            <div class="session-menu-option-list">
              ${getSessionMenuOptions(options, selectedValue, filterKey)}
            </div>
          </div>
        `
      }

      function renderSessionCarSeriesMenu(selectedValue) {
        const groups = Object.entries(sessionCarSeriesGroups)
          .map(([label, options]) => {
            const brand = sessionCarSeriesGroupBrands[label]
            const groupOptions = [...options, { label: '未知', value: getSessionUnknownCarSeriesValue(brand) }]
            return `
              <section class="session-menu-group">
                <div class="session-menu-group-label">${escapeHtml(label)}</div>
                <div class="session-menu-option-list">
                  ${getSessionMenuOptions(groupOptions, selectedValue, 'carSeries')}
                </div>
              </section>
            `
          })
          .join('')

        return `
          <div class="session-menu-panel session-menu-panel-groups" data-session-menu-panel="carSeries">
            <div class="session-menu-group">
              <div class="session-menu-option-list">
                ${getSessionMenuOptions(['全部'], selectedValue, 'carSeries')}
              </div>
            </div>
            ${groups}
          </div>
        `
      }

      function renderSessionOrganizationMenu() {
        const draftPath = sessionMenuState.organizationDraftPath || sessionFilterState.organization
        const searchQuery = sessionMenuState.organizationSearchQuery || ''
        const isSearching = Boolean(searchQuery.trim())
        const searchResults = isSearching ? getSessionOrganizationSearchResults(searchQuery) : []
        const columns = getSessionOrganizationColumns(draftPath)

        return `
          <div class="session-menu-panel session-menu-panel-cascader" data-session-menu-panel="organization">
            <div class="session-cascader-top">
              <button
                type="button"
                class="session-menu-option session-menu-option-clear${draftPath === '全部组织' ? ' active' : ''}"
                data-session-org-clear="true"
              >
                <span>全部组织</span>
              </button>
              <div class="session-cascader-current">
                <span>当前层级</span>
                <strong>${escapeHtml(getSessionDisplayText('organization', draftPath))}</strong>
              </div>
            </div>
            ${
              isSearching
                ? `
                  <div class="session-cascader-search-panel">
                    ${
                      searchResults.length
                        ? `
                          <div class="session-cascader-search-results">
                            ${searchResults
                              .map((node) => {
                                const active = draftPath === node.path || draftPath.startsWith(`${node.path} > `) ? ' active' : ''
                                return `
                                  <button
                                    type="button"
                                    class="session-cascader-option session-cascader-search-option${active}"
                                    data-session-org-path="${escapeHtml(node.path)}"
                                    data-session-org-has-children="${node.children && node.children.length ? 'true' : 'false'}"
                                    data-session-org-from-search="true"
                                  >
                                    <span class="session-cascader-search-main">
                                      <span class="session-cascader-search-label">${escapeHtml(node.label)}</span>
                                      <span class="session-cascader-search-copy">${escapeHtml(formatSessionOrganizationDisplay(node.path))}</span>
                                    </span>
                                    ${
                                      node.children && node.children.length
                                        ? '<i class="session-cascader-arrow" aria-hidden="true"></i>'
                                        : ''
                                    }
                                  </button>
                                `
                              })
                              .join('')}
                          </div>
                        `
                        : '<div class="session-cascader-search-empty">未找到匹配的组织或顾问</div>'
                    }
                  </div>
                `
                : `
                  <div class="session-cascader-columns">
                    ${columns
                      .map((nodes) => {
                        return `
                          <div class="session-cascader-column">
                            ${nodes
                              .map((node) => {
                                const active = draftPath === node.path || draftPath.startsWith(`${node.path} > `) ? ' active' : ''
                                return `
                                  <button
                                    type="button"
                                    class="session-cascader-option${active}"
                                    data-session-org-path="${escapeHtml(node.path)}"
                                    data-session-org-has-children="${node.children && node.children.length ? 'true' : 'false'}"
                                  >
                                    <span>${escapeHtml(node.label)}</span>
                                    ${
                                      node.children && node.children.length
                                        ? '<i class="session-cascader-arrow" aria-hidden="true"></i>'
                                        : ''
                                    }
                                  </button>
                                `
                              })
                              .join('')}
                          </div>
                        `
                      })
                      .join('')}
                  </div>
                `
            }
            <div class="session-cascader-footer">
              <span>筛选将覆盖当前层级及其下属门店与顾问</span>
              <button type="button" class="btn-primary" data-session-org-apply="${escapeHtml(draftPath)}">应用组织</button>
            </div>
          </div>
        `
      }

      function getActiveSessionSummary() {
        const items = []
        if (sessionFilterState.organization !== sessionDefaultFilters.organization) {
          items.push(`组织: ${getSessionDisplayText('organization', sessionFilterState.organization)}`)
        }
        if (sessionFilterState.stage !== '全部') {
          items.push(`质检场景: ${sessionFilterState.stage}`)
        }
        if (sessionFilterState.source !== '全部') {
          items.push(`数据来源: ${sessionFilterState.source}`)
        }
        if (sessionFilterState.carSeries !== '全部') {
          items.push(`车系: ${getSessionDisplayText('carSeries', sessionFilterState.carSeries)}`)
        }
        if (sessionFilterState.intentLevel !== '全部') {
          items.push(`AI意向等级: ${sessionFilterState.intentLevel}`)
        }
        sessionSearchFields.forEach((field) => {
          const query = String((sessionFilterState.searchQueries && sessionFilterState.searchQueries[field.key]) || '').trim()
          if (query) {
            items.push(`${field.label}: ${query}`)
          }
        })
        if (sessionFilterState.status !== '全部') {
          items.push(`录音状态: ${sessionFilterState.status}`)
        }
        if (sessionFilterState.startDate || sessionFilterState.endDate) {
          items.push(`录音开始时间: ${sessionFilterState.startDate || '不限'} 至 ${sessionFilterState.endDate || '不限'}`)
        }
        return items
      }

      function getSessionSource(stage) {
        if (typeof sessionSearchUtils.getSessionSourceFromStage === 'function') {
          return sessionSearchUtils.getSessionSourceFromStage(stage)
        }

        if (stage === '邀约' || stage === '试驾PDC') {
          return '云外呼'
        }

        if (stage === '试驾' || stage === '到店接待') {
          return '工牌'
        }

        return '-'
      }

      function getFilteredSessionRecords() {
        return sessionRecords
          .filter((item) => {
            const recordDate = item.recordStartTime.slice(0, 10)
            const organizationMatch = sessionFilterState.organization === '全部组织' || getSessionOrganizationFilterPath(item).startsWith(sessionFilterState.organization)
            const stageMatch = sessionFilterState.stage === '全部' || item.stage === sessionFilterState.stage
            const sourceMatch = sessionFilterState.source === '全部' || getSessionSource(item.stage) === sessionFilterState.source
            const carSeriesMatch =
              sessionFilterState.carSeries === '全部' ||
              item.carSeries === sessionFilterState.carSeries ||
              (isSessionUnknownCarSeriesValue(sessionFilterState.carSeries) && (item.carSeries === '未知' || item.carSeries === `${getSessionUnknownCarSeriesBrand(sessionFilterState.carSeries)}未知`))
            const intentLevelMatch = sessionFilterState.intentLevel === '全部' || item.intentLevel === sessionFilterState.intentLevel
            const searchMatch = doesSessionRecordMatchSearch(item, sessionFilterState.searchQueries)
            const statusMatch = sessionFilterState.status === '全部' || item.status === sessionFilterState.status
            const startMatch = !sessionFilterState.startDate || recordDate >= sessionFilterState.startDate
            const endMatch = !sessionFilterState.endDate || recordDate <= sessionFilterState.endDate
            return organizationMatch && stageMatch && sourceMatch && carSeriesMatch && intentLevelMatch && searchMatch && statusMatch && startMatch && endMatch
          })
          .sort((a, b) => parseDateTimeValue(b.uploadTime) - parseDateTimeValue(a.uploadTime))
      }

      function resetSessionFilters() {
        Object.assign(sessionFilterState, sessionDefaultFilters, {
          searchQueries: createDefaultSessionSearchQueries()
        })
        sessionPaginationState.page = 1
        sessionMenuState.openMenu = null
        sessionMenuState.organizationDraftPath = sessionDefaultFilters.organization
        sessionMenuState.organizationSearchQuery = ''
        sessionMenuState.organizationSearchActive = false
        renderSessionPage()
      }

      function rerenderSessionFilters() {
        renderSessionFilters()
        bindSessionFilterEvents()
        if (!sessionFilterState.collapsed) {
          pageHost.querySelectorAll('#sessionFilterControls .session-filter-extra').forEach((node) => {
            node.classList.add('is-visible')
          })
        }
      }

      function renderSessionCollapseActionButton() {
        const collapsed = sessionFilterState.collapsed
        return `
          <button
            type="button"
            class="session-toggle-text-btn"
            data-session-action="toggle-collapse"
            aria-expanded="${collapsed ? 'false' : 'true'}"
          >
            <span>${collapsed ? '展开' : '收起'}</span>
            <svg class="session-toggle-text-btn-icon${collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        `
      }

      function renderSessionInlineActions(extraClass = '') {
        return `
          <div class="session-filter-inline-actions${extraClass ? ` ${extraClass}` : ''}">
            <button type="button" class="btn session-reset-btn" data-session-action="reset">重置筛选</button>
            ${renderSessionCollapseActionButton()}
          </div>
        `
      }

      function renderSessionFilters() {
        const container = document.getElementById('sessionFilterControls')
        if (!container) {
          return
        }

        container.innerHTML = `
          <div class="session-filter-row session-filter-row-segment${sessionFilterState.collapsed ? ' is-collapsed' : ''}">
            ${renderSessionSegmentControl('stage', '质检场景', sessionFilterState.stage, sessionStageOptions, 'session-toolbar-control-stage')}
            ${renderSessionSegmentControl('source', '数据来源', sessionFilterState.source, sessionSourceOptions, 'session-toolbar-control-source')}
            ${renderSessionSegmentControl('intentLevel', 'AI意向等级', sessionFilterState.intentLevel, sessionIntentLevelOptions, 'session-toolbar-control-intent', renderSessionIntentLevelHelp())}
            ${sessionFilterState.collapsed ? renderSessionInlineActions() : ''}
          </div>
          <div class="session-filter-row session-filter-row-main session-filter-extra">
            ${renderSessionMenuControl('carSeries', '车系', sessionFilterState.carSeries, renderSessionCarSeriesMenu(sessionFilterState.carSeries), 'session-toolbar-control-car')}
            ${renderSessionOrganizationControl()}
            ${renderSessionMenuControl('status', '录音状态', sessionFilterState.status, renderSessionOptionMenu('status', sessionStatusOptions, sessionFilterState.status))}
            ${renderSessionSearchFieldControl({ key: 'leadId', label: '线索ID' })}
          </div>
          <div class="session-filter-row session-filter-row-search session-filter-extra">
            ${sessionSearchFields.filter((field) => field.key !== 'leadId').map((field) => renderSessionSearchFieldControl(field)).join('')}
            ${renderSessionDateControl()}
            ${renderSessionInlineActions('session-filter-inline-actions-search')}
          </div>
        `
      }

      function renderSessionTable(records) {
        const tbody = document.getElementById('sessionTableBody')
        const totalCount = document.getElementById('sessionFilterCount')
        const completedCount = document.getElementById('sessionCompletedCount')
        const failedCount = document.getElementById('sessionFailedCount')
        const pagination = document.getElementById('sessionPagination')

        if (!tbody || !totalCount || !completedCount || !failedCount) {
          return
        }

        const totalPages = Math.max(1, Math.ceil(records.length / sessionPaginationState.pageSize))
        if (sessionPaginationState.page > totalPages) {
          sessionPaginationState.page = totalPages
        }
        const startIndex = (sessionPaginationState.page - 1) * sessionPaginationState.pageSize
        const pagedRecords = records.slice(startIndex, startIndex + sessionPaginationState.pageSize)

        totalCount.textContent = records.length
        completedCount.textContent = records.filter((item) => item.status === '已完成').length
        failedCount.textContent = records.filter((item) => item.status === '失败').length

        if (!records.length) {
          tbody.innerHTML = `
            <tr class="session-empty-row">
              <td colspan="20">当前筛选条件下暂无录音，请调整组织、质检场景、数据来源、AI意向等级、车系、录音开始时间、录音状态或搜索条件后重试。</td>
            </tr>
          `
          if (pagination) {
            pagination.innerHTML = ''
          }
          return
        }

        tbody.innerHTML = pagedRecords
          .map((item) => {
            return `
              <tr>
                <td><span class="cell-main">${escapeHtml(item.id)}</span></td>
                <td>${escapeHtml(item.recordStartTime)}</td>
                <td>${escapeHtml(item.uploadTime)}</td>
                <td>
                  <span class="status-inline ${getSessionStatusClass(item.status)}">
                    <span class="status-inline-dot" aria-hidden="true"></span>
                    <span>${escapeHtml(item.status)}</span>
                  </span>
                </td>
                <td>${escapeHtml(item.duration)}</td>
                <td>${escapeHtml(item.region)}</td>
                <td>${escapeHtml(item.zone)}</td>
                <td>${escapeHtml(item.store)}</td>
                <td>${escapeHtml(item.advisorId)}</td>
                <td>${escapeHtml(item.advisorName)}</td>
                <td>${escapeHtml(item.advisorPhone)}</td>
                <td>${escapeHtml(item.leadId)}</td>
                <td>${escapeHtml(maskDisplayName(item.customerName))}</td>
                <td>${escapeHtml(item.customerPhone)}</td>
                <td>${escapeHtml(item.qualifiedRate)}</td>
                <td><span class="pill-inline ai-intent-pill ${escapeHtml(item.intentLevelClass)}">${escapeHtml(item.intentLevel)}</span></td>
                <td>${escapeHtml(item.carSeries)}</td>
                <td>${escapeHtml(item.stage)}</td>
                <td>${escapeHtml(getSessionSource(item.stage))}</td>
                <td><button class="table-link" data-route="session-detail">查看详情</button></td>
              </tr>
            `
          })
          .join('')

        if (pagination) {
          renderSessionPagination(records.length)
        }
        attachRouteLinks()
      }

      function getSessionPaginationItems(totalPages) {
        const current = sessionPaginationState.page
        if (totalPages <= 7) {
          return Array.from({ length: totalPages }, (_, index) => index + 1)
        }

        const items = [1]
        if (current > 3) items.push('ellipsis-left')
        for (let page = Math.max(2, current - 1); page <= Math.min(totalPages - 1, current + 1); page += 1) {
          items.push(page)
        }
        if (current < totalPages - 2) items.push('ellipsis-right')
        items.push(totalPages)
        return items
      }

      function renderPaginationPageSizeSelect(kind, currentSize) {
        return `
          <div class="custom-select-container page-select page-size-select">
            <button type="button" class="custom-select-trigger page-size-trigger" data-${kind}-page-size-trigger>
              <span>${currentSize} 条/页</span>
            </button>
            <div class="custom-select-options page-size-options">
              ${[10, 20, 50]
                .map((size) => `
                  <button
                    type="button"
                    class="custom-option page-size-option${size === currentSize ? ' active' : ''}"
                    data-${kind}-page-size-option="${size}"
                  >
                    <span>${size} 条/页</span>
                  </button>
                `)
                .join('')}
            </div>
          </div>
        `
      }

      function renderSessionPagination(totalItems) {
        const pagination = document.getElementById('sessionPagination')
        if (!pagination) {
          return
        }

        const totalPages = Math.max(1, Math.ceil(totalItems / sessionPaginationState.pageSize))
        const items = getSessionPaginationItems(totalPages)

        pagination.innerHTML = `
          <div class="dashboard-pagination">
            <span class="session-pagination-total">共 ${totalItems} 条</span>
            <div class="dashboard-pagination-controls">
              ${renderPaginationPageSizeSelect('session', sessionPaginationState.pageSize)}
              <div class="page-group">
                <button type="button" class="page-arrow" data-session-page-arrow="prev" ${sessionPaginationState.page === 1 ? 'disabled' : ''}>‹</button>
                ${items
                  .map((item) =>
                    typeof item === 'number'
                      ? `<button type="button" class="page-num ${item === sessionPaginationState.page ? 'active' : ''}" data-session-page="${item}">${item}</button>`
                      : '<span class="page-ellipsis">…</span>'
                  )
                  .join('')}
                <button type="button" class="page-arrow" data-session-page-arrow="next" ${sessionPaginationState.page === totalPages ? 'disabled' : ''}>›</button>
              </div>
              <div class="page-group page-jump-group">
                <span class="session-page-jump-label">前往</span>
                <label class="page-select page-jump-select">
                  <input type="number" min="1" max="${totalPages}" value="${sessionPaginationState.page}" data-session-page-jump-input>
                </label>
                <span class="session-page-jump-suffix">页</span>
              </div>
            </div>
          </div>
        `
      }

      function bindSessionFilterEvents() {
        pageHost.querySelectorAll('[data-session-menu-trigger]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()

            const nextMenu = sessionMenuState.openMenu === node.dataset.sessionMenuTrigger ? null : node.dataset.sessionMenuTrigger
            sessionMenuState.openMenu = nextMenu

            if (nextMenu === 'organization') {
              sessionMenuState.organizationDraftPath = sessionFilterState.organization
              sessionMenuState.organizationSearchQuery = ''
              sessionMenuState.organizationSearchActive = false
            }

            if (nextMenu === 'date') {
              sessionMenuState.activeDateField = 'startDate'
              sessionMenuState.dateDraftStartDate = sessionFilterState.startDate
              sessionMenuState.dateDraftEndDate = sessionFilterState.endDate
              syncSessionDateView(sessionMenuState.dateDraftStartDate)
            }

            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-org-trigger-toggle]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()

            const willOpen = sessionMenuState.openMenu !== 'organization'
            sessionMenuState.openMenu = willOpen ? 'organization' : null

            if (willOpen) {
              sessionMenuState.organizationDraftPath = sessionFilterState.organization
              sessionMenuState.organizationSearchActive = false
            } else {
              sessionMenuState.organizationSearchQuery = ''
              sessionMenuState.organizationSearchActive = false
            }

            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-org-trigger-input]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
          })

          node.addEventListener('focus', () => {
            if (sessionMenuState.organizationSearchActive) {
              return
            }

            sessionMenuState.organizationSearchActive = true
            sessionMenuState.organizationSearchQuery = ''

            if (sessionMenuState.openMenu !== 'organization') {
              sessionMenuState.openMenu = 'organization'
              sessionMenuState.organizationDraftPath = sessionFilterState.organization
            }

            rerenderSessionFilters()

            window.requestAnimationFrame(() => {
              const input = pageHost.querySelector('[data-session-org-trigger-input]')
              if (input) {
                input.focus()
              }
            })
          })
        })

        pageHost.querySelectorAll('[data-session-select-key]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionFilterState[node.dataset.sessionSelectKey] = node.dataset.sessionSelectValue
            sessionPaginationState.page = 1
            sessionMenuState.openMenu = null
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-segment-filter]').forEach((node) => {
          node.addEventListener('click', () => {
            const filterKey = node.dataset.sessionSegmentFilter
            const filterValue = node.dataset.sessionSegmentValue
            if (!filterKey) {
              return
            }

            const shouldResetPage = sessionFilterState[filterKey] !== filterValue
            sessionFilterState[filterKey] = filterValue
            if (shouldResetPage) {
              sessionPaginationState.page = 1
            }
            sessionMenuState.openMenu = null
            sessionMenuState.organizationSearchQuery = ''
            sessionMenuState.organizationSearchActive = false
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-search-key]').forEach((node) => {
          node.addEventListener('input', (event) => {
            if (event.isComposing) {
              return
            }

            const searchKey = node.dataset.sessionSearchKey
            if (!searchKey) {
              return
            }
            const nextValue = node.value || ''
            const cursorStart = node.selectionStart ?? nextValue.length
            const cursorEnd = node.selectionEnd ?? nextValue.length

            sessionFilterState.searchQueries[searchKey] = nextValue
            sessionPaginationState.page = 1
            renderSessionPage()

            window.requestAnimationFrame(() => {
              const nextInput = pageHost.querySelector(`[data-session-search-key="${searchKey}"]`)
              if (!nextInput) {
                return
              }

              nextInput.focus()
              nextInput.setSelectionRange(cursorStart, cursorEnd)
            })
          })
        })

        pageHost.querySelectorAll('[data-session-org-path]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionMenuState.organizationDraftPath = node.dataset.sessionOrgPath

            if (node.dataset.sessionOrgHasChildren === 'true') {
              if (node.dataset.sessionOrgFromSearch === 'true') {
                sessionMenuState.organizationSearchQuery = ''
                sessionMenuState.organizationSearchActive = false
              }
              rerenderSessionFilters()
              return
            }

            sessionFilterState.organization = node.dataset.sessionOrgPath
            sessionPaginationState.page = 1
            sessionMenuState.organizationSearchQuery = ''
            sessionMenuState.organizationSearchActive = false
            sessionMenuState.openMenu = null
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-org-trigger-input]').forEach((node) => {
          node.addEventListener('input', (event) => {
            if (event.isComposing) {
              return
            }

            const nextValue = node.value || ''
            const cursorStart = node.selectionStart ?? nextValue.length
            const cursorEnd = node.selectionEnd ?? nextValue.length

            sessionMenuState.organizationSearchQuery = nextValue
            sessionMenuState.organizationSearchActive = true
            if (sessionMenuState.openMenu !== 'organization') {
              sessionMenuState.openMenu = 'organization'
              sessionMenuState.organizationDraftPath = sessionFilterState.organization
            }
            rerenderSessionFilters()

            window.requestAnimationFrame(() => {
              const nextInput = pageHost.querySelector('[data-session-org-trigger-input]')
              if (!nextInput) {
                return
              }

              nextInput.focus()
              nextInput.setSelectionRange(cursorStart, cursorEnd)
            })
          })
        })

        pageHost.querySelectorAll('[data-session-org-clear]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionFilterState.organization = '全部组织'
            sessionPaginationState.page = 1
            sessionMenuState.organizationDraftPath = '全部组织'
            sessionMenuState.organizationSearchQuery = ''
            sessionMenuState.organizationSearchActive = false
            sessionMenuState.openMenu = null
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-org-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionFilterState.organization = node.dataset.sessionOrgApply || sessionMenuState.organizationDraftPath || '全部组织'
            sessionPaginationState.page = 1
            sessionMenuState.organizationDraftPath = sessionFilterState.organization
            sessionMenuState.organizationSearchQuery = ''
            sessionMenuState.organizationSearchActive = false
            sessionMenuState.openMenu = null
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-date-field]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionMenuState.activeDateField = node.dataset.sessionDateField
            syncSessionDateView(
              node.dataset.sessionDateField === 'startDate'
                ? sessionMenuState.dateDraftStartDate
                : sessionMenuState.dateDraftEndDate
            )
            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-date-nav]').forEach((node) => {
          node.addEventListener('click', () => {
            shiftSessionDateView(Number(node.dataset.sessionDateNav))
            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-date-value]').forEach((node) => {
          node.addEventListener('click', () => {
            applySessionDateDraft(sessionMenuState.activeDateField, node.dataset.sessionDateValue)
            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-date-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const today = new Date()
            const endValue = formatSessionDateValue(today)
            let startValue = endValue

            if (node.dataset.sessionDateShortcut === 'last3') {
              const start = new Date(today)
              start.setDate(start.getDate() - 2)
              startValue = formatSessionDateValue(start)
            }

            if (node.dataset.sessionDateShortcut === 'last7') {
              const start = new Date(today)
              start.setDate(start.getDate() - 6)
              startValue = formatSessionDateValue(start)
            }

            sessionMenuState.dateDraftStartDate = startValue
            sessionMenuState.dateDraftEndDate = endValue
            sessionMenuState.activeDateField = 'endDate'
            syncSessionDateView(endValue)
            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-date-cancel]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionMenuState.openMenu = null
            rerenderSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-date-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionFilterState.startDate = sessionMenuState.dateDraftStartDate
            sessionFilterState.endDate = sessionMenuState.dateDraftEndDate
            sessionPaginationState.page = 1
            sessionMenuState.openMenu = null
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-filter]').forEach((node) => {
          node.addEventListener('change', () => {
            sessionFilterState[node.dataset.sessionFilter] = node.value
            if (node.dataset.sessionFilter === 'startDate' && sessionFilterState.endDate && sessionFilterState.startDate > sessionFilterState.endDate) {
              sessionFilterState.endDate = sessionFilterState.startDate
            }
            if (node.dataset.sessionFilter === 'endDate' && sessionFilterState.startDate && sessionFilterState.endDate < sessionFilterState.startDate) {
              sessionFilterState.startDate = sessionFilterState.endDate
            }
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-action="reset"]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.preventDefault()
            resetSessionFilters()
          })
        })

        pageHost.querySelectorAll('[data-session-action="toggle-collapse"]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.preventDefault()
            sessionMenuState.openMenu = null
            sessionMenuState.organizationSearchQuery = ''
            sessionMenuState.organizationSearchActive = false
            if (sessionFilterState.collapsed) {
              sessionFilterState.collapsed = false
              renderSessionPage()
              requestAnimationFrame(() => {
                const extras = pageHost.querySelectorAll('#sessionFilterControls .session-filter-extra')
                extras.forEach((el) => el.classList.add('is-visible'))
              })
            } else {
              const extras = pageHost.querySelectorAll('#sessionFilterControls .session-filter-extra')
              extras.forEach((el) => el.classList.remove('is-visible'))
              setTimeout(() => {
                sessionFilterState.collapsed = true
                renderSessionPage()
              }, 300)
            }
          })
        })

        pageHost.querySelectorAll('[data-session-page]').forEach((node) => {
          node.addEventListener('click', () => {
            sessionPaginationState.page = Number(node.dataset.sessionPage)
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-page-arrow]').forEach((node) => {
          node.addEventListener('click', () => {
            const delta = node.dataset.sessionPageArrow === 'prev' ? -1 : 1
            sessionPaginationState.page = Math.max(1, sessionPaginationState.page + delta)
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-page-size-trigger]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
            const options = node.parentElement?.querySelector('.page-size-options')
            const willOpen = !options?.classList.contains('open')
            document.querySelectorAll('.page-size-options').forEach((optionNode) => {
              if (optionNode !== options) {
                optionNode.classList.remove('open')
              }
            })
            document.querySelectorAll('[data-session-page-size-trigger], [data-leads-page-size-trigger]').forEach((triggerNode) => {
              if (triggerNode !== node) {
                triggerNode.classList.remove('is-open')
              }
            })
            options?.classList.toggle('open', willOpen)
            node.classList.toggle('is-open', willOpen)
          })
        })

        pageHost.querySelectorAll('[data-session-page-size-option]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
            sessionPaginationState.pageSize = Number(node.dataset.sessionPageSizeOption)
            sessionPaginationState.page = 1
            renderSessionPage()
          })
        })

        pageHost.querySelectorAll('[data-session-page-jump-input]').forEach((node) => {
          const applyPageJump = () => {
            const totalPages = Math.max(1, Math.ceil(getFilteredSessionRecords().length / sessionPaginationState.pageSize))
            const nextPage = Math.min(totalPages, Math.max(1, Number(node.value || 1)))
            sessionPaginationState.page = nextPage
            renderSessionPage()
          }

          node.addEventListener('change', applyPageJump)
          node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyPageJump()
            }
          })
        })
      }

      function renderSessionPage() {
        renderSessionFilters()
        renderSessionTable(getFilteredSessionRecords())
        bindSessionFilterEvents()
        if (!sessionFilterState.collapsed) {
          requestAnimationFrame(() => {
            const extras = pageHost.querySelectorAll('#sessionFilterControls .session-filter-extra')
            extras.forEach((el) => el.classList.add('is-visible'))
          })
        }
      }

      function getLeadDisplayText(filterKey, value) {
        if (filterKey === 'organization') {
          return value === '全部组织' ? '全部组织' : value.replaceAll(' > ', ' / ')
        }
        if (filterKey === 'carSeries' && isSessionUnknownCarSeriesValue(value)) {
          return `${getSessionUnknownCarSeriesBrand(value)} / 未知`
        }
        return value
      }

      function getLeadMenuOptions(options, selectedValue, filterKey) {
        return options
          .map((option) => {
            const normalizedOption = typeof option === 'string' ? { label: option, value: option } : option
            const active = selectedValue === normalizedOption.value ? ' active' : ''
            return `
              <button
                type="button"
                class="session-menu-option${active}"
                data-leads-select-key="${escapeHtml(filterKey)}"
                data-leads-select-value="${escapeHtml(normalizedOption.value)}"
              >
                <span>${escapeHtml(normalizedOption.label)}</span>
              </button>
            `
          })
          .join('')
      }

      function renderLeadsMenuControl(filterKey, label, selectedValue, panelMarkup, extraClass = '') {
        const open = leadsMenuState.openMenu === filterKey
        return `
          <div class="session-toolbar-control session-toolbar-menu${open ? ' is-open' : ''} ${extraClass}" data-leads-menu-root="${escapeHtml(filterKey)}">
            <span>${escapeHtml(label)}</span>
            <button
              type="button"
              class="session-select-trigger${open ? ' active' : ''}"
              data-leads-menu-trigger="${escapeHtml(filterKey)}"
              aria-label="${escapeHtml(label)}"
              aria-haspopup="listbox"
              aria-expanded="${open ? 'true' : 'false'}"
            >
              <strong>${escapeHtml(getLeadDisplayText(filterKey, selectedValue))}</strong>
              <span class="session-select-caret" aria-hidden="true"></span>
            </button>
            ${open ? panelMarkup : ''}
          </div>
        `
      }

      function renderLeadsCustomerSearchControl() {
        const searchTarget = leadCustomerSearchTargetOptions.some((option) => option.value === leadsFilterState.customerQueryTarget)
          ? leadsFilterState.customerQueryTarget
          : 'customerName'
        const searchTargetLabel = getLeadCustomerSearchTargetLabel(searchTarget)
        const open = leadsMenuState.openMenu === 'customerQueryTarget'

        return `
          <div class="session-toolbar-control session-toolbar-control-search session-toolbar-control-phone-search session-toolbar-menu${open ? ' is-open' : ''}" data-leads-menu-root="customerQueryTarget" aria-label="${escapeHtml(`${searchTargetLabel}查询`)}">
            <div class="session-phone-search-main">
              <div class="session-phone-target-select-wrap">
                <button
                  type="button"
                  class="session-phone-target-trigger${open ? ' active' : ''}"
                  data-leads-menu-trigger="customerQueryTarget"
                  aria-label="客户查询字段"
                  aria-haspopup="listbox"
                  aria-expanded="${open ? 'true' : 'false'}"
                >
                  <strong>${escapeHtml(searchTargetLabel)}</strong>
                  <span class="session-select-caret" aria-hidden="true"></span>
                </button>
              </div>
              <div class="session-search-field">
                <input
                  type="text"
                  class="session-search-input"
                  data-leads-customer-query
                  value="${escapeHtml(leadsFilterState.customerQuery || '')}"
                  aria-label="${escapeHtml(`${searchTargetLabel}输入`)}"
                  placeholder="${escapeHtml(getLeadCustomerSearchPlaceholder(searchTarget))}"
                />
                <span class="session-search-icon" aria-hidden="true"></span>
              </div>
            </div>
            ${open ? renderLeadsOptionMenu('customerQueryTarget', leadCustomerSearchTargetOptions, searchTarget, 'session-phone-target-menu') : ''}
          </div>
        `
      }

      function renderLeadsListSearchControl() {
        const searchTarget = leadSearchTargetOptions.some((option) => option.value === leadsFilterState.leadQueryTarget)
          ? leadsFilterState.leadQueryTarget
          : 'customerName'
        const searchTargetLabel = leadSearchTargetOptions.find((option) => option.value === searchTarget)?.label || '客户姓名'
        const open = leadsMenuState.openMenu === 'leadQueryTarget'

        return `
          <div class="session-toolbar-control session-toolbar-control-search session-toolbar-control-phone-search session-toolbar-menu${open ? ' is-open' : ''}" data-leads-menu-root="leadQueryTarget" aria-label="${escapeHtml(`${searchTargetLabel}查询`)}">
            <div class="session-phone-search-main">
              <div class="session-phone-target-select-wrap">
                <button
                  type="button"
                  class="session-phone-target-trigger${open ? ' active' : ''}"
                  data-leads-menu-trigger="leadQueryTarget"
                  aria-label="查询字段"
                  aria-haspopup="listbox"
                  aria-expanded="${open ? 'true' : 'false'}"
                >
                  <strong>${escapeHtml(searchTargetLabel)}</strong>
                  <span class="session-select-caret" aria-hidden="true"></span>
                </button>
              </div>
              <div class="session-search-field">
                <input
                  type="text"
                  class="session-search-input"
                  data-leads-list-query
                  value="${escapeHtml(leadsFilterState.leadQuery || '')}"
                  aria-label="${escapeHtml(`${searchTargetLabel}输入`)}"
                  placeholder="${escapeHtml(`请输入${searchTargetLabel}`)}"
                />
                <span class="session-search-icon" aria-hidden="true"></span>
              </div>
            </div>
            ${open ? renderLeadsOptionMenu('leadQueryTarget', leadSearchTargetOptions, searchTarget, 'session-phone-target-menu') : ''}
          </div>
        `
      }

      function renderLeadsDateControl(label = '日期') {
        const open = leadsMenuState.openMenu === 'date'
        return `
          <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date leads-statistics-date-control${open ? ' is-open' : ''}" data-leads-menu-root="date">
            <span>${escapeHtml(label)}</span>
            <button
              type="button"
              class="session-date-trigger${open ? ' active' : ''}"
              data-leads-menu-trigger="date"
              aria-label="${escapeHtml(label)}筛选"
              aria-haspopup="dialog"
              aria-expanded="${open ? 'true' : 'false'}"
            >
              <strong>${escapeHtml(formatSessionDateDisplay(leadsFilterState.startDate))}</strong>
              <em>至</em>
              <strong>${escapeHtml(formatSessionDateDisplay(leadsFilterState.endDate))}</strong>
              <span class="session-date-icon" aria-hidden="true"></span>
            </button>
            ${open ? renderLeadsDateMenu() : ''}
          </div>
        `
      }

      function renderLeadsSimpleSearchControl(filterKey, label, value, placeholder) {
        return `
          <div class="session-toolbar-control session-toolbar-control-search leads-simple-search" data-leads-search-key="${escapeHtml(filterKey)}">
            <span>${escapeHtml(label)}</span>
            <div class="session-search-field">
              <input
                type="text"
                class="session-search-input"
                data-leads-simple-query="${escapeHtml(filterKey)}"
                value="${escapeHtml(value || '')}"
                aria-label="${escapeHtml(placeholder)}"
                placeholder="${escapeHtml(placeholder)}"
              />
              <span class="session-search-icon" aria-hidden="true"></span>
            </div>
          </div>
        `
      }

      function renderLeadsCustomerAggregateDateControl(menuKey, label, startDateKey, endDateKey, extraClass = '') {
        const open = leadsMenuState.openMenu === menuKey
        const startDate = leadsFilterState[startDateKey]
        const endDate = leadsFilterState[endDateKey]

        return `
          <div class="session-toolbar-control session-toolbar-menu session-toolbar-control-date${open ? ' is-open' : ''} ${extraClass}" data-leads-menu-root="${escapeHtml(menuKey)}">
            <span>${escapeHtml(label)}</span>
            <button
              type="button"
              class="session-date-trigger${open ? ' active' : ''}"
              data-leads-menu-trigger="${escapeHtml(menuKey)}"
              aria-label="${escapeHtml(label)}筛选"
              aria-haspopup="dialog"
              aria-expanded="${open ? 'true' : 'false'}"
            >
              <strong>${escapeHtml(getLeadCustomerDateRangeText(startDate, endDate))}</strong>
              <span class="session-date-icon" aria-hidden="true"></span>
            </button>
            ${open ? renderLeadsCustomerDateMenu(menuKey, label) : ''}
          </div>
        `
      }

      function getLeadsCustomerDateFilterConfig(menuKey) {
        if (menuKey === 'customerFirstRecordingDate') {
          return {
            startDateKey: 'customerFirstRecordingStartDate',
            endDateKey: 'customerFirstRecordingEndDate',
            dateField: 'firstRecordingAt'
          }
        }
        if (menuKey === 'customerLatestRecordingDate') {
          return {
            startDateKey: 'customerLatestRecordingStartDate',
            endDateKey: 'customerLatestRecordingEndDate',
            dateField: 'latestRecordingAt'
          }
        }
        return {
          startDateKey: 'customerLeadIssuedStartDate',
          endDateKey: 'customerLeadIssuedEndDate',
          dateField: 'firstLeadIssuedAt'
        }
      }

      function renderLeadsOptionMenu(filterKey, options, selectedValue, extraClass = '') {
        return `
          <div class="session-menu-panel ${extraClass}" data-leads-menu-panel="${escapeHtml(filterKey)}">
            <div class="session-menu-option-list">
              ${getLeadMenuOptions(options, selectedValue, filterKey)}
            </div>
          </div>
        `
      }

      function renderLeadsCarSeriesMenu(selectedValue) {
        const groups = Object.entries(getLeadAvailableCarSeriesGroups(leadsFilterState.brand))
          .map(([label, options]) => {
            const brand = sessionCarSeriesGroupBrands[label]
            const groupOptions = [...options, { label: '未知', value: getSessionUnknownCarSeriesValue(brand) }]
            return `
              <section class="session-menu-group">
                <div class="session-menu-group-label">${escapeHtml(label)}</div>
                <div class="session-menu-option-list">
                  ${getLeadMenuOptions(groupOptions, selectedValue, 'carSeries')}
                </div>
              </section>
            `
          })
          .join('')

        return `
          <div class="session-menu-panel session-menu-panel-groups" data-leads-menu-panel="carSeries">
            <div class="session-menu-group">
              <div class="session-menu-option-list">
                ${getLeadMenuOptions(['全部'], selectedValue, 'carSeries')}
              </div>
            </div>
            ${groups}
          </div>
        `
      }

      function renderLeadsOrganizationMenu() {
        const draftPath = leadsMenuState.organizationDraftPath || leadsFilterState.organization
        const columns = getSessionOrganizationColumns(draftPath)

        return `
          <div class="session-menu-panel session-menu-panel-cascader" data-leads-menu-panel="organization">
            <div class="session-cascader-top">
              <button
                type="button"
                class="session-menu-option session-menu-option-clear${draftPath === '全部组织' ? ' active' : ''}"
                data-leads-org-clear="true"
              >
                <span>全部组织</span>
              </button>
              <div class="session-cascader-current">
                <span>当前层级</span>
                <strong>${escapeHtml(getLeadDisplayText('organization', draftPath))}</strong>
              </div>
            </div>
            <div class="session-cascader-columns">
              ${columns
                .map((nodes) => {
                  return `
                    <div class="session-cascader-column">
                      ${nodes
                        .map((node) => {
                          const active = draftPath === node.path || draftPath.startsWith(`${node.path} > `) ? ' active' : ''
                          return `
                            <button
                              type="button"
                              class="session-cascader-option${active}"
                              data-leads-org-path="${escapeHtml(node.path)}"
                              data-leads-org-has-children="${node.children && node.children.length ? 'true' : 'false'}"
                            >
                              <span>${escapeHtml(node.label)}</span>
                              ${node.children && node.children.length ? '<i class="session-cascader-arrow" aria-hidden="true"></i>' : ''}
                            </button>
                          `
                        })
                        .join('')}
                    </div>
                  `
                })
                .join('')}
            </div>
            <div class="session-cascader-footer">
              <span>筛选将覆盖当前层级及其下属门店</span>
              <button type="button" class="btn-primary" data-leads-org-apply="${escapeHtml(draftPath)}">应用组织</button>
            </div>
          </div>
        `
      }

      function renderLeadsDateMenu() {
        const activeField = leadsMenuState.activeDateField
        const startDate = leadsMenuState.dateDraftStartDate
        const endDate = leadsMenuState.dateDraftEndDate
        const todayValue = formatSessionDateValue(new Date())
        const cells = getSessionDateCells(leadsMenuState.dateViewYear, leadsMenuState.dateViewMonth)

        return `
          <div class="session-menu-panel session-menu-panel-date" data-leads-menu-panel="date">
            <div class="session-date-panel-head">
              <div class="session-date-panel-copy">
                <span>日期范围</span>
                <strong>${escapeHtml(getSessionDateRangeText(startDate, endDate))}</strong>
              </div>
              <div class="session-date-nav">
                <button type="button" class="session-date-nav-btn" data-leads-date-nav="-1" aria-label="上一个月">
                  <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
                </button>
                <strong>${escapeHtml(formatSessionMonthLabel(leadsMenuState.dateViewYear, leadsMenuState.dateViewMonth))}</strong>
                <button type="button" class="session-date-nav-btn" data-leads-date-nav="1" aria-label="下一个月">
                  <i class="session-date-nav-arrow next" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="session-date-tabs">
              <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" data-leads-date-field="startDate">
                <span>开始日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(startDate))}</strong>
              </button>
              <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" data-leads-date-field="endDate">
                <span>结束日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(endDate))}</strong>
              </button>
            </div>
            <div class="session-date-weekdays">
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
            <div class="session-date-grid">
              ${cells
                .map((date) => {
                  if (!date) {
                    return '<span class="session-date-empty" aria-hidden="true"></span>'
                  }
                  const value = formatSessionDateValue(date)
                  const inRange = startDate && endDate && value >= startDate && value <= endDate
                  const isStart = value === startDate
                  const isEnd = value === endDate
                  const isToday = value === todayValue
                  return `
                    <button
                      type="button"
                      class="session-date-day${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}${isToday ? ' is-today' : ''}"
                      data-leads-date-value="${escapeHtml(value)}"
                    >
                      ${date.getDate()}
                    </button>
                  `
                })
                .join('')}
            </div>
            <div class="session-date-shortcuts">
              <button type="button" class="session-date-shortcut" data-leads-date-shortcut="today">今天</button>
              <button type="button" class="session-date-shortcut" data-leads-date-shortcut="last3">近3天</button>
              <button type="button" class="session-date-shortcut" data-leads-date-shortcut="last7">近7天</button>
            </div>
            <div class="session-cascader-footer session-date-footer">
              <span>${escapeHtml(`已选择 ${getSessionDateRangeText(startDate, endDate)}`)}</span>
              <div class="session-date-actions">
                <button type="button" class="btn session-date-action-btn" data-leads-date-cancel="true">取消</button>
                <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-leads-date-apply="true">应用日期</button>
              </div>
            </div>
          </div>
        `
      }

      function renderLeadsCustomerDateMenu(menuKey, label) {
        const activeField = leadsMenuState.customerDateActiveField
        const startDate = leadsMenuState.customerDateDraftStartDate
        const endDate = leadsMenuState.customerDateDraftEndDate
        const todayValue = formatSessionDateValue(new Date())
        const cells = getSessionDateCells(leadsMenuState.customerDateViewYear, leadsMenuState.customerDateViewMonth)

        return `
          <div class="session-menu-panel session-menu-panel-date" data-leads-menu-panel="${escapeHtml(menuKey)}">
            <div class="session-date-panel-head">
              <div class="session-date-panel-copy">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(getLeadCustomerDateRangeText(startDate, endDate))}</strong>
              </div>
              <div class="session-date-nav">
                <button type="button" class="session-date-nav-btn" data-leads-customer-date-nav="-1" aria-label="上一个月">
                  <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
                </button>
                <strong>${escapeHtml(formatSessionMonthLabel(leadsMenuState.customerDateViewYear, leadsMenuState.customerDateViewMonth))}</strong>
                <button type="button" class="session-date-nav-btn" data-leads-customer-date-nav="1" aria-label="下一个月">
                  <i class="session-date-nav-arrow next" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="session-date-tabs">
              <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" data-leads-customer-date-field="startDate">
                <span>开始日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(startDate))}</strong>
              </button>
              <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" data-leads-customer-date-field="endDate">
                <span>结束日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(endDate))}</strong>
              </button>
            </div>
            <div class="session-date-weekdays">
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
            <div class="session-date-grid">
              ${cells
                .map((date) => {
                  if (!date) {
                    return '<span class="session-date-empty" aria-hidden="true"></span>'
                  }
                  const value = formatSessionDateValue(date)
                  const inRange = startDate && endDate && value >= startDate && value <= endDate
                  const isStart = value === startDate
                  const isEnd = value === endDate
                  const isToday = value === todayValue
                  return `
                    <button
                      type="button"
                      class="session-date-day${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}${isToday ? ' is-today' : ''}"
                      data-leads-customer-date-value="${escapeHtml(value)}"
                    >
                      ${date.getDate()}
                    </button>
                  `
                })
                .join('')}
            </div>
            <div class="session-date-shortcuts">
              <button type="button" class="session-date-shortcut" data-leads-customer-date-shortcut="yesterday">昨日</button>
              <button type="button" class="session-date-shortcut" data-leads-customer-date-shortcut="last7">近7天</button>
              <button type="button" class="session-date-shortcut" data-leads-customer-date-shortcut="last15">近半月</button>
              <button type="button" class="session-date-shortcut" data-leads-customer-date-shortcut="last30">近1月</button>
              <button type="button" class="session-date-shortcut" data-leads-customer-date-shortcut="custom">自定义</button>
            </div>
            <div class="session-cascader-footer session-date-footer">
              <span>${escapeHtml(`已选择 ${getLeadCustomerDateRangeText(startDate, endDate)}`)}</span>
              <div class="session-date-actions">
                <button type="button" class="btn session-date-action-btn" data-leads-customer-date-cancel="true">取消</button>
                <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-leads-customer-date-apply="${escapeHtml(menuKey)}">应用日期</button>
              </div>
            </div>
          </div>
        `
      }

      function getFilteredLeadRecords() {
        const advisorNameQuery = normalizeLeadQueryValue(leadsFilterState.advisorNameQuery)
        const customerNameQuery = normalizeLeadQueryValue(leadsFilterState.customerNameQuery)
        const customerPhoneQuery = normalizeLeadQueryValue(leadsFilterState.customerPhoneQuery)

        return leadRecords.filter((item) => {
          const recordDate = item.recordStartTime.slice(0, 10)
          const brandMatch = leadsFilterState.brand === '全部' || getSessionBrand(item.carSeries) === leadsFilterState.brand
          const organizationMatch = leadsFilterState.organization === '全部组织' || item.organizationPath.startsWith(leadsFilterState.organization)
          const advisorNameMatch = !advisorNameQuery || normalizeLeadQueryValue(item.advisorName).includes(advisorNameQuery)
          const customerNameMatch = !customerNameQuery || normalizeLeadQueryValue(item.customerName).includes(customerNameQuery)
          const customerPhoneMatch = !customerPhoneQuery || normalizeLeadQueryValue(item.customerPhone).includes(customerPhoneQuery)
          const intentGradeMatch = leadsFilterState.intentGrade === '全部' || item.intentGrade === leadsFilterState.intentGrade
          const leadStatusMatch = leadsFilterState.leadStatus === '全部' || item.leadStatus === leadsFilterState.leadStatus
          const sourceTypeMatch = leadsFilterState.sourceType === '全部' || item.sourceType === leadsFilterState.sourceType
          const startMatch = !leadsFilterState.startDate || recordDate >= leadsFilterState.startDate
          const endMatch = !leadsFilterState.endDate || recordDate <= leadsFilterState.endDate
          return brandMatch && organizationMatch && advisorNameMatch && customerNameMatch && customerPhoneMatch && intentGradeMatch && leadStatusMatch && sourceTypeMatch && startMatch && endMatch
        })
      }

      function normalizeLeadQueryValue(value) {
        return String(value || '').trim().toLowerCase().replace(/\s+/g, '')
      }

      function normalizeLeadCustomerQueryValue(value) {
        return String(value || '').trim().toLowerCase().replace(/\s+/g, '')
      }

      function getLeadCustomerSearchTargetLabel(value) {
        return leadCustomerSearchTargetOptions.find((option) => option.value === value)?.label || '客户名称'
      }

      function getLeadCustomerSearchPlaceholder(value) {
        const label = getLeadCustomerSearchTargetLabel(value)
        return `请输入${label}`
      }

      function getLeadCustomerSearchMatch(item, target, query) {
        const normalizedQuery = normalizeLeadCustomerQueryValue(query)
        if (!normalizedQuery) {
          return true
        }

        if (target === 'aggregateLeadCount' || target === 'aggregateStoreCount') {
          return String(item?.[target] ?? '') === normalizedQuery
        }

        const normalizedValue = normalizeLeadCustomerQueryValue(item?.[target] ?? '')
        return normalizedValue.includes(normalizedQuery)
      }

      function shiftLeadCustomerReferenceDate(date, offsetDays) {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + offsetDays)
        return nextDate
      }

      function getLeadCustomerDateAnchorDate(dateField = 'firstLeadIssuedAt') {
        const aggregatedRecords = buildLeadCustomerAggregateRecords(leadRecords)
        let latestDate = null

        aggregatedRecords.forEach((item) => {
          const candidate = parseSessionDateValue(String(item?.[dateField] || '').slice(0, 10))
          if (candidate && (!latestDate || candidate.getTime() > latestDate.getTime())) {
            latestDate = candidate
          }
        })

        return latestDate || new Date()
      }

      function getLeadCustomerRangeValues(rangeMode, anchorDateValue = '') {
        const anchorDate = parseSessionDateValue(anchorDateValue) || getLeadCustomerDateAnchorDate()
        let startDate = anchorDate
        let endDate = anchorDate

        if (rangeMode === 'yesterday') {
          startDate = shiftLeadCustomerReferenceDate(anchorDate, -1)
          endDate = startDate
        } else if (rangeMode === 'last7') {
          startDate = shiftLeadCustomerReferenceDate(anchorDate, -6)
        } else if (rangeMode === 'last15') {
          startDate = shiftLeadCustomerReferenceDate(anchorDate, -14)
        } else if (rangeMode === 'last30') {
          startDate = shiftLeadCustomerReferenceDate(anchorDate, -29)
        }

        return {
          startDate: formatSessionDateValue(startDate),
          endDate: formatSessionDateValue(endDate)
        }
      }

      function getLeadCustomerDateRangeText(startDate, endDate) {
        if (!startDate && !endDate) {
          return '不限'
        }
        if (!startDate || !endDate) {
          return formatSessionDateDisplay(startDate || endDate)
        }
        return getSessionDateRangeText(startDate, endDate)
      }

      function matchesLeadCustomerCountRange(count, rangeValue) {
        const safeCount = Math.max(0, Number(count) || 0)
        const range = rangeValue || '全部'
        return range === '全部'
          || (range === '1条' && safeCount === 1)
          || (range === '1家' && safeCount === 1)
          || (range === '2条' && safeCount === 2)
          || (range === '2家' && safeCount === 2)
          || (range === '3条' && safeCount === 3)
          || (range === '3家' && safeCount === 3)
          || (range === '4条及以上' && safeCount >= 4)
          || (range === '4家及以上' && safeCount >= 4)
      }

      function getFilteredLeadCustomerRecords() {
        return buildLeadCustomerAggregateRecords(leadRecords).filter((item) => {
          const leadIssuedDate = String(item.firstLeadIssuedAt || '').slice(0, 10)
          const firstRecordingDate = String(item.firstRecordingAt || '').slice(0, 10)
          const latestRecordingDate = String(item.latestRecordingAt || '').slice(0, 10)
          const brandMatch = leadsFilterState.brand === '全部'
            || item.aggregateBrandSet?.has(leadsFilterState.brand)
          const organizationMatch = leadsFilterState.organization === '全部组织'
            || Array.from(item.aggregateOrganizationPathSet || []).some((path) => path.startsWith(leadsFilterState.organization))
          const customerStatusMatch = leadsFilterState.customerStatus === '全部' || item.leadStatus === leadsFilterState.customerStatus
          const leadCoverageMatch = !leadsFilterState.customerRecordCoverage || leadsFilterState.customerRecordCoverage === '全部' || item.recordCoverage === leadsFilterState.customerRecordCoverage
          const storeCoverageMatch = !leadsFilterState.customerStoreRecordCoverage || leadsFilterState.customerStoreRecordCoverage === '全部' || item.storeRecordCoverage === leadsFilterState.customerStoreRecordCoverage
          const crossStoreMatch = !leadsFilterState.customerCrossStore || leadsFilterState.customerCrossStore === '全部' || (leadsFilterState.customerCrossStore === '是' ? item.crossStore : !item.crossStore)
          const multiLeadMatch = !leadsFilterState.customerMultiLead || leadsFilterState.customerMultiLead === '全部' || (leadsFilterState.customerMultiLead === '是' ? item.aggregateLeadCount >= 2 : item.aggregateLeadCount === 1)
          const leadCountMatch = matchesLeadCustomerCountRange(item.aggregateLeadCount, leadsFilterState.customerLeadCountRange)
          const storeCountMatch = matchesLeadCustomerCountRange(item.aggregateStoreCount, leadsFilterState.customerStoreCountRange)
          const audioCount = Math.max(0, Number(item.aggregateAudioCount) || 0)
          const audioCountRange = leadsFilterState.customerAudioCountRange || '全部'
          const audioCountMatch = audioCountRange === '全部'
            || (audioCountRange === '1条' && audioCount === 1)
            || (audioCountRange === '2条' && audioCount === 2)
            || (audioCountRange === '3条' && audioCount === 3)
            || (audioCountRange === '4条及以上' && audioCount >= 4)

          const leadIssuedStartMatch = !leadsFilterState.customerLeadIssuedStartDate || leadIssuedDate >= leadsFilterState.customerLeadIssuedStartDate
          const leadIssuedEndMatch = !leadsFilterState.customerLeadIssuedEndDate || leadIssuedDate <= leadsFilterState.customerLeadIssuedEndDate
          const firstRecordingStartMatch = !leadsFilterState.customerFirstRecordingStartDate || firstRecordingDate >= leadsFilterState.customerFirstRecordingStartDate
          const firstRecordingEndMatch = !leadsFilterState.customerFirstRecordingEndDate || firstRecordingDate <= leadsFilterState.customerFirstRecordingEndDate
          const hasLatestRecordingDateFilter = Boolean(leadsFilterState.customerLatestRecordingStartDate || leadsFilterState.customerLatestRecordingEndDate)
          const latestRecordingMatch = !hasLatestRecordingDateFilter || Boolean(latestRecordingDate)
            && (!leadsFilterState.customerLatestRecordingStartDate || latestRecordingDate >= leadsFilterState.customerLatestRecordingStartDate)
            && (!leadsFilterState.customerLatestRecordingEndDate || latestRecordingDate <= leadsFilterState.customerLatestRecordingEndDate)

          return brandMatch && organizationMatch && customerStatusMatch && leadCoverageMatch && storeCoverageMatch && crossStoreMatch && multiLeadMatch && leadCountMatch && storeCountMatch && audioCountMatch && leadIssuedStartMatch && leadIssuedEndMatch && firstRecordingStartMatch && firstRecordingEndMatch && latestRecordingMatch
        })
      }

      function getCustomerViewMatchedLeadSourceRecords() {
        const matchedCustomerKeys = new Set(
          getFilteredLeadCustomerRecords().map((item) => getLeadNaturalCustomerKey(item))
        )

        return leadRecords.filter((item) => matchedCustomerKeys.has(getLeadNaturalCustomerKey(item)))
      }

      function getLeadStageClass(stage) {
        if (stage === '邀约') return 'blue'
        if (stage === '到店接待') return 'amber'
        return 'green'
      }

      function getLeadStatusClass(status) {
        if (status === '已下定' || status === '有效') return 'green'
        if (status === '跟进中') return 'amber'
        if (status === '战败') return 'red'
        if (status === '未跟进') return 'gray'
        return 'blue'
      }

      function getLeadIntentGradeClass(intentGrade) {
        if (intentGrade === 'H') return 'red'
        if (intentGrade === 'A') return 'amber'
        if (intentGrade === 'B') return 'green'
        return 'blue'
      }

      function getLeadStatusPriority(status) {
        if (status === '已下定') return 6
        if (status === '有效') return 5
        if (status === '跟进中') return 4
        if (status === '未跟进') return 3
        if (status === '异地') return 2
        if (status === '战败') return 1
        return 0
      }

      function getAiLeadValidityClass(value) {
        if (value === '有效') return 'is-valid'
        if (value === '无效') return 'is-invalid'
        return 'is-undetermined'
      }

      function renderAiLeadValidityHeader() {
        return `
          <span class="ai-lead-validity-heading">
            <span>AI线索有效性</span>
            <button type="button" class="ai-lead-validity-help" aria-label="查看AI线索有效性判别标准">?</button>
            <span class="ai-lead-validity-tooltip" role="tooltip">
              <strong>判别标准</strong>
              <span><b>有效：</b>线索下发后3天内，前3次外呼中，至少有1次通话时长不少于15秒，且客户未明确拒绝。</span>
              <span><b>无效：</b>线索下发后3天内未外呼，或前3次外呼中没有任何一次同时满足“通话时长不少于15秒且客户未明确拒绝”。</span>
              <span><b>暂未分析：</b>尚未对录音完成分析。</span>
            </span>
          </span>
        `
      }

      function syncLeadsViewTabs() {
        pageHost.querySelectorAll('[data-leads-view]').forEach((node) => {
          node.classList.toggle('active', node.dataset.leadsView === leadsViewState.mode)
        })
      }

      function renderCustomerRecordCoverageHeader(dimension = 'lead') {
        const isStoreDimension = dimension === 'store'
        const title = isStoreDimension ? '门店录音覆盖' : '线索录音覆盖'
        const unit = isStoreDimension ? '门店' : '线索'
        return `
          <span class="ai-lead-validity-heading">
            <span>${title}</span>
            <button type="button" class="ai-lead-validity-help" aria-label="查看${title}判别标准">?</button>
            <span class="ai-lead-validity-tooltip" role="tooltip">
              <strong>判别标准</strong>
              <span><b>全部有录音：</b>该客户关联的每个${unit}都存在至少1通可分析录音。</span>
              <span><b>部分有录音：</b>该客户至少1个${unit}有可分析录音，但并非全部都有。</span>
              <span><b>全部无录音：</b>该客户关联的所有${unit}均无可分析录音。</span>
            </span>
          </span>
        `
      }

      function getLeadsTableHeaderMarkup(viewMode = leadsViewState.mode) {
        if (viewMode === 'customers') {
          return `
            <tr>
              <th style="min-width: 110px; width: 110px;">客户姓名</th>
              <th style="min-width: 130px; width: 130px;">客户手机号</th>
              <th style="min-width: 110px; width: 110px;">是否跨门店</th>
              <th style="min-width: 110px; width: 110px;">关联门店数</th>
              <th style="min-width: 110px; width: 110px;">是否多线索</th>
              <th style="min-width: 110px; width: 110px;">关联线索数</th>
              <th style="min-width: 110px; width: 110px;">关联录音数</th>
              <th style="min-width: 170px; width: 170px;">${renderCustomerRecordCoverageHeader('lead')}</th>
              <th style="min-width: 170px; width: 170px;">${renderCustomerRecordCoverageHeader('store')}</th>
              <th style="min-width: 130px; width: 130px;">最新线索状态</th>
              <th style="min-width: 170px; width: 170px;">线索首次下发时间</th>
              <th style="min-width: 170px; width: 170px;">首次录音时间</th>
              <th style="min-width: 170px; width: 170px;">最近录音时间</th>
              <th style="min-width: 360px; width: 360px;">关联概况</th>
              <th style="min-width: 100px; width: 100px;">操作</th>
            </tr>
          `
        }

        return `
          <tr>
            <th>线索ID</th>
            <th>大区</th>
            <th>战区</th>
            <th>门店</th>
            <th>顾问姓名</th>
            <th>客户名称</th>
            <th>客户手机</th>
            <th>意向级别</th>
            <th>线索状态</th>
            <th>${renderAiLeadValidityHeader()}</th>
            <th>最近一次联系时间</th>
            <th>线索来源</th>
            <th>二级来源</th>
            <th>三级来源</th>
            <th>四级来源</th>
            <th>操作</th>
          </tr>
        `
      }

      function getCustomerRecordCoverage(leadCount, hasRecordCount) {
        if (hasRecordCount === 0) return '全部无录音'
        if (hasRecordCount >= leadCount) return '全部有录音'
        return '部分有录音'
      }

      function formatCustomerRecordCoverage(coverage, recordedCount, totalCount) {
        return `${coverage}（${recordedCount}/${totalCount}）`
      }

      function getCustomerAssociationSummary(item) {
        const storeCount = item.aggregateStoreCount || 1
        const leadCount = item.aggregateLeadCount || 1
        const recordStoreCount = item.aggregateRecordStoreSet ? item.aggregateRecordStoreSet.size : (item.aggregateHasRecordCount > 0 ? Math.min(storeCount, item.aggregateHasRecordCount) : 0)
        const audioCount = item.aggregateAudioCount !== undefined ? item.aggregateAudioCount : (item.aggregateHasRecordCount || 0)
        return `关联${leadCount}条线索，${storeCount}家门店，${audioCount}条录音，其中${recordStoreCount}家门店有录音`
      }

      function getLeadNaturalCustomerKey(item = {}) {
        const customerPhone = String(item.customerPhone || '').trim()
        const customerName = String(item.customerName || '').trim()
        return customerPhone && customerName
          ? `${customerPhone}::${customerName}`
          : `lead::${String(item.id || '')}`
      }

      function getLeadDealerCode(item = {}) {
        return String(item.dealerCode || item.dealer_code || item.store || '').trim()
      }

      function getLeadStatusUpdatedTime(item = {}) {
        return Number(parseDateTimeValue(item.updatedAt || item.updated_at || item.lastContact || item.recordStartTime || '1970-01-01 00:00'))
      }

      function buildLeadCustomerAggregateRecords(records) {
        const customerMap = new Map()
        const sortedRecords = [...records].sort((left, right) => parseDateTimeValue(right.recordStartTime) - parseDateTimeValue(left.recordStartTime))

        sortedRecords.forEach((item) => {
          const key = getLeadNaturalCustomerKey(item)
          const recordTime = parseDateTimeValue(item.recordStartTime)
          const contactTime = parseDateTimeValue(item.lastContact || item.recordStartTime) || recordTime
          const itemAudioCount = Number.isFinite(Number(item.recordingCount))
            ? Math.max(0, Number(item.recordingCount))
            : item.validRecording === '是' ? 1 : 0
          const hasRecord = itemAudioCount > 0
          const dealerCode = getLeadDealerCode(item)
          const itemBrand = getSessionBrand(item.carSeries)
          const statusUpdatedTime = getLeadStatusUpdatedTime(item)
          const leadIssuedTime = parseDateTimeValue(item.leadIssuedAt || item.recordStartTime)
          const firstRecordingTime = hasRecord ? recordTime : 0
          const latestRecordingTime = hasRecord ? recordTime : 0

          if (!customerMap.has(key)) {
            const recordStoreSet = new Set()
            if (hasRecord) recordStoreSet.add(dealerCode)
            const storeAudioCounts = new Map([[item.store, itemAudioCount]])
            const storeDetailsMap = new Map([[dealerCode, {
              dealerCode,
              name: item.store,
              audioCount: itemAudioCount,
              status: item.leadStatus,
              updatedAt: item.lastContact || item.recordStartTime,
              latestContactTime: contactTime,
              statusUpdatedTime
            }]])

            customerMap.set(key, {
              ...item,
              aggregateLeadCount: 1,
              aggregateLeadRecords: [item],
              aggregateStoreSet: new Set([dealerCode]),
              aggregateStoreCount: 1,
              aggregateRecordStoreSet: recordStoreSet,
              aggregateStoreAudioCounts: storeAudioCounts,
              aggregateStoreDetailsMap: storeDetailsMap,
              aggregateBrandSet: new Set([itemBrand]),
              aggregateOrganizationPathSet: new Set([item.organizationPath]),
              aggregateAudioCount: itemAudioCount,
              aggregateLatestTime: recordTime,
              aggregateLatestContactTime: contactTime,
              aggregateLatestStatusUpdatedTime: statusUpdatedTime,
              aggregateEarliestLeadIssuedTime: leadIssuedTime,
              firstLeadIssuedAt: item.leadIssuedAt || item.recordStartTime,
              aggregateEarliestRecordingTime: firstRecordingTime,
              firstRecordingAt: hasRecord ? item.recordStartTime : '',
              aggregateLatestRecordingTime: latestRecordingTime,
              latestRecordingAt: hasRecord ? item.recordStartTime : '',
              aggregateEarliestTime: recordTime,
              aggregateHasRecordCount: hasRecord ? 1 : 0
            })
            return
          }

          const aggregated = customerMap.get(key)
          aggregated.aggregateLeadCount += 1
          aggregated.aggregateLeadRecords.push(item)
          aggregated.aggregateStoreSet.add(dealerCode)
          aggregated.aggregateStoreCount = aggregated.aggregateStoreSet.size
          aggregated.aggregateBrandSet.add(itemBrand)
          aggregated.aggregateOrganizationPathSet.add(item.organizationPath)
          aggregated.aggregateStoreAudioCounts.set(
            item.store,
            (aggregated.aggregateStoreAudioCounts.get(item.store) || 0) + itemAudioCount
          )
          if (hasRecord) {
            aggregated.aggregateHasRecordCount = (aggregated.aggregateHasRecordCount || 0) + 1
            aggregated.aggregateRecordStoreSet.add(dealerCode)
            aggregated.aggregateAudioCount = (aggregated.aggregateAudioCount || 0) + itemAudioCount
          }

          const storeDetail = aggregated.aggregateStoreDetailsMap.get(dealerCode)
          if (storeDetail) {
            storeDetail.audioCount += itemAudioCount
            if (contactTime > storeDetail.latestContactTime || (Number(contactTime) === Number(storeDetail.latestContactTime) && statusUpdatedTime > storeDetail.statusUpdatedTime)) {
              storeDetail.status = item.leadStatus
              storeDetail.updatedAt = item.lastContact || item.recordStartTime
              storeDetail.latestContactTime = contactTime
              storeDetail.statusUpdatedTime = statusUpdatedTime
            }
          } else {
            aggregated.aggregateStoreDetailsMap.set(dealerCode, {
              dealerCode,
              name: item.store,
              audioCount: itemAudioCount,
              status: item.leadStatus,
              updatedAt: item.lastContact || item.recordStartTime,
              latestContactTime: contactTime,
              statusUpdatedTime
            })
          }

          if (recordTime > aggregated.aggregateLatestTime) {
            aggregated.customerName = item.customerName || aggregated.customerName
            aggregated.recordStartTime = item.recordStartTime
            aggregated.aggregateLatestTime = recordTime
          }

          if (contactTime > aggregated.aggregateLatestContactTime || (Number(contactTime) === Number(aggregated.aggregateLatestContactTime) && statusUpdatedTime > aggregated.aggregateLatestStatusUpdatedTime)) {
            aggregated.lastContact = item.lastContact
            aggregated.leadStatus = item.leadStatus
            aggregated.store = item.store
            aggregated.organizationPath = item.organizationPath
            aggregated.carSeries = item.carSeries
            aggregated.aggregateLatestContactTime = contactTime
            aggregated.aggregateLatestStatusUpdatedTime = statusUpdatedTime
          }

          if (leadIssuedTime < aggregated.aggregateEarliestLeadIssuedTime) {
            aggregated.aggregateEarliestLeadIssuedTime = leadIssuedTime
            aggregated.firstLeadIssuedAt = item.leadIssuedAt || item.recordStartTime
          }

          if (firstRecordingTime > 0 && (!aggregated.aggregateEarliestRecordingTime || firstRecordingTime < aggregated.aggregateEarliestRecordingTime)) {
            aggregated.aggregateEarliestRecordingTime = firstRecordingTime
            aggregated.firstRecordingAt = item.recordStartTime
          }

          if (latestRecordingTime > aggregated.aggregateLatestRecordingTime) {
            aggregated.aggregateLatestRecordingTime = latestRecordingTime
            aggregated.latestRecordingAt = item.recordStartTime
          }

          if (recordTime < aggregated.aggregateEarliestTime) {
            aggregated.aggregateEarliestTime = recordTime
            aggregated.firstContact = item.recordStartTime
          }

        })

        return Array.from(customerMap.values()).map((item) => {
          const base = item
          const hasRecordCount = base.aggregateHasRecordCount || 0
          const recordCoverage = getCustomerRecordCoverage(base.aggregateLeadCount, hasRecordCount)
          const recordedStoreCount = base.aggregateRecordStoreSet ? base.aggregateRecordStoreSet.size : 0
          const storeRecordCoverage = getCustomerRecordCoverage(base.aggregateStoreCount, recordedStoreCount)
          const crossStore = base.aggregateStoreCount >= 2
          const aggregateStoreDetails = Array.from(base.aggregateStoreDetailsMap.values()).map((detail, index) => ({
            ...detail,
            tone: index === 0 ? 'current' : index === 1 ? 'other' : index === 2 ? 'extra' : ''
          }))
          const associationSummary = getCustomerAssociationSummary(base)
          return { ...base, aggregateStoreDetails, recordCoverage, storeRecordCoverage, crossStore, associationSummary }
        }).sort((left, right) => {
          const multiNodePriority = Number(Boolean(right.isMultiNodeCustomerDemo)) - Number(Boolean(left.isMultiNodeCustomerDemo))
          const multiStorePriority = Number(Boolean(right.isMultiStoreCustomerDemo)) - Number(Boolean(left.isMultiStoreCustomerDemo))
          return multiNodePriority || multiStorePriority || (right.aggregateEarliestLeadIssuedTime || 0) - (left.aggregateEarliestLeadIssuedTime || 0)
        })
      }

      function getDisplayedLeadRecords(records = getFilteredLeadRecords()) {
        return leadsViewState.mode === 'customers' ? getFilteredLeadCustomerRecords() : records
      }

      function renderLeadsCollapseActionButton() {
        const collapsed = leadsFilterState.collapsed
        return `
          <button
            type="button"
            class="session-toggle-text-btn"
            data-leads-action="toggle-collapse"
            aria-expanded="${collapsed ? 'false' : 'true'}"
          >
            <span>${collapsed ? '展开' : '收起'}</span>
            <svg class="session-toggle-text-btn-icon${collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        `
      }

      function renderLeadsFilters() {
        const container = document.getElementById('leadsFilterControls')
        if (!container) return

        container.className = `session-filter-toolbar leads-filter-toolbar ${leadsViewState.mode === 'customers' ? 'is-customer-view' : 'is-leads-view'}${leadsFilterState.collapsed ? ' is-collapsed' : ''}`

        if (leadsViewState.mode === 'customers') {
          const cvCoverageOpts = ['全部', '全部有录音', '部分有录音', '全部无录音']
          const cvCrossStoreOpts = ['全部', '是', '否']
          const cvMultiLeadOpts = ['全部', '是', '否']
          const cvLeadCountOpts = leadsFilterState.customerMultiLead === '是'
            ? ['全部', '2条', '3条', '4条及以上']
            : ['全部', '1条', '2条', '3条', '4条及以上']
          const cvStoreCountOpts = leadsFilterState.customerCrossStore === '是'
            ? ['全部', '2家', '3家', '4家及以上']
            : ['全部', '1家', '2家', '3家', '4家及以上']
          const cvAudioCountOpts = ['全部', '1条', '2条', '3条', '4条及以上']

          container.innerHTML = `
            ${renderLeadsMenuControl('brand', '品牌', leadsFilterState.brand, renderLeadsOptionMenu('brand', sessionBrandOptions, leadsFilterState.brand))}
            ${renderLeadsMenuControl('organization', '组织', leadsFilterState.organization, renderLeadsOrganizationMenu(), 'session-toolbar-control-org')}
            ${renderLeadsMenuControl('customerCrossStore', '是否跨门店', leadsFilterState.customerCrossStore || '全部', renderLeadsOptionMenu('customerCrossStore', cvCrossStoreOpts, leadsFilterState.customerCrossStore || '全部'))}
            ${renderLeadsMenuControl('customerStoreCountRange', '关联门店数', leadsFilterState.customerStoreCountRange || '全部', renderLeadsOptionMenu('customerStoreCountRange', cvStoreCountOpts, leadsFilterState.customerStoreCountRange || '全部'))}
            ${renderLeadsMenuControl('customerMultiLead', '是否多线索', leadsFilterState.customerMultiLead || '全部', renderLeadsOptionMenu('customerMultiLead', cvMultiLeadOpts, leadsFilterState.customerMultiLead || '全部'), 'leads-filter-extra')}
            ${renderLeadsMenuControl('customerLeadCountRange', '关联线索数', leadsFilterState.customerLeadCountRange || '全部', renderLeadsOptionMenu('customerLeadCountRange', cvLeadCountOpts, leadsFilterState.customerLeadCountRange || '全部'), 'leads-filter-extra')}
            ${renderLeadsMenuControl('customerAudioCountRange', '关联录音数', leadsFilterState.customerAudioCountRange || '全部', renderLeadsOptionMenu('customerAudioCountRange', cvAudioCountOpts, leadsFilterState.customerAudioCountRange || '全部'), 'leads-filter-extra')}
            ${renderLeadsMenuControl('customerRecordCoverage', '线索录音覆盖', leadsFilterState.customerRecordCoverage || '全部', renderLeadsOptionMenu('customerRecordCoverage', cvCoverageOpts, leadsFilterState.customerRecordCoverage || '全部'), 'leads-filter-extra')}
            ${renderLeadsMenuControl('customerStoreRecordCoverage', '门店录音覆盖', leadsFilterState.customerStoreRecordCoverage || '全部', renderLeadsOptionMenu('customerStoreRecordCoverage', cvCoverageOpts, leadsFilterState.customerStoreRecordCoverage || '全部'), 'leads-filter-extra')}
            ${renderLeadsMenuControl('customerStatus', '最新线索状态', leadsFilterState.customerStatus, renderLeadsOptionMenu('customerStatus', leadCustomerStatusOptions, leadsFilterState.customerStatus), 'leads-filter-extra')}
            ${renderLeadsCustomerAggregateDateControl('customerLeadIssuedDate', '线索首次下发时间', 'customerLeadIssuedStartDate', 'customerLeadIssuedEndDate', 'leads-filter-extra')}
            ${renderLeadsCustomerAggregateDateControl('customerFirstRecordingDate', '首次录音时间', 'customerFirstRecordingStartDate', 'customerFirstRecordingEndDate', 'leads-filter-extra')}
            ${renderLeadsCustomerAggregateDateControl('customerLatestRecordingDate', '最近录音时间', 'customerLatestRecordingStartDate', 'customerLatestRecordingEndDate', 'leads-filter-extra')}
            <div class="leads-filter-inline-actions">
              <button type="button" class="btn session-reset-btn" data-leads-action="reset">重置筛选</button>
              ${renderLeadsCollapseActionButton()}
            </div>
          `
          return
        }

        const collapsed = leadsFilterState.collapsed

        container.innerHTML = `
          ${renderLeadsMenuControl('brand', '品牌', leadsFilterState.brand, renderLeadsOptionMenu('brand', sessionBrandOptions, leadsFilterState.brand))}
          ${renderLeadsMenuControl('organization', '组织', leadsFilterState.organization, renderLeadsOrganizationMenu(), 'session-toolbar-control-org')}
          ${renderLeadsMenuControl('leadStatus', '线索状态', leadsFilterState.leadStatus, renderLeadsOptionMenu('leadStatus', leadStatusOptions, leadsFilterState.leadStatus))}
          ${renderLeadsMenuControl('intentGrade', '意向级别', leadsFilterState.intentGrade, renderLeadsOptionMenu('intentGrade', leadIntentGradeOptions, leadsFilterState.intentGrade))}
          <div class="leads-filter-extra session-toolbar-control session-toolbar-menu" data-leads-menu-root="sourceType">
            <span>录音来源类型</span>
            <button type="button" class="session-select-trigger" data-leads-menu-trigger="sourceType" aria-label="录音来源类型" aria-haspopup="listbox" aria-expanded="false">
              <strong>${escapeHtml(leadsFilterState.sourceType)}</strong>
              <span class="session-select-caret" aria-hidden="true"></span>
            </button>
            ${leadsMenuState.openMenu === 'sourceType' ? renderLeadsOptionMenu('sourceType', leadSourceTypeOptions, leadsFilterState.sourceType) : ''}
          </div>
          <div class="leads-filter-extra session-toolbar-control session-toolbar-menu session-toolbar-control-date" data-leads-menu-root="date">
            <span>日期</span>
            <button type="button" class="session-date-trigger" data-leads-menu-trigger="date" aria-label="线索日期筛选" aria-haspopup="dialog" aria-expanded="false">
              <strong>${escapeHtml(formatSessionDateDisplay(leadsFilterState.startDate))}</strong>
              <em>至</em>
              <strong>${escapeHtml(formatSessionDateDisplay(leadsFilterState.endDate))}</strong>
              <span class="session-date-icon" aria-hidden="true"></span>
            </button>
            ${leadsMenuState.openMenu === 'date' ? renderLeadsDateMenu() : ''}
          </div>
          <div class="leads-filter-extra session-toolbar-control session-toolbar-control-search leads-simple-search" data-leads-search-key="advisorNameQuery">
            <span>顾问姓名</span>
            <div class="session-search-field">
              <input type="text" class="session-search-input" data-leads-simple-query="advisorNameQuery" value="${escapeHtml(leadsFilterState.advisorNameQuery || '')}" aria-label="请输入顾问姓名" placeholder="请输入顾问姓名" />
              <span class="session-search-icon" aria-hidden="true"></span>
            </div>
          </div>
          <div class="leads-filter-extra session-toolbar-control session-toolbar-control-search leads-simple-search" data-leads-search-key="customerNameQuery">
            <span>客户名称</span>
            <div class="session-search-field">
              <input type="text" class="session-search-input" data-leads-simple-query="customerNameQuery" value="${escapeHtml(leadsFilterState.customerNameQuery || '')}" aria-label="请输入客户名称" placeholder="请输入客户名称" />
              <span class="session-search-icon" aria-hidden="true"></span>
            </div>
          </div>
          <div class="leads-filter-extra session-toolbar-control session-toolbar-control-search leads-simple-search" data-leads-search-key="customerPhoneQuery">
            <span>客户手机</span>
            <div class="session-search-field">
              <input type="text" class="session-search-input" data-leads-simple-query="customerPhoneQuery" value="${escapeHtml(leadsFilterState.customerPhoneQuery || '')}" aria-label="请输入客户手机" placeholder="请输入客户手机" />
              <span class="session-search-icon" aria-hidden="true"></span>
            </div>
          </div>
          <div class="leads-filter-inline-actions">
            <button type="button" class="btn session-reset-btn" data-leads-action="reset">重置筛选</button>
            ${renderLeadsCollapseActionButton()}
          </div>
        `
      }

      function renderLeadsTable(records) {
        const viewMode = leadsViewState.mode
        const displayRecords = getDisplayedLeadRecords(records)
        const summaryRecords = viewMode === 'customers' ? getCustomerViewMatchedLeadSourceRecords() : records
        const tbody = document.getElementById('leadsTableBody')
        const thead = document.getElementById('leadsTableHeader')
        const table = document.getElementById('leadsDataTable')
        const tableWrap = table?.closest('.table-wrap')
        let totalCount = document.getElementById('leadsFilterCount')
        const pendingCount = document.getElementById('leadsPendingCount')
        const followingCount = document.getElementById('leadsFollowingCount')
        const orderedCount = document.getElementById('leadsOrderedCount')
        const lostCount = document.getElementById('leadsLostCount')
        const validCount = document.getElementById('leadsValidCount')
        const remoteCount = document.getElementById('leadsRemoteCount')
        const pagination = document.getElementById('leadsPagination')
        if (!tbody || !totalCount) return

        if (thead) {
          thead.innerHTML = getLeadsTableHeaderMarkup(viewMode)
        }
        table?.classList.toggle('customer-aggregate-table', viewMode === 'customers')
        tableWrap?.classList.toggle('customer-aggregate-wrap', viewMode === 'customers')

        // Update KPI section visibility
        const kpiSection = document.getElementById('leadsCustomerKpiSection')
        const titleEl = document.getElementById('leadsTableHeadTitle')
        const summaryLabelEl = document.getElementById('leadsFilterSummaryLabel')
        if (kpiSection) kpiSection.hidden = viewMode !== 'customers'
        if (titleEl) titleEl.textContent = viewMode === 'customers' ? '客户列表' : '线索总览'
        if (summaryLabelEl) summaryLabelEl.innerHTML = viewMode === 'customers'
          ? `当前匹配 <strong id="leadsFilterCount">${displayRecords.length.toLocaleString()}</strong> 位客户`
          : `当前匹配 <strong id="leadsFilterCount">0</strong> 条线索`
        totalCount = document.getElementById('leadsFilterCount')

        // Update KPI cards for customer view
        if (viewMode === 'customers') {
          const kpiTotal = document.getElementById('customerKpiTotal')
          const kpiCross = document.getElementById('customerKpiCrossStore')
          const kpiMulti = document.getElementById('customerKpiMultiLead')
          const kpiPartial = document.getElementById('customerKpiPartialRecord')
          if (kpiTotal) kpiTotal.textContent = displayRecords.length.toLocaleString()
          if (kpiCross) kpiCross.textContent = displayRecords.filter(r => r.crossStore).length.toLocaleString()
          if (kpiMulti) kpiMulti.textContent = displayRecords.filter(r => r.aggregateLeadCount >= 2).length.toLocaleString()
          if (kpiPartial) kpiPartial.textContent = displayRecords.filter(r => r.recordCoverage === '部分有录音').length.toLocaleString()
        }

        totalCount.textContent = summaryRecords.length
        if (pendingCount) pendingCount.textContent = summaryRecords.filter((item) => item.leadStatus === '未跟进').length
        if (followingCount) followingCount.textContent = summaryRecords.filter((item) => item.leadStatus === '跟进中').length
        if (orderedCount) orderedCount.textContent = summaryRecords.filter((item) => item.leadStatus === '已下定').length
        if (lostCount) lostCount.textContent = summaryRecords.filter((item) => item.leadStatus === '战败').length
        if (validCount) validCount.textContent = summaryRecords.filter((item) => item.leadStatus === '有效').length
        if (remoteCount) remoteCount.textContent = summaryRecords.filter((item) => item.leadStatus === '异地').length

        if (!displayRecords.length) {
          tbody.innerHTML = `<tr class="session-empty-row"><td colspan="${viewMode === 'customers' ? 15 : 16}">${viewMode === 'customers' ? '当前筛选条件下暂无客户，请调整筛选条件后重试。' : '当前筛选条件下暂无线索，请调整筛选条件后重试。'}</td></tr>`
          if (pagination) {
            pagination.innerHTML = ''
          }
          return
        }

        const totalPages = Math.max(1, Math.ceil(displayRecords.length / leadsPaginationState.pageSize))
        if (leadsPaginationState.page > totalPages) {
          leadsPaginationState.page = totalPages
        }
        const startIndex = (leadsPaginationState.page - 1) * leadsPaginationState.pageSize
        const pagedRecords = displayRecords.slice(startIndex, startIndex + leadsPaginationState.pageSize)

        if (viewMode === 'customers') {
          tbody.innerHTML = pagedRecords
            .map((item) => {
              const statusClass = getLeadStatusClass(item.leadStatus)
              const crossStoreText = item.crossStore ? '是' : '否'
              const multiLeadText = Number(item.aggregateLeadCount) >= 2 ? '是' : '否'
              const firstLeadIssuedDisplay = item.firstLeadIssuedAt || '–'
              const firstRecordingDisplay = item.firstRecordingAt || '–'
              const latestRecordingDisplay = item.latestRecordingAt || '–'
              const shouldOpenCustomerDetail = item.crossStore || Number(item.aggregateLeadCount) > 1
              const customerDetailDisabled = Number(item.aggregateAudioCount) <= 0
              const detailActionMarkup = customerDetailDisabled
                ? '<button class="table-link table-link-disabled" type="button" disabled aria-disabled="true">查看详情</button>'
                : `<button
                    class="table-link"
                    ${shouldOpenCustomerDetail
                ? `data-customer-detail-open="true"
                    data-customer-name="${escapeHtml(item.customerName)}"
                    data-customer-phone="${escapeHtml(item.customerPhone)}"
                    data-customer-status="${escapeHtml(item.leadStatus)}"
                    data-customer-store="${escapeHtml(item.store)}"
                    data-customer-last-contact="${escapeHtml(item.lastContact)}"
                    data-customer-lead-count="${escapeHtml(String(item.aggregateLeadCount))}"
                    data-customer-store-count="${escapeHtml(String(item.aggregateStoreCount))}"`
                : `data-route="leads-detail"
                    data-lead-id="${escapeHtml(item.id)}"
                    data-lead-source="leads"
                    data-lead-return-view="customers"`}
                  >
                    查看详情
                  </button>`
              return `
              <tr>
                <td><span class="cell-main cv-customer-name">${escapeHtml(maskDisplayName(item.customerName))}</span></td>
                <td><span class="cv-customer-phone">${escapeHtml(item.customerPhone)}</span></td>
                <td>${escapeHtml(crossStoreText)}</td>
                <td>${escapeHtml(String(item.aggregateStoreCount))}</td>
                <td>${escapeHtml(multiLeadText)}</td>
                <td>${escapeHtml(String(item.aggregateLeadCount))}</td>
                <td>${escapeHtml(`${Number(item.aggregateAudioCount) || 0}条`)}</td>
                <td>${escapeHtml(formatCustomerRecordCoverage(item.recordCoverage, item.aggregateHasRecordCount || 0, item.aggregateLeadCount || 0))}</td>
                <td>${escapeHtml(formatCustomerRecordCoverage(item.storeRecordCoverage, item.aggregateRecordStoreSet?.size || 0, item.aggregateStoreCount || 0))}</td>
                <td><span class="cv-status-pill cv-status-${escapeHtml(statusClass)}">${escapeHtml(item.leadStatus)}</span></td>
                <td class="cv-time-cell">${escapeHtml(firstLeadIssuedDisplay)}</td>
                <td class="cv-time-cell">${escapeHtml(firstRecordingDisplay)}</td>
                <td class="cv-time-cell">${escapeHtml(latestRecordingDisplay)}</td>
                <td class="cv-association-summary-cell">${escapeHtml(item.associationSummary || '–')}</td>
                <td>${detailActionMarkup}</td>
              </tr>
            `})
            .join('')
        } else {
          tbody.innerHTML = pagedRecords
            .map((item) => `
              <tr>
                <td><span class="cell-main">${escapeHtml(item.id)}</span></td>
                <td>${escapeHtml(item.region)}</td>
                <td>${escapeHtml(item.zone)}</td>
                <td>${escapeHtml(item.store)}</td>
                <td><button type="button" class="table-link lead-name-hover-text" data-leads-open-sales-advisor>${escapeHtml(item.advisorName)}</button></td>
                <td>${escapeHtml(maskDisplayName(item.customerName))}</td>
                <td>${escapeHtml(item.customerPhone)}</td>
                <td><span class="pill-inline intent-grade-pill ${getLeadIntentGradeClass(item.intentGrade)}">${escapeHtml(item.intentGrade)}</span></td>
                <td>
                  <span>${escapeHtml(item.leadStatus)}</span>
                </td>
                <td><span class="ai-lead-validity-pill ${getAiLeadValidityClass(item.aiLeadValidity)}">${escapeHtml(item.aiLeadValidity)}</span></td>
                <td>${escapeHtml(item.lastContact)}</td>
                <td>${escapeHtml(item.leadSource)}</td>
                <td>${escapeHtml(item.secondSource)}</td>
                <td>${escapeHtml(item.thirdSource)}</td>
                <td>${escapeHtml(item.fourthSource)}</td>
                <td><button class="table-link" data-route="leads-detail" data-lead-id="${escapeHtml(item.id)}" data-lead-source="leads" data-lead-return-view="leads">线索详情</button></td>
              </tr>
            `)
            .join('')
        }

        if (pagination) {
          renderLeadsPagination(displayRecords.length)
        }
        attachRouteLinks()
      }

      function getLeadsPaginationItems(totalPages) {
        const current = leadsPaginationState.page
        if (totalPages <= 7) {
          return Array.from({ length: totalPages }, (_, index) => index + 1)
        }

        const items = [1]
        if (current > 3) items.push('ellipsis-left')
        for (let page = Math.max(2, current - 1); page <= Math.min(totalPages - 1, current + 1); page += 1) {
          items.push(page)
        }
        if (current < totalPages - 2) items.push('ellipsis-right')
        items.push(totalPages)
        return items
      }

      function renderLeadsPagination(totalItems) {
        const pagination = document.getElementById('leadsPagination')
        if (!pagination) {
          return
        }

        const totalPages = Math.max(1, Math.ceil(totalItems / leadsPaginationState.pageSize))
        const items = getLeadsPaginationItems(totalPages)

        pagination.innerHTML = `
          <div class="dashboard-pagination">
            <span class="session-pagination-total">共 ${totalItems} 条</span>
            <div class="dashboard-pagination-controls">
              ${renderPaginationPageSizeSelect('leads', leadsPaginationState.pageSize)}
              <div class="page-group">
                <button type="button" class="page-arrow" data-leads-page-arrow="prev" ${leadsPaginationState.page === 1 ? 'disabled' : ''}>‹</button>
                ${items
                  .map((item) =>
                    typeof item === 'number'
                      ? `<button type="button" class="page-num ${item === leadsPaginationState.page ? 'active' : ''}" data-leads-page="${item}">${item}</button>`
                      : '<span class="page-ellipsis">…</span>'
                  )
                  .join('')}
                <button type="button" class="page-arrow" data-leads-page-arrow="next" ${leadsPaginationState.page === totalPages ? 'disabled' : ''}>›</button>
              </div>
              <div class="page-group page-jump-group">
                <span class="session-page-jump-label">前往</span>
                <label class="page-select page-jump-select">
                  <input type="number" min="1" max="${totalPages}" value="${leadsPaginationState.page}" data-leads-page-jump-input>
                </label>
                <span class="session-page-jump-suffix">页</span>
              </div>
            </div>
          </div>
        `
      }

      function rerenderLeadsFilters() {
        renderLeadsFilters()
        bindLeadsFilterEvents()
        if (!leadsFilterState.collapsed) {
          pageHost.querySelectorAll('#leadsFilterControls .leads-filter-extra').forEach((node) => {
            node.classList.add('is-visible')
          })
        }
      }

      function bindLeadsFilterEvents() {
        pageHost.querySelectorAll('[data-leads-menu-trigger]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
            const nextMenu = leadsMenuState.openMenu === node.dataset.leadsMenuTrigger ? null : node.dataset.leadsMenuTrigger
            leadsMenuState.openMenu = nextMenu

            if (nextMenu === 'organization') {
              leadsMenuState.organizationDraftPath = leadsFilterState.organization
            }

            if (nextMenu === 'date') {
              leadsMenuState.activeDateField = 'startDate'
              leadsMenuState.dateDraftStartDate = leadsFilterState.startDate
              leadsMenuState.dateDraftEndDate = leadsFilterState.endDate
              leadsMenuState.dateViewYear = Number(leadsMenuState.dateDraftStartDate.slice(0, 4))
              leadsMenuState.dateViewMonth = Number(leadsMenuState.dateDraftStartDate.slice(5, 7))
            }

            if (nextMenu === 'customerLeadIssuedDate' || nextMenu === 'customerFirstRecordingDate' || nextMenu === 'customerLatestRecordingDate') {
              const { startDateKey, endDateKey, dateField } = getLeadsCustomerDateFilterConfig(nextMenu)
              const anchorDate = getLeadCustomerDateAnchorDate(dateField)
              const fallbackDateValue = formatSessionDateValue(anchorDate)
              const endDate = leadsFilterState[endDateKey] || fallbackDateValue
              leadsMenuState.customerDateActiveField = 'startDate'
              leadsMenuState.customerDateDraftStartDate = leadsFilterState[startDateKey]
              leadsMenuState.customerDateDraftEndDate = leadsFilterState[endDateKey]
              leadsMenuState.customerDateViewYear = Number(endDate.slice(0, 4))
              leadsMenuState.customerDateViewMonth = Number(endDate.slice(5, 7))
            }

            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-select-key]').forEach((node) => {
          node.addEventListener('click', () => {
            const filterKey = node.dataset.leadsSelectKey
            const nextValue = node.dataset.leadsSelectValue
            if ((filterKey === 'leadQueryTarget' || filterKey === 'customerQueryTarget') && leadsFilterState[filterKey] !== nextValue) {
              leadsPaginationState.page = 1
            }
            leadsFilterState[filterKey] = nextValue
            if (filterKey === 'customerMultiLead' && nextValue === '是' && leadsFilterState.customerLeadCountRange === '1条') {
              leadsFilterState.customerLeadCountRange = '全部'
            }
            if (filterKey === 'customerCrossStore' && nextValue === '是' && leadsFilterState.customerStoreCountRange === '1家') {
              leadsFilterState.customerStoreCountRange = '全部'
            }
            leadsMenuState.openMenu = null
            leadsPaginationState.page = 1
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-org-path]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsMenuState.organizationDraftPath = node.dataset.leadsOrgPath
            if (node.dataset.leadsOrgHasChildren === 'true') {
              rerenderLeadsFilters()
              return
            }
            leadsFilterState.organization = node.dataset.leadsOrgPath
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-org-clear]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsFilterState.organization = '全部组织'
            leadsMenuState.organizationDraftPath = '全部组织'
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-org-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsFilterState.organization = node.dataset.leadsOrgApply || leadsMenuState.organizationDraftPath || '全部组织'
            leadsMenuState.organizationDraftPath = leadsFilterState.organization
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-field]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsMenuState.activeDateField = node.dataset.leadsDateField
            const value = node.dataset.leadsDateField === 'startDate' ? leadsMenuState.dateDraftStartDate : leadsMenuState.dateDraftEndDate
            const target = parseSessionDateValue(value)
            if (target) {
              leadsMenuState.dateViewYear = target.getFullYear()
              leadsMenuState.dateViewMonth = target.getMonth() + 1
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-nav]').forEach((node) => {
          node.addEventListener('click', () => {
            let nextYear = leadsMenuState.dateViewYear
            let nextMonth = leadsMenuState.dateViewMonth + Number(node.dataset.leadsDateNav)
            while (nextMonth < 1) { nextMonth += 12; nextYear -= 1 }
            while (nextMonth > 12) { nextMonth -= 12; nextYear += 1 }
            leadsMenuState.dateViewYear = nextYear
            leadsMenuState.dateViewMonth = nextMonth
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-value]').forEach((node) => {
          node.addEventListener('click', () => {
            const value = node.dataset.leadsDateValue
            if (leadsMenuState.activeDateField === 'startDate') {
              leadsMenuState.dateDraftStartDate = value
              if (!leadsMenuState.dateDraftEndDate || leadsMenuState.dateDraftEndDate < value) {
                leadsMenuState.dateDraftEndDate = value
              }
              leadsMenuState.activeDateField = 'endDate'
            } else {
              leadsMenuState.dateDraftEndDate = value
              if (!leadsMenuState.dateDraftStartDate || leadsMenuState.dateDraftStartDate > value) {
                leadsMenuState.dateDraftStartDate = value
              }
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const today = new Date()
            const endValue = formatSessionDateValue(today)
            let startValue = endValue
            if (node.dataset.leadsDateShortcut === 'last3') {
              const start = new Date(today); start.setDate(start.getDate() - 2); startValue = formatSessionDateValue(start)
            }
            if (node.dataset.leadsDateShortcut === 'last7') {
              const start = new Date(today); start.setDate(start.getDate() - 6); startValue = formatSessionDateValue(start)
            }
            leadsMenuState.dateDraftStartDate = startValue
            leadsMenuState.dateDraftEndDate = endValue
            leadsMenuState.activeDateField = 'endDate'
            const endDate = parseSessionDateValue(endValue)
            if (endDate) {
              leadsMenuState.dateViewYear = endDate.getFullYear()
              leadsMenuState.dateViewMonth = endDate.getMonth() + 1
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-cancel]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-date-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsFilterState.startDate = leadsMenuState.dateDraftStartDate
            leadsFilterState.endDate = leadsMenuState.dateDraftEndDate
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-field]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsMenuState.customerDateActiveField = node.dataset.leadsCustomerDateField
            const value = node.dataset.leadsCustomerDateField === 'startDate'
              ? leadsMenuState.customerDateDraftStartDate
              : leadsMenuState.customerDateDraftEndDate
            const target = parseSessionDateValue(value)
            if (target) {
              leadsMenuState.customerDateViewYear = target.getFullYear()
              leadsMenuState.customerDateViewMonth = target.getMonth() + 1
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-nav]').forEach((node) => {
          node.addEventListener('click', () => {
            let nextYear = leadsMenuState.customerDateViewYear
            let nextMonth = leadsMenuState.customerDateViewMonth + Number(node.dataset.leadsCustomerDateNav)
            while (nextMonth < 1) { nextMonth += 12; nextYear -= 1 }
            while (nextMonth > 12) { nextMonth -= 12; nextYear += 1 }
            leadsMenuState.customerDateViewYear = nextYear
            leadsMenuState.customerDateViewMonth = nextMonth
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-value]').forEach((node) => {
          node.addEventListener('click', () => {
            const value = node.dataset.leadsCustomerDateValue
            if (leadsMenuState.customerDateActiveField === 'startDate') {
              leadsMenuState.customerDateDraftStartDate = value
              if (!leadsMenuState.customerDateDraftEndDate || leadsMenuState.customerDateDraftEndDate < value) {
                leadsMenuState.customerDateDraftEndDate = value
              }
              leadsMenuState.customerDateActiveField = 'endDate'
            } else {
              leadsMenuState.customerDateDraftEndDate = value
              if (!leadsMenuState.customerDateDraftStartDate || leadsMenuState.customerDateDraftStartDate > value) {
                leadsMenuState.customerDateDraftStartDate = value
              }
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const shortcut = node.dataset.leadsCustomerDateShortcut
            if (shortcut === 'custom') {
              leadsMenuState.customerDateActiveField = 'startDate'
              rerenderLeadsFilters()
              return
            }

            const { dateField } = getLeadsCustomerDateFilterConfig(leadsMenuState.openMenu)
            const anchorDateValue = formatSessionDateValue(getLeadCustomerDateAnchorDate(dateField))
            const { startDate, endDate } = getLeadCustomerRangeValues(shortcut, anchorDateValue)
            leadsMenuState.customerDateDraftStartDate = startDate
            leadsMenuState.customerDateDraftEndDate = endDate
            leadsMenuState.customerDateActiveField = 'endDate'
            const endDateObject = parseSessionDateValue(endDate)
            if (endDateObject) {
              leadsMenuState.customerDateViewYear = endDateObject.getFullYear()
              leadsMenuState.customerDateViewMonth = endDateObject.getMonth() + 1
            }
            rerenderLeadsFilters()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-cancel]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsMenuState.openMenu = null
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-customer-date-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            const { startDateKey, endDateKey } = getLeadsCustomerDateFilterConfig(node.dataset.leadsCustomerDateApply)
            leadsFilterState[startDateKey] = leadsMenuState.customerDateDraftStartDate
            leadsFilterState[endDateKey] = leadsMenuState.customerDateDraftEndDate
            leadsMenuState.openMenu = null
            leadsPaginationState.page = 1
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-action="toggle-collapse"]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.preventDefault()
            leadsMenuState.openMenu = null
            if (leadsFilterState.collapsed) {
              leadsFilterState.collapsed = false
              renderLeadsPage()
              requestAnimationFrame(() => {
                const extras = pageHost.querySelectorAll('.leads-filter-extra')
                extras.forEach((el) => el.classList.add('is-visible'))
              })
            } else {
              const extras = pageHost.querySelectorAll('.leads-filter-extra')
              extras.forEach((el) => el.classList.remove('is-visible'))
              setTimeout(() => {
                leadsFilterState.collapsed = true
                renderLeadsPage()
              }, 300)
            }
          })
        })

        pageHost.querySelectorAll('[data-leads-action="reset"]').forEach((node) => {
          node.addEventListener('click', () => {
            Object.assign(leadsFilterState, leadsDefaultFilters)
            leadsPaginationState.page = 1
            Object.assign(leadsMenuState, {
              openMenu: null,
              organizationDraftPath: leadsDefaultFilters.organization,
              activeDateField: 'startDate',
              dateDraftStartDate: leadsDefaultFilters.startDate,
              dateDraftEndDate: leadsDefaultFilters.endDate,
              dateViewYear: Number(leadsDefaultFilters.startDate.slice(0, 4)),
              dateViewMonth: Number(leadsDefaultFilters.startDate.slice(5, 7)),
              customerDateActiveField: 'startDate',
              customerDateDraftStartDate: leadsDefaultFilters.customerLeadIssuedStartDate,
              customerDateDraftEndDate: leadsDefaultFilters.customerLeadIssuedEndDate,
              customerDateViewYear: Number(leadsDefaultFilters.endDate.slice(0, 4)),
              customerDateViewMonth: Number(leadsDefaultFilters.endDate.slice(5, 7))
            })
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-simple-query]').forEach((node) => {
          node.addEventListener('input', (event) => {
            if (event.isComposing) {
              return
            }
            const filterKey = node.dataset.leadsSimpleQuery
            const nextValue = node.value || ''
            const cursorStart = node.selectionStart ?? nextValue.length
            const cursorEnd = node.selectionEnd ?? nextValue.length
            leadsFilterState[filterKey] = nextValue
            leadsPaginationState.page = 1
            renderLeadsPage()
            window.requestAnimationFrame(() => {
              const nextInput = pageHost.querySelector(`[data-leads-simple-query="${filterKey}"]`)
              if (!nextInput) {
                return
              }
              nextInput.focus()
              nextInput.setSelectionRange(cursorStart, cursorEnd)
            })
          })
        })

        pageHost.querySelectorAll('[data-leads-page]').forEach((node) => {
          node.addEventListener('click', () => {
            leadsPaginationState.page = Number(node.dataset.leadsPage)
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-page-arrow]').forEach((node) => {
          node.addEventListener('click', () => {
            const delta = node.dataset.leadsPageArrow === 'prev' ? -1 : 1
            leadsPaginationState.page = Math.max(1, leadsPaginationState.page + delta)
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-page-size-trigger]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
            const options = node.parentElement?.querySelector('.page-size-options')
            const willOpen = !options?.classList.contains('open')
            document.querySelectorAll('.page-size-options').forEach((optionNode) => {
              if (optionNode !== options) {
                optionNode.classList.remove('open')
              }
            })
            document.querySelectorAll('[data-session-page-size-trigger], [data-leads-page-size-trigger]').forEach((triggerNode) => {
              if (triggerNode !== node) {
                triggerNode.classList.remove('is-open')
              }
            })
            options?.classList.toggle('open', willOpen)
            node.classList.toggle('is-open', willOpen)
          })
        })

        pageHost.querySelectorAll('[data-leads-page-size-option]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()
            leadsPaginationState.pageSize = Number(node.dataset.leadsPageSizeOption)
            leadsPaginationState.page = 1
            renderLeadsPage()
          })
        })

        pageHost.querySelectorAll('[data-leads-page-jump-input]').forEach((node) => {
          const applyPageJump = () => {
            const totalPages = Math.max(1, Math.ceil(getDisplayedLeadRecords().length / leadsPaginationState.pageSize))
            const nextPage = Math.min(totalPages, Math.max(1, Number(node.value || 1)))
            leadsPaginationState.page = nextPage
            renderLeadsPage()
          }

          node.addEventListener('change', applyPageJump)
          node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyPageJump()
            }
          })
        })

        pageHost.querySelectorAll('[data-leads-view]').forEach((node) => {
          node.onclick = () => {
            if (node.dataset.leadsView === leadsViewState.mode) {
              return
            }
            leadsViewState.mode = node.dataset.leadsView || 'leads'
            leadsMenuState.openMenu = null
            leadsPaginationState.page = 1
            renderLeadsPage()
          }
        })

        pageHost.querySelectorAll('[data-leads-open-sales-advisor]').forEach((node) => {
          node.addEventListener('click', () => {
            openRouteInNewTab('sales-advisor')
          })
        })

        pageHost.querySelectorAll('[data-customer-detail-open]').forEach((node) => {
          node.addEventListener('click', () => {
            setCustomerDetailSelection({
              customerName: node.dataset.customerName,
              customerPhone: node.dataset.customerPhone,
              customerStatus: node.dataset.customerStatus,
              store: node.dataset.customerStore,
              lastContact: node.dataset.customerLastContact,
              aggregateLeadCount: Number(node.dataset.customerLeadCount || 0) || customerDetailDefaultSelection.aggregateLeadCount,
              aggregateStoreCount: Number(node.dataset.customerStoreCount || 0) || customerDetailDefaultSelection.aggregateStoreCount
            })
            renderPage('customer-detail')
          })
        })
      }

      function renderLeadsPage() {
        syncLeadsViewTabs()
        renderLeadsFilters()
        renderLeadsTable(getFilteredLeadRecords())
        bindLeadsFilterEvents()
        if (!leadsFilterState.collapsed) {
          requestAnimationFrame(() => {
            const extras = pageHost.querySelectorAll('.leads-filter-extra')
            extras.forEach((el) => el.classList.add('is-visible'))
          })
        }
      }

      const sessionWaveHeights = [
        28, 46, 62, 36, 54, 64, 38, 58, 70, 42, 60, 68,
        34, 52, 66, 40, 57, 72, 44, 61, 69, 37, 55, 65,
        33, 49, 63, 39, 56, 71, 45, 59, 67, 35, 53, 64,
        32, 48, 62, 41, 58, 70, 43, 57, 66, 36, 51, 60
      ]

      const sessionDetailDefaultState = {
        duration: 12 * 60 + 43,
        currentTime: 72,
        playbackRate: 1.5,
        isPlaying: false,
        aiView: 'insight'
      }

      let sessionDetailState = { ...sessionDetailDefaultState }
      let sessionDetailPlaybackTimer = null
      let lastActiveTranscriptId = null
      let sessionDetailResizeObserver = null

      function applySessionDetailSketchCloudFit(scale = 1) {
        const cloud = pageHost.querySelector('#sessionDetailSketchCloud')
        if (!cloud) {
          return
        }

        const safeScale = Math.max(0.74, Math.min(scale, 1))
        cloud.style.setProperty('--lead-cloud-size-xl', `${(26 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-lg', `${(21 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-md', `${(17 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-sm', `${Math.max(11, 13 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-gap-y', `${Math.max(8, Math.round(12 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-gap-x', `${Math.max(10, Math.round(16 * safeScale))}px`)
        const cloudPadY = `${Math.max(8, Math.round(16 * safeScale))}px`
        cloud.style.setProperty('--lead-cloud-pad-top', cloudPadY)
        cloud.style.setProperty('--lead-cloud-pad-x', `${Math.max(3, Math.round(6 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-pad-bottom', cloudPadY)
        cloud.style.setProperty('--lead-cloud-offset-up', `${Math.min(-2, Math.round(-4 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-offset-down', `${Math.max(2, Math.round(4 * safeScale))}px`)
      }

      function syncSessionDetailSketchCloudLayout() {
        const cloud = pageHost.querySelector('#sessionDetailSketchCloud')
        if (!cloud || cloud.offsetParent === null) {
          return
        }

        const terms = [...cloud.querySelectorAll('.lead-cloud-term')]
        if (!terms.length) {
          return
        }

        applySessionDetailSketchCloudFit(1)

        const maxHeight = cloud.clientHeight
        const maxWidth = cloud.clientWidth
        if (!maxHeight || !maxWidth) {
          return
        }

        const fits = () => cloud.scrollHeight <= maxHeight + 1 && cloud.scrollWidth <= maxWidth + 1
        if (fits()) {
          return
        }

        let low = 0.74
        let high = 1
        let best = 0.74

        for (let index = 0; index < 10; index += 1) {
          const mid = Number(((low + high) / 2).toFixed(3))
          applySessionDetailSketchCloudFit(mid)

          if (fits()) {
            best = mid
            low = mid
          } else {
            high = mid
          }
        }

        applySessionDetailSketchCloudFit(best)
      }

      function handleSessionDetailResize() {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(syncSessionDetailSketchCloudLayout)
        })
      }

      function destroySessionDetailPage() {
        if (sessionDetailResizeObserver) {
          sessionDetailResizeObserver.disconnect()
          sessionDetailResizeObserver = null
        }

        window.removeEventListener('resize', handleSessionDetailResize)
      }

      function formatSessionClock(totalSeconds) {
        const safeSeconds = Math.max(0, Math.floor(totalSeconds))
        const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0')
        const seconds = String(safeSeconds % 60).padStart(2, '0')
        return `${minutes}:${seconds}`
      }

      function buildWaveformBars(progressPercent = 36) {
        const activeCount = Math.max(
          0,
          Math.min(sessionWaveHeights.length, Math.round((sessionWaveHeights.length * progressPercent) / 100))
        )

        return sessionWaveHeights
          .map(
            (height, index) =>
              `<span class="waveform-bar ${index < activeCount ? 'is-active' : 'is-idle'}" style="--wave-h:${height}"></span>`
          )
          .join('')
      }

      function renderSessionDetailWaveform(progressPercent = (sessionDetailState.currentTime / sessionDetailState.duration) * 100) {
        const waveform = document.getElementById('sessionWaveform')
        if (!waveform) {
          return
        }

        const progress = Math.max(0, Math.min(100, progressPercent))
        waveform.dataset.waveProgress = String(progress)
        waveform.style.setProperty('--wave-count', String(sessionWaveHeights.length))
        waveform.innerHTML = buildWaveformBars(progress)
      }

      function getSessionTranscriptNodes() {
        return Array.from(pageHost.querySelectorAll('[data-session-transcript-time]'))
      }

      function updateSessionDetailAiView() {
        pageHost.querySelectorAll('[data-session-ai-view]').forEach((node) => {
          const active = node.dataset.sessionAiView === sessionDetailState.aiView
          node.classList.toggle('active', active)
          node.setAttribute('aria-selected', active ? 'true' : 'false')
        })

        const insightPanel = document.getElementById('sessionAiInsightPanel')
        const transcriptPanel = document.getElementById('sessionAiTranscriptPanel')
        if (insightPanel) {
          const active = sessionDetailState.aiView === 'insight'
          insightPanel.hidden = !active
          insightPanel.classList.toggle('is-active', active)
        }
        if (transcriptPanel) {
          const active = sessionDetailState.aiView === 'transcript'
          transcriptPanel.hidden = !active
          transcriptPanel.classList.toggle('is-active', active)
        }

        if (sessionDetailState.aiView === 'insight') {
          handleSessionDetailResize()
        }
      }

      function getActiveTranscriptId(time = sessionDetailState.currentTime) {
        const transcriptNodes = getSessionTranscriptNodes()
        if (transcriptNodes.length === 0) {
          return null
        }

        let activeId = transcriptNodes[0].dataset.sessionTranscriptId
        transcriptNodes.forEach((node) => {
          if (Number(node.dataset.sessionTranscriptTime) <= time) {
            activeId = node.dataset.sessionTranscriptId
          }
        })
        return activeId
      }

      function updateSessionProgressRange() {
        const range = document.getElementById('sessionProgressRange')
        if (!range) {
          return
        }

        const percent = (sessionDetailState.currentTime / sessionDetailState.duration) * 100
        range.max = String(sessionDetailState.duration)
        range.value = String(Math.round(sessionDetailState.currentTime))
        range.style.setProperty('--player-progress', `${percent}%`)
      }

      function updateSessionDetailUI() {
        const currentTimeText = formatSessionClock(sessionDetailState.currentTime)
        const durationText = formatSessionClock(sessionDetailState.duration)
        const rateText = `${sessionDetailState.playbackRate}x`
        const progressPercent = (sessionDetailState.currentTime / sessionDetailState.duration) * 100

        pageHost.querySelectorAll('[data-session-time-current]').forEach((node) => {
          node.textContent = currentTimeText
        })
        pageHost.querySelectorAll('[data-session-time-total]').forEach((node) => {
          node.textContent = durationText
        })
        pageHost.querySelectorAll('[data-session-playback-rate]').forEach((node) => {
          node.textContent = rateText
        })

        const playIcon = document.getElementById('sessionPlayIcon')
        const playText = document.getElementById('sessionPlayText')
        if (playIcon) {
          playIcon.textContent = sessionDetailState.isPlaying ? '||' : '▶'
        }
        if (playText) {
          playText.textContent = sessionDetailState.isPlaying ? '暂停' : '播放'
        }

        updateSessionProgressRange()
        renderSessionDetailWaveform(progressPercent)

        const activeTranscriptId = getActiveTranscriptId()
        getSessionTranscriptNodes().forEach((node) => {
          node.classList.toggle('is-active', node.dataset.sessionTranscriptId === activeTranscriptId)
        })

        if (activeTranscriptId && activeTranscriptId !== lastActiveTranscriptId) {
          const transcriptList = pageHost.querySelector('.session-ai-panel-transcript.is-active .transcript-list')
          const activeNode = pageHost.querySelector(`[data-session-transcript-id="${activeTranscriptId}"]`)

          if (transcriptList && activeNode) {
            const nodeTop = activeNode.offsetTop
            const nodeBottom = nodeTop + activeNode.offsetHeight
            const viewTop = transcriptList.scrollTop
            const viewBottom = viewTop + transcriptList.clientHeight

            if (nodeTop < viewTop || nodeBottom > viewBottom) {
              const targetTop = Math.max(0, nodeTop - 16)
              transcriptList.scrollTo({
                top: targetTop,
                behavior: sessionDetailState.isPlaying ? 'smooth' : 'auto'
              })
            }
          }
        }

        lastActiveTranscriptId = activeTranscriptId
      }

      function pauseSessionDetailPlayback(shouldRefresh = true) {
        if (sessionDetailPlaybackTimer) {
          clearInterval(sessionDetailPlaybackTimer)
          sessionDetailPlaybackTimer = null
        }

        sessionDetailState.isPlaying = false
        if (shouldRefresh) {
          updateSessionDetailUI()
        }
      }

      function startSessionDetailPlayback() {
        pauseSessionDetailPlayback(false)
        sessionDetailState.isPlaying = true
        updateSessionDetailUI()

        sessionDetailPlaybackTimer = window.setInterval(() => {
          sessionDetailState.currentTime = Math.min(
            sessionDetailState.duration,
            sessionDetailState.currentTime + 0.25 * sessionDetailState.playbackRate
          )

          if (sessionDetailState.currentTime >= sessionDetailState.duration) {
            pauseSessionDetailPlayback(false)
          }

          updateSessionDetailUI()
        }, 250)
      }

      function seekSessionDetail(nextTime) {
        sessionDetailState.currentTime = Math.max(0, Math.min(sessionDetailState.duration, nextTime))
        updateSessionDetailUI()
      }

      function cycleSessionPlaybackRate() {
        const playbackRates = [1, 1.25, 1.5, 2]
        const currentIndex = playbackRates.indexOf(sessionDetailState.playbackRate)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playbackRates.length
        sessionDetailState.playbackRate = playbackRates[nextIndex]
        updateSessionDetailUI()
      }

      function bindSessionDetailEvents() {
        const playToggle = document.getElementById('sessionPlayToggle')
        const back15 = document.getElementById('sessionBack15')
        const forward15 = document.getElementById('sessionForward15')
        const speedToggle = document.getElementById('sessionSpeedToggle')
        const progressRange = document.getElementById('sessionProgressRange')
        const waveformShell = pageHost.querySelector('.waveform-shell')

        pageHost.querySelectorAll('[data-session-ai-view]').forEach((node) => {
          node.addEventListener('click', () => {
            const nextView = node.dataset.sessionAiView
            if (!nextView || nextView === sessionDetailState.aiView) {
              return
            }

            sessionDetailState.aiView = nextView
            updateSessionDetailAiView()
            updateSessionDetailUI()
          })
        })

        playToggle?.addEventListener('click', () => {
          if (sessionDetailState.isPlaying) {
            pauseSessionDetailPlayback()
            return
          }
          startSessionDetailPlayback()
        })

        back15?.addEventListener('click', () => {
          seekSessionDetail(sessionDetailState.currentTime - 15)
        })

        forward15?.addEventListener('click', () => {
          seekSessionDetail(sessionDetailState.currentTime + 15)
        })

        speedToggle?.addEventListener('click', () => {
          cycleSessionPlaybackRate()
        })

        progressRange?.addEventListener('input', () => {
          seekSessionDetail(Number(progressRange.value))
        })

        waveformShell?.addEventListener('click', (event) => {
          const rect = waveformShell.getBoundingClientRect()
          if (rect.width === 0) {
            return
          }
          const ratio = (event.clientX - rect.left) / rect.width
          seekSessionDetail(sessionDetailState.duration * ratio)
        })

        getSessionTranscriptNodes().forEach((node) => {
          const jump = () => {
            seekSessionDetail(Number(node.dataset.sessionTranscriptTime))
          }

          node.addEventListener('click', jump)
          node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              jump()
            }
          })
        })
      }

      function initSessionDetailPage() {
        destroySessionDetailPage()
        pauseSessionDetailPlayback(false)
        sessionDetailState = { ...sessionDetailDefaultState }
        lastActiveTranscriptId = null
        applySessionDetailRouteContext()
        updateSessionDetailAiView()
        bindSessionDetailEvents()
        updateSessionDetailUI()
        handleSessionDetailResize()

        if (window.ResizeObserver) {
          const insightPanel = document.getElementById('sessionAiInsightPanel')
          const sketchCard = pageHost.querySelector('.session-ai-sketch-card')
          const sketchCloud = pageHost.querySelector('#sessionDetailSketchCloud')

          sessionDetailResizeObserver = new ResizeObserver(() => {
            handleSessionDetailResize()
          })

          if (insightPanel) {
            sessionDetailResizeObserver.observe(insightPanel)
          }

          if (sketchCard) {
            sessionDetailResizeObserver.observe(sketchCard)
          }

          if (sketchCloud) {
            sessionDetailResizeObserver.observe(sketchCloud)
          }
        }

        window.addEventListener('resize', handleSessionDetailResize)
      }

      const defaultPromptRole =
        '#任务目标： 你是一名资深汽车门店销售人员，拥有丰富的销售技巧、了解全面的汽车产品知识以及丰富的汽车试乘试驾经验。 请你严格按照以下标准，用严谨的态度和专业的方法，对各类销售话术进行全面、精准的质检。'
      const defaultPromptSteps =
        '1.仔细阅读销售侧的会话内容，必须联系上下文分析判断。\n2.具体的语义点定义如下，对每个语义点的定义进行细致研读，确保明确知晓命中该语义点所需的具体条件。'

      let tasks = [
        {
          id: 1,
          taskName: 'AION Y Plus 邀约质检',
          model: ['AION Y Plus'],
          scenario: ['邀约'],
          status: true,
          updatedAt: '2026-03-16 09:30',
          startTime: '2026-03-10 00:00',
          execType: 'continuous',
          applyHistory: false,
          historyStartDate: '',
          rules: [
            {
              name: '开场白与确认',
              desc:
                '✅ 合格示例：\n- "您咨询的是哪款车？"\n- "刚才看到您了解XX车型是吧？"\n- "您比较心仪哪个配置？"\n- "平时有在了解传祺哪一款车型吗？"\n\n❌ 不合格：仅自我介绍、仅说"有什么可以帮您"、客户主动提及车型而销售仅复述'
            }
          ],
          promptRole: defaultPromptRole,
          promptSteps: defaultPromptSteps
        },
        {
          id: 2,
          taskName: '传祺双车型试驾 PDC 质检',
          model: ['M8', 'E9'],
          scenario: ['试驾PDC'],
          status: false,
          updatedAt: '2026-03-15 14:20',
          startTime: '-',
          execType: 'continuous',
          applyHistory: true,
          historyStartDate: '2026-01-01',
          rules: [],
          promptRole: '',
          promptSteps: ''
        }
      ]

      let currentTaskId = null
      const taskFilterState = {
        model: '',
        scenario: ''
      }
      const feedbackModalState = {
        open: false,
        confirmOnly: true,
        onConfirm: null
      }
      const configDatePickerState = {
        open: null,
        rangeActiveField: 'startDate',
        singleDraftDate: '',
        rangeDraftStartDate: '',
        rangeDraftEndDate: '',
        anchorRect: null
      }
      const salesRoleDateState = {
        openRole: null,
        activeField: 'startDate',
        draftStartDate: '',
        draftEndDate: '',
        viewYear: new Date().getFullYear(),
        viewMonth: new Date().getMonth() + 1
      }
      const salesRecommendRangeOptions = [
        { key: 'yesterday', label: '昨日' },
        { key: 'last7', label: '近7天' },
        { key: 'last15', label: '近半月' },
        { key: 'last30', label: '近1月' },
        { key: 'custom', label: '自定义' }
      ]
      const salesRecommendDateShortcutOptions = salesRecommendRangeOptions.filter((option) => option.key !== 'custom')

      const taskFilterOptions = {
        model: [
          { value: '', label: '全部车型' },
          { value: 'AION UT', label: '埃安 UT' },
          { value: 'AION RT', label: '埃安 RT' },
          { value: 'AION Y Plus', label: '埃安 Y Plus' },
          { value: 'AION S Plus', label: '埃安 S Plus' },
          { value: 'AION V Plus', label: '埃安 V Plus' },
          { value: 'AION LX Plus', label: '埃安 LX Plus' },
          { value: 'Hyper GT', label: 'Hyper GT' },
          { value: 'Hyper HT', label: 'Hyper HT' },
          { value: 'E8', label: '传祺 E8' },
          { value: 'E9', label: '传祺 E9' },
          { value: 'M8', label: '传祺 M8' },
          { value: 'GS8', label: '传祺 GS8' }
        ],
        scenario: [
          { value: '', label: '全部场景' },
          { value: '邀约', label: '电话邀约' },
          { value: '试驾PDC', label: '试驾PDC' },
          { value: '到店接待', label: '到店接待' },
          { value: '试乘试驾', label: '试乘试驾' }
        ]
      }

      function renderTaskFilterMenus() {
        Object.entries(taskFilterOptions).forEach(([filterKey, options]) => {
          const container = document.getElementById(filterKey === 'model' ? 'taskFilterModelOptions' : 'taskFilterScenarioOptions')
          const trigger = document.getElementById(filterKey === 'model' ? 'taskFilterModelTrigger' : 'taskFilterScenarioTrigger')
          if (!container || !trigger) {
            return
          }

          const selectedValue = taskFilterState[filterKey]
          const selected = options.find((option) => option.value === selectedValue) || options[0]
          trigger.textContent = selected.label

          container.innerHTML = options
            .map((option) => {
              const active = option.value === selectedValue ? ' active' : ''
              return `
                <button
                  type="button"
                  class="custom-option task-filter-option${active}"
                  data-task-filter-key="${filterKey}"
                  data-task-filter-value="${escapeHtml(option.value)}"
                >
                  <span>${escapeHtml(option.label)}</span>
                </button>
              `
            })
            .join('')
        })

        bindTaskFilterEvents()
      }

      function toggleTaskFilterSelect(filterKey) {
        const targetId = filterKey === 'model' ? 'taskFilterModelOptions' : 'taskFilterScenarioOptions'
        const target = document.getElementById(targetId)
        if (!target) {
          return
        }

        const shouldOpen = !target.classList.contains('open')
        document.querySelectorAll('.task-filter-options').forEach((node) => node.classList.remove('open'))
        if (shouldOpen) {
          target.classList.add('open')
        }
      }

      function bindTaskFilterEvents() {
        pageHost.querySelectorAll('[data-task-filter-key]').forEach((node) => {
          node.addEventListener('click', () => {
            taskFilterState[node.dataset.taskFilterKey] = node.dataset.taskFilterValue || ''
            document.querySelectorAll('.task-filter-options').forEach((panel) => panel.classList.remove('open'))
            renderTaskFilterMenus()
            renderTaskList()
          })
        })
      }

      function parseConfigRangeValue(value) {
        if (!value) {
          return { startDate: '', endDate: '' }
        }

        const [startDate = '', endDate = ''] = value.split('|')
        return { startDate, endDate }
      }

      function formatConfigRangeValue(startDate, endDate) {
        if (!startDate || !endDate) {
          return ''
        }

        return `${startDate}|${endDate}`
      }

      function syncExecutionStrategyControls(options = {}) {
        const historyCheck = document.getElementById('historyDataCheck')
        const checkedExecType = document.querySelector('input[name="execType"]:checked')?.value || 'continuous'

        toggleHistoryDate(Boolean(historyCheck?.checked), { ...options, rerender: false })
        toggleDateRange(checkedExecType === 'range', { ...options, rerender: false })
        renderConfigDatePickers()
      }

      function syncConfigDateTriggerLabels() {
        const historyInput = document.getElementById('historyStartDate')
        const historyLabel = pageHost.querySelector('[data-config-history-label]')
        if (historyLabel) {
          historyLabel.textContent = historyInput?.value ? formatSessionDateDisplay(historyInput.value) : '年 / 月 / 日'
        }

        const rangeStartInput = document.getElementById('execDateRangeStart')
        const rangeEndInput = document.getElementById('execDateRangeEnd')
        const rangeLabel = pageHost.querySelector('[data-config-range-label]')
        if (rangeLabel) {
          rangeLabel.textContent =
            rangeStartInput?.value && rangeEndInput?.value
              ? `${formatSessionDateDisplay(rangeStartInput.value)} 至 ${formatSessionDateDisplay(rangeEndInput.value)}`
              : '日期范围'
        }
      }

      function renderConfigSingleDateMenu() {
        const value = configDatePickerState.singleDraftDate || formatSessionDateValue(new Date())
        const todayValue = formatSessionDateValue(new Date())
        const cells = getSessionDateCells(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth)

        return `
          <div class="session-menu-panel session-menu-panel-date">
            <div class="session-date-panel-head">
              <div class="session-date-panel-copy">
                <span>选择日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(value))}</strong>
              </div>
              <div class="session-date-nav">
                <button type="button" class="session-date-nav-btn" data-config-date-nav="-1" aria-label="上一个月">
                  <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
                </button>
                <strong>${escapeHtml(formatSessionMonthLabel(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth))}</strong>
                <button type="button" class="session-date-nav-btn" data-config-date-nav="1" aria-label="下一个月">
                  <i class="session-date-nav-arrow next" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="session-date-weekdays">
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
            <div class="session-date-grid">
              ${cells
                .map((date) => {
                  if (!date) {
                    return '<span class="session-date-empty" aria-hidden="true"></span>'
                  }

                  const dateValue = formatSessionDateValue(date)
                  const isSelected = dateValue === value
                  const isToday = dateValue === todayValue
                  return `
                    <button
                      type="button"
                      class="session-date-day${isSelected ? ' is-start is-end in-range' : ''}${isToday ? ' is-today' : ''}"
                      data-config-date-value="${escapeHtml(dateValue)}"
                    >
                      ${date.getDate()}
                    </button>
                  `
                })
                .join('')}
            </div>
            <div class="session-date-shortcuts">
              <button type="button" class="session-date-shortcut" data-config-date-shortcut="today">今天</button>
              <button type="button" class="session-date-shortcut" data-config-date-shortcut="yesterday">昨天</button>
              <button type="button" class="session-date-shortcut" data-config-date-shortcut="tomorrow">明天</button>
            </div>
            <div class="session-cascader-footer session-date-footer">
              <span>${escapeHtml(`已选择 ${formatSessionDateDisplay(value)}`)}</span>
              <div class="session-date-actions">
                <button type="button" class="btn session-date-action-btn" data-config-date-cancel="true">取消</button>
                <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-config-date-apply="true">应用日期</button>
              </div>
            </div>
          </div>
        `
      }

      function applyConfigRangeDraft(field, value) {
        if (field === 'startDate') {
          configDatePickerState.rangeDraftStartDate = value
          if (!configDatePickerState.rangeDraftEndDate || configDatePickerState.rangeDraftEndDate < value) {
            configDatePickerState.rangeDraftEndDate = value
          }
          configDatePickerState.rangeActiveField = 'endDate'
          syncSessionDateView(configDatePickerState.rangeDraftEndDate)
          return
        }

        configDatePickerState.rangeDraftEndDate = value
        if (!configDatePickerState.rangeDraftStartDate || configDatePickerState.rangeDraftStartDate > value) {
          configDatePickerState.rangeDraftStartDate = value
        }
      }

      function renderConfigRangeDateMenu() {
        const startDate = configDatePickerState.rangeDraftStartDate
        const endDate = configDatePickerState.rangeDraftEndDate
        const activeField = configDatePickerState.rangeActiveField
        const todayValue = formatSessionDateValue(new Date())
        const cells = getSessionDateCells(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth)

        return `
          <div class="session-menu-panel session-menu-panel-date">
            <div class="session-date-panel-head">
              <div class="session-date-panel-copy">
                <span>日期范围</span>
                <strong>${escapeHtml(getSessionDateRangeText(startDate, endDate))}</strong>
              </div>
              <div class="session-date-nav">
                <button type="button" class="session-date-nav-btn" data-config-date-nav="-1" aria-label="上一个月">
                  <i class="session-date-nav-arrow prev" aria-hidden="true"></i>
                </button>
                <strong>${escapeHtml(formatSessionMonthLabel(sessionMenuState.dateViewYear, sessionMenuState.dateViewMonth))}</strong>
                <button type="button" class="session-date-nav-btn" data-config-date-nav="1" aria-label="下一个月">
                  <i class="session-date-nav-arrow next" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="session-date-tabs">
              <button type="button" class="session-date-tab${activeField === 'startDate' ? ' active' : ''}" data-config-range-field="startDate">
                <span>开始日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(startDate))}</strong>
              </button>
              <button type="button" class="session-date-tab${activeField === 'endDate' ? ' active' : ''}" data-config-range-field="endDate">
                <span>结束日期</span>
                <strong>${escapeHtml(formatSessionDateDisplay(endDate))}</strong>
              </button>
            </div>
            <div class="session-date-weekdays">
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
            <div class="session-date-grid">
              ${cells
                .map((date) => {
                  if (!date) {
                    return '<span class="session-date-empty" aria-hidden="true"></span>'
                  }

                  const dateValue = formatSessionDateValue(date)
                  const inRange = startDate && endDate && dateValue >= startDate && dateValue <= endDate
                  const isStart = dateValue === startDate
                  const isEnd = dateValue === endDate
                  const isToday = dateValue === todayValue
                  return `
                    <button
                      type="button"
                      class="session-date-day${inRange ? ' in-range' : ''}${isStart ? ' is-start' : ''}${isEnd ? ' is-end' : ''}${isToday ? ' is-today' : ''}"
                      data-config-range-value="${escapeHtml(dateValue)}"
                    >
                      ${date.getDate()}
                    </button>
                  `
                })
                .join('')}
            </div>
            <div class="session-date-shortcuts">
              <button type="button" class="session-date-shortcut" data-config-range-shortcut="today">今天</button>
              <button type="button" class="session-date-shortcut" data-config-range-shortcut="last3">近3天</button>
              <button type="button" class="session-date-shortcut" data-config-range-shortcut="last7">近7天</button>
            </div>
            <div class="session-cascader-footer session-date-footer">
              <span>${escapeHtml(`已选择 ${getSessionDateRangeText(startDate, endDate)}`)}</span>
              <div class="session-date-actions">
                <button type="button" class="btn session-date-action-btn" data-config-date-cancel="true">取消</button>
                <button type="button" class="btn-primary session-date-action-btn session-date-apply-btn" data-config-date-apply="true">应用日期</button>
              </div>
            </div>
          </div>
        `
      }

      function renderConfigDatePickers() {
        syncConfigDateTriggerLabels()

        const historyPanel = document.getElementById('historyStartDatePanel')
        const rangePanel = document.getElementById('execDateRangePanel')
        const historyRoot = pageHost.querySelector('[data-config-date-root="history"]')
        const rangeRoot = pageHost.querySelector('[data-config-date-root="range"]')

        historyRoot?.classList.toggle('is-open', configDatePickerState.open === 'history')
        rangeRoot?.classList.toggle('is-open', configDatePickerState.open === 'range')

        if (historyPanel) {
          historyPanel.innerHTML = configDatePickerState.open === 'history' ? renderConfigSingleDateMenu() : ''
        }

        if (rangePanel) {
          rangePanel.innerHTML = configDatePickerState.open === 'range' ? renderConfigRangeDateMenu() : ''
        }

        bindConfigDatePickerEvents()
        positionConfigDatePanels()
      }

      function positionConfigDatePanels() {
        const viewportPadding = 24
        const panelBaseWidth = Math.min(392, window.innerWidth - viewportPadding * 2)
        const panels = [
          { type: 'history', panel: document.querySelector('#historyStartDatePanel .session-menu-panel-date') },
          { type: 'range', panel: document.querySelector('#execDateRangePanel .session-menu-panel-date') }
        ]

        panels.forEach(({ type, panel }) => {
          if (!panel || configDatePickerState.open !== type || !configDatePickerState.anchorRect) {
            return
          }

          panel.style.width = `${panelBaseWidth}px`
          panel.style.minWidth = `${panelBaseWidth}px`
          panel.style.maxWidth = `${panelBaseWidth}px`
          const panelWidth = panelBaseWidth
          const maxLeft = window.innerWidth - panelWidth - viewportPadding
          const left = Math.min(Math.max(configDatePickerState.anchorRect.left, viewportPadding), Math.max(viewportPadding, maxLeft))
          const top = Math.min(
            configDatePickerState.anchorRect.bottom + 8,
            window.innerHeight - panel.offsetHeight - viewportPadding
          )

          panel.style.position = 'fixed'
          panel.style.left = `${left}px`
          panel.style.top = `${Math.max(viewportPadding, top)}px`
          panel.style.zIndex = '320'
        })
      }

      function openConfigDatePicker(type) {
        configDatePickerState.open = type

        if (type === 'history') {
          const historyValue = document.getElementById('historyStartDate')?.value || formatSessionDateValue(new Date())
          configDatePickerState.singleDraftDate = historyValue
          syncSessionDateView(historyValue)
        } else {
          const startDate = document.getElementById('execDateRangeStart')?.value || ''
          const endDate = document.getElementById('execDateRangeEnd')?.value || ''
          configDatePickerState.rangeDraftStartDate = startDate
          configDatePickerState.rangeDraftEndDate = endDate
          configDatePickerState.rangeActiveField = startDate ? 'endDate' : 'startDate'
          syncSessionDateView(endDate || startDate || formatSessionDateValue(new Date()))
        }

        const trigger = pageHost.querySelector(`[data-config-date-trigger="${type}"]`)
        configDatePickerState.anchorRect = trigger ? trigger.getBoundingClientRect() : null

        renderConfigDatePickers()
        positionConfigDatePanels()
      }

      function closeConfigDatePicker() {
        if (!configDatePickerState.open) {
          return
        }

        configDatePickerState.open = null
        configDatePickerState.anchorRect = null
        renderConfigDatePickers()
      }

      function bindConfigDatePickerEvents() {
        pageHost.querySelectorAll('[data-config-date-trigger]').forEach((node) => {
          if (node.dataset.configDateTriggerBound === 'true') {
            return
          }

          node.dataset.configDateTriggerBound = 'true'
          node.addEventListener('click', () => {
            if (node.disabled) {
              return
            }

            const nextType = configDatePickerState.open === node.dataset.configDateTrigger ? null : node.dataset.configDateTrigger
            if (!nextType) {
              closeConfigDatePicker()
              return
            }
            openConfigDatePicker(nextType)
          })
        })

        pageHost.querySelectorAll('[data-config-date-nav]').forEach((node) => {
          node.addEventListener('click', () => {
            shiftSessionDateView(Number(node.dataset.configDateNav))
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-date-value]').forEach((node) => {
          node.addEventListener('click', () => {
            configDatePickerState.singleDraftDate = node.dataset.configDateValue
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-date-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const today = new Date()
            if (node.dataset.configDateShortcut === 'yesterday') {
              today.setDate(today.getDate() - 1)
            }
            if (node.dataset.configDateShortcut === 'tomorrow') {
              today.setDate(today.getDate() + 1)
            }
            configDatePickerState.singleDraftDate = formatSessionDateValue(today)
            syncSessionDateView(configDatePickerState.singleDraftDate)
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-range-field]').forEach((node) => {
          node.addEventListener('click', () => {
            configDatePickerState.rangeActiveField = node.dataset.configRangeField
            syncSessionDateView(
              configDatePickerState.rangeActiveField === 'startDate'
                ? configDatePickerState.rangeDraftStartDate
                : configDatePickerState.rangeDraftEndDate
            )
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-range-value]').forEach((node) => {
          node.addEventListener('click', () => {
            applyConfigRangeDraft(configDatePickerState.rangeActiveField, node.dataset.configRangeValue)
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-range-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const today = new Date()
            const endValue = formatSessionDateValue(today)
            let startValue = endValue

            if (node.dataset.configRangeShortcut === 'last3') {
              const start = new Date(today)
              start.setDate(start.getDate() - 2)
              startValue = formatSessionDateValue(start)
            }

            if (node.dataset.configRangeShortcut === 'last7') {
              const start = new Date(today)
              start.setDate(start.getDate() - 6)
              startValue = formatSessionDateValue(start)
            }

            configDatePickerState.rangeDraftStartDate = startValue
            configDatePickerState.rangeDraftEndDate = endValue
            configDatePickerState.rangeActiveField = 'endDate'
            syncSessionDateView(endValue)
            renderConfigDatePickers()
          })
        })

        pageHost.querySelectorAll('[data-config-date-cancel]').forEach((node) => {
          node.addEventListener('click', () => {
            closeConfigDatePicker()
          })
        })

        pageHost.querySelectorAll('[data-config-date-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            if (configDatePickerState.open === 'history') {
              const historyInput = document.getElementById('historyStartDate')
              if (historyInput) {
                historyInput.value = configDatePickerState.singleDraftDate
              }
            }

            if (configDatePickerState.open === 'range') {
              const startInput = document.getElementById('execDateRangeStart')
              const endInput = document.getElementById('execDateRangeEnd')
              const rangeInput = document.getElementById('execDateRange')
              if (startInput && endInput && rangeInput) {
                startInput.value = configDatePickerState.rangeDraftStartDate
                endInput.value = configDatePickerState.rangeDraftEndDate
                rangeInput.value = formatConfigRangeValue(startInput.value, endInput.value)
              }
            }

            closeConfigDatePicker()
          })
        })
      }

      const modelOptions = [
        { label: '埃安 AION', isGroup: true },
        { value: 'AION UT', label: '埃安 UT' },
        { value: 'AION RT', label: '埃安 RT' },
        { value: 'AION Y Plus', label: '埃安 Y Plus' },
        { value: 'AION S Plus', label: '埃安 S Plus' },
        { value: 'AION V Plus', label: '埃安 V Plus' },
        { value: 'AION LX Plus', label: '埃安 LX Plus' },
        { label: '昊铂 Hyper', isGroup: true },
        { value: 'Hyper SSR', label: '埃安 Hyper SSR' },
        { value: 'Hyper GT', label: '埃安 Hyper GT' },
        { value: 'Hyper HT', label: '埃安 Hyper HT' },
        { label: '传祺 Trumpchi', isGroup: true },
        { value: 'E8', label: '传祺 E8' },
        { value: 'E9', label: '传祺 E9' },
        { value: 'ES9', label: '传祺 ES9' },
        { value: 'M8', label: '传祺 M8' },
        { value: 'GS8', label: '传祺 GS8' },
        { value: 'M6', label: '传祺 M6' },
        { value: 'Empow', label: '影豹' },
        { value: 'Emkoo', label: '影酷' },
        { value: 'GS4', label: '传祺 GS4' },
        { value: 'GS3', label: '传祺影速' },
        { value: 'S7', label: '传祺向往 S7' }
      ]

      const scenarioOptions = [
        { value: '邀约', label: '电话邀约' },
        { value: '试驾PDC', label: '试驾 PDC' },
        { value: '到店接待', label: '到店接待' },
        { value: '试乘试驾', label: '试乘试驾' }
      ]

      function normalizeTaskSelection(value) {
        if (Array.isArray(value)) {
          return value.filter(Boolean)
        }

        return value ? [value] : []
      }

      function renderTaskList() {
        const list = document.getElementById('taskList')
        if (!list) {
          return
        }

        const filterModel = taskFilterState.model
        const filterScenario = taskFilterState.scenario

        const filteredTasks = tasks.filter((task) => {
          const taskModels = normalizeTaskSelection(task.model)
          const taskScenarios = normalizeTaskSelection(task.scenario)

          if (filterModel && taskModels.length > 0 && !taskModels.includes(filterModel)) {
            return false
          }

          if (filterScenario && taskScenarios.length > 0 && !taskScenarios.includes(filterScenario)) {
            return false
          }

          return true
        })

        list.innerHTML = filteredTasks
          .map((task) => {
            const taskModels = normalizeTaskSelection(task.model)
            const taskScenarios = normalizeTaskSelection(task.scenario)
            let modelStr = taskModels.join(', ')
            if (modelStr && modelStr.length > 20) {
              modelStr = `${modelStr.substring(0, 20)}...`
            }

            const scenarioStr = taskScenarios.join(', ')
            let taskName = task.taskName || (modelStr ? `${modelStr} ${scenarioStr}` : '未命名任务')
            if (taskName.length > 20) {
              taskName = `${taskName.substring(0, 20)}...`
            }

            return `
              <div class="task-item ${String(task.id) === String(currentTaskId) ? 'active' : ''}" onclick="selectTask(${task.id})">
                <div class="task-title">
                  <span class="task-title-text" title="${task.taskName || ''}">${taskName}${!task.status ? '<span class="draft-tag">草稿</span>' : ''}</span>
                  <span class="task-status-dot ${task.status ? 'on' : 'off'}" aria-hidden="true"></span>
                </div>
                <div class="task-meta-line">
                  更新: ${task.updatedAt ? task.updatedAt.split(' ')[0] : '-'} · 启用: ${task.startTime && task.startTime !== '-' ? task.startTime.split(' ')[0] : '-'}
                </div>
                <div class="task-meta">
                  <span class="task-pill model">车型: ${modelStr || '未指定'}</span>
                  <span class="task-pill scenario">场景: ${scenarioStr || '未指定'}</span>
                </div>
                <div class="task-meta compact">
                  <span class="task-pill count">${task.rules.length} 项规则</span>
                  <span class="task-exec-text">${task.execType === 'continuous' ? '持续执行' : task.execType === 'paused' ? '暂不执行' : '指定范围'}</span>
                  ${task.applyHistory ? '<span class="task-extra-text">含历史</span>' : ''}
                </div>
              </div>
            `
          })
          .join('')
      }

      function renderCustomSelectOptions(containerId, options, isSingleSelect = false) {
        const container = document.getElementById(containerId)
        if (!container) {
          return
        }

        if (containerId === 'modelSelectOptions') {
          container.classList.add('model-select-options')
          const groups = []
          let currentGroup = null

          options.forEach((option) => {
            if (option.isGroup) {
              currentGroup = { label: option.label, options: [] }
              groups.push(currentGroup)
              return
            }

            if (!currentGroup) {
              currentGroup = { label: '', options: [] }
              groups.push(currentGroup)
            }

            currentGroup.options.push(option)
          })

          container.innerHTML = `
            <section class="custom-option-group">
              <div class="custom-option-list">
                <button type="button" class="custom-option custom-option-all" onclick="clearCustomOptions('modelSelectOptions')">
                  <span>全部车型</span>
                </button>
              </div>
            </section>
            ${groups
              .map(
                (group) => `
                  <section class="custom-option-group">
                    ${group.label ? `<div class="custom-optgroup-label">${group.label}</div>` : ''}
                    <div class="custom-option-list">
                      ${group.options
                        .map(
                          (option) => `
                            <div class="custom-option" onclick="toggleCustomOption('${containerId}', '${option.value}')">
                              <input type="checkbox" value="${option.value}">
                              <span>${option.label}</span>
                            </div>
                          `
                        )
                        .join('')}
                    </div>
                  </section>
                `
              )
              .join('')}
          `
          return
        }

        container.classList.remove('model-select-options')

        container.innerHTML = options
          .map((option) => {
            if (option.isGroup) {
              return `<div class="custom-optgroup-label">${option.label}</div>`
            }

            return `
              <div class="custom-option" onclick="toggleCustomOption('${containerId}', '${option.value}', ${isSingleSelect})">
                <input type="${isSingleSelect ? 'radio' : 'checkbox'}" value="${option.value}" ${isSingleSelect ? `name="${containerId}"` : ''}>
                <span>${option.label}</span>
              </div>
            `
          })
          .join('')
      }

      function renderCustomSelects() {
        renderCustomSelectOptions('modelSelectOptions', modelOptions)
        renderCustomSelectOptions('scenarioSelectOptions', scenarioOptions, true)
      }

      function updateCustomSelectTrigger(containerId, triggerId) {
        const container = document.getElementById(containerId)
        const trigger = document.getElementById(triggerId)
        if (!container || !trigger) {
          return
        }

        const checkedValues = Array.from(
          container.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked')
        ).map((input) => (input.nextElementSibling ? input.nextElementSibling.textContent : input.value))

        if (checkedValues.length === 0) {
          trigger.textContent = triggerId.includes('model') ? '全部车型' : '请选择场景...'
          trigger.style.color = 'var(--muted)'
          syncCustomSelectState(containerId)
          return
        }

        if (checkedValues.length > 2) {
          trigger.textContent = `已选择 ${checkedValues.length} 项`
          trigger.style.color = 'var(--text)'
          syncCustomSelectState(containerId)
          return
        }

        trigger.textContent = checkedValues.join(', ')
        trigger.style.color = 'var(--text)'
        syncCustomSelectState(containerId)
      }

      function toggleCustomSelect(id) {
        const element = document.getElementById(id)
        if (!element) {
          return
        }

        const shouldOpen = !element.classList.contains('open')
        document.querySelectorAll('.custom-select-options').forEach((node) => node.classList.remove('open'))
        if (shouldOpen) {
          element.classList.add('open')
        }
      }

      function toggleCustomOption(containerId, value, isSingleSelect = false) {
        const container = document.getElementById(containerId)
        if (!container) {
          return
        }

        const input = container.querySelector(`input[value="${value}"]`)
        if (!input) {
          return
        }

        if (isSingleSelect) {
          container.querySelectorAll('input[type="radio"]').forEach((radio) => {
            radio.checked = false
          })
          input.checked = true
        } else {
          input.checked = !input.checked
        }

        updateCustomSelectTrigger(containerId, containerId.includes('model') ? 'modelSelectTrigger' : 'scenarioSelectTrigger')
      }

      function clearCustomOptions(containerId) {
        const container = document.getElementById(containerId)
        if (!container) {
          return
        }

        container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => {
          input.checked = false
        })
        updateCustomSelectTrigger(containerId, containerId.includes('model') ? 'modelSelectTrigger' : 'scenarioSelectTrigger')
      }

      function syncCustomSelectState(containerId) {
        const container = document.getElementById(containerId)
        if (!container) {
          return
        }

        if (containerId === 'modelSelectOptions') {
          const hasChecked = Boolean(container.querySelector('input[type="checkbox"]:checked'))
          container.querySelector('.custom-option-all')?.classList.toggle('active', !hasChecked)
        }
      }

      function setCustomSelectValues(containerId, values, triggerId) {
        const container = document.getElementById(containerId)
        if (!container) {
          return
        }

        container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((input) => {
          input.checked = values.includes(input.value)
        })
        updateCustomSelectTrigger(containerId, triggerId)
      }

      function getCustomSelectValues(containerId) {
        const container = document.getElementById(containerId)
        if (!container) {
          return []
        }

        return Array.from(
          container.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked')
        ).map((input) => input.value)
      }

      function autoResize(textarea) {
        if (!textarea) {
          return
        }

        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }

      function toggleHistoryDate(enabled, options = {}) {
        const clearValue = options.clearValue ?? !enabled
        const rerender = options.rerender ?? true
        const input = document.getElementById('historyStartDate')
        const trigger = document.getElementById('historyStartDateTrigger')
        if (!input) {
          return
        }

        input.disabled = !enabled
        if (trigger) {
          trigger.disabled = !enabled
        }
        if (!enabled && clearValue) {
          input.value = ''
          configDatePickerState.singleDraftDate = ''
          if (configDatePickerState.open === 'history') {
            configDatePickerState.open = null
          }
        }

        if (rerender) {
          renderConfigDatePickers()
        }
      }

      function toggleDateRange(enabled, options = {}) {
        const clearValue = options.clearValue ?? !enabled
        const rerender = options.rerender ?? true
        const input = document.getElementById('execDateRange')
        const startInput = document.getElementById('execDateRangeStart')
        const endInput = document.getElementById('execDateRangeEnd')
        const trigger = document.getElementById('execDateRangeTrigger')
        if (!input) {
          return
        }

        input.disabled = !enabled
        if (startInput) {
          startInput.disabled = !enabled
        }
        if (endInput) {
          endInput.disabled = !enabled
        }
        if (trigger) {
          trigger.disabled = !enabled
        }
        if (!enabled && clearValue) {
          input.value = ''
          if (startInput) {
            startInput.value = ''
          }
          if (endInput) {
            endInput.value = ''
          }
          configDatePickerState.rangeDraftStartDate = ''
          configDatePickerState.rangeDraftEndDate = ''
          if (configDatePickerState.open === 'range') {
            configDatePickerState.open = null
          }
        }

        if (rerender) {
          renderConfigDatePickers()
        }
      }

      function selectTask(id) {
        currentTaskId = id

        document.querySelectorAll('.task-item').forEach((node) => {
          node.classList.remove('active')
        })

        const task = tasks.find((item) => item.id === id)
        if (!task) {
          return
        }

        document.getElementById('taskEditor').style.display = 'flex'
        document.getElementById('emptyState').style.display = 'none'
        renderCustomSelects()

        document.getElementById('editorTitle').textContent = task.taskName || '编辑任务'
        document.getElementById('taskNameInput').value = task.taskName || ''

        const editorDraftTag = document.getElementById('editorDraftTag')
        if (editorDraftTag) {
          editorDraftTag.style.display = task.status ? 'none' : 'inline-block'
        }

        const deactivateTaskBtn = document.getElementById('deactivateTaskBtn')
        if (deactivateTaskBtn) {
          deactivateTaskBtn.style.display = task.status ? 'inline-block' : 'none'
        }

        const saveDraftBtn = document.getElementById('saveDraftBtn')
        if (saveDraftBtn) {
          saveDraftBtn.style.display = task.status ? 'none' : 'inline-block'
        }

        setCustomSelectValues('modelSelectOptions', normalizeTaskSelection(task.model), 'modelSelectTrigger')
        setCustomSelectValues('scenarioSelectOptions', normalizeTaskSelection(task.scenario), 'scenarioSelectTrigger')

        document.getElementById('lastUpdatedVal').textContent = task.updatedAt || '-'
        document.getElementById('startTimeVal').textContent = task.startTime || '-'

        const historyCheck = document.getElementById('historyDataCheck')
        if (historyCheck) {
          historyCheck.checked = Boolean(task.applyHistory)
        }

        const historyStartDate = document.getElementById('historyStartDate')
        if (historyStartDate) {
          historyStartDate.value = task.historyStartDate || ''
        }

        const execType = task.execType || 'continuous'
        const execTypeRadio = document.querySelector(`input[name="execType"][value="${execType}"]`)
        if (execTypeRadio) {
          execTypeRadio.checked = true
        }
        const execDateRange = document.getElementById('execDateRange')
        if (execDateRange) {
          execDateRange.value = task.dateRange || ''
        }
        const { startDate, endDate } = parseConfigRangeValue(task.dateRange || '')
        const execDateRangeStart = document.getElementById('execDateRangeStart')
        const execDateRangeEnd = document.getElementById('execDateRangeEnd')
        if (execDateRangeStart) {
          execDateRangeStart.value = startDate
        }
        if (execDateRangeEnd) {
          execDateRangeEnd.value = endDate
        }

        const container = document.getElementById('ruleContainer')
        if (container) {
          container.innerHTML = ''
          task.rules.forEach((rule) => addRuleItem(rule.name, rule.desc))
        }

        const roleArea = document.getElementById('promptRole')
        const stepsArea = document.getElementById('promptSteps')
        if (roleArea) {
          roleArea.value = task.promptRole || defaultPromptRole
          autoResize(roleArea)
        }
        if (stepsArea) {
          stepsArea.value = task.promptSteps || defaultPromptSteps
          autoResize(stepsArea)
        }

        updatePromptPreview()
        syncExecutionStrategyControls({ clearValue: false })
        renderTaskList()
      }

      function toggleTaskStatus(taskId, isEnabled) {
        const task = tasks.find((item) => item.id === taskId)
        if (!task) {
          return
        }

        if (isEnabled) {
          if (task.execType === 'paused') {
            openFeedbackModal({
              title: '无法启用任务',
              message: '请先在执行策略中选择“持续执行”或“指定时间范围”，才能启用任务。'
            })
            renderTaskList()
            return
          }
          task.status = true
          task.startTime = task.updatedAt
        } else {
          task.status = false
          task.execType = 'paused'
          const pausedRadio = document.querySelector('input[name="execType"][value="paused"]')
          if (pausedRadio) {
            pausedRadio.checked = true
          }
          toggleDateRange(false)
        }

        const now = new Date()
        task.updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        renderTaskList()
      }

      function createNewTask() {
        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        const newTask = {
          id: Date.now(),
          taskName: `新任务-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`,
          model: [],
          scenario: [],
          status: false,
          updatedAt: timeStr,
          startTime: '-',
          execType: 'continuous',
          applyHistory: false,
          historyStartDate: '',
          rules: [],
          promptRole: defaultPromptRole,
          promptSteps: defaultPromptSteps
        }

        tasks.unshift(newTask)
        currentTaskId = newTask.id
        renderTaskList()
        selectTask(newTask.id)
      }

      function duplicateCurrentTask() {
        const taskToCopy = tasks.find((item) => item.id === currentTaskId)
        if (!taskToCopy) {
          return
        }

        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const newTask = JSON.parse(JSON.stringify(taskToCopy))
        newTask.id = Date.now()
        newTask.taskName = `${newTask.taskName || '未命名任务'} - 副本`
        newTask.status = false
        newTask.updatedAt = timeStr
        newTask.startTime = '-'

        tasks.unshift(newTask)
        renderTaskList()
        selectTask(newTask.id)
        openFeedbackModal({
          title: '任务已复制',
          message: '已复制为草稿任务，可继续编辑后再更新配置。'
        })
      }

      function deleteCurrentTask() {
        if (!currentTaskId) {
          return
        }

        openFeedbackModal({
          title: '删除质检任务',
          message: '确定要删除此质检任务吗？删除后当前配置内容将不可恢复。',
          confirmOnly: false,
          onConfirm: () => {
            tasks = tasks.filter((task) => task.id !== currentTaskId)
            currentTaskId = null
            document.getElementById('taskEditor').style.display = 'none'
            document.getElementById('emptyState').style.display = 'flex'
            renderTaskList()
          }
        })
      }

      function enableTaskConfig() {
        const task = tasks.find((item) => item.id === currentTaskId)
        if (!task) {
          return
        }

        task.taskName = document.getElementById('taskNameInput')?.value || ''

        const currentModelValues = getCustomSelectValues('modelSelectOptions')
        const currentScenarioValue = getCustomSelectValues('scenarioSelectOptions')[0] || ''

        if (!currentScenarioValue) {
          openFeedbackModal({
            title: '缺少适用场景',
            message: '请先选择适用场景后再更新配置。'
          })
          return
        }

        if (currentModelValues.length === 0) {
          openFeedbackModal({
            title: '缺少适用车型',
            message: '请先选择至少一个适用车型后再更新配置。'
          })
          return
        }

        const currentRules = Array.from(document.querySelectorAll('.rule-card'))
        const hasValidRule = currentRules.some((card) => {
          const name = card.querySelector('.rule-input')?.value || ''
          return name.trim().length > 0
        })

        if (currentRules.length === 0 || !hasValidRule) {
          openFeedbackModal({
            title: '缺少质检标准',
            message: '更新配置前，请至少添加并填写一项质检标准。'
          })
          return
        }

        const isDuplicate = tasks.some((candidate) => {
          if (candidate.id === currentTaskId) {
            return false
          }

          if (!candidate.status) {
            return false
          }

          const candidateScenario = normalizeTaskSelection(candidate.scenario)[0] || ''
          const candidateModels = normalizeTaskSelection(candidate.model)
          return candidateScenario === currentScenarioValue && candidateModels.some((model) => currentModelValues.includes(model))
        })

        if (isDuplicate) {
          openFeedbackModal({
            title: '配置重复',
            message: '该场景与车型组合已存在，请调整后再更新配置。'
          })
          return
        }

        const sameComboDraftCount = tasks.filter((candidate) => {
          if (candidate.id === currentTaskId) {
            return false
          }

          if (candidate.status) {
            return false
          }

          const candidateScenario = normalizeTaskSelection(candidate.scenario)[0] || ''
          const candidateModels = normalizeTaskSelection(candidate.model)
          return candidateScenario === currentScenarioValue && candidateModels.some((model) => currentModelValues.includes(model))
        }).length

        task.model = currentModelValues
        task.scenario = currentScenarioValue
        task.applyHistory = false
        task.historyStartDate = ''
        task.execType = 'continuous'
        task.dateRange = ''
        task.promptRole = document.getElementById('promptRole')?.value || defaultPromptRole
        task.promptSteps = document.getElementById('promptSteps')?.value || defaultPromptSteps
        task.rules = currentRules.map((card) => ({
          name: card.querySelector('.rule-input')?.value || '',
          desc: card.querySelector('.rule-textarea')?.value || ''
        }))

        const now = new Date()
        task.updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        task.status = true
        task.startTime = task.updatedAt

        document.getElementById('lastUpdatedVal').textContent = task.updatedAt
        document.getElementById('startTimeVal').textContent = task.startTime

        const editorDraftTag = document.getElementById('editorDraftTag')
        if (editorDraftTag) {
          editorDraftTag.style.display = 'none'
        }

        const deactivateTaskBtn = document.getElementById('deactivateTaskBtn')
        if (deactivateTaskBtn) {
          deactivateTaskBtn.style.display = 'inline-block'
        }

        const saveDraftBtn = document.getElementById('saveDraftBtn')
        if (saveDraftBtn) {
          saveDraftBtn.style.display = 'none'
        }

        renderTaskList()
        updatePromptPreview()
        openFeedbackModal({
          title: '配置已更新',
          message:
            sameComboDraftCount > 0
              ? `当前质检任务已更新为启用状态。\n另有 ${sameComboDraftCount} 条相同场景/车型组合的草稿已保留，未受影响。`
              : '当前质检任务已更新为启用状态。'
        })
      }

      function saveAsDraft() {
        const task = tasks.find((item) => item.id === currentTaskId)
        if (!task) {
          return
        }

        task.taskName = document.getElementById('taskNameInput')?.value || ''
        task.model = getCustomSelectValues('modelSelectOptions')
        task.scenario = getCustomSelectValues('scenarioSelectOptions')[0] || ''
        task.applyHistory = false
        task.historyStartDate = ''
        task.execType = 'continuous'
        task.dateRange = ''
        task.promptRole = document.getElementById('promptRole')?.value || defaultPromptRole
        task.promptSteps = document.getElementById('promptSteps')?.value || defaultPromptSteps
        task.rules = Array.from(document.querySelectorAll('.rule-card')).map((card) => ({
          name: card.querySelector('.rule-input')?.value || '',
          desc: card.querySelector('.rule-textarea')?.value || ''
        }))

        const now = new Date()
        task.updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        task.status = false

        document.getElementById('lastUpdatedVal').textContent = task.updatedAt

        const editorDraftTag = document.getElementById('editorDraftTag')
        if (editorDraftTag) {
          editorDraftTag.style.display = 'inline-block'
        }

        const deactivateTaskBtn = document.getElementById('deactivateTaskBtn')
        if (deactivateTaskBtn) {
          deactivateTaskBtn.style.display = 'none'
        }

        const saveDraftBtn = document.getElementById('saveDraftBtn')
        if (saveDraftBtn) {
          saveDraftBtn.style.display = 'inline-block'
        }

        renderTaskList()
        updatePromptPreview()
        openFeedbackModal({
          title: '草稿已保存',
          message: '当前任务已保存为草稿，后续可继续编辑。'
        })
      }

      function deactivateTask() {
        const task = tasks.find((item) => item.id === currentTaskId)
        if (!task) {
          return
        }

        openFeedbackModal({
          title: '停用质检任务',
          message: '确定要停用此任务吗？停用后该任务将转为草稿状态，不再执行质检。',
          confirmOnly: false,
          onConfirm: () => {
            const now = new Date()
            task.updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
            task.status = false

            document.getElementById('lastUpdatedVal').textContent = task.updatedAt

            const editorDraftTag = document.getElementById('editorDraftTag')
            if (editorDraftTag) {
              editorDraftTag.style.display = 'inline-block'
            }

            const deactivateTaskBtn = document.getElementById('deactivateTaskBtn')
            if (deactivateTaskBtn) {
              deactivateTaskBtn.style.display = 'none'
            }

            const saveDraftBtn = document.getElementById('saveDraftBtn')
            if (saveDraftBtn) {
              saveDraftBtn.style.display = 'inline-block'
            }

            renderTaskList()
            updatePromptPreview()
          }
        })
      }

      function saveCurrentTask() {
        enableTaskConfig()
      }

      function addRuleItem(name = '', desc = '') {
        const container = document.getElementById('ruleContainer')
        if (!container) {
          return
        }

        const wrapper = document.createElement('div')
        wrapper.className = 'rule-card'
        wrapper.innerHTML = `
          <div class="rule-card-head">
            <input type="text" class="rule-input" placeholder="标准名称 (如: 意向车型)" value="${name}" oninput="updatePromptPreview()">
            <button class="text-link" style="color:var(--red);" onclick="this.closest('.rule-card').remove(); updatePromptPreview()">删除</button>
          </div>
          <textarea class="rule-textarea" placeholder="✅ 合格示例：- 您咨询的是哪款车？❌ 不合格示例：仅自我介绍、仅说有什么可以帮您" oninput="updatePromptPreview(); autoResize(this)">${desc}</textarea>
        `
        container.appendChild(wrapper)
        autoResize(wrapper.querySelector('.rule-textarea'))
        updatePromptPreview()
      }

      function updatePromptPreview() {
        const preview = document.getElementById('jsonOutputPreview')
        if (!preview) {
          return
        }

        const rules = {}
        document.querySelectorAll('.rule-card').forEach((card) => {
          const name = card.querySelector('.rule-input')?.value || ''
          if (name) {
            rules[name] = [true, '匹配到的原句或空字符串']
          }
        })

        preview.textContent = JSON.stringify(
          {
            result: rules,
            completion_rate: {
              required_items: Object.keys(rules).length,
              qualified_items: 0,
              qualified_percentage: '0%'
            }
          },
          null,
          2
        )
      }

      function togglePromptModal(show) {
        const modal = document.getElementById('promptModal')
        if (!modal) {
          return
        }

        if (show) {
          modal.classList.add('open')
          setTimeout(() => {
            autoResize(document.getElementById('promptRole'))
            autoResize(document.getElementById('promptSteps'))
          }, 10)
          return
        }

        modal.classList.remove('open')
      }

      function renderFeedbackModalActions() {
        const actions = document.getElementById('feedbackModalActions')
        if (!actions) {
          return
        }

        actions.innerHTML = feedbackModalState.confirmOnly
          ? '<button class="btn-primary" type="button" onclick="resolveFeedbackModal(true)">确定</button>'
          : `
              <button class="btn" type="button" onclick="resolveFeedbackModal(false)">取消</button>
              <button class="btn-primary" type="button" onclick="resolveFeedbackModal(true)">确定</button>
            `
      }

      function openFeedbackModal({ title = '提示', message = '', confirmOnly = true, onConfirm = null }) {
        const modal = document.getElementById('feedbackModal')
        const titleNode = document.getElementById('feedbackModalTitle')
        const messageNode = document.getElementById('feedbackModalMessage')
        if (!modal || !titleNode || !messageNode) {
          return
        }

        feedbackModalState.open = true
        feedbackModalState.confirmOnly = confirmOnly
        feedbackModalState.onConfirm = typeof onConfirm === 'function' ? onConfirm : null
        titleNode.textContent = title
        messageNode.textContent = message
        renderFeedbackModalActions()
        modal.classList.add('open')
      }

      function closeFeedbackModal() {
        const modal = document.getElementById('feedbackModal')
        if (!modal) {
          return
        }

        modal.classList.remove('open')
        feedbackModalState.open = false
        feedbackModalState.onConfirm = null
      }

      function resolveFeedbackModal(confirmed) {
        const onConfirm = feedbackModalState.onConfirm
        closeFeedbackModal()
        if (confirmed && onConfirm) {
          onConfirm()
        }
      }

      function handleFeedbackModalOverlay(event) {
        if (event.target !== event.currentTarget) {
          return
        }

        resolveFeedbackModal(false)
      }

      function initConfigPage() {
        renderTaskFilterMenus()
        renderConfigDatePickers()
        renderTaskList()
      }

      let leadDetailResizeObserver = null
      const customerDetailDefaultSelection = {
        customerName: '郑昱辰',
        customerPhone: '138****2751',
        customerStatus: '有效',
        store: '上海浦东门店',
        lastContact: '2026-03-12 18:14:00',
        aggregateLeadCount: 3,
        aggregateStoreCount: 3,
        aggregateRecordStoreSet: new Set(['上海浦东门店', '杭州滨江门店']),
        aggregateStoreAudioCounts: new Map([
          ['上海浦东门店', 3],
          ['杭州西湖门店', 0],
          ['杭州滨江门店', 1]
        ]),
        aggregateStoreDetails: [
          { name: '上海浦东门店', audioCount: 3, status: '跟进中', updatedAt: '2026-03-15 13:00', tone: 'current' },
          { name: '杭州西湖门店', audioCount: 0, status: '未跟进', updatedAt: '2026-03-10 14:30', tone: 'other' },
          { name: '杭州滨江门店', audioCount: 1, status: '报价沟通', updatedAt: '2026-03-15 10:10', tone: 'extra' }
        ],
        aggregateAudioCount: 4,
        aggregateHasRecordCount: 2,
        recordCoverage: '部分有录音',
        storeRecordCoverage: '部分有录音'
      }
      let customerDetailSelection = { ...customerDetailDefaultSelection }
      const customerAiPortraitState = {
        generated: false,
        generating: false,
        generateTimer: null,
        typingTimer: null,
        typingDone: false,
        lastText: ''
      }
      const salesLeadPhones = {
        dcc: ['138****3021', '137****6208', '136****4821', '135****1906', '139****7742', '188****6435', '150****8294'],
        advisor: ['139****1268', '137****4158', '186****0922', '150****3821', '188****6739', '136****2047']
      }
      const leadDetailTagTones = ['blue', 'green', 'amber', 'violet', 'red']
      const leadDetailCloudTones = ['blue', 'red', 'green', 'violet', 'amber']
      const leadDetailCloudSizes = ['xl', 'lg', 'lg', 'md', 'md', 'sm', 'sm']
      const leadDetailCloudOffsets = ['', ' offset-up', '', ' offset-down', '', ' offset-up', ' offset-down']

      function getLeadDetailSelection() {
        const params = new URLSearchParams(window.location.search)
        return {
          source: params.get('leadSource'),
          id: params.get('leadId'),
          returnView: params.get('leadReturnView')
        }
      }

      function syncLeadDetailBackButton(returnView) {
        const backButton = pageHost.querySelector('.lead-detail-back-button')
        if (!backButton) {
          return
        }

        const fromCustomerView = returnView === 'customers'
        backButton.textContent = fromCustomerView ? '返回客户列表' : '返回线索列表'
        backButton.dataset.leadsViewTarget = fromCustomerView ? 'customers' : 'leads'
      }

      function getCustomerDetailRecordId(customerPhone) {
        const serial = (String(customerPhone || '').replace(/\D/g, '').slice(-4) || '1268').padStart(4, '0')
        return buildMockLeadId(100000 + Number(serial))
      }

      function setCustomerDetailSelection(selection = {}) {
        customerDetailSelection = { ...selection }
      }

      function getCustomerDetailAggregateRecord(selection = customerDetailSelection) {
        const safeSelection = {
          ...customerDetailDefaultSelection,
          ...selection
        }
        const customerPhone = String(safeSelection.customerPhone || '').trim()
        const customerName = String(safeSelection.customerName || '').trim()
        const records = getFilteredLeadCustomerRecords()

        return records.find((item) => {
          const itemPhone = String(item.customerPhone || '').trim()
          const itemName = String(item.customerName || '').trim()
          return customerPhone && customerName
            ? itemPhone === customerPhone && itemName === customerName
            : false
        }) || null
      }

      function buildCustomerDetailPayload(selection = customerDetailSelection) {
        const aggregateRecord = getCustomerDetailAggregateRecord(selection)
        const safeSelection = {
          ...customerDetailDefaultSelection,
          ...selection,
          ...(aggregateRecord || {})
        }
        const isDefaultCustomer = safeSelection.customerName === customerDetailDefaultSelection.customerName
        const storeAudioCounts = safeSelection.aggregateStoreAudioCounts instanceof Map
          ? safeSelection.aggregateStoreAudioCounts
          : new Map([[safeSelection.store, Number(safeSelection.aggregateAudioCount) || 0]])
        const baseStoreBreakdown = Array.isArray(safeSelection.aggregateStoreDetails)
          ? safeSelection.aggregateStoreDetails
          : Array.from(storeAudioCounts.entries()).map(([name, audioCount], index) => ({
              name,
              audioCount,
              status: audioCount > 0 ? safeSelection.customerStatus : '未跟进',
              updatedAt: index === 0 ? safeSelection.lastContact : '—',
              tone: index === 0 ? 'current' : 'other'
            }))
        const defaultDemoStoreDetails = [
          { name: '苏州园区门店', audioCount: 2, status: '需求确认', updatedAt: '2026-03-11 17:20', tone: 'violet' },
          { name: '南京建邺门店', audioCount: 1, status: '方案沟通', updatedAt: '2026-03-10 15:40', tone: 'cyan' },
          { name: '合肥滨湖门店', audioCount: 1, status: '邀约试驾', updatedAt: '2026-03-09 14:15', tone: 'red' },
          { name: '宁波鄞州门店', audioCount: 0, status: '未跟进', updatedAt: '2026-03-08 10:30', tone: 'slate' }
        ]
        const existingStoreNames = new Set(baseStoreBreakdown.map((item) => item.name))
        const rawStoreBreakdown = isDefaultCustomer
          ? [
              ...baseStoreBreakdown,
              ...defaultDemoStoreDetails.filter((item) => !existingStoreNames.has(item.name))
            ]
          : baseStoreBreakdown
        const storeBreakdown = rawStoreBreakdown
          .map((item, originalIndex) => ({ item, originalIndex }))
          .sort((left, right) => {
            const leftHasRecording = Number(left.item.audioCount) > 0
            const rightHasRecording = Number(right.item.audioCount) > 0
            if (leftHasRecording !== rightHasRecording) {
              return leftHasRecording ? -1 : 1
            }

            if (leftHasRecording && rightHasRecording) {
              const updatedAtComparison = String(right.item.updatedAt || '').localeCompare(String(left.item.updatedAt || ''))
              if (updatedAtComparison !== 0) {
                return updatedAtComparison
              }
            }

            return left.originalIndex - right.originalIndex
          })
          .map(({ item }, index) => ({
            ...item,
            filterKey: ['current', 'other', 'extra'].includes(item.tone) ? item.tone : `store-${index + 1}`
          }))
        const recordedStoreCount = isDefaultCustomer
          ? storeBreakdown.filter((item) => Number(item.audioCount) > 0).length
          : safeSelection.aggregateRecordStoreSet instanceof Set
          ? safeSelection.aggregateRecordStoreSet.size
          : storeBreakdown.filter((item) => Number(item.audioCount) > 0).length
        const effectiveStoreCount = isDefaultCustomer
          ? storeBreakdown.length
          : Number(safeSelection.aggregateStoreCount) || 1
        const effectiveAudioCount = isDefaultCustomer
          ? storeBreakdown.reduce((total, item) => total + Math.max(0, Number(item.audioCount) || 0), 0)
          : Number(safeSelection.aggregateAudioCount) || 0
        const effectiveLeadCount = isDefaultCustomer
          ? Math.max(Number(safeSelection.aggregateLeadCount) || 1, storeBreakdown.length)
          : Number(safeSelection.aggregateLeadCount) || 1
        const effectiveRecordedLeadCount = isDefaultCustomer
          ? Math.max(Number(safeSelection.aggregateHasRecordCount) || 0, recordedStoreCount)
          : Number(safeSelection.aggregateHasRecordCount) || 0
        const storeCountText = effectiveStoreCount > 1
          ? `${safeSelection.store} 等 ${effectiveStoreCount} 家门店`
          : safeSelection.store
        const latestRecordedStore = storeBreakdown
          .filter((item) => Number(item.audioCount) > 0)
          .sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')))[0] || null
        const sourceRecords = Array.isArray(aggregateRecord?.aggregateLeadRecords)
          ? aggregateRecord.aggregateLeadRecords
          : leadRecords.filter((item) => getLeadNaturalCustomerKey(item) === getLeadNaturalCustomerKey(safeSelection))
        const recordedLeadRecords = sourceRecords.filter((item) => {
          const recordingCount = Number.isFinite(Number(item.recordingCount))
            ? Math.max(0, Number(item.recordingCount))
            : item.validRecording === '是' ? 1 : 0
          return recordingCount > 0
        })
        const latestRecordedLead = [...recordedLeadRecords].sort((left, right) => parseDateTimeValue(right.recordStartTime) - parseDateTimeValue(left.recordStartTime))[0] || null
        const currentIntentSummary = isDefaultCustomer
          ? '客户本次重点确认总价、金融免息和置换补贴；若成交条件合适，可继续推进。'
          : `本次沟通处于“${latestRecordedStore?.status || safeSelection.customerStatus}”阶段，客户的表达以最近一通可分析录音为准。`
        const currentEvidenceSummary = recordedStoreCount > 0
          ? (isDefaultCustomer
              ? '客户持续询问总价、金融免息和置换补贴，并认可此前试驾后的空间与静谧性表现。'
              : `客户在本次录音中表达的内容，是“${latestRecordedStore?.status || safeSelection.customerStatus}”阶段判断的关键证据。`)
          : '暂无可分析录音，无法展示最近一次录音摘要。'
        const latestRecordingSource = latestRecordedLead
          ? `${latestRecordedLead.store} · ${latestRecordedLead.recordStartTime} · ${latestRecordedLead.stage || latestRecordedLead.leadStatus}`
          : '暂无可分析录音'
        const derivedDialogueTags = [...new Set(recordedLeadRecords.flatMap((item) => [
          item.carSeries,
          item.stage,
          ...(Array.isArray(item.tags) ? item.tags : [])
        ]).filter(Boolean))]
        const dialogueTags = isDefaultCustomer
          ? ['高意向', '价格敏感', '家庭出行', '周末试驾', '决策待推动', '竞品对比', '金融方案诉求', '关注静谧性']
          : derivedDialogueTags.slice(0, 8)
        const storeFilterKeyMap = new Map(storeBreakdown.map((item) => [getLeadDealerCode(item), item.filterKey]))
        const storeNameFilterKeyMap = new Map(storeBreakdown.map((item) => [item.name, item.filterKey]))
        const baseJourneyEntries = recordedLeadRecords.flatMap((item, leadIndex) => {
          const recordingCount = Number.isFinite(Number(item.recordingCount))
            ? Math.max(0, Number(item.recordingCount))
            : item.validRecording === '是' ? 1 : 0
          const dealerCode = getLeadDealerCode(item)
          const filterKey = storeFilterKeyMap.get(dealerCode) || storeNameFilterKeyMap.get(item.store) || 'current'
          const storeDetail = storeBreakdown.find((detail) => detail.filterKey === filterKey)
          const baseTime = Number(parseDateTimeValue(item.recordStartTime))

          return Array.from({ length: recordingCount }, (_, index) => ({
            id: buildMockRecordingId(2000 + leadIndex * 10 + index),
            store: item.store,
            filterKey,
            tone: storeDetail?.tone || '',
            advisorName: item.advisorName,
            time: formatDateTimeValue(new Date(baseTime - index * 60 * 60 * 1000)),
            stage: item.stage || item.leadStatus,
            intentLevel: item.aiIntentLevel || '中',
            intentLevelClass: item.aiIntentLevelClass || 'amber',
            summary: item.summary,
            action: item.action,
            tags: Array.isArray(item.tags) ? item.tags : [],
            sopScore: item.sopScore || '—'
          }))
        })
        const defaultDemoJourneyEntries = isDefaultCustomer
          ? [
              {
                id: buildMockRecordingId(2801),
                store: '苏州园区门店',
                time: '2026-03-11 17:20',
                stage: '需求确认',
                intentLevel: '中',
                advisorName: '周倩',
                summary: '客户补充了七座空间、儿童座椅与长途舒适性需求，希望对比不同配置。',
                action: '整理七座空间与家庭出行配置对比表，引导下一次到店',
                tags: ['七座需求', '家庭出行']
              },
              {
                id: buildMockRecordingId(2802),
                store: '苏州园区门店',
                time: '2026-03-11 16:20',
                stage: '配置对比',
                intentLevel: '中',
                advisorName: '周倩',
                summary: '客户重点对比了智驾、座椅舒适配置与车机功能。',
                action: '发送配置差异清单，并标记客户最关注的功能',
                tags: ['配置对比', '智驾关注']
              },
              {
                id: buildMockRecordingId(2803),
                store: '南京建邺门店',
                time: '2026-03-10 15:40',
                stage: '方案沟通',
                intentLevel: '高',
                advisorName: '吴晨',
                summary: '客户询问金融免息、置换补贴与保险组合，对落地价较敏感。',
                action: '统一各店报价口径，输出可对比的落地方案',
                tags: ['金融方案', '价格敏感']
              },
              {
                id: buildMockRecordingId(2804),
                store: '合肥滨湖门店',
                time: '2026-03-09 14:15',
                stage: '邀约试驾',
                intentLevel: '高',
                advisorName: '许诺',
                summary: '客户愿意周末携家人到店，希望体验二排静谧性与底盘舒适性。',
                action: '确认周末试驾时段，提前准备家庭出行路线',
                tags: ['周末试驾', '静谧性']
              }
            ].map((entry) => {
              const storeDetail = storeBreakdown.find((item) => item.name === entry.store)
              return {
                ...entry,
                filterKey: storeDetail?.filterKey || 'current',
                tone: storeDetail?.tone || '',
                intentLevelClass: entry.intentLevel === '高' ? 'red' : 'amber',
                sopScore: '82%'
              }
            }).filter((entry) => !baseJourneyEntries.some((baseEntry) => baseEntry.store === entry.store && baseEntry.time === entry.time))
          : []
        const journeyEntries = [...baseJourneyEntries, ...defaultDemoJourneyEntries]
          .sort((left, right) => parseDateTimeValue(right.time) - parseDateTimeValue(left.time))

        return {
          leadId: getCustomerDetailRecordId(safeSelection.customerPhone),
          store: storeCountText,
          customer: safeSelection.customerName,
          customerStatus: safeSelection.customerStatus,
          aggregateLeadCount: effectiveLeadCount,
          aggregateStoreCount: effectiveStoreCount,
          aggregateRecordedLeadCount: effectiveRecordedLeadCount,
          aggregateRecordedStoreCount: recordedStoreCount,
          aggregateAudioCount: effectiveAudioCount,
          latestRecordingSource,
          currentIntentSummary,
          currentEvidenceSummary,
          aiIntentLevel: latestRecordedLead?.aiIntentLevel || '—',
          aiIntentCarSeries: latestRecordedLead?.carSeries || '—',
          dialogueTags,
          showDefaultPublicTags: isDefaultCustomer,
          journeyEntries,
          recordCoverage: isDefaultCustomer
            ? getCustomerRecordCoverage(effectiveLeadCount, effectiveRecordedLeadCount)
            : safeSelection.recordCoverage || getCustomerRecordCoverage(effectiveLeadCount, effectiveRecordedLeadCount),
          storeRecordCoverage: isDefaultCustomer
            ? getCustomerRecordCoverage(effectiveStoreCount, recordedStoreCount)
            : safeSelection.storeRecordCoverage || getCustomerRecordCoverage(effectiveStoreCount, recordedStoreCount),
          storeBreakdown,
          subtitle: `${safeSelection.customerPhone} · 关联 ${effectiveLeadCount} 条线索 · 关联 ${effectiveStoreCount} 家门店`,
          currentStoreTitle: `本门店评估 (${safeSelection.store})`,
          currentStoreStatus: `线索状态: ${safeSelection.customerStatus}`,
          otherStoreStatus: `线索状态: ${safeSelection.customerStatus}`,
          currentStoreBadge: safeSelection.store,
          singleStoreName: safeSelection.store,
          mergedProfile: `有两个孩子、重视乘坐舒适性与价格方案的高意向客户，后续应围绕试驾体验、空间优势、金融免息和置换补贴做一致性跟进。`
        }
      }

      function normalizeCustomerStoreName(value) {
        return String(value || '').replace(/\s+/g, '').trim()
      }

      function getCustomerStoreToneFromNode(node) {
        if (!node) {
          return ''
        }
        if (node.classList.contains('customer-journey-filter-btn-current') || node.classList.contains('customer-journey-item-current')) {
          return 'current'
        }
        if (node.classList.contains('customer-journey-filter-btn-other') || node.classList.contains('customer-journey-item-other')) {
          return 'other'
        }
        if (node.classList.contains('customer-journey-filter-btn-extra') || node.classList.contains('customer-journey-item-extra')) {
          return 'extra'
        }
        return ''
      }

      function buildCustomerStoreToneMap() {
        const toneMap = new Map()

        pageHost.querySelectorAll('[data-customer-journey-scope]').forEach((button) => {
          const filterKey = button.dataset.customerJourneyScope
          if (!filterKey || filterKey === 'all') {
            return
          }

          const storeName = normalizeCustomerStoreName(button.dataset.customerJourneyStoreName)
          const tone = getCustomerStoreToneFromNode(button)
          if (storeName && tone) {
            toneMap.set(storeName, tone)
          }
        })

        pageHost.querySelectorAll('.customer-journey-item .customer-journey-store-name').forEach((node) => {
          const storeName = normalizeCustomerStoreName(node.textContent.split('·')[0])
          const tone = getCustomerStoreToneFromNode(node.closest('.customer-journey-item'))
          if (storeName && tone && !toneMap.has(storeName)) {
            toneMap.set(storeName, tone)
          }
        })

        return toneMap
      }

      function syncCustomerIntentionStoreTones() {
        const toneMap = buildCustomerStoreToneMap()

        pageHost.querySelectorAll('[data-customer-store-label]').forEach((node) => {
          const storeName = normalizeCustomerStoreName(node.dataset.customerStoreLabel || node.textContent)
          const textNode = node.querySelector('.customer-store-label-text')
          const tone = toneMap.get(storeName) || ''

          if (textNode) {
            textNode.textContent = node.dataset.customerStoreLabel || textNode.textContent
          }

          if (tone) {
            node.dataset.customerStoreTone = tone
          } else {
            delete node.dataset.customerStoreTone
          }
        })
      }

      function formatCustomerDetailDisplayDateText(value, fallbackYear = '2026') {
        return String(value || '').replace(/(\d{2})\/(\d{2})(?:\s+(\d{2}:\d{2}))?/g, (_, month, day, time = '') => {
          const safeDate = `${fallbackYear}-${month}-${day}`
          return time ? `${safeDate} ${time}` : safeDate
        })
      }

      function syncCustomerDetailDateDisplays() {
        const selectors = [
          '.customer-hero-store-fact span:last-child',
          '.customer-hero-journey-date'
        ]

        selectors.forEach((selector) => {
          pageHost.querySelectorAll(selector).forEach((node) => {
            node.textContent = formatCustomerDetailDisplayDateText(node.textContent)
          })
        })
      }

      function formatJourneyCompactDateTime(value) {
        const text = String(value || '').trim()
        const matched = text.match(/(?:\d{4}[-/])?(\d{2})[-/](\d{2})\s+(\d{2}:\d{2})/)
        return matched ? `${matched[1]}/${matched[2]} ${matched[3]}` : text
      }

      function syncJourneyCompactDateTimes() {
        pageHost.querySelectorAll('.lead-journey-scroll .journey-time, .customer-journey-timeline .journey-time').forEach((node) => {
          node.textContent = formatJourneyCompactDateTime(node.textContent)
        })
      }

      function syncJourneyHeaderWidth(timeline) {
        if (!timeline) {
          return
        }

        const contentWidths = [...timeline.querySelectorAll('.journey-header')].flatMap((header) => (
          [...header.children].map((child) => child.getBoundingClientRect().width)
        ))
        const widestContent = Math.ceil(Math.max(0, ...contentWidths))
        if (widestContent > 0) {
          timeline.style.setProperty('--journey-header-width', `${widestContent}px`)
        }
      }

      function syncCustomerJourneyHeaderWidth() {
        syncJourneyHeaderWidth(pageHost.querySelector('.customer-journey-timeline'))
      }

      function syncLeadJourneyHeaderWidth() {
        syncJourneyHeaderWidth(pageHost.querySelector('.lead-journey-scroll'))
      }

      function getCustomerJourneyLevelMeta(intentLevel) {
        if (intentLevel === '高') return { stepClass: 'is-high', levelClass: 'level-high' }
        if (intentLevel === '低') return { stepClass: 'is-low', levelClass: 'level-low' }
        return { stepClass: 'is-medium', levelClass: 'level-medium' }
      }

      function renderCustomerDetailJourney(payload) {
        const overview = pageHost.querySelector('.customer-hero-flat-timeline')
        const timeline = pageHost.querySelector('.customer-journey-timeline')
        if (!overview || !timeline) {
          return
        }

        const tagTones = ['green', 'blue', 'amber', 'violet']
        overview.innerHTML = payload.journeyEntries.map((entry, index, list) => {
          const levelMeta = getCustomerJourneyLevelMeta(entry.intentLevel)
          const toneClass = entry.tone ? ` customer-hero-flat-store-${entry.tone}` : ''
          return `
            <div class="lead-detail-hero-step customer-hero-flat-step ${levelMeta.stepClass}" data-hero-timeline-step="${escapeHtml(entry.id)}" data-customer-journey-store="${escapeHtml(entry.filterKey)}">
              <div class="lead-detail-hero-step-connector" aria-hidden="true"></div>
              <div class="lead-detail-hero-step-marker customer-hero-flat-marker">${escapeHtml(entry.intentLevel)}</div>
              <div class="lead-detail-hero-step-label customer-hero-flat-stage" title="${escapeHtml(entry.stage)}">${escapeHtml(entry.stage)}</div>
              <div class="customer-hero-flat-store${toneClass}" title="${escapeHtml(entry.store)}">${escapeHtml(entry.store)}</div>
              <div class="lead-detail-hero-step-meta customer-hero-flat-date">${escapeHtml(entry.time.slice(5, 10).replace('-', '/'))}</div>
            </div>
          `
        }).join('')

        timeline.innerHTML = `
          <div class="journey-axis-track" aria-hidden="true"></div>
          ${payload.journeyEntries.map((entry) => {
            const levelMeta = getCustomerJourneyLevelMeta(entry.intentLevel)
            const toneClass = entry.tone ? ` customer-journey-item-${entry.tone}` : ''
            return `
              <article class="journey-item customer-journey-item${toneClass}" data-customer-journey-store="${escapeHtml(entry.filterKey)}">
                <div class="journey-header">
                  <div class="journey-headline">
                    <div class="journey-time">${escapeHtml(entry.time)}</div>
                    <div class="journey-level ${levelMeta.levelClass}">${escapeHtml(entry.stage)}·${escapeHtml(entry.intentLevel)}</div>
                  </div>
                  <div class="journey-call-id">
                    <span class="journey-call-id-label">录音ID</span>
                    <a
                      class="lead-journey-session-link"
                      data-lead-session-link="true"
                      data-session-id="${escapeHtml(entry.id)}"
                      data-session-store="${escapeHtml(entry.store)}"
                      data-session-date="${escapeHtml(entry.time.slice(0, 10).replaceAll('-', '/'))}"
                      data-session-scene="${escapeHtml(entry.stage)}"
                      href="javascript:void(0)"
                    ><span class="journey-call-id-value">${escapeHtml(entry.id)}</span><span class="journey-call-id-arrow" aria-hidden="true"></span></a>
                  </div>
                </div>
                <div class="journey-axis" aria-hidden="true"><span class="journey-axis-dot"></span></div>
                <div class="journey-body">
                  <div class="journey-section">
                    <div class="journey-section-label"><img class="journey-section-icon" src="../assets/journey-summary.svg" alt="" />会话小结</div>
                    <div class="journey-section-content">${escapeHtml(entry.summary)}</div>
                  </div>
                  <div class="journey-section">
                    <div class="journey-section-label"><img class="journey-section-icon" src="../assets/journey-follow.svg" alt="" />策略跟进</div>
                    <div class="journey-section-content">${escapeHtml(entry.action)}</div>
                  </div>
                  <div class="journey-section">
                    <div class="journey-section-label"><img class="journey-section-icon" src="../assets/journey-tags.svg" alt="" />客户标签</div>
                    <div class="journey-tags">
                      ${entry.tags.map((tag, index) => `<span class="tag ${tagTones[index % tagTones.length]}">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                  </div>
                  <div class="customer-journey-store-name customer-journey-store-badge">${escapeHtml(entry.store)} · 顾问：${escapeHtml(entry.advisorName)}</div>
                </div>
              </article>
            `
          }).join('')}
        `
      }

      function applyCustomerDetailPayload(payload) {
        if (!payload) {
          return
        }

        const setText = (selector, value) => {
          const element = pageHost.querySelector(selector)
          if (element && value) {
            element.textContent = value
          }
        }

        setText('#customerDetailHeroTitle', maskDisplayName(payload.customer))
        setText('#customerDetailLeadCount', `关联线索：${payload.aggregateLeadCount}条线索`)
        setText('#customerDetailStoreCount', `关联门店：${payload.aggregateStoreCount}个门店`)
        setText('#customerDetailLeadRecordingCoverage', `线索录音覆盖：${formatCustomerRecordCoverage(payload.recordCoverage, payload.aggregateRecordedLeadCount, payload.aggregateLeadCount)}`)
        setText('#customerDetailStoreRecordingCoverage', `门店录音覆盖：${formatCustomerRecordCoverage(payload.storeRecordCoverage, payload.aggregateRecordedStoreCount, payload.aggregateStoreCount)}`)
        setText('#customerDetailRecordingSummary', `录音总数：${payload.aggregateAudioCount}条`)
        setText('#customerDetailHeroSubtitle', payload.subtitle)
        setText('#customerDetailCurrentStoreTitle', payload.currentStoreTitle)
        setText('#customerDetailCurrentStoreStatus', payload.currentStoreStatus)
        setText('#customerDetailOtherStoreStatus', payload.otherStoreStatus)
        setText('#customerDetailCurrentStoreBadgeLabel', payload.currentStoreBadge)
        const singleStoreLabel = pageHost.querySelector('#customerDetailSingleStoreLabel')
        if (singleStoreLabel) {
          singleStoreLabel.dataset.customerStoreLabel = payload.singleStoreName
          const textNode = singleStoreLabel.querySelector('.customer-store-label-text')
          if (textNode) {
            textNode.textContent = payload.singleStoreName
          }
        }

        const statusNode = pageHost.querySelector('#customerDetailHeroStatus')
        if (statusNode) {
          statusNode.textContent = payload.customerStatus
          statusNode.className = 'pill-inline customer-detail-status-pill'
        }

        const insightScope = pageHost.querySelector('[data-customer-insight-scope]')
        if (insightScope) {
          insightScope.textContent = '汇总当前客户的可分析录音，集中展示对话标签与外部公域标签，便于统一查看客户相关信息。'
        }

        setText('[data-customer-current-intent]', payload.currentIntentSummary)
        setText('[data-customer-current-evidence]', payload.currentEvidenceSummary)
        setText('[data-customer-latest-recording-source]', payload.latestRecordingSource)
        setText('.customer-insight-status-high', `AI意向等级：${payload.aiIntentLevel}`)
        setText('.customer-insight-status-model', `AI意向车系：${payload.aiIntentCarSeries}`)
        const analysisScope = pageHost.querySelector('[data-customer-ai-analysis-scope]')
        if (analysisScope) {
          analysisScope.textContent = `关联${payload.aggregateLeadCount}条线索（其中${payload.aggregateRecordedLeadCount}条有可分析录音）· ${payload.aggregateRecordedStoreCount}家有录音门店 · ${payload.aggregateAudioCount}条可分析录音`
        }

        const dialogueTags = pageHost.querySelector('[data-customer-dialogue-tags]')
        if (dialogueTags) {
          dialogueTags.hidden = payload.aggregateAudioCount <= 0
          const tagList = dialogueTags.querySelector('.customer-insight-tag-list')
          const tagTones = ['tone-blue', 'tone-red', 'tone-green', 'tone-green', 'tone-red', 'tone-amber', 'tone-violet', 'tone-blue']
          if (tagList) {
            const relationshipPaths = Array.from({ length: 9 }, (_, index) => `
              <div class="lead-tag-relationship-path path-${index + 1}" aria-hidden="true">
                <img src="../assets/lead-tag-path-0${index + 1}.svg" alt="" />
              </div>
            `).join('')
            const relationshipTags = payload.dialogueTags.slice(0, 8).map((tag, index) => `
              <span class="lead-relationship-chip ${tagTones[index]} position-${index + 1}">${escapeHtml(tag)}</span>
            `).join('')
            tagList.innerHTML = `${relationshipPaths}${relationshipTags}`
          }
        }

        const publicTags = pageHost.querySelector('.customer-insight-tag-group-public')
        if (publicTags) {
          publicTags.hidden = !payload.showDefaultPublicTags
        }

        const storeCards = pageHost.querySelector('[data-customer-detail-store-cards]')
        if (storeCards) {
          const allStoresCard = `
            <button
              class="customer-voice-store-card customer-voice-store-card-all is-active"
              type="button"
              data-customer-journey-scope="all"
              data-customer-journey-recorded-store-count="${escapeHtml(String(payload.aggregateRecordedStoreCount))}"
              data-customer-journey-store-count="${escapeHtml(String(payload.aggregateStoreCount))}"
              data-customer-journey-audio-count="${escapeHtml(String(payload.aggregateAudioCount))}"
              aria-pressed="true"
            >
              <div class="customer-voice-store-name">全部门店</div>
              <div class="customer-voice-store-count">录音 ${escapeHtml(String(payload.aggregateAudioCount))} 条</div>
              <div class="customer-voice-store-meta">
                <span class="customer-voice-store-status status-all">${escapeHtml(String(payload.aggregateRecordedStoreCount))}/${escapeHtml(String(payload.aggregateStoreCount))} 家有录音</span>
                <span class="customer-voice-store-update">查看完整跨店轨迹</span>
              </div>
            </button>
          `
          const storeCardMarkup = payload.storeBreakdown.map((item, index) => {
            const toneClass = item.tone === 'current'
              ? ' customer-voice-store-card-current'
              : item.tone === 'extra' ? ' customer-voice-store-card-extra' : ''
            const statusClass = Number(item.audioCount) === 0
              ? 'status-none'
              : item.status === '报价沟通' ? 'status-quote' : 'status-tracking'
            const filterKey = item.filterKey || (['current', 'other', 'extra'].includes(item.tone) ? item.tone : `store-${index + 1}`)
            return `
              <button
                class="customer-voice-store-card${toneClass}"
                type="button"
                data-customer-journey-scope="${escapeHtml(filterKey)}"
                data-customer-journey-store-name="${escapeHtml(item.name)}"
                data-customer-journey-audio-count="${escapeHtml(String(item.audioCount))}"
                aria-pressed="false"
              >
                <div class="customer-voice-store-name">${escapeHtml(item.name)}</div>
                <div class="customer-voice-store-count">录音 ${escapeHtml(String(item.audioCount))} 条</div>
                <div class="customer-voice-store-meta">
                  <span class="customer-voice-store-status ${statusClass}">${escapeHtml(item.status)}</span>
                  <span class="customer-voice-store-update">最近更新：${escapeHtml(formatJourneyCompactDateTime(item.updatedAt))}</span>
                </div>
              </button>
            `
          }).join('')
          storeCards.innerHTML = `${allStoresCard}${storeCardMarkup}`
        }

        renderCustomerDetailJourney(payload)

      }

      function getCustomerAiInsightModeMeta(payload = buildCustomerDetailPayload()) {
        const storeCount = Math.max(1, Number(payload.aggregateStoreCount) || 1)
        const leadCount = Math.max(1, Number(payload.aggregateLeadCount) || 1)
        const audioCount = Math.max(0, Number(payload.aggregateAudioCount) || 0)
        const recordedLeadCount = Math.max(0, Number(payload.aggregateRecordedLeadCount) || 0)
        const recordedStoreCount = Math.max(0, Number(payload.aggregateRecordedStoreCount) || 0)
        const unrecordedStoreCount = Math.max(0, storeCount - recordedStoreCount)
        const recordedStoreNames = payload.storeBreakdown
          .filter((item) => Number(item.audioCount) > 0)
          .map((item) => item.name)
        const carSeries = payload.aiIntentCarSeries && payload.aiIntentCarSeries !== '—' ? payload.aiIntentCarSeries : '当前意向车系'

        if (audioCount === 1) {
          return {
            mode: 'single-recording',
            canGenerate: true,
            description: storeCount === 1 && leadCount >= 2
              ? `当前关联1家店，${audioCount}条录音，聚焦单店AI客户洞察分析`
              : '单店客户语音洞察',
            notice: '当前仅有1条可分析录音，综合分析范围与左侧最近录音一致。',
            result: `当前仅有1条可分析录音，综合分析范围与左侧最近录音一致。客户当前关注${carSeries}，最新沟通处于“${payload.customerStatus}”状态。建议结合后续新增录音，持续观察客户诉求、顾虑和决策信号的变化。`
          }
        }

        if (recordedStoreCount >= 2) {
          return {
            mode: 'cross-store-recordings',
            canGenerate: true,
            description: `当前关联${storeCount}家店，${audioCount}条录音，支持AI跨店差异与共性分析`,
            notice: '',
            result: `综合判断：客户围绕${carSeries}在${recordedStoreNames.join('、')}产生了可分析录音，当前最新线索状态为“${payload.customerStatus}”。\n跨店共性：各门店沟通均纳入当前客户的统一分析范围，重复出现的关注点和顾虑作为稳定诉求。\n门店差异：分别比较各有录音门店的沟通阶段、客户表达和跟进重点，不对无录音门店作推断。\n跟进建议：结合最近一次录音与跨店历史证据，统一后续沟通口径。`
          }
        }

        if (recordedStoreCount === 1) {
          const evidenceNotice = unrecordedStoreCount > 0
            ? `另有${unrecordedStoreCount}家关联门店暂无录音证据，暂不进行跨店差异判断。`
            : ''
          const hasMultipleRecordedLeads = recordedLeadCount >= 2
          const singleStoreInsight = `单店客户语音洞察：客户围绕${carSeries}在${recordedStoreNames[0] || '当前门店'}产生了${audioCount}条可分析录音，最新线索状态为“${payload.customerStatus}”。\n跟进重点：建议基于该门店全部录音延续客户已确认的信息，并集中回应当前阶段的诉求和顾虑。`
          const multiContactInsight = hasMultipleRecordedLeads
            ? '\n多次建联变化：该客户至少有2条线索存在录音，需追加分析历次建联中的关注点、顾虑和决策信号变化。'
            : ''
          const insightResult = `${singleStoreInsight}${multiContactInsight}`

          return {
            mode: hasMultipleRecordedLeads ? 'single-store-multiple-leads' : 'single-recorded-store',
            canGenerate: true,
            description: storeCount === 1 && leadCount >= 2
              ? `当前关联1家店，${audioCount}条录音，聚焦单店AI客户洞察分析`
              : '单店客户语音洞察',
            notice: evidenceNotice,
            result: `${evidenceNotice ? `${evidenceNotice}\n` : ''}${insightResult}`
          }
        }

        return {
          mode: 'no-recordings',
          canGenerate: false,
          description: '暂无录音证据',
          notice: `当前关联的${storeCount}家门店均暂无录音，暂无法生成AI语音洞察。`,
          result: ''
        }
      }

      function getCustomerAiPortraitPreviewHtml(payload = buildCustomerDetailPayload()) {
        const modeMeta = getCustomerAiInsightModeMeta(payload)

        if (!modeMeta.canGenerate) {
          return `
            <div class="customer-ai-empty-state" role="status">
              <strong>${escapeHtml(modeMeta.description)}</strong>
              <span>${escapeHtml(modeMeta.notice)}</span>
            </div>
          `
        }

        return `
          <div class="customer-ai-preview-copy">
            <span class="customer-insight-ai-description">${escapeHtml(modeMeta.description)}</span>
            ${modeMeta.notice ? `<span class="customer-ai-evidence-notice">${escapeHtml(modeMeta.notice)}</span>` : ''}
          </div>
          <button class="customer-ai-generate-primary" type="button" data-customer-ai-generate>立即生成</button>
        `
      }

      function getCustomerAiPortraitGeneratedText(payload = buildCustomerDetailPayload()) {
        return getCustomerAiInsightModeMeta(payload).result
      }

      function clearCustomerAiPortraitTypingTimer() {
        if (!customerAiPortraitState.typingTimer) {
          return
        }

        window.clearInterval(customerAiPortraitState.typingTimer)
        customerAiPortraitState.typingTimer = null
      }

      function renderCustomerAiPortraitStatic(panel, text) {
        if (!panel) {
          return
        }

        panel.classList.add('is-generated')
        panel.innerHTML = `
          <div class="customer-ai-result">
            <div class="customer-ai-generated-copy">${escapeHtml(text)}</div>
            <button class="customer-ai-regenerate" type="button" data-customer-ai-generate>重新生成</button>
          </div>
        `
        setCustomerInsightRobotPlayback(false)
      }

      function startCustomerAiPortraitTyping(panel, text) {
        if (!panel) {
          return
        }

        clearCustomerAiPortraitTypingTimer()

        const fullText = String(text || '')
        let visibleLength = 0
        customerAiPortraitState.typingDone = false
        customerAiPortraitState.lastText = fullText

        if (!fullText) {
          renderCustomerAiPortraitStatic(panel, '')
          customerAiPortraitState.typingDone = true
          return
        }

        const step = () => {
          if (!document.body.contains(panel)) {
            clearCustomerAiPortraitTypingTimer()
            customerAiPortraitState.typingDone = false
            return
          }

          panel.classList.add('is-generated')
          visibleLength = Math.min(fullText.length, visibleLength + 1)
          panel.innerHTML = `
            <div class="customer-ai-result">
              <div class="customer-ai-generated-copy-typing">${escapeHtml(fullText.slice(0, visibleLength))}<span class="customer-ai-typing-caret" aria-hidden="true"></span></div>
            </div>
          `

          if (visibleLength >= fullText.length) {
            clearCustomerAiPortraitTypingTimer()
            customerAiPortraitState.typingDone = true
            renderCustomerAiPortraitStatic(panel, fullText)
          }
        }

        step()
        if (visibleLength < fullText.length) {
          customerAiPortraitState.typingTimer = window.setInterval(step, 26)
        }
      }

      function renderCustomerAiPortraitGeneration() {
        const panel = pageHost.querySelector('.customer-ai-generate-panel')
        if (!panel) {
          return
        }

        const payload = buildCustomerDetailPayload()
        const modeMeta = getCustomerAiInsightModeMeta(payload)
        const portraitText = getCustomerAiPortraitGeneratedText(payload)

        if (!modeMeta.canGenerate) {
          resetCustomerAiPortraitGeneration()
          panel.classList.remove('is-generated')
          panel.innerHTML = getCustomerAiPortraitPreviewHtml(payload)
          setCustomerInsightRobotPlayback(false)
          return
        }

        if (customerAiPortraitState.generated) {
          if (customerAiPortraitState.typingDone && customerAiPortraitState.lastText === portraitText) {
            renderCustomerAiPortraitStatic(panel, portraitText)
          } else {
            startCustomerAiPortraitTyping(panel, portraitText)
          }
          return
        }

        panel.classList.remove('is-generated')

        if (customerAiPortraitState.generating) {
          panel.innerHTML = `
            <div class="customer-ai-generate-loading" aria-live="polite" role="status">
              <span class="customer-ai-loading-spinner" aria-hidden="true"></span>
              <span>正在读取关联录音并生成语音洞察...</span>
            </div>
          `
          return
        }

        panel.innerHTML = getCustomerAiPortraitPreviewHtml(payload)
      }

      function resetCustomerAiPortraitGeneration() {
        if (customerAiPortraitState.generateTimer) {
          window.clearTimeout(customerAiPortraitState.generateTimer)
        }
        clearCustomerAiPortraitTypingTimer()
        customerAiPortraitState.generated = false
        customerAiPortraitState.generating = false
        customerAiPortraitState.generateTimer = null
        customerAiPortraitState.typingDone = false
        customerAiPortraitState.lastText = ''
      }

      function setCustomerInsightRobotPlayback(isPlaying) {
        const robotImage = pageHost.querySelector('.customer-insight-robot')
        const robotVideo = pageHost.querySelector('.customer-insight-robot-video')

        if (!robotImage || !robotVideo) {
          return
        }

        if (!isPlaying) {
          robotVideo.pause()
          robotVideo.currentTime = 0
          robotVideo.hidden = true
          robotImage.hidden = false
          return
        }

        robotImage.hidden = true
        robotVideo.hidden = false
        robotVideo.currentTime = 0

        const playResult = robotVideo.play()
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(() => {
            setCustomerInsightRobotPlayback(false)
          })
        }
      }

      function startCustomerAiPortraitGenerationFlow() {
        if (!getCustomerAiInsightModeMeta().canGenerate) {
          renderCustomerAiPortraitGeneration()
          return
        }

        if (customerAiPortraitState.generated || customerAiPortraitState.generating) {
          return
        }

        clearCustomerAiPortraitTypingTimer()
        customerAiPortraitState.generated = false
        customerAiPortraitState.generating = true
        customerAiPortraitState.typingDone = false
        customerAiPortraitState.lastText = ''
        renderCustomerAiPortraitGeneration()

        if (customerAiPortraitState.generateTimer) {
          window.clearTimeout(customerAiPortraitState.generateTimer)
        }

        customerAiPortraitState.generateTimer = window.setTimeout(() => {
          customerAiPortraitState.generating = false
          customerAiPortraitState.generated = true
          customerAiPortraitState.generateTimer = null
          if (getCurrentRoute() === 'customer-detail') {
            renderCustomerAiPortraitGeneration()
          }
        }, 3000)
      }

      function bindCustomerAiPortraitGeneration() {
        const panel = pageHost.querySelector('.customer-ai-generate-panel')
        const robotVideo = pageHost.querySelector('.customer-insight-robot-video')
        if (!panel) {
          return
        }

        if (robotVideo) {
          robotVideo.addEventListener('ended', () => {
            const insightOutputInProgress = customerAiPortraitState.generating
              || (customerAiPortraitState.generated && !customerAiPortraitState.typingDone)
            if (insightOutputInProgress) {
              setCustomerInsightRobotPlayback(true)
              return
            }
            setCustomerInsightRobotPlayback(false)
          })
          robotVideo.addEventListener('error', () => {
            setCustomerInsightRobotPlayback(false)
          })
        }

        panel.addEventListener('click', (event) => {
          const generateButton = event.target.closest('[data-customer-ai-generate]')
          if (!generateButton) {
            return
          }
          setCustomerInsightRobotPlayback(true)
          if (customerAiPortraitState.generated) {
            resetCustomerAiPortraitGeneration()
          }
          startCustomerAiPortraitGenerationFlow()
        })
      }

      function initCustomerJourneyFilter() {
        const board = pageHost.querySelector('.customer-journey-board')
        const timeline = board?.querySelector('.customer-journey-timeline')
        const overview = pageHost.querySelector('.customer-hero-flat-timeline')
        const evolutionContainer = pageHost.querySelector('.customer-detail-journey-evolution')
        const scopeCards = Array.from(pageHost.querySelectorAll('[data-customer-journey-scope]'))
        const items = Array.from(pageHost.querySelectorAll('[data-customer-journey-store]'))
        const detailItems = items.filter((item) => item.classList.contains('customer-journey-item'))
        const overviewSteps = items.filter((item) => item.classList.contains('customer-hero-flat-step'))
        const emptyState = board?.querySelector('[data-customer-journey-empty]')
        const emptyTitle = emptyState?.querySelector('[data-customer-journey-empty-title]')

        if (!board || !timeline || !overview || scopeCards.length === 0 || detailItems.length === 0) {
          return
        }

        const timeSortedItems = [...detailItems]
          .map((item, index) => ({
            item,
            index,
            time: parseDateTimeValue(item.querySelector('.journey-time')?.textContent.trim() || '1970-01-01 00:00')
          }))
          .sort((left, right) => {
            const diff = right.time - left.time
            return diff !== 0 ? diff : left.index - right.index
          })
          .map(({ item }) => item)
        let selectedScope = 'all'

        const applyFilter = () => {
          timeSortedItems.forEach((item) => {
            timeline.appendChild(item)
          })

          scopeCards.forEach((card) => {
            const isActive = (card.dataset.customerJourneyScope || 'all') === selectedScope
            card.classList.toggle('is-active', isActive)
            card.setAttribute('aria-pressed', String(isActive))
          })

          const recordedScopeKeys = new Set(scopeCards
            .filter((card) => (card.dataset.customerJourneyScope || 'all') !== 'all')
            .filter((card) => Number(card.dataset.customerJourneyAudioCount) > 0)
            .map((card) => card.dataset.customerJourneyScope))

          detailItems.forEach((item) => {
            const filterKey = item.dataset.customerJourneyStore || ''
            const shouldHide = !recordedScopeKeys.has(filterKey)
              || (selectedScope !== 'all' && selectedScope !== filterKey)
            item.hidden = shouldHide
          })

          overviewSteps.forEach((step) => {
            const filterKey = step.dataset.customerJourneyStore || ''
            step.hidden = !recordedScopeKeys.has(filterKey)
              || (selectedScope !== 'all' && selectedScope !== filterKey)
          })

          const activeCard = scopeCards.find((card) => (card.dataset.customerJourneyScope || 'all') === selectedScope) || scopeCards[0]
          const storeName = activeCard.dataset.customerJourneyStoreName || '全部门店'
          const visibleDetailCount = detailItems.filter((item) => !item.hidden).length
          const visibleStepCount = overviewSteps.filter((step) => !step.hidden).length

          overview.style.setProperty('--customer-journey-step-count', String(Math.max(visibleStepCount, 1)))
          overview.classList.toggle('is-single-step', visibleStepCount <= 1)
          if (evolutionContainer) {
            evolutionContainer.hidden = visibleStepCount === 0
            window.requestAnimationFrame(() => evolutionContainer._syncEvolutionLayout?.())
          } else {
            overview.hidden = visibleStepCount === 0
          }
          timeline.hidden = visibleDetailCount === 0
          if (emptyState) {
            emptyState.hidden = visibleDetailCount > 0
          }
          if (emptyTitle) {
            emptyTitle.textContent = `${storeName}暂无录音`
          }
        }

        scopeCards.forEach((card) => {
          card.addEventListener('click', () => {
            selectedScope = card.dataset.customerJourneyScope || 'all'
            applyFilter()
          })
        })

        applyFilter()
      }

      function initCustomerHeroJourneyToggle() {
        const journeyList = pageHost.querySelector('.customer-hero-journeys')
        if (!journeyList) {
          return
        }

        const rows = Array.from(journeyList.querySelectorAll(':scope > .customer-hero-journey-row'))
        const moreWrap = journeyList.querySelector('.customer-hero-more')
        const moreButton = journeyList.querySelector('.customer-hero-more-btn')
        const moreCopy = journeyList.querySelector('.customer-hero-more-copy')
        const moreCount = journeyList.querySelector('.customer-hero-more-count')

        if (!moreWrap || !moreButton || rows.length <= 2) {
          journeyList.classList.remove('has-extra', 'is-collapsed')
          if (moreWrap) {
            moreWrap.hidden = true
          }
          return
        }

        journeyList.classList.add('has-extra', 'is-collapsed')
        moreWrap.hidden = false

        const updateToggle = () => {
          const isCollapsed = journeyList.classList.contains('is-collapsed')
          moreButton.setAttribute('aria-expanded', String(!isCollapsed))
          if (moreCopy) {
            moreCopy.textContent = isCollapsed ? '展开查看更多' : '收起'
          }
          if (moreCount) {
            moreCount.textContent = isCollapsed ? `共 ${rows.length} 家门店` : ''
          }
        }

        moreButton.addEventListener('click', () => {
          journeyList.classList.toggle('is-collapsed')
          updateToggle()
        })

        updateToggle()
      }

      function initCustomerDemoModeSwitcher() {
        const pageContainer = pageHost.querySelector('.customer-detail-page')
        const buttons = pageHost.querySelectorAll('[data-customer-demo-mode]')
        const recordedStatValue = pageHost.querySelector('[data-stat-key="recorded_leads"]')
        if (!pageContainer || !buttons.length) return

        buttons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const mode = btn.dataset.customerDemoMode
            buttons.forEach((b) => b.classList.remove('active'))
            btn.classList.add('active')
            pageContainer.setAttribute('data-customer-view-state', mode)

            if (recordedStatValue) {
              recordedStatValue.textContent = mode === 'no-recording' ? '0' : '3'
            }
          })
        })
      }

      function initCustomerDetailPage() {
        const customerPayload = buildCustomerDetailPayload()
        applyCustomerDetailPayload(customerPayload)
        syncCustomerDetailDateDisplays()
        initCustomerJourneyFilter()
        syncJourneyCompactDateTimes()
        syncCustomerJourneyHeaderWidth()
        window.requestAnimationFrame(syncCustomerJourneyHeaderWidth)
        bindCustomerStoreEvolutionUI()
        bindCustomerDetailEvolutionUI()
        bindLeadDetailSessionLinks(customerPayload)
        syncCustomerIntentionStoreTones()
        initCustomerHeroJourneyToggle()
        renderCustomerAiPortraitGeneration()
        bindCustomerAiPortraitGeneration()
        initCustomerDemoModeSwitcher()
      }

      function destroyCustomerDetailPage() {
        resetCustomerAiPortraitGeneration()
      }

      function getSalesLeadCollection(role) {
        if (role === 'dcc') {
          return dccDashboard.leads
        }

        if (role === 'advisor') {
          return advisorDashboard.leads
        }

        if (role === 'leads') {
          return leadRecords
        }

        return []
      }

      function getLeadDetailLead(leadId, role) {
        if (!leadId || !role) {
          return null
        }

        return getSalesLeadCollection(role).find((lead) => lead.id === leadId) || null
      }

      function getLeadDetailRoleMeta(role) {
        return role === 'advisor' ? currentAdvisor : currentDcc
      }

      function getLeadDetailPhone(leadId, role) {
        const leads = getSalesLeadCollection(role)
        const leadIndex = leads.findIndex((lead) => lead.id === leadId)
        const phonePool = salesLeadPhones[role] || []
        return phonePool[leadIndex] || '139****1268'
      }

      function getLeadDetailRecordId(leadId, role) {
        if (/^\d{19}$/.test(String(leadId || ''))) {
          return String(leadId)
        }
        const leads = getSalesLeadCollection(role)
        const leadIndex = leads.findIndex((lead) => lead.id === leadId)
        const roleOffset = role === 'advisor' ? 100 : 0
        return buildMockLeadId(3000 + roleOffset + (leadIndex >= 0 ? leadIndex : 0))
      }

      function getLeadDetailUniqueTags(lead) {
        const values = [
          `${lead.intent}级${lead.qcScene}`,
          lead.stage,
          lead.source,
          ...(Array.isArray(lead.tags) ? lead.tags : [])
        ].filter(Boolean)

        return [...new Set(values)]
      }

      function normalizeLeadDetailSceneLabel(scene, role) {
        if (scene === '进店接待' || scene === '接待') {
          return '到店接待'
        }
        if (scene === '试驾前确认') {
          return '试驾PDC'
        }
        if (scene === '试驾邀约' || scene === '电话邀约') {
          return '邀约'
        }
        if (scene) {
          return scene
        }

        return role === 'advisor' ? '到店接待' : '邀约'
      }

      function getLeadDetailIntentLevelText(intent) {
        if (intent === 'H' || intent === 'A') {
          return '高'
        }
        if (intent === 'B') {
          return '中'
        }
        return '低'
      }

      function getLeadDetailEvolutionBaseDate(value) {
        const normalized = String(value || '').slice(0, 16)
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
          return parseDateTimeValue(normalized)
        }
        return parseDateTimeValue('2026-03-13 16:00')
      }

      function formatLeadDetailEvolutionDate(date) {
        return `${padNumber(date.getMonth() + 1)}/${padNumber(date.getDate())}`
      }

      function buildLeadDetailEvolutionSteps(lead, role) {
        const baseDate = getLeadDetailEvolutionBaseDate(lead.updatedAt)

        if (lead.isMultiNodeJourneyDemo) {
          const steps = []
          for (let i = 0; i < 21; i += 1) {
            const date = new Date(baseDate)
            date.setDate(date.getDate() - (20 - i))
            const level = i % 3 === 0 ? '高' : i % 3 === 1 ? '中' : '低'
            steps.push({
              label: `节点${i + 1}`,
              meta: `${formatLeadDetailEvolutionDate(date)}`,
              level
            })
          }
          return steps
        }

        const inviteDate = new Date(baseDate)
        inviteDate.setDate(inviteDate.getDate() - 3)

        return [
          {
            label: '邀约',
            meta: `${formatLeadDetailEvolutionDate(inviteDate)}`,
            level: '高'
          },
          {
            label: '到店接待',
            meta: `${formatLeadDetailEvolutionDate(baseDate)}`,
            level: '中'
          },
          {
            label: '试驾',
            meta: `${formatLeadDetailEvolutionDate(baseDate)}`,
            level: '高'
          }
        ]
      }

      function buildLeadDetailPayload(lead, role) {
        const roleMeta = getLeadDetailRoleMeta(role)
        const phone = getLeadDetailPhone(lead.id, role)
        const tags = getLeadDetailUniqueTags(lead)
        const advisorName = lead.advisorName || lead.owner || roleMeta.name || '郭芹'
        const sceneLabel = normalizeLeadDetailSceneLabel(lead.qcScene, role)
        const lastTouchTime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(lead.updatedAt || '')
          ? `${lead.updatedAt}:00`
          : (lead.updatedAt || '待确认')

        return {
          leadId: getLeadDetailRecordId(lead.id, role),
          store: lead.store || roleMeta.store,
          advisorName,
          leadStatus: lead.leadStatus || getLeadStatusFromStage(lead.stage),
          customer: lead.customer,
          lastTouchTime,
          subtitle: `${phone} · ${lead.model}`,
          heroTags: [],
          intentLevel: '中',
          models: ['N60'],
          intentText: lead.summary,
          evidenceText: `来源 ${lead.source}；当前阶段为“${lead.stage}”；质检场景为“${sceneLabel}”；客户标签包括 ${tags.slice(0, 3).join('、')}；客户表示“再考虑一下”。`,
          evolutionSteps: buildLeadDetailEvolutionSteps(lead, role),
          actionText: lead.action,
          reminderBadge: lead.followUpTime ? '需要二次跟进' : '持续跟进',
          reminderTime: lead.followUpTime || '待确认',
          conversationTags: ['高意向', '价格敏感', '家庭出行', '金融方案诉求', '关注静谧性', '周末试驾', '竞品对比', '决策待推动'],
          publicProfile: {
            highlights: [
              { label: '高意向', tone: 'blue', icon: '../assets/lead-tag-public-intent.svg' },
              { label: '2档消费', tone: 'red', icon: '../assets/lead-tag-public-consumption.svg' },
              { label: '广东省广州市番禺区', tone: 'green', icon: '../assets/lead-tag-public-location.svg' }
            ],
            attributes: [
              { label: '男', tone: 'blue', icon: '../assets/lead-tag-public-gender.svg' },
              { label: '年龄', tone: 'red', icon: '../assets/lead-tag-public-age.svg' },
              { label: '本科', tone: 'green', icon: '../assets/lead-tag-public-education.svg' },
              { label: '资深白领', tone: 'violet', icon: '../assets/lead-tag-public-career.svg' },
              { label: '有车', tone: 'amber', icon: '../assets/lead-tag-public-car.svg' },
              { label: '新能源', tone: 'blue', icon: '../assets/lead-tag-public-new-energy.svg' },
              { label: '科技爱好者', tone: 'red', icon: '../assets/lead-tag-public-tech.svg' }
            ]
          }
        }
      }

      function renderLeadDetailHeroTags(tags) {
        return tags.map((tag, index) => `<div class="tag ${leadDetailTagTones[index % leadDetailTagTones.length]}">${escapeHtml(tag)}</div>`).join('')
      }

      function renderLeadDetailModelTags(models) {
        return models.map((model) => `<span class="intention-model-chip">AI意向车系：${escapeHtml(model)}</span>`).join('')
      }

      function isLeadDetailModelTag(tag) {
        return /^(传祺|埃安|昊铂)/.test(String(tag || '').trim())
      }

      function getLeadDetailLatestJourneyModels(fallbackModels = []) {
        const latestJourneyCard = pageHost.querySelector('.lead-journey-scroll .journey-item')
        if (!latestJourneyCard) {
          return fallbackModels
        }

        const modelTags = [...latestJourneyCard.querySelectorAll('.journey-tags .tag')]
          .map((node) => node.textContent.trim())
          .filter((tag) => isLeadDetailModelTag(tag))

        return modelTags.length ? [...new Set(modelTags)] : fallbackModels
      }

      function syncLeadDetailModelRow(fallbackModels = [], usePayloadModels = false) {
        const modelRow = pageHost.querySelector('#leadDetailModelRow')
        if (!modelRow) {
          return
        }

        const models = usePayloadModels ? fallbackModels : getLeadDetailLatestJourneyModels(fallbackModels)
        modelRow.innerHTML = renderLeadDetailModelTags(models)
      }

      function renderLeadDetailCloudTags(tags) {
        return tags.map((tag, index) => {
          const tone = leadDetailCloudTones[index % leadDetailCloudTones.length]
          const size = leadDetailCloudSizes[Math.min(index, leadDetailCloudSizes.length - 1)]
          const offset = leadDetailCloudOffsets[index % leadDetailCloudOffsets.length]
          return `<span class="lead-cloud-term ${tone} ${size}${offset}"><span class="lead-cloud-term-copy">${escapeHtml(tag)}</span></span>`
        }).join('')
      }

      function renderLeadDetailConversationMap(tags) {
        const positions = [1, 2, 3, 7, 8, 4, 6, 5]
        const tones = ['blue', 'red', 'green', 'violet', 'blue', 'green', 'amber', 'red']
        const paths = Array.from({ length: 9 }, (_, index) => {
          const number = String(index + 1).padStart(2, '0')
          return `<div class="lead-tag-relationship-path path-${index + 1}" aria-hidden="true"><img src="../assets/lead-tag-path-${number}.svg" alt="" /></div>`
        }).join('')
        const tagMarkup = tags.map((tag, index) => {
          return `<span class="lead-relationship-chip tone-${tones[index]} position-${positions[index]}">${escapeHtml(tag)}</span>`
        }).join('')

        return `${paths}${tagMarkup}`
      }

      function renderLeadDetailPublicProfile(profile) {
        const highlights = (profile?.highlights || []).map((item) => {
          return `<div class="lead-public-highlight tone-${escapeHtml(item.tone)}"><img class="lead-public-highlight-icon" src="${escapeHtml(item.icon)}" alt="" aria-hidden="true" /><strong>${escapeHtml(item.label)}</strong></div>`
        }).join('')
        const attributes = (profile?.attributes || []).map((item) => {
          return `<span class="lead-public-attribute tone-${escapeHtml(item.tone)}"><img src="${escapeHtml(item.icon)}" alt="" aria-hidden="true" />${escapeHtml(item.label)}</span>`
        }).join('')

        return `<div class="lead-public-profile-highlights">${highlights}</div><div class="lead-public-profile-divider" aria-hidden="true"><img src="../assets/lead-tag-public-divider.svg" alt="" /></div><div class="lead-public-profile-attributes">${attributes}</div>`
      }

      function renderLeadDetailIntentList(value) {
        const sentences = String(value || '')
          .split('。')
          .map((sentence) => sentence.trim())
          .filter(Boolean)

        return `<ul class="lead-detail-intent-list">${sentences
          .map((sentence) => `<li>${escapeHtml(sentence)}。</li>`)
          .join('')}</ul>`
      }

      function renderLeadDetailEvidenceText(value) {
        const text = String(value || '')
        const pattern = /([“"])再考虑一下([”"])/g
        let html = ''
        let lastIndex = 0
        let match = pattern.exec(text)

        while (match) {
          html += escapeHtml(text.slice(lastIndex, match.index))
          html += `${escapeHtml(match[1])}<strong class="lead-detail-evidence-alert">再考虑一下</strong>${escapeHtml(match[2])}`
          lastIndex = pattern.lastIndex
          match = pattern.exec(text)
        }

        return html + escapeHtml(text.slice(lastIndex))
      }

      function applyLeadDetailTagCloudFit(cloud, scale = 1) {
        const safeScale = Math.max(0.62, Math.min(scale, 1))
        cloud.style.setProperty('--lead-cloud-size-xl', `${(26 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-lg', `${(21 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-md', `${(17 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-size-sm', `${Math.max(11, 13 * safeScale).toFixed(2)}px`)
        cloud.style.setProperty('--lead-cloud-gap-y', `${Math.max(8, Math.round(12 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-gap-x', `${Math.max(10, Math.round(16 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-pad-top', `${Math.max(10, Math.round(20 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-pad-x', `${Math.max(3, Math.round(6 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-pad-bottom', `${Math.max(6, Math.round(12 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-offset-up', `${Math.min(-2, Math.round(-4 * safeScale))}px`)
        cloud.style.setProperty('--lead-cloud-offset-down', `${Math.max(2, Math.round(4 * safeScale))}px`)
      }

      function syncLeadDetailSingleTagCloudLayout(cloud) {
        const terms = [...cloud.querySelectorAll('.lead-cloud-term')]
        if (!terms.length) {
          return
        }

        applyLeadDetailTagCloudFit(cloud, 1)

        const maxHeight = cloud.clientHeight
        const maxWidth = cloud.clientWidth
        if (!maxHeight || !maxWidth) {
          return
        }

        const fits = () => cloud.scrollHeight <= maxHeight + 1 && cloud.scrollWidth <= maxWidth + 1
        if (fits()) {
          return
        }

        let low = 0.62
        let high = 1
        let best = 0.62

        for (let index = 0; index < 10; index += 1) {
          const mid = Number(((low + high) / 2).toFixed(3))
          applyLeadDetailTagCloudFit(cloud, mid)

          if (fits()) {
            best = mid
            low = mid
          } else {
            high = mid
          }
        }

        applyLeadDetailTagCloudFit(cloud, best)
      }

      function syncLeadDetailTagCloudLayout() {
        pageHost.querySelectorAll('[data-lead-detail-tag-cloud]').forEach((cloud) => {
          syncLeadDetailSingleTagCloudLayout(cloud)
        })
      }

      function renderLeadDetailEvolutionSteps(steps) {
        const getLevelText = (step) => {
          if (step && step.level) {
            return step.level
          }

          const meta = String(step?.meta || '')
          if (meta.includes('·')) {
            return meta.split('·').pop().trim() || '中'
          }

          return '中'
        }

        const getLevelTone = (level) => {
          if (level === '高') return 'red'
          if (level === '低') return 'blue'
          return 'amber'
        }

        return (steps || []).map((step, index, list) => `
          <div class="lead-detail-hero-step${index < list.length - 1 ? ' is-complete' : ''}${index === list.length - 1 ? ' is-current' : ''}">
            ${index < list.length - 1 ? '<div class="lead-detail-hero-step-connector" aria-hidden="true"></div>' : ''}
            <div class="lead-detail-hero-step-marker tone-${getLevelTone(getLevelText(step))}">${escapeHtml(getLevelText(step))}</div>
            <div class="lead-detail-hero-step-label" tabindex="0" title="${escapeHtml(step.label || '-')}" aria-label="${escapeHtml(step.label || '-')}">${escapeHtml(step.label || '-')}</div>
            <div class="lead-detail-hero-step-meta">${escapeHtml(step.meta || '')}</div>
          </div>
        `).join('')
      }

      function bindJourneyEvolutionUI(container, track, options = {}) {
        if (!container || !track) return

        const evolution = container.querySelector('.lead-detail-hero-evolution')
        if (!evolution) return

        const itemSelector = options.itemSelector || '.lead-detail-hero-step'
        const itemMinWidth = Math.max(1, Number(options.itemMinWidth) || 80)
        const itemGap = Math.max(0, Number(options.itemGap) || 0)
        const stepWidth = itemMinWidth + itemGap
        const trackEndPadding = Math.max(0, Number(options.trackEndPadding ?? 25) || 0)
        const countProperty = options.countProperty || '--lead-evolution-step-count'
        const syncRowEnds = options.syncRowEnds !== false
        const getVisibleSteps = () => [...track.querySelectorAll(itemSelector)].filter((step) => !step.hidden)

        const prevBtn = container.querySelector('.lead-detail-evolution-arrow-prev')
        const nextBtn = container.querySelector('.lead-detail-evolution-arrow-next')
        const toggleBtn = container.querySelector('.lead-detail-evolution-toggle')

        function hasOverflowAtMinimumWidth() {
          const visibleSteps = getVisibleSteps()
          const minimumContentWidth = visibleSteps.length * itemMinWidth
            + Math.max(0, visibleSteps.length - 1) * itemGap
          return visibleSteps.length > 1 && minimumContentWidth > evolution.clientWidth + 1
        }

        function collapseEvolution() {
          if (!container.hasAttribute('data-evolution-expanded')) return
          container.removeAttribute('data-evolution-expanded')
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false')
            toggleBtn.textContent = '展开'
          }
          track.scrollLeft = 0
        }

        function syncLayoutMode() {
          const visibleSteps = getVisibleSteps()
          const overflow = hasOverflowAtMinimumWidth()
          track.style.setProperty(countProperty, String(visibleSteps.length || 1))
          container.toggleAttribute('data-evolution-single', visibleSteps.length === 1)
          container.toggleAttribute('data-evolution-overflow', overflow)
          if (!overflow) {
            collapseEvolution()
            track.scrollLeft = 0
          }
          return overflow
        }

        function getMaxAlignedScrollLeft() {
          const contentWidth = Math.max(0, track.scrollWidth - trackEndPadding)
          const requiredScroll = Math.max(0, contentWidth - track.clientWidth)
          const alignedScroll = Math.ceil(requiredScroll / stepWidth) * stepWidth
          return Math.min(alignedScroll, Math.max(0, track.scrollWidth - track.clientWidth))
        }

        function alignTrackToNearestStep(behavior = 'smooth') {
          if (container.hasAttribute('data-evolution-expanded')) return
          const maxScrollLeft = getMaxAlignedScrollLeft()
          const alignedScrollLeft = Math.round(track.scrollLeft / stepWidth) * stepWidth
          const targetScrollLeft = Math.max(0, Math.min(maxScrollLeft, alignedScrollLeft))
          if (Math.abs(track.scrollLeft - targetScrollLeft) <= 1) return
          track.scrollTo({ left: targetScrollLeft, behavior })
        }

        function syncExpandedRowEnds() {
          const allSteps = [...track.querySelectorAll(itemSelector)]
          const visibleSteps = getVisibleSteps()
          allSteps.forEach((step) => step.classList.remove('is-row-end', 'is-visible-end'))
          visibleSteps.at(-1)?.classList.add('is-visible-end')
          if (!syncRowEnds || !container.hasAttribute('data-evolution-expanded')) return

          visibleSteps.forEach((step, index) => {
            const nextStep = visibleSteps[index + 1]
            if (!nextStep || nextStep.offsetTop !== step.offsetTop) {
              step.classList.add('is-row-end')
            }
          })
        }

        function updateArrows() {
          if (!prevBtn || !nextBtn) return
          const isExpanded = container.hasAttribute('data-evolution-expanded')
          const scrollable = container.hasAttribute('data-evolution-overflow')
            && !isExpanded
            && track.scrollWidth > track.clientWidth + 1
          prevBtn.disabled = !scrollable || track.scrollLeft <= 1
          nextBtn.disabled = !scrollable || track.scrollLeft >= getMaxAlignedScrollLeft() - 1
        }

        function scrollByPage(direction) {
          const visibleStepCount = Math.max(1, Math.floor(track.clientWidth / stepWidth))
          const pageStepCount = Math.max(1, visibleStepCount - 1)
          const currentStepIndex = Math.round(track.scrollLeft / stepWidth)
          const targetScrollLeft = (currentStepIndex + direction * pageStepCount) * stepWidth
          track.scrollTo({
            left: Math.max(0, Math.min(getMaxAlignedScrollLeft(), targetScrollLeft)),
            behavior: 'smooth'
          })
        }

        if (prevBtn && !prevBtn._evolutionBound) {
          prevBtn._evolutionBound = true
          prevBtn.addEventListener('click', () => scrollByPage(-1))
        }
        if (nextBtn && !nextBtn._evolutionBound) {
          nextBtn._evolutionBound = true
          nextBtn.addEventListener('click', () => scrollByPage(1))
        }

        if (!track._evolutionScrollBound) {
          track._evolutionScrollBound = true
          track.addEventListener('scroll', () => {
            updateArrows()
            window.clearTimeout(track._evolutionAlignTimer)
            track._evolutionAlignTimer = window.setTimeout(() => alignTrackToNearestStep(), 140)
          }, { passive: true })
          track.addEventListener('wheel', (event) => {
            if (container.hasAttribute('data-evolution-expanded') || !container.hasAttribute('data-evolution-overflow')) return
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.preventDefault()
              track.scrollBy({ left: event.deltaY, behavior: 'smooth' })
            }
          }, { passive: false })
        }

        if (toggleBtn && !toggleBtn._evolutionBound) {
          toggleBtn._evolutionBound = true
          toggleBtn.addEventListener('click', () => {
            if (!container.hasAttribute('data-evolution-overflow')) return
            const isExpanded = container.hasAttribute('data-evolution-expanded')
            if (isExpanded) {
              container.removeAttribute('data-evolution-expanded')
              toggleBtn.setAttribute('aria-expanded', 'false')
              toggleBtn.textContent = '展开'
              window.requestAnimationFrame(() => {
                const savedScrollLeft = Number(container._leadEvolutionCollapsedScrollLeft || 0)
                track.scrollLeft = Math.min(getMaxAlignedScrollLeft(), savedScrollLeft)
                syncExpandedRowEnds()
                updateArrows()
              })
            } else {
              container._leadEvolutionCollapsedScrollLeft = track.scrollLeft
              container.setAttribute('data-evolution-expanded', '')
              toggleBtn.setAttribute('aria-expanded', 'true')
              toggleBtn.textContent = '收起'
              track.scrollLeft = 0
              window.requestAnimationFrame(syncExpandedRowEnds)
            }
            updateArrows()
          })
        }

        if (!container._leadEvolutionResizeObserver) {
          let previousEvolutionWidth = evolution.clientWidth
          container._leadEvolutionResizeObserver = new ResizeObserver(() => {
            const currentEvolutionWidth = evolution.clientWidth
            const overflow = syncLayoutMode()
            if (overflow && currentEvolutionWidth !== previousEvolutionWidth) {
              previousEvolutionWidth = currentEvolutionWidth
              alignTrackToNearestStep('auto')
            }
            syncExpandedRowEnds()
            updateArrows()
          })
          container._leadEvolutionResizeObserver.observe(container)
        }

        container._syncEvolutionLayout = () => {
          syncLayoutMode()
          syncExpandedRowEnds()
          updateArrows()
        }

        syncLayoutMode()
        syncExpandedRowEnds()
        updateArrows()
      }

      function bindLeadDetailEvolutionUI() {
        bindJourneyEvolutionUI(
          pageHost.querySelector('.lead-detail-journey-evolution'),
          pageHost.querySelector('#leadDetailHeroEvolutionSteps')
        )
      }

      function bindCustomerDetailEvolutionUI() {
        bindJourneyEvolutionUI(
          pageHost.querySelector('.customer-detail-journey-evolution'),
          pageHost.querySelector('#customerDetailJourneyEvolutionSteps')
        )
      }

      function bindCustomerStoreEvolutionUI() {
        bindJourneyEvolutionUI(
          pageHost.querySelector('.customer-store-evolution'),
          pageHost.querySelector('#customerDetailStoreCards'),
          {
            itemSelector: '.customer-voice-store-card',
            itemMinWidth: 220,
            itemGap: 12,
            trackEndPadding: 0,
            countProperty: '--customer-store-card-count',
            syncRowEnds: false
          }
        )
      }

      function getLeadDetailIntentLevelClass(level) {
        if (level === '高') {
          return 'level-high'
        }
        if (level === '中') {
          return 'level-medium'
        }
        return 'level-low'
      }

      function maskLeadDetailCustomerName(value) {
        const text = String(value || '').trim()
        if (text.length <= 1) {
          return text || '王*生'
        }
        return `${text.charAt(0)}*${text.charAt(text.length - 1)}`
      }

      function arrangeLeadDetailFigmaLayout() {
        const overviewPanel = pageHost.querySelector('.lead-detail-overview-panel')
        const overviewGrid = overviewPanel?.querySelector('.lead-detail-overview-grid')
        const legacyLayout = pageHost.querySelector('.lead-detail-layout')
        const intentionPanel = legacyLayout?.querySelector('.intention-panel')
        const tagPanel = legacyLayout?.querySelector('.lead-detail-tag-panel')
        const journeyPanel = legacyLayout?.querySelector('.lead-journey-panel')

        if (overviewGrid && intentionPanel && tagPanel) {
          overviewGrid.append(intentionPanel, tagPanel)
        }

        if (overviewPanel && journeyPanel) {
          overviewPanel.insertAdjacentElement('afterend', journeyPanel)
        }

        if (legacyLayout) {
          legacyLayout.hidden = true
        }
      }

      function applyLeadDetailPayload(payload) {
        if (!payload) {
          return
        }

        const setText = (selector, value) => {
          const element = pageHost.querySelector(selector)
          if (element && value) {
            element.textContent = value
          }
        }

        const setHtml = (selector, value) => {
          const element = pageHost.querySelector(selector)
          if (element && value) {
            element.innerHTML = value
          }
        }

        setText('#leadDetailLastTouch', `最后触达时间：${payload.lastTouchTime}`)
        setText('#leadDetailLeadId', `Lead ID：${payload.leadId}`)
        setText('#leadDetailStore', `门店：${payload.store}`)
        setText('#leadDetailAdvisor', `顾问姓名：${payload.advisorName}`)
        setText('#leadDetailStatus', `线索状态：${payload.leadStatus}`)
        setText('#leadDetailHeroTitle', maskLeadDetailCustomerName(payload.customer))
        setHtml('#leadDetailHeroTags', renderLeadDetailHeroTags(payload.heroTags))
        setHtml('#leadDetailHeroEvolutionSteps', renderLeadDetailEvolutionSteps(payload.evolutionSteps))
        setText('#leadDetailIntentLevel', `AI意向级别：${payload.intentLevel}`)
        const intentLevelNode = pageHost.querySelector('#leadDetailIntentLevel')
        if (intentLevelNode) {
          intentLevelNode.className = `intention-level ${getLeadDetailIntentLevelClass(payload.intentLevel)}`
        }
        syncLeadDetailModelRow(payload.models, true)
        setHtml('#leadDetailIntentText', renderLeadDetailIntentList(payload.intentText))
        setHtml('#leadDetailEvidenceText', renderLeadDetailEvidenceText(payload.evidenceText))
        setText('#leadDetailActionText', payload.actionText)
        setText('#leadDetailReminderBadge', payload.reminderBadge)
        setText('#leadDetailReminderTime', payload.reminderTime)
        setHtml('#leadDetailConversationMap', renderLeadDetailConversationMap(payload.conversationTags))
        setHtml('#leadDetailPublicProfile', renderLeadDetailPublicProfile(payload.publicProfile))
      }

      function bindLeadDetailSessionLinks(payload) {
        const sessionCustomer = payload?.customer || pageHost.querySelector('#leadDetailHeroTitle')?.textContent.trim() || '王先生'

        pageHost.querySelectorAll('[data-lead-session-link]').forEach((node) => {
          const sessionId = node.dataset.sessionId || node.textContent.replace(/^录音ID:\s*/, '').trim()
          const sessionStore = node.dataset.sessionStore || payload?.store || pageHost.querySelector('#leadDetailStore')?.textContent.replace(/^门店[：:]\s*/, '') || '上海浦东门店'
          const sessionDate = node.dataset.sessionDate || '2026/03/13'
          const sessionScene = node.dataset.sessionScene || '邀约'

          node.setAttribute('href', getRouteUrl('session-detail', {
            sessionId,
            sessionStore,
            sessionDate,
            sessionCustomer,
            sessionScene
          }))
          node.setAttribute('target', '_blank')
          node.setAttribute('rel', 'noopener')
          node.setAttribute('aria-label', `打开录音详情 ${sessionId}`)
        })
      }

      function handleLeadDetailResize() {
        window.requestAnimationFrame(() => {
          syncLeadDetailTagCloudLayout()
        })
      }

      function destroyLeadDetailPage() {
        if (leadDetailResizeObserver) {
          leadDetailResizeObserver.disconnect()
          leadDetailResizeObserver = null
        }

        window.removeEventListener('resize', handleLeadDetailResize)
      }

      function initLeadDetailPage() {
        destroyLeadDetailPage()
        arrangeLeadDetailFigmaLayout()
        const leadSelection = getLeadDetailSelection()
        syncLeadDetailBackButton(leadSelection.returnView)
        const selectedLead = getLeadDetailLead(leadSelection.id, leadSelection.source)
        let leadPayload = null

        if (selectedLead) {
          leadPayload = buildLeadDetailPayload(selectedLead, leadSelection.source)
          applyLeadDetailPayload(leadPayload)
          bindLeadDetailEvolutionUI()
          syncLeadDetailModelRow(leadPayload.models, true)
        } else {
          window.requestAnimationFrame(syncLeadDetailTagCloudLayout)
        }

        bindLeadDetailSessionLinks(leadPayload)
        syncJourneyCompactDateTimes()
        syncLeadJourneyHeaderWidth()
        window.requestAnimationFrame(syncLeadJourneyHeaderWidth)

        handleLeadDetailResize()

        const resizeTargets = [
          pageHost.querySelector('.intention-panel'),
          pageHost.querySelector('.lead-detail-tag-panel')
        ].filter(Boolean)

        if (window.ResizeObserver) {
          leadDetailResizeObserver = new ResizeObserver(() => {
            handleLeadDetailResize()
          })

          resizeTargets.forEach((node) => {
            leadDetailResizeObserver.observe(node)
          })
        }

        window.addEventListener('resize', handleLeadDetailResize)
      }

      let salesTrendChartAnimationFrame = 0

      function stopSalesTrendChartAnimation() {
        if (salesTrendChartAnimationFrame) {
          cancelAnimationFrame(salesTrendChartAnimationFrame)
          salesTrendChartAnimationFrame = 0
        }
      }

      function drawSalesTrendChart(canvas, config, animationProgress = 1) {
        if (!canvas || !config?.labels?.length || !config?.datasets?.length) {
          return null
        }

        const context = canvas.getContext('2d')
        if (!context) {
          return null
        }

        const dpr = window.devicePixelRatio || 1
        const width = Math.max(Math.floor(canvas.clientWidth || canvas.parentElement?.clientWidth || 640), 320)
        const height = Math.max(Math.floor(canvas.clientHeight || 220), 220)

        canvas.width = width * dpr
        canvas.height = height * dpr
        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        context.clearRect(0, 0, width, height)

        const padding = { top: 18, right: 58, bottom: 28, left: 42 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        const categoryWidth = chartWidth / Math.max(config.labels.length, 1)
        const mapX = (index) => padding.left + categoryWidth * (index + 0.5)
        const leftAxis = config.leftAxis || {
          min: 0,
          max: 100,
          ticks: [0, 25, 50, 75, 100],
          formatLabel: (value) => String(value)
        }
        const rightAxis = config.rightAxis || {
          min: 0,
          max: 100,
          ticks: [0, 25, 50, 75, 100],
          formatLabel: (value) => `${value}%`
        }
        const normalize = (value, min, max) => (value - min) / Math.max(max - min, 1)
        const mapAxisY = (value, axis) => {
          const axisMin = axis?.min ?? 0
          const axisMax = axis?.max ?? 100
          return padding.top + chartHeight - normalize(value, axisMin, axisMax) * chartHeight
        }
        const mapLeftY = (value) => mapAxisY(value, leftAxis)
        const mapRightY = (value) => mapAxisY(value, rightAxis)
        const clampedProgress = Math.max(0, Math.min(animationProgress, 1))
        const barNodes = []
        const drawRoundedRect = (x, y, rectWidth, rectHeight, radius) => {
          const safeRadius = Math.max(0, Math.min(radius, rectWidth / 2, rectHeight / 2))
          context.beginPath()
          context.moveTo(x, y + rectHeight)
          context.lineTo(x, y + safeRadius)
          context.quadraticCurveTo(x, y, x + safeRadius, y)
          context.lineTo(x + rectWidth - safeRadius, y)
          context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + safeRadius)
          context.lineTo(x + rectWidth, y + rectHeight)
          context.closePath()
        }
        const drawRoundedBarStroke = (x, y, rectWidth, rectHeight, radius) => {
          const safeRadius = Math.max(0, Math.min(radius, rectWidth / 2, rectHeight / 2))
          const bottomY = y + rectHeight
          context.beginPath()
          context.moveTo(x, bottomY)
          context.lineTo(x, y + safeRadius)
          context.quadraticCurveTo(x, y, x + safeRadius, y)
          context.lineTo(x + rectWidth - safeRadius, y)
          context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + safeRadius)
          context.lineTo(x + rectWidth, bottomY)
        }
        const gridTicks = rightAxis.ticks?.length ? rightAxis.ticks : leftAxis.ticks

        if (config.bars?.data?.length) {
          const stepWidth = categoryWidth
          const barWidth = Math.min(stepWidth * (config.bars.widthRatio || 0.72), 156)
          const radius = config.bars.radius || 8
          const barMapY = config.bars.axis === 'right' ? mapRightY : mapLeftY
          const barBaselineY = padding.top + chartHeight

          config.bars.data.forEach((value, index) => {
            const x = mapX(index) - barWidth / 2
            const targetY = barMapY(value)
            const y = barBaselineY - ((barBaselineY - targetY) * clampedProgress)
            const rectHeight = barBaselineY - y
            if (rectHeight <= 0) {
              return
            }
            drawRoundedRect(x, y, barWidth, rectHeight, radius)
            context.fillStyle = config.bars.fill || 'rgba(37, 99, 235, 0.12)'
            context.fill()
            drawRoundedBarStroke(x, y, barWidth, rectHeight, radius)
            context.lineWidth = 1.2
            context.strokeStyle = config.bars.stroke || 'rgba(37, 99, 235, 0.84)'
            context.stroke()
            barNodes.push({
              index,
              x,
              y,
              width: barWidth,
              height: rectHeight,
              centerX: x + barWidth / 2
            })
          })
        }

        context.strokeStyle = 'rgba(226, 232, 240, 0.5)'
        context.lineWidth = 1
        context.font = '12px PingFang SC'

        gridTicks.forEach((tick) => {
          const y = mapRightY(tick)
          context.beginPath()
          context.moveTo(padding.left, y)
          context.lineTo(width - padding.right, y)
          context.stroke()
        })

        context.fillStyle = '#94a3b8'
        context.textAlign = 'right'
        leftAxis.ticks.forEach((tick) => {
          const y = mapLeftY(tick)
          const label = leftAxis.formatLabel ? leftAxis.formatLabel(tick) : String(tick)
          if (!label) {
            return
          }
          context.fillText(label, padding.left - 10, y + 4)
        })

        context.textAlign = 'left'
        rightAxis.ticks.forEach((tick) => {
          const y = mapRightY(tick)
          const label = rightAxis.formatLabel ? rightAxis.formatLabel(tick) : String(tick)
          context.fillText(label, width - padding.right + 4, y + 4)
        })

        const labelStep = config.labels.length <= 7 ? 1 : Math.max(1, Math.ceil(config.labels.length / 6))
        context.textAlign = 'center'
        config.labels.forEach((label, index) => {
          if (index % labelStep !== 0 && index !== config.labels.length - 1) {
            return
          }

          const x = mapX(index)
          context.fillText(label, x, height - 6)
        })

        config.datasets.forEach((dataset) => {
          const baselineY = dataset.axis === 'left' ? mapLeftY(leftAxis.min) : mapRightY(rightAxis.min)
          const points = dataset.data.map((value, index) => ({
            x: mapX(index),
            y: dataset.axis === 'left' ? mapLeftY(value) : mapRightY(value)
          }))
          const progressPosition = Math.max(0, (points.length - 1) * clampedProgress)
          const settledIndex = Math.floor(progressPosition)
          const segmentProgress = progressPosition - settledIndex
          const visiblePoints = points.slice(0, Math.min(settledIndex + 1, points.length))
          let activePoint = visiblePoints[visiblePoints.length - 1] || null

          if (points.length > 1 && settledIndex < points.length - 1) {
            const startPoint = points[settledIndex]
            const endPoint = points[settledIndex + 1]
            activePoint = {
              x: startPoint.x + ((endPoint.x - startPoint.x) * segmentProgress),
              y: startPoint.y + ((endPoint.y - startPoint.y) * segmentProgress)
            }

            if (segmentProgress > 0) {
              visiblePoints.push(activePoint)
            }
          }

          const tracePath = (pathPoints) => {
            if (!pathPoints.length) {
              return
            }

            if (dataset.curved !== false && pathPoints.length > 1) {
              context.moveTo(pathPoints[0].x, pathPoints[0].y)
              for (let index = 0; index < pathPoints.length - 1; index += 1) {
                const current = pathPoints[index]
                const next = pathPoints[index + 1]
                const middleX = (current.x + next.x) / 2
                const middleY = (current.y + next.y) / 2
                context.quadraticCurveTo(current.x, current.y, middleX, middleY)
              }
              const penultimate = pathPoints[pathPoints.length - 2]
              const last = pathPoints[pathPoints.length - 1]
              context.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y)
              return
            }

            pathPoints.forEach((point, index) => {
              if (index === 0) {
                context.moveTo(point.x, point.y)
              } else {
                context.lineTo(point.x, point.y)
              }
            })
          }

          if (dataset.fillColor && visiblePoints.length > 1) {
            context.beginPath()
            tracePath(visiblePoints)
            context.lineTo(visiblePoints[visiblePoints.length - 1].x, baselineY)
            context.lineTo(visiblePoints[0].x, baselineY)
            context.closePath()
            context.fillStyle = dataset.fillColor
            context.fill()
          }

          if (visiblePoints.length > 1) {
            context.beginPath()
            context.setLineDash(dataset.dash || [])
            context.strokeStyle = dataset.color
            context.lineWidth = dataset.lineWidth || 2.5

            tracePath(visiblePoints)

            context.stroke()
            context.setLineDash([])
          }

          const settledPoints = points.slice(0, Math.min(settledIndex + 1, points.length))
          settledPoints.forEach((point) => {
            context.beginPath()
            context.fillStyle = dataset.color
            context.arc(point.x, point.y, dataset.pointRadius || 3, 0, Math.PI * 2)
            context.fill()

            if (!dataset.solidPoint) {
              context.beginPath()
              context.fillStyle = '#ffffff'
              context.arc(point.x, point.y, Math.max((dataset.pointRadius || 3) - 1.4, 1.1), 0, Math.PI * 2)
              context.fill()
            }
          })

          if (activePoint && clampedProgress < 1 && segmentProgress > 0) {
            context.beginPath()
            context.fillStyle = dataset.color
            context.arc(activePoint.x, activePoint.y, dataset.pointRadius || 3, 0, Math.PI * 2)
            context.fill()

            if (!dataset.solidPoint) {
              context.beginPath()
              context.fillStyle = '#ffffff'
              context.arc(activePoint.x, activePoint.y, Math.max((dataset.pointRadius || 3) - 1.4, 1.1), 0, Math.PI * 2)
              context.fill()
            }
          }
        })

        context.save()
        context.translate(14, padding.top + chartHeight / 2)
        context.rotate(-Math.PI / 2)
        context.fillStyle = '#94a3b8'
        context.textAlign = 'center'
        context.font = '12px PingFang SC'
        context.fillText(leftAxis.label || '', 0, 0)
        context.restore()

        context.save()
        context.translate(width - 8, padding.top + chartHeight / 2)
        context.rotate(Math.PI / 2)
        context.fillStyle = '#94a3b8'
        context.textAlign = 'center'
        context.font = '12px PingFang SC'
        context.fillText(rightAxis.label || '', 0, 0)
        context.restore()

        return {
          width,
          height,
          bars: barNodes
        }
      }

      function buildSalesTrendTooltipInteraction(chartLayout, data) {
        const tooltipLabels = data.tooltipLabels || {}
        const tooltipColors = data.tooltipColors || {}
        return {
          bars: (chartLayout?.bars || []).map((bar, index) => ({
            ...bar,
            label: data.labels[index],
            personalQualifiedRate: data.personalQualifiedRate[index],
            storeAverageRate: data.storeAverageRate[index],
            recordingVolume: data.recordingVolume[index],
            primaryLabel: tooltipLabels.primary,
            averageLabel: tooltipLabels.average,
            volumeLabel: tooltipLabels.volume,
            primaryColor: tooltipColors.primary,
            averageColor: tooltipColors.average,
            volumeColor: tooltipColors.volume
          }))
        }
      }

      function animateSalesTrendChart(canvas, config, data, options = {}) {
        if (!canvas) {
          return
        }

        stopSalesTrendChartAnimation()
        hideSalesTrendTooltip(canvas)

        const shouldAnimate = options.animate !== false
        const duration = options.duration || 1140
        const easeInOutCubic = (progress) => (
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - (((-2 * progress) + 2) ** 3) / 2
        )

        if (!shouldAnimate) {
          const chartLayout = drawSalesTrendChart(canvas, config, 1)
          bindSalesTrendTooltip(canvas, buildSalesTrendTooltipInteraction(chartLayout, data))
          return
        }

        let startTime = 0

        const step = (timestamp) => {
          if (!startTime) {
            startTime = timestamp
          }

          const progress = Math.min((timestamp - startTime) / duration, 1)
          const easedProgress = easeInOutCubic(progress)
          const chartLayout = drawSalesTrendChart(canvas, config, easedProgress)
          bindSalesTrendTooltip(canvas, buildSalesTrendTooltipInteraction(chartLayout, data))

          if (progress < 1) {
            salesTrendChartAnimationFrame = requestAnimationFrame(step)
            return
          }

          salesTrendChartAnimationFrame = 0
        }

        salesTrendChartAnimationFrame = requestAnimationFrame(step)
      }

      function ensureSalesTrendTooltip(container) {
        if (!container) {
          return null
        }

        let tooltip = container.querySelector('.sales-trend-tooltip')
        if (tooltip) {
          return tooltip
        }

        tooltip = document.createElement('div')
        tooltip.className = 'sales-trend-tooltip'
        container.appendChild(tooltip)
        return tooltip
      }

      function hideSalesTrendTooltip(canvas) {
        const tooltip = canvas?.parentElement?.querySelector('.sales-trend-tooltip')
        if (tooltip) {
          tooltip.classList.remove('visible')
        }
        if (canvas) {
          canvas.style.cursor = ''
        }
      }

      function renderSalesTrendTooltip(item) {
        const primaryLabel = item.primaryLabel || '个人合格率'
        const averageLabel = item.averageLabel || '门店均值'
        const volumeLabel = item.volumeLabel || '个人录音量'
        const primaryColor = item.primaryColor || '#2563eb'
        const averageColor = item.averageColor || '#94a3b8'
        const volumeColor = item.volumeColor || 'rgba(37,99,235,0.3)'
        return `
          <div class="sales-trend-tooltip-date">${item.label}</div>
          <div class="sales-trend-tooltip-row">
            <span class="sales-trend-tooltip-label"><i class="sales-trend-tooltip-dot" style="background:${primaryColor}"></i>${primaryLabel}</span>
            <strong>${item.personalQualifiedRate}%</strong>
          </div>
          <div class="sales-trend-tooltip-row">
            <span class="sales-trend-tooltip-label"><i class="sales-trend-tooltip-dot" style="background:${averageColor}"></i>${averageLabel}</span>
            <strong>${item.storeAverageRate}%</strong>
          </div>
          <div class="sales-trend-tooltip-row">
            <span class="sales-trend-tooltip-label"><i class="sales-trend-tooltip-dot" style="background:${volumeColor}"></i>${volumeLabel}</span>
            <strong>${item.recordingVolume}</strong>
          </div>
        `
      }

      function bindSalesTrendTooltip(canvas, interaction) {
        if (!canvas) {
          return
        }

        canvas._salesTrendInteraction = interaction
        const container = canvas.parentElement
        const tooltip = ensureSalesTrendTooltip(container)
        if (tooltip) {
          tooltip.classList.remove('visible')
        }

        if (canvas.dataset.tooltipBound === 'true') {
          return
        }

        const handleMove = (event) => {
          const current = canvas._salesTrendInteraction
          if (!current?.bars?.length || !container || !tooltip) {
            hideSalesTrendTooltip(canvas)
            return
          }

          const rect = canvas.getBoundingClientRect()
          const pointerX = event.clientX - rect.left
          const pointerY = event.clientY - rect.top
          const activeBar = current.bars.find((bar) => (
            pointerX >= bar.x &&
            pointerX <= bar.x + bar.width &&
            pointerY >= bar.y &&
            pointerY <= bar.y + bar.height
          ))

          if (!activeBar) {
            hideSalesTrendTooltip(canvas)
            return
          }

          tooltip.innerHTML = renderSalesTrendTooltip(activeBar)
          tooltip.classList.add('visible')
          canvas.style.cursor = 'pointer'

          const tooltipWidth = tooltip.offsetWidth
          const tooltipHeight = tooltip.offsetHeight
          const maxLeft = Math.max(container.clientWidth - tooltipWidth - 8, 8)
          const left = Math.min(Math.max(activeBar.centerX - tooltipWidth / 2, 8), maxLeft)
          const preferredTop = activeBar.y - tooltipHeight - 12
          const fallbackTop = activeBar.y + 12
          const maxTop = Math.max(container.clientHeight - tooltipHeight - 8, 8)
          const top = preferredTop >= 8 ? preferredTop : Math.min(fallbackTop, maxTop)

          tooltip.style.left = `${left}px`
          tooltip.style.top = `${top}px`
        }

        const handleLeave = () => hideSalesTrendTooltip(canvas)

        canvas.addEventListener('mousemove', handleMove)
        canvas.addEventListener('mouseleave', handleLeave)
        canvas.addEventListener('blur', handleLeave)
        canvas.dataset.tooltipBound = 'true'
      }

      function updateReviewScoreRing(score) {
        const progressPath = document.querySelector('#review-score-circle .review-score-progress')
        if (!progressPath) {
          return
        }

        const radius = 42
        const center = 50
        const clampedScore = Math.max(0, Math.min(Number(score) || 0, 100))
        const startAngle = -Math.PI / 2
        const polarToCartesian = (angle) => ({
          x: Number((center + radius * Math.cos(angle)).toFixed(3)),
          y: Number((center + radius * Math.sin(angle)).toFixed(3))
        })

        if (clampedScore <= 0) {
          progressPath.setAttribute('d', '')
          return
        }

        const start = polarToCartesian(startAngle)

        if (clampedScore >= 100) {
          const midpoint = polarToCartesian(startAngle + Math.PI)
          progressPath.setAttribute(
            'd',
            `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${midpoint.x} ${midpoint.y} A ${radius} ${radius} 0 0 1 ${start.x} ${start.y}`
          )
          return
        }

        const endAngle = startAngle + (Math.PI * 2 * clampedScore) / 100
        const end = polarToCartesian(endAngle)
        const largeArcFlag = clampedScore > 50 ? 1 : 0

        progressPath.setAttribute(
          'd',
          `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
        )
      }

      function getTodayInputValue() {
        const current = new Date()
        const year = current.getFullYear()
        const month = String(current.getMonth() + 1).padStart(2, '0')
        const day = String(current.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      function getSalesRangeInclusiveDays(startDate, endDate) {
        const start = parseSessionDateValue(startDate)
        const end = parseSessionDateValue(endDate)
        if (!start || !end) {
          return 7
        }

        const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000)
        return Math.max(1, diffDays + 1)
      }

      function getSalesRangeSeed(startDate, endDate) {
        const source = `${startDate || ''}${endDate || ''}`.replace(/\D/g, '')
        if (!source) {
          return 0
        }

        return source.split('').reduce((seed, digit, index) => (
          seed + (Number(digit) * (index + 3))
        ), 0)
      }

      function clampSalesMetricValue(value, min, max) {
        return Math.min(max, Math.max(min, value))
      }

      function cloneSalesMetrics(metrics) {
        return metrics.map((metric) => ({ ...metric }))
      }

      function buildSalesMetric(label, value, unit, trend, trendClass, iconTone, options = {}) {
        return { label, value, unit, trend, trendClass, iconTone, ...options }
      }

      const SALES_METRIC_DEFS = {
        '接待数': '当期完成门店接待的客户数量',
        '试驾数': '当期完成试乘试驾的客户数量',
        '邀约录音数': '当期邀约场景下进入质检分析的录音条数',
        '接待录音数': '当期门店接待场景下进入质检分析的录音条数',
        '试驾录音数': '当期试乘试驾场景下进入质检分析的录音条数',
        '话术命中率': '样本录音中关键话术被命中的比例',
        '平均时长': '有效录音的平均通话或面谈时长（分钟）',
        '风险录音': '含违规或风险话术的录音条数'
      }

      function renderSalesMetricHelp(label) {
        const description = SALES_METRIC_DEFS[label]
        if (!description) return ''
        const safeLabel = escapeHtml(label)
        return `<button class="hm-help metric-def-btn" type="button" aria-label="${safeLabel}指标说明">?<span class="metric-def-tooltip" role="tooltip">${escapeHtml(description)}</span></button>`
      }

      function formatSalesTrendValue(value, suffix = '', decimals = 0) {
        const absolute = Math.abs(value)
        const display = decimals > 0 ? absolute.toFixed(decimals) : Math.round(absolute)
        const cleanSuffix = suffix === '条' ? '' : suffix
        return `${value >= 0 ? '↑' : '↓'}${display}${cleanSuffix}`
      }

      function renderSalesHeroValue(rawValue, unit) {
        const meta = parseCounterMetaFromValue(rawValue)
        if (!meta) {
          return escapeHtml(rawValue)
        }

        const displayValue = formatCounterDisplayValue(meta.target, meta.decimals)

        if (unit === '条') {
          const num = Number(meta.target)
          if (num === 0 || num >= 2) {
            return `${escapeHtml(displayValue)}<small>条</small>`
          }
          return escapeHtml(displayValue)
        }

        if (unit || meta.suffix === '%') {
          return buildCounterDisplayMarkup(displayValue, {
            prefix: meta.prefix,
            suffix: meta.suffix,
            unit
          })
        }

        return escapeHtml(displayValue)
      }

      const dccMetricsByRange = {
        yesterday: [
          buildSalesMetric('邀约录音数', '3', '条', '↓2', 'down', 'blue', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '74%', '', '↓4%', 'down', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '10', 'min', '↓1', 'down', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '1', '条', '↑1', 'up', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last7: [
          buildSalesMetric('邀约录音数', '6', '条', '↑1', 'up', 'blue', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '78%', '', '↑3%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '18', 'min', '↑3', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '0', '条', '↓1', 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last15: [
          buildSalesMetric('邀约录音数', '14', '条', '↑3', 'up', 'blue', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '81%', '', '↑2%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '11', 'min', '↑1', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '2', '条', '↓1', 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last30: [
          buildSalesMetric('邀约录音数', '27', '条', '↑5', 'up', 'blue', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '84%', '', '↑4%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '13', 'min', '↑2', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '3', '条', '↑1', 'up', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ]
      }

      const advisorMetricsByRange = {
        yesterday: [
          buildSalesMetric('接待数', '5', '条', '↓1', 'down', 'blue', { variant: 'summary' }),
          buildSalesMetric('试驾数', '4', '条', '↓1', 'down', 'green', { variant: 'summary', iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('接待录音数', '4', '条', '↓2', 'down', 'cyan', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('试驾录音数', '3', '条', '↓1', 'down', 'amber', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '88%', '', '↓3%', 'down', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '15', 'min', '↓2', 'down', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '2', '条', '↑1', 'up', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last7: [
          buildSalesMetric('接待数', '11', '条', '↑2', 'up', 'blue', { variant: 'summary' }),
          buildSalesMetric('试驾数', '9', '条', '↑2', 'up', 'green', { variant: 'summary', iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('接待录音数', '8', '条', '↑2', 'up', 'cyan', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('试驾录音数', '7', '条', '↑1', 'up', 'amber', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '92%', '', '↑4%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '18', 'min', '↑3', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '1', '条', '↓1', 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last15: [
          buildSalesMetric('接待数', '23', '条', '↑4', 'up', 'blue', { variant: 'summary' }),
          buildSalesMetric('试驾数', '18', '条', '↑3', 'up', 'green', { variant: 'summary', iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('接待录音数', '17', '条', '↑4', 'up', 'cyan', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('试驾录音数', '15', '条', '↑3', 'up', 'amber', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '90%', '', '↑2%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '17', 'min', '↑1', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '2', '条', '↓1', 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ],
        last30: [
          buildSalesMetric('接待数', '42', '条', '↑6', 'up', 'blue', { variant: 'summary' }),
          buildSalesMetric('试驾数', '33', '条', '↑5', 'up', 'green', { variant: 'summary', iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('接待录音数', '31', '条', '↑7', 'up', 'cyan', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('试驾录音数', '28', '条', '↑5', 'up', 'amber', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', '91%', '', '↑3%', 'up', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', '19', 'min', '↑2', 'up', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', '4', '条', '↑2', 'up', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ]
      }

      function buildDccCustomMetrics(startDate, endDate) {
        const days = getSalesRangeInclusiveDays(startDate, endDate)
        const seed = getSalesRangeSeed(startDate, endDate)
        const inviteCount = Math.max(1, Math.round(days * 1.9) + (seed % 4))
        const scriptRate = clampSalesMetricValue(73 + days + (seed % 6), 72, 94)
        const avgDuration = clampSalesMetricValue(9 + Math.round(days / 2) + (seed % 3), 8, 20)
        const riskCount = Math.max(0, Math.min(4, Math.round(days / 8) + (seed % 2)))

        return [
          buildSalesMetric('邀约录音数', String(inviteCount), '条', formatSalesTrendValue((seed % 5) - 1, ''), (seed % 5) >= 1 ? 'up' : 'down', 'blue', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', `${Math.round(scriptRate)}%`, '', formatSalesTrendValue((seed % 5) - 1, '%'), (seed % 5) >= 1 ? 'up' : 'down', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', String(avgDuration), 'min', formatSalesTrendValue((seed % 4) - 1, ''), (seed % 4) >= 1 ? 'up' : 'down', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', String(riskCount), '条', formatSalesTrendValue((seed % 3) - 1, ''), (seed % 3) >= 1 ? 'up' : 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ]
      }

      function buildAdvisorCustomMetrics(startDate, endDate) {
        const days = getSalesRangeInclusiveDays(startDate, endDate)
        const seed = getSalesRangeSeed(startDate, endDate)
        const receptionRecordings = Math.max(1, Math.round(days * 2.1) + (seed % 5))
        const receptionCount = Math.max(receptionRecordings, receptionRecordings + 1 + (seed % 3))
        const testDriveRecordings = Math.max(1, receptionRecordings - 1 - (seed % 3))
        const testDriveCount = Math.max(testDriveRecordings, testDriveRecordings + 1 + (seed % 2))
        const scriptRate = clampSalesMetricValue(84 + Math.round(days / 2) + (seed % 5), 84, 97)
        const avgDuration = clampSalesMetricValue(14 + Math.round(days / 2) + (seed % 4), 13, 26)
        const riskCount = Math.max(0, Math.min(5, Math.round(days / 7) + (seed % 3)))

        return [
          buildSalesMetric('接待数', String(receptionCount), '条', formatSalesTrendValue((seed % 6) - 1, ''), (seed % 6) >= 1 ? 'up' : 'down', 'blue', { variant: 'summary' }),
          buildSalesMetric('试驾数', String(testDriveCount), '条', formatSalesTrendValue((seed % 5) - 1, ''), (seed % 5) >= 1 ? 'up' : 'down', 'green', { variant: 'summary', iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('接待录音数', String(receptionRecordings), '条', formatSalesTrendValue((seed % 6) - 1, ''), (seed % 6) >= 1 ? 'up' : 'down', 'cyan', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('试驾录音数', String(testDriveRecordings), '条', formatSalesTrendValue((seed % 5) - 1, ''), (seed % 5) >= 1 ? 'up' : 'down', 'amber', { iconUrl: '../assets/sales-role-metrics/metric-call-count.png' }),
          buildSalesMetric('话术命中率', `${Math.round(scriptRate)}%`, '', formatSalesTrendValue((seed % 6) - 1, '%'), (seed % 6) >= 1 ? 'up' : 'down', 'violet', { iconUrl: '../assets/sales-role-metrics/metric-hit-rate.png' }),
          buildSalesMetric('平均时长', String(avgDuration), 'min', formatSalesTrendValue((seed % 5) - 1, ''), (seed % 5) >= 1 ? 'up' : 'down', 'indigo', { iconUrl: '../assets/sales-role-metrics/metric-duration.png' }),
          buildSalesMetric('风险录音', String(riskCount), '条', formatSalesTrendValue((seed % 4) - 1, ''), (seed % 4) >= 1 ? 'up' : 'down', 'red', { iconUrl: '../assets/sales-role-metrics/metric-risk-count.png' })
        ]
      }

      function createDefaultDccState() {
        return {
          leadView: 'recommend',
          todoFilter: 'all',
          todoPage: 1,
          trendRange: 7,
          sortColumn: 'stage',
          sortDirection: 'asc',
          completedLeads: new Set(),
          reviewSummaryGenerated: false,
          reviewSummaryGenerating: false,
          reviewSummaryGenerateTimer: null,
          reviewSummaryTypingTimer: null,
          reviewSummaryTypingDone: false,
          reviewSummaryLastText: '',
          reviewInsightTab: 'strength',
          reviewInsightPage: 1,
          reviewRuleQuery: '',
          reviewRuleSort: 'rate-desc',
          sopReviewPage: 1,
          sopReviewRuleQuery: '',
          sopReviewRuleSort: 'rate-desc',
          reviewScenes: [],
          reviewSceneOpen: false,
          recommendRangeTab: 'last7',
          recommendRangeMode: 'last7',
          recommendMode: 'followup',
          recommendDateStart: '',
          recommendDateEnd: ''
        }
      }

      const dccState = createDefaultDccState()

      function loadDccCompletedLeads() {
        try {
          const saved = localStorage.getItem('dcc-completed-leads')
          dccState.completedLeads = saved ? new Set(JSON.parse(saved)) : new Set()
        } catch (error) {
          dccState.completedLeads = new Set()
        }
      }

      function saveDccCompletedLeads() {
        try {
          localStorage.setItem('dcc-completed-leads', JSON.stringify([...dccState.completedLeads]))
        } catch (error) {
          console.warn('保存邀约清单完成状态失败')
        }
      }

      function isDccLeadCompleted(leadId) {
        return dccState.completedLeads.has(leadId)
      }

      function updateDccCompletedCount() {
        const banner = document.getElementById('recommend-banner')
        if (!banner) {
          return
        }

        const title = banner.querySelector('.recommend-banner-title')
        const desc = banner.querySelector('.recommend-banner-desc')
        const completedCount = dccState.completedLeads.size

        if (completedCount > 0) {
          if (title) title.textContent = `今日已完成 ${completedCount} 条线索`
          if (desc) desc.textContent = '已完成项已自动移至底部，继续推进其他未完成项'
          return
        }

        if (title) title.textContent = dccDashboard.focus.bannerTitle
        if (desc) desc.textContent = dccDashboard.focus.bannerDesc
      }

      const currentDcc = {
        name: '张琳',
        avatar: '张',
        store: '上海中心店',
        title: '邀约专员'
      }

      const dccDashboard = {
        metrics: cloneSalesMetrics(dccMetricsByRange.last7),
        metricsByRange: dccMetricsByRange,
        focus: {
          title: '处理线索，确认到店状态',
          desc: '根据筛选时间内的线索优先处理，完成后及时标记状态。',
          metrics: [
            { label: '待首触', value: 2, sub: '2 条新线索仍在 30 分钟考核窗内' },
            { label: '重点邀约', value: 3, sub: '3 组 H 级客户今天适合推进到店' },
            { label: '今日到店', value: 3, sub: '3 组客户已确认到店时间' },
            { label: '超时预警', value: 1, sub: '1 条线索超过 30 分钟未完成首触' }
          ],
          bannerTitle: '先把 H 级线索首触完成，再做今日到店确认',
          bannerDesc: '邀约专员只对到店前结果负责。今天优先打掉超时和 H 级首触，再把今日确认到店客户的提醒与交接备注补齐。',
          bannerChips: ['超时线索先回拨', 'H级先锁时间', '到店前补提醒'],
          summary: '当前页面固定为邀约专员视角，只看到店前动作和到店确认结果。'
        },
        review: {
          score: 41,
          label: '质检通过率',
          sub: '邀约结果总评与关键转折分析',
          summary: '近7天真正拉低到店率的，不是首触本身，而是首触后没有及时做二次确认。对 DCC 来说，预约确认和到店提醒是提升到店率最直接的动作。',
          summaryByRange: {
            yesterday: '昨日主要问题集中在首触后的二次确认延后，导致晚间到店变更偏多。今天优先补齐预约确认与到店提醒，能最快拉回到店率。',
            last7: '近7天真正拉低到店率的，不是首触本身，而是首触后没有及时做二次确认。对 DCC 来说，预约确认和到店提醒是提升到店率最直接的动作。',
            last15: '近半月看，邀约节奏整体可控，但二次确认动作分布不均，周末前后流失更明显。建议把确认节点前置到邀约后 2 小时内。',
            last30: '近1月维度下，首触执行并不差，核心短板是“确认-提醒-交接”链路衔接不连续。先固化高意向客户的到店前触达节奏，提升会更稳定。',
            custom: '{dateRange} 内，主要短板仍在邀约后的确认和提醒闭环。建议优先补齐高意向客户的二次确认，降低临时爽约。'
          },
          weaknesses: [
            {
              title: '二次确认不够靠前',
              desc: '客户口头同意到店后，没有在当天下午完成二次确认，导致晚间临时变更行程。',
              link: '关联客户：郑女士 · 03-22 16:40（今日未到店）',
              detailParams: {
                sessionId: buildMockRecordingId(3000),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 16:40',
                sessionCustomer: '郑女士',
                sessionScene: '邀约'
              }
            },
            {
              title: '超时线索没有及时转入补救节奏',
              desc: '个别新线索超过 30 分钟后才首次联系，虽然补打电话，但客户热度已经明显下降。',
              link: '关联客户：钱先生 · 03-22 10:18（超时样本）',
              detailParams: {
                sessionId: buildMockRecordingId(3001),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 10:18',
                sessionCustomer: '钱先生',
                sessionScene: '邀约'
              }
            }
          ],
          strengths: [
            {
              title: '高意向客户的到店锁定动作比较稳',
              desc: '对 H 级客户能在首触后快速给出可选到店时段，并同步试驾顾问信息，减少客户犹豫。',
              link: '关联客户：刘女士 · 03-22 14:12（标准邀约样本）',
              detailParams: {
                sessionId: buildMockRecordingId(3002),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 14:12',
                sessionCustomer: '刘女士',
                sessionScene: '邀约'
              }
            }
          ]
        },
        arrivalSummary: {
          title: '今日到店确认',
          text: '这里单独看今日确认到店客户，方便 DCC 在客户到店前完成提醒、交接备注和接待顾问同步。',
          cards: [
            { title: '今日确认到店', value: '3', sub: '其中 2 组为 H 级高意向' },
            { title: '已发送提醒', value: '2', sub: '1 组仍需补发到店提醒' },
            { title: '交接备注完整', value: '2', sub: '1 组预算信息待补齐' },
            { title: '到店已签到', value: '1', sub: '上午 10:30 已完成现场交接' }
          ]
        },
        arrivals: [
          {
            customer: '刘女士',
            model: '传祺 E9',
            source: '汽车之家',
            time: '今日 10:30',
            consultant: '赵倩',
            note: '已签到并完成当面交接，预算 32 万以内，关注二排舒适性。',
            reminder: '已完成当天提醒'
          },
          {
            customer: '韩先生',
            model: '传祺 M8',
            source: '抖音留资',
            time: '今日 16:00',
            consultant: '李昱',
            note: '客户倾向家庭 MPV，已确认配偶同行，预算和置换信息已同步。',
            reminder: '14:30 前需补发停车指引'
          },
          {
            customer: '周女士',
            model: '传祺 ES9',
            source: '官网留资',
            time: '今日 18:30',
            consultant: '陈涛',
            note: '客户对续航和补能敏感，需要在交接备注中补充通勤场景。',
            reminder: '17:30 需做二次行程确认'
          }
        ],
        leads: [
          {
            id: buildMockLeadId(4000),
            priority: 'important',
            intent: 'H',
            customer: '刘女士',
            model: '传祺 E9',
            stage: '今日已到店',
            qcScene: '邀约',
            source: '汽车之家',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: 'G 助手已回传签到结果和接待顾问信息，你的邀约责任已闭环。',
            summary: '客户昨天完成二次确认，今天按约到店，是高意向邀约的标准样本。',
            action: '这条今天主要做邀约复盘，确认交接表和到店确认记录已经补齐。',
            tags: ['H级高意向', '夫妻同行', '已到店样本'],
            chainNote: '接待顾问 赵倩已承接，后续接待与试驾由顾问继续推进。',
            updatedAt: '2026-03-23 10:34',
            followUpTime: '2026-03-22 14:30',
            responseText: '首触 6 分钟完成'
          },
          {
            id: buildMockLeadId(4001),
            priority: 'urgent',
            intent: 'H',
            customer: '韩先生',
            model: '传祺 M8',
            stage: '今日确认到店',
            qcScene: '邀约',
            source: '抖音留资',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '上游系统已同步 16:00 到店预约，仍需在到店前补发停车指引。',
            summary: '客户已明确今天下午到店，兴趣集中在家用空间与金融方案，热度较高。',
            action: '14:30 前完成提醒并确认同行人信息，避免到店前最后一小时失约。',
            tags: ['H级高意向', '今日16:00', '停车指引待发'],
            chainNote: '计划交接给销售顾问 李昱，预算与置换信息已录入邀约备注。',
            updatedAt: '2026-03-23 09:18',
            followUpTime: '2026-03-23 10:00',
            responseText: '首触 11 分钟完成'
          },
          {
            id: buildMockLeadId(4002),
            priority: 'urgent',
            intent: 'H',
            customer: '郑女士',
            model: '传祺 ES9',
            stage: '待首触达',
            qcScene: '邀约',
            source: '官网留资',
            syncStatus: 'warn',
            syncLabel: '待回传',
            syncNote: '线索已进入 DMS，但首次电话结果还未从上游写回，需要你先完成首触。',
            summary: '客户刚留资不久，咨询点集中在纯电续航和用车成本，仍处于最容易建立联系的窗口。',
            action: '10 分钟内完成首次电话和企微加微动作，先锁住需求信息再判断是否约店。',
            tags: ['H级新线索', '30分钟考核窗内', '需首触'],
            chainNote: '到店顾问暂未分配，先完成首触后再按意向匹配接待人。',
            updatedAt: '2026-03-23 11:06',
            followUpTime: '2026-03-24 09:30',
            responseText: '已等待 18 分钟'
          },
          {
            id: buildMockLeadId(4003),
            priority: 'urgent',
            intent: 'A',
            customer: '钱先生',
            model: '传祺 M6',
            stage: '首触超时',
            qcScene: '邀约',
            source: '电话回呼',
            syncStatus: 'danger',
            syncLabel: '超时预警',
            syncNote: '超 30 分钟仍未形成有效触达记录，需要先补首触并说明原因。',
            summary: '客户询价后留下电话，当前还没形成真实接通记录，继续拖延会快速失温。',
            action: '立即完成补救电话，并在上游系统补写超时原因和下一次联系计划。',
            tags: ['A级跟进', '超时线索', '先补救'],
            chainNote: '如果客户仍有意向，需今天重新确认是否可转为本周到店邀约。',
            updatedAt: '2026-03-23 10:52',
            followUpTime: '2026-03-23 11:30',
            responseText: '已超时 14 分钟'
          },
          {
            id: buildMockLeadId(4004),
            priority: 'important',
            intent: 'A',
            customer: '周女士',
            model: '传祺 ES9',
            stage: '已邀约待到店',
            qcScene: '试驾PDC',
            source: '官网留资',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '上游已同步 18:30 到店预约，提醒任务将于 17:30 自动推送。',
            summary: '客户昨天已经确认今晚到店，需求信息基本齐全，当前主要看提醒和交接备注是否完整。',
            action: '17:30 做一次行程确认，同时补充客户通勤与补能场景，方便顾问接待时直接展开。',
            tags: ['A级中意向', '今日18:30', '交接备注待补'],
            chainNote: '计划交接给销售顾问 陈涛，客户重点关注续航与金融政策。',
            updatedAt: '2026-03-23 09:46',
            followUpTime: '2026-03-22 16:00',
            responseText: '首触 9 分钟完成'
          },
          {
            id: buildMockLeadId(4005),
            priority: 'normal',
            intent: 'B',
            customer: '林先生',
            model: '传祺 M8 宗师',
            stage: '跟进培育中',
            qcScene: '邀约',
            source: '老客转介绍',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '企微跟进纪要已同步，客户计划下周再确认到店时间。',
            summary: '客户需求明确但购车时间稍远，当前适合维持低打扰沟通，等待节点性刺激。',
            action: '这条不需要今天强推到店，先按约定在周四发送新款配置对比，再观察热度变化。',
            tags: ['B级培育', '下周考虑', '低打扰跟进'],
            chainNote: '暂无接待顾问分配，到店前再根据车型偏好安排合适顾问。',
            updatedAt: '2026-03-23 08:28',
            followUpTime: '2026-03-26 14:00',
            responseText: '首触已完成'
          },
          {
            id: buildMockLeadId(4006),
            priority: 'normal',
            intent: 'C',
            customer: '孙女士',
            model: '传祺 GS8',
            stage: '长期培育',
            qcScene: '邀约',
            source: '异业合作',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '上游最近一次回访记录已同步，客户计划五一后再看车。',
            summary: '客户购车时机较晚，目前更像内容培育对象，不适合占用今日高优先邀约资源。',
            action: '维持内容触达即可，本周不用强行邀约，避免把低意向线索误拉进今日清单。',
            tags: ['C级长期', '节后再看', '内容培育'],
            chainNote: '暂无接待顾问安排，保持线索池培育状态即可。',
            updatedAt: '2026-03-22 18:22',
            followUpTime: '2026-03-25 10:00',
            responseText: '首触已完成'
          }
        ],
        trendData: {
          7: {
            labels: ['03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [76, 73, 74, 75, 74, 75, 74]
          },
          15: {
            labels: ['03/04', '03/05', '03/06', '03/07', '03/08', '03/09', '03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [5, 6, 7, 5, 8, 6, 7, 8, 9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [82, 85, 88, 82, 90, 87, 91, 89, 93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [71, 72, 73, 71, 74, 72, 75, 74, 76, 73, 74, 75, 74, 75, 74]
          },
          30: {
            labels: ['02/17', '02/18', '02/19', '02/20', '02/21', '02/22', '02/23', '02/24', '02/25', '02/26', '02/27', '02/28', '03/01', '03/02', '03/03', '03/04', '03/05', '03/06', '03/07', '03/08', '03/09', '03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [4, 5, 4, 6, 5, 6, 5, 7, 6, 7, 5, 6, 5, 6, 5, 5, 6, 7, 5, 8, 6, 7, 8, 9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [78, 80, 76, 82, 84, 85, 81, 83, 79, 86, 80, 84, 83, 85, 82, 82, 85, 88, 82, 90, 87, 91, 89, 93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [70, 71, 69, 72, 71, 73, 70, 72, 71, 73, 71, 74, 72, 73, 71, 71, 72, 73, 71, 74, 72, 75, 74, 76, 73, 74, 75, 74, 75, 74]
          }
        }
      }

      function resetDccState() {
        if (dccState.reviewSummaryGenerateTimer) {
          window.clearTimeout(dccState.reviewSummaryGenerateTimer)
        }
        if (dccState.reviewSummaryTypingTimer) {
          window.clearInterval(dccState.reviewSummaryTypingTimer)
        }
        const nextState = createDefaultDccState()
        const defaultRange = getSalesRoleRangeValues(nextState.recommendRangeMode, 'dcc')
        Object.assign(dccState, nextState, {
          recommendDateStart: defaultRange.startDate,
          recommendDateEnd: defaultRange.endDate
        })
      }

      function getSalesRoleState(role) {
        return role === 'advisor' ? advisorState : dccState
      }

      function getSalesReviewSummaryMode(roleState) {
        if (!roleState) {
          return 'last7'
        }

        if (roleState.recommendRangeTab === 'custom') {
          return 'custom'
        }

        return roleState.recommendRangeMode || 'last7'
      }

      function getSalesReviewSummaryText(review, roleState) {
        if (!review) {
          return ''
        }

        const summaryByRange = review.summaryByRange || {}
        const summaryMode = getSalesReviewSummaryMode(roleState)

        if (summaryMode === 'custom') {
          const customSummary = summaryByRange.custom || review.summary || ''
          if (!customSummary.includes('{dateRange}')) {
            return customSummary
          }

          const dateRangeLabel = getSessionDateRangeText(roleState?.recommendDateStart, roleState?.recommendDateEnd)
          return customSummary.replace('{dateRange}', dateRangeLabel)
        }

        return summaryByRange[summaryMode] || review.summary || ''
      }

      function getSalesReviewObscuredSummaryHtml() {
        return `
          <div class="review-ai-summary-content review-ai-summary-content-obscured review-ai-summary-content-placeholder">
            <div class="review-ai-placeholder-line">系统将基于当前日期范围内的录音表现、客户反馈与关键节点，自动生成本次复盘的总评结论。</div>
            <div class="review-ai-placeholder-line">复盘内容会覆盖到店率波动原因、关键话术命中情况以及影响结果的转折环节，帮助快速定位问题。</div>
            <div class="review-ai-placeholder-line">生成后可直接查看待改善短板与优势发掘建议，并给出下一步可执行的跟进动作与优化方向。</div>
          </div>
          <div class="review-ai-summary-overlay" aria-hidden="true"></div>
        `
      }

      function clearSalesReviewTypingTimer(roleState) {
        if (!roleState || !roleState.reviewSummaryTypingTimer) {
          return
        }
        window.clearInterval(roleState.reviewSummaryTypingTimer)
        roleState.reviewSummaryTypingTimer = null
      }

      function isSalesReviewSummaryInProgress(role) {
        const roleState = getSalesRoleState(role)
        return Boolean(
          roleState?.reviewSummaryGenerating
          || (roleState?.reviewSummaryGenerated && !roleState?.reviewSummaryTypingDone)
        )
      }

      function setSalesReviewRobotPlayback(role, isPlaying) {
        const robotMedia = document.querySelector('[data-sales-review-robot-media]')
        const robotImage = robotMedia?.querySelector('.sales-review-robot-image')
        const robotVideo = robotMedia?.querySelector('.sales-review-robot-video')

        if (!robotImage || !robotVideo) {
          return
        }

        if (!isPlaying) {
          robotVideo.pause()
          robotVideo.currentTime = 0
          robotVideo.hidden = true
          robotImage.hidden = false
          return
        }

        robotImage.hidden = true
        robotVideo.hidden = false
        if (robotVideo.paused) {
          robotVideo.currentTime = 0
          const playResult = robotVideo.play()
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(() => {
              setSalesReviewRobotPlayback(role, false)
            })
          }
        }
      }

      function bindSalesReviewRobotPlayback(role) {
        const robotVideo = document.querySelector('[data-sales-review-robot-media] .sales-review-robot-video')
        if (!robotVideo || robotVideo.dataset.salesReviewRobotBound === 'true') {
          return
        }

        robotVideo.dataset.salesReviewRobotBound = 'true'
        robotVideo.addEventListener('ended', () => {
          if (!isSalesReviewSummaryInProgress(role)) {
            setSalesReviewRobotPlayback(role, false)
            return
          }

          robotVideo.currentTime = 0
          const playResult = robotVideo.play()
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(() => {
              setSalesReviewRobotPlayback(role, false)
            })
          }
        })
        robotVideo.addEventListener('error', () => {
          setSalesReviewRobotPlayback(role, false)
        })
      }

      function renderSalesReviewSummaryStatic(summaryNode, summaryText) {
        summaryNode.innerHTML = `<div class="review-ai-summary-content">${escapeHtml(summaryText)}</div>`
      }

      function startSalesReviewSummaryTyping(summaryNode, summaryText, role) {
        const roleState = getSalesRoleState(role)
        if (!summaryNode || !roleState) {
          return
        }

        clearSalesReviewTypingTimer(roleState)

        const fullText = String(summaryText || '')
        roleState.reviewSummaryTypingDone = false
        roleState.reviewSummaryLastText = fullText

        if (!fullText) {
          renderSalesReviewSummaryStatic(summaryNode, '')
          roleState.reviewSummaryTypingDone = true
          setSalesReviewRobotPlayback(role, false)
          return
        }

        let visibleLength = 0
        const typingInterval = 26
        const step = () => {
          if (!document.body.contains(summaryNode)) {
            clearSalesReviewTypingTimer(roleState)
            roleState.reviewSummaryTypingDone = false
            return
          }

          visibleLength = Math.min(fullText.length, visibleLength + 1)
          const visibleText = escapeHtml(fullText.slice(0, visibleLength))
          summaryNode.innerHTML = `
            <div class="review-ai-summary-content review-ai-summary-content-typing">
              ${visibleText}<span class="review-ai-typing-caret" aria-hidden="true"></span>
            </div>
          `

          if (visibleLength >= fullText.length) {
            clearSalesReviewTypingTimer(roleState)
            roleState.reviewSummaryTypingDone = true
            renderSalesReviewSummaryStatic(summaryNode, fullText)
            setSalesReviewRobotPlayback(role, false)
          }
        }

        step()
        if (visibleLength < fullText.length) {
          roleState.reviewSummaryTypingTimer = window.setInterval(step, typingInterval)
        }
      }

      function resetSalesRoleReviewSummaryState(role, options = {}) {
        const roleState = getSalesRoleState(role)
        if (!roleState) {
          return
        }

        if (roleState.reviewSummaryGenerateTimer) {
          window.clearTimeout(roleState.reviewSummaryGenerateTimer)
        }
        clearSalesReviewTypingTimer(roleState)

        roleState.reviewSummaryGenerateTimer = null
        roleState.reviewSummaryGenerating = false
        roleState.reviewSummaryGenerated = false
        roleState.reviewSummaryTypingDone = false
        roleState.reviewSummaryLastText = ''

        if (options.render === false) {
          return
        }

        const currentRoute = getCurrentRoute()
        if (role === 'advisor') {
          if (currentRoute === 'sales-advisor') {
            renderAdvisorReview()
          }
          return
        }

        if (currentRoute === 'sales-dcc' || currentRoute === 'sales-dashboard') {
          renderDccReview()
        }
      }

      function shiftSalesRoleReferenceDate(date, offsetDays) {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + offsetDays)
        return nextDate
      }

      function getSalesRoleAnchorDate(role) {
        const dashboard = role === 'advisor' ? advisorDashboard : dccDashboard
        const leads = dashboard?.leads || []
        let latestDate = null

        leads.forEach((lead) => {
          const dateValue = lead.updatedAt ? lead.updatedAt.split(' ')[0] : ''
          const candidate = parseSessionDateValue(dateValue)
          if (candidate && (!latestDate || candidate.getTime() > latestDate.getTime())) {
            latestDate = candidate
          }
        })

        return latestDate || new Date()
      }

      function getSalesRoleRangeValues(rangeMode, role) {
        const anchorDate = getSalesRoleAnchorDate(role)
        let startDate = anchorDate
        let endDate = anchorDate

        if (rangeMode === 'yesterday') {
          startDate = shiftSalesRoleReferenceDate(anchorDate, -1)
          endDate = startDate
        } else if (rangeMode === 'last7') {
          startDate = shiftSalesRoleReferenceDate(anchorDate, -6)
        } else if (rangeMode === 'last15') {
          startDate = shiftSalesRoleReferenceDate(anchorDate, -14)
        } else if (rangeMode === 'last30') {
          startDate = shiftSalesRoleReferenceDate(anchorDate, -29)
        }

        return {
          startDate: formatSessionDateValue(startDate),
          endDate: formatSessionDateValue(endDate)
        }
      }

      function applySalesRoleRangeMode(role, rangeMode) {
        const roleState = getSalesRoleState(role)
        if (!roleState) {
          return
        }

        roleState.recommendRangeTab = rangeMode
        roleState.todoPage = 1
        if (rangeMode === 'custom') {
          resetSalesRoleReviewSummaryState(role)
          return
        }

        roleState.recommendRangeMode = rangeMode
        const { startDate, endDate } = getSalesRoleRangeValues(rangeMode, role)
        roleState.recommendDateStart = startDate
        roleState.recommendDateEnd = endDate
        resetSalesRoleReviewSummaryState(role)
      }

      function syncSalesRoleDateView(value) {
        const target = parseSessionDateValue(clampSalesRoleDateValue(value)) || getSalesRoleDateLimitRange().maxDate
        salesRoleDateState.viewYear = target.getFullYear()
        salesRoleDateState.viewMonth = target.getMonth() + 1
      }

      function getSalesRoleDateLimitRange() {
        const maxDate = new Date()
        const minYear = maxDate.getFullYear()
        const minMonth = maxDate.getMonth() - 6
        const minMonthLastDate = new Date(minYear, minMonth + 1, 0).getDate()
        const minDate = new Date(minYear, minMonth, Math.min(maxDate.getDate(), minMonthLastDate))

        return {
          minDate,
          maxDate,
          minValue: formatSessionDateValue(minDate),
          maxValue: formatSessionDateValue(maxDate)
        }
      }

      function clampSalesRoleDateValue(value) {
        if (!value) {
          return ''
        }

        const { minValue, maxValue } = getSalesRoleDateLimitRange()
        if (value < minValue) {
          return minValue
        }
        if (value > maxValue) {
          return maxValue
        }
        return value
      }

      function isSalesRoleDateSelectable(value) {
        if (!value) {
          return false
        }

        const { minValue, maxValue } = getSalesRoleDateLimitRange()
        return value >= minValue && value <= maxValue
      }

      function shiftSalesRoleDateView(offset) {
        const { minDate, maxDate } = getSalesRoleDateLimitRange()
        const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth()
        const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth()
        const currentMonthIndex = salesRoleDateState.viewYear * 12 + salesRoleDateState.viewMonth - 1
        const nextMonthIndex = Math.min(maxMonthIndex, Math.max(minMonthIndex, currentMonthIndex + offset))

        salesRoleDateState.viewYear = Math.floor(nextMonthIndex / 12)
        salesRoleDateState.viewMonth = (nextMonthIndex % 12) + 1
      }

      function applySalesRoleDateDraft(field, value) {
        const nextValue = clampSalesRoleDateValue(value)
        if (!nextValue) {
          return
        }

        if (field === 'startDate') {
          salesRoleDateState.draftStartDate = nextValue
          if (!salesRoleDateState.draftEndDate || salesRoleDateState.draftEndDate < nextValue) {
            salesRoleDateState.draftEndDate = nextValue
          }
          salesRoleDateState.activeField = 'endDate'
          syncSalesRoleDateView(salesRoleDateState.draftEndDate)
          return
        }

        salesRoleDateState.draftEndDate = nextValue
        if (!salesRoleDateState.draftStartDate || salesRoleDateState.draftStartDate > nextValue) {
          salesRoleDateState.draftStartDate = nextValue
        }
      }

      function refreshSalesRoleRecommendView(role) {
        if (role === 'advisor') {
          renderAdvisorHeroMetrics()
          renderAdvisorFilterCounts()
          renderAdvisorFocus()
          renderAdvisorTodos()
          updateAdvisorCompletedCount()
          window.requestAnimationFrame(() => animateSalesDashboardCounters(document.querySelector('.sales-advisor-page')))
          return
        }

        renderDccHeroMetrics()
        renderDccFilterCounts()
        renderDccFocus()
        renderDccTodos()
        updateDccCompletedCount()
        window.requestAnimationFrame(() => animateSalesDashboardCounters(document.querySelector('.sales-dcc-page')))
      }

      function getSalesScopedLeadPool(leads, roleState) {
        if (!roleState || roleState.leadView !== 'recommend') {
          return leads
        }

        const startDate = roleState.recommendDateStart
        const endDate = roleState.recommendDateEnd

        return leads.filter((lead) => {
          const leadDate = lead.updatedAt
            ? lead.updatedAt.split(' ')[0]
            : (lead.followUpTime ? lead.followUpTime.split(' ')[0] : null)

          if (!leadDate) {
            return false
          }

          return (!startDate || leadDate >= startDate) && (!endDate || leadDate <= endDate)
        })
      }

      function getSalesHeroMetricsData(role) {
        const roleState = getSalesRoleState(role)
        const dashboard = role === 'advisor' ? advisorDashboard : dccDashboard
        if (!roleState || !dashboard) {
          return []
        }

        if (roleState.recommendRangeMode === 'custom') {
          return role === 'advisor'
            ? buildAdvisorCustomMetrics(roleState.recommendDateStart, roleState.recommendDateEnd)
            : buildDccCustomMetrics(roleState.recommendDateStart, roleState.recommendDateEnd)
        }

        return cloneSalesMetrics(dashboard.metricsByRange[roleState.recommendRangeMode] || dashboard.metrics)
      }

      function renderSalesRoleDateMenu() {
        const activeField = salesRoleDateState.activeField
        const startDate = salesRoleDateState.draftStartDate
        const endDate = salesRoleDateState.draftEndDate
        const { minDate, maxDate, maxValue } = getSalesRoleDateLimitRange()
        const todayValue = maxValue
        const minMonthIndex = minDate.getFullYear() * 12 + minDate.getMonth()
        const maxMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth()
        const currentMonthIndex = salesRoleDateState.viewYear * 12 + salesRoleDateState.viewMonth - 1
        const disablePrevMonth = currentMonthIndex <= minMonthIndex
        const disableNextMonth = currentMonthIndex >= maxMonthIndex
        const cells = getSessionDateCells(salesRoleDateState.viewYear, salesRoleDateState.viewMonth)

        return renderSharedDateRangePanelMarkup({
          dataNamespace: 'sales-date',
          rangeText: getSessionDateRangeText(startDate, endDate),
          monthLabel: formatSessionMonthLabel(salesRoleDateState.viewYear, salesRoleDateState.viewMonth),
          activeField,
          startLabel: formatSessionDateDisplay(startDate),
          endLabel: formatSessionDateDisplay(endDate),
          disablePrevMonth,
          disableNextMonth,
          cells: cells.map((date) => {
            if (!date) {
              return null
            }

            const value = formatSessionDateValue(date)
            return {
              day: date.getDate(),
              value,
              isDisabled: !isSalesRoleDateSelectable(value),
              inRange: Boolean(startDate && endDate && value >= startDate && value <= endDate),
              isStart: value === startDate,
              isEnd: value === endDate,
              isToday: value === todayValue
            }
          }),
          shortcuts: salesRecommendDateShortcutOptions,
          summaryText: `已选择 ${getSessionDateRangeText(startDate, endDate)}`
        })
      }

      function renderSalesRoleDateControl(role) {
        const host = document.getElementById('salesRecommendDateControl')
        const roleState = getSalesRoleState(role)
        if (!host || !roleState) {
          return
        }

        const open = salesRoleDateState.openRole === role
        const isCustom = roleState.recommendRangeTab === 'custom'
        host.innerHTML = `
          <div class="todo-filter-tabs sales-role-quick-range-tabs">
            ${salesRecommendRangeOptions.map((option) => `
              <button
                type="button"
                class="todo-filter-tab${roleState.recommendRangeTab === option.key ? ' active' : ''}"
                data-sales-range-mode="${escapeHtml(option.key)}"
              >
                ${escapeHtml(option.label)}
              </button>
            `).join('')}
          </div>
          ${isCustom ? renderSharedDateRangeControlMarkup({
            currentValue: roleState.recommendRangeTab,
            customValue: 'custom',
            isOpen: open,
            startLabel: formatSessionDateDisplay(roleState.recommendDateStart),
            endLabel: formatSessionDateDisplay(roleState.recommendDateEnd),
            dataNamespace: 'sales-date',
            rootClassName: 'sales-role-date-root',
            triggerClassName: 'session-date-trigger sales-role-date-trigger',
            triggerLabel: '日期范围筛选',
            menuHtml: open ? renderSalesRoleDateMenu() : ''
          }) : ''}
        `

        bindSalesRoleDateEvents(role)
      }

      function closeSalesRoleDatePicker(shouldRerender = true) {
        if (!salesRoleDateState.openRole) {
          return
        }

        const role = salesRoleDateState.openRole
        salesRoleDateState.openRole = null

        if (shouldRerender) {
          renderSalesRoleDateControl(role)
        }
      }

      function openSalesRoleDatePicker(role) {
        const roleState = getSalesRoleState(role)
        if (!roleState) {
          return
        }

        salesRoleDateState.openRole = role
        salesRoleDateState.activeField = 'startDate'
        salesRoleDateState.draftStartDate = clampSalesRoleDateValue(roleState.recommendDateStart)
        salesRoleDateState.draftEndDate = clampSalesRoleDateValue(roleState.recommendDateEnd)
        if (salesRoleDateState.draftStartDate && salesRoleDateState.draftEndDate && salesRoleDateState.draftStartDate > salesRoleDateState.draftEndDate) {
          salesRoleDateState.draftStartDate = salesRoleDateState.draftEndDate
        }
        syncSalesRoleDateView(roleState.recommendDateStart || roleState.recommendDateEnd)
        renderSalesRoleDateControl(role)
      }

      function applySalesRoleDateFilters(role) {
        const roleState = getSalesRoleState(role)
        if (!roleState) {
          return
        }

        const startDate = clampSalesRoleDateValue(salesRoleDateState.draftStartDate)
        const endDate = clampSalesRoleDateValue(salesRoleDateState.draftEndDate)

        roleState.recommendRangeTab = 'custom'
        roleState.recommendRangeMode = 'custom'
        roleState.todoPage = 1
        roleState.recommendDateStart = startDate && endDate && startDate > endDate ? endDate : startDate
        roleState.recommendDateEnd = startDate && endDate && startDate > endDate ? startDate : endDate
        resetSalesRoleReviewSummaryState(role)
        salesRoleDateState.openRole = null
        renderSalesRoleDateControl(role)
        refreshSalesRoleRecommendView(role)
      }

      function bindSalesRoleDateEvents(role) {
        pageHost.querySelectorAll('[data-sales-range-mode]').forEach((node) => {
          node.addEventListener('click', () => {
            const rangeMode = node.dataset.salesRangeMode
            if (!rangeMode) {
              return
            }

            salesRoleDateState.openRole = null
            applySalesRoleRangeMode(role, rangeMode)
            renderSalesRoleDateControl(role)
            refreshSalesRoleRecommendView(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-trigger]').forEach((node) => {
          node.addEventListener('click', (event) => {
            event.stopPropagation()

            if (salesRoleDateState.openRole === role) {
              closeSalesRoleDatePicker()
              return
            }

            openSalesRoleDatePicker(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-field]').forEach((node) => {
          node.addEventListener('click', () => {
            salesRoleDateState.activeField = node.dataset.salesDateField
            const value = salesRoleDateState.activeField === 'startDate'
              ? salesRoleDateState.draftStartDate
              : salesRoleDateState.draftEndDate
            syncSalesRoleDateView(value)
            renderSalesRoleDateControl(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-nav]').forEach((node) => {
          node.addEventListener('click', () => {
            shiftSalesRoleDateView(Number(node.dataset.salesDateNav))
            renderSalesRoleDateControl(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-value]').forEach((node) => {
          node.addEventListener('click', () => {
            applySalesRoleDateDraft(salesRoleDateState.activeField, node.dataset.salesDateValue)
            renderSalesRoleDateControl(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-shortcut]').forEach((node) => {
          node.addEventListener('click', () => {
            const { startDate, endDate } = getSalesRoleRangeValues(node.dataset.salesDateShortcut, role)
            salesRoleDateState.draftStartDate = startDate
            salesRoleDateState.draftEndDate = endDate
            salesRoleDateState.activeField = 'endDate'
            syncSalesRoleDateView(endDate)
            renderSalesRoleDateControl(role)
          })
        })

        pageHost.querySelectorAll('[data-sales-date-cancel]').forEach((node) => {
          node.addEventListener('click', () => {
            closeSalesRoleDatePicker()
          })
        })

        pageHost.querySelectorAll('[data-sales-date-apply]').forEach((node) => {
          node.addEventListener('click', () => {
            applySalesRoleDateFilters(role)
          })
        })
      }

      function getSalesLeadIntentBucket(lead) {
        const intent = (lead && lead.intent ? String(lead.intent) : '').toUpperCase()
        if (intent === 'H') return 'high'
        if (intent === 'A') return 'medium'
        if (intent === 'B') return 'low'
        if (intent === 'C') return 'none'
        return 'none'
      }

      function getSalesLeadSortTimeValue(lead, mode) {
        const primaryValue = mode === 'updated'
          ? (lead.updatedAt || lead.followUpTime)
          : (lead.followUpTime || lead.updatedAt)

        return primaryValue ? parseDateTimeValue(primaryValue) : new Date(0)
      }

      function compareSalesLeadsByMode(leftLead, rightLead, mode) {
        const leftPrimary = getSalesLeadSortTimeValue(leftLead, mode)
        const rightPrimary = getSalesLeadSortTimeValue(rightLead, mode)

        if (mode === 'updated' && leftPrimary.getTime() !== rightPrimary.getTime()) {
          return rightPrimary - leftPrimary
        }

        if (mode !== 'updated' && leftPrimary.getTime() !== rightPrimary.getTime()) {
          return leftPrimary - rightPrimary
        }

        return parseDateTimeValue(rightLead.updatedAt || rightLead.followUpTime || '1970-01-01 00:00')
          - parseDateTimeValue(leftLead.updatedAt || leftLead.followUpTime || '1970-01-01 00:00')
      }

      function getFilteredDccLeads() {
        let filtered = getSalesScopedLeadPool(dccDashboard.leads, dccState)

        if (dccState.todoFilter !== 'all') {
          filtered = filtered.filter((lead) => getSalesLeadIntentBucket(lead) === dccState.todoFilter)
        }

        return filtered
      }

      function getDccPriorityMark(lead) {
        if (lead.stage.includes('首触')) return '首'
        if (lead.stage.includes('到店')) return '到'
        if (lead.stage.includes('邀约')) return '邀'
        if (lead.stage.includes('培育')) return '养'
        return '跟'
      }

      function getDccViewNote() {
        if (dccState.leadView === 'arrival') return '聚焦今日确认到店客户，优先看提醒是否完成、交接备注是否完整。'
        if (dccState.leadView === 'all') return '全量查看你的邀约线索，适合核对阶段状态、首触结果和上游同步情况。'
        if (dccState.todoFilter === 'high') return '当前只看高意向客户，建议优先锁定首触、二次确认和到店时间。'
        if (dccState.todoFilter === 'medium') return '当前只看中意向客户，适合维持节奏跟进并逐步推进到店。'
        if (dccState.todoFilter === 'low') return '当前只看低意向客户，重点放在线索池培育，不强推到店。'
        if (dccState.todoFilter === 'none') return '当前只看无意向等级线索，建议先补齐判级与跟进策略。'
        return '优先处理待首触和今日确认到店客户。'
      }

      function renderDccProfile() {
        const avatar = document.getElementById('profile-avatar')
        const name = document.getElementById('profile-name')
        const store = document.getElementById('profile-store')
        const title = document.getElementById('profile-title')

        if (avatar) avatar.textContent = currentDcc.avatar
        if (name) name.textContent = currentDcc.name
        if (store) store.textContent = currentDcc.store
        if (title) title.textContent = currentDcc.title
      }

      const salesDashboardCounterFrames = new Set()
      const salesReviewCounterFrames = new Set()

      function clearSalesDashboardCounterAnimations() {
        salesDashboardCounterFrames.forEach((frameId) => cancelAnimationFrame(frameId))
        salesDashboardCounterFrames.clear()
      }

      function clearSalesReviewCounterAnimations() {
        salesReviewCounterFrames.forEach((frameId) => cancelAnimationFrame(frameId))
        salesReviewCounterFrames.clear()
      }

      function parseCounterMetaFromValue(rawValue) {
        const text = String(rawValue ?? '').trim()
        const match = text.match(/^([^0-9+-]*)([-+]?\d+(?:\.\d+)?)(.*)$/)
        if (!match) {
          return null
        }

        const numericText = match[2]
        return {
          prefix: match[1] || '',
          target: Number(numericText),
          decimals: (numericText.split('.')[1] || '').length,
          suffix: match[3] || ''
        }
      }

      function buildCounterDataAttrs(rawValue, unit = '') {
        const meta = parseCounterMetaFromValue(rawValue)
        if (!meta) {
          return ''
        }

        return [
          `data-count-target="${meta.target}"`,
          `data-count-decimals="${meta.decimals}"`,
          meta.prefix ? `data-count-prefix="${escapeHtml(meta.prefix)}"` : '',
          meta.suffix ? `data-count-suffix="${escapeHtml(meta.suffix)}"` : '',
          unit ? `data-count-unit="${escapeHtml(unit)}"` : ''
        ].filter(Boolean).join(' ')
      }

      function buildCounterDisplayMarkup(valueText, options = {}) {
        const prefix = options.prefix || ''
        const suffix = options.suffix || ''
        const unit = options.unit || ''
        const safeMain = `${escapeHtml(prefix)}${escapeHtml(valueText)}`

        if (unit) {
          return `${safeMain}<small>${escapeHtml(unit)}</small>`
        }

        if (suffix === '%') {
          return `${safeMain}<small>${escapeHtml(suffix)}</small>`
        }

        return `${safeMain}${escapeHtml(suffix)}`
      }

      function shouldShowReviewScorePercent(label = '') {
        return String(label).includes('率')
      }

      function setReviewScoreDisplay(node, value, label = '') {
        if (!node) {
          return
        }

        const displayValue = String(Math.round(value))
        if (shouldShowReviewScorePercent(label)) {
          node.innerHTML = `${escapeHtml(displayValue)}<small>%</small>`
          return
        }

        node.textContent = displayValue
      }

      function renderCounterValueMarkup(rawValue, unit = '') {
        const meta = parseCounterMetaFromValue(rawValue)
        if (!meta) {
          return `${escapeHtml(rawValue)}${unit ? `<small>${escapeHtml(unit)}</small>` : ''}`
        }

        return buildCounterDisplayMarkup(formatCounterDisplayValue(meta.target, meta.decimals), {
          prefix: meta.prefix,
          suffix: meta.suffix,
          unit
        })
      }

      function formatCounterDisplayValue(value, decimals) {
        if (decimals > 0) {
          return Number(value).toFixed(decimals)
        }
        return String(Math.round(value))
      }

      function setCounterNodeDisplay(node, value) {
        if (!node) {
          return
        }

        const decimals = Number(node.dataset.countDecimals || 0)
        const prefix = node.dataset.countPrefix || ''
        const suffix = node.dataset.countSuffix || ''
        const unit = node.dataset.countUnit || ''
        const displayValue = formatCounterDisplayValue(value, decimals)

        if (unit || suffix === '%') {
          node.innerHTML = buildCounterDisplayMarkup(displayValue, { prefix, suffix, unit })
          return
        }

        node.textContent = `${prefix}${displayValue}${suffix}`
      }

      function animateCounterNode(node, options = {}) {
        if (!node) {
          return
        }

        const target = options.target ?? Number(node.dataset.countTarget)
        if (!Number.isFinite(target)) {
          return
        }

        const duration = options.duration ?? 900
        const delay = options.delay ?? 0
        const startValue = options.startValue ?? 0
        const render = typeof options.render === 'function'
          ? options.render
          : (value) => setCounterNodeDisplay(node, value)
        const frameStore = options.frameStore instanceof Set ? options.frameStore : salesDashboardCounterFrames
        const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3)

        let frameId = 0
        let animationStart = null

        const scheduleFrame = () => {
          frameId = requestAnimationFrame(step)
          frameStore.add(frameId)
        }

        const step = (timestamp) => {
          frameStore.delete(frameId)

          if (animationStart === null) {
            animationStart = timestamp + delay
          }

          if (timestamp < animationStart) {
            scheduleFrame()
            return
          }

          const progress = Math.min((timestamp - animationStart) / duration, 1)
          const eased = easeOutCubic(progress)
          const currentValue = startValue + ((target - startValue) * eased)

          render(currentValue, progress)

          if (progress < 1) {
            scheduleFrame()
            return
          }

          render(target, 1)
        }

        render(startValue, 0)
        scheduleFrame()
      }

      function animateSalesDashboardCounters(root) {
        if (!root) {
          return
        }

        clearSalesDashboardCounterAnimations()

        const counterNodes = [...root.querySelectorAll('[data-count-target]')]
        counterNodes.forEach((node, index) => {
          animateCounterNode(node, {
            delay: 80 + (index * 65),
            duration: 920
          })
        })

        const rankNode = root.querySelector('#rank-num')
        if (rankNode) {
          const targetRank = Number(rankNode.textContent.trim())
          if (Number.isFinite(targetRank)) {
            animateCounterNode(rankNode, {
              target: targetRank,
              startValue: Math.min(1, targetRank),
              delay: 30,
              duration: 760,
              render: (value) => {
                rankNode.textContent = String(Math.max(1, Math.round(value)))
              }
            })
          }
        }

        const reviewScoreNode = root.querySelector('#review-score-val')
        const reviewScoreCircle = root.querySelector('#review-score-circle')
        if (reviewScoreNode && reviewScoreCircle) {
          const targetScore = Number(reviewScoreNode.dataset.scoreTarget || reviewScoreNode.textContent.trim())
          const reviewScoreLabel = reviewScoreNode.dataset.scoreLabel || root.querySelector('#review-score-label')?.textContent || ''
          if (Number.isFinite(targetScore)) {
            animateCounterNode(reviewScoreNode, {
              target: targetScore,
              startValue: 0,
              delay: 120,
              duration: 980,
              render: (value) => {
                const roundedValue = Math.round(value)
                setReviewScoreDisplay(reviewScoreNode, roundedValue, reviewScoreLabel)
                reviewScoreCircle.style.setProperty('--score', String(roundedValue))
                updateReviewScoreRing(roundedValue)
              }
            })
          }
        }
      }

      function renderReviewLink(item) {
        const hasDetailParams = item && item.detailParams
        const href = hasDetailParams ? getRouteUrl('session-detail', item.detailParams) : 'javascript:void(0)'
        const targetAttrs = hasDetailParams ? ' target="_blank" rel="noopener"' : ''
        return `<div class="review-link"><a href="${escapeHtml(href)}"${targetAttrs}>${escapeHtml(item.link)}</a></div>`
      }

      const SALES_REVIEW_INSIGHT_TYPES = [
        '深度需求挖掘',
        '本品价值塑造',
        '竞品差异化对比',
        '价格异议处理',
        '版本配置引导',
        '门店/公司优势塑造',
        '微信留资承接',
        '留人稳线索',
        '到店邀约推进',
        '承诺与风险边界'
      ]

      const SALES_REVIEW_STRENGTH_TOP_FIVE = [
        { source: '微信留资承接', label: '微信承接自然，有效铺垫后续跟进', score: 50 },
        { source: '留人稳线索', label: '稳线索意识强，有效保住沟通机会', score: 16.67 },
        { source: '版本配置引导', label: '版本配置梳理清晰，看车目标明确', score: 16.67 },
        { source: '到店邀约推进', label: '邀约推进到位，到店动作明确具体', score: 8.33 },
        { source: '深度需求挖掘', label: '需求探询深入，有效建立邀约基础', score: 8.33 }
      ]

      const SALES_REVIEW_DEFECT_TYPES = [
        '深度需求挖掘不足',
        '本品价值塑造偏弱',
        '竞品对比缺少差异点',
        '价格异议承接不到位',
        '版本配置引导不清晰',
        '门店/公司优势未建立',
        '微信留资承接缺失',
        '线索承接节奏断档',
        '到店邀约推进不足',
        '承诺边界表达不清'
      ]

      const SALES_REVIEW_SOP_TYPES = [
        '对比车型',
        '意向车型',
        '增换购情况',
        '购车关注点',
        '添加微信要求',
        '计划购车时间',
        '试乘试驾时间',
        '预算范围确认',
        '用车场景确认',
        '家庭成员需求',
        '配置版本推荐',
        '权益政策说明',
        '价格锚点铺垫',
        '金融方案介绍',
        '置换政策说明',
        '下一步跟进约定',
        '到店路线引导',
        '价格异议承接',
        '等待周期解释',
        '接待结束总结',
        '客户标签补充'
      ]

      const SALES_REVIEW_SOP_CATEGORIES = [
        '需求确认',
        '需求确认',
        '需求确认',
        '需求确认',
        '留资承接',
        '需求确认',
        '到店邀约',
        '需求确认',
        '需求确认',
        '需求确认',
        '产品讲解',
        '产品讲解',
        '价格沟通',
        '促单转化',
        '促单转化',
        '跟进承接',
        '到店邀约',
        '异议处理',
        '异议处理',
        '跟进承接',
        '跟进承接'
      ]

      const SALES_REVIEW_RISK_TYPES = [
        '辱骂/嘲讽客户',
        '明显不耐烦、催促打断客户',
        '与客户争执、冲突',
        '客户明确表达不满后，销售未致歉',
        '出现问题，或是客户不满时，未及时表示歉意'
      ]

      const SALES_REVIEW_QC_SCENES = ['首触跟进', '邀约进店', '排程确认', '进店接待', '试乘试驾']
      const SALES_REVIEW_PAGE_SIZE = 5
      const SALES_REVIEW_SCENE_PREVIEW_LIMIT = 99
      const getSalesReviewSceneTagLabel = (label) => Array.from(String(label ?? '').trim())[0] || ''

      function renderSalesReviewSceneTagsHtml(labels, previewLimit) {
        const previewLabels = labels.slice(0, previewLimit)
        const hasMore = labels.length > previewLimit

        return `
          <span class="issue-rule-tags">
            ${previewLabels.map((label) => `<em tabindex="0" data-tag-label="${escapeHtml(label)}" aria-label="业务场景：${escapeHtml(label)}">${escapeHtml(getSalesReviewSceneTagLabel(label))}</em>`).join('')}
          </span>
          ${hasMore ? `
            <span class="issue-rule-scene-more" tabindex="0" aria-label="查看全部所属业务场景">...</span>
          ` : ''}
          <span class="issue-rule-scene-popover" role="tooltip">
            <strong>所属业务场景</strong>
            <span class="issue-rule-scene-popover-tags">
              ${labels.map((label) => `<em>${escapeHtml(label)}</em>`).join('')}
            </span>
          </span>
        `
      }

      function renderSalesReviewSceneTags(sceneLabels = []) {
        const labels = [...new Set(sceneLabels.filter(Boolean))]
        const dataLabels = escapeHtml(JSON.stringify(labels))
        return `<span class="issue-rule-scenes" data-issue-rule-scenes data-issue-rule-scenes-labels='${dataLabels}'>${renderSalesReviewSceneTagsHtml(labels, SALES_REVIEW_SCENE_PREVIEW_LIMIT)}</span>`
      }

      const autoCollapseSalesReviewSceneTags = IssueRuleList.createAutoCollapser({
        renderHtml: renderSalesReviewSceneTagsHtml,
        previewLimit: SALES_REVIEW_SCENE_PREVIEW_LIMIT,
        progressive: true,
      })

      function getSalesReviewAllowedScenes(role) {
        return role === 'advisor'
          ? SALES_REVIEW_QC_SCENES.slice(3)
          : SALES_REVIEW_QC_SCENES.slice(0, 3)
      }

      function getSalesReviewSelectedScenes(role) {
        const state = getSalesRoleState(role)
        const allowedScenes = getSalesReviewAllowedScenes(role)
        const selectedScenes = Array.isArray(state.reviewScenes)
          ? state.reviewScenes.filter((scene) => allowedScenes.includes(scene))
          : []
        return selectedScenes.length ? selectedScenes : allowedScenes
      }

      function renderSalesReviewSceneControl(role) {
        const host = document.getElementById('salesReviewSceneControl')
        const state = getSalesRoleState(role)
        if (!host || !state) return

        const allowedScenes = getSalesReviewAllowedScenes(role)
        const selectedScenes = getSalesReviewSelectedScenes(role)
        const isAllSelected = selectedScenes.length === allowedScenes.length

        host.innerHTML = `
          <div class="gf-group store-filter-box session-toolbar-control session-toolbar-segment-control session-toolbar-control-intent">
            <span class="gf-label">业务场景</span>
            <div class="gf-tabs todo-filter-tabs" id="gf-scene" role="group" aria-label="业务场景">
              <button type="button" class="gf-tab todo-filter-tab${isAllSelected ? ' active' : ''} is-hidden" data-scene="all" aria-pressed="${isAllSelected ? 'true' : 'false'}" aria-hidden="true" tabindex="-1">全部</button>
              ${allowedScenes.map((scene) => {
                const active = selectedScenes.includes(scene)
                return `<button type="button" class="gf-tab todo-filter-tab${active ? ' active' : ''}" data-scene="${escapeHtml(scene)}" aria-pressed="${active ? 'true' : 'false'}" aria-checked="${active ? 'true' : 'false'}" aria-hidden="false" tabindex="0">${escapeHtml(scene)}</button>`
              }).join('')}
            </div>
          </div>
        `

        host.querySelectorAll('[data-scene]').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.stopPropagation()
            const scene = button.dataset.scene
            if (scene === 'all') {
              state.reviewScenes = [...allowedScenes]
            } else if (selectedScenes.includes(scene)) {
              const nextScenes = selectedScenes.filter((item) => item !== scene)
              if (!nextScenes.length) return
              state.reviewScenes = nextScenes
            } else {
              state.reviewScenes = allowedScenes.filter((item) => selectedScenes.includes(item) || item === scene)
            }
            state.reviewInsightPage = 1
            state.sopReviewPage = 1
            renderSalesReviewSceneControl(role)
            renderSalesSopReview(role)
            renderSalesReviewInsights(role)
          })
        })
      }

      const SALES_REVIEW_INSIGHT_CONFIG = {
        sop: {
          label: 'SOP执行分析',
          metricLabel: '命中率',
          countLabel: '命中/样本',
          countSortLabel: '命中数量',
          emptyText: '暂无匹配 SOP 规则',
          scores: [78, 74, 67, 63, 61, 58, 55, 72, 69, 64, 62, 60, 57, 53, 51, 49, 47, 46, 44, 42, 39],
        },
        weakness: {
          label: '短板项识别',
          metricLabel: '短板出现率',
          countLabel: '短板/样本',
          countSortLabel: '短板数量',
          emptyText: '暂无匹配短板项规则',
          scores: [85, 72, 68, 55, 45, 48, 45, 42, 39, 35]
        },
        strength: {
          label: '优势项识别',
          metricLabel: '优势命中率',
          countLabel: '命中/样本',
          countSortLabel: '命中数量',
          emptyText: '暂无匹配优势项规则',
          scores: [87, 71, 72, 56, 44, 59, 56, 52, 49, 45]
        },
        risk: {
          label: '风险命中分析',
          metricLabel: '风险命中率',
          countLabel: '命中/样本',
          countSortLabel: '命中数量',
          emptyText: '暂无匹配风险规则',
          scores: [38, 28, 20, 13, 5]
        }
      }

      function getSalesReviewApplicableScenes(tab, title = '') {
        if (tab === 'risk') {
          if (title.includes('明确表达不满')) return SALES_REVIEW_QC_SCENES.slice(1)
          if (title.includes('未及时表示歉意')) return SALES_REVIEW_QC_SCENES.slice(2)
          return [...SALES_REVIEW_QC_SCENES]
        }
        if (title.includes('深度需求')) return SALES_REVIEW_QC_SCENES.slice(0, 3)
        if (title.includes('本品价值')) return [SALES_REVIEW_QC_SCENES[1], SALES_REVIEW_QC_SCENES[3], SALES_REVIEW_QC_SCENES[4]]
        if (title.includes('竞品')) return [SALES_REVIEW_QC_SCENES[1], SALES_REVIEW_QC_SCENES[3]]
        if (title.includes('价格异议')) return SALES_REVIEW_QC_SCENES.slice(0, 4)
        if (title.includes('版本配置')) return [SALES_REVIEW_QC_SCENES[1], SALES_REVIEW_QC_SCENES[3]]
        if (title.includes('承诺')) return [...SALES_REVIEW_QC_SCENES]
        return SALES_REVIEW_QC_SCENES.slice(0, 3)
      }

      function buildSalesReviewRecording(typeIndex, recordIndex, role, tab, scenePool = SALES_REVIEW_QC_SCENES) {
        const customerPools = {
          dcc: ['林涛', '张华', '王萌', '赵强', '钱先生', '郑女士', '刘女士', '周先生'],
          advisor: ['赵女士', '刘先生', '韩宇', '陈女士', '孙先生', '王女士', '吴先生', '许明']
        }
        const customers = customerPools[role] || customerPools.dcc
        const dayOffset = tab === 'strength' ? 2 : tab === 'risk' ? 4 : 0
        const day = 20 + ((typeIndex + recordIndex + dayOffset) % 8)
        const hour = 9 + ((typeIndex * 2 + recordIndex * 3) % 9)
        const minute = String((recordIndex * 17 + typeIndex * 5) % 60).padStart(2, '0')
        const customer = customers[(typeIndex + recordIndex) % customers.length]
        const availableScenes = scenePool.length ? scenePool : SALES_REVIEW_QC_SCENES
        const sceneOffset = role === 'advisor' ? 2 : tab === 'risk' ? 1 : 0
        const scene = availableScenes[(typeIndex + recordIndex + sceneOffset) % availableScenes.length]
        const sessionDate = `2026/03/${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${minute}`

        return {
          customer,
          time: `03-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${minute}`,
          scene,
          detailParams: {
            sessionId: buildMockRecordingId(4000 + (role === 'advisor' ? 500 : 0) + typeIndex * 20 + recordIndex + dayOffset),
            sessionStore: '上海中心店',
            sessionDate,
            sessionCustomer: customer,
            sessionScene: scene
          }
        }
      }

      function getSalesReviewInsightItems(role, tab) {
        const safeTab = ['sop', 'strength', 'weakness', 'risk'].includes(tab) ? tab : 'sop'
        const config = SALES_REVIEW_INSIGHT_CONFIG[safeTab]
        const roleScoreOffset = role === 'advisor' ? -2 : 0
        const titles = safeTab === 'sop'
          ? SALES_REVIEW_SOP_TYPES
          : safeTab === 'risk'
            ? SALES_REVIEW_RISK_TYPES
            : safeTab === 'weakness'
              ? SALES_REVIEW_DEFECT_TYPES
              : SALES_REVIEW_INSIGHT_TYPES
        return titles.map((title, index) => {
          const scoreFloor = safeTab === 'risk' ? 2 : 12
          const score = clampSalesMetricValue(config.scores[index] + roleScoreOffset + (index % 2), scoreFloor, 96)
          const sampleCount = 12 + ((index * 3 + (role === 'advisor' ? 2 : 0)) % 9)
          const hitCount = Math.max(1, Math.round(sampleCount * score / 100))
          const recordCount = hitCount
          const applicableScenes = safeTab === 'sop'
            ? [...SALES_REVIEW_QC_SCENES]
            : getSalesReviewApplicableScenes(safeTab, title)
          const recordingScenes = applicableScenes
          return {
            title,
            score,
            category: safeTab === 'sop' ? SALES_REVIEW_SOP_CATEGORIES[index] : '',
            applicableScenes,
            sampleCount,
            hitCount,
            recordings: Array.from({ length: recordCount }, (_, recordIndex) => buildSalesReviewRecording(index, recordIndex, role, safeTab, recordingScenes))
          }
        })
      }

      function getSalesReviewVisibleItems(role, tab) {
        const selectedScenes = getSalesReviewSelectedScenes(role)
        const items = getSalesReviewInsightItems(role, tab).map((item) => {
          const applicableScenes = item.applicableScenes.filter((scene) => selectedScenes.includes(scene))
          if (!applicableScenes.length) return null
          const recordings = item.recordings.filter((record) => applicableScenes.includes(record.scene))
          const scopeRatio = applicableScenes.length / Math.max(1, item.applicableScenes.length)
          const sampleCount = Math.max(recordings.length, Math.round(item.sampleCount * scopeRatio))
          const hitCount = recordings.length
          return {
            ...item,
            applicableScenes,
            recordings,
            sampleCount,
            hitCount,
            score: sampleCount ? Math.round(hitCount * 100 / sampleCount) : 0
          }
        }).filter(Boolean)
        const state = getSalesRoleState(role)
        const query = String(state.reviewRuleQuery || '').trim().toLocaleLowerCase('zh-CN')
        const filtered = query
          ? items.filter((item) => String(item.title || '').toLocaleLowerCase('zh-CN').includes(query))
          : items

        return filtered.sort((left, right) => {
          if (state.reviewRuleSort === 'rate-asc') return left.score - right.score
          if (state.reviewRuleSort === 'count-desc') return right.hitCount - left.hitCount || right.score - left.score
          if (state.reviewRuleSort === 'sample-desc') return right.sampleCount - left.sampleCount || right.score - left.score
          return right.score - left.score
        })
      }

      function renderSalesReviewRank(index) {
        const rank = index + 1
        if (rank <= 3) {
          return `
            <span class="sales-review-issue-rank has-rank-icon" aria-label="第${rank}名">
              <img class="sales-review-issue-rank-icon" src="../assets/insight-rank-${rank}.png" alt="${rank}">
            </span>
          `
        }
        return `<span class="sales-review-issue-rank">${rank}</span>`
      }

      function getSalesReviewTopFiveItems(role, activeTab) {
        const visibleItems = getSalesReviewVisibleItems(role, activeTab)
        const displayTitleBySource = new Map(
          activeTab === 'strength'
            ? SALES_REVIEW_STRENGTH_TOP_FIVE.map((item) => [item.source, item.label])
            : []
        )
        const displayScoreBySource = new Map(
          activeTab === 'strength'
            ? SALES_REVIEW_STRENGTH_TOP_FIVE.map((item) => [item.source, item.score])
            : []
        )

        const orderedItems = activeTab === 'strength'
          ? [
              ...SALES_REVIEW_STRENGTH_TOP_FIVE
                .map(({ source }) => visibleItems.find((item) => item.title === source))
                .filter(Boolean),
              ...visibleItems.filter((item) => !displayTitleBySource.has(item.title))
            ]
          : visibleItems

        return orderedItems.slice(0, SALES_REVIEW_PAGE_SIZE).map((item) => ({
          item,
          sourceIndex: visibleItems.indexOf(item),
          displayTitle: displayTitleBySource.get(item.title) || item.title,
          displayScore: displayScoreBySource.get(item.title) ?? item.score
        }))
      }

      function renderSalesReviewRecordingLink(record, itemTitle, tab) {
        const href = getRouteUrl('session-detail', record.detailParams)
        return `
          <a class="sales-review-rec-link" href="${escapeHtml(href)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M4.5 2.8v10.4l8-5.2-8-5.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
            </svg>
            <span class="sales-review-rec-name">${escapeHtml(record.customer)}</span>
            <span class="sales-review-rec-time">${escapeHtml(record.time)}</span>
            <span class="sales-review-rec-scene">${escapeHtml(record.scene)}</span>
          </a>
        `
      }

      let salesReviewRecordingLibraryState = null

      function getSalesReviewRecordingFilterDateValue(time) {
        const match = String(time || '').match(/(\d{1,2})[-/](\d{1,2})/)
        if (!match) return ''
        return `2026-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
      }

      function getSalesReviewRecordingDateRange(records = []) {
        const values = records
          .map((record) => getSalesReviewRecordingFilterDateValue(record.time))
          .filter(Boolean)
          .sort()
        const fallback = formatSessionDateValue(new Date())
        return {
          minValue: values[0] || fallback,
          maxValue: values[values.length - 1] || fallback
        }
      }

      function getSalesReviewInsightDisplayTitle(title, type) {
        if (type !== 'strength') return title
        return SALES_REVIEW_STRENGTH_TOP_FIVE.find((item) => item.source === title)?.label || title
      }

      function renderSalesReviewDialogFilters() {
        if (!salesReviewRecordingLibraryState) return ''
        const { minValue, maxValue } = getSalesReviewRecordingDateRange(salesReviewRecordingLibraryState.records)
        const searchIcon = `
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"></circle>
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>`
        return `
          <div class="uat-review-dialog-filter-card">
            <div class="uat-review-dialog-filters">
              <label class="uat-review-filter-item session-toolbar-control">
                <span class="uat-review-filter-label">客户姓名</span>
                <span class="uat-review-filter-field">
                  <input type="search" data-sales-review-filter="customerQuery" placeholder="请输入客户姓名" autocomplete="off">
                  <i>${searchIcon}</i>
                </span>
              </label>
              <label class="uat-review-filter-item session-toolbar-control">
                <span class="uat-review-filter-label">录音ID</span>
                <span class="uat-review-filter-field">
                  <input type="search" data-sales-review-filter="idQuery" placeholder="请输入录音ID" autocomplete="off">
                  <i>${searchIcon}</i>
                </span>
              </label>
              <label class="uat-review-filter-item session-toolbar-control">
                <span class="uat-review-filter-label">时间</span>
                <span class="uat-review-date-range">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"></rect><path d="M7 3v4M17 3v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>
                  <input type="date" data-sales-review-date="startDate" min="${minValue}" max="${maxValue}" value="${minValue}">
                  <em>至</em>
                  <input type="date" data-sales-review-date="endDate" min="${minValue}" max="${maxValue}" value="${maxValue}">
                </span>
              </label>
            </div>
          </div>`
      }

      function bindSalesReviewDialogFilters() {
        document.querySelectorAll('[data-sales-review-filter]').forEach((input) => {
          input.addEventListener('input', (event) => {
            if (!salesReviewRecordingLibraryState) return
            salesReviewRecordingLibraryState[event.currentTarget.dataset.salesReviewFilter] = event.currentTarget.value
            salesReviewRecordingLibraryState.page = 1
            renderSalesReviewRecordingLibraryList()
          })
        })
        document.querySelectorAll('[data-sales-review-date]').forEach((input) => {
          input.addEventListener('change', (event) => {
            if (!salesReviewRecordingLibraryState) return
            salesReviewRecordingLibraryState[event.currentTarget.dataset.salesReviewDate] = event.currentTarget.value
            salesReviewRecordingLibraryState.page = 1
            renderSalesReviewRecordingLibraryList()
          })
        })
        document.getElementById('issue-recording-library-more')?.addEventListener('click', () => {
          if (!salesReviewRecordingLibraryState) return
          const list = document.getElementById('issue-recording-library-list')
          const previousItemCount = list?.children.length || 0
          salesReviewRecordingLibraryState.page += 1
          renderSalesReviewRecordingLibraryList({ append: true })
          const firstNewItem = list?.children[previousItemCount]
          if (firstNewItem) {
            requestAnimationFrame(() => firstNewItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
          }
        })
      }

      window.openSalesReviewRecordingLibrary = function(role, tab, index) {
        const items = getSalesReviewVisibleItems(role, tab)
        const issue = items[index]
        if (!issue) {
          return
        }

        const type = ['sop', 'strength', 'risk'].includes(tab) ? tab : 'weakness'
        const existing = document.getElementById('issue-recording-library-overlay')
        if (existing) existing.remove()

        const fallbackTimes = ['3-25 15:20', '3-25 11:05', '3-24 16:40', '3-24 10:15', '3-23 14:20']
        const baseId = type === 'risk' ? 2087346132915122176n : 2087346017925713920n
        const currentRoleProfileName = document.getElementById('profile-name')?.textContent?.trim() || (role === 'advisor' ? '李昱' : '张琳')
        const records = (issue.recordings || []).map((record, recordIndex) => ({
          advisor: currentRoleProfileName,
          time: record.time || fallbackTimes[recordIndex % fallbackTimes.length],
          id: String(baseId + BigInt(recordIndex)),
          orgPath: `${record.detailParams?.sessionStore || '上海中心店'}-${currentRoleProfileName}-${record.customer}`,
          store: record.detailParams?.sessionStore || '上海中心店',
          scene: record.scene,
          customer: record.customer
        }))

        salesReviewRecordingLibraryState = {
          issue,
          type,
          records,
          customerQuery: '',
          idQuery: '',
          startDate: '',
          endDate: '',
          page: 1
        }

        const categoryLabel = type === 'strength'
          ? '优势发掘TOP5'
          : type === 'weakness'
            ? '待改善短板TOP5'
            : type === 'risk'
              ? '风险命中TOP5'
              : 'SOP 质检录音'
        const dialogTitle = getSalesReviewInsightDisplayTitle(issue.title, type)
        const dialogSubtitle = type === 'risk'
          ? '筛选风险命中项的原始录音，支持按客户姓名、录音ID筛选。'
          : '筛选未达标项的原始录音，支持按客户姓名、录音ID筛选。'

        const overlay = document.createElement('div')
        overlay.id = 'issue-recording-library-overlay'
        overlay.className = 'issue-recording-library-overlay sales-recording-library-overlay uat-review-recording-overlay'
        overlay.innerHTML = `
          <section class="issue-recording-library-page uat-review-recording-dialog" role="dialog" aria-modal="true" aria-labelledby="issue-recording-library-title">
            <div class="recording-library-head">
              <div>
                <h2 id="issue-recording-library-title">${escapeHtml(categoryLabel)} · ${escapeHtml(dialogTitle)}</h2>
                <p>${escapeHtml(dialogSubtitle)}</p>
              </div>
              <button type="button" class="recording-library-close" aria-label="关闭录音列表" onclick="closeSalesReviewRecordingLibrary()">×</button>
            </div>
            <div class="uat-review-dialog-body">
              ${renderSalesReviewDialogFilters()}
              <div class="recording-library-result-row"><span id="issue-recording-library-result"></span></div>
              <div class="recording-library-list" id="issue-recording-library-list"></div>
              <div class="recording-library-footer">
                <button type="button" id="issue-recording-library-more" class="recording-library-more" hidden>加载更多</button>
              </div>
            </div>
          </section>`

        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) window.closeSalesReviewRecordingLibrary()
        })
        document.body.appendChild(overlay)
        bindSalesReviewDialogFilters()
        renderSalesReviewRecordingLibraryList()
      }

      window.closeSalesReviewRecordingLibrary = function() {
        const overlay = document.getElementById('issue-recording-library-overlay')
        if (overlay) overlay.remove()
        salesReviewRecordingLibraryState = null
      }

      function renderSalesReviewRecordingLibraryList({ append = false } = {}) {
        if (!salesReviewRecordingLibraryState) {
          return
        }

        const { records, customerQuery, idQuery, startDate, endDate, page } = salesReviewRecordingLibraryState
        const listEl = document.getElementById('issue-recording-library-list')
        const resultEl = document.getElementById('issue-recording-library-result')
        const loadMoreBtn = document.getElementById('issue-recording-library-more')
        if (!listEl || !resultEl || !loadMoreBtn) {
          return
        }

        const PAGE_SIZE = 10
        const filtered = records.filter((record) => {
          const recordDate = getSalesReviewRecordingFilterDateValue(record.time)
          const matchCustomer = customerQuery ? String(record.customer || '').includes(customerQuery.trim()) : true
          const matchId = idQuery ? String(record.id || '').includes(idQuery.trim()) : true
          const matchStartDate = startDate ? recordDate >= startDate : true
          const matchEndDate = endDate ? recordDate <= endDate : true
          return matchCustomer && matchId && matchStartDate && matchEndDate
        })

        const total = filtered.length
        const start = (page - 1) * PAGE_SIZE
        const pageRecords = append
          ? filtered.slice(start, start + PAGE_SIZE)
          : filtered.slice(0, page * PAGE_SIZE)
        const hasMore = page * PAGE_SIZE < total

        resultEl.textContent = `共 ${total} 条`
        loadMoreBtn.hidden = !hasMore

        if (!pageRecords.length && !append) {
          listEl.innerHTML = '<div class="recording-library-empty">暂无匹配录音</div>'
          return
        }

        const html = pageRecords.map((record) => `
          <div class="recording-library-row">
            <div class="recording-library-play">
              <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none" aria-hidden="true">
                <path d="M515.6 635.7c51 0 99.1-20 135.4-56.3 36.3-36.3 56.3-84.4 56.3-135.4V256.5c0-51-20-99.1-56.3-135.4-36.3-36.3-84.4-56.3-135.4-56.3s-99.1 20-135.4 56.3C344 157.4 324 205.5 324 256.5v187.6c0 51 20 99.1 56.3 135.4 36.2 36.2 84.3 56.2 135.3 56.2zM394 256.5c0-67.1 54.6-121.6 121.6-121.6 67.1 0 121.6 54.6 121.6 121.6v187.6c0 67.1-54.6 121.6-121.6 121.6-67.1 0-121.6-54.6-121.6-121.6V256.5z" fill="currentColor"></path>
                <path d="M787.7 436.9c-19.3 0-35 15.7-35 35 0 128.1-104.3 232.4-232.4 232.4H511c-128.1 0-232.4-104.3-232.4-232.4 0-19.3-15.7-35-35-35s-35 15.7-35 35c0 40.7 8 80.2 23.9 117.5 15.3 36 37.1 68.3 64.9 96.1 27.8 27.8 60.1 49.6 96.1 64.9 28.1 11.9 57.4 19.4 87.6 22.4V889h-66.5c-19 0-34.6 15.6-34.6 34.6s15.6 34.6 34.6 34.6H620c19 0 34.6-15.6 34.6-34.6S639 889 620 889h-69.7V772.8c30.1-3 59.5-10.5 87.6-22.4 36-15.3 68.3-37.1 96.1-64.9 27.8-27.8 49.6-60.1 64.9-96.1 15.8-37.3 23.9-77.8 23.9-117.5-.1-19.3-15.8-35-35.1-35z" fill="currentColor"></path>
              </svg>
            </div>
            <div class="recording-library-main">
              <strong>${record.orgPath}</strong>
              <span>${record.time} · ${record.id}</span>
            </div>
            <button type="button" class="recording-library-detail" onclick="openRecordingPlayer('${record.id}')" aria-label="查看录音详情">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>`).join('')

        if (append) listEl.insertAdjacentHTML('beforeend', html)
        else listEl.innerHTML = html
      }

      function animateSalesReviewInsightCards(root) {
        clearSalesReviewCounterAnimations()
        root?.querySelectorAll('.sales-review-issue-bar-fill').forEach((bar, index) => {
          const target = clampSalesMetricValue(Number(bar.dataset.target || 0), 0, 100)
          bar.style.width = '0%'
          window.setTimeout(() => {
            bar.style.width = `${target}%`
          }, 80 + index * 35)
        })
        root?.querySelectorAll('.sales-review-issue-stat').forEach((node, index) => {
          const targetText = String(node.dataset.target || 0)
          const target = clampSalesMetricValue(Number(targetText), 0, 100)
          const decimals = (targetText.split('.')[1] || '').length
          animateCounterNode(node, {
            target,
            startValue: 0,
            delay: 80 + index * 35,
            duration: 720,
            frameStore: salesReviewCounterFrames,
            render: (value) => {
              node.textContent = `${decimals ? Number(value).toFixed(decimals) : Math.round(value)}%`
            }
          })
        })
      }

      function renderSalesReviewToolbar(role, activeTab) {
        const toolbar = document.getElementById('review-insight-toolbar')
        if (!toolbar) return

        const state = getSalesRoleState(role)
        const config = SALES_REVIEW_INSIGHT_CONFIG[activeTab] || SALES_REVIEW_INSIGHT_CONFIG.sop
        const sortOptions = [
          { value: 'rate-desc', label: `${config.metricLabel}从高到低` },
          { value: 'rate-asc', label: `${config.metricLabel}从低到高` },
          { value: 'count-desc', label: `${config.countSortLabel}优先` },
          { value: 'sample-desc', label: '样本数量优先' }
        ]
        const activeSort = sortOptions.find((option) => option.value === state.reviewRuleSort) || sortOptions[0]
        toolbar.hidden = false
        toolbar.innerHTML = `
          <div class="issue-rule-toolbar store-sop-rule-toolbar" aria-label="${escapeHtml(config.label)}规则搜索与排序">
            <label class="issue-rule-search store-sop-rule-field store-sop-rule-field--search">
              <span>搜索规则</span>
              <input class="issue-rule-search-input store-sop-rule-input" type="search" value="${escapeHtml(state.reviewRuleQuery || '')}" placeholder="输入规则名称" autocomplete="off" data-sales-review-rule-search>
            </label>
            <div class="issue-rule-sort store-sop-rule-field store-sop-rule-field--sort">
              <span>排序</span>
              <div class="sales-review-sop-sort-dropdown">
                <button type="button" class="sales-review-sop-sort-trigger store-model-trigger session-select-trigger" aria-haspopup="listbox" aria-expanded="false" data-sales-review-rule-sort-trigger>
                  <span class="sales-review-sop-sort-value">${escapeHtml(activeSort.label)}</span>
                  <svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </button>
                <div class="sales-review-sop-sort-panel store-model-panel session-menu-panel" role="listbox" aria-label="排序方式" data-sales-review-rule-sort-panel>
                  <div class="session-menu-option-list">
                    ${sortOptions.map((option) => `
                      <button
                        type="button"
                        class="sales-review-sop-sort-option store-model-option session-menu-option${activeSort.value === option.value ? ' active' : ''}"
                        data-sales-review-rule-sort="${option.value}"
                        role="option"
                        aria-selected="${activeSort.value === option.value ? 'true' : 'false'}"
                      ><span>${escapeHtml(option.label)}</span></button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>`

        const searchInput = toolbar.querySelector('[data-sales-review-rule-search]')
        const applySalesReviewRuleSearch = (value) => {
          const nextQuery = value || ''
          if (state.reviewRuleQuery === nextQuery) return
          state.reviewRuleQuery = nextQuery
          state.reviewInsightPage = 1
          renderSalesReviewInsightContent(role, activeTab)
        }
        searchInput?.addEventListener('input', (event) => {
          if (event.isComposing) return
          applySalesReviewRuleSearch(event.currentTarget.value)
        })
        searchInput?.addEventListener('compositionend', (event) => applySalesReviewRuleSearch(event.currentTarget.value))
        searchInput?.addEventListener('search', (event) => applySalesReviewRuleSearch(event.currentTarget.value))
        const sortField = toolbar.querySelector('.store-sop-rule-field--sort')
        const sortTrigger = toolbar.querySelector('[data-sales-review-rule-sort-trigger]')
        const sortPanel = toolbar.querySelector('[data-sales-review-rule-sort-panel]')
        let outsideClickHandler = null
        const closeSortPanel = () => {
          sortPanel?.classList.remove('show')
          sortTrigger?.classList.remove('active')
          sortTrigger?.setAttribute('aria-expanded', 'false')
          if (outsideClickHandler) {
            document.removeEventListener('click', outsideClickHandler)
            outsideClickHandler = null
          }
        }
        const openSortPanel = () => {
          sortPanel?.classList.add('show')
          sortTrigger?.classList.add('active')
          sortTrigger?.setAttribute('aria-expanded', 'true')
          outsideClickHandler = (event) => {
            if (!sortField?.contains(event.target)) {
              closeSortPanel()
            }
          }
          document.addEventListener('click', outsideClickHandler)
        }

        sortTrigger?.addEventListener('click', (event) => {
          event.stopPropagation()
          if (sortPanel?.classList.contains('show')) {
            closeSortPanel()
          } else {
            openSortPanel()
          }
        })

        sortPanel?.addEventListener('click', (event) => {
          const option = event.target.closest('[data-sales-review-rule-sort]')
          if (!option) return
          state.reviewRuleSort = option.dataset.salesReviewRuleSort || 'rate-desc'
          state.reviewInsightPage = 1
          closeSortPanel()
          renderSalesReviewToolbar(role, activeTab)
          renderSalesReviewInsightContent(role, activeTab)
        })
      }

      function renderSalesReviewPagination(role, activeTab, totalItems) {
        const host = document.getElementById('review-insight-pagination')
        if (!host) return

        const state = getSalesRoleState(role)
        const totalPages = Math.max(1, Math.ceil(totalItems / SALES_REVIEW_PAGE_SIZE))
        state.reviewInsightPage = Math.max(1, Math.min(totalPages, state.reviewInsightPage || 1))
        const currentPage = state.reviewInsightPage
        const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

        host.innerHTML = `
          <div class="dashboard-pagination">
            <span class="session-pagination-total">共 ${totalItems} 条</span>
            <div class="dashboard-pagination-controls">
              <span class="issue-pagination-page-size">${SALES_REVIEW_PAGE_SIZE} 条/页</span>
              <div class="page-group">
                <button type="button" class="page-arrow" data-sales-review-page-arrow="prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
                ${pages.map(page => `<button type="button" class="page-num${page === currentPage ? ' active' : ''}" data-sales-review-page="${page}">${page}</button>`).join('')}
                <button type="button" class="page-arrow" data-sales-review-page-arrow="next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
              </div>
            </div>
          </div>`

        const changePage = (nextPage) => {
          state.reviewInsightPage = Math.max(1, Math.min(totalPages, Number(nextPage) || 1))
          renderSalesReviewInsightContent(role, activeTab)
        }

        host.querySelectorAll('[data-sales-review-page]').forEach((node) => {
          node.addEventListener('click', () => changePage(node.dataset.salesReviewPage))
        })
        host.querySelectorAll('[data-sales-review-page-arrow]').forEach((node) => {
          node.addEventListener('click', () => {
            const delta = node.dataset.salesReviewPageArrow === 'prev' ? -1 : 1
            changePage(currentPage + delta)
          })
        })
      }

      function renderSalesReviewInsightContent(role, activeTab) {
        const list = document.getElementById('review-insight-list')
        if (!list) return

        const config = SALES_REVIEW_INSIGHT_CONFIG[activeTab] || SALES_REVIEW_INSIGHT_CONFIG.sop
        const topFiveItems = getSalesReviewTopFiveItems(role, activeTab)
        const cards = topFiveItems.map(({ sourceIndex, displayTitle, displayScore }, index) => `
          <article
            class="sales-review-issue-card sales-review-top-five-card"
            data-sales-review-recording-index="${sourceIndex}"
            tabindex="0"
            role="button"
            aria-label="查看${escapeHtml(displayTitle)}的录音"
          >
            <div class="sales-review-issue-header">
              ${renderSalesReviewRank(index)}
              <div class="sales-review-issue-info">
                <div class="sales-review-issue-title-row">
                  <strong class="sales-review-issue-title" title="${escapeHtml(displayTitle)}">${escapeHtml(displayTitle)}</strong>
                  <button type="button" class="sales-review-top-five-view" tabindex="-1" aria-hidden="true">查看</button>
                </div>
                <div class="sales-review-issue-bar-row">
                  <span class="sales-review-issue-bar-track" aria-hidden="true">
                    <span class="sales-review-issue-bar-fill" data-target="${displayScore}"></span>
                  </span>
                  <span class="sales-review-issue-stat" data-target="${displayScore}">${displayScore}%</span>
                </div>
              </div>
            </div>
          </article>
        `).join('')

        list.innerHTML = cards || `<div class="sales-review-top-five-empty">${config.emptyText}</div>`

        list.querySelectorAll('.sales-review-issue-card[data-sales-review-recording-index]').forEach((card) => {
          const openRecordingLibrary = (event) => {
            event.stopPropagation()
            window.openSalesReviewRecordingLibrary(role, activeTab, Number(card.dataset.salesReviewRecordingIndex))
          }
          card.addEventListener('click', openRecordingLibrary)
          card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            openRecordingLibrary(event)
          })
        })

        animateSalesReviewInsightCards(list)
      }

      function renderSalesSopReviewToolbar(role) {
        const toolbar = document.getElementById('sales-sop-review-toolbar')
        if (!toolbar) return

        const state = getSalesRoleState(role)
        const config = SALES_REVIEW_INSIGHT_CONFIG.sop
        const sortOptions = [
          { value: 'rate-desc', label: `${config.metricLabel}从高到低` },
          { value: 'rate-asc', label: `${config.metricLabel}从低到高` },
          { value: 'count-desc', label: `${config.countSortLabel}优先` },
          { value: 'sample-desc', label: '样本数量优先' }
        ]
        const activeSort = sortOptions.find((option) => option.value === state.sopReviewRuleSort) || sortOptions[0]
        toolbar.hidden = false
        toolbar.innerHTML = `
          <div class="issue-rule-toolbar store-sop-rule-toolbar" aria-label="${escapeHtml(config.label)}规则搜索与排序">
            <label class="issue-rule-search store-sop-rule-field store-sop-rule-field--search">
              <span>搜索规则</span>
              <input class="issue-rule-search-input store-sop-rule-input" type="search" value="${escapeHtml(state.sopReviewRuleQuery || '')}" placeholder="输入规则名称" autocomplete="off" data-sales-review-rule-search>
            </label>
            <div class="issue-rule-sort store-sop-rule-field store-sop-rule-field--sort">
              <span>排序</span>
              <div class="sales-review-sop-sort-dropdown">
                <button type="button" class="sales-review-sop-sort-trigger store-model-trigger session-select-trigger" aria-haspopup="listbox" aria-expanded="false" data-sales-review-rule-sort-trigger>
                  <span class="sales-review-sop-sort-value">${escapeHtml(activeSort.label)}</span>
                  <svg class="session-select-caret" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </button>
                <div class="sales-review-sop-sort-panel store-model-panel session-menu-panel" role="listbox" aria-label="排序方式" data-sales-review-rule-sort-panel>
                  <div class="session-menu-option-list">
                    ${sortOptions.map((option) => `
                      <button
                        type="button"
                        class="sales-review-sop-sort-option store-model-option session-menu-option${activeSort.value === option.value ? ' active' : ''}"
                        data-sales-review-rule-sort="${option.value}"
                        role="option"
                        aria-selected="${activeSort.value === option.value ? 'true' : 'false'}"
                      ><span>${escapeHtml(option.label)}</span></button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>`

        const searchInput = toolbar.querySelector('[data-sales-review-rule-search]')
        const applySalesReviewRuleSearch = (value) => {
          const nextQuery = value || ''
          if (state.sopReviewRuleQuery === nextQuery) return
          state.sopReviewRuleQuery = nextQuery
          state.sopReviewPage = 1
          renderSalesSopReviewContent(role)
        }
        searchInput?.addEventListener('input', (event) => {
          if (event.isComposing) return
          applySalesReviewRuleSearch(event.currentTarget.value)
        })
        searchInput?.addEventListener('compositionend', (event) => applySalesReviewRuleSearch(event.currentTarget.value))
        searchInput?.addEventListener('search', (event) => applySalesReviewRuleSearch(event.currentTarget.value))
        const sortField = toolbar.querySelector('.store-sop-rule-field--sort')
        const sortTrigger = toolbar.querySelector('[data-sales-review-rule-sort-trigger]')
        const sortPanel = toolbar.querySelector('[data-sales-review-rule-sort-panel]')
        let outsideClickHandler = null
        const closeSortPanel = () => {
          sortPanel?.classList.remove('show')
          sortTrigger?.classList.remove('active')
          sortTrigger?.setAttribute('aria-expanded', 'false')
          if (outsideClickHandler) {
            document.removeEventListener('click', outsideClickHandler)
            outsideClickHandler = null
          }
        }
        const openSortPanel = () => {
          sortPanel?.classList.add('show')
          sortTrigger?.classList.add('active')
          sortTrigger?.setAttribute('aria-expanded', 'true')
          outsideClickHandler = (event) => {
            if (!sortField?.contains(event.target)) {
              closeSortPanel()
            }
          }
          document.addEventListener('click', outsideClickHandler)
        }

        sortTrigger?.addEventListener('click', (event) => {
          event.stopPropagation()
          if (sortPanel?.classList.contains('show')) {
            closeSortPanel()
          } else {
            openSortPanel()
          }
        })

        sortPanel?.addEventListener('click', (event) => {
          const option = event.target.closest('[data-sales-review-rule-sort]')
          if (!option) return
          state.sopReviewRuleSort = option.dataset.salesReviewRuleSort || 'rate-desc'
          state.sopReviewPage = 1
          closeSortPanel()
          renderSalesSopReviewToolbar(role)
          renderSalesSopReviewContent(role)
        })
      }

      function renderSalesSopReviewContent(role) {
        const list = document.getElementById('sales-sop-review-list')
        if (!list) return

        const state = getSalesRoleState(role)
        const activeTab = 'sop'

        const previousQuery = state.reviewRuleQuery
        const previousSort = state.reviewRuleSort
        state.reviewRuleQuery = state.sopReviewRuleQuery
        state.reviewRuleSort = state.sopReviewRuleSort
        const visibleItems = getSalesReviewVisibleItems(role, activeTab)
        state.reviewRuleQuery = previousQuery
        state.reviewRuleSort = previousSort

        const totalPages = Math.max(1, Math.ceil(visibleItems.length / SALES_REVIEW_PAGE_SIZE))
        state.sopReviewPage = Math.max(1, Math.min(totalPages, state.sopReviewPage || 1))
        const offset = (state.sopReviewPage - 1) * SALES_REVIEW_PAGE_SIZE
        const pageItems = visibleItems.slice(offset, offset + SALES_REVIEW_PAGE_SIZE)

        const config = SALES_REVIEW_INSIGHT_CONFIG.sop
        const rows = pageItems.map((item, index) => `
          <div class="issue-rule-row" data-sales-review-recording-index="${offset + index}">
            <span class="issue-rule-name">
              <span class="issue-rule-name-line">
                <span class="issue-rule-name-copy">
                  <strong class="issue-rule-name-text" data-rule-name-ellipsis-target tabindex="0">${escapeHtml(item.title)}</strong>
                  <span class="issue-rule-name-popover" role="tooltip">${escapeHtml(item.title)}</span>
                </span>
                ${renderSalesReviewSceneTags(item.applicableScenes)}
              </span>
            </span>
            <span class="issue-rule-rate">${item.score}%</span>
            <span class="issue-rule-count">${item.hitCount}/${item.sampleCount}</span>
            <button type="button" class="issue-rule-action" data-sales-review-recording-index="${offset + index}" aria-label="查看${escapeHtml(item.title)}的人员表现">看人员表现</button>
          </div>
        `).join('')

        list.innerHTML = `
          <div class="issue-rule-list-shell">
            <div class="issue-rule-list-head">
              <span class="issue-rule-name-head">规则名称</span><span>${config.metricLabel}</span><span>${config.countLabel}</span><span>操作</span>
            </div>
            <div class="issue-rule-list">
              ${rows || `<div class="issue-rule-empty">${config.emptyText}</div>`}
            </div>
          </div>
          ${renderUnifiedIssueRulePagination({
            totalItems: visibleItems.length,
            currentPage: state.sopReviewPage,
            pageCount: totalPages,
            pageSize: SALES_REVIEW_PAGE_SIZE,
          })}`

        autoCollapseSalesReviewSceneTags(list)
        list.querySelectorAll('.issue-rule-action[data-sales-review-recording-index]').forEach((actionBtn) => {
          actionBtn.addEventListener('click', (event) => {
            event.stopPropagation()
            window.openSalesReviewRecordingLibrary(role, activeTab, Number(actionBtn.dataset.salesReviewRecordingIndex))
          })
        })
        bindUnifiedIssueRulePagination(list, {
          currentPage: state.sopReviewPage,
          pageCount: totalPages,
          onPageChange: (targetPage) => {
            state.sopReviewPage = targetPage
            renderSalesSopReviewContent(role)
          },
        })
      }

      function renderSalesSopReview(role) {
        renderSalesSopReviewToolbar(role)
        renderSalesSopReviewContent(role)
      }

      function renderSalesReviewInsights(role) {
        const state = getSalesRoleState(role)
        if (state.reviewInsightTab === 'sop') {
          state.reviewInsightTab = 'strength'
        }
        const activeTab = ['strength', 'weakness', 'risk'].includes(state.reviewInsightTab) ? state.reviewInsightTab : 'strength'
        const list = document.getElementById('review-insight-list')
        if (!list) return

        list.classList.add('sales-review-top-five-list')
        list.classList.remove('issue-list')

        document.querySelectorAll('[data-review-insight-tab]').forEach((tab) => {
          const active = tab.dataset.reviewInsightTab === activeTab
          tab.classList.toggle('active', active)
          tab.setAttribute('aria-selected', String(active))
        })

        renderSalesReviewInsightContent(role, activeTab)
      }

      function buildSalesLeadSessionId(value) {
        const digits = String(value || '').replace(/\D/g, '')
        const dateTimeSeed = Number((digits.slice(-8) || '0').padStart(8, '0'))
        return buildMockRecordingId(500000 + dateTimeSeed)
      }

      function getSalesLeadDetailParams(lead) {
        const detailParams = lead?.detailParams || {}
        const rawDate = detailParams.sessionDate || lead?.followUpTime || lead?.updatedAt || '2026-03-23 10:00'

        return {
          sessionId: detailParams.sessionId || buildSalesLeadSessionId(rawDate),
          sessionStore: detailParams.sessionStore || '上海中心店',
          sessionDate: String(rawDate).replace(/-/g, '/'),
          sessionCustomer: detailParams.sessionCustomer || lead?.customer || '王先生',
          sessionScene: detailParams.sessionScene || lead?.qcScene || '邀约'
        }
      }

      function buildSalesLeadDetailDataAttrs(lead) {
        const detailParams = getSalesLeadDetailParams(lead)
        return [
          'data-open-route="session-detail"',
          `data-session-id="${escapeHtml(detailParams.sessionId)}"`,
          `data-session-store="${escapeHtml(detailParams.sessionStore)}"`,
          `data-session-date="${escapeHtml(detailParams.sessionDate)}"`,
          `data-session-customer="${escapeHtml(detailParams.sessionCustomer)}"`,
          `data-session-scene="${escapeHtml(detailParams.sessionScene)}"`
        ].join(' ')
      }

      function getSessionDetailRouteContext() {
        const params = new URLSearchParams(window.location.search)
        return {
          sessionId: params.get('sessionId') || buildMockRecordingId(0),
          sessionStore: params.get('sessionStore') || '上海浦东门店',
          sessionDate: params.get('sessionDate') || '2026/03/13',
          sessionCustomer: params.get('sessionCustomer') || '王先生',
          sessionScene: params.get('sessionScene') || '邀约'
        }
      }

      function applySessionDetailRouteContext() {
        const context = getSessionDetailRouteContext()
        const recordIdNode = document.getElementById('sessionDetailRecordId')
        const storeNode = document.getElementById('sessionDetailStore')
        const dateNode = document.getElementById('sessionDetailDate')
        const contextPillNode = document.getElementById('sessionDetailContextPill')
        const greetingNode = document.getElementById('sessionDetailGreeting')

        if (recordIdNode) {
          recordIdNode.textContent = `录音ID: ${context.sessionId}`
        }
        if (storeNode) {
          storeNode.textContent = String(context.sessionStore || '').replace(/^门店[:：]\s*/, '')
        }
        if (dateNode) {
          dateNode.textContent = `日期: ${context.sessionDate}`
        }
        if (contextPillNode) {
          contextPillNode.textContent = `${context.sessionCustomer} / ${context.sessionScene}`
        }
        if (greetingNode) {
          greetingNode.innerHTML = `${escapeHtml(context.sessionCustomer)}您好，今天主要想了解您对 <span class="highlight good">续航</span>、<span class="highlight good">空间</span> 还是 <span class="highlight good">预算</span> 哪部分最关注？`
        }
      }

      function renderDccHeroMetrics() {
        const container = document.getElementById('hero-metrics')
        if (!container) {
          return
        }

        const dccMetricIconUrls = {
          '邀约录音数': '../assets/sales-role-metrics/metric-invite-recording.png',
          '话术命中率': '../assets/sales-role-metrics/metric-hit-rate.png',
          '平均时长': '../assets/sales-role-metrics/metric-duration.png',
          '风险录音': '../assets/sales-role-metrics/metric-risk-count.png'
        }
        const showTrend = dccState.recommendRangeMode !== 'custom'
        const metrics = getSalesHeroMetricsData('dcc')
        container.innerHTML = metrics.map((metric) => {
          const iconMetric = {
            ...metric,
            iconUrl: dccMetricIconUrls[metric.label] || metric.iconUrl
          }
          const metricLabel = escapeHtml(metric.label)
          return `
          <div class="hm-item">
            ${renderSalesHeroMetricIcon(iconMetric)}
            <div class="hm-body">
              <div class="hm-label hm-label--ellipsis" title="${metricLabel}">${metricLabel}</div>
              <div class="hm-val-row">
                <span class="hm-value" ${buildCounterDataAttrs(metric.value, metric.unit)}>${renderSalesHeroValue(metric.value, metric.unit)}</span>
                ${showTrend ? `<span class="hm-trend ${metric.trendClass}${metric.label === '风险录音' ? ' hm-trend-risk' : ''}">${escapeHtml(metric.trend)}</span>` : ''}
              </div>
            </div>
            ${renderSalesMetricHelp(metric.label)}
          </div>
        `
        }).join('')
      }

      function renderSalesHeroMetricIcon(metric) {
        if (metric && metric.iconUrl) {
          return `<img class="hm-metric-icon" src="${escapeHtml(metric.iconUrl)}" alt="" aria-hidden="true">`
        }
        const tone = (metric && metric.iconTone) || 'blue'
        return `
          <span class="hm-label-icon tone-${tone}" aria-hidden="true">
            <span class="hm-label-icon-core"></span>
            <span class="hm-label-icon-dot"></span>
          </span>
        `
      }

      function renderTodoPriorityIcon() {
        return `
          <img class="todo-priority-icon-mark" src="../assets/sales-recommend-avatar-icon.png" alt="" aria-hidden="true">
        `
      }

      let executionMetricIconSeed = 0

      function getExecutionMetricIcon(icon, tone = 'blue') {
        const iconId = `executionMetricIcon-${tone}-${icon}-${executionMetricIconSeed += 1}`

        switch (icon) {
          case 'star':
            return `
              <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
                <path d="M15.1999 5.32002C15.5545 5.32002 15.8839 5.52269 16.0359 5.83935L18.4045 10.6527C18.5312 10.906 18.7719 11.0707 19.0505 11.1087L24.3705 11.8814C25.1939 12.008 25.5232 13.0214 24.9152 13.604L21.0772 17.3407C20.8745 17.5434 20.7732 17.8347 20.8239 18.1134L21.7232 23.3954C21.8625 24.2187 21.0012 24.852 20.2665 24.4594L15.5165 21.964C15.3641 21.8841 15.1946 21.8424 15.0225 21.8424C14.8505 21.8424 14.6809 21.8841 14.5285 21.964L9.77854 24.4594C9.04387 24.852 8.18254 24.2187 8.32187 23.3954L9.2212 18.1134C9.24162 17.9737 9.22937 17.8313 9.18541 17.6972C9.14146 17.5631 9.06699 17.4411 8.96787 17.3407L5.12987 13.604C4.52187 13.0214 4.8512 12.008 5.67454 11.8814L10.9945 11.1087C11.2732 11.0707 11.5139 10.906 11.6405 10.6527L14.0092 5.83935C14.1612 5.52269 14.4905 5.32002 14.8452 5.32002H15.1999Z" fill="url(#${iconId})"/>
                <path d="M15.1998 7.75195L16.6945 10.7793C16.7958 10.9693 16.9731 11.096 17.1885 11.134L20.5325 11.6153L18.1131 13.9713C18.0196 14.0646 17.9491 14.1785 17.9073 14.3038C17.8655 14.4291 17.8536 14.5625 17.8725 14.6933L18.4425 18.0246L15.4278 16.4413C15.303 16.3748 15.1638 16.34 15.0225 16.34C14.8811 16.34 14.7419 16.3748 14.6171 16.4413L12.8185 17.3913L15.1998 7.75195Z" fill="white" fill-opacity="0.24"/>
                <defs>
                  <linearGradient id="${iconId}" x1="5.06654" y1="3.80002" x2="25.3332" y2="26.6" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#60A5FA"></stop>
                    <stop offset="0.54" stop-color="#3B82F6"></stop>
                    <stop offset="1" stop-color="#2563EB"></stop>
                  </linearGradient>
                </defs>
              </svg>
            `
          case 'clock':
            return `
              <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
                <path d="M15.2002 26.0933C21.2164 26.0933 26.0935 21.2161 26.0935 15.1999C26.0935 9.1837 21.2164 4.30659 15.2002 4.30659C9.18395 4.30659 4.30684 9.1837 4.30684 15.1999C4.30684 21.2161 9.18395 26.0933 15.2002 26.0933Z" fill="url(#${iconId})"/>
                <path d="M15.2003 24.3199C20.2371 24.3199 24.3203 20.2368 24.3203 15.1999C24.3203 10.1631 20.2371 6.07993 15.2003 6.07993C10.1634 6.07993 6.08027 10.1631 6.08027 15.1999C6.08027 20.2368 10.1634 24.3199 15.2003 24.3199Z" fill="white" fill-opacity="0.16"/>
                <path d="M15.2002 9.68999V15.6433L19.1902 17.9867" stroke="white" stroke-width="2.66" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.2002 16.6566C16.0047 16.6566 16.6569 16.0045 16.6569 15.2C16.6569 14.3955 16.0047 13.7433 15.2002 13.7433C14.3957 13.7433 13.7436 14.3955 13.7436 15.2C13.7436 16.0045 14.3957 16.6566 15.2002 16.6566Z" fill="white"/>
                <defs>
                  <linearGradient id="${iconId}" x1="5.06684" y1="3.79993" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FB923C"></stop>
                    <stop offset="0.54" stop-color="#F97316"></stop>
                    <stop offset="1" stop-color="#EA580C"></stop>
                  </linearGradient>
                </defs>
              </svg>
            `
          case 'check':
            return `
              <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
                <path d="M15.2002 26.0933C21.2164 26.0933 26.0935 21.2161 26.0935 15.1999C26.0935 9.1837 21.2164 4.30659 15.2002 4.30659C9.18395 4.30659 4.30684 9.1837 4.30684 15.1999C4.30684 21.2161 9.18395 26.0933 15.2002 26.0933Z" fill="url(#${iconId})"/>
                <path d="M15.2003 24.3199C20.2371 24.3199 24.3203 20.2368 24.3203 15.1999C24.3203 10.1631 20.2371 6.07993 15.2003 6.07993C10.1634 6.07993 6.08027 10.1631 6.08027 15.1999C6.08027 20.2368 10.1634 24.3199 15.2003 24.3199Z" fill="white" fill-opacity="0.14"/>
                <path d="M11.0201 15.3899L13.7435 18.1766L19.5068 12.1599" stroke="white" stroke-width="2.78667" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="${iconId}" x1="5.06684" y1="3.79993" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4ADE80"></stop>
                    <stop offset="0.54" stop-color="#22C55E"></stop>
                    <stop offset="1" stop-color="#16A34A"></stop>
                  </linearGradient>
                </defs>
              </svg>
            `
          case 'users':
            return `
              <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
                <path d="M20.2035 13.7434C22.4274 13.7434 24.2301 11.9407 24.2301 9.71674C24.2301 7.4928 22.4274 5.69006 20.2035 5.69006C17.9795 5.69006 16.1768 7.4928 16.1768 9.71674C16.1768 11.9407 17.9795 13.7434 20.2035 13.7434Z" fill="url(#${iconId}-a)"/>
                <path d="M10.1967 14.7567C12.7006 14.7567 14.7301 12.7271 14.7301 10.2232C14.7301 7.71933 12.7006 5.68982 10.1967 5.68982C7.69276 5.68982 5.66325 7.71933 5.66325 10.2232C5.66325 12.7271 7.69276 14.7567 10.1967 14.7567Z" fill="url(#${iconId}-b)"/>
                <path d="M20.2033 15.2633C17.172 15.2633 14.7067 17.7287 14.7067 20.76V21.7733C14.7067 22.3333 15.1653 22.7933 15.7267 22.7933H24.68C25.2413 22.7933 25.7 22.3333 25.7 21.7733V20.76C25.7 17.7287 23.2347 15.2633 20.2033 15.2633Z" fill="url(#${iconId}-c)"/>
                <path d="M10.1966 16.2767C6.75989 16.2767 3.97322 19.0633 3.97322 22.5C3.97322 23.06 4.43189 23.52 4.99322 23.52H15.4C15.9613 23.52 16.42 23.06 16.42 22.5C16.42 19.0633 13.6333 16.2767 10.1966 16.2767Z" fill="url(#${iconId}-d)"/>
                <defs>
                  <linearGradient id="${iconId}-a" x1="16.1768" y1="5.69006" x2="24.2301" y2="13.7434" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#60A5FA"></stop>
                    <stop offset="1" stop-color="#2563EB"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-b" x1="5.66325" y1="5.68982" x2="14.7301" y2="14.7567" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BFDBFE"></stop>
                    <stop offset="1" stop-color="#3B82F6"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-c" x1="14.7067" y1="15.2633" x2="25.7" y2="22.7933" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#93C5FD"></stop>
                    <stop offset="1" stop-color="#2563EB"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-d" x1="3.97322" y1="16.2767" x2="16.42" y2="23.52" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#DBEAFE"></stop>
                    <stop offset="1" stop-color="#60A5FA"></stop>
                  </linearGradient>
                </defs>
              </svg>
            `
          default:
            return `
              <svg viewBox="0 0 30.4 30.4" fill="none" aria-hidden="true">
                <path opacity="0.96" d="M6.77684 10.5133C7.61631 10.5133 8.29684 9.83276 8.29684 8.99329C8.29684 8.15382 7.61631 7.47329 6.77684 7.47329C5.93736 7.47329 5.25684 8.15382 5.25684 8.99329C5.25684 9.83276 5.93736 10.5133 6.77684 10.5133Z" fill="url(#${iconId}-0)"/>
                <path opacity="0.88" d="M6.77684 16.7199C7.61631 16.7199 8.29684 16.0394 8.29684 15.1999C8.29684 14.3605 7.61631 13.6799 6.77684 13.6799C5.93736 13.6799 5.25684 14.3605 5.25684 15.1999C5.25684 16.0394 5.93736 16.7199 6.77684 16.7199Z" fill="url(#${iconId}-1)"/>
                <path opacity="0.8" d="M6.77684 22.9266C7.61631 22.9266 8.29684 22.246 8.29684 21.4066C8.29684 20.5671 7.61631 19.8866 6.77684 19.8866C5.93736 19.8866 5.25684 20.5671 5.25684 21.4066C5.25684 22.246 5.93736 22.9266 6.77684 22.9266Z" fill="url(#${iconId}-2)"/>
                <path d="M22.2302 7.40991H11.9702C11.0958 7.40991 10.3869 8.11879 10.3869 8.99325C10.3869 9.8677 11.0958 10.5766 11.9702 10.5766H22.2302C23.1047 10.5766 23.8136 9.8677 23.8136 8.99325C23.8136 8.11879 23.1047 7.40991 22.2302 7.40991Z" fill="url(#${iconId}-3)"/>
                <path opacity="0.9" d="M22.2302 13.6167H11.9702C11.0958 13.6167 10.3869 14.3255 10.3869 15.2C10.3869 16.0744 11.0958 16.7833 11.9702 16.7833H22.2302C23.1047 16.7833 23.8136 16.0744 23.8136 15.2C23.8136 14.3255 23.1047 13.6167 22.2302 13.6167Z" fill="url(#${iconId}-4)"/>
                <path opacity="0.8" d="M22.2302 19.8233H11.9702C11.0958 19.8233 10.3869 20.5322 10.3869 21.4066C10.3869 22.2811 11.0958 22.99 11.9702 22.99H22.2302C23.1047 22.99 23.8136 22.2811 23.8136 21.4066C23.8136 20.5322 23.1047 19.8233 22.2302 19.8233Z" fill="url(#${iconId}-5)"/>
                <defs>
                  <linearGradient id="${iconId}-0" x1="5.06684" y1="3.79996" x2="25.3335" y2="26.6" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-1" x1="5.06684" y1="3.79993" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-2" x1="5.06684" y1="3.7999" x2="25.3335" y2="26.5999" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-3" x1="5.06691" y1="3.79991" x2="25.3336" y2="26.5999" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-4" x1="5.06691" y1="3.79998" x2="25.3336" y2="26.6" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                  <linearGradient id="${iconId}-5" x1="5.06691" y1="3.79996" x2="25.3336" y2="26.6" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A78BFA"></stop>
                    <stop offset="0.54" stop-color="#8B5CF6"></stop>
                    <stop offset="1" stop-color="#7C3AED"></stop>
                  </linearGradient>
                </defs>
              </svg>
            `
        }
      }

      function renderExecutionMetricCard(metric) {
        return `
          <div class="execution-metric tone-${metric.tone}">
            <div class="execution-metric-main">
              <div class="execution-metric-icon tone-${metric.tone}">
                ${getExecutionMetricIcon(metric.icon, metric.tone)}
              </div>
              <div class="execution-metric-body">
                <div class="execution-metric-label">${metric.label}</div>
                <div class="execution-metric-value" ${buildCounterDataAttrs(metric.value)}>${metric.value}</div>
              </div>
            </div>
            <div class="execution-metric-sub">${metric.sub}</div>
          </div>
        `
      }

      function getLeadQcScene(lead, role) {
        if (lead?.qcScene) {
          return lead.qcScene
        }

        return role === 'advisor' ? '进店接待' : '邀约'
      }

      function getLeadIntentLabel(intent) {
        const normalized = (intent ? String(intent) : '').toUpperCase()
        if (normalized === 'H') return '高'
        if (normalized === 'A') return '中'
        if (normalized === 'B') return '低'
        if (normalized === 'C') return '无'
        return '无'
      }

      function getLeadIntentSceneText(lead, role) {
        return `${getLeadIntentLabel(lead.intent)}·${getLeadQcScene(lead, role)}`
      }

      function renderSalesTodoEmptyState(role) {
        const title = role === 'advisor'
          ? '当前筛选下暂无推荐客户'
          : '当前筛选下暂无推荐线索'

        return `
          <div class="todo-empty-state empty-state-card">
            <div class="empty-state-icon" aria-hidden="true">
              <svg class="todo-empty-illustration" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M735.085714 303.542857A73.088 73.088 0 0 0 676.571429 274.285714H347.428571c-23.04 0-44.617143 10.788571-58.514285 29.257143l-135.314286 180.48c-4.754286 6.217143-7.314286 13.897143-7.314286 21.942857V749.714286c0 20.114286 16.457143 36.571429 36.571429 36.571428h658.285714c20.114286 0 36.571429-16.457143 36.571429-36.571428V505.965714c0-7.862857-2.56-15.542857-7.314286-21.942857l-135.314286-180.48z" fill="#EEEEEE"></path>
                <path d="M657.554286 310.857143H366.445714c-11.885714 0-23.04 5.851429-29.988571 15.542857l-106.971429 152.868571c-4.205714 6.034286 0.182857 14.445714 7.497143 14.445715H292.571429c10.057143 0 18.285714 8.228571 18.285714 18.285714v73.142857c0 10.057143 8.228571 18.285714 18.285714 18.285714h365.714286c10.057143 0 18.285714-8.228571 18.285714-18.285714v-73.142857c0-10.057143 8.228571-18.285714 18.285714-18.285714h55.588572c7.314286 0 11.702857-8.411429 7.497143-14.445715l-106.971429-152.868571c-6.948571-9.691429-18.102857-15.542857-29.988571-15.542857z" fill="#DDDDDD"></path>
                <path d="M623.725714 329.142857l13.531429 39.314286 39.314286 13.531428-39.314286 13.714286-13.531429 39.314286-13.714285-39.314286-39.314286-13.714286 39.314286-13.531428z" fill="#FFFFFF"></path>
                <path d="M795.428571 201.142857l7.131429 20.297143 20.297143 7.131429-20.297143 7.131428L795.428571 256l-7.131428-20.297143L768 228.571429l20.297143-7.131429z" fill="#DDDDDD"></path>
                <path d="M393.142857 548.571429l7.131429 20.297142 20.297143 7.131429-20.297143 7.131429L393.142857 603.428571l-7.131428-20.297142L365.714286 576l20.297143-7.131429z" fill="#FFFFFF"></path>
                <path d="M310.857143 237.714286l9.508571 27.062857L347.428571 274.285714l-27.062857 9.508572L310.857143 310.857143l-9.508572-27.062857L274.285714 274.285714l27.062857-9.508571z" fill="#DDDDDD"></path>
              </svg>
            </div>
            <strong>${title}</strong>
            <span>可以切换日期范围、意向筛选或时间规则查看其他内容。</span>
          </div>
        `
      }

      const SALES_TODO_PAGE_SIZE = 3

      function getSalesTodoPaginationItems(totalPages, currentPage) {
        if (totalPages <= 7) {
          return Array.from({ length: totalPages }, (_, index) => index + 1)
        }

        const items = [1]
        if (currentPage > 3) items.push('ellipsis-left')
        for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
          items.push(page)
        }
        if (currentPage < totalPages - 2) items.push('ellipsis-right')
        items.push(totalPages)
        return items
      }

      function getSalesTodoRoleState(role) {
        return role === 'advisor' ? advisorState : dccState
      }

      function rerenderSalesTodoByRole(role) {
        if (role === 'advisor') {
          renderAdvisorTodos()
          return
        }
        renderDccTodos()
      }

      function bindSalesTodoPaginationEvents(role, totalPages) {
        const pagination = document.getElementById('salesTodoPagination')
        const roleState = getSalesTodoRoleState(role)
        if (!pagination || !roleState) {
          return
        }

        pagination.querySelectorAll('[data-sales-todo-page]').forEach((node) => {
          node.addEventListener('click', () => {
            const nextPage = Number(node.dataset.salesTodoPage || roleState.todoPage || 1)
            if (nextPage === roleState.todoPage) {
              return
            }
            roleState.todoPage = nextPage
            rerenderSalesTodoByRole(role)
          })
        })

        pagination.querySelectorAll('[data-sales-todo-page-arrow]').forEach((node) => {
          node.addEventListener('click', () => {
            const delta = node.dataset.salesTodoPageArrow === 'prev' ? -1 : 1
            const currentPage = roleState.todoPage || 1
            const nextPage = Math.min(totalPages, Math.max(1, currentPage + delta))
            if (nextPage === currentPage) {
              return
            }
            roleState.todoPage = nextPage
            rerenderSalesTodoByRole(role)
          })
        })

        pagination.querySelectorAll('[data-sales-todo-page-jump-input]').forEach((node) => {
          const applyPageJump = () => {
            const nextPage = Math.min(totalPages, Math.max(1, Number(node.value || 1)))
            if (nextPage === roleState.todoPage) {
              return
            }
            roleState.todoPage = nextPage
            rerenderSalesTodoByRole(role)
          }

          node.addEventListener('change', applyPageJump)
          node.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyPageJump()
            }
          })
        })
      }

      function renderSalesTodoPagination(role, totalItems) {
        const pagination = document.getElementById('salesTodoPagination')
        const roleState = getSalesTodoRoleState(role)
        if (!pagination || !roleState) {
          return
        }

        if (totalItems <= 0) {
          pagination.innerHTML = ''
          pagination.style.display = 'none'
          return
        }

        pagination.style.display = ''
        const totalPages = Math.max(1, Math.ceil(totalItems / SALES_TODO_PAGE_SIZE))
        roleState.todoPage = Math.min(totalPages, Math.max(1, roleState.todoPage || 1))
        const items = getSalesTodoPaginationItems(totalPages, roleState.todoPage)

        pagination.innerHTML = `
          <div class="dashboard-pagination">
            <span class="session-pagination-total">共 ${totalItems} 条</span>
            <div class="dashboard-pagination-controls">
              <label class="page-select">
                <span>3 条/页</span>
              </label>
              <div class="page-group">
                <button type="button" class="page-arrow" data-sales-todo-page-arrow="prev" ${roleState.todoPage === 1 ? 'disabled' : ''}>‹</button>
                ${items
                  .map((item) =>
                    typeof item === 'number'
                      ? `<button type="button" class="page-num ${item === roleState.todoPage ? 'active' : ''}" data-sales-todo-page="${item}">${item}</button>`
                      : '<span class="page-ellipsis">…</span>'
                  )
                  .join('')}
                <button type="button" class="page-arrow" data-sales-todo-page-arrow="next" ${roleState.todoPage === totalPages ? 'disabled' : ''}>›</button>
              </div>
              <div class="page-group page-jump-group">
                <span class="session-page-jump-label">前往</span>
                <label class="page-select page-jump-select">
                  <input type="number" min="1" max="${totalPages}" value="${roleState.todoPage}" data-sales-todo-page-jump-input>
                </label>
                <span class="session-page-jump-suffix">页</span>
              </div>
            </div>
          </div>
        `

        bindSalesTodoPaginationEvents(role, totalPages)
      }

      function renderDccFocus() {
        const filteredLeads = getFilteredDccLeads()
        const totalLeads = filteredLeads.length
        const completedLeads = filteredLeads.filter((lead) => isDccLeadCompleted(lead.id)).length
        const pendingLeads = totalLeads - completedLeads
        const highIntentLeads = filteredLeads.filter((lead) => lead.intent.toUpperCase() === 'H').length
        const focus = dccDashboard.focus
        const metrics = [
          { label: '高质量线索', value: highIntentLeads, sub: 'H/A 级线索在筛选时间内', tone: 'blue', icon: 'star' },
          { label: '待处理', value: pendingLeads, sub: '线索待人工确认', tone: 'amber', icon: 'clock' },
          { label: '已完成', value: completedLeads, sub: '已标记完成状态', tone: 'green', icon: 'check' },
          { label: '线索总数', value: totalLeads, sub: '筛选时间内的全部线索', tone: 'violet', icon: 'list' }
        ]

        const focusTitle = document.getElementById('focus-title')
        const focusDesc = document.getElementById('focus-desc')
        if (focusTitle) {
          focusTitle.textContent = focus.title
        }
        if (focusDesc) {
          focusDesc.textContent = focus.desc
        }
        const modeChipSub = document.getElementById('mode-chip-sub')
        if (modeChipSub) {
          modeChipSub.textContent = focus.summary
        }
        const recommendBannerTitle = document.getElementById('recommend-banner-title')
        const recommendBannerDesc = document.getElementById('recommend-banner-desc')
        const recommendBannerActions = document.getElementById('recommend-banner-actions')
        if (recommendBannerTitle) {
          recommendBannerTitle.textContent = focus.bannerTitle
        }
        if (recommendBannerDesc) {
          recommendBannerDesc.textContent = focus.bannerDesc
        }
        if (recommendBannerActions) {
          recommendBannerActions.innerHTML = focus.bannerChips
            .map((chip) => `<span class="recommend-banner-chip">${chip}</span>`)
            .join('')
        }
        document.getElementById('execution-focus-metrics').innerHTML = metrics.map(renderExecutionMetricCard).join('')
        document.getElementById('lead-view-note').textContent = getDccViewNote()
      }

      function buildDccLeadCard(lead) {
        const isCompleted = isDccLeadCompleted(lead.id)

        return `
          <div class="todo-item intent-${lead.intent.toLowerCase()} ${lead.priority} ${isCompleted ? 'completed' : ''}" data-lead-id="${lead.id}">
            <div class="todo-priority-icon">${renderTodoPriorityIcon()}</div>
            <div class="todo-body">
              <div class="todo-head todo-head-compact">
                <div class="todo-summary-main">
                  <div class="todo-customer-row">
	                    <div class="todo-customer-name">${lead.customer}</div>
	                    <span class="intent-badge ${lead.intent.toLowerCase()}">${getLeadIntentSceneText(lead, 'dcc')}</span>
	                    <span class="todo-model-chip">${lead.model}</span>
	                    <div class="todo-checkbox-wrapper">
	                      <button
	                        type="button"
	                        class="todo-status-toggle ${isCompleted ? 'is-revert' : ''}"
	                        data-dcc-complete="${lead.id}"
	                        title="${isCompleted ? '撤销处理' : '立即处理'}"
	                      >${isCompleted ? '撤销处理' : '立即处理'}</button>
	                    </div>
	                  </div>
                  <div class="todo-time">最近更新 ${lead.updatedAt}</div>
                </div>
              </div>

              <div class="role-compact-body">
                <div class="todo-next-step">
                  <div class="todo-guidance-head">
                    <span class="todo-guidance-label todo-guidance-label-primary"><img class="todo-guidance-label-icon" src="../assets/sales-followup-icon.svg" alt="" aria-hidden="true">跟进建议</span>
                    ${lead.followUpTime ? `<span class="followup-time-badge">建议时间 ${lead.followUpTime}</span>` : ''}
                  </div>
                  <div class="todo-next-step-text">${lead.action}</div>
                  <div class="todo-action-btns">
                    <button type="button" class="lead-detail-toggle">
                      <span class="toggle-text">展开</span>
                      <span class="toggle-arrow">▼</span>
                    </button>
                    <button type="button" class="lead-detail-btn" ${buildSalesLeadDetailDataAttrs(lead)}>录音详情</button>
                  </div>
                  ${isCompleted ? '<div class="todo-processed-stamp" aria-hidden="true">已处理</div>' : ''}
                </div>

                <div class="lead-detail-content" hidden>
                  <div class="role-compact-grid">
                    <div class="role-compact-panel">
                      <div class="todo-guidance-label todo-guidance-label-reason">推荐理由</div>
                      <div class="todo-guidance-text sales-gap-top">${lead.summary}</div>
                    </div>
                    <div class="role-compact-panel">
                      <div class="todo-guidance-label todo-guidance-label-info">关键信息</div>
                      <div class="role-tag-row sales-gap-top">
                        ${lead.tags.map((tag) => `<span class="todo-tag-chip">${tag}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        `
      }

      function renderDccTodos() {
        const list = document.getElementById('todo-list')
        if (!list) {
          return
        }

        const leads = [...getFilteredDccLeads()].sort((leftLead, rightLead) => {
          const leftCompleted = isDccLeadCompleted(leftLead.id)
          const rightCompleted = isDccLeadCompleted(rightLead.id)

          if (leftCompleted !== rightCompleted) {
            return leftCompleted ? 1 : -1
          }

          return compareSalesLeadsByMode(leftLead, rightLead, dccState.recommendMode)
        })

        if (!leads.length) {
          list.innerHTML = renderSalesTodoEmptyState('dcc')
          renderSalesTodoPagination('dcc', 0)
          return
        }

        const totalItems = leads.length
        const totalPages = Math.max(1, Math.ceil(totalItems / SALES_TODO_PAGE_SIZE))
        dccState.todoPage = Math.min(totalPages, Math.max(1, dccState.todoPage || 1))
        const startIndex = (dccState.todoPage - 1) * SALES_TODO_PAGE_SIZE
        const pagedLeads = leads.slice(startIndex, startIndex + SALES_TODO_PAGE_SIZE)

        list.innerHTML = pagedLeads.map(buildDccLeadCard).join('')

        list.querySelectorAll('[data-dcc-complete]').forEach((button) => {
          button.addEventListener('click', () => {
            const leadId = button.dataset.dccComplete
            if (!leadId) {
              return
            }

            if (button.classList.contains('is-revert')) {
              playTodoRevertStamp(button, () => toggleDccLeadComplete(leadId, { animateMove: true }))
              return
            }

            playTodoProcessStamp(button, () => toggleDccLeadComplete(leadId, { animateMove: true }))
          })
        })

        list.querySelectorAll('.lead-detail-toggle').forEach((toggle) => {
          toggle.addEventListener('click', () => {
            const content = toggle.closest('.role-compact-body')?.querySelector('.lead-detail-content')
            if (!content) {
              return
            }

            const nextHidden = !content.hidden
            content.hidden = nextHidden

            const text = toggle.querySelector('.toggle-text')
            const arrow = toggle.querySelector('.toggle-arrow')
            if (text) text.textContent = nextHidden ? '展开' : '收起'
            if (arrow) arrow.textContent = nextHidden ? '▼' : '▲'
          })
        })

        list.querySelectorAll('[data-open-route]').forEach((button) => {
          button.addEventListener('click', () => openRouteInNewTab(button.dataset.openRoute, {
            leadId: button.dataset.leadId,
            leadSource: button.dataset.leadSource,
            sessionId: button.dataset.sessionId,
            sessionStore: button.dataset.sessionStore,
            sessionDate: button.dataset.sessionDate,
            sessionCustomer: button.dataset.sessionCustomer,
            sessionScene: button.dataset.sessionScene
          }))
        })

        renderSalesTodoPagination('dcc', totalItems)
      }

      function renderDccArrivalPanel() {
        const summary = document.getElementById('arrival-summary')
        const pipeline = document.getElementById('arrival-pipeline')
        const board = document.getElementById('arrival-board')
        if (!summary || !pipeline || !board) {
          return
        }

        summary.innerHTML = `
          <div class="history-summary-title">${dccDashboard.arrivalSummary.title}</div>
          <div class="history-summary-text">${dccDashboard.arrivalSummary.text}</div>
        `

        pipeline.innerHTML = dccDashboard.arrivalSummary.cards.map((card) => `
          <div class="pipeline-card">
            <div class="pipeline-title">${card.title}</div>
            <div class="pipeline-value" ${buildCounterDataAttrs(card.value)}>${card.value}</div>
            <div class="pipeline-sub">${card.sub}</div>
          </div>
        `).join('')

        board.innerHTML = dccDashboard.arrivals.map((item) => `
          <div class="history-item">
            <div class="history-customer">
              <div class="history-name">${item.customer}</div>
              <div class="history-meta">车型：${item.model}</div>
              <div class="history-meta">来源：${item.source}</div>
              <div class="history-meta">到店时间：${item.time}</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">接待顾问</div>
              <div class="history-block-text">${item.consultant}</div>
              <div class="history-meta">${item.note}</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">到店提醒</div>
              <div class="history-block-text">${item.reminder}</div>
              <div class="history-meta">DCC 需在到店前确保提醒、停车指引和交接备注齐全。</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">责任状态</div>
              <div class="history-block-text">邀约责任持续到客户签到</div>
              <div class="history-meta">签到后转入接待专员的接待和试驾流程。</div>
            </div>
          </div>
        `).join('')
      }

      function sortDccRows(rows) {
        const sorted = [...rows]
        const factor = dccState.sortDirection === 'asc' ? 1 : -1
        sorted.sort((leftRow, rightRow) => {
          const left = leftRow[dccState.sortColumn] || ''
          const right = rightRow[dccState.sortColumn] || ''
          return left.localeCompare(right) * factor
        })
        return sorted
      }

      function getDccConsultantName(lead) {
        if (lead.chainNote.includes('销售顾问 ')) {
          return lead.chainNote.split('销售顾问 ')[1].split('，')[0].trim()
        }
        if (lead.chainNote.includes('接待顾问 ')) {
          return lead.chainNote.split('接待顾问 ')[1].split('已')[0].trim()
        }
        if (lead.chainNote.includes('暂无')) {
          return '待分配'
        }
        return '待确认'
      }

      function renderDccAllLeads() {
        const thead = document.getElementById('all-leads-thead')
        const tbody = document.getElementById('all-leads-tbody')
        if (!thead || !tbody) {
          return
        }

        thead.innerHTML = `
          <tr>
            <th>客户</th>
            <th class="th-sortable" data-sort="stage">阶段</th>
            <th>来源</th>
            <th>响应情况</th>
            <th>接待顾问</th>
            <th class="th-sortable" data-sort="syncLabel">同步状态</th>
            <th>最近说明</th>
          </tr>
        `

        tbody.innerHTML = sortDccRows(dccDashboard.leads).map((lead) => `
          <tr>
            <td><strong>${lead.customer}</strong><div class="sales-table-sub">${lead.model} · ${lead.intent}级</div></td>
            <td>${lead.stage}</td>
            <td>${lead.source}</td>
            <td>${lead.responseText}</td>
            <td>${getDccConsultantName(lead)}</td>
            <td><span class="sync-pill ${lead.syncStatus}">${lead.syncLabel}</span></td>
            <td class="sales-table-note">${lead.syncNote}</td>
          </tr>
        `).join('')

        thead.querySelectorAll('[data-sort]').forEach((node) => {
          node.addEventListener('click', () => {
            const sortKey = node.dataset.sort
            if (dccState.sortColumn === sortKey) {
              dccState.sortDirection = dccState.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
              dccState.sortColumn = sortKey
              dccState.sortDirection = 'asc'
            }
            renderDccAllLeads()
          })
        })
      }

      function renderDccReview() {
        const review = dccDashboard.review
        const summaryText = getSalesReviewSummaryText(review, dccState)

        document.getElementById('review-sub').textContent = review.sub
        document.getElementById('review-score-circle').style.setProperty('--score', String(review.score))
        updateReviewScoreRing(review.score)
        const scoreNode = document.getElementById('review-score-val')
        const labelNode = document.getElementById('review-score-label')
        if (scoreNode) {
          scoreNode.dataset.scoreTarget = String(review.score)
          scoreNode.dataset.scoreLabel = review.label
          setReviewScoreDisplay(scoreNode, review.score, review.label)
        }
        if (labelNode) {
          labelNode.textContent = review.label
        }
        const summaryNode = document.getElementById('review-ai-summary')
        if (summaryNode) {
          if (dccState.reviewSummaryGenerated) {
            summaryNode.classList.remove('is-obscured')
            if (dccState.reviewSummaryTypingDone && dccState.reviewSummaryLastText === summaryText) {
              renderSalesReviewSummaryStatic(summaryNode, summaryText)
            } else {
              startSalesReviewSummaryTyping(summaryNode, summaryText, 'dcc')
            }
          } else if (dccState.reviewSummaryGenerating) {
            summaryNode.classList.add('is-obscured')
            summaryNode.innerHTML = `
              ${getSalesReviewObscuredSummaryHtml()}
              <div class="review-ai-generate-loading" aria-live="polite" role="status">
                <span class="review-ai-loading-spinner" aria-hidden="true"></span>
                <span>生成中...</span>
              </div>
            `
          } else {
            summaryNode.classList.add('is-obscured')
            summaryNode.innerHTML = `
              ${getSalesReviewObscuredSummaryHtml()}
              <button type="button" class="btn-primary review-ai-generate-btn" data-review-generate>立即生成</button>
            `
          }
        }
        setSalesReviewRobotPlayback('dcc', isSalesReviewSummaryInProgress('dcc'))
        renderSalesReviewInsights('dcc')
        renderSalesSopReview('dcc')
      }

      function renderDccFilterCounts() {
        const leads = getSalesScopedLeadPool(dccDashboard.leads, dccState)
        document.getElementById('tc-all').textContent = leads.length
        document.getElementById('tc-high').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'high').length
        document.getElementById('tc-medium').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'medium').length
        document.getElementById('tc-low').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'low').length
        document.getElementById('tc-none').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'none').length
      }

      function renderDccTrendLegend() {
        document.getElementById('trend-legend').innerHTML = `
          <span><i class="legend-dot" style="background:#2563eb"></i>个人合格率</span>
          <span><i class="legend-dot" style="background:#94a3b8"></i>门店合格率</span>
          <span><i class="legend-dot" style="background:rgba(37,99,235,0.15)"></i>个人录音量</span>
        `
      }

      function initDccTrendChart() {
        const canvas = document.getElementById('trendChart')
        if (!canvas) {
          return
        }

        const data = dccDashboard.trendData[dccState.trendRange]
        const maxCount = Math.max(...data.recordingVolume, 0)
        const chartConfig = {
          labels: data.labels,
          leftAxis: {
            min: 0,
            max: maxCount,
            ticks: Array.from({ length: maxCount + 1 }, (_, index) => index),
            label: '录音量',
            formatLabel: (value) => String(value)
          },
          rightAxis: {
            min: 50,
            max: 100,
            ticks: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
            label: '合格率',
            formatLabel: (value) => `${value}%`
          },
          bars: {
            axis: 'left',
            data: data.recordingVolume,
            fill: 'rgba(37, 99, 235, 0.16)',
            stroke: 'rgba(37, 99, 235, 0.92)',
            widthRatio: 0.72,
            radius: 6
          },
          datasets: [
            { axis: 'right', color: '#2563eb', data: data.personalQualifiedRate, pointRadius: 4, lineWidth: 3, curved: true, solidPoint: true, fillColor: 'rgba(37,99,235,0.08)' },
            { axis: 'right', color: '#94a3b8', data: data.storeAverageRate, pointRadius: 4, lineWidth: 2.5, dash: [6, 4], curved: true, solidPoint: true }
          ]
        }

        animateSalesTrendChart(canvas, chartConfig, data)
      }

      function bindDccEvents() {
        bindSalesReviewRobotPlayback('dcc')
        document.getElementById('review-ai-summary')?.addEventListener('click', (event) => {
          const generateButton = event.target.closest('[data-review-generate]')
          if (!generateButton || dccState.reviewSummaryGenerated || dccState.reviewSummaryGenerating) {
            return
          }

          clearSalesReviewTypingTimer(dccState)
          dccState.reviewSummaryTypingDone = false
          dccState.reviewSummaryLastText = ''
          dccState.reviewSummaryGenerating = true
          renderDccReview()

          if (dccState.reviewSummaryGenerateTimer) {
            window.clearTimeout(dccState.reviewSummaryGenerateTimer)
          }
          dccState.reviewSummaryGenerateTimer = window.setTimeout(() => {
            dccState.reviewSummaryGenerating = false
            dccState.reviewSummaryGenerated = true
            dccState.reviewSummaryGenerateTimer = null
            if (getCurrentRoute() === 'sales-dcc' || getCurrentRoute() === 'sales-dashboard') {
              renderDccReview()
            }
          }, 3000)
        })

        document.querySelector('.review-insight-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-review-insight-tab]')
          if (!button || button.dataset.reviewInsightTab === dccState.reviewInsightTab) {
            return
          }

          const tab = button.dataset.reviewInsightTab
          if (!['strength', 'weakness', 'risk'].includes(tab)) return
          dccState.reviewInsightTab = tab
          dccState.reviewInsightPage = 1
          dccState.reviewRuleQuery = ''
          dccState.reviewRuleSort = 'rate-desc'
          renderDccReview()
        })

        document.getElementById('recommend-mode-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-mode]')
          if (!button) {
            return
          }

          dccState.recommendMode = button.dataset.mode
          dccState.todoPage = 1
          document.querySelectorAll('#recommend-mode-tabs [data-mode]').forEach((node) => {
            node.classList.toggle('active', node.dataset.mode === dccState.recommendMode)
          })
          renderDccFilterCounts()
          renderDccFocus()
          renderDccTodos()
          updateDccCompletedCount()
        })

        document.getElementById('todo-filter-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-filter]')
          if (!button) {
            return
          }

          dccState.todoFilter = button.dataset.filter
          dccState.todoPage = 1
          document.querySelectorAll('#todo-filter-tabs [data-filter]').forEach((node) => {
            node.classList.toggle('active', node.dataset.filter === dccState.todoFilter)
          })
          renderDccFocus()
          renderDccTodos()
          updateDccCompletedCount()
        })

        document.getElementById('lead-view-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-view]')
          if (!button) {
            return
          }

          dccState.leadView = button.dataset.view
          document.querySelectorAll('#lead-view-tabs [data-view]').forEach((node) => {
            node.classList.toggle('active', node.dataset.view === dccState.leadView)
          })
          ;['recommend', 'arrival', 'all'].forEach((name) => {
            const panel = document.getElementById(`lead-view-${name}`)
            if (panel) {
              panel.classList.toggle('active', name === dccState.leadView)
            }
          })
          const filterRow = document.getElementById('lead-filter-row')
          if (filterRow) {
            filterRow.style.display = dccState.leadView === 'recommend' ? '' : 'none'
          }
          if (dccState.leadView !== 'recommend') {
            closeSalesRoleDatePicker()
          }
          renderDccFilterCounts()
          renderDccFocus()
          updateDccCompletedCount()
        })

        document.getElementById('trend-range-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-range]')
          if (!button) {
            return
          }

          dccState.trendRange = parseInt(button.dataset.range, 10)
          document.querySelectorAll('#trend-range-tabs [data-range]').forEach((node) => {
            node.classList.toggle('active', node.dataset.range === button.dataset.range)
          })
          window.requestAnimationFrame(initDccTrendChart)
        })

      }

      function initSalesDccPage() {
        resetDccState()
        loadDccCompletedLeads()
        renderDccProfile()
        renderDccHeroMetrics()
        renderDccFilterCounts()
        renderSalesRoleDateControl('dcc')
        renderSalesReviewSceneControl('dcc')
        renderDccFocus()
        renderDccTodos()
        updateDccCompletedCount()
        renderDccArrivalPanel()
        renderDccAllLeads()
        renderDccReview()
        renderDccTrendLegend()
        bindDccEvents()
        window.requestAnimationFrame(initDccTrendChart)
        window.requestAnimationFrame(() => animateSalesDashboardCounters(document.querySelector('.sales-dcc-page')))
        initStickyFilterBars()
      }

      function toggleDccLeadComplete(leadId, options = {}) {
        const list = options.animateMove ? document.getElementById('todo-list') : null
        const previousPositions = options.animateMove ? captureTodoItemPositions(list) : null

        if (dccState.completedLeads.has(leadId)) {
          dccState.completedLeads.delete(leadId)
        } else {
          dccState.completedLeads.add(leadId)
        }

        saveDccCompletedLeads()
        renderDccFocus()
        renderDccTodos()
        updateDccCompletedCount()

        if (options.animateMove) {
          animateTodoListReorder(document.getElementById('todo-list'), previousPositions, leadId)
        }
      }

      function createDefaultAdvisorState() {
        return {
          leadView: 'recommend',
          todoFilter: 'all',
          todoPage: 1,
          trendRange: 7,
          sortColumn: 'stage',
          sortDirection: 'asc',
          completedLeads: new Set(),
          reviewSummaryGenerated: false,
          reviewSummaryGenerating: false,
          reviewSummaryGenerateTimer: null,
          reviewSummaryTypingTimer: null,
          reviewSummaryTypingDone: false,
          reviewSummaryLastText: '',
          reviewInsightTab: 'strength',
          reviewInsightPage: 1,
          reviewRuleQuery: '',
          reviewRuleSort: 'rate-desc',
          sopReviewPage: 1,
          sopReviewRuleQuery: '',
          sopReviewRuleSort: 'rate-desc',
          reviewScenes: [],
          reviewSceneOpen: false,
          recommendRangeTab: 'last7',
          recommendRangeMode: 'last7',
          recommendMode: 'followup',
          recommendDateStart: '',
          recommendDateEnd: ''
        }
      }

      const advisorState = createDefaultAdvisorState()

      function loadAdvisorCompletedLeads() {
        try {
          const saved = localStorage.getItem('advisor-completed-leads')
          advisorState.completedLeads = saved ? new Set(JSON.parse(saved)) : new Set()
        } catch (error) {
          advisorState.completedLeads = new Set()
        }
      }

      function saveAdvisorCompletedLeads() {
        try {
          localStorage.setItem('advisor-completed-leads', JSON.stringify([...advisorState.completedLeads]))
        } catch (error) {
          console.warn('保存顾问清单完成状态失败')
        }
      }

      function isAdvisorLeadCompleted(leadId) {
        return advisorState.completedLeads.has(leadId)
      }

      function updateAdvisorCompletedCount() {
        const banner = document.getElementById('recommend-banner')
        if (!banner) {
          return
        }

        const title = banner.querySelector('.recommend-banner-title')
        const desc = banner.querySelector('.recommend-banner-desc')
        const completedCount = advisorState.completedLeads.size

        if (completedCount > 0) {
          if (title) title.textContent = `今日已完成 ${completedCount} 条客户接待`
          if (desc) desc.textContent = '已完成项已自动移至底部，继续推进其他未完成项'
          return
        }

        if (title) title.textContent = advisorDashboard.focus.bannerTitle
        if (desc) desc.textContent = advisorDashboard.focus.bannerDesc
      }

      const currentAdvisor = {
        name: '李昱',
        avatar: '李',
        store: '上海中心店',
        title: '接待专员'
      }

      const advisorDashboard = {
        metrics: cloneSalesMetrics(advisorMetricsByRange.last7),
        metricsByRange: advisorMetricsByRange,
        focus: {
          title: '处理线索，推进试驾报价',
          desc: '根据筛选时间内的线索优先处理，完成后及时标记状态。',
          metrics: [
            { label: '待接待', value: 2, sub: '2 组客户今天已经确认到店时间' },
            { label: '待试驾', value: 2, sub: '2 组客户已完成接待，适合尽快进入试驾' },
            { label: '报价 / 议价中', value: 2, sub: '2 组客户已进入方案谈判窗口' },
            { label: '战败待回访', value: 1, sub: '1 组客户需 3 天内完成回访记录' }
          ],
          bannerTitle: '先把到店客户接住，再让试驾和报价连起来',
          bannerDesc: '顾问页最重要的是承接。今天先处理待接待和待试驾客户，再集中推进报价、议价和战败回访。',
          bannerChips: ['待接待先承接', '试驾后马上报价', '战败客户补回访'],
          summary: '当前页面固定为接待专员视角，只看到店后的接待、试驾、谈判与回访。'
        },
        review: {
          score: 57,
          label: '质检通过率',
          sub: '接待专员表现总评与关键时刻分析',
          summary: '近7天接待承接比较稳，客户基础信息利用得也不错，主要问题集中在接待后没有尽快推进试驾，以及试驾后报价衔接还不够快。',
          summaryByRange: {
            yesterday: '昨日顾问侧承接动作整体稳定，短板主要是“接待后推进试驾”不够果断，导致部分高热客户进入观望。今天建议优先处理待试驾客户。',
            last7: '近7天接待承接比较稳，客户基础信息利用得也不错，主要问题集中在接待后没有尽快推进试驾，以及试驾后报价衔接还不够快。',
            last15: '近半月看，顾问端在接待环节表现平稳，但试驾后报价转化节奏波动较大。建议统一“试驾结束后当日完成首轮报价”的动作规范。',
            last30: '近1月维度下，接待质量整体向好，但报价链路仍有断点。把接待、试驾、报价的串联时间压缩到同一工作日，转化效率会更高。',
            custom: '{dateRange} 内，顾问端短板集中在试驾与报价衔接速度。建议优先梳理高热客户的当日推进动作，避免热度回落。'
          },
          weaknesses: [
            {
              title: '接待后进入试驾的动作不够果断',
              desc: '客户兴趣点已经被激发，但还停留在静态讲解，错过了最适合推进试驾的窗口。',
              link: '关联客户：赵女士 · 03-22 15:18（待试驾样本）',
              detailParams: {
                sessionId: buildMockRecordingId(3100),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 15:18',
                sessionCustomer: '赵女士',
                sessionScene: '进店接待'
              }
            },
            {
              title: '试驾后报价动作稍慢',
              desc: '客户试驾反馈积极，但报价与金融方案没有在热度最高时立刻跟上，导致议价周期被拉长。',
              link: '关联客户：王先生 · 03-22 16:02（报价样本）',
              detailParams: {
                sessionId: buildMockRecordingId(3101),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 16:02',
                sessionCustomer: '王先生',
                sessionScene: '试驾'
              }
            }
          ],
          strengths: [
            {
              title: '到店交接后的需求承接完整',
              desc: '能够直接利用 DCC 同步来的基础信息，不重复盘问客户，把时间用在需求深挖和异议处理上。',
              link: '关联客户：陈先生 · 03-22 11:46（成交样本）',
              detailParams: {
                sessionId: buildMockRecordingId(3102),
                sessionStore: '上海中心店',
                sessionDate: '2026/03/22 11:46',
                sessionCustomer: '陈先生',
                sessionScene: '试驾'
              }
            }
          ]
        },
        chainSummary: {
          title: '交接与承接',
          text: '这里单独把邀约专员交接给你的客户拉出来，方便看今天谁待接待、谁待试驾、谁已经进入报价和议价。',
          cards: [
            { title: '今日待接待', value: '2', sub: '均已由 DCC 补齐基础信息' },
            { title: '待试驾', value: '2', sub: '应优先安排车型与路线' },
            { title: '报价中', value: '1', sub: '试驾热度仍在，适合当天收口' },
            { title: '战败待回访', value: '1', sub: '需补充回访与战败原因' }
          ]
        },
        leads: [
          {
            id: buildMockLeadId(4100),
            priority: 'important',
            intent: 'A',
            customer: '王先生',
            model: '传祺 M8',
            stage: '试驾后报价中',
            qcScene: '试驾',
            appointmentOwner: 'DCC 张琳',
            receptionOwner: '李昱',
            followupOwner: '李昱',
            source: '汽车之家',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '上游已回传试驾和报价记录，当前适合趁热推进金融方案和置换测算。',
            summary: '客户试驾反馈积极，但预算仍有拉扯，当前正处于最适合报价与议价收口的窗口。',
            action: '今天优先补一版预算分层方案，把置换和金融两个版本一起讲清楚，避免客户回去后失温。',
            tags: ['A级中意向', '试驾已完成', '预算异议处理中'],
            chainNote: 'DCC 已完成到店交接，当前由你负责报价、议价和后续跟进。',
            updatedAt: '2026-03-23 09:12',
            followUpTime: '2026-03-23 15:00'
          },
          {
            id: buildMockLeadId(4101),
            priority: 'urgent',
            intent: 'A',
            customer: '赵女士',
            model: '传祺 ES9',
            stage: '已接待待试驾',
            qcScene: '进店接待',
            appointmentOwner: 'DCC 张琳',
            receptionOwner: '李昱',
            followupOwner: '李昱',
            source: '门店活动邀约',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: '接待完成记录已同步，但试驾预约尚未回写，需要你尽快排定路线和时段。',
            summary: '客户已经到店完成基础接待，兴趣点明确，但如果今天不推进试驾，热度容易掉下去。',
            action: '把她放进今天的优先试驾清单，尽快锁定车型、路线和陪同人安排。',
            tags: ['A级中意向', '今日待试驾', '二次到店'],
            chainNote: 'DCC 张琳已补齐预算和家庭场景信息，你可以直接进入试驾安排。',
            updatedAt: '2026-03-23 08:45',
            followUpTime: '2026-03-23 14:00'
          },
          {
            id: buildMockLeadId(4102),
            priority: 'urgent',
            intent: 'B',
            customer: '黄先生',
            model: '传祺 E9',
            stage: '今日预约待到店',
            qcScene: '进店接待',
            appointmentOwner: 'DCC 张琳',
            receptionOwner: '李昱',
            followupOwner: '待接待后确认',
            source: '电话回呼',
            syncStatus: 'ok',
            syncLabel: '待到店',
            syncNote: 'DCC 已确认客户今天下午到店，你需要提前准备接待和试驾承接。',
            summary: '客户今天首次到店，基础信息已经由 DCC 录好，顾问端要做好首轮接待和车型演示准备。',
            action: '提前看完交接备注，到店后直接进入需求深挖，不要再重复问基础信息。',
            tags: ['B级今日到店', '首次进店', '待接待'],
            chainNote: '邀约阶段已完成，客户签到后由你承接接待并决定是否继续跟进。',
            updatedAt: '2026-03-23 07:56',
            followUpTime: '2026-03-23 16:00'
          },
          {
            id: buildMockLeadId(4103),
            priority: 'important',
            intent: 'A',
            customer: '陈先生',
            model: '传祺 M7',
            stage: '已下订',
            qcScene: '试驾',
            appointmentOwner: 'DCC 张琳',
            receptionOwner: '陈涛',
            followupOwner: '李昱',
            source: '抖音留资',
            syncStatus: 'ok',
            syncLabel: '同步正常',
            syncNote: 'DMS 已回传订单信息，可作为接待后回访催化成功的标准样本。',
            summary: '客户首轮接待后回店犹豫，后续由你连续回访促成下订，适合做顾问端成交样本复盘。',
            action: '这条今天不需要追动作，重点复盘试驾后如何把报价、回访和催化串起来。',
            tags: ['成交样本', '离店后催化', 'A级'],
            chainNote: '现场接待由陈涛完成，你承接回访后促成下订，是典型协同成交样本。',
            updatedAt: '2026-03-23 09:02',
            followUpTime: '2026-03-24 10:00'
          },
          {
            id: buildMockLeadId(4104),
            priority: 'normal',
            intent: 'C',
            customer: '孙女士',
            model: '传祺 M8 Pro',
            stage: '已到店待回访',
            qcScene: '进店接待',
            appointmentOwner: 'DCC 苏楠',
            receptionOwner: '李昱',
            followupOwner: '待确认',
            source: '老客转介绍',
            syncStatus: 'warn',
            syncLabel: '回访待确认',
            syncNote: '接待动作已同步，但离店后的跟进责任还未在系统中补齐，需要先确认 follow owner。',
            summary: '客户上周已到店并听完讲解，目前既没有明确战败也没有后续回访记录，最容易在忙时被遗漏。',
            action: '先补齐回访责任，再确认客户是继续推进还是转入战败回访，避免客户悬空。',
            tags: ['C级培育', '责任待确认', '离店未闭环'],
            chainNote: '前序接待由你完成，但离店后的跟进责任尚未补齐。',
            updatedAt: '2026-03-22 18:10',
            followUpTime: '2026-03-24 09:00'
          },
          {
            id: buildMockLeadId(4105),
            priority: 'urgent',
            intent: 'B',
            customer: '吴女士',
            model: '传祺 M9',
            stage: '战败回访待确认',
            qcScene: '试驾',
            appointmentOwner: 'DCC 苏楠',
            receptionOwner: '李昱',
            followupOwner: '李昱',
            source: '异业合作',
            syncStatus: 'danger',
            syncLabel: '战败待补录',
            syncNote: '客户未成交，但战败原因和回访结果还没有在上游系统中补齐。',
            summary: '这类客户最怕被拖过 3 天，一旦不及时记录战败原因，后面复盘和二次激活都会断层。',
            action: '今天先补齐战败原因，再确认价格、竞品还是时机导致流失，保留二次激活可能。',
            tags: ['B级客户', '战败待回访', '需补原因'],
            chainNote: '到店接待和试驾都已完成，当前只剩战败回访与原因归档。',
            updatedAt: '2026-03-22 21:30',
            followUpTime: '2026-03-23 11:00'
          }
        ],
        trendData: {
          7: {
            labels: ['03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [76, 73, 74, 75, 74, 75, 74]
          },
          15: {
            labels: ['03/04', '03/05', '03/06', '03/07', '03/08', '03/09', '03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [5, 6, 7, 5, 8, 6, 7, 8, 9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [82, 85, 88, 82, 90, 87, 91, 89, 93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [71, 72, 73, 71, 74, 72, 75, 74, 76, 73, 74, 75, 74, 75, 74]
          },
          30: {
            labels: ['02/17', '02/18', '02/19', '02/20', '02/21', '02/22', '02/23', '02/24', '02/25', '02/26', '02/27', '02/28', '03/01', '03/02', '03/03', '03/04', '03/05', '03/06', '03/07', '03/08', '03/09', '03/10', '03/11', '03/12', '03/13', '03/14', '03/15', '03/16', '03/17', '03/18'],
            recordingVolume: [4, 5, 4, 6, 5, 6, 5, 7, 6, 7, 5, 6, 5, 6, 5, 5, 6, 7, 5, 8, 6, 7, 8, 9, 7, 8, 7, 8, 8, 7],
            personalQualifiedRate: [78, 80, 76, 82, 84, 85, 81, 83, 79, 86, 80, 84, 83, 85, 82, 82, 85, 88, 82, 90, 87, 91, 89, 93, 88, 90, 92, 95, 91, 92],
            storeAverageRate: [70, 71, 69, 72, 71, 73, 70, 72, 71, 73, 71, 74, 72, 73, 71, 71, 72, 73, 71, 74, 72, 75, 74, 76, 73, 74, 75, 74, 75, 74]
          }
        }
      }

      function resetAdvisorState() {
        if (advisorState.reviewSummaryGenerateTimer) {
          window.clearTimeout(advisorState.reviewSummaryGenerateTimer)
        }
        if (advisorState.reviewSummaryTypingTimer) {
          window.clearInterval(advisorState.reviewSummaryTypingTimer)
        }
        const nextState = createDefaultAdvisorState()
        const defaultRange = getSalesRoleRangeValues(nextState.recommendRangeMode, 'advisor')
        Object.assign(advisorState, nextState, {
          recommendDateStart: defaultRange.startDate,
          recommendDateEnd: defaultRange.endDate
        })
      }

      function getFilteredAdvisorLeads() {
        let filtered = getSalesScopedLeadPool(advisorDashboard.leads, advisorState)

        if (advisorState.todoFilter !== 'all') {
          filtered = filtered.filter((lead) => getSalesLeadIntentBucket(lead) === advisorState.todoFilter)
        }

        return filtered
      }

      function getAdvisorTaskMark(lead) {
        if (lead.stage.includes('待到店')) return '到'
        if (lead.stage.includes('待试驾')) return '试'
        if (lead.stage.includes('报价') || lead.stage.includes('议价')) return '报'
        if (lead.stage.includes('战败') || lead.stage.includes('回访')) return '回'
        if (lead.stage.includes('下订')) return '成'
        return '跟'
      }

      function getAdvisorViewNote() {
        if (advisorState.leadView === 'chain') return '按交接链路看 DCC 如何把客户交给你，以及你如何继续承接接待、试驾和回访。'
        if (advisorState.leadView === 'all') return '全量查看你的客户，适合核对阶段进度、交接信息和回访状态。'
        if (advisorState.todoFilter === 'high') return '当前只看高意向客户，建议优先推进试驾、报价与议价收口。'
        if (advisorState.todoFilter === 'medium') return '当前只看中意向客户，适合集中处理待接待、待回访与责任补齐。'
        if (advisorState.todoFilter === 'low') return '当前只看低意向客户，适合先明确是否继续跟进，避免客户悬空。'
        if (advisorState.todoFilter === 'none') return '当前只看无意向等级客户，建议先补齐判级与跟进动作。'
        return '优先处理今日待接待和待试驾客户。'
      }

      function renderAdvisorProfile() {
        const avatar = document.getElementById('profile-avatar')
        const name = document.getElementById('profile-name')
        const store = document.getElementById('profile-store')
        const title = document.getElementById('profile-title')

        if (avatar) avatar.textContent = currentAdvisor.avatar
        if (name) name.textContent = currentAdvisor.name
        if (store) store.textContent = currentAdvisor.store
        if (title) title.textContent = currentAdvisor.title
      }

      function renderAdvisorHeroMetrics() {
        const container = document.getElementById('hero-metrics')
        if (!container) {
          return
        }

        const advisorMetricIconUrls = {
          '接待数': '../assets/sales-role-metrics/metric-reception-count.png',
          '试驾数': '../assets/sales-role-metrics/metric-test-drive-count.png',
          '接待录音数': '../assets/sales-role-metrics/metric-reception-recording.png',
          '试驾录音数': '../assets/sales-role-metrics/metric-test-drive-recording.png',
          '话术命中率': '../assets/sales-role-metrics/metric-hit-rate.png',
          '平均时长': '../assets/sales-role-metrics/metric-duration.png',
          '风险录音': '../assets/sales-role-metrics/metric-risk-count.png'
        }
        const metrics = getSalesHeroMetricsData('advisor')
        container.innerHTML = metrics.map((metric, index) => {
          const iconMetric = {
            ...metric,
            iconUrl: advisorMetricIconUrls[metric.label] || metric.iconUrl
          }
          const metricLabel = escapeHtml(metric.label)
          return `
          <div class="hm-item${metric.variant === 'summary' ? ' hm-item-summary' : ''}">
            ${renderSalesHeroMetricIcon(iconMetric)}
            <div class="hm-body">
              <div class="hm-label hm-label--ellipsis" title="${metricLabel}">${metricLabel}</div>
              <div class="hm-val-row">
                <span class="hm-value" ${buildCounterDataAttrs(metric.value, metric.unit)}>${renderSalesHeroValue(metric.value, metric.unit)}</span>
                <span class="hm-trend ${metric.trendClass}${metric.label === '风险录音' ? ' hm-trend-risk' : ''}">${escapeHtml(metric.trend)}</span>
              </div>
            </div>
            ${renderSalesMetricHelp(metric.label)}
          </div>
          ${index === 1 ? '<div class="hm-sep hm-sep-divider" aria-hidden="true"></div>' : ''}
        `
        }).join('')
      }

      function renderAdvisorFocus() {
        const filteredLeads = getFilteredAdvisorLeads()
        const totalLeads = filteredLeads.length
        const completedLeads = filteredLeads.filter((lead) => isAdvisorLeadCompleted(lead.id)).length
        const pendingLeads = totalLeads - completedLeads
        const highIntentLeads = filteredLeads.filter((lead) => lead.intent.toUpperCase() === 'H').length
        const focus = advisorDashboard.focus
        const metrics = [
          { label: '高质量线索', value: highIntentLeads, sub: 'H/A 级客户在筛选时间内', tone: 'blue', icon: 'star' },
          { label: '待处理', value: pendingLeads, sub: '客户待人工推进', tone: 'amber', icon: 'clock' },
          { label: '已完成', value: completedLeads, sub: '已标记完成状态', tone: 'green', icon: 'check' },
          { label: '线索总数', value: totalLeads, sub: '筛选时间内的全部客户', tone: 'violet', icon: 'list' }
        ]

        const focusTitle = document.getElementById('focus-title')
        const focusDesc = document.getElementById('focus-desc')
        if (focusTitle) {
          focusTitle.textContent = focus.title
        }
        if (focusDesc) {
          focusDesc.textContent = focus.desc
        }
        const modeChipSub = document.getElementById('mode-chip-sub')
        if (modeChipSub) {
          modeChipSub.textContent = focus.summary
        }
        const recommendBannerTitle = document.getElementById('recommend-banner-title')
        const recommendBannerDesc = document.getElementById('recommend-banner-desc')
        const recommendBannerActions = document.getElementById('recommend-banner-actions')
        if (recommendBannerTitle) {
          recommendBannerTitle.textContent = focus.bannerTitle
        }
        if (recommendBannerDesc) {
          recommendBannerDesc.textContent = focus.bannerDesc
        }
        if (recommendBannerActions) {
          recommendBannerActions.innerHTML = focus.bannerChips
            .map((chip) => `<span class="recommend-banner-chip">${chip}</span>`)
            .join('')
        }
        document.getElementById('execution-focus-metrics').innerHTML = metrics.map(renderExecutionMetricCard).join('')
        document.getElementById('lead-view-note').textContent = getAdvisorViewNote()
      }

      function buildAdvisorLeadCard(lead) {
        const isCompleted = isAdvisorLeadCompleted(lead.id)

        return `
          <div class="todo-item intent-${lead.intent.toLowerCase()} ${lead.priority} ${isCompleted ? 'completed' : ''}" data-lead-id="${lead.id}">
            <div class="todo-priority-icon">${renderTodoPriorityIcon()}</div>
            <div class="todo-body">
              <div class="todo-head todo-head-compact">
                <div class="todo-summary-main">
                  <div class="todo-customer-row">
	                    <div class="todo-customer-name">${lead.customer}</div>
	                    <span class="intent-badge ${lead.intent.toLowerCase()}">${getLeadIntentSceneText(lead, 'advisor')}</span>
	                    <span class="todo-model-chip">${lead.model}</span>
	                    <div class="todo-checkbox-wrapper">
	                      <button
	                        type="button"
	                        class="todo-status-toggle ${isCompleted ? 'is-revert' : ''}"
	                        data-advisor-complete="${lead.id}"
	                        title="${isCompleted ? '撤销处理' : '立即处理'}"
	                      >${isCompleted ? '撤销处理' : '立即处理'}</button>
	                    </div>
	                  </div>
                  <div class="todo-time">最近更新 ${lead.updatedAt}</div>
                </div>
              </div>

              <div class="role-compact-body">
                <div class="todo-next-step">
                  <div class="todo-guidance-head">
                    <span class="todo-guidance-label todo-guidance-label-primary"><img class="todo-guidance-label-icon" src="../assets/sales-followup-icon.svg" alt="" aria-hidden="true">跟进建议</span>
                    ${lead.followUpTime ? `<span class="followup-time-badge">建议时间 ${lead.followUpTime}</span>` : ''}
                  </div>
                  <div class="todo-next-step-text">${lead.action}</div>
                  <div class="todo-action-btns">
                    <button type="button" class="lead-detail-toggle">
                      <span class="toggle-text">展开</span>
                      <span class="toggle-arrow">▼</span>
                    </button>
                    <button type="button" class="lead-detail-btn" ${buildSalesLeadDetailDataAttrs(lead)}>录音详情</button>
                  </div>
                  ${isCompleted ? '<div class="todo-processed-stamp" aria-hidden="true">已处理</div>' : ''}
                </div>

                <div class="lead-detail-content" hidden>
                  <div class="role-compact-grid">
                    <div class="role-compact-panel">
                      <div class="todo-guidance-label todo-guidance-label-reason">推荐理由</div>
                      <div class="todo-guidance-text sales-gap-top">${lead.summary}</div>
                    </div>
                    <div class="role-compact-panel">
                      <div class="todo-guidance-label todo-guidance-label-info">关键信息</div>
                      <div class="role-tag-row sales-gap-top">
                        ${lead.tags.map((tag) => `<span class="todo-tag-chip">${tag}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        `
      }

      function renderAdvisorTodos() {
        const list = document.getElementById('todo-list')
        if (!list) {
          return
        }

        const leads = [...getFilteredAdvisorLeads()].sort((leftLead, rightLead) => {
          const leftCompleted = isAdvisorLeadCompleted(leftLead.id)
          const rightCompleted = isAdvisorLeadCompleted(rightLead.id)

          if (leftCompleted !== rightCompleted) {
            return leftCompleted ? 1 : -1
          }

          return compareSalesLeadsByMode(leftLead, rightLead, advisorState.recommendMode)
        })

        if (!leads.length) {
          list.innerHTML = renderSalesTodoEmptyState('advisor')
          renderSalesTodoPagination('advisor', 0)
          return
        }

        const totalItems = leads.length
        const totalPages = Math.max(1, Math.ceil(totalItems / SALES_TODO_PAGE_SIZE))
        advisorState.todoPage = Math.min(totalPages, Math.max(1, advisorState.todoPage || 1))
        const startIndex = (advisorState.todoPage - 1) * SALES_TODO_PAGE_SIZE
        const pagedLeads = leads.slice(startIndex, startIndex + SALES_TODO_PAGE_SIZE)

        list.innerHTML = pagedLeads.map(buildAdvisorLeadCard).join('')

        list.querySelectorAll('[data-advisor-complete]').forEach((button) => {
          button.addEventListener('click', () => {
            const leadId = button.dataset.advisorComplete
            if (!leadId) {
              return
            }

            if (button.classList.contains('is-revert')) {
              playTodoRevertStamp(button, () => toggleAdvisorLeadComplete(leadId, { animateMove: true }))
              return
            }

            playTodoProcessStamp(button, () => toggleAdvisorLeadComplete(leadId, { animateMove: true }))
          })
        })

        list.querySelectorAll('.lead-detail-toggle').forEach((toggle) => {
          toggle.addEventListener('click', () => {
            const content = toggle.closest('.role-compact-body')?.querySelector('.lead-detail-content')
            if (!content) {
              return
            }

            const nextHidden = !content.hidden
            content.hidden = nextHidden

            const text = toggle.querySelector('.toggle-text')
            const arrow = toggle.querySelector('.toggle-arrow')
            if (text) text.textContent = nextHidden ? '展开' : '收起'
            if (arrow) arrow.textContent = nextHidden ? '▼' : '▲'
          })
        })

        list.querySelectorAll('[data-open-route]').forEach((button) => {
          button.addEventListener('click', () => openRouteInNewTab(button.dataset.openRoute, {
            leadId: button.dataset.leadId,
            leadSource: button.dataset.leadSource,
            sessionId: button.dataset.sessionId,
            sessionStore: button.dataset.sessionStore,
            sessionDate: button.dataset.sessionDate,
            sessionCustomer: button.dataset.sessionCustomer,
            sessionScene: button.dataset.sessionScene
          }))
        })

        renderSalesTodoPagination('advisor', totalItems)
      }

      function renderAdvisorChainBoard() {
        const summary = document.getElementById('chain-summary')
        const pipeline = document.getElementById('chain-pipeline')
        const board = document.getElementById('chain-board')
        if (!summary || !pipeline || !board) {
          return
        }

        summary.innerHTML = `
          <div class="history-summary-title">${advisorDashboard.chainSummary.title}</div>
          <div class="history-summary-text">${advisorDashboard.chainSummary.text}</div>
        `

        pipeline.innerHTML = advisorDashboard.chainSummary.cards.map((card) => `
          <div class="pipeline-card">
            <div class="pipeline-title">${card.title}</div>
            <div class="pipeline-value" ${buildCounterDataAttrs(card.value)}>${card.value}</div>
            <div class="pipeline-sub">${card.sub}</div>
          </div>
        `).join('')

        board.innerHTML = advisorDashboard.leads.map((lead) => `
          <div class="history-item">
            <div class="history-customer">
              <div class="history-name">${lead.customer}</div>
              <div class="history-meta">车型：${lead.model}</div>
              <div class="history-meta">阶段：${lead.stage}</div>
              <div class="history-meta">来源：${lead.source}</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">邀约责任</div>
              <div class="history-block-text">${lead.appointmentOwner}</div>
              <div class="history-meta">负责首触、邀约到店和到店前提醒。</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">接待责任</div>
              <div class="history-block-text">${lead.receptionOwner}</div>
              <div class="history-meta">负责到店接待、试驾安排与现场需求深挖。</div>
            </div>
            <div class="chain-owner-card">
              <div class="history-block-title">后续跟进</div>
              <div class="history-block-text">${lead.followupOwner}</div>
              <div class="history-meta">${lead.chainNote}</div>
            </div>
          </div>
        `).join('')
      }

      function sortAdvisorRows(rows) {
        const sorted = [...rows]
        const factor = advisorState.sortDirection === 'asc' ? 1 : -1
        sorted.sort((leftRow, rightRow) => {
          const left = leftRow[advisorState.sortColumn] || ''
          const right = rightRow[advisorState.sortColumn] || ''
          return left.localeCompare(right) * factor
        })
        return sorted
      }

      function renderAdvisorAllLeads() {
        const thead = document.getElementById('all-leads-thead')
        const tbody = document.getElementById('all-leads-tbody')
        if (!thead || !tbody) {
          return
        }

        thead.innerHTML = `
          <tr>
            <th>客户</th>
            <th class="th-sortable" data-sort="stage">阶段</th>
            <th>邀约</th>
            <th>接待</th>
            <th>跟进</th>
            <th class="th-sortable" data-sort="syncLabel">同步状态</th>
            <th>最近说明</th>
          </tr>
        `

        tbody.innerHTML = sortAdvisorRows(advisorDashboard.leads).map((lead) => `
          <tr>
            <td><strong>${lead.customer}</strong><div class="sales-table-sub">${lead.model} · ${lead.intent}级</div></td>
            <td>${lead.stage}</td>
            <td>${lead.appointmentOwner}</td>
            <td>${lead.receptionOwner}</td>
            <td>${lead.followupOwner}</td>
            <td><span class="sync-pill ${lead.syncStatus}">${lead.syncLabel}</span></td>
            <td class="sales-table-note">${lead.syncNote}</td>
          </tr>
        `).join('')

        thead.querySelectorAll('[data-sort]').forEach((node) => {
          node.addEventListener('click', () => {
            const sortKey = node.dataset.sort
            if (advisorState.sortColumn === sortKey) {
              advisorState.sortDirection = advisorState.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
              advisorState.sortColumn = sortKey
              advisorState.sortDirection = 'asc'
            }
            renderAdvisorAllLeads()
          })
        })
      }

      function renderAdvisorReview() {
        const review = advisorDashboard.review
        const summaryText = getSalesReviewSummaryText(review, advisorState)

        document.getElementById('review-sub').textContent = review.sub
        document.getElementById('review-score-circle').style.setProperty('--score', String(review.score))
        updateReviewScoreRing(review.score)
        const scoreNode = document.getElementById('review-score-val')
        const labelNode = document.getElementById('review-score-label')
        if (scoreNode) {
          scoreNode.dataset.scoreTarget = String(review.score)
          scoreNode.dataset.scoreLabel = review.label
          setReviewScoreDisplay(scoreNode, review.score, review.label)
        }
        if (labelNode) {
          labelNode.textContent = review.label
        }
        const summaryNode = document.getElementById('review-ai-summary')
        if (summaryNode) {
          if (advisorState.reviewSummaryGenerated) {
            summaryNode.classList.remove('is-obscured')
            if (advisorState.reviewSummaryTypingDone && advisorState.reviewSummaryLastText === summaryText) {
              renderSalesReviewSummaryStatic(summaryNode, summaryText)
            } else {
              startSalesReviewSummaryTyping(summaryNode, summaryText, 'advisor')
            }
          } else if (advisorState.reviewSummaryGenerating) {
            summaryNode.classList.add('is-obscured')
            summaryNode.innerHTML = `
              ${getSalesReviewObscuredSummaryHtml()}
              <div class="review-ai-generate-loading" aria-live="polite" role="status">
                <span class="review-ai-loading-spinner" aria-hidden="true"></span>
                <span>生成中...</span>
              </div>
            `
          } else {
            summaryNode.classList.add('is-obscured')
            summaryNode.innerHTML = `
              ${getSalesReviewObscuredSummaryHtml()}
              <button type="button" class="btn-primary review-ai-generate-btn" data-review-generate>立即生成</button>
            `
          }
        }
        setSalesReviewRobotPlayback('advisor', isSalesReviewSummaryInProgress('advisor'))
        renderSalesReviewInsights('advisor')
        renderSalesSopReview('advisor')
      }

      function renderAdvisorFilterCounts() {
        const leads = getSalesScopedLeadPool(advisorDashboard.leads, advisorState)
        document.getElementById('tc-all').textContent = leads.length
        document.getElementById('tc-high').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'high').length
        document.getElementById('tc-medium').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'medium').length
        document.getElementById('tc-low').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'low').length
        document.getElementById('tc-none').textContent = leads.filter((lead) => getSalesLeadIntentBucket(lead) === 'none').length
      }

      function renderAdvisorTrendLegend() {
        document.getElementById('trend-legend').innerHTML = `
          <span><i class="legend-dot" style="background:#2563eb"></i>个人合格率</span>
          <span><i class="legend-dot" style="background:#94a3b8"></i>门店合格率</span>
          <span><i class="legend-dot" style="background:rgba(37,99,235,0.15)"></i>个人录音量</span>
        `
      }

      function initAdvisorTrendChart() {
        const canvas = document.getElementById('trendChart')
        if (!canvas) {
          return
        }

        const data = advisorDashboard.trendData[advisorState.trendRange]
        const maxCount = Math.max(...data.recordingVolume, 0)
        const chartConfig = {
          labels: data.labels,
          leftAxis: {
            min: 0,
            max: maxCount,
            ticks: Array.from({ length: maxCount + 1 }, (_, index) => index),
            label: '录音量',
            formatLabel: (value) => String(value)
          },
          rightAxis: {
            min: 50,
            max: 100,
            ticks: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
            label: '合格率',
            formatLabel: (value) => `${value}%`
          },
          bars: {
            axis: 'left',
            data: data.recordingVolume,
            fill: 'rgba(37, 99, 235, 0.16)',
            stroke: 'rgba(37, 99, 235, 0.92)',
            widthRatio: 0.72,
            radius: 6
          },
          datasets: [
            { axis: 'right', color: '#2563eb', data: data.personalQualifiedRate, pointRadius: 4, lineWidth: 3, curved: true, solidPoint: true, fillColor: 'rgba(37,99,235,0.08)' },
            { axis: 'right', color: '#94a3b8', data: data.storeAverageRate, pointRadius: 4, lineWidth: 2.5, dash: [6, 4], curved: true, solidPoint: true }
          ]
        }

        animateSalesTrendChart(canvas, chartConfig, data)
      }

      function bindAdvisorEvents() {
        bindSalesReviewRobotPlayback('advisor')
        document.getElementById('review-ai-summary')?.addEventListener('click', (event) => {
          const generateButton = event.target.closest('[data-review-generate]')
          if (!generateButton || advisorState.reviewSummaryGenerated || advisorState.reviewSummaryGenerating) {
            return
          }

          clearSalesReviewTypingTimer(advisorState)
          advisorState.reviewSummaryTypingDone = false
          advisorState.reviewSummaryLastText = ''
          advisorState.reviewSummaryGenerating = true
          renderAdvisorReview()

          if (advisorState.reviewSummaryGenerateTimer) {
            window.clearTimeout(advisorState.reviewSummaryGenerateTimer)
          }
          advisorState.reviewSummaryGenerateTimer = window.setTimeout(() => {
            advisorState.reviewSummaryGenerating = false
            advisorState.reviewSummaryGenerated = true
            advisorState.reviewSummaryGenerateTimer = null
            if (getCurrentRoute() === 'sales-advisor') {
              renderAdvisorReview()
            }
          }, 3000)
        })

        document.querySelector('.review-insight-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-review-insight-tab]')
          if (!button || button.dataset.reviewInsightTab === advisorState.reviewInsightTab) {
            return
          }

          const tab = button.dataset.reviewInsightTab
          if (!['strength', 'weakness', 'risk'].includes(tab)) return
          advisorState.reviewInsightTab = tab
          advisorState.reviewInsightPage = 1
          advisorState.reviewRuleQuery = ''
          advisorState.reviewRuleSort = 'rate-desc'
          renderAdvisorReview()
        })

        document.getElementById('recommend-mode-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-mode]')
          if (!button) {
            return
          }

          advisorState.recommendMode = button.dataset.mode
          advisorState.todoPage = 1
          document.querySelectorAll('#recommend-mode-tabs [data-mode]').forEach((node) => {
            node.classList.toggle('active', node.dataset.mode === advisorState.recommendMode)
          })
          renderAdvisorFilterCounts()
          renderAdvisorFocus()
          renderAdvisorTodos()
          updateAdvisorCompletedCount()
        })

        document.getElementById('todo-filter-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-filter]')
          if (!button) {
            return
          }

          advisorState.todoFilter = button.dataset.filter
          advisorState.todoPage = 1
          document.querySelectorAll('#todo-filter-tabs [data-filter]').forEach((node) => {
            node.classList.toggle('active', node.dataset.filter === advisorState.todoFilter)
          })
          renderAdvisorFocus()
          renderAdvisorTodos()
          updateAdvisorCompletedCount()
        })

        document.getElementById('lead-view-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-view]')
          if (!button) {
            return
          }

          advisorState.leadView = button.dataset.view
          document.querySelectorAll('#lead-view-tabs [data-view]').forEach((node) => {
            node.classList.toggle('active', node.dataset.view === advisorState.leadView)
          })
          ;['recommend', 'chain', 'all'].forEach((name) => {
            const panel = document.getElementById(`lead-view-${name}`)
            if (panel) {
              panel.classList.toggle('active', name === advisorState.leadView)
            }
          })
          const filterRow = document.getElementById('lead-filter-row')
          if (filterRow) {
            filterRow.style.display = advisorState.leadView === 'recommend' ? '' : 'none'
          }
          if (advisorState.leadView !== 'recommend') {
            closeSalesRoleDatePicker()
          }
          renderAdvisorFilterCounts()
          renderAdvisorFocus()
          updateAdvisorCompletedCount()
        })

        document.getElementById('trend-range-tabs')?.addEventListener('click', (event) => {
          const button = event.target.closest('[data-range]')
          if (!button) {
            return
          }

          advisorState.trendRange = parseInt(button.dataset.range, 10)
          document.querySelectorAll('#trend-range-tabs [data-range]').forEach((node) => {
            node.classList.toggle('active', node.dataset.range === button.dataset.range)
          })
          window.requestAnimationFrame(initAdvisorTrendChart)
        })

      }

      function initSalesAdvisorPage() {
        resetAdvisorState()
        loadAdvisorCompletedLeads()
        renderAdvisorProfile()
        renderAdvisorHeroMetrics()
        renderAdvisorFilterCounts()
        renderSalesRoleDateControl('advisor')
        renderSalesReviewSceneControl('advisor')
        renderAdvisorFocus()
        renderAdvisorTodos()
        updateAdvisorCompletedCount()
        renderAdvisorChainBoard()
        renderAdvisorAllLeads()
        renderAdvisorReview()
        renderAdvisorTrendLegend()
        bindAdvisorEvents()
        window.requestAnimationFrame(initAdvisorTrendChart)
        window.requestAnimationFrame(() => animateSalesDashboardCounters(document.querySelector('.sales-advisor-page')))
        initStickyFilterBars()
      }

      function toggleAdvisorLeadComplete(leadId, options = {}) {
        const list = options.animateMove ? document.getElementById('todo-list') : null
        const previousPositions = options.animateMove ? captureTodoItemPositions(list) : null

        if (advisorState.completedLeads.has(leadId)) {
          advisorState.completedLeads.delete(leadId)
        } else {
          advisorState.completedLeads.add(leadId)
        }

        saveAdvisorCompletedLeads()
        renderAdvisorFocus()
        renderAdvisorTodos()
        updateAdvisorCompletedCount()

        if (options.animateMove) {
          animateTodoListReorder(document.getElementById('todo-list'), previousPositions, leadId)
        }
      }

      const pageHost = document.getElementById('pageHost')
      const navButtons = Array.from(document.querySelectorAll('.nav-button'))
      const sidebarUserName = document.getElementById('sidebarUserName')
      const sidebarUserMeta = document.getElementById('sidebarUserMeta')
      const pageTitle = document.getElementById('pageTitle')
      const pageDesc = document.getElementById('pageDesc')
      const toolbarActions = document.getElementById('toolbarActions')
      const toolbarFilters = document.getElementById('toolbarFilters')
      const toolbar = toolbarActions.parentElement
      const topbar = document.querySelector('.topbar')

      function closeSessionMenus() {
        if (!sessionMenuState.openMenu || !document.getElementById('sessionFilterControls')) {
          sessionMenuState.openMenu = null
          sessionMenuState.organizationSearchQuery = ''
          sessionMenuState.organizationSearchActive = false
          return
        }

        sessionMenuState.openMenu = null
        sessionMenuState.organizationSearchQuery = ''
        sessionMenuState.organizationSearchActive = false
        rerenderSessionFilters()
      }

      function closeLeadsMenus() {
        if (!leadsMenuState.openMenu || !document.getElementById('leadsFilterControls')) {
          leadsMenuState.openMenu = null
          return
        }

        leadsMenuState.openMenu = null
        renderLeadsPage()
      }

      function renderToolbar(target, items, pillClass) {
        target.innerHTML = items
          .map((item) => {
            if (typeof item === 'string') {
              return `<div class="${pillClass}">${item}</div>`
            }
            return `<div class="${item.primary ? 'btn-primary' : 'btn'}">${item.label}</div>`
          })
          .join('')
      }

      function playTodoProcessStamp(button, onDone) {
        const panel = button.closest('.todo-item')?.querySelector('.todo-next-step')
        if (!panel) {
          onDone?.()
          return
        }

        const previousStamp = panel.querySelector('.todo-processed-stamp.is-preview')
        if (previousStamp) {
          previousStamp.remove()
        }

        const stamp = document.createElement('div')
        stamp.className = 'todo-processed-stamp is-entering is-preview'
        stamp.setAttribute('aria-hidden', 'true')
        stamp.textContent = '已处理'
        panel.appendChild(stamp)

        button.disabled = true

        let settled = false
        const finalize = () => {
          if (settled) {
            return
          }

          settled = true
          button.disabled = false
          onDone?.()
        }

        stamp.addEventListener('animationend', finalize, { once: true })
        window.setTimeout(finalize, 700)
      }

      function createTodoStampParticles(stamp) {
        if (!stamp || stamp.querySelector('.todo-processed-stamp-particle')) {
          return
        }

        const particleSpecs = [
          { x: -38, y: -26, size: 6, delay: 0 },
          { x: -24, y: -34, size: 5, delay: 24 },
          { x: -10, y: -39, size: 5, delay: 58 },
          { x: 12, y: -37, size: 6, delay: 38 },
          { x: 29, y: -28, size: 5, delay: 14 },
          { x: 40, y: -10, size: 6, delay: 52 },
          { x: 36, y: 14, size: 5, delay: 32 },
          { x: 22, y: 32, size: 6, delay: 70 },
          { x: 2, y: 38, size: 5, delay: 46 },
          { x: -18, y: 34, size: 5, delay: 22 },
          { x: -34, y: 18, size: 6, delay: 62 },
          { x: -41, y: -2, size: 5, delay: 16 }
        ]

        const fragment = document.createDocumentFragment()
        particleSpecs.forEach((spec) => {
          const particle = document.createElement('span')
          particle.className = 'todo-processed-stamp-particle'
          particle.style.setProperty('--particle-x', `${spec.x}px`)
          particle.style.setProperty('--particle-y', `${spec.y}px`)
          particle.style.setProperty('--particle-size', `${spec.size}px`)
          particle.style.setProperty('--particle-delay', `${spec.delay}ms`)
          fragment.appendChild(particle)
        })

        stamp.appendChild(fragment)
      }

      function playTodoRevertStamp(button, onDone) {
        const panel = button.closest('.todo-item')?.querySelector('.todo-next-step')
        const stamp = panel?.querySelector('.todo-processed-stamp')
        if (!panel || !stamp) {
          onDone?.()
          return
        }

        if (stamp.classList.contains('is-shattering')) {
          return
        }

        createTodoStampParticles(stamp)
        stamp.classList.remove('is-entering', 'is-preview')
        stamp.classList.add('is-shattering')
        button.disabled = true

        let settled = false
        const finalize = () => {
          if (settled) {
            return
          }

          settled = true
          button.disabled = false
          onDone?.()
        }

        stamp.addEventListener('animationend', (event) => {
          if (event.target === stamp) {
            finalize()
          }
        }, { once: true })
        window.setTimeout(finalize, 860)
      }

      function captureTodoItemPositions(list) {
        if (!list) {
          return new Map()
        }

        return new Map(
          Array.from(list.querySelectorAll('.todo-item'))
            .map((item) => [item.dataset.leadId, item.getBoundingClientRect()])
            .filter(([leadId]) => Boolean(leadId))
        )
      }

      function animateTodoListReorder(list, previousPositions, movedLeadId) {
        if (!list || !previousPositions?.size) {
          return
        }

        const movingItems = []

        list.querySelectorAll('.todo-item').forEach((item) => {
          const leadId = item.dataset.leadId
          const previousRect = previousPositions.get(leadId)
          if (!leadId || !previousRect) {
            return
          }

          const nextRect = item.getBoundingClientRect()
          const deltaX = previousRect.left - nextRect.left
          const deltaY = previousRect.top - nextRect.top

          if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
            return
          }

          const isMovedItem = leadId === movedLeadId
          item.style.transition = 'none'
          item.style.transform = isMovedItem
            ? `translate(${deltaX}px, ${deltaY}px) scale(1.035)`
            : `translate(${deltaX}px, ${deltaY}px)`
          item.classList.add('is-sort-animating')

          if (isMovedItem) {
            item.classList.add('is-sort-target')
          }

          movingItems.push(item)
        })

        if (!movingItems.length) {
          return
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            movingItems.forEach((item) => {
              const isMovedItem = item.dataset.leadId === movedLeadId
              item.style.transition = isMovedItem
                ? 'transform 0.92s cubic-bezier(0.2, 0.82, 0.24, 1), box-shadow 0.44s ease'
                : 'transform 0.88s cubic-bezier(0.2, 0.82, 0.24, 1)'
              item.style.transform = isMovedItem ? 'translate(0, 0) scale(1)' : 'translate(0, 0)'
            })
          })
        })

        movingItems.forEach((item) => {
          let settled = false
          const cleanup = () => {
            if (settled) {
              return
            }

            settled = true
            item.style.transition = ''
            item.style.transform = ''
            item.classList.remove('is-sort-animating', 'is-sort-target')
          }

          item.addEventListener('transitionend', cleanup, { once: true })
          window.setTimeout(cleanup, 1150)
        })
      }

      function attachRouteLinks() {
        pageHost.querySelectorAll('[data-route]').forEach((node) => {
          node.addEventListener('click', () => {
            if (node.dataset.route === 'leads' && (node.dataset.leadsViewTarget === 'leads' || node.dataset.leadsViewTarget === 'customers')) {
              leadsViewState.mode = node.dataset.leadsViewTarget
            }
            const extraParams = {}
            if (node.dataset.route === 'leads-detail') {
              if (node.dataset.leadId) extraParams.leadId = node.dataset.leadId
              if (node.dataset.leadSource) extraParams.leadSource = node.dataset.leadSource
              if (node.dataset.leadReturnView) extraParams.leadReturnView = node.dataset.leadReturnView
            }
            navigateToRoute(node.dataset.route, extraParams)
          })
        })
      }

      function getRequestedLeadsView() {
        const params = new URLSearchParams(window.location.search)
        const requestedView = params.get('leadsView')
        if (requestedView === 'customers' || requestedView === 'leads') {
          return requestedView
        }
        return leadsViewState.mode
      }

      function getRouteUrl(routeId, extraParams = {}) {
        const routeFileMap = {
          'factory-dashboard': '../factory-dashboard/index.html',
          dashboard: '../store-dashboard/index.html',
          'store-dashboard': '../store-dashboard/index.html',
          'sales-dashboard': '../sales-dashboard/index.html',
          'sales-dcc': '../sales-dashboard/index.html',
          'sales-advisor': '../sales-dashboard/index.html',
          'script-library': '../script-library/index.html',
          session: '../session/index.html',
          'session-detail': '../session/index.html',
          leads: '../leads/index.html',
          'leads-detail': '../leads/index.html',
          'customer-detail': '../leads/index.html',
          config: '../config/index.html',
          system: '../system/index.html'
        }
        const url = new URL(routeFileMap[routeId] || window.location.pathname, window.location.href)
        url.searchParams.set('route', routeId)

        Object.entries(extraParams).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, value)
          } else {
            url.searchParams.delete(key)
          }
        })

        return `${url.pathname}${url.search}${url.hash}`
      }

      function navigateToRoute(routeId, extraParams = {}) {
        if (!routeId || !pages[routeId]) {
          return
        }

        const target = new URL(getRouteUrl(routeId, extraParams), window.location.href)
        if (target.pathname === window.location.pathname && document.getElementById(pages[routeId].templateId)) {
          history.replaceState(null, '', `${target.pathname}${target.search}${target.hash}`)
          renderPage(routeId)
          return
        }

        window.location.href = `${target.pathname}${target.search}${target.hash}`
      }

      function openRouteInNewTab(routeId, extraParams = {}) {
        if (!routeId || !pages[routeId]) {
          return
        }

        window.open(getRouteUrl(routeId, extraParams), '_blank', 'noopener')
      }

      function syncRoute(routeId) {
        const url = new URL(window.location.href)
        url.searchParams.set('route', routeId)

        if (routeId === 'leads') {
          url.searchParams.set('leadsView', leadsViewState.mode)
        } else {
          url.searchParams.delete('leadsView')
        }

        if (routeId !== 'leads-detail') {
          url.searchParams.delete('leadId')
          url.searchParams.delete('leadSource')
          url.searchParams.delete('leadReturnView')
        }

        if (routeId !== 'session-detail') {
          url.searchParams.delete('sessionId')
          url.searchParams.delete('sessionStore')
          url.searchParams.delete('sessionDate')
          url.searchParams.delete('sessionCustomer')
          url.searchParams.delete('sessionScene')
        }

        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
      }

      function getCurrentRoute() {
        const params = new URLSearchParams(window.location.search)
        const routeFromQuery = params.get('route')
        if (routeFromQuery && pages[routeFromQuery]) {
          return routeFromQuery
        }

        const rawHash = window.location.hash.replace('#', '')
        if (pages[rawHash]) {
          return rawHash
        }

        return window.__AI_QC_DEFAULT_ROUTE || 'dashboard'
      }

      function renderPage(routeId) {
        let activeRouteId = routeId
        let page = pages[activeRouteId] || pages[window.__AI_QC_DEFAULT_ROUTE] || pages.dashboard
        let template = document.getElementById(page.templateId)

        if (!template && window.__AI_QC_DEFAULT_ROUTE && pages[window.__AI_QC_DEFAULT_ROUTE]) {
          activeRouteId = window.__AI_QC_DEFAULT_ROUTE
          page = pages[activeRouteId]
          template = document.getElementById(page.templateId)
        }

        if (!template) {
          return
        }

        clearSalesDashboardCounterAnimations()
        clearSalesReviewCounterAnimations()
        stopSalesTrendChartAnimation()
        window.destroyFactoryDashboardPage?.()
        destroyLeadDetailPage()
        destroyCustomerDetailPage()
        destroySessionDetailPage()
        sessionMenuState.openMenu = null
        sessionMenuState.organizationSearchQuery = ''
        sessionMenuState.organizationSearchActive = false
        salesRoleDateState.openRole = null
        pauseSessionDetailPlayback(false)

        if (activeRouteId === 'leads') {
          leadsViewState.mode = getRequestedLeadsView()
        }

        pageHost.innerHTML = template.innerHTML
        pageTitle.textContent = page.title
        pageDesc.textContent = page.desc
        sidebarUserName.textContent = 'admin'
        sidebarUserMeta.textContent = ''
        topbar.hidden = page.hideShellTopbar === true
        pageHost.classList.toggle('page-host-immersive', page.hideShellTopbar === true)

        renderToolbar(toolbarActions, page.actions, 'btn')
        renderToolbar(toolbarFilters, page.filters, 'filter-pill')
        attachRouteLinks()

        const compactTopbar = activeRouteId === 'config'
        const hasToolbarContent = Boolean((page.actions && page.actions.length) || (page.filters && page.filters.length))
        toolbar.hidden = compactTopbar || !hasToolbarContent
        topbar.classList.toggle('topbar-compact', compactTopbar)

        navButtons.forEach((button) => {
          button.classList.toggle('active', button.dataset.page === page.navKey)
        })

        if (activeRouteId === 'script-library') {
          renderScriptLibraryPage()
        }

        if (activeRouteId === 'factory-dashboard') {
          window.initFactoryDashboardPage?.()
        }

        if (activeRouteId === 'session') {
          renderSessionPage()
        }

        if (activeRouteId === 'session-detail') {
          initSessionDetailPage()
        }

        if (activeRouteId === 'config') {
          initConfigPage()
        }

        if (activeRouteId === 'leads') {
          renderLeadsPage()
        }

        if (activeRouteId === 'leads-detail') {
          initLeadDetailPage()
        }

        if (activeRouteId === 'customer-detail') {
          initCustomerDetailPage()
        }

        if (activeRouteId === 'dashboard' || activeRouteId === 'store-dashboard') {
          initStoreDashboardPage()
        }

        if (activeRouteId === 'sales-dashboard' || activeRouteId === 'sales-dcc') {
          initSalesDccPage()
        }

        if (activeRouteId === 'sales-advisor') {
          initSalesAdvisorPage()
        }

        syncRoute(activeRouteId)
      }

      navButtons.forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.href) {
            window.location.href = button.dataset.href
            return
          }
          navigateToRoute(button.dataset.page)
        })
      })

      document.addEventListener('click', (event) => {
        if (!event.target.closest('.custom-select-container')) {
          document.querySelectorAll('.custom-select-options').forEach((node) => node.classList.remove('open'))
          document.querySelectorAll('[data-session-page-size-trigger], [data-leads-page-size-trigger]').forEach((node) => {
            node.classList.remove('is-open')
          })
        }

        if (!event.target.closest('.task-filter-menu')) {
          document.querySelectorAll('.task-filter-options').forEach((node) => node.classList.remove('open'))
        }

        if (sessionMenuState.openMenu && !event.target.closest('[data-session-menu-root]')) {
          closeSessionMenus()
        }

        if (leadsMenuState.openMenu && !event.target.closest('[data-leads-menu-root]')) {
          closeLeadsMenus()
        }

        if (configDatePickerState.open && !event.target.closest('[data-config-date-root]')) {
          closeConfigDatePicker()
        }

        if (salesRoleDateState.openRole && !event.target.closest('[data-sales-date-root]')) {
          closeSalesRoleDatePicker()
        }
      })

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
          return
        }

        if (feedbackModalState.open) {
          resolveFeedbackModal(false)
        }

        if (configDatePickerState.open) {
          closeConfigDatePicker()
        }

        if (sessionMenuState.openMenu) {
          closeSessionMenus()
        }

        if (leadsMenuState.openMenu) {
          closeLeadsMenus()
        }

        if (salesRoleDateState.openRole) {
          closeSalesRoleDatePicker()
        }
      })

      window.addEventListener('hashchange', () => {
        const routeId = getCurrentRoute()
        if (pages[routeId]) {
          renderPage(routeId)
        }
      })

      renderPage(getCurrentRoute())
    
