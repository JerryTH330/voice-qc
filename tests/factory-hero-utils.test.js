const test = require('node:test');
const assert = require('node:assert/strict');

const { getFactoryHeroSubtitle } = require('../factory-dashboard/factory-hero-utils.js');

test('factory hero subtitle uses user organization instead of active filters', () => {
  const subtitle = getFactoryHeroSubtitle({
    organization: '华南大区',
    region: '广州'
  }, {
    brand: '埃安',
    currentRegion: '华东大区',
    currentZone: '上海战区',
    currentStore: '上海浦东店'
  });

  assert.equal(subtitle, '华南大区');
});

test('factory hero subtitle falls back to region when organization is missing', () => {
  const subtitle = getFactoryHeroSubtitle({
    region: '广州'
  });

  assert.equal(subtitle, '广州');
});
