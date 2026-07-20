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

test('customer tags are split into dialogue and public-domain panels', () => {
  assert.match(template, /<h3>客户标签<\/h3>[\s\S]*?class="lead-detail-tag-split"/);
  assert.ok(template.includes('<h3>对话</h3>'));
  assert.ok(template.includes('解析客户真实对话，动态识别需求、偏好、意向与决策阶段，深化客户个体洞察。'));
  assert.ok(template.includes('id="leadDetailConversationTagCloud"'));
  assert.ok(template.includes('<h3>公域</h3>'));
  assert.ok(template.includes('融合公域用户属性、兴趣与行为数据，补充客户基础画像，构建完整客户视图。'));
  assert.ok(template.includes('id="leadDetailPublicTagCloud"'));
});

test('dialogue and public-domain panels contain representative fake tags', () => {
  ['高意向', '价格敏感', '周末试驾', '竞品对比'].forEach((tag) => assert.ok(template.includes(tag)));
  ['30-39岁', '已婚有孩', '中高消费能力', '新能源车关注'].forEach((tag) => assert.ok(template.includes(tag)));
});

test('tag panels use two equal desktop columns', () => {
  assert.match(
    css,
    /\.lead-detail-tag-split\s*{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/
  );
  assert.match(css, /\.lead-detail-tag-split\s*{[\s\S]*?gap:\s*16px;/);
});

test('lead detail tag clouds are centered inside both cards', () => {
  assert.match(
    css,
    /\.lead-detail-tag-section \.lead-tag-cloud\s*{[\s\S]*?justify-content:\s*center;[\s\S]*?align-content:\s*center;/
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
    /class="lead-detail-tag-section-title intention-item-head"[\s\S]*?src="\.\.\/assets\/lead-tag-dialogue\.svg"[\s\S]*?class="intention-item-icon"[\s\S]*?<h3>对话<\/h3>/
  );
  assert.match(
    template,
    /class="lead-detail-tag-section-title intention-item-head"[\s\S]*?src="\.\.\/assets\/lead-tag-public\.svg"[\s\S]*?class="intention-item-icon"[\s\S]*?<h3>公域<\/h3>/
  );
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'lead-tag-dialogue.svg')));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'lead-tag-public.svg')));
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
