const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'unified-navigation-shell.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/navigation/manifest.json'), 'utf8'));
const match = source.match(/const iconData = (\{[\s\S]*?\n  \});/);
assert.ok(match, '共享导航包含导出的图标数据');
const data = JSON.parse(match[1]);
assert.equal(Object.keys(data).length, 16);
for (const [name, icon] of Object.entries(manifest.icons)) {
  const original = fs.readFileSync(path.join(root, 'assets/navigation', icon.file));
  assert.deepEqual(Buffer.from(data[name], 'base64'), original, `${name} 必须与原始 SVG 字节一致`);
  assert.ok(source.includes(`icon: icons.${name}`), `${name} 必须用于导航菜单`);
}
assert.match(source, /background-color: currentColor/);
assert.match(source, /mask: var\(--nav-icon-image\)/);
assert.ok(!source.includes('nav-device-symbol'), '录音排查和到访明细不再使用字符占位');
console.log('PASS: 16 个导航图标均使用原始 SVG，保留状态颜色与本地文件加载兼容。');
