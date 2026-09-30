'use client';
import {useEffect,useRef,useState} from 'react';
import type {Wardrobe} from '@/lib/clothing';
import type {Ride} from '@/lib/vehicles';
/** Portraits are generated from the same geometry as the interactive dressing room. */
export default function HeroPortrait({type,clothing,ride}:{type:number;clothing:Wardrobe;ride?:Ride}){
 const element=useRef<HTMLImageElement>(null),[rendered,setRendered]=useState<{key:string;src:string}|null>(null);
 const key=JSON.stringify([type,Object.entries(clothing).sort(([a],[b])=>a.localeCompare(b)),ride?[ride.id,ride.paint]:null]);
 useEffect(()=>{
  let cancelled=false,started=false;
  const start=()=>{if(started)return;started=true;import('@/lib/hero-portrait-renderer').then(m=>m.renderHeroPortrait(type,clothing,ride)).then(src=>{if(!cancelled)setRendered({key,src});}).catch(()=>{/* Keep the existing character image when WebGL is unavailable. */});};
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start();observer.disconnect();}},{rootMargin:'160px'});
  if(element.current)observer.observe(element.current);
  return()=>{cancelled=true;observer.disconnect();};
 },[key]);
 return <img ref={element} className="hero-base-art" data-hero-renderer={rendered?.key===key?'3d':'fallback'} src={rendered?.key===key?rendered.src:`/starters/${type}.${type>=16?'webp':'png'}`} alt=""/>;
}
