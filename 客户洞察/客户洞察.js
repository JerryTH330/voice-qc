(function () {
  const TOPICS = [
    {
      name: "续航",
      description: "真实续航、冬季与高速场景",
      visit: { aRate: 42.8, bRate: 56.6, aSentiment: [34, 38, 28], bSentiment: [18, 37, 45] },
      lead: { aRate: 38.6, bRate: 57.9, aSentiment: [42, 36, 22], bSentiment: [15, 34, 51] },
      children: ["真实续航", "高速续航", "冬季续航", "续航达成率"],
      voiceText: [
        ["negative", "销售说能跑六百公里，但我更想知道<strong>高速实际能跑多少</strong>，经常跑长途，差太多就不考虑了。"],
        ["neutral", "冬天开暖风以后大概还能有多少续航？我家这边<strong>冬季温度比较低</strong>。"],
        ["positive", "试驾回来电耗比我预想的低，如果日常能稳定在这个水平，<strong>通勤完全够用</strong>。"],
        ["negative", "之前开过朋友的电车，表显掉得太快，我对<strong>续航达成率</strong>还是有点没信心。"]
      ]
    },
    {
      name: "空间",
      description: "二排、后备箱与储物空间",
      visit: { aRate: 51.6, bRate: 40.2, aSentiment: [55, 31, 14], bSentiment: [42, 35, 23] },
      lead: { aRate: 56.1, bRate: 39.4, aSentiment: [61, 28, 11], bSentiment: [38, 37, 25] },
      children: ["二排空间", "后备箱", "储物空间", "头部空间"],
      voiceText: [
        ["positive", "后排地台是平的，孩子坐中间不会难受，<strong>二排空间比我现在的车宽敞</strong>。"],
        ["neutral", "婴儿车不折叠能不能直接放进去？我主要想确认一下<strong>后备箱的纵深</strong>。"],
        ["positive", "前排这些小储物格挺实用，手机和水杯都有地方放，<strong>家用考虑得比较细</strong>。"],
        ["negative", "我坐后排头发会碰到顶，可能是全景天幕占了点空间，<strong>头部余量一般</strong>。"]
      ]
    },
    {
      name: "充电补能",
      description: "快充速度、充电便利性",
      visit: { aRate: 19.4, bRate: 28.1, aSentiment: [29, 43, 28], bSentiment: [17, 41, 42] },
      lead: { aRate: 17.8, bRate: 31.7, aSentiment: [34, 41, 25], bSentiment: [13, 38, 49] },
      children: ["快充速度", "公共充电", "家充安装", "低温充电"],
      voiceText: [
        ["negative", "小区暂时装不了家充，如果外面每次都要等很久，<strong>用起来会比较麻烦</strong>。"],
        ["neutral", "从百分之二十充到八十要多久？服务区的快充桩能不能都兼容？"],
        ["positive", "半小时左右补到八成我能接受，吃个饭的时间基本就够了。"],
        ["negative", "附近公共桩晚上经常排队，这个不是车的问题，但确实会影响我选电车。"]
      ]
    },
    {
      name: "智能驾驶",
      description: "功能丰富度、安全感、易用性",
      visit: { aRate: 37.1, bRate: 43.5, aSentiment: [46, 39, 15], bSentiment: [31, 43, 26] },
      lead: { aRate: 42.3, bRate: 48.8, aSentiment: [52, 36, 12], bSentiment: [29, 40, 31] },
      children: ["高速领航", "自动泊车", "主动安全", "人机交互"],
      voiceText: [
        ["positive", "刚才自动泊车识别得很快，车位两边都很窄，<strong>对新手挺友好</strong>。"],
        ["neutral", "高速领航是全国都能用，还是只有开通的城市和道路可以用？"],
        ["negative", "变道的时候动作有点突然，我还是会紧张，<strong>安全感不如自己开</strong>。"],
        ["positive", "语音连续说几个指令都能听懂，不用每次重新唤醒，这点很方便。"]
      ]
    },
    {
      name: "内饰",
      description: "用料、座椅、车机与质感",
      visit: { aRate: 29.8, bRate: 34.1, aSentiment: [41, 39, 20], bSentiment: [32, 40, 28] },
      lead: { aRate: 33.2, bRate: 36.7, aSentiment: [47, 37, 16], bSentiment: [30, 39, 31] },
      children: ["座椅舒适", "内饰用料", "车机屏幕", "异味控制"],
      voiceText: [
        ["positive", "座椅两侧支撑挺到位，腰部也不会空，长时间开应该不会太累。"],
        ["negative", "门板下面这块塑料感有点明显，和这个价位比，<strong>质感还差一点</strong>。"],
        ["neutral", "这块屏幕以后系统会持续更新吗？我比较在意车机用两年会不会卡。"],
        ["positive", "新车里面味道不算大，家里有小孩，这一点对我比较重要。"]
      ]
    },
    {
      name: "外观",
      description: "造型、颜色、灯组与比例",
      visit: { aRate: 33.4, bRate: 30.6, aSentiment: [63, 29, 8], bSentiment: [55, 33, 12] },
      lead: { aRate: 35.8, bRate: 28.4, aSentiment: [68, 25, 7], bSentiment: [51, 35, 14] },
      children: ["前脸造型", "车身颜色", "灯组设计", "整车比例"],
      voiceText: [
        ["positive", "这个前脸比图片上看着更有层次，实车不显得夸张，我挺喜欢。"],
        ["neutral", "灰色要等多久？白色现车多，但我还是想看看不同颜色的实车。"],
        ["positive", "侧面比例很顺，车看着不小，但开起来视野没有压迫感。"],
        ["negative", "尾灯晚上很有辨识度，不过白天看装饰件稍微有点复杂。"]
      ]
    },
    {
      name: "操控",
      description: "底盘、转向、制动与舒适性",
      visit: { aRate: 21.9, bRate: 18.7, aSentiment: [49, 36, 15], bSentiment: [39, 40, 21] },
      lead: { aRate: 25.6, bRate: 19.2, aSentiment: [55, 33, 12], bSentiment: [36, 40, 24] },
      children: ["底盘滤振", "转向手感", "制动感受", "高速稳定"],
      voiceText: [
        ["positive", "过减速带没有多余弹跳，后排坐着也不颠，<strong>底盘比预想的整</strong>。"],
        ["neutral", "方向盘力度能不能调？现在这个模式对我来说稍微有点轻。"],
        ["negative", "松电门的时候减速感太明显，我容易晕车，可能要再适应一下。"],
        ["positive", "快速路上变道车身没有晃，速度起来以后还是挺稳的。"]
      ]
    }
  ];

  const SENTIMENT_LABELS = {
    positive: "正面",
    neutral: "中性",
    negative: "负面"
  };

  const state = {
    mode: "all",
    topic: "all",
    sort: "rate",
    sentiment: "all",
    grain: "week",
    showAllVoices: false
  };

  const modeMeta = {
    all: {
      label: "全部客户",
      sample: [799, 649]
    },
    visit: {
      aLabel: "邀约到店",
      bLabel: "邀约未到店",
      aSampleLabel: "邀约到店客户",
      bSampleLabel: "邀约未到店客户",
      sample: [426, 373, 351, 298]
    },
    lead: {
      aLabel: "高转化客户",
      bLabel: "待突破客户",
      sample: [326, 441, 271, 355, 23]
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getAllTopicStats(topic) {
    const aFeedback = modeMeta.visit.sample[2];
    const bFeedback = modeMeta.visit.sample[3];
    const aCount = aFeedback * topic.visit.aRate / 100;
    const bCount = bFeedback * topic.visit.bRate / 100;
    const totalCount = aCount + bCount;
    const sentiment = [0, 1, 2].map((index) => Math.round(
      (aCount * topic.visit.aSentiment[index] + bCount * topic.visit.bSentiment[index]) / totalCount
    ));
    sentiment[1] = 100 - sentiment[0] - sentiment[2];
    return {
      rate: Number((totalCount / (aFeedback + bFeedback) * 100).toFixed(1)),
      sentiment
    };
  }

  function getAggregateStats(mode) {
    const sample = modeMeta[mode].sample;
    if (mode === "all") {
      const topicStats = TOPICS.map(getAllTopicStats);
      const totalWeight = topicStats.reduce((sum, stats) => sum + stats.rate, 0);
      const sentiment = [0, 1, 2].map((index) => Math.round(
        topicStats.reduce((sum, stats) => sum + stats.rate * stats.sentiment[index], 0) / totalWeight
      ));
      sentiment[1] = 100 - sentiment[0] - sentiment[2];
      return {
        rate: Number((sample[1] / sample[0] * 100).toFixed(1)),
        sentiment
      };
    }
    const weightedSentiment = (group) => {
      const rateKey = `${group}Rate`;
      const sentimentKey = `${group}Sentiment`;
      const totalWeight = TOPICS.reduce((sum, topic) => sum + topic[mode][rateKey], 0);
      return [0, 1, 2].map((sentimentIndex) => Math.round(
        TOPICS.reduce((sum, topic) => sum + topic[mode][rateKey] * topic[mode][sentimentKey][sentimentIndex], 0) / totalWeight
      ));
    };
    const aSentiment = weightedSentiment("a");
    const bSentiment = weightedSentiment("b");
    aSentiment[1] = 100 - aSentiment[0] - aSentiment[2];
    bSentiment[1] = 100 - bSentiment[0] - bSentiment[2];
    return {
      aRate: Number((sample[2] / sample[0] * 100).toFixed(1)),
      bRate: Number((sample[3] / sample[1] * 100).toFixed(1)),
      aSentiment,
      bSentiment
    };
  }

  function getAggregateTopic() {
    return {
      name: "全部汇总",
      description: "当前筛选条件下的全部产品特征",
      all: getAggregateStats("all"),
      visit: getAggregateStats("visit"),
      lead: getAggregateStats("lead"),
      children: [],
      voiceText: []
    };
  }

  function getTopic(name = state.topic) {
    if (name === "all") return getAggregateTopic();
    return TOPICS.find((topic) => topic.name === name) || getAggregateTopic();
  }

  function getTopicStats(topic) {
    if (state.mode === "all") {
      return topic.name === "全部汇总" ? topic.all : getAllTopicStats(topic);
    }
    return topic[state.mode];
  }

  function getDelta(topic) {
    const stats = getTopicStats(topic);
    return Number((stats.aRate - stats.bRate).toFixed(1));
  }

  function getCounts(topic) {
    const stats = getTopicStats(topic);
    const sample = modeMeta[state.mode].sample;
    if (state.mode === "all") {
      return { total: Math.max(1, Math.round(sample[1] * stats.rate / 100)) };
    }
    const aDenominator = sample[2];
    const bDenominator = sample[3];
    return {
      a: Math.max(1, Math.round(aDenominator * stats.aRate / 100)),
      b: Math.max(1, Math.round(bDenominator * stats.bRate / 100))
    };
  }

  function renderSampleOverview() {
    const meta = modeMeta[state.mode];
    if (state.mode === "all") {
      const [customers, feedbackCustomers] = meta.sample;
      const grid = $("#sampleGrid");
      grid.className = "sample-grid is-all";
      grid.innerHTML = `
        <article class="sample-card"><span>全部客户数</span><strong>${customers.toLocaleString("zh-CN")}</strong><small>当前筛选范围内去重自然客户</small></article>
        <article class="sample-card a"><span>反馈客户数</span><strong>${feedbackCustomers.toLocaleString("zh-CN")}</strong><small>${(feedbackCustomers / customers * 100).toFixed(1)}% 有有效产品表达</small></article>
      `;
      return;
    }
    const [aCustomers, bCustomers, aFeedback, bFeedback, overlap] = meta.sample;
    const aSampleLabel = meta.aSampleLabel || meta.aLabel;
    const bSampleLabel = meta.bSampleLabel || meta.bLabel;
    const cards = [
      { tone: "a", label: `${aSampleLabel}数`, value: aCustomers, note: "去重自然客户" },
      { tone: "b", label: `${bSampleLabel}数`, value: bCustomers, note: "去重自然客户" },
      { tone: "a", label: `${aSampleLabel}反馈客户数`, value: aFeedback, note: `${(aFeedback / aCustomers * 100).toFixed(1)}% 有有效产品表达` },
      { tone: "b", label: `${bSampleLabel}反馈客户数`, value: bFeedback, note: `${(bFeedback / bCustomers * 100).toFixed(1)}% 有有效产品表达` }
    ];

    if (state.mode === "lead") {
      cards.push({ tone: "overlap", label: "重叠客户数", value: overlap, note: "不进入差异计算" });
    }

    const grid = $("#sampleGrid");
    grid.className = "sample-grid";
    grid.classList.toggle("has-overlap", state.mode === "lead");
    grid.innerHTML = cards.map((card) => `
      <article class="sample-card ${card.tone}">
        <span>${escapeHTML(card.label)}</span>
        <strong>${card.value.toLocaleString("zh-CN")}</strong>
        <small>${escapeHTML(card.note)}</small>
      </article>
    `).join("");
  }

  function renderTopicMatrix() {
    const sortedTopics = [...TOPICS].sort((left, right) => {
      if (state.mode === "all") {
        return getTopicStats(right).rate - getTopicStats(left).rate;
      }
      if (state.sort === "rate") {
        return Math.max(getTopicStats(right).aRate, getTopicStats(right).bRate) - Math.max(getTopicStats(left).aRate, getTopicStats(left).bRate);
      }
      return Math.abs(getDelta(right)) - Math.abs(getDelta(left));
    });

    if (state.mode === "all") {
      $("#topicLegend").innerHTML = `
        <span><b>一级特征</b></span><span class="legend-center">全部客户反馈占比</span><span>反馈客户数</span><span class="legend-sentiment">情感分布 <em class="positive"></em>正面 <em class="neutral"></em>中性 <em class="negative"></em>负面</span>
      `;
      $("#topicMatrix").innerHTML = sortedTopics.map((topic) => {
        const stats = getTopicStats(topic);
        const counts = getCounts(topic);
        return `
          <button type="button" class="topic-row is-all-mode${topic.name === state.topic ? " is-selected" : ""}" data-topic="${escapeHTML(topic.name)}" aria-pressed="${topic.name === state.topic}">
            <span class="topic-name-block"><span><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.description)}</small></span></span>
            <span class="overall-chart" aria-label="${escapeHTML(topic.name)}反馈客户占比 ${stats.rate}%"><span class="overall-track"><i style="width:${Math.min(100, stats.rate / 65 * 100)}%"></i></span><b>${stats.rate.toFixed(1)}%</b></span>
            <span class="overall-count"><b>${counts.total}</b>位反馈客户</span>
            <span class="sentiment-cell">${renderSentimentStack("全", stats.sentiment, true)}</span>
          </button>
        `;
      }).join("");
    } else {
      $("#topicLegend").innerHTML = `
        <span class="legend-a"><i></i><b id="legendA">${escapeHTML(modeMeta[state.mode].aLabel)}</b></span>
        <span class="legend-center">反馈客户占比</span>
        <span class="legend-b"><i></i><b id="legendB">${escapeHTML(modeMeta[state.mode].bLabel)}</b></span>
        <span class="legend-sentiment">情感分布 <em class="positive"></em>正面 <em class="neutral"></em>中性 <em class="negative"></em>负面</span>
      `;

      $("#topicMatrix").innerHTML = sortedTopics.map((topic) => {
        const stats = getTopicStats(topic);
        const delta = getDelta(topic);
        const counts = getCounts(topic);
        const deltaClass = delta > 0 ? "delta-a" : delta < 0 ? "delta-b" : "";
        const deltaText = delta > 0 ? `A +${delta.toFixed(1)}` : delta < 0 ? `B +${Math.abs(delta).toFixed(1)}` : "持平";
        const maxScale = 65;
        return `
          <button type="button" class="topic-row${topic.name === state.topic ? " is-selected" : ""}" data-topic="${escapeHTML(topic.name)}" aria-pressed="${topic.name === state.topic}">
            <span class="topic-name-block"><span><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.description)}</small></span><span class="${deltaClass}">${deltaText}pp</span></span>
            <span class="mirror-chart" aria-label="${escapeHTML(topic.name)}：A组 ${stats.aRate}%，B组 ${stats.bRate}%">
              <span class="mirror-half a"><span class="mirror-value">${stats.aRate.toFixed(1)}%</span><i class="mirror-bar" style="width:${Math.min(100, stats.aRate / maxScale * 100)}%"></i></span>
              <span class="mirror-center">0</span>
              <span class="mirror-half b"><i class="mirror-bar" style="width:${Math.min(100, stats.bRate / maxScale * 100)}%"></i><span class="mirror-value">${stats.bRate.toFixed(1)}%</span></span>
            </span>
            <span class="topic-counts"><span><b>${counts.a}</b>A组客户</span><span><b>${counts.b}</b>B组客户</span></span>
            <span class="sentiment-cell">${renderSentimentStack("A", stats.aSentiment)}${renderSentimentStack("B", stats.bSentiment)}</span>
          </button>
        `;
      }).join("");
    }

    $$("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        state.topic = button.dataset.topic;
        state.showAllVoices = false;
        renderAll();
      });
    });
  }

  function renderSentimentStack(label, values, showValues = false) {
    if (showValues) {
      return `
        <span class="sentiment-summary-chart" aria-label="正面 ${values[0]}%，中性 ${values[1]}%，负面 ${values[2]}%">
          <span class="sentiment-stack sentiment-stack-large">
            <i class="positive" style="width:${values[0]}%"></i><i class="neutral" style="width:${values[1]}%"></i><i class="negative" style="width:${values[2]}%"></i>
          </span>
          <span class="sentiment-values"><b class="positive">正 ${values[0]}%</b><b class="neutral">中 ${values[1]}%</b><b class="negative">负 ${values[2]}%</b></span>
        </span>
      `;
    }
    return `
      <span class="sentiment-row">
        <span>${label}</span>
        <span class="sentiment-stack" aria-label="正面 ${values[0]}%，中性 ${values[1]}%，负面 ${values[2]}%">
          <i class="positive" style="width:${values[0]}%"></i><i class="neutral" style="width:${values[1]}%"></i><i class="negative" style="width:${values[2]}%"></i>
        </span>
      </span>
    `;
  }

  function renderCallout() {
    const topic = getTopic();
    const stats = getTopicStats(topic);
    const meta = modeMeta[state.mode];
    if (state.mode === "all") {
      if (state.topic === "all") {
        const topTopic = [...TOPICS].sort((left, right) => getTopicStats(right).rate - getTopicStats(left).rate)[0];
        const topStats = getTopicStats(topTopic);
        $("#insightCallout").innerHTML = `
          <span class="callout-kicker" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 17h4l3-7 3 4 2-5 4-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m16 4 4 0 0 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>
          <span class="callout-copy"><span>当前筛选汇总 · 全部客户</span><strong>共 ${meta.sample[1]} 名反馈客户，反馈覆盖率 ${stats.rate.toFixed(1)}%；客户最关注“${escapeHTML(topTopic.name)}” ${topStats.rate.toFixed(1)}%，其中负面反馈占 ${topStats.sentiment[2]}%。</strong></span>
          <span class="callout-delta"><b>${stats.rate.toFixed(1)}%</b><span>反馈客户覆盖率</span></span>
        `;
      } else {
        const counts = getCounts(topic);
        $("#insightCallout").innerHTML = `
          <span class="callout-kicker" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 17h4l3-7 3 4 2-5 4-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m16 4 4 0 0 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>
          <span class="callout-copy"><span>当前特征解读 · ${escapeHTML(topic.name)}</span><strong>${counts.total} 名客户反馈“${escapeHTML(topic.name)}”，占全部反馈客户 ${stats.rate.toFixed(1)}%；正面 ${stats.sentiment[0]}%，中性 ${stats.sentiment[1]}%，负面 ${stats.sentiment[2]}%。</strong></span>
          <span class="callout-delta"><b>${stats.rate.toFixed(1)}%</b><span>整体反馈占比</span></span>
        `;
      }
      return;
    }
    const delta = getDelta(topic);
    if (state.topic === "all") {
      const aTop = [...TOPICS].sort((left, right) => getTopicStats(right).aRate - getTopicStats(left).aRate)[0];
      const bTop = [...TOPICS].sort((left, right) => getTopicStats(right).bRate - getTopicStats(left).bRate)[0];
      const maxDifference = [...TOPICS].sort((left, right) => Math.abs(getDelta(right)) - Math.abs(getDelta(left)))[0];
      const maxDelta = Math.abs(getDelta(maxDifference));
      const feedbackTotal = meta.sample[2] + meta.sample[3];
      $("#insightCallout").innerHTML = `
        <span class="callout-kicker" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 17h4l3-7 3 4 2-5 4-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m16 4 4 0 0 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </span>
        <span class="callout-copy"><span>当前筛选汇总 · 全部特征</span><strong>共 ${feedbackTotal} 名反馈客户；${escapeHTML(meta.aLabel)}最关注“${escapeHTML(aTop.name)}” ${getTopicStats(aTop).aRate.toFixed(1)}%，${escapeHTML(meta.bLabel)}最关注“${escapeHTML(bTop.name)}” ${getTopicStats(bTop).bRate.toFixed(1)}%；最大差异来自“${escapeHTML(maxDifference.name)}”。</strong></span>
        <span class="callout-delta"><b>${maxDelta.toFixed(1)}pp</b><span>最大特征差值</span></span>
      `;
      return;
    }
    const strongerGroup = delta >= 0 ? meta.aLabel : meta.bLabel;
    const higherNegative = stats.aSentiment[2] > stats.bSentiment[2] ? meta.aLabel : meta.bLabel;
    const negativeGap = Math.abs(stats.aSentiment[2] - stats.bSentiment[2]);
    $("#insightCallout").innerHTML = `
      <span class="callout-kicker" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 17h4l3-7 3 4 2-5 4-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m16 4 4 0 0 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </span>
      <span class="callout-copy"><span>当前差异解读 · ${escapeHTML(topic.name)}</span><strong>${escapeHTML(strongerGroup)}对“${escapeHTML(topic.name)}”的关注更集中；${escapeHTML(higherNegative)}负面反馈高 ${negativeGap.toFixed(0)} 个百分点，建议优先查看原声定位具体顾虑。</strong></span>
      <span class="callout-delta"><b>${Math.abs(delta).toFixed(1)}pp</b><span>两组关注差值</span></span>
    `;
  }

  function renderSubtopics() {
    const factors = [0.62, 0.48, 0.34, 0.23];
    const sourceRows = state.topic === "all"
      ? TOPICS.flatMap((topic) => topic.children.slice(0, 2).map((name, index) => ({ topic, name, index, factor: factors[index] })))
          .sort((left, right) => {
            const leftStats = getTopicStats(left.topic);
            const rightStats = getTopicStats(right.topic);
            const leftRate = state.mode === "all" ? leftStats.rate : Math.max(leftStats.aRate, leftStats.bRate);
            const rightRate = state.mode === "all" ? rightStats.rate : Math.max(rightStats.aRate, rightStats.bRate);
            return rightRate * right.factor - leftRate * left.factor;
          })
          .slice(0, 8)
      : getTopic().children.map((name, index) => ({ topic: getTopic(), name, index, factor: factors[index] || 0.2 }));

    const rows = sourceRows.map(({ topic, name, index, factor }) => {
      const stats = getTopicStats(topic);
      if (state.mode === "all") {
        const rate = Math.max(3.4, stats.rate * factor + (index % 2 ? -0.5 : 0.6));
        const sentiment = stats.sentiment.map((value, valueIndex) => Math.max(7, Math.min(78, value + (index - 1) * (valueIndex === 2 ? 3 : -2))));
        const total = sentiment.reduce((sum, value) => sum + value, 0);
        const normalized = sentiment.map((value) => Math.round(value / total * 100));
        normalized[1] = 100 - normalized[0] - normalized[2];
        const count = Math.round(getCounts(topic).total * factor);
        return `
          <div class="subtopic-row subtopic-row-all">
            <span><strong>${escapeHTML(name)}</strong><small>${state.topic === "all" ? `${escapeHTML(topic.name)} · ` : ""}${count} 位反馈客户</small></span>
            <span class="subtopic-rate-chart"><span class="overall-track"><i style="width:${Math.min(100, rate / 40 * 100)}%"></i></span><b>${rate.toFixed(1)}%</b></span>
            <span class="subtopic-sentiment-chart">${renderSentimentStack("", normalized, true)}</span>
            <span class="overall-count"><b>${count}</b>位反馈客户</span>
          </div>
        `;
      }
      const aRate = Math.max(3.4, stats.aRate * factor + (index % 2 ? -0.7 : 0.8));
      const bRate = Math.max(3.1, stats.bRate * factor + (index % 2 ? 0.9 : -0.4));
      const delta = aRate - bRate;
      const sentiment = stats.aSentiment.map((value, valueIndex) => Math.max(7, Math.min(78, value + (index - 1) * (valueIndex === 2 ? 3 : -2))));
      const total = sentiment.reduce((sum, value) => sum + value, 0);
      const normalized = sentiment.map((value) => Math.round(value / total * 100));
      normalized[1] = 100 - normalized[0] - normalized[2];
      return `
        <div class="subtopic-row">
          <span><strong>${escapeHTML(name)}</strong><small>${state.topic === "all" ? `${escapeHTML(topic.name)} · ` : ""}${Math.round((getCounts(topic).a + getCounts(topic).b) * factor)} 位反馈客户</small></span>
          <span class="subtopic-rate a">${aRate.toFixed(1)}%</span>
          <span class="subtopic-rate b">${bRate.toFixed(1)}%</span>
          <span class="sentiment-stack" title="正面 ${normalized[0]}%，中性 ${normalized[1]}%，负面 ${normalized[2]}%"><i class="positive" style="width:${normalized[0]}%"></i><i class="neutral" style="width:${normalized[1]}%"></i><i class="negative" style="width:${normalized[2]}%"></i></span>
          <span><i class="subtopic-delta ${delta > 0 ? "a" : "b"}">${delta > 0 ? "+" : ""}${delta.toFixed(1)}pp</i></span>
        </div>
      `;
    }).join("");

    $("#subtopicTable").innerHTML = state.mode === "all"
      ? `<div class="subtopic-head subtopic-head-all"><span>二级特征</span><span>反馈占比</span><span>情感分布</span><span>反馈客户数</span></div>${rows}`
      : `<div class="subtopic-head"><span>二级特征</span><span>A组占比</span><span>B组占比</span><span>情感分布</span><span>差值</span></div>${rows}`;
  }

  function getVoiceItems() {
    const orgs = ["华南大区 · 广州战区", "华东大区 · 上海战区", "华北大区 · 北京战区", "西南大区 · 成都战区", "华中大区 · 武汉战区", "西北大区 · 西安战区", "东北大区 · 沈阳战区"];
    const stages = ["试乘试驾", "邀约", "到店接待", "首触跟进"];
    const times = ["07-16 16:42", "07-15 11:08", "07-13 14:26", "07-11 09:37", "07-09 15:20", "07-08 10:16", "07-06 13:45"];

    if (state.topic === "all") {
      const aggregateVoices = TOPICS.map((topic, index) => {
        const voice = topic.voiceText[index % topic.voiceText.length];
        return {
          sentiment: voice[0],
          text: voice[1],
          feature: topic.name,
          group: state.mode === "all" ? "all" : (index % 2 === 0 ? "a" : "b"),
          org: orgs[index],
          stage: stages[index % stages.length],
          time: times[index]
        };
      });
      return state.showAllVoices ? aggregateVoices : aggregateVoices.slice(0, 4);
    }

    const topic = getTopic();
    const base = topic.voiceText.map((voice, index) => ({
      sentiment: voice[0],
      text: voice[1],
      feature: topic.name,
      group: state.mode === "all" ? "all" : (index % 2 === 0 ? "a" : "b"),
      org: orgs[index],
      stage: stages[index],
      time: times[index]
    }));

    if (!state.showAllVoices) return base;
    return base.concat([
      { sentiment: "neutral", text: `我还想再比较一下同价位的车型，主要关注<strong>${escapeHTML(topic.children[0])}</strong>实际体验差多少。`, feature: topic.name, group: state.mode === "all" ? "all" : "a", org: orgs[4], stage: "到店接待", time: times[4] },
      { sentiment: "negative", text: "这个点销售讲得比较笼统，如果能给我看真实车主的数据，我会更容易判断。", feature: topic.name, group: state.mode === "all" ? "all" : "b", org: orgs[5], stage: "邀约", time: times[5] }
    ]);
  }

  function renderVoices() {
    const meta = modeMeta[state.mode];
    const getVoiceGroupLabel = (voice) => voice.group === "all"
      ? meta.label
      : `${voice.group === "a" ? "A" : "B"} · ${voice.group === "a" ? meta.aLabel : meta.bLabel}`;
    const voiceItems = getVoiceItems().filter((voice) => state.sentiment === "all" || voice.sentiment === state.sentiment);
    const voiceList = $("#voiceList");
    if (!voiceItems.length) {
      voiceList.innerHTML = `<div class="empty-voice">当前主题暂无${escapeHTML(SENTIMENT_LABELS[state.sentiment] || "")}原声<br />可切换其他情感查看</div>`;
    } else {
      voiceList.innerHTML = voiceItems.map((voice) => `
        <article class="voice-item ${voice.sentiment}">
          <p class="voice-quote">“${voice.text}”</p>
          <div class="voice-meta">
            <span class="voice-group ${voice.group}">${escapeHTML(getVoiceGroupLabel(voice))}</span>
            <span class="sentiment-tag ${voice.sentiment}">${escapeHTML(SENTIMENT_LABELS[voice.sentiment])}</span>
            <span>${escapeHTML(voice.feature)}特征</span><span>·</span>
            <span>${escapeHTML(voice.org)}</span><span>·</span><span>${escapeHTML(voice.stage)}</span><span>·</span><time>${escapeHTML(voice.time)}</time>
          </div>
        </article>
      `).join("");
    }
    $("#viewAllVoices").innerHTML = state.showAllVoices
      ? "收起典型客户原声 <span>↑</span>"
      : `${state.topic === "all" ? "查看全部典型原声" : "查看该特征全部原声"} <span>→</span>`;
  }

  function buildTrendSeries(base, topicIndex, sentimentIndex, groupOffset) {
    const patterns = [
      [-3, -1, 1, 0, 2, 4],
      [2, 0, -1, 1, 0, -2],
      [1, 3, 2, 4, 2, 1]
    ];
    return patterns[sentimentIndex].map((change, index) => Math.max(5, Math.min(78, base + change + ((topicIndex + index + groupOffset) % 3 - 1))));
  }

  function renderTrend() {
    const topic = getTopic();
    const topicIndex = state.topic === "all" ? 0 : TOPICS.indexOf(topic);
    const stats = getTopicStats(topic);
    const periodLabels = {
      day: ["07-11", "07-12", "07-13", "07-14", "07-15", "07-16"],
      week: ["第23周", "第24周", "第25周", "第26周", "第27周", "第28周"],
      month: ["2月", "3月", "4月", "5月", "6月", "7月"]
    }[state.grain];
    const sentimentNames = ["正面客户占比", "中性客户占比", "负面客户占比"];
    const sentimentClasses = ["positive", "neutral", "negative"];

    $("#trendCharts").innerHTML = sentimentNames.map((name, sentimentIndex) => {
      if (state.mode === "all") {
        const series = buildTrendSeries(stats.sentiment[sentimentIndex], topicIndex, sentimentIndex, 0);
        return `
          <article class="trend-card ${sentimentClasses[sentimentIndex]}">
            <div class="trend-card-head"><strong>${name}</strong><span>整体 ${series.at(-1)}%</span></div>
            ${renderLineChart(series, null, periodLabels)}
            <div class="trend-legend"><span><i class="all"></i>全部客户</span></div>
          </article>
        `;
      }
      const aSeries = buildTrendSeries(stats.aSentiment[sentimentIndex], topicIndex, sentimentIndex, 0);
      const bSeries = buildTrendSeries(stats.bSentiment[sentimentIndex], topicIndex, sentimentIndex, 1);
      return `
        <article class="trend-card ${sentimentClasses[sentimentIndex]}">
          <div class="trend-card-head"><strong>${name}</strong><span>A ${aSeries.at(-1)}% / B ${bSeries.at(-1)}%</span></div>
          ${renderLineChart(aSeries, bSeries, periodLabels)}
          <div class="trend-legend"><span><i class="a"></i>A组</span><span><i class="b"></i>B组</span></div>
        </article>
      `;
    }).join("");
  }

  function renderLineChart(aSeries, bSeries, labels) {
    const isComparison = Array.isArray(bSeries);
    const width = 300;
    const height = 105;
    const padX = 14;
    const top = 8;
    const bottom = 20;
    const values = isComparison ? aSeries.concat(bSeries) : aSeries;
    const min = Math.max(0, Math.floor((Math.min(...values) - 6) / 10) * 10);
    const max = Math.min(100, Math.ceil((Math.max(...values) + 6) / 10) * 10);
    const range = Math.max(10, max - min);
    const toPoint = (value, index) => {
      const x = padX + index * ((width - padX * 2) / (aSeries.length - 1));
      const y = top + (max - value) / range * (height - top - bottom);
      return [x, y];
    };
    const aPoints = aSeries.map(toPoint);
    const bPoints = isComparison ? bSeries.map(toPoint) : [];
    const grid = [0, 0.5, 1].map((ratio) => {
      const y = top + ratio * (height - top - bottom);
      return `<line class="trend-grid-line" x1="${padX}" x2="${width - padX}" y1="${y}" y2="${y}" />`;
    }).join("");
    const labelMarkup = labels.map((label, index) => `<text class="trend-axis-label" x="${toPoint(min, index)[0]}" y="${height - 3}" text-anchor="middle">${escapeHTML(label)}</text>`).join("");
    const dots = (points, className) => points.map(([x, y]) => `<circle class="${className}" cx="${x}" cy="${y}" r="2.5" />`).join("");
    const valueLabels = (points, series, className, offset) => points.map(([x, y], index) => {
      const labelY = Math.max(8, Math.min(height - bottom - 2, y + offset));
      return `<text class="trend-value-label ${className}" x="${x}" y="${labelY}" text-anchor="middle">${series[index]}%</text>`;
    }).join("");
    return `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${isComparison ? "A组和B组" : "全部客户"}趋势折线图">
        ${grid}
        <polyline class="${isComparison ? "trend-line-a" : "trend-line-all"}" points="${aPoints.map((point) => point.join(",")).join(" ")}" />
        ${isComparison ? `<polyline class="trend-line-b" points="${bPoints.map((point) => point.join(",")).join(" ")}" />` : ""}
        ${dots(aPoints, isComparison ? "trend-dot-a" : "trend-dot-all")}${isComparison ? dots(bPoints, "trend-dot-b") : ""}
        ${valueLabels(aPoints, aSeries, isComparison ? "a" : "all", -7)}${isComparison ? valueLabels(bPoints, bSeries, "b", 10) : ""}${labelMarkup}
      </svg>
    `;
  }

  function renderOrganizations() {
    const topic = getTopic();
    const stats = getTopicStats(topic);
    const meta = modeMeta[state.mode];
    const organizations = [
      ["华南大区", 184, 1.14, 1.09, 6],
      ["华东大区", 171, 0.97, 1.08, 3],
      ["华北大区", 146, 1.03, 0.91, -2],
      ["华中大区", 118, 0.88, 0.96, -4],
      ["西南大区", 104, 1.07, 1.16, 5]
    ];

    if (state.mode === "all") {
      $("#organizationHead").innerHTML = "<tr><th>组织</th><th>样本客户数</th><th>反馈客户占比</th><th>负面客户占比</th><th>较厂端均值</th></tr>";
      $("#organizationBody").innerHTML = organizations.map(([name, sample, aFactor, bFactor, variance], index) => {
        const factor = (aFactor + bFactor) / 2;
        const rate = Math.min(96, stats.rate * factor);
        const negative = Math.min(66, stats.sentiment[2] + index * 1.6 - 3);
        return `
          <tr>
            <td>${escapeHTML(name)}</td><td>${sample}</td>
            <td><span class="rate-cell a"><b>${rate.toFixed(1)}%</b><span class="rate-track"><i style="width:${rate}%"></i></span></span></td>
            <td>${negative.toFixed(1)}%</td>
            <td><span class="variance ${variance >= 0 ? "up" : "down"}">${variance >= 0 ? "+" : ""}${variance.toFixed(1)}pp</span></td>
          </tr>
        `;
      }).join("");
      return;
    }

    $("#organizationHead").innerHTML = '<tr><th>组织</th><th>样本客户数</th><th><span class="cohort-dot a"></span><span id="orgHeaderA">A组</span>反馈占比</th><th><span class="cohort-dot b"></span><span id="orgHeaderB">B组</span>反馈占比</th><th>负面客户占比</th><th>较厂端均值</th></tr>';
    $("#orgHeaderA").textContent = `${meta.aLabel} `;
    $("#orgHeaderB").textContent = `${meta.bLabel} `;
    $("#organizationBody").innerHTML = organizations.map(([name, sample, aFactor, bFactor, variance], index) => {
      const aRate = Math.min(96, stats.aRate * aFactor);
      const bRate = Math.min(96, stats.bRate * bFactor);
      const negative = Math.min(66, (stats.aSentiment[2] + stats.bSentiment[2]) / 2 + index * 1.8 - 2);
      return `
        <tr>
          <td>${escapeHTML(name)}</td>
          <td>${sample}</td>
          <td><span class="rate-cell a"><b>${aRate.toFixed(1)}%</b><span class="rate-track"><i style="width:${aRate}%"></i></span></span></td>
          <td><span class="rate-cell b"><b>${bRate.toFixed(1)}%</b><span class="rate-track"><i style="width:${bRate}%"></i></span></span></td>
          <td>${negative.toFixed(1)}%</td>
          <td><span class="variance ${variance >= 0 ? "up" : "down"}">${variance >= 0 ? "+" : ""}${variance.toFixed(1)}pp</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderModeLabels() {
    const isAggregate = state.topic === "all";
    $$(".selected-topic-label").forEach((label) => {
      label.textContent = isAggregate ? "全部汇总" : `${state.topic} · 返回全部`;
      label.disabled = isAggregate;
      label.setAttribute("aria-label", isAggregate ? "当前为全部汇总" : `当前查看${state.topic}，点击返回全部汇总`);
    });
    const deltaSortButton = $('[data-sort="delta"]');
    const rateSortButton = $('[data-sort="rate"]');
    deltaSortButton.hidden = state.mode === "all";
    deltaSortButton.classList.toggle("is-active", state.mode !== "all" && state.sort === "delta");
    rateSortButton.classList.toggle("is-active", state.mode === "all" || state.sort === "rate");
    $("#allSetup").hidden = state.mode !== "all";
    $("#visitSetup").hidden = state.mode !== "visit";
    $("#leadSetup").hidden = state.mode !== "lead";
  }

  function resetToAggregate() {
    state.topic = "all";
    state.showAllVoices = false;
  }

  function renderAll() {
    renderModeLabels();
    renderSampleOverview();
    renderCallout();
    renderTopicMatrix();
    renderSubtopics();
    renderVoices();
    renderTrend();
    renderOrganizations();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function exportCurrentView() {
    const meta = modeMeta[state.mode];
    const rows = state.mode === "all"
      ? [["特征", "反馈客户占比", "反馈客户数", "正面占比", "中性占比", "负面占比"]]
      : [["特征", `${meta.aLabel}反馈占比`, `${meta.bLabel}反馈占比`, "差值（百分点）"]];
    TOPICS.forEach((topic) => {
      const stats = getTopicStats(topic);
      if (state.mode === "all") {
        rows.push([topic.name, `${stats.rate}%`, getCounts(topic).total, `${stats.sentiment[0]}%`, `${stats.sentiment[1]}%`, `${stats.sentiment[2]}%`]);
      } else {
        rows.push([topic.name, `${stats.aRate}%`, `${stats.bRate}%`, getDelta(topic)]);
      }
    });
    const csv = `\ufeff${rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `AION-V-客户洞察-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(state.mode === "all" ? "已导出全部客户汇总数据" : "已导出当前特征对比数据");
  }

  function bindEvents() {
    $$("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode;
        state.sort = state.mode === "all" ? "rate" : "delta";
        resetToAggregate();
        $$("[data-mode]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderAll();
      });
    });

    $$("[data-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        state.sort = button.dataset.sort;
        $$("[data-sort]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderTopicMatrix();
      });
    });

    $$("[data-sentiment]").forEach((button) => {
      button.addEventListener("click", () => {
        state.sentiment = button.dataset.sentiment;
        $$("[data-sentiment]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderVoices();
      });
    });

    $$("[data-grain]").forEach((button) => {
      button.addEventListener("click", () => {
        state.grain = button.dataset.grain;
        $$("[data-grain]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderTrend();
      });
    });

    $$("[data-date]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-date]").forEach((item) => item.classList.toggle("is-active", item === button));
        $(".date-value").textContent = button.dataset.date === "90" ? "2026-04-18 — 2026-07-16" : "2026-06-17 — 2026-07-16";
        resetToAggregate();
        renderAll();
        showToast(`已切换为近${button.dataset.date}天数据`);
      });
    });

    $$(".status-options button").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest(".status-options");
        const selected = $$("button.is-selected", group);
        if (button.classList.contains("is-selected") && selected.length === 1) {
          showToast("每个对比组至少保留一个线索状态");
          return;
        }
        button.classList.toggle("is-selected");
        resetToAggregate();
        renderAll();
        showToast("线索状态已更新，重叠客户将自动排除");
      });
    });

    $$("[data-topic-reset]").forEach((button) => {
      button.addEventListener("click", () => {
        if (state.topic === "all") return;
        resetToAggregate();
        renderAll();
      });
    });

    $("#viewAllVoices").addEventListener("click", () => {
      state.showAllVoices = !state.showAllVoices;
      renderVoices();
    });

    $("#exportButton").addEventListener("click", exportCurrentView);

    $("#resetFilters").addEventListener("click", () => {
      state.mode = "all";
      state.topic = "all";
      state.sort = "rate";
      state.sentiment = "all";
      state.grain = "week";
      state.showAllVoices = false;
      $("#orgFilter").selectedIndex = 0;
      $("#brandFilter").selectedIndex = 0;
      $("#modelFilter").selectedIndex = 0;
      $("#observationFilter").selectedIndex = 0;
      $$("[data-mode]").forEach((item) => {
        const active = item.dataset.mode === "all";
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      $$("[data-sort]").forEach((item) => item.classList.toggle("is-active", item.dataset.sort === "rate"));
      $$("[data-sentiment]").forEach((item) => item.classList.toggle("is-active", item.dataset.sentiment === "all"));
      $$("[data-grain]").forEach((item) => item.classList.toggle("is-active", item.dataset.grain === "week"));
      $$("[data-date]").forEach((item) => item.classList.toggle("is-active", item.dataset.date === "30"));
      $(".date-value").textContent = "2026-06-17 — 2026-07-16";
      renderAll();
      showToast("已恢复默认分析范围");
    });

    $$(".filter-field select, .observation-field select, .compact-select select").forEach((select) => {
      select.addEventListener("change", () => {
        resetToAggregate();
        renderAll();
        showToast(`${select.closest("label")?.querySelector("span")?.textContent || "筛选条件"}已更新，已刷新全部汇总`);
      });
    });
  }

  bindEvents();
  renderAll();
})();
