/* 产品原型轻量内嵌：固定销售看板侧栏，只切换右侧独立页面。 */
(function initPrototypeEmbed() {
  const frame = document.getElementById('prototypeEmbedFrame');
  const main = document.querySelector('.main');
  const topbar = document.getElementById('mainTopbar');
  const pageHost = document.getElementById('pageHost');
  const sidebar = document.querySelector('.sidebar');
  const initialRoute = new URLSearchParams(window.location.search).get('route');

  if (!frame || !main || !topbar || !pageHost || !sidebar) return;

  let previousTopbarHidden = topbar.hidden;

  function syncParentRoute(route) {
    const url = new URL(window.location.href);
    url.searchParams.set('route', route);
    url.hash = '';
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  function setActiveNav(page) {
    sidebar.querySelectorAll('.nav-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.page === page);
    });
  }

  function showEmbeddedPage(button) {
    const source = button.dataset.embedSrc;
    if (!source) return;

    previousTopbarHidden = topbar.hidden;
    topbar.hidden = true;
    pageHost.hidden = true;
    frame.hidden = false;
    main.classList.add('prototype-embed-mode');

    if (frame.dataset.currentSource !== source) {
      frame.src = source;
      frame.dataset.currentSource = source;
    }

    setActiveNav(button.dataset.page);
    syncParentRoute(button.dataset.page);
  }

  function restoreSalesPage() {
    if (frame.hidden) return false;

    frame.hidden = true;
    pageHost.hidden = false;
    topbar.hidden = previousTopbarHidden;
    main.classList.remove('prototype-embed-mode');
    setActiveNav('sales-dashboard');
    syncParentRoute('sales-dashboard');
    return true;
  }

  sidebar.addEventListener('click', (event) => {
    const embedButton = event.target.closest('[data-embed-src]');
    if (embedButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showEmbeddedPage(embedButton);
      return;
    }

    const homeButton = event.target.closest('[data-prototype-home]');
    if (homeButton && restoreSalesPage()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('load', () => {
    const initialButton = sidebar.querySelector(`[data-embed-src][data-page="${initialRoute}"]`);
    if (initialButton) showEmbeddedPage(initialButton);
  });
})();
