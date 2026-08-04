const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'leads', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'leads', 'page.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const template = html.match(/<template id="tpl-leads-detail">([\s\S]*?)<\/template>/)?.[1] || '';

test('lead detail follows the Figma 533:8216 section order', () => {
  const actionsIndex = template.indexOf('class="actions-inline leads-detail-actions"');
  const overviewIndex = template.indexOf('class="lead-detail-overview-panel"');
  const journeyIndex = template.indexOf('class="card lead-journey-panel"');

  assert.ok(actionsIndex >= 0);
  assert.ok(actionsIndex < overviewIndex);
  assert.ok(overviewIndex < journeyIndex);
  assert.equal(template.includes('lead-detail-profile-card'), false);
  assert.equal(
    template.slice(actionsIndex, overviewIndex).includes('leads-detail-actions-side'),
    false
  );
});

test('overview panel combines masked customer identity, summary pills and both insight cards', () => {
  assert.match(
    template,
    /class="lead-detail-overview-panel"[\s\S]*?class="lead-detail-overview-header"[\s\S]*?lead-customer-avatar-figma-534-8898\.png[\s\S]*?id="leadDetailHeroTitle">王\*生<[\s\S]*?class="leads-detail-actions-side"[\s\S]*?id="leadDetailLastTouch"[\s\S]*?class="lead-detail-overview-grid"/
  );
  assert.ok(template.includes('class="card intention-panel"'));
  assert.ok(template.includes('class="card lead-detail-tag-panel"'));
  assert.ok(runtime.includes('overviewGrid.append(intentionPanel, tagPanel)'));
  assert.ok(fs.existsSync(path.join(root, 'assets', 'lead-customer-avatar-figma-534-8898.png')));
  assert.ok(runtime.includes("setText('#leadDetailHeroTitle', maskLeadDetailCustomerName(payload.customer))"));
});

test('existing intent, evidence, dialogue and public icons are reused', () => {
  [
    '../assets/intention-intent.svg',
    '../assets/intention-evidence.svg',
    '../assets/lead-tag-dialogue-figma.svg',
    '../assets/lead-tag-public-figma.svg'
  ].forEach((asset) => assert.ok(template.includes(asset)));
});

test('customer evolution is inside the journey card before the timeline', () => {
  const journeyIndex = template.indexOf('class="card lead-journey-panel"');
  const evolutionIndex = template.indexOf('class="lead-detail-journey-evolution"');
  const timelineIndex = template.indexOf('class="journey-timeline lead-journey-scroll"');

  assert.ok(journeyIndex >= 0);
  assert.ok(journeyIndex < evolutionIndex);
  assert.ok(evolutionIndex < timelineIndex);
  assert.ok(template.includes('id="leadDetailHeroEvolutionSteps"'));
});

test('overview and journey shells match Figma sizing and appearance', () => {
  const tagPanelRule = css.match(
    /}\n\n\.lead-detail-overview-grid > \.lead-detail-tag-panel\s*{([^}]*)}/
  )?.[1] || '';

  assert.match(
    css,
    /\.lead-detail-overview-panel\s*{[\s\S]*?gap:\s*20px;[\s\S]*?padding:\s*21px 25px 25px;[\s\S]*?border:\s*1px solid #d7e2f3;[\s\S]*?border-radius:\s*20px;[\s\S]*?box-shadow:\s*0 16px 34px rgba\(38, 78, 130, 0\.08\);/
  );
  assert.match(
    css,
    /\.lead-detail-overview-grid\s*{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(600px, 800px\);[\s\S]*?gap:\s*16px;[\s\S]*?align-items:\s*stretch;/
  );
  assert.ok(tagPanelRule.includes('padding: 21px;'));
  assert.ok(tagPanelRule.includes('box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);'));
  assert.match(
    css,
    /\.lead-detail-overview-customer-avatar\s*{[\s\S]*?width:\s*40px;[\s\S]*?height:\s*40px;[\s\S]*?flex:\s*0 0 40px;/
  );
  assert.match(
    css,
    /\.lead-detail-overview-customer-name\s*{[\s\S]*?font-size:\s*24px;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*30px;[\s\S]*?letter-spacing:\s*-0\.96px;/
  );
  assert.match(
    css,
    /\.lead-detail-journey-evolution\s*{[\s\S]*?min-height:\s*124px;[\s\S]*?padding:\s*23px 17px 15px;[\s\S]*?border:\s*1px solid #cdddf3;[\s\S]*?border-radius:\s*18px;[\s\S]*?linear-gradient\(180deg, #fff 0%, #f8fbff 100%\);/
  );
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-panel\s*{[\s\S]*?gap:\s*20px;[\s\S]*?padding:\s*21px;[\s\S]*?border-radius:\s*20px;[\s\S]*?box-shadow:\s*0 14px 36px rgba\(22, 32, 51, 0\.08\);/
  );
});

test('lead detail Figma 533:8216 cache version is active', () => {
  assert.ok(html.includes('page.css?v=20260804-shared-insight-heading-icon'));
});

test('lead journey width follows its available container without horizontal overflow', () => {
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-panel\s*{[\s\S]*?box-sizing:\s*border-box;[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/
  );
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-scroll\s*{[\s\S]*?--journey-header-width:\s*clamp\(216px, 20%, 248px\);[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/
  );
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-scroll \.journey-item\s*{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/
  );
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-scroll \.journey-body\s*{[\s\S]*?min-width:\s*0;/
  );
});

test('every lead journey detail card uses a pure white background', () => {
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-journey-panel \.journey-item \.journey-body\s*{[\s\S]*?background:\s*#fff;/
  );
});

test('overview switches layout from its own available width instead of the viewport width', () => {
  assert.match(
    css,
    /\.lead-detail-overview-panel\s*{[\s\S]*?container-type:\s*inline-size;[\s\S]*?container-name:\s*lead-overview;/
  );
  assert.match(
    css,
    /@container lead-overview \(max-width: 1240px\)\s*{[\s\S]*?\.lead-detail-overview-header\s*{[\s\S]*?flex-direction:\s*column;[\s\S]*?\.leads-detail-page:not\(\.customer-detail-page\) \.lead-detail-overview-header \.leads-detail-actions-side\s*{[\s\S]*?justify-content:\s*flex-start;[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?\.lead-detail-overview-grid\s*{[\s\S]*?grid-template-columns:\s*1fr;/
  );
});
