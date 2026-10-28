# 主导航图标与资源清理

更新日期：2026-09-22。

## 图标来源

[Figma 主导航节点](https://www.figma.com/design/5nY2kC6LvaldZ85UuxjF28/Untitled?node-id=819-2906)。

16 个原始 SVG 保存在 `assets/navigation/`；`manifest.json` 记录图标名称及 Figma 节点。文件保留导出原始字节，未重画路径。

共享导航使用这些 SVG 的内嵌 data URL 遮罩，颜色跟随菜单文字；避免 `file://` 模式跨文件 SVG 遮罩的加载限制。运行 `node scripts/sync-navigation-icons.cjs` 可从本地 SVG 重新生成导航数据。运行 `node scripts/check-dock-navigation-icon.js` 校验全部 16 个图标与源文件一致。所有 11 个页面入口沿用同一个导航。

## 旧资源清理

检查 HTML、CSS、JS、JSON、脚本和文档的文件名引用，包括被 Git 忽略的本地源文件；另核查动态拼接的排名、线索路径和工牌事件资源。移除未使用的旧导航遮罩 CSS 后，删除下列确认无引用的 `assets` 资源。

保留文档配图、根目录截图、`tmp/`、`output/`、`.playwright-cli/` 及仍有引用的资源。

删除 59 个文件，共 5,705,711 字节。

- `assets/ai-supervision.png`
- `assets/calendar.svg`
- `assets/customer-insight-ai-summary-redesign-v1.png`
- `assets/customer-insight-avatar-figma.png`
- `assets/customer-insight-judgement-figma.svg`
- `assets/customer-insight-robot-figma.png`
- `assets/customer-journey-check-figma.svg`
- `assets/customer-public-age-figma.svg`
- `assets/customer-public-car-figma.svg`
- `assets/customer-public-career-figma.svg`
- `assets/customer-public-consumption-figma.svg`
- `assets/customer-public-education-figma.svg`
- `assets/customer-public-energy-figma.svg`
- `assets/customer-public-gender-figma.svg`
- `assets/customer-public-location-figma.svg`
- `assets/customer-public-married-figma.svg`
- `assets/customer-public-tech-figma.svg`
- `assets/customer-summary-time-figma.svg`
- `assets/device-event-icons/detail-divider.svg`
- `assets/device-field-settings.svg`
- `assets/journey-summary-muted.svg`
- `assets/lead-tag-dialogue.svg`
- `assets/lead-tag-public-age.svg`
- `assets/lead-tag-public-car.svg`
- `assets/lead-tag-public-career.svg`
- `assets/lead-tag-public-consumption.svg`
- `assets/lead-tag-public-education.svg`
- `assets/lead-tag-public-intent.svg`
- `assets/lead-tag-public-location.svg`
- `assets/lead-tag-public-new-energy.svg`
- `assets/lead-tag-public-tech.svg`
- `assets/lead-tag-public.svg`
- `assets/nav-badge-detail-figma.svg`
- `assets/nav-customer-insight-figma.svg`
- `assets/nav-factory-dashboard-figma.svg`
- `assets/nav-store-overview-figma.svg`
- `assets/quality-overview-ai-redesign-v1.png`
- `assets/quality-rate-vs-figma-514-6817.png`
- `assets/sales-review-strength-icon.svg`
- `assets/sales-review-weakness-icon.svg`
- `assets/search.svg`
- `assets/select-caret.svg`
- `assets/status-completed.svg`
- `assets/status-failed.svg`
- `assets/store-overview-arrow-up-hover.gif`
- `assets/store-overview-store-card.png`
- `assets/store-overview-vs.png`
- `assets/store-overview-zone-card.png`
- `assets/store-quality-rate-figma-514-6817.png`
- `assets/store-quality-tail-figma-514-6817.svg`
- `assets/store-summary-risk-figma-514-6888.png`
- `assets/store-summary-risk.svg`
- `assets/store-summary-strength-figma-514-6868.png`
- `assets/store-summary-strength.svg`
- `assets/store-summary-weakness-figma-514-6878.png`
- `assets/store-summary-weakness.svg`
- `assets/zone-quality-rate-figma-514-6817.png`
- `assets/zone-quality-tail-figma-514-6817.svg`
- `assets/headset.svg`
