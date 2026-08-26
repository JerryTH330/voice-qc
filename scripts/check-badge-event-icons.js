const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pageSource = fs.readFileSync(path.join(root, 'device-management/page.js'), 'utf8');

const checks = [
  ['开机事件固定映射 power-on.svg', pageSource.includes("'power-on': 'power-on.svg'")],
  ['关机事件固定映射 power-off.svg', pageSource.includes("'power-off': 'power-off.svg'")],
  ['事件图标由统一函数渲染', (pageSource.match(/renderBadgeEventIcon\(/g) || []).length >= 3],
  ['不再依赖单条事件的 iconAsset 标记', !pageSource.includes("event.iconAsset === 'power-on'")],
  ['演示数据不再保存开关文字图标', !/type:\s*'(?:power-on|power-off)'[^\n}]*icon:\s*'(?:开|关)'/.test(pageSource)]
];

let failed = false;
checks.forEach(([name, passed]) => {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  failed ||= !passed;
});

process.exit(failed ? 1 : 0);
