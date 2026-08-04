# 交接日志归档

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
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：相关专项测试 25/25、全量测试 130/130、`git diff --check` 均通过。
- 还有哪些待办或风险：该改动已于后续按用户要求随线索旅程改版一并撤回。
## 2026-07-30 为线索旅程卡片顶部增加信息栏底色
- 用户想做什么：让日期、阶段标签和录音 ID 区域单独突出，并增加底色。
- 已经完成了什么：五张旅程卡顶部统一增加铺满宽度的浅蓝信息栏 `#f5f8ff`，设置 12px×16px 内边距、顶部圆角和底部分隔线；正文卡片继续保持纯白，阶段标签原色和录音跳转不变。
- 改动了哪些文件：`leads/page.css`、`leads/index.html`、`tests/customer-detail-latest-figma-layout.test.js`、`tests/lead-journey-card-meta.test.js`、交接日志。
- 做过哪些验证：相关专项测试 26/26、全量测试 131/131、`git diff --check` 均通过。
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
