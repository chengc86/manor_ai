'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import {Users,Trophy,Swords,Shield,PersonStanding,Footprints,Shirt,ArrowRight,LogOut,RefreshCw,Sparkles,Bike} from 'lucide-react';
import AdminTrophy from './admin-trophy';
import Sprite from './hero-sprite';
import HeroPicker from './hero-picker';
import ClothesRack from './clothes-rack';
import Garage from './garage';
import {HEROES,HERO_CHANGE_COST} from '@/lib/heroes';
import {heroKind} from '@/lib/hero-catalogue';
import {hero3D} from '@/lib/hero-3d-catalogue';
import {outfitForWardrobe} from '@/lib/hero-outfit';
import {HERO_TRAITS} from '@/lib/builds';
import {CLOTHING} from '@/lib/clothing';
const Hero3D=dynamic(()=>import('./hero-3d'),{ssr:false,loading:()=> <p className="dressing-loading">Getting your hero ready…</p>});
const MOTIONS=[['idle','Stand',PersonStanding],['walk','Walk',Footprints],['attack','Attack',Swords]] as const;
// On a ride, "walk" rides along (wheels turning, pedals going round).
const RIDING_MOTIONS=[['idle','Stop',PersonStanding],['walk','Ride',Bike],['attack','Attack',Swords]] as const;
// My hero: who you are, how far you have come, and a dressing room with only your own hero and the clothes you own.
// Tapping clothes saves them on your hero; buying happens in the Quest Shop (SHUS aisle).
export default function MyHero({me,players,defenders,busy,liveBattle,action,onChoose,onShop,onLogout}:any){
 const [motion,setMotion]=useState<'idle'|'walk'|'attack'>('idle'),[rideHero,setRideHero]=useState('');
 const level=Math.floor(me.correct/10)+1,toNext=level*10-me.correct,model=me.heroLocked?hero3D(me.hero):undefined,kind=model?.kind??heroKind(me.hero),wardrobe=me.clothing??{},owned=CLOTHING.filter(c=>me.clothingOwned?.includes(c.id)).length,shown=defenders.find((d:any)=>d.id===rideHero)??defenders.find((d:any)=>d.ride)??defenders[0],portraitRide=shown?.ride;
 const picker=<HeroPicker me={me} players={players} busy={busy} liveBattle={!!liveBattle} onChoose={onChoose}/>;
 return <section className="my-hero"><header className="hero-banner"><div className="hero-banner-art">{me.heroLocked?<Sprite type={me.hero} gender={me.gender} uniform={me.uniform} clothing={me.clothing} outfit={me.outfit} ride={portraitRide} adminAbuseTrophy={shown?.adminAbuseTrophy} className="banner-sprite"/>:<Users aria-hidden="true"/>}</div>
 <div className="hero-banner-text"><span className="eyebrow mint">MY HERO</span><h2>{me.name}</h2><p>{me.heroLocked?<><b>{HEROES[me.hero].name}</b> the {kind} · {HERO_TRAITS[me.hero].role}</>:'Choose a hero below to join the squad. Your first choice is free.'}</p><div className="level-meter"><b>Level {level} adventurer</b><i aria-hidden="true"><b style={{width:`${me.correct%10*10}%`}}/></i><span>{toNext} more correct {toNext===1?'answer':'answers'} to reach level {level+1}</span></div></div>
 <div className="hero-stat-chips"><span><Trophy aria-hidden="true"/><b>{me.correct}</b>correct answers</span><span><Swords aria-hidden="true"/><b>{me.combat?.kills??0}</b>monsters defeated</span><span><Shield aria-hidden="true"/><b>{defenders.length}</b>{defenders.length===1?'defender':'defenders'}</span></div></header>
 {!me.heroLocked?<><h3 className="aisle-step"><span>1</span>Choose your hero</h3>{picker}</>:<><section className="dressing-room" aria-label="Dressing room"><div className="dressing-stage"><header className="dressing-head"><h3><Shirt aria-hidden="true"/>Dressing room</h3><p>Only your hero and the clothes you own are here. Tap a piece to put it on or take it off.</p></header>
 {model?<Hero3D skin={model.skin} outfit={outfitForWardrobe(wardrobe)} wardrobe={wardrobe} ride={portraitRide} adminAbuseTrophy={shown?.adminAbuseTrophy} motion={motion}/>:<Sprite type={me.hero} gender={me.gender} clothing={me.clothing} ride={portraitRide} adminAbuseTrophy={shown?.adminAbuseTrophy} className="dressing-sprite"/>}
 {model&&<div className="motion-buttons" role="group" aria-label="Show your hero">{(portraitRide?RIDING_MOTIONS:MOTIONS).map(([id,label,Icon])=><button key={id} aria-pressed={motion===id} className={motion===id?'active':''} onClick={()=>setMotion(id)}><Icon aria-hidden="true"/>{label}</button>)}</div>}</div>
 <div className="dressing-wardrobe">{owned>0&&<ClothesRack mode="backpack" mirror={false} me={me} busy={busy} action={action}/>}<div className="more-clothes"><Sparkles aria-hidden="true"/><div><b>{owned?'Want more clothes?':'Your wardrobe is empty'}</b><p>{owned?`You own ${owned} of ${CLOTHING.length} pieces.`:'Earn coins by answering questions, then choose your first clothes.'} New clothes are sold at SHUS in the Quest Shop.</p></div><button className="primary" onClick={()=>onShop('clothes')}>Visit SHUS <ArrowRight aria-hidden="true"/></button></div>
 <section className="hero-trophy-collection"><h3>Your hero trophies</h3>{defenders.map((d:any,i:number)=><div key={d.id}><b>Hero {i+1} · {d.cell<0?'In reserve':'On the map'}</b><AdminTrophy earned={d.adminAbuseTrophy}/>{!d.adminAbuseTrophy&&<p>No event trophy on this hero.</p>}</div>)}</section>
 <div className="hero-rides"><div className="aisle-title"><h3><Bike aria-hidden="true"/> Rides</h3></div><Garage mode="backpack" mirror={false} me={me} defenders={defenders} heroId={shown?.id} onHero={setRideHero} busy={busy} action={action} onShop={()=>onShop('rides')}/></div></div></section>
 <details className="change-hero"><summary><RefreshCw aria-hidden="true"/>Change to a different hero · {HERO_CHANGE_COST.toLocaleString()} coins</summary>{picker}</details></>}
 <button className="quiet-button hero-signout" disabled={busy} onClick={onLogout}><LogOut size={16}/> Sign out</button></section>;
}
