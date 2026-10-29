/*
 * Rendering, dialogs, form helpers and the action registry (A)
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- rendering and dialogs ---------- */
function render(){
  var y=window.scrollY,ae=document.activeElement,fid=ae&&ae.id,ss=null,se=null;
  if(fid&&typeof ae.selectionStart==='number'){try{ss=ae.selectionStart;se=ae.selectionEnd}catch(e){}}
  if(S.page==='app'&&!S.me)S.page='login';
  var h=S.page==='app'?shellHTML():S.page==='login'?loginHTML():S.page==='register'?registerHTML():S.page==='match'?matchHTML():S.page==='checkin'?checkinHTML():S.page==='redirect'?redirectHTML():landingHTML();
  $('#root').innerHTML=h;
  window.scrollTo(0,y);
  if(fid){var n=document.getElementById(fid);if(n){n.focus();try{if(ss!==null)n.setSelectionRange(ss,se)}catch(e){}}}
}
function openModal(title,body,label,cb){
  S.cb=cb;var m=$('#modal');
  m.innerHTML='<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">'+esc(title)+'</h2><form data-submit="modalSubmit">'+body+'<div class="ec-row end"><button type="button" class="ec-btn ghost" data-act="closeModal">Cancel</button><button class="ec-btn'+(label==='Delete'||label==='Reject'?' danger':'')+'" type="submit">'+esc(label)+'</button></div></form></div>';
  m.hidden=false;var f=m.querySelector('input:not([type=checkbox]),select,textarea');if(f)f.focus();
}
function openInfo(title,html){
  S.cb=null;var m=$('#modal');
  m.innerHTML='<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt">'+esc(title)+'</h2><div class="stack">'+html+'</div><div class="ec-row end"><button type="button" class="ec-btn" data-act="closeModal">Close</button></div></div>';
  m.hidden=false;m.querySelector('.ec-btn').focus();
}
function confirmBox(title,text,label,cb){openModal(title,'<p class="muted">'+esc(text)+'</p>',label,function(){cb()})}
function closeModal(){$('#modal').hidden=true;S.cb=null}
function val(f,k){var e=f.elements[k];return e?String(e.value).trim():''}
function chk(f,k){var e=f.elements[k];return !!(e&&e.checked)}
function randCode(){var c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='';for(var i=0;i<6;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
function adminCount(orgId){return S.memberships.filter(function(m){return m.orgId===orgId&&m.status==='active'&&m.roles.indexOf('admin')>-1}).length}
function ensureTutor(m){
  if(m.roles.indexOf('tutor')>-1&&!TUT(m.userId)){var o=ORG(m.orgId);S.tutors.push({userId:m.userId,orgId:m.orgId,status:'active',modes:o.modes.slice(),branch:o.branches[0],expertise:[],availability:[],unavailability:[]})}
}
function guestRef(id){return 'EC-G'+String(id).padStart(4,'0')}

/* ---------- actions ---------- */
var A={};
A.closeModal=closeModal;
A.modalSubmit=function(f){if(S.cb){var r=S.cb(f);if(r!==false)closeModal()}};
