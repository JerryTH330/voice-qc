(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.InsightScopeFilters = factory(root.FactoryOrganizationFilter);
})(typeof window === 'object' ? window : this, function (shared) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalize = value => String(value).toLowerCase().replace(/\s/g, '');
  function create(M, scope) {
    const records = M.organizationRecords();
    const model = shared.createModel(records, [
      { key: 'scene', label: '业务场景', options: M.scenes[scope.stage].map(value => ({ value, label: M.sceneLabels[value] })) },
      { key: 'model', label: '车系', options: selections => Object.entries(M.models).filter(([brand]) => !selections.brand.length || selections.brand.includes(brand)).flatMap(([brand, models]) => models.map(value => ({ value, label: value, meta: brand }))) }
    ]);
    model.setDimension(scope.organizationDimension === 'geography' ? 'geography' : 'organization');
    const initial = scope.filters || { brand: [scope.brand], region: scope.org === '全国' ? [] : [scope.org], model: scope.model === 'all' ? [] : [scope.model] };
    ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor', 'store', 'scene', 'model'].forEach(key => model.set(key, initial[key] || []));
    const descendants = { brand: ['region', 'zone', 'province', 'city', 'patroler', 'governor', 'store', 'model'], region: ['zone', 'store'], zone: ['store'], province: ['city', 'store'], city: ['store'], patroler: ['store'], governor: ['store'] };
    function choose(key, values) {
      // Clear descendants before applying a parent, even when labels happen to match across brands.
      (descendants[key] || []).forEach(child => model.set(child, []));
      model.set(key, values);
      const parents = key === 'store' ? model.primary().filter(field => field !== 'store') : key === 'zone' ? ['brand', 'region'] : key === 'city' ? ['brand', 'province'] : key === 'region' || key === 'province' ? ['brand'] : [];
      if (!parents.length || !model.selections[key].length) return;
      const value = (record, field) => field === 'region' ? record.dealer.area : field === 'store' ? `${record.dealer.brand}::${record.dealer.dealerCode}` : record.dealer[field];
      const selectedRecords = records.filter(record => model.selections[key].includes(value(record, key)) && (!model.selections.brand.length || model.selections.brand.includes(record.dealer.brand)));
      parents.forEach(parent => model.set(parent, [...new Set(selectedRecords.map(record => value(record, parent)))]));
    }
    function snapshot() {
      const filters = Object.fromEntries(Object.entries(model.selections).map(([key, values]) => [key, [...values]]));
      return { filters, organizationDimension: model.dimension, brand: model.single('brand') === 'all' ? scope.brand : model.single('brand'),
        org: model.single('region') === 'all' ? '全国' : model.single('region'), model: model.single('model'),
        scenes: filters.scene.length ? filters.scene.slice() : M.scenes[scope.stage].slice() };
    }
    return Object.assign(model, { choose, snapshot });
  }
  function visibleOptions(model, key, query) {
    return model.options(key).map(item => ['store', 'patroler', 'governor'].includes(key) ? { ...item, meta: [item.value.split('::')[0], item.meta].filter(Boolean).join(' · ') } : item)
      .filter(item => normalize(item.label + item.meta).includes(normalize(query)));
  }
  function menu(model, key, query) {
    const items = visibleOptions(model, key, query), selected = model.selections[key];
    const all = items.length > 0 && items.every(item => selected.includes(item.value));
    const partial = !all && items.some(item => selected.includes(item.value));
    const option = item => `<button type="button" class="badge-advisor-option${selected.includes(item.value) ? ' is-selected' : ''}" role="option" aria-selected="${selected.includes(item.value)}" data-scope-option="${esc(item.value)}"><span class="badge-advisor-option-check" aria-hidden="true">${selected.includes(item.value) ? '✓' : ''}</span><span class="badge-advisor-option-copy"><strong>${esc(item.label)}</strong>${item.meta ? `<small>${esc(item.meta)}</small>` : ''}</span></button>`;
    const content = key === 'model' ? model.options('brand').map(item => item.value).map(brand => {
      const group = items.filter(item => item.meta === brand);
      return group.length ? `<div class="ci-filter-group"><div class="ci-filter-group-label">${esc(brand)}</div>${group.map(option).join('')}</div>` : '';
    }).join('') : items.map(option).join('');
    return `<label class="badge-advisor-search"><span aria-hidden="true"></span><input type="search" data-scope-search aria-label="搜索${model.labels[key]}" placeholder="${key === 'store' ? '输入店名或店代码' : '搜索' + model.labels[key]}" value="${esc(query)}"></label><button type="button" class="badge-advisor-select-all${all ? ' is-selected' : partial ? ' is-partial' : ''}" data-scope-all aria-pressed="${all}" ${items.length ? '' : 'disabled'}><span class="badge-advisor-option-check" aria-hidden="true">${all ? '✓' : ''}</span>全选<small>共 ${items.length} 条数据</small></button><div class="badge-advisor-options" role="listbox" aria-label="${model.labels[key]}" aria-multiselectable="true">${content || '<p class="badge-advisor-empty">未找到匹配数据</p>'}</div>`;
  }
  function control(model, key, open, query) {
    const active = open === key, selected = model.selections[key];
    return `<div class="badge-field-filter badge-field-filter-select ci-select${active ? ' is-open' : ''}" data-scope-control="${key}"><span>${model.labels[key]}</span><button type="button" class="session-select-trigger" data-scope-trigger="${key}" aria-label="${model.labels[key]}：${esc(model.display(key))}" aria-haspopup="dialog" aria-controls="scope-${key}-menu" aria-expanded="${active}"><strong class="${selected.length ? '' : 'is-placeholder'}" title="${esc(model.display(key))}">${esc(model.display(key))}</strong><i class="session-select-caret" aria-hidden="true"></i></button><div class="session-menu-panel badge-advisor-menu ci-scope-menu" id="scope-${key}-menu" role="dialog" aria-label="选择${model.labels[key]}" ${active ? '' : 'hidden'}>${active ? menu(model, key, query) : ''}</div></div>`;
  }
  function summary(model) {
    return [...model.primary(), 'patroler', 'governor', 'model'].filter(key => model.selections[key].length).map(key => `${model.labels[key]}：${model.display(key)}`).join(' · ') || '全部品牌 · 全部门店 · 全部车系';
  }
  return { create, control, menu, visibleOptions, summary };
});
