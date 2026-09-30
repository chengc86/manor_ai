'use client';
import {uniformPieces,wear,type Wardrobe} from '@/lib/clothing';
import {equipment} from '@/lib/equipment';
import HeroPortrait from './hero-portrait';
import type {Ride} from '@/lib/vehicles';
export default function HeroSprite({type=0,className='',outfit='none',uniform='none',clothing,gender='boy',weapon='none',ride}:{type?:number;className?:string;outfit?:string;uniform?:string;clothing?:Wardrobe;gender?:string;weapon?:string;ride?:Ride}){
 const dressed=clothing??uniformPieces(uniform,gender).reduce((w,id)=>wear(w,id),{} as Wardrobe),legacy=type===7||type===8;
 return <span aria-hidden="true" className={`sprite ${legacy?'':'starter-sprite fitted-sprite'} sprite-${type} outfit-${outfit} ${className}`} style={legacy?undefined:{backgroundImage:'none'}}>
 {!legacy&&<HeroPortrait type={type} clothing={dressed} ride={ride}/>}
 {weapon!=='none'&&<img src={`/weapons/${equipment(weapon).art}.png`} alt="" className={`equipped-weapon weapon-${weapon}`}/>}
 </span>
}
