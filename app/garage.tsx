'use client';
import {useEffect,useRef,useState} from 'react';
import type {ComponentType} from 'react';
import {Bike,Car,Tractor,Truck,IceCreamCone,Siren,Motorbike,Scooter,ArrowRight,Palette} from 'lucide-react';
import {VEHICLES,PAINTS,type Ride,type VehicleId} from '@/lib/vehicles';
import type {Wardrobe} from '@/lib/clothing';
import {HEROES} from '@/lib/heroes';
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
 * The garage: every ride with its picture and price. A ride is bought once, then given to one hero.
 * Tapping the ride that hero is on parks it. If that hero already has a ride, the new one replaces it and the old one stays in the garage.
 * During a wave only that hero rides, on the grass. A dearer ride is faster. Powers stay the same.
 */
/** The parts of the signed-in pupil the garage reads. */
type Rider={name:string;coins:number;unlimitedCoins?:boolean;hero:number;heroLocked?:boolean;gender?:string;uniform?:string;outfit?:string;clothing?:Wardrobe;vehiclesOwned?:string[];vehiclePaint?:Record<string,string>};
type RideHero={id:string;type:number;cell:number;ride?:Ride;gender?:string;uniform?:string;outfit?:string;clothing?:Wardrobe};
export default function Garage({me,busy,action,mode='shop',onShop,mirror=true,defenders=[],heroId,onHero}:{me:Rider;busy:boolean;action:(data:Record<string,unknown>,message?:string)=>Promise<unknown>;mode?:'shop'|'backpack';onShop?:()=>void;mirror?:boolean;defenders?:RideHero[];heroId?:string;onHero?:(id:string)=>void}){
 const owned:string[]=me.vehiclesOwned??[],[ownId,setOwnId]=useState(''),chosen=heroId||ownId,selected=defenders.find(d=>d.id===chosen)??defenders[0],pick=onHero??setOwnId;
 const ride=selected?.ride,current=VEHICLES.find(v=>v.id===ride?.id),list=VEHICLES.filter(v=>mode==='shop'||owned.includes(v.id)),label=(d:RideHero)=>`${HEROES[d.type]?.name??'Hero'} #${defenders.indexOf(d)+1}`;
 const paintOf=(id:string)=>me.vehiclePaint?.[id];
 const tap=async(v:typeof VEHICLES[number])=>{const riding=ride?.id===v.id,mine=owned.includes(v.id),name=v.name.toLowerCase();
  if(!selected){if(mine){celebrate(`${v.name} is in your garage. Place a hero, then choose who rides it.`);return;}const r=await action({action:'vehicle',item:v.id});if(r)celebrate(`You bought the ${name}! Place a hero to give it to them.`);return;}
  const r=await action(riding?{action:'park',id:selected.id}:{action:'vehicle',item:v.id,id:selected.id});if(r)celebrate(riding?`Parked the ${name}. It stays in your garage.`:mine?`${label(selected)} hops on the ${name}!`:`You bought the ${name}! ${label(selected)} hops on.`);};
 const repaint=async(paint:string)=>{if(!ride||ride.paint===paint)return;const r=await action({action:'vehicle_paint',item:ride.id,paint});if(r)celebrate(`The ${current!.name.toLowerCase()} is ${PAINTS.find(p=>p.id===paint)!.name.toLowerCase()} now!`);};
 return <section className="garage">
  {defenders.length>0&&<div className="shop-hero-row" role="listbox" aria-label="Choose which hero gets the ride">{defenders.map(d=>{const heroRide=d.ride;return <button key={d.id} type="button" aria-pressed={d.id===selected?.id} className={`shop-hero-pick ${d.id===selected?.id?'chosen':''}`} onClick={()=>pick(d.id)}><Sprite type={d.type} gender={d.gender} uniform={d.uniform} clothing={d.clothing} outfit={d.outfit} ride={heroRide}/><b>{label(d)}</b><small>{d.cell<0?'Waiting to be placed':'On the map'}</small><span className="pick-weapon">{heroRide?VEHICLES.find(v=>v.id===heroRide.id)?.name:'On foot'}</span></button>})}</div>}
  <div className={`mirror garage-mirror ${mirror?'':'no-picture'}`}>{!mirror?null:selected?<Sprite type={selected.type} gender={selected.gender??me.gender} uniform={selected.uniform??me.uniform} clothing={selected.clothing??me.clothing} outfit={selected.outfit??me.outfit} ride={ride} className="garage-sprite"/>:me.heroLocked?<Sprite type={me.hero} gender={me.gender} uniform={me.uniform} clothing={me.clothing} outfit={me.outfit} className="garage-sprite"/>:<Car aria-hidden="true"/>}
   <div><b>{current?`${selected?label(selected):'Hero'} · ${current.name}`:selected?`A ride for ${label(selected)}`:mode==='shop'?'Rides for one hero':`${me.name}’s garage`}</b>
   <p>{current?'Tap a colour to repaint it for free, or tap this ride again to park it. Only this hero rides it, on the grass. A dearer ride is faster.':selected?'Tap a ride to give it to this hero. You pay once. If they already have a ride, that one is parked. In a wave only this hero rides, on the grass.':'Buy a ride now, then place a hero and choose who rides it. One purchase belongs to one hero.'}</p>
   {current&&<div className="paint-row" role="group" aria-label={`Paint the ${current.name.toLowerCase()}`}><Palette aria-hidden="true"/>{PAINTS.map(p=><button key={p.id} className="paint-dot" style={{background:`#${p.hex.toString(16).padStart(6,'0')}`}} aria-label={p.name} aria-pressed={ride?.paint===p.id} disabled={busy} onClick={()=>repaint(p.id)}/>)}</div>}
   {mode==='backpack'&&onShop&&<button className="quiet-button" onClick={onShop}>Find more rides in the shop <ArrowRight aria-hidden="true"/></button>}</div></div>
  {mode==='backpack'&&!owned.length&&<div className="empty-note"><Bike aria-hidden="true" className="empty-ride"/><p>No rides yet. Earn some coins, then visit the rides aisle in the shop.</p></div>}
  <div className="shop-grid garage-grid">{list.map(v=>{const mine=owned.includes(v.id),holder=defenders.find(d=>d.ride?.id===v.id),riding=holder?.id===selected?.id;return <button key={v.id} className={`shop-card ride-card ${riding?'is-equipped':mine?'is-owned':''}`} disabled={busy||(!mine&&!canAfford(v.price,me))} onClick={()=>tap(v)} aria-label={`${v.name}. ${riding?'This hero is riding it. Tap to park.':holder?`${label(holder)} has it. Tap to give it to this hero.`:mine?'You own it. Tap to give it to this hero.':`${v.price} coins.`}`}>
   {riding?<Ribbon kind="equipped">Riding</Ribbon>:holder?<Ribbon kind="owned">Other hero</Ribbon>:mine&&<Ribbon kind="owned">Owned</Ribbon>}
   <RidePicture id={v.id} paint={mine?paintOf(v.id):undefined}/><b>{v.name}</b><small className="ride-blurb">{v.blurb}</small>
   {riding?<span className="card-foot">Tap to park</span>:mine?<span className="card-foot">Give to this hero · Free</span>:<Price price={v.price} me={me}/>}
  </button>})}</div>
 </section>;
}
