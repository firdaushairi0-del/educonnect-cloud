/*
 * Actions: theme, navigation, sign in/out, registration, matching flow, guest check-in
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

A.setTheme=function(el){S.theme=el.dataset.mode;applyTheme();try{localStorage.setItem('ec-theme',S.theme)}catch(e){}render()};
A.goPage=function(el){var p=el.dataset.page;if(p==='app'&&!S.me)p='login';S.page=p;if(p==='register')S.regDone=null;render();window.scrollTo(0,0)};
A.scrollTo=function(el){var t=document.getElementById(el.dataset.to);if(t)t.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
A.openOrg=function(el){openMatch(el.dataset.slug)};
A.go=function(el){S.view=el.dataset.view;S.f={};render();window.scrollTo(0,0)};
A.repTab=function(el){S.rep=el.dataset.tab;S.f={};render()};
A.login=function(el){
  var u=U(+el.dataset.id);if(!u||u.status!=='active'){toast('This user is inactive.');return}
  S.me=u.id;
  startRedirect({avatar:initials(u.name),title:'Signed in as '+u.name,text:'Taking you to your '+(has('platform')||has('admin')?'dashboard':has('learner')?'learning page':'classrooms')+'.',label:'Continue now',to:'app'});
};
A.logout=function(){S.me=null;startRedirect({avatar:'',title:'You are signed out',text:'Taking you back to the home page.',label:'Go now',to:'landing'})};
A.finishRedirect=function(){
  clearTimeout(S.timer);var r=S.redir;if(!r||S.page!=='redirect')return;S.redir=null;
  if(r.to==='app'){S.page='app';S.view=homeView();S.f={}}else S.page='landing';
  render();window.scrollTo(0,0);
};
A.readAll=function(){var u=ME();S.notifications.forEach(function(n){if(n.userId===u.id)n.read=true});render()};
A.joinOrg=function(f){
  var raw=val(f,'slug').toLowerCase(),mm=raw.match(/\/o\/([a-z0-9-]+)/),s=mm?mm[1]:raw.replace(/[^a-z0-9-]/g,'');
  if(!ORGS(s)){toast('No organisation found with that link or name.');return}
  openMatch(s);
};

/* registration */
A.register=function(f){
  var name=val(f,'name'),email=val(f,'email').toLowerCase();
  if(!chk(f,'modePhysical')&&!chk(f,'modeOnline')){toast('Choose at least one learning mode.');return}
  if(S.orgs.some(function(o){return o.name.toLowerCase()===name.toLowerCase()})){toast('An organisation with that name already exists.');return}
  var u=S.users.filter(function(x){return x.email.toLowerCase()===email})[0];
  if(u&&u.kind!=='member'){toast('That email belongs to a different kind of account.');return}
  if(!u){u={id:nid(),name:val(f,'admin'),email:email,kind:'member',status:'active'};S.users.push(u)}
  var sl=slug(name),base=sl,n=2;while(ORGS(sl)){sl=base+'-'+n++}
  var modes=[];if(chk(f,'modePhysical'))modes.push('physical');if(chk(f,'modeOnline'))modes.push('online');
  var solo=chk(f,'solo');
  var o={id:nid(),slug:sl,name:name,type:solo?'Independent tutor':val(f,'type'),desc:val(f,'desc')||'Welcome. Tell us what you need.',location:val(f,'location'),contact:val(f,'contact'),branches:[val(f,'location')],modes:modes,status:'pending'};
  S.orgs.push(o);S.memberships.push({id:nid(),userId:u.id,orgId:o.id,roles:solo?['admin','tutor']:['admin'],status:'pending'});
  S.users.filter(function(x){return x.kind==='platform'}).forEach(function(p){notify(p.id,name+' has applied for an organisation workspace.')});
  S.regDone=o;render();window.scrollTo(0,0);
};

/* learner matching flow */
A.findMatch=function(f){
  var o=ORG(S.match.orgId),p={subjectId:+val(f,'subjectId'),level:val(f,'level'),topicId:+val(f,'topicId'),day:val(f,'day'),band:val(f,'band'),mode:val(f,'mode'),branch:val(f,'branch'),arrangement:val(f,'arrangement')};
  if(p.topicId&&TOP(p.topicId).subjectId!==p.subjectId){toast('That topic belongs to a different subject. Choose "Any topic" or change the subject.');return}
  S.match.prefs=p;S.match.results=recommend(o.id,p);S.match.step='results';render();window.scrollTo(0,0);
};
A.matchBack=function(){S.match.step='form';render();window.scrollTo(0,0)};
A.matchResultsBack=function(){S.match.step='results';render();window.scrollTo(0,0)};
A.matchAgain=function(){S.match.step='form';S.match.prefs=null;render();window.scrollTo(0,0)};
A.chooseOption=function(el){S.match.chosen=S.match.results[+el.dataset.i];S.match.step='identify';render();window.scrollTo(0,0)};
A.idLearner=function(el){submitRequest({learnerId:+el.dataset.id})};
A.idCreate=function(f){
  var email=val(f,'email').toLowerCase();
  if(S.users.some(function(u){return u.email.toLowerCase()===email})){toast('That email already has an account. Sign in instead.');return}
  var u={id:nid(),name:val(f,'name'),email:email,kind:'learner',status:'active'};S.users.push(u);submitRequest({learnerId:u.id});
};
A.idGuest=function(f){submitRequest({guest:{name:val(f,'name'),contact:val(f,'contact')}})};
A.sendUnmatched=function(){
  openModal('Leave your contact details','<p class="muted">The organisation will review your request and may contact you with other options.</p><div class="field"><label for="uName">Name</label><input id="uName" name="name" required></div><div class="field"><label for="uCon">Phone or email</label><input id="uCon" name="contact" required></div>','Send request',function(f){
    var o=ORG(S.match.orgId);
    S.requests.push({id:nid(),orgId:o.id,learnerId:null,guest:{name:val(f,'name'),contact:val(f,'contact')},prefs:S.match.prefs,selected:null,status:'Unmatched',note:'',createdAt:nowIso()});
    notifyAdmins(o.id,'Unmatched request from '+val(f,'name')+': '+prefsText(S.match.prefs));
    S.match.step='done';S.match.done={kicker:'Request sent',title:'We have passed your request to '+o.name,text:'No suitable option was available right now. The organisation will review it and may contact you.',ref:'',signedIn:false};render();window.scrollTo(0,0);
  });
};
function submitRequest(idn){
  var m=S.match,o=ORG(m.orgId),ch=m.chosen,p=m.prefs;
  var req={id:nid(),orgId:o.id,learnerId:idn.learnerId||null,guest:idn.guest||null,prefs:p,selected:{type:ch.type,id:ch.id,window:ch.window||null,topicId:ch.topicId||0},status:'Pending Approval',note:'',createdAt:nowIso()};
  var who=idn.learnerId?U(idn.learnerId).name:idn.guest.name,ref='',title,text,kicker='Request sent';
  if(ch.type==='classroom'){
    var c=CLS(ch.id);
    if(c.status!=='open'||seatsLeft(c)===0){toast('Sorry, that classroom just filled up. Please choose another option.');m.results=recommend(o.id,p);m.step='results';render();return}
    if(idn.learnerId&&S.enrolments.some(function(e){return e.classroomId===c.id&&e.learnerId===idn.learnerId&&e.status==='active'})){toast('That learner is already in this classroom.');return}
    if(idn.learnerId&&S.requests.some(function(r){return r.orgId===o.id&&r.learnerId===idn.learnerId&&r.status==='Pending Approval'&&r.selected&&r.selected.type==='classroom'&&r.selected.id===c.id})){toast('There is already a pending request for this classroom.');return}
    var auto=c.approval==='automatic';
    if(idn.guest){var g={id:nid(),orgId:o.id,classroomId:c.id,name:idn.guest.name,contact:idn.guest.contact,ref:'',status:auto?'confirmed':'pending'};g.ref=guestRef(S.guests.length+1);S.guests.push(g);req.guestRegId=g.id;ref=g.ref}
    if(auto){
      req.status='Approved';
      if(idn.learnerId)S.enrolments.push({id:nid(),classroomId:c.id,learnerId:idn.learnerId,status:'active'});
      kicker='You are registered';title='You are confirmed in '+c.title;text='A seat is reserved for '+who+'. '+slotText(c.day,c.start,c.end)+'.';
      notifyAdmins(o.id,who+' registered for '+c.title+'.');
      if(idn.learnerId)notify(idn.learnerId,'You are confirmed in '+c.title+'.');
    }else{
      title='Request sent to '+o.name;text='Your request for '+c.title+' is waiting for approval. You will see the result under My requests.';
      notifyAdmins(o.id,'New matching request: '+who+' for '+c.title+'.');
    }
  }else{
    title='Request sent to '+o.name;text='Your request for one-to-one tutoring with '+U(ch.id).name+' is waiting for approval.';
    notifyAdmins(o.id,'New one-to-one request: '+who+' with '+U(ch.id).name+'.');
  }
  S.requests.push(req);
  if(idn.learnerId)S.me=idn.learnerId;
  S.match.step='done';S.match.done={kicker:kicker,title:title,text:text,ref:ref,signedIn:!!idn.learnerId};
  if(idn.learnerId)S.view='myrequests';
  render();window.scrollTo(0,0);
}
A.guestCheckin=function(f){
  var ref=val(f,'ref').toUpperCase(),code=val(f,'code').toUpperCase();
  var g=S.guests.filter(function(x){return x.ref===ref&&x.status==='confirmed'})[0];
  if(!g){toast('That reference was not found, or it is still waiting for approval.');return}
  var s=S.sessions.filter(function(x){return x.classroomId===g.classroomId&&x.qrOpen&&x.code===code})[0];
  if(!s){toast('That code does not match an open session for your registration.');return}
  recordCheckin(s,'G'+g.id);S.ci={};toast('Checked in. The tutor will confirm your attendance.');
};
function recordCheckin(s,key){
  var a=S.attendance.filter(function(x){return x.sessionId===s.id&&x.key===key})[0];
  if(a){if(!a.checkedIn)a.checkedIn=nowIso();if(!a.status)a.status='checked-in'}
  else S.attendance.push({id:nid(),sessionId:s.id,key:key,checkedIn:nowIso(),status:'checked-in'});
}

