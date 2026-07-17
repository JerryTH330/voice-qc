const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');

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

test('lead identity keeps its full content while evolution uses the remaining width', () => {
  assert.match(
    css,
    /\.leads-detail-page \.lead-detail-profile-card \.hero-top\s*{[\s\S]*?grid-template-columns:\s*max-content minmax\(0, 1fr\);/
  );
  assert.match(
    css,
    /\.leads-detail-page \.lead-detail-profile-card \.hero-subtitle\s*{[\s\S]*?white-space:\s*nowrap;/
  );
  assert.match(
    css,
    /\.lead-detail-hero-evolution\s*{[\s\S]*?width:\s*100%;/
  );
});
