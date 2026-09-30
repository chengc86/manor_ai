'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {Volume2,Square} from 'lucide-react';
import {toast} from 'sonner';
import './read-aloud.css';
/**
 * "Read to me": the device's own speech voice reads a question aloud, in British English when the device has one,
 * a little slower than normal for young readers. One thing is read at a time across the game; pressing again stops.
 * Uses the browser's speech synthesis, so nothing is sent anywhere and it costs nothing.
 */
let reading:string|null=null;
const listeners=new Set<()=>void>();
const subscribe=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l);};};
const setReading=(id:string|null)=>{reading=id;listeners.forEach(l=>l());};
const canSpeak=()=>typeof window!=='undefined'&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
/** The friendliest voice on this device: British English first, and natural-sounding voices before robotic ones. */
function voice(){
 const score=(v:SpeechSynthesisVoice)=>{const lang=v.lang.replace('_','-').toLowerCase();return (lang==='en-gb'?4:lang.startsWith('en')?1:-99)+(/natural|neural|online|google|premium|enhanced|siri/i.test(v.name)?2:0);};
 return window.speechSynthesis.getVoices().filter(v=>score(v)>0).sort((a,b)=>score(b)-score(a))[0];
}
export function stopReading(){if(canSpeak())window.speechSynthesis.cancel();setReading(null);}
/** Reads sentences one after another; `id` names what is being read so its button can show "Stop". */
export function readAloud(id:string,sentences:string[]){
 if(!canSpeak()||!sentences.length)return;
 const synth=window.speechSynthesis,busy=synth.speaking||synth.pending,chosen=voice();
 synth.cancel();setReading(id);
 let started=false;
 const speak=()=>{
  if(reading!==id)return;
  synth.resume();
  sentences.forEach((text,i)=>{
   const u=new SpeechSynthesisUtterance(text);u.lang=chosen?.lang??'en-GB';if(chosen)u.voice=chosen;u.rate=.9;u.pitch=1.05;
   u.onstart=()=>{started=true;};
   u.onend=()=>{if(i===sentences.length-1&&reading===id)setReading(null);};
   u.onerror=e=>{if(e.error==='interrupted'||e.error==='canceled')return;if(reading===id){setReading(null);toast.error('Reading aloud is not working on this device just now.');}};
   synth.speak(u);
  });
  // Some devices have no voice at all and never start: give the button back rather than showing "Stop" forever.
  setTimeout(()=>{if(reading===id&&!started&&!synth.speaking){synth.cancel();setReading(null);toast.error('This device has no reading voice. Ask a grown-up to turn on text-to-speech.');}},4000);
 };
 // Straight after cancelling, some browsers drop the next sentence, so wait a moment when something was already playing.
 if(busy)setTimeout(speak,80);else speak();
}
/** Whether `id` is being read right now (to animate the hero while it "talks"). */
export function useReading(id:string){return useSyncExternalStore(subscribe,()=>reading===id,()=>false);}
export default function ReadAloud({id,sentences,label='Read to me',className=''}:{id:string;sentences:string[];label?:string;className?:string}){
 const supported=useSyncExternalStore(subscribe,canSpeak,()=>false),active=useReading(id);
 // Browsers load their voices lazily: ask early so the first press already gets the best voice.
 useEffect(()=>{if(canSpeak())window.speechSynthesis.getVoices();},[]);
 // Stop when the question changes or this part of the page goes away.
 useEffect(()=>()=>{if(reading===id)stopReading();},[id]);
 if(!supported)return null;
 return <button type="button" className={`read-aloud${active?' reading':''}${className?` ${className}`:''}`} aria-pressed={active} title={active?'Stop reading':'Hear this read aloud'} onClick={()=>active?stopReading():readAloud(id,sentences)}>
  {active?<Square aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}<span>{active?'Stop':label}</span>
 </button>;
}
