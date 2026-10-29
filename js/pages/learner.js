/*
 * Learner pages: my learning, my requests, join, notifications
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- learner ---------- */
function myEnrolments(){var u=ME();return S.enrolments.filter(function(e){return e.learnerId===u.id&&e.status==='active'})}
function myAtt(sid){var u=ME();return S.attendance.filter(function(a){return a.sessionId===sid&&a.key==='L'+u.id})[0]}
function viewLearning(){
  var u=ME(),en=myEnrolments(),td=iso(today()),ids=en.map(function(e){return e.classroomId});
  var ss=S.sessions.filter(function(s){return ids.indexOf(s.classroomId)>-1&&s.status!=='cancelled'}).sort(sessSort);
  var pend=S.requests.filter(function(r){return r.learnerId===u.id&&r.status==='Pending Approval'});
  return head('My learning',esc(u.name)+(u.note?' · '+esc(u.note):''))+
    (pend.length?'<div class="ec-card ec-row sb"><div><h3>'+pend.length+' request'+(pend.length===1?' is':'s are')+' waiting for approval</h3><p class="muted">The organisation will approve or reply soon.</p></div><button class="ec-btn ghost" data-act="go" data-view="myrequests">View requests</button></div>':'')+
    (en.length?'<div class="cards">'+en.map(function(e){var c=CLS(e.classroomId),nx=S.sessions.filter(function(s){return s.classroomId===c.id&&s.status==='scheduled'&&s.date>=td}).sort(sessSort)[0];return '<article class="cc '+tone(c.subjectId)+'"><div class="top"><span class="eyebrow">'+esc(ORG(c.orgId).name)+'</span><h3>'+esc(c.title)+'</h3></div><div class="bot"><span>Tutor: '+esc(U(c.tutorId).name)+'</span><span class="muted">'+esc(slotText(c.day,c.start,c.end))+'</span><span class="muted">'+(nx?'Next: '+esc(fmtD(nx.date))+', '+t12(nx.start):'No session scheduled')+'</span><div class="ec-row">'+btn('leaveClass',e.id,'Withdraw')+'</div></div></article>'}).join('')+'</div>':'<div class="empty"><p>You are not enrolled in a class yet.</p><p>Open a provider’s QR code or link to find a match.</p><button class="ec-btn" data-act="go" data-view="join">Join a provider</button></div>')+
    (en.length?'<div class="stack"><h2>Sessions</h2>'+tbl(['Date','Classroom','Topic','Where','My attendance',''],ss.map(function(s){
      var c=CLS(s.classroomId),a=myAtt(s.id),fb=S.feedback.filter(function(f){return f.sessionId===s.id&&f.learnerId===u.id})[0],act='';
      if(s.qrOpen&&(!a||a.status===''))act=btn('learnerCheckin',s.id,'Check in','btn');
      if(s.status==='completed')act=btn('giveFeedback',s.id,fb?'Edit feedback':'Give feedback');
      return '<tr><td class="num">'+esc(fmtD(s.date))+'<br><span class="muted">'+t12(s.start)+'</span></td><td>'+esc(c.title)+'</td><td>'+esc(s.topic)+'</td><td>'+esc(s.venue)+'</td><td>'+(a&&a.status?statusPill(a.status):'<span class="muted">'+(s.status==='completed'?'Not recorded':'Not yet')+'</span>')+'</td><td class="act">'+act+'</td></tr>';
    }),'No sessions yet.')+'</div>':'');
}
function viewMyRequests(){
  var u=ME(),list=S.requests.filter(function(r){return r.learnerId===u.id}).sort(function(a,b){return b.createdAt.localeCompare(a.createdAt)});
  return head('My requests','Everything you asked for, and what the organisation decided')+
    tbl(['Organisation','Preference','Selected option','Date','Status',''],list.map(function(r){return '<tr><td>'+esc(ORG(r.orgId).name)+'</td><td>'+esc(prefsText(r.prefs))+'</td><td>'+esc(selText(r))+'</td><td class="num">'+esc(fmtDay(r.createdAt))+'</td><td>'+statusPill(r.status)+(r.note?'<br><span class="muted">'+esc(r.note)+'</span>':'')+'</td><td class="act">'+(r.status==='Pending Approval'?btn('cancelReq',r.id,'Cancel request'):'')+'</td></tr>'}),'You have not made any requests yet.');
}
function viewJoin(){
  return head('Join a provider','Learners find a provider through its QR code or link. There is no public search.')+
    '<form class="ec-card stack" data-submit="joinOrg" style="max-width:560px"><div class="field"><label for="jSlug">Organisation link or short name</label><input id="jSlug" name="slug" placeholder="abc-tuition" required><small>Example: abc-tuition, or the full link from the QR code.</small></div><button class="ec-btn" type="submit">Open matching form</button></form>'+
    '<p class="note">For the demo you can try abc-tuition, melaka-library or sarah-english.</p>';
}
function viewNotifications(){
  var u=ME(),list=S.notifications.filter(function(n){return n.userId===u.id}).sort(function(a,b){return b.ts.localeCompare(a.ts)});
  return head('Notifications','Updates about requests, sessions and approvals',unread()?btn('readAll','0','Mark all as read','ghost'):'')+
    (list.length?'<div class="stack" style="gap:10px">'+list.map(function(n){return '<div class="ec-card ec-row sb" style="padding:14px 18px"><div><p'+(n.read?' class="muted"':'')+'>'+(n.read?'':'<b>')+esc(n.text)+(n.read?'':'</b>')+'</p><p class="note">'+esc(fmtTs(n.ts))+'</p></div>'+(n.read?'':pill('New','info'))+'</div>'}).join('')+'</div>':'<div class="empty"><p>No notifications yet.</p></div>');
}

