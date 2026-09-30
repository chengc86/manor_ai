'use client';
import {useEffect,useRef,useState} from 'react';
import {Timer,Flag,ArrowLeft,ArrowRight,CheckCircle2,XCircle,ClipboardList,Coins,BookOpen,Clock} from 'lucide-react';
import {toast} from 'sonner';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {QuestionBody,AnswerChoices,ReadingPane,Explanation,type AnswerValue} from './question-card';
import {AskFriend} from './help-friends';
import {mockSize,MOCK_COOLDOWN} from '@/lib/mock-config';
// Timed mock tests: answer in any order, flag questions to come back to, and see the marks together at the end.
const SUBJECTS=['Maths','English','Verbal reasoning','Non-verbal reasoning','Science'];
async function call(body:any){const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json','X-Quest-Questions':'3','X-Quest-Heroes':'4'},body:JSON.stringify(body)}),d:any=await r.json();if(!r.ok)throw Error(d.error??'Something went wrong. Please try again.');return d;}
const mmss=(ms:number)=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
const when=(t:number)=>new Date(t).toLocaleString('en-GB',{weekday:'short',hour:'2-digit',minute:'2-digit'});
export function MockTests({me,offset,hero,online,onFinished}:{me:any;offset:number;hero:{type:number;clothing?:any}|null;online?:number;onFinished:(world:any)=>void}){
 const [mock,setMock]=useState<any>(null),[answers,setAnswers]=useState<Record<string,AnswerValue>>({}),[flags,setFlags]=useState<string[]>([]),[index,setIndex]=useState(0),[result,setResult]=useState<any>(null),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false),[now,setNow]=useState(Date.now()+offset),[open,setOpen]=useState<string|null>(null);
 const saves=useRef<Record<string,ReturnType<typeof setTimeout>>>({}),pending=useRef<Set<Promise<unknown>>>(new Set()),chains=useRef<Record<string,Promise<unknown>>>({}),finishing=useRef(false);
 const load=(m:any)=>{setMock(m);setAnswers(m?.answers??{});setFlags(m?.flags??[]);setIndex(0);};
 // A test already running on the server (another tab, or after a refresh) is picked up where the pupil left off.
 const running=me?.mock?.startedAt;useEffect(()=>{if(running&&!mock)call({action:'mock_state'}).then(r=>load(r.mock)).catch(e=>toast.error(e.message));},[running,mock]);
 useEffect(()=>{if(!mock)return;const t=setInterval(()=>setNow(Date.now()+offset),250);return()=>clearInterval(t);},[mock,offset]);
 const remaining=mock?mock.endsAt-now:0;
 const expired=!!mock&&remaining<=0,finishLatest=useRef<()=>void>(()=>{});
 useEffect(()=>{if(expired&&!finishing.current){toast('Time is up! Marking your test…');finishLatest.current();}},[expired]);
 function track(p:Promise<unknown>){pending.current.add(p);p.finally(()=>pending.current.delete(p));return p;}
 // Saves for the same question go one after another, so a quick second click is never overwritten on the server by the first.
 function queue(key:string,run:()=>Promise<unknown>,quiet=false){const p=(chains.current[key]??Promise.resolve()).then(run).catch(e=>{if(!quiet)toast.error((e as Error).message);});chains.current[key]=p;return track(p);}
 function change(q:any,value:AnswerValue){setAnswers(a=>({...a,[q.id]:value}));clearTimeout(saves.current[q.id]);const send=()=>queue(q.id,()=>call({action:'mock_answer',id:q.id,answer:value}));if(q.options)send();else saves.current[q.id]=setTimeout(send,500);}
 function flag(id:string){const on=!flags.includes(id);setFlags(f=>on?[...f,id]:f.filter(x=>x!==id));queue('flag:'+id,()=>call({action:'mock_flag',id,on}));}
 async function start(subject:string){setBusy(true);try{const r=await call({action:'mock_start',subject});load(r.mock);setResult(null);}catch(e){toast.error((e as Error).message)}finally{setBusy(false)}}
 finishLatest.current=()=>{finish()};
 async function finish(){if(finishing.current||!mock)return;finishing.current=true;setConfirm(false);setBusy(true);
  try{for(const [id,t] of Object.entries(saves.current)){clearTimeout(t);const q=mock.questions.find((q:any)=>q.id===id);if(q&&answers[id]!==undefined)queue(id,()=>call({action:'mock_answer',id,answer:answers[id]}),true);}saves.current={};await Promise.allSettled([...pending.current]);
   const r=await call({action:'mock_finish',id:mock.id});setResult(r.result);setMock(null);onFinished(r.world);if(r.result.unanswered)toast('Test marked. No coins this time: every question needs an answer.');else toast.success(r.result.coins?`Test marked! +${r.result.coins} coins`:'Test marked!');if(r.thanked?.length)toast(`${r.thanked.join(', ')} earned coins for helping you. Great teamwork!`);}
  catch(e){toast.error((e as Error).message)}finally{finishing.current=false;setBusy(false)}}

 if(result)return <section className="mock-results panel" aria-labelledby="mock-results-title">
  <div className="section-title"><h2 id="mock-results-title"><ClipboardList/> {result.subject} mock test results</h2><button className="secondary-button" onClick={()=>setResult(null)}>Back to mock tests</button></div>
  <div className="mock-score"><div><b>{result.score}<small>/{result.total}</small></b><span>correct</span></div><div><b>{mmss(result.seconds*1000)}</b><span>time taken</span></div><div><b>+{result.coins}</b><span>coins earned</span></div></div>
  {result.unanswered>0&&<p className="mock-unpaid" role="status">No coins this time: {result.unanswered===1?'1 question was':`${result.unanswered} questions were`} left without an answer. A mock test pays only when every question is answered, so keep going to the end next time.</p>}
  <h3>By topic</h3><ul className="mock-topics">{result.topics.map((t:any)=><li key={t.title}><span>{t.title}</span><div className="mastery-bar"><i style={{width:`${t.total?t.correct/t.total*100:0}%`}}/></div><b>{t.correct}/{t.total}</b></li>)}</ul>
  <h3>Your answers</h3><p className="muted">Correct answers show how they work. Mistakes are saved in your notebook with the answer hidden, so you can try again after 24 hours or ask a friend for a hint.</p>
  <ol className="mock-review">{result.items.map((it:any,i:number)=><li key={it.id} className={it.correct?'right':it.answered?'wrong':'skipped'}><button type="button" onClick={()=>setOpen(open===it.id?null:it.id)} aria-expanded={open===it.id}>{it.correct?<CheckCircle2 aria-label="Correct"/>:<XCircle aria-label={it.answered?'Not correct':'Not answered'}/>}<span>{i+1}. {(it.question?.prompt??'').replace(/\*\*/g,'').slice(0,110)}</span><small>{it.correct?'Correct':it.answered?'In your notebook':'Not answered'}</small></button>
   {open===it.id&&it.question&&<div className="mock-review-body">{it.question.reading&&<ReadingPane reading={it.question.reading} page={it.question.page}/>}<QuestionBody q={it.question} hero={hero}/>{it.correct?<Explanation text={it.explanation}/>:it.answered?<><p>This question is in your mistake notebook. Try it again after 24 hours.</p><AskFriend question={it.id} online={online}/></>:<p>You didn’t answer this one. It will come back in Earn coins after 24 hours.</p>}</div>}</li>)}</ol>
 </section>;

 if(mock){const q=mock.questions[index],done=mock.questions.filter((x:any)=>answers[x.id]!==undefined&&(Array.isArray(answers[x.id])?(answers[x.id] as string[]).length>0:answers[x.id]!=='')).length,left=mock.questions.length-done,low=remaining<60000;
  return <section className="mock-test" aria-label={`${mock.subject} mock test`}>
   <div className="mock-bar"><b>{mock.subject} mock test</b><span className={`mock-timer ${low?'low':''}`} role="timer" aria-live={low?'assertive':'off'}><Timer size={18}/>{mmss(remaining)}</span><span>{done} of {mock.questions.length} answered{left>0&&<small className="mock-rule"> · answer them all to earn coins</small>}</span><button className="primary" disabled={busy} onClick={()=>left?setConfirm(true):finish()}>Finish test</button></div>
   <nav className="mock-nav" aria-label="Questions">{mock.questions.map((x:any,i:number)=>{const a=answers[x.id],has=a!==undefined&&(Array.isArray(a)?a.length>0:a!=='');return <button key={x.id} className={[i===index?'current':'',has?'answered':'',flags.includes(x.id)?'flagged':''].join(' ')} aria-current={i===index?'step':undefined} aria-label={`Question ${i+1}${has?', answered':''}${flags.includes(x.id)?', flagged':''}`} onClick={()=>setIndex(i)}>{i+1}{flags.includes(x.id)&&<Flag size={10} aria-hidden="true"/>}</button>})}</nav>
   <article className="question-card mock-question"><div className="question-meta"><span className="subject-tag">Question {index+1} of {mock.questions.length}{q.topicTitle?` · ${q.topicTitle}`:''}</span><button type="button" className={`flag-button ${flags.includes(q.id)?'on':''}`} aria-pressed={flags.includes(q.id)} onClick={()=>flag(q.id)}><Flag size={15}/>{flags.includes(q.id)?'Flagged':'Flag to come back'}</button></div>
    <div className={q.reading?'q-split':''}>{q.reading&&<ReadingPane reading={q.reading} page={q.page}/>}<div className="q-main"><QuestionBody q={q} hero={hero}/><AnswerChoices q={q} name={`mock-${q.id}`} value={answers[q.id]??((q.select??1)>1?[]:'')} onChange={v=>change(q,v)} disabled={busy}/></div></div>
    <div className="mock-steps"><button className="secondary-button" disabled={index===0} onClick={()=>setIndex(i=>i-1)}><ArrowLeft size={16}/> Previous</button>{index<mock.questions.length-1?<button className="secondary-button" onClick={()=>setIndex(i=>i+1)}>Next <ArrowRight size={16}/></button>:<button className="primary" disabled={busy} onClick={()=>left?setConfirm(true):finish()}>Finish test</button>}</div>
   </article>
   <Dialog open={confirm} onOpenChange={setConfirm}><DialogContent><DialogTitle>Finish your test?</DialogTitle><DialogDescription>{left===1?'1 question has':`${left} questions have`} no answer yet. If you finish now, this test earns <b>no coins</b>. You will still see your marks, and unanswered questions come back in Earn coins after 24 hours.</DialogDescription><div className="dialog-actions"><button className="primary" onClick={()=>setConfirm(false)}>Keep going</button><button className="secondary-button" onClick={finish}>Finish without coins</button></div></DialogContent></Dialog>
  </section>;}

 const year=me?.yearGroup??6,subjects=SUBJECTS.filter(s=>me?.questionProgress?.[s]?.available!==false&&mockSize(year,s));
 return <section className="mock-lobby">
  <div className="panel mock-intro"><ClipboardList size={34}/><div><h2>Mock tests</h2><p>Practise like the real entrance exam: a set number of questions against the clock. No hints. Move between questions, flag any to come back to, and your answers are marked together at the end. Correct answers earn their usual coins, but only when you answer every question: leave any blank, even if the time runs out, and the test earns no coins. Mistakes go to your notebook with the answer hidden. You can take each subject’s test once a day.</p></div></div>
  <div className="mock-subjects">{subjects.map(s=>{const size=mockSize(year,s)!,readyAt=(me?.mockLast?.[s]??0)+MOCK_COOLDOWN,waiting=readyAt>Date.now()+offset;return <article key={s} className="mock-card"><h3>{s}</h3><p><BookOpen size={15}/> {size.questions} questions <Clock size={15}/> {size.minutes} minutes</p>{waiting?<p className="muted">Next test {when(readyAt)}</p>:<button className="primary" disabled={busy} onClick={()=>start(s)}>Start the test <ArrowRight size={16}/></button>}</article>})}</div>
  {me?.mockResults?.length>0&&<div className="panel"><h3>Your recent tests</h3><ul className="mock-history">{me.mockResults.map((r:any)=><li key={r.id}><b>{r.subject}</b><span>{when(r.at)}</span><span>{r.score}/{r.total} correct</span><span>{mmss(r.seconds*1000)}</span><span><Coins size={14}/> +{r.coins}{r.unanswered>0&&<small className="mock-unfinished" title="Tests pay only when every question has an answer">not finished</small>}</span></li>)}</ul></div>}
 </section>;
}
