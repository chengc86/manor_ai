'use client';
import {equipment} from '@/lib/equipment';
import {useMemo,useEffect,useRef,useState,type CSSProperties} from 'react';
import Sprite from './hero-sprite';
import {HEROES} from '@/lib/heroes';
import {simulate,monsterProgress,monsterHealth,percent,pathPosition,COLS,ROWS,PATH,type Battle} from '@/lib/battle';
// Round only the visual corner, keeping the shared combat rules unchanged.
function visualPosition(progress:number){
 const distance=Math.max(0,Math.min(PATH.length-1,progress*(PATH.length-1))),corner=Math.round(distance),radius=.35;
 if(corner>0&&corner<PATH.length-1&&Math.abs(distance-corner)<radius){
  const a=PATH[corner-1],b=PATH[corner],c=PATH[corner+1];
  if((b.x-a.x)!==(c.x-b.x)||(b.y-a.y)!==(c.y-b.y)){
   const t=(distance-corner+radius)/(radius*2),u=1-t;
   const start={x:b.x+(a.x-b.x)*radius,y:b.y+(a.y-b.y)*radius},end={x:b.x+(c.x-b.x)*radius,y:b.y+(c.y-b.y)*radius};
   return{x:u*u*start.x+2*u*t*b.x+t*t*end.x,y:u*u*start.y+2*u*t*b.y+t*t*end.y};
  }
 }
 return pathPosition(progress);
}
function useBattleClock(now:number){
 const target=useRef({now,at:0}),[frame,setFrame]=useState(now);
 useEffect(()=>{target.current={now,at:performance.now()}},[now]);
 useEffect(()=>{
  let request=0,last=performance.now(),time=target.current.now;
  const tick=(at:number)=>{const delta=at-last;last=at;const desired=target.current.now+at-target.current.at;
   // Ease small server-clock corrections instead of snapping enemies backwards.
   time=delta>1000?desired:time+delta+Math.max(-delta*.05,Math.min(delta*.05,desired-(time+delta)));
   setFrame(time);request=requestAnimationFrame(tick);
  };
  request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request);
 },[]);
 return frame;
}
export default function BattleScene({battle,now}:{battle:Battle;now:number}){
 const sim=useMemo(()=>simulate(battle),[battle.start]);
 const monsterHits=useMemo(()=>Array.from({length:sim.count},(_,i)=>sim.events.filter(e=>e.monster===i)),[sim]);
 const frameNow=useBattleClock(now);
 const elapsed=Math.max(0,(frameNow-battle.start)/1000),active=sim.events.filter(e=>elapsed-e.at>=0&&elapsed-e.at<.75);
 const monsters=Array.from({length:sim.count},(_,i)=>{const progress=monsterProgress(sim.tracks[i],elapsed);const hp=Math.max(0,monsterHealth(battle.wave,i)-monsterHits[i].filter(e=>e.at+.25<=elapsed).reduce((s,e)=>s+e.damage,0));const d=sim.deathAt[i];return{id:i,hp,maxHp:monsterHealth(battle.wave,i),boss:sim.rule.boss&&i===sim.count-1,progress,pos:visualPosition(progress),dead:hp===0,deathAt:d===null?null:d+.25}});
 const killed=monsters.filter(m=>m.dead).length;
 const recentKills=monsters.filter(m=>m.deathAt!==null&&elapsed-m.deathAt>=0&&elapsed-m.deathAt<1.1);
 const colours=HEROES.map(h=>h.colour);
 return <div className="battle-scene" aria-label={`Heroes are fighting. ${killed} of ${sim.count} monsters defeated.`}>{elapsed<2.5&&<div className="wave-announcement"><span>DEFEND THE MANOR</span><b>Wave {battle.wave}</b><small>Heroes, ready!</small></div>}<svg className="battle-projectiles" viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" aria-hidden="true">{active.map((e,i)=>{const f=battle.fighters[e.fighter],p=percent(f.cell),from={x:p.x*COLS/100,y:p.y*ROWS/100},t=Math.min(1,(elapsed-e.at)/.25),x=from.x+(e.point.x-from.x)*t,y=from.y+(e.point.y-from.y)*t,colour=e.dot?'#ef82df':e.freeze?'#9eeeff':e.slow?'#a9ed6f':e.mark?'#ff91c5':HEROES[f.type].colour;return <g key={`${e.at}-${i}`} opacity={t<1?1:Math.max(0,1-(elapsed-e.at-.25)*3)}>{(f.type===2||f.type===4)?<path d={`M ${from.x-.4} ${from.y-.3} Q ${x+.5} ${y-.6} ${e.point.x} ${e.point.y}`} stroke={colour} fill="none" strokeWidth=".13"/>:<><line strokeLinecap="round" x1={x-(e.point.x-from.x)*.13} y1={y-(e.point.y-from.y)*.13} x2={x} y2={y} stroke={colour} strokeWidth={[1,3,6].includes(f.type)?.12:.065}/><circle cx={x} cy={y} r={f.type===6?.25:[1,3].includes(f.type)?.17:.08} fill={colour}/></>}{t===1&&<circle cx={x} cy={y} r={.2+(elapsed-e.at-.25)*.5} fill="none" stroke={colour} strokeWidth=".06"/>}{[1,3,6].includes(f.type)&&t<1&&<circle cx={x} cy={y} r=".3" fill="none" stroke={colour} strokeWidth=".035" opacity=".5"/>}{t===1&&Array.from({length:5},(_,spark)=>{const angle=spark*Math.PI*2/5,r=.18+(elapsed-e.at-.25)*1.5;return <circle key={spark} cx={x+Math.cos(angle)*r} cy={y+Math.sin(angle)*r} r=".045" fill={colour}/>})}</g>})}</svg>
 {battle.fighters.map((f,i)=>{const pos=percent(f.cell),attack=active.find(e=>e.fighter===i);return <div className={`battle-fighter type-${f.type} tier-${f.level} ${attack?'attacking':''}`} key={f.id} style={{left:`${pos.x}%`,top:`${pos.y}%`,'--hero-colour':f.colour??colours[f.type]} as CSSProperties}><span className="hero-pedestal"/><Sprite type={f.type} gender={f.gender} uniform={f.uniform} outfit={f.outfit} weapon={f.weapon??(f.level?'standard':'none')}/><small className="battle-owner" style={{border:`2px solid ${f.colour??colours[f.type]}`}}>{f.name}</small><span className="fighter-level">{f.level}</span>{attack&&<span className="attack-name">{equipment(f.weapon).effect.toUpperCase()}</span>}</div>})}
 {monsters.map(m=>{if(m.progress<0||m.progress>=1||m.deathAt!==null&&elapsed>m.deathAt+.75)return null;const hit=active.find(e=>e.monster===m.id&&elapsed-e.at>=.25);const marked=monsterHits[m.id].some(e=>e.mark&&elapsed>=e.at&&elapsed<e.at+3);const slowed=monsterHits[m.id].some(e=>e.slow&&elapsed>=e.at&&elapsed<e.at+2);const frozen=monsterHits[m.id].some(e=>e.freeze&&elapsed>=e.at&&elapsed<e.at+e.freeze);const before=visualPosition(m.progress-.003),after=visualPosition(m.progress+.003),facing=after.x<before.x?-1:1;return <div key={m.id} className={`battle-monster ${frozen?'frozen':''} ${marked?'marked':''} ${slowed?'slowed':''} ${m.boss?'boss-monster':''} ${m.dead?'vanquished':''} ${hit?'hit':''}`} style={{left:`${m.pos.x/COLS*100}%`,top:`${m.pos.y/ROWS*100}%`}}><span className="monster-shadow"/>{(frozen||marked||slowed)&&<span className="status-label">{frozen?'FROZEN':marked?'MARKED':'SLOWED'}</span>}{m.boss&&<span className="boss-label">BOSS</span>}<span className="monster-facing" style={{transform:`scaleX(${facing})`}}><span className={`sprite sprite-enemy monster-variant-${m.id%3}`} style={{animationDelay:`-${m.id*.137}s`}}/></span><span className="monster-hp-track"><span style={{width:`${m.hp/m.maxHp*100}%`}}/></span>{hit&&!m.dead&&<b className="damage-number">{hit.critical?'CRIT ':hit.dot?'PAINT ':''}−{hit.damage}</b>}{m.dead&&<b className="poof">✦</b>}</div>})}
 {recentKills.map(m=><div key={m.id} className="defeat-burst" style={{left:`${m.pos.x/COLS*100}%`,top:`${m.pos.y/ROWS*100}%`}}>✧<span>Defeated!</span></div>)}
 {elapsed>battle.duration/1000-3&&<div className="battle-finale">{sim.killed===sim.count?<><b>Victory for the Manor!</b><span>The Manor House is safe.</span></>:<><b>Rally your heroes!</b><span>{`${sim.count-sim.killed} monsters got through. Reposition, upgrade and try again.`}</span></>}</div>}</div>
}
