import {bankTopics} from './bank';
import {questions,type Question} from './questions';
import type {Player} from './world';
// Topic mastery for the Atom-style Year 6 bank, from each pupil's own answers. A wrong answer counts every time it happens
// (the notebook keeps the count); a question answered correctly counts once, because correct questions retire.
export type MasteryLevel='new'|'started'|'practise'|'developing'|'secure'|'mastered';
export const MASTERY_LEVELS:{id:MasteryLevel;label:string;hint:string}[]=[
 {id:'new',label:'Not started',hint:'No questions answered yet.'},
 {id:'started',label:'Just started',hint:'Answer a few more to see how it is going.'},
 {id:'practise',label:'Keep practising',hint:'Fewer than half right so far. Read the helpsheet, then try again.'},
 {id:'developing',label:'Getting there',hint:'At least half right.'},
 {id:'secure',label:'Secure',hint:'Three in four right or better.'},
 {id:'mastered',label:'Mastered',hint:'Nearly everything right, across 8 or more questions.'}];
export type TopicMastery={topic:string;title:string;strand:string;subject:string;total:number;correct:number;wrong:number;accuracy:number|null;level:MasteryLevel};
const byTopic=new Map<string,Question[]>();for(const q of questions)if(q.topic&&!q.legacy){if(!byTopic.has(q.topic))byTopic.set(q.topic,[]);byTopic.get(q.topic)!.push(q);}
export function levelFor(correct:number,wrong:number):MasteryLevel{const n=correct+wrong,acc=n?correct/n:0;return n===0?'new':n<3?'started':acc<.5?'practise':acc<.75?'developing':correct>=8&&acc>=.85?'mastered':'secure';}
/** Mastery of every topic (in curriculum order), optionally for one subject. */
export function topicMastery(p:Player,subject?:string):TopicMastery[]{
 const year2=p.assignedYear===2;
 return bankTopics.filter(t=>!subject||t.subject===subject).map(t=>{const qs=(byTopic.get(t.id)??[]).filter(q=>year2?q.difficulty==='Year 2':q.difficulty!=='Year 2');let correct=0,wrong=0;
  for(const q of qs){const h=p.history[q.id];if(h?.correct)correct++;const m=p.mistakes?.[q.id];wrong+=m?m.attempts:h&&!h.correct&&h.attempted!==false?1:0;}
  const n=correct+wrong;return {topic:t.id,title:t.title,strand:t.strand,subject:t.subject,total:qs.length,correct,wrong,accuracy:n?correct/n:null,level:levelFor(correct,wrong)};});
}
/** The topics to practise next: the lowest accuracy among topics already tried (below secure), then topics not started yet. */
export function weakestTopics(p:Player,subject:string,count=3){
 const all=topicMastery(p,subject),tried=all.filter(t=>t.level==='practise'||t.level==='developing'||t.level==='started').sort((a,b)=>(a.accuracy??1)-(b.accuracy??1)||(a.correct+a.wrong)-(b.correct+b.wrong));
 return [...tried,...all.filter(t=>t.level==='new')].slice(0,count).map(t=>t.topic);
}
/** Class view for the teacher: for each topic, how many Year 6 pupils have tried it, the class accuracy and who needs help. */
export function classMastery(players:Record<string,Player>){
 const pupils=Object.values(players).filter(p=>p.assignedYear!==2),per=pupils.map(p=>({name:p.name,topics:topicMastery(p)}));
 return bankTopics.map((t,i)=>{const rows=per.map(p=>({name:p.name,m:p.topics[i]})).filter(r=>r.m.correct+r.m.wrong>0),correct=rows.reduce((s,r)=>s+r.m.correct,0),total=rows.reduce((s,r)=>s+r.m.correct+r.m.wrong,0);
  return {topic:t.id,title:t.title,strand:t.strand,subject:t.subject,tried:rows.length,pupils:pupils.length,accuracy:total?correct/total:null,needHelp:rows.filter(r=>r.m.level==='practise').map(r=>r.name).sort(),levels:Object.fromEntries(MASTERY_LEVELS.map(l=>[l.id,rows.filter(r=>r.m.level===l.id).length]))};});
}
