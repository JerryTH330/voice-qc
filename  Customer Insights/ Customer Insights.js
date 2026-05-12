const FILTERS = [
  { key: "brand", label: "品牌", options: [{ label: "传祺", value: "传祺" }, { label: "埃安", value: "埃安" }] },
  { key: "time", label: "时间", options: [{ label: "昨日", value: "1" }, { label: "近7天", value: "7" }, { label: "近半月", value: "15" }, { label: "近1月", value: "30" }, { label: "自定义", value: "custom" }] }
];

const SCENE_FILTER = { key: "scene", label: "质检场景", options: [
  { label: "全部", value: "all" },
  { label: "首触邀约", value: "首触邀约" },
  { label: "门店接待", value: "门店接待" },
  { label: "试乘试驾", value: "试乘试驾" }
]};

const BRAND_MODEL_OPTIONS = {
  "all": [
    { label: "全部", value: "all" },
    { label: "M8", value: "M8" }, { label: "E8", value: "E8" }, { label: "GS8", value: "GS8" },
    { label: "AION Y Plus", value: "AION Y Plus" }, { label: "AION V", value: "AION V" }, { label: "AION S Plus", value: "AION S Plus" }
  ],
  "传祺": [{ label: "全部", value: "all" }, { label: "M8", value: "M8" }, { label: "E8", value: "E8" }, { label: "GS8", value: "GS8" }],
  "埃安": [{ label: "全部", value: "all" }, { label: "AION Y Plus", value: "AION Y Plus" }, { label: "AION V", value: "AION V" }, { label: "AION S Plus", value: "AION S Plus" }]
};

const DATA_MODEL_MAP = {
  "AION Y Plus": "M8",
  "AION V": "S7",
  E9: "E8",
  "昊铂 HT": "GS8"
};

const ORG_TREE = {
  "华南大区": {
    "广州战区": ["广州白云店", "广州天河店", "广州番禺店", "广州增城店"],
    "深圳战区": ["深圳南山店", "深圳龙华店", "深圳宝安店"],
    "佛山战区": ["佛山禅城店", "佛山南海店"],
    "东莞战区": ["东莞莞城店", "东莞虎门店", "东莞长安店"]
  },
  "华东大区": {
    "上海战区": ["上海浦东店", "上海闵行店", "上海嘉定店", "上海松江店"],
    "杭州战区": ["杭州西湖店", "杭州余杭店", "杭州萧山店"],
    "南京战区": ["南京江宁店", "南京建邺店"],
    "苏州战区": ["苏州工业园店", "苏州吴中店", "苏州昆山店"]
  },
  "华北大区": {
    "北京战区": ["北京朝阳店", "北京海淀店", "北京丰台店", "北京通州店"],
    "天津战区": ["天津滨海店", "天津南开店"],
    "石家庄战区": ["石家庄裕华店", "石家庄长安店"],
    "郑州战区": ["郑州金水店", "郑州中原店", "郑州二七店"]
  },
  "华中大区": {
    "武汉战区": ["武汉武昌店", "武汉洪山店", "武汉汉口店"],
    "长沙战区": ["长沙岳麓店", "长沙雨花店", "长沙开福店"],
    "南昌战区": ["南昌红谷店", "南昌青山湖店"]
  },
  "西南大区": {
    "成都战区": ["成都武侯店", "成都锦江店", "成都高新店", "成都龙泉驿店"],
    "重庆战区": ["重庆渝北店", "重庆九龙坡店", "重庆南岸店"],
    "昆明战区": ["昆明官渡店", "昆明盘龙店"]
  },
  "西北大区": {
    "西安战区": ["西安雁塔店", "西安未央店", "西安长安店"],
    "兰州战区": ["兰州城关店", "兰州安宁店"],
    "乌鲁木齐战区": ["乌鲁木齐天山店"]
  },
  "东北大区": {
    "沈阳战区": ["沈阳铁西店", "沈阳皇姑店", "沈阳浑南店"],
    "哈尔滨战区": ["哈尔滨南岗店", "哈尔滨道里店"],
    "长春战区": ["长春朝阳店", "长春南关店"]
  }
};

const MODEL_LABEL_MAP = DATA_MODEL_MAP;

const CATEGORY_META = {
  "抗性点": { color: "red", title: "抗性点 TOP5" },
  "需求特征": { color: "green", title: "需求特征 TOP5" },
  "购车场景": { color: "blue", title: "购车场景 TOP5" },
  "付款方式": { color: "violet", title: "付款方式 TOP5" },
  "置换情况": { color: "green", title: "置换情况 TOP5" },
  "试驾状态": { color: "amber", title: "试驾状态 TOP5" },
  "决策阶段": { color: "amber", title: "决策阶段 TOP5" },
  "预算区间": { color: "blue", title: "预算区间 TOP5" },
  "对比竞品": { color: "amber", title: "对比竞品 TOP5" },
  "购车时间": { color: "violet", title: "购车时间 TOP5" },
  "意向车型": { color: "blue", title: "意向车型 TOP5" },
  "客户职业": { color: "amber", title: "客户职业 TOP5" },
  "用车人": { color: "violet", title: "用车人 TOP5" }
};

const EMPTY_ITEM = {
  name: "暂无明显命中",
  reason: "当前筛选条件下暂未识别到高频标签。",
  count: 0,
  rate: 0
};

const EMPTY_PROFILE_ITEM = {
  name: "暂无命中",
  reason: "客户暂未表达相关信息",
  count: 0,
  rate: 0
};

const CUSTOMER_PROFILE = {
  "抗性点": [{ "价格敏感": "客户觉得价格偏高，需要再考虑" }],
  "需求特征": [{ "空间大": "客户看重车内空间，用于接送孩子" }, { "续航真实": "担心实际续航不够" }],
  "购车场景": [{ "家庭出行": "客户明确表示用于家用接送孩子" }],
  "付款方式": [],
  "置换情况": [],
  "试驾状态": [],
  "决策阶段": [{ "时间未定": "客户表示需要再考虑，未确定具体时间" }],
  "预算区间": [{ "15-20万": "客户询问的车型价格在此区间" }],
  "对比竞品": [],
  "意向车型": [{ "AION Y Plus": "客户询问AION Y Plus" }],
  "购车时间": [{ "下周": "客户约定下周再联系" }],
  "客户职业": [],
  "用车人": [{ "自己": "客户自己开，接送孩子用" }]
};

const PROFILE_CATEGORIES = [
  "抗性点",
  "需求特征",
  "购车场景",
  "付款方式",
  "置换情况",
  "试驾状态",
  "决策阶段",
  "预算区间",
  "对比竞品",
  "意向车型",
  "购车时间",
  "客户职业",
  "用车人"
];

const CLOUD_NODES = [
  { category: "需求特征", preferred: "空间大", tone: "green", icon: "portrait-needs.png", link: "M48 32 Q44 20 43 16" },
  { category: "购车场景", preferred: "家庭出行", tone: "green", icon: "portrait-scenario.png", link: "M32 38 Q22 30 15 25" },
  { category: "预算区间", preferred: "15-20万", tone: "green", icon: "portrait-budget.png", link: "M28 48 Q15 48 12 45" },
  { category: "购车场景", preferred: "接送孩子", tone: "green", icon: "portrait-user.png", link: "M34 62 Q25 70 18 71" },
  { category: "需求特征", preferred: "用车成本低", tone: "green", icon: "portrait-payment.png", link: "M47 68 Q45 80 43 89" },
  { category: "抗性点", preferred: "价格敏感", tone: "red", icon: "portrait-resistance.png", link: "M62 36 Q74 25 82 14" },
  { category: "抗性点", preferred: "续航焦虑", tone: "red", icon: "portrait-time.png", link: "M68 45 Q80 40 90 36" },
  { category: "对比竞品", tone: "red", icon: "portrait-tradein.png", link: "M68 55 Q82 58 92 58" },
  { category: "决策阶段", preferred: "时间未定", tone: "red", icon: "portrait-stage.png", link: "M62 66 Q72 78 78 86" }
];

const RECORDS = [
  {
    id: "REC-0508-001",
    clueCount: 980,
    daysAgo: 1,
    brand: "埃安",
    org: "华东大区",
    store: "上海中心店",
    model: "AION Y Plus",
    level: "B级",
    validCount: 286,
    suggestion: "用家庭接送场景承接空间优势，再解释续航真实数据。",
    tags: {
      "抗性点": [
        { name: "价格敏感", reason: "客户觉得价格偏高，需要再考虑。", count: 72 },
        { name: "续航焦虑", reason: "担心实际续航不够。", count: 46 },
        { name: "品牌认知不足", reason: "对品牌不太了解", count: 28 },
        { name: "等优惠政策", reason: "想等下个月促销", count: 19 },
        { name: "隔音效果差", reason: "试驾时觉得风噪较大", count: 300 }
      ],
      "需求特征": [
        { name: "空间大", reason: "客户看重车内空间，用于接送孩子。", count: 108 },
        { name: "续航真实", reason: "担心实际续航不够，希望看到真实案例。", count: 64 },
        { name: "智能化", reason: "对辅助驾驶和车机有较高要求", count: 52 },
        { name: "用车成本低", reason: "关心充电和保养费用", count: 37 },
        { name: "外观运动", reason: "喜欢运动感强的设计", count: 21 }
      ],
      "购车场景": [
        { name: "家庭出行", reason: "客户明确表示用于家用接送孩子。", count: 119 },
        { name: "接送孩子", reason: "客户反复提到孩子上下学接送。", count: 82 },
        { name: "上下班通勤", reason: "日常上下班代步", count: 65 },
        { name: "周末自驾", reason: "喜欢周末周边游", count: 41 },
        { name: "商务接待", reason: "偶尔用于接送客户", count: 18 }
      ],
      "预算区间": [{ name: "15-20万", reason: "客户询问的车型价格在此区间。", count: 88 }],
      "决策阶段": [{ name: "时间未定", reason: "客户表示需要再考虑，未确定具体时间。", count: 53 }],
      "意向车型": [{ name: "AION Y Plus", reason: "客户询问 AION Y Plus。", count: 132 }],
      "购车时间": [{ name: "下周", reason: "客户约定下周再联系。", count: 51 }],
      "用车人": [{ name: "自己", reason: "客户自己开，接送孩子用。", count: 70 }],
      "对比竞品": []
    }
  },
  {
    id: "REC-0508-002",
    clueCount: 820,
    daysAgo: 3,
    brand: "埃安",
    org: "华东大区",
    store: "上海中心店",
    model: "AION Y Plus",
    level: "B级",
    validCount: 238,
    suggestion: "重点补充权益包和金融方案，降低价格敏感。",
    tags: {
      "抗性点": [{ name: "价格敏感", reason: "客户多次追问优惠和落地价。", count: 65 }, { name: "等优惠政策", reason: "客户希望等下一轮促销。", count: 39 }],
      "需求特征": [{ name: "空间大", reason: "客户关注后排和后备箱空间。", count: 91 }, { name: "用车成本低", reason: "客户比较油车和电车使用成本。", count: 47 }],
      "购车场景": [{ name: "家庭出行", reason: "家庭用车是核心场景。", count: 95 }],
      "预算区间": [{ name: "15-20万", reason: "预算集中在 15-20 万。", count: 76 }],
      "决策阶段": [{ name: "对比中", reason: "客户正在对比同价位车型。", count: 49 }],
      "意向车型": [{ name: "AION Y Plus", reason: "客户明确咨询该车型。", count: 101 }],
      "购车时间": [{ name: "下周", reason: "销售约定下周回访。", count: 43 }],
      "用车人": [{ name: "自己", reason: "客户本人为主要驾驶人。", count: 56 }],
      "对比竞品": [{ name: "比亚迪元 PLUS", reason: "客户提及同价位竞品。", count: 32 }]
    }
  },
  {
    id: "REC-0507-003",
    clueCount: 650,
    daysAgo: 4,
    brand: "埃安",
    org: "华东大区",
    store: "杭州旗舰店",
    model: "AION V",
    level: "A级",
    validCount: 196,
    suggestion: "安排试驾路线覆盖高速和城市路况，验证真实续航。",
    tags: {
      "抗性点": [{ name: "续航焦虑", reason: "客户担心高速续航衰减。", count: 58 }, { name: "品牌认知不足", reason: "客户询问售后网点覆盖。", count: 28 }],
      "需求特征": [{ name: "续航真实", reason: "客户优先关注真实续航。", count: 85 }, { name: "智能化", reason: "客户关注辅助驾驶。", count: 44 }],
      "购车场景": [{ name: "上下班通勤", reason: "日常通勤距离固定。", count: 69 }, { name: "城市代步", reason: "工作日城区使用。", count: 35 }],
      "预算区间": [{ name: "20-25万", reason: "客户询问中高配车型价格。", count: 58 }],
      "决策阶段": [{ name: "准备试驾", reason: "客户已进入试驾阶段。", count: 74 }],
      "意向车型": [{ name: "AION V", reason: "客户询问 AION V 续航和智驾。", count: 88 }],
      "购车时间": [{ name: "本周", reason: "客户计划本周到店。", count: 52 }],
      "用车人": [{ name: "自己", reason: "客户本人通勤驾驶。", count: 47 }],
      "对比竞品": [{ name: "深蓝 S07", reason: "客户提及续航配置对比。", count: 24 }]
    }
  },
  {
    id: "REC-0506-004",
    clueCount: 590,
    daysAgo: 5,
    brand: "埃安",
    org: "华东大区",
    store: "宁波南区店",
    model: "AION Y Plus",
    level: "C级",
    validCount: 172,
    suggestion: "先建立品牌与保值信任，再邀约到店体验空间。",
    tags: {
      "抗性点": [{ name: "品牌认知不足", reason: "客户对品牌保值与售后网络仍有顾虑。", count: 48 }, { name: "价格敏感", reason: "客户处于早期比价。", count: 41 }],
      "需求特征": [{ name: "空间大", reason: "客户关注家庭乘坐舒适性。", count: 57 }, { name: "后排舒适", reason: "客户关注老人乘坐。", count: 39 }],
      "购车场景": [{ name: "家庭出行", reason: "客户主要家用。", count: 61 }],
      "预算区间": [{ name: "15-20万", reason: "客户询问入门和中配落地价。", count: 50 }],
      "决策阶段": [{ name: "初步了解", reason: "客户仅了解车型和价格。", count: 63 }],
      "意向车型": [{ name: "AION Y Plus", reason: "客户询问 AION Y Plus。", count: 59 }],
      "购车时间": [{ name: "时间未定", reason: "客户未明确再次联系时间。", count: 45 }],
      "用车人": [{ name: "家人", reason: "车辆将给家人共同使用。", count: 34 }],
      "对比竞品": []
    }
  },
  {
    id: "REC-0503-005",
    clueCount: 410,
    daysAgo: 8,
    brand: "埃安",
    org: "华东大区",
    store: "上海中心店",
    model: "AION S Plus",
    level: "战败",
    validCount: 112,
    suggestion: "结合家庭出行和低用车成本，推动本周二次邀约。",
    tags: {
      "抗性点": [
        { name: "价格敏感", reason: "客户要求更多金融政策。", count: 77 },
        { name: "担心保值率", reason: "客户关注三年后残值。", count: 34 },
        { name: "续航焦虑", reason: "高速行驶担心耗电快", count: 60 },
        { name: "品牌认知不足", reason: "对售后没信心", count: 40 },
        { name: "内饰不喜欢", reason: "想要浅色内饰", count: 5 }
      ],
      "需求特征": [
        { name: "空间大", reason: "客户对后排空间评价积极。", count: 112 },
        { name: "用车成本低", reason: "客户关注电耗和保养费用。", count: 69 },
        { name: "续航真实", reason: "多次询问真实续航达成率", count: 80 },
        { name: "智能化", reason: "体验了自动泊车", count: 45 },
        { name: "外观运动", reason: "觉得轮毂好看", count: 30 }
      ],
      "购车场景": [
        { name: "家庭出行", reason: "周末家庭出行需求明确。", count: 121 },
        { name: "接送孩子", reason: "顺带接送孩子", count: 90 },
        { name: "上下班通勤", reason: "工作日通勤", count: 50 },
        { name: "周末自驾", reason: "问了外放电功能", count: 30 },
        { name: "网约车", reason: "问了营运政策", count: 10 }
      ],
      "预算区间": [{ name: "15-20万", reason: "客户预算贴近 AION Y Plus 主销价格。", count: 94 }],
      "决策阶段": [{ name: "对比中", reason: "客户仍在横向比较。", count: 57 }],
      "意向车型": [{ name: "AION Y Plus", reason: "主询车型为 AION Y Plus。", count: 136 }],
      "购车时间": [{ name: "下周", reason: "客户接受下周回访。", count: 49 }],
      "用车人": [{ name: "自己", reason: "客户本人驾驶为主。", count: 76 }],
      "对比竞品": [{ name: "比亚迪元 PLUS", reason: "客户比较价格和空间。", count: 38 }]
    }
  },
  {
    id: "REC-0502-006",
    clueCount: 720,
    daysAgo: 10,
    brand: "传祺",
    org: "华东大区",
    store: "上海中心店",
    model: "E9",
    level: "A级",
    validCount: 205,
    suggestion: "强化商务接待和家庭兼用配置，安排高配试驾。",
    tags: {
      "抗性点": [{ name: "价格敏感", reason: "客户关注高配落地价。", count: 52 }, { name: "等优惠政策", reason: "客户想等置换补贴。", count: 36 }],
      "需求特征": [{ name: "智能化", reason: "客户关注座舱语音和辅助驾驶体验。", count: 73 }, { name: "后排舒适", reason: "客户关注二排乘坐体验。", count: 61 }],
      "购车场景": [{ name: "商务接待", reason: "客户用于公司接待和家庭兼用。", count: 79 }],
      "预算区间": [{ name: "30万以上", reason: "客户接受更高预算但关注权益。", count: 67 }],
      "决策阶段": [{ name: "准备试驾", reason: "客户计划体验二排和智能化。", count: 68 }],
      "意向车型": [{ name: "E9", reason: "客户询问 E9 家用与商务兼顾。", count: 91 }],
      "购车时间": [{ name: "本周", reason: "客户计划本周到店。", count: 46 }],
      "用车人": [{ name: "自己", reason: "客户本人和公司共同使用。", count: 45 }],
      "对比竞品": [{ name: "腾势 D9", reason: "客户提到商务 MPV 竞品。", count: 31 }]
    }
  },
  {
    id: "REC-0501-007",
    clueCount: 680,
    daysAgo: 13,
    brand: "传祺",
    org: "华东大区",
    store: "杭州旗舰店",
    model: "E8",
    level: "战败",
    validCount: 198,
    suggestion: "突出权益和置换政策，把预算疑虑转化为方案对比。",
    tags: {
      "抗性点": [{ name: "等优惠政策", reason: "客户等待置换补贴和大客户权益。", count: 50 }, { name: "价格敏感", reason: "客户要求落地价可控。", count: 45 }],
      "需求特征": [{ name: "后排舒适", reason: "客户重点体验二排座椅。", count: 68 }, { name: "智能化", reason: "客户关注车机和辅助驾驶。", count: 51 }],
      "购车场景": [{ name: "商务接待", reason: "公司接待场景明确。", count: 62 }, { name: "家庭出行", reason: "周末家庭共用。", count: 35 }],
      "预算区间": [{ name: "30万以上", reason: "客户预算与 E9 主销版本匹配。", count: 59 }],
      "决策阶段": [{ name: "价格谈判", reason: "客户进入权益和报价沟通。", count: 58 }],
      "意向车型": [{ name: "E9", reason: "客户反复询问 E9。", count: 80 }],
      "购车时间": [{ name: "本月", reason: "客户希望本月确认。", count: 44 }],
      "用车人": [{ name: "家人", reason: "家庭与商务共同使用。", count: 33 }],
      "对比竞品": [{ name: "腾势 D9", reason: "客户关注同级 MPV。", count: 29 }]
    }
  },
  {
    id: "REC-0430-008",
    clueCount: 560,
    daysAgo: 18,
    brand: "昊铂",
    org: "华东大区",
    store: "宁波南区店",
    model: "昊铂 HT",
    level: "B级",
    validCount: 168,
    suggestion: "建立品牌科技感和售后信任，补充智驾体验证据。",
    tags: {
      "抗性点": [{ name: "品牌认知不足", reason: "客户对品牌保值与售后网络仍有顾虑。", count: 57 }, { name: "价格敏感", reason: "客户认为权益需要更清楚。", count: 34 }],
      "需求特征": [{ name: "配置丰富", reason: "客户关注舒适配置和科技感。", count: 75 }, { name: "智能化", reason: "客户关注高阶辅助驾驶。", count: 52 }],
      "购车场景": [{ name: "城市代步", reason: "客户以城区出行为主。", count: 54 }],
      "预算区间": [{ name: "20-25万", reason: "客户询问中高配价格。", count: 49 }],
      "决策阶段": [{ name: "对比中", reason: "客户同时比较其他新能源 SUV。", count: 45 }],
      "意向车型": [{ name: "昊铂 HT", reason: "客户询问昊铂 HT。", count: 72 }],
      "购车时间": [{ name: "时间未定", reason: "客户需要再考虑。", count: 39 }],
      "用车人": [{ name: "自己", reason: "客户本人驾驶。", count: 38 }],
      "对比竞品": [{ name: "特斯拉 Model Y", reason: "客户提及品牌与智驾对比。", count: 22 }]
    }
  },
  {
    id: "REC-0429-009",
    clueCount: 490,
    daysAgo: 21,
    brand: "埃安",
    org: "华东大区",
    store: "上海中心店",
    model: "AION V",
    level: "B级",
    validCount: 146,
    suggestion: "用真实续航案例和补能便利性承接需求。",
    tags: {
      "抗性点": [{ name: "续航焦虑", reason: "客户关心冬夏续航差异。", count: 43 }],
      "需求特征": [{ name: "续航真实", reason: "客户关注真实续航和补能。", count: 62 }, { name: "空间大", reason: "客户也关注后排空间。", count: 34 }],
      "购车场景": [{ name: "上下班通勤", reason: "客户日常通勤距离固定。", count: 50 }],
      "预算区间": [{ name: "20-25万", reason: "客户咨询中配落地价。", count: 42 }],
      "决策阶段": [{ name: "对比中", reason: "客户仍在看同级 SUV。", count: 40 }],
      "意向车型": [{ name: "AION V", reason: "客户询问 AION V。", count: 66 }],
      "购车时间": [{ name: "下周", reason: "销售约定下周跟进。", count: 31 }],
      "用车人": [{ name: "自己", reason: "本人通勤使用。", count: 36 }],
      "对比竞品": [{ name: "深蓝 S07", reason: "客户比较 SUV。", count: 21 }]
    }
  },
  {
    id: "REC-0426-010",
    clueCount: 730,
    daysAgo: 24,
    brand: "埃安",
    org: "华东大区",
    store: "杭州旗舰店",
    model: "AION Y Plus",
    level: "B级",
    validCount: 214,
    suggestion: "突出空间与低成本优势，补齐价格权益说明。",
    tags: {
      "抗性点": [{ name: "价格敏感", reason: "客户希望争取更大优惠。", count: 60 }, { name: "担心保值率", reason: "客户关注二手残值。", count: 31 }],
      "需求特征": [{ name: "空间大", reason: "客户对车内空间兴趣最高。", count: 83 }, { name: "用车成本低", reason: "客户关注后续养车成本。", count: 52 }],
      "购车场景": [{ name: "家庭出行", reason: "家用接送和周末出游。", count: 88 }],
      "预算区间": [{ name: "15-20万", reason: "客户预算位于主销区间。", count: 71 }],
      "决策阶段": [{ name: "时间未定", reason: "客户未确定购买时间。", count: 46 }],
      "意向车型": [{ name: "AION Y Plus", reason: "客户主询车型。", count: 97 }],
      "购车时间": [{ name: "时间未定", reason: "客户需要和家人商量。", count: 38 }],
      "用车人": [{ name: "家人", reason: "主要给家人接送使用。", count: 42 }],
      "对比竞品": [{ name: "比亚迪元 PLUS", reason: "客户比价。", count: 26 }]
    }
  }
];

const state = {
  brand: "传祺",
  region: "all",
  zone: "all",
  store: "all",
  scene: "all",
  time: "7",
  model: "M8",
  selectedCategory: "需求特征",
  selectedName: "空间大",
  rankView: "cloud",
  heatmapPage: 1
};

const normalizeRecordsForFactoryFilters = () => {
  const orgEntries = Object.entries(ORG_TREE).flatMap(([region, zones]) => (
    Object.entries(zones).flatMap(([zone, stores]) => stores.map(store => ({ region, zone, store })))
  ));

  RECORDS.forEach((record, index) => {
    const factoryModel = MODEL_LABEL_MAP[record.model] || record.model;
    record.model = factoryModel;
    if (record.brand === "昊铂") record.brand = "埃安";
    if (index === 0) record.brand = "传祺";

    const org = orgEntries[index % orgEntries.length];
    record.org = org.region;
    record.zone = org.zone;
    record.store = org.store;

    const scenes = ["首触邀约", "门店接待", "试乘试驾"];
    record.scene = scenes[index % scenes.length];

    // 模拟线索ID，部分线索会在多条录音中重复命中
    const clueIds = [];
    const clueBase = index * 600;
    for (let ci = 0; ci < record.clueCount; ci++) {
      // 前30%的线索ID使用公共池（模拟跨录音重复）
      if (ci < record.clueCount * 0.3) {
        clueIds.push(`CLUE-${ci % 200}`);
      } else {
        clueIds.push(`CLUE-${clueBase + ci}`);
      }
    }
    record.clueIds = clueIds;

    if (record.tags["意向车型"]) {
      record.tags["意向车型"].forEach(tag => {
        const tagModel = MODEL_LABEL_MAP[tag.name] || tag.name;
        tag.name = tagModel;
        tag.reason = tag.reason.replace(/AION Y Plus|AION V|昊铂 HT|E9/g, match => MODEL_LABEL_MAP[match] || match);
      });
    }
  });
};

normalizeRecordsForFactoryFilters();

const formatNumber = value => new Intl.NumberFormat("zh-CN").format(value);

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const timeLimit = time => {
  if (time === "1") return 1;
  if (time === "7") return 7;
  if (time === "15") return 15;
  if (time === "30") return 30;
  return 30;
};

const timeText = time => ({
  1: "昨日",
  7: "近7天",
  15: "近半月",
  30: "近1月",
  custom: "自定义"
})[time] || "昨日";

const periodText = time => ({
  1: "2026.05.07",
  7: "2026.05.02 - 2026.05.08",
  15: "2026.04.24 - 2026.05.08",
  30: "2026.04.09 - 2026.05.08",
  custom: "自定义时间"
})[time] || "2026.05.07";

const modelFilterValue = () => DATA_MODEL_MAP[state.model] || state.model;

const currentModelOptions = () => BRAND_MODEL_OPTIONS[state.brand] || [{ label: "全部", value: "all" }];

const currentModelFilter = () => ({
  key: "model",
  label: "车型",
  options: currentModelOptions()
});

const ensureValidModelForBrand = () => {
  if (!currentModelOptions().some(option => option.value === state.model)) {
    state.model = "all";
  }
};

const matchesState = record => {
  const passTime = record.daysAgo <= timeLimit(state.time);
  const passBrand = state.brand === "all" || record.brand === state.brand;
  const passRegion = state.region === "all" || record.org === state.region;
  const passZone = state.zone === "all" || record.zone === state.zone;
  const passStore = state.store === "all" || record.store === state.store;
  const passModel = state.model === "all" || record.model === modelFilterValue();
  const passScene = state.scene === "all" || record.scene === state.scene;
  return passTime && passBrand && passRegion && passZone && passStore && passModel && passScene;
};

const getFilteredRecords = () => RECORDS.filter(matchesState);

const aggregateCategory = (records, category) => {
  const map = new Map();
  records.forEach(record => {
    (record.tags[category] || []).forEach(tag => {
      const item = map.get(tag.name) || { name: tag.name, reason: tag.reason, count: 0, sources: 0 };
      item.count += tag.count;
      item.sources += 1;
      if (tag.reason.length > item.reason.length) item.reason = tag.reason;
      map.set(tag.name, item);
    });
  });
  const total = records.reduce((sum, record) => {
    return sum + (record.tags[category] || []).reduce((tagSum, tag) => tagSum + tag.count, 0);
  }, 0);
  return [...map.values()]
    .map(item => ({ ...item, rate: total ? Math.round((item.count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
};

const topOf = (records, category) => aggregateCategory(records, category)[0] || EMPTY_ITEM;

const getTopRecord = records => {
  return records
    .map(record => {
      const candidates = Object.entries(record.tags).flatMap(([category, tags]) => tags.map(tag => ({ ...tag, category })));
      const topTag = candidates.sort((a, b) => b.count - a.count)[0] || { name: "暂无", category: "暂无", count: 0 };
      return { record, topTag };
    })
    .sort((a, b) => b.topTag.count - a.topTag.count)[0];
};

const getTrend = (current, previous) => {
  if (!previous) return { text: "无对比", tone: "flat" };
  const diff = Math.round(((current - previous) / previous) * 100);
  if (diff > 0) return { text: `↑${diff}%`, tone: "green" };
  if (diff < 0) return { text: `↓${Math.abs(diff)}%`, tone: "red" };
  return { text: "持平", tone: "flat" };
};

const getRateTrend = (item, category, previousRecords) => {
  if (!item.count) return { text: "无对比", tone: "flat" };
  const previousItem = aggregateCategory(previousRecords, category).find(tag => tag.name === item.name);
  if (!previousItem) return { text: "无对比", tone: "flat" };
  const diff = item.rate - previousItem.rate;
  if (diff > 0) return { text: `↑${diff}%`, tone: "green" };
  if (diff < 0) return { text: `↓${Math.abs(diff)}%`, tone: "red" };
  return { text: "持平", tone: "flat" };
};

const getProfileTrend = (item, category, previousRecords) => {
  if (!item.count) return { text: "未命中", tone: "flat", direction: "flat" };
  const previousItem = aggregateCategory(previousRecords, category).find(tag => tag.name === item.name);
  if (!previousItem) return { text: "无对比", tone: "flat", direction: "flat" };
  const diff = item.rate - previousItem.rate;
  if (diff > 0) return { text: `↑${diff}%`, tone: "green", direction: "up" };
  if (diff < 0) return { text: `↓${Math.abs(diff)}%`, tone: "red", direction: "down" };
  return { text: "持平", tone: "flat", direction: "flat" };
};

const getProfileSnapshot = (records, category, previousRecords = getPreviousRecords()) => {
  const item = topOf(records, category);
  const normalizedItem = item.count ? item : EMPTY_PROFILE_ITEM;
  return {
    ...normalizedItem,
    trend: getProfileTrend(normalizedItem, category, previousRecords)
  };
};

const getCloudSnapshot = (records, config, previousRecords = getPreviousRecords()) => {
  const items = aggregateCategory(records, config.category);
  const preferredItem = config.preferred ? items.find(item => item.name === config.preferred) : null;
  const item = preferredItem || items[0] || EMPTY_PROFILE_ITEM;
  const normalizedItem = item.count ? item : EMPTY_PROFILE_ITEM;
  return {
    category: config.category,
    tone: config.tone,
    icon: `../AI质检平台4.29/assets/${config.icon}`,
    link: config.link,
    item: {
      ...normalizedItem,
      trend: getProfileTrend(normalizedItem, config.category, previousRecords)
    }
  };
};

const getPreviousRecords = () => {
  const currentLimit = timeLimit(state.time);
  return RECORDS.filter(record => {
    const passPreviousWindow = record.daysAgo > currentLimit && record.daysAgo <= currentLimit + 7;
    const passBrand = state.brand === "all" || record.brand === state.brand;
    const passRegion = state.region === "all" || record.org === state.region;
    const passZone = state.zone === "all" || record.zone === state.zone;
    const passStore = state.store === "all" || record.store === state.store;
    const passModel = state.model === "all" || record.model === modelFilterValue();
    const passScene = state.scene === "all" || record.scene === state.scene;
    return passPreviousWindow && passBrand && passRegion && passZone && passStore && passModel && passScene;
  });
};

const buildMetrics = records => {
  const previous = getPreviousRecords();
  const validCount = records.reduce((sum, record) => sum + record.validCount, 0);
  const previousCount = previous.reduce((sum, record) => sum + record.validCount, 0);
  const validTrend = getTrend(validCount, previousCount);

  const totalRecords = records.length;
  const highIntentRecords = records.filter(record => record.level === "A级" || record.level === "B级");
  const highIntentRate = totalRecords ? ((highIntentRecords.length / totalRecords) * 100).toFixed(1) : 0;
  const prevTotal = previous.length;
  const prevHighIntent = previous.filter(record => record.level === "A级" || record.level === "B级");
  const prevHighRate = prevTotal ? ((prevHighIntent.length / prevTotal) * 100).toFixed(1) : 0;
  const highIntentTrend = getTrendPercent(parseFloat(highIntentRate), parseFloat(prevHighRate));

  const resistance = topOf(records, "抗性点");
  const resistanceTrend = getRateTrend(resistance, "抗性点", previous);

  const need = topOf(records, "需求特征");
  const needTrend = getRateTrend(need, "需求特征", previous);

  const highIntentCount = highIntentRecords.reduce((sum, record) => sum + record.validCount, 0);
  const prevHighIntentCount = prevHighIntent.reduce((sum, record) => sum + record.validCount, 0);
  const highIntentCountTrend = getTrend(highIntentCount, prevHighIntentCount);

  const scene = topOf(records, "购车场景");
  const sceneTrend = getRateTrend(scene, "购车场景", previous);

  const competitor = topOf(records, "对比竞品");
  const competitorTrend = getRateTrend(competitor, "对比竞品", previous);

  // 线索数：去重统计，1条线索命中多条录音记作1条
  const clueSet = new Set();
  records.forEach(r => (r.clueIds || []).forEach(id => clueSet.add(id)));
  const clueCount = clueSet.size;

  const prevClueSet = new Set();
  previous.forEach(r => (r.clueIds || []).forEach(id => prevClueSet.add(id)));
  const prevClueCount = prevClueSet.size;

  const clueTrend = getTrend(clueCount, prevClueCount);

  // 录音覆盖率 = 有效录音数 / 线索数（1条线索命中多条录音记作1条）
  const coverageRate = clueCount ? ((validCount / clueCount) * 100).toFixed(1) : 0;
  const prevCoverageRate = prevClueCount ? ((previousCount / prevClueCount) * 100).toFixed(1) : 0;
  const coverageTrend = getTrendPercent(parseFloat(coverageRate), parseFloat(prevCoverageRate));

  return [
    {
      title: "有效录音数",
      value: formatNumber(validCount),
      copy: "有效录音的数量",
      trendValue: validTrend.text,
      trendTone: validTrend.tone === "green" ? "blue" : validTrend.tone,
      sparkColor: "#2563eb",
      valueColor: "blue",
      metricType: "count",
      rawValue: validCount
    },
    {
      title: "AI高意向数",
      value: formatNumber(highIntentCount),
      copy: "AI意向等级评定为高的录音数量",
      trendValue: highIntentCountTrend.text,
      trendTone: highIntentCountTrend.tone,
      sparkColor: "#16a765",
      valueColor: "green",
      metricType: "count",
      rawValue: highIntentCount
    },
    {
      title: "线索数",
      value: formatNumber(clueCount),
      copy: "线索ID去重的数量",
      trendValue: clueTrend.text,
      trendTone: clueTrend.tone,
      sparkColor: "#6366f1",
      metricType: "count",
      rawValue: clueCount
    },
    {
      title: "录音覆盖率",
      value: `${coverageRate}%`,
      copy: "有效录音数/线索数",
      trendValue: coverageTrend.text,
      trendTone: coverageTrend.tone,
      sparkColor: "#f59e0b",
      metricType: "rate",
      rawValue: parseFloat(coverageRate)
    },
    {
      title: "TOP1需求特征",
      value: need.name,
      copy: `${formatNumber(need.count)}/${need.rate}% ${needTrend.text}`,
      sparkColor: "#16a765",
      valueColor: "green",
      metricType: "rate",
      rawValue: need.rate
    },
    {
      title: "TOP1抗性点",
      value: resistance.name,
      copy: `${formatNumber(resistance.count)}/${resistance.rate}% ${resistanceTrend.text}`,
      sparkColor: "#ef4444",
      valueColor: "red",
      metricType: "rate",
      rawValue: resistance.rate
    },
    {
      title: "TOP1购车场景",
      value: scene.name,
      copy: `${formatNumber(scene.count)}/${scene.rate}% ${sceneTrend.text}`,
      sparkColor: "#2563eb",
      valueColor: "blue",
      metricType: "rate",
      rawValue: scene.rate
    },
    {
      title: "TOP1对比竞品",
      value: competitor.name,
      copy: `${formatNumber(competitor.count)}/${competitor.rate}% ${competitorTrend.text}`,
      sparkColor: "#ef4444",
      valueColor: "red",
      metricType: "rate",
      rawValue: competitor.rate
    }
  ];
};

const getTrendPercent = (current, previous) => {
  if (!previous) return { text: "无对比", tone: "flat" };
  const diff = current - previous;
  if (diff > 0) return { text: `↑${diff.toFixed(1)}%`, tone: "green" };
  if (diff < 0) return { text: `↓${Math.abs(diff).toFixed(1)}%`, tone: "red" };
  return { text: "持平", tone: "flat" };
};

const renderFilters = () => {
  ensureValidModelForBrand();
  const filterGrid = document.querySelector("#filterGrid");
  filterGrid.innerHTML = `
    ${tabFilterMarkup(FILTERS[0], "gf-brand-group")}
    ${orgFilterMarkup()}
    ${tabFilterMarkup(SCENE_FILTER)}
    ${tabFilterMarkup(FILTERS[1])}
    ${tabFilterMarkup(currentModelFilter())}
  `;
};

const tabFilterMarkup = (group, extraClass = "") => `
  <div class="gf-group ${extraClass}">
    <span class="gf-label">${group.label}</span>
    <div class="gf-tabs">
      ${group.options.map(option => `
        <button class="gf-tab ${state[group.key] === option.value ? "active" : ""}" data-filter="${group.key}" data-value="${escapeHtml(option.value)}" type="button">
          ${option.value === "custom" ? calendarIconMarkup() : ""}${escapeHtml(option.label)}
        </button>
      `).join("")}
    </div>
  </div>
`;

const orgFilterMarkup = () => `
  <div class="gf-group gf-org-group">
    <span class="gf-label">组织</span>
    <select class="gf-select" data-org-filter="region" aria-label="大区筛选">
      <option value="all">全国</option>
      ${Object.keys(ORG_TREE).map(region => `<option value="${escapeHtml(region)}" ${state.region === region ? "selected" : ""}>${escapeHtml(region)}</option>`).join("")}
    </select>
    <select class="gf-select" data-org-filter="zone" aria-label="战区筛选">
      <option value="all">全部战区</option>
      ${orgZoneOptions()}
    </select>
    <select class="gf-select" data-org-filter="store" aria-label="门店筛选">
      <option value="all">全部门店</option>
      ${orgStoreOptions()}
    </select>
  </div>
`;

const orgZoneOptions = () => {
  if (state.region === "all") return "";
  return Object.keys(ORG_TREE[state.region] || {})
    .map(zone => `<option value="${escapeHtml(zone)}" ${state.zone === zone ? "selected" : ""}>${escapeHtml(zone)}</option>`)
    .join("");
};

const orgStoreOptions = () => {
  if (state.region === "all" || state.zone === "all") return "";
  return (ORG_TREE[state.region]?.[state.zone] || [])
    .map(store => `<option value="${escapeHtml(store)}" ${state.store === store ? "selected" : ""}>${escapeHtml(store)}</option>`)
    .join("");
};

const calendarIconMarkup = () => `
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
`;

const metricMarkup = (metric, index) => {
  const valueClass = metric.valueColor || "";
  const hasTrend = metric.trendValue && metric.trendTone;
  const trendTone = metric.trendTone || "flat";
  const arrowDir = trendTone === "green" ? "up" : trendTone === "red" ? "down" : trendTone;
  const trendRow = hasTrend ? `
      <div class="metric-trend-row">
        <span class="metric-trend-arrow ${arrowDir}">${escapeHtml(metric.trendValue)}</span>
        <span class="metric-trend-label">较上期</span>
      </div>` : "";
  return `
    <article class="metric-card">
      <div class="metric-head">${escapeHtml(metric.title)}<span class="ai-mini">AI分析</span></div>
      <div class="metric-value ${valueClass}">${escapeHtml(metric.value)}</div>
      <div class="metric-copy">${escapeHtml(metric.copy)}</div>${trendRow}
      <svg class="spark spark-clickable" viewBox="0 0 86 34" aria-hidden="true" data-metric-index="${index}" title="点击查看趋势详情">
        <path d="${metric.sparkPath || 'M2 27 C10 14, 18 20, 25 17 S38 26, 45 13 S57 17, 64 7 S75 20, 84 10'}" fill="none" stroke="${metric.sparkColor}" stroke-width="2.2" stroke-linecap="round"></path>
      </svg>
    </article>
  `;
};

const rankBlock = (category, items, previousRecords) => {
  const meta = CATEGORY_META[category] || CATEGORY_META["需求特征"];
  let rows = items.slice(0, 5);
  // Remove padding to not show empty items
  if (rows.length === 0) {
    rows = [EMPTY_PROFILE_ITEM];
  }
  return `
    <section class="rank-block profile-rank-block" aria-label="${escapeHtml(meta.title)}">
      <h3>${escapeHtml(meta.title)}<span class="question">?</span></h3>
      <div class="rank-list">
        ${rows.map((item, index) => {
    const normalizedItem = item.count ? item : EMPTY_PROFILE_ITEM;
    const trend = getProfileTrend(normalizedItem, category, previousRecords);
    const isSelected = state.selectedCategory === category && state.selectedName === normalizedItem.name;
    return `
            <button class="rank-item profile-rank-row ${isSelected ? "active" : ""}" type="button" data-category="${escapeHtml(category)}" data-name="${escapeHtml(normalizedItem.name)}" title="${escapeHtml(normalizedItem.reason)}">
              <span class="rank-num rank-${index + 1}">${index + 1}</span>
              <span class="rank-name ${normalizedItem.count ? meta.color : "flat"}">${escapeHtml(normalizedItem.name)}</span>
              <span class="rank-rate">${normalizedItem.rate}%</span>
              <span class="rank-trend ${trend.tone}">${escapeHtml(trend.text)}</span>
            </button>
          `;
  }).join("")}
      </div>
    </section>
  `;
};

const profileBlock = (category, records, previousRecords) => {
  const meta = CATEGORY_META[category] || CATEGORY_META["需求特征"];
  const item = getProfileSnapshot(records, category, previousRecords);
  return `
    <button class="profile-block" type="button" data-category="${escapeHtml(category)}" data-name="${escapeHtml(item.name)}">
      <h3>${escapeHtml(category)}</h3>
      <div class="profile-list">
        <div class="profile-item ${item.count ? "" : "empty"}">
          <div class="profile-item-head">
            <span class="profile-tag ${item.count ? meta.color : "flat"}">${escapeHtml(item.name)}</span>
            <span class="profile-hit-rate">命中率 ${item.rate}%</span>
          </div>
          <p>${escapeHtml(item.reason)}</p>
          <span class="profile-trend ${item.trend.tone}">${escapeHtml(item.trend.text)}</span>
        </div>
      </div>
    </button>
  `;
};

const trendGlyph = trend => {
  if (trend.direction === "down") return "↓";
  if (trend.direction === "flat") return "→";
  return "↑";
};

const portraitLinksMarkup = snapshots => `
  <defs>
    <marker id="portraitArrowGreen" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
      <path d="M0,0 L4,2 L0,4" fill="none" stroke="#32d778" stroke-width="0.8"></path>
    </marker>
    <marker id="portraitArrowRed" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
      <path d="M0,0 L4,2 L0,4" fill="none" stroke="#ff6b6b" stroke-width="0.8"></path>
    </marker>
  </defs>
  ${snapshots.map(snapshot => `
    <path d="${snapshot.link}" stroke="${snapshot.tone === "red" ? "#ff6b6b" : "#32d778"}" marker-end="url(#portraitArrow${snapshot.tone === "red" ? "Red" : "Green"})"></path>
  `).join("")}
`;

const portraitNodeMarkup = (snapshot, index) => {
  const { category, item, tone, icon } = snapshot;
  const isActive = state.selectedCategory === category && state.selectedName === item.name;
  const colorClass = item.count ? tone : "flat";
  return `
    <button class="portrait-node ${colorClass} node-pos-${index} ${isActive ? "active" : ""}" type="button" data-category="${escapeHtml(category)}" data-name="${escapeHtml(item.name)}">
      <span class="portrait-icon"><img src="${escapeHtml(icon)}" alt="" /></span>
      <span class="portrait-category">${escapeHtml(category)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <span class="portrait-rate">出现率 ${item.rate}% <span class="portrait-trend ${item.trend.tone}" title="${escapeHtml(item.trend.text)}">${trendGlyph(item.trend)}</span></span>
    </button>
  `;
};

const renderPortrait = records => {
  const previousRecords = getPreviousRecords();

  const allTags = [];
  PROFILE_CATEGORIES.forEach(category => {
    const items = aggregateCategory(records, category);
    items.forEach(item => {
      if (item.count > 0 && item.rate > 20) {
        allTags.push({ ...item, category, meta: CATEGORY_META[category] || CATEGORY_META["需求特征"] });
      }
    });
  });

  allTags.sort((a, b) => b.count - a.count); // Sort by highest count

  // Limit to maximum 14 tags to prevent severe overlap
  if (allTags.length > 14) {
    allTags.splice(14);
  }

  // If no items have > 20% rate, just use top 5 of anything to avoid empty state
  if (allTags.length === 0) {
    PROFILE_CATEGORIES.forEach(category => {
      const items = aggregateCategory(records, category);
      if (items[0] && items[0].count > 0) {
        allTags.push({ ...items[0], category, meta: CATEGORY_META[category] || CATEGORY_META["需求特征"] });
      }
    });
    allTags.sort((a, b) => b.rate - a.rate);
    allTags.splice(6); // Keep at most 6
  }

  const ICONS = {
    "需求特征": "portrait-needs.png",
    "购车场景": "portrait-scenario.png",
    "预算区间": "portrait-budget.png",
    "用车人": "portrait-user.png",
    "抗性点": "portrait-resistance.png",
    "决策阶段": "portrait-stage.png",
    "对比竞品": "portrait-tradein.png",
    "付款方式": "portrait-payment.png"
  };

  const snapshots = allTags.map(tag => {
    return {
      category: tag.category,
      tone: tag.meta.color,
      icon: `../AI质检平台4.29/assets/${ICONS[tag.category] || "portrait-needs.png"}`,
      item: {
        ...tag,
        trend: getProfileTrend(tag, tag.category, previousRecords)
      }
    };
  });

  const selectedStillVisible = snapshots.some(snapshot => (
    snapshot.category === state.selectedCategory && snapshot.item.name === state.selectedName
  ));

  if (!records.length) {
    state.selectedCategory = "需求特征";
    state.selectedName = EMPTY_PROFILE_ITEM.name;
  } else if (!selectedStillVisible && snapshots.length > 0) {
    state.selectedCategory = snapshots[0].category;
    state.selectedName = snapshots[0].item.name;
  }

  const orgText = [state.region === "all" ? "全国" : state.region, state.zone === "all" ? "" : state.zone, state.store === "all" ? "" : state.store]
    .filter(Boolean)
    .join(" / ");
  const modelText = state.model === "all" ? "全部车型" : state.model;
  document.querySelector("#portraitSubtext").textContent = `${state.brand} / ${orgText} / ${timeText(state.time)} / ${modelText}`;

  const centerCarName = document.querySelector("#centerCarName");
  if (centerCarName) {
    centerCarName.textContent = state.model === "all" ? (state.brand === "all" ? "全部车型" : state.brand) : state.model;
  }

  // Clear the links (remove dashed arrows)
  document.querySelector("#portraitLinks").innerHTML = "";

  // Render nodes in a circle with alternating radii for density
  const total = snapshots.length;
  const baseRx = 39; // Max x radius in percentage
  const baseRy = 37; // Max y radius in percentage

  document.querySelector("#portraitNodeSet").innerHTML = snapshots.map((snapshot, index) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // start from top

    // Stagger layout: odd nodes move slightly inward if there are many nodes
    const isInner = total > 8 && index % 2 !== 0;
    const rx = isInner ? baseRx - 10 : baseRx;
    const ry = isInner ? baseRy - 9 : baseRy;

    const left = 50 + Math.cos(angle) * rx;
    const top = 50 + Math.sin(angle) * ry;

    const { category, item, tone, icon } = snapshot;
    const isActive = state.selectedCategory === category && state.selectedName === item.name;
    const colorClass = item.count ? tone : "flat";

    return `
      <button class="portrait-node ${colorClass} ${isActive ? "active" : ""}" style="left: calc(${left}% - 76px); top: calc(${top}% - 35px);" type="button" data-category="${escapeHtml(category)}" data-name="${escapeHtml(item.name)}">
        <span class="portrait-icon"><img src="${escapeHtml(icon)}" alt="" /></span>
        <span class="portrait-category">${escapeHtml(category)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="portrait-rate">${item.count}/${item.rate}%</span>
        <span class="portrait-trend ${item.trend.tone}">${escapeHtml(item.trend.text)}</span>
      </button>
    `;
  }).join("");
};


const renderRanks = records => {
  const previousRecords = getPreviousRecords();
  const rankGrid = document.querySelector("#rankGrid");
  const rankCloud = document.querySelector("#rankCloud");
  if (!rankGrid || !rankCloud) return;

  if (state.rankView === "cloud") {
    rankGrid.style.display = "none";
    rankCloud.style.display = "grid";

    rankCloud.innerHTML = PROFILE_CATEGORIES.map(category => {
      const items = aggregateCategory(records, category).filter(item => item.count > 0);
      if (items.length === 0) return "";

      const maxCount = Math.max(...items.map(i => i.count));
      const meta = CATEGORY_META[category] || CATEGORY_META["需求特征"];
      const cloudTags = items.map(tag => {
        const size = maxCount > 0 ? 13 + (15 * (tag.count / maxCount)) : 13;
        const colorClass = (meta.color === "red" || meta.color === "green") ? meta.color : "black";
        const trend = getProfileTrend(tag, category, previousRecords);
        const trendText = trend.direction !== "flat" ? ` <span style="font-weight:bold;margin-left:2px">${trend.text.replace(' ', '')}</span>` : "";
        return `<span class="cloud-tag ${colorClass}" style="font-size: ${size}px;" title="${escapeHtml(tag.reason)}">${escapeHtml(tag.name)}<small style="font-size:0.7em;opacity:0.9;margin-left:6px;font-weight:normal;">${tag.count}/${tag.rate}%${trendText}</small></span>`;
      }).join("");

      return `
        <div class="cloud-block">
          <h3>${escapeHtml(category)}</h3>
          <div class="cloud-tags">
            ${cloudTags}
          </div>
        </div>
      `;
    }).join("");
  } else {
    rankGrid.style.display = "grid";
    rankCloud.style.display = "none";
    rankGrid.innerHTML = PROFILE_CATEGORIES
      .map(category => rankBlock(category, aggregateCategory(records, category), previousRecords))
      .join("");
  }
};

const renderSummary = records => {
  const topNeed = topOf(records, "需求特征");
  const topScene = topOf(records, "购车场景");
  const filterSummary = document.querySelector("#filterSummary");
  if (filterSummary) {
    filterSummary.textContent = `当前筛选命中 ${records.length} 条样本，TOP 需求为「${topNeed.name}」，TOP 场景为「${topScene.name}」。`;
  }

};

const INTENT_LEVELS = [
  { key: "A级", label: "高意向", baseColor: "22, 167, 101" },
  { key: "B级", label: "中意向", baseColor: "100, 116, 139" },
  { key: "C级", label: "低意向", baseColor: "239, 68, 68", isSoft: true },
  { key: "战败", label: "无意向", baseColor: "239, 68, 68" }
];

const renderHeatmap = records => {
  const container = document.querySelector("#heatmapContainer");
  if (!container) return;

  const previousRecords = getPreviousRecords();
  const totalValidAll = records.reduce((sum, r) => sum + r.validCount, 0);
  const prevTotalValidAll = previousRecords.reduce((sum, r) => sum + r.validCount, 0);

  const tagMap = new Map();
  records.forEach(r => {
    Object.values(r.tags).forEach(tags => {
      tags.forEach(tag => {
        const item = tagMap.get(tag.name) || { name: tag.name, count: 0 };
        item.count += tag.count;
        tagMap.set(tag.name, item);
      });
    });
  });

  const prevTagMap = new Map();
  previousRecords.forEach(r => {
    Object.values(r.tags).forEach(tags => {
      tags.forEach(tag => {
        const item = prevTagMap.get(tag.name) || { name: tag.name, count: 0 };
        item.count += tag.count;
        prevTagMap.set(tag.name, item);
      });
    });
  });

  const allTags = [...tagMap.values()].map(tag => {
    const rate = totalValidAll ? (tag.count / totalValidAll) * 100 : 0;
    const prevCount = prevTagMap.get(tag.name)?.count || 0;
    const prevRate = prevTotalValidAll ? (prevCount / prevTotalValidAll) * 100 : 0;
    let trendText = "无对比";
    let trendTone = "flat";
    if (prevTotalValidAll > 0) {
      const diff = Math.round(rate) - Math.round(prevRate);
      if (diff > 0) { trendText = `↑${diff}%`; trendTone = "green"; }
      else if (diff < 0) { trendText = `↓${Math.abs(diff)}%`; trendTone = "red"; }
      else { trendText = "持平"; }
    }
    return { ...tag, rate: Math.round(rate), trendText, trendTone };
  });

  allTags.sort((a, b) => b.rate - a.rate || b.count - a.count);

  if (allTags.length === 0) {
    container.innerHTML = "<div style='padding: 20px; text-align: center; color: var(--muted);'>暂无热力图数据</div>";
    return;
  }

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(allTags.length / PAGE_SIZE);
  if (state.heatmapPage > totalPages) state.heatmapPage = 1;
  if (state.heatmapPage < 1) state.heatmapPage = 1;

  const startIndex = (state.heatmapPage - 1) * PAGE_SIZE;
  const topTags = allTags.slice(startIndex, startIndex + PAGE_SIZE);

  const heatmapData = topTags.map((tag, i) => {
    const row = {
      name: tag.name,
      index: startIndex + i + 1,
      overall: tag,
      intents: {}
    };
    INTENT_LEVELS.forEach(level => {
      const levelRecords = records.filter(r => r.level === level.key);
      const totalValid = levelRecords.reduce((sum, r) => sum + r.validCount, 0);

      let hitCount = 0;
      levelRecords.forEach(r => {
        Object.values(r.tags).forEach(tags => {
          const found = tags.find(t => t.name === tag.name);
          if (found) hitCount += found.count;
        });
      });

      let rate = totalValid ? (hitCount / totalValid) * 100 : 0;
      rate = Math.min(100, Math.round(rate));

      const prevLevelRecords = previousRecords.filter(r => r.level === level.key);
      const prevTotalValid = prevLevelRecords.reduce((sum, r) => sum + r.validCount, 0);
      let prevHitCount = 0;
      prevLevelRecords.forEach(r => {
        Object.values(r.tags).forEach(tags => {
          const found = tags.find(t => t.name === tag.name);
          if (found) prevHitCount += found.count;
        });
      });
      let prevRate = prevTotalValid ? (prevHitCount / prevTotalValid) * 100 : 0;
      prevRate = Math.min(100, Math.round(prevRate));

      let trendText = "无对比";
      let trendTone = "flat";
      if (prevTotalValid > 0) {
        const diff = rate - prevRate;
        if (diff > 0) { trendText = `↑${diff}%`; trendTone = "green"; }
        else if (diff < 0) { trendText = `↓${Math.abs(diff)}%`; trendTone = "red"; }
        else { trendText = "持平"; }
      }

      row.intents[level.key] = { rate, hitCount, trendText, trendTone };
    });
    return row;
  });

  let tableHtml = `<div class="heatmap-table-wrapper"><table class="heatmap-table">
    <thead>
      <tr>
        <th style="text-align: left; padding-left: 20px;">客户标签</th>
        ${INTENT_LEVELS.map(l => `<th>${l.label}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
  `;

  heatmapData.forEach(row => {
    tableHtml += `<tr>`;
    tableHtml += `<td class="tag-name-col" style="padding-left: 20px;">
      <span class="tag-index">${row.index}</span>${escapeHtml(row.name)}
    </td>`;

    INTENT_LEVELS.forEach(level => {
      const stats = row.intents[level.key];
      const alpha = Math.max(0.1, stats.rate / 100);
      let bgColor = `rgba(${level.baseColor}, ${level.isSoft ? alpha * 0.5 : alpha})`;
      if (stats.rate === 0) bgColor = "transparent";

      const textColorClass = (stats.rate < 40 || stats.rate === 0) ? "dark-text" : "";
      const textVal = stats.rate > 0 ? `${stats.rate}%` : "-";

      const tooltipData = escapeHtml(JSON.stringify({
        title: `${row.name} × ${level.label}`,
        hitCount: stats.hitCount,
        rate: stats.rate,
        trendText: stats.trendText,
        trendTone: stats.trendTone
      }));

      tableHtml += `<td class="heatmap-cell ${textColorClass}" style="background: ${bgColor};" data-info="${tooltipData}">
        ${textVal}
      </td>`;
    });
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table></div>`;

  let paginationHtml = "";
  if (totalPages > 1) {
    paginationHtml = `
      <div class="heatmap-pagination">
        <button class="ghost-button" id="heatmapPrev" ${state.heatmapPage === 1 ? 'disabled' : ''}>上一页</button>
        <span class="page-info">${state.heatmapPage} / ${totalPages}</span>
        <button class="ghost-button" id="heatmapNext" ${state.heatmapPage === totalPages ? 'disabled' : ''}>下一页</button>
      </div>
    `;
  }

  container.innerHTML = tableHtml + paginationHtml + `<div class="heatmap-popover" id="heatmapPopover"></div>`;

  const cells = container.querySelectorAll(".heatmap-cell");
  const popover = container.querySelector("#heatmapPopover");

  cells.forEach(cell => {
    cell.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelectorAll(".heatmap-cell").forEach(c => c.style.outline = "none");
      cell.style.outline = "2px solid var(--line-strong)";
      cell.style.outlineOffset = "-2px";

      const info = JSON.parse(cell.dataset.info || "{}");
      if (!info.title) return;

      popover.innerHTML = `
        <h4>${info.title}</h4>
        <div class="pop-row">
          <span>命中数</span>
          <span class="pop-val">${info.hitCount}</span>
        </div>
        <div class="pop-row">
          <span>命中率</span>
          <span class="pop-val">${info.rate}%</span>
        </div>
        <div class="pop-row">
          <span>较上期增长</span>
          <span class="pop-val ${info.trendTone}">${info.trendText}</span>
        </div>
      `;

      const rect = cell.getBoundingClientRect();
      let top = rect.top + rect.height;
      let left = rect.left + rect.width / 2 - 120;

      if (left < 10) left = 10;
      if (left + 240 > window.innerWidth) left = window.innerWidth - 250;

      popover.style.top = `${top + 8}px`;
      popover.style.left = `${left}px`;
      popover.classList.add("show");
    });
  });

  document.addEventListener("click", () => {
    if (popover && popover.classList.contains("show")) {
      popover.classList.remove("show");
      document.querySelectorAll(".heatmap-cell").forEach(c => c.style.outline = "none");
    }
  });
};

const render = () => {
  ensureValidModelForBrand();
  const records = getFilteredRecords();
  renderFilters();
  renderSummary(records);
  const metrics = buildMetrics(records);
  document.querySelector("#metricGrid").innerHTML = metrics.map((m, i) => metricMarkup(m, i)).join("");
  window._currentMetrics = metrics;
  renderPortrait(records);
  renderHeatmap(records);
  renderRanks(records);
};

document.addEventListener("click", event => {
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    state[filterButton.dataset.filter] = filterButton.dataset.value;
    if (filterButton.dataset.filter === "brand") {
      state.model = "all";
    }
    state.heatmapPage = 1;
    render();
    return;
  }

  const heatmapPrev = event.target.closest("#heatmapPrev");
  if (heatmapPrev) {
    if (state.heatmapPage > 1) {
      state.heatmapPage--;
      renderHeatmap(getFilteredRecords());
    }
    return;
  }

  const heatmapNext = event.target.closest("#heatmapNext");
  if (heatmapNext) {
    state.heatmapPage++;
    renderHeatmap(getFilteredRecords());
    return;
  }

  const portraitNode = event.target.closest(".portrait-node");
  if (portraitNode) {
    state.selectedCategory = portraitNode.dataset.category;
    state.selectedName = portraitNode.dataset.name;
    render();
    return;
  }

  const viewToggleBtn = event.target.closest("#rankViewToggle button");
  if (viewToggleBtn) {
    const view = viewToggleBtn.dataset.view;
    if (state.rankView !== view) {
      state.rankView = view;
      document.querySelectorAll("#rankViewToggle button").forEach(btn => btn.classList.remove("active"));
      viewToggleBtn.classList.add("active");
      renderRanks(getFilteredRecords());
    }
    return;
  }

  const profileBlockNode = event.target.closest(".profile-block, .profile-rank-row");
  if (profileBlockNode) {
    state.selectedCategory = profileBlockNode.dataset.category;
    state.selectedName = profileBlockNode.dataset.name;
    render();
  }
});

document.addEventListener("change", event => {
  const orgSelect = event.target.closest("[data-org-filter]");
  if (!orgSelect) return;

  const key = orgSelect.dataset.orgFilter;
  state[key] = orgSelect.value;
  if (key === "region") {
    state.zone = "all";
    state.store = "all";
  }
  if (key === "zone") {
    state.store = "all";
  }
  state.heatmapPage = 1;
  render();
});

const resetButton = document.querySelector("#resetButton");
if (resetButton) {
  resetButton.addEventListener("click", () => {
    Object.assign(state, {
      brand: "传祺",
      region: "all",
      zone: "all",
      store: "all",
      time: "7",
      model: "M8",
      selectedCategory: "需求特征",
      selectedName: "空间大",
      heatmapPage: 1
    });
    render();
  });
}


// ===== Trend Modal =====
const generateTrendData = (metric) => {
  const days = timeLimit(state.time);
  const labels = [];
  const data = [];
  const now = new Date();
  const isRate = metric.metricType === 'rate';
  const base = metric.rawValue || parseFloat(String(metric.value).replace(/[^0-9.]/g, '')) || 50;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth()+1}/${d.getDate()}`);
    if (isRate) {
      const v = Math.max(0, Math.min(100, base * (0.8 + Math.random() * 0.4)));
      data.push(parseFloat(v.toFixed(1)));
    } else {
      data.push(Math.max(0, Math.round(base * (0.7 + Math.random() * 0.6))));
    }
  }
  return { labels, data };
};

const formatTrendVal = (val, metric) => {
  if (metric.metricType === 'rate') return `${val}%`;
  return String(Math.round(val));
};

const showTrendModal = (metricIndex) => {
  const metric = window._currentMetrics?.[metricIndex];
  if (!metric) return;
  let overlay = document.getElementById('trendModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'trendModalOverlay';
    overlay.className = 'trend-modal-overlay';
    document.body.appendChild(overlay);
  }
  const periodLabel = timeText(state.time);
  const isEmpty = metric.value === '暂无命中' || metric.rawValue === 0;

  if (isEmpty) {
    overlay.innerHTML = `
      <div class="trend-modal">
        <div class="trend-modal-header">
          <div>
            <h3>${escapeHtml(metric.title)} 趋势变化</h3>
            <p>${escapeHtml(periodLabel)}数据走势</p>
          </div>
          <button class="trend-modal-close" id="trendModalClose" title="关闭">✕</button>
        </div>
        <div class="trend-modal-body">
          <div class="trend-modal-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <p>暂无数据</p>
            <span>当前筛选条件下暂未产生趋势数据</span>
          </div>
        </div>
      </div>
    `;
    overlay.classList.add('show');
    overlay.querySelector('#trendModalClose').addEventListener('click', () => overlay.classList.remove('show'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
    return;
  }

  const td = generateTrendData(metric);
  const isRate = metric.metricType === 'rate';
  const maxVal = isRate ? Math.max(...td.data, 1) * 1.15 : Math.max(...td.data, 1);
  const svgW = 560, svgH = 260, padL = 55, padR = 20, padT = 30, padB = 40;
  const chartW = svgW - padL - padR, chartH = svgH - padT - padB;
  const stepX = chartW / (td.labels.length - 1 || 1);
  const points = td.data.map((v, i) => [padL + i * stepX, padT + chartH - (v / maxVal) * chartH]);
  const polyline = points.map(p => p.join(',')).join(' ');
  const areaPath = `M${points[0][0]},${padT+chartH} ${points.map(p=>`L${p[0]},${p[1]}`).join(' ')} L${points[points.length-1][0]},${padT+chartH} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(r => {
    const y = padT + chartH - r * chartH;
    const rawVal = r * maxVal;
    const label = isRate ? `${rawVal.toFixed(0)}%` : Math.round(rawVal);
    return `<line x1="${padL}" y1="${y}" x2="${svgW-padR}" y2="${y}" stroke="#e2e8f0" stroke-width="0.8"/><text x="${padL-8}" y="${y+4}" fill="#94a3b8" font-size="11" text-anchor="end">${label}</text>`;
  }).join('');
  const labelStep = td.labels.length > 15 ? Math.ceil(td.labels.length / 10) : 1;
  const xLabels = td.labels.map((l, i) => {
    if (i % labelStep !== 0 && i !== td.labels.length - 1) return '';
    return `<text x="${padL+i*stepX}" y="${svgH-8}" fill="#94a3b8" font-size="11" text-anchor="middle">${l}</text>`;
  }).join('');
  const dots = points.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${metric.sparkColor}" stroke="#fff" stroke-width="1.5"/><text x="${p[0]}" y="${p[1]-10}" fill="${metric.sparkColor}" font-size="10" font-weight="700" text-anchor="middle">${formatTrendVal(td.data[i], metric)}</text>`).join('');
  overlay.innerHTML = `
    <div class="trend-modal">
      <div class="trend-modal-header">
        <div>
          <h3>${escapeHtml(metric.title)} 趋势变化</h3>
          <p>${escapeHtml(periodLabel)}数据走势</p>
        </div>
        <button class="trend-modal-close" id="trendModalClose" title="关闭">✕</button>
      </div>
      <div class="trend-modal-body">
        <div class="trend-modal-summary">
          <div class="trend-summary-item"><span class="trend-summary-label">当前值</span><span class="trend-summary-value" style="color:${metric.sparkColor}">${escapeHtml(metric.value)}</span></div>
        </div>
        <svg viewBox="0 0 ${svgW} ${svgH}" class="trend-chart-svg">
          ${gridLines}
          ${xLabels}
          <defs><linearGradient id="trendFill${metricIndex}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${metric.sparkColor}" stop-opacity="0.18"/><stop offset="100%" stop-color="${metric.sparkColor}" stop-opacity="0.01"/></linearGradient></defs>
          <path d="${areaPath}" fill="url(#trendFill${metricIndex})"/>
          <polyline points="${polyline}" fill="none" stroke="${metric.sparkColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${dots}
        </svg>
      </div>
    </div>
  `;
  overlay.classList.add('show');
  overlay.querySelector('#trendModalClose').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
};

document.addEventListener('click', e => {
  const spark = e.target.closest('.spark-clickable');
  if (spark) {
    const idx = parseInt(spark.dataset.metricIndex, 10);
    showTrendModal(idx);
  }
});

render();
