// The 3D battlefield: themes, geometry budgets, scenery clearance and a headless battle, independent of live data.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
fs.mkdirSync('work/board-3d',{recursive:true});
for(const f of fs.readdirSync('lib').filter(f=>f.endsWith('.ts')))fs.writeFileSync('work/board-3d/'+f.replace('.ts','.cjs'),ts.transpileModule(fs.readFileSync('lib/'+f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g,'require("./$1.cjs")'));
const THREE=require('three');
const lib=name=>require(`../work/board-3d/${name}.cjs`);
const {boardTheme,BOARD_THEME_COUNT}=lib('board-theme'),{visualPosition,visualHeading}=lib('route-visual'),{ROUTES,routeLayout,mapLayout}=lib('map-layout');
const {createMonsterModel,MONSTER_KINDS,MONSTER_LOOKS}=lib('monster-model'),{bakeRig,instantiateRig}=lib('rig-bake'),{ENEMIES}=lib('enemies');
const {acquireHeroTemplate,releaseHeroTemplate}=lib('board-heroes'),{HERO_3D_STUDIES}=lib('hero-3d-catalogue'),{EQUIPMENT}=lib('equipment');
const {buildWorld,buildRoute,buildableCells}=lib('board-scenery'),{BoardScene}=lib('board-scene'),B=lib('battle'),{buildStats}=lib('builds');
const finite=g=>[...g.attributes.position.array].every(Number.isFinite);
// Every chapter has a complete look, and the 30 looks repeat for Manor Legends.
const kits=new Set();
for(let chapter=1;chapter<=40;chapter++){const t=boardTheme((chapter-1)*10+1);assert.equal(t.chapter,chapter);assert(t.kit&&t.time&&t.weather&&t.pathStyle&&t.landmark,`chapter ${chapter}`);kits.add(t.kit);
 for(const c of [...t.lighting.sky,t.lighting.fog,t.lighting.sun,...t.lighting.grass,t.path,t.kerb])assert(Number.isInteger(c)&&c>=0&&c<=0xffffff);
 if(chapter>30)assert.equal(JSON.stringify(t.lighting),JSON.stringify(boardTheme((chapter-31)*10+1).lighting));}
assert.equal(BOARD_THEME_COUNT,30);assert.equal(kits.size,11);
// Monsters walk inside the path: every sampled position on every route lies on a path square.
const layouts=[...ROUTES.map(r=>routeLayout(r)),mapLayout(1,4),mapLayout(41,4)];
for(const layout of layouts){let last=null;for(let i=0;i<=2000;i++){const p=visualPosition(i/2000,layout.path);assert(layout.cells.has(Math.floor(p.y)*24+Math.floor(p.x)),`off path at ${p.x},${p.y}`);if(last)assert(Math.hypot(p.x-last.x,p.y-last.y)<.2);last=p;assert(Number.isFinite(visualHeading(i/2000,layout.path)));}
 const open=buildableCells(layout.cells);for(let c=0;c<432;c++){const x=c%24,y=Math.floor(c/24);const expected=c>=48&&c<408&&x>0&&x<23&&!(x>=20&&y>=14)&&!layout.cells.has(c);assert.equal(open.has(c),expected);}}
// One model per enemy kind, baked within budget.
assert.deepEqual(MONSTER_KINDS,ENEMIES.map(e=>e.id));
for(const id of MONSTER_KINDS){const m=createMonsterModel(id),t=bakeRig(m.root,m.parts,(p,time)=>m.animate(p,time),.5),inst=instantiateRig(t,{lit:new THREE.MeshStandardMaterial()});
 for(let k=0;k<6;k++){inst.pose(k*1.3,k*.4);inst.root.updateMatrixWorld(true);}
 assert(finite(t.geometry)&&t.triangles<8000&&t.triangles>500,id);assert(m.height>.9&&m.height<2,id);assert(MONSTER_LOOKS[id],id);inst.dispose();t.dispose();}
// Every hero bakes small enough for a full class: under 9,000 triangles and one draw call per material.
let worst=0;
for(const hero of HERO_3D_STUDIES)for(const [i,clothing] of [{},{top:'dress',feet:'trainers',head:'silver-crown',back:'ruby-cape',neck:'sun-scarf',badge:'star-badge',wrist:'mint-band'},{top:'shirt',bottom:'trousers',outer:'cardigan',tie:'school-tie'}].entries()){
 const look={type:hero.id,clothing,weapon:EQUIPMENT[(hero.id+i)%EQUIPMENT.length].id},{key,template}=acquireHeroTemplate(look);
 assert(finite(template.geometry),hero.name);worst=Math.max(worst,template.triangles);releaseHeroTemplate(key);}
assert(worst<9000,`heaviest hero ${worst} triangles`);
for(const type of [7,8]){const {key,template}=acquireHeroTemplate({type,weapon:'standard'});assert(template.triangles>100);releaseHeroTemplate(key);}
// Backdrops stay off the squares heroes use: nothing solid rises inside the playable area.
const inside=(x,z)=>x>1&&x<23&&z>2&&z<17&&!(x>=20&&z>=14);
for(let chapter=1;chapter<=30;chapter++){
 const theme=boardTheme((chapter-1)*10+1),world=buildWorld(theme),route=buildRoute(theme,layouts[chapter%layouts.length]);let meshes=0;
 for(const built of [world,route])built.group.traverse(o=>{
  if(!o.isMesh&&!o.isPoints)return;meshes++;if(o.isPoints)return;assert(finite(o.geometry),`chapter ${chapter}`);
  if(o.isInstancedMesh){const m=new THREE.Matrix4(),p=new THREE.Vector3();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);if(p.y>.3)assert(!inside(p.x,p.z),`chapter ${chapter}: instance at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);}return;}
  if(o.renderOrder>0||o.material.transparent)return;
  o.updateMatrixWorld(true);const pos=o.geometry.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<pos.count;i+=3){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(v.y>.25)assert(!inside(v.x,v.z),`chapter ${chapter}: scenery at ${v.x.toFixed(1)},${v.y.toFixed(1)},${v.z.toFixed(1)}`);}
 });
 assert(meshes<45,`chapter ${chapter}: ${meshes} meshes`);world.dispose();route.dispose();
}
// A whole class and a full wave run through the headless scene without touching the combat rules.
const scene=new BoardScene(),wave=62,layout=mapLayout(wave,5,1),theme=boardTheme(wave);
scene.setTheme(theme);scene.setRoute(layout);
const cells=[...buildableCells(layout.cells)];
const heroes=Array.from({length:80},(_,i)=>({id:'d'+i,type:HERO_3D_STUDIES[i%HERO_3D_STUDIES.length].id,cell:cells[(i*5)%cells.length],level:1+i%10,weapon:EQUIPMENT[i%EQUIPMENT.length].id,name:'Hero'+i,colour:'#d94660'}));
scene.setHeroes(heroes);scene.setCamp(Array.from({length:40},(_,i)=>({id:'p'+i,slot:i,type:HERO_3D_STUDIES[(i*3)%HERO_3D_STUDIES.length].id,name:'P'+i,online:i%2===0})));
const battle={rulesVersion:5,seed:3,start:0,wave,route:layout.waypoints,duration:B.rules(wave).duration,power:0,target:0,contributors:1,fighters:heroes.slice(0,24).map(h=>({...h,stats:buildStats(h.type,h.level,h.weapon,{})}))};
const before=JSON.stringify(B.simulate(battle));scene.setBattle(battle);
const camera=new THREE.PerspectiveCamera(36,2,.5,260);camera.position.set(12,20,30);camera.lookAt(12,0,9);camera.updateMatrixWorld();
let peak=0,kinds=new Set();
for(let t=0;t<battle.duration/1000;t+=.35){const labels=scene.frame({time:t,battleNow:t*1000,camera,motion:true,labels:true});for(const l of labels){assert(Number.isFinite(l.position.x+l.position.y+l.position.z),l.key);kinds.add(l.kind);}peak=Math.max(peak,scene.stats().monsters);}
assert.equal(JSON.stringify(B.simulate(battle)),before,'rendering must not change the simulation');
assert(peak>3&&peak<=48,`peak monsters ${peak}`);for(const k of ['level','damage','defeat'])assert(kinds.has(k),`label ${k}`);
const pick=scene.pick(new THREE.Ray(new THREE.Vector3(5.5,30,5.5),new THREE.Vector3(0,-1,0)));assert(pick);
scene.setBattle(null);scene.frame({time:99,battleNow:0,camera,motion:false,labels:true});assert.equal(scene.stats().monsters,0);
scene.dispose();
console.log(`PASS: 40 chapter looks over ${kits.size} kits, ${layouts.length} routes, ${MONSTER_KINDS.length} monsters, ${HERO_3D_STUDIES.length*3} hero bakes (max ${worst} triangles), 30 clear backdrops and a headless wave (peak ${peak} monsters).`);
