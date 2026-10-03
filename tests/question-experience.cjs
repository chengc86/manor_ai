// The question experience's server side, against a small made-up bank so it never depends on the real questions:
// topic focus, several-answer questions, each pupil's own choice order, reports, helpsheets, mastery, mock tests and retired questions.
// Uses an on-disk SQL database.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const buildLib=require('./build-lib.cjs');
const dir=buildLib('question-experience',[['app/api/game/route.ts','game.cjs'],['app/api/review/route.ts','review.cjs'],['app/api/help/route.ts','help.cjs'],['app/api/mastery/route.ts','mastery-route.cjs'],['app/api/topic/route.ts','topic-route.cjs'],['app/api/teacher/route.ts','teacher-route.cjs']],{only:[]});
// A tiny Year 6 bank: sums with their choices in number order, pick-two questions (two answers), picture choices and a Science topic.
fs.writeFileSync(path.join(dir,'bank-maths.cjs'),`const K=require('./bank-kit.cjs');const hs={intro:'Add the columns.',steps:['Line up the digits.','Add each column, carrying tens.']};
exports.mathsBank=K.combine(
 K.build({id:'ma-test-add',subject:'Maths',strand:'Test',title:'Adding',helpsheet:hs},14,(r,i)=>{const a=r.int(10,99),b=r.int(10,99);return {prompt:'What is '+a+' + '+b+'?',answer:String(a+b),wrong:[String(a+b+1),String(a+b+10),String(a+b-1)],order:'sorted',explanation:'- '+a+' + '+b+' = '+(a+b)};}),
 K.build({id:'ma-test-pick',subject:'Maths',strand:'Test',title:'Picking two',helpsheet:hs},12,(r,i)=>{const n=r.int(2,40)*2;return {prompt:'Select the **two** even numbers.',stimulus:'Set '+i,answer:[String(n),String(n+2)],wrong:[String(n+1),String(n+3),String(n+5)],explanation:'- Even numbers end in 0, 2, 4, 6 or 8.'};}),
 K.build({id:'ma-test-clock',subject:'Maths',strand:'Test',title:'Clocks',helpsheet:hs},10,(r,i)=>{const h=r.int(1,12),clock=x=>({kind:'clock',h:x,m:0});return {prompt:'Which clock shows '+h+" o'clock?",answer:'right',pictures:[{key:'right',visual:clock(h)},...[2,4,6,8].map(d=>({key:'k'+d,visual:clock((h+d-1)%12+1)}))],explanation:'- The hour hand points to '+h+'.'};}));`);
fs.writeFileSync(path.join(dir,'bank-science.cjs'),`const K=require('./bank-kit.cjs');exports.scienceBank=K.combine(K.build({id:'sc-test-light',subject:'Science',strand:'Physics',title:'Light',helpsheet:{intro:'Light travels in straight lines.',steps:['Find the light source.','Follow the straight line.']}},12,(r,i)=>({prompt:'Light question '+i+': which travels in straight lines?',answer:'light',wrong:['sound '+i,'shadow','darkness'],explanation:'- Light travels in straight lines.'})));`);
const file=path.join(dir,'test.sqlite');let sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const req=m=>require(path.join(dir,m));
const W=req('world.cjs'),GAME=req('game.cjs'),REVIEW=req('review.cjs'),HELP=req('help.cjs'),MASTERY=req('mastery-route.cjs'),TOPIC=req('topic-route.cjs'),TEACHER=req('teacher-route.cjs'),{questions,questionById,publicQuestion,toViewer,toCanonical}=req('questions.cjs'),{bankQuestions}=req('bank.cjs');
const request=(url,uid,body,headers={})=>new Request('https://game.test'+url,{method:body?'POST':'GET',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Questions':'3','X-Quest-Heroes':'5',...headers},...(body?{body:JSON.stringify(body)}:{})});
const read=async r=>({status:r.status,body:await r.json()});
const game=(uid,body)=>GAME.POST(request('/api/game',uid,{requestId:crypto.randomUUID(),...body})).then(read);
const view=async uid=>(await read(await GAME.GET(request('/api/game',uid)))).body;
// Answers as this pupil sees them: picture choices keep their letters while the pictures move, so each pupil has their own letters.
const answerFor=(q,uid)=>{const a=toViewer(q,uid,q.answers);return q.select>1?a:a[0];};
// A wrong answer that is still a valid choice: a pick-two question needs two options, or the question stays unanswered.
const wrongFor=(q,uid)=>{const right=toViewer(q,uid,q.answers),others=q.options.filter(o=>!right.includes(o));return q.select>1?others.slice(0,q.select):others[0];};
(async()=>{
for(const uid of ['a','b','c','teacher']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+7*86400000);if(uid!=='teacher')await W.mutate(w=>{w.players[uid]=W.newPlayer(uid)});}
assert.equal(bankQuestions.length,48);assert(questions.filter(q=>q.legacy).length>2000);assert(questions.every(q=>q.legacy||q.difficulty==='Year 2'||q.id.startsWith('v2-')));

// Old pages are asked to refresh before they can see the new question formats.
assert.equal((await read(await GAME.POST(request('/api/game','a',{action:'question',subject:'Maths'},{'X-Quest-Questions':'2'})))).status,409);
// Year 6 practice only asks the new bank; each question carries its topic but never its answers.
let q=await game('a',{action:'question',subject:'Maths'});assert.equal(q.status,200);assert(q.body.question.id.startsWith('v2-ma-test-'));assert(q.body.question.topicTitle);assert(!('answers' in q.body.question)&&!('explanation' in q.body.question)&&!('legacy' in q.body.question));
await game('a',{action:'answer',token:q.body.token,answer:answerFor(questionById.get(q.body.question.id),'a')});
// Topic focus: the chosen topic comes first. A several-answer question needs exactly that many choices.
q=await game('a',{action:'question',subject:'Maths',topics:['ma-test-pick']});assert.equal(q.body.question.topic,'ma-test-pick');assert.equal(q.body.question.select,2);assert.deepEqual(q.body.focus,[{id:'ma-test-pick',title:'Picking two'}]);
const pickQ=questionById.get(q.body.question.id);
assert.equal((await game('a',{action:'answer',token:q.body.token,answer:pickQ.answers[0]})).status,400);
const wrongPair=[pickQ.answers[0],pickQ.options.find(o=>!pickQ.answers.includes(o))];let r=await game('a',{action:'answer',token:q.body.token,answer:wrongPair});assert.equal(r.status,200);assert.equal(r.body.correct,false);assert(!('answers' in r.body)&&!('explanation' in r.body));
let notebook=(await read(await REVIEW.GET(request('/api/review?filter=all','a')))).body;const entry=notebook.entries.find(m=>m.id===pickQ.id);assert.equal(entry.lastAnswer,wrongPair.join(' · '));assert(!('answers' in entry));
q=await game('a',{action:'question',subject:'Maths',topics:['ma-test-pick']});r=await game('a',{action:'answer',token:q.body.token,answer:[...questionById.get(q.body.question.id).answers].reverse()});assert.equal(r.body.correct,true);assert.deepEqual(r.body.answers.length,2);assert(r.body.explanation);
// Topics from another subject are ignored rather than trusted.
q=await game('a',{action:'question',subject:'Maths',topics:['sc-test-light']});assert.equal(q.body.question.subject,'Maths');assert.equal(q.body.focus,undefined);assert.equal((await game('a',{action:'answer',token:q.body.token,answer:wrongFor(questionById.get(q.body.question.id),'a')})).status,200);
console.log('PASS: only the new bank is asked; topic focus works and ignores other subjects; several-answer questions need exactly their number of choices; answers stay hidden when wrong.');

// Each pupil sees choices in their own order, so "it's C" means nothing to a friend. Picture choices keep their letters while the
// pictures move; text choices move with their text. Choices in a fixed order (numbers in order), Year 2 and retired questions never move.
const clocks=bankQuestions.filter(x=>x.topic==='ma-test-clock'),picks=bankQuestions.filter(x=>x.topic==='ma-test-pick'),sums=bankQuestions.filter(x=>x.topic==='ma-test-add'),seen=v=>v.map(x=>JSON.stringify(x)).sort().join();
for(const x of clocks)for(const uid of ['a','b']){const pub=publicQuestion(x,undefined,uid),mine=toViewer(x,uid,x.answers)[0];assert.deepEqual(pub.options,x.options);assert.equal(seen(pub.optionVisuals),seen(x.optionVisuals));
 assert.deepEqual(pub.optionVisuals[pub.options.indexOf(mine)],x.optionVisuals[x.options.indexOf(x.answers[0])]);assert.equal(toCanonical(x,uid,mine),x.answers[0]);}
assert(clocks.some(x=>toViewer(x,'a',x.answers)[0]!==toViewer(x,'b',x.answers)[0]));
assert(picks.every(x=>seen(publicQuestion(x,undefined,'a').options)===seen(x.options)));assert(picks.some(x=>publicQuestion(x,undefined,'a').options.join()!==publicQuestion(x,undefined,'b').options.join()));
assert(sums.every(x=>x.fixedOrder&&publicQuestion(x,undefined,'a').options.join()===x.options.join()&&!('fixedOrder' in publicQuestion(x,undefined,'a'))));
const old=questions.find(x=>x.legacy&&x.options?.length>2&&!x.options.every(o=>/^[A-Z]$/.test(o))),y2=questions.find(x=>x.difficulty==='Year 2'&&x.options?.length>2);
assert.deepEqual(publicQuestion(old,undefined,'a').options,old.options);if(y2)assert.deepEqual(publicQuestion(y2,undefined,'a').options,y2.options);
q=await game('a',{action:'question',subject:'Maths',topics:['ma-test-clock']});const clockQ=questionById.get(q.body.question.id);assert.deepEqual(q.body.question.optionVisuals,publicQuestion(clockQ,undefined,'a').optionVisuals);
r=await game('a',{action:'answer',token:q.body.token,answer:answerFor(clockQ,'a')});assert.equal(r.body.correct,true);assert.deepEqual(r.body.answers,toViewer(clockQ,'a',clockQ.answers));
console.log('PASS: each pupil has their own choice order, marked on their own letters; fixed-order, Year 2 and retired questions keep theirs.');

// Weakest topics: a topic with wrong answers is chosen before an untouched one.
for(let i=0;i<3;i++){q=await game('a',{action:'question',subject:'Maths',topics:['ma-test-add']});assert.equal(q.body.question.topic,'ma-test-add');assert.equal((await game('a',{action:'answer',token:q.body.token,answer:'1'})).status,200);}
q=await game('a',{action:'question',subject:'Maths',focus:'weakest'});assert.equal(q.body.focus[0].id,'ma-test-add');assert.equal(q.body.focus.length,3);
let mastery=(await read(await MASTERY.GET(request('/api/mastery','a')))).body;const add=mastery.topics.find(t=>t.topic==='ma-test-add');assert.equal(add.level,'practise');assert(add.wrong>=3);assert.equal(mastery.topics.find(t=>t.topic==='sc-test-light').level,'new');
const cls=(await read(await MASTERY.GET(request('/api/mastery','teacher')))).body;assert.equal(cls.isTeacher,true);assert.deepEqual(cls.topics.find(t=>t.topic==='ma-test-add').needHelp,['a']);
const sheet=(await read(await TOPIC.GET(request('/api/topic?id=ma-test-add','a')))).body;assert.equal(sheet.topic.helpsheet.steps.length,2);assert.equal((await TOPIC.GET(request('/api/topic?id=nope','a'))).status,404);assert.equal((await TOPIC.GET(request('/api/topic?id=ma-test-add','nobody'))).status,401);
console.log('PASS: mastery counts every wrong attempt; weakest topics come first; the teacher sees who needs help; helpsheets need sign-in.');

// Reports: once per pupil and question, kind notes only, and the teacher sees the answer.
const reported=q.body.question.id;assert.equal((await game('a',{action:'report',id:reported,reason:'answer',note:'The second option looks odd.'})).body.ok,true);assert.equal((await game('a',{action:'report',id:reported,reason:'answer'})).body.already,true);
assert.equal((await game('a',{action:'report',id:reported,reason:'nonsense'})).status,400);assert.equal((await game('b',{action:'report',id:reported,reason:'typo',note:'see www.example.com'})).status,400);
let teacher=(await read(await TEACHER.GET(request('/api/teacher','teacher')))).body;assert.equal(teacher.reports.length,1);const reportedQ=questionById.get(reported);assert.deepEqual(teacher.reports[0].question.answers,toViewer(reportedQ,'a',reportedQ.answers));assert.deepEqual(teacher.reports[0].question.options,publicQuestion(reportedQ,undefined,'a').options);assert.equal((await TEACHER.GET(request('/api/teacher','a'))).status,403);
assert.equal((await read(await TEACHER.POST(request('/api/teacher','teacher',{action:'resolve_report',id:teacher.reports[0].id})))).status,200);assert.equal((await read(await TEACHER.GET(request('/api/teacher','teacher')))).body.reports.length,0);
await game('a',{action:'answer',token:q.body.token,answer:answerFor(questionById.get(q.body.question.id),'a')});
console.log('PASS: reports are once per question, filtered, teacher-only with answers, and can be marked as dealt with.');

// Help a friend: the helper sees the question in their own order and is marked on their own letters.
// Pupil c asks (a has nearly finished this round's 10 Maths questions, which the retired-question check below needs).
q=await game('c',{action:'question',subject:'Maths',topics:['ma-test-clock']});const lost=questionById.get(q.body.question.id);assert.equal((await game('c',{action:'answer',token:q.body.token,answer:wrongFor(lost,'c')})).body.correct,false);
const helpPost=(uid,body)=>HELP.POST(request('/api/help',uid,body)).then(read),helpBoard=async uid=>(await read(await HELP.GET(request('/api/help',uid)))).body;
assert.equal((await helpPost('c',{action:'ask',question:lost.id})).status,200);const card=(await helpBoard('b')).requests.find(x=>x.question.id===lost.id);
assert.deepEqual(card.question.optionVisuals,publicQuestion(lost,undefined,'b').optionVisuals);assert.equal((await helpPost('b',{action:'answer',id:card.id,answer:answerFor(lost,'b')})).body.correct,true);
console.log("PASS: a helper sees a friend's question in their own order and is marked on their own letters.");

// Mock tests: a fixed set, practice paused, answers saved, marked together, notebook as usual, then a cooldown.
// Coins are paid only when every question has an answer: this test leaves 11 blank, so it earns nothing.
const before=(await W.readWorld()).w.players.b,coinsBefore=before.coins,waveBefore=before.waveAnswers;let mock=await game('b',{action:'mock_start',subject:'Maths'});assert.equal(mock.status,200);const set=mock.body.mock.questions;assert.equal(set.length,20);assert(set.every(x=>!('answers' in x)));assert.equal(new Set(set.map(x=>x.id)).size,20);
assert.equal(new Set(set.slice(0,3).map(x=>x.topic)).size,3);
assert.equal((await game('b',{action:'question',subject:'Maths'})).status,400);assert.equal((await game('b',{action:'mock_start',subject:'Science'})).body.mock.id,mock.body.mock.id);
assert.equal((await view('b')).me.mock.count,20);
const right=set.slice(0,6),wrong=set.slice(6,9);for(const x of right)assert.equal((await game('b',{action:'mock_answer',id:x.id,answer:answerFor(questionById.get(x.id),'b')})).status,200);
// A pick-two question with only one choice made counts as answered (and wrong).
for(const x of wrong){const full=questionById.get(x.id),bad=wrongFor(full,'b');assert.equal((await game('b',{action:'mock_answer',id:x.id,answer:full.select>1?[bad[0]]:bad})).status,200);}
assert.equal((await game('b',{action:'mock_flag',id:set[10].id,on:true})).status,200);assert.equal((await game('b',{action:'mock_answer',id:'v2-not-in-test',answer:'1'})).status,400);
assert.deepEqual((await game('b',{action:'mock_state'})).body.mock.flags,[set[10].id]);
const finish=await game('b',{action:'mock_finish',id:mock.body.mock.id});assert.equal(finish.status,200);const result=finish.body.result;assert.equal(result.score,6);assert.equal(result.total,20);
assert.equal(result.unanswered,11);assert.equal(result.coins,0);assert.equal((await W.readWorld()).w.players.b.coins,coinsBefore);assert.equal((await W.readWorld()).w.players.b.waveAnswers,waveBefore);
assert(result.items.filter(i=>i.correct).every(i=>i.explanation&&i.answers));assert(result.items.filter(i=>!i.correct).every(i=>!('answers' in i)&&!('explanation' in i)));
const pb=(await W.readWorld()).w.players.b;assert(wrong.every(x=>pb.mistakes[x.id]?.attempts===1));assert(set.slice(9).every(x=>pb.history[x.id].attempted===false&&!pb.mistakes[x.id]));assert.equal(pb.mock,undefined);assert.equal(pb.questionRound?.Maths??0,0);
assert.equal((await game('b',{action:'mock_finish',id:mock.body.mock.id})).status,400);assert.equal((await game('b',{action:'mock_start',subject:'Maths'})).status,400);
const mv=(await view('b')).me;assert.equal(mv.mock,null);assert.equal(mv.mockResults[0].score,6);assert(!('items' in mv.mockResults[0]));
// A mock that runs out of time is marked with whatever was saved; late answers are refused.
mock=await game('b',{action:'mock_start',subject:'Science'});const sq=mock.body.mock.questions;await game('b',{action:'mock_answer',id:sq[0].id,answer:'light'});
const now=Date.now;Date.now=()=>now()+16*60000;assert.equal((await game('b',{action:'mock_answer',id:sq[1].id,answer:'light'})).status,400);const late=await game('b',{action:'mock_finish',id:mock.body.mock.id});Date.now=now;assert.equal(late.body.result.score,1);assert(late.body.result.seconds<=15*60);assert.equal(late.body.result.unanswered,sq.length-1);assert.equal(late.body.result.coins,0);
// A completed test pays each correct answer its usual coins, even with some wrong, and counts towards the class wave.
const c0=(await W.readWorld()).w.players.c;mock=await game('c',{action:'mock_start',subject:'Maths'});const cs=mock.body.mock.questions;assert.equal(cs.length,20);
for(const [i,x] of cs.entries()){const full=questionById.get(x.id);assert.equal((await game('c',{action:'mock_answer',id:x.id,answer:i<17?answerFor(full,'c'):wrongFor(full,'c')})).status,200);}
const done=(await game('c',{action:'mock_finish',id:mock.body.mock.id})).body.result;assert.equal(done.score,17);assert.equal(done.unanswered,undefined);
const paid=cs.slice(0,17).reduce((s,x)=>s+questionById.get(x.id).reward,0);assert.equal(done.coins,paid);const c1=(await W.readWorld()).w.players.c;assert.equal(c1.coins,c0.coins+paid);assert.equal(c1.waveAnswers,c0.waveAnswers+17);
assert(done.items.filter(i=>i.correct).every(i=>{const full=questionById.get(i.id);return JSON.stringify(i.answers)===JSON.stringify(toViewer(full,'c',full.answers));}));
console.log('PASS: mock tests pick a spread of questions, pause practice, save and flag answers, mark once with notebook entries, pay only when every question is answered, refuse late answers and wait a day between tests.');

// Retired questions: never asked again, but a question in progress and notebook entries still work.
await W.mutate(w=>{w.players.a.active={id:'q1',token:'legacy-token',at:Date.now(),reward:20}});r=await game('a',{action:'answer',token:'legacy-token',answer:questionById.get('q1').answers[0]});assert.equal(r.body.correct,true);
for(let i=0;i<10;i++){q=await game('a',{action:'question',subject:'Science'});if(!q.body.question)break;assert(!questionById.get(q.body.question.id).legacy);await game('a',{action:'answer',token:q.body.token,answer:'light'});}
console.log('PASS: retired questions are never asked, yet an unfinished one can still be answered.');
sqlite.close();
// Close the database before exiting so the build folder can be removed (Windows cannot delete an open file).
})().catch(e=>{console.error(e);try{sqlite.close()}catch{}process.exit(1)});
