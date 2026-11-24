const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {setup}=require('./helpers/unified-dom.cjs');
const source=fs.readFileSync(path.join(__dirname,'../device-management/page.js'),'utf8');
function harness(){
 const h=setup('store'),d=h.window.AIQCData;h.controller.destroy();
 Object.assign(h.c,{badgeDetailRecords:d.badges,badgeEventRecords:d.badgeEvents,badgeUploadRecords:d.badgeUploads,badgeRecordState:{sn:''},badgeEventFilterState:{sn:'',date:'',type:'all'},badgeUploadFilterState:{startDate:'',endDate:''},badgeEventTypeOptions:[['all','全部事件']],getBadgeExportTimestamp:()=> 'test'});
 for(const name of ['getBadgeEventRecord','getBadgeEventRecords','getCurrentBadgeUploadRecords','getBadgeRecordProfile','getBadgeUploadMatchTime','getBadgeExportCellValue','getVisibleEventExportRows','badgeEventTimeToSeconds','formatBadgeDurationSeconds','buildBadgeEventGroups','matchesBadgeEventGroupType','formatBadgeEventDuration','formatStoreDateDisplay','formatDeviceDateRange','getBadgeUploadDates','getBadgeUploadDateRange','shiftBadgeUploadDate','getCompletedBadgeUploadRecords','getBadgeUploadCompletedDate','isWithinDateTimeRange','getDeviceListExportRequest']){
  const start=source.indexOf('function '+name+'(');assert(start>=0,name);vm.runInContext(source.slice(start,source.indexOf('\n}\n',start)+2),h.c);
 }
 return h;
}
test('missing badge history returns empty records without generating uploads or events',()=>{
 const h=harness(),d=h.window.AIQCData,b=d.badges.find(b=>!d.badgeEvents.some(e=>e.sn===b.sn)&&!d.badgeUploads.some(u=>u.sn===b.sn));assert(b);
 h.c.badgeRecordState.sn=b.sn;assert.equal(h.c.getBadgeEventRecord(b.sn,b.queryDate),null);assert.equal(h.c.getCurrentBadgeUploadRecords().length,0);
 assert.match(h.c.getBadgeRecordProfile().advisorName,/历史人员关联缺失/);
});
test('original historical names and unresolved upload matches survive display and export',()=>{
 const h=harness(),d=h.window.AIQCData,event=d.badgeEvents.find(e=>!e.linkedDemo);
 Object.assign(h.c.badgeRecordState,{sn:event.sn});Object.assign(h.c.badgeEventFilterState,{sn:event.sn,date:event.date});
 const profile=h.c.getBadgeRecordProfile();assert(profile.advisorName.startsWith(event.employeeName));assert.match(profile.advisorName,/历史人员关联缺失/);
 const request=h.c.getDeviceListExportRequest('events');assert(request.rows.length>0);assert(request.rows.every(r=>r.at(-1).includes('历史人员关联缺失')));
 const upload=d.badgeUploads.find(u=>!u.linkedDemo);assert.match(h.c.getBadgeUploadMatchTime(upload),/关联缺失/);
 const b=d.badges.find(b=>b.pendingAssociationMissing);assert(b);assert.match(h.c.getBadgeExportCellValue(b,{key:'pendingUploads'}),/关联缺失/);
});

test('all-time badge event exports span the selected SN history and keep an explicit day exact', () => {
 const h = harness();
 const events = h.window.AIQCData.badgeEvents;
 const event = events.find(candidate => events.some(other => other.sn === candidate.sn && other.date !== candidate.date));
 assert(event);
 h.c.badgeEventFilterState.sn = event.sn;
 const request = h.c.getDeviceListExportRequest('events');
 assert.equal(request.filters.find(filter => filter.label === '查询日期').value, '全部时间');
 assert(new Set(request.rows.map(row => row[0])).size > 1);
 assert(request.rows.every(row => row[1] === event.sn));
 h.c.badgeEventFilterState.date = event.date;
 const day = h.c.getDeviceListExportRequest('events');
 assert(day.rows.length > 0);
 assert(day.rows.every(row => row[0] === event.date && row[1] === event.sn));
});

test('upload export uses each data day across history and fills zeroes inside an applied range', () => {
 const h = harness();
 const sn = 'test-sn';
 h.c.badgeRecordState.sn = sn;
 h.c.badgeUploadRecords = [
   { sn, status: '已上传', completedAt: '2026-02-01 10:00:00' },
   { sn, status: '已上传', completedAt: '2026-10-11 10:00:00' },
   { sn, status: '未上传', completedAt: '未上传' },
   { sn: 'other-sn', status: '已上传', completedAt: '2026-10-10 10:00:00' }
 ];
 const history = h.c.getDeviceListExportRequest('uploads');
 assert.equal(history.filters.find(filter => filter.label === '上传日期').value, '全部时间');
 assert.deepEqual(Array.from(history.rows, row => Array.from(row)), [['2026-10-11', 1], ['2026-02-01', 1]]);
 Object.assign(h.c.badgeUploadFilterState, { startDate: '2026-10-10', endDate: '2026-10-11' });
 const applied = h.c.getDeviceListExportRequest('uploads');
 assert.deepEqual(Array.from(applied.rows, row => Array.from(row)), [['2026-10-11', 1], ['2026-10-10', 0]]);
});
