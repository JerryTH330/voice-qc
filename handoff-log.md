# 当前接手摘要
- 厂端看板原「录音复盘」模块已按方案一改造，模块标题保留为「录音复盘」，内部承载规则命中分析与组织下钻。
- 新 tab 为：SOP 质检分析、优势缺陷识别、风险命中分析。
- 第一层为规则列表，展示规则项、命中率、命中数量/样本数量；支持搜索、排序、分页。
- 点击规则后在当前模块内展示该规则的 TOP5/BOT5 组织表现；组织表现会联动顶部组织筛选：全国看大区、大区看战区、战区看门店、门店禁用下钻；所有下钻和回退无页面跳转、无弹窗。
- 旧录音弹层函数暂未删除，但新模块不再调用。

# 最近 5 次工作记录
1. 2026-05-14｜处理标注：录音复盘高度对齐与分页
   - 用户想做什么：录音复盘高度和左侧对齐，不要无限展开，可以设计分页。
   - 已完成什么：将规则列表从“加载更多”改为每页 5 条的上一页/下一页分页；给录音复盘卡片加高度约束，使其与左侧概览+排行区域对齐。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Playwright 验证右侧高度 962px，左侧对应高度 962px，分页可从第 1/5 页切到第 2/5 页，下钻后高度保持不变。
   - 待办/风险：无。
2. 2026-05-14｜处理标注：搜索框文案
   - 用户想做什么：将录音复盘搜索框提示改为“输入规则名称”。
   - 已完成什么：把搜索框 placeholder 从“输入规则名或分类”改为“输入规则名称”。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过。
   - 待办/风险：无。
3. 2026-05-14｜处理标注：下钻页精简
   - 用户想做什么：删除附件中的下钻顶部面包屑/标题/说明，以及“当前层级组织”指标卡；返回规则列表按钮换位置且不换行。
   - 已完成什么：移除下钻页顶部说明区和第三个指标卡；把“返回规则列表”和“返回上一级”放到同一行操作区，并设置按钮不换行。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Playwright 验证已无“当前层级组织/全国视角/继续下钻”等文案，指标卡剩 2 个，返回按钮无文本溢出。
   - 待办/风险：无。
4. 2026-05-14｜处理标注：联动顶部组织筛选
   - 用户想做什么：录音复盘的查看组织表现要与顶部组织筛选关联；顶部选大区时，第一层展示战区。
   - 已完成什么：录音复盘组织表现起点改为读取 `currentRegion/currentZone/currentStore`；顶部组织变更时清空录音复盘内部下钻路径，从当前筛选组织的下一层开始展示。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Playwright 验证全国→大区、华南大区→战区、华南大区/广州战区→门店，门店层禁用下钻。
   - 待办/风险：无。
5. 2026-05-14｜处理标注：左侧概览文案
   - 用户想做什么：把左侧卡片中的“短板集中”改为“短板改善”，“风险需控”改为“风险管控”。
   - 已完成什么：更新左侧概览卡片两处标题文案。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过。
   - 待办/风险：无。

# 历史归档
- 2026-05-14｜录音复盘模块方案讨论：查看厂端看板现状，确认旧模块是 TOP5 卡片 + 录音弹层。
- 2026-05-14｜确认方案一的产品规则：确定采用“监测项优先，下钻看组织分布”，明确新 tab、规则样例和下钻规范。
- 2026-05-14｜落地规则命中分析模块：新增三类规则数据、搜索/排序、规则详情 TOP/BOT 组织表现和组织下钻；当前数据仍为前端模拟。
- 2026-05-14｜启动本地预览服务：沙箱外启动 `http://127.0.0.1:5173/factory-dashboard/index.html`，验证返回 200 OK。
- 2026-05-14｜处理标注：标题改回录音复盘：将模块标题从“规则命中分析”改回“录音复盘”。
