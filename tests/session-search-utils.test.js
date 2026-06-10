const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SESSION_SEARCH_FIELDS,
  SESSION_SOURCE_OPTIONS,
  createDefaultSessionSearchQueries,
  getSessionSourceFromStage,
  normalizeSessionSearchValue,
  getActiveSessionSearchQueries,
  doesSessionRecordMatchSearch
} = require('../session-search-utils.js');

test('session search field list keeps the five visible search boxes in order', () => {
  assert.deepEqual(
    SESSION_SEARCH_FIELDS.map((field) => field.label),
    ['顾问ID', '顾问姓名', '顾问号码', '客户姓名', '客户号码']
  );
});

test('session source options keep the segmented filter labels in order', () => {
  assert.deepEqual(SESSION_SOURCE_OPTIONS, ['全部', '云外呼', '工牌']);
});

test('createDefaultSessionSearchQueries returns empty values for every search field', () => {
  assert.deepEqual(createDefaultSessionSearchQueries(), {
    advisorId: '',
    advisorName: '',
    advisorPhone: '',
    customerName: '',
    customerPhone: ''
  });
});

test('normalizeSessionSearchValue strips punctuation by field type', () => {
  assert.equal(normalizeSessionSearchValue(' ADV-10027 ', 'advisorId'), 'adv10027');
  assert.equal(normalizeSessionSearchValue(' 李 凯 ', 'advisorName'), '李凯');
  assert.equal(normalizeSessionSearchValue(' 138-0013 8000 ', 'advisorPhone'), '13800138000');
  assert.equal(normalizeSessionSearchValue(' 周 伟 ', 'customerName'), '周伟');
});

test('getActiveSessionSearchQueries only keeps non-empty normalized queries', () => {
  assert.deepEqual(
    getActiveSessionSearchQueries({
      advisorId: 'ADV-1002',
      advisorName: ' 李 凯 ',
      advisorPhone: '138 0013',
      customerName: ' 周伟 ',
      customerPhone: ''
    }),
    {
      advisorId: 'adv1002',
      advisorName: '李凯',
      advisorPhone: '1380013',
      customerName: '周伟'
    }
  );
});

test('doesSessionRecordMatchSearch returns true when every filled search box matches', () => {
  const record = {
    advisorId: 'ADV-10027',
    advisorName: '李凯',
    advisorPhone: '138-0013-8000',
    customerPhone: '13900001111',
    customerName: '周伟'
  };

  assert.equal(
    doesSessionRecordMatchSearch(record, {
      advisorId: '10027',
      advisorName: '李 凯',
      advisorPhone: '1380013',
      customerName: '周 伟'
    }),
    true
  );
});

test('doesSessionRecordMatchSearch returns false when any filled search box does not match', () => {
  const record = {
    advisorId: 'ADV-10027',
    advisorName: '李凯',
    advisorPhone: '13800138000',
    customerPhone: '13900001111',
    customerName: '周伟'
  };

  assert.equal(
    doesSessionRecordMatchSearch(record, {
      advisorName: '王敏',
      advisorPhone: '1380013',
      customerPhone: '188',
      customerName: '周伟'
    }),
    false
  );
});

test('getSessionSourceFromStage maps session stages to visible source labels', () => {
  assert.equal(getSessionSourceFromStage('邀约'), '云外呼');
  assert.equal(getSessionSourceFromStage('试驾PDC'), '云外呼');
  assert.equal(getSessionSourceFromStage('到店接待'), '工牌');
  assert.equal(getSessionSourceFromStage('试驾'), '工牌');
  assert.equal(getSessionSourceFromStage('未知阶段'), '-');
});
