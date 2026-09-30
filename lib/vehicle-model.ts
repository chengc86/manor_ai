import * as THREE from 'three';
import {Kit,type V3,slab,softBox,roundedRect,taperedTube,shade} from './hero-kit';
import {vehicle,paint,type RidePose} from './vehicles';
/**
 * Toy-sized 3D rides, built from the same soft shapes as the heroes and to the same scale (a hero is about 2.3 tall,
 * facing +z). Each ride says where the hero stands or sits (`mount`) and how (`pose`). Wheels spin when riding.
 */
export type VehicleModel={root:THREE.Group;mount:V3;pose:RidePose;animate(t:number,moving:boolean,enabled?:boolean):void;dispose():void};
const TYRE=0x2c2d31,METAL=0xc8cdd2,CREAM=0xfbf3e4,DARK=0x3a3d44,SEAT=0x40363a;
type Build={kit:Kit;root:THREE.Group;wheels:THREE.Object3D[];colour:number;light:number;dark:number};
const cyl=(kit:Kit,seg=20)=>kit.shared(`vcyl${seg}`,()=>new THREE.CylinderGeometry(1,1,1,seg));
/** A wheel: tyre, hub and a little cap, spinning about x. */
function wheel(b:Build,at:V3,r:number,width:number,hub=b.light,parent:THREE.Object3D=b.root){
 const g=new THREE.Group();g.position.set(...at);parent.add(g);b.wheels.push(g);
 b.kit.mesh(g,b.kit.shared('tyre',()=>new THREE.TorusGeometry(1,.42,10,28)),TYRE,'skin',[0,0,0],[r*.72,r*.72,width*1.6],[0,Math.PI/2,0]);
 b.kit.mesh(g,cyl(b.kit),hub,'plastic',[0,0,0],[r*.62,width*.9,r*.62],[0,0,Math.PI/2]);
 b.kit.mesh(g,cyl(b.kit,10),METAL,'metal',[0,0,0],[r*.22,width*1.05,r*.22],[0,0,Math.PI/2]);
 return g;
}
/** A tube between points (frames, stems, ladders). */
function rod(b:Build,points:V3[],radius:number,colour:number,finish:'metal'|'plastic'='metal'){return b.kit.mesh(b.root,b.kit.own(taperedTube(points,()=>radius,Math.max(2,points.length*4),8)),colour,finish);}
function box(b:Build,size:V3,at:V3,colour:number,round=.08,finish:'plastic'|'cloth'|'metal'='plastic',rot:V3=[0,0,0]){return b.kit.mesh(b.root,softBox(b.kit,size[0],size[1],size[2],round),colour,finish,at,[1,1,1],rot);}
function steering(b:Build,at:V3,tilt=-1.1,r=.15){b.kit.mesh(b.root,b.kit.shared('sw',()=>new THREE.TorusGeometry(1,.16,8,24)),DARK,'plastic',at,[r,r,r],[tilt,0,0]);b.kit.mesh(b.root,cyl(b.kit,10),METAL,'metal',at,[.035,.02,.035],[tilt+Math.PI/2,0,0]);}
function handlebar(b:Build,at:V3,width=.62,grip=DARK){b.kit.mesh(b.root,cyl(b.kit,10),METAL,'metal',at,[.025,width,.025],[0,0,Math.PI/2]);for(const s of [-1,1])b.kit.mesh(b.root,cyl(b.kit,10),grip,'plastic',[at[0]+s*width*.42,at[1],at[2]],[.04,width*.2,.04],[0,0,Math.PI/2]);}
function seatPad(b:Build,at:V3,size:V3,colour=SEAT){b.kit.ball(b.root,colour,at,size,'cloth');}
function light(b:Build,at:V3,r:number,colour=0xfff4c8){b.kit.ball(b.root,colour,at,[r,r,r*.5],'glow',[0,0,0],.5);}
/** A car body from its side outline (drawn in z, y), extruded across its width. */
function carBody(b:Build,outline:THREE.Shape,width:number,colour:number){
 const m=b.kit.mesh(b.root,b.kit.own(slab(outline,width-.16,.08,10,2)),colour,'plastic');m.rotation.y=-Math.PI/2;return m;
}
/** A rounded toy-car side: bonnet, a dip for the open seats, and a round boot. */
function toyCarOutline(){const s=new THREE.Shape();s.moveTo(-1.08,.2);s.lineTo(1.08,.2);s.quadraticCurveTo(1.22,.22,1.2,.42);s.quadraticCurveTo(1.16,.64,.9,.65);s.lineTo(.36,.66);s.quadraticCurveTo(.22,.66,.2,.52);s.lineTo(-.42,.52);s.quadraticCurveTo(-.46,.68,-.62,.69);s.lineTo(-.98,.7);s.quadraticCurveTo(-1.2,.68,-1.21,.44);s.quadraticCurveTo(-1.2,.21,-1.08,.2);return s;}
const BUILDERS:Record<string,(b:Build)=>{mount:V3}>={
 skateboard:b=>{
  // A slim deck with turned-up ends, grip tape on top and chunky bright wheels.
  b.kit.mesh(b.root,b.kit.shared('deck',()=>{const s=roundedRect(.5,1.5,.24);return slab(s,.03,.012,8,1);}),b.colour,'plastic',[0,.2,0],[1,1,1],[Math.PI/2,0,0]);
  b.kit.mesh(b.root,b.kit.shared('grip',()=>{const s=roundedRect(.44,1.36,.2);return slab(s,.01,.004,8,1);}),DARK,'cloth',[0,.222,0],[1,1,1],[Math.PI/2,0,0]);
  for(const z of [-1,1])b.kit.mesh(b.root,b.kit.shared('tail',()=>{const s=roundedRect(.5,.3,.2);return slab(s,.03,.012,8,1);}),b.colour,'plastic',[0,.24,z*.8],[1,1,1],[Math.PI/2-z*.45,0,0]);
  for(const z of [-.48,.48]){box(b,[.34,.05,.08],[0,.15,z],METAL,.02,'metal');for(const x of [-.2,.2])wheel(b,[x,.09,z],.09,.08,0xf6e27a);}
  return {mount:[0,.235,0]};
 },
 scooter:b=>{
  box(b,[.34,.07,1.0],[0,.16,-.08],b.colour,.14);box(b,[.3,.02,.84],[0,.2,-.1],DARK,.1,'cloth');
  wheel(b,[0,.12,-.58],.12,.08,CREAM);wheel(b,[0,.12,.52],.12,.08,CREAM);b.kit.mesh(b.root,b.kit.shared('fender',()=>new THREE.TorusGeometry(.15,.035,6,16,Math.PI)),b.colour,'plastic',[0,.14,-.58],[1,1,1],[0,Math.PI/2,0]);
  rod(b,[[0,.14,.52],[0,.7,.36],[0,1.14,.2]],.035,b.colour,'plastic');handlebar(b,[0,1.14,.2],.62);light(b,[0,.9,.33],.05);
  return {mount:[0,.21,-.14]};
 },
 tricycle:b=>{
  wheel(b,[0,.36,.5],.36,.12,b.light);for(const x of [-.36,.36])wheel(b,[x,.2,-.42],.2,.1,b.light);
  rod(b,[[0,.36,.5],[0,.78,.44],[0,.92,.4]],.045,b.colour,'plastic');rod(b,[[0,.74,.44],[0,.5,.02],[0,.3,-.42]],.06,b.colour,'plastic');rod(b,[[-.4,.2,-.42],[.4,.2,-.42]],.04,METAL);
  box(b,[.62,.12,.3],[0,.3,-.52],b.colour,.06);seatPad(b,[0,.6,-.14],[.2,.06,.2]);box(b,[.32,.3,.06],[0,.78,-.3],SEAT,.06,'cloth',[-.2,0,0]);
  for(const s of [-1,1])b.kit.mesh(b.root,b.kit.shared('pedal',()=>new THREE.BoxGeometry(.12,.03,.07)),DARK,'plastic',[s*.16,.36+s*.08,.5]);handlebar(b,[0,.98,.36],.6);
  return {mount:[0,.18,.04]};
 },
 bicycle:b=>{
  for(const z of [-.56,.56])wheel(b,[0,.3,z],.3,.08,b.light);
  const hub:V3=[0,.3,.56],back:V3=[0,.3,-.56],crank:V3=[0,.26,.02],seat:V3=[0,.62,-.2],head:V3=[0,.74,.38];
  rod(b,[back,crank],.03,b.colour,'plastic');rod(b,[back,seat],.03,b.colour,'plastic');rod(b,[crank,seat],.035,b.colour,'plastic');rod(b,[crank,head],.04,b.colour,'plastic');rod(b,[seat,head],.035,b.colour,'plastic');rod(b,[hub,head,[0,.96,.3]],.03,METAL);
  seatPad(b,[0,.65,-.22],[.12,.05,.2]);rod(b,[[-.3,1.0,.14],[-.2,.98,.3],[.2,.98,.3],[.3,1.0,.14]],.025,METAL);for(const s of [-1,1])b.kit.mesh(b.root,cyl(b.kit,10),DARK,'plastic',[s*.3,1.0,.12],[.035,.12,.035],[Math.PI/2,0,0]);
  b.kit.mesh(b.root,cyl(b.kit,16),METAL,'metal',crank,[.09,.05,.09],[0,0,Math.PI/2]);for(const s of [-1,1])b.kit.mesh(b.root,b.kit.shared('pedal',()=>new THREE.BoxGeometry(.12,.03,.07)),DARK,'plastic',[s*.12,.26+s*.1,.02]);
  box(b,[.36,.22,.26],[0,.9,.5],0xd9a86a,.05,'cloth');b.kit.ball(b.root,0xf29bb6,[.06,1.04,.5],[.07,.06,.07],'plastic',[0,0,0],.5);b.kit.ball(b.root,0xf2d45a,[-.08,1.03,.46],[.06,.05,.06],'plastic',[0,0,0],.5);
  b.kit.ball(b.root,METAL,[.2,1.02,.26],[.05,.035,.05],'metal',[0,0,0],.5);
  return {mount:[0,.22,-.2]};
 },
 hoverboard:b=>{
  b.kit.mesh(b.root,b.kit.shared('hover',()=>{const s=roundedRect(.64,1.36,.3);return slab(s,.07,.03,8,2);}),b.colour,'plastic',[0,.4,0],[1,1,1],[Math.PI/2,0,0]);
  b.kit.mesh(b.root,b.kit.shared('hoverTop',()=>{const s=roundedRect(.52,1.2,.24);return slab(s,.01,.004,8,1);}),shade(b.colour,-.35),'cloth',[0,.445,0],[1,1,1],[Math.PI/2,0,0]);
  for(const z of [-.42,.42])b.kit.mesh(b.root,b.kit.shared('glowRing',()=>new THREE.TorusGeometry(.17,.045,8,24)),0x7ff3ff,'glow',[0,.3,z],[1,1,1],[Math.PI/2,0,0]);
  for(const s of [-1,1])b.kit.mesh(b.root,b.kit.shared('hfin',()=>slab(roundedRect(.12,.2,.05),.03,.01)),b.light,'plastic',[s*.3,.47,-.6],[1,1,1],[0,Math.PI/2,s*.3]);
  light(b,[0,.4,.68],.06,0x9ff4ff);
  return {mount:[0,.455,0]};
 },
 'go-kart':b=>{
  box(b,[1.0,.12,1.8],[0,.22,0],DARK,.1);box(b,[.7,.26,.6],[0,.36,.62],b.colour,.14);box(b,[.9,.1,.5],[0,.3,.98],b.colour,.08);
  for(const s of [-1,1])box(b,[.16,.2,.9],[s*.46,.34,-.1],b.colour,.08);
  for(const [x,z] of [[-.58,.66],[.58,.66],[-.6,-.66],[.6,-.66]])wheel(b,[x,.2,z],.2,.18,METAL);
  box(b,[.62,.14,.5],[0,.36,-.3],SEAT,.1,'cloth');box(b,[.62,.52,.14],[0,.6,-.55],SEAT,.1,'cloth',[-.2,0,0]);
  box(b,[.5,.3,.3],[0,.44,-.86],METAL,.08,'metal');for(const s of [-1,1])b.kit.mesh(b.root,cyl(b.kit,12),METAL,'metal',[s*.14,.44,-1.06],[.05,.2,.05],[Math.PI/2,0,0]);
  b.kit.mesh(b.root,cyl(b.kit,24),CREAM,'plastic',[0,.44,.93],[.14,.02,.14],[Math.PI/2,0,0]);
  rod(b,[[0,.4,.6],[0,.64,.22]],.03,METAL);steering(b,[0,.66,.2],-1.0,.16);
  return {mount:[0,-.1,-.26]};
 },
 moped:b=>{
  wheel(b,[0,.2,.62],.2,.12,b.light);wheel(b,[0,.2,-.6],.2,.14,b.light);
  b.kit.ball(b.root,b.colour,[0,.5,-.5],[.36,.3,.46],'plastic');box(b,[.46,.08,.72],[0,.28,.08],b.colour,.1);
  b.kit.mesh(b.root,b.kit.own(taperedTube([[0,.3,.36],[0,.62,.5],[0,.96,.44],[0,1.1,.3]],t=>.2-.08*t,20,14)),b.colour,'plastic',[0,0,0],[1.4,1,.55]);
  seatPad(b,[0,.8,-.34],[.2,.07,.32]);handlebar(b,[0,1.12,.26],.6,b.light);light(b,[0,1.1,.4],.08);
  b.kit.ball(b.root,b.colour,[0,.3,.66],[.22,.12,.26],'plastic');for(const s of [-1,1])b.kit.ball(b.root,METAL,[s*.3,1.3,.24],[.06,.04,.02],'metal',[0,0,0],.4);
  return {mount:[0,.36,-.32]};
 },
 tractor:b=>{
  for(const x of [-.56,.56]){wheel(b,[x,.5,-.36],.5,.26,0xf2c53d);b.kit.mesh(b.root,b.kit.shared('mudguard',()=>new THREE.CylinderGeometry(.56,.56,.3,20,1,true,-Math.PI/2,Math.PI)),b.colour,'plastic',[x,.5,-.36],[1,1,1],[0,0,Math.PI/2]);}
  for(const x of [-.46,.46])wheel(b,[x,.26,.84],.26,.16,0xf2c53d);
  box(b,[.66,.52,1.1],[0,.62,.62],b.colour,.14);box(b,[.6,.4,.06],[0,.6,1.18],DARK,.05);for(const s of [-1,1])light(b,[s*.22,.84,1.2],.06);
  b.kit.mesh(b.root,cyl(b.kit,12),DARK,'metal',[.18,1.1,.9],[.05,.5,.05]);box(b,[.7,.12,.6],[0,.5,-.3],DARK,.06);
  box(b,[.5,.1,.42],[0,.74,-.36],SEAT,.1,'cloth');box(b,[.5,.44,.1],[0,.98,-.56],SEAT,.08,'cloth',[-.15,0,0]);
  rod(b,[[0,.8,.14],[0,1.06,-.04]],.03,METAL);steering(b,[0,1.08,-.06],-1.05,.15);
  return {mount:[0,.3,-.36]};
 },
 car:b=>{
  carBody(b,toyCarOutline(),1.16,b.colour);
  box(b,[1.0,.34,.08],[0,.84,.28],0xbfe6f4,.05,'plastic',[-.35,0,0]);box(b,[1.04,.05,.1],[0,1.0,.22],METAL,.02,'metal',[-.35,0,0]);
  box(b,[.9,.4,.12],[0,.7,-.44],CREAM,.08,'cloth',[-.15,0,0]);box(b,[.9,.12,.5],[0,.46,-.2],CREAM,.08,'cloth');
  for(const [x,z] of [[-.58,.72],[.58,.72],[-.58,-.72],[.58,-.72]])wheel(b,[x,.24,z],.24,.16,METAL);
  for(const s of [-1,1]){light(b,[s*.36,.46,1.14],.08);b.kit.ball(b.root,0xe0453f,[s*.4,.48,-1.16],[.07,.05,.03],'glow',[0,0,0],.5);}
  box(b,[1.18,.1,.12],[0,.24,1.14],METAL,.04,'metal');box(b,[1.18,.1,.12],[0,.24,-1.16],METAL,.04,'metal');
  rod(b,[[0,.55,.2],[0,.72,.08]],.03,METAL);steering(b,[0,.74,.06],-1.1,.14);
  return {mount:[0,-.02,-.2]};
 },
 'ice-cream-van':b=>{
  box(b,[1.3,1.0,1.3],[0,.86,-.62],b.colour,.2);box(b,[1.32,.14,1.32],[0,.62,-.62],CREAM,.06);box(b,[1.3,.46,.62],[0,.56,.88],b.colour,.16);
  box(b,[1.3,.08,1.0],[0,1.4,-.2],CREAM,.06);for(const s of [-1,1])rod(b,[[s*.6,.8,.46],[s*.6,1.38,.3]],.03,METAL);
  box(b,[.08,.42,.62],[.66,.95,-.6],0x3b2b35,.05);for(let i=0;i<4;i++)box(b,[.2,.06,.16],[.72,1.2,-.84+i*.16],i%2?CREAM:0xf29bb6,.03,'cloth',[0,0,-.5]);
  b.kit.mesh(b.root,b.kit.shared('cone',()=>new THREE.ConeGeometry(.2,.52,14)),0xe0b070,'plastic',[0,1.72,-.74],[1,1,1],[Math.PI,0,0]);b.kit.ball(b.root,0xf6c6d8,[0,2.0,-.74],[.24,.2,.24],'plastic');b.kit.ball(b.root,CREAM,[0,2.18,-.74],[.17,.14,.17],'plastic');b.kit.ball(b.root,0xd9362f,[0,2.34,-.74],[.06,.06,.06],'plastic');
  for(const [x,z] of [[-.6,.9],[.6,.9],[-.6,-.9],[.6,-.9]])wheel(b,[x,.26,z],.26,.18,METAL);for(const s of [-1,1])light(b,[s*.4,.64,1.2],.07);
  box(b,[.5,.12,.4],[0,.56,.2],SEAT,.08,'cloth');box(b,[.5,.44,.1],[0,.8,-.02],SEAT,.08,'cloth');steering(b,[0,.98,.56],-1.1,.14);
  return {mount:[0,.12,.18]};
 },
 'fire-engine':b=>{
  box(b,[1.3,.72,1.6],[0,.72,-.66],b.colour,.14);for(const z of [-1.1,-.66,-.22])box(b,[.04,.46,.34],[.66,.72,z],METAL,.03,'metal');box(b,[1.3,.46,.7],[0,.56,.96],b.colour,.14);
  box(b,[1.3,.08,.9],[0,1.44,.24],b.colour,.06);for(const s of [-1,1])rod(b,[[s*.6,.8,.66],[s*.6,1.42,.5]],.03,METAL);
  for(const s of [-1,1])rod(b,[[s*.24,1.16,-1.4],[s*.24,1.2,.4],[s*.24,1.52,.9]],.03,METAL);for(let i=0;i<8;i++){const z=-1.3+i*.26;b.kit.mesh(b.root,cyl(b.kit,8),METAL,'metal',[0,1.17+Math.max(0,z-.4)*.6,z],[.02,.48,.02],[0,0,Math.PI/2]);}
  b.kit.ball(b.root,0x4a8fe6,[-.2,1.54,.3],[.09,.07,.09],'glow',[0,0,0],.5);b.kit.ball(b.root,0xf04a4a,[.2,1.54,.3],[.09,.07,.09],'glow',[0,0,0],.5);
  b.kit.mesh(b.root,cyl(b.kit,20),0xe8e2d6,'plastic',[-.7,.66,-.9],[.24,.1,.24],[0,0,Math.PI/2]);
  for(const [x,z] of [[-.62,1.0],[.62,1.0],[-.62,-.4],[.62,-.4],[-.62,-1.12],[.62,-1.12]])wheel(b,[x,.26,z],.26,.18,METAL);for(const s of [-1,1])light(b,[s*.4,.64,1.32],.07);
  box(b,[1.3,.1,.12],[0,.3,1.32],METAL,.04,'metal');box(b,[.5,.12,.4],[0,.56,.28],SEAT,.08,'cloth');box(b,[.5,.44,.1],[0,.8,.06],SEAT,.08,'cloth');steering(b,[0,1.0,.64],-1.1,.14);
  return {mount:[0,.12,.26]};
 },
};
export function createVehicleModel(id:string,paintId?:string):VehicleModel{
 const v=vehicle(id);if(!v)throw new Error(`Unknown ride ${id}`);
 const colour=paint(paintId??v.paint)?.hex??paint(v.paint)!.hex,kit=new Kit(),root=new THREE.Group();
 const b:Build={kit,root,wheels:[],colour,light:shade(colour,.55),dark:shade(colour,-.3)};
 const {mount}=BUILDERS[v.id](b);
 return {root,mount,pose:v.pose,
  animate(t,moving,enabled=true){const spin=enabled&&moving?t*9:0;for(const w of b.wheels)w.rotation.x=spin;},
  dispose(){kit.dispose();}};
}
