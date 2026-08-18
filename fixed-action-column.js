(function () {
  'use strict';

  var WRAPPER_SELECTOR = '.table-wrap, .table-scroll, .hot-distribution-table-wrap';
  var SCROLL_CLASS = 'action-column-scroll';
  var FIXED_CLASS = 'has-fixed-action-column';
  var SHADOW_CLASS = 'has-action-column-shadow';
  var END_THRESHOLD = 2;
  var observedTables = new WeakSet();
  var scheduledWrappers = new WeakSet();

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, '');
  }

  function getActionHeader(table) {
    if (!table || !table.tHead) return null;
    var rows = table.tHead.rows;
    if (!rows.length) return null;
    var cells = rows[rows.length - 1].cells;
    if (!cells.length) return null;
    var lastCell = cells[cells.length - 1];
    return normalizeText(lastCell.textContent) === '操作' ? lastCell : null;
  }

  function hasDataRows(table) {
    if (!table.tBodies || !table.tBodies.length) return false;
    return Array.prototype.some.call(table.tBodies, function (tbody) {
      return Array.prototype.some.call(tbody.rows, function (row) {
        if (row.hidden || row.getAttribute('aria-hidden') === 'true') return false;
        if (row.cells.length < 2) return false;
        var lastCell = row.cells[row.cells.length - 1];
        return !lastCell.hasAttribute('colspan');
      });
    });
  }

  function findWrapper(table) {
    var wrapper = table.closest(WRAPPER_SELECTOR);
    return wrapper && wrapper.querySelector('table') === table ? wrapper : null;
  }

  function updateWrapper(wrapper, table) {
    if (!wrapper.isConnected || !table.isConnected) return;

    var hasRows = hasDataRows(table);
    var overflow = hasRows && wrapper.scrollWidth - wrapper.clientWidth > END_THRESHOLD;
    var remaining = wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft;
    var atEnd = remaining <= END_THRESHOLD;

    wrapper.classList.toggle(FIXED_CLASS, overflow);
    wrapper.classList.toggle(SHADOW_CLASS, overflow && !atEnd);
  }

  function scheduleUpdate(wrapper, table) {
    if (scheduledWrappers.has(wrapper)) return;
    scheduledWrappers.add(wrapper);
    window.requestAnimationFrame(function () {
      scheduledWrappers.delete(wrapper);
      updateWrapper(wrapper, table);
    });
  }

  function observeTable(table) {
    if (observedTables.has(table) || !getActionHeader(table)) return;
    var wrapper = findWrapper(table);
    if (!wrapper) return;

    observedTables.add(table);
    wrapper.classList.add(SCROLL_CLASS);

    wrapper.addEventListener('scroll', function () {
      scheduleUpdate(wrapper, table);
    }, { passive: true });

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(function () {
        scheduleUpdate(wrapper, table);
      });
      resizeObserver.observe(wrapper);
      resizeObserver.observe(table);
    }

    var tableObserver = new MutationObserver(function () {
      scheduleUpdate(wrapper, table);
    });
    tableObserver.observe(table, { childList: true, subtree: true, characterData: true });

    scheduleUpdate(wrapper, table);
  }

  function scanTables(root) {
    if (root instanceof HTMLTableElement) observeTable(root);
    if (!root.querySelectorAll) return;
    root.querySelectorAll('table').forEach(observeTable);
  }

  function init() {
    scanTables(document);

    var documentObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) scanTables(node);
        });
      });
    });
    documentObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', function () {
      document.querySelectorAll('.' + SCROLL_CLASS).forEach(function (wrapper) {
        var table = wrapper.querySelector(':scope > table');
        if (table) scheduleUpdate(wrapper, table);
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
