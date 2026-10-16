/*
 * Actions: sessions, QR check-in and attendance
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* sessions and attendance */
function sessionClash(cl,date,start,end,exceptId){
  var tutorIds=S.classrooms.filter(function(c){return c.tutorId===cl.tutorId}).map(function(c){return c.id});
  var tu=TUT(cl.tutorId);
  if(tu&&tu.unavailability.some(function(u){return u.date===date}))return 'The tutor is unavailable on '+fmtD(date)+'.';
  var x=S.sessions.filter(function(s){return s.id!==exceptId&&tutorIds.indexOf(s.classroomId)>-1&&s.date===date&&s.status!=='cancelled'&&overlap(mins(s.start),mins(s.end),mins(start),mins(end))>0})[0];
  return x?'The tutor already has "'+x.topic+'" at an overlapping time on that date.':'';
}
A.addSession=function(f){
  var c=CLS(+val(f,'classroomId')),o=myOrg();
  if(!c||c.orgId!==o.id||(!has('admin')&&c.tutorId!==ME().id)){toast('You can only schedule sessions for your own classrooms.');return}
  var d=val(f,'date'),st=val(f,'start'),en=val(f,'end');
  if(mins(en)<=mins(st)){toast('The end time must be after the start time.');return}
  var msg=sessionClash(c,d,st,en,0);if(msg){toast(msg);return}
  S.sessions.push({id:nid(),classroomId:c.id,topic:val(f,'topic'),date:d,start:st,end:en,venue:c.mode==='online'?'Online (link shared by the tutor)':'Branch: '+c.branch,status:'scheduled',qrOpen:false,code:''});
  S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).forEach(function(e){notify(e.learnerId,'New session in '+c.title+': '+val(f,'topic')+' on '+fmtD(d)+', '+t12(st)+'.')});
  render();toast('Session scheduled. Learners were notified.');
};
function mySess(id){var s=SESS(id);return s&&canSess(s)?s:null}
A.reschedule=function(el){
  var s=mySess(+el.dataset.id);if(!s)return;var c=CLS(s.classroomId);
  openModal('Reschedule session','<div class="field"><label for="rsD">Date</label><input id="rsD" name="date" type="date" value="'+s.date+'" required></div><div class="grid2"><div class="field"><label for="rsS">Start</label><input id="rsS" name="start" type="time" value="'+s.start+'" required></div><div class="field"><label for="rsE">End</label><input id="rsE" name="end" type="time" value="'+s.end+'" required></div></div>','Save',function(f){
    var d=val(f,'date'),st=val(f,'start'),en=val(f,'end');
    if(mins(en)<=mins(st)){toast('The end time must be after the start time.');return false}
    var msg=sessionClash(c,d,st,en,s.id);if(msg){toast(msg);return false}
    s.date=d;s.start=st;s.end=en;s.status='rescheduled';
    S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).forEach(function(e){notify(e.learnerId,'Session moved: '+s.topic+' is now '+fmtD(d)+', '+t12(st)+'.')});
    render();toast('Session rescheduled. Learners were notified.');
  });
};
A.cancelSession=function(el){var s=mySess(+el.dataset.id);if(!s)return;var c=CLS(s.classroomId);confirmBox('Cancel this session?','"'+s.topic+'" on '+fmtD(s.date)+' will be cancelled and learners are notified.','Cancel session',function(){s.status='cancelled';s.qrOpen=false;S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).forEach(function(e){notify(e.learnerId,'Session cancelled: '+s.topic+' on '+fmtD(s.date)+'.')});render();toast('Session cancelled.')})};
A.completeSession=function(el){
  var s=mySess(+el.dataset.id);if(!s)return;var c=CLS(s.classroomId);
  confirmBox('Mark this session complete?','Record attendance first if you have not. Learners can then give feedback.','Mark complete',function(){s.status='completed';s.qrOpen=false;S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).forEach(function(e){notify(e.learnerId,'Feedback is open for '+c.title+': '+s.topic+'.')});render();toast('Session completed.')});
};
A.openCheckin=function(el){
  var s=mySess(+el.dataset.id);if(!s)return;
  s.qrOpen=true;s.code=randCode();render();
  openInfo('Check-in is open','<p class="muted">Learners scan this code, then you confirm each person as Present, Late, Absent or Excused.</p>'+qrHtml(BASE+'/checkin/'+s.code)+'<p class="code">'+s.code+'</p><p class="note">Close check-in when the check-in period is over.</p>');
};
A.closeCheckin=function(el){var s=mySess(+el.dataset.id);if(!s)return;s.qrOpen=false;render();toast('Check-in closed.')};
A.attendance=function(el){
  var s=mySess(+el.dataset.id);if(!s)return;var c=CLS(s.classroomId),ppl=people(c);
  if(!ppl.length){openInfo('Attendance','<p class="muted">No learners are enrolled yet.</p>');return}
  var body=ppl.map(function(p){
    var a=S.attendance.filter(function(x){return x.sessionId===s.id&&x.key===p.key})[0],cur=a&&['present','late','absent','excused'].indexOf(a.status)>-1?a.status:(a&&a.checkedIn?'present':'');
    return '<div class="field"><label for="at_'+p.key+'">'+esc(p.name)+(a&&a.checkedIn?' · checked in '+esc(fmtTs(a.checkedIn)):'')+'</label><select id="at_'+p.key+'" name="a_'+p.key+'">'+opts([['','Not marked'],['present','Present'],['late','Late'],['absent','Absent'],['excused','Excused']],cur)+'</select></div>';
  }).join('');
  openModal('Attendance: '+s.topic,body+'<p class="note">'+(c.attendance==='qr'?'A QR scan is not final proof. Your choice here is what counts.':'Attended = Present + Late.')+'</p>','Save attendance',function(f){
    ppl.forEach(function(p){
      var v=val(f,'a_'+p.key),a=S.attendance.filter(function(x){return x.sessionId===s.id&&x.key===p.key})[0];
      if(a){a.status=v||(a.checkedIn?'checked-in':'')}else if(v)S.attendance.push({id:nid(),sessionId:s.id,key:p.key,checkedIn:null,status:v});
    });
    render();toast('Attendance saved.');
  });
};

