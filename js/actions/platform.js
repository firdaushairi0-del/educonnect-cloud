/*
 * Actions: approve or suspend organisations, master subjects
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* platform administrator */
A.orgApprove=function(el){
  var o=ORG(+el.dataset.id);o.status='active';
  S.memberships.forEach(function(m){if(m.orgId===o.id&&m.status==='pending'&&m.roles.indexOf('admin')>-1){m.status='active';ensureTutor(m);notify(m.userId,o.name+' is now active. Welcome to Tutorbit.')}});
  render();toast(o.name+' approved.');
};
A.orgReject=function(el){var o=ORG(+el.dataset.id);confirmBox('Reject '+o.name+'?','The workspace is marked inactive and its applicant cannot sign in.','Reject',function(){o.status='inactive';S.memberships.forEach(function(m){if(m.orgId===o.id)m.status='inactive'});render();toast('Application rejected.')})};
A.orgSuspend=function(el){var o=ORG(+el.dataset.id);confirmBox('Suspend '+o.name+'?','Its staff cannot sign in and learners cannot open its QR page until it is reactivated.','Suspend',function(){o.status='suspended';render();toast(o.name+' suspended.')})};
A.orgReactivate=function(el){var o=ORG(+el.dataset.id);o.status='active';S.memberships.forEach(function(m){if(m.orgId===o.id&&m.status==='inactive'&&m.roles.indexOf('admin')>-1){m.status='active';ensureTutor(m)}});render();toast(o.name+' is active.')};
function subjectForm(s){return '<div class="field"><label for="sbN">Subject name</label><input id="sbN" name="name" value="'+esc(s?s.name:'')+'" required></div>'}
function subjectNameTaken(name,orgId,exceptId){return S.subjects.some(function(s){return s.id!==exceptId&&s.name.toLowerCase()===name.toLowerCase()&&(s.orgId===null||s.orgId===orgId)})}
A.addMaster=function(){openModal('Add master subject',subjectForm(),'Add subject',function(f){var n=val(f,'name');if(subjectNameTaken(n,null,0)){toast('That subject already exists.');return false}S.subjects.push({id:nid(),name:n,orgId:null,active:true});render();toast('Subject added.')})};
A.addOrgSubject=function(){var o=myOrg();openModal('Add private subject',subjectForm()+'<p class="note">Private subjects are only visible to your organisation.</p>','Add subject',function(f){var n=val(f,'name');if(subjectNameTaken(n,o.id,0)){toast('That subject already exists.');return false}S.subjects.push({id:nid(),name:n,orgId:o.id,active:true});render();toast('Subject added.')})};
A.renameSubject=function(el){var s=SUB(+el.dataset.id),o=myOrg();if(s.orgId!==null&&(!o||s.orgId!==o.id)&&!has('platform'))return;openModal('Rename subject',subjectForm(s),'Save',function(f){var n=val(f,'name');if(subjectNameTaken(n,s.orgId,s.id)){toast('That subject already exists.');return false}s.name=n;render();toast('Subject renamed.')})};
A.toggleSubject=function(el){
  var s=SUB(+el.dataset.id);
  if(s.active&&S.classrooms.some(function(c){return c.subjectId===s.id&&['open','draft'].indexOf(c.status)>-1})){toast('This subject is used by open classrooms. Close them first.');return}
  s.active=!s.active;render();toast(s.name+(s.active?' is active.':' is deactivated.'));
};
A.promoteSubject=function(el){var s=SUB(+el.dataset.id);confirmBox('Promote '+s.name+'?','It becomes a master subject that every organisation can choose.','Promote',function(){s.orgId=null;render();toast(s.name+' is now a master subject.')})};

