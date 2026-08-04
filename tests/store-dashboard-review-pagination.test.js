const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const styles = fs.readFileSync(path.join(__dirname, '..', 'app-inline.css'), 'utf8');
const storeHtml = fs.readFileSync(path.join(__dirname, '..', 'store-dashboard', 'index.html'), 'utf8');
const factoryRuntime = fs.readFileSync(path.join(__dirname, '..', 'factory-dashboard', 'factory-dashboard.js'), 'utf8');

test('store recording review displays five items per page', () => {
  assert.match(runtime, /const STORE_ISSUE_PAGE_SIZE = 5;/);
  assert.match(
    runtime,
    /items\.slice\(offset, offset \+ STORE_ISSUE_PAGE_SIZE\)/
  );
  assert.match(
    runtime,
    /\$\{STORE_ISSUE_PAGE_SIZE\} 条\/页/
  );
});

test('store hero groups recording totals by source and scene like factory hero', () => {
  assert.match(runtime, /label: '云外呼录音数'[\s\S]*?首触跟进[\s\S]*?邀约进店[\s\S]*?排程确认/);
  assert.match(runtime, /label: '门店工牌录音数'[\s\S]*?进店接待[\s\S]*?试乘试驾/);
  assert.match(runtime, /class="store-recording-summary-ribbon" aria-label="录音总计"/);
  assert.match(runtime, /class="store-recording-summary-level" aria-hidden="true">录音总计<\/span>/);
  assert.match(runtime, /recording-ribbon-mask\.svg/);
  assert.match(factoryRuntime, /class="store-recording-summary-ribbon" aria-label="录音总计"/);
  assert.match(factoryRuntime, /class="store-recording-summary-level" aria-hidden="true">录音总计<\/span>/);
  assert.doesNotMatch(runtime, /来源总计/);
  assert.doesNotMatch(factoryRuntime, /来源总计/);
  assert.doesNotMatch(runtime, /所含业务场景/);
  assert.doesNotMatch(factoryRuntime, /所含业务场景/);
  assert.match(styles, /\.store-dashboard-page \.store-recording-summary\{/);
  assert.match(styles, /\.store-dashboard-page \.store-recording-summary-group\{[\s\S]*?background:#f8fbff;/);
});

test('store hero renders six independent quality metrics below source summary', () => {
  const renderBlock = runtime.match(/const renderHeroKPI = \(\) => \{[\s\S]*?^\s{2}\};/m)?.[0] || '';

  assert.match(renderBlock, /renderStoreRecordingSummary\(\)/);
  assert.doesNotMatch(renderBlock, /renderFlowLink|drawFunnelFlow/);
  assert.equal((renderBlock.match(/renderSingleKpiMetric/g) || []).length, 6);
});

test('factory and store dashboards no longer render source filters', () => {
  assert.doesNotMatch(storeHtml, /<span class="gf-label">数据来源<\/span>/);
  assert.doesNotMatch(storeHtml, /id="gf-source"/);
  assert.doesNotMatch(factoryRuntime, /<span class="gf-label">数据来源<\/span>/);
  assert.doesNotMatch(factoryRuntime, /id="gf-source"/);
});
