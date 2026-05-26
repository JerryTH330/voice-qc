const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getScriptLibraryListBadge,
  shouldRenderMonthlySummaryStats,
  shouldRenderQuickLookupHeroBadge
} = require('../script-library-page-utils.js');

test('quick lookup list badge uses 匹配 X 条话术 wording', () => {
  assert.equal(getScriptLibraryListBadge('quick', 2), '匹配 2 条话术');
});

test('monthly training list badge uses 匹配 X 条主题 wording', () => {
  assert.equal(getScriptLibraryListBadge('monthly', 2), '匹配 2 条主题');
});

test('monthly training page no longer renders top summary stats', () => {
  assert.equal(shouldRenderMonthlySummaryStats(), false);
});

test('quick lookup hero no longer renders duplicate count badge', () => {
  assert.equal(shouldRenderQuickLookupHeroBadge(), false);
});
