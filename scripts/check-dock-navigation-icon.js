const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'unified-navigation-shell.js'), 'utf8');

const checks = [
  ['公共图标集合包含充电坞内联 SVG', /chargingDock:\s*'<svg class="nav-icon"[\s\S]*?<\/svg>'/],
  ['充电坞菜单直接复用公共内联图标', /label:\s*'充电坞'[\s\S]*?icon:\s*icons\.chargingDock/],
  ['不再依赖外部 SVG 遮罩节点', (value) => !value.includes('nav-icon-charging-dock-detail')],
  ['不再运行时拼接外部图标地址', (value) => !value.includes("assets/nav-charging-dock-detail-figma.svg")]
];

let failed = false;
checks.forEach(([label, matcher]) => {
  const pass = typeof matcher === 'function' ? matcher(source) : matcher.test(source);
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${label}`);
  if (!pass) failed = true;
});

if (failed) process.exit(1);
