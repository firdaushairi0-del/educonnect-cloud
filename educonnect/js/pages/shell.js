/*
 * Signed-in shell, navigation and shared view helpers
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- signed-in shell ---------- */
function navItems(){
  var it=[];
  if(has('platform'))it=[['dashboard','Dashboard'],['orgs','Organisations'],['master','Master subjects']];
  else if(has('learner'))it=[['learning','My learning'],['myrequests','My requests'],['join','Join a provider']];
  else{
    if(has('admin'))it.push(['dashboard','Dashboard'],['requests','Matching requests'],['classrooms','Classrooms'],['sessions','Sessions'],['members','Members'],['subjects','Subjects and topics'],['reports','Reports'],['org','Organisation']);
    if(has('tutor')){
      if(has('admin'))it.push(['tutorhome','My teaching']);else it.push(['tutorhome','My classrooms'],['sessions','Sessions']);
      it.push(['profile','My tutor profile'],['feedback','Feedback received']);
    }
  }
  it.push(['notifications','Notifications']);
  return it;
}
function homeView(){return has('platform')||has('admin')?'dashboard':(has('learner')?'learning':'tutorhome')}
function shellHTML(){
  var u=ME(),o=myOrg(),items=navItems(),n=unread();
  if(!items.some(function(i){return i[0]===S.view}))S.view=homeView();
  var roleText=has('platform')?'Platform administrator':has('learner')?'Learner':myRoles().join(' + ');
  return '<div class="app"><aside class="side"><div class="brand"><i></i>EduConnect</div>'+
    (o?'<div class="orgtag"><b>'+esc(o.name)+'</b><span>Private workspace</span></div>':'')+
    '<nav class="ec-nav" aria-label="Main">'+items.map(function(i){
      var on=S.view===i[0];
      return '<button class="ec-nav-item'+(on?' on':'')+'" data-act="go" data-view="'+i[0]+'"'+(on?' aria-current="page"':'')+'><span>'+i[1]+'</span>'+(i[0]==='notifications'&&n?'<span class="ec-badge" aria-label="'+n+' unread">'+n+'</span>':'')+'</button>';
    }).join('')+'</nav><div class="me"><div><b>'+esc(u.name)+'</b><small style="text-transform:capitalize">'+esc(roleText)+'</small></div>'+themeCtl()+'<button class="ec-btn sm on-dark" data-act="logout">Sign out</button></div></aside><main class="main" id="main"><div class="wrap">'+viewHTML()+'</div></main></div>';
}
function viewHTML(){
  var v=S.view;
  var map={dashboard:viewDashboard,orgs:viewOrgs,master:viewMaster,requests:viewRequests,classrooms:viewClassrooms,sessions:viewSessions,members:viewMembers,subjects:viewSubjects,reports:viewReports,org:viewOrg,
    tutorhome:viewTutorHome,profile:viewProfile,feedback:viewFeedback,learning:viewLearning,myrequests:viewMyRequests,join:viewJoin,notifications:viewNotifications};
  return (map[v]||viewDashboard)();
}
function head(t,sub,act){return '<div class="head"><div><h1>'+t+'</h1>'+(sub?'<p>'+sub+'</p>':'')+'</div>'+(act||'')+'</div>'}
function F(k,d){return S.f&&S.f[k]!==undefined?S.f[k]:d}
function finput(k,label,ph){return '<div class="field"><label for="f_'+k+'">'+label+'</label><input id="f_'+k+'" data-f="'+k+'" type="search" value="'+esc(F(k,''))+'" placeholder="'+(ph||'Type to search')+'"></div>'}
function fselect(k,label,list,def){return '<div class="field"><label for="f_'+k+'">'+label+'</label><select id="f_'+k+'" data-f="'+k+'">'+opts(list,F(k,def||'all'))+'</select></div>'}
function tbl(h,rows,emptyText){
  if(!rows.length)return '<div class="empty"><p>'+esc(emptyText||'Nothing to show.')+'</p></div>';
  return '<div class="ec-card flat scroll"><table><thead><tr>'+h.map(function(x){return '<th>'+x+'</th>'}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
}
function btn(act,id,label,cls,extra){return '<button class="ec-btn '+(cls==='btn'?'primary':(cls||'link'))+' sm" data-act="'+act+'" data-id="'+id+'"'+(extra||'')+'>'+label+'</button>'}
function inRange(ts,from,to){var d=String(ts).slice(0,10);return (!from||d>=from)&&(!to||d<=to)}

