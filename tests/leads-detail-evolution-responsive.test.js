const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');
const pageCss = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'leads', 'index.html'), 'utf8');
const template = html.match(/<template id="tpl-leads-detail">([\s\S]*?)<\/template>/)?.[1] || '';

test('lead evolution nodes and connectors share the available width', () => {
  assert.match(
    css,
    /\.lead-detail-hero-steps\s*{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/
  );
  assert.doesNotMatch(css, /grid-template-columns:\s*173px 174px 173px;/);
  assert.match(
    css,
    /\.lead-detail-hero-step-connector\s*{[\s\S]*?left:\s*calc\(50% \+ 15px\);[\s\S]*?width:\s*calc\(100% - 30px\);/
  );
});

test('lead identity stays in the overview while evolution uses the centered journey width', () => {
  assert.match(template, /class="lead-detail-overview-customer"[\s\S]*?class="lead-detail-overview-customer-name"/);
  assert.match(
    pageCss,
    /\.lead-detail-overview-customer-name\s*{[\s\S]*?white-space:\s*nowrap;/
  );
  assert.match(
    pageCss,
    /\.lead-detail-journey-evolution \.lead-detail-hero-evolution\s*{[\s\S]*?width:\s*min\(100%, 1110px\);/
  );
});
