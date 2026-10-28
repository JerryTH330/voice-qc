#!/usr/bin/env node
// 同步 page.js assetVersion 到所有 .test.js / .test.cjs 硬编码 version。
// 用法：node scripts/sync-versions.js [--dry-run]
//
// 行为：
// 1. 扫描 3 个 page.js 提取所有 version（const version / const assetVersion）
// 2. 扫描 tests/*.test.{js,cjs} 中所有类似 version 的字符串（'20\d+...'）
// 3. 把不在 page.js 当前 version 集合里的，替换为 page.js 的 version（取第一个）
//
// 退出码：0=成功，1=找不到任何 page.js version

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// 扫描所有 page.js，提取 version
function findAllPageJsFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'output', 'test-results', 'playwright-report'].includes(entry.name) || entry.name.startsWith('.')) continue;
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
    if (['node_modules', 'output', 'test-results', 'playwright-report'].includes(entry.name) || entry.name.startsWith('.')) continue;
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
    // 1) page.js 里的 const version / assetVersion
    if (file.endsWith('page.js')) {
      let m;
      while ((m = reInPageJs.exec(text))) {
        versions.add(m[1]);
      }
    }
    // 2) 所有 page.js / index.html 里的 ?v=... 或 &v=...
    let m;
    while ((m = reInAnyFile.exec(text))) {
      versions.add(m[1]);
    }
  }
  return versions;
}

function findTestVersions(text) {
  // 仅识别资源 URL 或 Version 常量，保留业务 ID、时间戳和存储迁移版本。
  const re = /(?:(?:const|let)\s+\w*[Vv]ersion\s*=\s*['"]|[?&]v=)(20\d{6}[\w-]*)/g;
  return new Set([...text.matchAll(re)].map(match => match[1]));
}

function syncFile(file, targetVersion, allowedVersions) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /((?:const|let)\s+\w*[Vv]ersion\s*=\s*['"]|[?&]v=)(20\d{6}[\w-]*)/g;
  let count = 0;
  const updated = text.replace(re, (whole, prefix, version) => {
    if (allowedVersions.has(version)) return whole;
    count++;
    return prefix + targetVersion;
  });
  if (count === 0) return 0;
  if (!dryRun) {
    fs.writeFileSync(file, updated);
  }
  return count;
}

const allowedVersions = extractPageJsVersions();
if (allowedVersions.size === 0) {
  console.error('No page.js version found.');
  process.exit(1);
}
const targetVersion = [...allowedVersions][0];
console.log(`Target version: ${targetVersion}`);
console.log(`All allowed versions: ${[...allowedVersions].join(', ')}`);
if (dryRun) console.log('(dry run — no files will be modified)');

const testDir = path.join(root, 'tests');
const testFiles = fs.readdirSync(testDir).filter((f) => /\.test\.(?:js|cjs)$/.test(f));

let totalFiles = 0;
let totalReplacements = 0;
for (const f of testFiles) {
  const p = path.join(testDir, f);
  const text = fs.readFileSync(p, 'utf8');
  const found = findTestVersions(text);
  // 只报告"含硬编码 version 且不在允许集合里"的文件
  const hasStale = [...found].some((v) => !allowedVersions.has(v));
  if (!hasStale) continue;
  const count = syncFile(p, targetVersion, allowedVersions);
  if (count > 0) {
    console.log(`  ${f}: ${count} replacement(s)${dryRun ? ' (dry run)' : ''}`);
    totalFiles++;
    totalReplacements += count;
  }
}

console.log(`\nTotal: ${totalFiles} test file(s) updated, ${totalReplacements} replacement(s).`);
