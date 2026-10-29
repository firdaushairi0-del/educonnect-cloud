/*
 * Tutor pages: my classrooms, profile and availability, feedback
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- tutor ---------- */
function myClassrooms(){var u=ME();return S.classrooms.filter(function(c){return c.tutorId===u.id&&c.orgId===myOrg().id&&['archived','cancelled'].indexOf(c.status)===-1})}
function viewTutorHome(){
  var u=ME(),cls=myClassrooms(),td=iso(today()),ids=cls.map(function(c){return c.id});
  var ss=S.sessions.filter(function(s){return ids.indexOf(s.classroomId)>-1}),up=ss.filter(function(s){return s.status==='scheduled'&&s.date>=td}).sort(sessSort),done=ss.filter(function(s){return s.status==='completed'});
  var hours=0;done.forEach(function(s){hours+=(mins(s.end)-mins(s.start))/60});
  var lr={};S.enrolments.forEach(function(e){if(e.status==='active'&&ids.indexOf(e.classroomId)>-1)lr[e.learnerId]=1});
  return head(has('admin')?'My teaching':'My classrooms','Classrooms assigned to you by '+esc(myOrg().name))+
    '<div class="stats"><div class="stat"><b class="num">'+cls.length+'</b><span>Assigned classrooms</span></div><div class="stat"><b class="num">'+Object.keys(lr).length+'</b><span>Active learners</span></div><div class="stat"><b class="num">'+up.length+'</b><span>Upcoming sessions</span></div><div class="stat"><b class="num">'+hrs(hours)+'</b><span>Completed teaching hours</span></div></div>'+
    (cls.length?'<div class="cards">'+cls.map(function(c){var l=enrolled(c);return '<article class="cc '+tone(c.subjectId)+'"><div class="top"><span class="eyebrow">'+esc(c.level)+'</span><h3>'+esc(c.title)+'</h3></div><div class="bot"><span>'+esc(slotText(c.day,c.start,c.end))+'</span><span class="muted">'+esc(c.mode+(c.mode==='physical'?' · '+c.branch:''))+'</span><div class="seats"><span class="num">'+l+' of '+c.capacity+'</span><div class="bar"><span style="width:'+(l/c.capacity*100)+'%"></span></div></div><div class="ec-row">'+statusPill(cstatus(c))+btn('classPeople',c.id,'Learners')+'</div></div></article>'}).join('')+'</div>':'<div class="empty"><p>No classrooms are assigned to you yet.</p></div>')+
    '<div class="ec-row sb"><h2>Upcoming sessions</h2><button class="ec-btn ghost sm" data-act="go" data-view="sessions">'+(has('admin')?'Manage sessions':'Open sessions')+'</button></div>'+
    tbl(['Date','Classroom','Topic','Where'],up.slice(0,6).map(function(s){return '<tr><td class="num">'+esc(fmtD(s.date))+', '+t12(s.start)+'</td><td>'+esc(CLS(s.classroomId).title)+'</td><td>'+esc(s.topic)+'</td><td>'+esc(s.venue)+'</td></tr>'}),'No upcoming sessions.');
}
function viewProfile(){
  var o=myOrg(),t=TUT(ME().id);
  if(!t)return head('My tutor profile','')+'<div class="empty"><p>Your tutor profile has not been created yet.</p></div>';
  return head('My tutor profile','Your expertise and when you are free. The organisation uses this to place learners.',btn('editProfile','0','Edit modes and branch','ghost'))+
    '<dl class="kv ec-card"><dt>Modes</dt><dd>'+esc(t.modes.join(' and '))+'</dd><dt>Branch</dt><dd>'+esc(t.branch)+'</dd><dt>Status</dt><dd>'+statusPill(t.status)+'</dd></dl>'+
    '<div class="stack"><div class="ec-row sb"><h2>Expertise</h2>'+btn('addExpertise','0','Add expertise','btn')+'</div>'+tbl(['Subject','Topic','Levels',''],t.expertise.map(function(x){return '<tr><td><b>'+esc(subName(x.subjectId))+'</b></td><td>'+esc(topName(x.topicId))+'</td><td>'+esc(x.levels.join(', '))+'</td><td class="act">'+btn('delExpertise',x.id,'Remove')+'</td></tr>'}),'No expertise added yet.')+'</div>'+
    '<div class="stack"><div class="ec-row sb"><h2>Weekly availability</h2>'+btn('addAvail','0','Add time','btn')+'</div>'+tbl(['Day','From','Until',''],t.availability.slice().sort(function(a,b){return DAYS.indexOf(a.day)-DAYS.indexOf(b.day)}).map(function(a){return '<tr><td>'+DAYFULL[a.day]+'</td><td class="num">'+t12(a.start)+'</td><td class="num">'+t12(a.end)+'</td><td class="act">'+btn('delAvail',a.id,'Remove')+'</td></tr>'}),'No availability added yet.')+'</div>'+
    '<div class="stack"><div class="ec-row sb"><h2>Unavailable dates</h2>'+btn('addUnavail','0','Block a date','btn')+'</div>'+tbl(['Date','Reason',''],t.unavailability.slice().sort(function(a,b){return a.date.localeCompare(b.date)}).map(function(a){return '<tr><td>'+esc(fmtD(a.date))+'</td><td>'+esc(a.reason||'')+'</td><td class="act">'+btn('delUnavail',a.id,'Remove')+'</td></tr>'}),'No blocked dates.')+'</div>';
}
function viewFeedback(){
  var u=ME(),ids=S.classrooms.filter(function(c){return c.tutorId===u.id}).map(function(c){return c.id});
  var sids=S.sessions.filter(function(s){return ids.indexOf(s.classroomId)>-1}).map(function(s){return s.id});
  var f=S.feedback.filter(function(x){return sids.indexOf(x.sessionId)>-1});
  var avg=function(k){return f.length?(f.reduce(function(a,x){return a+x[k]},0)/f.length).toFixed(1):'None'};
  var yes=f.length?Math.round(f.filter(function(x){return x.again}).length/f.length*100)+'%':'None';
  return head('Feedback received','Private feedback for sessions you taught. Only you and your organisation administrator see it.')+
    '<div class="stats"><div class="stat"><b class="num">'+avg('q1')+'</b><span>Matched learner needs</span></div><div class="stat"><b class="num">'+avg('q2')+'</b><span>Explanation was clear</span></div><div class="stat"><b class="num">'+avg('q3')+'</b><span>Well organised</span></div><div class="stat"><b class="num">'+yes+'</b><span>Would attend another session</span></div></div>'+
    tbl(['Session','Needs','Clear','Organised','Another?','Comment'],f.map(function(x){var s=SESS(x.sessionId);return '<tr><td>'+esc(CLS(s.classroomId).title)+'<br><span class="muted">'+esc(s.topic)+' · '+esc(fmtD(s.date))+'</span></td><td class="num">'+x.q1+'</td><td class="num">'+x.q2+'</td><td class="num">'+x.q3+'</td><td>'+(x.again?'Yes':'No')+'</td><td>'+esc(x.comment||'')+'</td></tr>'}),'No feedback yet.')+
    '<p class="note">Learners are not named here. Feedback is never shared publicly or ranked.</p>';
}

