(function installFieldSettingsInteractions(global) {
  'use strict';

  if (global.__fieldSettingsInteractions) return;

  function createController(config) {
    var drag = null;
    var autoScrollFrame = 0;

    function getList() {
      return document.querySelector(config.listSelector);
    }

    function getItems(list) {
      return Array.from(list ? list.querySelectorAll(config.itemSelector) : []);
    }

    function getOrder(list) {
      return getItems(list).map(config.getKey);
    }

    function animateReflow(list, mutate) {
      var items = getItems(list);
      var firstTops = new Map(items.map(function (item) { return [item, item.getBoundingClientRect().top]; }));
      mutate();
      items.forEach(function (item) {
        var deltaY = firstTops.get(item) - item.getBoundingClientRect().top;
        if (Math.abs(deltaY) < 1) return;
        item.style.transform = 'translateY(' + deltaY + 'px)';
        global.requestAnimationFrame(function () {
          if (item.isConnected) item.style.transform = '';
        });
      });
    }

    function updateGhostPosition(activeDrag, clientX, clientY) {
      if (!activeDrag || !activeDrag.ghost) return;
      var maxLeft = Math.max(8, global.innerWidth - activeDrag.rect.width - 8);
      var maxTop = Math.max(8, global.innerHeight - activeDrag.rect.height - 8);
      activeDrag.ghost.style.left = Math.min(maxLeft, Math.max(8, clientX - activeDrag.grabOffsetX)) + 'px';
      activeDrag.ghost.style.top = Math.min(maxTop, Math.max(8, clientY - activeDrag.grabOffsetY)) + 'px';
    }

    function updateTarget(activeDrag, clientX, clientY) {
      if (!activeDrag || !activeDrag.active || !activeDrag.placeholder) return;
      var list = getList();
      var target = document.elementFromPoint(clientX, clientY);
      target = target && target.closest(config.itemSelector);
      if (!list || !target || !list.contains(target)) return;
      var rect = target.getBoundingClientRect();
      var insertBefore = clientY < rect.top + rect.height / 2;
      var alreadyBefore = activeDrag.placeholder.nextElementSibling === target;
      var alreadyAfter = activeDrag.placeholder.previousElementSibling === target;
      if (insertBefore && alreadyBefore || !insertBefore && alreadyAfter) return;
      animateReflow(list, function () {
        if (insertBefore) target.before(activeDrag.placeholder);
        else target.after(activeDrag.placeholder);
      });
    }

    function stopAutoScroll() {
      if (!autoScrollFrame) return;
      global.cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = 0;
    }

    function runAutoScroll() {
      if (!drag || !drag.active) {
        autoScrollFrame = 0;
        return;
      }
      var scroller = document.querySelector(config.scrollerSelector);
      var rect = scroller && scroller.getBoundingClientRect();
      if (scroller && rect && scroller.scrollHeight > scroller.clientHeight) {
        var edge = 64;
        var topDistance = rect.top + edge - drag.lastClientY;
        var bottomDistance = drag.lastClientY - (rect.bottom - edge);
        var delta = 0;
        if (topDistance > 0) delta = -Math.ceil(Math.pow(Math.min(1, topDistance / edge), 2) * 14);
        else if (bottomDistance > 0) delta = Math.ceil(Math.pow(Math.min(1, bottomDistance / edge), 2) * 14);
        if (delta) {
          scroller.scrollTop += delta;
          updateGhostPosition(drag, drag.lastClientX, drag.lastClientY);
          updateTarget(drag, drag.lastClientX, drag.lastClientY);
        }
      }
      autoScrollFrame = global.requestAnimationFrame(runAutoScroll);
    }

    function start(event) {
      if (!drag || drag.active) return;
      drag.active = true;
      drag.rect = drag.item.getBoundingClientRect();
      drag.grabOffsetX = event.clientX - drag.rect.left;
      drag.grabOffsetY = event.clientY - drag.rect.top;
      drag.placeholder = document.createElement('div');
      drag.placeholder.className = 'badge-field-settings-placeholder';
      drag.placeholder.setAttribute('aria-hidden', 'true');
      drag.placeholder.style.height = drag.rect.height + 'px';
      drag.placeholder.style.width = drag.rect.width + 'px';
      drag.item.parentElement.insertBefore(drag.placeholder, drag.item);
      drag.item.classList.add('is-drag-source');
      drag.item.remove();
      drag.ghost = drag.item.cloneNode(true);
      drag.ghost.classList.add('badge-field-settings-drag-ghost');
      drag.ghost.classList.remove('is-drag-source', 'is-drop-hidden');
      drag.ghost.style.width = drag.rect.width + 'px';
      drag.ghost.style.height = drag.rect.height + 'px';
      drag.ghost.setAttribute('aria-hidden', 'true');
      drag.ghost.removeAttribute('draggable');
      document.body.appendChild(drag.ghost);
      drag.list.classList.add('is-dragging');
      document.body.classList.add('badge-field-settings-dragging');
      updateGhostPosition(drag, event.clientX, event.clientY);
      autoScrollFrame = global.requestAnimationFrame(runAutoScroll);
    }

    function finish() {
      if (!drag) return;
      stopAutoScroll();
      if (!drag.active) {
        drag = null;
        return;
      }
      var item = drag.item;
      if (drag.placeholder && drag.placeholder.isConnected) drag.placeholder.replaceWith(item);
      else if (!item.isConnected) drag.list.appendChild(item);
      item.classList.remove('is-drag-source');
      item.classList.add('is-drop-hidden');
      config.onOrderChange(getOrder(drag.list));
      var targetRect = item.getBoundingClientRect();
      drag.list.classList.remove('is-dragging');
      document.body.classList.remove('badge-field-settings-dragging');
      if (drag.ghost) {
        var ghost = drag.ghost;
        ghost.classList.add('is-dropping');
        ghost.style.left = targetRect.left + 'px';
        ghost.style.top = targetRect.top + 'px';
        global.setTimeout(function () {
          ghost.remove();
          item.classList.remove('is-drop-hidden');
        }, 180);
      } else item.classList.remove('is-drop-hidden');
      drag = null;
    }

    function cancel() {
      if (!drag) return;
      stopAutoScroll();
      if (drag.placeholder && drag.placeholder.isConnected) drag.placeholder.replaceWith(drag.item);
      else if (!drag.item.isConnected) drag.list.appendChild(drag.item);
      var byKey = new Map(getItems(drag.list).map(function (item) { return [config.getKey(item), item]; }));
      drag.originalOrder.forEach(function (key) {
        var item = byKey.get(key);
        if (item) drag.list.appendChild(item);
      });
      drag.item.classList.remove('is-drag-source', 'is-drop-hidden');
      if (drag.ghost) drag.ghost.remove();
      drag.list.classList.remove('is-dragging');
      document.body.classList.remove('badge-field-settings-dragging');
      drag = null;
    }

    document.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || config.enabled && !config.enabled()) return;
      var handle = event.target.closest('.badge-field-drag-handle');
      var item = handle && handle.closest(config.itemSelector);
      var list = getList();
      if (!item || !list || !list.contains(item)) return;
      event.preventDefault();
      drag = {
        item: item,
        list: list,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        originalOrder: getOrder(list),
        active: false
      };
      if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
    });
    document.addEventListener('pointermove', function (event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      drag.lastClientX = event.clientX;
      drag.lastClientY = event.clientY;
      if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return;
      if (!drag.active) start(event);
      updateGhostPosition(drag, event.clientX, event.clientY);
      updateTarget(drag, event.clientX, event.clientY);
    });
    document.addEventListener('pointerup', function (event) {
      if (drag && event.pointerId === drag.pointerId) finish();
    });
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('pointerleave', function () { if (drag && drag.active) cancel(); });
    global.addEventListener('blur', cancel);

    return { cancel: cancel };
  }

  global.__fieldSettingsInteractions = { createController: createController };
})(window);
