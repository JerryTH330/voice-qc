const pageMeta = {
  visits: {
    title: '到访记录',
    description: '统一查看销售助手与人工导入的到访记录及录音匹配结果',
    actions: [
      { label: '导出', style: 'ghost', action: 'export' },
      { label: '导入到访记录', style: 'primary', action: 'import' }
    ]
  },
  projects: {
    title: '设备门店',
    description: '按门店管理员工、工牌及充电坞的设备归属',
    actions: [{ label: '导出门店', style: 'ghost', action: 'export' }]
  },
  docks: {
    title: '充电坞',
    description: '查看各门店充电坞的在线状态与端口使用情况',
    actions: [{ label: '导出', style: 'ghost', action: 'export' }]
  },
  badges: {
    title: '工牌状态',
    description: '实时掌握工牌在线、录音、电量、存储与上传状态',
    actions: [
      { label: '导出状态', style: 'ghost', action: 'export' },
      { label: '同步状态', style: 'primary', action: 'sync' }
    ]
  },
  relations: {
    title: '工牌关系',
    description: '维护员工与工牌的当前关系及历史使用记录',
    actions: [
      { label: '批量导入', style: 'ghost', action: 'relation-import' },
      { label: '分配工牌', style: 'primary', action: 'relation-add' }
    ]
  },
  dashboard: {
    title: '工牌看板',
    description: '按日查看到访录音覆盖与设备使用表现',
    actions: [{ label: '导出看板', style: 'ghost', action: 'export' }]
  }
};

const routeButtons = Array.from(document.querySelectorAll('[data-route]'));
const pagePanels = Array.from(document.querySelectorAll('[data-page]'));
const title = document.getElementById('pageTitle');
const description = document.getElementById('pageDescription');
const topActions = document.getElementById('topActions');
const toast = document.getElementById('toast');
const importModal = document.getElementById('importModal');
const relationModal = document.getElementById('relationModal');
const visitDrawer = document.getElementById('visitDetail');
const drawerBackdrop = document.getElementById('visitDrawer');

function validRoute(value) {
  return Object.prototype.hasOwnProperty.call(pageMeta, value) ? value : 'visits';
}

function getRoute() {
  return validRoute(window.location.hash.replace('#', ''));
}

function renderActions(route) {
  topActions.innerHTML = '';
  pageMeta[route].actions.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn ${item.style}`;
    button.dataset.action = item.action;
    button.textContent = item.label;
    topActions.appendChild(button);
  });
}

function setRoute(route, updateHash = true) {
  const safeRoute = validRoute(route);
  routeButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === safeRoute));
  pagePanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.page === safeRoute));
  title.textContent = pageMeta[safeRoute].title;
  description.textContent = pageMeta[safeRoute].description;
  document.title = `${pageMeta[safeRoute].title} · AI质检平台`;
  renderActions(safeRoute);
  if (updateHash && window.location.hash !== `#${safeRoute}`) window.location.hash = safeRoute;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.hidden = true;
  if (!visitDrawer.classList.contains('open')) document.body.style.overflow = '';
}

function openDrawer() {
  drawerBackdrop.hidden = false;
  visitDrawer.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => visitDrawer.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  visitDrawer.classList.remove('open');
  visitDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => { drawerBackdrop.hidden = true; }, 220);
  document.body.style.overflow = '';
}

routeButtons.forEach((button) => {
  button.addEventListener('click', () => setRoute(button.dataset.route));
});

window.addEventListener('hashchange', () => setRoute(getRoute(), false));

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'import') openModal(importModal);
  if (action === 'relation-import') {
    setRoute('relations');
    showToast('批量导入入口已准备');
  }
  if (action === 'relation-add') openModal(relationModal);
  if (action === 'export') showToast('导出任务已创建');
  if (action === 'sync') showToast('正在同步设备状态…');

  if (event.target.closest('.open-detail')) openDrawer();
  if (event.target.closest('.close-drawer') || event.target === drawerBackdrop) closeDrawer();
  if (event.target.closest('.close-modal') || (event.target.classList.contains('modal-backdrop') && event.target !== event.target.querySelector('.modal'))) {
    const modal = event.target.closest('.modal-backdrop');
    if (modal) closeModal(modal);
  }
  if (event.target.closest('.toast-action')) showToast('原型操作已响应');
  if (event.target.closest('.confirm-relation')) {
    closeModal(relationModal);
    showToast('工牌分配成功，历史关系已保留');
  }
  if (event.target.closest('.relation-action')) showToast(`${event.target.textContent.trim()}操作将在确认后生效`);
  if (event.target.closest('.apply-filter')) showToast('已按当前条件更新数据');
  if (event.target.closest('.reset-filters')) {
    const container = event.target.closest('.filter-card');
    container?.querySelectorAll('input').forEach((input) => {
      if (input.type === 'search') input.value = '';
    });
    container?.querySelectorAll('select').forEach((select) => { select.selectedIndex = 0; });
    showToast('筛选条件已重置');
  }
  if (event.target.closest('.notice-close')) event.target.closest('.notice')?.remove();
  if (event.target.closest('.segmented button')) {
    const group = event.target.closest('.segmented');
    group.querySelectorAll('button').forEach((button) => button.classList.remove('active'));
    event.target.classList.add('active');
    showToast(`已切换至${event.target.textContent.trim()}`);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (visitDrawer.classList.contains('open')) closeDrawer();
  if (!importModal.hidden) closeModal(importModal);
  if (!relationModal.hidden) closeModal(relationModal);
});

function initDeviceBackToTop() {
  const scrollContainer = document.querySelector('.main');
  if (!scrollContainer) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'global-back-to-top';
  button.setAttribute('aria-label', '回到顶部');
  button.setAttribute('title', '回到顶部');
  button.setAttribute('aria-hidden', 'true');
  button.tabIndex = -1;
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 14.5 5.5-5.5 5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  document.body.appendChild(button);

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let animationFrame = 0;

  const isBlocked = () => !importModal.hidden
    || !relationModal.hidden
    || visitDrawer.classList.contains('open');
  const updateVisibility = () => {
    const isLongPage = scrollContainer.scrollHeight > scrollContainer.clientHeight * 1.5;
    const shouldShow = !isBlocked()
      && isLongPage
      && (visible ? scrollContainer.scrollTop > 300 : scrollContainer.scrollTop > 600);
    if (shouldShow === visible) return;
    visible = shouldShow;
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  };
  const focusTitle = () => {
    const title = document.querySelector('.page-title, .topbar h1, main h1, h1');
    if (!title) return;
    if (!title.hasAttribute('tabindex')) title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  };
  const scrollToTop = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    const startScrollTop = scrollContainer.scrollTop;
    if (reducedMotionQuery.matches || startScrollTop < 2) {
      scrollContainer.scrollTop = 0;
      updateVisibility();
      focusTitle();
      return;
    }
    const duration = 500;
    let startTime = 0;
    const easeInOutCubic = (progress) => progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      scrollContainer.scrollTop = startScrollTop * (1 - easeInOutCubic(progress));
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }
      animationFrame = 0;
      scrollContainer.scrollTop = 0;
      updateVisibility();
      focusTitle();
    };
    animationFrame = window.requestAnimationFrame(animate);
  };

  button.addEventListener('click', scrollToTop);
  scrollContainer.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', () => window.requestAnimationFrame(updateVisibility));
  new MutationObserver(() => window.requestAnimationFrame(updateVisibility)).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'aria-hidden', 'style']
  });
  updateVisibility();
}

setRoute(getRoute(), !window.location.hash);
initDeviceBackToTop();
