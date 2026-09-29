import * as THREE from 'three';
import {GeometryBatch,type Tint} from './mesh-batch';
/**
 * Scenery building blocks for the 3D battlefield. Everything is placed with unit primitives into shared batches,
 * so a whole chapter backdrop becomes a few meshes. Local frames face +z (towards the camera side of the board).
 */
export type V3=[number,number,number];
const BOX=new THREE.BoxGeometry(1,1,1),SPHERE=new THREE.SphereGeometry(.5,14,10),ICO=new THREE.IcosahedronGeometry(.5,1);
const CYL:Record<number,THREE.CylinderGeometry>={},CONE:Record<number,THREE.ConeGeometry>={};
const cyl=(n:number)=>CYL[n]??=new THREE.CylinderGeometry(.5,.5,1,n),cone=(n:number)=>CONE[n]??=new THREE.ConeGeometry(.5,1,n);
// Unit gable roof: ridge along x at y=1, eaves at z=±.5.
const PRISM=(()=>{
 const g=new THREE.BufferGeometry(),p=[-.5,0,.5, .5,0,.5, .5,1,0, -.5,1,0, .5,0,-.5, -.5,0,-.5, -.5,1,0, .5,1,0, -.5,0,-.5, -.5,0,.5, -.5,1,0, .5,0,.5, .5,0,-.5, .5,1,0];
 g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,11,12,13]);
 const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
})();
const hipCache=new Map<string,THREE.BufferGeometry>();
function hipRoof(w:number,d:number){
 // Hipped roof over a w×d base, unit height; ridge runs along the longer side.
 const key=`${w.toFixed(2)}x${d.toFixed(2)}`;if(hipCache.has(key))return hipCache.get(key)!;
 const hw=w/2,hd=d/2,r=Math.max(0,(w-d)/2),rz=Math.max(0,(d-w)/2);
 const a=[-hw,0,hd],b=[hw,0,hd],c=[hw,0,-hd],e=[-hw,0,-hd],r1=[-r,1,-rz],r2=[r,1,rz],r1b=[-r,1,rz],r2b=[r,1,-rz];
 const tris=w>=d?[a,b,r2,a,r2,r1b, c,e,r1,c,r1,r2b, e,a,r1b, b,c,r2]:[a,b,r2,c,e,r1, b,c,r2b,b,r2b,r2, e,a,r1b,e,r1b,r1];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tris.flat(),3));g.computeVertexNormals();hipCache.set(key,g);return g;
}
export type Halo={position:THREE.Vector3;colour:number;size:number};
export type TreeKind='round'|'conifer'|'blossom'|'poplar'|'willow'|'palm';
export type TreeSpot={x:number;z:number;kind:TreeKind;scale:number;tint?:number};
export type FlowerSpot={x:number;z:number;colour:number;y?:number};
export type WaterSpot={x:number;z:number;w:number;d:number};
const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),eu=new THREE.Euler(),vp=new THREE.Vector3(),vs=new THREE.Vector3();
export class Props{
 lit=new GeometryBatch();glow=new GeometryBatch();glass=new GeometryBatch();
 halos:Halo[]=[];trees:TreeSpot[]=[];flowers:FlowerSpot[]=[];waters:WaterSpot[]=[];
 /** Solid footprints (x, z, radius) that trees and other props should keep clear of. */
 blocked:[number,number,number][]=[];
 private base=new THREE.Matrix4();
 constructor(public night=false,public windowGlass=0x3f5d70){}
 at(x:number,z:number,ry:number,fn:()=>void,y=0){const prev=this.base.clone();this.base.multiply(new THREE.Matrix4().makeRotationY(ry).setPosition(x,y,z));fn();this.base.copy(prev);return this;}
 world(local:V3){return new THREE.Vector3(...local).applyMatrix4(this.base);}
 put(geometry:THREE.BufferGeometry,tint:Tint,pos:V3,scale:V3,rot:V3=[0,0,0],batch=this.lit){
  m4.compose(vp.set(pos[0],pos[1],pos[2]),q.setFromEuler(eu.set(rot[0],rot[1],rot[2])),vs.set(scale[0],scale[1],scale[2]));
  batch.add(geometry,this.base.clone().multiply(m4),tint);return this;
 }
 box(c:Tint,pos:V3,size:V3,rot?:V3,batch?:GeometryBatch){return this.put(BOX,c,pos,size,rot,batch);}
 cyl(c:Tint,pos:V3,r:number,h:number,n=12,rot?:V3,batch?:GeometryBatch){return this.put(cyl(n),c,pos,[r*2,h,r*2],rot,batch);}
 cone(c:Tint,pos:V3,r:number,h:number,n=8,rot?:V3){return this.put(cone(n),c,pos,[r*2,h,r*2],rot);}
 ball(c:Tint,pos:V3,size:V3,batch?:GeometryBatch){return this.put(SPHERE,c,pos,size,undefined,batch);}
 blob(c:Tint,pos:V3,size:V3){return this.put(ICO,c,pos,size);}
 gable(c:Tint,pos:V3,w:number,d:number,h:number,ry=0){return this.put(PRISM,c,pos,[w,h,d],[0,ry,0]);}
 hip(c:Tint,pos:V3,w:number,d:number,h:number){return this.put(hipRoof(w,d),c,pos,[1,h,1]);}
 pyramid(c:Tint,pos:V3,w:number,h:number,n=4){return this.put(cone(n),c,[pos[0],pos[1]+h/2,pos[2]],[w*1.414,h,w*1.414],[0,Math.PI/n,0]);}
 halo(local:V3,colour=0xffd27a,size=1.2){this.halos.push({position:this.world(local),colour,size});}
 block(x:number,z:number,r:number){const p=this.world([x,0,z]);this.blocked.push([p.x,p.z,r]);}
 /** A window on a wall facing +z (local), lit from inside at night. */
 window(x:number,y:number,z:number,w:number,h:number,frame=0xf6f2e8,arched=false){
  this.box(frame,[x,y,z+.012],[w+.07,h+.07,.03]);
  this.box(this.night?0xffd27a:this.windowGlass,[x,y,z+.03],[w,h,.02],undefined,this.night?this.glow:this.lit);
  if(arched)this.cyl(frame,[x,y+h/2,z+.02],w/2+.035,.04,10,[Math.PI/2,0,0]);
  this.box(frame,[x,y-h/2-.04,z+.04],[w+.12,.035,.06]);
  const p=this.world([x,y,z]);if(this.night&&hash(p.x*3.7+p.y*11.3+p.z*5.1)<.3)this.halo([x,y,z+.25],0xffc86a,.7);
 }
 /** Grid of windows on the face at local +z of a block `w` wide (floors from y0 upward). */
 facade(w:number,z:number,floors:number,cols:number,y0=.55,gap=.95,ww=.34,wh=.46,frame?:number,skip=-1,arched=false){
  for(let f=0;f<floors;f++)for(let i=0;i<cols;i++){if(f===0&&i===skip)continue;const x=cols===1?0:-w/2+w*(i+.5)/cols;this.window(x,y0+f*gap,z,ww,wh,frame,arched);}
 }
 door(x:number,z:number,colour=0x1f4a3c,w=.42,h=.72,frame=0xf6f2e8){this.box(frame,[x,h/2,z+.01],[w+.1,h+.06,.04]);this.box(colour,[x,h/2-.02,z+.03],[w,h,.03]);this.ball(0xd0a300,[x+w*.3,h*.45,z+.05],[.05,.05,.03]);}
 /** A house: walls, roof, chimneys and windows. Local frame: centre of the ground floor, front facing +z. */
 house(o:{w:number;d:number;h:number;wall:number;roof:number;roofH?:number;roofType?:'gable'|'hip'|'flat';floors?:number;cols?:number;sideCols?:number;door?:number;chimneys?:number;trim?:number;dormers?:number;base?:number}){
  const {w,d,h,wall,roof}=o,rh=o.roofH??Math.min(w,d)*.42,floors=o.floors??Math.max(1,Math.round(h/.95)),gap=h/floors,trim=o.trim??0xf6f2e8;
  this.box(o.base??0x8f8676,[0,.06,0],[w+.06,.12,d+.06]);this.box(wall,[0,h/2,0],[w,h,d]);
  this.box(trim,[0,h-.03,0],[w+.08,.06,d+.08]);
  if(o.roofType==='flat'){this.box(roof,[0,h+.06,0],[w+.1,.12,d+.1]);}
  else if(o.roofType==='gable')this.gable(roof,[0,h,0],w+.2,d+.24,rh);
  else this.hip(roof,[0,h,0],w+.2,d+.2,rh);
  const cols=o.cols??Math.max(1,Math.round(w/.9));this.facade(w,d/2,floors,cols,gap*.55,gap,.32,Math.min(.46,gap*.5),trim,o.door===undefined?-1:Math.floor(cols/2));
  const side=o.sideCols??Math.max(1,Math.round(d/1.1));
  for(const s of [-1,1])this.at(s*w/2,0,s*Math.PI/2,()=>this.facade(d,0,floors,side,gap*.55,gap,.3,Math.min(.44,gap*.5),trim));
  if(o.door!==undefined)this.door(0,d/2,o.door);
  for(let i=0;i<(o.chimneys??0);i++){const x=(i%2?1:-1)*w*.32;this.box(0xa4563d,[x,h+rh*.75,-d*.12],[.24,rh*.9,.24]);this.box(0x7a4030,[x,h+rh*1.22,-d*.12],[.3,.06,.3]);}
  for(let i=0;i<(o.dormers??0);i++){const x=-w/2+w*(i+.5)/o.dormers!;this.box(wall,[x,h+rh*.3,d*.2],[.34,.34,.3]);this.gable(roof,[x,h+rh*.47,d*.2],.44,.4,.2,0);this.window(x,h+rh*.28,d*.2+.15,.2,.22,trim);}
  this.block(0,0,Math.hypot(w,d)/2);
 }
 /** Crenellated parapet along the top of a w×d block at height h. */
 crenel(w:number,d:number,h:number,c:number){const step=.3;for(let x=-w/2+step/2;x<w/2;x+=step*2){this.box(c,[x,h+.1,d/2],[step,.2,.12]);this.box(c,[x,h+.1,-d/2],[step,.2,.12]);}for(let z=-d/2+step/2;z<d/2;z+=step*2){this.box(c,[w/2,h+.1,z],[.12,.2,step]);this.box(c,[-w/2,h+.1,z],[.12,.2,step]);}}
 tower(o:{r:number;h:number;wall:number;roof:number;cap?:'spire'|'cone'|'crenel'|'dome'|'lantern';square?:boolean}){
  const {r,h,wall,roof}=o;
  if(o.square){this.box(wall,[0,h/2,0],[r*2,h,r*2]);for(let f=1;f<h/1.1;f++)for(let s=0;s<4;s++)this.at(0,0,s*Math.PI/2,()=>this.window(0,f*1.05,r,.2,.4,0xe9e1cc,true));}
  else{this.cyl(wall,[0,h/2,0],r,h,12);for(let f=1;f<h/1.1;f++)for(let s=0;s<4;s++)this.at(0,0,s*Math.PI/2+.4,()=>this.window(0,f*1.05,r*.97,.18,.36,0xe9e1cc,true));}
  if(o.cap==='spire')this.pyramid(roof,[0,h,0],r*1.9,r*5,o.square?4:8);
  else if(o.cap==='cone')this.cone(roof,[0,h+r*.9,0],r*1.15,r*1.8,12);
  else if(o.cap==='dome'){this.put(new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2),roof,[0,h,0],[r*2.1,r*2.2,r*2.1]);this.cyl(wall,[0,h+r*1.2,0],r*.2,r*.5,8);}
  else if(o.cap==='lantern'){this.cyl(wall,[0,h+.25,0],r*.6,.5,8);this.cone(roof,[0,h+.8,0],r*.7,.6,8);}
  else if(o.square)this.crenel(r*2,r*2,h,wall);else for(let i=0;i<10;i++){const a=i/10*Math.PI*2;this.box(wall,[Math.cos(a)*r*.92,h+.1,Math.sin(a)*r*.92],[.18,.2,.18],[0,-a,0]);}
  this.block(0,0,r+.2);
 }
 /** A classical temple front: steps, columns and pediment across width w at local z. */
 portico(w:number,z:number,h:number,stone:number,cols=6){
  for(let s=0;s<3;s++)this.box(stone,[0,.06+s*.12,z+.5-s*.16],[w+.6-s*.2,.12,1.1-s*.32]);
  for(let i=0;i<cols;i++){const x=-w/2+w*(i+.5)/cols;this.cyl(0xf3eee2,[x,.36+h/2,z+.45],.13,h,10);this.box(stone,[x,.4+h,z+.45],[.34,.1,.34]);}
  this.box(stone,[0,.45+h+.1,z+.45],[w+.2,.2,.5]);this.gable(stone,[0,.55+h+.1,z+.45],w+.3,.55,.55);
 }
 dome(r:number,drum:number,stone:number,copper:number){
  this.cyl(stone,[0,.3,0],r+.5,.6,20);this.cyl(stone,[0,.6+drum/2,0],r,drum,20);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;this.cyl(0xf3eee2,[Math.cos(a)*(r+.12),.6+drum/2,Math.sin(a)*(r+.12)],.08,drum*.92,8);}
  for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;this.at(Math.cos(a)*r*.99,Math.sin(a)*r*.99,-a+Math.PI/2,()=>this.window(0,.6+drum*.55,0,.26,.5,0xf3eee2,true));}
  this.cyl(stone,[0,.6+drum+.12,0],r+.15,.24,20);
  this.put(new THREE.SphereGeometry(.5,20,10,0,Math.PI*2,0,Math.PI/2),copper,[0,.6+drum+.24,0],[r*2,r*1.7,r*2]);
  this.cyl(stone,[0,.6+drum+.24+r*.85+.2,0],r*.18,.4,10);this.cone(copper,[0,.6+drum+r*.85+.95,0],r*.2,.35,10);
  this.block(0,0,r+.6);
 }
 wall(x1:number,z1:number,x2:number,z2:number,h:number,c:number,pillarEvery=0,lamps=false){
  const len=Math.hypot(x2-x1,z2-z1),a=Math.atan2(x2-x1,z2-z1);
  for(let s=0;s<=len;s+=1)this.blocked.push([x1+(x2-x1)*s/Math.max(len,.01),z1+(z2-z1)*s/Math.max(len,.01),.45]);
  this.at(x1,z1,a,()=>{this.box(c,[0,h/2,len/2],[.18,h,len]);this.box(0xd9cfbd,[0,h+.03,len/2],[.24,.06,len+.02]);
   if(pillarEvery)for(let s=0;s<=len+.01;s+=pillarEvery){this.box(c,[0,(h+.3)/2,s],[.32,h+.3,.32]);this.box(0xd9cfbd,[0,h+.33,s],[.38,.06,.38]);if(lamps){this.box(0x2b2f2c,[0,h+.52,s],[.14,.3,.14]);this.box(this.night?0xffd27a:0xe8dcb0,[0,h+.52,s],[.1,.2,.1],undefined,this.night?this.glow:this.lit);if(this.night)this.halo([0,h+.55,s],0xffc070,1.3);}}});
 }
 fence(x1:number,z1:number,x2:number,z2:number,c=0xf6f2e8,h=.34){const len=Math.hypot(x2-x1,z2-z1),a=Math.atan2(x2-x1,z2-z1);this.at(x1,z1,a,()=>{for(let s=0;s<=len;s+=.2)this.box(c,[0,h/2,s],[.05,h,.04]);this.box(c,[0,h*.7,len/2],[.03,.04,len]);this.box(c,[0,h*.3,len/2],[.03,.04,len]);});}
 railing(x1:number,z1:number,x2:number,z2:number,c=0x2b3a33,h=.5){const len=Math.hypot(x2-x1,z2-z1),a=Math.atan2(x2-x1,z2-z1);this.at(x1,z1,a,()=>{for(let s=0;s<=len;s+=.14)this.box(c,[0,h/2,s],[.025,h,.025]);this.box(c,[0,h,len/2],[.04,.04,len]);});}
 hedge(x1:number,z1:number,x2:number,z2:number,h=.42,w=.42,c=0x3f7a3a){const len=Math.hypot(x2-x1,z2-z1),a=Math.atan2(x2-x1,z2-z1);this.at(x1,z1,a,()=>{this.box(c,[0,h/2,len/2],[w,h,len]);for(let s=.2;s<len;s+=.5)this.blob(c,[0,h,s],[w*.9,.18,.5]);});}
 lamp(x:number,z:number,h=1.3){this.at(x,z,0,()=>{this.cyl(0x2b2f2c,[0,h/2,0],.035,h,6);this.box(0x2b2f2c,[0,h+.02,0],[.16,.04,.16]);this.box(this.night?0xffd27a:0xefe7c4,[0,h+.13,0],[.12,.18,.12],undefined,this.night?this.glow:this.lit);this.pyramid(0x2b2f2c,[0,h+.22,0],.18,.1);if(this.night)this.halo([0,h+.13,0],0xffc070,1.5);});}
 bench(x:number,z:number,ry=0){this.at(x,z,ry,()=>{this.box(0x8a5a33,[0,.22,0],[.7,.05,.22]);this.box(0x8a5a33,[0,.38,-.1],[.7,.18,.04]);for(const s of [-.3,.3])this.box(0x33322f,[s,.11,0],[.05,.22,.2]);});}
 stall(x:number,z:number,ry:number,stripe:number){this.at(x,z,ry,()=>{this.box(0x8a5a33,[0,.3,0],[1,.6,.55]);for(const [sx,sz] of [[-.47,-.25],[.47,-.25],[-.47,.25],[.47,.25]])this.box(0x6b4526,[sx,.55,sz],[.05,1.1,.05]);for(let i=0;i<5;i++)this.box(i%2?0xfdfaf2:stripe,[-.4+i*.2,1.12,0],[.2,.05,.72],[.25,0,0]);for(let i=0;i<4;i++)this.ball([0xe8513a,0xf2c94c,0x8cc152,0xf29ab4][i],[-.33+i*.22,.66,.08],[.16,.1,.16]);});this.block(x,z,.7);}
 bunting(x1:number,z1:number,x2:number,z2:number,h:number){const len=Math.hypot(x2-x1,z2-z1),a=Math.atan2(x2-x1,z2-z1),colours=[0xe8513a,0xf2c94c,0x4a90d9,0x8cc152,0xf29ab4,0xfdfaf2];
  this.at(x1,z1,a,()=>{for(const s of [0,len]){this.cyl(0x6b4526,[0,h/2,s],.04,h,6);}const n=Math.floor(len/.35);for(let i=0;i<n;i++){const s=(i+.5)*len/n,sag=Math.sin(Math.PI*s/len)*.35;this.put(cone(3),colours[i%colours.length],[0,h-sag-.12,s],[.04,.22,.22],[Math.PI,0,0]);}this.box(0x6b4526,[0,h-.02,len/2],[.015,.015,len]);});}
 tent(x:number,z:number,ry:number,c:number){this.at(x,z,ry,()=>{this.gable(c,[0,0,0],1.1,1.2,.8,Math.PI/2);this.gable(0x3b2a1e,[0,0,.52],.4,.08,.55,Math.PI/2);this.cyl(0x6b4526,[0,.55,.62],.02,1.1,5);});this.block(x,z,.8);}
 campfire(x:number,z:number){this.at(x,z,0,()=>{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;this.box(0x6b4526,[Math.cos(a)*.14,.05,Math.sin(a)*.14],[.28,.07,.07],[0,-a,0]);this.ball(0x8a8a82,[Math.cos(a+.6)*.3,.05,Math.sin(a+.6)*.3],[.12,.08,.12]);}this.cone(0xffa640,[0,.22,0],.1,.34,6,undefined);this.cone(0xffe27a,[0,.18,0],.05,.2,6);this.halo([0,.3,0],0xffa24a,1.6);});}
 flag(x:number,z:number,h:number,c1:number,c2:number){this.at(x,z,0,()=>{this.cyl(0xe6e1d6,[0,h/2,0],.035,h,6);this.box(c1,[.3,h-.2,0],[.56,.34,.02]);this.box(c2,[.3,h-.2,.012],[.56,.08,.01]);this.ball(0xd0a300,[0,h+.04,0],[.07,.07,.07]);});}
 gazebo(x:number,z:number,c=0xf6f2e8,roof=0xb0553a){this.at(x,z,0,()=>{this.cyl(0xcfc6b2,[0,.05,0],.95,.1,8);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;this.cyl(c,[Math.cos(a)*.8,.55,Math.sin(a)*.8],.04,1,6);}this.cone(roof,[0,1.3,0],1.05,.65,8);this.ball(0xd0a300,[0,1.66,0],[.1,.12,.1]);});this.block(x,z,1.1);}
 court(x:number,z:number,w:number,d:number){this.at(x,z,0,()=>{this.box(0x4d7f6a,[0,.02,0],[w+.8,.04,d+.8]);this.box(0x5b87b3,[0,.03,0],[w,.04,d]);const line=(px:number,pz:number,sx:number,sz:number)=>this.box(0xf6f2e8,[px,.052,pz],[sx,.01,sz]);line(0,d/2,w,.05);line(0,-d/2,w,.05);line(w/2,0,.05,d);line(-w/2,0,.05,d);line(0,0,.04,d*.55);line(0,d*.27,w,.04);line(0,-d*.27,w,.04);
  this.box(0x2b3a33,[0,.25,0],[w+.1,.02,.02]);this.box(0xf6f2e8,[0,.26,0],[w+.1,.14,.012]);for(const s of [-1,1])this.cyl(0x2b3a33,[s*(w/2+.05),.2,0],.025,.4,6);
  for(const [px,pz,len,a] of [[-w/2-.4,-d/2-.4,w+.8,Math.PI/2],[-w/2-.4,-d/2-.4,d+.8,0],[w/2+.4,-d/2-.4,d+.8,0]] as const)this.at(px,pz,a,()=>{for(let s=0;s<=len;s+=1)this.cyl(0x2b3a33,[0,.45,s],.025,.9,6);this.box(0x3f6b55,[0,.45,len/2],[.01,.85,len]);});});this.block(x,z,Math.max(w,d)/2);}
 slide(x:number,z:number,ry=0){this.at(x,z,ry,()=>{for(const [sx,sz] of [[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]])this.cyl(0xe8513a,[sx,.5,sz-.6],.035,1,6);this.box(0xf2c94c,[0,1,-.6],[.6,.06,.6]);this.box(0x4a90d9,[0,.55,.25],[.42,.05,1.35],[.62,0,0]);for(let i=0;i<5;i++)this.box(0xe8513a,[0,.18+i*.19,-.95],[.5,.04,.05]);});this.block(x,z,1);}
 swings(x:number,z:number,ry=0){this.at(x,z,ry,()=>{for(const s of [-1,1]){this.box(0x4a90d9,[s*.8,.6,-.25],[.06,1.3,.06],[.25,0,0]);this.box(0x4a90d9,[s*.8,.6,.25],[.06,1.3,.06],[-.25,0,0]);}this.box(0x4a90d9,[0,1.2,0],[1.7,.06,.06]);for(const s of [-.35,.35]){this.box(0x7a7f85,[s-.12,.75,0],[.015,.85,.015]);this.box(0x7a7f85,[s+.12,.75,0],[.015,.85,.015]);this.box(0xf2c94c,[s,.32,0],[.32,.04,.16]);}});this.block(x,z,1);}
 climber(x:number,z:number){this.at(x,z,0,()=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++)this.cyl(0x8cc152,[-.45+i*.3,.45,-.45+j*.3],.025,.9,5);for(let k=1;k<4;k++){this.box(0xf2c94c,[0,k*.3,-.45],[.95,.03,.03]);this.box(0xf2c94c,[0,k*.3,.45],[.95,.03,.03]);this.box(0xf2c94c,[-.45,k*.3,0],[.03,.03,.95]);this.box(0xf2c94c,[.45,k*.3,0],[.03,.03,.95]);}});this.block(x,z,.8);}
 minibus(x:number,z:number,ry:number,c=0xf6f2e8){this.at(x,z,ry,()=>{this.box(c,[0,.45,0],[.9,.62,2]);this.box(0x00483a,[0,.36,0],[.92,.12,2.02]);this.box(c,[0,.8,.1],[.86,.2,1.7]);for(const s of [-1,1])for(let i=0;i<4;i++)this.box(this.windowGlass,[s*.455,.72,-.7+i*.42],[.02,.2,.32]);this.box(this.windowGlass,[0,.72,1.0],[.76,.26,.02]);for(const [sx,sz] of [[-.4,-.65],[.4,-.65],[-.4,.65],[.4,.65]])this.cyl(0x262826,[sx,.14,sz],.14,.12,10,[0,0,Math.PI/2]);});this.block(x,z,1.1);}
 boat(x:number,z:number,ry:number,c:number){this.at(x,z,ry,()=>{this.box(c,[0,.08,0],[.55,.22,1.5]);this.put(cone(4),c,[0,.08,.88],[.55*1.2,.3,.39],[Math.PI/2,Math.PI/4,0]);this.box(0x8a5a33,[0,.2,0],[.45,.03,1.3]);this.box(0xfdfaf2,[0,.34,-.2],[.4,.25,.5]);this.box(0x3f5d70,[0,.38,.06],[.36,.1,.02]);});}
 bridge(x:number,z:number,ry:number,len:number,w:number,stone=0xb9ad97){this.at(x,z,ry,()=>{const n=3;for(let i=0;i<n;i++){const s=-len/2+len*(i+.5)/n;this.box(stone,[0,.35,s],[w,.18,len/n+.02]);}this.box(stone,[0,.15,-len/2],[w+.2,.5,.4]);this.box(stone,[0,.15,len/2],[w+.2,.5,.4]);for(const sx of [-1,1]){this.box(stone,[sx*(w/2-.06),.55,0],[.12,.25,len]);}for(let i=1;i<n;i++){const s=-len/2+len*i/n;this.box(stone,[0,.05,s],[w,.6,.35]);}});}
 ruin(x:number,z:number,ry:number,stone=0xa9a79d){this.at(x,z,ry,()=>{for(const s of [-1,1]){this.box(stone,[s*.7,.9,0],[.34,1.8,.4]);this.box(stone,[s*.7,1.9,0],[.42,.2,.46]);}this.put(new THREE.TorusGeometry(.7,.16,6,12,Math.PI),stone,[0,1.9,0],[1,1,1.4]);this.box(stone,[1.4,.35,.1],[.9,.7,.36],[0,.2,0]);this.box(0x8f8d84,[-1.3,.12,.4],[.5,.24,.4],[0,.5,0]);this.blob(0x5a8a45,[.7,1.95,0],[.4,.2,.4]);});this.block(x,z,1.5);}
 glasshouse(x:number,z:number,w:number,d:number,h:number,ry=0){this.at(x,z,ry,()=>{this.box(0xe9e5dc,[0,.12,0],[w,.24,d]);
  this.box(0xcfe8e4,[0,.24+h/2,0],[w-.06,h,d-.06],undefined,this.glass);this.glassGable([0,.24+h,0],w,d,h*.6);
  for(let s=0;s<=w+.01;s+=.5){this.box(0xf6f2e8,[-w/2+s,.24+h/2,d/2],[.04,h,.04]);this.box(0xf6f2e8,[-w/2+s,.24+h/2,-d/2],[.04,h,.04]);}
  this.box(0xf6f2e8,[0,.24+h,d/2],[w,.05,.05]);this.box(0xf6f2e8,[0,.24+h,-d/2],[w,.05,.05]);this.box(0xf6f2e8,[0,.24+h*1.6,0],[w+.04,.05,.06]);});this.block(x,z,Math.max(w,d)/2);}
 /** Adds a transparent roof so gable() output can be used in the glass batch. */
 glassGable(pos:V3,w:number,d:number,h:number){this.put(PRISM,0xcfe8e4,pos,[w,h,d],[0,0,0],this.glass);}
 fountain(x:number,z:number){this.at(x,z,0,()=>{this.cyl(0xcfc6b2,[0,.15,0],.9,.3,16);this.cyl(0x5aa9d6,[0,.28,0],.8,.04,16,undefined,this.glass);this.cyl(0xcfc6b2,[0,.55,0],.12,.6,8);this.cyl(0xcfc6b2,[0,.85,0],.4,.08,12);this.ball(0x9ad8ff,[0,1,0],[.12,.25,.12],this.glass);});this.block(x,z,1);}
 totem(x:number,z:number){this.at(x,z,0,()=>{const cs=[0xb5654a,0x2f6b8f,0xe0b04a,0x3f7a3a,0xb5654a];for(let i=0;i<5;i++){this.cyl(cs[i],[0,.3+i*.55,0],.3,.55,10);this.box(0xfdfaf2,[-.12,.38+i*.55,.28],[.1,.08,.06]);this.box(0xfdfaf2,[.12,.38+i*.55,.28],[.1,.08,.06]);this.box(0x2b2320,[0,.22+i*.55,.3],[.24,.05,.04]);}this.box(0xe0b04a,[0,2.6,0],[1.4,.12,.3]);this.cone(0xb5654a,[0,2.95,0],.25,.4,6);});this.block(x,z,.6);}
 dinosaur(x:number,z:number,ry:number){const bone=0xf1e8d2;this.at(x,z,ry,()=>{this.box(0x8f8676,[0,.1,0],[1.2,.2,2.8]);for(const s of [-1,1]){this.cyl(bone,[s*.25,.75,.2],.07,1.1,6,[.25,0,0]);this.cyl(bone,[s*.25,.35,.45],.06,.7,6,[-.4,0,0]);}
  for(let i=0;i<9;i++){const zz=1.2-i*.3,y=1.35+Math.sin(i*.4)*.15-(i>5?(i-5)*.18:0);this.ball(bone,[0,y,zz],[.16,.14,.16]);this.put(new THREE.TorusGeometry(.22,.025,4,12,Math.PI),bone,[0,y-.1,zz],[1,1.2,1],[0,Math.PI/2,Math.PI]);}
  this.ball(bone,[0,1.75,1.55],[.3,.26,.44]);this.box(bone,[0,1.6,1.8],[.22,.08,.3]);this.box(0x2b2320,[.1,1.82,1.62],[.04,.06,.06]);this.box(0x2b2320,[-.1,1.82,1.62],[.04,.06,.06]);});this.block(x,z,1.5);}
 orrery(x:number,z:number){this.at(x,z,0,()=>{this.cyl(0x5a4a3a,[0,.35,0],.12,.7,8);this.cyl(0x8f7a5a,[0,.05,0],.5,.1,12);this.ball(0xf2c94c,[0,1.3,0],[.36,.36,.36]);
  for(const [r,a,b] of [[.62,0,0],[.62,Math.PI/2,0],[.72,Math.PI/2,Math.PI/3]] as const)this.put(new THREE.TorusGeometry(r,.025,5,32),0xc9a04a,[0,1.3,0],[1,1,1],[a,b,0]);
  this.ball(0x4a90d9,[.72,1.3,0],[.12,.12,.12]);this.ball(0xe8513a,[0,1.3,.62],[.09,.09,.09]);});this.block(x,z,.9);}
 water(x:number,z:number,w:number,d:number){const p=this.world([x,0,z]);this.waters.push({x:p.x,z:p.z,w,d});}
 /** A low clipped planting strip with flowers on top. */
 flowerBed(x:number,z:number,w:number,d:number,colours:number[],leaf=0x4f8a3c){
  this.box(0x9a9286,[x,.03,z],[w+.08,.06,d+.08]);this.box(leaf,[x,.1,z],[w,.14,d]);for(let s=.25;s<w;s+=.45)this.blob(leaf,[x-w/2+s,.17,z],[.36,.12,Math.min(.36,d)]);
  const n=Math.round(w*d*9);for(let i=0;i<n;i++){const p=this.world([x+(hash(i*3.1+x)-.5)*w*.92,0,z+(hash(i*7.7+z)-.5)*d*.85]);this.flowers.push({x:p.x,z:p.z,colour:colours[i%colours.length],y:.2});}
 }
 tree(x:number,z:number,kind:TreeKind='round',scale=1,tint?:number){const p=this.world([x,0,z]);this.trees.push({x:p.x,z:p.z,kind,scale,tint});}
}
export function hash(n:number){const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);}
