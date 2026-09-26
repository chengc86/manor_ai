'use client';
import {useState} from 'react';
import {Trophy} from 'lucide-react';
import Sprite from './hero-sprite';
const metrics=[['correct','Correct answers'],['kills','Monsters defeated'],['damage','Damage dealt'],['wins','Waves won']] as const;
export default function ClassRanking({players,me}:any){
 const [metric,setMetric]=useState('correct');
 const rows=[...players].filter(p=>!p.testAccount).sort((a,b)=>(b.stats?.[metric]??0)-(a.stats?.[metric]??0)||a.name.localeCompare(b.name));
 let rank=0,last:number|undefined;
 return <article className="panel class-ranking"><div className="panel-heading"><h3><Trophy size={18}/> Class rankings</h3><span>{rows.length} players</span></div><label className="ranking-select">Rank by <select value={metric} onChange={e=>setMetric(e.target.value)}>{metrics.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><p className="ranking-note">All-time achievements · equal scores share a rank. Test accounts are excluded.</p>{rows.length?<ol className="ranking-list">{rows.map((p,i)=>{const score=Math.floor(p.stats?.[metric]??0);if(score!==last){rank=i+1;last=score}return <li key={p.id} className={p.id===me?'ranking-me':''}><span className="ranking-place">{rank}</span><Sprite type={p.hero} clothing={p.clothing}/><span className="ranking-name">{p.name}{p.id===me?' (you)':''}<small>{p.online?'Online now':'Offline'}</small></span><strong>{score.toLocaleString()}</strong></li>})}</ol>:<p>Choose a hero and start earning achievements to join the rankings.</p>}</article>
}
export function OnlineClass({players}:any){const online=players.filter((p:any)=>p.online);return <section className="online-class" aria-label="Classmates online"><strong><i className="online-dot"/>{online.length} online now</strong><div>{online.length?online.map((p:any)=><span className="online-person" key={p.id}>{p.heroLocked!==false&&<Sprite type={p.hero} clothing={p.clothing}/>} {p.name}</span>):<span>No classmates active right now</span>}</div><small>Active in the last 90 seconds</small></section>}
