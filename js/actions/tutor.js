/*
 * Actions: tutor expertise and availability
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* tutor profile */
function myTutor(){var t=TUT(ME().id),o=myOrg();return t&&o&&t.orgId===o.id?t:null}
A.editProfile=function(){
  var t=myTutor(),o=myOrg();if(!t)return;
  openModal('Modes and branch','<div class="checks"><label><input type="checkbox" name="modePhysical"'+(t.modes.indexOf('physical')>-1?' checked':'')+'> Physical</label><label><input type="checkbox" name="modeOnline"'+(t.modes.indexOf('online')>-1?' checked':'')+'> Online</label></div><div class="field"><label for="pbB">Branch</label><select id="pbB" name="branch">'+opts(o.branches.map(function(b){return [b,b]}),t.branch)+'</select></div>','Save',function(f){
    var m=[];if(chk(f,'modePhysical'))m.push('physical');if(chk(f,'modeOnline'))m.push('online');
    if(!m.length){toast('Choose at least one mode.');return false}
    t.modes=m;t.branch=val(f,'branch');render();toast('Profile updated.');
  });
};
A.addExpertise=function(){
  var t=myTutor(),o=myOrg();if(!t)return;
  if(!oTopics(o.id).length){toast('Ask your administrator to add topics first.');return}
  openModal('Add expertise','<div class="field"><label for="exT">Topic</label><select id="exT" name="topicId">'+topicOpts(o.id,'',false)+'</select></div><fieldset class="field" style="border:0;padding:0;margin:0"><legend>Levels you teach</legend>'+LEVEL_GROUPS.map(function(g){return '<p class="note" style="margin-top:6px">'+g[0]+'</p><div class="checks">'+g[1].map(function(v){return '<label><input type="checkbox" name="lv_'+esc(v)+'"> '+esc(v)+'</label>'}).join('')+'</div>'}).join('')+'</fieldset>','Add expertise',function(f){
    var tp=TOP(+val(f,'topicId')),lv=[];LEVEL_GROUPS.forEach(function(g){g[1].forEach(function(v){if(chk(f,'lv_'+v))lv.push(v)})});
    if(!lv.length){toast('Choose at least one level.');return false}
    if(t.expertise.some(function(x){return x.topicId===tp.id})){toast('You already have this topic. Remove it first to change levels.');return false}
    t.expertise.push({id:nid(),subjectId:tp.subjectId,topicId:tp.id,levels:lv});render();toast('Expertise added.');
  });
};
A.delExpertise=function(el){var t=myTutor();if(!t)return;t.expertise=t.expertise.filter(function(x){return x.id!==+el.dataset.id});render();toast('Expertise removed.')};
A.addAvail=function(){
  var t=myTutor();if(!t)return;
  openModal('Add weekly availability','<div class="field"><label for="avD">Day</label><select id="avD" name="day">'+dayOpts('Sat')+'</select></div><div class="grid2"><div class="field"><label for="avS">From</label><input id="avS" name="start" type="time" value="10:00" required></div><div class="field"><label for="avE">Until</label><input id="avE" name="end" type="time" value="12:00" required></div></div>','Add time',function(f){
    var d=val(f,'day'),s=val(f,'start'),e=val(f,'end');
    if(mins(e)<=mins(s)){toast('The end time must be after the start time.');return false}
    if(t.availability.some(function(a){return a.day===d&&overlap(mins(a.start),mins(a.end),mins(s),mins(e))>0})){toast('That overlaps a time you already added.');return false}
    t.availability.push({id:nid(),day:d,start:s,end:e});render();toast('Availability added.');
  });
};
A.delAvail=function(el){var t=myTutor();if(!t)return;t.availability=t.availability.filter(function(x){return x.id!==+el.dataset.id});render();toast('Availability removed.')};
A.addUnavail=function(){
  var t=myTutor();if(!t)return;
  openModal('Block a date','<div class="field"><label for="unD">Date</label><input id="unD" name="date" type="date" required></div><div class="field"><label for="unR">Reason (optional)</label><input id="unR" name="reason"></div>','Block date',function(f){
    t.unavailability.push({id:nid(),date:val(f,'date'),reason:val(f,'reason')});render();toast('Date blocked.');
  });
};
A.delUnavail=function(el){var t=myTutor();if(!t)return;t.unavailability=t.unavailability.filter(function(x){return x.id!==+el.dataset.id});render();toast('Date unblocked.')};

