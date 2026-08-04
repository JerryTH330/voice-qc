(function initUnifiedNavigationShell() {
  const desktopShell = window.matchMedia('(min-width: 1101px)');
  const pageShell = document.querySelector('.page-shell');
  const navButtons = Array.from(document.querySelectorAll('.nav-button'));
  const originalActivePage = navButtons.find((button) => button.classList.contains('active'))?.dataset.page;
  const frames = new Map();
  let activeFrameKey = null;

  if (!pageShell || !navButtons.length) return;

  function getFrameKey(page) {
    return page === 'customer-insight' ? 'customer-insight' : page?.startsWith('device-') ? 'device-management' : null;
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
      frame.title = page === 'customer-insight' ? '客户洞察' : '设备管理';
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
    if (!button || !desktopShell.matches) return;

    const frameKey = getFrameKey(button.dataset.page);
    if (frameKey && button.dataset.href) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showTarget(button);
      return;
    }

    if (activeFrameKey && button.dataset.href) {
      const targetUrl = new URL(button.dataset.href, window.location.href);
      if (targetUrl.pathname === window.location.pathname) {
        event.preventDefault();
        event.stopImmediatePropagation();
        restoreOriginalPage();
      }
    }
  }, true);

  desktopShell.addEventListener('change', (event) => {
    if (!event.matches && activeFrameKey) restoreOriginalPage();
  });
})();
