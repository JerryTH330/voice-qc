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

  function options(slices, animate) {
    return {
      animation: animate,
      stateAnimation: { duration: animate ? 150 : 0, easing: 'cubicOut' },
      series: [{
        type: 'pie',
        animationDuration: 0,
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

  function mount(container) {
    const plots = container.querySelectorAll('[data-profile-donut]');
    if (!plots.length || !host.echarts) return;
    const controller = new AbortController();
    const motion = host.matchMedia('(prefers-reduced-motion: reduce)');
    const charts = new Map();
    const sizes = new host.ResizeObserver(entries => entries.forEach(({ target, contentRect }) => {
      const chart = charts.get(target);
      const { width, height } = contentRect;
      if (chart && width && height && (width !== chart.getWidth() || height !== chart.getHeight())) chart.resize();
    }));
    plots.forEach(plot => {
      const slices = JSON.parse(plot.dataset.profileDonut);
      const chart = host.echarts.init(plot, null, { renderer: 'svg' });
      chart.setOption(options(slices, !motion.matches));
      linkLabels(chart, plot, slices, controller.signal);
      charts.set(plot, chart);
      sizes.observe(plot);
    });
    motion.addEventListener('change', () => {
      const animate = !motion.matches;
      charts.forEach(chart => chart.setOption({
        animation: animate,
        stateAnimation: { duration: animate ? 150 : 0 },
        series: [{ emphasis: { scale: animate } }]
      }));
    }, { signal: controller.signal });
    return () => {
      sizes.disconnect();
      controller.abort();
      charts.forEach(chart => chart.dispose());
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
