/*
 * Actions: invite, approve and manage members and roles
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* members */
function memOf(id){var m=S.memberships.filter(function(x){return x.id===id})[0],o=myOrg();return m&&o&&m.orgId===o.id?m:null}
A.inviteMember=function(){
  var o=myOrg();
  openModal('Invite a member','<div class="field"><label for="ivN">Name</label><input id="ivN" name="name" required></div><div class="field"><label for="ivE">Email</label><input id="ivE" name="email" type="email" required></div><fieldset class="field" style="border:0;padding:0;margin:0"><legend>Roles</legend><div class="checks"><label><input type="checkbox" name="tutor" checked> Tutor</label><label><input type="checkbox" name="admin"> Administrator</label></div></fieldset>','Send invitation',function(f){
    var email=val(f,'email').toLowerCase(),roles=[];if(chk(f,'tutor'))roles.push('tutor');if(chk(f,'admin'))roles.push('admin');
    if(!roles.length){toast('Choose at least one role.');return false}
    var u=S.users.filter(function(x){return x.email.toLowerCase()===email})[0];
    if(u&&u.kind!=='member'){toast('That email belongs to a learner account.');return false}
    if(u&&S.memberships.some(function(m){return m.userId===u.id&&m.orgId===o.id&&['pending','active','suspended'].indexOf(m.status)>-1})){toast('That person is already a member or invited.');return false}
    if(!u){u={id:nid(),name:val(f,'name'),email:email,kind:'member',status:'active'};S.users.push(u)}
    S.memberships.push({id:nid(),userId:u.id,orgId:o.id,roles:roles,status:'pending'});
    render();toast('Invitation recorded. Approve it once the person accepts.');
  });
};
A.memApprove=function(el){var m=memOf(+el.dataset.id);if(!m)return;m.status='active';ensureTutor(m);notify(m.userId,'You were approved as a member of '+ORG(m.orgId).name+'.');render();toast(U(m.userId).name+' approved.')};
A.memReject=function(el){var m=memOf(+el.dataset.id);if(!m)return;m.status='inactive';render();toast('Request rejected.')};
A.memReactivate=function(el){var m=memOf(+el.dataset.id);if(!m)return;m.status='active';ensureTutor(m);var t=TUT(m.userId);if(t&&t.orgId===m.orgId)t.status='active';render();toast(U(m.userId).name+' is active.')};
function lastAdminGuard(m){return m.roles.indexOf('admin')>-1&&adminCount(m.orgId)<=1}
A.memSuspend=function(el){var m=memOf(+el.dataset.id);if(!m)return;if(lastAdminGuard(m)){toast('The organisation needs at least one active administrator.');return}confirmBox('Suspend '+U(m.userId).name+'?','They cannot sign in and are removed from matching until reactivated.','Suspend',function(){m.status='suspended';render();toast('Member suspended.')})};
A.memRemove=function(el){var m=memOf(+el.dataset.id);if(!m)return;if(lastAdminGuard(m)){toast('The organisation needs at least one active administrator.');return}confirmBox('Remove '+U(m.userId).name+'?','Their history stays in reports. Reassign their classrooms first.','Delete',function(){
  if(S.classrooms.some(function(c){return c.tutorId===m.userId&&['open','draft'].indexOf(c.status)>-1&&c.orgId===m.orgId})){toast('Reassign or close their open classrooms first.');return false}
  m.status='inactive';render();toast('Member removed.')})};
A.memRoles=function(el){
  var m=memOf(+el.dataset.id);if(!m)return;
  openModal('Roles for '+U(m.userId).name,'<div class="checks"><label><input type="checkbox" name="tutor"'+(m.roles.indexOf('tutor')>-1?' checked':'')+'> Tutor</label><label><input type="checkbox" name="admin"'+(m.roles.indexOf('admin')>-1?' checked':'')+'> Administrator</label></div>','Save',function(f){
    var r=[];if(chk(f,'admin'))r.push('admin');if(chk(f,'tutor'))r.push('tutor');
    if(!r.length){toast('Choose at least one role.');return false}
    if(m.roles.indexOf('admin')>-1&&r.indexOf('admin')===-1&&adminCount(m.orgId)<=1){toast('The organisation needs at least one active administrator.');return false}
    m.roles=r;ensureTutor(m);render();toast('Roles updated.');
  });
};

