'use client';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import Sprite from './hero-sprite';
import {CLOTHING} from '@/lib/clothing';
import {ITEMS} from '@/lib/builds';
import {HEROES} from '@/lib/heroes';
import {equipment} from '@/lib/equipment';
export default function HeroProfile({player,defenders,onClose}:any){
 const heroes=defenders.filter((d:any)=>d.owner===player?.id),level=Math.floor((player?.stats?.correct??0)/10)+1;
 const clothes=CLOTHING.filter(c=>player?.collection?.clothing?.includes(c.id));
 const items=ITEMS.filter(i=>(player?.collection?.items?.[i.id]??0)>0);
 return <Dialog open={!!player} onOpenChange={o=>!o&&onClose()}><DialogContent className="hero-profile-dialog"><DialogTitle>{player?.name}’s hero</DialogTitle><DialogDescription>{player?HEROES[player.hero]?.name:''} · {player?.online?'Online now':'Offline'} · Adventurer level {level}</DialogDescription>{player&&<><div className="hero-profile-summary"><Sprite type={player.hero} clothing={player.clothing} uniform={player.uniform} gender={player.gender} className="profile-sprite"/><div className="profile-stats"><span><b>{level}</b>Adventurer level</span><span><b>{player.stats?.correct??0}</b>Correct answers</span><span><b>{player.stats?.kills??0}</b>Monsters defeated</span><span><b>{heroes.length}</b>Owned defenders</span></div></div><section className="profile-section"><h3>Wardrobe & accessories · {clothes.length}</h3><div className="profile-collection">{clothes.map(c=><span key={c.id}>{c.name}{player.clothing?.[c.slot]===c.id?' · Wearing':''}</span>)}</div>{!clothes.length&&<p>No clothing or accessories bought yet.</p>}</section><section className="profile-section"><h3>Items · {items.length}</h3><div className="profile-collection">{items.map(i=><span key={i.id}>{i.name} · Level {player.collection.items[i.id]}{player.collection.equippedItems?.includes(i.id)?' · Equipped':''}</span>)}</div>{!items.length&&<p>No items bought yet.</p>}</section><section className="profile-section"><h3>Defenders & weapon levels</h3>{heroes.map((d:any,i:number)=><article key={d.id} className="profile-defender"><strong>Defender {i+1} · {d.cell<0?'In reserve':'On the map'}</strong><p>{d.level?`${equipment(d.weapon).name} · Level ${d.level}`:'No weapon equipped'}</p><div className="profile-collection">{(d.weapons??[]).map((id:string)=><span key={id}>{equipment(id).name} · Lv. {id===d.weapon?d.level:d.weaponLevels?.[id]??1}</span>)}</div></article>)}{!heroes.length&&<p>No defenders purchased yet.</p>}</section></>}</DialogContent></Dialog>
}
