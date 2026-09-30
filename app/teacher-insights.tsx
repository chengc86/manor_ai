'use client';
import {useEffect,useState} from 'react';
import {Target,Flag,RefreshCw,CheckCircle2} from 'lucide-react';
import {toast} from 'sonner';
import {QuestionBody,ReadingPane,Explanation} from './question-card';
import Diagram from './question-diagram';
// Teacher views: how the class is doing in each topic, and questions pupils have reported.
const SUBJECT_ORDER=['Maths','English','Verbal reasoning','Non-verbal reasoning','Science'];
const REASON:Record<string,string>={answer:'The answer seems wrong',confusing:'The question is confusing',picture:'The picture doesn’t match',typo:'Spelling or typing mistake',other:'Something else'};
async function get(url:string){const r=await fetch(url,{cache:'no-store'}),d:any=await r.json();if(!r.ok)throw Error(d.error??'Unavailable. Try again.');return d;}
export function ClassMastery(){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[subject,setSubject]=useState('Maths');
 const load=()=>get('/api/mastery').then(d=>{setData(d);setError('')}).catch(e=>setError(e.message));useEffect(()=>{load()},[]);
 const topics=(data?.topics??[]).filter((t:any)=>t.subject===subject);
 return <section className="panel teacher-insight" aria-labelledby="class-mastery-title"><div className="section-title"><h2 id="class-mastery-title"><Target/> Class topic mastery · Year 6</h2><button className="quiet-button" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
  <p>Accuracy counts every wrong attempt and each question answered correctly. “Needs help” lists pupils getting fewer than half right after three or more answers in that topic.</p>
  {error&&<p role="alert">{error}</p>}
  <div className="mastery-subjects" role="tablist" aria-label="Subjects">{SUBJECT_ORDER.map(s=><button key={s} role="tab" aria-selected={s===subject} className={s===subject?'active':''} onClick={()=>setSubject(s)}><b>{s}</b></button>)}</div>
  {!data?<p role="status">Loading topics…</p>:<div className="class-mastery"><div className="class-mastery-row head"><span>Topic</span><span>Pupils tried</span><span>Class accuracy</span><span>Needs help</span></div>
   {topics.map((t:any)=><div className="class-mastery-row" key={t.topic}><span><b>{t.title}</b><small>{t.strand}</small></span><span>{t.tried} / {t.pupils}</span><span className="class-accuracy">{t.accuracy===null?'—':<><div className="mastery-bar"><i style={{width:`${Math.round(t.accuracy*100)}%`}}/></div>{Math.round(t.accuracy*100)}%</>}</span><span>{t.needHelp.length?t.needHelp.join(', '):'—'}</span></div>)}</div>}
 </section>;
}
export function QuestionReports(){
 const [reports,setReports]=useState<any[]|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState('');
 const load=()=>get('/api/teacher').then(d=>{setReports(d.reports??[]);setError('')}).catch(e=>setError(e.message));useEffect(()=>{load()},[]);
 async function resolve(id:string){setBusy(id);try{const r=await fetch('/api/teacher',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'resolve_report',id})}),d:any=await r.json();if(!r.ok)throw Error(d.error);toast.success('Marked as dealt with.');await load();}catch(e){toast.error((e as Error).message)}finally{setBusy('')}}
 return <section className="panel teacher-insight" aria-labelledby="reports-title"><div className="section-title"><h2 id="reports-title"><Flag/> Question reports</h2><button className="quiet-button" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
  <p>Pupils can report a question that looks wrong. You see the answer and explanation here; pupils never do until they answer correctly.</p>
  {error&&<p role="alert">{error}</p>}
  {!reports?<p role="status">Loading reports…</p>:!reports.length?<p><CheckCircle2 size={18}/> No open reports.</p>:<div className="report-list">{reports.map(r=><article key={r.id} className="report-card"><div className="section-title"><b>{r.name} · {REASON[r.reason]??r.reason}</b><time dateTime={new Date(r.at).toISOString()}>{new Date(r.at).toLocaleString('en-GB',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</time></div>{r.note&&<p className="report-note">“{r.note}”</p>}
   {r.question?<details><summary>{r.question.subject}{r.question.topicTitle?` · ${r.question.topicTitle}`:''} · {r.question.id}</summary>{r.question.reading&&<ReadingPane reading={r.question.reading} page={r.question.page}/>}<QuestionBody q={r.question} Diagram={Diagram}/>{r.question.options&&<ul className="report-options">{r.question.options.map((o:string)=><li key={o} className={r.question.answers.includes(o)?'answer':''}>{o}{r.question.answers.includes(o)&&' ✓'}</li>)}</ul>}{!r.question.options&&<p><b>Accepted:</b> {r.question.answers.join(' · ')}</p>}<Explanation text={r.question.explanation}/></details>:<p>This question is no longer in the bank.</p>}
   <button className="secondary-button" disabled={busy===r.id} onClick={()=>resolve(r.id)}>Mark as dealt with</button></article>)}</div>}
 </section>;
}
