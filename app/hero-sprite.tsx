import {equipment} from '@/lib/equipment';
export default function HeroSprite({type=0,className='',outfit='none',uniform='none',gender='boy',weapon='none'}:{type?:number;className?:string;outfit?:string;uniform?:string;gender?:string;weapon?:string}){
 return <span aria-hidden="true" className={`sprite ${(type<7||type>=9)?'starter-sprite':''} sprite-${type} outfit-${outfit} ${className}`} style={(type<7||type>=9)?{backgroundImage:uniform==='none'?`url('/starters/${type}.png')`:`url('/uniforms/${['winter','summer','sports'].includes(uniform)?uniform:'winter'}-${gender==='girl'?'girl':'boy'}/${type}.png')`}:undefined}>

 {weapon!=='none'&&<img src={`/weapons/${equipment(weapon).art}.png`} alt="" className={`equipped-weapon weapon-${weapon}`}/>}
 </span>
}
