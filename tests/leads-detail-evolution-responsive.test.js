const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');
const pageCss = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'leads', 'index.html'), 'utf8');
const pageJs = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.js'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '..', 'app-runtime.js'), 'utf8');
const template = html.match(/<template id="tpl-leads-detail">([\s\S]*?)<\/template>/)?.[1] || '';

test('lead evolution nodes use a continuous 80px rhythm per Figma 587:429', () => {
  assert.match(
    css,
    /\.lead-detail-hero-steps\s*{[\s\S]*?display:\s*flex;/
  );
  assert.match(
    css,
    /\.lead-detail-hero-steps\s*{[\s\S]*?gap:\s*0;[\s\S]*?padding:\s*0 25px 0 0;/
  );
  assert.match(
    css,
    /\.lead-detail-hero-step\s*{[\s\S]*?flex:\s*0 0 80px;[\s\S]*?width:\s*80px;/
  );
  assert.doesNotMatch(css, /grid-template-columns:\s*173px 174px 173px;/);
  assert.match(
    css,
    /\.lead-detail-hero-step-connector\s*{[\s\S]*?left:\s*calc\(50% \+ 15px\);[\s\S]*?width:\s*calc\(100% - 30px\);/
  );
});

test('lead evolution reserves fixed controls and only lets the middle track shrink', () => {
  assert.match(
    css,
    /\.lead-detail-hero-evolution\s*{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*28px minmax\(0, 1fr\) 28px;/
  );
  assert.match(
    css,
    /\.lead-detail-hero-steps\s*{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?overflow-x:\s*auto;/
  );
  assert.match(
    css,
    /\.lead-detail-evolution-arrow\s*{[\s\S]*?position:\s*relative;[\s\S]*?width:\s*28px;[\s\S]*?height:\s*28px;/
  );
  assert.match(css, /\.lead-detail-evolution-arrow\s*{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
  assert.match(css, /\.lead-detail-evolution-arrow:disabled\s*{[\s\S]*?opacity:\s*0\.35;[\s\S]*?visibility:\s*visible;/);
  assert.match(css, /\.lead-detail-evolution-toggle\s*{[\s\S]*?top:\s*12px;[\s\S]*?right:\s*12px;/);
  assert.doesNotMatch(css, /@media \(max-width: 1200px\)[\s\S]*?\.lead-detail-hero-step\s*{[\s\S]*?width:\s*72px;/);
});

test('expanded evolution reflows nodes without reserving empty arrow columns', () => {
  assert.match(
    css,
    /\[data-evolution-expanded\] \.lead-detail-hero-evolution\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/
  );
  assert.match(
    css,
    /\[data-evolution-expanded\] \.lead-detail-hero-steps\s*{[\s\S]*?grid-column:\s*1;[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?justify-content:\s*flex-start;[\s\S]*?row-gap:\s*20px;/
  );
  assert.match(css, /\.lead-detail-hero-step\.is-row-end \.lead-detail-hero-step-connector\s*{[\s\S]*?display:\s*none;/);
  assert.match(runtime, /function syncExpandedRowEnds\(\)[\s\S]*?nextStep\.offsetTop !== step\.offsetTop[\s\S]*?classList\.add\('is-row-end'\)/);
});

test('arrow paging stays aligned to complete 80px nodes', () => {
  assert.match(runtime, /const stepWidth = 80[\s\S]*?Math\.floor\(track\.clientWidth \/ stepWidth\)[\s\S]*?currentStepIndex \+ direction \* pageStepCount/);
  assert.match(runtime, /function alignTrackToNearestStep[\s\S]*?Math\.round\(track\.scrollLeft \/ stepWidth\) \* stepWidth/);
  assert.match(runtime, /const trackEndPadding = 25[\s\S]*?track\.scrollWidth - trackEndPadding/);
  assert.ok(html.includes('page.css?v=20260810-lead-evolution-spec-v2'));
  assert.ok(pageJs.includes('app-runtime.js?v=20260810-lead-evolution-spec-v2'));
});

test('lead evolution supports native gestures and truncates long labels without resizing nodes', () => {
  assert.match(css, /\.lead-detail-hero-steps\s*{[\s\S]*?touch-action:\s*pan-x pan-y;[\s\S]*?-webkit-overflow-scrolling:\s*touch;/);
  assert.match(css, /\.lead-detail-hero-step-label\s*{[\s\S]*?max-width:\s*80px;[\s\S]*?text-overflow:\s*ellipsis;[\s\S]*?white-space:\s*nowrap;/);
  assert.match(runtime, /class="lead-detail-hero-step-label" tabindex="0" title="\$\{escapeHtml\(step\.label \|\| '-'\)\}"/);
});

test('lead identity stays in the overview while evolution uses the centered journey width', () => {
  assert.match(template, /class="lead-detail-overview-customer"[\s\S]*?class="lead-detail-overview-customer-name"/);
  assert.match(
    pageCss,
    /\.lead-detail-overview-customer-name\s*{[\s\S]*?white-space:\s*nowrap;/
  );
  assert.match(
    pageCss,
    /\.lead-detail-journey-evolution \.lead-detail-hero-evolution\s*{[\s\S]*?width:\s*100%;/
  );
});
