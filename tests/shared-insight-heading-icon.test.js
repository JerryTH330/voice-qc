const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const leadsHtml = fs.readFileSync(path.join(root, 'leads/index.html'), 'utf8');
const leadsCss = fs.readFileSync(path.join(root, 'leads/page.css'), 'utf8');
const storeHtml = fs.readFileSync(path.join(root, 'store-dashboard/index.html'), 'utf8');
const storeCss = fs.readFileSync(path.join(root, 'store-dashboard/page.css'), 'utf8');
const factorySource = fs.readFileSync(path.join(root, 'factory-dashboard/factory-dashboard.js'), 'utf8');
const factoryCss = fs.readFileSync(path.join(root, 'factory-dashboard/factory-dashboard.css'), 'utf8');

const standardAsset = '../assets/lead-customer-insight-figma-533-8804.png';

test('customer and quality overview headings reuse the lead detail insight icon', () => {
  assert.match(leadsHtml, new RegExp(`customer-insight-avatar[\\s\\S]*?${standardAsset.replaceAll('.', '\\.')}`));
  assert.match(storeHtml, new RegExp(`sop-overview-heading-image[^>]*src="${standardAsset.replaceAll('.', '\\.')}"`));
  assert.match(factorySource, new RegExp(`sop-overview-heading-image[^>]*src="${standardAsset.replaceAll('.', '\\.')}"`));
});

test('all three heading icons use the lead detail 56px viewport and 78px crop', () => {
  assert.match(leadsCss, /\.customer-insight-avatar\s*{[\s\S]*?width:\s*56px;[\s\S]*?height:\s*56px;[\s\S]*?overflow:\s*hidden;/);
  assert.match(leadsCss, /\.customer-insight-avatar > img\s*{[\s\S]*?top:\s*-11px;[\s\S]*?left:\s*-11px;[\s\S]*?width:\s*78px;[\s\S]*?height:\s*78px;/);
  assert.match(storeCss, /\.sop-overview-heading-image\s*{[\s\S]*?top:\s*-11px;[\s\S]*?left:\s*-11px;[\s\S]*?width:\s*78px;[\s\S]*?height:\s*78px;/);
  assert.match(factoryCss, /#panel-sop-execution \.sop-overview-heading-image\s*{[\s\S]*?top:\s*-11px;[\s\S]*?left:\s*-11px;[\s\S]*?width:\s*78px;[\s\S]*?height:\s*78px;/);
});
