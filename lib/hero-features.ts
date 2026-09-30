import * as THREE from 'three';
import {type Kit,type V3,onEllipsoid,surfaceFrame,slab,earShape,taperedTube,shade} from './hero-kit';
import type {HeroDesign} from './hero-designs';
/** Everything a feature builder can reach: the design, the kit, the body's groups and surface helpers. */
export type Ctx={
 kit:Kit;d:HeroDesign;body:THREE.Group;head:THREE.Group;face:THREE.Group;tail:THREE.Group;trunk:THREE.Group;legs:THREE.Group[];arms:THREE.Group[];
 /** A point on the torso in trunk space: angle 0 is the front, positive turns towards the hero's left (+x). */
 onTorso:(angle:number,y:number,lift?:number)=>{p:THREE.Vector3;n:THREE.Vector3};
 /** Head radii (face space is centred on the head); where the eyes sit; the surface under a face point. */
 R:V3;eye:{x:number;y:number;w:number;h:number};onFace:(x:number,y:number,lift?:number)=>{p:THREE.Vector3;n:THREE.Vector3};
 eyes:THREE.Group[];plump:number;
 /** Where a hat sits (face space), and how the eyes are drawn: glossy, sewn-on buttons, or glowing on a screen. */
 top:number;eyeStyle:'round'|'button'|'glow';glow?:number;
};
const DARK=0x2a1d1a,MOUTH=0x5b2328,TONGUE=0xef7c85;
/** Big glossy eyes with a coloured iris and two highlights: the heart of a cute face. */
export function addEyes(c:Ctx,style:'round'|'button'|'glow'=c.eyeStyle,glowColour=c.glow??0x9ff4ff){
 const {kit,face,eye}=c;
 for(const side of [-1,1]){
  const {p,n}=c.onFace(side*eye.x,eye.y);
  const g=surfaceFrame(face,p,n),w=eye.w,h=eye.h;
  if(style==='button'){kit.ball(g,0x2b2626,[0,0,.005],[w*1.05,w*1.05,.04],'plastic');kit.mesh(g,kit.shared('buttonRim',()=>new THREE.TorusGeometry(1,.12,8,24)),0x4a4040,'plastic',[0,0,.03],[w*.8,w*.8,w*.5]);for(const [x,y] of [[-1,1],[1,1],[-1,-1],[1,-1]])kit.ball(g,0x7a6e6e,[x*w*.22,y*w*.22,.045],[w*.1,w*.1,.02],'plastic',[0,0,0],.4);kit.ball(g,0xffffff,[-w*.45,w*.45,.05],[w*.16,w*.14,.01],'glow',[0,0,0],.4);}
  else if(style==='glow'){kit.ball(g,glowColour,[0,0,.012],[w*.72,h*.8,.02],'glow');kit.ball(g,0xffffff,[-w*.22,h*.28,.03],[w*.24,h*.22,.012],'glow',[0,0,0],.4);}
  else{
   kit.ball(g,0xfffdf8,[0,0,-.03],[w,h,.07],'eye');
   kit.ball(g,c.d.iris??0x5a3321,[0,-h*.03,.012],[w*.9,h*.92,.056],'eye');
   kit.ball(g,0x120c0a,[0,-h*.05,.03],[w*.56,h*.6,.045],'eye');
   kit.ball(g,0xffffff,[-w*.3,h*.34,.07],[w*.33,h*.3,.02],'glow',[0,0,0],.5);
   kit.ball(g,0xffffff,[w*.32,-h*.38,.064],[w*.15,h*.13,.015],'glow',[0,0,0],.4);
   // A dark upper lid line gives the eye its outline, like the 2D art.
   kit.mesh(g,kit.shared('lid',()=>new THREE.TorusGeometry(1,.075,6,28,Math.PI*.86)),0x2a1a16,'eye',[0,0,.012],[w*1.01,h*1.01,w],[0,0,Math.PI*.07]);
  }
  c.eyes.push(g);
 }
}
/** Muzzle, nose and mouth; returns nothing, but places everything on the lower face. */
export function addFace(c:Ctx){
 const {kit,face,d,R}=c,[,ry]=R,muzzle=d.muzzle??'none',mc=d.muzzleColour??d.belly??shade(d.fur,.45),nose=d.nose??DARK;
 let mouthAt:{p:THREE.Vector3;n:THREE.Vector3}|null=null;
 const bump=(y:number,m:V3,sink:number)=>{const s=c.onFace(0,y*ry);const centre=s.p.clone().addScaledVector(s.n,-sink);kit.ball(face,mc,[centre.x,centre.y,centre.z],m);return (x:number,yy:number,lift=0)=>{const q=onEllipsoid(m,x,yy,lift);return {p:q.p.add(centre),n:q.n};};};
 if(muzzle==='round'||muzzle==='fox'||muzzle==='snout'){
  const m:V3=muzzle==='fox'?[.19,.135,.2]:muzzle==='snout'?[.3,.22,.24]:[.23,.165,.17],on=bump(muzzle==='snout'?-.34:-.38,m,muzzle==='fox'?.04:muzzle==='snout'?.1:.08);
  if(muzzle==='snout')for(const s of [-1,1]){const q=on(s*.09,m[1]*.35),f=surfaceFrame(face,q.p,q.n);kit.ball(f,shade(mc,-.45),[0,0,0],[.035,.028,.02],'skin');}
  else{const top=on(0,m[1]*.42),f=surfaceFrame(face,top.p,top.n);kit.ball(f,nose,[0,0,0],[.075,.052,.05],'eye');kit.ball(f,0xffffff,[-.025,.02,.045],[.018,.012,.01],'glow',[0,0,0],.4);}
  mouthAt=on(0,-m[1]*.3);
 }else if(muzzle==='cat'){
  const s=c.onFace(0,-.36*ry);
  for(const side of [-1,1]){const q=c.onFace(side*.075,-.4*ry,-.035);kit.ball(face,mc,[q.p.x,q.p.y,q.p.z],[.1,.08,.08]);}
  const q=c.onFace(0,-.49*ry,-.03);kit.ball(face,mc,[q.p.x,q.p.y,q.p.z],[.07,.05,.06]);
  const f=surfaceFrame(face,s.p.clone().addScaledVector(s.n,.035),s.n);kit.ball(f,nose,[0,.0,0],[.055,.04,.035],'eye');
  mouthAt=c.onFace(0,-.5*ry,.045);
 }else if(muzzle==='pig'){
  const s=c.onFace(0,-.3*ry),f=surfaceFrame(face,s.p,s.n);kit.ball(f,mc,[0,0,.03],[.19,.14,.1],'skin');for(const x of [-.06,.06])kit.ball(f,shade(mc,-.45),[x,0,.125],[.03,.045,.014],'skin');
  mouthAt=c.onFace(0,-.56*ry,.01);
 }else if(muzzle==='beak'||muzzle==='hook'){
  const s=c.onFace(0,-.3*ry),f=surfaceFrame(face,s.p,s.n);
  kit.mesh(f,kit.shared('beak',()=>new THREE.ConeGeometry(1,1,16)),mc,'plastic',[0,0,.07],[.085,.16,.07],[Math.PI/2+(muzzle==='hook'?.35:.1),0,0]);
  kit.ball(f,mc,[0,0,0],[.1,.075,.06],'plastic');
 }else if(muzzle==='bill'){
  const s=c.onFace(0,-.33*ry),f=surfaceFrame(face,s.p,s.n);kit.ball(f,mc,[0,.0,.1],[.2,.065,.17],'plastic');kit.ball(f,shade(mc,-.15),[0,-.035,.08],[.17,.04,.14],'plastic');
 }else if(muzzle==='long'){
  const s=c.onFace(0,-.34*ry),f=surfaceFrame(face,s.p,s.n);kit.ball(f,mc,[0,0,.12],[.2,.13,.28]);for(const x of [-.06,.06])kit.ball(f,shade(mc,-.5),[x,.08,.33],[.02,.015,.015],'skin');
  addMouth(c,surfaceFrame(f,new THREE.Vector3(0,-.04,.3),new THREE.Vector3(0,-.2,1).normalize()),d.mouth??'grin',1.2);
 }else mouthAt=c.onFace(0,-.34*ry);
 if(mouthAt){const f=surfaceFrame(face,mouthAt.p,mouthAt.n);addMouth(c,f,c.eyeStyle==='glow'?'glow':d.mouth??'open');}
 if(d.blush!==false)for(const side of [-1,1]){const q=c.onFace(side*.6*R[0],-.3*ry,-.018),f=surfaceFrame(face,q.p,q.n);kit.ball(f,d.blush??0xf49a9c,[0,0,0],[.1,.058,.03],'fur',[0,0,0],.5);}
}
/** A happy mouth; styles match the 2D art (open smile, cheeky teeth, little fangs, big grin). */
export function addMouth(c:Ctx,f:THREE.Group,style:string,size=1){
 const {kit}=c,s=size,bowl=kit.shared('mouth',()=>new THREE.SphereGeometry(1,20,10,0,Math.PI*2,Math.PI/2,Math.PI/2));
 if(style==='smile'){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.07*s,.012,0),new THREE.Vector3(0,-.03*s,.01),new THREE.Vector3(.07*s,.012,0)]);kit.mesh(f,kit.own(new THREE.TubeGeometry(curve,16,.011,6,false)),MOUTH,'skin');return;}
 if(style==='beak')return;
 if(style==='glow'){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.09*s,.02,0),new THREE.Vector3(0,-.04*s,.01),new THREE.Vector3(.09*s,.02,0)]);kit.mesh(f,kit.own(new THREE.TubeGeometry(curve,16,.02,6,false)),c.glow??0x9ff4ff,'glow');return;}
 const w=(style==='grin'?.13:.095)*s,h=(style==='grin'?.08:.07)*s;
 kit.mesh(f,bowl,MOUTH,'skin',[0,.012,0],[w,h,.03]);
 kit.ball(f,TONGUE,[0,-h*.55,.016],[w*.58,h*.34,.02],'skin',[0,0,0],.5);
 if(style==='teeth')for(const x of [-.018,.018])kit.mesh(f,kit.shared('tooth',()=>new THREE.BoxGeometry(1,1,1)),0xffffff,'plastic',[x*s,-.004,.022],[.032*s,.036*s,.012]);
 if(style==='fangs'||style==='grin')for(const x of style==='grin'?[-.07,-.035,0,.035,.07]:[-.04,.04])kit.mesh(f,kit.shared('fang',()=>new THREE.ConeGeometry(1,1,8)),0xffffff,'plastic',[x*s,-.002,.024],[.014*s,.03*s,.01],[Math.PI,0,0]);
}
/** Ears by type, placed on the head's upper surface. */
export function addEars(c:Ctx){
 const {kit,face,d,R}=c,[rx,ry]=R,type=d.ears??'none',sc=d.earScale??1,inner=d.earInner??shade(d.fur,.35),colour=d.earColour??d.fur;
 if(type==='none')return;
 for(const side of [-1,1]){
  if(type==='pointy'||type==='tuft'||type==='huge'||type==='floppy'){
   const big=type==='huge'?1.45:1,w=.34*sc*big,h=.42*sc*big,q=onEllipsoid([rx,ry,R[2]*.6],side*rx*.56,ry*.66),ear=new THREE.Group();
   ear.position.set(q.p.x,q.p.y-.02,q.p.z-.12);ear.rotation.set(type==='floppy'?1.1:-.12,side*-.25,side*(type==='floppy'?-.42:-.32));face.add(ear);
   kit.mesh(ear,kit.shared(`ear${w}${h}`,()=>slab(earShape(w,h,.3),.07,.03)),colour,'fur');
   kit.mesh(ear,kit.shared(`ein${w}${h}`,()=>slab(earShape(w*.58,h*.64,.3),.02,.012)),inner,'fur',[0,h*.06,.052]);
   if(d.earTip)kit.mesh(ear,kit.shared(`etp${w}${h}`,()=>slab(earShape(w*.46,h*.36,.3),.1,.035)),d.earTip,'fur',[0,h*.64,0]);
   if(type==='tuft')kit.mesh(ear,kit.shared('tuftc',()=>new THREE.ConeGeometry(.05,.18,8)),d.earTip??colour,'fur',[0,h+.05,0]);
  }else if(type==='round'||type==='small'){
   const s=type==='small'?.6:1,q=onEllipsoid(R,side*rx*.66,ry*.6),ear=new THREE.Group();ear.position.copy(q.p).addScaledVector(q.n,-.04);ear.rotation.set(0,side*-.35,side*-.35);face.add(ear);
   kit.ball(ear,colour,[0,0,0],[.2*s*sc,.19*s*sc,.09*s*sc]);kit.ball(ear,inner,[0,-.01,.05*s*sc],[.12*s*sc,.11*s*sc,.04*s*sc]);
  }else if(type==='long'){
   const ear=new THREE.Group();ear.position.set(side*rx*.32,ry*.78,-.02);ear.rotation.set(-.1,0,side*-.14);face.add(ear);
   kit.ball(ear,colour,[0,.36*sc,0],[.12,.42*sc,.075]);kit.ball(ear,inner,[0,.36*sc,.045],[.07,.33*sc,.04]);
  }
 }
}
/** Tails by type, hanging from the lower back. */
export function addTail(c:Ctx){
 const {kit,d,tail}=c,type=d.tail??'none',s=d.tailScale??1,colour=d.tailColour??d.fur,tip=d.tailTip;
 if(type==='none')return;
 if(type==='stub'){kit.ball(tail,colour,[0,0,-.02],[.13*s,.12*s,.11*s]);return;}
 if(type==='bushy'||type==='ringed'){
  // A smooth plume that swells and curls up behind the hero; the tip (or every other ring) is a second, slightly larger sleeve.
  const pts:V3[]=[[0,0,0],[.1*s,-.1*s,-.2*s],[.3*s,-.06*s,-.4*s],[.46*s,.2*s,-.5*s],[.46*s,.52*s,-.42*s],[.36*s,.7*s,-.3*s]];
  const r=(t:number)=>(.035+.21*Math.pow(Math.sin(Math.PI*t),.6))*s;
  kit.mesh(tail,kit.own(taperedTube(pts,r,32,16)),colour,'fur');
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));
  const sleeve=(a:number,b:number,col:number)=>{const part:V3[]=Array.from({length:6},(_,i)=>{const p=curve.getPointAt(a+(b-a)*i/5);return [p.x,p.y,p.z];});kit.mesh(tail,kit.own(taperedTube(part,u=>r(a+(b-a)*u)+.012,12,16)),col,'fur');};
  if(type==='ringed')for(let i=0;i<4;i++)sleeve(.22+i*.19,.31+i*.19,d.accent??DARK);
  else if(tip)sleeve(.72,1,tip);
  const end=curve.getPointAt(1),cap=.05*s;kit.ball(tail,type==='ringed'?(d.accent??DARK):tip??colour,[end.x,end.y,end.z],[cap,cap,cap]);
  return;
 }
 if(type==='thin'||type==='tuft'){
  const pts:V3[]=[[0,0,0],[.08*s,-.1*s,-.22*s],[.3*s,-.02*s,-.36*s],[.42*s,.3*s,-.32*s],[.36*s,.52*s,-.24*s]];
  kit.mesh(tail,kit.own(taperedTube(pts,t=>(.07-.025*t)*s)),colour,'fur');
  const end=pts[pts.length-1];kit.ball(tail,type==='tuft'?(d.accent??shade(colour,-.35)):tip??colour,end,type==='tuft'?[.1,.12,.1]:[.05*s,.05*s,.05*s]);
  return;
 }
 if(type==='curl'){const pts:V3[]=Array.from({length:30},(_,i)=>{const a=i/29*Math.PI*3.2,r=.07*(1-i/60);return [Math.cos(a)*r,.02+Math.sin(a)*r,-i/29*.16];});kit.mesh(tail,kit.own(taperedTube(pts,()=>.025,30,8)),colour,'skin');return;}
 if(type==='lizard'){
  const pts:V3[]=[[0,0,0],[.05,-.2,-.25],[.2,-.42,-.5],[.42,-.5,-.62]];kit.mesh(tail,kit.own(taperedTube(pts,t=>.17*(1-t*.85)*s)),colour,'skin');
  if(d.accent)for(let i=0;i<4;i++){const t=.1+i*.22,p=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v))).getPointAt(t);kit.mesh(tail,kit.shared('spike',()=>new THREE.ConeGeometry(.05,.12,6)),d.accent,'skin',[p.x,p.y+.13*(1-t*.8),p.z]);}
  return;
 }
 if(type==='fluke'){const pts:V3[]=[[0,0,0],[0,-.18,-.22],[0,-.32,-.42]];kit.mesh(tail,kit.own(taperedTube(pts,t=>.13*(1-t*.7))),colour,'skin');for(const side of [-1,1])kit.ball(tail,colour,[side*.14,-.36,-.5],[.16,.04,.09],'skin',[0,side*.4,0]);return;}
 if(type==='fan'){for(let i=-2;i<=2;i++)kit.ball(tail,colour,[i*.06,-.05,-.08],[.06,.03,.16],'fur',[.5,i*.25,0]);}
}
