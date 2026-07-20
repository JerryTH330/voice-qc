const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');

test('AI intent filter renders an accessible rules tooltip with every rule', () => {
  assert.ok(runtime.includes('renderSessionIntentLevelHelp'));
  assert.ok(runtime.includes('查看AI意向等级评定规则'));
  assert.ok(runtime.includes('role="tooltip"'));
  assert.ok(runtime.includes('AI意向等级评定规则'));

  [
    ['高', '近期购买、问具体配置价格、主动约试驾、询问提车时间'],
    ['中', '有需求但时间未定、对比阶段、需再考虑、已约定跟进'],
    ['低', '仅初步了解、无明确计划、被推销后简单应付'],
    ['无', '明确拒绝、无意向'],
    ['无法判断', 'ASR内容过短或杂乱，无法提取信息，无法判断']
  ].forEach(([level, rule]) => {
    assert.ok(runtime.includes(`<th scope="row">${level}</th>`));
    assert.ok(runtime.includes(`<td>${rule}</td>`));
  });
});

test('AI intent rules tooltip appears on hover and keyboard focus', () => {
  assert.match(css, /\.session-intent-help:hover\s+\.session-intent-rule-tooltip/);
  assert.match(css, /\.session-intent-help:focus-within\s+\.session-intent-rule-tooltip/);
  assert.match(css, /\.session-intent-rule-tooltip\s*{[\s\S]*?opacity:\s*0;/);
});
