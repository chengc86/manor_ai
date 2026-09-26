'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,Lock,Search} from 'lucide-react';
import {HEROES,SELECTABLE_HERO_IDS,HERO_CHANGE_COST} from '@/lib/heroes';
import {heroFamily,heroKind} from '@/lib/hero-catalogue';
import {HERO_TRAITS,modText} from '@/lib/builds';
import Sprite from './hero-sprite';
type Player={id:string;name:string;hero:number};
const PAGE_SIZE=24;
export default function HeroPicker({me,players,busy,liveBattle,onChoose}:{me:any;players:Player[];busy:boolean;liveBattle:boolean;onChoose:(id:number)=>void}){
 const [search,setSearch]=useState(''),[family,setFamily]=useState('All'),[availableOnly,setAvailableOnly]=useState(false),[page,setPage]=useState(0);
 const owners=new Map<number,Player>();for(const player of players)if(player.id!==me.id)owners.set(player.hero,player);
 const available=SELECTABLE_HERO_IDS.filter(id=>!owners.has(id)&&!(me.heroLocked&&me.hero===id)).length;
 const query=search.trim().toLowerCase();
 const matches=SELECTABLE_HERO_IDS.filter(id=>(family==='All'||heroFamily(id)===family)&&(!availableOnly||(!owners.has(id)&&!(me.heroLocked&&me.hero===id)))&&`${HEROES[id].name} ${heroKind(id)} ${HERO_TRAITS[id].role}`.toLowerCase().includes(query));
 const pages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE)),currentPage=Math.min(page,pages-1);
 useEffect(()=>setPage(0),[search,family,availableOnly]);
 return <section className="hero-picker" aria-label="Choose a hero">
  <p className="muted">{SELECTABLE_HERO_IDS.length} heroes · {available} available. Each hero belongs to one classmate. Extra defenders always use your chosen character.</p>
  {me.heroLocked&&<p className="hero-switch-note">Changing costs {HERO_CHANGE_COST.toLocaleString()} coins and changes all your deployed heroes. Your weapons, upgrades, clothes and backpack stay yours.</p>}
  <div className="hero-picker-tools"><label className="hero-search"><Search size={18}/><span className="sr-only">Search heroes by name, creature or role</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, creature or role…" type="search"/></label><label className="hero-available"><input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)}/>Available only</label></div>
  <div className="hero-families" aria-label="Hero families">{['All','Animals','Wonders','Playthings'].map(group=><button key={group} className={family===group?'active':''} aria-pressed={family===group} onClick={()=>setFamily(group)}>{group}</button>)}</div>
  <p className="hero-results" aria-live="polite">{matches.length} {matches.length===1?'hero':'heroes'} found{matches.length>PAGE_SIZE?` · Page ${currentPage+1} of ${pages}`:''}</p>
  <div className="hero-choices">{matches.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE).map(id=>{
    const hero=HEROES[id],owner=owners.get(id),mine=me.heroLocked&&me.hero===id;
    const disabled=busy||liveBattle||mine||!!owner||(me.heroLocked&&me.coins<HERO_CHANGE_COST);
    return <button key={id} disabled={disabled} className={`${mine?'chosen':''} ${owner&&!mine?'hero-taken':''}`} onClick={()=>onChoose(id)} aria-label={`${hero.name}, ${heroKind(id)}. ${mine?'Your hero':owner?'Already chosen by '+owner.name:HERO_TRAITS[id].role}`}>
      <Sprite type={id} gender={me.gender}/><b>{hero.name}</b><span className="hero-kind">{heroKind(id)}</span><span>{HERO_TRAITS[id].role}</span><small>{modText(HERO_TRAITS[id].mods)}</small>
      <strong className="hero-claim">{mine?<><CheckCircle2 size={15}/>Your hero</>:owner?<><Lock size={14}/>Chosen by {owner.name}</>:'Available'}</strong>
    </button>;
  })}</div>
  {!matches.length&&<p className="hero-empty">No heroes match. Try another name or family.</p>}
  {pages>1&&<nav className="hero-pagination" aria-label="Hero pages"><button className="secondary-button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</button><span>{currentPage+1} / {pages}</span><button className="secondary-button" disabled={currentPage===pages-1} onClick={()=>setPage(currentPage+1)}>Next</button></nav>}
  {liveBattle&&<p className="muted">You can browse now. Choose or change your hero between waves.</p>}
 </section>;
}
