const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const releaseVersion = '20261028-full-sync-v1';
const areas = ['session', 'leads', 'store-dashboard', 'factory-dashboard', 'sales-dashboard'];

function cacheVersion(url) {
  const parsed = new URL(url, 'https://prototype.example/');
  assert.equal((url.match(/\?/g) || []).length, 1, `invalid cache URL: ${url}`);
  const versions = parsed.searchParams.getAll('v');
  assert.equal(versions.length, 1, `cache version must appear once: ${url}`);
  assert(versions[0].trim(), `missing cache version: ${url}`);
  return versions[0];
}

function bootstrap(area) {
  const urls = [];
  const document = {
    createElement: () => ({}),
    body: { appendChild(script) { urls.push(script.src); script.onload(); } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, area, 'page.js'), 'utf8'), {window: {}, document});
  const files = urls.map(url => {
    cacheVersion(url);
    const file = path.resolve(root, area, url.split('?')[0]);
    assert(fs.existsSync(file), `missing dependency: ${file}`);
    return path.relative(root, file);
  });
  assert.equal(new Set(files).size, files.length, 'dependencies must load only once');
  const at = file => {
    const index = files.indexOf(file);
    assert(index >= 0, `entry does not load ${file}`);
    return index;
  };
  return {at, files, version: file => cacheVersion(urls[at(file)])};
}

for (const area of areas) {
  test(`${area}: actual bootstrap loads its required modules before runtime, with valid cache URLs`, () => {
    const {at, files, version} = bootstrap(area);
    const unified = files.includes('shared/unified-data.js');
    assert(unified, `${area} must load shared facts`);
    if (unified) {
      assert(at('leads/organization-data.js') < at('shared/organization-directory.js'));
      assert(at('shared/organization-directory.js') < at('device-management/organization-data.js'));
      for (const dependency of ['session/real-recording-data.js', 'leads/real-lead-data.js', 'shared/linked-demo-data.js', 'shared/badge-history-data.js']) {
        assert(at(dependency) < at('shared/unified-data.js'), `${dependency} must load before shared facts`);
      }
      assert(at('shared/unified-data.js') < at('shared/unified-dashboard.js'));
      assert(at('shared/unified-dashboard.js') < at('app-runtime.js'));
      if (['store-dashboard', 'factory-dashboard', 'sales-dashboard'].includes(area)) {
        assert(at('store-dashboard/organization-filter.js') < at('shared/unified-dashboard.js'));
      }
    } else {
      const legacy = ['dashboard-filter-utils.js', 'date-filter-component-utils.js', 'factory-multi-select-filter-utils.js', 'factory-dashboard/factory-hero-utils.js', 'factory-dashboard/issue-rule-analysis-utils.js', 'shared/issue-rule-list.js', 'device-management/organization-data.js', 'shared/organization-directory.js', 'session/real-recording-data.js', 'factory-dashboard/organization-filter.js', 'factory-dashboard/factory-dashboard.js', 'app-runtime.js'];
      legacy.forEach((file, index) => {
        at(file);
        if (index) assert(at(legacy[index - 1]) < at(file), `${legacy[index - 1]} must load before ${file}`);
      });
    }
    if (area === 'leads') assert(at('app-runtime.js') < at('leads/leads-modern-runtime.js'));

    const html = fs.readFileSync(path.join(root, area, 'index.html'), 'utf8');
    const entry = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
      .map(match => match[1]).find(url => url.split('?')[0] === './page.js');
    assert(entry, 'index must reference its own page bootstrap');
    assert.equal(cacheVersion(entry), version('app-runtime.js'), 'page bootstrap and runtime must share the current fix version');
    if ((area === 'factory-dashboard' && unified) || area === 'sales-dashboard') {
      const organizationCss = html.indexOf('../store-dashboard/organization-filter.css');
      const dashboardCss = html.indexOf('../shared/dashboard-filters.css');
      assert(organizationCss >= 0 && dashboardCss >= 0, 'dashboard filter styles must be present');
      assert(organizationCss < dashboardCss);
    }
  });
}

test('entries in the shared dashboard release use consistent cache versions for the same modules', () => {
  const entries = areas.map(bootstrap);
  for (const file of ['shared/linked-demo-data.js', 'shared/badge-history-data.js', 'shared/unified-data.js', 'shared/unified-dashboard.js', 'app-runtime.js']) {
    assert.equal(new Set(entries.map(entry => entry.version(file))).size, 1, `inconsistent cache versions: ${file}`);
  }
  const allEntries = areas.map(bootstrap);
  assert.equal(new Set(allEntries.map(entry => entry.version('app-runtime.js'))).size, 1, 'inconsistent app runtime cache versions');
  const unifiedEntries = allEntries.filter(entry => entry.files.includes('shared/unified-dashboard.js'));
  assert.equal(new Set(unifiedEntries.map(entry => entry.version('shared/unified-dashboard.js'))).size, 1, 'inconsistent dashboard runtime cache versions');
});

test('device entry preserves its original dependencies and versions its current page runtime', () => {
  const html = fs.readFileSync(path.join(root, 'device-management/index.html'), 'utf8');
  const urls = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]).filter(url => !url.startsWith('http'));
  const files = urls.map(url => {
    cacheVersion(url);
    const file = path.resolve(root, 'device-management', url.split('?')[0]);
    assert(fs.existsSync(file));
    return path.relative(root, file);
  });
  assert.equal(new Set(files).size, files.length, 'device dependencies must load only once');
  const index = name => {
    const value = files.indexOf(name);
    assert(value >= 0, `device entry does not load ${name}`);
    return value;
  };
  const legacy = ['shared/list-header-actions.js', 'shared/list-summary-counters.js', 'unified-navigation-shell.js', 'date-filter-component-utils.js', 'leads/organization-data.js', 'shared/organization-directory.js', 'device-management/organization-data.js', 'shared/linked-demo-data.js', 'device-management/visit-organization-filter.js', 'device-management/visit-field-settings.js', 'device-management/visit-import-demo.js', 'device-management/store-field-settings.js', 'device-management/matching-field-settings.js', 'device-management/xlsx-export-utils.js', 'shared/field-settings-interactions.js', 'shared/dimension-switcher.js', 'device-management/page.js', 'fixed-action-column.js'];
  legacy.forEach((file, position) => {
    index(file);
    if (position) assert(index(legacy[position - 1]) < index(file), `${legacy[position - 1]} must load before ${file}`);
  });
  if (files.includes('shared/unified-data.js')) {
    for (const dependency of ['session/real-recording-data.js', 'leads/real-lead-data.js', 'shared/linked-demo-data.js', 'shared/badge-history-data.js']) {
      assert(index(dependency) < index('shared/unified-data.js'));
    }
    assert(index('shared/unified-data.js') < index('device-management/page.js'));
  }
  assert.equal(cacheVersion(urls[index('device-management/page.js')]), releaseVersion, 'device page must use the current fix version');
});
