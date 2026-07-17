# 登录页 Logo 与卖点文案宽度设计说明

## 目标

- 用项目现有 `assets/ds-logo.png` 替换顶部品牌区的波形 SVG 图标。
- 让三条卖点说明文字优先使用右侧可用宽度，只在真实空间不足时自然换行。

## 实现方式

- 保留现有 `.brand` 和 `.mark` 容器，将容器内的内联 SVG 替换为 `<img class="brand-logo" src="./assets/ds-logo.png">`。
- Logo 为 36×36px，使用 `object-fit: contain`，与“AI质检平台”文字垂直居中。
- Logo 旁边已有品牌文字，图片按装饰图处理，使用空 `alt` 避免读屏重复朗读品牌名。
- 将 `.points p` 的 `max-width: 360px` 改为 `max-width: none`。
- 为 `.points li > div` 增加 `flex: 1` 和 `min-width: 0`，让文案占用图标之外的全部剩余宽度，并在窄屏正常换行。

## 改动边界

只修改 `index.html`、`login.css` 和 `tests/login-page.test.js`，不改登录逻辑、其他文案、卡片或响应式断点。

## 验收

- 自动测试确认 Logo 路径、原波形 SVG 已移除、Logo 尺寸及文案宽度规则存在。
- 桌面宽度下，第一条卖点说明尽可能少换行。
- 窄屏下文字自然换行，不产生横向溢出。
