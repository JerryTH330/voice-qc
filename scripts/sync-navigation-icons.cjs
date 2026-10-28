const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'assets/navigation');
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
const data = Object.fromEntries(Object.entries(manifest.icons).map(([name, icon]) => [
  name, fs.readFileSync(path.join(directory, icon.file)).toString('base64')
]));
const file = path.join(root, 'unified-navigation-shell.js');
const source = fs.readFileSync(file, 'utf8');
const pattern = /  \/\/ NAVIGATION_ICON_DATA_START[\s\S]*?  \/\/ NAVIGATION_ICON_DATA_END/;
if (!pattern.test(source)) throw new Error('Navigation icon data markers are missing');
fs.writeFileSync(file, source.replace(pattern, `  // NAVIGATION_ICON_DATA_START\n  const iconData = ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')};\n  // NAVIGATION_ICON_DATA_END`));
console.log(`Updated ${Object.keys(data).length} navigation icons from original SVG files.`);
