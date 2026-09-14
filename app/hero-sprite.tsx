import {equipment} from '@/lib/equipment';
import {accessory} from '@/lib/accessories';
export default function HeroSprite({type=0,className='',outfit='classic',uniform='winter',gender='boy',weapon='none'}:{type?:number;className?:string;outfit?:string;uniform?:string;gender?:string;weapon?:string}){
 const item=accessory(outfit);
 return <span aria-hidden="true" className={`sprite ${(type<7||type>=9)?'starter-sprite':''} sprite-${type} outfit-${outfit} ${className}`} style={(type<7||type>=9)?{backgroundImage:`url('/uniforms/${['winter','summer','sports'].includes(uniform)?uniform:'winter'}-${gender==='girl'?'girl':'boy'}/${type}.png')`}:undefined}>
 {(type<7||type>=9)&&<img className={`hero-accessory accessory-${item.image}`} src={`/accessories/${item.image}.png`} alt=""/>}
 {weapon!=='none'&&<img src={`/weapons/${equipment(weapon).art}.png`} alt="" className={`equipped-weapon weapon-${weapon}`}/>}
 </span>
}
