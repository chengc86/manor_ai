'use client';
import {useState} from 'react';
import {Coins,Store} from 'lucide-react';
import ItemShop,{WeaponShop} from './build-shop';
import ClothesRack from './clothes-rack';
import Garage from './garage';
import Sprite from './hero-sprite';
import {celebrate} from './shop-kit';
import {HEROES} from '@/lib/heroes';
import {equipment} from '@/lib/equipment';
export type ShopAisle='weapons'|'items'|'clothes'|'rides';
export const SHOP_AISLES:[ShopAisle,string,string,string][]=[['weapons','Weapons','/weapons/0.png','Make one hero stronger'],['items','Power-up items','/items/stopwatch.svg','Help all your heroes'],['clothes','Clothes','/clothes/0.png','SHUS · change your look'],['rides','Rides','/items/rides.svg','Bikes, cars and a boat']];
export function QuestShop({me,defenders,busy,liveBattle,action,navigate,aisle:shownAisle,onAisle}:any){
 const [ownAisle,setOwnAisle]=useState<ShopAisle>('weapons'),[heroId,setHeroId]=useState(''),aisle:ShopAisle=shownAisle??ownAisle,setAisle=onAisle??setOwnAisle;
 const selected=defenders.find((d:any)=>d.id===heroId)??defenders[0],label=(d:any)=>`${HEROES[d.type].name} #${defenders.indexOf(d)+1}`,earn=()=>navigate('practice');
 const weaponDone=async(data:any)=>{const r=await action(data);if(r){const w=equipment(data.weapon);celebrate(`${w.name} is ready! ${label(selected)} is using it now.`,`/weapons/${w.art}.png`)}return r};
 const upgradeDone=async()=>{const r=await action({action:'upgrade',id:selected.id});if(r){const w=equipment(selected.weapon);celebrate(`${w.name} is now level ${selected.level+1}!`,`/weapons/${w.art}.png`)}return r};
 return <section className="quest-shop"><header className="shop-banner">{me.heroLocked?<Sprite type={me.hero} gender={me.gender} uniform={me.uniform} clothing={me.clothing} outfit={me.outfit} ride={me.ride} className="banner-sprite"/>:<Store className="banner-icon" aria-hidden="true"/>}<div><span className="eyebrow mint">WELCOME TO THE QUEST SHOP</span><h2>What shall we get today, {me.name}?</h2><p>Spend the coins you earn from questions. Everything you buy stays in your backpack.</p></div><div className="shop-wallet"><b><Coins aria-hidden="true"/>{me.unlimitedCoins?'∞':me.coins.toLocaleString()}</b><span>coins to spend</span><button onClick={earn}>Earn more</button></div></header>
 {liveBattle&&<p className="shop-note" role="status">A wave is running! Look around now. Buying and swapping open again when the wave ends.</p>}
 <nav className="aisles four" aria-label="Shop aisles">{SHOP_AISLES.map(([id,name,art,hint])=><button key={id} aria-pressed={aisle===id} className={aisle===id?'active':''} onClick={()=>setAisle(id)}><img src={art} alt=""/><b>{name}</b><span>{hint}</span></button>)}</nav>
 {aisle==='weapons'&&(selected?<><h3 className="aisle-step"><span>1</span>Choose a hero</h3><div className="shop-hero-row">{defenders.map((d:any)=><button key={d.id} aria-pressed={d.id===selected.id} className={`shop-hero-pick ${d.id===selected.id?'chosen':''}`} onClick={()=>setHeroId(d.id)}><Sprite type={d.type} gender={d.gender} uniform={d.uniform} clothing={d.clothing} outfit={d.outfit} weapon={d.weapon??(d.level?'standard':'none')}/><b>{label(d)}</b><small>{d.cell<0?'Waiting to be placed':'On the map'}</small><span className="pick-weapon">{d.level?<><img src={`/weapons/${equipment(d.weapon).art}.png`} alt=""/>Level {d.level}</>:'No weapon yet'}</span></button>)}</div>
 <h3 className="aisle-step"><span>2</span>Pick a weapon for {label(selected)}</h3><WeaponShop key={selected.id} selected={selected} me={me} busy={busy} liveBattle={liveBattle} heroLabel={label(selected)} onAction={weaponDone} onUpgrade={upgradeDone} onEarn={earn}/></>
 :<div className="empty-note"><img src="/weapons/0.png" alt=""/><h3>Place a hero first</h3><p>Weapons belong to a hero on the map. Choose your hero, place it in the class world, then come back to arm it.</p><button className="primary" onClick={()=>navigate(me.heroLocked?'world':'hero')}>{me.heroLocked?'Go to the class world':'Choose my hero'}</button></div>)}
 {aisle==='items'&&<ItemShop me={me} busy={busy} liveBattle={liveBattle} action={action} defenders={defenders} onEarn={earn}/>}
 {aisle==='clothes'&&<ClothesRack me={me} busy={busy} action={action}/>}
 {aisle==='rides'&&<Garage me={me} defenders={defenders} heroId={selected?.id} onHero={setHeroId} busy={busy} action={action}/>}</section>}
