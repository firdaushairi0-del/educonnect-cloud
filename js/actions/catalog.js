/*
 * Actions: topics and organisation profile
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* subjects, topics, organisation */
function topicNameTaken(name,orgId,subjectId,exceptId){return S.topics.some(function(t){return t.id!==exceptId&&t.orgId===orgId&&t.subjectId===subjectId&&t.name.toLowerCase()===name.toLowerCase()})}
A.addTopic=function(){
  var o=myOrg();
  openModal('Add topic','<div class="field"><label for="tpS">Subject</label><select id="tpS" name="subjectId">'+opts(oSubjects(o.id).map(function(s){return [s.id,s.name]}),'')+'</select></div><div class="field"><label for="tpN">Topic name</label><input id="tpN" name="name" required></div>','Add topic',function(f){
    var sid=+val(f,'subjectId'),n=val(f,'name');if(topicNameTaken(n,o.id,sid,0)){toast('That topic already exists.');return false}
    S.topics.push({id:nid(),subjectId:sid,orgId:o.id,name:n,active:true});render();toast('Topic added.');
  });
};
function myTopic(id){var t=TOP(id),o=myOrg();return t&&o&&t.orgId===o.id?t:null}
A.renameTopic=function(el){var t=myTopic(+el.dataset.id);if(!t)return;openModal('Edit topic','<div class="field"><label for="tpN">Topic name</label><input id="tpN" name="name" value="'+esc(t.name)+'" required></div>','Save',function(f){var n=val(f,'name');if(topicNameTaken(n,t.orgId,t.subjectId,t.id)){toast('That topic already exists.');return false}t.name=n;render();toast('Topic updated.')})};
A.toggleTopic=function(el){
  var t=myTopic(+el.dataset.id);if(!t)return;
  if(t.active&&S.classrooms.some(function(c){return c.topicId===t.id&&['open','draft'].indexOf(c.status)>-1})){toast('This topic is used by open classrooms. Close them first.');return}
  t.active=!t.active;render();toast(t.name+(t.active?' is active.':' is deactivated.'));
};
A.saveOrg=function(f){
  var o=myOrg(),br=val(f,'branches').split(',').map(function(x){return x.trim()}).filter(Boolean),modes=[];
  if(chk(f,'modePhysical'))modes.push('physical');if(chk(f,'modeOnline'))modes.push('online');
  if(!modes.length||!br.length){toast('Add at least one branch and one learning mode.');return}
  o.name=val(f,'name');o.desc=val(f,'desc');o.location=val(f,'location');o.contact=val(f,'contact');o.branches=br;o.modes=modes;render();toast('Profile saved.');
};

