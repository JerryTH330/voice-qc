const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'sales-dashboard', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'sales-dashboard', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');

test('sales review cards use the Figma robot placement and existing customer insight media', () => {
  assert.ok(html.includes('page.css?v=20260729sales-review-robot'));
  assert.equal((html.match(/data-sales-review-robot-media/g) || []).length, 2);
  assert.equal((html.match(/customer-insight-robot-222\.png/g) || []).length, 2);
  assert.equal((html.match(/customer-insight-robot-generating\.mp4/g) || []).length, 2);
  assert.match(css, /\.sales-role-dashboard-page \.sales-review-robot-media\s*{[\s\S]*?z-index:\s*0;[\s\S]*?top:\s*0;[\s\S]*?right:\s*20px;[\s\S]*?width:\s*120px;[\s\S]*?height:\s*120px;/);
  assert.match(css, /\.sales-role-dashboard-page \.sales-review-robot-image,\s*\.sales-role-dashboard-page \.sales-review-robot-video\s*{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*cover;/);
  assert.match(css, /\.sales-role-dashboard-page \.sales-inline-review-card \.card-header,\s*\.sales-role-dashboard-page \.sales-inline-review-card \.review-scroll-area\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*1;/);
  assert.match(css, /\.sales-role-dashboard-page \.review-ai-summary\s*{[\s\S]*?min-height:\s*92px;[\s\S]*?padding:\s*15px 19px;[\s\S]*?border-radius:\s*16px;[\s\S]*?background:\s*rgba\(248, 250, 252, 0\.5\);[\s\S]*?backdrop-filter:\s*blur\(4px\);/);
});

test('sales review robot loops while analysis or typing is active and restores the image when typing ends', () => {
  assert.match(runtime, /function isSalesReviewSummaryInProgress\(role\)[\s\S]*?reviewSummaryGenerating[\s\S]*?reviewSummaryGenerated && !roleState\?\.reviewSummaryTypingDone/);
  assert.match(runtime, /function bindSalesReviewRobotPlayback\(role\)[\s\S]*?addEventListener\('ended'[\s\S]*?isSalesReviewSummaryInProgress\(role\)[\s\S]*?robotVideo\.currentTime = 0[\s\S]*?robotVideo\.play\(\)/);
  assert.match(runtime, /if \(visibleLength >= fullText\.length\)[\s\S]*?roleState\.reviewSummaryTypingDone = true[\s\S]*?renderSalesReviewSummaryStatic\(summaryNode, fullText\)[\s\S]*?setSalesReviewRobotPlayback\(role, false\)/);
  assert.ok(runtime.includes("setSalesReviewRobotPlayback('dcc', isSalesReviewSummaryInProgress('dcc'))"));
  assert.ok(runtime.includes("setSalesReviewRobotPlayback('advisor', isSalesReviewSummaryInProgress('advisor'))"));
});
