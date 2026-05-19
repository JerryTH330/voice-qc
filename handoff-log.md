# 当前接手摘要
- 厂端看板原「录音复盘」模块已按方案一改造，模块标题保留为「录音复盘」，内部承载规则命中分析与组织下钻。
- 新 tab 为：SOP 质检分析、优势缺陷识别、风险命中分析。
- 第一层为规则列表，展示规则项、命中率、命中数量/样本数量；支持搜索、排序、分页。
- 点击规则后在当前模块内展示当前层级全部组织，并沿用规则列表当前排序方式；组织表现会联动顶部组织筛选：全国看大区、大区看战区、战区看门店、门店禁用下钻；所有下钻和回退无页面跳转、无弹窗。
- 旧录音弹层函数暂未删除，但新模块不再调用。
- 项目：AI质检平台，当前主要处理 `voice-qc-admin-html` 静态管理后台页面。
- 当前基线：已按用户要求，用 `/Users/linxianxin/Downloads/voice-qc-main` 完整覆盖 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html`。
- 后续预览与修改：统一以 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html` 为准，不再以 Downloads 副本作为开发基线。
- 最近已完成：门店看板核心指标区已重排为上下两层结构，上排业务指标，下排总结指标，质检和风险两组改成横向双栏。
- 待办/风险：当前只完成门店看板顶部筛选区的样式对齐，没有继续改动其余筛选条；如后续要完全共享同一套组件结构，还需要继续抽象。

# 最近 5 次工作记录
1. 2026-05-18｜咨询：只提交本轮对话改动到 GitHub
   - 用户想做什么：只把本轮对话产生的改动提交到 GitHub，不带上工作区里其他未提交修改。
   - 已完成什么：检查当前 git 状态，确认本轮相关文件与其他历史未提交文件可区分，准备给出按文件选择性提交方案。
   - 改动文件：`handoff-log.md`。
   - 验证：`git status --short`、`git branch --show-current` 已执行，当前分支为 `main`，存在其他未提交文件 `app-runtime.js`、`factory-dashboard/factory-dashboard.css`。
   - 待办/风险：若用户要我代为提交，需要只暂存本轮相关文件，避免使用 `git add .`。
2. 2026-05-18｜处理标注：组织下钻改为全量排序
   - 用户想做什么：厂端看板里“看组织表现”不要再拆成 TOP5/BOT5，要直接展示当前组织下所有子组织，并沿用外层规则列表当前排序方式。
   - 已完成什么：抽出组织下钻排序工具；下钻页从 TOP5/BOT5 双卡改成单卡全量列表；排序复用外层的命中率/命中数量/样本数量规则；录音复盘副标题同步去掉 TOP/BOT 表述。
   - 改动文件：`factory-dashboard/issue-rule-analysis-utils.js`、`factory-dashboard/factory-dashboard.js`、`factory-dashboard/page.js`、`tests/factory-issue-rule-analysis-utils.test.js`、`handoff-log.md`。
   - 验证：`node --test tests/factory-issue-rule-analysis-utils.test.js` 通过；`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/issue-rule-analysis-utils.js`、`node --check factory-dashboard/page.js` 通过；Playwright 验证下钻页仅显示“当前组织列表”，全国层展示 7 个大区，`count-desc` 下按命中数量降序展示。
   - 待办/风险：暂无；若后续还要在下钻页直接切换排序，可把当前排序下拉补到详情页。
3. 2026-05-14｜处理标注：录音复盘高度对齐与分页
   - 用户想做什么：录音复盘高度和左侧对齐，不要无限展开，可以设计分页。
   - 已完成什么：将规则列表从“加载更多”改为每页 5 条的上一页/下一页分页；给录音复盘卡片加高度约束，使其与左侧概览+排行区域对齐。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Playwright 验证右侧高度 962px，左侧对应高度 962px，分页可从第 1/5 页切到第 2/5 页，下钻后高度保持不变。
   - 待办/风险：无。
4. 2026-05-14｜处理标注：搜索框文案
   - 用户想做什么：将录音复盘搜索框提示改为“输入规则名称”。
   - 已完成什么：把搜索框 placeholder 从“输入规则名或分类”改为“输入规则名称”。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过。
   - 待办/风险：无。
5. 2026-05-14｜处理标注：下钻页精简
   - 用户想做什么：删除附件中的下钻顶部面包屑/标题/说明，以及“当前层级组织”指标卡；返回规则列表按钮换位置且不换行。
   - 已完成什么：移除下钻页顶部说明区和第三个指标卡；把“返回规则列表”和“返回上一级”放到同一行操作区，并设置按钮不换行。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js` 通过；Playwright 验证已无“当前层级组织/全国视角/继续下钻”等文案，指标卡剩 2 个，返回按钮无文本溢出。
   - 待办/风险：无。

# 历史归档
- 2026-05-18 用户要求按确认范围推送当前分支：只提交厂端看板 6 个文件，并把 `客户洞察` 一起纳入当前仓库；`Customer Insights` 与 `store-dashboard` 的已删除旧页面不进入本次提交。期间已修复 `客户洞察/filter-regression-test.js` 抢跑问题，浏览器回归脚本现已跑通。
- 2026-05-18 厂端看板顶部筛选中的”数据来源 / 业务场景 / 时间 / 车系”已按门店看板对齐：筛选顺序改为”品牌、数据来源、业务场景、时间、车系”，时间筛选的”自定义”已从旧弹窗改成门店端同款内嵌日期范围控件。
- 数据来源与业务场景联动逻辑已统一到门店端规则：切换来源后，只保留可选场景，不可用场景禁用；”全部”态表现与门店端一致。
- 2026-05-18 用户要求全局安装 `weread` skill；已确认原先公开页面给出的仓库 `majiayu000/claude-skill-registry` 现在主要是索引仓库，真正的 skill 文件位于 `majiayu000/claude-skill-registry-data` 的 `skills/data/weread`。当前安装被系统授权拦下，尚未完成。
- 厂端看板原「录音复盘」模块已按方案一改造，模块标题保留为「录音复盘」，内部承载规则命中分析与组织下钻。
- 点击规则后在当前模块内展示当前层级全部组织，并沿用规则列表当前排序方式；组织表现会联动顶部组织筛选：全国看大区、大区看战区、战区看门店、门店禁用下钻；所有下钻和回退无页面跳转、无弹窗。
- 顶部头像下方的组织文案已改为固定显示用户所属组织，不再跟随顶部品牌/组织筛选变化；当前示例固定为”华南大区”。

## 2026-05-18 门店录音弹窗统计卡对齐销售看板指标卡
- 用户想做什么：把门店看板录音弹窗里的 `全部录音 / 涉及顾问` 两张统计卡，改成销售看板推荐清单板块的指标卡片样式。
- 已经完成了什么：将门店录音弹窗统计卡改成浅渐变底、细边框、16px 圆角、较轻标题字重和 24px 数字的指标卡风格；去掉原来的重阴影和更厚的数字表现。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：静态检查确认 `.store-recording-library-overlay .recording-library-summary div` 已改为销售指标卡同类渐变底和边框色，`strong` 改为 `24px` 且使用 `font-metric`，资源版本号已更新到 `20260518101740`。
- 还有哪些待办或风险：这次只调整了统计卡视觉，没有继续改录音列表行和搜索栏；如果后续要和销售看板做到完全一比一，还需继续统一这些区域。

## 2026-05-18 门店复盘卡片“查看”按钮样式对齐销售看板
- 用户想做什么：把门店看板“录音复盘”卡片里的“查看”按钮，改成销售看板推荐清单客户卡片“录音详情”的样式。
- 已经完成了什么：将门店看板 `.issue-rec-more` 从描边胶囊按钮改成销售看板同款蓝色文字链路按钮；保留文案“查看”，但视觉改为蓝字、无边框、右箭头。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：静态检查确认 `.issue-rec-more` 已改为 `font-size:14px`、`font-weight:500`、透明背景、无边框，并补上和销售看板同款的 `::after` 右箭头；资源版本号已更新到 `20260518085940`。
- 还有哪些待办或风险：这次只改了按钮样式，没有调整“查看”按钮所在卡片的右侧留白和纵向对齐；如果后续要做到完全一比一，还可以再抠按钮与人数文案之间的间距。

- 做过哪些验证：再次扫描 `/Users/linxianxin/Documents/codex/AI质检平台` 下 `.md` 文件，确认当前只剩 `voice-qc-admin-html/handoff-log.md`、`voice-qc-admin-html/handoff-archive.md`、`voice-qc-admin-vue/README.md`、`voice-qc-admin-vue/MIGRATION_PLAN.md`。
- 还有哪些待办或风险：后续验证如需导出结构或说明，应只临时使用，收尾时立即删除，不再沉淀到项目根目录。

## 2026-05-18 清理项目目录验证截图
- 用户想做什么：删除项目目录下无关截图，后续验证用截图也不要保留。
- 已经完成了什么：清理了项目根目录下此前留存的门店看板筛选区、checkbox、KPI 两排等验证截图；复查后当前工作区只剩页面正式素材图片，没有验证产物残留。
- 改动了哪些文件：删除了项目根目录下 11 张验证截图文件；未改动 `assets` 正式素材。
- 做过哪些验证：再次扫描 `/Users/linxianxin/Documents/codex/AI质检平台` 下的图片文件，确认根目录验证截图已清空，仅保留 `voice-qc-admin-html/assets` 和 `voice-qc-admin-vue/src/assets/local-assets-vue` 中的业务素材图。
- 还有哪些待办或风险：后续如需临时截图验证，完成后应在收尾时立即删除，不再保留到项目目录。

## 2026-05-15 门店关键指标区改为两排布局
- 用户想做什么：把门店看板“今日门店关键指标”改成上下排版。上排只放 `邀约录音数 / 接待录音数 / 试驾录音数`；下排放 `平均时长 / 话术执行率 / 质检合格数+质检合格率 / 风险录音数+风险录音率`，其中后两组改成横向双栏、竖向分割线。
- 已经完成了什么：重写门店看板 KPI 区渲染结构，拆成 `hm-layout-top` 和 `hm-layout-bottom` 两层；上排保留业务卡之间的流向箭头；下排改成四列，其中质检和风险卡片为横向双栏结构，并把中间分割线改成竖线；同时补了窄屏下的响应式堆叠规则。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515170940`，确认指标区已变成两排布局，且双栏卡在 1327 宽度下不再挤压。
- 还有哪些待办或风险：当前布局已经成型；如果你后续还想继续抠，可以再细调上排三张业务卡的高度、箭头长度，或者下排四项之间的列宽比例。

## 2026-05-15 业务场景补全“全部 / 半选”逻辑
- 用户想做什么：要求“业务场景”里的 `全部` 不是独立选项，而是主 checkbox；当全部选中时，后面的可见项都应选中；当只有部分选中时，`全部` 应显示半选样式。
- 已经完成了什么：调整场景切换逻辑，让“全部”状态下取消某个子项时，保留其余可见项选中；同步给 `全部` 增加半选视觉和 `aria-checked=\"mixed\"` 语义；同时让子项在“全部”状态下显示为已选，而不是只亮“全部”本身。
- 改动了哪些文件：`dashboard-filter-utils.js`、`app-runtime.js`、`app-inline.css`、`tests/dashboard-filter-utils.test.js`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：`node --test tests/dashboard-filter-utils.test.js` 共 15 条全部通过；新增了“all-selected master state deselecting one child keeps the rest selected”测试。
- 还有哪些待办或风险：当前已经修正逻辑和样式；若你后续还要“点击半选的全部时是恢复全选还是清空当前可见项”，可以继续明确这条交互规则。

## 2026-05-15 业务场景 checkbox 勾选框美化
- 用户想做什么：在业务场景已经切成 checkbox 模式的基础上，继续把勾选框样式做得更精致。
- 已经完成了什么：把 checkbox 从 14px 调整到 16px，圆角和边框更柔和；未选中态补了轻微高光和内阴影；选中态改成更细的蓝色渐变填充和更顺的勾形，同时收了 hover 态和禁用态。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515155450`，确认勾选框视觉已更新。
- 还有哪些待办或风险：当前只美化了视觉表现；如果还要再偏“系统原生风”或“更轻更细”的方向，可以继续调整方框尺寸、描边和勾形粗细。

## 2026-05-15 业务场景改为 checkbox 多选样式
- 用户想做什么：把门店看板筛选区里的“业务场景”多选样式，从胶囊按钮改成 checkbox 模式。
- 已经完成了什么：仅调整 `业务场景` 这一组的视觉样式，把每个选项前面改成复选框方块；选中态显示蓝底勾选，未选中态显示空方框；原有多选逻辑、禁用态和筛选联动保持不变。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515155240`，确认“业务场景”已从胶囊切换为 checkbox 视觉。
- 还有哪些待办或风险：当前只改了视觉，没有改交互文案和 aria 语义；如果后续你要把“全部”也改成更像“全选 checkbox”的交互提示，可以再继续收。

## 2026-05-15 车系下拉选项左右 14px 内边距
- 用户想做什么：要求门店看板车系下拉选项只加左右 padding，不加上下 padding。
- 已经完成了什么：在门店看板本地样式中给 `.store-model-option.session-menu-option` 显式补上 `padding: 0 14px`，确保选项左右留白固定为 14px，上下不额外加 padding。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已确认基础全局下拉选项本身就是 `padding: 0 14px`，并在门店看板本地样式再次显式覆盖，避免后续被其他规则覆盖。
- 还有哪些待办或风险：这次只锁定了门店看板车系下拉项的 padding，如果你后续要把其他下拉面板的选项留白也统一成同一套，需要继续逐个收。

## 2026-05-15 删除门店筛选区日期空框
- 用户想做什么：指出筛选区里的“日期”空框本来就不该出现，要求直接删掉。
- 已经完成了什么：从 `store-dashboard/index.html` 中移除了 `store-date-filter-shell` 这层空框结构；把日期面板锚点改挂在“时间”筛选框内部，自定义时间时只弹出日期面板，不再额外出现一个“日期”框。
- 改动了哪些文件：`store-dashboard/index.html`、`app-runtime.js`、`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515153010`，确认默认态下页面中已不存在“日期”空框。
- 还有哪些待办或风险：当前已确认默认态删除生效；点击 `自定义` 后的弹层行为未做自动化点击验证，因为当前 Node 运行时缺少 `playwright` 包，如需我可继续用别的方式补人工验证。

## 2026-05-15 门店筛选区改为单行流式换行
- 用户想做什么：要求门店看板顶部筛选区不要再分成两块，全部放在同一行里，单个控件按最小宽度排列，空间不够就自动换行。
- 已经完成了什么：把门店看板筛选区从“分段行容器 + 上下两行”改成单一 flex-wrap 流式布局；取消原来的上下分割线和分行结构，让 `数据来源 / 业务场景 / 时间 / 日期 / 车系` 都参与同一个换行流；保留原有筛选逻辑不变。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515150640`，确认筛选区已经是同一块流式换行布局，不再有上下两块分区。
- 还有哪些待办或风险：当前已验证默认态布局；若后续用户对“自定义日期”展开后的换行位置还有更细要求，需要继续针对展开态做补调。

## 2026-05-15 门店看板筛选区样式按录音列表规范收口
- 用户想做什么：根据录音列表筛选区域规范文档，调整门店看板顶部筛选区样式，让它和录音列表筛选区保持一致。
- 已经完成了什么：把门店看板顶部筛选区的外层卡片、两行布局、分段筛选控件、时间筛选、车系下拉统一到录音列表同一套视觉规范；同时补了 `aria-pressed` 和车系下拉打开态 class，保证交互状态和样式状态一致；为避免“试乘试驾”被挤压，把时间筛选独立到下一行同卡片区域；最后刷新资源版本，避免浏览器继续命中旧缓存。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`app-runtime.js`、`store-dashboard/page.css`、`store-dashboard/page.js`。
- 做过哪些验证：已打开并截图比对 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515145200` 与 `http://127.0.0.1:4191/session/index.html?route=session`；确认门店看板筛选区在卡片、边框、圆角、按钮字号、标签字号、行间分隔和控件密度上已对齐录音列表规范，且“试乘试驾”不再被截断。
- 还有哪些待办或风险：门店看板顶部筛选项数量和字段类型与录音列表不完全相同，所以只能做到“同规范、不同字段”的一致，不应再强行改成录音列表的字段排布。

## 2026-05-15 门店筛选标题去掉小胶囊
- 用户想做什么：指出门店看板筛选区所有标题不应该再有独立外容器，标题应和录音列表一样直接挂在筛选框内。
- 已经完成了什么：去掉门店看板筛选标题 `.gf-label` 的背景、边框、圆角、内边距和字间距，保留外层筛选框容器，只显示纯文字标题。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515145830`，确认“数据来源 / 业务场景 / 时间 / 日期 / 车系”标题均不再有小胶囊外容器。
- 还有哪些待办或风险：当前只修正了标题层，如后续还要继续把门店筛选区的文字粗细、左右留白再细抠，需要继续逐项对录音列表截图。

## 2026-05-15 录音列表筛选区域规范文档
- 用户想做什么：把录音列表页顶部筛选区域整理成一份可复用的筛选区域规范文档，并保存到项目目录下。
- 已经完成了什么：基于 `session/index.html`、`app-runtime.js`、`voice-qc-admin.css` 的真实实现，整理出录音列表筛选区域规范，覆盖适用范围、结构分层、控件类型、视觉值、字段清单、响应式和设计禁区。
- 改动了哪些文件：`docs/session-filter-region-spec.md`。
- 做过哪些验证：已检查文档文件存在，路径正确，文档头部内容可正常读取。
- 还有哪些待办或风险：当前文档是基于录音列表现状整理出的规范，如果后续筛选区样式或交互再调整，需要同步更新这份文档。

## 2026-05-15 门店顶部筛选区样式对齐
- 用户想做什么：把门店看板顶部筛选区域的筛选框样式对齐到录音列表筛选区域，统一字体、字号、颜色、边距和间距。
- 已经完成了什么：调整顶部筛选外层容器、筛选块、场景按钮、时间范围控件、车系下拉的边框、圆角、字号、留白和焦点态，使其回到录音列表筛选区同一套白底细边框规范；随后继续把顶部筛选区外层和按钮圆角统一到 `12px`，按钮字号统一到 `13px`；之后尝试把整块 `store-filter-shell` 改成“标题在上、控件在下”的结构，但用户明确判定方向错误，已按要求回退这一次结构性改动。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.css`、`store-dashboard/page.js`、`store-dashboard/index.html`。
- 做过哪些验证：已打开回退后的预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515122840` 检查顶部筛选区已回退；页面可正常打开。
- 还有哪些待办或风险：这次只对齐门店看板顶部筛选区，若后续要求督办清单里的筛选条也完全并到同一规范，还需要继续收口。

## 2026-05-15 门店看板筛选指标联动
- 用户想做什么：调整门店看板顶部筛选和核心指标的联动规则，云外呼场景显示邀约录音数，进店接待显示接待录音数，试乘试驾显示试驾录音数，工牌来源不显示邀约录音数。
- 已经完成了什么：新增按“数据来源 + 业务场景多选”计算业务指标类型的规则；门店看板核心指标不再只按单一场景映射，而是按当前筛选动态显示邀约、接待、试驾指标组合。
- 改动了哪些文件：`dashboard-filter-utils.js`、`app-runtime.js`、`tests/dashboard-filter-utils.test.js`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：`node --test tests/dashboard-filter-utils.test.js` 14 条测试通过；本地预览验证“只选云外呼 / 只选工牌 / 只选进店接待 / 进店接待+试乘试驾 / 首触+邀约 / 首触+邀约+排程”指标显示符合规则；页面错误日志为空。
- 还有哪些待办或风险：当前只调整顶部核心指标展示规则，顾问表格和趋势图仍沿用原有场景口径，如后续也要求同样联动，需要单独收口。

## 2026-05-15 门店看板录音弹窗样式收口
- 用户想做什么：把门店看板“优势发掘/短板改善/风险命中”录音弹窗的风格收回系统整体样式，不要再是单独的深蓝头部风格。
- 已经完成了什么：修改 `app-inline.css`，重做录音弹窗遮罩、容器、头部、统计块、筛选区、列表项、按钮的视觉层级，使其回到门店看板现有的浅底、细边框、轻阴影、胶囊控件体系；同时在 `app-runtime.js` 给门店看板录音弹窗补了专用 class，避免样式误伤其它页面的录音弹窗。
- 改动了哪些文件：`app-inline.css`、`app-runtime.js`。
- 做过哪些验证：已确认本地预览加载了新样式文件；代码定位确认改动命中门店看板录音弹窗相关选择器。
- 还有哪些待办或风险：当前本地预览自动化会话里 `openStoreIssueRecordingLibrary` 未挂到 `window`，导致无法完整自动点开该弹窗做最终截图验收；如果用户侧页面能正常打开弹窗，刷新后应直接看到新样式。

## 2026-05-15 门店看板预览缓存强刷
- 用户想做什么：用户在浏览器里仍看到录音弹窗旧样式，需要确认并切换到最新资源。
- 已经完成了什么：给 `store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css` 增加版本参数，强制门店看板页面重新拉取最新 HTML/CSS/JS；同时打开了带版本参数的新预览地址。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：新预览地址已打开为 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515111810`。
- 还有哪些待办或风险：如果用户继续停留在旧标签页或旧弹窗状态，仍可能看到未刷新的旧 DOM；应以带版本参数的新标签页为准继续检查。

## 2026-05-15 门店录音弹窗标题区收紧
- 用户想做什么：把弹窗标题改成“优势发掘录音·深度需求挖掘”，描述不变，同时让标题区边距和 padding 跟系统其他板块标题规范一致。
- 已经完成了什么：将门店录音弹窗标题从“eyebrow + 大标题”改成单行主标题；同步收紧标题区 padding、标题 margin、描述与标题间距，并把字号层级调整到接近系统板块标题。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`；同时把门店看板资源版本号更新到 `20260515112330`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515112330`。
- 还有哪些待办或风险：当前仍以新版本地址为准检查，旧标签页可能继续显示上一版缓存。

## 2026-05-15 质检概览标题规范对齐
- 用户想做什么：把“质检概览”标题区去掉 icon、去掉下描边，并让间距边距和销售看板推荐区标题规范保持一致。
- 已经完成了什么：删除 `store-dashboard/index.html` 中该标题区的 icon 结构和行内布局，改为标准标题容器；在 `app-inline.css` 里单独把 `sop-overview-track` 的 header 改成无描边、透明底、顶部标题节奏。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`；同时把门店看板资源版本号更新到 `20260515113130`。
- 做过哪些验证：已打开新预览地址 `http://127.0.0.1:4191/store-dashboard/index.html?route=dashboard&v=20260515113130`。
- 还有哪些待办或风险：当前仍以新版本地址为准检查，旧标签页可能继续显示上一版缓存。

## 2026-05-15 工作目录基线切换
- 用户想做什么：把 `/Users/linxianxin/Downloads/voice-qc-main` 目录文件完整替换到 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html`，后续统一在工作区目录预览和改动。
- 已经完成了什么：执行整目录覆盖同步，保留目标目录路径不变。
- 改动了哪些文件：`voice-qc-admin-html` 目录整体内容。
- 做过哪些验证：`diff -qr /Users/linxianxin/Downloads/voice-qc-main /Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html` 无输出，两个目录当前完全一致。
- 还有哪些待办或风险：后续应只维护工作区目录，避免与 Downloads 副本再次分叉。

## 2026-05-15 门店看板 tab 位置与样式调整
## 2026-05-18 备份同步并准备分支提交
- 用户想做什么：把 `/Users/linxianxin/Downloads/voice-qc-admin-html` 里的备份文件同步回当前 GitHub 克隆仓库，并作为新分支提交。
- 已经完成了什么：已将备份目录内容覆盖同步回 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html`；已在仓库内创建分支 `codex/sync-backup-20260518`；已清理仓库内 `.DS_Store`。
- 改动了哪些文件：当前同步回来的主要改动包括 `app-inline.css`、`app-runtime.js`、`dashboard-filter-utils.js`、`store-dashboard/index.html`、`store-dashboard/page.css`、`store-dashboard/page.js`、`tests/dashboard-filter-utils.test.js`、`docs/session-filter-region-spec.md`、`handoff-log.md`。
- 做过哪些验证：确认目标目录已是独立 Git 仓库；`git status` 已显示同步后的待提交文件；分支创建成功。
- 还有哪些待办或风险：还未执行 `git add / commit / push`，下一步将把本次同步内容提交并推送到远端分支。

- 用户想做什么：把「顾问管理 / 督办清单」tab 放到质检概览上面，外面加容器，样式与销售看板「云外呼 / 工牌」tab 一致。
- 已经完成了什么：修改 `store-dashboard/index.html`，给主 tab 增加 `sales-role-nav`、`role-page-switch`、`role-switch-link` 结构 class，并将第二个 tab 文案统一为「督办清单」；修改 `app-inline.css`，让门店看板 tab 容器使用销售看板同款容器样式。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`；当时也同步改过 Downloads 预览副本。
- 做过哪些验证：静态检查确认顺序为“筛选区 -> 核心指标 -> tab 容器 -> 顾问管理内容 -> 质检概览”，结构符合要求。
- 还有哪些待办或风险：当前开发基线已经切回工作区目录，后续无需再同步 Downloads 副本。

## 2026-05-14 卡片标题文案
- 用户想做什么：把卡片中的“短板集中”改为“短板改善”，“风险需控”改为“风险管控”。
- 已经完成了什么：门店看板质检概览小卡片标题已改，并同步到 Desktop 副本。
- 改动了哪些文件：`store-dashboard/index.html`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 打开 Desktop 页面，确认三张卡片标题为“优势发掘 / 短板改善 / 风险管控”，旧文案不存在，无控制台错误。
- 还有哪些待办或风险：暂无。

# 最近 5 次工作记录
1. 2026-05-18｜按确认范围推送当前分支
   - 用户想做什么：只提交厂端看板 6 个文件，并把 `客户洞察` 一起推到当前 GitHub 分支；`Customer Insights` 和 `store-dashboard` 这些已删除旧页面不要带进本次提交。
   - 已完成什么：确认当前分支为 `codex/factory-org-sort`；核对需提交范围；确认 `客户洞察` 目录自带独立 `.git`，后续提交前需要先临时移开，才能按普通文件目录纳入当前仓库；定位并修复 `客户洞察/filter-regression-test.js` 的等待时机过早问题，将页面等待从 `commit + 固定 300ms` 改为 `load + 等待 source 筛选挂载`。
   - 改动文件：`handoff-log.md`、`客户洞察/filter-regression-test.js`。
   - 验证：已执行 `git status --short --branch`、`git diff --stat`、`git branch -vv`、`gh auth status`、`node --check '客户洞察/客户洞察.js'`；浏览器回归脚本 `node '客户洞察/filter-regression-test.js'` 已通过，输出 `allMetric=286`、`cloudMetric=286`、`badgeMetric=0`。
   - 待办/风险：若本机 Git 凭证也已失效，实际推送时可能仍需重新登录 GitHub；`客户洞察` 的内层 `.git` 仅会在提交前临时移开，不会删除其内容文件。
1. 2026-05-18｜顶部筛选对齐门店看板
   - 用户想做什么：把厂端看板顶部筛选里“数据来源、业务场景”的渲染和交互，连同时间/车系这块的展示方式，一起改成和门店看板一致。
   - 已完成什么：调整厂端顶部筛选顺序为“品牌、数据来源、业务场景、时间、车系”；移除旧的自定义时间弹窗，改成门店端同款内嵌日期范围控件；同步来源切换后的场景禁用/可选逻辑，并保留厂端原有品牌、组织筛选不变。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/page.js` 通过；Playwright 校验顶部筛选标签顺序为“品牌、数据来源、业务场景、时间、车系”，`云外呼` 下禁用“进店接待/试乘试驾”，`工牌` 下禁用三种云外呼场景；点击“自定义”后会展开日期范围控件并可应用快捷范围。
   - 待办/风险：当前日期快捷范围以当前日期为锚点生成，满足门店端交互形态；如果后续厂端也要和真实业务样本日期严格对齐，再补接真实数据锚点即可。
2. 2026-05-18｜技能安装：全局安装 weread 受阻
   - 用户想做什么：把 `weread` skill 全局安装到本机。
   - 已完成什么：读取 `skill-installer` 说明；第一次按 `majiayu000/claude-skill-registry/tree/main/skills/data/weread` 安装失败，原因一是 Python 直连 GitHub 证书校验失败，二是进一步确认该仓库现在主要是索引仓库；随后通过网页信息确认真实 skill 文件应位于 `majiayu000/claude-skill-registry-data` 的 `skills/data/weread`。
   - 改动文件：`handoff-log.md`。
   - 验证：安装脚本 `download` 模式报 SSL 证书错误；安装脚本 `git` 模式报路径不存在；网页核对到主仓库 README 明确说明 `data` 仓库存放 `skills/**`，`weread` 页面仍标注路径 `skills/data/weread`。
   - 待办/风险：最后一步安装命令因用户未授权沙箱外联网执行而被拦下；若用户重新允许，可直接运行安装脚本：`python3 /Users/jerry/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --method git --repo majiayu000/claude-skill-registry-data --path skills/data/weread`。
3. 2026-05-18｜技能检索：查找微信读书 skill
   - 用户想做什么：启用 `find-skills` skill，看看有没有“微信读书 / WeRead”相关 skill 可用。
   - 已完成什么：读取 `find-skills` skill 说明；本地技能目录全文检索 `微信读书`、`微信阅读`、`weread`、`WeRead`，未发现已安装相关 skill；联网检索后找到一个外部社区候选 `weread`，说明用途为拉取微信读书笔记与划线。
   - 改动文件：`handoff-log.md`。
   - 验证：执行了本地 `rg` 检索；联网搜索核对了 skills 生态与第三方收录页，确认存在名为 `weread` 的社区 skill 候选。
   - 待办/风险：该 skill 目前不是本项目已安装 skill；来源为社区仓库 `majiayu000/claude-skill-registry`，仓库公开星标约 99，未见明确高安装量数据，若要安装建议先人工复核仓库内容和脚本安全性。
4. 2026-05-18｜修复回归：录音复盘样式丢失
   - 用户想做什么：录音复盘区域恢复正常渲染，不要显示成一堆原生输入框和按钮。
   - 已完成什么：定位到当前分支 `factory-dashboard/factory-dashboard.css` 缺少规则列表/下钻列表整段样式，而 JS 数据渲染正常；已把 `main` 上对应的录音复盘 CSS 段落补回当前分支。
   - 改动文件：`factory-dashboard/factory-dashboard.css`、`handoff-log.md`。
   - 验证：`node --test tests/*.test.js` 通过；Playwright 验证 `.issue-rule-toolbar` 为 `grid`、`.issue-rule-row` 为 `grid`，首条规则行恢复 `58px` 高度、`8px` 圆角和卡片背景。
   - 待办/风险：根因是切分支时只带了 JS 没带配套 CSS；后续如果继续从别的分支挑文件，录音复盘相关 JS/CSS 需要成套迁移。
5. 2026-05-18｜处理标注：头像下组织文案固定
   - 用户想做什么：头像下方这行组织文案不要和顶部筛选联动，要固定显示该用户自己的组织，例如“华南大区”。
   - 已完成什么：定位到 `factoryHeroSubtitle` 原先取值依赖 `currentBrand`；新增 hero 文案工具函数，改为优先读取用户资料中的固定组织 `organization`，无组织时再回退到 `region`；页面已接入新工具。
   - 改动文件：`factory-dashboard/factory-dashboard.js`、`factory-dashboard/page.js`、`factory-dashboard/factory-hero-utils.js`、`tests/factory-hero-utils.test.js`、`handoff-log.md`。
   - 验证：`node --test tests/factory-hero-utils.test.js` 通过；`node --check factory-dashboard/factory-hero-utils.js`、`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/page.js` 通过；Playwright 验证顶部筛选切到“埃安 + 华东大区”后，头像下文案仍保持“华南大区”。
   - 待办/风险：当前固定组织仍为前端模拟数据；若后续接真实登录态，需要把 `factoryUserProfile.organization` 改为读取真实用户资料。

# 历史归档
- 2026-05-18｜处理标注：组织下钻改为全量排序：抽出组织下钻排序工具；下钻页从 TOP5/BOT5 双卡改成单卡全量列表；排序复用外层的命中率/命中数量/样本数量规则；验证 `node --test tests/factory-issue-rule-analysis-utils.test.js`、`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/issue-rule-analysis-utils.js`、`node --check factory-dashboard/page.js` 通过，Playwright 验证下钻页仅显示“当前组织列表”，全国层展示 7 个大区且按命中数量降序。
- 2026-05-14｜处理标注：录音复盘高度对齐与分页：将规则列表改为每页 5 条分页，并给录音复盘卡片加高度约束，使其与左侧区域对齐；验证 `node --check factory-dashboard/factory-dashboard.js` 通过，Playwright 验证左右高度均为 962px 且分页切换正常。
- 2026-05-14｜录音复盘模块方案讨论：查看厂端看板现状，确认旧模块是 TOP5 卡片 + 录音弹层。
- 2026-05-14｜确认方案一的产品规则：确定采用“监测项优先，下钻看组织分布”，明确新 tab、规则样例和下钻规范。
- 2026-05-14｜落地规则命中分析模块：新增三类规则数据、搜索/排序、规则详情 TOP/BOT 组织表现和组织下钻；当前数据仍为前端模拟。
- 2026-05-14｜启动本地预览服务：沙箱外启动 `http://127.0.0.1:5173/factory-dashboard/index.html`，验证返回 200 OK。
- 2026-05-14｜处理标注：标题改回录音复盘：将模块标题从“规则命中分析”改回“录音复盘”。
- 2026-05-14｜处理标注：左侧概览文案：将“短板集中”改为“短板改善”，“风险需控”改为“风险管控”。
- 2026-05-14｜处理标注：联动顶部组织筛选：录音复盘组织表现起点联动顶部组织筛选，全国看大区，大区看战区，战区看门店。
- 2026-05-14｜处理标注：下钻页精简：移除下钻顶部说明区和“当前层级组织”指标卡，返回按钮并排显示。
- 2026-05-14｜处理标注：搜索框文案：录音复盘搜索框 placeholder 调整为“输入规则名称”。
- 2026-05-18｜处理标注：头像下组织文案固定：定位到 `factoryHeroSubtitle` 原先取值依赖 `currentBrand`；新增 hero 文案工具函数，改为优先读取用户资料中的固定组织 `organization`，无组织时再回退到 `region`；验证 `node --test tests/factory-hero-utils.test.js`、`node --check factory-dashboard/factory-hero-utils.js`、`node --check factory-dashboard/factory-dashboard.js`、`node --check factory-dashboard/page.js` 通过，Playwright 验证顶部筛选切到“埃安 + 华东大区”后，头像下文案仍保持“华南大区”。
