(function (host, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else host.InsightReportModel = factory(host.InsightSimpleModel);
})(typeof window === 'object' ? window : this, function (M) {
  'use strict';
  function snapshot(result, scopeText) {
    const signals = M.distribution(result, 'resistance').slice(0, 5).map(row => ({ name: row.name, count: row.count, denominator: row.denominator, share: row.share }));
    const actions = M.actions(result).map(row => ({ name: row.name, count: row.count, done: row.done, completion: row.completion, qualified: row.qualified }));
    return JSON.parse(JSON.stringify({ version: 1, scope: result.scope, scopeText, compare: result.compare, statusAsOf: result.statusAsOf,
      template: M.templates[result.scope.template].label, reference: result.compare ? M.templates[result.scope.comparisonTemplate].label : '',
      coverage: result.coverage, matureCount: result.matureCount, immatureCount: result.immatureCount, unknownVisitCount: result.unknownVisitCount,
      overlapCount: result.overlapCount, aCount: result.a.length, bCount: result.b.length, signals, actions,
      leads: result.records.slice(0, 8).map(record => ({ id: record.leadId, ageDays: record.ageDays, state: record.analysisState })) }));
  }
  function compose(data) {
    if (data.version !== 1 || !data.coverage || !Array.isArray(data.signals) || !Array.isArray(data.actions)) throw new Error('报告快照不完整，请重新提交。');
    const rate = (n, d) => d ? (n * 100 / d).toFixed(1) + '%' : '—';
    const weakest = data.actions.filter(row => row.count > 0 && row.completion !== null).sort((a, b) => a.completion - b.completion)[0];
    const focus = data.signals[0];
    const summary = `本次${data.template}${data.reference ? '与' + data.reference + '对比' : '人群'}共${data.coverage.total}条去重线索，其中${data.coverage.ready}条有可分析结果，覆盖率${rate(data.coverage.ready, data.coverage.total)}。`;
    const recommendations = [];
    if (data.coverage.no_recording) recommendations.push(`先核实${data.coverage.no_recording}条无录音线索的实际跟进情况，不能从无录音推断销售未执行。`);
    if (data.coverage.failed) recommendations.push(`核实${data.coverage.failed}条分析失败线索的失败原因，补齐结果后复核结论。`);
    if (data.coverage.no_scene) recommendations.push(`另有${data.coverage.no_scene}条线索无所选场景的可分析结果，可扩大业务场景查看。`);
    if (focus) recommendations.push(`优先抽听“${focus.name}”对应的客户原声（${focus.count}/${focus.denominator}条），确认具体顾虑后再制定跟进策略。`);
    if (weakest) recommendations.push(`抽查“${weakest.name}”的未完成证据（完成${weakest.done}/${weakest.count}条），核实后安排针对性辅导。`);
    if (!data.coverage.ready) recommendations.push('当前没有可分析语音结果，暂不输出客户顾虑或销售执行结论。');
    return { title: `${data.template}线索分析报告`, summary, recommendations,
      sections: ['分析范围', '人群与AI覆盖', '客户顾虑', '销售动作', '建议与验证', '统计口径'],
      limitation: '演示报告按固定模板和已有汇总结果生成，尚未调用真实AI服务。关联差异不代表因果；报告不推算7日到店率或历史转化率。' };
  }
  function newTask(data, now = new Date().toISOString(), id = 'report-' + Date.now().toString(36)) {
    return { id, status: 'queued', createdAt: now, snapshot: JSON.parse(JSON.stringify(data)), report: null, error: '', attempt: 1 };
  }
  function advance(task, now = new Date().toISOString()) {
    if (task.status === 'queued') return { ...task, status: 'running', startedAt: now };
    if (task.status !== 'running') return task;
    try { return { ...task, status: 'succeeded', finishedAt: now, report: compose(task.snapshot), error: '' }; }
    catch (error) { return { ...task, status: 'failed', finishedAt: now, error: error.message }; }
  }
  function retry(task) { return task.status === 'failed' ? { ...task, status: 'queued', error: '', report: null, attempt: (task.attempt || 1) + 1 } : task; }
  return { snapshot, compose, newTask, advance, retry };
});
