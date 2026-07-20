# Login Brand Logo and Copy Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在登录页品牌区显示项目 Logo，并让卖点说明文字按真实可用宽度自然换行。

**Architecture:** 仅调整静态 HTML 与 CSS。继续使用现有 `.brand` / `.mark` 结构，通过新 `.brand-logo` 显示图片；通过 flex 剩余空间控制卖点文案宽度。

**Tech Stack:** HTML5、CSS3、Node.js `node:test`

## Global Constraints

- Logo 必须使用 `./assets/ds-logo.png`。
- Logo 替换当前波形 SVG，不与它并列。
- Logo 显示尺寸为 36×36px，不重复朗读旁边的品牌名。
- 卖点说明不强制单行，只移除 360px 人工限制，窄屏时必须自然换行。
- 不改登录逻辑、文案内容和其他页面。

---

### Task 1: 替换 Logo 并释放卖点文案宽度

**Files:**
- Modify: `tests/login-page.test.js`
- Modify: `index.html`
- Modify: `login.css`

**Interfaces:**
- Consumes: `assets/ds-logo.png`、现有 `.brand .mark`、`.points li`。
- Produces: `.brand-logo` 图片节点与可伸缩的 `.points li > div` 文案区。

- [ ] **Step 1: 先写失败测试**

在 `tests/login-page.test.js` 末尾增加：

```js
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
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `node --test tests/login-page.test.js`

Expected: 2 个新测试 FAIL，原因为尚未使用 `.brand-logo`，且 `.points p` 仍为 `max-width:360px`。

- [ ] **Step 3: 替换品牌图标**

将 `index.html` 中 `.mark` 内的 SVG 替换为：

```html
<span class="mark" aria-hidden="true">
  <img class="brand-logo" src="./assets/ds-logo.png" alt="" />
</span>
```

- [ ] **Step 4: 调整 Logo 和文案宽度样式**

在 `login.css` 的品牌和卖点规则中使用：

```css
.brand-logo { width:36px; height:36px; display:block; object-fit:contain; }
.points li > div { flex:1; min-width:0; }
.points p { max-width:none; }
```

- [ ] **Step 5: 运行专项与全量测试**

Run: `node --test tests/login-page.test.js && node --test tests/*.test.js && git diff --check`

Expected: 登录页专项全部 PASS，全量测试全部 PASS，差异检查退出码为 0。

- [ ] **Step 6: 真实浏览器验收**

- 桌面宽度下 Logo 完整、清晰、与品牌文字对齐。
- 第一条卖点说明使用右侧剩余空间，只在宽度不足时换行。
- 500px 窄屏无横向溢出。

- [ ] **Step 7: 提交业务改动**

```bash
git add index.html login.css tests/login-page.test.js
git commit -m "feat: 更新登录页 Logo 与卖点布局"
```
