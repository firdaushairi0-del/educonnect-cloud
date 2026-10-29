/*
 * Lookups, formatting, option lists, notifications, QR image
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- lookups ---------- */
function U(id){return S.users.filter(function(u){return u.id===id})[0]}
function ORG(id){return S.orgs.filter(function(o){return o.id===id})[0]}
function ORGS(slug){return S.orgs.filter(function(o){return o.slug===slug})[0]}
function SUB(id){return S.subjects.filter(function(s){return s.id===id})[0]}
function TOP(id){return S.topics.filter(function(t){return t.id===id})[0]}
function CLS(id){return S.classrooms.filter(function(c){return c.id===id})[0]}
function SESS(id){return S.sessions.filter(function(s){return s.id===id})[0]}
function sessSort(a,b){return a.date===b.date?(a.start<b.start?-1:1):(a.date<b.date?-1:1)}
function TUT(uid){return S.tutors.filter(function(t){return t.userId===uid})[0]}
function ME(){return U(S.me)}
function MEM(uid){return S.memberships.filter(function(m){return m.userId===uid&&m.status==='active'&&ORG(m.orgId)&&ORG(m.orgId).status==='active'})[0]}
function myOrg(){var u=ME();if(!u)return null;var m=MEM(u.id);return m?ORG(m.orgId):null}
function myRoles(){var u=ME();if(!u)return [];if(u.kind==='platform')return ['platform'];if(u.kind==='learner')return ['learner'];var m=MEM(u.id);return m?m.roles:[]}
function has(r){return myRoles().indexOf(r)>-1}
function initials(n){return n.split(' ').filter(function(w){return /^[A-Za-z]/.test(w)}).map(function(w){return w[0]}).slice(0,2).join('')}
function subName(id){var s=SUB(id);return s?s.name:'Unknown'}
function topName(id){var t=TOP(id);return t?t.name:'Any topic'}
function oSubjects(org){return S.subjects.filter(function(s){return s.active&&(s.orgId===null||s.orgId===org)})}
function oTopics(org){return S.topics.filter(function(t){return t.active&&t.orgId===org})}
function oTutors(org){return S.tutors.filter(function(t){return t.orgId===org})}
function oClassrooms(org){return S.classrooms.filter(function(c){return c.orgId===org})}
function enrolled(c){return S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).length+S.guests.filter(function(g){return g.classroomId===c.id&&g.status==='confirmed'}).length}
function seatsLeft(c){return Math.max(0,c.capacity-enrolled(c))}
function cstatus(c){return (c.status==='open'&&seatsLeft(c)===0)?'full':c.status}
function people(c){
  var l=S.enrolments.filter(function(e){return e.classroomId===c.id&&e.status==='active'}).map(function(e){return {key:'L'+e.learnerId,name:U(e.learnerId).name,guest:false}});
  var g=S.guests.filter(function(x){return x.classroomId===c.id&&x.status==='confirmed'}).map(function(x){return {key:'G'+x.id,name:x.name+' (guest)',guest:true}});
  return l.concat(g);
}
function pill(t,k){return '<span class="pill '+(k||'')+'">'+esc(t)+'</span>'}
function statusPill(s){var k={Approved:'ok',active:'ok',open:'ok',completed:'ok',present:'ok',confirmed:'ok',Rejected:'bad',Cancelled:'bad',cancelled:'bad',suspended:'bad',inactive:'bad',absent:'bad',full:'warn','Pending Approval':'warn',pending:'warn',scheduled:'info',Unmatched:'warn',late:'warn',excused:'info',draft:'',closed:'',archived:'','checked-in':'info'}[s]||'';return pill(s,k)}
function tone(id){return 't'+(((id-1)%4)+1)}
function notify(userId,text){S.notifications.push({id:nid(),userId:userId,text:text,read:false,ts:nowIso()})}
function notifyAdmins(orgId,text){S.memberships.forEach(function(m){if(m.orgId===orgId&&m.status==='active'&&m.roles.indexOf('admin')>-1)notify(m.userId,text)})}
function unread(){var u=ME();return u?S.notifications.filter(function(n){return n.userId===u.id&&!n.read}).length:0}
function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},3200)}
function opts(list,sel){return list.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(sel)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')}
function levelOpts(sel,withAny){return (withAny?'<option value="any"'+(sel==='any'?' selected':'')+'>Any level</option>':'')+LEVEL_GROUPS.map(function(g){return '<optgroup label="'+g[0]+'">'+g[1].map(function(v){return '<option'+(v===sel?' selected':'')+'>'+esc(v)+'</option>'}).join('')+'</optgroup>'}).join('')}
function dayOpts(sel,anyLabel){return (anyLabel?'<option value="any"'+(sel==='any'?' selected':'')+'>'+anyLabel+'</option>':'')+DAYS.map(function(d){return '<option value="'+d+'"'+(sel===d?' selected':'')+'>'+DAYFULL[d]+'</option>'}).join('')}
function topicOpts(org,sel,any){return (any?'<option value="0">Any topic</option>':'')+oTopics(org).map(function(t){return '<option value="'+t.id+'"'+(+sel===t.id?' selected':'')+'>'+esc(subName(t.subjectId)+' › '+t.name)+'</option>'}).join('')}
function slotText(day,s,e){return DAYFULL[day]+', '+t12(s)+' to '+t12(e)}
function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function qrHtml(text){
  try{if(typeof qrcode==='function'){var q=qrcode(0,'M');q.addData(text);q.make();return '<div class="qr" role="img" aria-label="QR code for '+esc(text)+'">'+q.createSvgTag(4,2)+'</div>'}}catch(e){}
  return '<div class="qr note" style="text-align:center">QR image could not load. Use the link or code instead.</div>';
}

