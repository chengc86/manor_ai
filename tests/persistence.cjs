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
async function get(){const r=await API.GET(new Request('https://game.test/api/game',{headers:{cookie,'X-Quest-Heroes':'4'}}));assert.equal(r.status,200);return r.json()}
async function post(body){const r=await API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{'X-Quest-Questions':'2','X-Quest-Heroes':'4',origin:'https://game.test',host:'game.test',cookie,'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})}));return{status:r.status,body:await r.json()}}
(async()=>{
for(const uid of ['a','b']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+7*86400000);await W.mutate(w=>{w.players[uid]=W.newPlayer(uid);});}
cookie='qg_session=a';let v=await get();assert.equal(v.players.length,0);assert.equal(v.me.heroLocked,false);
assert.equal((await post({action:'hero',hero:0,gender:'boy'})).status,200);v=await get();assert.deepEqual(v.players.map(p=>p.id),['a']);
let pending=await post({action:'question',subject:'English'});assert.equal(pending.status,200);v=await get();assert.equal(v.me.pendingQuestion.token,pending.body.token);assert(!('answers' in v.me.pendingQuestion.question));
const beforeOldClient=(await W.readWorld()).w;assert.equal((await API.GET(new Request('https://game.test/api/game',{headers:{cookie}}))).status,409);for(const action of ['question','retry_question','answer']){const rejected=await API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie,'X-Quest-Heroes':'4',origin:'https://game.test','content-type':'application/json'},body:JSON.stringify({action,subject:'English',token:pending.body.token,answer:'wrong'})}));assert.equal(rejected.status,409);}assert.deepEqual((await W.readWorld()).w,beforeOldClient);console.log('PASS: outdated clients cannot issue or grade questions; no pupil data changes.');
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
assert.equal((await post({action:'hero',hero:9,gender:'boy'})).status,200);for(const cell of [112,124,133])assert.equal((await post({action:'recruit',type:9,cell})).status,200);assert.equal((await get()).defenders.filter(d=>d.owner==='b').length,3);console.log('PASS: third hero deploys successfully; no personal deployment cap.');
const subjects=['Maths','English','Verbal reasoning','Non-verbal reasoning'];
await W.mutate(w=>{w.players.b=W.newPlayer('b');w.players.b.learningYear=2});
let issued=await post({action:'question',subject:'Maths',year:2});assert.notEqual(issued.body.question.difficulty,'Year 2');
fs.writeFileSync('work/persistence/teacher.cjs',ts.transpileModule(fs.readFileSync('app/api/teacher/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
const teacher=require('../work/persistence/teacher.cjs');const setYear=()=>teacher.POST(new Request('https://game.test/api/teacher',{method:'POST',headers:{cookie,origin:'https://game.test'},body:JSON.stringify({action:'set_year',id:'b',year:2})}));assert.equal((await setYear()).status,403);
sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha('teacher'),'teacher',Date.now()+86400000);cookie='qg_session=teacher';assert.equal((await setYear()).status,200);cookie='qg_session=b';assert.equal((await get()).me.pendingQuestion,null);
for(const subject of subjects){for(let i=0;i<10;i++){const q=await post({action:'question',subject,year:6});assert.equal(q.body.question.difficulty,'Year 2');const answer=questions.find(x=>x.id===q.body.question.id).answers[0];assert.equal((await post({action:'answer',token:q.body.token,answer})).status,200);}if(subject!==subjects.at(-1)){const moved=await post({action:'question',subject});assert.equal(moved.body.question.subject,subjects[subjects.indexOf(subject)+1]);assert.match(moved.body.notice,/finished 10/);}}
let status=await get();assert(subjects.every(s=>status.me.questionProgress[s].completed===0));
await W.mutate(w=>{const p=w.players.b;for(const q of questions.filter(q=>q.subject==='Maths'&&q.difficulty==='Year 2'))p.history[q.id]={correct:true,at:Date.now()};});const moved=await post({action:'question',subject:'Maths'});assert.equal(moved.body.question.subject,'English');assert.match(moved.body.notice,/every Maths question/);
// An unfinished question is kept when the chosen subject has nothing left to ask.
await W.mutate(w=>{w.players.b.questionRound={'Verbal reasoning':10}});const kept=await post({action:'question',subject:'Verbal reasoning'});assert.equal(kept.body.question.id,moved.body.question.id);await W.mutate(w=>{w.players.b.questionRound={}});
const missed=await post({action:'question',subject:'English'});await post({action:'answer',token:missed.body.token,answer:'wrong-on-purpose'});assert.equal((await get()).me.questionProgress.English.completed,1);
await W.mutate(w=>{w.players.b.questionRound={'English':9,'Verbal reasoning':10,'Non-verbal reasoning':10};});const last=await post({action:'question',subject:'English'});await post({action:'answer',token:last.body.token,answer:'wrong-on-purpose'});assert.equal((await get()).me.questionProgress.English.completed,0);
console.log('PASS: wrong answers count; exhausted subjects do not deadlock the round; a finished or fully answered subject hands over to the next subject and keeps an unfinished question.');
console.log('PASS: teacher-only year assignment defaults to Year 6; 10-answer cap, 40-answer reset and exhausted subjects enforced.');
fs.writeFileSync('work/persistence/chat.cjs',ts.transpileModule(fs.readFileSync('app/api/chat/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("@\/lib\/(.*?)"\)/g,'require("./$1.cjs")'));
const chat=require('../work/persistence/chat.cjs');const chatReq=(body)=>new Request('https://game.test/api/chat',{method:'POST',headers:{cookie,origin:'https://game.test'},body:JSON.stringify(body)});const mid=crypto.randomUUID();assert.equal((await chat.GET(new Request('https://game.test/api/chat'))).status,401);assert.equal((await chat.POST(chatReq({action:'send',id:mid,text:'Hello team!'}))).status,200);assert.equal((await chat.POST(chatReq({action:'send',id:mid,text:'Hello team!'}))).status,200);assert.equal((await chat.POST(chatReq({action:'send',id:crypto.randomUUID(),text:'Too fast'}))).status,400);
// The world poll carries only a chat summary (for the new-messages dot), and only to signed-in class members.
const summary=(await get()).chatState;assert.equal(summary.count,1);assert.equal(summary.lastId,mid);assert(summary.lastAt>0&&summary.lastOwner&&summary.lastOwner!=='teacher');assert(!('text' in summary));const anonymous=await API.GET(new Request('https://game.test/api/game',{headers:{'X-Quest-Heroes':'4'}}));assert.equal(anonymous.status,200);assert.equal((await anonymous.json()).chatState,null);
sqlite.close();sqlite=new DatabaseSync(file);cookie='qg_session=a';let messages=await (await chat.GET(new Request('https://game.test/api/chat',{headers:{cookie}}))).json();assert.equal(messages.messages.length,1);assert.equal(messages.messages[0].text,'Hello team!');assert.equal((await chat.POST(chatReq({action:'delete',id:mid}))).status,400);cookie='qg_session=teacher';assert.equal((await chat.POST(chatReq({action:'delete',id:mid}))).status,200);const cleared=(await get()).chatState;assert.equal(cleared.count,0);assert.equal(cleared.lastId,null);console.log('PASS: chat persists, requires sign-in, shares messages, deduplicates sends, rate limits, allows teacher moderation and shares a member-only summary for the new-messages dot.');

// Exclusive hero claims use the same revision-checked database mutation as spending.
for(const uid of ['c','d']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+86400000);await W.mutate(w=>{w.players[uid]=W.newPlayer(uid);w.players[uid].coins=5000;});}
const heroRequest=(uid,hero)=>API.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie:'qg_session='+uid,'X-Quest-Heroes':'4',origin:'https://game.test','content-type':'application/json'},body:JSON.stringify({action:'hero',hero,gender:'boy',requestId:crypto.randomUUID()})}));
const claims=await Promise.all([heroRequest('c',16),heroRequest('d',16)]);assert.equal(claims.filter(r=>r.status===200).length,1);const winner=claims[0].status===200?'c':'d',loser=winner==='c'?'d':'c';
assert.equal((await heroRequest(loser,17)).status,200);cookie='qg_session='+winner;
assert.equal((await post({action:'recruit',type:17,cell:215})).status,400);
await W.mutate(w=>{const p=w.players[winner];p.clothing={top:'shirt'};p.clothingOwned=['shirt'];p.itemInventory={stopwatch:2};p.equippedItems=['stopwatch'];w.defenders.push({id:'claim-one',owner:winner,type:16,cell:215,level:3,weapon:'frost',weapons:['frost','standard'],weaponLevels:{frost:3,standard:2}},{id:'claim-two',owner:winner,type:16,cell:216,level:2,weapon:'standard',weapons:['standard'],weaponLevels:{standard:2}});});
const originalPlayer=(await W.readWorld()).w.players[winner];assert.equal((await heroRequest(winner,17)).status,400);assert.deepEqual((await W.readWorld()).w.players[winner],originalPlayer);
assert.equal((await heroRequest(winner,115)).status,200);let claimWorld=(await W.readWorld()).w;assert.equal(claimWorld.players[winner].coins,4000);assert.equal(claimWorld.players[winner].hero,115);assert.deepEqual(claimWorld.players[winner].clothing,originalPlayer.clothing);assert.deepEqual(claimWorld.players[winner].itemInventory,originalPlayer.itemInventory);assert(claimWorld.defenders.filter(d=>d.owner===winner).every(d=>d.type===115));assert.equal(claimWorld.defenders.find(d=>d.id==='claim-one').weaponLevels.frost,3);
assert.equal((await heroRequest(loser,16)).status,200);await W.mutate(w=>{w.players[winner].coins=999;});const poorBefore=(await W.readWorld()).w;assert.equal((await heroRequest(winner,18)).status,400);assert.deepEqual((await W.readWorld()).w,poorBefore);sqlite.close();sqlite=new DatabaseSync(file);claimWorld=(await W.readWorld()).w;assert.equal(claimWorld.players[winner].hero,115);assert.equal(claimWorld.players[loser].hero,16);
console.log('PASS: simultaneous hero claim has one winner; taken heroes reject without spending; only selected hero deploys; paid switch changes every defender, preserves equipment and releases old hero; choices survive reopen.');
cookie='qg_session='+winner;
await W.mutate(w=>{for(const p of Object.values(w.players))p.lastSeen=0;w.players[winner].combat={kills:12,damage:345.7,controlSeconds:0,assistedDamage:0,battles:4,wins:3};});
assert.equal((await post({action:'heartbeat',uid:loser,lastSeen:1})).status,200);
let presence=(await W.readWorld()).w;assert(presence.players[winner].lastSeen>Date.now()-5000);assert.equal(presence.players[loser].lastSeen,0);
let ranking=await get();assert(ranking.onlinePlayers.some(p=>p.id===winner));const ranked=ranking.players.find(p=>p.id===winner);assert.equal(ranked.stats.kills,12);assert.equal(ranked.stats.damage,345);assert(!('wins' in ranked.stats));assert(!('history' in ranked));
sqlite.close();sqlite=new DatabaseSync(file);assert((await W.readWorld()).w.players[winner].lastSeen>0);
await W.mutate(w=>{w.players[winner].lastSeen=Date.now()-91000});ranking=await get();assert(!ranking.onlinePlayers.some(p=>p.id===winner));
console.log('PASS: authenticated heartbeat ignores spoofed identity/time, persists across reopen, expires after 90 seconds, and ranking exposes only summary statistics.');
// A new chapter sends every hero to reserve. Placing them again is free, even through Deploy; coins are spent only once all of a pupil's heroes are back on the map.
const B=require('../work/persistence/battle.cjs'),{ROUTES,routeLayout,mapLayout}=require('../work/persistence/map-layout.cjs');
sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha('r'),'r',Date.now()+86400000);cookie='qg_session=r';
await W.mutate(w=>{w.players.r={...W.newPlayer('r'),hero:30,heroLocked:true,gender:'girl',coins:1500};w.defenders.push({id:'r-one',owner:'r',type:30,cell:-1,level:4,weapon:'standard',weapons:['standard'],weaponLevels:{standard:4}},{id:'r-two',owner:'r',type:30,cell:-1,level:2,weapon:'standard',weapons:['standard'],weaponLevels:{standard:2}});});
let world=(await W.readWorld()).w;assert.equal(world.routeFrom,2);assert.equal(world.reserveRefunds,true);assert(Object.values(world.players).every(p=>!p.reserveRefund));
const openCells=Array.from({length:432},(_,c)=>c).filter(c=>B.isBuildable(c,world.wave,world.routeFrom)&&!world.defenders.some(d=>d.cell===c));
assert.equal((await post({action:'recruit',type:30,cell:openCells[0]})).status,200);world=(await W.readWorld()).w;let mine=world.defenders.filter(d=>d.owner==='r');
assert.equal(world.players.r.coins,1500);assert.equal(mine.length,2);assert.equal(mine[0].cell,openCells[0]);assert.equal(mine[0].level,4);assert.equal(mine[1].cell,-1);
assert.equal((await post({action:'move',id:'r-two',cell:openCells[1]})).status,200);assert.equal((await W.readWorld()).w.players.r.coins,1500);
assert.equal((await post({action:'recruit',type:30,cell:openCells[2]})).status,200);world=(await W.readWorld()).w;mine=world.defenders.filter(d=>d.owner==='r');assert.equal(world.players.r.coins,300);assert.equal(mine.length,3);assert.equal(mine[2].level,0);
console.log('PASS: reserve heroes are placed again for free, including through Deploy; a new hero costs coins only when none wait in reserve.');
// The chapter the class is in keeps its route; the next chapter uses a new one, on the server and in each battle snapshot.
await W.mutate(w=>{w.wave=11});const next=routeLayout(ROUTES[0]).cells,old=mapLayout(11).cells;
const onRoute=[...next].find(c=>B.isBuildable(c,11)),freed=[...old].find(c=>B.isBuildable(c,11,2)&&!(world.defenders.some(d=>d.cell===c)));
assert.equal((await get()).routeFrom,2);assert.equal((await post({action:'recruit',type:30,cell:onRoute})).status,400);assert.equal((await post({action:'move',id:'r-one',cell:freed})).status,200);
world=(await W.readWorld()).w;assert(world.defenders.every(d=>d.cell<0||!next.has(d.cell)));
assert.equal((await post({action:'battle',battleVersion:(await get()).battleVersion})).status,200);assert.deepEqual((await get()).battle.route,ROUTES[0]);
console.log('PASS: the next chapter uses a new route for placement, heroes on it return to reserve, and battles carry their route.');
cookie='qg_session='+winner;
await W.mutate(w=>{w.players[winner].coins=5000});
const {CLOTHING}=require('../work/persistence/clothing.cjs');
const accessories=CLOTHING.filter(c=>c.art>=15);assert.equal(accessories.length,12);
for(const item of accessories){const before=(await W.readWorld()).w.players[winner].coins;assert.equal((await post({action:'clothing',item:item.id})).status,200);assert.equal((await W.readWorld()).w.players[winner].coins,before-item.price);assert.equal((await post({action:'clothing',item:item.id})).status,200);assert.equal((await W.readWorld()).w.players[winner].coins,before-item.price);}
let profile=(await get()).players.find(p=>p.id===winner);assert(accessories.every(c=>profile.collection.clothing.includes(c.id)));assert(!('history' in profile));assert(!('mistakes' in profile));
sqlite.close();sqlite=new DatabaseSync(file);assert.equal((await W.readWorld()).w.players[winner].clothing.head,'star-cap');assert.equal((await post({action:'undress',slot:'head'})).status,200);assert((await W.readWorld()).w.players[winner].clothingOwned.includes('star-cap'));assert.equal((await post({action:'clothing',item:'fake-accessory'})).status,400);
console.log('PASS: all 12 accessories buy once, re-equip free, persist across reopen, unequip without losing ownership, and expose only collection summaries.');
sqlite.close();fs.unlinkSync(file);console.log('PASS: unselected heroes hidden; answers, wardrobe, items, coins and placements survive database reopen; pending question restored; simultaneous start accepts one; late join/reopen sees identical battle; stale start rejected after finish; pupil records isolated.');
})().catch(e=>{console.error(e);process.exitCode=1});
