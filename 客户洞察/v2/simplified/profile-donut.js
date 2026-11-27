(function (host) {
  'use strict';

  const preferredPhrases = new Map([
    ['购车时间未定', ['购车时间', '未定']],
    ['决策时间未定', ['决策时间', '未定']],
    ['空间与乘坐体验', ['空间与', '乘坐体验']],
    ['金融方案不满', ['金融方案', '不满']],
    ['交付周期不满', ['交付周期', '不满']],
    ['有旧车待置换', ['有旧车', '待置换']],
    ['咨询置换政策', ['咨询', '置换政策']],
    ['旧车已处理', ['旧车', '已处理']],
    ['网约车司机', ['网约车', '司机']],
    ['底盘舒适性', ['底盘', '舒适性']],
    ['低首付方案', ['低首付', '方案']]
  ]);
  const words = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-CN', { granularity: 'word' }) : null;

  function setCenterLabel(label, name) {
    const phrases = preferredPhrases.get(name) ?? (words && /\p{Script=Han}/u.test(name)
      ? Array.from(words.segment(name), entry => entry.segment)
      : []);
    if (phrases.length < 2) {
      label.textContent = name;
      return;
    }
    const document = label.ownerDocument;
    label.replaceChildren(...phrases.map(phrase => {
      if (!phrase.trim()) return document.createTextNode(phrase);
      const element = document.createElement('span');
      element.className = 'ci-profile-donut-phrase';
      element.textContent = phrase;
      return element;
    }));
  }

  function options(slices, animate, grow = false) {
    return {
      animation: animate,
      stateAnimation: { duration: animate ? 150 : 0, easing: 'cubicOut' },
      series: [{
        type: 'pie',
        startAngle: 90,
        clockwise: true,
        animationType: 'expansion',
        animationEasing: 'cubicOut',
        animationDuration: grow ? 320 : 0,
        animationDurationUpdate: 0,
        radius: ['62%', '92%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 1.5 },
        emphasis: { scale: animate, scaleSize: 3, focus: 'self' },
        blur: { itemStyle: { opacity: 0.42 } },
        stillShowZeroSum: false,
        showEmptyCircle: true,
        emptyCircleStyle: { color: '#e8edf5' },
        data: slices.map(({ name, value, color }) => ({ name, value, itemStyle: { color } }))
      }]
    };
  }

  function linkLabels(chart, plot, slices, signal) {
    const labels = Array.from(plot.closest('.ci-pie-card').querySelectorAll('.ci-pie-list > button')).slice(0, slices.length);
    const center = plot.parentElement.querySelector('.ci-profile-donut-center');
    const centerValue = center.querySelector('strong'), centerLabel = center.querySelector('span');
    const sampleCount = centerValue.textContent, sampleLabel = centerLabel.textContent;
    let pointerSource, pointerIndex = -1, focusIndex = -1, activeIndex = -1;
    function update() {
      const next = pointerIndex >= 0 ? pointerIndex : focusIndex;
      if (next === activeIndex) return;
      if (activeIndex >= 0) {
        labels[activeIndex]?.classList.remove('is-donut-highlight');
        chart.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: activeIndex });
      }
      activeIndex = next;
      const slice = slices[next];
      centerValue.textContent = slice?.share ?? sampleCount;
      if (slice) setCenterLabel(centerLabel, slice.name);
      else centerLabel.textContent = sampleLabel;
      center.classList.toggle('is-showing-share', Boolean(slice));
      if (next < 0) return;
      labels[next]?.classList.add('is-donut-highlight');
      chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: next });
    }
    function pointAt(source, index) {
      pointerSource = source;
      pointerIndex = index;
      update();
    }
    function leave(source, index = pointerIndex) {
      if (pointerSource !== source || pointerIndex !== index) return;
      pointerIndex = -1;
      update();
    }

    chart.on('mousemove', 'series.pie', ({ dataIndex }) => pointAt('chart', dataIndex));
    chart.on('mouseout', 'series.pie', ({ dataIndex }) => leave('chart', dataIndex));
    plot.addEventListener('pointerleave', () => leave('chart'), { signal });
    chart.on('click', 'series.pie', ({ dataIndex }) => {
      const label = labels[dataIndex];
      // Use the same drill-down and "其他" actions as the adjacent buttons.
      queueMicrotask(() => { if (label?.isConnected) label.click(); });
    });

    labels.forEach((label, index) => {
      label.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') pointAt('label', index);
      }, { signal });
      label.addEventListener('pointerleave', () => leave('label', index), { signal });
      label.addEventListener('focus', () => {
        if (label.matches(':focus-visible')) { focusIndex = index; update(); }
      }, { signal });
      label.addEventListener('blur', () => { if (focusIndex === index) { focusIndex = -1; update(); } }, { signal });
    });
  }

  function mount(container, { playIntro = false } = {}) {
    const plots = container.querySelectorAll('[data-profile-donut]');
    if (!plots.length || !host.echarts) return;
    const controller = new AbortController();
    const { signal } = controller;
    const motion = host.matchMedia('(prefers-reduced-motion: reduce)');
    const entries = new Map();
    const sizes = new host.ResizeObserver(records => records.forEach(({ target, contentRect }) => {
      const chart = entries.get(target)?.chart;
      const { width, height } = contentRect;
      if (chart && width && height && (width !== chart.getWidth() || height !== chart.getHeight())) chart.resize();
    }));
    const visibleFraction = 0.25;
    const visibility = playIntro && !motion.matches && host.IntersectionObserver
      ? new host.IntersectionObserver(records => {
        if (signal.aborted) return;
        records.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio >= visibleFraction) start(entries.get(target), true);
        });
      }, { threshold: visibleFraction })
      : null;

    function stopGrowth(entry) {
      entry.chart.off('finished', entry.finishGrowth);
      entry.finishGrowth = null;
      entry.card.classList.remove('is-donut-entering');
      entry.legendAnimation?.cancel();
      entry.legendAnimation = null;
    }

    function start(entry, grow) {
      if (entry.chart) return;
      const { plot, slices, card, legend } = entry;
      visibility?.unobserve(plot);
      const chart = host.echarts.init(plot, null, { renderer: 'svg' });
      entry.chart = chart;
      if (grow && !motion.matches) {
        entry.finishGrowth = () => stopGrowth(entry);
        chart.on('finished', entry.finishGrowth);
        // Keep the legend visible after its fade finishes while the ring is still growing.
        entry.legendAnimation = legend.animate?.([
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 220, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'both' });
      } else {
        card.classList.remove('is-donut-entering');
      }
      chart.setOption(options(slices, !motion.matches, Boolean(entry.finishGrowth)));
      linkLabels(chart, plot, slices, signal);
      sizes.observe(plot);
    }

    function showNow(entry) {
      if (!entry.chart) {
        start(entry, false);
        return;
      }
      if (entry.finishGrowth) {
        stopGrowth(entry);
        entry.chart.setOption(options(entry.slices, !motion.matches), { notMerge: true });
      }
    }

    plots.forEach(plot => {
      const card = plot.closest('.ci-pie-card');
      const legend = card.querySelector('.ci-pie-list');
      const slices = JSON.parse(plot.dataset.profileDonut);
      const entry = { plot, card, legend, slices };
      entries.set(plot, entry);
      if (visibility && slices.some(slice => slice.value > 0)) {
        card.classList.add('is-donut-entering');
        legend.addEventListener('focus', () => showNow(entry), { capture: true, signal });
        visibility.observe(plot);
      } else {
        start(entry, false);
      }
    });
    motion.addEventListener('change', () => {
      const animate = !motion.matches;
      entries.forEach(entry => {
        if (!animate) showNow(entry);
        entry.chart?.setOption({
          animation: animate,
          stateAnimation: { duration: animate ? 150 : 0 },
          series: [{ emphasis: { scale: animate } }]
        });
      });
    }, { signal });
    return () => {
      controller.abort();
      visibility?.disconnect();
      sizes.disconnect();
      entries.forEach(entry => {
        entry.legendAnimation?.cancel();
        entry.chart?.dispose();
        entry.card.classList.remove('is-donut-entering');
      });
    };
  }

  function renderSnapshot(container) {
    container.querySelectorAll('[data-profile-donut]').forEach(plot => {
      const chart = host.echarts.init(null, null, {
        renderer: 'svg', ssr: true, width: plot.clientWidth, height: plot.clientHeight
      });
      try {
        chart.setOption(options(JSON.parse(plot.dataset.profileDonut), false));
        plot.innerHTML = chart.renderToSVGString();
        plot.removeAttribute('data-profile-donut');
      } finally {
        chart.dispose();
      }
    });
  }

  host.InsightProfileDonut = { mount, renderSnapshot };
})(window);
