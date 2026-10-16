/*
 * Constants and date helpers
 * Part of EduConnect Cloud prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var nid=(function(){var n=1000;return function(){return ++n}})();
var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var DAYFULL={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
var BANDS={morning:[480,720,'Morning'],afternoon:[720,1020,'Afternoon'],evening:[1020,1320,'Evening']};
var ACAD=['Preschool','Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Form 1','Form 2','Form 3','Form 4','Form 5','Pre-University','Higher Education'];
var SKILL=['Beginner','Intermediate','Advanced','All Levels'];
var AUD=['Children','Teenagers','Adults','Senior Citizens','General Public'];
var LEVEL_GROUPS=[['Academic level',ACAD],['Skill level',SKILL],['Audience group',AUD]];
var ORG_TYPES=['Tuition centre','Independent tutor','Library','NGO education programme','Community learning centre','University outreach programme','School support programme'];
var BASE='https://educonnect.example';

/* ---------- dates ---------- */
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function today(){var d=new Date();d.setHours(0,0,0,0);return d}
function dateFor(day,weekOffset){var d=today(),cur=(d.getDay()+6)%7,diff=DAYS.indexOf(day)-cur;if(diff<=0)diff+=7;d.setDate(d.getDate()+diff+7*weekOffset);return iso(d)}
function dayOfDate(s){return DAYS[(new Date(s+'T00:00:00').getDay()+6)%7]}
function daysAgo(n){var d=today();d.setDate(d.getDate()-n);return iso(d)+'T10:00:00'}
function mins(t){var p=t.split(':');return (+p[0])*60+(+p[1])}
function hhmm(m){return pad(Math.floor(m/60))+':'+pad(m%60)}
function t12(t){var m=mins(t),h=Math.floor(m/60),ap=h>=12?'PM':'AM',h12=h%12||12;return h12+':'+pad(m%60)+' '+ap}
function fmtD(d){return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
function fmtTs(t){return new Date(t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
function fmtDay(t){return new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function hrs(n){return (Math.round(n*10)/10)+' h'}
function nowIso(){return new Date().toISOString()}
