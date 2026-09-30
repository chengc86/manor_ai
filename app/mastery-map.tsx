'use client';
import {useEffect,useState} from 'react';
import {Target,RefreshCw,ArrowRight,Sparkles} from 'lucide-react';
import {HelpsheetButton} from './question-card';
// A pupil's topics, like a curriculum map: how sure they are of each topic, with a way to practise it or their weakest ones.
export type Focus={subject:string;topics:{id:string;title:string}[];weakest?:boolean};
const SUBJECT_ORDER=['Maths','English','Verbal reasoning','Non-verbal reasoning','Science'];
export const LEVEL_CLASS:Record<string,string>={new:'level-new',started:'level-started',practise:'level-practise',developing:'level-developing',secure:'level-secure',mastered:'level-mastered'};
export function MasteryMap({onPractise}:{onPractise:(f:Focus)=>void}){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[subject,setSubject]=useState('Maths'),[loading,setLoading]=useState(true);
 const fetchTopics=()=>fetch('/api/mastery',{cache:'no-store'}).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);setData(d);setError('')}).catch(e=>setError(e.message)).finally(()=>setLoading(false));
 useEffect(()=>{fetchTopics()},[]);const load=()=>{setLoading(true);fetchTopics();};
 if(error)return <div className="panel"><p role="alert">{error}</p><button className="secondary-button" onClick={load}><RefreshCw size={15}/> Try again</button></div>;
 if(!data)return <p role="status" className="panel">Loading your topics…</p>;
 if(data.year===2)return <div className="panel practice-empty"><Target size={36}/><h2>Topic maps are for the Year 6 questions.</h2><p>Keep earning coins in Practise. Your teacher can see how you are getting on.</p></div>;
 const levels=Object.fromEntries(data.levels.map((l:any)=>[l.id,l])),subjects=SUBJECT_ORDER.filter(s=>data.topics.some((t:any)=>t.subject===s)),topics=data.topics.filter((t:any)=>t.subject===subject),strands=[...new Set(topics.map((t:any)=>t.strand))] as string[];
 const summary=(s:string)=>{const ts=data.topics.filter((t:any)=>t.subject===s);return `${ts.filter((t:any)=>t.level==='secure'||t.level==='mastered').length} of ${ts.length} secure`;};
 return <div className="mastery-map">
  <div className="mastery-subjects" role="tablist" aria-label="Subjects">{subjects.map(s=><button key={s} role="tab" aria-selected={s===subject} className={s===subject?'active':''} onClick={()=>setSubject(s)}><b>{s}</b><span>{summary(s)}</span></button>)}</div>
  <div className="mastery-head"><div><h2>{subject} topics</h2><p>Each topic shows how many you have got right the first time and how many went to your notebook. Tap Practise to get questions from that topic in Earn coins.</p></div>
   <button className="primary" onClick={()=>onPractise({subject,topics:[],weakest:true})}><Sparkles size={17}/> Practise my weakest topics</button></div>
  <ul className="mastery-legend" aria-label="What the colours mean">{data.levels.map((l:any)=><li key={l.id} className={LEVEL_CLASS[l.id]} title={l.hint}><i/>{l.label}</li>)}</ul>
  {loading&&<p role="status">Updating…</p>}
  {strands.map(strand=><section key={strand} className="mastery-strand"><h3>{strand}</h3><div className="mastery-topics">{topics.filter((t:any)=>t.strand===strand).map((t:any)=>{const tried=t.correct+t.wrong;return <article key={t.topic} className={`mastery-topic ${LEVEL_CLASS[t.level]}`}>
   <div className="mastery-topic-head"><b>{t.title}</b><span className="mastery-badge">{levels[t.level]?.label}</span></div>
   <div className="mastery-bar" role="img" aria-label={tried?`${Math.round((t.accuracy??0)*100)}% correct`:'Not started'}><i style={{width:`${Math.round((t.accuracy??0)*100)}%`}}/></div>
   <p>{tried?`${t.correct} right · ${t.wrong} to fix · ${Math.round((t.accuracy??0)*100)}%`:`${t.total} questions to explore`}</p>
   <div className="mastery-actions"><HelpsheetButton topic={t.topic} title={t.title} label="Helpsheet"/><button className="secondary-button" onClick={()=>onPractise({subject,topics:[{id:t.topic,title:t.title}]})}>Practise <ArrowRight size={15}/></button></div>
  </article>})}</div></section>)}
 </div>;
}
