const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const palette = require('../shared/chart-palette.js');
const topics = require('../客户洞察/v2/simplified/demo-topics.js');

test('category colors survive a reordered subset and reserve one slot per unique tag', () => {
  const names = topics.online.need.topics.map(topic => topic.name);
  const colors = palette.categoryMap([...names, ...names, '新标签']);
  assert.deepEqual(['动力强', '空间大', '省油/省电'].map(name => colors.get(name)), [
    '#55B2F2', '#2563EB', '#38BDA5'
  ]);
  assert.equal(colors.size, 13);
  assert.equal(new Set(colors.values()).size, 13);
  assert.equal(colors.has('新标签'), false);
  const shorter = palette.categoryMap(['空间大', '空间大', '动力强']);
  assert.equal(shorter.get('动力强'), colors.get('动力强'));
});

test('the portable color card and the written specification match the shared palette', () => {
  const dir = path.join(__dirname, '../docs/design');
  const card = fs.readFileSync(path.join(dir, 'chart-palette.html'), 'utf8');
  const guide = fs.readFileSync(path.join(dir, 'chart-palette.md'), 'utf8');
  const portable = JSON.parse(card.match(/<script type="application\/json" id="palette-data">([\s\S]*?)<\/script>/)[1]);
  const { sequence, categories, cohortB, reference, other } = palette;
  assert.deepEqual(portable, { sequence, categories, cohortB, reference, other });
  for (const color of [...sequence, ...categories]) {
    assert.ok(guide.includes(color.code) && guide.includes(color.hex), color.code);
  }
  for (const color of [cohortB, reference, other]) assert.ok(guide.includes(color), color);
});
