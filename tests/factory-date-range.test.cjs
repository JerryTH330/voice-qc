const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../factory-dashboard/factory-dashboard.js'), 'utf8');
function setup() {
  const context = vm.createContext({});
  vm.runInContext(`
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) { super(...(args.length ? args : [2026, 8, 20, 12])); }
    }
    Date = FixedDate;
    const formatFactoryDateValue = date => date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
    const parseFactoryDateValue = value => value ? new Date(...value.split('-').map((part,index) => Number(part)-(index === 1 ? 1 : 0))) : null;
    const factoryDateState = { activeField: 'startDate', draftStartDate: '', draftEndDate: '' };
    let factoryTimeStartDate = '', factoryTimeEndDate = '', currentTime = '1';
    const renderFactoryDateControl = () => {};
    const applyGlobalFilter = () => {};
  ` + source.slice(source.indexOf('  const shiftFactoryReferenceDate ='), source.indexOf('  const getFactoryRangeInclusiveDays ='))
    + source.slice(source.indexOf('  function applyFactoryDateFilters()'), source.indexOf('  syncFactoryTimeRangeFromQuickFilter(currentTime);'))
    + `;this.api = { getFactoryRangeValues, applyFactoryDateDraft, applyFactoryDateFilters, factoryDateState, applied: () => [factoryTimeStartDate, factoryTimeEndDate] };`, context);
  return context.api;
}
test('shortcuts retain yesterday and inclusive rolling date ranges', () => {
  const api = setup();
  for (const [key,start,end] of [['1','2026-09-19','2026-09-19'], ['7','2026-09-14','2026-09-20'], ['15','2026-09-06','2026-09-20'], ['30','2026-08-22','2026-09-20']]) {
    const range = api.getFactoryRangeValues(key);
    assert.equal(range.startDate,start); assert.equal(range.endDate,end);
  }
});
test('manual range is continuous, ordered and committed only by Apply', () => {
  const api = setup();
  api.applyFactoryDateDraft('startDate','2026-09-10');
  api.applyFactoryDateDraft('endDate','2026-09-18');
  assert.equal(api.applied()[0], '');
  api.applyFactoryDateFilters();
  assert.equal(api.applied().join(','),'2026-09-10,2026-09-18');
  api.applyFactoryDateDraft('endDate','2026-09-05');
  assert.equal(api.factoryDateState.draftStartDate,'2026-09-05');
  assert.equal(api.factoryDateState.draftEndDate,'2026-09-05');
  assert.equal(api.applied().join(','),'2026-09-10,2026-09-18');
});
