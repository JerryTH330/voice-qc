(function initUnifiedNavigationShell() {
  const scriptUrl = new URL(document.currentScript?.src || './unified-navigation-shell.js', window.location.href);
  const appRootUrl = new URL('./', scriptUrl);
  const desktopShell = window.matchMedia('(min-width: 1101px)');
  const pageShell = document.querySelector('.page-shell');
  const navigationRoot = document.querySelector('[data-unified-navigation], .nav-scroll');
  const frames = new Map();
  let activeFrameKey = null;

  const icons = {
    customerInsight: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M448 128a320 320 0 1 0 0 640 320 320 0 0 0 0-640m0 64a256 256 0 1 1 0 512 256 256 0 0 1 0-512"/><path fill="currentColor" d="m672 626.752 260.608 260.544a32 32 0 0 1-45.312 45.312L626.752 672zM288 480h64v128h-64zm128-192h64v320h-64zm128 96h64v224h-64z"/></svg>',
    factoryDashboard: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M160 128h704a64 64 0 0 1 64 64v512a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V192a64 64 0 0 1 64-64m0 64v512h704V192z"/><path fill="currentColor" d="M288 320h128v256H288zm192-96h128v352H480zm192 160h128v192H672zM384 832h256a32 32 0 1 1 0 64H384a32 32 0 1 1 0-64m96-96h64v128h-64z"/></svg>',
    storeDashboard: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32"/><path fill="currentColor" d="M256 256h256v64H256zm0 192h256v64H256zm0 192h256v64H256zm384-128h128v64H640zm0 128h128v64H640zM64 832h896v64H64z"/><path fill="currentColor" d="M640 384v448h192V384zm-32-64h256a32 32 0 0 1 32 32v512a32 32 0 0 1-32 32H608a32 32 0 0 1-32-32V352a32 32 0 0 1 32-32"/></svg>',
    salesDashboard: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384m0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512m320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0"/></svg>',
    scriptLibrary: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M160 826.88 273.536 736H800a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H224a64 64 0 0 0-64 64zM296 800 147.968 918.4A32 32 0 0 1 96 893.44V256a128 128 0 0 1 128-128h576a128 128 0 0 1 128 128v416a128 128 0 0 1-128 128z"/><path fill="currentColor" d="M352 512h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m0-192h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32"/></svg>',
    session: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M896 529.152V512a384 384 0 1 0-768 0v17.152A128 128 0 0 1 320 640v128a128 128 0 1 1-256 0V512a448 448 0 1 1 896 0v256a128 128 0 1 1-256 0V640a128 128 0 0 1 192-110.848M896 640a64 64 0 0 0-128 0v128a64 64 0 0 0 128 0zm-768 0v128a64 64 0 0 0 128 0V640a64 64 0 1 0-128 0"/></svg>',
    leads: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M640 384v64H448a128 128 0 0 0-128 128v128a128 128 0 0 0 128 128h320a128 128 0 0 0 128-128V576a128 128 0 0 0-64-110.848V394.88c74.56 26.368 128 97.472 128 181.056v128a192 192 0 0 1-192 192H448a192 192 0 0 1-192-192V576a192 192 0 0 1 192-192z"/><path fill="currentColor" d="M384 640v-64h192a128 128 0 0 0 128-128V320a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v128a128 128 0 0 0 64 110.848v70.272A192.06 192.06 0 0 1 64 448V320a192 192 0 0 1 192-192h320a192 192 0 0 1 192 192v128a192 192 0 0 1-192 192z"/></svg>',
    badgeOverview: '<svg class="nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15.75 5.625H2.25a.75.75 0 0 0-.75.75v8.25c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-8.25a.75.75 0 0 0-.75-.75Z" stroke="currentColor" stroke-width="1.125" stroke-linejoin="round"/><path d="m9 2.625-3 3h6l-3-3ZM4.5 9h6.75M4.5 12h3" stroke="currentColor" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    badgeDetail: '<svg class="nav-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15.75 3H2.25a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75Z" stroke="currentColor" stroke-width="1.125" stroke-linejoin="round"/><path d="M6.375 9.375a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" stroke-width="1.125" stroke-linejoin="round"/><path d="M8.625 11.625a2.25 2.25 0 0 0-4.5 0M10.5 7.5h3M11.25 10.5h2.25" stroke="currentColor" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    config: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0 34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256"/></svg>',
    system: '<svg class="nav-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M544 768v128h192a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64h192V768H192A128 128 0 0 1 64 640V256a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128zM192 192a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64z"/></svg>'
  };

  const groups = [
    { label: '看板', items: [
      { page: 'customer-insight', label: '客户洞察', path: '客户洞察/v2/index.html', icon: icons.customerInsight },
      { page: 'factory-dashboard', label: '厂端看板', path: 'factory-dashboard/index.html', icon: icons.factoryDashboard },
      { page: 'dashboard', label: '门店看板', path: 'store-dashboard/index.html', icon: icons.storeDashboard },
      { page: 'sales-dashboard', label: '销售看板', path: 'sales-dashboard/index.html', icon: icons.salesDashboard }
    ] },
    { label: '业务', items: [
      { page: 'script-library', label: '优秀话术库', path: 'script-library/index.html', icon: icons.scriptLibrary },
      { page: 'session', label: '录音列表', path: 'session/index.html', icon: icons.session },
      { page: 'leads', label: '线索列表', path: 'leads/index.html', icon: icons.leads }
    ] },
    { label: '工牌', items: [
      { page: 'device-stores', route: 'stores', label: '工牌总览', path: 'device-management/index.html#stores', icon: icons.badgeOverview },
      { page: 'device-badges', route: 'badges', label: '工牌明细', path: 'device-management/index.html#badges', icon: icons.badgeDetail },
      { page: 'device-docks', route: 'docks', label: '充电坞明细', path: 'device-management/index.html#docks', icon: '<span class="nav-icon nav-icon-mask nav-icon-charging-dock-detail" aria-hidden="true"></span>' },
      { page: 'device-dashboard', route: 'dashboard', label: '录音排查', path: 'device-management/index.html#dashboard', icon: '<span class="nav-icon nav-device-symbol" aria-hidden="true">▥</span>' },
      { page: 'device-visits', route: 'visits', label: '到访明细', path: 'device-management/index.html#visits', icon: '<span class="nav-icon nav-device-symbol" aria-hidden="true">◫</span>' }
    ] },
    { label: '管理', items: [
      { page: 'config', label: '质检配置', path: 'config/index.html', icon: icons.config },
      { page: 'system', label: '系统管理', path: 'system/index.html', icon: icons.system }
    ] }
  ];

  function ensureUnifiedNavigationStyles() {
    if (document.querySelector('[data-unified-navigation-styles]')) return;
    const style = document.createElement('style');
    style.dataset.unifiedNavigationStyles = '';
    style.textContent = `
      .sidebar [data-unified-navigation] .nav-label {
        font-size: 14px;
      }

      .sidebar [data-unified-navigation] .nav-item,
      .sidebar [data-unified-navigation] .nav-item.active {
        font-size: 16px;
        font-weight: 400;
      }
    `;
    document.head.appendChild(style);
  }

  function getCurrentNavigationPage() {
    const pathname = decodeURIComponent(window.location.pathname);
    if (pathname.includes('/device-management/')) {
      const route = window.location.hash.slice(1).split('?')[0];
      return `device-${['stores', 'badges', 'docks', 'dashboard', 'visits'].includes(route) ? route : 'stores'}`;
    }
    if (pathname.includes('/客户洞察/v2/')) return 'customer-insight';
    if (pathname.includes('/factory-dashboard/')) return 'factory-dashboard';
    if (pathname.includes('/store-dashboard/')) return 'dashboard';
    if (pathname.includes('/sales-dashboard/')) return 'sales-dashboard';
    if (pathname.includes('/script-library/')) return 'script-library';
    if (pathname.includes('/session/')) return 'session';
    if (pathname.includes('/leads/')) return 'leads';
    if (pathname.includes('/config/')) return 'config';
    if (pathname.includes('/system/')) return 'system';
    return '';
  }

  function renderNavigation() {
    if (!navigationRoot) return;
    const currentPage = getCurrentNavigationPage();
    navigationRoot.dataset.unifiedNavigation = '';
    navigationRoot.innerHTML = groups.map((group) => `
      <div class="nav-group">
        <div class="nav-label">${group.label}</div>
        <div class="nav-menu">
          ${group.items.map((item) => {
            const active = item.page === currentPage;
            const deviceAttributes = item.route ? ` data-route="${item.route}"` : '';
            const deviceClass = item.route ? ' device-nav' : '';
            return `<button class="nav-item nav-button${deviceClass}${active ? ' active' : ''}" type="button" data-page="${item.page}" data-href="${new URL(item.path, appRootUrl).href}"${deviceAttributes}${active ? ' aria-current="page"' : ''}>${item.icon}<span class="nav-text">${item.label}</span></button>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    const dockIcon = navigationRoot.querySelector('.nav-icon-charging-dock-detail');
    if (dockIcon) {
      const iconUrl = new URL('assets/nav-charging-dock-detail-figma.svg', appRootUrl).href;
      dockIcon.style.webkitMaskImage = `url("${iconUrl}")`;
      dockIcon.style.maskImage = `url("${iconUrl}")`;
    }
  }

  ensureUnifiedNavigationStyles();
  renderNavigation();

  const navButtons = Array.from(document.querySelectorAll('.nav-button'));
  const originalActivePage = navButtons.find((button) => button.classList.contains('active'))?.dataset.page;

  if (!pageShell || !navButtons.length) return;

  function getFrameKey(page) {
    return page === 'customer-insight' && getCurrentNavigationPage() !== 'customer-insight' ? 'customer-insight' : null;
  }

  function setActiveNavigation(page) {
    navButtons.forEach((button) => {
      const active = button.dataset.page === page;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function setFrameVisibility(frameKey) {
    frames.forEach((frame, key) => {
      frame.classList.toggle('is-visible', key === frameKey);
      frame.setAttribute('aria-hidden', String(key !== frameKey));
    });
    activeFrameKey = frameKey;
  }

  function restoreOriginalPage() {
    setFrameVisibility(null);
    if (originalActivePage) setActiveNavigation(originalActivePage);
  }

  function showTarget(button) {
    const page = button.dataset.page;
    const frameKey = getFrameKey(page);
    const targetUrl = new URL(button.dataset.href, window.location.href);
    let frame = frames.get(frameKey);

    setActiveNavigation(page);
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'unified-content-frame';
      frame.title = '客户洞察';
      frame.setAttribute('aria-hidden', 'true');
      frame.addEventListener('load', () => {
        frame.classList.add('is-loaded');
        if (activeFrameKey === frameKey) frame.classList.add('is-visible');
      });
      frames.set(frameKey, frame);
      pageShell.appendChild(frame);
      frame.src = targetUrl.href;
    } else if (frame.src !== targetUrl.href) {
      frame.src = targetUrl.href;
    }
    setFrameVisibility(frameKey);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-button');
    if (!button || !button.dataset.href) return;

    const isDevicePage = getCurrentNavigationPage().startsWith('device-');
    if (button.dataset.page?.startsWith('device-')) {
      if (isDevicePage) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = button.dataset.href;
      return;
    }

    const frameKey = desktopShell.matches ? getFrameKey(button.dataset.page) : null;
    if (frameKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showTarget(button);
      return;
    }

    if (activeFrameKey) {
      const targetUrl = new URL(button.dataset.href, window.location.href);
      if (targetUrl.pathname === window.location.pathname) {
        event.preventDefault();
        event.stopImmediatePropagation();
        restoreOriginalPage();
        return;
      }
    }

    if (getCurrentNavigationPage() === 'customer-insight') {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = button.dataset.href;
    }
  }, true);

  desktopShell.addEventListener('change', (event) => {
    if (!event.matches && activeFrameKey) restoreOriginalPage();
  });
})();
