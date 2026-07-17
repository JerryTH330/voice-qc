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
