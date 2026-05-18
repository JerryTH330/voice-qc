# 当前接手摘要
- 项目：AI质检平台，当前主要处理 `voice-qc-admin-html` 静态管理后台页面。
- 当前基线：已按用户要求，用 `/Users/linxianxin/Downloads/voice-qc-main` 完整覆盖 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html`。
- 后续预览与修改：统一以 `/Users/linxianxin/Documents/codex/AI质检平台/voice-qc-admin-html` 为准，不再以 Downloads 副本作为开发基线。
- 最近已完成：门店看板核心指标区已重排为上下两层结构，上排业务指标，下排总结指标，质检和风险两组改成横向双栏。
- 待办/风险：当前只完成门店看板顶部筛选区的样式对齐，没有继续改动其余筛选条；如后续要完全共享同一套组件结构，还需要继续抽象。

# 最近 5 次工作记录

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

## 2026-05-14 GitHub 推送确认
- 用户想做什么：把本地 `voice-qc` 文件夹代码推送到 GitHub 共享，并总结下次自行推送指南。
- 已经完成了什么：确认远程仓库为 `JerryTH330/voice-qc`，执行 `git push origin main`，远程已是最新；记录 GitHub CLI token 已失效但不影响本次 git push 确认。
- 改动了哪些文件：`handoff-log.md`、`handoff-archive.md`。
- 做过哪些验证：`git status --short --branch`、`git remote -v`、`git log -1 --oneline --decorate`、`git push origin main`。
- 还有哪些待办或风险：需要提交并推送本次交接日志更新。

## 2026-05-14 09:12
- 用户想做什么：销售看板优势挖掘项、短板改善项、风险命中项录音跳转弹窗，在筛选框前增加下拉筛选项：按客户姓名、日期、录音ID筛选。
- 已经完成了什么：销售看板录音弹窗新增筛选字段下拉；筛选逻辑按当前字段匹配；切换字段时清空输入并更新提示文案。
- 改动了哪些文件：`app-runtime.js`；同步改了 `/Users/jerry/Desktop/voice-qc/app-runtime.js`。
- 做过哪些验证：代码检查通过；Playwright 打开 Desktop 销售看板，分别验证 strength/weakness/risk 三个弹窗均有 3 个筛选项，按日期筛选结果正常，无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-14 录音筛选
- 用户想做什么：门店看板优势挖掘项、短板改善项、风险命中项的录音跳转弹窗，在搜索框前增加下拉筛选项：按销售姓名、客户姓名、日期、录音ID筛选。
- 已经完成了什么：录音弹窗新增筛选字段下拉；筛选逻辑按当前字段匹配；切换字段时清空输入并更新提示文案。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 打开 Desktop 页面，分别验证 strength/weakness/risk 三个弹窗均有 4 个筛选项，按日期筛选结果正常，无控制台错误。
- 还有哪些待办或风险：暂无。

## 2026-05-13 16:55
- 用户想做什么：按 5 条浏览器批注修改门店看板质检概览与趋势图文案。
- 已经完成了什么：“全国均值”改“大区质检合格率”；“VS.全国”改“vs大区”；趋势图图例改为“门店质检合格率 / 大区质检合格率”；AI 小结改为用户指定句子；趋势图副标题也同步统一。
- 改动了哪些文件：`store-dashboard/index.html`、`app-runtime.js`；同步改了 Desktop 目录对应文件。
- 做过哪些验证：Playwright 打开工作区页面，确认相关文案全部更新，无控制台错误。
- 还有哪些待办或风险：暂无。
