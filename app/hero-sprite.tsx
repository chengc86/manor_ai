import {uniformPieces,wear,type Wardrobe} from '@/lib/clothing';
import {equipment} from '@/lib/equipment';
import HeroWardrobe from './hero-wardrobe';
import {heroFit} from '@/lib/hero-fit';
export default function HeroSprite({type=0,className='',outfit='none',uniform='none',clothing,gender='boy',weapon='none'}:{type?:number;className?:string;outfit?:string;uniform?:string;clothing?:Wardrobe;gender?:string;weapon?:string}){
 const dressed=clothing??uniformPieces(uniform,gender).reduce((w,id)=>wear(w,id),{} as Wardrobe),src=`/starters/${type}.${type>=16?'webp':'png'}`,f=heroFit(type),legacy=type===7||type===8;
 return <span aria-hidden="true" className={`sprite ${legacy?'':'starter-sprite fitted-sprite'} sprite-${type} outfit-${outfit} ${className}`} style={legacy?undefined:{backgroundImage:'none'}}>
 {!legacy&&<>{dressed.back&&<svg className="fitted-cape" viewBox="0 0 100 100"><path d={`M${f.cx-f.width*.4},${f.neck+2} Q${f.cx-f.width*.8},${f.neck+25} ${f.cx-f.width*.85},89 Q${f.cx},96 ${f.cx+f.width*.85},89 Q${f.cx+f.width*.8},${f.neck+25} ${f.cx+f.width*.4},${f.neck+2}Z`} fill={dressed.back==='star-cape'?'#343f8e':'#8b2948'} stroke="#dec989" strokeWidth=".6"/></svg>}<img className="hero-base-art" src={src} alt=""/><HeroWardrobe type={type} clothing={dressed} src={src}/></>}
 {weapon!=='none'&&<img src={`/weapons/${equipment(weapon).art}.png`} alt="" className={`equipped-weapon weapon-${weapon}`}/>}
 </span>
}
