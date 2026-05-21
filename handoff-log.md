# 当前接手摘要
- 项目：AI质检平台，当前主要处理 `voice-qc-admin-html` 静态管理后台页面。
- 当前基线：已按用户要求，用 `/Users/linxianxin/Downloads/voice-qc-main` 完整覆盖 `/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html`。
- 后续预览与修改：统一以 `/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html` 为准，不再以 Downloads 副本作为开发基线。
- 最近已完成：已按用户在 Figma `Untitled` 文件里的最新大改版，重做门店看板“质检概览”结构：由旧的圆环 + 对比块，改成双指标横卡 + 中间 VS + 右侧提升值，并同步重做三张总结卡头部样式。
- 待办/风险：当前已继续补上 `质检概览` 顶部指标行的断点和自适应，并且已按 Figma 节点 `272:120` 重新下载三张总结卡 icon、把卡面改回“白底 + 顶部 2px 彩色描边”的结构；最新又补了“短板改善 / 风险管控”两张卡内容左上对齐，并按用户要求去掉了箭头的 CSS 动效，改成引用本地 GIF 资源；同时已将“门店质检合格率 / 大区质检合格率”两张卡的内部排版收回到 Figma 的居中基线结构，并把“提升 9%”拆成文字组基线对齐 + 右侧 GIF 独立对齐；本轮又将 tip 文案字号改为 `14px`。由于当前环境缺少 Playwright，未做最终浏览器截图级验收，后续应在页面里人工刷新确认 tip 文案与设计稿字号是否一致。

# 最近 5 次工作记录

## 2026-05-21 Codex 项目目录迁移到 /Users/linxianxin/codex
- 用户想做什么：将原来 `/Users/linxianxin/codex` 下的 Codex 项目整体迁移到 `/Users/linxianxin/codex`，避免父级 `codex` 被误识别成同一个 Git `main`。
- 已经完成了什么：已将项目目录迁移到 `/Users/linxianxin/codex`；旧父级 `/Users/linxianxin/codex` 已不再是 Git 仓库，原 `.git` 已改名为 `.git.migrated-backup-20260521`，只作为可恢复备份保留；Codex 本地项目列表已更新，`AI质检平台` 显示名保留，但实际入口指向真正的 Git 仓库 `/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html`。
- 改动了哪些文件：迁移了项目目录；更新了 `~/.codex/config.toml`、`~/.codex/.codex-global-state.json`、`~/.codex/state_5.sqlite` 和 ambient suggestions 缓存；本日志已同步新路径。
- 做过哪些验证：确认 `/Users/linxianxin/codex` 本身不是 Git 仓库；确认 `voice-qc-admin-html` 仍连接 `https://github.com/JerryTH330/voice-qc.git`；确认 `埃安AI线索精益项目` 仍连接 `https://github.com/lxxgg92/aion-ai-leads-project.git`；确认 Codex 项目列表已指向新路径。
- 还有哪些待办或风险：迁移后需要重启 Codex 或刷新项目列表，让侧边栏读取新的本地状态；旧路径中的父级 Git 元数据已改名为 `.git.migrated-backup-20260521`，不应再作为工作入口打开；迁移后需要重启 Codex 或刷新项目列表，让侧边栏读取新的本地状态。


## 2026-05-20 门店看板 SOP 提示文案字号改为 14px
- 用户想做什么：要求将 `SOP执行平平稳...` 这条提示文案的字号改成 `14px`。
- 已经完成了什么：仅调整了 `#sop-ai-summary .hint-text` 的字号，从 `13px` 改为 `14px`，保留现有 tip 结构、位置、行高和 icon 不变。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.sop-ai-summary .hint-text` 已更新为 `font-size:14px`；门店看板独立入口资源版本号已更新到 `20260520214000`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前只改了字号，没有继续调整 tip 的高度和行高；如果用户下一轮觉得这一条变大后有点挤，需要再只微调这条的纵向节奏。

## 2026-05-20 门店看板“提升 9%”改为文字组基线对齐
- 用户想做什么：指出“提升 9%”这一块的对齐方式和设计稿不一致，要求修正。
- 已经完成了什么：根据 Figma 这块的结构，已给“提升 + 9%”补了一层 `.sop-improve-copy` 文字分组，让文字自身按基线对齐，右侧 GIF 图标则保持独立居中，不再和文案共用同一层对齐逻辑；同时给 `.sop-improve` 补了 `justify-content:center`，让整组位置更接近设计稿。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `#sop-national-diff` 内部已改成 `sop-improve-copy + img` 结构，`.sop-improve-copy` 已使用 `display:inline-flex + align-items:baseline`；门店看板独立入口资源版本号已更新到 `20260520213000`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前只修了“提升 9%”这一组自己的对齐；如果用户下一轮仍觉得位置有偏差，下一步应继续只微调这组的 `gap`、GIF 实际显示尺寸和相对基线。

## 2026-05-20 门店质检合格率与大区质检合格率卡排版对齐 Figma
- 用户想做什么：指出“门店质检合格率 / 大区质检合格率 / 提升 9%”这一排的排版和 Figma 设计稿不一致，要求修正。
- 已经完成了什么：根据之前从 Figma 节点 `272:120` 读取到的结构，已将两张合格率卡从当前的“左标签 + 右数值”撑开布局，改回 Figma 里的“卡内内容居中、按基线排一排”的结构；同时把两张卡的内边距、蓝/红边框透明度、底色写法、标签颜色、数值字重与 `环比 +3% / 提升 9%` 的字体粗细一并收回到设计稿方向。右侧“大区卡 + 提升值”这组也同步改成基线对齐。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.sop-metric-card` 已改为 `align-items:baseline + justify-content:center`，`.sop-metric-score-wrap` 不再使用 `margin-left:auto`，`.sop-metric-cluster` 已改为 `align-items:baseline`；门店看板独立入口资源版本号已更新到 `20260520211500`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前主要修的是排版结构和视觉参数方向；如果用户刷新后仍觉得和 Figma 有 1-2px 差异，下一步应继续只微调这排的卡内 gap、VS 与右侧提升区的距离、以及 GIF 箭头的视觉占位。

## 2026-05-20 门店看板提升箭头移除 CSS 动效并替换为本地 GIF
- 用户想做什么：要求去掉“提升 9%”右侧 icon 的 CSS 动效，并将 icon 替换成 `/Users/linxianxin/Downloads/system-solid-160-trending-up-hover-trend-up.gif`，同时把对应文件存到项目路径中。
- 已经完成了什么：已将该 GIF 复制到项目资源目录，命名为 `assets/store-overview-arrow-up-hover.gif`；门店看板 `质检概览` 中“提升 9%”右侧图片引用已改成这个 GIF；之前为上涨箭头补的 `.sop-improve.up .sop-improve-arrow-image` 动画和 `@keyframes sopArrowGrowUp` 已全部移除，不再叠加 CSS 动效，页面只显示 GIF 自身的动态效果。
- 改动了哪些文件：`assets/store-overview-arrow-up-hover.gif`、`store-dashboard/index.html`、`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 GIF 已复制进项目目录；`store-dashboard/index.html` 已从 `store-overview-arrow-up.png` 切换到 `store-overview-arrow-up-hover.gif`；`app-inline.css` 中上涨箭头动画选择器和 `sopArrowGrowUp` 已移除；门店看板独立入口资源版本号已更新到 `20260520205000`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前只替换了上涨态箭头；如果后续还要兼顾下降态图标表现，需要再决定是否继续保留 `.down` 的旋转逻辑，还是单独给下降态也换成另一张资源。

## 2026-05-20 门店看板短板改善与风险管控内容改为左上对齐
- 用户想做什么：指出“短板改善”和“风险管控”两张卡里的内容没有左上对齐，要求修正。
- 已经完成了什么：定位到这两张卡的卡头 `.summary-item-head` 还带着 `flex:1 0 0`，会把头部撑高，导致正文被往下推；现已只针对 `#sop-summary-weakness` 和 `#sop-summary-risk` 两张卡取消卡头拉伸，并把正文节点固定为正常块级流式排布，让标题和正文都回到左上自然对齐。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `#sop-summary-weakness .summary-item-head` 和 `#sop-summary-risk .summary-item-head` 已改为 `flex:none`，对应正文也已改为 `display:block;width:100%`；门店看板独立入口资源版本号已更新到 `20260520203500`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前只修了这两张卡的左上对齐，没有去动“优势发掘”这张卡；如果用户下一轮要求三张卡统一完全同一基线，再一起微调头部高度和正文起始线。

## 2026-05-20 门店看板三张总结卡按 Figma 节点 272:120 重下 icon 并改回顶部描边卡
- 用户想做什么：指出三张总结卡“完全跟设计稿不一样”，要求严格按 Figma `Untitled` 文件节点 `272:120` 调整，并重新下载替换 icon，同时修正填充和描边。
- 已经完成了什么：通过 Figma MCP 读取了节点 `272:120` 的结构和截图，确认设计稿里的 Summary Cards 不是“整卡浅底”也不是“左侧彩条”，而是白底卡面、统一灰描边、顶部 2px 绿色/橙色/红色强调线；三个 icon 也已按 Figma 提供的 SVG 资源重新下载并覆盖项目现有 `store-summary-strength.svg / store-summary-weakness.svg / store-summary-risk.svg`。样式层已同步调整为：卡间距 12px、卡高 110px、`14px/20px` 标题与正文、绿色/橙色/粉红色圆形 icon 底、风险 icon 单独按 16px 呈现。
- 改动了哪些文件：`assets/store-summary-strength.svg`、`assets/store-summary-weakness.svg`、`assets/store-summary-risk.svg`、`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认三张 icon 资源已重新覆盖；`.summary-item` 已改成白底 `#FFFFFF`、统一边框 `#E2E8F0`、顶部 `2px` 彩色描边，风险 icon 已单独使用 `16px`；门店看板独立入口资源版本号已更新到 `20260520202000`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前已经回到 Figma 这组卡的正确方向，但还没有做浏览器截图级验收；如果用户刷新后仍觉得有偏差，下一步应继续只微调这三张卡的顶部描边粗细、icon 壳层尺寸和正文换行宽度。

## 2026-05-20 门店看板三张总结卡收回设计稿方向的整卡样式
- 用户想做什么：指出“优势发掘 / 短板改善 / 风险管控”三张总结卡当前并不是设计稿里的样子，要求严格按设计稿调整。
- 已经完成了什么：回看交接记录后确认当前页面命中的是后面一次“恢复白底左彩条”的覆盖样式，不是之前按新版方向收的那套；现已仅调整这三张卡的视觉层，去掉左侧彩色强调线，改回整卡轻底色 + 细描边 + 圆角卡面的呈现方式，并保留用户已确认过的三个正式 SVG 图标；同时按三张卡类型分别保留绿色 / 橙色 / 红色的轻量区分，避免三张卡完全失去层级。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.summary-item::before` 已禁用，不再渲染左侧彩条；三张卡已改成整卡背景和描边写法；门店看板独立入口资源版本号已更新到 `20260520195500`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前先修的是最明显的视觉方向错误，让它从“白底左彩条”回到更接近设计稿的卡面风格；如果用户刷新后仍觉得和 Figma 还有差距，下一步应继续只微调这三张卡的底色强度、圆角、内边距和标题正文间距。

## 2026-05-20 门店看板质检概览上涨箭头加入向上生长动画
- 用户想做什么：希望 `质检概览` 右侧“提升 9%”旁边的绿色箭头加入向上生长的动画。
- 已经完成了什么：在 `sop-improve` 这组样式中，仅给上涨态 `.sop-improve.up .sop-improve-arrow-image` 增加了循环动效，表现为箭头以底部为锚点轻微向上伸长并上浮，再回到稳态；下降态箭头保持原有旋转逻辑，不加这套动画。同时补了 `prefers-reduced-motion` 兜底，系统偏好减少动态效果时会自动关闭这段动画。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `sopArrowGrowUp` 动画和上涨态选择器都已写入样式；门店看板独立入口资源版本号已更新到 `20260520192500`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前动效是轻量循环版，优先保证不会太跳。如果用户刷新后觉得节奏偏快、位移偏小，下一步只需要继续微调这一个 keyframes 的幅度和时长。

## 2026-05-20 门店看板质检概览顶部指标行补断点和自适应
- 用户想做什么：指出“门店质检合格率 / VS / 大区质检合格率 / 提升 9%”这一排在屏幕缩小时会出现重叠，要求补断点和自适应。
- 已经完成了什么：定位到问题根因是这排仍使用接近 Figma 原尺寸的固定三列网格，在门店看板双列布局的左侧列中空间不足；现已补两层响应式处理：在 `1101px-1320px` 的中等宽度下，把这排切成纵向堆叠并隐藏中间 `VS`，避免继续硬挤一行；在 `760px` 以下再进一步让右侧卡片和“提升”信息分两行、收紧 padding 和字号，兜住更窄宽度下的内部挤压。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/page.js`、`store-dashboard/page.css`、`store-dashboard/index.html`、`handoff-log.md`。
- 做过哪些验证：静态检查确认新增了两段断点样式；门店看板独立入口资源版本号已更新到 `20260520190500`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前优先解决的是重叠和可用性，没有继续对中等宽度下的行间距做像素级微调；如果用户刷新后仍觉得断点切换时不够像 Figma，可继续只微调这一排的 `gap / padding / 字号`，不需要再改结构。

## 2026-05-20 按 Figma 大改版重做门店看板质检概览
- 用户想做什么：用户在 Figma 文件 `Untitled` 里对“质检概览”做了较大改版，要求本地门店看板严格按 Figma 新版调整，不再沿用旧的圆环 + `VS大区` 单块信息结构。
- 已经完成了什么：读取 Figma 最新节点 `门店看板 - 质检概览` 的截图和结构后，已把本地 `store-dashboard` 中这块改成新版结构：顶部改为“门店质检合格率卡片 + VS + 大区质检合格率卡片 + 提升值”，下方保留整条 tip，三张总结卡改成新版的圆形浅底 icon 头部样式；同时把 `app-runtime.js` 的文案写入逻辑同步改成新版口径，例如 `环比 +3%`、`提升 9% ↑` 这套写法。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`app-runtime.js`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：已执行 `node --check app-runtime.js` 语法检查通过；已重新读取 Figma 最新截图和节点尺寸，确认新版目标不是旧圆环结构；已同步抬高门店看板独立入口版本号到 `20260520172000`，避免预览继续吃旧缓存。
- 还有哪些待办或风险：当前未能在本地自动产出浏览器截图，因为当前环境没有 Playwright 模块；如果用户刷新页面后仍看到旧样式，优先检查是否打开的是 `http://127.0.0.1:4192/store-dashboard/index.html?route=dashboard` 以及是否命中了新版本资源链。

## 2026-05-20 门店看板质检概览顶部改用 Figma 导出图形资源
- 用户想做什么：指出顶部这排“门店质检合格率 / VS / 大区质检合格率 / 提升 9%”与 Figma 设计稿仍不一致，要求图片和 icon 直接使用 Figma 文件里的资源并下载到项目路径中。
- 已经完成了什么：从 Figma 当前 `质检概览` 顶部行导出了 3 个资源并落到项目 `assets` 目录：中间 `VS` 图形、右侧上升箭头、提示条左侧 tip icon；页面实现已改为直接引用这 3 个 PNG，不再用 CSS 文字拼出 `VS` 和箭头，也不再复用旧的 `sales-local-complete-icon.svg`；同时把提示条的垂直对齐收口到更接近 Figma。
- 改动了哪些文件：`assets/store-overview-vs.png`、`assets/store-overview-arrow-up.png`、`assets/store-overview-tip-icon.png`、`store-dashboard/index.html`、`app-inline.css`、`app-runtime.js`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：确认 3 个新资源文件已生成到项目目录；`node --check app-runtime.js` 通过；静态检查确认 `index.html` 已引用新的 `store-overview-vs.png / store-overview-arrow-up.png / store-overview-tip-icon.png`，并再次抬高版本号到 `20260520175000`。
- 还有哪些待办或风险：当前 `VS`、箭头、tip icon 已切成 Figma 导出资源，但这排左右间距和卡片内部文字位置是否还需做 1-2px 级修正，仍建议用户刷新后按截图继续给批注。

## 2026-05-20 门店看板提示条 icon 改回灯泡图标
- 用户想做什么：认为 `质检概览` 提示条左侧 icon 不该使用刚导出的 Figma tip icon，要求改回之前那个灯泡 icon。
- 已经完成了什么：将 `#sop-ai-summary` 左侧图标从 `store-overview-tip-icon.png` 改回 `sales-local-complete-icon.svg`，其余顶部结构、VS 图形、提升箭头和提示条样式保持不变；同时把门店看板独立入口版本号更新到 `20260520180500`。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认提示条 `img.hint-icon` 已重新引用 `sales-local-complete-icon.svg`，门店看板资源版本号也已同步更新。
- 还有哪些待办或风险：当前只回退了提示条 icon 本身，没有继续改动提示条内边距和文案位置；如果用户接下来还觉得这条提示离 Figma 有偏差，需要继续微调这一整行的对齐。

## 2026-05-20 门店质检合格率卡片适配问题修正
- 用户想做什么：指出顶部左侧“门店质检合格率 82%”卡片适配有问题，并要求右侧“大区质检合格率”一起同步调整好。
- 已经完成了什么：定位到根因是左侧指标卡仍残留旧的 `.sop-dial` 类，继续吃到上一版圆环样式里的 `160x160` 固定尺寸，导致整排布局被挤坏；现已移除这个旧类，并把运行时 `aria-label` 绑定改到新的 `.sop-metric-card-store` 上，同时给左右指标容器补了 `min-width:0`，避免继续被旧宽度规则撑坏。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`app-runtime.js`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认左侧卡片已不再带 `.sop-dial`；`app-runtime.js` 语法检查通过；门店看板独立入口版本号已更新到 `20260520183500`。
- 还有哪些待办或风险：当前修的是导致适配异常的主要根因；如果用户刷新后仍觉得左右两块和 Figma 在细节上还有偏差，下一步应继续微调这一排的 gap、padding 和文字间距，而不是再回头改结构。

## 2026-05-20 门店看板“VS大区 73% +9%”合并为单块信息卡
- 用户想做什么：将门店看板“质检概览”右侧原本分开的 `大区质检合格率 73%` 和 `vs大区 +9%` 两块，合并成一个信息块，内容为 `VS大区 73% +9%`，并指定字号和颜色：`VS大区` 14px 主题色、`73` 26px、`%` 14px 主题色、`+9%` 14px 绿色。
- 已经完成了什么：把 `store-dashboard/index.html` 里这块结构改成单个 `.sop-zone-compare` 容器，内部拆成 `VS大区 / 73 / % / +9%` 四段；对应样式在 `app-inline.css` 中重写为一体化信息块；同时把 `app-runtime.js` 更新逻辑从写入 `73%` 改成只写入 `73`，避免和独立 `%` 节点冲突。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`app-runtime.js`、`handoff-log.md`。
- 做过哪些验证：静态检查确认这块已不再使用旧的 `.sop-compare + .sop-national-diff` 双块结构；`app-runtime.js` 只更新数值节点，不会把 `%` 再拼回去；`+9%` 的 up/down 颜色逻辑仍由原有 class 控制。
- 还有哪些待办或风险：当前只完成单块合并和指定字号颜色；如果后续你要求这个信息块与下面 tip 或其它摘要块左右对齐再更紧一点，下一步应继续微调容器内 gap 和 padding，而不是再改结构。

## 2026-05-20 门店看板右侧预览未刷新根因排查并强制抬版本号
- 用户想做什么：排查为什么 Codex 右侧预览刷新后拿不到门店看板最新页面，而直接打开本地 `index.html` 能看到最新改动。
- 已经完成了什么：定位到门店看板独立预览入口还停在旧资源版本 `20260519135500`，导致 `page.css / page.js / app-inline.css / app-runtime.js` 整条缓存链继续复用旧资源；已统一将 `store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css` 中的版本号抬到 `20260520103000`，强制让右侧预览重新加载最新资源。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认门店看板入口层和其下游 runtime/style 引用都已经换成新版本号；旧问题不是页面文件没保存，而是独立预览入口没有同步抬版本。
- 还有哪些待办或风险：以后只要继续通过 `store-dashboard/index.html` 这条独立入口预览，每轮改完门店看板样式或脚本后，都需要顺手抬一次入口版本号，否则 Codex 右侧预览仍可能继续吃旧缓存。

## 2026-05-20 门店看板 SOP AI 摘要严格对齐 tips 规范
- 用户想做什么：要求门店看板“质检概览”里的 `SOP执行平平稳...` 摘要严格按现有 tip 规范来，包括 icon 和虚线描边，不接受只改成普通浅蓝说明块。
- 已经完成了什么：将 `#sop-ai-summary` 从纯文本节点改成 tip 结构，补上前置 icon（复用 `sales-local-complete-icon.svg`），并把样式收成统一 tip 视觉：`12x16` 内边距、虚线细边框、浅蓝背景、16px 圆角、13px 文案层级、icon 顶对齐；去掉了上一版那种实线描边和普通说明条写法。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 store 门店看板的 `sop-ai-summary` 已从纯文本改为 `img + span` 结构，且只命中该提示块，不影响销售看板 `local-complete-hint`、门店其它 summary card 或圆环区域。
- 还有哪些待办或风险：当前已对齐到同一套 tip 结构和虚线边框。如果后续你还要求“同一套 tip 必须共用同一个 class 名”，可以再抽成公共类，但这一步会扩大影响面，当前先保持局部复用最稳。

## 2026-05-20 门店看板 SOP AI 摘要改为统一 tips 组件样式
- 用户想做什么：把门店看板“质检概览”里 `SOP执行平平稳，竞品对比、试驾邀约仍是需要优先改善的SOP短板项` 这条 AI 摘要，改成项目里已经封装好的 tips 组件风格。
- 已经完成了什么：将 `.store-dashboard-page .sop-ai-summary` 从原来的浅蓝底 + 左侧强调线，改成和现有 tips 规范一致的提示块样式：统一 12x16 内边距、实线细边框、浅蓝渐变背景、16px 圆角、13px 提示文案层级和统一文字颜色；保留原文案和所在位置，不改周围布局。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认只命中门店看板 `.sop-ai-summary`，没有影响销售看板 tips、工厂看板 timeline tip 或门店摘要卡片其它模块。
- 还有哪些待办或风险：当前只统一了这条文字提示块本身；如果后续你希望它和其它 tips 一样带前置 icon，还需要再补一层结构，不建议在这次顺手一起加。

## 2026-05-20 门店看板质检概览圆环标签“质检合格率”改为 14px
- 用户想做什么：把门店看板“质检概览”圆环中间数值下方那行“质检合格率”的字号改成 `14px`。
- 已经完成了什么：仅调整 `.store-dashboard-page .sop-overview-track .dial-lbl` 的字号，从 `12px` 改为 `14px`，不改圆环尺寸、线宽、数值字号和其它标签。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认仅命中门店看板质检概览圆环标签选择器，没有影响销售看板录音复盘、门店其它 KPI 卡片或圆环中心数值。
- 还有哪些待办或风险：当前只改了标签字号；如果后续你觉得这行文字位置偏低或和上方数值间距不顺，下一步应继续调 `gap` 或基线，不需要再改字号。

## 2026-05-19 销售看板“本地完成标记”提示条收成标准 tips 样式
- 用户想做什么：把销售看板推荐清单上方“本地完成标记：勾选仅标记今日本地处理状态，不与上游系统同步，仅影响当前清单排序”这块说明，改成更统一的 tips 规范样式。
- 已经完成了什么：仅调整销售看板 `.local-complete-hint` 的样式，把原来的虚线说明条改成标准 info tip 视觉：统一内边距、实线边框、浅蓝背景、16px 圆角、13px 正文层级，并收紧 icon 和文案对齐方式；没有改动推荐清单卡片结构和筛选区。
- 改动了哪些文件：`voice-qc-admin.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认只命中 `.sales-role-dashboard-page .local-complete-hint` 及其子元素，没有影响门店看板和其他卡片提示区。
- 还有哪些待办或风险：当前只完成这一个提示条。如果后续要把项目里其他说明条统一成同一套 tips 组件，还需要继续梳理复用范围。

## 2026-05-19 门店看板质检概览圆环中心数值字号调整
- 用户想做什么：将门店看板“质检概览”圆环中间主数值改为 `26px`，百分号改为 `14px`。
- 已经完成了什么：仅调整了 `.sop-overview-track .dial-val` 以及其内部 `%` 的字号，主值改为 `26px`，百分号改为 `14px`，没有改动圆环大小、线宽和其它文案。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认这次只命中门店看板质检概览圆环中心数值相关选择器，没有影响销售看板录音复盘圆环或其他 KPI 数值。
- 还有哪些待办或风险：当前只回调了字号；如果后续觉得 `%` 的位置还不顺，下一步应继续调基线对齐和 `margin-left`，不需要再改字号。

## 2026-05-19 门店看板预览未更新的根因排查与强制换版本
- 用户想做什么：排查为什么 Codex 右侧本地预览刷新后还是旧页面，而直接从项目 `index.html` 打开能看到最新页面。
- 已经完成了什么：定位到门店看板这页的缓存根因是 `store-dashboard/page.js`、`store-dashboard/page.css` 和 `store-dashboard/index.html` 里的版本号一直停留在旧值 `20260518101740`，导致右侧预览持续复用旧的 `app-inline.css / app-runtime.js`；已统一将版本号抬到 `20260519135500`，强制重新拉取最新资源。
- 改动了哪些文件：`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`、`handoff-log.md`。
- 做过哪些验证：确认 localhost 服务返回的是当前工作区目录文件；检查 `page.js / page.css` 里引用的资源版本号，已更新为新值；这次问题不是服务目录错了，而是缓存版本链没有更新。
- 还有哪些待办或风险：只要后续继续通过这套独立页面入口预览，每次做完较大样式/脚本改动后仍建议同步抬版本号，否则 Codex 右侧预览仍有机会吃旧缓存。

## 2026-05-19 门店看板质检概览圆环线宽收细
- 用户想做什么：觉得门店看板“质检概览”的环形进度条太粗，希望改细一些。
- 已经完成了什么：只调整了 `.sop-overview-track` 这一个圆环的进度线和底轨线宽，从上一版的 `14` 收回到 `11`，不改外层大小、不改数字比例、不改动画逻辑。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认仅命中门店看板质检概览圆环的 `stroke-width`，没有改动销售看板录音复盘那套环形样式。
- 还有哪些待办或风险：当前只是收细线宽；如果后续还觉得重，下一步应继续调内圈留白和外环颜色强度，而不是再大幅缩数字。

## 2026-05-19 门店看板质检概览圆环样式对齐销售看板录音复盘
- 用户想做什么：把门店看板“质检概览”里的环形进度样式，对齐销售看板“录音复盘”的环形进度视觉，但整体尺寸保持不变。
- 已经完成了什么：保留门店看板当前 `160px` 圆环尺寸不变，只调整了圆环线宽、内圈大小、中心数字和百分号字号、标签字号，让它的视觉比例和销售看板录音复盘那套更接近。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认仅命中 `.sop-overview-track` 这套圆环选择器，没有改动销售看板录音复盘原始样式；圆环起始方向仍保持顶部，不影响当前进度动画逻辑。
- 还有哪些待办或风险：当前做的是样式比例对齐，没有把 SVG 结构从 `circle` 改成销售看板那种 `path` 画法；如果后续你要求像素级完全一致，还需要再同步底层绘制方式。

## 2026-05-19 门店录音弹窗筛选字段下拉改成车系同款自定义菜单
- 用户想做什么：把门店录音弹窗左侧“按销售姓名 / 按客户姓名 / 按录音ID”的下拉选项样式，对齐门店看板“车系”下拉的选项面板样式。
- 已经完成了什么：将原生 `select` 替换成自定义下拉菜单，复用 `session-menu-panel / session-menu-option` 这一套结构；选项面板、hover、active、圆角、阴影、内边距都改成和车系下拉同一套视觉规范，同时保留原有筛选逻辑和输入框联动。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：已执行 `node --check app-runtime.js`；静态检查确认门店录音弹窗已不再使用原生 `select`，改成自定义 trigger + panel 结构。
- 还有哪些待办或风险：当前这次只统一了门店录音弹窗这一套下拉；销售看板录音弹窗还保留原生 `select`，如果后续也要求一致，需要再同步另一套模板。

## 2026-05-19 门店录音弹窗去掉“加载更多”底部占位
- 用户想做什么：去掉门店录音弹窗底部的“加载更多”区域，避免无意义地把弹窗高度撑高。
- 已经完成了什么：直接移除了 store 门店录音弹窗模板里的 `recording-library-footer` 和 `issue-recording-library-more` 按钮节点，同时把列表渲染逻辑改成在没有该按钮节点时也能正常工作，不再依赖这个 DOM。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：已执行 `node --check app-runtime.js` 语法检查；静态检查确认 store 门店录音弹窗模板中不再包含 footer 节点，对应 store 专属 footer 样式也已删除。
- 还有哪些待办或风险：当前只去掉了门店录音弹窗这套底部占位，没有动销售看板那套录音弹窗；如果后续两套弹窗要完全统一，还需要再看另一套模板。

## 2026-05-19 门店录音弹窗筛选区外层容器去掉投影
- 用户想做什么：去掉门店录音弹窗筛选区这一整层外容器的投影。
- 已经完成了什么：将 `.store-recording-library-overlay .recording-library-tools` 的 `box-shadow` 去掉，只保留边框、圆角和背景；内部两个筛选框自身样式未动。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认外层筛选容器已改成 `box-shadow:none`。
- 还有哪些待办或风险：当前只去掉了外层容器投影，内部主筛选框和日期框仍保留各自轻投影；如果你后续要整块都更平，还需要继续统一收掉内层控件投影。

## 2026-05-19 门店录音列表卡片悬停联动右箭头变主题色
- 用户想做什么：悬停整张录音卡片时，右侧箭头也要变成主题色，而不是只有悬停到箭头本身才变色。
- 已经完成了什么：补上了 `.recording-library-row:hover .recording-library-detail` 规则，卡片 hover 时会联动把右箭头切成主题蓝色。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 store 门店录音弹窗列表已增加卡片 hover 联动到右箭头颜色的规则。
- 还有哪些待办或风险：当前只加了颜色联动，没有额外加位移或过渡时长微调；如果后续你希望 hover 更有反馈感，可以继续补箭头轻微右移。

## 2026-05-19 门店录音列表右箭头去掉外容器感
- 用户想做什么：把门店录音弹窗列表项右侧箭头改成纯箭头，不要外容器；悬停时箭头本身变成主题色。
- 已经完成了什么：移除了右箭头按钮的宽高盒子、边框、圆角和背景，仅保留透明点击区域和箭头图标；悬停时不再变背景，只把箭头颜色切到主题蓝。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.store-recording-library-overlay .recording-library-detail` 已去掉 `border/background/radius`，hover 态只保留 `color:#2563EB`。
- 还有哪些待办或风险：当前保留的是按钮可点击区域但视觉上没有容器；如果后续你觉得点击热区太小，需要继续补“无背景但更大点击区”的细节。

## 2026-05-19 门店录音列表前置图标替换为用户提供的 SVG
- 用户想做什么：把门店录音弹窗列表项前面的默认播放三角 icon，替换成用户提供路径 `/Users/linxianxin/Downloads/录音.svg` 下的 SVG，并调整成主题色。
- 已经完成了什么：将门店录音列表项左侧图标替换为该 SVG 的路径数据，并把两段 `path` 统一改成 `fill=\"currentColor\"`，让它跟随现有主题蓝色显示。
- 改动了哪些文件：`app-runtime.js`、`handoff-log.md`。
- 做过哪些验证：静态检查确认门店录音列表行 `.recording-library-play` 内的原三角播放 SVG 已被新 SVG 替换，颜色由 `currentColor` 驱动。
- 还有哪些待办或风险：当前只替换了 store 门店录音弹窗这套列表项图标，没有同步销售看板录音弹窗；如果后续希望两套弹窗统一，也需要同步替换另一套列表模板。

## 2026-05-19 门店录音弹窗关闭按钮图标居中
- 用户想做什么：修复门店录音弹窗右上角关闭按钮里的 `×` 没有居中的问题。
- 已经完成了什么：给关闭按钮补上 `inline-flex` 居中布局、固定 `line-height:1` 和圆形按钮的完整圆角定义，让 `×` 按钮在圆心内居中显示。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.store-recording-library-overlay .recording-library-close` 已增加 `display:inline-flex`、`align-items:center`、`justify-content:center` 和 `line-height:1`。
- 还有哪些待办或风险：当前只修了 store 门店录音弹窗这颗关闭按钮；如果销售看板录音弹窗后续也出现同样问题，需要同步检查它是否吃到同一套通用规则。

## 2026-05-19 门店录音弹窗头部背景补上与弹窗一致的上圆角
- 用户想做什么：修复门店录音弹窗头部浅色填充超出弹窗范围的问题，希望头部上圆角和弹窗一致。
- 已经完成了什么：给门店录音弹窗头部 `.recording-library-head` 补上 `24px` 的左右上圆角，并让头部自身裁剪背景填充，避免浅色背景超过弹窗外轮廓。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认头部已增加 `border-top-left-radius`、`border-top-right-radius` 和 `overflow:hidden`。
- 还有哪些待办或风险：当前只修了头部背景溢出；如果后续还发现底部或其他局部背景也有类似超边界问题，需要继续按区域分别加局部裁剪，而不是再把整个弹窗改回 `overflow:hidden`。

## 2026-05-19 门店录音弹窗日期面板去掉内部滚动条
- 用户想做什么：日期选择面板不要出现内部滚动条。
- 已经完成了什么：移除了门店录音弹窗日期面板的最大高度限制和内部 `overflow:auto`，改成自然展开显示，不再出现面板自身滚动条。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.store-recording-library-overlay .recording-library-date-control .session-menu-panel-date` 已改成 `max-height:none` 和 `overflow:visible`。
- 还有哪些待办或风险：当前依赖前一轮已经放开的弹窗容器裁剪；如果后续窗口高度极端偏小，日期面板可能会更靠近视口底部，需要再做碰撞定位处理。

## 2026-05-19 门店录音弹窗筛选框文案字号统一到 14px
- 用户想做什么：把门店录音弹窗筛选区这组文案字号统一改成 14px。
- 已经完成了什么：把主筛选输入框文字和日期选择器当前值文案统一调整为 14px，保持这组筛选控件内部字号一致。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.recording-library-search input` 和 `.recording-library-date-control .session-date-trigger strong` 已改成 `font-size: 14px`。
- 还有哪些待办或风险：这次只调了筛选区主要文案字号，没有继续改 placeholder、日期面板内部或结果列表的字号；如果后续要做到整块筛选区完全同级统一，还需要继续补齐占位符和下拉菜单字体。

## 2026-05-19 门店录音弹窗解除日期面板被弹窗容器裁剪
- 用户想做什么：修复日期选择面板被整个弹窗截断、显示不全的问题。
- 已经完成了什么：把门店录音弹窗主容器 `.issue-recording-library-page` 在当前场景下改为 `overflow: visible`，让日期面板可以超出弹窗主体边界完整显示，不再被弹窗自身裁掉。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `store-recording-library-overlay` 下的 `.issue-recording-library-page` 已显式改成 `overflow: visible`，不再继承通用录音弹窗的裁剪行为。
- 还有哪些待办或风险：当前是最小修改，只解决日期面板被弹窗容器裁剪；如果后续发现弹窗圆角区域因为 `overflow: visible` 带来其他视觉副作用，还需要把裁剪责任下沉到具体列表区而不是整个弹窗容器。

## 2026-05-19 门店录音弹窗日期面板缩小并限制出屏
- 用户想做什么：修复门店录音弹窗里日期选择面板的遮挡和超出屏幕问题。
- 已经完成了什么：把日期面板改成弹窗内专用的小尺寸版本，限制最大宽高并允许面板自身滚动；同时压缩了头部、月份导航和日期网格的节奏，避免原来沿用大面板尺寸导致的出屏和遮挡。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认日期面板已限制为 `344px` 内宽、`420px` 内高，并补了 `overflow:auto`；同时在较窄屏宽下补了更小的面板宽度和轻微右偏移修正。
- 还有哪些待办或风险：当前是样式层压缩和定位修正，没有做动态碰撞检测；如果你后续还遇到极端窗口尺寸下的出屏，需要继续做 JS 级别的弹层碰撞处理。

## 2026-05-19 门店录音弹窗筛选区左右平分并修复日期面板显示
- 用户想做什么：让门店录音弹窗里的主筛选框和日期选择器左右自动撑开平分宽度，并解决日期选择器点击后没有日期面板出来的问题。
- 已经完成了什么：把筛选区两列布局改成 `1fr + 1fr` 平分宽度；同时去掉日期选择器容器的 `overflow:hidden`，补上日期面板层级，避免日历弹层被裁掉。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.recording-library-filter-group` 已改为 `repeat(2, minmax(0, 1fr))`，`.recording-library-date-control` 已改为 `overflow: visible`，日期面板已补上显式 `z-index`。
- 还有哪些待办或风险：当前只修了宽度和平铺显示问题；如果刷新后日期面板位置还需要更贴边或更像录音列表原控件，还要继续微调弹层偏移和阴影。

## 2026-05-19 门店录音弹窗主筛选框按录音列表顾问号码样式收口
- 用户想做什么：让门店录音弹窗左侧主筛选框更像录音列表页“顾问号码”筛选框，要求 icon 紧跟在“按销售姓名”后面，并去掉中间分割线。
- 已经完成了什么：把主筛选框从左右分栏结构改成单一 flex 结构，移除了中间分割线；把下拉选择区改成内容自适应宽度，caret 贴到字段文案后面；右侧搜索输入区域改成直接接在后面，不再像两段拼接控件。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.recording-library-filter-control` 已从 grid 改为 flex，`.recording-library-filter-select-wrap` 不再带右侧边框，`.session-select-caret` 已贴到字段文案尾部。
- 还有哪些待办或风险：当前只收了主筛选框本体样式，没有继续改下拉菜单弹层；如果后续还要和录音列表的下拉菜单一比一，需要继续补菜单面板、hover 和 active 细节。

## 2026-05-18 门店录音弹窗日期框改成日期选择器组件
- 用户想做什么：不要日期输入框，改成真正的日期选择器组件。
- 已经完成了什么：把门店录音弹窗右侧独立日期框改成可点击的日期选择器；点击后会打开日历面板，支持切换月份、选中某一天、应用日期和清空日期；筛选逻辑也从文本模糊匹配改成按所选日期精确筛选。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过；静态检查确认日期输入框已移除，新增 `session-date-trigger`、`session-menu-panel-date`、`data-store-recording-date-*` 事件结构，且列表筛选改为使用 `dateValue` 精确匹配录音日期。
- 还有哪些待办或风险：当前是“单日选择器”，不是日期范围选择器；如果后续你要和录音列表外层的日期范围控件完全一致，还要继续补开始/结束日期双字段和快捷范围。

## 2026-05-18 门店录音弹窗把日期筛选拆成独立日期框
- 用户想做什么：把门店录音弹窗里合并筛选框中的“按日期”拆出来，单独做成后面的一个日期选择框，不再合并进主筛选框。
- 已经完成了什么：主筛选框现在只保留“按销售姓名 / 按客户姓名 / 按录音ID”；新增独立日期输入框放在右侧，日期筛选单独生效；同时把两个筛选框的边框、圆角、焦点态和间距收成同一套规范。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过；静态检查确认门店弹窗已新增 `recording-library-date-control`，主筛选框里已无 `date` 选项，且 `dateQuery` 已独立参与筛选逻辑。
- 还有哪些待办或风险：当前日期框是文本输入日期，如 `3-25`，还不是日历面板；如果后续你要和录音列表日期控件做到完全一致，还需要继续补日期弹层和日期范围逻辑。

## 2026-05-18 门店录音弹窗合并筛选框同步字体与图标
- 用户想做什么：让门店录音弹窗里合并筛选框的字号、字体和 icon 也同步到录音列表“顾问号码”那套。
- 已经完成了什么：为筛选字段区域补了自定义下拉 caret 和右侧搜索 icon；左侧下拉文字改成 14px / 500、右侧输入改成 13px / 600、placeholder 改成与录音列表一致的弱化色和字重。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过；静态检查确认门店弹窗已使用 `session-select-caret` 和 `session-search-icon`，并新增了合并框专用结构。
- 还有哪些待办或风险：这次只同步了字体与 icon，未继续抠下拉弹出菜单本身的样式；如果你后续要求连下拉菜单也和录音列表完全一致，还需要继续补菜单层样式。

## 2026-05-18 门店录音弹窗筛选控件合并成单一外框
- 用户想做什么：把门店录音弹窗里“筛选字段下拉 + 输入框”做成和录音列表“顾问号码”那种合并成一个框的样式。
- 已经完成了什么：把 `.recording-library-filter-control` 改成单一外框容器，左侧下拉和右侧输入框共用一层边框、圆角、阴影和焦点态；中间用一条细分割线区分，不再是两个独立输入框。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.recording-library-filter-control` 已具备单一外框样式，`select/input` 已去掉各自独立边框和阴影，焦点态改为容器 `:focus-within` 触发。
- 还有哪些待办或风险：这次只改了控件合并样式，未继续调整控件整体宽度和与外层容器的左右留白；如还要完全抠到录音列表一比一，需要继续微调分割线和 placeholder 颜色。

## 2026-05-18 门店录音弹窗去掉“搜索”标题
- 用户想做什么：删除门店录音弹窗筛选区上方的“搜索”标题文案。
- 已经完成了什么：已从门店录音弹窗的筛选区结构中移除“搜索”这行文案，仅保留下拉和输入框控件。
- 改动了哪些文件：`app-runtime.js`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过；全局搜索确认当前门店弹窗这处已无 `<span>搜索</span>`，剩余命中属于销售看板另一套弹窗，未受影响。
- 还有哪些待办或风险：这次只删除了标题文案，未继续调整筛选区上下留白；如删掉后需要再压缩筛选区高度，还需继续微调样式。

## 2026-05-18 门店录音弹窗筛选区样式对齐外部筛选规范
- 用户想做什么：把门店录音弹窗里的搜索筛选区，做成和外面页面筛选区同一套规范设计。
- 已经完成了什么：给弹窗筛选区补了独立容器层级，使用与外部筛选区一致的渐变底、细边框、`radius-lg` 圆角和轻阴影；同时把下拉框和输入框统一成 44px 高、16px 圆角、同一套边框和焦点态。
- 改动了哪些文件：`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认 `.store-recording-library-overlay .recording-library-tools` 已增加卡片容器样式，筛选控件已统一为外部筛选区同类节奏；本轮未改动筛选逻辑。
- 还有哪些待办或风险：这次只对齐了弹窗筛选区样式，未继续改动结果计数、列表区和弹窗整体垂直间距；如后续要求完全一比一，还需继续抠细节。

## 2026-05-18 门店录音弹窗统计卡删除底部辅助文案
- 用户想做什么：删除 `全部录音 / 涉及顾问` 两张统计卡底部的辅助说明文案，让卡片按内容自然收缩。
- 已经完成了什么：移除了两张统计卡的底部说明字段和对应渲染，只保留 icon、标题和主数值。
- 改动了哪些文件：`app-runtime.js`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过，无语法错误。
- 还有哪些待办或风险：这次只删了辅助文案，未继续调整卡片高度和搜索区位置；如删掉后视觉还需再压缩，需要继续微调卡片内边距。

## 2026-05-18 门店录音弹窗统计卡进一步对齐销售看板高质量线索卡
- 用户想做什么：把门店看板录音弹窗里的 `全部录音 / 涉及顾问` 两张统计卡，进一步统一成销售看板推荐清单里“高质量线索”那种指标卡风格，并补上对应 icon。
- 已经完成了什么：把这两张卡改成独立指标卡结构，新增左侧 icon、标签、主数值和辅助说明；视觉上改成与销售看板执行指标卡一致的浅渐变底、细描边、16px 圆角、48px 图标容器、24px 数值层级。
- 改动了哪些文件：`app-runtime.js`、`app-inline.css`、`handoff-log.md`。
- 做过哪些验证：静态检查确认已新增 `renderStoreRecordingSummaryCard()` 和对应的 `recording-library-summary-card` 样式；`node --check app-runtime.js` 通过，无语法错误。
- 还有哪些待办或风险：这次只调整了弹窗统计卡，不包含搜索栏、列表行和右侧操作按钮；如后续要求弹窗做到与销售看板推荐清单完全一比一，还需要继续统一这几块。

## 2026-05-18 门店录音弹窗统计卡修正为与销售指标卡同结构
- 用户想做什么：要求门店录音弹窗统计卡与销售看板参考卡片做到完全一致，并且 icon 要对应标题内容。
- 已经完成了什么：修正了弹窗统计卡的根因问题，把旧的 `.recording-library-summary div` 通用污染规则收窄为只作用于直系子项；统计卡内部结构改成与销售指标卡相同的 `execution-metric` 结构；`涉及顾问` 改成对应内容的多人图标，`全部录音` 保留总量型列表图标。
- 改动了哪些文件：`app-inline.css`、`app-runtime.js`、`handoff-log.md`。
- 做过哪些验证：`node --check app-runtime.js` 通过；静态检查确认统计卡已改用 `execution-metric-main / body / value / sub` 结构，且旧污染规则已收窄为 `> div`。
- 还有哪些待办或风险：本轮已修正结构和层级，但最终是否“完全一样”仍需用户从页面视觉上确认；如果还差 1-2px 级别的细节，需要继续按截图微调。

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

- 做过哪些验证：再次扫描 `/Users/linxianxin/codex/AI质检平台` 下 `.md` 文件，确认当前只剩 `voice-qc-admin-html/handoff-log.md`、`voice-qc-admin-html/handoff-archive.md`、`voice-qc-admin-vue/README.md`、`voice-qc-admin-vue/MIGRATION_PLAN.md`。
- 还有哪些待办或风险：后续验证如需导出结构或说明，应只临时使用，收尾时立即删除，不再沉淀到项目根目录。

## 2026-05-18 清理项目目录验证截图
- 用户想做什么：删除项目目录下无关截图，后续验证用截图也不要保留。
- 已经完成了什么：清理了项目根目录下此前留存的门店看板筛选区、checkbox、KPI 两排等验证截图；复查后当前工作区只剩页面正式素材图片，没有验证产物残留。
- 改动了哪些文件：删除了项目根目录下 11 张验证截图文件；未改动 `assets` 正式素材。
- 做过哪些验证：再次扫描 `/Users/linxianxin/codex/AI质检平台` 下的图片文件，确认根目录验证截图已清空，仅保留 `voice-qc-admin-html/assets` 和 `voice-qc-admin-vue/src/assets/local-assets-vue` 中的业务素材图。
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
- 用户想做什么：把 `/Users/linxianxin/Downloads/voice-qc-main` 目录文件完整替换到 `/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html`，后续统一在工作区目录预览和改动。
- 已经完成了什么：执行整目录覆盖同步，保留目标目录路径不变。
- 改动了哪些文件：`voice-qc-admin-html` 目录整体内容。
- 做过哪些验证：`diff -qr /Users/linxianxin/Downloads/voice-qc-main /Users/linxianxin/codex/AI质检平台/voice-qc-admin-html` 无输出，两个目录当前完全一致。
- 还有哪些待办或风险：后续应只维护工作区目录，避免与 Downloads 副本再次分叉。

## 2026-05-15 门店看板 tab 位置与样式调整
## 2026-05-18 备份同步并准备分支提交
- 用户想做什么：把 `/Users/linxianxin/Downloads/voice-qc-admin-html` 里的备份文件同步回当前 GitHub 克隆仓库，并作为新分支提交。
- 已经完成了什么：已将备份目录内容覆盖同步回 `/Users/linxianxin/codex/AI质检平台/voice-qc-admin-html`；已在仓库内创建分支 `codex/sync-backup-20260518`；已清理仓库内 `.DS_Store`。
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

## 2026-05-20 门店看板质检概览三张总结卡改成“跟进建议”风格
- 用户想做什么：把“优势发掘 / 短板改善 / 风险管控”三张卡的样式改成销售看板“跟进建议”那种提示卡风格，先统一用“跟进建议”的 icon 占位，后续再单独替换三个正式 icon。
- 已经完成了什么：重写三张卡片结构，补上 `summary-item-head + summary-item-icon`；统一使用 `sales-followup-icon.svg` 作为占位 icon；把三张卡收成和销售看板跟进建议一致的浅蓝渐变、细边框、12px 圆角、14px 标题与正文节奏；去掉原来 success/warning/danger 的左侧色条感。
- 改动了哪些文件：`store-dashboard/index.html`、`app-inline.css`。
- 做过哪些验证：静态检查确认三张卡已经是 `icon + 标题 + 正文` 结构；样式只命中门店看板 `sop-overview-track` 区块；同时把门店看板独立预览版本号从 `20260520103000` 更新到 `20260520112000`，避免右侧预览继续读旧缓存。
- 还有哪些待办或风险：当前三个 icon 还是同一个占位图标；等用户提供三个正式 icon 后，需要再替换资源路径并按图标视觉尺寸微调。

## 2026-05-20 门店看板三张总结卡替换正式 SVG 图标
- 用户想做什么：把“优势发掘 / 短板改善 / 风险管控”三张卡当前的占位 icon，替换成用户放在 `/Users/linxianxin/Downloads` 下的三个对应 SVG，并把 SVG 复制进项目目录。
- 已经完成了什么：已将 `/Users/linxianxin/Downloads/优势发掘.svg`、`短板改善.svg`、`风险管控.svg` 复制到项目 `assets` 目录，分别命名为 `store-summary-strength.svg`、`store-summary-weakness.svg`、`store-summary-risk.svg`；门店看板三张总结卡的 icon 引用已按命名对应替换；同时把门店看板独立预览版本号更新到 `20260520113500`。
- 改动了哪些文件：`assets/store-summary-strength.svg`、`assets/store-summary-weakness.svg`、`assets/store-summary-risk.svg`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：静态检查确认三张卡已分别引用新的 SVG 路径；版本链已同步更新，避免右侧预览继续读取旧资源缓存。
- 还有哪些待办或风险：当前只做了资源替换，尚未针对三个新 SVG 的实际视觉重心做单独微调；如果后续出现某个图标看起来偏大、偏上或偏左，需要再针对 `summary-item-icon` 做细调。

## 2026-05-20 门店看板三张总结卡 icon 调整到 20px
- 用户想做什么：把“优势发掘 / 短板改善 / 风险管控”三张卡的 icon 统一改成 20px。
- 已经完成了什么：已将 `.summary-item-icon` 从 16px 调整为 20px，同时同步把门店看板预览版本号更新到 `20260520114500`，避免右侧预览继续显示旧尺寸。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：静态检查确认 `summary-item-icon` 已变为 `width/height/flex-basis = 20px`；版本链已同步更新。
- 还有哪些待办或风险：如果图标放大后出现视觉重心偏移，下一步需要只微调 `summary-item-head` 的对齐和 gap，不需要再改结构。

## 2026-05-20 门店看板业务场景删除“全部”功能
- 用户想做什么：删除门店看板顶部“业务场景”里的“全部”功能，不再显示“全部”按钮，也不再保留全选/半选那套交互。
- 已经完成了什么：从 `store-dashboard/index.html` 里移除了“全部”按钮；把业务场景默认状态改成五个场景全部独立选中；同步修改筛选工具逻辑，去掉“全选/半选”返回值和 UI 同步逻辑；点击场景时只按单个场景增删，不再回退成一个隐藏的“全部”状态。
- 改动了哪些文件：`store-dashboard/index.html`、`dashboard-filter-utils.js`、`app-runtime.js`、`tests/dashboard-filter-utils.test.js`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：`node --test tests/dashboard-filter-utils.test.js` 共 16 条全部通过；代码搜索确认 `store-dashboard/index.html` 与 `app-runtime.js` 中已无 `data-scene="all"`、`is-indeterminate`、`aria-checked="mixed"` 残留；门店看板预览版本号更新到 `20260520120500`，避免右侧预览继续读旧缓存。
- 还有哪些待办或风险：当前仍保留 `SCENE_KEYS.all` 作为数据层兼容值，用于已有汇总语义和旧逻辑兜底，但 UI 层已经不再暴露“全部”按钮；如果后续要彻底从数据层删除 `all`，需要再统一检查工厂看板和旧 DOM 副本。

## 2026-05-20 门店看板业务场景“全部”误改回退
- 用户想做什么：上一次把“全部”功能删得太重了；这次要求恢复原有逻辑，只隐藏“全部”选项本身，同时增加限制：业务场景至少保留一个，不能全部不选。
- 已经完成了什么：恢复 `SCENE_KEYS.all` 对应的默认值和切换逻辑；恢复场景同步里的全选/半选语义，但把“全部”按钮本身改成隐藏；点击场景时增加兜底，如果会导致一个都不选，则忽略本次点击；门店看板预览版本号同步更新到 `20260520123000`。
- 改动了哪些文件：`store-dashboard/index.html`、`dashboard-filter-utils.js`、`app-runtime.js`、`tests/dashboard-filter-utils.test.js`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：准备执行 `node --test tests/dashboard-filter-utils.test.js`；静态检查确认“全部”按钮已回到 DOM 且带 `is-hidden`，点击逻辑已拦截空选择。
- 还有哪些待办或风险：需要再看一眼页面交互，确认切换数据来源后隐藏的“全部”不会引起视觉抖动；底层仍保留 `all` 兼容值，这是刻意保留，不是残留错误。

## 2026-05-20 门店看板三张总结卡恢复左侧彩色强调线
- 用户想做什么：把“优势发掘 / 短板改善 / 风险管控”三张卡的填充和描边样式改回之前那种左边带颜色的样式。
- 已经完成了什么：保留现有 `icon + 标题 + 正文` 结构不动，只把外观层恢复成白底、正常细描边、左侧 3px 彩色强调线；分别用绿色、橙色、红色对应三张卡；门店看板预览版本号同步更新到 `20260520124500`。
- 改动了哪些文件：`app-inline.css`、`store-dashboard/index.html`、`store-dashboard/page.js`、`store-dashboard/page.css`。
- 做过哪些验证：静态检查确认 `.summary-item.success/.warning/.danger` 已恢复左侧彩色边线，背景已回到纯白，不会再出现整卡浅蓝填充。
- 还有哪些待办或风险：这次只改了填充和描边，图标、标题、正文结构保持现状；如果后续还想更像最早那版，下一步要继续看三张卡的内边距和左侧强调线粗细。
