import * as THREE from 'three';
import {type Kit,type V3,onEllipsoid,slab,softBox,starShape,leafShape,taperedTube,lathe,shade} from './hero-kit';
import type {Ctx} from './hero-features';
/**
 * Heads for robots, sprites and playthings: a pencil, a drum, a strawberry… Each builds its shape in face space
 * (centred on the head, front is +z) and tells the face builders where the front surface is, where eyes go and
 * where a hat sits.
 */
type Face=(x:number,y:number,lift?:number)=>{p:THREE.Vector3;n:THREE.Vector3};
/** A flat front at z=depth. */
const flat=(depth:number):Face=>(x,y,lift=0)=>({p:new THREE.Vector3(x,y,depth+lift),n:new THREE.Vector3(0,0,1)});
/** The curved front of an upright cylinder. */
const cylinder=(r:number):Face=>(x,y,lift=0)=>{const z=Math.sqrt(Math.max(0,r*r-x*x)),n=new THREE.Vector3(x,0,z).normalize();return {p:new THREE.Vector3(x,y,z).addScaledVector(n,lift),n};};
/** The front of an ellipsoid centred at `at`. */
const shell=(r:V3,at:V3=[0,0,0]):Face=>(x,y,lift=0)=>{const q=onEllipsoid(r,x-at[0],y-at[1],lift);q.p.add(new THREE.Vector3(...at));return q;};
const cone=(kit:Kit)=>kit.shared('cone',()=>new THREE.ConeGeometry(1,1,16));
const cyl=(kit:Kit,seg=32)=>kit.shared(`cyl${seg}`,()=>new THREE.CylinderGeometry(1,1,1,seg));
const torus=(kit:Kit,tube:number)=>kit.shared(`tor${tube}`,()=>new THREE.TorusGeometry(1,tube,10,40));
const seeded=(n:number)=>{let s=n;return ()=>{s=(s*9301+49297)%233280;return s/233280;};};
/** Round ear pods (headphones) on both sides of the head. */
function pods(c:Ctx,col:number,x:number,y=0,size=.16){for(const side of [-1,1]){c.kit.mesh(c.face,cyl(c.kit),col,'plastic',[side*x,y,0],[size,.1,size],[0,0,Math.PI/2]);c.kit.mesh(c.face,cyl(c.kit),shade(col,.25),'plastic',[side*(x+.05),y,0],[size*.6,.04,size*.6],[0,0,Math.PI/2]);}}
/** A curved panel lying just over the front of a round head: visors and face plates with clean edges. */
function panel(c:Ctx,R:V3,col:number,finish:'plastic'|'eye',width=.95,height=.62,lower=.08){const r:V3=[R[0]*1.03,R[1]*1.03,R[2]*1.03];c.kit.mesh(c.face,c.kit.shared(`panel${width}:${height}:${lower}`,()=>new THREE.SphereGeometry(1,40,20,Math.PI/2-width,width*2,Math.PI/2-height+lower,height*2)),col,finish,[0,0,0],r);return shell(r);}
const set=(c:Ctx,face:Face,r:V3,top:number,eye?:Partial<Ctx['eye']>)=>{c.onFace=face;c.R=r;c.top=top;c.eye={...c.eye,x:r[0]*.36,y:-r[1]*.06,...eye};};
export const HEADS:Record<string,(c:Ctx,col:number)=>void>={
 /** A round helmet with a pale face plate and ear pods (Bolt, Cobalt, Wisp). */
 visor:(c,col)=>{const {kit,face}=c,R:V3=[.6,.54,.52];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);const front=panel(c,R,c.d.accent2??0xf2f6f5,'plastic',.85,.6,.12);pods(c,c.d.accent??shade(col,-.2),.58);set(c,front,R,R[1]*.8,{x:.19,y:-.05,w:.11,h:.13});},
 /** A rounded box with a dark screen for a face and glowing eyes (Pixel). */
 screen:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,1.1,.9,.8,.22),col,'plastic');kit.mesh(face,softBox(kit,.86,.62,.1,.14),0x1d1530,'eye',[0,-.02,.37]);pods(c,c.d.accent??0x9a6ad6,.56);c.eyeStyle='glow';c.glow=c.d.accent2??0xb58cff;set(c,flat(.43),[.55,.45,.4],.45,{x:.17,y:.02,w:.1,h:.1});},
 /** A space helmet with a dark visor (Orbit). */
 helmet:(c,col)=>{const {kit,face}=c,R:V3=[.6,.56,.54];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);const front=panel(c,R,0x18223a,'plastic',.8,.46,.06);pods(c,c.d.accent??0x4a8fd9,.58);c.eyeStyle='glow';c.glow=c.d.accent2??0x6fd6ff;set(c,front,R,R[1]*.8,{x:.17,y:.0,w:.1,h:.11});},
 /** A soft box (Widget, Gizmo). */
 box:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,1.12,.94,.86,.2),col,'plastic');for(const side of [-1,1])kit.mesh(face,cyl(kit,16),c.d.accent??shade(col,-.25),'metal',[side*.58,0,0],[.09,.08,.09],[0,0,Math.PI/2]);set(c,flat(.43),[.56,.47,.43],.47,{x:.22,y:-.02});},
 /** Four clover leaves around a round face (Clover). */
 clover:(c,col)=>{const {kit,face}=c,leaf=c.d.accent??shade(col,-.25);for(const [x,y] of [[-1,1],[1,1],[-1,-1],[1,-1]])kit.ball(face,leaf,[x*.3,y*.26,-.1],[.36,.34,.3],'skin');kit.mesh(face,cyl(kit,8),shade(leaf,-.2),'skin',[.05,.62,-.1],[.03,.22,.03],[0,0,-.3]);const R:V3=[.46,.43,.44];kit.ball(face,col,[0,0,.05],R,'skin');set(c,shell(R,[0,0,.05]),[.5,.46,.45],.55,{x:.16,y:-.04,w:.1,h:.12});},
 /** An extruded star with the face on its front (Comet). */
 star:(c,col)=>{const {kit,face}=c;kit.mesh(face,kit.shared('starHead',()=>slab(starShape(.78,.42),.3,.1)),col,'skin',[0,.02,0]);set(c,flat(.25),[.5,.45,.25],.62,{x:.15,y:-.04,w:.1,h:.12});},
 /** A round face cradled by a crescent moon (Nova). */
 moon:(c,col)=>{const {kit,face}=c,R:V3=[.52,.5,.48];kit.ball(face,col,[0,0,0],R,'skin',[0,0,0],1.2);kit.mesh(face,kit.own(taperedTube([[.42,-.36,-.08],[.62,.1,-.12],[.42,.56,-.12],[0,.74,-.08],[-.3,.64,-.04]],t=>.03+.16*Math.sin(Math.PI*Math.min(1,t*1.1)),28,14)),shade(col,-.06),'skin');set(c,shell(R),R,R[1]*.8);},
 /** A round face with flame rays (Sol). */
 sun:(c,col)=>{const {kit,face}=c,R:V3=[.55,.52,.5];kit.ball(face,col,[0,0,0],R,'skin',[0,0,0],1.2);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;kit.mesh(face,cone(kit),i%2?c.d.accent??0xf29a1f:shade(col,.1),'skin',[Math.cos(a)*.62,Math.sin(a)*.6,-.12],[.13,.34,.1],[0,0,a-Math.PI/2]);}set(c,shell(R),R,R[1]*.8);},
 /** A puffy cloud (Nimbus). */
 cloud:(c,col)=>{const {kit,face}=c,R:V3=[.56,.5,.5];kit.ball(face,col,[0,0,0],R,'fur',[0,0,0],1.2);for(const [x,y,s] of [[-.45,.3,.3],[-.15,.5,.34],[.2,.52,.32],[.48,.28,.3],[.6,-.08,.26],[-.6,-.06,.26]])kit.ball(face,col,[x,y,-.08],[s,s,s*.9],'fur',[0,0,0],.5);set(c,shell(R),R,.7);},
 /** A glossy raindrop (Drizzle). */
 drop:(c,col)=>{const {kit,face}=c;kit.mesh(face,kit.shared('dropHead',()=>lathe([[0,-.52],[.36,-.46],[.54,-.18],[.5,.12],[.32,.46],[.12,.72],[0,.86]])),col,'plastic');set(c,shell([.52,.48,.52],[0,-.05,0]),[.52,.48,.5],.75);},
 /** A round face behind a snowflake crystal (Frost). */
 snowflake:(c,col)=>{const {kit,face}=c,R:V3=[.52,.5,.48],ice=c.d.accent??0xcfe9fb;kit.ball(face,col,[0,0,0],R,'skin',[0,0,0],1.2);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/2,g=new THREE.Group();g.position.set(0,.05,-.2);g.rotation.z=a-Math.PI/2;face.add(g);kit.mesh(g,kit.shared('flakeArm',()=>new THREE.BoxGeometry(.09,.5,.06)),ice,'plastic',[0,.62,0]);for(const s of [-1,1])kit.mesh(g,kit.shared('flakeBranch',()=>new THREE.BoxGeometry(.06,.2,.05)),ice,'plastic',[s*.08,.66,0],[1,1,1],[0,0,s*.8]);kit.mesh(g,kit.shared('flakeTip',()=>new THREE.OctahedronGeometry(.07)),0xffffff,'plastic',[0,.9,0]);}set(c,shell(R),R,.72);},
 /** A face crowned with crystals (Aurora, Quartz). */
 crystal:(c,col)=>{const {kit,face}=c,R:V3=[.54,.5,.48],tints=[c.d.accent??0xc9b8f2,c.d.accent2??0xb6e5f2,shade(col,.15)];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);for(let i=0;i<7;i++){const a=(i/6-.5)*2.2;kit.mesh(face,kit.shared('gem',()=>new THREE.OctahedronGeometry(1,0)),tints[i%3],'plastic',[Math.sin(a)*.42,.46+Math.cos(a)*.18,-.1],[.1,.26-Math.abs(i-3)*.03,.1],[0,i,-a*.5]);}set(c,shell(R),R,.72);},
 /** A faceted boulder with moss (Slate, Glade). */
 rock:(c,col)=>{const {kit,face}=c,R:V3=[.58,.52,.5],r=seeded(4);kit.mesh(face,kit.shared('rockHead',()=>new THREE.IcosahedronGeometry(1,1)),col,'fur',[0,0,0],R);for(let i=0;i<5;i++)kit.ball(face,c.d.accent??0x6f8a3c,[(r()-.5)*.8,.3+r()*.25,-.1+r()*.2],[.14,.06,.12],'fur',[0,0,0],.5);set(c,shell([.56,.5,.5]),R,R[1]*.85);},
 /** A face surrounded by petals (Petal). */
 flower:(c,col)=>{const {kit,face}=c,R:V3=[.46,.43,.42],petal=c.d.accent??0xf07c97;for(let i=0;i<9;i++){const a=i/9*Math.PI*2,g=new THREE.Group();g.position.set(0,0,-.12);g.rotation.z=a;face.add(g);kit.mesh(g,kit.shared('petal',()=>slab(leafShape(.42,.48),.06,.03)),i%2?petal:shade(petal,.18),'skin',[0,.3,0]);}kit.ball(face,col,[0,0,0],R,'skin',[0,0,0],1.2);set(c,shell(R),R,.7,{x:.15,w:.1,h:.12});},
 /** A spotted mushroom cap over the face (Brio). */
 mushroom:(c,col)=>{const {kit,face}=c,R:V3=[.5,.47,.46],cap=c.d.accent??0xd33a2e;kit.ball(face,col,[0,-.08,0],R,'skin',[0,0,0],1.2);kit.mesh(face,kit.shared('cap',()=>new THREE.SphereGeometry(1,36,18,0,Math.PI*2,0,Math.PI*.55)),cap,'plastic',[0,.08,0],[.8,.6,.76]);for(const [x,y,z] of [[0,.66,.2],[.42,.4,.42],[-.42,.42,.4],[.62,.18,.1],[-.6,.2,.08],[.1,.5,-.5],[-.3,.55,-.3]])kit.ball(face,0xfbf5ec,[x,y,z],[.1,.07,.1],'plastic',[0,0,0],.5);set(c,shell(R,[0,-.08,0]),R,.7,{y:-.12});},
 /** A kind wooden face with painted hair and a little pointed nose (Tinker). */
 puppet:(c,col)=>{const {kit,face}=c,R:V3=[.52,.52,.48],hair=c.d.accent??0x6b3f22;kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);kit.mesh(face,kit.shared('hair',()=>new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI*.42)),hair,'fur',[0,.02,-.03],[.56,.57,.53],[-.35,0,0]);for(let i=0;i<4;i++)kit.mesh(face,cone(kit),hair,'fur',[-.2+i*.13,.46,.3],[.08,.2,.06],[1.2,0,-.3+i*.2]);for(const side of [-1,1])kit.ball(face,col,[side*.52,-.04,0],[.08,.12,.07],'plastic');set(c,shell(R),R,.55);},
 /** A lighthouse lantern with a red roof (Beacon). */
 lighthouse:(c,col)=>{const {kit,face}=c,roof=c.d.accent??0xc9423a;kit.mesh(face,cyl(kit),col,'plastic',[0,-.02,0],[.5,.8,.5]);kit.mesh(face,torus(kit,.08),roof,'plastic',[0,-.42,0],[.52,.52,.52],[Math.PI/2,0,0]);kit.mesh(face,cone(kit),roof,'plastic',[0,.55,0],[.6,.34,.6]);kit.ball(face,roof,[0,.76,0],[.07,.07,.07],'plastic');kit.mesh(face,cyl(kit),0xf6d86a,'glow',[0,.3,0],[.44,.12,.44]);set(c,cylinder(.5),[.5,.4,.5],.5,{y:-.1,x:.17,w:.1,h:.12});},
 /** A faceted gem (Prism). */
 gem:(c,col)=>{const {kit,face}=c,R:V3=[.58,.56,.5];kit.mesh(face,kit.shared('gemHead',()=>new THREE.IcosahedronGeometry(1,0)),col,'plastic',[0,0,0],R);set(c,shell([.5,.48,.48]),R,.56);},
 /** A yellow pencil with a sharpened tip (Scribble). */
 pencil:(c,col)=>{const {kit,face}=c;kit.mesh(face,kit.shared('hex',()=>new THREE.CylinderGeometry(1,1,1,6)),col,'plastic',[0,-.05,0],[.52,.84,.52],[0,Math.PI/6,0]);kit.mesh(face,kit.shared('hexCone',()=>new THREE.ConeGeometry(1,1,6)),0xe5c393,'fur',[0,.55,0],[.52,.36,.52],[0,Math.PI/6,0]);kit.mesh(face,cone(kit),0x3b3b44,'plastic',[0,.8,0],[.12,.14,.12]);kit.mesh(face,cyl(kit),0xc9c2b8,'metal',[0,-.5,0],[.53,.12,.53]);set(c,cylinder(.46),[.5,.42,.46],.72,{y:-.08});},
 /** A crayon with its paper wrapper (Doodle). */
 crayon:(c,col)=>{const {kit,face}=c;kit.mesh(face,cyl(kit),col,'plastic',[0,-.05,0],[.47,.86,.47]);for(const y of [-.36,.3])kit.mesh(face,cyl(kit),shade(col,-.25),'plastic',[0,y,0],[.49,.06,.49]);kit.mesh(face,cone(kit),col,'plastic',[0,.58,0],[.4,.36,.4]);set(c,cylinder(.47),[.47,.42,.47],.7,{y:-.06});},
 /** A shiny fountain-pen nib with its slit (Inky). */
 nib:(c,col)=>{const {kit,face}=c,R:V3=[.5,.58,.42];kit.ball(face,col,[0,0,0],R,'metal',[0,0,0],1.2);kit.mesh(face,cone(kit),col,'metal',[0,.66,0],[.3,.5,.26]);kit.mesh(face,kit.shared('slit',()=>new THREE.BoxGeometry(.018,.4,.05)),0x3a3a44,'plastic',[0,.62,.2],[1,1,1],[-.35,0,0]);kit.ball(face,0x3a3a44,[0,.42,.3],[.05,.05,.03],'plastic');set(c,shell(R),R,.8,{y:-.14});},
 /** A hardback book with pages and a ribbon (Bookmark). */
 book:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,1.05,1.0,.5,.06),col,'plastic');kit.mesh(face,kit.shared('pages',()=>new THREE.BoxGeometry(.92,.9,.42)),0xf7efdf,'cloth',[.08,0,0]);kit.mesh(face,kit.shared('ribbon',()=>new THREE.BoxGeometry(.07,.5,.02)),0xd8434a,'cloth',[.25,.62,.05],[1,1,1],[0,0,-.15]);set(c,flat(.25),[.52,.5,.25],.5);},
 /** A stick of chalk (Chalky). */
 chalk:(c,col)=>{const {kit,face}=c;kit.mesh(face,cyl(kit),col,'fur',[0,-.08,0],[.48,.9,.48]);kit.ball(face,col,[0,.37,0],[.48,.14,.48],'fur');set(c,cylinder(.48),[.48,.45,.48],.5);},
 /** A wooden yo-yo, face on the front disc (YoYo). */
 yoyo:(c,col)=>{const {kit,face}=c;for(const z of [-.15,.15])kit.mesh(face,cyl(kit,40),z>0?col:shade(col,-.1),'plastic',[0,0,z],[.64,.24,.64],[Math.PI/2,0,0]);kit.mesh(face,cyl(kit,20),shade(col,-.35),'plastic',[0,0,0],[.36,.1,.36],[Math.PI/2,0,0]);kit.mesh(face,torus(kit,.05),shade(col,.15),'plastic',[0,0,.27],[.6,.6,.6]);set(c,flat(.27),[.56,.56,.27],.64);},
 /** A domino with pips around the face (Domino). */
 domino:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,.9,1.14,.46,.14),col,'plastic');for(const [x,y] of [[-.27,.4],[.27,.4],[-.27,-.42],[.27,-.42],[0,.42]])kit.ball(face,0x2a2323,[x,y,.23],[.055,.055,.02],'plastic',[0,0,0],.5);set(c,flat(.23),[.45,.5,.23],.57,{x:.16,w:.1,h:.12});},
 /** A jigsaw piece (Puzzle). */
 jigsaw:(c,col)=>{const {kit,face}=c;const s=new THREE.Shape();s.moveTo(-.42,-.42);s.lineTo(-.1,-.42);s.absarc(0,-.42,.12,Math.PI,0,true);s.lineTo(.42,-.42);s.lineTo(.42,-.1);s.absarc(.42,0,.13,-Math.PI/2,Math.PI/2,false);s.lineTo(.42,.42);s.lineTo(.12,.42);s.absarc(0,.5,.14,-.15,Math.PI+.15,false);s.lineTo(-.42,.42);s.lineTo(-.42,.1);s.absarc(-.52,0,.12,Math.PI/2,-Math.PI/2,false);s.closePath();kit.mesh(face,kit.shared('jig',()=>slab(s,.24,.08)),col,'plastic');set(c,flat(.2),[.48,.46,.2],.62);},
 /** A die with pips on its other sides (Dicey). */
 dice:(c,col)=>{const {kit,face}=c,pip=c.d.accent??0x2c4a86;kit.mesh(face,softBox(kit,1,1,1,.2),col,'plastic');for(const [x,z] of [[-.25,-.25],[.25,.25],[0,0],[-.25,.25],[.25,-.25]])kit.ball(face,pip,[x,.5,z],[.07,.02,.07],'plastic',[0,0,0],.5);for(const side of [-1,1])for(const [y,z] of [[.25,.25],[-.25,-.25]])kit.ball(face,pip,[side*.5,y,z],[.02,.07,.07],'plastic',[0,0,0],.5);set(c,flat(.5),[.5,.5,.5],.5);},
 /** A toy steam engine (Rollo). */
 train:(c,col)=>{const {kit,face}=c,trim=c.d.accent??0xf2c14e;kit.mesh(face,softBox(kit,1.04,.96,.9,.26),col,'plastic');kit.mesh(face,cyl(kit),shade(col,-.2),'plastic',[0,.58,-.05],[.13,.26,.13]);kit.mesh(face,cone(kit),shade(col,-.2),'plastic',[0,.76,-.05],[.2,.14,.2],[Math.PI,0,0]);kit.mesh(face,torus(kit,.06),trim,'metal',[0,0,.46],[.44,.44,.44]);kit.mesh(face,kit.shared('buffer',()=>new THREE.BoxGeometry(1.1,.1,.2)),0x2d2a2c,'plastic',[0,-.44,.3]);set(c,flat(.45),[.52,.48,.45],.5);},
 /** A toy boat with a cabin and funnel (Sailor). */
 boat:(c,col)=>{const {kit,face}=c,red=c.d.accent??0xc93a33,blue=c.d.accent2??0x21456f;kit.mesh(face,softBox(kit,1.14,.66,.8,.24),col,'plastic',[0,-.1,0]);kit.mesh(face,softBox(kit,1.18,.18,.84,.08),blue,'plastic',[0,-.38,0]);kit.mesh(face,kit.shared('stripe',()=>new THREE.BoxGeometry(1.16,.06,.82)),red,'plastic',[0,-.24,0]);kit.mesh(face,softBox(kit,.6,.3,.5,.08),0xf6f1e8,'plastic',[0,.36,-.05]);kit.mesh(face,cyl(kit),red,'plastic',[.1,.62,-.08],[.1,.3,.1]);kit.mesh(face,cyl(kit),0xf6f1e8,'plastic',[.1,.66,-.08],[.105,.08,.105]);set(c,flat(.4),[.55,.33,.4],.52,{y:-.08});},
 /** A toy rocket's nose (Rocket). */
 rocket:(c,col)=>{const {kit,face}=c,red=c.d.accent??0xd9362f;kit.mesh(face,cyl(kit),col,'plastic',[0,-.1,0],[.46,.78,.46]);kit.mesh(face,cone(kit),red,'plastic',[0,.56,0],[.46,.55,.46]);kit.mesh(face,torus(kit,.18),0x6fa7d8,'plastic',[0,.34,.46],[.1,.1,.1]);for(const side of [-1,1])kit.mesh(face,kit.shared('rfin',()=>slab(leafShape(.3,.5),.05,.02)),red,'plastic',[side*.48,-.3,0],[1,1,1],[0,0,side*.5]);set(c,cylinder(.46),[.46,.4,.46],.8,{y:-.14});},
 /** A golden bell with a hanging loop (Chime). */
 bell:(c,col)=>{const {kit,face}=c;kit.mesh(face,kit.shared('bellHead',()=>lathe([[0,.62],[.2,.6],[.34,.44],[.4,.14],[.46,-.22],[.6,-.44],[.62,-.5],[0,-.5]])),col,'plastic');kit.mesh(face,torus(kit,.25),shade(col,-.1),'metal',[0,.72,0],[.13,.13,.13]);set(c,shell([.46,.5,.47],[0,-.04,0]),[.5,.5,.46],.62,{y:-.1});},
 /** A drum: red shell, white skins and zig-zag cords (Tempo). */
 drum:(c,col)=>{const {kit,face}=c;kit.mesh(face,cyl(kit),col,'plastic',[0,0,0],[.56,.76,.56]);for(const y of [-.38,.38]){kit.mesh(face,cyl(kit),0xf8f3ea,'cloth',[0,y,0],[.555,.03,.555]);kit.mesh(face,torus(kit,.06),0xc9ced3,'metal',[0,y,0],[.57,.57,.57],[Math.PI/2,0,0]);}for(let i=0;i<10;i++){const a=i/10*Math.PI*2,b=(i+.5)/10*Math.PI*2;if(Math.abs(Math.sin(a))<.55&&Math.cos(a)>0)continue;kit.mesh(face,kit.own(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(Math.sin(a)*.57,.34,Math.cos(a)*.57),new THREE.Vector3(Math.sin(b)*.57,-.34,Math.cos(b)*.57)),1,.012,4,false)),0xf8f3ea,'cloth');}set(c,cylinder(.56),[.56,.38,.56],.4);},
 /** A music note: the round head, a stem and a flag (Melody). */
 note:(c,col)=>{const {kit,face}=c,R:V3=[.56,.48,.5];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);kit.mesh(face,cyl(kit,12),col,'plastic',[.4,.6,-.1],[.07,.9,.07]);kit.mesh(face,kit.own(taperedTube([[.4,1.02,-.1],[.62,.9,-.08],[.72,.66,-.06],[.62,.52,-.05]],t=>.08*(1-t*.6),16,10)),col,'plastic');set(c,shell(R),R,.46);},
 /** A backpack with a pocket, a zip and a carry loop (Zip). */
 backpack:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,1.06,1.02,.72,.3),col,'plastic');kit.mesh(face,softBox(kit,.64,.26,.16,.1),shade(col,.12),'plastic',[0,-.4,.36]);kit.mesh(face,kit.own(new THREE.TorusGeometry(.46,.02,6,30,Math.PI)),0x9aa3ab,'metal',[0,.02,.35]);kit.mesh(face,torus(kit,.16),shade(col,-.2),'plastic',[0,.56,0],[.15,.15,.15]);set(c,flat(.36),[.5,.5,.36],.51,{y:.12});},
 /** A kettle with a lid and knob (Kettle). */
 kettle:(c,col)=>{const {kit,face}=c,R:V3=[.58,.52,.52];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);kit.mesh(face,cyl(kit),shade(col,.12),'plastic',[0,.46,0],[.3,.06,.3]);kit.ball(face,0x3a3a44,[0,.55,0],[.08,.07,.08],'plastic');pods(c,c.d.accent??0xe8ecea,.56);set(c,shell(R),R,.6);},
 /** A ribbed pumpkin with its stalk (Pipkin). */
 pumpkin:(c,col)=>{const {kit,face}=c;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;kit.ball(face,i%2?col:shade(col,-.08),[Math.sin(a)*.28,0,Math.cos(a)*.26],[.36,.5,.34],'skin');}kit.mesh(face,kit.own(taperedTube([[0,.4,0],[.02,.58,0],[.1,.66,.02]],()=>.05,8,8)),0x5a6b2a,'skin');set(c,shell([.6,.5,.58]),[.6,.5,.58],.5);},
 /** A strawberry with seeds and a leafy crown (Berry). */
 strawberry:(c,col)=>{const {kit,face}=c;kit.mesh(face,kit.shared('berry',()=>lathe([[0,-.6],[.2,-.52],[.42,-.24],[.56,.1],[.52,.32],[.3,.46],[0,.48]])),col,'plastic');const r=seeded(9);for(let i=0;i<16;i++){const a=(r()-.5)*2.6,y=-.4+r()*.7;const rad=y<-.2?.34:.5;kit.ball(face,0xf6d78a,[Math.sin(a)*rad,y,Math.cos(a)*rad],[.022,.032,.02],'plastic',[0,0,0],.4);}for(let i=0;i<6;i++){const a=i/6*Math.PI*2,g=new THREE.Group();g.position.set(0,.46,0);g.rotation.set(0,a,0);face.add(g);kit.mesh(g,kit.shared('sepal',()=>slab(leafShape(.2,.36),.03,.01)),0x4f8a2e,'skin',[0,0,.08],[1,1,1],[-1.2,0,0]);}set(c,shell([.52,.5,.5],[0,-.02,0]),[.55,.5,.5],.5,{y:-.02});},
 /** An orange with a leaf (Zest). */
 orange:(c,col)=>{const {kit,face}=c,R:V3=[.58,.54,.54];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);kit.mesh(face,cyl(kit,8),0x5a4a2a,'skin',[0,.56,0],[.03,.1,.03]);const g=new THREE.Group();g.position.set(.05,.58,0);g.rotation.set(0,0,-1.1);face.add(g);kit.mesh(g,kit.shared('leafO',()=>slab(leafShape(.24,.44),.03,.01)),0x4f8f2b,'skin');set(c,shell(R),R,.54);},
 /** A hairy coconut (Coco). */
 coconut:(c,col)=>{const {kit,face}=c,R:V3=[.58,.54,.54],r=seeded(13);kit.ball(face,col,[0,0,0],R,'fur',[0,0,0],1.2);for(let i=0;i<28;i++){const a=r()*Math.PI*2,el=.35+r()*1.1,x=Math.cos(a)*Math.cos(el)*.56,y=Math.sin(el)*.52,z=Math.sin(a)*Math.cos(el)*.52;if(z>.25&&y<.3)continue;kit.mesh(face,cone(kit),shade(col,-.2),'fur',[x,y,z],[.03,.12,.03],[z*1.5,0,-x*1.5]);}set(c,shell(R),R,.54);},
 /** A glossy bell pepper with a green stalk (Peppy). */
 pepper:(c,col)=>{const {kit,face}=c;for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;kit.ball(face,col,[Math.sin(a)*.22,-.02,Math.cos(a)*.2],[.38,.52,.36],'plastic');}kit.mesh(face,kit.own(taperedTube([[0,.36,0],[0,.52,0],[.1,.66,.02],[.2,.66,.02]],()=>.06,10,8)),0x3f8a2a,'skin');set(c,shell([.54,.5,.52]),[.58,.5,.52],.5);},
 /** A waffle square with its grid (Waffle). */
 waffle:(c,col)=>{const {kit,face}=c;kit.mesh(face,softBox(kit,1.1,1.1,.36,.18),col,'plastic');const ridge=shade(col,.12);for(let i=0;i<4;i++){const p=-.36+i*.24;kit.mesh(face,kit.shared('ridgeH',()=>new THREE.BoxGeometry(.98,.05,.05)),ridge,'plastic',[0,p,.18]);kit.mesh(face,kit.shared('ridgeV',()=>new THREE.BoxGeometry(.05,.98,.05)),ridge,'plastic',[p,0,.18]);}set(c,flat(.22),[.55,.55,.18],.56);},
 /** A soft white rice cake dome (Mochi). */
 mochi:(c,col)=>{const {kit,face}=c,R:V3=[.64,.47,.54];kit.ball(face,col,[0,-.02,0],R,'skin',[0,0,0],1.2);kit.ball(face,shade(col,-.08),[0,.38,0],[.26,.06,.22],'skin');set(c,shell(R,[0,-.02,0]),R,.4,{y:-.1});},
 /** A pretzel twist around the face (Pretzel). */
 pretzel:(c,col)=>{const {kit,face}=c,R:V3=[.44,.4,.36];kit.ball(face,col,[0,-.05,0],R,'fur',[0,0,0],1.2);const loop=(pts:V3[])=>kit.mesh(face,kit.own(taperedTube(pts,()=>.12,40,12)),shade(col,-.08),'fur');loop([[-.05,-.42,.1],[-.5,-.3,.05],[-.62,.2,0],[-.3,.55,-.05],[0,.3,.08],[.3,.55,-.05],[.62,.2,0],[.5,-.3,.05],[.05,-.42,.1]]);const r=seeded(2);for(let i=0;i<12;i++){const a=r()*Math.PI*2;kit.mesh(face,kit.shared('salt',()=>new THREE.BoxGeometry(.035,.035,.035)),0xffffff,'plastic',[Math.cos(a)*.56,Math.sin(a)*.44+.08,.12],[1,1,1],[a,a,0]);}set(c,shell(R,[0,-.05,0]),[.5,.46,.36],.6,{y:-.08});},
 /** A swirly candy (Taffy). */
 candy:(c,col)=>{const {kit,face}=c,R:V3=[.56,.54,.54],tints=[c.d.accent??0xf29bb6,c.d.accent2??0x9cc8ec,0xf7d98a];kit.ball(face,col,[0,0,0],R,'plastic',[0,0,0],1.2);for(let k=0;k<3;k++){const pts:V3[]=Array.from({length:25},(_,i)=>{const t=i/24,y=-.52+t*1.04,r=Math.sqrt(Math.max(0,1-(y/.54)**2))*.565,a=t*Math.PI*2.4+k*Math.PI*2/3;return [Math.sin(a)*r,y,Math.cos(a)*r];});kit.mesh(face,kit.own(taperedTube(pts,t=>.07*Math.sin(Math.PI*t)+.01,48,8)),tints[k],'plastic');}set(c,shell([.6,.56,.58]),[.58,.54,.56],.54);},
 /** A fluffy seed head (Dandy). */
 dandelion:(c,col)=>{const {kit,face}=c,R:V3=[.5,.48,.46],fluff=c.d.accent??0xf6f2ea;kit.ball(face,col,[0,0,0],R,'fur',[0,0,0],1.2);const r=seeded(21);for(let i=0;i<46;i++){const u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u),dir=new THREE.Vector3(s*Math.cos(a),u,s*Math.sin(a));if(dir.z>.35&&Math.abs(dir.y)<.62&&Math.abs(dir.x)<.7)continue;const p=dir.clone().multiply(new THREE.Vector3(.62,.6,.58));kit.ball(face,fluff,[p.x,p.y,p.z],[.13,.13,.13],'fur',[0,0,0],.4);}set(c,shell(R),[.52,.5,.48],.66);},
};
