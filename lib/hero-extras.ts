import * as THREE from 'three';
import {type Kit,type V3,onEllipsoid,surfaceFrame,slab,earShape,leafShape,starShape,taperedTube,shade} from './hero-kit';
import type {Ctx} from './hero-features';
/**
 * Named features from the 2D art (manes, stripes, wings, shells…). A design lists them as "name" or "name#rrggbb";
 * the colour overrides the feature's default.
 */
const cone=(kit:Kit)=>kit.shared('cone',()=>new THREE.ConeGeometry(1,1,12));
type Finish='fur'|'skin'|'plastic';
/** A patch lying on the face surface. */
export function facePatch(c:Ctx,x:number,y:number,size:V3,colour:number,roll=0,sink=.018,finish:Finish='fur'){const q=c.onFace(x,y,-sink),f=surfaceFrame(c.face,q.p,q.n,roll);c.kit.ball(f,colour,[0,0,0],size,finish,[0,0,0],.5);return f;}
/** A patch lying on the torso (trunk space): stripes, spots, scales. */
export function bodyPatch(c:Ctx,angle:number,y:number,size:V3,colour:number,roll=0,finish:Finish='fur'){const q=c.onTorso(angle,y,-.012),f=surfaceFrame(c.trunk,q.p,q.n,roll);c.kit.ball(f,colour,[0,0,0],size,finish,[0,0,0],.5);return f;}
/** A cone standing out of the torso: spikes and ridges. */
function bodySpike(c:Ctx,angle:number,y:number,len:number,width:number,colour:number){const q=c.onTorso(angle,y,-.02),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,cone(c.kit),colour,'fur',[0,0,len/2],[width,len,width],[Math.PI/2,0,0]);}
/** Repeatable pseudo-random numbers, so a hero always gets the same spots. */
const seeded=(n:number)=>{let s=n;return ()=>{s=(s*9301+49297)%233280;return s/233280;};};
const torsoAt=(c:Ctx,y:number)=>c.onTorso(0,y).p.z;
const finishOf=(c:Ctx):Finish=>c.d.finish??(c.d.build==='robot'||c.d.build==='toy'?'plastic':c.d.build==='sprite'?'skin':'fur');
function wingShape(){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.2,.5,.62,.6);s.quadraticCurveTo(.58,.4,.66,.24);s.quadraticCurveTo(.48,.24,.46,.08);s.quadraticCurveTo(.3,.14,.24,-.04);s.quadraticCurveTo(.12,.06,0,0);return s;}
/** A pair of flat wings on the back, mirrored. */
function backWings(c:Ctx,geometry:THREE.BufferGeometry,colour:number,y:number,spread:number,tilt=0,finish:Finish='skin',scale=1){for(const side of [-1,1]){const g=new THREE.Group();g.position.set(side*.12*c.plump,y,-.28*c.plump);g.rotation.set(-.15,side*spread,side*-tilt);g.scale.set(side*scale,scale,scale);c.body.add(g);c.kit.twoSided(c.kit.mesh(g,geometry,colour,finish));}}
export const EXTRAS:Record<string,(c:Ctx,col?:number)=>void>={
 'cheek-fluff':(c,col=c.d.muzzleColour??c.d.belly??c.d.fur)=>{const {kit,face,R}=c;for(const side of [-1,1])for(let i=0;i<3;i++){const q=onEllipsoid(R,side*R[0]*.9,-R[1]*(.08+i*.14));kit.mesh(face,cone(kit),col,'fur',[q.p.x,q.p.y,q.p.z-.12],[.075-i*.01,.2-i*.03,.07],[0,0,-side*(1.75+i*.3)]);}},
 whiskers:(c,col=0xfdfaf2)=>{const {kit,face,R}=c;for(const side of [-1,1])for(let i=0;i<3;i++){const a=c.onFace(side*R[0]*.28,-R[1]*.4,.02).p,b=a.clone().add(new THREE.Vector3(side*.3,(1-i)*.06,-.04));kit.mesh(face,kit.own(new THREE.TubeGeometry(new THREE.LineCurve3(a,b),2,.007,5,false)),col,'plastic');}},
 mask:(c,col=0x2d2626)=>{for(const side of [-1,1])facePatch(c,side*c.eye.x*1.15,c.eye.y+.01,[c.eye.w*1.9,c.eye.h*1.35,.05],col,side*.25,.03);},
 'eye-patches':(c,col=0x2a2627)=>{for(const side of [-1,1])facePatch(c,side*c.eye.x*1.05,c.eye.y-.02,[c.eye.w*1.5,c.eye.h*1.4,.05],col,-side*.55,.03);},
 brows:(c,col=0xfdf6ea)=>{for(const side of [-1,1])facePatch(c,side*c.eye.x*1.05,c.eye.y+c.eye.h*1.75,[.08,.038,.03],col,side*-.2,.012);},
 'cheek-patches':(c,col=0xfaf1e6)=>{for(const side of [-1,1])facePatch(c,side*c.R[0]*.62,-c.R[1]*.3,[.17,.13,.06],col,0,.04);},
 blaze:(c,col=0xf8f1e8)=>{facePatch(c,0,c.R[1]*.3,[.07,c.R[1]*.55,.05],col,0,.035);},
 // Two dark bands run from beside the nose, over each eye, back towards the ears.
 badger:(c,col=0x2a2627)=>{const {R}=c;for(const side of [-1,1])for(let i=0;i<7;i++){const t=i/6;facePatch(c,side*(c.eye.x*.72+t*R[0]*.2),R[1]*(-.28+t*1.12),[.085,.09,.05],col,side*.2,.03);}},
 'sloth-mask':(c,col=0x5a3a26)=>{facePatch(c,0,-.02,[c.R[0]*.72,c.R[1]*.62,.06],0xefdcc4,0,.045);for(const side of [-1,1])facePatch(c,side*c.eye.x*1.1,c.eye.y-.02,[c.eye.w*1.9,c.eye.h*.95,.05],col,side*.35,.025);},
 'shoulder-band':(c,col=c.d.limbs??0x2a2627)=>{c.kit.mesh(c.trunk,c.kit.own(new THREE.TorusGeometry(torsoAt(c,1.05)*.95,.1,10,40)),col,finishOf(c),[0,1.05,0],[1,1,1],[Math.PI/2,0,0]);},
 stripes:(c,col=0x3a2418)=>{const {R}=c;for(const x of [-.1,0,.1])facePatch(c,x,R[1]*(.62+(x?0:.05)),[.028,.1,.03],col,x*2);for(const side of [-1,1])for(let i=0;i<2;i++)facePatch(c,side*R[0]*.78,R[1]*(-.02-i*.16),[.1,.025,.03],col,side*(.25+i*.15));for(let i=0;i<5;i++)for(const side of [-1,1])bodyPatch(c,side*(1.25+(i%2)*.25),.62+i*.11,[.035,.09,.03],col,side*.3);for(let i=0;i<4;i++)bodyPatch(c,Math.PI,.66+i*.12,[.11,.028,.03],col);},
 spots:(c,col=0x4c4446)=>{const r=seeded(7);for(let i=0;i<18;i++)bodyPatch(c,(r()-.5)*Math.PI*1.7+Math.PI,.58+r()*.5,[.035,.035,.025],col);for(let i=0;i<7;i++)facePatch(c,(r()-.5)*.7,c.R[1]*(.35+r()*.4),[.03,.03,.025],col,0,.012);},
 'fawn-spots':(c,col=0xfbf3e6)=>{const r=seeded(3);for(let i=0;i<12;i++)bodyPatch(c,Math.PI+(r()-.5)*2.2,.66+r()*.4,[.035,.028,.025],col);},
 mane:(c,col=0x9c4a1c)=>{const {kit,face,R}=c,col2=shade(col,-.14);for(let i=0;i<18;i++){const a=i/18*Math.PI*2,rr=R[0]*1.02;kit.ball(face,i%2?col:col2,[Math.cos(a)*rr,Math.sin(a)*R[1]*1.08-.03,-.12],[.2,.2,.18],'fur',[0,0,0],.45);}for(let i=0;i<9;i++){const a=i/9*Math.PI*2;kit.ball(face,col,[Math.cos(a)*R[0]*.78,Math.sin(a)*R[1]*.9,-.3],[.19,.19,.17],'fur',[0,0,0],.45);}},
 spikes:(c,col=0x5b3a26)=>{const {kit,face,R}=c,tip=shade(col,.18);
  for(let row=0;row<6;row++)for(let i=0;i<13;i++){const a=(i/12-.5)*Math.PI*(1.1+row*.08),el=1.05-row*.2,x=Math.sin(a)*Math.cos(el)*R[0],y=Math.sin(el)*R[1]+.02,z=-Math.cos(a)*Math.cos(el)*R[2]*.6-.05;const n=new THREE.Vector3(x/R[0]**2,y/R[1]**2,z/R[2]**2).normalize(),f=surfaceFrame(face,new THREE.Vector3(x,y,z),n);kit.mesh(f,cone(kit),i%2?col:tip,'fur',[0,0,.1],[.075,.26,.075],[Math.PI/2,0,0]);}
  for(let row=0;row<4;row++)for(let i=0;i<7;i++)bodySpike(c,Math.PI+(i/6-.5)*2.4,.62+row*.14,.22,.07,i%2?col:tip);},
 horns:(c,col=0xf2e0b0)=>{const {kit,face,R}=c;for(const side of [-1,1]){const b=onEllipsoid(R,side*R[0]*.42,R[1]*.72).p;kit.mesh(face,kit.own(taperedTube([[b.x,b.y-.03,b.z-.1],[b.x+side*.05,b.y+.14,b.z-.16],[b.x+side*.02,b.y+.26,b.z-.3]],t=>.075*(1-t*.85),12,10)),col,'plastic');}},
 'small-horns':(c,col=0xf2e6c8)=>{const {kit,face,R}=c;for(const side of [-1,1]){const b=onEllipsoid(R,side*R[0]*.55,R[1]*.62).p;kit.mesh(face,cone(kit),col,'plastic',[b.x,b.y+.04,b.z-.12],[.06,.18,.06],[0,0,-side*.35]);}},
 antlers:(c,col=0x7a5234)=>{const {kit,face,R}=c;for(const side of [-1,1]){const b=onEllipsoid(R,side*R[0]*.35,R[1]*.8).p,x=b.x,y=b.y,z=b.z-.12;
  kit.mesh(face,kit.own(taperedTube([[x,y-.04,z],[x+side*.08,y+.2,z-.02],[x+side*.2,y+.42,z-.04]],t=>.035*(1-t*.5),10,8)),col,'plastic');
  kit.mesh(face,kit.own(taperedTube([[x+side*.1,y+.25,z-.02],[x+side*.02,y+.4,z]],t=>.025*(1-t*.5),6,8)),col,'plastic');
  kit.mesh(face,kit.own(taperedTube([[x+side*.16,y+.34,z-.03],[x+side*.3,y+.42,z-.02]],t=>.022*(1-t*.5),6,8)),col,'plastic');}},
 wings:(c,col=shade(c.d.fur,.2))=>backWings(c,c.kit.shared('wing',()=>slab(wingShape(),.03,.012)),col,.95,.55),
 'bat-wings':(c,col=shade(c.d.fur,.15))=>backWings(c,c.kit.shared('wing',()=>slab(wingShape(),.03,.012)),col,.98,.35,.2,'skin',1.35),
 'insect-wings':(c,col=0xeef6f7)=>{const {kit,body}=c;for(const side of [-1,1])for(const [y,s,r] of [[1.0,1,.35],[.78,.7,.8]] as const){const g=new THREE.Group();g.position.set(side*.12,y,-.3);g.rotation.set(0,side*.35,side*-r);body.add(g);kit.ball(g,col,[side*.28*s,.12*s,0],[.3*s,.18*s,.02],'plastic');}},
 'butterfly-wings':(c,col=0xea8fa0)=>{const {kit,body}=c;for(const side of [-1,1])for(const [y,s,r,tone] of [[1.02,1,-.25,col],[.74,.72,.55,shade(col,-.12)]] as const){const g=new THREE.Group();g.position.set(side*.12,y,-.28);g.rotation.set(0,side*.4,side*r);body.add(g);kit.ball(g,tone,[side*.36*s,.1*s,0],[.38*s,.3*s,.02],'plastic');kit.ball(g,0xf6d15a,[side*.44*s,.14*s,.018],[.12*s,.1*s,.012],'plastic');kit.ball(g,0x5b2d5c,[side*.62*s,.2*s,.018],[.06*s,.06*s,.012],'plastic');}},
 antennae:(c,col=0x2c2a2a)=>{const {kit,face,R}=c;for(const side of [-1,1]){const b=onEllipsoid(R,side*R[0]*.28,R[1]*.86).p,x=b.x,y=b.y,z=b.z-.05;const pts:V3[]=[[x,y-.03,z],[x+side*.05,y+.2,z+.02],[x+side*.16,y+.36,z+.02]];kit.mesh(face,kit.own(taperedTube(pts,()=>.018,10,6)),col,'plastic');kit.ball(face,col,pts[2],[.055,.055,.055],'plastic');}},
 gills:(c,col=0xd8667a)=>{const {kit,face,R}=c;for(const side of [-1,1])for(let i=0;i<3;i++){const a=(i-1)*.45,b=new THREE.Vector3(side*R[0]*.88,R[1]*(.05+i*.22)-.05,-.05),e=b.clone().add(new THREE.Vector3(side*Math.cos(a)*.24,Math.sin(a)*.24+.08,0));kit.mesh(face,kit.own(taperedTube([[b.x,b.y,b.z],[(b.x+e.x)/2,(b.y+e.y)/2+.03,b.z],[e.x,e.y,e.z]],t=>.035*(1-t*.3),8,8)),col,'skin');for(let k=0;k<3;k++)kit.ball(face,shade(col,.15),[e.x-side*k*.05,e.y+(k-1)*.035,e.z],[.045,.035,.035],'skin',[0,0,0],.5);}},
 // A domed shell the body sits inside, with raised plates; the tummy plate shows at the front.
 shell:(c,col=0x8a6a3b)=>{const {kit,body,plump}=c,plate=shade(col,.16),g=new THREE.Group();g.position.set(0,.8,-.12*plump);g.scale.set(plump,1,plump);body.add(g);
  kit.ball(g,col,[0,0,0],[.54,.5,.44],'plastic');
  for(const [a,y] of [[Math.PI,.12],[Math.PI,-.15],[Math.PI*.72,0],[-Math.PI*.72,0],[Math.PI*.55,.2],[-Math.PI*.55,.2],[Math.PI*.55,-.2],[-Math.PI*.55,-.2]]){const n=new THREE.Vector3(Math.sin(a)*.9,y*1.4,Math.cos(a)*.9).normalize(),p=new THREE.Vector3(n.x*.54,n.y*.5,n.z*.44),f=surfaceFrame(g,p,n);kit.mesh(f,kit.shared('plate',()=>new THREE.CylinderGeometry(.13,.14,.05,6)),plate,'plastic',[0,0,0],[1,1,1],[Math.PI/2,0,0]);}},
 'face-mask':(c,col=0xf6f1ea)=>{const {R}=c;for(const side of [-1,1])facePatch(c,side*R[0]*.3,-R[1]*.12,[R[0]*.42,R[1]*.55,.07],col,side*-.2,.05);},
 tuft:(c,col=c.d.fur)=>{const {kit,face,R}=c;for(let i=0;i<3;i++)kit.mesh(face,cone(kit),col,'fur',[(i-1)*.06,R[1]*.98,.05-i*.03],[.05,.22,.05],[-.2,0,(i-1)*-.45]);},
 crest:(c,col=shade(c.d.fur,.2))=>{const {kit,face,R}=c;for(let i=0;i<5;i++){const a=.2+i*.3;kit.mesh(face,cone(kit),col,'skin',[0,Math.cos(a)*R[1]*.98,-Math.sin(a)*R[2]*.98],[.08,.36-i*.04,.07],[-a,0,0]);}},
 'dorsal-fin':(c,col=c.d.fur)=>{c.kit.mesh(c.body,c.kit.shared('fin',()=>slab(earShape(.3,.34,.2),.05,.02)),col,'skin',[0,.95,-.36*c.plump],[1,1,1],[-.9,Math.PI/2,0]);},
 'koala-nose':(c,col=0x2f2a2c)=>{const q=c.onFace(0,-c.R[1]*.28),f=surfaceFrame(c.face,q.p,q.n);c.kit.ball(f,col,[0,0,.02],[.1,.13,.07],'eye');c.kit.ball(f,0xffffff,[-.03,.05,.085],[.02,.03,.01],'glow',[0,0,0],.4);},
 claws:(c,col=0xefe3cf)=>{for(const arm of c.arms)for(let i=-1;i<=1;i++)c.kit.mesh(arm,cone(c.kit),col,'plastic',[i*.045,-.4,.05],[.022,.12,.022],[Math.PI,0,0]);},
 'back-ridges':(c,col=shade(c.d.fur,-.2))=>{for(let i=0;i<6;i++)bodySpike(c,Math.PI,.6+i*.1,.13,.05,col);},
 'belly-scales':(c,col=shade(c.d.belly??0xf0dfa0,-.15))=>{for(let i=0;i<4;i++)bodyPatch(c,0,.62+i*.1,[.2,.01,.02],col);},
 wool:(c,col=shade(c.d.fur,.1))=>{const {kit,face,R}=c,r=seeded(5);for(let i=0;i<12;i++){const a=r()*Math.PI*2,rr=r()*.25;kit.ball(face,col,[Math.cos(a)*rr,R[1]*.8+r()*.12,Math.sin(a)*rr*.6-.05],[.14,.12,.14],'fur',[0,0,0],.45);}},
 'bee-stripes':(c,col=0x2a1d17)=>{for(const y of [.6,.78,.96])c.kit.mesh(c.trunk,c.kit.own(new THREE.TorusGeometry(torsoAt(c,y),.045,8,40)),col,'fur',[0,y,0],[1,1,1],[Math.PI/2,0,0]);},
 // Two spotted wing cases that wrap the back and sides, parting at the front.
 'ladybird-shell':(c,col=0xc9302c)=>{const {kit,body,plump}=c,g=new THREE.Group();g.position.set(0,.8,-.1*plump);g.scale.set(plump,1,plump);body.add(g);for(const side of [-1,1]){const half=new THREE.Group();half.rotation.y=side*.32;g.add(half);kit.ball(half,col,[side*.12,0,-.04],[.4,.46,.4],'plastic');for(const [x,y,z] of [[.3,.2,-.12],[.34,-.14,-.08],[.16,.02,-.4],[.22,.28,-.3],[.08,-.26,-.36]])kit.ball(half,0x241c1c,[side*x,y,z],[.07,.07,.07],'plastic',[0,0,0],.5);}},
 fluff:(c,col=c.d.fur)=>{const r=seeded(11);for(let i=0;i<16;i++){const q=c.onTorso((r()-.5)*Math.PI*2,.55+r()*.55),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,cone(c.kit),i%3?col:shade(col,.12),'fur',[0,-.03,.02],[.06,.16,.05],[-.4,0,(r()-.5)*.6]);}},
 'head-fluff':(c,col=c.d.fur)=>{const {kit,face,R}=c;for(let i=0;i<14;i++){const a=i/14*Math.PI*2;kit.ball(face,col,[Math.cos(a)*R[0]*.96,Math.sin(a)*R[1]*.96,-.08],[.16,.16,.14],'fur',[0,0,0],.45);}},
 'frog-eyes':(c,col=c.d.fur)=>{for(const side of [-1,1]){const q=c.onFace(side*c.eye.x,c.eye.y,-.06);c.kit.ball(c.face,col,[q.p.x,q.p.y+.02,q.p.z-.06],[c.eye.w*1.45,c.eye.h*1.35,c.eye.w*1.3],finishOf(c));}},
 'long-beak':(c,col=0xd9b184)=>{const q=c.onFace(0,-c.R[1]*.28),f=surfaceFrame(c.face,q.p,q.n);c.kit.mesh(f,c.kit.own(taperedTube([[0,0,-.02],[0,-.08,.25],[0,-.24,.5]],t=>.055*(1-t*.75),12,10)),col,'plastic');},
 'toucan-beak':(c,col=0xf39a22)=>{const q=c.onFace(0,-c.R[1]*.26),f=surfaceFrame(c.face,q.p,q.n);c.kit.ball(f,col,[0,-.02,.24],[.15,.17,.36],'plastic');c.kit.ball(f,0xe94e2a,[0,-.04,.52],[.07,.09,.08],'plastic');c.kit.ball(f,0x2b2226,[0,-.14,.26],[.13,.04,.3],'plastic');},
 'seahorse-snout':(c,col=c.d.fur)=>{const q=c.onFace(0,-c.R[1]*.3),f=surfaceFrame(c.face,q.p,q.n);c.kit.mesh(f,c.kit.shared('snoutTube',()=>new THREE.CylinderGeometry(.07,.09,.3,16)),col,finishOf(c),[0,0,.14],[1,1,1],[Math.PI/2,0,0]);c.kit.ball(f,shade(col,-.3),[0,0,.29],[.07,.07,.02],'skin');},
 leaves:(c,col=0x6b9b3c)=>{const {kit,face,R}=c;for(let i=0;i<9;i++){const a=(i/8-.5)*Math.PI*1.3,g=new THREE.Group();g.position.set(Math.sin(a)*R[0]*.7,R[1]*(.55+Math.cos(a)*.3),-.1);g.rotation.set(-.4,0,-a*.9);face.add(g);kit.mesh(g,kit.shared('leafL',()=>slab(leafShape(.26,.46),.03,.012)),i%2?col:shade(col,.12),'skin');}},
 sprout:(c,col=0x7fae45)=>{const {kit,face,R}=c;kit.mesh(face,kit.shared('stem',()=>new THREE.CylinderGeometry(.018,.025,.2,8)),shade(col,-.2),'skin',[0,R[1]+.06,0]);for(const side of [-1,1]){const g=new THREE.Group();g.position.set(0,R[1]+.15,0);g.rotation.set(0,0,-side*1.1);face.add(g);kit.mesh(g,kit.shared('leafS',()=>slab(leafShape(.22,.38),.025,.01)),col,'skin');}},
 // ---- Robots, sprites and playthings ----
 antenna:(c,col=0x9aa6ad)=>{const {kit,face}=c;kit.mesh(face,kit.shared('rod',()=>new THREE.CylinderGeometry(.022,.022,1,8)),col,'metal',[0,c.top+.12,0],[1,.24,1]);kit.ball(face,c.d.accent2??0xf2c14e,[0,c.top+.28,0],[.065,.065,.065],'plastic');},
 'wind-key':(c,col=0xd9a441)=>{const {kit,face}=c;kit.mesh(face,kit.shared('rod',()=>new THREE.CylinderGeometry(.022,.022,1,8)),col,'metal',[0,c.top+.1,0],[1.6,.2,1.6]);for(const side of [-1,1])kit.mesh(face,kit.shared('keyLoop',()=>new THREE.TorusGeometry(.1,.035,8,20)),col,'metal',[side*.11,c.top+.24,0]);},
 'chest-light':(c,col=0x6fd6ff)=>{const q=c.onTorso(0,.9,.0),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,c.kit.shared('ring',()=>new THREE.TorusGeometry(.1,.025,8,24)),0xdfe6ea,'metal');c.kit.ball(f,col,[0,0,0],[.085,.085,.03],'glow');},
 gear:(c,col=0xd9a441)=>{const q=c.onTorso(0,.86,.0),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,c.kit.shared('gearDisc',()=>new THREE.CylinderGeometry(.12,.12,.04,10)),col,'metal',[0,0,0],[1,1,1],[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;c.kit.mesh(f,c.kit.shared('tooth',()=>new THREE.BoxGeometry(.05,.05,.04)),col,'metal',[Math.cos(a)*.14,Math.sin(a)*.14,0],[1,1,1],[0,0,a]);}c.kit.ball(f,shade(col,-.3),[0,0,.02],[.04,.04,.02],'metal',[0,0,0],.4);},
 'polka-dots':c=>{const tints=[0xe8574f,0xf2c14e,0x4a9ee0,0x6cc26a,0xb57ad9,0xf28a3c],r=seeded(17);for(let i=0;i<9;i++)facePatch(c,(r()-.5)*1.0,c.R[1]*(.2+r()*.65),[.07,.07,.03],tints[i%6],0,.012,'plastic');for(let i=0;i<14;i++)bodyPatch(c,(r()-.5)*Math.PI*2,.58+r()*.52,[.06,.06,.025],tints[(i+2)%6],0,'plastic');},
 patches:c=>{const tints=[0x5a86b8,0xe0a24e,0xd06a6a,0x7fae7a,0xf0c94f],r=seeded(23);for(let i=0;i<5;i++)facePatch(c,(i-2)*.2+(r()-.5)*.08,c.R[1]*(.42+r()*.35),[.17,.14,.035],tints[i%5],r(),.014,'fur');for(let i=0;i<5;i++)bodyPatch(c,(r()-.5)*Math.PI*1.6,.62+r()*.4,[.12,.1,.025],tints[(i+1)%4],r(),'fur');},
 mosaic:c=>{const tints=[0x2f6fc2,0xf2c14e,0x46b3d9,0x1f4f9c,0x9ad1e8],r=seeded(29);for(let i=0;i<14;i++)facePatch(c,(r()-.5)*1.05,c.R[1]*((r()-.5)*.2+.55*(i%2?1:-.2)),[.1,.09,.03],tints[i%5],r(),.014,'plastic');for(let i=0;i<22;i++)bodyPatch(c,(r()-.5)*Math.PI*2,.56+r()*.56,[.09,.08,.025],tints[(i+2)%5],r(),'plastic');},
 'comet-trail':(c,col=0xf6e08a)=>{c.kit.mesh(c.face,c.kit.own(taperedTube([[.2,.3,-.2],[.55,.55,-.45],[.95,.7,-.7],[1.3,.9,-.9]],t=>.2*(1-t)+.02,24,12)),col,'skin');for(const [x,y,z] of [[.9,1.05,-.6],[1.2,.62,-.85],[.7,.9,-.4]])c.kit.mesh(c.face,c.kit.shared('twinkle',()=>slab(starShape(.07,.03),.02,.01)),0xfff6c8,'glow',[x,y,z]);},
 puffs:(c,col=0xf6f2ee)=>{const r=seeded(31);for(let i=0;i<12;i++){const q=c.onTorso((r()-.5)*Math.PI*2,.55+r()*.55,-.02);c.kit.ball(c.trunk,col,[q.p.x,q.p.y,q.p.z],[.13,.12,.12],'fur',[0,0,0],.45);}},
 // Painted bands that follow the body's curve.
 'body-stripes':(c,col=0xc9423a)=>{for(const y0 of [.55,.79,1.02]){const pts=Array.from({length:7},(_,i)=>{const y=y0+i*.02;return new THREE.Vector2(torsoAt(c,y)+.008,y);});c.kit.mesh(c.trunk,c.kit.own(new THREE.LatheGeometry(pts,36)),col,'plastic');}},
 'crystal-body':(c,col=0xf2a8bb)=>{const r=seeded(37);for(let i=0;i<10;i++){const q=c.onTorso((r()-.5)*Math.PI*2,.58+r()*.5,-.02),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,c.kit.shared('gem',()=>new THREE.OctahedronGeometry(1,0)),i%2?col:shade(col,.2),'plastic',[0,0,.03],[.08,.08,.14]);}},
 horn:(c,col=0xf0c75a)=>{const q=c.onFace(0,c.R[1]*.62,-.03),f=surfaceFrame(c.face,q.p,q.n);const g=new THREE.Group();g.rotation.x=.55;f.add(g);c.kit.mesh(g,c.kit.shared('horn',()=>new THREE.ConeGeometry(.08,.42,16)),col,'metal',[0,.2,0]);for(let i=0;i<3;i++)c.kit.mesh(g,c.kit.shared('hornRing',()=>new THREE.TorusGeometry(.062,.012,6,16)),shade(col,.25),'metal',[0,.06+i*.1,0],[1-i*.22,1-i*.22,1-i*.22],[Math.PI/2,0,0]);},
 'pony-mane':(c,col=0xa46fd6)=>{const {kit,face,R}=c;for(let i=0;i<9;i++){const a=.1+i*.3;kit.ball(face,i%2?col:shade(col,.18),[.02*Math.sin(i),Math.cos(a)*R[1]*1.02,-Math.sin(a)*R[2]*1.02],[.14,.16,.14],'fur',[0,0,0],.6);}},
 'star-dots':(c,col=0xf2c14e)=>{const r=seeded(41);for(let i=0;i<6;i++){const q=c.onTorso((r()-.5)*2.4,.6+r()*.45,.01),f=surfaceFrame(c.trunk,q.p,q.n);c.kit.mesh(f,c.kit.shared('tinyStar',()=>slab(starShape(.05,.022),.015,.006)),col,'plastic');}},
 'flake-emblem':(c,col=0x7fc3ef)=>{const q=c.onFace(0,c.R[1]*.55,.0),f=surfaceFrame(c.face,q.p,q.n);for(let i=0;i<3;i++)c.kit.mesh(f,c.kit.shared('flakeBar',()=>new THREE.BoxGeometry(.03,.2,.02)),col,'plastic',[0,0,0],[1,1,1],[0,0,i*Math.PI/3]);},
 spiral:(c,col=0x8fb35a)=>{const q=c.onFace(0,c.R[1]*.5,.0),f=surfaceFrame(c.face,q.p,q.n);const pts:V3[]=Array.from({length:24},(_,i)=>{const a=i/23*Math.PI*3.4,r=.015+i/23*.09;return [Math.cos(a)*r,Math.sin(a)*r,0];});c.kit.mesh(f,c.kit.own(taperedTube(pts,()=>.014,40,6)),col,'plastic');},
 moss:(c,col=0x6f8a3c)=>{const r=seeded(43);for(let i=0;i<8;i++)bodyPatch(c,(r()-.5)*Math.PI*2,.6+r()*.5,[.11,.07,.04],i%2?col:shade(col,.15),r());},
 'leaf-body':(c,col=0x6b9b3c)=>{const r=seeded(47);for(let i=0;i<10;i++){const q=c.onTorso((r()-.5)*Math.PI*2,.6+r()*.45,-.02),f=surfaceFrame(c.trunk,q.p,q.n,(r()-.5)*2);c.kit.mesh(f,c.kit.shared('leafB',()=>slab(leafShape(.14,.24),.02,.008)),i%2?col:shade(col,.15),'skin',[0,-.04,.01],[1,1,1],[-.5,0,0]);}},
 stitches:(c,col=0x6b5345)=>{for(let i=0;i<6;i++)bodyPatch(c,0,.62+i*.08,[.035,.01,.01],col,0,'fur');for(let i=0;i<5;i++)facePatch(c,.02,c.R[1]*(.35+i*.1),[.03,.008,.01],col,0,.0,'fur');},
};
