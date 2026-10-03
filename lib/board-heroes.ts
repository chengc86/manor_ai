import * as THREE from 'three';
import {outfitForWardrobe} from './hero-model';
import {createRidingHero} from './hero-ride';
import type {Ride} from './vehicles';
import {hero3D} from './hero-3d-catalogue';
import {uniformPieces,wear,type Wardrobe} from './clothing';
import {bakeRig,type RigTemplate} from './rig-bake';
import {createHeldWeapon} from './weapon-model';
/** Battlefield heroes: the dressing-room model baked small, holding their weapon. One template per look. */
/** How a hero looks on the battlefield. A ride shows in the camp and on that hero's defenders. */
export type HeroLook={type:number;clothing?:Wardrobe;uniform?:string;gender?:string;weapon?:string;ride?:Ride};
/** Arguments of a hero pose: time, motion and whether motion is allowed. */
export type HeroPose=[time:number,motion:'idle'|'walk'|'attack',enabled?:boolean];
export type HeroRig=RigTemplate<HeroPose>;
export const HERO_DETAIL=.32;
export function lookWardrobe(look:HeroLook):Wardrobe{return look.clothing??uniformPieces(look.uniform??'none',look.gender).reduce((w,id)=>wear(w,id),{} as Wardrobe);}
export function heroKey(look:HeroLook){return JSON.stringify([look.type,Object.entries(lookWardrobe(look)).sort(([a],[b])=>a.localeCompare(b)),look.weapon??'none',look.ride?[look.ride.id,look.ride.paint]:null]);}
function part(parent:THREE.Object3D,geometry:THREE.BufferGeometry,colour:number,pos:[number,number,number],scale:[number,number,number]=[1,1,1],metal=false){
 const m=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:colour,roughness:.6}));m.position.set(...pos);m.scale.set(...scale);if(metal)m.userData.metal=true;parent.add(m);return m;
}
/** Arrow and Crystal Towers (legacy IDs 7 and 8) have no animal model, so they stand as small 3D towers. */
function towerTemplate(type:number,weapon:string):HeroRig{
 const root=new THREE.Group(),top=new THREE.Group();root.add(top);
 if(type===8){
  part(root,new THREE.CylinderGeometry(.55,.62,.3,10),0x8f8b99,[0,.15,0]);part(root,new THREE.CylinderGeometry(.34,.42,.95,10),0xb3aec4,[0,.77,0]);part(root,new THREE.CylinderGeometry(.46,.4,.14,10),0x8f8b99,[0,1.3,0]);
  top.position.y=1.95;part(top,new THREE.OctahedronGeometry(.32,0),0xb58cff,[0,0,0],[1,1.7,1]);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;part(top,new THREE.OctahedronGeometry(.09,0),0xd9c2ff,[Math.cos(a)*.48,-.1,Math.sin(a)*.48],[1,1.6,1]);}
  return bakeRig<HeroPose>(root,[top],(t,_motion,enabled=true)=>{top.position.y=1.95+(enabled?.08*Math.sin(t*2):0);top.rotation.y=enabled?t*.8:0;},.6);
 }
 part(root,new THREE.CylinderGeometry(.55,.62,.45,10),0x8f8b82,[0,.22,0]);part(root,new THREE.BoxGeometry(.78,1.25,.78),0x9a6a3e,[0,1.07,0]);
 for(let i=0;i<4;i++)part(root,new THREE.BoxGeometry(.8,.035,.8),0x6f4a2a,[0,.6+i*.3,0]);
 part(root,new THREE.BoxGeometry(1,.1,1),0x6f4a2a,[0,1.75,0]);part(root,new THREE.ConeGeometry(.78,.55,4),0xb0553a,[0,2.55,0]).rotation.y=Math.PI/4;
 for(const [x,z] of [[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42]])part(root,new THREE.BoxGeometry(.06,.5,.06),0x6f4a2a,[x,2.05,z]);
 top.position.y=1.95;part(top,new THREE.BoxGeometry(.1,.1,.6),0x6f4a2a,[0,0,.1]);part(top,new THREE.TorusGeometry(.26,.03,5,16,Math.PI),0x4a3320,[0,0,.3]).rotation.set(Math.PI/2,0,0);part(top,new THREE.CylinderGeometry(.018,.018,.55,5),0xc9ced3,[0,.05,.25],[1,1,1],true).rotation.x=Math.PI/2;
 void weapon;
 return bakeRig<HeroPose>(root,[top],(t,motion,enabled=true)=>{top.rotation.x=enabled&&motion==='attack'?-.15+Math.sin(t*9)*.1:0;},.6);
}
function buildTemplate(look:HeroLook):HeroRig{
 const weapon=look.weapon??'none',hero=hero3D(look.type);
 if(!hero)return towerTemplate(look.type,weapon);
 const wardrobe=lookWardrobe(look),model=createRidingHero(hero.skin,outfitForWardrobe(wardrobe),wardrobe,look.ride);
 if(weapon!=='none')model.grip.add(createHeldWeapon(weapon));
 // The head and tail are bones too, so heroes tilt their heads and wag their tails on the battlefield.
 return bakeRig<HeroPose>(model.root,[model.parts.body,model.parts.head,model.parts.tail,...model.parts.legs,...model.parts.arms],(t,motion,enabled=true)=>model.animate(t,motion,enabled),HERO_DETAIL);
}
/** Shared, reference-counted templates, so a pupil's camp hero and deployed heroes reuse one bake. */
const cache=new Map<string,{template:HeroRig;users:number}>();
export function acquireHeroTemplate(look:HeroLook){
 const key=heroKey(look);let entry=cache.get(key);
 if(entry)cache.delete(key);else entry={template:buildTemplate(look),users:0};
 cache.set(key,entry);entry.users++;return {key,template:entry.template};
}
export function releaseHeroTemplate(key:string){
 const entry=cache.get(key);if(!entry)return;entry.users--;
 // Keep the most recent unused bakes, in case the same look comes back (a hero moving squares, a new wave).
 const unused=[...cache].filter(([,e])=>e.users<=0);
 for(const [k,e] of unused.slice(0,Math.max(0,unused.length-24))){e.template.dispose();cache.delete(k);}
}
export function heroTemplateCount(){return cache.size;}
