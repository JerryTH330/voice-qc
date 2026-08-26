# 交接日志归档

## 2026-08-26 从最近记录迁移

### 2026-08-26 移除子设备日志分页
- 用户想做什么：删除充电坞详情抽屉底部的子设备日志分页。
- 已经完成了什么：删除分页 DOM、分页状态、分页渲染函数、每页条数/页码/前后翻页/跳页事件和专用 CSS；日志改为直接渲染全部筛选结果；事件名称与日期组合筛选保留。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.js`、`device-management/page.css`。
- 做过哪些验证：`node --check`、`git diff --check` 与 10 项专项检查通过；确认分页相关标记无残留、日志不再 `slice`、两个筛选仍存在。
- 还有哪些待办或风险：筛选结果较多时依赖抽屉自身滚动查看；需用户在 `file://` 页面硬刷新确认 16 条日志连续展示；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 修复工牌开关机文字图标
- 用户想做什么：将第二组工牌开机事件中的“开”字改为与其他位置一致的图标。
- 已经完成了什么：确认根因是仅第一条开机数据带 `iconAsset`，后续事件触发文字回退；新增按事件类型统一映射的 `renderBadgeEventIcon`，开机、关机分别固定使用 `power-on.svg`、`power-off.svg`；同步覆盖工牌事件分组、独立事件和事件明细入口，并删除演示数据中的“开 / 关”图标字段。
- 改动了哪些文件：`device-management/page.js`、`device-management/index.html`；新增 `scripts/check-badge-event-icons.js`。
- 做过哪些验证：回归检查修改前 5 项失败、修改后 5 项通过；`node --check`、`xmllint --noout`、`git diff --check` 通过，旧文字字段和特殊标记无残留。
- 还有哪些待办或风险：需用户在 `file://` 页面硬刷新后确认所有工牌开关机事件图标；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 工牌充电事件增加底色
- 用户想做什么：给工牌记录抽屉中的独立“充电”事件增加底色。
- 已经完成了什么：沿用现有充电绿色体系，将充电事件卡片底色由白色改为浅绿色 `#f3fbf7`，保留绿色边框 `#cfe7dc`；作用域只限 `.event-charge-card`。
- 改动了哪些文件：`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 与 4 项底色、边框、选择器作用域和缓存版本检查通过。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新后确认浅绿色深浅；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 子设备日志按 Figma 替换事件图标
- 用户想做什么：将充电坞详情的子设备日志事件图标按 Figma 节点 `694:3294` 调整。
- 已经完成了什么：下载并落库工牌上线/下线、充电坞上线/下线、录音上传、设备日志 6 个 Figma 原始 SVG；8 类事件均改用图片图标，移除“牌 / 坞 / 录 / 志”文字占位；保留设计稿对应的 32×32 分类底色和 16×16 图标尺寸；定位日志复用同类日志上传图标。
- 改动了哪些文件：`device-management/page.js`、`device-management/index.html`；新增 `assets/device-dock-log-icons/badge-online.svg`、`badge-offline.svg`、`dock-online.svg`、`dock-offline.svg`、`recording-uploaded.svg`、`device-log-uploaded.svg`。
- 做过哪些验证：`node --check`、`xmllint --noout`、`git diff --check` 与 17 项事件映射/资源存在检查通过；应用内浏览器安全策略阻止自动刷新 `file://` 页面。
- 还有哪些待办或风险：需用户在当前本地页面硬刷新后打开充电坞详情，确认真实视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 缩短电池并增加 100% 演示值
- 用户想做什么：继续缩小电池宽度、高度不变，并提供一个 100% 满电效果用于对比。
- 已经完成了什么：电池宽度由 48px 缩小为 40px，高度保持 20px；工牌明细第一页第 7 条演示数据保持 100%，其他首屏电量保持 7%、63%、70%、77%、84%、91%、62%、69%、76%，便于比较不同填充状态。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`git diff --check` 与 6 项专项检查通过；确认宽度为 40px、高度仍为 20px，100% 演示值、双色数字、统一组件和缓存版本均保留。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认 40px 宽度能否满足最终视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 提升电池内部数字对比度
- 用户想做什么：解决高电量填充状态下黑色百分比文字看不清的问题。
- 已经完成了什么：电池组件写入真实电量 CSS 变量；数字使用与填充边界一致的双色文字，绿色填充区域为白色、未填充区域为深色，并增加轻微文字阴影；不采用单一阈值整体切色，避免中间电量出现一半清晰一半模糊。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 与 9 项专项检查通过；确认两个入口继续共用电池组件、无障碍属性保留、CSS/JS 缓存版本同步。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认 7%、63%、98% 等不同填充比例的实际文字清晰度；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 电量数字移入电池内部
- 用户想做什么：取消电池外侧的百分比数字，将数字结合到电池图形内部。
- 已经完成了什么：新增统一 `renderBatteryIndicator` 渲染组件；工牌明细和充电坞子设备卡片都改为使用该组件；电池调整为 56×22px以容纳 `100%`，电量填充在底层，百分比文字居中覆盖在电池内部，并保留右侧凸点与进度语义。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 与 10 项专项检查通过；确认旧外置数字结构已删除、两个入口共用组件、数字居中且无障碍属性保留。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认不同电量比例下的文字可读性；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 工牌明细同步粗短电池外形
- 用户想做什么：将工牌明细表格的剩余电量同步为充电坞卡片中的粗短电池样式。
- 已经完成了什么：工牌表格复用同一套 38×16px 电池主体、1.5px 外框、圆角、右侧凸点和内部百分比填充；为表格电池和百分比文字保留 8px 间距，原电量数据与表格结构不变。
- 改动了哪些文件：`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 与 7 项专项检查通过；确认样式仅作用于 `.badge-data-table .battery` 和 `.badge-dock-device-battery .battery`。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认表格内电池的实际比例与对齐；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 子设备电量改为粗短电池外形
- 用户想做什么：将子设备卡片右上角细长的电量进度条改为粗短的电池外形进度条。
- 已经完成了什么：把充电坞卡片电池改为 38×16px，增加 1.5px 外框、圆角、白色底和右侧电池凸点；内部继续按真实百分比填充，并与百分比文字保持 8px 间距。
- 改动了哪些文件：`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 与 7 项专项检查通过；确认样式只覆盖 `.badge-dock-device-battery`，不会影响其他页面和工牌明细电量。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认电池粗细和比例；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 充电坞品牌、日志事件流与导航图标调整
- 用户想做什么：充电坞品牌只保留埃安；事件名称和日期筛选等宽；子设备日志改成工牌事件同类的逐条时间展示；修复浏览器中充电坞导航图标不可见。
- 已经完成了什么：所有充电坞演示数据品牌统一为广汽埃安；两个日志筛选框使用两列等宽网格；旧日志表格替换为逐条独立事件卡片并保留时间、工牌 SN、员工、组合筛选与日志分页，按时间倒序；充电坞导航图标从外部 SVG 遮罩改为公共内联 SVG，并更新全部导航消费者缓存版本。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.css`、`device-management/page.js`、`unified-navigation-shell.js`、9 个其他页面的导航脚本版本引用；新增 `scripts/check-dock-navigation-icon.js`。
- 做过哪些验证：`node --check`、`git diff --check`、14 项品牌/事件流/等宽/缓存检查和 4 项导航图标回归检查通过；外部遮罩节点、运行时图标地址和旧日志表格渲染无残留。
- 还有哪些待办或风险：内置浏览器安全策略阻止自动操作 `file://` 页面，需用户手动硬刷新确认最终视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 按截图更新子设备日志事件名称
- 用户想做什么：将子设备日志的事件名称按参考截图修改。
- 已经完成了什么：事件名称及顺序统一为充电坞上线、充电坞下线、工牌上线、工牌下线、录音上传完成、当天录音上传完成、设备日志上传完成、定位日志上传完成；演示日志生成规则同步复用该配置。
- 改动了哪些文件：`device-management/page.js`、`device-management/index.html`。
- 做过哪些验证：JavaScript 语法、代码格式、门店中文搜索回归通过；专项检查确认 8 项名称、顺序及演示数据覆盖正确。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认下拉选项和表格事件名称；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 充电坞状态改为公共圆点样式
- 用户想做什么：将列表中的离线状态改为前置圆点样式，并使用其他页面的公共样式。
- 已经完成了什么：状态单元格从胶囊标签替换为公共 `status-inline` / `status-inline-dot` 结构；在线映射绿色，离线映射灰色。
- 改动了哪些文件：`device-management/page.js`、`device-management/index.html`。
- 做过哪些验证：JavaScript 语法、代码格式、门店中文搜索回归通过；专项检查确认公共样式存在、颜色映射正确且旧胶囊结构不再使用。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认圆点和文字对齐；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 子设备日志事件名称多选
- 用户想做什么：在子设备日志标题区增加事件名称筛选，支持下拉多选。
- 已经完成了什么：新增事件名称多选控件，包含全部事件、工牌上线/下线、设备日志上传完成、充电坞上线/下线；支持全选、取消全选、逐项勾选和“已选 N 项”回显；与日期范围组合筛选并重置日志页码。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.js`、`device-management/page.css`。
- 做过哪些验证：JavaScript 语法、代码格式、门店中文搜索回归、事件多选渲染、日期与事件组合筛选及响应式布局检查通过。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新，确认标题区宽度、下拉勾选和分页数量；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 移除子设备状态分页
- 用户想做什么：子设备状态卡片不需要分页。
- 已经完成了什么：删除子设备分页 DOM、分页状态、分页渲染调用和子设备事件分支；卡片改为一次性渲染全部数据；下方子设备日志分页保持原样。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.js`。
- 做过哪些验证：JavaScript 语法、代码格式、门店中文搜索回归通过；专项扫描确认子设备分页无残留，日志分页 DOM 和状态仍存在。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认分页栏消失且三张卡片全部显示；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 子设备卡片电量与时间对齐
- 用户想做什么：将子设备电量放到卡片右上角，样式与工牌明细剩余电量一致；设备获取时间右对齐。
- 已经完成了什么：卡片首行改为左侧端口/SN、右侧电量；电池直接复用工牌明细 `.battery` 样式；设备获取时间标题和值整组右对齐，窄屏仍保持电量在右上角。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：JavaScript 语法、代码格式、门店中文搜索回归和子设备卡片结构/样式检查通过；旧电量轨道结构已清理。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认两张卡片的视觉对齐；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 修复门店中文输入搜索不生效
- 用户想做什么：修复在门店主框输入“北京”后，下拉列表没有过滤的问题。
- 已经完成了什么：确认普通输入和中文匹配算法正常，根因是组合输入期间的事件被忽略且结束后未同步；新增 `compositionend` 处理，统一更新搜索词、刷新列表并恢复输入焦点。
- 改动了哪些文件：`device-management/page.js`、`device-management/index.html`，新增 `scripts/check-dock-store-search-ime.js` 回归检查。
- 做过哪些验证：回归检查修改前稳定失败、修改后通过；`node --check`、`git diff --check` 通过；无调试日志残留。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新后用中文输入法实际输入确认；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 充电坞筛选项等宽
- 用户想做什么：让门店、充电坞SN、状态三个筛选项宽度等分。
- 已经完成了什么：桌面端前三个筛选项改为三等分，重置按钮保持自身宽度；中等屏幕两列、窄屏单列规则不变。
- 改动了哪些文件：`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 和等宽/响应式规则脚本测试通过。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认实际视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 状态筛选改为下拉单选
- 用户想做什么：把筛选区平铺的“全部、在线、离线”状态按钮改成下拉。
- 已经完成了什么：状态主框显示当前值；点击展开三个单选项；选择后立即筛选并收起；右侧箭头同步展示展开状态。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 和状态下拉渲染脚本测试通过；确认旧平铺按钮已从充电坞筛选区移除。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新确认下拉宽度和操作体验；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 门店搜索移入主选择框
- 用户想做什么：取消下拉层里的独立门店搜索框，改为在顶部“全部门店”主控件中直接搜索。
- 已经完成了什么：主控件改为可搜索下拉；点击、聚焦或右侧箭头可展开；输入时实时筛选门店；选择后回显；下拉层只保留选项。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`、`device-management/index.html`。
- 做过哪些验证：`node --check`、`git diff --check` 通过；关闭态、展开态、搜索匹配和选择回显的脚本测试通过。
- 还有哪些待办或风险：需在 `file://` 页面硬刷新后确认视觉与键鼠操作；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 增加充电坞状态列与状态筛选
- 用户想做什么：在充电坞 SN 后增加状态列，并在筛选区增加全部、在线、离线筛选。
- 已经完成了什么：列表增加状态列和状态标签；筛选区增加状态分段按钮；演示充电坞设为离线，其余数据稳定分配在线/离线。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.js`、`device-management/page.css`。
- 做过哪些验证：JavaScript 语法、筛选结果和代码格式检查通过。
- 还有哪些待办或风险：需手动刷新页面确认视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 精简充电坞筛选并改为门店搜索下拉
- 用户想做什么：删除品牌、查询日期和独立门店名称筛选；组织只保留门店层级，并支持搜索和下拉选择。
- 已经完成了什么：筛选区收敛为门店、充电坞 SN、状态和重置；门店数据从现有充电坞记录生成。
- 改动了哪些文件：`device-management/page.js`、`device-management/page.css`。
- 做过哪些验证：语法检查、无旧筛选残留扫描和筛选逻辑检查通过。
- 还有哪些待办或风险：需手动刷新页面确认响应式布局；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 子设备卡片调整为一行两张
- 用户想做什么：充电坞详情抽屉的子设备卡片在桌面端一行展示两张。
- 已经完成了什么：卡片列表改为两列网格；560px 以下自动回到单列，沿用抽屉现有响应式规则。
- 改动了哪些文件：`device-management/page.css`。
- 做过哪些验证：样式断点和代码格式检查通过。
- 还有哪些待办或风险：需手动刷新抽屉确认实际宽度下的视觉；尚未提交。

## 2026-08-26 从最近记录迁移

### 2026-08-26 实施子设备状态卡片展示
- 用户想做什么：把充电坞详情中的子设备状态表格改成卡片展示。
- 已经完成了什么：每张卡展示端口、SN、电量、可用空间和设备获取时间；保留刷新、分页和空状态能力。
- 改动了哪些文件：`device-management/index.html`、`device-management/page.js`、`device-management/page.css`。
- 做过哪些验证：JavaScript 语法、DOM 引用和代码格式检查通过。
- 还有哪些待办或风险：需在浏览器中确认卡片密度和长文本表现；尚未提交。

## 2026-08-26 从最近记录迁移的 2026-08-07 工作记录

### 2026-08-07 三端看板筛选区吸顶
- 用户想做什么：厂端看板、门店看板、销售看板在页面上滑时，顶部的筛选板块吸顶；吸顶位置距离顶部 24px，不要直接贴在最上方；吸顶后通过背景/阴影变化给出视觉反馈。其中厂端看板仅下方的筛选区（品牌/组织/业务场景/时间/车系）吸顶，上方的「SOP执行质检 / SOP策略洞察」两个 tab 不吸顶。
- 已经完成了什么：① 为门店看板 `.store-dashboard-page .global-filter-bar.session-filter-card`、销售看板 `.sales-role-dashboard-page .sales-role-nav` 增加 `position: sticky; top: 0; z-index: 50`；② 厂端看板将外层 `<section>` 改为透明容器，把 tab 栏与筛选区主体拆分为同级子元素，仅对筛选区主体 `<div class="factory-filter-sticky-body global-filter-bar session-filter-card">` 应用 sticky、卡片背景/边框/阴影及 `.is-stuck` 状态样式，并移除 tab 栏上的 `sales-role-nav` 类以避免被吸顶逻辑选中；③ 在 `app-runtime.js` 新增 `initStickyFilterBars()`，通过 `IntersectionObserver` + 不可见 sentinel 元素检测吸顶状态，给目标元素动态添加/移除 `.is-stuck`；④ 在 `app-runtime.js` 销售看板初始化、门店看板初始化以及 `factory-dashboard/factory-dashboard.js` 初始化末尾调用 `initStickyFilterBars()`；⑤ 将厂端看板缓存版本 bump 为 `20260807-sticky-filter-v2`，门店/销售看板保持 `20260807-sticky-filter-v1`，同步更新 `factory-dashboard/page.js`/`index.html`/`page.css` 及 4 个厂端测试文件中的版本断言；⑥ 更新 `.trae/documents/sticky-filter-bar-plan.md` 以反映厂端结构调整。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.css`、`factory-dashboard/factory-dashboard.js`、`.trae/documents/sticky-filter-bar-plan.md`、`store-dashboard/page.css`、`voice-qc-admin.css`、`app-runtime.js`、`factory-dashboard/page.js`、`factory-dashboard/index.html`、`factory-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/index.html`、`sales-dashboard/page.css`，以及 4 个厂端测试文件。
- 做过哪些验证：`node --check factory-dashboard/factory-dashboard.js && node --check factory-dashboard/page.js && node --check store-dashboard/page.js && node --check sales-dashboard/page.js && node --check app-runtime.js` 通过；`node scripts/check-version-sync.js` 通过；销售看板相关测试 4 个用例全部通过；门店看板相关测试 14 个用例中 12 个通过，`store-core-metrics-figma.test.js` 的 role-icon / 店长文案断言为历史遗留失败；厂端看板相关测试 5 个用例中 4 个通过，`factory-dashboard-panel-spacing.test.js` 的 issue-overview-wrapper padding 断言为历史遗留失败。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后打开厂端看板，重点验证：上滑时两个 tab 正常滚走、仅下方白色筛选卡片在距顶部约 24px 处吸顶并出现背景/阴影变化；门店/销售看板仍按「筛选区整体吸顶」验证；`scripts/sync-versions.js` 本次因把旧 CSS import 版本误当作目标，同步结果需人工校正，已手动将测试文件版本改回对应版本，后续使用同步脚本时需注意目标版本选择。

### 2026-08-07 门店看板 hero section 响应式与厂端看板保持一致
- 用户想做什么：让门店看板 hero section 的响应式及适配方案与厂端看板保持一致，确保不同屏幕宽度下的布局行为一致。
- 已经完成了什么：① 对比厂端看板 `factory-dashboard/factory-dashboard.css` 中 `.factory-hero-metrics-layout` 的响应式断点（1500px/1200px/760px）与 grid/flex 行为；② 修改 `store-dashboard/page.css`：将 `.store-hero-metrics .hm-layout-top` 默认 `gap` 从 `16px` 改为 `12px`；在 1500px 断点下将 `.store-hero-metrics`、`.hm-layout-top`、`.hm-layout-bottom` 的 `gap` 统一收紧为 `10px`；在 1200px 断点下将 `.hm-layout-top`/`.hm-layout-bottom` 的 `gap` 改为 `8px`，并将 `.hm-layout-bottom` 的 `grid-template-columns` 从 `repeat(3, ...)` 改为 `repeat(2, ...)`；在 760px 断点下将 `.store-hero-metrics` 的 `gap` 改为 `8px`，并显式设置 `.hm-layout-top { flex-direction: column; }`，底部指标卡片改为单列 `1fr`；③ 同步调整容器查询：`@container (max-width: 1180px)` 下 `.hm-layout-bottom` 改为 `repeat(2, ...)`；`@container store-dashboard (max-width: 720px)` 下 `.hm-layout-bottom` 改为 `1fr`；④ 将门店看板缓存版本从 `20260807-trend-14px` 更新为 `20260807-store-hero-factory`，同步修改 `store-dashboard/index.html`、`store-dashboard/page.js` 及 6 个测试文件中的版本断言；⑤ 顺手修复 `tests/store-dashboard-layout-consistency.test.js` 中两处因 CSS 选择器已改为 `:is(#detail-sop, #detail-sop-analysis)` 而导致匹配失败的正则断言。
- 改动了哪些文件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js`、`tests/store-dashboard-layout-consistency.test.js`、`tests/store-core-metrics-figma.test.js`、`tests/store-recording-summary-visibility.test.js`、`tests/store-advisor-pagination.test.js`、`tests/store-quality-overview-figma.test.js`、`tests/store-review-sop-toolbar.test.js`。
- 做过哪些验证：`node --check store-dashboard/page.js` 通过；`node scripts/check-version-sync.js` 通过；`node tests/store-dashboard-layout-consistency.test.js`、`tests/store-recording-summary-visibility.test.js`、`tests/store-advisor-pagination.test.js`、`tests/store-quality-overview-figma.test.js` 均通过；`tests/store-core-metrics-figma.test.js` 与 `tests/store-review-sop-toolbar.test.js` 存在历史遗留失败（role-icon/店长文案、搜索规则文案与 data 属性断言），与本次响应式调整无关。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证门店看板在不同窗口宽度（>1200px、1200px~760px、<760px）下 hero section 的顶部卡片与底部 6 个指标卡片的排列、间距、换行行为是否与厂端看板一致。

### 2026-08-07 销售看板 hero section 按 Figma 593:3706 校准样式
- 用户想做什么：按照 Figma 设计稿（节点 593:3706）调整销售看板云外呼/工牌页面的 hero section 样式，并将设计稿中的指标图标图片下载到项目下调用。
- 已经完成了什么：① 通过 Figma MCP 读取节点 593:3706，提取 section 背景、边框、阴影、圆角、padding、gap，以及头部头像/姓名/门店职位标签、指标卡片的尺寸与颜色规范；② 修改 `sales-dashboard/index.html` 中 `tpl-sales-dcc` 与 `tpl-sales-advisor` 的 hero 结构：将原来的 `hero-store` 合并标签拆分为独立的 `hero-profile-tags` / `hero-profile-tag`（门店、职位各一个），引用门店看板的 `store-icon.svg` 与 `role-icon.svg`；③ 修改 `app-runtime.js`：更新 `renderDccProfile` / `renderAdvisorProfile` 将 `store` 和 `title` 分别写入 `#profile-store` / `#profile-title`；更新 `renderDccHeroMetrics` / `renderAdvisorHeroMetrics`，将指标卡片内部结构从「图标+标签行 / 数值行」改为「左侧 48px 图标 + 右侧 `.hm-body`（标签 + 数值行）」；④ 使用 Figma MCP `download_figma_images` 下载 4 个 48px 指标图标到 `assets/sales-role-metrics/`，命名为 `metric-call-count.png`（邀约/接待/录音数类）、`metric-hit-rate.png`（话术命中率）、`metric-duration.png`（平均时长）、`metric-risk-count.png`（风险录音）；⑤ 修改 `buildSalesMetric` 调用，为所有指标传入 `iconUrl`；修改 `renderSalesHeroMetricIcon` 优先使用 `iconUrl` 渲染 `<img class="hm-metric-icon">`，无 `iconUrl` 时回退到 CSS 渐变图标；⑥ 修改 `voice-qc-admin.css`：按设计稿更新 section 的渐变背景、边框色、双层阴影、24px 圆角、20px padding、18px gap；更新头部头像尺寸为 40px、姓名字体为 #162033 24px Semibold；新增 `.hero-profile-tags` / `.hero-profile-tag` 样式；更新指标卡片为横向 flex、圆角 14px、半透明蓝色边框、渐变背景、backdrop-filter blur(4px)；新增 `.hm-metric-icon` 48px 图片样式；将标签改为 #52627A 14px Medium、数值改为 #243047 24px Semibold、趋势改为 #16A34A 14px Medium；添加指标之间的 1px 分隔线；补齐 1200px/768px 响应式样式；⑦ 将销售看板缓存版本从 `20260807-sales-scene-tabs-v4` 更新为 `20260807-sales-hero-icons-v5`，并同步 `sales-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/page.css` 与相关测试文件。
- 改动了哪些文件：`sales-dashboard/index.html`、`sales-dashboard/page.js`、`sales-dashboard/page.css`、`app-runtime.js`、`voice-qc-admin.css`、`tests/sales-review-sop-toolbar.test.js`、`tests/sales-review-robot-interaction.test.js`，新增 `assets/sales-role-metrics/metric-call-count.png`、`metric-hit-rate.png`、`metric-duration.png`、`metric-risk-count.png`。
- 做过哪些验证：`node --check app-runtime.js` 通过；`node --check sales-dashboard/page.js` 通过；`node tests/sales-review-sop-toolbar.test.js && node tests/sales-review-robot-interaction.test.js` 通过；`node scripts/check-version-sync.js` 通过；使用 Python HTMLParser 检查两个 template 标签平衡通过。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板两个角色页面的 hero section 与设计稿一致，确认四个指标图片正常显示；未跑全量测试。

### 2026-08-07 销售看板布局重构后版本同步与测试断言修复
- 用户想做什么：在销售看板页面完成 SOP 执行分析独立卡片与三行布局重构后，同步版本号并运行语法/版本/相关测试验证，确保所有变更一致且测试通过。
- 已经完成了什么：① 运行 `node --check app-runtime.js` 与 `node --check sales-dashboard/page.js` 确认无语法错误；② 运行 `node scripts/check-version-sync.js` 确认 page.js 版本与测试文件中的版本字符串一致；③ 更新 `tests/sales-review-sop-toolbar.test.js`：将 SOP 工具栏测试从旧的 `data-sales-review-sop-search` / `data-sales-review-sop-sort-trigger` / `data-sales-review-sop-sort-panel` / `data-sales-review-sop-sort` 更新为独立渲染后实际使用的 `data-sales-review-rule-search` / `data-sales-review-rule-sort-trigger` / `data-sales-review-rule-sort-panel` / `data-sales-review-rule-sort`，状态引用从 `state.reviewSopSort` / `state.reviewSopQuery` / `renderSalesReviewToolbar(role, activeTab)` / `event.target.value` 更新为 `state.sopReviewRuleSort` / `state.sopReviewRuleQuery` / `renderSalesSopReview(role)` / `nextQuery`；④ 重新运行销售看板相关测试，全部通过。
- 改动了哪些文件：`tests/sales-review-sop-toolbar.test.js`。
- 做过哪些验证：`node --check app-runtime.js` 通过；`node --check sales-dashboard/page.js` 通过；`node scripts/check-version-sync.js` 通过；`node tests/sales-review-sop-toolbar.test.js` 2 个用例全部通过；`node tests/sales-review-robot-interaction.test.js` 2 个用例全部通过。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板两个角色页面的新布局与独立 SOP 卡片交互（搜索/排序/分页/下钻）是否正常；未跑全量测试。

### 2026-08-07 销售看板 SOP 执行分析独立 JS 渲染逻辑
- 用户想做什么：在 `sales-dashboard/index.html` 已完成 SOP 执行分析独立卡片拆分的前提下，将 `app-runtime.js` 中「顾问行为洞察」里的「SOP 执行分析」tab 拆分为独立渲染逻辑，使其拥有独立的搜索、排序、分页状态和渲染函数。
- 已经完成了什么：① 在 `app-runtime.js` 中 `renderSalesReviewInsights` 之前新增三个函数：`renderSalesSopReviewToolbar(role)`（渲染目标 `sales-sop-review-toolbar`，固定使用 `SALES_REVIEW_INSIGHT_CONFIG.sop`，独立状态 `sopReviewRuleQuery`/`sopReviewRuleSort`/`sopReviewPage`，事件更新对应状态并重置分页后重新渲染）、`renderSalesSopReviewContent(role)`（渲染目标 `sales-sop-review-list`，固定 tab 为 `sop`，复用原有列表行结构、分页和查看录音逻辑，渲染完成后调用 `autoCollapseSalesReviewSceneTags`）、`renderSalesSopReview(role)`（依次调用前两者）；② 修改 `renderSalesReviewInsights`，将 `activeTab` 限定为 `strength`/`weakness`/`risk`，默认 `strength`，若 `reviewInsightTab` 为 `sop` 则修正为 `strength`；③ 修改 `renderSalesReviewSceneControl` 场景按钮点击回调，重置 `sopReviewPage = 1` 并同步调用 `renderSalesSopReview(role)` 与 `renderSalesReviewInsights(role)`；④ 修改 `bindDccEvents` 与 `bindAdvisorEvents` 中的 `.review-insight-tabs` 事件绑定，过滤 tab 值，仅 `strength`/`weakness`/`risk` 才赋值给 `reviewInsightTab`；⑤ 在 `renderDccReview()` 与 `renderAdvisorReview()` 末尾分别增加 `renderSalesSopReview('dcc')` 与 `renderSalesSopReview('advisor')`。
- 改动了哪些文件：`app-runtime.js`。
- 做过哪些验证：`node --check app-runtime.js` 通过，无语法错误。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证销售看板两个角色页面：SOP 执行分析独立卡片的搜索、排序、分页、查看录音下钻是否正常，顾问行为洞察三个 tab 切换是否仍正常，业务场景筛选变化是否同时刷新两个区域；未跑全量测试。


### 2026-08-05 厂端问题规则列表容器宽度自适应
- 用户想做什么：选中的 `issue-rule-list-shell` 要做宽度自适应；宽度足够时由规则名称列撑开剩余空间。
- 已经完成了什么：检查后发现厂端 `.issue-rule-list-shell` 被写死了 `max-width: 654px` 和 `align-self: center`，导致列表容器不能撑满父容器。已移除这两个属性，让容器 `width: 100%` 自适应父容器宽度；并把 grid 第一列从 `minmax(0, 312px)` 改为 `minmax(0, 1fr)`，让规则名称列在宽度足够时撑开剩余空间，标签跟随其后；同步把厂端 `page.js` / `index.html` 的缓存版本从 `20260805-issue-rule-shared` 更新为 `20260805-issue-rule-adaptive` 以便浏览器重新加载 CSS；运行 `scripts/sync-versions.js` 和 `scripts/check-version-sync.js` 确认测试文件版本无需改动、全部一致。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.css`、`factory-dashboard/page.js`、`factory-dashboard/index.html`。
- 做过哪些验证：`node scripts/sync-versions.js` 输出 "0 test file(s) updated, 0 replacement(s)"；`node scripts/check-version-sync.js` 输出 "All test file versions are in sync"。
- 还有哪些待办或风险：门店和销售看板已经使用 `width: 100%` 且规则名称列为 `1fr`，无需改动；用户需要硬刷新（Cmd+Shift+R）才能看到效果。

### 2026-08-05 修复非看板页面未加载 shared/issue-rule-list.js 导致空白
- 用户想做什么：切到线索列表页面后页面空白，控制台报错 `IssueRuleList is not defined`。
- 已经完成了什么：检查后发现 `app-runtime.js` 在模块加载时就调用了 `IssueRuleList.createAutoCollapser`，但线索、录音、质检配置、优秀话术库、系统管理这 5 个非看板 page.js 只加载了 `app-runtime.js`，没有加载 `shared/issue-rule-list.js`。已在这 5 个 page.js 的 scripts 数组里，把 `../shared/issue-rule-list.js` 放在 `../app-runtime.js` 之前按顺序加载。
- 改动了哪些文件：`leads/page.js`、`session/page.js`、`config/page.js`、`script-library/page.js`、`system/page.js`。
- 做过哪些验证：`node --check` 检查 5 个文件全部通过；语法无误，加载顺序正确。
- 还有哪些待办或风险：需要在浏览器硬刷新（Cmd+Shift+R）后验证线索列表、录音列表、质检配置、话术库、系统管理页面是否正常加载；未跑全量测试。

### 2026-07-28 200ms 冷却 + 折叠自动恢复
- 用户想做什么：用户选 2（grill-me 问题 1）——加 200ms 冷却时间，让拖大窗口时已折叠的 scenes 自动恢复成 5 标签，同时不闪烁。
- 已经完成了什么：3 处 measure（厂端 `factory-dashboard.js:6375-6404`、门店 `app-runtime.js:4359-4388`、销售 `app-runtime.js:15570-15599`）加 `let lastMeasureAt = 0; const MEASURE_COOLDOWN = 200;` 冷却；measure 函数每次先检查 `cont.dataset.issueRuleScenesState === 'collapsed'`，是的话**临时恢复 5 标签** + `cont.offsetHeight` 强制 reflow，再检测，位置够就保持 5 标签，否则再折叠回 1 个 + "..."；不用 closure 变量 `isCollapsed`（避免 stale），每次从 DOM 读最新状态。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`app-runtime.js`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证"拖大窗口自动恢复"行为（**用户必须刷新页面**）。

### 2026-07-28 标签全名 hover 浮窗 + 下钻只按钮触发
- 用户想做什么：标签在任何时候悬停都显示完整标签名（自定义浮窗，不用原生 title）；规则名出现 ... 时悬停显示完整规则名；下钻只在"看组织表现"按钮触发，点击 row 其他地方不要下钻。
- 已经完成了什么：3 处 HTML（厂端 `factory-dashboard.js:6327`+6595、门店 `app-runtime.js:4311`+4414、销售 `app-runtime.js:15517`+16164）标签 em 改为 `<em title data-tag-label aria-label>${tagLabel}<span class="issue-rule-tag-popover" role="tooltip">${fullLabel}</span></em>`；row 去掉 `role="button" tabindex="0" aria-label`；"看组织表现"按钮从 `<span class="issue-rule-action">` 改为 `<button type="button" class="issue-rule-action" data-* aria-label>`；3 处 JS（厂端 `factory-dashboard.js:6885`、门店 `app-runtime.js:4629`、销售 `app-runtime.js:16191`）下钻从 row click/keydown 改为 `.issue-rule-action` button click（`event.stopPropagation`）；3 处 CSS（厂端 `factory-dashboard.css:1273-1297` + `1421-1462` + `1482-1499`，门店 `store-dashboard/page.css:1987-2013` + `2154-2194`，销售 `sales-dashboard/page.css:269-294` + `520-559`）row 去掉 `cursor: pointer` + transition + hover 视觉变化；em 加 `position: relative`；加 `.issue-rule-tag-popover` 浮窗样式（白底圆角阴影 z-index 100）；popover z-index 60 → 100；row `:has(em:hover/:focus-within)` 临时 z-index 40 让 popover 浮在所有 row 之上；测试 `factory-issue-overview-figma-565-5348.test.js:32` 同步更新匹配新 em 结构。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`app-runtime.js`、`store-dashboard/page.css`、`sales-dashboard/page.css`、`tests/factory-issue-overview-figma-565-5348.test.js`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关（之前就存在的 Figma 文件未到位、toolbar 未来功能等）。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（**用户必须刷新页面**才能看到新结构）。

## 2026-07-28 修复 measure 双向恢复循环闪烁
- 用户想做什么：之前 measure 函数"双向自动恢复"导致 collapse → expand → collapse 无限循环（折叠后 strong 不截断就恢复，恢复后又截断又折叠），视觉上一直在闪。
- 已经完成了什么：3 处 measure（厂端 `factory-dashboard.js:6375`、门店 `app-runtime.js:4359`、销售 `app-runtime.js:15565`）回到"单向折叠不恢复"——`if (cont.dataset.issueRuleScenesState === 'collapsed') return;`，已折叠后不再检测，避免循环闪烁；保留 Range API 检测 strong 截断。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`app-runtime.js`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：调大窗口已折叠的 scenes 不会自动恢复（需要刷新页面）；之前的 collapsed 状态不会自动消失，**用户必须刷新页面**才能看到稳定效果。

## 2026-08-04 修正质检概览图标与标题间距
- 用户想做什么：将质检概览标题图标和文字之间的间距设为 12px，并要求直接修改、不做校验。
- 已经完成了什么：定位到公共样式中的高优先级 `gap: 0` 覆盖；提高该板块专用选择器优先级并明确设置 `gap: 12px`；更新缓存版本。
- 改动了哪些文件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试中的缓存版本。
- 做过哪些验证：按用户要求未运行测试或浏览器校验。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面确认间距；修改尚未提交。

## 2026-08-04 按 Figma 553:4523 将标题机器人改回静态图
- 用户想做什么：指出质检概览标题区域不应使用视频，要求按 Figma 553:4523 改为静态图片。
- 已经完成了什么：重新读取节点结构和截图；从 Figma 553:4525 下载最终裁切好的 56×56 PNG 并接入标题；移除视频标签、视频专用样式和项目内 `ai-robot-loop.mp4` 副本，Downloads 原视频保持不变；更新缓存版本和回归测试。
- 改动了哪些文件：`assets/store-quality-overview/quality-overview-heading-robot.png`、`store-dashboard/index.html`、`store-dashboard/page.css`、`store-dashboard/page.js` 及 4 个相关测试；删除项目内 `assets/store-quality-overview/ai-robot-loop.mp4`。
- 做过哪些验证：新规则修改前专项测试 3 项失败、修改后专项测试 9/9；全量测试 178/178、2 个 JavaScript 语法检查、PNG 尺寸与哈希、视频引用扫描和 `git diff --check` 通过。
- 还有哪些待办或风险：内置浏览器安全策略阻止自动刷新 `file://` 页面，用户需手动刷新确认视觉；修改尚未提交。

## 2026-08-04 按 Figma 553:4383 最新稿移动质检概览机器人
- 用户想做什么：按再次更新的 Figma 553:4383 修改门店"质检概览"。
- 已经完成了什么：重新读取最新节点结构和截图；确认机器人已从结论卡上方移到标题左侧；结合用户上一条视频要求，将项目内静音循环 MP4 放入 56×56 标题媒体位，并按设计图的 139.13% 比例裁切；移除结论卡旧悬浮媒体与额外伪图层，保留最新实线、填充、组合卡投影、VS 和三张总结卡布局；更新缓存版本与回归测试。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：新规则修改前专项测试 3 项失败、修改后专项测试 9/9；全量测试 178/178、2 个 JavaScript 语法检查、项目视频引用和 `git diff --check` 通过。
- 还有哪些待办或风险：内置浏览器安全策略不允许自动刷新 `file://` 页面，用户需手动刷新确认视觉；修改尚未提交。

## 2026-08-04 将最新质检概览机器人重新替换为视频
- 用户想做什么：把 Figma 553:4383 版本中的机器人再次替换为指定 MP4。
- 已经完成了什么：检查视频为 640×640、约 8 秒、H.264 且无音轨；复制到项目资源目录并保留 Downloads 原文件；将 120px 静态机器人图片改为自动播放、静音、循环、移动端内联播放的视频，保留 `top: -88.5px`、`right: 60.5px` 和最新卡片投影；更新缓存版本和回归测试。
- 改动了哪些文件：`assets/store-quality-overview/ai-robot-loop.mp4`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：源文件与项目副本 SHA-256 一致；专项测试 9/9、全量测试 178/178、2 个 JavaScript 语法检查、视频元数据和 `git diff --check` 通过。
- 还有哪些待办或风险：内置浏览器安全策略不允许自动刷新 `file://` 页面，用户需手动刷新确认循环播放；修改尚未提交。

## 2026-07-31 拉取当前工作分支线上代码
- 用户想做什么：拉取当前工作分支的线上最新代码。
- 已经完成了什么：检查当前分支、上游、远程和本地未提交修改；执行 `git fetch --prune origin` 更新远程引用，再执行 `git pull --ff-only`；当前工作分支线上没有新提交，因此 HEAD 保持 `edd8b1b`，本地页面修改没有被覆盖。
- 改动了哪些文件：业务代码未因拉取发生变化；仅更新交接日志。
- 做过哪些验证：`git pull --ff-only` 返回 `Already up to date.`；`HEAD...@{upstream}` 为领先 0、落后 0；工作区原有修改仍完整存在。
- 还有哪些待办或风险：远程 `main` 从 `3a802a8` 更新到 `ab2b109`，但当前分支没有自动合并 `main`；本地仍有大量未提交修改。

## 2026-07-31 让对话与公域子卡自适应撑满高度
- 用户想做什么：让客户标签内部“对话 / 公域”两张子卡的边框高度自适应撑开。
- 已经完成了什么：将内部双列容器改为自动占用客户标签外层卡片的剩余高度；两张子卡继续横向排列并同步拉伸到底部对齐，不写死高度；纯白底、边框、16px 圆角和窄屏规则保持不变，并更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/leads-detail-figma-533-8216.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：回归测试先失败后通过；专项测试 48/48、全量测试 140/140、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认两张子卡高度均为 404.7px、底边完全一致，双列容器为 `flex: 1 1 auto`，外层原有 22px 底部内边距保持正常，控制台无警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 统一对话与公域子卡为纯白底色
- 用户想做什么：把客户标签内部“对话”和“公域”两张子卡的底色改成白色。
- 已经完成了什么：将两张子卡共用的浅蓝渐变背景改为纯白色；保留原有蓝色边框、16px 圆角、标签关系图、公域画像内容和动态等高布局，并更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/leads-detail-figma-533-8216.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：新增回归测试先失败后通过；专项测试 44/44、全量测试 140/140、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认“对话 / 公域”计算背景色均为 `rgb(255, 255, 255)`、背景图片为 `none`、圆角为 16px，控制台无警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 统一线索旅程内容卡为纯白底色
- 用户想做什么：把线索详情“线索旅程”中的卡片底色改成白色。
- 已经完成了什么：为线索详情的旅程内容卡增加页面级覆盖，5 张卡片统一使用纯白底；作用范围限定在线索详情，不影响客户详情页；现有边框、圆角、标签、悬浮效果和时间轴保持不变，并更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-figma-533-8216.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：新增回归测试先失败后通过；专项测试 30/30、全量测试 139/139、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认 5 张卡片计算背景色均为 `rgb(255, 255, 255)`、圆角均为 16px，控制台无警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 补齐客户标签外层卡片投影
- 用户想做什么：补上客户标签外层卡片漏掉的投影，并与 Figma 设计稿对齐。
- 已经完成了什么：重新读取 Figma 节点 `534:9085`，确认客户标签与客户洞察使用相同投影；将右侧卡片从无投影改为 `0 12px 28px rgba(37, 99, 235, 0.12)`，并更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-figma-533-8216.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：专项测试 29/29、全量测试 138/138、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认左右两卡计算后的投影完全一致、两卡同高 487.8px、仍为 436px + 800px 双列，无横向溢出和控制台警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 修复线索详情 1327px 响应式挤压
- 用户想做什么：修复 1327×990 宽度下客户洞察被压成竖排、顶部摘要被裁切的问题。
- 已经完成了什么：将响应式判断从浏览器宽度改为总览卡自身可用宽度；总览内容宽度不超过 1240px 时，客户洞察与客户标签自动上下排列，客户身份与摘要改为上下结构；提高摘要换行规则优先级，使 5 个胶囊完整左对齐换行；宽屏继续保持左右双列等高。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-figma-533-8216.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：回归测试先复现失败后修复；全量测试 138/138、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器在 1327px 下单列宽 1012px、摘要完整换行且无横向溢出，在 1567px 下仍为 436px + 800px 双列且两卡同高 487.7px，控制台无警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 按 Figma 533:8216 重排线索详情页面
- 用户想做什么：按 Figma 节点 `533:8216` 调整线索详情排版；新增图标下载到本地，意图、证据、对话、公域沿用已有图标。
- 已经完成了什么：返回按钮保留独立一行；新建顶部总览外层卡，将脱敏客户姓名、5 个摘要胶囊、客户洞察和客户标签合并其中；桌面端右侧标签最大 800px、左侧自适应且两卡动态等高；移除旧王先生独立卡；将客户意向演变移入线索旅程卡顶部，旅程继续按自身内容自然撑高；下载并本地调用新的 40px 客户头像，原有 4 类图标保持不变。
- 改动了哪些文件：`leads/index.html`、`leads/page.css`、`app-runtime.js`、`assets/lead-customer-avatar-figma-534-8898.png`、5 个线索详情相关测试、交接日志。
- 做过哪些验证：全量测试 137/137、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器在 1567px 下确认无横向溢出、顶部两卡同高 487.7px、右卡宽 800px、线索旅程自然高 928px；1200px 下自动单列且无控制台警告。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新加载新缓存版本。

## 2026-07-31 按 Figma 533:8765 调整顶部线索摘要栏
- 用户想做什么：将“返回线索视图 / 最后触达时间 / Lead ID / 门店 / 顾问姓名 / 线索状态”按 Figma 节点 `533:8765` 修改。
- 已经完成了什么：返回按钮改为 34px 高、13px/600；右侧 5 个信息胶囊改为 30px 高、14px/600、8px 间距、设计稿蓝色描边与浅色渐变；下载并本地引用 5 个 20px 图标；文案标点统一为设计稿中文冒号；保留 1320px 以下自动换行规则并更新样式缓存版本。
- 改动了哪些文件：`leads/index.html`、`leads/page.css`、`app-runtime.js`、5 个 `assets/lead-summary-*-figma-533-8765.svg`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：专项测试 39/39、全量测试 131/131、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认整行 36px、按钮 34px、胶囊均 30px、图标均 20px，1567px 视口无横向溢出，并对照设计稿截图检查视觉。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新样式版本。

## 2026-07-31 按 Figma 533:8804 调整客户洞察头部
- 用户想做什么：将原客户意向卡片的标题、小字和标签按 Figma 节点 `533:8804` 修改。
- 已经完成了什么：按 Figma 设计实现流程读取节点结构与截图；标题由“客户意向”改为“客户洞察”，使用 18px/600、`#162033`；说明文字使用 14px/400、22.4px 行高、`#64748b`；移除旧 AI 方形徽标，下载设计稿机器人图片到本地并按 56px 裁切展示；“高 / 传祺M8”标签统一为 24px 高并匹配设计稿颜色、圆角和间距；更新样式缓存版本。
- 改动了哪些文件：`leads/index.html`、`leads/page.css`、`assets/lead-customer-insight-figma-533-8804.png`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：专项测试 38/38、全量测试 130/130、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器确认头部高 56px、图片 56×56、标题 18px/600、小字 14px/400/22.4px、两个标签均高 24px，图片正常加载且顶部双卡高度差为 0。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新样式版本。

## 2026-07-31 修复旧高度同步脚本导致的顶部双卡空白
- 用户想做什么：按已确认的根因修复客户意向和客户标签底部大面积空白。
- 已经完成了什么：移除旧高度同步脚本对父级网格 `min-height` 和客户标签 `height` 的行内写入；高度同步函数只继续管理下方线索旅程卡片及其滚动区；ResizeObserver 改为观察客户意向、客户标签和客户资料卡，内容或窗口变化后可重新计算线索旅程高度；增加回归测试并更新脚本缓存版本。
- 改动了哪些文件：`app-runtime.js`、`leads/page.js`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、交接日志。
- 做过哪些验证：回归测试修改前稳定失败、修复后通过；全量测试 129/129、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器在 1567px 下两张外层卡片均为 429px、异常空白从约 403–406px 降到 1–4px，在 1400px 下两卡均为 493px且内部子卡仍为 348px；1200px 窄屏下旧行内高度保持为空。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新缓存版本。

## 2026-07-31 诊断顶部双卡大面积空白根因
- 用户想做什么：确认客户意向和客户标签底部仍有大面积空白的原因。
- 已经完成了什么：按 `ask-matt` 路由使用问题诊断流程；启动本地页面并建立实际尺寸失败检查，确认两卡高 811px、内容仅约 348–384px、底部空白约 403–406px；定位旧版 `syncLeadDetailJourneyHeight()` 仍给父级写入 `min-height: 811px`、给客户标签写入 `height: 811px`；临时清除后两卡立即变为 429px、空白降至 21–24px，随后 ResizeObserver 再次写回并复现。
- 改动了哪些文件：未修改业务代码；仅更新交接日志。
- 做过哪些验证：同一浏览器尺寸检查可稳定失败；单变量清除旧行内高度后立即通过，确认根因不是 CSS 网格、内部子卡或固定最小高度。
- 还有哪些待办或风险：尚未实施修复；需要改造 `app-runtime.js` 的旧高度同步逻辑，并新增能覆盖实际空白的回归测试。

## 2026-07-31 实现客户意向与客户标签外框动态双向等高
- 用户想做什么：让客户意向和客户标签两个外层卡片先按内容计算自然高度，再取较大值作为同一行高度；内部子卡不拉伸。
- 已经完成了什么：取消客户标签外框的内容高度覆盖，使两个外层卡片重新参与父级网格行拉伸；父级行按两边自然高度较大值动态等高，白色背景、边框和圆角同步拉伸；内部“对话 / 公域”继续保持内容高度和顶部对齐；宽度、横向双列、窄屏与下方板块不变；更新缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：较矮外层卡片底部留白属于动态等高的预期结果；需用户手动刷新 `file://` 页面确认视觉。

## 2026-07-30 让客户标签白色外框自适应高度
- 用户想做什么：让客户标签的白色外框也按照内容自适应高度。
- 已经完成了什么：客户标签外框改为顶部内容对齐并按自身内容高度收口，不再随左侧客户意向拉伸；内部“对话 / 公域”继续按内容高度展示；横向双列、右侧 600–800px 响应式宽度和窄屏规则保持不变；更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：客户标签与客户意向底边在内容高度不同时不会对齐；需用户手动刷新 `file://` 页面确认视觉。

## 2026-07-30 取消客户标签内部子卡高度填充
- 用户想做什么：保留客户意向与客户标签外框等高，同时去掉客户标签内部“对话 / 公域”子卡被拉长后产生的底部空白。
- 已经完成了什么：将客户标签内部双列容器从填满剩余高度改为内容高度，并让两张子卡分别按自身内容顶部对齐；外层客户标签仍与左侧客户意向等高，横向双列、800px 右侧宽度和窄屏规则不变；更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：浏览器安全策略阻止自动刷新 `file://` 页面，需用户手动刷新确认内部子卡底部空白已消失。

## 2026-07-30 让客户标签与客户意向自适应等高
- 用户想做什么：让右侧客户标签的高度与左侧客户意向自适应对齐。
- 已经完成了什么：将等高逻辑放到父级网格行统一控制；父级比较两边内容最小高度，取较大值作为整行高度并自动拉伸另一边；发现网格默认把容器剩余高度分配给自动行后，增加顶部内容对齐规则，避免两卡被一起拉高产生大面积空白；下方两卡保持内容高度；更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：浏览器安全策略阻止自动刷新 `file://` 页面，需用户手动刷新确认两张卡片实际底边对齐。

## 2026-07-28 场景标签/规则名称自适应
- 用户想做什么：场景标签位置够就全部显示，不够就只显示 1 个 + "..."；规则名称位置不够时末尾显示 "..."，悬停 title 显示完整。
- 已经完成了什么：3 处 render 函数（厂端 `factory-dashboard.js:6318`、门店 `app-runtime.js:4303`、销售 `app-runtime.js:15479`）拆成「主渲染 + 共享 HTML 子函数」；新增 `autoCollapseIssueRuleScenes` / `autoCollapseSalesReviewSceneTags` 用 `ResizeObserver` 检测 `scrollWidth > clientWidth` 决定是否折叠成 1 个 + "..."；3 处 list 渲染入口挂载 autoCollapse；3 处 CSS 给 `.issue-rule-name strong` 加 `max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`；3 处 HTML 给 strong 加 `title="完整名称"`。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`app-runtime.js`、`factory-dashboard/factory-dashboard.css`、`store-dashboard/page.css`、`sales-dashboard/page.css`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过。
- 还有哪些待办或风险：发现 `.issue-rule-scenes` 是 `flex-wrap: wrap`，换行显示不触发 scrollWidth 检测；后续修了 nowrap + overflow hidden，但用户反馈"还是硬塞"。

## 2026-07-28 规则名 + 场景标签自适应（最终版）
- 用户想做什么：规则名 1 行不换行，优先给规则名展示空间，溢出用 ellipsis + title 悬停；场景标签位置不够完全显示就只显示 1 个 + "..."，挤压的应该是场景标签而不是规则名。
- 已经完成了什么：3 处 strong CSS（厂端 `factory-dashboard.css:1375`、门店 `store-dashboard/page.css:2111`、销售 `sales-dashboard/page.css:478`）加 `flex: 1 1 0; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; overflow-wrap: anywhere;`（厂端 `flex: 1 1 0` 强占满剩余空间，门店/销售 column 布局用 `flex: 0 1 auto`）；厂端 `.issue-rule-scenes` 和 `.issue-rule-tags` 加 `flex: 0 0 auto;`（按内容宽度，可被挤压）；场景标签保持 nowrap + overflow hidden；JS 折叠逻辑保持（scrollWidth > clientWidth → 折叠成 1 个 + "..."，折叠后检测能否展开）。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.css`、`store-dashboard/page.css`、`sales-dashboard/page.css`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（建议刷新三端问题规则分析页面，规则名太长会 ellipsis + 悬停 title，5 标签硬塞时折叠成 1 个 + "..."）。

## 2026-07-28 规则名优先 + 场景标签按需折叠
- 用户想做什么：规则名永远优先展示完整（用 ellipsis + title 悬停）；标签次之，5 标签硬塞时折叠成 1 个 + "..."，让位给规则名。
- 已经完成了什么：3 处 JS measure 函数（厂端 `factory-dashboard.js:6362`、门店 `app-runtime.js:4347`、销售 `app-runtime.js:15533`）增加 `isRuleNameEllipsis` 检测，规则名 scrollWidth > clientWidth（被 ellipsis 截断）时主动折叠 5 标签成 1 个 + "..."；3 处 ResizeObserver 同时监听 scenes 和 strong 元素，强规则名被截断时也触发 measure；collapsed 状态不再自动恢复（避免循环折叠/展开）；CSS 保持 strong `flex: 1 1 0` + scenes `flex: 0 0 auto`（之前已改）。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`app-runtime.js`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（建议刷新三端问题规则分析页面，强规则名场景应折叠 5 标签为 1 个 + "..."，规则名完整 + 悬停 title 看完整）。

## 2026-07-28 规则名 + 标签悬停浮窗
- 用户想做什么：规则名出现 ...（被 ellipsis 截断）时悬停浮窗显示完整；标签出现 ...（折叠成 1 个 + ...）时悬停浮窗显示完整。
- 已经完成了什么：3 处 CSS（厂端 `factory-dashboard.css:1368`、门店 `store-dashboard/page.css:2100`、销售 `sales-dashboard/page.css:380`）给 `.issue-rule-scene-more[open] .issue-rule-scene-popover` 加上 `:hover` 和 `:focus-within` 选择器，让悬停和键盘焦点也能触发 popover；3 处 CSS（厂端 `factory-dashboard.css:1295`、门店 `store-dashboard/page.css:2011`、销售 `sales-dashboard/page.css:292`）给 `.issue-rule-row:has(.issue-rule-scene-more[open])` 加上 `:hover` 和 `:focus-within`，hover 标签时提升 row z-index 避免被其他行覆盖；规则名 HTML 已有 `title="完整名称"`（之前加的），浏览器原生 tooltip 显示完整。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.css`、`store-dashboard/page.css`、`sales-dashboard/page.css`。
- 做过哪些验证：`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（建议刷新三端问题规则分析页面，hover 标签 "..." 看完整标签列表，hover 规则名看完整规则名）。

## 2026-07-28 规则名 + 标签悬停浮窗（自定义样式）
- 用户想做什么：规则名出现 "..."（被 ellipsis 截断）时悬停浮窗显示完整；标签出现 "..." 时悬停浮窗显示完整；规则名浮窗要和标签浮窗同一视觉风格，不要浏览器原生 tooltip。
- 已经完成了什么：3 处 HTML（厂端 `factory-dashboard.js:6579`、门店 `app-runtime.js:4398`、销售 `app-runtime.js:16128`）把 strong 改用 `<span class="issue-rule-name-wrap" data-rule-name-popover><strong>...</strong><span class="issue-rule-name-popover">...</span></span>` 包裹，移除 strong 原生 `title` 属性；3 处 CSS（厂端 `factory-dashboard.css:1381`、门店 `store-dashboard/page.css:2115`、销售 `sales-dashboard/page.css:482`）加 `.issue-rule-name-wrap` 样式（position relative + inline-flex + flex 1 1 0）、`.issue-rule-name-wrap > strong` 样式（flex 1 1 0 + ellipsis）、`.issue-rule-name-popover` 样式（absolute 定位 + 复用场景标签 popover 视觉：白底、圆角、阴影、padding）、`[data-rule-name-truncated="true"]:hover .issue-rule-name-popover` 显示规则；3 处 JS measure（厂端 `factory-dashboard.js:6360`、门店 `app-runtime.js:4344`、销售 `app-runtime.js:15538`）检测 strong ellipsis 并设置 strongWrap `data-rule-name-truncated` 属性；门店原本无 title 属性，不需删除。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`app-runtime.js`、`store-dashboard/page.css`、`sales-dashboard/page.css`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（建议刷新三端问题规则分析页面，强规则名 hover 浮窗显示完整规则名，短规则名不显示浮窗；标签 "..." hover 浮窗显示完整标签列表）。

## 2026-07-28 规则名 + 标签悬停浮窗 v2（去掉 wrap 嵌套）
- 用户想做什么：解决 v1 嵌套 wrap 结构导致的 strong scrollWidth/clientWidth 计算异常（短规则名也被误判为截断、场景标签被错误折叠）。
- 已经完成了什么：3 处 HTML（厂端 `factory-dashboard.js:6587`、门店 `app-runtime.js:4406`、销售 `app-runtime.js:16144`）去掉 wrap 嵌套，strong 直接是 `.issue-rule-name-line` 子项，加 `class="issue-rule-name-text"` + `data-rule-name-ellipsis-target`，popover 作为 strong sibling；3 处 CSS（厂端 `factory-dashboard.css:1387`、门店 `store-dashboard/page.css:2115`、销售 `sales-dashboard/page.css:482`）删除 `.issue-rule-name-wrap` 样式，调整 strong 选择器为 `.issue-rule-name-line > .issue-rule-name-text`（`position: relative` 让 popover 绝对定位相对 strong），hover 触发改用 `.issue-rule-name-line:has(strong[data-rule-name-truncated="true"]):hover`；3 处 JS measure（厂端 `factory-dashboard.js:6360`、门店 `app-runtime.js:4344`、销售 `app-runtime.js:15538`）用 strong 自身做 truncated 标记（设置/删除 `data-rule-name-truncated` 属性）。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`app-runtime.js`、`store-dashboard/page.css`、`sales-dashboard/page.css`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证渲染效果（建议刷新三端问题规则分析页面：短规则名 + 5 标签应全部显示，强规则名 + 5 标签应折叠 5 标签为 1 个 + ...，hover 触发浮窗）。

## 2026-07-28 measure 函数 Range API + 双向自动恢复
- 用户想做什么：上一版去掉 wrap 嵌套后短规则名仍被折叠（measure 函数误判），需要修复 measure 检测准确性。
- 已经完成了什么：3 处 measure（厂端 `factory-dashboard.js:6360`、门店 `app-runtime.js:4344`、销售 `app-runtime.js:15553`）改用 `document.createRange()` + `getBoundingClientRect()` 测 strong 文本实际宽度（Range API 比 `scrollWidth`/`clientWidth` 在嵌套 flex 容器内更准确）；measure 改成**双向自动恢复**：强规则名或 scenes 溢出时折叠，已折叠状态下若位置够（strong 不截断 + scenes 不溢出）自动恢复 5 标签全显示；之前 collapsed 状态是"只折叠不恢复"（导致刷新前一直折叠）。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`app-runtime.js`。
- 做过哪些验证：`node --check` 语法通过；`node --test tests/*.test.js` 208/216 通过，8 个失败和本次改动无关。
- 还有哪些待办或风险：未在浏览器实际验证（**用户必须刷新页面**才能触发新的 measure 逻辑；之前的 collapsed 状态不会自动消失）。

## 2026-06-04 第一轮落地全局日期筛选组件
- 用户想做什么：确认按“全局通用日期筛选组件”方案开始实现，并把厂端这块时间筛选也接进来。
- 已经完成了什么：新增公共组件工具 `voice-qc-admin-html/date-filter-component-utils.js`，提供通用日期触发器和日期面板渲染；新增测试 `voice-qc-admin-html/tests/date-filter-component-utils.test.js`；门店兼容层 `store-date-control-utils.js` 改为转调公共组件；门店、厂端、销售的页面 bootstrap 已先加载公共组件；`app-runtime.js` 中门店、销售日期渲染以及 `factory-dashboard/factory-dashboard.js` 中厂端日期渲染都已改成调用公共组件。
- 改动了哪些文件或组件：`docs/superpowers/specs/2026-06-04-global-date-filter-component-design.md`、`docs/superpowers/plans/2026-06-04-global-date-filter-component.md`、`voice-qc-admin-html/date-filter-component-utils.js`、`voice-qc-admin-html/tests/date-filter-component-utils.test.js`、`voice-qc-admin-html/store-date-control-utils.js`、`voice-qc-admin-html/app-runtime.js`、`voice-qc-admin-html/store-dashboard/page.js`、`voice-qc-admin-html/store-dashboard/index.html`、`voice-qc-admin-html/factory-dashboard/page.js`、`voice-qc-admin-html/factory-dashboard/index.html`、`voice-qc-admin-html/factory-dashboard/factory-dashboard.js`、`voice-qc-admin-html/sales-dashboard/page.js`、`voice-qc-admin-html/sales-dashboard/index.html`、根目录 `handoff-log.md`。
- 做过哪些验证：`node --test tests/date-filter-component-utils.test.js` 通过；`node --test tests/store-date-control-utils.test.js` 通过；`node --check app-runtime.js`、`node --check date-filter-component-utils.js`、`node --check store-date-control-utils.js`、`node --check store-dashboard/page.js`、`node --check sales-dashboard/page.js`、`node --check factory-dashboard/page.js`、`node --check factory-dashboard/factory-dashboard.js` 均通过；浏览器实测门店页 `data-store-date-trigger` 和面板正常；厂端页 `data-factory-date-trigger` 和面板正常。
- 还有哪些待办或风险：销售页浏览器回归未通过。当前现象是点击 `data-sales-range-mode="custom"` 后没有切到自定义态，`salesRecommendDateControl` 仍停留在快捷范围 tabs；需要继续排查销售页事件链路是否在点击 `custom` 后被其它刷新逻辑覆盖。

## 2026-06-04 调整厂端日期面板左对齐
- 用户想做什么：让厂端日期面板左对齐到日期范围选择框，而不是继续向左侧溢出。
- 已经完成了什么：先把 `voice-qc-admin-html/factory-dashboard/factory-dashboard.css` 中日期面板定位从 `right: 0; left: auto;` 改成了 `left: 0; right: auto;`；同时更新厂端样式资源版本号避免浏览器继续吃旧 CSS 缓存。
- 改动了哪些文件或组件：`voice-qc-admin-html/factory-dashboard/factory-dashboard.css`、`voice-qc-admin-html/factory-dashboard/page.css`、`voice-qc-admin-html/factory-dashboard/index.html`、根目录 `handoff-log.md`。
- 做过哪些验证：`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/page.js` 通过；但后来发现浏览器运行页仍被其它样式覆盖，只改 CSS 还不够，这也是后续继续改成组件行内定位的原因。
- 还有哪些待办或风险：如果后续要统一三端的定位策略，可以继续把同样的配置能力按需接到门店和销售。

## 2026-06-04 修正厂端日期组件外层样式
- 用户想做什么：指出厂端日期区域样式不对，不要再是一整条独立蓝框，要使用时间组件的形态。
- 已经完成了什么：把厂端日期组件挂载点从单独的 `factory-filter-date-row` 移回时间筛选后面，同一层级渲染；删除旧的整行外层壳子样式；把厂端日期组件容器改成和时间筛选同类的紧凑独立组件；同时更新厂端 CSS/JS 资源版本号避免缓存旧样式和旧结构。
- 改动了哪些文件或组件：`voice-qc-admin-html/factory-dashboard/factory-dashboard.js`、`voice-qc-admin-html/factory-dashboard/factory-dashboard.css`、`voice-qc-admin-html/factory-dashboard/page.js`、`voice-qc-admin-html/factory-dashboard/page.css`、`voice-qc-admin-html/factory-dashboard/index.html`、根目录 `handoff-log.md`。
- 做过哪些验证：`node --check factory-dashboard/factory-dashboard.js` 通过；`node --check factory-dashboard/page.js` 通过；浏览器实测确认厂端日期范围不再占满一整条蓝框，而是缩回为独立日期框，日期面板仍可正常展开。
- 还有哪些待办或风险：当前厂端在这个视口宽度下会换到下一行显示，但已经不是整条拉满样式；如果后续还要强制和时间筛选保持同一行，需要继续调厂端筛选区的换行策略和宽度分配。

## 2026-06-04 扩大全局日期组件接入范围到厂端
- 用户想做什么：进一步明确厂端看板顶部这组“时间”筛选也要使用同一个日期筛选组件。
- 已经完成了什么：确认需求范围已经从“门店抽公共组件”扩展成“门店、销售、厂端等页面共用同一套日期筛选组件”。
- 改动了哪些文件或组件：根目录 `handoff-log.md`。
- 做过哪些验证：结合浏览器批注和现有页面结构，确认厂端当前也存在独立时间筛选与日期面板实现，适合纳入统一组件方案。
- 还有哪些待办或风险：需要把厂端一起纳入第一轮组件设计，否则后续还会再拆一次接口。

## 2026-05-13 16:40
- 用户想做什么：客户旅程列表顶部 padding 去掉；顶部门店旅程圆形意向标识改为 30x30px、字号 13px，其他门店同样处理。
- 已经完成了什么：列表顶部 padding 改为 0；所有顶部旅程圆标尺寸和字号已统一，连接线位置同步调整。
- 改动了哪些文件：`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，圆标为 30px/13px，顶部 padding 为 0，无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 15:55
- 用户想做什么：修改未改的 8 条批注，包括顶部门店信息字号、AI画像文案、画像合并标题和客户标签说明。
- 已经完成了什么：门店顾问/首次线索统一为 14px；AI画像说明、合并标题、客户标签说明均按批注替换；标题保持“AI画像”。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，4 个 `.customer-hero-store-fact` 字号均为 14px，文案为批注要求，无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-13 15:40
- 用户想做什么：右侧区域与左侧筛选条件不联动；左侧筛选变化时，右侧 AI画像和客户标签不变化；标题改为“AI画像”。
- 已经完成了什么：标题已改名；移除运行时对右侧单店标签和画像合并内容的动态覆盖；右侧客户标签保持静态。
- 改动了哪些文件：`leads/index.html`、`app-runtime.js`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 点击左侧筛选按钮，旅程数量变化但右侧 AI画像和客户标签文本完全一致；工作区和 Desktop 页面均无控制台错误、无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 15:30
- 用户想做什么：让 `customer-intention-profile-box` 容器高度自适应；下方增加客户标签；整体布局参考线索详情页右侧。
- 已经完成了什么：画像容器不再撑满整列；下方新增“客户标签”卡片和 10 个标签词云；单列时词云设置最大宽度并居中。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，画像容器 `flex: 0 0 auto`，客户标签显示 10 个，桌面和 390px 窄屏无横向溢出、无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-13 15:20
- 用户想做什么：AI智能画像补齐，把三个卡片放到一个容器内，UI 样式参考附件。
- 已经完成了什么：三张画像卡已包进统一浅蓝容器，卡片样式改为圆角浅底细蓝边，并补充 AI 标识。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，均显示 1 个容器、3 张卡和 AI 标识，无横向溢出、无控制台错误；Desktop 390px 窄屏正常。
- 还有哪些待办或风险：暂无。

## 2026-05-13 15:30
- 用户想做什么：让 `customer-intention-profile-box` 容器高度自适应；下方增加客户标签；整体布局参考线索详情页右侧。
- 已经完成了什么：画像容器不再撑满整列；下方新增“客户标签”卡片和 10 个标签词云；单列时词云设置最大宽度并居中。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，画像容器 `flex: 0 0 auto`，客户标签显示 10 个，桌面和 390px 窄屏无横向溢出、无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-13 14:10
- 用户想做什么：把 AI画像智能补齐里三个卡片的 padding 统一改为 16px。
- 已经完成了什么：`.customer-intention-body .intention-item` 和 `.customer-intention-merged` 的 padding 已统一为 16px。
- 改动了哪些文件：`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 读取计算样式，工作区和 Desktop 页面三张卡 padding 均为 `16px 16px 16px 16px`。
- 还有哪些待办或风险：暂无。

## 2026-05-13 14:05
- 用户想做什么：修改右侧 AI 画像模块：删完整度、改其他门店为杭州西湖门店、删缺失提示、替换合并画像文案。
- 已经完成了什么：四条批注均完成，运行时覆盖文案也同步更新。
- 改动了哪些文件：`leads/index.html`、`app-runtime.js`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，`badgeCount=0`、第一标签为“杭州西湖门店 (单店视角)”、第一卡缺失提示数量为 0、新合并画像文案显示正常。
- 还有哪些待办或风险：暂无。

## 2026-05-13 13:55
- 用户想做什么：客户详情顶部区域左侧门店与顾问显示参考附件，但右侧旅程部分要保留。
- 已经完成了什么：顶部卡片改为“左侧门店信息 + 右侧旅程节点”结构，杭州橙色、上海蓝色；保留无/高/中/高节点和话术命中率。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，均无控制台错误；确认 storeTitles、statuses、facts、markers、stages、scores 都正常；390px 窄屏无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 13:35
- 用户想做什么：客户旅程区域按附件增加筛选，可查看全部/上海浦东门店/杭州西湖门店；不同门店旅程颜色与顶部保持一致。
- 已经完成了什么：增加 3 个筛选按钮和点击交互；为旅程条目增加门店标识；上海旅程保持蓝色，杭州旅程改为橙色。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`、`app-runtime.js`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，均无控制台错误；筛选数量分别为全部 4、上海 3、杭州 1；桌面和 390px 窄屏无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 12:20
- 用户想做什么：按附件把客户旅程区域修成时间轴展示，数据与顶部旅程保持一致，并在每段旅程时间上方显示门店名称。
- 已经完成了什么：将下方客户旅程从左右分栏卡片改为时间轴卡片；下方 4 条记录与顶部 4 个旅程节点对应；每条左侧增加门店名、时间、阶段等级和话术命中率。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，均无控制台错误；确认 itemCount=4、每条有门店名、顶部/下方日期阶段命中率一致；桌面和 390px 窄屏无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 11:55
- 用户想做什么：将第一家门店的“高”节点改成“无”，并把“客户旅程与意向轨迹”改成“客户旅程”。
- 已经完成了什么：两处文案已修改，Desktop 目录同步完成。
- 改动了哪些文件：`leads/index.html`；同步改了 `/Users/jerry/Desktop/voice-qc/leads/index.html`。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，第一节点为“无”，标题为“客户旅程”，无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-13 11:45
- 用户想做什么：按 14 条浏览器批注继续调整客户详情页，包括删除 Lead ID、去掉本店后缀、改摘要为 2 条线索/2 家门店、补话术命中率等。
- 已经完成了什么：所有批注目标已完成；顶部旅程节点展示为首触跟进、到店接待、试乘试驾，并显示 30%/50%/30% 命中率。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`、`app-runtime.js`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，页面说明、摘要、Lead ID、门店标签、节点文案、命中率、下方明细“邀约”删除均符合预期；移动端无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 11:05
- 用户想做什么：处理 4 条浏览器批注：删除最近联系、涉及改为 3 家门店、删除“其他门店 ·”前缀、删除顶部门店胶囊。
- 已经完成了什么：工作区页面和 Desktop 页面目标区域已按批注显示；工作区运行时同步改为 3 家门店且不再覆盖门店胶囊。
- 改动了哪些文件：`leads/index.html`、`app-runtime.js`；同步改了 `/Users/jerry/Desktop/voice-qc/leads/index.html`。
- 做过哪些验证：Playwright 检查两份页面，目标摘要为“139****1268 · 关联 5 条线索 · 涉及 3 家门店”，`#customerDetailStore` 不存在，杭州西湖门店标签无“其他门店 ·”前缀。
- 还有哪些待办或风险：Desktop 的 `app-runtime.js` 修改被拒，右侧 AI 画像的旧运行时文案未处理。

## 2026-05-13 10:55
- 用户想做什么：纠正上轮理解错误，要求在顶部截图区域内、客户摘要文案下方增加旅程示意图；多家门店时多行展示。
- 已经完成了什么：在客户详情顶部卡片加入 2 行门店旅程示意，保留原客户摘要和下方详细旅程列表。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录同名页面与样式文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面均无报错；确认顶部有 2 行示意和“高/中/高”等节点；移动端无横向溢出。
- 还有哪些待办或风险：暂无。

## 2026-05-13 10:30
- 用户想做什么：删除 `/Users/jerry/Desktop/voice-qc/leads/index.html` 客户详情页截图中的跨店评估内容。
- 已经完成了什么：移除客户详情模板里的 `cross-store-discrepancy customer-store-insight` 模块。
- 改动了哪些文件：`leads/index.html`；`/Users/jerry/Desktop/voice-qc/leads/index.html`。
- 做过哪些验证：`rg` 确认“本门店评估 / 他店评估 / 认知差”等目标文案已删除；Playwright 打开页面后 `errors=[]`，`removed=[]`。
- 还有哪些待办或风险：暂无。
## 2026-05-13 15:20
- 用户想做什么：AI智能画像补齐，把三个卡片放到一个容器内，UI 样式参考附件。
- 已经完成了什么：三张画像卡已包进统一浅蓝容器，卡片样式改为圆角浅底细蓝边，并补充 AI 标识。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，均显示 1 个容器、3 张卡和 AI 标识，无横向溢出、无控制台错误；Desktop 390px 窄屏正常。
- 还有哪些待办或风险：暂无。
## 2026-05-13 16:10
- 用户想做什么：需要顶部旅程容器超过 2 家门店时默认折叠；同时模拟成 3 家门店、3 条线索。
- 已经完成了什么：新增杭州滨江门店和顾问周明；默认摘要改为 3 条线索/3 家门店；新增“展开查看更多 / 收起”按钮和折叠逻辑。
- 改动了哪些文件：`leads/index.html`、`app-runtime.js`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，默认显示 2 家，点击后显示 3 家；390px 窄屏无横向溢出。
- 还有哪些待办或风险：暂无。
## 2026-05-13 16:20
- 用户想做什么：AI画像补全新增杭州滨江门店画像；客户标签页新增基于杭州滨江门店画像输出的标签。
- 已经完成了什么：新增杭州滨江门店单店画像；合并画像文案加入第三排空间和家庭出行场景；客户标签新增 3 个滨江相关标签。
- 改动了哪些文件：`leads/index.html`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，AI画像单店标签为 3 个，客户标签为 13 个；切换左侧滨江筛选后右侧不变；桌面和 390px 窄屏无横向溢出、无控制台错误。
- 还有哪些待办或风险：暂无。
## 2026-05-13 16:30
- 用户想做什么：删除 AI画像三卡片外层浅蓝容器视觉，但保留里面内容自适应；删除顶部旅程里的话术命中率。
- 已经完成了什么：外层容器不再显示边框/背景/内边距；内部画像卡片宽度自适应；顶部旅程所有命中率徽标已删除。
- 改动了哪些文件：`leads/index.html`、`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，顶部旅程命中率数量为 0，画像外层容器透明无边框，内部卡片宽度一致。
- 还有哪些待办或风险：暂无。

## 2026-05-13 16:35
- 用户想做什么：删除客户旅程标题区和列表区之间的分割线，并删除旅程列表外层底色。
- 已经完成了什么：客户旅程标题区不再有底部分割线；旅程列表外层背景改透明。
- 改动了哪些文件：`voice-qc-admin.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 检查工作区和 Desktop 页面，标题区 border-bottom 为 0，列表外层 background 为透明/none。
- 还有哪些待办或风险：暂无。
## 2026-05-13 16:50
- 用户想做什么：门店看板录音复盘里，Tab 顺序调整为优势发掘第一，短板改善第二。
- 已经完成了什么：按钮顺序和默认选中态已调整；内容面板顺序同步调整，默认展示优势发掘。
- 改动了哪些文件：`store-dashboard/index.html`；同步改了 `/Users/jerry/Desktop/voice-qc/store-dashboard/index.html`。
- 做过哪些验证：Playwright 打开 Desktop 页面，确认 Tab 顺序、默认 active、默认面板、优势列表 5 条均正确，无控制台错误。
- 还有哪些待办或风险：暂无。
## 2026-07-30 统一线索旅程卡片为纯白底色
- 用户想做什么：将线索详情中所有旅程内容卡片的底色改为白色。
- 已经完成了什么：为线索详情旅程卡增加页面级纯白背景覆盖，五张卡片全部生效；保留卡片顶部日期、阶段标签、录音 ID、边框、圆角和时间轴样式；更新页面样式缓存版本。

### 2026-07-28 抽公共文件 + 200ms 冷却 + 折叠自动恢复
- 用户想做什么：用户选 2（grill-me 问题）——把厂端、门店、销售 3 处完全重复的 measure/autoCollapse 代码抽到共享文件。
- 已经完成了什么：① 新建 `shared/issue-rule-list.js`（164 行，UMD 兼容，Node `module.exports` + 浏览器 `window.IssueRuleList`），暴露 `createAutoCollapser({ renderHtml, previewLimit, collapsedLimit })` / `setupRowDrilldown` / `renderSceneTagsHtml` / `renderSceneTags` / `escapeHtml` / `MEASURE_COOLDOWN`；② 删 3 处 measure 函数（厂端 `factory-dashboard.js:6349-6417`、门店 `app-runtime.js:4333-4402`、销售 `app-runtime.js:15544-15612`，各 ~100 行），call site 缩为 1 行；③ 3 处 page.js 加 shared 加载：厂端 `factory-dashboard/page.js:5`、门店 `store-dashboard/page.js:5`、销售 `sales-dashboard/page.js:5`；④ 3 处 index.html page.css + page.js version 同步更新为 `20260805-issue-rule-shared`；⑤ 10 个测试文件 12 处硬编码 version 同步更新（`tests/factory-issue-overview-figma-565-5348.test.js:70`、`tests/factory-recording-summary-visibility.test.js:22`、`tests/factory-quality-overview-match.test.js:83`、`tests/factory-dashboard-panel-spacing.test.js:25`、`tests/store-advisor-pagination.test.js:13-14`、`tests/store-core-metrics-figma.test.js:67`、`tests/store-review-sop-toolbar.test.js:13`、`tests/store-quality-overview-figma.test.js:97`、`tests/store-dashboard-layout-consistency.test.js:33-34`、`tests/store-recording-summary-visibility.test.js:21`）；⑥ 3 处 page.css 内部 @import version 同步更新（厂端 `factory-dashboard/page.css:2-4`、门店 `store-dashboard/page.css:2-3`、销售 `sales-dashboard/page.css:2-3`）。
- 改动了哪些文件：`shared/issue-rule-list.js`（新建，164 行）；`factory-dashboard/factory-dashboard.js`（-90 行）；`app-runtime.js`（-180 行）；3 个 `page.js`（+3 行）；3 个 `index.html`（version 同步）；3 个 `page.css`（version 同步）；10 个 `tests/*.test.js`（version 同步）。
- 做过哪些验证：`node --check` 全部通过；`node --test tests/*.test.js` 208/216 通过（重构前 208/216，重构后**完全相同**），剩 8 个失败都是 store-review-sop-toolbar / store-recording-review 等待未来功能，**和重构无关**。
- 还有哪些待办或风险：未在浏览器实际验证（**必须硬刷新 Cmd+Shift+R** 加载新 shared 文件）；重构**未做**门点 renderHtml 函数补全（之前发现门店 em 缺 title/tag-label/popover，但用户未明确要求改 renderHtml）；若浏览器用旧 version 缓存会找不到 `IssueRuleList` 全局，报错"IssueRuleList is not defined"。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：相关专项测试 25/25、全量测试 130/130、`git diff --check` 均通过。
- 还有哪些待办或风险：该改动已于后续按用户要求随线索旅程改版一并撤回。
## 2026-07-30 为线索旅程卡片顶部增加信息栏底色
- 用户想做什么：让日期、阶段标签和录音 ID 区域单独突出，并增加底色。
- 已经完成了什么：五张旅程卡顶部统一增加铺满宽度的浅蓝信息栏 `#f5f8ff`，设置 12px×16px 内边距、顶部圆角和底部分隔线；正文卡片继续保持纯白，阶段标签原色和录音跳转不变。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：相关专项测试 26/26、全量测试 131/131、`git diff --check` 均通过。

### 2026-08-05 运行 sync-versions.js 同步剩余测试版本
- 用户想做什么：用户选 3（grill-me 最后一题）—— 用脚本自动同步 page.js / index.html / 测试文件中的版本串，避免手动改漏。
- 已经完成了什么：① `node scripts/sync-versions.js` 自动识别 page.js / index.html 暴露的 6 个 `allowedVersions`（`20260805-issue-rule-shared`、`20260804-shared-insight-heading-icon`、`20260804-ai-lead-validity`、`20260612customer-journey-filter`、`20260716133000`、`20260804-pagination-total-copy`），用改进后的正则 `/(['"])((?:[^'"]{0,200}?)?(20\d{6,}[\w-]*))\1/g` 扫描 6 个测试文件并把残留的 `20260729sales-review-robot` 全部替换为 `20260805-issue-rule-shared`，共 2 个文件 2 处替换（`tests/sales-review-robot-interaction.test.js:12`、`tests/store-review-sop-toolbar.test.js:12`）；② `node scripts/check-version-sync.js` 校验结果："All test file versions are in sync with page.js"，无遗漏。
- 改动了哪些文件：`tests/sales-review-robot-interaction.test.js`（version 同步）、`tests/store-review-sop-toolbar.test.js`（version 同步）。
- 做过哪些验证：`node scripts/sync-versions.js` 退出 0，输出 "2 test file(s) updated, 2 replacement(s)"；`node scripts/check-version-sync.js` 输出 "All test file versions are in sync"；`git diff` 确认仅 2 个文件各 1 行变更（替换为正确 version 字符串）；`node --test` 单跑这 2 个文件除 1 个原本就失败的断言（`data-sales-review-sop-search` 未来功能）外其余通过，**失败数和重构前完全一致**。
- 还有哪些待办或风险：未在浏览器实际验证加载新 shared 文件（**用户必须硬刷新 Cmd+Shift+R**）；脚本在新增 page.js / index.html version 时会自动收录，无须手改；`stash@{0}`（合并 main 之前的 .gitignore/spec/handoff-archive.md 备份）仍可恢复。
- 还有哪些待办或风险：该改动已于后续按用户要求随线索旅程改版一并撤回。
## 2026-07-30 修复线索旅程滚动后连线中断
- 用户想做什么：解决线索旅程时间轴在列表中段断开的现象。
- 已经完成了什么：确认旧连线高度只覆盖可视区域，改为每条记录分别绘制连续轴段并向上下延伸，首尾在圆点处收口。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：回归测试修复后 5/5；相关专项测试 24/24、全量测试 132/132、`git diff --check` 均通过。
- 还有哪些待办或风险：该改动已于后续按用户要求随线索旅程改版一并撤回。
## 2026-07-30 去除线索旅程时间轴左侧留白
- 用户想做什么：去掉时间轴连线左侧的多余间距。
- 已经完成了什么：移除旅程条目 18px 左内边距，将轴线横向位置从 28px 调整到 10px，仅保留圆点半径所需空间；右侧卡片与轴线之间仍保持 10px。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：相关专项测试 27/27、全量测试 132/132、`git diff --check` 均通过。
- 还有哪些待办或风险：该改动已于后续按用户要求随线索旅程改版一并撤回。
## 2026-07-30 撤回线索旅程全部改版并恢复初始样式
- 用户想做什么：将线索旅程的所有修改恢复为初始样式。
- 已经完成了什么：仅撤回线索详情旅程范围内的连续改动；日期、阶段标签和录音 ID 恢复到左侧信息列，恢复原三列时间轴布局、卡片底色、连线、间距和悬浮行为。
- 改动了哪些文件：`leads/index.html`、`leads/page.css`、`tests/customer-detail-latest-figma-layout.test.js`；移除 `tests/lead-journey-card-meta.test.js`；更新交接日志。
- 做过哪些验证：相关专项测试 26/26、全量测试 127/127、`git diff --check` 均通过。
- 还有哪些待办或风险：无。
## 2026-07-30 重排线索详情四个核心板块
- 用户想做什么：将“客户意向”和“客户标签”横向并排放到上方，下方横向放置“王先生”客户卡片和“线索旅程”。
- 已经完成了什么：使用页面网格重新指定四个板块的位置；桌面端为两行两列，窄屏按客户意向、客户标签、客户卡片、线索旅程的顺序纵向排列。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：布局专项测试 25/25、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：无。
## 2026-07-30 将客户标签的对话与公域改为横向排列
- 用户想做什么：将客户标签板块中的“对话”和“公域”两个子板块改为横向排列。
- 已经完成了什么：保留原双列网格，将触发上下堆叠的容器宽度从 720px 收紧到 520px；当前线索详情宽度下两个子板块左右各占一列，真正窄屏时仍自动上下排列。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：无。
## 2026-07-30 扩宽客户标签并让客户意向自适应
- 用户想做什么：将客户标签从约 644px 扩到 800px，同时让左侧客户意向自动适应剩余宽度。
- 已经完成了什么：桌面双列改为左侧弹性宽度、右侧 `clamp(600px, 62%, 800px)`；当前 1567px 视口右侧达到 800px，较窄桌面平滑收缩，1320px 以下改为单列。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：相关专项测试 36/36、全量测试 128/128、`git diff --check` 均通过。
- 还有哪些待办或风险：无。
### 2026-07-28 拉取最新代码并合并 origin/main 到 agent/customer-tag-figma
- 用户想做什么：拉取最新代码并同步 main。
- 已经完成了什么：先 `git pull`（当前分支已最新）→ `git merge origin/main --no-edit` 合并到 `agent/customer-tag-figma`（29 个文件，含客户洞察 v1/v2 新模块）→ 新建 `handoff-log.md`。
- 改动了哪些文件：合并产生的新文件，主要是 `客户洞察/v1`、`客户洞察/v2`、`version-selector.css` 等；新建 `handoff-log.md`。
- 做过哪些验证：`git log`/`git status` 确认合并成功，无冲突。
- 还有哪些待办或风险：无。
## 2026-07-28 把 agent/customer-tag-figma 合并到 main
- 用户想做什么：把当前工作分支合并到 main 分支。
- 已经完成了什么：`git stash push -u` 暂存工作区修改 → `git checkout main` → `git pull origin main` 拉取最新 → `git merge agent/customer-tag-figma`（fast-forward）→ 当前 main HEAD 为 `2847af0`，领先 `origin/main` 2 个提交。
- 改动了哪些文件：26 个文件（合并自 `agent/customer-tag-figma`，主要是 leads 模块的 Figma 资源、HTML/CSS 和测试文件）。
- 做过哪些验证：`git log`/`git status` 确认合并成功，工作区干净。
- 还有哪些待办或风险：原工作区修改在 `stash@{0}`，需后续 `git stash pop` 决定去留；本地 main 尚未推送到远程。
## 2026-07-30 拉取当前工作分支最新代码
- 用户想做什么：拉取最新代码。
- 已经完成了什么：更新远端引用并对当前分支执行仅快进拉取；当前分支与 `origin/agent/customer-insight-sales-store-polish` 一致，无新增提交需要下载。
- 改动了哪些文件：未修改业务代码；保留了 `leads/index.html`、`leads/page.css`、`tests/customer-detail-latest-figma-layout.test.js` 和未跟踪 SVG 的本地改动；更新交接日志。
- 做过哪些验证：确认当前分支 HEAD 为 `edd8b1b`，与上游分支 ahead/behind 均为 0；确认本地改动仍在。
- 还有哪些待办或风险：`origin/main` 已更新到 `3a802a8`，尚未合并进当前分支，以免覆盖或冲突本地改动。
## 2026-07-30 按 Figma 重构门店质检合格率对比
- 用户想做什么：将门店看板“门店质检合格率 / 大区质检合格率 / 提升”区域严格对齐 Figma 节点 `514:6817`，并将切图保存到本地引用。
- 已经完成了什么：读取 Figma 结构和节点截图；重构两侧渐变卡片与斜切连接结构；对齐 105px 高度、32px 间距、80px 插图、88px VS、字体字号、颜色和阴影；移除设计稿没有的提升箭头。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、`tests/store-review-sop-toolbar.test.js`、`tests/store-quality-overview-figma.test.js`；新增 5 个 `assets/*figma-514-6817*` 本地资源；更新交接日志。
- 做过哪些验证：全量测试 117/117、JavaScript 语法检查、SVG 校验和 `git diff --check` 均通过。
- 还有哪些待办或风险：本地 `file://` 页面被浏览器安全策略拦截，无法自动刷新截图，需用户手动刷新确认最终像素视觉。
## 2026-07-30 修正质检卡片斜块描边层级
- 用户想做什么：保留 `-2px` 自动布局重叠，并让卡片本体盖住斜块内侧描边，使这条描边不可见。
- 已经完成了什么：纠正上一轮相反理解；将卡片本体固定在第 2 层、斜块固定在第 1 层；门店和大区两侧镜像结构同步处理；更新样式缓存版本。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、`tests/store-review-sop-toolbar.test.js`、`tests/store-quality-overview-figma.test.js`、交接日志。
- 做过哪些验证：层级专项测试 5/5、全量测试 118/118、JavaScript 语法检查和 `git diff --check` 均通过。
- 还有哪些待办或风险：需用户手动刷新本地页面，确认两侧斜块内侧描边均被本体遮住。
## 2026-07-30 按 Figma 子节点修正质检差值
- 用户想做什么：将门店看板“提升 9%”按 Figma 节点 `514:6851` 修改。
- 已经完成了什么：将文案从“提升 9%”改为“+ 9%”；加号和数值统一为 40px、中等字重、绿色、4px 间距并垂直居中；动态正负差值同步显示为 `+/-`。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、`app-runtime.js`、`tests/store-review-sop-toolbar.test.js`、`tests/store-quality-overview-figma.test.js`、交接日志。
- 做过哪些验证：差值专项测试 6/6、全量测试 119/119、JavaScript 语法检查和 `git diff --check` 均通过。
- 还有哪些待办或风险：需用户手动刷新本地页面确认最终视觉。
## 2026-07-30 按 Figma 重构质检总结卡并修复旧样式冲突
- 用户想做什么：将“优势发掘 / 短板改善 / 风险管控”三张卡片按 Figma 节点 `514:6865` 修改。
- 已经完成了什么：三卡改为横向布局并引用完整 48×48 Figma 图标；根据浏览器截图定位到旧 ID 规则将短板、风险图标容器设为 `width:100%`，现已用高优先级规则固定图标 48px、文案占剩余空间。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、2 个测试文件；新增 3 个完整 PNG 图标，逐个移除 3 个错误的内部 SVG；更新交接日志。
- 做过哪些验证：总结卡专项测试 8/8、全量测试 121/121、JavaScript 语法检查和 `git diff --check` 均通过。
- 还有哪些待办或风险：需用户手动刷新本地页面确认最终视觉。
## 2026-07-30 统一厂端与门店质检概览样式
- 用户想做什么：将厂端看板的质检概览页面样式调整为与门店看板当前版本一致。
- 已经完成了什么：厂端复用门店同一套本地切图与结构；统一 105px 斜角对比卡、卡片本体覆盖斜块描边的层级、88px VS、40px 正负差值、44px AI 提示条和三张横向总结卡；保留厂端“质检合格率 / 全国均值”文案及动态数据逻辑。
- 改动了哪些文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`factory-dashboard/index.html`、`factory-dashboard/page.css`、`factory-dashboard/page.js`；新增 `tests/factory-quality-overview-match.test.js`；更新交接日志。
- 做过哪些验证：厂端/门店质检概览专项测试 11/11、全量测试 126/126、JavaScript 语法检查和 `git diff --check` 均通过。
- 还有哪些待办或风险：浏览器安全策略阻止自动刷新 `file://` 页面，需用户手动刷新厂端看板确认最终视觉。
## 2026-07-30 统一客户旅程会话卡片为纯白底色
- 用户想做什么：将客户旅程第一张会话卡及下面所有同类卡片的底色改为纯白。
- 已经完成了什么：增加客户详情页专用高优先级样式，覆盖当前门店、其他门店、额外门店原有渐变；保留边框、圆角、标签和内容样式；更新页面样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：客户详情专项测试 22/22、全量测试 127/127、`git diff --check` 均通过。
- 还有哪些待办或风险：浏览器安全策略阻止自动刷新 `file://` 页面，需用户手动刷新确认最终视觉。
## 2026-07-30 将线索旅程信息移入内容卡顶部
- 用户想做什么：把线索详情旅程左侧的日期、阶段标签和录音 ID 挪到右侧卡片上方。
- 已经完成了什么：五条记录全部改为卡片顶部元信息行，日期与阶段标签在左、可点击录音 ID 在右；删除原左侧信息列并收窄为时间轴，保留圆点、连线、悬浮效果和录音跳转交互；窄屏允许顶部信息自动换行。
- 改动了哪些文件：`leads/index.html`、`leads/page.css`、`tests/customer-detail-latest-figma-layout.test.js`；新增 `tests/lead-journey-card-meta.test.js`；更新交接日志。
- 做过哪些验证：相关专项测试 26/26、全量测试 129/129、`git diff --check` 均通过。
- 还有哪些待办或风险：该改版已于后续按用户要求全部撤回。
## 2026-07-31 让客户标签内部蓝色子卡动态等高
- 用户想做什么：让客户标签内“公域”的蓝色区域撑开，与同一行“对话”蓝色区域等高。
- 已经完成了什么：将内部双列网格从顶部对齐改为拉伸对齐；“对话 / 公域”先分别计算自然高度，再由同一网格行取较高值并拉伸较矮子卡；没有把内部子卡继续撑满外层白色卡片；更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-meta-and-tag-panels.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：专项测试 37/37、全量测试 129/129、`git diff --check` 通过；真实浏览器在 1567px 下“对话 / 公域”均为 348px，外层客户意向和客户标签均为 429px。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新样式版本。
## 2026-07-31 将王先生与线索旅程改为上下排列
- 用户想做什么：王先生客户卡片和线索旅程需要上下排列，不是左右排列。
- 已经完成了什么：保留顶部客户意向与客户标签的左右布局；将下方网格改为第二行王先生客户卡片横跨整行、第三行线索旅程横跨整行；两块保持 16px 间距并更新样式缓存版本。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、`tests/customer-detail-latest-figma-layout.test.js`、交接日志。
- 做过哪些验证：专项测试 37/37、全量测试 129/129、`git diff --check` 通过；真实浏览器在 1567px 下两块左坐标均为 224px、宽度均为 1319px，线索旅程位于客户卡片下方且间距为 16px；顶部双卡继续等高。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新样式版本。
## 2026-07-31 取消线索旅程一屏高度适配
- 用户想做什么：线索旅程不需要适配一屏显示，直接根据自身内容自适应高度。
- 已经完成了什么：删除按浏览器可视高度计算线索旅程 `height` 和内部 `max-height` 的 JavaScript；窗口变化时只刷新客户标签图布局；线索旅程由全部内容自然撑高并随主内容区域整体滚动；更新运行脚本缓存版本。
- 改动了哪些文件：`app-runtime.js`、`leads/page.js`、`leads/index.html`、`tests/leads-detail-equal-columns.test.js`、交接日志。
- 做过哪些验证：专项测试 37/37、全量测试 129/129、JavaScript 语法检查和 `git diff --check` 通过；真实浏览器中线索旅程自然高度为 780px、内部最大高度为 `none`、无内部纵向滚动，主内容容器高度 990px且内容高度 1544px，可正常整体滚动。
- 还有哪些待办或风险：修改尚未提交；用户打开的是 `file://` 页面，需要手动刷新才能加载新脚本版本。
## 2026-07-31 收敛本地分支为唯一 main
- 用户想做什么：本地只保留一个 `main` 分支，不要其他本地分支。
- 已经完成了什么：确认当前功能提交和另外两个分支的提交在线上 `main` 中已有等价版本；保护并恢复未提交修改；重建本地 `main` 并对齐远程；删除三个多余本地分支。
- 改动了哪些文件：厂端看板、门店看板、相关测试和交接日志；其余未提交文件原样恢复。
- 做过哪些验证：本地仅保留 `main`；全量测试 168/168、JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：本地未提交修改及历史 stash 仍保留。
## 2026-07-31 推送质检概览与线索详情修改到远程 main
- 用户想做什么：将厂端看板、门店质检概览和线索详情修改推送到远程仓库。
- 已经完成了什么：创建提交 `336e49d` 并成功推送到 `origin/main`。
- 改动了哪些文件：厂端看板、门店看板、线索详情、设计资源、测试和交接归档。
- 做过哪些验证：全量测试 168/168、JavaScript 语法检查、暂存差异检查和 `git diff --check` 通过。
- 还有哪些待办或风险：`.playwright-cli` 和历史 stash 仍保留。
## 2026-07-31 线索旅程宽度改为容器自适应
- 用户想做什么：让线索详情页的“线索旅程”宽度随页面可用空间自适应。
- 已经完成了什么：让旅程外层卡片、时间轴和内容记录完整占满父容器；左侧信息列改为范围内连续伸缩。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、相关测试和交接日志。
- 做过哪些验证：专项测试 31/31、全量测试 169/169、JavaScript 语法检查、真实浏览器多宽度检查和 `git diff --check` 通过。
- 还有哪些待办或风险：修改尚未提交；`file://` 页面需手动刷新。
## 2026-07-31 让客户洞察证据板块撑满剩余高度
- 用户想做什么：右侧客户标签较高时，让左侧客户洞察底部的“证据”板块撑到底。
- 已经完成了什么：保持两张外层卡片动态等高，并让最后一个“证据”板块吸收左侧多余高度。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、相关测试和交接日志。
- 做过哪些验证：相关专项测试 36/36 和 `git diff --check` 通过。
- 还有哪些待办或风险：修改尚未提交；`file://` 页面需手动刷新。
## 2026-07-31 推送线索详情自适应布局修改到远程 main
- 用户想做什么：将当前线索详情修改推送到远程仓库。
- 已经完成了什么：确认远程 `main` 没有新提交；排除 `.playwright-cli` 临时目录，创建提交 `a4d718d`（`fix: 优化线索详情自适应布局`）并成功推送到 `origin/main`。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、3 个线索详情相关测试、交接归档。
- 做过哪些验证：全量测试 170/170、JavaScript 语法检查、暂存差异检查和 `git diff --check` 通过；推送成功。
- 还有哪些待办或风险：`.playwright-cli` 仍是未提交的本地临时目录；原有历史 stash 仍保留。
## 2026-08-03 按 Figma 重构门店核心指标
- 用户想做什么：将门店看板“门店核心指标”严格对齐 Figma 546:1160，并把设计图标下载到项目内调用。
- 已经完成了什么：重构店长头像、门店与职位标签、两组录音来源统计和 6 项质量指标卡；下载并接入所需图标；补充响应式规则与缓存版本。
- 改动了哪些文件：`store-dashboard/`、`app-runtime.js`、`assets/store-core-metrics/` 及相关测试。
- 做过哪些验证：专项测试 12/12、全量测试 174/174、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：修改尚未提交。
## 2026-08-03 精确还原录音总计角标
- 用户想做什么：把“录音总计”角标还原成设计稿中的圆滑异形效果。
- 已经完成了什么：按 Figma 546:1350 保留蓝色底块并叠加原始浅蓝 SVG 遮罩，移除多边形近似并更新缓存版本。
- 改动了哪些文件或组件：`app-runtime.js`、`store-dashboard/`、`assets/store-core-metrics/recording-ribbon-mask.svg` 及相关测试。
- 做过哪些验证：相关测试 13/13、全量测试 174/174、JavaScript 语法与差异检查通过。
- 还有哪些待办或风险：用户需刷新页面查看效果；修改尚未提交。
## 2026-08-03 补齐录音统计卡图片背景
- 用户想做什么：补回两张录音统计卡在设计稿中的图片背景。
- 已经完成了什么：导出并接入 Figma 546:1341 的 316×164px 透明背景层，清理未使用资源并更新缓存版本。
- 改动了哪些文件或组件：`store-dashboard/`、`assets/store-core-metrics/recording-card-background-layer.png` 及相关测试。
- 做过哪些验证：全量测试 174/174、JavaScript 语法、资源格式和差异检查通过。
- 还有哪些待办或风险：用户需刷新页面确认视觉；修改尚未提交。
## 2026-08-03 收紧录音统计卡标题下方空白
- 用户想做什么：消除“云外呼录音数”标题下方过大的空白并与设计稿对齐。
- 已经完成了什么：将录音统计卡首行从 76px 改为设计稿的 61px，使下方子卡起点前移 15px并更新缓存版本。
- 改动了哪些文件或组件：`store-dashboard/` 及相关测试。
- 做过哪些验证：全量测试 174/174、JavaScript 语法和差异检查通过。
- 还有哪些待办或风险：用户需刷新页面确认间距；修改尚未提交。
## 2026-08-03 修复平均时长指标说明裁剪
- 用户想做什么：解决“平均时长”问号提示内容左侧被裁剪的问题。
- 已经完成了什么：将第一张指标卡的提示框和箭头改为向右侧内部展开，保留面板圆角与裁剪并更新缓存版本。
- 改动了哪些文件或组件：`store-dashboard/` 及 4 个相关测试。
- 做过哪些验证：回归测试修复前失败、修复后通过；全量测试 175/175、JavaScript 语法检查通过。
- 还有哪些待办或风险：用户需刷新页面确认提示框视觉；修改尚未提交。
## 2026-08-03 按 Figma 549:2919 重构质检概览
- 用户想做什么：将门店看板“质检概览”严格按 Figma 549:2919 修改。
- 已经完成了什么：将顶部改为左侧 AI 结论和右侧相连合格率对比，底部三张总结卡同步设计尺寸；下载并接入 7 个设计资源；保留动态逻辑和响应式布局。
- 改动了哪些文件或组件：`store-dashboard/`、`assets/store-quality-overview/` 及相关测试。
- 做过哪些验证：专项测试 6/6、全量测试 175/175、JavaScript 语法与差异检查通过；本地页面无溢出、裁剪和控制台错误。
- 还有哪些待办或风险：用户需刷新页面加载新缓存版本；修改尚未提交。
## 2026-08-03 修正质检概览机器人图层
- 用户想做什么：让 AI 结论卡上方机器人的前后层级与设计稿一致。
- 已经完成了什么：将蓝色结论卡表面拆为独立图层，机器人置于卡片后方、文字置于卡片前方，使机器人底部被自然遮挡；更新缓存版本和回归测试。
- 改动了哪些文件或组件：`store-dashboard/` 及相关测试。
- 做过哪些验证：层级测试修复前失败、修复后专项测试 7/7；全量测试 176/176、JavaScript 语法与差异检查通过。
- 还有哪些待办或风险：用户需刷新本地页面确认视觉；修改尚未提交。
## 2026-08-03 核对 AI 结论卡描边与填充
- 用户想做什么：确认“SOP 执行”结论框的描边和填充是否与设计稿一致。
- 已经完成了什么：读取 Figma 549:2929 并核对独立表面层参数；后续检查发现公共样式仍保留旧虚线，已在下一轮清除。
- 改动了哪些文件或组件：本轮仅更新交接日志，业务代码未改动。
- 做过哪些验证：质检概览专项测试 7/7 和差异检查通过。
- 还有哪些待办或风险：本轮结论未覆盖继承的公共虚线，后续记录已完成修正。
## 2026-08-03 清除 AI 结论卡旧虚线描边
- 用户想做什么：指出设计稿描边不是虚线，要求页面与设计稿一致。
- 已经完成了什么：定位到公共 `app-inline.css` 仍给 `.sop-ai-summary` 提供虚线边框；在门店页面样式中明确设置容器 `border: 0`，只保留独立表面层的 1px `#DBEAFE` 实线；更新缓存版本并补充回归测试。
- 改动了哪些文件或组件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：回归测试修复前失败、修复后专项测试 7/7；全量测试 176/176、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面加载新缓存版本；修改尚未提交。
## 2026-08-03 移除 AI 结论卡额外左缩进
- 用户想做什么：让质检概览顶部这一行左侧没有额外内边距。
- 已经完成了什么：将 AI 结论卡的 `margin-left` 从 8px 改为 0，并把宽度从 `calc(100% - 8px)` 恢复为 100%；保留板块统一外层留白及下方卡片布局；更新缓存版本和回归测试。
- 改动了哪些文件或组件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：回归测试修复前失败、修复后专项测试 7/7；全量测试 176/176、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面确认对齐；修改尚未提交。
## 2026-08-03 同步 VS 最新投影
- 用户想做什么：按最新 Figma 549:2932 调整质检合格率对比中间 VS 的投影。
- 已经完成了什么：读取最新设计参数和截图；将 VS 外层投影更新为 `0 0 16px rgba(37, 99, 235, 0.2)`，白色内层投影更新为 `0 0 4px rgba(37, 99, 235, 0.3)`；保持尺寸、圆角和位置不变；更新缓存版本和回归测试。
- 改动了哪些文件或组件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：专项测试修复前失败、修复后 7/7；全量测试 176/176、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面查看最新投影；修改尚未提交。
## 2026-08-03 修正 VS 尺寸与垂直居中
- 用户想做什么：指出 VS 过大且没有在中间对齐。
- 已经完成了什么：读取 Figma 549:2931/2932 最新结构与精确坐标；确认设计稿 VS 为 52×52px、父容器为 908×86px、坐标为 x=384/y=17；将旧 64px 改为 52px，内边距改为 6px，并使用 `top: 50%` + `translateY(-50%)` 稳定垂直居中；水平 42.3% 与设计坐标一致；保留最新投影。
- 改动了哪些文件或组件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：专项测试修复前失败、修复后 7/7；全量测试 176/176、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面确认视觉；修改尚未提交。
## 2026-08-03 修复 VS 多分辨率横向跑偏
- 用户想做什么：解决 VS 在部分分辨率下偏离两张质检合格率卡片连接位置的问题。
- 已经完成了什么：确认固定 `left: 42.3%` 会随整行宽度漂移；明确右侧差值区为设计稿 140px，并将 VS 定位改为 `calc(50% - 70px)`，使其始终跟随两张自适应卡片的连接点；保留 52px 尺寸、垂直居中和最新投影；更新缓存版本。
- 改动了哪些文件：`store-dashboard/page.css`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：问题测试修复前 2 项失败、修复后专项测试 8/8；新增 720/908/1200/1960px 四种宽度的连接点公式验证；全量测试 177/177、2 个 JavaScript 语法检查和 `git diff --check` 通过。
- 还有哪些待办或风险：用户需刷新当前 `file://` 页面，在原问题分辨率下确认视觉；修改尚未提交。
## 2026-08-03 将质检概览机器人替换为循环视频
- 用户想做什么：把 AI 结论卡上方的机器人图片替换为指定 MP4，并循环播放。
- 已经完成了什么：检查视频为 640×640、约 8 秒、H.264 且无音轨；将视频复制到项目资源目录并保留 Downloads 原文件；把静态图片改为自动播放、静音、循环和移动端内联播放的视频，继续沿用原有 92px 尺寸与图层位置；更新缓存版本和回归测试。
- 改动了哪些文件：`assets/store-quality-overview/ai-robot-loop.mp4`、`store-dashboard/index.html`、`store-dashboard/page.js` 及 4 个相关测试。
- 做过哪些验证：视频源文件与项目副本 SHA-256 一致；专项测试 9/9、全量测试 178/178、2 个 JavaScript 语法检查、视频元数据检查和 `git diff --check` 通过；内置浏览器因安全策略无法自动刷新 `file://` 页面。
- 还有哪些待办或风险：用户需手动刷新当前 `file://` 页面确认循环播放与位置；修改尚未提交。
## 2026-08-03 按最新 Figma 调整质检概览并恢复机器人图片
- 用户想做什么：按更新后的 Figma 549:2919 修改质检概览，并取消机器人视频、换回图片。
- 已经完成了什么：读取最新节点结构和截图；给顶部组合区增加 17.5px 内边距、1.5px `#DBEAFE` 实线、18px 圆角、白色填充和蓝色轻投影；调整内部列宽；重新导出并接入 92×92 PNG；移除页面视频标签和项目内视频副本；更新缓存版本和测试。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.css`、`store-dashboard/page.js`、`assets/store-quality-overview/ai-robot.png` 及 4 个相关测试。
- 做过哪些验证：专项测试 9/9、全量测试 178/178、2 个 JavaScript 语法检查、资源和差异检查通过。
- 还有哪些待办或风险：用户需手动刷新确认视觉；修改尚未提交。
