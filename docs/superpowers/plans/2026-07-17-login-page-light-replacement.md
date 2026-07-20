# 浅色登录页替换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用已确认的浅色 AI 质检登录页完整替换旧页面，同时保留 `admin/admin` 校验和登录后看板跳转。

**Architecture:** 继续使用项目现有的 HTML/CSS/JS 分离结构。`index.html` 只负责语义化页面结构，`login.css` 负责参考页视觉与状态样式，`login.js` 负责 Canvas 声波、表单校验、加载状态和跳转。

**Tech Stack:** 原生 HTML5、CSS3、JavaScript、Canvas 2D、Node.js `node:test`

## Global Constraints

- 参考视觉来自 `/Users/linxianxin/Downloads/login-design-light.html`，实施结果不得在运行时依赖 Downloads 目录。
- 完整保留参考页的文案、示例卡片、Canvas 声波和 1240px / 860px / 520px 响应式断点。
- 原登录页的视觉结构、3D 倾斜和密码显隐交互不保留。
- 租户、账号、密码必填；默认账号/密码为 `admin/admin`。
- 登录成功后跳转到 `./factory-dashboard/index.html`。
- 只修改登录页相关文件、对应测试和交接日志。

---

## File Structure

- Create: `tests/login-page.test.js` — 登录页静态结构、样式与脚本合约测试。
- Modify: `index.html` — 浅色登录页结构、文案、SVG 图标和两张示例卡。
- Modify: `login.css` — 参考页完整样式，加上错误、加载和禁用状态。
- Modify: `login.js` — Canvas 声波、必填校验、`admin/admin` 校验与成功跳转。
- Modify: `../handoff-log.md` — 根目录当前摘要和最近工作记录。
- Modify when needed: `../handoff-archive.md` — 将超过最近 5 条的记录移入归档。

---

### Task 1: 替换页面结构和浅色样式

**Files:**
- Create: `tests/login-page.test.js`
- Modify: `index.html`
- Modify: `login.css`

**Interfaces:**
- Consumes: `/Users/linxianxin/Downloads/login-design-light.html` 中的页面结构和 `<style>` 规则。
- Produces: `#login-form`、`#tenant`、`#account`、`#password`、`#login-btn`、`.field-error`、`#wave`，供 `login.js` 绑定。

- [ ] **Step 1: 先写页面结构和样式合约测试**

```js
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
```

- [ ] **Step 2: 运行测试，确认它在旧页上按预期失败**

Run: `node --test tests/login-page.test.js`

Expected: FAIL，失败原因包含缺少 `.stage`、`#wave`、`.pitch-copy` 或新响应式规则，而不是语法错误。

- [ ] **Step 3: 用参考页结构替换 `index.html`**

使用参考页从 `<div class="stage">` 到页尾的完整结构，只做以下表单适配：

```html
<link rel="stylesheet" href="login.css" />

<form id="login-form" autocomplete="off" novalidate>
  <div class="field" id="field-tenant">
    <label for="tenant">租户</label>
    <div class="control">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/></svg>
      <input id="tenant" type="text" value="AI质检管理" autocomplete="organization"
        aria-describedby="tenant-error" aria-invalid="false" />
    </div>
    <span class="field-error" id="tenant-error" aria-live="polite">请输入租户</span>
  </div>
  <div class="field" id="field-account">
    <label for="account">账号</label>
    <div class="control">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6"/></svg>
      <input id="account" type="text" placeholder="请输入账号" autocomplete="username"
        aria-describedby="account-error" aria-invalid="false" />
    </div>
    <span class="field-error" id="account-error" aria-live="polite">账号错误</span>
  </div>
  <div class="field" id="field-password">
    <label for="password">密码</label>
    <div class="control">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.4" r="1.3"/></svg>
      <input id="password" type="password" placeholder="请输入密码" autocomplete="current-password"
        aria-describedby="password-error" aria-invalid="false" />
    </div>
    <span class="field-error" id="password-error" aria-live="polite">密码错误</span>
  </div>
  <button class="submit" id="login-btn" type="submit">
    <span class="submit-label">登 录</span>
    <span class="submit-spinner" aria-hidden="true"></span>
  </button>
</form>

<script src="login.js"></script>
```

移除参考文件底部的内联 `<script>`，避免与 `login.js` 重复绘制 Canvas。

- [ ] **Step 4: 用参考样式替换 `login.css` 并补齐状态样式**

将参考页 `<style>` 中的全部规则移入 `login.css`，然后增加：

```css
.field-error {
  min-height: 16px;
  margin-top: -2px;
  padding-left: 2px;
  color: var(--no);
  font-size: 11.5px;
  line-height: 1.35;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity .18s, transform .18s;
}

.field.has-error .field-error { opacity: 1; transform: none; }
.field.has-error .control input {
  border-color: var(--no);
  background: rgba(239, 68, 68, .035);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .10);
}

.submit-spinner {
  display: none;
  width: 18px;
  height: 18px;
  margin: 0 auto;
  border: 2px solid rgba(255, 255, 255, .45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: submit-spin .7s linear infinite;
}

.submit.loading .submit-label { display: none; }
.submit.loading .submit-spinner { display: block; }
.submit:disabled { cursor: wait; filter: saturate(.85); }
@keyframes submit-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 5: 运行结构测试，确认第一组合约通过**

Run: `node --test tests/login-page.test.js`

Expected: 3 tests PASS，0 tests FAIL。

- [ ] **Step 6: 提交页面结构和样式**

```bash
git add index.html login.css tests/login-page.test.js
git commit -m "feat: 替换浅色登录页布局"
```

---

### Task 2: 接回登录校验、加载状态和 Canvas 声波

**Files:**
- Modify: `tests/login-page.test.js`
- Modify: `login.js`

**Interfaces:**
- Consumes: Task 1 产出的 `#login-form`、`#tenant`、`#account`、`#password`、`#login-btn`、`.field`、`.field-error`、`#wave`。
- Produces: `setFieldError(input, message)`、`clearFieldError(input)`、`setSubmitting(button, isSubmitting)` 和 `initWaveCanvas(canvas)` 页面内部函数。

- [ ] **Step 1: 先增加脚本行为合约测试**

在 `tests/login-page.test.js` 末尾加入：

```js
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
  assert.match(script, /requestAnimationFrame\(draw\)/);
  assert.doesNotMatch(script, /brandPanel/);
  assert.doesNotMatch(script, /pwdToggle/);
});

test('login script prevents duplicate submissions while loading', () => {
  assert.match(script, /button\.disabled = isSubmitting/);
  assert.match(script, /button\.classList\.toggle\('loading', isSubmitting\)/);
});
```

- [ ] **Step 2: 运行测试，确认旧脚本不符合新合约**

Run: `node --test tests/login-page.test.js`

Expected: 新增 3 项至少 1 项 FAIL，失败原因为缺少 `initWaveCanvas`、仍包含 `brandPanel` / `pwdToggle`，或缺少防重复提交逻辑。

- [ ] **Step 3: 用新页面逻辑替换 `login.js`**

脚本使用以下明确结构：

```js
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
```

`initWaveCanvas(canvas)` 函数内使用参考文件已确认的完整 Canvas 实现，不修改颜色、声波数量、扫描节奏或动效幅度。

- [ ] **Step 4: 运行专项测试和脚本语法检查**

Run: `node --test tests/login-page.test.js && node --check login.js`

Expected: 6 tests PASS，0 tests FAIL；`node --check` 退出码为 0。

- [ ] **Step 5: 提交新登录逻辑**

```bash
git add login.js tests/login-page.test.js
git commit -m "feat: 接入浅色登录页交互"
```

---

### Task 3: 全量回归、视觉验收与交接记录

**Files:**
- Modify: `../handoff-log.md`
- Modify when needed: `../handoff-archive.md`

**Interfaces:**
- Consumes: Task 1 的新页面和 Task 2 的登录逻辑。
- Produces: 可交付的登录页、完整验证证据和最新交接摘要。

- [ ] **Step 1: 运行登录页专项测试**

Run: `node --test tests/login-page.test.js`

Expected: 6 tests PASS，0 tests FAIL。

- [ ] **Step 2: 运行全量自动化测试**

Run: `node --test tests/*.test.js`

Expected: 全部测试 PASS，0 tests FAIL。

- [ ] **Step 3: 运行语法与差异检查**

Run: `node --check login.js && git diff --check`

Expected: 两个命令退出码均为 0，无语法错误和多余空白。

- [ ] **Step 4: 用真实浏览器验收桌面端和窄屏布局**

桌面端检查：

- 1600px 左右宽度下可见品牌、价值文案、两张示例卡、分隔线、登录卡和底部合规信息。
- 声波背景正常绘制，没有遮挡文字或输入框。
- 表单三个输入框与登录按钮对齐，无裁切或重叠。

窄屏检查：

- 860px 以下改为单列，登录卡居中。
- 520px 以下隐藏次要介绍，页面可正常滚动。

- [ ] **Step 5: 验收登录行为**

1. 清空租户、账号、密码并提交，三个字段各自显示错误。
2. 输入错误账号或密码，只在错误字段显示“账号错误”或“密码错误”。
3. 输入 `admin/admin`，按钮进入加载态且不能重复提交。
4. 页面最终跳转到 `factory-dashboard/index.html`。

- [ ] **Step 6: 更新根目录交接日志**

将当前摘要更新为本轮替换结果，记录：

- 用户要求用浅色参考页替换旧登录页。
- 实际修改的 HTML、CSS、JS 和测试文件。
- 专项测试、全量测试、语法检查和浏览器验收结果。
- 仍存在的模拟登录风险：账号与密码在前端硬编码，不是真实鉴权。

- [ ] **Step 7: 检查最终改动范围**

Run: `git status --short && git diff --stat HEAD~2..HEAD`

Expected: 业务改动仅包含 `index.html`、`login.css`、`login.js`、`tests/login-page.test.js`；原有的 `.gitignore`、`.trae`、交接归档与删除文档状态不被纳入这两个功能提交。
