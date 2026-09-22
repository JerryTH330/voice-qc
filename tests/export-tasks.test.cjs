const test = require('node:test');
const assert = require('node:assert/strict');
const { createService } = require('../shared/export-tasks.js');
const xlsx = require('../device-management/xlsx-export-utils.js');
function fixture() {
  let tasks = [], time = Date.parse('2026-09-22T00:00:00Z');
  const store = { update: async fn => { const draft = structuredClone(tasks); const result = fn(draft); tasks = draft; return structuredClone(result); } };
  const make = (userId = 'alice', buildFile = xlsx.createXlsxBytes) => createService({ store, userId, now: () => time, buildFile });
  return { make, advance: ms => { time += ms; } };
}
const request = () => ({ source: 'leads', filename: '线索列表.xlsx', sheetName: '线索列表', filters: [{ label: '品牌', value: '埃安' }], columns: [{ label: '客户名称' }], rows: [['张*'], ['李*']] });
test('submitted content is fixed and task survives service recreation', async () => {
  const f = fixture(), service = f.make(), input = request();
  const task = await service.submit(input);
  input.rows[0][0] = 'changed'; input.columns[0].label = 'changed';
  const saved = await f.make().get(task.id);
  assert.equal(saved.status, 'queued');
  assert.equal(saved.recordCount, 2);
  assert.deepEqual(saved.columns, [{ label: '客户名称' }]);
  assert.deepEqual(saved.filters, [{ label: '品牌', value: '埃安' }]);
});
test('task produces a real workbook without downloading and expires seven days after success', async () => {
  const f = fixture(), service = f.make(), input = request();
  const task = await service.submit(input);
  input.rows[0][0] = 'changed';
  await assert.rejects(service.download(task.id));
  f.advance(1000); await service.advance();
  assert.equal((await service.get(task.id)).status, 'running');
  f.advance(4000); await service.advance();
  const result = await service.download(task.id);
  assert.equal(result.bytes[0], 80); assert.equal(result.bytes[1], 75);
  const xml = new TextDecoder().decode(result.bytes);
  assert.ok(xml.includes('张*')); assert.ok(!xml.includes('changed'));
  assert.equal((await service.get(task.id)).status, 'completed');
  f.advance(604799999);
  assert.ok((await f.make().download(task.id)).bytes.length > 0);
  f.advance(1);
  await assert.rejects(service.download(task.id), /过期|下载/);
  assert.equal((await service.get(task.id)).status, 'expired');
});
test('ownership applies to reads, downloads and deletion; pending tasks cannot be deleted', async () => {
  const f = fixture(), alice = f.make(), bob = f.make('bob');
  const task = await alice.submit(request());
  assert.deepEqual(await bob.list(), []);
  await assert.rejects(bob.get(task.id), /无权/);
  await assert.rejects(bob.download(task.id), /无权/);
  await assert.rejects(bob.remove(task.id), /无权/);
  await assert.rejects(alice.remove(task.id), /进行中/);
  f.advance(1000); await alice.advance();
  await assert.rejects(alice.remove(task.id), /进行中/);
  f.advance(4000); await alice.advance();
  assert.equal((await alice.takeNotices()).length, 1);
  assert.equal((await f.make().takeNotices()).length, 0);
  await alice.remove(task.id);
  assert.deepEqual(await f.make().list(), []);
  await assert.rejects(alice.download(task.id), /不存在/);
});
test('generation failure has a reason and may be deleted or replaced by a new request', async () => {
  const f = fixture(), service = f.make('alice', () => { throw new Error('演示：文件生成失败'); });
  const task = await service.submit(request());
  f.advance(1000); await service.advance(); f.advance(4000); await service.advance();
  const failed = await service.get(task.id);
  assert.equal(failed.status, 'failed'); assert.equal(failed.error, '演示：文件生成失败');
  assert.equal(failed.completedAt, null); assert.equal(failed.expiresAt, null);
  await assert.rejects(service.download(task.id));
  const next = await service.submit(request());
  assert.notEqual(next.id, task.id); assert.equal((await service.get(task.id)).status, 'failed');
  await service.remove(task.id); assert.equal((await service.list()).length, 1);
});
test('empty requests are rejected; expired tasks can be removed after recreation', async () => {
  const f = fixture(), service = f.make();
  await assert.rejects(service.submit({ ...request(), rows: [] }));
  await assert.rejects(service.submit({ ...request(), columns: [] }));
  const task = await service.submit(request());
  f.advance(1000); await service.advance(); f.advance(4000); await service.advance();
  f.advance(604800000); await f.make().remove(task.id);
  assert.deepEqual(await service.list(), []);
});
