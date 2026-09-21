(function (global) {
  'use strict';
  const labels = { brand: '品牌', region: '大区', zone: '战区', province: '省份', city: '城市', store: '门店', patroler: '巡回员', governor: '治理员', advisor: '顾问' };
  const dependencies = {
    brand: [], region: ['brand'], zone: ['brand', 'region'], province: ['brand'], city: ['brand', 'province'],
    patroler: ['brand'], governor: ['brand'],
    store: ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor'],
    advisor: ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor', 'store']
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value).toLowerCase().replace(/\s/g, '');
  function leadSeriesOptions(data, brands = []) {
    const decode = value => String(value || '未知').replace(/&nbsp;/gi, ' ').replace(/&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() || '未知';
    return ['传祺', '埃安'].filter(brand => !brands.length || brands.includes(brand)).flatMap(brand => {
      const series = new Set((data?.rows || []).filter(row => Number(row[3]) === 1 && data.dealerKeys?.[row[5]]?.[0] === brand).map(row => decode(data.series?.[row[13]])).filter(value => value !== '—'));
      return [...series].sort((a, b) => a.localeCompare(b, 'zh-CN')).map(label => ({ value: brand + '::' + label, label, meta: brand }));
    });
  }
  function createModel(records, fields = []) {
    const fieldMap = new Map(fields.map(field => [field.key, field]));
    const fieldLabels = { ...labels, ...Object.fromEntries(fields.map(field => [field.key, field.label])) };
    const selections = Object.fromEntries(Object.keys(fieldLabels).map(key => [key, [...(fieldMap.get(key)?.initialValues || [])]]));
    let dimension = 'organization';
    const value = (record, key) => {
      const dealer = record.dealer;
      if (key === 'region') return dealer.area;
      if (key === 'store') return dealer.brand + '::' + dealer.dealerCode;
      if (key === 'advisor') return record.advisorId;
      if (key === 'patroler' || key === 'governor') return dealer[key + 'Id'] || (dealer[key] ? dealer.brand + '::' + key + '::' + dealer[key] : '');
      return dealer[key] || '';
    };
    const label = (record, key) => key === 'store' ? record.dealer.dealerName : key === 'advisor' ? record.advisorName : (key === 'patroler' || key === 'governor') ? record.dealer[key] : value(record, key);
    const matchesKeys = (record, keys) => keys.every(key => !selections[key].length || selections[key].includes(value(record, key)));
    const optionCache = new Map();
    const options = key => {
      if (fieldMap.has(key)) {
        const source = fieldMap.get(key).options;
        return (typeof source === 'function' ? source(selections) : source).map(item => ({ meta: '', ...item }));
      }
      const signature = JSON.stringify(dependencies[key].map(parent => selections[parent]));
      const cached = optionCache.get(key);
      if (cached?.signature === signature) return cached.items;
      const found = new Map();
      records.forEach(record => {
        const id = value(record, key);
        if (!id || found.has(id) || !matchesKeys(record, dependencies[key])) return;
        const meta = key === 'store' ? record.dealer.dealerCode : key === 'advisor' ? record.dealer.dealerName : '';
        found.set(id, { value: id, label: label(record, key), meta });
      });
      const items = [...found.values()].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN', { numeric: true }));
      optionCache.set(key, { signature, items });
      return items;
    };
    const reconcile = () => {
      ['brand', 'region', 'zone', 'province', 'city', 'patroler', 'governor', 'store', 'advisor', ...fields.filter(field => typeof field.options === 'function').map(field => field.key)].forEach(key => {
        const allowed = new Set(options(key).map(item => item.value));
        selections[key] = selections[key].filter(id => allowed.has(id));
      });
    };
    const display = key => {
      const selected = selections[key];
      const all = options(key);
      const names = selected.map(id => all.find(item => item.value === id)?.label || id);
      return names.length ? (names.length <= 2 ? names.join('、') : names[0] + '等 ' + names.length + ' 项') : '请选择' + fieldLabels[key];
    };
    const primary = () => dimension === 'organization' ? ['brand', 'region', 'zone', 'store'] : ['brand', 'province', 'city', 'store'];
    return {
      selections, options, display, primary, labels: fieldLabels,
      get dimension() { return dimension; },
      setDimension(next) {
        if (next === dimension) return;
        dimension = next;
        ['region', 'zone', 'province', 'city', 'store'].forEach(key => { selections[key] = []; });
        reconcile();
      },
      set(key, values) {
        const allowed = new Set(options(key).map(item => item.value));
        selections[key] = [...new Set(values)].filter(value => allowed.has(value));
        reconcile();
      },
      reset() { Object.keys(selections).forEach(key => { selections[key] = []; }); },
      matches: record => matchesKeys(record, Object.keys(labels)),
      single: key => selections[key].length === 1 ? selections[key][0] : 'all',
      singleLabel: key => selections[key].length === 1 ? display(key) : 'all',
      summary: () => primary().map(key => selections[key].length ? display(key) : '全部' + labels[key]).join(' / ')
    };
  }
  function mount({ root, records, onChange, fields = [], renderTrailing = () => '', onRender = () => {} }) {
    const model = createModel(records, fields);
    const labels = model.labels;
    let open = '', query = '', collapsed = true;
    const visibleOptions = key => model.options(key).filter(item => normalize(item.label + item.meta).includes(normalize(query)));
    const renderMenu = key => {
      const items = visibleOptions(key), selected = model.selections[key];
      const all = items.length > 0 && items.every(item => selected.includes(item.value));
      const partial = !all && selected.some(id => items.some(item => item.value === id));
      const renderOption = item => `<button type="button" class="fo-option${selected.includes(item.value) ? ' is-selected' : ''}" role="option" aria-selected="${selected.includes(item.value)}" data-fo-option="${escape(item.value)}"><span class="fo-check ${selected.includes(item.value) ? 'selected' : ''}">${selected.includes(item.value) ? '✓' : ''}</span><span class="fo-option-copy"><strong>${escape(item.label)}</strong>${item.meta ? `<small>${escape(item.meta)}</small>` : ''}</span></button>`;
      const optionMarkup = fields.find(field => field.key === key)?.groupByBrand
        ? ['传祺', '埃安'].map(brand => { const group = items.filter(item => item.meta === brand); return group.length ? `<div class="fo-menu-group"><div class="fo-menu-group-label">${brand}</div>${group.map(renderOption).join('')}</div>` : ''; }).join('')
        : items.map(renderOption).join('');
      return `<div class="session-menu-panel fo-menu" role="dialog" aria-label="选择${labels[key]}"><label class="fo-search"><span aria-hidden="true"></span><input type="search" data-fo-search aria-label="搜索${labels[key]}" placeholder="${key === 'store' ? '输入店名或店代码' : '搜索' + labels[key]}" value="${escape(query)}"></label><button type="button" class="fo-all${all ? ' is-selected' : partial ? ' is-partial' : ''}" data-fo-all ${items.length ? '' : 'disabled'} aria-pressed="${all}"><span class="fo-check ${all ? 'selected' : ''}">${all ? '✓' : ''}</span>全选<small>共 ${items.length} 条数据</small></button><div class="fo-options" role="listbox" aria-label="${labels[key]}" aria-multiselectable="true">${optionMarkup || '<p class="fo-empty">未找到匹配数据</p>'}</div></div>`;
    };
    const control = key => `<div class="fo-control ${open === key ? 'is-open' : ''}" data-fo-control="${key}"><span>${labels[key]}</span><button type="button" class="session-select-trigger" data-fo-trigger="${key}" aria-label="${labels[key]}" aria-expanded="${open === key}"><strong class="${model.selections[key].length ? '' : 'is-placeholder'}">${escape(model.display(key))}</strong><i class="session-select-caret" aria-hidden="true"></i></button>${open === key ? renderMenu(key) : ''}</div>`;
    const renderActions = () => `<div class="fo-actions"><span></span><div><button type="button" class="btn session-reset-btn" data-fo-reset>重置</button><button type="button" class="session-toggle-text-btn" data-fo-collapse aria-expanded="${!collapsed}"><span>${collapsed ? '展开' : '收起'}</span><svg class="session-toggle-text-btn-icon${collapsed ? ' is-collapsed' : ''}" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5 8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div>`;
    const settleExtra = extra => {
      if (!extra) return;
      extra.style.height = collapsed ? '0px' : '';
      extra.style.overflow = collapsed ? 'clip' : '';
      extra.style.pointerEvents = collapsed ? 'none' : '';
      extra.setAttribute('aria-hidden', String(collapsed));
      if (collapsed) extra.setAttribute('inert', '');
      else extra.removeAttribute('inert');
    };
    const render = () => {
      const previousExtra = root.querySelector('[data-fo-extra]');
      const previousHeight = previousExtra ? previousExtra.getBoundingClientRect().height : 0;
      const collapseChanged = root.childElementCount > 0 && root.classList.contains('is-collapsed') !== collapsed;
      if (root._foCollapseAnimation) {
        root._foCollapseAnimation.cancel();
        root._foCollapseAnimation = null;
      }
      root.classList.add('factory-organization-filters');
      root.classList.toggle('is-collapsed', collapsed);
      const extraInner = ['patroler', 'governor', 'advisor', ...fields.map(field => field.key)].map(control).join('') + renderTrailing();
      const keepExtra = extraInner && (!collapsed || collapseChanged);
      root.innerHTML = `<div class="fo-heading"><div class="fo-tabs" role="tablist" aria-label="组织筛选维度">${[['organization', '组织维度'], ['geography', '地理维度']].map(([key, name]) => `<button type="button" role="tab" aria-selected="${model.dimension === key}" data-fo-dimension="${key}">${name}</button>`).join('')}</div><div class="fo-path"><img src="../assets/filter-path-icon.svg" alt="">当前路径：<strong title="${escape(model.summary())}">${model.primary().map((key, index) => `${index ? '<i class="session-select-caret fo-path-arrow" aria-hidden="true"></i>' : ''}<span>${escape(model.selections[key].length ? model.display(key) : '全部' + labels[key])}</span>`).join('')}</strong></div></div>` +
        `<div class="fo-primary"><div class="fo-grid">${model.primary().map(control).join('')}</div>${collapsed ? renderActions() : ''}</div>` +
        (keepExtra ? `<div class="fo-extra" data-fo-extra><div class="fo-extra-inner"><div class="fo-grid fo-secondary">${extraInner}</div></div></div>` : '') +
        (collapsed ? '' : renderActions());
      onRender();
      const extra = root.querySelector('[data-fo-extra]');
      if (extra && collapseChanged && !global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const targetHeight = collapsed ? 0 : extra.getBoundingClientRect().height;
        extra.style.height = previousHeight + 'px';
        extra.style.overflow = 'clip';
        const animation = extra.animate([{ height: previousHeight + 'px' }, { height: targetHeight + 'px' }], {
          duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards'
        });
        root._foCollapseAnimation = animation;
        const finish = () => {
          if (root._foCollapseAnimation !== animation) return;
          root._foCollapseAnimation = null;
          animation.cancel();
          settleExtra(extra);
        };
        animation.onfinish = finish;
        global.setTimeout(finish, 340);
      } else settleExtra(extra);
      const panel = root.querySelector('.fo-menu');
      if (panel) {
        const rect = panel.getBoundingClientRect();
        panel.style.marginLeft = Math.min(0, window.innerWidth - 16 - rect.right) + 'px';
      }
    };
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      let changed = false;
      if (button.hasAttribute('data-fo-trigger')) { open = open === button.dataset.foTrigger ? '' : button.dataset.foTrigger; query = ''; }
      else if (button.hasAttribute('data-fo-dimension')) { model.setDimension(button.dataset.foDimension); open = ''; query = ''; changed = true; }
      else if (button.hasAttribute('data-fo-option')) {
        const id = button.dataset.foOption, values = model.selections[open];
        model.set(open, values.includes(id) ? values.filter(value => value !== id) : [...values, id]); changed = true;
      } else if (button.hasAttribute('data-fo-all')) {
        const ids = visibleOptions(open).map(item => item.value), values = model.selections[open];
        model.set(open, ids.every(id => values.includes(id)) ? values.filter(id => !ids.includes(id)) : [...values, ...ids]); changed = true;
      } else if (button.hasAttribute('data-fo-reset')) { model.reset(); collapsed = true; open = ''; query = ''; changed = true; }
      else if (button.hasAttribute('data-fo-collapse')) { collapsed = !collapsed; open = ''; }
      else return;
      const scroll = root.querySelector('.fo-options')?.scrollTop || 0;
      const focusValue = button.dataset.foOption;
      const focusAttribute = ['data-fo-trigger', 'data-fo-dimension', 'data-fo-all', 'data-fo-reset', 'data-fo-collapse'].find(name => button.hasAttribute(name));
      const focusId = focusAttribute ? button.getAttribute(focusAttribute) : '';
      render();
      if (focusAttribute) [...root.querySelectorAll(`[${focusAttribute}]`)].find(node => node.getAttribute(focusAttribute) === focusId)?.focus({ preventScroll: true });
      if (focusValue) [...root.querySelectorAll('[data-fo-option]')].find(node => node.dataset.foOption === focusValue)?.focus({ preventScroll: true });
      if (root.querySelector('.fo-options')) root.querySelector('.fo-options').scrollTop = scroll;
      if (changed) onChange({ reset: button.hasAttribute('data-fo-reset') });
    });
    root.addEventListener('input', event => {
      if (!event.target.matches('[data-fo-search]')) return;
      query = event.target.value; render(); root.querySelector('[data-fo-search]')?.focus();
    });
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !open) return;
      const key = open; open = ''; render(); root.querySelector(`[data-fo-trigger="${key}"]`)?.focus();
    });
    if (global.__factoryDashboardOrgOutsideHandler) document.removeEventListener('click', global.__factoryDashboardOrgOutsideHandler, true);
    global.__factoryDashboardOrgOutsideHandler = event => { if (open && !root.contains(event.target)) { open = ''; query = ''; render(); } };
    document.addEventListener('click', global.__factoryDashboardOrgOutsideHandler, true);
    render();
    return Object.assign(model, { closeMenu() { if (open) { open = ''; query = ''; render(); } } });
  }
  global.FactoryOrganizationFilter = { createModel, mount, leadSeriesOptions };
})(window);
