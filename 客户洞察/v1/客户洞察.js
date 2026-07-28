(function () {
  const PRODUCT_TOPICS = [
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

  const POLICY_TOPICS = [
    {
      name: "价格",
      description: "裸车价、落地价与价格透明度",
      visit: { aRate: 41.6, bRate: 58.7, aSentiment: [18, 42, 40], bSentiment: [8, 31, 61] },
      lead: { aRate: 37.8, bRate: 63.4, aSentiment: [22, 43, 35], bSentiment: [7, 28, 65] },
      children: ["裸车价格", "落地总价", "价格透明度", "同城价差"],
      voiceText: [
        ["negative", "车本身我挺满意，但算完落地还是超预算，<strong>价格再有一点空间我就能定</strong>。"],
        ["neutral", "这个报价包含哪些费用？我想先确认<strong>最终落地价</strong>，不想到后面又多出项目。"],
        ["positive", "销售把裸车、保险和上牌都列得很清楚，这个落地价在我的预算里。"],
        ["negative", "我朋友在另一家店问到的价格更低，如果同城差这么多，我还要再比较一下。"]
      ]
    },
    {
      name: "优惠",
      description: "现金优惠、限时活动与政策稳定性",
      visit: { aRate: 38.2, bRate: 52.9, aSentiment: [24, 43, 33], bSentiment: [11, 34, 55] },
      lead: { aRate: 34.7, bRate: 57.6, aSentiment: [27, 42, 31], bSentiment: [9, 31, 60] },
      children: ["现金优惠", "限时活动", "区域补贴", "优惠有效期"],
      voiceText: [
        ["negative", "现在优惠和上个月差不多，我本来以为车展期间<strong>还能再便宜一些</strong>。"],
        ["neutral", "这个限时优惠到哪天？如果我周末再来，政策会不会变？"],
        ["positive", "厂家补贴加门店优惠后已经接近我的心理价位，可以和家里商量定下来。"],
        ["negative", "别的品牌同价位优惠力度更大，这边如果一点都不能谈，我会优先看别家。"]
      ]
    },
    {
      name: "置换",
      description: "旧车估值、置换补贴与办理效率",
      visit: { aRate: 27.4, bRate: 36.8, aSentiment: [31, 39, 30], bSentiment: [17, 38, 45] },
      lead: { aRate: 25.1, bRate: 41.2, aSentiment: [34, 38, 28], bSentiment: [14, 35, 51] },
      children: ["旧车估值", "置换补贴", "品牌增换购", "过户办理"],
      voiceText: [
        ["negative", "旧车评估比二手平台低了一万多，补贴加回来还是不划算。"],
        ["neutral", "置换补贴是厂家直接抵扣，还是过户以后再返？大概要多久？"],
        ["positive", "旧车和新车手续能一起办，不用我来回跑，这个置换方案比较省心。"],
        ["negative", "我主要卡在旧车估值，如果能再接近市场价一点，新车这边没什么问题。"]
      ]
    },
    {
      name: "贷款",
      description: "首付、月供、利率与提前还款",
      visit: { aRate: 30.6, bRate: 39.7, aSentiment: [28, 47, 25], bSentiment: [15, 39, 46] },
      lead: { aRate: 28.9, bRate: 44.8, aSentiment: [31, 45, 24], bSentiment: [12, 36, 52] },
      children: ["贷款利率", "首付比例", "月供压力", "提前还款"],
      voiceText: [
        ["neutral", "首付三成的话每个月还多少？我想把<strong>利息和手续费一起算清楚</strong>。"],
        ["negative", "月供能接受，但加上金融服务费以后总成本比我预想的高。"],
        ["positive", "两年免息比较适合我，首付也不用一次拿太多。"],
        ["negative", "提前还款还要收违约金，这一点我不能接受，可能考虑全款或别的品牌。"]
      ]
    },
    {
      name: "保险",
      description: "首年保费、险种组合与续保要求",
      visit: { aRate: 18.7, bRate: 25.3, aSentiment: [20, 48, 32], bSentiment: [12, 42, 46] },
      lead: { aRate: 17.2, bRate: 28.6, aSentiment: [23, 46, 31], bSentiment: [10, 39, 51] },
      children: ["首年保费", "险种组合", "店内投保", "续保约束"],
      voiceText: [
        ["negative", "店里的保险报价比我自己问的高不少，如果必须店保，落地就不划算了。"],
        ["neutral", "首年一定要在店里买吗？第二年续保还有没有限制？"],
        ["positive", "险种列得比较清楚，价格差不多的话在店里一起办也方便。"],
        ["negative", "有些险种我不需要，希望不要打包销售。"]
      ]
    },
    {
      name: "权益",
      description: "充电、保养、质保与会员权益",
      visit: { aRate: 22.9, bRate: 20.8, aSentiment: [49, 39, 12], bSentiment: [36, 43, 21] },
      lead: { aRate: 25.7, bRate: 19.3, aSentiment: [54, 35, 11], bSentiment: [33, 43, 24] },
      children: ["充电权益", "免费保养", "三电质保", "会员权益"],
      voiceText: [
        ["positive", "送的充电额度够我用一段时间，算下来前两年的用车成本会低不少。"],
        ["neutral", "终身质保需要满足哪些条件？以后不在这家店保养会不会受影响？"],
        ["positive", "保养和道路救援都包含了，对第一次买电车的人挺实用。"],
        ["negative", "这些权益看起来很多，但我真正能用到的不多，不如直接折成车价。"]
      ]
    },
    {
      name: "赠品",
      description: "实物赠品、装潢礼包与交付承诺",
      visit: { aRate: 15.8, bRate: 19.6, aSentiment: [37, 43, 20], bSentiment: [25, 42, 33] },
      lead: { aRate: 16.9, bRate: 22.4, aSentiment: [41, 41, 18], bSentiment: [22, 41, 37] },
      children: ["充电桩", "车膜脚垫", "装潢礼包", "赠品兑现"],
      voiceText: [
        ["positive", "充电桩和安装都送的话，提车后能少操一件事。"],
        ["neutral", "赠品能不能写进合同？我主要担心提车时型号和现在说的不一样。"],
        ["negative", "礼包标价很高，但都是我不需要的东西，还不如换成现金优惠。"],
        ["negative", "之前答应送的车膜临时说没货，这会让我觉得政策不够透明。"]
      ]
    }
  ];

  const DECISION_TOPICS = [
    ...PRODUCT_TOPICS.map((topic) => ({ ...topic, domain: "product", domainLabel: "产品因素" })),
    ...POLICY_TOPICS.map((topic) => ({ ...topic, domain: "policy", domainLabel: "政策因素" }))
  ];

  const COMPETITION_TOPICS = [
    {
      name: "宋PLUS DM-i",
      description: "价格与油电兼容占优 · 智能与空间被比较",
      visit: { aRate: 32.7, bRate: 44.9, aSentiment: [45, 36, 19], bSentiment: [55, 29, 16] },
      lead: { aRate: 29.6, bRate: 49.8, aSentiment: [42, 38, 20], bSentiment: [59, 27, 14] },
      children: ["价格更低", "可油可电", "空间对比", "智能座舱差异"],
      voiceText: [
        ["positive", "宋PLUS价格更低，而且没电还能加油，长途出行我会更放心。"],
        ["neutral", "我主要在这两款之间选，想再比较一下<strong>后排空间和实际能耗</strong>。"],
        ["negative", "宋PLUS的车机我觉得一般，这款的语音和屏幕反应更快。"],
        ["positive", "比亚迪的网点多、保有量大，后期维修可能更方便。"]
      ]
    },
    {
      name: "零跑 C11",
      description: "配置与空间有吸引力 · 品牌与保值率存顾虑",
      visit: { aRate: 27.1, bRate: 35.6, aSentiment: [42, 35, 23], bSentiment: [50, 31, 19] },
      lead: { aRate: 24.8, bRate: 39.2, aSentiment: [38, 38, 24], bSentiment: [53, 29, 18] },
      children: ["配置更高", "空间更大", "品牌信任", "保值率顾虑"],
      voiceText: [
        ["positive", "零跑同价位配置确实很满，座椅和辅助驾驶基本都给了。"],
        ["neutral", "两台车空间都够用，我还要看看长期质量和售后网点。"],
        ["negative", "我对零跑的品牌稳定性还有点担心，这款让我更放心一些。"],
        ["positive", "C11后排和后备箱都更大，家里人会更喜欢。"]
      ]
    },
    {
      name: "深蓝 S07",
      description: "外观与增程方案受关注 · 舒适和做工有分歧",
      visit: { aRate: 23.4, bRate: 29.8, aSentiment: [46, 37, 17], bSentiment: [51, 32, 17] },
      lead: { aRate: 21.7, bRate: 33.5, aSentiment: [43, 38, 19], bSentiment: [54, 30, 16] },
      children: ["外观设计", "增程方案", "底盘舒适", "内饰做工"],
      voiceText: [
        ["positive", "深蓝的外观更运动，第一眼确实更吸引我。"],
        ["neutral", "纯电和增程我还没想好，要结合平时长途频率再选。"],
        ["negative", "深蓝后排过减速带偏硬，这款坐起来更舒服。"],
        ["positive", "增程没有里程焦虑，这是我考虑深蓝的主要原因。"]
      ]
    },
    {
      name: "大众 ID.4 CROZZ",
      description: "合资品牌与底盘认可度高 · 车机体验偏弱",
      visit: { aRate: 18.6, bRate: 21.9, aSentiment: [39, 41, 20], bSentiment: [43, 37, 20] },
      lead: { aRate: 17.9, bRate: 24.2, aSentiment: [37, 42, 21], bSentiment: [46, 35, 19] },
      children: ["品牌信任", "底盘质感", "车机体验", "优惠幅度"],
      voiceText: [
        ["positive", "大众的底盘开起来更像传统油车，家里人对品牌也熟悉。"],
        ["negative", "ID.4的车机和语音不太顺手，这款在智能体验上明显更好。"],
        ["neutral", "大众现在优惠很大，我想算一下两台车最终落地差多少。"],
        ["positive", "合资品牌让我觉得后期转手会稳一点。"]
      ]
    },
    {
      name: "银河 E5",
      description: "价格与座舱体验突出 · 续航和空间重点比较",
      visit: { aRate: 16.9, bRate: 24.7, aSentiment: [44, 38, 18], bSentiment: [52, 31, 17] },
      lead: { aRate: 15.8, bRate: 27.6, aSentiment: [41, 40, 19], bSentiment: [56, 29, 15] },
      children: ["价格优势", "车机流畅", "续航对比", "后排空间"],
      voiceText: [
        ["positive", "银河E5的价格更有吸引力，车机用起来也很流畅。"],
        ["neutral", "我想知道两台车冬季续航差多少，参数看着都差不多。"],
        ["negative", "E5后排坐三个人有点挤，这款横向空间更好。"],
        ["positive", "如果预算卡得紧，银河E5确实更容易接受。"]
      ]
    }
  ];

  // 画像摘要只使用当前产品实际可以生成的 13 个固定维度。
  // 没有可用标签时保留维度卡片，并明确显示“暂无数据”，不虚构画像结论。
  const PROFILE_GROUPS = [
    { tone: "risk", title: "抗性点", description: "客户明确表达的顾虑", tags: [["价格敏感", 34.8], ["续航焦虑", 28.6]] },
    { tone: "drive", title: "用车人", description: "车辆主要使用人", tags: [["自己用车", 32.7]] },
    { tone: "plan", title: "付款方式", description: "客户计划采用的付款方式", tags: [["贷款购车", 34.2]] },
    { tone: "neutral", title: "客户职业", description: "客户职业信息", tags: [] },
    { tone: "neutral", title: "意向颜色", description: "客户偏好的车身颜色", tags: [] },
    { tone: "plan", title: "是否置换", description: "是否计划置换现有车辆", tags: [] },
    { tone: "drive", title: "是否试驾", description: "是否已经完成试驾", tags: [] },
    { tone: "neutral", title: "渠道来源", description: "客户线索来源渠道", tags: [] },
    { tone: "neutral", title: "现开车型", description: "客户当前正在使用的车型", tags: [] },
    { tone: "plan", title: "购车时间", description: "客户计划购车的时间", tags: [["1个月内", 31.7]] },
    { tone: "drive", title: "购车用途", description: "客户购车后的主要用途", tags: [["家庭出行", 41.2]] },
    { tone: "plan", title: "购车预算", description: "客户可接受的购车预算", tags: [["15-20万", 38.4]] },
    { tone: "risk", title: "是否进行价格博弈", description: "是否明确提出议价或比价", tags: [] }
  ];

  const PROFILE_INTENT_LEVELS = [
    { label: "高意向", customers: 188 },
    { label: "中意向", customers: 216 },
    { label: "低意向", customers: 164 },
    { label: "无意向", customers: 116 }
  ];

  const PROFILE_HEATMAP_ROWS = [
    { category: "购车用途", name: "家庭出行", values: [53, 45, 32, 18] },
    { category: "购车预算", name: "15-20万", values: [39, 44, 40, 35] },
    { category: "购车时间", name: "1个月内", values: [61, 43, 22, 9] },
    { category: "付款方式", name: "贷款购车", values: [35, 41, 38, 29] },
    { category: "抗性点", name: "价格敏感", values: [24, 38, 51, 62] },
    { category: "抗性点", name: "续航焦虑", values: [19, 31, 45, 56] },
    { category: "是否试驾", name: "已试驾", values: [42, 36, 28, 16] },
    { category: "是否置换", name: "计划置换", values: [27, 32, 29, 18] }
  ];

  const AI_CUSTOMERS = [
    {
      name: "客户 138****6621",
      status: "高意向 · 已邀约到店",
      priority: "优先跟进",
      summary: "主要用于家庭出行，计划一个月内购车，认可空间与智能座舱，但对高速续航和贷款总成本仍有明显顾虑。",
      tags: ["家庭出行", "15-20万预算", "贷款购车", "1个月内", "已试驾"],
      attraction: "二排空间、智能座舱和底盘舒适性是主要吸引点，试驾后认可度进一步提升。",
      resistance: "担心高速真实续航，同时认为金融服务费使贷款总成本高于预期。",
      competitor: "正在比较宋PLUS DM-i，主要看重可油可电和更低的落地价格。",
      action: "建议下一次跟进提供高速实测续航数据，并用同首付口径对比两年免息方案与竞品总成本。",
      evidence: ["07-15 到店接待：高速实际能跑多少是我最关心的。", "07-12 邀约：如果贷款总成本能再低一点，这周就可以决定。"]
    },
    {
      name: "客户 186****0934",
      status: "中意向 · 跟进中",
      priority: "持续培育",
      summary: "日常通勤为主，重视充电便利和月供压力，目前产品认可度尚可，但还没有形成明确的购买时间。",
      tags: ["日常通勤", "贷款购车", "价格敏感", "未试驾", "跟进中"],
      attraction: "认可智能驾驶和车机体验，对日常通勤的使用成本评价积极。",
      resistance: "小区暂时不能安装家充，且对首付和月供方案了解不足。",
      competitor: "同时关注银河E5，认为其价格更容易接受。",
      action: "优先邀约充电场景体验，并提供不同首付比例下的月供测算，暂不使用限时催单话术。",
      evidence: ["07-14 电话跟进：小区装不了家充，外面充电会不会很麻烦？", "07-10 首次沟通：我还想看看银河E5，预算会轻松一点。"]
    },
    {
      name: "客户 159****7810",
      status: "低意向 · 邀约未到店",
      priority: "识别真实需求",
      summary: "购车时间不明确，对品牌和保值率关注较高，当前更多处于多车型信息收集阶段。",
      tags: ["购车时间不明确", "品牌关注", "未试驾", "多车比较", "价格博弈"],
      attraction: "对外观和空间有初步好感，但尚未形成足以推动到店的核心吸引点。",
      resistance: "认为当前优惠缺少明显优势，同时担心纯电车型长期保值率。",
      competitor: "比较大众ID.4 CROZZ和零跑C11，分别看重品牌信任与配置水平。",
      action: "先确认真实购车时间与用车场景，再提供针对性对比材料；不建议直接进入价格谈判。",
      evidence: ["07-13 邀约：我现在就是多看几款，还没决定什么时候买。", "07-09 首次沟通：大众品牌更熟，零跑配置也挺高。"]
    }
  ];

  const INSIGHT_CONFIG = {
    profile: {
      label: "客群画像",
      sampleExpression: "至少命中 1 个有效画像标签"
    },
    decision: {
      topics: DECISION_TOPICS,
      label: "决策归因",
      topicTitle: "TOP决策因素",
      topicScope: "产品与政策因素",
      topicDescription: "识别推动或阻碍客户决策的产品与政策因素；点击因素后查看具体原因和客户证据",
      detailTitle: "具体归因明细",
      detailLabel: "具体原因",
      detailDescription: "默认汇总各类产品与政策因素下最常出现的吸引点和抗性点",
      aggregateDescription: "当前筛选条件下的全部产品与政策决策因素",
      sampleExpression: "有效决策表达",
      itemLabel: "决策因素",
      trendDescription: "展示客户对产品与政策因素的态度变化，负面上升通常意味着决策阻力增加",
      organizationDescription: "比较各组织的决策因素与负面占比，定位产品认知和政策执行差异"
    },
    competition: {
      topics: COMPETITION_TOPICS,
      label: "竞品洞察",
      topicTitle: "TOP竞品对比排行",
      topicScope: "竞品车型",
      topicDescription: "展示客户最常拿来比较的竞品、对比客户占比及对竞品的情感差异",
      detailTitle: "竞品评价关键词",
      detailLabel: "评价关键词",
      detailDescription: "默认汇总各竞品最常被提及的优势、劣势与对比点",
      aggregateDescription: "当前筛选条件下的全部竞品比较反馈",
      sampleExpression: "有效竞品比较表达",
      itemLabel: "竞品",
      trendDescription: "展示客户对竞品的正、中、负面情感趋势，支持下钻单一竞品",
      organizationDescription: "比较各组织的竞品提及率与负面占比，定位区域竞争差异"
    }
  };

  const SAMPLE_BY_INSIGHT = {
    profile: { all: [799, 684], visit: [426, 373, 382, 302] },
    decision: { all: [799, 704], visit: [426, 373, 382, 322], lead: [326, 441, 294, 386, 23] },
    competition: { all: [799, 306], visit: [426, 373, 151, 155], lead: [326, 441, 106, 200, 23] }
  };

  const LEAD_STATUS_META = {
    "已下订": { customers: 142, score: 1 },
    "异地成交": { customers: 64, score: 0.9 },
    "跟进中": { customers: 278, score: 0.58 },
    "有效": { customers: 190, score: 0.46 },
    "战败申请中": { customers: 95, score: 0.22 },
    "战败": { customers: 215, score: 0.1 },
    "无效": { customers: 128, score: 0 }
  };

  const SENTIMENT_LABELS = {
    positive: "正面",
    neutral: "中性",
    negative: "负面"
  };

  const DECISION_SENTIMENT_LABELS = {
    positive: "吸引",
    neutral: "待判断",
    negative: "抗性"
  };

  const COMPETITION_SENTIMENT_LABELS = {
    positive: "竞品占优",
    neutral: "待判断",
    negative: "本品占优"
  };

  const state = {
    insight: "profile",
    mode: "all",
    draftMode: "visit",
    leadStatuses: { a: [], b: [] },
    draftLeadStatuses: { a: [], b: [] },
    observationPeriod: "7",
    draftObservationPeriod: "7",
    topic: "all",
    sort: "rate",
    sentiment: "all",
    grain: "week",
    showAllVoices: false,
    profileAiGenerated: false
  };

  const modeMeta = {
    all: {
      label: "全部客户"
    },
    visit: {
      aLabel: "邀约到店",
      bLabel: "邀约未到店",
      aSampleLabel: "邀约到店客户",
      bSampleLabel: "邀约未到店客户"
    },
    lead: {
      aLabel: "对比组 A",
      bLabel: "对比组 B"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const AI_ROBOT_ICON = '<svg viewBox="0 0 24 24"><path d="M8 3v3m8-3v3M6 9h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm2 4h.01M16 13h.01M9 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const getInsightConfig = () => INSIGHT_CONFIG[state.insight];
  const getTopics = () => getInsightConfig().topics;
  const getSentimentLabels = () => state.insight === "decision"
    ? DECISION_SENTIMENT_LABELS
    : state.insight === "competition" ? COMPETITION_SENTIMENT_LABELS : SENTIMENT_LABELS;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSelectedLeadStatuses(group) {
    return state.leadStatuses[group];
  }

  function getDraftLeadStatuses(group) {
    return state.draftLeadStatuses[group];
  }

  function formatLeadStatuses(statuses, group) {
    if (!statuses.length) return `对比组 ${group.toUpperCase()}`;
    if (statuses.length <= 2) return statuses.join("、");
    return `${statuses[0]}等 ${statuses.length} 个状态`;
  }

  function formatLeadGroupLabel(group) {
    return formatLeadStatuses(getSelectedLeadStatuses(group), group);
  }

  function getModeMeta() {
    if (state.mode === "lead") {
      modeMeta.lead.aLabel = formatLeadGroupLabel("a");
      modeMeta.lead.bLabel = formatLeadGroupLabel("b");
    }
    return modeMeta[state.mode];
  }

  function isDraftLeadComparisonReady() {
    return getDraftLeadStatuses("a").length > 0 && getDraftLeadStatuses("b").length > 0;
  }

  function getLeadGroupScore(group) {
    const statuses = getSelectedLeadStatuses(group);
    const totals = statuses.reduce((result, status) => {
      const meta = LEAD_STATUS_META[status];
      result.customers += meta.customers;
      result.weightedScore += meta.customers * meta.score;
      return result;
    }, { customers: 0, weightedScore: 0 });
    return totals.customers ? totals.weightedScore / totals.customers : 0;
  }

  function getLeadSample() {
    const feedbackBase = { profile: [0.82, 0.08], decision: [0.78, 0.18], competition: [0.25, 0.13] }[state.insight];
    const summarize = (group) => {
      const customers = getSelectedLeadStatuses(group).reduce((sum, status) => sum + LEAD_STATUS_META[status].customers, 0);
      const feedback = Math.round(customers * (feedbackBase[0] + getLeadGroupScore(group) * feedbackBase[1]));
      return { customers, feedback };
    };
    const a = summarize("a");
    const b = summarize("b");
    const overlap = Math.round(Math.min(a.customers, b.customers) * 0.025);
    return [a.customers, b.customers, a.feedback, b.feedback, overlap];
  }

  function getSample(mode = state.mode) {
    return mode === "lead" ? getLeadSample() : SAMPLE_BY_INSIGHT[state.insight][mode];
  }

  function getLeadTopicStats(topic) {
    const source = topic.lead;
    const interpolate = (low, high, score) => low + (high - low) * score;
    const buildGroup = (group) => {
      const score = getLeadGroupScore(group);
      const rate = Number(interpolate(source.bRate, source.aRate, score).toFixed(1));
      const sentiment = source.bSentiment.map((value, index) => Math.round(interpolate(value, source.aSentiment[index], score)));
      sentiment[1] = 100 - sentiment[0] - sentiment[2];
      return { rate, sentiment };
    };
    const a = buildGroup("a");
    const b = buildGroup("b");
    return { aRate: a.rate, bRate: b.rate, aSentiment: a.sentiment, bSentiment: b.sentiment };
  }

  function getAllTopicStats(topic) {
    const visitSample = getSample("visit");
    const aFeedback = visitSample[2];
    const bFeedback = visitSample[3];
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
    const sample = getSample(mode);
    if (mode === "all") {
      const topicStats = getTopics().map(getAllTopicStats);
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
    const topicStats = getTopics().map((topic) => mode === "lead" ? getLeadTopicStats(topic) : topic[mode]);
    const weightedSentiment = (group) => {
      const rateKey = `${group}Rate`;
      const sentimentKey = `${group}Sentiment`;
      const totalWeight = topicStats.reduce((sum, stats) => sum + stats[rateKey], 0);
      return [0, 1, 2].map((sentimentIndex) => Math.round(
        topicStats.reduce((sum, stats) => sum + stats[rateKey] * stats[sentimentKey][sentimentIndex], 0) / totalWeight
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
      description: getInsightConfig().aggregateDescription,
      all: getAggregateStats("all"),
      visit: getAggregateStats("visit"),
      lead: getAggregateStats("lead"),
      children: [],
      voiceText: []
    };
  }

  function getTopic(name = state.topic) {
    if (name === "all") return getAggregateTopic();
    return getTopics().find((topic) => topic.name === name) || getAggregateTopic();
  }

  function getTopicStats(topic) {
    if (state.mode === "all") {
      return topic.name === "全部汇总" ? topic.all : getAllTopicStats(topic);
    }
    if (state.mode === "lead" && topic.name !== "全部汇总") return getLeadTopicStats(topic);
    return topic[state.mode];
  }

  function getDelta(topic) {
    const stats = getTopicStats(topic);
    return Number((stats.aRate - stats.bRate).toFixed(1));
  }

  function getCounts(topic) {
    const stats = getTopicStats(topic);
    const sample = getSample();
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
    const meta = getModeMeta();
    const sample = getSample();
    const expression = getInsightConfig().sampleExpression;
    if (state.mode === "all") {
      const [customers, feedbackCustomers] = sample;
      const isProfile = state.insight === "profile";
      const customerLabel = isProfile ? "画像客户数" : "反馈客户数";
      const coverageNote = isProfile
        ? `${(feedbackCustomers / customers * 100).toFixed(1)}% ${expression}`
        : `${(feedbackCustomers / customers * 100).toFixed(1)}% 有${expression}`;
      const grid = $("#sampleGrid");
      grid.className = "sample-grid is-all";
      grid.innerHTML = `
        <article class="sample-card"><span>全部客户数</span><strong>${customers.toLocaleString("zh-CN")}</strong><small>当前筛选范围内去重自然客户</small></article>
        <article class="sample-card a"><span>${customerLabel}</span><strong>${feedbackCustomers.toLocaleString("zh-CN")}</strong><small>${escapeHTML(coverageNote)}</small></article>
      `;
      return;
    }
    const [aCustomers, bCustomers, aFeedback, bFeedback, overlap] = sample;
    const aSampleLabel = meta.aSampleLabel || meta.aLabel;
    const bSampleLabel = meta.bSampleLabel || meta.bLabel;
    const cards = [
      { tone: "a", label: `${aSampleLabel}数`, value: aCustomers, note: "去重自然客户" },
      { tone: "b", label: `${bSampleLabel}数`, value: bCustomers, note: "去重自然客户" },
      { tone: "a", label: `${aSampleLabel}反馈客户数`, value: aFeedback, note: `${(aFeedback / aCustomers * 100).toFixed(1)}% 有${expression}` },
      { tone: "b", label: `${bSampleLabel}反馈客户数`, value: bFeedback, note: `${(bFeedback / bCustomers * 100).toFixed(1)}% 有${expression}` }
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

  function getProfileTagComparison(rate, index) {
    const patternA = [6, -2, 5, 3, -4, 7, 2, -3];
    const patternB = [-5, 4, -3, 6, 3, -6, 5, 2];
    if (state.mode === "visit") {
      return {
        a: Math.max(2, Math.min(78, rate + patternA[index % patternA.length])),
        b: Math.max(2, Math.min(78, rate + patternB[index % patternB.length]))
      };
    }
    const aScore = getLeadGroupScore("a");
    const bScore = getLeadGroupScore("b");
    return {
      a: Math.max(2, Math.min(78, rate + (aScore - 0.45) * 18 + patternA[index % patternA.length] * 0.35)),
      b: Math.max(2, Math.min(78, rate + (bScore - 0.45) * 18 + patternB[index % patternB.length] * 0.35))
    };
  }

  function renderProfileOverview() {
    const org = $("#orgFilter").value;
    const brand = $("#brandFilter").value;
    const model = $("#modelFilter").value;
    const leadStatus = $("#leadStatusFilter").value;
    const dateRange = $(".date-value").textContent;
    const comparing = state.mode !== "all";
    const meta = getModeMeta();
    const availableGroups = PROFILE_GROUPS.filter((group) => group.tags.length > 0);
    const topTags = availableGroups.flatMap((group) => group.tags.map(([name, rate]) => ({ name, rate }))).sort((left, right) => right.rate - left.rate);
    const comparableTags = topTags.map((tag, index) => ({ ...tag, ...getProfileTagComparison(tag.rate, index) }))
      .map((tag) => ({ ...tag, delta: Number((tag.a - tag.b).toFixed(1)) }))
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));
    $("#profileScope").textContent = `${org} · ${brand} · ${model}${leadStatus === "全部线索状态" ? "" : ` · ${leadStatus}`}${comparing ? " · A/B对比" : ""}`;
    $("#profileCount").textContent = `${availableGroups.length}/13`;
    let generatedSummary = "";
    let generatedLabel = comparing ? "AI生成的差异总结" : "AI生成的客群总结";
    if (comparing && comparableTags.length) {
      const strongest = comparableTags[0];
      const strongerGroup = strongest.delta >= 0 ? meta.aLabel : meta.bLabel;
      generatedSummary = `<strong>${escapeHTML(strongerGroup)}</strong>的“${escapeHTML(strongest.name)}”标签高 ${Math.abs(strongest.delta).toFixed(1)} 个百分点，是当前两组最明显的画像差异；建议结合决策归因继续确认该差异是否影响到店或成交。`;
    } else {
      generatedSummary = topTags.length >= 3
        ? `当前客群主要呈现<strong>${escapeHTML(topTags.slice(0, 2).map((item) => item.name).join("、"))}</strong>特征，较常见的购车条件是<strong>${escapeHTML(topTags[2].name)}</strong>。`
        : `当前筛选范围内已命中 <strong>${availableGroups.length}/13</strong> 个画像维度；暂无数据的维度会保留展示。`;
    }
    const summaryContent = state.profileAiGenerated
      ? generatedSummary
      : `点击左侧AI机器人，基于当前${comparing ? "A/B客群及画像差异" : "筛选范围内的画像标签"}生成总结。`;
    $("#profileConclusion").innerHTML = `
      <button type="button" class="profile-ai-trigger" data-profile-ai-generate aria-label="${state.profileAiGenerated ? "重新生成" : "生成"}${escapeHTML(generatedLabel)}" title="点击${state.profileAiGenerated ? "重新" : ""}生成总结">${AI_ROBOT_ICON}<span>AI</span></button>
      <span><span class="ai-inline-label">机器人 · ${state.profileAiGenerated ? generatedLabel : "等待生成"}</span>${summaryContent}</span>
    `;

    let tagIndex = 0;
    $("#profileSummaryGrid").innerHTML = PROFILE_GROUPS.map((group) => {
      const tags = group.tags.length ? group.tags.map(([rawName, rate]) => {
        const name = rawName === "意向车型" ? `意向 ${model}` : rawName;
        if (comparing) {
          const rates = getProfileTagComparison(rate, tagIndex++);
          const delta = rates.a - rates.b;
          return `
            <div class="profile-tag is-comparing">
              <span title="${escapeHTML(name)}">${escapeHTML(name)}</span>
              <span class="profile-compare-bars" aria-label="A组 ${rates.a.toFixed(1)}%，B组 ${rates.b.toFixed(1)}%">
                <span>A<i style="width:${Math.min(100, rates.a / 70 * 100)}%"></i><b>${rates.a.toFixed(1)}%</b></span>
                <span>B<i style="width:${Math.min(100, rates.b / 70 * 100)}%"></i><b>${rates.b.toFixed(1)}%</b></span>
              </span>
              <span class="profile-tag-delta">${delta >= 0 ? "A" : "B"} +${Math.abs(delta).toFixed(1)}pp</span>
            </div>
          `;
        }
        tagIndex += 1;
        return `
          <div class="profile-tag">
            <span title="${escapeHTML(name)}">${escapeHTML(name)}</span>
            <span class="profile-tag-track" aria-hidden="true"><i style="width:${Math.min(100, rate / 70 * 100)}%"></i></span>
            <b>${rate.toFixed(1)}%</b>
          </div>
        `;
      }).join("") : `<div class="profile-empty">暂无数据</div>`;
      return `
        <article class="profile-group-card" data-tone="${group.tone}">
          <div class="profile-group-head">
            <span><strong>${escapeHTML(group.title)}</strong><small>${escapeHTML(group.description)}</small></span>
            <span>${group.tags.length ? `${group.tags.length} 个标签` : "暂无"}</span>
          </div>
          <div class="profile-tag-list">${tags}</div>
        </article>
      `;
    }).join("");

    $(".heatmap-legend").hidden = comparing;
    if (comparing) {
      $("#profileHeatmapTitle").textContent = "客群标签差异";
      $("#profileHeatmapDescription").textContent = "按照当前手动配置的A、B两组客户，汇总差异最大的画像标签";
      const rows = comparableTags.map((tag) => `
        <tr><td>${escapeHTML(tag.name)}<small>画像标签</small></td><td>${tag.a.toFixed(1)}%<small>A组命中率</small></td><td>${tag.b.toFixed(1)}%<small>B组命中率</small></td><td>${tag.delta >= 0 ? "A" : "B"} +${Math.abs(tag.delta).toFixed(1)}pp<small>两组差值</small></td></tr>
      `).join("");
      $("#profileHeatmap").innerHTML = `<table class="profile-heatmap-table" aria-label="客群画像标签差异"><thead><tr><th scope="col">客户标签</th><th scope="col">A组</th><th scope="col">B组</th><th scope="col">差值</th></tr></thead><tbody>${rows}</tbody></table>`;
      return;
    }

    $("#profileHeatmapTitle").textContent = "意向特征热力图";
    $("#profileHeatmapDescription").textContent = "展示不同意向等级客户命中各画像标签的比例，颜色越深代表该特征越集中";
    const header = PROFILE_INTENT_LEVELS.map((level) => `<th scope="col">${level.label}<small>${level.customers} 人</small></th>`).join("");
    const rows = PROFILE_HEATMAP_ROWS.map((row) => {
      const cells = row.values.map((rate, index) => {
        const count = Math.round(PROFILE_INTENT_LEVELS[index].customers * rate / 100);
        const alpha = Math.min(0.76, 0.08 + rate / 100 * 0.84);
        return `<td class="${rate >= 52 ? "heatmap-dark" : ""}" style="background:rgba(47, 107, 255, ${alpha.toFixed(2)})" title="${escapeHTML(row.name)} · ${PROFILE_INTENT_LEVELS[index].label}：${rate}%，${count} 人">${rate}%<small>${count} 人</small></td>`;
      }).join("");
      return `<tr><td>${escapeHTML(row.name)}<small>${escapeHTML(row.category)}</small></td>${cells}</tr>`;
    }).join("");
    $("#profileHeatmap").innerHTML = `
      <table class="profile-heatmap-table" aria-label="${escapeHTML(model)}意向特征热力图，时间范围 ${escapeHTML(dateRange)}">
        <thead><tr><th scope="col">客户标签</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function toggleInsightSections() {
    const isProfile = state.insight === "profile";
    $("#analysisViewBar").hidden = false;
    $("#profileOverview").hidden = !isProfile;
    $("#insightCallout").hidden = isProfile;
    $("#topicPanel").hidden = isProfile;
    $("#detailGrid").hidden = isProfile;
    $("#exportButton").hidden = isProfile;
    if (isProfile) {
      $("#domainSummary").hidden = true;
      $("#domainSummary").innerHTML = "";
    }
  }

  function renderDecisionTopicMeta(topic, stats) {
    if (state.insight !== "decision") return "";
    const positive = state.mode === "all" ? stats.sentiment[0] : Math.round((stats.aSentiment[0] + stats.bSentiment[0]) / 2);
    const negative = state.mode === "all" ? stats.sentiment[2] : Math.round((stats.aSentiment[2] + stats.bSentiment[2]) / 2);
    const direction = positive >= negative ? "主要吸引" : "主要抗性";
    return `<span class="decision-topic-meta ${topic.domain}"><i></i>${escapeHTML(topic.domainLabel)} · ${direction}</span>`;
  }

  function renderSentimentLegend() {
    const labels = getSentimentLabels();
    const title = state.insight === "decision" ? "决策倾向" : state.insight === "competition" ? "胜负倾向" : "情感分布";
    return `<span class="legend-sentiment">${title} <em class="positive"></em>${escapeHTML(labels.positive)} <em class="neutral"></em>${escapeHTML(labels.neutral)} <em class="negative"></em>${escapeHTML(labels.negative)}</span>`;
  }

  function renderTopicMatrix() {
    const sortedTopics = [...getTopics()].sort((left, right) => {
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
        <span><b>${escapeHTML(getInsightConfig().topicScope)}</b></span><span class="legend-center">全部客户反馈占比</span><span>反馈客户数</span>${renderSentimentLegend()}
      `;
      $("#topicMatrix").innerHTML = sortedTopics.map((topic) => {
        const stats = getTopicStats(topic);
        const counts = getCounts(topic);
        return `
          <button type="button" class="topic-row is-all-mode${topic.name === state.topic ? " is-selected" : ""}" data-topic="${escapeHTML(topic.name)}" aria-pressed="${topic.name === state.topic}">
            <span class="topic-name-block"><span><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.description)}</small>${renderDecisionTopicMeta(topic, stats)}</span></span>
            <span class="overall-chart" aria-label="${escapeHTML(topic.name)}反馈客户占比 ${stats.rate}%"><span class="overall-track"><i style="width:${Math.min(100, stats.rate / 65 * 100)}%"></i></span><b>${stats.rate.toFixed(1)}%</b></span>
            <span class="overall-count"><b>${counts.total}</b>位反馈客户</span>
            <span class="sentiment-cell">${renderSentimentStack("全", stats.sentiment, true)}</span>
          </button>
        `;
      }).join("");
    } else {
      $("#topicLegend").innerHTML = `
        <span class="legend-a"><i></i><b id="legendA">${escapeHTML(getModeMeta().aLabel)}</b></span>
        <span class="legend-center">反馈客户占比</span>
        <span class="legend-b"><i></i><b id="legendB">${escapeHTML(getModeMeta().bLabel)}</b></span>
        ${renderSentimentLegend()}
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
            <span class="topic-name-block"><span><strong>${escapeHTML(topic.name)}</strong><small>${escapeHTML(topic.description)}</small>${renderDecisionTopicMeta(topic, stats)}</span><span class="${deltaClass}">${deltaText}pp</span></span>
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
    const labels = getSentimentLabels();
    const valueLabels = state.insight === "competition"
      ? { positive: "竞品", neutral: "待定", negative: "本品" }
      : labels;
    if (showValues) {
      return `
        <span class="sentiment-summary-chart" aria-label="${escapeHTML(labels.positive)} ${values[0]}%，${escapeHTML(labels.neutral)} ${values[1]}%，${escapeHTML(labels.negative)} ${values[2]}%">
          <span class="sentiment-stack sentiment-stack-large">
            <i class="positive" style="width:${values[0]}%"></i><i class="neutral" style="width:${values[1]}%"></i><i class="negative" style="width:${values[2]}%"></i>
          </span>
          <span class="sentiment-values"><b class="positive">${escapeHTML(valueLabels.positive)} ${values[0]}%</b><b class="neutral">${escapeHTML(valueLabels.neutral)} ${values[1]}%</b><b class="negative">${escapeHTML(valueLabels.negative)} ${values[2]}%</b></span>
        </span>
      `;
    }
    return `
      <span class="sentiment-row">
        <span>${label}</span>
        <span class="sentiment-stack" aria-label="${escapeHTML(labels.positive)} ${values[0]}%，${escapeHTML(labels.neutral)} ${values[1]}%，${escapeHTML(labels.negative)} ${values[2]}%">
          <i class="positive" style="width:${values[0]}%"></i><i class="neutral" style="width:${values[1]}%"></i><i class="negative" style="width:${values[2]}%"></i>
        </span>
      </span>
    `;
  }

  function renderCallout() {
    const topic = getTopic();
    const stats = getTopicStats(topic);
    const meta = getModeMeta();
    const sample = getSample();
    const insight = getInsightConfig();
    const sentimentLabels = getSentimentLabels();
    if (state.mode === "all") {
      if (state.topic === "all") {
        const topTopic = [...getTopics()].sort((left, right) => getTopicStats(right).rate - getTopicStats(left).rate)[0];
        const topStats = getTopicStats(topTopic);
        $("#insightCallout").innerHTML = `
          <span class="callout-kicker" aria-hidden="true">${AI_ROBOT_ICON}</span>
          <span class="callout-copy"><span>机器人 · AI生成 · ${escapeHTML(insight.label)}</span><strong>共 ${sample[1]} 名反馈客户，反馈覆盖率 ${stats.rate.toFixed(1)}%；客户最关注“${escapeHTML(topTopic.name)}” ${topStats.rate.toFixed(1)}%，其中${escapeHTML(sentimentLabels.negative)}表达占 ${topStats.sentiment[2]}%。</strong></span>
          <span class="callout-delta"><b>${stats.rate.toFixed(1)}%</b><span>反馈客户覆盖率</span></span>
        `;
      } else {
        const counts = getCounts(topic);
        $("#insightCallout").innerHTML = `
          <span class="callout-kicker" aria-hidden="true">${AI_ROBOT_ICON}</span>
          <span class="callout-copy"><span>机器人 · AI生成 · ${escapeHTML(topic.name)}解读</span><strong>${counts.total} 名客户反馈“${escapeHTML(topic.name)}”，占全部反馈客户 ${stats.rate.toFixed(1)}%；${escapeHTML(sentimentLabels.positive)} ${stats.sentiment[0]}%，${escapeHTML(sentimentLabels.neutral)} ${stats.sentiment[1]}%，${escapeHTML(sentimentLabels.negative)} ${stats.sentiment[2]}%。</strong></span>
          <span class="callout-delta"><b>${stats.rate.toFixed(1)}%</b><span>整体反馈占比</span></span>
        `;
      }
      return;
    }
    const delta = getDelta(topic);
    if (state.topic === "all") {
      const aTop = [...getTopics()].sort((left, right) => getTopicStats(right).aRate - getTopicStats(left).aRate)[0];
      const bTop = [...getTopics()].sort((left, right) => getTopicStats(right).bRate - getTopicStats(left).bRate)[0];
      const maxDifference = [...getTopics()].sort((left, right) => Math.abs(getDelta(right)) - Math.abs(getDelta(left)))[0];
      const maxDelta = Math.abs(getDelta(maxDifference));
      const feedbackTotal = sample[2] + sample[3];
      $("#insightCallout").innerHTML = `
        <span class="callout-kicker" aria-hidden="true">
          ${AI_ROBOT_ICON}
        </span>
        <span class="callout-copy"><span>机器人 · AI生成 · 客群差异总结</span><strong>共 ${feedbackTotal} 名反馈客户；${escapeHTML(meta.aLabel)}最关注“${escapeHTML(aTop.name)}” ${getTopicStats(aTop).aRate.toFixed(1)}%，${escapeHTML(meta.bLabel)}最关注“${escapeHTML(bTop.name)}” ${getTopicStats(bTop).bRate.toFixed(1)}%；最大差异来自“${escapeHTML(maxDifference.name)}”。</strong></span>
        <span class="callout-delta"><b>${maxDelta.toFixed(1)}pp</b><span>最大主题差值</span></span>
      `;
      return;
    }
    const strongerGroup = delta >= 0 ? meta.aLabel : meta.bLabel;
    const higherNegative = stats.aSentiment[2] > stats.bSentiment[2] ? meta.aLabel : meta.bLabel;
    const negativeGap = Math.abs(stats.aSentiment[2] - stats.bSentiment[2]);
    $("#insightCallout").innerHTML = `
      <span class="callout-kicker" aria-hidden="true">
        ${AI_ROBOT_ICON}
      </span>
      <span class="callout-copy"><span>机器人 · AI生成 · ${escapeHTML(topic.name)}差异解读</span><strong>${escapeHTML(strongerGroup)}对“${escapeHTML(topic.name)}”的关注更集中；${escapeHTML(higherNegative)}的${escapeHTML(sentimentLabels.negative)}表达高 ${negativeGap.toFixed(0)} 个百分点，建议优先查看原声确认具体原因。</strong></span>
      <span class="callout-delta"><b>${Math.abs(delta).toFixed(1)}pp</b><span>两组关注差值</span></span>
    `;
  }

  function renderSubtopics() {
    const factors = [0.62, 0.48, 0.34, 0.23];
    const sourceRows = state.topic === "all"
      ? getTopics().flatMap((topic) => topic.children.slice(0, 2).map((name, index) => ({ topic, name, index, factor: factors[index] })))
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
      ? `<div class="subtopic-head subtopic-head-all"><span>${escapeHTML(getInsightConfig().detailLabel)}</span><span>反馈占比</span><span>态度分布</span><span>反馈客户数</span></div>${rows}`
      : `<div class="subtopic-head"><span>${escapeHTML(getInsightConfig().detailLabel)}</span><span>A组占比</span><span>B组占比</span><span>态度分布</span><span>差值</span></div>${rows}`;
  }

  function getVoiceItems() {
    const orgs = ["华南大区 · 广州战区", "华东大区 · 上海战区", "华北大区 · 北京战区", "西南大区 · 成都战区", "华中大区 · 武汉战区", "西北大区 · 西安战区", "东北大区 · 沈阳战区"];
    const stages = ["试乘试驾", "邀约", "到店接待", "首触跟进"];
    const times = ["07-16 16:42", "07-15 11:08", "07-13 14:26", "07-11 09:37", "07-09 15:20", "07-08 10:16", "07-06 13:45"];

    if (state.topic === "all") {
      const aggregateVoices = getTopics().map((topic, index) => {
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
    const meta = getModeMeta();
    const sentimentLabels = getSentimentLabels();
    const getVoiceGroupLabel = (voice) => voice.group === "all"
      ? meta.label
      : `${voice.group === "a" ? "A" : "B"} · ${voice.group === "a" ? meta.aLabel : meta.bLabel}`;
    const voiceItems = getVoiceItems().filter((voice) => state.sentiment === "all" || voice.sentiment === state.sentiment);
    const voiceList = $("#voiceList");
    if (!voiceItems.length) {
      voiceList.innerHTML = `<div class="empty-voice">当前主题暂无${escapeHTML(sentimentLabels[state.sentiment] || "")}原声<br />可切换其他态度查看</div>`;
    } else {
      voiceList.innerHTML = voiceItems.map((voice, index) => `
        <article class="voice-item ${voice.sentiment}">
          <p class="voice-quote">“${voice.text}”</p>
          <div class="voice-meta">
            <span class="voice-group ${voice.group}">${escapeHTML(getVoiceGroupLabel(voice))}</span>
            <span class="sentiment-tag ${voice.sentiment}">${escapeHTML(sentimentLabels[voice.sentiment])}</span>
            <span>${escapeHTML(voice.feature)}${escapeHTML(getInsightConfig().itemLabel)}</span><span>·</span>
            <span>${escapeHTML(voice.org)}</span><span>·</span><span>${escapeHTML(voice.stage)}</span><span>·</span><time>${escapeHTML(voice.time)}</time>
            <button type="button" class="voice-ai-link" data-ai-customer="${index % AI_CUSTOMERS.length}">机器人 · AI客户分析</button>
          </div>
        </article>
      `).join("");
    }
    $("#viewAllVoices").innerHTML = state.showAllVoices
      ? "收起典型客户原声 <span>↑</span>"
      : `${state.topic === "all" ? "查看全部典型原声" : `查看该${getInsightConfig().itemLabel}全部原声`} <span>→</span>`;
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
    const topicIndex = state.topic === "all" ? 0 : getTopics().indexOf(topic);
    const stats = getTopicStats(topic);
    const periodLabels = {
      day: ["07-11", "07-12", "07-13", "07-14", "07-15", "07-16"],
      week: ["第23周", "第24周", "第25周", "第26周", "第27周", "第28周"],
      month: ["2月", "3月", "4月", "5月", "6月", "7月"]
    }[state.grain];
    const sentimentLabels = getSentimentLabels();
    const sentimentNames = [`${sentimentLabels.positive}客户占比`, `${sentimentLabels.neutral}客户占比`, `${sentimentLabels.negative}客户占比`];
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
    const meta = getModeMeta();
    const organizations = [
      ["华南大区", 184, 1.14, 1.09, 6],
      ["华东大区", 171, 0.97, 1.08, 3],
      ["华北大区", 146, 1.03, 0.91, -2],
      ["华中大区", 118, 0.88, 0.96, -4],
      ["西南大区", 104, 1.07, 1.16, 5]
    ];

    const negativeLabel = getSentimentLabels().negative;
    if (state.mode === "all") {
      $("#organizationHead").innerHTML = `<tr><th>组织</th><th>样本客户数</th><th>反馈客户占比</th><th>${escapeHTML(negativeLabel)}客户占比</th><th>较厂端均值</th></tr>`;
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

    $("#organizationHead").innerHTML = `<tr><th>组织</th><th>样本客户数</th><th><span class="cohort-dot a"></span><span id="orgHeaderA">A组</span>反馈占比</th><th><span class="cohort-dot b"></span><span id="orgHeaderB">B组</span>反馈占比</th><th>${escapeHTML(negativeLabel)}客户占比</th><th>较厂端均值</th></tr>`;
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
    deltaSortButton.disabled = false;
    rateSortButton.disabled = false;
    $("#exportButton").disabled = false;
    $("#viewAllVoices").hidden = false;
    $(".sample-rule").hidden = false;
    renderAnalysisViewBar();
  }

  function renderAnalysisViewBar() {
    const bar = $("#analysisViewBar");
    const comparing = state.mode !== "all";
    const meta = getModeMeta();
    const leadStatus = $("#leadStatusFilter").value;
    const leadStatusScope = leadStatus === "全部线索状态" ? "" : ` · 线索状态：${leadStatus}`;
    bar.classList.toggle("is-comparing", comparing);
    if (!comparing) {
      $("#analysisViewTitle").textContent = "全部客户";
      $("#analysisViewDescription").textContent = state.insight === "profile"
        ? `展示当前筛选范围内已识别的客户画像标签${leadStatusScope}`
        : `展示当前筛选范围内的全部有效反馈${leadStatusScope}`;
      $("#openComparisonButton").textContent = "发起客群对比";
      $("#exitComparisonButton").hidden = true;
      return;
    }
    $("#analysisViewTitle").textContent = `${meta.aLabel} VS ${meta.bLabel}`;
    $("#analysisViewDescription").textContent = state.mode === "visit"
      ? `按邀约到店结果对比 · 观察期 ${state.observationPeriod} 天${leadStatusScope}`
      : "按客户手动选择的线索状态生成对比";
    $("#openComparisonButton").textContent = "修改对比";
    $("#exitComparisonButton").hidden = false;
  }

  function renderComparisonDialog() {
    $$('[data-compare-mode]').forEach((button) => {
      const active = button.dataset.compareMode === state.draftMode;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-checked", String(active));
    });
    $("#visitSetup").hidden = state.draftMode !== "visit";
    $("#leadSetup").hidden = state.draftMode !== "lead";
    $("#observationFilter").value = state.draftObservationPeriod;
    $$(".status-options button").forEach((button) => {
      const group = button.closest(".status-options").dataset.group;
      const selected = getDraftLeadStatuses(group).includes(button.dataset.status);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    ["a", "b"].forEach((group) => {
      const groupElement = $(`.status-options[data-group="${group}"]`).closest(".lead-group");
      const statuses = getDraftLeadStatuses(group);
      $("strong", groupElement).textContent = formatLeadStatuses(statuses, group);
      $("small", groupElement).textContent = statuses.length ? `已选 ${statuses.length} 个线索状态` : "请至少选择 1 个线索状态";
    });
    const ready = state.draftMode === "visit" || isDraftLeadComparisonReady();
    $("#startComparisonButton").disabled = !ready;
    $("#comparisonValidation").textContent = state.draftMode === "visit"
      ? "邀约到店对比可直接开始"
      : ready ? "A、B 两组已完成，可开始对比" : "请为 A、B 两组分别选择至少 1 个状态";
  }

  function openComparisonDialog() {
    state.draftMode = state.mode === "all" ? (state.leadStatuses.a.length ? "lead" : "visit") : state.mode;
    state.draftLeadStatuses = { a: [...state.leadStatuses.a], b: [...state.leadStatuses.b] };
    state.draftObservationPeriod = state.observationPeriod;
    renderComparisonDialog();
    $("#comparisonDialog").hidden = false;
    document.body.classList.add("has-dialog");
    $("#closeComparisonDialog").focus();
  }

  function closeComparisonDialog() {
    $("#comparisonDialog").hidden = true;
    document.body.classList.remove("has-dialog");
    $("#openComparisonButton").focus();
  }

  function renderInsightLabels() {
    const insight = getInsightConfig();
    if (state.insight === "profile") {
      $("#pageEyebrow").textContent = `客群画像 · ${state.mode === "all" ? "全部客户" : "客群对比"}`;
      $("#sampleDescription").textContent = "客户按手机号跨门店去重，画像客户指至少命中 1 个有效画像标签";
      return;
    }
    $("#pageEyebrow").textContent = `${insight.label} · ${state.mode === "all" ? "全部客户" : "客群对比"}`;
    $("#sampleDescription").textContent = `客户按手机号跨门店去重，反馈客户指至少有一条${insight.sampleExpression}`;
    $("#topicTitle").textContent = insight.topicTitle;
    $("#topicScope").textContent = insight.topicScope;
    $("#topicDescription").textContent = insight.topicDescription;
    $("#subtopicTitle").textContent = insight.detailTitle;
    $("#subtopicDescription").textContent = insight.detailDescription;
    $("#trendDescription").textContent = insight.trendDescription;
    $("#organizationDescription").textContent = insight.organizationDescription;
    const sentimentLabels = getSentimentLabels();
    $$('[data-sentiment]').forEach((button) => {
      button.textContent = button.dataset.sentiment === "all" ? "全部" : sentimentLabels[button.dataset.sentiment];
    });
    $("#voiceDescription").textContent = state.insight === "decision"
      ? "从当前筛选结果中抽取吸引与抗性表达，可下钻查看单客户AI分析"
      : "从当前筛选结果中抽取本品与竞品的胜负依据，可下钻查看单客户AI分析";
  }

  function renderDomainSummary() {
    const panel = $("#domainSummary");
    const model = $("#modelFilter").value;
    const sample = getSample();
    const feedbackCustomers = state.mode === "all" ? sample[1] : sample[2] + sample[3];
    panel.hidden = false;
    if (state.insight === "decision") {
      const comparisonNote = state.mode === "all" ? "当前筛选 · 全部客户" : `${getModeMeta().aLabel} VS ${getModeMeta().bLabel}`;
      panel.innerHTML = `
        <div class="section-heading panel-heading domain-summary-heading">
          <div><div class="heading-line"><h2>决策归因结构</h2><span class="ai-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v3m8-3v3M6 9h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm2 4h.01M16 13h.01M9 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>AI标签归因</span></div><p>从产品与政策两个方面识别客户的吸引点和抗性点；结果基于客户表达与行为关联，不代表严格因果</p></div>
          <span class="domain-summary-note">${escapeHTML(comparisonNote)} · ${escapeHTML(model)}</span>
        </div>
        <div class="decision-summary-grid">
          <article class="decision-summary-card attraction"><span>产品吸引点</span><strong>空间 · 智能座舱 · 外观</strong><small>家庭出行客户对二排空间和易用性认可更集中</small></article>
          <article class="decision-summary-card resistance"><span>产品抗性点</span><strong>真实续航 · 充电补能</strong><small>高速续航和无家充场景是当前主要产品顾虑</small></article>
          <article class="decision-summary-card attraction"><span>政策吸引点</span><strong>现金优惠 · 免息贷款 · 权益</strong><small>明确的落地价和低成本金融方案更能推动决策</small></article>
          <article class="decision-summary-card resistance"><span>政策抗性点</span><strong>价格 · 置换估值 · 贷款成本</strong><small>价格与政策阻力高于产品因素，其中落地价最突出</small></article>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="section-heading panel-heading domain-summary-heading">
        <div><div class="heading-line"><h2>竞品比较概览</h2><span class="ai-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v3m8-3v3M6 9h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm2 4h.01M16 13h.01M9 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>AI竞争总结</span></div><p>概括客户为什么比较竞品，以及本品相对优势与劣势</p></div>
        <span class="domain-summary-note">${feedbackCustomers} 名竞品比较客户</span>
      </div>
      <div class="competition-summary-grid">
        <article><span class="summary-label">被比较最多</span><strong>宋PLUS DM-i</strong><b>38.9%</b><small>价格与油电兼容是主要原因</small></article>
        <article class="advantage"><span class="summary-label">本品更受认可</span><strong>空间 · 智能座舱 · 舒适性</strong><small>“后排宽敞”“车机流畅”“底盘更舒服”</small></article>
        <article class="risk"><span class="summary-label">竞品更受认可</span><strong>价格 · 补能选择 · 品牌保有量</strong><small>“落地更低”“可油可电”“售后网点多”</small></article>
      </div>
      <div class="keyword-strip" aria-label="竞品高频评价关键词">
        <span>价格更低 <b>68</b></span><span>空间更大 <b>51</b></span><span>智能座舱 <b>46</b></span><span>可油可电 <b>43</b></span><span>品牌信任 <b>37</b></span><span>底盘舒适 <b>29</b></span>
      </div>
    `;
  }

  function openAiCustomerDrawer(index, trigger) {
    const customer = AI_CUSTOMERS[index] || AI_CUSTOMERS[0];
    const drawer = $("#aiCustomerDrawer");
    drawer.lastTrigger = trigger || null;
    $("#aiCustomerDrawerBody").innerHTML = `
      <section class="ai-customer-identity">
        <span><strong>${escapeHTML(customer.name)}</strong><small>${escapeHTML(customer.status)}</small></span>
        <b>${escapeHTML(customer.priority)}</b>
      </section>
      <section class="ai-customer-section">
        <h3>机器人 · AI客户总结</h3>
        <p>${escapeHTML(customer.summary)}</p>
      </section>
      <section class="ai-customer-section">
        <h3>已识别画像标签</h3>
        <div class="ai-customer-tags">${customer.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
      </section>
      <section class="ai-customer-section">
        <h3>产品与政策吸引点</h3>
        <p>${escapeHTML(customer.attraction)}</p>
      </section>
      <section class="ai-customer-section">
        <h3>主要抗性点</h3>
        <p>${escapeHTML(customer.resistance)}</p>
      </section>
      <section class="ai-customer-section">
        <h3>竞品比较</h3>
        <p>${escapeHTML(customer.competitor)}</p>
      </section>
      <section class="ai-customer-section ai-action-section">
        <h3>机器人 · AI建议</h3>
        <p>${escapeHTML(customer.action)}</p>
      </section>
      <section class="ai-customer-section">
        <h3>判断依据 · 2段录音</h3>
        <div class="ai-evidence">${customer.evidence.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>
      </section>
    `;
    drawer.hidden = false;
    document.body.classList.add("has-dialog");
    $("#closeAiCustomerDrawer").focus();
  }

  function generateProfileAiSummary(trigger) {
    const sample = getSample();
    const analyzedCustomers = state.mode === "all" ? sample[1] : sample[2] + sample[3];
    const content = $("#profileConclusion > span");
    trigger.disabled = true;
    trigger.classList.add("is-generating");
    content.innerHTML = `<span class="ai-inline-label">机器人 · AI正在分析</span>正在聚合 ${analyzedCustomers.toLocaleString("zh-CN")} 名客户的画像标签与差异，请稍候…`;
    window.clearTimeout(generateProfileAiSummary.timer);
    generateProfileAiSummary.timer = window.setTimeout(() => {
      state.profileAiGenerated = true;
      renderProfileOverview();
      showToast("AI客群总结已生成");
    }, 700);
  }

  function resetProfileAiSummary() {
    state.profileAiGenerated = false;
    window.clearTimeout(generateProfileAiSummary.timer);
  }

  function closeAiCustomerDrawer() {
    const drawer = $("#aiCustomerDrawer");
    drawer.hidden = true;
    document.body.classList.remove("has-dialog");
    if (drawer.lastTrigger?.isConnected) drawer.lastTrigger.focus();
  }

  function resetToAggregate() {
    state.topic = "all";
    state.showAllVoices = false;
    resetProfileAiSummary();
  }

  function renderAll() {
    renderInsightLabels();
    toggleInsightSections();
    if (state.insight === "profile") {
      renderSampleOverview();
      renderAnalysisViewBar();
      renderProfileOverview();
      return;
    }
    renderModeLabels();
    renderSampleOverview();
    renderCallout();
    renderDomainSummary();
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
    const meta = getModeMeta();
    const insight = getInsightConfig();
    const rows = state.mode === "all"
      ? [[insight.itemLabel, "反馈客户占比", "反馈客户数", "正面占比", "中性占比", "负面占比"]]
      : [[insight.itemLabel, `${meta.aLabel}反馈占比`, `${meta.bLabel}反馈占比`, "差值（百分点）"]];
    getTopics().forEach((topic) => {
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
    link.download = `AION-V-${insight.label}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(state.mode === "all" ? `已导出${insight.label}汇总数据` : `已导出${insight.label}对比数据`);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const profileAiTrigger = event.target.closest("[data-profile-ai-generate]");
      if (profileAiTrigger) {
        generateProfileAiSummary(profileAiTrigger);
        return;
      }
      const trigger = event.target.closest("[data-ai-customer]");
      if (!trigger) return;
      openAiCustomerDrawer(Number(trigger.dataset.aiCustomer), trigger);
    });

    $$('[data-insight]').forEach((button) => {
      button.addEventListener("click", () => {
        state.insight = button.dataset.insight;
        resetToAggregate();
        $$('[data-insight]').forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        renderAll();
        showToast(`已切换至${getInsightConfig().label}`);
      });
    });

    $$('[data-compare-mode]').forEach((button) => {
      button.addEventListener("click", () => {
        state.draftMode = button.dataset.compareMode;
        renderComparisonDialog();
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
        const groupKey = group.dataset.group;
        const status = button.dataset.status;
        const willSelect = !state.draftLeadStatuses[groupKey].includes(status);
        if (willSelect) {
          const otherGroupKey = groupKey === "a" ? "b" : "a";
          state.draftLeadStatuses[otherGroupKey] = state.draftLeadStatuses[otherGroupKey].filter((item) => item !== status);
          state.draftLeadStatuses[groupKey] = [...state.draftLeadStatuses[groupKey], status];
        } else {
          state.draftLeadStatuses[groupKey] = state.draftLeadStatuses[groupKey].filter((item) => item !== status);
        }
        renderComparisonDialog();
      });
    });

    $("#observationFilter").addEventListener("change", (event) => {
      state.draftObservationPeriod = event.target.value;
    });

    $("#openComparisonButton").addEventListener("click", openComparisonDialog);
    $("#closeComparisonDialog").addEventListener("click", closeComparisonDialog);
    $("#cancelComparisonButton").addEventListener("click", closeComparisonDialog);
    $("#comparisonDialog").addEventListener("click", (event) => {
      if (event.target === $("#comparisonDialog")) closeComparisonDialog();
    });
    $("#closeAiCustomerDrawer").addEventListener("click", closeAiCustomerDrawer);
    $("#aiCustomerDrawer").addEventListener("click", (event) => {
      if (event.target === $("#aiCustomerDrawer")) closeAiCustomerDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#comparisonDialog").hidden) closeComparisonDialog();
      if (event.key === "Escape" && !$("#aiCustomerDrawer").hidden) closeAiCustomerDrawer();
    });
    $("#startComparisonButton").addEventListener("click", () => {
      if (state.draftMode === "lead" && !isDraftLeadComparisonReady()) return;
      if (state.draftMode === "lead") $("#leadStatusFilter").selectedIndex = 0;
      state.mode = state.draftMode;
      state.leadStatuses = { a: [...state.draftLeadStatuses.a], b: [...state.draftLeadStatuses.b] };
      state.observationPeriod = state.draftObservationPeriod;
      state.sort = "delta";
      resetToAggregate();
      closeComparisonDialog();
      renderAll();
      showToast("已生成客群对比");
    });
    $("#exitComparisonButton").addEventListener("click", () => {
      state.mode = "all";
      state.sort = "rate";
      resetToAggregate();
      renderAll();
      showToast("已返回全部客户视图");
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
      state.insight = "profile";
      state.mode = "all";
      state.draftMode = "visit";
      state.leadStatuses = { a: [], b: [] };
      state.draftLeadStatuses = { a: [], b: [] };
      state.observationPeriod = "7";
      state.draftObservationPeriod = "7";
      state.topic = "all";
      state.sort = "rate";
      state.sentiment = "all";
      state.grain = "week";
      state.showAllVoices = false;
      resetProfileAiSummary();
      $("#orgFilter").selectedIndex = 0;
      $("#brandFilter").selectedIndex = 0;
      $("#modelFilter").selectedIndex = 0;
      $("#leadStatusFilter").selectedIndex = 0;
      $("#observationFilter").selectedIndex = 0;
      $$('[data-insight]').forEach((item) => {
        const active = item.dataset.insight === "profile";
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      $$(".status-options button").forEach((item) => {
        item.classList.remove("is-selected");
        item.setAttribute("aria-pressed", "false");
      });
      $$("[data-sort]").forEach((item) => item.classList.toggle("is-active", item.dataset.sort === "rate"));
      $$("[data-sentiment]").forEach((item) => item.classList.toggle("is-active", item.dataset.sentiment === "all"));
      $$("[data-grain]").forEach((item) => item.classList.toggle("is-active", item.dataset.grain === "week"));
      $$("[data-date]").forEach((item) => item.classList.toggle("is-active", item.dataset.date === "30"));
      $(".date-value").textContent = "2026-06-17 — 2026-07-16";
      if (!$("#comparisonDialog").hidden) closeComparisonDialog();
      if (!$("#aiCustomerDrawer").hidden) closeAiCustomerDrawer();
      renderAll();
      showToast("已重置分析条件");
    });

    $$(".filter-field select, .compact-select select").forEach((select) => {
      select.addEventListener("change", () => {
        const exitsLeadComparison = select.id === "leadStatusFilter" && state.mode === "lead";
        if (exitsLeadComparison) {
          state.mode = "all";
          state.sort = "rate";
        }
        resetToAggregate();
        renderAll();
        showToast(exitsLeadComparison
          ? `已退出线索状态对比，并按“${select.value}”刷新`
          : `${select.closest("label")?.querySelector("span")?.textContent || "筛选条件"}已更新，当前视图已刷新`);
      });
    });
  }

  bindEvents();
  renderAll();
})();
