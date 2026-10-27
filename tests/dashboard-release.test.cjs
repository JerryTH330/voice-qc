const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const releaseVersion = '20261022-dashboard-filter-release-v1';
const analysisResultVersion = '20261027-global-audit-fixes-v1';
const sessionFilterVersion = '20261027-session-advisor-phone-v1';
const factSources = [
  'leads/organization-data.js',
  'shared/organization-directory.js',
  'device-management/organization-data.js',
  'session/real-recording-data.js',
  'leads/real-lead-data.js',
  'shared/linked-demo-data.js',
  'shared/badge-history-data.js'
];

for (const area of ['session', 'leads', 'store-dashboard', 'sales-dashboard']) {
  test(`${area}: released entry loads complete dashboard dependencies in order`, () => {
    const urls = [];
    const window = {};
    const document = {
      createElement: () => ({}),
      body: { appendChild(script) { urls.push(script.src); script.onload(); } }
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, area, 'page.js'), 'utf8'), {window, document});
    const files = urls.map(url => {
      assert.equal((url.match(/\?/g) || []).length, 1, `invalid cache URL: ${url}`);
      const parsed = new URL(url, 'https://prototype.example/' + area + '/');
      assert(parsed.searchParams.get('v'), `missing cache version: ${url}`);
      const file = path.resolve(root, area, url.split('?')[0]);
      assert(fs.existsSync(file), `missing released dependency: ${path.relative(root, file)}`);
      return path.relative(root, file);
    });
    assert.equal(new Set(files).size, files.length, 'a dependency must load only once');
    const index = file => {
      const value = files.indexOf(file);
      assert(value >= 0, `entry does not load ${file}`);
      return value;
    };
    for (const source of factSources) {
      assert(index(source) < index('shared/unified-data.js'), `${source} must load before shared facts`);
    }
    assert(index('leads/organization-data.js') < index('shared/organization-directory.js'));
    assert(index('shared/organization-directory.js') < index('device-management/organization-data.js'));
    assert(index('shared/unified-data.js') < index('shared/unified-dashboard.js'));
    assert(index('shared/unified-dashboard.js') < index('app-runtime.js'));
    for (const file of ['shared/unified-data.js', 'shared/unified-dashboard.js', 'app-runtime.js']) {
      const moduleVersion = file === 'shared/unified-data.js' ? releaseVersion : analysisResultVersion;
      assert.equal(new URL(urls[index(file)], 'https://prototype.example/').searchParams.get('v'), moduleVersion, file);
    }
    const html = fs.readFileSync(path.join(root, area, 'index.html'), 'utf8');
    const entry = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(match => match[1]).find(url => url.split('?')[0] === './page.js');
    assert(entry, 'index must reference its own page bootstrap');
    assert.equal(new URL(entry, 'https://prototype.example/').searchParams.get('v'), area === 'session' ? sessionFilterVersion : analysisResultVersion);
    if (area === 'session') {
      assert.equal(new URL(urls[index('session/session-real-runtime.js')], 'https://prototype.example/').searchParams.get('v'), sessionFilterVersion);
    }
  });
}

test('released shared modules are present and parse as scripts', () => {
  for (const file of ['shared/unified-data.js', 'shared/unified-dashboard.js']) {
    assert(fs.statSync(path.join(root, file)).isFile(), `release omits ${file}`);
    new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), {filename: file});
  }
});
