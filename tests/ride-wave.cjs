// A hero on a ride is drawn on the 3D map and, during a wave, travels with the same
// rounded route and cell speed the monsters already use. Never uses live pupil data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),Module=require('module');
const dir='work/ride-wave';fs.mkdirSync(dir,{recursive:true});
const compile=(src,out)=>fs.writeFileSync(`${dir}/${out}`,ts.transpileModule(fs.readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))compile('lib/'+f,f.replace('.ts','.cjs'));
compile('app/api/game/route.ts','game.cjs');
const lib=name=>require(`../${dir}/${name}.cjs`);
const THREE=require('three');
const B=lib('battle'),{visualPosition,visualHeading}=lib('route-visual'),{mapLayout}=lib('map-layout'),{buildStats}=lib('builds');
const {acquireHeroTemplate,releaseHeroTemplate}=lib('board-heroes'),{BoardScene}=lib('board-scene'),{boardTheme}=lib('board-theme');
const {isBuildable,cellPoint,rideCells,riderState,planRide,waveCellSpeed,simulate,COLS}=B;

const layout=mapLayout(1,5,2),pathCells=[...layout.cells];
const distToPath=cell=>{const p=cellPoint(cell);let best=Infinity;for(const c of pathCells){const q=cellPoint(c);best=Math.min(best,Math.hypot(p.x-q.x,p.y-q.y));}return best;};
const open=[];for(let c=0;c<COLS*18;c++)if(isBuildable(c,1,2))open.push(c);
const ordered=[];for(const p of layout.path){const c=Math.floor(p.y)*COLS+Math.floor(p.x);if(ordered.at(-1)!==c)ordered.push(c);}
const beside=ordered[Math.floor(ordered.length*.35)];
const near=[beside-1,beside+1,beside-COLS,beside+COLS].find(c=>isBuildable(c,1,2));
const far=open.find(c=>{const cells=rideCells(c,near);return cells&&cells.length>=3&&cells.length<ordered.length*.3&&distToPath(c)>3;});
assert(near!==undefined&&far!==undefined,'a ride needs an open square beside the path and one further away');
const steps=rideCells(far,near);
assert(steps[0]===far&&steps.at(-1)===near);
assert(steps.every((c,i)=>i===0||Math.abs(c-steps[i-1])===1||Math.abs(c-steps[i-1])===COLS));
assert.equal(rideCells(far,14*COLS+21),null,'the manor footprint is not a riding square');
assert.equal(planRide({wave:1,rideMoves:[]},'h',far,14*COLS+21,0),null);

const points=steps.map(cellPoint);
const battle={rulesVersion:5,seed:7,start:1_000_000,wave:1,route:layout.waypoints,duration:B.rules(1).duration,power:0,target:0,contributors:1,fighters:[],rideMoves:[{id:'h',at:1_000_000,points}]};
const speed=waveCellSpeed(battle),span=points.length-1;
assert(Math.abs(speed-(layout.path.length-1)/B.rules(1).travel)<1e-9,'a ride walks at this wave\'s monster cell speed');
const still=riderState(battle,'h',far,1_000_000);
assert.equal(still.moving,false);assert.equal(still.cell,far);assert.deepEqual({x:still.x,y:still.y},cellPoint(far));
const midAt=1_000_000+span/2/speed*1000,mid=riderState(battle,'h',far,midAt),seen=visualPosition(.5,points);
assert(Math.hypot(mid.x-seen.x,mid.y-seen.y)<1e-9,'halfway along, the hero sits on the same rounded route monsters use');
assert(Math.abs(mid.yaw-visualHeading(.5,points))<1e-9);
const done=riderState(battle,'h',far,midAt+span/2/speed*1000+20);
assert.equal(done.moving,false);assert.equal(done.cell,near);assert(Math.hypot(done.x-cellPoint(near).x,done.y-cellPoint(near).y)<1e-9);
assert.equal(riderState({...battle,rideMoves:[]},'h',far,midAt+99999).cell,far,'without an order the hero stays on their square');
// A new order starts where they are and a one-point order stops them.
const stop=planRide(battle,'h',far,mid.cell,midAt);
assert.deepEqual(stop,[cellPoint(mid.cell)]);
console.log(`PASS: a ride follows the monster route at ${speed.toFixed(2)} cells/s (${span} squares from ${far} to ${near}).`);

const stats={...buildStats(2,1,'standard',{}),damage:50000,range:1.2,cooldown:.2,critChance:0};
const fighter={id:'h',type:2,level:1,weapon:'standard',cell:far,owner:'a',name:'Ada',stats};
const quiet={...battle,fighters:[fighter],rideMoves:undefined};
const riding={...battle,fighters:[fighter],rideMoves:[{id:'h',at:battle.start,points}]};
const quietSim=simulate(quiet),rideSim=simulate(riding);
assert.equal(quietSim.events.length,0,'a short-range hero far from the path does not hit anyone');
assert(rideSim.events.length>0,'the same hero hits monsters after riding up to the path');
assert(rideSim.events.every(e=>e.fighter===0));
const arrive=span/speed;
const parked={...riding,rideMoves:[{id:'h',at:battle.start+battle.duration,points}]};
assert.equal(JSON.stringify(simulate(parked).events),JSON.stringify(quietSim.events),'an order that has not begun leaves the fight unchanged');
console.log(`PASS: riding into range deals ${rideSim.events.length} hits; standing still deals none.`);

const plain=acquireHeroTemplate({type:0,weapon:'standard'}),ridden=acquireHeroTemplate({type:0,weapon:'standard',ride:{id:'bicycle',paint:'green'}});
assert(ridden.template.triangles>plain.template.triangles,'the bicycle is part of the hero mesh, in the same bake as other map heroes');
releaseHeroTemplate(plain.key);releaseHeroTemplate(ridden.key);
const scene=new BoardScene(),camera=new THREE.PerspectiveCamera(36,2,.5,260);
camera.position.set(12,20,30);camera.lookAt(12,0,9);camera.updateMatrixWorld();
scene.setHeroes([{id:'h',type:0,cell:far,level:1,weapon:'standard',name:'Ada',ride:{id:'bicycle',paint:'green'}}]);
scene.setBattle(riding);
scene.frame({time:0,battleNow:battle.start,camera,motion:true,labels:false});
const home=cellPoint(far),there=cellPoint(near);
const over=p=>scene.pick(new THREE.Ray(new THREE.Vector3(p.x,30,p.y),new THREE.Vector3(0,-1,0)));
assert.deepEqual(over(home),{kind:'hero',id:'h'});
scene.frame({time:arrive+1,battleNow:battle.start+(arrive+1)*1000,camera,motion:true,labels:false});
assert.deepEqual(over(there),{kind:'hero',id:'h'},'after the ride, the hero stands on the destination square');
assert.notDeepEqual(over(home),{kind:'hero',id:'h'});
scene.dispose();
console.log('PASS: the 3D map shows the ride and moves that hero onto the chosen square during the wave.');

const file=`${dir}/test-${Date.now()}.sqlite`,sqlite=new DatabaseSync(file);
sqlite.exec('CREATE TABLE world(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT,expires INTEGER);');
const DB={prepare(sql){return {bind(...values){return {async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}},async first(){return sqlite.prepare(sql).get(...values)??null}}}}}};
const original=Module._load;Module._load=function(id,...args){if(id==='cloudflare:workers')return{env:{DB}};return original.call(this,id,...args)};
const W=lib('world'),GAME=lib('game');
const post=(uid,body)=>GAME.POST(new Request('https://game.test/api/game',{method:'POST',headers:{cookie:'qg_session='+uid,origin:'https://game.test',host:'game.test','content-type':'application/json','X-Quest-Heroes':'5'},body:JSON.stringify({requestId:crypto.randomUUID(),...body})})).then(async r=>({status:r.status,body:await r.json()}));
(async()=>{
 sqlite.prepare('INSERT INTO sessions VALUES (?,?,?)').run(await W.sha('a'),'a',Date.now()+86400000);
 await W.mutate(w=>{w.players.a={...W.newPlayer('Ada'),coins:5000,hero:2,heroLocked:true,lastSeen:Date.now()};});
 let r=await post('a',{action:'recruit',type:2,cell:far});assert.equal(r.status,200);
 const defender=r.body.world.defenders.find(d=>d.owner==='a');
 r=await post('a',{action:'battle',battleVersion:r.body.world.battleVersion});assert.equal(r.status,200);assert(r.body.world.battle);
 r=await post('a',{action:'move',id:defender.id,cell:near});assert.equal(r.status,400);assert.match(r.body.error,/Wait for the shared wave/);
 assert.equal((await W.readWorld()).w.battle.rideMoves,undefined);
 r=await post('a',{action:'vehicle',item:'scooter'});assert.equal(r.status,200);assert.deepEqual(r.body.world.me.ride,{id:'scooter',paint:'red'});
 r=await post('a',{action:'move',id:defender.id,cell:beside});assert.equal(r.status,400);assert.match(r.body.error,/open square beside the path/);
 r=await post('a',{action:'move',id:defender.id,cell:near});assert.equal(r.status,200);
 const saved=(await W.readWorld()).w,fight=saved.battle,moved=saved.defenders.find(d=>d.id===defender.id),hero=fight.fighters.find(f=>f.id===defender.id);
 assert.equal(hero.cell,far,'the wave still replays from the square the hero started on');
 assert.equal(moved.cell,near);
 assert.equal(fight.rideMoves.length,1);assert.equal(fight.rideMoves[0].id,defender.id);assert.deepEqual(fight.rideMoves[0].points,points);
 const arrived=riderState(fight,defender.id,hero.cell,fight.rideMoves[0].at+(span/speed+1)*1000);
 assert.equal(arrived.cell,near);assert.equal(arrived.moving,false);
 r=await post('a',{action:'move',id:defender.id,cell:far});assert.equal(r.status,200);
 assert.equal((await W.readWorld()).w.battle.rideMoves.length,2,'a later order continues the same journey');
 console.log('PASS: during a wave only a hero on a ride can move, and the order is the same polyline monsters follow.');
 sqlite.close();fs.rmSync(file,{force:true});
})().catch(e=>{console.error(e);process.exitCode=1});
