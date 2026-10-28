(function initUnifiedNavigationShell() {
  const scriptUrl = new URL(document.currentScript?.src || './unified-navigation-shell.js', window.location.href);
  const appRootUrl = new URL('./', scriptUrl);
  const toastStyle = document.createElement('link');
  toastStyle.rel = 'stylesheet'; toastStyle.href = new URL('shared/platform-toast.css?v=20261028-full-sync-v1', appRootUrl).href;
  document.head.appendChild(toastStyle);
  const toastIcons = {
    success: '<circle cx="10" cy="10" r="7.5"/><path d="m6.5 10 2.3 2.3 4.7-4.7"/>',
    error: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4.5"/><circle cx="10" cy="13.5" r=".75" fill="currentColor" stroke="none"/>',
    info: '<circle cx="10" cy="10" r="7.5"/><path d="M10 9v4"/><circle cx="10" cy="6.5" r=".75" fill="currentColor" stroke="none"/>'
  };
  function getToastStack() {
    let stack = document.querySelector('.platform-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'platform-toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }
  window.PlatformToast = {
    show(message, { kind = 'info', duration = 2200, action, dismissible = false } = {}) {
      const toast = document.createElement('div');
      const type = Object.hasOwn(toastIcons, kind) ? kind : 'info';
      toast.className = 'platform-toast';
      toast.dataset.kind = type;
      toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
      const icon = document.createElement('span');
      icon.className = 'platform-toast-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${toastIcons[type]}</svg>`;
      const copy = document.createElement('span');
      copy.className = 'platform-toast-message';
      copy.textContent = message;
      toast.append(icon, copy);
      if (action) {
        const link = document.createElement('a');
        link.className = 'platform-toast-action';
        link.textContent = action.label;
        link.href = action.href;
        toast.appendChild(link);
      }
      if (dismissible) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'platform-toast-close';
        close.setAttribute('aria-label', '关闭提示');
        close.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>';
        close.addEventListener('click', () => toast.remove());
        toast.appendChild(close);
      }
      getToastStack().appendChild(toast);
      if (duration > 0) window.setTimeout(() => toast.remove(), duration);
      return toast;
    }
  };
  const exportScriptVersions = {
    'device-management/xlsx-export-utils.js': '20261028-full-sync-v1',
    'shared/export-tasks.js': '20261028-full-sync-v1',
    'shared/export-task-browser.js': '20261028-full-sync-v1'
  };
  window.__exportReady = Object.keys(exportScriptVersions).reduce((ready, path) => ready.then(() => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(`${path}?v=${exportScriptVersions[path]}`, appRootUrl).href;
    script.onload = resolve; script.onerror = () => reject(new Error('导出功能加载失败，请刷新重试'));
    document.body.appendChild(script);
  })), Promise.resolve());
  window.__exportReady.catch(error => console.error(error));
  const navigationRoot = document.querySelector('[data-unified-navigation], .nav-scroll');

  // Generated from assets/navigation/*.svg by scripts/sync-navigation-icons.cjs.
  // Embedded original bytes keep local file previews independent of cross-file SVG mask access.
  // NAVIGATION_ICON_DATA_START
  const iconData = {
    "customerInsight": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik03Ljg3NSAxNC4yNUMxMS4zOTU4IDE0LjI1IDE0LjI1IDExLjM5NTggMTQuMjUgNy44NzVDMTQuMjUgNC4zNTQyIDExLjM5NTggMS41IDcuODc1IDEuNUM0LjM1NDIgMS41IDEuNSA0LjM1NDIgMS41IDcuODc1QzEuNSAxMS4zOTU4IDQuMzU0MiAxNC4yNSA3Ljg3NSAxNC4yNVoiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik05Ljk5NjM4IDUuMzc4NjZDOS40NTM0OSA0LjgzNTc3IDguNzAzNDkgNC41IDcuODc1MDQgNC41QzcuMDQ2NjIgNC41IDYuMjk2NjMgNC44MzU3NyA1Ljc1Mzc0IDUuMzc4NjYiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMyIgZD0iTTEyLjQ1ODEgMTIuNDU4MUwxNS42NDAxIDE1LjY0MDEiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9zdmc+Cg==",
    "factoryDashboard": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzBfNjEpIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTEuNSAxNi41VjEuNUg0LjVWNy41TDEwLjUgNC41VjcuNUwxNi41IDQuNVYxNi41SDEuNVoiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTcuNSAxMC41SDQuNVYxMy41SDcuNVYxMC41WiIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNMTMuNSAxMC41SDEwLjVWMTMuNUgxMy41VjEwLjVaIiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzBfNjEiPgo8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==",
    "storeDashboard": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNS4wMTQ3IDguMjVWMTUuNzVIMy4wMTQ2NVY4LjI1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik0yLjE5MDg3IDUuMTY2MjJDMS42MTcyOCA2LjY1MTY0IDIuNzIzNjUgOC4yNSA0LjMxNTk1IDguMjVDNS41NTg1OSA4LjI1IDYuNTcyODUgNy4yNDI2NCA2LjU3Mjg1IDZDNi41NzI4NSA3LjI0MjY0IDcuNTgwMjEgOC4yNSA4LjgyMjg1IDguMjVIOS4yMDQ3NUMxMC40NDc0IDguMjUgMTEuNDU0NyA3LjI0MjY0IDExLjQ1NDcgNkMxMS40NTQ3IDcuMjQyNjQgMTIuNDY5NCA4LjI1IDEzLjcxMjEgOC4yNUMxNS4zMDUyIDguMjUgMTYuNDEyNiA2LjY1MDcgMTUuODM4NiA1LjE2NDYxTDE0LjcxMjYgMi4yNUgzLjMxNjk2TDIuMTkwODcgNS4xNjYyMloiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=",
    "salesDashboard": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNS4zNzUgNS4yNDk4OUw5IDEuNUwyLjYyNSA1LjI0OTg5VjEyLjc0OTlMOSAxNi41TDE1LjM3NSAxMi43NDk5VjUuMjQ5ODlaIiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNOSA4LjI1VjExLjI1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzMiIGQ9Ik0xMiA2Ljc1VjExLjI1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzQiIGQ9Ik02IDkuNzVWMTEuMjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9zdmc+Cg==",
    "scriptLibrary": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIuODEyNSAxNC41MzVMNC44MDgyNSAxMi45Mzc1SDE0LjA2MjVDMTQuMzYwOSAxMi45Mzc1IDE0LjY0NyAxMi44MTkgMTQuODU4IDEyLjYwOEMxNS4wNjkgMTIuMzk3IDE1LjE4NzUgMTIuMTEwOSAxNS4xODc1IDExLjgxMjVWNC41QzE1LjE4NzUgNC4yMDE2MyAxNS4wNjkgMy45MTU0OCAxNC44NTggMy43MDQ1QzE0LjY0NyAzLjQ5MzUzIDE0LjM2MDkgMy4zNzUgMTQuMDYyNSAzLjM3NUgzLjkzNzVDMy42MzkxMyAzLjM3NSAzLjM1Mjk4IDMuNDkzNTMgMy4xNDIgMy43MDQ1QzIuOTMxMDMgMy45MTU0OCAyLjgxMjUgNC4yMDE2MyAyLjgxMjUgNC41VjE0LjUzNVpNNS4yMDMxMiAxNC4wNjI1TDIuNjAxIDE2LjE0MzhDMi41MTgyOSAxNi4yMDk4IDIuNDE4NjIgMTYuMjUxMiAyLjMxMzQ1IDE2LjI2MzFDMi4yMDgyOCAxNi4yNzUgMi4xMDE4OCAxNi4yNTcxIDIuMDA2NDcgMTYuMjExMkMxLjkxMTA2IDE2LjE2NTQgMS44MzA1MSAxNi4wOTM2IDEuNzc0MDkgMTYuMDA0MUMxLjcxNzY2IDE1LjkxNDUgMS42ODc2NSAxNS44MTA4IDEuNjg3NSAxNS43MDVWNC41QzEuNjg3NSAzLjkwMzI2IDEuOTI0NTUgMy4zMzA5NyAyLjM0NjUxIDIuOTA5MDFDMi43Njg0NyAyLjQ4NzA1IDMuMzQwNzYgMi4yNSAzLjkzNzUgMi4yNUgxNC4wNjI1QzE0LjY1OTIgMi4yNSAxNS4yMzE1IDIuNDg3MDUgMTUuNjUzNSAyLjkwOTAxQzE2LjA3NTQgMy4zMzA5NyAxNi4zMTI1IDMuOTAzMjYgMTYuMzEyNSA0LjVWMTEuODEyNUMxNi4zMTI1IDEyLjQwOTIgMTYuMDc1NCAxMi45ODE1IDE1LjY1MzUgMTMuNDAzNUMxNS4yMzE1IDEzLjgyNTQgMTQuNjU5MiAxNC4wNjI1IDE0LjA2MjUgMTQuMDYyNUg1LjIwMzEyWiIgZmlsbD0iIzYxNzA4OCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik02LjE4NzUgOUgxMS44MTI1QzEyLjE4NzUgOSAxMi4zNzUgOS4xODc1IDEyLjM3NSA5LjU2MjVDMTIuMzc1IDkuOTM3NSAxMi4xODc1IDEwLjEyNSAxMS44MTI1IDEwLjEyNUg2LjE4NzVDNS44MTI1IDEwLjEyNSA1LjYyNSA5LjkzNzUgNS42MjUgOS41NjI1QzUuNjI1IDkuMTg3NSA1LjgxMjUgOSA2LjE4NzUgOVpNNi4xODc1IDUuNjI1SDExLjgxMjVDMTIuMTg3NSA1LjYyNSAxMi4zNzUgNS44MTI1IDEyLjM3NSA2LjE4NzVDMTIuMzc1IDYuNTYyNSAxMi4xODc1IDYuNzUgMTEuODEyNSA2Ljc1SDYuMTg3NUM1LjgxMjUgNi43NSA1LjYyNSA2LjU2MjUgNS42MjUgNi4xODc1QzUuNjI1IDUuODEyNSA1LjgxMjUgNS42MjUgNi4xODc1IDUuNjI1WiIgZmlsbD0iIzYxNzA4OCIvPgo8L2c+Cjwvc3ZnPgo=",
    "session": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE1Ljc1IDkuMzAxNVY5QzE1Ljc1IDguMTEzNTggMTUuNTc1NCA3LjIzNTgzIDE1LjIzNjIgNi40MTY4OUMxNC44OTcgNS41OTc5NCAxNC4zOTk4IDQuODUzODIgMTMuNzczIDQuMjI3MDNDMTMuMTQ2MiAzLjYwMDIzIDEyLjQwMjEgMy4xMDMwMyAxMS41ODMxIDIuNzYzODFDMTAuNzY0MiAyLjQyNDU5IDkuODg2NDIgMi4yNSA5IDIuMjVDOC4xMTM1OCAyLjI1IDcuMjM1ODMgMi40MjQ1OSA2LjQxNjg5IDIuNzYzODFDNS41OTc5NCAzLjEwMzAzIDQuODUzODIgMy42MDAyMyA0LjIyNzAzIDQuMjI3MDNDMy42MDAyMyA0Ljg1MzgyIDMuMTAzMDMgNS41OTc5NCAyLjc2MzgxIDYuNDE2ODlDMi40MjQ1OSA3LjIzNTgzIDIuMjUgOC4xMTM1OCAyLjI1IDlWOS4zMDE1QzIuNTkyMDQgOS4xMDQwMiAyLjk4MDAzIDkuMDAwMDYgMy4zNzQ5OSA5LjAwMDA2QzMuNzY5OTQgOS4wMDAwNSA0LjE1NzkzIDkuMTA0MDEgNC40OTk5OCA5LjMwMTQ5QzQuODQyMDIgOS40OTg5NiA1LjEyNjA1IDkuNzgyOTkgNS4zMjM1NCAxMC4xMjVDNS41MjEwMiAxMC40NjcxIDUuNjI0OTkgMTAuODU1IDUuNjI1IDExLjI1VjEzLjVDNS42MjUgMTQuMDk2NyA1LjM4Nzk1IDE0LjY2OSA0Ljk2NTk5IDE1LjA5MUM0LjU0NDAzIDE1LjUxMjkgMy45NzE3NCAxNS43NSAzLjM3NSAxNS43NUMyLjc3ODI2IDE1Ljc1IDIuMjA1OTcgMTUuNTEyOSAxLjc4NDAxIDE1LjA5MUMxLjM2MjA1IDE0LjY2OSAxLjEyNSAxNC4wOTY3IDEuMTI1IDEzLjVWOUMxLjEyNSA2LjkxMTQyIDEuOTU0NjkgNC45MDgzOCAzLjQzMTUzIDMuNDMxNTNDNC45MDgzOCAxLjk1NDY5IDYuOTExNDIgMS4xMjUgOSAxLjEyNUMxMS4wODg2IDEuMTI1IDEzLjA5MTYgMS45NTQ2OSAxNC41Njg1IDMuNDMxNTNDMTYuMDQ1MyA0LjkwODM4IDE2Ljg3NSA2LjkxMTQyIDE2Ljg3NSA5VjEzLjVDMTYuODc1IDE0LjA5NjcgMTYuNjM3OSAxNC42NjkgMTYuMjE2IDE1LjA5MUMxNS43OTQgMTUuNTEyOSAxNS4yMjE3IDE1Ljc1IDE0LjYyNSAxNS43NUMxNC4wMjgzIDE1Ljc1IDEzLjQ1NiAxNS41MTI5IDEzLjAzNCAxNS4wOTFDMTIuNjEyMSAxNC42NjkgMTIuMzc1IDE0LjA5NjcgMTIuMzc1IDEzLjVWMTEuMjVDMTIuMzc1IDEwLjg1NSAxMi40NzkgMTAuNDY3MSAxMi42NzY1IDEwLjEyNUMxMi44NzM5IDkuNzgyOTkgMTMuMTU4IDkuNDk4OTYgMTMuNSA5LjMwMTQ5QzEzLjg0MjEgOS4xMDQwMSAxNC4yMzAxIDkuMDAwMDUgMTQuNjI1IDkuMDAwMDZDMTUuMDIgOS4wMDAwNiAxNS40MDggOS4xMDQwMiAxNS43NSA5LjMwMTVaTTE1Ljc1IDExLjI1QzE1Ljc1IDEwLjk1MTYgMTUuNjMxNSAxMC42NjU1IDE1LjQyMDUgMTAuNDU0NUMxNS4yMDk1IDEwLjI0MzUgMTQuOTIzNCAxMC4xMjUgMTQuNjI1IDEwLjEyNUMxNC4zMjY2IDEwLjEyNSAxNC4wNDA1IDEwLjI0MzUgMTMuODI5NSAxMC40NTQ1QzEzLjYxODUgMTAuNjY1NSAxMy41IDEwLjk1MTYgMTMuNSAxMS4yNVYxMy41QzEzLjUgMTMuNzk4NCAxMy42MTg1IDE0LjA4NDUgMTMuODI5NSAxNC4yOTU1QzE0LjA0MDUgMTQuNTA2NSAxNC4zMjY2IDE0LjYyNSAxNC42MjUgMTQuNjI1QzE0LjkyMzQgMTQuNjI1IDE1LjIwOTUgMTQuNTA2NSAxNS40MjA1IDE0LjI5NTVDMTUuNjMxNSAxNC4wODQ1IDE1Ljc1IDEzLjc5ODQgMTUuNzUgMTMuNVYxMS4yNVpNMi4yNSAxMS4yNVYxMy41QzIuMjUgMTMuNzk4NCAyLjM2ODUzIDE0LjA4NDUgMi41Nzk1IDE0LjI5NTVDMi43OTA0OCAxNC41MDY1IDMuMDc2NjMgMTQuNjI1IDMuMzc1IDE0LjYyNUMzLjY3MzM3IDE0LjYyNSAzLjk1OTUyIDE0LjUwNjUgNC4xNzA1IDE0LjI5NTVDNC4zODE0NyAxNC4wODQ1IDQuNSAxMy43OTg0IDQuNSAxMy41VjExLjI1QzQuNSAxMC45NTE2IDQuMzgxNDcgMTAuNjY1NSA0LjE3MDUgMTAuNDU0NUMzLjk1OTUyIDEwLjI0MzUgMy42NzMzNyAxMC4xMjUgMy4zNzUgMTAuMTI1QzMuMDc2NjMgMTAuMTI1IDIuNzkwNDggMTAuMjQzNSAyLjU3OTUgMTAuNDU0NUMyLjM2ODUzIDEwLjY2NTUgMi4yNSAxMC45NTE2IDIuMjUgMTEuMjVaIiBmaWxsPSIjNjE3MDg4Ii8+CjwvZz4KPC9zdmc+Cg==",
    "leads": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTExLjI1IDYuNzVWNy44NzVINy44NzVDNy4yNzgyNiA3Ljg3NSA2LjcwNTk3IDguMTEyMDUgNi4yODQwMSA4LjUzNDAxQzUuODYyMDUgOC45NTU5NyA1LjYyNSA5LjUyODI2IDUuNjI1IDEwLjEyNVYxMi4zNzVDNS42MjUgMTIuOTcxNyA1Ljg2MjA1IDEzLjU0NCA2LjI4NDAxIDEzLjk2NkM2LjcwNTk3IDE0LjM4NzkgNy4yNzgyNiAxNC42MjUgNy44NzUgMTQuNjI1SDEzLjVDMTQuMDk2NyAxNC42MjUgMTQuNjY5IDE0LjM4NzkgMTUuMDkxIDEzLjk2NkMxNS41MTI5IDEzLjU0NCAxNS43NSAxMi45NzE3IDE1Ljc1IDEyLjM3NVYxMC4xMjVDMTUuNzUgOS43MzAwNSAxNS42NDYgOS4zNDIwNiAxNS40NDg1IDkuMDAwMDNDMTUuMjUxMSA4LjY1OCAxNC45NjcgOC4zNzM5NyAxNC42MjUgOC4xNzY1VjYuOTQxMjVDMTUuOTM1NiA3LjQwNDc1IDE2Ljg3NSA4LjY1NDYyIDE2Ljg3NSAxMC4xMjM5VjEyLjM3MzlDMTYuODc1IDEzLjI2OSAxNi41MTk0IDE0LjEyNzQgMTUuODg2NSAxNC43NjA0QzE1LjI1MzYgMTUuMzkzMyAxNC4zOTUxIDE1Ljc0ODkgMTMuNSAxNS43NDg5SDcuODc1QzYuOTc5ODkgMTUuNzQ4OSA2LjEyMTQ1IDE1LjM5MzMgNS40ODg1MSAxNC43NjA0QzQuODU1NTggMTQuMTI3NCA0LjUgMTMuMjY5IDQuNSAxMi4zNzM5VjEwLjEyNUM0LjUgOS4yMjk4OSA0Ljg1NTU4IDguMzcxNDUgNS40ODg1MSA3LjczODUxQzYuMTIxNDUgNy4xMDU1OCA2Ljk3OTg5IDYuNzUgNy44NzUgNi43NUgxMS4yNVoiIGZpbGw9IiM2MTcwODgiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNNi43NSAxMS4yNVYxMC4xMjVIMTAuMTI1QzEwLjcyMTcgMTAuMTI1IDExLjI5NCA5Ljg4Nzk1IDExLjcxNiA5LjQ2NTk5QzEyLjEzNzkgOS4wNDQwMyAxMi4zNzUgOC40NzE3NCAxMi4zNzUgNy44NzVWNS42MjVDMTIuMzc1IDUuMDI4MjYgMTIuMTM3OSA0LjQ1NTk3IDExLjcxNiA0LjAzNDAxQzExLjI5NCAzLjYxMjA1IDEwLjcyMTcgMy4zNzUgMTAuMTI1IDMuMzc1SDQuNUMzLjkwMzI2IDMuMzc1IDMuMzMwOTcgMy42MTIwNSAyLjkwOTAxIDQuMDM0MDFDMi40ODcwNSA0LjQ1NTk3IDIuMjUgNS4wMjgyNiAyLjI1IDUuNjI1VjcuODc1QzIuMjUwMDEgOC4yNjk5NSAyLjM1Mzk4IDguNjU3OTQgMi41NTE0NiA4Ljk5OTk3QzIuNzQ4OTQgOS4zNDIgMy4wMzI5NyA5LjYyNjAzIDMuMzc1IDkuODIzNVYxMS4wNTg3QzIuNzE2NzkgMTAuODI1OSAyLjE0Njk2IDEwLjM5NDYgMS43NDQwMSA5LjgyNDQ3QzEuMzQxMDUgOS4yNTQyOSAxLjEyNDc5IDguNTczMiAxLjEyNSA3Ljg3NVY1LjYyNUMxLjEyNSA0LjcyOTg5IDEuNDgwNTggMy44NzE0NSAyLjExMzUxIDMuMjM4NTFDMi43NDY0NSAyLjYwNTU4IDMuNjA0ODkgMi4yNSA0LjUgMi4yNUgxMC4xMjVDMTEuMDIwMSAyLjI1IDExLjg3ODYgMi42MDU1OCAxMi41MTE1IDMuMjM4NTFDMTMuMTQ0NCAzLjg3MTQ1IDEzLjUgNC43Mjk4OSAxMy41IDUuNjI1VjcuODc1QzEzLjUgOC43NzAxMSAxMy4xNDQ0IDkuNjI4NTUgMTIuNTExNSAxMC4yNjE1QzExLjg3ODYgMTAuODk0NCAxMS4wMjAxIDExLjI1IDEwLjEyNSAxMS4yNUg2Ljc1WiIgZmlsbD0iIzYxNzA4OCIvPgo8L2c+Cjwvc3ZnPgo=",
    "badgeOverview": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE1Ljc1IDUuNjI1SDIuMjVDMi4wNTEwOSA1LjYyNSAxLjg2MDMyIDUuNzA0MDIgMS43MTk2NyA1Ljg0NDY3QzEuNTc5MDIgNS45ODUzMiAxLjUgNi4xNzYwOSAxLjUgNi4zNzVWMTQuNjI1QzEuNSAxNS4wMzkgMS44MzYgMTUuMzc1IDIuMjUgMTUuMzc1SDE1Ljc1QzE1Ljk0ODkgMTUuMzc1IDE2LjEzOTcgMTUuMjk2IDE2LjI4MDMgMTUuMTU1M0MxNi40MjEgMTUuMDE0NyAxNi41IDE0LjgyMzkgMTYuNSAxNC42MjVWNi4zNzVDMTYuNSA2LjE3NjA5IDE2LjQyMSA1Ljk4NTMyIDE2LjI4MDMgNS44NDQ2N0MxNi4xMzk3IDUuNzA0MDIgMTUuOTQ4OSA1LjYyNSAxNS43NSA1LjYyNVoiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik00LjUgOUgxMS4yNU00LjUgMTJINy41TTkgMi42MjVMNiA1LjYyNUgxMkw5IDIuNjI1WiIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K",
    "badgeDetail": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE1Ljc1IDNIMi4yNUMyLjA1MTA5IDMgMS44NjAzMiAzLjA3OTAyIDEuNzE5NjcgMy4yMTk2N0MxLjU3OTAyIDMuMzYwMzIgMS41IDMuNTUxMDkgMS41IDMuNzVWMTQuMjVDMS41IDE0LjY2NCAxLjgzNiAxNSAyLjI1IDE1SDE1Ljc1QzE1Ljk0ODkgMTUgMTYuMTM5NyAxNC45MjEgMTYuMjgwMyAxNC43ODAzQzE2LjQyMSAxNC42Mzk3IDE2LjUgMTQuNDQ4OSAxNi41IDE0LjI1VjMuNzVDMTYuNSAzLjU1MTA5IDE2LjQyMSAzLjM2MDMyIDE2LjI4MDMgMy4yMTk2N0MxNi4xMzk3IDMuMDc5MDIgMTUuOTQ4OSAzIDE1Ljc1IDNaIiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNNi4zNzUgOS4zNzVDNi43NzI4MiA5LjM3NSA3LjE1NDM2IDkuMjE2OTYgNy40MzU2NiA4LjkzNTY2QzcuNzE2OTYgOC42NTQzNiA3Ljg3NSA4LjI3MjgyIDcuODc1IDcuODc1QzcuODc1IDcuNDc3MTggNy43MTY5NiA3LjA5NTY0IDcuNDM1NjYgNi44MTQzNEM3LjE1NDM2IDYuNTMzMDQgNi43NzI4MiA2LjM3NSA2LjM3NSA2LjM3NUM1Ljk3NzE4IDYuMzc1IDUuNTk1NjQgNi41MzMwNCA1LjMxNDM0IDYuODE0MzRDNS4wMzMwNCA3LjA5NTY0IDQuODc1IDcuNDc3MTggNC44NzUgNy44NzVDNC44NzUgOC4yNzI4MiA1LjAzMzA0IDguNjU0MzYgNS4zMTQzNCA4LjkzNTY2QzUuNTk1NjQgOS4yMTY5NiA1Ljk3NzE4IDkuMzc1IDYuMzc1IDkuMzc1WiIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMyIgZD0iTTguNjI1IDExLjYyNUM4LjYyNSAxMS4wMjgzIDguMzg3OTUgMTAuNDU2IDcuOTY1OTkgMTAuMDM0QzcuNTQ0MDMgOS42MTIwNSA2Ljk3MTc0IDkuMzc1IDYuMzc1IDkuMzc1QzUuNzc4MjYgOS4zNzUgNS4yMDU5NyA5LjYxMjA1IDQuNzg0MDEgMTAuMDM0QzQuMzYyMDUgMTAuNDU2IDQuMTI1IDExLjAyODMgNC4xMjUgMTEuNjI1TTEwLjUgNy41SDEzLjVNMTEuMjUgMTAuNUgxMy41IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=",
    "badgeManagement": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE0Ljc1IDguMjVWNC41QzE0Ljc1IDQuMTY4NDggMTQuNjE4MyAzLjg1MDU0IDE0LjM4MzkgMy42MTYxMkMxNC4xNDk1IDMuMzgxNyAxMy44MzE1IDMuMjUgMTMuNSAzLjI1SDQuNUM0LjE2ODQ4IDMuMjUgMy44NTA1NCAzLjM4MTcgMy42MTYxMiAzLjYxNjEyQzMuMzgxNyAzLjg1MDU0IDMuMjUgNC4xNjg0OCAzLjI1IDQuNVYxMy41QzMuMjUgMTMuODMxNSAzLjM4MTcgMTQuMTQ5NSAzLjYxNjEyIDE0LjM4MzlDMy44NTA1NCAxNC42MTgzIDQuMTY4NDggMTQuNzUgNC41IDE0Ljc1SDguMjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTYuMjUgN0gxMS43NU02LjI1IDEwSDguNzVNMTIuNzUgMTAuNVYxNS41TTEwLjI1IDEzSDE1LjI1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L2c+Cjwvc3ZnPgo=",
    "chargingDock": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJJY29uIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTQuNSA0LjYwNUM0LjUgNC41NzcxNSA0LjUxMTA2IDQuNTUwNDQgNC41MzA3NSA0LjUzMDc1QzQuNTUwNDQgNC41MTEwNiA0LjU3NzE1IDQuNSA0LjYwNSA0LjVIMTMuMzk1QzEzLjQwODggNC41IDEzLjQyMjQgNC41MDI3MiAxMy40MzUyIDQuNTA3OTlDMTMuNDQ3OSA0LjUxMzI3IDEzLjQ1OTUgNC41MjEgMTMuNDY5MiA0LjUzMDc1QzEzLjQ3OSA0LjU0MDUgMTMuNDg2NyA0LjU1MjA4IDEzLjQ5MiA0LjU2NDgyQzEzLjQ5NzMgNC41Nzc1NiAxMy41IDQuNTkxMjEgMTMuNSA0LjYwNVY5QzEzLjUgMTAuMTkzNSAxMy4wMjU5IDExLjMzODEgMTIuMTgyIDEyLjE4MkMxMS4zMzgxIDEzLjAyNTkgMTAuMTkzNSAxMy41IDkgMTMuNUM3LjgwNjUzIDEzLjUgNi42NjE5MyAxMy4wMjU5IDUuODE4MDIgMTIuMTgyQzQuOTc0MTEgMTEuMzM4MSA0LjUgMTAuMTkzNSA0LjUgOVY0LjYwNVoiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik03LjUgNC41VjEuNU0xMC41IDQuNVYxLjVNOC4yNSAxMC4xMjVIOS43NU05IDEzLjVWMTUuMzc1QzkgMTUuNjczNCA5LjExODUzIDE1Ljk1OTUgOS4zMjk1IDE2LjE3MDVDOS41NDA0OCAxNi4zODE1IDkuODI2NjMgMTYuNSAxMC4xMjUgMTYuNUgxNC4yNSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K",
    "recordingInspection": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0yLjI1IDUuMjVWNC41QzIuMjUgMy4yNTczNiAzLjI1NzM2IDIuMjUgNC41IDIuMjVIMTMuNUMxNC43NDI2IDIuMjUgMTUuNzUgMy4yNTczNiAxNS43NSA0LjVWNS4yNSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNMTIgNi43NVYxMS4yNSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNMTUgNy41VjEwLjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfNCIgZD0iTTkgNS42MjVWMTIuMzc1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzUiIGQ9Ik02IDYuNzVWMTEuMjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfNiIgZD0iTTMgNy41VjEwLjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfNyIgZD0iTTIuMjUgMTIuNzVWMTMuNUMyLjI1IDE0Ljc0MjYgMy4yNTczNiAxNS43NSA0LjUgMTUuNzVIMTMuNUMxNC43NDI2IDE1Ljc1IDE1Ljc1IDE0Ljc0MjYgMTUuNzUgMTMuNVYxMi43NSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K",
    "visits": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNC4yNSAxLjVIMy43NUMzLjMzNTc5IDEuNSAzIDEuODM1NzkgMyAyLjI1VjE1Ljc1QzMgMTYuMTY0MiAzLjMzNTc5IDE2LjUgMy43NSAxNi41SDE0LjI1QzE0LjY2NDIgMTYuNSAxNSAxNi4xNjQyIDE1IDE1Ljc1VjIuMjVDMTUgMS44MzU3OSAxNC42NjQyIDEuNSAxNC4yNSAxLjVaIiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik02IDEuNUg5LjM3NVY3LjVMNy42ODc1IDZMNiA3LjVWMS41WiIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNNiAxMC41SDkuNzUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfNCIgZD0iTTYgMTIuNzVIMTIiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjwvZz4KPC9zdmc+Cg==",
    "exportManagement": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNS43NSAxMC4xMjVDMTUuNzUgMTIuMzc1IDE0LjI1IDE2LjEyNSA5IDE2LjEyNUMzLjc1IDE2LjEyNSAyLjI1IDEyLjM3NSAyLjI1IDEwLjEyNSIgc3Ryb2tlPSIjMjU2M0VCIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNOS4wMDI5MiAxLjkxMjcyVjEyLjM3NSIgc3Ryb2tlPSIjMjU2M0VCIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNNC41IDYuMzc1TDkgMS44NzVMMTMuNSA2LjM3NSIgc3Ryb2tlPSIjMjU2M0VCIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K",
    "config": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzBfNTEpIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTkgMS41TDYuNzUgMy43NUgzLjc1VjYuNzVMMS41IDlMMy43NSAxMS4yNVYxNC4yNUg2Ljc1TDkgMTYuNUwxMS4yNSAxNC4yNUgxNC4yNVYxMS4yNUwxNi41IDlMMTQuMjUgNi43NVYzLjc1SDExLjI1TDkgMS41WiIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTkgMTEuMjVDMTAuMjQyNiAxMS4yNSAxMS4yNSAxMC4yNDI2IDExLjI1IDlDMTEuMjUgNy43NTczNiAxMC4yNDI2IDYuNzUgOSA2Ljc1QzcuNzU3MzYgNi43NSA2Ljc1IDcuNzU3MzYgNi43NSA5QzYuNzUgMTAuMjQyNiA3Ljc1NzM2IDExLjI1IDkgMTEuMjVaIiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8wXzUxIj4KPHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=",
    "system": "PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJGcmFtZSI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik00LjUgMTIuMzc1SDEuNVYyLjYyNUgxNi41VjEyLjM3NUgxMy41SDQuNVoiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzIiIGQ9Ik02IDguMjVWOS43NSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNOSAxMi4zNzVWMTQuNjI1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzQiIGQ9Ik05IDYuNzVWOS43NSIgc3Ryb2tlPSIjNjE3MDg4IiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl81IiBkPSJNMTIgNS4yNVY5Ljc1IiBzdHJva2U9IiM2MTcwODgiIHN0cm9rZS13aWR0aD0iMS4xMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBpZD0iVmVjdG9yXzYiIGQ9Ik00LjUgMTUuMzc1SDEzLjUiIHN0cm9rZT0iIzYxNzA4OCIgc3Ryb2tlLXdpZHRoPSIxLjEyNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9zdmc+Cg=="
  };
  // NAVIGATION_ICON_DATA_END
  const icons = Object.fromEntries(Object.entries(iconData).map(([name, data]) => [
    name, `<span class="nav-icon nav-icon-figma" data-nav-icon="${name}" aria-hidden="true" style="--nav-icon-image:url('data:image/svg+xml;base64,${data}')"></span>`
  ]));

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
      { page: 'device-management', route: 'management', label: '工牌管理', path: 'device-management/index.html#management', icon: icons.badgeManagement },
      { page: 'device-docks', route: 'docks', label: '充电坞', path: 'device-management/index.html#docks', icon: icons.chargingDock },
      { page: 'device-dashboard', route: 'dashboard', label: '录音排查', path: 'device-management/index.html#dashboard', icon: icons.recordingInspection },
      { page: 'device-visits', route: 'visits', label: '到访明细', path: 'device-management/index.html#visits', icon: icons.visits }
    ] },
    { label: '管理', items: [
      { page: 'export-management', label: '导出管理', path: 'export-management/index.html', icon: icons.exportManagement },
      { page: 'config', label: '质检配置', path: 'config/index.html', icon: icons.config },
      { page: 'system', label: '系统管理', path: 'system/index.html', icon: icons.system }
    ] }
  ];

  function ensureUnifiedNavigationStyles() {
    if (document.querySelector('[data-unified-navigation-styles]')) return;
    const style = document.createElement('style');
    style.dataset.unifiedNavigationStyles = '';
    style.textContent = `
      .sidebar [data-unified-navigation] .nav-icon-figma {
        display: block;
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        background-color: currentColor;
        -webkit-mask: var(--nav-icon-image) center / contain no-repeat;
        mask: var(--nav-icon-image) center / contain no-repeat;
      }

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
      if (route === 'store-visits') return 'device-dashboard';
      return `device-${['stores', 'badges', 'management', 'docks', 'dashboard', 'visits'].includes(route) ? route : 'stores'}`;
    }
    if (pathname.includes('/客户洞察/v2/')) return 'customer-insight';
    if (pathname.includes('/factory-dashboard/')) return 'factory-dashboard';
    if (pathname.includes('/store-dashboard/')) return 'dashboard';
    if (pathname.includes('/sales-dashboard/')) return 'sales-dashboard';
    if (pathname.includes('/script-library/')) return 'script-library';
    if (pathname.includes('/session/')) return 'session';
    if (pathname.includes('/leads/')) return 'leads';
    if (pathname.includes('/export-management/')) return 'export-management';
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

  }

  ensureUnifiedNavigationStyles();
  renderNavigation();

  const navButtons = Array.from(document.querySelectorAll('.nav-button'));
  if (!navButtons.length) return;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.nav-button');
    if (!button || !button.dataset.href) return;

    if (button.dataset.page === 'export-management' || getCurrentNavigationPage() === 'export-management') {
      event.preventDefault(); event.stopImmediatePropagation(); window.location.href = button.dataset.href; return;
    }
    const isDevicePage = getCurrentNavigationPage().startsWith('device-');
    if (button.dataset.page?.startsWith('device-')) {
      if (isDevicePage) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = button.dataset.href;
      return;
    }

    if (button.dataset.page === 'customer-insight' || getCurrentNavigationPage() === 'customer-insight') {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = button.dataset.href;
    }
  }, true);

})();
