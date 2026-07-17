const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'session', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'voice-qc-admin.css'), 'utf8');

test('session detail highlights only the text inside the two evidence quotes', () => {
  assert.ok(html.includes('“<strong class="session-ai-evidence-alert">先刷完再说</strong>”'));
  assert.ok(html.includes('“<strong class="session-ai-evidence-alert">再考虑一下</strong>”'));
  assert.equal(html.includes('<strong class="session-ai-evidence-alert">“先刷完再说”</strong>'), false);
  assert.equal(html.includes('<strong class="session-ai-evidence-alert">“再考虑一下”</strong>'), false);
});

test('session detail evidence emphasis is bold and red', () => {
  assert.match(
    css,
    /\.session-ai-intention-row \.session-ai-evidence-alert\s*{[\s\S]*?color:\s*#dc2626;[\s\S]*?font-weight:\s*700;/
  );
});
