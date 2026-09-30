import type {Question,Subject} from './questions';
import type {RewardGroup} from './question-rewards';
import {REWARD_GROUPS} from './question-rewards';
import {visualText,type Visual} from './visual';
// Toolkit for the Atom-style bank (bank-*.ts). Every question is original and belongs to one topic. Templates draw numbers,
// words and pictures from a seeded random source, so the same code always builds the same questions with the same IDs.
// IDs are v2-<topic id>-<nn>. Pupil records are keyed by ID: once released, only append new questions to a topic;
// never reorder or change a template's output, or old records would point at different questions.

/** A one-page reminder shown when a pupil taps Hint. It teaches the method with a different example, never the answer. */
export type Helpsheet={intro:string;steps:string[];example?:{title?:string;visual?:Visual;lines:string[]};tips?:string[]};
export type Topic={id:string;subject:Subject;strand:string;title:string;reward?:RewardGroup;helpsheet:Helpsheet};
/** What a template returns. answer is one option, or several when the pupil must choose more than one. */
export type Draft={
 prompt:string;answer:string|string[];wrong?:string[];explanation:string;
 stimulus?:string;visual?:Visual;reading?:Question['reading'];page?:number;rewardGroup?:RewardGroup;
 /** Picture options: options become A, B, C … in the order shown; answer names the key of the right picture(s). wrong is not needed. */
 pictures?:{key:string;visual:Visual}[];
 /** Every text option in a fixed display order, e.g. ['<','=','>'] or ['A','B','C','D','E'] for lettered cards. It must include the answer; wrong is not needed. */
 options?:string[];
 /** 'sorted': text options in number order. 'given': pictures in the order listed, or text options in their natural fixed order
  *  (A–E, < = >, Card 1–4), wherever the answer is. Without either, options are shuffled. options gives any other fixed order. */
 order?:'given'|'sorted';
 /** The options or pictures were shuffled by the template itself, so their order means nothing: each pupil still sees their own
  *  order. Without it, options and order keep the order for everyone. */
 mixed?:boolean;
};
export const SUBJECT_CODE:Record<Subject,string>={Maths:'ma',English:'en','Verbal reasoning':'vr','Non-verbal reasoning':'nv',Science:'sc'};

// Seeded random numbers (mulberry32 on a string hash).
function hash(s:string){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^=h>>>16)>>>0;};}
export type Rng={next():number;int(min:number,max:number):number;pick<T>(xs:readonly T[]):T;shuffle<T>(xs:readonly T[]):T[];sample<T>(xs:readonly T[],n:number):T[];chance(p:number):boolean};
export function rng(seed:string):Rng{let a=hash(seed)();const next=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
 const int=(min:number,max:number)=>min+Math.floor(next()*(max-min+1));
 const shuffle=<T,>(xs:readonly T[])=>{const out=[...xs];for(let i=out.length-1;i>0;i--){const j=int(0,i);[out[i],out[j]]=[out[j],out[i]];}return out;};
 return {next,int,pick:xs=>xs[int(0,xs.length-1)],shuffle,sample:(xs,n)=>shuffle(xs).slice(0,n),chance:p=>next()<p};}

// Formatting, British style.
/** 12345 → "12,345"; −7 uses a proper minus sign. */
export const num=(n:number,dp?:number)=>{const s=(dp===undefined?Math.abs(n).toLocaleString('en-GB',{maximumFractionDigits:6}):Math.abs(n).toLocaleString('en-GB',{minimumFractionDigits:dp,maximumFractionDigits:dp}));return n<0?'−'+s:s;};
/** Pence to money: 45 → "45p", 1250 → "£12.50", 1200 → "£12" unless always2dp. */
export const money=(pence:number,always2dp=false)=>pence<100&&!always2dp?`${pence}p`:`£${(pence/100).toLocaleString('en-GB',{minimumFractionDigits:always2dp||pence%100?2:0,maximumFractionDigits:2})}`;
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function under1000(n:number):string{const h=Math.floor(n/100),r=n%100,t=r<20?ONES[r]:TENS[Math.floor(r/10)]+(r%10?'-'+ONES[r%10]:'');return h?`${ONES[h]} hundred${r?' and '+t:''}`:t;}
/** Whole numbers in words, British style: 1_009_060 → "one million, nine thousand and sixty". */
export function words(n:number):string{
 if(n<0)return 'minus '+words(-n);if(n===0)return 'zero';
 const parts:[number,string][]=[[1e9,'billion'],[1e6,'million'],[1e3,'thousand']],out:string[]=[];let rest=n;
 for(const [size,name] of parts){const k=Math.floor(rest/size);if(k){out.push(`${under1000(k)} ${name}`);rest%=size;}}
 if(rest)out.push(out.length&&rest<100?'and '+under1000(rest):under1000(rest));
 return out.join(', ').replace(', and ',' and ');
}
export const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export const plural=(n:number,one:string,many=one+'s')=>`${num(n)} ${n===1?one:many}`;
/** ["a","b","c"] → "a, b and c". */
export const list=(xs:string[],last='and')=>xs.length<2?xs.join(''):`${xs.slice(0,-1).join(', ')} ${last} ${xs.at(-1)}`;
export const ordinal=(n:number)=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
export const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
export const frac=(n:number,d:number)=>`${n}/${d}`;

/** Explanation lines. '- ' makes a bullet, a short line ending in ':' is a heading, **text** is bold. */
export const explain=(...lines:(string|false|null|undefined)[])=>lines.filter(Boolean).join('\n');
export const bullets=(...lines:string[])=>lines.map(l=>'- '+l).join('\n');

/** Children's names for contexts: varied, fictional classmates of the pupils. */
export const NAMES=['Amara','Ben','Chloe','Dev','Ellie','Farah','George','Hana','Isaac','Jaya','Kofi','Leo','Maya','Noah','Olu','Priya','Quinn','Ravi','Sofia','Tom','Uma','Vikram','Willow','Yusuf','Zara','Aisha','Callum','Daisy','Ethan','Freya','Hugo','Iris','Jonah','Keira','Luca','Mei','Nadia','Oscar','Poppy','Rory','Sami','Tilly','Zain','Ruby','Arjun','Bea','Cara','Finn'];

const clean=(s:string)=>s.normalize('NFKC').replace(/[‘’]/g,"'").replace(/−/g,'-').toLowerCase().replace(/\s+/g,' ').trim();
/** Problems that would make a question unfair or broken; the bank tests require none. */
export function checkQuestion(q:Question):string[]{
 const p:string[]=[],opts=q.options??[],answers=q.answers??[];
 if(!q.prompt?.trim())p.push('empty prompt');if(!q.explanation?.trim())p.push('empty explanation');
 if(opts.length<3||opts.length>6)p.push(`${opts.length} options`);
 // Options may differ only in capitals or punctuation (proofreading), because choices are matched exactly.
 if(new Set(opts.map(o=>o.normalize('NFKC').replace(/\s+/g,' ').trim())).size!==opts.length)p.push('duplicate options');
 // "1,000" and "1000", or "£4.50" and "£4.5", would both be right or both wrong.
 const values=opts.flatMap(o=>{const m=o.trim().match(/^(£?)([−-]?[\d,]*\.?\d+)(p|%)?$/);return m?[`${m[1]}|${m[3]??''}|${parseFloat(m[2].replace(/,/g,'').replace('−','-'))}`]:[];});if(new Set(values).size!==values.length)p.push('two options have the same value');
 if(!answers.length||!answers.every(a=>opts.includes(a)))p.push('answer not among options');
 if(new Set(answers).size!==answers.length)p.push('repeated answer');
 if((q.select??1)!==answers.length)p.push('select does not match the number of answers');
 if(answers.length>=opts.length)p.push('every option is correct');
 if(q.optionVisuals&&q.optionVisuals.length!==opts.length)p.push('picture count does not match options');
 if(q.reading&&(q.page===undefined||q.page<0||q.page>=q.reading.pages.length))p.push('reading page out of range');
 const text=[q.prompt,q.explanation,q.stimulus??'',...opts,...visualText(q.visual),...(q.optionVisuals??[]).flatMap(visualText),...(q.reading?.pages??[])].join(' ');
 if(/\bundefined\b|\bNaN\b|\bnull\b|\[object|Infinity/.test(text))p.push('broken value in text');
 return p;
}

export type BuiltTopic={topic:Topic;questions:Question[];problems:string[]};
/** Runs a template until it has made count different questions for the topic. A template may return null to try again. */
export function build(topic:Topic,count:number,make:(r:Rng,i:number)=>Draft|null):BuiltTopic{
 const r=rng(topic.id),questions:Question[]=[],problems:string[]=[],seen=new Set<string>();let tries=0;
 while(questions.length<count&&tries<count*40){tries++;let d:Draft|null;try{d=make(r,questions.length);}catch(e){problems.push(`${topic.id}: template error ${(e as Error).message}`);break;}if(!d)continue;
  const answers=Array.isArray(d.answer)?d.answer:[d.answer];let options:string[],correct:string[],optionVisuals:Visual[]|undefined;
  if(d.pictures){
   // Picture options are shuffled, then lettered A, B, C … in the order shown.
   const order=d.order==='given'?d.pictures:r.shuffle(d.pictures);options=order.map((_,i)=>String.fromCharCode(65+i));optionVisuals=order.map(p=>p.visual);correct=order.flatMap((p,i)=>answers.includes(p.key)?[options[i]]:[]);
  }else{const all=d.options??[...answers,...(d.wrong??[])],value=(s:string)=>parseFloat(clean(s).replace(/[^\d.-]/g,'')),natural=(a:string,b:string)=>a<b?-1:a>b?1:0;
   // A fixed order never depends on which option is right, so the answer's position gives nothing away.
   options=d.options?[...d.options]:d.order==='given'?[...all].sort(natural):d.order==='sorted'?[...all].sort((a,b)=>value(a)-value(b)||natural(a,b)):r.shuffle(all);correct=answers;}
  const key=clean([d.prompt,d.stimulus??'',JSON.stringify(d.visual??null),d.page??'',[...options].sort().join('|'),JSON.stringify(d.pictures?.map(p=>p.visual).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))??null)].join('#'));if(seen.has(key))continue;seen.add(key);
  const rewardGroup=d.rewardGroup??topic.reward??'standard';
  const q:Question={id:`v2-${topic.id}-${String(questions.length+1).padStart(2,'0')}`,subject:topic.subject,topic:topic.id,difficulty:'Year 6',prompt:d.prompt,answers:correct,options,explanation:d.explanation,rewardGroup,reward:REWARD_GROUPS[rewardGroup].coins,...(correct.length>1?{select:correct.length}:{}),...((d.options||d.order)&&!d.mixed?{fixedOrder:true}:{}),...(d.stimulus?{stimulus:d.stimulus}:{}),...(d.visual?{visual:d.visual}:{}),...(optionVisuals?{optionVisuals}:{}),...(d.reading?{reading:d.reading,page:d.page??0}:{})};
  const bad=checkQuestion(q);if(bad.length){problems.push(`${q.id}: ${bad.join(', ')}`);continue;}
  questions.push(q);}
 if(questions.length<count)problems.push(`${topic.id}: made ${questions.length} of ${count} questions`);
 return {topic,questions,problems};
}
/** Questions written out in full (reading passages, vocabulary). Each item is a Draft; it is still validated and shuffled. */
export function fixed(topic:Topic,drafts:Draft[]):BuiltTopic{let i=0;return build(topic,drafts.length,()=>drafts[i++]??null);}
/** Combines a subject's topics into one module result. */
export function combine(...parts:BuiltTopic[]){return {topics:parts.map(p=>p.topic),questions:parts.flatMap(p=>p.questions),problems:parts.flatMap(p=>p.problems)};}
