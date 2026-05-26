const test = require('node:test');
const assert = require('node:assert/strict');

const { getQuickLookupFilterKeys } = require('../script-library-filter-utils.js');

test('quick lookup filters keep only stable fields', () => {
  assert.deepEqual(getQuickLookupFilterKeys(), ['quickScene', 'quickRecommendation']);
});
