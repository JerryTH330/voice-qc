const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const pageJs = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'leads', 'index.html'), 'utf8');

test('lead detail desktop layout gives customer tags up to 800px and lets intention fill the rest', () => {
  assert.match(
    css,
    /\.lead-detail-overview-grid\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(600px, 800px\);[\s\S]*?gap:\s*16px;[\s\S]*?align-items:\s*stretch;/
  );
});

test('lead detail moves both top cards into the overview and keeps journey below it', () => {
  assert.ok(runtime.includes('function arrangeLeadDetailFigmaLayout()'));
  assert.ok(runtime.includes('overviewGrid.append(intentionPanel, tagPanel)'));
  assert.ok(runtime.includes("overviewPanel.insertAdjacentElement('afterend', journeyPanel)"));
  assert.equal(html.includes('lead-detail-profile-card'), false);
  assert.match(
    css,
    /\.lead-detail-overview-grid > \.intention-panel,\s*\.lead-detail-overview-grid > \.lead-detail-tag-panel\s*{[\s\S]*?height:\s*auto;[\s\S]*?align-self:\s*stretch;/
  );
});

test('evidence section fills the extra height when customer tags are taller', () => {
  assert.match(
    css,
    /\.lead-detail-overview-grid > \.intention-panel\s*{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/
  );
  assert.match(
    css,
    /\.lead-detail-overview-grid > \.intention-panel \.intention-card,\s*\.lead-detail-overview-grid > \.intention-panel \.intention-body\s*{[\s\S]*?min-height:\s*0;[\s\S]*?flex:\s*1 1 auto;/
  );
  assert.match(
    css,
    /\.lead-detail-overview-grid > \.intention-panel \.intention-body > \.intention-item:last-child\s*{[\s\S]*?flex:\s*1 1 auto;/
  );
});

test('lead detail keeps the new section order in a single column below the desktop breakpoint', () => {
  assert.match(
    css,
    /@media \(max-width: 1320px\)\s*{[\s\S]*?\.lead-detail-overview-grid\s*{[\s\S]*?grid-template-columns:\s*1fr;/
  );
});

test('lead journey uses its natural content height instead of fitting the viewport', () => {
  const resizeFunction = runtime.match(
    /function handleLeadDetailResize\(\)\s*{([\s\S]*?)\n\s*function destroyLeadDetailPage/
  )?.[1] || '';

  assert.ok(resizeFunction);
  assert.doesNotMatch(runtime, /function syncLeadDetailJourneyHeight/);
  assert.doesNotMatch(runtime, /journeyPanel\.style\.height/);
  assert.doesNotMatch(runtime, /journeyScroll\.style\.maxHeight/);
  assert.doesNotMatch(runtime, /window\.innerHeight\s*-\s*24/);
  assert.doesNotMatch(resizeFunction, /syncLeadDetailJourneyHeight/);
  assert.match(resizeFunction, /syncLeadDetailTagCloudLayout/);
  assert.match(runtime, /pageHost\.querySelector\('\.intention-panel'\)/);
  assert.match(runtime, /pageHost\.querySelector\('\.lead-detail-tag-panel'\)/);
  assert.doesNotMatch(runtime, /resizeTargets[\s\S]*?lead-detail-profile-card/);
  assert.ok(pageJs.includes('app-runtime.js?v=20260810-lead-evolution-spec-v2'));
  assert.ok(html.includes('page.js?v=20260810-lead-evolution-spec-v2'));
});
