const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {setup}=require('./helpers/unified-dom.cjs');
const source=fs.readFileSync(path.join(__dirname,'../device-management/page.js'),'utf8');
function harness(){
 const h=setup('store'),d=h.window.AIQCData;h.controller.destroy();
 Object.assign(h.c,{badgeDetailRecords:d.badges,badgeEventRecords:d.badgeEvents,badgeUploadRecords:d.badgeUploads,badgeRecordState:{sn:''},badgeEventFilterState:{sn:'',date:'',type:'all'},badgeEventTypeOptions:[['all','全部事件']],getBadgeExportTimestamp:()=> 'test'});
 for(const name of ['getBadgeEventRecord','getCurrentBadgeUploadRecords','getBadgeRecordProfile','getBadgeUploadMatchTime','getBadgeExportCellValue','getVisibleEventExportRows','badgeEventTimeToSeconds','formatBadgeDurationSeconds','buildBadgeEventGroups','matchesBadgeEventGroupType','formatBadgeEventDuration','getDeviceListExportRequest']){
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
