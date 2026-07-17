document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_ACCOUNT = 'admin';
  const DEFAULT_PASSWORD = 'admin';

  function setFieldError(input, message) {
    const field = input.closest('.field');
    const error = field.querySelector('.field-error');
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    error.textContent = message;
  }

  function clearFieldError(input) {
    const field = input.closest('.field');
    field.classList.remove('has-error');
    input.setAttribute('aria-invalid', 'false');
  }

  function setSubmitting(button, isSubmitting) {
    button.disabled = isSubmitting;
    button.classList.toggle('loading', isSubmitting);
    button.setAttribute('aria-busy', String(isSubmitting));
  }

  function initWaveCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const barCount = 88;
    const seed = Array.from({ length: barCount }, (_, index) => {
      const shape = 0.55 + 0.28 * Math.sin(index * 0.20) + 0.17 * Math.sin(index * 0.071 + 1.3);
      const jitter = (Math.sin(index * 91.7) * 43758.5 % 1 + 1) % 1;
      return Math.max(0.14, Math.min(1, shape * 0.82 + jitter * 0.12));
    });

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }

    const from = [0x25, 0x63, 0xEB];
    const to = [0x38, 0xBD, 0xF8];
    const color = (position, alpha) => `rgba(${Math.round(from[0] + (to[0] - from[0]) * position)},${Math.round(from[1] + (to[1] - from[1]) * position)},${Math.round(from[2] + (to[2] - from[2]) * position)},${alpha})`;

    function roundedRect(context, x, y, rectWidth, rectHeight, radius) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, radius);
      context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, radius);
      context.arcTo(x, y + rectHeight, x, y, radius);
      context.arcTo(x, y, x + rectWidth, y, radius);
      context.closePath();
    }

    function draw(time = 0) {
      ctx.clearRect(0, 0, width, height);
      const centerY = height * 0.5;
      const step = width / barCount;
      const barWidth = step * 0.30;
      const scan = ((time % 8200) / 8200) * 1.2 - 0.1;
      const scanX = scan * width;

      for (let index = 0; index < barCount; index += 1) {
        const x = index * step + step * 0.5;
        const position = index / (barCount - 1);
        const breathe = reduce ? 1 : 0.68 + 0.32 * Math.sin(time * 0.0014 + index * 0.30);
        const distance = Math.abs(x - scanX) / width;
        const boost = Math.max(0, 1 - distance * 10);
        const barHeight = seed[index] * (height * 0.24) * breathe * (1 + boost * 0.55);
        ctx.fillStyle = color(position, 0.13 + boost * 0.34);
        roundedRect(ctx, x - barWidth / 2, centerY - barHeight, barWidth, barHeight * 2, Math.min(barWidth / 2, 3 * dpr));
        ctx.fill();
      }

      if (!reduce && scan > -0.05 && scan < 1.05) {
        const gradient = ctx.createLinearGradient(scanX - 46 * dpr, 0, scanX + 46 * dpr, 0);
        gradient.addColorStop(0, 'rgba(37,99,235,0)');
        gradient.addColorStop(0.5, 'rgba(37,99,235,.12)');
        gradient.addColorStop(1, 'rgba(37,99,235,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(scanX - 46 * dpr, centerY - height * 0.28, 92 * dpr, height * 0.56);
      }

      if (!reduce) window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    window.requestAnimationFrame(draw);
  }

  const canvas = document.getElementById('wave');
  if (canvas) initWaveCanvas(canvas);

  const form = document.getElementById('login-form');
  const button = document.getElementById('login-btn');
  const tenantEl = document.getElementById('tenant');
  const accountEl = document.getElementById('account');
  const passwordEl = document.getElementById('password');
  const inputs = [tenantEl, accountEl, passwordEl];

  inputs.forEach((input) => input.addEventListener('input', () => clearFieldError(input)));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (button.disabled) return;

    let hasError = false;
    if (!tenantEl.value.trim()) {
      setFieldError(tenantEl, '请输入租户');
      hasError = true;
    }
    if (!accountEl.value.trim()) {
      setFieldError(accountEl, '请输入账号');
      hasError = true;
    }
    if (!passwordEl.value) {
      setFieldError(passwordEl, '请输入密码');
      hasError = true;
    }
    if (hasError) return;

    const accountOk = accountEl.value.trim() === DEFAULT_ACCOUNT;
    const passwordOk = passwordEl.value === DEFAULT_PASSWORD;
    if (!accountOk) setFieldError(accountEl, '账号错误');
    if (!passwordOk) setFieldError(passwordEl, '密码错误');
    if (!accountOk || !passwordOk) return;

    setSubmitting(button, true);
    setTimeout(() => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity .4s';
      setTimeout(() => {
        window.location.href = './factory-dashboard/index.html';
      }, 400);
    }, 1200);
  });
});
