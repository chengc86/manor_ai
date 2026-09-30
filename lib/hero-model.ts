import * as THREE from 'three';
import {heroModelProfile,type Hero3DSkin} from './hero-3d-catalogue';
import type {Wardrobe} from './clothing';
import {type RigOutfit} from './hero-outfit';
import {heroDesign} from './hero-designs';
import {Kit,type V3,onEllipsoid,slab,starShape,shade} from './hero-kit';
import {type Ctx,addEyes,addFace,addEars,addTail} from './hero-features';
import {EXTRAS} from './hero-extras';
import {HEADS} from './hero-heads';
import type {RidePose} from './vehicles';
export {outfitForWardrobe,type RigOutfit} from './hero-outfit';
export type HeroMotion='idle'|'walk'|'attack';
/** Riding poses: legs forward to sit or pedal, arms reaching for a handlebar or wheel, or held out to balance on a board. */
const RIDE:Record<RidePose,{leg:number;arm:number;armOut:number;spread?:number}>={board:{leg:0,arm:-.1,armOut:1.05,spread:.1},scoot:{leg:0,arm:-1.15,armOut:.12},pedal:{leg:-1.05,arm:-1.05,armOut:.12},seat:{leg:-1.45,arm:-1.0,armOut:.12}};
/**
 * Chibi proportions shared by every hero, so any clothing fits any body: a big head (nearly half the height),
 * a soft pear-shaped body, short legs and round paws. Heights are in model units with the feet on y=0.
 */
const HIP_Y=.56,NECK_Y=1.14,HEAD_Y=.56,DEPTH=.84;
/** Plain shorts on heroes with no bottoms bought. Off: the heroes match their 2D art, which wears nothing by default. */
const BASE_SHORTS=false;
const TORSO:[number,number][]=[[0,.47],[.22,.48],[.35,.52],[.43,.6],[.455,.7],[.445,.81],[.41,.92],[.35,1.01],[.27,1.09],[.17,1.15],[0,1.19]];
const torsoCurve=new THREE.SplineCurve(TORSO.map(([r,y])=>new THREE.Vector2(r,y))).getPoints(90);
/** Torso radius at height y (before plumpness). */
function torsoR(y:number){for(let i=1;i<torsoCurve.length;i++){const a=torsoCurve[i-1],b=torsoCurve[i];if((a.y-y)*(b.y-y)<=0)return Math.max(0,a.x+(b.x-a.x)*((y-a.y)/((b.y-a.y)||1)));}return 0;}
/** A shell over part of the torso, `grow` further out: shirts, jumpers, shorts. */
function shell(y0:number,y1:number,grow:number,flare=0){
 const pts:THREE.Vector2[]=[];for(let i=0;i<=18;i++){const y=y0+(y1-y0)*i/18;pts.push(new THREE.Vector2(torsoR(y)+grow+flare*(1-i/18)**2,y));}
 return new THREE.LatheGeometry(pts,30);
}
const CLOTH={shirt:0xfbf8f0,blouse:0xfffcf6,polo:0xf6f1df,sports:0x2e8a68,dress:0x93caa6,jumper:0x236b52,cardigan:0x2a7458,grey:0x5f6a72,sportsBottom:0x23624f,tie:0x1d5743,shoe:0x262f36,trainer:0xeef0ea,trainerStripe:0x3f8f73,navy:0x4d77b0};
export function createHeroModel(skin:Hero3DSkin,outfit:RigOutfit,wardrobe?:Wardrobe){
 const profile=heroModelProfile(skin),d=heroDesign(skin,profile.colour),kit=new Kit(),w:Wardrobe=wardrobe??{...(outfit.top==='shirt'?{top:'shirt'}:outfit.top==='jumper'?{top:'shirt',outer:'jumper'}:{}),...(outfit.bottom==='trousers'?{bottom:'trousers'}:outfit.bottom==='dress'?{bottom:'skirt'}:{}),...(outfit.hat?{head:'gold-crown'}:{}),...(outfit.scarf?{neck:'sun-scarf'}:{})};
 const plump=d.plump??1,hs=d.headSize??1,legLen=d.legs??1,fur=d.fur,paws=d.paws??fur,feetColour=d.feet??paws,skinFinish=d.finish??(d.build==='robot'||d.build==='toy'?'plastic':d.build==='sprite'?'skin':'fur');
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 // The trunk carries the torso and everything worn on it, squashed front-to-back and scaled for plumpness.
 const trunk=new THREE.Group();trunk.scale.set(plump,1,plump*DEPTH);body.add(trunk);
 kit.mesh(trunk,kit.shared('torso',()=>new THREE.LatheGeometry(torsoCurve.filter((_,i)=>i%3===0||i===torsoCurve.length-1).map(v=>new THREE.Vector2(Math.max(0,v.x),v.y)),30)),fur,skinFinish);
 // The tummy patch is part of the body; it is left out under a top, where it would only poke through the fabric.
 if(d.belly!==undefined&&!w.top&&!w.outer)kit.ball(trunk,d.belly,[0,.76,torsoR(.76)-.142],[.27,.3,.16],skinFinish);
 // Legs and arms hang from pivots, so walking swings them naturally.
 const legs:THREE.Group[]=[],arms:THREE.Group[]=[];
 // Longer or shorter legs lift or lower the whole body so the feet stay on the ground.
 const limbs=d.limbs??fur,lift=(legLen-1)*.2,footY=-.475-lift,bird=d.build==='bird',robot=d.build==='robot',joint=d.accent2??0xb8c4c8;body.position.y=lift;
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.17*plump,HIP_Y,0);body.add(leg);legs.push(leg);
  if(bird){kit.mesh(leg,kit.shared('birdLeg',()=>new THREE.CapsuleGeometry(.05,.3+lift,6,10)),feetColour,'skin',[0,-.25-lift/2,0]);for(let t=-1;t<=1;t++)kit.ball(leg,feetColour,[t*.055,footY+.03,.09],[.042,.03,.13],'skin',[0,t*.4,0],.5);}
  else{kit.mesh(leg,kit.shared('leg',()=>new THREE.CapsuleGeometry(.125,.2+lift,8,16)),limbs,skinFinish,[0,-.21-lift/2,0]);kit.ball(leg,feetColour,[0,footY,.055],robot?[.15,.1,.2]:[.14,.088,.19],skinFinish);if(robot)kit.ball(leg,joint,[0,-.22-lift/2,0],[.135,.05,.135],'metal',[0,0,0],.6);}
  const arm=new THREE.Group();arm.position.set(side*.31*plump,1.02,0);arm.rotation.z=side*.3;body.add(arm);arms.push(arm);
  if(bird){kit.ball(arm,limbs,[0,-.14,-.02],[.065,.25,.16],'fur',[.15,0,0]);kit.ball(arm,d.accent??shade(limbs,-.2),[0,-.3,-.05],[.05,.12,.12],'fur',[.25,0,0],.6);}
  else{kit.mesh(arm,kit.shared('arm',()=>new THREE.CapsuleGeometry(.092,.14,8,14)),limbs,skinFinish,[0,-.14,0]);kit.ball(arm,paws,[0,-.3,.015],[.108,.108,.108],skinFinish);if(robot){kit.ball(arm,joint,[0,.0,0],[.11,.11,.11],'metal',[0,0,0],.6);kit.ball(arm,joint,[0,-.16,0],[.1,.04,.1],'metal',[0,0,0],.6);}}
 }
 // The head pivots at the neck; features are placed on its surface in "face" space (centred on the head).
 const head=new THREE.Group();head.position.y=NECK_Y;body.add(head);
 const face=new THREE.Group();face.position.y=HEAD_Y*hs;head.add(face);
 const R:V3=[.6*hs,.52*hs,.5*hs];
 const tail=new THREE.Group();tail.position.set(0,.62,-torsoR(.62)*plump*DEPTH+.04);body.add(tail);
 const onTorso=(angle:number,y:number,lift=0)=>{const r=torsoR(y),slope=(torsoR(y+.01)-torsoR(y-.01))/.02,n=new THREE.Vector3(Math.sin(angle),-slope,Math.cos(angle)).normalize();return {p:new THREE.Vector3(Math.sin(angle)*r,y,Math.cos(angle)*r).addScaledVector(n,lift),n};};
 const ctx:Ctx={kit,d,body,head,face,tail,trunk,legs,arms,onTorso,R,plump,eyes:[],top:R[1]*.8,eyeStyle:d.eyes??'round',eye:{x:.35*R[0],y:(d.eyeY??-.06)*R[1],w:.12*hs*(d.eyeScale??1),h:.14*hs*(d.eyeScale??1)},onFace:(x,y,lift=0)=>onEllipsoid(ctx.R,x,y,lift)};
 // Round heads by default; robots, sprites and playthings get their own shapes, which move the face and hat.
 const shape=d.head?HEADS[d.head]:undefined;if(shape)shape(ctx,d.headColour??fur);else kit.ball(face,d.headColour??fur,[0,0,0],R,skinFinish,[0,0,0],1.2);
 addEyes(ctx);addFace(ctx);addEars(ctx);addTail(ctx);
 for(const spec of d.extras??[]){const [name,hex]=spec.split('#');EXTRAS[name]?.(ctx,hex?parseInt(hex,16):undefined);}
 // ---- Clothes: every piece is shaped from the same body plan. ----
 const dress=w.top==='dress',skirt=w.bottom==='skirt'||w.bottom==='skort';
 const topColour=w.top==='sports-top'?CLOTH.sports:dress?CLOTH.dress:w.top==='blouse'?CLOTH.blouse:w.top==='polo'?CLOTH.polo:CLOTH.shirt;
 const bottomColour=w.bottom==='sports-shorts'||w.bottom==='skort'?CLOTH.sportsBottom:CLOTH.grey;
 const outerColour=w.outer==='cardigan'?CLOTH.cardigan:CLOTH.jumper;
 const sleeve=(colour:number,long:boolean)=>{for(const arm of arms){kit.mesh(arm,kit.shared(long?'sleeveL':'sleeveS',()=>new THREE.CapsuleGeometry(.106,long?.15:.05,8,14)),colour,'cloth',[0,long?-.12:-.05,0]);if(long)kit.mesh(arm,kit.shared('cuff',()=>new THREE.TorusGeometry(.1,.026,8,20)),shade(colour,-.12),'cloth',[0,-.23,0],[1,1,1],[Math.PI/2,0,0]);}};
 const hem=(y:number,grow:number,colour:number)=>kit.mesh(trunk,kit.own(new THREE.TorusGeometry(torsoR(y)+grow,.024,8,36)),colour,'cloth',[0,y,0],[1,1,1],[Math.PI/2,0,0]);
 const front=(y:number,grow:number)=>torsoR(y)+grow;
 const wearingBottom=!!w.bottom&&!dress;
 if(w.top){
  kit.mesh(trunk,kit.own(shell(dress?.7:.62,1.19,.024)),topColour,'cloth');hem(dress?.7:.62,.024,shade(topColour,-.05));sleeve(topColour,false);
  const collar=w.top==='sports-top'?0xf2f0e6:shade(topColour,-.03);
  if(w.top==='blouse'||dress){for(const side of [-1,1])kit.ball(trunk,collar,[side*.075,1.125,front(1.12,.03)-.03],[.085,.05,.03],'cloth',[0,0,side*.35]);}
  else if(w.top==='polo'||w.top==='sports-top'){kit.mesh(trunk,kit.shared('collarRing',()=>new THREE.TorusGeometry(.2,.035,8,28)),collar,'cloth',[0,1.13,0],[1,1,1],[Math.PI/2,0,0]);for(const y of [1.05,.98])kit.ball(trunk,0xc9bf9f,[0,y,front(y,.03)],[.016,.016,.01],'plastic',[0,0,0],.4);}
  else{for(const side of [-1,1])kit.mesh(trunk,kit.shared('collarPt',()=>new THREE.ConeGeometry(.06,.14,3)),collar,'cloth',[side*.07,1.1,front(1.1,.03)-.01],[1,1,.4],[Math.PI+.2,0,side*.5]);for(const y of [1.02,.9,.78])kit.ball(trunk,0xc9bf9f,[0,y,front(y,.03)],[.016,.016,.01],'plastic',[0,0,0],.4);}
 }
 if(w.outer){
  kit.mesh(trunk,kit.own(shell(.6,1.17,.05)),outerColour,'cloth');hem(.6,.05,shade(outerColour,-.15));sleeve(outerColour,true);
  if(w.outer==='cardigan'){kit.mesh(trunk,kit.shared('placket',()=>new THREE.BoxGeometry(.035,.44,.02)),shade(outerColour,-.2),'cloth',[0,.86,front(.86,.06)]);for(const y of [.72,.86,1])kit.ball(trunk,0xe3d6a8,[0,y,front(y,.075)],[.02,.02,.012],'plastic',[0,0,0],.4);}
  else kit.mesh(trunk,kit.own(new THREE.TorusGeometry(.2,.04,8,28)),shade(outerColour,-.15),'cloth',[0,1.13,0],[1,1,1],[Math.PI/2,0,0]);
 }
 if(dress){
  const g=new THREE.CylinderGeometry(torsoR(.72)+.03,.6,.46,48,6,true),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i),pleat=1+.04*Math.cos(Math.atan2(z,x)*14)*(.5-y/.46);pos.setXYZ(i,x*pleat,y,z*pleat);}g.computeVertexNormals();
  kit.twoSided(kit.mesh(trunk,kit.own(g),topColour,'cloth',[0,.5,0]));
  kit.mesh(trunk,kit.own(new THREE.TorusGeometry(torsoR(.72)+.035,.03,8,40)),shade(topColour,-.3),'cloth',[0,.72,0],[1,1,1],[Math.PI/2,0,0]);
 }
 if(wearingBottom&&skirt){
  const g=new THREE.CylinderGeometry(torsoR(.72)+.035,.5,.34,40,4,true),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i),pleat=1+.05*Math.cos(Math.atan2(z,x)*16)*(.5-y/.34);pos.setXYZ(i,x*pleat,y,z*pleat);}g.computeVertexNormals();
  kit.twoSided(kit.mesh(trunk,kit.own(g),bottomColour,'cloth',[0,.56,0]));
  kit.mesh(trunk,kit.own(shell(.47,.74,.03)),bottomColour,'cloth');
 }else if(wearingBottom||(BASE_SHORTS&&(d.shorts??d.build==='animal'))){
  // Trousers and shorts: a seat over the hips plus a tube down each leg. Heroes with nothing bought wear slim little shorts.
  const colour=wearingBottom?bottomColour:CLOTH.navy,long=w.bottom==='trousers',base=!wearingBottom,top=base?.68:.76,grow=base?.014:.03;
  kit.mesh(trunk,kit.own(shell(.47,top,grow)),colour,'cloth');hem(top,grow,shade(colour,-.15));
  for(const leg of legs)kit.mesh(leg,kit.shared(long?'trouserL':base?'baseL':'shortL',()=>new THREE.CapsuleGeometry(base?.134:.142,long?.26:base?.0:.04,8,16)),colour,'cloth',[0,long?-.22:base?-.03:-.06,0]);
  if(base)for(const side of [-1,1])kit.ball(trunk,0xf6f0e2,[side*.035,top-.035,front(top-.035,grow+.012)],[.03,.018,.012],'cloth',[0,0,side*.5],.4);
  if(w.bottom==='sports-shorts')for(const leg of legs)kit.mesh(leg,kit.shared('stripe',()=>new THREE.TorusGeometry(.145,.012,6,20)),0xf2f0e6,'cloth',[0,-.12,0],[1,1,1],[Math.PI/2,0,0]);
 }
 if(w.tie){const tie=new THREE.Group();tie.position.set(0,1.02,front(1.02,.06));tie.rotation.x=-.18;trunk.add(tie);kit.ball(tie,CLOTH.tie,[0,.07,0],[.045,.04,.025],'cloth');kit.mesh(tie,kit.shared('tieBlade',()=>{const s=new THREE.Shape();s.moveTo(-.03,0);s.lineTo(.03,0);s.lineTo(.055,-.24);s.lineTo(0,-.3);s.lineTo(-.055,-.24);s.closePath();return slab(s,.02,.008);}),CLOTH.tie,'cloth',[0,.04,0]);kit.mesh(tie,kit.shared('tieStripe',()=>new THREE.BoxGeometry(.1,.018,.012)),0x79b58f,'cloth',[0,-.1,.014],[1,1,1],[0,0,-.6]);}
 if(w.feet)for(const leg of legs){const y=-.475-(legLen-1)*.2,tr=w.feet==='trainers';kit.ball(leg,tr?CLOTH.trainer:CLOTH.shoe,[0,y+.012,.065],[.155,.1,.205],tr?'cloth':'plastic');kit.ball(leg,tr?0xd0d6cf:0x1a2126,[0,y-.055,.065],[.16,.035,.21],'plastic');if(tr)kit.ball(leg,CLOTH.trainerStripe,[0,y+.02,.12],[.158,.03,.12],'cloth',[.3,0,0]);}
 const top=ctx.top;
 if(w.head==='gold-crown'||w.head==='silver-crown'){
  const c=w.head==='gold-crown'?0xf0c24f:0xd6e2e8,crown=new THREE.Group();crown.position.set(0,top,-.04);crown.rotation.x=-.12;face.add(crown);
  kit.twoSided(kit.mesh(crown,kit.shared('crownBand',()=>new THREE.CylinderGeometry(.27,.25,.12,32,1,true)),c,'metal'));
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;kit.mesh(crown,kit.shared('crownPt',()=>new THREE.ConeGeometry(.06,.16,8)),c,'metal',[Math.sin(a)*.25,.13,Math.cos(a)*.25]);kit.ball(crown,c,[Math.sin(a)*.25,.22,Math.cos(a)*.25],[.03,.03,.03],'metal',[0,0,0],.4);}
  kit.ball(crown,w.head==='gold-crown'?0xd9425a:0x5fb2e8,[0,.0,.27],[.04,.05,.02],'eye');
 }else if(w.head==='explorer-hat'){
  const hat=new THREE.Group();hat.position.set(0,top-.02,0);hat.rotation.x=-.1;face.add(hat);
  kit.ball(hat,0xc4a878,[0,.05,0],[.34,.22,.32],'cloth');kit.mesh(hat,kit.shared('brim',()=>new THREE.CylinderGeometry(.52,.54,.035,40)),0xb99b69,'cloth',[0,-.02,0]);kit.mesh(hat,kit.shared('hatBand',()=>new THREE.CylinderGeometry(.345,.345,.07,32,1,true)),0x6b4b2e,'cloth',[0,.03,0]);
 }else if(w.head==='star-cap'){
  const cap=new THREE.Group();cap.position.set(0,top-.04,0);cap.rotation.x=-.08;face.add(cap);
  kit.mesh(cap,kit.shared('capDome',()=>new THREE.SphereGeometry(1,28,14,0,Math.PI*2,0,Math.PI/2)),0x4f7fbd,'cloth',[0,0,0],[.4,.3,.38]);kit.ball(cap,0x3d6aa3,[0,.0,.38],[.26,.025,.2],'cloth');kit.ball(cap,0xf3d36a,[0,.3,0],[.04,.03,.04],'cloth');
  kit.mesh(cap,kit.shared('capStar',()=>slab(starShape(.08,.035),.02,.008)),0xf3d36a,'cloth',[0,.14,.33],[1,1,1],[-.5,0,0]);
 }
 if(w.neck){const c=w.neck==='sun-scarf'?0xf0c04f:0x5aadd0;kit.mesh(trunk,kit.shared('scarf',()=>new THREE.TorusGeometry(.2,.075,12,32)),c,'cloth',[0,1.1,0],[1,1,1],[Math.PI/2,0,0]);kit.ball(trunk,c,[.14,.9,front(.92,.06)],[.07,.17,.04],'cloth',[0,0,-.2]);kit.ball(trunk,shade(c,-.1),[.15,.76,front(.8,.07)],[.07,.03,.035],'cloth',[0,0,-.2]);}
 // The cape follows the back of the body from the shoulders, then flares out below the waist.
 if(w.back){const c=w.back==='ruby-cape'?0xa3334e:0x3f4d93,pts:THREE.Vector2[]=[];for(let i=0;i<=16;i++){const y=1.12-i*.052;pts.push(new THREE.Vector2(torsoR(Math.max(.56,y))+.07+Math.max(0,.6-y)*.45,y));}kit.twoSided(kit.mesh(trunk,kit.own(new THREE.LatheGeometry(pts,28,Math.PI-1.3,2.6)),c,'cloth'));kit.mesh(trunk,kit.own(new THREE.TorusGeometry(torsoR(1.1)+.06,.03,8,32,Math.PI*1.1)),shade(c,-.2),'cloth',[0,1.1,0],[1,1,1],[Math.PI/2,0,Math.PI*.95]);for(const side of [-1,1])kit.ball(trunk,0xf0c24f,[side*.15,1.08,front(1.08,.05)],[.035,.035,.025],'metal',[0,0,0],.5);if(w.back==='star-cape')for(const [a,y] of [[.35,.95],[-.45,.78],[.1,.6],[-.2,.42],[.5,.5]]){const r=torsoR(Math.max(.56,y))+.08+Math.max(0,.6-y)*.45;kit.mesh(trunk,kit.shared('capeStar',()=>slab(starShape(.06,.026),.012,.005)),0xf5d77a,'cloth',[Math.sin(Math.PI+a)*r,y,Math.cos(Math.PI+a)*r],[1,1,1],[0,Math.PI+a,0]);}}
 if(w.badge){const b=w.badge==='star-badge'?kit.mesh(trunk,kit.shared('badgeStar',()=>slab(starShape(.06,.028),.02,.008)),0xf1c64d,'metal'):kit.ball(trunk,0xcfe7f2,[0,0,0],[.05,.05,.015],'metal');b.position.set(-.17,.95,front(.95,w.outer?.07:.04));}
 if(w.wrist)for(const arm of arms)kit.mesh(arm,kit.shared('wristBand',()=>new THREE.TorusGeometry(.1,.03,8,20)),w.wrist==='mint-band'?0x7fd3b3:0xeea267,'cloth',[0,-.22,0],[1,1,1],[Math.PI/2,0,0]);
 // A grip in the right hand for weapons; the eyes blink and the tail wags in the dressing room.
 const grip=new THREE.Group();grip.position.set(0,-.33,.07);grip.rotation.x=.12;arms[1].add(grip);
 const blinkPhase=[...skin].reduce((a,ch)=>a+ch.charCodeAt(0),0)%7*.37;
 // On a ride the hero keeps a riding pose; "walk" then means riding along (pedalling on bikes).
 let ride:RidePose|undefined;
 const model={root,parts:{body,head,legs,arms,tail},grip,design:d,
  setRide(pose?:RidePose){ride=pose;model.animate(0,'idle',false);},
  animate(t:number,motion:HeroMotion,enabled=true){
   const on=enabled,walk=on&&motion==='walk'&&!ride,riding=on&&motion==='walk'&&!!ride,attack=on&&motion==='attack',r=ride?RIDE[ride]:undefined;
   body.position.y=lift+(walk?Math.abs(Math.sin(t*5))*.035:riding?.018*Math.abs(Math.sin(t*9)):on?.012*Math.sin(t*2):0);body.rotation.z=walk?.03*Math.sin(t*5):0;
   head.rotation.z=on&&!walk?.045*Math.sin(t*1.3):0;head.rotation.x=attack?.08:on?.025*Math.sin(t*2):0;
   legs.forEach((leg,i)=>{leg.rotation.x=(r?.leg??0)+(walk?Math.sin(t*5+i*Math.PI)*.5:riding&&ride==='pedal'?Math.sin(t*6+i*Math.PI)*.35:0);leg.rotation.z=(i?1:-1)*(r?.spread??0);});
   arms.forEach((arm,i)=>{arm.rotation.z=(i?1:-1)*(r?.armOut??.3);arm.rotation.x=attack&&i===1?-.9+Math.sin(t*5)*.75:(r?.arm??0)+(walk?Math.sin(t*5+i*Math.PI+Math.PI)*.45:on&&!r?.arm?.04*Math.sin(t*2+i):0);});
   tail.rotation.y=on?Math.sin(t*(walk?6:2.4))*.22:0;
   const blink=on&&((t+blinkPhase)%3.4)<.12;for(const e of ctx.eyes)e.scale.y=blink?.12:1;
  },
  dispose(){kit.dispose();}};
 return model;
}
