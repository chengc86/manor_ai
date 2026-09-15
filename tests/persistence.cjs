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
async function post(body){const r=await API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{origin:'https://game.test',host:'game.test',cookie,'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})}));return{status:r.status,body:await r.json()}}
(async()=>{
for(const uid of ['a','b']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+7*86400000);await W.mutate(w=>{w.players[uid]=W.newPlayer(uid);});}
cookie='qg_session=a';let v=await get();assert.equal(v.players.length,0);assert.equal(v.me.heroLocked,false);
assert.equal((await post({action:'hero',hero:0,gender:'boy'})).status,200);v=await get();assert.deepEqual(v.players.map(p=>p.id),['a']);
let pending=await post({action:'question',subject:'English'});assert.equal(pending.status,200);v=await get();assert.equal(v.me.pendingQuestion.token,pending.body.token);assert(!('answers' in v.me.pendingQuestion.question));
for(let i=0;i<35;i++){const q=i===0?pending:await post({action:'question',subject:'Maths'});const a=questions.find(x=>x.id===q.body.question.id).answers[0];assert.equal((await post({action:'answer',token:q.body.token,answer:a})).status,200);}
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
const wrong=await post({action:'question',subject:'English'});await post({action:'answer',token:wrong.body.token,answer:'definitely-wrong-answer'});
const review=require('../work/persistence/review.cjs');let rr=await review.GET(new Request('https://game.test/api/review',{headers:{cookie}}));let notebook=await rr.json();assert(notebook.entries.some(m=>m.id===wrong.body.question.id));assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);
const beforeRetry=(await get()).me.coins;Date.now=()=>now()+25*3600000;
const retry=await post({action:'retry_question',id:wrong.body.question.id});assert.equal(retry.status,200);
const right=questions.find(q=>q.id===wrong.body.question.id).answers[0];assert.equal((await post({action:'answer',token:retry.body.token,answer:right})).status,200);assert.equal((await get()).me.coins,beforeRetry+retry.body.question.reward);assert.equal((await post({action:'answer',token:retry.body.token,answer:right})).status,400);assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);
rr=await review.GET(new Request('https://game.test/api/review?filter=corrected',{headers:{cookie}}));notebook=await rr.json();assert(notebook.entries.some(m=>m.id===wrong.body.question.id&&m.correctedAt));cookie='qg_session=b';rr=await review.GET(new Request('https://game.test/api/review?filter=all',{headers:{cookie}}));assert.equal((await rr.json()).total,0);assert.equal((await post({action:'retry_question',id:wrong.body.question.id})).status,400);Date.now=now;
console.log('PASS: combat totals settle once; wrong answers remain private, retry waits 24 hours, correction is retained, and coins cannot be awarded twice.');

assert.equal((await post({action:'item_buy',item:'stopwatch',unlimitedCoins:true})).status,400);
await W.mutate(w=>{w.players.b.unlimitedCoins=true});assert.equal((await post({action:'item_buy',item:'stopwatch'})).status,200);assert.equal((await W.readWorld()).w.players.b.coins,0);assert.equal((await get()).me.unlimitedCoins,true);assert.equal((await get()).me.coins,Number.MAX_SAFE_INTEGER);console.log('PASS: unlimited test account spends no coins; ordinary pupils cannot enable it through game requests.');
assert.equal((await post({action:'hero',hero:0,gender:'boy'})).status,200);for(const cell of [112,124,133])assert.equal((await post({action:'recruit',type:0,cell})).status,200);assert.equal((await get()).defenders.filter(d=>d.owner==='b').length,3);console.log('PASS: third hero deploys successfully; no personal deployment cap.');
sqlite.close();fs.unlinkSync(file);console.log('PASS: unselected heroes hidden; answers, wardrobe, items, coins and placements survive database reopen; pending question restored; simultaneous start accepts one; late join/reopen sees identical battle; stale start rejected after finish; pupil records isolated.');
})().catch(e=>{console.error(e);process.exitCode=1});
