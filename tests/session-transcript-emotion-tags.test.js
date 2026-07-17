const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'session', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');

const emotions = [
  ['neutral', '平静'],
  ['surprised', '惊讶'],
  ['sad', '低落'],
  ['angry', '愤怒'],
  ['happy', '愉悦']
];

test('every transcript sentence renders an emotion tag in its header', () => {
  assert.equal((html.match(/class="bubble (?:sales|customer) transcript-bubble"/g) || []).length, 10);
  assert.equal((html.match(/class="transcript-emotion-tag"/g) || []).length, 10);
  assert.equal((html.match(/data-emotion="(?:neutral|surprised|sad|angry|happy)"/g) || []).length, 10);
});

test('transcript emotion tags support all five model results with Chinese labels', () => {
  emotions.forEach(([emotion, label]) => {
    assert.ok(html.includes(`data-emotion="${emotion}"`));
    assert.ok(html.includes(`aria-label="情感：${label}"`));
    assert.match(css, new RegExp(`\\.transcript-emotion-tag\\[data-emotion="${emotion}"\\]\\s*{`));
  });
});

test('emotion tag sits on the right side of the transcript header', () => {
  assert.match(css, /\.transcript-emotion-tag\s*{[\s\S]*?margin-left:\s*auto;/);
});
