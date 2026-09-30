'use client';
import {useEffect,useRef,useState} from 'react';
import type {ComponentType} from 'react';
import {Bike,Car,Tractor,Truck,IceCreamCone,Siren,Motorbike,Scooter,ArrowRight,Palette} from 'lucide-react';
import {VEHICLES,PAINTS,rideOf,type VehicleId} from '@/lib/vehicles';
import type {Wardrobe} from '@/lib/clothing';
import Sprite from './hero-sprite';
import {Price,Ribbon,canAfford,celebrate} from './shop-kit';
import './garage.css';
/** Line icons in the lucide style for the two boards, which lucide does not draw. */
const Board=({glow=false}:{glow?:boolean})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2"/>{glow?<path d="M7 17h2M11 18h2M15 17h2"/>:<><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>}</svg>;
const ICONS:Record<VehicleId,ComponentType>={skateboard:()=><Board/>,scooter:Scooter,tricycle:Bike,bicycle:Bike,hoverboard:()=><Board glow/>,'go-kart':Car,moped:Motorbike,tractor:Tractor,car:Car,'ice-cream-van':IceCreamCone,'fire-engine':Siren};
/** A ride's picture: drawn in 3D once it scrolls into view, with a simple icon until then or without WebGL. */
export function RidePicture({id,paint}:{id:VehicleId;paint?:string}){
 const element=useRef<HTMLSpanElement>(null),[src,setSrc]=useState<{key:string;url:string}|null>(null),key=`${id}:${paint??''}`,Icon=ICONS[id]??Truck;
 useEffect(()=>{
  let cancelled=false,started=false;
  const start=()=>{if(started)return;started=true;import('@/lib/hero-portrait-renderer').then(m=>m.renderVehiclePortrait(id,paint)).then(url=>{if(!cancelled)setSrc({key,url});}).catch(()=>{/* Keep the icon when WebGL is unavailable. */});};
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start();observer.disconnect();}},{rootMargin:'160px'});
  if(element.current)observer.observe(element.current);
  return()=>{cancelled=true;observer.disconnect();};
 },[key]);
 return <span ref={element} className="ride-art" aria-hidden="true">{src?.key===key?<img src={src.url} alt=""/>:<Icon/>}</span>;
}
/**
 * The garage: every ride with its picture and price. Tapping a ride buys it the first time and hops on; tapping the ride
 * you are on parks it. Rides can be repainted for free. They are just for fun and never change battle stats.
 */
/** The parts of the signed-in pupil the garage reads. */
type Rider={name:string;coins:number;unlimitedCoins?:boolean;hero:number;heroLocked?:boolean;gender?:string;uniform?:string;outfit?:string;clothing?:Wardrobe;vehiclesOwned?:string[];vehicle?:string;vehiclePaint?:Record<string,string>};
export default function Garage({me,busy,action,mode='shop',onShop,mirror=true}:{me:Rider;busy:boolean;action:(data:Record<string,unknown>,message?:string)=>Promise<unknown>;mode?:'shop'|'backpack';onShop?:()=>void;mirror?:boolean}){
 const owned:string[]=me.vehiclesOwned??[],ride=rideOf(me),current=VEHICLES.find(v=>v.id===ride?.id),list=VEHICLES.filter(v=>mode==='shop'||owned.includes(v.id));
 const paintOf=(id:string)=>me.vehiclePaint?.[id];
 const tap=async(v:typeof VEHICLES[number])=>{const riding=ride?.id===v.id,mine=owned.includes(v.id),name=v.name.toLowerCase();const r=await action(riding?{action:'park'}:{action:'vehicle',item:v.id});if(r)celebrate(riding?`Parked the ${name}. It stays in your garage.`:mine?`Off you go on your ${name}!`:`You bought the ${name}! Hop on!`);};
 const repaint=async(paint:string)=>{if(!ride||ride.paint===paint)return;const r=await action({action:'vehicle_paint',item:ride.id,paint});if(r)celebrate(`Your ${current!.name.toLowerCase()} is ${PAINTS.find(p=>p.id===paint)!.name.toLowerCase()} now!`);};
 return <section className="garage">
  <div className={`mirror garage-mirror ${mirror?'':'no-picture'}`}>{!mirror?null:me.heroLocked?<Sprite type={me.hero} gender={me.gender} uniform={me.uniform} clothing={me.clothing} outfit={me.outfit} ride={ride} className="garage-sprite"/>:<Car aria-hidden="true"/>}
   <div><b>{current?`Riding: ${current.name}`:mode==='shop'?'Rides for your hero':`${me.name}’s garage`}</b>
   <p>{current?'Tap a colour to repaint it for free, or tap your ride again to park it.':mode==='shop'?'Tap a ride to buy it and hop on. You pay once, then riding is always free. Rides are just for fun: they never change your powers.':`${owned.length} of ${VEHICLES.length} rides collected. Tap one to ride it.`}</p>
   {current&&<div className="paint-row" role="group" aria-label={`Paint your ${current.name.toLowerCase()}`}><Palette aria-hidden="true"/>{PAINTS.map(p=><button key={p.id} className="paint-dot" style={{background:`#${p.hex.toString(16).padStart(6,'0')}`}} aria-label={p.name} aria-pressed={ride?.paint===p.id} disabled={busy} onClick={()=>repaint(p.id)}/>)}</div>}
   {mode==='backpack'&&onShop&&<button className="quiet-button" onClick={onShop}>Find more rides in the shop <ArrowRight aria-hidden="true"/></button>}</div></div>
  {mode==='backpack'&&!owned.length&&<div className="empty-note"><Bike aria-hidden="true" className="empty-ride"/><p>No rides yet. Earn some coins, then visit the rides aisle in the shop.</p></div>}
  <div className="shop-grid garage-grid">{list.map(v=>{const mine=owned.includes(v.id),riding=ride?.id===v.id;return <button key={v.id} className={`shop-card ride-card ${riding?'is-equipped':mine?'is-owned':''}`} disabled={busy||(!mine&&!canAfford(v.price,me))} onClick={()=>tap(v)} aria-label={`${v.name}. ${riding?'You are riding it. Tap to park.':mine?'You own it. Tap to ride.':`${v.price} coins.`}`}>
   {riding?<Ribbon kind="equipped">Riding</Ribbon>:mine&&<Ribbon kind="owned">Owned</Ribbon>}
   <RidePicture id={v.id} paint={mine?paintOf(v.id):undefined}/><b>{v.name}</b><small className="ride-blurb">{v.blurb}</small>
   {riding?<span className="card-foot">Tap to park</span>:mine?<span className="card-foot">Ride · Free</span>:<Price price={v.price} me={me}/>}
  </button>})}</div>
 </section>;
}
