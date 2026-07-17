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

test('customer detail keeps right AI generation and tag panels', () => {
  assert.ok(template.includes('customer-ai-generate-panel'));
  assert.ok(template.includes('立即生成'));
  assert.ok(template.includes('customer-intention-panel'));
  assert.ok(template.includes('customer-detail-tag-panel'));
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

test('customer detail AI portrait generation uses loading and typing interaction', () => {
  assert.ok(template.includes('data-customer-ai-generate'));
  assert.ok(runtime.includes('customerAiPortraitState.generating'));
  assert.ok(runtime.includes('startCustomerAiPortraitTyping'));
  assert.ok(runtime.includes('customer-ai-generate-loading'));
  assert.ok(css.includes('.customer-ai-generate-loading'));
  assert.ok(css.includes('.customer-ai-typing-caret'));
});

test('customer detail journey markers match lead detail marker style weight', () => {
  assert.match(css, /\.customer-hero-flat-marker\s*{[\s\S]*?border:\s*2px solid #94a3b8;/);
  assert.match(css, /\.customer-hero-flat-step\.is-high \.customer-hero-flat-marker\s*{[\s\S]*?border-color:\s*#ef4444;[\s\S]*?background:\s*#fef2f2;[\s\S]*?box-shadow:\s*0 0 0 4px rgba\(239, 68, 68, 0\.14\);[\s\S]*?color:\s*#dc2626;/);
  assert.match(css, /\.customer-hero-flat-step\.is-medium \.customer-hero-flat-marker\s*{[\s\S]*?border-color:\s*#f59e0b;[\s\S]*?background:\s*#fffbeb;[\s\S]*?box-shadow:\s*0 0 0 4px rgba\(245, 158, 11, 0\.14\);[\s\S]*?color:\s*#d97706;/);
  assert.equal(css.includes('border: 3px solid currentColor'), false);
  assert.equal(css.includes('0 0 0 7px'), false);
});

test('customer detail AI portrait expands after generated text exceeds card height', () => {
  assert.match(css, /\.customer-detail-page \.customer-intention-panel:has\(\.customer-ai-generate-panel\.is-generated\)\s*{[\s\S]*?height:\s*auto;/);
  assert.match(css, /\.customer-detail-page \.customer-intention-panel:has\(\.customer-ai-generate-panel\.is-generated\)\s*{[\s\S]*?min-height:\s*240px;/);
  assert.match(css, /\.customer-ai-generate-panel\.is-generated\s*{[\s\S]*?overflow:\s*visible;/);
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
