(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../device-management/visit-organization-filter.js'));
  } else {
    root.StoreDashboardDemoData = factory(root.VisitOrganizationFilter);
  }
})(typeof window === 'undefined' ? globalThis : window, function (organizationFilter) {
  'use strict';

  const countKeys = ['invitation', 'reception', 'test_drive', 'valid_record'];
  const clone = (value) => Array.isArray(value) ? value.map(clone)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
      : value;
  const count = (value) => Math.max(0, Number(value) || 0);
  const ratio = (numerator, denominator) => denominator > 0 ? numerator * 100 / denominator : null;
  const percent = (value) => value === null ? '—' : `${Math.round(value)}%`;
  const templateIdOf = (person) => String(person.templateId || person.id || '');
  const hash = (value) => {
    let result = 2166136261;
    for (const letter of String(value)) result = Math.imul(result ^ letter.charCodeAt(0), 16777619) >>> 0;
    return result;
  };
  const demoStorePrefix = (store) => `DEMO-STORE-${encodeURIComponent(store.storeId)}`;
  const orgPath = (store) => `${store.brand} > ${store.region} > ${store.zone} > ${store.store}`;

  function selectStores(dealers, limit) {
    const records = new Map();
    dealers.forEach((dealer) => {
      if (!dealer.dealerName || !dealer.brand) return;
      const record = { ...clone(dealer), ...organizationFilter.organizationRecord(dealer) };
      if (record.storeId && !records.has(record.storeId)) records.set(record.storeId, record);
    });
    const pool = [...records.values()];
    const selected = [];
    const seen = new Set();
    const dimensions = [['brandId', 12], ['regionId', 7], ['provinceId', 6], ['zoneId', 3], ['cityId', 1]];
    while (pool.length && selected.length < limit) {
      let nextIndex = 0;
      let bestScore = -1;
      pool.forEach((record, index) => {
        const score = dimensions.reduce((sum, [key, weight]) => sum + (seen.has(`${key}:${record[key]}`) ? 0 : weight), 0);
        if (score > bestScore) { bestScore = score; nextIndex = index; }
      });
      const [record] = pool.splice(nextIndex, 1);
      selected.push(record);
      dimensions.forEach(([key]) => seen.add(`${key}:${record[key]}`));
    }
    return selected;
  }

  function createDataset({ dealers = [], advisorTemplates = [], clientTemplates = [], limit = 50 } = {}) {
    const stores = selectStores(dealers, Math.max(0, Math.floor(Number(limit) || 0)));
    const advisors = [];
    const clients = [];
    stores.forEach((store) => {
      const prefix = demoStorePrefix(store);
      const storeAdvisors = advisorTemplates.map((template, templateIndex) => {
        const templateId = templateIdOf(template);
        const id = `${prefix}-ADVISOR-${String(templateIndex + 1).padStart(2, '0')}`;
        const seed = hash(id);
        const scale = 0.72 + seed % 64 / 100;
        const counters = Object.fromEntries(countKeys.map((key, keyIndex) => [key,
          count(template[key]) > 0 ? Math.max(1, Math.round(count(template[key]) * scale) + (seed >>> (keyIndex * 3)) % 3) : 0
        ]));
        const total = counters.invitation + counters.reception + counters.test_drive;
        counters.valid_record = Math.min(total, counters.valid_record);
        const hitCount = Math.min(counters.valid_record, Math.round(counters.valid_record * count(parseFloat(template.hit_rate)) / 100));
        const qaPassCount = Math.min(counters.valid_record, Math.round(counters.valid_record * count(parseFloat(template.qa_pass)) / 100));
        const riskCount = Math.min(counters.valid_record, Math.round(counters.valid_record * (template.danger ? 0.18 : seed % 5 / 100)));
        const durationMinutes = counters.valid_record * (8 + seed % 71 / 10);
        return {
          ...clone(template), ...clone(store), ...counters,
          id, advisorId: id, advisorKey: id, advisor: template.name, name: template.name,
          templateId, templateName: template.name, isDemo: true, orgPath: orgPath(store),
          hitCount, qaPassCount, riskCount, durationMinutes,
          hit_rate: percent(ratio(hitCount, counters.valid_record)),
          qa_pass: percent(ratio(qaPassCount, counters.valid_record)),
          rec_pass_rate: percent(ratio(counters.valid_record, total)),
          danger: riskCount > 0
        };
      });
      advisors.push(...storeAdvisors);
      clientTemplates.forEach((template, templateIndex) => {
        const explicitId = String(template.advisorTemplateId || template.advisorId || '');
        const matches = storeAdvisors.filter((advisor) => explicitId
          ? advisor.templateId === explicitId
          : advisor.name === template.advisor && (!template.advisor_role || advisor.role === template.advisor_role));
        if (matches.length !== 1) return;
        const [advisor] = matches;
        clients.push({
          ...clone(template), ...clone(store),
          id: `${prefix}-CLIENT-${String(templateIndex + 1).padStart(2, '0')}`,
          templateId: String(template.id || ''), templateName: template.customer_name || '',
          advisor: advisor.name, advisor_role: advisor.role, advisorKey: advisor.advisorKey, advisorId: advisor.advisorId,
          advisorTemplateId: advisor.templateId, isDemo: true, orgPath: orgPath(store)
        });
      });
    });
    return { stores, advisors, clients };
  }

  function summarize(advisors) {
    const sum = (key) => advisors.reduce((total, advisor) => total + count(advisor[key]), 0);
    const totals = Object.fromEntries(countKeys.map((key) => [key, sum(key)]));
    const qaPassCount = sum('qaPassCount');
    const riskCount = sum('riskCount');
    const totalRecord = totals.invitation + totals.reception + totals.test_drive;
    return {
      ...totals,
      hit_rate: ratio(sum('hitCount'), totals.valid_record),
      cover_rate: ratio(totals.valid_record, totalRecord),
      avg_duration: totals.valid_record > 0 ? sum('durationMinutes') / totals.valid_record : null,
      qa_pass_count: qaPassCount,
      qa_pass_rate: ratio(qaPassCount, totals.valid_record),
      risk_record: riskCount,
      risk_rate: ratio(riskCount, totals.valid_record)
    };
  }

  function expandRule(rule, scopedAdvisors) {
    const sourcePeople = (Array.isArray(rule.people) ? rule.people : []).filter((person) => person && typeof person === 'object' && templateIdOf(person));
    const people = [];
    const recordings = [];
    scopedAdvisors.forEach((advisor) => {
      const sourcePerson = sourcePeople.find((person) => templateIdOf(person) === advisor.templateId
        && (!person.name || person.name === advisor.templateName));
      if (!sourcePerson) return;
      const person = {
        ...clone(sourcePerson), ...clone(advisor),
        ...Object.fromEntries(['sampleCount', 'hitCount', 'rate', 'sceneStats'].filter((key) => key in sourcePerson).map((key) => [key, clone(sourcePerson[key])])),
        templateId: advisor.templateId
      };
      people.push(person);
      (Array.isArray(rule.recordings) ? rule.recordings : []).forEach((recording, recordingIndex) => {
        const explicitId = String(recording.advisorTemplateId || recording.advisorId || recording.advisorKey || '');
        const matchingPeople = sourcePeople.filter((candidate) => explicitId
          ? templateIdOf(candidate) === explicitId
          : candidate.name === recording.advisor);
        if (matchingPeople.length !== 1 || templateIdOf(matchingPeople[0]) !== advisor.templateId) return;
        recordings.push({
          ...clone(recording), ...Object.fromEntries(Object.keys(organizationFilter.fields).flatMap((key) => {
            const field = organizationFilter.fields[key];
            return [[field.idKey, advisor[field.idKey]], [field.nameKey, advisor[field.nameKey]]];
          })),
          id: `${advisor.advisorId}-RULE-${encodeURIComponent(String(rule.id || rule.title || 'rule'))}-RECORD-${recordingIndex + 1}`,
          templateId: String(recording.id || ''), templateName: recording.customer || '',
          advisorId: advisor.advisorId, advisorKey: advisor.advisorKey, advisor: advisor.name,
          storeCode: advisor.storeCode, orgPath: advisor.orgPath, isDemo: true
        });
      });
    });
    const hitCount = people.reduce((total, person) => total + count(person.hitCount), 0);
    const sampleCount = people.reduce((total, person) => total + count(person.sampleCount), 0);
    return {
      ...clone(rule), people, recordings, advisor_count: people.length,
      hit_count: hitCount, sample_count: sampleCount, hit_ratio: percent(ratio(hitCount, sampleCount)), isDemo: true
    };
  }

  return { createDataset, summarize, expandRule };
});
