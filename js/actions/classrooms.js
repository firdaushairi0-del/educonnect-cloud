/*
 * Actions: classroom create, edit, archive and people
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* classrooms */
function classForm(c){
  var o=myOrg();c=c||{title:'',topicId:oTopics(o.id)[0]?oTopics(o.id)[0].id:0,level:'Form 4',tutorId:0,mode:o.modes[0],branch:o.branches[0],capacity:6,arrangement:'group',access:'account',approval:'admin',attendance:'manual',status:'open',day:'Sat',start:'14:00',end:'16:00'};
  var tutors=oTutors(o.id).filter(function(t){return t.status==='active'&&MEM(t.userId)});
  return '<div class="field"><label for="clT">Title</label><input id="clT" name="title" value="'+esc(c.title)+'" required></div>'+
    '<div class="grid2"><div class="field"><label for="clTop">Topic</label><select id="clTop" name="topicId">'+topicOpts(o.id,c.topicId,false)+'</select></div><div class="field"><label for="clL">Level</label><select id="clL" name="level">'+levelOpts(c.level)+'</select></div></div>'+
    '<div class="grid2"><div class="field"><label for="clU">Assigned tutor</label><select id="clU" name="tutorId">'+opts(tutors.map(function(t){return [t.userId,U(t.userId).name]}),c.tutorId)+'</select></div><div class="field"><label for="clA">Arrangement</label><select id="clA" name="arrangement">'+opts([['group','Group'],['one-to-one','One-to-one']],c.arrangement)+'</select></div></div>'+
    '<div class="grid2"><div class="field"><label for="clM">Mode</label><select id="clM" name="mode">'+opts(o.modes.map(function(m){return [m,m]}),c.mode)+'</select></div><div class="field"><label for="clB">Branch</label><select id="clB" name="branch">'+opts(o.branches.map(function(b){return [b,b]}),c.branch)+'</select></div></div>'+
    '<div class="grid2"><div class="field"><label for="clD">Day</label><select id="clD" name="day">'+dayOpts(c.day)+'</select></div><div class="field"><label for="clS">Start</label><input id="clS" name="start" type="time" value="'+c.start+'" required></div><div class="field"><label for="clE">End</label><input id="clE" name="end" type="time" value="'+c.end+'" required></div></div>'+
    '<div class="grid2"><div class="field"><label for="clC">Maximum capacity</label><input id="clC" name="capacity" type="number" min="1" max="200" value="'+c.capacity+'" required></div><div class="field"><label for="clX">Registration access</label><select id="clX" name="access">'+opts([['account','Account required'],['guest','Guests allowed']],c.access)+'</select></div></div>'+
    '<div class="grid2"><div class="field"><label for="clP">Approval</label><select id="clP" name="approval">'+opts([['admin','Administrator approval'],['automatic','Automatic confirmation']],c.approval)+'</select></div><div class="field"><label for="clAt">Attendance</label><select id="clAt" name="attendance">'+opts([['manual','Manual'],['qr','QR check-in with tutor verification']],c.attendance)+'</select></div></div>'+
    '<div class="field"><label for="clSt">Status</label><select id="clSt" name="status">'+opts([['draft','Draft'],['open','Open'],['closed','Closed'],['completed','Completed'],['cancelled','Cancelled'],['archived','Archived']],c.status==='full'?'open':c.status)+'</select></div>';
}
function readClass(f,existing){
  var o=myOrg(),t=TOP(+val(f,'topicId'));
  if(!t){toast('Add a topic first under Subjects and topics.');return null}
  var d={title:val(f,'title'),subjectId:t.subjectId,topicId:t.id,level:val(f,'level'),tutorId:+val(f,'tutorId'),mode:val(f,'mode'),branch:val(f,'branch'),capacity:+val(f,'capacity'),arrangement:val(f,'arrangement'),access:val(f,'access'),approval:val(f,'approval'),attendance:val(f,'attendance'),status:val(f,'status'),day:val(f,'day'),start:val(f,'start'),end:val(f,'end')};
  if(!d.tutorId){toast('Assign a tutor first. Approve a tutor under Members.');return null}
  if(mins(d.end)<=mins(d.start)){toast('The end time must be after the start time.');return null}
  if(d.arrangement==='one-to-one')d.capacity=1;
  if(!(d.capacity>=1)){toast('Capacity must be at least 1.');return null}
  if(existing&&d.capacity<enrolled(existing)){toast('Capacity cannot be lower than the '+enrolled(existing)+' learners already confirmed.');return null}
  var clash=S.classrooms.filter(function(c){return c.id!==(existing?existing.id:0)&&c.tutorId===d.tutorId&&(c.status==='open'||c.status==='draft')&&c.day===d.day&&overlap(mins(c.start),mins(c.end),mins(d.start),mins(d.end))>0})[0];
  if(clash&&(d.status==='open'||d.status==='draft')){toast('That tutor already teaches "'+clash.title+'" at an overlapping time.');return null}
  return d;
}
A.addClass=function(){
  var o=myOrg();
  if(!oTopics(o.id).length){toast('Add a topic first under Subjects and topics.');return}
  openModal('Add classroom',classForm(),'Add classroom',function(f){var d=readClass(f,null);if(!d)return false;d.id=nid();d.orgId=o.id;S.classrooms.push(d);render();toast('Classroom added.')});
};
A.editClass=function(el){
  var c=CLS(+el.dataset.id),o=myOrg();if(!c||c.orgId!==o.id)return;
  openModal('Edit classroom',classForm(c),'Save',function(f){var d=readClass(f,c);if(!d)return false;for(var k in d)c[k]=d[k];render();toast('Classroom updated.')});
};
A.setClassStatus=function(el){var c=CLS(+el.dataset.id),o=myOrg();if(!c||c.orgId!==o.id)return;c.status=el.dataset.s;render();toast(c.title+' is now '+c.status+'.')};
A.archiveClass=function(el){
  var c=CLS(+el.dataset.id),o=myOrg();if(!c||c.orgId!==o.id)return;
  var up=S.sessions.filter(function(s){return s.classroomId===c.id&&(s.status==='scheduled'||s.status==='rescheduled')});
  confirmBox('Archive '+c.title+'?',up.length?'Its '+up.length+' upcoming session'+(up.length===1?' is':'s are')+' cancelled and learners are notified. History and reports are kept.':'History and reports are kept. It will no longer be matched.','Archive',function(){
    up.forEach(function(s){s.status='cancelled';s.qrOpen=false});
    S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).forEach(function(e){notify(e.learnerId,c.title+' has been archived and upcoming sessions were cancelled.')});
    c.status='archived';render();toast('Classroom archived.');
  });
};
A.delClass=function(el){var c=CLS(+el.dataset.id),o=myOrg();if(!c||c.orgId!==o.id||c.status!=='draft')return;confirmBox('Delete '+c.title+'?','Only unused drafts can be deleted. Everything else is archived instead.','Delete',function(){S.classrooms=S.classrooms.filter(function(x){return x.id!==c.id});render();toast('Draft deleted.')})};
A.classPeople=function(el){
  var c=CLS(+el.dataset.id),o=myOrg();if(!c||!o||c.orgId!==o.id)return;
  if(!has('admin')&&c.tutorId!==ME().id)return;
  var en=S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}),gs=S.guests.filter(function(g){return g.classroomId===c.id&&g.status==='confirmed'});
  var rows=en.map(function(e){return '<div class="ec-row sb"><span>'+esc(U(e.learnerId).name)+'</span>'+(has('admin')?btn('removeEnrol',e.id,'Remove'):'')+'</div>'}).concat(gs.map(function(g){return '<div class="ec-row sb"><span>'+esc(g.name)+' <span class="muted">(guest · '+esc(g.ref)+')</span></span>'+(has('admin')?btn('removeGuest',g.id,'Remove'):'')+'</div>'}));
  openInfo(c.title,'<p class="muted">'+enrolled(c)+' of '+c.capacity+' seats used · tutor '+esc(U(c.tutorId).name)+'</p>'+(rows.length?rows.join(''):'<p class="muted">No learners enrolled yet.</p>'));
};
A.removeEnrol=function(el){var e=S.enrolments.filter(function(x){return x.id===+el.dataset.id})[0],c=e&&CLS(e.classroomId),o=myOrg();if(!e||c.orgId!==o.id)return;e.status='removed';notify(e.learnerId,'You were removed from '+c.title+'.');closeModal();render();toast('Learner removed. The seat is free again.')};
A.removeGuest=function(el){var g=S.guests.filter(function(x){return x.id===+el.dataset.id})[0],o=myOrg();if(!g||g.orgId!==o.id)return;g.status='cancelled';closeModal();render();toast('Guest removed.')};

