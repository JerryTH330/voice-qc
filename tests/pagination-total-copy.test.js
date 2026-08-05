const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'app-runtime.js'), 'utf8');
const factoryRuntime = fs.readFileSync(path.join(root, 'factory-dashboard/factory-dashboard.js'), 'utf8');
const storeSnapshot = fs.readFileSync(path.join(root, 'store-dashboard-dom.html'), 'utf8');
const deviceHtml = fs.readFileSync(path.join(root, 'device-management/index.html'), 'utf8');

test('shared pagination totals use the concise 共 XX 条 copy', () => {
  const totals = [...runtime.matchAll(/<span class="session-pagination-total">([^<]+)<\/span>/g)]
    .map((match) => match[1]);

  assert.ok(totals.length > 0);
  totals.forEach((copy) => assert.equal(copy, '共 ${totalItems} 条'));
  assert.ok(!runtime.includes('项数据'));
  assert.ok(!storeSnapshot.includes('项数据'));
});

test('rule-list pagination totals omit the current-page suffix', () => {
  const sources = [runtime, factoryRuntime];
  const copies = sources.flatMap((source) =>
    [...source.matchAll(/<div class="(?:issue-rule-footer|sop-analysis-list-footer)">\s*<span>([^<]+)<\/span>/g)]
      .map((match) => match[1])
  );
  const redesignedCopies = sources.flatMap((source) =>
    [...source.matchAll(/<div class="issue-rule-footer[^"]*">[\s\S]{0,180}?<span class="session-pagination-total">([^<]+)<\/span>/g)]
      .map((match) => match[1])
  );

  assert.equal(copies.length + redesignedCopies.length, 4);
  [...copies, ...redesignedCopies].forEach((copy) => assert.match(copy, /^共 \$\{[^}]+\} 条$/));
});

test('device management paginators use the same concise total copy', () => {
  const totals = [...deviceHtml.matchAll(/<div class="pagination(?: card-pagination)?"><span>([^<]+)<\/span>/g)]
    .map((match) => match[1]);

  assert.equal(totals.length, 5);
  totals.forEach((copy) => assert.match(copy, /^共 [\d,]+ 条$/));
});
