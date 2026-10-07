'use client';
import {useEffect,useImperativeHandle,useMemo,useRef,type Ref} from 'react';
import * as THREE from 'three';
import {MapControls} from 'three/addons/controls/MapControls.js';
import {Shield,Swords,Users} from 'lucide-react';
import {BoardScene,type BoardHero,type CampHero,type BoardLabel} from '@/lib/board-scene';
import {buildableCells,COLS,ROWS,type RouteShape} from '@/lib/board-scenery';
import {boardTheme} from '@/lib/board-theme';
import {HEROES} from '@/lib/heroes';
import type {Wardrobe} from '@/lib/clothing';
import type {Ride} from '@/lib/vehicles';
import {SCHOOL_MAX_HP,type Battle,type simulate} from '@/lib/battle';
/** Camera commands for the board toolbar. */
export type BoardCamera={zoom(factor:number):void;rotate(angle:number):void;reset():void};
type Look={adminAbuseTrophy?:boolean;type:number;clothing?:Wardrobe;uniform?:string;gender?:string};
type Defender=Look&{id:string;cell:number;level:number;weapon?:string;colour?:string;name?:string;owner?:string;ride?:Ride};
type Player={id:string;hero:number;clothing?:Wardrobe;uniform?:string;gender?:string;colour?:string;name:string;online?:boolean;ride?:Ride};
export type BoardWorld={adminEvent?:{active:boolean};wave:number;defenders:Defender[];players:Player[];me?:{id:string;clothing?:Wardrobe;uniform?:string;gender?:string}|null};
type Props={world:BoardWorld;battle:Battle|null;sim:ReturnType<typeof simulate>|null;now:number;placement:{type:number;level?:number;weapon?:string;ride?:Ride}|null;range:number|null;hover:number|null;setHover:(cell:number|null)=>void;
 onPlace:(cell:number)=>void;onHero:(hero:Defender|(Player&{camp:true}))=>void;onFail:()=>void;motion:boolean;layout:RouteShape;schoolHp:number|null;ref?:Ref<BoardCamera>};
type Engine={scene:BoardScene;pickAt(x:number,y:number):ReturnType<BoardScene['pick']>;camera:BoardCamera};
const TARGET=new THREE.Vector3(COLS/2,0,ROWS/2+.2),POLAR=.74;
const CORNERS=[[0,0,-.4],[COLS,0,-.4],[0,0,ROWS+.4],[COLS,0,ROWS+.4],[0,1.1,0],[COLS,1.1,0],[COLS-2,2.6,ROWS-3]].map(p=>new THREE.Vector3(...p));
/** Distance at which the whole board fits the view from the default angle. */
function fitDistance(view:THREE.PerspectiveCamera,azimuth=0){
 const camera=view.clone(),dir=new THREE.Vector3().setFromSphericalCoords(1,POLAR,azimuth),v=new THREE.Vector3();let lo=6,hi=90;
 for(let i=0;i<24;i++){const d=(lo+hi)/2;camera.position.copy(TARGET).addScaledVector(dir,d);camera.lookAt(TARGET);camera.updateMatrixWorld();
  const fits=CORNERS.every(c=>{v.copy(c).project(camera);return Math.abs(v.x)<.95&&v.y<.93&&v.y>-.95&&v.z<1;});if(fits)hi=d;else lo=d;}
 return hi;
}
/** Screen-space labels that follow points in the scene, reusing one element per key. */
class LabelLayer{
 private els=new Map<string,HTMLElement>();private v=new THREE.Vector3();
 constructor(private host:HTMLElement){}
 /** Moves a label to a scene point; with `keepInside`, a centred label is nudged so it stays within the frame. */
 place(el:HTMLElement,position:THREE.Vector3,camera:THREE.Camera,w:number,h:number,keepInside=false){
  this.v.copy(position).project(camera);
  if(this.v.z>1||Math.abs(this.v.x)>1.2||Math.abs(this.v.y)>1.2){el.style.visibility='hidden';return;}
  let x=(this.v.x*.5+.5)*w,y=(-this.v.y*.5+.5)*h;
  if(keepInside){const box=el.firstElementChild as HTMLElement|null,bw=box?.offsetWidth??0,bh=box?.offsetHeight??0;x=Math.min(Math.max(x,bw/2+6),w-bw/2-6);y=Math.min(Math.max(y,bh+6),h-6);}
  el.style.visibility='';el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
 }
 update(labels:BoardLabel[],camera:THREE.Camera,w:number,h:number){
  const seen=new Set<string>();
  for(const l of labels){
   seen.add(l.key);let el=this.els.get(l.key);
   if(!el){el=document.createElement('div');el.className=`b3-label b3-${l.kind}${l.tone?l.tone.split(' ').map(t=>` b3-${t}`).join(''):''}`;el.setAttribute('aria-hidden','true');const span=document.createElement('span');span.textContent=l.text;el.appendChild(span);this.host.appendChild(el);this.els.set(l.key,el);}
   else if(el.firstChild!.textContent!==l.text)el.firstChild!.textContent=l.text;
   this.place(el,l.position,camera,w,h);
  }
  for(const [k,el] of this.els)if(!seen.has(k)){el.remove();this.els.delete(k);}
 }
 clear(){for(const el of this.els.values())el.remove();this.els.clear();}
}
/**
 * The 3D class battlefield. It draws the same world, route and shared battle snapshot as the flat map; every
 * square and hero stays reachable from the keyboard through the hidden button layer.
 */
export default function Board3D({world,battle,sim,now,placement,range,hover,setHover,onPlace,onHero,onFail,motion,layout,schoolHp,ref}:Props){
 const host=useRef<HTMLDivElement>(null),labelsRef=useRef<HTMLDivElement>(null),entryRef=useRef<HTMLDivElement>(null),manorRef=useRef<HTMLDivElement>(null),campRef=useRef<HTMLDivElement>(null);
 const engine=useRef<Engine|null>(null),clock=useRef({target:now,at:0,time:now,last:0}),live=useRef({motion,hoverId:null as string|null}),failRef=useRef(onFail);
 useEffect(()=>{live.current.motion=motion;failRef.current=onFail;},[motion,onFail]);
 useEffect(()=>{clock.current.target=now;clock.current.at=performance.now();},[now]);
 useImperativeHandle(ref,()=>({zoom:f=>engine.current?.camera.zoom(f),rotate:a=>engine.current?.camera.rotate(a),reset:()=>engine.current?.camera.reset()}),[]);
 const wave=battle?.wave??world.wave,goldEvent=!!world.adminEvent?.active,theme=useMemo(()=>boardTheme(wave,goldEvent),[wave,goldEvent]);
 const deployed:Defender[]=useMemo(()=>battle?battle.fighters:world.defenders.filter(d=>d.cell>=0),[battle,world.defenders]);
 const rideByHero=useMemo(()=>new Map(world.defenders.filter(d=>d.ride).map(d=>[d.id,d.ride!])),[world.defenders]);
 const heroes:BoardHero[]=useMemo(()=>deployed.map(d=>({id:d.id,adminAbuseTrophy:d.adminAbuseTrophy,type:d.type,cell:d.cell,level:d.level,weapon:d.weapon??(d.level?'standard':'none'),colour:d.colour??HEROES[d.type]?.colour,name:d.name??'',clothing:d.clothing,uniform:d.uniform,gender:d.gender,mine:d.owner===world.me?.id,ride:d.ride??rideByHero.get(d.id)})),[deployed,world.me?.id,rideByHero]);
 const heroKey=JSON.stringify(heroes);
 const camp:CampHero[]=useMemo(()=>world.players.map((p,i)=>({id:p.id,slot:i,type:p.hero,clothing:p.clothing,uniform:p.uniform,gender:p.gender,colour:p.colour,name:p.name,online:!!p.online,ride:p.ride})),[world.players]);
 const campKey=JSON.stringify(camp);
 const occupied=useMemo(()=>new Map((battle?world.defenders:deployed).filter(d=>d.cell>=0).map(d=>[d.cell,d])),[battle,deployed,world.defenders]);
 const buildable=useMemo(()=>buildableCells(layout.cells),[layout]);
 const empty=useMemo(()=>[...buildable].filter(c=>!occupied.has(c)),[buildable,occupied]);
 const me=world.me,ghost=placement&&me?{type:placement.type,clothing:me.clothing,uniform:me.uniform,gender:me.gender,weapon:placement.weapon??(placement.level?'standard':'none'),ride:placement.ride}:null;
 const placementKey=JSON.stringify([!!placement,empty,hover,range,ghost]);
 useEffect(()=>{
  const container=host.current,labelHost=labelsRef.current;if(!container||!labelHost)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{failRef.current();return;}
  const maxRatio=Math.min(window.devicePixelRatio||1,1.75);let ratio=maxRatio;renderer.setPixelRatio(ratio);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  const canvas=renderer.domElement;canvas.className='board-3d-canvas';canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','3D class battlefield. Drag to move around, scroll or pinch to zoom, right-drag or two fingers to turn.');
  container.insertBefore(canvas,container.firstChild);
  const lost=(e:Event)=>{e.preventDefault();failRef.current();};canvas.addEventListener('webglcontextlost',lost);
  const scene=new BoardScene(),camera=new THREE.PerspectiveCamera(36,1,.5,260);
  const controls=new MapControls(camera,canvas);
  Object.assign(controls,{enableDamping:true,dampingFactor:.12,screenSpacePanning:false,minPolarAngle:.12,maxPolarAngle:1.12,minAzimuthAngle:-.8,maxAzimuthAngle:.8,minDistance:6,maxDistance:70,zoomToCursor:true,rotateSpeed:.6});
  controls.target.copy(TARGET);
  const home=()=>TARGET.clone().addScaledVector(new THREE.Vector3().setFromSphericalCoords(1,POLAR,0),fitDistance(camera));
  camera.position.copy(home());controls.update();
  let moved=false;controls.addEventListener('start',()=>{moved=true;});
  let tween:{from:THREE.Vector3;to:THREE.Vector3;fromT:THREE.Vector3;toT:THREE.Vector3;start:number}|null=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const move=(pos:THREE.Vector3,target:THREE.Vector3)=>{if(reduced.matches){camera.position.copy(pos);controls.target.copy(target);controls.update();return;}tween={from:camera.position.clone(),to:pos,fromT:controls.target.clone(),toT:target,start:performance.now()};};
  const cameraCommands:BoardCamera={
   zoom(f){const off=camera.position.clone().sub(controls.target),d=THREE.MathUtils.clamp(off.length()*f,controls.minDistance,controls.maxDistance);move(controls.target.clone().addScaledVector(off.normalize(),d),controls.target.clone());},
   rotate(a){const off=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(off);s.theta=THREE.MathUtils.clamp(s.theta+a,controls.minAzimuthAngle,controls.maxAzimuthAngle);move(controls.target.clone().add(new THREE.Vector3().setFromSpherical(s)),controls.target.clone());},
   reset(){moved=false;move(home(),TARGET.clone());},
  };
  // Keep the board in reach: panning stops a little beyond its edges.
  controls.addEventListener('change',()=>{const t=controls.target,c=new THREE.Vector3(THREE.MathUtils.clamp(t.x,-3,COLS+3),0,THREE.MathUtils.clamp(t.z,-4,ROWS+3));if(!c.equals(t)){camera.position.add(c.clone().sub(t));t.copy(c);}});
  const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const pickAt=(x:number,y:number)=>{const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);raycaster.setFromCamera(ndc,camera);return scene.pick(raycaster.ray);};
  engine.current={scene,pickAt,camera:cameraCommands};
  const labels=new LabelLayer(labelHost),campAnchor=new THREE.Vector3(3.2,.2,.12);
  let width=1,height=1;
  const resize=new ResizeObserver(()=>{width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();
   // Small boards keep only the pupil's own level badges, so labels never bury the map.
   container.classList.toggle('compact',width<640);
   // Until someone moves the view, keep the whole board framed as the panel changes shape.
   if(!moved&&!tween){camera.position.copy(home());controls.target.copy(TARGET);controls.update();}});resize.observe(container);
  let visible=true;const seen=new IntersectionObserver(e=>{visible=e.some(x=>x.isIntersecting);},{rootMargin:'120px'});seen.observe(container);
  const start=performance.now();let slow=0,fast=0,lastRatioChange=start;
  const frame=()=>{
   if(!visible||document.hidden)return;
   const at=performance.now(),c=clock.current,delta=at-(c.last||at);c.last=at;
   // Ease small server-clock corrections instead of snapping enemies backwards (as the flat board does).
   const desired=c.target+(at-(c.at||at));c.time=delta>1000||!c.at?desired:c.time+delta+THREE.MathUtils.clamp(desired-(c.time+delta),-delta*.05,delta*.05);
   if(tween){const k=Math.min(1,(at-tween.start)/320),e=1-Math.pow(1-k,3);camera.position.lerpVectors(tween.from,tween.to,e);controls.target.lerpVectors(tween.fromT,tween.toT,e);if(k>=1)tween=null;}
   controls.update();
   const out=scene.frame({time:(at-start)/1000,battleNow:c.time,camera,motion:live.current.motion&&!reduced.matches,labels:true});
   if(scene.shadowsDirty){renderer.shadowMap.needsUpdate=true;scene.shadowsDirty=false;}
   renderer.render(scene.scene,camera);
   labels.update(out,camera,width,height);
   for(const [el,pos] of [[entryRef.current,scene.entry],[manorRef.current,scene.manor]] as const)if(el)labels.place(el,pos,camera,width,height,true);
   if(campRef.current)labels.place(campRef.current,campAnchor,camera,width,height,true);
   // Lower the resolution on slow devices; raise it again when there is headroom.
   if(delta>26)slow++;else if(delta<13)fast++;
   if(at-lastRatioChange>4000){
    const next=slow>90?Math.max(1,ratio-.25):fast>200?Math.min(maxRatio,ratio+.25):ratio;
    if(next!==ratio){ratio=next;renderer.setPixelRatio(ratio);renderer.setSize(width,height);}
    slow=fast=0;lastRatioChange=at;
   }
  };
  renderer.setAnimationLoop(frame);
  return()=>{renderer.setAnimationLoop(null);resize.disconnect();seen.disconnect();controls.dispose();canvas.removeEventListener('webglcontextlost',lost);labels.clear();scene.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();engine.current=null;};
 },[]);
 // Effects run in order after the scene above exists, pushing each change in as it happens.
 useEffect(()=>{engine.current?.scene.setTheme(theme);},[theme]);
 useEffect(()=>{engine.current?.scene.setRoute(layout);},[layout,theme]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{engine.current?.scene.setHeroes(heroes);},[heroKey]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{engine.current?.scene.setCamp(camp);},[campKey]);
 const rideKey=battle?.rideMoves?.map(m=>m.id+'@'+m.at).join('|')??'';
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{engine.current?.scene.setBattle(battle,sim??undefined);},[battle?.start,battle?.wave,rideKey]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{engine.current?.scene.setPlacement({active:!!placement,empty,hover,range,ghost});},[placementKey]);
 useEffect(()=>{const id=hover!==null?occupied.get(hover)?.id??null:null;engine.current?.scene.setHovered(id??live.current.hoverId);},[hover,occupied]);
 // Pointer: a short press without dragging is a tap on a hero or a square.
 const press=useRef<{x:number;y:number;at:number}|null>(null),frameRequest=useRef(0);
 const heroFor=(pick:ReturnType<BoardScene['pick']>)=>{
  if(!pick)return null;
  if(pick.kind==='cell')return occupied.get(pick.cell)??null;
  if(pick.kind==='hero')return deployed.find(d=>d.id===pick.id)??null;
  const p=world.players.find(x=>x.id===pick.id);return p?{camp:true as const,...p}:null;
 };
 const onPointerMove=(e:React.PointerEvent)=>{
  if(e.buttons||frameRequest.current)return;const {clientX,clientY}=e;
  frameRequest.current=requestAnimationFrame(()=>{frameRequest.current=0;const pick=engine.current?.pickAt(clientX,clientY)??null,s=engine.current?.scene;
   const campId=pick?.kind==='camp'?pick.id:null,hero=pick?.kind==='hero'?heroes.find(h=>h.id===pick.id):null;live.current.hoverId=campId;
   const cell=hero?(world.defenders.find(d=>d.id===hero.id)?.cell??hero.cell):pick?.kind==='cell'&&buildable.has(pick.cell)?pick.cell:null;
   s?.setHovered(hero?.id??campId??(cell!==null?occupied.get(cell)?.id??null:null));
   if(cell!==hover)setHover(cell);
   if(host.current)host.current.style.cursor=pick&&(pick.kind!=='cell'||buildable.has(pick.cell))?'pointer':'grab';});
 };
 const onPointerUp=(e:React.PointerEvent)=>{
  const p=press.current;press.current=null;if(!p||Math.hypot(e.clientX-p.x,e.clientY-p.y)>6||performance.now()-p.at>700||e.button!==0)return;
  const pick=engine.current?.pickAt(e.clientX,e.clientY)??null,hero=heroFor(pick);
  if(hero){onHero(hero);return;}
  if(pick?.kind==='cell'&&buildable.has(pick.cell))onPlace(pick.cell);
 };
 const elapsed=battle?Math.max(0,(now-battle.start)/1000):0;
 return <div className={`board-3d ${placement?'placing':''} ${battle?'in-battle':''}`} ref={host} onPointerDown={e=>{press.current={x:e.clientX,y:e.clientY,at:performance.now()};}} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
  onPointerLeave={()=>{live.current.hoverId=null;engine.current?.scene.setHovered(null);setHover(null);}}>
  <div className="board-3d-labels" ref={labelsRef} aria-hidden="true">
   <div className="b3-anchor" ref={entryRef}><div className="route-entry"><Swords size={15}/> ENTRY</div></div>
   <div className="b3-anchor" ref={manorRef}><div className="school-goal-3d"><span><Shield size={15}/> THE MANOR · {schoolHp??SCHOOL_MAX_HP} HP</span></div></div>
   <div className="b3-anchor b3-camp" ref={campRef}><div className="camp-label"><Users size={16}/> THE MANOR HERO CAMP <span>{world.players.length}/40</span></div></div>
  </div>
  {battle&&elapsed<2.5&&<div className="wave-announcement"><span>DEFEND THE MANOR</span><b>Wave {battle.wave}</b><small>Heroes, ready!</small></div>}
  {battle&&sim&&elapsed>battle.duration/1000-3&&<div className="battle-finale">{sim.won?<><b>Victory for the Manor!</b><span>The Manor House is safe.</span></>:<><b>Rally your heroes!</b><span>{`${sim.breaches.length} monsters got through. The school needs your help — upgrade and retry.`}</span></>}</div>}
  <div className="board-3d-a11y" aria-label="Hero placement squares">
   {[...buildable].sort((a,b)=>a-b).map(cell=>{const d=occupied.get(cell);return <button key={cell} type="button" aria-label={`Row ${Math.floor(cell/COLS)+1}, column ${cell%COLS+1}${d?`: ${d.name}'s ${HEROES[d.type]?.name}`:': empty placement square'}`}
    onFocus={()=>setHover(cell)} onBlur={()=>setHover(null)} onClick={()=>d?onHero(d):onPlace(cell)}/>;})}
   {world.players.map(p=><button key={'camp'+p.id} type="button" aria-label={`${p.name}'s character in the hero camp, ${p.online?'online':'offline'}`} onClick={()=>onHero({camp:true,...p})}/>)}
  </div>
 </div>;
}
