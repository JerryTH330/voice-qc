(function (host) {
  'use strict';

  // Use the exact organization and business components mounted by shared/unified-dashboard.js.
  // Only translate their stable IDs into the insight demo's record fields.
  function mount({ root, businessRoot, pathAction, M, getScope, onChange, onReset, onBeforeOpen }) {
    const dealers = M.organizationRecords().map(({ dealer }) => ({ ...dealer, dealerWid: `${dealer.brand}::${dealer.dealerCode}` }));
    const { createModel, fields, selectionId } = host.VisitOrganizationFilter;
    const model = createModel(dealers, [], { mode: 'matching' });
    let ui, business, scenes = [], models = [];
    const sceneOptions = Object.entries(M.sceneLabels).map(([value, label]) => ({ value, label }));
    const sceneValues = new Set(sceneOptions.map(option => option.value));
    const modelOptions = () => {
      const brands = model.applied.brand.map(id => model.directory.find(row => row.brandId === id)?.brand);
      return Object.entries(M.models).filter(([brand]) => !brands.length || brands.includes(brand))
        .flatMap(([brand, values]) => values.map(value => ({ value, label: value, meta: brand })));
    };
    function snapshot() {
      const scope = getScope(), filters = {};
      for (const [key, field] of Object.entries(fields)) {
        if (key === 'advisor') continue;
        filters[key] = [...new Set(model.applied[key].map(id => {
          if (['store', 'patroler', 'governor'].includes(key)) return id;
          return model.directory.find(row => selectionId(row, key) === id)?.[field.nameKey];
        }).filter(Boolean))];
      }
      filters.scene = scenes.slice();
      filters.model = models.slice();
      // Region and zone IDs contain their brand. Preserve their exact intersection,
      // including an empty intersection, when mapping back to readable demo fields.
      filters.organizationStores = model.directory.filter(model.matches).map(row => row.storeId);
      return { filters, nativeOrganization: JSON.parse(JSON.stringify(model.applied)), organizationDimension: model.applied.dimensionMode,
        brand: filters.brand.length === 1 ? filters.brand[0] : scope.brand,
        org: filters.region.length === 1 ? filters.region[0] : '全国', model: models.length === 1 ? models[0] : 'all',
        scenes: scenes.length ? scenes.filter(value => M.scenes[scope.stage].includes(value)) : M.scenes[scope.stage].slice() };
    }
    function restore(scope) {
      const filters = scope.filters || { brand: [scope.brand], region: scope.org === '全国' ? [] : [scope.org], model: scope.model === 'all' ? [] : [scope.model] };
      model.reset();
      model.setDimension(scope.organizationDimension || 'organization');
      for (const key of ['brand', 'region', 'zone', 'province', 'city', 'store', 'patroler', 'governor']) {
        const field = fields[key];
        const ids = scope.nativeOrganization?.[key] || model.directory.filter(row => (filters[key] || []).includes(
          ['store', 'patroler', 'governor'].includes(key) ? row[field.idKey] : row[field.nameKey]
        )).map(row => selectionId(row, key));
        model.set(key, ids);
      }
      model.apply();
      scenes = (filters.scene || []).filter(value => sceneValues.has(value));
      const available = new Set(modelOptions().map(option => option.value));
      models = (filters.model || []).filter(value => available.has(value));
    }
    function mountBusiness() {
      business?.destroy();
      business = host.StoreDashboardBusinessFilters.mount({ root: businessRoot,
        sceneOptions, modelOptions,
        getSelection: key => key === 'scene' ? scenes : models,
        onBeforeOpen: () => { ui?.closeMenu(); onBeforeOpen(); },
        onChange: (key, values) => { if (key === 'scene') scenes = values; else models = values; onChange(snapshot()); }
      });
    }
    restore(getScope());
    ui = host.StoreDashboardOrganizationFilter.mount({ root, model, businessFilters: businessRoot, pathAction,
      onBeforeChange: () => { business?.closeMenu(); onBeforeOpen(); },
      onReset: () => { scenes = []; models = []; onReset(); },
      onChange: event => {
        if (event.reset) return;
        const available = new Set(modelOptions().map(option => option.value));
        models = models.filter(value => available.has(value));
        business?.render();
        onChange(snapshot());
      }
    });
    mountBusiness();
    function sync(scope) {
      restore(scope);
      ui.render({ preserveScroll: true });
      business.render();
    }
    function summary() {
      const selected = [...model.dimensionKeys(), 'patroler', 'governor']
        .filter(key => model.applied[key].length)
        .map(key => `${fields[key].label}：${model.display(key, model.applied)}`);
      if (models.length) selected.push(`车系：${models.join('、')}`);
      return selected.join(' · ') || '全部品牌 · 全部门店 · 全部车系';
    }
    return { sync, snapshot, summary, model,
      closeMenu() { ui.closeMenu(); business.closeMenu(); },
      destroy() { ui.destroy(); business.destroy(); }
    };
  }
  host.InsightFactoryFilters = { mount };
})(window);
