const path = require("path");
const { chromium } = require("/Users/jerry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const fileUrl = `file://${path.resolve(__dirname, "客户洞察.html")}`;
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto(fileUrl, { waitUntil: "load", timeout: 10000 });

  assert(await page.locator(".topic-row").count() === 7, "一级特征数量应为 7");
  assert(await page.locator('[data-mode="all"].is-active').count() === 1, "默认应为全部展示模式");
  assert(await page.locator("#allSetup").evaluate((element) => getComputedStyle(element).display) === "flex", "默认应展示全部客户说明");
  assert(await page.locator("#visitSetup").evaluate((element) => getComputedStyle(element).display) === "none", "默认不应展示邀约对比配置");
  assert(await page.locator("#leadSetup").evaluate((element) => getComputedStyle(element).display) === "none", "默认不应展示线索状态配置");
  assert(await page.locator(".sample-card").count() === 2, "全部展示模式应展示 2 张整体样本卡");
  assert(await page.locator(".overall-chart").count() === 7, "全部展示模式应展示单组特征排行");
  assert(await page.locator("#topicMatrix .sentiment-summary-chart").count() === 7, "全部展示模式应使用带占比的情感堆积图");
  assert((await page.locator("#topicMatrix .sentiment-values").first().innerText()).includes("%"), "情感堆积图应直接显示百分比");
  assert(await page.locator(".mirror-chart").count() === 0, "全部展示模式不应出现A/B镜面对比");
  assert(await page.locator(".trend-line-b").count() === 0, "全部展示模式不应出现B组趋势线");
  assert(await page.locator("#organizationHead th").count() === 5, "全部展示模式组织表应为整体口径");
  assert(await page.locator(".topic-row.is-selected").count() === 0, "默认应为全部特征汇总，不选中单一特征");
  assert(await page.locator("#topicTitle").innerText() === "TOP特征排行", "一级特征模块标题应为TOP特征排行");
  assert(await page.locator("#subtopicTitle").innerText() === "二级特征明细", "二级模块标题应为二级特征明细");
  assert(await page.locator("#voiceTitle").innerText() === "典型客户原声", "原声模块标题应为典型客户原声");
  assert(await page.locator(".subtopic-row").count() === 8, "全部汇总应展示跨一级特征的二级特征");
  assert(await page.locator(".subtopic-rate-chart").count() === 8, "二级特征应使用条形图展示反馈占比");
  assert(await page.locator(".subtopic-sentiment-chart .sentiment-values").count() === 8, "二级特征情感堆积图应显示百分比");
  assert(await page.locator(".trend-value-label").count() === 18, "三张整体趋势图的每个时间点都应显示数据");
  assert((await page.locator(".trend-value-label").first().textContent()).includes("%"), "趋势数据标签应显示百分比");
  assert((await page.locator("#insightCallout").innerText()).includes("当前筛选汇总"), "默认应展示当前筛选条件的整体分析结论");
  assert(await page.locator(".selected-topic-label:disabled").count() === 4, "四个明细模块默认都应处于全部汇总状态");
  assert(await page.locator("h1.page-title").innerText() === "客户洞察", "页面标题应为客户洞察");
  assert(await page.locator("#stageFilter").count() === 0, "不应保留业务阶段筛选");
  const filterLabels = await page.locator(".filter-grid > .filter-field > span:first-child").allInnerTexts();
  assert(filterLabels.join("|") === "组织|品牌|目标车型|反馈时间", "筛选顺序应为组织、品牌、目标车型、反馈时间");

  await page.locator('[data-mode="visit"]').click();
  assert(await page.locator("#allSetup").evaluate((element) => getComputedStyle(element).display) === "none", "邀约对比模式应隐藏全部展示说明");
  assert(await page.locator("#visitSetup").evaluate((element) => getComputedStyle(element).display) === "flex", "邀约对比模式应展示客群配置");
  assert(await page.locator(".sample-card").count() === 4, "邀约到店模式应展示 4 张样本卡");
  assert(await page.locator(".mirror-chart").count() === 7, "邀约对比模式应展示A/B镜面对比");
  assert(await page.locator(".trend-value-label").count() === 36, "对比模式两组趋势的每个时间点都应显示数据");
  assert(await page.locator("#legendA").innerText() === "邀约到店", "邀约对比A组名称应正确");
  assert(await page.locator("#legendB").innerText() === "邀约未到店", "邀约对比B组名称应正确");

  await page.locator('[data-mode="lead"]').click();
  assert(await page.locator("#visitSetup").evaluate((element) => getComputedStyle(element).display) === "none", "切换后应隐藏邀约到店配置");
  assert(await page.locator("#leadSetup").evaluate((element) => getComputedStyle(element).display) === "flex", "切换后应展示线索状态配置");
  assert(await page.locator(".sample-card").count() === 5, "线索状态模式应增加重叠客户卡");
  assert(await page.locator("#legendA").innerText() === "高转化客户", "对比组名称应同步更新");

  await page.locator('[data-topic="空间"]').click();
  const linkedLabels = await page.locator(".selected-topic-label").allInnerTexts();
  assert(linkedLabels.length === 4 && linkedLabels.every((label) => label.includes("空间")), "点击特征后四个明细模块应同步切换");
  assert(await page.locator(".selected-topic-label:not(:disabled)").count() === 4, "下钻后四个模块都应支持返回全部汇总");

  await page.locator(".selected-topic-label").first().click();
  assert(await page.locator(".selected-topic-label:disabled").count() === 4, "点击返回后应恢复全部汇总");

  await page.locator('[data-sentiment="positive"]').click();
  const voiceCount = await page.locator(".voice-item").count();
  assert(voiceCount > 0, "正面筛选后应保留客户原声");
  assert(await page.locator(".voice-item:not(.positive)").count() === 0, "正面筛选后不应出现其他情感原声");

  await page.locator('[data-grain="month"]').click();
  assert((await page.locator(".trend-axis-label").first().textContent()).includes("2月"), "月趋势应使用月份刻度");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "load" });
  const bodyOverflow = await page.locator("body").evaluate((element) => element.scrollWidth > element.clientWidth);
  assert(!bodyOverflow, "手机宽度下页面不应整体横向溢出");
  assert(await page.locator(".sidebar").evaluate((element) => getComputedStyle(element).display) === "none", "手机宽度下应隐藏侧边栏");

  assert(runtimeErrors.length === 0, `页面存在脚本报错：${runtimeErrors.join(" | ")}`);
  await browser.close();
  console.log(JSON.stringify({ featureCount: 7, aggregateSubfeatureCount: 8, linkedFeature: "空间", voiceCount, mobileChecked: true }, null, 2));
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
