import {createHeroModel,type HeroMotion} from './hero-model';
import {createVehicleModel} from './vehicle-model';
import type {RigOutfit} from './hero-outfit';
import type {Wardrobe} from './clothing';
import type {Ride} from './vehicles';
/**
 * A hero, optionally on their ride. The ride hangs inside the hero's root (offset back by the mount point), so the
 * battlefield can still bake everything from that one root with the hero's parts as bones.
 */
export function createRidingHero(skin:string,outfit:RigOutfit,wardrobe:Wardrobe|undefined,ride?:Ride){
 const hero=createHeroModel(skin,outfit,wardrobe);
 if(!ride)return {...hero,vehicle:undefined};
 const vehicle=createVehicleModel(ride.id,ride.paint),[x,y,z]=vehicle.mount;
 hero.root.position.set(x,y,z);vehicle.root.position.set(-x,-y,-z);hero.root.add(vehicle.root);hero.setRide(vehicle.pose);
 return {...hero,vehicle,
  animate(t:number,motion:HeroMotion,enabled=true){hero.animate(t,motion,enabled);vehicle.animate(t,motion==='walk',enabled);},
  dispose(){hero.dispose();vehicle.dispose();}};
}
