# 当前接手摘要
- 2026-05-18 用户要求按确认范围推送当前分支：只提交厂端看板 6 个文件，并把 `客户洞察` 一起纳入当前仓库；`Customer Insights` 与 `store-dashboard` 的已删除旧页面不进入本次提交。期间已修复 `客户洞察/filter-regression-test.js` 抢跑问题，浏览器回归脚本现已跑通。
- 2026-05-18 厂端看板顶部筛选中的“数据来源 / 业务场景 / 时间 / 车系”已按门店看板对齐：筛选顺序改为“品牌、数据来源、业务场景、时间、车系”，时间筛选的“自定义”已从旧弹窗改成门店端同款内嵌日期范围控件。
- 数据来源与业务场景联动逻辑已统一到门店端规则：切换来源后，只保留可选场景，不可用场景禁用；“全部”态表现与门店端一致。
- 2026-05-18 用户要求全局安装 `weread` skill；已确认原先公开页面给出的仓库 `majiayu000/claude-skill-registry` 现在主要是索引仓库，真正的 skill 文件位于 `majiayu000/claude-skill-registry-data` 的 `skills/data/weread`。当前安装被系统授权拦下，尚未完成。
- 厂端看板原「录音复盘」模块已按方案一改造，模块标题保留为「录音复盘」，内部承载规则命中分析与组织下钻。
- 点击规则后在当前模块内展示当前层级全部组织，并沿用规则列表当前排序方式；组织表现会联动顶部组织筛选：全国看大区、大区看战区、战区看门店、门店禁用下钻；所有下钻和回退无页面跳转、无弹窗。
- 顶部头像下方的组织文案已改为固定显示用户所属组织，不再跟随顶部品牌/组织筛选变化；当前示例固定为“华南大区”。

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
