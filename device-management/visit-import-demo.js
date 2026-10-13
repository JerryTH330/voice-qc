(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./visit-organization-filter.js') : root.VisitOrganizationFilter);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VisitImportDemo = api;
})(typeof window === 'undefined' ? globalThis : window, function (organizationFilters) {
  'use strict';
  const templateKeys = Object.freeze(['storeCode', 'store', 'advisor', 'customerName', 'customerPhone', 'scene', 'carSeries', 'date', 'startTime', 'endTime']);

  function matchStore(record, directory) {
    const code = String(record.storeCode ?? '').trim();
    const name = String(record.store ?? '').trim();
    const byCode = directory.filter(dealer => String(dealer.dealerCode).trim() === code);
    if (!byCode.length) return { record, reasons: ['门店编码未找到对应门店'] };
    const matches = byCode.filter(dealer => String(dealer.dealerName).trim() === name);
    if (!matches.length) return { record, reasons: ['门店编码与所属门店不一致'] };
    if (matches.length !== 1) return { record, reasons: ['门店编码及名称对应多个门店，无法唯一匹配'] };
    return { record: { ...record, ...organizationFilters.organizationRecord(matches[0]) }, reasons: [] };
  }

  function createResult(filename, visits, directory = []) {
    const rows = visits.slice(0, 20).map(record => ({ ...Object.fromEntries(templateKeys.map(key => [key, record[key] ?? ''])), source: '模板导入' }));
    const rowReasons = new Map();
    if (filename.includes('失败演示')) {
      const examples = [
        { index: 1, changes: { storeCode: 'DEMO-不存在' }, reasons: ['门店编码未找到对应门店'] },
        { index: 6, changes: { advisor: '' }, reasons: ['顾问姓名不能为空'] },
        { index: 13, changes: { date: '2026-13-32', endTime: '08:00:00' }, reasons: ['到访日期格式不正确', '结束时间必须晚于开始时间'] }
      ];
      examples.forEach(({ index, changes, reasons }) => {
        if (!rows[index]) return;
        Object.assign(rows[index], changes);
        rowReasons.set(index, reasons);
      });
    }
    if (directory.length) rows.forEach((record, index) => {
      const match = matchStore(record, directory);
      rows[index] = match.record;
      if (match.reasons.length) rowReasons.set(index, [...new Set([...(rowReasons.get(index) || []), ...match.reasons])]);
    });
    const failures = [...rowReasons].sort(([left], [right]) => left - right).map(([index, reasons]) => ({ rowNumber: index + 2, record: rows[index], reasons }));
    return { total: rows.length, rows, failures, imported: failures.length ? 0 : rows.length };
  }

  function templateColumns(fields) {
    return templateKeys.map(key => fields.find(field => field.key === key)).map(field => ({
      key: field.key, label: field.key === 'storeCode' ? '门店编码' : field.label,
      width: field.key === 'store' ? 22 : 18
    }));
  }

  function recordValues(record, columns) {
    return columns.map(column => column.key === 'detail' ? record.detailText || '' : record[column.key] ?? '');
  }

  function failureWorkbook(result, fields) {
    const columns = templateColumns(fields);
    return {
      sheetName: '失败明细',
      columns: [...columns, { label: 'Excel 行号', width: 14 }, { label: '失败原因', width: 50 }],
      rows: result.failures.map(failure => [...recordValues(failure.record, columns), failure.rowNumber, failure.reasons.join('；')])
    };
  }

  return Object.freeze({ matchStore, createResult, templateColumns, recordValues, failureWorkbook });
});
