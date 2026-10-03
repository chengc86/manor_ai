// Rides: the catalogue, every 3D ride in every paint (with heroes riding them), the hero camp budget, and buying,
// riding, repainting and parking through the real game API on an on-disk SQL database. Never uses live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/vehicles';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/game/route.ts','game.cjs');
const lib=name=>require(`../${dir}/${name}.cjs`);
const {VEHICLES,PAINTS,vehicle,paint,rideOf}=lib('vehicles'),{createVehicleModel}=lib('vehicle-model'),{createRidingHero}=lib('hero-ride'),{outfitForWardrobe}=lib('hero-model');
const {HERO_3D_STUDIES}=lib('hero-3d-catalogue'),{acquireHeroTemplate,releaseHeroTemplate}=lib('board-heroes');
const finite=o=>{let ok=true;o.updateMatrixWorld(true);o.traverse(m=>{if(m.isMesh&&!([...m.geometry.attributes.position.array].every(Number.isFinite)&&m.matrixWorld.elements.every(Number.isFinite)))ok=false;});return ok;};

// The catalogue: stable, distinct ids, sensible prices and poses, and every default paint exists.
assert.equal(new Set(VEHICLES.map(v=>v.id)).size,VEHICLES.length);assert.equal(new Set(PAINTS.map(p=>p.id)).size,PAINTS.length);
for(const v of VEHICLES){assert(v.price>=100&&v.price<=2000,v.id);assert(['board','scoot','pedal','seat'].includes(v.pose),v.id);assert(paint(v.paint),v.id);assert(v.blurb.length<=40,v.id);}
assert.deepEqual(rideOf({}),undefined);assert.deepEqual(rideOf({vehicle:'car'}),{id:'car',paint:'red'});assert.deepEqual(rideOf({vehicle:'car',vehiclePaint:{car:'blue'}}),{id:'car',paint:'blue'});assert.deepEqual(rideOf({vehicle:'rocket-sled'}),undefined);assert.deepEqual(rideOf({vehicle:'car',vehiclePaint:{car:'gold'}}),{id:'car',paint:'red'});

// Every ride builds in every paint, and heroes of every build can sit on it.
let models=0;
for(const v of VEHICLES)for(const p of PAINTS){const m=createVehicleModel(v.id,p.id);m.animate(1.2,true);assert(finite(m.root),`${v.id} ${p.id}`);assert(m.mount.every(Number.isFinite));m.dispose();models++;}
const riders=[0,14,19,51,55,83,98,113].map(id=>HERO_3D_STUDIES.find(h=>h.id===id));
for(const v of VEHICLES)for(const hero of riders){const w={top:'shirt',bottom:'trousers',feet:'school-shoes',back:'star-cape'},r=createRidingHero(hero.skin,outfitForWardrobe(w),w,{id:v.id,paint:v.paint});for(const motion of ['idle','walk','attack'])r.animate(.7,motion);assert(finite(r.root),`${hero.name} on ${v.id}`);r.dispose();}
console.log(`PASS: ${VEHICLES.length} rides in ${PAINTS.length} paints (${models} models) and ${riders.length*VEHICLES.length} heroes riding them build with finite geometry.`);

// In the hero camp a hero on the biggest ride still bakes to one small mesh.
let worst=0,worstName='';
for(const v of VEHICLES)for(const hero of [HERO_3D_STUDIES.find(h=>h.id===36),HERO_3D_STUDIES.find(h=>h.id===101)]){const look={type:hero.id,clothing:{top:'dress',head:'gold-crown',back:'star-cape',feet:'trainers'},ride:{id:v.id,paint:v.paint}},{key,template}=acquireHeroTemplate(look);if(template.triangles>worst){worst=template.triangles;worstName=`${hero.name} on ${v.id}`;}releaseHeroTemplate(key);}
assert(worst<13000,`heaviest camp hero ${worstName}: ${worst} triangles`);
console.log(`PASS: camp heroes on rides bake under 13,000 triangles (heaviest ${worstName}, ${worst}).`);

// Buying, riding, repainting and parking through the game API.
const file=`${dir}/test-${Date.now()}.sqlite`,sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const W=require(`../${dir}/world.cjs`),GAME=require(`../${dir}/game.cjs`);
const post=(uid,body)=>GAME.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Heroes':'6'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})})).then(async r=>({status:r.status,body:await r.json()}));
const me=async uid=>(await W.readWorld()).w.players[uid];
(async()=>{
 for(const uid of ['a','b']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+86400000);await W.mutate(w=>{w.players[uid]={...W.newPlayer(uid),coins:100,hero:uid==='a'?0:14,heroLocked:true,lastSeen:Date.now()};});}
 let r=await post('a',{action:'vehicle',item:'skateboard'});assert.equal(r.status,400);assert.match(r.body.error,/costs 150 coins/);assert.equal((await me('a')).coins,100);assert.equal((await me('a')).vehicle,undefined);
 r=await post('a',{action:'vehicle',item:'rocket-sled'});assert.equal(r.status,400);assert.match(r.body.error,/Choose a ride/);
 await W.mutate(w=>{w.players.a.coins=1000;});
 const requestId=crypto.randomUUID();r=await post('a',{action:'vehicle',item:'skateboard',requestId});assert.equal(r.status,200);let p=await me('a');assert.equal(p.coins,850);assert.deepEqual(p.vehiclesOwned,['skateboard']);assert.equal(p.vehicle,'skateboard');
 r=await post('a',{action:'vehicle',item:'skateboard',requestId});assert.equal(r.body.duplicate,true);assert.equal((await me('a')).coins,850);
 r=await post('a',{action:'vehicle',item:'scooter'});p=await me('a');assert.equal(p.coins,650);assert.deepEqual(p.vehiclesOwned,['skateboard','scooter']);assert.equal(p.vehicle,'scooter');
 r=await post('a',{action:'vehicle',item:'skateboard'});p=await me('a');assert.equal(p.coins,650,'riding an owned ride again is free');assert.equal(p.vehicle,'skateboard');
 r=await post('a',{action:'vehicle_paint',item:'skateboard',paint:'pink'});assert.equal(r.status,200);assert.deepEqual(r.body.world.me.ride,{id:'skateboard',paint:'pink'});assert.equal((await me('a')).coins,650,'painting is free');
 r=await post('a',{action:'vehicle_paint',item:'car',paint:'pink'});assert.equal(r.status,400);assert.match(r.body.error,/Buy this ride first/);
 r=await post('a',{action:'vehicle_paint',item:'skateboard',paint:'gold'});assert.equal(r.status,400);
 // Classmates see the ride and the collection; nobody else's coins or rides change.
 r=await post('b',{action:'heartbeat'});const seen=r.body.world.players.find(x=>x.id==='a');assert.deepEqual(seen.ride,{id:'skateboard',paint:'pink'});assert.deepEqual(seen.collection.vehicles,['skateboard','scooter']);assert.deepEqual(r.body.world.onlinePlayers.find(x=>x.id==='a').ride,{id:'skateboard',paint:'pink'});
 assert.equal((await me('b')).coins,100);assert.equal(r.body.world.players.find(x=>x.id==='b').ride,undefined);
 r=await post('a',{action:'park'});assert.equal(r.status,200);p=await me('a');assert.equal(p.vehicle,undefined);assert.deepEqual(p.vehiclesOwned,['skateboard','scooter']);assert.equal(r.body.world.me.ride,undefined);
 r=await post('a',{action:'vehicle',item:'scooter'});assert.equal((await me('a')).coins,650);assert.deepEqual((await me('a')).vehiclePaint,{skateboard:'pink'});
 // Test accounts with unlimited coins can try everything without spending.
 await W.mutate(w=>{w.players.b.unlimitedCoins=true;});r=await post('b',{action:'vehicle',item:'fire-engine'});assert.equal(r.status,200);assert.equal((await me('b')).coins,100);
 console.log('PASS: rides cost their price once (never twice for a repeated request), riding and repainting owned rides are free, paints and rides are checked, parking keeps the ride, and classmates see each ride.');
 sqlite.close();fs.rmSync(file,{force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
