// Mistake answers stay hidden; friends must solve a posted question before a hint pays HELP_REWARD coins. Uses an on-disk SQL database, never live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/help-friends';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/game/route.ts','game.cjs');compile('app/api/review/route.ts','review.cjs');compile('app/api/help/route.ts','help.cjs');
const file=`${dir}/test-${Date.now()}.sqlite`;let sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const {HELP_REWARD,ANSWER_PENALTY}=require(`../${dir}/friend-help.cjs`),W=require(`../${dir}/world.cjs`),GAME=require(`../${dir}/game.cjs`),REVIEW=require(`../${dir}/review.cjs`),HELP=require(`../${dir}/help.cjs`),{questions,revealsAnswer}=require(`../${dir}/questions.cjs`);
const request=(url,uid,body)=>new Request('https://game.test'+url,{method:body?'POST':'GET',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Questions':'3','X-Quest-Heroes':'6'},...(body?{body:JSON.stringify(body)}:{})});
const read=async r=>({status:r.status,body:await r.json()});
const game=(uid,body)=>GAME.POST(request('/api/game',uid,{requestId:crypto.randomUUID(),...body})).then(read);
const help=(uid,body)=>(body?HELP.POST(request('/api/help',uid,body)):HELP.GET(request('/api/help',uid))).then(read);
const board=async uid=>{const r=await help(uid);assert.equal(r.status,200);return r.body};
const notebook=async(uid,filter='all')=>(await read(await REVIEW.GET(request('/api/review?filter='+filter,uid)))).body;
const coins=async uid=>(await W.readWorld()).w.players[uid].coins;
const Q=questions.find(q=>q.id==='q1'),answer=Q.answers[0];
const solveCheck=async(uid,id)=>{const r=await help(uid,{action:'answer',id,answer});assert.equal(r.status,200);assert.equal(r.body.correct,true);};
const sendHint=(uid,id,text=`Multiply the boxes by the pencils in each box, ${uid}.`)=>help(uid,{action:'hint',id,hint:crypto.randomUUID(),text});
(async()=>{
assert.equal(revealsAnswer(Q,'240'),true);assert.equal(revealsAnswer(Q,'It is 240!'),true);assert.equal(revealsAnswer(Q,'10 × 24 = 240'),true);assert.equal(revealsAnswer(Q,'Multiply 10 by 24'),false);assert.equal(revealsAnswer(Q,'Not 2400'),false);
const reading=questions.find(q=>q.id==='q103'),missing=questions.find(q=>q.id==='q94');assert.equal(revealsAnswer(reading,'The word is paused.'),true);assert.equal(revealsAnswer(reading,'Look at the first verb after Maya.'),false);assert.equal(revealsAnswer(missing,'Add 9 to 54 first, then divide by 7.'),false);assert.equal(revealsAnswer(missing,'9'),true);
console.log('PASS: hints that contain a distinctive answer are rejected; clues and numbers already in the question are allowed.');

for(const uid of ['a','b','c','d','e','f','g','teacher']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+7*86400000);if(uid!=='teacher')await W.mutate(w=>{w.players[uid]=W.newPlayer(uid);});}
await W.mutate(w=>{w.players.a.active={id:'q1',token:'token-a-q1',at:Date.now(),reward:Q.reward}});
const wrong=await game('a',{action:'answer',token:'token-a-q1',answer:'999999'});assert.equal(wrong.status,200);assert.equal(wrong.body.correct,false);assert(!('answer' in wrong.body)&&!('explanation' in wrong.body));
let entry=(await notebook('a')).entries.find(m=>m.id==='q1');assert(entry&&!('answers' in entry)&&!('explanation' in entry));assert.equal(entry.help,null);
console.log('PASS: a wrong answer reveals neither the answer nor the explanation, in feedback or in the mistake notebook.');

assert.equal((await board('b')).requests.length,0);assert.equal((await help('b',{action:'ask',question:'q1'})).status,400);
assert.equal((await help('a',{action:'ask',question:'q2'})).status,400);
let r=await help('a',{action:'ask',question:'q1',stuck:'constructor'});assert.equal(r.status,200);assert.equal(r.body.already,undefined);assert.equal((await W.readWorld()).w.players.a.mistakes.q1.help.stuck,undefined);assert.equal((await help('a',{action:'ask',question:'q1'})).body.already,true);
assert.equal((await help('a',{action:'ask',question:'q1',stuck:'start'})).body.already,true);assert.equal((await W.readWorld()).w.players.a.mistakes.q1.help.stuck,'start');
let mine=await board('a');assert.equal(mine.mine,1);assert.equal(mine.requests.length,0);
let seen=(await board('b')).requests;assert.equal(seen.length,1);const id=seen[0].id;assert.equal(seen[0].name,'a');assert.equal(seen[0].status,'ready');assert.equal(seen[0].stuck,'start');assert.equal(seen[0].question.id,'q1');assert(!('answers' in seen[0].question)&&!('explanation' in seen[0].question));
assert.equal((await help('a',{action:'answer',id,answer})).status,400);
console.log('PASS: only unresolved mistakes can be posted; posting is idempotent; classmates see the question and what the asker finds tricky, without its answer; askers cannot answer their own.');

assert.equal((await sendHint('b',id)).status,400);
const before=await coins('b');r=await help('b',{action:'answer',id,answer:'100'});assert.equal(r.status,200);assert.equal(r.body.correct,false);assert(!('answer' in r.body));assert.equal((await board('b')).requests[0].status,'resting');
assert.equal((await help('b',{action:'answer',id,answer})).status,400);assert.equal((await sendHint('b',id)).status,400);assert.equal(await coins('b'),before);
console.log('PASS: helpers must answer correctly before hinting; a wrong helper answer rests for 24 hours and reveals nothing.');

await solveCheck('c',id);assert.equal((await board('c')).requests[0].status,'unlocked');
for(const text of [answer,`The answer is ${answer}`,'hi'])assert.equal((await help('c',{action:'hint',id,hint:crypto.randomUUID(),text})).status,400);
for(const [text,why] of [['Stop being so stupid and multiply','kind'],['Look at www.example.com first','links'],['Ring me on 07700 900123','private']]){const bad=await help('c',{action:'hint',id,hint:crypto.randomUUID(),text});assert.equal(bad.status,400);assert.match(bad.body.error,new RegExp(why));}
const hintId=crypto.randomUUID(),cBefore=await coins('c');r=await help('c',{action:'hint',id,hint:hintId,text:'Multiply 10 by 24. Try 10 × 20 first.'});assert.equal(r.status,200);assert.equal(r.body.reward,undefined);assert.equal(await coins('c'),cBefore);
assert.equal((await help('c',{action:'hint',id,hint:hintId,text:'Multiply 10 by 24. Try 10 × 20 first.'})).body.duplicate,true);assert.equal(await coins('c'),cBefore);assert.equal((await sendHint('c',id)).status,400);assert.equal((await board('c')).sentHints[0].status,'waiting');
assert.equal((await board('c')).requests[0].status,'sent');assert.equal((await board('c')).requests[0].sent,'Multiply 10 by 24. Try 10 × 20 first.');
entry=(await notebook('a')).entries.find(m=>m.id==='q1');assert.equal(entry.help.status,'open');assert.deepEqual(entry.help.hints.map(h=>[h.name,h.text]),[['c','Multiply 10 by 24. Try 10 × 20 first.']]);assert(!('answers' in entry));
const view=await read(await GAME.GET(request('/api/game','c')));assert.equal(view.body.me.helpChecks,undefined);
let news=await board('a');assert.deepEqual(news.myHints.map(h=>[h.name,h.subject]),[['c','Maths']]);assert(!('text' in news.myHints[0]));assert.deepEqual(news.retry,[]);assert.deepEqual((await board('b')).myHints,[]);
console.log('PASS: a valid hint reaches the asker privately and pays nothing yet; answer-revealing, unkind and unsafe hints are refused; the asker is told a hint arrived.');

await W.mutate(w=>{w.players.d.mistakes={q1:{attempts:1,lastWrongAt:Date.now()}};w.players.d.history.q1={correct:false,at:Date.now(),attempted:true};w.players.g.active={id:'q1',token:'token-g-q1',at:Date.now()}});
assert.equal((await board('d')).requests[0].status,'own');assert.equal((await help('d',{action:'answer',id,answer})).status,400);
assert.equal((await board('g')).requests[0].status,'active');assert.equal((await help('g',{action:'answer',id,answer})).status,400);await W.mutate(w=>{delete w.players.g.active});
console.log('PASS: pupils cannot help with a question still in their own notebook or open in Earn coins.');

for(const uid of ['e','f']){await solveCheck(uid,id);assert.equal((await sendHint(uid,id)).status,200);}
assert.equal((await board('g')).requests.length,0);entry=(await notebook('a')).entries.find(m=>m.id==='q1');assert.equal(entry.help.status,'full');assert.equal(entry.help.hints.length,3);assert.equal((await help('a',{action:'ask',question:'q1'})).status,400);
const eHint=(await W.readWorld()).w.players.a.mistakes.q1.help.hints.find(h=>h.owner==='e').id;assert.equal((await help('b',{action:'remove',id,hint:eHint})).status,400);
let teacher=await board('teacher');assert.equal(teacher.isTeacher,true);assert.equal(teacher.requests[0].hints.length,3);assert(!('owner' in teacher.requests[0].hints[0]));assert.equal(teacher.requests[0].stuck,'start');
assert.equal((await help('teacher',{action:'remove',id,hint:eHint})).status,200);teacher=await board('teacher');assert.equal(teacher.requests[0].hints.find(h=>h.id===eHint).removed,true);assert.equal(teacher.requests[0].hints.find(h=>h.id===eHint).text,'');
entry=(await notebook('a')).entries.find(m=>m.id==='q1');assert.equal(entry.help.status,'open');assert.equal(entry.help.hints.length,2);
const eView=(await board('e')).requests[0];assert.equal(eView.status,'sent');assert.equal(eView.sent,null);assert.equal((await sendHint('e',id)).status,400);assert.equal((await board('g')).requests.length,1);
console.log('PASS: three hints take a question off the board; only the teacher can remove a hint, which reopens the slot without letting that helper hint again.');

await W.mutate(w=>{for(const q of ['q2','q3','q4'])w.players.a.mistakes[q]={attempts:1,lastWrongAt:Date.now()}});
assert.equal((await help('a',{action:'ask',question:'q2'})).status,200);assert.equal((await help('a',{action:'ask',question:'q3'})).status,200);assert.equal((await help('a',{action:'ask',question:'q4'})).status,400);
assert.equal((await help('a',{action:'withdraw',question:'q2'})).status,200);assert.equal((await help('a',{action:'ask',question:'q4'})).status,200);assert.equal((await board('a')).mine,3);assert.equal((await board('g')).requests.length,3);
console.log('PASS: pupils can have three questions on the board at once and can take one off to ask about another.');

const now=Date.now;Date.now=()=>now()+25*3600000;
assert.equal((await board('b')).requests.find(x=>x.id===id).status,'ready');await solveCheck('b',id);assert.equal((await sendHint('b',id)).status,200);
assert.deepEqual((await board('a')).retry,[{id:'q1',subject:'Maths',hints:3}]);
let retry=await game('a',{action:'retry_question',id:'q1'});assert.equal(retry.status,200);const again=await game('a',{action:'answer',token:retry.body.token,answer:'999'});assert.equal(again.body.correct,false);assert.deepEqual(again.body.thanked,[]);
entry=(await notebook('a')).entries.find(m=>m.id==='q1');assert.equal(entry.attempts,2);assert.equal(entry.help.hints.length,3);assert(!('answers' in entry));
const paidBefore=Object.fromEntries(await Promise.all(['b','c','e','f'].map(async u=>[u,await coins(u)])));assert.equal(paidBefore.c,cBefore);assert.deepEqual((await board('a')).retry,[]);
console.log('PASS: a wrong helper can retry after 24 hours; a hinted question is offered for retry once it has rested; another wrong answer keeps the hints and pays no one.');

Date.now=()=>now()+50*3600000;
retry=await game('a',{action:'retry_question',id:'q1'});assert.equal(retry.status,200);const right=await game('a',{action:'answer',token:retry.body.token,answer});assert.equal(right.body.correct,true);assert.equal(right.body.answer,answer);assert(right.body.explanation);assert.deepEqual([...right.body.thanked].sort(),['b','c','f']);
for(const u of ['b','c','f'])assert.equal(await coins(u),paidBefore[u]+HELP_REWARD);assert.equal(await coins('e'),paidBefore.e);news=await board('a');assert.deepEqual([news.myHints,news.retry],[[],[]]);assert.equal((await board('c')).sentHints.find(h=>h.name==='a').status,'paid');
entry=(await notebook('a','corrected')).entries.find(m=>m.id==='q1');assert.equal(entry.answers[0],answer);assert(entry.explanation);assert.equal(entry.help.status,'closed');assert.equal(entry.help.hints.length,3);
assert(!(await board('b')).requests.some(x=>x.id===id));assert.equal((await sendHint('g',id)).status,400);assert.equal((await board('c')).sentHints[0].status,'paid');assert.equal((await board('e')).sentHints[0].status,'removed');
const plain=await game('g',{action:'question',subject:'English'});assert.deepEqual((await game('g',{action:'answer',token:plain.body.token,answer:(q=>q.select>1?q.answers:q.answers[0])(questions.find(q=>q.id===plain.body.question.id))})).body.thanked,[]);Date.now=now;
console.log(`PASS: when the asker gets it right, each helper with a standing hint earns ${HELP_REWARD} coins once; removed hints earn nothing; the answer and explanation then appear.`);

// A hint that gives the answer away: the teacher fines it. A paid hint also loses its reward, so giving the answer never pays.
await W.mutate(w=>{w.players.f.coins=40});const fHint=(await W.readWorld()).w.players.a.mistakes.q1.help.hints.find(h=>h.owner==='f').id,fBefore=40;
assert.equal((await help('b',{action:'gave_answer',id,hint:fHint})).status,400);assert.equal(await coins('f'),fBefore);
r=await help('teacher',{action:'gave_answer',id,hint:fHint});assert.equal(r.status,200);assert.equal(r.body.name,'f');assert.equal(r.body.coins,ANSWER_PENALTY+HELP_REWARD);assert.equal(await coins('f'),fBefore-ANSWER_PENALTY-HELP_REWARD);
assert.equal((await help('teacher',{action:'gave_answer',id,hint:fHint})).body.already,true);assert.equal((await help('teacher',{action:'remove',id,hint:fHint})).status,200);assert.equal(await coins('f'),fBefore-ANSWER_PENALTY-HELP_REWARD);
const fSent=(await board('f')).sentHints.find(h=>h.id===fHint);assert.equal(fSent.status,'answer');assert.equal(fSent.lost,ANSWER_PENALTY+HELP_REWARD);assert(fSent.text);
const fTeacher=(await board('teacher')).requests.find(x=>x.id===id).hints.find(h=>h.id===fHint);assert.equal(fTeacher.removed,true);assert.equal(fTeacher.gaveAnswer.coins,ANSWER_PENALTY+HELP_REWARD);assert(fTeacher.text);
assert.deepEqual((await notebook('a','corrected')).entries.find(m=>m.id==='q1').help.hints.map(h=>h.name).sort(),['b','c']);
const P=questions.find(q=>q.id==='q5'),ago=Date.now()-25*3600000;await W.mutate(w=>{w.players.g.mistakes={q5:{attempts:1,lastWrongAt:ago}};w.players.g.history.q5={correct:false,at:ago,attempted:true};w.players.e.coins=3;});
assert.equal((await help('g',{action:'ask',question:'q5'})).status,200);const id5=(await board('b')).requests.find(x=>x.question.id==='q5').id,hints5={};
for(const [uid,text] of [['b','It is fifty. Type it in numbers.'],['e','Fifty! Trust me.'],['c','Count the parts first: 3 + 5 = 8 parts.']]){assert.equal((await help(uid,{action:'answer',id:id5,answer:P.answers[0]})).body.correct,true);hints5[uid]=crypto.randomUUID();assert.equal((await help(uid,{action:'hint',id:id5,hint:hints5[uid],text})).status,200);}
const bBefore=await coins('b');r=await help('teacher',{action:'gave_answer',id:id5,hint:hints5.b});assert.equal(r.body.coins,ANSWER_PENALTY);assert.equal(await coins('b'),bBefore-ANSWER_PENALTY);
r=await help('teacher',{action:'gave_answer',id:id5,hint:hints5.e});assert.equal(r.body.coins,3);assert.equal(await coins('e'),0);
const bCard=(await board('b')).requests.find(x=>x.id===id5);assert.equal(bCard.status,'sent');assert.equal(bCard.sent,null);assert.equal(bCard.lost,ANSWER_PENALTY);assert.equal((await sendHint('b',id5)).status,400);
assert.deepEqual((await notebook('g')).entries.find(m=>m.id==='q5').help.hints.map(h=>h.name),['c']);
const cBefore5=await coins('c');retry=await game('g',{action:'retry_question',id:'q5'});assert.equal(retry.status,200);const solved=await game('g',{action:'answer',token:retry.body.token,answer:P.answers[0]});assert.equal(solved.body.correct,true);assert.deepEqual(solved.body.thanked,['c']);
assert.equal(await coins('b'),bBefore-ANSWER_PENALTY);assert.equal(await coins('e'),0);assert.equal(await coins('c'),cBefore5+HELP_REWARD);
console.log(`PASS: only the teacher can fine a hint that gave the answer away; the helper loses ${ANSWER_PENALTY} coins (${ANSWER_PENALTY+HELP_REWARD} once paid), never below zero; fined hints are hidden from the asker and never paid; fining twice changes nothing.`);

sqlite.close();fs.unlinkSync(file);console.log('PASS: help-a-friend flow.');
})().catch(e=>{console.error(e);process.exitCode=1});
