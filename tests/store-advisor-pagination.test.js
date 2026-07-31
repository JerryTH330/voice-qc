const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'store-dashboard', 'index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'store-dashboard', 'page.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');

test('store advisor ranking defaults to ten rows and does not offer five rows per page', () => {
  assert.ok(html.includes('page.js?v=20260731131500'));
  assert.ok(bootstrap.includes("const version = '20260731131500'"));
  assert.ok(runtime.includes('let advisorPaginationState = { page: 1, pageSize: 10 }'));
  assert.ok(runtime.includes('${[10, 20, 50].map(size => `'));
  assert.ok(!runtime.includes('${[5, 10, 20, 50].map(size => `'));
});
