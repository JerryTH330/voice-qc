const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'leads', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const pageScript = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.js'), 'utf8');
const templateMatch = html.match(/<template id="tpl-customer-detail">([\s\S]*?)<\/template>/);
const template = templateMatch ? templateMatch[1] : '';

test('customer detail uses latest Figma summary timeline layout', () => {
  assert.ok(template.includes('customer-hero-summary-row'));
  assert.ok(template.includes('customer-hero-flat-timeline'));
  assert.equal((template.match(/data-hero-timeline-step=/g) || []).length, 6);
  assert.equal((template.match(/customer-hero-journey-row/g) || []).length, 0);
});

test('customer journey overview and toolbar sit between the heading and detail board', () => {
  const journeyHeadingIndex = template.indexOf('<h3>客户旅程</h3>');
  const overviewIndex = template.indexOf('class="customer-hero-flat-timeline"');
  const journeyToolbarIndex = template.indexOf('class="customer-journey-toolbar"');
  const journeyBoardIndex = template.indexOf('class="customer-journey-board"');

  assert.ok(journeyHeadingIndex >= 0);
  assert.ok(overviewIndex > journeyHeadingIndex);
  assert.ok(journeyToolbarIndex > overviewIndex);
  assert.ok(journeyBoardIndex > journeyToolbarIndex);
});

test('customer detail follows the Figma insight hierarchy', () => {
  assert.ok(template.includes('customer-ai-generate-panel'));
  assert.ok(template.includes('立即生成'));
  assert.ok(template.includes('customer-insight-panel'));
  assert.ok(template.includes('customer-insight-summary'));
  assert.ok(template.includes('customer-insight-tags'));
  assert.ok(template.includes('customer-insight-robot-222.png'));
  assert.equal(template.includes('class="ai-badge"'), false);
});

test('customer detail uses downloaded Figma image and icon assets', () => {
  const assetNames = [
    'customer-detail-avatar-figma.png',
    'customer-insight-avatar-figma.png',
    'customer-insight-robot-222.png',
    'customer-summary-leads-figma.svg',
    'customer-summary-stores-figma.svg',
    'customer-summary-time-figma.svg',
    'customer-insight-judgement-figma.svg',
    'customer-insight-ai-title-figma.svg',
    'customer-public-married-figma.svg',
    'customer-public-consumption-figma.svg',
    'customer-public-location-figma.svg',
    'customer-public-gender-figma.svg',
    'customer-public-age-figma.svg',
    'customer-public-education-figma.svg',
    'customer-public-career-figma.svg',
    'customer-public-car-figma.svg',
    'customer-public-energy-figma.svg',
    'customer-public-tech-figma.svg'
  ];

  assetNames.forEach((assetName) => {
    assert.ok(template.includes(`../assets/${assetName}`), `${assetName} should be referenced`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', assetName)), `${assetName} should exist`);
  });
});

test('AI customer insight title matches Figma node 507:3135', () => {
  assert.ok(template.includes('<img src="../assets/customer-insight-ai-title-figma.svg" alt="" />'));
  assert.ok(html.includes('page.css?v=20260731lead-evidence-fill'));
  assert.match(css, /\.customer-insight-ai-title\s*{[\s\S]*?align-items:\s*center;[\s\S]*?gap:\s*8px;/);
  assert.match(css, /\.customer-insight-ai-title img\s*{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;[\s\S]*?flex:\s*0 0 20px;/);
});

test('customer insight public labels match the Figma node', () => {
  ['已婚已育', '2档消费', '上海常驻', '男', '年龄', '本科', '资深白领', '有车', '新能源', '科技爱好者'].forEach((label) => {
    assert.ok(template.includes(`<span>${label}</span>`));
  });
  assert.equal(template.includes('30–39岁'), false);
  assert.equal(template.includes('汽车兴趣人群'), false);
});

test('customer detail summary uses first contact label', () => {
  assert.ok(template.includes('首次建联：2026-03-10'));
  assert.equal(template.includes('首次建群：2026-03-10'), false);
  assert.ok(template.includes('最后一次跟进时间：2026-03-15报价沟通'));
  assert.equal(template.includes('首次跟进：2026-03-15报价沟通'), false);
});

test('lead page includes direct styles for the latest customer detail layout', () => {
  assert.ok(css.includes('.customer-hero-flat-timeline'));
  assert.ok(css.includes('.customer-ai-generate-panel'));
  assert.ok(css.includes('.customer-hero-summary-chip'));
});

test('customer insight shell matches the latest Figma white panel', () => {
  assert.match(css, /\.customer-insight-panel\s*{[\s\S]*?border:\s*1\.5px solid #dbeafe;[\s\S]*?border-radius:\s*18px;[\s\S]*?background:\s*#fff;/);
  assert.equal(css.includes('linear-gradient(180deg, #eff6ff 0%, #fff 100%)'), false);
});

test('customer detail AI portrait generation uses loading and typing interaction', () => {
  assert.ok(template.includes('data-customer-ai-generate'));
  assert.ok(runtime.includes('customerAiPortraitState.generating'));
  assert.ok(runtime.includes('startCustomerAiPortraitTyping'));
  assert.ok(runtime.includes('customer-ai-generate-loading'));
  assert.ok(css.includes('.customer-ai-generate-loading'));
  assert.ok(css.includes('.customer-ai-typing-caret'));
});

test('customer insight robot plays a local video during generation and restores the image', () => {
  assert.ok(template.includes('customer-insight-robot-generating.mp4'));
  assert.ok(template.includes('class="customer-insight-robot-video"'));
  assert.ok(template.includes('muted'));
  assert.ok(template.includes('playsinline'));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'customer-insight-robot-generating.mp4')));
  assert.ok(runtime.includes('setCustomerInsightRobotPlayback(true)'));
  assert.ok(runtime.includes("robotVideo.addEventListener('ended'"));
  assert.ok(runtime.includes('setCustomerInsightRobotPlayback(false)'));
  assert.ok(css.includes('.customer-insight-robot-video[hidden]'));
});

test('customer insight robot loops through typing and stops after the regenerate button appears', () => {
  assert.match(runtime, /const insightOutputInProgress = customerAiPortraitState\.generating[\s\S]*?\|\| \(customerAiPortraitState\.generated && !customerAiPortraitState\.typingDone\)/);
  assert.match(runtime, /if \(insightOutputInProgress\) \{[\s\S]*?setCustomerInsightRobotPlayback\(true\)[\s\S]*?return/);
  assert.match(runtime, /<button class="customer-ai-regenerate"[\s\S]*?重新生成<\/button>[\s\S]*?setCustomerInsightRobotPlayback\(false\)/);
  assert.doesNotMatch(runtime, /customerAiPortraitState\.generateTimer = window\.setTimeout\([\s\S]*?customerAiPortraitState\.generateTimer = null\s+setCustomerInsightRobotPlayback\(false\)/);
});

test('customer insight description sits left of the generate button with 24px spacing', () => {
  const panelIndex = template.indexOf('class="customer-ai-generate-panel"');
  const descriptionIndex = template.indexOf('class="customer-insight-ai-description"');
  const buttonIndex = template.indexOf('data-customer-ai-generate');

  assert.ok(panelIndex >= 0);
  assert.ok(descriptionIndex > panelIndex);
  assert.ok(buttonIndex > descriptionIndex);
  assert.ok(runtime.includes('<span class="customer-insight-ai-description">客户在多家门店/单门店多旅程的共性与差异分析</span>'));
  assert.match(css, /\.customer-ai-generate-panel\s*{[\s\S]*?flex-direction:\s*row;[\s\S]*?gap:\s*12px 24px;/);
});

test('generated customer insight omits the result mode badge', () => {
  assert.equal(runtime.includes('customer-ai-result-title'), false);
  assert.equal(runtime.includes("title: '跨店共性与差异'"), false);
  assert.equal(runtime.includes("title: '阶段共性与差异'"), false);
  assert.equal(css.includes('.customer-ai-result-title'), false);
});

test('typing customer insight starts directly with generated text without a leading newline', () => {
  assert.ok(runtime.includes('<div class="customer-ai-generated-copy-typing">${escapeHtml(fullText.slice(0, visibleLength))}'));
  assert.equal(runtime.includes('class="customer-ai-generated-copy-typing">\\n'), false);
  assert.equal(css.includes('.customer-ai-generate-panel.is-typing'), false);
});

test('customer detail journey markers match lead detail marker style weight', () => {
  assert.match(css, /\.customer-hero-flat-marker\s*{[\s\S]*?border:\s*2px solid #94a3b8;/);
  assert.match(css, /\.customer-hero-flat-step\.is-high \.customer-hero-flat-marker\s*{[\s\S]*?border-color:\s*#ef4444;[\s\S]*?background:\s*#fef2f2;[\s\S]*?box-shadow:\s*0 0 0 4px rgba\(239, 68, 68, 0\.14\);[\s\S]*?color:\s*#dc2626;/);
  assert.match(css, /\.customer-hero-flat-step\.is-medium \.customer-hero-flat-marker\s*{[\s\S]*?border-color:\s*#f59e0b;[\s\S]*?background:\s*#fffbeb;[\s\S]*?box-shadow:\s*0 0 0 4px rgba\(245, 158, 11, 0\.14\);[\s\S]*?color:\s*#d97706;/);
  assert.equal(css.includes('border: 3px solid currentColor'), false);
  assert.equal(css.includes('0 0 0 7px'), false);
});

test('customer detail AI portrait fills the card without an empty generated-state footer', () => {
  assert.match(css, /\.customer-ai-generate-panel\s*{[\s\S]*?min-height:\s*120px;[\s\S]*?flex:\s*1 1 auto;/);
  assert.equal(css.includes('.customer-insight-ai:has(.customer-ai-generate-panel.is-generated)'), false);
  assert.match(css, /\.customer-ai-generate-panel\.is-generated\s*{[\s\S]*?overflow:\s*visible;/);
});

test('generated AI insight keeps the preview panel appearance', () => {
  const generatedRule = css.match(/\.customer-ai-generate-panel\.is-generated\s*{([^}]*)}/)?.[1] || '';

  assert.equal(generatedRule.includes('background:'), false);
  assert.equal(generatedRule.includes('border-color:'), false);
  assert.match(css, /\.customer-ai-generate-panel\s*{[\s\S]*?border:\s*1px solid #dbeafe;[\s\S]*?border-radius:\s*14px;[\s\S]*?background:\s*linear-gradient/);
});

test('customer journey store filter is rendered through shared multi-select utility', () => {
  assert.ok(pageScript.includes('../factory-multi-select-filter-utils.js'));
  assert.ok(template.includes('data-customer-journey-filter-slot'));
  assert.equal(template.includes('data-customer-journey-filter="current"'), false);
  assert.ok(runtime.includes('__factoryMultiSelectFilterUtils'));
  assert.ok(runtime.includes('renderCustomerJourneyStoreFilter'));
  assert.ok(runtime.includes('renderCheckboxFilterOptionsMarkup'));
  assert.ok(runtime.includes('factory-multi-select-option'));
});

test('customer journey toolbar matches Figma node 507:3287 with 20px bottom spacing', () => {
  assert.ok(html.includes('page.css?v=20260731lead-evidence-fill'));
  assert.match(css, /\.customer-journey-panel > \.customer-journey-toolbar\s*{[\s\S]*?justify-content:\s*flex-end;[\s\S]*?gap:\s*24px;[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*0 24px 20px;/);
  assert.match(css, /\.customer-journey-toolbar \.customer-journey-control-group\s*{[\s\S]*?min-height:\s*44px;[\s\S]*?gap:\s*12px;[\s\S]*?padding:\s*1px 15px;[\s\S]*?border:\s*1px solid rgba\(201, 210, 224, 0\.88\);[\s\S]*?border-radius:\s*16px;/);
  assert.match(css, /\.customer-journey-toolbar \.customer-journey-sort-btn\.is-active\s*{[\s\S]*?background:\s*rgba\(37, 99, 235, 0\.1\);/);
  assert.match(css, /\.customer-journey-toolbar \.customer-journey-filter-check\s*{[\s\S]*?width:\s*16px;[\s\S]*?height:\s*16px;/);
  assert.ok(css.includes('customer-journey-check-figma.svg'));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'customer-journey-check-figma.svg')));
  assert.ok(runtime.includes("let selectedFilters = new Set(['current'])"));
});

test('customer journey store options use one consistent type scale', () => {
  ['current', 'other', 'extra'].forEach((tone) => {
    const rule = css.match(new RegExp(String.raw`\.customer-journey-toolbar \.customer-journey-filter-btn-${tone}\s*\{([^}]*)\}`))?.[1] || '';
    assert.ok(rule.includes('font-size: 14px;'));
    assert.ok(rule.includes('font-weight: 500;'));
    assert.ok(rule.includes('line-height: 20px;'));
  });
});

test('every customer journey detail card uses a pure white background', () => {
  assert.ok(html.includes('page.css?v=20260731lead-evidence-fill'));
  assert.match(css, /\.customer-detail-page \.customer-journey-board \.customer-journey-item \.journey-body\s*{[\s\S]*?background:\s*#fff;/);
});
