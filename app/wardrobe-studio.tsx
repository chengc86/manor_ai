'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import {HERO_3D_STUDIES,hero3D} from '@/lib/hero-3d-catalogue';
import {CLOTHING,CLOTHING_SLOTS,wear,type Wardrobe} from '@/lib/clothing';
import {outfitForWardrobe} from '@/lib/hero-outfit';
import HeroSprite from './hero-sprite';
const Hero3D=dynamic(()=>import('./hero-3d'),{ssr:false,loading:()=> <p>Loading 3D dressing room…</p>});
export default function WardrobeStudio(){
 const [heroId,setHeroId]=useState(16),[motion,setMotion]=useState<'idle'|'walk'|'attack'>('idle');
 const [wardrobe,setWardrobe]=useState<Wardrobe>({top:'shirt',bottom:'trousers',head:'gold-crown'});
 const hero=hero3D(heroId)!;
 return <section className="panel wardrobe-studio"><h2>3D dressing room</h2>
 <p>Explore all {HERO_3D_STUDIES.length} heroes and try on clothing. Trying things here does not buy or equip them in your account.</p>
 <div className="studio-layout"><Hero3D skin={hero.skin} outfit={outfitForWardrobe(wardrobe)} wardrobe={wardrobe} motion={motion}/>
 <div className="studio-controls">
 <label>Character<select value={heroId} onChange={e=>setHeroId(Number(e.target.value))}>{HERO_3D_STUDIES.map(h=><option key={h.id} value={h.id}>{h.name} · {h.kind}</option>)}</select></label>
 <label>Movement<select value={motion} onChange={e=>setMotion(e.target.value as typeof motion)}><option value="idle">Idle</option><option value="walk">Walk</option><option value="attack">Attack</option></select></label>
 {CLOTHING_SLOTS.map(slot=><label key={slot.id}>{slot.name}<select value={wardrobe[slot.id]??''} onChange={e=>{const id=e.target.value;setWardrobe(w=>{if(id)return wear(w,id);const next={...w};delete next[slot.id];return next;});}}><option value="">None</option>{CLOTHING.filter(c=>c.slot===slot.id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>)}
 </div></div>
 <details className="hero-roster-preview"><summary>View all {HERO_3D_STUDIES.length} heroes wearing this outfit</summary><div className="hero-roster-grid">{HERO_3D_STUDIES.map(h=><button key={h.id} onClick={()=>setHeroId(h.id)} aria-label={`Preview ${h.name}`}><HeroSprite type={h.id} clothing={wardrobe}/><b>{h.name}</b><small>{h.kind}</small></button>)}</div></details>
 </section>;
}
