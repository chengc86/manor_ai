// Rides: the catalogue, every 3D ride in every paint (with heroes riding them), the hero camp budget, and buying,
// riding, repainting and parking through the real game API on an on-disk SQL database. Never uses live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/vehicles';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/game/route.ts','game.cjs');
const lib=name=>require(`../${dir}/${name}.cjs`);
const {VEHICLES,PAINTS,vehicle,paint,rideOf}=lib('vehicles'),{createVehicleModel}=lib('vehicle-model'),{createRidingHero}=lib('hero-ride'),{outfitForWardrobe}=lib('hero-model'),{isBuildable,COLS}=lib('battle');
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
const post=(uid,body)=>GAME.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Heroes':'7'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})})).then(async r=>({status:r.status,body:await r.json()}));
const me=async uid=>(await W.readWorld()).w.players[uid];
(async()=>{
 for(const uid of ['a','b']){sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha(uid),uid,Date.now()+86400000);await W.mutate(w=>{w.players[uid]={...W.newPlayer(uid),coins:100,hero:uid==='a'?0:14,heroLocked:true,lastSeen:Date.now()};});}
 let r=await post('a',{action:'vehicle',item:'skateboard'});assert.equal(r.status,400);assert.match(r.body.error,/costs 150 coins/);assert.equal((await me('a')).coins,100);assert.equal((await me('a')).vehicle,undefined);
 r=await post('a',{action:'vehicle',item:'rocket-sled'});assert.equal(r.status,400);assert.match(r.body.error,/Choose a ride/);
 await W.mutate(w=>{w.players.a.coins=2000;});
 const grass=[];for(let c=0;c<COLS*18;c++)if(isBuildable(c,1,2))grass.push(c);
 r=await post('a',{action:'recruit',type:0,cell:grass[0]});assert.equal(r.status,200);
 r=await post('a',{action:'recruit',type:0,cell:grass[8]});assert.equal(r.status,200);
 let world=(await post('a',{action:'heartbeat'})).body.world,own=world.defenders.filter(d=>d.owner==='a');
 const [first,second]=own,byId=id=>world.defenders.find(d=>d.id===id);
 const requestId=crypto.randomUUID();r=await post('a',{action:'vehicle',item:'skateboard',id:first.id,requestId});assert.equal(r.status,200);world=r.body.world;let p=await me('a');assert.equal(p.coins,2000-120-600-150);assert.deepEqual(p.vehiclesOwned,['skateboard']);assert.equal(p.vehicle,undefined);assert.equal(byId(first.id).vehicle,'skateboard');assert.equal(byId(second.id).vehicle,undefined);
 r=await post('a',{action:'vehicle',item:'skateboard',id:first.id,requestId});assert.equal(r.body.duplicate,true);assert.equal((await me('a')).coins,2000-120-600-150);
 r=await post('a',{action:'vehicle',item:'scooter',id:first.id});world=(await post('a',{action:'heartbeat'})).body.world;p=await me('a');assert.equal(p.coins,2000-120-600-150-200);assert.deepEqual(p.vehiclesOwned,['skateboard','scooter']);assert.equal(world.defenders.find(d=>d.id===first.id).vehicle,'scooter','giving this hero a second ride replaces the one they had');assert.equal(world.defenders.find(d=>d.id===second.id).vehicle,undefined,'the parked skateboard is not shared with the other hero');
 r=await post('a',{action:'vehicle',item:'skateboard',id:second.id});world=r.body.world;p=await me('a');assert.equal(p.coins,2000-120-600-150-200,'riding an owned ride again is free');assert.equal(world.defenders.find(d=>d.id===second.id).vehicle,'skateboard');assert.equal(world.defenders.find(d=>d.id===first.id).vehicle,'scooter');
 r=await post('a',{action:'vehicle',item:'scooter',id:second.id});world=r.body.world;assert.equal(world.defenders.find(d=>d.id===second.id).vehicle,'scooter');assert.equal(world.defenders.find(d=>d.id===first.id).vehicle,undefined,'the same purchase cannot stay on the hero who had it');assert.equal((await me('a')).coins,2000-120-600-150-200);
 r=await post('a',{action:'vehicle',item:'scooter',id:first.id});r=await post('a',{action:'vehicle',item:'skateboard',id:second.id});world=r.body.world;assert.equal(world.defenders.find(d=>d.id===first.id).vehicle,'scooter');assert.equal(world.defenders.find(d=>d.id===second.id).vehicle,'skateboard');
 r=await post('a',{action:'vehicle',item:'skateboard'});assert.equal(r.status,400);assert.match(r.body.error,/Choose which hero/);assert.equal((await me('a')).coins,2000-120-600-150-200);
 r=await post('a',{action:'vehicle_paint',item:'skateboard',paint:'pink'});assert.equal(r.status,200);world=r.body.world;assert.deepEqual(world.defenders.find(d=>d.id===second.id).ride,{id:'skateboard',paint:'pink'});assert.deepEqual(world.defenders.find(d=>d.id===first.id).ride,{id:'scooter',paint:'red'});assert.equal((await me('a')).coins,2000-120-600-150-200,'painting is free');
 r=await post('a',{action:'vehicle_paint',item:'car',paint:'pink'});assert.equal(r.status,400);assert.match(r.body.error,/Buy this ride first/);
 r=await post('a',{action:'vehicle_paint',item:'skateboard',paint:'gold'});assert.equal(r.status,400);
 // Classmates see each hero's ride and the collection; nobody else's coins or rides change.
 r=await post('b',{action:'heartbeat'});world=r.body.world;const seen=world.players.find(x=>x.id==='a');assert.deepEqual(seen.collection.vehicles,['skateboard','scooter']);assert.deepEqual(world.defenders.find(d=>d.id===second.id).ride,{id:'skateboard',paint:'pink'});assert.deepEqual(world.defenders.find(d=>d.id===first.id).ride,{id:'scooter',paint:'red'});assert.equal(world.defenders.filter(d=>d.owner==='b'&&d.ride).length,0);
 assert.equal((await me('b')).coins,100);assert.equal(world.players.find(x=>x.id==='b').ride,undefined);
 r=await post('a',{action:'park',id:first.id});assert.equal(r.status,200);world=r.body.world;p=await me('a');assert.equal(world.defenders.find(d=>d.id===first.id).vehicle,undefined);assert.equal(world.defenders.find(d=>d.id===second.id).vehicle,'skateboard');assert.deepEqual(p.vehiclesOwned,['skateboard','scooter']);assert.deepEqual(world.me.ride,{id:'skateboard',paint:'pink'});
 r=await post('a',{action:'vehicle',item:'scooter',id:first.id});assert.equal((await me('a')).coins,2000-120-600-150-200);assert.deepEqual((await me('a')).vehiclePaint,{skateboard:'pink'});assert.equal((await post('a',{action:'heartbeat'})).body.world.defenders.find(d=>d.id===first.id).vehicle,'scooter');
 // A saved pupil-wide ride is given to one hero, not copied onto every hero.
 await W.mutate(w=>{w.players.c={...W.newPlayer('Cara'),coins:0,hero:0,heroLocked:true,vehiclesOwned:['tricycle'],vehicle:'tricycle'};w.defenders.push({id:'c1',owner:'c',type:0,level:0,cell:grass[2],weapon:'none',weapons:[]},{id:'c2',owner:'c',type:0,level:0,cell:grass[3],weapon:'none',weapons:[]});});
 const mig=(await W.readWorld()).w;assert.equal(mig.players.c.vehicle,undefined);assert.equal(mig.defenders.find(d=>d.id==='c1').vehicle,'tricycle');assert.equal(mig.defenders.find(d=>d.id==='c2').vehicle,undefined);
 // Rides already sitting on more than one hero are cut back to one. The earliest hero on the map keeps that purchase.
 const hero=(id,cell,vehicle)=>({id,owner:'dup',type:0,level:0,weapon:'none',weapons:[],cell,vehicle});
 await W.mutate(w=>{w.players.dup={...W.newPlayer('Dup'),coins:0,hero:0,heroLocked:true,vehiclesOwned:['skateboard','scooter','bicycle','car']};
  w.defenders.push(hero('r1',-1,'skateboard'),hero('r2',grass[4],'skateboard'),hero('r3',grass[5],'scooter'),hero('r4',grass[11],'bicycle'),hero('r5',grass[10],'bicycle'),hero('r6',-1,'car'),hero('r7',-1,'car'));
  w.battle={rulesVersion:5,seed:1,start:Date.now(),wave:1,duration:1e12,power:0,target:1,contributors:0,fighters:[{id:'r4',type:0,level:0,cell:grass[6],name:'Dup'},{id:'r5',type:0,level:0,cell:grass[7],name:'Dup'}],rideMoves:[{id:'r4',at:Date.now(),points:[{x:1.5,y:2.5},{x:2.5,y:2.5}],ride:'bicycle'},{id:'r5',at:Date.now(),points:[{x:3.5,y:2.5},{x:4.5,y:2.5}],ride:'bicycle'}]};});
 const cut=(await W.readWorld()).w,rideOfId=id=>cut.defenders.find(d=>d.id===id);
 assert.equal(rideOfId('r1').vehicle,undefined,'the reserve copy of a ride that is also on the map is removed');
 assert.equal(rideOfId('r2').vehicle,'skateboard','the hero on the map keeps the skateboard');
 assert.equal(rideOfId('r3').vehicle,'scooter');
 assert.equal(rideOfId('r4').vehicle,'bicycle','when several heroes on the map share a ride, the earliest keeps it');
 assert.equal(rideOfId('r5').vehicle,undefined);
 assert.equal(rideOfId('r5').cell,grass[7],'a hero who loses the shared ride returns to the square they started the wave on');
 assert.equal(rideOfId('r4').cell,grass[11]);
 assert.deepEqual(cut.battle.rideMoves.map(m=>m.id),['r4']);
 assert.equal(rideOfId('r6').vehicle,'car','when every copy is in reserve, the earliest hero keeps it');
 assert.equal(rideOfId('r7').vehicle,undefined);
 assert.equal(cut.defenders.filter(d=>d.owner==='dup'&&d.vehicle==='skateboard').length,1);
 assert.equal(cut.defenders.filter(d=>d.owner==='dup'&&d.vehicle==='bicycle').length,1);
 assert.equal(cut.defenders.filter(d=>d.owner==='dup'&&d.vehicle==='car').length,1);
 // Test accounts with unlimited coins can try everything without spending.
 await W.mutate(w=>{w.players.b.unlimitedCoins=true;});r=await post('b',{action:'vehicle',item:'fire-engine'});assert.equal(r.status,200);assert.equal((await me('b')).coins,100);assert.deepEqual((await me('b')).vehiclesOwned,['fire-engine']);assert.equal((await me('b')).vehicle,undefined);
 console.log('PASS: a ride is bought once, assigned to one hero, replaced on that hero without being shared, and classmates see that hero\'s ride.');
 sqlite.close();fs.rmSync(file,{force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
