const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'leads', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const templateMatch = html.match(/<template id="tpl-leads-detail">([\s\S]*?)<\/template>/);
const template = templateMatch ? templateMatch[1] : '';

test('last touch time is shown before Lead ID instead of inside the hero subtitle', () => {
  const lastTouchIndex = template.indexOf('id="leadDetailLastTouch"');
  const leadIdIndex = template.indexOf('id="leadDetailLeadId"');

  assert.ok(lastTouchIndex >= 0);
  assert.ok(lastTouchIndex < leadIdIndex);
  assert.equal(/id="leadDetailHeroSubtitle"[^>]*>[^<]*最后触达时间/.test(template), false);
  assert.ok(runtime.includes('lastTouchTime,'));
  assert.ok(runtime.includes("setText('#leadDetailLastTouch', `最后触达时间：${payload.lastTouchTime}`)"));
});

test('customer tags follow the Figma relationship-map and public-profile structure', () => {
  assert.match(template, /<h3>客户标签<\/h3>[\s\S]*?class="lead-detail-tag-split"/);
  assert.ok(template.includes('<h3>对话</h3>'));
  assert.ok(template.includes('解析客户真实对话，动态识别需求、偏好、意向与决策阶段，深化客户个体洞察。'));
  assert.ok(template.includes('id="leadDetailConversationMap"'));
  assert.ok(template.includes('class="lead-tag-relationship-map"'));
  assert.ok(template.includes('<h3>公域</h3>'));
  assert.ok(template.includes('融合公域用户属性、兴趣与行为数据，补充客户基础画像，构建完整客户视图。'));
  assert.ok(template.includes('id="leadDetailPublicProfile"'));
  assert.ok(template.includes('class="lead-public-profile-highlights"'));
  assert.ok(runtime.includes('renderLeadDetailConversationMap'));
  assert.ok(runtime.includes('renderLeadDetailPublicProfile'));
});

test('dialogue relationship map and public profile contain the Figma content', () => {
  ['高意向', '价格敏感', '周末试驾', '竞品对比'].forEach((tag) => assert.ok(template.includes(tag)));
  ['2档消费', '广东省广州市番禺区', '资深白领', '科技爱好者'].forEach((tag) => assert.ok(template.includes(tag)));
});

test('customer tag icons and relationship vectors use downloaded Figma assets', () => {
  [
    'lead-tag-dialogue-figma.svg',
    'lead-tag-public-figma.svg',
    'lead-tag-public-intent.svg',
    'lead-tag-public-consumption.svg',
    'lead-tag-public-location.svg',
    'lead-tag-public-gender.svg',
    'lead-tag-public-age.svg',
    'lead-tag-public-education.svg',
    'lead-tag-public-career.svg',
    'lead-tag-public-car.svg',
    'lead-tag-public-new-energy.svg',
    'lead-tag-public-tech.svg',
    'lead-tag-public-divider.svg',
    'lead-tag-path-01.svg',
    'lead-tag-path-09.svg'
  ].forEach((asset) => assert.ok(template.includes(`../assets/${asset}`) || runtime.includes(`../assets/${asset}`)));

  ['♟', '⚥', '▦', '◇', '♢', '▣', 'ϟ', '⌘'].forEach((placeholder) => {
    assert.equal(template.includes(placeholder), false);
    assert.equal(runtime.includes(placeholder), false);
  });
});

test('tag panels use two equal columns and stack based on their own container width', () => {
  assert.match(
    css,
    /\.lead-detail-tag-split\s*{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/
  );
  assert.match(css, /\.lead-detail-tag-split\s*{[\s\S]*?gap:\s*16px;/);
  assert.match(css, /\.lead-detail-tag-panel\s*{[\s\S]*?container-type:\s*inline-size;/);
  assert.match(
    css,
    /@container\s+lead-tag-panel\s+\(max-width:\s*720px\)\s*{[\s\S]*?\.lead-detail-tag-split\s*{[\s\S]*?grid-template-columns:\s*1fr;/
  );
});

test('Figma relationship map and public profile have dedicated responsive styles', () => {
  assert.match(css, /\.lead-tag-relationship-map\s*{[\s\S]*?position:\s*relative;[\s\S]*?min-height:\s*224px;/);
  assert.match(css, /\.lead-tag-relationship-path\s*{[\s\S]*?position:\s*absolute;[\s\S]*?pointer-events:\s*none;/);
  assert.match(css, /\.lead-public-profile-highlights\s*{[\s\S]*?grid-template-columns:\s*1fr 1fr 2fr;/);
  assert.match(css, /\.lead-public-profile-attributes\s*{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/);
});

test('customer tag borders and backgrounds use the Figma tone opacity', () => {
  [
    '--lead-tag-tone-rgb: 33, 95, 208;',
    '--lead-tag-tone-rgb: 202, 48, 37;',
    '--lead-tag-tone-rgb: 20, 132, 76;',
    '--lead-tag-tone-rgb: 104, 64, 218;',
    '--lead-tag-tone-rgb: 176, 111, 5;'
  ].forEach((value) => assert.ok(css.includes(value)));

  assert.match(
    css,
    /\.lead-relationship-chip\s*{[\s\S]*?color:\s*var\(--lead-tag-text\);[\s\S]*?border:\s*1px solid rgba\(var\(--lead-tag-tone-rgb\), 0\.2\);[\s\S]*?background:\s*rgba\(var\(--lead-tag-tone-rgb\), 0\.1\);/
  );
  assert.match(
    css,
    /\.lead-public-highlight\s*{[\s\S]*?color:\s*var\(--lead-tag-text\);[\s\S]*?border:\s*1px solid rgba\(var\(--lead-tag-tone-rgb\), 0\.2\);[\s\S]*?background:\s*rgba\(var\(--lead-tag-tone-rgb\), 0\.1\);/
  );
  assert.match(
    css,
    /\.lead-public-attribute\s*{[\s\S]*?border:\s*1px solid rgba\(var\(--lead-tag-tone-rgb\), 0\.1\);[\s\S]*?background:\s*rgba\(var\(--lead-tag-tone-rgb\), 0\.05\);/
  );
});

test('tag panel headings and descriptions match intention typography', () => {
  assert.match(
    css,
    /\.lead-detail-tag-section-header h3\s*{[\s\S]*?color:\s*#2563eb;[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*1\.5;/
  );
  assert.match(
    css,
    /\.lead-detail-tag-section-header p\s*{[\s\S]*?color:\s*#1e293b;[\s\S]*?font-size:\s*14px;[\s\S]*?line-height:\s*1\.6;[\s\S]*?letter-spacing:\s*0;/
  );
});

test('dialogue and public headings reuse intention icon sizing and spacing', () => {
  assert.match(
    template,
    /class="lead-detail-tag-section-title intention-item-head"[\s\S]*?src="\.\.\/assets\/lead-tag-dialogue-figma\.svg"[\s\S]*?class="intention-item-icon"[\s\S]*?<h3>对话<\/h3>/
  );
  assert.match(
    template,
    /class="lead-detail-tag-section-title intention-item-head"[\s\S]*?src="\.\.\/assets\/lead-tag-public-figma\.svg"[\s\S]*?class="intention-item-icon"[\s\S]*?<h3>公域<\/h3>/
  );
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'lead-tag-dialogue-figma.svg')));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'lead-tag-public-figma.svg')));
});

test('lead evidence highlights only the text inside the quote', () => {
  assert.ok(template.includes('需要“<strong class="lead-detail-evidence-alert">再考虑一下</strong>”'));
  assert.equal(template.includes('<strong class="lead-detail-evidence-alert">“再考虑一下”</strong>'), false);
  assert.match(
    css,
    /\.lead-detail-evidence-alert\s*{[\s\S]*?color:\s*#dc2626;[\s\S]*?font-size:\s*1\.08em;[\s\S]*?font-weight:\s*700;/
  );
  assert.ok(runtime.includes('renderLeadDetailEvidenceText(payload.evidenceText)'));
});

test('lead intent is rendered as a bullet list split by Chinese full stops', () => {
  assert.match(
    template,
    /id="leadDetailIntentText"[\s\S]*?<ul class="lead-detail-intent-list">[\s\S]*?<li>客户从首次到店接待到线上留资再到电话邀约，意向逐步提升。<\/li>/
  );
  assert.ok(runtime.includes('renderLeadDetailIntentList(payload.intentText)'));
  assert.match(
    css,
    /\.lead-detail-intent-list\s*{[\s\S]*?margin:\s*0;[\s\S]*?padding-left:\s*20px;/
  );
});
