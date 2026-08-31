/* 全站共用组织目录：真实门店 + 稳定演示顾问。 */
(function initOrganizationDirectory(global) {
  const dealerSeeds = Array.isArray(global.__LEADS_ORGANIZATION_DEALERS)
    ? global.__LEADS_ORGANIZATION_DEALERS
    : [];
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢'];
  const givenNames = ['子涵', '宇辰', '欣怡', '浩然', '若曦', '梓轩', '雨桐', '嘉怡', '思远', '俊杰', '晨曦', '可欣', '明轩', '诗涵', '睿哲', '依诺', '景行', '安然', '知夏', '沐阳', '清妍', '承泽', '书瑶', '逸凡'];

  const normalizeBrand = (value) => String(value || '')
    .replace(/^\u5e7f\u6c7d/, '')
    .replace('全部品牌', '全部') || '全部';
  const stableName = (index) => `${surnames[index % surnames.length]}${givenNames[Math.floor(index / surnames.length) % givenNames.length]}`;
  const getDealerPath = (dealer, dimension = 'region') => {
    const secondLevel = dimension === 'province' ? dealer.province : dealer.area;
    const thirdLevel = dimension === 'province' ? dealer.city : dealer.zone;
    return `${dealer.brand} > ${secondLevel} > ${thirdLevel} > ${dealer.dealerName}`;
  };

  const dealers = dealerSeeds
    .filter((dealer) => ['传祺', '埃安'].includes(normalizeBrand(dealer.brand)) && dealer.dealerName)
    .map((dealer, dealerIndex) => {
      const brand = normalizeBrand(dealer.brand);
      const prefix = brand === '传祺' ? 'GAC' : 'AION';
      const advisors = Array.from({ length: 5 }, (_, advisorIndex) => {
        const globalIndex = dealerIndex * 5 + advisorIndex;
        return Object.freeze({
          advisorId: `${prefix}-${dealer.dealerCode}-${String(advisorIndex + 1).padStart(2, '0')}`,
          advisorName: stableName(globalIndex)
        });
      });
      return Object.freeze({ ...dealer, brand, advisors: Object.freeze(advisors) });
    });

  function buildTree(dimension) {
    const roots = [];
    dealers.forEach((dealer) => {
      dealer.advisors.forEach((advisor) => {
        const dealerPath = getDealerPath(dealer, dimension);
        const segments = [...dealerPath.split(' > '), advisor.advisorName];
        let currentNodes = roots;
        let currentPath = '';
        segments.forEach((label, index) => {
          currentPath = currentPath ? `${currentPath} > ${label}` : label;
          const isAdvisor = index === segments.length - 1;
          let node = currentNodes.find((entry) => entry.path === currentPath);
          if (!node) {
            node = {
              label,
              path: currentPath,
              type: isAdvisor ? 'advisor' : (index === segments.length - 2 ? 'dealer' : 'organization'),
              dealerCode: index >= segments.length - 2 ? dealer.dealerCode : '',
              advisorId: isAdvisor ? advisor.advisorId : '',
              children: isAdvisor ? undefined : []
            };
            currentNodes.push(node);
          }
          currentNodes = node.children || [];
        });
      });
    });
    return roots;
  }

  const trees = Object.freeze({ region: buildTree('region'), province: buildTree('province') });
  const advisors = Object.freeze(dealers.flatMap((dealer) => dealer.advisors.map((advisor, index) => Object.freeze({
    dealer,
    ...advisor,
    advisorIndex: index
  }))));
  const recordings = Object.freeze(advisors.map((entry, index) => Object.freeze({
    ...entry,
    recordingId: `REC-20872084820663${String(index).padStart(4, '0')}`,
    recordedAt: `2026-08-${String(8 + (index % 5)).padStart(2, '0')} ${String(9 + (index % 10)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`,
    recordingCount: 1
  })));
  const badges = Object.freeze(advisors.map((entry, index) => Object.freeze({
    ...entry,
    sn: `MN-BDG-${String(4821 + index * 7).padStart(6, '0')}`,
    badgeIndex: index
  })));
  const flattenTree = (nodes, result = []) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children) flattenTree(node.children, result);
    });
    return result;
  };
  const flatTrees = Object.freeze({ region: flattenTree(trees.region), province: flattenTree(trees.province) });

  function getRootNodes(dimension = 'region', brand = '全部') {
    const tree = trees[dimension] || trees.region;
    const normalizedBrand = normalizeBrand(brand);
    if (normalizedBrand === '全部') return tree;
    return tree.find((node) => node.label === normalizedBrand)?.children || [];
  }

  function getColumns(path = '全部组织', dimension = 'region', brand = '全部') {
    const columns = [];
    let currentNodes = getRootNodes(dimension, brand);
    while (currentNodes.length) {
      columns.push(currentNodes);
      const activeNode = currentNodes.find((node) => path === node.path || path.startsWith(`${node.path} > `));
      if (!activeNode?.children?.length) break;
      currentNodes = activeNode.children;
    }
    return columns;
  }

  const normalizeSearch = (value) => String(value || '').trim().toLocaleLowerCase('zh-CN').replace(/[\s>/／-]+/g, '');
  function search(query, dimension = 'region', brand = '全部') {
    const keyword = normalizeSearch(query);
    if (!keyword) return [];
    const normalizedBrand = normalizeBrand(brand);
    return (flatTrees[dimension] || flatTrees.region).filter((node) => {
      if (normalizedBrand !== '全部' && !node.path.startsWith(`${normalizedBrand} > `)) return false;
      return normalizeSearch(`${node.label} ${node.path} ${node.dealerCode || ''} ${node.advisorId || ''}`).includes(keyword);
    }).slice(0, 80);
  }

  function findNode(path, dimension = 'region') {
    return (flatTrees[dimension] || flatTrees.region).find((node) => node.path === path) || null;
  }

  function formatPath(path, brand = '全部') {
    if (!path || path === '全部组织') return '全部组织';
    const normalizedBrand = normalizeBrand(brand);
    const visiblePath = normalizedBrand !== '全部' && path.startsWith(`${normalizedBrand} > `)
      ? path.slice(normalizedBrand.length + 3)
      : path;
    return visiblePath.replaceAll(' > ', ' / ');
  }

  function getRecordPath(record, dimension = 'region', includeAdvisor = true) {
    const dealer = record.dealer || record;
    const dealerPath = getDealerPath(dealer, dimension);
    if (!includeAdvisor) return dealerPath;
    const advisorName = record.advisorName || record.advisor?.advisorName;
    return advisorName ? `${dealerPath} > ${advisorName}` : dealerPath;
  }

  global.AIQCOrganization = Object.freeze({
    brands: Object.freeze(['全部', '传祺', '埃安']),
    dimensions: Object.freeze([
      Object.freeze({ label: '大区维度', value: 'region' }),
      Object.freeze({ label: '省份维度', value: 'province' })
    ]),
    dealers: Object.freeze(dealers),
    advisors,
    recordings,
    badges,
    trees,
    normalizeBrand,
    getDealerPath,
    getRecordPath,
    getRootNodes,
    getColumns,
    search,
    findNode,
    formatPath
  });
})(window);
