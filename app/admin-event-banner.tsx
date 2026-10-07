'use client';
import {useEffect,useRef,useState} from 'react';
import {ADMIN_EVENT} from '@/lib/admin-event';

type Event={id:string;active:boolean;start:number;end:number};
export default function AdminEventBanner({event,me,now}:{event?:Event;me:any;now:number}){
 const audio=useRef<HTMLAudioElement|null>(null),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(false);
 const active=!!event?.active,gift=me?.eventGifts?.[ADMIN_EVENT.id];
 useEffect(()=>{const track=new Audio('/audio/admin-abuse-rock.wav');track.loop=true;track.volume=.22;audio.current=track;return()=>{track.pause();audio.current=null;};},[]);
 useEffect(()=>{
  const track=audio.current;if(!track)return;
  if(!active||muted){track.pause();return;}
  let stopped=false;
  const play=()=>{track.play().then(()=>{if(stopped)track.pause();else setPlaying(true);}).catch(()=>{});};
  play();window.addEventListener('pointerdown',play,{once:true});window.addEventListener('keydown',play,{once:true});
  return()=>{stopped=true;track.pause();window.removeEventListener('pointerdown',play);window.removeEventListener('keydown',play);};
 },[active,muted]);
 if(!event||now>=event.end)return null;
 const minutes=Math.max(1,Math.ceil((event.end-now)/60000));
 return <aside className={`admin-event-sign ${active?'live':''}`} aria-label="Admin Abuse event">
  <div className="event-medallion" aria-hidden="true">★</div>
  <div><p className="eyebrow">{active?'LIVE · GOLDEN MANOR':'NEXT MONDAY · AFTER SCHOOL'}</p><h2>Admin Abuse</h2>
   <p><b>Monday 12 October · 6–8 pm UK time</b>{active&&` · ${minutes} minutes left`}</p>
   <p>Gold scenery, intense rock and <b>+5 coins for every correct answer</b>. Sign in during the event for a free Golden Manor Medal and a free pocket if yours are full. Earn the Admin Abuse achievement and trophies for heroes you already own.</p>
   {active&&(gift?<p className="event-gift">✓ Your medal is saved in your backpack.{gift.extraSlot?' Your extra pocket is open.':''} Equip it between waves.</p>:<p className="event-gift">{me?'Your gift is being saved…':'Sign in to receive your free gift.'}</p>)}
  </div>
  {active&&<button className="secondary-button" onClick={()=>{if(playing&&!muted){setMuted(true);setPlaying(false);}else{setMuted(false);audio.current?.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}}} aria-pressed={playing&&!muted}>{playing&&!muted?'Mute rock music':'Play rock music'}</button>}
 </aside>;
}
