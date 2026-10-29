/*
 * Event listeners and start-up. Loaded last.
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');
  if(el&&A[el.dataset.act]){e.preventDefault();A[el.dataset.act](el);return}
  if(e.target.id==='modal')closeModal();
});
document.addEventListener('submit',function(e){
  var f=e.target.closest('form[data-submit]');
  if(f&&A[f.dataset.submit]){e.preventDefault();A[f.dataset.submit](f)}
});
document.addEventListener('input',function(e){var t=e.target;if(t.dataset&&t.dataset.f&&t.type==='search'){S.f=S.f||{};S.f[t.dataset.f]=t.value;render()}});
document.addEventListener('change',function(e){var t=e.target;if(t.dataset&&t.dataset.f&&t.type!=='search'){S.f=S.f||{};S.f[t.dataset.f]=t.value;render()}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});
try{var sv=localStorage.getItem('ec-theme');if(sv==='light'||sv==='dark'||sv==='auto')S.theme=sv}catch(e){}
if(!S.theme){var ex=document.documentElement.getAttribute('data-theme');S.theme=(ex==='light'||ex==='dark')?ex:'auto'}
S.f={};
applyTheme();
render();
