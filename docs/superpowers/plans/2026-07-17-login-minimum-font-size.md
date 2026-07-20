# Login Minimum Font Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将登录页所有小于 14px 的明确字号统一提升为 14px。

**Architecture:** 保持现有 HTML 和登录逻辑不变，只修改 `login.css` 中低于阈值的字号声明。测试扫描全部 `font-size` 数值，防止遗漏。

**Tech Stack:** HTML、CSS、Node.js 内置测试运行器。

## Global Constraints

- 只处理 `login.css` 中数值小于 `14px` 的 `font-size`。
- 不修改 14px 及以上字号、布局与登录逻辑。

---

### Task 1: 统一登录页最小字号

**Files:**
- Modify: `login.css`
- Test: `tests/login-page.test.js`

**Interfaces:**
- Consumes: `login.css` 的 CSS 文本。
- Produces: 所有显式字号均不小于 14px 的登录页样式。

- [ ] **Step 1: Write the failing test**

在 `tests/login-page.test.js` 中提取全部 `font-size` 像素值，并断言低于 14 的列表为空。

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/login-page.test.js`
Expected: FAIL，并列出当前低于 14px 的字号。

- [ ] **Step 3: Write minimal implementation**

将 `login.css` 中所有 `font-size: 9.5px` 至 `font-size: 13px` 的声明改为 `font-size: 14px`。

- [ ] **Step 4: Run verification**

Run: `node --test tests/login-page.test.js && node --test tests/*.test.js && node --check login.js && git diff --check`
Expected: 全部命令退出码为 0。

- [ ] **Step 5: Commit**

```bash
git add login.css tests/login-page.test.js
git commit -m "style: 统一登录页最小字号"
```
