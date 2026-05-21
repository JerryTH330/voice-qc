const path = require("path");
const { chromium } = require("/Users/jerry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const fileUrl = `file://${path.resolve(__dirname, "客户洞察.html")}`;

async function readMetricValue(page, title) {
  const cards = page.locator(".metric-card");
  const count = await cards.count();
  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const head = await card.locator(".metric-head").innerText();
    if (head.includes(title)) {
      return (await card.locator(".metric-value").innerText()).trim();
    }
  }
  throw new Error(`未找到指标: ${title}`);
}

async function readMetricCopy(page, title) {
  const cards = page.locator(".metric-card");
  const count = await cards.count();
  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const head = await card.locator(".metric-head").innerText();
    if (head.includes(title)) {
      return (await card.locator(".metric-copy").innerText()).trim();
    }
  }
  throw new Error(`未找到指标说明: ${title}`);
}

async function clickFilter(page, key, value) {
  await page.locator(`[data-filter="${key}"][data-value="${value}"]`).click();
  await page.waitForTimeout(50);
}

async function getActiveSceneValues(page) {
  return page.locator('[data-filter="scene"].active').evaluateAll(nodes => nodes.map(node => node.dataset.value));
}

async function getSceneOptionValues(page) {
  return page.locator('[data-filter="scene"]').evaluateAll(nodes => nodes.map(node => node.dataset.value));
}

async function getSceneOptionStates(page) {
  return page.locator('[data-filter="scene"]').evaluateAll(nodes => nodes.map(node => ({
    value: node.dataset.value,
    disabled: node.hasAttribute("disabled"),
    active: node.classList.contains("active")
  })));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const runtimeErrors = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto(fileUrl, { waitUntil: "load", timeout: 10000 });
  await page.locator('[data-filter="source"]').first().waitFor({ state: "attached", timeout: 5000 });
  await page.waitForTimeout(150);

  const sourceCount = await page.locator('[data-filter="source"]').count();
  if (sourceCount !== 3) {
    throw new Error(`数据来源筛选数量不对，期望 3，实际 ${sourceCount}`);
  }

  const sceneOptions = await getSceneOptionValues(page);
  const expectedSceneOptions = ["all", "首触跟进", "邀约进店", "排程确认", "门店接待", "试乘试驾"];
  if (sceneOptions.length !== expectedSceneOptions.length || expectedSceneOptions.some(scene => !sceneOptions.includes(scene))) {
    throw new Error(`业务场景展示不完整，实际为 ${sceneOptions.join(",") || "空"}`);
  }

  await clickFilter(page, "source", "all");
  const allScenes = await getActiveSceneValues(page);
  if (allScenes.length !== 1 || allScenes[0] !== "all") {
    throw new Error(`数据来源=全部 时，质检场景应只选中全部，实际为 ${allScenes.join(",") || "空"}`);
  }

  const allMetric = await readMetricValue(page, "有效录音数");
  const coverageCopy = await readMetricCopy(page, "录音覆盖率");
  if (coverageCopy !== "至少命中1条录音的线索数/线索数") {
    throw new Error(`录音覆盖率说明不正确，实际为 ${coverageCopy}`);
  }

  await clickFilter(page, "source", "云外呼");
  const cloudSceneOptions = await getSceneOptionValues(page);
  if (cloudSceneOptions.length !== expectedSceneOptions.length || expectedSceneOptions.some(scene => !cloudSceneOptions.includes(scene))) {
    throw new Error(`数据来源=云外呼 时业务场景展示不完整，实际为 ${cloudSceneOptions.join(",") || "空"}`);
  }
  const cloudSceneStates = await getSceneOptionStates(page);
  const expectedCloudSceneOptions = ["首触跟进", "邀约进店", "排程确认"];
  const invalidCloudScene = cloudSceneStates.find(option => (
    expectedCloudSceneOptions.includes(option.value) ? option.disabled : !option.disabled
  ));
  if (invalidCloudScene) {
    throw new Error(`数据来源=云外呼 时场景禁用状态不对，异常项为 ${invalidCloudScene.value}`);
  }
  const cloudScenes = await getActiveSceneValues(page);
  const expectedCloudScenes = ["首触跟进", "邀约进店", "排程确认"];
  if (cloudScenes.length !== expectedCloudScenes.length || expectedCloudScenes.some(scene => !cloudScenes.includes(scene))) {
    throw new Error(`数据来源=云外呼 时默认场景不对，实际为 ${cloudScenes.join(",") || "空"}`);
  }

  const cloudMetric = await readMetricValue(page, "有效录音数");

  await clickFilter(page, "source", "数字工牌");
  const badgeSceneOptions = await getSceneOptionValues(page);
  if (badgeSceneOptions.length !== expectedSceneOptions.length || expectedSceneOptions.some(scene => !badgeSceneOptions.includes(scene))) {
    throw new Error(`数据来源=数字工牌 时业务场景展示不完整，实际为 ${badgeSceneOptions.join(",") || "空"}`);
  }
  const badgeSceneStates = await getSceneOptionStates(page);
  const expectedBadgeSceneOptions = ["门店接待", "试乘试驾"];
  const invalidBadgeScene = badgeSceneStates.find(option => (
    expectedBadgeSceneOptions.includes(option.value) ? option.disabled : !option.disabled
  ));
  if (invalidBadgeScene) {
    throw new Error(`数据来源=数字工牌 时场景禁用状态不对，异常项为 ${invalidBadgeScene.value}`);
  }
  const badgeScenes = await getActiveSceneValues(page);
  const expectedBadgeScenes = ["门店接待", "试乘试驾"];
  if (badgeScenes.length !== expectedBadgeScenes.length || expectedBadgeScenes.some(scene => !badgeScenes.includes(scene))) {
    throw new Error(`数据来源=数字工牌 时默认场景不对，实际为 ${badgeScenes.join(",") || "空"}`);
  }

  const badgeMetric = await readMetricValue(page, "有效录音数");

  if (allMetric === cloudMetric && cloudMetric === badgeMetric) {
    throw new Error(`顶部筛选变化后，下方指标没有跟着变化，当前值都是 ${allMetric}`);
  }

  if (runtimeErrors.length) {
    throw new Error(`页面存在脚本报错: ${runtimeErrors.join(" | ")}`);
  }

  await browser.close();
  console.log(JSON.stringify({ allMetric, cloudMetric, badgeMetric }, null, 2));
}

run().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
