/* Shared by the dashboards, customer insight and the design reference. */
(function (root, factory) {
  const palette = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = palette;
    return;
  }
  root.AIQCChartPalette = palette;
  const style = root.document.documentElement.style;
  for (const color of [...palette.sequence, ...palette.categories]) {
    style.setProperty('--chart-' + color.code.toLowerCase(), color.hex);
  }
  style.setProperty('--chart-primary', palette.primary);
  style.setProperty('--chart-cohort-b', palette.cohortB);
  style.setProperty('--chart-reference', palette.reference);
  style.setProperty('--chart-other', palette.other);
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const series = (prefix, entries) => Object.freeze(entries.map(([name, hex], i) =>
    Object.freeze({ code: prefix + String(i + 1).padStart(prefix === 'C' ? 2 : 1, '0'), name, hex })));
  const sequence = series('S', [
    ['低', '#D8E6FF'], ['较低', '#9EBDF6'], ['中', '#6092F5'],
    ['主题蓝', '#2563EB'], ['高', '#1E469D']
  ]);
  const categories = series('C', [
    ['主题蓝', sequence[3].hex], ['晴空蓝', '#55B2F2'], ['薄荷青', '#38BDA5'],
    ['浅藤紫', '#A58AEF'], ['杏橙', '#F3A56C'], ['蔷薇粉', '#DF749D'],
    ['蜜黄', '#E9BD4D'], ['湖蓝', '#177FA8'], ['嫩叶绿', '#87C966'],
    ['鸢尾紫', '#7755CD'], ['深青', '#147C70'], ['冰蓝', '#9CD0F4'], ['靛蓝', '#475BAA']
  ]);
  // The caller supplies the complete dimension dictionary in its permanent slot order.
  function categoryMap(keys) {
    const colors = new Map();
    for (const key of keys) {
      if (colors.size === categories.length) break;
      if (!colors.has(key)) colors.set(key, categories[colors.size].hex);
    }
    return colors;
  }
  return Object.freeze({
    sequence, categories, categoryMap, primary: sequence[3].hex,
    cohortB: '#7C3AED', reference: '#64748B', other: '#DCE3ED'
  });
});
