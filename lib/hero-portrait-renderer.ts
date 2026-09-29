/** One shared WebGL renderer, bounded portrait cache, and one queued render at a time. */
import * as THREE from 'three';
import {createHeroModel,outfitForWardrobe} from './hero-model';
import {hero3D} from './hero-3d-catalogue';
import type {Wardrobe} from './clothing';
let renderer:THREE.WebGLRenderer|undefined;
let chain:Promise<unknown>=Promise.resolve();
const cache=new Map<string,Promise<string>>();
export const PORTRAIT_CACHE_LIMIT=192;
export function renderHeroPortrait(type:number,wardrobe:Wardrobe):Promise<string>{
 const key=JSON.stringify([type,Object.entries(wardrobe).sort(([a],[b])=>a.localeCompare(b))]);
 const cached=cache.get(key);if(cached){cache.delete(key);cache.set(key,cached);return cached;}
 const job=chain.then(()=>new Promise<void>(resolve=>setTimeout(resolve,0))).then(()=>{
  const hero=hero3D(type);if(!hero)throw new Error('No 3D model for this hero');
  if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(256,320);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;}
  if(renderer.getContext().isContextLost()){renderer.dispose();renderer=undefined;throw new Error('3D context unavailable');}
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,.8,.1,20);
  camera.position.set(.9,1.95,5.5);camera.lookAt(0,1.48,0);
  scene.add(new THREE.HemisphereLight(0xe5f5ff,0x55775b,2.5));
  const light=new THREE.DirectionalLight(0xffefdc,3.2);light.position.set(3,6,4);scene.add(light);
  const rim=new THREE.DirectionalLight(0xc2ddff,2);rim.position.set(-3,3,-2);scene.add(rim);
  const model=createHeroModel(hero.skin,outfitForWardrobe(wardrobe),wardrobe);scene.add(model.root);
  try{renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
  finally{model.dispose();renderer.renderLists.dispose();}
 });
 cache.set(key,job);if(cache.size>PORTRAIT_CACHE_LIMIT)cache.delete(cache.keys().next().value!);
 chain=job.catch(()=>{cache.delete(key);});return job;
}
