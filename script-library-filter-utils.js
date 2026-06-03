(function (global, factory) {
  const api = factory();
  global.__scriptLibraryFilterUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function getQuickLookupFilterKeys() {
    return ['quickScene', 'quickRecommendation'];
  }

  return {
    getQuickLookupFilterKeys
  };
});
