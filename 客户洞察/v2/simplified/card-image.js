/* Local DOM snapshot export. No remote service or chart redraw is involved. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InsightCardImage = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  function snapshot(node) {
    const document = node.ownerDocument, view = document.defaultView;
    const pseudoRules = [];
    let sequence = 0;
    const copyStyle = (from, to) => {
      for (let i = 0; i < from.length; i++) {
        const property = from[i];
        to.setProperty(property, from.getPropertyValue(property), from.getPropertyPriority(property));
      }
      to.setProperty('animation', 'none');
      to.setProperty('transition', 'none');
    };
    function clone(source) {
      const target = source.cloneNode(false);
      if (source.nodeType !== 1) return target;
      copyStyle(view.getComputedStyle(source), target.style);
      for (const pseudo of ['::before', '::after']) {
        const computed = view.getComputedStyle(source, pseudo);
        if (!computed.content || computed.content === 'none' || computed.content === 'normal') continue;
        const token = 'ci-image-pseudo-' + sequence++;
        target.classList.add(token);
        const rule = document.createElement('span').style;
        copyStyle(computed, rule);
        pseudoRules.push(`.${token}${pseudo}{${rule.cssText}}`);
      }
      for (const child of source.childNodes) target.appendChild(clone(child));
      return target;
    }
    const bounds = node.getBoundingClientRect();
    const width = Math.ceil(bounds.width), height = Math.ceil(bounds.height);
    if (!width || !height) throw new Error('图表尚未显示');
    const card = clone(node);
    card.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    Object.assign(card.style, { margin: '0', width: width + 'px', height: height + 'px', boxSizing: 'border-box' });
    if (pseudoRules.length) {
      const style = document.createElement('style');
      style.textContent = pseudoRules.join('\n');
      card.appendChild(style);
    }
    const serialized = new view.XMLSerializer().serializeToString(card);
    return { width, height, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject></svg>` };
  }
  async function toBlob(node, { pixelRatio = 2 } = {}) {
    // Snapshot styles synchronously, before the user can change the live filters.
    const { width, height, svg } = snapshot(node);
    const document = node.ownerDocument, view = document.defaultView;
    const image = new view.Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('浏览器未能渲染图表图片'));
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * pixelRatio);
    canvas.height = Math.ceil(height * pixelRatio);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('浏览器不支持图片导出');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片生成失败')), 'image/png');
    });
  }
  return { snapshot, toBlob };
});
