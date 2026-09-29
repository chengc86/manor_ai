import * as THREE from 'three';
/**
 * Procedural 3D monsters, one per enemy kind in lib/enemies.ts, styled after /public/enemies art.
 * Models stand on y=0 and face +z. Moving parts are groups hanging directly from `root` or from another part,
 * so the battlefield can bake each monster into one rigidly skinned mesh (lib/rig-bake.ts).
 */
type V3=[number,number,number];
type Look={metal?:boolean;glow?:boolean;opacity?:number;double?:boolean;rough?:number};
export type MonsterModel={root:THREE.Group;parts:THREE.Object3D[];height:number;animate:(phase:number,time:number)=>void};
class Kit{
 root=new THREE.Group();
 add(parent:THREE.Object3D,geometry:THREE.BufferGeometry,colour:number,pos:V3,scale:V3=[1,1,1],rot:V3=[0,0,0],look:Look={}){
  const material=new THREE.MeshStandardMaterial({color:colour,roughness:look.rough??.6});
  if(look.opacity!==undefined)Object.assign(material,{transparent:true,opacity:look.opacity,depthWrite:false});
  if(look.double)material.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...pos);mesh.scale.set(...scale);mesh.rotation.set(...rot);
  if(look.glow)mesh.userData.glow=true;if(look.metal)mesh.userData.metal=true;
  parent.add(mesh);return mesh;
 }
 ball(parent:THREE.Object3D,colour:number,pos:V3,scale:V3,rot?:V3,look?:Look){return this.add(parent,new THREE.SphereGeometry(1,20,14),colour,pos,scale,rot,look);}
 capsule(parent:THREE.Object3D,colour:number,pos:V3,radius:number,length:number,rot?:V3,look?:Look){return this.add(parent,new THREE.CapsuleGeometry(radius,length,4,10),colour,pos,[1,1,1],rot,look);}
 part(parent:THREE.Object3D,pos:V3){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
 /** A cartoon eye: sclera, iris, pupil and highlight, turned by `yaw` to follow a round face. */
 eye(parent:THREE.Object3D,pos:V3,size:number,iris:number,yaw=0){
  const g=new THREE.Group();g.position.set(...pos);g.rotation.y=yaw;parent.add(g);
  this.ball(g,0xfffcf1,[0,0,0],[size,size*1.12,size*.6]);
  this.ball(g,iris,[0,-size*.06,size*.4],[size*.66,size*.74,size*.3]);
  this.ball(g,0x1b2426,[0,-size*.06,size*.56],[size*.4,size*.48,size*.16]);
  this.ball(g,0xffffff,[-size*.22,size*.24,size*.66],[size*.16,size*.18,size*.08]);
 }
 /** Eyebrow; positive tilt lowers the inner end for a determined look. */
 brow(parent:THREE.Object3D,pos:V3,length:number,tilt:number,colour:number,thick=.022){this.capsule(parent,colour,pos,thick,length,[0,0,Math.PI/2+tilt]);}
 smile(parent:THREE.Object3D,pos:V3,radius:number,colour:number,tube=.018){this.add(parent,new THREE.TorusGeometry(radius,tube,5,14,Math.PI),colour,pos,[1,.75,1],[0,0,Math.PI]);}
 tube(parent:THREE.Object3D,points:V3[],radius:number,colour:number){return this.add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,radius,5,false),colour,[0,0,0]);}
}
const pair=<T,>(make:(side:number,i:number)=>T)=>[-1,1].map(make);
type Build=(k:Kit)=>{parts:THREE.Object3D[];height:number;animate:(phase:number,time:number)=>void};
const BUILDERS:Record<string,Build>={
 slime(k){
  const lime=0x9ee060,light=0xcaf59c,dark=0x4f8f33,body=k.part(k.root,[0,0,0]),gloss={rough:.28};
  k.ball(body,lime,[0,.46,0],[.56,.46,.52],undefined,gloss);k.ball(body,lime,[0,.24,0],[.64,.24,.6],undefined,gloss);
  k.ball(body,light,[0,.36,.24],[.36,.26,.3],undefined,gloss);
  k.ball(body,0xffffff,[-.24,.74,.28],[.09,.05,.06],[0,0,.5]);k.ball(body,0xffffff,[-.33,.64,.33],[.035,.03,.03]);
  pair(s=>k.eye(body,[s*.19,.6,.41],.13,0x3c8c3a,s*.28));pair(s=>k.brow(body,[s*.2,.8,.46],.1,s*.35,dark));
  k.smile(body,[0,.46,.51],.07,0x2d5a28);
  pair(s=>k.ball(body,lime,[s*.56,.34,.12],[.13,.11,.12],undefined,gloss));
  k.add(body,new THREE.CylinderGeometry(.018,.026,.2,6),0x4f8a36,[0,.98,0],[1,1,1],[0,0,.15]);
  pair(s=>k.ball(body,0x78c04a,[s*.1,1.1,0],[.11,.028,.06],[0,s*.3,s*.5]));
  return {parts:[body],height:1.15,animate(phase,time){const h=Math.sin(phase),w=.015*Math.sin(time*7);body.position.y=Math.max(0,h)*.14;body.scale.set(1-.07*h+w,1+.1*h-w,1-.07*h+w);}};
 },
 runner(k){
  const fur=0xef8a3a,cream=0xffe3c2,tunic=0x6f8d3c,leaf=0x5b7a2e,boot=0x7a4a28,twig=0x7a5836,body=k.part(k.root,[0,0,0]);
  k.ball(body,tunic,[0,.62,0],[.22,.25,.18]);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;k.ball(body,leaf,[Math.cos(a)*.17,.82,Math.sin(a)*.13],[.08,.035,.06],[0,-a,0]);}
  k.ball(body,fur,[0,1.02,.02],[.28,.25,.24]);k.ball(body,cream,[0,.94,.19],[.15,.1,.1]);k.ball(body,0x3a2a20,[0,.98,.3],[.045,.035,.035]);
  pair(s=>k.eye(body,[s*.1,1.05,.19],.07,0xd99a2b,s*.3));pair(s=>k.brow(body,[s*.11,1.15,.22],.07,s*.3,0x8a4a1c,.016));
  k.smile(body,[0,.9,.27],.05,0x5a2f1a,.012);
  pair(s=>{
   k.add(body,new THREE.ConeGeometry(.11,.3,4),fur,[s*.19,1.26,-.02],[1,1,.6],[0,0,-s*.35]);
   k.add(body,new THREE.ConeGeometry(.06,.18,4),cream,[s*.19,1.24,.03],[1,1,.4],[0,0,-s*.35]);
   k.add(body,new THREE.CylinderGeometry(.015,.022,.3,5),twig,[s*.08,1.34,-.07],[1,1,1],[.2,0,-s*.4]);
   k.add(body,new THREE.CylinderGeometry(.012,.016,.14,5),twig,[s*.17,1.42,-.07],[1,1,1],[0,0,-s*1.1]);
   k.ball(body,0x7fb04a,[s*.23,1.46,-.07],[.045,.02,.03]);
  });
  const legs=pair(s=>{const leg=k.part(body,[s*.1,.45,0]);k.capsule(leg,fur,[0,-.15,0],.065,.16);k.ball(leg,boot,[0,-.36,.04],[.09,.07,.13]);return leg;});
  const arms=pair(s=>{const arm=k.part(body,[s*.22,.74,0]);k.capsule(arm,fur,[s*.02,-.1,0],.05,.14,[0,0,s*.2]);k.ball(arm,cream,[s*.04,-.22,0],[.055,.055,.055]);return arm;});
  const tail=k.part(body,[0,.5,-.16]);k.ball(tail,fur,[0,.1,-.14],[.11,.11,.24],[-.7,0,0]);k.ball(tail,cream,[0,.24,-.27],[.08,.08,.1],[-.7,0,0]);
  return {parts:[body,...legs,...arms,tail],height:1.45,animate(phase){const s=Math.sin(phase);legs[0].rotation.x=s*.8;legs[1].rotation.x=-s*.8;arms[0].rotation.x=-s*.7;arms[1].rotation.x=s*.7;body.position.y=Math.abs(Math.cos(phase))*.05;body.rotation.x=.12;tail.rotation.x=Math.sin(phase*.5)*.25;}};
 },
 tinback(k){
  const deep=0x2c5596,blue=0x3d72c9,silver=0xc6d0da,rivet=0x8b97a3,body=k.part(k.root,[0,0,0]),shine={metal:true,rough:.32};
  k.ball(body,deep,[0,.34,0],[.36,.2,.46]);k.ball(body,silver,[0,.46,-.04],[.46,.32,.52],undefined,shine);
  k.add(body,new THREE.BoxGeometry(.035,.03,.92),0x7d8893,[0,.775,-.04],[1,1,1],[0,0,0],shine);
  for(const z of [-.3,0,.28]){const f=Math.sqrt(1-(z/.56)**2);k.add(body,new THREE.TorusGeometry(.46*f,.018,5,24,Math.PI),rivet,[0,.46,z-.04],[1,.7,1],[0,0,0],shine);
   for(let i=1;i<6;i++){const a=i/6*Math.PI;k.ball(body,0xe4eaef,[Math.cos(a)*.46*f,.46+Math.sin(a)*.32*f,z-.04],[.022,.022,.022],undefined,shine);}}
  k.ball(body,blue,[0,.4,.46],[.22,.19,.18]);
  pair(s=>k.eye(body,[s*.09,.47,.58],.065,0x2e5fa8,s*.3));pair(s=>k.brow(body,[s*.1,.56,.62],.06,s*.45,0x1c3563,.018));
  pair(s=>k.add(body,new THREE.ConeGeometry(.03,.1,5),0x1f3f78,[s*.07,.32,.62],[1,1,1],[Math.PI/2+.3,0,s*.4]));
  pair(s=>{k.tube(body,[[s*.06,.55,.52],[s*.12,.78,.58],[s*.24,.9,.5]],.014,0x1f3f78);k.ball(body,blue,[s*.24,.9,.5],[.04,.04,.04]);});
  const legs:THREE.Group[]=[];
  for(const z of [.24,0,-.24])for(const s of [-1,1]){const leg=k.part(body,[s*.3,.3,z]);k.capsule(leg,deep,[s*.1,-.1,0],.035,.16,[0,0,s*.95]);k.ball(leg,0x1f3f78,[s*.2,-.25,0],[.045,.03,.06]);legs.push(leg);}
  return {parts:[body,...legs],height:1.05,animate(phase){legs.forEach((leg,i)=>{leg.rotation.y=Math.sin(phase+(i%2^Math.floor(i/2)%2?Math.PI:0))*.4;});body.position.y=Math.abs(Math.sin(phase*2))*.015;body.rotation.z=Math.sin(phase)*.04;}};
 },
 moth(k){
  const fur=0x7c58a8,ruff=0xb89ae0,wing=0x8b5fc6,spot=0x4b2d7c,moon=0xf1dfa2,body=k.part(k.root,[0,.35,0]);
  k.ball(body,fur,[0,.28,-.05],[.19,.26,.2]);k.ball(body,fur,[0,.06,-.13],[.13,.17,.14]);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.ball(body,ruff,[Math.cos(a)*.16,.46,Math.sin(a)*.14],[.09,.07,.09]);}
  k.ball(body,fur,[0,.62,.06],[.19,.17,.17]);
  pair(s=>k.eye(body,[s*.08,.64,.18],.075,0x9c5ad4,s*.35));k.smile(body,[0,.55,.21],.035,0x3b2260,.01);
  pair(s=>{k.tube(body,[[s*.05,.76,.1],[s*.12,.94,.13],[s*.22,1.02,.05]],.012,0xa98bd0);for(let i=0;i<3;i++)k.ball(body,0xc8b2ec,[s*(.1+i*.05),.9+i*.04,.12-i*.03],[.05,.012,.03],[0,0,s*.6]);});
  const wings=pair(s=>{const w=k.part(body,[s*.12,.4,-.04]);
   k.ball(w,wing,[s*.36,.04,.04],[.36,.022,.26],[0,s*.25,0]);k.ball(w,wing,[s*.26,-.01,-.2],[.22,.02,.17],[0,-s*.4,0]);
   k.ball(w,spot,[s*.44,.065,.08],[.12,.012,.09],[0,s*.25,0]);k.ball(w,moon,[s*.3,.066,.14],[.05,.012,.05]);k.ball(w,spot,[s*.28,.025,-.22],[.08,.012,.06]);
   return w;});
  return {parts:[body,...wings],height:1.35,animate(phase,time){const lift=.3+.5*Math.sin(time*9);wings[0].rotation.z=-lift;wings[1].rotation.z=lift;body.position.y=.35+Math.sin(time*2.4+phase*.1)*.06;}};
 },
 shell(k){
  const nut=0xb77d45,cap=0x7a5130,capLight=0x94673d,face=0xdcae72,body=k.part(k.root,[0,0,0]);
  k.ball(body,nut,[0,.52,0],[.4,.42,.38]);k.add(body,new THREE.ConeGeometry(.2,.2,16),nut,[0,.14,0],[1,1,1],[Math.PI,0,0]);
  k.ball(body,face,[0,.54,.2],[.28,.25,.2]);
  k.add(body,new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),cap,[0,.72,0],[.47,.32,.45]);
  k.add(body,new THREE.CylinderGeometry(.47,.47,.05,24),capLight,[0,.73,0]);
  for(let r=0;r<2;r++)for(let i=0;i<12;i++){const a=(i+r*.5)/12*Math.PI*2,rr=r?.24:.38;k.ball(body,capLight,[Math.cos(a)*rr,.84+r*.1,Math.sin(a)*rr*.95],[.06,.035,.06]);}
  k.add(body,new THREE.CylinderGeometry(.03,.045,.16,6),0x5a3a22,[0,1.1,0],[1,1,1],[0,0,.3]);
  pair(s=>k.eye(body,[s*.13,.6,.34],.085,0x6b4424,s*.3));pair(s=>k.brow(body,[s*.13,.71,.37],.08,s*.3,0x5a3a22));k.smile(body,[0,.47,.38],.06,0x5a3a22);
  k.add(body,new THREE.TorusGeometry(.39,.03,6,32),0x8a5a30,[0,.36,0],[1,1,.95],[Math.PI/2,0,0]);
  k.add(body,new THREE.BoxGeometry(.1,.08,.03),0xe2b44e,[0,.36,.38],[1,1,1],[0,0,0],{metal:true,rough:.35});
  const arms=pair(s=>{const arm=k.part(body,[s*.38,.52,0]);k.capsule(arm,nut,[s*.04,-.08,0],.06,.1,[0,0,s*.4]);k.ball(arm,face,[s*.09,-.18,.02],[.07,.07,.07]);return arm;});
  const legs=pair(s=>{const leg=k.part(body,[s*.14,.2,0]);k.capsule(leg,nut,[0,-.07,0],.055,.05);k.ball(leg,cap,[0,-.16,.03],[.09,.05,.13]);return leg;});
  return {parts:[body,...arms,...legs],height:1.25,animate(phase){const s=Math.sin(phase);body.rotation.z=s*.12;legs[0].rotation.x=s*.35;legs[1].rotation.x=-s*.35;arms[0].rotation.x=-s*.3;arms[1].rotation.x=s*.3;body.position.y=Math.abs(s)*.03;}};
 },
 frost(k){
  const fur=0xeaf5ff,face=0xd4e8fb,ice=0x9ad8ff,body=k.part(k.root,[0,0,0]);
  k.ball(body,fur,[0,.55,0],[.4,.42,.36]);
  for(const [x,y,z] of [[.3,.75,.1],[-.3,.75,.1],[.36,.45,.05],[-.36,.45,.05],[0,.92,-.05],[.2,.9,.12],[-.2,.9,.12],[0,.3,.2],[.25,.25,.15],[-.25,.25,.15],[0,.6,-.3],[.28,.6,-.2],[-.28,.6,-.2]])k.ball(body,fur,[x,y,z],[.16,.15,.16]);
  k.ball(body,face,[0,.6,.25],[.25,.22,.14]);
  pair(s=>k.eye(body,[s*.11,.66,.34],.085,0x3b8fd8,s*.25));pair(s=>k.brow(body,[s*.11,.77,.37],.07,s*.3,0x7aa6d4));
  k.smile(body,[0,.53,.38],.05,0x6d8fb5);pair(s=>k.add(body,new THREE.ConeGeometry(.016,.045,4),0xffffff,[s*.03,.5,.39],[1,1,1],[Math.PI,0,0]));
  const crystal=(pos:V3,scale:V3,rz=0)=>k.add(body,new THREE.OctahedronGeometry(1,0),ice,pos,scale,[0,0,rz],{rough:.15});
  crystal([0,1.06,0],[.07,.17,.07]);pair(s=>crystal([s*.16,1.0,-.02],[.055,.13,.055],-s*.45));pair(s=>crystal([s*.35,.88,-.05],[.045,.1,.045],-s*.8));
  const arms=pair(s=>{const arm=k.part(body,[s*.38,.55,.05]);k.ball(arm,fur,[s*.07,-.08,0],[.13,.15,.13]);return arm;});
  const legs=pair(s=>{const leg=k.part(body,[s*.16,.2,0]);k.ball(leg,fur,[0,-.1,.03],[.13,.1,.15]);return leg;});
  return {parts:[body,...arms,...legs],height:1.25,animate(phase){const h=Math.abs(Math.sin(phase));body.position.y=h*.12;body.scale.set(1+(.5-h)*.05,1-(.5-h)*.08,1+(.5-h)*.05);arms.forEach((a,i)=>{a.rotation.z=(i?1:-1)*(.2+.3*Math.sin(phase*2));});legs[0].rotation.x=Math.sin(phase)*.4;legs[1].rotation.x=-Math.sin(phase)*.4;}};
 },
 boots(k){
  const skin=0xb9754a,skinDark=0x965b37,vest=0x6a4a2d,boot=0x5b3920,sole=0x35241a,hair=0x4b2f1d,gold=0xdcb24c,body=k.part(k.root,[0,0,0]);
  k.ball(body,vest,[0,.76,0],[.28,.28,.23]);k.ball(body,skin,[0,.8,.16],[.13,.15,.08]);
  k.add(body,new THREE.TorusGeometry(.27,.035,6,28),0x3b2918,[0,.58,0],[1,1,.85],[Math.PI/2,0,0]);k.add(body,new THREE.BoxGeometry(.11,.08,.03),gold,[0,.58,.23],[1,1,1],[0,0,0],{metal:true,rough:.35});
  k.ball(body,skin,[0,1.12,.02],[.23,.21,.2]);
  pair(s=>{k.add(body,new THREE.ConeGeometry(.08,.34,5),skin,[s*.3,1.14,0],[1,1,.55],[0,0,-s*(Math.PI/2-.35)]);k.add(body,new THREE.ConeGeometry(.045,.22,5),skinDark,[s*.29,1.14,.02],[1,1,.4],[0,0,-s*(Math.PI/2-.35)]);});
  k.add(body,new THREE.TorusGeometry(.03,.009,5,10),gold,[.4,1.08,.02],[1,1,1],[0,Math.PI/2,0],{metal:true,rough:.35});
  pair(s=>k.eye(body,[s*.08,1.15,.17],.06,0xe08a2a,s*.3));pair(s=>k.brow(body,[s*.09,1.24,.2],.07,s*.5,hair,.026));
  k.ball(body,skinDark,[0,1.09,.21],[.06,.05,.05]);k.ball(body,0x3a2016,[0,1.01,.18],[.1,.035,.03]);
  pair(s=>k.add(body,new THREE.BoxGeometry(.03,.03,.01),0xfff6e0,[s*.035,1.02,.205],[1,1,1],[0,0,0]));
  for(const [x,z,r] of [[0,0,.1],[.07,-.05,.08],[-.06,-.04,.07]])k.ball(body,hair,[x,1.31,z],[r,r*.8,r]);
  const legs=pair(s=>{const leg=k.part(body,[s*.13,.5,0]);k.capsule(leg,0x5d4632,[0,-.12,0],.08,.1);k.add(leg,new THREE.CylinderGeometry(.11,.11,.1,12),boot,[0,-.25,0]);k.ball(leg,boot,[0,-.37,.07],[.15,.11,.22]);k.add(leg,new THREE.BoxGeometry(.28,.05,.42),sole,[0,-.475,.07]);return leg;});
  const arms=pair(s=>{const arm=k.part(body,[s*.3,.86,0]);k.capsule(arm,skin,[s*.03,-.16,0],.07,.2,[0,0,s*.18]);k.add(arm,new THREE.CylinderGeometry(.08,.08,.06,10),vest,[s*.06,-.3,0]);k.ball(arm,skin,[s*.07,-.39,.01],[.085,.085,.085]);return arm;});
  return {parts:[body,...legs,...arms],height:1.5,animate(phase){const s=Math.sin(phase);legs[0].rotation.x=s*.5;legs[1].rotation.x=-s*.5;arms[0].rotation.x=-s*.4;arms[1].rotation.x=s*.4;body.rotation.z=s*.06;body.position.y=Math.abs(Math.cos(phase))*.04;}};
 },
 bubble(k){
  const lav=0xb394ea,belly=0xdcccff,gold=0xe6c35a,body=k.part(k.root,[0,.1,0]),glass={opacity:.22,rough:.05};
  k.ball(body,lav,[0,.58,0],[.33,.35,.31]);k.ball(body,belly,[0,.5,.15],[.2,.2,.16]);
  pair(s=>k.eye(body,[s*.12,.68,.25],.09,0x8d4fd6,s*.3));k.smile(body,[0,.55,.3],.05,0x5b3a8c);pair(s=>k.ball(body,0xf2a3c8,[s*.2,.58,.24],[.04,.025,.02]));
  pair(s=>k.ball(body,lav,[s*.22,.9,0],[.08,.1,.08]));pair(s=>k.ball(body,lav,[s*.34,.5,.08],[.09,.08,.09]));pair(s=>k.ball(body,lav,[s*.13,.24,.06],[.1,.06,.12]));
  k.add(body,new THREE.TorusGeometry(.26,.035,6,28),gold,[0,.4,0],[1,1,1],[Math.PI/2,0,0],{metal:true,rough:.35});
  k.add(body,new THREE.OctahedronGeometry(.06,0),0x7fd3ff,[0,.4,.28],[1,1.3,1],[0,0,0],{rough:.2});
  k.ball(body,0xe8f2ff,[0,.6,0],[.58,.58,.58],undefined,glass);
  for(const [x,y,z,r] of [[.5,.98,.1,.1],[-.55,.32,.15,.08],[.46,.16,-.2,.07]])k.ball(body,0xe8f2ff,[x,y,z],[r,r,r],undefined,{...glass,opacity:.3});
  return {parts:[body],height:1.35,animate(phase,time){body.position.y=.1+Math.sin(time*2.2+phase*.2)*.06;body.rotation.y=Math.sin(time*1.3)*.2;const p=1+.02*Math.sin(time*4);body.scale.set(p,p,p);}};
 },
 paper(k){
  const paper=0xf6edd2,fold=0xe0d0a8,body=k.part(k.root,[0,0,0]),oct=()=>new THREE.OctahedronGeometry(1,0);
  k.add(body,oct(),paper,[0,.45,-.05],[.3,.2,.42]);k.add(body,oct(),fold,[0,.52,-.12],[.18,.14,.28]);
  k.add(body,oct(),paper,[0,.64,.32],[.22,.19,.2]);k.add(body,oct(),fold,[0,.57,.44],[.08,.06,.1]);
  pair(s=>k.eye(body,[s*.085,.68,.46],.08,0x6b4a2a,s*.3));
  pair(s=>{k.add(body,new THREE.BoxGeometry(.04,.46,.16),paper,[s*.1,.96,.24],[1,1,1],[-.3,0,s*.25]);k.add(body,new THREE.BoxGeometry(.012,.4,.02),fold,[s*.115,.96,.3],[1,1,1],[-.3,0,s*.25]);});
  k.add(body,new THREE.CylinderGeometry(.075,.075,.02,12),0xc4463a,[.27,.46,0],[1,1,1],[0,0,Math.PI/2]);
  const legs:THREE.Group[]=[];
  for(const z of [.18,-.22])for(const s of [-1,1]){const leg=k.part(body,[s*.2,.38,z]);k.add(leg,new THREE.BoxGeometry(.035,.34,.035),paper,[s*.08,-.16,0],[1,1,1],[0,0,s*.45]);k.add(leg,new THREE.TetrahedronGeometry(.05,0),fold,[s*.15,-.31,.02]);legs.push(leg);}
  return {parts:[body,...legs],height:1.3,animate(phase){legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(phase+(i===0||i===3?0:Math.PI))*.55;});body.position.y=Math.abs(Math.sin(phase*2))*.02;body.rotation.z=Math.sin(phase*2)*.05;}};
 },
 moss(k){
  const stone=0x8e928a,stoneDark=0x6e726b,moss=0x5f9d49,mossLight=0x86be5c,body=k.part(k.root,[0,0,0]),ico=()=>new THREE.IcosahedronGeometry(1,0);
  k.add(body,ico(),stone,[0,.92,0],[.46,.4,.36]);k.add(body,ico(),stoneDark,[0,.8,.15],[.3,.26,.22]);
  k.add(body,ico(),stone,[0,1.36,.1],[.22,.2,.2]);k.add(body,new THREE.BoxGeometry(.3,.05,.06),stoneDark,[0,1.42,.26]);
  pair(s=>k.eye(body,[s*.08,1.35,.27],.05,0x6b4a2a,s*.3));k.add(body,new THREE.BoxGeometry(.1,.02,.02),0x3f423d,[0,1.26,.29]);
  for(const [x,y,z,r] of [[.3,1.22,-.05,.18],[-.3,1.22,-.05,.18],[0,1.52,.02,.14],[.15,1.06,-.25,.2],[-.15,1.02,-.28,.18],[.22,.72,.25,.12],[-.28,.62,.16,.13]]){k.ball(body,moss,[x,y,z],[r,r*.7,r]);k.ball(body,mossLight,[x*.9,y+r*.4,z*.9],[r*.55,r*.4,r*.55]);}
  for(const [x,y,z] of [[.28,1.36,0],[-.2,1.34,.05],[.05,1.64,.05],[.26,.82,.3]]){k.ball(body,0xfffbe6,[x,y,z],[.035,.02,.035]);k.ball(body,0xf2cf4a,[x,y+.012,z],[.014,.012,.014]);}
  const arms=pair(s=>{const arm=k.part(body,[s*.5,1.1,0]);k.add(arm,ico(),stone,[s*.05,-.02,0],[.17,.17,.17]);k.add(arm,ico(),stone,[s*.1,-.35,.03],[.14,.2,.14]);k.add(arm,ico(),stoneDark,[s*.12,-.62,.06],[.17,.16,.17]);k.ball(arm,moss,[s*.04,.1,-.02],[.12,.07,.12]);return arm;});
  const legs=pair(s=>{const leg=k.part(body,[s*.2,.5,0]);k.add(leg,ico(),stone,[0,-.25,0],[.17,.25,.17]);k.add(leg,ico(),stoneDark,[0,-.45,.05],[.19,.08,.22]);return leg;});
  return {parts:[body,...arms,...legs],height:1.75,animate(phase){const s=Math.sin(phase);legs[0].rotation.x=s*.35;legs[1].rotation.x=-s*.35;arms[0].rotation.x=-s*.3;arms[1].rotation.x=s*.3;body.rotation.z=s*.07;body.position.y=Math.abs(Math.cos(phase))*.035;}};
 },
 rubber(k){
  const rub=0xf4c043,tread=0xd48f22,body=k.part(k.root,[0,0,0]),soft={rough:.35};
  k.ball(body,rub,[0,.52,0],[.44,.44,.44],undefined,soft);
  for(const a of [-.55,0,.55])k.add(body,new THREE.TorusGeometry(.435,.028,5,40),tread,[0,.52,0],[1,1,1],[0,a+Math.PI/2,.35],soft);
  pair(s=>k.eye(body,[s*.14,.64,.35],.1,0x5a3a1a,s*.3));pair(s=>k.brow(body,[s*.14,.78,.38],.08,-s*.2,0x9a6418));
  k.smile(body,[0,.46,.42],.1,0x6b3a12,.025);k.ball(body,0xe86a6a,[0,.4,.43],[.05,.03,.02]);
  const arms=pair(s=>{const arm=k.part(body,[s*.42,.52,0]);k.capsule(arm,rub,[s*.05,-.06,0],.045,.1,[0,0,s*.6],soft);k.ball(arm,0xfff1d0,[s*.12,-.13,.02],[.06,.06,.06]);return arm;});
  const legs=pair(s=>{const leg=k.part(body,[s*.14,.14,0]);k.capsule(leg,rub,[0,-.04,0],.045,.04,undefined,soft);k.ball(leg,0xd48f22,[0,-.1,.04],[.08,.045,.12]);return leg;});
  return {parts:[body,...arms,...legs],height:1.15,animate(phase){const h=Math.abs(Math.sin(phase));body.position.y=h*.2;body.scale.set(1+(1-h)*.06,1-(1-h)*.08,1+(1-h)*.06);legs[0].rotation.x=Math.sin(phase)*.5;legs[1].rotation.x=-Math.sin(phase)*.5;arms.forEach((a,i)=>{a.rotation.z=(i?1:-1)*.4*h;});}};
 },
 lantern(k){
  const bronze=0xb27a3e,dark=0x8a5a2c,plume=0xc53b37,frame=0x3b3024,body=k.part(k.root,[0,0,0]),shine={metal:true,rough:.35};
  k.ball(body,bronze,[0,.64,0],[.24,.26,.2],undefined,shine);k.add(body,new THREE.TorusGeometry(.23,.03,6,28),dark,[0,.47,0],[1,1,.85],[Math.PI/2,0,0],shine);
  pair(s=>k.ball(body,bronze,[s*.24,.8,0],[.1,.08,.1],undefined,shine));
  k.ball(body,bronze,[0,1.0,0],[.23,.24,.22],undefined,shine);k.ball(body,0x241a16,[0,.97,.12],[.17,.13,.11]);
  pair(s=>k.ball(body,0xffe07a,[s*.06,.99,.225],[.035,.028,.02],undefined,{glow:true}));
  k.add(body,new THREE.BoxGeometry(.04,.06,.42),dark,[0,1.22,0],[1,1,1],[0,0,0],shine);
  for(const [y,z,r] of [[1.28,-.04,.08],[1.26,-.17,.075],[1.2,-.29,.07],[1.1,-.37,.06]])k.ball(body,plume,[0,y,z],[r*.8,r,r*1.4]);
  k.add(body,new THREE.CylinderGeometry(.16,.32,.6,16,1,true,Math.PI*.25,Math.PI*1.5),0x7a2531,[0,.6,-.06],[1,1,.7],[0,Math.PI,0],{double:true});
  const legs=pair(s=>{const leg=k.part(body,[s*.1,.42,0]);k.capsule(leg,dark,[0,-.16,0],.065,.16,undefined,shine);k.ball(leg,frame,[0,-.37,.04],[.08,.055,.12]);return leg;});
  const light=k.part(body,[-.28,.76,0]);k.capsule(light,bronze,[0,-.12,.02],.05,.14,[.5,0,0],shine);k.ball(light,dark,[0,-.22,.12],[.055,.055,.055]);
  k.add(light,new THREE.TorusGeometry(.045,.01,5,12),frame,[0,-.27,.17]);
  k.add(light,new THREE.BoxGeometry(.1,.13,.1),0xffd070,[0,-.38,.17],[1,1,1],[0,0,0],{glow:true});
  for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])k.add(light,new THREE.BoxGeometry(.018,.15,.018),frame,[x*.055,-.38,.17+z*.055]);
  k.add(light,new THREE.ConeGeometry(.08,.07,4),frame,[0,-.285,.17],[1,1,1],[0,Math.PI/4,0]);
  k.ball(light,0xffcf6a,[0,-.38,.17],[.2,.2,.2],undefined,{opacity:.18,rough:1});
  const arm=k.part(body,[.28,.76,0]);k.capsule(arm,bronze,[.02,-.12,0],.05,.14,[0,0,.15],shine);k.ball(arm,dark,[.04,-.24,.01],[.06,.06,.06]);
  return {parts:[body,...legs,light,arm],height:1.45,animate(phase){const s=Math.sin(phase);legs[0].rotation.x=s*.45;legs[1].rotation.x=-s*.45;arm.rotation.x=s*.4;light.rotation.x=-.2+Math.sin(phase+.6)*.12;body.position.y=Math.abs(Math.cos(phase))*.03;}};
 },
};
/** Board scale and stride (squares per animation cycle) for each kind. */
export const MONSTER_LOOKS:Record<string,{scale:number;stride:number}>={slime:{scale:.69,stride:.8},runner:{scale:.67,stride:.7},tinback:{scale:.71,stride:.45},moth:{scale:.69,stride:1.2},shell:{scale:.69,stride:.5},frost:{scale:.69,stride:.8},boots:{scale:.67,stride:.75},bubble:{scale:.71,stride:1.5},paper:{scale:.64,stride:.45},moss:{scale:.64,stride:.9},rubber:{scale:.69,stride:.9},lantern:{scale:.69,stride:.7}};
export const MONSTER_KINDS=Object.keys(BUILDERS);
export function createMonsterModel(id:string):MonsterModel{
 const kit=new Kit(),built=(BUILDERS[id]??BUILDERS.slime)(kit);
 return {root:kit.root,...built};
}
/** A gold crown for the chapter boss, centred on the origin with its base at y=0. */
export function createCrown(){
 const kit=new Kit(),gold=0xf0c448;
 kit.add(kit.root,new THREE.CylinderGeometry(.2,.18,.1,16,1,true),gold,[0,.05,0],[1,1,1],[0,0,0],{metal:true,rough:.3,double:true});
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;kit.add(kit.root,new THREE.ConeGeometry(.05,.14,5),gold,[Math.cos(a)*.18,.16,Math.sin(a)*.18],[1,1,1],[0,0,0],{metal:true,rough:.3});kit.ball(kit.root,i%2?0xe8465a:0x5ab7e8,[Math.cos(a)*.19,.06,Math.sin(a)*.19],[.025,.025,.025]);}
 return kit.root;
}
