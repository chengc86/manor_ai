'use client';
import {Fragment,useEffect,useRef,useState} from 'react';
import {Lightbulb,Flag,Check,X,Sparkles,BookOpen} from 'lucide-react';
import {toast} from 'sonner';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import QuestionVisual from './question-visual';
import {layout} from '@/lib/visual-layout';
import HeroPortrait from './hero-portrait';
import ReadAloud,{useReading} from './read-aloud';
import {questionSpeech,explanationSpeech} from '@/lib/speech-text';
// The parts of a question every screen shares: Earn coins, mock tests, the help board and the mistake notebook.
/** A question written as a heading, with its read-aloud button (mistake notebook, helping a friend). */
export function PromptHeading({q,readId}:{q:any;readId:string}){return <div className="prompt-row"><h3><RichText text={q.prompt}/></h3><ReadAloud id={readId} sentences={questionSpeech(q)}/></div>;}
// Questions arrive without answers (publicQuestion); nothing here can reveal one.

/** Text with **bold** and line breaks. */
export function RichText({text}:{text:string}){return <>{text.split('\n').map((line,i)=><Fragment key={i}>{i>0&&<br/>}{line.split(/\*\*(.+?)\*\*/g).map((part,j)=>j%2?<strong key={j}>{part}</strong>:part)}</Fragment>)}</>;}
/** Worked explanations: '- ' lines are bullets and a short line ending in ':' is a heading. With readId, pupils can have it read aloud. */
export function Explanation({text,readId}:{text:string;readId?:string}){
 const blocks:{kind:'h'|'p'|'ul';lines:string[]}[]=[];
 for(const raw of text.split('\n')){const line=raw.trim();if(!line)continue;const bullet=line.startsWith('- ');if(bullet){const last=blocks.at(-1);if(last?.kind==='ul')last.lines.push(line.slice(2));else blocks.push({kind:'ul',lines:[line.slice(2)]});}else blocks.push({kind:line.endsWith(':')&&line.length<40?'h':'p',lines:[line]});}
 return <div className="explanation">{readId&&<ReadAloud id={readId} sentences={explanationSpeech(text)} label="Read it to me" className="explain-read"/>}{blocks.map((b,i)=>b.kind==='ul'?<ul key={i}>{b.lines.map((l,j)=><li key={j}><RichText text={l}/></li>)}</ul>:b.kind==='h'?<h4 key={i}>{b.lines[0].slice(0,-1)}</h4>:<p key={i}><RichText text={b.lines[0]}/></p>)}</div>;
}
/** A multi-page passage beside its questions. It opens on the page the question is about. */
export function ReadingPane({reading,page=0}:{reading:{id:string;title:string;byline?:string;pages:string[]};page?:number}){
 // The pupil's page choice belongs to this passage and question page; a new question starts at its own page again.
 const at=`${reading.id}#${page}`,[choice,setChoice]=useState({at,page}),shown=choice.at===at?choice.page:page,setShown=(i:number)=>setChoice({at,page:i});
 return <aside className="reading-pane" aria-label={`Passage: ${reading.title}`}>
  {reading.pages.length>1&&<div className="reading-tabs" role="tablist" aria-label="Passage pages">{reading.pages.map((_,i)=><button key={i} type="button" role="tab" aria-selected={i===shown} className={i===shown?'active':''} onClick={()=>setShown(i)}>Page {i+1}</button>)}</div>}
  <article className="reading-paper" role="tabpanel"><p className="reading-source"><b>{reading.title}</b>{reading.byline&&<span>{reading.byline}</span>}</p>{reading.pages[shown]?.split('\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</article>
 </aside>;
}
/** A question picture drawn at the scale of the option pictures beside it ("the same size"), on every screen width.
 *  It measures the first option picture and follows it as the layout changes; with no options shown it draws as usual. */
function MatchedVisual({visual}:{visual:any}){
 const ref=useRef<HTMLDivElement>(null),[unit,setUnit]=useState<number>();
 useEffect(()=>{let el=ref.current?.parentElement,option:SVGSVGElement|null=null;for(let i=0;el&&i<8&&!option;i++,el=el.parentElement)option=el.querySelector('.option-picture svg');
  if(!option)return;const o=option,watch=new ResizeObserver(()=>{const w=o.viewBox.baseVal?.width;if(w)setUnit(o.getBoundingClientRect().width/w);});watch.observe(o);return()=>watch.disconnect();},[visual]);
 return <div ref={ref} className="paper q-visual"><QuestionVisual visual={visual} unit={unit}/></div>;
}
/** The question itself: the pupil's hero asks it in a speech bubble (and can read it aloud), then the thing to work on and any picture. */
export function QuestionBody({q,hero,Diagram,onDiagramReady,showPrompt=true}:{q:any;hero?:{type:number;clothing?:any}|null;Diagram?:any;onDiagramReady?:(ready:boolean)=>void;showPrompt?:boolean}){
 const readId=`q:${q.id}`,talking=useReading(readId);
 return <div className="q-body">
  {q.passage&&<blockquote className="passage">{q.passage}</blockquote>}
  {showPrompt&&<div className={`q-prompt${talking?' talking':''}`}><span className="q-avatar" aria-hidden="true">{hero?<HeroPortrait type={hero.type} clothing={hero.clothing??{}}/>:<Sparkles/>}</span><div className="q-bubble"><RichText text={q.prompt}/><div className="bubble-tools"><ReadAloud id={readId} sentences={questionSpeech(q)}/></div></div></div>}
  {q.stimulus&&<div className="q-stimulus"><RichText text={q.stimulus}/></div>}
  {q.visual&&(q.visual.scale==='options'?<MatchedVisual visual={q.visual}/>:<div className="paper q-visual"><QuestionVisual visual={q.visual}/></div>)}
  {q.diagram&&Diagram&&<Diagram key={q.id} diagram={q.diagram} onReady={onDiagramReady}/>}
 </div>;
}
export type AnswerValue=string|string[];
/** Whether the pupil has chosen enough to check: one option, all of a multi-select, or some typed text. */
export const answered=(q:any,value:AnswerValue)=>Array.isArray(value)?value.length===(q?.select??1):!!value.trim();
/** Choices as chips (short), rows (long), picture cards, or several at once; typed answers for older questions.
 *  result marks only what the pupil chose: a correct answer is ticked, a wrong single choice is crossed. The right option is never shown. */
export function AnswerChoices({q,value,onChange,disabled,result,name,label}:{q:any;value:AnswerValue;onChange:(v:AnswerValue)=>void;disabled?:boolean;result?:{correct:boolean}|null;name:string;label?:string}){
 if(!q.options)return <><label htmlFor={name}>{label??'Your answer'}</label><input id={name} value={typeof value==='string'?value:''} onChange={e=>onChange(e.target.value)} maxLength={300} placeholder="Type your answer here…" autoComplete="off" disabled={disabled}/></>;
 const need=q.select??1,multi=need>1,chosen=Array.isArray(value)?value:value?[value]:[],pictures=q.optionVisuals as any[]|undefined,wide=!!pictures?.some(v=>{const f=layout(v);return f.w>f.h*1.35}),lettered=!pictures&&q.options.every((o:string)=>/^[A-Z]$/.test(o)),chips=!pictures&&!lettered&&q.options.every((o:string)=>o.length<=18);
 const toggle=(o:string)=>{if(!multi)return onChange(o);if(chosen.includes(o))onChange(chosen.filter(x=>x!==o));else onChange(chosen.length<need?[...chosen,o]:[...chosen.slice(1),o]);};
 return <fieldset className={`answer-options ${pictures?`picture-options${wide?' wide-pictures':''}`:chips?'chip-options':lettered?'letter-options':'row-options'}`} disabled={disabled}>
  <legend>{label??(multi?`Choose ${need} answers`:'Choose one answer')}{multi&&!result&&<span className="choose-count"> · {chosen.length} of {need} chosen</span>}</legend>
  {q.options.map((o:string,i:number)=>{const on=chosen.includes(o),mark=result&&on&&(result.correct?'right':multi?'':'wrong');return <label key={o} className={[on?'selected':'',mark||''].join(' ')}>
   <input type={multi?'checkbox':'radio'} name={name} value={o} checked={on} onChange={()=>toggle(o)}/>
   <span className="option-letter">{pictures||lettered?o:String.fromCharCode(65+i)}</span>
   {pictures?<span className="option-picture"><QuestionVisual visual={pictures[i]} label={`Option ${o}: ${pictures[i]?.alt??'picture'}`}/></span>:!lettered&&<span className="option-text">{o}</span>}
   {mark==='right'&&<Check className="option-mark" aria-label="Correct"/>}{mark==='wrong'&&<X className="option-mark" aria-label="Not this one"/>}
  </label>;})}
 </fieldset>;
}
/** The topic's one-page helpsheet: the method with a different example. Free to open; never shows this question's answer. */
export function Helpsheet({sheet}:{sheet:any}){return <div className="helpsheet">
 <p className="helpsheet-intro"><RichText text={sheet.intro}/></p>
 <ol className="helpsheet-steps">{sheet.steps.map((s:string,i:number)=><li key={i}><RichText text={s}/></li>)}</ol>
 {sheet.example&&<section className="helpsheet-example"><h4>{sheet.example.title??'Worked example'}</h4>{sheet.example.visual&&<div className="paper"><QuestionVisual visual={sheet.example.visual}/></div>}<Explanation text={sheet.example.lines.join('\n')}/></section>}
 {sheet.tips?.length>0&&<section className="helpsheet-tips"><h4>Watch out for</h4><ul>{sheet.tips.map((t:string,i:number)=><li key={i}><RichText text={t}/></li>)}</ul></section>}
</div>;}
const sheets=new Map<string,Promise<any>>();
function loadSheet(topic:string){if(!sheets.has(topic))sheets.set(topic,fetch(`/api/topic?id=${encodeURIComponent(topic)}`).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error??'The helpsheet could not load.');return d.topic;}).catch(e=>{sheets.delete(topic);throw e;}));return sheets.get(topic)!;}
export function HelpsheetButton({topic,title,label='Need a hint?'}:{topic?:string;title?:string;label?:string}){
 const [open,setOpen]=useState(false),[data,setData]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{if(!open||!topic||data?.id===topic)return;loadSheet(topic).then(d=>{setData(d);setError('')}).catch(e=>setError(e.message));},[open,topic,data]);
 if(!topic)return null;
 return <><button type="button" className="hint-button" onClick={()=>setOpen(true)}><Lightbulb aria-hidden="true"/>{label}</button>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="helpsheet-dialog"><DialogTitle><BookOpen aria-hidden="true"/> {data?.id===topic?data.title:title??'Helpsheet'}</DialogTitle><DialogDescription>{data?.id===topic?`${data.subject} · ${data.strand} · a reminder of the method, not the answer`:error?'':'Loading the helpsheet…'}</DialogDescription>{data?.id===topic&&<Helpsheet sheet={data.helpsheet}/>}{error&&<p role="alert">{error}</p>}</DialogContent></Dialog></>;
}
const REASONS:[string,string][]=[['answer','The answer seems wrong'],['confusing','The question is confusing'],['picture','The picture doesn’t match the question'],['typo','A spelling or typing mistake'],['other','Something else']];
/** "Something wrong? Tell us": the report goes to the teacher with the question. */
export function ReportButton({question}:{question:string}){
 const [open,setOpen]=useState(false),[reason,setReason]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false);
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);try{const r=await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json','X-Quest-Questions':'3','X-Quest-Heroes':'7'},body:JSON.stringify({action:'report',id:question,reason,note})}),d:any=await r.json();if(!r.ok)throw Error(d.error??'Could not send. Try again.');toast.success(d.already?'You have already reported this question. Thank you!':'Thank you! Your teacher will take a look.');setOpen(false);setReason('');setNote('');}catch(err){toast.error((err as Error).message)}finally{setBusy(false)}}
 return <><button type="button" className="report-link" onClick={()=>setOpen(true)}><Flag aria-hidden="true"/>Something wrong? Tell us</button>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>Report a problem with this question</DialogTitle><DialogDescription>Your teacher will see the question and what you choose. Don’t type the answer here.</DialogDescription>
   <form className="report-form" onSubmit={send}><fieldset disabled={busy}><legend>What’s wrong?</legend>{REASONS.map(([id,text])=><label key={id} className={reason===id?'selected':''}><input type="radio" name="report-reason" value={id} checked={reason===id} onChange={()=>setReason(id)}/>{text}</label>)}</fieldset>
    <label htmlFor="report-note">Anything else? (optional)</label><textarea id="report-note" value={note} onChange={e=>setNote(e.target.value)} maxLength={200} rows={2} placeholder="For example: the second option is spelled wrongly."/>
    <button className="primary" disabled={busy||!reason}>{busy?'Sending…':'Send to my teacher'}</button></form></DialogContent></Dialog></>;
}
const PRAISE=['Brilliant, {name}!','Spot on, {name}!','You nailed it!','Superb thinking, {name}!','That’s exactly right!','Terrific work, {name}!','Your class thanks you, {name}!','Sharp as a sword, {name}!'];
const LEARN=['Not this time, and that’s how learning works.','Good try! This one is saved for you to master.','Close call. Mistakes help your brain grow.','Not quite. You’ll get this one next time.'];
/** A different cheer each time; the same question always gets the same line so re-renders don’t change it. */
export const cheer=(id:string,name:string,correct:boolean)=>{const lines=correct?PRAISE:LEARN,h=[...id].reduce((s,c)=>(s*31+c.charCodeAt(0))>>>0,7);return lines[h%lines.length].replace('{name}',name);};
/** Ten dots for the round in this subject, filled as questions are answered. */
export function RoundProgress({subject,completed,size=10}:{subject:string;completed:number;size?:number}){const n=Math.min(completed,size);return <div className="round-progress" role="img" aria-label={`${subject}: ${n} of ${size} answered this round`}><span>{subject} round · {n} of {size} answered</span><div className="round-dots">{Array.from({length:size},(_,i)=><i key={i} className={i<n?'done':''}/>)}</div></div>;}
