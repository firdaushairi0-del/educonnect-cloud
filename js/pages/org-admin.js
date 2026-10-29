/*
 * Organisation administrator: requests, classrooms, sessions, members, subjects, profile
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- organisation administrator ---------- */
function viewRequests(){
  var o=myOrg(),q=F('mq','').toLowerCase(),st=F('ms','all');
  var list=S.requests.filter(function(r){return r.orgId===o.id&&(st==='all'||r.status===st)&&(!q||reqLabel(r).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return b.createdAt.localeCompare(a.createdAt)});
  return head('Matching requests','Review what learners chose. Tutorbit recommends, you decide.')+
    '<div class="filters">'+finput('mq','Search by learner')+fselect('ms','Status',[['all','All statuses'],['Pending Approval','Pending Approval'],['Approved','Approved'],['Rejected','Rejected'],['Cancelled','Cancelled'],['Unmatched','Unmatched']])+'</div>'+
    tbl(['Learner','Preference','Selected option','Date','Status',''],list.map(function(r){
      var a=btn('reqDetails',r.id,'Details');
      if(r.status==='Pending Approval')a=btn('approveReq',r.id,'Approve','btn')+btn('placeReq',r.id,'Other class')+btn('rejectReq',r.id,'Reject')+btn('unmatchReq',r.id,'Unmatched')+a;
      else if(r.status==='Unmatched')a=btn('placeReq',r.id,'Place in class')+a;
      return '<tr><td><b>'+esc(reqLabel(r))+'</b></td><td>'+esc(prefsText(r.prefs))+'</td><td>'+esc(selText(r))+'</td><td class="num">'+esc(fmtDay(r.createdAt))+'</td><td>'+statusPill(r.status)+'</td><td class="act">'+a+'</td></tr>';
    }),'No requests match.');
}
function viewClassrooms(){
  var o=myOrg(),q=F('cq','').toLowerCase(),st=F('cs','all'),sj=F('cj','all');
  var list=oClassrooms(o.id).filter(function(c){return (st==='all'||cstatus(c)===st)&&(sj==='all'||c.subjectId===+sj)&&(!q||(c.title+' '+U(c.tutorId).name+' '+c.branch).toLowerCase().indexOf(q)>-1)});
  return head('Classrooms','One-to-one and group arrangements',btn('addClass','0','Add classroom','btn'))+
    '<div class="filters">'+finput('cq','Search title, tutor or branch')+fselect('cs','Status',[['all','All statuses'],['draft','Draft'],['open','Open'],['full','Full'],['closed','Closed'],['completed','Completed'],['cancelled','Cancelled'],['archived','Archived']])+fselect('cj','Subject',[['all','All subjects']].concat(oSubjects(o.id).map(function(s){return [s.id,s.name]})))+'</div>'+
    tbl(['Classroom','Tutor','Schedule','Mode','Seats','Status',''],list.map(function(c){
      var l=enrolled(c),pend=S.requests.filter(function(r){return r.status==='Pending Approval'&&r.selected&&r.selected.type==='classroom'&&r.selected.id===c.id}).length;
      var qa='';
      if(c.status==='open')qa=btn('setClassStatus',c.id,'Close',null,' data-s="closed"');else if(c.status==='draft')qa=btn('setClassStatus',c.id,'Open',null,' data-s="open"');else if(c.status==='closed')qa=btn('setClassStatus',c.id,'Reopen',null,' data-s="open"');
      var del=(c.status==='draft'&&!S.enrolments.some(function(e){return e.classroomId===c.id})&&!S.sessions.some(function(s){return s.classroomId===c.id}))?btn('delClass',c.id,'Delete'):'';
      return '<tr><td><b>'+esc(c.title)+'</b><br><span class="muted">'+esc(subName(c.subjectId)+' › '+topName(c.topicId)+' · '+c.level)+'</span><br>'+pill(c.arrangement)+' '+pill(c.access==='guest'?'guests allowed':'account required')+'</td><td>'+esc(U(c.tutorId).name)+'</td><td>'+esc(slotText(c.day,c.start,c.end))+'</td><td>'+esc(c.mode+(c.mode==='physical'?' · '+c.branch:''))+'</td><td class="num">'+l+' of '+c.capacity+(pend?'<br><span class="muted">'+pend+' pending</span>':'')+'</td><td>'+statusPill(cstatus(c))+'</td><td class="act">'+btn('classPeople',c.id,'People')+btn('editClass',c.id,'Edit')+qa+btn('archiveClass',c.id,'Archive')+del+'</td></tr>';
    }),'No classrooms match.');
}
function sessionList(){
  var o=myOrg(),u=ME(),all=orgSessions(o.id);
  if(!has('admin'))all=all.filter(function(s){return CLS(s.classroomId).tutorId===u.id});
  return all;
}
function canSess(s){var c=CLS(s.classroomId),o=myOrg();return c&&o&&c.orgId===o.id&&(has('admin')||(has('tutor')&&c.tutorId===ME().id))}
function viewSessions(){
  var o=myOrg(),u=ME(),cf=F('sc','all'),st=F('ss','all');
  var cls=oClassrooms(o.id).filter(function(c){return has('admin')||c.tutorId===u.id});
  var list=sessionList().filter(function(s){return (cf==='all'||s.classroomId===+cf)&&(st==='all'||s.status===st)}).sort(sessSort);
  var form=cls.length?'<form class="ec-card stack" data-submit="addSession" style="gap:12px"><h3>Schedule a session</h3><div class="grid2"><div class="field"><label for="sCl">Classroom</label><select id="sCl" name="classroomId">'+opts(cls.filter(function(c){return ['open','draft','closed'].indexOf(c.status)>-1}).map(function(c){return [c.id,c.title]}),'')+'</select></div><div class="field"><label for="sTop">Session topic</label><input id="sTop" name="topic" required></div></div><div class="grid2"><div class="field"><label for="sDate">Date</label><input id="sDate" name="date" type="date" required></div><div class="field"><label for="sSt">Start</label><input id="sSt" name="start" type="time" value="14:00" required></div><div class="field"><label for="sEn">End</label><input id="sEn" name="end" type="time" value="16:00" required></div><button class="ec-btn" type="submit">Schedule</button></div></form>':'';
  return head('Sessions',has('admin')?'All sessions in your organisation':'Sessions in the classrooms assigned to you')+form+
    '<div class="filters">'+fselect('sc','Classroom',[['all','All classrooms']].concat(cls.map(function(c){return [c.id,c.title]})))+fselect('ss','Status',[['all','All statuses'],['scheduled','Scheduled'],['completed','Completed'],['rescheduled','Rescheduled'],['cancelled','Cancelled']])+'</div>'+
    tbl(['Date and time','Classroom','Topic','Where','Status',''],list.map(function(s){
      var c=CLS(s.classroomId),a='';
      if(s.status==='scheduled'||s.status==='rescheduled'){
        if(c.attendance==='qr')a+=s.qrOpen?btn('closeCheckin',s.id,'Close check-in'):btn('openCheckin',s.id,'Open check-in');
        a+=btn('attendance',s.id,'Attendance')+btn('completeSession',s.id,'Mark complete')+btn('reschedule',s.id,'Reschedule')+btn('cancelSession',s.id,'Cancel');
      }else if(s.status==='completed')a=btn('attendance',s.id,'Attendance');
      return '<tr><td class="num">'+esc(fmtD(s.date))+'<br><span class="muted">'+t12(s.start)+' to '+t12(s.end)+'</span></td><td>'+esc(c.title)+'<br><span class="muted">'+esc(c.attendance==='qr'?'QR check-in with tutor check':'Manual attendance')+'</span></td><td>'+esc(s.topic)+'</td><td>'+esc(s.venue)+(s.qrOpen?'<br>'+pill('Check-in open','info'):'')+'</td><td>'+statusPill(s.status)+'</td><td class="act">'+a+'</td></tr>';
    }),'No sessions match.');
}
function viewMembers(){
  var o=myOrg(),q=F('bq','').toLowerCase(),st=F('bs','all');
  var list=S.memberships.filter(function(m){return m.orgId===o.id&&(st==='all'||m.status===st)&&(!q||U(m.userId).name.toLowerCase().indexOf(q)>-1)});
  return head('Members','Administrators and tutors in '+esc(o.name),btn('inviteMember','0','Invite a member','btn'))+
    '<div class="ec-card ec-row sb"><div><h3>Organisation code</h3><p class="muted">Tutors can join with this code. You approve each request.</p></div><b class="code" style="font-size:1.4rem">'+orgCode(o)+'</b></div>'+
    '<div class="filters">'+finput('bq','Search by name')+fselect('bs','Status',[['all','All statuses'],['pending','Pending'],['active','Active'],['suspended','Suspended'],['inactive','Removed']])+'</div>'+
    tbl(['Member','Roles','Status',''],list.map(function(m){
      var u=U(m.userId),a='';
      if(m.status==='pending')a=btn('memApprove',m.id,'Approve','btn')+btn('memReject',m.id,'Reject');
      else if(m.status==='active'){a=btn('memRoles',m.id,'Roles');if(m.userId!==ME().id)a+=btn('memSuspend',m.id,'Suspend')+btn('memRemove',m.id,'Remove')}
      else a=btn('memReactivate',m.id,'Reactivate');
      return '<tr><td><b>'+esc(u.name)+'</b><br><span class="muted">'+esc(u.email)+'</span></td><td style="text-transform:capitalize">'+esc(m.roles.join(' + '))+'</td><td>'+statusPill(m.status==='inactive'?'inactive':m.status)+'</td><td class="act">'+a+'</td></tr>';
    }),'No members match.');
}
function viewSubjects(){
  var o=myOrg(),q=F('uq','').toLowerCase();
  var subs=oSubjects(o.id).filter(function(s){return !q||s.name.toLowerCase().indexOf(q)>-1||S.topics.some(function(t){return t.subjectId===s.id&&t.orgId===o.id&&t.name.toLowerCase().indexOf(q)>-1})});
  var inactive=S.subjects.filter(function(s){return !s.active&&(s.orgId===o.id)});
  return head('Subjects and topics','Master subjects plus your own private ones. Topics belong to your organisation.','<div class="ec-row">'+btn('addOrgSubject','0','Add private subject','ghost')+btn('addTopic','0','Add topic','btn')+'</div>')+
    '<div class="filters">'+finput('uq','Search subjects or topics')+'</div>'+
    tbl(['Subject','Topics',''],subs.map(function(s){
      var tp=S.topics.filter(function(t){return t.subjectId===s.id&&t.orgId===o.id});
      return '<tr><td><b>'+esc(s.name)+'</b><br>'+pill(s.orgId===null?'master':'private',s.orgId===null?'':'info')+'</td><td>'+(tp.length?tp.map(function(t){return '<span style="display:inline-flex;align-items:center;gap:2px;margin:2px 8px 2px 0">'+(t.active?'':'<s>')+esc(t.name)+(t.active?'':'</s>')+btn('renameTopic',t.id,'Edit')+btn('toggleTopic',t.id,t.active?'Deactivate':'Activate')+'</span>'}).join(''):'<span class="muted">No topics yet</span>')+'</td><td class="act">'+(s.orgId===o.id?btn('renameSubject',s.id,'Rename')+btn('toggleSubject',s.id,'Deactivate'):'')+'</td></tr>';
    }),'No subjects match.')+
    (inactive.length?'<p class="note">Deactivated private subjects: '+inactive.map(function(s){return esc(s.name)+' '+btn('toggleSubject',s.id,'Activate')}).join(', ')+'</p>':'');
}
function viewOrg(){
  var o=myOrg(),link=BASE+'/o/'+o.slug+'/match';
  return head('Organisation','Profile shown on your learner page, and your QR code')+
    '<div class="choices"><form class="ec-card stack" data-submit="saveOrg"><h3>Profile</h3><div class="field"><label for="oName">Name</label><input id="oName" name="name" value="'+esc(o.name)+'" required></div><div class="field"><label for="oDesc">Short introduction</label><textarea id="oDesc" name="desc" rows="3">'+esc(o.desc)+'</textarea></div><div class="field"><label for="oLoc">General location</label><input id="oLoc" name="location" value="'+esc(o.location)+'" required></div><div class="field"><label for="oCon">Public contact</label><input id="oCon" name="contact" value="'+esc(o.contact)+'" required></div><div class="field"><label for="oBr">Branches (comma separated)</label><input id="oBr" name="branches" value="'+esc(o.branches.join(', '))+'" required></div><div class="checks"><label><input type="checkbox" name="modePhysical"'+(o.modes.indexOf('physical')>-1?' checked':'')+'> Physical</label><label><input type="checkbox" name="modeOnline"'+(o.modes.indexOf('online')>-1?' checked':'')+'> Online</label></div><button class="ec-btn" type="submit">Save profile</button></form>'+
    '<div class="ec-card stack"><h3>Learner QR code</h3><p class="muted">Print this on posters or share the link. It opens a form that only searches your organisation.</p>'+qrHtml(link)+'<p class="route">'+esc(link)+'</p><div class="ec-row"><button class="ec-btn" data-act="openOrg" data-slug="'+esc(o.slug)+'">Open learner page</button></div><p class="note">The link shows your workspace only. The server still checks the organisation on every request.</p></div></div>';
}

