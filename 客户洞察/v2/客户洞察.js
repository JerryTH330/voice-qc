(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STAGES = {
    online: {
      kicker: "邀约场景 · 阶段结果",
      title: "客群对比分析",
      desc: "以首条邀约类录音为 T0，只使用首次到店前或观察窗口结束前的对话证据。",
      rule: "先按线索旅程判断结果，再在客群内按手机号去重；未完整经过窗口且尚未到店的样本不纳入分析。",
      groups: {
        a: { name: "最终到店", customers: 462, valid: 436, rate: 37.0 },
        b: { name: "最终未到店", customers: 786, valid: 709, rate: 63.0 }
      },
      total: 1248,
      valid: 1145,
      exceptions: 103,
      overlap: 18,
      journeys: 1286,
      recordings: 2836,
      summary: [
        "到店客户更集中表达家庭多人出行和试驾体验需求；其中“家庭多人出行”比未到店组高 13.4 个百分点。",
        "未到店客户更常提到价格预算、到店时间和竞品比较未完成；价格顾虑在华东部分门店更集中，建议管理层核查报价表达是否一致。",
        "“提供两个可选到店时间”在到店组动作完成率为 68.2%，比未到店组高 26.5 个百分点；这是关联差异，仍需结合客户紧迫性进一步验证。"
      ]
    },
    offline: {
      kicker: "门店场景 · 线索状态对比",
      title: "客群对比分析",
      desc: "按业务选择的真实线索状态分组，比较成交前或统计截止日前的接待对话。",
      rule: "线下以首次真实到店为 T0；重叠客户在两组分别保留，各项占比仍使用各组客户作为分母。",
      groups: {
        a: { name: "已下订、异地成交", customers: 328, valid: 314, rate: 31.5 },
        b: { name: "战败、战败申请中", customers: 714, valid: 668, rate: 68.5 }
      },
      total: 1058,
      valid: 982,
      exceptions: 16,
      overlap: 16,
      journeys: 1096,
      recordings: 2418,
      summary: [
        "A 组更集中表达家庭空间、试驾体验和具体配置选择，B 组则更常出现落地价超预算与竞品更有吸引力。",
        "完整解释价格构成在 A 组动作完成率为 72.6%，比 B 组高 22.8 个百分点；不同门店差异较大，适合先在华东大区验证。",
        "宋 PLUS DM-i 是两组提及最多的竞品；B 组关于月供和置换估值的负面表达更集中，客户对话价格仅作情报，不等同官方价格。"
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
    testdrive: {
      title: "业务试驾事实与 AI 对话试驾状态",
      desc: "两种口径分别统计：业务事件判断真实完成，AI 标签反映对话中表达或识别到的试驾状态",
      rows: [
        { name: "业务事件：已完成试驾", sub: "外部试驾事件 · 已有能力", a: 74.2, b: 51.6, count: "578 人", voices: [["a", "客户 C-21477", "试驾业务事件：07-16 16:08 完成，录音证据发生在成交状态前。", "西南大区 · 成都机场路店", "07-16 16:08"]] },
        { name: "对话识别：已试驾", sub: "AI 对话标签 · 已有能力", a: 69.8, b: 48.9, count: "542 人", voices: [["a", "客户 C-20516", "客户：刚才试下来转向比较轻，底盘也比我预期稳。", "华东大区 · 上海中心店", "07-18 15:20"]] },
        { name: "对话识别：已约试驾", sub: "AI 对话标签 · 已有能力", a: 8.6, b: 15.4, count: "131 人", voices: [["b", "客户 C-22073", "客户：今天时间不够，先约周末再回来试驾。", "华南大区 · 广州大道店", "07-17 13:08"]] },
        { name: "对话识别：拒绝试驾", sub: "AI 对话标签 · 已有能力", a: 3.1, b: 9.8, count: "75 人", voices: [["b", "客户 C-22918", "客户：空间已经不太合适了，今天就先不试了。", "华南大区 · 深圳龙岗店", "07-17 17:06"]] },
        { name: "业务与对话口径不一致", sub: "待复盘样本", a: 4.4, b: 6.7, count: "58 人", voices: [["b", "客户 C-23764", "系统存在试驾事件，但当前证据窗口内未识别到明确试驾表达。", "华中大区 · 武汉光谷店", "07-15 11:38"]] }
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

  const UNIFIED_ACTIONS = {
    online: [
      ["确认意向车型", "已有 SOP", "1,086", "82.4%", "76.8%", "41.2%", "sop"],
      ["确认购车关注点", "已有 SOP", "1,042", "78.1%", "70.5%", "40.6%", "sop"],
      ["确认对比车型", "已有 SOP", "684", "63.7%", "57.9%", "43.1%", "sop"],
      ["确认增换购情况", "已有 SOP", "736", "69.2%", "64.8%", "39.7%", "sop"],
      ["确认计划购车时间", "已有 SOP", "1,018", "73.5%", "68.2%", "42.8%", "sop"],
      ["提出试乘试驾邀请", "已有 SOP", "946", "71.6%", "66.4%", "44.5%", "sop"],
      ["提出添加微信邀请", "已有 SOP", "892", "67.9%", "62.1%", "40.3%", "sop"],
      ["针对客户明确顾虑进行回应", "新增识别", "511", "55.6%", "—", "42.3%", "new"],
      ["约定下一次具体跟进动作", "新增识别", "669", "61.4%", "—", "38.7%", "new"]
    ],
    offline: [
      ["完整需求探询", "新增识别", "812", "68.7%", "—", "37.9%", "new"],
      ["结合需求进行产品讲解", "新增识别", "746", "64.8%", "—", "41.2%", "new"],
      ["安排并完成试乘试驾", "新增识别", "778", "74.2%", "—", "39.8%", "new"],
      ["提供清晰报价并解释构成", "新增识别", "773", "72.6%", "—", "39.6%", "new"],
      ["提供金融测算或置换评估", "新增识别", "612", "45.8%", "—", "34.7%", "new"],
      ["处理关键异议", "新增识别", "684", "58.9%", "—", "38.4%", "new"]
    ]
  };

  const METRIC_GLOSSARY = [
    ["完整样本批次", "按观察期结束日期选择已经走完整个结果观察期的客户批次，不代表最近刚进入阶段的客户。", "系统根据观察期结束日期自动反推 T0 范围"],
    ["结果观察期", "从每位客户的阶段起点开始，向后观察 7、15 或 30 天，用于判断是否到店或成交。只有观察期已经结束的客户才进入结果分析。", "不涉及分子分母"],
    ["可判断客户", "已经出现目标结果，或虽未出现目标结果但已经完整经过结果观察期的去重客户。", "未完整经过观察期且尚无目标结果的客户不计入"],
    ["可分析客户", "在证据窗口内至少有一条完成转写并可用于内容分析录音的去重客户。", "客户级去重"],
    ["可分析客户覆盖率", "结果客群中有多少客户具备可用录音。", "可分析客户数 ÷ 当前结果客群客户数"],
    ["N 日内到店客户占比", "线上客户在结果观察期内发生真实到店的比例。", "N 日内已到店客户数 ÷ 线上可判断客户数"],
    ["到店后 N 日成交客户占比", "线下客户在首次真实到店后的观察期内进入选定成交状态的比例。", "N 日成交客户数 ÷ 线下可判断客户数"],
    ["标签/阶段难点客户占比", "当前客群中命中某个客户标签或阶段难点的比例。", "命中该标签或难点的去重客户数 ÷ 当前客群可分析客户数"],
    ["A/B 占比差值", "同一信号在两组中的占比差异，单位为百分点。", "A 组占比 − B 组占比"],
    ["动作机会客户", "当前场景下有必要执行某个动作的客户。", "SOP 适用客户，或模型识别出动作触发条件的去重客户"],
    ["动作完成率", "存在动作机会的客户中，销售实际完成该动作的比例。", "完成动作客户数 ÷ 动作机会客户数"],
    ["SOP 合格率", "已有 SOP 动作完成后，同时满足规则标准的客户比例。", "SOP 合格客户数 ÷ SOP 适用客户数"],
    ["动作客户目标结果率", "完成某动作的客户中进入当前目标结果的比例。线上目标结果为 N 日内到店，线下为到店后 N 日成交或用户选定状态。", "完成动作且进入目标结果客户数 ÷ 完成动作客户数；只表示关联，不代表因果"],
    ["完成/未完成目标结果率", "分别比较完成动作和未完成动作客户进入目标结果的比例。", "两组独立计算；只用于观察关联差异"],
    ["稳定性", "判断差异是否具备足够样本，并在连续周期和不同组织中方向一致。", "综合样本量、连续周期、组织一致性和证据完整度"],
    ["竞品提及客户占比", "当前客群中明确提及某个竞品的客户比例。", "提及竞品客户数 ÷ 当前客群可分析客户数"],
    ["重叠客户", "同一手机号因不同线索旅程同时进入 A、B 两组的客户。", "两组分别保留，各组占比仍以本组客户为分母"],
    ["未成熟客户", "尚未完整经过结果观察期的客户，即使已经提前发生目标结果，也不会混入当前完整样本批次。", "等待观察期结束后再统一进入对应结果批次"]
  ];

  const OVERVIEW_BRANDS = {
    "埃安": {
      online: 3486,
      onlineValid: 3272,
      arrivals: 1368,
      arrivalRate: 39.2,
      offline: 1412,
      offlineValid: 1327,
      linked: 1302,
      summary: "埃安品牌到店率本周升至 39.2%，但 AION V 仍低于品牌均值 2.2 个百分点。华东大区的价格预算顾虑影响范围最大；“完整解释价格构成”动作完成率低于品牌基准，建议优先进入门店场景验证。",
      models: [
        { name: "AION V", series: "主力 SUV", invite: 1248, valid: 1182, arrival: 37.0, orders: 138, contribution: 30.3, scenes: ["购车紧迫性低", "到店时间不便", "价格或预算顾虑", "落地价超预算", "拒绝试驾"], competitor: "宋 PLUS", trend: -1.8, priority: 96 },
        { name: "AION Y Plus", series: "紧凑型 SUV", invite: 986, valid: 929, arrival: 42.6, orders: 152, contribution: 33.4, scenes: ["竞品比较未完成", "到店时间不便", "距离或交通不便", "贷款总成本压力", "已约试驾"], competitor: "银河 E5", trend: 3.1, priority: 82 },
        { name: "AION S Plus", series: "纯电轿车", invite: 731, valid: 682, arrival: 36.8, orders: 86, contribution: 18.9, scenes: ["购车紧迫性低", "到店时间不便", "竞品比较未完成", "竞品更有吸引力", "拒绝试驾"], competitor: "秦 PLUS", trend: 0.4, priority: 74 },
        { name: "AION RT", series: "智能轿车", invite: 521, valid: 479, arrival: 43.2, orders: 79, contribution: 17.4, scenes: ["—", "到店时间不便", "距离或交通不便", "家庭决策未完成", "业务与对话口径不一致"], competitor: "小鹏 MONA", trend: 2.7, priority: 63 }
      ],
      attention: [
        { stage: "online", topic: "resistance", label: "邀约场景", change: "+8.6%", title: "先查 AION V 的价格顾虑", detail: "483 名客户出现价格或预算顾虑，华东大区最集中", meta: "已连续上升 3 周", recommendation: "查看未到店客户原声，确认报价和预算引导哪里断了" },
        { stage: "offline", topic: "action", label: "门店场景", change: "-7.4pp", title: "再统一价格构成说明", detail: "762 名客户需要说明价格，动作完成率仅 58.6%", meta: "已连续低于基准 2 期", recommendation: "优先复盘低完成门店，统一裸车、保险、金融和置换说明" },
        { stage: "offline", topic: "competitor", label: "竞品对比", change: "+5.2%", title: "最后补齐宋 PLUS 对比口径", detail: "642 名客户提及宋 PLUS，战败组更集中", meta: "已连续上升 2 期", recommendation: "聚焦客户最常比较的价格与后排空间，整理对比话术" }
      ]
    },
    "传祺": {
      online: 2964,
      onlineValid: 2778,
      arrivals: 1187,
      arrivalRate: 40.0,
      offline: 1228,
      offlineValid: 1154,
      linked: 1149,
      summary: "传祺品牌到店率保持在 40.0%。E9 的家庭空间需求明确，但金融月供顾虑在未到店与战败客群中同时上升；M8 的试驾后异议处理动作执行较稳定，可作为横向验证对象。",
      models: [
        { name: "传祺 E9", series: "新能源 MPV", invite: 936, valid: 884, arrival: 41.8, orders: 144, contribution: 32.9, scenes: ["价格或预算顾虑", "到店时间不便", "竞品比较未完成", "贷款总成本压力", "已约试驾"], competitor: "腾势 D9", trend: 1.6, priority: 91 },
        { name: "传祺 M8", series: "豪华 MPV", invite: 812, valid: 763, arrival: 43.5, orders: 136, contribution: 31.1, scenes: ["购车紧迫性低", "到店时间不便", "距离或交通不便", "置换估值不满意", "—"], competitor: "别克 GL8", trend: 2.2, priority: 78 },
        { name: "传祺 GS8", series: "中大型 SUV", invite: 704, valid: 657, arrival: 37.4, orders: 93, contribution: 21.2, scenes: ["竞品比较未完成", "到店时间不便", "价格或预算顾虑", "竞品更有吸引力", "拒绝试驾"], competitor: "星越 L", trend: -1.1, priority: 84 },
        { name: "传祺 ES9", series: "新能源 SUV", invite: 512, valid: 474, arrival: 35.0, orders: 65, contribution: 14.8, scenes: ["—", "到店时间不便", "购车紧迫性低", "家庭决策未完成", "业务与对话口径不一致"], competitor: "理想 L6", trend: -2.4, priority: 88 }
      ],
      attention: [
        { stage: "online", topic: "resistance", label: "邀约场景", change: "+6.1%", title: "先查 E9 的金融月供顾虑", detail: "356 名客户出现金融月供顾虑，华南大区最集中", meta: "已连续上升 2 周", recommendation: "查看未到店客户原声，确认月供解释和预算匹配哪里断了" },
        { stage: "offline", topic: "action", label: "门店场景", change: "-5.8pp", title: "再补齐 GS8 置换评估", detail: "418 名客户存在置换机会，动作完成率仅 52.4%", meta: "已连续低于基准 2 期", recommendation: "优先复盘低完成门店，统一置换估值与补贴说明" },
        { stage: "offline", topic: "competitor", label: "竞品对比", change: "+4.7%", title: "最后补齐腾势 D9 对比口径", detail: "487 名客户提及腾势 D9，价格提及持续增加", meta: "已连续上升 2 期", recommendation: "聚焦金融方案与二排体验，整理可复用的对比话术" }
      ]
    }
  };

  const buildDeepInsightTopics = (rows) => rows.map((row) => ({
    name: row[0],
    customers: row[1],
    share: row[2],
    change: row[3],
    sentiment: row[4],
    voices: [
      { sentiment: "positive", text: row[5] },
      { sentiment: "neutral", text: row[6] },
      { sentiment: "negative", text: row[7] }
    ]
  }));

  const DEEP_INSIGHTS = {
    product: {
      label: "产品深度洞察",
      topics: buildDeepInsightTopics([
        ["空间", 612, 46.4, 1.8, [54, 32, 14], "二排腿部空间比我预想的宽，家里人坐着也比较舒服。", "空间参数看起来够用，我还想带家人到店实际坐一下。", "第三排坐成年人还是偏挤，长途出行可能不太合适。"],
        ["续航", 582, 44.1, -0.6, [42, 33, 25], "日常通勤的实际续航够用，一周充一次电可以接受。", "官方续航我看过了，还想确认高速和冬天的实际表现。", "高速续航下降得比预期多，长途出行让我有些担心。"],
        ["智能驾驶", 528, 40.0, 1.2, [57, 28, 15], "辅助驾驶在城市快速路上比较顺手，跟车也很自然。", "功能挺多，但我还需要试驾确认操作是不是容易上手。", "有些提示出现得太频繁，实际使用时反而会分心。"],
        ["外观", 470, 35.6, 0.4, [61, 29, 10], "车身比例和前脸都很耐看，实车比图片更有质感。", "外观没有明显问题，最后还是要结合配置和价格判断。", "尾部造型不是我喜欢的风格，看起来稍微有点厚重。"],
        ["内饰", 446, 33.8, -0.3, [50, 33, 17], "内饰颜色和整体做工不错，坐进去感觉比较舒服。", "设计比较简洁，但材质还要到店近距离看一下。", "经常接触的位置塑料感偏强，没有达到我的预期。"],
        ["座椅舒适", 408, 30.9, 0.9, [58, 27, 15], "座椅支撑和软硬度都合适，长时间乘坐应该不会累。", "前排体验还可以，我更关心后排坐久了是否舒服。", "座垫对腿部支撑不够，长途乘坐可能会比较累。"],
        ["充电补能", 375, 28.4, -0.5, [38, 35, 27], "附近快充站很多，日常补能对我来说比较方便。", "有家充条件基本没问题，偶尔长途还要看沿途充电。", "小区装不了家充，平时排队充电会比较麻烦。"],
        ["配置丰富", 346, 26.2, 0.7, [49, 32, 19], "常用舒适配置基本都有，不需要再额外选装很多。", "配置表看起来比较完整，但我只关心日常真正能用到的。", "这个版本缺少我在意的功能，升级配置后价格又高了。"],
        ["操控", 298, 22.6, 0.2, [45, 37, 18], "转向轻松，城市里开起来很灵活，停车也比较方便。", "短距离试驾感觉正常，还想体验高速和连续弯道。", "刹车脚感和我现在的车差别较大，需要时间适应。"],
        ["服务体验", 261, 19.8, -0.8, [41, 36, 23], "销售回复很及时，讲解也能围绕我的需求展开。", "目前沟通正常，后续还要看报价和交付是否透明。", "不同销售说法不太一致，让我对后续服务有些担心。"]
      ])
    },
    policy: {
      label: "金融政策深度洞察",
      topics: buildDeepInsightTopics([
        ["落地价", 649, 49.2, 2.4, [31, 34, 35], "各项费用都列得很清楚，最终价格在我的预算范围内。", "我需要确认保险、金融和上牌费用都算进去后的价格。", "算完所有费用比最初报价高不少，已经超出我的预算。"],
        ["贷款利率", 564, 42.7, 1.1, [36, 40, 24], "这个利率和还款周期可以接受，总成本也比较清楚。", "月供看起来合适，但我还要确认实际年化利率。", "宣传利率和最终测算有差异，贷款总成本偏高。"],
        ["月供", 510, 38.6, -0.4, [39, 41, 20], "月供控制在我能接受的范围，不会影响日常支出。", "月供数字没问题，但要结合首付和尾款一起考虑。", "月供比原先预期高，当前方案对我压力比较大。"],
        ["首付", 450, 34.1, 0.8, [44, 35, 21], "低首付方案能减少当前压力，资金安排更灵活。", "首付比例还可以调整，我需要比较不同方案的总成本。", "要求的首付金额太高，暂时拿不出这么多现金。"],
        ["置换补贴", 381, 28.9, 1.6, [48, 31, 21], "补贴加上旧车估值后，换车成本比预期低一些。", "政策我了解了，但还要等旧车实际评估后才能判断。", "旧车估值偏低，补贴也没有弥补和外部报价的差距。"],
        ["免息政策", 334, 25.3, -0.2, [52, 30, 18], "免息方案比较直接，分期总成本也容易算清楚。", "免息期限和适用车型还要确认，再决定是否使用。", "虽然写着免息，但附加条件和费用比较多。"],
        ["金融服务费", 296, 22.4, 0.5, [18, 38, 44], "服务费已经包含在透明报价里，金额也能够接受。", "这项费用具体包含什么服务，我还需要进一步确认。", "贷款之外还要收服务费，整体算下来不太划算。"],
        ["保险费用", 265, 20.1, -0.3, [27, 45, 28], "保险项目和价格都说明得比较清楚，没有额外增加。", "我想比较店内保险和自己购买的价格差异。", "店内保险报价明显偏高，而且可选择的方案不多。"],
        ["购车权益", 222, 16.8, 0.6, [55, 32, 13], "赠送的保养和充电权益都比较实用，能降低后续成本。", "权益项目很多，我更关心使用期限和具体限制。", "部分权益实际用不上，不能替代现金优惠。"],
        ["交付政策", 187, 14.2, -0.7, [33, 42, 25], "交付时间明确，手续也可以一次办理完成。", "目前只能给大概时间，我还要结合用车安排再决定。", "等待周期太长，而且延期后的处理方式不够清楚。"]
      ])
    },
    competitor: {
      label: "竞品深度洞察",
      topics: buildDeepInsightTopics([
        ["宋 PLUS DM-i", 602, 45.6, 1.9, [47, 31, 22], "宋 PLUS 的价格和油电兼顾能力对我比较有吸引力。", "我会把两台车都试一遍，重点比较空间和实际能耗。", "它的车机体验没有达到预期，我更倾向现在看的车型。"],
        ["银河 E5", 510, 38.6, -0.5, [44, 36, 20], "银河 E5 的落地价更接近预算，配置也比较完整。", "两款车差距不大，我还要比较后排空间和补能效率。", "试驾后感觉底盘质感一般，没有想象中那么稳。"],
        ["小鹏 MONA M03", 432, 32.7, 1.3, [53, 29, 18], "它的智能驾驶和座舱体验不错，年轻化设计也很吸引我。", "智能功能有优势，但我还要考虑空间和售后便利性。", "后排乘坐和储物空间不太适合我的家庭需求。"],
        ["理想 L6", 389, 29.4, 0.7, [56, 28, 16], "理想 L6 的家庭配置和增程方式比较符合我的使用场景。", "产品定位不同，我会重点比较空间体验和总预算。", "价格超出我的预算，而且车身尺寸对日常停车不太方便。"],
        ["腾势 D9", 321, 24.3, 1.1, [58, 27, 15], "二排舒适性和商务感很强，家里人体验后比较认可。", "我会继续比较两款车的金融方案和长期使用成本。", "车身太大，平时城市通勤和停车对我来说压力较大。"],
        ["深蓝 S07", 292, 22.1, -0.4, [43, 35, 22], "外观和智能座舱符合我的偏好，价格也有竞争力。", "还要试驾确认底盘和实际续航，再和当前车型比较。", "后排舒适度一般，内饰细节也没有达到预期。"],
        ["零跑 C10", 259, 19.6, 0.3, [46, 34, 20], "配置和空间对应这个价格很有吸引力，性价比比较高。", "品牌和产品都还在了解，需要多看一些真实车主反馈。", "我比较担心后续保值和服务网点覆盖。"],
        ["星越 L", 224, 17.0, -0.2, [49, 33, 18], "内饰质感和动力表现不错，试驾感受比较成熟。", "燃油和新能源路线不同，我还要比较长期使用成本。", "城市油耗比我预期高，不太符合日常通勤需求。"],
        ["别克 GL8", 198, 15.0, 0.6, [45, 37, 18], "空间和商务接待能力很成熟，乘坐体验也比较稳定。", "我会比较两款车的二排舒适性、配置和用车成本。", "智能配置和能耗表现相对传统，不符合我的主要需求。"],
        ["零跑 C11", 174, 13.2, -0.6, [42, 38, 20], "车内空间和配置比较全面，价格也在可接受范围。", "目前只是初步了解，还要确认续航和售后服务。", "部分功能操作不够顺手，试驾体验没有打动我。"]
      ])
    }
  };

  const DEEP_EVALUATION_LABELS = {
    product: {
      "空间": [["二排乘坐空间", "储物空间实用", "家庭场景适配"], ["第三排空间", "后备厢容量", "多人长途舒适"]],
      "续航": [["通勤续航", "能耗表现", "续航达成率"], ["高速续航", "冬季续航", "续航稳定性"]],
      "智能驾驶": [["跟车体验", "功能丰富度", "操作便利性"], ["提示干扰", "复杂路况表现", "功能学习成本"]],
      "外观": [["车身比例", "前脸设计", "实车质感"], ["尾部造型", "颜色选择", "设计耐看度"]],
      "内饰": [["配色设计", "整体做工", "座舱氛围"], ["材质质感", "细节处理", "易清洁性"]],
      "座椅舒适": [["座椅支撑", "软硬适中", "前排包裹性"], ["腿部承托", "后排久坐", "长途舒适"]],
      "充电补能": [["快充便利", "家充适配", "补能速度"], ["家充安装", "高峰排队", "长途补能"]],
      "配置丰富": [["常用配置齐全", "舒适配置实用", "版本选择清晰"], ["关键配置缺失", "高配价格", "配置利用率"]],
      "操控": [["转向轻松", "城市灵活", "停车便利"], ["刹车脚感", "高速稳定", "连续弯道体验"]],
      "服务体验": [["响应及时", "讲解专业", "需求理解"], ["说法不一致", "报价透明度", "交付承诺"]]
    },
    policy: {
      "落地价": [["费用清晰", "预算匹配", "报价可信"], ["总价超预算", "费用不透明", "前后报价差异"]],
      "贷款利率": [["利率可接受", "周期灵活", "总成本清晰"], ["实际年化偏高", "宣传测算差异", "贷款总成本"]],
      "月供": [["月供可承受", "还款安排灵活", "现金流压力低"], ["月供偏高", "首尾款压力", "长期支出压力"]],
      "首付": [["低首付灵活", "资金占用少", "比例可调整"], ["首付金额高", "可选比例少", "总成本增加"]],
      "置换补贴": [["补贴力度", "换车成本降低", "流程便利"], ["旧车估值低", "补贴限制多", "外部报价差距"]],
      "免息政策": [["分期成本低", "规则直接", "期限合适"], ["附加费用", "适用车型限制", "免息期限短"]],
      "金融服务费": [["报价已包含", "收费可接受", "服务内容清楚"], ["额外收费", "服务内容不清", "整体不划算"]],
      "保险费用": [["项目清晰", "价格合理", "方案完整"], ["店内报价高", "选择空间少", "捆绑要求"]],
      "购车权益": [["保养权益实用", "充电权益实用", "长期成本降低"], ["使用限制多", "权益不适用", "不能替代现金"]],
      "交付政策": [["时间明确", "手续便利", "交付承诺清晰"], ["等待周期长", "延期规则不清", "进度不可见"]]
    },
    competitor: {
      "宋 PLUS DM-i": [["价格竞争力", "油电兼顾", "配置完整"], ["车机体验", "底盘质感", "设计偏好"]],
      "银河 E5": [["落地价", "配置完整度", "补能效率"], ["底盘质感", "后排空间", "品牌信任"]],
      "小鹏 MONA M03": [["智能驾驶", "智能座舱", "年轻化设计"], ["后排空间", "储物空间", "售后便利"]],
      "理想 L6": [["家庭配置", "增程方式", "空间体验"], ["价格预算", "车身尺寸", "停车便利"]],
      "腾势 D9": [["二排舒适", "商务质感", "家庭认可"], ["车身尺寸", "城市通勤", "停车压力"]],
      "深蓝 S07": [["外观设计", "智能座舱", "价格竞争力"], ["后排舒适度", "内饰细节", "底盘与续航"]],
      "零跑 C10": [["配置丰富", "空间表现", "性价比"], ["保值预期", "服务网点", "品牌信任"]],
      "星越 L": [["内饰质感", "动力表现", "驾驶成熟度"], ["城市油耗", "长期成本", "新能源偏好"]],
      "别克 GL8": [["空间表现", "商务接待", "乘坐稳定"], ["智能配置", "能耗表现", "产品新鲜度"]],
      "零跑 C11": [["车内空间", "配置全面", "价格范围"], ["功能操作", "续航确认", "售后服务"]]
    }
  };

  const REGION_MODEL_INSIGHTS = {
    models: ["AION V", "AION Y Plus", "AION S Plus", "AION RT", "传祺 E9", "传祺 M8", "传祺 GS8", "传祺 ES9"],
    regions: [
      "华东大区", "华南大区", "华北大区", "华中大区", "西南大区",
      "西北大区", "东北大区", "京津大区", "冀鲁大区", "苏皖大区",
      "浙沪大区", "闽赣大区", "两广大区", "海南大区", "豫鄂大区",
      "湘赣大区", "川渝大区", "云贵大区", "陕甘宁大区", "晋蒙大区",
      "辽吉大区", "黑龙江大区", "新疆大区"
    ],
    values: [
      [12.6, 6.2, 7.1, 5.0, 6.4, 4.1, 8.0, 5.7],
      [5.3, 4.7, 6.8, 4.2, 8.3, 6.0, 6.5, 5.4],
      [4.9, 9.1, 6.0, 5.6, 5.0, 4.7, 7.2, 6.1],
      [3.6, 4.1, 5.2, 4.7, 4.2, 3.5, 5.9, 4.8],
      [3.1, 3.8, 5.6, 3.9, 4.6, 3.2, 5.1, 4.3]
    ],
    categories: {
      resistance: { labels: ["价格敏感", "空间不满", "续航担忧", "对比犹豫", "金融方案不满", "服务不满", "配置不满", "交付周期不满"], hotLabels: ["价格敏感", "空间不满", "续航担忧", "对比犹豫", "充电不便", "贷款压力", "品牌顾虑", "交付周期长", "配置不满", "服务体验不满"], factor: 1, offset: 0 },
      payment: { labels: ["分期意向", "全款意向", "首付敏感", "利息敏感", "分期意向", "全款意向", "首付敏感", "利息敏感"], hotLabels: ["分期付款", "全款付款", "低首付方案", "金融贷款", "置换抵扣", "其他支付方式"], factor: 0.82, offset: 1.1 },
      decision: { labels: ["本月决策", "下月决策", "本周决策", "时间未定", "季度内决策", "本月决策", "下月决策", "时间未定"], hotLabels: ["本周决策", "本月决策", "下月决策", "季度内决策", "半年内决策", "时间未定", "家人共同决策"], factor: 0.76, offset: 1.5 },
      intent_model: { labels: ["AION V", "AION Y Plus", "AION S Plus", "AION RT", "传祺 E9", "传祺 M8", "传祺 GS8", "传祺 ES9"], hotLabels: [], factor: 0.88, offset: 0.9 },
      trade_in: { labels: ["有旧车待置换", "无旧车", "咨询置换政策", "旧车已处理", "有旧车待置换", "咨询置换政策", "旧车已处理", "无旧车"], hotLabels: ["有旧车待置换", "无旧车", "咨询置换政策", "关注置换估值", "关注置换补贴", "旧车已处理"], factor: 0.72, offset: 1.8 },
      timing: { labels: ["1 个月内", "3 个月内", "1 个月内", "时间未定", "1 个月内", "3 个月内", "季度内", "时间未定"], hotLabels: ["一周内", "半个月内", "1 个月内", "3 个月内", "半年内", "时间未定"], factor: 0.68, offset: 2.1 },
      driver: { labels: ["本人使用", "家庭共用", "配偶使用", "本人使用", "商务接待", "家庭共用", "本人使用", "配偶使用"], hotLabels: ["本人使用", "家庭共用", "配偶使用", "子女使用", "商务接待"], factor: 0.79, offset: 1.3 },
      occupation: { labels: ["企业职员", "个体经营", "公务人员", "自由职业", "企业主", "企业管理", "个体经营", "企业职员"], hotLabels: ["企业职员", "个体经营", "自由职业", "企业主", "企业管理", "公务人员", "专业技术人员", "退休人员"], factor: 0.66, offset: 2.2 },
      competitor: { labels: ["宋 PLUS", "银河 E5", "秦 PLUS", "小鹏 MONA", "腾势 D9", "别克 GL8", "星越 L", "理想 L6"], hotLabels: ["宋 PLUS", "银河 E5", "秦 PLUS", "小鹏 MONA", "腾势 D9", "别克 GL8", "星越 L", "理想 L6", "深蓝 S07", "零跑 C10"], factor: 0.91, offset: 0.5 },
      test_drive: { labels: ["已约试驾", "未试驾", "拒绝试驾", "已试驾", "已约试驾", "已试驾", "未试驾", "拒绝试驾"], hotLabels: ["已试驾", "已约试驾", "未试驾", "拒绝试驾"], factor: 0.84, offset: 1.0 },
      scenario: { labels: ["家庭出行", "日常通勤", "跑网约车", "长途自驾", "商务用车", "家庭出行", "长途自驾", "日常通勤"], hotLabels: ["家庭出行", "日常通勤", "长途自驾", "商务用车", "接送孩子", "跑网约车", "周末出游", "多人乘坐"], factor: 0.8, offset: 1.2 },
      need: { labels: ["空间大", "家用合适", "省油省电", "智能科技", "舒适乘坐", "商务接待", "动力强", "安全配置"], hotLabels: ["空间宽敞", "续航充足", "能耗经济", "智能座舱", "辅助驾驶", "乘坐舒适", "动力充足", "安全配置", "充电便利", "外观设计"], factor: 0.86, offset: 1.2 },
      budget: { labels: ["15—20万", "12—15万", "10—15万", "15—20万", "30万以上", "20—30万", "20—30万", "20—30万"], hotLabels: ["10 万以下", "10—15 万", "15—20 万", "20—25 万", "25—30 万", "30 万以上", "预算未明确"], factor: 0.74, offset: 1.6 }
    }
  };

  const STATUS_OPTIONS = [
    "下订单",
    "到店跟进中",
    "已下定",
    "已预约到店",
    "异地",
    "战败",
    "战败已通过(已到店)",
    "战败已通过(未到店)",
    "战败申请中(已到店)",
    "战败申请中(未到店)",
    "无效",
    "无效申请中",
    "有效",
    "未跟进",
    "终端成交",
    "继续邀约",
    "跟进中"
  ];
  const OFFLINE_STATUS_DATA = {
    "下订单": { customers: 96, valid: 91 },
    "到店跟进中": { customers: 126, valid: 120 },
    "已下定": { customers: 184, valid: 178 },
    "已预约到店": { customers: 72, valid: 68 },
    "异地": { customers: 48, valid: 44 },
    "战败": { customers: 238, valid: 221 },
    "战败已通过(已到店)": { customers: 87, valid: 81 },
    "战败已通过(未到店)": { customers: 35, valid: 30 },
    "战败申请中(已到店)": { customers: 69, valid: 65 },
    "战败申请中(未到店)": { customers: 28, valid: 23 },
    "无效": { customers: 54, valid: 41 },
    "无效申请中": { customers: 21, valid: 18 },
    "有效": { customers: 83, valid: 78 },
    "未跟进": { customers: 31, valid: 22 },
    "终端成交": { customers: 146, valid: 140 },
    "继续邀约": { customers: 57, valid: 52 },
    "跟进中": { customers: 101, valid: 94 }
  };
  const SCENE_VALUES = ["first_follow", "schedule_confirm", "invite_store", "sales_reception", "test_drive"];
  const REGION_MODEL_PAGE_SIZE = 10;
  const STAGE_SCENES = {
    online: ["first_follow", "invite_store", "schedule_confirm"],
    offline: ["sales_reception", "test_drive"]
  };
  const DATA_CUTOFF = new Date(2026, 6, 20);
  const state = {
    pageMode: "insight",
    stage: "overview",
    topic: "need",
    activeRow: 0,
    analysisPeriod: "统计日期 2026-07-14 至 2026-07-20",
    batchDays: 1,
    statisticsDays: 7,
    windowDays: 7,
    startDate: null,
    endDate: null,
    draftStartDate: null,
    draftEndDate: null,
    calendarMonth: null,
    datePickerOpen: false,
    stageStartDate: null,
    stageEndDate: null,
    stageDraftDate: null,
    stageDraftEndDate: null,
    stageCalendarMonth: null,
    stageDatePickerOpen: false,
    mode: "compare",
    singleGroup: "a",
    offlineConfigured: true,
    offlineCustom: true,
    pendingTopic: null,
    matrixView: "distribution",
    matrixCategory: "resistance",
    matrixRegionPage: 1,
    deepInsight: "product",
    deepInsightSelections: { product: 0, policy: 0, competitor: 0 },
    deepEvidenceType: "positive",
    deepEvaluationIndex: 0,
    currentStageSampleValid: 0,
    scenes: new Set(SCENE_VALUES),
    groups: { a: new Set(["已下定", "异地"]), b: new Set(["战败", "战败申请中(已到店)"]) }
  };
  let currentRegionModelEntries = [];
  let overviewAiSummaryGenerationId = 0;
  let overviewAiSummaryGenerated = false;
  let compareAiSummaryGenerationId = 0;
  let compareAiSummaryGenerated = false;

  const TREND_VIEWS = {
    arrival: {
      explanation: "蓝线为品牌整体，紫色虚线为重点车型；横轴为周，位置越高表示到店率越高",
      brandValue: "39.2%",
      modelValue: "37.0%",
      change: "品牌整体较上期 +2.4pp",
      aria: "最近七周品牌整体与 AION V 到店率走势",
      yAxis: ["45%", "35%", "25%"],
      brandPath: "M30 135 L138 123 L246 130 L354 103 L462 94 L570 76 L678 58",
      modelPath: "M30 145 L138 139 L246 142 L354 124 L462 115 L570 101 L678 89",
      brandEnd: 58,
      modelEnd: 89
    },
    orders: {
      explanation: "蓝线为品牌整体，紫色虚线为重点车型；横轴为周，位置越高表示当周下订客户越多",
      brandValue: "418 人",
      modelValue: "138 人",
      change: "品牌整体较上期 +36 人",
      aria: "最近七周品牌整体与 AION V 已下订客户数走势",
      yAxis: ["450人", "300人", "150人"],
      brandPath: "M30 142 L138 134 L246 139 L354 118 L462 103 L570 87 L678 69",
      modelPath: "M30 151 L138 146 L246 147 L354 137 L462 130 L570 117 L678 108",
      brandEnd: 69,
      modelEnd: 108
    },
    action: {
      explanation: "蓝线为品牌整体，紫色虚线为重点车型；横轴为周，位置越高表示动作完成率越高",
      brandValue: "58.6%",
      modelValue: "54.2%",
      change: "品牌整体较上期 -1.8pp",
      aria: "最近七周品牌整体与 AION V 动作完成率走势",
      yAxis: ["70%", "55%", "40%"],
      brandPath: "M30 112 L138 105 L246 92 L354 84 L462 77 L570 88 L678 96",
      modelPath: "M30 131 L138 124 L246 119 L354 107 L462 102 L570 112 L678 121",
      brandEnd: 96,
      modelEnd: 121
    }
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

  function renderTrend(metric) {
    const view = TREND_VIEWS[metric] || TREND_VIEWS.arrival;
    $("#trendExplanation").textContent = view.explanation;
    $("#trendBrandValue").textContent = view.brandValue;
    $("#trendModelValue").textContent = view.modelValue;
    $("#trendChange").textContent = view.change;
    $("#trendChange").classList.toggle("negative", view.change.includes("-"));
    $("#chartYHigh").textContent = view.yAxis[0];
    $("#chartYMid").textContent = view.yAxis[1];
    $("#chartYLow").textContent = view.yAxis[2];
    $(".overview-chart").setAttribute("aria-label", view.aria);
    $(".overview-chart svg").setAttribute("aria-label", view.aria);
    $(".chart-line.brand").setAttribute("d", view.brandPath);
    $(".chart-line.model").setAttribute("d", view.modelPath);
    $(".chart-area").setAttribute("d", `${view.brandPath} L678 158 L30 158 Z`);
    $(".chart-dots circle:not(.model-dot)").setAttribute("cy", String(view.brandEnd));
    $(".chart-dots .model-dot").setAttribute("cy", String(view.modelEnd));
  }

  function getOverviewBrand() {
    return OVERVIEW_BRANDS[$("#brandFilter").value] || OVERVIEW_BRANDS["埃安"];
  }

  function updateSceneFilterSummary() {
    const count = state.scenes.size;
    $("#sceneFilterSummary").textContent = count === SCENE_VALUES.length
      ? `全部业务场景（${SCENE_VALUES.length}）`
      : count
        ? `已选 ${count} 个场景`
        : "未选择业务场景";
    $$("[data-journey-scene]").forEach((chip) => {
      const selected = state.scenes.has(chip.dataset.journeyScene);
      chip.classList.toggle("is-selected", selected);
      const icon = $("i", chip);
      if (icon) icon.textContent = selected ? "✓" : "";
    });
  }

  function getTimeScale() {
    const rangeDays = state.stage === "overview" ? state.statisticsDays : state.batchDays;
    const batchScale = Math.max(1 / 7, (rangeDays || 1) / 7);
    const historyFactor = state.stage === "overview" ? 1 : state.windowDays === 30 ? 1.08 : state.windowDays === 15 ? 1.04 : 1;
    return batchScale * historyFactor;
  }

  function getOrgScale() {
    return { "全国": 1, "华东大区": 0.46, "华南大区": 0.31 }[$("#orgFilter").value] || 1;
  }

  function getSelectedStageSceneCount(stage) {
    return STAGE_SCENES[stage].filter((scene) => state.scenes.has(scene)).length;
  }

  function getSceneScale(stage) {
    return getSelectedStageSceneCount(stage) / STAGE_SCENES[stage].length;
  }

  function getModelScale() {
    const brand = getOverviewBrand();
    const selectedModel = $("#modelFilter").value;
    const model = brand.models.find((item) => item.name === selectedModel);
    return model ? model.invite / 1248 : brand.online / 1248;
  }

  function getWindowScale() {
    return getTimeScale() * getOrgScale() * getModelScale() * getSceneScale(state.stage);
  }

  function scaleCountText(countText) {
    const value = Number(String(countText).replace(/[^0-9]/g, ""));
    return `${Math.max(0, Math.round(value * getWindowScale())).toLocaleString("zh-CN")} 人`;
  }

  function getScopeLabel(includeScenes = false) {
    const organization = $("#orgFilter").value;
    const brand = $("#brandFilter").value;
    const model = $("#modelFilter").value === "all" ? "全部车型" : $("#modelFilter").value;
    const parts = [organization, brand, model];
    if (includeScenes && state.stage !== "overview") {
      parts.push(`已选 ${getSelectedStageSceneCount(state.stage)} 个相关场景`);
    }
    return parts.join(" · ");
  }

  function getSelectedSceneLabels(stage) {
    return STAGE_SCENES[stage].map((value) => {
      const input = $(`#sceneFilter input[value="${value}"]`);
      return state.scenes.has(value) ? input?.closest("label")?.querySelector("span")?.textContent : "";
    }).filter(Boolean);
  }

  function getRateAdjustment() {
    const organization = $("#orgFilter").value;
    const brand = $("#brandFilter").value;
    const selectedModel = $("#modelFilter").value;
    const model = getOverviewBrand().models.find((item) => item.name === selectedModel);
    const orgAdjust = organization === "华东大区" ? -1.7 : organization === "华南大区" ? 1.3 : 0;
    const brandAdjust = brand === "传祺" ? 1.2 : 0;
    const modelAdjust = model ? (model.arrival - getOverviewBrand().arrivalRate) * 0.45 : 0;
    return orgAdjust + brandAdjust + modelAdjust;
  }

  function shiftDate(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function formatMonthDay(date) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function formatISODate(date) {
    return `${date.getFullYear()}-${formatMonthDay(date)}`;
  }

  function parseISODate(value) {
    const [year, month, day] = String(value || "").split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getLatestSelectableDate() {
    return DATA_CUTOFF;
  }

  function getStageLatestSelectableDate() {
    return shiftDate(DATA_CUTOFF, -state.windowDays);
  }

  function getDateRangeDays(startDate, endDate) {
    const milliseconds = parseISODate(endDate) - parseISODate(startDate);
    return Math.max(1, Math.round(milliseconds / 86400000) + 1);
  }

  function getDateRangeLabel(startDate, endDate) {
    return startDate === endDate ? startDate : `${startDate} 至 ${endDate}`;
  }

  function setDefaultCustomerDateRange() {
    const latest = getLatestSelectableDate();
    state.startDate = formatISODate(shiftDate(latest, -6));
    state.endDate = formatISODate(latest);
    state.draftStartDate = state.startDate;
    state.draftEndDate = state.endDate;
    state.statisticsDays = 7;
    state.calendarMonth = new Date(latest.getFullYear(), latest.getMonth(), 1);
  }

  function setDefaultStageStartDate() {
    const latest = getStageLatestSelectableDate();
    state.stageStartDate = formatISODate(shiftDate(DATA_CUTOFF, -36));
    state.stageEndDate = formatISODate(latest);
    state.stageDraftDate = state.stageStartDate;
    state.stageDraftEndDate = state.stageEndDate;
    const selectedStart = parseISODate(state.stageStartDate);
    state.stageCalendarMonth = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
  }

  function renderCustomerCalendarPanel(monthDate, panelIndex) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDate = new Date(year, month, 1);
    const gridStart = shiftDate(firstDate, -firstDate.getDay());
    const latest = getLatestSelectableDate();
    const cells = Array.from({ length: 42 }, (_, index) => {
      const date = shiftDate(gridStart, index);
      const value = formatISODate(date);
      const outside = date.getMonth() !== month;
      const disabled = date > latest || outside;
      const isStart = !outside && value === state.draftStartDate;
      const isEnd = !outside && value === state.draftEndDate;
      const isToday = value === formatISODate(DATA_CUTOFF);
      const inRange = Boolean(!outside && state.draftStartDate && state.draftEndDate && value >= state.draftStartDate && value <= state.draftEndDate);
      const classes = ["customer-calendar-day"];
      if (outside) classes.push("is-outside");
      if (inRange) classes.push("in-range");
      if (isStart) classes.push("is-start");
      if (isEnd) classes.push("is-end");
      if (isToday) classes.push("is-today");
      return `<button class="${classes.join(" ")}" type="button"${disabled ? " disabled" : ` data-customer-date-value="${value}"`}>${date.getDate()}</button>`;
    }).join("");
    const previousControls = panelIndex === 0
      ? `<div class="customer-calendar-navs"><button type="button" data-calendar-nav="-12" aria-label="上一年">«</button><button type="button" data-calendar-nav="-1" aria-label="上一个月">‹</button></div>`
      : "<span></span>";
    const nextControls = panelIndex === 1
      ? `<div class="customer-calendar-navs end"><button type="button" data-calendar-nav="1" aria-label="下一个月">›</button><button type="button" data-calendar-nav="12" aria-label="下一年">»</button></div>`
      : "<span></span>";
    return `
      <section class="customer-calendar-panel">
        <div class="customer-calendar-head">${previousControls}<strong>${year} 年&nbsp; ${month + 1} 月</strong>${nextControls}</div>
        <div class="customer-calendar-weekdays"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
        <div class="customer-calendar-grid">${cells}</div>
      </section>
    `;
  }

  function renderCustomerDatePicker() {
    const popover = $("#customerDatePopover");
    $("#customerDateRangeLabel").textContent = getDateRangeLabel(state.startDate, state.endDate);
    $("#customerDateTrigger").setAttribute("aria-expanded", String(state.datePickerOpen));
    popover.hidden = !state.datePickerOpen;
    if (!state.datePickerOpen) return;
    const leftMonth = state.calendarMonth || new Date(getLatestSelectableDate().getFullYear(), getLatestSelectableDate().getMonth() - 1, 1);
    const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
    $("#customerCalendarMonths").innerHTML = renderCustomerCalendarPanel(leftMonth, 0) + renderCustomerCalendarPanel(rightMonth, 1);
    const draftEnd = state.draftEndDate || state.draftStartDate;
    $("#customerCalendarSummary").textContent = state.draftStartDate
      ? state.draftEndDate
        ? `已选择 ${getDateRangeLabel(state.draftStartDate, draftEnd)}`
        : `已选择开始日期 ${state.draftStartDate}，请选择结束日期`
      : "请选择统计日期";
    $("#applyCustomerDate").disabled = !state.draftStartDate || !state.draftEndDate;
    const selectedDays = state.draftStartDate && state.draftEndDate ? getDateRangeDays(state.draftStartDate, state.draftEndDate) : 0;
    $$("[data-date-preset]").forEach((button) => {
      const presetDays = button.dataset.datePreset === "today" ? 1 : Number(button.dataset.datePreset);
      const expectedStart = formatISODate(shiftDate(DATA_CUTOFF, -(presetDays - 1)));
      button.classList.toggle("active", selectedDays === presetDays && state.draftStartDate === expectedStart && state.draftEndDate === formatISODate(DATA_CUTOFF));
    });
  }

  function renderStageCalendarPanel(monthDate, panelIndex) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDate = new Date(year, month, 1);
    const gridStart = shiftDate(firstDate, -firstDate.getDay());
    const latest = getStageLatestSelectableDate();
    const cells = Array.from({ length: 42 }, (_, index) => {
      const date = shiftDate(gridStart, index);
      const value = formatISODate(date);
      const outside = date.getMonth() !== month;
      const disabled = date > latest || outside;
      const isStart = !outside && value === state.stageDraftDate;
      const isEnd = !outside && value === state.stageDraftEndDate;
      const inRange = Boolean(!outside && state.stageDraftDate && state.stageDraftEndDate && value >= state.stageDraftDate && value <= state.stageDraftEndDate);
      const classes = ["customer-calendar-day"];
      if (outside) classes.push("is-outside");
      if (inRange) classes.push("in-range");
      if (isStart) classes.push("is-start");
      if (isEnd) classes.push("is-end");
      return `<button class="${classes.join(" ")}" type="button"${disabled ? " disabled" : ` data-stage-date-value="${value}"`}>${date.getDate()}</button>`;
    }).join("");
    const previousControls = panelIndex === 0
      ? `<div class="customer-calendar-navs"><button type="button" data-stage-calendar-nav="-12" aria-label="上一年">«</button><button type="button" data-stage-calendar-nav="-1" aria-label="上一个月">‹</button></div>`
      : "<span></span>";
    const nextControls = panelIndex === 1
      ? `<div class="customer-calendar-navs end"><button type="button" data-stage-calendar-nav="1" aria-label="下一个月">›</button><button type="button" data-stage-calendar-nav="12" aria-label="下一年">»</button></div>`
      : "<span></span>";
    return `
      <section class="customer-calendar-panel">
        <div class="customer-calendar-head">${previousControls}<strong>${year} 年&nbsp; ${month + 1} 月</strong>${nextControls}</div>
        <div class="customer-calendar-weekdays"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
        <div class="customer-calendar-grid">${cells}</div>
      </section>
    `;
  }

  function renderStageDatePicker() {
    const popover = $("#stageDatePopover");
    $("#stageDateRangeLabel").textContent = state.stageStartDate && state.stageEndDate
      ? getDateRangeLabel(state.stageStartDate, state.stageEndDate)
      : "";
    $("#stageDateTrigger").setAttribute("aria-expanded", String(state.stageDatePickerOpen));
    popover.hidden = !state.stageDatePickerOpen;
    if (!state.stageDatePickerOpen) return;
    const leftMonth = state.stageCalendarMonth || new Date(getStageLatestSelectableDate().getFullYear(), getStageLatestSelectableDate().getMonth() - 1, 1);
    const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);
    $("#stageCalendarMonths").innerHTML = renderStageCalendarPanel(leftMonth, 0) + renderStageCalendarPanel(rightMonth, 1);
    $("#stageCalendarSummary").textContent = state.stageDraftDate
      ? state.stageDraftEndDate
        ? `已选择 ${getDateRangeLabel(state.stageDraftDate, state.stageDraftEndDate)}；结束日期最晚 ${formatISODate(getStageLatestSelectableDate())}`
        : `已选择开始日期 ${state.stageDraftDate}，请选择结束日期`
      : `请选择统计周期；结束日期最晚 ${formatISODate(getStageLatestSelectableDate())}`;
    $("#applyStageDate").disabled = !state.stageDraftDate || !state.stageDraftEndDate;
  }

  function getBatchDateRange(batchDays) {
    const t0End = shiftDate(DATA_CUTOFF, -state.windowDays);
    const t0Start = shiftDate(t0End, -(batchDays - 1));
    return batchDays === 1 ? formatMonthDay(t0End) : `${formatMonthDay(t0Start)}—${formatMonthDay(t0End)}`;
  }

  function renderMatureBatchExplanation() {
    const isOverview = state.stage === "overview";
    $("#overviewTimeControls").hidden = !isOverview;
    $("#stageTimeControls").hidden = isOverview;
    if (isOverview) {
      state.stageDatePickerOpen = false;
      const latest = getLatestSelectableDate();
      if (!state.startDate || !state.endDate || parseISODate(state.endDate) > latest) setDefaultCustomerDateRange();
      state.statisticsDays = getDateRangeDays(state.startDate, state.endDate);
      state.analysisPeriod = `统计日期 ${getDateRangeLabel(state.startDate, state.endDate)}`;
      renderCustomerDatePicker();
      renderStageDatePicker();
      return;
    }
    state.datePickerOpen = false;
    const latestStageDate = getStageLatestSelectableDate();
    if (!state.stageStartDate || !state.stageEndDate) setDefaultStageStartDate();
    if (parseISODate(state.stageEndDate) > latestStageDate) {
      state.stageEndDate = formatISODate(latestStageDate);
      state.stageDraftEndDate = state.stageEndDate;
    }
    state.batchDays = getDateRangeDays(state.stageStartDate, state.stageEndDate);
    state.analysisPeriod = `统计周期 ${getDateRangeLabel(state.stageStartDate, state.stageEndDate)}`;
    $("#latestSelectableDate").textContent = `结束日期最晚可选 ${formatISODate(latestStageDate)}`;
    $("#observationDaysHint").textContent = `${state.windowDays} 天`;
    $("#observationResultHint").textContent = state.stage === "online" ? "确认到店结果" : "确认成交结果";
    renderCustomerDatePicker();
    renderStageDatePicker();
  }

  function getStageGroups(meta) {
    if (state.stage === "online") {
      return {
        a: { ...meta.groups.a, name: `${state.windowDays}日内已到店` },
        b: { ...meta.groups.b, name: `${state.windowDays}日内未到店` }
      };
    }
    if (!state.offlineCustom) {
      return {
        a: { ...meta.groups.a, name: `到店后 ${state.windowDays} 日成交` },
        b: { ...meta.groups.b, name: `到店后 ${state.windowDays} 日未成交` }
      };
    }
    const buildGroup = (key) => {
      const statuses = Array.from(state.groups[key]);
      return statuses.reduce((group, status) => {
        const statusData = OFFLINE_STATUS_DATA[status] || { customers: 0, valid: 0 };
        group.customers += statusData.customers;
        group.valid += statusData.valid;
        return group;
      }, { name: statuses.join("、"), customers: 0, valid: 0, rate: 0 });
    };
    const a = buildGroup("a");
    const b = buildGroup("b");
    const comparedCustomers = a.customers + b.customers;
    a.rate = comparedCustomers ? a.customers / comparedCustomers * 100 : 0;
    b.rate = comparedCustomers ? b.customers / comparedCustomers * 100 : 0;
    return { a, b };
  }

  function syncModelOptions() {
    const brand = getOverviewBrand();
    const current = $("#modelFilter").value;
    $("#modelFilter").innerHTML = [
      '<option value="all">全部车型</option>',
      ...brand.models.map((model) => `<option value="${escapeHTML(model.name)}">${escapeHTML(model.name)}</option>`)
    ].join("");
    $("#modelFilter").value = brand.models.some((model) => model.name === current) ? current : "all";
  }

  function getMatrixCategoryLabel() {
    const categoryButton = $(`[data-matrix-category="${state.matrixCategory}"]`);
    return categoryButton ? categoryButton.textContent.trim() : "客户标签";
  }

  function getRegionModelBaseValue(rowIndex, modelIndex) {
    const safeModelIndex = Math.max(0, modelIndex);
    const knownValue = REGION_MODEL_INSIGHTS.values[rowIndex]?.[safeModelIndex];
    if (Number.isFinite(knownValue)) return knownValue;
    const sourceRow = REGION_MODEL_INSIGHTS.values[rowIndex % REGION_MODEL_INSIGHTS.values.length];
    const sourceValue = sourceRow[safeModelIndex % sourceRow.length];
    const adjustment = ((rowIndex * 5 + safeModelIndex * 3) % 9 - 4) * 0.32;
    return Math.max(2.4, sourceValue + adjustment);
  }

  function getMatrixCustomerShare(rowIndex, modelIndex) {
    const categoryBase = {
      resistance: 39.1,
      payment: 54.2,
      decision: 46.8,
      intent_model: 48.5,
      trade_in: 35.4,
      timing: 44.6,
      driver: 51.2,
      occupation: 32.8,
      competitor: 29.7,
      test_drive: 41.3,
      scenario: 47.6,
      need: 52.4,
      budget: 43.8
    };
    const modelOffsets = [3.25, -3.65, -7.2, -9.9, 2.8, -4.1, -6.6, -8.2];
    const safeModelIndex = Math.max(0, modelIndex);
    const regionAdjustment = rowIndex === 0
      ? 0
      : ((rowIndex * 7 + safeModelIndex * 3) % 11 - 5) * 0.58;
    const share = (categoryBase[state.matrixCategory] || 40)
      + modelOffsets[safeModelIndex % modelOffsets.length]
      + regionAdjustment;
    return Math.min(92, Math.max(3, share));
  }

  function getHotDistributionLabels(config) {
    if (state.matrixCategory === "intent_model") {
      const selectedModel = $("#modelFilter").value;
      return selectedModel === "all"
        ? getOverviewBrand().models.map((model) => model.name)
        : [selectedModel];
    }
    return [...new Set(config.hotLabels || config.labels)].slice(0, 10);
  }

  function getOverviewRuleInsightData() {
    const brand = getOverviewBrand();
    const selectedModelValue = $("#modelFilter").value;
    const selectedModel = brand.models.find((model) => model.name === selectedModelValue);
    const sceneScale = state.scenes.size / SCENE_VALUES.length;
    const scopeScale = getTimeScale() * getOrgScale() * sceneScale;
    const deepScale = scopeScale * (selectedModel ? selectedModel.valid / brand.onlineValid : 1);
    const scopedCustomers = Math.max(0, Math.round((selectedModel ? selectedModel.valid : brand.onlineValid) * scopeScale));
    const evidenceCount = Math.max(0, Math.round(scopedCustomers * 4.182));
    const category = REGION_MODEL_INSIGHTS.categories[state.matrixCategory] || REGION_MODEL_INSIGHTS.categories.resistance;
    const categoryLabel = getMatrixCategoryLabel();
    const hotLabel = getHotDistributionLabels(category)[0] || categoryLabel;
    const hotShare = 23.4;
    const hotChange = 2.4;
    const organization = $("#orgFilter").value;
    const visibleRegions = organization === "全国" ? REGION_MODEL_INSIGHTS.regions : [organization];
    const visibleModels = (selectedModel ? [selectedModel] : brand.models).map((model) => ({
      name: model.name,
      index: REGION_MODEL_INSIGHTS.models.indexOf(model.name)
    }));
    let regionTop = null;

    visibleRegions.forEach((region) => {
      const rowIndex = Math.max(0, REGION_MODEL_INSIGHTS.regions.indexOf(region));
      visibleModels.forEach((model) => {
        const baseValue = getRegionModelBaseValue(rowIndex, model.index);
        const value = state.matrixCategory === "resistance"
          ? baseValue
          : Math.max(1.2, baseValue * category.factor + category.offset + ((rowIndex + model.index) % 3 - 1) * 0.35);
        const entry = {
          region,
          model: model.name,
          label: category.labels[model.index],
          value
        };
        if (!regionTop || entry.value > regionTop.value) regionTop = entry;
      });
    });

    const deepCards = ["product", "policy", "competitor"].map((key) => {
      const config = DEEP_INSIGHTS[key];
      const topic = config.topics[0];
      return {
        target: key,
        label: config.label,
        summary: `“${topic.name}”是当前首要话题，${topic.sentiment[0] >= topic.sentiment[2] ? "正向" : "负向"}表达占 ${Math.max(topic.sentiment[0], topic.sentiment[2])}%。`,
        metric: `${topic.share.toFixed(1)}%`,
        metricDelta: `${Math.max(0, Math.round(topic.customers * deepScale)).toLocaleString("zh-CN")} 人`
      };
    });

    const cards = [
      {
        target: "distribution",
        label: "热门标签分布",
        summary: `“${hotLabel}”在${categoryLabel}中提及最多，${regionTop.region.replace("大区", "")} · ${regionTop.model}为重点分布。`,
        metric: `${hotShare.toFixed(1)}%`,
        metricDelta: `较上期 +${hotChange.toFixed(1)}pp`
      },
      {
        target: "profile",
        label: "区域画像矩阵",
        summary: `${regionTop.region} × ${regionTop.model}的“${regionTop.label}”最突出。`,
        metric: `+${regionTop.value.toFixed(1)}pp`,
        metricDelta: "高于全国基准"
      },
      ...deepCards
    ];

    return {
      scopedCustomers,
      evidenceCount,
      executive: `综合 5 类洞察后，当前应优先关注“${hotLabel}”：热门标签显示其提及度最高，区域画像锁定${regionTop.region.replace("大区", "")} · ${regionTop.model}；产品、金融政策和竞品三个方面分别聚焦“${DEEP_INSIGHTS.product.topics[0].name}”“${DEEP_INSIGHTS.policy.topics[0].name}”和“${DEEP_INSIGHTS.competitor.topics[0].name}”，共同构成当前客户决策焦点。`,
      cards
    };
  }

  function setOverviewAiGenerateLabel(label) {
    $("#generateOverviewAiSummary").innerHTML = `<span aria-hidden="true">✦</span>${escapeHTML(label)}`;
  }

  function renderOverviewRuleInsights() {
    const data = getOverviewRuleInsightData();
    $("#overviewAiSummaryMeta").textContent = `5 类规则洞察 · ${data.scopedCustomers.toLocaleString("zh-CN")} 名客户 · ${data.evidenceCount.toLocaleString("zh-CN")} 条录音证据`;
    $("#overviewAiInsightCount").textContent = data.cards.length;
    $("#overviewAiCustomerCount").textContent = data.scopedCustomers.toLocaleString("zh-CN");
    $("#overviewAiEvidenceCount").textContent = data.evidenceCount.toLocaleString("zh-CN");
    $("#overviewAiInsightGrid").innerHTML = data.cards.map((card, index) => `
      <article class="overview-ai-insight-card">
        <div class="overview-ai-insight-card-head">
          <span class="overview-ai-insight-index">${index + 1}</span>
          <strong>${escapeHTML(card.label)}</strong>
        </div>
        <p>${escapeHTML(card.summary)}</p>
        <div class="overview-ai-insight-metric">
          <strong>${escapeHTML(card.metric)}</strong>
          <small>${escapeHTML(card.metricDelta)}</small>
        </div>
        <button class="overview-ai-insight-link" data-ai-insight-target="${card.target}" type="button">查看明细</button>
      </article>
    `).join("");
    return data;
  }

  function invalidateOverviewAiSummary() {
    const hadResult = overviewAiSummaryGenerated;
    overviewAiSummaryGenerationId += 1;
    overviewAiSummaryGenerated = false;
    renderOverviewRuleInsights();
    $("#overviewAiSummaryLoading").hidden = true;
    $("#overviewAiSummaryResult").hidden = false;
    $("#overviewAiExecutive").classList.add("is-pending");
    $("#overviewAiExecutiveConclusion").hidden = true;
    $("#overviewAiExecutiveConclusion").textContent = "";
    $("#overviewAiEvidenceStats").hidden = true;
    const status = $("#overviewAiSummaryStatus");
    status.hidden = !hadResult;
    status.classList.toggle("is-stale", hadResult);
    status.textContent = hadResult ? "筛选已更新 · 待重新生成" : "";
    const button = $("#generateOverviewAiSummary");
    button.disabled = !state.scenes.size;
    setOverviewAiGenerateLabel(state.scenes.size
      ? (hadResult ? "重新生成 AI 综合判断" : "生成 AI 综合判断")
      : "暂无可分析数据");
    if (!state.scenes.size) $("#overviewAiSummaryMeta").textContent = "当前未选择业务场景，请先选择至少一个场景";
  }

  function generateOverviewAiSummary() {
    if (!state.scenes.size) return;
    const requestId = ++overviewAiSummaryGenerationId;
    const button = $("#generateOverviewAiSummary");
    button.disabled = true;
    setOverviewAiGenerateLabel("AI 正在生成…");
    $("#overviewAiSummaryStatus").hidden = true;
    $("#overviewAiSummaryResult").hidden = false;
    $("#overviewAiExecutive").classList.add("is-pending");
    $("#overviewAiExecutiveConclusion").hidden = true;
    $("#overviewAiEvidenceStats").hidden = true;
    $("#overviewAiSummaryLoading").hidden = false;
    window.setTimeout(() => {
      if (requestId !== overviewAiSummaryGenerationId) return;
      const data = renderOverviewRuleInsights();
      $("#overviewAiExecutiveConclusion").textContent = data.executive;
      $("#overviewAiExecutiveConclusion").hidden = false;
      $("#overviewAiEvidenceStats").hidden = false;
      $("#overviewAiExecutive").classList.remove("is-pending");
      overviewAiSummaryGenerated = true;
      $("#overviewAiSummaryLoading").hidden = true;
      const status = $("#overviewAiSummaryStatus");
      status.hidden = false;
      status.classList.remove("is-stale");
      status.textContent = "已生成 · 刚刚";
      button.disabled = false;
      setOverviewAiGenerateLabel("重新生成 AI 综合判断");
    }, 720);
  }

  function openOverviewAiInsight(target) {
    if (target === "distribution" || target === "profile") {
      state.matrixView = target;
      $$("[data-insight-view]").forEach((button) => {
        const active = button.dataset.insightView === target;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      renderInsightView($("#modelFilter").value);
      $(".model-matrix").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    state.deepInsight = target;
    renderDeepInsights();
    $(".deep-insight").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderHotDistribution(selectedModel) {
    const config = REGION_MODEL_INSIGHTS.categories[state.matrixCategory] || REGION_MODEL_INSIGHTS.categories.resistance;
    const categoryLabel = getMatrixCategoryLabel();
    const brand = getOverviewBrand();
    const selectedModelData = brand.models.find((model) => model.name === selectedModel);
    const scopedCustomers = Math.max(0, Math.round(
      (selectedModelData ? selectedModelData.valid : brand.onlineValid)
      * getTimeScale()
      * getOrgScale()
      * (state.scenes.size / SCENE_VALUES.length)
    ));
    const labels = getHotDistributionLabels(config);
    const organization = $("#orgFilter").value;
    const regions = organization === "全国" ? REGION_MODEL_INSIGHTS.regions : [organization];
    const models = selectedModel === "all" ? brand.models : brand.models.filter((model) => model.name === selectedModel);
    const changes = [2.4, -1.1, 1.6, -0.8, 0.6, -0.3, -0.2, 0.4, -0.6, 0.2];
    const entries = labels.map((label, index) => {
      const share = Math.max(3.2, 23.4 - index * 2.15);
      const region = regions[index % regions.length];
      const modelData = models[index % models.length];
      return {
        label,
        share,
        customers: Math.round(scopedCustomers * share / 100),
        change: changes[index],
        region,
        rowIndex: REGION_MODEL_INSIGHTS.regions.indexOf(region),
        model: modelData.name,
        modelIndex: REGION_MODEL_INSIGHTS.models.indexOf(modelData.name),
        modelData,
        value: Math.max(1.2, share * 0.42)
      };
    });

    $("#hotDistributionCategory").textContent = categoryLabel;
    $("#hotDistributionScope").textContent = `当前筛选范围 · ${getScopeLabel()}`;
    $("#hotDistributionBody").innerHTML = state.scenes.size && entries.length
      ? entries.map((entry, index) => `
        <tr>
          <td><span class="hot-rank ${index < 3 ? `top-${index + 1}` : ""}">${index + 1}</span></td>
          <td><strong>${escapeHTML(entry.label)}</strong></td>
          <td>${entry.customers.toLocaleString("zh-CN")} 人</td>
          <td>${entry.share.toFixed(1)}%</td>
          <td><span class="hot-change ${entry.change >= 0 ? "up" : "down"}">${entry.change >= 0 ? "↑" : "↓"} ${Math.abs(entry.change).toFixed(1)}pp</span></td>
          <td>${escapeHTML(entry.region.replace("大区", ""))} · ${escapeHTML(entry.model)}</td>
          <td><button class="hot-analysis-link" data-hot-entry="${index}" type="button">查看分析</button></td>
        </tr>
      `).join("")
      : '<tr><td class="matrix-empty" colspan="7">当前范围暂无热门标签分布数据</td></tr>';
    $$("[data-hot-entry]", $("#hotDistributionBody")).forEach((button) => {
      button.addEventListener("click", () => openRegionModelInsightDrawer(entries[Number(button.dataset.hotEntry)]));
    });
  }

  function renderInsightView(selectedModel) {
    const isDistribution = state.matrixView === "distribution";
    $("#modelMatrixTitle").textContent = isDistribution ? "客户画像" : "区域画像矩阵";
    $("#modelMatrixDescription").textContent = isDistribution
      ? "查看当前标签下最常出现的客户反馈，默认展示前 10 项"
      : "对比各车型在不同区域的客户占比及相对全国基准差异";
    $("#hotDistributionPanel").hidden = !isDistribution;
    $(".region-model-matrix-wrap").hidden = isDistribution;
    $(".matrix-heat-legend").hidden = isDistribution;
    if (isDistribution) {
      renderHotDistribution(selectedModel);
    } else {
      renderRegionModelMatrix(selectedModel);
    }
  }

  function buildDeepEvaluationGroups(kind, topic, scopeScale) {
    const presets = DEEP_EVALUATION_LABELS[kind] || {};
    const labels = presets[topic.name] || [
      [`${topic.name}符合预期`, `${topic.name}体验清晰`, `${topic.name}整体有吸引力`],
      [`${topic.name}未达预期`, `${topic.name}仍需确认`, `${topic.name}存在使用限制`]
    ];
    const buildGroup = (type, groupLabels, sentimentValue) => {
      const shareFactors = type === "positive" ? [0.68, 0.54, 0.41] : [0.8, 0.62, 0.47];
      const changeOffsets = type === "positive" ? [0.7, 0.3, -0.2] : [0.5, 0.1, -0.4];
      return groupLabels.map((label, index) => {
        const share = Number((sentimentValue * shareFactors[index]).toFixed(1));
        const change = Number((topic.change * (0.72 - index * 0.18) + changeOffsets[index]).toFixed(1));
        return {
          label,
          share,
          change,
          customers: Math.max(1, Math.round(topic.customers * scopeScale * share / 100))
        };
      });
    };
    return {
      positive: buildGroup("positive", labels[0], topic.sentiment[0]),
      negative: buildGroup("negative", labels[1], topic.sentiment[2])
    };
  }

  function buildDeepEvidenceTexts(topic, point, type) {
    const primary = topic.voices.find((voice) => voice.sentiment === type)?.text || "";
    if (type === "positive") {
      return [
        primary,
        `${point.label}是我比较认可的地方，实际体验和预期比较一致。`,
        `和其他选择对比后，${point.label}更符合我的使用需求。`,
        `到店体验以后，感觉${point.label}比之前了解的更好。`,
        `家里人也比较认可${point.label}，目前没有明显顾虑。`,
        `销售把${point.label}讲得比较清楚，和我的需求能够匹配。`,
        `${point.label}现场看起来更直观，我愿意继续了解具体方案。`,
        `这次体验里${point.label}给我的印象比较好，符合日常使用习惯。`,
        `原本担心${point.label}不合适，实际确认后顾虑已经减少。`,
        `综合价格和体验来看，${point.label}是目前比较打动我的部分。`
      ];
    }
    return [
      primary,
      `${point.label}这点没有达到我的预期，还需要再比较确认。`,
      `如果${point.label}没有改善，我暂时不会马上做决定。`,
      `实际体验下来，${point.label}和我原来的预期还有差距。`,
      `家里人对${point.label}还有顾虑，我需要回去再商量一下。`,
      `销售解释了${point.label}，但我目前还是没有完全理解。`,
      `${point.label}目前的信息还不够清楚，我想再看看其他选择。`,
      `现场确认后，我对${point.label}仍然有些犹豫。`,
      `${point.label}如果还是现在这样，我可能会优先考虑别的车型。`,
      `我最担心的还是${point.label}，需要更明确的解决方案。`
    ];
  }

  function renderDeepInsights() {
    const config = DEEP_INSIGHTS[state.deepInsight] || DEEP_INSIGHTS.product;
    const selectedIndex = Math.min(state.deepInsightSelections[state.deepInsight] || 0, config.topics.length - 1);
    const topic = config.topics[selectedIndex];
    const brand = getOverviewBrand();
    const selectedModel = $("#modelFilter").value;
    const selectedModelData = brand.models.find((model) => model.name === selectedModel);
    const scopeScale = getTimeScale()
      * getOrgScale()
      * (selectedModelData ? selectedModelData.valid / brand.onlineValid : 1)
      * (state.scenes.size / SCENE_VALUES.length);
    const sentimentLabels = [
      ["positive", "正向", topic.sentiment[0]],
      ["neutral", "中性", topic.sentiment[1]],
      ["negative", "负向", topic.sentiment[2]]
    ];
    const topicCustomers = Math.max(0, Math.round(topic.customers * scopeScale));
    const evaluationGroups = buildDeepEvaluationGroups(state.deepInsight, topic, scopeScale);
    const evidenceType = state.deepEvidenceType === "negative" ? "negative" : "positive";
    const selectedEvaluationIndex = Math.min(state.deepEvaluationIndex || 0, evaluationGroups[evidenceType].length - 1);
    const selectedEvaluation = evaluationGroups[evidenceType][selectedEvaluationIndex];

    $("#deepInsightDescription").textContent = `${getScopeLabel()} · 点击 TOP10 条目，查看客户认可点、客户顾虑点和评价证据`;
    $$("[data-deep-insight]").forEach((button) => {
      const active = button.dataset.deepInsight === state.deepInsight;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    if (!state.scenes.size) {
      $("#deepTopList").innerHTML = '<div class="deep-empty">当前未选择业务场景，暂无 TOP10 数据</div>';
      $("#deepSentimentTopic").textContent = "当前选择";
      $("#deepSentimentContent").innerHTML = '<div class="deep-empty">选择业务场景后可查看评价解构</div>';
      $("#deepVoiceTopic").textContent = "当前选择";
      $("#deepVoiceList").innerHTML = '<div class="deep-empty">选择业务场景后可查看评价证据</div>';
      return;
    }

    $("#deepTopList").innerHTML = config.topics.map((item, index) => {
      const customers = Math.max(0, Math.round(item.customers * scopeScale));
      return `
        <button class="deep-top-item${index === selectedIndex ? " active" : ""}" data-deep-topic="${index}" type="button" aria-pressed="${index === selectedIndex}">
          <span class="deep-rank ${index < 3 ? `top-${index + 1}` : ""}">${index + 1}</span>
          <span class="deep-topic-main"><strong>${escapeHTML(item.name)}</strong><span><i style="width:${Math.min(100, item.share / config.topics[0].share * 100)}%"></i></span></span>
          <span class="deep-topic-value"><strong>${item.share.toFixed(1)}%</strong><small>${customers.toLocaleString("zh-CN")} 人</small></span>
          <span class="deep-topic-change ${item.change >= 0 ? "up" : "down"}">${item.change >= 0 ? "↑" : "↓"} ${Math.abs(item.change).toFixed(1)}pp</span>
        </button>
      `;
    }).join("");

    $("#deepSentimentTopic").textContent = `${topic.name} · ${topicCustomers.toLocaleString("zh-CN")} 名提及客户`;
    $("#deepSentimentContent").innerHTML = `
      <div class="deep-sentiment-summary" aria-label="${escapeHTML(topic.name)}：正向 ${topic.sentiment[0]}%，中性 ${topic.sentiment[1]}%，负向 ${topic.sentiment[2]}%">
        <div class="deep-sentiment-bar" aria-hidden="true">
          <i class="positive" style="width:${topic.sentiment[0]}%"></i>
          <i class="neutral" style="width:${topic.sentiment[1]}%"></i>
          <i class="negative" style="width:${topic.sentiment[2]}%"></i>
        </div>
        <div class="deep-sentiment-labels">
          ${sentimentLabels.map(([key, label, value]) => `<span class="${key}"><b>${label}</b><strong>${value}%</strong></span>`).join("")}
        </div>
      </div>
      <section class="deep-ai-evaluation-summary" aria-label="小结">
        <strong><span aria-hidden="true">✦</span>小结</strong>
        <p>客户主要认可${evaluationGroups.positive[0].label}、${evaluationGroups.positive[1].label}和${evaluationGroups.positive[2].label}；顾虑集中在${evaluationGroups.negative[0].label}、${evaluationGroups.negative[1].label}，${evaluationGroups.negative[2].label}仍需继续验证。</p>
      </section>
      <div class="deep-evaluation-groups">
        ${[
          ["positive", "客户认可点", "对当前主题的正向评价", evaluationGroups.positive],
          ["negative", "客户顾虑点", "对当前主题的负向评价", evaluationGroups.negative]
        ].map(([type, title, caption, items]) => `
          <section class="deep-evaluation-group ${type}" aria-label="${title}">
            <header><div><strong>${title}</strong><small>${caption}</small></div><i aria-hidden="true"></i></header>
            <div class="deep-evaluation-list">
              ${items.map((item, index) => {
                const isActive = evidenceType === type && selectedEvaluationIndex === index;
                const relationLabel = state.deepInsight === "competitor"
                  ? (type === "positive" ? "竞品认可点" : "我方机会")
                  : (type === "positive" ? "正向" : "客户顾虑");
                return `
                  <button class="deep-evaluation-item ${type}${isActive ? " active" : ""}" data-evaluation-type="${type}" data-evaluation-index="${index}" type="button" aria-pressed="${isActive}">
                    <span class="deep-evaluation-name"><strong>${escapeHTML(item.label)}</strong><em>${relationLabel}</em></span>
                    <span class="deep-evaluation-metric"><b>${item.share.toFixed(1)}%</b><small>${item.customers.toLocaleString("zh-CN")} 人</small></span>
                    <span class="deep-evaluation-progress" aria-hidden="true"><i style="width:${Math.min(100, item.share / items[0].share * 100)}%"></i></span>
                    <span class="deep-evaluation-change ${item.change >= 0 ? "up" : "down"}">${item.change >= 0 ? "↑" : "↓"} ${Math.abs(item.change).toFixed(1)}pp</span>
                  </button>
                `;
              }).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `;

    const voiceLocations = [
      "华东大区 · 上海中心店",
      "华南大区 · 广州大道店",
      "华北大区 · 北京朝阳店",
      "华中大区 · 武汉汉口店",
      "西南大区 · 成都高新店",
      "华东大区 · 杭州城西店",
      "华南大区 · 深圳南山店",
      "华北大区 · 天津空港店",
      "华中大区 · 长沙岳麓店",
      "西北大区 · 西安高新店"
    ];
    const voiceTimes = ["07-20 14:21", "07-19 11:08", "07-18 16:42", "07-17 13:36", "07-16 10:24", "07-15 17:52", "07-14 15:18", "07-13 12:46", "07-12 18:05", "07-11 09:37"];
    const evidenceTypeLabel = evidenceType === "positive" ? "客户认可点" : "客户顾虑点";
    const evidenceSentimentLabel = evidenceType === "positive" ? "正向" : "负向";
    const evidenceTexts = buildDeepEvidenceTexts(topic, selectedEvaluation, evidenceType);
    const evidenceItemsMarkup = evidenceTexts.map((text, index) => {
      const model = selectedModel === "all"
        ? brand.models[(selectedIndex + index) % brand.models.length].name
        : selectedModel;
      const location = getScopedVoiceLocation(voiceLocations[index]);
      return `
        <article class="deep-voice-item ${evidenceType}">
          <blockquote>“${escapeHTML(text)}”</blockquote>
          <footer>
            <span class="deep-sentiment-tag ${evidenceType}">${evidenceSentimentLabel}</span>
            <span>${escapeHTML(location)}</span>
            <span>·</span>
            <span>${escapeHTML(model)}</span>
            <time>${voiceTimes[index]}</time>
          </footer>
        </article>
      `;
    }).join("");
    $("#deepVoiceTopic").textContent = `${topic.name} · ${evidenceTypeLabel} · ${selectedEvaluation.label}`;
    $("#deepVoiceList").innerHTML = `
      <div class="deep-evidence-tabs" role="tablist" aria-label="评价证据类型">
        <button class="${evidenceType === "positive" ? "active" : ""}" data-deep-evidence-type="positive" type="button" role="tab" aria-selected="${evidenceType === "positive"}">认可证据</button>
        <button class="${evidenceType === "negative" ? "active" : ""}" data-deep-evidence-type="negative" type="button" role="tab" aria-selected="${evidenceType === "negative"}">顾虑证据</button>
      </div>
      <div class="deep-evidence-marquee" aria-label="评价证据弹幕，自动向上滚动，悬停或聚焦暂停">
        <div class="deep-evidence-track">
          <div class="deep-evidence-copy">${evidenceItemsMarkup}</div>
          <div class="deep-evidence-copy" aria-hidden="true">${evidenceItemsMarkup}</div>
        </div>
      </div>
    `;

    $$("[data-evaluation-type]", $("#deepSentimentContent")).forEach((button) => {
      button.addEventListener("click", () => {
        state.deepEvidenceType = button.dataset.evaluationType;
        state.deepEvaluationIndex = Number(button.dataset.evaluationIndex);
        renderDeepInsights();
      });
    });
    $$("[data-deep-evidence-type]", $("#deepVoiceList")).forEach((button) => {
      button.addEventListener("click", () => {
        state.deepEvidenceType = button.dataset.deepEvidenceType;
        state.deepEvaluationIndex = 0;
        renderDeepInsights();
      });
    });
    $$("[data-deep-topic]", $("#deepTopList")).forEach((button) => {
      button.addEventListener("click", () => {
        state.deepInsightSelections[state.deepInsight] = Number(button.dataset.deepTopic);
        state.deepEvidenceType = "positive";
        state.deepEvaluationIndex = 0;
        renderDeepInsights();
      });
    });
  }

  function refreshRegionModelHorizontalScroll() {
    const scroll = $("#regionModelMatrixScroll");
    const topScroll = $("#regionModelMatrixTopScroll");
    const track = $("#regionModelMatrixScrollTrack");
    const thumb = $("#regionModelMatrixScrollThumb");
    window.requestAnimationFrame(() => {
      const maxScroll = scroll.scrollWidth - scroll.clientWidth;
      topScroll.hidden = maxScroll <= 1;
      if (topScroll.hidden) {
        scroll.scrollLeft = 0;
        return;
      }
      const trackWidth = track.clientWidth;
      const thumbWidth = Math.max(52, trackWidth * scroll.clientWidth / scroll.scrollWidth);
      const maxThumbLeft = Math.max(0, trackWidth - thumbWidth);
      const thumbLeft = maxScroll ? maxThumbLeft * scroll.scrollLeft / maxScroll : 0;
      thumb.style.width = `${thumbWidth}px`;
      thumb.style.transform = `translateX(${thumbLeft}px)`;
    });
  }

  function setupRegionModelHorizontalScroll() {
    const scroll = $("#regionModelMatrixScroll");
    const track = $("#regionModelMatrixScrollTrack");
    const thumb = $("#regionModelMatrixScrollThumb");
    let dragState = null;
    let thumbDragState = null;

    scroll.addEventListener("scroll", refreshRegionModelHorizontalScroll);

    scroll.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".matrix-cell-button")
        || event.pointerType === "touch"
        || event.button !== 0
        || scroll.scrollWidth <= scroll.clientWidth) return;
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: scroll.scrollLeft,
        moved: false
      };
      scroll.setPointerCapture(event.pointerId);
      scroll.classList.add("is-dragging");
    });
    scroll.addEventListener("pointermove", (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const distance = event.clientX - dragState.startX;
      if (Math.abs(distance) > 4) dragState.moved = true;
      if (!dragState.moved) return;
      scroll.scrollLeft = dragState.startScrollLeft - distance;
      event.preventDefault();
    });
    const endDrag = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      dragState = null;
      scroll.classList.remove("is-dragging");
    };
    scroll.addEventListener("pointerup", endDrag);
    scroll.addEventListener("pointercancel", endDrag);

    thumb.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      thumbDragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScrollLeft: scroll.scrollLeft
      };
      thumb.setPointerCapture(event.pointerId);
      thumb.classList.add("is-dragging");
      event.preventDefault();
    });
    thumb.addEventListener("pointermove", (event) => {
      if (!thumbDragState || event.pointerId !== thumbDragState.pointerId) return;
      const maxScroll = scroll.scrollWidth - scroll.clientWidth;
      const maxThumbLeft = track.clientWidth - thumb.offsetWidth;
      if (maxScroll <= 0 || maxThumbLeft <= 0) return;
      scroll.scrollLeft = thumbDragState.startScrollLeft
        + (event.clientX - thumbDragState.startX) * maxScroll / maxThumbLeft;
      event.preventDefault();
    });
    const endThumbDrag = (event) => {
      if (!thumbDragState || event.pointerId !== thumbDragState.pointerId) return;
      thumbDragState = null;
      thumb.classList.remove("is-dragging");
    };
    thumb.addEventListener("pointerup", endThumbDrag);
    thumb.addEventListener("pointercancel", endThumbDrag);
    track.addEventListener("pointerdown", (event) => {
      if (event.target === thumb || event.button !== 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      scroll.scrollLeft = ratio * (scroll.scrollWidth - scroll.clientWidth);
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(refreshRegionModelHorizontalScroll).observe(scroll);
    }
    window.addEventListener("resize", refreshRegionModelHorizontalScroll);
  }

  function renderRegionModelMatrix(selectedModel) {
    const config = REGION_MODEL_INSIGHTS.categories[state.matrixCategory] || REGION_MODEL_INSIGHTS.categories.resistance;
    const brandModels = getOverviewBrand().models.map((model) => ({
      name: model.name,
      index: REGION_MODEL_INSIGHTS.models.indexOf(model.name),
      data: model
    }));
    const visibleModels = selectedModel === "all"
      ? brandModels
      : brandModels.filter((item) => item.name === selectedModel);
    const organization = $("#orgFilter").value;
    const visibleRegions = organization === "全国" ? REGION_MODEL_INSIGHTS.regions : [organization];
    const totalPages = Math.max(1, Math.ceil(visibleRegions.length / REGION_MODEL_PAGE_SIZE));
    state.matrixRegionPage = Math.min(Math.max(1, state.matrixRegionPage), totalPages);
    const pageStart = (state.matrixRegionPage - 1) * REGION_MODEL_PAGE_SIZE;
    const pageRegions = visibleRegions.slice(pageStart, pageStart + REGION_MODEL_PAGE_SIZE);
    const matrix = $(".region-model-matrix");

    $("#regionModelMatrixHead").innerHTML = `<th scope="col">区域</th>${visibleModels.map((item) => `<th scope="col">${escapeHTML(item.name)}</th>`).join("")}`;
    matrix.style.setProperty("--matrix-content-width", `${112 + visibleModels.length * 190}px`);
    currentRegionModelEntries = [];
    if (!state.scenes.size) {
      $("#regionModelMatrixBody").innerHTML = `<tr><td class="matrix-empty" colspan="${visibleModels.length + 1}">当前未选择业务场景，暂无客户关注差异</td></tr>`;
      $("#regionModelMatrixPagination").hidden = true;
      refreshRegionModelHorizontalScroll();
      return;
    }
    const insightEntries = [];
    $("#regionModelMatrixBody").innerHTML = pageRegions.map((region) => {
      const rowIndex = Math.max(0, REGION_MODEL_INSIGHTS.regions.indexOf(region));
      return `
      <tr>
        <th scope="row">${escapeHTML(region)}</th>
        ${visibleModels.map((item) => {
          const baseValue = getRegionModelBaseValue(rowIndex, item.index);
          const value = state.matrixCategory === "resistance"
            ? baseValue
            : Math.max(1.2, baseValue * config.factor + config.offset + ((rowIndex + item.index) % 3 - 1) * 0.35);
          const heatClass = value >= 8 ? "heat-high" : value >= 5.8 ? "heat-medium" : "heat-low";
          const label = config.labels[item.index] || config.labels[Math.max(0, item.index) % config.labels.length];
          const customerShare = getMatrixCustomerShare(rowIndex, item.index);
          const deltaClass = value >= 0 ? "up" : "down";
          const deltaText = `${value >= 0 ? "+" : ""}${value.toFixed(1)}pp`;
          const entryIndex = insightEntries.push({
            region,
            rowIndex,
            model: item.name,
            modelIndex: item.index,
            modelData: item.data,
            label,
            value,
            customerShare
          }) - 1;
          return `<td class="${heatClass}"><button class="matrix-cell-button" data-matrix-cell="${entryIndex}" type="button" aria-label="查看 ${escapeHTML(region)} ${escapeHTML(item.name)} ${escapeHTML(label)}，占比 ${customerShare.toFixed(2)}%，相对全国基准${value >= 0 ? "增加" : "减少"} ${Math.abs(value).toFixed(1)} 个百分点"><strong class="matrix-label">${escapeHTML(label)}</strong><span class="matrix-metrics"><b>${customerShare.toFixed(2)}%</b><em class="${deltaClass}">${deltaText}</em></span></button></td>`;
        }).join("")}
      </tr>
    `;
    }).join("");
    currentRegionModelEntries = insightEntries;
    $$("[data-matrix-cell]", $("#regionModelMatrixBody")).forEach((button) => {
      button.addEventListener("click", () => openRegionModelInsightDrawer(currentRegionModelEntries[Number(button.dataset.matrixCell)]));
    });

    const pagination = $("#regionModelMatrixPagination");
    pagination.hidden = visibleRegions.length <= REGION_MODEL_PAGE_SIZE;
    pagination.innerHTML = pagination.hidden ? "" : `
      <span>第 ${pageStart + 1}-${Math.min(pageStart + REGION_MODEL_PAGE_SIZE, visibleRegions.length)} 条，共 ${visibleRegions.length} 个区域</span>
      <div>
        <button data-matrix-page="${state.matrixRegionPage - 1}" type="button" ${state.matrixRegionPage === 1 ? "disabled" : ""}>上一页</button>
        ${Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return `<button class="${page === state.matrixRegionPage ? "active" : ""}" data-matrix-page="${page}" type="button" aria-label="第 ${page} 页" ${page === state.matrixRegionPage ? 'aria-current="page"' : ""}>${page}</button>`;
        }).join("")}
        <button data-matrix-page="${state.matrixRegionPage + 1}" type="button" ${state.matrixRegionPage === totalPages ? "disabled" : ""}>下一页</button>
      </div>
    `;
    $$("[data-matrix-page]", pagination).forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.matrixPage);
        if (nextPage < 1 || nextPage > totalPages || nextPage === state.matrixRegionPage) return;
        state.matrixRegionPage = nextPage;
        renderRegionModelMatrix(selectedModel);
      });
    });
    refreshRegionModelHorizontalScroll();
  }

  function renderOverview() {
    const selectedModel = $("#modelFilter").value;
    renderInsightView(selectedModel);
    renderDeepInsights();
    renderOverviewRuleInsights();
  }

  function goToStage(stage, topic) {
    state.topic = topic || "need";
    state.activeRow = 0;
    state.pageMode = "compare";
    state.stage = stage;
    setDefaultScenesForStage(stage);
    renderStage();
    $(".main").scrollTo({ top: 0, behavior: "smooth" });
  }

  function setDefaultScenesForStage(stage) {
    state.scenes = new Set(stage === "offline" ? STAGE_SCENES.offline : STAGE_SCENES.online);
    $$("#sceneFilter input[type='checkbox']").forEach((checkbox) => {
      checkbox.checked = state.scenes.has(checkbox.value);
    });
    updateSceneFilterSummary();
  }

  function renderStage() {
    renderMatureBatchExplanation();
    $$("[data-page-mode]").forEach((button) => {
      const active = button.dataset.pageMode === state.pageMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    $("#compareAnalysisTabs").hidden = state.pageMode !== "compare";
    $$("[data-compare-stage]").forEach((button) => {
      const active = button.dataset.compareStage === state.stage;
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
    const groups = getStageGroups(meta);
    const scale = getWindowScale();
    const rateAdjustment = getRateAdjustment();
    const isSingle = false;
    const selectedSceneLabels = getSelectedSceneLabels(state.stage);
    $("#stageAnalysis").classList.toggle("single-mode", isSingle);
    $("#testDriveTab").hidden = state.stage !== "offline";
    $("#stageKicker").textContent = meta.kicker;
    $("#comparisonTitle").textContent = isSingle ? `聚焦“${single.name}”客群的对话特征` : meta.title;
    $("#comparisonDesc").textContent = selectedSceneLabels.length
      ? `${getScopeLabel()} · 当前纳入：${selectedSceneLabels.join("、")}。`
      : "当前阶段未选择业务场景，请在经营范围中至少选择一个场景。";
    $("#editGroupsButton").hidden = state.stage !== "offline";

    const a = groups.a;
    const b = groups.b;
    const scopedARate = scale ? Math.max(0, Math.min(100, a.rate + rateAdjustment)) : 0;
    const scopedBRate = scale ? Math.max(0, 100 - scopedARate) : 0;
    $("#groupAName").textContent = a.name;
    $("#groupAMeta").textContent = `可分析客户 ${Math.round(a.valid * scale).toLocaleString("zh-CN")} 人`;
    $("#groupAValue").textContent = Math.round(a.customers * scale).toLocaleString("zh-CN");
    $("#groupARate").textContent = `${scopedARate.toFixed(1)}%`;
    $("#trackA").style.width = `${scopedARate}%`;
    $("#groupBName").textContent = b.name;
    $("#groupBMeta").textContent = `可分析客户 ${Math.round(b.valid * scale).toLocaleString("zh-CN")} 人`;
    $("#groupBValue").textContent = Math.round(b.customers * scale).toLocaleString("zh-CN");
    $("#groupBRate").textContent = `${scopedBRate.toFixed(1)}%`;
    $("#trackB").style.width = `${scopedBRate}%`;
    const sampleValid = Math.round((isSingle ? single.valid : meta.valid) * scale);
    state.currentStageSampleValid = sampleValid;
    $(".ai-brief .brief-scope").textContent = `${isSingle ? single.name : `${a.name} vs ${b.name}`} · ${sampleValid.toLocaleString("zh-CN")} 名可分析客户`;
    $("#aiTitle").textContent = "智能洞察";
    $("#aiDesc").textContent = isSingle
      ? `${single.name} · 根据当前指标总结高频需求、阶段难点、动作与竞品发现`
      : `${a.name} vs ${b.name} · 根据当前指标总结两组最明显的数据差异`;
    const targetResultName = state.stage === "online"
      ? `${state.windowDays} 日内到店率`
      : state.offlineCustom ? `${a.name}目标结果率` : `到店后 ${state.windowDays} 日成交率`;
    $("#unifiedResultRateLabel").textContent = targetResultName;
    $("#candidateResultRateLabel").textContent = `${targetResultName}：完成 / 未完成`;
    $("#legendA").textContent = a.name;
    $("#legendB").textContent = b.name;
    invalidateCompareAiSummary();
    $$(".topic-tabs button").forEach((button) => {
      const active = button.dataset.topic === state.topic;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    renderTopic();
    renderUnifiedActions();
    renderCandidates();
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
    if (!topic) {
      state.topic = "need";
      return renderTopic();
    }
    $("#signalTitle").textContent = topic.title;
    $("#signalDesc").textContent = topic.desc;
    if (!getSelectedStageSceneCount(state.stage)) {
      $("#signalList").innerHTML = '<div class="analysis-filter-empty">当前阶段未选择业务场景，暂无信号数据</div>';
      $("#voiceTitle").textContent = "客户原声";
      $("#voiceList").innerHTML = '<div class="analysis-filter-empty">选择业务场景后可查看对应原声</div>';
      return;
    }
    $("#signalList").innerHTML = topic.rows.map((row, index) => {
      const delta = Number((row.a - row.b).toFixed(1));
      const deltaText = delta >= 0 ? `A +${delta.toFixed(1)}` : `B +${Math.abs(delta).toFixed(1)}`;
      const value = state.singleGroup === "a" ? row.a : row.b;
      const scaledCount = scaleCountText(row.count);
      const source = state.topic === "action" ? (row.name === "确认购车时间" ? "已有 SOP" : "新增识别") : "";
      return `
        <button class="signal-row${index === state.activeRow ? " active" : ""}" data-index="${index}" type="button">
          <span class="signal-name"><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.sub)} · ${escapeHTML(scaledCount)}</small>${source ? `<em class="source-tag ${source === "已有 SOP" ? "sop" : "new"}">${source}</em>` : ""}</span>
          ${state.mode === "single" ? `<span class="single-track"><span class="track-bg"><i style="width:${Math.min(100, value * 1.25)}%"></i></span><b>${value.toFixed(1)}%</b></span><span class="signal-delta"><strong>${escapeHTML(scaledCount)}</strong><small>命中客户</small></span>` : `<span class="dual-track">
            <span class="track-line a"><span>A</span><span class="track-bg"><i style="width:${Math.min(100, row.a * 1.25)}%"></i></span><b>${row.a.toFixed(1)}%</b></span>
            <span class="track-line b"><span>B</span><span class="track-bg"><i style="width:${Math.min(100, row.b * 1.25)}%"></i></span><b>${row.b.toFixed(1)}%</b></span>
          </span>
          <span class="signal-delta${delta < 0 ? " negative" : ""}"><strong>${deltaText}</strong><small>差异百分点</small></span>`}
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
    let voices = row.voices.length === 1 ? [row.voices[0], createCounterVoice(row.voices[0])] : row.voices;
    if (state.mode === "single") {
      const matched = voices.filter((voice) => voice[0] === state.singleGroup);
      voices = matched.length ? matched : [createVoiceForGroup(voices[0], state.singleGroup)];
    }
    $("#voiceList").innerHTML = voices.slice(0, 3).map((voice, index) => `
      <button class="voice-card group-${voice[0]}" data-voice-index="${index}" type="button">
        <span class="voice-meta"><span>${state.mode === "single" ? "目标客群" : `${voice[0].toUpperCase()} 组`} · ${escapeHTML(voice[1])}</span><span>${escapeHTML(voice[4])}</span></span>
        <blockquote>${escapeHTML(voice[2])}</blockquote>
        <footer><span>${escapeHTML(getScopedVoiceLocation(voice[3]))}</span><b>查看客户证据 →</b></footer>
      </button>
    `).join("");
    $$(".voice-card", $("#voiceList")).forEach((button) => {
      button.addEventListener("click", () => openCustomerDrawer(voices[Number(button.dataset.voiceIndex)], row));
    });
  }

  function getScopedVoiceLocation(location) {
    const organization = $("#orgFilter").value;
    if (organization === "全国" || location.startsWith(organization)) return location;
    const store = organization === "华东大区" ? "上海中心店" : "广州大道店";
    return `${organization} · ${store}`;
  }

  function createCounterVoice(voice) {
    const group = voice[0] === "a" ? "b" : "a";
    const stageName = getStageGroups(STAGES[state.stage])[group].name;
    return [group, `客户 C-${group === "a" ? "07642" : "11835"}`, `这条表达在${stageName}客户中也有出现，但当前样本占比较低。`, "华南大区 · 广州大道店", "07-15 10:28"];
  }

  function createVoiceForGroup(voice, group) {
    const stageName = getStageGroups(STAGES[state.stage])[group].name;
    return [group, `客户 C-${group === "a" ? "07642" : "11835"}`, `该信号在“${stageName}”客群中有明确表达，可继续下钻查看完整录音时间线。`, voice[3], voice[4]];
  }

  function renderUnifiedActions() {
    const rows = UNIFIED_ACTIONS[state.stage];
    $("#unifiedActionBody").innerHTML = rows.map((row, index) => `
      <tr>
        <td class="candidate-name"><strong>${escapeHTML(row[0])}</strong><small>${state.stage === "online" ? "邀约场景" : "门店场景"}</small></td>
        <td><span class="source-tag ${row[6]}">${escapeHTML(row[1])}</span></td>
        <td>${Math.round(Number(String(row[2]).replaceAll(",", "")) * getWindowScale()).toLocaleString("zh-CN")} 人</td>
        <td><span class="metric-strong">${escapeHTML(row[3])}</span></td>
        <td>${row[4] === "—" ? '<span class="muted-value">不适用</span>' : `<span class="metric-strong">${escapeHTML(row[4])}</span>`}</td>
        <td><span class="lift-value">${escapeHTML(row[5])}</span></td>
        <td><button class="row-action" data-unified-action="${index}" type="button">查看证据 →</button></td>
      </tr>
    `).join("");
    $$('[data-unified-action]', $("#unifiedActionBody")).forEach((button) => {
      button.addEventListener("click", () => openUnifiedActionDrawer(Number(button.dataset.unifiedAction)));
    });
  }

  function renderCandidates() {
    const rows = CANDIDATES[state.stage];
    $("#candidateBody").innerHTML = rows.map((row, index) => {
      const statusClass = row[6] === "已采纳" ? "adopted" : row[6] === "不采纳" ? "rejected" : "pending";
      const stableClass = row[5] === "稳定" ? "stable" : "observe";
      return `
        <tr>
          <td class="candidate-name"><strong>${escapeHTML(row[0])}</strong><small>${state.stage === "online" ? "邀约场景" : "门店场景"} · 新增识别</small></td>
          <td>${escapeHTML(row[1])}</td>
          <td class="rate-pair">${state.mode === "single" ? `<span class="${state.singleGroup}">${row[state.singleGroup === "a" ? 2 : 3]}%</span>` : `<span class="a">${row[2]}%</span><i>/</i><span class="b">${row[3]}%</span>`}</td>
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
      const host = $(`.status-grid[data-group="${group}"]`);
      host.innerHTML = STATUS_OPTIONS.map((status) => {
        const selected = state.groups[group].has(status);
        return `<button type="button" data-status="${escapeHTML(status)}" class="${selected ? "selected" : ""}" aria-pressed="${selected}">${escapeHTML(status)}</button>`;
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

  function getMatrixImpactSummary(entry) {
    const regionShare = {
      "华东大区": 0.32,
      "华南大区": 0.23,
      "华北大区": 0.18,
      "华中大区": 0.15,
      "西南大区": 0.12
    }[entry.region] || 0.2;
    const scopedCustomers = Math.max(1, Math.round(entry.modelData.valid * getTimeScale() * regionShare));
    const impactRate = Math.min(0.68, 0.16 + entry.value / 30);
    const impactCustomers = Math.max(1, Math.round(scopedCustomers * impactRate));
    return {
      impactCustomers,
      scopedCustomers,
      impactRate: impactCustomers / scopedCustomers * 100,
      recordings: Math.round(impactCustomers * 2.2)
    };
  }

  function getMatrixSceneDistribution(entry, impactCustomers) {
    const labels = $$("#sceneFilter input[type='checkbox']:checked").map((input) => input.closest("label").querySelector("span").textContent);
    const weights = labels.map((label, index) => ({
      label,
      weight: 30 - index * 3 + (entry.rowIndex + entry.modelIndex + index) % 7
    }));
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    let assignedShare = 0;
    return weights.map((item, index) => {
      const share = index === weights.length - 1
        ? 100 - assignedShare
        : Math.round(item.weight / totalWeight * 100);
      assignedShare += share;
      return {
        label: item.label,
        share,
        customers: Math.round(impactCustomers * share / 100)
      };
    });
  }

  function getMatrixTrend(entry) {
    const changes = [-2.1, -1.5, -0.9, -0.4, 0.3, 0];
    const seed = (entry.rowIndex + entry.modelIndex) % 3;
    const points = changes.map((change, index) => ({
      label: formatMonthDay(shiftDate(DATA_CUTOFF, -(changes.length - 1 - index) * 7)),
      value: Math.max(0.8, entry.value + change + (index === changes.length - 1 ? 0 : (seed - 1) * 0.18))
    }));
    const maxValue = Math.max(...points.map((point) => point.value));
    return {
      points: points.map((point) => ({ ...point, height: Math.round(24 + point.value / maxValue * 50) })),
      change: points[points.length - 1].value - points[0].value
    };
  }

  function getMatrixVoiceExamples(entry) {
    const voices = {
      resistance: [
        `客户：${entry.model}我主要还是担心${entry.label}，这个问题如果解决不了，我还要再比较一下。`,
        `客户：销售前面讲了不少配置，但我最关心的${entry.label}还没有说清楚。`
      ],
      payment: [
        `客户：我倾向${entry.label}，想先把首付、月供和总利息都算明白。`,
        `客户：价格可以谈，但付款方案要适合我现在的资金安排。`
      ],
      competitor: [
        `客户：我也在看${entry.label}，主要想比较价格、空间和实际使用成本。`,
        `客户：如果跟${entry.label}相比优势不够明确，我暂时不会马上决定。`
      ],
      test_drive: [
        `客户：目前是${entry.label}，我想实际体验后再判断是不是适合。`,
        `客户：静态看车还不够，试驾安排和体验会影响我最后的决定。`
      ],
      budget: [
        `客户：我的预算大概是${entry.label}，如果超出太多就要重新考虑。`,
        `客户：车型是喜欢的，但还要看金融和置换以后能不能落在预算内。`
      ]
    };
    const texts = voices[state.matrixCategory] || [
      `客户：关于${entry.label}，我希望销售能结合我的实际情况讲得更具体一些。`,
      `客户：这个点会影响我是否继续考虑${entry.model}，还需要再确认。`
    ];
    const stores = {
      "华东大区": "上海中心店",
      "华南大区": "广州大道店",
      "华北大区": "北京朝阳店",
      "华中大区": "武汉汉口店",
      "西南大区": "成都机场路店"
    };
    return texts.map((text, index) => ({
      customer: `客户 C-${String(7200 + entry.rowIndex * 120 + entry.modelIndex * 17 + index * 9).padStart(5, "0")}`,
      text,
      location: `${entry.region} · ${stores[entry.region] || "区域中心店"}`,
      time: index ? "07-17 15:36" : "07-18 11:24"
    }));
  }

  function openRegionModelInsightDrawer(entry) {
    if (!entry) return;
    const impact = getMatrixImpactSummary(entry);
    const scenes = getMatrixSceneDistribution(entry, impact.impactCustomers);
    const trend = getMatrixTrend(entry);
    const voices = getMatrixVoiceExamples(entry);
    $("#drawerKicker").textContent = "车型 × 区域客户洞察";
    $("#drawerTitle").textContent = `${entry.model} · ${entry.region}`;
    $("#drawerSubtitle").textContent = `${entry.label} · 高于全国基准 ${entry.value.toFixed(1)}pp`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section"><h3>影响客户</h3><div class="matrix-impact-summary">
        <article><strong>${impact.impactCustomers.toLocaleString("zh-CN")}</strong><span>命中客户</span></article>
        <article><strong>${impact.impactRate.toFixed(1)}%</strong><span>区域车型客户占比</span></article>
        <article><strong>${impact.recordings.toLocaleString("zh-CN")}</strong><span>相关录音</span></article>
      </div><p class="matrix-detail-note">当前范围共 ${impact.scopedCustomers.toLocaleString("zh-CN")} 名可分析客户；客户级去重，同一客户可命中多个标签。</p></section>
      <section class="drawer-section"><h3>场景分布</h3><div class="matrix-scene-list">${scenes.map((scene) => `
        <div class="matrix-scene-row"><span>${escapeHTML(scene.label)}</span><i><b style="width:${scene.share}%"></b></i><strong>${scene.share}%</strong><em>${scene.customers.toLocaleString("zh-CN")} 人</em></div>
      `).join("")}</div></section>
      <section class="drawer-section"><h3>近 6 周趋势</h3><div class="matrix-trend-summary"><strong class="${trend.change >= 0 ? "up" : "down"}">${trend.change >= 0 ? "+" : ""}${trend.change.toFixed(1)}pp</strong><span>相较 6 周前</span></div><div class="matrix-trend-chart">${trend.points.map((point) => `
        <div><span>${point.value.toFixed(1)}%</span><i style="height:${point.height}px"></i><small>${point.label}</small></div>
      `).join("")}</div></section>
      <section class="drawer-section"><h3>客户原声</h3><div class="matrix-voice-list">${voices.map((voice) => `
        <article><p class="evidence-line">${escapeHTML(voice.text)}</p><div class="evidence-meta"><span>${escapeHTML(voice.customer)} · ${escapeHTML(voice.location)}</span><span>${escapeHTML(voice.time)}</span></div></article>
      `).join("")}</div></section>
      <section class="drawer-section glossary-warning"><h3>解读边界</h3><p>影响客户、场景分布和趋势用于定位复盘范围；差异只表示该标签在当前车型 × 区域组合中更集中，不直接代表因果。</p></section>
    `;
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function openCustomerDrawer(voice, row) {
    const meta = STAGES[state.stage];
    const groups = getStageGroups(meta);
    const groupName = voice[0] === "a" ? groups.a.name : groups.b.name;
    $("#drawerKicker").textContent = "匿名客户证据";
    $("#drawerTitle").textContent = voice[1];
    $("#drawerSubtitle").textContent = `${state.stage === "online" ? "邀约场景" : "门店场景"} · ${groupName}`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section"><h3>已识别客户信号</h3><div class="drawer-tags"><span>${escapeHTML(row.name)}</span><span>${escapeHTML(row.sub)}</span><span>${escapeHTML($("#modelFilter").value === "all" ? $("#brandFilter").value : $("#modelFilter").value)}</span><span>${groupName}</span></div></section>
      <section class="drawer-section"><h3>真实对话证据</h3><p class="evidence-line">${escapeHTML(voice[2])}</p><div class="evidence-meta"><span>${escapeHTML(getScopedVoiceLocation(voice[3]))}</span><span>${escapeHTML(voice[4])}</span></div></section>
      <section class="drawer-section action-definition"><h3>线索旅程与证据窗口</h3><dl><dt>客群</dt><dd>${escapeHTML(groupName)} · ${state.windowDays} 天窗口</dd><dt>T0</dt><dd>${state.stage === "online" ? "07-11 09:26 · 首条邀约类录音" : "07-14 13:40 · 首次真实到店"}</dd><dt>结果事件</dt><dd>${voice[0] === "a" ? (state.stage === "online" ? "07-18 15:12 · 真实到店" : "07-19 10:08 · 进入已下订状态") : `窗口内未发生目标结果`}</dd><dt>证据截止</dt><dd>${voice[0] === "a" ? "结果事件发生前" : `T0＋${state.windowDays} 天`}，结果后的录音不用于解释</dd><dt>使用范围</dt><dd>仅作为该客户所属客群的证据，不生成下一步跟进建议。</dd></dl></section>
    `;
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function openCandidateDrawer(index) {
    const row = CANDIDATES[state.stage][index];
    const evidence = DATA[state.stage].action.rows[Math.min(index, DATA[state.stage].action.rows.length - 1)].voices[0];
    $("#drawerKicker").textContent = "标准销售动作候选";
    $("#drawerTitle").textContent = row[0];
    $("#drawerSubtitle").textContent = `${state.stage === "online" ? "邀约场景" : "门店场景"} · ${row[6]}`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section action-definition"><h3>候选动作定义</h3><dl><dt>能力来源</dt><dd>1.0 新增识别，未被现有 SOP 覆盖</dd><dt>客户信号</dt><dd>${escapeHTML(row[1])}</dd><dt>动作要求</dt><dd>${escapeHTML(row[0])}，并在对话中明确客户可确认的内容。</dd><dt>动作完成率</dt><dd>${state.mode === "single" ? `${getStageGroups(STAGES[state.stage])[state.singleGroup].name} ${row[state.singleGroup === "a" ? 2 : 3]}%` : `A 组 ${row[2]}% / B 组 ${row[3]}%`}</dd><dt>目标结果率</dt><dd>完成 / 未完成：${escapeHTML(row[4])}</dd><dt>适用范围</dt><dd>${escapeHTML(getScopeLabel(true))} · 当前筛选时间</dd><dt>稳定性</dt><dd>${escapeHTML(row[5])}，仅表达结果关联，不代表因果。</dd></dl></section>
      <section class="drawer-section"><h3>支撑证据</h3><p class="evidence-line">${escapeHTML(evidence[2])}</p><div class="evidence-meta"><span>${escapeHTML(getScopedVoiceLocation(evidence[3]))}</span><span>${escapeHTML(evidence[4])}</span></div></section>
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

  function openUnifiedActionDrawer(index) {
    const row = UNIFIED_ACTIONS[state.stage][index];
    const evidenceRows = DATA[state.stage].action.rows;
    const evidence = evidenceRows[Math.min(index, evidenceRows.length - 1)].voices[0];
    $("#drawerKicker").textContent = row[1] === "已有 SOP" ? "已有 SOP 动作" : "1.0 新增识别动作";
    $("#drawerTitle").textContent = row[0];
    $("#drawerSubtitle").textContent = `${state.stage === "online" ? "邀约场景" : "门店场景"} · ${state.windowDays} 天结果观察期`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section action-definition"><h3>动作口径</h3><dl><dt>来源</dt><dd>${escapeHTML(row[1])}</dd><dt>动作机会客户</dt><dd>${Math.round(Number(String(row[2]).replaceAll(",", "")) * getWindowScale()).toLocaleString("zh-CN")} 名</dd><dt>动作完成率</dt><dd>${escapeHTML(row[3])}</dd><dt>SOP 合格率</dt><dd>${row[4] === "—" ? "不适用，新增动作只判断完成" : escapeHTML(row[4])}</dd><dt>目标结果率</dt><dd>${escapeHTML(row[5])}，只表示关联，不代表因果</dd></dl></section>
      <section class="drawer-section"><h3>销售话术证据</h3><p class="evidence-line">${escapeHTML(evidence[2])}</p><div class="evidence-meta"><span>${escapeHTML(getScopedVoiceLocation(evidence[3]))}</span><span>${escapeHTML(evidence[4])}</span></div></section>
      <section class="drawer-section"><h3>详情边界</h3><p>${row[1] === "已有 SOP" ? "完整规则、全部核查项和未命中详情请前往 SOP 专门页面查看。" : "该动作尚未被 SOP 覆盖，可进入下方候选管理流程继续验证。"}</p></section>
    `;
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function getTopRow(topicName, group) {
    const rows = DATA[state.stage][topicName].rows;
    return rows.reduce((best, row, index) => {
      const value = row[group];
      return !best || value > best.value ? { row, index, value } : best;
    }, null);
  }

  function getLargestGap(topicName) {
    const rows = DATA[state.stage][topicName].rows;
    return rows.reduce((best, row, index) => {
      const delta = Number((row.a - row.b).toFixed(1));
      return !best || Math.abs(delta) > Math.abs(best.delta) ? { row, index, delta } : best;
    }, null);
  }

  function getCompareRuleInsightItems() {
    const groups = getStageGroups(STAGES[state.stage]);
    if (state.mode === "single") {
      const group = state.singleGroup;
      const groupName = groups[group].name;
      const topics = [
        ["need", "高频需求"],
        ["resistance", "主要阶段难点"],
        ["action", "高频销售动作"],
        ["competitor", "主要竞品信号"]
      ];
      return topics.map(([topic, label]) => {
        const finding = getTopRow(topic, group);
        const suffix = topic === "action" ? "动作完成率" : topic === "competitor" ? "提及客户占比" : "客户占比";
        return {
          title: `${label}：${finding.row.name}`,
          detail: `“${groupName}”客群中该信号${suffix}为 ${finding.value.toFixed(1)}%，涉及 ${scaleCountText(finding.row.count)}。`,
          topic,
          row: finding.index
        };
      });
    }

    return [
      ["need", "客户需求差异", "客户占比"],
      ["resistance", "阶段难点差异", "客户占比"],
      ["action", "销售动作差异", "动作完成率"],
      ["competitor", "竞品信号差异", "提及客户占比"]
    ].map(([topic, label, metric]) => {
      const finding = getLargestGap(topic);
      const highGroup = finding.delta >= 0 ? groups.a.name : groups.b.name;
      const lowGroup = finding.delta >= 0 ? groups.b.name : groups.a.name;
      const highValue = finding.delta >= 0 ? finding.row.a : finding.row.b;
      const lowValue = finding.delta >= 0 ? finding.row.b : finding.row.a;
      return {
        title: `${label}：${finding.row.name}`,
        detail: `“${highGroup}”${metric}为 ${highValue.toFixed(1)}%，比“${lowGroup}”的 ${lowValue.toFixed(1)}% 高 ${Math.abs(finding.delta).toFixed(1)} 个百分点，涉及 ${scaleCountText(finding.row.count)}。`,
        topic,
        row: finding.index
      };
    });
  }

  function openMetricGlossaryDrawer() {
    const stageLabel = state.stage === "overview" ? "首页概览、邀约场景与门店场景通用" : state.stage === "online" ? "邀约场景" : "门店场景";
    const resultLabel = state.stage === "online"
      ? `${state.windowDays} 日内到店`
      : state.stage === "offline" ? `到店后 ${state.windowDays} 日成交或当前选定状态` : "线上到店 / 线下成交";
    $("#drawerKicker").textContent = "全页面通用口径";
    $("#drawerTitle").textContent = "指标口径说明";
    $("#drawerSubtitle").textContent = `${stageLabel} · 当前目标结果：${resultLabel}`;
    const timeContext = state.stage === "overview"
      ? `<strong>${escapeHTML(state.analysisPeriod)}</strong>`
      : `<strong>${escapeHTML(state.analysisPeriod)}</strong> · <strong>${state.windowDays} 天</strong>结果观察期`;
    $("#drawerBody").innerHTML = `
      <section class="drawer-section metric-current-context"><h3>当前分析设置</h3><p>${timeContext} · 目标结果为<strong>${escapeHTML(resultLabel)}</strong></p></section>
      <section class="drawer-section"><h3>指标词典</h3><div class="metric-glossary-list">${METRIC_GLOSSARY.map(([name, meaning, formula]) => `
        <article><h4>${escapeHTML(name)}</h4><p>${escapeHTML(meaning)}</p><span><b>计算口径</b>${escapeHTML(formula)}</span></article>
      `).join("")}</div></section>
      <section class="drawer-section glossary-warning"><h3>统一提示</h3><p>客户信号、销售动作和目标结果同时出现得更频繁，只能说明存在关联，不能直接证明因果关系。</p></section>
    `;
    $("#detailDrawer").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function setCompareAiGenerateLabel(label) {
    $("#generateAiButton").innerHTML = `<span aria-hidden="true">✦</span>${escapeHTML(label)}`;
  }

  function renderCompareRuleInsights() {
    const items = getCompareRuleInsightItems();
    const sampleValid = Math.max(0, Number(state.currentStageSampleValid) || 0);
    const groupCount = state.mode === "single" ? 1 : 2;
    $("#compareAiInsightCount").textContent = items.length;
    $("#compareAiCustomerCount").textContent = sampleValid.toLocaleString("zh-CN");
    $("#compareAiGroupCount").textContent = groupCount;
    $("#aiSummaryList").innerHTML = items.map((item, index) => `
      <article class="overview-ai-insight-card">
        <div class="overview-ai-insight-card-head"><span class="overview-ai-insight-index">${index + 1}</span><strong>${escapeHTML(item.title)}</strong></div>
        <p>${escapeHTML(item.detail)}</p>
        <button class="overview-ai-insight-link" type="button" data-ai-topic="${item.topic}" data-ai-row="${item.row}">查看明细</button>
      </article>
    `).join("");
    $$('[data-ai-topic]', $("#aiSummaryList")).forEach((link) => {
      link.addEventListener("click", () => {
        state.topic = link.dataset.aiTopic;
        state.activeRow = Number(link.dataset.aiRow);
        $$(".topic-tabs button").forEach((tab) => {
          const active = tab.dataset.topic === state.topic;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        renderTopic();
        $(".topic-workspace").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return items;
  }

  function invalidateCompareAiSummary() {
    const hadResult = compareAiSummaryGenerated;
    compareAiSummaryGenerationId += 1;
    compareAiSummaryGenerated = false;
    renderCompareRuleInsights();
    $("#compareAiSummaryLoading").hidden = true;
    $("#aiResult").hidden = false;
    $("#compareAiExecutive").classList.add("is-pending");
    $("#aiExecutiveConclusion").hidden = true;
    $("#aiExecutiveConclusion").textContent = "";
    $("#compareAiEvidenceStats").hidden = true;
    const status = $("#compareAiSummaryStatus");
    status.hidden = !hadResult;
    status.classList.toggle("is-stale", hadResult);
    status.textContent = hadResult ? "筛选已更新 · 待重新生成" : "";
    $("#generateAiButton").disabled = false;
    setCompareAiGenerateLabel(hadResult ? "重新生成 AI 综合判断" : "生成 AI 综合判断");
  }

  function generateAiSummary() {
    const button = $("#generateAiButton");
    if (button.disabled) return;
    const requestId = ++compareAiSummaryGenerationId;
    button.disabled = true;
    setCompareAiGenerateLabel("AI 正在生成…");
    $("#compareAiSummaryStatus").hidden = true;
    $("#aiResult").hidden = false;
    $("#compareAiExecutive").classList.add("is-pending");
    $("#aiExecutiveConclusion").hidden = true;
    $("#compareAiEvidenceStats").hidden = true;
    $("#compareAiSummaryLoading").hidden = false;
    window.setTimeout(() => {
      if (requestId !== compareAiSummaryGenerationId) return;
      const items = renderCompareRuleInsights();
      const prioritySignal = items[0].title.split("：")[1] || items[0].title;
      $("#aiExecutiveConclusion").textContent = `综合客户需求、阶段难点、销售动作和竞品信号 4 个方面后，“${prioritySignal}”是当前最值得优先复盘的差异；其余三方面共同指向两组客群在决策关注和销售承接上的不同，建议进入明细核对对应客户原声。`;
      $("#aiExecutiveConclusion").hidden = false;
      $("#compareAiEvidenceStats").hidden = false;
      $("#compareAiExecutive").classList.remove("is-pending");
      compareAiSummaryGenerated = true;
      $("#compareAiSummaryLoading").hidden = true;
      $("#aiResult").hidden = false;
      const status = $("#compareAiSummaryStatus");
      status.hidden = false;
      status.classList.remove("is-stale");
      status.textContent = "已生成 · 刚刚";
      button.disabled = false;
      setCompareAiGenerateLabel("重新生成 AI 综合判断");
    }, 720);
  }

  $$("[data-page-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pageMode = button.dataset.pageMode;
      state.stage = state.pageMode === "insight" ? "overview" : "online";
      if (state.pageMode === "insight") {
        state.scenes = new Set(SCENE_VALUES);
        $$("#sceneFilter input[type='checkbox']").forEach((checkbox) => { checkbox.checked = true; });
        updateSceneFilterSummary();
      } else {
        setDefaultScenesForStage("online");
      }
      state.activeRow = 0;
      renderStage();
    });
  });

  $$("[data-compare-stage]").forEach((button) => {
    button.addEventListener("click", () => {
      state.stage = button.dataset.compareStage;
      if (state.stage === "online" && state.topic === "testdrive") state.topic = "need";
      setDefaultScenesForStage(state.stage);
      state.activeRow = 0;
      renderStage();
    });
  });

  $("#customerDateTrigger").addEventListener("click", () => {
    state.datePickerOpen = !state.datePickerOpen;
    if (state.datePickerOpen) {
      state.draftStartDate = state.startDate;
      state.draftEndDate = state.endDate;
      const selectedStart = parseISODate(state.startDate);
      state.calendarMonth = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
    }
    renderCustomerDatePicker();
  });

  $("#customerCalendarMonths").addEventListener("click", (event) => {
    event.stopPropagation();
    const navButton = event.target.closest("[data-calendar-nav]");
    if (navButton) {
      const shift = Number(navButton.dataset.calendarNav);
      state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + shift, 1);
      renderCustomerDatePicker();
      return;
    }
    const dateButton = event.target.closest("[data-customer-date-value]");
    if (!dateButton) return;
    const value = dateButton.dataset.customerDateValue;
    if (!state.draftStartDate || state.draftEndDate) {
      state.draftStartDate = value;
      state.draftEndDate = null;
    } else if (value < state.draftStartDate) {
      state.draftEndDate = state.draftStartDate;
      state.draftStartDate = value;
    } else {
      state.draftEndDate = value;
    }
    renderCustomerDatePicker();
  });

  $$("[data-date-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const days = button.dataset.datePreset === "today" ? 1 : Number(button.dataset.datePreset);
      state.draftStartDate = formatISODate(shiftDate(DATA_CUTOFF, -(days - 1)));
      state.draftEndDate = formatISODate(DATA_CUTOFF);
      const presetStart = parseISODate(state.draftStartDate);
      state.calendarMonth = new Date(presetStart.getFullYear(), presetStart.getMonth(), 1);
      renderCustomerDatePicker();
    });
  });

  $("#cancelCustomerDate").addEventListener("click", () => {
    state.datePickerOpen = false;
    state.draftStartDate = state.startDate;
    state.draftEndDate = state.endDate;
    renderCustomerDatePicker();
  });

  $("#applyCustomerDate").addEventListener("click", () => {
    if (!state.draftStartDate || !state.draftEndDate) return;
    state.startDate = state.draftStartDate;
    state.endDate = state.draftEndDate;
    state.statisticsDays = getDateRangeDays(state.startDate, state.endDate);
    state.datePickerOpen = false;
    renderStage();
    invalidateOverviewAiSummary();
    showToast(`统计日期已更新为 ${getDateRangeLabel(state.startDate, state.endDate)}`);
  });

  $("#stageDateTrigger").addEventListener("click", () => {
    state.stageDatePickerOpen = !state.stageDatePickerOpen;
    if (state.stageDatePickerOpen) {
      state.datePickerOpen = false;
      state.stageDraftDate = state.stageStartDate;
      state.stageDraftEndDate = state.stageEndDate;
      const selected = parseISODate(state.stageStartDate);
      state.stageCalendarMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    }
    renderCustomerDatePicker();
    renderStageDatePicker();
  });

  $("#stageCalendarMonths").addEventListener("click", (event) => {
    event.stopPropagation();
    const navButton = event.target.closest("[data-stage-calendar-nav]");
    if (navButton) {
      const shift = Number(navButton.dataset.stageCalendarNav);
      state.stageCalendarMonth = new Date(state.stageCalendarMonth.getFullYear(), state.stageCalendarMonth.getMonth() + shift, 1);
      renderStageDatePicker();
      return;
    }
    const dateButton = event.target.closest("[data-stage-date-value]");
    if (!dateButton) return;
    const value = dateButton.dataset.stageDateValue;
    if (!state.stageDraftDate || state.stageDraftEndDate) {
      state.stageDraftDate = value;
      state.stageDraftEndDate = null;
    } else if (value < state.stageDraftDate) {
      state.stageDraftEndDate = state.stageDraftDate;
      state.stageDraftDate = value;
    } else {
      state.stageDraftEndDate = value;
    }
    renderStageDatePicker();
  });

  $("#cancelStageDate").addEventListener("click", () => {
    state.stageDatePickerOpen = false;
    state.stageDraftDate = state.stageStartDate;
    state.stageDraftEndDate = state.stageEndDate;
    renderStageDatePicker();
  });

  $("#applyStageDate").addEventListener("click", () => {
    if (!state.stageDraftDate || !state.stageDraftEndDate) return;
    state.stageStartDate = state.stageDraftDate;
    state.stageEndDate = state.stageDraftEndDate;
    state.stageDatePickerOpen = false;
    invalidateCompareAiSummary();
    renderStage();
    showToast(`统计周期已更新为 ${getDateRangeLabel(state.stageStartDate, state.stageEndDate)}`);
  });

  $$(".date-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      const batchValue = button.dataset.batchDays;
      if (batchValue === "custom") {
        showToast(`自定义开始日不得晚于 ${getBatchDateRange(1)}`);
        return;
      }
      state.batchDays = Number(batchValue);
      state.analysisPeriod = `客户进入日期 ${button.textContent.trim()}`;
      $$(".date-tabs button").forEach((item) => item.classList.toggle("active", item === button));
      renderStage();
      if (state.stage === "overview") {
        showToast(`已切换为 ${button.textContent} 进入的客户`);
      } else {
        invalidateCompareAiSummary();
        showToast(`已切换为 ${button.textContent} 进入的客户，智能洞察待重新生成`);
      }
    });
  });

  $$(".window-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      const fixedStartDate = state.stageStartDate;
      state.windowDays = Number(button.dataset.window);
      const latest = formatISODate(getStageLatestSelectableDate());
      state.stageEndDate = latest;
      if (fixedStartDate && fixedStartDate <= state.stageEndDate) state.stageStartDate = fixedStartDate;
      else if (state.stageStartDate > state.stageEndDate) state.stageStartDate = state.stageEndDate;
      state.stageDraftDate = state.stageStartDate;
      state.stageDraftEndDate = state.stageEndDate;
      $$(".window-tabs button").forEach((item) => item.classList.toggle("active", item === button));
      if (state.stage !== "overview") {
        invalidateCompareAiSummary();
      }
      renderStage();
      showToast(`已改为观察 ${state.windowDays} 天后判断结果`);
    });
  });

  $$(".topic-tabs button").forEach((button) => {
    button.addEventListener("click", () => selectTopic(button.dataset.topic, false));
  });

  $$(".scope-fields select").forEach((select) => {
    select.addEventListener("change", () => {
      if (select.id === "brandFilter") syncModelOptions();
      state.matrixRegionPage = 1;
      renderStage();
      invalidateOverviewAiSummary();
      invalidateCompareAiSummary();
      showToast(state.stage === "overview" ? "经营范围已更新" : "分析范围已更新，智能洞察待重新生成");
    });
  });

  $$("#sceneFilter input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.scenes.add(checkbox.value);
      else state.scenes.delete(checkbox.value);
      updateSceneFilterSummary();
      renderStage();
      invalidateOverviewAiSummary();
      invalidateCompareAiSummary();
      showToast(state.stage === "overview" ? "经营范围已更新" : "分析范围已更新，智能洞察待重新生成");
    });
  });

  $("#applyPreset").addEventListener("click", () => {
    state.groups.a = new Set(["已下定", "异地"]);
    state.groups.b = new Set(["战败", "战败申请中(已到店)"]);
    renderStatusEditor();
  });

  $("#startOfflineCompare").addEventListener("click", () => {
    if (!state.groups.a.size || !state.groups.b.size) return;
    state.offlineCustom = true;
    state.offlineConfigured = true;
    state.stage = "offline";
    state.topic = state.pendingTopic || state.topic || "need";
    state.pendingTopic = null;
    state.activeRow = 0;
    closeLayer("groupModal");
    renderStage();
    showToast("门店场景客群已配置；重叠客户将在两组中分别保留");
  });

  $("#editGroupsButton").addEventListener("click", openGroupModal);
  $("#generateAiButton").addEventListener("click", generateAiSummary);
  $("#generateOverviewAiSummary").addEventListener("click", generateOverviewAiSummary);
  $("#overviewAiInsightGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-ai-insight-target]");
    if (button) openOverviewAiInsight(button.dataset.aiInsightTarget);
  });

  $$("[data-overview-topic]").forEach((button) => {
    button.addEventListener("click", () => goToStage(button.dataset.overviewStage, button.dataset.overviewTopic));
  });

  $$("[data-deep-insight]").forEach((button) => {
    button.addEventListener("click", () => {
      state.deepInsight = button.dataset.deepInsight;
      state.deepEvidenceType = "positive";
      state.deepEvaluationIndex = 0;
      renderDeepInsights();
    });
  });

  $$('[data-matrix-category]').forEach((button) => {
    button.addEventListener("click", () => {
      state.matrixCategory = button.dataset.matrixCategory;
      state.matrixRegionPage = 1;
      $$('[data-matrix-category]').forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderInsightView($("#modelFilter").value);
      invalidateOverviewAiSummary();
    });
  });
  $$("[data-insight-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.matrixView = button.dataset.insightView;
      $$("[data-insight-view]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderInsightView($("#modelFilter").value);
    });
  });
  $("#exportButton").addEventListener("click", () => showToast("当前视图已加入导出任务"));
  $("#metricGlossaryButton").addEventListener("click", openMetricGlossaryDrawer);
  $("#exportAdopted").addEventListener("click", () => showToast("已采纳动作已加入导出任务"));
  $("#generateCandidate").addEventListener("click", () => showToast("已基于当前范围更新标准动作候选"));
  $("#viewAllVoices").addEventListener("click", () => showToast("已展示该信号的全部脱敏客户原声"));
  $("#openSopDetail").addEventListener("click", () => showToast("将携带当前窗口、客群、组织、品牌与车型条件进入 SOP 专门页面"));

  updateSceneFilterSummary();

  $$('[data-close]').forEach((button) => button.addEventListener("click", () => closeLayer(button.dataset.close)));
  $("#groupModal").addEventListener("click", (event) => { if (event.target === $("#groupModal")) closeLayer("groupModal"); });
  $("#detailDrawer").addEventListener("click", (event) => { if (event.target === $("#detailDrawer")) closeLayer("detailDrawer"); });
  document.addEventListener("click", (event) => {
    if (state.datePickerOpen && !$("#customerDatePicker").contains(event.target)) {
      state.datePickerOpen = false;
      state.draftStartDate = state.startDate;
      state.draftEndDate = state.endDate;
      renderCustomerDatePicker();
    }
    if (state.stageDatePickerOpen && !$("#stageDatePicker").contains(event.target)) {
      state.stageDatePickerOpen = false;
      state.stageDraftDate = state.stageStartDate;
      state.stageDraftEndDate = state.stageEndDate;
      renderStageDatePicker();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.datePickerOpen) {
      state.datePickerOpen = false;
      renderCustomerDatePicker();
    } else if (state.stageDatePickerOpen) {
      state.stageDatePickerOpen = false;
      renderStageDatePicker();
    } else if (!$("#detailDrawer").hidden) closeLayer("detailDrawer");
    else if (!$("#groupModal").hidden) closeLayer("groupModal");
  });

  syncModelOptions();
  setupRegionModelHorizontalScroll();
  renderStage();
})();
