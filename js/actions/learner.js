/*
 * Actions: leave class, check in, feedback
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* learner actions */
A.leaveClass=function(el){
  var u=ME(),e=S.enrolments.filter(function(x){return x.id===+el.dataset.id&&x.learnerId===u.id})[0];if(!e)return;var c=CLS(e.classroomId);
  confirmBox('Withdraw from '+c.title+'?','Your seat is released. You can make a new request later.','Withdraw',function(){e.status='withdrawn';notifyAdmins(c.orgId,u.name+' withdrew from '+c.title+'.');render();toast('You have withdrawn.')});
};
A.learnerCheckin=function(el){
  var u=ME(),s=SESS(+el.dataset.id);if(!s||!S.enrolments.some(function(e){return e.classroomId===s.classroomId&&e.learnerId===u.id&&e.status==='active'}))return;
  openModal('Check in','<p class="muted">Scan the QR code shown by the tutor, or type the 6 character code.</p><div class="field"><label for="ciC">Session code</label><input id="ciC" name="code" autocomplete="off" required></div>','Check in',function(f){
    if(!s.qrOpen||val(f,'code').toUpperCase()!==s.code){toast('That code is not valid for an open session.');return false}
    recordCheckin(s,'L'+u.id);render();toast('Checked in. The tutor will confirm your attendance.');
  });
};
A.giveFeedback=function(el){
  var u=ME(),s=SESS(+el.dataset.id);if(!s||!S.enrolments.some(function(e){return e.classroomId===s.classroomId&&e.learnerId===u.id&&e.status==='active'})||s.status!=='completed')return;
  var fb=S.feedback.filter(function(x){return x.sessionId===s.id&&x.learnerId===u.id})[0]||{q1:5,q2:5,q3:5,again:true,comment:''};
  var sc=function(n,l,v){return '<div class="field"><label for="'+n+'">'+l+'</label><select id="'+n+'" name="'+n+'">'+opts([[5,'5 - Strongly agree'],[4,'4'],[3,'3'],[2,'2'],[1,'1 - Strongly disagree']],v)+'</select></div>'};
  openModal('Feedback: '+s.topic,sc('q1','The session matched my needs',fb.q1)+sc('q2','The explanation was clear',fb.q2)+sc('q3','The session was well organised',fb.q3)+'<div class="field"><label for="fa">Would you attend another session?</label><select id="fa" name="again">'+opts([['yes','Yes'],['no','No']],fb.again?'yes':'no')+'</select></div><div class="field"><label for="fc">Comments (optional)</label><textarea id="fc" name="comment" rows="3">'+esc(fb.comment)+'</textarea></div><p class="note">Private. Only your tutor and the organisation administrator can see it.</p>','Send feedback',function(f){
    var x=S.feedback.filter(function(y){return y.sessionId===s.id&&y.learnerId===u.id})[0];
    var d={q1:+val(f,'q1'),q2:+val(f,'q2'),q3:+val(f,'q3'),again:val(f,'again')==='yes',comment:val(f,'comment')};
    if(x){for(var k in d)x[k]=d[k]}else S.feedback.push({id:nid(),sessionId:s.id,learnerId:u.id,q1:d.q1,q2:d.q2,q3:d.q3,again:d.again,comment:d.comment});
    render();toast('Thank you for your feedback.');
  });
};

