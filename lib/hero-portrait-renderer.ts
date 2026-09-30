/** One shared WebGL renderer, bounded portrait cache, and one queued render at a time. */
import * as THREE from 'three';
import {createRidingHero} from './hero-ride';
import {createVehicleModel} from './vehicle-model';
import {outfitForWardrobe} from './hero-outfit';
import {hero3D} from './hero-3d-catalogue';
import {prepareRenderer,studio,frame} from './hero-stage';
import type {Wardrobe} from './clothing';
import type {Ride} from './vehicles';
let renderer:THREE.WebGLRenderer|undefined,scene:THREE.Scene|undefined,lights:ReturnType<typeof studio>|undefined;
let chain:Promise<unknown>=Promise.resolve();
const cache=new Map<string,Promise<string>>();
export const PORTRAIT_CACHE_LIMIT=192;
/** Identifies a picture: the hero, what they wear (in a stable order) and what they ride. */
export function portraitKey(type:number,wardrobe:Wardrobe,ride?:Ride){return JSON.stringify([type,Object.entries(wardrobe).sort(([a],[b])=>a.localeCompare(b)),ride?[ride.id,ride.paint]:null]);}
function queue(key:string,draw:(r:THREE.WebGLRenderer,s:THREE.Scene)=>string):Promise<string>{
 const cached=cache.get(key);if(cached){cache.delete(key);cache.set(key,cached);return cached;}
 const job=chain.then(()=>new Promise<void>(resolve=>setTimeout(resolve,0))).then(()=>{
  if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(1);prepareRenderer(renderer);scene=new THREE.Scene();lights=studio(renderer,scene);}
  if(renderer.getContext().isContextLost()){lights?.dispose();renderer.dispose();renderer=scene=lights=undefined;throw new Error('3D context unavailable');}
  return draw(renderer,scene!);
 });
 cache.set(key,job);if(cache.size>PORTRAIT_CACHE_LIMIT)cache.delete(cache.keys().next().value!);
 chain=job.catch(()=>{cache.delete(key);});return job;
}
/** Draws one object filling the picture from a friendly angle, then removes it. */
function snap(r:THREE.WebGLRenderer,s:THREE.Scene,object:THREE.Object3D,width:number,height:number,yaw:number){
 r.setSize(width,height,false);const camera=new THREE.PerspectiveCamera(30,width/height,.1,40);
 s.add(object);frame(camera,object,{yaw,margin:1.04});r.render(s,camera);s.remove(object);
 return r.domElement.toDataURL('image/png');
}
/** A hero wearing their clothes, on their ride if they have one (a square picture then, turned to show the ride). */
export function renderHeroPortrait(type:number,wardrobe:Wardrobe,ride?:Ride):Promise<string>{
 return queue(portraitKey(type,wardrobe,ride),(r,s)=>{
  const hero=hero3D(type);if(!hero)throw new Error('No 3D model for this hero');
  const model=createRidingHero(hero.skin,outfitForWardrobe(wardrobe),wardrobe,ride);
  try{return ride?snap(r,s,model.root,320,320,.55):snap(r,s,model.root,256,320,.3);}
  finally{model.dispose();r.renderLists.dispose();}
 });
}
/** A ride on its own, for the shop and garage. */
export function renderVehiclePortrait(id:string,paint?:string):Promise<string>{
 return queue(JSON.stringify(['ride',id,paint??null]),(r,s)=>{
  const model=createVehicleModel(id,paint);
  try{return snap(r,s,model.root,280,220,.75);}
  finally{model.dispose();r.renderLists.dispose();}
 });
}
