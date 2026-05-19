(function (global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  global.__factoryHeroUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const getFactoryHeroSubtitle = (profile) => {
    const organization = String(profile?.organization || '').trim();
    if (organization) {
      return organization;
    }
    return String(profile?.region || '').trim();
  };

  return {
    getFactoryHeroSubtitle
  };
});
