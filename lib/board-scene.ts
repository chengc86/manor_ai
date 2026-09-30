import * as THREE from 'three';
import {buildWorld,buildRoute,MANOR_POSITION,COLS,ROWS,type Built,type RouteShape} from './board-scenery';
import type {BoardTheme} from './board-theme';
import {acquireHeroTemplate,releaseHeroTemplate,type HeroLook,type HeroPose} from './board-heroes';
import {instantiateRig,bakeRig,type RigInstance,type RigTemplate,type RigMaterials} from './rig-bake';
import {createMonsterModel,createCrown,MONSTER_LOOKS} from './monster-model';
import {BattleEffects,WeatherEffects} from './board-effects';
import {PROJECTILE_FLIGHT} from './weapon-model';
import {visualPosition,visualHeading} from './route-visual';
import {monsterProgress,monsterHealth,battleLayout,simulate,type Battle,type Hit} from './battle';
import {enemyFor,type EnemyKind} from './enemies';
import {HEROES} from './heroes';
import {WEAPON_BASE,buildStats} from './builds';
import {glowTexture,tileTexture} from './board-textures';
/**
 * The 3D battlefield scene. It renders the same deterministic battle as lib/battle.ts: nothing here changes combat.
 * Framework-free, so the React wrapper owns the renderer, camera and DOM labels.
 */
export const HERO_SCALE=.36;
export type BoardHero=HeroLook&{id:string;cell:number;level:number;colour?:string;name:string;mine?:boolean};
export type CampHero=HeroLook&{id:string;slot:number;colour?:string;name:string;online:boolean};
export type BoardLabel={key:string;kind:'level'|'name'|'damage'|'status'|'boss'|'defeat'|'breach';text:string;position:THREE.Vector3;tone?:string};
export type Placement={active:boolean;empty:number[];hover:number|null;range:number|null;ghost:HeroLook|null};
export type Pick={kind:'hero'|'camp';id:string}|{kind:'cell';cell:number}|null;
type Sim=ReturnType<typeof simulate>;
const cellCentre=(cell:number)=>new THREE.Vector3(cell%COLS+.5,0,Math.floor(cell/COLS)+.5);
const campSpot=(slot:number)=>new THREE.Vector3(2+slot%20+.5,0,Math.floor(slot/20)%2+.52);
function characterMaterials(opacity=1):RigMaterials&{list:THREE.Material[]}{
 const ghost=opacity<1?{transparent:true,opacity,depthWrite:false}:{};
 const lit=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,...ghost}),metal=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.34,metalness:.45,...ghost}),glow=new THREE.MeshBasicMaterial({vertexColors:true,...ghost});
 return {lit,metal,glow,list:[lit,metal,glow]};
}
function setEmissive(m:RigMaterials,colour:THREE.Color){for(const mat of [m.lit,m.metal])(mat as THREE.MeshStandardMaterial).emissive.copy(colour);}
const NONE=new THREE.Color(0,0,0),HOVER=new THREE.Color(.28,.24,.08),SWING=new THREE.Color(.08,.07,.02),PORTAL=new THREE.Color(0xc58cff);
type MonsterPose=[phase:number,time:number];
class Actor<A extends unknown[]>{
 inst:RigInstance<A>;materials:ReturnType<typeof characterMaterials>;top:number;yaw=0;targetYaw=0;phase:number;position=new THREE.Vector3();
 constructor(public key:string,public template:RigTemplate<A>,parent:THREE.Object3D,public scale:number,opacity=1){
  this.materials=characterMaterials(opacity);
  this.inst=instantiateRig(template,this.materials);this.inst.root.scale.setScalar(scale);parent.add(this.inst.root);
  this.top=template.geometry.boundingBox!.max.y*scale;this.phase=[...key].reduce((a,c)=>a+c.charCodeAt(0),0)%97/7;
 }
 place(p:THREE.Vector3){this.position.copy(p);this.inst.root.position.copy(p);}
 turn(dt:number){let d=this.targetYaw-this.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));this.yaw+=d*Math.min(1,dt*10);this.inst.root.rotation.y=this.yaw;}
 dispose(){this.inst.dispose();this.materials.list.forEach(m=>m.dispose());}
}
type HeroActor=Actor<HeroPose>&{data:BoardHero|CampHero;look:string};
type MonsterActor=Actor<MonsterPose>&{kind:string};
/** Monster templates are baked once per kind and shared by every wave. */
const monsterTemplates=new Map<string,{template:RigTemplate<MonsterPose>;height:number}>();
function monsterTemplate(id:string){let t=monsterTemplates.get(id);if(!t){const m=createMonsterModel(id);t={template:bakeRig<MonsterPose>(m.root,m.parts,(phase,time)=>m.animate(phase,time),.5),height:m.height};monsterTemplates.set(id,t);}return t;}
type Prepared={battle:Battle;sim:Sim;path:{x:number;y:number}[];kinds:EnemyKind[];maxHp:number[];damageAt:{at:number;total:number}[][];hits:Hit[][];events:Hit[];primary:Set<Hit>;boss:number;fighters:{centre:THREE.Vector3;weapon:string;melee:boolean;splash:number;colour:THREE.Color}[]};
const colourOf=(e:Hit,fallback:THREE.Color)=>e.freeze?new THREE.Color(0x9eeeff):e.slow?new THREE.Color(0xa9ed6f):e.mark?new THREE.Color(0xff91c5):e.dot?new THREE.Color(0xef82df):fallback;
export class BoardScene{
 scene=new THREE.Scene();hemi=new THREE.HemisphereLight();sun=new THREE.DirectionalLight();
 /** Set when static shadows must be re-rendered (the renderer keeps them otherwise). */
 shadowsDirty=true;
 private world:Built|null=null;private routeBuilt:Built|null=null;private theme:BoardTheme|null=null;private routeKey='';private route:RouteShape|null=null;
 private weather:WeatherEffects|null=null;private effects:BattleEffects;
 private actors=new Map<string,HeroActor>();private camp=new Map<string,HeroActor>();private ghost:HeroActor|null=null;
 private monsters=new Map<number,MonsterActor>();private spare=new Map<string,MonsterActor[]>();
 private characters=new THREE.Group();private overlay=new THREE.Group();
 private shadows:THREE.InstancedMesh;private rings:THREE.InstancedMesh;private tiles:THREE.InstancedMesh;private hoverTile:THREE.Mesh;private rangeRing:THREE.Mesh;private rangeFill:THREE.Mesh;
 private prepared:Prepared|null=null;private placement:Placement={active:false,empty:[],hover:null,range:null,ghost:null};
 private hovered:string|null=null;private lastTime=0;private manorFlash=0;
 private glow=glowTexture();private tileMap=tileTexture();
 constructor(){
  this.scene.add(this.hemi,this.sun,this.sun.target,this.characters,this.overlay);
  this.sun.castShadow=true;const cam=this.sun.shadow.camera;Object.assign(cam,{left:-30,right:30,top:30,bottom:-30,near:1,far:120});this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.bias=-.0006;this.sun.shadow.normalBias=.03;
  this.sun.target.position.set(COLS/2,0,ROWS/2);
  const disc=new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2);
  this.shadows=new THREE.InstancedMesh(disc,new THREE.MeshBasicMaterial({color:0x10200f,map:this.glow,transparent:true,opacity:.42,depthWrite:false}),260);this.shadows.renderOrder=1;this.shadows.frustumCulled=false;
  this.rings=new THREE.InstancedMesh(new THREE.RingGeometry(.3,.4,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({transparent:true,opacity:.9,depthWrite:false}),160);this.rings.renderOrder=2;this.rings.frustumCulled=false;this.rings.setColorAt(0,new THREE.Color());
  const tile=new THREE.PlaneGeometry(.9,.9).rotateX(-Math.PI/2);
  this.tiles=new THREE.InstancedMesh(tile,new THREE.MeshBasicMaterial({color:0xfff6c4,map:this.tileMap,transparent:true,opacity:.7,depthWrite:false}),COLS*ROWS);this.tiles.count=0;this.tiles.renderOrder=2;this.tiles.frustumCulled=false;
  this.hoverTile=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe46b,transparent:true,opacity:.55,depthWrite:false}));this.hoverTile.renderOrder=3;this.hoverTile.visible=false;
  this.rangeRing=new THREE.Mesh(new THREE.RingGeometry(.975,1,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.9,depthWrite:false}));
  this.rangeFill=new THREE.Mesh(new THREE.CircleGeometry(1,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffef80,transparent:true,opacity:.16,depthWrite:false}));
  this.rangeRing.renderOrder=this.rangeFill.renderOrder=3;this.rangeRing.visible=this.rangeFill.visible=false;
  this.overlay.add(this.shadows,this.rings,this.tiles,this.hoverTile,this.rangeRing,this.rangeFill);
  this.effects=new BattleEffects(this.scene,createCrown);
 }
 setTheme(theme:BoardTheme){
  if(this.theme&&this.theme.index===theme.index&&this.theme.chapter===theme.chapter)return;
  this.theme=theme;this.world?.group.removeFromParent();this.world?.dispose();this.world=buildWorld(theme);this.scene.add(this.world.group);
  const l=theme.lighting;this.hemi.color.set(l.hemiSky);this.hemi.groundColor.set(l.hemiGround);this.hemi.intensity=l.hemiIntensity;
  this.sun.color.set(l.sun);this.sun.intensity=l.sunIntensity;
  const d=new THREE.Vector3(Math.sin(l.sunAzimuth)*Math.cos(l.sunElevation),Math.sin(l.sunElevation),Math.cos(l.sunAzimuth)*Math.cos(l.sunElevation));
  this.sun.position.copy(this.sun.target.position).addScaledVector(d,60);
  this.scene.fog=new THREE.Fog(l.fog,46,125);this.scene.background=new THREE.Color(l.fog);
  this.weather?.dispose();this.weather=new WeatherEffects(this.scene,theme.weather,l);
  if(this.route){const r=this.route;this.routeKey='';this.setRoute(r);}
  this.shadowsDirty=true;
 }
 setRoute(route:RouteShape){
  const key=JSON.stringify(route.waypoints);if(key===this.routeKey||!this.theme){this.route=route;return;}
  this.route=route;this.routeKey=key;this.routeBuilt?.group.removeFromParent();this.routeBuilt?.dispose();this.routeBuilt=buildRoute(this.theme,route);this.scene.add(this.routeBuilt.group);
  for(const a of this.actors.values())a.targetYaw=a.yaw=this.faceRoute(a.position);
  this.shadowsDirty=true;
 }
 get entry(){return (this.routeBuilt?.group.userData.entry as THREE.Vector3|undefined)??new THREE.Vector3(-1,2,3);}
 get manor(){return new THREE.Vector3(MANOR_POSITION.x,3.6,MANOR_POSITION.z);}
 private faceRoute(p:THREE.Vector3){
  let best=Infinity,yaw=0;for(const q of this.route?.path??[]){const d=Math.hypot(q.x-p.x,q.y-p.z);if(d<best){best=d;yaw=Math.atan2(q.x-p.x,q.y-p.z);}}
  return best<Infinity?yaw:0;
 }
 private syncActors<T extends BoardHero|CampHero>(map:Map<string,HeroActor>,items:T[],spot:(item:T)=>THREE.Vector3,camp:boolean){
  const seen=new Set<string>();
  for(const item of items){
   const look=JSON.stringify([item.type,item.clothing??null,item.uniform??null,item.gender??null,camp?'none':item.weapon??'none',camp?item.ride??null:null]);seen.add(item.id);
   let actor=map.get(item.id);
   if(actor&&actor.look!==look){this.release(actor);map.delete(item.id);actor=undefined;}
   if(!actor){const {key,template}=acquireHeroTemplate({...item,weapon:camp?'none':item.weapon,ride:camp?item.ride:undefined});actor=Object.assign(new Actor(key,template,this.characters,HERO_SCALE),{data:item,look});map.set(item.id,actor);actor.place(spot(item));actor.yaw=actor.targetYaw=camp?(actor.phase%1-.5)*.6:this.faceRoute(actor.position);}
   else{const p=spot(item);if(!p.equals(actor.position)){actor.place(p);actor.targetYaw=camp?actor.targetYaw:this.faceRoute(p);}}
   actor.data=item;
  }
  for(const [id,actor] of map)if(!seen.has(id)){this.release(actor);map.delete(id);}
 }
 private release<A extends unknown[]>(actor:Actor<A>){actor.inst.root.removeFromParent();actor.dispose();releaseHeroTemplate(actor.key);}
 setHeroes(list:BoardHero[]){this.syncActors(this.actors,list.filter(h=>h.cell>=0),h=>cellCentre(h.cell),false);}
 setCamp(list:CampHero[]){this.syncActors(this.camp,list,h=>campSpot(h.slot),true);}
 setHovered(id:string|null){this.hovered=id;}
 setPlacement(p:Placement){
  this.placement=p;const m=new THREE.Matrix4();
  this.tiles.count=p.active?p.empty.length:0;p.empty.forEach((c,i)=>{if(i<this.tiles.count)this.tiles.setMatrixAt(i,m.makeTranslation(c%COLS+.5,.03,Math.floor(c/COLS)+.5));});this.tiles.instanceMatrix.needsUpdate=true;
  const ghostKey=p.ghost&&p.hover!==null&&p.empty.includes(p.hover)?JSON.stringify(p.ghost):null;
  if(this.ghost&&(!ghostKey||this.ghost.look!==ghostKey)){this.release(this.ghost);this.ghost=null;}
  if(ghostKey&&!this.ghost){const {key,template}=acquireHeroTemplate(p.ghost!);this.ghost=Object.assign(new Actor(key,template,this.characters,HERO_SCALE,.55),{data:{id:'ghost',slot:0,name:'',online:true,type:p.ghost!.type},look:ghostKey});}
  if(this.ghost&&p.hover!==null){const c=cellCentre(p.hover);this.ghost.place(c);this.ghost.yaw=this.ghost.targetYaw=this.faceRoute(c);}
 }
 /** Prepares per-battle lookups once, so each frame only reads them. Pass the simulation if it is already computed. */
 setBattle(battle:Battle|null,sim?:Sim){
  if(!battle){if(this.prepared){for(const [,m] of this.monsters)this.stash(m);this.monsters.clear();}this.prepared=null;return;}
  if(this.prepared?.battle.start===battle.start&&this.prepared.battle.wave===battle.wave)return;
  for(const [,m] of this.monsters)this.stash(m);this.monsters.clear();
  const s=sim??simulate(battle),path=battleLayout(battle).path,version=battle.rulesVersion??1;
  const events=[...s.events].sort((a,b)=>a.at-b.at),hits:Hit[][]=Array.from({length:s.count},()=>[]);for(const e of events)hits[e.monster]?.push(e);
  // The first target of each shot carries the splash ring; the others only sparkle.
  const primary=new Set<Hit>(),shots=new Set<string>();for(const e of events){const k=e.fighter+'@'+e.at;if(!e.dot&&!shots.has(k)){shots.add(k);primary.add(e);}}
  const damageAt=hits.map(list=>{let total=0;return list.map(e=>({at:e.at+.25,total:total+=e.damage})).sort((a,b)=>a.at-b.at);});
  const fighters=battle.fighters.map(f=>{const weapon=f.weapon??(f.level?'standard':'none');let splash=0;try{splash=(f.stats??buildStats(f.type,f.level,weapon,f)).splash??0;}catch{splash=0;}
   return {centre:cellCentre(f.cell),weapon,melee:WEAPON_BASE[weapon]?.category==='str',splash,colour:new THREE.Color(HEROES[f.type]?.colour??'#ffe396')};});
  this.prepared={battle,sim:s,path,events,hits,damageAt,fighters,primary,boss:s.rule.boss?s.count-1:-1,
   kinds:Array.from({length:s.count},(_,i)=>enemyFor(battle.wave,i,version)),maxHp:Array.from({length:s.count},(_,i)=>monsterHealth(battle.wave,i,version))};
 }
 private stash(m:MonsterActor){m.inst.root.visible=false;const list=this.spare.get(m.kind)??[];list.push(m);this.spare.set(m.kind,list);}
 private monster(i:number,kind:string){
  let m=this.monsters.get(i);if(m)return m;
  m=this.spare.get(kind)?.pop();
  if(!m){const {template}=monsterTemplate(kind);m=Object.assign(new Actor<MonsterPose>(kind,template,this.characters,MONSTER_LOOKS[kind]?.scale??.69),{kind});}
  m.inst.root.visible=true;this.monsters.set(i,m);return m;
 }
 /** Picks what a pointer ray is over: a hero (by its body) before the square beneath. */
 pick(ray:THREE.Ray):Pick{
  let best=Infinity,hit:Pick=null;const box=new THREE.Box3(),point=new THREE.Vector3();
  for(const [map,kind] of [[this.actors,'hero'],[this.camp,'camp']] as const)for(const [id,a] of map){
   if(!a.inst.root.visible)continue;box.min.set(a.position.x-.34,0,a.position.z-.34);box.max.set(a.position.x+.34,a.top+.05,a.position.z+.34);
   if(ray.intersectBox(box,point)){const d=point.distanceTo(ray.origin);if(d<best){best=d;hit={kind,id};}}
  }
  if(hit)return hit;
  if(ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),point)&&point.x>=0&&point.x<COLS&&point.z>=0&&point.z<ROWS)return {kind:'cell',cell:Math.floor(point.z)*COLS+Math.floor(point.x)};
  return null;
 }
 heroTop(id:string){const a=this.actors.get(id)??this.camp.get(id);return a?a.position.clone().setY(a.top+.1):null;}
 /** Advances every animation. `battleNow` is the smoothed shared clock in milliseconds. Returns the text labels to overlay. */
 frame(o:{time:number;battleNow:number;camera:THREE.Camera;motion:boolean;labels:boolean}):BoardLabel[]{
  const dt=Math.min(.1,Math.max(0,o.time-this.lastTime));this.lastTime=o.time;
  const labels:BoardLabel[]=[],fx=this.effects,shadowM=new THREE.Matrix4(),q=new THREE.Quaternion();let shadowCount=0,ringCount=0;
  const shadow=(p:THREE.Vector3,r:number)=>{if(shadowCount<this.shadows.instanceMatrix.count)this.shadows.setMatrixAt(shadowCount++,shadowM.compose(new THREE.Vector3(p.x,.025,p.z),q,new THREE.Vector3(r,1,r)));};
  this.world?.update(o.time,o.motion);this.routeBuilt?.update(o.time,o.motion);this.weather?.update(o.time,o.motion);
  const p=this.prepared,elapsed=p?Math.max(0,(o.battleNow-p.battle.start)/1000):0;
  // Which fighter is swinging, and at what.
  const attacking=new Map<number,Hit>();
  const active:Hit[]=[];
  if(p){let a=0,b=p.events.length;while(a<b){const mid=(a+b)>>1;if(p.events[mid].at<=elapsed-.9)a=mid+1;else b=mid;}for(let k=a;k<p.events.length&&p.events[k].at<=elapsed;k++)active.push(p.events[k]);}
  for(const e of active)if(!e.dot&&elapsed-e.at<.48)attacking.set(e.fighter,e);
  // Heroes: deployed ones follow the battle's fighters by id when a wave is running.
  const fighterIndex=new Map(p?.battle.fighters.map((f,i)=>[f.id,i])??[]);
  for(const [id,a] of this.actors){
   const hero=a.data as BoardHero,fi=fighterIndex.get(id),swing=fi!==undefined?attacking.get(fi):undefined;
   if(swing)a.targetYaw=Math.atan2(swing.point.x-a.position.x,swing.point.y-a.position.z);
   a.turn(dt);a.inst.pose(o.time+a.phase,swing?'attack':'idle',o.motion);
   const hover=this.hovered===id;setEmissive(a.materials,hover?HOVER:swing?SWING:NONE);
   shadow(a.position,.36);
   if(ringCount<this.rings.instanceMatrix.count){this.rings.setMatrixAt(ringCount,shadowM.compose(new THREE.Vector3(a.position.x,.035,a.position.z),q,new THREE.Vector3(1,1,1)));this.rings.setColorAt(ringCount++,new THREE.Color(hero.colour??'#ffe396'));}
   if(o.labels){labels.push({key:'lv'+id,kind:'level',text:String(hero.level),position:a.position.clone().setY(a.top+.08),tone:[hero.level>=10?'legend':hero.level>=6?'master':'',hero.mine?'mine':''].filter(Boolean).join(' ')});
    if(hover)labels.push({key:'nm'+id,kind:'name',text:hero.name,position:a.position.clone().setY(a.top+.42)});}
  }
  for(const [id,a] of this.camp){const c=a.data as CampHero;a.turn(dt);a.inst.pose(o.time+a.phase,'idle',o.motion);setEmissive(a.materials,this.hovered===id?HOVER:NONE);shadow(a.position,.34);
   if(o.labels&&this.hovered===id)labels.push({key:'cn'+id,kind:'name',text:`${c.name} · ${c.online?'online':'offline'}`,position:a.position.clone().setY(a.top+.3)});}
  // Placement helpers.
  const pl=this.placement,hoverEmpty=pl.hover!==null&&pl.empty.includes(pl.hover);
  this.hoverTile.visible=!p&&hoverEmpty;if(this.hoverTile.visible){const c=cellCentre(pl.hover!);this.hoverTile.position.set(c.x,.04,c.z);(this.hoverTile.material as THREE.MeshBasicMaterial).opacity=.45+.15*Math.sin(o.time*5);}
  (this.tiles.material as THREE.MeshBasicMaterial).opacity=.6+.18*Math.sin(o.time*3);
  const hoveredHero=this.hovered?this.actors.get(this.hovered):undefined,rangeAt=!p&&pl.range?(hoveredHero?.position??(hoverEmpty?cellCentre(pl.hover!):null)):null;
  this.rangeRing.visible=this.rangeFill.visible=!!rangeAt;if(rangeAt){for(const m of [this.rangeRing,this.rangeFill]){m.position.set(rangeAt.x,.045,rangeAt.z);m.scale.setScalar(pl.range!);}}
  if(this.ghost){this.ghost.inst.root.visible=!p&&hoverEmpty;this.ghost.inst.pose(o.time,'idle',o.motion);}
  // Battle: monsters, projectiles and effects, all read from the shared simulation.
  if(p){
   const {sim,path}=p,cellsLong=path.length-1;
   const hitNow=new Map<number,Hit>();for(const e of active)if(elapsed-e.at>=.25&&elapsed-e.at<.75&&!hitNow.has(e.monster))hitNow.set(e.monster,e);
   for(let i=0;i<sim.count;i++){
    const kind=p.kinds[i],progress=monsterProgress(sim.tracks[i],elapsed),death=sim.deathAt[i]===null?null:sim.deathAt[i]!+.25;
    // Just before it spawns, a monster walks out of the portal onto the first square. Combat only starts at 0.
    const out=progress*cellsLong,emerging=progress<0&&out>-1.9;
    const gone=(progress<0&&!emerging)||(progress>=1&&death===null)||(death!==null&&elapsed>death+.6);
    if(gone){const m=this.monsters.get(i);if(m){this.monsters.delete(i);this.stash(m);}continue;}
    if(emerging)for(let k=0;k<2;k++)fx.sparks.add(this.entry.x+.25,.7+k*.35+Math.sin(o.time*7+i)*.1,this.entry.z+Math.sin(o.time*9+k+i)*.35,.28,PORTAL,.8);
    const m=this.monster(i,kind.id),boss=i===p.boss,look=MONSTER_LOOKS[kind.id]??{scale:.69,stride:.8},size=look.scale*(boss?1.6:1);
    const at=emerging?{x:path[0].x+out,y:path[0].y}:visualPosition(Math.min(progress,.9999),path),pos=new THREE.Vector3(at.x,0,at.y);
    m.place(pos);m.targetYaw=emerging?Math.PI/2:visualHeading(Math.min(progress,.9999),path);m.turn(dt);
    const damage=p.damageAt[i];let taken=0;for(let k=damage.length-1;k>=0;k--)if(damage[k].at<=elapsed){taken=damage[k].total;break;}
    const hp=Math.max(0,p.maxHp[i]-taken),list=p.hits[i];
    const frozen=list.some(e=>e.freeze&&elapsed>=e.at&&elapsed<e.at+e.freeze),marked=list.some(e=>e.mark&&elapsed>=e.at&&elapsed<e.at+(e.markDuration??3)),slowed=list.some(e=>e.slow&&elapsed>=e.at&&elapsed<e.at+(e.slowDuration??2)),painted=list.some(e=>e.dot&&elapsed>=e.at&&elapsed<e.at+1.1);
    m.inst.pose(progress*cellsLong/look.stride*Math.PI*2,frozen?0:o.time+i*.37);
    const hit=hitNow.get(i),flash=hit?Math.max(0,1-(elapsed-hit.at-.25)/.18):0;
    const glow=new THREE.Color(0,0,0);if(frozen)glow.setRGB(.08,.26,.4);else if(slowed)glow.setRGB(.05,.14,0);if(painted)glow.add(new THREE.Color(.22,.02,.18).multiplyScalar(.6+.4*Math.sin(o.time*8)));if(flash)glow.add(new THREE.Color(.7,.7,.7).multiplyScalar(flash));setEmissive(m.materials,glow);
    let scale=size;if(death!==null&&elapsed>=death){const t=Math.min(1,(elapsed-death)/.6);scale=size*(1-t)*(1+.3*Math.sin(t*Math.PI));m.inst.root.rotation.y+=t*6;
     if(t<.6)for(let k=0;k<6;k++){const a=k/6*Math.PI*2+i,r=.2+t*1.4;fx.sparks.add(pos.x+Math.cos(a)*r,.4+t*.8,pos.z+Math.sin(a)*r,.22,new THREE.Color(k%2?0xfff3a4:0xffffff),1-t);}}
    else if(flash)scale=size*(1-.08*flash);
    else if(emerging)scale=size*(.35+.65*(1+out/1.9));
    m.inst.root.scale.setScalar(scale);
    const top=monsterTemplate(kind.id).height*scale,head=pos.clone().setY(top+.12);
    shadow(pos,.42*size/.6);
    if(frozen)fx.frozen(pos,top*.95);if(slowed)fx.slowed(pos,size/.6);if(marked)fx.marked(head.clone().setY(top+.3),o.time);
    if(boss&&hp>0)fx.crown(new THREE.Vector3(pos.x,top-.02,pos.z),m.yaw,1.25);
    if(hp>0)fx.bars.add(o.camera,head.clone().setY(top+(boss?.34:.2)),boss?.8:.5,hp/p.maxHp[i],new THREE.Color(boss?0xffd374:0xeb95f3));
    if(o.labels){
     if(boss&&hp>0)labels.push({key:'bs'+i,kind:'boss',text:'BOSS',position:head.clone().setY(top+.55)});
     if(hp>0&&(frozen||marked||slowed))labels.push({key:'st'+i,kind:'status',text:frozen?'FROZEN':marked?'MARKED':'SLOWED',position:head.clone().setY(top+(boss?.8:.45)),tone:frozen?'frozen':marked?'marked':'slowed'});
     if(hit&&hp>0)labels.push({key:`dm${i}-${hit.at}-${hit.fighter}`,kind:'damage',text:`${hit.critical?'CRIT ':hit.dot?'PAINT ':''}−${hit.damage}`,position:head.clone(),tone:hit.critical?'crit':hit.dot?'paint':''});
     if(death!==null&&elapsed>=death&&elapsed<death+1.1)labels.push({key:'df'+i,kind:'defeat',text:'Defeated!',position:pos.clone().setY(.9)});
    }
   }
   // Projectiles fly for a quarter of a second, then burst where the hit lands.
   for(const e of active){
    const f=p.fighters[e.fighter];if(!f)continue;const dtE=elapsed-e.at,to=new THREE.Vector3(e.point.x,.32,e.point.y),c=colourOf(e,f.colour);
    if(e.dot){if(dtE<.4)for(let k=0;k<3;k++)fx.sparks.add(to.x+Math.sin(k*2.1+dtE*9)*.18,.3+dtE*1.4+k*.08,to.z+Math.cos(k*2.1)*.18,.16,c,1-dtE/.4);continue;}
    const actor=this.actors.get(p.battle.fighters[e.fighter].id),from=(actor?.position??f.centre).clone().setY(.52);
    if(f.melee){if(dtE<.35){const yaw=Math.atan2(to.x-from.x,to.z-from.z);fx.slash(from.clone().setY(.45).addScaledVector(new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),.35),yaw+(dtE/.35-.5)*1.2,1+dtE*1.2,c,.85*(1-dtE/.35));}}
    else if(dtE<.25){
     const t=dtE/.25,flight=PROJECTILE_FLIGHT[f.weapon]??PROJECTILE_FLIGHT.standard,dist=from.distanceTo(to),arc=flight.arc*dist;
     const at=from.clone().lerp(to,t);at.y+=arc*4*t*(1-t);const next=from.clone().lerp(to,Math.min(1,t+.05));next.y+=arc*4*(t+.05)*(1-t-.05);
     const dir=next.sub(at);if(dir.lengthSq()<1e-6)dir.set(0,0,1);fx.projectile(f.weapon,at,dir.normalize(),flight.spin*Math.PI*2*t,1.45);
     // A short sparkling trail so each shot can be followed from hero to monster.
     const trail=new THREE.Color(flight.trail);for(let k=1;k<=4;k++){const u=Math.max(0,t-k*.07),q=from.clone().lerp(to,u);q.y+=arc*4*u*(1-u);fx.sparks.add(q.x,q.y,q.z,.26-k*.04,trail,.55-k*.11);}
    }
    if(dtE>=.25&&dtE<.75){const t=(dtE-.25)/.5,big=e.critical?1.6:1,radius=(f.splash&&p.primary.has(e)?Math.max(.5,f.splash*.5):.35)*big;
     fx.ring(new THREE.Vector3(to.x,.05,to.z),.15+radius*t,c,.8*(1-t));
     for(let k=0;k<5;k++){const a=k*Math.PI*2/5+e.at,r=.12+t*.7*big;fx.sparks.add(to.x+Math.cos(a)*r,.3+t*.35,to.z+Math.sin(a)*r,e.critical?.2:.14,e.critical?new THREE.Color(0xffe27a):c,1-t);}}
   }
   // Escapes damage The Manor.
   this.manorFlash=0;
   if(sim.breaches)for(const b of sim.breaches)if(elapsed>=b.at&&elapsed<b.at+1.4){this.manorFlash=Math.max(this.manorFlash,1-(elapsed-b.at)/1.4);if(o.labels)labels.push({key:'br'+b.monster,kind:'breach',text:`−${b.damage} HP`,position:this.manor.clone().setY(3.1)});}
  }else this.manorFlash=0;
  const manorMesh=this.world?.group.userData.manor as THREE.Mesh|undefined;if(manorMesh)(manorMesh.material as THREE.MeshLambertMaterial).emissive.setRGB(.55*this.manorFlash,.05*this.manorFlash,.05*this.manorFlash);
  this.shadows.count=shadowCount;this.shadows.instanceMatrix.needsUpdate=true;this.rings.count=ringCount;this.rings.instanceMatrix.needsUpdate=true;if(this.rings.instanceColor)this.rings.instanceColor.needsUpdate=true;
  fx.finish();
  return labels;
 }
 stats(){let heroes=0;for(const a of this.actors.values())heroes+=a.template.triangles;for(const a of this.camp.values())heroes+=a.template.triangles;return {heroes:this.actors.size,camp:this.camp.size,monsters:this.monsters.size,heroTriangles:heroes};}
 dispose(){
  for(const a of [...this.actors.values(),...this.camp.values()])this.release(a);this.actors.clear();this.camp.clear();if(this.ghost)this.release(this.ghost);
  for(const m of this.monsters.values())m.dispose();for(const list of this.spare.values())list.forEach(m=>m.dispose());
  this.world?.dispose();this.routeBuilt?.dispose();this.weather?.dispose();this.effects.dispose();
  for(const m of [this.shadows,this.rings,this.tiles,this.hoverTile,this.rangeRing,this.rangeFill]){m.geometry.dispose();(m.material as THREE.Material).dispose();}
  this.glow.dispose();this.tileMap.dispose();this.sun.shadow.dispose();
 }
}
