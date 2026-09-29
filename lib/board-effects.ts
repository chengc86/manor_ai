import * as THREE from 'three';
import {GeometryBatch} from './mesh-batch';
import {createProjectile} from './weapon-model';
import {glowPointsMaterial,scaledPoints} from './board-scenery';
import {glowTexture,petalTexture} from './board-textures';
import type {Weather,Lighting} from './board-theme';
/** Immediate-mode battle effects: each frame the scene asks for what should be visible; pools hide the rest. */
function bakeStatic(root:THREE.Object3D){
 const b=new GeometryBatch();root.updateMatrixWorld(true);
 root.traverse(o=>{const m=o as THREE.Mesh;if(m.isMesh)b.add(m.geometry,m.matrixWorld,(m.material as THREE.MeshStandardMaterial).color);});
 root.traverse(o=>{const m=o as THREE.Mesh;if(m.isMesh){m.geometry.dispose();(m.material as THREE.Material).dispose();}});
 return b.build();
}
class Pool<T extends THREE.Object3D>{
 items:T[]=[];used=0;
 constructor(private parent:THREE.Object3D,private make:()=>T){}
 next(){if(this.used===this.items.length){const o=this.make();this.parent.add(o);this.items.push(o);}const o=this.items[this.used++];o.visible=true;return o;}
 finish(){for(let i=this.used;i<this.items.length;i++)this.items[i].visible=false;this.used=0;}
 dispose(){for(const o of this.items){o.removeFromParent();o.traverse(c=>{const m=c as THREE.Mesh;if(m.isMesh)(m.material as THREE.Material).dispose();});}}
}
/** Many additive dots (sparks, poofs, glints) in one draw call. */
export class GlowPoints{
 points:THREE.Points;private pos:Float32Array;private size:Float32Array;private tint:Float32Array;private count=0;
 constructor(private capacity:number,map:THREE.Texture,parent:THREE.Object3D,additive=true){
  const g=new THREE.BufferGeometry();this.pos=new Float32Array(capacity*3);this.size=new Float32Array(capacity);this.tint=new Float32Array(capacity*4);
  g.setAttribute('position',new THREE.BufferAttribute(this.pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('size',new THREE.BufferAttribute(this.size,1).setUsage(THREE.DynamicDrawUsage));g.setAttribute('tint',new THREE.BufferAttribute(this.tint,4).setUsage(THREE.DynamicDrawUsage));
  this.points=scaledPoints(g,glowPointsMaterial(map,additive));this.points.renderOrder=6;parent.add(this.points);
 }
 add(x:number,y:number,z:number,size:number,colour:THREE.Color,alpha=1){if(this.count>=this.capacity)return;const i=this.count++;this.pos.set([x,y,z],i*3);this.size[i]=size;this.tint.set([colour.r,colour.g,colour.b,alpha],i*4);}
 finish(){const g=this.points.geometry;g.setDrawRange(0,this.count);for(const k of ['position','size','tint'])(g.attributes[k] as THREE.BufferAttribute).needsUpdate=true;this.count=0;}
 dispose(){this.points.geometry.dispose();(this.points.material as THREE.Material).dispose();this.points.removeFromParent();}
}
const tmpV=new THREE.Vector3(),tmpQ=new THREE.Quaternion(),tmpS=new THREE.Vector3(),tmpM=new THREE.Matrix4(),right=new THREE.Vector3();
/** Health bars as camera-facing instanced quads: two draw calls for every monster on the path. */
class Bars{
 back:THREE.InstancedMesh;fill:THREE.InstancedMesh;private n=0;
 constructor(capacity:number,parent:THREE.Object3D){
  const g=new THREE.PlaneGeometry(1,1),make=(m:THREE.Material,order:number)=>{const mesh=new THREE.InstancedMesh(g,m,capacity);mesh.frustumCulled=false;mesh.renderOrder=order;mesh.count=0;parent.add(mesh);return mesh;};
  this.back=make(new THREE.MeshBasicMaterial({color:0x2d1f38,transparent:true,opacity:.85,depthTest:false,depthWrite:false}),20);
  this.fill=make(new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,depthWrite:false,transparent:true}),21);
  this.fill.setColorAt(0,new THREE.Color());
 }
 add(camera:THREE.Camera,pos:THREE.Vector3,width:number,fraction:number,colour:THREE.Color){
  if(this.n>=this.back.instanceMatrix.count)return;const i=this.n++;
  this.back.setMatrixAt(i,tmpM.compose(pos,camera.quaternion,tmpS.set(width+.05,.11,1)));
  right.set(1,0,0).applyQuaternion(camera.quaternion);const w=Math.max(.001,width*fraction);
  tmpV.copy(pos).addScaledVector(right,-width/2+w/2);this.fill.setMatrixAt(i,tmpM.compose(tmpV,camera.quaternion,tmpS.set(w,.065,1)));this.fill.setColorAt(i,colour);
 }
 finish(){this.back.count=this.fill.count=this.n;this.back.instanceMatrix.needsUpdate=this.fill.instanceMatrix.needsUpdate=true;if(this.fill.instanceColor)this.fill.instanceColor.needsUpdate=true;this.n=0;}
 dispose(){for(const m of [this.back,this.fill]){m.geometry.dispose();(m.material as THREE.Material).dispose();m.removeFromParent();}}
}
export class BattleEffects{
 group=new THREE.Group();sparks:GlowPoints;bars:Bars;
 private projectileGeometry=new Map<string,THREE.BufferGeometry>();private projectiles=new Map<string,Pool<THREE.Mesh>>();
 private projectileMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5});
 private rings:Pool<THREE.Mesh>;private slashes:Pool<THREE.Mesh>;private ice:Pool<THREE.Mesh>;private goo:Pool<THREE.Mesh>;private marks:Pool<THREE.Mesh>;private crowns:Pool<THREE.Object3D>;
 private glow=glowTexture();
 constructor(parent:THREE.Object3D,crown:()=>THREE.Object3D){
  parent.add(this.group);this.sparks=new GlowPoints(900,this.glow,this.group);this.bars=new Bars(64,this.group);
  const ring=new THREE.RingGeometry(.82,1,40).rotateX(-Math.PI/2),slash=new THREE.RingGeometry(.35,.62,20,1,-Math.PI*.92,Math.PI*.84).rotateX(-Math.PI/2);// arc centred on local +z
  const basic=(c:number,o=1)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide});
  this.rings=new Pool(this.group,()=>{const m=new THREE.Mesh(ring,basic(0xffffff));m.renderOrder=5;return m;});
  this.slashes=new Pool(this.group,()=>{const m=new THREE.Mesh(slash,basic(0xffffff));m.renderOrder=5;return m;});
  const iceBox=new THREE.BoxGeometry(1,1,1);this.ice=new Pool(this.group,()=>{const m=new THREE.Mesh(iceBox,new THREE.MeshStandardMaterial({color:0xaeeaff,transparent:true,opacity:.42,roughness:.08,metalness:.1,depthWrite:false}));m.renderOrder=4;return m;});
  const disc=new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2);this.goo=new Pool(this.group,()=>{const m=new THREE.Mesh(disc,basic(0x9bdc5a,.55));m.renderOrder=1;return m;});
  const reticle=new GeometryBatch(),arc=new THREE.RingGeometry(.3,.36,28).rotateX(-Math.PI/2),tick=new THREE.PlaneGeometry(.06,.16).rotateX(-Math.PI/2);
  reticle.add(arc,new THREE.Matrix4(),0xffffff);for(let i=0;i<4;i++)reticle.add(tick,new THREE.Matrix4().makeRotationY(i*Math.PI/2).multiply(new THREE.Matrix4().makeTranslation(0,0,.4)),0xffffff);
  const reticleGeometry=reticle.build();this.marks=new Pool(this.group,()=>{const m=new THREE.Mesh(reticleGeometry,new THREE.MeshBasicMaterial({color:0xff7fbf,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));m.renderOrder=6;return m;});
  this.crowns=new Pool(this.group,crown);
 }
 projectile(weapon:string,position:THREE.Vector3,direction:THREE.Vector3,spin:number,scale=1){
  let pool=this.projectiles.get(weapon);
  if(!pool){let g=this.projectileGeometry.get(weapon);if(!g){g=bakeStatic(createProjectile(weapon));this.projectileGeometry.set(weapon,g);}const geometry=g;pool=new Pool(this.group,()=>{const m=new THREE.Mesh(geometry,this.projectileMaterial);m.castShadow=false;return m;});this.projectiles.set(weapon,pool);}
  const m=pool.next();m.position.copy(position);m.quaternion.setFromUnitVectors(tmpV.set(0,0,1),direction);if(spin)m.quaternion.multiply(tmpQ.setFromAxisAngle(tmpV.set(0,0,1),spin));m.scale.setScalar(scale);
 }
 ring(position:THREE.Vector3,radius:number,colour:THREE.Color,opacity:number){const m=this.rings.next();m.position.copy(position);m.scale.setScalar(radius);const mat=m.material as THREE.MeshBasicMaterial;mat.color.copy(colour);mat.opacity=opacity;}
 slash(position:THREE.Vector3,yaw:number,size:number,colour:THREE.Color,opacity:number){const m=this.slashes.next();m.position.copy(position);m.rotation.set(0,yaw,0);m.scale.setScalar(size);const mat=m.material as THREE.MeshBasicMaterial;mat.color.copy(colour);mat.opacity=opacity;}
 frozen(position:THREE.Vector3,size:number){const m=this.ice.next();m.position.copy(position);m.position.y+=size*.45;m.scale.set(size*.95,size*.95,size*.95);}
 slowed(position:THREE.Vector3,size:number){const m=this.goo.next();m.position.set(position.x,.03,position.z);m.scale.setScalar(size*.55);}
 marked(position:THREE.Vector3,time:number){const m=this.marks.next();m.position.copy(position);m.rotation.y=time*2;}
 crown(position:THREE.Vector3,yaw:number,scale:number){const c=this.crowns.next();c.position.copy(position);c.rotation.y=yaw;c.scale.setScalar(scale);}
 finish(){for(const p of this.projectiles.values())p.finish();for(const p of [this.rings,this.slashes,this.ice,this.goo,this.marks,this.crowns])(p as Pool<THREE.Object3D>).finish();this.sparks.finish();this.bars.finish();}
 dispose(){for(const p of this.projectiles.values())p.dispose();for(const g of this.projectileGeometry.values())g.dispose();for(const p of [this.rings,this.slashes,this.ice,this.goo,this.marks])(p as Pool<THREE.Object3D>).dispose();this.crowns.dispose();this.sparks.dispose();this.bars.dispose();this.projectileMaterial.dispose();this.glow.dispose();this.group.removeFromParent();}
}
/* ---------------------------------------------------------------- weather */
const AREA={x0:-5,x1:29,z0:-6,z1:22,top:9};
export class WeatherEffects{
 group=new THREE.Group();private dots?:GlowPoints;private rain?:THREE.LineSegments;private beams:THREE.Mesh[]=[];
 private seeds:Float32Array;private texture:THREE.Texture;private count:number;
 constructor(parent:THREE.Object3D,private kind:Weather,private lighting:Lighting){
  parent.add(this.group);
  this.count=kind==='rain'?420:kind==='lanterns'?30:kind==='motes'||kind==='sunbeams'?140:150;
  this.seeds=Float32Array.from({length:this.count*4},(_,i)=>{const s=Math.sin(i*91.7+kind.length*13.1)*43758.5453;return s-Math.floor(s);});
  this.texture=kind==='petals'||kind==='leaves'?petalTexture():glowTexture();
  if(kind==='rain'){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(this.count*6),3).setUsage(THREE.DynamicDrawUsage));this.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xd6e6f2,transparent:true,opacity:.5,depthWrite:false}));this.rain.frustumCulled=false;this.group.add(this.rain);}
  else this.dots=new GlowPoints(this.count,this.texture,this.group,kind==='motes'||kind==='sunbeams'||kind==='lanterns');
  if(kind==='sunbeams'){const g=new THREE.PlaneGeometry(2.2,16);const alpha=glowTexture();for(let i=0;i<5;i++){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xfff0c8,map:alpha,transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
   m.position.set(2+i*5.2,4,3+i*2.6);m.rotation.set(0,lighting.sunAzimuth,.5);m.renderOrder=7;this.group.add(m);this.beams.push(m);}}
 }
 update(time:number,enabled:boolean){
  this.group.visible=enabled;if(!enabled)return;
  const {x0,x1,z0,z1,top}=AREA,s=this.seeds,c=new THREE.Color();
  if(this.rain){const pos=this.rain.geometry.attributes.position as THREE.BufferAttribute;for(let i=0;i<this.count;i++){const fall=(s[i*4+3]*top+time*13*(0.8+s[i*4+2]*.4))%top,y=top-fall,x=x0+s[i*4]*(x1-x0)+fall*.12,z=z0+s[i*4+1]*(z1-z0);pos.setXYZ(i*2,x,y,z);pos.setXYZ(i*2+1,x-.05,y+.45,z);}pos.needsUpdate=true;return;}
  for(const [i,b] of this.beams.entries())(b.material as THREE.MeshBasicMaterial).opacity=.06+.04*Math.sin(time*.4+i*1.7);
  const dots=this.dots!;
  for(let i=0;i<this.count;i++){
   const a=s[i*4],b=s[i*4+1],r=s[i*4+2],phase=s[i*4+3];let x=x0+a*(x1-x0),z=z0+b*(z1-z0),y:number,size:number,alpha=1;
   if(this.kind==='lanterns'){y=((phase*top+time*.35*(0.6+r))%top);x+=Math.sin(time*.5+i)*.4;size=.5+r*.25;alpha=Math.min(1,y*.8,(top-y)*.5);c.set(r>.5?0xffb45a:0xffd27a);}
   else if(this.kind==='motes'||this.kind==='sunbeams'){y=.6+((phase*5+Math.sin(time*.3+i)*.8)%5);x+=Math.sin(time*.2+i*1.3)*.6;z+=Math.cos(time*.17+i)*.6;size=.12+r*.12;alpha=.35+.35*Math.sin(time*1.5+i*2.1);c.set(this.lighting.glow?0xffe0a0:0xfff6d8);}
   else{const fall=(phase*top+time*(this.kind==='petals'?.55:.8)*(0.7+r*.6))%top;y=top-fall;x+=Math.sin(time*.8+i)*.8+fall*.3;z+=Math.cos(time*.6+i*.7)*.5;size=this.kind==='petals'?.16:.2;
    c.set(this.kind==='petals'?(r>.5?0xf9c9d8:0xfdf0f4):[0xe0913a,0xd9b23c,0x9ab84a,0xc0562f][Math.floor(r*4)]);alpha=Math.min(1,y*1.5);}
   dots.add(x,y,z,size,c,Math.max(0,alpha));
  }
  dots.finish();
 }
 dispose(){this.dots?.dispose();if(this.rain){this.rain.geometry.dispose();(this.rain.material as THREE.Material).dispose();}for(const b of this.beams){(b.material as THREE.MeshBasicMaterial).map?.dispose();(b.material as THREE.Material).dispose();}this.beams[0]?.geometry.dispose();this.texture.dispose();this.group.removeFromParent();}
}
