# 录音列表筛选区域规范

## 1. 适用范围

本规范适用于录音列表页顶部筛选区域，对应页面与代码位置：

- 页面入口：`/session/index.html?route=session`
- 容器模板：[session/index.html](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/session/index.html:123)
- 渲染逻辑：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:6282)
- 主样式：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:5401)

目标对象是这张筛选卡片：

- 外层卡片：`.session-filter-card`
- 筛选工具栏：`#sessionFilterControls.session-filter-toolbar`

## 2. 设计目标

- 让高频筛选操作集中在首屏完成，减少跳转和展开层级。
- 让用户先按“场景/意向/号码搜索”快速缩小范围，再按“品牌/组织/车系/状态/日期”做精筛。
- 保持后台工具气质，信息密度高，但不拥挤。

## 3. 区域结构

筛选区域使用“两行布局 + 一张卡片容器”。

### 3.1 外层卡片

- 选择器：`.session-filter-card`
- 作用：承载整块筛选工具栏
- 视觉：浅色渐变底、细边框、轻阴影

### 3.2 第一行：高频筛选行

选择器：`#sessionFilterControls .session-filter-row-segment`

包含 3 组：

1. `质检场景`
2. `AI意向等级`
3. `顾问号码 / 客户号码 / 客户姓名 / 录音ID / 顾问ID` 搜索

这一行负责最快速的范围缩小，和列表联动最频繁。

### 3.3 第二行：精细筛选行

选择器：`#sessionFilterControls .session-filter-row-main`

包含 6 组：

1. `品牌`
2. `组织`
3. `车系`
4. `录音状态`
5. `日期`
6. `重置筛选`

这一行负责结构化条件筛选和回退操作。

## 4. 控件类型规范

这一块不是单一控件，而是 5 类控件组合。

### 4.1 分段切换控件

用于：

- `质检场景`
- `AI意向等级`

结构来源：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:5937)

规则：

- 左侧是字段标签
- 右侧是一组横向 tab
- 默认选项必须包含 `全部`
- 当前选中项使用浅蓝底 + 蓝字 + 内描边

### 4.2 普通下拉控件

用于：

- `品牌`
- `车系`
- `录音状态`

结构来源：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:5920)

规则：

- 左侧字段名固定显示
- 右侧按钮显示当前值
- 右端带下拉箭头
- 展开后使用白底浮层菜单

### 4.3 搜索型下拉控件

用于：

- `组织`

结构来源：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:5888)

规则：

- 表面是筛选框，内部允许搜索门店/顾问
- 可展开级联面板
- 支持当前路径显示、搜索结果、层级切换

### 4.4 搜索框组合控件

用于：

- `顾问号码` 这一组查询

结构来源：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:5982)

规则：

- 左侧是查询字段切换器
- 右侧是输入框
- 最右侧固定搜索图标
- 占第一行最宽位置

### 4.5 日期范围控件

用于：

- `日期`

结构来源：[app-runtime.js](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/app-runtime.js:6016)

规则：

- 文案格式为 `开始日期 至 结束日期`
- 右侧固定日历图标
- 点击后展开日期面板
- 面板内包含快捷选项、日期网格、取消/应用动作

## 5. 视觉规范

以下是当前实现的核心视觉值，后续新增同类筛选区应优先复用。

### 5.1 外层卡片

- 圆角：`16px`
- 边框：`1px solid var(--line-soft)`
- 背景：`linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,247,253,0.95))`
- 内边距：`20px`
- 阴影：`var(--shadow-soft)`

来源：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:5401)

### 5.2 工具栏布局

- 两行结构
- 行间距：`0`
- 每行内部间距：`12px`
- 第一行底部分隔线：`1px solid rgba(217, 226, 239, 0.72)`
- 第一行下内边距：`16px`
- 第二行上内边距：`16px`

来源：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:6476)

### 5.3 筛选框基础样式

统一选择器：`.session-toolbar-control`

- 高度：`44px`
- 左右内边距：`14px`
- 圆角：`16px`
- 边框：`1px solid rgba(201, 210, 224, 0.88)`
- 背景：`rgba(255,255,255,0.98)`
- 阴影：`0 8px 20px rgba(15, 23, 42, 0.04)`
- 内部横向间距：`12px`

来源：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:6501)

### 5.4 字体层级

- 字段标签：`12px`
- 输入值 / 当前值：`13px`
- 在 `#sessionFilterControls` 场景下，标签和值会统一提升到 `14px`

来源：

- 基础值：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:6518)
- 页面级提升：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:7696)

### 5.5 交互态

- 聚焦/展开：蓝色描边 + `0 0 0 4px rgba(37, 99, 235, 0.08)`
- 分段选中项：浅蓝底、蓝字、内描边
- 下拉展开箭头：旋转 180 度
- 搜索/日期图标：默认柔和灰，激活后转蓝

## 6. 字段规范

### 6.1 第一行字段

1. `质检场景`
   - 类型：分段切换
   - 选项：`全部 / 邀约 / 试驾PDC / 到店接待 / 试驾`

2. `AI意向等级`
   - 类型：分段切换
   - 选项：`全部 / 高 / 中 / 低 / 无`

3. `号码搜索`
   - 类型：字段切换 + 输入框
   - 可切换字段：`顾问号码 / 客户号码 / 客户姓名 / 录音ID / 顾问ID`

### 6.2 第二行字段

1. `品牌`
   - 类型：单选下拉
   - 默认值：`全部`

2. `组织`
   - 类型：搜索型级联
   - 默认值：`全国`

3. `车系`
   - 类型：分组下拉
   - 默认值：`全部`

4. `录音状态`
   - 类型：单选下拉
   - 默认值：`已完成`

5. `日期`
   - 类型：日期范围
   - 默认值：页面当前预设日期区间

6. `重置筛选`
   - 类型：按钮
   - 作用：恢复默认筛选状态

## 7. 布局规范

### 7.1 桌面端

- 第一行列模板：`max-content max-content minmax(360px, 1fr)`
- 第二行列模板：`repeat(5, minmax(0, 1fr)) auto`

含义：

- 第一行前两项宽度按内容走，搜索框吃剩余空间
- 第二行 5 个筛选控件等宽，重置按钮自适应

### 7.2 中屏

在较窄桌面宽度下：

- 第一行搜索框最小宽度收缩到 `260px`
- 第二行变成 `3 列 + 重置按钮`

来源：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:10817)

### 7.3 小屏

在 `max-width: 820px` 下：

- 第一行和第二行都改为单列堆叠
- 每个筛选控件宽度 100%
- 日期面板、菜单面板宽度改为 100%

来源：[voice-qc-admin.css](/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html/voice-qc-admin.css:10922)

## 8. 设计禁区

- 不要把这块改成一整条无分组的大输入区。
- 不要把字段标题移到控件外的独立行外再追加说明文案。
- 不要混入不同高度的筛选框，基础高度统一按 `44px`。
- 不要把分段切换做成实心重按钮风格，它应更接近轻量 tab。
- 不要在同一行里混用多种圆角体系。
- 不要把搜索图标、下拉箭头、日历图标换成风格不一致的实心图标。

## 9. 复用建议

如果后续要新建同风格筛选区，建议优先复用以下结构：

1. 外层卡片继续使用 `.session-filter-card`
2. 工具栏继续使用 `.session-filter-toolbar`
3. 普通筛选框继续使用 `.session-toolbar-control`
4. 分段切换继续使用 `.session-toolbar-segment-control`
5. 搜索框继续使用 `.session-toolbar-control-phone-search`
6. 日期继续使用 `.session-toolbar-control-date`

## 10. 文档用途

这份文档用于：

- 后续页面新增筛选区域时直接复用
- 设计评审时统一口径
- 代码修改前确认“应该对齐哪一套筛选规范”
- 避免再把其他页面筛选区错对齐到不相干的样式体系
