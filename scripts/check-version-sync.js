#!/usr/bin/env node
// 检查 page.js assetVersion 和 tests/*.test.js 硬编码 version 是否一致。
// 退出码：0=一致，1=不一致（同步失败）
//
// 用法：node scripts/check-version-sync.js

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function findAllPageJsFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAllPageJsFiles(p, results);
    } else if (entry.name === 'page.js') {
      results.push(p);
    }
  }
  return results;
}

function findAllAssetFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAllAssetFiles(p, results);
    } else if (entry.name === 'page.js' || entry.name === 'index.html') {
      results.push(p);
    }
  }
  return results;
}

function extractPageJsVersions() {
  const versions = new Set();
  const reInPageJs = /const\s+(?:asset)?[Vv]ersion\s*=\s*['"]([^'"]+)['"]/g;
  const reInAnyFile = /[?&]v=([0-9]{8,}[\w-]*)/g;
  for (const file of findAllAssetFiles(root)) {
    const text = fs.readFileSync(file, 'utf8');
    if (file.endsWith('page.js')) {
      let m;
      while ((m = reInPageJs.exec(text))) {
        versions.add(m[1]);
      }
    }
    let m;
    while ((m = reInAnyFile.exec(text))) {
      versions.add(m[1]);
    }
  }
  return versions;
}

function findTestVersions(text) {
  // 匹配引号内**包含** 20\d{6,} 开头的 version 字符串
  // 例如 'page.css?v=20260804-foo' 或 '20260805-bar'
  // 用一个 capture group 提取前缀+version，再用 \1 反向引用，再额外 capture version 部分
  const re = /(['"])((?:[^'"]{0,200}?)?(20\d{6,}[\w-]*))\1/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text))) {
    out.add(m[3]);
  }
  return out;
}

const allowedVersions = extractPageJsVersions();
if (allowedVersions.size === 0) {
  console.error('No page.js version found.');
  process.exit(1);
}

const testDir = path.join(root, 'tests');
const testFiles = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js'));

let totalStale = 0;
const staleFiles = [];
for (const f of testFiles) {
  const p = path.join(testDir, f);
  const text = fs.readFileSync(p, 'utf8');
  const found = findTestVersions(text);
  const stale = [...found].filter((v) => !allowedVersions.has(v));
  if (stale.length > 0) {
    staleFiles.push({ f, stale });
    totalStale += stale.length;
  }
}

if (staleFiles.length === 0) {
  console.log(`✓ All test file versions are in sync with page.js (${[...allowedVersions].join(', ')}).`);
  process.exit(0);
}

console.error(`✗ Found ${totalStale} stale version string(s) in ${staleFiles.length} test file(s):`);
for (const { f, stale } of staleFiles) {
  console.error(`  ${f}: ${stale.join(', ')}`);
}
console.error(`\nRun: node scripts/sync-versions.js`);
process.exit(1);
