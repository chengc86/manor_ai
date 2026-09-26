import {CLOTHING,type Wardrobe} from '@/lib/clothing';
import {equipment} from '@/lib/equipment';
import {HERO_ART} from '@/lib/hero-art';
const slots:Record<string,[number,number,number,number]>={top:[.24,.48,.53,.29],outer:[.22,.47,.57,.31],bottom:[.32,.70,.38,.23],feet:[.29,.86,.43,.10],tie:[.47,.51,.09,.22]};
export default function HeroSprite({type=0,className='',outfit='none',uniform='none',clothing,gender='boy',weapon='none'}:{type?:number;className?:string;outfit?:string;uniform?:string;clothing?:Wardrobe;gender?:string;weapon?:string}){
 const wearable=clothing?CLOTHING.filter(item=>clothing[item.slot]===item.id):[];
 const art=HERO_ART[type];
 return <span aria-hidden="true" className={`sprite ${(type<7||type>=9)?'starter-sprite':''} sprite-${type} outfit-${outfit} ${className}`} style={type>=16?{backgroundImage:'none'}:(type<7||type>=9)?{backgroundImage:clothing||uniform==='none'?`url('/starters/${type}.png')`:`url('/uniforms/${['winter','summer','sports'].includes(uniform)?uniform:'winter'}-${gender==='girl'?'girl':'boy'}/${type}.png')`}:undefined}>
 {type>=16?<svg className="hero-raster-frame" viewBox={`0 0 ${art?.width??1024} ${art?.height??1024}`} width="100%" height="100%" aria-hidden="true">
  <image href={`/starters/${type}.webp`} width={art?.width??1024} height={art?.height??1024}/>
  {[...wearable].sort((a,b)=>['bottom','top','outer','feet','tie'].indexOf(a.slot)-['bottom','top','outer','feet','tie'].indexOf(b.slot)).map(item=>{const [x,y,w,h]=item.id==='dress'?[.21,.48,.59,.41]:slots[item.slot];const offset=['top','outer','tie'].includes(item.slot)?(art?.neckY??.48)-.48:0;return <image key={item.id} href={`/clothes/${item.art}.png`} x={x*(art?.width??1024)} y={(y+offset)*(art?.height??1024)} width={w*(art?.width??1024)} height={Math.max(.08,h-offset)*(art?.height??1024)} preserveAspectRatio="none"/>;})}
 </svg>:wearable.map(item=><img key={item.id} className={`clothing-layer clothing-${item.slot} clothing-item-${item.id}`} src={`/clothes/${item.art}.png`} alt=""/>)}
 {weapon!=='none'&&<img src={`/weapons/${equipment(weapon).art}.png`} alt="" className={`equipped-weapon weapon-${weapon}`}/>}
 </span>
}
