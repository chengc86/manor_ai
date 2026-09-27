// Run after persistence.cjs, which compiles the real modules into work/persistence.
const assert=require('node:assert/strict'),fs=require('fs'),Module=require('module');
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{}};return original.call(this,id,...args)};
const W=require('../work/persistence/world.cjs'),B=require('../work/persistence/battle.cjs'),{mapLayout}=require('../work/persistence/map-layout.cjs'),{chapterScene}=require('../work/persistence/chapter-scenes.cjs'),{ENEMIES,enemyDamage}=require('../work/persistence/enemies.cjs'),{buildStats}=require('../work/persistence/builds.cjs');
for(const wave of [1,11,21])assert.equal(chapterScene(wave).art,'/manor-campus-v2.png');
const paths=[];for(let c=4;c<=30;c++){const wave=(c-1)*10+1,layout=mapLayout(wave);assert(fs.existsSync('public'+chapterScene(wave).art));paths.push(JSON.stringify(layout.waypoints));for(let i=1;i<layout.path.length;i++)assert.equal(Math.abs(layout.path[i].x-layout.path[i-1].x)+Math.abs(layout.path[i].y-layout.path[i-1].y),1);for(const cell of layout.cells)assert(!B.isBuildable(cell,wave));}
assert.equal(new Set(paths).size,27);assert.equal(ENEMIES.length,12);for(const e of ENEMIES)assert(fs.existsSync('public/enemies/'+e.id+'.webp'));
const tin=ENEMIES.find(e=>e.id==='tinback'),moth=ENEMIES.find(e=>e.id==='moth');assert(enemyDamage(100,tin,'physical')<enemyDamage(100,tin,'magic'));assert(enemyDamage(100,moth,'magic')<enemyDamage(100,moth,'physical'));
const cells=Array.from({length:432},(_,i)=>i).filter(c=>B.isBuildable(c,10));const defenders=cells.slice(0,40).map((cell,i)=>({id:String(i),owner:'a',type:0,cell,level:10,weapon:'standard',weapons:['standard'],weaponLevels:{standard:10}}));
const w={wave:10,players:{a:W.newPlayer('Test')},defenders,battle:null,result:null};W.beginBattle(w,0);w.battle.fighters.forEach(f=>{f.stats={...buildStats(0,10,'standard'),damage:100000,range:100,cooldown:.2};});const battle=structuredClone(w.battle);assert.deepEqual(B.simulate(battle),B.simulate(battle));const before=structuredClone(w.defenders);w.battle.start=0;W.finish(w);assert(w.result.won);assert.equal(w.wave,11);assert.deepEqual(w.defenders,before.map(d=>({...d,cell:-1})));W.beginBattle(w,w.battleVersion);assert.equal(w.battle.fighters.length,0);w.battle.start=0;W.finish(w);assert(!w.result.won);assert.equal(w.wave,11);
// Redesigned routes: valid, distinct, as hard as the original, and used only from World.routeFrom onwards.
const {ROUTES,routeLayout,BASE_WAYPOINTS}=require('../work/persistence/map-layout.cjs'),school=c=>c%24>=20&&Math.floor(c/24)>=14;
// The same squad, each hero standing where it covers the most path its teammates do not, should defeat a similar share of monsters.
const squadShare=route=>{const {path,cells}=routeLayout(route),open=Array.from({length:432},(_,c)=>c).filter(c=>c>=48&&c<408&&c%24>0&&c%24<23&&!(c%24>=20&&c>=336)&&!cells.has(c));let total=0;
 for(const [wave,n,level] of [[15,8,3],[22,9,3],[30,10,4],[50,14,5]]){const cover=path.map(()=>0),fighters=[];for(let i=0;i<n;i++){const type=i%7,stats=buildStats(type,level,'standard'),near=c=>path.flatMap((p,j)=>Math.hypot(p.x-c%24-.5,p.y-Math.floor(c/24)-.5)<=stats.range?[j]:[]);let cell,best=-1;for(const c of open)if(!fighters.some(f=>f.cell===c)){const v=near(c).reduce((s,j)=>s+1/(1+cover[j]),0);if(v>best){best=v;cell=c}}near(cell).forEach(j=>cover[j]++);fighters.push({id:'h'+i,owner:'p'+i,name:'QA',type,level,weapon:'standard',cell,stats})}
  const s=B.simulate({rulesVersion:5,seed:1,start:0,wave,route,duration:B.rules(wave).duration,power:0,target:0,contributors:0,fighters});total+=s.killed/s.count}return total/4};
const originalShare=squadShare(BASE_WAYPOINTS);
for(const route of ROUTES){const {path,cells}=routeLayout(route),order=path.map(p=>Math.floor(p.y)*24+Math.floor(p.x)),arrive=order.findIndex(school);assert.equal(route[0][0],0);assert.equal(cells.size,path.length);assert(Math.abs(squadShare(route)-originalShare)<=.08,JSON.stringify(route));for(let i=1;i<path.length;i++)assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y),1);assert(arrive>0&&order.slice(arrive).every(school));assert(path.every(p=>p.y>3&&p.y<17&&p.x<22));}
assert.equal(new Set(ROUTES.map(r=>JSON.stringify(r))).size,ROUTES.length);
assert.deepEqual(mapLayout(25,5,4).waypoints,mapLayout(25).waypoints);assert.deepEqual(mapLayout(31,5,4).waypoints,ROUTES[0]);for(let c=3;c<60;c++)assert.notDeepEqual(mapLayout(c*10,5,4).waypoints,mapLayout(c*10+1,5,4).waypoints);
for(const cell of routeLayout(ROUTES[0]).cells)assert(!B.isBuildable(cell,31,4));
const routed={...structuredClone(battle),route:ROUTES[3]};assert.notDeepEqual(B.simulate(routed).events,B.simulate(battle).events);assert.deepEqual(B.simulate(routed),B.simulate(structuredClone(routed)));
// One-off refunds for heroes bought while the same pupil's heroes waited in reserve.
const {spawnCost}=require('../work/persistence/heroes.cjs'),receipt=body=>({id:String(Math.random()),body:JSON.stringify(body)}),hero=(owner,id,cell,level=1)=>({id,owner,type:0,cell,level,weapon:'standard',weapons:['standard'],weaponLevels:{standard:level}});
const pupil=(name,receipts,extra={})=>({...W.newPlayer(name),coins:5,receipts:receipts.map(receipt),...extra});
const refunds={wave:11,routeFrom:2,battle:null,result:null,players:{
 kept:pupil('kept',[{action:'recruit',type:0,cell:60},{action:'recruit',type:0,cell:100}]),
 later:pupil('later',[{action:'recruit',type:0,cell:130},{action:'move',id:'later-1',cell:120}]),
 first:pupil('first',[{action:'move',id:'first-1',cell:140},{action:'recruit',type:0,cell:150}]),
 third:pupil('third',[{action:'recruit',type:0,cell:160}]),
 before:pupil('before',[{action:'recruit',type:0,cell:175},{action:'move',id:'before-2',cell:180}]),
 test:pupil('test',[{action:'recruit',type:0,cell:190}],{unlimitedCoins:true})},
 defenders:[hero('kept','kept-1',-1,5),hero('kept','kept-2',100,0),hero('later','later-1',120,3),hero('later','later-2',130,0),hero('first','first-1',140,3),hero('first','first-2',150,0),hero('third','third-1',-1,4),hero('third','third-2',-1,2),hero('third','third-3',160,0),hero('before','before-1',-1,2),hero('before','before-2',180,2),hero('test','test-1',-1),hero('test','test-2',190,0)]};
const quiet=structuredClone(refunds);quiet.defenders=quiet.defenders.filter(d=>d.cell>=0);
W.refundReserveDeploys(refunds);W.refundReserveDeploys(refunds);const coins=Object.fromEntries(Object.entries(refunds.players).map(([id,p])=>[id,p.coins]));
assert.deepEqual(coins,{kept:5+spawnCost(1),later:5+spawnCost(1),first:5,third:5+spawnCost(2),before:5,test:5});assert.deepEqual(refunds.players.third.reserveRefund,{coins:1200,heroes:1});assert.equal(refunds.reserveRefunds,true);assert.equal(refunds.defenders.length,13);
W.refundReserveDeploys(quiet);assert(Object.values(quiet.players).every(p=>p.coins===5&&!p.reserveRefund));
console.log(`PASS: ${ROUTES.length} redesigned routes are valid, distinct and as hard as the original, start the chapter after the update, change every chapter and travel with battles; reserve-purchase refunds run once, only for heroes bought while an older hero waited in reserve.`);
console.log('PASS: 27 unique routes and available scene assets, original first three backgrounds, enemy resistances, deterministic combat, chapter reserve reset preserving equipment, reserves excluded, failed wave stays.');
