(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SalesStrategyModel = api;
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const cutoff = '2026-07-20';
  const statuses = ['下订单', '到店跟进中', '已下定', '已预约到店', '已邀约到店', '异地', '战败', '战败已通过(已到店)', '战败已通过(未到店)', '战败申请中(已到店)', '战败申请中(未到店)', '无效', '无效申请中', '有效', '未跟进', '终端成交', '继续邀约', '跟进中'];
  const models = { 埃安: ['AION V', 'AION Y Plus', 'AION S Plus', 'AION RT'], 传祺: ['传祺 E9', '传祺 M8', '传祺 GS8', '传祺 ES9'] };
  const regions = ['华东大区', '华南大区'];
  const scenes = { online: ['first_follow', 'invite_store', 'schedule_confirm'], offline: ['store_reception', 'test_drive'] };
  const sceneLabels = { first_follow: '首触跟进', invite_store: '邀约到店', schedule_confirm: '排程确认', store_reception: '销售接待', test_drive: '试乘试驾' };
  // SOP 名称沿用会话详情原型，话术和统计为演示数据。
  const existingSop = [
    { id: 'intent-model', name: '意向车型', trigger: '了解客户意向车型', done: '您目前比较关注哪款车型？', missed: '我先给您介绍一下门店。', training: '主动了解客户关注的车型。' },
    { id: 'purchase-focus', name: '购车关注点', trigger: '了解客户购车关注点', done: '您选车最关注空间、续航还是价格？', missed: '这款车的配置很丰富。', training: '了解并记录客户购车时关注的问题。' },
    { id: 'compare-model', name: '对比车型', trigger: '了解客户对比车型', done: '您还对比过其他车型吗？', missed: '您先看看这款车。', training: '了解客户正在对比的车型。' },
    { id: 'trade-in', name: '增换购情况', trigger: '了解客户增换购情况', done: '您家里有车需要置换吗？', missed: '我们先了解一下新车。', training: '了解客户是否有旧车置换或增购需求。' },
    { id: 'buy-time', name: '计划购车时间', trigger: '了解客户计划购车时间', done: '您大概计划什么时候购车？', missed: '您先了解一下，有需要再联系。', training: '了解客户的计划购车时间。' },
    { id: 'test-invite', name: '试乘试驾邀请', trigger: '邀请客户试乘试驾', done: '您有时间可以来店里试乘试驾。', missed: '车型资料我发给您看看。', training: '向客户提出试乘试驾邀请。' },
    { id: 'wechat-invite', name: '添加微信邀请', trigger: '邀请客户添加微信', done: '方便加个微信吗？我把车型资料发给您。', missed: '您有需要再联系我们。', training: '向客户提出添加微信的邀请。' }
  ].map(rule => ({ ...rule, source: '已有 SOP' }));
  const rules = {
    online: [
      ...existingSop,
      { id: 'two-times', name: '提供两个可选到店时间', source: '新增识别', trigger: '客户表示到店时间不确定', done: '周六下午三点或周日上午十点，您哪个时间方便？', missed: '您有空的时候过来就可以。', training: '客户时间不确定时提供两个备选时段，并确认可接受的安排。' },
      { id: 'follow-up', name: '约定下一次具体跟进', source: '新增识别', trigger: '客户暂时不能到店', done: '我周五下午四点再联系您，确认周末到店安排，可以吗？', missed: '那我们以后再联系。', training: '明确下次联系的时间、目的，并取得客户确认。' }
    ],
    offline: [
      ...existingSop,
      { id: 'price', name: '完整解释价格构成', source: '新增识别', trigger: '客户询问落地总价', done: '裸车、保险、金融费用和置换补贴我分项列给您，再一起核算最终落地价。', missed: '今天只说裸车价格，其他费用签约时再看。', training: '分项说明裸车、保险、金融费用及适用权益，核实落地总价。' },
      { id: 'drive-review', name: '试驾后复述关键体验', source: '新增识别', trigger: '客户已经完成试驾', done: '刚才您最关注的是转向和后排舒适度，这两点体验是否符合预期？', missed: '已经试完了，我们直接谈价格吧。', training: '试驾后回顾客户关注点，确认体验与尚未解决的顾虑。' }
    ]
  };
  const shift = (date, days) => new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
  const hash = (text) => Array.from(text).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rate = (n, d) => d ? Math.round(n * 1000 / d) / 10 : null;
  function defaultScope(stage = 'online') {
    stage = stage === 'offline' ? stage : 'online';
    return { stage, brand: '埃安', org: '全国', model: 'all', start: '2026-07-07', end: '2026-07-13', windowDays: 7, scenes: scenes[stage].slice(), a: stage === 'online' ? ['已预约到店', '已邀约到店', '到店跟进中'] : ['下订单'], b: stage === 'online' ? ['未跟进', '战败已通过(未到店)'] : ['战败'] };
  }
  function normalizeScope(input = {}) {
    const base = defaultScope(input.stage);
    const scope = { ...base, ...input, stage: base.stage };
    scope.brand = models[scope.brand] ? scope.brand : base.brand;
    scope.org = regions.includes(scope.org) ? scope.org : '全国';
    scope.model = models[scope.brand].includes(scope.model) ? scope.model : 'all';
    scope.windowDays = [7, 15, 30].includes(Number(scope.windowDays)) ? Number(scope.windowDays) : 7;
    for (const key of ['a', 'b']) scope[key] = Array.isArray(input[key]) ? [...new Set(input[key].filter(s => statuses.includes(s)))] : base[key];
    scope.scenes = Array.isArray(input.scenes) ? input.scenes.filter(s => scenes[scope.stage].includes(s)) : base.scenes;
    for (const key of ['start', 'end']) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(scope[key]) || Number.isNaN(Date.parse(scope[key])) || new Date(scope[key]).toISOString().slice(0, 10) !== scope[key]) scope[key] = base[key];
    }
    return scope;
  }
  function makeRecords() {
    const rows = [];
    for (const stage of ['online', 'offline']) for (let day = 0; day < 49; day++) for (let s = 0; s < statuses.length; s++) for (let variant = 0; variant < 8; variant++) {
      const brand = variant < 4 ? '埃安' : '传祺';
      const model = models[brand][(day + s + variant) % 4];
      const region = regions[(s + variant + Math.floor(day / 2)) % 2];
      const id = `DEMO-${stage}-${day}-${s}-${variant}`;
      const status = statuses[s];
      const positive = ['下订单', '已下定', '终端成交', '已预约到店', '已邀约到店', '到店跟进中'].includes(status);
      const actions = {};
      rules[stage].forEach((rule, index) => {
        const eligible = hash(id + rule.id + 'opportunity') % 10 < 8;
        const complete = eligible && hash(id + rule.id + 'completed') % 100 < (positive ? 78 - index * 4 : 38 + index * 3);
        actions[rule.id] = { eligible, complete, qualified: complete && rule.source === '已有 SOP' && hash(id + rule.id + 'qualified') % 10 < 8, text: complete ? rule.done : rule.missed };
      });
      rows.push({ id, leadId: id, customerId: id, status, stage, brand, model, region, store: region === '华东大区' ? '演示上海中心店' : '演示广州大道店', advisor: `演示顾问 ${(variant + s) % 4 + 1}`, t0: shift('2026-06-01', day), scene: scenes[stage][(day + s + variant) % scenes[stage].length], actions });
    }
    return rows;
  }
  const records = makeRecords();
  function query(input) {
    const scope = normalizeScope(input);
    const overlap = scope.a.filter(s => scope.b.includes(s));
    const errors = [];
    if (!scope.a.length || !scope.b.length) errors.push('A、B 两组都需要至少一个线索状态。');
    if (overlap.length) errors.push('A/B 状态存在重叠，请先修改分组，再比较动作结果和采纳策略。');
    if (scope.start > scope.end) errors.push('开始日期不能晚于结束日期。');
    if (scope.end > cutoff) errors.push('演示数据截至 2026-07-20，请选择该日期及以前。');
    const filtered = records.filter(r => r.stage === scope.stage && r.brand === scope.brand && (scope.org === '全国' || r.region === scope.org) && (scope.model === 'all' || r.model === scope.model) && scope.scenes.includes(r.scene) && (scope.a.includes(r.status) || scope.b.includes(r.status)) && shift(r.t0, scope.windowDays) >= scope.start && shift(r.t0, scope.windowDays) <= scope.end && shift(r.t0, scope.windowDays) <= cutoff);
    const groupA = filtered.filter(r => scope.a.includes(r.status));
    const groupB = filtered.filter(r => scope.b.includes(r.status));
    if (!groupA.length || !groupB.length) errors.push('当前范围至少有一组无演示样本，请扩大范围或调整状态。');
    const summaries = rules[scope.stage].map(rule => {
      const eligible = filtered.filter(r => r.actions[rule.id].eligible);
      const done = eligible.filter(r => r.actions[rule.id].complete);
      const missed = eligible.filter(r => !r.actions[rule.id].complete);
      const group = rows => { const e = rows.filter(r => r.actions[rule.id].eligible); const d = e.filter(r => r.actions[rule.id].complete); return { eligible: e.length, done: d.length, rate: rate(d.length, e.length) }; };
      const a = group(groupA), b = group(groupB);
      const doneTarget = done.filter(r => scope.a.includes(r.status)).length;
      const missedTarget = missed.filter(r => scope.a.includes(r.status)).length;
      const resultDone = overlap.length ? null : rate(doneTarget, done.length);
      const resultMissed = overlap.length ? null : rate(missedTarget, missed.length);
      return { ...rule, eligible: eligible.length, done: done.length, missed: missed.length, completion: rate(done.length, eligible.length), qualified: rule.source === '已有 SOP' ? rate(done.filter(r => r.actions[rule.id].qualified).length, eligible.length) : null, a, b, doneTarget, missedTarget, resultDone, resultMissed, delta: resultDone === null || resultMissed === null ? null : Math.round((resultDone - resultMissed) * 10) / 10, sufficient: done.length >= 10 && missed.length >= 10 && !errors.length };
    });
    return { scope, errors, records: filtered, aCount: groupA.length, bCount: groupB.length, summaries };
  }
  function evidence(result, actionId, group = 'all', completion = 'all') {
    return result.records.filter(r => r.actions[actionId]?.eligible && (group === 'all' || result.scope[group]?.includes(r.status)) && (completion === 'all' || r.actions[actionId].complete === (completion === 'done')));
  }
  function key(input) {
    const s = normalizeScope(input);
    return JSON.stringify({ ...s, scenes: [...s.scenes].sort(), a: [...s.a].sort(), b: [...s.b].sort() });
  }
  function draft(result, decisions, owner, reviewDate) {
    if (result.errors.length) throw new Error(result.errors.join(' '));
    if (!owner.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate) || Number.isNaN(Date.parse(reviewDate)) || new Date(reviewDate).toISOString().slice(0, 10) !== reviewDate) throw new Error('请填写负责人和有效的复盘日期。');
    const accepted = result.summaries.filter(r => decisions[r.id]?.status === '已采纳');
    if (!accepted.length) throw new Error('请先复核证据并采纳至少一个动作。');
    for (const rule of accepted) {
      const reviewed = decisions[rule.id].evidenceIds;
      const validIds = new Set(evidence(result, rule.id).map(row => row.id));
      if (!Array.isArray(reviewed) || !reviewed.length || reviewed.some(id => !validIds.has(id))) throw new Error('已采纳动作缺少当前范围内的有效复核证据，请重新复核。');
    }
    const s = result.scope;
    const pct = value => value === null ? '暂无样本' : value.toFixed(1) + '%';
    return `# 销售策略草稿（演示）\n\n范围：${s.brand} / ${s.org} / ${s.model === 'all' ? '全部车型' : s.model} / ${s.stage === 'online' ? '邀约' : '到店'}场景\n观察期结束日期：${s.start} 至 ${s.end}；观察期 ${s.windowDays} 天\nA 组：${s.a.join('、')}（${result.aCount} 人）；B 组：${s.b.join('、')}（${result.bCount} 人）\n负责人：${owner.trim()}\n复盘日期：${reviewDate}\n\n${accepted.map((r, i) => `${i + 1}. ${r.source === '已有 SOP' ? '强化执行' : '小范围验证'}：${r.name}\n触发条件：${r.trigger}\n执行要求：${r.training}\n分析依据：A/B 完成率 ${pct(r.a.rate)} / ${pct(r.b.rate)}；完成/未完成动作的 A 组结果率 ${pct(r.resultDone)} / ${pct(r.resultMissed)}\n样本：完成 ${r.done} 人，未完成 ${r.missed} 人\n已复核证据：${decisions[r.id].evidenceIds.join('、')}\n复盘指标：动作完成率${r.source === '已有 SOP' ? '、SOP 合格率' : ''}、同口径 A 组结果率；核查不同门店与客户条件的差异\n管理备注：${decisions[r.id].note || '无'}\n${r.sufficient ? '结论：建议先试点，暂不作为因果结论。' : '结论：样本不足，仅作探索性试点，不推广为统一标准。'}`).join('\n\n')}\n\n所有数据与对话均为演示样本；关联不代表因果。草稿由管理人员审核，不自动写入 SOP、下发培训或触达客户。\n`;
  }
  return { cutoff, statuses, models, regions, scenes, sceneLabels, rules, shift, rate, defaultScope, normalizeScope, query, evidence, key, draft, sampleRecords: records };
});
