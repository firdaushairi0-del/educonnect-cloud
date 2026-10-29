/*
 * Sample data (stands in for the MySQL tables; nothing is saved to a server)
 * Part of Tutorbit prototype. Classic script: shares globals with the other files, so load order in index.html matters.
 */
'use strict';

/* ---------- sample data (mirrors the database tables in the specification) ---------- */
var LNAMES=['Aiman Zaki','Balqis Noor','Chong Wei Jie','Dewi Lestari','Elias Ng','Farhana Aziz','Gopal Raj','Hanis Sofea'];
var S={
  orgs:[
    {id:1,slug:'abc-tuition',name:'ABC Tuition Centre',type:'Tuition centre',desc:'Private tuition for primary and secondary school students in Melaka, with small groups and one-to-one coaching.',location:'Ayer Keroh, Melaka',contact:'hello@abc-tuition.example · 06-123 4567',branches:['Ayer Keroh','Bukit Baru'],modes:['physical','online'],status:'active'},
    {id:2,slug:'melaka-library',name:'Melaka Community Library',type:'Library',desc:'Free community workshops on digital and everyday skills for all ages.',location:'Melaka Town',contact:'programmes@melaka-library.example',branches:['Main Library'],modes:['physical'],status:'active'},
    {id:3,slug:'sarah-english',name:'Sarah Lim English Coaching',type:'Independent tutor',desc:'Online English essay and speaking coaching for secondary students and adults.',location:'Online',contact:'sarah@sarah-english.example',branches:['Online'],modes:['online'],status:'active'},
    {id:4,slug:'bright-path',name:'Bright Path Learning Hub',type:'NGO education programme',desc:'Weekend learning support for children in the community.',location:'Alor Gajah, Melaka',contact:'info@brightpath.example',branches:['Alor Gajah'],modes:['physical'],status:'pending'}
  ],
  users:[
    {id:1,name:'Dr Rahmah Yusof',email:'rahmah@tutorbit.example',kind:'platform',status:'active'},
    {id:2,name:'Aina Rahman',email:'aina@abc-tuition.example',kind:'member',status:'active'},
    {id:3,name:'Daniel Tan',email:'daniel@abc-tuition.example',kind:'member',status:'active'},
    {id:4,name:'Nurul Huda',email:'nurul@abc-tuition.example',kind:'member',status:'active'},
    {id:5,name:'Ahmad Faiz',email:'ahmad@abc-tuition.example',kind:'member',status:'active'},
    {id:6,name:'Sarah Lim',email:'sarah@sarah-english.example',kind:'member',status:'active'},
    {id:7,name:'Hafiz Ismail',email:'hafiz@melaka-library.example',kind:'member',status:'active'},
    {id:8,name:'Amir Hakim',email:'amir.guardian@example.com',kind:'learner',status:'active',note:'Account managed by guardian'},
    {id:9,name:'Siti Aisyah',email:'siti@example.com',kind:'learner',status:'active'},
    {id:10,name:'Priya Nair',email:'priya@example.com',kind:'learner',status:'active'},
    {id:11,name:'Farah Ali',email:'farah@brightpath.example',kind:'member',status:'active'}
  ],
  memberships:[
    {id:1,userId:2,orgId:1,roles:['admin'],status:'active'},
    {id:2,userId:3,orgId:1,roles:['tutor'],status:'active'},
    {id:3,userId:4,orgId:1,roles:['tutor'],status:'active'},
    {id:4,userId:5,orgId:1,roles:['tutor'],status:'active'},
    {id:5,userId:6,orgId:3,roles:['admin','tutor'],status:'active'},
    {id:6,userId:7,orgId:2,roles:['admin','tutor'],status:'active'},
    {id:7,userId:11,orgId:4,roles:['admin'],status:'pending'}
  ],
  subjects:[
    {id:1,name:'Mathematics',orgId:null,active:true},{id:2,name:'Science',orgId:null,active:true},{id:3,name:'English',orgId:null,active:true},
    {id:4,name:'Bahasa Melayu',orgId:null,active:true},{id:5,name:'Digital Skills',orgId:null,active:true},{id:6,name:'Reading Clinic',orgId:2,active:true}
  ],
  topics:[
    {id:1,subjectId:1,orgId:1,name:'Algebra',active:true},{id:2,subjectId:1,orgId:1,name:'Trigonometry',active:true},{id:3,subjectId:1,orgId:1,name:'Calculus',active:true},
    {id:4,subjectId:2,orgId:1,name:'Forces and Motion',active:true},{id:5,subjectId:2,orgId:1,name:'Chemical Reactions',active:true},
    {id:6,subjectId:3,orgId:1,name:'Essay Writing',active:true},
    {id:7,subjectId:5,orgId:2,name:'Basic Computer Use',active:true},{id:8,subjectId:5,orgId:2,name:'Microsoft Excel',active:true},{id:9,subjectId:6,orgId:2,name:'Phonics',active:true},
    {id:10,subjectId:3,orgId:3,name:'Essay Writing',active:true},{id:11,subjectId:3,orgId:3,name:'Speaking Skills',active:true}
  ],
  tutors:[
    {userId:3,orgId:1,status:'active',modes:['physical'],branch:'Ayer Keroh',
      expertise:[{id:1,subjectId:1,topicId:1,levels:['Form 4','Form 5']},{id:2,subjectId:1,topicId:2,levels:['Form 4','Form 5']}],
      availability:[{id:1,day:'Sat',start:'14:00',end:'17:00'},{id:2,day:'Wed',start:'19:00',end:'21:00'}],
      unavailability:[{id:1,date:dateFor('Sat',3),reason:'Family event'}]},
    {userId:4,orgId:1,status:'active',modes:['physical','online'],branch:'Bukit Baru',
      expertise:[{id:3,subjectId:2,topicId:4,levels:['Form 3','Form 4']},{id:4,subjectId:2,topicId:5,levels:['Form 4','Form 5']}],
      availability:[{id:3,day:'Sat',start:'09:00',end:'13:00'},{id:4,day:'Sun',start:'14:00',end:'17:00'}],unavailability:[]},
    {userId:5,orgId:1,status:'active',modes:['physical','online'],branch:'Ayer Keroh',
      expertise:[{id:5,subjectId:1,topicId:1,levels:['Form 1','Form 2','Form 3']},{id:6,subjectId:3,topicId:6,levels:['Form 2','Form 3']}],
      availability:[{id:5,day:'Mon',start:'18:00',end:'21:00'},{id:6,day:'Sat',start:'10:00',end:'12:00'}],unavailability:[]},
    {userId:6,orgId:3,status:'active',modes:['online'],branch:'Online',
      expertise:[{id:7,subjectId:3,topicId:10,levels:['Form 4','Form 5','Adults']},{id:8,subjectId:3,topicId:11,levels:['Adults','Teenagers']}],
      availability:[{id:7,day:'Tue',start:'20:00',end:'22:00'},{id:8,day:'Sun',start:'10:00',end:'13:00'}],unavailability:[]},
    {userId:7,orgId:2,status:'active',modes:['physical'],branch:'Main Library',
      expertise:[{id:9,subjectId:5,topicId:7,levels:['Beginner','All Levels','Adults']},{id:10,subjectId:5,topicId:8,levels:['Beginner','All Levels','Adults']}],
      availability:[{id:9,day:'Sat',start:'10:00',end:'13:00'}],unavailability:[]}
  ],
  classrooms:[
    {id:1,orgId:1,title:'Form 4 Mathematics Group B',subjectId:1,topicId:1,level:'Form 4',tutorId:3,mode:'physical',branch:'Ayer Keroh',capacity:6,arrangement:'group',access:'account',approval:'admin',attendance:'qr',status:'open',day:'Sat',start:'14:00',end:'16:00'},
    {id:2,orgId:1,title:'Form 3 Science Group A',subjectId:2,topicId:4,level:'Form 3',tutorId:4,mode:'physical',branch:'Bukit Baru',capacity:8,arrangement:'group',access:'account',approval:'admin',attendance:'manual',status:'open',day:'Sat',start:'10:00',end:'12:00'},
    {id:3,orgId:1,title:'Form 2 Essay Writing Clinic',subjectId:3,topicId:6,level:'Form 2',tutorId:5,mode:'online',branch:'Ayer Keroh',capacity:10,arrangement:'group',access:'guest',approval:'automatic',attendance:'manual',status:'open',day:'Mon',start:'19:00',end:'20:30'},
    {id:4,orgId:2,title:'Introduction to Microsoft Excel (one-day workshop)',subjectId:5,topicId:8,level:'Beginner',tutorId:7,mode:'physical',branch:'Main Library',capacity:12,arrangement:'group',access:'guest',approval:'automatic',attendance:'qr',status:'open',day:'Sat',start:'10:00',end:'12:00'},
    {id:5,orgId:3,title:'Form 5 Essay Writing (online)',subjectId:3,topicId:10,level:'Form 5',tutorId:6,mode:'online',branch:'Online',capacity:5,arrangement:'group',access:'account',approval:'admin',attendance:'manual',status:'open',day:'Tue',start:'20:00',end:'21:30'},
    {id:6,orgId:1,title:'Form 4 Mathematics Group A',subjectId:1,topicId:1,level:'Form 4',tutorId:3,mode:'physical',branch:'Ayer Keroh',capacity:4,arrangement:'group',access:'account',approval:'admin',attendance:'manual',status:'open',day:'Wed',start:'19:00',end:'20:30'}
  ],
  enrolments:[
    {id:1,classroomId:1,learnerId:12,status:'active'},{id:2,classroomId:1,learnerId:13,status:'active'},{id:3,classroomId:1,learnerId:14,status:'active'},{id:4,classroomId:1,learnerId:15,status:'active'},
    {id:5,classroomId:2,learnerId:9,status:'active'},{id:6,classroomId:2,learnerId:16,status:'active'},{id:7,classroomId:2,learnerId:17,status:'active'},
    {id:8,classroomId:3,learnerId:10,status:'active'},{id:9,classroomId:3,learnerId:18,status:'active'},
    {id:10,classroomId:4,learnerId:19,status:'active'},{id:11,classroomId:5,learnerId:13,status:'active'},
    {id:12,classroomId:6,learnerId:14,status:'active'},{id:13,classroomId:6,learnerId:15,status:'active'},{id:14,classroomId:6,learnerId:16,status:'active'},{id:15,classroomId:6,learnerId:17,status:'active'}
  ],
  guests:[{id:1,orgId:2,classroomId:4,name:'Mr Lim Boon',contact:'012-555 0101',ref:'EC-G0001',status:'confirmed'}],
  sessions:[],attendance:[],feedback:[],requests:[],notifications:[],
  me:null,theme:'',page:'landing',redir:null,timer:null,view:'',cb:null,
  match:null,sess:{},rep:'requests',rf:{},qf:{},cf:{},mq:'',ms:'all',oq:'',os:'all'
};
(function seed(){
  LNAMES.forEach(function(n,i){S.users.push({id:12+i,name:n,email:n.toLowerCase().replace(/[^a-z]+/g,'.')+'@example.com',kind:'learner',status:'active'})});
  function ses(c,wk,topic,status,extra){var cl=S.classrooms.filter(function(x){return x.id===c})[0];
    var s={id:nid(),classroomId:c,topic:topic,date:dateFor(cl.day,wk),start:cl.start,end:cl.end,venue:cl.mode==='online'?'Online (link shared by the tutor)':'Branch: '+cl.branch,status:status,qrOpen:false,code:''};
    for(var k in (extra||{}))s[k]=extra[k];S.sessions.push(s);return s}
  var a=ses(1,-2,'Algebra Basics','completed'),b=ses(1,-1,'Linear Equations','completed');ses(1,1,'Quadratic Equations','scheduled');
  var c=ses(2,-1,'Speed and Velocity','completed');ses(2,1,'Newton’s Laws','scheduled');
  var d=ses(3,-1,'Planning an Essay','completed');ses(3,1,'Writing Introductions','scheduled');
  ses(4,1,'Spreadsheet Basics','scheduled');ses(5,1,'Argument Essays','scheduled');ses(6,1,'Simultaneous Equations','scheduled');
  function att(s,l,st){S.attendance.push({id:nid(),sessionId:s.id,key:'L'+l,checkedIn:null,status:st})}
  att(a,12,'present');att(a,13,'present');att(a,14,'late');att(a,15,'absent');
  att(b,12,'present');att(b,13,'present');att(b,14,'present');att(b,15,'excused');
  att(c,9,'present');att(c,16,'present');att(c,17,'late');
  att(d,10,'present');att(d,18,'absent');
  function fb(s,l,x,y,z,again,cm){S.feedback.push({id:nid(),sessionId:s.id,learnerId:l,q1:x,q2:y,q3:z,again:again,comment:cm||''})}
  fb(a,12,5,4,5,true,'Clear examples.');fb(a,13,4,4,4,true,'');fb(b,12,5,5,5,true,'Very helpful.');fb(c,9,5,5,4,true,'Good pace.');fb(d,10,4,3,4,false,'');
  function rq(l,sel,st,days,sub,lvl,mode,arr){S.requests.push({id:nid(),orgId:1,learnerId:l,guest:null,prefs:{subjectId:sub,level:lvl,topicId:0,day:'Sat',band:'afternoon',mode:mode,branch:'any',arrangement:arr},selected:sel,status:st,note:'',createdAt:daysAgo(days)})}
  rq(12,{type:'classroom',id:1},'Approved',20,1,'Form 4','physical','group');rq(13,{type:'classroom',id:1},'Approved',19,1,'Form 4','physical','group');
  rq(14,{type:'classroom',id:1},'Approved',16,1,'Form 4','physical','group');rq(9,{type:'classroom',id:2},'Approved',12,2,'Form 3','physical','group');
  rq(16,{type:'classroom',id:2},'Approved',9,2,'Form 3','physical','group');rq(10,{type:'classroom',id:3},'Approved',6,3,'Form 2','online','group');
  rq(18,{type:'classroom',id:5},'Rejected',5,3,'Form 5','online','group');S.requests[S.requests.length-1].note='Class belongs to another organisation';
  rq(15,{type:'tutor',id:3},'Cancelled',4,1,'Form 4','physical','one-to-one');
  rq(17,null,'Unmatched',3,4,'Form 1','physical','either');
  rq(19,{type:'classroom',id:1},'Pending Approval',1,1,'Form 4','physical','group');
  S.requests.forEach(function(r){r.orgId=1});
  S.requests[6].orgId=1;S.requests[6].note='Not enough capacity at the preferred time';
  function nt(u,t,d){S.notifications.push({id:nid(),userId:u,text:t,read:false,ts:daysAgo(d)})}
  nt(2,'New matching request: Hanis Sofea for Form 4 Mathematics.',1);
  nt(9,'Your placement in Form 3 Science Group A was approved.',12);
  nt(1,'Bright Path Learning Hub has applied for an organisation workspace.',1);
})();

