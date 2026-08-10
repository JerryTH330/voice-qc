// 共享：问题规则列表（厂端、门店、销售 3 处共用）
// 暴露：
// - IssueRuleList.createAutoCollapser({ renderHtml, previewLimit, collapsedLimit, progressive, sceneAttrName })
//   创建 measure 函数 + autoCollapser 函数（挂到根，遍历 [data-issue-rule-scenes]:not([data-issue-rule-scenes-ready])）
// - IssueRuleList.setupRowDrilldown({ root, dataKey, onRuleClick, containerSelector })
//   绑定 .issue-rule-action button click → 回调(ruleId)

(function (global) {
  'use strict';

  const MEASURE_COOLDOWN = 200;

  function isRuleNameEllipsis(el) {
    if (!el) return false;
    try {
      void el.offsetWidth;
      // 优先用原生滚动宽度判断，text-overflow: ellipsis 激活时 scrollWidth > clientWidth
      const scrollW = el.scrollWidth;
      const clientW = el.clientWidth;
      if (scrollW && clientW && scrollW > clientW + 1) return true;
      if (scrollW && clientW && scrollW <= clientW) return false;
      // flex 容器内部分浏览器 scrollWidth 不准，再用 Range API 兜底
      const range = document.createRange();
      range.selectNodeContents(el);
      const textWidth = range.getBoundingClientRect().width;
      const elWidth = el.getBoundingClientRect().width;
      return textWidth > elWidth + 4;
    } catch (e) {
      return false;
    }
  }

  function getRuleNameTextWidth(el) {
    if (!el) return 0;
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width;
    } catch (e) {
      return el.scrollWidth || 0;
    }
  }

  function chooseProgressivePreviewCount(labelCount, fits) {
    const safeCount = Math.max(0, Number(labelCount) || 0);
    if (safeCount <= 1) return safeCount;
    for (let previewCount = safeCount; previewCount >= 0; previewCount -= 1) {
      if (fits(previewCount)) return previewCount;
    }
    return 0;
  }

  function createAutoCollapser(opts) {
    const {
      renderHtml,         // (labels, limit) => string
      previewLimit,
      collapsedLimit,
      progressive = false,
      sceneSelector = '[data-issue-rule-scenes]:not([data-issue-rule-scenes-ready])',
    } = opts;

    return function autoCollapse(root = document) {
      if (!root || !root.querySelectorAll) return;
      const containers = root.querySelectorAll(sceneSelector);
      containers.forEach((cont) => {
        if (!cont.isConnected) return;
        const labelsAttr = cont.getAttribute('data-issue-rule-scenes-labels');
        if (!labelsAttr) return;
        let labels = [];
        try { labels = JSON.parse(labelsAttr); } catch (e) { return; }
        if (!Array.isArray(labels) || labels.length === 0) return;

        const strongEl = cont.parentElement && cont.parentElement.querySelector('[data-rule-name-ellipsis-target]');
        const lineEl = cont.parentElement;
        let lastMeasureAt = 0;
        let pendingMeasureTimer = null;

        const measure = () => {
          if (!cont.isConnected) return;
          const now = Date.now();
          const elapsed = now - lastMeasureAt;
          if (elapsed < MEASURE_COOLDOWN) {
            if (pendingMeasureTimer) clearTimeout(pendingMeasureTimer);
            pendingMeasureTimer = setTimeout(measure, MEASURE_COOLDOWN - elapsed);
            return;
          }
          pendingMeasureTimer = null;
          lastMeasureAt = now;

          if (progressive) {
            const lineWidth = lineEl ? lineEl.getBoundingClientRect().width : 0;
            if (!lineWidth) return;
            const lineStyle = typeof getComputedStyle === 'function' ? getComputedStyle(lineEl) : null;
            const lineGap = Number.parseFloat(lineStyle?.columnGap || lineStyle?.gap || 0) || 0;
            const nameTextWidth = getRuleNameTextWidth(strongEl);
            const renderPreview = (previewCount) => {
              cont.innerHTML = renderHtml(labels, previewCount);
              void cont.offsetHeight;
              return cont.scrollWidth;
            };
            const previewCount = chooseProgressivePreviewCount(labels.length, (count) => (
              nameTextWidth + lineGap + renderPreview(count) <= lineWidth + 1
            ));
            renderPreview(previewCount);
            cont.dataset.issueRuleScenesState = previewCount === labels.length ? 'expanded' : 'collapsed';

            const isStrongTruncated = isRuleNameEllipsis(strongEl);
            if (strongEl) {
              if (isStrongTruncated) {
                strongEl.dataset.ruleNameTruncated = 'true';
              } else {
                delete strongEl.dataset.ruleNameTruncated;
              }
            }
            return;
          }

          if (labels.length <= 1) return;

          const wasCollapsed = cont.dataset.issueRuleScenesState === 'collapsed';
          if (wasCollapsed) {
            cont.innerHTML = renderHtml(labels, previewLimit);
            cont.offsetHeight;
          }
          const isStrongTruncated = isRuleNameEllipsis(strongEl);
          if (strongEl) {
            if (isStrongTruncated) {
              strongEl.dataset.ruleNameTruncated = 'true';
            } else {
              delete strongEl.dataset.ruleNameTruncated;
            }
          }
          const isScenesOverflow = cont.scrollWidth > cont.clientWidth + 1;
          if (isStrongTruncated || isScenesOverflow) {
            cont.innerHTML = renderHtml(labels, collapsedLimit);
            cont.dataset.issueRuleScenesState = 'collapsed';
          } else {
            cont.dataset.issueRuleScenesState = 'expanded';
          }
        };

        cont.setAttribute('data-issue-rule-scenes-ready', '1');
        requestAnimationFrame(measure);

        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver(() => measure());
          ro.observe(progressive && lineEl ? lineEl : cont);
          if (!progressive && strongEl) ro.observe(strongEl);
          cont._issueRuleScenesObserver = ro;
        }
      });
    };
  }

  function setupRowDrilldown(opts) {
    const {
      root,
      dataKey,                  // row 上的 data-* attribute 名（如 'ruleId' / 'storeSopRuleId' / 'salesReviewRecordingIndex'）
      onRuleClick,              // (value, event) => void
      buttonSelector = '.issue-rule-action[data-' + dataKey + ']',
      getValue = (el) => el.dataset[toCamel(dataKey)],
    } = opts;

    if (!root) return;
    root.querySelectorAll(buttonSelector).forEach((actionBtn) => {
      actionBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const value = getValue(actionBtn);
        if (value !== undefined && value !== null) {
          onRuleClick(value, event);
        }
      });
    });
  }

  function toCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  function renderSceneTagsHtml(labels, opts) {
    const {
      previewLabels = labels,
      getDisplayLabel,        // (fullLabel) => string
    } = opts;
    const hasMore = labels.length > previewLabels.length;
    return `
      <span class="issue-rule-tags">
        ${previewLabels.map(label => `<em title="${escapeHtml(label)}" data-tag-label="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${escapeHtml(getDisplayLabel(label))}<span class="issue-rule-tag-popover" role="tooltip">${escapeHtml(label)}</span></em>`).join('')}
      </span>
      ${hasMore ? `
        <details class="issue-rule-scene-more">
          <summary aria-label="查看全部所属业务场景">...</summary>
          <span class="issue-rule-scene-popover">
            <strong>所属业务场景</strong>
            <span class="issue-rule-scene-popover-tags">
              ${labels.map(label => `<em>${escapeHtml(label)}</em>`).join('')}
            </span>
          </span>
        </details>
      ` : ''}
    `;
  }

  function renderSceneTags(sceneLabels, opts) {
    const labels = [...new Set((sceneLabels || []).filter(Boolean))];
    const dataLabels = escapeHtml(JSON.stringify(labels));
    return `<span class="issue-rule-scenes" data-issue-rule-scenes data-issue-rule-scenes-labels='${dataLabels}'>${opts.renderTagsHtml(labels)}</span>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.IssueRuleList = {
    createAutoCollapser,
    chooseProgressivePreviewCount,
    setupRowDrilldown,
    renderSceneTagsHtml,
    renderSceneTags,
    escapeHtml,
    MEASURE_COOLDOWN,
  };
})(typeof window !== 'undefined' ? window : globalThis);
