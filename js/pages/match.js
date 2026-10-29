/*
 * Learner pages: QR matching form, results, identify, guest check-in
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- organisation QR matching page ---------- */
function openMatch(slug){
  var o=ORGS(slug);
  S.match={slug:slug,orgId:o?o.id:0,step:'form',prefs:null,results:null,chosen:null};
  S.page='match';render();window.scrollTo(0,0);
}
function matchHTML(){
  var m=S.match,o=ORG(m.orgId);
  if(!o)return topbar('org')+'<div class="formpage"><div class="empty"><h2>Organisation not found</h2><p>Check the link or QR code and try again.</p><button class="ec-btn" data-act="goPage" data-page="landing">Back to home</button></div></div>';
  if(o.status!=='active')return topbar('org')+'<div class="formpage"><div class="empty"><h2>'+esc(o.name)+' is not accepting requests</h2><p>This workspace is '+esc(o.status)+'.</p><button class="ec-btn" data-act="goPage" data-page="landing">Back to home</button></div></div>';
  var head='<div class="orghead"><span class="logo" aria-hidden="true">'+esc(initials(o.name))+'</span><div class="stack" style="gap:4px;flex:1;min-width:220px"><h1 style="font-size:1.6rem">'+esc(o.name)+'</h1><p>'+esc(o.desc)+'</p><p class="note">'+esc(o.location)+' · '+esc(o.contact)+' · '+o.modes.join(' and ')+'</p></div></div><p class="route">'+esc(BASE+'/o/'+o.slug+'/match')+'</p>';
  var body='';
  if(m.step==='form')body=matchForm(o);
  else if(m.step==='results')body=matchResults(o);
  else if(m.step==='identify')body=matchIdentify(o);
  else if(m.step==='done')body=matchDone(o);
  return topbar('org')+'<div class="formpage" style="max-width:860px">'+head+body+'</div>';
}
function matchForm(o){
  var p=S.match.prefs||{subjectId:oSubjects(o.id)[0].id,level:'Form 4',topicId:0,day:'Sat',band:'afternoon',mode:'either',branch:'any',arrangement:'either'};
  var tops=oTopics(o.id);
  return '<form class="ec-card stack" data-submit="findMatch"><div><h2>Tell us what you are looking for</h2><p class="muted">We only search '+esc(o.name)+'. You do not need an account yet, and please do not enter ID numbers or home addresses.</p></div>'+
  '<div class="grid2"><div class="field"><label for="mSub">Subject or interest</label><select id="mSub" name="subjectId">'+opts(oSubjects(o.id).map(function(s){return [s.id,s.name]}),p.subjectId)+'</select></div>'+
  '<div class="field"><label for="mLvl">Level</label><select id="mLvl" name="level">'+levelOpts(p.level)+'</select></div></div>'+
  '<div class="grid2"><div class="field"><label for="mTop">Specific topic</label><select id="mTop" name="topicId">'+topicOpts(o.id,p.topicId,true)+'</select><small>Topics are listed under their subject. Topics from a different subject will not match.</small></div>'+
  '<div class="field"><label for="mArr">Group or one-to-one</label><select id="mArr" name="arrangement">'+opts([['either','Either'],['group','Small group'],['one-to-one','One-to-one']],p.arrangement)+'</select></div></div>'+
  '<div class="grid2"><div class="field"><label for="mDay">Preferred day</label><select id="mDay" name="day">'+dayOpts(p.day,'Any day')+'</select></div>'+
  '<div class="field"><label for="mBand">Preferred time</label><select id="mBand" name="band">'+opts([['any','Any time'],['morning','Morning'],['afternoon','Afternoon'],['evening','Evening']],p.band)+'</select></div></div>'+
  '<div class="grid2"><div class="field"><label for="mMode">Physical or online</label><select id="mMode" name="mode">'+opts([['either','Either'],['physical','Physical'],['online','Online']],p.mode)+'</select></div>'+
  '<div class="field"><label for="mBr">Branch or general location</label><select id="mBr" name="branch">'+opts([['any','Any location']].concat(o.branches.map(function(b){return [b,b]})),p.branch)+'</select></div></div>'+
  '<div class="ec-row sb"><button class="ec-btn ghost sm" type="button" data-act="goPage" data-page="checkin">Registered as a guest? Check in</button><button class="ec-btn" type="submit">Find matches</button></div></form>';
}
function optCard(r,i){
  var best=r.label==='Best Match'&&i===0&&!r.alt;
  return '<article class="opt'+(best?' best':'')+'"><div class="ec-row sb"><div class="ec-row">'+pill(r.label,r.label==='Best Match'?'ok':(r.label==='Good Match'?'info':''))+pill(r.type==='tutor'?'Tutor':'Classroom')+'</div><span class="note">'+esc(r.cap)+'</span></div>'+
  '<div class="stack" style="gap:2px"><h3>'+esc(r.title)+'</h3><p class="muted">'+esc(r.sub)+'</p></div>'+
  '<ul class="reasons">'+r.good.map(function(g){return '<li class="good">'+esc(g)+'</li>'}).join('')+r.diff.map(function(g){return '<li class="diff">'+esc(g)+'</li>'}).join('')+'</ul>'+
  '<p class="note">'+esc(r.access)+' · '+esc(r.approval)+'</p>'+
  '<div class="ec-row"><button class="ec-btn" data-act="chooseOption" data-i="'+i+'">Choose this option</button></div></article>';
}
function matchResults(o){
  var m=S.match,res=m.results,p=m.prefs;
  var head='<div class="ec-card stack" style="gap:8px"><div class="ec-row sb"><h2>Recommendations</h2><button class="ec-btn ghost sm" data-act="matchBack">Change preferences</button></div><p class="muted">'+esc(prefsText(p))+'</p></div>';
  if(!res.length)return head+'<div class="empty"><h3>No suitable tutor or classroom found</h3><p>Nothing at '+esc(o.name)+' matches right now. You can leave your request. The organisation will review it and may contact you with other options.</p><button class="ec-btn" data-act="sendUnmatched">Send as an unmatched request</button></div>';
  var prim=res.filter(function(r){return !r.alt}),alt=res.filter(function(r){return r.alt});
  var html=head;
  if(prim.length)html+='<div class="choices">'+prim.map(function(r){return optCard(r,res.indexOf(r))}).join('')+'</div>';
  if(alt.length)html+='<div class="stack"><h3>'+(p.arrangement==='group'?'One-to-one alternatives':'Group classroom alternatives')+'</h3><div class="choices">'+alt.map(function(r){return optCard(r,res.indexOf(r))}).join('')+'</div></div>';
  return html+'<p class="note">Tutorbit recommends. The organisation makes the final placement decision.</p>';
}
function matchIdentify(o){
  var m=S.match,r=m.chosen;
  var learners=S.users.filter(function(u){return u.kind==='learner'&&u.id<=10});
  var guest=r.guestOk?'<form class="ec-card stack" data-submit="idGuest"><h3>Continue as a guest</h3><p class="muted">For one-time sessions. You get a registration reference for check-in.</p><div class="field"><label for="gName">Name</label><input id="gName" name="name" required></div><div class="field"><label for="gCon">Phone or email</label><input id="gCon" name="contact" required></div><button class="ec-btn" type="submit">Register as guest</button></form>':'<div class="ec-card stack"><h3>Guest registration</h3><p class="muted">This option needs an account because it involves ongoing schedules, attendance and feedback.</p></div>';
  return '<div class="ec-card stack" style="gap:8px"><div class="ec-row sb"><h2>'+esc(r.title)+'</h2><button class="ec-btn ghost sm" data-act="matchResultsBack">Back to results</button></div><p class="muted">'+esc(r.sub)+'</p><p class="note">'+esc(r.access)+' · '+esc(r.approval)+'</p></div>'+
  '<div class="choices"><div class="ec-card stack"><h3>Sign in</h3><p class="muted">Pick a sample learner account.</p><div class="stack" style="gap:8px">'+learners.map(function(u){return '<button class="ub" data-act="idLearner" data-id="'+u.id+'"><span class="avatar">'+esc(initials(u.name))+'</span><span><b>'+esc(u.name)+'</b><br><small class="muted">'+esc(u.note||'Learner account')+'</small></span></button>'}).join('')+'</div></div>'+
  '<form class="ec-card stack" data-submit="idCreate"><h3>Create a learner account</h3><div class="field"><label for="cName">Learner name</label><input id="cName" name="name" required></div><div class="field"><label for="cEmail">Email</label><input id="cEmail" name="email" type="email" required></div><button class="ec-btn" type="submit">Create account and continue</button></form>'+guest+'</div>';
}
function matchDone(o){
  var d=S.match.done;
  return '<div class="ec-card stack" role="status"><p class="eyebrow" style="color:var(--ok)">'+esc(d.kicker)+'</p><h2>'+esc(d.title)+'</h2><p>'+esc(d.text)+'</p>'+(d.ref?'<dl class="kv"><dt>Registration reference</dt><dd class="num"><b>'+esc(d.ref)+'</b></dd></dl><p class="note">Keep this reference. You need it to check in to the session.</p>':'')+'<div class="ec-row"><button class="ec-btn" data-act="goPage" data-page="'+(d.signedIn?'app':'landing')+'">'+(d.signedIn?'Go to my dashboard':'Back to home')+'</button><button class="ec-btn ghost" data-act="matchAgain">Make another request</button></div></div>';
}
function checkinHTML(){
  var c=S.ci||{};
  return topbar('org')+'<div class="formpage" style="max-width:520px"><div class="stack"><p class="eyebrow" style="color:var(--accent)">Session attendance</p><h1>Guest check-in</h1><p class="muted">Enter your registration reference and the session code shown by the tutor. The tutor confirms your attendance afterwards.</p></div>'+
  '<form class="ec-card stack" data-submit="guestCheckin"><div class="field"><label for="ciRef">Registration reference</label><input id="ciRef" name="ref" placeholder="EC-G0001" value="'+esc(c.ref||'')+'" required></div><div class="field"><label for="ciCode">Session code</label><input id="ciCode" name="code" placeholder="6 characters" required></div><button class="ec-btn" type="submit">Check in</button></form></div>';
}

