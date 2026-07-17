const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'leads', 'page.css'), 'utf8');

test('lead detail desktop layout uses two equal-width columns', () => {
  assert.match(
    css,
    /\.leads-detail-page:not\(\.customer-detail-page\) \.lead-detail-layout\s*{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/
  );
});

test('lead detail keeps a single column below the existing desktop breakpoint', () => {
  assert.match(
    css,
    /@media \(max-width: 1320px\)\s*{[\s\S]*?\.leads-detail-page:not\(\.customer-detail-page\) \.lead-detail-layout\s*{[\s\S]*?grid-template-columns:\s*1fr;/
  );
});
