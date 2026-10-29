/*
 * Public pages: landing, sign in, redirect, organisation registration
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- public pages ---------- */
function themeCtl(){
  return '<div class="theme" role="group" aria-label="Colour theme">'+[['light','Light'],['dark','Dark'],['auto','Auto']].map(function(t){return '<button data-act="setTheme" data-mode="'+t[0]+'" aria-pressed="'+(S.theme===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
}
function applyTheme(){var r=document.documentElement;if(S.theme==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',S.theme)}
function art(){
  return '<svg class="art" viewBox="0 0 1440 720" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">'+
  '<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D9E1FF"/></linearGradient></defs>'+
  '<circle cx="1120" cy="390" r="340" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>'+
  '<circle cx="1120" cy="390" r="260" fill="#fff" fill-opacity=".05"/><circle cx="1120" cy="390" r="180" fill="#fff" fill-opacity=".06"/>'+
  '<g fill="#fff" fill-opacity=".45"><circle cx="760" cy="90" r="5"/><circle cx="1420" cy="140" r="6"/><circle cx="700" cy="610" r="6"/><circle cx="1400" cy="660" r="5"/><circle cx="930" cy="80" r="4"/><circle cx="1260" cy="690" r="4"/></g>'+
  '<g font-family="Nunito, Trebuchet MS, sans-serif" font-weight="800" fill="#fff" fill-opacity=".35"><text x="740" y="190" font-size="68">π</text><text x="1000" y="150" font-size="60">÷</text><text x="1250" y="130" font-size="60">+</text><text x="1340" y="590" font-size="64">√</text><text x="880" y="670" font-size="54">x²</text></g>'+
  '<path d="M906 482 L906 606 Q1020 572 1120 618 Q1220 572 1334 606 L1334 482 Z" style="fill:var(--hero-accent)"/>'+
  '<path d="M1120 602 L1120 480 Q1030 440 920 472 L920 592 Q1030 562 1120 602 Z" fill="url(#pg)"/><path d="M1120 602 L1120 480 Q1210 440 1320 472 L1320 592 Q1210 562 1120 602 Z" fill="url(#pg)"/>'+
  '<g stroke="#9FB1E8" stroke-width="6" stroke-linecap="round" fill="none"><path d="M945 505 Q1030 485 1095 508"/><path d="M945 530 Q1030 510 1095 533"/><path d="M945 555 Q1030 535 1095 558"/></g>'+
  '<text x="1146" y="522" font-family="Nunito, Trebuchet MS, sans-serif" font-weight="800" font-size="25" fill="#2447D6">a² + b² = c²</text>'+
  '<g stroke="#9FB1E8" stroke-width="6" stroke-linecap="round" fill="none"><path d="M1146 548 Q1210 534 1296 546"/><path d="M1146 572 Q1210 558 1296 570"/></g>'+
  '<circle cx="1120" cy="300" r="54" style="fill:var(--hero-accent)"/><rect x="1098" y="350" width="44" height="26" rx="7" fill="#fff" fill-opacity=".92"/><rect x="1104" y="380" width="32" height="12" rx="6" fill="#fff" fill-opacity=".92"/>'+
  '<path d="M1102 318 Q1112 286 1120 306 Q1128 286 1138 318" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<g style="stroke:var(--hero-accent)" stroke-width="7" stroke-linecap="round"><path d="M1048 300 L1024 300"/><path d="M1057 264 L1037 252"/><path d="M1084 238 L1072 217"/><path d="M1120 228 L1120 204"/><path d="M1156 238 L1168 217"/><path d="M1183 264 L1203 252"/><path d="M1192 300 L1216 300"/></g>'+
  '<path d="M880 212 L968 246 L880 280 L792 246 Z" fill="#fff" fill-opacity=".96"/><path d="M830 266 L830 300 Q880 326 930 300 L930 266 L880 286 Z" fill="#D9E1FF"/>'+
  '<path d="M958 250 L958 292" style="stroke:var(--hero-accent)" stroke-width="5" stroke-linecap="round"/><circle cx="958" cy="298" r="7" style="fill:var(--hero-accent)"/>'+
  '<g transform="translate(1300 270) rotate(35)"><rect x="-15" y="-72" width="30" height="112" rx="4" style="fill:var(--hero-accent)"/><rect x="-15" y="-90" width="30" height="20" rx="5" fill="#FF9FB5"/><rect x="-15" y="-66" width="30" height="8" fill="#fff" fill-opacity=".7"/><path d="M-15 40 L15 40 L0 74 Z" fill="#F5DDB5"/><path d="M-5.5 62 L5.5 62 L0 74 Z" fill="#14204A"/></g>'+
  '<rect x="1310" y="392" width="116" height="62" rx="22" style="fill:var(--hero-accent)"/><path d="M1396 452 L1408 478 L1372 452 Z" style="fill:var(--hero-accent)"/><g stroke="#14204A" stroke-width="6" stroke-linecap="round"><path d="M1332 412 L1404 412"/><path d="M1332 432 L1384 432"/></g>'+
  '</svg>';
}
function topbar(mode){
  var links=mode==='landing'?'<nav class="toplinks" aria-label="Site"><button data-act="scrollTo" data-to="how">How it works</button><button data-act="scrollTo" data-to="who">Who it is for</button></nav>':'';
  var right=mode==='landing'?'<button class="ec-btn sm ghost-dark" data-act="goPage" data-page="register">Register an organisation</button><button class="ec-btn sm" data-act="goPage" data-page="login">Sign in</button>':
    mode==='login'?'<button class="ec-btn sm ghost-dark" data-act="goPage" data-page="landing">Back to home</button>':
    mode==='org'?'<button class="ec-btn sm" data-act="goPage" data-page="login">Sign in</button>':'';
  return '<header class="topbar"><div class="topin"><button class="brandbtn" data-act="goPage" data-page="landing"><i></i>Tutorbit</button>'+links+themeCtl()+right+'</div></header>';
}
function landingHTML(){
  var steps=[
    ['Set up your workspace','An education provider registers, adds its tutors, subjects and classrooms, and gets its own QR code and link.'],
    ['Learners scan your QR code','A learner or guardian enters subject, level, topic, time, mode, location and group or one-to-one preference.'],
    ['Get explained recommendations','Only that provider’s tutors and classrooms are searched. Results are labelled Best Match, Good Match or Possible Alternative with reasons.'],
    ['Provider approves, sessions run','The provider approves the placement, schedules sessions, records attendance and collects private feedback.']
  ];
  var who=[
    ['Tuition centres and independent tutors',['Replace WhatsApp and spreadsheets for placement','One-to-one and group classrooms in one place','Independent tutors hold both admin and tutor roles']],
    ['Libraries, NGOs and community centres',['Run one-time workshops that allow guest registration','Share one QR code on a poster or booth','Reports for capacity, attendance and tutor activity']],
    ['Learners and guardians',['No searching through a public tutor list','Enter your needs once and see what fits','Track requests, sessions and give private feedback']]
  ];
  return topbar('landing')+
  '<section class="hero">'+art()+'<div class="heroin"><div class="stack" style="gap:20px"><p class="eyebrow" style="color:var(--hero-accent)">Matching and session management for education providers</p><h1>Match every learner to the right tutor or class</h1><p class="ec-lead">Tutorbit helps a provider connect a learner’s needs with a suitable tutor or existing classroom, then manage the sessions that follow.</p><div class="ec-row"><button class="ec-btn big" data-act="goPage" data-page="register">Register an organisation</button><button class="ec-btn big ghost-dark" data-act="openOrg" data-slug="abc-tuition">Try the learner QR page</button></div><p class="sdg">Supports UN Sustainable Development Goal 4: Quality Education</p></div></div></section>'+
  '<section class="sec" id="how"><div class="stack" style="gap:8px"><p class="eyebrow" style="color:var(--accent)">How it works</p><h2 class="h2l">From a learner’s need to a scheduled class</h2></div><ol class="steps">'+steps.map(function(s){return '<li><h3>'+esc(s[0])+'</h3><p class="muted">'+esc(s[1])+'</p></li>'}).join('')+'</ol></section>'+
  '<div class="band"><section class="sec" id="who"><div class="stack" style="gap:8px"><p class="eyebrow" style="color:var(--accent)">Who it is for</p><h2 class="h2l">Private workspaces, not a public marketplace</h2><p class="muted" style="max-width:62ch">Each provider controls its own tutors, classrooms and approvals. A learner only ever sees the provider whose QR code or link they opened.</p></div><div class="cards3">'+who.map(function(w){return '<div class="ec-card stack" style="gap:12px"><h3>'+esc(w[0])+'</h3><ul class="ticks">'+w[1].map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ul></div>'}).join('')+'</div></section></div>'+
  '<section class="sec cta"><div class="stack" style="gap:8px"><h2 class="h2l">Ready to try the prototype?</h2><p class="muted">Sign in as a sample user to see each role, or scan the demo QR page as a learner.</p></div><div class="ec-row"><button class="ec-btn big" data-act="goPage" data-page="login">Sign in</button></div></section>'+
  '<footer class="foot"><div class="footin"><span>Tutorbit · Workshop 2 project · BITA Sem 1 Session 2026/2027</span><span>Prototype with sample data. Nothing is saved to a server.</span></div></footer>';
}
function loginHTML(){
  var groups=[['Platform administrator',function(u){return u.kind==='platform'}],['Organisation staff',function(u){return u.kind==='member'}],['Learners and guardians',function(u){return u.kind==='learner'&&u.id<=10}]];
  function sub(u){
    if(u.kind==='platform')return 'Manages the Tutorbit platform';
    if(u.kind==='learner')return (u.note||'Learner account');
    var m=S.memberships.filter(function(x){return x.userId===u.id})[0],o=m&&ORG(m.orgId);
    if(!m)return '';
    if(m.status!=='active'||o.status!=='active')return o.name+' · awaiting approval';
    return o.name+' · '+m.roles.join(' + ');
  }
  function dis(u){var m=S.memberships.filter(function(x){return x.userId===u.id})[0];return u.kind==='member'&&(!m||m.status!=='active'||ORG(m.orgId).status!=='active')}
  return topbar('login')+'<div class="login"><div class="stack"><p class="eyebrow" style="color:var(--accent)">Sign in</p><h1>Choose a sample user</h1><p class="muted" style="max-width:60ch">After you sign in you are redirected to the right home page for your role. In the deployed system sign-in is handled by Amazon Cognito.</p></div>'+
  groups.map(function(g){return '<div class="stack"><h3>'+g[0]+'</h3><div class="users">'+S.users.filter(g[1]).map(function(u){
    return '<button class="ub" data-act="login" data-id="'+u.id+'"'+(dis(u)?' disabled':'')+'><span class="avatar">'+esc(initials(u.name))+'</span><span><b>'+esc(u.name)+'</b><br><small class="muted">'+esc(sub(u))+'</small></span></button>';
  }).join('')+'</div></div>'}).join('')+
  '<p class="note">Prototype with sample data. Changes stay in this page and are not saved to a server.</p></div>';
}
function redirectHTML(){
  var r=S.redir||{};
  return topbar('none')+'<section class="redir">'+art()+'<div class="rcard ec-card" role="status" aria-live="polite">'+(r.avatar?'<span class="avatar big">'+esc(r.avatar)+'</span>':'')+'<h1>'+esc(r.title||'')+'</h1><p class="muted">'+esc(r.text||'')+'</p><div class="ec-progress" aria-hidden="true"><span></span></div><button class="ec-btn" data-act="finishRedirect">'+esc(r.label||'Continue')+'</button></div></section>';
}
function startRedirect(r){S.redir=r;S.page='redirect';render();window.scrollTo(0,0);clearTimeout(S.timer);S.timer=setTimeout(A.finishRedirect,1800)}

function registerHTML(){
  var done=S.regDone;
  if(done)return topbar('login')+'<div class="formpage"><div class="ec-card stack"><p class="eyebrow" style="color:var(--ok)">Application received</p><h1>'+esc(done.name)+'</h1><p>Your workspace is waiting for platform approval. Until then you cannot sign in as its administrator.</p><dl class="kv"><dt>Organisation code</dt><dd class="num">'+esc(orgCode(done))+'</dd><dt>Learner link</dt><dd class="route">'+esc(BASE+'/o/'+done.slug+'/match')+'</dd></dl><p class="note">For this prototype, sign in as the platform administrator (Dr Rahmah Yusof) to approve it.</p><div class="ec-row"><button class="ec-btn" data-act="goPage" data-page="login">Go to sign in</button></div></div></div>';
  return topbar('login')+'<div class="formpage"><div class="stack"><p class="eyebrow" style="color:var(--accent)">For education providers</p><h1>Register an organisation</h1><p class="muted">You become the first organisation administrator. Independent tutors get a one-person workspace and hold both the administrator and tutor roles.</p></div>'+
  '<form class="ec-card stack" data-submit="register"><div class="grid2"><div class="field"><label for="rName">Organisation name</label><input id="rName" name="name" required></div><div class="field"><label for="rType">Type</label><select id="rType" name="type">'+opts(ORG_TYPES.map(function(t){return [t,t]}),'Tuition centre')+'</select></div></div>'+
  '<div class="grid2"><div class="field"><label for="rAdmin">Your name</label><input id="rAdmin" name="admin" required></div><div class="field"><label for="rEmail">Your email</label><input id="rEmail" name="email" type="email" required></div></div>'+
  '<div class="grid2"><div class="field"><label for="rLoc">General location</label><input id="rLoc" name="location" placeholder="Town or area" required></div><div class="field"><label for="rContact">Public contact</label><input id="rContact" name="contact" placeholder="Email or phone" required></div></div>'+
  '<div class="field"><label for="rDesc">Short introduction</label><textarea id="rDesc" name="desc" rows="3" placeholder="Shown at the top of your learner QR form"></textarea></div>'+
  '<fieldset class="field" style="border:0;padding:0;margin:0"><legend>Learning modes</legend><div class="checks"><label><input type="checkbox" name="modePhysical" checked> Physical</label><label><input type="checkbox" name="modeOnline"> Online</label></div></fieldset>'+
  '<label class="checks"><input type="checkbox" name="solo"> I am an independent tutor (I will also teach in this workspace)</label>'+
  '<div class="ec-row end"><button type="button" class="ec-btn ghost" data-act="goPage" data-page="landing">Cancel</button><button class="ec-btn" type="submit">Submit application</button></div></form></div>';
}
function orgCode(o){return 'EC-'+(1000+o.id*37)}

