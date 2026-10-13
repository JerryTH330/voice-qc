# 组织／地理维度切换组件

实现：`shared/dimension-switcher.js`、`shared/dimension-switcher.css`。各入口 CSS 加载版本为 `20261013-shared-dimension-white-v2`，JS 保持 `20261012-shared-dimension-v1`。

组件统一按钮、路径、切换反馈及键盘控制。页面持有筛选状态，决定条件如何清除、门店范围如何固定以及数据如何更新；组件不访问数据源、路由或保存配置。

## 当前入口

| 入口 | namespace | 筛选面板 |
| --- | --- | --- |
| 录音排查 | `matching` | `matchingDimensionFilters` |
| 到访明细／门店到访明细 | `visit` | `visitDimensionFilters` |
| 工牌明细／门店工牌明细 | `badge` | `badgeDimensionFilters` |
| 录音列表 | `sr` | `sessionDimensionFilters` |
| 线索列表／客户聚合 | `lr` | `leadsDimensionFilters` |
| 厂端看板 | `fo` | `factoryDimensionFilters` |

## 接入

在页面现有样式后加载组件 CSS，在业务脚本前加载组件 JS。脚本以 `window.DimensionSwitcher` 提供接口，Node 检查可通过 `require` 使用同一实现。

```html
<link rel="stylesheet" href="../shared/dimension-switcher.css?v=20261013-shared-dimension-white-v2" />
<script src="../shared/dimension-switcher.js?v=20261012-shared-dimension-v1"></script>
```

```js
switcherHost.innerHTML = DimensionSwitcher.render({
  namespace: 'matching',
  mode: model.dimensionMode,
  label: '录音排查筛选维度',
  panelId: 'matchingDimensionFilters'
});
DimensionSwitcher.sync(filterRoot);
```

- `namespace` 使用页面代码定义的简单标识，在同一文档中必须唯一。它生成按钮 ID 和页面原有的 `data-{namespace}-dimension` 属性，保留现有事件入口。
- `mode` 为 `organization` 或 `geography`；`label` 为 Tab 列表的辅助名称。`panelId` 指向实际维度筛选面板，`sync` 将它关联到当前选中项。
- 可选 `path` 为四个纯文本名称。默认使用品牌／大区／战区／门店或品牌／省份／城市／门店；线索和厂端入口传入各自原有的已选路径名称。名称和标题由组件转义，专属的中间两级统一强调。
- 每次完成筛选区域的重绘后调用 `sync(filterRoot)`，取消旧动画、清理旧提示计时并更新面板关联。

页面在原有切换处理完成并重绘后调用：

```js
DimensionSwitcher.change(filterRoot, {
  from: previousMode,
  mode: nextMode,
  event,
  fields: replacedFieldElements,
  cleared: actuallyClearedSelections
});
```

`fields` 只传入新显示的两项组织／地理筛选控件，隐藏项可传入 `null`。`cleared` 根据页面切换前后实际移除的选择计算；门店二级页保留的固定门店不能计为被清除条件。页面无需复制动画、提示或焦点代码。

## 交互与维护

- 按钮为 184px × 40px 等宽分段底座，浅灰背景 `#eaf0f8`、1px 边框 `#d9e4f2`、4px 内边距，内部按钮高 30px。选中态使用白色滑块、蓝字 `#2563eb` 和轻阴影，未选中文字为 `#64748b`；悬停沿用 `#334155` 文字和半透明白色背景。固定宽高配合 `flex-basis: auto`，适配窄屏纵向布局。
- 滑块和裁切蓝字同步移动 180ms，新显示的筛选项淡入 140ms；品牌、门店、人员、日期及列表不加入这组动画。
- 重复点击当前维度由页面直接返回，保留条件。反向切换会取消旧动画，实例间状态互不影响。
- 只让当前按钮进入 Tab 顺序。组件安装统一的方向键、Home／End 处理，调用页面原有点击入口并恢复新按钮焦点；其他控件的按键不拦截。键盘与减少动态效果模式不播放动画，缺少 Web Animations 时保留即时状态与提示。
- 确有条件被清除时才显示提示，3 秒后清空。重绘取消旧计时，失效回调不能清空新提示。
- 修改外观集中在组件 CSS，修改动效或键盘控制集中在组件 JS。新增入口只提供当前状态、原有路径和被替换的控件，不能将候选范围、重置规则、统计或导出规则迁入组件。

2026-10-13 用户指定线索页的组织／地理切换作为所有同类入口的统一样式。该外观已迁入共享 CSS，线索页原有五条局部覆盖已删除；上表各入口及门店二级页直接复用默认样式。新增同类入口沿用组件接口，外观统一在共享 CSS 维护。

线索页上方“线索视图／客户聚合视图”继续使用白色底座、蓝青渐变滑块及裁切白字，保持 216px × 44px；该数据视图的样式在 `leads/page.css` 维护。滑块和文字使用与下方相同的 `transform` 横向平移、180ms 及 `cubic-bezier(0.65, 0, 0.35, 1)`，初始化直接定位当前项。上方筛选卡及列表原有的内容动效保持。线索页 CSS、引导脚本及呈现脚本版本为 `20261013-leads-table-layout-v6`（表格布局修正）；本节动效保持。真实字形、原生交互和窄屏排版仍需浏览器验收。

检查：`node --test tests/dimension-switcher.test.cjs`。组件检查覆盖命名与转义、面板关联、动画范围与反向取消、实例隔离、键盘和减少动态效果、提示过期及脚本初始化。页面相关检查继续使用原筛选、关联数据、字段配置、下钻及导出测试。
