/*
 * Reports: matching requests, capacity, attendance, tutor activity
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- reports ---------- */
function viewReports(){
  var o=myOrg(),tab=S.rep,tabs=[['requests','Matching requests'],['capacity','Classroom capacity'],['attendance','Attendance'],['tutors','Tutor activity']];
  var body=tab==='capacity'?repCapacity(o):tab==='attendance'?repAttendance(o):tab==='tutors'?repTutors(o):repRequests(o);
  return head('Reports','Operational reports for '+esc(o.name))+'<div class="tabs" role="tablist">'+tabs.map(function(t){return '<button class="tab'+(tab===t[0]?' on':'')+'" role="tab" aria-selected="'+(tab===t[0])+'" data-act="repTab" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+body;
}
function repRequests(o){
  var from=F('rq_from',''),to=F('rq_to',''),sj=F('rq_sj','all'),lv=F('rq_lv','all'),st=F('rq_st','all'),ar=F('rq_ar','all');
  var list=S.requests.filter(function(r){return r.orgId===o.id&&inRange(r.createdAt,from,to)&&(sj==='all'||r.prefs.subjectId===+sj)&&(lv==='all'||r.prefs.level===lv)&&(st==='all'||r.status===st)&&(ar==='all'||r.prefs.arrangement===ar)});
  var c=function(s){return list.filter(function(r){return r.status===s}).length};
  var decided=c('Approved')+c('Rejected'),rate=list.length?Math.round(c('Approved')/list.length*100):null;
  var by={};list.forEach(function(r){var k=subName(r.prefs.subjectId);by[k]=(by[k]||0)+1});
  var keys=Object.keys(by).sort(function(a,b){return by[b]-by[a]}),max=keys.length?by[keys[0]]:0;
  return '<div class="filters"><div class="field"><label for="f_rq_from">From</label><input id="f_rq_from" data-f="rq_from" type="date" value="'+esc(from)+'"></div><div class="field"><label for="f_rq_to">To</label><input id="f_rq_to" data-f="rq_to" type="date" value="'+esc(to)+'"></div>'+fselect('rq_sj','Subject',[['all','All subjects']].concat(oSubjects(o.id).map(function(s){return [s.id,s.name]})))+
    '<div class="field"><label for="f_rq_lv">Level</label><select id="f_rq_lv" data-f="rq_lv"><option value="all">All levels</option>'+LEVEL_GROUPS.map(function(g){return '<optgroup label="'+g[0]+'">'+g[1].map(function(v){return '<option'+(v===lv?' selected':'')+'>'+esc(v)+'</option>'}).join('')+'</optgroup>'}).join('')+'</select></div>'+
    fselect('rq_st','Status',[['all','All statuses'],['Pending Approval','Pending Approval'],['Approved','Approved'],['Rejected','Rejected'],['Cancelled','Cancelled'],['Unmatched','Unmatched']])+fselect('rq_ar','Arrangement',[['all','Any'],['group','Group'],['one-to-one','One-to-one'],['either','Either']])+'</div>'+
    '<div class="stats"><div class="stat"><b class="num">'+list.length+'</b><span>Total requests</span></div><div class="stat"><b class="num">'+c('Pending Approval')+'</b><span>Pending</span></div><div class="stat"><b class="num">'+c('Approved')+'</b><span>Approved</span></div><div class="stat"><b class="num">'+c('Rejected')+'</b><span>Rejected</span></div><div class="stat"><b class="num">'+c('Cancelled')+'</b><span>Cancelled</span></div><div class="stat"><b class="num">'+c('Unmatched')+'</b><span>Unmatched</span></div><div class="stat"><b class="num">'+(rate===null?'None':rate+'%')+'</b><span>Successful placement rate</span></div></div>'+
    '<section class="ec-card stack"><h2>Requests by subject</h2>'+(keys.length?'<div class="bars">'+keys.map(function(k){return bar(k,by[k],max,by[k]===1?' request':' requests')}).join('')+'</div>':'<p class="muted">No requests in this filter.</p>')+'</section><p class="note">Successful placement rate = approved requests divided by all requests in the filter ('+decided+' decided so far).</p>';
}
function repCapacity(o){
  var sj=F('cp_sj','all'),tu=F('cp_tu','all'),st=F('cp_st','all'),br=F('cp_br','all'),md=F('cp_md','all');
  var list=oClassrooms(o.id).filter(function(c){return (sj==='all'||c.subjectId===+sj)&&(tu==='all'||c.tutorId===+tu)&&(st==='all'||cstatus(c)===st)&&(br==='all'||c.branch===br)&&(md==='all'||c.mode===md)});
  var max=Math.max.apply(null,list.map(function(c){return c.capacity}).concat([1]));
  return '<div class="filters">'+fselect('cp_sj','Subject',[['all','All subjects']].concat(oSubjects(o.id).map(function(s){return [s.id,s.name]})))+fselect('cp_tu','Tutor',[['all','All tutors']].concat(oTutors(o.id).map(function(t){return [t.userId,U(t.userId).name]})))+fselect('cp_st','Status',[['all','All statuses'],['draft','Draft'],['open','Open'],['full','Full'],['closed','Closed'],['completed','Completed'],['cancelled','Cancelled'],['archived','Archived']])+fselect('cp_br','Branch',[['all','All branches']].concat(o.branches.map(function(b){return [b,b]})))+fselect('cp_md','Mode',[['all','Any mode'],['physical','Physical'],['online','Online']])+'</div>'+
    tbl(['Classroom','Subject and level','Tutor','Max','Confirmed','Remaining','Status'],list.map(function(c){var l=enrolled(c);return '<tr><td><b>'+esc(c.title)+'</b></td><td>'+esc(subName(c.subjectId)+' · '+c.level)+'</td><td>'+esc(U(c.tutorId).name)+'</td><td class="num">'+c.capacity+'</td><td class="num">'+l+'<div class="bar" style="margin-top:4px"><span style="width:'+(l/max*100)+'%"></span></div></td><td class="num">'+seatsLeft(c)+'</td><td>'+statusPill(cstatus(c))+'</td></tr>'}),'No classrooms match.')+
    '<p class="note">Pending requests do not use a seat until the organisation approves them.</p>';
}
function repAttendance(o){
  var from=F('at_from',''),to=F('at_to',''),cf=F('at_cl','all');
  var ss=orgSessions(o.id).filter(function(s){return (cf==='all'||s.classroomId===+cf)&&(!from||s.date>=from)&&(!to||s.date<=to)});
  var st=attStats(ss);
  var per=oClassrooms(o.id).filter(function(c){return cf==='all'||c.id===+cf}).map(function(c){var a=attStats(ss.filter(function(s){return s.classroomId===c.id}));return {c:c,a:a}}).filter(function(x){return x.a.done>0});
  return '<div class="filters"><div class="field"><label for="f_at_from">From</label><input id="f_at_from" data-f="at_from" type="date" value="'+esc(from)+'"></div><div class="field"><label for="f_at_to">To</label><input id="f_at_to" data-f="at_to" type="date" value="'+esc(to)+'"></div>'+fselect('at_cl','Classroom',[['all','All classrooms']].concat(oClassrooms(o.id).map(function(c){return [c.id,c.title]})))+'</div>'+
    '<div class="stats"><div class="stat"><b class="num">'+st.sched+'</b><span>Scheduled sessions</span></div><div class="stat"><b class="num">'+st.done+'</b><span>Completed sessions</span></div><div class="stat"><b class="num">'+st.present+'</b><span>Present</span></div><div class="stat"><b class="num">'+st.late+'</b><span>Late</span></div><div class="stat"><b class="num">'+st.absent+'</b><span>Absent</span></div><div class="stat"><b class="num">'+st.excused+'</b><span>Excused</span></div><div class="stat"><b class="num">'+(st.rate===null?'None':st.rate+'%')+'</b><span>Attendance rate</span></div></div>'+
    tbl(['Classroom','Completed sessions','Present','Late','Absent','Excused','Rate'],per.map(function(x){return '<tr><td><b>'+esc(x.c.title)+'</b></td><td class="num">'+x.a.done+'</td><td class="num">'+x.a.present+'</td><td class="num">'+x.a.late+'</td><td class="num">'+x.a.absent+'</td><td class="num">'+x.a.excused+'</td><td class="num">'+(x.a.rate===null?'None':x.a.rate+'%')+'</td></tr>'}),'No completed sessions with attendance in this filter.')+
    '<p class="note">Attended = Present + Late. Attendance rate = attended divided by all recorded attendance, times 100. Excused absences are shown but are not counted as attended.</p>';
}
function repTutors(o){
  var td=iso(today());
  var list=oTutors(o.id).map(function(t){
    var cls=oClassrooms(o.id).filter(function(c){return c.tutorId===t.userId&&['open','draft','closed'].indexOf(c.status)>-1});
    var ids=oClassrooms(o.id).filter(function(c){return c.tutorId===t.userId}).map(function(c){return c.id});
    var ss=S.sessions.filter(function(s){return ids.indexOf(s.classroomId)>-1}),done=ss.filter(function(s){return s.status==='completed'});
    var hours=0;done.forEach(function(s){hours+=(mins(s.end)-mins(s.start))/60});
    var lr={};S.enrolments.forEach(function(e){if(e.status==='active'&&cls.some(function(c){return c.id===e.classroomId}))lr[e.learnerId]=1});
    return {t:t,cls:cls.length,learners:Object.keys(lr).length,done:done.length,hours:hours,up:ss.filter(function(s){return s.status==='scheduled'&&s.date>=td}).length};
  });
  return tbl(['Tutor','Assigned classrooms','Active learners','Sessions conducted','Completed hours','Upcoming sessions'],list.map(function(x){return '<tr><td><b>'+esc(U(x.t.userId).name)+'</b></td><td class="num">'+x.cls+'</td><td class="num">'+x.learners+'</td><td class="num">'+x.done+'</td><td class="num">'+hrs(x.hours)+'</td><td class="num">'+x.up+'</td></tr>'}),'No tutors yet.')+
    '<p class="note">This report measures activity, not quality. Private feedback is never turned into a ranking.</p>';
}

