# 三端看板筛选区吸顶方案

## 1. Summary
让厂端看板、门店看板、销售看板在页面上滑时，顶部的筛选板块吸顶；吸顶位置距离视口顶部 24px；吸顶后通过背景/阴影变化给出视觉反馈。其中厂端看板仅筛选区（品牌/组织/业务场景/时间/车系）吸顶，上方的「SOP执行质检 / SOP策略洞察」两个 tab 不吸顶。

## 2. Current State Analysis
- 三个看板的内容都在 `.main` 容器内滚动，`.main` 已有 `padding: 24px`（`voice-qc-admin.css` 302–308 行）。因此让筛选区 `position: sticky; top: 0` 即可自然实现「距离视口顶部 24px」的视觉效果。
- 厂端看板筛选区：外层 `<section class="factory-filter-panel">` 包含两个子区域——非吸顶的 tab 栏 `<div class="main-tabs-bar factory-toolbar-tabs-row">` 和吸顶的筛选区主体 `<div class="factory-filter-sticky-body global-filter-bar session-filter-card">`（内嵌品牌/组织/业务场景/时间/车系等筛选），样式在 `factory-dashboard/factory-dashboard.css`。
- 门店看板筛选区：`<section class="global-filter-bar session-filter-card">`，样式在 `app-inline.css` 和 `store-dashboard/page.css`。
- 销售看板没有 `global-filter-bar` 类名，最接近「筛选区整体」的是 `.sales-role-nav`（包含角色切换 + 场景/日期筛选），样式在 `voice-qc-admin.css`。
- CSS 没有原生的 `:stuck` 伪类，需要借助 `IntersectionObserver` + sentinel 元素检测吸顶状态，再动态添加 `.is-stuck` 类。

## 3. Proposed Changes

### 3.1 CSS：吸顶定位
| 看板 | 选择器 | 修改文件 | 新增/修改内容 |
|------|--------|----------|---------------|
| 厂端 | `.factory-dashboard-page .factory-filter-sticky-body.global-filter-bar.session-filter-card` | `factory-dashboard/factory-dashboard.css` | `position: sticky; top: 0; z-index: 50;` |
| 门店 | `.store-dashboard-page .global-filter-bar.session-filter-card` | `store-dashboard/page.css`（优先）或 `app-inline.css` | `position: sticky; top: 0; z-index: 50;` |
| 销售 | `.sales-role-dashboard-page .sales-role-nav` | `voice-qc-admin.css` | `position: sticky; top: 0; z-index: 50;` |

### 3.2 CSS：吸顶状态视觉反馈
为上述三个选择器分别增加 `.is-stuck` 状态样式，建议统一为：
```css
.selector.is-stuck {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(217, 226, 239, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
```
具体写入各自 CSS 文件。

### 3.3 JS：检测吸顶状态
在 `app-runtime.js` 中新增 `initStickyFilterBars()` 函数：
1. 查询所有目标元素：`.global-filter-bar.session-filter-card`、`.sales-role-nav`。
2. 对每个目标元素，在其前面插入一个 1px 高的不可见 sentinel（`position: absolute; top: 0; visibility: hidden; pointer-events: none;`）。
3. 使用 `IntersectionObserver` 观察 sentinel，root 设为元素最近的 `.main` 滚动容器。
4. 当 sentinel 离开视口（`!entry.isIntersecting`）时，给目标元素加 `.is-stuck`；否则移除。
5. 在三个看板的初始化流程中分别调用该函数（或统一在 `app-runtime.js` 的公共初始化中调用）。

### 3.4 版本号与缓存
- 三端看板各自 bump `page.css`/`page.js` 缓存版本号。
- 更新相关测试文件中的版本断言（如 `factory-quality-overview-match.test.js`、`store-quality-overview-figma.test.js`、`sales-dashboard-layout.test.js` 等）。
- 运行 `node scripts/check-version-sync.js` 确保一致。

## 4. Assumptions & Decisions
- **吸顶范围**：门店、销售看板为「筛选区整体吸顶」；厂端看板仅「筛选区主体」吸顶，上方的两个 tab（SOP执行质检 / SOP策略洞察）不吸顶，因此将 tab 栏与筛选区主体拆分为同级子元素，仅对筛选区主体应用 sticky。
- **24px 间距**：利用 `.main` 已有的 `padding: 24px`，通过 `top: 0` 实现，无需额外 margin。
- **z-index**：统一设为 `50`，高于普通内容和下拉面板（20），低于日期选择器展开态（140）和模态遮罩（10000）。
- **视觉反馈**：采用「背景更不透明 + 边框加深 + 阴影增强」的 subtle 变化，不过度突兀。
- **检测方案**：使用 sentinel + IntersectionObserver，而不是监听 scroll 事件，以保证性能。

## 5. Verification Steps
1. 分别打开厂端看板、门店看板、销售看板页面。
2. 缓慢向下滚动页面，观察筛选区是否在距离视口顶部约 24px 处固定。
3. 观察吸顶瞬间筛选区是否出现背景/阴影变化。
4. 继续滚动到底部，再向上滚动，确认筛选区能正常脱离吸顶状态。
5. 在不同视口宽度（尤其是窄屏 ≤1100px）下重复验证。
6. 运行测试：`node scripts/check-version-sync.js` 通过；相关 dashboard 测试通过。
