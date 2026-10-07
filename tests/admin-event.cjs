const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/admin-event';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/game/route.ts','game.cjs');
const lib=name=>require(`../${dir}/${name}.cjs`),E=lib('admin-event');
const {start,end,item,id}=E.ADMIN_EVENT;
assert.equal(new Date(start).toLocaleString('en-GB',{timeZone:'Europe/London',weekday:'long',hour:'2-digit',minute:'2-digit'}),'Monday 18:00');
assert.equal(end-start,7200000);
for(const [at,on] of [[start-1,false],[start,true],[end-1,true],[end,false]])assert.equal(E.adminEventActive(at),on);
const full={itemSlots:4,equippedItems:['stopwatch','sharpener','glasses','medal'],itemInventory:{medal:3}};
assert.equal(E.grantEventGift(full,start),true);assert.equal(full.itemSlots,5);assert.equal(full.equippedItems.length,4);assert.equal(full.itemInventory[item],1);assert.equal(full.itemInventory.medal,3);
assert.equal(E.grantEventGift(full,start+1),false);assert.equal(full.itemSlots,5);
const empty={};E.grantEventGift(empty,start);assert.equal(empty.itemSlots,2);
assert.equal(E.grantEventGift({},end),false);
// Gold changes scenery materials and lawn colours, never the route geometry, path or kerb colours.
const THREE=require('three'),{boardTheme}=lib('board-theme'),{buildWorld,buildRoute}=lib('board-scenery'),{mapLayout}=lib('map-layout');
for(const wave of [1,51,121,261]){
 const normal=boardTheme(wave),gold=boardTheme(wave,true),layout=mapLayout(wave,5,2);
 assert.equal(gold.path,normal.path);assert.equal(gold.kerb,normal.kerb);assert.equal(gold.pathStyle,normal.pathStyle);
 const plain=buildWorld(normal),gilded=buildWorld(gold);
 const geometry=g=>{const out=[];g.traverse(o=>{if(o.isMesh)out.push([...o.geometry.attributes.position.array]);});return out;};
 assert.deepEqual(geometry(gilded.group),geometry(plain.group));
 assert(gilded.group.children.some(o=>o.isMesh&&o.material instanceof THREE.MeshStandardMaterial&&o.material.metalness>=.75));
 const routeA=buildRoute(normal,layout),routeB=buildRoute(gold,layout);
 assert.deepEqual(geometry(routeA.group),geometry(routeB.group));
 // The first mesh is the grass; all other route meshes keep their original vertex colours.
 for(let i=1;i<routeA.group.children.length;i++){
  const a=routeA.group.children[i],b=routeB.group.children[i];
  if(a.geometry?.attributes.color)assert.deepEqual([...a.geometry.attributes.color.array],[...b.geometry.attributes.color.array]);
 }
 for(const g of [plain,gilded,routeA,routeB])g.dispose();
}
console.log('PASS: golden scenery preserves map geometry and road colours across four chapters.');
const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(name,...args){if(name==='cloudflare:workers')return{env:{DB}};return original.call(this,name,...args);};
const W=lib('world'),G=lib('game'),Q=lib('questions'),M=lib('mock-tests');
const realNow=Date.now;let now=start-1;Date.now=()=>now;
const req=(uid,body)=>new Request('https://game.test/api/game',{method:body?'POST':'GET',headers:{...(uid?{cookie:'qg_session='+uid}:{}),origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Heroes':'7','X-Quest-Questions':'3'},...(body?{body:JSON.stringify(body)}:{})});
const get=async(uid)=>{const r=await G.GET(req(uid));assert.equal(r.status,200);return r.json();};
const post=async(uid,b)=>{const r=await G.POST(req(uid,b));const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;};
(async()=>{
 for(const uid of ['a','b'])sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,end+86400000);
 await W.mutate(w=>{w.players.a={...W.newPlayer('Ada'),itemSlots:4,equippedItems:['stopwatch','sharpener','glasses','medal'],itemInventory:{stopwatch:1,sharpener:1,glasses:1,medal:3}};w.players.b=W.newPlayer('Ben');w.players.a.heroLocked=true;w.defenders=[{id:'old-map',owner:'a',type:0,level:0,cell:49},{id:'old-reserve',owner:'a',type:0,level:0,cell:-1},{id:'other-pupil',owner:'b',type:1,level:0,cell:50}];W.beginBattle(w,0);});
 assert.equal((await get('a')).me.eventGifts,undefined);
 now=start;assert.equal((await get(null)).adminEvent.active,true);assert.equal((await W.readWorld()).w.players.b.eventGifts,undefined);
 const visits=await Promise.all([get('a'),get('a')]);for(const v of visits){assert.equal(v.me.eventGifts[id].at,start);assert.equal(v.me.eventGifts[id].extraSlot,true);}
 const saved=(await W.readWorld()).w.players.a;assert.equal(saved.itemSlots,5);assert.equal(saved.itemInventory[item],1);
 let state=(await W.readWorld()).w;
 assert.deepEqual(state.players.a.eventGifts[id].heroIds,['old-map','old-reserve']);
 assert.equal(state.defenders[0].adminAbuseTrophy,true);assert.equal(state.defenders[1].adminAbuseTrophy,true);assert.equal(state.defenders[2].adminAbuseTrophy,undefined);
 assert.equal(state.battle.fighters.find(f=>f.id==='old-map').adminAbuseTrophy,true);
 assert.equal((await get('a')).players.find(p=>p.id==='a').adminAbuseAchievement,true);
 await W.mutate(w=>{w.battle=null;w.players.a.coins=5000;w.defenders.find(d=>d.id==='old-reserve').cell=51;});
 await post('a',{action:'recruit',type:0,cell:52,requestId:crypto.randomUUID()});
 state=(await W.readWorld()).w;const later=state.defenders.find(d=>d.owner==='a'&&d.id!=='old-map'&&d.id!=='old-reserve');assert(later);assert.equal(later.adminAbuseTrophy,undefined);
 await get('a');assert.equal((await W.readWorld()).w.defenders.find(d=>d.id===later.id).adminAbuseTrophy,undefined);
 // Distinct model templates ensure later copies do not reuse a trophy-bearing hero's mesh.
 const H=lib('board-heroes'),plain=H.acquireHeroTemplate({type:0}),trophy=H.acquireHeroTemplate({type:0,adminAbuseTrophy:true});
 assert.notEqual(plain.key,trophy.key);assert(trophy.template.triangles>plain.template.triangles);H.releaseHeroTemplate(plain.key);H.releaseHeroTemplate(trophy.key);
 const q=Q.questions.find(q=>!q.legacy&&q.difficulty!=='Year 2');
 const answer=async(at,correct)=>{now=at;await W.mutate(w=>{const p=w.players.a;p.active={id:q.id,token:'answer-token',at:now,reward:q.reward};p.history={};p.questionRound={};});return post('a',{action:'answer',token:'answer-token',answer:correct?Q.toViewer(q,'a',q.answers)[0]:'wrong-answer'});};
 assert.equal((await answer(start+1000,true)).reward,q.reward+5);
 assert.equal((await answer(start+2000,false)).reward,0);
 assert.equal((await answer(end,true)).reward,q.reward);
 assert.equal((await get('b')).me.eventGifts,undefined);state=(await W.readWorld()).w;assert.equal(state.defenders[0].adminAbuseTrophy,true);assert.equal(state.defenders.find(d=>d.id===later.id).adminAbuseTrophy,undefined);
 // Completed mock tests use the same reward window; incomplete tests still pay no coins.
 for(const [at,complete,bonus] of [[start+1000,true,5],[end,true,0],[start+1000,false,0]]){
  const p=W.newPlayer('Mock');p.mock={id:'test',subject:q.subject,ids:complete?[q.id]:[q.id,Q.questions.find(x=>x.id!==q.id&&x.subject===q.subject).id],answers:{[q.id]:Q.toViewer(q,'m',q.answers)[0]},flags:[],startedAt:at-1000,endsAt:at+10000};
  assert.equal(M.gradeMock({m:p},p,'m',at).result.coins,complete?q.reward+bonus:0);
 }
 console.log('PASS: UK schedule and boundaries, permanent/idempotent gifts, full and empty pockets, anonymous/nonattending pupils, correct/wrong rewards, completed/incomplete mock tests, attendance achievement, trophies on existing/reserve/live heroes, and no trophies on later purchases.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{Date.now=realNow;sqlite.close();});
