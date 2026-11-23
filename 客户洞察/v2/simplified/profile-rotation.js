(function (host) {
  'use strict';

  function mount(root, state) {
    const document = root.ownerDocument;
    const view = document.defaultView;
    const batches = [...root.querySelectorAll('[data-profile-batch]')];
    const status = root.querySelector('[data-profile-batch-status]');
    const announcement = root.querySelector('[data-profile-batch-announcement]');
    const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = view.matchMedia('(hover: hover)');
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let index = state.index, requestedIndex = index;
    let timer, animation, observer;
    let visible = false, automaticTransition = false;

    function showBatch(next, announce) {
      index = requestedIndex = next;
      batches.forEach((batch, position) => {
        const inactive = position !== index;
        batch.inert = inactive;
        batch.setAttribute('aria-hidden', String(inactive));
      });
      status.textContent = `${index + 1} / ${batches.length}`;
      if (announce) announcement.textContent = `第 ${index + 1} 批，共 ${batches.length} 批`;
      state.onIndexChange(index);
    }

    function canPlay() {
      const focused = document.activeElement;
      const keyboardFocus = root.contains(focused) && focused.matches(':focus-visible');
      return !reducedMotion.matches && visible && !document.hidden
        && !document.querySelector('dialog[open]') && root.isConnected && !listeners.signal.aborted
        && !keyboardFocus && !(hover.matches && root.matches(':hover'));
    }

    function schedule() {
      view.clearTimeout(timer);
      if (!animation && canPlay()) {
        timer = view.setTimeout(() => {
          if (canPlay()) changeBatch(1, true, true);
        }, 8000);
      }
    }

    function cancelMotion() {
      animation?.cancel();
      animation = null;
    }

    function animate(batch, keyframes, duration, finish) {
      const running = batch.animate(keyframes, {
        duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'both'
      });
      animation = running;
      running.onfinish = () => {
        if (animation !== running) return;
        cancelMotion();
        finish();
      };
    }

    function changeBatch(step, withMotion, automatic = false) {
      view.clearTimeout(timer);
      cancelMotion();
      requestedIndex = (requestedIndex + step + batches.length) % batches.length;
      const next = requestedIndex;
      if (!withMotion || reducedMotion.matches || !batches[index].animate || next === index) {
        showBatch(next, !automatic);
        schedule();
        return;
      }
      automaticTransition = automatic;
      animate(batches[index], [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-4px)' }
      ], 80, () => {
        if (automatic && !canPlay()) {
          requestedIndex = index;
          schedule();
          return;
        }
        showBatch(next, !automatic);
        animate(batches[index], [
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], 140, schedule);
      });
    }

    function reconsider() {
      if (animation && (reducedMotion.matches || (automaticTransition && !canPlay()))) {
        cancelMotion();
        if (!automaticTransition) showBatch(requestedIndex, true);
        requestedIndex = index;
      }
      schedule();
    }

    root.addEventListener('click', event => {
      const step = event.target.closest('[data-profile-batch-step]');
      if (step) changeBatch(Number(step.dataset.profileBatchStep), event.detail > 0);
    }, options);
    root.addEventListener('pointerenter', reconsider, options);
    root.addEventListener('pointerleave', reconsider, options);
    root.addEventListener('focusin', reconsider, options);
    root.addEventListener('focusout', () => queueMicrotask(reconsider), options);
    document.addEventListener('visibilitychange', reconsider, options);
    document.addEventListener('close', reconsider, { ...options, capture: true });
    reducedMotion.addEventListener('change', reconsider, options);

    if (view.IntersectionObserver) {
      observer = new view.IntersectionObserver(([entry]) => {
        visible = entry.intersectionRatio >= 0.25;
        reconsider();
      }, { threshold: 0.25 });
      observer.observe(root.querySelector('[data-profile-batch-window]'));
    }
    showBatch(index, false);

    return () => {
      listeners.abort();
      observer?.disconnect();
      view.clearTimeout(timer);
      cancelMotion();
    };
  }

  host.InsightProfileRotation = { mount };
})(window);
