import * as THREE from 'three';
import {Props,hash,type TreeKind,type Halo} from './board-props';
import {GeometryBatch} from './mesh-batch';
import type {BoardTheme} from './board-theme';
import {grassTexture,pathTexture,swirlTexture,glowTexture,rippleTexture} from './board-textures';
/**
 * Builds the static 3D battlefield: board lawn and path (route dependent), plus the chapter's backdrop, The Manor
 * and the hero camp. Board squares are 1×1 world units; x runs along columns and z along rows, y is up.
 */
export const COLS=24,ROWS=18;
const MANOR={x:22.35,z:15.55};
export type Built={group:THREE.Group;update(time:number,motion:boolean):void;dispose():void};
const disposeGroup=(g:THREE.Object3D)=>g.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const mat=m.material as THREE.Material|THREE.Material[]|undefined;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose();});
function colour(hex:number,shift=0){const c=new THREE.Color(hex);if(shift)c.offsetHSL(0,0,shift);return c;}
/** Additive glow points with their own size and colour: lamp halos, sparks and weather share this shader. */
export function glowPointsMaterial(map:THREE.Texture,additive=true){
 return new THREE.ShaderMaterial({uniforms:{map:{value:map},scale:{value:600}},transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
  vertexShader:`attribute float size;attribute vec4 tint;varying vec4 vTint;uniform float scale;void main(){vTint=tint;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*scale/max(.1,-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D map;varying vec4 vTint;void main(){vec4 t=texture2D(map,gl_PointCoord);float a=t.a*vTint.a;if(a<.01)discard;gl_FragColor=vec4(vTint.rgb,a);}`});
}
const drawSize=new THREE.Vector2();
/** Points whose world-unit sizes follow the camera's field of view and the canvas resolution. */
export function scaledPoints(geometry:THREE.BufferGeometry,material:THREE.ShaderMaterial){
 const p=new THREE.Points(geometry,material);p.frustumCulled=false;
 p.onBeforeRender=(renderer,_scene,camera)=>{renderer.getDrawingBufferSize(drawSize);material.uniforms.scale.value=drawSize.y/(2*Math.tan(((camera as THREE.PerspectiveCamera).fov??45)*Math.PI/360));};
 return p;
}
function haloPoints(halos:Halo[],glow:THREE.Texture){
 const g=new THREE.BufferGeometry(),pos:number[]=[],size:number[]=[],tint:number[]=[];
 for(const h of halos){pos.push(h.position.x,h.position.y,h.position.z);size.push(h.size);const c=new THREE.Color(h.colour);tint.push(c.r,c.g,c.b,.55);}
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('size',new THREE.Float32BufferAttribute(size,1));g.setAttribute('tint',new THREE.Float32BufferAttribute(tint,4));
 const p=scaledPoints(g,glowPointsMaterial(glow));p.renderOrder=3;return p;
}
function meshes(props:Props,group:THREE.Group,opts:{cast?:boolean;roughness?:number}={}){
 const out:THREE.Mesh[]=[];
 if(props.lit.vertexCount){const m=new THREE.Mesh(props.lit.build(),new THREE.MeshLambertMaterial({vertexColors:true}));m.castShadow=opts.cast??true;m.receiveShadow=true;group.add(m);out.push(m);}
 if(props.glow.vertexCount){const m=new THREE.Mesh(props.glow.build(),new THREE.MeshBasicMaterial({vertexColors:true}));group.add(m);out.push(m);}
 if(props.glass.vertexCount){const m=new THREE.Mesh(props.glass.build(),new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:.42,roughness:.08,metalness:.15,depthWrite:false}));m.renderOrder=2;group.add(m);out.push(m);}
 return out;
}
/* ---------------------------------------------------------------- trees and flowers */
const TRUNK=new THREE.CylinderGeometry(.07,.11,1,6).translate(0,.5,0),BLOB=new THREE.IcosahedronGeometry(1,1),CONE=new THREE.ConeGeometry(1,1,7).translate(0,.5,0);
const TREE_GREENS:Record<TreeKind,number[]>={round:[0x4f8a3c,0x5f9a44,0x6aa34a,0x3f7a36],conifer:[0x2f6a44,0x3a7a4c,0x2c5f3e],blossom:[0xf2b8c8,0xf6c9d4,0xe9a3bb],poplar:[0x5a9244,0x4d8640],willow:[0x86a95a,0x93b565,0x7a9e52],palm:[0x5f9a44]};
function forest(spots:Props['trees'],night:boolean,group:THREE.Group){
 const n=spots.length;if(!n)return;
 const trunks=new THREE.InstancedMesh(TRUNK,new THREE.MeshLambertMaterial({color:0x7a5536}),n);
 const blobs:THREE.Matrix4[]=[],blobColours:THREE.Color[]=[],cones:THREE.Matrix4[]=[],coneColours:THREE.Color[]=[];
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),dim=night?-.12:0;
 spots.forEach((t,i)=>{
  const k=t.scale,r=hash(t.x*7.3+t.z*3.1),h=t.kind==='conifer'?1.1:t.kind==='poplar'?1.6:t.kind==='palm'?1.8:.9;
  trunks.setMatrixAt(i,m.compose(p.set(t.x,0,t.z),q.identity(),s.set(k*(t.kind==='palm'?.7:1),h*k,k*(t.kind==='palm'?.7:1))));
  const greens=TREE_GREENS[t.kind],base=colour(t.tint??greens[Math.floor(r*greens.length)],dim+(r-.5)*.06);
  if(t.kind==='conifer')for(let j=0;j<3;j++){cones.push(new THREE.Matrix4().compose(new THREE.Vector3(t.x,(h*.7+j*.55)*k,t.z),q.identity(),new THREE.Vector3((.85-j*.22)*k,(1.1-j*.2)*k,(.85-j*.22)*k)));coneColours.push(base.clone().offsetHSL(0,0,j*.03));}
  else{const lobes=t.kind==='poplar'?[[0,1.9,0,.5,1.25,.5],[0,1.25,0,.55,.8,.55]]:t.kind==='willow'?[[0,1.3,0,1.05,.75,1.05],[.35,.95,.2,.7,.6,.6],[-.4,1,-.15,.7,.55,.6]]:t.kind==='palm'?[[0,1.95,0,.9,.22,.9],[.3,1.85,.1,.55,.2,.4],[-.3,1.85,-.2,.55,.2,.4]]:[[0,1.45,0,.85,.75,.85],[.45,1.15,.15,.6,.5,.55],[-.4,1.2,-.25,.62,.52,.6]];
   for(const [x,y,z,sx,sy,sz] of lobes){const a=r*6.28,cx=x*Math.cos(a)-z*Math.sin(a),cz=x*Math.sin(a)+z*Math.cos(a);blobs.push(new THREE.Matrix4().compose(new THREE.Vector3(t.x+cx*k,y*k,t.z+cz*k),q.setFromEuler(new THREE.Euler(0,a,0)),new THREE.Vector3(sx*k,sy*k,sz*k)));blobColours.push(base.clone().offsetHSL(0,0,(y-1.2)*.08));}}
 });
 trunks.castShadow=true;trunks.receiveShadow=true;group.add(trunks);
 for(const [geometry,list,colours] of [[BLOB,blobs,blobColours],[CONE,cones,coneColours]] as const){
  if(!list.length)continue;const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshLambertMaterial({flatShading:true}),list.length);
  list.forEach((mat,i)=>{mesh.setMatrixAt(i,mat);mesh.setColorAt(i,colours[i]);});mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 }
}
const PETAL=new THREE.IcosahedronGeometry(.055,0);
function flowers(spots:Props['flowers'],group:THREE.Group){
 if(!spots.length)return;const mesh=new THREE.InstancedMesh(PETAL,new THREE.MeshLambertMaterial(),spots.length),m=new THREE.Matrix4();
 spots.forEach((f,i)=>{const r=hash(f.x*13.1+f.z*7.7);mesh.setMatrixAt(i,m.makeScale(1.2,.9,1.2).setPosition(f.x,(f.y??.08)+r*.05,f.z));mesh.setColorAt(i,new THREE.Color(f.colour));});group.add(mesh);
}
function waterMeshes(props:Props,group:THREE.Group,night:boolean){
 const ripple=rippleTexture();ripple.repeat.set(6,6);
 const material=new THREE.MeshStandardMaterial({color:night?0x2c5a7a:0x4a9bc4,map:ripple,roughness:.12,metalness:.1,transparent:true,opacity:.92});
 for(const w of props.waters){const g=new THREE.PlaneGeometry(w.w,w.d);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,material);m.position.set(w.x,.035,w.z);m.receiveShadow=true;group.add(m);
  // Stone banks along the long sides.
  const bank=new THREE.Mesh(new THREE.BoxGeometry(w.w>w.d?w.w:.25,.16,w.w>w.d?.25:w.d),new THREE.MeshLambertMaterial({color:0xb9ad97}));
  for(const s of [-1,1]){const b=bank.clone();b.position.set(w.x+(w.w>w.d?0:s*(w.w/2+.1)),.08,w.z+(w.w>w.d?s*(w.d/2+.1):0));b.castShadow=true;b.receiveShadow=true;group.add(b);}}
 return ripple;
}
/* ---------------------------------------------------------------- The Manor */
function manor(p:Props){
 p.at(MANOR.x,MANOR.z,0,()=>{
  const w=3.1,d=2,h=1.55,wall=0xf4ecdc,roof=0xa9523a,trim=0xffffff;
  p.box(0xcfc3a8,[0,.07,0],[w+.1,.14,d+.1]);p.box(wall,[0,h/2,0],[w,h,d]);p.box(trim,[0,h-.04,0],[w+.1,.08,d+.1]);p.box(trim,[0,.8,0],[w+.02,.04,d+.02]);
  p.hip(roof,[0,h,0],w+.24,d+.24,.95);
  for(const s of [-1,1]){p.box(0xa4563d,[s*1.05,h+.78,-.25],[.26,.8,.34]);p.box(0x7a4030,[s*1.05,h+1.2,-.25],[.32,.06,.4]);}
  for(const x of [-.95,0,.95]){p.box(wall,[x,h+.3,.46],[.36,.36,.34]);p.gable(roof,[x,h+.48,.46],.48,.46,.22);p.window(x,h+.3,.63,.2,.22,trim);}
  for(let f=0;f<2;f++)for(let i=0;i<5;i++){if(f===0&&i===2)continue;p.window(-w/2+w*(i+.5)/5,.46+f*.7,d/2,.3,.42,trim);}
  for(const s of [-1,1])p.at(s*w/2,0,s*Math.PI/2,()=>{for(let f=0;f<2;f++)for(const x of [-.45,.45])p.window(x,.46+f*.7,0,.28,.4,trim);});
  p.door(0,d/2,0x1f4a3c,.44,.74,trim);p.gable(trim,[0,.84,d/2+.1],.74,.2,.2);for(const s of [-1,1])p.cyl(trim,[s*.3,.42,d/2+.12],.04,.84,8);
  p.box(0xd9cfbd,[0,.05,d/2+.32],[.95,.1,.3]);p.box(0xd9cfbd,[0,.13,d/2+.2],[.85,.08,.2]);
  p.flag(.62,-.08,h+1.75,0x00483a,0xd0a300);
 });
 p.fence(20.8,17.72,23.95,17.72);p.box(0xd8cbb0,[22.35,.012,17.2],[3.3,.024,1.05]);
 p.flowerBed(21.35,17.35,.9,.4,[0xf29ab4,0xf2c94c,0xb79be8,0xfdfaf2]);p.flowerBed(23.35,17.35,.9,.4,[0xf29ab4,0xf2c94c,0xb79be8,0xfdfaf2]);
 for(const [x,z] of [[20.95,14.75],[23.8,14.75]])p.blob(0x3f7a3a,[x,.34,z],[.36,.68,.36]);
}
/* ---------------------------------------------------------------- chapter backdrops */
const BRICK=0xb5654a,CREAM=0xf1e7d3,HONEY=0xd8b77c,STONE=0xb3aea1,TERRACOTTA=0xb0553a,SLATE=0x55616b;
const PASTELS=[0xf1e7d3,0xcfe0e8,0xf2d4c8,0xf3e3b5,0xd8e6c9,0xb5654a,0xe8d9f0];
type Kit=(p:Props,t:BoardTheme,extras:THREE.Group)=>TreeKind[];
function cobbleSquare(extras:THREE.Group,x:number,z:number,w:number,d:number,tint:number,style:'cobble'|'flagstone'|'tarmac'|'gravel'='cobble'){
 const tex=pathTexture(style);tex.repeat.set(w/1.2,d/1.2);const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:tint,map:tex}));m.position.set(x,.006,z);m.receiveShadow=true;extras.add(m);
}
const KITS:Record<BoardTheme['kit'],Kit>={
 campus(p,t){
  p.at(2.6,-2.7,0,()=>p.house({w:6,d:1.8,h:1.15,wall:0xd9c7a0,roof:TERRACOTTA,roofType:'gable',floors:1,cols:6,chimneys:2,door:0x1f4a3c}));
  p.at(8.6,-2.9,0,()=>p.house({w:3.6,d:1.6,h:1.1,wall:0xd9c7a0,roof:TERRACOTTA,roofType:'gable',floors:1,cols:3,dormers:2}));
  p.at(-2.4,-3.9,.2,()=>p.house({w:2.4,d:2,h:1.3,wall:0xa99f8e,roof:0x9c4a34,roofType:'gable',floors:1,cols:2,door:0x6b4526}));
  if(t.landmark==='library')p.at(13.6,-3.8,0,()=>p.house({w:5.2,d:2.6,h:2,wall:HONEY,roof:SLATE,roofType:'hip',floors:2,cols:5,door:0x2c3e63,chimneys:2}));
  else p.court(13.6,-3.9,4.6,2.8);
  p.at(20.6,-3.7,0,()=>{p.house({w:5.4,d:2.8,h:2,wall:0xd4c5a2,roof:0x4d5a63,roofType:'gable',floors:2,cols:4});p.box(0x3f8f8a,[0,1,1.42],[3,1.8,.05],undefined,p.glass);for(let i=0;i<7;i++)p.box(0xf6f2e8,[-1.5+i*.5,1,1.46],[.05,1.8,.04]);});
  p.gazebo(17.2,-1.7,0xf6f2e8,0x8a4a33);
  p.at(-5.2,6,Math.PI/2,()=>p.house({w:3.2,d:2,h:1.2,wall:0xd9c7a0,roof:TERRACOTTA,roofType:'gable',floors:1,cols:3,chimneys:1}));
  p.at(28.6,5,-Math.PI/2,()=>p.house({w:3.4,d:2.2,h:1.3,wall:CREAM,roof:TERRACOTTA,roofType:'hip',floors:1,cols:3,door:0x9c3b32}));
  p.glasshouse(28.4,11.5,2.4,1.6,1,Math.PI/2);p.bench(-2.6,2,Math.PI/2);p.bench(26.4,9,-Math.PI/2);
  p.hedge(-1.8,-1.2,26,-1.2,.5,.5);
  return ['round','round','round','conifer','blossom'];
 },
 courtyard(p,t,extras){
  cobbleSquare(extras,12,-3.6,34,5.4,0xd8c9a8,'flagstone');
  p.at(3,-4.4,0,()=>p.house({w:5.6,d:2,h:1.9,wall:CREAM,roof:TERRACOTTA,roofType:'hip',floors:2,cols:5,chimneys:2,door:0x1f4a3c}));
  p.at(10.2,-4.6,0,()=>p.house({w:5,d:2,h:1.9,wall:BRICK,roof:TERRACOTTA,roofType:'gable',floors:2,cols:4,dormers:3,door:0x2c3e63}));
  p.at(17.2,-4.4,0,()=>p.house({w:5.6,d:2,h:1.9,wall:CREAM,roof:TERRACOTTA,roofType:'hip',floors:2,cols:5,chimneys:1}));
  p.at(23,-4.6,0,()=>{p.house({w:3.6,d:2.4,h:1.6,wall:BRICK,roof:TERRACOTTA,roofType:'gable',floors:1,cols:3});p.box(0x9ccfd0,[0,.8,1.25],[2.4,1.3,.06],undefined,p.glass);});
  p.at(-3.8,3.5,Math.PI/2,()=>p.house({w:4.2,d:2,h:1.9,wall:BRICK,roof:TERRACOTTA,roofType:'gable',floors:2,cols:4,chimneys:1}));
  p.at(28,4,-Math.PI/2,()=>p.house({w:4.6,d:2.2,h:1.9,wall:CREAM,roof:TERRACOTTA,roofType:'hip',floors:2,cols:4,door:0x1f4a3c}));
  if(t.landmark==='minibus'){p.minibus(5,-1.9,Math.PI/2);p.minibus(8,-1.9,Math.PI/2,0xf2c94c);for(let i=0;i<4;i++)p.box(0xf6f2e8,[3.5+i*1.5,.012,-1.9],[.06,.02,1.4]);}
  else{p.gazebo(12.4,-2.2);p.slide(18.5,-2,Math.PI/2);}
  p.flowerBed(1,-1.6,2.4,.5,[0xf29ab4,0xf2c94c,0xe8513a]);p.flowerBed(21,-1.6,2.4,.5,[0xb79be8,0xfdfaf2,0xf2c94c]);
  return ['round','round','blossom','conifer'];
 },
 gates(p,t){
  p.wall(-6,-1.3,11,-1.3,.8,BRICK,3,true);p.wall(13,-1.3,31,-1.3,.8,BRICK,3,true);
  for(const x of [11,13]){p.box(BRICK,[x,.75,-1.3],[.5,1.5,.5]);p.box(0xd9cfbd,[x,1.55,-1.3],[.6,.1,.6]);p.ball(0xd9cfbd,[x,1.72,-1.3],[.3,.3,.3]);}
  p.railing(11.25,-1.3,11.9,-2.1);p.railing(12.75,-1.3,12.1,-2.1);
  p.wall(-2.8,-1.3,-2.8,19.5,.8,BRICK,3,true);p.wall(26.2,-1.3,26.2,19.5,.8,BRICK,3,true);
  const houses=[[-3,-3.9,4,CREAM],[3.5,-4.2,4.4,BRICK],[8.6,-4.1,3.2,0xe9dcc2],[16,-4.2,4.6,BRICK],[22.5,-3.9,4,CREAM],[28,-4.2,3.4,BRICK]] as const;
  houses.forEach(([x,z,w,c],i)=>p.at(x,z,0,()=>p.house({w,d:2.2,h:1.9+(i%2)*.3,wall:c,roof:i%2?SLATE:TERRACOTTA,roofType:i%3?'gable':'hip',floors:2,cols:Math.round(w/1.1),chimneys:1+(i%2),door:[0x1f4a3c,0x9c3b32,0x2c3e63][i%3]})));
  for(const x of [-1,5,17,24])p.lamp(x,20.3);
  return t.time==='evening'?['round','conifer','round']:['round','round','conifer'];
 },
 playground(p,t,extras){
  cobbleSquare(extras,11,-4,32,6,0x8a9096,'tarmac');
  const hop=[0xe8513a,0xf2c94c,0x4a90d9,0x8cc152,0xf29ab4];for(let i=0;i<5;i++)p.box(hop[i],[4+i*.55,.012,-1.9],[.46,.02,.46]);
  p.at(10.5,-4.6,0,()=>p.house({w:8,d:2.6,h:2,wall:CREAM,roof:TERRACOTTA,roofType:'hip',floors:2,cols:7,door:0x1f4a3c,chimneys:2}));
  p.at(22,-4.3,0,()=>p.house({w:4.4,d:2.4,h:1.9,wall:BRICK,roof:SLATE,roofType:'gable',floors:2,cols:4}));
  p.slide(0,-2.6,Math.PI/2);p.swings(-3.6,-3,0);p.climber(17,-2.4);p.gazebo(20.6,-2.2,0xe6e1d6,0x3f7a8a);
  for(const [x,z,w] of [[6,-3,1.4],[13,-2.2,1],[-1,-4.6,1.2],[24,-2.6,.9]])p.box(0x6f8fa8,[x,.014,z],[w,.012,w*.6],[0,.4,0],p.glass);
  p.bench(8,-2.2,0);p.bench(14.6,-2.2,0);
  return ['round','round','conifer'];
 },
 sports(p,t){
  p.at(12,-5.2,0,()=>{p.house({w:12,d:4.4,h:3,wall:0xd9d4c6,roof:0x4d5a63,roofType:'gable',floors:2,cols:8,roofH:1.1});p.box(0x3fbf7a,[0,1.15,2.24],[3.6,2.2,.08],undefined,p.glass);p.box(0x1f7a4f,[0,2.35,2.26],[3.9,.22,.1]);for(let i=0;i<9;i++)p.box(0xf6f2e8,[-1.8+i*.45,1.15,2.3],[.05,2.2,.04]);});
  for(const x of [3,6,18,21])p.flag(x,-1.9,2.2,t.landmark==='hall'?0x00483a:0x7a3971,0xd0a300);
  p.at(-4.5,-4,0,()=>{p.box(0x6b7a70,[0,1.1,0],[3.4,.08,1.6]);for(const x of [-1.6,1.6])for(const z of [-.7,.7])p.cyl(0x6b7a70,[x,.55,z],.04,1.1,6);for(let i=0;i<5;i++)p.cyl(0x2f3a3a,[-1.2+i*.6,.3,0],.26,.04,14,[Math.PI/2,0,0]);});
  p.at(28.5,6,-Math.PI/2,()=>p.house({w:5,d:2.4,h:1.9,wall:0xd9d4c6,roof:0x4d5a63,roofType:'flat',floors:2,cols:5}));
  for(const x of [-4,0,24,28])p.bench(x,20.6,Math.PI);
  return ['round','poplar','round'];
 },
 town(p,t,extras){
  cobbleSquare(extras,12,-6,48,10,0xc9c0b0,'cobble');
  const widths=[3.4,3,3.6,3.2,3.8,3.2,3.4,3,3.6,3.4];let x=-7;
  widths.forEach((w,i)=>{if(Math.abs(x+w/2-12)<3.4){x+=w;return;}p.at(x+w/2,-4.9,0,()=>p.house({w,d:2.6,h:2.2+(i*37%5)*.12,wall:PASTELS[i%PASTELS.length],roof:i%3===0?SLATE:TERRACOTTA,roofType:i%2?'gable':'hip',floors:2,cols:Math.round(w/1.05),door:[0x1f4a3c,0x9c3b32,0x2c3e63,0x6b4526][i%4],chimneys:1}));x+=w;});
  p.at(12,-4.6,0,()=>{p.box(HONEY,[0,2.4,0],[4.2,2,3]);for(let i=0;i<4;i++){p.cyl(HONEY,[-1.6+i*1.07,.7,1.3],.14,1.4,10);p.cyl(HONEY,[-1.6+i*1.07,.7,-1.3],.14,1.4,10);}p.box(0x2a2522,[0,.7,0],[3.6,1.4,2.4]);
   p.box(0xefe2c2,[0,1.45,0],[4.4,.12,3.2]);p.facade(4.2,1.5,2,4,1.9,.8,.34,.5,0xf6f2e8,-1,true);p.hip(SLATE,[0,3.4,0],4.4,3.2,.7);p.block(0,0,2.6);
   // The cupola sits on the roof ridge.
   p.at(0,0,0,()=>p.tower({r:.42,h:.7,wall:HONEY,roof:0x6fa894,cap:'dome'}),3.9);});
  if(t.landmark==='market'||t.landmark==='hall'){const stripes=[0xe8513a,0x4a90d9,0x8cc152,0xf2c94c,0x7a3971];for(let i=0;i<5;i++)p.stall(2+i*2.3+(i>1?6:0),-2,0,stripes[i]);}
  if(t.landmark==='bunting'){for(const z of [-1.8,-3.2])p.bunting(-4,z,28,z,2.1);p.stall(5,-2.4,0,0xe8513a);p.stall(19,-2.4,0,0x4a90d9);}
  p.at(-5,4,Math.PI/2,()=>p.house({w:4,d:2.2,h:2.2,wall:PASTELS[2],roof:TERRACOTTA,roofType:'gable',floors:2,cols:3}));
  p.at(-5,10,Math.PI/2,()=>p.house({w:4,d:2.2,h:2.4,wall:PASTELS[3],roof:SLATE,roofType:'hip',floors:2,cols:3,door:0x9c3b32}));
  p.at(29,5,-Math.PI/2,()=>p.house({w:4.4,d:2.2,h:2.3,wall:PASTELS[1],roof:TERRACOTTA,roofType:'hip',floors:2,cols:4}));
  p.at(29,11,-Math.PI/2,()=>p.house({w:3.8,d:2.2,h:2.1,wall:BRICK,roof:SLATE,roofType:'gable',floors:2,cols:3}));
  for(const [lx,lz] of [[-1.8,-1.8],[7,-1.8],[17,-1.8],[25.8,-1.8]])p.lamp(lx,lz,1.5);
  return ['round','round'];
 },
 abbey(p,t,extras){
  p.ruin(4,-3.6,0);p.ruin(19.5,-3.8,.15);if(t.landmark==='ruins'){p.ruin(12,-5.4,0);p.ruin(-3.6,-2.6,Math.PI/2);}
  p.at(10,-6.4,0,()=>{p.house({w:9,d:2.6,h:2.1,wall:STONE,roof:0x6b6a63,roofType:'gable',floors:2,cols:7,roofH:1.4,door:0x6b4526});});
  p.at(16.6,-6.4,0,()=>p.tower({r:.95,h:4.2,wall:STONE,roof:0x6b6a63,square:true}));
  if(t.landmark==='meadow'){p.water(12,-13.5,90,4);for(let i=0;i<120;i++){const x=-10+hash(i*1.7)*46,z=-11+hash(i*3.3)*9;if(z>-2&&x>-3&&x<27)continue;p.flowers.push({x,z,colour:[0xfdfaf2,0xf2c94c,0xb79be8,0xf29ab4][i%4]});}}
  else{for(const [x,z] of [[1,-1.8],[8,-2],[15.6,-2],[23,-1.8]])p.flowerBed(x,z,2.6,.7,[0xf29ab4,0xb79be8,0xfdfaf2,0xf2c94c]);for(const x of [-1.5,5.9,12.2,17.8])p.blob(0x3f7a3a,[x,.45,-2],[.5,.9,.5]);}
  p.at(-5,7,Math.PI/2,()=>p.house({w:3.6,d:2,h:1.6,wall:STONE,roof:0x6b6a63,roofType:'gable',floors:1,cols:3,chimneys:1}));
  p.at(28.5,8,-Math.PI/2,()=>p.house({w:4,d:2.2,h:1.8,wall:STONE,roof:TERRACOTTA,roofType:'gable',floors:2,cols:3}));
  void extras;return t.landmark==='meadow'?['willow','round','round']:['round','conifer','round'];
 },
 river(p,t){
  p.water(12,-4.9,110,3.8);
  if(t.landmark==='confluence')p.water(-7.8,6,3.4,27);
  if(t.landmark==='bridge'){p.bridge(12,-4.9,0,5,1.6);p.box(0xb9ad97,[12,.02,-9.2],[1.6,.04,3.6]);}
  if(t.landmark==='wharf'){p.box(0x8a5a33,[6,.1,-3.1],[9,.08,.9]);for(let i=0;i<10;i++)p.cyl(0x6b4526,[1.8+i*.95,.12,-2.7],.06,.5,6);p.boat(4,-4.6,Math.PI/2,0x2c6e8f);p.boat(8.5,-5.2,Math.PI/2,0x9c3b32);
   p.at(-3.2,-2.4,Math.PI/2,()=>p.house({w:3.6,d:2.2,h:1.9,wall:BRICK,roof:SLATE,roofType:'gable',floors:2,cols:3,door:0x6b4526}));}
  else{p.boat(4,-4.6,Math.PI/2,0x2c6e8f);p.boat(20,-5.2,-Math.PI/2,0xf2c94c);}
  p.at(8,-9.6,0,()=>{p.house({w:3,d:5,h:2.2,wall:STONE,roof:0x6b6a63,roofType:'gable',floors:1,cols:2,roofH:1.3});p.at(0,-3,0,()=>p.tower({r:.6,h:3.2,wall:STONE,roof:0x6b6a63,cap:'spire',square:true}));});
  for(const [x,w,c] of [[-4,3.6,CREAM],[14,4,BRICK],[19,3.4,PASTELS[1]],[24,4,CREAM],[29,3.6,BRICK]] as const)p.at(x,-8.6,0,()=>p.house({w,d:2.2,h:2,wall:c,roof:TERRACOTTA,roofType:'gable',floors:2,cols:Math.round(w/1.1),chimneys:1}));
  for(let i=0;i<9;i++)if(i!==4)p.tree(-6+i*4.2,-2.3,'willow',.8+hash(i)*.25);
  return ['willow','round','round'];
 },
 oxford(p,t){
  const stone=HONEY,roof=0x6b6f6a;
  const range=(x:number,z:number,w:number,h:number)=>p.at(x,z,0,()=>{p.house({w,d:2.4,h,wall:stone,roof,roofType:'flat',floors:2,cols:Math.round(w/1),door:0x6b4526});p.crenel(w,2.4,h+.12,stone);});
  if(t.landmark==='dome'){p.at(12,-5.4,0,()=>p.dome(2,1.8,stone,0x7faa95));p.railing(8.5,-2.4,15.5,-2.4);range(2,-4.6,6,2.2);range(22,-4.6,6,2.2);}
  else if(t.landmark==='library'){p.at(12,-5,0,()=>{p.house({w:9,d:3.2,h:2.6,wall:stone,roof,roofType:'flat',floors:3,cols:9,door:0x2c3e63});p.crenel(9,3.2,2.72,stone);});p.at(17.6,-4.2,0,()=>p.tower({r:.9,h:4.6,wall:stone,roof,square:true,cap:'lantern'}));range(1,-4,4,2.2);range(24,-4,4,2.2);}
  else{range(3.5,-4.4,7,2.2);range(20.5,-4.4,7,2.2);p.at(12,-4.6,0,()=>p.tower({r:1,h:3.6,wall:stone,roof:0x7faa95,square:true,cap:'lantern'}));}
  for(const [x,z,h] of [[4,-7.5,5.5],[20,-8,6.2],[-4,-6,4.4],[27,-6,4.8]])p.at(x,z,0,()=>p.tower({r:.55,h,wall:stone,roof:0x7a7f7a,cap:'spire',square:t.landmark!=='spires'}));
  if(t.landmark==='spires')p.at(12,-8.5,0,()=>p.tower({r:.7,h:6.8,wall:stone,roof:0x7a7f7a,cap:'spire'}));
  p.at(-5,6,Math.PI/2,()=>p.house({w:4.4,d:2.4,h:2.2,wall:stone,roof,roofType:'gable',floors:2,cols:4}));
  p.at(29,7,-Math.PI/2,()=>p.house({w:4.4,d:2.4,h:2.2,wall:stone,roof,roofType:'gable',floors:2,cols:4}));
  for(const [lx,lz] of [[-1.8,-1.8],[6,-1.9],[18,-1.9],[25.8,-1.8]])p.lamp(lx,lz,1.5);
  return ['round','poplar'];
 },
 museum(p,t){
  const stone=t.landmark==='dinosaur'?0xc9b99a:t.landmark==='totem'?0xb5654a:0xe6dcc6;
  p.at(12,-5.4,0,()=>{
   p.house({w:13,d:3.6,h:2.6,wall:stone,roof:t.landmark==='dinosaur'?0x55616b:0x8a8579,roofType:t.landmark==='portico'?'flat':'gable',floors:2,cols:11,roofH:1.2});
   if(t.landmark==='portico'||t.landmark==='orrery')p.portico(5,1.8,1.8,0xefe6d2,6);else p.at(0,1.2,0,()=>p.tower({r:.9,h:3.6,wall:stone,roof:0x55616b,cap:'spire',square:true}));
  });
  if(t.landmark==='dinosaur')p.dinosaur(4.5,-2.6,.6);
  if(t.landmark==='totem'){p.totem(4,-2.4);p.totem(20,-2.4);}
  if(t.landmark==='orrery')p.orrery(12,-2.6);
  if(t.landmark==='portico'){p.box(0xefe6d2,[4,.3,-2.4],[.9,.6,.9]);p.ball(0xd8d0bf,[4,.95,-2.4],[.5,.7,.5]);p.box(0xefe6d2,[20,.3,-2.4],[.9,.6,.9]);p.ball(0xd8d0bf,[20,.95,-2.4],[.5,.7,.5]);}
  p.at(-5,5,Math.PI/2,()=>p.house({w:4.6,d:2.4,h:2.2,wall:stone,roof:0x8a8579,roofType:'hip',floors:2,cols:4}));
  p.at(29,6,-Math.PI/2,()=>p.house({w:4.6,d:2.4,h:2.2,wall:stone,roof:0x8a8579,roofType:'hip',floors:2,cols:4}));
  for(const [lx,lz] of [[-1.8,-1.8],[8,-1.9],[16,-1.9],[25.8,-1.8]])p.lamp(lx,lz,1.5);
  return ['round','conifer'];
 },
 botanic(p,t){
  p.glasshouse(7.5,-4.8,6,3,2);p.glasshouse(17.5,-4.8,5,2.6,1.8);p.fountain(12.4,-2.6);
  p.wall(-8,-8.5,10.6,-8.5,1.2,STONE);p.wall(13.4,-8.5,32,-8.5,1.2,STONE);
  p.at(12,-8.5,0,()=>{for(const s of [-1,1])p.box(HONEY,[s*1.2,1.1,0],[.6,2.2,.6]);p.put(new THREE.TorusGeometry(1,.3,6,14,Math.PI),HONEY,[0,2.2,0],[1,1,1]);p.box(HONEY,[0,3,0],[3,.3,.7]);});
  const beds=[[0,-2,3,.8],[5,-2,2.2,.8],[19.6,-2,2.2,.8],[24.4,-2,3,.8],[-4,4,.8,4],[27.8,4,.8,4],[-4,12,.8,4],[27.8,12,.8,4]] as const;
  for(const [x,z,w,d] of beds)p.flowerBed(x,z,w,d,[0xf29ab4,0xe8513a,0xf2c94c,0xb79be8,0xfdfaf2]);
  for(const x of [-6,-2,26,30])p.tree(x,-6,'palm',1);
  void t;return ['blossom','round','round'];
 },
};
function scatterTrees(p:Props,kinds:TreeKind[],seed:number){
 const spots:[number,number][]=[],free=(x:number,z:number,gap:number)=>{
  if(x>-2.7&&x<26.7&&z>-1.6&&z<20.4)return false;
  if(p.blocked.some(([bx,bz,r])=>Math.hypot(x-bx,z-bz)<r+.9))return false;
  if(p.waters.some(w=>Math.abs(x-w.x)<w.w/2+.7&&Math.abs(z-w.z)<w.d/2+.7))return false;
  return spots.every(([sx,sz])=>Math.hypot(x-sx,z-sz)>gap);
 };
 const zones:[number,number,number,number,number,number][]=[[-14,38,-22,-1.6,46,1.5],[-14,-2.7,-1.6,21,20,1.3],[26.7,38,-1.6,21,20,1.3],[-14,-3.5,20.4,26,4,1.6],[27.5,38,20.4,26,4,1.6]];
 let n=0;for(const [x0,x1,z0,z1,count,gap] of zones){let placed=0;for(let tries=0;tries<count*14&&placed<count;tries++){n++;const x=x0+hash(seed+n*1.37)*(x1-x0),z=z0+hash(seed+n*2.71)*(z1-z0);if(!free(x,z,gap))continue;spots.push([x,z]);placed++;p.tree(x,z,kinds[Math.floor(hash(seed+n*5.3)*kinds.length)],.85+hash(seed+n*9.1)*.45);}}
}
function campDecor(p:Props){
 p.tent(23.05,.9,0,0x00483a);p.flag(22.35,1.7,1.5,0x7a3971,0xd0a300);p.flag(.45,1.55,1.5,0x00483a,0xd0a300);p.campfire(1.25,1.2);
 p.box(0x8a5a33,[1.35,.12,.55],[.8,.14,.2]);
}
/** The chapter backdrop: everything that does not depend on the monster route. */
export function buildWorld(theme:BoardTheme):Built{
 const group=new THREE.Group(),l=theme.lighting,night=l.glow;
 const grass=grassTexture();grass.repeat.set(70,70);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(260,260).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:l.wild,map:grass}));
 ground.position.set(12,-.02,9);ground.receiveShadow=true;group.add(ground);
 const props=new Props(night);const extras=new THREE.Group();group.add(extras);
 const kinds=KITS[theme.kit](props,theme,extras);
 campDecor(props);
 props.hedge(-2.2,19.25,26.4,19.25,.42,.42);
 for(const x of [2,8,14])props.flowerBed(x,20,2.4,.5,[0xf29ab4,0xf2c94c,0xfdfaf2,0xb79be8]);
 scatterTrees(props,kinds,theme.seed);
 meshes(props,group);forest(props.trees,night,group);flowers(props.flowers,group);
 const ripple=props.waters.length?waterMeshes(props,group,night):null;
 const manorProps=new Props(night);manor(manorProps);const manorMeshes=meshes(manorProps,group);flowers(manorProps.flowers,group);
 const glow=glowTexture(),halos=[...props.halos,...manorProps.halos];if(halos.length)group.add(haloPoints(halos,glow));
 group.userData.manor=manorMeshes[0];
 if(theme.goldEvent)group.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  const gild=(material:THREE.Material)=>{
   if(material instanceof THREE.MeshLambertMaterial){
    const gold=new THREE.MeshStandardMaterial({color:0xe5ba42,map:material.map,metalness:.75,roughness:.28,side:material.side});material.dispose();return gold;
   }
   if('color' in material)(material as THREE.MeshStandardMaterial).color.set(0xe5ba42);
   if('vertexColors' in material)(material as THREE.MeshStandardMaterial).vertexColors=false;
   if(material instanceof THREE.MeshStandardMaterial){material.metalness=.8;material.roughness=.25;}
   return material;
  };
  object.material=Array.isArray(object.material)?object.material.map(gild):gild(object.material);
  if(object instanceof THREE.InstancedMesh&&object.instanceColor){for(let i=0;i<object.count;i++)object.setColorAt(i,new THREE.Color(0xffd76c));object.instanceColor.needsUpdate=true;}
 });
 return {group,update(time,motion){if(ripple&&motion){ripple.offset.set(time*.02,time*.035);}},dispose(){disposeGroup(group);grass.dispose();glow.dispose();ripple?.dispose();}};
}
/* ---------------------------------------------------------------- lawn, path and portal (route dependent) */
export type RouteShape={waypoints:number[][];path:{x:number;y:number}[];cells:Set<number>};
const isGoal=(x:number,y:number)=>x>=20&&y>=14;
/** Lawn squares where heroes may stand; mirrors isBuildable in lib/battle.ts for a given route. */
export function buildableCells(cells:Set<number>){const out=new Set<number>();for(let c=COLS*2;c<COLS*(ROWS-1);c++){const x=c%COLS,y=Math.floor(c/COLS);if(x>0&&x<COLS-1&&!isGoal(x,y)&&!cells.has(c))out.add(c);}return out;}
export function buildRoute(theme:BoardTheme,route:RouteShape):Built{
 const group=new THREE.Group(),l=theme.lighting,build=buildableCells(route.cells),entry=route.waypoints[0],end=route.waypoints[route.waypoints.length-1];
 // Lawn with gentle mowing stripes, one tone per square, so the grid reads without drawing lines.
 const lawn=new GeometryBatch(),quad=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),m=new THREE.Matrix4();
 const warm=new THREE.Color(0xd9c79a),wild=new THREE.Color(l.wild),gravel=new THREE.Color(0xd8cbb0);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const c=y*COLS+x;if(route.cells.has(c))continue;
  let tint=new THREE.Color((x+y)%2?l.grass[0]:l.grass[1]);
  if(y<2)tint.lerp(warm,.35);else if(isGoal(x,y))tint=gravel.clone();else if(!build.has(c))tint=wild.clone().lerp(tint,.35);
  lawn.add(quad,m.makeTranslation(x+.5,0,y+.5),tint);
 }
 const lawnGeometry=lawn.build(),uv:number[]=[];const pos=lawnGeometry.attributes.position;for(let i=0;i<pos.count;i++)uv.push(pos.getX(i)/3,pos.getZ(i)/3);lawnGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const grass=grassTexture();const lawnMesh=new THREE.Mesh(lawnGeometry,new THREE.MeshLambertMaterial({vertexColors:true,map:grass}));lawnMesh.receiveShadow=true;group.add(lawnMesh);
 // Path tiles with world-aligned texture, plus an apron leading out of the portal.
 const tiles=new GeometryBatch(),kerbs=new GeometryBatch(),box=new THREE.BoxGeometry(1,1,1),pathColour=new THREE.Color(theme.path);
 const tile=(x:number,z:number,w=1,d=1)=>tiles.add(quad,m.compose(new THREE.Vector3(x+w/2,.016,z+d/2),new THREE.Quaternion(),new THREE.Vector3(w,1,d)),pathColour.clone().offsetHSL(0,0,(hash(x*3.3+z*7.1)-.5)*.035));
 for(const c of route.cells)tile(c%COLS,Math.floor(c/COLS));
 tile(-1.6,entry[1],1.6,1);
 const kerbColour=new THREE.Color(theme.kerb),has=(x:number,y:number)=>route.cells.has(y*COLS+x)&&x>=0&&x<COLS&&y>=0&&y<ROWS;
 const kerb=(cx:number,cz:number,sx:number,sz:number)=>kerbs.add(box,m.compose(new THREE.Vector3(cx,.035,cz),new THREE.Quaternion(),new THREE.Vector3(sx,.07,sz)),kerbColour.clone().offsetHSL(0,0,(hash(cx*5.1+cz*2.3)-.5)*.05));
 for(const c of route.cells){
  const x=c%COLS,y=Math.floor(c/COLS);
  if(!has(x,y-1))kerb(x+.5,y+.045,1,.09);
  if(!has(x,y+1))kerb(x+.5,y+.955,1,.09);
  if(!has(x-1,y)&&!(x===entry[0]&&y===entry[1]))kerb(x+.045,y+.5,.09,1);
  if(!has(x+1,y)&&!(x===end[0]&&y===end[1]))kerb(x+.955,y+.5,.09,1);
 }
 kerb(-.8,entry[1]+.045,1.6,.09);kerb(-.8,entry[1]+.955,1.6,.09);
 const tileGeometry=tiles.build(),tuv:number[]=[],tp=tileGeometry.attributes.position,repeat=theme.pathStyle==='gravel'||theme.pathStyle==='tarmac'?.5:1;
 for(let i=0;i<tp.count;i++)tuv.push(tp.getX(i)*repeat,tp.getZ(i)*repeat);tileGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(tuv,2));
 const pathTex=pathTexture(theme.pathStyle);const pathMesh=new THREE.Mesh(tileGeometry,new THREE.MeshLambertMaterial({vertexColors:true,map:pathTex}));pathMesh.receiveShadow=true;group.add(pathMesh);
 const kerbMesh=new THREE.Mesh(kerbs.build(),new THREE.MeshLambertMaterial({vertexColors:true}));kerbMesh.receiveShadow=true;kerbMesh.castShadow=true;group.add(kerbMesh);
 // Chevrons show which way the monsters walk.
 const arrows=new GeometryBatch(),bar=new THREE.PlaneGeometry(.07,.3).rotateX(-Math.PI/2);
 for(let i=2;i<route.path.length-2;i+=3){
  const a=route.path[i-1],b=route.path[i],c=route.path[i+1];if(b.x-a.x!==c.x-b.x||b.y-a.y!==c.y-b.y)continue;
  const yaw=Math.atan2(c.x-b.x,c.y-b.y);
  // Two bars meeting at the front make a chevron pointing along the route.
  for(const s of [-1,1])arrows.add(bar,new THREE.Matrix4().compose(new THREE.Vector3(b.x,.02,b.y),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)).multiply(new THREE.Matrix4().makeTranslation(s*.09,0,-.02)).multiply(new THREE.Matrix4().makeRotationY(-s*.75)),0xffffff);
 }
 const arrowMesh=new THREE.Mesh(arrows.build(),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.42,depthWrite:false}));arrowMesh.renderOrder=1;group.add(arrowMesh);
 // Border hedges on squares nobody can use, leaving the entry open.
 const props=new Props(l.glow);
 props.hedge(.45,2.05,.45,entry[1]-.1,.3,.34);props.hedge(.45,entry[1]+1.1,.45,16.95,.3,.34);props.hedge(23.55,2.05,23.55,13.95,.3,.34);
 for(let x=1;x<20;x+=4)props.flowerBed(x+1.5,17.55,2.6,.36,[0xf29ab4,0xf2c94c,0xfdfaf2,0xb79be8]);
 // The monster portal: a stone arch with a swirling doorway, just off the left edge.
 // It faces the board but turns towards the camera side, so the swirl reads from the default view.
 const px=-1.35,pz=entry[1]+.5,yaw=Math.PI/2-.55,face=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 props.at(px,pz,yaw,()=>{for(const s of [-1,1]){props.box(0x8b8378,[s*.7,.7,0],[.32,1.4,.36]);props.box(0x6f675e,[s*.7,.06,0],[.46,.12,.5]);}
  props.put(new THREE.TorusGeometry(.7,.17,6,16,Math.PI),0x8b8378,[0,1.4,0],[1,.8,1.1]);props.box(0x6f675e,[0,2.05,0],[.3,.26,.4]);
  for(const [x,z,r] of [[-1.2,.3,.22],[1.15,-.2,.26],[-1,-.5,.18],[1.3,.4,.16]])props.blob(0x8f877c,[x,r*.5,z],[r*2,r*1.3,r*2]);});
 meshes(props,group);flowers(props.flowers,group);
 const swirl=swirlTexture(),vortex=new THREE.Mesh(new THREE.CircleGeometry(.62,32),new THREE.MeshBasicMaterial({map:swirl,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 vortex.position.set(px,1.02,pz);vortex.rotation.y=yaw;group.add(vortex);
 const backing=new THREE.Mesh(new THREE.CircleGeometry(.62,32),new THREE.MeshBasicMaterial({color:0x2a1540}));backing.position.set(px-face.x*.04,1.02,pz-face.z*.04);backing.rotation.y=yaw;group.add(backing);
 const pool=new THREE.Mesh(new THREE.CircleGeometry(1.1,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:glowTexture(),color:0xb46cff,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));pool.position.set(px+face.x*.5,.03,pz+face.z*.5);group.add(pool);
 group.userData.entry=new THREE.Vector3(px,2.3,pz);
 return {group,update(time,motion){if(motion)vortex.rotation.z=-time*1.6;(pool.material as THREE.MeshBasicMaterial).opacity=.45+.12*Math.sin(time*2.4);},dispose(){disposeGroup(group);grass.dispose();pathTex.dispose();swirl.dispose();}};
}
export const MANOR_POSITION=new THREE.Vector3(MANOR.x,0,MANOR.z);
