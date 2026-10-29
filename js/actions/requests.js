/*
 * Actions: approve, place, reject or cancel matching requests
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* matching requests (administrator) */
function myReq(id){var r=S.requests.filter(function(x){return x.id===id})[0],o=myOrg();return r&&o&&r.orgId===o.id?r:null}
function approveInto(r,classId){
  var o=myOrg(),sel=classId?{type:'classroom',id:classId}:r.selected;
  if(!sel){toast('Choose a classroom for this request first.');return false}
  var who=reqLabel(r);
  if(sel.type==='classroom'){
    var c=CLS(sel.id);
    if(!c||c.orgId!==o.id){toast('That classroom is not in your organisation.');return false}
    if(c.status!=='open'){toast('Open the classroom before approving requests into it.');return false}
    if(enrolled(c)>=c.capacity){toast('This classroom is full. Raise its capacity or remove a learner first.');return false}
    if(r.learnerId){
      if(S.enrolments.some(function(e){return e.classroomId===c.id&&e.learnerId===r.learnerId&&e.status==='active'})){toast('That learner is already in this classroom.');return false}
      S.enrolments.push({id:nid(),classroomId:c.id,learnerId:r.learnerId,status:'active'});
    }else{
      var g=S.guests.filter(function(x){return x.id===r.guestRegId})[0];
      if(g){g.classroomId=c.id;g.status='confirmed'}else{var ng={id:nid(),orgId:o.id,classroomId:c.id,name:r.guest.name,contact:r.guest.contact,ref:'',status:'confirmed'};ng.ref=guestRef(S.guests.length+1);S.guests.push(ng);r.guestRegId=ng.id}
    }
    r.selected={type:'classroom',id:c.id};
    if(r.learnerId)notify(r.learnerId,'Your placement in '+c.title+' was approved.');
  }else{
    var tu=TUT(sel.id);
    if(!tu||tu.orgId!==o.id||tu.status!=='active'||!MEM(tu.userId)){toast('That tutor is not available.');return false}
    var w=r.selected.window||{day:tu.availability[0]&&tu.availability[0].day,start:'10:00',end:'11:30'};
    if(!freeWindows(tu).some(function(x){return x.day===w.day&&x.s<=mins(w.start)&&x.e>=mins(w.end)})){toast('The tutor is no longer free at that time. Place the learner in another classroom or ask the tutor to update availability.');return false}
    var ex=tu.expertise.filter(function(x){return x.subjectId===r.prefs.subjectId})[0];
    var cl={id:nid(),orgId:o.id,title:r.prefs.level+' '+subName(r.prefs.subjectId)+' with '+U(sel.id).name+' (one-to-one)',subjectId:r.prefs.subjectId,topicId:r.selected.topicId||(ex?ex.topicId:0),level:r.prefs.level,tutorId:sel.id,mode:r.prefs.mode!=='either'&&tu.modes.indexOf(r.prefs.mode)>-1?r.prefs.mode:tu.modes[0],branch:tu.branch,capacity:1,arrangement:'one-to-one',access:'account',approval:'admin',attendance:'manual',status:'open',day:w.day,start:w.start,end:w.end};
    S.classrooms.push(cl);S.enrolments.push({id:nid(),classroomId:cl.id,learnerId:r.learnerId,status:'active'});
    r.selected={type:'classroom',id:cl.id};
    notify(r.learnerId,'Your one-to-one classroom with '+U(sel.id).name+' was created.');notify(sel.id,'A new one-to-one classroom was created for you: '+cl.title+'.');
  }
  r.status='Approved';r.note='';render();toast('Approved. '+who+' is now enrolled.');return true;
}
A.approveReq=function(el){var r=myReq(+el.dataset.id);if(r)approveInto(r,0)};
A.placeReq=function(el){
  var r=myReq(+el.dataset.id),o=myOrg();if(!r)return;
  var list=oClassrooms(o.id).filter(function(c){return c.status==='open'&&seatsLeft(c)>0});
  if(!list.length){toast('No open classroom has a free seat.');return}
  openModal('Place '+reqLabel(r),'<div class="field"><label for="plC">Classroom</label><select id="plC" name="classId">'+opts(list.map(function(c){return [c.id,c.title+' ('+seatsLeft(c)+' seats left)']}),r.selected&&r.selected.type==='classroom'?r.selected.id:'')+'</select></div><p class="note">The learner is notified of the classroom you choose.</p>','Approve into this class',function(f){return approveInto(r,+val(f,'classId'))});
};
A.rejectReq=function(el){var r=myReq(+el.dataset.id);if(!r)return;openModal('Reject request from '+reqLabel(r),'<div class="field"><label for="rjN">Reason (shown to the learner)</label><textarea id="rjN" name="note" rows="3"></textarea></div>','Reject',function(f){r.status='Rejected';r.note=val(f,'note');if(r.learnerId)notify(r.learnerId,'Your request was not approved.'+(r.note?' '+r.note:''));var g=S.guests.filter(function(x){return x.id===r.guestRegId})[0];if(g)g.status='cancelled';render();toast('Request rejected.')})};
A.unmatchReq=function(el){var r=myReq(+el.dataset.id);if(!r)return;confirmBox('Mark as unmatched?','Use this when nothing suitable is available. You can contact the learner or place them later.','Mark unmatched',function(){r.status='Unmatched';if(r.learnerId)notify(r.learnerId,'We could not find a suitable option yet. The organisation may contact you.');render();toast('Marked as unmatched.')})};
A.reqDetails=function(el){
  var r=myReq(+el.dataset.id);if(!r)return;
  var internal='';
  if(r.selected){var rec=recommend(r.orgId,r.prefs).filter(function(x){return x.type===r.selected.type&&x.id===r.selected.id})[0];if(rec)internal='<dt>Match label</dt><dd>'+esc(rec.label)+' <span class="muted">(internal score '+rec.score+' of 100, visible to admins only)</span></dd>'}
  openInfo('Request details','<dl class="kv"><dt>Learner</dt><dd>'+esc(reqLabel(r))+'</dd>'+(r.guest?'<dt>Contact</dt><dd>'+esc(r.guest.contact)+'</dd>':'')+'<dt>Preference</dt><dd>'+esc(prefsText(r.prefs))+'</dd><dt>Selected</dt><dd>'+esc(selText(r))+'</dd>'+internal+'<dt>Status</dt><dd>'+statusPill(r.status)+'</dd>'+(r.note?'<dt>Note</dt><dd>'+esc(r.note)+'</dd>':'')+'<dt>Created</dt><dd>'+esc(fmtTs(r.createdAt))+'</dd></dl>');
};
A.cancelReq=function(el){
  var u=ME(),r=S.requests.filter(function(x){return x.id===+el.dataset.id&&x.learnerId===u.id})[0];if(!r)return;
  confirmBox('Cancel this request?','The organisation will no longer review it.','Cancel request',function(){r.status='Cancelled';var g=S.guests.filter(function(x){return x.id===r.guestRegId})[0];if(g)g.status='cancelled';notifyAdmins(r.orgId,u.name+' cancelled a matching request.');render();toast('Request cancelled.')});
};

