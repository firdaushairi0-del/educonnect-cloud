/*
 * Platform administrator: dashboard, organisations, master subjects, statistics helpers
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- statistics ---------- */
function orgSessions(orgId){var ids=oClassrooms(orgId).map(function(c){return c.id});return S.sessions.filter(function(s){return ids.indexOf(s.classroomId)>-1})}
function attStats(sessions){
  var ids=sessions.filter(function(s){return s.status==='completed'}).map(function(s){return s.id});
  var rec=S.attendance.filter(function(a){return ids.indexOf(a.sessionId)>-1&&['present','late','absent','excused'].indexOf(a.status)>-1});
  var c={present:0,late:0,absent:0,excused:0};rec.forEach(function(a){c[a.status]++});
  var att=c.present+c.late;
  return {sched:sessions.filter(function(s){return s.status==='scheduled'}).length,done:ids.length,present:c.present,late:c.late,absent:c.absent,excused:c.excused,expected:rec.length,rate:rec.length?Math.round(att/rec.length*100):null};
}
function avgFeedback(sessions){
  var ids=sessions.map(function(s){return s.id}),f=S.feedback.filter(function(x){return ids.indexOf(x.sessionId)>-1});
  if(!f.length)return null;
  var t=0;f.forEach(function(x){t+=(x.q1+x.q2+x.q3)/3});return t/f.length;
}
function activeLearners(orgId){
  var ids=oClassrooms(orgId).map(function(c){return c.id}),set={};
  S.enrolments.forEach(function(e){if(e.status==='active'&&ids.indexOf(e.classroomId)>-1)set[e.learnerId]=1});
  return Object.keys(set).length;
}
function reqLabel(r){return r.learnerId?U(r.learnerId).name:(r.guest?r.guest.name+' (guest)':'Unknown')}
function selText(r){if(!r.selected)return 'None found';return r.selected.type==='classroom'?(CLS(r.selected.id)?CLS(r.selected.id).title:'Removed classroom'):'One-to-one with '+(U(r.selected.id)?U(r.selected.id).name:'tutor')}
function bar(label,n,max,suffix){return '<div class="bar-row"><span>'+esc(label)+'</span><div class="bar"><span style="width:'+(max?n/max*100:0)+'%"></span></div><b class="num">'+n+(suffix||'')+'</b></div>'}

/* ---------- platform administrator ---------- */
function viewDashboard(){
  if(has('platform')){
    var c=function(s){return S.orgs.filter(function(o){return o.status===s}).length};
    return head('Platform dashboard','High-level view of organisations and users. Private learner and tutor details stay inside each workspace.')+
      '<div class="stats"><div class="stat"><b class="num">'+c('active')+'</b><span>Active organisations</span></div><div class="stat"><b class="num">'+c('pending')+'</b><span>Waiting for approval</span></div><div class="stat"><b class="num">'+c('suspended')+'</b><span>Suspended</span></div><div class="stat"><b class="num">'+S.users.length+'</b><span>Registered users</span></div></div>'+
      (c('pending')?'<div class="ec-card ec-row sb"><div><h3>'+c('pending')+' organisation '+(c('pending')===1?'is':'are')+' waiting for approval</h3><p class="muted">Review the details before activating a workspace.</p></div><button class="ec-btn" data-act="go" data-view="orgs">Review organisations</button></div>':'')+
      '<p class="note">In the deployed system this page also shows service health and security alerts from CloudWatch and CloudTrail.</p>';
  }
  var o=myOrg(),reqs=S.requests.filter(function(r){return r.orgId===o.id}),cnt=function(s){return reqs.filter(function(r){return r.status===s}).length};
  var cl=oClassrooms(o.id).filter(function(c){return c.status==='open'}),ss=orgSessions(o.id),td=iso(today());
  var up=ss.filter(function(s){return s.status==='scheduled'&&s.date>=td}).sort(sessSort);
  var near=cl.filter(function(c){var l=seatsLeft(c);return l<=2});
  var st=attStats(ss),fb=avgFeedback(ss),pend=reqs.filter(function(r){return r.status==='Pending Approval'});
  return head(esc(o.name),'Dashboard')+
    '<div class="stats"><div class="stat"><b class="num">'+pend.length+'</b><span>Pending matching requests</span></div><div class="stat"><b class="num">'+cl.length+'</b><span>Active classrooms</span></div><div class="stat"><b class="num">'+up.length+'</b><span>Upcoming sessions</span></div><div class="stat"><b class="num">'+activeLearners(o.id)+'</b><span>Active learners</span></div></div>'+
    '<div class="stats"><div class="stat"><b class="num">'+cnt('Approved')+'</b><span>Approved requests</span></div><div class="stat"><b class="num">'+cnt('Rejected')+'</b><span>Rejected</span></div><div class="stat"><b class="num">'+cnt('Cancelled')+'</b><span>Cancelled</span></div><div class="stat"><b class="num">'+cnt('Unmatched')+'</b><span>Unmatched</span></div></div>'+
    '<div class="stats"><div class="stat"><b class="num">'+(st.rate===null?'None':st.rate+'%')+'</b><span>Attendance rate</span></div><div class="stat"><b class="num">'+(fb?fb.toFixed(1):'None')+'</b><span>Average feedback out of 5</span></div><div class="stat"><b class="num">'+near.length+'</b><span>Classrooms with 2 or fewer seats</span></div></div>'+
    (pend.length?'<div class="stack"><div class="ec-row sb"><h2>Requests waiting for you</h2><button class="ec-btn ghost sm" data-act="go" data-view="requests">Open all requests</button></div>'+tbl(['Learner','Preference','Selected option',''],pend.slice(0,4).map(function(r){return '<tr><td><b>'+esc(reqLabel(r))+'</b></td><td>'+esc(prefsText(r.prefs))+'</td><td>'+esc(selText(r))+'</td><td class="act">'+btn('approveReq',r.id,'Approve','btn')+btn('reqDetails',r.id,'Details')+'</td></tr>'}))+'</div>':'')+
    '<div class="stack"><h2>Next sessions</h2>'+tbl(['Date','Classroom','Topic','Tutor'],up.slice(0,5).map(function(s){var c=CLS(s.classroomId);return '<tr><td class="num">'+esc(fmtD(s.date))+', '+t12(s.start)+'</td><td>'+esc(c.title)+'</td><td>'+esc(s.topic)+'</td><td>'+esc(U(c.tutorId).name)+'</td></tr>'}),'No upcoming sessions.')+'</div>';
}
function viewOrgs(){
  var q=F('oq','').toLowerCase(),st=F('os','all');
  var list=S.orgs.filter(function(o){return (st==='all'||o.status===st)&&(!q||(o.name+' '+o.type+' '+o.location).toLowerCase().indexOf(q)>-1)});
  return head('Organisations','Approve, suspend or reactivate provider workspaces')+
    '<div class="filters">'+finput('oq','Search organisations')+fselect('os','Status',[['all','All statuses'],['pending','Pending'],['active','Active'],['suspended','Suspended'],['inactive','Inactive']])+'</div>'+
    tbl(['Organisation','Type','Location','Code','Status',''],list.map(function(o){
      var a='';
      if(o.status==='pending')a=btn('orgApprove',o.id,'Approve','btn')+btn('orgReject',o.id,'Reject');
      else if(o.status==='active')a=btn('orgSuspend',o.id,'Suspend');
      else a=btn('orgReactivate',o.id,'Reactivate');
      return '<tr><td><b>'+esc(o.name)+'</b></td><td>'+esc(o.type)+'</td><td>'+esc(o.location)+'</td><td class="num">'+orgCode(o)+'</td><td>'+statusPill(o.status)+'</td><td class="act">'+a+'</td></tr>';
    }),'No organisations match.');
}
function viewMaster(){
  var list=S.subjects.filter(function(s){return s.orgId===null});
  return head('Master subjects','Shared list that organisations choose from',btn('addMaster','0','Add subject','btn'))+
    tbl(['Subject','Status',''],list.map(function(s){return '<tr><td><b>'+esc(s.name)+'</b></td><td>'+statusPill(s.active?'active':'inactive')+'</td><td class="act">'+btn('renameSubject',s.id,'Rename')+btn('toggleSubject',s.id,s.active?'Deactivate':'Activate')+'</td></tr>'}))+
    '<div class="stack"><h2>Organisation-specific subjects</h2><p class="muted">Private subjects created by organisations. Promote one to the master list if it is useful to others.</p>'+
    tbl(['Subject','Organisation','Status',''],S.subjects.filter(function(s){return s.orgId!==null}).map(function(s){return '<tr><td><b>'+esc(s.name)+'</b></td><td>'+esc(ORG(s.orgId).name)+'</td><td>'+statusPill(s.active?'active':'inactive')+'</td><td class="act">'+btn('promoteSubject',s.id,'Promote to master')+'</td></tr>'}),'No private subjects.')+'</div>';
}

