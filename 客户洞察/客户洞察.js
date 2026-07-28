(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STAGES = {
    online: {
      kicker: "线上邀约 · 阶段结果",
      title: "这 1,248 位客户，最终有没有走进门店？",
      desc: "把最终到店结果放回首次到店前的客户对话，比较两组信号差异。",
      rule: "同一客户多次邀约合并，按最终是否存在到店记录分组；已到店客户仅分析首次到店前对话。",
      groups: {
        a: { name: "最终到店", customers: 462, valid: 436, rate: 37.0 },
        b: { name: "最终未到店", customers: 786, valid: 709, rate: 63.0 }
      },
      total: 1248,
      valid: 1145,
      exceptions: 103,
      summary: [
        "到店客户更集中表达家庭多人出行和试驾体验需求；其中“家庭多人出行”比未到店组高 13.4 个百分点。",
        "未到店客户更常提到价格预算、到店时间和竞品比较未完成；价格顾虑在华东部分门店更集中，建议管理层核查报价表达是否一致。",
        "“提供两个可选到店时间”在到店组执行率为 68.2%，比未到店组高 26.5 个百分点；这是关联差异，仍需结合客户紧迫性进一步验证。"
      ],
      priorities: [
        ["resistance", "未到店客户的“价格顾虑”是否集中在具体组织？"],
        ["action", "给出明确时间选项，是否更常出现在到店组？"],
        ["competitor", "竞品比较未完成的客户，主要卡在哪些配置？"]
      ]
    },
    offline: {
      kicker: "线下接待 · 线索状态对比",
      title: "到店以后，哪些客户走向了不同线索结果？",
      desc: "按业务选择的真实线索状态分组，比较成交前或统计截止日前的接待对话。",
      rule: "线下样本均存在到店记录；A、B 组按真实线索状态配置，重叠客户默认不进入差异计算。",
      groups: {
        a: { name: "已下订、异地成交", customers: 328, valid: 314, rate: 31.5 },
        b: { name: "战败、战败申请中", customers: 714, valid: 668, rate: 68.5 }
      },
      total: 1058,
      valid: 982,
      exceptions: 16,
      overlap: 16,
      summary: [
        "A 组更集中表达家庭空间、试驾体验和具体配置选择，B 组则更常出现落地价超预算与竞品更有吸引力。",
        "完整解释价格构成在 A 组执行率为 72.6%，比 B 组高 22.8 个百分点；不同门店差异较大，适合先在华东大区验证。",
        "宋 PLUS DM-i 是两组提及最多的竞品；B 组关于月供和置换估值的负面表达更集中，客户对话价格仅作情报，不等同官方价格。"
      ],
      priorities: [
        ["resistance", "战败组的落地价顾虑，主要来自哪些价格构成？"],
        ["action", "完整解释价格构成是否更常出现在 A 组？"],
        ["competitor", "竞品的价格与配置优势分别影响了哪些客户？"]
      ]
    }
  };

  const DATA = {
    online: {
      need: {
        title: "客户需求与到店关注点",
        desc: "需求来自客户明确表达；销售单方面介绍不计入客户关注",
        rows: [
          { name: "家庭多人出行", sub: "用车场景", a: 46.8, b: 33.4, count: "453 人", voices: [
            ["a", "客户 C-08427", "主要还是一家五口周末出去，想现场看看第三排坐久了会不会累。", "华东大区 · 上海中心店", "07-18 16:42"],
            ["b", "客户 C-10563", "家里人多，空间肯定要看，但最近实在没时间过去。", "华南大区 · 广州大道店", "07-17 11:08"]
          ] },
          { name: "想确认真实续航", sub: "到店关注", a: 39.5, b: 30.2, count: "387 人", voices: [
            ["a", "客户 C-06731", "参数我看过了，还是想试一下高速续航，现场也问问冬天能跑多少。", "华北大区 · 北京朝阳店", "07-18 10:17"],
            ["b", "客户 C-11902", "续航如果只是官方数字，我现在过去也确认不了什么。", "华中大区 · 武汉光谷店", "07-15 13:26"]
          ] },
          { name: "近期购车计划", sub: "购车时间", a: 37.2, b: 24.9, count: "339 人", voices: [
            ["a", "客户 C-03148", "这个月就要定，周六我和家里人一起过去看。", "西南大区 · 成都机场路店", "07-19 09:38"],
            ["b", "客户 C-09216", "换车是有计划，但至少得等年底再说。", "华东大区 · 杭州城西店", "07-16 18:05"]
          ] },
          { name: "想了解落地价格", sub: "价格政策", a: 51.4, b: 48.8, count: "582 人", voices: [
            ["a", "客户 C-07410", "到店能把保险、金融和置换都算清楚的话，我周末可以来。", "华南大区 · 深圳南山店", "07-18 14:21"],
            ["b", "客户 C-12884", "先直接告诉我大概落地多少，差太多我就不过去了。", "华东大区 · 苏州园区店", "07-17 10:46"]
          ] },
          { name: "计划置换旧车", sub: "购车方式", a: 28.6, b: 22.1, count: "289 人", voices: [
            ["a", "客户 C-05208", "我有一台开了六年的车，过去的时候能一起估价吗？", "华北大区 · 天津空港店", "07-16 15:12"],
            ["b", "客户 C-11670", "置换价格得先有个范围，不然来回跑没意义。", "华南大区 · 佛山桂城店", "07-14 12:35"]
          ] }
        ]
      },
      resistance: {
        title: "客户抗拒点与邀约难点",
        desc: "聚合客户拒绝或推迟到店时明确表达的原因",
        rows: [
          { name: "价格或预算顾虑", sub: "邀约阻力", a: 31.8, b: 48.5, count: "483 人", voices: [
            ["b", "客户 C-12884", "先把大概落地价说一下，如果还是超过十八万，我就没必要过去了。", "华东大区 · 苏州园区店", "07-17 10:46"],
            ["a", "客户 C-07410", "预算确实卡得紧，不过到店把贷款总成本算清楚我可以接受。", "华南大区 · 深圳南山店", "07-18 14:21"]
          ] },
          { name: "到店时间不便", sub: "时间安排", a: 18.4, b: 36.9, count: "342 人", voices: [
            ["b", "客户 C-10563", "这两周周末都排满了，工作日又要到七点才下班。", "华南大区 · 广州大道店", "07-17 11:08"],
            ["a", "客户 C-03148", "周六上午没空，下午三点以后可以过去。", "西南大区 · 成都机场路店", "07-19 09:38"]
          ] },
          { name: "竞品比较未完成", sub: "决策进度", a: 21.7, b: 34.6, count: "325 人", voices: [
            ["b", "客户 C-09126", "宋 PLUS 和银河 E5 还没看完，我想都试过再决定。", "华中大区 · 长沙岳麓店", "07-16 17:22"],
            ["a", "客户 C-06731", "我还在对比宋 PLUS，周末正好两边都试一下。", "华北大区 · 北京朝阳店", "07-18 10:17"]
          ] },
          { name: "购车紧迫性低", sub: "购车计划", a: 12.9, b: 30.8, count: "278 人", voices: [
            ["b", "客户 C-09216", "现在的车还能开，年底前都不着急换。", "华东大区 · 杭州城西店", "07-16 18:05"],
            ["a", "客户 C-06352", "不急着定，但我愿意先去体验一下空间和车机。", "西北大区 · 西安高新店", "07-15 09:20"]
          ] },
          { name: "距离或交通不便", sub: "到店成本", a: 10.8, b: 19.7, count: "187 人", voices: [
            ["b", "客户 C-11802", "你们店离我四十多公里，专门过去一趟太远了。", "华北大区 · 石家庄裕华店", "07-14 15:46"],
            ["a", "客户 C-04319", "地铁过去有点绕，如果周日下午人少我就开车来。", "华东大区 · 南京江宁店", "07-17 13:05"]
          ] }
        ]
      },
      profile: {
        title: "客户特征差异",
        desc: "特征只表达客群集中度；是否更易到店需同时查看结果率与样本",
        rows: [
          { name: "1 个月内购车", sub: "购车时间", a: 42.6, b: 25.1, count: "364 人", voices: [["a", "客户 C-03148", "这个月就要定，周六我和家里人一起过去看。", "西南大区 · 成都机场路店", "07-19 09:38"]] },
          { name: "家庭出行", sub: "购车用途", a: 46.8, b: 33.4, count: "453 人", voices: [["a", "客户 C-08427", "主要还是一家五口周末出去，想现场看看第三排。", "华东大区 · 上海中心店", "07-18 16:42"]] },
          { name: "已明确预算", sub: "购车预算", a: 58.2, b: 47.3, count: "602 人", voices: [["a", "客户 C-07410", "预算十八万以内，贷款总成本也要一起算。", "华南大区 · 深圳南山店", "07-18 14:21"]] },
          { name: "计划置换", sub: "是否置换", a: 28.6, b: 22.1, count: "289 人", voices: [["a", "客户 C-05208", "旧车开了六年，想到店一起估价。", "华北大区 · 天津空港店", "07-16 15:12"]] },
          { name: "明确价格博弈", sub: "决策信号", a: 24.5, b: 37.8, count: "381 人", voices: [["b", "客户 C-12884", "如果价格还是没有空间，我就不折腾过去了。", "华东大区 · 苏州园区店", "07-17 10:46"]] }
        ]
      },
      action: {
        title: "销售邀约动作",
        desc: "动作来自销售实际说过或完成的行为，并结合客户触发信号计算执行机会",
        rows: [
          { name: "提供两个可选到店时间", sub: "明确邀约", a: 68.2, b: 41.7, count: "631 人", voices: [["a", "客户 C-03148", "销售：周六下午三点或周日上午十点，您看哪个时间更方便？", "西南大区 · 成都机场路店", "07-19 09:38"], ["b", "客户 C-10563", "销售：您有空的时候来店里看看就行。", "华南大区 · 广州大道店", "07-17 11:08"]] },
          { name: "针对核心顾虑回应", sub: "异议处理", a: 55.6, b: 37.9, count: "511 人", voices: [["a", "客户 C-06731", "销售：高速续航我们可以按您常跑的路线现场看实测数据。", "华北大区 · 北京朝阳店", "07-18 10:17"]] },
          { name: "确认购车时间", sub: "需求探询", a: 73.5, b: 59.2, count: "741 人", voices: [["a", "客户 C-08427", "销售：您是准备这个月定下来，还是先完成几款车的比较？", "华东大区 · 上海中心店", "07-18 16:42"]] },
          { name: "说明具体活动利益点", sub: "权益说明", a: 48.7, b: 39.5, count: "493 人", voices: [["a", "客户 C-07410", "销售：周末到店可以现场核算置换补贴和两年免息的总成本。", "华南大区 · 深圳南山店", "07-18 14:21"]] },
          { name: "约定下一次跟进", sub: "持续跟进", a: 61.4, b: 54.8, count: "669 人", voices: [["b", "客户 C-09216", "销售：我十一月底再联系您确认换车计划。", "华东大区 · 杭州城西店", "07-16 18:05"]] }
        ]
      },
      competitor: {
        title: "客户对话竞品情报",
        desc: "客户提及价格不等于官方价格；保留对话时间、地区、来源与可信度",
        rows: [
          { name: "宋 PLUS DM-i", sub: "比亚迪 · 车型", a: 24.6, b: 31.8, count: "294 人", voices: [["b", "客户 C-09126", "宋 PLUS 现在听说优惠一万多，配置我还没仔细比。", "华中大区 · 长沙岳麓店", "07-16 17:22"], ["a", "客户 C-06731", "宋 PLUS 我也会试，主要比较冬季续航和后排空间。", "华北大区 · 北京朝阳店", "07-18 10:17"]] },
          { name: "银河 E5", sub: "吉利银河 · 车型", a: 14.3, b: 22.7, count: "223 人", voices: [["b", "客户 C-12884", "银河 E5 的落地价更接近我的预算。", "华东大区 · 苏州园区店", "07-17 10:46"]] },
          { name: "智能座舱与车机", sub: "高频配置比较", a: 18.9, b: 16.2, count: "197 人", voices: [["a", "客户 C-06352", "我想现场对比车机反应和语音控制，参数看不出区别。", "西北大区 · 西安高新店", "07-15 09:20"]] },
          { name: "客户自述落地价", sub: "价格事实 · 中可信度", a: 11.8, b: 18.6, count: "168 人", voices: [["b", "客户 C-09126", "朋友说宋 PLUS 落地能做到十六万多，我还要再确认。", "华中大区 · 长沙岳麓店", "07-16 17:22"]] },
          { name: "后排空间比较", sub: "本品占优", a: 16.5, b: 12.3, count: "163 人", voices: [["a", "客户 C-08427", "目前看这台后排更宽，但还是得带家人现场坐一下。", "华东大区 · 上海中心店", "07-18 16:42"]] }
        ]
      }
    }
  };

  DATA.offline = {
    need: {
      title: "客户需求与购车关注点",
      desc: "重点观察到店后的试驾、配置、价格、金融与交付需求",
      rows: [
        { name: "家庭空间与乘坐体验", sub: "使用场景", a: 49.2, b: 34.8, count: "387 人", voices: [["a", "客户 C-20516", "第二排舒适度可以，第三排我爸妈偶尔坐也能接受。", "华东大区 · 上海中心店", "07-18 15:20"], ["b", "客户 C-22918", "第三排还是有点挤，家里人觉得不合适。", "华南大区 · 深圳龙岗店", "07-17 17:06"]] },
        { name: "清晰落地价", sub: "价格关注", a: 57.6, b: 66.2, count: "623 人", voices: [["b", "客户 C-23102", "我需要的是包含保险和金融费用的最终价格。", "华北大区 · 北京朝阳店", "07-18 12:14"]] },
        { name: "试驾体验目标", sub: "动态体验", a: 44.3, b: 29.7, count: "337 人", voices: [["a", "客户 C-21477", "试完以后底盘比我预期稳，城市里开也挺轻松。", "西南大区 · 成都机场路店", "07-16 16:42"]] },
        { name: "金融月供方案", sub: "付款方式", a: 36.8, b: 45.9, count: "422 人", voices: [["b", "客户 C-23764", "月供能接受，但加上服务费以后总成本太高了。", "华中大区 · 武汉光谷店", "07-15 11:38"]] },
        { name: "置换估值", sub: "增换购", a: 27.5, b: 35.2, count: "316 人", voices: [["b", "客户 C-22805", "旧车估价比外面低不少，这个差价我接受不了。", "华东大区 · 杭州城西店", "07-16 14:29"]] }
      ]
    },
    resistance: {
      title: "客户抗拒点与成交难点",
      desc: "比较 A、B 组到店后明确表达的成交阻力",
      rows: [
        { name: "落地价超预算", sub: "价格阻力", a: 28.4, b: 51.6, count: "434 人", voices: [["b", "客户 C-23102", "算完落地超过二十万，已经超出我最开始的预算。", "华北大区 · 北京朝阳店", "07-18 12:14"]] },
        { name: "竞品更有吸引力", sub: "竞品阻力", a: 17.5, b: 35.9, count: "295 人", voices: [["b", "客户 C-22073", "宋 PLUS 的价格低一些，配置也没有少太多。", "华南大区 · 广州大道店", "07-17 13:08"]] },
        { name: "贷款总成本压力", sub: "金融阻力", a: 21.7, b: 37.8, count: "321 人", voices: [["b", "客户 C-23764", "月供看着不高，但所有费用加起来不划算。", "华中大区 · 武汉光谷店", "07-15 11:38"]] },
        { name: "家庭决策未完成", sub: "决策角色", a: 14.8, b: 27.2, count: "228 人", voices: [["b", "客户 C-22918", "我爸妈觉得第三排不够用，还要回去再商量。", "华南大区 · 深圳龙岗店", "07-17 17:06"]] },
        { name: "置换估值不满意", sub: "置换阻力", a: 12.6, b: 24.7, count: "205 人", voices: [["b", "客户 C-22805", "你们这个旧车报价差太多，我可能直接卖给外面。", "华东大区 · 杭州城西店", "07-16 14:29"]] }
      ]
    },
    profile: {
      title: "客户特征差异",
      desc: "按购车计划、场景、行为进展和决策信号查看差异",
      rows: [
        { name: "完成试驾", sub: "行为进展", a: 74.2, b: 51.6, count: "578 人", voices: [["a", "客户 C-21477", "试过以后基本符合预期，可以继续谈具体价格。", "西南大区 · 成都机场路店", "07-16 16:42"]] },
        { name: "1 个月内购车", sub: "购车时间", a: 63.8, b: 42.5, count: "484 人", voices: [["a", "客户 C-20516", "这个月就定，主要是最后确认价格和交付。", "华东大区 · 上海中心店", "07-18 15:20"]] },
        { name: "计划置换", sub: "购车方式", a: 31.4, b: 38.6, count: "357 人", voices: [["b", "客户 C-22805", "旧车估价不合适，这次就先不定。", "华东大区 · 杭州城西店", "07-16 14:29"]] },
        { name: "贷款购车", sub: "付款方式", a: 42.7, b: 55.3, count: "504 人", voices: [["b", "客户 C-23764", "贷款总成本太高，我还要看其他品牌方案。", "华中大区 · 武汉光谷店", "07-15 11:38"]] },
        { name: "明确价格博弈", sub: "决策信号", a: 38.6, b: 52.8, count: "474 人", voices: [["b", "客户 C-23102", "价格再没有空间的话，今天就不考虑定了。", "华北大区 · 北京朝阳店", "07-18 12:14"]] }
      ]
    },
    action: {
      title: "销售接待动作",
      desc: "动作只来自销售实际执行，并结合客户触发信号与执行机会",
      rows: [
        { name: "完整解释价格构成", sub: "报价说明", a: 72.6, b: 49.8, count: "561 人", voices: [["a", "客户 C-20516", "销售：裸车、保险、金融费用和置换补贴我分别给您列清楚。", "华东大区 · 上海中心店", "07-18 15:20"]] },
        { name: "结合场景演示配置", sub: "产品讲解", a: 64.8, b: 46.1, count: "511 人", voices: [["a", "客户 C-21477", "销售：您每天通勤 60 公里，我们按这个路线看辅助驾驶和能耗。", "西南大区 · 成都机场路店", "07-16 16:42"]] },
        { name: "安排并完成试驾", sub: "体验动作", a: 74.2, b: 51.6, count: "578 人", voices: [["a", "客户 C-21477", "销售：先按您的通勤路况试一圈，再回来谈具体配置。", "西南大区 · 成都机场路店", "07-16 16:42"]] },
        { name: "处理关键异议", sub: "异议处理", a: 58.9, b: 40.7, count: "457 人", voices: [["a", "客户 C-20516", "销售：第三排我们一起按您家人的身高重新调整座椅。", "华东大区 · 上海中心店", "07-18 15:20"]] },
        { name: "提供金融测算", sub: "金融方案", a: 45.8, b: 42.9, count: "437 人", voices: [["b", "客户 C-23764", "销售：这里只展示月供，其他费用要签约时再确认。", "华中大区 · 武汉光谷店", "07-15 11:38"]] }
      ]
    },
    competitor: {
      title: "客户对话竞品情报",
      desc: "结构化展示品牌、车型、配置比较和客户对话价格事实",
      rows: [
        { name: "宋 PLUS DM-i", sub: "比亚迪 · 车型", a: 26.4, b: 39.8, count: "349 人", voices: [["b", "客户 C-22073", "宋 PLUS 优惠后更便宜，座舱配置也够用。", "华南大区 · 广州大道店", "07-17 13:08"]] },
        { name: "银河 E5", sub: "吉利银河 · 车型", a: 13.7, b: 24.3, count: "205 人", voices: [["b", "客户 C-23102", "银河 E5 的报价更接近我的预算，准备再去试一次。", "华北大区 · 北京朝阳店", "07-18 12:14"]] },
        { name: "辅助驾驶配置", sub: "配置比较", a: 22.8, b: 19.4, count: "204 人", voices: [["a", "客户 C-21477", "这台车辅助驾驶用起来更顺手，是我最后选择的重要原因。", "西南大区 · 成都机场路店", "07-16 16:42"]] },
        { name: "客户自述优惠金额", sub: "价格事实 · 中可信度", a: 12.4, b: 21.7, count: "184 人", voices: [["b", "客户 C-22073", "对面销售说能优惠一万多，但我还没拿到正式报价。", "华南大区 · 广州大道店", "07-17 13:08"]] },
        { name: "后排乘坐空间", sub: "配置比较", a: 21.6, b: 28.5, count: "253 人", voices: [["b", "客户 C-22918", "家里人坐完觉得第三排不如另一台宽敞。", "华南大区 · 深圳龙岗店", "07-17 17:06"]] }
      ]
    }
  };

  const CANDIDATES = {
    online: [
      ["提供两个可选到店时间", "客户表示时间不确定", "68.2", "41.7", "44.8% / 29.1%", "稳定", "待验证"],
      ["围绕核心顾虑提供到店验证项", "客户提出续航或配置疑问", "55.6", "37.9", "42.3% / 31.0%", "稳定", "已采纳"],
      ["约定明确的下次跟进时间", "客户暂时无法到店", "61.4", "54.8", "38.7% / 33.9%", "继续观察", "待验证"]
    ],
    offline: [
      ["完整解释价格构成", "客户询问落地价", "72.6", "49.8", "39.6% / 24.1%", "稳定", "待验证"],
      ["结合家庭场景演示空间", "客户关注多人乘坐", "64.8", "46.1", "41.2% / 28.5%", "稳定", "已采纳"],
      ["试驾后复述关键体验", "客户完成试乘试驾", "58.4", "43.6", "37.8% / 27.9%", "继续观察", "待验证"]
    ]
  };

  const OVERVIEW_BRANDS = {
    "埃安": {
      online: 3486,
      arrivals: 1368,
      arrivalRate: 39.2,
      offline: 1412,
      linked: 1302,
      summary: "埃安品牌到店率本周升至 39.2%，但 AION V 仍低于品牌均值 2.2 个百分点。华东大区的价格预算顾虑影响范围最大；“完整解释价格构成”执行率低于品牌基准，建议优先进入线下接待验证。",
      models: [
        { name: "AION V", series: "主力 SUV", invite: 1248, arrival: 37.0, orders: 138, contribution: 30.3, resistance: "价格预算", competitor: "宋 PLUS", trend: -1.8, priority: 96 },
        { name: "AION Y Plus", series: "紧凑型 SUV", invite: 986, arrival: 42.6, orders: 152, contribution: 33.4, resistance: "续航顾虑", competitor: "银河 E5", trend: 3.1, priority: 82 },
        { name: "AION S Plus", series: "纯电轿车", invite: 731, arrival: 36.8, orders: 86, contribution: 18.9, resistance: "权益不足", competitor: "秦 PLUS", trend: 0.4, priority: 74 },
        { name: "AION RT", series: "智能轿车", invite: 521, arrival: 43.2, orders: 79, contribution: 17.4, resistance: "交付周期", competitor: "小鹏 MONA", trend: 2.7, priority: 63 }
      ],
      attention: [
        { stage: "online", topic: "resistance", label: "线上邀约", change: "+8.6%", title: "AION V 价格预算顾虑持续上升", detail: "影响 483 名客户，华东大区占比最高", meta: "影响客户 483 · 持续 3 周" },
        { stage: "offline", topic: "action", label: "线下接待", change: "-7.4pp", title: "完整解释价格构成执行不足", detail: "执行率 58.6%，低于品牌基准", meta: "存在执行机会 762 人" },
        { stage: "offline", topic: "competitor", label: "竞品情报", change: "+5.2%", title: "宋 PLUS 在战败组提及增加", detail: "价格与后排空间是主要比较项", meta: "提及客户 642 · 中等稳定" }
      ]
    },
    "传祺": {
      online: 2964,
      arrivals: 1187,
      arrivalRate: 40.0,
      offline: 1228,
      linked: 1149,
      summary: "传祺品牌到店率保持在 40.0%。E9 的家庭空间需求明确，但金融月供顾虑在未到店与战败客群中同时上升；M8 的试驾后异议处理动作执行较稳定，可作为横向验证对象。",
      models: [
        { name: "传祺 E9", series: "新能源 MPV", invite: 936, arrival: 41.8, orders: 144, contribution: 32.9, resistance: "金融月供", competitor: "腾势 D9", trend: 1.6, priority: 91 },
        { name: "传祺 M8", series: "豪华 MPV", invite: 812, arrival: 43.5, orders: 136, contribution: 31.1, resistance: "置换估值", competitor: "别克 GL8", trend: 2.2, priority: 78 },
        { name: "传祺 GS8", series: "中大型 SUV", invite: 704, arrival: 37.4, orders: 93, contribution: 21.2, resistance: "油耗顾虑", competitor: "星越 L", trend: -1.1, priority: 84 },
        { name: "传祺 ES9", series: "新能源 SUV", invite: 512, arrival: 35.0, orders: 65, contribution: 14.8, resistance: "产品认知", competitor: "理想 L6", trend: -2.4, priority: 88 }
      ],
      attention: [
        { stage: "online", topic: "resistance", label: "线上邀约", change: "+6.1%", title: "E9 金融月供顾虑影响扩大", detail: "影响 356 名客户，华南大区最集中", meta: "影响客户 356 · 持续 2 周" },
        { stage: "offline", topic: "action", label: "线下接待", change: "-5.8pp", title: "GS8 置换评估动作执行不足", detail: "存在机会客户中执行率仅 52.4%", meta: "存在执行机会 418 人" },
        { stage: "offline", topic: "competitor", label: "竞品情报", change: "+4.7%", title: "腾势 D9 价格提及持续增加", detail: "客户重点比较金融与二排体验", meta: "提及客户 487 · 中等稳定" }
      ]
    }
  };

  const STATUS_OPTIONS = ["已下订", "异地成交", "跟进中", "有效", "战败申请中", "战败", "无效"];
  const state = {
    stage: "overview",
    topic: "need",
    activeRow: 0,
    offlineConfigured: false,
    pendingTopic: null,
    groups: { a: new Set(), b: new Set() }
  };

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function getOverviewBrand() {
    return OVERVIEW_BRANDS[$("#brandFilter").value] || OVERVIEW_BRANDS["埃安"];
  }

  function syncModelOptions() {
    const brandName = $("#brandFilter").value;
    const brand = getOverviewBrand();
    const current = $("#modelFilter").value;
    $("#modelFilter").innerHTML = [
      '<option value="all">全部车型</option>',
      ...brand.models.map((model) => `<option value="${escapeHTML(model.name)}">${escapeHTML(model.name)}</option>`)
    ].join("");
    $("#modelFilter").value = brand.models.some((model) => model.name === current) ? current : "all";
    $("#overviewTitle").textContent = `${brandName} · ${$("#modelFilter").value === "all" ? "全部车型" : $("#modelFilter").value}`;
  }

  function renderOverview() {
    const brandName = $("#brandFilter").value;
    const brand = getOverviewBrand();
    const selectedModel = $("#modelFilter").value;
    const model = brand.models.find((item) => item.name === selectedModel);
    const visibleModels = model ? [model] : [...brand.models];
    const sortMode = $("#matrixSort").value;
    const sorters = {
      attention: (left, right) => right.priority - left.priority,
      arrival: (left, right) => right.arrival - left.arrival,
      order: (left, right) => right.orders - left.orders,
      trend: (left, right) => right.trend - left.trend
    };
    visibleModels.sort(sorters[sortMode] || sorters.attention);

    const online = model ? model.invite : brand.online;
    const arrivals = model ? Math.round(model.invite * model.arrival / 100) : brand.arrivals;
    const arrivalRate = model ? model.arrival : brand.arrivalRate;
    const offline = model ? Math.round(arrivals * 1.03) : brand.offline;
    const linked = model ? Math.round(arrivals * 0.95) : brand.linked;
    const notArrived = Math.max(0, online - arrivals);

    $("#overviewTitle").textContent = `${brandName} · ${model ? model.name : "全部车型"}`;
    $("#overviewDescription").textContent = model
      ? `查看 ${model.name} 的阶段结果、关键问题与品牌贡献，再进入具体阶段验证。`
      : "用两个真实业务阶段看清整体表现，再定位需要优先分析的车型与问题。";
    $("#onlineCustomers").textContent = online.toLocaleString("zh-CN");
    $("#arrivalCustomers").textContent = arrivals.toLocaleString("zh-CN");
    $(".journey-metrics em").innerHTML = `<b class="up">${arrivalRate.toFixed(1)}%</b> · 较上期 ${model && model.trend < 0 ? "" : "+"}${model ? model.trend.toFixed(1) : "2.4"}pp`;
    $("#arrivalProgress").style.width = `${arrivalRate}%`;
    $(".journey-progress span").textContent = `最终未到店 ${notArrived.toLocaleString("zh-CN")} 人`;
    $("#offlineCustomers").textContent = offline.toLocaleString("zh-CN");
    $("#linkedCustomers").textContent = linked.toLocaleString("zh-CN");
    $(".journey-link small").textContent = `${arrivals ? (linked / arrivals * 100).toFixed(1) : "0.0"}%`;
    $("#matrixCount").textContent = `${visibleModels.length} 款车型`;
    $("#scopeRule span").innerHTML = `<strong>当前口径：</strong>${escapeHTML(brandName)}品牌 · ${model ? escapeHTML(model.name) : "全部车型"}；线上与线下按各自业务事实展示，不强行拼接为统一漏斗。`;
    $(".sample-ok").textContent = "数据健康度 94.6%";

    $("#modelMatrixBody").innerHTML = visibleModels.map((item) => `
      <tr>
        <td><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.series)}</small></td>
        <td><span class="metric-strong">${item.invite.toLocaleString("zh-CN")}</span></td>
        <td><span class="metric-strong">${item.arrival.toFixed(1)}%</span></td>
        <td><span class="metric-strong">${item.orders}</span></td>
        <td><span class="contribution-bar"><b>${item.contribution.toFixed(1)}%</b><span><i style="width:${item.contribution * 2.4}%"></i></span></span></td>
        <td>${escapeHTML(item.resistance)}</td>
        <td>${escapeHTML(item.competitor)}</td>
        <td><span class="${item.trend >= 0 ? "trend-up" : "trend-down"}">${item.trend >= 0 ? "+" : ""}${item.trend.toFixed(1)}pp</span></td>
      </tr>
    `).join("");

    $("#attentionList").innerHTML = brand.attention.map((item, index) => `
      <button class="attention-item" type="button" data-attention-stage="${item.stage}" data-attention-topic="${item.topic}">
        <span class="attention-item-head"><span>0${index + 1} · ${escapeHTML(item.label)}</span><em>${escapeHTML(item.change)}</em></span>
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.detail)}</p>
        <span class="attention-item-meta"><span>${escapeHTML(item.meta)}</span><b>进入分析 →</b></span>
      </button>
    `).join("");
    $$("[data-attention-stage]", $("#attentionList")).forEach((button) => {
      button.addEventListener("click", () => goToStage(button.dataset.attentionStage, button.dataset.attentionTopic));
    });
  }

  function goToStage(stage, topic) {
    state.topic = topic || "need";
    state.activeRow = 0;
    if (stage === "offline" && !state.offlineConfigured) {
      state.pendingTopic = state.topic;
      openGroupModal();
      return;
    }
    state.stage = stage;
    renderStage();
    $(".main").scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStage() {
    $$(".stage-tab").forEach((button) => {
      const active = button.dataset.stage === state.stage;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (state.stage === "overview") {
      $("#overviewPage").hidden = false;
      $("#stageAnalysis").hidden = true;
      $("#editGroupsButton").hidden = true;
      renderOverview();
      return;
    }

    $("#overviewPage").hidden = true;
    $("#stageAnalysis").hidden = false;
    const meta = STAGES[state.stage];
    $("#stageKicker").textContent = meta.kicker;
    $("#comparisonTitle").textContent = meta.title;
    $("#comparisonDesc").textContent = meta.desc;
    $("#scopeRule span").innerHTML = `<strong>当前口径：</strong>${escapeHTML(meta.rule)}`;
    $("#editGroupsButton").hidden = state.stage !== "offline";

    const a = meta.groups.a;
    const b = meta.groups.b;
    $("#groupAName").textContent = a.name;
    $("#groupAMeta").textContent = `有效对话 ${a.valid} 人`;
    $("#groupAValue").textContent = a.customers.toLocaleString("zh-CN");
    $("#groupARate").textContent = `${a.rate.toFixed(1)}%`;
    $("#trackA").style.width = `${a.rate}%`;
    $("#groupBName").textContent = b.name;
    $("#groupBMeta").textContent = `有效对话 ${b.valid} 人`;
    $("#groupBValue").textContent = b.customers.toLocaleString("zh-CN");
    $("#groupBRate").textContent = `${b.rate.toFixed(1)}%`;
    $("#trackB").style.width = `${b.rate}%`;
    $("#totalSample").textContent = meta.total.toLocaleString("zh-CN");
    $("#validSample").textContent = meta.valid.toLocaleString("zh-CN");
    $("#exceptionSample").textContent = meta.exceptions.toLocaleString("zh-CN");
    $(".ai-brief .brief-scope").textContent = `${meta.valid.toLocaleString("zh-CN")} 名有效对话客户`;
    $("#legendA").textContent = a.name;
    $("#legendB").textContent = b.name;
    $("#aiEmpty").hidden = false;
    $("#aiResult").hidden = true;
    $$(".topic-tabs button").forEach((button) => {
      const active = button.dataset.topic === state.topic;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    renderPriorities();
    renderTopic();
    renderCandidates();
  }

  function renderPriorities() {
    const items = STAGES[state.stage].priorities;
    $("#priorityList").innerHTML = items.map(([topic, text], index) => `
      <button type="button" data-topic-target="${topic}"><span>0${index + 1}</span><p>${escapeHTML(text)}</p><b>→</b></button>
    `).join("");
    $$('[data-topic-target]', $("#priorityList")).forEach((button) => {
      button.addEventListener("click", () => selectTopic(button.dataset.topicTarget, true));
    });
  }

  function selectTopic(topic, shouldScroll) {
    state.topic = topic;
    state.activeRow = 0;
    $$(".topic-tabs button").forEach((button) => {
      const active = button.dataset.topic === topic;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    renderTopic();
    if (shouldScroll) {
      $(".topic-workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderTopic() {
    const topic = DATA[state.stage][state.topic];
    $("#signalTitle").textContent = topic.title;
    $("#signalDesc").textContent = topic.desc;
    $("#signalList").innerHTML = topic.rows.map((row, index) => {
      const delta = Number((row.a - row.b).toFixed(1));
      const deltaText = delta >= 0 ? `A +${delta.toFixed(1)}` : `B +${Math.abs(delta).toFixed(1)}`;
      return `
        <button class="signal-row${index === state.activeRow ? " active" : ""}" data-index="${index}" type="button">
          <span class="signal-name"><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.sub)} · ${escapeHTML(row.count)}</small></span>
          <span class="dual-track">
            <span class="track-line a"><span>A</span><span class="track-bg"><i style="width:${Math.min(100, row.a * 1.25)}%"></i></span><b>${row.a.toFixed(1)}%</b></span>
            <span class="track-line b"><span>B</span><span class="track-bg"><i style="width:${Math.min(100, row.b * 1.25)}%"></i></span><b>${row.b.toFixed(1)}%</b></span>
          </span>
          <span class="signal-delta${delta < 0 ? " negative" : ""}"><strong>${deltaText}</strong><small>差异百分点</small></span>
        </button>
      `;
    }).join("");
    $$(".signal-row", $("#signalList")).forEach((button) => {
      button.addEventListener("click", () => {
        state.activeRow = Number(button.dataset.index);
        renderTopic();
      });
    });
    renderVoices();
  }

  function renderVoices() {
    const row = DATA[state.stage][state.topic].rows[state.activeRow];
    $("#voiceTitle").textContent = row.name;
    const voices = row.voices.length === 1 ? [row.voices[0], createCounterVoice(row.voices[0])] : row.voices;
    $("#voiceList").innerHTML = voices.slice(0, 3).map((voice, index) => `
      <button class="voice-card group-${voice[0]}" data-voice-index="${index}" type="button">
        <span class="voice-meta"><span>${voice[0].toUpperCase()} 组 · ${escapeHTML(voice[1])}</span><span>${escapeHTML(voice[4])}</span></span>
        <blockquote>${escapeHTML(voice[2])}</blockquote>
        <footer><span>${escapeHTML(voice[3])}</span><b>查看客户证据 →</b></footer>
      </button>
    `).join("");
    $$(".voice-card", $("#voiceList")).forEach((button) => {
      button.addEventListener("click", () => openCustomerDrawer(voices[Number(button.dataset.voiceIndex)], row));
    });
  }

  function createCounterVoice(voice) {
    const group = voice[0] === "a" ? "b" : "a";
    const stageName = group === "a" ? STAGES[state.stage].groups.a.name : STAGES[state.stage].groups.b.name;
    return [group, `客户 C-${group === "a" ? "07642" : "11835"}`, `这条表达在${stageName}客户中也有出现，但当前样本占比较低。`, "华南大区 · 广州大道店", "07-15 10:28"];
  }

  function renderCandidates() {
    const rows = CANDIDATES[state.stage];
    $("#candidateBody").innerHTML = rows.map((row, index) => {
      const statusClass = row[6] === "已采纳" ? "adopted" : row[6] === "不采纳" ? "rejected" : "pending";
      const stableClass = row[5] === "稳定" ? "stable" : "observe";
      return `
        <tr>
          <td class="candidate-name"><strong>${escapeHTML(row[0])}</strong><small>${state.stage === "online" ? "线上邀约" : "线下接待"}</small></td>
          <td>${escapeHTML(row[1])}</td>
          <td class="rate-pair"><span class="a">${row[2]}%</span><i>/</i><span class="b">${row[3]}%</span></td>
          <td><span class="lift-value">${escapeHTML(row[4])}</span></td>
          <td><span class="stability-pill ${stableClass}">${escapeHTML(row[5])}</span></td>
          <td><span class="status-pill ${statusClass}">${escapeHTML(row[6])}</span></td>
          <td><button class="row-action" data-candidate="${index}" type="button">查看证据 →</button></td>
        </tr>
      `;
    }).join("");
    $$("[data-candidate]", $("#candidateBody")).forEach((button) => {
      button.addEventListener("click", () => openCandidateDrawer(Number(button.dataset.candidate)));
    });
  }

  function renderStatusEditor() {
    ["a", "b"].forEach((group) => {
      const other = group === "a" ? "b" : "a";
      const host = $(`.status-grid[data-group="${group}"]`);
      host.innerHTML = STATUS_OPTIONS.map((status) => {
        const selected = state.groups[group].has(status);
        const disabled = state.groups[other].has(status);
        return `<button type="button" data-status="${escapeHTML(status)}" class="${selected ? "selected" : ""}" ${disabled ? "disabled" : ""}>${escapeHTML(status)}</button>`;
      }).join("");
      $$('[data-status]', host).forEach((button) => {
        button.addEventListener("click", () => {
          const status = button.dataset.status;
          if (state.groups[group].has(status)) state.groups[group].delete(status);
          else state.groups[group].add(status);
          renderStatusEditor();
        });
      });
    });
    const ready = state.groups.a.size > 0 && state.groups.b.size > 0;
    $("#startOfflineCompare").disabled = !ready;
    $("#groupValidation").textContent = ready
      ? `已选择 A 组 ${state.groups.a.size} 个、B 组 ${state.groups.b.size} 个状态`
      : "A、B 两组都至少选择 1 个状态";
  }

  function openGroupModal() {
    renderStatusEditor();
    $("#groupModal").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLayer(id) {
    $("#" + id).hidden = true;
    document.body.style.overflow = "";
  }

  function openCustomerDrawer(voice, row) {
    const meta = STAGES[state.stage];
    const groupName = voice[0] === "a" ? meta.groups.a.name : meta.groups.b.name;
    $("#drawerKicker").textContent = "匿名客户证据";
    $("#drawerTitle").textContent = voice[1];
    $("#drawerSubtitle").textContent = `${state.stage === "online" ? "线上邀约" : "线下接待"} · ${groupName}`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section"><h3>已识别客户信号</h3><div class="drawer-tags"><span>${escapeHTML(row.name)}</span><span>${escapeHTML(row.sub)}</span><span>${state.stage === "online" ? "AION V" : "到店接待"}</span><span>${groupName}</span></div></section>
      <section class="drawer-section"><h3>真实对话证据</h3><p class="evidence-line">${escapeHTML(voice[2])}</p><div class="evidence-meta"><span>${escapeHTML(voice[3])}</span><span>${escapeHTML(voice[4])}</span></div></section>
      <section class="drawer-section action-definition"><h3>本次分析边界</h3><dl><dt>客户阶段</dt><dd>${state.stage === "online" ? "首次到店前邀约沟通" : "到店接待与后续跟进"}</dd><dt>对比客群</dt><dd>${escapeHTML(groupName)}</dd><dt>使用范围</dt><dd>仅作为该客户所属客群差异的证据，不生成下一步跟进建议。</dd></dl></section>
    `;
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function openCandidateDrawer(index) {
    const row = CANDIDATES[state.stage][index];
    const evidence = DATA[state.stage].action.rows[Math.min(index, DATA[state.stage].action.rows.length - 1)].voices[0];
    $("#drawerKicker").textContent = "标准销售动作候选";
    $("#drawerTitle").textContent = row[0];
    $("#drawerSubtitle").textContent = `${state.stage === "online" ? "线上邀约" : "线下接待"} · ${row[6]}`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section action-definition"><h3>候选动作定义</h3><dl><dt>客户信号</dt><dd>${escapeHTML(row[1])}</dd><dt>动作要求</dt><dd>${escapeHTML(row[0])}，并在对话中明确客户可确认的内容。</dd><dt>执行率</dt><dd>A 组 ${row[2]}% / B 组 ${row[3]}%</dd><dt>结果率</dt><dd>执行 / 未执行：${escapeHTML(row[4])}</dd><dt>适用范围</dt><dd>全国 · AION V · 当前筛选时间</dd><dt>稳定性</dt><dd>${escapeHTML(row[5])}，仅表达结果关联，不代表因果。</dd></dl></section>
      <section class="drawer-section"><h3>支撑证据</h3><p class="evidence-line">${escapeHTML(evidence[2])}</p><div class="evidence-meta"><span>${escapeHTML(evidence[3])}</span><span>${escapeHTML(evidence[4])}</span></div></section>
      <section class="drawer-section"><h3>管理确认</h3><div class="decision-buttons"><button data-decision="待验证" class="${row[6] === "待验证" ? "active" : ""}" type="button">待验证</button><button data-decision="已采纳" class="${row[6] === "已采纳" ? "active" : ""}" type="button">已采纳</button><button data-decision="不采纳" type="button">不采纳</button></div></section>
    `;
    $$('[data-decision]', $("#drawerBody")).forEach((button) => {
      button.addEventListener("click", () => {
        row[6] = button.dataset.decision;
        $$("[data-decision]", $("#drawerBody")).forEach((item) => item.classList.toggle("active", item === button));
        renderCandidates();
        showToast(`候选动作已标记为“${button.dataset.decision}”`);
      });
    });
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function generateAiSummary() {
    const button = $("#generateAiButton");
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "正在分析 1,145 名客户…";
    window.setTimeout(() => {
      $("#aiSummaryList").innerHTML = STAGES[state.stage].summary.map((item, index) => `<li data-index="${index + 1}">${escapeHTML(item)}</li>`).join("");
      $("#aiEmpty").hidden = true;
      $("#aiResult").hidden = false;
      button.disabled = false;
      button.textContent = "生成 AI 摘要";
    }, 720);
  }

  $$(".stage-tab").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.stage === "offline" && !state.offlineConfigured) {
        openGroupModal();
        return;
      }
      state.stage = button.dataset.stage;
      state.activeRow = 0;
      renderStage();
    });
  });

  $$(".date-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".date-tabs button").forEach((item) => item.classList.toggle("active", item === button));
      if (state.stage === "overview") {
        $("#overviewAiResult").hidden = true;
        showToast(`时间范围已切换为“${button.textContent}”，经营总览已更新`);
      } else {
        $("#aiEmpty").hidden = false;
        $("#aiResult").hidden = true;
        showToast(`时间范围已切换为“${button.textContent}”，AI 摘要待重新生成`);
      }
    });
  });

  $$(".topic-tabs button").forEach((button) => {
    button.addEventListener("click", () => selectTopic(button.dataset.topic, false));
  });

  $$(".scope-fields select").forEach((select) => {
    select.addEventListener("change", () => {
      if (select.id === "brandFilter") syncModelOptions();
      if (state.stage === "overview") renderOverview();
      $("#aiEmpty").hidden = false;
      $("#aiResult").hidden = true;
      $("#overviewAiResult").hidden = true;
      showToast(state.stage === "overview" ? "经营范围已更新" : "分析范围已更新，AI 摘要待重新生成");
    });
  });

  $("#applyPreset").addEventListener("click", () => {
    state.groups.a = new Set(["已下订", "异地成交"]);
    state.groups.b = new Set(["战败", "战败申请中"]);
    renderStatusEditor();
  });

  $("#startOfflineCompare").addEventListener("click", () => {
    if (!state.groups.a.size || !state.groups.b.size) return;
    STAGES.offline.groups.a.name = Array.from(state.groups.a).join("、");
    STAGES.offline.groups.b.name = Array.from(state.groups.b).join("、");
    state.offlineConfigured = true;
    state.stage = "offline";
    state.topic = state.pendingTopic || state.topic || "need";
    state.pendingTopic = null;
    state.activeRow = 0;
    closeLayer("groupModal");
    renderStage();
    showToast("线下接待客群已配置，已生成对比结果");
  });

  $("#editGroupsButton").addEventListener("click", openGroupModal);
  $("#generateAiButton").addEventListener("click", generateAiSummary);
  $("#regenerateButton").addEventListener("click", () => {
    $("#aiEmpty").hidden = false;
    $("#aiResult").hidden = true;
    generateAiSummary();
  });

  $("#resetFilters").addEventListener("click", () => {
    $$(".scope-fields select").forEach((select) => { select.selectedIndex = 0; });
    syncModelOptions();
    $("#aiEmpty").hidden = false;
    $("#aiResult").hidden = true;
    $("#overviewAiResult").hidden = true;
    if (state.stage === "overview") renderOverview();
    showToast("经营范围已重置");
  });

  $$("[data-enter-stage]").forEach((button) => {
    button.addEventListener("click", () => goToStage(button.dataset.enterStage, "need"));
  });

  $$("[data-overview-topic]").forEach((button) => {
    button.addEventListener("click", () => goToStage(button.dataset.overviewStage, button.dataset.overviewTopic));
  });

  $("#matrixSort").addEventListener("change", renderOverview);
  $("#generateOverviewAi").addEventListener("click", () => {
    const button = $("#generateOverviewAi");
    button.disabled = true;
    button.textContent = "正在生成…";
    window.setTimeout(() => {
      $("#overviewAiText").textContent = getOverviewBrand().summary;
      $("#overviewAiResult").hidden = false;
      button.disabled = false;
      button.textContent = "AI 生成经营摘要";
    }, 620);
  });
  $("#closeOverviewAi").addEventListener("click", () => { $("#overviewAiResult").hidden = true; });
  $("#viewPriorityRules").addEventListener("click", () => showToast("优先级由影响客户数、异常程度、持续性、可控程度和数据稳定性共同决定"));
  $("#viewAllOrgs").addEventListener("click", () => showToast("已展开全部大区、经销商与门店数据"));
  $$(".org-list button").forEach((button) => button.addEventListener("click", () => showToast(`已选择${button.querySelector("strong").textContent}，总览范围已更新`)));
  $$(".mini-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".mini-tabs button").forEach((item) => item.classList.toggle("active", item === button));
      showToast(`趋势指标已切换为“${button.textContent}”`);
    });
  });

  $("#exportButton").addEventListener("click", () => showToast("当前视图已加入导出任务"));
  $("#exportAdopted").addEventListener("click", () => showToast("已采纳动作已加入导出任务"));
  $("#generateCandidate").addEventListener("click", () => showToast("已基于当前范围更新标准动作候选"));
  $("#viewAllVoices").addEventListener("click", () => showToast("已展示该信号的全部脱敏客户原声"));
  $("#exceptionButton").addEventListener("click", () => showToast(state.stage === "online" ? "103 条数据因身份或到店记录无法匹配" : "16 名重叠客户已单列，不进入差异计算"));

  $$('[data-close]').forEach((button) => button.addEventListener("click", () => closeLayer(button.dataset.close)));
  $("#groupModal").addEventListener("click", (event) => { if (event.target === $("#groupModal")) closeLayer("groupModal"); });
  $("#detailDrawer").addEventListener("click", (event) => { if (event.target === $("#detailDrawer")) closeLayer("detailDrawer"); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!$("#detailDrawer").hidden) closeLayer("detailDrawer");
    else if (!$("#groupModal").hidden) closeLayer("groupModal");
  });

  syncModelOptions();
  renderStage();
})();
