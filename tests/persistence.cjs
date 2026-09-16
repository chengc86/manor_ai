// Exercise real handlers against an on-disk SQL database, independent of live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
fs.mkdirSync('work/persistence',{recursive:true});
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts'))){fs.writeFileSync('work/persistence/'+f.replace('.ts','.cjs'),ts.transpileModule(fs.readFileSync('lib/'+f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));}
fs.writeFileSync('work/persistence/game.cjs',ts.transpileModule(fs.readFileSync('app/api/game/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
fs.writeFileSync('work/persistence/review.cjs',ts.transpileModule(fs.readFileSync('app/api/review/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
const file='work/persistence/test-'+Date.now()+'.sqlite';let sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){
 return {bind(...values){
  return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}};
 }};
}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const W=require('../work/persistence/world.cjs'),API=require('../work/persistence/game.cjs'),{questions}=require('../work/persistence/questions.cjs');
let cookie;
async function get(){const r=await API.GET(new Request('https://game.test/api/game',{headers:{cookie}}));assert.equal(r.status,200);return r.json()}
async function post(body){const r=await API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{'X-Quest-Questions':'2',origin:'https://game.test',host:'game.test',cookie,'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})}));return{status:r.status,body:await r.json()}}
(async()=>{
for(const uid of ['a','b']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+7*86400000);await W.mutate(w=>{w.players[uid]=W.newPlayer(uid);});}
cookie='qg_session=a';let v=await get();assert.equal(v.players.length,0);assert.equal(v.me.heroLocked,false);
assert.equal((await post({action:'hero',hero:0,gender:'boy'})).status,200);v=await get();assert.deepEqual(v.players.map(p=>p.id),['a']);
let pending=await post({action:'question',subject:'English'});assert.equal(pending.status,200);v=await get();assert.equal(v.me.pendingQuestion.token,pending.body.token);assert(!('answers' in v.me.pendingQuestion.question));
const beforeOldClient=(await W.readWorld()).w;for(const action of ['question','retry_question','answer']){const rejected=await API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie,origin:'https://game.test','content-type':'application/json'},body:JSON.stringify({action,subject:'English',token:pending.body.token,answer:'wrong'})}));assert.equal(rejected.status,409);}assert.deepEqual((await W.readWorld()).w,beforeOldClient);console.log('PASS: outdated clients cannot issue or grade questions; no pupil data changes.');
for(let i=0;i<35;i++){const q=i===0?pending:await post({action:'question',subject:['Maths','English','Verbal reasoning','Non-verbal reasoning'][i%4]});const a=questions.find(x=>x.id===q.body.question.id).answers[0];assert.equal((await post({action:'answer',token:q.body.token,answer:a})).status,200);}
assert.equal((await post({action:'recruit',type:0,cell:104})).status,200);v=await get();const id=v.defenders[0].id;
assert.equal((await post({action:'weapon',id,weapon:'standard'})).status,200);assert.equal((await post({action:'upgrade',id})).status,200);
assert.equal((await post({action:'item_buy',item:'stopwatch'})).status,200);assert.equal((await post({action:'item_equip',item:'stopwatch'})).status,200);
const clothing=require('../work/persistence/clothing.cjs').CLOTHING[0];assert.equal((await post({action:'clothing',item:clothing.id})).status,200);
const before=await get();sqlite.close();sqlite=new DatabaseSync(file);const after=await get();assert.deepEqual(after.me,before.me);assert.deepEqual(after.defenders,before.defenders);
const version=after.battleVersion;const starts=await Promise.all([post({action:'battle',battleVersion:version}),post({action:'battle',battleVersion:version})]);assert.equal(starts.filter(r=>r.status===200).length,1);
const first=await get();cookie='qg_session=b';const late=await get();assert.deepEqual(late.battle,first.battle);assert.equal(late.battleVersion,version+1);assert.equal(late.players.length,1);
sqlite.close();sqlite=new DatabaseSync(file);assert.deepEqual((await get()).battle,first.battle);
assert.equal((await post({action:'battle',battleVersion:version+1})).status,400);
const now=Date.now;Date.now=()=>now()+first.battle.duration+2000;
await get();assert.equal((await post({action:'battle',battleVersion:version})).status,400);assert.equal((await get()).battle,null);Date.now=now;
assert.equal((await get()).me.correct,0);cookie='qg_session=a';assert.equal((await get()).me.correct,35);

const combat=(await get()).me.combat;await get();assert.deepEqual((await get()).me.combat,combat);assert.equal(combat.battles,1);
const wrong=await post({action:'question',subject:'Maths'});await post({action:'answer',token:wrong.body.token,answer:'definitely-wrong-answer'});
const review=require('../work/persistence/review.cjs');let rr=await review.GET(new Request('https://game.test/api/review',{headers:{cookie}}));let notebook=await rr.json();assert(notebook.entries.some(m=>m.id===wrong.body.question.id));assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);
const beforeRetry=(await get()).me.coins;Date.now=()=>now()+25*3600000;
const retry=await post({action:'retry_question',id:wrong.body.question.id});assert.equal(retry.status,200);
const right=questions.find(q=>q.id===wrong.body.question.id).answers[0];assert.equal((await post({action:'answer',token:retry.body.token,answer:right})).status,200);assert.equal((await get()).me.coins,beforeRetry+retry.body.question.reward);assert.equal((await post({action:'answer',token:retry.body.token,answer:right})).status,400);assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);
rr=await review.GET(new Request('https://game.test/api/review?filter=corrected',{headers:{cookie}}));notebook=await rr.json();assert(notebook.entries.some(m=>m.id===wrong.body.question.id&&m.correctedAt));cookie='qg_session=b';rr=await review.GET(new Request('https://game.test/api/review?filter=all',{headers:{cookie}}));assert.equal((await rr.json()).total,0);assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);Date.now=now;
console.log('PASS: combat totals settle once; wrong answers remain private, retry waits 24 hours, correction is retained, and coins cannot be awarded twice.');

assert.equal((await post({action:'item_buy',item:'stopwatch',unlimitedCoins:true})).status,400);
await W.mutate(w=>{w.players.b.unlimitedCoins=true});assert.equal((await post({action:'item_buy',item:'stopwatch'})).status,200);assert.equal((await W.readWorld()).w.players.b.coins,0);assert.equal((await get()).me.unlimitedCoins,true);assert.equal((await get()).me.coins,Number.MAX_SAFE_INTEGER);console.log('PASS: unlimited test account spends no coins; ordinary pupils cannot enable it through game requests.');
assert.equal((await post({action:'hero',hero:0,gender:'boy'})).status,200);for(const cell of [112,124,133])assert.equal((await post({action:'recruit',type:0,cell})).status,200);assert.equal((await get()).defenders.filter(d=>d.owner==='b').length,3);console.log('PASS: third hero deploys successfully; no personal deployment cap.');
const subjects=['Maths','English','Verbal reasoning','Non-verbal reasoning'];
await W.mutate(w=>{w.players.b=W.newPlayer('b');w.players.b.learningYear=2});
let issued=await post({action:'question',subject:'Maths',year:2});assert.notEqual(issued.body.question.difficulty,'Year 2');
fs.writeFileSync('work/persistence/teacher.cjs',ts.transpileModule(fs.readFileSync('app/api/teacher/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
const teacher=require('../work/persistence/teacher.cjs');const setYear=()=>teacher.POST(new Request('https://game.test/api/teacher',{method:'POST',headers:{cookie,origin:'https://game.test'},body:JSON.stringify({action:'set_year',id:'b',year:2})}));assert.equal((await setYear()).status,403);
sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha('teacher'),'teacher',Date.now()+86400000);cookie='qg_session=teacher';assert.equal((await setYear()).status,200);cookie='qg_session=b';assert.equal((await get()).me.pendingQuestion,null);
for(const subject of subjects){for(let i=0;i<10;i++){const q=await post({action:'question',subject,year:6});assert.equal(q.body.question.difficulty,'Year 2');const answer=questions.find(x=>x.id===q.body.question.id).answers[0];assert.equal((await post({action:'answer',token:q.body.token,answer})).status,200);}if(subject!==subjects.at(-1))assert.equal((await post({action:'question',subject})).body.question,null);}
let status=await get();assert(subjects.every(s=>status.me.questionProgress[s].completed===0));
await W.mutate(w=>{const p=w.players.b;for(const q of questions.filter(q=>q.subject==='Maths'&&q.difficulty==='Year 2'))p.history[q.id]={correct:true,at:Date.now()};});assert.equal((await post({action:'question',subject:'Maths'})).body.question,null);
const missed=await post({action:'question',subject:'English'});await post({action:'answer',token:missed.body.token,answer:'wrong-on-purpose'});assert.equal((await get()).me.questionProgress.English.completed,1);
await W.mutate(w=>{w.players.b.questionRound={'English':9,'Verbal reasoning':10,'Non-verbal reasoning':10};});const last=await post({action:'question',subject:'English'});await post({action:'answer',token:last.body.token,answer:'wrong-on-purpose'});assert.equal((await get()).me.questionProgress.English.completed,0);
console.log('PASS: wrong answers count; exhausted subjects do not deadlock the round.');
console.log('PASS: teacher-only year assignment defaults to Year 6; 10-answer cap, 40-answer reset and exhausted subjects enforced.');
fs.writeFileSync('work/persistence/chat.cjs',ts.transpileModule(fs.readFileSync('app/api/chat/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
const chat=require('../work/persistence/chat.cjs');const chatReq=(body)=>new Request('https://game.test/api/chat',{method:'POST',headers:{cookie,origin:'https://game.test'},body:JSON.stringify(body)});const mid=crypto.randomUUID();assert.equal((await chat.GET(new Request('https://game.test/api/chat'))).status,401);assert.equal((await chat.POST(chatReq({action:'send',id:mid,text:'Hello team!'}))).status,200);assert.equal((await chat.POST(chatReq({action:'send',id:mid,text:'Hello team!'}))).status,200);assert.equal((await chat.POST(chatReq({action:'send',id:crypto.randomUUID(),text:'Too fast'}))).status,400);
sqlite.close();sqlite=new DatabaseSync(file);cookie='qg_session=a';let messages=await (await chat.GET(new Request('https://game.test/api/chat',{headers:{cookie}}))).json();assert.equal(messages.messages.length,1);assert.equal(messages.messages[0].text,'Hello team!');assert.equal((await chat.POST(chatReq({action:'delete',id:mid}))).status,400);cookie='qg_session=teacher';assert.equal((await chat.POST(chatReq({action:'delete',id:mid}))).status,200);console.log('PASS: chat persists, requires sign-in, shares messages, deduplicates sends, rate limits and allows teacher moderation.');
sqlite.close();fs.unlinkSync(file);console.log('PASS: unselected heroes hidden; answers, wardrobe, items, coins and placements survive database reopen; pending question restored; simultaneous start accepts one; late join/reopen sees identical battle; stale start rejected after finish; pupil records isolated.');
})().catch(e=>{console.error(e);process.exitCode=1});
