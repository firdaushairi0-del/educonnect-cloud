/*
 * Smart matching: weighted, rule-based, explainable (the complex query)
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- smart matching: weighted, rule-based, explainable ---------- */
function overlap(a1,a2,b1,b2){return Math.max(0,Math.min(a2,b2)-Math.max(a1,b1))}
function timeFit(slots,p){
  var best={pts:0,slot:null};
  slots.forEach(function(sl){
    if(p.day!=='any'&&sl.day!==p.day)return;
    var b=p.band==='any'?[0,1440]:[BANDS[p.band][0],BANDS[p.band][1]];
    var ov=overlap(sl.s,sl.e,b[0],b[1]),pts=ov>=60?15:(ov>0?8:0);
    if(!best.slot||pts>best.pts)best={pts:pts,slot:sl};
  });
  return best;
}
function freeWindows(t){
  var busy=S.classrooms.filter(function(c){return c.tutorId===t.userId&&(c.status==='open'||c.status==='draft')});
  var out=[];
  t.availability.forEach(function(a){
    var parts=[[mins(a.start),mins(a.end)]];
    busy.filter(function(c){return c.day===a.day}).forEach(function(c){
      var bs=mins(c.start),be=mins(c.end),next=[];
      parts.forEach(function(r){
        if(be<=r[0]||bs>=r[1]){next.push(r);return}
        if(bs>r[0])next.push([r[0],bs]);
        if(be<r[1])next.push([be,r[1]]);
      });
      parts=next;
    });
    parts.forEach(function(r){if(r[1]-r[0]>=60)out.push({day:a.day,s:r[0],e:r[1]})});
  });
  return out;
}
function blockedDate(t,day){
  for(var w=0;w<4;w++){var d=dateFor(day,w);if(t.unavailability.some(function(u){return u.date===d}))return d}
  return '';
}
function labelOf(score){return score>=85?'Best Match':(score>=70?'Good Match':'Possible Alternative')}
function recommend(orgId,p){
  var org=ORG(orgId),out=[];
  if(!org||org.status!=='active')return out;
  function tutorOk(uid){var t=TUT(uid);return t&&t.orgId===orgId&&t.status==='active'&&MEM(uid)&&MEM(uid).orgId===orgId&&MEM(uid).roles.indexOf('tutor')>-1}
  function modeOk(m){return p.mode==='either'||m===p.mode}
  function locPts(mode,branch){return (p.branch==='any'||mode==='online'||branch===p.branch)?5:0}
  oClassrooms(orgId).forEach(function(c){
    if(c.status!=='open'||seatsLeft(c)===0||!tutorOk(c.tutorId)||c.subjectId!==p.subjectId)return;
    var sc=25,good=['Subject: '+subName(c.subjectId)],diff=[];
    if(c.level===p.level){sc+=20;good.push('Level: '+c.level)}else diff.push('Level is '+c.level+' (you chose '+p.level+')');
    if(!p.topicId||c.topicId===p.topicId){sc+=15;good.push('Topic: '+topName(c.topicId))}else diff.push('Topic is '+topName(c.topicId)+' (you chose '+topName(p.topicId)+')');
    var tf=timeFit([{day:c.day,s:mins(c.start),e:mins(c.end)}],p);sc+=tf.pts;
    if(tf.pts===15)good.push('Fits your time: '+slotText(c.day,c.start,c.end));
    else if(tf.pts===8)diff.push('Partly fits your time: '+slotText(c.day,c.start,c.end));
    else diff.push('Different time: '+slotText(c.day,c.start,c.end));
    if(modeOk(c.mode)){sc+=10;good.push('Mode: '+c.mode)}else diff.push('Mode is '+c.mode+' (you chose '+p.mode+')');
    if(p.arrangement==='either'||p.arrangement===c.arrangement){sc+=10;good.push(c.arrangement==='group'?'Group class':'One-to-one class')}else diff.push('This is a '+c.arrangement+' class (you preferred '+p.arrangement+')');
    var lp=locPts(c.mode,c.branch);sc+=lp;
    if(c.mode==='physical'){if(lp)good.push('Branch: '+c.branch);else diff.push('Branch is '+c.branch+' (you chose '+p.branch+')')}
    var tu=TUT(c.tutorId);var bd=blockedDate(tu,c.day);if(bd)diff.push('Tutor is unavailable on '+fmtD(bd));
    out.push({type:'classroom',id:c.id,title:c.title,sub:'Tutor: '+U(c.tutorId).name+' · '+slotText(c.day,c.start,c.end),score:sc,label:labelOf(sc),good:good,diff:diff,
      cap:seatsLeft(c)+' of '+c.capacity+' seats left',
      approval:c.approval==='automatic'?'Confirmed straight away if a seat is free':'Needs approval from the organisation',
      access:c.access==='guest'?'Guest registration allowed':'Account required',guestOk:c.access==='guest',arr:c.arrangement});
  });
  oTutors(orgId).forEach(function(t){
    if(!tutorOk(t.userId))return;
    var ex=null,exScore=-1;
    t.expertise.filter(function(x){return x.subjectId===p.subjectId}).forEach(function(x){
      var s=(!p.topicId||x.topicId===p.topicId?2:0)+(x.levels.indexOf(p.level)>-1?1:0);if(s>exScore){ex=x;exScore=s}});
    if(!ex)return;
    var wins=freeWindows(t);if(!wins.length)return;
    var sc=25,good=['Subject: '+subName(p.subjectId)],diff=[];
    if(ex.levels.indexOf(p.level)>-1){sc+=20;good.push('Teaches '+p.level)}else diff.push('Teaches '+ex.levels.join(', ')+' (you chose '+p.level+')');
    if(!p.topicId||ex.topicId===p.topicId){sc+=15;good.push('Topic: '+topName(ex.topicId))}else diff.push('Covers '+topName(ex.topicId)+' (you chose '+topName(p.topicId)+')');
    var tf=timeFit(wins,p);sc+=tf.pts;var w=tf.slot;
    if(tf.pts===15)good.push('Free: '+slotText(w.day,hhmm(w.s),hhmm(w.e)));
    else if(tf.pts===8)diff.push('Partly fits your time. Free: '+slotText(w.day,hhmm(w.s),hhmm(w.e)));
    else diff.push('Different time. Free: '+slotText(w.day,hhmm(w.s),hhmm(w.e)));
    var tm=p.mode==='either'||t.modes.indexOf(p.mode)>-1;
    if(tm){sc+=10;good.push('Mode: '+(p.mode==='either'?t.modes.join(' or '):p.mode))}else diff.push('Teaches '+t.modes.join(' or ')+' only');
    if(p.arrangement==='either'||p.arrangement==='one-to-one'){sc+=10;good.push('One-to-one tutoring')}else diff.push('This is one-to-one tutoring (you preferred group)');
    var lp=(p.branch==='any'||p.mode==='online'||t.branch===p.branch)?5:0;sc+=lp;
    if(lp&&t.modes.indexOf('physical')>-1)good.push('Branch: '+t.branch);else if(!lp)diff.push('Branch is '+t.branch+' (you chose '+p.branch+')');
    var bd=blockedDate(t,w.day);if(bd)diff.push('Tutor is unavailable on '+fmtD(bd));
    var len=Math.min(w.e-w.s,90);
    out.push({type:'tutor',id:t.userId,title:'One-to-one with '+U(t.userId).name,sub:slotText(w.day,hhmm(w.s),hhmm(w.s+len))+' (suggested)',score:sc,label:labelOf(sc),good:good,diff:diff,
      cap:'Individual placement',approval:'Needs approval from the organisation',access:'Account required',guestOk:false,arr:'one-to-one',
      window:{day:w.day,start:hhmm(w.s),end:hhmm(w.s+len)},topicId:ex.topicId});
  });
  out.sort(function(a,b){return b.score-a.score});
  if(p.arrangement==='group'){
    out.forEach(function(o){o.alt=o.arr!=='group'});
    out=out.filter(function(o){return !o.alt}).concat(out.filter(function(o){return o.alt}));
  }else if(p.arrangement==='one-to-one'){
    out.forEach(function(o){o.alt=o.arr==='group'});
    out=out.filter(function(o){return !o.alt}).concat(out.filter(function(o){return o.alt}));
  }
  return out;
}
function prefsText(p){
  var parts=[subName(p.subjectId),p.level];
  if(p.topicId)parts.push(topName(p.topicId));
  parts.push((p.day==='any'?'Any day':DAYFULL[p.day])+(p.band==='any'?'':' '+BANDS[p.band][2].toLowerCase()));
  parts.push(p.mode==='either'?'Physical or online':p.mode);
  if(p.mode!=='online'&&p.branch!=='any')parts.push(p.branch);
  parts.push(p.arrangement==='either'?'Group or one-to-one':p.arrangement);
  return parts.join(' · ');
}
