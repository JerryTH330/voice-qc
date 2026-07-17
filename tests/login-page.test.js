const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'login.css'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'login.js'), 'utf8');

test('login page uses the approved light layout and removes the legacy layout', () => {
  assert.match(html, /class="stage"/);
  assert.match(html, /id="wave"/);
  assert.match(html, /class="pitch-copy"/);
  assert.match(html, /class="cards"/);
  assert.match(html, /class="auth"/);
  assert.ok(html.includes('让每一通销售通话'));
  assert.ok(html.includes('同一通电话 · AI 产出'));
  assert.doesNotMatch(html, /class="login-layout"/);
  assert.doesNotMatch(html, /class="brand-panel"/);
});

test('login form exposes stable ids and accessible errors for the login script', () => {
  assert.match(html, /<form[^>]*id="login-form"[^>]*novalidate/);
  assert.match(html, /id="tenant"[^>]*value="AI质检管理"/);
  assert.match(html, /id="account"[^>]*autocomplete="username"/);
  assert.match(html, /id="password"[^>]*autocomplete="current-password"/);
  assert.match(html, /id="login-btn"/);
  assert.equal((html.match(/class="field-error"/g) || []).length, 3);
  assert.match(html, /aria-live="polite"/);
});

test('light stylesheet keeps reference breakpoints and adds login states', () => {
  assert.match(css, /@media \(max-width:1240px\)/);
  assert.match(css, /@media \(max-width:860px\)/);
  assert.match(css, /@media \(max-width:520px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.field\.has-error[\s\S]*?\.control input/);
  assert.match(css, /\.submit\.loading/);
  assert.match(css, /\.submit:disabled/);
});

test('login script preserves credentials, field validation and destination', () => {
  assert.match(script, /const DEFAULT_ACCOUNT = 'admin'/);
  assert.match(script, /const DEFAULT_PASSWORD = 'admin'/);
  assert.match(script, /getElementById\('tenant'\)/);
  assert.match(script, /getElementById\('account'\)/);
  assert.match(script, /getElementById\('password'\)/);
  assert.match(script, /setFieldError\(tenantEl, '\u8bf7\u8f93\u5165\u79df\u6237'\)/);
  assert.match(script, /setFieldError\(accountEl, '\u8d26\u53f7\u9519\u8bef'\)/);
  assert.match(script, /setFieldError\(passwordEl, '\u5bc6\u7801\u9519\u8bef'\)/);
  assert.match(script, /window\.location\.href = '\.\/factory-dashboard\/index\.html'/);
});

test('login script owns the canvas animation and removes legacy-only interactions', () => {
  assert.match(script, /function initWaveCanvas\(canvas\)/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /requestAnimationFrame\(animate\)/);
  assert.doesNotMatch(script, /brandPanel/);
  assert.doesNotMatch(script, /pwdToggle/);
});

test('login script prevents duplicate submissions while loading', () => {
  assert.match(script, /button\.disabled = isSubmitting/);
  assert.match(script, /button\.classList\.toggle\('loading', isSubmitting\)/);
});

test('login page keeps error announcements empty until validation fails', () => {
  assert.match(html, /id="tenant-error" aria-live="polite"><\/span>/);
  assert.match(html, /id="account-error" aria-live="polite"><\/span>/);
  assert.match(html, /id="password-error" aria-live="polite"><\/span>/);
  assert.match(script, /function clearFieldError\(input\)[\s\S]*?error\.textContent = '';/);
});

test('login button has an accessible loading name', () => {
  assert.match(html, /id="login-btn"[^>]*aria-label="登录"/);
  assert.match(script, /button\.setAttribute\('aria-label', isSubmitting \? '登录中' : '登录'\)/);
});

test('wave redraws after resize in reduced-motion mode and handles preference changes', () => {
  assert.match(script, /const mediaQuery = window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(script, /function resize\(\) \{[\s\S]*?if \(reduce\) draw\(0\);/);
  assert.match(script, /mediaQuery\.addEventListener\('change', handleMotionChange\)/);
  assert.match(script, /window\.cancelAnimationFrame\(animationFrameId\)/);
});

test('brand uses the project logo instead of the waveform svg', () => {
  assert.match(html, /class="brand-logo"[^>]*src="\.\/assets\/ds-logo\.png"[^>]*alt=""/);
  const brandMatch = html.match(/<header class="brand">([\s\S]*?)<\/header>/);
  assert.ok(brandMatch);
  assert.doesNotMatch(brandMatch[1], /<svg/);
  assert.match(css, /\.brand-logo\s*{[\s\S]*?width:\s*36px;[\s\S]*?height:\s*36px;[\s\S]*?object-fit:\s*contain;/);
});

test('selling-point copy uses the available row width and wraps only when needed', () => {
  assert.match(css, /\.points li > div\s*{[\s\S]*?flex:\s*1;[\s\S]*?min-width:\s*0;/);
  assert.match(css, /\.points p\s*{[\s\S]*?max-width:\s*none;/);
  assert.doesNotMatch(css, /\.points p\s*{[\s\S]*?white-space:\s*nowrap;/);
});

test('login page does not use font sizes below 14px', () => {
  const fontSizes = [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]));
  const undersizedFonts = fontSizes.filter((size) => size < 14);

  assert.deepEqual(undersizedFonts, []);
});
